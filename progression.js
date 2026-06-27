import { DIFFICULTIES, LEVEL_DIFFICULTY } from "./data.js";

export function expNeeded(level) {
  return 100 + level * 50;
}

export function recommendedDifficulty(level) {
  let result = "Amateur";
  for (const row of LEVEL_DIFFICULTY) {
    if (level >= row.level) result = row.difficulty;
  }
  return result;
}

export function difficultyIndex(name) {
  return DIFFICULTIES.indexOf(name);
}

export function countClearsAtOrAbove(state, difficulty) {
  const start = difficultyIndex(difficulty);
  let count = 0;
  for (const mapName of Object.keys(state.progress.maps)) {
    for (let i = start; i < DIFFICULTIES.length; i++) {
      count += state.progress.maps[mapName][DIFFICULTIES[i]].clears || 0;
    }
  }
  return count;
}

export function maxGearTier(state) {
  const tier2 = countClearsAtOrAbove(state, "Professional") >= 5;
  const tier3 = tier2 && countClearsAtOrAbove(state, "Nightmare") >= 5;
  return tier3 ? 3 : tier2 ? 2 : 1;
}

export function addExpAndLevel(state, exp, breakdown) {
  state.character.exp += exp;
  while (state.character.exp >= expNeeded(state.character.level)) {
    state.character.exp -= expNeeded(state.character.level);
    state.character.level += 1;
    state.character.talentPoints += 1;
    if (state.talents.prepared) {
      state.character.gold += 75;
      breakdown.gold.push({ label: "Prepared Level-Up", value: 75 });
    }
    if (state.talents.seasonedSpecialist) {
      state.character.gold += 75;
      breakdown.gold.push({ label: "Seasoned Specialist Level-Up", value: 75 });
    }
  }
}
