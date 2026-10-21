#!/usr/bin/env node
// scripts/test-huntstaff-chan-b.js — proof for the huntstaff-b arm
// (sim-huntstaff-b, food-economy axis, loop B, backlog #703).
//
// NAME NOTE: the mandated filename scripts/test-huntstaff-b.js is the OLD
// sim-huntstaff-b arm's kept instrument (killed at pilot c55959a17; the
// kill protocol keeps instruments — overwriting would destroy it). This
// proof lives at test-huntstaff-chan-b.js ("chan" = channel staffing,
// the design this arm measures).
//
// BLANK: duty:hunt is unstaffed on the competent substrate (0 kcal in the
// sim-glutprobe-b DIAG). This arm staffs it additively (up to N=2 free
// villagers/day at the START of policy.daily, HUNTSTAFF_B=1, default OFF).
//
// Usage (READ THIS HEADER BEFORE EVERY RUN — the env trap):
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-huntstaff-chan-b.js
//     fixtures + RED pins + armed det pin (gate OFF)
//   FEASTSCALE_R13=1 SEATDRIVE=0 HUNTSTAFF_B=1 node scripts/test-huntstaff-chan-b.js
//     gate-ON fixtures (staffing engages, protected duties untouched, say dedup)
//
// REAL RED -> GREEN: run this script FIRST on the pristine tree (before
// scripts/policies/huntstaff-b.js exists, the require falls back and the
// gate-ON checks FAIL loudly); then add the layer and re-run — every
// gate-ON check must flip to pass while every RED pin stays green.
//
// The RED pins assert: gate-off wrappers delegate to the pristine policies
// byte-identically (25d trajectory day-hashes) and write zero _hsb* ctx keys.
// The sweep's own det-gate (16/16 configs x 2 sides x 2 reps) runs separately
// in scripts/sweep-huntstaff-b.js; the proof pins the layer mechanics here.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROOF STOP: SEATDRIVE=0 is required (pre-seat substrate).'); process.exit(2); }

const GATE_ON = process.env.HUNTSTAFF_B === '1';

let HSB = null;
try { HSB = require('./policies/huntstaff-b'); }
catch (e) { console.log('NOTE: scripts/policies/huntstaff-b.js absent — RED phase only (gate-ON checks will fail loudly).'); }
const { leadfeast, belongfeast } = require('./policies/feastscale');

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (!cond) { failed++; console.error(`FAIL ${name}${detail ? ' — ' + detail : ''}`); return; }
  passed++; console.log(`ok ${name}`);
}

const DET_SEEDS = [8901, 8902];
const POLICIES = ['leadfeast', 'belongfeast'];
const DET_DAYS = 25;

function baseFor(id) { return id === 'leadfeast' ? leadfeast : belongfeast; }
function wrappedFor(id) {
  if (!HSB) return null;
  return id === 'leadfeast' ? HSB.leadstaffhunt : HSB.belongstaffhunt;
}

