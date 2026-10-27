// Procedural anime-style portrait generator (original designs, rendered as SVG).
import { RARITY, SQUAD } from './data.js';

let uid = 0;

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v + amt * 255))));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}

const HAIR = {
  //          top spikes, top length, fringe count, fringe length, lean, side length, back hair
  spiky:  { top: 9, topLen: 34, fringe: 6, fLen: 30, lean: 4,  side: 20, back: 0 },
  messy:  { top: 7, topLen: 18, fringe: 7, fLen: 26, lean: -2, side: 22, back: 0 },
  swept:  { top: 5, topLen: 12, fringe: 5, fLen: 34, lean: 14, side: 26, back: 0 },
  bob:    { top: 3, topLen: 6,  fringe: 8, fLen: 24, lean: 0,  side: 44, back: 18 },
  long:   { top: 4, topLen: 10, fringe: 6, fLen: 30, lean: 6,  side: 56, back: 70 },
  buzz:   { top: 0, topLen: 0,  fringe: 0, fLen: 4,  lean: 0,  side: 6,  back: 0 },
  slick:  { top: 6, topLen: 8,  fringe: 2, fLen: 14, lean: -12, side: 14, back: 6 },
  mohawk: { top: 6, topLen: 46, fringe: 2, fLen: 12, lean: 0,  side: 4,  back: 0, mohawk: true },
};

function hairPaths(style, color) {
  const p = HAIR[style] || HAIR.messy;
  const dark = shade(color, -0.18);
  const light = shade(color, 0.22);
  const cx = 100;
  let back = '', front = '';

  if (p.back) {
    back += `<path d="M52 92 Q48 ${120 + p.back * 0.6} ${58 - p.back * 0.08} ${140 + p.back} L${142 + p.back * 0.08} ${140 + p.back} Q152 ${120 + p.back * 0.6} 148 92 Z" fill="${dark}"/>`;
  }

  // Top spikes around the crown.
  const crown = [];
  if (p.mohawk) {
    for (let i = 0; i < p.top; i++) {
      const t = i / (p.top - 1);
      const x = 78 + t * 44;
      const baseY = 52 - Math.sin(t * Math.PI) * 6;
      crown.push(`M${x - 7} ${baseY + 8} L${x + (t - 0.5) * 8} ${baseY - p.topLen * (0.6 + Math.sin(t * Math.PI) * 0.4)} L${x + 7} ${baseY + 8} Z`);
    }
  } else {
    for (let i = 0; i < p.top; i++) {
      const a = Math.PI * (1.08 + (i / Math.max(1, p.top - 1)) * 0.84);
      const r = 50;
      const bx = cx + Math.cos(a) * r, by = 92 + Math.sin(a) * r * 1.02;
      const tipR = r + p.topLen * (0.7 + ((i * 37) % 10) / 30);
      const tx = cx + Math.cos(a + 0.05) * tipR + p.lean * 0.4, ty = 92 + Math.sin(a + 0.05) * tipR;
      const w = 0.2;
      const lx = cx + Math.cos(a - w) * r, ly = 92 + Math.sin(a - w) * r;
      const rx = cx + Math.cos(a + w) * r, ry = 92 + Math.sin(a + w) * r;
      crown.push(`M${lx.toFixed(1)} ${ly.toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)} L${rx.toFixed(1)} ${ry.toFixed(1)} L${bx.toFixed(1)} ${(by + 6).toFixed(1)} Z`);
    }
  }

  // Skull cap.
  const capTop = style === 'buzz' ? 46 : 40;
  front += `<path d="M${style === 'mohawk' ? 64 : 52} ${style === 'buzz' ? 92 : 98} Q${style === 'mohawk' ? 64 : 48} ${capTop} ${cx} ${capTop} Q${style === 'mohawk' ? 136 : 152} ${capTop} ${style === 'mohawk' ? 136 : 148} ${style === 'buzz' ? 92 : 98} Q130 72 ${cx} 70 Q70 72 ${style === 'mohawk' ? 64 : 52} ${style === 'buzz' ? 92 : 98} Z" fill="${style === 'mohawk' ? shade(color, -0.35) : color}"/>`;
  if (crown.length) front += `<path d="${crown.join(' ')}" fill="${color}"/>`;

  // Side locks.
  if (p.side > 8) {
    front += `<path d="M53 88 Q50 ${100 + p.side * 0.6} ${57} ${98 + p.side} L64 96 Z" fill="${color}"/>`;
    front += `<path d="M147 88 Q150 ${100 + p.side * 0.6} ${143} ${98 + p.side} L136 96 Z" fill="${color}"/>`;
  }

  // Fringe strands hanging over the forehead.
  const strands = [];
  for (let i = 0; i < p.fringe; i++) {
    const t = p.fringe === 1 ? 0.5 : i / (p.fringe - 1);
    const x0 = 58 + t * 84;
    const w = 84 / Math.max(1, p.fringe) * 0.9 + 6;
    const len = p.fLen * (0.75 + ((i * 53) % 10) / 25) * (1 - Math.abs(t - 0.45) * 0.5);
    const tipX = x0 + p.lean + (t - 0.5) * 6;
    strands.push(`M${(x0 - w / 2).toFixed(1)} 70 Q${(x0 - w / 4).toFixed(1)} ${(76 + len * 0.5).toFixed(1)} ${tipX.toFixed(1)} ${(74 + len).toFixed(1)} Q${(x0 + w / 4).toFixed(1)} ${(74 + len * 0.45).toFixed(1)} ${(x0 + w / 2).toFixed(1)} 70 Z`);
  }
  if (strands.length) front += `<path d="${strands.join(' ')}" fill="${color}"/>`;

  // Highlight band.
  if (style !== 'buzz') front += `<path d="M70 56 Q100 44 130 56" stroke="${light}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`;
  return { back, front };
}

