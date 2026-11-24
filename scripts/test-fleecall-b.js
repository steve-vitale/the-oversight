// PROOF: the flee-call instrument (sim-fleecall-b, finding #2602 —
// DIAG, no lever). Re-derived 2026-11-24 (adoption run
// fleshout-loop-b-20261124T2130Z) after the 1930Z worker's proof
// test was wiped by a machine restart; the stranded evidence it
// must reproduce says a live staged flee parses 41 = engine 41
// exactly.
//   §1 LIVE staged flee: one harness (seed 7), the lead at 100 HP
//      vs a wave-4 Eulogy with the trick already known (so the
//      learn-first exit cannot fire), fresh mulberry32(19) as
//      opts.rng — the fight ends vFlee (floor) with the engine's own
//      fleeHpFrac 0.41, and the analyzer's log-derived lead HP is 41
//      exactly. Same rng seed twice reproduces the fight exactly.
//   §2 FROZEN DEFINITIONS (unit checks on the analyzer's exports):
//      mHpRemaining, dpr, roundsToKill (incl. dpr=0 -> Infinity),
//      withinOneRound, variant parsing (all four shapes + other),
//      the fleeHpFrac cross-check (pass + fail), lead-HP parsing
//      (last hit wins, heal after it adds, descriptor logName).
//   §3 ANALYZER SELFTEST (child process): green (19/19).
//   §4 ANALYZER ON THE FROZEN CORPUS (child process): B1-B3 pass,
//      0 parse errors, and the headline numbers reproduce the
//      stranded evidence exactly (20/20 classified, 1/20 within one
//      round, medians 19 / 963.5 / 19, variant split 11/9/0/0).
// Live sections run through scripts/sim-harness.js (seeded, full
// src/js list in index.html order, Math.random seeded before eval).
// Staging follows test-aidleave-b.js (fresh mulberry32(rngSeed) per
// fight; trick state set before the fight so each staged attempt is
// a morale flee, not a learn-first withdrawal).
// Usage: node scripts/test-fleecall-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawnSync } = require('child_process');
const { loadGame, setupGame, mulberry32 } = require('./sim-harness');
const A = require('./analyze-fleecall-b');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? ' :: ' + detail : '')); }
}

// ---- §1 live staged flee ----
async function live() {
  console.log('§1 live staged flee');
  const { Game, loadFails } = await loadGame({ seed: 7, mode: 'test' });
  if (loadFails && loadFails.length) { check('live module load', false, loadFails.join('; ')); return; }
  await setupGame(Game);
  const mdef = function (id) { return (Game.data.monsters || []).find(function (m) { return m.id === id; }); };
  const roster = (Game.state.village.roster || []).filter(function (id) { return id !== Game.villagerId; });
  if (roster.length < 1) { check('live need 1+ NPCs', false, 'roster ' + roster.length); return; }
  const vid = roster[0];
  const person = (Game.getPerson ? Game.getPerson(vid) : null) || (Game.vpOf ? Game.vpOf(vid) : null);
  const firstName = person && person.name ? String(person.name).split(' ')[0] : null;
  const logName = (typeof Game.firstRef === 'function') ? Game.firstRef(vid) : null;
  const leadNames = [logName, firstName].filter(function (x) { return !!x; });
  check('§1 lead has a log name the transcript uses', leadNames.length > 0, JSON.stringify(leadNames));
  const eulogy = mdef('eulogy');
  check('§1 eulogy def is wave 4', !!(eulogy && eulogy.wave === 4));
  // Trick known up front: the learn-first exit must not fire, so
  // this staged attempt is a morale flee (floor / hopeless), the
  // population the analyzer classifies.
  Game.state.villagerTricks = Game.state.villagerTricks || {};
  Game.state.villagerTricks.eulogy = true;
  const setHealth = function (v, hp) { ((Game.state.village.health = Game.state.village.health || {}))[v] = hp; };
  const fight = function (rngSeed) {
    setHealth(vid, 100);
    return Game.fieldFight(vid, eulogy, null, { awareness: false, rng: mulberry32(rngSeed) });
  };
  const rec = fight(19);
  check('§1 staged fight ends vFlee (not learn-first)',
    !!rec && rec.outcome === 'vFlee' && !rec.fleeLearn,
    'outcome ' + (rec && rec.outcome) + ', fleeLearn ' + (rec && rec.fleeLearn));
  const engineHp = (rec && rec.fleeHpFrac != null) ? Math.round(rec.fleeHpFrac * 100) : null;
  check('§1 engine fleeHpFrac is 0.41 (lead at 41 HP)',
    rec && rec.fleeHpFrac === 0.41, 'fleeHpFrac ' + (rec && rec.fleeHpFrac));
  const parsed = A.parseLeadHpAtFlee(rec ? rec.log : [], leadNames);
  check('§1 log-derived lead HP parses 41 = engine 41 exactly',
    parsed.hp === 41 && engineHp === 41,
    'parsed ' + parsed.hp + ', engine ' + engineHp + ' (hit-sum ' + parsed.leadHitSum + ', vTaken ' + (rec && rec.vTaken) + ')');
  check('§1 log-derived hit-sum equals the engine vTaken (59)',
    parsed.leadHitSum === 59 && rec && rec.vTaken === 59,
    'hit-sum ' + parsed.leadHitSum + ', vTaken ' + (rec && rec.vTaken));
  check('§1 staged flee classifies floor',
    A.classifyFleeVariant(rec ? rec.log : []) === 'floor',
    'terminal: ' + ((rec && rec.log && rec.log[rec.log.length - 1]) || '(none)'));
  const cc = A.crossCheckFleeHp(parsed.hp, rec ? rec.fleeHpFrac : null);
  check('§1 fleeHpFrac cross-check passes on the staged fight (maxHpEst 100)',
    cc.ok === true && cc.maxHpEst === 100, JSON.stringify(cc));
  const rec2 = fight(19);
  check('§1 same rng seed twice reproduces the fight exactly',
    JSON.stringify(rec) === JSON.stringify(rec2),
    'outcome ' + (rec2 && rec2.outcome) + ', fleeHpFrac ' + (rec2 && rec2.fleeHpFrac));
}

