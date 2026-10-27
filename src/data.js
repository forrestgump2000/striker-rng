// Static game data: rarities, attributes, squads, weapons, characters, cosmetics.
// All characters are original designs for Striker RNG.

export const RARITIES = [
  { key: 'common',    name: 'Common',    color: '#9fb0c8', glow: 'rgba(159,176,200,.55)', weight: 60,  bonus: 2,  range: [44, 64], tier: 0 },
  { key: 'rare',      name: 'Rare',      color: '#3fa9ff', glow: 'rgba(63,169,255,.7)',   weight: 25,  bonus: 3,  range: [54, 72], tier: 1 },
  { key: 'epic',      name: 'Epic',      color: '#b65cff', glow: 'rgba(182,92,255,.75)',  weight: 10,  bonus: 5,  range: [64, 80], tier: 2 },
  { key: 'legendary', name: 'Legendary', color: '#ffb627', glow: 'rgba(255,182,39,.8)',   weight: 3.9, bonus: 7,  range: [74, 88], tier: 3 },
  { key: 'mythic',    name: 'Mythic',    color: '#ff3b6b', glow: 'rgba(255,59,107,.85)',  weight: 1,   bonus: 9,  range: [83, 94], tier: 4 },
  { key: 'secret',    name: 'Secret',    color: '#eafcff', glow: 'rgba(120,255,240,.9)',  weight: 0.1, bonus: 12, range: [90, 99], tier: 5 },
];
export const RARITY = Object.fromEntries(RARITIES.map(r => [r.key, r]));

export const ATTRIBUTES = [
  { key: 'shooting',  name: 'Shooting',  abbr: 'SHT', weight: 1.4, desc: 'Finishing power and shot accuracy.' },
  { key: 'speed',     name: 'Speed',     abbr: 'SPD', weight: 1.2, desc: 'Acceleration and top sprint speed.' },
  { key: 'dribbling', name: 'Dribbling', abbr: 'DRI', weight: 1.1, desc: 'Close control and take-ons.' },
  { key: 'passing',   name: 'Passing',   abbr: 'PAS', weight: 0.8, desc: 'Range and precision of passes.' },
  { key: 'physical',  name: 'Physical',  abbr: 'PHY', weight: 1.0, desc: 'Strength, balance and stamina.' },
  { key: 'defense',   name: 'Defense',   abbr: 'DEF', weight: 0.5, desc: 'Pressing and winning the ball back.' },
  { key: 'vision',    name: 'Vision',    abbr: 'VIS', weight: 0.9, desc: 'Reading space before it opens.' },
  { key: 'iq',        name: 'IQ',        abbr: 'IQ',  weight: 1.0, desc: 'Tactical thinking and positioning.' },
  { key: 'ego',       name: 'Ego',       abbr: 'EGO', weight: 1.2, desc: 'Hunger to be the one who scores.' },
  { key: 'weapon',    name: 'Weapon',    abbr: 'WPN', weight: 1.3, desc: 'Resets your special skill to this player\'s weapon.' },
];
export const ATTR = Object.fromEntries(ATTRIBUTES.map(a => [a.key, a]));

export const SQUADS = [
  { key: 'nova',    name: 'Squad Nova',    color: '#2f7bff', alt: '#0b1f4d' },
  { key: 'ember',   name: 'Squad Ember',   color: '#ff4b3a', alt: '#3d0d0a' },
  { key: 'volt',    name: 'Squad Volt',    color: '#ffd23a', alt: '#2e2600' },
  { key: 'rift',    name: 'Squad Rift',    color: '#9b5cff', alt: '#1f0d3d' },
  { key: 'tide',    name: 'Squad Tide',    color: '#1fd6c1', alt: '#06302c' },
  { key: 'onyx',    name: 'Squad Onyx',    color: '#cfd6e6', alt: '#121419' },
];
export const SQUAD = Object.fromEntries(SQUADS.map(s => [s.key, s]));

