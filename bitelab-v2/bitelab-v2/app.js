/* =========================================================
   MENU — used when the database is not connected.
   Once the database is connected, the menu comes from your dashboard instead.
   kind: "item" or "combo". section: "main", "new" or "noodles".
   ========================================================= */
// Extras for the noodle builder (prices in naira). Edit in the dashboard once it's connected.
const NOODLE_EXTRAS = [
  { name: "Extra egg", price: 300 },
  { name: "Extra sausage", price: 300 },
  { name: "Extra Indomie pack", price: 500 },
  { name: "Chicken", price: 1000 }
];

let MENU = [
  { id: "grandeur", kind: "combo", name: "Grandeur", price: 10000, featured: true, sort: 10,
    description: "The full feast. Everything on the menu on one tray.",
    contents: ["Plantain frittata", "Fries", "Cheese toast", "Mini pancakes", "Fruit slices", "Zobo"],
    icons: ["i-frittata", "i-fries", "i-toast", "i-pancakes", "i-zobo"],
    options: ["Vanilla", "Red velvet", "Chocolate"], option_label: "Pancake flavour", image: "combo-grandeur.png" },
  { id: "velora", kind: "combo", name: "Velora", price: 5500, sort: 20,
    contents: ["Plantain frittata", "Fruit slices", "Mini pancakes (vanilla & chocolate)", "Zobo"],
    icons: ["i-frittata", "i-pancakes", "i-zobo"], image: "combo-velora.png" },
  { id: "velmont", kind: "combo", name: "Velmont", price: 6000, sort: 30,
    contents: ["Plantain frittata", "Fruit slices", "Mini pancakes (red velvet)", "Zobo"],
    icons: ["i-frittata", "i-pancakes", "i-fruit"], image: "combo-velmont.png" },
  { id: "aurelia", kind: "combo", name: "Aurelia", price: 6000, sort: 40,
    contents: ["Plantain frittata", "Fruit slices", "French fries", "Zobo"],
    icons: ["i-frittata", "i-fries", "i-zobo"], image: "combo-aurelia.png" },
  { id: "serene", kind: "combo", name: "Serene", price: 6500, sort: 50,
    contents: ["Plantain frittata", "Fruit slices", "Cheese toast", "Zobo"],
    icons: ["i-frittata", "i-toast", "i-fruit"], image: "combo-serene.png" },

  { id: "frittata", kind: "item", name: "Plantain frittata", price: 2000, sort: 110, icons: ["i-frittata"], image: "plantain-frittata.png", description: "A full plate of plantain frittata." },
  { id: "toast", kind: "item", name: "Cheese toast", price: 2500, sort: 120, icons: ["i-toast"], image: "cheese-toast.png", description: "Toasted bread with melted cheese." },
  { id: "fries", kind: "item", name: "French fries", price: 1500, sort: 130, icons: ["i-fries"], image: "french-fries.png", description: "A portion of crisp fries." },
  { id: "pancakes", kind: "item", name: "Mini pancakes", price: 1500, sort: 140, icons: ["i-pancakes"], image: "mini-pancakes.png", description: "Bite-size pancakes.", options: ["Vanilla", "Red velvet", "Chocolate"], option_label: "Flavour" },
  { id: "zobo", kind: "item", name: "Roselle tea (zobo)", price: 1000, sort: 150, icons: ["i-zobo"], image: "zobo.png", description: "Chilled hibiscus drink." },
  { id: "fruit", kind: "item", name: "Fruit slices", price: 500, sort: 160, icons: ["i-fruit"], image: "fruit-slices.png", description: "Fresh sliced fruit." },
  { id: "yoghurt-500", kind: "item", name: "Yoghurt (500ml)", price: 2000, sort: 170, icons: ["i-yoghurt"], image: "yoghurt.png", description: "Thick, chilled yoghurt. Big bottle.", options: ["Vanilla", "Strawberry"], option_label: "Flavour" },
  { id: "yoghurt-250", kind: "item", name: "Yoghurt (250ml)", price: 1000, sort: 180, icons: ["i-yoghurt"], image: "yoghurt.png", description: "Thick, chilled yoghurt. Small bottle.", options: ["Vanilla", "Strawberry"], option_label: "Flavour" },
  { id: "tiramisu", kind: "item", section: "new", badge: "New", name: "Tiramisu", price: 3500, sort: 190, icons: ["i-dessert"], image: "tiramisu.png", description: "A cup of coffee-soaked sponge layered with soft, creamy mascarpone and cocoa." },
  { id: "tres-leches", kind: "item", section: "new", badge: "New", name: "Tres leches", price: 3500, sort: 200, icons: ["i-dessert"], image: "tres-leches.png", description: "A cup of light sponge soaked in three kinds of milk, topped with whipped cream." },
  { id: "noodles", kind: "item", section: "noodles", name: "Classic noodles", price: 2500, sort: 300, icons: ["i-noodles"], image: "stir-fried-noodles.png", description: "2 Indomie and 2 eggs, stir-fried with carrot, sausage, pepper and onions.", options: ["Mild", "Normal", "Hot"], option_label: "Spice level", builder: { removable: ["Carrot", "Sausage", "Pepper", "Onions"], extras: NOODLE_EXTRAS } },
  { id: "noodles-veggie", kind: "item", section: "noodles", name: "Egg & Veggie noodles", price: 2500, sort: 310, icons: ["i-noodles"], image: "stir-fried-noodles.png", description: "2 Indomie and 2 eggs with carrot, pepper and onions. No sausage.", options: ["Mild", "Normal", "Hot"], option_label: "Spice level", builder: { removable: ["Carrot", "Pepper", "Onions"], extras: NOODLE_EXTRAS } },
  { id: "noodles-loaded", kind: "item", section: "noodles", name: "Loaded noodles", price: 3500, sort: 320, icons: ["i-noodles"], image: "stir-fried-noodles.png", description: "2 Indomie and 2 eggs with chicken, double sausage, carrot, pepper and onions.", options: ["Mild", "Normal", "Hot"], option_label: "Spice level", builder: { removable: ["Carrot", "Sausage", "Pepper", "Onions"], extras: NOODLE_EXTRAS } }
];

