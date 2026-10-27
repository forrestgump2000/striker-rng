import './style.css';
import {
  RARITY, RARITIES, ATTRIBUTES, ATTR, SQUAD, SQUADS, WEAPON, WEAPONS, CHARACTERS, CHARACTER,
  COSMETICS, COSMETIC, COSMETIC_SLOTS, HAIR_COLORS, SKIN_TONES,
} from './data.js';
import {
  loadSave, writeSave, resetSave, charStats, charOvr, rankFor, rarityOdds, rollCharacter,
  newBuild, pickPreview, applyPick, buildValues, buildOvr, pickCount, weightedOvr, completeBuild,
  xpForLevel, luckFor, PITY_LIMIT,
} from './game.js';
import { portraitSVG } from './portrait.js';
import { AvatarPreview } from './avatar3d.js';
import { sfx, setSound } from './sound.js';

let save = loadSave();
setSound(save.sound);
let rolling = false;
let lastRollNew = false;
let cosTab = 'hair';
let avatar = null;

const $ = (sel, root = document) => root.querySelector(sel);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const persist = () => writeSave(save);

const portraitCache = {};
const portrait = c => (portraitCache[c.id] ||= portraitSVG(c));

const FIRST = ['Kai', 'Ren', 'Sora', 'Hiro', 'Jun', 'Ryo', 'Aoi', 'Rin', 'Yuki', 'Taro', 'Ken', 'Shou', 'Rei', 'Haru', 'Zen'];
const LAST = ['Aozora', 'Kurogane', 'Hayabusa', 'Tenma', 'Ikazuchi', 'Shiranui', 'Mikazuki', 'Kagami', 'Hoshino', 'Raiden', 'Fujimori', 'Akatsuki'];
const randName = () => `${FIRST[Math.floor(Math.random() * FIRST.length)]} ${LAST[Math.floor(Math.random() * LAST.length)]}`;
const randNumber = () => [7, 9, 10, 11, 17, 19, 20, 99][Math.floor(Math.random() * 8)];

function ensureBuild() {
  if (!save.build) {
    save.build = newBuild(save);
    save.build.name = randName();
    save.build.number = randNumber();
  }
}

// ---------------- layout ----------------
function shell() {
  $('#app').innerHTML = `
  <header class="topbar">
    <div class="logo" data-action="help" title="How to play">
      <img src="/icon.svg" alt="" width="40" height="40" />
      <div><span class="logo-a">STRIKER</span><span class="logo-b">RNG</span></div>
    </div>
    <div class="top-stats" id="top-stats"></div>
    <nav class="top-actions">
      <button class="btn ghost" data-action="index">Index</button>
      <button class="btn ghost" data-action="armory">Armory</button>
      <button class="btn ghost icon-btn" data-action="sound" id="sound-btn" title="Toggle sound"></button>
      <button class="btn ghost icon-btn" data-action="help" title="How to play">?</button>
    </nav>
  </header>
  <main class="layout">
    <section class="panel col-left" id="left"></section>
    <section class="panel col-center" id="center"></section>
    <section class="panel col-right" id="right">
      <div class="preview-wrap">
        <div class="panel-title">Striker Preview</div>
        <div id="avatar" class="avatar-stage"></div>
        <div id="preview-hud" class="preview-hud"></div>
      </div>
      <div id="custom"></div>
      <div id="build-summary"></div>
      <div id="saved"></div>
    </section>
  </main>
  <div id="fx"></div>
  <div id="modal-root"></div>
  <div id="toasts"></div>`;
}

function renderTop() {
  const need = xpForLevel(save.level);
  $('#top-stats').innerHTML = `
    <div class="stat-chip level">
      <span class="lbl">LV</span><b>${save.level}</b>
      <div class="xpbar"><i style="width:${(save.xp / need * 100).toFixed(1)}%"></i></div>
      <span class="xp">${save.xp}/${need} XP</span>
    </div>
    <div class="stat-chip"><span class="lbl">Luck</span><b>x${luckFor(save.level).toFixed(2)}</b></div>
    <div class="stat-chip"><span class="lbl">Rolls</span><b>${save.totalRolls}</b></div>
    <div class="stat-chip"><span class="lbl">Builds</span><b>${save.buildsCompleted}</b></div>
    <div class="stat-chip hide-sm"><span class="lbl">Best</span><b>${save.best || '—'}</b></div>`;
  $('#sound-btn').textContent = save.sound ? '♪' : '✕';
}

