const feed = document.getElementById("feed");
const hero = document.getElementById("hero");
const heroList = document.getElementById("hero-list");

let data = {
  lastScanAt: null,
  account: "",
  windowDays: 30,
  acceptances: [],
  rejections: [],
  important: [],
};

let view = "all";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function matches(item, query) {
  if (!query) return true;
  return `${item.company} ${item.role} ${item.subject} ${item.reason} ${item.excerpt}`
    .toLowerCase()
    .includes(query);
}

function row(item, kind, label) {
  const el = document.createElement("article");
  el.className = `row ${kind}`;
  el.innerHTML = `
    <span class="tick"></span>
    <div>
      <h3 class="who"></h3>
      <p class="role"></p>
      <p class="why"></p>
      <p class="excerpt"></p>
    </div>
    <div class="meta-col">
      <span class="badge"></span>
      <span class="when"></span>
    </div>
  `;
  el.querySelector(".who").textContent = item.company || "Unknown sender";
  el.querySelector(".role").textContent = item.role || item.subject || "";
  el.querySelector(".why").textContent = item.reason || "";
  el.querySelector(".excerpt").textContent = item.excerpt || "";
  el.querySelector(".badge").textContent = label;
  el.querySelector(".when").textContent = formatDate(item.date);
  return el;
}

function render() {
  const query = document.getElementById("q").value.trim().toLowerCase();
  const offers = (data.acceptances || []).filter((item) => matches(item, query));
  const rejects = (data.rejections || []).filter((item) => matches(item, query));
  const important = (data.important || []).filter((item) => matches(item, query));

  document.getElementById("n-offers").textContent = (data.acceptances || []).length;
  document.getElementById("n-rejects").textContent = (data.rejections || []).length;
  document.getElementById("n-important").textContent = (data.important || []).length;
  document.getElementById("window-label").textContent = `Last ${data.windowDays || 30} days`;
  document.getElementById("meta").textContent = data.lastScanAt
    ? `Scanned ${formatDate(data.lastScanAt)}\n${data.account || ""}`
    : "No scan yet";

  const showHero = view === "all" && important.length && !query;
  hero.hidden = !showHero;
  heroList.replaceChildren();
  if (showHero) {
    important.slice(0, 4).forEach((item) => heroList.append(row(item, "important", "Important")));
  }

  const groups = [];
  if (view === "all" || view === "offer") groups.push(...offers.map((item) => ["offer", "Offer", item]));
  if (view === "all" || view === "reject") groups.push(...rejects.map((item) => ["reject", "Rejected", item]));
  if (view === "important" || (view === "all" && query)) {
    groups.push(...important.map((item) => ["important", "Important", item]));
  }

  groups.sort((a, b) => String(b[2].date).localeCompare(String(a[2].date)));
  feed.replaceChildren();
  if (!groups.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Nothing in this view for the last 30 days.";
    feed.append(empty);
    return;
  }
  groups.forEach(([kind, label, item]) => feed.append(row(item, kind, label)));
}

document.getElementById("q").addEventListener("input", render);
document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-view]").forEach((el) => el.classList.remove("active"));
    button.classList.add("active");
    view = button.dataset.view;
    render();
  });
});

fetch("data/jobs.json", { cache: "no-store" })
  .then((res) => {
    if (!res.ok) throw new Error("missing json");
    return res.json();
  })
  .then((json) => {
    data = json;
    render();
  })
  .catch(() => {
    document.getElementById("meta").textContent = "Could not load data/jobs.json";
    render();
  });
