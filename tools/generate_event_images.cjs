const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const eventFile = path.join(root, "data", "random_events.json");
const endingFile = path.join(root, "data", "endings.json");
const characterFile = path.join(root, "data", "characters.json");
const assetDir = path.join(root, "assets", "events");
const endingAssetDir = path.join(root, "assets", "endings");
const characterAssetDir = path.join(root, "assets", "characters");
const uiAssetDir = path.join(root, "assets", "ui");

const events = JSON.parse(fs.readFileSync(eventFile, "utf8"));
const endings = JSON.parse(fs.readFileSync(endingFile, "utf8"));
const characters = JSON.parse(fs.readFileSync(characterFile, "utf8"));
fs.mkdirSync(assetDir, { recursive: true });
fs.mkdirSync(endingAssetDir, { recursive: true });
fs.mkdirSync(characterAssetDir, { recursive: true });
fs.mkdirSync(uiAssetDir, { recursive: true });

const palettes = {
  SURVIVAL: { bg: "#171a1d", mid: "#26291f", accent: "#d9b15f", dim: "#7b6b47" },
  WORLD: { bg: "#15191f", mid: "#202936", accent: "#91a8c2", dim: "#526375" },
  RAIDER: { bg: "#1b1617", mid: "#2a1d20", accent: "#c76565", dim: "#743d42" },
  DISEASE: { bg: "#151b18", mid: "#203027", accent: "#8fc779", dim: "#4e7553" },
  ANOMALY: { bg: "#161620", mid: "#222038", accent: "#a48ad4", dim: "#5c4b83" },
  STORY: { bg: "#121b1d", mid: "#1e3031", accent: "#76c7b7", dim: "#3e746e" },
  CRITICAL: { bg: "#1d1515", mid: "#311f1f", accent: "#d66b6b", dim: "#7d3f3f" },
  ENDING: { bg: "#111417", mid: "#1b2328", accent: "#d4c6aa", dim: "#696150" },
  CHARACTER: { bg: "#111416", mid: "#1a2226", accent: "#76c7b7", dim: "#3a6661" }
};

const sceneRules = [
  [/배급|식량|창고|굶|쿠폰|씨앗|SEED|온실/, "rations"],
  [/물|배관|정화|파도|바다/, "water"],
  [/산소|필터|공기|감압|압력/, "oxygen"],
  [/발전기|전력|배터리|전력핵|정전/, "power"],
  [/수면|정신|목소리|성광|환청|헬멧|녹음|ORDER/, "mind"],
  [/의약|기침|격리|약|발열|쥐|오염/, "disease"],
  [/문|통로|폐쇄|표식|지상문|마흔|문턱|배송|승강장|명단/, "door"],
  [/카메라|구조|통행세|칼부림|침입|약탈|발소리|진압|보안/, "raider"],
  [/광고|생일|지하철|방송|교육|알림|포스터|투표/, "screen"],
  [/태양|날씨|웨딩|리조트/, "surface"],
  [/새소리|지도|ID|위성|진실|기록/, "signal"]
];

function sceneFor(event) {
  const source = `${event.title} ${event.text}`;
  for (const [pattern, scene] of sceneRules) {
    if (pattern.test(source)) return scene;
  }
  return "corridor";
}

function endingScene(ending) {
  if (ending.id.includes("TRUE")) return "surface";
  if (ending.id.includes("HUNGER")) return "rations";
  if (ending.id.includes("MADNESS") || ending.id.includes("SANITY")) return "mind";
  if (ending.id.includes("BLACKOUT")) return "power";
  if (ending.id.includes("DECOMPRESSION")) return "oxygen";
  if (ending.id.includes("COLLAPSE") || ending.id.includes("HP")) return "corridor";
  if (ending.id.includes("RECONNECT") || ending.id.includes("MANAGER")) return "signal";
  return sceneFor({ title: ending.title, text: ending.text });
}

