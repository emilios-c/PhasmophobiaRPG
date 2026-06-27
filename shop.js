import { EQUIPMENT, equipmentById } from "./data.js";
import { maxGearTier } from "./progression.js";
import { classById } from "./classes.js";

export function hasShop(state) {
  return !!state.talents.unlockShop;
}

export function shopDiscount(state, type) {
  let discount = 0;
  if (classById(state.character.classId).id === "quartermaster") discount += 0.10;
  if (type === "tier" && state.talents.gearMaintenance) discount += 0.10;
  if (type === "slot" && state.talents.efficientStorage) discount += 0.10;
  if (type === "unlock" && state.talents.quartermasterTalent) discount += 0.10;
  if (state.talents.discountHunter) discount += 0.05;
  return Math.min(discount, 0.40);
}

export function shopPrice(state, item) {
  let base = 500;
  const eq = state.equipment[item.target];
  if (item.type === "unlock") base = 500;
  if (item.type === "slot") base = (eq.slots + 1) * 450;
  if (item.type === "tier") base = (eq.tier + 1) * 750;
  if (item.type === "talentPoint") base = 2500;
  return Math.max(50, Math.round(base * (1 - shopDiscount(state, item.type))));
}

export function validShopItems(state) {
  const cap = maxGearTier(state);
  const items = [];

  for (const item of EQUIPMENT) {
    const owned = state.equipment[item.id];
    if (item.type === "secondary" && owned.tier === 0) {
      items.push({ type: "unlock", target: item.id, label: `Unlock ${item.name}`, description: "Tier 1 + 1 slot" });
    }
    if (owned.tier > 0 && owned.slots < item.maxSlots) {
      items.push({ type: "slot", target: item.id, label: `+1 ${item.name} Slot`, description: `${owned.slots} → ${owned.slots + 1} slots` });
    }
    if (owned.tier > 0 && owned.tier < Math.min(3, cap)) {
      items.push({ type: "tier", target: item.id, label: `Upgrade ${item.name}`, description: `Tier ${owned.tier} → Tier ${owned.tier + 1}` });
    }
  }

  items.push({ type: "talentPoint", target: "talentPoint", label: "Talent Point", description: "+1 unspent Talent Point" });
  return items;
}

export function restockShop(state) {
  const pool = validShopItems(state);
  const count = state.talents.logistics ? 5 : 4;
  const stock = [];
  while (pool.length && stock.length < count) {
    const i = Math.floor(Math.random() * pool.length);
    stock.push(pool.splice(i, 1)[0]);
  }
  state.shop.stock = stock;
}

export function rerollCost(state) {
  let cost = state.character.level * 100;
  if (state.talents.fieldRepairs) cost *= 0.90;
  if (state.talents.gambler) cost *= 0.90;
  return Math.round(cost);
}

export function applyShopItem(state, item) {
  if (item.type === "talentPoint") {
    state.character.talentPoints += 1;
    state.stats.lastLoot = "+1 Talent Point";
    return;
  }

  const eq = state.equipment[item.target];
  if (item.type === "unlock") {
    eq.tier = 1;
    eq.slots = 1;
  }
  if (item.type === "slot") eq.slots += 1;
  if (item.type === "tier") eq.tier += 1;

  const def = equipmentById(item.target);
  state.stats.lastLoot = item.type === "unlock" ? `(Tier 1) ${def.name} (+1 Slot)` :
    item.type === "slot" ? `+1 ${def.name} Slot` : `(Tier ${eq.tier}) ${def.name}`;
}
