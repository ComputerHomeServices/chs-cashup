-- Create cashups table
create table if not exists public.cashups (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  store_name text not null,
  date date default current_date not null,
  shift text not null,
  
  -- Cash denominations
  notes_200 integer default 0,
  notes_100 integer default 0,
  notes_50 integer default 0,
  notes_20 integer default 0,
  notes_10 integer default 0,
  coins_5 integer default 0,
  coins_2 integer default 0,
  coins_1 integer default 0,
  coins_050 integer default 0,
  coins_020 integer default 0,
  coins_010 integer default 0,
  
  -- Totals
  cash_total numeric(10, 2) not null,
  card_total numeric(10, 2) not null,
  eft_total numeric(10, 2) default 0,
  total_expected numeric(10, 2) not null,
  total_actual numeric(10, 2) not null,
  variance numeric(10, 2) not null,
  
  -- Metadata
  notes text,
  status text default 'pending' check (status in ('pending', 'verified', 'flagged'))
);

-- Enable RLS
alter table public.cashups enable row level security;

-- Policies
create policy "Users can view their own cashups"
  on public.cashups for select
  using (auth.uid() = user_id);

create policy "Users can insert their own cashups"
  on public.cashups for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own cashups"
  on public.cashups for update
  using (auth.uid() = user_id);

-- Admin policy (if we add an admin role or specific user)
create policy "Admins can view all cashups"
  on public.cashups for select
  using (
    exists (
      select 1 from auth.users
      where id = auth.uid()
      and raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Function to handle timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