// ---------------- left: character card ----------------
function cardHTML(c, { isNew = false } = {}) {
  const r = RARITY[c.rarity];
  const s = SQUAD[c.squad];
  const w = WEAPON[c.weapon];
  return `
  <div class="char-card r-${c.rarity}" style="--rc:${r.color};--rg:${r.glow}">
    <div class="card-ribbon">${r.name.toUpperCase()}${isNew ? '<span class="new-tag">NEW!</span>' : ''}</div>
    <div class="card-portrait">
      ${portrait(c)}
      <div class="card-ovr"><b>${charOvr(c)}</b><span>OVR</span></div>
      <div class="card-squad" style="--sc:${s.color}">${s.name}</div>
    </div>
    <div class="card-body">
      <h3 class="card-name">${esc(c.name)}</h3>
      <div class="card-style">${esc(c.style)}</div>
      <div class="card-row"><span class="k">Ability</span><span class="v">${esc(c.ability)}</span></div>
      <div class="card-row weapon r-${w.rarity}" style="--wc:${RARITY[w.rarity].color}">
        <span class="k">Weapon</span><span class="v"><b>${esc(w.name)}</b> <em>PWR ${w.power}</em></span>
      </div>
    </div>
  </div>`;
}

function renderLeft() {
  const b = save.build;
  const c = b.current ? CHARACTER[b.current] : null;
  const odds = rarityOdds(save.level);
  $('#left').innerHTML = `
    <div class="panel-title">Rolled Player</div>
    <div id="card-slot" class="card-slot">
      ${c ? cardHTML(c, { isNew: lastRollNew }) : `
        <div class="char-card empty">
          <div class="empty-q">?</div>
          <p>Roll a player to start drafting attributes.</p>
        </div>`}
    </div>
    <button class="btn roll-btn ${c || rolling ? 'hidden' : ''}" data-action="roll" ${rolling ? 'disabled' : ''}>
      <span>ROLL</span>
    </button>
    <div class="odds">
      <div class="odds-head"><span>Roll Odds</span><span class="pity" title="Guaranteed Epic or better">Pity ${save.pity}/${PITY_LIMIT}</span></div>
      ${odds.map(o => `
        <div class="odds-row" style="--rc:${o.color}">
          <span class="dot"></span><span class="nm">${o.name}</span>
          <div class="ob"><i style="width:${Math.max(1.5, Math.sqrt(o.chance) * 100).toFixed(1)}%"></i></div>
          <b>${(o.chance * 100).toFixed(o.chance < 0.01 ? 2 : 1)}%</b>
        </div>`).join('')}
    </div>`;
}

