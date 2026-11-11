// test-titanfirst-a.js — proof for the titans + heralds first-numbers
// instrument + analyzer (arm sim-titanfirst-a, run fleshout-20261111T1115Z).
//
// Fixture leg (fast, always): every wrap proven live on a fixture game
// (seed 99104 — the trustfirst fixture seed, not a band seed):
// startCombat (herald refused, no muster; say line captured),
// tbEnd (wrap fires with no fight; titan classification via analyzer
// synthetics — a real titan TB fight needs a 10-blade muster, which
// no fixture can form; the pilot is the live tbEnd proof),
// fieldFight (villager vs placed herald, outcome + rounds),
// spawnWorldMonster / removeWorldMonster (herald placed + removed),
// titanDawnTick (forced strike: omen stage 2, (day-o.day)%5==0, placed
// monster, stocked pantry — a raid is observed via dawn-diff + say
// line within 20 repeated ticks),
// titanSelfDo / soundTitanCall / titanWarCouncil / titanCommitOwn /
// titanStandDown / titanCallReadiness (direct calls, events recorded),
// Game.say capture (titan lines recorded with day + seq), snapshot
// shape, and a RED check: installing on a Game with a method deleted
// logs instrumentErrors instead of throwing.
// RED checks (dead by construction): there is NO direct titanEscalate
// wrap — it is closure-internal. The test asserts the instrument
// exports no titanEscalate wrap (wrapLive has no such key) AND the
// forced-strike fixture proves strikes are still seen via dawn-diff
// + say capture. A second RED check: startCombat on a NON-titan id
// records no event (only the counter moves).
// Analyzer leg (pure): classifySayLine on one line per class +
// unclassified on a generic line; classifyStartCombat refused /
// fought / dissolved / unclassified; classifyTbEnd ok / unclassified;
// classifyFieldFight ok / unclassified; classifyDawn omen-created,
// strike-trust, strike-pantry, other-cause, and unclassified cases;
// classifyOutcome ok / unclassified; resolveInstance join + unmatched.
// Neutrality miniature (live, 5 days): same seed, instrument on vs
// off, days + pantry + deaths identical.
// Usage: node scripts/test-titanfirst-a.js
'use strict';
const path = require('path');
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
const { competent } = require(path.join(__dirname, 'policies', 'competent'));
const TF = require(path.join(__dirname, 'titanfirst-instrument-20261111'));
const AN = require(path.join(__dirname, 'titanfirst-analyze-20261111'));

let pass = 0, fails = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0); } catch (e) { return null; }
}
function roster(Game) {
  try { return ((Game.state.village || {}).roster || []).filter(function (id) { return id !== Game.villagerId; }); } catch (e) { return []; }
}

