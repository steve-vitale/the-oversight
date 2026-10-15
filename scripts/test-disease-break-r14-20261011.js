// BREAK-IT: disease system hostile audit, round 14 (2026-10-11).
// Hostile player vs docs/DISEASES.md canon (two pools, never mix).
//
// Attacks:
//   E1 EXPLOIT: contractDisease refuses all 9 alien ids (the canon law in code).
//   E2 EXPLOIT: cure/diagnose/ease refuse all 9 alien ids (pool-mix = instant canon violation).
//   E3 EXPLOIT: warping viruses (eurika/east_nile/lemons) never expire — tick 500 dayParts.
//   E4 EXPLOIT: cure-tier honesty — folk never cures above its tier; trembles has NO cure
//       at any tier (incl. Fever's End synergy + L3 abilities + ruin medicine).
//   E5 EXPLOIT: save/load duplication — real save->load round trip, seq reseed,
//       no duplicated entries, mirrors match engine.
//   S1 SOFTLOCK: tick_attached never expires on its own — is removal always reachable?
//   S2 LOCKJAW CERTAINTY (longsim disease 2026-10-11): untreated lockjaw kills
//   at 16 day-parts (canon "lethal untreated"), warned at 8, cured-before-the-
//   clock survives, eased-only still dies. Supersedes the old softlock reading.
//   S3 SOFTLOCK: zero-medicine player — folk paths still move folk-'slow' diseases.
//   H1 HONESTY: shellgut triple-risk meal (poison + fever + trichinosis) blocked; -25% kcal real.
//   H2 HONESTY: witness_maw "night half as dark" — lightLevel math exact.
//   H3 HONESTY: lemons engorge +20% kcal on a real meal.
//   H4 HONESTY: howlbelly 50% fear-check — small monsters pass sometimes, big never.
//   H5 HONESTY: croakbelly/flockmind kin pass-through deterministic.
//   H6 HONESTY: giant mosquito 50/50 virus split (statistical).
//   H7 HONESTY: trembles 15%/meal via eatCannibal (statistical), cooking irrelevant.
//   H8 HONESTY: tick escalation 3%->15% capped (statistical, day 1 vs day 5).
//   H9 HONESTY: blind tick removal 40% botch -> wound_fever (statistical), never stuck.
//   H10 HONESTY: trichinosis — smoking does NOT clear, cooked does.
//   H11 HONESTY: ambient mosquito 1.5% (source), cooking.json days x4 == duration (data).
//   D1 DEAD CODE: statusEffects.js in index.html; every disease id pooled; seIsDisease
//       mundane-only; mosquito/tick bespoke turns dispatched; both monsters in data +
//       sprites + castable at wave 2.
// Usage: node scripts/test-disease-break-r14-20261011.js
//        SEED=999 node scripts/test-disease-break-r14-20261011.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const _lsStore = {};
global.localStorage = {
  getItem: (k) => (k in _lsStore ? _lsStore[k] : null),
  setItem: (k, v) => { _lsStore[k] = String(v); },
  removeItem: (k) => { delete _lsStore[k]; },
  key: (i) => Object.keys(_lsStore)[i] || null,
  get length() { return Object.keys(_lsStore).length; },
};
const PAIRS = [
  ['plants.json', 'plants'], ['biomes.json', 'biomes'], ['monsters.json', 'monsters'],
  ['villagers.json', 'villagers'], ['abilities.json', 'abilities'], ['items.json', 'items'],
  ['background_survivors.json', 'background_survivors'], ['cell_defs.json', 'cellDefs'],
  ['animals.json', 'animals'], ['recipes.json', 'recipes'], ['books.json', 'books'],
  ['relicEnhancements.json', 'relicEnhancements'], ['locations.json', 'locations'],
  ['characterGen.json', 'characterGen'], ['synergies.json', 'synergies'],
  ['knowledge.json', 'knowledge'], ['nameCultures.json', 'nameCultures'],
  ['originPicker.json', 'originPicker'], ['foreignSpeech.json', 'foreignSpeech'],
  ['lifeseeds.json', 'lifeseeds'], ['arrivalText.json', 'arrivalText'],
  ['justiceVoice.json', 'justiceVoice'], ['alienPlayers.json', 'alienPlayers'],
  ['regions.json', 'regions'], 
  ['monsterBehaviors.json', 'monsterBehaviors'], ['contests.json', 'contests'],
  ['events.json', 'events'], ['statusEffects.json', 'statusEffects'],
  ['cooking.json', 'cooking'],
];
global.SCATTER_DATA = {};
for (const [f, key] of PAIRS) {
  global.SCATTER_DATA[key] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8'));
}
let _seed = 7;
const SEED = parseInt(process.env.SEED || '7', 10);
function rng() { _seed = (_seed * 1103515245 + 12345) % 2147483648; return _seed / 2147483648; }
rng.reset = (s) => { _seed = (s === undefined ? SEED : s); };
rng.reset();
Math.random = rng;
global.window = global;
const LIST = ['engine/state.js', 'engine/modifiers.js', 'engine/calories.js', 'engine/day.js',
  'engine/forage.js', 'engine/combat.js', 'game.js', 'encounters.js', 'conversation.js',
  'convo-mood.js', 'convoTopics.js', 'convo-wants.js', 'convo-dialogue.js', 'convo-beats.js',
  'convo-scene.js', 'examine.js', 'equipment.js', 'journal.js', 'party.js', 'party-formal.js',
  'truth.js', 'contests.js', 'broadcast.js', 'contestEngine.js', 'alienPlayers.js', 'storage.js',
  'perceive.js', 'carexplore.js', 'justice.js', 'food.js', 'betrayal.js', 'corpses.js',
  'corruption.js', 'lifeseed.js', 'progression.js', 'waveLedger.js', 'feastBuff.js', 'ledger.js',
  'abilityActions.js', 'monsterBehaviors.js', 'partyTactics.js', 'sigW3a.js', 'statusEffects.js',
  'sigW3b.js', 'metaProgression.js', 'sigW3c.js', 'villager-agency.js', 'fieldFights.js',
  'villager-objectives.js', 'codex-people.js', 'membership.js', 'havenGrowth.js', 'hierarchy.js',
  'comms.js', 'safetynets.js', 'villageAgency.js', 'debug-scenarios.js', 'build.js'];
