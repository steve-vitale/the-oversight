#!/usr/bin/env node
// scripts/test-gengap-b.js — background-survivor generation-gap wiring proof
// (sim-findings 2026-10-17, loop B sim-huntroster-b).
//
// PRE-REGISTRATION (docs/MEASUREMENT.md §14 — binding, written BEFORE sims):
// PRIMARY (mechanism):
//   RED census — on HEAD (unfixed) characterGen table, the repo's REAL
//     name/id matching rule (hydrateSeed's find) matches NO occupation for
//     23/100 background survivors, including the 6 named in the findings
//     ('barber','dockworker','crossing guard','piano tuner','florist',
//     'postal worker'). Bar: nulls >= 1 on the unfixed table proves the gap.
//   GREEN — hydrateSeed all 100 background survivors on the fixed build:
//     0 occupationId-nulls, AND each of the 6 named occupations carries
//     occupation-seeded skills/knowledge via the REAL npcSeedSkills route
//     (granted ids must resolve through abilitySkillId — the route only stores
//     skill-lane abilities; dead strings grant nothing):
//       barber          steady_hands (granted) + read_people (knowledge)
//       dockworker      brawler_instinct, scrounger (granted)
//       crossing guard  gossip_network, bodyguard (granted)
//       piano tuner     steady_hands (granted)
//       florist         foraging, forage_sense, herbal_medicine (knowledge backgrounds)
//       postal worker   pathfinder (granted)
// GUARDRAILS (every-gate, before/after on identical fresh seeds):
//   seeds 90011..90026 — zero overlap with every SEEDS= list grepped in
//     evidence/ (2026-10-17 census of used seeds).
//   FEASTSCALE_R13=1, SEATDRIVE=0 explicit, 180d death-aware, capable policy,
//     16 runs/side, control = HEAD data, armed = fixed data, identical seeds.
//   - national armed >= control - 2
//   - armed death-cause set SUBSET of control set (no new death mode)
//   - median survival: report-only
//   - node scripts/check.js --quick green on the landed tree
//   - diff confinement: occupationId under the HEAD table vs the fixed table
//     differs ONLY for survivors whose occupation is one of the 23
//     (all 100 compared).
// Horizon + why: 180d death-aware — the fix touches every roster's
//   composition; wall reachability (national/table/wins) must be re-proven.
// NOTE: generation changes legitimately alter trajectories (villagers now
//   have skills they should have had) — we do NOT gate on byte-identical
//   det; we gate on confinement of the diff instead.
// METRIC REVIEW: section printed at the end of the run.
// SMOKE=1: PART A (RED) + PART B (GREEN census+seeding) + PART C (sense print).
'use strict';
// Historical RED/ARMED experiment: Part E rewrites data files while it runs.
// Keep this out of active worktrees and concurrent checks. Standing current
// coverage lives in godpath/test-occupation-source-parity.js. Reproduction
// requires its declared historical anchors in a disposable checkout.
if (process.env.SMOKE !== '1' && !process.argv.includes('--allow-historical-source-swap')) {
  throw new Error('Historical source-swapping experiment: use a disposable checkout at its declared anchors and --allow-historical-source-swap; current read-only proof is scripts/godpath/test-occupation-source-parity.js.');
}

process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { runComparison } = require('./sweep-compare');

const WT = __dirname + '/..';
const CG = path.join(WT, 'src/data/characterGen.json');
const KG = path.join(WT, 'src/data/knowledge.json');
const EVID = path.join(WT, 'evidence/2026-10-17');
const PERSEED = path.join(EVID, 'perseed-gengap');

