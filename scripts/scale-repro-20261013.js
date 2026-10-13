#!/usr/bin/env node
// scripts/scale-repro-20261013.js — PHASE 2 of scale-wall r6 (2026-10-13).
// The scale-push starvation repro: run scale-pushing policies (belongseek,
// leadcourt, scalecourt) on the suite seeds with the food-coupling instrument
// PLUS scale-road telemetry, and answer: does the current tip reproduce the
// 2026-10-12 day-39-63 starvation-at-scale, or has the wall moved?
//
// TOOLING ONLY — no game balance changes. belongseek/leadcourt/scalecourt
// are script policies; all gates stay at their defaults (belongseek v2,
// i.e. BELONG_V3 unset).
//
// Usage:
//   SEEDS="11,22,33,44" POLICIES="belongseek,leadcourt" DAYS=150 \
//   OUT=/tmp/r6-repro.json node scripts/scale-repro-20261013.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { winseek } = require('./policies/winseek');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');
const { scalecourt } = require('./policies/scalecourt');
const fc = require('./food-coupling-20261013');

const POLICY_REGISTRY = { competent, winseek, belongseek, leadcourt, scalecourt };

const day = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }; };

function attachScale(Game, m) {
  const s = m.scale = {
    proposals: [], tributes: [], tends: [], beats: [], breaks: [],
    pools: [], counters: [], daily: [],
  };
  const safe = (fn, wrap) => {
    if (typeof fn !== 'function') return fn;
    return function (...a) {
      let r;
      try { r = fn.apply(this, a); } catch (e) { throw e; }
      try { wrap(r, a); } catch (e) {}
      return r;
    };
  };
  if (typeof Game.proposeLink === 'function') Game.proposeLink = safe(Game.proposeLink, (r, a) => {
    const opts = a[1] || {};
    s.proposals.push({ day: day(Game), vid: String(a[0] || '?'), asSub: !!opts.asSubordinate, result: r === null ? 'null' : String(r) });
  });
  if (typeof Game.answerCounter === 'function') Game.answerCounter = safe(Game.answerCounter, (r, a) => {
    s.counters.push({ day: day(Game), how: String(a[0] || '?'), result: r === null ? 'null' : String(r) });
  });
  if (typeof Game.payTribute === 'function') Game.payTribute = safe(Game.payTribute, (r, a) => {
    // payTribute(linkId, kcal?) — kcal defaults to the link's weekly owed;
    // the engine's RETURN is the actual kcal removed. Record that.
    s.tributes.push({ day: day(Game), link: String(a[0] || '?'), kcal: Math.round(r || 0) });
  });
  if (typeof Game.tendLink === 'function') Game.tendLink = safe(Game.tendLink, (r, a) => {
    s.tends.push({ day: day(Game), link: String(a[0] || '?') });
  });
  if (typeof Game.drawLeaguePool === 'function') Game.drawLeaguePool = safe(Game.drawLeaguePool, (r, a) => {
    s.pools.push({ day: day(Game), kcal: Math.round(a[0] || 0) });
  });
  if (typeof Game.answerNationalChoice === 'function') Game.answerNationalChoice = safe(Game.answerNationalChoice, (r, a) => {
    s.beats.push({ day: day(Game), how: String(a[0] || '?') });
  });
  const bl = Game.breakLink || Game.walkLink;
  if (typeof bl === 'function') Game.breakLink = safe(bl, (r, a) => {
    s.breaks.push({ day: day(Game), link: String(a[0] || '?') });
  });
  return s;
}

