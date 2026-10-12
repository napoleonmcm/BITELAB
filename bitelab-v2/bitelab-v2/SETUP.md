# Bite Lab website: setup guide

The website works straight away. Customers order on WhatsApp and pay by bank transfer.
The owner's dashboard (orders, sales, menu switches) starts working once you finish **Part B**.

---

## Part A — Put the new website live (5 minutes)

1. Unzip `bitelab-v2.zip`.
2. Go to **app.netlify.com** → your site → **Deploys**.
3. Drag the whole `bitelab-v2` folder into the box at the bottom. Wait for **Published**.
4. On your phone, open the site in a private/incognito tab and check:
   - Menu shows yoghurt (2 sizes), and a "New on the menu" section with tiramisu and tres leches.
   - Order page asks for phone and room number, shows ₦500 delivery and the OPay details.
   - Sending an order opens WhatsApp with the order number, total and bank details.

Your details (WhatsApp, bank, delivery fee, hours) are in **config.js**.

---

## Part B — Connect the dashboard (about 20 minutes, free)

### 1. Create the database
1. Go to **supabase.com** → **Start your project** → sign up (GitHub or email).
2. **New project**:
   - Name: `bitelab`
   - Database password: tap **Generate**, then save it somewhere safe
   - Region: the one closest to Nigeria in the list
   - Plan: Free
3. Wait 1–2 minutes for the project to finish setting up.

### 2. Create the tables
1. Left menu → **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from the folder, copy **everything**, paste it in.
3. Tap **Run**. You should see "Success. No rows returned".

This creates the menu, orders and settings, loads your current menu and prices,
and makes **genevachi101@gmail.com** the owner.

### 3. Create the owner's login
1. Left menu → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Email: `genevachi101@gmail.com`. Choose a password. Tick **Auto Confirm User**. Create.
3. Still in Authentication, find the setting **Allow new users to sign up** and turn it **off**,
   so no one else can create an account.
4. Authentication → **URL Configuration**:
   - Site URL: `https://bitelab.ng` (or your netlify.app link until the domain is connected)
   - Redirect URLs: add `https://bitelab.ng/admin.html` (this makes "Forgot password" work)

### 4. Connect the website to the database
1. Left menu → **Project Settings** → **API** (may be called "Data API" / "API Keys").
2. Copy the **Project URL** and the **anon public** key.
   Never use the key called **service_role** — that one must stay secret.
3. Open `config.js` and paste them in:
   ```js
   supabaseUrl: "https://abcdefgh.supabase.co",
   supabaseAnonKey: "eyJhbGciOi...",
   ```
4. Save, then upload the folder to Netlify again (Part A, steps 2–3).

### 5. Open the dashboard
1. Go to **https://bitelab.ng/admin.html** (or your-site.netlify.app/admin.html).
2. Sign in with the owner email and password.
3. Add it to the home screen: Chrome menu ⋮ → **Add to Home screen** (iPhone: Share → Add to Home Screen).
4. Test: on another phone, place an order on the website. It appears on the dashboard
   with a sound within a few seconds.

---

## Using the dashboard

| Tab | What it does |
| --- | --- |
| **Orders** | New website orders appear live. Change status (New → Confirmed → Preparing → Out for delivery → Delivered, or Cancelled), tap **Mark paid** when the transfer arrives, tap **WhatsApp update** to message the customer. **+ Add order** records walk-in, phone or WhatsApp orders. |
| **Sales** | Sales, orders, paid amount and average order for today, this week (from Monday) or this month. Daily chart, best sellers, busiest hours. **Download CSV** opens in Excel or Google Sheets. |
| **Menu** | Noodles: tap **Edit** on a variety to change what customers can leave out and the extras with their prices (one per line, e.g. `Extra egg = 300`). Switch any item on or off (tiramisu and tres leches on the days you make them). **Edit** changes name, price, description, flavours, badge or photo. **+ Add item** adds something new. Changes show on the website immediately. |
| **Settings** | Delivery fee and bank details. Sign out. |

Prices are always checked by the database, so customers can't change them on their phone.

## Good to know
- If you already ran `schema.sql` before the noodle builder was added, run it again: it adds the builder and the two new noodle varieties without touching your orders or edits.
- Noodle extras prices (egg ₦300, sausage ₦300, Indomie pack ₦500, chicken ₦1,000) are placeholders. Change them in the dashboard, or in `app.js` (NOODLE_EXTRAS) if the dashboard isn't connected yet.
- Once the dashboard is connected, menu and prices come from the dashboard, not from `app.js`.
- Free Supabase projects can be paused if nobody uses them for about a week. You'll get an email and can restore it in one tap. Daily orders keep it active.
- Photos: put them in `images/` with the names in `images/README.txt`, then upload the folder again.
- When Paystack is approved, online payment can be added on top of this.
