/* ---------------------------------------------------------------
   Data model (in-memory only — add localStorage yourself if you
   want notes to persist across page reloads)
--------------------------------------------------------------- */
const COLORS = [
  { key: "default", label: "Default" },
  { key: "coral", label: "Coral" },
  { key: "peach", label: "Peach" },
  { key: "sand", label: "Sand" },
  { key: "mint", label: "Mint" },
  { key: "sage", label: "Sage" },
  { key: "fog", label: "Fog" },
  { key: "storm", label: "Storm" },
  { key: "dusk", label: "Dusk" },
  { key: "blossom", label: "Blossom" },
  { key: "clay", label: "Clay" },
];

let notes = [
  {
    id: cryptoId(),
    title: "Welcome to Notes",
    text: "Click the composer above to add a note. Try pinning, archiving, or giving it a color!",
    color: "sand",
    pinned: true,
    archived: false,
    trashed: false,
    checklist: false,
    items: [],
  },

  {
    id: cryptoId(),
    title: "Book club",
    text: "Finish chapter 6 before Thursday.",
    color: "fog",
    pinned: false,
    archived: false,
    trashed: false,
    checklist: false,
    items: [],
  },
];

let currentView = "notes"; // notes | archive | trash
let searchQuery = "";
let editingId = null;
const composerState = {
  color: "default",
  pinned: false,
  checklist: false,
  items: [],
};

function cryptoId() {
  return "n_" + Math.random().toString(36).slice(2, 10);
}

/* ---------------------------------------------------------------
   View switching
--------------------------------------------------------------- */
function setView(view) {
  currentView = view;
  document
    .querySelectorAll("#viewNav .nav-link, #viewNavMobile .nav-link")
    .forEach((el) => {
      el.classList.toggle("active", el.dataset.view === view);
    });
  document
    .getElementById("composerWrap")
    .classList.toggle("d-none", view !== "notes");
  editingId = null;
  render();
}
document
  .querySelectorAll("#viewNav .nav-link, #viewNavMobile .nav-link")
  .forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      setView(el.dataset.view);
      const oc = bootstrap.Offcanvas.getInstance(
        document.getElementById("sidebarOffcanvas"),
      );
      if (oc) oc.hide();
    });
  });

document.getElementById("searchInput").addEventListener("input", (e) => {
  searchQuery = e.target.value.toLowerCase();
  syncSearch(e.target.value);
  render();
});
document.getElementById("searchInputMobile").addEventListener("input", (e) => {
  searchQuery = e.target.value.toLowerCase();
  syncSearch(e.target.value);
  render();
});
function syncSearch(val) {
  document.getElementById("searchInput").value = val;
  document.getElementById("searchInputMobile").value = val;
}

/* ---------------------------------------------------------------
   Composer (new note)
--------------------------------------------------------------- */
const composerCard = document.getElementById("composerCard");
const composerTitle = document.getElementById("composerTitle");
const composerText = document.getElementById("composerText");
const composerToolbar = document.getElementById("composerToolbar");
const composerChecklistEl = document.getElementById("composerChecklist");

function pickComposerColor(key) {
  composerState.color = key;
  applyCardColor(composerCard, key);
  buildPalette(
    document.getElementById("composerPalette"),
    key,
    pickComposerColor,
  );
}
buildPalette(
  document.getElementById("composerPalette"),
  composerState.color,
  pickComposerColor,
);

function buildPalette(container, activeKey, onPick) {
  container.innerHTML = "";
  COLORS.forEach((c) => {
    const b = document.createElement("button");
    b.className =
      "swatch note-" + c.key + (c.key === activeKey ? " active" : "");
    b.title = c.label;
    b.type = "button";
    b.onclick = () => onPick(c.key);
    container.appendChild(b);
  });
}

function applyCardColor(cardEl, key) {
  COLORS.forEach((c) => cardEl.classList.remove("note-" + c.key));
  cardEl.classList.add("note-" + key);
}

