import { SAVE_VERSION, EQUIPMENT, MAPS, DIFFICULTIES } from "./data.js";
import { classById } from "./classes.js";

const STORAGE_KEY = "phasmoRpgV110";

export function createFreshState() {
  const equipment = {};
  for (const item of EQUIPMENT) {
    equipment[item.id] = {
      tier: item.type === "primary" ? 1 : 0,
      slots: item.type === "primary" ? 1 : 0
    };
  }

  const maps = {};
  for (const map of MAPS) {
    maps[map.name] = {};
    for (const diff of DIFFICULTIES) {
      maps[map.name][diff] = { clears: 0, perfects: 0, deaths: 0 };
    }
  }

  const difficulties = {};
  for (const diff of DIFFICULTIES) {
    difficulties[diff] = { clears: 0, perfects: 0, deaths: 0 };
  }

  return {
    saveVersion: SAVE_VERSION,
    hasCharacter: false,
    character: {
      name: "Investigator",
      classId: "generalist",
      specialistPrimary: null,
      level: 1,
      exp: 0,
      gold: 0,
      talentPoints: 0
    },
    equipment,
    talents: {},
    shop: { stock: [] },
    daily: { date: todayKey(), mapsCompleted: [] },
    progress: { maps, difficulties },
    stats: { contracts: 0, lastLoot: "None", firstSessionBonusAvailable: true }
  };
}

export function todayKey() {
  return new Date().toLocaleDateString("en-CA");
}

export function resetDailyIfNeeded(state) {
  if (!state.daily) state.daily = { date: todayKey(), mapsCompleted: [] };
  if (state.daily.date !== todayKey()) {
    state.daily.date = todayKey();
    state.daily.mapsCompleted = [];
  }
}

export function repairState(raw) {
  const fresh = createFreshState();
  const state = raw && typeof raw === "object" ? raw : fresh;

  state.saveVersion ||= SAVE_VERSION;
  state.hasCharacter = !!state.hasCharacter;
  state.character = { ...fresh.character, ...(state.character || {}) };
  state.character.classId = classById(state.character.classId).id;
  state.character.level = Math.max(1, Math.floor(+state.character.level || 1));
  state.character.exp = Math.max(0, Math.floor(+state.character.exp || 0));
  state.character.gold = Math.max(0, Math.floor(+state.character.gold || 0));
  state.character.talentPoints = Math.max(0, Math.floor(+state.character.talentPoints || 0));

  state.equipment ||= {};
  for (const item of EQUIPMENT) {
    const existing = state.equipment[item.id] || {};
    state.equipment[item.id] = {
      tier: Math.max(0, Math.min(3, Math.floor(+existing.tier || (item.type === "primary" ? 1 : 0)))),
      slots: Math.max(0, Math.min(item.maxSlots, Math.floor(+existing.slots || (item.type === "primary" ? 1 : 0))))
    };
  }

  state.talents ||= {};
  state.shop = { ...fresh.shop, ...(state.shop || {}) };
  if (!Array.isArray(state.shop.stock)) state.shop.stock = [];

  state.daily = { ...fresh.daily, ...(state.daily || {}) };
  if (!Array.isArray(state.daily.mapsCompleted)) state.daily.mapsCompleted = [];

  state.progress ||= {};
  state.progress.maps ||= {};
  for (const map of MAPS) {
    state.progress.maps[map.name] ||= {};
    for (const diff of DIFFICULTIES) {
      const cell = state.progress.maps[map.name][diff] || {};
      state.progress.maps[map.name][diff] = {
        clears: Math.max(0, Math.floor(+cell.clears || 0)),
        perfects: Math.max(0, Math.floor(+cell.perfects || 0)),
        deaths: Math.max(0, Math.floor(+cell.deaths || 0))
      };
    }
  }

  state.progress.difficulties ||= {};
  for (const diff of DIFFICULTIES) {
    const row = state.progress.difficulties[diff] || {};
    state.progress.difficulties[diff] = {
      clears: Math.max(0, Math.floor(+row.clears || 0)),
      perfects: Math.max(0, Math.floor(+row.perfects || 0)),
      deaths: Math.max(0, Math.floor(+row.deaths || 0))
    };
  }

  state.stats = { ...fresh.stats, ...(state.stats || {}) };
  resetDailyIfNeeded(state);
  return state;
}

export function loadLocal() {
  try {
    return repairState(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return createFreshState();
  }
}

export function saveLocal(state) {
  state.saveVersion = SAVE_VERSION;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportSave(state) {
  state.saveVersion = SAVE_VERSION;
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `phasmophobia-rpg-${state.character.name || "character"}.json`;
  a.click();
}

export function importSave(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try { resolve(repairState(JSON.parse(reader.result))); }
      catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
