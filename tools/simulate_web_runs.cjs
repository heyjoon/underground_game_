const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const characters = JSON.parse(fs.readFileSync(path.join(root, "data/characters.json"), "utf8"));
const eventList = JSON.parse(fs.readFileSync(path.join(root, "data/random_events.json"), "utf8"));
const endings = JSON.parse(fs.readFileSync(path.join(root, "data/endings.json"), "utf8"));
const eventsById = Object.fromEntries(eventList.map((event) => [event.id, event]));

const visibleStats = ["hp", "food", "battery", "mind"];
const baseCounters = {
  dayCount: 0,
  hungerPressure: 0,
  oxygenPressure: 0,
  mentalPressure: 0,
  raiderThreat: 0,
  diseaseThreat: 0,
  systemFailure: 0,
  hopeLevel: 0,
  truthFlag: 0
};
const baseCharacterFlags = {
  ecologicalRestoration: 0,
  redemption: 0,
  hiddenRoute: 0,
  truth: 0,
  authoritarian: 0,
  selfishEscape: 0
};
const crisisFlagByStat = {
  mind: "crisis_mind"
};
const deathFlagByStat = {
  hp: "BAD_COLLAPSE",
  food: "BAD_HUNGER",
  mind: "BAD_MADNESS"
};
const categoryWeights = [
  { maxDay: 5, weights: { SURVIVAL: 40, WORLD: 30, RAIDER: 8, ANOMALY: 12, STORY: 10 } },
  { maxDay: 12, weights: { SURVIVAL: 32, WORLD: 18, RAIDER: 15, DISEASE: 10, ANOMALY: 15, STORY: 10 } },
  { maxDay: Infinity, weights: { SURVIVAL: 26, RAIDER: 15, DISEASE: 12, ANOMALY: 18, STORY: 22, WORLD: 7 } }
];
const progressEvents = [
  { id: "CS01", minDay: 4, counter: "dayCount", value: 4, requiredCharacter: "seojin", missingFlag: "seojin_seed_seen" },
  { id: "CT01", minDay: 4, counter: "dayCount", value: 4, requiredCharacter: "taeo", missingFlag: "taeo_order_zero_seen" },
  { id: "CH01", minDay: 4, counter: "dayCount", value: 4, requiredCharacter: "harin", missingFlag: "harin_delivery_seen" },
  { id: "T01", minDay: 6, counter: "truthFlag", value: 1, missingFlag: "story_broadcast_seen" },
  { id: "T02", minDay: 10, counter: "systemFailure", value: 2, missingFlag: "story_power_seen" },
  { id: "T03", minDay: 14, counter: "hopeLevel", value: 2, missingFlag: "story_surface_order" },
  { id: "CS02", minDay: 16, counter: "truthFlag", value: 2, requiredCharacter: "seojin", missingFlag: "seojin_signature_seen" },
  { id: "CT02", minDay: 16, counter: "truthFlag", value: 2, requiredCharacter: "taeo", missingFlag: "taeo_helmet_seen" },
  { id: "CH02", minDay: 16, counter: "truthFlag", value: 2, requiredCharacter: "harin", missingFlag: "harin_platform_seen" },
  { id: "T04", minDay: 18, counter: "truthFlag", value: 2, missingFlag: "story_old_record" },
  { id: "T06", minDay: 20, counter: "truthFlag", value: 3, missingFlag: "story_missing_names_seen" },
  { id: "C_T01", minDay: 21, counter: "truthFlag", value: 4, missingFlag: "truthCritical_seen" },
  { id: "T05", minDay: 23, counter: "truthFlag", value: 4, missingFlag: "FINAL_CHOICE_MADE" },
  { id: "F30", minDay: 24, counter: "dayCount", value: 24, missingFlag: "FINAL_CHOICE_MADE" },
  { id: "T40", minDay: 40, counter: "dayCount", value: 40, requiredFlag: "TRUE_ROUTE_LOCKED", missingFlag: "TRUE_ROUTE_COMPLETED" }
];

