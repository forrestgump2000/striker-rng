// Blocky 3D striker preview built with three.js:
// cel-shaded (toon) materials, ink outlines, bloom, a night-stadium backdrop and a shader aura.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { COSMETIC } from './data.js';

const INK = 0x0d0a16;

// Three-step ramp gives the hard anime light/shadow split.
const toonRamp = (() => {
  const t = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 160, 160, 160, 255, 225, 225, 225, 255]), 3, 1);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();
const mat = (color, extra = {}) => new THREE.MeshToonMaterial({ color, gradientMap: toonRamp, ...extra });

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const GLOW_EYES = { ego: '#2f9bff', predator: '#ffb627', abyss: '#7dfff0' };

// Anime eyes drawn into the head's front face. The emissive pass carries only glowing irises.
function drawFace(g, face, skin, emissiveOnly) {
  const glow = GLOW_EYES[face];
  g.fillStyle = emissiveOnly ? '#000' : skin;
  g.fillRect(0, 0, 256, 256);
  if (emissiveOnly && !glow) return;
  const iris = glow || '#3a6ad6';
  const eye = (cx, o) => {
    const top = face === 'calm' ? 16 : face === 'glare' || face === 'predator' ? 18 : 26;
    const tilt = face === 'glare' || face === 'predator' || face === 'abyss' ? 10 : 3;
    const ix = cx - o * 26, iy = 132, ox = cx + o * 30, oy = 132 - tilt;
    const white = new Path2D();
    white.moveTo(ix, iy); white.quadraticCurveTo(cx, 132 - top * 1.6, ox, oy); white.quadraticCurveTo(cx, 148, ix, iy);
    g.save();
    if (!emissiveOnly) { g.fillStyle = '#fbfcff'; g.fill(white); }
    g.clip(white);
    const grd = g.createLinearGradient(0, 100, 0, 150);
    grd.addColorStop(0, face === 'abyss' ? '#000' : '#0d1530');
    grd.addColorStop(0.55, face === 'abyss' ? '#05050a' : iris);
    grd.addColorStop(1, face === 'abyss' ? '#7dfff0' : '#e8f4ff');
    g.fillStyle = grd;
    g.beginPath(); g.ellipse(cx + o * 2, 130, 17, 22, 0, 0, Math.PI * 2); g.fill();
    if (!emissiveOnly) {
      g.fillStyle = '#07060c';
      if (face === 'predator') g.fillRect(cx + o * 2 - 3, 112, 6, 34);
      else { g.beginPath(); g.ellipse(cx + o * 2, 132, 7, 11, 0, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = '#fff';
      g.beginPath(); g.arc(cx - 5, 120, 6, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(cx + 7, 140, 3, 0, Math.PI * 2); g.fill();
    }
    g.restore();
    if (emissiveOnly) return;
    // Lash line with the outer flick, lower lash and brow.
    g.fillStyle = '#120d1c';
    g.beginPath();
    g.moveTo(ix, iy); g.quadraticCurveTo(cx, 132 - top * 1.6 - 6, ox, oy - 2);
    g.lineTo(ox + o * 12, oy - 10); g.lineTo(ox + o * 2, oy + 4);
    g.quadraticCurveTo(cx, 132 - top * 1.6 + 6, ix, iy + 3); g.fill();
    g.strokeStyle = '#120d1c'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx - o * 4, 146); g.quadraticCurveTo(cx + o * 18, 146, ox - o * 2, oy + 6); g.stroke();
    const by = 132 - top * 1.6 - (face === 'glare' || face === 'predator' ? 8 : 18);
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(cx - o * 24, by + (face === 'glare' || face === 'predator' ? 12 : 2));
    g.quadraticCurveTo(cx, by - 6, cx + o * 30, by);
    g.stroke();
  };
  eye(78, -1); eye(178, 1);
  if (emissiveOnly) return;
  g.strokeStyle = 'rgba(120,60,70,.6)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(130, 156); g.lineTo(124, 176); g.lineTo(132, 178); g.stroke();
  g.strokeStyle = '#3a1a1a'; g.lineWidth = 5; g.lineCap = 'round';
  g.beginPath();
  if (face === 'grin' || face === 'ego') {
    g.fillStyle = '#fff'; g.moveTo(98, 198); g.quadraticCurveTo(128, 226, 162, 196); g.quadraticCurveTo(128, 206, 98, 198); g.fill(); g.stroke();
  } else if (face === 'predator' || face === 'abyss') {
    g.moveTo(102, 204); g.quadraticCurveTo(134, 208, 158, 194); g.stroke();
  } else if (face === 'calm') {
    g.moveTo(112, 204); g.quadraticCurveTo(128, 207, 146, 204); g.stroke();
  } else {
    g.moveTo(106, 200); g.quadraticCurveTo(128, 210, 152, 200); g.stroke();
  }
  g.fillStyle = 'rgba(255,110,130,.25)';
  g.beginPath(); g.ellipse(52, 172, 18, 8, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(204, 172, 18, 8, 0, 0, Math.PI * 2); g.fill();
}

function kitTexture(kit, number, name) {
  return canvasTex(256, 256, g => {
    g.fillStyle = kit.main; g.fillRect(0, 0, 256, 256);
    g.fillStyle = kit.trim;
    g.fillRect(0, 0, 256, 12);
    g.beginPath(); g.moveTo(92, 0); g.lineTo(128, 44); g.lineTo(164, 0); g.fill();
    g.globalAlpha = 0.22;
    for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-40 + i * 60, 256); g.lineTo(40 + i * 60, 60); g.lineTo(60 + i * 60, 60); g.lineTo(-20 + i * 60, 256); g.fill(); }
    g.globalAlpha = 1;
    g.font = 'bold 104px "Russo One", Impact, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 10; g.strokeStyle = kit.alt; g.strokeText(String(number), 128, 142);
    g.fillStyle = kit.num; g.fillText(String(number), 128, 142);
    g.font = 'bold 22px "Russo One", Impact, sans-serif';
    g.fillText(name, 128, 226);
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

function pitchTexture() {
  const t = canvasTex(1024, 1024, g => {
    for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#0f3a22' : '#124628'; g.fillRect(0, i * 64, 1024, 64); }
    g.strokeStyle = 'rgba(255,255,255,.32)'; g.lineWidth = 6;
    g.beginPath(); g.arc(512, 512, 150, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(0, 512); g.lineTo(1024, 512); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(512, 512, 10, 0, Math.PI * 2); g.fill();
    const v = g.createRadialGradient(512, 512, 200, 512, 512, 512);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(2,5,13,1)');
    g.fillStyle = v; g.fillRect(0, 0, 1024, 1024);
  });
  return t;
}

function crowdTexture() {
  const t = canvasTex(1024, 128, g => {
    const grd = g.createLinearGradient(0, 0, 0, 128);
    grd.addColorStop(0, '#02040b'); grd.addColorStop(1, '#0a1838');
    g.fillStyle = grd; g.fillRect(0, 0, 1024, 128);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = ['#2f7bff', '#ffffff', '#7dfff0', '#ffb627', '#ff3b6b'][i % 5];
      g.globalAlpha = 0.25 + Math.random() * 0.6;
      g.fillRect(Math.random() * 1024, 40 + Math.random() * 88, 2, 2);
    }
  });
  t.wrapS = THREE.RepeatWrapping; t.repeat.x = 3;
  return t;
}

function glowSprite(color, size) {
  const tex = canvasTex(128, 128, g => {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, '#ffffff'); r.addColorStop(0.2, color); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  s.scale.setScalar(size);
  return s;
}

// Rising flame shell for auras.
const auraShader = {
  uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color() }, uStrength: { value: 1 }, uPulse: { value: 0 }, uPrism: { value: 0 } },
  vertexShader: `
    varying vec2 vUv; varying float vRim; uniform float uTime;
    void main() {
      vUv = uv;
      vec3 nv = normalize(normalMatrix * normal);
      vRim = 1.0 - abs(nv.z);
      vec3 p = position;
      p.xz *= 1.0 + 0.08 * sin(uTime * 3.0 + position.y * 2.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`,
  fragmentShader: `
    varying vec2 vUv; varying float vRim; uniform float uTime; uniform vec3 uColor; uniform float uStrength; uniform float uPulse; uniform float uPrism;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
    }
    vec3 hue(float h) { return clamp(abs(mod(h * 6.0 + vec3(0, 4, 2), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
    void main() {
      vec2 q = vec2(vUv.x * 10.0, vUv.y * 3.0 - uTime * 1.6);
      float n = noise(q) * 0.6 + noise(q * 2.3 + 4.0) * 0.4;
      float body = (1.0 - vUv.y);
      float flame = smoothstep(0.25, 0.9, n * 0.9 + body * 0.75);
      // Glow mostly at the silhouette edges so the striker stays readable.
      float edge = 0.12 + pow(vRim, 1.6) * 0.9;
      float a = flame * body * edge * smoothstep(0.0, 0.08, vUv.y) * (0.5 + uPulse) * uStrength;
      vec3 col = mix(uColor, hue(fract(vUv.x + uTime * 0.15)), uPrism);
      gl_FragColor = vec4(col * (1.2 + flame * 1.5), a);
    }`,
};

export class AvatarPreview {
  constructor(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030713);
    this.scene.fog = new THREE.Fog(0x030713, 16, 34);
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    this.camera.position.set(0, 3.5, 13.5);
    this.camera.lookAt(0, 3.0, 0);

    this.scene.add(new THREE.HemisphereLight(0xbfd9ff, 0x0a1230, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(4, 10, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -5, right: 5, top: 8, bottom: -2, near: 1, far: 30 });
    key.shadow.bias = -0.002;
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x4fa8ff, 2); rim.position.set(-6, 5, -6); this.scene.add(rim);
    this.auraLight = new THREE.PointLight(0x2f9bff, 0, 12); this.auraLight.position.set(0, 3, 2.5); this.scene.add(this.auraLight);

    this.buildStadium();

    this.root = new THREE.Group(); this.scene.add(this.root);
    this.ball = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 20), mat(0xffffff, { map: ballTexture() }));
    this.ball.castShadow = true;
    this.ball.position.set(1.4, 0.42, 1.2);
    this.addOutline(this.ball, 0.035);
    this.scene.add(this.ball);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.6, 0.5, 0.97);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.aura = null;
    this.yaw = 0.35; this.dragging = false; this.pulse = 0; this.t = 0; this.power = 0;
    this.bindDrag();
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(container);
    this.resize();
    this.clock = new THREE.Clock();
    this.renderer.setAnimationLoop(() => this.tick());
  }

  buildStadium() {
    const pitch = new THREE.Mesh(new THREE.CircleGeometry(18, 64), new THREE.MeshToonMaterial({ map: pitchTexture(), gradientMap: toonRamp }));
    pitch.rotation.x = -Math.PI / 2; pitch.position.y = -0.31; pitch.receiveShadow = true;
    this.scene.add(pitch);

    const stands = new THREE.Mesh(new THREE.CylinderGeometry(19, 22, 9, 64, 1, true), new THREE.MeshBasicMaterial({ map: crowdTexture(), side: THREE.BackSide }));
    stands.position.y = 3.5; this.scene.add(stands);

    // Floodlights glow through bloom.
    this.floods = [];
    for (const [x, z] of [[-11, -12], [11, -12], [-15, -4], [15, -4]]) {
      const s = glowSprite('#9fd0ff', 5);
      s.position.set(x, 10.5, z);
      this.scene.add(s); this.floods.push(s);
      for (let i = 0; i < 3; i++) {
        const d = glowSprite('#ffffff', 0.9);
        d.position.set(x + (i - 1) * 0.9, 10.5, z + 0.1);
        this.scene.add(d);
      }
    }

    const ped = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.9, 0.3, 6), mat(0x0a1430, { emissive: 0x0a2a6a, emissiveIntensity: 0.5 }));
    ped.position.y = -0.15; ped.receiveShadow = true; this.scene.add(ped);
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0x2f9bff }));
    this.ring.rotation.x = Math.PI / 2; this.ring.rotation.z = Math.PI / 6; this.ring.position.y = 0.02; this.scene.add(this.ring);
    this.ring2 = new THREE.Mesh(new THREE.RingGeometry(3.0, 3.25, 64), new THREE.MeshBasicMaterial({ color: 0x2f9bff, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    this.ring2.rotation.x = -Math.PI / 2; this.ring2.position.y = -0.28; this.scene.add(this.ring2);
  }

  // Inverted-hull ink outline.
  addOutline(mesh, thickness = 0.045) {
    mesh.geometry.computeBoundingSphere();
    const r = mesh.geometry.boundingSphere.radius || 1;
    const o = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide }));
    o.scale.setScalar(1 + thickness / r);
    o.userData.outline = true;
    mesh.add(o);
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
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    // Pull back on narrow stages so the whole striker stays in frame.
    this.camera.position.z = w / h < 0.9 ? 16.5 : 13.5;
    this.camera.updateProjectionMatrix();
  }

  // look: equipped cosmetics; info: { number, name, power (0..1) }
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
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.78, 0.97), trimM);
      stripe.position.set(side * tw * 0.24, -0.4, 0); leg.add(stripe);
      const thigh = new THREE.Mesh(new RoundedBoxGeometry(tw * 0.42, 0.5, 0.85, 2, 0.08), skinM);
      thigh.position.y = -1.0; leg.add(thigh);
      const sockH = legsP === 'high' ? 0.9 : 0.6;
      const sockM = legsP === 'void' ? mat(0x05050a, { emissive: 0x7dfff0, emissiveIntensity: 0.35 }) : mat(kit.alt === '#000000' ? kit.trim : kit.main);
      const sock = new THREE.Mesh(new RoundedBoxGeometry(tw * 0.43, sockH, 0.88, 2, 0.08), sockM);
      sock.position.y = -1.75 + sockH / 2; leg.add(sock);
      const bootColor = { bolt: 0xffe14a, void: 0x101018 }[legsP] ?? 0x10131c;
      const boot = new THREE.Mesh(new RoundedBoxGeometry(tw * 0.46, 0.32, 1.05, 2, 0.1),
        mat(bootColor, legsP === 'bolt' ? { emissive: 0xffc400, emissiveIntensity: 1.1 } : legsP === 'void' ? { emissive: 0x7dfff0, emissiveIntensity: 0.9 } : {}));
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
      const plate = new THREE.Mesh(new RoundedBoxGeometry(tw * 1.08, 0.9, 1.15, 2, 0.12), mat(0x1a1d2a, { emissive: 0xff3b6b, emissiveIntensity: 0.45 }));
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
          armsP === 'flame' ? mat(skin, { emissive: 0xff5a1a, emissiveIntensity: 0.9 }) : skinM);
        fore.position.y = -1.3; arm.add(fore);
      }
      if (armsP === 'bands' || armsP === 'tape') {
        const band = new THREE.Mesh(new RoundedBoxGeometry(armW * 1.02, 0.22, 0.98, 2, 0.06), armsP === 'tape' ? mat(0xffb627, { emissive: 0xffb627, emissiveIntensity: 0.4 }) : trimM);
        band.position.y = armsP === 'tape' && side === -1 ? -0.5 : -1.7; arm.add(band);
      }
      const hand = new THREE.Mesh(new RoundedBoxGeometry(armW * 0.8, 0.3, 0.8, 2, 0.1), skinM);
      hand.position.y = -2.0; arm.add(hand);
      g.add(arm); this.arms.push(arm);
    }

    // Head
    const head = new THREE.Group(); head.position.y = 4.75;
    const glow = GLOW_EYES[faceP];
    const faceM = mat('#ffffff', {
      map: canvasTex(256, 256, c => drawFace(c, faceP, skin, false)),
      ...(glow ? { emissive: 0xffffff, emissiveIntensity: 1.6, emissiveMap: canvasTex(256, 256, c => drawFace(c, faceP, skin, true)) } : {}),
    });
    const headMesh = new THREE.Mesh(new RoundedBoxGeometry(1.25, 1.25, 1.2, 4, 0.3), [skinM, skinM, skinM, skinM, faceM, skinM]);
    head.add(headMesh);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.4, 12), skinM); neck.position.y = -0.7; head.add(neck);
    this.buildHair(head, hairP, look.hairColor);
    g.add(head); this.head = head;

    g.traverse(o => {
      if (o.isMesh && !o.userData.outline && !o.userData.noOutline) {
        o.castShadow = true;
        this.addOutline(o, o.geometry.type === 'ConeGeometry' ? 0.03 : 0.045);
      }
    });
    this.root.add(g);
    this.setAura(COSMETIC[look.aura].preset);
  }

  buildHair(head, style, color) {
    const flame = style === 'flame';
    const hm = mat(color, flame ? { emissive: 0xff4a1a, emissiveIntensity: 0.9 } : {});
    const add = (geo, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const m = new THREE.Mesh(geo, hm); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); head.add(m); return m;
    };
    const cap = (h = 0.32) => add(new RoundedBoxGeometry(1.36, h, 1.3, 2, 0.12), 0, 0.62, -0.02);
    const cone = (r, h) => new THREE.ConeGeometry(r, h, 5);
    this.halo = null;

    if (style === 'buzz') { cap(0.22); return; }
    if (style === 'mohawk') {
      for (let i = 0; i < 6; i++) add(cone(0.16, 0.75 - Math.abs(i - 2.5) * 0.08), 0, 0.98, 0.5 - i * 0.2, -0.3 + i * 0.12);
      add(new RoundedBoxGeometry(0.4, 0.2, 1.3, 2, 0.08), 0, 0.68, 0);
      return;
    }
    cap(style === 'long' ? 0.4 : 0.34);
    // Anime fringe: tapered locks hanging over the forehead.
    if (style !== 'horns') {
      const n = style === 'swept' ? 5 : 6;
      for (let i = 0; i < n; i++) {
        const x = -0.55 + i * (1.1 / (n - 1));
        const len = style === 'swept' ? 0.38 + i * 0.07 : 0.32 + ((i * 7) % 3) * 0.07;
        add(cone(0.14, len), x, 0.42, 0.6, Math.PI - 0.25, 0, style === 'swept' ? -0.45 : (x * -0.3));
      }
      for (const s of [-1, 1]) add(cone(0.13, 0.55), s * 0.66, 0.15, 0.25, Math.PI, 0, s * -0.12);
    }
    if (style === 'messy' || style === 'spiky' || style === 'flame' || style === 'horns') {
      const count = style === 'messy' ? 10 : 14;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const r = 0.46;
        const tall = style === 'flame' ? 0.9 + (i % 3) * 0.2 : style === 'messy' ? 0.38 + (i % 2) * 0.12 : 0.62 + (i % 3) * 0.1;
        const m = add(cone(0.17, tall), Math.cos(a) * r, 0.85, Math.sin(a) * r, Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7);
        if (flame) m.userData.flicker = i;
      }
      add(cone(0.2, style === 'flame' ? 1.2 : 0.75), 0, 1.08, 0);
    }
    if (style === 'horns') {
      for (const s of [-1, 1]) {
        const h = new THREE.Mesh(cone(0.16, 0.95), mat(0x1a0a0a, { emissive: 0xff2a4a, emissiveIntensity: 0.7 }));
        h.position.set(s * 0.5, 1.02, 0.15); h.rotation.z = -s * 0.45; head.add(h);
      }
    }
    if (style === 'long') {
      add(new RoundedBoxGeometry(1.3, 1.4, 0.25, 2, 0.1), 0, -0.1, -0.62);
      add(new THREE.SphereGeometry(0.2, 12, 8), 0, 0.2, -0.85);
      for (const s of [-1, 1]) add(new RoundedBoxGeometry(0.18, 1.0, 0.9, 2, 0.06), s * 0.67, 0.05, -0.05);
    }
    if (style === 'swept') add(new RoundedBoxGeometry(0.3, 0.6, 1.0, 2, 0.08), 0.62, 0.3, 0);
    if (style === 'halo') {
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 8, 40), new THREE.MeshBasicMaterial({ color: 0x7dfff0 }));
      halo.rotation.x = Math.PI / 2; halo.position.y = 1.28; halo.userData.noOutline = true; head.add(halo); this.halo = halo;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        add(cone(0.14, 0.5), Math.cos(a) * 0.45, 0.82, Math.sin(a) * 0.45, Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);
      }
    }
  }

  setAura(preset) {
    if (this.aura) { this.scene.remove(this.aura.group); this.aura = null; }
    const p = preset || (this.power > 0.15 ? { color: '#2f9bff', kind: 'flame', weak: true } : null);
    if (!p) { this.auraLight.intensity = 0; this.ring.material.color.set(0x2f9bff); this.ring2.material.color.set(0x2f9bff); return; }
    const group = new THREE.Group();
    const count = p.weak ? 50 : 160;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3), seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, r = 1.3 + Math.random() * 1.0;
      pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = Math.random() * 6.5; pos[i * 3 + 2] = Math.sin(a) * r * 0.7;
      seeds[i] = Math.random();
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const color = new THREE.Color(p.color);
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({
      color, size: p.kind === 'spark' ? 0.16 : 0.22, transparent: true, opacity: p.weak ? 0.6 : 1,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    group.add(pts);
    const shellMat = new THREE.ShaderMaterial({
      ...auraShader,
      uniforms: THREE.UniformsUtils.clone(auraShader.uniforms),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    shellMat.uniforms.uColor.value = color;
    shellMat.uniforms.uStrength.value = p.weak ? 0.35 : p.kind === 'smoke' ? 0.7 : 1;
    shellMat.uniforms.uPrism.value = p.kind === 'prism' ? 1 : 0;
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.3, 7, 48, 1, true), shellMat);
    shell.position.y = 3.2; group.add(shell);
    this.scene.add(group);
    this.aura = { group, pts, shell, seeds, kind: p.kind, color, weak: p.weak };
    this.auraLight.color = color;
    this.auraLight.intensity = p.weak ? 2 : 6;
    this.ring.material.color = color.clone();
    this.ring2.material.color = color.clone();
  }

  celebrate() { this.pulse = 1; }

  snapshot() {
    this.composer.render();
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
      this.body.rotation.y = this.pulse > 0 ? (1 - this.pulse) * Math.PI * 2 : 0;
      this.arms.forEach((a, i) => { a.rotation.x = Math.sin(t * 2 + i * Math.PI) * 0.08 - this.pulse * 2.6; a.rotation.z = (i ? 1 : -1) * this.pulse * 0.4; });
      this.legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 2 + i * Math.PI) * 0.04; });
      this.head.children.forEach(c => { if (c.userData.flicker != null) c.scale.y = 1 + Math.sin(t * 9 + c.userData.flicker) * 0.18; });
      if (this.halo) this.halo.rotation.z = t;
    }
    this.ball.rotation.x += dt * 1.2;
    this.ball.position.y = 0.42 + Math.abs(Math.sin(t * 2.4)) * 0.25;
    this.ring.scale.setScalar(1 + this.pulse * 0.25);
    this.ring2.material.opacity = 0.25 + Math.sin(t * 2) * 0.1 + this.pulse * 0.5;
    this.floods.forEach((s, i) => s.material.opacity = 0.85 + Math.sin(t * 1.3 + i) * 0.15);
    this.bloom.strength = 0.6 + this.pulse * 0.7;

    if (this.aura) {
      const a = this.aura;
      const pos = a.pts.geometry.attributes.position;
      const speed = a.kind === 'smoke' ? 0.8 : a.kind === 'spark' ? 3.2 : 1.8;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + dt * speed * (0.6 + a.seeds[i]) * (1 + this.pulse * 3);
        if (y > 6.6) y = 0;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
      a.group.rotation.y += dt * 0.5;
      const u = a.shell.material.uniforms;
      u.uTime.value = t;
      u.uPulse.value = this.pulse;
      const flick = a.kind === 'spark' ? (Math.random() > 0.85 ? 1 : 0.6) : 0.85 + Math.sin(t * 4) * 0.15;
      if (a.kind === 'prism') {
        a.pts.material.color.setHSL((t * 0.2) % 1, 1, 0.65);
        this.ring.material.color.setHSL((t * 0.2) % 1, 1, 0.6);
        this.auraLight.color.setHSL((t * 0.2) % 1, 1, 0.6);
      }
      this.auraLight.intensity = (a.weak ? 2 : 6) * flick + this.pulse * 12;
    }
    this.composer.render();
  }
}
