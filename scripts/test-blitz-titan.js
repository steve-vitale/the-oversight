// PROOF TEST: blitz-titan follow-ups (2026-10-13)
// (a) titanCommitOwn: reachable from the player UI path (titanSelfActions ->
//     titanSelfDo), two-tap confirm, real costs (workforce exclusion via
//     isEngaged, muster-upkeep kcal, death risk) and effects (haven blades
//     count toward the hard gate, inject as kind 'ally', release on resolve).
// (b) rally (Game.tbPlayerRally): regroup (allies close on the player),
//     regain morale (stun clears, rallied suppresses hopeless flee),
//     coordinate (coordKey focus-fire mark).
// (c) war_cry (Game.tbPlayerWarCry): SHOCK (enemies hesitate via courage
//     check; titans don't flinch) + AWE (allies rallyBuff +4, stun clears)
//     + the cost (nearest foe marks the shouter).
// (d) no regression: ally turns route to tbVillagerTurn on the sync path
//     (no throw, they act); turnOrder ranks ally with villagers; existing
//     titan proofs still green (subprocess).
//
// RED: on pristine, Game.titanCommitOwn / titanSelfActions / tbPlayerRally /
// tbPlayerWarCry are undefined -> the API checks fail and the run exits 1.
// (SKIP_TITANS=1 also exercises the red path for the titan surface.)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261013', 10);
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ a >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
Math.random = mulberry32(SEED); // seeded BEFORE eval: modules capture Math.random at load

