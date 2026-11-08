// test-fightloop-fix-b.js — proof for sim-fightloop-b (candidate (b),
// hopeless-decoupling): the field-fight stay-or-flee call reads RAW
// (unmitigated) incoming damage, so worn protection changes HP taken but
// not the decision. Legs (LEG=unit|fight53002|all, default all):
//   unit      — the same scripted field fight at protection 3 vs 5 must
//               give an IDENTICAL hopeless/flee outcome while vTaken
//               differs (and vTakenRaw is identical and > vTaken).
//               Fails on unfixed code (the two protections diverge in
//               outcome), passes on fixed code. Each protection runs in
//               its own child process so the roster/fighter is identical.
//   fight53002 — the 53002 Kieran day-4 fight in the pilot corpora:
//               baseline reproduces the P2 shape (10r, vKill, ~13 HP),
//               candidate returns the C1 shape (vFlee, fleeHopeless,
//               5-7 rounds, HP 30-45). Reads the corpora, not a harness.
// Usage:
//   LEG=unit node scripts/test-fightloop-fix-b.js   (pre-fix: expect FAIL)
//   node scripts/test-fightloop-fix-b.js            (post-sweep: all green)
//   node scripts/test-fightloop-fix-b.js --unit-fight --prot 3   (child mode)
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
    vTaken: rec.vTaken, vHpLeft: rec.vHpLeft,
    vTakenRaw: (rec.vTakenRaw != null) ? rec.vTakenRaw : null,
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
  ok('unit: vTakenRaw recorded on both legs', a.vTakenRaw != null && b.vTakenRaw != null, JSON.stringify({ p3: a.vTakenRaw, p5: b.vTakenRaw }));
  ok('unit: vTakenRaw identical across protections (same blows)', a.vTakenRaw != null && a.vTakenRaw === b.vTakenRaw, JSON.stringify({ p3: a.vTakenRaw, p5: b.vTakenRaw }));
  ok('unit: vTakenRaw exceeds vTaken (armor absorbed something)', a.vTakenRaw > a.vTaken && b.vTakenRaw > b.vTaken, JSON.stringify({ p3: [a.vTakenRaw, a.vTaken], p5: [b.vTakenRaw, b.vTaken] }));
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
  const base = rootFight(path.join(REPO, 'evidence', '2026-11-08', 'perseed-fightloop-b-baseline'), 'fightloop-b-baseline');
  const cand = rootFight(path.join(REPO, 'evidence', '2026-11-08', 'perseed-fightloop-b-candidate'), 'fightloop-b-candidate');
  console.log('  baseline : ' + JSON.stringify(base.fight));
  console.log('  candidate: ' + JSON.stringify(cand.fight));
  const bf = base.fight, cf = cand.fight;
  ok('53002: baseline reproduces the P2 shape (10r, vKill, ~13 HP)', bf.outcome === 'vKill' && bf.rounds === 10 && bf.vHpLeft === 13 && bf.vTaken === 87,
    JSON.stringify({ outcome: bf.outcome, rounds: bf.rounds, vTaken: bf.vTaken, vHpLeft: bf.vHpLeft }));
  ok('53002: candidate returns the C1 shape (vFlee, fleeHopeless)', cf.outcome === 'vFlee' && cf.fleeHopeless === true,
    JSON.stringify({ outcome: cf.outcome, fleeHopeless: cf.fleeHopeless }));
  ok('53002: candidate rounds 5-7 (C1: 6)', cf.rounds >= 5 && cf.rounds <= 7, JSON.stringify({ rounds: cf.rounds }));
  ok('53002: candidate HP left 30-45 (C1: 38)', cf.vHpLeft >= 30 && cf.vHpLeft <= 45, JSON.stringify({ vHpLeft: cf.vHpLeft }));
  // All 8 root fights present in both corpora (reporting completeness).
  const roots = {
    53001: ['Mara Vasquez', 'hushwolf', 3], 53002: ['Kieran Lorenz', 'cliffhanger', 4],
    53003: ['Jorge Silva', 'lockpick_raccoon', 4], 53004: ['Nora Wilson', 'anaconda_empress', 7],
    53005: ['Robin Gordon', 'nightcourt', 5], 53006: ['David ONeill', 'drumbelly_tanuki', 7],
    53007: ['Diego Miranda', 'nightcourt', 7], 53008: ['Hassan Ali', 'cliffhanger', 5],
  };
  for (const [seed, [name, mid, day]] of Object.entries(roots)) {
    for (const [leg, run] of [['baseline', 'fightloop-b-baseline'], ['candidate', 'fightloop-b-candidate']]) {
      const f = path.join(REPO, 'evidence', '2026-11-08', 'perseed-fightloop-b-' + leg, 'combatdiv-b-s' + seed + '-' + run + '.json');
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
  console.log('\ntest-fightloop-fix-b: ' + pass + ' passed, ' + fail + ' failed');
  if (fail) console.log('failing: ' + fails.join(' | '));
  process.exitCode = fail ? 1 : 0;
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
