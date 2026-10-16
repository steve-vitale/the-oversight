#!/usr/bin/env node
// scripts/census-stack-20261016.js — STACKING-CHANNEL CENSUS (sim-stackcensus-b,
// 2026-10-16, food-economy axis, scale-wall lens).
//
// The sim-drawvol-b named next: "measure whether the stacking channel
// (obligated+discretionary co-occurrence) is actually a live drain before
// another volume arm." The drawvol-b mechanism autopsy: 12/13 holds fired
// with dayTotalBefore=0 (a single 2.8-3.2k feast exceeding the 2.5k cap);
// only ONE hold exercised obligated+discretionary stacking. The
// measurement pre-pass: only 22/265 thin days had ANY drawdown outflow.
//
// This instrument is READ-ONLY (zero src/js, zero policy changes, no
// DRAWDVOL layer — the control substrate only). On every thin-day
// (fd<6) drawdown-outflow event it classifies the channel from the
// engine's own per-day records:
//   OBLIGATED          — tribute/tend payments only (aid=feast=0)
//   DISCRETIONARY-ONLY — obligated=0 (single aid give, single feast, or
//                        multiple discretionary events with no obligated)
//   STACKED            — obligated>0 AND (aid>0 or feast>0) co-occur in
//                        the same engine day; sub-classified by the
//                        landed drawvol cap line (2500):
//     stackBind      — obl+disc > 2500 && obl <= 2500  (stacking BINDs:
//                        discretionary pushed the day past the cap line)
//     stackOblHeavy  — obl > 2500 (obligated alone exceeds; stacking
//                        co-occurs but does not bind)
//     stackSmall     — total <= 2500 (stacking co-occurs, never near
//                        the binding line)
//
// PRE-REGISTRATION (docs/MEASUREMENT.md §§9-12, 14 — binding, written
// BEFORE sims; see evidence/2026-10-16/sim-stackcensus-b.md):
//   PRIMARY: attribution >= 95% of thin-day drawdown-outflow events
//     (the 95% bar is the instrument's GO threshold; the verdict
//     question — is stacking a live drain? — is measured, not
//     thresholded).
//   Substrate: pre-seat courtship (SEATDRIVE=0 explicit), FEASTSCALE_R13=1,
//     policies leadfeast/belongfeast. 180d death-aware (+10d tail).
//   Seeds: 8 FRESH seeds [1501-1508] (verified absent from all
//     evidence/ per-seed filenames 2026-10-13->16; drawvol-b used
//     982-989) x {belongfeast, leadfeast} = 16 runs, single side,
//     control substrate (no armed side — census, not comparison).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/census-stack-20261016.js
// Targeted: SEEDS="1501,1502" POLICIES="belongfeast" PROBE_DAYS=40
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

// (substrate env gates live in the sweep entry branch below — the lib
// branch skips them so proofs can require() without env)

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [1501, 1502, 1503, 1504, 1505, 1506, 1507, 1508]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['belongfeast', 'leadfeast']);
const DAYS = process.env.PROBE_DAYS ? parseInt(process.env.PROBE_DAYS, 10) : 180;
const CAP = 2500; // landed drawvol cap line — the binding bound for stackBind
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-stackcensus');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'stackcensus-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const fdOf = (Game) => { try { return Game.pantryFreshDays(); } catch (e) { return -1; } };

function alivePop(Game) {
  try {
    const v = Game.state.village || {};
    const health = v.health || {};
    let n = 0;
    for (const id of (v.roster || [])) {
      const h = health[id];
      if ((h == null ? 100 : h) > 0) n++;
    }
    return n;
  } catch (e) { return 0; }
}