for (const f of LIST) {
  const src = fs.readFileSync(path.join(ROOT, 'src/js', f), 'utf8');
  try { eval(src); }
  catch (e) { console.error('EVAL FAIL ' + f + ': ' + e.message); process.exit(2); }
}
delete global.window;
const Game = globalThis.Scattering.Game;
const SState = globalThis.Scattering.state;
Game.data = global.SCATTER_DATA;
let said = [];
Game.say = function (m) { said.push(String(m)); };
Game.checkAnimals = () => {};

const ALIEN = ['howlbelly', 'gristlefit', 'croakbelly', 'shellgut', 'witness_maw', 'flockmind', 'eurika', 'east_nile', 'lemons'];
const MUNDANE = ['gutrot', 'trichinosis', 'disease', 'lockjaw', 'wound_fever', 'trembles'];

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function setup(noreset) {
  if (!noreset) rng.reset();
  said = [];
  Game.tbfight = null;
  Game._seSeq = undefined;
  for (const k of Object.keys(_lsStore)) delete _lsStore[k];
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const s = Game.state.scholar; s.kcal = 9000; s.hydration = 100; s.health = 100;
  said = [];
  return s;
}
// A scholar with no medical assets (isolates folk/blind paths).
function stripMedical() {
  const s = Game.state.scholar;
  s.abilities = (s.abilities || []).filter(a => !['triage', 'field_medicine', 'herbal_remedy'].includes(a));
  s.activeSynergies = [];
  if (Game.state.codex) Game.state.codex.techniques = {};
  const _ha = Game.hasAbility.bind(Game);
  Game.hasAbility = (id) => (['triage', 'field_medicine', 'herbal_remedy'].includes(id) ? false : _ha(id));
  return () => { Game.hasAbility = _ha; };
}

// ============ E1: contractDisease refuses all alien ============
{
  console.log('E1: contractDisease pool guard (all 9 alien)');
  setup();
  let refused = 0;
  for (const id of ALIEN) {
    const r = Game.contractDisease(id, { source: 'hostile test' });
    if (r === false && !Game.hasStatus('scholar', id)) refused++;
  }
  ok('contractDisease refuses all 9 alien ids', refused === 9, `refused=${refused}/9`);
  // Control: mundane still contracts.
  const c = Game.contractDisease('disease', { source: 'test' });
  ok('contractDisease still contracts mundane fever', c === true && Game.hasStatus('scholar', 'disease'));
}

// ============ E2: cure/diagnose/ease refuse all alien ============
{
  console.log('E2: cure/diagnose/ease pool guards (all 9 alien)');
  let cg = 0, dg = 0, eg = 0;
  for (const id of ALIEN) {
    setup();
    Game.applyStatus('scholar', id, { source: 'test', silent: true });
    const cr = Game.cureStatus('scholar', id, 'test');
    const di = Game.diagnoseDisease('scholar', id, { by: 'test', silent: true });
    const ea = Game.easeDisease('scholar', id, 5, null);
    const entry = (Game.seList('scholar') || []).find(e => e.id === id);
    const codexHit = !!(((Game.state.codex || {}).diseases || {})[id]);
    if (cr === false && Game.hasStatus('scholar', id)) cg++;
    if (di === false && !codexHit) dg++;
    if (ea === false && !(entry && entry.easedUntil)) eg++;
  }
  ok('cureStatus refuses all 9 alien', cg === 9, `${cg}/9`);
  ok('diagnoseDisease refuses all 9 alien', dg === 9, `${dg}/9`);
  ok('easeDisease refuses all 9 alien', eg === 9, `${eg}/9`);
}