/* Sample photos (Unsplash licence: free to use). Delete a line once your own photo is in /images. */
const U = id => `https://images.unsplash.com/photo-${id}?w=700&h=700&q=70&auto=format&fit=crop`;
const SAMPLE_PHOTOS = {
  "hero-frittata.png": U("1587900437942-8758241767ef"),
  "plantain-frittata.png": U("1563336522-c3bd728d3b45"),
  "cheese-toast.png": U("1528736235302-52922df5c122"),
  "french-fries.png": U("1630384060421-cb20d0e0649d"),
  "mini-pancakes.png": U("1692742250347-f3057b93d414"),
  "zobo.png": U("1593624191635-f1a49f5eca76"),
  "fruit-slices.png": U("1641642399576-487909d0ddbc"),
  "stir-fried-noodles.png": U("1634864572865-1cf8ff8bd23d"),
  "combo-grandeur.png": U("1641423982364-306526e0f8f4"),
  "combo-velora.png": U("1709203813530-cdb59bd1411f"),
  "combo-velmont.png": U("1595504118176-4285f70b9b4d"),
  "combo-aurelia.png": U("1630431341973-02e1b662ec35"),
  "combo-serene.png": U("1643473806845-485d1f11688c"),
  "team.png": U("1765584829997-12ab011bb5b3")
};
const samplePhoto = file => CONFIG.useSamplePhotos ? SAMPLE_PHOTOS[file] : null;

/* ========================================================= */

const $ = (s, el = document) => el.querySelector(s);
const naira = n => "₦" + Number(n || 0).toLocaleString("en-NG");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const icon = id => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
const BASKET_SVG = `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h16l-1.6 10.5a1.5 1.5 0 0 1-1.5 1.3H7.1a1.5 1.5 0 0 1-1.5-1.3z"/><path d="M8 9l4-5 4 5M9 13v4M12 13v4M15 13v4"/></svg>`;
const byId = id => MENU.find(m => m.id === id);
const sorted = list => [...list].sort((a, b) => (a.sort ?? 100) - (b.sort ?? 100));