// ---- §2 frozen definitions ----
(function section2() {
  console.log('§2 frozen definitions');
  check('§2 mHpRemaining = mHpStart - mDealt (1047 - 952 = 95)',
    A.mHpRemaining({ mHpStart: 1047, mDealt: 952 }) === 95);
  check('§2 dpr = mDealt / rounds (952 / 8 = 119)',
    A.dprOf({ mDealt: 952, rounds: 8 }) === 119);
  check('§2 dpr=0 -> roundsToKill Infinity (never a division by zero)',
    A.roundsToKill(1029, 0) === Infinity);
  check('§2 roundsToKill ceils (95/119 -> 1; 352/78.9 -> 5)',
    A.roundsToKill(95, 119) === 1 && A.roundsToKill(352, 78.888888) === 5);
  check('§2 withinOneRound: 95 <= 119 true; dpr=0 false; 352 <= 78.9 false',
    A.withinOneRound(95, 119) === true && A.withinOneRound(1029, 0) === false && A.withinOneRound(352, 78.9) === false);
  check('§2 variant hopeless', A.classifyFleeVariant(['R8: Ines sees how this ends — and runs while running still works.']) === 'hopeless');
  check('§2 variant floor (answered-shout prefix)',
    A.classifyFleeVariant(["R2: Dale answered Andrés's shout, but Andrés is past holding — they run while running still works."]) === 'floor');
  check('§2 variant learn',
    A.classifyFleeVariant(['R3: Ana has seen enough — withdraws to report back. (Learn-first: not winnable, not worth the blood.)']) === 'learn');
  check('§2 variant committed-floor',
    A.classifyFleeVariant(['R4: Ingrid is past holding even a finished fight — they run while running still works. (Committed-finish floor)']) === 'committed-floor');
  check('§2 variant other on an unrecognized terminal line',
    A.classifyFleeVariant(['R1: Ana strikes for 14 (986 left)']) === 'other');
  const ccOk = A.crossCheckFleeHp(50, 0.5);
  check('§2 cross-check passes at 50 / 0.5 (maxHpEst 100)',
    ccOk.ok === true && ccOk.maxHpEst === 100, JSON.stringify(ccOk));
  check('§2 cross-check fails when the implied max HP leaves [50, 150]',
    A.crossCheckFleeHp(41, 0.2).ok === false);
  check('§2 cross-check fails on a null fleeHpFrac',
    A.crossCheckFleeHp(41, null).ok === false);
  const logHeal = [
    'R4: Just Fix It hits Ines for 16 (57 left)',
    'R5: Ines stops mid-fight and binds the wound — field medicine, +20 HP.',
    'R5: Just Fix It hits Ines for 12 (65 left)',
  ];
  const pHeal = A.parseLeadHpAtFlee(logHeal, ['Ines']);
  check('§2 heal after a hit is not double-counted (last hit 65, hit-sum 28)',
    pHeal.hp === 65 && pHeal.leadHitSum === 28, JSON.stringify(pHeal));
  const logDesc = [
    'R1: Epitaph hits the man in his 40s, with a long braid for 18 (82 left)',
    'R3: Final Chapter hits the man in his 40s, with a long braid for 21 (41 left)',
  ];
  check('§2 descriptor logName parses (41)',
    A.parseLeadHpAtFlee(logDesc, ['the man in his 40s, with a long braid']).hp === 41);
})();

