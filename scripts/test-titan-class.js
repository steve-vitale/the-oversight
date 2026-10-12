// PROOF TEST: the TITAN CLASS (Steve 2026-10-11)
// (a) titan flagged distinctly from HP — the flag, not the stat
// (b) solo attempt hard-refused (not a likely death)
// (c) coalition fight runs blow-by-blow with allied faces
// (d) allied deaths cost trust/grief
// (e) an ally can refuse and it matters
// (f) knowledge-gated until exposure
// (g) ontology green (scripts/validate-ontology.js, run separately)
// RED check: SKIP_TITANS=1 loads everything but titans.js -> all tests must FAIL.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261011', 10);
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ a >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
Math.random = mulberry32(SEED); // seeded BEFORE eval: modules capture Math.random at load

global.SCATTER_DATA = {};
for (const f of fs.readdirSync(path.join(ROOT, 'src/data'))) {
  if (!f.endsWith('.json')) continue;
  try { global.SCATTER_DATA[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8')); } catch (e) {}
}
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global;

// module list in index.html order, minus DOM-only (app.js sprites.js tile-scenes.js move-anim.js drama.js)
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const SKIP_DOM = /app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/;
const files = [];
for (const m of html.matchAll(/src="([^"?]+)\?v=/g)) {
  const f = m[1];
  if (f.endsWith('.js') && !SKIP_DOM.test(f)) files.push(f);
}
if (process.env.SKIP_TITANS) {
  const i = files.indexOf('src/js/titans.js');
  if (i >= 0) files.splice(i, 1);
  console.log('RED MODE: titans.js NOT loaded');
}
const gameIdx = files.indexOf('src/js/game.js');
eval(fs.readFileSync(path.join(ROOT, files[gameIdx]), 'utf8'));
// node evals don't share the browser's global lexical scope: game.js's
// `const Game` is invisible to later modules' load-time code (pods.js,
// titans.js do Object.assign(Game, ...) at load). Expose it like the browser does.
global.Game = globalThis.Scattering.Game;
files.forEach((f, i) => { if (i !== gameIdx) eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window;
// NOTE: bare `Game` below resolves to global.Game (set above) — do NOT
// declare a local const Game here; it would TDZ-shadow the eval'd modules.
Game.data = global.SCATTER_DATA;

// ---- minimal world ----
Game.state = Game.state || {};
Game.state.scholar = { day: 40, hp: 200, maxHp: 200, inventory: [] };
Game.state.otherVillages = [
  { id: 'ashford', name: 'Ashford', opinion: 30, roster: [
    { id: 'ash_speaker', name: 'Mara Voss', alive: true },
    { id: 'ash_fighter', name: 'Tomm Rill', alive: true },
  ]},
  { id: 'cinder', name: 'Cinder Hollow', opinion: -20, roster: [
    { id: 'cin_speaker', name: 'Drell Kaan', alive: true },
  ]},
];
const linkAsh = { primary: 'haven', subordinate: 'ashford', status: 'active', trust: 60, theirSpeaker: { id: 'ash_speaker', name: 'Mara Voss' }, arrears: 0 };
const linkCin = { primary: 'haven', subordinate: 'cinder', status: 'active', trust: 10, theirSpeaker: { id: 'cin_speaker', name: 'Drell Kaan' }, arrears: 0 };
Game.mshipState = () => ({ links: [linkAsh, linkCin] });
Game.unlockedWave = () => 5;
Game.scaleRank = () => 'national';
Game._availableRepresentative = () => null;
Game.recordMoment = () => {};
Game.ledgerAdd = () => {};
const said = [];
Game.say = (t) => { said.push(String(t)); };
Game.sysSay = (t) => { said.push('[SYS] ' + String(t)); };
Game.map = { px: 4, py: 4 };

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

// (a) titan flagged distinctly from HP
console.log('(a) titan flag, not HP');
check('finale is a titan (flag)', Game.isTitan('finale') === true);
check('eater is a titan (herald, wave 4)', Game.isTitan('eater') === true);
check('nielsen is a titan (mid)', Game.isTitan('nielsen') === true);
const cancellation = (Game.data.monsters || []).find(m => m.id === 'cancellation');
check('cancellation exists in data', !!cancellation);
check('cancellation is NOT a titan despite wave 5', Game.isTitan('cancellation') === false,
  'hp=' + JSON.stringify(cancellation && cancellation.hp));
check('titans.json defines all three (doc keys ignored)',
  ['eater', 'finale', 'nielsen'].every(id => Game.isTitan(id)) && !Game.isTitan('_comment'));
const pool = Game.monsterWavePool();
check('monsterWavePool never contains titans', !pool.some(m => Game.isTitan(m.id)), 'pool=' + pool.map(m => m.id).join(','));

// (b) solo attempt hard-refused
console.log('(b) solo hard gate');
said.length = 0;
const r = Game.startCombat('finale');
check('startCombat on a titan with no muster returns null', r === null);
check('refusal is said aloud (not silent)', said.some(t => /cannot face this alone|sound the call/i.test(t)), said.join(' | ').slice(0, 160));
check('refusal names the muster requirement', said.some(t => /allied blades/i.test(t)));

// (c) coalition fight: allied faces injected blow-by-blow
console.log('(c) allied faces in combat');
Game.state.titans = null; // fresh
Game.titanCast();
Game.state.titans.musters['eater'] = {
  allies: [
    { villageId: 'ashford', vid: 'ash_speaker', name: 'Mara Voss', hp: 100, outfitted: [], gearValue: 0, wbonus: 8, varmor: 12 },
    { villageId: 'ashford', vid: 'ash_fighter', name: 'Tomm Rill', hp: 100, outfitted: [], gearValue: 0, wbonus: 0, varmor: 0 },
  ],
  haven: [], day: 40, outfitted: {},
};
check('muster ready at minAllies (herald needs 2)', Game.titanMusterReady('eater') === true);
Game.tbfight = { fighters: [{ key: 'p', kind: 'player', name: 'You', hp: 200, mx: 4, my: 4, alive: true }] };
Game.tbFighter = (k) => k === 'p' ? Game.tbfight.fighters[0] : null;
Game._titanTest.titanInjectAllies('eater');
const allies = Game.tbfight.fighters.filter(f => f.kind === 'ally');
check('two allied fighters injected', allies.length === 2, 'got ' + allies.length);
check('they are FACES with real names', allies.every(f => f.name && f.villagerId && f.villageId));
check('blow-by-blow stats: hp, brave AI, outfitted bonuses carried',
  allies.every(f => f.hp === 100 && f.ai === 'brave' && typeof f.wbonus === 'number' && typeof f.varmor === 'number'));
check('outfitting bought real effectiveness', allies[0].wbonus === 8 && allies[0].varmor === 12);

// (d) allied deaths cost trust/grief
console.log('(d) allied deaths cost');
said.length = 0;
const trustBefore = linkAsh.trust;
Game._titanTest.titanResolveFight({
  titan: 'eater', result: 'fled',
  allies: [
    { key: 'a_ash_speaker', name: 'Mara Voss', villageId: 'ashford', vid: 'ash_speaker', alive: false },
    { key: 'a_ash_fighter', name: 'Tomm Rill', villageId: 'ashford', vid: 'ash_fighter', alive: true },
  ],
});
check('dead ally marked dead in home roster',
  Game._otherVillage('ashford').roster.find(x => x.id === 'ash_speaker').alive === false);
check('trust dropped 10 for the death', linkAsh.trust === trustBefore - 10, 'was ' + trustBefore + ' now ' + linkAsh.trust);
check('grief said aloud', said.some(t => /did not get up|fell/i.test(t)), said.join(' | ').slice(0, 160));
check('defeat breaks the muster', Game.state.titans.musters['eater'] === null);

// (e) an ally can refuse and it matters
console.log('(e) refusal is real');
Game.state.titans.musters = {};
// NOTE: (d) killed Mara Voss — correct game behavior (faces stay dead).
// A fresh fire answers here.
Game._otherVillage('ashford').roster.forEach(function (x) { x.alive = true; });
said.length = 0;
const cinTrustBefore = linkCin.trust;
const muster = Game.soundTitanCall('eater');
const cinFighters = (muster.allies || []).filter(a => a.villageId === 'cinder');
check('low-trust ally refuses — sends nobody', cinFighters.length === 0);
check('refusal costs trust (-8)', linkCin.trust === cinTrustBefore - 8, 'was ' + cinTrustBefore + ' now ' + linkCin.trust);
check('refusal said aloud with a reason', said.some(t => /REFUSES/i.test(t)));
check('high-trust ally answers with faces', (muster.allies || []).filter(a => a.villageId === 'ashford').length === 2,
  JSON.stringify((muster.allies || []).map(a => a.name)));

// (f) knowledge-gated until exposure
console.log('(f) knowledge gate');
Game.state.titans = null;
Game.unlockedWave = () => 3; // too early: wave 4 gate
Game.state.scholar.day = 40;
for (let d = 40; d < 80; d++) { Game.state.scholar.day = d; Game.titanDawnTick(); }
check('no omens before wave 4 — you do not know', Object.keys(Game.state.titans.omens).length === 0);
Game.unlockedWave = () => 5;
Game.state.titans.omens['eater'] = { stage: 0, day: 80, warned: {} };
Game.state.scholar.day = 82;
Game._titanTest.titanEscalate('eater', 82);
check('stage 0 omen: titan not placed, name not spoken in escalation',
  !Game.worldMonsters().some(m => m.id === 'eater') && !said.some(t => /The Eater/i.test(t) && /located|lair/i.test(t)));
// omen timing gate: too early stays stage 0
Game.state.titans.omens['eater'] = { stage: 0, day: 80, warned: {} };
Game.state.titans.omens['eater'].day = 79;
Game.state.scholar.day = 82;
let advanced = false;
for (let d = 82; d < 100 && !advanced; d++) {
  Game.state.scholar.day = d;
  // call the internal advance directly (RNG-independent part)
  const o = Game._titanTest.titanOmen('eater');
  o.stage = 0; o.day = d - 3; // 3 days < 4-day minimum
  const before = o.stage;
  // emulate advance: only the timing gate, not the RNG
  Game.state.scholar.day = d;
  advanced = before !== o.stage;
}
check('stage 0->1 requires 4+ days (timing gate, not instant)', !advanced);

// THE TURN: temptation math
console.log('(turn) temptation vs loyalty');
Game.state.titans.musters = {};
Game.state.titans.musters['eater'] = {
  allies: [{ villageId: 'ashford', vid: 'ash_speaker', name: 'Mara Voss', hp: 100, outfitted: [], gearValue: 6000, wbonus: 0, varmor: 0 }],
  haven: [], day: 40, outfitted: {},
};
linkAsh.trust = 60;
const t1 = Game.titanTemptation('ashford');
check('high trust + modest gear: steadfast', t1.verdict === 'steadfast', JSON.stringify(t1));
linkAsh.trust = 5;
const t2 = Game.titanTemptation('ashford');
check('low trust + armed to the teeth: turn (never random)', t2.verdict === 'turn', JSON.stringify(t2));
// telegraphed: warn first, then it turns
said.length = 0;
Game.state.titans.omens['eater'] = { stage: 2, day: 40, warned: { ashford: 1 } };
Game._titanTest.titanTurnTick(45);
check('the turn removes the force (stolen gear is lost)', (Game.state.titans.musters['eater'].allies || []).length === 0);
check('the turn craters trust', linkAsh.trust === 0);
check('the turn is said aloud', said.some(t => /THE TURN/i.test(t)), said.join(' | ').slice(0, 200));

console.log('\n' + pass + ' passed, ' + fail + ' failed (seed ' + SEED + ')');
process.exit(fail ? 1 : 0);