// ---------------- center: attribute picker ----------------
function renderCenter() {
  const b = save.build;
  const c = b.current ? CHARACTER[b.current] : null;
  const n = pickCount(b);
  const values = buildValues(b);
  const curOvr = weightedOvr(values);

  let bestKey = null, bestVal = -1;
  const cards = ATTRIBUTES.map(a => {
    const taken = b.picks[a.key];
    if (taken) {
      const src = CHARACTER[taken.charId];
      return `
      <div class="attr-card taken" style="--rc:${RARITY[taken.rarity].color}">
        <div class="attr-badge">${a.abbr}</div>
        <div class="attr-main">
          <div class="attr-name">${a.name}</div>
          <div class="attr-sub">Locked from ${esc(src.name)}</div>
        </div>
        <div class="attr-val"><b>${taken.value}</b><span class="lock">✓</span></div>
      </div>`;
    }
    if (!c) {
      return `
      <div class="attr-card disabled">
        <div class="attr-badge">${a.abbr}</div>
        <div class="attr-main"><div class="attr-name">${a.name}</div><div class="attr-sub">${a.desc}</div></div>
        <div class="attr-val"><b>—</b></div>
      </div>`;
    }
    const p = pickPreview(b, c, a.key);
    const proj = weightedOvr({ ...values, [a.key]: p.value });
    const score = p.value * a.weight;
    if (score > bestVal) { bestVal = score; bestKey = a.key; }
    const tier = p.value >= 90 ? 'elite' : p.value >= 80 ? 'great' : p.value >= 70 ? 'good' : p.value >= 60 ? 'ok' : 'low';
    const extra = a.key === 'weapon'
      ? `<div class="attr-up weapon-up">Skill → <b>${esc(WEAPON[c.weapon].name)}</b></div>`
      : `<div class="attr-up">Build OVR ${n ? curOvr : '—'} → <b>${proj}</b></div>`;
    return `
    <button class="attr-card pick t-${tier}" data-action="pick" data-attr="${a.key}" ${rolling ? 'disabled' : ''}>
      <div class="attr-badge">${a.abbr}</div>
      <div class="attr-main">
        <div class="attr-name">${a.name}<span class="best-tag" data-best="${a.key}">BEST</span></div>
        <div class="attr-bonus">
          <span>Base ${p.base}</span>
          ${p.charBonus ? `<span class="cb">+${p.charBonus} Char</span>` : ''}
          ${p.squadBonus ? `<span class="sb">+${p.squadBonus} Squad</span>` : ''}
        </div>
        ${extra}
      </div>
      <div class="attr-val"><b>${p.value}</b></div>
    </button>`;
  }).join('');

  const sq = SQUAD[b.squad];
  $('#center').innerHTML = `
    <div class="center-head">
      <div>
        <div class="panel-title">Pick an Attribute</div>
        <h2 class="center-name ${c ? 'r-' + c.rarity : ''}" style="--rc:${c ? RARITY[c.rarity].color : '#fff'}">
          ${c ? esc(c.name) : rolling ? 'Rolling…' : 'No player rolled'}
        </h2>
      </div>
      <div class="progress-box">
        <div class="pc"><b>${n}</b>/10 Attributes</div>
        <div class="segs">${ATTRIBUTES.map((_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>
        <div class="pc small"><b>${save.buildsCompleted}</b> Builds Complete</div>
      </div>
    </div>
    <div class="attr-grid">${cards}</div>
    <div class="center-foot">
      <div class="squad-pill" style="--sc:${sq.color}">
        <span class="lbl">Your Squad</span><b>${sq.name}</b>
        <span class="hint">+3 to picks from ${sq.name} players</span>
      </div>
      <div class="reroll-box">
        <div class="reroll-count"><b>${b.rerolls}</b> reroll${b.rerolls === 1 ? '' : 's'} left</div>
        <button class="btn reroll" data-action="reroll-player" ${!c || !b.rerolls || rolling ? 'disabled' : ''}>⟳ Reroll Player</button>
        <button class="btn reroll alt" data-action="reroll-team" ${!b.rerolls || rolling ? 'disabled' : ''}>⟳ Reroll Team</button>
      </div>
    </div>`;
  if (bestKey) $(`[data-best="${bestKey}"]`)?.classList.add('show');
}

// ---------------- right: preview + cosmetics + build ----------------
function previewInfo() {
  const b = save.build;
  const n = pickCount(b);
  return { number: b.number, name: b.name.split(' ').pop(), power: n ? (buildOvr(b) / 99) * (n / 10) : 0 };
}

function refreshAvatar(celebrate = false) {
  if (!avatar) return;
  avatar.update(save.equipped, previewInfo());
  if (celebrate) avatar.celebrate();
}

function renderHud() {
  const b = save.build;
  const ovr = buildOvr(b);
  const n = pickCount(b);
  const rk = rankFor(ovr);
  const w = WEAPON[b.weapon];
  $('#preview-hud').innerHTML = `
    <div class="hud-l">
      <div class="hud-name">${esc(b.name)} <span>#${b.number}</span></div>
      <div class="hud-weapon" style="--wc:${RARITY[w.rarity].color}">⚡ ${esc(w.name)}</div>
    </div>
    <div class="hud-r" style="--rk:${n ? rk.color : '#5a6a8a'}">
      <b>${n ? ovr : '--'}</b><span>${n ? rk.rank : 'OVR'}</span>
    </div>`;
}

