export const SAVE_VERSION = "1.1.3";

export const DIFFICULTIES = ["Amateur", "Intermediate", "Professional", "Nightmare", "Insanity"];

export const LEVEL_DIFFICULTY = [
  { level: 1, difficulty: "Amateur" },
  { level: 5, difficulty: "Intermediate" },
  { level: 10, difficulty: "Professional" },
  { level: 20, difficulty: "Nightmare" },
  { level: 35, difficulty: "Insanity" }
];

export const MAPS = [
  { name: "Tanglewood Drive", size: "small" },
  { name: "Edgefield Road", size: "small" },
  { name: "Ridgeview Court", size: "small" },
  { name: "Willow Street", size: "small" },
  { name: "Camp Woodwind", size: "small" },
  { name: "Grafton Farmhouse", size: "small" },
  { name: "Point Hope", size: "medium" },
  { name: "Bleasdale Farmhouse", size: "medium" },
  { name: "Maple Lodge Campsite", size: "medium" },
  { name: "Prison", size: "large" },
  { name: "Brownstone High School", size: "large" },
  { name: "Sunny Meadows", size: "large" },
  { name: "Sunny Meadows Restricted", size: "large" }
];

export const DAILY_GOLD = { small: 100, medium: 200, large: 300 };

export const EQUIPMENT = [
  { id: "emf", name: "EMF Reader", type: "primary", maxSlots: 2 },
  { id: "flashlight", name: "Flashlight", type: "primary", maxSlots: 4 },
  { id: "uv", name: "UV Light", type: "primary", maxSlots: 2 },
  { id: "spiritBox", name: "Spirit Box", type: "primary", maxSlots: 2 },
  { id: "writing", name: "Ghost Writing Book", type: "primary", maxSlots: 2 },
  { id: "thermometer", name: "Thermometer", type: "primary", maxSlots: 2 },
  { id: "dots", name: "DOTS Projector", type: "primary", maxSlots: 2 },
  { id: "videoCamera", name: "Video Camera", type: "primary", maxSlots: 4 },

  { id: "salt", name: "Salt", type: "secondary", maxSlots: 3 },
  { id: "incense", name: "Incense", type: "secondary", maxSlots: 4 },
  { id: "igniter", name: "Igniter", type: "secondary", maxSlots: 4 },
  { id: "firelight", name: "Firelight", type: "secondary", maxSlots: 4 },
  { id: "crucifix", name: "Crucifix", type: "secondary", maxSlots: 2 },
  { id: "motionSensor", name: "Motion Sensor", type: "secondary", maxSlots: 4 },
  { id: "soundSensor", name: "Sound Sensor", type: "secondary", maxSlots: 4 },
  { id: "tripod", name: "Tripod", type: "secondary", maxSlots: 4 },
  { id: "headGear", name: "Head Gear", type: "secondary", maxSlots: 4 },
  { id: "sanityMedication", name: "Sanity Medication", type: "secondary", maxSlots: 4 },
  { id: "parabolic", name: "Parabolic Microphone", type: "secondary", maxSlots: 2 }
];

export const CURSED_OBJECTS = [
  { id: "ouijaBoard", name: "Ouija Board" },
  { id: "musicBox", name: "Music Box" },
  { id: "hauntedMirror", name: "Haunted Mirror" },
  { id: "monkeyPaw", name: "Monkey Paw" },
  { id: "tarotCards", name: "Tarot Cards" },
  { id: "summoningCircle", name: "Summoning Circle" },
  { id: "voodooDoll", name: "Voodoo Doll" }
];

export function equipmentById(id) {
  return EQUIPMENT.find(e => e.id === id);
}

export function mapByName(name) {
  return MAPS.find(m => m.name === name);
}
