create extension if not exists pgcrypto;

create table if not exists public.api_rate_limits (
  user_id uuid not null,
  scope text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, scope, window_started_at)
);

create table if not exists public.webhook_events (
  provider text not null,
  provider_event_id text not null,
  request_id text,
  event_type text not null,
  action text,
  resource_id text not null,
  status text not null check (status in ('processing', 'processed', 'ignored', 'failed')),
  payload jsonb not null,
  last_error text,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (provider, provider_event_id)
);

create unique index if not exists leads_user_id_place_id_key
  on public.leads (user_id, place_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_status_check'
  ) then
    alter table public.leads
      add constraint leads_status_check
      check (status in ('new', 'approached', 'negotiating', 'closed'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_plan_check'
  ) then
    alter table public.profiles
      add constraint profiles_plan_check
      check (plan in ('free', 'paid'));
  end if;
end
$$;

create or replace function public.check_rate_limit(
  p_user_id uuid,
  p_scope text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := p_user_id;
  v_now timestamptz := timezone('utc', now());
  v_window_started_at timestamptz;
  v_request_count integer;
begin
  if v_user_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  if p_limit <= 0 or p_window_seconds <= 0 then
    raise exception 'INVALID_RATE_LIMIT_CONFIGURATION';
  end if;

  v_window_started_at := to_timestamp(
    floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds
  );

  insert into public.api_rate_limits (
    user_id,
    scope,
    window_started_at,
    request_count,
    updated_at
  )
  values (
    v_user_id,
    p_scope,
    v_window_started_at,
    1,
    v_now
  )
  on conflict (user_id, scope, window_started_at)
  do update
    set request_count = public.api_rate_limits.request_count + 1,
        updated_at = v_now
  returning public.api_rate_limits.request_count into v_request_count;

  allowed := v_request_count <= p_limit;
  remaining := greatest(p_limit - v_request_count, 0);
  reset_at := v_window_started_at + make_interval(secs => p_window_seconds);

  return next;
end;
$$;

grant execute on function public.check_rate_limit(uuid, text, integer, integer) to authenticated;

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
    ) >= 10 then
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