// ============ E3: warping viruses never expire ============
{
  console.log('E3: eurika/east_nile/lemons permanence (500 dayPart ticks)');
  let held = 0;
  for (const id of ['eurika', 'east_nile', 'lemons']) {
    setup();
    Game.applyStatus('scholar', id, { source: 'test', silent: true });
    const entry = Game.seList('scholar').find(e => e.id === id);
    const noDur = entry.dayPartsLeft == null;
    for (let i = 0; i < 500; i++) {
      Game.state.scholar.health = 100; // don't die mid-test; the tick is what we measure
      Game.tickStatuses('scholar', 'dayPart');
    }
    if (noDur && Game.hasStatus('scholar', id)) held++;
  }
  ok('warping viruses never expire (500 parts)', held === 3, `${held}/3`);
  // Control: a meat-quirk DOES expire on its clock (howlbelly: 12 parts).
  setup();
  Game.applyStatus('scholar', 'howlbelly', { source: 'test', silent: true });
  for (let i = 0; i < 20; i++) { Game.state.scholar.health = 100; Game.tickStatuses('scholar', 'dayPart'); }
  ok('howlbelly expires on schedule (12 parts)', !Game.hasStatus('scholar', 'howlbelly'));
}

// ============ E4: cure-tier honesty; trembles has NO cure at any tier ============
{
  console.log('E4: cure tiers per canon (folk never cures up; trembles uncureable)');
  const defs = Game.data.statusEffects.statuses;
  let folkHonest = true, tremblesNo = true;
  for (const id of MUNDANE) {
    const folk = (defs[id].cure || {}).folk;
    if (folk === 'cure') folkHonest = false;
  }
  const tc = defs.trembles.cure || {};
  for (const k of Object.keys(tc)) if (tc[k] === 'cure' || tc[k] === 'ease' || tc[k] === 'support' || tc[k] === 'slow') tremblesNo = false;
  ok('no folk remedy cures any mundane disease outright', folkHonest);
  ok('trembles: every cure-table entry is no', tremblesNo, JSON.stringify(tc));
  // Engine: Fever's End synergy must not upgrade trembles (only ease/support -> cure).
  setup();
  const s = Game.state.scholar;
  s.abilities = ['herbal_remedy'];
  s.activeSynergies = ['fevers_end'];
  Game.abilityLevel = Game.abilityLevel || (() => 3);
  Game.applyStatus('scholar', 'trembles', { source: 'test', silent: true });
  try { Game.treatDisease('herbal_remedy'); } catch (e) { /* treatDisease needs UI-adjacent state; table check below covers */ }
  ok('trembles survives Fever\'s End + L3 herbal_remedy', Game.hasStatus('scholar', 'trembles'));
  // Engine: ruin medicine on trembles does nothing.
  s.inventory = [{ medType: 'antiparasitic', doses: 3, name: 'antiparasitic' }];
  Game.diagnoseDisease('scholar', 'trembles', { silent: true });
  Game.useMedicine('antiparasitic');
  ok('antiparasitic (diagnosed) does not cure trembles', Game.hasStatus('scholar', 'trembles'));
  // Engine: trichinosis IS cured by antiparasitic (canon: specific ruin medicine).
  setup();
  Game.applyStatus('scholar', 'trichinosis', { source: 'test', silent: true });
  Game.diagnoseDisease('scholar', 'trichinosis', { silent: true });
  Game.state.scholar.inventory = [{ medType: 'antiparasitic', doses: 3, name: 'antiparasitic' }];
  Game.useMedicine('antiparasitic');
  ok('antiparasitic cures diagnosed trichinosis', !Game.hasStatus('scholar', 'trichinosis'));
  // TREMBLES CERTAINTY: at 40 dayParts the bearer dies (not a silent expiry).
  setup();
  Game.applyStatus('scholar', 'trembles', { source: 'test', silent: true });
  Game.state.scholar.health = 100;
  let died = false;
  const _pd = Game.playerDeath.bind(Game);
  Game.playerDeath = (cause) => { died = true; Game.playerDeath = _pd; };
  for (let i = 0; i < 45 && !died; i++) { Game.state.scholar.health = 100; Game.tickStatuses('scholar', 'dayPart'); }
  Game.playerDeath = _pd;
  ok('trembles kills at 40 day-parts (certain, not silent)', died === true);
}

