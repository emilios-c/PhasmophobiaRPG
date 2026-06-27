import { DIFFICULTIES, MAPS, EQUIPMENT, CURSED_OBJECTS, equipmentById } from "./data.js";
import { CLASSES, classById } from "./classes.js";
import { TALENTS, TALENT_CATEGORIES } from "./talents.js";
import { expNeeded, recommendedDifficulty, maxGearTier, countClearsAtOrAbove } from "./progression.js";
import { hasShop, shopPrice, rerollCost } from "./shop.js";

export const tabs = [
  ["gettingStarted", "Getting Started"],
  ["character", "Character"],
  ["equipment", "Equipment"],
  ["talents", "Talents"],
  ["progress", "Progress"],
  ["shop", "Shop"],
  ["rules", "Rules"]
];

export function money(n) {
  return Math.floor(n || 0).toLocaleString();
}

export function renderTabs(state, active, onTab) {
  const nav = document.getElementById("tabs");
  nav.innerHTML = tabs.map(([id, label]) => {
    const text = id === "talents" ? `Talents (${state.character.talentPoints})` : label;
    return `<button class="tab ${id === active ? "active" : ""}" data-tab="${id}">${text}</button>`;
  }).join("");
  nav.querySelectorAll("button").forEach(btn => btn.onclick = () => onTab(btn.dataset.tab));
}

export function renderContent(state, active) {
  const content = document.getElementById("content");
  if (!state.hasCharacter && active !== "gettingStarted" && active !== "rules") {
    content.innerHTML = welcomeHtml();
    return;
  }

  const views = {
    gettingStarted: gettingStartedHtml,
    character: characterHtml,
    equipment: equipmentHtml,
    talents: talentsHtml,
    progress: progressHtml,
    shop: shopHtml,
    rules: rulesHtml
  };
  content.innerHTML = (views[active] || gettingStartedHtml)(state);
}

function welcomeHtml() {
  return `<div class="card welcome">
    <h2>Welcome to Phasmophobia RPG</h2>
    <p class="small">Create a new investigator to begin your campaign, or load an existing character.</p>
    <div class="actions-row" style="justify-content:center">
      <button class="primary" id="welcomeNewCharacter">New Character</button>
      <button id="welcomeLoadCharacter">Load Character</button>
    </div>
  </div>`;
}

function gettingStartedHtml() {
  return `<div class="card rules">
    <h2>How to Play</h2>
    <p>This tracker transforms <strong>Phasmophobia</strong> into an RPG progression system. Your character earns EXP, Gold, Talent Points, gear upgrades, daily rewards, and class bonuses outside the game.</p>
    <h3>Before You Begin</h3>
    <ul>
      <li>For the best experience, have all Tier 3 equipment unlocked in Phasmophobia. If not, use the highest tier currently available until you unlock it in-game.</li>
      <li>Create a new empty loadout in Phasmophobia.</li>
      <li>Equip one of every Tier 1 primary item.</li>
      <li>Do not equip any secondary equipment unless your tracker character has unlocked it.</li>
      <li><strong>Cursed Objects:</strong> Do not use cursed objects until your character has learned the corresponding Cursed Object talent.</li>
    </ul>
    <h3>Loop</h3>
    <ol>
      <li>Play a contract in Phasmophobia.</li>
      <li>Click <strong>Complete Contract</strong>.</li>
      <li>Enter the map, difficulty, in-game reward money, and contract results.</li>
      <li>Click <strong>Roll Loot</strong>.</li>
      <li>Apply any equipment changes to your in-game loadout before the next contract.</li>
    </ol>
  </div>`;
}

function characterHtml(state) {
  const cls = classById(state.character.classId);
  const need = expNeeded(state.character.level);
  const pct = Math.min(100, state.character.exp / need * 100);
  const tier = maxGearTier(state);
  const t2 = countClearsAtOrAbove(state, "Professional");
  const t3 = countClearsAtOrAbove(state, "Nightmare");
  const dailies = state.talents.unlockDailies ? dailyCardHtml(state) : "";
  const cursed = CURSED_OBJECTS.filter(o => state.talents[o.id]).map(o => `<span class="pill">${o.name}</span>`).join(" ") || `<span class="small">None unlocked.</span>`;

  return `<div class="grid">
    <div class="card span7">
      <h2>${state.character.name}</h2>
      <p><span class="label">Class</span><br><strong class="purple">${cls.name}</strong> — ${cls.perk}</p>
      <div class="stat-grid">
        <div class="stat"><div class="label">Level</div><div class="value">${state.character.level}</div></div>
        <div class="stat"><div class="label">EXP</div><div class="value">${money(state.character.exp)} / ${money(need)}</div></div>
        <div class="stat"><div class="label">Gold</div><div class="value">${money(state.character.gold)}</div></div>
        <div class="stat"><div class="label">Talent Points</div><div class="value">${state.character.talentPoints}</div></div>
      </div>
      <div style="margin-top:14px"><div class="bar"><div class="fill" style="width:${pct}%"></div></div></div>
    </div>
    <div class="card span5">
      <h2>Campaign Status</h2>
      <p><span class="label">Recommended Difficulty</span><br><strong class="accent">${recommendedDifficulty(state.character.level)}</strong></p>
      <p><span class="label">Max Gear Tier</span><br><strong>Tier ${tier}</strong></p>
      <p class="small">Tier 2: Professional or higher clears ${Math.min(t2, 5)}/5<br>Tier 3: ${tier >= 2 ? `Nightmare or higher clears ${Math.min(t3, 5)}/5` : "Locked until Tier 2 is unlocked"}</p>
    </div>
    <div class="card span6"><h2>Latest Loot</h2><p style="font-size:22px;font-weight:900">${state.stats.lastLoot}</p></div>
    <div class="card span6"><h2>Usable Cursed Objects</h2><div class="meta">${cursed}</div></div>
    ${dailies}
  </div>`;
}

