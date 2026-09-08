const lists = {
  acceptances: document.getElementById("acceptances"),
  rejections: document.getElementById("rejections"),
  progress: document.getElementById("progress"),
};

let data = {
  lastScanAt: null,
  account: "",
  newSinceLastScan: { acceptances: 0, rejections: 0 },
  acceptances: [],
  rejections: [],
  inProgress: [],
};

function formatDate(value) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function card(item, kind) {
  const article = document.createElement("article");
  article.className = "card";
  article.innerHTML = `
    <span class="tag ${kind}">${kind === "offer" ? "Accepted" : kind === "reject" ? "Rejected" : "Waiting"}</span>
    <header>
      <h3 class="company"></h3>
      <span class="date"></span>
    </header>
    <p class="role"></p>
    <p class="reason"></p>
    <p class="excerpt"></p>
  `;
  article.querySelector(".company").textContent = item.company || "Unknown company";
  article.querySelector(".date").textContent = formatDate(item.date);
  article.querySelector(".role").textContent = item.role || "Role not specified";
  article.querySelector(".reason").textContent = item.reason || "";
  article.querySelector(".excerpt").textContent = item.excerpt ? `“${item.excerpt}”` : "";
  return article;
}

function empty(text) {
  const div = document.createElement("div");
  div.className = "empty";
  div.textContent = text;
  return div;
}

function matches(item, query) {
  if (!query) return true;
  const blob = `${item.company} ${item.role} ${item.subject} ${item.reason}`.toLowerCase();
  return blob.includes(query);
}

function render() {
  const query = document.getElementById("q").value.trim().toLowerCase();
  const onlyNew = document.querySelector("[data-filter].active")?.dataset.filter === "new";
  const cutoff = data.lastScanAt
    ? new Date(new Date(data.lastScanAt).getTime() - 36 * 60 * 60 * 1000)
    : null;

  function isNew(item) {
    if (!onlyNew || !cutoff || !item.date) return true;
    return new Date(item.date) >= cutoff;
  }

  const offers = data.acceptances.filter((item) => matches(item, query) && isNew(item));
  const rejects = data.rejections.filter((item) => matches(item, query) && isNew(item));
  const waiting = (data.inProgress || []).filter((item) => matches(item, query));

  document.getElementById("n-offers").textContent = data.acceptances.length;
  document.getElementById("n-rejects").textContent = data.rejections.length;
  document.getElementById("n-progress").textContent = (data.inProgress || []).length;
  document.getElementById("meta").innerHTML = data.lastScanAt
    ? `Last scan ${formatDate(data.lastScanAt)}<br>${data.account || ""}`
    : "No scan data yet";

  lists.acceptances.replaceChildren(
    ...offers.map((item) => card(item, "offer")),
  );
  if (!offers.length) {
    lists.acceptances.append(empty("No acceptances yet. New offers will land here."));
  }

  lists.rejections.replaceChildren(
    ...rejects.map((item) => card(item, "reject")),
  );
  if (!rejects.length) {
    lists.rejections.append(empty(onlyNew ? "No new rejections in this scan." : "No rejections found."));
  }

  lists.progress.replaceChildren(
    ...waiting.map((item) => card(item, "wait")),
  );
  if (!waiting.length) {
    lists.progress.append(empty("No open processes waiting on a decision."));
  }
}

document.getElementById("q").addEventListener("input", render);
document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach((el) => el.classList.remove("active"));
    button.classList.add("active");
    render();
  });
});

fetch("data/jobs.json", { cache: "no-store" })
  .then((res) => {
    if (!res.ok) throw new Error("Missing jobs.json");
    return res.json();
  })
  .then((json) => {
    data = json;
    render();
  })
  .catch(() => {
    document.getElementById("meta").textContent = "Could not load data/jobs.json. Open this folder via a web server or GitHub Pages.";
    render();
  });
