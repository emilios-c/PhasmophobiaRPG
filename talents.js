import { CURSED_OBJECTS } from "./data.js";

export const TALENTS = [
  { id: "unlockShop", name: "Unlock Shop", category: "Key Unlocks", cost: 3, description: "Unlocks the Shop tab." },
  { id: "unlockDailies", name: "Unlock Dailies", category: "Key Unlocks", cost: 3, description: "Unlocks Daily Bonuses on the Character screen. First successful clear on each map each day grants bonus Gold based on map size." },

  ...CURSED_OBJECTS.map(obj => ({
    id: obj.id,
    name: obj.name,
    category: "Cursed Items",
    cost: 2,
    description: `Allows use of the ${obj.name} during investigations.`
  })),

  { id: "photographer", name: "Photographer", category: "Investigation", cost: 1, description: "+5% EXP from contracts." },
  { id: "thorough", name: "Thorough", category: "Investigation", cost: 1, description: "+5% Gold from contracts." },
  { id: "veteranInvestigator", name: "Veteran Investigator", category: "Investigation", cost: 3, description: "Perfect Investigations grant +100 bonus Gold." },
  { id: "survivor", name: "Survivor", category: "Investigation", cost: 2, description: "Surviving grants +5% EXP." },

  { id: "gearMaintenance", name: "Gear Maintenance", category: "Economy", cost: 2, description: "Gear upgrades cost 10% less." },
  { id: "efficientStorage", name: "Efficient Storage", category: "Economy", cost: 2, description: "Slot upgrades cost 10% less." },
  { id: "quartermasterTalent", name: "Quartermaster", category: "Economy", cost: 3, description: "Secondary equipment unlocks cost 10% less." },
  { id: "discountHunter", name: "Discount Hunter", category: "Economy", cost: 4, description: "All shop purchases cost 5% less." },
  { id: "fieldRepairs", name: "Field Repairs", category: "Economy", cost: 1, description: "Shop rerolls cost 10% less." },
  { id: "gambler", name: "Gambler", category: "Economy", cost: 2, description: "Shop rerolls cost an additional 10% less." },

  { id: "luckyFind", name: "Lucky Find", category: "Loot", cost: 2, description: "Equipment Unlock loot weight +5%." },
  { id: "arsenal", name: "Arsenal", category: "Loot", cost: 2, description: "Slot Unlock loot weight +5%." },
  { id: "treasureHunter", name: "Treasure Hunter", category: "Loot", cost: 2, description: "Gold Cache rewards are 10% larger." },
  { id: "stockpile", name: "Stockpile", category: "Loot", cost: 2, description: "Gold Cache rewards are 10% larger." },
  { id: "jackpot", name: "Jackpot", category: "Loot", cost: 4, description: "Loot rewards have a 10% chance to include +100 bonus Gold." },

  { id: "experience", name: "Experience", category: "Character", cost: 2, description: "+5% EXP from every contract." },
  { id: "fastLearner", name: "Fast Learner", category: "Character", cost: 1, description: "First contract after loading grants +50 EXP." },
  { id: "prepared", name: "Prepared", category: "Character", cost: 3, description: "Each level-up grants +75 Gold." },
  { id: "seasonedSpecialist", name: "Seasoned Specialist", category: "Character", cost: 3, description: "Each level-up grants +75 Gold." }
];

export const TALENT_CATEGORIES = ["Key Unlocks", "Cursed Items", "Investigation", "Economy", "Loot", "Character"];

export function talentById(id) {
  return TALENTS.find(t => t.id === id);
}