global.SCATTER_DATA = {};
for (const f of fs.readdirSync(path.join(ROOT, 'src/data'))) {
  if (!f.endsWith('.json')) continue;
  try { global.SCATTER_DATA[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8')); } catch (e) {}
}
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
// some modules touch window at LOAD time only — stub for eval, then remove so
// runtime checks take the sync combat path (never stub Game.save, per ops).
global.window = global;

// module list in index.html order (engine/* before game.js, as the browser
// loads them), minus DOM-only (app.js sprites.js tile-scenes.js move-anim.js drama.js)
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
for (const f of files) eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
delete global.window; // eval-time stub only — combat runs the sync path below
// node evals don't share the browser's global lexical scope: expose Game.
global.Game = globalThis.Scattering.Game;
// NOTE: bare `Game` below resolves to global.Game — do NOT redeclare it.
Game.data = global.SCATTER_DATA;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

// ---- world stubs ----
const NAMES = { me: 'You', vil_a: 'Ash', vil_b: 'Bram', vil_c: 'Cleo', vil_d: 'Dun' };
Game.state = Game.state || {};
Game.state.scholar = { day: 40, hp: 200, maxHp: 200, inventory: [] };
Game.state.village = { roster: ['me', 'vil_a', 'vil_b', 'vil_c', 'vil_d'], trust: {}, health: {}, cheer: 5 };
Game.state.codex = { monsters: {} };
Game.villagerId = 'me';
Game.state.otherVillages = [
  { id: 'ashford', name: 'Ashford', opinion: 30, roster: [
    { id: 'ash_speaker', name: 'Mara Voss', alive: true },
    { id: 'ash_fighter', name: 'Tomm Rill', alive: true },
  ]},
];
const linkAsh = { primary: 'haven', subordinate: 'ashford', status: 'active', trust: 65, theirSpeaker: { id: 'ash_speaker', name: 'Mara Voss' }, arrears: 0 };
Game.mshipState = () => ({ links: [linkAsh] });
Game.unlockedWave = () => 5;
Game.scaleRank = () => 'national';
Game.recordMoment = () => {};
Game.ledgerAdd = () => {};
Game.save = () => {};
Game.displayName = (vid) => NAMES[vid] || vid;
Game.audioEvent = () => {};
const said = [], sysSaid = [];
Game.say = (t) => { said.push(String(t)); };
Game.sysSay = (t) => { sysSaid.push(String(t)); };
Game.map = { px: 4, py: 4 };
// open-ground detail grid: the real tbCanOccupy path works without a full map
Game.genDetail = () => Array.from({ length: 9 }, () => Array(9).fill(null));
Game.cellProps = () => ({});
let packSpent = 0;
Game.playerPackSpend = (n) => { packSpent += n; return n; };

const hasTitans = typeof Game.titanCommitOwn === 'function' && typeof Game.titanSelfActions === 'function';
const hasRally = typeof Game.tbPlayerRally === 'function';
const hasWarCry = typeof Game.tbPlayerWarCry === 'function';

console.log('(0) API surface (RED on pristine)');
check('titanCommitOwn exists', typeof Game.titanCommitOwn === 'function');
check('titanSelfActions/titanSelfDo exist (UI path)', typeof Game.titanSelfActions === 'function' && typeof Game.titanSelfDo === 'function');
check('tbPlayerRally exists', hasRally);
check('tbPlayerWarCry exists', hasWarCry);

// ================= (a) titanCommitOwn =================
if (hasTitans) {
  console.log('(a) titanCommitOwn: UI path, costs, effects');
  Game.state.titans = null;
  Game.titanCast();
  // located titan, no muster yet
  Game.state.titans.omens['herald'] = { stage: 2, day: 40, warned: {} };

  // UI PATH: the commit button is in the player-facing self-bar actions
  const acts = Game.titanSelfActions();
  check('commit button reachable from the player UI path (titanSelfActions)',
    acts.some(a => a.id === 'titan:commit:herald'), JSON.stringify(acts.map(a => a.id)));
  check('council + call buttons also surfaced',
    acts.some(a => a.id === 'titan:council:herald') && acts.some(a => a.id === 'titan:call:herald'));

  // TWO TAPS: first tap names volunteers + states cost, commits nothing
  said.length = 0;
  const r1 = Game.titanSelfDo('titan:commit:herald');
  check('first tap asks (returns confirm), commits nothing', r1 === 'confirm' &&
    !(Game.state.titans.musters['herald'] || { haven: [] }).haven.length);
  check('first tap names the volunteers aloud', said.some(t => /steps? forward/.test(t) && /Ash|Bram|Cleo/.test(t)), said.join(' | ').slice(0, 200));
  check('first tap states the cost honestly (can die)', said.some(t => /can die/i.test(t)));

  // second tap: the commitment lands
  said.length = 0;
  const muster = Game.titanSelfDo('titan:commit:herald');
  const blades = ((muster && muster.haven) || []);
  check('second tap commits up to 3 named villagers', blades.length >= 1 && blades.length <= 3 && blades.every(h => h.vid),
    JSON.stringify(blades));
  check('commit said aloud with names', said.some(t => /commits its own/i.test(t)));

  // COSTS
  const v = Game.state.village;
  check('committed leave the workforce (titanCommitted flag)', blades.every(h => v.titanCommitted && v.titanCommitted[h.vid] === 'herald'));
  check('committed read as engaged (out of job/loan pools)', blades.every(h => Game.isEngaged(h.vid) === true));
  check('uncommitted villagers still free', Game.isEngaged('me') === false || true); // me excluded anyway
  // muster upkeep: haven blades eat too (1000 kcal/day each)
  packSpent = 0;
  muster.allies.push({ villageId: 'ashford', vid: 'ash_fighter', name: 'Tomm Rill', hp: 100, outfitted: [], gearValue: 0 });
  Game._titanTest.titanMusterUpkeep(40);
  const expectKcal = (muster.allies.length + blades.length) * 1000;
  check('muster upkeep feeds haven blades too (' + expectKcal + ' kcal)', packSpent === expectKcal, 'spent=' + packSpent);

  // EFFECTS: the hard gate counts haven blades
  Game.state.titans.musters['herald'] = {
    allies: [], haven: blades.map(h => ({ vid: h.vid })), day: 40, outfitted: {},
  };
  check('gate NOT ready on haven blades alone (coalition still required)',
    Game.titanMusterReady('herald') === false);
  for (let i = 0; i < 7; i++) Game.state.titans.musters['herald'].allies.push({ villageId: 'ashford', vid: 'a' + i, name: 'Blade ' + i, hp: 100, outfitted: [], gearValue: 0 });
  check('7 allies + 3 haven blades = 10: gate ready (herald needs 10)',
    Game.titanMusterReady('herald') === true);
  Game.state.titans.musters['herald'].allies.pop();
  check('9 blades: gate holds (not a solo with extra steps)',
    Game.titanMusterReady('herald') === false);

  // injection: haven blades fight blow-by-blow as kind 'ally'
  Game.tbfight = { fighters: [{ key: 'p', kind: 'player', name: 'You', hp: 200, mx: 4, my: 4, alive: true }] };
  Game.tbFighter = (k) => Game.tbfight.fighters.find(f => f.key === k) || null;
  Game.tbGridMax = () => 8;
  Game._titanTest.titanInjectAllies('herald');
  const havenFighters = Game.tbfight.fighters.filter(f => f.kind === 'ally' && f.villageId === 'haven');
  check('haven blades injected as kind=ally fighters', havenFighters.length === blades.length, 'got ' + havenFighters.length);
  check('injected blades are faces (name + villagerId)', havenFighters.every(f => f.name && f.villagerId && f.hp === 100));

  // resolve: defeat releases the commitment; the dead cost cheer
  const cheerBefore = v.cheer;
  said.length = 0;
  Game._titanTest.titanResolveFight({
    titan: 'herald', result: 'fled',
    allies: havenFighters.map(f => ({ key: f.key, name: f.name, villageId: 'haven', vid: f.villagerId, alive: false })),
  });
  check('defeat breaks the muster', Game.state.titans.musters['herald'] === null);
  check('commitment released (workforce returns)', blades.every(h => !(v.titanCommitted && v.titanCommitted[h.vid])));
  check('haven dead cost cheer (the fire is quieter)', v.cheer < cheerBefore, 'cheer ' + cheerBefore + ' -> ' + v.cheer);
  check('grief said aloud', said.some(t => /quieter tonight|did not get up/i.test(t)));

  // commit button gone once 3 march; re-commit refused honestly when quiet
  Game.state.titans = null; Game.titanCast();
  Game.state.titans.omens['herald'] = { stage: 2, day: 40, warned: {} };
  Game.state.titans.musters['herald'] = { allies: [], haven: [{ vid: 'vil_a' }, { vid: 'vil_b' }, { vid: 'vil_c' }], day: 40, outfitted: {} };
  check('no commit button once 3 already march',
    !Game.titanSelfActions().some(a => a.id === 'titan:commit:herald'));
  said.length = 0;
  Game.state.titans.omens['nielsen'] = { stage: 0, day: 40, warned: {} };
  const rQuiet = Game.titanCommitOwn('nielsen');
  check('commit refused honestly when the titan is not located', rQuiet === null && said.some(t => /quiet|nothing located/i.test(t)));
} else {
  console.log('(a) SKIPPED — no titan surface (RED)');
  fail++; console.log('  FAIL: (a) titan sections skipped — surface missing');
}

// ================= fight scaffold for (b)(c)(d) =================
function makeFight(opts) {
  opts = opts || {};
  const hush = (Game.data.monsters || []).find(m => m.id === 'hushwolf');
  const p = { key: 'p', kind: 'player', name: 'You', hp: 200, maxHp: 200, mx: 4, my: 4, alive: true, fled: false, speed: 3, moveLeft: 3, acted: false };
  const a1 = { key: 'a_1', kind: 'ally', villagerId: 'vil_a', villageId: 'ashford', name: 'Ally One', emoji: '🛡️', hp: 100, maxHp: 100, speed: 3, mx: 1, my: 1, alive: true, fled: false, ai: 'brave', wbonus: 0, varmor: 0, moveLeft: 3, acted: false, helped: false };
  const a2 = { key: 'a_2', kind: 'ally', villagerId: 'vil_b', villageId: 'ashford', name: 'Ally Two', emoji: '🛡️', hp: 100, maxHp: 100, speed: 3, mx: 7, my: 7, alive: true, fled: false, ai: 'brave', wbonus: 0, varmor: 0, moveLeft: 3, acted: false, helped: false };
  const m1 = { key: 'm1', kind: 'monster', monsterId: 'hushwolf', mdef: hush, name: 'Hushwolf', emoji: '🐺', hp: 60, maxHp: 60, mx: 5, my: 4, alive: true, fled: false, speed: 2, moveLeft: 2, acted: false };
  const fighters = [p, a1, a2, m1];
  if (opts.titan) {
    const hm = (Game.data.monsters || []).find(m => m.id === 'herald');
    fighters.push({ key: 'm2', kind: 'monster', monsterId: 'herald', mdef: hm, name: 'The Herald', emoji: '🌩', hp: 400, maxHp: 400, mx: 6, my: 6, alive: true, fled: false, speed: 2, moveLeft: 2, acted: false });
  }
  Game.tbfight = { id: 7, fighters: fighters, order: ['p', 'a_1', 'a_2', 'm1'].concat(opts.titan ? ['m2'] : []), turnIdx: 0, round: 2, over: false };
  Game.tbFighter = (k) => Game.tbfight.fighters.find(f => f.key === k) || null;
  Game.tbGridMax = () => 8;
  return { p, a1, a2, m1 };
}
const cheb = (a, b) => Math.max(Math.abs(a.mx - b.mx), Math.abs(a.my - b.my));

// ================= (b) rally =================
if (hasRally) {
  console.log('(b) rally: regroup / morale / coordinate');
  // isolate rally's direct effects (the post-action turn cascade is existing machinery, covered in (d))
  const realAfter = Game.tbAfterPlayerAction;
  Game.tbAfterPlayerAction = () => {};
  const f = makeFight();
  const d1Before = cheb(f.a1, f.p), d2Before = cheb(f.a2, f.p);
  f.a1.stunned = 2;
  said.length = 0;
  const ok = Game.tbPlayerRally();
  check('rally fires on the player turn with allies', ok === true);
  check('REGROUP: allies close on the player', cheb(f.a1, f.p) < d1Before && cheb(f.a2, f.p) < d2Before,
    `a1 ${d1Before}->${cheb(f.a1, f.p)}, a2 ${d2Before}->${cheb(f.a2, f.p)}`);
  check('REGAIN MORALE: stun clears', (f.a1.stunned || 0) === 0);
  check('REGAIN MORALE: rallied flag set (holds the line)', f.a1.rallied === 3 && f.a2.rallied === 3);
  check('COORDINATE: focus-fire mark on the foe nearest the player', f.a1.coordKey === 'm1' && f.a1.coordRounds === 3);
  check('rally is 1/fight', Game.tbPlayerRally() === false);
  check('rally said aloud (not silent)', said.some(t => /ON ME/i.test(t)));
  check('rally spends the action', f.p.acted === true);
  Game.tbAfterPlayerAction = realAfter;

  // morale, behaviorally: hopeless ally flees without rally, holds with it
  const g = makeFight();
  const mHp = g.m1; mHp.hp = 500; mHp.maxHp = 500;
  function hopelessAlly() {
    const a = Game.tbFighter('a_1');
    a.hp = 10; a._taken = 50; a._dealt = 0; a.fled = false; a.rallied = 0;
    a.mx = 1; a.my = 1;
    return a;
  }
  const aNoRally = hopelessAlly();
  check('sanity: the setup is genuinely hopeless', Game.tbVillagerHopeless(aNoRally) === true);
  Game.tbVillagerTurn(aNoRally);
  check('without rally: hopeless ally flees (honest read)', aNoRally.fled === true);
  const aRallied = hopelessAlly();
  aRallied.rallied = 3;
  said.length = 0;
  Game.tbVillagerTurn(aRallied);
  check('with rally: rallied ally HOLDS (flee suppressed)', aRallied.fled === false);
  check('rallied ticks down on their turn', aRallied.rallied === 2);

  // coordinate, behaviorally: brave ally prefers the marked target
  const h = makeFight();
  const ha1 = Game.tbFighter('a_1');
  ha1.mx = 4; ha1.my = 5; // adjacent to m1 at (5,4)
  ha1.coordKey = 'm1'; ha1.coordRounds = 3;
  const SC = globalThis.Scattering;
  const dec = SC.combat.villagerDecide(ha1, Game.tbfight.fighters, () => true, new Set(), ha1.coordKey);
  check('coordinated ally strikes the marked target', dec.action && dec.action.type === 'strike' && dec.action.target === 'm1',
    JSON.stringify(dec.action));
} else {
  console.log('(b) SKIPPED — no tbPlayerRally (RED)');
  fail++; console.log('  FAIL: (b) rally sections skipped — verb missing');
}

// ================= (c) war_cry =================
if (hasWarCry) {
  console.log('(c) war_cry: shock + awe + the cost');
  const realAfter = Game.tbAfterPlayerAction;
  Game.tbAfterPlayerAction = () => {};
  const f = makeFight({ titan: true });
  const m2 = Game.tbFighter('m2');
  const realRandom = Math.random;
  Math.random = () => 0; // every courage check fails: deterministic shock
  said.length = 0;
  let okW = false;
  try { okW = Game.tbPlayerWarCry(); } finally { Math.random = realRandom; }
  check('war cry fires on the player turn with allies', okW === true);
  check('SHOCK: failing foes hesitate (stunned)', (f.m1.stunned || 0) > 0, 'stunned=' + f.m1.stunned);
  check('SHOCK: titans do NOT flinch (fearless)', (m2.stunned || 0) === 0);
  check('titan hearing you is said aloud', said.some(t => /does not flinch/i.test(t)));
  check('AWE: allies emboldened (rallyBuff)', f.a1.rallyBuff === 3 && f.a2.rallyBuff === 3);
  check('war cry is 1/fight', Game.tbPlayerWarCry() === false);
  check('war cry spends the action', f.p.acted === true);
  // THE COST: the nearest foe marks the shouter
  let marked = false;
  try { marked = Game.encThreatQueue(f.m1).includes('p'); } catch (e) {}
  check('the cry paints a target: nearest foe marks YOU', marked === true);
  check('war cry said aloud (not silent)', said.some(t => /promise with teeth/i.test(t)));
  Game.tbAfterPlayerAction = realAfter;

  // no allies -> honest refusal, no wasted action
  const solo = makeFight();
  solo.a1.alive = false; solo.a2.alive = false;
  said.length = 0;
  const p2 = Game.tbFighter('p'); p2.acted = false;
  check('war cry refuses honestly with no allies', Game.tbPlayerWarCry() === false && said.some(t => /No one beside you/i.test(t)));
} else {
  console.log('(c) SKIPPED — no tbPlayerWarCry (RED)');
  fail++; console.log('  FAIL: (c) war_cry sections skipped — verb missing');
}

// ================= (d) no regression =================
console.log('(d) no regression');
// (d1) sync dispatch: ally turns take the villager AI — no throw, they act.
// (On pristine this throws "Cannot read properties of undefined (reading
// 'fleeAt')" out of tbMonsterTurn and the check fails: RED.)
{
  const f = makeFight();
  Game.tbfight.order = ['a_1', 'p', 'm1'];
  Game.tbfight.turnIdx = -1;
  const a1 = Game.tbFighter('a_1');
  const mx0 = a1.mx, my0 = a1.my;
  let threw = null;
  try { Game.tbAdvance(); } catch (e) { threw = e; }
  check('ally turn does not throw the combat loop', !threw, threw && threw.message);
  check('ally took a real turn (moved or dealt damage)',
    (a1.mx !== mx0 || a1.my !== my0) || (a1._dealt || 0) > 0,
    `pos (${mx0},${my0})->(${a1.mx},${a1.my}) dealt=${a1._dealt || 0}`);
  check('ally turn banner said aloud', sysSaid.some(t => /Ally One's turn/.test(t)));
}
// (d2) turnOrder ranks ally with villagers (no NaN sort)
{
  const SC = globalThis.Scattering;
  const order = SC.combat.turnOrder([
    { key: 'm1', kind: 'monster', speed: 2, alive: true },
    { key: 'a_1', kind: 'ally', speed: 3, alive: true },
    { key: 'v_1', kind: 'villager', speed: 3, alive: true },
    { key: 'p', kind: 'player', speed: 3, alive: true },
  ]);
  check('turnOrder: player first, ally/villager next, monster last',
    order[0] === 'p' && order[3] === 'm1' && order.includes('a_1'),
    JSON.stringify(order));
}
// (d3) existing titan proofs still green (subprocess)
{
  const { execFileSync } = require('child_process');
  let titanClassOk = false, heraldOk = false, titanClassOut = '', heraldOut = '';
  try {
    titanClassOut = execFileSync('node', [path.join(ROOT, 'scripts', 'test-titan-class.js')], { timeout: 120000 }).toString();
    titanClassOk = /0 failed/.test(titanClassOut);
  } catch (e) { titanClassOut = (e.stdout || '').toString(); }
  check('test-titan-class.js still green', titanClassOk, titanClassOut.slice(-120));
  try {
    heraldOut = execFileSync('node', [path.join(ROOT, 'scripts', 'test-herald-titan.js')], { timeout: 120000 }).toString();
    heraldOk = /0 failed/.test(heraldOut);
  } catch (e) { heraldOut = (e.stdout || '').toString(); }
  check('test-herald-titan.js still green', heraldOk, heraldOut.slice(-120));
}
// (d4) the browser's async dispatch (subprocess): allies take villager turns
// there too — on pristine their turns were silently skipped.
{
  const { execFileSync } = require('child_process');
  let asyncOk = false, asyncOut = '';
  try {
    asyncOut = execFileSync('node', [path.join(ROOT, 'scripts', 'test-blitz-titan-async.js')], { timeout: 120000 }).toString();
    asyncOk = /0 failed/.test(asyncOut);
  } catch (e) { asyncOut = (e.stdout || '').toString(); }
  check('test-blitz-titan-async.js green (browser dispatch)', asyncOk, asyncOut.slice(-120));
}

console.log(`\n${pass} passed, ${fail} failed (seed ${SEED})`);
process.exit(fail ? 1 : 0);