// Pure classifier — unit-tested in scripts/test-stackcensus-20261016.js.
// bucket: {day, fd, obl, aid, feast, aidN, feastN}
// Returns {channel, sub} or {channel:'UNATTRIBUTED'}.
function classifyDay(b) {
  if (b.fd < 0) return { channel: 'UNATTRIBUTED', sub: 'fd-unknown' };
  const obl = b.obl | 0, aid = b.aid | 0, feast = b.feast | 0;
  const disc = aid + feast;
  if (obl + disc <= 0) return { channel: 'NONE', sub: 'no-outflow' }; // not an event
  if (disc === 0) return { channel: 'OBLIGATED', sub: 'obligated-only' };
  if (obl === 0) {
    const events = (b.aidN || 0) + (b.feastN || 0);
    return { channel: 'DISCRETIONARY-ONLY', sub: events > 1 ? 'multi-discretionary' : 'single' };
  }
  const total = obl + disc;
  if (total > CAP && obl <= CAP) return { channel: 'STACKED', sub: 'stackBind' };
  if (obl > CAP) return { channel: 'STACKED', sub: 'stackOblHeavy' };
  return { channel: 'STACKED', sub: 'stackSmall' };
}

const BEAT_RE = /feast|not the rot|mountain tonight|starv|hungr|national|regional|died|dead|raid|gorge|exile|wave [345]|table|tribute|begs at the treeline|bins are full|drawdown/i;
function attachBeats(Game, t) {
  t.beats = [];
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 280);
      if (BEAT_RE.test(s)) {
        t.beats.push({ day: gday(Game), text: s });
        if (t.beats.length > 4000) t.beats.splice(0, 500);
      }
    } catch (e) {}
  };
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  Game.say = function (msg) { push(msg); return origSay ? origSay(msg) : msg; };
  if (origSys) Game.sysSay = function (msg) { push(msg); return origSys(msg); };
}

// Outflow instrument: read-only per-engine-day buckets. Same wrap points
// as the drawvol measure/sweep (feast@upkeep -> tribute/aid@daily).
function attachOutflow(Game, t) {
  t.dayRecs = [];
  let bucket = null;
  const buck = () => {
    const day = gday(Game);
    if (!bucket || bucket.day !== day) {
      bucket = { day, fd: +fdOf(Game).toFixed(2), obl: 0, aid: 0, feast: 0, aidN: 0, feastN: 0 };
      t.dayRecs.push(bucket);
    }
    return bucket;
  };
  const rec = (n, kcal) => { try { if (kcal > 0) buck()[n] += Math.round(kcal); } catch (e) {} };
  t._install = () => {
    const oPT = Game.payTribute, oTL = Game.tendLink;
    const oBeg = Game.answerAidBeg, oFeast = Game.hostFeast;
    if (typeof oPT === 'function') Game.payTribute = function () { const r = oPT.apply(this, arguments); if (typeof r === 'number' && r > 0) rec('obl', r); return r; };
    if (typeof oTL === 'function') Game.tendLink = function () { const r = oTL.apply(this, arguments); if (typeof r === 'number' && r > 0) rec('obl', r); return r; };
    if (typeof oBeg === 'function') Game.answerAidBeg = function (how) {
      let ask = 0;
      try { ask = ((Game.state || {}).pendingAidBeg || {}).amount || 1500; } catch (e) {}
      const r = oBeg.apply(this, arguments);
      if (how === 'give' && r === 'gave') { rec('aid', ask); try { buck().aidN++; } catch (e) {} }
      return r;
    };
    if (typeof oFeast === 'function') Game.hostFeast = function () {
      let cost = 0;
      try { const p = Game.feastPlan ? Game.feastPlan() : null; if (p && p.ok) cost = Math.round(p.cost) || 0; } catch (e) {}
      const r = oFeast.apply(this, arguments);
      if (r && r.ok && cost > 0) { rec('feast', cost); try { buck().feastN++; } catch (e) {} }
      return r;
    };
    return () => {
      if (typeof oPT === 'function') Game.payTribute = oPT;
      if (typeof oTL === 'function') Game.tendLink = oTL;
      if (typeof oBeg === 'function') Game.answerAidBeg = oBeg;
      if (typeof oFeast === 'function') Game.hostFeast = oFeast;
    };
  };
}

