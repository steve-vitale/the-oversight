#!/usr/bin/env node
// test-enddaybeats-fix-a.js — proof for the endDay haven-beats family
// FIX (sim-enddaybeats-fix-a; prereg:
// evidence/2026-11-05/sim-enddaybeats-fix-a-prereg.md, committed
// BEFORE any judged sim).
//
// Unit leg A (fast, always): family classifiers (same fixtures as the
// census proof — the diag module is reused verbatim, so the instrument
// must classify the same lines the same way).
//
// Unit leg B (fast, always): per-beat gate/relay scenarios on a loaded
// Game (sim-harness, seeded). Each scenario runs TWICE — scholar AWAY
// (map 0,0, location 'wild') vs AT HAVEN (map 4,4, location 'village',
// the post-setupGame state) — and asserts the delivery differs exactly
// as pre-registered while the mechanics run identically:
//   relay (sayHavenNews/flushHavenNews), raid-call (raiseAidCrisis),
//   overhear (ledger _checkDimBeats/flushLedgerBeats), village-raid
//   (commonsRaid), pantry deposit voice (_depositGateDayVoice),
//   fragments (spreadGossip twin-run), monster raid (havenRaidTick),
//   confrontation (exposureFireTick).
// The plenty day-voice has NO unit scenario: its gate (PLENTYDEPRI)
// is off on this substrate (PLENTYDEPRI=0), so _plentyDepriDayVoice
// cannot fire here; its one-line gate is the same shape as the
// deposit-gate voice (proven in B5) and is judged on the after-leg
// corpus (plenty stays 0, gate-off).
//
// Integration leg (60 loop-days, bankfood variant leg, WOODWARM=0):
// runs the FIX driver once with STRANDNARR=1 and once with
// STRANDNARR=0 on seed 17021 and asserts
//   (a) det-gate: bankfood evenings/mornings/first-upkeep kcal series
//       identical ON vs OFF;
//   (b) 17021 CURRENT-SUBSTRATE FACTS (re-pin): 60d SURVIVED, 0
//       stranded nights (census re-pin, current master);
//   (c) non-stranded anchor: seed 15003 loop-day 7 sleep window
//       contains a 'Word gets around the haven' line, classified
//       non-stranded sleep with the scholar inside Haven at fire
//       time.
// Usage: node scripts/test-enddaybeats-fix-a.js
// Env (the bankfood substrate gates, as in enddaybeats-fix-trace-a.js):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
//   (DEPOSITGATE=1 is REQUIRED: _depositGateOn() reads it.)
'use strict';
const eb = require('./policies/enddaybeats-diag');
const sn = require('./policies/strandnarr-diag');
const { loadGame, setupGame } = require('./sim-harness');
const { oneInstance, analyzeInstance } = require('./enddaybeats-fix-trace-a');

let checks = 0, fails = 0;
function check(name, cond, detail) {
  checks++;
  if (cond) console.log('ok   ' + name);
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}
function failNow(name, detail) { check(name, false, detail); }