function eyes(kind, color) {
  const dark = shade(color, -0.35);
  const one = (x, flip) => {
    const s = flip ? -1 : 1;
    let lid, irisRy = 11, lidY = 0;
    if (kind === 'sharp') { lid = `M${x - 15 * s} ${106} Q${x} ${101} ${x + 15 * s} ${112}`; irisRy = 10; }
    else if (kind === 'calm') { lid = `M${x - 14 * s} ${110} Q${x} ${103} ${x + 14 * s} ${109}`; irisRy = 9; lidY = 3; }
    else if (kind === 'glare') { lid = `M${x - 15 * s} ${105} Q${x} ${104} ${x + 15 * s} ${111}`; irisRy = 9; }
    else { lid = `M${x - 14 * s} ${112} Q${x} ${98} ${x + 14 * s} ${110}`; }
    const id = `ir${++uid}`;
    return `
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset="1" stop-color="${shade(color, 0.25)}"/></linearGradient></defs>
      <ellipse cx="${x}" cy="${116 + lidY}" rx="11" ry="${irisRy + 1}" fill="#fff"/>
      <ellipse cx="${x + 1 * s}" cy="${117 + lidY}" rx="8" ry="${irisRy}" fill="url(#${id})"/>
      <ellipse cx="${x + 1 * s}" cy="${118 + lidY}" rx="3.6" ry="${irisRy * 0.55}" fill="#0b0b14"/>
      <circle cx="${x - 2.5 * s}" cy="${112 + lidY}" r="2.6" fill="#fff"/>
      <circle cx="${x + 3 * s}" cy="${121 + lidY}" r="1.2" fill="#fff" opacity=".8"/>
      <path d="${lid}" stroke="#14111a" stroke-width="4.2" fill="none" stroke-linecap="round"/>`;
  };
  return one(80, false) + one(120, true);
}

function brows(kind, color) {
  const c = shade(color, -0.25);
  if (kind === 'glare') return `<path d="M66 96 L92 103 M134 96 L108 103" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
  if (kind === 'sharp') return `<path d="M67 98 L92 100 M133 98 L108 100" stroke="${c}" stroke-width="3.6" stroke-linecap="round"/>`;
  if (kind === 'calm') return `<path d="M68 99 Q80 95 92 98 M132 99 Q120 95 108 98" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  return `<path d="M68 97 Q80 92 92 96 M132 97 Q120 92 108 96" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
}

function mouth(kind) {
  if (kind === 'grin') return `<path d="M88 148 Q100 158 114 147 Q100 152 88 148 Z" fill="#fff" stroke="#3a1a1a" stroke-width="1.6"/>`;
  if (kind === 'smirk') return `<path d="M90 150 Q102 152 112 145" stroke="#3a1a1a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  if (kind === 'smile') return `<path d="M91 147 Q100 154 109 147" stroke="#3a1a1a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  return `<path d="M93 150 L107 150" stroke="#3a1a1a" stroke-width="2.4" stroke-linecap="round"/>`;
}