const SIX = ['barber', 'dockworker', 'crossing guard', 'piano tuner', 'florist', 'postal worker'];

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`);
  else { console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); failures++; }
}

// The repo's REAL matching rule (game.js hydrateSeed): name OR id, case-insensitive.
function realMatch(bgOcc, occs) {
  const n = String(bgOcc || '').toLowerCase();
  return occs.find(o => String(o.name || '').toLowerCase() === n || String(o.id || '').toLowerCase() === n) || null;
}

const BG = () => JSON.parse(fs.readFileSync(path.join(WT, 'src/data/background_survivors.json'), 'utf8'));
const headTable = () => JSON.parse(execSync('git show HEAD:src/data/characterGen.json', { cwd: WT, maxBuffer: 16 * 1024 * 1024 }));
const fixedTable = () => JSON.parse(fs.readFileSync(CG, 'utf8'));

async function partA() {
  console.log('PART A — RED census on the HEAD (unfixed) occupation table');
  const head = headTable();
  const bg = BG();
  const nulls = bg.filter(s => !realMatch(s.formerOccupation, head.occupations));
  check('A0 RED: >=1 bg survivor occupationId-null on HEAD (bar)', nulls.length >= 1, `nulls=${nulls.length}/100`);
  check('A1 RED: exactly the 23 occupations are null', nulls.length === 23, nulls.map(s => s.formerOccupation).join(','));
  const sixAll = SIX.every(o => nulls.some(s => String(s.formerOccupation).toLowerCase() === o));
  check('A2 RED: the 6 named occupations are all null on HEAD', sixAll, SIX.join(','));
  check('A3 RED: HEAD table has 55 occupations', head.occupations.length === 55, String(head.occupations.length));
}

async function partB() {
  console.log('PART B — GREEN: hydrateSeed all 100 on the fixed build + real skill seeding');
  const { Game } = await loadGame({ seed: 91001, mode: 'gengap-green' });
  await quietLog(async () => { await setupGame(Game); });
  const bg = BG();
  const hydrated = [];
  const nulls = [];
  for (const s of bg) {
    const p = Game.hydrateSeed(s);
    hydrated.push(p);
    if (!p.occupationId) nulls.push(s.formerOccupation);
    // register so getPerson/npcSeedSkills can see them
    if (!Game.data.villagers.find(v => v.id === p.id)) Game.data.villagers.push(p);
  }
  check('B0 GREEN: 0 occupationId-nulls on fixed build', nulls.length === 0, nulls.join(',') || 'all 100 matched');
  const fixed = fixedTable();
  check('B1 GREEN: fixed table has 78 occupations', fixed.occupations.length === 78, String(fixed.occupations.length));
  // granted resolution through the REAL abilitySkillId
  const resolve = id => { try { return Game.abilitySkillId(id) || id; } catch (e) { return id; } };
  const byOcc = {};
  hydrated.forEach(p => { byOcc[String(p.formerOccupation).toLowerCase()] = p; });
  let seeded6 = 0, seededAll23 = 0;
  const detail23 = [];
  const head = headTable();
  const NEW_KEYS = new Set(bg.filter(s => !realMatch(s.formerOccupation, head.occupations))
    .map(s => String(s.formerOccupation).toLowerCase()));
  for (const s of bg) {
    const key = String(s.formerOccupation).toLowerCase();
    if (!NEW_KEYS.has(key)) continue; // out of scope: pre-existing occupations' own granted debt
    const p = byOcc[key];
    const occ = fixed.occupations.find(o => String(o.name).toLowerCase() === key || String(o.id).toLowerCase() === key);
    const expected = (occ.granted || []).map(resolve);
    let got = [];
    try { got = Game.skillsKnownBy(p.id) || []; } catch (e) { got = []; }
    const hit = expected.filter(e => got.indexOf(e) >= 0);
    if (hit.length === expected.length) { // every granted id resolves and lands ([] vacuously)
      seededAll23++;
      if (SIX.indexOf(key) >= 0) seeded6++;
    } else {
      detail23.push(`${s.formerOccupation}: expected [${expected.join(',')}] got [${got.join(',')}]`);
    }
  }
  check('B2 GREEN: all 6 named occupations carry their named seeding', seeded6 === 6, `seeded=${seeded6}/6`);
  const barb = byOcc['barber'];
  const barbSkills = Game.skillsKnownBy(barb.id) || [];
  check('B2b GREEN: barber has knowledge-route read_people too', barbSkills.indexOf('read_people') >= 0, barbSkills.join(','));
  check('B3 GREEN: all 23 new occupations resolve every granted id through the real route', seededAll23 === 23, `seeded=${seededAll23}/23${detail23.length ? ' | ' + detail23.join(' ; ') : ''}`);
  // knowledge route: florist should also have herbal_medicine + forage_sense + foraging
  const flor = byOcc['florist'];
  const florSkills = Game.skillsKnownBy(flor.id) || [];
  check('B4 GREEN: florist has knowledge-route skills (herbal_medicine, forage_sense, foraging)',
    ['herbal_medicine', 'forage_sense', 'foraging'].every(k => florSkills.indexOf(k) >= 0), florSkills.join(','));
  const zoo = byOcc['zookeeper'];
  const zooSkills = Game.skillsKnownBy(zoo.id) || [];
  check('B5 GREEN: zookeeper has knowledge-route animal_behavior', zooSkills.indexOf('animal_behavior') >= 0, zooSkills.join(','));
  return { Game, hydrated };
}

async function partC(Game, hydrated) {
  console.log('PART C — SENSE-TEST (SENSE-TESTING LAW): generated survivor blurbs');
  // hydrateSeed picks a backstory variant; print name/occupation/backstory for 5 of the 6.
  const want = ['barber', 'dockworker', 'crossing guard', 'piano tuner', 'florist'];
  for (const occName of want) {
    const p = hydrated.find(h => String(h.formerOccupation).toLowerCase() === occName);
    console.log(`\n  [${p.name} — ${p.formerOccupation}, ${p.age}]`);
    console.log(`  ${(p.backstory || '').replace(/\s+/g, ' ')}`);
  }
  console.log('\n  (judge above: must read as real people with coherent trades, not name soup)');
}

async function partD() {
  console.log('PART D — diff confinement: occupationId differs ONLY for the 23');
  const head = headTable(), fixed = fixedTable();
  const bg = BG();
  const changed = bg.filter(s => {
    const h = realMatch(s.formerOccupation, head.occupations);
    const f = realMatch(s.formerOccupation, fixed.occupations);
    return ((h && h.id) || null) !== ((f && f.id) || null);
  });
  const changedOccs = new Set(changed.map(s => String(s.formerOccupation).toLowerCase()));
  check('D0 changed set == the 23 new occupations', changedOccs.size === 23 &&
    [...changedOccs].every(o => !realMatch(o, head.occupations)), `changed=${changedOccs.size}`);
  check('D1 no pre-existing occupation remapped', changed.every(s => !realMatch(s.formerOccupation, head.occupations)), 'ok');
}

const SEEDS = [90011, 90012, 90013, 90014, 90015, 90016, 90017, 90018,
               90019, 90020, 90021, 90022, 90023, 90024, 90025, 90026];

function wallExtra(Game) {
  const exiled = (() => { try { return Game.state.scholar && Game.state.scholar.exiled ? 1 : 0; } catch (e) { return 0; } })();
  return { exiled };
}

async function sweepSide(side) {
  console.log(`PART E — ${side.toUpperCase()} sweep: 16 seeds x capable x 180d (death-aware)`);
  const rep = await quietLog(async () => runComparison({
    label: 'gengap-' + side, seeds: SEEDS, policies: ['capable'], days: 180, extraMetrics: wallExtra,
  }));
  const out = path.join(EVID, `gengap-sweep-${side}.json`);
  fs.writeFileSync(out, JSON.stringify(rep, null, 1));
  fs.mkdirSync(PERSEED, { recursive: true });
  for (const r of rep.runs) {
    fs.writeFileSync(path.join(PERSEED, `wall-${side}-${r.seed}.json`), JSON.stringify({
      schema: 'gengap-wall/1', schemaVersion: 1, side, seed: r.seed, policy: r.policy,
      days: r.days, endReason: r.endReason, won: r.won, national: r.national,
      table: r.table, entered: r.entered, waveReach: r.waveReach, maxArc: r.maxArc,
      vests: r.vests, exiled: (r.extra || {}).exiled || 0, deaths: r.deaths,
    }, null, 1));
  }
  return rep;
}

async function partE() {
  // CONTROL = HEAD data; ARMED = fixed data. Swap files in-process (sim-harness
  // re-reads data from disk per loadGame via the fetch shim — no require cache).
  const fixedCG = fs.readFileSync(CG), fixedKG = fs.readFileSync(KG);
  const headCG = execSync('git show HEAD:src/data/characterGen.json', { cwd: WT });
  const headKG = execSync('git show HEAD:src/data/knowledge.json', { cwd: WT });
  try {
    fs.writeFileSync(CG, headCG); fs.writeFileSync(KG, headKG);
    var control = await sweepSide('control');
  } finally {
    fs.writeFileSync(CG, fixedCG); fs.writeFileSync(KG, fixedKG);
  }
  check('E-restore fixed data byte-identical', fs.readFileSync(CG).equals(fixedCG) && fs.readFileSync(KG).equals(fixedKG), 'ok');
  const armed = await sweepSide('armed');
  const c = control.byPolicy.capable, a = armed.byPolicy.capable;
  console.log(`\n  WALL control: national ${c.nationalPct}% | table ${c.tablePct}% | entered ${c.enteredPct}% | won ${c.won}/16 | maxWave ${c.maxWave} | medD ${c.medianDays} | maxD ${c.maxDays}`);
  console.log(`  WALL armed:   national ${a.nationalPct}% | table ${a.tablePct}% | entered ${a.enteredPct}% | won ${a.won}/16 | maxWave ${a.maxWave} | medD ${a.medianDays} | maxD ${a.maxDays}`);
  const natC = Math.round(c.nationalPct / 100 * 16), natA = Math.round(a.nationalPct / 100 * 16);
  check('E0 national armed >= control - 2', natA >= natC - 2, `control=${natC}/16 armed=${natA}/16`);
  const ck = r => new Set(Object.keys(r.deaths || {}));
  const cDeaths = new Set(), aDeaths = new Set();
  for (const r of control.runs) for (const k of ck(r)) cDeaths.add(k);
  for (const r of armed.runs) for (const k of ck(r)) aDeaths.add(k);
  const newModes = [...aDeaths].filter(k => !cDeaths.has(k));
  check('E1 no new death mode (armed death-cause set ⊆ control)', newModes.length === 0, newModes.join(',') || 'ok');
  console.log(`  E2 median survival REPORT-ONLY: control ${c.medianDays}d, armed ${a.medianDays}d`);
  const wave4 = r => (r.runs.filter(x => x.waveReach >= 4).length) + '/16';
  const wave5 = r => (r.runs.filter(x => x.waveReach >= 4 && x.waveReach >= 5).length) + '/16';
  console.log(`  E3 wave-4 unlocks: control ${wave4(control)}, armed ${wave4(armed)} | wave-5: control ${wave5(control)}, armed ${wave5(armed)}`);
  // aggregate wall file for telemetry-check
  const agg = { national: armed.runs.reduce((t, r) => t + r.national, 0),
                table: armed.runs.reduce((t, r) => t + r.table, 0),
                wins: armed.runs.reduce((t, r) => t + r.won, 0),
                exiled: armed.runs.reduce((t, r) => t + ((r.extra || {}).exiled || 0), 0) };
  fs.writeFileSync(path.join(EVID, 'gengap-wall-aggregate-armed.json'), JSON.stringify(agg, null, 1));
  console.log('  aggregate wall (armed):', JSON.stringify(agg));
}

async function main() {
  const SMOKE = process.env.SMOKE === '1';
  await partA();
  const { Game, hydrated } = await partB();
  await partC(Game, hydrated);
  if (!SMOKE) {
    await partD();
    await partE();
  }
  console.log('\nMETRIC REVIEW:');
  console.log('  - The 23-count (vs the 6 named in sim-huntroster-b) is the honest scope: the same');
  console.log('    matching rule nulls 23 bg occupations, not 6. The fix aligns the full set.');
  console.log('  - Seeding assertions use abilitySkillId-resolved ids (the route npcSeedSkills');
  console.log('    actually stores), so they pin the mechanism, not the string.');
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
