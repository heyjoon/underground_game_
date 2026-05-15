const SAVE_KEY = "downlink-web-save-v5";
const SAVE_VERSION = 5;
const EVENT_FILE = "data/random_events.json";

const visibleStats = ["hp", "food", "battery", "human", "sanity"];
const statLabels = {
  hp: "체력",
  food: "식량",
  battery: "배터리",
  human: "인간성",
  sanity: "정신"
};

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
  hp: "crisis_hp",
  food: "crisis_food",
  human: "crisis_human",
  sanity: "crisis_sanity"
};

const deathFlagByStat = {
  hp: "BAD_COLLAPSE",
  food: "BAD_HUNGER",
  human: "BAD_INHUMAN",
  sanity: "BAD_MADNESS"
};

const categoryWeights = [
  {
    maxDay: 5,
    weights: { SURVIVAL: 45, WORLD: 35, RAIDER: 10, ANOMALY: 5, STORY: 5 }
  },
  {
    maxDay: 12,
    weights: { SURVIVAL: 35, WORLD: 20, RAIDER: 20, DISEASE: 10, ANOMALY: 10, STORY: 5 }
  },
  {
    maxDay: Infinity,
    weights: { SURVIVAL: 30, RAIDER: 15, DISEASE: 15, ANOMALY: 15, STORY: 15, WORLD: 10 }
  }
];

let characters = [];
let eventList = [];
let eventsById = {};
let endings = [];
let state = newState();
let currentEvent = null;
let previewStats = null;

const el = {
  stats: document.querySelector("#stats"),
  itemsPanel: document.querySelector("#itemsPanel"),
  items: document.querySelector("#items"),
  eventTitle: document.querySelector("#eventTitle"),
  eventText: document.querySelector("#eventText"),
  choices: document.querySelector("#choices")
};

function newState() {
  return {
    characterId: null,
    characterName: null,
    hp: 1,
    food: 1,
    battery: 1,
    human: 1,
    sanity: 1,
    items: [],
    flags: [],
    crisis: [],
    recentEvents: [],
    queuedEventId: null,
    counters: structuredClone(baseCounters),
    characterFlags: structuredClone(baseCharacterFlags),
    logs: {
      survival: [],
      world: [],
      story: [],
      anomaly: []
    }
  };
}

async function loadData() {
  characters = await fetch("data/characters.json").then((res) => res.json());
  eventList = await fetch(EVENT_FILE).then((res) => res.json());
  endings = await fetch("data/endings.json").then((res) => res.json());
  eventsById = Object.fromEntries(eventList.map((event) => [event.id, event]));
}

function startWithCharacter(character) {
  state = newState();
  state.characterId = character.id;
  state.characterName = character.name;
  Object.assign(state, character.stats);
  state.flags.push(`CHARACTER_${character.id.toUpperCase()}`);
  for (const flag of character.startFlags || []) {
    state.characterFlags[flag] = Math.max(state.characterFlags[flag] || 0, 1);
  }
  previewStats = null;
  startNextDay();
}

function startNextDay() {
  state.counters.dayCount += 1;
  currentEvent = selectEvent();
  autoSave();
  renderEvent();
}

function selectEvent() {
  if (state.queuedEventId && eventsById[state.queuedEventId]) {
    const queued = eventsById[state.queuedEventId];
    state.queuedEventId = null;
    return queued;
  }

  const critical = eventList.filter((event) => {
    if (event.category !== "CRITICAL") return false;
    if (state.recentEvents.includes(event.id)) return false;
    return isEventAvailable(event);
  });
  if (critical.length) return pickWeighted(critical);

  for (let attempts = 0; attempts < 8; attempts += 1) {
    const category = pickCategory();
    const candidates = eventList.filter((event) => {
      if (event.category !== category) return false;
      if (state.recentEvents.includes(event.id)) return false;
      return isEventAvailable(event);
    });
    if (candidates.length) return pickWeighted(candidates);
  }

  const fallback = eventList.filter((event) => {
    if (event.category === "CRITICAL") return false;
    return isEventAvailable(event);
  });
  return fallback.length ? pickWeighted(fallback) : null;
}

