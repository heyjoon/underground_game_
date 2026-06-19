const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const files = [
  "events_chapter1.json",
  "events_chapter2.json",
  "events_chapter3.json",
  "events_chapter4.json",
  "events_chapter5.json",
  "events_chapter6.json",
  "events_final.json"
];

const characters = JSON.parse(fs.readFileSync(path.join(root, "data/characters.json"), "utf8"));
const endings = JSON.parse(fs.readFileSync(path.join(root, "data/endings.json"), "utf8"));
const events = Object.fromEntries(
  files.flatMap((file) => JSON.parse(fs.readFileSync(path.join(root, "data", file), "utf8"))).map((event) => [event.id, event])
);

const flagsBase = {
  ecologicalRestoration: 0,
  redemption: 0,
  hiddenRoute: 0,
  truth: 0,
  authoritarian: 0,
  selfishEscape: 0
};

function newState(characterId) {
  const character = characters.find((item) => item.id === characterId);
  return {
    characterId,
    hp: character.stats.hp,
    food: character.stats.food,
    battery: character.stats.battery,
    mind: character.stats.mind,
    flags: [`CHARACTER_${character.id.toUpperCase()}`],
    items: [],
    visited_events: [],
    characterFlags: { ...flagsBase, ...Object.fromEntries((character.startFlags || []).map((flag) => [flag, 1])) }
  };
}

function check(state, conditions = {}, choice = {}) {
  if (choice.requiredCharacter && state.characterId !== choice.requiredCharacter) return false;
  if (conditions.requiredCharacter && state.characterId !== conditions.requiredCharacter) return false;
  for (const [key, value] of Object.entries(conditions.min || {})) if ((state[key] || 0) < value) return false;
  for (const flag of conditions.has_flags || []) if (!state.flags.includes(flag)) return false;
  for (const item of conditions.has_items || []) if (!state.items.includes(item)) return false;
  for (const [flag, value] of Object.entries(conditions.characterFlagsMin || {})) {
    if ((state.characterFlags[flag] || 0) < value) return false;
  }
  return true;
}

function apply(state, eventId, choiceIndex) {
  const event = events[eventId];
  if (!check(state, event.conditions)) throw new Error(`locked event ${eventId}`);
  const choices = event.choices.filter((choice) => check(state, choice.conditions, choice));
  const choice = choices[choiceIndex];
  if (!choice) throw new Error(`missing choice ${eventId} #${choiceIndex}`);
  for (const [key, delta] of Object.entries(choice.effects || {})) {
    const statKey = key === "human" || key === "sanity" ? "mind" : key;
    if (["hp", "food", "battery", "mind"].includes(statKey)) {
      state[statKey] = Math.max(0, Math.min(3, state[statKey] + Math.sign(delta)));
    } else {
      state[key] = (state[key] || 0) + delta;
    }
  }
  for (const [key, delta] of Object.entries(choice.characterFlags || {})) {
    state.characterFlags[key] = (state.characterFlags[key] || 0) + delta;
  }
  for (const item of choice.items_add || []) if (!state.items.includes(item)) state.items.push(item);
  for (const flag of choice.flags_on || []) if (!state.flags.includes(flag)) state.flags.push(flag);
}

function endingFor(state) {
  return [...endings]
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .find((ending) => !ending.id.startsWith("BAD_") && !ending.id.startsWith("DEATH_") && check(state, ending.conditions || {}));
}

const routes = {
  seojin: ["C001:1", "C002:1", "C101:1", "C102:0", "C201:0", "C202:0", "C301:1", "C302:1", "C401:1", "C402:0", "C501:0", "C502:0", "F001A:0"],
  taeo: ["C001:1", "C002:0", "C101:1", "C102:2", "C201:1", "C202:0", "C301:0", "C302:0", "C401:2", "C402:1", "C501:2", "C502:0", "F001A:2"],
  harin: ["C001:1", "C002:2", "C101:1", "C102:0", "C201:1", "C202:0", "C301:0", "C302:0", "C401:2", "C402:0", "C501:0", "C502:1", "F001A:2"]
};

for (const [characterId, steps] of Object.entries(routes)) {
  const state = newState(characterId);
  for (const step of steps) {
    const [eventId, index] = step.split(":");
    apply(state, eventId, Number(index));
  }
  const ending = endingFor(state);
  console.log(characterId, ending?.id || "NO_END", state.characterFlags);
}
