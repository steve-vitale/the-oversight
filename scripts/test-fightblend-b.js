// test-fightblend-b.js — proof for sim-fightblend-b (the NUMERATOR-AWARE
// shape): the field-fight stay-or-flee call reads the HP TRAJECTORY as if
// worn protection were 4 — a parallel hypothetical HP that falls by
// protection-4-mitigated incoming, with the morale read run on that
// hypothetical HP and the P4 incoming rate. Candidate (b) read fully raw
// (protection 0) and over-fled (53002 Kieran flees at 2 rounds / 82 HP);
// the middle shape judged only the denominator at protection 4 and
// under-fled (53002 byte-identical to baseline, never hopeless; unit leg
// splits by protection) — the gap is the HP trajectory itself. Judge
// numerator + denominator together at 4: the C1 value the 53002 fight was
// won under. Legs (LEG=unit|fight53002|all, default all):
//   unit      — the same scripted field fight at protection 3 vs 5 must
//               give an IDENTICAL hopeless/flee outcome while vTaken
//               differs (and vTakenP4 is identical and > vTaken, and the
//               hypothetical HP left is identical).
//               Fails on unfixed code (the two protections diverge in
//               outcome), passes on fixed code. Each protection runs in
//               its own child process so the roster/fighter is identical.
//   fight53002 — the 53002 Kieran day-4 fight in the pilot corpora:
//               baseline reproduces the P2 shape (10r, vKill, ~13 HP),
//               candidate returns the C1 shape (vFlee, fleeHopeless,
//               5-7 rounds, HP 35-60 — loose bar, expected 43: the body
//               still wears protection 5, only the judgment imagines 4).
//               Reads the corpora, not a harness.
// Usage:
//   LEG=unit node scripts/test-fightblend-b.js   (pre-fix: expect FAIL)
//   node scripts/test-fightblend-b.js            (post-sweep: all green)
//   node scripts/test-fightblend-b.js --unit-fight --prot 3   (child mode)
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const K = require('./godpath/lib');

let pass = 0, fail = 0;
const fails = [];
function ok(label, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + label); }
  else { fail++; fails.push(label); console.log('  FAIL ' + label + (extra ? ' — ' + extra : '')); }
}

// --- fixture (calibrated on unfixed code, seed 53002) ---
// First adult non-scholar fighter, HP 70, sharpened_stick (wb 3),
// cliffhanger pack 1, rng () => 0.5, intent 'fight', no allies.
// The fighter must OWN the gear (p.items): villagerGearUp re-equips
// inside the fight, so .equipped set directly is overwritten and the
// fixture silently runs at protection 0.
// Unfixed calibration (this run, master 93e7bea26): prot 3 -> vFlee,
// 2 rounds, vTaken 22, 48 HP left, hopeless; prot 5 -> vKill, 8 rounds,
// vTaken 63, 7 HP left, never hopeless. (Same as the fightloop-b and
// midshape-a calibrations — the fixture is stable across the rebases.)
const FIXTURE = { seed: 53002, hp: 70, weapon: 'sharpened_stick', monster: 'cliffhanger' };
const ARMOR = { 3: 'rain_poncho', 5: 'good_boots' };

async function oneUnitFight(prot) {
  const storage = new Map();
  globalThis.localStorage = { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, String(v)), removeItem: k => storage.delete(k), key: i => [...storage.keys()][i] ?? null, get length() { return storage.size; } };
  const G = await K.load({ seed: FIXTURE.seed });
  G.tbfight = null; G.over = false; G.won = false; K.newRun(G);
  const s = G.state.scholar, v = G.state.village;
  const id = v.roster.find(x => x !== G.villagerId && G.npcAge(x) >= 18);
  s.day = 4; G.state.systemArrived = true; v.party = [];
  v.npcAbilities = { [id]: [] };
  v.health = { [id]: FIXTURE.hp };
  G.npcNeeds(id).hunger = 0;
  const p = G.getPerson(id);
  p.items = [FIXTURE.weapon, ARMOR[prot]];
  p.backgroundAbilities = [];
  p.equipped = {};
  const def = { ...G.data.monsters.find(x => x.id === FIXTURE.monster), pack: 1 };
  const rec = G.fieldFight(id, def, null, { intent: 'fight', rng: () => 0.5 });
  const S = globalThis.S || {};
  const varmor = (S.equipment && S.equipment.armorOf) ? S.equipment.armorOf(p, G.data.items) : null;
  return {
    prot: varmor, outcome: rec.outcome, rounds: rec.rounds,
    vTaken: rec.vTaken, mDealt: rec.mDealt, vHpLeft: rec.vHpLeft,
    vTakenP4: (rec.vTakenP4 != null) ? rec.vTakenP4 : null,
    vHpHypoLeft: (rec.vHpHypoLeft != null) ? rec.vHpHypoLeft : null,
    fleeHopeless: !!rec.fleeHopeless, fleeHpFrac: rec.fleeHpFrac,
    everHopeless: !!rec.everHopeless, everWinning: !!rec.everWinning,
  };
}

