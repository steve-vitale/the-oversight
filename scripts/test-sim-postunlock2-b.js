#!/usr/bin/env node
// test-sim-postunlock2-b.js — proof tests for arm sim-postunlock2-b
// (axis scale-onramp, run fleshout-20261024T0925Z).
// Namespace sim-postunlock2-b-*.
//
// Gates (ALL GREEN required before the evidence counts):
//   E1 instrument determinism: SW.oneRun(70801,lead) twice -> the judged
//      payload is BYTE-IDENTICAL (sha256).
//   E2 instrument behavior-neutrality: instrumented vs no-instrument runs
//      of the same config agree on {days, endReason, maxWave, death totals}.
//   E3 CENSUS bar (pre-registered DIAG-GO, this run): all 16 pilot files
//      present AND every door-open config carries window attribution
//      (w5Day, endReason, national/table at end, days-survived-post-door
//      computable). A miss is NO-GO, never re-scored — the gate reports it.
//      NOTE: E3 does NOT require any particular door count — the door
//      count IS the measurement.
//   E4 row-schema gate: every person death row in the new corpus carries
//      cause, day, overtime tier, village bars, and honest fight linkage.
//   E5 sayRing mechanism: a short narration:true run fills sayRing
//      (sayLive=true); narration:false leaves it empty by harness design.
//
// Run with the pinned wallseg substrate env (see the sweep header).
// Exits 0 iff every gate passes.
'use strict';
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const REPO = process.env.REPO || path.join(__dirname, '..');

