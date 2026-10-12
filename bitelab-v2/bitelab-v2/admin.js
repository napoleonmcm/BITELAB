/* Bite Lab owner dashboard. Reads CONFIG from config.js. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const naira = n => "₦" + Number(n || 0).toLocaleString("en-NG");
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const STATUSES = ["New", "Confirmed", "Preparing", "Out for delivery", "Delivered", "Cancelled"];
  const ACTIVE = ["New", "Confirmed", "Preparing", "Out for delivery"];
  const SOURCES = { website: "Website", "walk-in": "Walk-in", phone: "Phone", whatsapp: "WhatsApp" };
  const LAGOS = 3600e3; // Lagos is UTC+1 all year

  let sb = null, orders = [], menu = [], settings = {}, filter = "active", period = "today", search = "";
  let audioCtx = null, channel = null, pollTimer = null;

  /* ---------- Screens ---------- */
  const screens = ["screen-setup", "screen-login", "screen-reset", "screen-denied"];
  function show(id) {
    screens.forEach(s => $("#" + s).hidden = s !== id);
    $("#app").hidden = id !== "app";
  }

  let toastTimer;
  function toast(text) {
    const t = $("#toast"); t.textContent = text; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
  }

  /* ---------- Time helpers (Lagos) ---------- */
  const lagos = d => new Date(new Date(d).getTime() + LAGOS); // read with getUTC*
  function startOf(kind, now = new Date()) {
    const l = lagos(now);
    let y = l.getUTCFullYear(), m = l.getUTCMonth(), d = l.getUTCDate();
    if (kind === "week") { const dow = (l.getUTCDay() + 6) % 7; d -= dow; } // Monday start
    if (kind === "month") d = 1;
    return new Date(Date.UTC(y, m, d) - LAGOS);
  }
  const fmtTime = d => lagos(d).toISOString().slice(11, 16);
  const fmtDay = d => { const l = lagos(d); return l.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }); };
  function ago(d) {
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + " min ago";
    if (startOf("today") <= new Date(d)) return "today " + fmtTime(d);
    return fmtDay(d) + ", " + fmtTime(d);
  }

  /* ---------- Data ---------- */
  async function loadOrders() {
    const since = new Date(Math.min(startOf("month"), startOf("week")) - 7 * 864e5).toISOString();
    const { data, error } = await sb.from("orders").select("*")
      .or(`created_at.gte.${since},status.in.(New,Confirmed,Preparing,"Out for delivery")`)
      .order("created_at", { ascending: false }).limit(1000);
    if (error) { toast("Couldn't load orders. Check your connection."); return; }
    orders = data || [];
    renderOrders(); renderSales();
  }
  async function loadMenu() {
    const { data, error } = await sb.from("menu_items").select("*").order("sort");
    if (!error) { menu = data || []; renderMenu(); }
  }
  async function loadSettings() {
    const { data } = await sb.from("settings").select("key,value");
    settings = Object.fromEntries((data || []).map(r => [r.key, r.value]));
    $("#s-fee").value = settings.delivery_fee ?? 500;
    const b = settings.bank || {};
    $("#s-bank").value = b.name || ""; $("#s-num").value = b.number || ""; $("#s-acct").value = b.accountName || "";
  }

  /* ---------- Orders ---------- */
  const waNumber = p => { const d = String(p || "").replace(/\D/g, ""); return d.startsWith("234") ? d : d.startsWith("0") ? "234" + d.slice(1) : d; };
  function statusMessage(o) {
    const first = (o.customer_name || "").split(" ")[0] || "there";
    const m = {
      New: `Hi ${first}, we've received your Bite Lab order ${o.ref} (${naira(o.total)}). We'll confirm it shortly.`,
      Confirmed: `Hi ${first}, your Bite Lab order ${o.ref} is confirmed${o.payment_status === "paid" ? " and paid. Thank you!" : ". Please send your transfer screenshot if you haven't yet."}`,
      Preparing: `Hi ${first}, your Bite Lab order ${o.ref} is being prepared now.`,
      "Out for delivery": `Hi ${first}, your Bite Lab order ${o.ref} is on its way to ${o.address || "you"}${o.room ? ", " + o.room : ""}.`,
      Delivered: `Hi ${first}, your Bite Lab order ${o.ref} has been delivered. Enjoy, and thank you for ordering!`,
      Cancelled: `Hi ${first}, your Bite Lab order ${o.ref} has been cancelled. Message us if you have any questions.`
    };
    return m[o.status] || m.New;
  }

  function orderCard(o) {
    const items = (o.items || []).map(i => `<li><span>${i.qty} × ${esc(i.name)}${i.option ? ` <em>(${esc(i.option)})</em>` : ""}</span><span>${naira(i.line_total ?? i.price * i.qty)}</span></li>`).join("");
    const phone = o.phone ? `<a href="tel:${esc(o.phone)}">${esc(o.phone)}</a>` : "";
    const where = [o.address, o.room].filter(Boolean).map(esc).join(", ");
    return `
    <article class="order s-${o.status.replace(/\s/g, "-")}" data-id="${o.id}">
      <div class="order-top">
        <div><p class="ref">${esc(o.ref)}</p><p class="muted small">${ago(o.created_at)} · ${SOURCES[o.source] || o.source}</p></div>
        <p class="amount">${naira(o.total)}</p>
      </div>
      <p class="who"><strong>${esc(o.customer_name || "No name")}</strong>${phone ? " · " + phone : ""}</p>
      ${where ? `<p class="muted small">${where}</p>` : ""}
      <ul class="items">${items}</ul>
      ${o.delivery_fee ? `<p class="muted small">Includes ${naira(o.delivery_fee)} delivery</p>` : ""}
      ${o.note ? `<p class="note">“${esc(o.note)}”</p>` : ""}
      <div class="order-actions">
        <label class="sr" for="st-${o.id}">Status</label>
        <select id="st-${o.id}" data-status-for="${o.id}">${STATUSES.map(s => `<option${s === o.status ? " selected" : ""}>${s}</option>`).join("")}</select>
        <button type="button" class="pay ${o.payment_status}" data-pay-for="${o.id}">${o.payment_status === "paid" ? "Paid ✓" : o.payment_status === "refunded" ? "Refunded" : "Mark paid"}</button>
        ${o.phone ? `<a class="btn btn-ghost small-btn" target="_blank" rel="noopener" href="https://wa.me/${waNumber(o.phone)}?text=${encodeURIComponent(statusMessage(o))}">WhatsApp update</a>` : ""}
      </div>
    </article>`;
  }

  function renderOrders() {
    const q = search.toLowerCase();
    const list = orders.filter(o =>
      (filter === "all" || (filter === "active" ? ACTIVE.includes(o.status) : o.status === filter)) &&
      (!q || [o.ref, o.customer_name, o.phone].some(v => String(v || "").toLowerCase().includes(q))));
    $("#n-active").textContent = orders.filter(o => ACTIVE.includes(o.status)).length;
    $("#order-list").innerHTML = list.length ? list.map(orderCard).join("")
      : `<div class="empty"><p><strong>${filter === "active" ? "No open orders" : "No orders here"}</strong></p><p class="muted small">${filter === "active" ? "New website orders appear here as soon as customers send them." : "Try another filter."}</p></div>`;
  }

  async function updateOrder(id, patch, okText) {
    const o = orders.find(x => x.id === id); if (!o) return;
    const before = { ...o };
    Object.assign(o, patch); renderOrders(); renderSales();
    const { error } = await sb.from("orders").update(patch).eq("id", id);
    if (error) { Object.assign(o, before); renderOrders(); renderSales(); toast("Couldn't save. Try again."); }
    else if (okText) toast(okText);
  }

  /* ---------- Add order by hand ---------- */
  let draft = null;
  function openAddOrder() {
    draft = { source: "walk-in", name: "", phone: "", address: "", room: "", lines: {}, delivery: false, paid: true };
    $("#sheet-title").textContent = "Add order";
    renderDraft(); openSheet();
  }
  function draftTotals() {
    let sub = 0; const items = [];
    for (const [key, qty] of Object.entries(draft.lines)) {
      if (!qty) continue;
      const [id, option] = key.split("|"); const m = menu.find(x => x.id === id); if (!m) continue;
      items.push({ id, name: m.kind === "combo" ? m.name + " combo" : m.name, option: option || null, qty, price: m.price, line_total: m.price * qty });
      sub += m.price * qty;
    }
    const fee = draft.delivery ? Number(settings.delivery_fee ?? 500) : 0;
    return { items, sub, fee, total: sub + fee };
  }
  function renderDraft() {
    const t = draftTotals();
    const rows = menu.map(m => {
      const opts = m.options?.length ? m.options : [""];
      return opts.map(op => {
        const key = m.id + "|" + op; const qty = draft.lines[key] || 0;
        return `<li class="pick${qty ? " has" : ""}"><span>${esc(m.name)}${op ? ` <em>${esc(op)}</em>` : ""}<br><span class="muted small">${naira(m.price)}${m.available ? "" : " · switched off"}</span></span>
          <span class="stepper"><button type="button" data-step="${esc(key)}" data-d="-1" aria-label="One less ${esc(m.name)} ${esc(op)}">−</button><output>${qty}</output><button type="button" data-step="${esc(key)}" data-d="1" aria-label="One more ${esc(m.name)} ${esc(op)}">+</button></span></li>`;
      }).join("");
    }).join("");
    $("#sheet-body").innerHTML = `
      <form id="draft-form" class="form" novalidate>
        <label for="d-source">Where did the order come from?</label>
        <select id="d-source">${["walk-in", "phone", "whatsapp"].map(s => `<option value="${s}"${draft.source === s ? " selected" : ""}>${SOURCES[s]}</option>`).join("")}</select>
        <label for="d-name">Customer name (optional)</label><input id="d-name" value="${esc(draft.name)}">
        <label for="d-phone">Phone (optional)</label><input id="d-phone" type="tel" value="${esc(draft.phone)}">
        <label for="d-address">Lodge or street (optional)</label><input id="d-address" value="${esc(draft.address)}">
        <label for="d-room">Room (optional)</label><input id="d-room" value="${esc(draft.room)}">
        <p class="label">Items</p>
        <ul class="picker">${rows}</ul>
        <label class="check"><input type="checkbox" id="d-delivery"${draft.delivery ? " checked" : ""}> Add delivery fee (${naira(settings.delivery_fee ?? 500)})</label>
        <label class="check"><input type="checkbox" id="d-paid"${draft.paid ? " checked" : ""}> Already paid</label>
        <div class="draft-total"><span>Total</span><strong>${naira(t.total)}</strong></div>
        <button class="btn btn-red btn-block" type="submit"${t.items.length ? "" : " disabled"}>Save order</button>
      </form>`;
  }
  function readDraftFields() {
    if (!$("#draft-form")) return;
    draft.source = $("#d-source").value; draft.name = $("#d-name").value.trim(); draft.phone = $("#d-phone").value.trim();
    draft.address = $("#d-address").value.trim(); draft.room = $("#d-room").value.trim();
    draft.delivery = $("#d-delivery").checked; draft.paid = $("#d-paid").checked;
  }
  async function saveDraft() {
    readDraftFields();
    const t = draftTotals(); if (!t.items.length) return;
    const l = lagos(new Date());
    for (let attempt = 0; attempt < 3; attempt++) {
      const ref = `BL-${String(l.getUTCDate()).padStart(2, "0")}${String(l.getUTCMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
      const row = { ref, source: draft.source, customer_name: draft.name || SOURCES[draft.source] + " customer", phone: draft.phone.replace(/[^\d+]/g, ""),
        address: draft.address, room: draft.room, items: t.items, subtotal: t.sub, delivery_fee: t.fee, total: t.total,
        payment_status: draft.paid ? "paid" : "unpaid", status: draft.paid && draft.source === "walk-in" ? "Delivered" : "Confirmed" };
      const { data, error } = await sb.from("orders").insert(row).select().single();
      if (!error) { orders.unshift(data); renderOrders(); renderSales(); closeSheet(); toast(`Order ${ref} saved`); return; }
      if (!String(error.message).includes("duplicate")) break;
    }
    toast("Couldn't save the order. Try again.");
  }

  /* ---------- Menu ---------- */
  const SECTION_NAMES = { combo: "Combos", main: "Single items", new: "New on the menu", noodles: "Noodles" };
  function renderMenu() {
    const groups = { combo: [], main: [], new: [], noodles: [] };
    menu.forEach(m => (m.kind === "combo" ? groups.combo : groups[m.section] || groups.main).push(m));
    $("#menu-list").innerHTML = Object.entries(groups).filter(([, l]) => l.length).map(([k, l]) => `
      <div class="card"><h2>${SECTION_NAMES[k]}</h2><ul class="menu-rows">${l.map(m => `
        <li class="menu-row${m.available ? "" : " off"}">
          <div class="mr-info"><p><strong>${esc(m.name)}</strong>${m.badge ? ` <span class="tag">${esc(m.badge)}</span>` : ""}</p><p class="muted small">${naira(m.price)}${m.options?.length ? " · " + m.options.map(esc).join(", ") : ""}${m.builder?.extras?.length ? " · extras: " + m.builder.extras.map(x => esc(x.name) + " " + naira(x.price)).join(", ") : ""}</p></div>
          <label class="switch"><input type="checkbox" data-avail="${esc(m.id)}"${m.available ? " checked" : ""}><span aria-hidden="true"></span><span class="sr">${esc(m.name)} on the website</span></label>
          <button class="btn btn-ghost small-btn" type="button" data-edit="${esc(m.id)}">Edit</button>
        </li>`).join("")}</ul></div>`).join("") || `<div class="empty"><p>No menu items yet.</p></div>`;
  }

  function slugify(s) { return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").slice(0, 40) || "item"; }
  function openItem(id) {
    const m = id ? menu.find(x => x.id === id) : { id: "", kind: "item", section: "main", builder: {}, name: "", price: "", description: "", contents: [], options: [], option_label: "", badge: "", available: true, image: "", sort: (menu.at(-1)?.sort || 100) + 10 };
    $("#sheet-title").textContent = id ? "Edit item" : "Add item";
    $("#sheet-body").innerHTML = `
      <form id="item-form" class="form" novalidate data-id="${esc(m.id)}">
        <label for="i-name">Name</label><input id="i-name" required value="${esc(m.name)}">
        <label for="i-price">Price (₦)</label><input id="i-price" type="number" inputmode="numeric" min="0" required value="${esc(m.price)}">
        <label for="i-kind">Type</label>
        <select id="i-kind"><option value="item"${m.kind === "item" ? " selected" : ""}>Single item</option><option value="combo"${m.kind === "combo" ? " selected" : ""}>Combo</option></select>
        <label for="i-section">Show it in</label>
        <select id="i-section">${[["main", "Single items / combos"], ["new", "New on the menu"], ["noodles", "Noodles section"]].map(([v, t]) => `<option value="${v}"${m.section === v ? " selected" : ""}>${t}</option>`).join("")}</select>
        <label for="i-desc">Description</label><textarea id="i-desc" rows="2">${esc(m.description)}</textarea>
        <label for="i-contents">What's in it (combos only, one per line)</label><textarea id="i-contents" rows="3">${esc((m.contents || []).join("\n"))}</textarea>
        <label for="i-options">Choices customers pick from (comma separated)</label><input id="i-options" placeholder="e.g. Vanilla, Strawberry" value="${esc((m.options || []).join(", "))}">
        <label for="i-optlabel">Name of the choice</label><input id="i-optlabel" placeholder="e.g. Flavour" value="${esc(m.option_label)}">
        <fieldset class="builder-fields">
          <legend>Build-your-own (noodles)</legend>
          <label for="i-removable">Ingredients customers can leave out (comma separated)</label><input id="i-removable" placeholder="e.g. Carrot, Sausage, Pepper, Onions" value="${esc((m.builder?.removable || []).join(", "))}">
          <label for="i-extras">Paid extras, one per line as Name = price</label><textarea id="i-extras" rows="4" placeholder="Extra egg = 300">${esc((m.builder?.extras || []).map(x => `${x.name} = ${x.price}`).join("\n"))}</textarea>
          <p class="muted small">Leave both empty for normal items.</p>
        </fieldset>
        <label for="i-badge">Badge (optional)</label><input id="i-badge" placeholder="e.g. New" value="${esc(m.badge)}">
        <label for="i-image">Photo file name or link</label><input id="i-image" placeholder="e.g. yoghurt.png" value="${esc(m.image)}">
        <label for="i-sort">Position (lower shows first)</label><input id="i-sort" type="number" value="${esc(m.sort)}">
        <label class="check"><input type="checkbox" id="i-avail"${m.available ? " checked" : ""}> Show on the website</label>
        <p class="err" id="item-err" hidden></p>
        <button class="btn btn-red btn-block" type="submit">${id ? "Save changes" : "Add to menu"}</button>
        ${id ? `<button class="btn btn-danger btn-block" type="button" id="del-item">Delete item</button>` : ""}
      </form>`;
    openSheet();
  }
  async function saveItem(form) {
    const err = $("#item-err");
    const name = $("#i-name").value.trim(), price = parseInt($("#i-price").value, 10);
    if (!name || !(price >= 0)) { err.textContent = "Add a name and a price."; err.hidden = false; return; }
    const list = s => s.split(/[,\n]/).map(x => x.trim()).filter(Boolean);
    const row = {
      name, price, kind: $("#i-kind").value, section: $("#i-section").value, description: $("#i-desc").value.trim(),
      contents: $("#i-contents").value.split("\n").map(x => x.trim()).filter(Boolean), options: list($("#i-options").value),
      option_label: $("#i-optlabel").value.trim(), badge: $("#i-badge").value.trim(), image: $("#i-image").value.trim(),
      sort: parseInt($("#i-sort").value, 10) || 100, available: $("#i-avail").checked
    };
    const extras = [];
    for (const line of $("#i-extras").value.split("\n").map(x => x.trim()).filter(Boolean)) {
      const m = line.match(/^(.+?)\s*[=:]\s*₦?\s*([\d,]+)\s*$/);
      if (!m) { err.textContent = `Check this extra: "${line}". Write it as Name = price.`; err.hidden = false; return; }
      extras.push({ name: m[1].trim(), price: parseInt(m[2].replace(/,/g, ""), 10) });
    }
    const removable = list($("#i-removable").value);
    row.builder = removable.length || extras.length ? { removable, extras } : {};
    let id = form.dataset.id, res;
    if (id) res = await sb.from("menu_items").update(row).eq("id", id).select().single();
    else {
      id = slugify(name); let n = 2; while (menu.some(m => m.id === id)) id = slugify(name) + "-" + n++;
      res = await sb.from("menu_items").insert({ id, ...row }).select().single();
    }
    if (res.error) { err.textContent = "Couldn't save: " + res.error.message; err.hidden = false; return; }
    const i = menu.findIndex(m => m.id === id);
    if (i >= 0) menu[i] = res.data; else menu.push(res.data);
    menu.sort((a, b) => a.sort - b.sort); renderMenu(); closeSheet(); toast(`${name} saved`);
  }

  /* ---------- Sales ---------- */
  function inPeriod(p) {
    const from = startOf(p === "today" ? "today" : p);
    return orders.filter(o => new Date(o.created_at) >= from);
  }
  function renderSales() {
    const list = inPeriod(period), live = list.filter(o => o.status !== "Cancelled");
    const sales = live.reduce((a, o) => a + o.total, 0);
    const paid = live.filter(o => o.payment_status === "paid").reduce((a, o) => a + o.total, 0);
    const fees = live.reduce((a, o) => a + (o.delivery_fee || 0), 0);
    const from = startOf(period);
    $("#period-label").textContent = period === "today" ? `Today, ${fmtDay(new Date())}` : `${fmtDay(from)} to today`;
    const stat = (label, val, sub) => `<div class="stat"><p class="muted small">${label}</p><p class="big">${val}</p>${sub ? `<p class="muted small">${sub}</p>` : ""}</div>`;
    $("#stats").innerHTML =
      stat("Sales", naira(sales), `${naira(sales - fees)} food + ${naira(fees)} delivery`) +
      stat("Orders", live.length, `${list.length - live.length} cancelled`) +
      stat("Paid", naira(paid), `${naira(sales - paid)} not yet marked paid`) +
      stat("Average order", naira(live.length ? Math.round(sales / live.length) : 0));

    // Best sellers
    const tally = {};
    live.forEach(o => (o.items || []).forEach(i => { const t = tally[i.name] ||= { qty: 0, amt: 0 }; t.qty += i.qty; t.amt += i.line_total ?? i.price * i.qty; }));
    const best = Object.entries(tally).sort((a, b) => b[1].qty - a[1].qty).slice(0, 8);
    $("#best").innerHTML = best.length ? `<table><thead><tr><th>Item</th><th class="num">Sold</th><th class="num">Sales</th></tr></thead><tbody>${best.map(([n, t]) => `<tr><td>${esc(n)}</td><td class="num">${t.qty}</td><td class="num">${naira(t.amt)}</td></tr>`).join("")}</tbody></table>` : `<p class="muted small">No sales in this period yet.</p>`;

    // Busiest hours
    const hours = Array(24).fill(0); live.forEach(o => hours[lagos(o.created_at).getUTCHours()]++);
    const maxH = Math.max(1, ...hours), shown = hours.map((c, h) => [h, c]).filter(([h, c]) => c || (h >= 10 && h <= 21));
    $("#hours").innerHTML = live.length ? shown.map(([h, c]) => `<div class="hbar"><span>${String(h).padStart(2, "0")}:00</span><i style="width:${(c / maxH) * 100}%${c ? "" : ";min-width:0"}"></i><b>${c}</b></div>`).join("") : `<p class="muted small">No orders in this period yet.</p>`;

    renderDailyChart();
  }
  function renderDailyChart() {
    const from = startOf("month"), l = lagos(new Date());
    const days = l.getUTCDate(), totals = Array(days).fill(0);
    orders.filter(o => new Date(o.created_at) >= from && o.status !== "Cancelled")
      .forEach(o => { const d = lagos(o.created_at).getUTCDate() - 1; if (d >= 0 && d < days) totals[d] += o.total; });
    const max = Math.max(...totals, 1), W = 600, H = 180, pad = 28, bw = (W - pad) / Math.max(days, 1);
    const nice = (() => { const p = Math.pow(10, Math.floor(Math.log10(max))); return Math.ceil(max / p) * p; })();
    const y = v => H - 20 - (v / nice) * (H - 34);
    const bars = totals.map((v, i) => `<rect x="${pad + i * bw + 2}" y="${y(v)}" width="${Math.max(bw - 4, 2)}" height="${H - 20 - y(v)}" rx="3" class="${i === days - 1 ? "today" : ""}"><title>${i + 1} ${l.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })}: ${naira(v)}</title></rect>`).join("");
    const labels = totals.map((_, i) => (i === 0 || (i + 1) % 5 === 0 || i === days - 1) ? `<text x="${pad + i * bw + bw / 2}" y="${H - 4}" text-anchor="middle">${i + 1}</text>` : "").join("");
    const grid = [0, .5, 1].map(f => `<line x1="${pad}" x2="${W}" y1="${y(nice * f)}" y2="${y(nice * f)}"/><text x="${pad - 4}" y="${y(nice * f) + 4}" text-anchor="end">${nice * f >= 1000 ? (nice * f / 1000) + "k" : nice * f}</text>`).join("");
    $("#daily-chart").innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Sales per day this month, highest ${naira(Math.max(...totals))}"><g class="grid">${grid}</g><g class="bars">${bars}</g><g class="axis">${labels}</g></svg>`;
  }
  function downloadCSV() {
    const list = inPeriod(period);
    const rows = [["Order", "Date", "Time", "Source", "Status", "Payment", "Customer", "Phone", "Lodge/street", "Room", "Items", "Food", "Delivery", "Total"]];
    list.forEach(o => rows.push([o.ref, lagos(o.created_at).toISOString().slice(0, 10), fmtTime(o.created_at), SOURCES[o.source] || o.source, o.status, o.payment_status,
      o.customer_name, o.phone, o.address, o.room, (o.items || []).map(i => `${i.qty}x ${i.name}${i.option ? " (" + i.option + ")" : ""}`).join("; "), o.subtotal, o.delivery_fee, o.total]));
    const csv = rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" }));
    a.download = `bitelab-sales-${period}-${lagos(new Date()).toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------- Sheet ---------- */
  let lastFocus = null;
  function openSheet() { lastFocus = document.activeElement; $("#scrim").hidden = false; $("#sheet").hidden = false; document.body.classList.add("locked"); setTimeout(() => $("#sheet-close").focus(), 30); }
  function closeSheet() { $("#scrim").hidden = true; $("#sheet").hidden = true; document.body.classList.remove("locked"); lastFocus?.focus?.(); }

  /* ---------- New-order alerts ---------- */
  function beep() {
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = 880; g.gain.setValueAtTime(.2, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + .6);
      o.connect(g).connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + .6);
    } catch (e) {}
  }
  function subscribe() {
    channel = sb.channel("orders-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, payload => {
        if (payload.eventType === "INSERT") {
          if (!orders.some(o => o.id === payload.new.id)) {
            orders.unshift(payload.new);
            if (payload.new.source === "website") { beep(); toast(`New order ${payload.new.ref} · ${naira(payload.new.total)}`); if (currentTab !== "orders") $("#new-dot").hidden = false; }
          }
        } else if (payload.eventType === "UPDATE") {
          const i = orders.findIndex(o => o.id === payload.new.id); if (i >= 0) orders[i] = payload.new;
        } else if (payload.eventType === "DELETE") {
          orders = orders.filter(o => o.id !== payload.old.id);
        }
        renderOrders(); renderSales();
      })
      .subscribe(status => {
        const ok = status === "SUBSCRIBED";
        $("#live").classList.toggle("off", !ok);
        $("#live-text").textContent = ok ? "Live" : "Refreshing every minute";
      });
    pollTimer = setInterval(loadOrders, 60000);
  }

  /* ---------- Tabs ---------- */
  let currentTab = "orders";
  function setTab(t) {
    currentTab = t;
    $$(".tab").forEach(s => s.hidden = s.id !== "tab-" + t);
    $$(".tabbar button").forEach(b => { const on = b.dataset.tab === t; b.classList.toggle("on", on); on ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"); });
    if (t === "orders") $("#new-dot").hidden = true;
    window.scrollTo(0, 0);
  }

  /* ---------- Start ---------- */
  async function enter(session) {
    const { data: ok } = await sb.rpc("is_admin");
    if (!ok) { show("screen-denied"); return; }
    $("#who").textContent = "Signed in as " + (session.user.email || "");
    show("app");
    await Promise.all([loadOrders(), loadMenu(), loadSettings()]);
    if (!channel) subscribe();
  }

  async function init() {
    // CONFIG comes from config.js (a top-level const, so it is not on window)
    if (typeof CONFIG === "undefined" || !CONFIG.supabaseUrl || !CONFIG.supabaseAnonKey || !window.supabase?.createClient) { show("screen-setup"); return; }
    sb = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
    sb.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") show("screen-reset");
      else if (event === "SIGNED_OUT") { channel && sb.removeChannel(channel); channel = null; clearInterval(pollTimer); show("screen-login"); }
    });
    const { data: { session } } = await sb.auth.getSession();
    if (location.hash.includes("type=recovery")) { show("screen-reset"); return; }
    if (session) enter(session); else show("screen-login");
  }

  /* ---------- Events ---------- */
  $("#login-form").addEventListener("submit", async e => {
    e.preventDefault();
    const err = $("#login-err"), btn = $("#login-btn");
    btn.disabled = true; btn.textContent = "Signing in…"; err.hidden = true;
    const { data, error } = await sb.auth.signInWithPassword({ email: $("#l-email").value.trim(), password: $("#l-pass").value });
    btn.disabled = false; btn.textContent = "Sign in";
    if (error) { err.textContent = "Wrong email or password. Try again, or tap Forgot password."; err.hidden = false; return; }
    enter(data.session);
  });
  $("#forgot-btn").addEventListener("click", async () => {
    const email = $("#l-email").value.trim(), err = $("#login-err");
    if (!email) { err.textContent = "Type your email above first, then tap Forgot password."; err.hidden = false; return; }
    await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    err.textContent = "If that email is the owner's, a reset link is on its way. Check your inbox."; err.hidden = false;
  });
  $("#reset-form").addEventListener("submit", async e => {
    e.preventDefault();
    const pass = $("#r-pass").value, err = $("#reset-err");
    if (pass.length < 8) { err.textContent = "Use at least 8 characters."; err.hidden = false; return; }
    const { error } = await sb.auth.updateUser({ password: pass });
    if (error) { err.textContent = "Couldn't save: " + error.message; err.hidden = false; return; }
    history.replaceState(null, "", location.pathname);
    toast("Password saved"); const { data: { session } } = await sb.auth.getSession(); if (session) enter(session); else show("screen-login");
  });
  document.addEventListener("click", async e => {
    const t = e.target;
    if (t.closest("[data-signout]")) { await sb.auth.signOut(); return; }
    const tab = t.closest(".tabbar button"); if (tab) setTab(tab.dataset.tab);
    const f = t.closest("[data-filter]"); if (f) { filter = f.dataset.filter; $$("#order-filters .chip").forEach(c => c.classList.toggle("on", c === f)); renderOrders(); }
    const pe = t.closest("[data-period]"); if (pe) { period = pe.dataset.period; $$("#period-chips .chip").forEach(c => c.classList.toggle("on", c === pe)); renderSales(); }
    const pay = t.closest("[data-pay-for]");
    if (pay) { const o = orders.find(x => x.id === +pay.dataset.payFor); const next = o.payment_status === "paid" ? "unpaid" : "paid"; updateOrder(o.id, { payment_status: next }, next === "paid" ? `${o.ref} marked paid` : `${o.ref} marked unpaid`); }
    if (t.closest("#add-order-btn")) openAddOrder();
    if (t.closest("#add-item-btn")) openItem(null);
    const ed = t.closest("[data-edit]"); if (ed) openItem(ed.dataset.edit);
    if (t.closest("#sheet-close") || t === $("#scrim")) closeSheet();
    if (t.closest("#csv-btn")) downloadCSV();
    const st = t.closest("[data-step]");
    if (st) { readDraftFields(); const k = st.dataset.step; draft.lines[k] = Math.max(0, (draft.lines[k] || 0) + +st.dataset.d); renderDraft(); }
    const del = t.closest("#del-item");
    if (del) {
      if (!del.classList.contains("confirm")) { del.classList.add("confirm"); del.textContent = "Tap again to delete for good"; return; }
      const id = $("#item-form").dataset.id;
      const { error } = await sb.from("menu_items").delete().eq("id", id);
      if (error) { toast("Couldn't delete. Switch it off instead."); return; }
      menu = menu.filter(m => m.id !== id); renderMenu(); closeSheet(); toast("Item deleted");
    }
  });
  document.addEventListener("change", e => {
    const s = e.target.closest("[data-status-for]");
    if (s) { const id = +s.dataset.statusFor; updateOrder(id, { status: s.value }, `Status: ${s.value}`); }
    const av = e.target.closest("[data-avail]");
    if (av) {
      const m = menu.find(x => x.id === av.dataset.avail); const on = av.checked;
      m.available = on; renderMenu();
      sb.from("menu_items").update({ available: on }).eq("id", m.id).then(({ error }) => {
        if (error) { m.available = !on; renderMenu(); toast("Couldn't save. Try again."); }
        else toast(`${m.name} ${on ? "is on the website" : "is hidden from the website"}`);
      });
    }
    if (e.target.closest("#draft-form") && !e.target.closest("[data-step]")) { readDraftFields(); const t = draftTotals(); $(".draft-total strong").textContent = naira(t.total); }
  });
  document.addEventListener("submit", e => {
    if (e.target.id === "draft-form") { e.preventDefault(); saveDraft(); }
    if (e.target.id === "item-form") { e.preventDefault(); saveItem(e.target); }
  });
  $("#settings-form").addEventListener("submit", async e => {
    e.preventDefault();
    const fee = Math.max(0, parseInt($("#s-fee").value, 10) || 0);
    const bank = { name: $("#s-bank").value.trim(), number: $("#s-num").value.trim(), accountName: $("#s-acct").value.trim() };
    const { error } = await sb.from("settings").upsert([{ key: "delivery_fee", value: fee }, { key: "bank", value: bank }]);
    if (error) toast("Couldn't save settings."); else { settings.delivery_fee = fee; settings.bank = bank; toast("Settings saved"); }
  });
  $("#order-search").addEventListener("input", e => { search = e.target.value.trim(); renderOrders(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#sheet").hidden) closeSheet(); });

  init();
})();
