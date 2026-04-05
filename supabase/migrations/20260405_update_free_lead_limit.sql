create or replace function public.save_lead_secure(
  p_place_id text,
  p_name text,
  p_phone text,
  p_website text,
  p_rating double precision,
  p_total_ratings integer
)
returns public.leads
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan text := 'free';
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

  select coalesce(plan, 'free')
    into v_plan
  from public.profiles
  where id = v_user_id;

  if coalesce(v_plan, 'free') <> 'paid' then
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
    score
  )
  values (
    v_user_id,
    p_place_id,
    p_name,
    p_phone,
    p_website,
    p_rating,
    p_total_ratings,
    v_score
  )
  on conflict (user_id, place_id)
  do update
    set name = excluded.name,
        phone = excluded.phone,
        website = excluded.website,
        rating = excluded.rating,
        total_ratings = excluded.total_ratings,
        score = excluded.score
  returning * into v_lead;

  return v_lead;
end;
$$;

grant execute on function public.save_lead_secure(text, text, text, text, double precision, integer) to authenticated;