document.documentElement.classList.add("js");

/* ---------- Database (optional) ---------- */
let sb = null;
if (CONFIG.supabaseUrl && CONFIG.supabaseAnonKey && window.supabase?.createClient) {
  try { sb = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey); } catch (e) { sb = null; }
}
async function loadFromDatabase() {
  if (!sb) return;
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 6000));
  try {
    const [menuRes, setRes] = await Promise.race([Promise.all([
      sb.from("menu_items").select("*").eq("available", true).order("sort"),
      sb.from("settings").select("key,value")
    ]), timeout]);
    if (!menuRes.error && menuRes.data?.length) {
      MENU = menuRes.data.map(m => ({ ...m, contents: m.contents || [], options: m.options || [], icons: m.icons?.length ? m.icons : [m.kind === "combo" ? "i-frittata" : "i-plantain"] }));
    }
    if (!setRes.error) for (const row of setRes.data || []) {
      if (row.key === "delivery_fee") CONFIG.deliveryFee = Number(row.value) || 0;
      if (row.key === "bank" && row.value) CONFIG.bank = row.value;
    }
  } catch (e) { /* keep the built-in menu */ }
}

/* ---------- Photos with line-art fallback ---------- */
function photoSrc(file) {
  if (!file) return "";
  if (/^https?:\/\//.test(file)) return file;
  return samplePhoto(file) || "images/" + file;
}
function mediaHTML(m) {
  const icons = m.icons?.length ? m.icons : ["i-plantain"];
  const art = icons.length > 1
    ? `<div class="art multi">${icons.map(icon).join("")}</div>`
    : `<div class="art">${icon(icons[0])}</div>`;
  const src = photoSrc(m.image);
  return `<div class="media">${art}${src ? `<img src="${esc(src)}" alt="${esc(m.name)}" loading="lazy" data-fallback="keep-art">` : ""}</div>`;
}

function wireImage(img) {
  if (img.dataset.wired) return; img.dataset.wired = "1";
  const fail = () => {
    const mode = img.dataset.fallback;
    if (mode === "plate-art") { img.closest("picture")?.remove(); return; }
    img.remove();
  };
  const ok = () => { const art = img.parentElement?.querySelector(".art"); if (art && img.dataset.fallback === "keep-art") art.remove(); img.parentElement?.classList.add("has-photo"); img.closest(".plate")?.classList.add("has-photo"); };
  if (img.complete) { img.naturalWidth ? ok() : fail(); }
  else { img.addEventListener("error", fail, { once: true }); img.addEventListener("load", ok, { once: true }); }
}
function wireImages(root = document) {
  root.querySelectorAll("img[data-fallback]").forEach(img => {
    if (!img.dataset.wired && img.getAttribute("src")?.startsWith("images/")) {
      const s = samplePhoto(img.getAttribute("src").replace("images/", ""));
      if (s) img.src = s;
    }
    wireImage(img);
  });
}

/* ---------- Render menu ---------- */
function optionSelect(m) {
  if (!m.options?.length) return "";
  return `<div class="field-inline"><label for="opt-${esc(m.id)}">${esc(m.option_label || "Option")}</label>
    <select id="opt-${esc(m.id)}">${m.options.map(o => `<option>${esc(o)}</option>`).join("")}</select></div>`;
}

function renderCombos() {
  const combos = sorted(MENU.filter(m => m.kind === "combo"));
  document.querySelectorAll("[data-combos]").forEach(grid => {
    const want = grid.dataset.combos;
    const list = want === "all" ? combos : want.split(",").map(id => combos.find(c => c.id === id)).filter(Boolean);
    grid.innerHTML = list.map(c => `
    <article class="combo${c.featured ? " feature" : ""}">
      ${mediaHTML(c)}
      <div class="combo-body">
        <h3>${esc(c.name)}${c.badge ? ` <span class="badge">${esc(c.badge)}</span>` : ""}</h3>
        ${c.description ? `<p class="muted">${esc(c.description)}</p>` : ""}
        ${c.contents?.length ? `<p class="card-desc">${c.contents.map(esc).join(", ")}.</p>` : ""}
        ${optionSelect(c)}
        <div class="card-foot">
          <span class="price-big">${naira(c.price)}</span>
          <button class="basket-add" type="button" data-add="${esc(c.id)}" aria-label="Add ${esc(c.name)} combo to order">${BASKET_SVG}</button>
        </div>
      </div>
    </article>`).join("");
  });
}

function unitHTML(m) {
  return `
    <li class="unit">
      ${mediaHTML(m)}
      <span class="price-chip">${naira(m.price)}</span>
      <div class="unit-info">
        <h3>${esc(m.name)}${m.badge ? ` <span class="badge">${esc(m.badge)}</span>` : ""}</h3>
        <p>${esc(m.description)}</p>
        ${m.options?.length ? `<select id="opt-${esc(m.id)}" aria-label="${esc(m.option_label || "Option")} for ${esc(m.name)}">${m.options.map(o => `<option>${esc(o)}</option>`).join("")}</select>` : ""}
      </div>
      <button class="basket-add" type="button" data-add="${esc(m.id)}" aria-label="Add ${esc(m.name)} to order">${BASKET_SVG}</button>
    </li>`;
}

function renderUnits() {
  const main = $("#unit-list");
  if (main) main.innerHTML = sorted(MENU.filter(m => m.kind === "item" && (m.section || "main") === "main")).map(unitHTML).join("");
  const fresh = sorted(MENU.filter(m => m.kind === "item" && m.section === "new"));
  document.querySelectorAll("[data-new-section]").forEach(sec => sec.hidden = !fresh.length);
  const newList = $("#new-list");
  if (newList) newList.innerHTML = fresh.map(unitHTML).join("");
  // Noodles
  const noodles = sorted(MENU.filter(m => m.section === "noodles"));
  document.querySelectorAll("[data-noodles-band]").forEach(band => band.hidden = !noodles.length);
  if (noodles.length) document.querySelectorAll("[data-noodles-from]").forEach(el => el.textContent = naira(Math.min(...noodles.map(n => n.price))));
  renderBuilder(noodles);
  // Lowest combo price
  const combos = MENU.filter(m => m.kind === "combo");
  if (combos.length) document.querySelectorAll("[data-combo-from]").forEach(el => el.textContent = naira(Math.min(...combos.map(c => c.price))));
  wireImages();
}

/* ---------- Build your noodles ---------- */
const nb = { id: null, removed: new Set(), extras: {}, spice: "", qty: 1 };
function nbItem() { return byId(nb.id); }
function nbUnit() {
  const m = nbItem(); if (!m) return 0;
  return m.price + (m.builder?.extras || []).reduce((s, x) => s + (nb.extras[x.name] || 0) * x.price, 0);
}
function nbLabel(m = nbItem(), spice = nb.spice, removed = [...nb.removed], extras = nb.extras) {
  const parts = [];
  if (spice) parts.push(spice);
  if (removed.length) parts.push("no " + removed.map(r => r.toLowerCase()).join(", "));
  const ex = Object.entries(extras).filter(([, q]) => q > 0).map(([n, q]) => "+ " + (q > 1 ? q + "× " : "") + n);
  if (ex.length) parts.push(ex.join(", "));
  return parts.join(" · ");
}
function renderBuilder(list) {
  const root = $("#nb"); if (!root) return;
  if (!list.length) return;
  if (!byId(nb.id) || byId(nb.id).section !== "noodles") nb.id = list[0].id;
  const m = nbItem();
  const removable = m.builder?.removable || [], extras = (m.builder?.extras || []).filter(x => x.available !== false);
  // keep only valid choices for the chosen variety
  nb.removed = new Set([...nb.removed].filter(r => removable.includes(r)));
  Object.keys(nb.extras).forEach(k => { if (!extras.some(x => x.name === k)) delete nb.extras[k]; });
  if (!m.options?.includes(nb.spice)) nb.spice = m.options?.includes("Normal") ? "Normal" : (m.options?.[0] || "");

  $("#nb-varieties").innerHTML = list.map(v => `
    <label class="nb-variety${v.id === nb.id ? " on" : ""}">
      <input type="radio" name="nb-variety" value="${esc(v.id)}"${v.id === nb.id ? " checked" : ""}>
      <span class="nbv-name">${esc(v.name)}${v.badge ? ` <span class="badge">${esc(v.badge)}</span>` : ""}</span>
      <span class="nbv-price">${naira(v.price)}</span>
      <span class="nbv-desc">${esc(v.description)}</span>
    </label>`).join("");
  $("#nb-remove-wrap").hidden = !removable.length;
  $("#nb-remove").innerHTML = removable.map(r => `
    <label class="nb-chip"><input type="checkbox" value="${esc(r)}"${nb.removed.has(r) ? "" : " checked"}><span>${esc(r)}</span></label>`).join("");
  $("#nb-extras-wrap").hidden = !extras.length;
  $("#nb-extras").innerHTML = extras.map(x => {
    const q = nb.extras[x.name] || 0;
    return `<li class="nb-extra${q ? " has" : ""}"><span>${esc(x.name)} <span class="muted">+${naira(x.price)}</span></span>
      <span class="stepper"><button type="button" data-nbx="${esc(x.name)}" data-d="-1" aria-label="One less ${esc(x.name)}">−</button><output>${q}</output><button type="button" data-nbx="${esc(x.name)}" data-d="1" aria-label="One more ${esc(x.name)}">+</button></span></li>`;
  }).join("");
  $("#nb-spice-wrap").hidden = !m.options?.length;
  $("#nb-spice").innerHTML = (m.options || []).map(s => `
    <label class="nb-chip spice"><input type="radio" name="nb-spice" value="${esc(s)}"${s === nb.spice ? " checked" : ""}><span>${esc(s)}</span></label>`).join("");
  updateBuilderTotal();
}
function updateBuilderTotal() {
  if (!$("#nb")) return;
  $("#nb-qty").textContent = nb.qty;
  $("#nb-total").textContent = naira(nbUnit() * nb.qty);
  const label = nbLabel();
  $("#nb-summary").textContent = nbItem() ? `${nbItem().name}${label ? " · " + label : ""}` : "";
}
function addNoodles() {
  const m = nbItem(); if (!m) return;
  const removed = [...nb.removed], extras = Object.entries(nb.extras).filter(([, q]) => q > 0).map(([name, qty]) => ({ name, qty }));
  const key = [m.id, nb.spice, removed.sort().join("+"), extras.map(e => e.name + "x" + e.qty).sort().join("+")].join("|");
  const found = basket.find(l => l.key === key);
  if (found) found.qty += nb.qty;
  else basket.push({ key, id: m.id, name: m.name, price: nbUnit(), option: nbLabel(), qty: nb.qty, spice: nb.spice, removed, extras });
  save(); renderBasket(true);
  toast(`${nb.qty} × ${m.name} added`, true);
  nb.qty = 1; nb.removed = new Set(); nb.extras = {}; renderBuilder(sorted(MENU.filter(x => x.section === "noodles")));
}
document.addEventListener("change", e => {
  if (e.target.name === "nb-variety") { nb.id = e.target.value; renderBuilder(sorted(MENU.filter(x => x.section === "noodles"))); }
  if (e.target.closest("#nb-remove")) { e.target.checked ? nb.removed.delete(e.target.value) : nb.removed.add(e.target.value); updateBuilderTotal(); }
  if (e.target.name === "nb-spice") { nb.spice = e.target.value; updateBuilderTotal(); }
});
document.addEventListener("click", e => {
  const x = e.target.closest("[data-nbx]");
  if (x) {
    const n = x.dataset.nbx; nb.extras[n] = Math.min(5, Math.max(0, (nb.extras[n] || 0) + +x.dataset.d));
    const li = x.closest(".nb-extra"); li.querySelector("output").textContent = nb.extras[n]; li.classList.toggle("has", nb.extras[n] > 0);
    updateBuilderTotal();
  }
  const q = e.target.closest("[data-nbq]");
  if (q) { nb.qty = Math.min(20, Math.max(1, nb.qty + +q.dataset.nbq)); updateBuilderTotal(); }
  if (e.target.closest("#nb-add")) addNoodles();
});

/* ---------- Basket (saved in the browser, shared by all pages) ---------- */
let basket = [];
try { basket = JSON.parse(localStorage.getItem("bitelab-basket") || "[]"); } catch (e) { basket = []; }
const save = () => { try { localStorage.setItem("bitelab-basket", JSON.stringify(basket)); } catch (e) {} };
const setAll = (sel, val) => document.querySelectorAll(sel).forEach(el => el.textContent = val);

// Keep prices in the basket matching the current menu; drop items that are no longer available
function reconcileBasket() {
  const before = basket.length;
  basket = basket.filter(l => byId(l.id)).map(l => {
    const m = byId(l.id);
    if (l.extras || l.removed) {
      const defs = m.builder?.extras || [];
      if ((l.extras || []).some(e => !defs.some(d => d.name === e.name && d.available !== false))) return null;
      const unit = m.price + (l.extras || []).reduce((s, e) => s + defs.find(d => d.name === e.name).price * e.qty, 0);
      return { ...l, name: m.name, price: unit };
    }
    return { ...l, price: m.price, name: displayName(m) };
  }).filter(Boolean);
  if (basket.length !== before) toast("Some items in your order are no longer available and were removed");
  save();
}
const displayName = m => m.kind === "combo" ? `${m.name} combo` : m.name;

function addLine(id, option) {
  const m = byId(id); if (!m) return;
  const key = id + "|" + (option || "");
  const found = basket.find(l => l.key === key);
  if (found) found.qty++; else basket.push({ key, id, name: displayName(m), price: m.price, option: option || "", qty: 1 });
  save(); renderBasket(true);
  toast(`${displayName(m)}${option ? " (" + option + ")" : ""} added`, true);
}

const subtotal = () => basket.reduce((a, l) => a + l.qty * l.price, 0);

function renderBasket(bump) {
  const count = basket.reduce((a, l) => a + l.qty, 0);
  const sub = subtotal();
  setAll("[data-basket-count]", count);
  setAll("[data-mobile-count]", count);
  setAll("[data-mobile-total]", naira(sub));
  document.querySelectorAll("[data-mobile-bar]").forEach(b => b.hidden = count === 0);
  if (bump) document.querySelectorAll("[data-basket-count]").forEach(b => { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); });

  const list = $("#basket-list"); if (!list) return;
  const fee = count ? CONFIG.deliveryFee : 0;
  $("#basket-subtotal").textContent = naira(sub);
  $("#basket-delivery").textContent = naira(fee);
  $("#basket-total").textContent = naira(sub + fee);
  $("#basket-empty").hidden = count > 0;
  $("#send-btn").disabled = count === 0;
  list.innerHTML = basket.map((l, i) => `
    <li class="line-item">
      <h3>${esc(l.name)}</h3>
      <span class="lt">${naira(l.qty * l.price)}</span>
      ${l.option ? `<span class="opt">${esc(l.option)}</span>` : `<span class="opt">${naira(l.price)} each</span>`}
      <span class="stepper">
        <button type="button" data-dec="${i}" aria-label="Remove one ${esc(l.name)}">−</button>
        <output>${l.qty}</output>
        <button type="button" data-inc="${i}" aria-label="Add one ${esc(l.name)}">+</button>
      </span>
    </li>`).join("");
}

