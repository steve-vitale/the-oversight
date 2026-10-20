#!/usr/bin/env node
// scripts/sweep-condposture-20261020.js — scale-onramp r26 driver.
//
// GATE 0 (substrate): PASSES=1 (default), leadfeast only — does wave-5 unlock
//   at all on current master? THIN-N RULE: <2 unlocks -> UNMEASURABLE.
// GATE 1 (noise):     PASSES=2, leadfeast only — two passes, per-seed
//   fingerprint bit-identical? Any divergence -> noise-dominated, kill.
// PILOT:              POLICIES=leadfeast,condfeast — runs only after both gates
//   pass; requires scripts/policies/condposture.js (CONDPOSTURE=1).
//
// PRE-REGISTERED (evidence/2026-10-20/sim-condposture.md — MEASUREMENT §§9-12,14):
//   PRIMARY: aggregate post-unlock scholar death rate armed <= 0.8x control.
//   CO-PRIMARY: strong-seed median postU days armed >= control - 20%.
//   GUARDRAILS: wave-5 unlocks >= control; median survival ±10d; national >=
//     control-2; no new death modes.
//   A miss is NO-GO — never re-scored mid-run.
//
// TOOLING ONLY — no game balance changes.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const fc = require('./food-coupling-20261013');

process.env.FEASTSCALE_R13 = '1';

// condfeast is lazy: gates pass before the layer is built.
let condfeast = null;
try { condfeast = require('./policies/condposture').condfeast; } catch (e) {}

const SAY_RE = /brace|posture|fifth wave|wave-5|table|seat|haven|monster|beast|fight|defend|feast|starv|died|dead|succession|ranging|scholars lost/i;