async function oneRun(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'stackcensus', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const beats = { beats: [] };
  const flow = {};
  attachBeats(Game, beats);
  attachOutflow(Game, flow);
  const oDaily = base.daily, oUpkeep = base.upkeep;
  const hist = { maxRank: 0, everTable: false, exiled: false, starvedDays: 0, maxArc: 1, maxFires: 0 };
  const waveHist = { dailyMax: 1, wave4Day: null, wave5Day: null };
  const deaths = {};
  const liveDeaths = [];
  const oTele = Game.tele ? Game.tele.bind(Game) : null;
  Game.tele = function (type, data) {
    const r = oTele ? oTele.apply(this, arguments) : undefined;
    try {
      if (type === 'death') liveDeaths.push({ day: gday(Game), kind: data && data.kind, who: data && data.who, cause: data && data.cause });
    } catch (e) {}
    return r;
  };
  policy.upkeep = (G, ctx) => {
    const restore = flow._install();
    try { return oUpkeep ? oUpkeep(G, ctx) : undefined; }
    finally { restore(); }
  };
  policy.daily = (G, ctx) => {
    const restore = flow._install();
    let r;
    try {
      try {
        const pg = G.progState ? G.progState() : {};
        if (pg.tableWaiting) hist.everTable = true;
        let rank = 'village';
        try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
        if ((G.state.scholar || {}).exiled) hist.exiled = true;
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
      } catch (e) {}
      if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    } finally { restore(); }
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  const harnessMax = (result.maxWaveUnlocked || 1) | 0;
  const waveMax = Math.max(waveHist.dailyMax, harnessMax);
  for (const d of liveDeaths) { const k = String(d.cause || d.kind || 'unknown'); deaths[k] = (deaths[k] || 0) + 1; }
  const dayRecs = (flow.dayRecs || []).map(b => ({ d: b.day, fd: b.fd, obl: b.obl, aid: b.aid, feast: b.feast, aidN: b.aidN, feastN: b.feastN, ch: classifyDay(b) }));
  const out = {
    seed, policyId,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths, starvedDays: hist.starvedDays,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: Game.won ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    wave4Day: waveHist.wave4Day, wave5Day: waveHist.wave5Day,
    maxArc: hist.maxArc, arc2: hist.maxArc >= 2 ? 1 : 0, arc3: hist.maxArc >= 3 ? 1 : 0, arc4: hist.maxArc >= 4 ? 1 : 0,
    maxFires: hist.maxFires, fourRealm: hist.maxFires >= 4 ? 1 : 0,
    exiled: hist.exiled ? 1 : 0,
    liveDeaths,
    dayRecs,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out));
  try {
    if (beats.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}.json`), JSON.stringify(beats.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${policyId} s${seed}] d=${out.gameDays} end=${out.endReason} starvedDays=${out.starvedDays} nat=${out.national} wave=${out.maxWave} arc=${out.maxArc}`);
  return out;
}

