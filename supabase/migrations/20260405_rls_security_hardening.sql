-- Bloqueia escrita direta em profiles para colunas sensíveis
-- Usuário autenticado não pode alterar plan, trial_ends_at, mp_subscription_id
-- Essas colunas só são modificadas por RPCs security definer ou service_role

drop policy if exists "profiles: usuarios atualizam apenas o proprio" on public.profiles;
drop policy if exists "profiles: service_role insere perfil no primeiro acesso" on public.profiles;

create policy "profiles: usuarios atualizam apenas campos nao sensiveis"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
  );

create policy "profiles: service_role insere perfil no primeiro acesso"
  on public.profiles for insert
  with check (auth.role() = 'service_role');


drop policy if exists "leads: usuarios inserem apenas os proprios" on public.leads;

-- RPC save_lead_secure roda como security definer com service_role implícito,
-- portanto precisa de uma policy que permita insert via service_role
create policy "leads: service_role insere via rpc"
  on public.leads for insert
  with check (auth.role() = 'service_role');

-- Atualiza RPC save_lead_secure para considerar trial_ends_at ao checar limite
create or replace function public.save_lead_secure(
  p_place_id text,
  p_name text,
  p_phone text,
  p_website text,
  p_rating double precision,
  p_total_ratings integer,
  p_address text default null
)
returns public.leads
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan text := 'free';
  v_trial_ends_at timestamptz;
  v_effective_plan text;
  v_lead public.leads;
  v_score integer := 0;
begin
  if v_user_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  if p_website is not null then
    v_score := v_score + 1;
  end if;

  if p_phone is not null then
    v_score := v_score + 1;
  end if;

  if coalesce(p_total_ratings, 0) >= 10 then
    v_score := v_score + 1;
  end if;

  select coalesce(plan, 'free'), trial_ends_at
    into v_plan, v_trial_ends_at
  from public.profiles
  where id = v_user_id;

  v_effective_plan := case
    when v_plan = 'paid' then 'paid'
    when v_trial_ends_at is not null and v_trial_ends_at > now() then 'paid'
    else 'free'
  end;

  if v_effective_plan <> 'paid' then
    perform pg_advisory_xact_lock(hashtext(v_user_id::text));

    if not exists (
      select 1
      from public.leads
      where user_id = v_user_id
        and place_id = p_place_id
    ) and (
      select count(*)
      from public.leads
      where user_id = v_user_id
    ) >= 30 then
      raise exception 'PLAN_LIMIT_REACHED';
    end if;
  end if;

  insert into public.leads (
    user_id,
    place_id,
    name,
    phone,
    website,
    rating,
    total_ratings,
    score,
    address
  )
  values (
    v_user_id,
    p_place_id,
    p_name,
    p_phone,
    p_website,
    p_rating,
    p_total_ratings,
    v_score,
    p_address
  )
  on conflict (user_id, place_id)
  do update
    set name = excluded.name,
        phone = excluded.phone,
        website = excluded.website,
        rating = excluded.rating,
        total_ratings = excluded.total_ratings,
        score = excluded.score,
        address = excluded.address
  returning * into v_lead;

  return v_lead;
end;
$$;

grant execute on function public.save_lead_secure(text, text, text, text, double precision, integer, text) to authenticated;