async function hashesOnce(seed, policyObj) {
  const { Game } = await loadGame({ seed, mode: 'huntstaffb-det', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const hashes = [];
  const wrapped = Object.assign({}, policyObj);
  const oDaily = policyObj.daily;
  wrapped.daily = (G, c) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return oDaily ? oDaily(G, c) : undefined;
  };
  let r;
  await quietLog(async () => { r = await runDays(Game, wrapped, { days: DET_DAYS, sampleEvery: 1 }); });
  return { hashes, days: r.days, endReason: r.endReason };
}

// ---- RED: gate-off byte-identical to pristine policies ----
async function redPins() {
  console.log('-- RED: gate-off delegation pins --');
  if (GATE_ON) { console.log('  (skipped — gate ON in this invocation)'); return; }
  for (const pid of POLICIES) {
    const base = baseFor(pid);
    const wrapped = wrappedFor(pid);
    if (!wrapped) { ok(`${pid}: layer present`, false, 'huntstaff-b.js not found (RED phase)'); continue; }
    const a = await hashesOnce(DET_SEEDS[0], base);
    const b = await hashesOnce(DET_SEEDS[0], wrapped);
    const same = a.hashes.length === b.hashes.length && a.hashes.every((h, i) => h === b.hashes[i]);
    ok(`${pid}: gate-off trajectory byte-identical (${DET_DAYS}d)`, same,
      `lenA=${a.hashes.length} lenB=${b.hashes.length}`);
    ok(`${pid}: gate-off endReason identical`, a.endReason === b.endReason,
      `${a.endReason} vs ${b.endReason}`);
  }
  // gate-off ctx purity: short wrapped run, scan for _hsb* keys
  const { Game } = await loadGame({ seed: DET_SEEDS[1], mode: 'huntstaffb-redctx', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const w = wrappedFor('leadfeast');
  if (w) {
    const ctx = {};
    const pol = Object.assign({}, w);
    const oDaily = w.daily;
    pol.daily = (G, c) => oDaily(G, ctx);
    await quietLog(async () => { await runDays(Game, pol, { days: 5, sampleEvery: 5 }); });
    const dirty = Object.keys(ctx).filter(k => k.startsWith('_hsb'));
    ok('gate-off ctx purity (zero _hsb* writes)', dirty.length === 0, dirty.join(','));
  }
}

// ---- GREEN fixtures (gate ON) ----
async function atHavenFixture(seed) {
  const { Game } = await loadGame({ seed, mode: 'huntstaffb-fix', fullTelemetry: false, narration: true });
  await quietLog(async () => { await setupGame(Game); });
  // force the scholar to Haven so the in-person staffing line is live
  try { Game.map.px = 4; Game.map.py = 4; } catch (e) {}
  // clear ambient assignments so the fixture is controlled
  try { Game.state.village.assignments = {}; } catch (e) {}
  return Game;
}

async function greenFixtures() {
  console.log('-- GREEN: staffing mechanics --');
  if (!GATE_ON) { console.log('  (skipped — re-run with HUNTSTAFF_B=1)'); return; }
  if (!HSB) { ok('layer present', false, 'huntstaff-b.js not found'); return; }

  // G4: rankCandidates — occupation preference + deterministic tiebreak (pure)
  const ranked = HSB.rankCandidates([
    { vid: 'clerk', tier: 0, comp: 0.7, rosterIdx: 0 },
    { vid: 'guide', tier: 1.4, comp: 1.4, rosterIdx: 5 },
    { vid: 'farmer', tier: 1.2, comp: 1.2, rosterIdx: 2 },
    { vid: 'guide2', tier: 1.4, comp: 1.4, rosterIdx: 3 },
  ]);
  ok('G4: 1.4 tier first', ranked[0].tier === 1.4 && ranked[1].tier === 1.4,
    JSON.stringify(ranked.map(r => r.vid)));
  ok('G4: deterministic roster-order tiebreak', ranked[0].vid === 'guide2' && ranked[1].vid === 'guide',
    JSON.stringify(ranked.map(r => r.vid)));
  ok('G4: clerk last', ranked[3].vid === 'clerk');

  // G5: say-line dedup — no adjacent verbatim repeat across 20 picks
  let lastIdx = null, texts = [];
  for (let i = 0; i < 20; i++) {
    const r = HSB.staffSayLine('Mara and Jon', lastIdx);
    texts.push(r.text); lastIdx = r.idx;
  }
  const adjacentDup = texts.some((t, i) => i > 0 && t === texts[i - 1]);
  ok('G5: no adjacent verbatim say repeat (20 picks)', !adjacentDup);
  ok('G5: pool varies', new Set(texts).size >= 2, `distinct=${new Set(texts).size}`);

  // G1/G2/G3: live fixture — staffing engages, protected duties untouched, cap <=2
  const Game = await atHavenFixture(8901);
  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 8) { ok('fixture roster big enough', false, `roster=${roster.length}`); return; }
  // pre-assign protected duties to 6 villagers (never re-tasked)
  const prot = ['cook', 'water', 'wood', 'garden', 'patrol', 'fish'];
  prot.forEach((task, i) => { v.assignments[roster[i]] = { task }; });
  // make sure the remaining villagers pass the person gates for the fixture
  // (health/trust maps may not exist yet on a fresh setupGame state)
  try { v.health = v.health || {}; v.trust = v.trust || {}; } catch (e) {}
  for (const id of roster.slice(6)) {
    try { v.health[id] = 100; v.trust[id] = 100; } catch (e) {}
  }
  const ctx = {};
  const staffed = HSB.staffHuntsB(Game, ctx);
  ok('G1: staffing engages on free villagers', staffed.length >= 1, `staffed=${staffed.length}`);
  ok('G3: cap <= 2 per day', staffed.length <= 2, `staffed=${staffed.length}`);
  const protIntact = prot.every((task, i) => v.assignments[roster[i]] && v.assignments[roster[i]].task === task);
  ok('G2: protected duties never re-tasked', protIntact);
  const allHunt = staffed.every(id => v.assignments[id] && v.assignments[id].task === 'hunt');
  ok('G2b: staffed villagers are on hunt duty', allHunt);
  const protIds = new Set(roster.slice(0, 6));
  ok('G2c: no protected villager moved', staffed.every(id => !protIds.has(id)));
  ok('G6: say logged once for the staffed day', (ctx._hsbSayLog || []).length === 1,
    `sayLog=${(ctx._hsbSayLog || []).length}`);
  ok('G6b: staff-day counted', ctx._hsbStaffDays === 1, `days=${ctx._hsbStaffDays}`);
  // second call same day: once-per-day
  const again = HSB.staffHuntsB(Game, ctx);
  ok('G3b: once per day', again.length === 0);

  // G7: gate-off in the same fixture writes nothing
  delete process.env.HUNTSTAFF_B;
  const ctx2 = {};
  HSB.staffHuntsB(Game, ctx2);
  ok('G7: gate-off staffHuntsB writes zero ctx', Object.keys(ctx2).length === 0, Object.keys(ctx2).join(','));
  process.env.HUNTSTAFF_B = '1';
}

// ---- armed determinism pin (small; the sweep runs the full 16/16x2) ----
async function armedDetPin() {
  console.log('-- armed determinism pin --');
  if (!HSB || !GATE_ON) { console.log('  (skipped — needs the layer + HUNTSTAFF_B=1)'); return; }
  for (const pid of POLICIES) {
    const wrapped = wrappedFor(pid);
    const a = await hashesOnce(DET_SEEDS[0], wrapped);
    const b = await hashesOnce(DET_SEEDS[0], wrapped);
    const same = a.hashes.length === b.hashes.length && a.hashes.every((h, i) => h === b.hashes[i]);
    ok(`${pid}: armed repeat-pair byte-identical (${DET_DAYS}d)`, same,
      `lenA=${a.hashes.length} lenB=${b.hashes.length} end ${a.endReason}/${b.endReason}`);
  }
}

async function main() {
  await redPins();
  await greenFixtures();
  await armedDetPin();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