function scholarDay(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function unlockedWave(Game) { try { return (Game.unlockedWave ? Game.unlockedWave() : 1) | 0; } catch (e) { return 1; } }
function standingRow(Game) {
  try {
    const s = Game.villageStanding();
    return { total: s.total | 0, war: s.war | 0, diplomacy: s.diplomacy | 0, plenty: s.plenty | 0,
             warPts: s.warPts | 0, links: s.links | 0, feasts: s.feasts | 0 };
  } catch (e) { return null; }
}
function tableRow(Game) {
  const r = { seat: 'none', waiting: false, done: false };
  try { const s = Game.tableSeat ? Game.tableSeat() : null; if (s) r.seat = s.seat || 'none'; } catch (e) {}
  try { const pg = Game.progState(); r.waiting = !!pg.tableWaiting; r.done = !!pg.tableDone; } catch (e) {}
  return r;
}

async function oneRun(seed, pid, base, pass) {
  if (pid === 'condfeast') process.env.CONDPOSTURE = '1';
  else delete process.env.CONDPOSTURE;
  const { Game } = await loadGame({ seed, mode: 'condposture-' + pid + '-p' + pass });
  await setupGame(Game);
  const m = fc.attachInstruments(Game);
  const sayCap = { lines: [] };
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const run = { unlockDay5: null, scholarVids: [], lastCtx: null, cpEngageDays: 0 };
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
  const vidOf = (G) => { try { const sc = (G.state || {}).scholar || {}; return sc.villagerId || sc.id || null; } catch (e) { return null; } };
  const st = { max: { total: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 } };
  const tb = { seat: 'none', seatDay: null, waitingDay: null, doneDay: null };
  const origDaily = base.daily;
  const policy = Object.assign({}, base);
  policy.daily = (G, ctx) => {
    try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
    try {
      const r = standingRow(G);
      if (r) for (const k of Object.keys(st.max)) if (r[k] > st.max[k]) st.max[k] = r[k];
    } catch (e) {}
    try {
      const day = scholarDay(G), vid = vidOf(G);
      const prev = run.scholarVids.length ? run.scholarVids[run.scholarVids.length - 1] : null;
      if (prev && prev.vid && vid && prev.vid !== vid) run.scholarVids.push({ day, vid, died: true });
      else if (!prev || prev.day !== day) run.scholarVids.push({ day, vid, died: false });
      if (run.unlockDay5 == null && unlockedWave(G) >= 5) run.unlockDay5 = day;
      if (ctx && ctx._cpEngaged) run.cpEngageDays++;
    } catch (e) {}
    try {
      if (scholarDay(G) % 5 === 0) {
        const tr = tableRow(G);
        const so = { none: 0, lesser: 1, full: 2 }[tr.seat] || 0;
        const bo = { none: 0, lesser: 1, full: 2 }[tb.seat] || 0;
        if (so > bo) { tb.seat = tr.seat; tb.seatDay = scholarDay(G); }
        if (tr.waiting && tb.waitingDay == null) tb.waitingDay = scholarDay(G);
        if (tr.done && tb.doneDay == null) tb.doneDay = scholarDay(G);
      }
    } catch (e) {}
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    run.lastCtx = ctx;
  };
  const result = await runDays(Game, policy, { days: parseInt(process.env.DAYS || '180', 10), sampleEvery: 10 });
  delete process.env.CONDPOSTURE;
  const fin = fc.finalize(Game, m, result);
  const c = run.lastCtx || {};
  const sdDeaths = run.scholarVids.filter(e => e.died);
  const postUDeaths = run.unlockDay5 != null ? sdDeaths.filter(e => e.day > run.unlockDay5) : [];
  const windowSay = run.unlockDay5 != null
    ? sayCap.lines.filter(l => l.day >= run.unlockDay5).slice(0, 120)
    : [];
  return {
    policy: pid, pass, seed,
    days: result.days, endReason: result.endReason,
    unlockDay5: run.unlockDay5,
    postUnlockDays: run.unlockDay5 != null ? (result.days - run.unlockDay5) : null,
    scholarDeathDays: sdDeaths.map(e => e.day),
    postUnlockScholarDeaths: postUDeaths.length,
    postUnlockScholarDeathDays: postUDeaths.map(e => e.day),
    seat: tb.seat, seatDay: tb.seatDay,
    tableWaitingDay: tb.waitingDay, tableDoneDay: tb.doneDay,
    national: fin.national, table: fin.table, won: fin.won, vests: fin.vests,
    rank: fin.rank, arc: fin.arc, maxWave: fin.maxWave,
    standingMax: st.max, t4Ever: st.max.total >= 100, t5Ever: st.max.total >= 200,
    deaths: (result.samples && result.samples.deaths) || [],
    starveDays: fin.starveDays,
    cpEngageDays: run.cpEngageDays,
    cpEngages: c._cpEngages || 0, cpDisengages: c._cpDisengages || 0,
    cpMonsterTileDeclined: c.cpMonsterTileDeclined || 0,
    cpFarTravelDeclined: c.cpFarTravelDeclined || 0,
    cpProposalsPaused: c.cpProposalsPaused || 0,
    cpTopUpFeasts: c.cpTopUpFeasts || 0,
    cpHomeReturns: c.cpHomeReturns || 0,
    windowSay,
  };
}

function fingerprint(r) {
  return JSON.stringify({ days: r.days, endReason: r.endReason, unlockDay5: r.unlockDay5,
    postUnlockDays: r.postUnlockDays, scholarDeathDays: r.scholarDeathDays,
    seat: r.seat, national: r.national, table: r.table, won: r.won, maxWave: r.maxWave });
}

async function main() {
  const label = process.env.LEVER || 'condposture';
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'leadfeast').split(',').map(s => s.trim()).filter(Boolean);
  const passes = parseInt(process.env.PASSES || '1', 10);
  const REG = { leadfeast };
  if (condfeast) REG.condfeast = condfeast;
  const t0 = Date.now();
  const rows = [];
  for (const pid of policyIds) {
    const base = REG[pid];
    if (!base) { console.error('unknown policy (layer not built?): ' + pid); process.exit(1); }
    for (let p = 1; p <= passes; p++) {
      for (const seed of seeds) {
        const row = await oneRun(seed, pid, base, p);
        rows.push(row);
        console.log(`  [${pid} p${p} s${seed}] d=${row.days} ${row.endReason} wave=${row.maxWave} u5day=${row.unlockDay5 != null ? row.unlockDay5 : '-'} postU=${row.postUnlockDays != null ? row.postUnlockDays : '-'} u5deaths=${row.postUnlockScholarDeaths} nat=${row.national} table=${row.table} won=${row.won} seat=${row.seat}`);
      }
    }
  }
  // GATE 1: pass1-vs-pass2 fingerprint identity per seed
  let detReport = null;
  if (passes >= 2) {
    detReport = seeds.map(seed => {
      const a = rows.find(r => r.policy === policyIds[0] && r.seed === seed && r.pass === 1);
      const b = rows.find(r => r.policy === policyIds[0] && r.seed === seed && r.pass === 2);
      const same = a && b && fingerprint(a) === fingerprint(b);
      return { seed, identical: !!same,
        a: a ? JSON.parse(fingerprint(a)) : null, b: b ? JSON.parse(fingerprint(b)) : null };
    });
    console.log('\n== GATE 1 det ==');
    for (const d of detReport) console.log('  seed', d.seed, d.identical ? 'IDENTICAL' : 'DIVERGED');
  }
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const per = (pid, p) => rows.filter(r => r.policy === pid && (p == null || r.pass === p));
  const sum = (rs, fn) => rs.reduce((t, r) => t + fn(r), 0);
  const agg = (pid, p) => {
    const rs = per(pid, p);
    const unl = rs.filter(r => r.unlockDay5 != null);
    const postU = unl.map(r => r.postUnlockDays);
    const puDeaths = sum(unl, r => r.postUnlockScholarDeaths);
    const puDays = sum(unl, r => r.postUnlockDays);
    return {
      policy: pid, pass: p == null ? 'all' : p, runs: rs.length,
      wave5unlock: unl.length, unlockDays: unl.map(r => r.unlockDay5),
      meanPostUnlock: postU.length ? +(postU.reduce((t, v) => t + v, 0) / postU.length).toFixed(1) : null,
      medPostUnlock: postU.length ? med(postU) : null,
      postUnlockScholarDeaths: puDeaths, postUnlockDays: puDays,
      deathRate: puDays > 0 ? +(puDeaths / puDays).toFixed(4) : null,
      national: sum(rs, r => r.national), table: sum(rs, r => r.table),
      won: sum(rs, r => r.won), vests: sum(rs, r => r.vests),
      medianDays: med(rs.map(r => r.days)), maxDays: Math.max(...rs.map(r => r.days)),
      t4: sum(rs, r => (r.t4Ever ? 1 : 0)), t5: sum(rs, r => (r.t5Ever ? 1 : 0)),
      wave4: sum(rs, r => (r.maxWave >= 4 ? 1 : 0)), wave5: sum(rs, r => (r.maxWave >= 5 ? 1 : 0)),
      cpEngageDays: sum(rs, r => r.cpEngageDays), cpEngages: sum(rs, r => r.cpEngages),
    };
  };
  const s = { label, seeds, passes, days: parseInt(process.env.DAYS || '180', 10),
    ms: Date.now() - t0, perPolicy: policyIds.flatMap(pid => {
      if (passes >= 2) return [agg(pid, 1), agg(pid, 2)];
      return [agg(pid)];
    }), detReport };
  console.log('\n== per-policy ==');
  for (const a of s.perPolicy) console.log(' ', JSON.stringify(a));
  const out = process.env.OUT;
  if (out) { fs.writeFileSync(out, JSON.stringify({ summary: s, rows }, null, 1)); console.error('wrote ' + out); }
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}