// ---- §3 + §4 child processes ----
(function sections34() {
  console.log('§3 analyzer selftest');
  const st = spawnSync(process.execPath, [path.join(__dirname, 'analyze-fleecall-b.js'), '--selftest'],
    { encoding: 'utf8', timeout: 120000 });
  check('§3 analyzer --selftest exits 0', st.status === 0, 'status ' + st.status + ' :: ' + (st.stdout || '') + (st.stderr || ''));
  check('§3 analyzer --selftest reports 19 passed, 0 failed',
    /19 passed, 0 failed/.test(st.stdout || ''), (st.stdout || '').trim());

  console.log('§4 analyzer on the frozen corpus');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fleecall-proof-'));
  const outFile = path.join(tmp, 'analysis.json');
  const an = spawnSync(process.execPath,
    [path.join(__dirname, 'analyze-fleecall-b.js'), '--out', outFile],
    { encoding: 'utf8', timeout: 120000 });
  check('§4 analyzer exits 0 on the frozen corpus', an.status === 0, 'status ' + an.status + ' :: ' + (an.stderr || ''));
  let res = null;
  try { res = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch (e) { res = null; }
  check('§4 analyzer output parses', !!res, 'out ' + outFile);
  if (res) {
    const s = res.primary.summary;
    check('§4 B1 passes: 20/20 classified, 0 unclassified',
      res.bars[0].pass === true && s.classifiedN === 20 && s.unclassifiedN === 0, JSON.stringify(res.bars[0]));
    check('§4 B2 passes: pool 20', res.bars[1].pass === true && s.fledN === 20, JSON.stringify(res.bars[1]));
    check('§4 B3 passes: 1/20 within one round (5.0%)',
      res.bars[2].pass === true && s.withinOneRoundN === 1 && s.fledN === 20, JSON.stringify(res.bars[2]));
    check('§4 0 parse errors', (res.parseErrors || []).length === 0, JSON.stringify(res.parseErrors));
    check('§4 medians reproduce: lead HP 19, monster HP remaining 963.5, rounds-to-kill 19 (finite)',
      s.distributions.leadHp.median === 19 && s.distributions.mHpRemaining.median === 963.5 &&
      s.distributions.roundsToKillFinite.median === 19,
      JSON.stringify(s.distributions));
    check('§4 variant split reproduces: 11 hopeless / 9 floor / 0 learn / 0 committed-floor',
      s.variants.hopeless === 11 && s.variants.floor === 9 && s.variants.learn === 0 && s.variants['committed-floor'] === 0,
      JSON.stringify(s.variants));
    check('§4 sharpest case reproduces: 109505 d118 Network Note, 95 HP remaining, 1 round to kill',
      res.primary.table.some(function (t) { return t.seed === 109505 && t.day === 118 && t.mid === 'network_note' && t.mHpRemaining === 95 && t.roundsToKill === 1 && t.withinOneRound === true; }),
      JSON.stringify(res.primary.table.filter(function (t) { return t.seed === 109505 && t.day === 118; })));
    check('§4 correlations reproduce: lead HP ~ monster HP remaining -0.64',
      s.correlations[0].r === -0.64, JSON.stringify(s.correlations));
  }
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
})();

async function main() {
  await live();
  console.log(fail === 0 ? 'ALL PASS' : fail + ' FAILURES');
  process.exitCode = fail === 0 ? 0 : 1;
}
if (require.main === module) main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