function pickCategory() {
  const table = categoryWeights.find((entry) => state.counters.dayCount <= entry.maxDay).weights;
  const total = Object.values(table).reduce((sum, value) => sum + value, 0);
  let roll = Math.random() * total;
  for (const [category, weight] of Object.entries(table)) {
    roll -= weight;
    if (roll <= 0) return category;
  }
  return "SURVIVAL";
}

function pickWeighted(events) {
  const rarityWeight = { COMMON: 8, UNCOMMON: 5, RARE: 2, CRITICAL: 10, STORY: 4 };
  const total = events.reduce((sum, event) => sum + (rarityWeight[event.rarity] || 4), 0);
  let roll = Math.random() * total;
  for (const event of events) {
    roll -= rarityWeight[event.rarity] || 4;
    if (roll <= 0) return event;
  }
  return events[0];
}

function isEventAvailable(event) {
  const day = state.counters.dayCount;
  if (event.minDay && day < event.minDay) return false;
  if (event.maxDay && day > event.maxDay) return false;
  if (!hasAll(event.requiredFlags, state.flags)) return false;
  if (hasAny(event.blockedFlags, state.flags)) return false;
  if (!counterCheck(event.counterMin, "min")) return false;
  if (!counterCheck(event.counterMax, "max")) return false;
  return true;
}

function counterCheck(rules = {}, mode) {
  for (const [counter, value] of Object.entries(rules)) {
    const current = state.counters[counter] || 0;
    if (mode === "min" && current < value) return false;
    if (mode === "max" && current > value) return false;
  }
  return true;
}

function hasAll(list = [], source = []) {
  return list.every((item) => source.includes(item));
}

function hasAny(list = [], source = []) {
  return list.some((item) => source.includes(item));
}

function visibleChoices(event) {
  return (event.choices || []).filter((choice) => {
    if (choice.requiredCharacter && choice.requiredCharacter !== state.characterId) return false;
    if (!hasAll(choice.requiredFlags, state.flags)) return false;
    if (hasAny(choice.blockedFlags, state.flags)) return false;
    return true;
  });
}

function applyChoice(choice) {
  const result = applyChoiceData(currentEvent, choice);
  const ending = checkEnding();
  autoSave();

  if (ending) {
    renderEnding(ending);
    return;
  }

  renderResult(choice, result);
}

function applyChoiceData(event, choice) {
  const result = {
    statChanged: false,
    crisisStarted: [],
    fatal: null
  };

  const adjustedStats = applyTraitModifiers(event, choice);
  for (const [stat, delta] of Object.entries(adjustedStats)) {
    applyStatChange(stat, delta, result);
  }

  for (const [counter, delta] of Object.entries(choice.counterChanges || {})) {
    state.counters[counter] = clampCounter(counter, (state.counters[counter] || 0) + delta);
  }

  for (const [flag, delta] of Object.entries(choice.characterFlags || {})) {
    state.characterFlags[flag] = Math.max(0, (state.characterFlags[flag] || 0) + delta);
  }

  for (const flag of choice.addFlags || []) addFlag(flag);
  for (const flag of choice.removeFlags || []) removeFlag(flag);
  for (const item of choice.addItems || []) {
    if (!state.items.includes(item)) state.items.push(item);
  }
  for (const item of choice.removeItems || []) {
    state.items = state.items.filter((value) => value !== item);
  }

  syncTruthFromCounters();
  addLog(event);

  if (choice.nextEventId) state.queuedEventId = choice.nextEventId;
  rememberEvent(event.id);
  return result;
}

function applyTraitModifiers(event, choice) {
  const effects = { ...(choice.statChanges || {}) };
  const tags = new Set([event.category, ...(choice.tags || [])]);

  if (state.characterId === "seojin") {
    if ((effects.food || 0) > 0 && (tags.has("SURVIVAL") || tags.has("food"))) effects.food += 1;
    if ((effects.food || 0) < 0 && Math.random() < 0.45) effects.food = 0;
    if ((effects.hp || 0) < 0 && Math.random() < 0.25) effects.hp -= 1;
  }

  if (state.characterId === "taeo") {
    if ((effects.hp || 0) < 0 && (tags.has("RAIDER") || tags.has("combat") || tags.has("control"))) effects.hp += 1;
    if ((effects.battery || 0) < 0 && tags.has("control")) effects.battery += 1;
    if ((effects.human || 0) > 0 && Math.random() < 0.5) effects.human = 0;
  }

  if (state.characterId === "harin") {
    if ((effects.hp || 0) < 0 && (tags.has("escape") || tags.has("closed") || tags.has("route"))) effects.hp += 1;
    if ((effects.food || 0) < 0) effects.food -= 1;
  }

  return effects;
}

