#!/usr/bin/env node
// scripts/sweep-cookdrive2-b.js — lever sweep for the cook-drive duty-cadence
// arm (sim-cookdrive2-b, 2026-10-17, food-economy axis).
//
// WHY: finding #462 — the cook smoke drive is eligibility/duty-bound, not
// budget-bound. The named next is to tune the drive itself: duty cadence or
// the 250/person dinner-reserve size. The reserve was killed twice
// (dinreserve 2026-10-13, dinreserve2 2026-10-14). This arm tests DUTY
// CADENCE: consolidate the smoke pass to once per day (first cook-duty
// resolution) under env gate COOKDRIVE2_B=1 (default OFF; runtime read,
// FOODLEVER_R5 pattern).
//
// 8 FRESH seeds 4801-4808 x {leadfeast, belongfeast} x {control, armed} =
// 32 runs, 180d death-aware, identical seeds, own paired control in the SAME
// sweep. control = COOKDRIVE2_B unset; armed = COOKDRIVE2_B=1.
// Substrate (asserted up front): FEASTSCALE_R13=1, SEATDRIVE=0 explicit
// (pre-seat courtship, food-economy). Banned-seed check: SWEEP STOPS on hit.
//
// Pre-registration (binding, MEASUREMENT.md §§9-12, 14 — see
// evidence/2026-10-17/sim-cookdrive2-b.md):
//   PRIMARY: paired-median fresh waste-rate (WR instrument) armed vs
//     control. GO: paired median of per-pair ratios <= 0.85.
//   STARVATION VETO (cookwin-b lesson): armed starvation deaths must not
//     exceed control. A waste-rate win that starves villages is NO-GO.
//   MECHANISM-ENGAGEMENT: armed-side skipped same-day smoke passes > 0
//     (the lever must actually engage, not just gate a code path). KILL if
//     the mechanism never engages.
//   GUARDRAILS: national >= control-2; matched median survival >=
//     control-10d; no new death mode; no crash; no laundering.
//   DET-GATE: gate-off byte-identical to pristine baseline (proof test).
//   SENSE: cook smoke beats captured on the first armed run per policy;
//     does the drive read like a person tending racks or a number pump?
// Horizon: 180d death-aware (runDays stops on village death +10d tail).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-cookdrive2-b.js
// Targeted: SEEDS="4801,4802" ONLY="leadfeast" SIDES="armed" node ...
'use strict';
const fs = require('fs');
const path = require('path');
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
process.env.LEANWINTER_LIB = '1';
const LW = require('./sweep-leanwinter-20261017');
const WR = require('./wasterate-instrument-20261017');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat substrate).'); process.exit(2); }

