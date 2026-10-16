#!/usr/bin/env node
// scripts/sweep-drawvol-20261016.js — drawdown-volume-cap sweep (sim-drawvol-b,
// 2026-10-16, food-economy axis — the sim-floorday3-b named next).
//
// The SAME layer runs on both sides; only the gate differs:
//   control: DRAWDVOL unset (default) -> byte-identical delegation
//   armed:   DRAWDVOL=1              -> daily outflow budget (cap 2500)
//                                     when fd<6, discretionary holds
//
// 8 FRESH seeds [982-989] x {belongfeast, leadfeast} x {control, armed} =
// 32 runs, 180d death-aware, identical seeds both sides. Own control in
// the SAME sweep (#247 — never inherit a baseline).
//
// Substrate (asserted up front): FEASTSCALE_R13=1, SEATDRIVE=0 explicit
// (pre-seat). Base policies: DV.drawvolbelong / DV.drawvollead (the
// drawvol layer over feastscale's belongfeast / leadfeast — same objects
// both sides, DRAWDVOL is the only switch).
//
// Pre-registered GO (binding, MEASUREMENT §14 — see
// evidence/2026-10-16/sim-drawvol-b.md):
//   PRIMARY: absolute starvedDays armed <= control. starvedDays =
//     cumulative engine-days the village spent hungry (v.hungryDays > 0
//     sampled post-daily, summed). Starvation deaths reported alongside.
//   MECHANISM ENGAGEMENT: armed must HOLD >= 8 drawdown candidacies when
//     fd<6 across the sweep; else verdict = no-coverage diagnostic ->
//     KILL as invisible.
//   GUARDRAILS: national >= control-2/16; median survival >= control-10d;
//     no new death mode; social verbs alive: armed aid+feast count >= 50%
//     of control.
// Per-seed JSONs carry EXACT numeric keys national, table, wins, exiled
// (the schema-drift LOUD class).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 SMOKE=1 node scripts/sweep-drawvol-20261016.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-drawvol-20261016.js
// Targeted re-runs: SEEDS="982,983" ONLY="belongfeast,armed;leadfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
const DV = require('./policies/drawvol');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat substrate).'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [982, 983, 984, 985, 986, 987, 988, 989]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-drawvol');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'drawvol-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function policyFor(policyId) {
  return policyId === 'leadfeast' ? DV.drawvollead : DV.drawvolbelong;
}

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

const BEAT_RE = /feast|not the rot|mountain tonight|starv|hungr|national|regional|died|dead|raid|gorge|exile|wave [345]|table|fatter day|bins are full|drawdown budget|begs at the treeline/i;
function attachBeats(Game, t) {
  t.beats = [];
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 260);
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

// fresh-rot instrument (the floorday3 convention): snapshot spoiled FRESH
// kcal just before the engine's sweep runs. Pure read + call-through.
function attachRot(Game, t) {
  t.freshRotKcal = 0; t.freshRotItems = 0;
  const orig = Game.sweepSpoiled ? Game.sweepSpoiled.bind(Game) : null;
  if (!orig) return;
  const isSpoiled = Game.isSpoiled ? Game.isSpoiled.bind(Game) : null;
  Game.sweepSpoiled = function () {
    try {
      const scan = (arr) => {
        for (const it of (arr || [])) {
          if (!it) continue;
          if (it.foodState === 'preserved' || it.foodState === 'rendered' || (it.foodKind || '') === 'pemmican') continue;
          let spoiled = false;
          try { spoiled = isSpoiled ? !!isSpoiled(it) : false; } catch (e) {}
          if (spoiled) {
            t.freshRotKcal += Math.round((it.kcalEach || 0) * (it.units || 1));
            t.freshRotItems++;
          }
        }
      };
      scan((Game.state.scholar || {}).inventory);
      try {
        const ps = Game.prepStash ? Game.prepStash() : null;
        if (ps && ps !== Game.state.scholar.inventory) scan(ps);
      } catch (e) {}
      scan((Game.state.village || {}).pantry);
    } catch (e) {}
    return orig.apply(this, arguments);
  };
}

