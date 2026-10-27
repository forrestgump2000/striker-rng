// Procedural anime-style portrait renderer (original characters, drawn as layered SVG):
// focus-line backgrounds, aura flames, cel-shaded skin, inked hair locks and glossy anime eyes.
import { RARITY, SQUAD } from './data.js';

let uid = 0;
const INK = '#120d1c';
const f = n => n.toFixed(1);

export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v + amt * 255))));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}
function mix(a, b, t) {
  const p = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function seeded(seed) {
  let s = seed || 7;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
}

// ---------- geometry ----------
const FACE = 'M62 92 C62 112 64 127 73 141 C81 153 91 162 100 168 C109 162 119 153 127 141 C136 127 138 112 138 92 C138 62 122 50 100 50 C78 50 62 62 62 92 Z';
const NECK = 'M87 136 L87 184 L113 184 L113 136 Z';
const DOME_CX = 100, DOME_CY = 92, DOME_RX = 47, DOME_RY = 50;

const domePt = (deg, k = 1) => {
  const a = deg * Math.PI / 180;
  return [DOME_CX + Math.cos(a) * DOME_RX * k, DOME_CY + Math.sin(a) * DOME_RY * k];
};

// Tapered curved lock: base segment A-B, tip T, bend = sideways curvature.
function lock(ax, ay, bx, by, tx, ty, bend = 0) {
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  const dx = tx - mx, dy = ty - my, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len * bend, ny = dx / len * bend;
  const c1 = `${f((ax + tx) / 2 + nx)} ${f((ay + ty) / 2 + ny)}`;
  strands.push(`M${f(ax)} ${f(ay)} Q${c1} ${f(tx)} ${f(ty)}`);
  return `M${f(ax)} ${f(ay)} Q${c1} ${f(tx)} ${f(ty)} Q${f((bx + tx) / 2 + nx)} ${f((by + ty) / 2 + ny)} ${f(bx)} ${f(by)} Z`;
}
let strands = [];

const STYLES = {
  spiky:  { crown: { n: 9, len: 26, from: 204, to: 336, lean: 5, bend: 5, w: 15 }, fringe: { n: 5, len: 36, lean: 4, bend: 5 }, side: 26 },
  messy:  { crown: { n: 9, len: 15, from: 202, to: 338, lean: 0, bend: 7, w: 16, chaos: 1 }, fringe: { n: 7, len: 38, lean: -3, bend: 6, chaos: 1 }, side: 30 },
  swept:  { crown: { n: 6, len: 14, from: 205, to: 340, lean: 18, bend: 6, w: 16 }, fringe: { n: 5, len: 46, lean: 24, bend: 9 }, side: 26 },
  bob:    { fringe: { n: 9, len: 34, lean: 0, bend: 2 }, side: 48, back: 22 },
  long:   { crown: { n: 4, len: 8, from: 215, to: 325, lean: 0, bend: 4, w: 18 }, fringe: { n: 6, len: 42, lean: 6, part: 100, bend: 7 }, side: 62, back: 86 },
  buzz:   { buzz: true },
  slick:  { crown: { n: 7, len: 12, from: 198, to: 300, lean: -18, bend: -6, w: 16 }, fringe: { n: 2, len: 34, lean: 8, bend: 7, x0: 90, x1: 110 }, side: 14, back: 8, combed: true },
  mohawk: { crest: { n: 7, len: 42 }, shaved: true },
};

function hairLayers(char, ids) {
  const L = char.look;
  const st = STYLES[L.hair] || STYLES.messy;
  const rnd = seeded(hash(char.id + 'hair'));
  const color = L.hairColor;
  const dark = shade(color, -0.32);
  const light = mix(color, '#ffffff', 0.45);
  const locks = [], sides = [], highlights = [];
  let back = '', dome = '', domeD = '';
  strands = [];

  // Back volume and long hair behind the head.
  if (!st.buzz && !st.shaved) {
    back += `<path d="M51 104 C46 62 72 36 100 36 C128 36 154 62 149 104 Z" fill="${dark}"/>`;
  }
  if (st.back) {
    const bottom = 112 + st.back;
    const pts = [];
    const n = 7;
    for (let i = 0; i <= n; i++) {
      const x = 50 + (i / n) * 100;
      pts.push(`L${f(x)} ${f(bottom - (i % 2 ? 0 : 10 + rnd() * 8))}`);
    }
    back += `<path d="M54 90 C46 ${f(110 + st.back * 0.3)} 48 ${f(bottom - 20)} 50 ${f(bottom)} ${pts.join(' ')} L150 ${f(bottom)} C152 ${f(bottom - 20)} 154 ${f(110 + st.back * 0.3)} 146 90 Z" fill="url(#${ids.hair})" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>`;
    back += `<path d="M58 100 C54 ${f(120 + st.back * 0.3)} 56 ${f(bottom - 14)} 60 ${f(bottom - 6)} M142 100 C146 ${f(120 + st.back * 0.3)} 144 ${f(bottom - 14)} 140 ${f(bottom - 6)}" stroke="${dark}" stroke-width="3" fill="none" opacity=".7"/>`;
  }

  // Skull cap.
  if (st.buzz) {
    domeD = 'M57 94 C54 60 74 44 100 44 C126 44 146 60 143 94 C136 76 120 64 100 63 C80 64 64 76 57 94 Z';
    dome = `<path d="${domeD}" fill="url(#${ids.hair})"/>`;
    for (let i = 0; i < 40; i++) {
      const [x, y] = domePt(200 + rnd() * 140, 0.6 + rnd() * 0.35);
      highlights.push(`<path d="M${f(x)} ${f(y)} l${f(rnd() * 2 - 1)} 2.2" stroke="${light}" stroke-width=".9" opacity=".5"/>`);
    }
  } else if (st.shaved) {
    dome = `<path d="M58 96 C55 62 74 46 100 46 C126 46 145 62 142 96 C135 78 120 66 100 65 C80 66 65 78 58 96 Z" fill="${mix(L.skin, shade(color, -0.3), 0.3)}"/>`;
  } else {
    domeD = 'M53 100 C49 62 72 40 100 40 C128 40 151 62 147 100 C140 82 122 70 100 68 C78 70 60 82 53 100 Z';
    dome = `<path d="${domeD}" fill="url(#${ids.hair})"/>`;
  }
  if (st.combed) {
    for (let i = 0; i < 6; i++) {
      const x = 66 + i * 13;
      highlights.push(`<path d="M${x} ${72 - Math.abs(x - 100) * 0.2} Q${x + 4} 54 ${x + 14} 44" stroke="${dark}" stroke-width="1.6" fill="none" opacity=".7"/>`);
    }
  }

  // Crown spikes.
  if (st.crown) {
    const c = st.crown;
    for (let i = 0; i < c.n; i++) {
      const t = c.n === 1 ? 0.5 : i / (c.n - 1);
      const deg = c.from + (c.to - c.from) * t + (c.chaos ? (rnd() - 0.5) * 14 : 0);
      const [ax, ay] = domePt(deg - c.w / 2, 0.92);
      const [bx, by] = domePt(deg + c.w / 2, 0.92);
      const k = 1 + (c.len * (0.75 + rnd() * 0.5)) / 48;
      let [tx, ty] = domePt(deg + (c.chaos ? (rnd() - 0.5) * 20 : 0), k);
      tx += c.lean * (0.6 + t * 0.6);
      locks.push(lock(ax, ay, bx, by, tx, ty, c.bend * (c.chaos && rnd() > 0.5 ? -1 : 1)));
    }
  }
  if (st.crest) {
    for (let i = 0; i < st.crest.n; i++) {
      const t = i / (st.crest.n - 1);
      const deg = 236 + t * 68;
      const [ax, ay] = domePt(deg - 7, 0.9);
      const [bx, by] = domePt(deg + 7, 0.9);
      const [tx, ty] = domePt(deg - 6, 1 + st.crest.len * (0.6 + Math.sin(t * Math.PI) * 0.5) / 48);
      locks.push(lock(ax, ay, bx, by, tx, ty, 4));
    }
  }

  // Fringe hanging over the forehead.
  const fringe = [];
  if (st.fringe) {
    const fr = st.fringe;
    const x0 = fr.x0 ?? 58, x1 = fr.x1 ?? 142;
    for (let i = 0; i < fr.n; i++) {
      const t = fr.n === 1 ? 0.5 : i / (fr.n - 1);
      const x = x0 + (x1 - x0) * t;
      const hw = (x1 - x0) / Math.max(1, fr.n) * 0.85 + 6;
      const yb = 62 + Math.pow((x - 100) / 42, 2) * 16;
      let lean = fr.lean;
      if (fr.part != null) lean = (x < fr.part ? -1 : 1) * (Math.abs(fr.lean) + 8);
      let tx = x + lean * (0.6 + rnd() * 0.6) + (fr.chaos ? (rnd() - 0.5) * 10 : 0);
      let ty = yb + fr.len * (0.75 + rnd() * 0.4) * (1 - Math.abs(t - 0.5) * 0.35);
      // Keep the eyes readable: locks over the eyes stop above the lash line.
      if (Math.abs(tx - 82) < 13 || Math.abs(tx - 118) < 13) ty = Math.min(ty, 103 + rnd() * 4);
      ty = Math.min(ty, 124);
      fringe.push(lock(x - hw, yb - 16, x + hw, yb - 16, tx, ty, fr.bend * (fr.chaos && rnd() > 0.5 ? -1 : 1)));
      highlights.push(`<path d="M${f(x - hw * 0.15)} ${f(yb + 2)} Q${f((x + tx) / 2 - 1)} ${f((yb + ty) / 2 - 2)} ${f(x + (tx - x) * 0.55)} ${f(yb + (ty - yb) * 0.55)}" stroke="${light}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".55"/>`);
    }
  }

  // Side locks framing the face.
  if (st.side) {
    for (const s of [-1, 1]) {
      const bx = 100 + s * 44;
      sides.push(lock(bx - s * 2, 80, bx - s * 13, 78, bx + s * 1, 84 + st.side, s * -4));
      sides.push(lock(bx - s * 8, 82, bx - s * 18, 80, bx - s * 7, 80 + st.side * 0.72, s * -3));
    }
  }

  // Glossy "angel ring" shine across the crown.
  if (!st.buzz && !st.shaved) {
    for (let i = 0; i < 6; i++) {
      const a0 = 214 + i * 19, a1 = a0 + 10;
      const [x0, y0] = domePt(a0, 0.74), [x1, y1] = domePt(a1, 0.74), [xm, ym] = domePt((a0 + a1) / 2, 0.69);
      highlights.push(`<path d="M${f(x0)} ${f(y0)} Q${f(xm)} ${f(ym)} ${f(x1)} ${f(y1)}" stroke="${light}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".8"/>`);
    }
  }

  const front = [...sides, ...locks, ...fringe].join(' ');
  // Ink only the outer silhouette: a stroked layer underneath, unstroked fills on top.
  return {
    back,
    fringe: fringe.join(' '),
    front: `
      <path d="${domeD} ${front}" fill="${INK}" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round"/>
      ${dome}
      <path d="${front}" fill="url(#${ids.hair})"/>
      <path d="${strands.join(' ')}" stroke="${dark}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".8"/>
      ${highlights.join('')}`,
  };
}

// ---------- face features ----------
const EYE = {
  round: { top: 12,  tilt: 1,   bottom: 6,   brow: 7,  browIn: 0 },
  sharp: { top: 9,   tilt: 4.5, bottom: 4,   brow: 6,  browIn: 1 },
  calm:  { top: 7,   tilt: 1,   bottom: 5,   brow: 8,  browIn: -1 },
  glare: { top: 7.5, tilt: 4,   bottom: 3.8, brow: 3.5,browIn: 5 },
};

function eye(cx, cy, o, kind, color, ids, glow) {
  const E = EYE[kind] || EYE.round;
  const W = 26;
  const ix = cx - o * W * 0.45, iy = cy + 1;
  const ox = cx + o * W * 0.55, oy = cy - E.tilt;
  const tcx = cx + o * 1, tcy = cy - E.top * 1.55;
  const bcx = cx, bcy = cy + E.bottom * 1.4;
  const white = `M${f(ix)} ${f(iy)} Q${f(tcx)} ${f(tcy)} ${f(ox)} ${f(oy)} Q${f(bcx)} ${f(bcy)} ${f(ix)} ${f(iy)} Z`;
  const clip = `ec${++uid}`;
  const irx = 8, iry = 6.5 + E.top * 0.45;
  const icx = cx + o * 0.8, icy = cy - E.tilt * 0.25 + 1;
  const lash = `M${f(ix)} ${f(iy - 0.4)} Q${f(tcx)} ${f(tcy - 2.4)} ${f(ox)} ${f(oy - 1.2)} L${f(ox + o * 5.5)} ${f(oy - 4.2)} L${f(ox + o * 1.2)} ${f(oy + 1.8)} Q${f(tcx)} ${f(tcy + 2.6)} ${f(ix)} ${f(iy + 1.2)} Z`;
  return `
  <clipPath id="${clip}"><path d="${white}"/></clipPath>
  <path d="${white}" fill="#fbfcff"/>
  <g clip-path="url(#${clip})">
    <path d="M${f(ix - 4)} ${f(iy - 14)} H${f(ox + 4 * o)} V${f(tcy + 5)} H${f(ix - 4)} Z" fill="#c9cfe0" opacity=".55" transform="translate(0 ${f(E.top * 0.2)})"/>
    <ellipse cx="${f(icx)}" cy="${f(icy)}" rx="${irx}" ry="${f(iry)}" fill="url(#${ids.iris})" stroke="${shade(color, -0.5)}" stroke-width="1"/>
    <ellipse cx="${f(icx)}" cy="${f(icy + 0.6)}" rx="3" ry="${f(iry * 0.5)}" fill="#0a0812"/>
    <ellipse cx="${f(icx)}" cy="${f(icy - iry * 0.45)}" rx="${irx}" ry="${f(iry * 0.4)}" fill="${shade(color, -0.55)}" opacity=".55"/>
    <circle cx="${f(icx - 2.6)}" cy="${f(icy - 3.2)}" r="2.6" fill="#fff"/>
    <circle cx="${f(icx + 2.8)}" cy="${f(icy + 3.6)}" r="1.2" fill="#fff" opacity=".85"/>
    ${glow ? `<ellipse cx="${f(icx)}" cy="${f(icy + 2)}" rx="${irx - 1}" ry="${f(iry * 0.6)}" fill="${mix(color, '#ffffff', 0.4)}" opacity=".5"/>` : ''}
  </g>
  <path d="${lash}" fill="${INK}"/>
  <path d="M${f(cx - o * 2)} ${f(bcy - 0.6)} Q${f(cx + o * 7)} ${f(bcy - 0.8)} ${f(ox - o * 1)} ${f(oy + 2.6)}" stroke="${INK}" stroke-width="1.1" fill="none" opacity=".75"/>
  <path d="M${f(cx - o * 5)} ${f(tcy + 0.5)} Q${f(cx + o * 4)} ${f(tcy - 1.5)} ${f(ox - o * 1)} ${f(oy - 4.5)}" stroke="${INK}" stroke-width=".9" fill="none" opacity=".45"/>`;
}

function brow(cx, cy, o, kind, color) {
  const E = EYE[kind] || EYE.round;
  const y = cy - E.top * 1.55 - E.brow;
  const ix = cx - o * 11, iy = y + E.browIn;
  const ox = cx + o * 13, oy = y - (kind === 'glare' ? 1 : 0) + (kind === 'calm' ? 1 : 0);
  return `<path d="M${f(ix)} ${f(iy - 1.6)} Q${f(cx)} ${f(y - 4)} ${f(ox)} ${f(oy)} Q${f(cx)} ${f(y - 1.2)} ${f(ix)} ${f(iy + 1.8)} Z" fill="${shade(color, -0.3)}" stroke="${INK}" stroke-width=".7"/>`;
}

function mouth(kind) {
  if (kind === 'grin') return `<path d="M88 148 Q100 160 114 146 Q101 152 88 148 Z" fill="#fff" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/><path d="M92 150 L110 149" stroke="#c9cfe0" stroke-width=".8"/>`;
  if (kind === 'smirk') return `<path d="M91 151 Q103 152 111 145" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M110 144 l2.5 -1" stroke="${INK}" stroke-width="1.2"/>`;
  if (kind === 'smile') return `<path d="M91 148 Q100 155 109 148" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  return `<path d="M93 150 Q100 151.5 107 150" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
}

function mark(kind, rc) {
  if (kind === 'scar') return `<path d="M122 120 L132 138" stroke="#a8404a" stroke-width="2" stroke-linecap="round"/><path d="M124 126 l5 -2 M127 131 l5 -2" stroke="#a8404a" stroke-width="1.3"/>`;
  if (kind === 'star') return `<path d="M128 136 l2.4 4.8 5.2 .8 -3.8 3.6 .9 5.2 -4.7 -2.5 -4.7 2.5 .9 -5.2 -3.8 -3.6 5.2 -.8z" fill="${rc}" stroke="${INK}" stroke-width=".8"/>`;
  if (kind === 'bolt') return `<path d="M66 124 l7 -3 -2.5 6 7 -2.5" stroke="${rc}" stroke-width="2.2" fill="none" stroke-linejoin="round"/>`;
  if (kind === 'flame') return `<path d="M68 138 q-4 -9 3 -16 q-.5 7 4.5 9 q1.5 -5 0 -9 q7 6 3.5 16 z" fill="${rc}" stroke="${INK}" stroke-width=".8"/>`;
  return '';
}

// ---------- backgrounds ----------
function focusLines(rnd, color, count, opacity) {
  let d = '';
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2, w = 0.006 + rnd() * 0.03;
    const r0 = 62 + rnd() * 40, r1 = 260;
    d += `M${f(100 + Math.cos(a) * r0)} ${f(110 + Math.sin(a) * r0)} L${f(100 + Math.cos(a - w) * r1)} ${f(110 + Math.sin(a - w) * r1)} L${f(100 + Math.cos(a + w) * r1)} ${f(110 + Math.sin(a + w) * r1)} Z `;
  }
  return `<path d="${d}" fill="${color}" opacity="${opacity}"/>`;
}

