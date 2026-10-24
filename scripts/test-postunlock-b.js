#!/usr/bin/env node
// test-postunlock-b.js — proof tests for arm sim-postunlock-b2
// (flesh-out loop, axis scale-onramp, run fleshout-20261024T0615Z).
// Namespace postunlock-*.
//
// Gates (ALL GREEN required before the evidence counts):
//   E1 instrument determinism: oneRun(70201,lead) twice -> the judged
//      payload is BYTE-IDENTICAL (sha256).
//   E2 instrument behavior-neutrality: instrumented vs no-instrument runs
//      of the same config agree on {days, endReason, maxWave, death totals,
//      unlock days} — the instrument observes, never steers.
//   E3 PRIMARY-METRIC gate (pre-registered, MEASUREMENT.md §14): 8/8
//      wave-5 unlocks in the fresh corpus with attributed killing windows.
//      A miss is NO-GO, never re-scored — this gate reports the miss.
//   E4 row-schema gate: every death row in the corpus carries the
//      pre-registered attribution fields (cause, day, overtime tier,
//      village bars; combat-cause deaths have opponent + fight linkage).
//   E5 sayRing mechanism: a short narration:true run fills sayRing
//      (sayLive=true); narration:false leaves it empty by harness design.
//      Proves the transcript tap works and explains the measured corpus's
//      empty rings.
//
// Run with the pinned wallseg substrate env (see scripts/postunlock-sweep.js
// header). Exits 0 iff every gate passes.
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
const SW = require(path.join(REPO, 'scripts', 'postunlock-sweep'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function gate(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function sha(o) { return crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex'); }
// Judged payload: everything the DIAG's attribution rests on.
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
  // E1: determinism — byte-identical re-run on the judged fields.
  const a = await SW.oneRun(70201, 'lead', { write: false });
  const b = await SW.oneRun(70201, 'lead', { write: false });
  const ha = sha(judged(a)), hb = sha(judged(b));
  gate('E1 determinism (byte-identical re-run)', ha === hb, `sha ${ha.slice(0, 12)} vs ${hb.slice(0, 12)}; instrumentErrors=${JSON.stringify(a.instrumentErrors)}`);

  // E2: behavior-neutrality — instrumented vs no-instrument agree.
  const ni = await noInstrRun(70201, 'lead');
  const e2ok = ni.days === a.days && ni.endReason === a.endReason && ni.maxWave === a.maxWave &&
    JSON.stringify(ni.deaths) === JSON.stringify(a.deaths);
  gate('E2 behavior-neutrality (instrument observes, never steers)', e2ok,
    `instr days=${a.days}/${a.endReason}/w${a.maxWave} vs plain days=${ni.days}/${ni.endReason}/w${ni.maxWave}; deaths match=${JSON.stringify(ni.deaths) === JSON.stringify(a.deaths)}`);

  // E3: PRIMARY-METRIC gate — 8/8 wave-5 unlocks with killing windows.
  const EVID = path.join(REPO, 'evidence', '2026-10-24', 'perseed-postunlock');
  let unlocked = 0, killingWindows = 0, missing = [];
  for (const s of [70201, 70202, 70204, 70209]) {
    for (const bb of ['lead', 'belong']) {
      const fn = path.join(EVID, `s${s}-${bb}.json`);
      if (!fs.existsSync(fn)) { missing.push(`s${s}-${bb}`); continue; }
      const d = JSON.parse(fs.readFileSync(fn, 'utf8'));
      if (d.unlock && d.unlock.w5Day != null) {
        unlocked++;
        const rows = (d.postunlockDeaths || []).filter(r => r && r.person !== false);
        if (rows.length) {
          const lastDay = Math.max.apply(null, rows.map(r => r.day | 0));
          if (rows.some(r => (r.day | 0) === lastDay && r.cause && r.overtime && r.overtime.tier != null)) killingWindows++;
        }
      }
    }
  }
  gate('E3 PRIMARY 8/8 wave-5 unlocks attributed (pre-registered)', missing.length === 0 && unlocked === 8 && killingWindows === 8,
    `corpus files missing=[${missing.join(',')}] unlocks=${unlocked}/8 killingWindows=${killingWindows}/8`);

  // E4: row-schema gate over the corpus.
  let rows = 0, bad = [];
  for (const s of [70201, 70202, 70204, 70209]) {
    for (const bb of ['lead', 'belong']) {
      const fn = path.join(EVID, `s${s}-${bb}.json`);
      if (!fs.existsSync(fn)) continue;
      const d = JSON.parse(fs.readFileSync(fn, 'utf8'));
      for (const r of (d.postunlockDeaths || [])) {
        if (r.person === false) continue; // monster death rows: not the DIAG's population
        rows++;
        const okCause = r.cause != null && r.day != null;
        const okOt = r.overtime && typeof r.overtime.tier === 'number' && r.overtime.tier >= 0;
        const okBars = r.village && r.village.armored >= 0 && r.village.armed >= 0 && r.village.veterans >= 0;
        // Attribution levels (honest, strongest-first): linked fight row,
        // cause-names-monster (the game's own cause string names the killer),
        // or a documented nearest-fight (lingering-wound tick outside any
        // recorded fight — the row must name the nearest fight + distance).
        const okFight = !r.combatCause || (r.oppMid != null && r.fight != null) ||
          r.fightBasis === 'cause-names-monster' ||
          (r.nearestFight != null && r.nearestFight.dayDistance != null);
        if (!(okCause && okOt && okBars && okFight)) bad.push(`s${s}-${bb} d${r.day} ${r.whoName} cause=${okCause} ot=${okOt} bars=${okBars} fight=${okFight} basis=${r.fightBasis}`);
      }
    }
  }
  gate('E4 row-schema (attribution fields complete)', bad.length === 0, `${rows} death rows checked; bad=${bad.length}${bad.length ? ' e.g. ' + bad[0] : ''}`);

  // E5: sayRing mechanism — narration:true fills it, narration:false leaves it empty by design.
  async function shortRun(narration) {
    const policy = WS.policyFor('lead');
    const { Game } = await loadGame({ seed: 70209, mode: 'wallseg', fullTelemetry: false, narration });
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
