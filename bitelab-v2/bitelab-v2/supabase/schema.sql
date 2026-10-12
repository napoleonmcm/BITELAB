-- =====================================================================
-- BITE LAB — database setup
-- Paste this whole file into Supabase: SQL Editor > New query > Run.
-- Safe to run again: it only creates what is missing and re-seeds nothing
-- that already exists.
-- =====================================================================

-- ---------- Tables ----------
create table if not exists public.settings (
  key   text primary key,
  value jsonb not null
);

create table if not exists public.menu_items (
  id           text primary key,                       -- short name, e.g. "tiramisu"
  kind         text not null default 'item' check (kind in ('item','combo')),
  section      text not null default 'main' check (section in ('main','new','noodles')),
  name         text not null,
  price        integer not null check (price >= 0),
  description  text not null default '',
  contents     text[] not null default '{}',             -- what a combo includes
  options      text[] not null default '{}',             -- flavours etc.
  option_label text not null default '',
  badge        text not null default '',                 -- e.g. "New"
  available    boolean not null default true,            -- the on/off switch
  featured     boolean not null default false,
  image        text not null default '',                 -- file in /images or a full https link
  icons        text[] not null default '{}',
  sort         integer not null default 100,
  updated_at   timestamptz not null default now()
);

-- Build-your-own settings (noodles): {"removable":[...], "extras":[{"name":..,"price":..}]}
alter table public.menu_items add column if not exists builder jsonb not null default '{}';