export const WEAPONS = [
  { id: 'toe_poke',      name: 'Toe Poke',            rarity: 'common',    power: 48, desc: 'A scrappy, quick-release poke past the keeper.' },
  { id: 'power_drive',   name: 'Power Drive',         rarity: 'common',    power: 57, desc: 'Laces through the ball. Simple. Loud.' },
  { id: 'low_driven',    name: 'Low Driven Shot',     rarity: 'common',    power: 55, desc: 'Skims the grass inside the far post.' },
  { id: 'glancing_head', name: 'Glancing Header',     rarity: 'common',    power: 53, desc: 'Flick-on header that redirects crosses.' },
  { id: 'curl_shot',     name: 'Finesse Curl',        rarity: 'rare',      power: 64, desc: 'Bends from outside the box into the top corner.' },
  { id: 'knuckle',       name: 'Knuckle Ball',        rarity: 'rare',      power: 66, desc: 'No spin. The ball wobbles and dips late.' },
  { id: 'snap_volley',   name: 'Snap Volley',         rarity: 'rare',      power: 63, desc: 'First-time volley that never touches the floor.' },
  { id: 'phantom_feint', name: 'Phantom Feint Shot',  rarity: 'epic',      power: 74, desc: 'Fake a shot, shift the keeper, then fire.' },
  { id: 'rising_volley', name: 'Rising Dragon Volley',rarity: 'epic',      power: 76, desc: 'A volley that climbs as it travels.' },
  { id: 'meteor_header', name: 'Meteor Header',       rarity: 'epic',      power: 73, desc: 'Hang in the air and hammer it down.' },
  { id: 'blindside',     name: 'Blindside Strike',    rarity: 'legendary', power: 84, desc: 'Strike from the keeper\'s blind spot before they react.' },
  { id: 'monarch_curve', name: 'Monarch Curve',       rarity: 'legendary', power: 86, desc: 'A banana curve that obeys only you.' },
  { id: 'thunder_step',  name: 'Thunder Step Strike', rarity: 'legendary', power: 85, desc: 'Explosive two-step burst into a point-blank shot.' },
  { id: 'chaos_spiral',  name: 'Chaos Spiral',        rarity: 'mythic',    power: 92, desc: 'A spinning shot whose path cannot be read.' },
  { id: 'abyss_volley',  name: 'Abyss Volley',        rarity: 'mythic',    power: 93, desc: 'A volley so heavy the net screams.' },
  { id: 'singularity',   name: 'Ego Singularity',     rarity: 'secret',    power: 98, desc: 'Everything on the pitch bends toward your goal.' },
  { id: 'world_ender',   name: 'World-Ender Drive',   rarity: 'secret',    power: 99, desc: 'The final shot. Nothing stops it.' },
];
export const WEAPON = Object.fromEntries(WEAPONS.map(w => [w.id, w]));