const PINNED = { FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', KILLDISC: '1', ARMORYDRIVE: '1', ARMORVILLAGE: '1', VETFORMATION: '1', TRUSTBUFFER: '1', LINKFORM: '2' };
for (const [k, v] of Object.entries(PINNED)) {
  if (process.env[k] !== v) { console.error(`TEST STOP: ${k}=${v} required (pinned substrate).`); process.exit(2); }
}

const WS = require(path.join(REPO, 'scripts', 'wallseg-sweep'));
const SW = require(path.join(REPO, 'scripts', 'sim-postunlock2-b-sweep'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function gate(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function sha(o) { return crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex'); }
function judged(r) {
  return {
    unlock: r.unlock, days: r.days, gameDays: r.gameDays, endReason: r.endReason,
    maxWave: r.maxWave, national: r.national, table: r.table, won: r.won, exiled: r.exiled,
    deaths: r.deaths, starvation: r.starvation,
    postunlockDeaths: r.postunlockDeaths, postunlockFights: r.postunlockFights,
    instrumentErrors: r.instrumentErrors,
  };
}

async function noInstrRun(seed, base) {
  const policy = WS.policyFor(base);
  const { Game } = await loadGame({ seed, mode: 'wallseg', fullTelemetry: false });
  await setupGame(Game);
  const result = await quietLog(async () => runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }));
  const deaths = {};
  for (const d of (result.samples.deaths || [])) {
    const k = String(d.cause || d.kind || 'unknown'); deaths[k] = (deaths[k] || 0) + 1;
  }
  return { days: result.days, endReason: result.endReason, maxWave: result.maxWaveUnlocked, deaths };
}

async function main() {
  const a = await SW.oneRun(70801, 'lead', { write: false });
  const b = await SW.oneRun(70801, 'lead', { write: false });
  const ha = sha(judged(a)), hb = sha(judged(b));
  gate('E1 determinism (byte-identical re-run)', ha === hb, `sha ${ha.slice(0, 12)} vs ${hb.slice(0, 12)}; instrumentErrors=${JSON.stringify(a.instrumentErrors)}`);

  const ni = await noInstrRun(70801, 'lead');
  const e2ok = ni.days === a.days && ni.endReason === a.endReason && ni.maxWave === a.maxWave &&
    JSON.stringify(ni.deaths) === JSON.stringify(a.deaths);
  gate('E2 behavior-neutrality (instrument observes, never steers)', e2ok,
    `instr days=${a.days}/${a.endReason}/w${a.maxWave} vs plain days=${ni.days}/${ni.endReason}/w${ni.maxWave}; deaths match=${JSON.stringify(ni.deaths) === JSON.stringify(a.deaths)}`);

  const EVID = path.join(REPO, 'evidence', '2026-10-24', 'perseed-postunlock2-b');
  let files = 0, doors = 0, attributed = 0, missing = [], unattributed = [];
  for (const s of [70801, 70802, 70803, 70804, 70805, 70806, 70807, 70808, 70809, 70810, 70811, 70812, 70813, 70814, 70815, 70816]) {
    for (const bb of ['lead', 'belong']) {
      const fn = path.join(EVID, `s${s}-${bb}.json`);
      if (!fs.existsSync(fn)) { missing.push(`s${s}-${bb}`); continue; }
      files++;
      const d = JSON.parse(fs.readFileSync(fn, 'utf8'));
      if (d.unlock && d.unlock.w5Day != null) {
        doors++;
        const ok = d.days != null && d.endReason != null && d.national != null && d.table != null &&
          (d.days - d.unlock.w5Day) >= 0 && Array.isArray(d.postunlockDeaths) && Array.isArray(d.postunlockFights);
        if (ok) attributed++; else unattributed.push(`s${s}-${bb}`);
      }
    }
  }
  gate('E3 CENSUS bar (32 files + every door-open config window-attributed)', missing.length === 0 && files === 32 && attributed === doors,
    `files=${files}/32 missing=[${missing.join(',')}] doors=${doors} attributed=${attributed} unattributed=[${unattributed.join(',')}]`);

  let rows = 0, bad = [];
  for (const s of [70801, 70802, 70803, 70804, 70805, 70806, 70807, 70808, 70809, 70810, 70811, 70812, 70813, 70814, 70815, 70816]) {
    for (const bb of ['lead', 'belong']) {
      const fn = path.join(EVID, `s${s}-${bb}.json`);
      if (!fs.existsSync(fn)) continue;
      const d = JSON.parse(fs.readFileSync(fn, 'utf8'));
      for (const r of (d.postunlockDeaths || [])) {
        if (r.person === false) continue;
        rows++;
        const okCause = r.cause != null && r.day != null;
        const okOt = r.overtime && typeof r.overtime.tier === 'number' && r.overtime.tier >= 0;
        const okBars = r.village && r.village.armored >= 0 && r.village.armed >= 0 && r.village.veterans >= 0;
        const okFight = !r.combatCause || (r.oppMid != null && r.fight != null) ||
          r.fightBasis === 'cause-names-monster' ||
          (r.nearestFight != null && r.nearestFight.dayDistance != null);
        if (!(okCause && okOt && okBars && okFight)) bad.push(`s${s}-${bb} d${r.day} ${r.whoName} cause=${okCause} ot=${okOt} bars=${okBars} fight=${okFight} basis=${r.fightBasis}`);
      }
    }
  }
  gate('E4 row-schema (attribution fields complete)', bad.length === 0, `${rows} death rows checked; bad=${bad.length}${bad.length ? ' e.g. ' + bad[0] : ''}`);

  async function shortRun(narration) {
    const policy = WS.policyFor('lead');
    const { Game } = await loadGame({ seed: 70801, mode: 'wallseg', fullTelemetry: false, narration });
    const t = {};
    const PI = require(path.join(REPO, 'scripts', 'postunlock-instrument'));
    const uninstall = PI.install(Game, t);
    await setupGame(Game);
    await quietLog(async () => runDays(Game, policy, { days: 25, manifest: undefined, sampleEvery: 30 }));
    try { uninstall(); } catch (e) {}
    return { n: (t.sayRing || []).length, sayLive: !!t.sayLive };
  }
  const on = await shortRun(true);
  const off = await shortRun(false);
  gate('E5 sayRing mechanism (narration:true fills, false empty by design)', on.n > 0 && on.sayLive === true && off.sayLive === false,
    `narration:true ring=${on.n} sayLive=${on.sayLive}; narration:false sayLive=${off.sayLive}`);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('TEST FAILED:', (e && e.stack) || e); process.exit(1); });
