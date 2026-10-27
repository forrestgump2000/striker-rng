// Generates the app icon set and social thumbnail from SVG sources.
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { portraitSVG } from '../src/portrait.js';
import { CHARACTER } from '../src/data.js';

const out = p => fileURLToPath(new URL(`../public/${p}`, import.meta.url));

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#123b8f"/><stop offset=".6" stop-color="#071230"/><stop offset="1" stop-color="#02050d"/></radialGradient>
    <linearGradient id="bolt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#7dfff0"/><stop offset="1" stop-color="#1e8bff"/></linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <rect x="14" y="14" width="484" height="484" rx="100" fill="none" stroke="#1e8bff" stroke-width="10" filter="url(#glow)"/>
  <g opacity=".22" stroke="#1e8bff" stroke-width="6">
    ${Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; return `<line x1="256" y1="256" x2="${256 + Math.cos(a) * 400}" y2="${256 + Math.sin(a) * 400}"/>`; }).join('')}
  </g>
  <g filter="url(#glow)">
    <clipPath id="ball"><circle cx="256" cy="268" r="150"/></clipPath>
    <circle cx="256" cy="268" r="150" fill="#f4f8ff"/>
    <g clip-path="url(#ball)" fill="#0a1230">
      ${[[256, 268], [140, 190], [372, 190], [128, 350], [384, 350], [256, 410], [256, 118]].map(([x, y]) => `<path d="${Array.from({ length: 5 }, (_, k) => { const a = k / 5 * Math.PI * 2 - Math.PI / 2; return (k ? 'L' : 'M') + (x + Math.cos(a) * 38).toFixed(1) + ' ' + (y + Math.sin(a) * 38).toFixed(1); }).join(' ')}Z"/>`).join('')}
    </g>
    <circle cx="256" cy="268" r="150" fill="none" stroke="#0a1230" stroke-width="8"/>
  </g>
  <path d="M292 40 L170 284 h76 l-44 188 L352 214 h-82 z" fill="url(#bolt)" stroke="#02050d" stroke-width="12" stroke-linejoin="round" filter="url(#glow)"/>
</svg>`;

writeFileSync(out('icon.svg'), icon);
const iconBuf = Buffer.from(icon);
await sharp(iconBuf).resize(512, 512).png().toFile(out('icon-512.png'));
await sharp(iconBuf).resize(192, 192).png().toFile(out('icon-192.png'));
await sharp(iconBuf).resize(180, 180).png().toFile(out('apple-touch-icon.png'));
await sharp(iconBuf).resize(32, 32).png().toFile(out('favicon-32.png'));

// Thumbnail: three original roster portraits fanned out behind the logo.
const strip = (id, x, y, rot, scale, color) => {
  const svg = portraitSVG(CHARACTER[id]).replace('<svg ', `<svg x="0" y="0" width="200" height="240" `);
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${scale})">
    <rect x="-6" y="-6" width="212" height="252" rx="16" fill="${color}" filter="url(#g2)"/>
    <clipPath id="c${id}"><rect width="200" height="240" rx="12"/></clipPath>
    <g clip-path="url(#c${id})">${svg}</g>
  </g>`;
};

const thumb = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <radialGradient id="tb" cx="50%" cy="20%" r="90%"><stop offset="0" stop-color="#14408f"/><stop offset=".55" stop-color="#071230"/><stop offset="1" stop-color="#02050d"/></radialGradient>
    <filter id="g2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="tg" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#1e8bff" stroke-opacity=".12"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#tb)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <g opacity=".18" stroke="#1e8bff" stroke-width="5">
    ${Array.from({ length: 24 }, (_, i) => { const a = i / 24 * Math.PI * 2; return `<line x1="900" y1="315" x2="${900 + Math.cos(a) * 900}" y2="${315 + Math.sin(a) * 900}"/>`; }).join('')}
  </g>
  ${strip('raizo', 640, 150, -10, 1.45, '#ffb627')}
  ${strip('dante', 960, 120, 9, 1.45, '#ff3b6b')}
  ${strip('kaito', 770, 70, 0, 1.75, '#1e8bff')}
  <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="#1e8bff" stroke-width="6" filter="url(#tg)"/>
  <image href="data:image/svg+xml;base64,${Buffer.from(icon).toString('base64')}" x="70" y="70" width="140" height="140"/>
  <text x="70" y="330" font-family="Impact, 'Arial Black', sans-serif" font-size="128" fill="#ffffff" filter="url(#tg)">STRIKER</text>
  <text x="70" y="450" font-family="Impact, 'Arial Black', sans-serif" font-size="128" fill="#1e8bff" filter="url(#tg)">RNG</text>
  <text x="74" y="520" font-family="Arial, sans-serif" font-weight="700" font-size="34" fill="#cfe3ff">Roll players · Steal attributes · Build the ultimate striker</text>
  <g font-family="Arial, sans-serif" font-weight="700" font-size="22">
    ${['COMMON|#9fb0c8', 'RARE|#3fa9ff', 'EPIC|#b65cff', 'LEGENDARY|#ffb627', 'MYTHIC|#ff3b6b', 'SECRET|#7dfff0'].map((s, i) => {
      const [t, c] = s.split('|');
      const x = 74 + [0, 120, 210, 300, 460, 590][i];
      return `<text x="${x}" y="570" fill="${c}">${t}</text>`;
    }).join('')}
  </g>
</svg>`;

await sharp(Buffer.from(thumb)).png().toFile(out('thumbnail.png'));
writeFileSync(out('thumbnail.svg'), thumb);

writeFileSync(out('manifest.webmanifest'), JSON.stringify({
  name: 'Striker RNG', short_name: 'Striker RNG', start_url: '/', display: 'standalone',
  background_color: '#03060f', theme_color: '#050a18',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
  ],
}, null, 2));
console.log('icons + thumbnail written');
