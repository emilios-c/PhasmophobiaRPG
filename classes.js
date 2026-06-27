export const CLASSES = [
  {
    id: "generalist",
    name: "Generalist",
    perk: "+5% EXP and +5% Gold from all contracts.",
    startingGear: ["headGear"],
    expMultiplier: 1.05,
    goldMultiplier: 1.05
  },
  {
    id: "parapsychologist",
    name: "Parapsychologist",
    perk: "+10% EXP from all contracts.",
    startingGear: ["sanityMedication"],
    expMultiplier: 1.10
  },
  {
    id: "fieldAgent",
    name: "Field Agent",
    perk: "+10% Gold from all contracts.",
    startingGear: ["soundSensor"],
    goldMultiplier: 1.10
  },
  {
    id: "quartermaster",
    name: "Quartermaster",
    perk: "Shop prices reduced by 10%.",
    startingGear: ["tripod"],
    shopDiscount: 0.10
  },
  {
    id: "clairvoyant",
    name: "Clairvoyant",
    perk: "Starts with Jackpot unlocked. Jackpot has a 20% chance to award +100 bonus Gold.",
    startingGear: ["parabolic"],
    startingTalents: ["jackpot"],
    jackpotChance: 0.20
  },
  {
    id: "trailblazer",
    name: "Trailblazer",
    perk: "Starts with Unlock Dailies.",
    startingGear: ["motionSensor"],
    startingTalents: ["unlockDailies"]
  },
  {
    id: "specialist",
    name: "Specialist",
    perk: "Choose one Primary Item to begin at Tier II.",
    startingGear: [],
    requiresPrimaryChoice: true
  },
  {
    id: "demonologist",
    name: "Demonologist",
    perk: "Smudging a ghost during a hunt grants +25 Gold.",
    startingGear: ["incense", "igniter"],
    contractCheckbox: { id: "smudgedHunt", label: "Smudged a ghost during a hunt", gold: 25 }
  },
  {
    id: "exorcist",
    name: "Exorcist",
    perk: "A Crucifix Burn grants +25 Gold.",
    startingGear: ["crucifix"],
    contractCheckbox: { id: "crucifixBurn", label: "Crucifix Burn", gold: 25 }
  },
  {
    id: "occultist",
    name: "Occultist",
    perk: "Starts with all Cursed Object talents unlocked.",
    startingGear: ["firelight"],
    startingTalents: ["ouijaBoard", "musicBox", "hauntedMirror", "monkeyPaw", "tarotCards", "summoningCircle", "voodooDoll"]
  }
];

export function classById(id) {
  return CLASSES.find(c => c.id === id) || CLASSES[0];
}