function fillBank() {
  const b = CONFIG.bank || {};
  setAll("[data-bank-name]", b.name || "");
  setAll("[data-bank-number]", b.number || "");
  setAll("[data-bank-account]", b.accountName || "");
  setAll("[data-delivery-fee]", naira(CONFIG.deliveryFee));
}

/* ---------- Opening hours (Lagos time) ---------- */
function lagosNow() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const get = t => +parts.find(p => p.type === t).value;
  return { h: get("hour") % 24, m: get("minute") };
}
function updateStatus() {
  const { h, m } = lagosNow();
  const mins = h * 60 + m;
  const open = CONFIG.opens.h * 60 + CONFIG.opens.m, close = CONFIG.closes.h * 60 + CONFIG.closes.m;
  let short, long, isOpen;
  if (mins < open) {
    isOpen = false; short = "Opens at 10am";
    long = "We open at 10am. Orders sent now are prepared from 10am.";
  } else if (mins < close) {
    isOpen = true;
    const left = close - mins, hh = Math.floor(left / 60), mm = left % 60;
    short = "Open now";
    long = `Open now until 9:00pm (${hh ? hh + "h " : ""}${mm}m left). Same-day delivery.`;
  } else {
    isOpen = false; short = "Closed for today";
    long = "We closed at 9:00pm. Orders sent now are for tomorrow, subject to availability.";
  }
  document.querySelectorAll(".status").forEach(p => p.classList.toggle("closed", !isOpen));
  setAll('[data-status="short"]', short);
  setAll('[data-status="long"]', long);
}