function expandComposer() {
  composerTitle.classList.remove("d-none");
  composerToolbar.classList.remove("d-none");
  composerToolbar.classList.add("d-flex");
}
composerText.addEventListener("focus", expandComposer);
composerTitle.addEventListener("focus", expandComposer);
composerText.addEventListener("input", () => {
  composerText.style.height = "auto";
  composerText.style.height = composerText.scrollHeight + "px";
});

function toggleComposerChecklist() {
  composerState.checklist = !composerState.checklist;
  composerChecklistEl.classList.toggle("d-none", !composerState.checklist);
  composerText.classList.toggle("d-none", composerState.checklist);
  if (composerState.checklist) {
    if (composerState.items.length === 0)
      composerState.items.push({ text: "", checked: false });
    renderComposerChecklist();
  }
}

function renderComposerChecklist() {
  composerChecklistEl.innerHTML = "";
  composerState.items.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "d-flex align-items-center gap-2 mb-1";
    row.innerHTML = `
      <input type="checkbox" class="form-check-input mt-0" ${item.checked ? "checked" : ""} onchange="composerState.items[${idx}].checked=this.checked">
      <input type="text" class="form-control form-control-sm border-0 px-1" style="background:transparent;" value="${escapeAttr(item.text)}" placeholder="List item"
        oninput="composerState.items[${idx}].text=this.value"
        onkeydown="if(event.key==='Enter'){event.preventDefault(); composerState.items.splice(${idx + 1},0,{text:'',checked:false}); renderComposerChecklist();}">
      <button class="icon-btn btn btn-sm p-0" onclick="composerState.items.splice(${idx},1); if(composerState.items.length===0) composerState.items.push({text:'',checked:false}); renderComposerChecklist();"><i class="bi bi-x"></i></button>
    `;
    composerChecklistEl.appendChild(row);
  });
  const addRow = document.createElement("button");
  addRow.className = "btn btn-sm btn-link text-decoration-none ps-0";
  addRow.textContent = "+ Add item";
  addRow.onclick = () => {
    composerState.items.push({ text: "", checked: false });
    renderComposerChecklist();
  };
  composerChecklistEl.appendChild(addRow);
}

function renderComposerToolbarState() {
  document.getElementById("composerPinBtn").innerHTML = composerState.pinned
    ? '<i class="bi bi-pin-fill fs-6"></i>'
    : '<i class="bi bi-pin fs-6"></i>';
}

function closeComposer() {
  const title = composerTitle.value.trim();
  const text = composerText.value.trim();
  const items = composerState.items.filter((i) => i.text.trim() !== "");
  const hasContent = title || text || items.length > 0;

  if (hasContent) {
    notes.unshift({
      id: cryptoId(),
      title,
      text: composerState.checklist ? "" : text,
      color: composerState.color,
      pinned: composerState.pinned,
      archived: false,
      trashed: false,
      checklist: composerState.checklist,
      items: composerState.checklist ? items : [],
    });
  }

  // reset composer
  composerTitle.value = "";
  composerText.value = "";
  composerText.style.height = "auto";
  composerTitle.classList.add("d-none");
  composerToolbar.classList.add("d-none");
  composerToolbar.classList.remove("d-flex");
  composerState.color = "default";
  composerState.pinned = false;
  composerState.checklist = false;
  composerState.items = [];
  composerChecklistEl.classList.add("d-none");
  composerChecklistEl.innerHTML = "";
  composerText.classList.remove("d-none");
  applyCardColor(composerCard, "default");
  buildPalette(
    document.getElementById("composerPalette"),
    "default",
    pickComposerColor,
  );
  render();
}