function scaleRow(Game) {
  const row = { day: 0, rank: 'village', links: [], foreignMax: 0, foreignHead: null, pendingNat: null, pendingGlobal: false, exiled: false, jstage: 0 };
  try { row.day = day(Game); } catch (e) {}
  try { row.rank = Game.scaleRank ? (Game.scaleRank() || 'village') : 'village'; } catch (e) {}
  try {
    const links = Game.villageLinks ? Game.villageLinks('haven') : [];
    const HOME = 'haven';
    const isHome = (x) => x === HOME || x === 'Haven';
    row.links = (links || []).map(l => {
      // real link fields (hierarchy.js): id, primary, subordinate, kind,
      // a/b (peers), trust, day (formed), arrears, status,
      // tributeKcalPerWeek / poolKcalPerWeek
      let other = '?', kind = l.kind || '?';
      if (l.kind === 'covenant' || l.kind === 'trade') {
        other = isHome(l.a) ? l.b : l.a;
      } else if (isHome(l.primary)) { other = l.subordinate; kind = 'lead'; }
      else if (isHome(l.subordinate)) { other = l.primary; kind = 'belong'; }
      else { other = l.primary || l.subordinate; }
      return {
        vid: String(other || '?'),
        kind: kind,
        primary: isHome(l.primary) ? 'haven' : (l.primary || '?'),
        trust: Math.round(l.trust || 0),
        age: row.day - (l.day || row.day),
        arrears: Math.round(l.arrears || 0),
        perWeek: Math.round(l.tributeKcalPerWeek || l.poolKcalPerWeek || 0),
      };
    });
  } catch (e) { row.links = []; }
  try {
    const fps = Game.foreignPolities ? Game.foreignPolities() : [];
    let mx = 0, head = null;
    for (const p of (fps || [])) {
      const sz = 2 + ((p.subs || []).length || 0);
      if (sz > mx) { mx = sz; head = p.primary || null; }
    }
    row.foreignMax = mx; row.foreignHead = head;
  } catch (e) {}
  try {
    const pn = Game.state && Game.state.pendingNational;
    row.pendingNat = pn ? (pn.shape || true) : null;
    row.pendingGlobal = !!(Game.state && Game.state.pendingGlobal);
  } catch (e) {}
  try {
    row.exiled = !!((Game.state.scholar || {}).exiled);
    row.jstage = ((Game.justiceState && Game.justiceState()) || {}).stage || 0;
  } catch (e) {}
  return row;
}

function finalizeScale(Game, m) {
  const s = m.scale, out = {};
  const prop = s.proposals;
  out.linksProposed = prop.length;
  out.linksAccepted = prop.filter(p => p.result !== 'null' && p.result !== 'counter').length;
  out.countersOffered = prop.filter(p => p.result === 'counter').length;
  out.counterAnswers = s.counters.length;
  out.tributePaidK = s.tributes.reduce((t, x) => t + (x.kcal || 0), 0) / 1000;
  out.tributeWeeks = s.tributes.length;
  out.tends = s.tends.length;
  out.tendOutK = out.tends * 1.5;
  out.poolDrawnK = s.pools.reduce((t, x) => t + (x.kcal || 0), 0) / 1000;
  out.beatsAnswered = s.beats.length;
  out.breaks = s.breaks.length;
  // link states ever: seasoned = age>=30 && trust>=40 (canon national bar)
  const seen = {};
  for (const r of s.daily) for (const l of r.links) {
    const k = l.vid + '|' + l.kind;
    seen[k] = seen[k] || { vid: l.vid, kind: l.kind, maxTrust: 0, maxAge: 0, primary: l.primary, perWeek: l.perWeek };
    if (l.trust > seen[k].maxTrust) seen[k].maxTrust = l.trust;
    if (l.age > seen[k].maxAge) seen[k].maxAge = l.age;
  }
  const links = Object.values(seen);
  out.linksEver = links.length;
  out.linksSeasonedEver = links.filter(l => l.maxAge >= 30 && l.maxTrust >= 40).length;
  out.linksGoodEver = links.filter(l => l.maxTrust >= 50).length;
  out.maxForeignRealm = Math.max(0, ...s.daily.map(r => r.foreignMax || 0));
  out.foreign4Days = s.daily.filter(r => (r.foreignMax || 0) >= 4).length;
  out.nationalStagingDays = s.daily.filter(r => r.pendingNat).length;
  out.nationalHeldDays = s.daily.filter(r => r.rank === 'national' || r.rank === 'global').length;
  out.rankPath = s.daily.filter((_, i) => i % 6 === 0).map(r => r.rank[0] || '?').join('');
  // good-standing days for the BELONG road: a haven-subordinate link with
  // trust>=50, arrears 0, age>=14, under a foreign 4+ realm's head
  out.goodStandingDays = s.daily.filter(r => {
    if ((r.foreignMax || 0) < 4) return false;
    return (r.links || []).some(l => l.primary === r.foreignHead && l.kind !== 'covenant' && l.kind !== 'trade'
      && l.trust >= 50 && l.arrears <= 0 && l.age >= 14 && l.primary !== 'haven');
  }).length;
  // FOOD DURING THE PUSH: days 20-90 (the scale window), sampled daily rows
  const push = (m.daily || []).filter(r => r.day >= 20 && r.day <= 90);
  const pd = push.map(r => r.pantryDays).filter(x => x != null && x < 999).sort((a, b) => a - b);
  const ate = push.map(r => r.ateShare).filter(x => x != null).sort((a, b) => a - b);
  out.pushDays = push.length;
  out.pushPantryDaysMed = pd.length ? +pd[Math.floor(pd.length / 2)].toFixed(1) : null;
  out.pushPantryDaysMin = pd.length ? +pd[0].toFixed(1) : null;
  out.pushAteMed = ate.length ? +ate[Math.floor(ate.length / 2)].toFixed(1) : null;
  out.pushStarveDays = push.filter(r => r.starved).length;
  out.pushPantryKcalMin = push.length ? Math.round(Math.min(...push.map(r => r.pantryKcal || 0))) : null;
  // tribute in/out names (influx) — whatever the engine called them
  out.influxTributeInK = 0; out.influxPoolAidK = 0;
  for (const [k, v] of Object.entries(m.influx || {})) {
    const lk = k.toLowerCase();
    if (lk.includes('tribute')) out.influxTributeInK += v / 1000;
    if (lk.includes('aid') || lk.includes('pool')) out.influxPoolAidK += v / 1000;
  }
  out.influxTributeInK = +out.influxTributeInK.toFixed(1);
  out.influxPoolAidK = +out.influxPoolAidK.toFixed(1);
  // pantry-days crash episodes: longest run of consecutive daily rows with pantryDays < 3
  let run = 0, maxRun = 0, crashDays = [];
  for (const r of (m.daily || [])) {
    if ((r.pantryDays || 999) < 3) { run++; if (run > maxRun) { maxRun = run; } }
    else run = 0;
  }
  out.longestPantryCrash = maxRun;
  // TRIBUTE FLOW FROM LINK HISTORIES (the arrival bypasses stockPantry —
  // same class as r5's donateToPantry catch). Counts tribute weeks by
  // outcome across all links ever formed.
  out.tributeWeeksPaid = 0; out.tributeWeeksThin = 0; out.tributeWeeksMissed = 0;
  try {
    const hs = Game.hierarchyState ? Game.hierarchyState() : [];
    for (const l of (hs || [])) {
      for (const h of ((l && l.history) || [])) {
        if ((h.kind || '') !== 'tribute') continue;
        const n = String(h.note || '');
        if (/paid\. The pantry grows/.test(n)) out.tributeWeeksPaid++;
        else if (/paid thin/.test(n)) out.tributeWeeksThin++;
        else if (/paid nothing/.test(n)) out.tributeWeeksMissed++;
      }
    }
  } catch (e) {}
  // EXILE (r6 finding): an exiled scholar can never stage a national beat.
  const exRows = s.daily.filter(r => r.exiled);
  out.exiledEver = exRows.length > 0 ? 1 : 0;
  out.exileDay = exRows.length ? exRows[0].day : null;
  out.exiledDays = exRows.length;
  out.jstageEnd = s.daily.length ? (s.daily[s.daily.length - 1].jstage || 0) : 0;
  out.scaleDaily = s.daily.filter((_, i) => i % 5 === 0);
  return out;
}