/* ---------- Sending an order ---------- */
function waLink(text, number = CONFIG.whatsapp) { return `https://wa.me/${number}${text ? "?text=" + encodeURIComponent(text) : ""}`; }
const cleanPhone = p => p.replace(/[^\d+]/g, "");
const validPhone = p => /^(\+?234|0)[789][01]\d{8}$/.test(cleanPhone(p));
let sending = false;

async function sendOrder(e) {
  e.preventDefault();
  if (sending || !basket.length) return;
  const err = $("#form-error");
  const v = id => $(id).value.trim();
  const customer = { name: v("#f-name"), phone: v("#f-phone"), address: v("#f-address"), room: v("#f-room"), note: v("#f-note") };
  const missing = [];
  if (!customer.name) missing.push("your name");
  if (!customer.phone) missing.push("your phone number");
  if (!customer.address) missing.push("your lodge or street");
  if (!customer.room) missing.push("your room number");
  if (missing.length) { err.textContent = `Add ${missing.join(", ").replace(/, ([^,]*)$/, " and $1")} so we can deliver.`; err.hidden = false; return; }
  if (!validPhone(customer.phone)) { err.textContent = "Check your phone number. It should look like 0805 999 5459."; err.hidden = false; return; }
  err.hidden = true;

  sending = true;
  const btn = $("#send-btn"); btn.disabled = true; btn.textContent = "Sending…";
  // Open the WhatsApp tab straight away so phones don't block it, then fill it in
  const win = window.open("", "_blank");

  let ref = "", sub = subtotal(), fee = CONFIG.deliveryFee, total = sub + fee, saved = false;
  if (sb) {
    try {
      const { data, error } = await sb.rpc("place_order", {
        p_customer: customer,
        p_items: basket.map(l => l.extras || l.removed
          ? { id: l.id, qty: l.qty, option: l.spice || "", removed: l.removed || [], extras: l.extras || [] }
          : { id: l.id, qty: l.qty, option: l.option.replace(/^.*?: /, "") })
      });
      if (!error && data) { ref = data.ref; sub = data.subtotal; fee = data.delivery_fee; total = data.total; saved = true; }
    } catch (e2) { /* fall back to WhatsApp only */ }
  }
  if (!ref) { const d = new Date(); ref = `BL-${String(d.getDate()).padStart(2, "0")}${String(d.getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`; }

  const b = CONFIG.bank;
  const lines = basket.map(l => `• ${l.qty} × ${l.name}${l.option ? " (" + l.option + ")" : ""} — ${naira(l.qty * l.price)}`);
  const msg = [
    `Hello Bite Lab! New order ${ref}`, "", ...lines, "",
    `Food: ${naira(sub)}`, `Delivery: ${naira(fee)}`, `Total: ${naira(total)}`, "",
    `Name: ${customer.name}`, `Phone: ${customer.phone}`, `Lodge/street: ${customer.address}`, `Room: ${customer.room}`,
    ...(customer.note ? [`Note: ${customer.note}`] : []), "",
    `Payment: bank transfer to ${b.name} ${b.number} (${b.accountName}). I'll send the payment screenshot here.`
  ].join("\n");
  const link = waLink(msg);
  if (win) win.location.href = link; else location.href = link;

  if (saved) { basket = []; save(); renderBasket(false); $("#basket-form").reset(); }
  showSent(ref, total, link, saved);
  sending = false; btn.disabled = basket.length === 0; btn.textContent = "Send order on WhatsApp";
}