// Hair styles map to procedural portrait / 3D presets.
// focus: attributes this player excels at (first two are signature = character bonus).
export const CHARACTERS = [
  // ---- Common ----
  { id: 'haruto',   name: 'Haruto Kobe',       rarity: 'common', squad: 'nova',  style: 'Workhorse Forward',  focus: ['physical', 'defense', 'ego'],   weapon: 'power_drive',   ability: 'Second Wind — stamina refills once per half.',               look: { hair: 'messy',  hairColor: '#3b2a1f', eye: '#5a7fa8', skin: '#f2c9a5', mouth: 'neutral', eyes: 'round' } },
  { id: 'sota',     name: 'Sota Minase',       rarity: 'common', squad: 'tide',  style: 'Quick Winger',       focus: ['speed', 'dribbling', 'passing'],weapon: 'low_driven',    ability: 'Overlap Run — bursts down the flank on cue.',                look: { hair: 'swept',  hairColor: '#20262e', eye: '#3fb5a8', skin: '#f5d2b3', mouth: 'smile',   eyes: 'round' } },
  { id: 'riku',     name: 'Riku Tanabe',       rarity: 'common', squad: 'ember', style: 'Poacher',            focus: ['shooting', 'ego', 'speed'],     weapon: 'toe_poke',      ability: 'Rebound Hunter — first to every loose ball.',                look: { hair: 'spiky',  hairColor: '#7a2a1a', eye: '#a8462d', skin: '#eab48f', mouth: 'smirk',   eyes: 'sharp' } },
  { id: 'yuto',     name: 'Yuto Arakawa',      rarity: 'common', squad: 'volt',  style: 'Target Man',         focus: ['physical', 'shooting', 'iq'],   weapon: 'glancing_head', ability: 'Hold-Up Play — shields the ball under pressure.',            look: { hair: 'buzz',   hairColor: '#191919', eye: '#6b4a2a', skin: '#c98d62', mouth: 'neutral', eyes: 'calm' } },
  { id: 'daichi',   name: 'Daichi Morisaki',   rarity: 'common', squad: 'onyx',  style: 'Box-to-Box',         focus: ['passing', 'physical', 'defense'],weapon: 'power_drive',  ability: 'Engine Room — never stops running.',                         look: { hair: 'slick',  hairColor: '#2a2a33', eye: '#4c5566', skin: '#f0c49c', mouth: 'neutral', eyes: 'calm' } },
  { id: 'kenta',    name: 'Kenta Oyama',       rarity: 'common', squad: 'rift',  style: 'Trickster',          focus: ['dribbling', 'vision', 'ego'],   weapon: 'toe_poke',      ability: 'Nutmeg Merchant — loves going through the legs.',            look: { hair: 'bob',    hairColor: '#4b2d6b', eye: '#8b5cd6', skin: '#f4cfae', mouth: 'grin',    eyes: 'round' } },
  { id: 'shun',     name: 'Shun Hayasaka',     rarity: 'common', squad: 'nova',  style: 'Sprinter',           focus: ['speed', 'ego', 'shooting'],     weapon: 'low_driven',    ability: 'Flash Start — wins every foot race over 10m.',               look: { hair: 'spiky',  hairColor: '#c9b48a', eye: '#3c6fb0', skin: '#f6d6b8', mouth: 'grin',    eyes: 'sharp' } },
  { id: 'ren',      name: 'Ren Kurahashi',     rarity: 'common', squad: 'tide',  style: 'Deep Playmaker',     focus: ['passing', 'vision', 'iq'],      weapon: 'curl_shot',     ability: 'Switch Play — sprays long diagonals.',                       look: { hair: 'long',   hairColor: '#1d3b4a', eye: '#2fb0c9', skin: '#efc6a3', mouth: 'neutral', eyes: 'calm' } },
  { id: 'taiga',    name: 'Taiga Ushio',       rarity: 'common', squad: 'ember', style: 'Bruiser',            focus: ['physical', 'defense', 'shooting'],weapon: 'power_drive', ability: 'Shoulder Charge — bulldozes through tackles.',               look: { hair: 'mohawk', hairColor: '#b8321f', eye: '#7a2a1a', skin: '#c2865a', mouth: 'smirk',   eyes: 'glare' } },
  { id: 'itsuki',   name: 'Itsuki Nomura',     rarity: 'common', squad: 'volt',  style: 'Late Runner',        focus: ['iq', 'shooting', 'speed'],      weapon: 'snap_volley',   ability: 'Ghost Run — arrives in the box unmarked.',                   look: { hair: 'swept',  hairColor: '#6b5a2a', eye: '#b59a3a', skin: '#f2cda9', mouth: 'smile',   eyes: 'round' } },
  // ---- Rare ----
  { id: 'kaede',    name: 'Kaede Shirogane',   rarity: 'rare',   squad: 'onyx',  style: 'Silver Technician',  focus: ['dribbling', 'passing', 'vision'],weapon: 'curl_shot',    ability: 'Silk Touch — first touch kills any pass dead.',              look: { hair: 'bob',    hairColor: '#d8dde6', eye: '#7d8ba3', skin: '#f7dcc4', mouth: 'neutral', eyes: 'calm' } },
  { id: 'jin',      name: 'Jin Takamori',      rarity: 'rare',   squad: 'nova',  style: 'Aerial Tower',       focus: ['physical', 'shooting', 'defense'],weapon: 'glancing_head',ability: 'Sky Claim — wins every header in the box.',                 look: { hair: 'buzz',   hairColor: '#2b1b12', eye: '#4d3624', skin: '#a86b45', mouth: 'smirk',   eyes: 'sharp' } },
  { id: 'hayate',   name: 'Hayate Kirishima',  rarity: 'rare',   squad: 'tide',  style: 'Wind Dribbler',      focus: ['speed', 'dribbling', 'ego'],    weapon: 'snap_volley',   ability: 'Gale Cut — changes direction at full speed.',                look: { hair: 'messy',  hairColor: '#2ea8a0', eye: '#1fd6c1', skin: '#f3cfae', mouth: 'grin',    eyes: 'sharp' } },
  { id: 'asahi',    name: 'Asahi Fujikura',    rarity: 'rare',   squad: 'ember', style: 'Dawn Finisher',      focus: ['shooting', 'iq', 'ego'],        weapon: 'knuckle',       ability: 'Early Strike — shoots before the defense is set.',           look: { hair: 'spiky',  hairColor: '#ff8a2a', eye: '#ff6a2a', skin: '#f1c7a0', mouth: 'smirk',   eyes: 'sharp' } },
  { id: 'nao',      name: 'Nao Sekiguchi',     rarity: 'rare',   squad: 'rift',  style: 'Shadow Marker',      focus: ['defense', 'iq', 'speed'],       weapon: 'low_driven',    ability: 'Lockdown — glues to the opponent\'s best player.',           look: { hair: 'long',   hairColor: '#2c1d45', eye: '#9b5cff', skin: '#efc29d', mouth: 'neutral', eyes: 'glare' } },
  { id: 'ryo',      name: 'Ryo Amagi',         rarity: 'rare',   squad: 'volt',  style: 'Rain Volleyer',      focus: ['shooting', 'dribbling', 'physical'],weapon: 'snap_volley',ability: 'Downpour — volleys anything that drops from the sky.',     look: { hair: 'slick',  hairColor: '#3b4a6b', eye: '#6b8fd6', skin: '#e9b993', mouth: 'smirk',   eyes: 'calm' } },
  { id: 'tsubasa',  name: 'Tsubasa Okuda',     rarity: 'rare',   squad: 'nova',  style: 'Wing Commander',     focus: ['passing', 'speed', 'vision'],   weapon: 'curl_shot',     ability: 'Whip Cross — crosses that curve away from keepers.',         look: { hair: 'swept',  hairColor: '#e6c35a', eye: '#3f7bd6', skin: '#f7d8bc', mouth: 'smile',   eyes: 'round' } },
  { id: 'kyo',      name: 'Kyo Hanazono',      rarity: 'rare',   squad: 'onyx',  style: 'Flower Feint',       focus: ['dribbling', 'ego', 'vision'],   weapon: 'knuckle',       ability: 'Bloom Step — a feint that blossoms into space.',             look: { hair: 'bob',    hairColor: '#ff7fb5', eye: '#ff5c9e', skin: '#f8dcc8', mouth: 'grin',    eyes: 'round' } },
  // ---- Epic ----
  { id: 'ryuji',    name: 'Ryuji Kagero',      rarity: 'epic',   squad: 'ember', style: 'Heat Haze Striker',  focus: ['shooting', 'speed', 'ego'],     weapon: 'rising_volley', ability: 'Mirage — leaves a heat-haze afterimage on every run.',       look: { hair: 'spiky',  hairColor: '#e8382a', eye: '#ffb02a', skin: '#efc19b', mouth: 'smirk',   eyes: 'sharp', mark: 'scar' } },
  { id: 'shin',     name: 'Shin Murakumo',     rarity: 'epic',   squad: 'onyx',  style: 'Cloud Reader',       focus: ['vision', 'iq', 'passing'],      weapon: 'phantom_feint', ability: 'Overcast — sees the whole pitch from above.',                look: { hair: 'long',   hairColor: '#8f9bb3', eye: '#cfd6e6', skin: '#f3d3b8', mouth: 'neutral', eyes: 'calm' } },
  { id: 'akira',    name: 'Akira Tsukishiro',  rarity: 'epic',   squad: 'rift',  style: 'Moonlit Assassin',   focus: ['dribbling', 'shooting', 'iq'],  weapon: 'phantom_feint', ability: 'Eclipse Cut — vanishes from the defender\'s view.',          look: { hair: 'swept',  hairColor: '#1a1630', eye: '#c79bff', skin: '#f6dac4', mouth: 'neutral', eyes: 'glare' } },
  { id: 'yamato',   name: 'Yamato Ibuki',      rarity: 'epic',   squad: 'volt',  style: 'Iron Spearhead',     focus: ['physical', 'shooting', 'ego'],  weapon: 'meteor_header', ability: 'Juggernaut — gets stronger each time he is fouled.',         look: { hair: 'mohawk', hairColor: '#ffd23a', eye: '#d9a400', skin: '#b97a4f', mouth: 'grin',    eyes: 'glare' } },
  { id: 'sena',     name: 'Sena Hoshikawa',    rarity: 'epic',   squad: 'tide',  style: 'Star Flow',          focus: ['dribbling', 'speed', 'vision'], weapon: 'rising_volley', ability: 'Constellation — links every dribble into one flow.',         look: { hair: 'bob',    hairColor: '#69e0ff', eye: '#3fd6ff', skin: '#f7dfcc', mouth: 'smile',   eyes: 'round', mark: 'star' } },
  { id: 'ginji',    name: 'Ginji Raikou',      rarity: 'epic',   squad: 'volt',  style: 'Lightning Rod',      focus: ['speed', 'shooting', 'physical'],weapon: 'thunder_step',  ability: 'Static Burst — first step is faster than sound.',            look: { hair: 'spiky',  hairColor: '#f5f0c8', eye: '#ffe14a', skin: '#efc6a2', mouth: 'grin',    eyes: 'sharp' } },
  { id: 'touma',    name: 'Touma Kurogane',    rarity: 'epic',   squad: 'nova',  style: 'Steel Anchor',       focus: ['defense', 'physical', 'iq'],    weapon: 'meteor_header', ability: 'Iron Wall — turns defense into instant counters.',           look: { hair: 'slick',  hairColor: '#40485a', eye: '#7da3ff', skin: '#d9a079', mouth: 'neutral', eyes: 'glare', mark: 'scar' } },
  // ---- Legendary ----
  { id: 'kaito',    name: 'Kaito Renjo',       rarity: 'legendary', squad: 'nova', style: 'Spatial Predator',  focus: ['iq', 'shooting', 'vision'],     weapon: 'blindside',     ability: 'Meta Vision — reads every possible goal route at once.',     look: { hair: 'messy',  hairColor: '#0f1a33', eye: '#2f7bff', skin: '#f3cfae', mouth: 'smirk',   eyes: 'sharp' } },
  { id: 'zen',      name: 'Zen Ashikaga',      rarity: 'legendary', squad: 'onyx', style: 'Silent Monarch',    focus: ['passing', 'vision', 'dribbling'],weapon: 'monarch_curve', ability: 'Royal Decree — teammates move exactly where he wills.',     look: { hair: 'long',   hairColor: '#f2f2f2', eye: '#ffcc4a', skin: '#f6dbc6', mouth: 'neutral', eyes: 'calm' } },
  { id: 'raizo',    name: 'Raizo Kamikaze',    rarity: 'legendary', squad: 'volt', style: 'Storm Breaker',     focus: ['speed', 'ego', 'shooting'],     weapon: 'thunder_step',  ability: 'Divine Wind — top speed on the very first step.',            look: { hair: 'spiky',  hairColor: '#ffe14a', eye: '#2ad4ff', skin: '#eebd96', mouth: 'grin',    eyes: 'sharp', mark: 'bolt' } },
  { id: 'hikaru',   name: 'Hikaru Sumeragi',   rarity: 'legendary', squad: 'tide', style: 'Radiant Prodigy',   focus: ['dribbling', 'ego', 'speed'],    weapon: 'monarch_curve', ability: 'Halo Touch — the ball never leaves his feet.',               look: { hair: 'swept',  hairColor: '#fff2b0', eye: '#1fd6c1', skin: '#f8e0cc', mouth: 'smile',   eyes: 'round', mark: 'star' } },
  { id: 'leon',     name: 'Leon Valcourt',     rarity: 'legendary', squad: 'ember', style: 'Crimson Emperor',  focus: ['shooting', 'physical', 'ego'],  weapon: 'blindside',     ability: 'Coronation — scores and demands the spotlight.',             look: { hair: 'slick',  hairColor: '#e7c04a', eye: '#d62a2a', skin: '#f2cba9', mouth: 'smirk',   eyes: 'glare' } },
  // ---- Mythic ----
  { id: 'seiya',    name: 'Seiya Homura',      rarity: 'mythic', squad: 'ember', style: 'Blaze Incarnate',    focus: ['shooting', 'ego', 'physical'],  weapon: 'abyss_volley',  ability: 'Inferno Mode — every touch heats the next shot.',            look: { hair: 'spiky',  hairColor: '#ff3a1a', eye: '#ffd23a', skin: '#efc19b', mouth: 'grin',    eyes: 'glare', mark: 'flame' } },
  { id: 'dante',    name: 'Dante Moreau',      rarity: 'mythic', squad: 'rift',  style: 'Chaos Artist',       focus: ['dribbling', 'ego', 'iq'],       weapon: 'chaos_spiral',  ability: 'Masterpiece — improvises a new skill every match.',          look: { hair: 'long',   hairColor: '#5b1e8f', eye: '#ff5ce1', skin: '#f2cdb0', mouth: 'smirk',   eyes: 'sharp', mark: 'star' } },
  { id: 'kurou',    name: 'Kurou Yaminaka',    rarity: 'mythic', squad: 'onyx',  style: 'Void Hunter',        focus: ['iq', 'shooting', 'defense'],    weapon: 'abyss_volley',  ability: 'Blackout — erases himself from the defender\'s memory.',     look: { hair: 'messy',  hairColor: '#0b0b10', eye: '#ff2a4a', skin: '#e9c3a5', mouth: 'neutral', eyes: 'glare', mark: 'scar' } },
  { id: 'elias',    name: 'Elias Brandt',      rarity: 'mythic', squad: 'nova',  style: 'Overdrive Engine',      focus: ['speed', 'shooting', 'vision'],  weapon: 'chaos_spiral',  ability: 'Overdrive — gets faster the longer the match goes.',         look: { hair: 'swept',  hairColor: '#cfe3ff', eye: '#2f7bff', skin: '#f7dcc8', mouth: 'smirk',   eyes: 'sharp', mark: 'bolt' } },
  // ---- Secret ----
  { id: 'rei',      name: 'Rei Amatsuka',      rarity: 'secret', squad: 'tide',  style: 'The Singularity',    focus: ['ego', 'shooting', 'iq'],        weapon: 'singularity',   ability: 'Event Horizon — the whole pitch collapses toward him.',      look: { hair: 'long',   hairColor: '#e9fbff', eye: '#7dfff0', skin: '#f8e3d4', mouth: 'neutral', eyes: 'calm', mark: 'halo' } },
  { id: 'oberon',   name: 'Oberon Wolfe',      rarity: 'secret', squad: 'rift',  style: 'Apex Egoist',        focus: ['shooting', 'physical', 'ego'],  weapon: 'world_ender',   ability: 'Final Form — every attribute surges when trailing.',         look: { hair: 'mohawk', hairColor: '#120a1f', eye: '#ffe14a', skin: '#c48b62', mouth: 'grin',    eyes: 'glare', mark: 'flame' } },
];
export const CHARACTER = Object.fromEntries(CHARACTERS.map(c => [c.id, c]));

