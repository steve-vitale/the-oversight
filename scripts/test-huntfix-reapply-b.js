#!/usr/bin/env node
// scripts/test-huntfix-reapply-b.js — proof test for the engine-side hunt-detector
// wiring fix (sim-huntfix-reapply-b; findings #492/#535 lineage, huntroster-b named
// fix spec option 1).
//
// The engine's own hunt detectors referenced GHOST occupations:
//   - villagerCompetence(vid,'hunt') 1.4x fired only on 'infantry soldier'
//     (the word list 'hunter','tracker','ranger','soldier','marine','poacher'
//     matches exactly one occupation in either person table);
//   - villagerHuntResolve's +20% (formerOccupation.includes('hunter'))
//     fired on ZERO persons in either table ('Hunting guide' does not
//     contain 'hunter') — dead code.
// The fix (spec §1, data-driven): huntTier 1.4|1.2 on the 14 hunt-relevant
// characterGen.json occupations, read via occupationId in both detectors.
//
// PART A — REAL RED→GREEN fixtures (fast, harness-loaded Game):
//   F1  hunting_guide scores 1.4x via occupationId            (RED before)
//   F2  +20% fires for hunting_guide (the 'Old hands' note on a real kill)
//                                                          (RED before)
//   F3  infantry soldier still 1.4x                        (green before+after)
//   F4  ER nurse unchanged at 1.0                         (green before+after)
//   F5  1.2 tier: farmer/butcher preserved at 1.2 (green before+after);
//       fisherman/veterinarian/mortician 1.0 -> 1.2        (RED before)
//   F6  1.4 tier: fishing_guide/rancher/exterminator/trail_crew/forager/
//       pilot 1.0 -> 1.4                                   (RED before)
//   F7  1.2 tier does NOT get the +20% (butcher kill: note null)
//                                                          (green before+after)
//   F8  infantry soldier +20% note (RED before: includes('hunter') never
//       matched 'infantry soldier' either)                       (RED→GREEN)
// PART B — det-gate: with the fix's data present and the HUNTSTAFF gate
// OFF, trajectories are byte-identical to the pristine control tree
// (8 seeds x {leadfeast,belongfeast} x 60d). Any divergence is a wiring
// leak; the taskLeadsDays lens documents the untouched-path premise (the
// hunt path is unreachable with the staffing layer off — no assignments,
// no task-lead hunts on bot policies).
//
// Usage:
//   node scripts/test-huntfix-reapply-b.js            # Part A only (fast)
//   PART=b node scripts/test-huntfix-reapply-b.js      # Part B det-gate (slow)
//   PART=all node scripts/test-huntfix-reapply-b.js    # both
// Part B env: CTLROOT (default ~/workspace/worktrees/sim-huntfix-reapply-b-ctl),
// DETSEEDS, DETDAYS.
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PART = process.env.PART || 'a';

let failures = 0;
function check(name, cond, detail) {
  if (cond) { console.log(`  ok   ${name}`); }
  else { failures++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

async function partA() {
  console.log('PART A — detector fixtures (RED→GREEN)');
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 31501, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state || {}).village || {}).roster || [];
  check('roster non-empty', roster.length >= 10, `roster=${roster.length}`);

  // dress(vid, occId, occName): give a roster villager an occupation, steady
  // temperament (isolates the occupation term from the temperament term).
  function dress(vid, occId, occName) {
    const p = Game.getPerson(vid);
    if (!p) throw new Error('no person ' + vid);
    p.formerOccupation = occName;
    p.occupationId = occId;
    p.personality = p.personality || {};
    p.personality.temperament = 'steady';
    return p;
  }
  const comp = (vid) => Game.villagerCompetence(vid, 'hunt');

  // F1: hunting_guide -> 1.4 via occupationId
  dress(roster[0], 'hunting_guide', 'hunting guide');
  check('F1 hunting_guide competence 1.4', comp(roster[0]) === 1.4, `got ${comp(roster[0])}`);

  // F6: the rest of the 1.4 tier
  const tier14 = [
    ['fishing_guide', 'fishing guide'], ['rancher', 'Rancher'],
    ['exterminator', 'exterminator'], ['trail_crew', 'trail crew lead'],
    ['forager', 'Wild food forager'], ['pilot', 'bush pilot'],
  ];
  tier14.forEach(([id, name], i) => {
    const vid = roster[1 + i];
    dress(vid, id, name);
    check(`F6 ${id} competence 1.4`, comp(vid) === 1.4, `got ${comp(vid)}`);
  });

  // F3: infantry soldier still 1.4 (the one case that worked before)
  dress(roster[7], 'soldier', 'infantry soldier');
  check('F3 infantry soldier competence 1.4', comp(roster[7]) === 1.4, `got ${comp(roster[7])}`);

  // F4: ER nurse unchanged at 1.0
  dress(roster[8], 'er_nurse', 'ER nurse');
  check('F4 ER nurse competence 1.0', comp(roster[8]) === 1.0, `got ${comp(roster[8])}`);

  // F5: 1.2 tier (farmer/butcher on roster[9..10]; fisherman/vet/mortician
  // reuse slots after the kill fixtures — competence reads are stateless)
  const tier12a = [
    [9, 'farmer', 'farmer'], [10, 'butcher', 'Butcher'], [11, 'fisherman', 'Fisherman'],
  ];
  for (const [ri, id, name] of tier12a) {
    dress(roster[ri], id, name);
    check(`F5 ${id} competence 1.2`, comp(roster[ri]) === 1.2, `got ${comp(roster[ri])}`);
  }

  // F2/F7/F8: the +20% hunter bonus via villagerHuntResolve's 'Old hands' note.
  // Force Math.random -> 0 so the stalk always lands (chance > 0 for every
  // difficulty); the note is only set when isHunter fired on a real kill.
  const realRandom = Math.random;
  function forcedKill(vid) {
    Math.random = () => 0;
    try { return Game.villagerHuntResolve(vid, 1.0); }
    finally { Math.random = realRandom; }
  }
  const r1 = forcedKill(roster[0]); // hunting_guide
  check('F2 hunting_guide kill landed (fixture real)', r1 && r1.kcal > 0, JSON.stringify(r1 && { kcal: r1.kcal, msg: (r1.msg || '').slice(0, 60) }));
  check("F2 hunting_guide +20% note fires", r1 && r1.note === "Old hands. They've done this before.", `note=${JSON.stringify(r1 && r1.note)}`);

  const r7 = forcedKill(roster[10]); // butcher (1.2 tier)
  check('F7 butcher kill landed (fixture real)', r7 && r7.kcal > 0, `kcal=${r7 && r7.kcal}`);
  check('F7 butcher (1.2) gets NO +20% note', r7 && r7.note === null, `note=${JSON.stringify(r7 && r7.note)}`);

  const r8 = forcedKill(roster[7]); // infantry soldier
  check('F8 soldier kill landed (fixture real)', r8 && r8.kcal > 0, `kcal=${r8 && r8.kcal}`);
  check("F8 soldier +20% note fires", r8 && r8.note === "Old hands. They've done this before.", `note=${JSON.stringify(r8 && r8.note)}`);

  // F5b: the remaining 1.2 tier, reusing slots (competence reads are stateless)
  dress(roster[9], 'veterinarian', 'Veterinarian');
  check('F5 veterinarian competence 1.2', comp(roster[9]) === 1.2, `got ${comp(roster[9])}`);
  dress(roster[11], 'mortician', 'Mortician');
  check('F5 mortician competence 1.2', comp(roster[11]) === 1.2, `got ${comp(roster[11])}`);

  // name-fallback: a person with NO occupationId but a matching name still
  // resolves (old-save / unhydrated-seed path — mirrors hydrateSeed).
  const pfb = Game.getPerson(roster[8]); // the ER nurse
  pfb.occupationId = null;
  pfb.formerOccupation = 'hunting guide';
  check('F9 name-fallback hunting guide -> 1.4', comp(roster[8]) === 1.4, `got ${comp(roster[8])}`);
  pfb.formerOccupation = 'ER nurse';
  check('F9b name-fallback ER nurse -> 1.0', comp(roster[8]) === 1.0, `got ${comp(roster[8])}`);
}