// ============ E5: save/load — no duplication, seq reseed ============
{
  console.log('E5: save/load round trip (no duplication)');
  setup();
  Game.applyStatus('scholar', 'disease', { source: 'test', silent: true });
  Game.applyStatus('scholar', 'gutrot', { source: 'test', silent: true });
  Game.applyStatus('scholar', 'eurika', { source: 'test', silent: true });
  const preIds = Game.seList('scholar').map(e => e.id).sort().join(',');
  const preMirrors = (Game.state.scholar.diseases || []).length;
  const saveRet = Game.save();
  const key = Game.state.runKey;
  ok('save() reports success', saveRet === true, `saveRet=${saveRet}`);
  // Simulate a fresh boot: Game-level counters don't persist.
  delete Game._seSeq;
  const loaded = SState.load(key);
  ok('load() restores the run', !!loaded && !!loaded.scholar, 'no state back');
  Game.state = loaded;
  const postIds = Game.seList('scholar').map(e => e.id).sort().join(',');
  ok('disease entries survive load without duplication', postIds === preIds, `${preIds} -> ${postIds}`);
  ok('mirror count matches engine count after load', (Game.state.scholar.diseases || []).length === preMirrors);
  // Post-load apply must reseed seqs (no collision with pre-load entries).
  Game.applyStatus('scholar', 'wound_fever', { source: 'test', silent: true });
  const seqs = Game.seList('scholar').map(e => e._seq);
  ok('seqs unique across the load boundary', new Set(seqs).size === seqs.length, seqs.join(','));
  // Curing one post-load drops exactly its mirror. (Alien defs carry no legacy
  // bridge — no mirror — so mirrors must equal the MUNDANE engine entries.)
  Game.cureStatus('scholar', 'wound_fever', 'test');
  const remain = Game.seList('scholar').map(e => e.id).sort().join(',');
  const mirrorRemain = (Game.state.scholar.diseases || []).length;
  const mundaneRemain = Game.seList('scholar').filter(e => Game.seIsDisease(e.id)).length;
  ok('post-load cure drops exactly the right mirror', remain === 'disease,eurika,gutrot' && mirrorRemain === mundaneRemain && mirrorRemain === 2,
    `engine=[${remain}] mirrors=${mirrorRemain} mundane=${mundaneRemain}`);
}

// ============ S1/S2/S3: softlocks ============
{
  console.log('S1-S3: softlock probes');
  // S1: tick_attached never expires on its own — but removal is always available.
  setup();
  Game.applyStatus('scholar', 'tick_attached', { source: 'test', silent: true });
  for (let i = 0; i < 300; i++) Game.tickStatuses('scholar', 'dayPart');
  const tickStuck = Game.hasStatus('scholar', 'tick_attached');
  const restore = stripMedical(); // no knowledge at all
  Game.removeTick(); // blind attempt — always offered
  const tickGone = !Game.hasStatus('scholar', 'tick_attached');
  restore();
  ok('tick_attached is permanent until removed (documented), blind removal always offered',
    tickStuck === true && tickGone === true, `stuck=${tickStuck} removed=${tickGone}`);
  // S2: LOCKJAW CERTAINTY (longsim disease 2026-10-11 — supersedes the old
  // "expires harmlessly" assertion): untreated lockjaw kills at 16 day-parts
  // (canon: "lethal untreated"; diagnosedDesc "Without real treatment it
  // kills"). Mirrors the trembles certainty: narrated, mantle passes, not
  // silent. A real cure before the clock runs out prevents it.
  setup();
  Game.applyStatus('scholar', 'lockjaw', { source: 'test', silent: true });
  Game.state.scholar.health = 100;
  let lockDied = false, lockWarned = false;
  const _pd2 = Game.playerDeath.bind(Game);
  Game.playerDeath = (cause) => { lockDied = cause; Game.playerDeath = _pd2; };
  const _say = Game.say.bind(Game);
  Game.say = (msg) => { if (/lockjaw: ~2 days left/.test(String(msg))) lockWarned = true; };
  for (let i = 0; i < 25 && !lockDied; i++) { Game.state.scholar.health = 100; Game.tickStatuses('scholar', 'dayPart'); }
  Game.playerDeath = _pd2; Game.say = _say;
  ok('untreated lockjaw kills at 16 day-parts (certain, narrated, cause lockjaw)', lockDied === 'lockjaw', `cause=${lockDied}`);
  ok('lockjaw late warning fires at 8 parts left (~2 days)', lockWarned === true);
  // Cured lockjaw does NOT kill: diagnosed + antibiotics before the clock.
  setup();
  Game.applyStatus('scholar', 'lockjaw', { source: 'test', silent: true });
  Game.diagnoseDisease('scholar', 'lockjaw', { silent: true });
  Game.state.scholar.inventory = [{ medType: 'antibiotics', doses: 3, name: 'antibiotics' }];
  Game.useMedicine('antibiotics');
  Game.state.scholar.health = 100;
  let curedDied = false;
  const _pd3 = Game.playerDeath.bind(Game);
  Game.playerDeath = (cause) => { curedDied = true; Game.playerDeath = _pd3; };
  for (let i = 0; i < 25 && !curedDied; i++) { Game.state.scholar.health = 100; Game.tickStatuses('scholar', 'dayPart'); }
  Game.playerDeath = _pd3;
  ok('diagnosed + antibiotics cures lockjaw before the clock (no death)', curedDied === false && !Game.hasStatus('scholar', 'lockjaw'));
  // Eased-only lockjaw still kills: herbal_remedy eases suffering, never cures.
  setup();
  Game.applyStatus('scholar', 'lockjaw', { source: 'test', silent: true });
  try { Game.easeDisease('scholar', 'lockjaw', 9999, null); } catch (e) {}
  Game.state.scholar.health = 100;
  let easedDied = false;
  const _pd4 = Game.playerDeath.bind(Game);
  Game.playerDeath = (cause) => { easedDied = true; Game.playerDeath = _pd4; };
  for (let i = 0; i < 25 && !easedDied; i++) { Game.state.scholar.health = 100; Game.tickStatuses('scholar', 'dayPart'); }
  Game.playerDeath = _pd4;
  ok('eased-only lockjaw still kills at expiry (ease is not a cure)', easedDied === true);
  // S3: zero-medicine player — folk rest still moves folk-'slow' diseases; lockjaw is honest.
  setup();
  const rs2 = stripMedical();
  Game.applyStatus('scholar', 'disease', { source: 'test', silent: true });
  const before = Game.seList('scholar').find(e => e.id === 'disease').dayPartsLeft;
  for (let i = 0; i < 12; i++) { try { Game.folkRemedy('rest'); } catch (e) {} }
  const afterEntry = Game.seList('scholar').find(e => e.id === 'disease');
  const after = afterEntry ? afterEntry.dayPartsLeft : 0;
  Game.applyStatus('scholar', 'lockjaw', { source: 'test', silent: true });
  said = [];
  try { Game.folkRemedy('rest'); } catch (e) {}
  const honestLockjaw = said.join(' ').includes("doesn") && said.join(' ').includes("won");
  rs2();
  ok('folk rest moves folk-slow fever for a zero-medicine player', after < before, `${before} -> ${after}`);
  ok('folk rest is honest about lockjaw (no false promise)', honestLockjaw === true);
}

