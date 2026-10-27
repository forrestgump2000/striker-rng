// Ambient background (drifting glow particles + light streaks) and holographic card tilt.

export function startBackground() {
  const c = document.createElement('canvas');
  c.id = 'bg-fx';
  document.body.prepend(c);
  const g = c.getContext('2d');
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let w = 0, h = 0, dpr = 1;
  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = innerWidth; h = innerHeight;
    c.width = w * dpr; c.height = h * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener('resize', resize);

  const COLORS = ['#2f9bff', '#7dfff0', '#4f7bff', '#b65cff'];
  const parts = Array.from({ length: 70 }, () => ({
    x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 2.2,
    v: 0.00004 + Math.random() * 0.00012, d: (Math.random() - 0.5) * 0.00004,
    c: COLORS[Math.floor(Math.random() * COLORS.length)], p: Math.random() * Math.PI * 2,
  }));
  const streaks = [];
  let last = performance.now();

  const frame = now => {
    const dt = Math.min(50, now - last); last = now;
    if (!document.hidden) {
      g.clearRect(0, 0, w, h);
      g.globalCompositeOperation = 'lighter';
      for (const p of parts) {
        p.y -= p.v * dt; p.x += p.d * dt; p.p += dt * 0.002;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        const a = 0.25 + Math.sin(p.p) * 0.2;
        const x = p.x * w, y = p.y * h;
        const grd = g.createRadialGradient(x, y, 0, x, y, p.r * 5);
        grd.addColorStop(0, p.c); grd.addColorStop(1, 'transparent');
        g.globalAlpha = a; g.fillStyle = grd;
        g.beginPath(); g.arc(x, y, p.r * 5, 0, Math.PI * 2); g.fill();
      }
      if (Math.random() < dt * 0.0004) streaks.push({ x: Math.random() * w * 1.4 - w * 0.2, y: -40, life: 0 });
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        s.life += dt; s.x += dt * 0.9; s.y += dt * 0.9;
        const grd = g.createLinearGradient(s.x - 160, s.y - 160, s.x, s.y);
        grd.addColorStop(0, 'rgba(47,155,255,0)'); grd.addColorStop(1, 'rgba(160,220,255,.55)');
        g.globalAlpha = 1; g.strokeStyle = grd; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(s.x - 160, s.y - 160); g.lineTo(s.x, s.y); g.stroke();
        if (s.life > 2200) streaks.splice(i, 1);
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    if (!reduced) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

export function enableCardTilt() {
  const reset = card => {
    card.style.removeProperty('--rx'); card.style.removeProperty('--ry');
    card.style.removeProperty('--mx'); card.style.removeProperty('--my');
    card.classList.remove('tilting');
  };
  document.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const card = e.target.closest?.('.char-card:not(.empty)');
    document.querySelectorAll('.char-card.tilting').forEach(c => { if (c !== card) reset(c); });
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    card.classList.add('tilting');
    card.style.setProperty('--ry', `${(px - 0.5) * 16}deg`);
    card.style.setProperty('--rx', `${(0.5 - py) * 14}deg`);
    card.style.setProperty('--mx', `${px * 100}%`);
    card.style.setProperty('--my', `${py * 100}%`);
  });
  document.addEventListener('pointerleave', () => document.querySelectorAll('.char-card.tilting').forEach(reset), true);
}