create table if not exists public.orders (
  id             bigint generated always as identity primary key,
  ref            text not null unique,
  created_at     timestamptz not null default now(),
  customer_name  text not null default '',
  phone          text not null default '',
  address        text not null default '',
  room           text not null default '',
  note           text not null default '',
  items          jsonb not null default '[]',            -- [{id,name,option,qty,price,line_total}]
  subtotal       integer not null default 0,
  delivery_fee   integer not null default 0,
  total          integer not null default 0,
  payment_method text not null default 'bank_transfer',
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','refunded')),
  status         text not null default 'New'
                 check (status in ('New','Confirmed','Preparing','Out for delivery','Delivered','Cancelled')),
  source         text not null default 'website' check (source in ('website','walk-in','phone','whatsapp')),
  updated_at     timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_phone_idx on public.orders (phone, created_at desc);

-- Who may open the owner's dashboard (by login email)
create table if not exists public.admins (
  email text primary key
);

-- ---------- Helpers ----------
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

drop trigger if exists menu_items_touch on public.menu_items;
create trigger menu_items_touch before update on public.menu_items
  for each row execute function public.touch_updated_at();
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- ---------- Placing an order from the website ----------
-- Prices are looked up here, never trusted from the customer's phone.
create or replace function public.place_order(p_customer jsonb, p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name    text := btrim(coalesce(p_customer->>'name', ''));
  v_phone   text := regexp_replace(coalesce(p_customer->>'phone', ''), '[^0-9+]', '', 'g');
  v_address text := btrim(coalesce(p_customer->>'address', ''));
  v_room    text := btrim(coalesce(p_customer->>'room', ''));
  v_note    text := btrim(coalesce(p_customer->>'note', ''));
  v_entry   jsonb;
  v_item    public.menu_items%rowtype;
  v_qty     integer;
  v_option  text;
  v_unit    integer;
  v_removed text[];
  v_extras  jsonb;
  v_x       jsonb;
  v_xdef    jsonb;
  v_xqty    integer;
  v_label   text;
  v_lines   jsonb := '[]'::jsonb;
  v_sub     integer := 0;
  v_fee     integer;
  v_ref     text;
  v_recent  integer;
begin
  if v_name = '' or length(v_name) > 80 then raise exception 'invalid_name'; end if;
  if v_phone !~ '^(\+?234|0)[789][01][0-9]{8}$' then raise exception 'invalid_phone'; end if;
  if v_address = '' or length(v_address) > 160 then raise exception 'invalid_address'; end if;
  if v_room = '' or length(v_room) > 40 then raise exception 'invalid_room'; end if;
  if length(v_note) > 300 then raise exception 'note_too_long'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 30 then
    raise exception 'invalid_items';
  end if;

  -- Simple spam guard: at most 5 orders per phone number in 10 minutes
  select count(*) into v_recent from public.orders
   where phone = v_phone and created_at > now() - interval '10 minutes';
  if v_recent >= 5 then raise exception 'too_many_orders'; end if;

  for v_entry in select * from jsonb_array_elements(p_items) loop
    select * into v_item from public.menu_items
     where id = v_entry->>'id' and available;
    if not found then raise exception 'item_unavailable:%', v_entry->>'id'; end if;

    v_qty := coalesce((v_entry->>'qty')::integer, 0);
    if v_qty < 1 or v_qty > 20 then raise exception 'invalid_qty'; end if;

    v_option := nullif(btrim(coalesce(v_entry->>'option', '')), '');
    if cardinality(v_item.options) > 0 then
      if v_option is null or not (v_option = any (v_item.options)) then
        v_option := v_item.options[1];
      end if;
    else
      v_option := null;
    end if;

    -- Build-your-own: ingredients left out (free) and paid extras
    v_unit := v_item.price;
    v_removed := '{}';
    v_extras := '[]'::jsonb;
    if v_item.builder ? 'removable' and jsonb_typeof(v_entry->'removed') = 'array' then
      select coalesce(array_agg(r), '{}') into v_removed
        from jsonb_array_elements_text(v_entry->'removed') r
       where r in (select jsonb_array_elements_text(v_item.builder->'removable'));
    end if;
    if v_item.builder ? 'extras' and jsonb_typeof(v_entry->'extras') = 'array' then
      for v_x in select * from jsonb_array_elements(v_entry->'extras') loop
        select d into v_xdef from jsonb_array_elements(v_item.builder->'extras') d
         where d->>'name' = v_x->>'name' and coalesce((d->>'available')::boolean, true) limit 1;
        if v_xdef is null then raise exception 'extra_unavailable:%', v_x->>'name'; end if;
        v_xqty := coalesce((v_x->>'qty')::integer, 1);
        if v_xqty < 1 or v_xqty > 5 then raise exception 'invalid_extra_qty'; end if;
        v_extras := v_extras || jsonb_build_object('name', v_xdef->>'name', 'qty', v_xqty, 'price', (v_xdef->>'price')::integer);
        v_unit := v_unit + (v_xdef->>'price')::integer * v_xqty;
      end loop;
    end if;

    v_label := concat_ws(' · ',
      v_option,
      case when cardinality(v_removed) > 0 then 'no ' || lower(array_to_string(v_removed, ', ')) end,
      (select string_agg('+ ' || case when (e->>'qty')::int > 1 then (e->>'qty') || '× ' else '' end || (e->>'name'), ', ')
         from jsonb_array_elements(v_extras) e));

    v_lines := v_lines || jsonb_build_object(
      'id', v_item.id,
      'name', case when v_item.kind = 'combo' then v_item.name || ' combo' else v_item.name end,
      'option', nullif(v_label, ''),
      'removed', to_jsonb(v_removed),
      'extras', v_extras,
      'qty', v_qty,
      'price', v_unit,
      'line_total', v_unit * v_qty);
    v_sub := v_sub + v_unit * v_qty;
  end loop;

  select coalesce((value #>> '{}')::integer, 0) into v_fee
    from public.settings where key = 'delivery_fee';
  v_fee := coalesce(v_fee, 0);

  loop
    v_ref := 'BL-' || to_char(now() at time zone 'Africa/Lagos', 'DDMM') || '-'
             || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
    exit when not exists (select 1 from public.orders where ref = v_ref);
  end loop;

  insert into public.orders (ref, customer_name, phone, address, room, note, items, subtotal, delivery_fee, total, source)
  values (v_ref, v_name, v_phone, v_address, v_room, v_note, v_lines, v_sub, v_fee, v_sub + v_fee, 'website');

  return jsonb_build_object('ref', v_ref, 'subtotal', v_sub, 'delivery_fee', v_fee, 'total', v_sub + v_fee);
end;
$$;

-- ---------- Security (row level security) ----------
alter table public.settings   enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders     enable row level security;
alter table public.admins     enable row level security;

drop policy if exists "public reads settings" on public.settings;
create policy "public reads settings" on public.settings
  for select to anon, authenticated using (true);
drop policy if exists "admin writes settings" on public.settings;
create policy "admin writes settings" on public.settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public reads available menu" on public.menu_items;
create policy "public reads available menu" on public.menu_items
  for select to anon, authenticated using (available or public.is_admin());
drop policy if exists "admin writes menu" on public.menu_items;
create policy "admin writes menu" on public.menu_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Customers never read or write orders directly; they only use place_order().
drop policy if exists "admin manages orders" on public.orders;
create policy "admin manages orders" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin reads admins" on public.admins;
create policy "admin reads admins" on public.admins
  for select to authenticated using (public.is_admin());

revoke all on function public.place_order(jsonb, jsonb) from public;
grant execute on function public.place_order(jsonb, jsonb) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- Live updates for the dashboard
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables
                     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders') then
    execute 'alter publication supabase_realtime add table public.orders';
  end if;
end $$;

-- ---------- Starting data ----------
insert into public.settings (key, value) values
  ('delivery_fee', '500'),
  ('bank', '{"name":"OPay","number":"8059995459","accountName":"CHINECHEREM CHIMAASUZU JENNIFER"}')
on conflict (key) do nothing;

insert into public.admins (email) values ('genevachi101@gmail.com')
on conflict (email) do nothing;

insert into public.menu_items (id, kind, section, name, price, description, contents, options, option_label, badge, featured, image, icons, sort) values
  ('grandeur','combo','main','Grandeur',10000,'The full feast. Everything on the menu on one tray.',
     '{"Plantain frittata","Fries","Cheese toast","Mini pancakes","Fruit slices","Zobo"}','{"Vanilla","Red velvet","Chocolate"}','Pancake flavour','',true,'combo-grandeur.png','{"i-frittata","i-fries","i-toast","i-pancakes","i-zobo"}',10),
  ('velora','combo','main','Velora',5500,'',
     '{"Plantain frittata","Fruit slices","Mini pancakes (vanilla & chocolate)","Zobo"}','{}','','',false,'combo-velora.png','{"i-frittata","i-pancakes","i-zobo"}',20),
  ('velmont','combo','main','Velmont',6000,'',
     '{"Plantain frittata","Fruit slices","Mini pancakes (red velvet)","Zobo"}','{}','','',false,'combo-velmont.png','{"i-frittata","i-pancakes","i-fruit"}',30),
  ('aurelia','combo','main','Aurelia',6000,'',
     '{"Plantain frittata","Fruit slices","French fries","Zobo"}','{}','','',false,'combo-aurelia.png','{"i-frittata","i-fries","i-zobo"}',40),
  ('serene','combo','main','Serene',6500,'',
     '{"Plantain frittata","Fruit slices","Cheese toast","Zobo"}','{}','','',false,'combo-serene.png','{"i-frittata","i-toast","i-fruit"}',50),
  ('frittata','item','main','Plantain frittata',2000,'A full plate of plantain frittata.','{}','{}','','',false,'plantain-frittata.png','{"i-frittata"}',110),
  ('toast','item','main','Cheese toast',2500,'Toasted bread with melted cheese.','{}','{}','','',false,'cheese-toast.png','{"i-toast"}',120),
  ('fries','item','main','French fries',1500,'A portion of crisp fries.','{}','{}','','',false,'french-fries.png','{"i-fries"}',130),
  ('pancakes','item','main','Mini pancakes',1500,'Bite-size pancakes.','{}','{"Vanilla","Red velvet","Chocolate"}','Flavour','',false,'mini-pancakes.png','{"i-pancakes"}',140),
  ('zobo','item','main','Roselle tea (zobo)',1000,'Chilled hibiscus drink.','{}','{}','','',false,'zobo.png','{"i-zobo"}',150),
  ('fruit','item','main','Fruit slices',500,'Fresh sliced fruit.','{}','{}','','',false,'fruit-slices.png','{"i-fruit"}',160),
  ('yoghurt-500','item','main','Yoghurt (500ml)',2000,'Thick, chilled yoghurt. Big bottle.','{}','{"Vanilla","Strawberry"}','Flavour','',false,'yoghurt.png','{"i-yoghurt"}',170),
  ('yoghurt-250','item','main','Yoghurt (250ml)',1000,'Thick, chilled yoghurt. Small bottle.','{}','{"Vanilla","Strawberry"}','Flavour','',false,'yoghurt.png','{"i-yoghurt"}',180),
  ('tiramisu','item','new','Tiramisu',3500,'A cup of coffee-soaked sponge layered with soft, creamy mascarpone and cocoa.','{}','{}','','New',false,'tiramisu.png','{"i-dessert"}',190),
  ('tres-leches','item','new','Tres leches',3500,'A cup of light sponge soaked in three kinds of milk, topped with whipped cream.','{}','{}','','New',false,'tres-leches.png','{"i-dessert"}',200),
  ('noodles','item','noodles','Classic noodles',2500,'2 Indomie and 2 eggs, stir-fried with carrot, sausage, pepper and onions.','{}','{"Mild","Normal","Hot"}','Spice level','',false,'stir-fried-noodles.png','{"i-noodles"}',300),
  ('noodles-veggie','item','noodles','Egg & Veggie noodles',2500,'2 Indomie and 2 eggs with carrot, pepper and onions. No sausage.','{}','{"Mild","Normal","Hot"}','Spice level','',false,'stir-fried-noodles.png','{"i-noodles"}',310),
  ('noodles-loaded','item','noodles','Loaded noodles',3500,'2 Indomie and 2 eggs with chicken, double sausage, carrot, pepper and onions.','{}','{"Mild","Normal","Hot"}','Spice level','',false,'stir-fried-noodles.png','{"i-noodles"}',320)
on conflict (id) do nothing;

-- Noodle builder settings (only filled in where not set yet, so dashboard edits are kept)
update public.menu_items set builder = jsonb_build_object(
    'removable', case when id = 'noodles-veggie' then '["Carrot","Pepper","Onions"]'::jsonb else '["Carrot","Sausage","Pepper","Onions"]'::jsonb end,
    'extras', '[{"name":"Extra egg","price":300},{"name":"Extra sausage","price":300},{"name":"Extra Indomie pack","price":500},{"name":"Chicken","price":1000}]'::jsonb)
 where section = 'noodles' and builder = '{}'::jsonb;
