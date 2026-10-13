#!/usr/bin/env node
// scripts/test-standing-20261013.js — proof test for the Standing bar
// (flesh-out r18, Steve 2026-10-13: the flexible route — one bar, three
// sources; waves 4-5 unlock on Standing; full seat drops the scale rung;
// win flag has a day-90 hard floor).
//
// Proves on a REAL Game instance (sim-harness, seeded):
//   (1) standing math: war/diplomacy/plenty sources, per-type cap retained,
//       unseasoned/low-trust links don't count, thin feasts don't count.
//   (2) unlock thresholds: T4=100 via war / diplomacy / plenty / hybrid;
//       below-threshold stays locked; T5=200 + wave-4-faced; waves 1-3
//       unchanged.
//   (3) win floor: no win before day 90; deferral keeps the table in play
//       (phase back to 'paths', no won/over).
//   (4) deedGateReady: full seat reachable without national (scale rung
//       dropped); wave/contest/crisis bars intact.
//   (5) live smoke: 20-day competent run, no crash, standingLine sane.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

const W3 = ['redactor', 'gavel', 'focus_group', 'spool'];
const W4 = ['congregation', 'strike', 'influencer'];
const W5 = ['cancellation', 'editor'];

function resetStanding(Game) {
  // fresh ledger / links / feasts / faced-deeds, same game instance
  delete Game.state.waveLedger;
  try { Game.hierarchyState().length = 0; } catch (e) {}
  Game.state.feastLog = [];
  const d = Game.deedState();
  d.wavesFaced = {};
  d.contestsSurvived = 0;
  Game.progState().crises = {};
}

function seasonLink(Game, trust) {
  const day = (Game.state.scholar || {}).day || 1;
  Game.hierarchyState().push({
    status: 'active', kind: 'vassal', primary: 'haven',
    subordinate: 'v' + Math.floor(Math.random() * 1e9),
    day: day - 31, trust: trust == null ? 50 : trust,
  });
}