// Sweep outflow instrument (always-on, BOTH sides): per-engine-day buckets
// {fd, obl, aid, feast, aidGives, feasts}. Observe-only — stacks outside the
// layer's own wraps on the armed side (sees final returns: held verbs
// record nothing, honestly).
function attachOutflow(Game, t) {
  t.dayRecs = [];
  t.aidGives = 0; t.feasts = 0;
  let bucket = null;
  const buck = () => {
    const day = gday(Game);
    if (!bucket || bucket.day !== day) {
      bucket = { day, fd: +fdOf(Game).toFixed(2), obl: 0, aid: 0, feast: 0 };
      t.dayRecs.push(bucket);
    }
    return bucket;
  };
  const rec = (n, kcal) => { try { if (kcal > 0) buck()[n] += Math.round(kcal); } catch (e) {} };
  t._installOutflow = () => {
    const oPT = Game.payTribute, oTL = Game.tendLink;
    const oBeg = Game.answerAidBeg, oFeast = Game.hostFeast;
    if (typeof oPT === 'function') Game.payTribute = function () { const r = oPT.apply(this, arguments); if (typeof r === 'number' && r > 0) rec('obl', r); return r; };
    if (typeof oTL === 'function') Game.tendLink = function () { const r = oTL.apply(this, arguments); if (typeof r === 'number' && r > 0) rec('obl', r); return r; };
    if (typeof oBeg === 'function') Game.answerAidBeg = function (how) {
      let ask = 0;
      try { ask = ((Game.state || {}).pendingAidBeg || {}).amount || 1500; } catch (e) {}
      const r = oBeg.apply(this, arguments);
      if (how === 'give' && r === 'gave') { rec('aid', ask); t.aidGives++; }
      return r;
    };
    if (typeof oFeast === 'function') Game.hostFeast = function () {
      let cost = 0;
      try { const p = Game.feastPlan ? Game.feastPlan() : null; if (p && p.ok) cost = Math.round(p.cost) || 0; } catch (e) {}
      const r = oFeast.apply(this, arguments);
      if (r && r.ok && cost > 0) { rec('feast', cost); t.feasts++; }
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

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.DRAWDVOL = '1'; else delete process.env.DRAWDVOL;
    const { Game } = await loadGame({ seed: 982, mode: `drawvol-smoke-${side}`, fullTelemetry: false });
    await setupGame(Game);
    const base = policyFor('belongfeast');
    let runCtx = null;
    const pol = Object.assign({}, base);
    const oSetup = base.setup;
    pol.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, pol, { days: 15, sampleEvery: 30 }); });
    const live = side === 'armed';
    check(`${side}: layer-live markers honest`,
      base.id === 'belongfeast' && (live ? Array.isArray(runCtx && runCtx._dvHoldEvents) : !(runCtx && runCtx._dvHoldEvents)),
      `id=${base.id} holdLog=${!!(runCtx && runCtx._dvHoldEvents)}`);
    check(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
  }
  delete process.env.DRAWDVOL;
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function detGate() {
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.DRAWDVOL = '1'; else delete process.env.DRAWDVOL;
    const runs = [];
    for (let rep = 0; rep < 2; rep++) {
      const { Game } = await loadGame({ seed: 982, mode: `drawvol-det-${side}` });
      await setupGame(Game);
      const base = policyFor('leadfeast');
      const hashes = [];
      const pol = Object.assign({}, base);
      const oDaily = base.daily;
      pol.daily = (G, ctx) => {
        hashes.push(Game.state.scholar.day + ':' + dayHash(G));
        return oDaily ? oDaily(G, ctx) : undefined;
      };
      await quietLog(async () => { await runDays(Game, pol, { days: 40, sampleEvery: 1 }); });
      runs.push(hashes);
    }
    const same = runs[0].length === runs[1].length && runs[0].every((h, i) => h === runs[1][i]);
    console.log(`  ${same ? 'PASS' : 'FAIL'} det-gate (${side}): 40d rerun byte-identical — n=${runs[0].length}/${runs[1].length}`);
    if (!same) { console.error('DET-GATE FAILED'); process.exit(3); }
  }
  delete process.env.DRAWDVOL;
  console.log('DET gate green.');
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  if (armed) process.env.DRAWDVOL = '1'; else delete process.env.DRAWDVOL;
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `drawvol-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const hist = { maxRank: 0, everTable: false, exiled: false, villagerDays: 0, starvedDays: 0, maxArc: 1, maxFires: 0 };
  const waveHist = { dailyMax: 1, wave4Day: null, wave5Day: null };
  const hashes = [];
  const beats = { beats: [] };
  const rot = {};
  const flow = {};
  attachBeats(Game, beats);
  attachRot(Game, rot);
  attachOutflow(Game, flow);
  const oDaily = base.daily, oUpkeep = base.upkeep;
  policy.upkeep = (G, ctx) => {
    const restore = flow._installOutflow();
    try { return oUpkeep ? oUpkeep(G, ctx) : undefined; }
    finally { restore(); }
  };
  policy.daily = (G, ctx) => {
    const restore = flow._installOutflow();
    let r;
    try {
      try {
        const pg = G.progState ? G.progState() : {};
        if (pg.tableWaiting) hist.everTable = true;
        let rank = 'village';
        try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
        if ((G.state.scholar || {}).exiled) hist.exiled = true;
        hist.villagerDays += alivePop(G);
        if ((((G.state || {}).village || {}).hungryDays || 0) > 0) hist.starvedDays++;
        try {
          const a = ((((G.state || {}).scholar || {}).prog || {}).arc || 1);
          if (a > hist.maxArc) hist.maxArc = a;
        } catch (e) {}
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
      try { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    } finally { restore(); }
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const deaths = {};
  let starvation = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (k === 'starvation') starvation++;
    }
  } catch (e) {}
  const harnessMax = (result.maxWaveUnlocked || 1) | 0;
  const waveMax = Math.max(waveHist.dailyMax, harnessMax);
  const dayRecs = (flow.dayRecs || []).map(b => ({ d: b.day, fd: b.fd, obl: b.obl, aid: b.aid, feast: b.feast }));
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths, starvation,
    starvedDays: hist.starvedDays,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: Game.won ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    wave4Day: waveHist.wave4Day, wave5Day: waveHist.wave5Day,
    maxArc: hist.maxArc, arc2: hist.maxArc >= 2 ? 1 : 0, arc3: hist.maxArc >= 3 ? 1 : 0, arc4: hist.maxArc >= 4 ? 1 : 0,
    maxFires: hist.maxFires, fourRealm: hist.maxFires >= 4 ? 1 : 0,
    exiled: hist.exiled ? 1 : 0,
    villagerDays: hist.villagerDays,
    freshRotKcal: rot.freshRotKcal || 0, freshRotItems: rot.freshRotItems || 0,
    dvObligatedKcal: dayRecs.reduce((a, b) => a + b.obl, 0),
    dvAidKcal: dayRecs.reduce((a, b) => a + b.aid, 0),
    dvFeastKcal: dayRecs.reduce((a, b) => a + b.feast, 0),
    dvAidGives: flow.aidGives || 0, dvFeasts: flow.feasts || 0,
    drawvolHeld: (runCtx && runCtx.drawvolHeld) || 0,
    dvHoldEvents: ((runCtx && runCtx._dvHoldEvents) || []).slice(-40),
    dayRecs,
    hashes,
  };
  // Numeric keys the coordinator's telemetry-check reads: national,
  // table, wins, exiled — 0/1.
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out));
  try {
    if (beats.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${side} ${policyId} s${seed}] d=${out.gameDays} end=${out.endReason} starv=${out.starvation} starvedDays=${out.starvedDays} nat=${out.national} wave=${out.maxWave} arc=${out.maxArc} held=${out.drawvolHeld} aid=${out.dvAidGives} feasts=${out.dvFeasts}`);
  return out;
}

