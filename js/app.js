const configured =
  !SUPABASE_URL.includes("COLE_AQUI") &&
  !SUPABASE_ANON_KEY.includes("COLE_AQUI");

const db = configured
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

let pointsCache = [];
let eventsCache = [];

const $ = id => document.getElementById(id);

function showStatus(message, isError = false) {
  const box = $("statusBox");
  box.textContent = message;
  box.classList.remove("hidden", "error");
  if (isError) box.classList.add("error");
  setTimeout(() => box.classList.add("hidden"), 6000);
}

function ensureConfigured() {
  if (!configured) {
    showStatus("Configure o Supabase em js/config.js antes de usar o banco de dados.", true);
    return false;
  }
  return true;
}

function cleanMaterials(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function openMap(address, lat, lng) {
  const q = encodeURIComponent(`${lat},${lng} ${address || ""}`);
  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
}
window.openMap = openMap;

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("pt-BR");
}

function renderCard(item, distance = null, admin = false) {
  const isEvent = item instanceof RecyclingEvent;
  const details = isEvent
    ? `<div class="meta"><strong>Organizador:</strong> ${escapeHtml(item.organizer || "Não informado")}<br>
       <strong>Quando:</strong> ${formatDate(item.start_at)} até ${formatDate(item.end_at)}</div>`
    : `<div class="meta"><strong>Horário:</strong> ${escapeHtml(item.opening_hours || "Não informado")}<br>
       <strong>Contato:</strong> ${escapeHtml(item.contact || "Não informado")}</div>`;

  const editFn = isEvent ? `editEvent('${item.id}')` : `editPoint('${item.id}')`;
  const deleteFn = isEvent ? `deleteEvent('${item.id}')` : `deletePoint('${item.id}')`;

  return `
    <article class="item-card">
      <div class="item-head">
        <div>
          <span class="badge">${escapeHtml(item.getTypeLabel())}</span>
          <h3>${escapeHtml(item.name)}</h3>
        </div>
        ${distance !== null ? `<span class="distance">${distance.toFixed(1)} km</span>` : ""}
      </div>
      <div class="meta"><strong>Endereço:</strong> ${escapeHtml(item.address.fullAddress)}</div>
      <div class="tags">${item.materials.map(m => `<span class="tag">${escapeHtml(m)}</span>`).join("")}</div>
      ${details}
      <div class="actions">
        <button class="secondary" onclick="openMap('${escapeHtml(item.address.fullAddress)}', ${item.address.latitude}, ${item.address.longitude})">Abrir no mapa</button>
        ${admin ? `
          <button class="ghost" onclick="${editFn}">Editar</button>
          <button class="danger" onclick="${deleteFn}">Excluir</button>
        ` : ""}
      </div>
    </article>`;
}

async function loadAll() {
  if (!ensureConfigured()) return;
  const [{ data: points, error: pError }, { data: events, error: eError }] = await Promise.all([
    db.from("collection_points").select("*").order("name"),
    db.from("recycling_events").select("*").order("start_at")
  ]);

  if (pError || eError) {
    showStatus((pError || eError).message, true);
    return;
  }

  pointsCache = (points || []).map(p => new CollectionPoint(p));
  eventsCache = (events || []).map(e => new RecyclingEvent(e));

  renderAllLists();
  fillMaterials();
}

function renderAllLists() {
  $("pointsList").innerHTML = pointsCache.length
    ? pointsCache.map(p => renderCard(p, null, true)).join("")
    : `<div class="empty">Nenhum ponto cadastrado.</div>`;

  $("eventsList").innerHTML = eventsCache.length
    ? eventsCache.map(e => renderCard(e, null, true)).join("")
    : `<div class="empty">Nenhum evento cadastrado.</div>`;
}

function fillMaterials() {
  const set = new Set();
  [...pointsCache, ...eventsCache].forEach(x => x.materials.forEach(m => set.add(m)));
  const select = $("searchMaterial");
  const current = select.value;
  select.innerHTML = `<option value="">Todos os materiais</option>` +
    [...set].sort((a,b)=>a.localeCompare(b)).map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join("");
  select.value = current;
}

$("btnLocation").addEventListener("click", () => {
  if (!navigator.geolocation) {
    showStatus("Seu navegador não oferece geolocalização.", true);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      $("userLat").value = pos.coords.latitude.toFixed(6);
      $("userLng").value = pos.coords.longitude.toFixed(6);
      showStatus("Localização obtida com sucesso.");
    },
    err => showStatus("Não foi possível obter a localização: " + err.message, true),
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

$("btnSearch").addEventListener("click", () => {
  const lat = Number($("userLat").value);
  const lng = Number($("userLng").value);
  const material = $("searchMaterial").value.toLowerCase();
  const radius = Number($("searchRadius").value);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    showStatus("Informe a localização antes de buscar.", true);
    return;
  }

  const all = [...pointsCache, ...eventsCache];
  const results = all
    .map(item => ({ item, distance: item.distanceFrom(lat, lng) }))
    .filter(x => x.distance <= radius)
    .filter(x => !material || x.item.materials.some(m => m.toLowerCase() === material))
    .sort((a,b) => a.distance - b.distance);

  $("resultCount").textContent = `${results.length} resultado(s)`;
  $("searchResults").innerHTML = results.length
    ? results.map(x => renderCard(x.item, x.distance, false)).join("")
    : `<div class="empty">Nenhum destino encontrado com os filtros informados.</div>`;
});

$("pointForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!ensureConfigured()) return;

  const id = $("pointId").value;
  const payload = {
    name: $("pointName").value.trim(),
    category: $("pointCategory").value,
    address: $("pointAddress").value.trim(),
    latitude: Number($("pointLat").value),
    longitude: Number($("pointLng").value),
    materials: cleanMaterials($("pointMaterials").value),
    opening_hours: $("pointHours").value.trim(),
    contact: $("pointContact").value.trim(),
    notes: $("pointNotes").value.trim()
  };

  const query = id
    ? db.from("collection_points").update(payload).eq("id", id)
    : db.from("collection_points").insert(payload);

  const { error } = await query;
  if (error) return showStatus(error.message, true);

  showStatus(id ? "Ponto atualizado." : "Ponto cadastrado.");
  resetPointForm();
  await loadAll();
});