function partB() {
  console.log('PART B — det-gate (fix present, HUNTSTAFF off vs pristine control)');
  const ctl = process.env.CTLROOT || path.join(process.env.HOME || '/home/hatch', 'workspace', 'worktrees', 'sim-huntfix-reapply-b-ctl');
  const seeds = (process.env.DETSEEDS || '31501,31502,31503,31504,31505,31506,31507,31508').split(',').map(s => s.trim());
  const days = process.env.DETDAYS || '60';
  const outBase = process.env.DETOUT || path.join(ROOT, 'evidence', '2026-10-19', 'detgate-huntfix-reapply-b');
  const fs = require('fs');
  const sweep = path.join(ROOT, 'scripts', 'sweep-huntfix-reapply-b.js');
  for (const [arm, root] of [['control', ctl], ['armed', ROOT]]) {
    const out = path.join(outBase, arm);
    console.log(`  running ${arm} (root=${root})...`);
    execFileSync(process.execPath, [sweep], {
      cwd: ROOT,
      env: { ...process.env, SWEEPROOT: root, ARMS: arm, SEEDS: seeds.join(','), DAYS: days, OUT: out,
             FEASTSCALE_R13: '1', SEATDRIVE: '0', HUNTSTAFF_LAYER: '0', RUN_ID: 'huntfix-detgate' },
      stdio: 'inherit',
    });
  }
  // compare: strip provenance fields, byte-identical JSON per seed×policy
  const strip = (o) => {
    const c = JSON.parse(JSON.stringify(o));
    delete c.arm; delete c.runId; delete c.rootHead; delete c.schema;
    return JSON.stringify(c);
  };
  const fs2 = require('fs');
  let total = 0, identical = 0, huntLeads = 0;
  for (const s of seeds) for (const p of ['leadfeast', 'belongfeast']) {
    const f0 = path.join(outBase, 'control', `control-${p}-s${s}.json`);
    const f1 = path.join(outBase, 'armed', `armed-${p}-s${s}.json`);
    total++;
    const a = JSON.parse(fs2.readFileSync(f0, 'utf8'));
    const b = JSON.parse(fs2.readFileSync(f1, 'utf8'));
    huntLeads += (a.huntTaskLeadDays || 0) + (b.huntTaskLeadDays || 0);
    if (strip(a) === strip(b)) { identical++; }
    else { console.log(`  DIVERGE control/armed ${p} s${s}`); failures++; }
  }
  check(`det-gate byte-identical trajectories ${identical}/${total}`, identical === total, '');
  console.log(`  hunt task-lead days across det-gate runs: ${huntLeads} (untouched-path premise)`);
}

(async () => {
  try {
    if (PART === 'a' || PART === 'all') await partA();
    if (PART === 'b' || PART === 'all') partB();
  } catch (e) {
    failures++;
    console.log('  FAIL harness error — ' + (e && e.message));
  }
  console.log(failures ? `RESULT: ${failures} FAILURES` : 'RESULT: ALL GREEN');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