function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

(async () => {
  let only = null;
  if (process.env.ONLY) {
    only = new Set();
    for (const part of String(process.env.ONLY).split(';')) {
      const [p, s] = part.split(',').map(x => x.trim());
      if (p && s) only.add(p + '|' + s);
    }
  }
  const match = (p, s) => !only || only.has(p + '|' + s);

  if (process.env.SMOKE === '1') { await smokeGate(); }
  await detGate();

  const recs = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      for (const side of ['control', 'armed']) {
        if (!match(policyId, side)) continue;
        recs.push(await oneRun(seed, policyId, side));
      }
    }
  }
  delete process.env.DRAWDVOL;

  // ---- summary ----
  const by = (side) => recs.filter(r => r.side === side);
  console.log('\n== drawvol sweep summary ==');
  for (const side of ['control', 'armed']) {
    const rs = by(side);
    const n = rs.length;
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    const vd = rs.reduce((a, r) => a + (r.villagerDays || 0), 0);
    const rot = rs.reduce((a, r) => a + (r.freshRotKcal || 0), 0);
    console.log(`${side}: n=${n} starvation=${sum('starvation')} starvedDays=${sum('starvedDays')} (PRIMARY) national=${sum('national')}/${n} ` +
      `medianSurv=${median(rs.map(r => r.gameDays)).toFixed(1)}d maxSurv=${Math.max(...rs.map(r => r.gameDays))}d ` +
      `freshRot=${Math.round(rot / 1000)}k (${(rot / Math.max(1, vd)).toFixed(0)}/vday) ` +
      `table=${sum('table')}/${n} wave4=${sum('wave4')}/${n} wave5=${sum('wave5')}/${n} ` +
      `wins=${sum('wins')}/${n} exiled=${sum('exiled')}/${n} ` +
      `arc2=${sum('arc2')}/${n} arc3=${sum('arc3')}/${n} arc4=${sum('arc4')}/${n} fourRealm=${sum('fourRealm')}/${n} ` +
      `obl=${Math.round(sum('dvObligatedKcal') / 1000)}k aid=${Math.round(sum('dvAidKcal') / 1000)}k(aidGives=${sum('dvAidGives')}) feast=${Math.round(sum('dvFeastKcal') / 1000)}k(feasts=${sum('dvFeasts')}) ` +
      `held=${sum('drawvolHeld')}`);
  }
  // ENGAGEMENT: armed holds when fd<6
  {
    let holdsFd6 = 0;
    for (const r of by('armed')) for (const e of (r.dvHoldEvents || [])) if (e.fd < 6) holdsFd6++;
    console.log(`ENGAGEMENT: armed holds=${by('armed').reduce((a, r) => a + r.drawvolHeld, 0)} total, ${holdsFd6} with fd<6 (bar >= 8)`);
  }
  // GUARDRAIL: social verbs alive
  {
    const c = by('control'), a = by('armed');
    const verbs = (rs) => rs.reduce((t, r) => t + r.dvAidGives + r.dvFeasts, 0);
    console.log(`VERBS-ALIVE: control aid+feast=${verbs(c)}, armed=${verbs(a)} (bar >= 50% of control = ${(verbs(c) / 2).toFixed(1)})`);
  }
  // death-cause shares per side
  for (const side of ['control', 'armed']) {
    const agg = {};
    for (const r of by(side)) for (const [k, v] of Object.entries(r.deaths || {})) agg[k] = (agg[k] || 0) + v;
    console.log(`${side} death causes: ` + Object.entries(agg).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' '));
  }
  // per-policy starvation + starvedDays
  for (const policyId of POLICIES) {
    const c = by('control').filter(r => r.policyId === policyId);
    const a = by('armed').filter(r => r.policyId === policyId);
    const s = (rs, f) => rs.reduce((x, r) => x + r[f], 0);
    console.log(`${policyId}: starvation control=${s(c, 'starvation')} armed=${s(a, 'starvation')} | starvedDays control=${s(c, 'starvedDays')} armed=${s(a, 'starvedDays')}`);
  }
  // paired starvedDays deltas (armed-control)
  const deltas = [];
  for (const r of by('armed')) {
    const c = recs.find(x => x.side === 'control' && x.policyId === r.policyId && x.seed === r.seed);
    if (c) deltas.push({ seed: r.seed, policyId: r.policyId, d: r.starvedDays - c.starvedDays });
  }
  console.log('paired starvedDays deltas (armed-control): ' +
    deltas.map(x => `${x.policyId}/s${x.seed}:${x.d >= 0 ? '+' : ''}${x.d}`).join(' '));
})().catch(e => { console.error('SWEEP CRASH:', e && e.stack || e); process.exit(2); });