function renderCustom() {
  const items = COSMETICS.filter(c => c.slot === cosTab);
  const eq = save.equipped;
  const swatches = cosTab === 'hair'
    ? `<div class="swatches"><span>Color</span>${HAIR_COLORS.map(c => `<button class="sw ${eq.hairColor === c ? 'on' : ''}" style="background:${c}" data-action="hair-color" data-color="${c}" aria-label="Hair color ${c}"></button>`).join('')}</div>`
    : cosTab === 'torso'
      ? `<div class="swatches"><span>Skin</span>${SKIN_TONES.map(c => `<button class="sw ${eq.skin === c ? 'on' : ''}" style="background:${c}" data-action="skin" data-color="${c}" aria-label="Skin tone ${c}"></button>`).join('')}</div>`
      : '';
  $('#custom').innerHTML = `
    <div class="panel-title sub">Customize</div>
    <div class="tabs">${COSMETIC_SLOTS.map(s => `<button class="tab ${s.key === cosTab ? 'on' : ''}" data-action="cos-tab" data-slot="${s.key}">${s.name}</button>`).join('')}</div>
    <div class="cos-grid">
      ${items.map(it => {
        const owned = save.unlocked.includes(it.id);
        const on = eq[it.slot] === it.id;
        const r = RARITY[it.rarity];
        const lock = it.level ? `Lv ${it.level}` : 'Reward';
        return `<button class="cos ${owned ? '' : 'locked'} ${on ? 'on' : ''}" style="--rc:${r.color}" data-action="equip" data-id="${it.id}" title="${esc(it.name)} — ${r.name}${owned ? '' : ' (locked: ' + lock + ')'}">
          <span class="cos-swatch">${cosIcon(it)}</span>
          <span class="cos-name">${esc(it.name)}</span>
          <span class="cos-r">${owned ? r.name : '🔒 ' + lock}</span>
        </button>`;
      }).join('')}
    </div>
    ${swatches}`;
}

function cosIcon(it) {
  if (it.slot === 'clothing') return `<i style="background:linear-gradient(135deg, ${it.preset.main} 60%, ${it.preset.trim} 60%)"></i>`;
  if (it.slot === 'aura') return it.preset ? `<i class="aura-dot" style="--ac:${it.preset.color}"></i>` : '<i style="background:#0a1230"></i>';
  return `<i class="glyph">${{ hair: '✦', face: '◉', torso: '▣', arms: '▮', legs: '▯' }[it.slot]}</i>`;
}

function renderBuildSummary() {
  const b = save.build;
  const n = pickCount(b);
  $('#build-summary').innerHTML = `
    <div class="panel-title sub">Your Build <span class="muted">${n}/10 complete</span></div>
    <div class="build-list">
      ${ATTRIBUTES.map(a => {
        const p = b.picks[a.key];
        return `<div class="bl-row ${p ? '' : 'empty'}" style="--rc:${p ? RARITY[p.rarity].color : '#24345c'}">
          <span class="ab">${a.abbr}</span>
          <div class="bar"><i style="width:${p ? p.value : 0}%"></i></div>
          <b>${p ? p.value : '—'}</b>
        </div>`;
      }).join('')}
    </div>`;
}

function renderSaved() {
  const list = save.savedBuilds;
  $('#saved').innerHTML = `
    <div class="panel-title sub">Saved Builds <span class="muted">${list.length}</span></div>
    ${list.length ? `<div class="saved-grid">${list.map(sb => {
      const rk = rankFor(sb.ovr);
      return `<button class="saved-card" data-action="view-build" data-id="${sb.id}" style="--rk:${rk.color}">
        <img src="${sb.thumb}" alt="" loading="lazy" />
        <div class="sc-info"><b>${esc(sb.name)}</b><span>${sb.ovr} OVR · ${rk.rank}</span></div>
      </button>`;
    }).join('')}</div>` : '<p class="muted small pad">Complete 10 attributes to save your first striker.</p>'}`;
}

function renderAll() {
  renderTop(); renderLeft(); renderCenter(); renderHud(); renderCustom(); renderBuildSummary(); renderSaved();
}

// ---------------- effects ----------------
function toast(html, color = '#2f9bff', ms = 2800) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.setProperty('--tc', color);
  el.innerHTML = html;
  $('#toasts').appendChild(el);
  setTimeout(() => el.classList.add('out'), ms);
  setTimeout(() => el.remove(), ms + 400);
}