function dailyCardHtml(state) {
  const done = state.daily.mapsCompleted.length;
  const remaining = MAPS.filter(m => !state.daily.mapsCompleted.includes(m.name));
  const remainingGold = remaining.reduce((sum, m) => sum + ({ small: 100, medium: 200, large: 300 }[m.size]), 0);
  return `<div class="card span12">
    <h2>Daily Bonuses</h2>
    <p><span class="label">Today</span> ${done}/${MAPS.length} maps complete · Remaining Bonus Gold: <strong>${money(remainingGold)}</strong></p>
    <div class="equip-grid">
      ${MAPS.map(m => {
        const complete = state.daily.mapsCompleted.includes(m.name);
        const gold = { small: 100, medium: 200, large: 300 }[m.size];
        return `<div class="item-card ${complete ? "owned" : ""}">
          <h3>${complete ? "✓ " : ""}${m.name}</h3>
          <p class="small">${m.size} map · ${gold} Gold</p>
        </div>`;
      }).join("")}
    </div>
  </div>`;
}

function equipmentHtml(state) {
  const group = type => EQUIPMENT.filter(e => e.type === type).map(equipmentCard(state)).join("");
  return `<div class="grid">
    <div class="card span12"><h2>Primary Gear</h2><div class="equip-grid">${group("primary")}</div></div>
    <div class="card span12"><h2>Secondary Gear</h2><div class="equip-grid">${group("secondary")}</div></div>
  </div>`;
}

function equipmentCard(state) {
  return def => {
    const e = state.equipment[def.id];
    const locked = e.tier === 0;
    return `<div class="item-card ${locked ? "locked" : "owned"}">
      <h3>${def.name}</h3>
      <p class="small">${def.type === "primary" ? "Primary Gear" : "Secondary Gear"}</p>
      <div class="meta">
        <span class="pill ${locked ? "bad" : "good"}">${locked ? "Locked" : `Tier ${e.tier}`}</span>
        <span class="pill">${e.slots}/${def.maxSlots} Slots</span>
      </div>
    </div>`;
  };
}

function talentsHtml(state) {
  return `<div class="grid">
    ${TALENT_CATEGORIES.map(cat => {
      const items = TALENTS.filter(t => t.category === cat);
      return `<div class="card span12"><h2>${cat}</h2><div class="talent-grid">
        ${items.map(t => {
          const owned = !!state.talents[t.id];
          return `<div class="item-card ${owned ? "owned" : ""}">
            <h3>${t.name} <span class="pill">${t.cost} TP</span></h3>
            <p class="small">${t.description}</p>
            <button data-talent="${t.id}" ${owned || state.character.talentPoints < t.cost ? "disabled" : ""}>${owned ? "Owned" : "Learn"}</button>
          </div>`;
        }).join("")}
      </div></div>`;
    }).join("")}
  </div>`;
}

function progressHtml(state) {
  const diffRows = DIFFICULTIES.map(d => {
    const r = state.progress.difficulties[d];
    return `<tr><td>${d}</td><td>${r.clears}</td><td>${r.perfects}</td><td>${r.deaths}</td></tr>`;
  }).join("");
  const mapRows = MAPS.map(m => `<tr><td>${m.name}</td>${DIFFICULTIES.map(d => {
    const r = state.progress.maps[m.name][d];
    return `<td>${r.perfects ? "★" : r.clears ? "✓" : "—"}${r.deaths ? ` <span class="bad">☠${r.deaths}</span>` : ""}</td>`;
  }).join("")}</tr>`).join("");
  return `<div class="grid">
    <div class="card span5"><h2>Difficulty Records</h2><table><tr><th>Difficulty</th><th>Clears</th><th>Perfects</th><th>Deaths</th></tr>${diffRows}</table></div>
    <div class="card span7"><h2>Map Completion</h2><table><tr><th>Map</th>${DIFFICULTIES.map(d => `<th>${d[0]}</th>`).join("")}</tr>${mapRows}</table><p class="small">✓ clear, ★ perfect, ☠ deaths</p></div>
  </div>`;
}

