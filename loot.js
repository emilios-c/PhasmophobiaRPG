import { EQUIPMENT, equipmentById } from "./data.js";
import { maxGearTier } from "./progression.js";
import { classById } from "./classes.js";

export function validLootByType(state, type) {
  const cap = maxGearTier(state);
  const items = [];

  for (const item of EQUIPMENT) {
    const owned = state.equipment[item.id];
    if (type === "unlock" && item.type === "secondary" && owned.tier === 0) {
      items.push({ type, target: item.id, text: `Unlocked ${item.name}` });
    }
    if (type === "slot" && owned.tier > 0 && owned.slots < item.maxSlots) {
      items.push({ type, target: item.id, text: `+1 ${item.name} Slot` });
    }
    if (type === "tier" && owned.tier > 0 && owned.tier < Math.min(3, cap)) {
      items.push({ type, target: item.id, text: `${item.name} Tier ${owned.tier + 1}` });
    }
  }

  return items;
}

export function applyLootReward(state, reward) {
  if (!reward || reward.type === "gold") return;
  const eq = state.equipment[reward.target];
  if (reward.type === "unlock") {
    eq.tier = 1;
    eq.slots = 1;
  }
  if (reward.type === "slot") eq.slots += 1;
  if (reward.type === "tier") eq.tier += 1;
  state.stats.lastLoot = reward.text;
}

export function rollLoot(state, aboveTier) {
  const idx = Math.min(4, Math.max(0, aboveTier));
  const weights = [
    { type: "unlock", weight: [30, 20, 10, 5, 0][idx] },
    { type: "slot", weight: [25, 20, 10, 5, 0][idx] },
    { type: "tier", weight: [15, 10, 10, 5, 0][idx] },
    { type: "gold", weight: [30, 50, 70, 85, 100][idx] }
  ];

  if (state.talents.luckyFind) weights.find(w => w.type === "unlock").weight += 5;
  if (state.talents.arsenal) weights.find(w => w.type === "slot").weight += 5;

  const categories = weights
    .map(w => ({ ...w, items: w.type === "gold" ? [{}] : validLootByType(state, w.type) }))
    .filter(w => w.weight > 0 && w.items.length > 0);

  let total = categories.reduce((sum, c) => sum + c.weight, 0);
  let roll = Math.random() * total;
  let category = categories[categories.length - 1];

  for (const c of categories) {
    roll -= c.weight;
    if (roll <= 0) { category = c; break; }
  }

  if (!category || category.type === "gold") {
    let gold = 100 + state.character.level * 15;
    if (state.talents.treasureHunter) gold = Math.round(gold * 1.10);
    if (state.talents.stockpile) gold = Math.round(gold * 1.10);
    state.character.gold += gold;
    state.stats.lastLoot = `${gold} Gold Cache`;
    return { type: "gold", text: `${gold} Gold Cache`, gold };
  }

  const item = category.items[Math.floor(Math.random() * category.items.length)];
  applyLootReward(state, item);
  return item;
}

export function maybeJackpot(state) {
  if (!state.talents.jackpot) return 0;
  const chance = classById(state.character.classId).id === "clairvoyant" ? 0.20 : 0.10;
  return Math.random() < chance ? 100 : 0;
}
