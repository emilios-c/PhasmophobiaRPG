import { DIFFICULTIES, MAPS, DAILY_GOLD, mapByName } from "./data.js";
import { classById } from "./classes.js";
import { recommendedDifficulty, difficultyIndex, addExpAndLevel, expNeeded } from "./progression.js";
import { rollLoot, maybeJackpot } from "./loot.js";
import { restockShop } from "./shop.js";

export function contractFormHtml(state) {
  const cls = classById(state.character.classId);
  const mapOptions = MAPS.map(m => `<option value="${m.name}">${m.name}</option>`).join("");
  const diff = recommendedDifficulty(state.character.level);
  const diffOptions = DIFFICULTIES.map(d => `<option ${d === diff ? "selected" : ""}>${d}</option>`).join("");
  const classCheck = cls.contractCheckbox
    ? `<label><input id="classBonusCheck" type="checkbox"> ${cls.contractCheckbox.label}</label>`
    : "";

  return `
    <div id="contractErrors"></div>
    <div class="form-grid">
      <label>Map
        <select id="contractMap">
          <option value="">-- Please Select --</option>
          ${mapOptions}
        </select>
      </label>
      <label>Difficulty
        <select id="contractDifficulty">${diffOptions}</select>
      </label>
      <label>In-game Reward Money
        <input id="contractMoney" type="number" min="1" max="10000" placeholder="1 - 10000">
      </label>
      <div class="checks">
        <label><input id="contractCorrect" type="checkbox" checked> Ghost identified correctly</label>
        <label><input id="contractAlive" type="checkbox" checked> Player survived</label>
        <label><input id="contractPerfect" type="checkbox"> Perfect Investigation</label>
        ${classCheck}
      </div>
    </div>
  `;
}

export function readContractForm() {
  return {
    map: document.getElementById("contractMap").value,
    difficulty: document.getElementById("contractDifficulty").value,
    money: Number(document.getElementById("contractMoney").value),
    correct: document.getElementById("contractCorrect").checked,
    alive: document.getElementById("contractAlive").checked,
    perfect: document.getElementById("contractPerfect").checked,
    classBonus: !!document.getElementById("classBonusCheck")?.checked
  };
}

export function validateContract(input) {
  const errors = [];
  if (!input.map) errors.push("Select a map.");
  if (!input.money || input.money < 1 || input.money > 10000) errors.push("Reward Money must be between 1 and 10,000.");
  if (input.perfect && (!input.correct || !input.alive)) errors.push("A Perfect Investigation requires correct ghost identification and surviving.");
  return errors;
}

export function submitContract(state, input) {
  const cls = classById(state.character.classId);
  const rec = difficultyIndex(recommendedDifficulty(state.character.level));
  const played = difficultyIndex(input.difficulty);
  const above = Math.max(0, played - rec);
  const penalty = Math.max(0.20, 1 - 0.20 * above);

  const breakdown = { exp: [], gold: [], loot: [] };

  let baseExp = Math.floor(input.money * 0.32);
  let baseGold = Math.floor(input.money * 0.18);
  breakdown.exp.push({ label: "Base", value: baseExp });
  breakdown.gold.push({ label: "Base", value: baseGold });

  if (input.correct) {
    baseExp += 30; baseGold += 20;
    breakdown.exp.push({ label: "Correct Ghost", value: 30 });
    breakdown.gold.push({ label: "Correct Ghost", value: 20 });
  }
  if (input.alive) {
    baseExp += 20;
    breakdown.exp.push({ label: "Survived", value: 20 });
  }
  if (input.perfect) {
    baseExp += 50; baseGold += 50;
    breakdown.exp.push({ label: "Perfect Investigation", value: 50 });
    breakdown.gold.push({ label: "Perfect Investigation", value: 50 });
    if (state.talents.veteranInvestigator) {
      baseGold += 100;
      breakdown.gold.push({ label: "Veteran Investigator", value: 100 });
    }
  }

  if (cls.expMultiplier) {
    const bonus = Math.floor(baseExp * (cls.expMultiplier - 1));
    baseExp += bonus;
    if (bonus) breakdown.exp.push({ label: cls.name, value: bonus });
  }
  if (cls.goldMultiplier) {
    const bonus = Math.floor(baseGold * (cls.goldMultiplier - 1));
    baseGold += bonus;
    if (bonus) breakdown.gold.push({ label: cls.name, value: bonus });
  }
  if (cls.contractCheckbox && input.classBonus) {
    baseGold += cls.contractCheckbox.gold;
    breakdown.gold.push({ label: cls.name, value: cls.contractCheckbox.gold });
  }

  if (state.talents.photographer || state.talents.experience) {
    const bonus = Math.floor(baseExp * 0.05);
    baseExp += bonus; breakdown.exp.push({ label: "Talent EXP Bonus", value: bonus });
  }
  if (state.talents.survivor && input.alive) {
    const bonus = Math.floor(baseExp * 0.05);
    baseExp += bonus; breakdown.exp.push({ label: "Survivor", value: bonus });
  }
  if (state.talents.thorough) {
    const bonus = Math.floor(baseGold * 0.05);
    baseGold += bonus; breakdown.gold.push({ label: "Thorough", value: bonus });
  }
  if (state.talents.fastLearner && state.stats.firstSessionBonusAvailable) {
    baseExp += 50; state.stats.firstSessionBonusAvailable = false;
    breakdown.exp.push({ label: "Fast Learner", value: 50 });
  }

  if (above > 0) {
    const expLoss = Math.floor(baseExp * (1 - penalty));
    const goldLoss = Math.floor(baseGold * (1 - penalty));
    baseExp -= expLoss; baseGold -= goldLoss;
    breakdown.exp.push({ label: "Above Difficulty Penalty", value: -expLoss });
    breakdown.gold.push({ label: "Above Difficulty Penalty", value: -goldLoss });
  }

  let cartographerGold = 0;
  if (state.talents.unlockDailies && input.correct && input.alive && !state.daily.mapsCompleted.includes(input.map)) {
    const map = mapByName(input.map);
    cartographerGold = DAILY_GOLD[map?.size || "small"] || 100;
    state.daily.mapsCompleted.push(input.map);
    baseGold += cartographerGold;
    breakdown.gold.push({ label: `Daily Bonus (${map?.size || "small"})`, value: cartographerGold });
  }

  const jackpot = maybeJackpot(state);
  if (jackpot) {
    state.character.gold += jackpot;
    breakdown.gold.push({ label: "Jackpot", value: jackpot });
  }

  const finalExp = Math.max(0, Math.floor(baseExp));
  const finalGold = Math.max(0, Math.floor(baseGold));
  state.character.gold += finalGold;

  addExpAndLevel(state, finalExp, breakdown);

  const successfulClear = input.correct && input.alive;
  const mapCell = state.progress.maps[input.map][input.difficulty];
  const diffCell = state.progress.difficulties[input.difficulty];
  if (successfulClear) { mapCell.clears += 1; diffCell.clears += 1; }
  if (input.perfect) { mapCell.perfects += 1; diffCell.perfects += 1; }
  if (!input.alive) { mapCell.deaths += 1; diffCell.deaths += 1; }
  state.stats.contracts += 1;

  const loot = rollLoot(state, above);
  restockShop(state);

  return {
    input,
    exp: finalExp,
    gold: finalGold,
    totals: {
      exp: state.character.exp,
      expNeeded: expNeeded(state.character.level),
      gold: state.character.gold
    },
    breakdown,
    loot,
    shouldUpdateLoadout: loot.type !== "gold"
  };
}
