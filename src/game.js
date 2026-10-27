// Core rules: stat generation, rarity rolls, builds, progression and save data.
import {
  RARITIES, RARITY, ATTRIBUTES, ATTR, SQUADS, WEAPONS, WEAPON, CHARACTERS, CHARACTER,
  COSMETICS, COSMETIC, DEFAULT_EQUIPPED,
} from './data.js';

const SAVE_KEY = 'striker-rng-save-v1';
export const PITY_LIMIT = 10;      // guaranteed Epic+ after this many rolls without one
export const REROLLS_PER_BUILD = 1;

// ---------- deterministic stats ----------
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function seeded(seed) {
  let s = seed || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 10000) / 10000; };
}

const statCache = {};
export function charStats(c) {
  if (statCache[c.id]) return statCache[c.id];
  const r = RARITY[c.rarity];
  const [lo, hi] = r.range;
  const rand = seeded(hash(c.id));
  const stats = {};
  for (const a of ATTRIBUTES) {
    if (a.key === 'weapon') { stats.weapon = WEAPON[c.weapon].power; continue; }
    const fi = c.focus.indexOf(a.key);
    let v;
    if (fi === 0) v = hi - rand() * 2;
    else if (fi === 1) v = hi - 2 - rand() * 4;
    else if (fi === 2) v = hi - 5 - rand() * 5;
    else v = lo + rand() * (hi - lo) * 0.7;
    stats[a.key] = Math.round(Math.min(99, v));
  }
  statCache[c.id] = stats;
  return stats;
}

export function weightedOvr(values) {
  let sum = 0, w = 0;
  for (const a of ATTRIBUTES) {
    if (values[a.key] == null) continue;
    sum += values[a.key] * a.weight; w += a.weight;
  }
  return w ? Math.round(sum / w) : 0;
}

export function charOvr(c) {
  const s = charStats(c);
  // Characters are rated on their strengths, like a real striker card.
  const top = Object.entries(s).filter(([k]) => k !== 'weapon').map(([, v]) => v).sort((a, b) => b - a).slice(0, 5);
  return Math.round(top.reduce((a, b) => a + b, 0) / top.length * 0.8 + s.weapon * 0.2);
}

export function rankFor(ovr) {
  if (ovr >= 94) return { rank: 'SSS', color: '#7dfff0' };
  if (ovr >= 89) return { rank: 'SS',  color: '#ff3b6b' };
  if (ovr >= 83) return { rank: 'S',   color: '#ffb627' };
  if (ovr >= 76) return { rank: 'A',   color: '#b65cff' };
  if (ovr >= 68) return { rank: 'B',   color: '#3fa9ff' };
  if (ovr >= 58) return { rank: 'C',   color: '#4ade80' };
  return { rank: 'D', color: '#9fb0c8' };
}

// ---------- save ----------
function freshSave() {
  const unlocked = COSMETICS.filter(c => c.default).map(c => c.id);
  return {
    v: 1, level: 1, xp: 0, totalRolls: 0, pity: 0, buildsCompleted: 0,
    discovered: [], unlocked, equipped: { ...DEFAULT_EQUIPPED },
    armory: ['toe_poke'], startWeapon: 'toe_poke',
    savedBuilds: [], build: null, sound: true, best: 0,
  };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return freshSave();
    const data = { ...freshSave(), ...JSON.parse(raw) };
    data.equipped = { ...DEFAULT_EQUIPPED, ...data.equipped };
    return data;
  } catch { return freshSave(); }
}
export function writeSave(s) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
}
export function resetSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
  return freshSave();
}

// ---------- progression ----------
export const xpForLevel = lvl => 120 + (lvl - 1) * 70;
export const luckFor = lvl => Math.min(3, 1 + (lvl - 1) * 0.12);

export function rarityOdds(level) {
  const luck = luckFor(level);
  const weights = RARITIES.map(r => r.weight * (r.tier ? Math.pow(luck, r.tier * 0.55) : 1));
  const total = weights.reduce((a, b) => a + b, 0);
  return RARITIES.map((r, i) => ({ ...r, chance: weights[i] / total }));
}

function pickRarity(odds, minTier = 0) {
  const pool = odds.filter(o => o.tier >= minTier);
  const total = pool.reduce((a, o) => a + o.chance, 0);
  let x = Math.random() * total;
  for (const o of pool) { x -= o.chance; if (x <= 0) return o.key; }
  return pool[pool.length - 1].key;
}

export function rollCharacter(save, excludeId) {
  const odds = rarityOdds(save.level);
  const pityHit = save.pity >= PITY_LIMIT - 1;
  const rarity = pickRarity(odds, pityHit ? 2 : 0);
  let pool = CHARACTERS.filter(c => c.rarity === rarity && c.id !== excludeId);
  if (!pool.length) pool = CHARACTERS.filter(c => c.rarity === rarity);
  const c = pool[Math.floor(Math.random() * pool.length)];
  save.totalRolls++;
  save.pity = RARITY[rarity].tier >= 2 ? 0 : save.pity + 1;
  const isNew = !save.discovered.includes(c.id);
  if (isNew) save.discovered.push(c.id);
  return { char: c, isNew, pityHit };
}