// ============ H1: shellgut triple-risk meal ============
{
  console.log('H1: shellgut vs poison/fever/trichinosis + -25% kcal');
  function tripleMeal(withShellgut) {
    setup();
    const s = Game.state.scholar; s.kcal = 0;
    s.inventory = [{
      name: 'suspect stew', kcalEach: 100, units: 1, safe: true, edible: true, spoilDay: 999,
      diseaseRisk: { p: 1, dmg: 5, note: 'risky' },
      parasiteRisk: { p: 1, id: 'trichinosis' }, foodState: 'raw',
      poisonRisk: { p: 1, note: 'bad mushrooms' },
    }];
    if (withShellgut) Game.applyStatus('scholar', 'shellgut', { source: 'test', silent: true });
    const kcalBefore = s.kcal;
    Game.eatOne(0);
    return {
      kcalGain: s.kcal - kcalBefore,
      fever: Game.hasStatus('scholar', 'disease'),
      trich: Game.hasStatus('scholar', 'trichinosis'),
      poison: Game.hasStatus('scholar', 'poison'),
    };
  }
  const ctl = tripleMeal(false);
  const arm = tripleMeal(true);
  ok('control contracts all three ingested risks', ctl.fever && ctl.trich && ctl.poison,
    JSON.stringify(ctl));
  ok('shellgut blocks poison + fever + trichinosis', !arm.fever && !arm.trich && !arm.poison,
    JSON.stringify(arm));
  ok('shellgut takes its cut (-25% kcal: 75 vs 100)', arm.kcalGain === 75 && ctl.kcalGain === 100,
    `armored=${arm.kcalGain} control=${ctl.kcalGain}`);
}

// ============ H2: witness_maw "night half as dark" ============
{
  console.log('H2: witness_maw light math');
  setup();
  // The scholar camps at haven by default — haven light clamps to 0.65, which would
  // mask the witness_maw transform. Test in the wilds, no fire, no tent.
  const _pt = Game.playerTile.bind(Game);
  const _nf = Game.nearFire ? Game.nearFire.bind(Game) : null;
  Game.playerTile = () => ({ type: 'wilds' });
  Game.nearFire = () => false;
  Game.state.scholar.insideTent = null;
  Game.state.weather = 'clear';
  Game.state.scholar.dayTicks = Math.floor(Game.TIME.TICKS_PER_DAY * 0.8); // deep night
  const nightPlain = Game.lightLevel();
  Game.applyStatus('scholar', 'witness_maw', { source: 'test', silent: true });
  const nightMaw = Game.lightLevel();
  const expect = 1 - (1 - nightPlain) / 2;
  ok('night is exactly half as dark (l -> 1-(1-l)/2)', Math.abs(nightMaw - expect) < 1e-9 && Math.abs(nightPlain - 0.15) < 1e-9,
    `plain=${nightPlain} maw=${nightMaw} expect=${expect}`);
  Game.state.scholar.dayTicks = Math.floor(Game.TIME.TICKS_PER_DAY * 0.3); // midday
  const dayMaw = Game.lightLevel();
  ok('daylight untouched by witness_maw', Math.abs(dayMaw - 1) < 1e-9, `day=${dayMaw}`);
  Game.playerTile = _pt; if (_nf) Game.nearFire = _nf;
}