function flames(rnd, ids, count) {
  let outer = '', inner = '';
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const bx = 14 + t * 172 + (rnd() - 0.5) * 10;
    const by = 236;
    const centerPull = 1 - Math.abs(t - 0.5) * 1.3;
    const ty = 18 + (1 - centerPull) * 70 + rnd() * 30;
    const tx = bx + (rnd() - 0.5) * 30 + (t - 0.5) * -10;
    const w = 16 + rnd() * 14;
    const sway = (rnd() - 0.5) * 30;
    const p = `M${f(bx - w)} ${by} C${f(bx - w)} ${f((by + ty) / 2 + 20)} ${f(tx - w * 0.5 + sway)} ${f((by + ty) / 2)} ${f(tx)} ${f(ty)} C${f(tx + w * 0.4 + sway)} ${f((by + ty) / 2 + 10)} ${f(bx + w)} ${f((by + ty) / 2 + 30)} ${f(bx + w)} ${by} Z`;
    outer += p;
    const iw = w * 0.45, ity = ty + 40;
    inner += `M${f(bx - iw)} ${by} C${f(bx - iw)} ${f((by + ity) / 2 + 10)} ${f(tx - iw + sway * 0.5)} ${f((by + ity) / 2)} ${f(tx)} ${f(ity)} C${f(tx + iw + sway * 0.5)} ${f((by + ity) / 2 + 8)} ${f(bx + iw)} ${f((by + ity) / 2 + 20)} ${f(bx + iw)} ${by} Z`;
  }
  return `<g filter="url(#${ids.soft})"><path d="${outer}" fill="url(#${ids.flame})" opacity=".85"/></g>
          <path d="${inner}" fill="url(#${ids.flameCore})" opacity=".7"/>`;
}

