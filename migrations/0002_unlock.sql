create table if not exists unlock_transactions (
  provider text not null,
  transaction_id text not null,
  visitor_id text not null,
  revenue text not null,
  kind text not null check (kind in ('completed', 'reversed')),
  created_at timestamptz not null default now(),
  primary key (provider, transaction_id)
);

create table if not exists unlock_grants (
  visitor_id text primary key,
  provider text not null,
  transaction_id text not null,
  granted_at timestamptz not null default now()
);

create index if not exists unlock_transactions_visitor_idx
  on unlock_transactions (visitor_id);