function makeRng(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function newState(character, rng) {
  const riskRng = makeRng((Math.floor(rng() * 0xffffffff) ^ 0x9e3779b9) >>> 0);
  const state = {
    characterId: character.id,
    characterName: character.name,
    hp: character.stats.hp,
    food: character.stats.food,
    battery: character.stats.battery,
    mind: character.stats.mind,
    items: [],
    flags: [`CHARACTER_${character.id.toUpperCase()}`],
    crisis: [],
    recentEvents: [],
    queuedEventId: null,
    trueRouteRiskDay: null,
    counters: structuredClone(baseCounters),
    characterFlags: structuredClone(baseCharacterFlags),
    rng,
    riskRng
  };
  for (const flag of character.startFlags || []) {
    state.characterFlags[flag] = Math.max(state.characterFlags[flag] || 0, 1);
  }
  return state;
}

function runOne({ seed, strategy, characterId, maxDays = 60 }) {
  const rng = makeRng(seed);
  const character = characterId ? characters.find((item) => item.id === characterId) : characters[Math.floor(rng() * characters.length)];
  const state = newState(character, rng);
  const history = [];
  let currentEvent = null;

  while (state.counters.dayCount < maxDays) {
    state.counters.dayCount += 1;
    rollTrueRouteEncounter(state);
    currentEvent = selectEvent(state);
    if (!currentEvent) return finish("NO_EVENT", state, history, character);

    const choices = visibleChoices(state, currentEvent);
    if (!choices.length) return finish("NO_CHOICE", state, history, character, currentEvent);

    const choice = chooseChoice(state, currentEvent, choices, strategy);
    applyChoiceData(state, currentEvent, choice);
    history.push({ day: state.counters.dayCount, event: currentEvent.id, title: currentEvent.title, choice: choice.label });

    const ending = checkEnding(state);
    if (ending) return finish(ending.id, state, history, character, currentEvent);
  }
  return finish("TIMEOUT", state, history, character, currentEvent);
}

function finish(endingId, state, history, character, currentEvent = null) {
  return {
    endingId,
    characterId: character.id,
    characterName: character.name,
    day: state.counters.dayCount,
    truthFlag: state.counters.truthFlag,
    hopeLevel: state.counters.hopeLevel,
    flags: [...state.flags],
    stats: Object.fromEntries(visibleStats.map((stat) => [stat, state[stat]])),
    lastEvent: currentEvent?.id || null,
    trueLocked: state.flags.includes("TRUE_ROUTE_LOCKED"),
    history
  };
}

function rollTrueRouteEncounter(state) {
  if (!state.flags.includes("TRUE_ROUTE_LOCKED")) return;
  if (state.counters.dayCount < 31 || state.counters.dayCount > 39) return;
  if (!state.trueRouteRiskDay) return;
  if (state.counters.dayCount !== state.trueRouteRiskDay) return;
  if (state.flags.includes("TRUE_ROUTE_RISK_ROLLED")) return;
  addFlag(state, "TRUE_ROUTE_RISK_ROLLED");
  addFlag(state, "TRUE_ROUTE_RISK_ACTIVE");
  if (eventsById.T39) state.queuedEventId = "T39";
}

function selectEvent(state) {
  if (state.queuedEventId && eventsById[state.queuedEventId]) {
    const queued = eventsById[state.queuedEventId];
    state.queuedEventId = null;
    return queued;
  }

  const progressEvent = selectProgressEvent(state);
  if (progressEvent?.id === "T40") return progressEvent;

  const critical = eventList.filter((event) => {
    if (event.category !== "CRITICAL") return false;
    if (state.recentEvents.includes(event.id)) return false;
    return isEventAvailable(state, event);
  });
  if (critical.length) return pickWeighted(state, critical);

  if (progressEvent) return progressEvent;

  for (let attempts = 0; attempts < 8; attempts += 1) {
    const category = pickCategory(state);
    const candidates = eventList.filter((event) => {
      if (event.category !== category) return false;
      if (state.recentEvents.includes(event.id)) return false;
      return isEventAvailable(state, event);
    });
    if (candidates.length) return pickWeighted(state, candidates);
  }

  const fallback = eventList.filter((event) => {
    if (event.category === "CRITICAL") return false;
    return isEventAvailable(state, event);
  });
  return fallback.length ? pickWeighted(state, fallback) : null;
}

function selectProgressEvent(state) {
  for (const rule of progressEvents) {
    const event = eventsById[rule.id];
    if (!event) continue;
    if (state.counters.dayCount < rule.minDay) continue;
    if (rule.requiredCharacter && rule.requiredCharacter !== state.characterId) continue;
    if (rule.requiredFlag && !state.flags.includes(rule.requiredFlag)) continue;
    if (rule.missingFlag && state.flags.includes(rule.missingFlag)) continue;
    if ((state.counters[rule.counter] || 0) < rule.value) continue;
    if (!isEventAvailable(state, event)) continue;
    return event;
  }
  return null;
}

function pickCategory(state) {
  const table = categoryWeights.find((entry) => state.counters.dayCount <= entry.maxDay).weights;
  const total = Object.values(table).reduce((sum, value) => sum + value, 0);
  let roll = state.rng() * total;
  for (const [category, weight] of Object.entries(table)) {
    roll -= weight;
    if (roll <= 0) return category;
  }
  return "SURVIVAL";
}

function pickWeighted(state, events) {
  const rarityWeight = { COMMON: 8, UNCOMMON: 5, RARE: 2, CRITICAL: 10, STORY: 4 };
  const total = events.reduce((sum, event) => sum + (rarityWeight[event.rarity] || 4), 0);
  let roll = state.rng() * total;
  for (const event of events) {
    roll -= rarityWeight[event.rarity] || 4;
    if (roll <= 0) return event;
  }
  return events[0];
}

function isEventAvailable(state, event) {
  const day = state.counters.dayCount;
  if (event.requiredCharacter && event.requiredCharacter !== state.characterId) return false;
  if (event.minDay && day < event.minDay) return false;
  if (event.maxDay && day > event.maxDay) return false;
  if (!hasAll(event.requiredFlags, state.flags)) return false;
  if (hasAny(event.blockedFlags, state.flags)) return false;
  if (!counterCheck(state, event.counterMin, "min")) return false;
  if (!counterCheck(state, event.counterMax, "max")) return false;
  return true;
}

function counterCheck(state, rules = {}, mode) {
  for (const [counter, value] of Object.entries(rules)) {
    const current = state.counters[counter] || 0;
    if (mode === "min" && current < value) return false;
    if (mode === "max" && current > value) return false;
  }
  return true;
}

function visibleChoices(state, event) {
  return (event.choices || []).filter((choice) => {
    if (choice.requiredCharacter && choice.requiredCharacter !== state.characterId) return false;
    if (!hasAll(choice.requiredFlags, state.flags)) return false;
    if (hasAny(choice.blockedFlags, state.flags)) return false;
    return true;
  });
}

function chooseChoice(state, event, choices, strategy) {
  if (strategy === "random") {
    return choices[Math.floor(state.rng() * choices.length)];
  }
  const scored = choices.map((choice) => ({ choice, score: scoreChoice(state, event, choice, strategy) }));
  scored.sort((a, b) => b.score - a.score);
  const best = scored.filter((item) => item.score === scored[0].score);
  return best[Math.floor(state.rng() * best.length)].choice;
}

function scoreChoice(state, event, choice, strategy) {
  let score = state.rng() * 0.25;
  const stats = applyTraitModifiers(state, event, choice);
  for (const [stat, delta] of Object.entries(stats)) {
    if (!visibleStats.includes(stat) || delta === 0) continue;
    const value = state[stat] || 0;
    const risk = value <= 1 && delta < 0 ? 7 : 0;
    const weight = { hp: 5, food: 5, battery: 3, mind: 4 }[stat] || 2;
    score += Math.sign(delta) * weight - risk;
  }

  const counters = choice.counterChanges || {};
  score += (counters.hopeLevel || 0) * 1.5;
  score += (counters.truthFlag || 0) * (strategy === "truth" ? 7 : 3);
  score -= (counters.hungerPressure || 0) * 1.1;
  score -= (counters.oxygenPressure || 0) * 1.3;
  score -= (counters.mentalPressure || 0) * 1.2;
  score -= (counters.raiderThreat || 0) * 1.1;
  score -= (counters.diseaseThreat || 0) * 1.2;
  score -= (counters.systemFailure || 0) * 1.1;

  const addFlags = choice.addFlags || [];
  if (addFlags.includes("FINAL_CHOICE_MADE")) score += strategy === "truth" ? 4 : 8;
  if (addFlags.includes("BROADCAST_TRUTH") || addFlags.includes("AI_NEGOTIATED")) score += strategy === "truth" ? 8 : 2;
  if (addFlags.includes("MOTHER_DESTROYED") || addFlags.includes("MOTHER_MAINTAINED")) score += strategy === "survival" ? 4 : 1;
  if (addFlags.some((flag) => flag.startsWith("BAD_"))) score -= 100;
  if (choice.requiredCharacter) score += 6;

  if (strategy === "truth" && ["ANOMALY", "STORY"].includes(event.category)) score += 2;
  if (strategy === "survival" && ["CRITICAL", "SURVIVAL"].includes(event.category)) score += 1;
  return score;
}

function applyChoiceData(state, event, choice) {
  const adjustedStats = applyTraitModifiers(state, event, choice);
  for (const [stat, delta] of Object.entries(adjustedStats)) {
    applyStatChange(state, stat, delta);
  }
  for (const [counter, delta] of Object.entries(choice.counterChanges || {})) {
    state.counters[counter] = clampCounter(counter, (state.counters[counter] || 0) + delta);
  }
  for (const [flag, delta] of Object.entries(choice.characterFlags || {})) {
    state.characterFlags[flag] = Math.max(0, (state.characterFlags[flag] || 0) + delta);
  }
  for (const flag of choice.addFlags || []) addFlag(state, flag);
  for (const flag of choice.removeFlags || []) removeFlag(state, flag);
  for (const item of choice.addItems || []) {
    if (!state.items.includes(item)) state.items.push(item);
  }
  for (const item of choice.removeItems || []) {
    state.items = state.items.filter((value) => value !== item);
  }
  syncTruthFromCounters(state);
  maybeLockTrueRoute(state);
  if (choice.nextEventId) state.queuedEventId = choice.nextEventId;
  rememberEvent(state, event.id);
}

function applyTraitModifiers(state, event, choice) {
  const effects = { ...(choice.statChanges || {}) };
  const tags = new Set([event.category, ...(choice.tags || [])]);
  if (state.characterId === "seojin") {
    if ((effects.food || 0) > 0 && (tags.has("SURVIVAL") || tags.has("food"))) effects.food += 1;
    if ((effects.food || 0) < 0 && state.rng() < 0.45) effects.food = 0;
    if ((effects.hp || 0) < 0 && state.rng() < 0.25) effects.hp -= 1;
  }
  if (state.characterId === "taeo") {
    if ((effects.hp || 0) < 0 && (tags.has("RAIDER") || tags.has("combat") || tags.has("control"))) effects.hp += 1;
    if ((effects.battery || 0) < 0 && tags.has("control")) effects.battery += 1;
    if ((effects.mind || 0) > 0 && state.rng() < 0.35) effects.mind = 0;
  }
  if (state.characterId === "harin") {
    if ((effects.hp || 0) < 0 && (tags.has("escape") || tags.has("closed") || tags.has("route"))) effects.hp += 1;
    if ((effects.food || 0) < 0) effects.food -= 1;
  }
  return effects;
}

function applyStatChange(state, stat, delta) {
  if (!visibleStats.includes(stat) || delta === 0) return;
  if ((stat === "hp" || stat === "food") && delta < 0) {
    state[stat] = Math.max(0, state[stat] - 1);
    if (state[stat] <= 0) addFlag(state, deathFlagByStat[stat]);
    return;
  }
  if (delta < 0 && state[stat] <= 0) {
    const crisisFlag = crisisFlagByStat[stat];
    if (crisisFlag && state.crisis.includes(crisisFlag)) {
      if (!state.flags.includes("FINAL_CHOICE_MADE") && state.counters.dayCount <= 24 && !state.flags.includes("EARLY_FATAL_GRACE_USED")) {
        addFlag(state, "EARLY_FATAL_GRACE_USED");
        return;
      }
      if (state.flags.includes("TRUE_ROUTE_LOCKED") && state.counters.dayCount < 40) return;
      addFlag(state, deathFlagByStat[stat]);
      return;
    }
    if (crisisFlag) state.crisis.push(crisisFlag);
    return;
  }
  state[stat] = Math.max(0, Math.min(3, state[stat] + Math.sign(delta)));
  if (delta > 0) {
    const crisisFlag = crisisFlagByStat[stat];
    state.crisis = state.crisis.filter((flag) => flag !== crisisFlag);
  }
}

function maybeLockTrueRoute(state) {
  if (state.flags.includes("TRUE_ROUTE_LOCKED")) return;
  if (!state.flags.includes("FINAL_CHOICE_MADE")) return;
  if (state.counters.dayCount > 30) return;
  const madeFinalSignal = state.flags.includes("BROADCAST_TRUTH") || state.flags.includes("AI_NEGOTIATED");
  const hasEnoughTruth = (state.counters.truthFlag || 0) >= 4 || (state.characterFlags.truth || 0) >= 4;
  if (madeFinalSignal && hasEnoughTruth && state.mind >= 1) {
    addFlag(state, "TRUE_ROUTE_LOCKED");
    state.trueRouteRiskDay = state.riskRng() < 0.08 ? 31 + Math.floor(state.riskRng() * 9) : null;
  }
}

function checkEnding(state) {
  if (state.hp <= 0) return endings.find((ending) => ending.id === "BAD_COLLAPSE");
  if (state.food <= 0) return endings.find((ending) => ending.id === "BAD_HUNGER");
  const badFlag = state.flags.find((flag) => flag.startsWith("BAD_"));
  if (badFlag) return endings.find((ending) => ending.id === badFlag);
  if (state.battery <= 0 && state.flags.includes("core_entry_failed")) {
    return endings.find((ending) => ending.id === "BAD_BLACKOUT");
  }
  if (!state.flags.includes("FINAL_CHOICE_MADE") && !state.flags.includes("LAST_MESSAGE_SEEN")) return null;
  if (state.flags.includes("TRUE_ROUTE_LOCKED") && state.counters.dayCount < 40) return null;
  return [...endings]
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .find((ending) => {
      if (ending.id.startsWith("BAD_") || ending.id.startsWith("DEATH_")) return false;
      return isEndingAvailable(state, ending);
    }) || null;
}

function isEndingAvailable(state, ending) {
  const conditions = ending.conditions || {};
  if (conditions.requiredCharacter && conditions.requiredCharacter !== state.characterId) return false;
  if (!hasAll(conditions.has_flags, state.flags)) return false;
  if (!hasAnyOrEmpty(conditions.any_flags, state.flags)) return false;
  for (const [stat, value] of Object.entries(conditions.min || {})) {
    if ((state[stat] || 0) < value) return false;
  }
  for (const [flag, value] of Object.entries(conditions.characterFlagsMin || {})) {
    if ((state.characterFlags[flag] || 0) < value) return false;
  }
  for (const [counter, value] of Object.entries(conditions.minCounters || {})) {
    if ((state.counters[counter] || 0) < value) return false;
  }
  for (const [counter, value] of Object.entries(conditions.maxCounters || {})) {
    if ((state.counters[counter] || 0) > value) return false;
  }
  return true;
}

function clampCounter(counter, value) {
  const maxed = ["hopeLevel", "truthFlag"].includes(counter) ? Math.min(9, value) : value;
  return Math.max(0, maxed);
}

function syncTruthFromCounters(state) {
  state.characterFlags.truth = Math.max(state.characterFlags.truth || 0, state.counters.truthFlag || 0);
}

function rememberEvent(state, id) {
  state.recentEvents.unshift(id);
  state.recentEvents = state.recentEvents.slice(0, 5);
}

function addFlag(state, flag) {
  if (!state.flags.includes(flag)) state.flags.push(flag);
}

function removeFlag(state, flag) {
  state.flags = state.flags.filter((item) => item !== flag);
}

function hasAll(list = [], source = []) {
  return list.every((item) => source.includes(item));
}

function hasAny(list = [], source = []) {
  return list.some((item) => source.includes(item));
}

function hasAnyOrEmpty(list = [], source = []) {
  return !list.length || list.some((item) => source.includes(item));
}

function summarize(results) {
  const byEnding = countBy(results, "endingId");
  const byCharacter = countBy(results, "characterId");
  const days = results.map((result) => result.day);
  const trueLocked = results.filter((result) => result.trueLocked).length;
  const trueEnds = results.filter((result) => result.endingId.startsWith("TRUE_")).length;
  const badEnds = results.filter((result) => result.endingId.startsWith("BAD_") || result.endingId.startsWith("DEATH_")).length;
  const within30 = results.filter((result) => result.day <= 30).length;
  return {
    total: results.length,
    endings: byEnding,
    characters: byCharacter,
    avgDay: Number((days.reduce((sum, value) => sum + value, 0) / days.length).toFixed(2)),
    minDay: Math.min(...days),
    maxDay: Math.max(...days),
    within30,
    trueLocked,
    trueEnds,
    badEnds
  };
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}

const runs = Number(process.argv[2] || 100);
const strategy = process.argv[3] || "truth";
const seed = Number(process.argv[4] || 20260617);
const brief = process.argv.includes("--brief");
const results = [];
for (let index = 0; index < runs; index += 1) {
  results.push(runOne({ seed: seed + index * 9973, strategy }));
}

const report = { strategy, seed, summary: summarize(results) };
if (!brief) report.samples = results.slice(0, 5);
console.log(JSON.stringify(report, null, 2));