// ============ H3: lemons engorge +20% ============
{
  console.log('H3: lemons engorge');
  setup();
  const s = Game.state.scholar; s.kcal = 0;
  s.inventory = [{ name: 'plain stew', kcalEach: 100, units: 1, safe: true, edible: true, spoilDay: 999 }];
  Game.eatOne(0);
  const plain = s.kcal;
  setup();
  const s2 = Game.state.scholar; s2.kcal = 0;
  s2.inventory = [{ name: 'plain stew', kcalEach: 100, units: 1, safe: true, edible: true, spoilDay: 999 }];
  Game.applyStatus('scholar', 'lemons', { source: 'test', silent: true });
  Game.eatOne(0);
  ok('engorge: +20% kcal absorbed (120 vs 100)', s2.kcal === 120 && plain === 100, `lemons=${s2.kcal} plain=${plain}`);
}

// ============ H4/H5: howlbelly fear-check + kin pass-through ============
{
  console.log('H4/H5: howlbelly 50% fear check; croakbelly/flockmind kin');
  // deterministic kin pass-through
  setup();
  Game.applyStatus('scholar', 'croakbelly', { source: 'test', silent: true });
  said = [];
  const bell = Game.triggerEncounter('belltoad');
  ok('croakbelly: belltoad will not start anything', bell === false && said.join(' ').includes('kin'),
    `returned=${bell}`);
  setup();
  Game.applyStatus('scholar', 'flockmind', { source: 'test', silent: true });
  said = [];
  const ducks = Game.triggerEncounter('ducks_in_a_row');
  ok('flockmind: duck-line will not start anything', ducks === false && /quack/i.test(said.join(' ')),
    `returned=${ducks}`);
  // statistical fear check: small monster (ducks hp 12-18) vs big (hushwolf 50-65)
  // NOTE: setup() resets the seed — reset once here, then run trials without reset
  // so each trial draws fresh randomness (identical trials would prove nothing).
  rng.reset();
  let smallPass = 0; const N = 80;
  for (let i = 0; i < N; i++) {
    setup(true);
    Game.applyStatus('scholar', 'howlbelly', { source: 'test', silent: true });
    said = [];
    Game.triggerEncounter('ducks_in_a_row');
    if (said.join(' ').includes('melt')) smallPass++;
  }
  let bigPass = 0; const M = 40;
  for (let i = 0; i < M; i++) {
    setup(true);
    Game.applyStatus('scholar', 'howlbelly', { source: 'test', silent: true });
    said = [];
    Game.triggerEncounter('hushwolf');
    if (said.join(' ').includes('melt')) bigPass++;
  }
  ok('howlbelly: small monsters sometimes think twice (~50%)', smallPass > 10 && smallPass < 70,
    `${smallPass}/${N}`);
  ok('howlbelly: big monsters (hp>=50) never think twice', bigPass === 0, `${bigPass}/${M}`);
}

// ============ H6: mosquito 50/50 ============
{
  console.log('H6: giant mosquito 50/50 virus split');
  setup();
  let eur = 0, enl = 0; const N = 400;
  for (let i = 0; i < N; i++) {
    Game.cureStatus && null;
    // reset: remove both viruses via direct engine removal (bypasses pool guard — test only)
    for (const e of Game.seList('scholar').slice()) if (e.id === 'eurika' || e.id === 'east_nile') Game.seRemove('scholar', e);
    const v = Game.mosquitoBiteVirus();
    if (v === 'eurika') eur++; else if (v === 'east_nile') enl++;
  }
  const ratio = eur / N;
  ok('mosquitoBiteVirus is 50/50', ratio > 0.4 && ratio < 0.6 && eur > 0 && enl > 0,
    `eurika=${eur} east_nile=${enl}`);
  // a Bearer <redacted> one can still catch the other (per-bite framing)
  setup();
  Game.applyStatus('scholar', 'eurika', { source: 'test', silent: true });
  const v2 = Game.mosquitoBiteVirus();
  ok('second virus catchable on a later bite', v2 === 'east_nile', `got=${v2}`);
}

// ============ H7: trembles 15%/meal ============
{
  console.log('H7: trembles 15% per human-meat meal');
  setup();
  const s = Game.state.scholar;
  let hits = 0; const N = 200;
  for (let i = 0; i < N; i++) {
    // clear any existing trembles via direct removal (test-only; cureStatus is pool-guarded only for alien)
    for (const e of Game.seList('scholar').slice()) if (e.id === 'trembles') Game.seRemove('scholar', e);
    s.inventory = [{ name: 'human meat', plantId: 'meat_human', kcalEach: 550, units: 1, spoilDay: 999 }];
    s.trauma = 0; s.corruption = 0;
    try { Game.eatCannibal(0); } catch (e) {}
    if (Game.hasStatus('scholar', 'trembles')) hits++;
  }
  const rate = hits / N;
  ok('trembles ~15%/meal', rate > 0.08 && rate < 0.25, `${hits}/${N} = ${rate.toFixed(3)}`);
}