/* ---------------------------------------------------------------
   Note actions
--------------------------------------------------------------- */
function findNote(id) {
  return notes.find((n) => n.id === id);
}
function togglePin(id) {
  findNote(id).pinned = !findNote(id).pinned;
  render();
}
function toggleArchive(id) {
  const n = findNote(id);
  n.archived = !n.archived;
  render();
}
function trashNote(id) {
  const n = findNote(id);
  n.trashed = true;
  n.archived = false;
  render();
}
function restoreNote(id) {
  const n = findNote(id);
  n.trashed = false;
  render();
}
function deleteForever(id) {
  notes = notes.filter((n) => n.id !== id);
  render();
}
function setNoteColor(id, key) {
  findNote(id).color = key;
  render();
}
function toggleChecklistItem(id, idx) {
  findNote(id).items[idx].checked = !findNote(id).items[idx].checked;
  render();
}
function startEdit(id) {
  if (currentView === "trash") return;
  editingId = id;
  render();
}
function saveEdit(id, titleVal, textVal) {
  const n = findNote(id);
  n.title = titleVal;
  n.text = textVal;
}
function stopEdit() {
  editingId = null;
  render();
}

function escapeHtml(str) {
  return (str || "").replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        m
      ],
  );
}
function escapeAttr(str) {
  return escapeHtml(str);
}

/* ---------------------------------------------------------------
   Rendering
--------------------------------------------------------------- */
function matchesSearch(n) {
  if (!searchQuery) return true;
  const hay = (
    n.title +
    " " +
    n.text +
    " " +
    n.items.map((i) => i.text).join(" ")
  ).toLowerCase();
  return hay.includes(searchQuery);
}

function visibleNotes() {
  return notes
    .filter((n) => {
      if (currentView === "trash") return n.trashed;
      if (n.trashed) return false;
      if (currentView === "archive") return n.archived;
      return !n.archived;
    })
    .filter(matchesSearch);
}