// ---- banned-seed check (the coordinator's list; sweep stops on any hit) ----
const BANNED = new Set();
for (const spec of ['982-989', '3101-3108', '3301-3308', '3201-3208',
    '931-938', '111-888', '11-88', '1201-1208', '991-998', '4201-4208',
    '5101-5108', '201-208', '1701-1708']) {
  const [a, b] = spec.split('-').map(Number);
  for (let s = a; s <= b; s++) BANNED.add(s);
}
for (const spec of ['171,282,393,504,615,726,837,948', '121,232,343,454,565,676,787,898',
    '131,242,353,464,575,686,797,908', '151,262,373,484,595,706,817,928',
    '163,274,385,496,607,718,829,940', '205,246,321,412,523,634,745,856',
    '307,418,529,640,751,862,973,84', '917,928,939,104,215,326,437,548',
    '141,252,363,474', '101,202,303,404,606,707,808,909',
    '137,248,359,470,581,692,803,914']) {
  for (const s of spec.split(',').map(Number)) BANNED.add(s);
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [4801, 4802, 4803, 4804, 4805, 4806, 4807, 4808]).filter(Number.isFinite);
for (const s of SEEDS) {
  if (BANNED.has(s)) { console.error(`SWEEP STOP: seed ${s} is on the coordinator's banned list.`); process.exit(2); }
}
const POLICIES = process.env.ONLY ? [process.env.ONLY] : ['leadfeast', 'belongfeast'];
const SIDES = process.env.SIDES ? [process.env.SIDES] : ['control', 'armed'];
const DAYS = 180;
const DATE = '2026-10-17';
const EVID = path.join(__dirname, '..', 'evidence', DATE, 'perseed-cookdrive2');
const BEATS = path.join(__dirname, '..', 'evidence', DATE, 'cookdrive2-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const BEAT_RE = /smoke racks|worked the smoke|preserv|racks are already full|left the fresh pile|cooked for the haven/i;
const BEAT_CAP = 60;

function policyFor(policyId) {
  return policyId === 'leadfeast' ? leadfeast : belongfeast;
}

function alivePop(Game) {
  try {
    const v = Game.state.village || {};
    return (v.roster || []).filter(id => {
      if (id === Game.villagerId) return true;
      const p = Game.getPerson ? Game.getPerson(id) : null;
      return p && !p.dead;
    }).length;
  } catch (e) { return 0; }
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// Drive instrument: count cook-duty resolutions and same-day smoke-pass skips
// (armed side). Pure read + call-through; wraps resolveOneAssignment.
function attachDriveCounter(Game, d) {
  d.cookResolutions = 0; d.smokeSkips = 0; d.smokeFires = 0; d.wrapFailed = false;
  try {
    const orig = Game.resolveOneAssignment;
    if (typeof orig !== 'function') { d.wrapFailed = true; return; }
    Game.resolveOneAssignment = function (vid, a) {
      if (a && a.task === 'cook') {
        d.cookResolutions++;
        try {
          const v = Game.state.village || {};
          const day = (Game.state.scholar || {}).day || 1;
          // Under the gate, a cook resolution skips the smoke pass when the
          // flag already equals today (set by an earlier cook today).
          if (process.env.COOKDRIVE2_B === '1' && v._cookDrive2Day === day) d.smokeSkips++;
          else d.smokeFires++;
        } catch (e) {}
      }
      return orig.call(this, vid, a);
    };
  } catch (e) { d.wrapFailed = true; }
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const policyId of POLICIES) {
    for (const side of SIDES) {
      if (side === 'armed') process.env.COOKDRIVE2_B = '1'; else delete process.env.COOKDRIVE2_B;
      const { Game } = await loadGame({ seed: SEEDS[0], mode: `cookdrive2-smoke-${policyId}-${side}`, fullTelemetry: false });
      await quietLog(async () => { await setupGame(Game); });
      const t = {};
      WR.attachWasteRate(Game, t);
      WR.snapshotStart(Game, t);
      const d = {};
      attachDriveCounter(Game, d);
      const inst = {};
      LW.attachDeathInstrument(Game, inst);
      LW.attachFoodInstruments(Game, inst);
      const base = policyFor(policyId);
      let r = null;
      await quietLog(async () => { r = await runDays(Game, Object.assign({}, base), { days: 15, sampleEvery: 30 }); });
      check(`${policyId}/${side}: drive counter live`, !d.wrapFailed && d.cookResolutions > 0,
        `cookRes=${d.cookResolutions} fires=${d.smokeFires} skips=${d.smokeSkips}`);
      check(`${policyId}/${side}: S0 recorded`, t.pantryStartKcal > 0, `S0=${t.pantryStartKcal}`);
      check(`${policyId}/${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
      const c = WR.conservation(Game, t);
      check(`${policyId}/${side}: smoke conservation |rel|<=3%`, Math.abs(c.rel) <= 0.03,
        `rel=${(c.rel * 100).toFixed(2)}%`);
    }
  }
  delete process.env.COOKDRIVE2_B;
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function oneRun(seed, policyId, side) {
  if (side === 'armed') process.env.COOKDRIVE2_B = '1'; else delete process.env.COOKDRIVE2_B;
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `cookdrive2-${policyId}-${side}`, fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const hist = { maxRank: 0, everTable: false, exiled: false, villagerDays: 0, maxArc: 1, maxFires: 0, starvedDays: 0 };
  const waveHist = { dailyMax: 1, wave4Day: null, wave5Day: null };
  const inst = {};
  LW.attachDeathInstrument(Game, inst);
  LW.attachFoodInstruments(Game, inst);
  const t = {};
  WR.attachWasteRate(Game, t);
  WR.snapshotStart(Game, t);
  const d = {};
  attachDriveCounter(Game, d);
  const beats = [];
  const wantBeats = (side === 'armed' && seed === SEEDS[0]);
  let origSay = null;
  if (wantBeats) {
    origSay = Game.say.bind(Game);
    Game.say = function (m) {
      const str = String(m == null ? '' : m);
      if (BEAT_RE.test(str) && beats.length < BEAT_CAP) {
        beats.push({ day: gday(Game), text: str.slice(0, 400) });
      }
      return origSay(m);
    };
  }
  const policy = Object.assign({}, base);
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      hist.villagerDays += alivePop(G);
      if ((((G.state || {}).village || {}).hungryDays || 0) > 0) hist.starvedDays++;
      try { const a = ((((G.state || {}).scholar || {}).prog || {}).arc || 1); if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try {
        const pol2 = G._havenPolity ? G._havenPolity() : null;
        const fires = pol2 ? 1 + ((pol2.subs || []).length) : 0;
        if (fires > hist.maxFires) hist.maxFires = fires;
      } catch (e) {}
      try {
        const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1;
        if (w > waveHist.dailyMax) {
          waveHist.dailyMax = w;
          if (w >= 4 && waveHist.wave4Day == null) waveHist.wave4Day = gday(G);
          if (w >= 5 && waveHist.wave5Day == null) waveHist.wave5Day = gday(G);
        }
      } catch (e) {}
    } catch (e) { inst.errors = (inst.errors || 0) + 1; }
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (wantBeats) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-armed-s${seed}.json`), JSON.stringify(beats, null, 1));
    Game.say = origSay;
  }
  const gameDays = result.gameDays;
  const causeCounts = {}, clsCounts = {};
  for (const dd of (inst.deaths || [])) {
    const k = dd.cause == null ? '<null>' : dd.cause;
    causeCounts[k] = (causeCounts[k] || 0) + 1;
    clsCounts[dd.cls] = (clsCounts[dd.cls] || 0) + 1;
  }
  const starvation = clsCounts.STARVATION || 0;
  const vd = hist.villagerDays || 0;
  const harnessMax = (result.maxWaveUnlocked || 1) | 0;
  const waveMax = Math.max(waveHist.dailyMax, harnessMax);
  const c = WR.conservation(Game, t);
  const wr = WR.wasteRate(t);
  const out = {
    seed, policyId, side,
    days: result.days, gameDays, endReason: result.endReason,
    national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0,
    wins: Game.won ? 1 : 0,
    exiled: hist.exiled ? 1 : 0,
    maxWave: waveMax, wave4Day: waveHist.wave4Day, wave5Day: waveHist.wave5Day,
    maxArc: hist.maxArc,
    starvation, starvedDays: hist.starvedDays,
    causeCounts, clsCounts,
    wasteRate: wr, conservationRel: c.rel,
    cookResolutions: d.cookResolutions, smokeFires: d.smokeFires, smokeSkips: d.smokeSkips,
    villagerDays: vd,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  console.log(`  [${side} ${policyId} s${seed}] d=${gameDays} end=${out.endReason} wr=${wr == null ? 'null' : wr.toFixed(5)} cookRes=${d.cookResolutions} fires=${d.smokeFires} skips=${d.smokeSkips} nat=${out.national} wave=${waveMax} starv=${starvation}`);
  return out;
}

async function main() {
  console.log(`cookdrive2 sweep: seeds=${SEEDS.join(',')} policies=${POLICIES.join(',')} sides=${SIDES.join(',')} days=${DAYS}`);
  await smokeGate();
  const results = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      for (const side of SIDES) {
        try {
          results.push(await oneRun(seed, policyId, side));
        } catch (e) {
          console.error(`RUN FAILED ${policyId} s${seed} ${side}: ${e && e.message}`);
          results.push({ seed, policyId, side, failed: true, error: String(e && e.message) });
        }
      }
    }
  }
  delete process.env.COOKDRIVE2_B;
  // paired analysis
  const pairs = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const ctl = results.find(r => r.policyId === policyId && r.seed === seed && r.side === 'control' && !r.failed);
      const arm = results.find(r => r.policyId === policyId && r.seed === seed && r.side === 'armed' && !r.failed);
      if (ctl && arm && ctl.wasteRate != null && arm.wasteRate != null && ctl.wasteRate > 0) {
        pairs.push({ policyId, seed, ratio: arm.wasteRate / ctl.wasteRate,
          ctlWR: ctl.wasteRate, armWR: arm.wasteRate,
          ctlDays: ctl.gameDays, armDays: arm.gameDays });
      }
    }
  }
  pairs.sort((a, b) => a.ratio - b.ratio);
  const mid = pairs.length / 2;
  const pairedMedian = pairs.length ? (pairs.length % 2 ? pairs[Math.floor(mid)].ratio
    : (pairs[mid - 1].ratio + pairs[mid].ratio) / 2) : null;
  const improved = pairs.filter(p => p.ratio < 1).length;
  const worsened = pairs.filter(p => p.ratio > 1).length;
  const starvCtl = results.filter(r => r.side === 'control' && !r.failed).reduce((t, r) => t + (r.starvation || 0), 0);
  const starvArm = results.filter(r => r.side === 'armed' && !r.failed).reduce((t, r) => t + (r.starvation || 0), 0);
  const natCtl = results.filter(r => r.side === 'control' && !r.failed && r.national).length;
  const natArm = results.filter(r => r.side === 'armed' && !r.failed && r.national).length;
  const daysCtl = results.filter(r => r.side === 'control' && !r.failed).map(r => r.gameDays).sort((a, b) => a - b);
  const daysArm = results.filter(r => r.side === 'armed' && !r.failed).map(r => r.gameDays).sort((a, b) => a - b);
  const med = a => a.length ? (a.length % 2 ? a[Math.floor(a.length / 2)] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2) : null;
  const skipsArm = results.filter(r => r.side === 'armed' && !r.failed).reduce((t, r) => t + (r.smokeSkips || 0), 0);
  console.log('\n==== PAIRED ANALYSIS ====');
  console.log(`pairs: ${pairs.length}, paired-median waste-rate ratio (armed/control): ${pairedMedian == null ? 'null' : pairedMedian.toFixed(4)} (GO <= 0.85)`);
  console.log(`direction: improved=${improved} worsened=${worsened}`);
  console.log(`per-pair ratios: ${pairs.map(p => p.ratio.toFixed(3)).join(', ')}`);
  console.log(`starvation deaths: control=${starvCtl} armed=${starvArm} (VETO: armed must not exceed control)`);
  console.log(`national: control=${natCtl} armed=${natArm}`);
  console.log(`median survival: control=${med(daysCtl)} armed=${med(daysArm)}`);
  console.log(`armed smoke-pass skips (mechanism engagement): ${skipsArm}`);
  const summary = { pairs, pairedMedian, improved, worsened, starvCtl, starvArm, natCtl, natArm,
    medCtl: med(daysCtl), medArm: med(daysArm), skipsArm, results };
  fs.writeFileSync(path.join(__dirname, '..', 'evidence', DATE, 'cookdrive2-sweep-summary-20261017.json'),
    JSON.stringify(summary, null, 1));
  console.log('summary written.');
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
