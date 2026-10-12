/* =========================================================
   BITE LAB — your details. Edit this file to change them.
   Used by the website (app.js) and the owner dashboard (admin.js).
   ========================================================= */
const CONFIG = {
  // WhatsApp number in international format, digits only
  whatsapp: "2348059995459",
  whatsappDisplay: "0805 999 5459",
  instagram: "bitelab.ng",
  address: "Apple Lodge, Okofia",
  story: "",

  // Delivery fee added to every order (naira)
  deliveryFee: 500,
  // Bank transfer details shown on the Order page
  bank: { name: "OPay", number: "8059995459", accountName: "CHINECHEREM CHIMAASUZU JENNIFER" },
  // Opening hours (24-hour Lagos time)
  opens: { h: 10, m: 0 },    // 10:00am
  closes: { h: 21, m: 0 },   // 9:00pm

  // Online database (Supabase). Leave empty to run without the dashboard.
  // Settings > API in your Supabase project: "Project URL" and the "anon public" key.
  supabaseUrl: "https://igwrycjdinavpsuxpitr.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlnd3J5Y2pkaW5hdnBzdXhwaXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MDEyODAsImV4cCI6MjEwNzM3NzI4MH0.t1F2SRy4_5jy3vWJWbn8TPJlJFeymIJAr9CYVyZNUlQ",

  // true = show free sample photos from Unsplash until your own photos are in /images
  useSamplePhotos: true
};