function burst(color, count = 26, origin) {
  const fx = $('#fx');
  const rect = origin?.getBoundingClientRect?.() || { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    p.className = 'spark';
    const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 180;
    p.style.cssText = `left:${cx}px;top:${cy}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;--c:${color};--s:${4 + Math.random() * 7}px`;
    fx.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

function rarityBanner(r) {
  const el = document.createElement('div');
  el.className = `rarity-banner r-${r.key}`;
  el.style.setProperty('--rc', r.color);
  el.innerHTML = `<span>${r.name.toUpperCase()}!</span>`;
  $('#fx').appendChild(el);
  setTimeout(() => el.remove(), r.tier >= 5 ? 2400 : 1600);
}

// ---------------- actions ----------------
async function doRoll(exclude) {
  if (rolling) return;
  rolling = true;
  const b = save.build;
  b.current = null;
  renderLeft(); renderCenter();
  const slot = $('#card-slot');
  slot.classList.add('spinning');

  const result = rollCharacter(save, exclude);
  b.rolls++;
  const final = result.char;
  const r = RARITY[final.rarity];

  // Slot-machine spin through random cards, slowing down.
  const frames = 16 + r.tier * 3;
  for (let i = 0; i < frames; i++) {
    const fake = i === frames - 1 ? final : CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    slot.innerHTML = `<div class="spin-card" style="--rc:${RARITY[fake.rarity].color}">${portrait(fake)}<div class="spin-r">${RARITY[fake.rarity].name}</div></div>`;
    sfx.tick(i);
    await new Promise(res => setTimeout(res, 35 + Math.pow(i / frames, 3) * 260));
  }
  if (r.tier >= 5) {
    document.body.classList.add('secret-dark');
    await new Promise(res => setTimeout(res, 700));
    document.body.classList.remove('secret-dark');
  }

  b.current = final.id;
  lastRollNew = result.isNew;
  rolling = false;
  persist();
  slot.classList.remove('spinning');
  renderLeft(); renderCenter(); renderTop();
  const card = $('.char-card');
  card?.classList.add('reveal');
  sfx.reveal(r.tier);
  burst(r.color, 14 + r.tier * 10, card);
  if (r.tier >= 2) rarityBanner(r);
  if (r.tier >= 3) { document.body.classList.add('shake'); setTimeout(() => document.body.classList.remove('shake'), 500); }
  if (result.pityHit) toast('Pity triggered — guaranteed Epic+!', RARITY.epic.color);
  if (result.isNew) toast(`New player discovered: <b>${esc(final.name)}</b>`, r.color);
}

function doPick(attrKey, el) {
  const b = save.build;
  if (rolling || !b.current || b.picks[attrKey]) return;
  const c = CHARACTER[b.current];
  const p = applyPick(b, c, attrKey);
  sfx.pick();
  burst(RARITY[c.rarity].color, 18, el);
  if (attrKey === 'weapon') toast(`Special skill reset to <b>${esc(WEAPON[c.weapon].name)}</b>`, RARITY[WEAPON[c.weapon].rarity].color);
  b.current = null;
  lastRollNew = false;
  persist();
  renderLeft(); renderCenter(); renderHud(); renderBuildSummary();
  refreshAvatar(true);
  if (pickCount(b) >= 10) {
    finishBuild();
  } else {
    setTimeout(() => doRoll(), 450);
  }
  return p;
}

function finishBuild() {
  const b = save.build;
  const result = completeBuild(save, b);
  b.completed = true;
  b.result = result;
  persist();
  sfx.complete();
  renderTop(); renderCustom();
  setTimeout(() => showReview(), 600);
}

function rewardLine(rw) {
  const it = rw.item;
  const r = RARITY[it.rarity];
  const label = { cosmetic: 'Cosmetic', milestone: 'Milestone', weapon: 'Weapon', 'weapon-dup': 'Duplicate weapon (+25 XP)' }[rw.type];
  return `<li style="--rc:${r.color}"><span class="rw-r">${r.name}</span><b>${esc(it.name)}</b><em>${label}</em></li>`;
}

function showReview() {
  const b = save.build;
  const res = b.result;
  const rk = rankFor(res.ovr);
  const levelUnlocks = res.levelUps.flatMap(l => l.unlocks);
  const w = WEAPON[b.weapon];
  modal(`
    <div class="review">
      <div class="review-top">
        <div class="rank-big" style="--rk:${rk.color}"><b>${rk.rank}</b><span>RANK</span></div>
        <div>
          <div class="panel-title">Striker Complete</div>
          <input class="name-input" id="build-name" maxlength="24" value="${esc(b.name)}" aria-label="Striker name" />
          <div class="review-meta">OVR <b>${res.ovr}</b> · ${SQUAD[b.squad].name} · Skill <b style="color:${RARITY[w.rarity].color}">${esc(w.name)}</b></div>
        </div>
      </div>
      <div class="review-grid">
        <div class="review-stats">
          ${ATTRIBUTES.map(a => {
            const p = b.picks[a.key];
            return `<div class="rs-row" style="--rc:${RARITY[p.rarity].color}"><span>${a.name}</span><div class="bar"><i style="width:${p.value}%"></i></div><b>${p.value}</b><em>${esc(CHARACTER[p.charId].name.split(' ')[0])}</em></div>`;
          }).join('')}
        </div>
        <div class="review-rewards">
          <div class="panel-title sub">Rewards</div>
          <div class="xp-gain">+${res.xp} XP</div>
          ${res.levelUps.map(l => `<div class="lvl-up">LEVEL UP → ${l.level} <span>Luck x${luckFor(l.level).toFixed(2)}</span></div>`).join('')}
          <ul class="rw-list">
            ${res.rewards.map(rewardLine).join('')}
            ${levelUnlocks.map(it => rewardLine({ type: 'cosmetic', item: it })).join('')}
          </ul>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn primary" data-action="save-build">Save Build & Roll Again</button>
        <button class="btn ghost" data-action="discard-build">Discard & Roll Again</button>
      </div>
    </div>`, { locked: true });
  const top = res.rewards.reduce((m, r) => Math.max(m, RARITY[r.item.rarity].tier), 0);
  burst(rk.color, 60);
  if (top >= 3) rarityBanner(RARITY[RARITIES[top].key]);
}

function thumbFromAvatar() {
  const src = avatar.snapshot();
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      const h = 200, w = Math.round(img.width / img.height * h);
      c.width = Math.min(w, 200); c.height = h;
      const g = c.getContext('2d');
      const grd = g.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, '#0c1a3d'); grd.addColorStop(1, '#03060f');
      g.fillStyle = grd; g.fillRect(0, 0, c.width, h);
      g.drawImage(img, (c.width - w) / 2, 0, w, h);
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => resolve('');
    img.src = src;
  });
}