async function runRepro(opts) {
  opts = opts || {};
  const label = opts.label || process.env.LEVER || 'scale-repro';
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'belongseek,leadcourt').split(',').map(s => s.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '150', 10);
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'scalerepro-' + pid });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      attachScale(Game, m);
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(scaleRow(G)); } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      const row = Object.assign({ label, policy: pid, seed }, fc.finalize(Game, m, result), finalizeScale(Game, m));
      rows.push(row);
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} rank=${row.rank} nat=${row.national} prop=${row.linksProposed} acc=${row.linksAccepted} seas=${row.linksSeasonedEver} tribOut=${row.tributePaidK.toFixed(0)}k tribFlow=${row.tributeWeeksPaid}/${row.tributeWeeksThin}/${row.tributeWeeksMissed} tend=${row.tends} goodDays=${row.goodStandingDays} f4days=${row.foreign4Days} exiled=${row.exiledEver}${row.exileDay!=null?('@'+row.exileDay):''} pushPd=${row.pushPantryDaysMed}/${row.pushPantryDaysMin} ate=${row.pushAteMed}% starvP=${row.pushStarveDays} vests=${row.vests}`);
    }
  }
  const agg = (fn) => rows.reduce((t, r) => t + fn(r), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const summary = {
    label, seeds, policies: policyIds, days, runs: rows.length,
    national: agg(r => r.national), table: agg(r => r.table), won: agg(r => r.won),
    medianDays: med(rows.map(r => r.days)),
    linksProposed: agg(r => r.linksProposed), linksAccepted: agg(r => r.linksAccepted),
    linksSeasonedEver: agg(r => r.linksSeasonedEver),
    tributeOutK: +agg(r => r.tributePaidK).toFixed(1),
    tributeWeeksPaid: agg(r => r.tributeWeeksPaid), tributeWeeksThin: agg(r => r.tributeWeeksThin), tributeWeeksMissed: agg(r => r.tributeWeeksMissed),
    tributeInK: +agg(r => r.influxTributeInK).toFixed(1),
    poolDrawnK: +agg(r => r.poolDrawnK).toFixed(1),
    goodStandingDays: agg(r => r.goodStandingDays),
    maxForeignRealm: Math.max(0, ...rows.map(r => r.maxForeignRealm)),
    nationalStagingDays: agg(r => r.nationalStagingDays),
    nationalHeldDays: agg(r => r.nationalHeldDays),
    vests: agg(r => r.vests), starveDays: agg(r => r.starveDays),
    exiledEver: agg(r => r.exiledEver),
  };
  return { summary, rows };
}

function printSummary(rep) {
  const s = rep.summary;
  console.log(`\n=== ${s.label} === policies=[${s.policies.join(',')}] seeds=[${s.seeds.join(',')}] days=${s.days}`);
  console.log(`wall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} won ${s.won}/${s.runs} medianDays ${s.medianDays} vests ${s.vests} exiledEver ${s.exiledEver}/${s.runs}`);
  console.log(`scale: proposed ${s.linksProposed} accepted ${s.linksAccepted} seasonedEver ${s.linksSeasonedEver} goodStandingDays ${s.goodStandingDays}`);
  console.log(`  tribute OUT ${s.tributeOutK}k flow(paid/thin/missed) ${s.tributeWeeksPaid}/${s.tributeWeeksThin}/${s.tributeWeeksMissed} poolDrawn ${s.poolDrawnK}k nationalStagingDays ${s.nationalStagingDays} nationalHeldDays ${s.nationalHeldDays} maxForeignRealm ${s.maxForeignRealm}`);
}

if (require.main === module) {
  (async () => {
    const rep = await runRepro({});
    printSummary(rep);
    // food-coupling summary over the same rows (they carry fc.finalize fields)
    const rows = rep.rows;
    const agg = (fn) => rows.reduce((t, r) => t + (fn(r) || 0), 0);
    const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
    const rotNameAgg = {};
    for (const r of rows) for (const [k, v] of Object.entries(r.rotNames || {})) rotNameAgg[k] = (rotNameAgg[k] || 0) + v;
    const foodSummary = {
      label: rep.summary.label + ' (food)', seeds: rep.summary.seeds, policies: rep.summary.policies,
      days: rep.summary.days, runs: rows.length,
      national: rep.summary.national, table: rep.summary.table, won: rep.summary.won,
      medianDays: med(rows.map(r => r.days)), maxWave: Math.max(0, ...rows.map(r => r.maxWave || 1)),
      vests: agg(r => r.vests),
      kills: agg(r => r.kills), killsPerDay: +(agg(r => r.kills) / Math.max(1, agg(r => r.days))).toFixed(2),
      killsByWave: {}, butcherEvents: agg(r => r.butcherEvents),
      grossHarvestK: agg(r => r.grossHarvest), netHarvestK: agg(r => r.netHarvest),
      avgKcalPerKill: agg(r => r.kills) ? Math.round(agg(r => r.netHarvest) / agg(r => r.kills)) : 0,
      influx: {}, rotKcal: agg(r => r.rotKcal), rotItems: agg(r => r.rotItems),
      process: {}, tasks: {}, starveDays: agg(r => r.starveDays),
      preservedKcalEnd: agg(r => r.preservedKcalEnd),
      rotTopNames: Object.entries(rotNameAgg).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k}=${(v / 1000).toFixed(0)}k`),
    };
    for (const r of rows) {
      for (const [w, n] of Object.entries(r.killsByWave || {})) foodSummary.killsByWave[w] = (foodSummary.killsByWave[w] || 0) + n;
      for (const [k, v] of Object.entries(r.influx || {})) foodSummary.influx[k] = (foodSummary.influx[k] || 0) + v;
      for (const [k, v] of Object.entries(r.process || {})) foodSummary.process[k] = (foodSummary.process[k] || 0) + v;
      for (const [k, v] of Object.entries(r.tasks || {})) foodSummary.tasks[k] = (foodSummary.tasks[k] || 0) + v;
    }
    fc.printSummary({ summary: foodSummary, rows });
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runRepro, attachScale, scaleRow, finalizeScale };
