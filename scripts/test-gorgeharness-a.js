#!/usr/bin/env node
// test-gorgeharness-a.js — proof for the lingerer-gorge gate/relay FIX
// (sim-gorgeharness-a; prereg:
// evidence/2026-11-06/sim-gorgeharness-a-prereg.md, committed BEFORE
// any judged sim).
//
// Unit leg A (fast, always): gorge classifiers (fixtures + the
// deliberate non-matches — the "Nobody met" linger notice, the
// endure-action response, the sortie-resolution line, the
// village-raid 🌙 line — none of which is the nightly report).
//
// Unit leg A2 (fast, always): revised-metric classification
// (scripts/policies/gorgeharness-diag.js) on synthetic markers +
// lines:
//   - a harness-phase gorge line after a wild night reads AWAY by
//     its pre-endday marker (the morning-boundary channel the old
//     stranded-sleep metric could not see);
//   - a daily-phase gorge line reads AWAY by its pre-endday marker
//     even when the daily-start marker still says Haven (the stale
//     phase marker loses — the pre-endday marker wins);
//   - a Haven firing reads HAVEN; drift-off lines group into their
//     own linger-endDay; a line with no pre-endday marker is
//     UNGROUPED, not silently dropped.
//
// Unit leg B (fast, always): per-beat gate/relay scenarios on a
// loaded Game (sim-harness, seeded). Each scenario runs TWICE —
// scholar AWAY (map 0,0, location 'wild') vs AT HAVEN (map 4,4,
// location 'village', the post-setupGame state) — and asserts the
// delivery differs exactly as pre-registered while the mechanics
// run identically:
//   B9 — gorge (got > 0): away says 0 nightly lines, but the kcal
//     is still taken (raidPillage runs) and lastLingererOffer is
//     still recorded; at Haven >= 1 line is said; nothing is
//     queued (gate-suppress, not relay).
//   B10 — gorge empty-pantry variant (got == 0): away says 0
//     "circles the treeline" lines; at Haven >= 1 is said.
//   B11 — drift-off: away queues the one-time line (sayHavenNews
//     kind 'raid') and says nothing; flush on return delivers it
//     verbatim; at Haven it is said at once and queues nothing.
//     NON-VACUOUS READ (the old arm's warning): the flush check
//     passes only together with "away says 0 before flush" AND
//     "the line was queued as kind raid" — the delivery must come
//     FROM the queue, not from a direct say while away. The extra
//     check asserts exactly that chain in one place.
// The gorge scenarios stage ONE lingering raider via
// spawnWorldMonster + lingering/lingerSince, then call
// havenGrowthDaily() directly (the endDay progDaily wrap calls
// it; the unit call exercises the same loop).
//
// Integration leg (60 loop-days, bankfood variant leg, WOODWARM=0):
// runs the GORGEHARNESS driver once with STRANDNARR=1 and once with
// STRANDNARR=0 on seed 17021 and asserts
//   (a) det-gate: bankfood evenings/mornings/first-upkeep kcal series
//       identical ON vs OFF;
//   (b) 17021 CURRENT-SUBSTRATE FACTS (re-pin, as found on base
//       cc4345e1e): recorded below; the pin moved with the substrate
//       before (57d lost → 60d survived → 52d lost → 60d survived on
//       b5fb49607) and is re-pinned here, never assumed. If the facts
//       moved again, the pin is updated and the move is reported as
//       substrate drift, not silently re-anchored.
//   (c) non-stranded anchor: seed 15003 loop-day 16 sleep window
//       contains a 'Word gets around the haven' line, classified
//       non-stranded sleep with the scholar inside Haven at fire
//       time (the strandnarr-a §2 known hit, re-pinned 2026-11-07:
//       the ld7 day went stale on current master — the ld16 window
//       holds TWO word lines, both inside Haven, verified live by
//       scripts/probe-gossip-anchor-a.js; the 0715Z "no re-pin
//       available on 15003" read the trimmed corpus, which discards
//       non-stranded sleep-window gossip lines by design).
//   (d) revised-metric sanity on 17021: the revised summary exists,
//       its total gorge count equals the per-beat total, and its
//       linger-endDay groups account for every gorge/drift-off line.
// Usage: node scripts/test-gorgeharness-a.js
// Env (the bankfood substrate gates, as in gorgeharness-trace-a.js):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
//   (DEPOSITGATE=1 is REQUIRED: _depositGateOn() reads it.)
'use strict';
const lg = require('./policies/lingergorge-diag');
const gh = require('./policies/gorgeharness-diag');
const eb = require('./policies/enddaybeats-diag');
const sn = require('./policies/strandnarr-diag');
const { loadGame, setupGame } = require('./sim-harness');
const { oneInstance, analyzeInstance } = require('./gorgeharness-trace-a');