async function saveBuild() {
  const b = save.build;
  const nm = $('#build-name')?.value.trim();
  if (nm) b.name = nm;
  refreshAvatar();
  const thumb = await thumbFromAvatar();
  save.savedBuilds.unshift({
    id: b.id, name: b.name, number: b.number, ovr: b.result.ovr, rank: b.result.rank,
    picks: b.picks, weapon: b.weapon, squad: b.squad, look: { ...save.equipped }, thumb, date: Date.now(),
  });
  save.savedBuilds = save.savedBuilds.slice(0, 40);
  toast(`Saved <b>${esc(b.name)}</b>`, '#4ade80');
  startNextBuild();
}

function startNextBuild() {
  save.build = null;
  ensureBuild();
  persist();
  closeModal();
  renderAll();
  refreshAvatar();
  setTimeout(() => doRoll(), 300);
}

function viewBuild(id) {
  const sb = save.savedBuilds.find(x => x.id === id);
  if (!sb) return;
  const rk = rankFor(sb.ovr);
  const w = WEAPON[sb.weapon];
  modal(`
    <div class="review">
      <div class="review-top">
        <img class="sb-thumb" src="${sb.thumb}" alt="" />
        <div>
          <div class="panel-title">Saved Striker</div>
          <h2 class="sb-name">${esc(sb.name)} <span>#${sb.number}</span></h2>
          <div class="review-meta">OVR <b>${sb.ovr}</b> · Rank <b style="color:${rk.color}">${rk.rank}</b> · ${SQUAD[sb.squad].name}</div>
          <div class="review-meta">Skill <b style="color:${RARITY[w.rarity].color}">${esc(w.name)}</b> — ${esc(w.desc)}</div>
          <div class="review-meta muted">${new Date(sb.date).toLocaleString()}</div>
        </div>
      </div>
      <div class="review-stats">
        ${ATTRIBUTES.map(a => {
          const p = sb.picks[a.key];
          return `<div class="rs-row" style="--rc:${RARITY[p.rarity].color}"><span>${a.name}</span><div class="bar"><i style="width:${p.value}%"></i></div><b>${p.value}</b><em>${esc(CHARACTER[p.charId]?.name.split(' ')[0] || '')}</em></div>`;
        }).join('')}
      </div>
      <div class="modal-actions">
        <button class="btn primary" data-action="wear-build" data-id="${sb.id}">Wear This Look</button>
        <button class="btn danger" data-action="delete-build" data-id="${sb.id}">Delete</button>
        <button class="btn ghost" data-action="close">Close</button>
      </div>
    </div>`);
}

