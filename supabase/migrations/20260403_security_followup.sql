alter table public.profiles
  add column if not exists subscription_lock_id uuid,
  add column if not exists subscription_lock_expires_at timestamptz;

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
  if auth.role() <> 'service_role' then
    raise exception 'FORBIDDEN';
  end if;

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

revoke all on function public.check_rate_limit(uuid, text, integer, integer) from public;
revoke all on function public.check_rate_limit(uuid, text, integer, integer) from anon;
revoke all on function public.check_rate_limit(uuid, text, integer, integer) from authenticated;
grant execute on function public.check_rate_limit(uuid, text, integer, integer) to service_role;

create or replace function public.try_acquire_subscription_lock(
  p_user_id uuid,
  p_lock_id uuid,
  p_lock_ttl_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := timezone('utc', now());
begin
  if auth.role() <> 'service_role' then
    raise exception 'FORBIDDEN';
  end if;

  if p_user_id is null then
    raise exception 'INVALID_USER_ID';
  end if;

  if p_lock_id is null then
    raise exception 'INVALID_LOCK_ID';
  end if;

  if p_lock_ttl_seconds <= 0 then
    raise exception 'INVALID_LOCK_TTL';
  end if;

  update public.profiles
    set subscription_lock_id = p_lock_id,
        subscription_lock_expires_at = v_now + make_interval(secs => p_lock_ttl_seconds)
  where id = p_user_id
    and (
      subscription_lock_id is null
      or subscription_lock_expires_at is null
      or subscription_lock_expires_at <= v_now
      or subscription_lock_id = p_lock_id
    );

  return found;
end;
$$;

revoke all on function public.try_acquire_subscription_lock(uuid, uuid, integer) from public;
revoke all on function public.try_acquire_subscription_lock(uuid, uuid, integer) from anon;
revoke all on function public.try_acquire_subscription_lock(uuid, uuid, integer) from authenticated;
grant execute on function public.try_acquire_subscription_lock(uuid, uuid, integer) to service_role;

create or replace function public.release_subscription_lock(
  p_user_id uuid,
  p_lock_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'FORBIDDEN';
  end if;

  update public.profiles
    set subscription_lock_id = null,
        subscription_lock_expires_at = null
  where id = p_user_id
    and subscription_lock_id = p_lock_id;
end;
$$;

revoke all on function public.release_subscription_lock(uuid, uuid) from public;
revoke all on function public.release_subscription_lock(uuid, uuid) from anon;
revoke all on function public.release_subscription_lock(uuid, uuid) from authenticated;
grant execute on function public.release_subscription_lock(uuid, uuid) to service_role;