function runUnitLeg() {
  console.log('\n[unit] scripted fight at protection 3 vs 5 (seed 53002, cliffhanger, HP 70)');
  const out = {};
  for (const prot of [3, 5]) {
    const raw = execFileSync(process.execPath, [__filename, '--unit-fight', '--prot', String(prot)], { cwd: REPO, encoding: 'utf8' });
    out[prot] = JSON.parse(raw.trim().split('\n').pop());
    console.log('  prot ' + prot + ': ' + JSON.stringify(out[prot]));
  }
  const a = out[3], b = out[5];
  ok('unit: worn protection is 3 vs 5 as fixture intends', a.prot === 3 && b.prot === 5, JSON.stringify({ p3: a.prot, p5: b.prot }));
  ok('unit: outcome identical across protections', a.outcome === b.outcome, JSON.stringify({ p3: a.outcome, p5: b.outcome }));
  ok('unit: rounds identical across protections', a.rounds === b.rounds, JSON.stringify({ p3: a.rounds, p5: b.rounds }));
  ok('unit: fleeHopeless identical across protections', a.fleeHopeless === b.fleeHopeless, JSON.stringify({ p3: a.fleeHopeless, p5: b.fleeHopeless }));
  ok('unit: vTaken differs (armor still absorbs)', a.vTaken !== b.vTaken, JSON.stringify({ p3: a.vTaken, p5: b.vTaken }));
  ok('unit: vTakenP4 recorded on both legs', a.vTakenP4 != null && b.vTakenP4 != null, JSON.stringify({ p3: a.vTakenP4, p5: b.vTakenP4 }));
  ok('unit: vTakenP4 identical across protections (same blows, fixed-4 read)', a.vTakenP4 != null && a.vTakenP4 === b.vTakenP4, JSON.stringify({ p3: a.vTakenP4, p5: b.vTakenP4 }));
  ok('unit: vTakenP4 exceeds worn-5 taken (protection 4 absorbs less than 5)', a.vTakenP4 > b.vTaken, JSON.stringify({ p3: [a.vTakenP4, a.vTaken], p5: [b.vTakenP4, b.vTaken] }));
  ok('unit: vTakenP4 below worn-3 taken (protection 4 absorbs more than 3)', a.vTakenP4 != null && a.vTakenP4 < a.vTaken, JSON.stringify({ p3: [a.vTakenP4, a.vTaken], p5: [b.vTakenP4, b.vTaken] }));
  ok('unit: vHpHypoLeft recorded on both legs', a.vHpHypoLeft != null && b.vHpHypoLeft != null, JSON.stringify({ p3: a.vHpHypoLeft, p5: b.vHpHypoLeft }));
  ok('unit: vHpHypoLeft identical across protections (same hypothetical trajectory)', a.vHpHypoLeft != null && a.vHpHypoLeft === b.vHpHypoLeft, JSON.stringify({ p3: a.vHpHypoLeft, p5: b.vHpHypoLeft }));
}

function rootFight(corpusDir, run) {
  const file = path.join(corpusDir, 'combatdiv-b-s53002-' + run + '.json');
  if (!fs.existsSync(file)) throw new Error('missing corpus: ' + file);
  const b = JSON.parse(fs.readFileSync(file, 'utf8'));
  const f = (b.fieldFights || []).find(x => x.fighterName === 'Kieran Lorenz' && x.mid === 'cliffhanger' && x.day === 4);
  if (!f) throw new Error('53002 root fight not found in ' + file);
  return { file: file, days: b.days, fight: f };
}