// Cosmetics. level: auto-unlock at this player level. No level = drop only. 'default' items always owned.
export const COSMETIC_SLOTS = [
  { key: 'hair',     name: 'Hair' },
  { key: 'face',     name: 'Face' },
  { key: 'torso',    name: 'Torso' },
  { key: 'arms',     name: 'Arms' },
  { key: 'legs',     name: 'Legs' },
  { key: 'clothing', name: 'Kit' },
  { key: 'aura',     name: 'Aura' },
];

export const COSMETICS = [
  // hair
  { id: 'hair_buzz',    slot: 'hair', name: 'Buzz Cut',       rarity: 'common',    default: true, preset: 'buzz' },
  { id: 'hair_messy',   slot: 'hair', name: 'Bedhead',        rarity: 'common',    default: true, preset: 'messy' },
  { id: 'hair_spiky',   slot: 'hair', name: 'Striker Spikes', rarity: 'rare',      level: 2,      preset: 'spiky' },
  { id: 'hair_swept',   slot: 'hair', name: 'Swept Fringe',   rarity: 'rare',      level: 3,      preset: 'swept' },
  { id: 'hair_long',    slot: 'hair', name: 'Long Tied',      rarity: 'epic',      level: 5,      preset: 'long' },
  { id: 'hair_mohawk',  slot: 'hair', name: 'Mohawk',         rarity: 'epic',                     preset: 'mohawk' },
  { id: 'hair_horns',   slot: 'hair', name: 'Demon Spikes',   rarity: 'legendary', level: 9,      preset: 'horns' },
  { id: 'hair_flame',   slot: 'hair', name: 'Crown Flame',    rarity: 'mythic',                   preset: 'flame' },
  { id: 'hair_halo',    slot: 'hair', name: 'Void Halo',      rarity: 'secret',                   preset: 'halo' },
  // face
  { id: 'face_focus',   slot: 'face', name: 'Focused',        rarity: 'common',    default: true, preset: 'focus' },
  { id: 'face_grin',    slot: 'face', name: 'Grin',           rarity: 'common',    default: true, preset: 'grin' },
  { id: 'face_calm',    slot: 'face', name: 'Calm',           rarity: 'rare',      level: 2,      preset: 'calm' },
  { id: 'face_glare',   slot: 'face', name: 'Glare',          rarity: 'rare',                     preset: 'glare' },
  { id: 'face_ego',     slot: 'face', name: 'Ego Eyes',       rarity: 'epic',      level: 6,      preset: 'ego' },
  { id: 'face_predator',slot: 'face', name: 'Predator',       rarity: 'legendary',                preset: 'predator' },
  { id: 'face_abyss',   slot: 'face', name: 'Abyss Gaze',     rarity: 'secret',                   preset: 'abyss' },
  // torso (body build)
  { id: 'torso_std',    slot: 'torso', name: 'Standard',      rarity: 'common',    default: true, preset: 'standard' },
  { id: 'torso_lean',   slot: 'torso', name: 'Lean',          rarity: 'common',    default: true, preset: 'lean' },
  { id: 'torso_ath',    slot: 'torso', name: 'Athletic',      rarity: 'rare',      level: 4,      preset: 'athletic' },
  { id: 'torso_titan',  slot: 'torso', name: 'Titan',         rarity: 'legendary', level: 12,     preset: 'titan' },
  { id: 'torso_armor',  slot: 'torso', name: 'Ego Armor',     rarity: 'mythic',                   preset: 'armor' },
  // arms
  { id: 'arms_none',    slot: 'arms', name: 'Bare',           rarity: 'common',    default: true, preset: 'none' },
  { id: 'arms_bands',   slot: 'arms', name: 'Wristbands',     rarity: 'common',    level: 2,      preset: 'bands' },
  { id: 'arms_sleeves', slot: 'arms', name: 'Long Sleeves',   rarity: 'rare',      level: 4,      preset: 'sleeves' },
  { id: 'arms_tape',    slot: 'arms', name: 'Captain Tape',   rarity: 'epic',                     preset: 'tape' },
  { id: 'arms_flame',   slot: 'arms', name: 'Blazing Arms',   rarity: 'mythic',                   preset: 'flame' },
  // legs
  { id: 'legs_socks',   slot: 'legs', name: 'Team Socks',     rarity: 'common',    default: true, preset: 'socks' },
  { id: 'legs_high',    slot: 'legs', name: 'High Socks',     rarity: 'rare',      level: 3,      preset: 'high' },
  { id: 'legs_pads',    slot: 'legs', name: 'Knee Pads',      rarity: 'epic',                     preset: 'pads' },
  { id: 'legs_bolt',    slot: 'legs', name: 'Lightning Boots',rarity: 'legendary', level: 10,     preset: 'bolt' },
  { id: 'legs_void',    slot: 'legs', name: 'Void Steps',     rarity: 'secret',                   preset: 'void' },
  // clothing (kit)
  { id: 'kit_bib',      slot: 'clothing', name: 'Training Bib',  rarity: 'common',    default: true, preset: { main: '#1a3fbf', alt: '#0a1230', trim: '#ffffff', num: '#ffffff' } },
  { id: 'kit_home',     slot: 'clothing', name: 'Home Kit',      rarity: 'common',    default: true, preset: { main: '#f2f5ff', alt: '#11204a', trim: '#2f7bff', num: '#11204a' } },
  { id: 'kit_away',     slot: 'clothing', name: 'Away Kit',      rarity: 'rare',      level: 2,      preset: { main: '#11161f', alt: '#05070b', trim: '#1fd6c1', num: '#1fd6c1' } },
  { id: 'kit_crimson',  slot: 'clothing', name: 'Crimson Kit',   rarity: 'rare',                     preset: { main: '#c4162e', alt: '#2b0408', trim: '#ffd23a', num: '#ffffff' } },
  { id: 'kit_night',    slot: 'clothing', name: 'Midnight Kit',  rarity: 'epic',      level: 7,      preset: { main: '#1b1240', alt: '#07051a', trim: '#b65cff', num: '#e7dbff' } },
  { id: 'kit_gold',     slot: 'clothing', name: 'Golden Kit',    rarity: 'legendary',                preset: { main: '#e2a923', alt: '#2a1d03', trim: '#ffffff', num: '#2a1d03' } },
  { id: 'kit_void',     slot: 'clothing', name: 'Void Kit',      rarity: 'secret',                   preset: { main: '#050508', alt: '#000000', trim: '#7dfff0', num: '#7dfff0' } },
  // aura
  { id: 'aura_none',    slot: 'aura', name: 'None',           rarity: 'common',    default: true, preset: null },
  { id: 'aura_blue',    slot: 'aura', name: 'Blue Flame',     rarity: 'rare',      level: 3,      preset: { color: '#2f9bff', kind: 'flame' } },
  { id: 'aura_crimson', slot: 'aura', name: 'Crimson Rage',   rarity: 'epic',                     preset: { color: '#ff2a4a', kind: 'flame' } },
  { id: 'aura_volt',    slot: 'aura', name: 'Lightning',      rarity: 'epic',      level: 8,      preset: { color: '#ffe14a', kind: 'spark' } },
  { id: 'aura_gold',    slot: 'aura', name: 'Golden Ego',     rarity: 'legendary', level: 15,     preset: { color: '#ffb627', kind: 'flame' } },
  { id: 'aura_shadow',  slot: 'aura', name: 'Shadow Veil',    rarity: 'mythic',                   preset: { color: '#8a2be2', kind: 'smoke' } },
  { id: 'aura_prism',   slot: 'aura', name: 'Prism Singularity', rarity: 'secret',                preset: { color: '#ffffff', kind: 'prism' } },
];
export const COSMETIC = Object.fromEntries(COSMETICS.map(c => [c.id, c]));

export const HAIR_COLORS = ['#1a1a22', '#3b2a1f', '#7a2a1a', '#e8382a', '#ffd23a', '#f2f2f2', '#2f7bff', '#1fd6c1', '#9b5cff', '#ff7fb5'];
export const SKIN_TONES = ['#f7dcc8', '#f2c9a5', '#e2ae84', '#c98d62', '#a86b45', '#7a4a2e'];

export const DEFAULT_EQUIPPED = {
  hair: 'hair_messy', face: 'face_focus', torso: 'torso_std', arms: 'arms_none',
  legs: 'legs_socks', clothing: 'kit_bib', aura: 'aura_none',
  hairColor: '#1a1a22', skin: '#f2c9a5',
};