let checks = 0, fails = 0;
function check(name, cond, detail) {
  checks++;
  if (cond) console.log('ok   ' + name);
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}

// ---- unit leg A: classifiers ----
const GORGE = '🌙 Night. The lingering The Redactor gorges at the treeline — 1,200 kcal gone from the stores. Endure it (they drift off within ~6 nights — the gorge is the price), or send a sortie: fighters, rations, real risk.';
const GORGE_EMPTY = '🌙 Night. The lingering The Big Beast circles the treeline, sniffing at empty stores — nothing left to take. Endure it (they drift off within ~6 nights), or send a sortie: fighters, rations, real risk.';
const DRIFTOFF = '🌙 The lingering The Eater paces the treeline one last night, then melts back into the dark. The gorge is over — the village outlasted it.';
const NOBODY_MET = "Nobody met The Redactor — it's still out there at the treeline. It'll gorge every night until it's driven off.";
const ENDURE = "You endure it. The treeline holds its shape against the dark; the stores take the night's cut. (They'll drift off within ~6 nights — the gorge is the price of waiting.)";
const SORTIE_RES = '2 still hold the treeline — the gorge goes on. (Endure it, or send another sortie.)';
const VILLAGE_RAID = '🌙 Raid — Stonebridge came in the night from the southeast. They carried off ~1394 kcal from the pantry. Nobody\'s dead, but the message is clear: the ground is theirs too, and they\'re done asking. (Trust -10.)';
check('gorge: got>0 line', lg.isGorgeLine(GORGE) && lg.gorgeKind(GORGE) === 'gorge' && lg.kindOfAll(GORGE) === 'gorge');
check('gorge: empty-pantry variant', lg.isGorgeLine(GORGE_EMPTY) && lg.gorgeKind(GORGE_EMPTY) === 'gorge');
check('gorge: drift-off line', lg.isDriftOffLine(DRIFTOFF) && lg.gorgeKind(DRIFTOFF) === 'gorge-driftoff' && lg.kindOfAll(DRIFTOFF) === 'gorge-driftoff');
check('gorge: "Nobody met" linger notice is NOT the nightly line', !lg.isGorgeLine(NOBODY_MET) && lg.gorgeKind(NOBODY_MET) === null);
check('gorge: endure-action response is NOT the nightly line', !lg.isGorgeLine(ENDURE) && lg.gorgeKind(ENDURE) === null);
check('gorge: sortie-resolution line is NOT the nightly line', !lg.isGorgeLine(SORTIE_RES) && lg.gorgeKind(SORTIE_RES) === null);
check('gorge: village-raid line is NOT the nightly line', !lg.isGorgeLine(VILLAGE_RAID) && lg.gorgeKind(VILLAGE_RAID) === null);
check('gorge: plain narration is not gorge', lg.gorgeKind('Dawn. You wake stiff and cold.') === null);
check('gorge: parent kinds still classify through kindOfAll', lg.kindOfAll('You catch fragments by the fire — Dmitri telling Leonard about you.') === 'fragments');
check('gorge: 3 gorge lines in one window = 1 window', (() => {
  const markers = [{ idx: 0, kind: 'sleep-start', loopDay: 59, part: 0, inside: false, mx: 7, my: 7, tile: 'forest_floor' }];
  const lines = [
    { idx: 10, loopDay: 59, phase: 'sleep', part: 0, text: GORGE },
    { idx: 11, loopDay: 59, phase: 'sleep', part: 0, text: GORGE.replace('The Redactor', 'The Big Beast').replace('1,200', '1,663') },
    { idx: 12, loopDay: 59, phase: 'sleep', part: 0, text: GORGE.replace('The Redactor', 'The Eater').replace('1,200', '950') },
    { idx: 13, loopDay: 59, phase: 'sleep', part: 0, text: 'Dawn. You wake stiff and cold.' },
  ];
  const w = lg.classifyGorgeWindow(lines, markers);
  return w.perKind['gorge'].lines === 3 && w.perKind['gorge'].windows === 1
    && w.gorgeHits.length === 3 && w.gorgeHits[0].position.inside === false;
})());
check('gorge: drift-off + gorge in one window tally separately', (() => {
  const markers = [{ idx: 0, kind: 'sleep-start', loopDay: 12, part: 0, inside: false, mx: 7, my: 7, tile: 'forest_floor' }];
  const lines = [
    { idx: 10, loopDay: 12, phase: 'sleep', part: 0, text: GORGE },
    { idx: 11, loopDay: 12, phase: 'sleep', part: 0, text: DRIFTOFF },
  ];
  const w = lg.classifyGorgeWindow(lines, markers);
  return w.perKind['gorge'].windows === 1 && w.perKind['gorge-driftoff'].windows === 1
    && w.perKind['gorge'].lines === 1 && w.perKind['gorge-driftoff'].lines === 1;
})());