function applyStatChange(stat, delta, result) {
  if (!visibleStats.includes(stat) || delta === 0) return;
  result.statChanged = true;

  if (delta < 0 && state[stat] <= 0) {
    const crisisFlag = crisisFlagByStat[stat];
    if (crisisFlag && state.crisis.includes(crisisFlag)) {
      addFlag(deathFlagByStat[stat]);
      result.fatal = stat;
      return;
    }
    if (crisisFlag) {
      state.crisis.push(crisisFlag);
      result.crisisStarted.push(stat);
    }
    return;
  }

  state[stat] = Math.max(0, Math.min(3, state[stat] + Math.sign(delta)));
  if (delta > 0) {
    const crisisFlag = crisisFlagByStat[stat];
    state.crisis = state.crisis.filter((flag) => flag !== crisisFlag);
  }
}

function clampCounter(counter, value) {
  const maxed = ["hopeLevel", "truthFlag"].includes(counter) ? Math.min(9, value) : value;
  return Math.max(0, maxed);
}

function syncTruthFromCounters() {
  state.characterFlags.truth = Math.max(state.characterFlags.truth || 0, state.counters.truthFlag || 0);
}

function addLog(event) {
  const entry = `${state.counters.dayCount}일: ${event.title}`;
  if (event.category === "WORLD") state.logs.world.unshift(entry);
  if (event.category === "STORY") state.logs.story.unshift(entry);
  if (event.category === "ANOMALY") state.logs.anomaly.unshift(entry);
  if (["SURVIVAL", "RAIDER", "DISEASE", "CRITICAL"].includes(event.category)) state.logs.survival.unshift(entry);
  for (const key of Object.keys(state.logs)) state.logs[key] = state.logs[key].slice(0, 8);
}

function rememberEvent(id) {
  state.recentEvents.unshift(id);
  state.recentEvents = state.recentEvents.slice(0, 5);
}

function addFlag(flag) {
  if (!state.flags.includes(flag)) state.flags.push(flag);
}

function removeFlag(flag) {
  state.flags = state.flags.filter((item) => item !== flag);
}

function checkEnding() {
  const badFlag = state.flags.find((flag) => flag.startsWith("BAD_"));
  if (badFlag) return endings.find((ending) => ending.id === badFlag);

  if (state.battery <= 0 && state.flags.includes("core_entry_failed")) {
    return endings.find((ending) => ending.id === "BAD_BLACKOUT");
  }

  if (!state.flags.includes("FINAL_CHOICE_MADE") && !state.flags.includes("LAST_MESSAGE_SEEN")) return null;

  return [...endings]
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .find((ending) => {
      if (ending.id.startsWith("BAD_") || ending.id.startsWith("DEATH_")) return false;
      return isEndingAvailable(ending);
    }) || null;
}

function isEndingAvailable(ending) {
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
  return true;
}

function hasAnyOrEmpty(list = [], source = []) {
  return !list.length || list.some((item) => source.includes(item));
}

function renderCharacterSelect() {
  el.eventTitle.textContent = "생존자 선택";
  el.eventText.textContent = "아크-7의 최하층에서 눈을 뜬다.\n\n누구로 살아남을 것인가.";
  el.choices.innerHTML = "";
  el.itemsPanel.hidden = true;
  renderStats();

  for (const character of characters) {
    const button = document.createElement("button");
    button.className = "choice character-choice";
    button.innerHTML = `
      <strong>${character.name}</strong>
      <small>${character.role}</small>
      <small>${character.story}</small>
      <small>특성: ${character.trait.name} - ${character.trait.description}</small>
      <small>약점: ${character.weakness}</small>
    `;
    button.addEventListener("mouseenter", () => {
      previewStats = character.stats;
      renderStats();
    });
    button.addEventListener("focus", () => {
      previewStats = character.stats;
      renderStats();
    });
    button.addEventListener("click", () => startWithCharacter(character));
    el.choices.appendChild(button);
  }
}