function runFight53002Leg() {
  console.log('\n[fight53002] 53002 Kieran day-4 fight, baseline vs candidate corpora');
  const base = rootFight(path.join(REPO, 'evidence', '2026-11-08', 'perseed-fightblend-b-baseline'), 'fightblend-b-baseline');
  const cand = rootFight(path.join(REPO, 'evidence', '2026-11-08', 'perseed-fightblend-b-candidate'), 'fightblend-b-candidate');
  console.log('  baseline : ' + JSON.stringify(base.fight));
  console.log('  candidate: ' + JSON.stringify(cand.fight));
  const bf = base.fight, cf = cand.fight;
  ok('53002: baseline reproduces the P2 shape (10r, vKill, ~13 HP)', bf.outcome === 'vKill' && bf.rounds === 10 && bf.vHpLeft === 13 && bf.vTaken === 87,
    JSON.stringify({ outcome: bf.outcome, rounds: bf.rounds, vTaken: bf.vTaken, vHpLeft: bf.vHpLeft }));
  ok('53002: candidate returns the C1 shape (vFlee, fleeHopeless)', cf.outcome === 'vFlee' && cf.fleeHopeless === true,
    JSON.stringify({ outcome: cf.outcome, fleeHopeless: cf.fleeHopeless }));
  ok('53002: candidate rounds 5-7 (C1: 6)', cf.rounds >= 5 && cf.rounds <= 7, JSON.stringify({ rounds: cf.rounds }));
  ok('53002: candidate HP left 35-60 (loose bar; expected 43 — body still wears prot 5)', cf.vHpLeft >= 35 && cf.vHpLeft <= 60, JSON.stringify({ vHpLeft: cf.vHpLeft }));
  // All 8 root fights present in both corpora (reporting completeness).
  // Roots are each seed's FIRST field fight (gseq 1) on THIS master
  // (93e7bea26) — verified identical to midshape-a's roots on 6680d7924
  // by this run's baseline leg (see the prereg's reproduction note).
  // The gseq-1 identity is fixed before the first morale decision, so
  // the candidate corpus must contain the same 8 fights; only their
  // outcomes may move. The 53002 assertions above stay as preregistered.
  const roots = {
    53001: ['Declan Baumann', 'hushwolf', 8], 53002: ['Kieran Lorenz', 'cliffhanger', 4],
    53003: ['Jorge Silva', 'lockpick_raccoon', 4], 53004: ['David Kim', 'hushwolf', 6],
    53005: ['Robin Gordon', 'nightcourt', 5], 53006: ['Rosa Mendez', 'gallowdeer', 5],
    53007: ['Diego Miranda', 'nightcourt', 7], 53008: ['Frank Giordano', 'sanjun', 5],
  };
  for (const [seed, [name, mid, day]] of Object.entries(roots)) {
    for (const [leg, run] of [['baseline', 'fightblend-b-baseline'], ['candidate', 'fightblend-b-candidate']]) {
      const f = path.join(REPO, 'evidence', '2026-11-08', 'perseed-fightblend-b-' + leg, 'combatdiv-b-s' + seed + '-' + run + '.json');
      if (!fs.existsSync(f)) { ok('root fights: ' + leg + ' corpus seed ' + seed + ' present', false, 'missing ' + f); continue; }
      const bb = JSON.parse(fs.readFileSync(f, 'utf8'));
      const rf = (bb.fieldFights || []).find(x => x.fighterName === name && x.mid === mid && x.day === day);
      ok('root fights: ' + leg + ' seed ' + seed + ' ' + name + ' vs ' + mid + ' present', !!rf,
        rf ? JSON.stringify({ outcome: rf.outcome, rounds: rf.rounds, vTaken: rf.vTaken, vHpLeft: rf.vHpLeft }) : 'not found');
    }
  }
}

(async () => {
  const args = process.argv.slice(2);
  if (args.includes('--unit-fight')) {
    const prot = Number((args[args.indexOf('--prot') + 1]) || 3);
    const r = await oneUnitFight(prot);
    console.log(JSON.stringify(r));
    return;
  }
  const leg = process.env.LEG || 'all';
  if (leg === 'unit' || leg === 'all') runUnitLeg();
  if (leg === 'fight53002' || leg === 'all') runFight53002Leg();
  console.log('\ntest-fightblend-b: ' + pass + ' passed, ' + fail + ' failed');
  if (fail) console.log('failing: ' + fails.join(' | '));
  process.exitCode = fail ? 1 : 0;
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