$("eventForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!ensureConfigured()) return;

  const id = $("eventId").value;
  const payload = {
    name: $("eventName").value.trim(),
    organizer: $("eventOrganizer").value.trim(),
    address: $("eventAddress").value.trim(),
    latitude: Number($("eventLat").value),
    longitude: Number($("eventLng").value),
    materials: cleanMaterials($("eventMaterials").value),
    start_at: new Date($("eventStart").value).toISOString(),
    end_at: new Date($("eventEnd").value).toISOString(),
    description: $("eventDescription").value.trim()
  };

  const query = id
    ? db.from("recycling_events").update(payload).eq("id", id)
    : db.from("recycling_events").insert(payload);

  const { error } = await query;
  if (error) return showStatus(error.message, true);

  showStatus(id ? "Evento atualizado." : "Evento cadastrado.");
  resetEventForm();
  await loadAll();
});

function setView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === id));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav-btn").forEach(btn =>
  btn.addEventListener("click", () => setView(btn.dataset.view))
);

document.querySelectorAll(".tab").forEach(btn =>
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
    document.querySelectorAll(".form-wrap").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    $(btn.dataset.form).classList.add("active");
  })
);

document.querySelectorAll(".go-admin").forEach(btn =>
  btn.addEventListener("click", () => {
    setView("admin");
    const target = btn.dataset.type === "event" ? "eventFormWrap" : "pointFormWrap";
    document.querySelectorAll(".tab").forEach(x => x.classList.toggle("active", x.dataset.form === target));
    document.querySelectorAll(".form-wrap").forEach(x => x.classList.toggle("active", x.id === target));
  })
);

function isoLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

window.editPoint = id => {
  const p = pointsCache.find(x => x.id === id);
  if (!p) return;
  setView("admin");
  document.querySelector('[data-form="pointFormWrap"]').click();
  $("pointId").value = p.id;
  $("pointName").value = p.name;
  $("pointCategory").value = p.category || "Ecoponto";
  $("pointAddress").value = p.address.fullAddress;
  $("pointLat").value = p.address.latitude;
  $("pointLng").value = p.address.longitude;
  $("pointMaterials").value = p.materials.join(", ");
  $("pointHours").value = p.opening_hours || "";
  $("pointContact").value = p.contact || "";
  $("pointNotes").value = p.notes || "";
  $("pointFormTitle").textContent = "Editar ponto de coleta";
  $("cancelPointEdit").classList.remove("hidden");
};

window.editEvent = id => {
  const e = eventsCache.find(x => x.id === id);
  if (!e) return;
  setView("admin");
  document.querySelector('[data-form="eventFormWrap"]').click();
  $("eventId").value = e.id;
  $("eventName").value = e.name;
  $("eventOrganizer").value = e.organizer || "";
  $("eventAddress").value = e.address.fullAddress;
  $("eventLat").value = e.address.latitude;
  $("eventLng").value = e.address.longitude;
  $("eventMaterials").value = e.materials.join(", ");
  $("eventStart").value = isoLocal(e.start_at);
  $("eventEnd").value = isoLocal(e.end_at);
  $("eventDescription").value = e.description || "";
  $("eventFormTitle").textContent = "Editar evento";
  $("cancelEventEdit").classList.remove("hidden");
};

window.deletePoint = async id => {
  if (!confirm("Excluir este ponto de coleta?")) return;
  const { error } = await db.from("collection_points").delete().eq("id", id);
  if (error) return showStatus(error.message, true);
  showStatus("Ponto excluído.");
  await loadAll();
};

window.deleteEvent = async id => {
  if (!confirm("Excluir este evento?")) return;
  const { error } = await db.from("recycling_events").delete().eq("id", id);
  if (error) return showStatus(error.message, true);
  showStatus("Evento excluído.");
  await loadAll();
};

function resetPointForm() {
  $("pointForm").reset();
  $("pointId").value = "";
  $("pointFormTitle").textContent = "Novo ponto de coleta";
  $("cancelPointEdit").classList.add("hidden");
}
function resetEventForm() {
  $("eventForm").reset();
  $("eventId").value = "";
  $("eventFormTitle").textContent = "Novo evento";
  $("cancelEventEdit").classList.add("hidden");
}
$("cancelPointEdit").addEventListener("click", resetPointForm);
$("cancelEventEdit").addEventListener("click", resetEventForm);

if (configured) {
  loadAll();
} else {
  $("searchResults").innerHTML =
    `<div class="empty">O site está pronto. Falta somente conectar o Supabase em <strong>js/config.js</strong>.</div>`;
}
