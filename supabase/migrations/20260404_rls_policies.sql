alter table public.leads enable row level security;
alter table public.profiles enable row level security;

create policy "leads: usuarios leem apenas os proprios"
  on public.leads for select
  using (user_id = auth.uid());

create policy "leads: usuarios inserem apenas os proprios"
  on public.leads for insert
  with check (user_id = auth.uid());

create policy "leads: usuarios atualizam apenas os proprios"
  on public.leads for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "leads: usuarios deletam apenas os proprios"
  on public.leads for delete
  using (user_id = auth.uid());

create policy "profiles: usuarios leem apenas o proprio"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles: usuarios atualizam apenas o proprio"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles: service_role insere perfil no primeiro acesso"
  on public.profiles for insert
  with check (true);