// ---- unit leg A2: revised-metric classification (synthetic) ----
check('revised: harness-phase gorge after a wild night reads AWAY', (() => {
  // Sleep-end marker: wild tile. Pre-endday marker: atHaven false.
  const markers = [
    { idx: 0, kind: 'sleep-start', loopDay: 44, part: 0, inside: false, mx: 4, my: 8, tile: 'grove' },
    { idx: 5, kind: 'sleep-end', loopDay: 44, part: 0, inside: false, mx: 4, my: 8, tile: 'grove' },
    { idx: 8, kind: 'pre-endday', loopDay: 44, part: 0, inside: false, mx: 4, my: 8, tile: 'grove', atHaven: false },
  ];
  const lines = [{ idx: 10, loopDay: 44, phase: 'harness', part: 0, text: GORGE }];
  const d = gh.classifyGorgeDelivery(lines, markers);
  const s = gh.summarizeGorgeDelivery(d);
  return d.hits.length === 1 && d.hits[0].atHaven === false && d.hits[0].agree === true
    && s.awayGorgeLines === 1 && s.havenGorgeLines === 0 && s.awayLingerEndDays === 1;
})());
check('revised: stale daily-start marker loses to the pre-endday marker', (() => {
  // Scholar woke at Haven (daily-start: tile haven, inside false —
  // on Haven grounds), walked out during the day, endDay fires in
  // the daily phase while away. The old reading says Haven; the
  // revised reading must say AWAY, and the disagreement is recorded.
  const markers = [
    { idx: 0, kind: 'daily-start', loopDay: 28, part: 0, inside: false, mx: 4, my: 4, tile: 'haven' },
    { idx: 8, kind: 'pre-endday', loopDay: 28, part: 0, inside: false, mx: 4, my: 8, tile: 'creek', atHaven: false },
  ];
  const lines = [{ idx: 10, loopDay: 28, phase: 'daily', part: 0, text: GORGE }];
  const d = gh.classifyGorgeDelivery(lines, markers);
  const s = gh.summarizeGorgeDelivery(d);
  return d.hits.length === 1 && d.hits[0].atHaven === false && d.hits[0].agree === false
    && s.awayGorgeLines === 1 && s.disagreements.length === 1;
})());
check('revised: Haven firing reads HAVEN', (() => {
  const markers = [
    { idx: 0, kind: 'sleep-start', loopDay: 44, part: 0, inside: true, mx: 4, my: 4, tile: 'haven' },
    { idx: 8, kind: 'pre-endday', loopDay: 44, part: 0, inside: true, mx: 4, my: 4, tile: 'haven', atHaven: true },
  ];
  const lines = [{ idx: 10, loopDay: 44, phase: 'sleep', part: 0, text: GORGE }];
  const d = gh.classifyGorgeDelivery(lines, markers);
  const s = gh.summarizeGorgeDelivery(d);
  return d.hits.length === 1 && d.hits[0].atHaven === true && s.havenGorgeLines === 1 && s.awayGorgeLines === 0;
})());
check('revised: two gorge lines in one endDay = one linger-endDay', (() => {
  const markers = [{ idx: 8, kind: 'pre-endday', loopDay: 44, part: 0, inside: false, mx: 4, my: 8, tile: 'grove', atHaven: false }];
  const lines = [
    { idx: 10, loopDay: 44, phase: 'harness', part: 0, text: GORGE },
    { idx: 11, loopDay: 44, phase: 'harness', part: 0, text: GORGE.replace('The Redactor', 'The Influencer').replace('1,200', '730') },
  ];
  const s = gh.summarizeGorgeDelivery(gh.classifyGorgeDelivery(lines, markers));
  return s.awayGorgeLines === 2 && s.awayLingerEndDays === 1 && s.totalLingerEndDays === 1;
})());
check('revised: drift-off groups into its own linger-endDay', (() => {
  const markers = [
    { idx: 8, kind: 'pre-endday', loopDay: 44, part: 0, inside: false, mx: 4, my: 8, tile: 'grove', atHaven: false },
    { idx: 20, kind: 'pre-endday', loopDay: 45, part: 0, inside: true, mx: 4, my: 4, tile: 'haven', atHaven: true },
  ];
  const lines = [
    { idx: 10, loopDay: 44, phase: 'harness', part: 0, text: GORGE },
    { idx: 22, loopDay: 45, phase: 'sleep', part: 0, text: DRIFTOFF },
  ];
  const s = gh.summarizeGorgeDelivery(gh.classifyGorgeDelivery(lines, markers));
  return s.awayGorgeLines === 1 && s.havenDriftOffLines === 1 && s.awayDriftOffLines === 0
    && s.awayLingerEndDays === 1 && s.havenLingerEndDays === 1 && s.totalLingerEndDays === 2;
})());
check('revised: line with no pre-endday marker is UNGROUPED, not dropped', (() => {
  const markers = [{ idx: 0, kind: 'sleep-start', loopDay: 12, part: 0, inside: false, mx: 7, my: 7, tile: 'forest_floor' }];
  const lines = [{ idx: 10, loopDay: 12, phase: 'sleep', part: 0, text: GORGE }];
  const d = gh.classifyGorgeDelivery(lines, markers);
  const s = gh.summarizeGorgeDelivery(d);
  return d.hits.length === 1 && d.ungrouped.length === 1 && s.ungroupedLines === 1;
})());