(async () => {
  const { Game } = await loadGame({ seed: 20261013, mode: 'proof' });
  await setupGame(Game, 'Columbus, Ohio');
  Game.state.scholar.day = 100;

  // ---------- (1) standing math ----------
  resetStanding(Game);
  let s = Game.villageStanding();
  ok('fresh standing is 0', s.total === 0 && s.war === 0 && s.diplomacy === 0 && s.plenty === 0, JSON.stringify(s));

  Game.recordWaveKill('redactor'); Game.recordWaveKill('redactor');
  Game.recordWaveKill('gavel'); Game.recordWaveKill('gavel');
  ok('ledger scores 4 wave-3 points', Game.waveLedgerPoints(3) === 4, 'got ' + Game.waveLedgerPoints(3));
  s = Game.villageStanding();
  ok('war: 4 pts x 25 = 100', s.war === 100 && s.warPts === 4 && s.total === 100, JSON.stringify(s));

  Game.recordWaveKill('redactor'); Game.recordWaveKill('redactor'); Game.recordWaveKill('redactor');
  ok('per-type cap 2 retained (7 kills, still 4 pts)', Game.waveLedgerPoints(3) === 4, 'got ' + Game.waveLedgerPoints(3));

  seasonLink(Game); seasonLink(Game); seasonLink(Game);
  s = Game.villageStanding();
  ok('diplomacy: 3 seasoned links x 34 = 102', s.diplomacy === 102 && s.links === 3, JSON.stringify(s));
  // unseasoned + low-trust links must not count
  Game.hierarchyState().push({ status: 'active', kind: 'vassal', primary: 'haven', subordinate: 'vx1', day: 96, trust: 90 });
  Game.hierarchyState().push({ status: 'active', kind: 'vassal', primary: 'haven', subordinate: 'vx2', day: 50, trust: 20 });
  s = Game.villageStanding();
  ok('unseasoned/low-trust links excluded', s.links === 3, JSON.stringify(s.links));

  Game.state.feastLog = [{ day: 10, quality: 2 }, { day: 20, quality: 1 }, { day: 30, quality: 0 }];
  s = Game.villageStanding();
  ok('plenty: 2 major feasts x 20 = 40 (thin feast excluded)', s.plenty === 40 && s.feasts === 2, JSON.stringify(s));
  ok('total = 100 + 102 + 40 = 242', s.total === 242, 'got ' + s.total);
  ok('standingLine reads honestly', /Standing 242/.test(Game.standingLine()), Game.standingLine());

  // ---------- (2) unlock thresholds ----------
  resetStanding(Game);
  Game.state.scholar.day = 100;
  // below threshold: 3 kills (75) + 1 feast (20) = 95, no wave-2 points
  Game.recordWaveKill('redactor'); Game.recordWaveKill('redactor');
  Game.recordWaveKill('gavel');
  Game.state.feastLog = [{ day: 50, quality: 1 }];
  ok('95 standing: wave 4 stays locked', Game.unlockedWave() === 1, 'got wave ' + Game.unlockedWave() + ', standing ' + Game.villageStandingTotal());

  // T4 via war: 4 pts = 100
  resetStanding(Game);
  Game.recordWaveKill('redactor'); Game.recordWaveKill('redactor');
  Game.recordWaveKill('gavel'); Game.recordWaveKill('gavel');
  ok('T4 via war (100)', Game.unlockedWave() === 4, 'got wave ' + Game.unlockedWave());

  // T4 via diplomacy: 3 links = 102
  resetStanding(Game);
  seasonLink(Game); seasonLink(Game); seasonLink(Game);
  ok('T4 via diplomacy (102)', Game.unlockedWave() === 4, 'got wave ' + Game.unlockedWave());

  // T4 via plenty: 5 feasts = 100
  resetStanding(Game);
  Game.state.feastLog = [1, 2, 3, 4, 5].map(d => ({ day: d * 10, quality: 1 }));
  ok('T4 via plenty (100)', Game.unlockedWave() === 4, 'got wave ' + Game.unlockedWave());

  // T4 via hybrid: 2 kills (50) + 1 link (34) + 1 feast (20) = 104
  resetStanding(Game);
  Game.recordWaveKill('redactor'); Game.recordWaveKill('gavel');
  seasonLink(Game);
  Game.state.feastLog = [{ day: 60, quality: 2 }];
  ok('T4 via hybrid (104)', Game.unlockedWave() === 4, 'got wave ' + Game.unlockedWave() + ', standing ' + Game.villageStandingTotal());

  // T5: 200 + wave-4 faced
  resetStanding(Game);
  for (const id of W3) { Game.recordWaveKill(id); Game.recordWaveKill(id); } // 4 types x 2 = 8 pts = 200
  ok('standing 200 built', Game.villageStandingTotal() === 200, 'got ' + Game.villageStandingTotal());
  ok('200 without wave-4 faced: wave 4, not 5', Game.unlockedWave() === 4, 'got wave ' + Game.unlockedWave());
  Game.deedState().wavesFaced = { congregation: 4 };
  ok('200 + wave-4 faced: wave 5', Game.unlockedWave() === 5, 'got wave ' + Game.unlockedWave());
  resetStanding(Game);
  for (const id of W3.slice(0, 3)) { Game.recordWaveKill(id); Game.recordWaveKill(id); } // 6 pts
  Game.recordWaveKill(W3[3]); // 7 pts = 175
  Game.deedState().wavesFaced = { congregation: 4, strike: 4 };
  ok('175 + wave-4 faced: still wave 4', Game.unlockedWave() === 4, 'got wave ' + Game.unlockedWave());

  // waves 1-3 unchanged (standing 0)
  resetStanding(Game);
  Game.state.scholar.day = 30;
  for (const id of ['voice_mimic_radio', 'mirror_stag', 'review_drone']) { Game.recordWaveKill(id); Game.recordWaveKill(id); }
  Game.recordWaveKill('voice_mimic_radio'); // capped at 2 -> 5 pts... 2+2+1=5
  ok('wave-2 bar still 5 pts -> wave 3 at day 30', Game.unlockedWave() === 3, 'got wave ' + Game.unlockedWave() + ', pts2=' + Game.waveLedgerPoints(2));
  resetStanding(Game);
  Game.state.scholar.day = 100;
  ok('standing 0, no points: wave 1', Game.unlockedWave() === 1, 'got wave ' + Game.unlockedWave());

  // ---------- (3) win floor ----------
  Game.state.scholar.day = 89;
  ok('day 89: floor blocks', Game.winDayFloorOk() === false);
  Game.state.scholar.day = 90;
  ok('day 90: floor passes', Game.winDayFloorOk() === true);
  const said = [];
  const realSay = Game.say;
  Game.say = (t) => said.push(String(t));
  const T = { phase: 'challenge' };
  Game.winDayFloorDefer(T);
  Game.say = realSay;
  ok('deferral: phase back to paths', T.phase === 'paths');
  ok('deferral: no win, no game-over', !Game.won && !Game.over);
  ok('deferral: says the wait aloud', said.some(t => /Ninety days/.test(t)), said.join(' | ').slice(0, 120));

  // ---------- (4) deedGateReady: scale rung dropped ----------
  resetStanding(Game);
  const faced = {};
  ['bulldozer', 'hushwolf', 'gallowdeer', 'mirrormoth', 'belltoad'].forEach(id => faced[id] = 1);
  ['voice_mimic_radio', 'mirror_stag', 'review_drone', 'bright_idea', 'memory_projector'].forEach(id => faced[id] = 2);
  ['redactor', 'gavel', 'focus_group', 'spool'].forEach(id => faced[id] = 3);
  W4.forEach(id => faced[id] = 4);
  W5.forEach(id => faced[id] = 5);
  Game.deedState().wavesFaced = faced;
  Game.deedState().contestsSurvived = 3;
  Game.progState().crises = { a: 1, b: 1, c: 1 };
  // scaleRank default is 'village' (no flags set) — the old gate needed national
  const dg = Game.deedGateReady();
  ok('full seat without national (scale rung dropped)', dg.ok === true && dg.scale === false,
    JSON.stringify({ ok: dg.ok, scale: dg.scale, rank: dg.rank }));
  // bars intact: drop a wave-5 distinct -> not ok
  delete faced['editor'];
  Game.deedState().wavesFaced = faced;
  const dg2 = Game.deedGateReady();
  ok('wave bars intact (w5 1/2 -> not ok)', dg2.ok === false && dg2.waves === false);

  // ---------- (5) live smoke ----------
  const { Game: G2 } = await loadGame({ seed: 77, mode: 'proof' });
  await setupGame(G2, 'Columbus, Ohio');
  const r = await runDays(G2, competent, { days: 20 });
  ok('20-day live run completes', r && r.days >= 1, 'days=' + (r && r.days));
  ok('standingLine sane mid-run', typeof G2.standingLine() === 'string' && /Standing \d+/.test(G2.standingLine()), G2.standingLine());

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
