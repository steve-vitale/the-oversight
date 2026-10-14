#!/usr/bin/env node
// scripts/sweep-predcond-20261014.js — scale-wall consumer-arm driver.
//
// Measures the PREDDISC-CONSUMER conditional spiral posture
// (scripts/policies/predcond.js, gate PREDCOND=1) layered on leadfeast
// (FEASTSCALE_R13=1):
//   baseline: leadfeast (FEASTSCALE_R13=1, PREDCOND off)
//   armed:    predcond   (FEASTSCALE_R13=1, PREDCOND=1)
// 8 pilot seeds (11/22/33/44/55/66/77/88), 180d death-aware, identical seeds,
// one process.
//
// PRE-REGISTERED (evidence/2026-10-14/sim-predcond.md — MEASUREMENT §§9-12,14):
//   PRIMARY: mean post-unlock survival days among wave-5 unlockers
//     >= baseline + 15d.
//   GUARDRAILS: overall median survival >= baseline-10d; national >=
//     baseline-2; no new death mode (n>=3 family floor); table/waves
//     report-only.
//   THIN-N RULE: if unlocks < 2 on BOTH sides -> UNMEASURABLE -> kill per §9,
//     no confirm spend.
//   A miss is NO-GO — never re-scored mid-run.
//   #172 CAVEAT: if the pilot produces ZERO predation-positive classifications
//     on current master, do NOT claim a null — validate the trigger + verb
//     fork in the constructed forced-gorge scenario instead.
//   #189: gorge instrumentation installed DRIVER-SIDE for both arms, so the
//     control has gorge telemetry too.
// TOOLING ONLY — no game balance changes.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
// NAMED-EXPORT UNWRAP (the 2026-10-14 unwrap bug ran a whole suite
// policy-less): require the named export, verify policy.daily is a function.
const { leadfeast } = require('./policies/feastscale');
const { predcond } = require('./policies/predcond');
if (typeof leadfeast.daily !== 'function') throw new Error('unwrap: leadfeast.daily is not a function');
if (typeof predcond.daily !== 'function') throw new Error('unwrap: predcond.daily is not a function');
const POLICY_REGISTRY = { leadfeast, predcond };
const { attachScale, scaleRow, finalizeScale } = require('./scale-repro-20261013');
const { attachFeast, finalizeFeast } = require('./sweep-feastscale-20261013');
const { installPredation, finalizePredation } = require('./predation-lib-20261014');
const fc = require('./food-coupling-20261013');