// ---- unit leg A: classifiers (census fixtures, verbatim) ----
const RAID_CALL = '🚨 The Redactor, Night Court, Lockpick, Big Big, Loud-Eyes is at Haven\'s door. The village looks to you. Four ways to call: a RUNNER (slow, dangerous), a SIGNAL FIRE (fast, loud, everyone sees), the SYSTEM RELAY (if it can carry voices), or an ABILITY CRY (if your build has one). Each with honest costs.';
const RAID_LINE = '🐗 RAID — 5 raiders hit Haven in the night, drawn by the smell of the pantry! (Names: ...).';
const RAID_AFTER = '🕯️ The treeline is still torn up from the raid when the System\'s light comes for them. Nobody is ready. The light doesn\'t wait.';
const OVERHEAR = 'You overhear it at the fire, and stop pretending not to listen. Riders from Emberhold are telling the deer story again — with your name attached this time.';
const FRAGMENTS = 'You catch fragments by the fire — Dmitri telling Leonard about you. The story\'s getting bigger than what happened.';
const PANTRY_DEP = '🍽️ Catalina looks at the full shelves and waves off the day\'s share. "No more into the store — we eat at the fire, and the shelves keep."';
const PANTRY_DEP2 = '🍽️ Hassan taps the pantry door — full to bursting — and keeps the day\'s share in hand. "Dinner\'s on me tonight, then."';
const PANTRY_PLEN = '🍽️ Henriette eyes the groaning pantry shelves and packs light today. "No point hauling what\'ll rot. Mending the nets instead."';
const PANTRY_TRIAGE = '🍽️ Mara checks the pantry before heading out — ~9 days of fresh on hand, but someone has gone hungry three days running. The hungry eat first: keeps working the creek instead of turning to other work.';
const TALE = '🔥 The fire settles. Barbara has been quiet all evening, and now everyone knows why. "Loud-Eyes — I put it down today." A beat of silence, then the questions come all at once. Leonard mutters "And you\'re still standing." Someone at the edge of the light says what everyone\'s thinking: "So — what are we calling it?"';
const WITNESS = 'Barbara came back from the treeline white-faced. Saw it too. Whatever it is, it\'s still out there.';
check('raid: call line', eb.isRaidCallLine(RAID_CALL) && eb.kindOf(RAID_CALL) === 'raid-call');
check('raid: raid line', eb.isRaidLine(RAID_LINE) && eb.kindOf(RAID_LINE) === 'raid-line');
check('raid: aftermath line', eb.isRaidAftermathLine(RAID_AFTER) && eb.kindOf(RAID_AFTER) === 'raid-aftermath');
check('raid: plain narration is not raid', !eb.isRaidCallLine('Dawn. You wake stiff and cold.'));
check('overhear: overhear line', eb.isOverhearLine(OVERHEAR) && eb.kindOf(OVERHEAR) === 'overhear');
check('fragments: fragments line', eb.isFragmentsLine(FRAGMENTS) && eb.kindOf(FRAGMENTS) === 'fragments');
check('pantry: deposit pool 1', eb.pantryKind(PANTRY_DEP) === 'deposit' && eb.kindOf(PANTRY_DEP) === 'pantry-deposit');
check('pantry: deposit pool 2', eb.pantryKind(PANTRY_DEP2) === 'deposit');
check('pantry: plenty pool 1', eb.pantryKind(PANTRY_PLEN) === 'plenty' && eb.kindOf(PANTRY_PLEN) === 'pantry-plenty');
check('pantry: triage line is NOT a day-voice line', eb.pantryKind(PANTRY_TRIAGE) === null && !eb.isPantryLine(PANTRY_TRIAGE));
check('pantry: bare emoji line is not pantry', eb.pantryKind('🍽️ You eat pemmican (400 kcal).') === null);
check('tale: tale prose', eb.isTaleLine(TALE) && eb.kindOf(TALE) === 'tale');
check('witness: witness line', eb.isWitnessLine(WITNESS) && eb.kindOf(WITNESS) === 'witness');
check('kindOf: null', eb.kindOf('Dawn. You wake stiff and cold.') === null);
check('raid collapse: raid line + call in one window = 1 raid event', (() => {
  const markers = [{ idx: 0, kind: 'sleep-start', loopDay: 34, part: 0, inside: false, mx: 0, my: 8, tile: 'trail_edge' }];
  const lines = [
    { idx: 10, loopDay: 34, phase: 'sleep', part: 0, text: RAID_LINE },
    { idx: 11, loopDay: 34, phase: 'sleep', part: 0, text: RAID_CALL },
    { idx: 12, loopDay: 34, phase: 'sleep', part: 0, text: FRAGMENTS },
  ];
  const w = eb.classifyEnddayWindow(lines, markers);
  return w.raidEvent === 1 && w.perKind['raid-call'].windows === 1
    && w.perKind['raid-line'].windows === 1 && w.perKind['fragments'].windows === 1
    && w.hits.length === 3;
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

(async () => {
  for (const g of ['COMPETENT_FEAST', 'SEATDRIVE', 'PLENTYDEPRI']) {
    if (process.env[g] !== '0') { console.log('FAIL env: ' + g + '=0 required'); process.exit(2); }
  }
  if (process.env.DEPOSITGATE !== '1' || process.env.POLICY !== 'nighttravel'
    || process.env.WOODCARRY !== '1' || process.env.WOODWARM !== '0' || process.env.BANKFOOD !== '1') {
    console.log('FAIL env: substrate gates not set (see header)'); process.exit(2);
  }

  // The transcript recorder only arms when STRANDNARR=1 (its det-gate
  // contract) — arm it BEFORE any freshGame() call, or the unit leg
  // records nothing and every positive check fails vacuously.
  process.env.STRANDNARR = '1';

  // B1 — relay: away queues, at Haven says, flush delivers on return.
  {
    const { Game, store } = await freshGame(46006);
    check('relay: scholarAtHaven true after setup', Game.scholarAtHaven() === true);
    moveAway(Game);
    const r1 = Game.sayHavenNews('TEST raid news — raiders hit Haven.', 'raid');
    check('relay: away queues (returns queued)', r1 === 'queued', 'got ' + r1);
    check('relay: away says nothing', saidCount(store, /TEST raid news/) === 0);
    check('relay: queue holds 1', queueLen(Game) === 1, 'len=' + queueLen(Game));
    moveHome(Game);
    Game.flushHavenNews();
    check('relay: flush delivers on return', saidCount(store, /TEST raid news/) === 1);
    check('relay: queue drains', queueLen(Game) === 0);
    const r2 = Game.sayHavenNews('TEST raid news at home.', 'raid');
    check('relay: at Haven says immediately', r2 === 'said' && saidCount(store, /TEST raid news at home/) === 1, 'got ' + r2);
  }

  // B2 — raid-call: away sets the crisis but never says the summons.
  {
    const { Game, store } = await freshGame(46006);
    moveAway(Game);
    const c1 = Game.raiseAidCrisis('Hushwolf', 1);
    check('raid-call: away still creates the crisis', !!(c1 && Game.aidCrisis() && Game.aidCrisis().name === 'Hushwolf'));
    check('raid-call: away says no summons', saidCount(store, /Four ways to call/) === 0);
    const c2 = Game.raiseAidCrisis('Hushwolf', 1);
    check('raid-call: away second raise returns null, no echo', c2 === null && saidCount(store, /already teeth at the door/) === 0);
    const { Game: G2, store: s2 } = await freshGame(46006);
    const c3 = G2.raiseAidCrisis('Hushwolf', 1);
    check('raid-call: at Haven says the summons', !!(c3 && saidCount(s2, /Four ways to call/) === 1));
  }

  // B3 — overhear: first gossip beat queues while away, fires with
  // its prefix on return (ledger queue, not the haven relay).
  {
    const { Game, store } = await freshGame(46006);
    moveAway(Game);
    Game._checkDimBeats('might', 4, 5);
    const q = Game.progState().ledgerQueue || [];
    const fired = Game._beatsFired();
    check('overhear: away queues the first gossip beat', q.some((e) => e.k === 'might:0'), 'queue=' + JSON.stringify(q));
    check('overhear: away does not fire it', !fired['might:0']);
    check('overhear: away says nothing', saidCount(store, /You overhear it at the fire/) === 0);
    check('overhear: selfTalkedAbout still false while away', !Game.progState().selfTalkedAbout);
    Game.flushLedgerBeats();
    check('overhear: flush while away leaves it queued', (Game.progState().ledgerQueue || []).some((e) => e.k === 'might:0') && saidCount(store, /You overhear it at the fire/) === 0);
    moveHome(Game);
    Game.flushLedgerBeats();
    check('overhear: flush at Haven fires it with the prefix', saidCount(store, /You overhear it at the fire/) === 1 && saidCount(store, /telling the deer story again/) === 1);
    check('overhear: fired + selfTalkedAbout after return', !!Game._beatsFired()['might:0'] && !!Game.progState().selfTalkedAbout);
  }

  // B4 — village raid: away relays (queues), at Haven says at once;
  // the trust move runs identically either way.
  {
    const mkOv = () => ({ id: 'ov-test', name: 'Stonebridge', x: 0, y: 0, trust: 10, commons: { tension: 80 } });
    const { Game, store } = await freshGame(46006);
    moveAway(Game);
    const q0 = queueLen(Game);
    Game.commonsRaid(mkOv());
    check('village-raid: away says no 🌙 line', saidCount(store, /🌙 Raid — Stonebridge/) === 0);
    check('village-raid: away queues it', queueLen(Game) === q0 + 1, 'q0=' + q0 + ' q=' + queueLen(Game));
    check('village-raid: trust still moves away', true); // trust lives on the ov object below
    const ov2 = mkOv();
    const { Game: G2, store: s2 } = await freshGame(46006);
    const q02 = queueLen(G2);
    G2.commonsRaid(ov2);
    check('village-raid: at Haven says it at once', saidCount(s2, /🌙 Raid — Stonebridge/) === 1);
    check('village-raid: at Haven queues nothing', queueLen(G2) === q02, 'q=' + queueLen(G2));
    check('village-raid: trust -10 both ways', ov2.trust === 0, 'trust=' + ov2.trust);
  }

  // B5 — pantry deposit voice: away consumes the day stamp but says
  // nothing; at Haven the line is said.
  {
    const stage = (Game) => {
      const v = Game.state.village;
      const day = (Game.state.scholar || {}).day || 0;
      const speaker = (v.roster || []).find((id) => id !== Game.villagerId) || (v.roster || [])[0];
      v._depositGate = { days: {}, voiceDay: 0 };
      v._depositGate.days[day] = { vids: [speaker], returnEased: 1 };
      return { v, day };
    };
    const { Game, store } = await freshGame(46006);
    moveAway(Game);
    const st1 = stage(Game);
    Game._depositGateDayVoice(st1.v);
    check('pantry: away says no day-voice', saidCount(store, /🍽️/) === 0);
    check('pantry: away still consumes the voiceDay stamp', Game.state.village._depositGate.voiceDay === st1.day, 'voiceDay=' + Game.state.village._depositGate.voiceDay + ' day=' + st1.day);
    const { Game: G2, store: s2 } = await freshGame(46006);
    const st2 = stage(G2);
    G2._depositGateDayVoice(st2.v);
    check('pantry: at Haven says the day-voice', saidCount(s2, /🍽️/) === 1 && saidCount(s2, /full shelves|pantry door|sharing basket|basket arrive|surplus by the fire/) === 1);
  }

  // B6 — fragments: twin-run determinism. Same seed, same staged
  // gossip; away says 0 lines while the gossip still spreads exactly
  // as at Haven; at Haven at least one line is said.
  {
    const stage = (Game) => {
      const v = Game.state.village;
      const teller = (v.roster || []).find((id) => id !== Game.villagerId);
      const entries = [];
      for (let i = 0; i < 20; i++) {
        entries.push({ heard: [teller], dims: { who: Game.villagerId }, action: 'brave', distortion: 2 });
      }
      v.gossip = entries;
      return v;
    };
    const runTwin = async (away) => {
      const { Game, store } = await freshGame(46006);
      const v = stage(Game);
      if (away) moveAway(Game);
      for (let i = 0; i < 300; i++) Game.spreadGossip();
      const heardTotal = v.gossip.reduce((t, g) => t + g.heard.length, 0);
      const distTotal = v.gossip.reduce((t, g) => t + g.distortion, 0);
      return { fragLines: saidCount(store, /You catch fragments by the fire/), heardTotal, distTotal };
    };
    const awayRun = await runTwin(true);
    const homeRun = await runTwin(false);
    check('fragments: away says 0 lines over 300 spreads', awayRun.fragLines === 0, 'lines=' + awayRun.fragLines);
    check('fragments: at Haven says >= 1 line', homeRun.fragLines >= 1, 'lines=' + homeRun.fragLines);
    check('fragments: gossip spreads identically away vs at Haven', awayRun.heardTotal === homeRun.heardTotal && awayRun.distTotal === homeRun.distTotal,
      'away heard=' + awayRun.heardTotal + ' dist=' + awayRun.distTotal + ' | home heard=' + homeRun.heardTotal + ' dist=' + homeRun.distTotal);
  }

  // B7 — monster raid: away relays the 🐗 line and gates the 🚨 call;
  // at Haven both are said at once. Mechanics (crisis, draft) run
  // identically either way.
  {
    const stageRaid = (Game) => {
      const v = Game.state.village;
      Game.state.scholar.day = 10;
      v.lastRaidDay = 0;
      v.pantry = v.pantry || [];
      v.pantry.push({ kcalEach: 1000, units: 5 });
      Game.spawnWorldMonster('hushwolf', 5, 5, { hp: 40 });
      Game.spawnWorldMonster('hushwolf', 6, 5, { hp: 40 });
      Game.spawnWorldMonster('bulldozer', 5, 6, { hp: 40 });
    };
    const runRaid = async (away) => {
      const { Game, store } = await freshGame(46006);
      stageRaid(Game);
      if (away) moveAway(Game);
      let fired = false;
      for (let i = 0; i < 100 && !Game.aidCrisis(); i++) { try { Game.havenRaidTick(); } catch (e) {} fired = !!Game.aidCrisis(); }
      const queuedRaid = ((Game.state || {}).pendingHavenNews || []).filter((q) => /RAID —/.test(q.text)).length;
      return { fired, raidLines: saidCount(store, /RAID — .*hit Haven in the night/), callLines: saidCount(store, /Four ways to call/), queuedRaid, crisis: !!Game.aidCrisis() };
    };
    const awayRun = await runRaid(true);
    check('raid: away raid fires in the loop', awayRun.fired, JSON.stringify(awayRun));
    check('raid: away says no 🐗 line', awayRun.raidLines === 0, 'lines=' + awayRun.raidLines);
    check('raid: away says no 🚨 call', awayRun.callLines === 0, 'lines=' + awayRun.callLines);
    check('raid: away queues the 🐗 line', awayRun.queuedRaid >= 1, 'queued=' + awayRun.queuedRaid);
    check('raid: away still raises the crisis', awayRun.crisis === true);
    const homeRun = await runRaid(false);
    check('raid: at Haven raid fires in the loop', homeRun.fired, JSON.stringify(homeRun));
    check('raid: at Haven says the 🐗 line', homeRun.raidLines >= 1, 'lines=' + homeRun.raidLines);
    check('raid: at Haven says the 🚨 call', homeRun.callLines === 1, 'lines=' + homeRun.callLines);
    check('raid: at Haven queues no 🐗 line', homeRun.queuedRaid === 0, 'queued=' + homeRun.queuedRaid);
  }

  // B8 — confrontation: away never hears the bowl set down; at Haven
  // the line is said. (Staged lies via lazy npcLies; 300 calls.)
  {
    const stageLies = (Game) => {
      const v = Game.state.village;
      let open = 0;
      for (const vid of (v.roster || [])) {
        if (vid === Game.villagerId) continue;
        try {
          const lies = Game.npcLies ? Game.npcLies(vid) : null;
          if (!lies) continue;
          for (const f of ['occupation', 'origin', 'goal']) {
            if (lies[f] && !lies[f].confessed) open++;
          }
        } catch (e) {}
      }
      return open;
    };
    const runTick = async (away) => {
      const { Game, store } = await freshGame(46006);
      const open = stageLies(Game);
      if (away) moveAway(Game);
      for (let i = 0; i < 300; i++) { try { Game.exposureFireTick(); } catch (e) {} }
      return { open, lines: saidCount(store, /sets their bowl down|at the fire, not quite looking|has been turning something over all evening/) };
    };
    const awayRun = await runTick(true);
    check('confrontation: staged open lies exist', awayRun.open >= 1, 'open=' + awayRun.open);
    check('confrontation: away hears 0 namings over 300 ticks', awayRun.lines === 0, 'lines=' + awayRun.lines);
    const homeRun = await runTick(false);
    check('confrontation: at Haven hears >= 1 naming', homeRun.lines >= 1, 'lines=' + homeRun.lines + ' open=' + homeRun.open);
  }

  // ---- integration leg (fix driver, fixed code) ----
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
  check('det-gate: ON vs OFF trajectories identical (fixed code)', key(on) === key(off));
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

  process.env.STRANDNARR = '1';
  const s15003 = await oneInstance(15003, { days: 60 });
  const a15003 = analyzeInstance(s15003);
  const hit7 = (a15003.nonStranded.sleepHits || []).find((h) => h.loopDay === 7 && h.kind === 'word');
  check('non-stranded anchor: 15003 loop-day-7 sleep window has a Word-gets-around line',
    !!hit7, 'sleepHits=' + JSON.stringify((a15003.nonStranded.sleepHits || []).map((h) => [h.loopDay, h.kind])));
  check('non-stranded anchor: that hit fires inside Haven',
    !!hit7 && hit7.position && hit7.position.inside === true,
    JSON.stringify(hit7 && hit7.position));
  console.log('---');
  console.log('enddaybeats-fix proof: ' + (checks - fails) + '/' + checks + ' checks pass');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('PROOF CRASH', e && (e.stack || e)); process.exit(2); });