function showSent(ref, total, link, saved) {
  const box = $("#sent-box"); if (!box) return;
  $("#sent-ref").textContent = ref;
  $("#sent-total").textContent = naira(total);
  $("#sent-link").href = link;
  $("#sent-saved").hidden = !saved;
  box.hidden = false;
  box.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ---------- Helpers ---------- */
let toastTimer;
function toast(text, withLink) {
  const t = $("#toast"); if (!t) return;
  const onOrderPage = !!$("#basket-list");
  t.innerHTML = esc(text) + (withLink && !onOrderPage ? ` · <a href="order.html">View order</a>` : "");
  t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

function fillConfig() {
  document.querySelectorAll("[data-config]").forEach(el => {
    const k = el.dataset.config, v = CONFIG[k];
    if (!v) return;
    if (k === "instagram") { el.textContent = "@" + v; el.href = `https://instagram.com/${v}`; }
    else if (k === "address") el.textContent = v + ", Nnewi";
    else { el.textContent = v; el.classList.remove("placeholder-text"); }
  });
  setAll("[data-year]", new Date().getFullYear());
}

function drawCoins() {
  const g = $("#coins"); if (!g) return;
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const ns = "http://www.w3.org/2000/svg"; const placed = []; let tries = 0;
  const circle = (x, y, r, fill) => { const c = document.createElementNS(ns, "circle"); c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", r); c.setAttribute("fill", fill); return c; };
  while (placed.length < 16 && tries++ < 600) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 135, x = 200 + Math.cos(a) * r, y = 200 + Math.sin(a) * r, s = 16 + rnd() * 8;
    if (placed.some(p => Math.hypot(p.x - x, p.y - y) < p.s + s + 4)) continue;
    placed.push({ x, y, s });
    g.append(circle(x, y, s, "#C9781F"), circle(x - 1.5, y - 1.5, s - 4, "#F3B94A"), circle(x - 1.5, y - 1.5, s * .35, "#E39A2E"));
  }
}

/* ---------- Mobile menu ---------- */
const toggle = $(".menu-toggle"), nav = $("#site-nav");
toggle?.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  toggle.setAttribute("aria-expanded", open);
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  nav.classList.toggle("open", open);
});