function scholarDay(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function unlockedWave(Game) { try { return (Game.unlockedWave ? Game.unlockedWave() : 1) | 0; } catch (e) { return 1; } }

function tableRow(Game) {
  const r = { seat: 'none', gw: [0, 0, 0, 0, 0], gok: false, waiting: false, done: false };
  try { const s = Game.tableSeat ? Game.tableSeat() : null; if (s) r.seat = s.seat || 'none'; } catch (e) {}
  try { const g = Game.deedGateReady ? Game.deedGateReady() : null; if (g) { r.gw = [g.w1 | 0, g.w2 | 0, g.w3 | 0, g.w4 | 0, g.w5 | 0]; r.gok = !!g.ok; } } catch (e) {}
  try { const pg = Game.progState(); r.waiting = !!pg.tableWaiting; r.done = !!pg.tableDone; } catch (e) {}
  return r;
}

const SAY_RE = /brace|posture|spiral|fifth wave|wave-5|table|seat|haven|monster|beast|fight|defend|feast|starv|died|dead|succession|ranging|pantry|forage|haul|endure|conserve|loosen/i;

async function main() {
  const label = process.env.LEVER || 'predcond';
  const smoke = process.env.SMOKE === '1';
  const seeds = smoke ? [44]
    : (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'leadfeast,predcond').split(',').map(s => s.trim()).filter(Boolean);
  const days = smoke ? 60 : parseInt(process.env.DAYS || '180', 10);
  const t0 = Date.now();
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    if (typeof base.daily !== 'function') throw new Error('unwrap: ' + pid + '.daily is not a function');
    process.env.FEASTSCALE_R13 = '1';
    if (pid === 'predcond') process.env.PREDCOND = '1';
    else delete process.env.PREDCOND;
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'predcond-' + pid });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      attachScale(Game, m);
      const ft = attachFeast(Game);
      // #189: driver-side gorge instrumentation for BOTH arms
      const ptrack = installPredation(Game);
      const sayCap = { lines: [] };
      const origSay = Game.say ? Game.say.bind(Game) : null;
      Game.say = function (msg) {
        try {
          if (run.unlockDay5 != null && scholarDay(Game) >= run.unlockDay5) {
            const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
            if (SAY_RE.test(text) && sayCap.lines.length < 300) {
              sayCap.lines.push({ day: scholarDay(Game), text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 240) });
            }
          }
        } catch (e) {}
        return origSay ? origSay(msg) : msg;
      };
      const st = { max: { total: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 } };
      const tb = { seat: 'none', seatDay: null, gw: [0, 0, 0, 0, 0], gok: false, waitingDay: null, doneDay: null };
      const run = { unlockDay5: null, lastCtx: null, scholarVids: [], unlockSample: null, wcEngageDays: 0 };
      const vidOf = (G) => { try { const sc = (G.state || {}).scholar || {}; return sc.villagerId || sc.id || null; } catch (e) { return null; } };
      const origDaily = base.daily;
      const policy = Object.assign({}, base);
      policy.daily = (G, ctx) => {
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(scaleRow(G)); } catch (e) {}
        try { ptrack.sampleDay(); } catch (e) {}
        try {
          const day = scholarDay(G), vid = vidOf(G);
          const prev = run.scholarVids.length ? run.scholarVids[run.scholarVids.length - 1] : null;
          if (prev && prev.vid && vid && prev.vid !== vid) run.scholarVids.push({ day, vid, died: true });
          else if (!prev || prev.day !== day) run.scholarVids.push({ day, vid, died: false });
          if (run.unlockDay5 == null && unlockedWave(G) >= 5) {
            run.unlockDay5 = day;
            run.unlockSample = { scholarDeaths30d: run.scholarVids.filter(e => e.died && e.day > day - 30).length };
          }
          if (ctx && ctx._pcEngaged) run.wcEngageDays++;
        } catch (e) {}
        try {
          if (scholarDay(G) % 5 === 0) {
            const tr = tableRow(G);
            const so = { none: 0, lesser: 1, full: 2 }[tr.seat] || 0;
            const bo = { none: 0, lesser: 1, full: 2 }[tb.seat] || 0;
            if (so > bo) { tb.seat = tr.seat; tb.seatDay = scholarDay(G); }
            for (let i = 0; i < 5; i++) tb.gw[i] = Math.max(tb.gw[i], tr.gw[i]);
            tb.gok = tb.gok || tr.gok;
            if (tr.waiting && tb.waitingDay == null) tb.waitingDay = scholarDay(G);
            if (tr.done && tb.doneDay == null) tb.doneDay = scholarDay(G);
          }
        } catch (e) {}
        if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
        run.lastCtx = ctx;
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      const pred = finalizePredation(Game, ptrack);
      const feas = finalizeFeast(Game, ft);
      const c = run.lastCtx || {};
      const windowSay = run.unlockDay5 != null
        ? sayCap.lines.filter(l => l.day >= run.unlockDay5).slice(0, 120)
        : [];
      const fin = finalizeScale(Game, m);
      const row = Object.assign({ label, policy: pid, seed, smoke },
        fc.finalize(Game, m, result), fin, feas,
        {
          days: result.days, endReason: result.endReason,
          standingMax: st.max,
          arc: (Game.progState ? (Game.progState() || {}).arc : null) || null,
          deaths: (result.samples && result.samples.deaths) || [],
          unlockDay5: run.unlockDay5,
          postUnlockDays: run.unlockDay5 != null ? (result.days - run.unlockDay5) : null,
          seat: tb.seat, seatDay: tb.seatDay, deedGateWaves: tb.gw, deedGateOk: tb.gok,
          tableWaitingDay: tb.waitingDay, tableDoneDay: tb.doneDay,
          nationalHeldDays: fin.nationalHeldDays || 0,
          table: tb.seat !== 'none', won: !!tb.doneDay, exiledEver: !!fin.exiledEver,
          vests: fin.vests || 0, wpActive: feas.wpActive || 0,
          // driver-side gorge telemetry (#189 — both arms)
          gorgeNights: pred.gorgeNights, totalGorged: pred.totalGorged, w5Gorged: pred.w5Gorged,
          // predcond telemetry (armed side; absent on control)
          pcActiveRuns: c._pcEngaged || c._wcEngages ? 1 : 0,
          pcEngages: c._wcEngages || 0, pcDisengages: c._wcDisengages || 0,
          pcEngageDays: run.wcEngageDays,
          pcEngageTypes: c._pcEngageTypes || [],
          pcEngageDaysList: c._pcEngageDays || [],
          pcDisengageDaysList: c._pcDisengageDays || [],
          pcLastClass: c._pcLastClass || null,
          pcMonsterTileDeclined: c.wcMonsterTileDeclined || 0,
          pcFarTravelDeclined: c.wcFarTravelDeclined || 0,
          pcProposalsPaused: c.wcProposalsPaused || 0,
          pcTopUpFeasts: c.wcTopUpFeasts || 0,
          pcHomeReturns: c.wcHomeReturns || 0,
          pcForageTrips: c.wvForageTrips || 0,
          pcHauled: c.hauled || 0,
          pcMarkerHist: (c._pcMarkerHist || []).filter(h => h.markers && h.markers.length),
          u5ScholarDeaths30d: run.unlockSample ? run.unlockSample.scholarDeaths30d : null,
          windowSay,
          instrErrors: (pred.instrErrors || []).length,
        });
      rows.push(row);
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} u5day=${row.unlockDay5 != null ? row.unlockDay5 : '-'} postU=${row.postUnlockDays != null ? row.postUnlockDays : '-'} nat=${row.nationalHeldDays > 0 ? 1 : 0} seat=${row.seat} gorgeN=${row.gorgeNights} pcEng=${row.pcEngages} pcTypes=${JSON.stringify(row.pcEngageTypes)}`);
    }
  }
  delete process.env.PREDCOND;
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const mean = (vs) => vs.length ? vs.reduce((t, v) => t + v, 0) / vs.length : null;
  const per = (pid) => rows.filter(r => r.policy === pid);
  const sum = (rs, fn) => rs.reduce((t, r) => t + fn(r), 0);
  const causeTallies = {};
  for (const r of rows) for (const d of r.deaths) {
    const k = (d.kind || 'unknown') + '/' + (d.player ? 'player' : 'villager');
    causeTallies[k] = (causeTallies[k] || 0) + 1;
  }
  const agg = (pid) => {
    const rs = per(pid);
    const unl = rs.filter(r => r.unlockDay5 != null);
    const postU = unl.map(r => r.postUnlockDays);
    return {
      policy: pid, runs: rs.length,
      wave5unlock: unl.length,
      unlockDays: unl.map(r => r.unlockDay5),
      meanPostUnlock: mean(postU) != null ? +mean(postU).toFixed(1) : null,
      medPostUnlock: postU.length ? med(postU) : null,
      tableAmongUnlockers: sum(unl, r => (r.table ? 1 : 0)),
      seatAmongUnlockers: unl.map(r => r.seat).join(','),
      national: sum(rs, r => (r.nationalHeldDays > 0 ? 1 : 0)),
      table: sum(rs, r => r.table),
      won: sum(rs, r => r.won),
      exiled: sum(rs, r => (r.exiledEver ? 1 : 0)),
      medianDays: med(rs.map(r => r.days)),
      maxDays: Math.max(...rs.map(r => r.days)),
      gorgeNights: sum(rs, r => r.gorgeNights),
      totalGorged: sum(rs, r => r.totalGorged),
      w5Gorged: sum(rs, r => r.w5Gorged),
      pcEngages: sum(rs, r => r.pcEngages),
      pcDisengages: sum(rs, r => r.pcDisengages),
      pcEngageDays: sum(rs, r => r.pcEngageDays),
      pcEngageTypes: rs.map(r => r.pcEngageTypes).flat(),
      pcTopUpFeasts: sum(rs, r => r.pcTopUpFeasts),
      pcForageTrips: sum(rs, r => r.pcForageTrips),
      pcHauled: sum(rs, r => r.pcHauled),
      pcProposalsPaused: sum(rs, r => r.pcProposalsPaused),
    };
  };
  const s = {
    label, runs: rows.length, days, smoke, ms: Date.now() - t0,
    perPolicy: policyIds.map(agg), deathCauses: causeTallies,
  };
  console.log('\n== per-policy ==');
  for (const a of s.perPolicy) console.log(' ', JSON.stringify(a));
  console.log('deathCauses:', JSON.stringify(causeTallies));
  const out = process.env.OUT;
  const rep = { summary: s, rows };
  if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  else console.log(JSON.stringify(s.perPolicy));
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}