function showIndex() {
  const found = new Set(save.discovered);
  modal(`
    <div class="panel-title">Player Index <span class="muted">${found.size}/${CHARACTERS.length} discovered</span></div>
    <div class="index-grid">
      ${CHARACTERS.map(c => {
        const r = RARITY[c.rarity];
        const has = found.has(c.id);
        return `<div class="idx ${has ? '' : 'unknown'}" style="--rc:${r.color}">
          <div class="idx-p">${has ? portrait(c) : '<div class="idx-q">?</div>'}</div>
          <b>${has ? esc(c.name) : '???'}</b>
          <span>${r.name}${has ? ' · ' + charOvr(c) : ''}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="modal-actions"><button class="btn ghost" data-action="close">Close</button></div>`, { wide: true });
}

function showArmory() {
  modal(`
    <div class="panel-title">Armory <span class="muted">${save.armory.length}/${WEAPONS.length} weapons</span></div>
    <p class="muted small">Pick a starting skill for your next build. Choosing the Weapon attribute during a build replaces it.</p>
    <div class="armory-grid">
      ${WEAPONS.map(w => {
        const r = RARITY[w.rarity];
        const has = save.armory.includes(w.id);
        const on = save.startWeapon === w.id;
        return `<button class="wpn ${has ? '' : 'locked'} ${on ? 'on' : ''}" style="--rc:${r.color}" data-action="equip-weapon" data-id="${w.id}" ${has ? '' : 'disabled'}>
          <span class="wpn-r">${r.name}</span>
          <b>${has ? esc(w.name) : '???'}</b>
          <span class="wpn-p">PWR ${has ? w.power : '??'}</span>
          <em>${has ? esc(w.desc) : 'Earn by completing builds.'}</em>
        </button>`;
      }).join('')}
    </div>
    <div class="modal-actions"><button class="btn ghost" data-action="close">Close</button></div>`, { wide: true });
}

function showHelp() {
  modal(`
    <div class="panel-title">How to Play</div>
    <ol class="help">
      <li><b>Roll</b> a random soccer player. Rarer players (Epic → Secret) have higher ratings.</li>
      <li><b>Pick one attribute</b> to steal from them. Signature attributes give a <span class="cb">Char bonus</span>; players from your squad add a <span class="sb">Squad bonus</span>.</li>
      <li><b>Weapon</b> resets your special skill to that player's signature shot.</li>
      <li>You get <b>1 reroll per build</b> — use it on the player or your squad.</li>
      <li>Fill all <b>10 attributes</b> to finish. Better builds earn rarer cosmetics, weapons, XP and Luck.</li>
      <li>Every ${PITY_LIMIT} rolls without an Epic+ guarantees one.</li>
    </ol>
    <div class="modal-actions">
      <button class="btn danger" data-action="reset">Reset Save</button>
      <button class="btn primary" data-action="close">Let's Go</button>
    </div>`);
}

function modal(html, opts = {}) {
  $('#modal-root').innerHTML = `<div class="modal-bg ${opts.locked ? 'locked' : ''}" data-action="${opts.locked ? '' : 'close-bg'}"><div class="modal ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true">${html}</div></div>`;
}
function closeModal() { $('#modal-root').innerHTML = ''; }

function equip(id) {
  const it = COSMETIC[id];
  if (!save.unlocked.includes(id)) {
    sfx.error();
    toast(`🔒 ${esc(it.name)} — ${it.level ? 'unlocks at Level ' + it.level : 'earn it as a build reward'}`, RARITY[it.rarity].color);
    return;
  }
  save.equipped[it.slot] = id;
  sfx.click();
  persist();
  renderCustom();
  refreshAvatar(true);
}

// ---------------- events ----------------
document.addEventListener('click', e => {
  const t = e.target.closest('[data-action]');
  if (!t) return;
  const act = t.dataset.action;
  switch (act) {
    case 'roll': sfx.click(); doRoll(); break;
    case 'pick': doPick(t.dataset.attr, t); break;
    case 'reroll-player': {
      const b = save.build;
      if (!b.rerolls || !b.current) return;
      b.rerolls--; sfx.reroll();
      doRoll(b.current);
      break;
    }
    case 'reroll-team': {
      const b = save.build;
      if (!b.rerolls) return;
      b.rerolls--; sfx.reroll();
      const others = SQUADS.filter(s => s.key !== b.squad);
      b.squad = others[Math.floor(Math.random() * others.length)].key;
      persist(); renderCenter();
      toast(`New squad: <b>${SQUAD[b.squad].name}</b>`, SQUAD[b.squad].color);
      burst(SQUAD[b.squad].color, 24, $('.squad-pill'));
      break;
    }
    case 'cos-tab': cosTab = t.dataset.slot; sfx.click(); renderCustom(); break;
    case 'equip': equip(t.dataset.id); break;
    case 'hair-color': save.equipped.hairColor = t.dataset.color; persist(); renderCustom(); refreshAvatar(); break;
    case 'skin': save.equipped.skin = t.dataset.color; persist(); renderCustom(); refreshAvatar(); break;
    case 'save-build': saveBuild(); break;
    case 'discard-build': startNextBuild(); break;
    case 'view-build': sfx.click(); viewBuild(t.dataset.id); break;
    case 'wear-build': {
      const sb = save.savedBuilds.find(x => x.id === t.dataset.id);
      if (sb) {
        for (const [k, v] of Object.entries(sb.look)) if (!COSMETIC[v] || save.unlocked.includes(v)) save.equipped[k] = v;
        persist(); renderCustom(); refreshAvatar(true); closeModal();
      }
      break;
    }
    case 'delete-build':
      if (!confirm('Delete this saved build?')) return;
      save.savedBuilds = save.savedBuilds.filter(x => x.id !== t.dataset.id);
      persist(); renderSaved(); closeModal();
      break;
    case 'index': sfx.click(); showIndex(); break;
    case 'armory': sfx.click(); showArmory(); break;
    case 'equip-weapon':
      save.startWeapon = t.dataset.id; persist();
      toast(`Next build starts with <b>${esc(WEAPON[t.dataset.id].name)}</b>`, RARITY[WEAPON[t.dataset.id].rarity].color);
      showArmory();
      break;
    case 'sound': save.sound = !save.sound; setSound(save.sound); persist(); renderTop(); break;
    case 'help': showHelp(); break;
    case 'reset':
      if (!confirm('Reset ALL progress, builds and unlocks?')) return;
      save = resetSave(); ensureBuild(); persist(); closeModal(); renderAll(); refreshAvatar();
      break;
    case 'close': closeModal(); break;
    case 'close-bg': if (e.target === t) closeModal(); break;
  }
});

document.addEventListener('keydown', e => {
  if (e.target.matches('input, textarea')) return;
  if (e.key === 'Escape' && !$('.modal-bg.locked')) closeModal();
  if ((e.key === ' ' || e.key === 'Enter') && !save.build.current && !rolling && !$('.modal-bg')) { e.preventDefault(); doRoll(); }
  const idx = '1234567890'.indexOf(e.key);
  if (idx >= 0 && !$('.modal-bg')) {
    const a = ATTRIBUTES[idx];
    const el = $(`[data-attr="${a.key}"]`);
    if (el) doPick(a.key, el);
  }
});

// ---------------- boot ----------------
ensureBuild();
shell();
renderAll();
try {
  avatar = new AvatarPreview($('#avatar'));
  refreshAvatar();
} catch (err) {
  $('#avatar').innerHTML = '<p class="muted pad">3D preview needs WebGL.</p>';
  console.error(err);
}
if (save.build.completed) showReview();
else if (!save.savedBuilds.length && !save.totalRolls) setTimeout(showHelp, 300);