function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// lib-guard: proof scripts require() this module with STACKCENSUS_LIB=1
// to reuse classifyDay/attachOutflow without running the sweep.
if (process.env.STACKCENSUS_LIB === '1') {
  module.exports = { classifyDay, attachOutflow };
} else {
for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`CENSUS STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('CENSUS STOP: SEATDRIVE=0 is required (pre-seat substrate).'); process.exit(2); }
(async () => {
  const recs = [];
  for (const policyId of POLICIES) for (const seed of SEEDS) recs.push(await oneRun(seed, policyId));

  // ---- census analysis ----
  const events = [];
  for (const r of recs) for (const d of r.dayRecs) {
    if (d.fd < 0 || d.fd >= 6) continue;
    const total = d.obl + d.aid + d.feast;
    if (total <= 0) continue;
    events.push({ policyId: r.policyId, seed: r.seed, ...d, total });
  }
  const k = (x) => Math.round(x / 1000) + 'k';
  const chKcal = {}, chN = {}, subKcal = {}, subN = {};
  let unattr = 0;
  for (const e of events) {
    const ch = e.ch.channel, sub = e.ch.sub;
    if (ch === 'UNATTRIBUTED') { unattr++; continue; }
    chN[ch] = (chN[ch] || 0) + 1;
    chKcal[ch] = (chKcal[ch] || 0) + e.total;
    const sk = ch + ':' + sub;
    subN[sk] = (subN[sk] || 0) + 1;
    subKcal[sk] = (subKcal[sk] || 0) + e.total;
  }
  const totalKcal = Object.values(chKcal).reduce((a, b) => a + b, 0);
  console.log('\n== STACKING CENSUS: thin-day (fd<6) drawdown-outflow events ==');
  console.log(`thin-day events: n=${events.length} across ${recs.length} runs; unattributed=${unattr}`);
  console.log(`ATTRIBUTION (PRIMARY): ${events.length ? ((events.length - unattr) / events.length * 100).toFixed(1) : 'n/a'}% (bar >= 95%)`);
  for (const ch of ['OBLIGATED', 'DISCRETIONARY-ONLY', 'STACKED']) {
    console.log(`  ${ch}: n=${chN[ch] || 0} kcal=${k(chKcal[ch] || 0)} (${(100 * (chKcal[ch] || 0) / Math.max(1, totalKcal)).toFixed(1)}% of thin-day outflow kcal)`);
  }
  console.log('  sub-channels (kcal):');
  for (const sk of Object.keys(subKcal).sort()) console.log(`    ${sk}: n=${subN[sk]} kcal=${k(subKcal[sk])}`);
  // stacking margin: discretionary kcal on STACKED:stackBind days
  let stackDiscKcal = 0, stackBindN = 0;
  for (const e of events) {
    if (e.ch.channel === 'STACKED' && e.ch.sub === 'stackBind') { stackBindN++; stackDiscKcal += e.aid + e.feast; }
  }
  console.log(`  STACKED:stackBind margin — n=${stackBindN} days, discretionary kcal through the bind=${k(stackDiscKcal)} (${(100 * stackDiscKcal / Math.max(1, totalKcal)).toFixed(1)}% of thin-day outflow kcal)`);
  // per-policy + per-fd-band
  for (const pid of POLICIES) {
    const pe = events.filter(e => e.policyId === pid);
    const sk = pe.filter(e => e.ch.channel === 'STACKED' && e.ch.sub === 'stackBind');
    const pt = pe.reduce((a, e) => a + e.total, 0);
    console.log(`  road ${pid}: events=${pe.length} kcal=${k(pt)} | stacked-bind: n=${sk.length} discKcal=${k(sk.reduce((a, e) => a + e.aid + e.feast, 0))}`);
  }
  for (const band of [[1, 3], [3, 6]]) {
    const be = events.filter(e => e.fd >= band[0] && e.fd < band[1]);
    const sk = be.filter(e => e.ch.channel === 'STACKED' && e.ch.sub === 'stackBind');
    console.log(`  fd band ${band[0]}-${band[1]}: events=${be.length} | stacked-bind n=${sk.length}`);
  }
  // largest stackBind days (sense-sampling targets)
  const sb = events.filter(e => e.ch.channel === 'STACKED' && e.ch.sub === 'stackBind').sort((a, b) => (b.aid + b.feast) - (a.aid + a.feast));
  console.log('  top stackBind days (sense targets): ' + sb.slice(0, 12).map(e => `${e.policyId}/s${e.seed}/d${e.d} fd${e.fd} obl=${e.obl} aid=${e.aid} feast=${e.feast}`).join(' | '));

  // ---- wall numbers ----
  console.log('\n== wall numbers ==');
  {
    const n = recs.length;
    const s = (f) => recs.reduce((a, r) => a + (r[f] | 0), 0);
    console.log(`n=${n} national=${s('national')}/${n} table=${s('table')}/${n} wins=${s('wins')}/${n} exiled=${s('exiled')}/${n} ` +
      `wave4=${s('wave4')}/${n} wave5=${s('wave5')}/${n} arc2=${s('arc2')}/${n} arc3=${s('arc3')}/${n} arc4=${s('arc4')}/${n} fourRealm=${s('fourRealm')}/${n} ` +
      `medianSurv=${median(recs.map(r => r.gameDays)).toFixed(1)}d maxSurv=${Math.max(...recs.map(r => r.gameDays))}d starvedDays=${s('starvedDays')}`);
  }
  const agg = {};
  for (const r of recs) for (const [kk, v] of Object.entries(r.deaths || {})) agg[kk] = (agg[kk] || 0) + v;
  console.log('death causes: ' + Object.entries(agg).sort((a, b) => b[1] - a[1]).map(([kk, v]) => `${kk}:${v}`).join(' '));
})().catch(e => { console.error('CENSUS CRASH:', e && e.stack || e); process.exit(2); });
}