// ---- unit leg B: gate/relay scenarios ----
async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'nighttravel-b', fullTelemetry: false });
  const store = sn.newStore();
  sn.installTranscript(Game, store);
  await setupGame(Game);
  return { Game, store };
}
function moveAway(Game) {
  Game.map.px = 0; Game.map.py = 0; Game.location = 'wild';
  if (Game.scholarAtHaven()) throw new Error('moveAway failed: scholarAtHaven still true');
}
function moveHome(Game) {
  Game.map.px = 4; Game.map.py = 4; Game.location = 'village';
  if (!Game.scholarAtHaven()) throw new Error('moveHome failed: scholarAtHaven false');
}
function saidCount(store, re) { return store.lines.filter((l) => re.test(l.text)).length; }
function queueLen(Game) { return ((Game.state || {}).pendingHavenNews || []).length; }
function queuedText(Game, re) { return ((Game.state || {}).pendingHavenNews || []).filter((q) => re.test(q.text)); }
function pantryKcal(Game) {
  const v = Game.state.village || {};
  return (v.pantry || []).reduce((t, p) => t + (p.kcalEach || 0) * (p.units || 0), 0);
}
// stageLingerer: one lingering raider on the treeline. day 10,
// lingerSince 10 = night 0 of the gorge (no drift); lingerSince 3
// = night 7, past the ~6-night clock (drift-off fires).
function stageLingerer(Game, opts) {
  const v = Game.state.village;
  Game.state.scholar.day = 10;
  v.lastRaidDay = 0;
  v.pantry = v.pantry || [];
  if (opts && opts.pantryKcal) v.pantry.push({ kcalEach: 1000, units: 5 });
  const m = Game.spawnWorldMonster('hushwolf', 5, 5, { hp: 40 });
  m.lingering = true;
  m.lingerSince = (opts && opts.lingerSince !== undefined) ? opts.lingerSince : 10;
  return m;
}