function renderEvent() {
  if (!state.characterId) {
    renderCharacterSelect();
    return;
  }

  if (!currentEvent) {
    addFlag("BAD_COLLAPSE");
    renderEnding(endings.find((ending) => ending.id === "BAD_COLLAPSE"));
    return;
  }

  el.eventTitle.textContent = currentEvent.title;
  el.eventText.textContent = currentEvent.text;
  el.choices.innerHTML = "";

  for (const choice of visibleChoices(currentEvent)) {
    const button = document.createElement("button");
    button.className = "choice";
    button.innerHTML = `<strong>${choice.label}</strong>`;
    button.addEventListener("click", () => applyChoice(choice));
    el.choices.appendChild(button);
  }
  renderSidebars();
}

function renderResult(choice, result) {
  el.eventTitle.textContent = "생존 로그";
  const crisisText = result.crisisStarted.length
    ? `\n\n몸이 버티지 못했다. 위기 상태에 들어갔다.`
    : "";
  el.eventText.textContent = `${choice.resultText || "하루가 지나갔다."}${crisisText}`;
  el.choices.innerHTML = "";
  const next = document.createElement("button");
  next.className = "choice";
  next.innerHTML = "<strong>다음 날</strong>";
  next.addEventListener("click", startNextDay);
  el.choices.appendChild(next);
  renderSidebars();
}

function renderEnding(ending) {
  el.eventTitle.textContent = ending.title;
  el.eventText.textContent = ending.text;
  el.choices.innerHTML = "";
  const restart = document.createElement("button");
  restart.className = "choice";
  restart.innerHTML = "<strong>새 게임 시작</strong>";
  restart.addEventListener("click", newGame);
  el.choices.appendChild(restart);
  autoSave();
  renderSidebars();
}

function renderStats() {
  el.stats.innerHTML = "";
  const source = state.characterId ? state : previewStats;
  for (const key of visibleStats) {
    const value = source ? source[key] || 0 : 0;
    const row = document.createElement("div");
    row.className = "stat";
    row.innerHTML = `
      <span>${statLabels[key]}</span>
      <span class="pips" aria-label="${statLabels[key]} ${value}칸">
        ${[0, 1, 2].map((idx) => `<span class="pip ${idx < value ? pipTone(value) : ""}"></span>`).join("")}
      </span>
    `;
    el.stats.appendChild(row);
  }
}

function pipTone(value) {
  if (value <= 0) return "";
  if (value === 1) return "on danger";
  if (value === 2) return "on warn";
  return "on";
}

function renderSidebars() {
  renderStats();
  el.itemsPanel.hidden = false;
  const chips = [state.characterName, ...state.items].filter(Boolean);
  renderChips(el.items, chips, "없음");
}

function renderChips(container, values, emptyText) {
  container.innerHTML = "";
  for (const value of values.length ? values : [emptyText]) {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = value;
    container.appendChild(chip);
  }
}

function newGame() {
  state = newState();
  currentEvent = null;
  previewStats = null;
  autoSave();
  renderCharacterSelect();
}

function autoSave() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, state, currentEventId: currentEvent?.id || null }));
}

function loadSavedGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  const loaded = JSON.parse(raw);
  if (loaded.version !== SAVE_VERSION) return;
  state = loaded.state;
  state.counters = { ...baseCounters, ...(state.counters || {}) };
  state.characterFlags = { ...baseCharacterFlags, ...(state.characterFlags || {}) };
  state.logs = state.logs || { survival: [], world: [], story: [], anomaly: [] };
  currentEvent = loaded.currentEventId ? eventsById[loaded.currentEventId] || null : null;
}

loadData()
  .then(() => {
    loadSavedGame();
    if (!state.characterId) renderCharacterSelect();
    else if (currentEvent) renderEvent();
    else startNextDay();
  })
  .catch((error) => {
    el.eventTitle.textContent = "데이터를 불러오지 못했다";
    el.eventText.textContent = `${error.message}\n\nrun_web.bat로 실행했는지 확인해줘.`;
  });
