// Shared helpers: PokeAPI sprites (cached) + rendering
const SPRITE_CACHE_KEY = "pc_sprites_v1";
let spriteCache = {};
try { spriteCache = JSON.parse(localStorage.getItem(SPRITE_CACHE_KEY) || "{}"); } catch (e) {}

const slug = s => String(s).trim().toLowerCase().replace(/\s*\(([^)]+)\)/g, "-$1").replace(/[.'’:]/g, "").replace(/\s+/g, "-");

async function getSprite(nameOrId) {
  const key = slug(nameOrId);
  if (!key) return null;
  if (spriteCache[key]) return spriteCache[key];
  try {
    let r = await fetch("https://pokeapi.co/api/v2/pokemon/" + encodeURIComponent(key));
    if (!r.ok && key.includes("-")) r = await fetch("https://pokeapi.co/api/v2/pokemon/" + encodeURIComponent(key.split("-")[0]));
    if (!r.ok) return null;
    const d = await r.json();
    const url = d.sprites.front_default || d.sprites.other?.["official-artwork"]?.front_default;
    if (url) {
      spriteCache[key] = url;
      try { localStorage.setItem(SPRITE_CACHE_KEY, JSON.stringify(spriteCache)); } catch (e) {}
    }
    return url;
  } catch (e) { return null; }
}

function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

const SILHOUETTE = '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><path fill="currentColor" d="M32 6c-7 0-12 5-12 12 0 3 1 5 2 7-7 3-12 10-12 18 0 9 6 15 14 15h16c8 0 14-6 14-15 0-8-5-15-12-18 1-2 2-4 2-7 0-7-5-12-12-12z"/><text x="32" y="46" text-anchor="middle" font-size="22" font-weight="700" fill="var(--card)">?</text></svg>';

function monHTML(m) {
  return `<div class="mon"><img data-mon="${esc(m.name)}" alt="${esc(m.name)}" width="96" height="96">
    <strong>${esc(m.name)}</strong>
    <span class="muted">${esc(m.types || "")}</span>
    <span>${esc(m.ability || "")}${m.item ? " @ " + esc(m.item) : ""}</span>
    <span class="moves">${(m.moves || []).filter(Boolean).map(esc).join(" · ")}</span></div>`;
}

function teamsHTML(p) {
  return p.teams.map(t => `
    <div class="team"><h3>Team ${esc(t.id)}</h3>
    <div class="mons">${t.pokemon.map(monHTML).join("")}</div></div>`).join("");
}

function playerHTML(p, hidden, i) {
  const head = esc(p.name);
  if (!hidden) return `<section class="player"><h2>${head}</h2>${teamsHTML(p)}</section>`;
  return `<section class="player"><button class="reveal" aria-expanded="false" data-i="${i}">
    <span class="sil">${SILHOUETTE}</span><span class="pname">${head}</span><span class="hint">View team</span></button>
    <div class="teams" hidden></div></section>`;
}

async function loadSprites(root) {
  for (const img of root.querySelectorAll("img[data-mon]:not([src])")) {
    getSprite(img.dataset.mon).then(u => { if (u) img.src = u; else img.alt = img.dataset.mon + " (not found)"; });
  }
}

// hidden=true: show only name + silhouette button; teams appear on click
function renderPlayers(list, root, hidden = false) {
  root.innerHTML = list.length ? list.map((p, i) => playerHTML(p, hidden, i)).join("") : '<p class="muted">No players found.</p>';
  if (!hidden) return loadSprites(root);
  root.querySelectorAll(".reveal").forEach(btn => btn.addEventListener("click", () => {
    const box = btn.nextElementSibling, open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    btn.querySelector(".hint").textContent = open ? "View team" : "Hide team";
    box.hidden = open;
    if (!open && !box.innerHTML) { box.innerHTML = teamsHTML(list[btn.dataset.i]); loadSprites(box); }
  }));
}