function shopHtml(state) {
  if (!hasShop(state)) {
    return `<div class="card welcome"><h2>Shop Locked</h2><p>Learn <strong>Unlock Shop</strong> in the Key Unlocks talent category to access the shop.</p></div>`;
  }
  return `<div class="card">
    <h2>Shop</h2>
    <p><span class="label">Gold</span><br><strong style="font-size:24px">${money(state.character.gold)}</strong></p>
    <p class="small">Stock is rerolled after each contract. Reroll stock costs Level × 100 Gold, reduced by talents.</p>
    <button id="rerollShopBtn">Reroll Stock (${money(rerollCost(state))} Gold)</button>
    <div class="shop-grid" style="margin-top:12px">
      ${state.shop.stock.length ? state.shop.stock.map((item, i) => `<div class="item-card">
        <h3>${item.label}</h3>
        <p class="small">${item.description}</p>
        <p><strong>${money(shopPrice(state, item))} Gold</strong></p>
        <button data-buy-shop="${i}" ${state.character.gold < shopPrice(state, item) ? "disabled" : ""}>Purchase</button>
      </div>`).join("") : "<p>No shop stock available.</p>"}
    </div>
  </div>`;
}

function rulesHtml() {
  return `<div class="card rules">
    <h2>Rules Reference</h2>
    <h3>Character</h3>
    <ul><li>Start at Level 1 with Tier 1 primary gear and one slot each.</li><li>Secondary gear starts locked at Tier 0 with 0 slots.</li><li>Level unlocks recommended difficulties.</li></ul>
    <h3>Classes</h3>
    <ul><li>New characters choose a class during creation.</li><li>Older saves with no class become Generalist.</li><li>Specialist chooses one primary item to start at Tier II.</li></ul>
    <h3>Loot</h3>
    <ul><li>Loot is always awarded.</li><li>At recommended difficulty: 30% Equipment Unlock, 25% Slot Unlock, 15% Gear Upgrade, 30% Gold Cache.</li><li>Playing above recommended difficulty shifts loot toward Gold.</li></ul>
    <h3>Daily Bonuses</h3>
    <ul><li>Unlocked by Unlock Dailies.</li><li>First successful clear per map each day: Small +100, Medium +200, Large +300 Gold.</li></ul>
  </div>`;
}

export function modal(title, body, actions = "") {
  document.getElementById("modalRoot").innerHTML = `<div class="modal-backdrop">
    <div class="modal">
      <div class="modal-head"><h2>${title}</h2><button id="modalClose">✕</button></div>
      <div>${body}</div>
      ${actions}
    </div>
  </div>`;
}

export function closeModal() {
  document.getElementById("modalRoot").innerHTML = "";
}

export function renderRewardModal(result) {
  const rows = arr => arr.map(r => `<div class="breakdown-row"><span>${r.label}</span><strong>${r.value >= 0 ? "+" : ""}${money(r.value)}</strong></div>`).join("");
  return `<div class="breakdown compact">
    <div class="reward-summary">
      <div class="stat"><div class="label">EXP Earned</div><div class="value">${money(result.exp)}</div><div class="small">Total: ${money(result.totals.exp)} / ${money(result.totals.expNeeded)}</div></div>
      <div class="stat"><div class="label">Gold Earned</div><div class="value">${money(result.gold)}</div><div class="small">Total: ${money(result.totals.gold)}</div></div>
    </div>
    <h3>Experience</h3>
    ${rows(result.breakdown.exp)}
    <div class="breakdown-row"><span>Final EXP</span><strong>${money(result.exp)}</strong></div>
    <h3>Gold</h3>
    ${rows(result.breakdown.gold)}
    <div class="breakdown-row"><span>Final Gold</span><strong>${money(result.gold)}</strong></div>
    <h3>Loot</h3>
    <p><strong>${result.loot.text}</strong></p>
    ${result.shouldUpdateLoadout ? `<p class="warn">Update your loadout in-game and click Continue.</p>` : ""}
  </div>`;
}

export function classCreationHtml() {
  return `<div class="form-grid">
    <label>Character Name<input id="newName" value="Investigator"></label>
    <label>Class<select id="newClass">${CLASSES.map(c => `<option value="${c.id}">${c.name}</option>`).join("")}</select></label>
    <label id="specialistChoice" class="hidden">Specialist Primary
      <select id="specialistPrimary">${EQUIPMENT.filter(e => e.type === "primary").map(e => `<option value="${e.id}">${e.name}</option>`).join("")}</select>
    </label>
  </div>
  <div id="classPreview" class="card" style="margin-top:12px"></div>`;
}

export function updateClassPreview() {
  const id = document.getElementById("newClass").value;
  const cls = classById(id);
  document.getElementById("specialistChoice").classList.toggle("hidden", !cls.requiresPrimaryChoice);
  document.getElementById("classPreview").innerHTML = `<h3>${cls.name}</h3><p><strong>Perk:</strong> ${cls.perk}</p><p><strong>Starting Gear:</strong> ${cls.startingGear?.length ? cls.startingGear.map(id => equipmentById(id)?.name).join(", ") : cls.requiresPrimaryChoice ? "Chosen primary starts at Tier II" : "None"}</p>`;
}