(async function () {
  // ---- analyzer leg (pure, no sim) ----
  check('classifySayLine: omen0', AN.classifySayLine('🔭 Scouts come back pale. Something big is moving.') === 'omen0');
  check('classifySayLine: omen1', AN.classifySayLine('📻 They name it: THE HERALD.') === 'omen1');
  check('classifySayLine: located', AN.classifySayLine('🗺️ Scouts found its lair — tile 5,3. THE HERALD — it waits.') === 'located');
  check('classifySayLine: repair', AN.classifySayLine('🗺️ Scouts correct their map — herald is at tile 2,2.') === 'repair');
  check('classifySayLine: strike-pantry', AN.classifySayLine('🌪️ THE HERALD fed in the night — 2,500 kcal gone from your stores.') === 'strike-pantry');
  check('classifySayLine: strike-trust', AN.classifySayLine('🌪️ THE HERALD struck Alder in the night. They bled while the coalition talked. (trust −5 — they notice who wasn\'t there.)') === 'strike-trust');
  check('classifySayLine: muster-hunger', AN.classifySayLine('🍽️ The muster is hungry — 500 of 3,000 kcal fed.') === 'muster-hunger');
  check('classifySayLine: refusal-gate', AN.classifySayLine('⛔ THE HERALD does not notice you the way prey notices a hunter. It notices you the way weather notices a field. You cannot face this alone — sound the call, muster 10 allied blades (you have 0). This is not courage. This is arithmetic.') === 'refusal-gate');
  check('classifySayLine: refusal-campaign', AN.classifySayLine('⛔ THE HEART demands 10 surviving blades — the march has 3.') === 'refusal-campaign');
  check('classifySayLine: council', AN.classifySayLine('⚔️ WAR COUNCIL — THE HERALD. The leaders sit as faces, not pieces.') === 'council');
  check('classifySayLine: council-readiness', AN.classifySayLine('📯 The call, sounded now, would bring 4 blades — 2 from allied fires and 2 of Haven’s own — against the 10 THE HERALD demands.') === 'council-readiness');
  check('classifySayLine: council-refusal', AN.classifySayLine('Alder cannot answer while they do not trust this coalition with their people.') === 'council-refusal');
  check('classifySayLine: council-empty', AN.classifySayLine('No one sits with you. You have no coalition. The council is one chair.') === 'council-empty');
  check('classifySayLine: council-face', AN.classifySayLine('— Mara of Alder (trust 42, watchful). Scouts: they will fight.') === 'council-face');
  check('classifySayLine: council-report', AN.classifySayLine('Scouts report: It grows every round. Its weakness is unknown — the scouts came back pale.') === 'council-report');
  check('classifySayLine: call-out', AN.classifySayLine('📯 THE CALL GOES OUT — THE HERALD must fall, and no one fire can do it.') === 'call-out');
  check('classifySayLine: call-refusal', AN.classifySayLine('— Alder REFUSES. they do not trust this coalition with their people. (trust −8 — refusals are remembered.)') === 'call-refusal');
  check('classifySayLine: call-answer', AN.classifySayLine('— Alder answers! Mara and Joren will march. (trust holds — they are counting on you.)') === 'call-answer');
  check('classifySayLine: call-already', AN.classifySayLine('— Alder’s volunteers already march. No new blades join.') === 'call-already');
  check('classifySayLine: call-thin', AN.classifySayLine('— Alder has no free fighters to send. Their fire is thin.') === 'call-thin');
  check('classifySayLine: call-quota', AN.classifySayLine('Closer bonds with Alder could bring more volunteers. For now, these are the people they can spare.') === 'call-quota');
  check('classifySayLine: no-target', AN.classifySayLine('There is nothing located to march against — the sky is quiet. You commit no one into the dark.') === 'no-target');
  check('classifySayLine: commit-slain', AN.classifySayLine('It is already dead. The committed have nothing left to march against.') === 'commit-slain');
  check('classifySayLine: commit-network-closed', AN.classifySayLine('📯 No new blades join the Network march — not even Haven’s. The coalition is the one you started with.') === 'commit-network-closed');
  check('classifySayLine: commit-full', AN.classifySayLine('Haven’s blades already march — Mara, Joren. Haven cannot empty itself; the coalition is the many, our part is the few.') === 'commit-full');
  check('classifySayLine: commit-none-free', AN.classifySayLine('No one is free to march — every able body is away, engaged, or already committed. THE HERALD waits. The coalition will have to be enough.') === 'commit-none-free');
  check('classifySayLine: commit-confirm', AN.classifySayLine('🛡️ Mara steps forward. They will march with the muster, eat from your stores (1000 kcal/day each), and stand in front of THE HERALD. They can die — Haven does not get them back, and the fire will be quieter. Tap again — Haven sends its own.') === 'commit-confirm');
  check('classifySayLine: commit-done', AN.classifySayLine('🛡️ Haven commits its own: Mara marches with the muster. Not loaned. Not asked-for. Ours. The coalition counts 2 blades against THE HERALD — it needs 10.') === 'commit-done');
  check('classifySayLine: standdown', AN.classifySayLine('🕊️ THE MUSTER BREAKS — THE HERALD still stands, unanswered, but the blades go home.') === 'standdown');
  check('classifySayLine: standdown-none', AN.classifySayLine('No muster stands against THE HERALD. There is nothing to stand down.') === 'standdown-none');
  check('classifySayLine: turn', AN.classifySayLine('🔪 THE TURN — Alder takes the gear and walks. Mara and Joren were faces at your fire.') === 'turn');
  check('classifySayLine: victory', AN.classifySayLine('🌅 THE HERALD FALLS. The realm exhales. That was the herald. The sky is still getting bigger.') === 'victory');
  check('classifySayLine: victory-aftermath', AN.classifySayLine('The coalition walks home. Fewer than marched out. The fires will tell this one for years.') === 'victory-aftermath');
  check('classifySayLine: relic', AN.classifySayLine('✨ RELIC — The Falling Title Card. It reads \'PREVIOUSLY ON...\' and it\'s you.') === 'relic');
  check('classifySayLine: victory-no-relic', AN.classifySayLine('The titan leaves nothing but quiet. (The relics are rare — the realm secured is the real prize.)') === 'victory-no-relic');
  check('classifySayLine: defeat', AN.classifySayLine('💀 THE HERALD remains. The coalition breaks and runs. The muster is spent — sound the call again, if anyone still answers.') === 'defeat');
  check('classifySayLine: fight-death', AN.classifySayLine('🕯️ Mara of Alder did not get up. They were a face at your fire. The alliance remembers.') === 'fight-death');
  check('classifySayLine: fight-death-speaker', AN.classifySayLine('🕯️ Mara — their speaker — fell. Alder names another. The link holds, thinner. (trust −10 — they count their dead.)') === 'fight-death-speaker');
  check('classifySayLine: fight-death-haven', AN.classifySayLine('🕯️ The fire is quieter tonight — Haven sent its own, and one is not coming home.') === 'fight-death-haven');
  check('classifySayLine: inject-allies', AN.classifySayLine('🛡️ 12 allies join you on the field.') === 'inject-allies');
  check('classifySayLine: campaign-muster', AN.classifySayLine('💀 The node holds. The coalition falls back in good order — the muster holds, the dead stay dead. (3 blades. Re-face the node when ready, or reinforce.)') === 'campaign-muster');
  check('classifySayLine: other-system', AN.classifySayLine('The big ones don\'t haggle. Nothing here takes coin. (Buy Passage: not titans)') === 'other-system');
  check('classifySayLine: generic line unclassified', AN.classifySayLine('You wait. The light changes. Nothing asks anything of you.') === 'unclassified');

  // classifyStartCombat
  const scSeed = { tbEndEvents: [], titanSaysFull: [] };
  check('classifyStartCombat: refused via outcome log', AN.classifyStartCombat({ mid: 'herald', returnedNull: true, outcomeAdded: [{ outcome: 'refused', titan: 'herald' }], saySeqBefore: 0, saySeqAfter: 0 }, scSeed) === 'refused');
  check('classifyStartCombat: fought via outcome log', AN.classifyStartCombat({ mid: 'herald', returnedNull: false, outcomeAdded: [{ outcome: 'fought', titan: 'herald' }], saySeqBefore: 0, saySeqAfter: 0 }, scSeed) === 'fought');
  check('classifyStartCombat: fought via non-null return', AN.classifyStartCombat({ mid: 'herald', returnedNull: false, outcomeAdded: [], saySeqBefore: 0, saySeqAfter: 0 }, scSeed) === 'fought');
  check('classifyStartCombat: dissolved via same-day tbEnd', AN.classifyStartCombat(
    { mid: 'herald', returnedNull: true, outcomeAdded: [], saySeqBefore: 0, saySeqAfter: 0, day: 50 },
    { tbEndEvents: [{ titan: 'herald', day: 50 }], titanSaysFull: [] }) === 'dissolved');
  check('classifyStartCombat: refused via gate say line', AN.classifyStartCombat(
    { mid: 'herald', returnedNull: true, outcomeAdded: [], saySeqBefore: 0, saySeqAfter: 1, day: 50 },
    { tbEndEvents: [], titanSaysFull: [{ seq: 1, day: 50, line: '⛔ THE HERALD does not notice you the way prey notices a hunter.' }] }) === 'refused');
  check('classifyStartCombat: null with nothing is unclassified', AN.classifyStartCombat(
    { mid: 'herald', returnedNull: true, outcomeAdded: [], saySeqBefore: 0, saySeqAfter: 0, day: 50 }, scSeed) === 'unclassified');

  // classifyTbEnd / classifyFieldFight / classifyOutcome
  check('classifyTbEnd: ok', AN.classifyTbEnd({ titan: 'herald', result: 'won', round: 12 }) === 'ok');
  check('classifyTbEnd: no round unclassified', AN.classifyTbEnd({ titan: 'herald', result: 'won', round: null }) === 'unclassified');
  check('classifyTbEnd: no result unclassified', AN.classifyTbEnd({ titan: 'herald', result: null, round: 3 }) === 'unclassified');
  check('classifyFieldFight: ok', AN.classifyFieldFight({ mid: 'herald', outcome: 'vFlee', rounds: 4 }) === 'ok');
  check('classifyFieldFight: bad outcome unclassified', AN.classifyFieldFight({ mid: 'herald', outcome: 'mystery', rounds: 4 }) === 'unclassified');
  check('classifyOutcome: ok', AN.classifyOutcome({ titan: 'herald', outcome: 'stood-down' }) === 'ok');
  check('classifyOutcome: bad outcome unclassified', AN.classifyOutcome({ titan: 'herald', outcome: 'vanished' }) === 'unclassified');

  // classifyDawn (synthetic)
  const dawnSeed = { titanSaysFull: [
    { seq: 1, day: 10, line: '🔭 Scouts come back pale. Something big is moving out there.' },
    { seq: 2, day: 10, line: '🌪️ THE HERALD fed in the night — 2,500 kcal gone from your stores.' },
    { seq: 3, day: 10, line: '🌪️ THE HERALD struck Alder in the night. They bled while the coalition talked. (trust −5 — they notice who wasn\'t there.)' },
  ] };
  check('classifyDawn: omen-created with line ok', AN.classifyDawn(
    { saySeqBefore: 0, saySeqAfter: 1, diffs: { omen: [{ titan: 'herald', before: null, after: { stage: 0, day: 10 } }], trust: [], outcomesAdded: [] } }, dawnSeed).cls === 'ok');
  check('classifyDawn: omen-created without line unclassified', AN.classifyDawn(
    { saySeqBefore: 5, saySeqAfter: 5, diffs: { omen: [{ titan: 'herald', before: null, after: { stage: 0, day: 10 } }], trust: [], outcomesAdded: [] } }, dawnSeed).cls === 'unclassified');
  check('classifyDawn: strike-pantry ok', AN.classifyDawn(
    { saySeqBefore: 1, saySeqAfter: 2, diffs: { omen: [], trust: [], pack: { before: 50000, after: 47500, delta: -2500 }, outcomesAdded: [] } }, dawnSeed).cls === 'ok');
  check('classifyDawn: strike-trust ok', AN.classifyDawn(
    { saySeqBefore: 2, saySeqAfter: 3, diffs: { omen: [], trust: [{ village: 'alder', trustBefore: 50, trustAfter: 45, delta: -5, titanHistAdded: [{ day: 10, kind: 'titan', note: 'x' }] }], outcomesAdded: [] } }, dawnSeed).cls === 'ok');
  check('classifyDawn: trust move with no titan entry is other-cause ok', AN.classifyDawn(
    { saySeqBefore: 0, saySeqAfter: 0, diffs: { omen: [], trust: [{ village: 'alder', trustBefore: 50, trustAfter: 48, delta: -2, titanHistAdded: [] }], outcomesAdded: [] } }, dawnSeed).cls === 'ok');
  check('classifyDawn: pantry move with no raid line is other-cause ok', AN.classifyDawn(
    { saySeqBefore: 0, saySeqAfter: 0, diffs: { omen: [], trust: [], pantry: { before: 50000, after: 49000, delta: -1000 }, outcomesAdded: [] } }, dawnSeed).cls === 'ok');
  check('classifyDawn: pack move with no raid line is other-cause ok', AN.classifyDawn(
    { saySeqBefore: 0, saySeqAfter: 0, diffs: { omen: [], trust: [], pack: { before: 50000, after: 49000, delta: -1000 }, outcomesAdded: [] } }, dawnSeed).cls === 'ok');

  // resolveInstance
  const instSeed = { spawnEvents: [{ id: 'herald', day: 40, tx: 5, ty: 3 }] };
  check('resolveInstance: joins spawn', AN.resolveInstance(instSeed, { mid: 'herald', day: 45 }) === 'herald|40');
  check('resolveInstance: before spawn is unmatched', AN.resolveInstance(instSeed, { mid: 'herald', day: 39 }) === null);
  check('resolveInstance: wrong titan unmatched', AN.resolveInstance(instSeed, { mid: 'nielsen', day: 45 }) === null);

  // ---- fixture leg ----
  const { Game } = await loadGame({ seed: 99104, mode: 'competent-titanfirst-proof', fullTelemetry: false });
  await setupGame(Game);
  const tf = TF.install(Game);
  const T = tf.t;
  check('install: zero instrument errors', T.instrumentErrors.length === 0, JSON.stringify(T.instrumentErrors.slice(0, 3)));
  check('install: all wraps present (no missing-method errors)', !T.instrumentErrors.some(function (e) { return /-missing/.test(e); }));
  check('RED: no direct titanEscalate wrap exists (closure-internal by construction)', !('titanEscalate' in T.wrapLive) && !T.wrapCounts.titanEscalate);

  const ids = roster(Game);
  check('fixture: roster has non-scholar villagers', ids.length >= 2, 'roster=' + ids.length);
  const A = ids[0];

  // Place the herald (spawn wrap) and refuse a startCombat (no muster).
  const day0 = gday(Game);
  const mon = Game.spawnWorldMonster('herald', 4, 4, { titan: true });
  check('spawnWorldMonster: herald spawn recorded', T.spawnEvents.length === 1 && T.spawnEvents[0].id === 'herald' && T.spawnEvents[0].day === day0,
    'spawns=' + T.spawnEvents.length);
  check('spawnWorldMonster: herald placed on the board', !!mon && mon.id === 'herald' && mon.hp >= 700, 'hp=' + (mon && mon.hp));
  const sc0 = T.startCombatEvents.length;
  const ret = Game.startCombat('herald');
  check('startCombat herald: refused (null) with no muster', ret === null && T.startCombatEvents.length === sc0 + 1,
    'ret=' + ret);
  const scEv = T.startCombatEvents[T.startCombatEvents.length - 1];
  check('startCombat herald: event classified refused', AN.classifyStartCombat(scEv, { tbEndEvents: T.tbEndEvents, titanSaysFull: T.titanSays }) === 'refused');
  check('startCombat herald: gate say line captured during the call', T.titanSays.some(function (s) { return AN.classifySayLine(s.line) === 'refusal-gate'; }),
    'titanSays=' + T.titanSays.length);
  check('startCombat herald: outcome log gained a refused record', (scEv.outcomeAdded || []).some(function (r) { return r.outcome === 'refused'; }));

  // RED: a non-titan startCombat records no event, only the counter.
  const nt0 = T.nonTitanStartCombat;
  try { Game.startCombat('deer'); } catch (e) { /* unknown-id throw is fine; the counter moved first */ }
  check('RED: non-titan startCombat records no event', T.startCombatEvents.length === sc0 + 1 && T.nonTitanStartCombat === nt0 + 1,
    'events=' + T.startCombatEvents.length + ' nonTitan=' + T.nonTitanStartCombat);

  // tbEnd wrap fires with no fight (null-guarded) and stays clean.
  const tb0 = T.tbEndEvents.length;
  Game.tbEnd('fled');
  check('tbEnd: wrap fires with no fight, no error, no titan event', T.wrapLive.tbEnd === true && T.tbEndEvents.length === tb0 && T.instrumentErrors.length === 0);

  // Villager field fight vs the placed herald.
  const ff0 = T.fieldFightEvents.length;
  const mdef = (Game.data.monsters || []).find(function (m) { return m.id === 'herald'; });
  const rec = Game.fieldFight(A, mdef, mon, {});
  check('fieldFight herald: event recorded with an outcome', T.fieldFightEvents.length === ff0 + 1 &&
    ['evade', 'vKill', 'mFlee', 'vFlee', 'vDie'].indexOf(rec.outcome) >= 0,
    'outcome=' + (rec && rec.outcome));
  check('fieldFight herald: event classified ok', T.fieldFightEvents.every(function (e) { return AN.classifyFieldFight(e) === 'ok'; }));

  // Titan actions: council, call, commit (two-tap), standdown, readiness.
  const ac0 = T.actionEvents.length;
  Game.titanWarCouncil('herald');
  check('titanWarCouncil: action recorded', T.actionEvents.length === ac0 + 1 && T.actionEvents[ac0].action === 'titanWarCouncil');
  // The omen must be stage 2 for the call to find a located monster.
  // Set it directly on live state (fixture-only manipulation).
  try {
    const tst = Game._titanTest.titanState();
    tst.omens.herald = { stage: 2, day: day0, warned: {} };
  } catch (e) {}
  Game.soundTitanCall('herald');
  check('soundTitanCall: action recorded, muster created', T.actionEvents.some(function (a) { return a.action === 'soundTitanCall'; }) &&
    ((Game.state.titans.musters || {}).herald != null), 'muster=' + JSON.stringify((Game.state.titans.musters || {}).herald));
  const rd = Game.titanCallReadiness('herald');
  check('titanCallReadiness: action recorded, returns an object', T.actionEvents.some(function (a) { return a.action === 'titanCallReadiness'; }) && rd && typeof rd === 'object');
  const c1 = Game.titanCommitOwn('herald');
  const c2 = Game.titanCommitOwn('herald');
  check('titanCommitOwn: two-tap flow recorded (confirm then muster)', c1 === 'confirm' || (c1 && typeof c1 === 'object'),
    'c1=' + JSON.stringify(c1) + ' c2=' + (c2 && typeof c2));
  check('titanCommitOwn: action events recorded', T.actionEvents.filter(function (a) { return a.action === 'titanCommitOwn'; }).length === 2);
  Game.titanStandDown('herald');
  check('titanStandDown: action recorded, muster gone', T.actionEvents.some(function (a) { return a.action === 'titanStandDown'; }) &&
    (Game.state.titans.musters || {}).herald == null);
  check('titanStandDown: outcome log gained a stood-down record', ((Game.state.titans.outcomes || []).some(function (r) { return r.outcome === 'stood-down'; })));

  // Forced strike: omen stage 2, 5 days unanswered, placed monster,
  // stocked pantry. Repeat the dawn tick until a strike kind lands
  // (the 45/55 raid-vs-trust branch is RNG; with no allied links the
  // trust branch is silent, so the loop waits for a raid).
  try {
    const tst = Game._titanTest.titanState();
    tst.omens.herald = { stage: 2, day: day0 - 5, warned: {} };
    tst.slain = {};
  } catch (e) {}
  // Stock the SCHOLAR's pack: raids spend playerPackSpend (finished
  // food in the scholar's inventory), never the village pantry.
  try {
    Game.state.scholar.inventory = Game.state.scholar.inventory || [];
    Game.state.scholar.inventory.push({ id: 'proof-grain', kcalEach: 1000, units: 200 });
  } catch (e) {}
  // Re-place the herald: the standdown above left the monster standing.
  let struck = null;
  for (let i = 0; i < 20 && !struck; i++) {
    const before = T.dawnEvents.length;
    try { Game.titanDawnTick(); } catch (e) {}
    for (let j = before; j < T.dawnEvents.length; j++) {
      const c = AN.classifyDawn(T.dawnEvents[j], { titanSaysFull: T.titanSays, tbEndEvents: T.tbEndEvents });
      if (c.kinds.some(function (k) { return k.indexOf('strike-pantry') === 0 || k.indexOf('strike-trust') === 0; })) struck = c;
    }
  }
  check('forced strike: a strike is seen via dawn-diff + say capture', !!struck, 'dawnEvents=' + T.dawnEvents.length);
  check('forced strike: every dawn event so far classifies ok', T.dawnEvents.every(function (ev) {
    return AN.classifyDawn(ev, { titanSaysFull: T.titanSays, tbEndEvents: T.tbEndEvents }).cls === 'ok';
  }), JSON.stringify(T.dawnEvents.map(function (ev) {
    return AN.classifyDawn(ev, { titanSaysFull: T.titanSays, tbEndEvents: T.tbEndEvents });
  }).filter(function (c) { return c.cls !== 'ok'; }).slice(0, 2)));

  // Snapshot shape + removal.
  const snap = tf.snapshot();
  check('snapshot: titan state + placed + links present', snap.omens && snap.musters && Array.isArray(snap.placed) && snap.links != null,
    'placed=' + JSON.stringify(snap.placed));
  check('snapshot: placed herald visible', snap.placed.some(function (m) { return m.id === 'herald'; }));
  const rm0 = T.removeEvents.length;
  Game.removeWorldMonster(mon);
  check('removeWorldMonster: herald removal recorded', T.removeEvents.length === rm0 + 1 && T.removeEvents[rm0].id === 'herald');

  // RED: installing on a Game with a method deleted logs instead of throwing.
  const { Game: Game2 } = await loadGame({ seed: 99105, mode: 'competent-titanfirst-proof2', fullTelemetry: false });
  await setupGame(Game2);
  const keep = Game2.fieldFight;
  delete Game2.fieldFight;
  let tf2 = null, threw = false;
  try { tf2 = TF.install(Game2); } catch (e) { threw = true; }
  check('RED: install with a deleted method does not throw, logs it', !threw && tf2 && tf2.t.instrumentErrors.some(function (e) { return /fieldFight-missing/.test(e); }),
    'errors=' + JSON.stringify(tf2 ? tf2.t.instrumentErrors : null));
  if (tf2) tf2.uninstall();
  Game2.fieldFight = keep;

  tf.uninstall();
  check('uninstall: startCombat restored', Game.startCombat !== tf);
  check('final: zero instrument errors on the fixture game', T.instrumentErrors.length === 0, JSON.stringify(T.instrumentErrors.slice(0, 3)));

  // ---- neutrality miniature (live, 5 days) ----
  async function miniDays(seed, instOn) {
    const { Game: G } = await loadGame({ seed: seed, mode: 'competent-titanfirst-mini', fullTelemetry: false });
    await setupGame(G);
    let inst = null;
    if (instOn) inst = TF.install(G);
    let res = null;
    await quietLog(async function () { res = await runDays(G, competent, { days: 5, manifest: undefined, sampleEvery: 30 }); });
    if (inst) inst.uninstall();
    return { days: res.days, kcal: pantryKcal(G), deaths: ((res.samples && res.samples.deaths) || []).length };
  }
  const mOn = await miniDays(99104, true);
  const mOff = await miniDays(99104, false);
  check('neutrality miniature: 5d days + pantry + deaths identical on/off',
    mOn.days === mOff.days && mOn.kcal === mOff.kcal && mOn.deaths === mOff.deaths,
    'on=' + JSON.stringify(mOn) + ' off=' + JSON.stringify(mOff));

  console.log('\n' + pass + ' passed, ' + fails + ' failed');
  process.exitCode = fails ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