/* ---------- Boot ---------- */
function renderAll() { renderCombos(); renderUnits(); reconcileBasket(); renderBasket(false); fillBank(); }

drawCoins();
fillConfig();
updateStatus();
setInterval(updateStatus, 30000);
wireImages();
if (sb) {
  document.documentElement.classList.add("menu-loading");
  loadFromDatabase().finally(() => { document.documentElement.classList.remove("menu-loading"); renderAll(); });
} else renderAll();

document.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  if (add) {
    const m = byId(add.dataset.add);
    if (m) {
      const sel = document.getElementById("opt-" + m.id);
      const opt = m.options?.length ? (sel?.value || m.options[0]) : "";
      addLine(m.id, opt && m.kind === "combo" ? `${m.option_label || "Option"}: ${opt}` : opt);
    }
  }
  const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
  if (inc) { basket[+inc.dataset.inc].qty++; save(); renderBasket(false); }
  if (dec) { const i = +dec.dataset.dec; basket[i].qty--; if (basket[i].qty <= 0) basket.splice(i, 1); save(); renderBasket(false); }
  const copy = e.target.closest("[data-copy]");
  if (copy) {
    const text = document.querySelector(copy.dataset.copy)?.textContent || "";
    navigator.clipboard?.writeText(text).then(() => toast("Account number copied"), () => toast(text));
  }
});
$("#basket-form")?.addEventListener("submit", sendOrder);

requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("loaded")));
