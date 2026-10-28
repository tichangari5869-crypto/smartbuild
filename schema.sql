-- BuildSmart schema (hardened). Run in the Supabase SQL editor.
-- Then enable Realtime on prices & stock (done below) and set Auth providers (email, phone OTP, Google).

create table profiles(id uuid primary key references auth.users on delete cascade,full_name text,phone text,role text check(role in('buyer','supplier','admin')) default 'buyer',town text default 'Juja',created_at timestamptz default now());
create table hardware_stores(id uuid primary key default gen_random_uuid(),owner_id uuid references profiles(id),name text not null,town text,lat float8,lng float8,phone text,whatsapp text,delivery_fee int default 0 check(delivery_fee>=0),delivers boolean default true,status text default 'pending' check(status in('pending','verified','rejected')),created_at timestamptz default now());
create table products(id serial primary key,name text not null,brand text,spec text,unit text,category text);
create table prices(id uuid primary key default gen_random_uuid(),store_id uuid references hardware_stores on delete cascade,product_id int references products,price int not null check(price>0),updated_at timestamptz default now(),unique(store_id,product_id));
create table stock(store_id uuid references hardware_stores on delete cascade,product_id int references products,quantity int default 0 check(quantity>=0),status text generated always as (case when quantity=0 then 'out' when quantity<30 then 'low' else 'available' end) stored,updated_at timestamptz default now(),primary key(store_id,product_id));
create table enquiries(id uuid primary key default gen_random_uuid(),buyer_id uuid references profiles,store_id uuid references hardware_stores,message text,status text default 'new' check(status in('new','seen','closed')),created_at timestamptz default now());
create table subscriptions(id uuid primary key default gen_random_uuid(),user_id uuid references profiles,plan text check(plan in('one','week','month','year')),starts_at timestamptz default now(),ends_at timestamptz,active boolean default true);
create table payments(id uuid primary key default gen_random_uuid(),user_id uuid references profiles,subscription_id uuid references subscriptions,amount int,method text,mpesa_receipt text,checkout_request_id text unique,status text default 'pending' check(status in('pending','paid','failed','cancelled')),created_at timestamptz default now());
create table calculations(id uuid primary key default gen_random_uuid(),user_id uuid references profiles,items jsonb,town text,best_store uuid references hardware_stores,total int,created_at timestamptz default now());

-- Indexes for the common lookups
create index on hardware_stores(town,status);
create index on hardware_stores(owner_id);
create index on prices(product_id);
create index on stock(product_id);
create index on calculations(user_id,created_at desc);
create index on subscriptions(user_id,active,ends_at);
create index on enquiries(store_id);

-- Helpers. auth.uid() is null for the service role / SQL editor, which is allowed through the guards below.
create function is_admin() returns boolean language sql security definer stable set search_path=public as
$$ select exists(select 1 from profiles where id=auth.uid() and role='admin') $$;

create function owns_store(sid uuid) returns boolean language sql security definer stable set search_path=public as
$$ select exists(select 1 from hardware_stores where id=sid and owner_id=auth.uid()) $$;

-- Create a buyer profile automatically on sign-up (role is never taken from client input)
create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as
$$ begin insert into profiles(id,full_name,phone) values(new.id,new.raw_user_meta_data->>'full_name',new.phone) on conflict do nothing; return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- Users may not promote themselves, and store owners may not verify themselves
create function guard_role() returns trigger language plpgsql as
$$ begin if new.role is distinct from old.role and auth.uid() is not null and not is_admin() then raise exception 'role can only be changed by an admin'; end if; return new; end $$;
create trigger guard_role before update on profiles for each row execute function guard_role();

create function guard_store_status() returns trigger language plpgsql as
$$ begin if new.status is distinct from old.status and auth.uid() is not null and not is_admin() then raise exception 'status can only be changed by an admin'; end if; return new; end $$;
create trigger guard_store_status before update on hardware_stores for each row execute function guard_store_status();

create function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create trigger prices_touch before update on prices for each row execute function touch_updated_at();
create trigger stock_touch before update on stock for each row execute function touch_updated_at();

-- Row level security on EVERY table
alter table profiles enable row level security;alter table hardware_stores enable row level security;alter table products enable row level security;
alter table prices enable row level security;alter table stock enable row level security;alter table enquiries enable row level security;
alter table subscriptions enable row level security;alter table payments enable row level security;alter table calculations enable row level security;

create policy profile_read on profiles for select using(auth.uid()=id or is_admin());
create policy profile_update on profiles for update using(auth.uid()=id) with check(auth.uid()=id);

create policy store_read on hardware_stores for select using(status='verified' or owner_id=auth.uid() or is_admin());
create policy store_insert on hardware_stores for insert with check(owner_id=auth.uid() and status='pending');
create policy store_update on hardware_stores for update using(owner_id=auth.uid() or is_admin());

create policy product_read on products for select using(true);
create policy product_admin on products for all using(is_admin()) with check(is_admin());

create policy price_read on prices for select using(exists(select 1 from hardware_stores s where s.id=store_id and s.status='verified') or owns_store(store_id) or is_admin());
create policy price_write on prices for all using(owns_store(store_id)) with check(owns_store(store_id));
create policy stock_read on stock for select using(exists(select 1 from hardware_stores s where s.id=store_id and s.status='verified') or owns_store(store_id) or is_admin());
create policy stock_write on stock for all using(owns_store(store_id)) with check(owns_store(store_id));

create policy enquiry_buyer on enquiries for select using(buyer_id=auth.uid());
create policy enquiry_create on enquiries for insert with check(buyer_id=auth.uid() and status='new' and exists(select 1 from hardware_stores s where s.id=store_id and s.status='verified'));
create policy enquiry_store on enquiries for select using(owns_store(store_id));
create policy enquiry_store_update on enquiries for update using(owns_store(store_id));

create policy own_calcs on calculations for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
-- Subscriptions and payments are read-only for users; only the server (service role, M-Pesa callback) writes them.
create policy own_subs on subscriptions for select using(auth.uid()=user_id);
create policy own_payments on payments for select using(auth.uid()=user_id);

-- Live price & stock updates
alter table prices replica identity full;
alter table stock replica identity full;
alter publication supabase_realtime add table prices, stock;

-- Input limits (stop oversized or junk data being stored)
alter table profiles add constraint profile_len check(char_length(full_name)<=100 and char_length(phone)<=20);
alter table enquiries add constraint enquiry_msg_len check(char_length(message)<=1000);
alter table calculations add constraint calc_size check(octet_length(items::text)<=20000);
alter table payments add constraint receipt_unique unique(mpesa_receipt);

-- A store owner may only change an enquiry's status, never who sent it or what it says
create function guard_enquiry() returns trigger language plpgsql as
$$ begin if auth.uid() is not null and (new.buyer_id is distinct from old.buyer_id or new.store_id is distinct from old.store_id or new.message is distinct from old.message or new.created_at is distinct from old.created_at) then raise exception 'only status can be changed'; end if; return new; end $$;
create trigger guard_enquiry before update on enquiries for each row execute function guard_enquiry();