function mark(kind, rc) {
  if (kind === 'scar') return `<path d="M124 124 L136 140 M127 128 L132 125 M130 133 L135 130" stroke="#b44a4a" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
  if (kind === 'star') return `<path d="M134 136 l3 6 6 1 -4.5 4 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4 6 -1z" fill="${rc}" opacity=".9"/>`;
  if (kind === 'bolt') return `<path d="M62 126 l8 -4 -3 8 8 -3" stroke="${rc}" stroke-width="2.4" fill="none" stroke-linejoin="round"/>`;
  if (kind === 'flame') return `<path d="M64 136 q-4 -10 4 -18 q-1 8 5 10 q2 -6 0 -10 q8 6 4 18 z" fill="${rc}" opacity=".85"/>`;
  if (kind === 'halo') return `<ellipse cx="100" cy="30" rx="40" ry="9" fill="none" stroke="${rc}" stroke-width="4" opacity=".9"/>`;
  return '';
}

export function portraitSVG(char, opts = {}) {
  const r = RARITY[char.rarity];
  const sq = SQUAD[char.squad];
  const L = char.look;
  const id = ++uid;
  const hair = hairPaths(L.hair, L.hairColor);
  const skinS = shade(L.skin, -0.12);
  const glowColor = char.rarity === 'secret' ? '#7dfff0' : r.color;
  const fancy = r.tier >= 2;
  const bgTop = char.rarity === 'secret' ? '#020208' : shade(r.color, -0.55);
  const bgBot = char.rarity === 'secret' ? '#1a0b2e' : '#050a18';

  const lines = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    lines.push(`M100 110 L${(100 + Math.cos(a) * 220).toFixed(0)} ${(110 + Math.sin(a) * 220).toFixed(0)}`);
  }

  return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" class="portrait-svg" ${opts.silhouette ? 'data-sil="1"' : ''}>
  <defs>
    <radialGradient id="bg${id}" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="${bgTop}"/><stop offset="1" stop-color="${bgBot}"/></radialGradient>
    <radialGradient id="gl${id}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${glowColor}" stop-opacity=".75"/><stop offset="1" stop-color="${glowColor}" stop-opacity="0"/></radialGradient>
    <linearGradient id="sk${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L.skin}"/><stop offset="1" stop-color="${skinS}"/></linearGradient>
    <linearGradient id="jr${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sq.color}"/><stop offset="1" stop-color="${shade(sq.color, -0.35)}"/></linearGradient>
  </defs>
  <rect width="200" height="240" fill="url(#bg${id})"/>
  <path d="${lines.join(' ')}" stroke="${r.color}" stroke-width="${fancy ? 3 : 1.5}" opacity="${fancy ? 0.18 : 0.08}"/>
  ${fancy ? `<ellipse cx="100" cy="108" rx="${70 + r.tier * 6}" ry="${80 + r.tier * 6}" fill="url(#gl${id})"/>` : ''}
  ${opts.silhouette ? '<g filter="brightness(0)" opacity="1">' : '<g>'}
  ${hair.back}
  <path d="M8 240 Q14 196 62 186 L86 178 L114 178 L138 186 Q186 196 192 240 Z" fill="url(#jr${id})"/>
  <path d="M86 178 L100 204 L114 178" fill="${sq.alt}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
  <path d="M30 210 Q60 200 70 236 M170 210 Q140 200 130 236" stroke="${shade(sq.color, 0.25)}" stroke-width="4" fill="none" opacity=".6"/>
  <rect x="87" y="148" width="26" height="36" rx="8" fill="${skinS}"/>
  <ellipse cx="57" cy="118" rx="7" ry="11" fill="${skinS}"/>
  <ellipse cx="143" cy="118" rx="7" ry="11" fill="${skinS}"/>
  <path d="M56 98 Q56 146 100 170 Q144 146 144 98 Q144 56 100 54 Q56 56 56 98 Z" fill="url(#sk${id})"/>
  <path d="M68 138 Q74 150 84 156" stroke="${skinS}" stroke-width="3" fill="none" opacity=".6"/>
  ${hair.front}
  ${brows(L.eyes, L.hairColor)}
  ${eyes(L.eyes, L.eye)}
  <path d="M100 126 L97 137 L102 138" stroke="${shade(L.skin, -0.3)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <ellipse cx="74" cy="134" rx="7" ry="3" fill="#ff7a8a" opacity=".22"/>
  <ellipse cx="126" cy="134" rx="7" ry="3" fill="#ff7a8a" opacity=".22"/>
  ${mouth(L.mouth)}
  ${mark(L.mark, glowColor)}
  </g>
</svg>`;
}
