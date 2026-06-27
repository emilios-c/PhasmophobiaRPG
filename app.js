import { EQUIPMENT } from "./data.js";
import { CLASSES, classById } from "./classes.js";
import { TALENTS, talentById } from "./talents.js";
import { createFreshState, loadLocal, saveLocal, exportSave, importSave, resetDailyIfNeeded } from "./save.js";
import { renderTabs, renderContent, modal, closeModal, classCreationHtml, updateClassPreview, renderRewardModal } from "./ui.js";
import { contractFormHtml, readContractForm, validateContract, submitContract } from "./contract.js";
import { restockShop, rerollCost, applyShopItem, shopPrice } from "./shop.js";

let state = loadLocal();
let activeTab = localStorage.getItem("phasmoRpgActiveTab") || "gettingStarted";

function applyStartingGear(id) {
  if (!state.equipment[id]) return;
  state.equipment[id].tier = Math.max(state.equipment[id].tier, 1);
  state.equipment[id].slots = Math.max(state.equipment[id].slots, 1);
}

function applyClassBenefits() {
  const cls = classById(state.character.classId);
  for (const item of cls.startingGear || []) applyStartingGear(item);
  for (const talent of cls.startingTalents || []) state.talents[talent] = true;
  if (cls.requiresPrimaryChoice && state.character.specialistPrimary) {
    const eq = state.equipment[state.character.specialistPrimary];
    if (eq) { eq.tier = Math.max(eq.tier, 2); eq.slots = Math.max(eq.slots, 1); }
  }
}

function render() {
  resetDailyIfNeeded(state);
  renderTabs(state, activeTab, tab => {
    activeTab = tab;
    localStorage.setItem("phasmoRpgActiveTab", activeTab);
    render();
  });
  renderContent(state, activeTab);
  bindDynamicEvents();
  saveLocal(state);
}

function bindDynamicEvents() {
  document.getElementById("welcomeNewCharacter")?.addEventListener("click", openNewCharacter);
  document.getElementById("welcomeLoadCharacter")?.addEventListener("click", () => document.getElementById("loadInput").click());

  document.querySelectorAll("[data-talent]").forEach(btn => {
    btn.addEventListener("click", () => {
      const talent = talentById(btn.dataset.talent);
      if (!talent || state.talents[talent.id] || state.character.talentPoints < talent.cost) return;
      state.character.talentPoints -= talent.cost;
      state.talents[talent.id] = true;
      render();
    });
  });

  document.getElementById("rerollShopBtn")?.addEventListener("click", () => {
    const cost = rerollCost(state);
    if (state.character.gold < cost) return alert("Not enough Gold.");
    state.character.gold -= cost;
    restockShop(state);
    render();
  });

  document.querySelectorAll("[data-buy-shop]").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.buyShop);
      const item = state.shop.stock[index];
      if (!item) return;
      const price = shopPrice(state, item);
      if (state.character.gold < price) return;
      state.character.gold -= price;
      applyShopItem(state, item);
      state.shop.stock.splice(index, 1);
      modal("Purchase Complete", `<p><strong>${item.label}</strong></p>${item.type !== "talentPoint" ? "<p>Update your loadout in-game before your next contract.</p>" : ""}`, `<div class="actions-row"><button id="modalContinue" class="primary">Continue</button></div>`);
      document.getElementById("modalClose").onclick = () => { closeModal(); render(); };
      document.getElementById("modalContinue").onclick = () => { closeModal(); render(); };
    });
  });
}

function openNewCharacter() {
  if (state.hasCharacter && !confirm("Starting a new character will erase your current campaign. Continue?")) return;
  modal("Create Character", classCreationHtml(), `<div class="actions-row"><button id="cancelCreate">Cancel</button><button id="confirmCreate" class="primary">Create Character</button></div>`);
  document.getElementById("modalClose").onclick = closeModal;
  document.getElementById("cancelCreate").onclick = closeModal;
  document.getElementById("newClass").onchange = updateClassPreview;
  updateClassPreview();

  document.getElementById("confirmCreate").onclick = () => {
    const fresh = createFreshState();
    state = fresh;
    state.hasCharacter = true;
    state.character.name = document.getElementById("newName").value.trim() || "Investigator";
    state.character.classId = document.getElementById("newClass").value || "generalist";
    const cls = classById(state.character.classId);
    state.character.specialistPrimary = cls.requiresPrimaryChoice ? document.getElementById("specialistPrimary").value : null;
    applyClassBenefits();
    restockShop(state);
    activeTab = "character";
    closeModal();
    render();
  };
}

function openContract() {
  if (!state.hasCharacter) return openNewCharacter();
  modal("Complete Contract", contractFormHtml(state), `<div class="actions-row"><button id="cancelContract">Cancel</button><button id="rollLoot" class="primary">Roll Loot</button></div>`);
  document.getElementById("modalClose").onclick = closeModal;
  document.getElementById("cancelContract").onclick = closeModal;
  document.getElementById("rollLoot").onclick = () => {
    try {
      const input = readContractForm();
      const errors = validateContract(input);
      const errorBox = document.getElementById("contractErrors");
      errorBox.innerHTML = "";
      errorBox.className = "";
      if (errors.length) {
        errorBox.className = "errors";
        errorBox.innerHTML = `<strong>Please correct:</strong><ul>${errors.map(e => `<li>${e}</li>`).join("")}</ul>`;
        return;
      }
      const result = submitContract(state, input);
      modal("Contract Complete", renderRewardModal(result), `<div class="actions-row"><button id="modalContinue" class="primary">Continue</button></div>`);
      document.getElementById("modalClose").onclick = () => { closeModal(); activeTab = "character"; render(); };
      document.getElementById("modalContinue").onclick = () => { closeModal(); activeTab = "character"; render(); };
    } catch (err) {
      console.error("Roll Loot failed", err);
      const errorBox = document.getElementById("contractErrors");
      errorBox.className = "errors";
      errorBox.innerHTML = `<strong>Roll Loot failed:</strong> ${err.message}`;
    }
  };
}

document.getElementById("completeContractBtn").onclick = openContract;
document.getElementById("newCharacterBtn").onclick = openNewCharacter;
document.getElementById("saveBtn").onclick = () => exportSave(state);
document.getElementById("loadBtn").onclick = () => document.getElementById("loadInput").click();
document.getElementById("loadInput").onchange = async ev => {
  const file = ev.target.files[0];
  if (!file) return;
  try {
    state = await importSave(file);
    applyClassBenefits();
    activeTab = "character";
    render();
  } catch (err) {
    alert("Could not load save file.");
    console.error(err);
  }
};

render();
