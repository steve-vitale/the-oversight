#!/usr/bin/env node
// scripts/test-succdeath-20261016.js — proof for scripts/succdeath-20261016.js
// (loop B sim-succdeath-b, 2026-10-16, food-economy axis; #390 fast-death
// attribution instrument)
//
// PART A — pure fixtures (classifyCause + attribFast accounting):
//   A1 'combat' -> combat; A2 'villager combat' -> villager-combat (not
//      combat — match order); A3 'alien_beam' -> monster; A4 'starvation'
//      -> starvation; A5 'dehydration' -> starvation; A6 'injuries' ->
//      wound; A7 "a wound that wouldn't close" -> wound; A8 'the trembles'
//      -> disease; A9 'lockjaw' -> disease; A10 'the phoenix link (broken)'
//      -> other; A11 'the wild' -> other; A12 'your own pit trap' ->
//      combat; A13 ''/null -> null (unattributable); A14 'the expedition'
//      -> combat; A15 'the arena' -> combat
//   A16 attribFast: complete fast event -> attributed
//   A17 attribFast: missing exitDay -> not attributed
//   A18 attribFast: causeClass null -> not attributed
//   A19 attribFast: state null -> not attributed
//   A20 gate-off wraps nothing (5 wrapped refs unchanged, stub track)
//
// PART B — det-gate (live engine): 2 policies x 2 seeds = 4 pairs; each
//   pair compares INSTR-ON vs INSTR-OFF per-dawn ledger hashes — 4/4
//   trajectory-identity required (the sweep substrate: FEASTSCALE_R13=1,
//   TRIBFLOOR=1, SUCCGRACE=1, RAIDDENSITY=1, WINPURSUIT=1, WINDEFER=1,
//   SEATDRIVE=0).
//
// SMOKE=1 — instrument honesty on the live engine (leadseat, s307, 60d):
//   armed, 0 instrument errors, player deaths recorded with causes,
//   mantle log populated, successions have names, uninstall restores all
//   wraps.
//
// Node harness: sim-harness (Math.random seeded BEFORE eval; Game.save never
// stubbed). Never run concurrent jest; --cacheDirectory=/tmp/jest-cache-*.
//
// Usage: node scripts/test-succdeath-20261016.js
//        SMOKE=1 node scripts/test-succdeath-20261016.js
'use strict';

const SMOKE = process.env.SMOKE === '1';
let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

function substrateEnv() {
  process.env.SUCCDEATH = '1';
  process.env.FEASTSCALE_R13 = '1';
  process.env.TRIBFLOOR = '1';
  process.env.SUCCGRACE = '1';
  process.env.RAIDDENSITY = '1';
  process.env.WINPURSUIT = '1';
  process.env.WINDEFER = '1';
  process.env.SEATDRIVE = '0';
}
substrateEnv();
const { installSuccDeath, attribFast, classifyCause } = require('./succdeath-20261016');

function baseFast(over) {
  return Object.assign({
    vid: 'v9', name: 'Testy', initial: false,
    mantleDay: 40, exitDay: 41, exitType: 'death', cause: 'combat',
    causeClass: 'combat', daysInOffice: 1, fast: true,
    reArmedBeforeDeath: false, stateSource: 'row',
    state: { day: 41, cumNet: -300, voluntaryNet: -100, voluntaryNet7: 0,
      mealShare: 0.9, mealKcal: 270, volTakeKcal: 30, cumTakes: 300 },
  }, over || {});
}

