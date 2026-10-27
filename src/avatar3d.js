// Blocky 3D striker preview built with three.js.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { COSMETIC } from './data.js';

const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.05, ...extra });

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function faceTexture(face, skin) {
  return canvasTex(256, 256, g => {
    g.fillStyle = skin; g.fillRect(0, 0, 256, 256);
    const glow = { ego: '#2f9bff', predator: '#ffb627', abyss: '#7dfff0' }[face];
    const eye = (x, flip) => {
      const s = flip ? -1 : 1;
      g.save();
      if (glow) { g.shadowColor = glow; g.shadowBlur = 18; }
      g.fillStyle = '#fff';
      g.beginPath(); g.ellipse(x, 120, 22, face === 'calm' ? 14 : 22, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = face === 'abyss' ? '#05050a' : (glow || '#2a3a5a');
      g.beginPath(); g.ellipse(x + 2 * s, 124, 13, face === 'calm' ? 11 : 17, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = face === 'abyss' ? '#7dfff0' : '#0b0b14';
      if (face === 'predator') { g.fillRect(x - 2, 110, 5, 28); }
      else { g.beginPath(); g.ellipse(x + 2 * s, 126, 6, 9, 0, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = '#fff'; g.beginPath(); g.arc(x - 6 * s, 114, 5, 0, Math.PI * 2); g.fill();
      g.restore();
      // lid / brow
      g.strokeStyle = '#141018'; g.lineWidth = 7; g.lineCap = 'round';
      g.beginPath();
      if (face === 'glare' || face === 'predator') { g.moveTo(x - 26 * s, 92); g.lineTo(x + 24 * s, 104); }
      else if (face === 'calm') { g.moveTo(x - 24 * s, 112); g.quadraticCurveTo(x, 104, x + 24 * s, 112); }
      else { g.moveTo(x - 24 * s, 104); g.quadraticCurveTo(x, 92, x + 24 * s, 102); }
      g.stroke();
    };
    eye(84, false); eye(172, true);
    g.strokeStyle = '#3a1a1a'; g.lineWidth = 6; g.lineCap = 'round';
    g.beginPath();
    if (face === 'grin' || face === 'ego') {
      g.fillStyle = '#fff'; g.moveTo(96, 178); g.quadraticCurveTo(128, 206, 162, 176); g.quadraticCurveTo(128, 186, 96, 178); g.fill(); g.stroke();
    } else if (face === 'predator' || face === 'abyss') {
      g.moveTo(100, 186); g.quadraticCurveTo(132, 190, 158, 176); g.stroke();
    } else if (face === 'calm') {
      g.moveTo(110, 184); g.lineTo(146, 184); g.stroke();
    } else {
      g.moveTo(104, 182); g.quadraticCurveTo(128, 192, 152, 182); g.stroke();
    }
  });
}

function kitTexture(kit, number, name) {
  return canvasTex(256, 256, g => {
    g.fillStyle = kit.main; g.fillRect(0, 0, 256, 256);
    g.fillStyle = kit.trim; g.globalAlpha = 0.9;
    g.fillRect(0, 0, 256, 14);
    g.beginPath(); g.moveTo(96, 0); g.lineTo(128, 40); g.lineTo(160, 0); g.fill();
    g.globalAlpha = 0.25; g.fillRect(0, 60, 256, 10); g.fillRect(0, 190, 256, 10);
    g.globalAlpha = 1;
    g.fillStyle = kit.num;
    g.font = 'bold 110px "Russo One", Impact, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(String(number), 128, 140);
    g.font = 'bold 22px "Russo One", Impact, sans-serif';
    g.fillText(name, 128, 222);
  });
}

function ballTexture() {
  return canvasTex(256, 128, g => {
    g.fillStyle = '#f4f6fb'; g.fillRect(0, 0, 256, 128);
    g.fillStyle = '#10131c';
    for (let i = 0; i < 12; i++) {
      const x = (i % 6) * 44 + (i > 5 ? 22 : 0) + 10, y = i > 5 ? 90 : 34;
      g.beginPath();
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 - Math.PI / 2; g.lineTo(x + Math.cos(a) * 13, y + Math.sin(a) * 13); }
      g.fill();
    }
  });
}

export class AvatarPreview {
  constructor(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    this.camera.position.set(0, 3.4, 13.5);
    this.camera.lookAt(0, 2.6, 0);

    this.scene.add(new THREE.HemisphereLight(0xbfd9ff, 0x0a1230, 1.3));
    const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(4, 8, 6); this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x2f9bff, 2.2); rim.position.set(-5, 4, -6); this.scene.add(rim);
    this.auraLight = new THREE.PointLight(0x2f9bff, 0, 10); this.auraLight.position.set(0, 2.5, 2); this.scene.add(this.auraLight);

    // Glowing pedestal.
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 0.3, 48), mat(0x0a1430, { emissive: 0x0a2a6a, emissiveIntensity: 0.6 }));
    ped.position.y = -0.15; this.scene.add(ped);
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.05, 8, 64), new THREE.MeshBasicMaterial({ color: 0x2f9bff }));
    this.ring.rotation.x = Math.PI / 2; this.ring.position.y = 0.02; this.scene.add(this.ring);

    this.root = new THREE.Group(); this.scene.add(this.root);
    this.ball = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16), mat(0xffffff, { map: ballTexture() }));
    this.ball.position.set(1.3, 0.42, 1.1); this.scene.add(this.ball);

    this.aura = null;
    this.yaw = 0.35; this.dragging = false; this.pulse = 0; this.t = 0; this.power = 0;
    this.bindDrag();
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(container);
    this.resize();
    this.clock = new THREE.Clock();
    this.renderer.setAnimationLoop(() => this.tick());
  }

  bindDrag() {
    const el = this.renderer.domElement;
    let lastX = 0;
    el.addEventListener('pointerdown', e => { this.dragging = true; lastX = e.clientX; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', e => { if (!this.dragging) return; this.yaw += (e.clientX - lastX) * 0.012; lastX = e.clientX; });
    const up = () => { this.dragging = false; };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }

  resize() {
    const w = this.container.clientWidth || 300, h = this.container.clientHeight || 300;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // look: equipped cosmetics; info: { number, name, power (0..1), squadColor }
  update(look, info = {}) {
    this.look = look; this.info = info;
    this.power = info.power || 0;
    while (this.root.children.length) this.root.remove(this.root.children[0]);
    const kit = COSMETIC[look.clothing].preset;
    const torsoP = COSMETIC[look.torso].preset;
    const armsP = COSMETIC[look.arms].preset;
    const legsP = COSMETIC[look.legs].preset;
    const hairP = COSMETIC[look.hair].preset;
    const faceP = COSMETIC[look.face].preset;
    const skin = look.skin;

    const widths = { lean: 1.8, standard: 2, athletic: 2.15, titan: 2.45, armor: 2.25 };
    const tw = widths[torsoP] || 2;
    const skinM = mat(skin);
    const kitM = mat(kit.main);
    const altM = mat(kit.alt);
    const trimM = mat(kit.trim, { emissive: kit.trim, emissiveIntensity: 0.15 });

    const g = new THREE.Group();
    this.body = g;

    // Legs
    this.legs = [];
    for (const side of [-1, 1]) {
      const leg = new THREE.Group();
      leg.position.set(side * tw * 0.25, 2, 0);
      const shorts = new THREE.Mesh(new RoundedBoxGeometry(tw * 0.48, 0.8, 0.95, 2, 0.08), altM);
      shorts.position.y = -0.4; leg.add(shorts);
      const thigh = new THREE.Mesh(new RoundedBoxGeometry(tw * 0.42, 0.5, 0.85, 2, 0.08), skinM);
      thigh.position.y = -1.0; leg.add(thigh);
      const sockH = legsP === 'high' ? 0.9 : 0.6;
      const sockM = legsP === 'void' ? mat(0x05050a, { emissive: 0x7dfff0, emissiveIntensity: 0.25 }) : mat(kit.alt === '#000000' ? kit.trim : kit.main);
      const sock = new THREE.Mesh(new RoundedBoxGeometry(tw * 0.43, sockH, 0.88, 2, 0.08), sockM);
      sock.position.y = -1.75 + sockH / 2; leg.add(sock);
      const bootColor = { bolt: 0xffe14a, void: 0x101018 }[legsP] ?? 0x10131c;
      const boot = new THREE.Mesh(new RoundedBoxGeometry(tw * 0.46, 0.32, 1.05, 2, 0.1),
        mat(bootColor, legsP === 'bolt' ? { emissive: 0xffc400, emissiveIntensity: 0.8 } : legsP === 'void' ? { emissive: 0x7dfff0, emissiveIntensity: 0.6 } : {}));
      boot.position.set(0, -1.86, 0.06); leg.add(boot);
      if (legsP === 'pads') {
        const pad = new THREE.Mesh(new RoundedBoxGeometry(tw * 0.36, 0.38, 0.2, 2, 0.06), mat(0x1c1f2b));
        pad.position.set(0, -1.05, 0.48); leg.add(pad);
      }
      g.add(leg); this.legs.push(leg);
    }

    // Torso
    const torsoGeo = new RoundedBoxGeometry(tw, 2, 1, 3, 0.12);
    const front = mat('#ffffff', { map: kitTexture(kit, info.number ?? 10, (info.name || 'STRIKER').toUpperCase().slice(0, 12)) });
    const torso = new THREE.Mesh(torsoGeo, [kitM, kitM, kitM, kitM, front, kitM]);
    torso.position.y = 3; g.add(torso);
    if (torsoP === 'armor') {
      const plate = new THREE.Mesh(new RoundedBoxGeometry(tw * 1.08, 0.9, 1.15, 2, 0.12), mat(0x1a1d2a, { metalness: 0.8, roughness: 0.25, emissive: 0xff3b6b, emissiveIntensity: 0.25 }));
      plate.position.y = 3.6; g.add(plate);
    }

    // Arms
    this.arms = [];
    const armW = torsoP === 'titan' ? 1.1 : torsoP === 'lean' ? 0.85 : 0.95;
    for (const side of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(side * (tw / 2 + armW / 2 + 0.02), 3.9, 0);
      const sleeveLen = armsP === 'sleeves' ? 1.9 : 0.7;
      const sleeve = new THREE.Mesh(new RoundedBoxGeometry(armW, sleeveLen, 0.95, 2, 0.1), kitM);
      sleeve.position.y = -sleeveLen / 2 + 0.05; arm.add(sleeve);
      if (sleeveLen < 1.9) {
        const fore = new THREE.Mesh(new RoundedBoxGeometry(armW * 0.92, 1.3, 0.88, 2, 0.1),
          armsP === 'flame' ? mat(skin, { emissive: 0xff5a1a, emissiveIntensity: 0.55 }) : skinM);
        fore.position.y = -1.3; arm.add(fore);
      }
      if (armsP === 'bands' || armsP === 'tape') {
        const band = new THREE.Mesh(new RoundedBoxGeometry(armW * 1.02, 0.22, 0.98, 2, 0.06), armsP === 'tape' ? mat(0xffb627, { emissive: 0xffb627, emissiveIntensity: 0.3 }) : trimM);
        band.position.y = armsP === 'tape' && side === -1 ? -0.5 : -1.7; arm.add(band);
      }
      const hand = new THREE.Mesh(new RoundedBoxGeometry(armW * 0.8, 0.3, 0.8, 2, 0.1), skinM);
      hand.position.y = -2.0; arm.add(hand);
      g.add(arm); this.arms.push(arm);
    }

    // Head
    const head = new THREE.Group(); head.position.y = 4.75;
    const faceM = mat('#ffffff', { map: faceTexture(faceP, skin) });
    const headMesh = new THREE.Mesh(new RoundedBoxGeometry(1.25, 1.25, 1.2, 4, 0.3), [skinM, skinM, skinM, skinM, faceM, skinM]);
    head.add(headMesh);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.4, 12), skinM); neck.position.y = -0.7; head.add(neck);
    this.buildHair(head, hairP, look.hairColor);
    g.add(head); this.head = head;

    this.root.add(g);
    this.setAura(COSMETIC[look.aura].preset);
  }

  buildHair(head, style, color) {
    const flame = style === 'flame';
    const hm = mat(color, flame ? { emissive: 0xff4a1a, emissiveIntensity: 0.7 } : style === 'halo' ? { roughness: 0.3 } : {});
    const add = (geo, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const m = new THREE.Mesh(geo, hm); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); head.add(m); return m;
    };
    const cap = (h = 0.32) => add(new RoundedBoxGeometry(1.36, h, 1.3, 2, 0.12), 0, 0.62, -0.02);
    const cone = (r, h) => new THREE.ConeGeometry(r, h, 6);

    if (style === 'buzz') { cap(0.22); return; }
    if (style === 'mohawk') {
      for (let i = 0; i < 6; i++) add(cone(0.16, 0.7 - Math.abs(i - 2.5) * 0.08), 0, 0.95, 0.5 - i * 0.2, -0.3 + i * 0.12);
      add(new RoundedBoxGeometry(0.4, 0.2, 1.3, 2, 0.08), 0, 0.68, 0);
      return;
    }
    cap(style === 'long' ? 0.4 : 0.34);
    // Fringe over the forehead.
    if (style !== 'horns') {
      const n = style === 'swept' ? 4 : 5;
      for (let i = 0; i < n; i++) {
        const x = -0.5 + i * (1 / (n - 1));
        const len = style === 'swept' ? 0.35 + i * 0.06 : 0.3 + ((i * 7) % 3) * 0.06;
        add(cone(0.15, len), x, 0.4, 0.62, Math.PI, 0, style === 'swept' ? -0.4 : 0);
      }
    }
    if (style === 'messy' || style === 'spiky' || style === 'flame' || style === 'horns') {
      const count = style === 'messy' ? 9 : 12;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const r = 0.45;
        const tall = style === 'flame' ? 0.9 + (i % 3) * 0.2 : style === 'messy' ? 0.35 : 0.6;
        const m = add(cone(0.18, tall), Math.cos(a) * r, 0.85, Math.sin(a) * r, Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6);
        if (flame) m.userData.flicker = i;
      }
      add(cone(0.2, style === 'flame' ? 1.2 : 0.7), 0, 1.05, 0);
    }
    if (style === 'horns') {
      for (const s of [-1, 1]) {
        const h = new THREE.Mesh(cone(0.16, 0.9), mat(0x1a0a0a, { emissive: 0xff2a4a, emissiveIntensity: 0.4 }));
        h.position.set(s * 0.5, 1.0, 0.15); h.rotation.z = -s * 0.45; head.add(h);
      }
    }
    if (style === 'long') {
      add(new RoundedBoxGeometry(1.3, 1.3, 0.25, 2, 0.1), 0, -0.05, -0.62);
      add(new THREE.SphereGeometry(0.2, 12, 8), 0, 0.2, -0.85);
      for (const s of [-1, 1]) add(new RoundedBoxGeometry(0.18, 0.9, 0.9, 2, 0.06), s * 0.67, 0.1, -0.05);
    }
    if (style === 'swept') add(new RoundedBoxGeometry(0.3, 0.6, 1.0, 2, 0.08), 0.62, 0.3, 0);
    if (style === 'halo') {
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 8, 40), new THREE.MeshBasicMaterial({ color: 0x7dfff0 }));
      halo.rotation.x = Math.PI / 2; halo.position.y = 1.25; head.add(halo); this.halo = halo;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        add(cone(0.14, 0.5), Math.cos(a) * 0.45, 0.82, Math.sin(a) * 0.45, Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);
      }
    } else this.halo = null;
  }

  setAura(preset) {
    if (this.aura) { this.scene.remove(this.aura.group); this.aura = null; }
    const p = preset || (this.power > 0.15 ? { color: '#2f9bff', kind: 'flame', weak: true } : null);
    if (!p) { this.auraLight.intensity = 0; return; }
    const group = new THREE.Group();
    const count = p.weak ? 40 : 140;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3), seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, r = 1.4 + Math.random() * 0.9;
      pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = Math.random() * 6; pos[i * 3 + 2] = Math.sin(a) * r * 0.7;
      seeds[i] = Math.random();
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const color = new THREE.Color(p.color);
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({
      color, size: p.kind === 'spark' ? 0.18 : 0.26, transparent: true, opacity: p.weak ? 0.5 : 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    group.add(pts);
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 6.2, 32, 1, true), new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: p.weak ? 0.05 : 0.13, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
    }));
    shell.position.y = 3; group.add(shell);
    this.scene.add(group);
    this.aura = { group, pts, shell, seeds, kind: p.kind, color, weak: p.weak };
    this.auraLight.color = color;
    this.auraLight.intensity = p.weak ? 4 : 14;
    this.ring.material.color = color;
  }

  celebrate() { this.pulse = 1; }

  snapshot() {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  tick() {
    const dt = Math.min(0.05, this.clock.getDelta());
    this.t += dt;
    const t = this.t;
    if (!this.dragging) this.yaw += dt * 0.35;
    this.root.rotation.y = this.yaw;
    this.pulse = Math.max(0, this.pulse - dt * 1.4);
    const jump = Math.sin((1 - this.pulse) * Math.PI) * this.pulse * 1.4;
    if (this.body) {
      this.body.position.y = Math.sin(t * 2) * 0.05 + jump;
      if (this.pulse > 0) this.body.rotation.y = (1 - this.pulse) * Math.PI * 2;
      else this.body.rotation.y = 0;
      this.arms.forEach((a, i) => { a.rotation.x = Math.sin(t * 2 + i * Math.PI) * 0.08 - this.pulse * 2.6; a.rotation.z = (i ? 1 : -1) * this.pulse * 0.4; });
      this.legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 2 + i * Math.PI) * 0.04; });
      this.head.children.forEach(c => { if (c.userData.flicker != null) c.scale.y = 1 + Math.sin(t * 9 + c.userData.flicker) * 0.18; });
      if (this.halo) this.halo.rotation.z = t;
    }
    this.ball.rotation.x += dt * 1.2;
    this.ball.position.y = 0.42 + Math.abs(Math.sin(t * 2.4)) * 0.25;
    this.ring.scale.setScalar(1 + this.pulse * 0.25);

    if (this.aura) {
      const a = this.aura;
      const pos = a.pts.geometry.attributes.position;
      const speed = a.kind === 'smoke' ? 0.8 : a.kind === 'spark' ? 3.2 : 1.8;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + dt * speed * (0.6 + a.seeds[i]) * (1 + this.pulse * 3);
        if (y > 6.4) y = 0;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
      a.group.rotation.y += dt * 0.6;
      const flick = a.kind === 'spark' ? (Math.random() > 0.85 ? 1 : 0.55) : 0.8 + Math.sin(t * 4) * 0.2;
      a.shell.material.opacity = (a.weak ? 0.04 : 0.11) * flick + this.pulse * 0.2;
      if (a.kind === 'prism') {
        a.pts.material.color.setHSL((t * 0.2) % 1, 1, 0.65);
        a.shell.material.color.setHSL((t * 0.2 + 0.5) % 1, 1, 0.6);
        this.ring.material.color.setHSL((t * 0.2) % 1, 1, 0.6);
      }
      this.auraLight.intensity = (a.weak ? 4 : 14) * flick + this.pulse * 20;
    }
    this.renderer.render(this.scene, this.camera);
  }
}