// ---------- builds ----------
export function newBuild(save) {
  return {
    id: 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    squad: SQUADS[Math.floor(Math.random() * SQUADS.length)].key,
    weapon: save.armory.includes(save.startWeapon) ? save.startWeapon : 'toe_poke',
    picks: {},
    rerolls: REROLLS_PER_BUILD,
    current: null,
    rolls: 0,
  };
}

export function pickPreview(build, char, attrKey) {
  const stats = charStats(char);
  const base = stats[attrKey];
  const charBonus = char.focus.slice(0, 2).includes(attrKey) ? RARITY[char.rarity].bonus : 0;
  const squadBonus = char.squad === build.squad ? 3 : 0;
  const value = Math.min(99, base + charBonus + squadBonus);
  return { base, charBonus, squadBonus, value };
}

export function applyPick(build, char, attrKey) {
  const p = pickPreview(build, char, attrKey);
  build.picks[attrKey] = { ...p, charId: char.id, rarity: char.rarity };
  if (attrKey === 'weapon') build.weapon = char.weapon;
  return p;
}

export function buildValues(build) {
  const out = {};
  for (const [k, p] of Object.entries(build.picks)) out[k] = p.value;
  return out;
}
export const buildOvr = build => weightedOvr(buildValues(build));
export const pickCount = build => Object.keys(build.picks).length;

// ---------- rewards ----------
function rewardRarity(ovr, level) {
  // Better builds and higher levels push rewards toward rarer tiers.
  const boost = Math.max(0, (ovr - 55) / 10) + (level - 1) * 0.15;
  const weights = RARITIES.map(r => r.weight * Math.pow(1.3 + boost * 0.3, r.tier));
  const total = weights.reduce((a, b) => a + b, 0);
  let x = Math.random() * total;
  for (let i = 0; i < RARITIES.length; i++) { x -= weights[i]; if (x <= 0) return RARITIES[i].key; }
  return 'common';
}

function grantCosmetic(save, rarity) {
  const tiers = RARITIES.map(r => r.key);
  for (let t = tiers.indexOf(rarity); t >= 0; t--) {
    const pool = COSMETICS.filter(c => c.rarity === tiers[t] && !save.unlocked.includes(c.id));
    if (pool.length) {
      const c = pool[Math.floor(Math.random() * pool.length)];
      save.unlocked.push(c.id);
      return c;
    }
  }
  return null;
}

function grantWeapon(save, rarity) {
  const pool = WEAPONS.filter(w => w.rarity === rarity);
  const w = pool[Math.floor(Math.random() * pool.length)];
  const dup = save.armory.includes(w.id);
  if (!dup) save.armory.push(w.id);
  return { weapon: w, dup };
}

export function addXp(save, amount) {
  const levelUps = [];
  save.xp += amount;
  while (save.xp >= xpForLevel(save.level)) {
    save.xp -= xpForLevel(save.level);
    save.level++;
    const unlocks = COSMETICS.filter(c => c.level && c.level <= save.level && !save.unlocked.includes(c.id));
    unlocks.forEach(c => save.unlocked.push(c.id));
    levelUps.push({ level: save.level, unlocks });
  }
  return levelUps;
}

export function completeBuild(save, build) {
  const ovr = buildOvr(build);
  const { rank } = rankFor(ovr);
  save.buildsCompleted++;
  save.best = Math.max(save.best, ovr);
  const rewards = [];
  let xp = 60 + Math.round(ovr * 1.6) + ({ SSS: 120, SS: 80, S: 50, A: 30 }[rank] || 0);

  const cos = grantCosmetic(save, rewardRarity(ovr, save.level));
  if (cos) rewards.push({ type: 'cosmetic', item: cos });
  const wr = grantWeapon(save, rewardRarity(ovr - 4, save.level));
  if (wr.dup) { xp += 25; rewards.push({ type: 'weapon-dup', item: wr.weapon }); }
  else rewards.push({ type: 'weapon', item: wr.weapon });

  // Milestone rewards guarantee a rarer item.
  const milestones = { 1: 'rare', 3: 'epic', 5: 'legendary', 10: 'mythic', 20: 'secret' };
  const ms = milestones[save.buildsCompleted];
  if (ms) {
    const m = grantCosmetic(save, ms);
    if (m) rewards.push({ type: 'milestone', item: m });
  }

  const levelUps = addXp(save, xp);
  return { ovr, rank, xp, rewards, levelUps };
}

export { CHARACTER, CHARACTERS, COSMETIC, WEAPON, ATTR };