function partA() {
  console.log('PART A — classifyCause / attribFast fixtures');
  const cc = [
    ['A1 combat -> combat', 'combat', 'combat'],
    ['A2 villager combat -> villager-combat', 'villager combat', 'villager-combat'],
    ['A3 alien_beam -> monster', 'alien_beam', 'monster'],
    ['A4 starvation -> starvation', 'starvation', 'starvation'],
    ['A5 dehydration -> starvation', 'dehydration', 'starvation'],
    ['A6 injuries -> wound', 'injuries', 'wound'],
    ["A7 wound-text -> wound", "a wound that wouldn't close", 'wound'],
    ['A8 the trembles -> disease', 'the trembles', 'disease'],
    ['A9 lockjaw -> disease', 'lockjaw', 'disease'],
    ['A10 phoenix link -> other', 'the phoenix link (broken)', 'other'],
    ['A11 the wild -> other', 'the wild', 'other'],
    ['A12 pit trap -> combat', 'your own pit trap', 'combat'],
    ['A13 empty -> null', '', null],
    ['A13b null -> null', null, null],
    ['A14 the expedition -> combat', 'the expedition', 'combat'],
    ['A15 the arena -> combat', 'the arena', 'combat'],
    ['A16 the hunt -> combat', 'the hunt', 'combat'],
    ['A17 raid-defense -> combat', 'raid-defense', 'combat'],
    ['A18 aid-runner -> other', 'aid-runner', 'other'],
  ];
  for (const [name, raw, want] of cc) {
    const got = classifyCause(raw);
    check(name, got === want, `got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
  }
  let a = attribFast(baseFast());
  check('A19 complete fast event -> attributed', a.attributed === true, a.notes.join(','));
  a = attribFast(baseFast({ exitDay: null }));
  check('A20 missing exitDay -> not attributed', !a.attributed, a.notes.join(','));
  a = attribFast(baseFast({ causeClass: null }));
  check('A21 causeClass null -> not attributed', !a.attributed, a.notes.join(','));
  a = attribFast(baseFast({ state: null }));
  check('A22 state null -> not attributed', !a.attributed, a.notes.join(','));
  a = attribFast(baseFast({ causeClass: 'other', cause: 'aid-runner' }));
  check('A23 other-with-raw-cause -> attributed', a.attributed === true, a.notes.join(','));
  a = attribFast(baseFast({ exitDay: 42, exitType: 'office-exit', cause: 'office-exit', causeClass: 'other' }));
  check('A24 office-exit -> attributed', a.attributed === true, a.notes.join(','));
  // A25: gate-off installs nothing
  process.env.SUCCDEATH = '';
  const G = {
    recordTakeHist() {}, recordGiveHist() {}, registerDeath() {}, playerDeath() {},
    state: { scholar: { day: 3 }, village: {} },
  };
  const refs = [G.recordTakeHist, G.recordGiveHist, G.registerDeath, G.playerDeath];
  const t = installSuccDeath(G);
  const same = refs[0] === G.recordTakeHist && refs[1] === G.recordGiveHist &&
    refs[2] === G.registerDeath && refs[3] === G.playerDeath;
  let dawnOk = true;
  try { t.dawn(G); t.finalize(); t.uninstall(); } catch (e) { dawnOk = false; }
  check('A25 gate-off wraps nothing (byte-identical by construction)', !t.on && same && dawnOk);
  substrateEnv();
}

async function partB() {
  console.log('PART B — det-gate: trajectory-identity (4 pairs, pre-seat substrate)');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const SD = require('./policies/seatdrive');
  const POLICIES = { leadfeast: SD.leadseat, belongfeast: SD.belongseat };

  async function runHashes(policyId, seed, instrMode) {
    process.env.SUCCDEATH = instrMode === 'on' ? '1' : '';
    const { Game } = await loadGame({ seed, mode: 'sd-' + policyId + '-' + instrMode, fullTelemetry: false });
    await setupGame(Game);
    const track = installSuccDeath(Game);
    const hs = [];
    const base = POLICIES[policyId];
    const policy = Object.assign({}, base);
    const od = base.daily;
    policy.daily = (G, ctx) => {
      if (track && track.on) track.dawn(G);
      try {
        const s = G.state.scholar || {}, v = G.state.village || {};
        const m = (o) => Object.keys(o || {}).sort().map(k => k + '=' + Math.round(o[k])).join(',');
        hs.push([s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
          (v.roster || []).length, m(v.trust), m(v.takes), m(v.gives)].join('|'));
      } catch (e) { hs.push('ERR'); }
      if (od) return od(G, ctx);
    };
    await quietLog(async () => { await runDays(Game, policy, { days: 30 }); });
    if (track) { try { track.dawn(Game); } catch (e) {} track.uninstall(); }
    return hs.join('\n');
  }

  let ok = 0;
  for (const pid of Object.keys(POLICIES)) {
    for (const seed of [307, 418]) {
      const gateOff = await runHashes(pid, seed, 'off');
      const gateOn = await runHashes(pid, seed, 'on');
      const ident = gateOff === gateOn;
      if (ident) ok++;
      check(`B det-gate ${pid} s${seed} (off==on)`, ident,
        ident ? 'byte-identical' : 'GATE-ON DIVERGED');
    }
  }
  console.log(`  det-gate: ${ok}/4 trajectory-identity pairs`);
  if (ok !== 4) failures++;
}

async function smoke() {
  console.log('SMOKE — instrument honesty (leadseat, s307, 60d)');
  substrateEnv();
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const SD = require('./policies/seatdrive');
  const { Game } = await loadGame({ seed: 307, mode: 'sd-smoke', fullTelemetry: false });
  await setupGame(Game);
  const refs = [Game.recordTakeHist, Game.recordGiveHist, Game.registerDeath, Game.playerDeath];
  const track = installSuccDeath(Game);
  check('smoke armed (gate on)', track.on === true);
  check('smoke install wraps all four', refs[0] !== Game.recordTakeHist && refs[1] !== Game.recordGiveHist &&
    refs[2] !== Game.registerDeath && refs[3] !== Game.playerDeath);
  const base = SD.leadseat;
  const policy = Object.assign({}, base);
  const od = base.daily;
  policy.daily = (G, ctx) => { track.dawn(G); if (od) return od(G, ctx); };
  await quietLog(async () => { await runDays(Game, policy, { days: 60 }); });
  track.dawn(Game);
  const fin = track.finalize();
  check('smoke 0 instrument errors', fin.errors.length === 0, fin.errors.slice(0, 3).join(' | '));
  check('smoke mantle log populated', Object.keys(track.mantleDay).length >= 1,
    `vids=${Object.keys(track.mantleDay).length}`);
  const pd = track.deaths.filter(d => d.player);
  check('smoke player deaths recorded with causes', pd.length > 0 && pd.every(d => d.cause != null),
    `playerDeaths=${pd.length}`);
  check('smoke successions carry names', fin.successions.every(e => e.name != null || e.vid != null));
  const agg = fin.aggregate;
  check('smoke aggregate fields present', typeof agg.nSuccessions === 'number' && typeof agg.go === 'boolean',
    JSON.stringify({ nSucc: agg.nSuccessions, nFast: agg.nFast }));
  track.uninstall();
  const same = refs[0] === Game.recordTakeHist && refs[1] === Game.recordGiveHist &&
    refs[2] === Game.registerDeath && refs[3] === Game.playerDeath;
  check('smoke uninstall restores all wraps', same);
}

async function main() {
  partA();
  await partB();
  if (SMOKE) await smoke();
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
