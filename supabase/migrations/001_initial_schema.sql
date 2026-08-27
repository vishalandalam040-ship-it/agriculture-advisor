create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.farms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  farm_name text not null,
  location text not null,
  area numeric(12,2) not null check (area > 0),
  area_unit text not null default 'acre'
    check (area_unit in ('acre', 'hectare', 'sqm')),
  soil_type text,
  soil_ph numeric(4,2) check (soil_ph is null or (soil_ph >= 0 and soil_ph <= 14)),
  soil_moisture numeric(5,2) check (
    soil_moisture is null or
    (soil_moisture >= 0 and soil_moisture <= 100)
  ),
  irrigation_available boolean not null default false,
  water_source text,
  current_crop text,
  crop_variety text,
  planting_date date,
  growth_stage text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.advisories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  farm_id uuid not null references public.farms(id) on delete cascade,

  crop text not null,
  crop_variety text,
  season text not null,
  growth_stage text not null,
  farming_objective text not null,

  soil_type text,
  soil_ph numeric(4,2) check (
    soil_ph is null or (soil_ph >= 0 and soil_ph <= 14)
  ),

  irrigation_available boolean,
  water_source text,
  weather_summary text,
  observed_symptoms text,
  pest_observations text,
  disease_observations text,
  additional_notes text,

  advisory_result jsonb not null,

  ai_model text,
  advisory_version text not null default '1.0',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index farms_user_id_idx
on public.farms(user_id);

create index advisories_user_id_idx
on public.advisories(user_id);

create index advisories_farm_id_idx
on public.advisories(farm_id);

create index advisories_created_at_idx
on public.advisories(created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.farms enable row level security;
alter table public.advisories enable row level security;

create policy "Users can view their own profile."
on public.profiles for select
using ( auth.uid() = id );

create policy "Users can update their own profile."
on public.profiles for update
using ( auth.uid() = id );

create policy "Users can view their own farms."
on public.farms for select
using ( auth.uid() = user_id );

create policy "Users can insert their own farms."
on public.farms for insert
with check ( auth.uid() = user_id );

create policy "Users can update their own farms."
on public.farms for update
using ( auth.uid() = user_id );

create policy "Users can delete their own farms."
on public.farms for delete
using ( auth.uid() = user_id );

create policy "Users can view their own advisories."
on public.advisories for select
using ( auth.uid() = user_id );

create policy "Users can insert their own advisories."
on public.advisories for insert
with check ( auth.uid() = user_id );

create policy "Users can delete their own advisories."
on public.advisories for delete
using ( auth.uid() = user_id );