function noteCardHtml(n) {
  const editing = editingId === n.id;
  const toolbarIcons = [];

  if (currentView === "trash") {
    toolbarIcons.push(
      `<button class="icon-btn btn btn-sm" title="Restore" onclick="restoreNote('${n.id}')"><i class="bi bi-arrow-counterclockwise"></i></button>`,
    );
    toolbarIcons.push(
      `<button class="icon-btn btn btn-sm" title="Delete forever" onclick="deleteForever('${n.id}')"><i class="bi bi-trash3"></i></button>`,
    );
  } else {
    toolbarIcons.push(`
      <div class="dropdown">
        <button class="icon-btn btn btn-sm" data-bs-toggle="dropdown" title="Background options"><i class="bi bi-palette"></i></button>
        <div class="dropdown-menu p-2 d-flex flex-wrap gap-2" style="width:220px;">
          ${COLORS.map((c) => `<button type="button" class="swatch note-${c.key}${c.key === n.color ? " active" : ""}" title="${c.label}" onclick="setNoteColor('${n.id}','${c.key}')"></button>`).join("")}
        </div>
      </div>`);
    toolbarIcons.push(
      `<button class="icon-btn btn btn-sm" title="${n.archived ? "Unarchive" : "Archive"}" onclick="toggleArchive('${n.id}')"><i class="bi bi-${n.archived ? "box-arrow-up" : "archive"}"></i></button>`,
    );
    toolbarIcons.push(
      `<button class="icon-btn btn btn-sm" title="Delete" onclick="trashNote('${n.id}')"><i class="bi bi-trash"></i></button>`,
    );
  }

  const pinBtn =
    currentView === "trash"
      ? ""
      : `
    <button class="icon-btn btn btn-sm position-absolute top-0 end-0 m-1" title="${n.pinned ? "Unpin" : "Pin"}" onclick="event.stopPropagation(); togglePin('${n.id}')">
      <i class="bi bi-pin${n.pinned ? "-fill" : ""} ${n.pinned ? "pin-badge" : ""}"></i>
    </button>`;

  let bodyHtml;
  if (editing) {
    const itemsHtml = n.checklist
      ? n.items
          .map(
            (it, idx) => `
      <div class="d-flex align-items-center gap-2 mb-1">
        <input type="checkbox" class="form-check-input mt-0" ${it.checked ? "checked" : ""} onchange="toggleChecklistItem('${n.id}',${idx})">
        <input type="text" class="form-control form-control-sm border-0 px-1" style="background:transparent;" value="${escapeAttr(it.text)}"
          oninput="notes.find(x=>x.id==='${n.id}').items[${idx}].text=this.value">
      </div>`,
          )
          .join("")
      : "";
    bodyHtml = `
      <input type="text" class="form-control border-0 fw-semibold mb-2 px-0" style="background:transparent;" value="${escapeAttr(n.title)}" placeholder="Title"
        oninput="saveEdit('${n.id}', this.value, notes.find(x=>x.id==='${n.id}').text)">
      ${
        n.checklist
          ? `<div>${itemsHtml}</div>`
          : `<textarea class="form-control border-0 px-0" style="background:transparent;" rows="4"
        oninput="saveEdit('${n.id}', notes.find(x=>x.id==='${n.id}').title, this.value)">${escapeHtml(n.text)}</textarea>`
      }
      <div class="text-end mt-2"><button class="btn btn-sm btn-light" onclick="event.stopPropagation(); stopEdit()">Close</button></div>
    `;
  } else {
    const itemsHtml = n.checklist
      ? n.items
          .map(
            (it, idx) => `
      <div class="d-flex align-items-center gap-2 mb-1">
        <input type="checkbox" class="form-check-input mt-0" ${it.checked ? "checked" : ""} onchange="event.stopPropagation(); toggleChecklistItem('${n.id}',${idx})">
        <span class="${it.checked ? "text-decoration-line-through text-muted" : ""}">${escapeHtml(it.text)}</span>
      </div>`,
          )
          .join("")
      : "";
    bodyHtml = `
      ${n.title ? `<div class="fw-semibold mb-1">${escapeHtml(n.title)}</div>` : ""}
      ${n.checklist ? itemsHtml : `<div style="white-space:pre-wrap;">${escapeHtml(n.text)}</div>`}
    `;
  }

  return `
    <div class="masonry-item">
      <div class="card note-card note-${n.color} position-relative" ${currentView !== "trash" ? `onclick="startEdit('${n.id}')"` : ""} style="cursor:${currentView !== "trash" ? "text" : "default"};">
        ${pinBtn}
        <div class="card-body pb-1">${bodyHtml}</div>
        ${!editing ? `<div class="card-footer bg-transparent border-0 note-toolbar d-flex gap-1 pt-0" onclick="event.stopPropagation()">${toolbarIcons.join("")}</div>` : ""}
      </div>
    </div>
  `;
}

function render() {
  const vis = visibleNotes();
  const pinned = vis.filter((n) => n.pinned && currentView === "notes");
  const others = currentView === "notes" ? vis.filter((n) => !n.pinned) : vis;

  const pinnedGrid = document.getElementById("pinnedGrid");
  const mainGrid = document.getElementById("mainGrid");
  const pinnedLabel = document.getElementById("pinnedLabel");
  const othersLabel = document.getElementById("othersLabel");

  pinnedGrid.innerHTML = pinned.map(noteCardHtml).join("");
  mainGrid.innerHTML = others.map(noteCardHtml).join("");

  pinnedLabel.classList.toggle("d-none", pinned.length === 0);
  othersLabel.classList.toggle(
    "d-none",
    pinned.length === 0 || others.length === 0,
  );

  const emptyState = document.getElementById("emptyState");
  const emptyText = document.getElementById("emptyStateText");
  const totalEmpty = vis.length === 0;
  emptyState.classList.toggle("d-none", !totalEmpty);
  if (totalEmpty) {
    const msgs = {
      notes: "Notes you add appear here",
      archive: "Archived notes appear here",
      trash: "No notes in Trash",
    };
    emptyText.textContent = searchQuery
      ? "No matching notes"
      : msgs[currentView];
  }
}

render();