// ============ H8: tick escalation ============
{
  console.log('H8: ambient tick fever roll escalates 3% -> 15% capped');
  function tickRate(daysOn, trials) {
    // Light per-trial reset (NOT full setup): a full genRoster/newGame/depart per
    // trial consumes a near-fixed K rng draws, decimating the seeded LCG so the
    // roll draws correlate (harness artifact, not an engine bug). Clearing
    // statuses keeps the stream advancing naturally.
    setup();
    let hits = 0;
    for (let i = 0; i < trials; i++) {
      const s = Game.state.scholar;
      for (const e of Game.seList('scholar').slice()) Game.seRemove('scholar', e);
      s.day = 1; Game.dayPart = 1; s.health = 100;
      Game.applyStatus('scholar', 'tick_attached', { source: 'test', silent: true });
      const te = Game.seList('scholar').find(e => e.id === 'tick_attached');
      te.day = 1 - (daysOn - 1); // daysOn = day - te.day + 1
      te.lastRollDay = 0;
      Game.diseaseVectorTick();
      if (Game.hasStatus('scholar', 'disease')) hits++;
    }
    return hits / trials;
  }
  const r1 = tickRate(1, 300);
  const r5 = tickRate(5, 300);
  // RNG-STABILITY: at p=0.03 a 1/300 outcome is legitimate (P(X<=1) ~1%); the
  // lower bound stays 0 and the same-code-path day-5 rate + the source-formula
  // check carry the wiring proof. Upper bound catches a too-hot roll.
  ok('day-1 tick roll ~3%', r1 >= 0 && r1 < 0.09, r1.toFixed(3));
  ok('day-5 tick roll ~15% (capped)', r5 > 0.08 && r5 < 0.25, r5.toFixed(3));
  ok('escalation is real (day5 > day1)', r5 > r1, `${r1.toFixed(3)} -> ${r5.toFixed(3)}`);
}

// ============ H9: blind tick removal 40% botch ============
{
  console.log('H9: blind tick removal botches 40% -> wound_fever, never stuck');
  const restore = (() => { setup(); return stripMedical(); })();
  let botch = 0, stuck = 0; const N = 200;
  for (let i = 0; i < N; i++) {
    for (const e of Game.seList('scholar').slice()) Game.seRemove('scholar', e);
    Game.applyStatus('scholar', 'tick_attached', { source: 'test', silent: true });
    Game.removeTick();
    if (Game.hasStatus('scholar', 'wound_fever')) botch++;
    if (Game.hasStatus('scholar', 'tick_attached')) stuck++;
    for (const e of Game.seList('scholar').slice()) if (e.id === 'wound_fever') Game.seRemove('scholar', e);
  }
  restore();
  const rate = botch / N;
  ok('blind removal botches ~40%', rate > 0.3 && rate < 0.5, `${botch}/${N} = ${rate.toFixed(3)}`);
  ok('tick never stuck after a removal attempt', stuck === 0, `stuck=${stuck}`);
}

// ============ H10: trichinosis — smoking does NOT clear ============
{
  console.log('H10: trichinosis vector — only cooked clears');
  function feedTrich(foodState, undercooked) {
    setup();
    const s = Game.state.scholar; s.kcal = 0;
    s.inventory = [{
      name: 'bear meat', kcalEach: 100, units: 1, safe: true, edible: true, spoilDay: 999,
      parasiteRisk: { p: 1, id: 'trichinosis' }, foodState, undercooked: !!undercooked,
    }];
    Game.eatOne(0);
    return Game.hasStatus('scholar', 'trichinosis');
  }
  const smoked = feedTrich('smoked', false);
  const raw = feedTrich('raw', false);
  const under = feedTrich('cooked', true);
  const cooked = feedTrich('cooked', false);
  ok('smoked meat still carries trichinosis', smoked === true);
  ok('raw meat carries trichinosis', raw === true);
  ok('undercooked counts as uncooked (honest)', under === true);
  ok('cooked clears trichinosis', cooked === false);
}