function xml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function hashText(text) {
  let hash = 2166136261;
  for (const char of text) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function bars(seed, color) {
  const items = [];
  for (let i = 0; i < 16; i += 1) {
    const x = 80 + i * 72;
    const h = 40 + ((seed >>> (i % 16)) & 31);
    items.push(`<rect x="${x}" y="${630 - h}" width="34" height="${h}" fill="${color}" opacity="${0.08 + (i % 4) * 0.025}"/>`);
  }
  return items.join("");
}

function people(y, color, count = 5) {
  return Array.from({ length: count }, (_, index) => {
    const x = 290 + index * 66;
    return `<circle cx="${x}" cy="${y}" r="15" fill="${color}" opacity="0.9"/><path d="M${x - 22} ${y + 48}q22 -28 44 0v62h-44z" fill="${color}" opacity="0.6"/>`;
  }).join("");
}

const drawings = {
  rations: (p) => `
    <rect x="170" y="178" width="760" height="280" rx="8" fill="${p.mid}" stroke="${p.dim}" stroke-width="4"/>
    <path d="M220 250h660M220 330h660M220 410h660" stroke="${p.dim}" stroke-width="5" opacity="0.7"/>
    <rect x="250" y="470" width="120" height="80" fill="${p.accent}" opacity="0.82"/>
    <rect x="400" y="490" width="150" height="60" fill="${p.accent}" opacity="0.52"/>
    ${people(520, p.accent, 4)}
  `,
  water: (p) => `
    <path d="M140 430c140 -90 240 90 380 0s240 90 380 0 230 78 320 4" fill="none" stroke="${p.accent}" stroke-width="18" opacity="0.72"/>
    <path d="M180 500c150 -74 240 74 390 0s240 70 390 0" fill="none" stroke="${p.dim}" stroke-width="12" opacity="0.75"/>
    <rect x="780" y="180" width="190" height="300" rx="26" fill="${p.mid}" stroke="${p.accent}" stroke-width="6" opacity="0.82"/>
    <path d="M820 250h110M820 320h110M820 390h110" stroke="${p.dim}" stroke-width="7"/>
  `,
  oxygen: (p) => `
    <circle cx="620" cy="350" r="170" fill="${p.mid}" stroke="${p.accent}" stroke-width="8" opacity="0.9"/>
    <circle cx="620" cy="350" r="42" fill="${p.accent}" opacity="0.9"/>
    <path d="M620 350L760 260M620 350L480 260M620 350L620 520" stroke="${p.accent}" stroke-width="34" stroke-linecap="round" opacity="0.58"/>
    <path d="M190 240h240M810 240h240M190 470h240M810 470h240" stroke="${p.dim}" stroke-width="18" stroke-linecap="round"/>
  `,
  power: (p) => `
    <rect x="250" y="180" width="730" height="360" rx="18" fill="${p.mid}" stroke="${p.dim}" stroke-width="6"/>
    <path d="M610 210l-80 150h92l-64 170 160-220h-100l70-100z" fill="${p.accent}" opacity="0.9"/>
    <path d="M310 250h140M310 330h120M800 270h120M790 380h150" stroke="${p.accent}" stroke-width="8" opacity="0.5"/>
  `,
  mind: (p) => `
    <path d="M330 470c40 -160 120 -240 280 -240s240 98 240 220c0 110 -96 160 -226 160h-220c-62 0 -90 -50 -74 -140z" fill="${p.mid}" stroke="${p.accent}" stroke-width="7"/>
    <path d="M440 330c70 28 150 28 230 0M440 420c90 -34 170 -34 260 0" stroke="${p.dim}" stroke-width="12" fill="none" opacity="0.82"/>
    <path d="M900 240q120 110 0 220M955 195q190 160 0 330" stroke="${p.accent}" stroke-width="10" fill="none" opacity="0.45"/>
  `,
  disease: (p) => `
    <rect x="230" y="210" width="780" height="330" rx="14" fill="${p.mid}" stroke="${p.dim}" stroke-width="6"/>
    <path d="M290 290h660M290 390h660" stroke="${p.dim}" stroke-width="5" opacity="0.7"/>
    <path d="M585 275h70v70h70v70h-70v70h-70v-70h-70v-70h70z" fill="${p.accent}" opacity="0.78"/>
    <path d="M230 210l780 330M1010 210L230 540" stroke="${p.accent}" stroke-width="7" opacity="0.24"/>
  `,
  door: (p) => `
    <path d="M450 610V150h330v460" fill="${p.mid}" stroke="${p.accent}" stroke-width="8"/>
    <path d="M515 610V220h200v390" fill="${p.bg}" stroke="${p.dim}" stroke-width="6"/>
    <circle cx="684" cy="412" r="12" fill="${p.accent}"/>
    <path d="M220 610h780M390 610l60 -460M840 610l-60 -460" stroke="${p.dim}" stroke-width="10" opacity="0.7"/>
  `,
  raider: (p) => `
    <path d="M280 520h700" stroke="${p.dim}" stroke-width="18"/>
    <path d="M350 520l60 -210h150l60 210M720 520l55 -250h120l70 250" stroke="${p.accent}" stroke-width="16" fill="none" opacity="0.72"/>
    <path d="M440 250l120 90M870 260l-120 90" stroke="${p.accent}" stroke-width="12" opacity="0.8"/>
    <rect x="180" y="160" width="220" height="90" fill="${p.mid}" stroke="${p.dim}" stroke-width="5"/>
  `,
  screen: (p) => `
    <rect x="190" y="150" width="860" height="420" rx="20" fill="${p.mid}" stroke="${p.accent}" stroke-width="8"/>
    <rect x="245" y="210" width="750" height="250" fill="${p.bg}" stroke="${p.dim}" stroke-width="4"/>
    <path d="M290 275h320M290 335h520M290 395h220" stroke="${p.accent}" stroke-width="12" opacity="0.55"/>
    <path d="M520 570h200M610 570v70" stroke="${p.dim}" stroke-width="16"/>
  `,
  surface: (p) => `
    <path d="M110 520h1060" stroke="${p.dim}" stroke-width="18"/>
    <circle cx="880" cy="240" r="92" fill="${p.accent}" opacity="0.58"/>
    <path d="M190 520c120 -190 230 -190 340 0M490 520c120 -240 270 -240 420 0" fill="${p.mid}" stroke="${p.dim}" stroke-width="5"/>
    <path d="M160 440h220M820 420h250" stroke="${p.accent}" stroke-width="9" opacity="0.42"/>
  `,
  signal: (p) => `
    <path d="M260 560h720" stroke="${p.dim}" stroke-width="16"/>
    <path d="M620 560V240" stroke="${p.accent}" stroke-width="14"/>
    <circle cx="620" cy="210" r="32" fill="${p.accent}"/>
    <path d="M530 280q90 -100 180 0M455 340q165 -180 330 0M380 400q240 -260 480 0" fill="none" stroke="${p.accent}" stroke-width="12" opacity="0.52"/>
    <rect x="260" y="410" width="210" height="90" fill="${p.mid}" stroke="${p.dim}" stroke-width="5"/>
  `,
  corridor: (p) => `
    <path d="M190 620L455 160h350l285 460z" fill="${p.mid}" stroke="${p.dim}" stroke-width="6"/>
    <path d="M455 160v460M805 160v460M300 430h660M375 300h500" stroke="${p.accent}" stroke-width="8" opacity="0.35"/>
  `
};

function svgFor(event) {
  const palette = palettes[event.category] || palettes.WORLD;
  const seed = hashText(`${event.id}:${event.title}`);
  const scene = sceneFor(event);
  const draw = drawings[scene] || drawings.corridor;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-labelledby="title desc">
  <title id="title">${xml(event.title)}</title>
  <desc id="desc">${xml(event.category)} event illustration for DOWNLINK.</desc>
  <rect width="1280" height="720" fill="${palette.bg}"/>
  <rect x="72" y="70" width="1136" height="580" rx="18" fill="${palette.mid}" opacity="0.38"/>
  <path d="M0 640h1280M0 112h1280M88 0v720M1192 0v720" stroke="${palette.dim}" stroke-width="2" opacity="0.34"/>
  ${bars(seed, palette.accent)}
  ${draw(palette)}
  <rect x="0" y="0" width="1280" height="720" fill="none" stroke="${palette.accent}" stroke-width="10" opacity="0.18"/>
  <text x="86" y="112" fill="${palette.accent}" font-family="Pretendard, Noto Sans KR, sans-serif" font-size="26" font-weight="700" opacity="0.9">${xml(event.category)} / ${xml(event.id)}</text>
</svg>
`;
}

function endingSvgFor(ending) {
  const palette = ending.id.startsWith("BAD_") || ending.id.startsWith("DEATH_")
    ? palettes.CRITICAL
    : palettes.ENDING;
  const seed = hashText(`${ending.id}:${ending.title}`);
  const scene = endingScene(ending);
  const draw = drawings[scene] || drawings.corridor;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-labelledby="title desc">
  <title id="title">${xml(ending.title)}</title>
  <desc id="desc">Ending illustration for DOWNLINK.</desc>
  <rect width="1280" height="720" fill="${palette.bg}"/>
  <rect x="62" y="60" width="1156" height="600" rx="20" fill="${palette.mid}" opacity="0.42"/>
  <path d="M80 600h1120M110 120h1060" stroke="${palette.dim}" stroke-width="3" opacity="0.5"/>
  ${bars(seed, palette.accent)}
  ${draw(palette)}
  <text x="86" y="112" fill="${palette.accent}" font-family="Pretendard, Noto Sans KR, sans-serif" font-size="26" font-weight="700" opacity="0.9">ENDING / ${xml(ending.id)}</text>
</svg>
`;
}

function characterSvgFor(character) {
  const variants = {
    seojin: { accent: "#8fc779", scene: "oxygen", label: "ECO ENGINEER" },
    taeo: { accent: "#d66b6b", scene: "raider", label: "SECURITY CAPTAIN" },
    harin: { accent: "#91a8c2", scene: "door", label: "ROUTE FINDER" }
  };
  const variant = variants[character.id] || { accent: palettes.CHARACTER.accent, scene: "corridor", label: "SURVIVOR" };
  const palette = { ...palettes.CHARACTER, accent: variant.accent };
  const draw = drawings[variant.scene] || drawings.corridor;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520" role="img" aria-labelledby="title desc">
  <title id="title">${xml(character.name)}</title>
  <desc id="desc">${xml(character.role)} character portrait for DOWNLINK.</desc>
  <rect width="900" height="520" fill="${palette.bg}"/>
  <rect x="44" y="42" width="812" height="436" rx="16" fill="${palette.mid}" opacity="0.52"/>
  <g transform="translate(-190 -120) scale(0.86)">
    ${draw(palette)}
  </g>
  <rect x="0" y="0" width="900" height="520" fill="none" stroke="${palette.accent}" stroke-width="8" opacity="0.22"/>
  <text x="52" y="78" fill="${palette.accent}" font-family="Pretendard, Noto Sans KR, sans-serif" font-size="20" font-weight="700">${xml(variant.label)}</text>
  <text x="52" y="432" fill="#f1eee6" font-family="Pretendard, Noto Sans KR, sans-serif" font-size="38" font-weight="800">${xml(character.name)}</text>
</svg>
`;
}

function uiSelectSvg() {
  const palette = palettes.STORY;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-labelledby="title desc">
  <title id="title">생존자 선택</title>
  <desc id="desc">Character selection illustration for DOWNLINK.</desc>
  <rect width="1280" height="720" fill="${palette.bg}"/>
  <path d="M170 610L450 170h380l280 440z" fill="${palette.mid}" stroke="${palette.dim}" stroke-width="8"/>
  <path d="M320 600V240M640 610V180M960 600V240" stroke="${palette.accent}" stroke-width="13" opacity="0.48"/>
  <circle cx="320" cy="220" r="44" fill="#8fc779" opacity="0.75"/>
  <circle cx="640" cy="160" r="44" fill="#d66b6b" opacity="0.75"/>
  <circle cx="960" cy="220" r="44" fill="#91a8c2" opacity="0.75"/>
  <path d="M250 610h780" stroke="${palette.dim}" stroke-width="20"/>
  <text x="86" y="112" fill="${palette.accent}" font-family="Pretendard, Noto Sans KR, sans-serif" font-size="26" font-weight="700">SELECT / SURVIVOR</text>
</svg>
`;
}

for (const event of events) {
  const fileName = `${event.id}.svg`;
  const relativePath = `assets/events/${fileName}`;
  fs.writeFileSync(path.join(assetDir, fileName), svgFor(event), "utf8");
  event.image = relativePath;
}

for (const ending of endings) {
  const fileName = `${ending.id}.svg`;
  const relativePath = `assets/endings/${fileName}`;
  fs.writeFileSync(path.join(endingAssetDir, fileName), endingSvgFor(ending), "utf8");
  ending.image = relativePath;
}

for (const character of characters) {
  const fileName = `${character.id}.svg`;
  const relativePath = `assets/characters/${fileName}`;
  fs.writeFileSync(path.join(characterAssetDir, fileName), characterSvgFor(character), "utf8");
  character.image = relativePath;
}

fs.writeFileSync(path.join(uiAssetDir, "character-select.svg"), uiSelectSvg(), "utf8");
fs.writeFileSync(eventFile, `${JSON.stringify(events, null, 2)}\n`, "utf8");
fs.writeFileSync(endingFile, `${JSON.stringify(endings, null, 2)}\n`, "utf8");
fs.writeFileSync(characterFile, `${JSON.stringify(characters, null, 2)}\n`, "utf8");
console.log(`Generated ${events.length} event images, ${endings.length} ending images, and ${characters.length} character images.`);