function bolts(rnd, color, n) {
  let out = '';
  for (let i = 0; i < n; i++) {
    let x = 10 + rnd() * 180, y = 0;
    let d = `M${f(x)} ${f(y)}`;
    while (y < 150) { x += (rnd() - 0.5) * 30; y += 12 + rnd() * 16; d += ` L${f(x)} ${f(y)}`; }
    out += `<path d="${d}" stroke="${color}" stroke-width="2.2" fill="none" opacity=".75"/><path d="${d}" stroke="#fff" stroke-width=".8" fill="none"/>`;
  }
  return out;
}

function sparkles(rnd, color, n) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = rnd() * 200, y = rnd() * 200, s = 2 + rnd() * 4;
    out += `<path d="M${f(x)} ${f(y - s)} Q${f(x)} ${f(y)} ${f(x + s)} ${f(y)} Q${f(x)} ${f(y)} ${f(x)} ${f(y + s)} Q${f(x)} ${f(y)} ${f(x - s)} ${f(y)} Q${f(x)} ${f(y)} ${f(x)} ${f(y - s)} Z" fill="${i % 3 ? '#fff' : color}" opacity="${f(0.5 + rnd() * 0.5)}"/>`;
  }
  return out;
}

// ---------- main ----------
export function portraitSVG(char) {
  const r = RARITY[char.rarity];
  const sq = SQUAD[char.squad];
  const L = char.look;
  const n = ++uid;
  const ids = {
    bg: `bg${n}`, hair: `hr${n}`, iris: `ir${n}`, skin: `sk${n}`, jersey: `jr${n}`, rim: `rm${n}`,
    soft: `sf${n}`, glow: `gw${n}`, flame: `fl${n}`, flameCore: `fc${n}`, face: `fa${n}`, neck: `nk${n}`,
    dots: `dt${n}`, fade: `fd${n}`, mask: `mk${n}`, vig: `vg${n}`,
  };
  const rnd = seeded(hash(char.id));
  const tier = r.tier;
  const secret = char.rarity === 'secret';
  const rc = secret ? '#7dfff0' : r.color;
  const skinS = mix(L.skin, '#7a3b4a', 0.28);
  const skinD = mix(L.skin, '#5a2a3a', 0.42);
  const hairTip = L.hair2 || shade(L.hairColor, -0.22);
  const glowEyes = tier >= 3 || L.glow;
  const number = L.num ?? (hash(char.id) % 25) + 1;
  const hair = hairLayers(char, ids);
  const bgA = secret ? '#000003' : mix(rc, '#02040c', 0.55);
  const bgB = secret ? '#14072a' : '#02050d';

  return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" class="portrait-svg">
  <defs>
    <radialGradient id="${ids.bg}" cx="50%" cy="42%" r="78%"><stop offset="0" stop-color="${mix(bgA, '#ffffff', tier >= 3 ? 0.18 : 0.06)}"/><stop offset=".55" stop-color="${bgA}"/><stop offset="1" stop-color="${bgB}"/></radialGradient>
    <linearGradient id="${ids.hair}" gradientUnits="userSpaceOnUse" x1="0" y1="34" x2="0" y2="150"><stop offset="0" stop-color="${mix(L.hairColor, '#ffffff', 0.18)}"/><stop offset=".38" stop-color="${L.hairColor}"/><stop offset="1" stop-color="${hairTip}"/></linearGradient>
    <linearGradient id="${ids.iris}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(L.eye, -0.45)}"/><stop offset=".55" stop-color="${L.eye}"/><stop offset="1" stop-color="${mix(L.eye, '#ffffff', 0.55)}"/></linearGradient>
    <linearGradient id="${ids.skin}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(L.skin, '#ffffff', 0.08)}"/><stop offset="1" stop-color="${L.skin}"/></linearGradient>
    <linearGradient id="${ids.jersey}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(sq.color, '#ffffff', 0.12)}"/><stop offset="1" stop-color="${shade(sq.color, -0.28)}"/></linearGradient>
    <linearGradient id="${ids.flame}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${rc}" stop-opacity=".95"/><stop offset=".6" stop-color="${rc}" stop-opacity=".55"/><stop offset="1" stop-color="${mix(rc, '#ffffff', 0.6)}" stop-opacity="0"/></linearGradient>
    <linearGradient id="${ids.flameCore}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset="1" stop-color="${rc}" stop-opacity="0"/></linearGradient>
    <linearGradient id="${ids.vig}" x1="0" y1="0" x2="0" y2="1"><stop offset=".72" stop-color="#02050d" stop-opacity="0"/><stop offset="1" stop-color="#02050d" stop-opacity=".75"/></linearGradient>
    <radialGradient id="${ids.fade}" cx="50%" cy="45%" r="60%"><stop offset=".35" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
    <mask id="${ids.mask}"><rect width="200" height="240" fill="url(#${ids.fade})"/></mask>
    <pattern id="${ids.dots}" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.25" fill="${mix(rc, '#ffffff', 0.3)}"/></pattern>
    <filter id="${ids.soft}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5"/></filter>
    <filter id="${ids.glow}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="${ids.rim}" x="-15%" y="-15%" width="130%" height="130%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="${tier >= 2 ? 1.8 : 1.1}" result="d"/>
      <feFlood flood-color="${rc}" flood-opacity="${tier >= 2 ? 1 : 0.55}"/>
      <feComposite in2="d" operator="in" result="o"/>
      <feGaussianBlur in="o" stdDeviation="${1.5 + tier * 0.7}" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="${ids.face}"><path d="${FACE}"/></clipPath>
    <clipPath id="${ids.neck}"><path d="${NECK}"/></clipPath>
  </defs>

  <rect width="200" height="240" fill="url(#${ids.bg})"/>
  <rect width="200" height="240" fill="url(#${ids.dots})" mask="url(#${ids.mask})" opacity="${secret ? 0.25 : 0.2 + tier * 0.03}"/>
  ${focusLines(rnd, tier >= 3 ? mix(rc, '#ffffff', 0.5) : '#ffffff', 46 + tier * 8, tier >= 2 ? 0.16 : 0.09)}
  ${secret ? `<g opacity=".55">${['#ff3b6b', '#ffb627', '#7dfff0', '#b65cff'].map((c, i) => `<path d="M100 110 L${-40 + i * 90} -20 L${10 + i * 90} -20 Z" fill="${c}" opacity=".22" filter="url(#${ids.soft})"/>`).join('')}</g>` : ''}
  ${tier >= 4 ? bolts(rnd, rc, tier - 2) : ''}
  ${tier >= 2 ? flames(rnd, ids, 5 + tier * 2) : ''}

  <g filter="url(#${ids.rim})">
    ${hair.back}
    <path d="${NECK}" fill="${L.skin}"/>
    <g clip-path="url(#${ids.neck})"><path d="${FACE}" fill="${skinD}" transform="translate(0 10)"/><path d="M106 136 L113 136 L113 184 L104 184 Z" fill="${skinS}" opacity=".6"/></g>
    <path d="M-4 242 L-4 214 C16 200 44 190 68 186 C78 184 85 180 88 174 L112 174 C115 180 122 184 132 186 C156 190 184 200 204 214 L204 242 Z" fill="url(#${ids.jersey})" stroke="${INK}" stroke-width="1.5"/>
    <path d="M132 186 C156 190 184 200 204 214 L204 242 L152 242 Q148 210 132 186 Z" fill="${shade(sq.color, -0.35)}" opacity=".55"/>
    <path d="M68 186 Q58 212 52 242 M132 186 Q142 212 148 242" stroke="${shade(sq.color, -0.4)}" stroke-width="2" fill="none"/>
    <path d="M30 206 Q40 220 38 242 M86 214 Q90 228 86 242" stroke="${shade(sq.color, -0.3)}" stroke-width="1.4" fill="none" opacity=".6"/>
    <path d="M84 172 Q100 198 116 172 L111 172 Q100 190 89 172 Z" fill="${sq.alt === '#121419' ? '#e8ecf5' : '#ffffff'}" stroke="${INK}" stroke-width="1.2"/>
    <text x="52" y="236" font-family="'Russo One', Impact, sans-serif" font-size="24" fill="#fff" stroke="${INK}" stroke-width="1.2" paint-order="stroke" text-anchor="middle">${number}</text>
    <circle cx="146" cy="214" r="7" fill="${sq.alt}" stroke="#fff" stroke-width="1.4"/><path d="M146 209 l1.6 3.4 3.6 .4 -2.7 2.4 .8 3.6 -3.3 -1.9 -3.3 1.9 .8 -3.6 -2.7 -2.4 3.6 -.4z" fill="${sq.color}"/>

    <path d="M63 104 C55 99 51 110 54 120 C56 129 62 131 66 127 Z" fill="${L.skin}" stroke="${INK}" stroke-width="1.2"/>
    <path d="M60 110 Q57 116 61 123" stroke="${skinD}" stroke-width="1.4" fill="none"/>
    <path d="M137 104 C145 99 149 110 146 120 C144 129 138 131 134 127 Z" fill="${skinS}" stroke="${INK}" stroke-width="1.2"/>
    <path d="M140 110 Q143 116 139 123" stroke="${skinD}" stroke-width="1.4" fill="none"/>

    <path d="${FACE}" fill="url(#${ids.skin})"/>
    <g clip-path="url(#${ids.face})">
      <path d="M138 90 C138 112 136 128 127 143 C120 154 110 163 100 167 C110 156 117 146 122 134 C128 118 131 102 129 88 Z" fill="${skinS}" opacity=".75"/>
      <path d="${hair.fringe}" fill="${skinS}" transform="translate(0 7)" opacity=".85"/>
      <path d="M62 60 H138 V92 C120 80 80 80 62 92 Z" fill="${skinS}" opacity=".5"/>
    </g>
    <path d="${FACE}" fill="none" stroke="${INK}" stroke-width="1.6"/>

    ${brow(82, 113, -1, L.eyes, L.hairColor)}${brow(118, 113, 1, L.eyes, L.hairColor)}
    ${eye(82, 113, -1, L.eyes, L.eye, ids, glowEyes)}${eye(118, 113, 1, L.eyes, L.eye, ids, glowEyes)}
    <path d="M101 124 L98 135 Q100 137 103 135.5" stroke="${skinD}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M101 124 L104 134 L103 135.5" fill="${skinS}" opacity=".6"/>
    <path d="M70 132 l3 -3 M74 133 l3 -3 M78 133 l3 -3 M122 133 l3 -3 M126 133 l3 -3 M130 132 l3 -3" stroke="#ff6a7a" stroke-width="1" opacity=".35"/>
    ${mouth(L.mouth)}
    ${mark(L.mark, rc)}
    ${hair.front}
    ${L.mark === 'halo' ? `<ellipse cx="100" cy="28" rx="34" ry="7" fill="none" stroke="${rc}" stroke-width="3.5" filter="url(#${ids.glow})"/>` : ''}
  </g>

  ${glowEyes ? `
  <g filter="url(#${ids.glow})">
    <path d="M131 108 Q156 94 196 88 Q158 102 132 113 Z" fill="${L.eye}" opacity=".85"/>
    <path d="M131 109.5 Q156 98 190 90 Q156 103 132 111.5 Z" fill="#fff" opacity=".9"/>
    <circle cx="118.8" cy="113" r="5" fill="${L.eye}" opacity=".35"/>
    <circle cx="82.8" cy="113" r="5" fill="${L.eye}" opacity=".35"/>
  </g>` : ''}
  ${tier >= 3 ? sparkles(rnd, rc, 6 + tier * 3) : ''}
  <rect width="200" height="240" fill="url(#${ids.vig})"/>
</svg>`;
}