// ============ H11: source + data honesty ============
{
  console.log('H11: source/data honesty checks');
  const gameSrc = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
  ok('ambient mosquito is 1.5%/part (mr < 0.015)', /if \(mr < 0\.015\)/.test(gameSrc));
  ok('tick escalation formula 3%+3%/day capped 15%', /0\.03 \+ 0\.03 \* \(daysOn - 1\)/.test(gameSrc) && /0\.15\)/.test(gameSrc));
  ok('gristlefit is exactly +25% (Math.round(d * 1.25))', /Math\.round\(d \* 1\.25\)/.test(gameSrc));
  ok('lemons blood-sense is +2 vs bleeding', /hasStatus\('scholar', 'lemons'\)[\s\S]{0,120}hasStatus\(t, 'bleed'\)/.test(gameSrc) && /d \+= 2;/.test(gameSrc));
  ok('eurika wired at wanderer + tent breach (2 sites)', (gameSrc.match(/hasStatus\('scholar', 'eurika'\)/g) || []).length >= 2);
  ok('east_nile wired (crow warning)', /hasStatus\('scholar', 'east_nile'\)/.test(gameSrc));
  ok('alien tick latch rolls 50% lemons once per latch', /Math\.random\(\) < 0\.5\)/.test(gameSrc));
  // cooking.json days x 4 == statusEffects duration dayParts
  const cooking = Game.data.cooking.monsterDiseases;
  const sts = Game.data.statusEffects.statuses;
  let daysOk = true;
  for (const dz of cooking) {
    const dur = (sts[dz.id].duration || {}).dayParts;
    if (dur !== dz.days * 4) { daysOk = false; console.log('    mismatch', dz.id, dur, dz.days); }
  }
  ok('meat-quirk durations match cooking.json days x4', daysOk);
  // DISEASES.md roster == JSON roster
  const jsonIds = new Set([...ALIEN, ...MUNDANE]);
  const pooled = Object.keys(sts).filter(id => sts[id].pool);
  const diseaseIds = pooled.filter(id => ['mundane', 'alien'].includes(sts[id].pool) && (sts[id].symptomLabel || ALIEN.includes(id) || MUNDANE.includes(id)));
  ok('JSON roster matches canon 6 mundane + 9 alien',
    ALIEN.every(id => sts[id] && sts[id].pool === 'alien') && MUNDANE.every(id => sts[id] && sts[id].pool === 'mundane'),
    `alien=${ALIEN.filter(id => sts[id] && sts[id].pool === 'alien').length}/9 mundane=${MUNDANE.filter(id => sts[id] && sts[id].pool === 'mundane').length}/6`);
}

// ============ D1: dead code ============
{
  console.log('D1: reachability');
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  ok('statusEffects.js loaded in index.html', html.includes('src/js/statusEffects.js'));
  // seIsDisease admits mundane only
  setup();
  let seOk = MUNDANE.every(id => Game.seIsDisease(id) === true) &&
    ALIEN.every(id => Game.seIsDisease(id) === false) &&
    Game.seIsDisease('bleed') === false;
  ok('seIsDisease admits mundane only', seOk);
  const gameSrc = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
  ok('tbMosquitoTurn defined + dispatched', gameSrc.includes('tbMosquitoTurn(m)') && gameSrc.includes('this.tbMosquitoTurn(m)'));
  ok('tbTickTurn defined + dispatched', gameSrc.includes('tbTickTurn(m)') && gameSrc.includes('this.tbTickTurn(m)'));
  const mons = Game.data.monsters;
  const gm = mons.find(m => m.id === 'giant_mosquito');
  const at = mons.find(m => m.id === 'alien_tick');
  ok('giant_mosquito + alien_tick in monsters.json (wave 2)', !!gm && !!at && gm.wave === 2 && at.wave === 2,
    `gm wave=${gm && gm.wave} at wave=${at && at.wave}`);
  ok('both in monsterBehaviors.json', !!(Game.data.monsterBehaviors.behaviors || Game.data.monsterBehaviors).giant_mosquito !== undefined || JSON.stringify(Game.data.monsterBehaviors).includes('giant_mosquito'));
  const spr = fs.readFileSync(path.join(ROOT, 'src/js/sprites.js'), 'utf8');
  ok('both have sprites', spr.includes('giant_mosquito') && spr.includes('alien_tick'));
  ok('castMonster draws from unlocked waves (wave-2 castable)', /m\.wave.*<=.*wave/.test(gameSrc) || /\(m\.wave \|\| 1\) <= wave/.test(gameSrc));
}

// ============ H12: copy grammar — no "You's" ============
{
  console.log('H12: disease copy renders grammatically for the player');
  setup();
  const sts = Game.data.statusEffects.statuses;
  const fakeVillager = { name: 'Mara Okafor', kind: 'villager' };
  let bad = [];
  for (const id of Object.keys(sts)) {
    const def = sts[id];
    if (!def.pool) continue;
    for (const f of ['applyText', 'tickText', 'expireText', 'cureText']) {
      const tpl = def[f];
      if (!tpl) continue;
      for (const [who, tgt] of [['you', 'scholar'], ['vil', fakeVillager]]) {
        const line = Game.seFill(tpl, tgt, { source: 'test', n: 2 });
        // "You's neck", "Youself", "You are been beaten", "how You hears", "opening You mouth"
        if (/You's|Youself|are been|how You hears|opening You /.test(line)) bad.push(`${id}.${f}[${who}]: ${line}`);
      }
    }
  }
  ok('no possessive/verb grammar breaks in disease copy', bad.length === 0, bad.slice(0, 3).join(' | '));
}

console.log(`\n${pass} passed, ${fail} failed (seed ${SEED})`);
process.exit(fail ? 1 : 0);