(async () => {
  for (const g of ['COMPETENT_FEAST', 'SEATDRIVE', 'PLENTYDEPRI']) {
    if (process.env[g] !== '0') { console.log('FAIL env: ' + g + '=0 required'); process.exit(2); }
  }
  if (process.env.DEPOSITGATE !== '1' || process.env.POLICY !== 'nighttravel'
    || process.env.WOODCARRY !== '1' || process.env.WOODWARM !== '0' || process.env.BANKFOOD !== '1') {
    console.log('FAIL env: substrate gates not set (see header)'); process.exit(2);
  }
  process.env.STRANDNARR = '1';

  // B9 — gorge (got > 0): away says nothing, mechanics run.
  {
    const { Game, store } = await freshGame(49006);
    stageLingerer(Game, { pantryKcal: true });
    const before = pantryKcal(Game);
    moveAway(Game);
    Game.havenGrowthDaily();
    check('gorge: away says 0 nightly lines', saidCount(store, /gorges at the treeline/) === 0, 'lines=' + saidCount(store, /gorges at the treeline/));
    check('gorge: away queues nothing (gate, not relay)', queuedText(Game, /gorges at the treeline/).length === 0);
    check('gorge: away still takes the kcal (mechanics untouched)', pantryKcal(Game) < before, 'before=' + before + ' after=' + pantryKcal(Game));
    check('gorge: away still records the sortie offer', !!(Game.state.lastLingererOffer && Game.state.lastLingererOffer.day === 10), JSON.stringify(Game.state.lastLingererOffer));
    const { Game: G2, store: s2 } = await freshGame(49006);
    stageLingerer(G2, { pantryKcal: true });
    G2.havenGrowthDaily();
    check('gorge: at Haven says the nightly line', saidCount(s2, /gorges at the treeline/) === 1, 'lines=' + saidCount(s2, /gorges at the treeline/));
    check('gorge: at Haven queues nothing', queuedText(G2, /gorges at the treeline/).length === 0);
  }

  // B10 — gorge empty-pantry variant (got == 0).
  {
    const { Game, store } = await freshGame(49006);
    stageLingerer(Game, { pantryKcal: false });
    Game.state.village.pantry = [];
    moveAway(Game);
    Game.havenGrowthDaily();
    check('gorge-empty: away says 0 "circles" lines', saidCount(store, /circles the treeline, sniffing at empty stores/) === 0, 'lines=' + saidCount(store, /circles the treeline, sniffing at empty stores/));
    const { Game: G2, store: s2 } = await freshGame(49006);
    stageLingerer(G2, { pantryKcal: false });
    G2.state.village.pantry = [];
    G2.havenGrowthDaily();
    check('gorge-empty: at Haven says the "circles" line', saidCount(s2, /circles the treeline, sniffing at empty stores/) === 1, 'lines=' + saidCount(s2, /circles the treeline, sniffing at empty stores/));
  }

  // B11 — drift-off: away relays, at Haven says at once.
  {
    const { Game, store } = await freshGame(49006);
    stageLingerer(Game, { pantryKcal: true, lingerSince: 3 });
    const q0 = queueLen(Game);
    moveAway(Game);
    Game.havenGrowthDaily();
    const saidBeforeFlush = saidCount(store, /paces the treeline one last night/);
    check('drift-off: away says no drift-off line', saidBeforeFlush === 0);
    const queued = queuedText(Game, /paces the treeline one last night/);
    check('drift-off: away queues it as kind raid', queued.length === 1
      && queued[0].kind === 'raid',
      'q0=' + q0 + ' q=' + queueLen(Game));
    check('drift-off: away still ends the linger (mechanics untouched)', Game.worldMonsters().every((m) => !m.lingering));
    moveHome(Game);
    Game.flushHavenNews();
    check('drift-off: flush delivers it verbatim on return', saidCount(store, /paces the treeline one last night/) === 1
      && saidCount(store, /The gorge is over — the village outlasted it/) === 1);
    check('drift-off: queue drains', queueLen(Game) === q0);
    // NON-VACUOUS READ: the flush delivery must come FROM the queue —
    // the line was unsaid before flush, queued as kind raid, said
    // exactly once after flush, and the queue drained. On unfixed
    // code this fails at the queue leg (the line was said directly
    // while away, so saidBeforeFlush is 1 and queued is 0).
    check('drift-off: flush delivery came from the queue (non-vacuous)', saidBeforeFlush === 0
      && queued.length === 1 && queued[0].kind === 'raid'
      && saidCount(store, /paces the treeline one last night/) === 1
      && queueLen(Game) === q0,
      'saidBeforeFlush=' + saidBeforeFlush + ' queued=' + queued.length + ' q=' + queueLen(Game));
    const { Game: G2, store: s2 } = await freshGame(49006);
    stageLingerer(G2, { pantryKcal: true, lingerSince: 3 });
    const q02 = queueLen(G2);
    G2.havenGrowthDaily();
    check('drift-off: at Haven says it at once', saidCount(s2, /paces the treeline one last night/) === 1);
    check('drift-off: at Haven queues nothing', queueLen(G2) === q02, 'q=' + queueLen(G2));
  }

  // ---- integration leg (gorgeharness driver) ----
  process.env.STRANDNARR = '1';
  const on = await oneInstance(17021, { days: 60 });
  process.env.STRANDNARR = '0';
  const off = await oneInstance(17021, { days: 60 });
  const key = (inst) => JSON.stringify({
    evenings: inst.evenings.map((e) => [e.loopDay, e.eveningOutcome, e.tile, e.inside,
      e.bankfoodEvening ? [e.bankfoodEvening.mode, e.bankfoodEvening.skip, e.bankfoodEvening.kcalBefore] : null,
      e.bankfoodMorning ? [e.bankfoodMorning.kcalBefore, e.bankfoodMorning.kcalAfterEat] : null]),
    firstUpkeeps: (inst.bankfoodStore.firstUpkeeps || []).map((f) => [f.scholarDay, f.kcal]),
  });
  check('det-gate: ON vs OFF trajectories identical', key(on) === key(off));
  check('det-gate: transcript errs 0', on.transcript.errs === 0, 'errs=' + on.transcript.errs + ' ' + JSON.stringify(on.transcript.errors));
  const a = analyzeInstance(on);
  check('17021 re-pin (current substrate): 0 stranded nights',
    a.stranded.length === 0,
    'stranded=' + JSON.stringify(a.stranded.map((s) => s.loopDay)));
  check('17021 re-pin (current substrate): 60 days, survived',
    on.daysAlive === 60 && on.endReason === 'survived',
    'daysAlive=' + on.daysAlive + ' end=' + on.endReason);
  check('17021 re-pin (current substrate): 0 stranded sleep windows, 0 burst events',
    a.strandedSleepWindows === 0 && a.strandedSleepTallies['burst-event'].windows === 0,
    'sleepWindows=' + a.strandedSleepWindows + ' burstWindows=' + a.strandedSleepTallies['burst-event'].windows);
  check('revised-metric sanity: totals agree across instruments',
    a.revised.totalGorgeLines === a.totals['gorge']
      && a.revised.totalDriftOffLines === a.totals['gorge-driftoff'],
    'revisedGorge=' + a.revised.totalGorgeLines + ' totalsGorge=' + a.totals['gorge']
      + ' revisedDrift=' + a.revised.totalDriftOffLines + ' totalsDrift=' + a.totals['gorge-driftoff']);
  check('revised-metric sanity: linger-endDays account for every gorge/drift-off line',
    a.revised.lingerEndDays.reduce((t, g) => t + g.gorgeLines + g.driftOffLines, 0)
      + a.revised.ungroupedLines
      === a.revised.totalGorgeLines + a.revised.totalDriftOffLines,
    'grouped+ungrouped vs totals mismatch');

  process.env.STRANDNARR = '1';
  const s15003 = await oneInstance(15003, { days: 60 });
  const a15003 = analyzeInstance(s15003);
  const hit16 = (a15003.nonStranded.sleepHits || []).find((h) => h.loopDay === 16 && h.kind === 'word');
  check('non-stranded anchor: 15003 loop-day-16 sleep window has a Word-gets-around line',
    !!hit16, 'sleepHits=' + JSON.stringify((a15003.nonStranded.sleepHits || []).map((h) => [h.loopDay, h.kind])));
  check('non-stranded anchor: that hit fires inside Haven',
    !!hit16 && hit16.position && hit16.position.inside === true,
    JSON.stringify(hit16 && hit16.position));
  console.log('---');
  console.log('gorgeharness proof: ' + (checks - fails) + '/' + checks + ' checks pass');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('PROOF CRASH', e && (e.stack || e)); process.exit(2); });
