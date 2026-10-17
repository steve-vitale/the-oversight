#!/usr/bin/env node
// scripts/sweep-capdoor-20261017.js — sim-capdoor-b lever sweep (#453).
//
// refuse-with-voice at the pantry cap door vs control, identical seeds.
// Per-run instrument: every stockSurplus call records (recorded −
// physically-stored) where recorded mirrors the engine's ledger formula
// (control: Math.round(gave); armed: Math.round(stored)) and stored is
// measured as before/after pantryKcal() — physical truth, independent of
// the function's return value.
//
// PRE-REGISTRATION (evidence/2026-10-17/sim-capdoor-b.md, binding):
//   PRIMARY: recorded-but-not-received == 0 on ALL armed runs.
//   BLANK-EXISTENCE: median control-run phantom >= 100k kcal.
//   Guardrails: national >= control-2; median survival >= control-10d;
//     starvation <= control+2; no new death-cause mode on armed;
//     det-gate 8/8 (separate).
//   Design: 180d death-aware (+10d tail), seeds 4401-4408 x
//     {leadfeast,belongfeast} x {control,armed} = 32 runs,
//     FEASTSCALE_R13=1, SEATDRIVE=0, own paired control.
//
// Usage (4 parallel processes):
//   FEASTSCALE_R13=1 SEATDRIVE=0 SIDE=control POLICIES=belongfeast node scripts/sweep-capdoor-20261017.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 SIDE=armed   POLICIES=belongfeast node scripts/sweep-capdoor-20261017.js
//   ... POLICIES=leadfeast ...
// Targeted: SEEDS="4401,4402" SIDE=armed POLICIES=leadfeast PROBE_DAYS=40
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [4401, 4402, 4403, 4404, 4405, 4406, 4407, 4408]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['belongfeast', 'leadfeast']);
const DAYS = process.env.PROBE_DAYS ? parseInt(process.env.PROBE_DAYS, 10) : 180;
const SIDE = process.env.SIDE || 'control'; // control | armed
const ARMED = SIDE === 'armed';
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-capdoor', SIDE);
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-17', 'capdoor-beats', SIDE);
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; };
const BEAT_RE = /carries .* kcal of surplus to the pantry|pantry is full|We've carried .* long enough|Hands: .* for exile|pulling weight|pull weight|freeload|starv|hungr|exile|died|dead|raid|wave [45]|table|national|regional/i;

// Cap-door instrument: mirrors the engine's recording formula, measures
// physical truth. On armed the ledger records Math.round(stored); on
// control it records Math.round(gave). phantom = recorded - storedPhys.
function attachCapdoor(Game, t) {
  t.calls = 0; t.phantom = 0; t.phantomPos = 0; t.phantomNeg = 0;
  t.refused = 0; t.beats = 0; t.mismatches = 0;
  // freeloader-clock counters: the honest ledger lowers recorded gives, so
  // the takes-vs-gives clock may judge differently. Count the stages
  // directly (their voice lines don't all contain 'freeload').
  t.freeload = { gossip: 0, warning: 0, vote: 0 };
  for (const [fn, key] of [['freeloadGossip', 'gossip'], ['freeloadWarning', 'warning'], ['freeloadVote', 'vote']]) {
    try {
      const orig = Game[fn] ? Game[fn].bind(Game) : null;
      if (!orig) continue;
      Game[fn] = function (vid) { try { t.freeload[key]++; } catch (e) {} return orig(vid); };
      (t._frestore = t._frestore || []).push([fn, orig]);
    } catch (e) {}
  }
  const oSur = Game.stockSurplus.bind(Game);
  const oSay = Game.say ? Game.say.bind(Game) : null;
  Game.say = function (msg) {
    try {
      const s = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
      if (BEAT_RE.test(s)) {
        t.beatLines = t.beatLines || [];
        t.beatLines.push({ day: gday(Game), text: s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 300) });
        if (t.beatLines.length > 2000) t.beatLines.splice(0, 500);
      }
      if (/carries .* kcal of surplus to the pantry/.test(s)) t.beats++;
    } catch (e) {}
    return oSay ? oSay(msg) : msg;
  };
  Game.stockSurplus = function (v, give) {
    let before = 0, after = 0, r, beforeErr = null, afterErr = null;
    try { before = Game.pantryKcal(); } catch (e) { beforeErr = String(e && e.message || e); }
    try { r = oSur(v, give); } finally { try { after = Game.pantryKcal(); } catch (e) { afterErr = String(e && e.message || e); } }
    try {
      const storedPhys = after - before;
      const recorded = ARMED ? Math.round(r || 0) : Math.round(give);
      const d = recorded - storedPhys;
      t.calls++;
      t.phantom += d;
      if (d > 0) t.phantomPos += d;   // recorded but never received (#453)
      else t.phantomNeg -= d;          // received but never recorded (merge windfall)
      if (ARMED) t.refused += Math.max(0, Math.round(give) - Math.round(r || 0));
      if ((recorded - storedPhys) !== 0 && t.mismatches < 10) {
        t.mismatches++;
        (t.mismatchLog = t.mismatchLog || []).push({ give: Math.round(give), r, before, after, beforeErr, afterErr, sameV: v === Game.state.village });
      }
    } catch (e) {}
    return r;
  };
  t._restore = () => {
    Game.stockSurplus = oSur; if (oSay) Game.say = oSay;
    try { for (const [fn, orig] of (t._frestore || [])) Game[fn] = orig; } catch (e) {}
  };
}

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

async function oneRun(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'capdoor-' + SIDE, fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const flow = {};
  attachCapdoor(Game, flow);
  const oDaily = base.daily, oUpkeep = base.upkeep;
  const hist = { maxRank: 0, everTable: false, exiled: false, starvedDays: 0, maxArc: 1, maxFires: 0, maxVests: 0 };
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
    let r;
    try { r = oUpkeep ? oUpkeep(G, ctx) : undefined; } catch (e) {}
    return r;
  };
  policy.daily = (G, ctx) => {
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
        try {
          let nv = 0;
          const VEST_IDS = ['military_vest', 'swat_vest'];
          for (const it of ((G.state.scholar || {}).inventory || [])) if (it && VEST_IDS.includes(it.id)) nv += (it.units || 1);
          for (const vv of Object.values((G.state.scholar || {}).equipped || {})) if (vv && VEST_IDS.includes(vv.id)) nv++;
          if (nv > hist.maxVests) hist.maxVests = nv;
        } catch (e) {}
      } catch (e) {}
      if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    } catch (e) {}
    return r;
  };
  let result;
  const t0 = Date.now();
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  const ms = Date.now() - t0;
  try { flow._restore(); } catch (e) {}
  const harnessMax = (result.maxWaveUnlocked || 1) | 0;
  const waveMax = Math.max(waveHist.dailyMax, harnessMax);
  for (const d of liveDeaths) { const k = String(d.cause || d.kind || 'unknown'); deaths[k] = (deaths[k] || 0) + 1; }
  const out = {
    seed, policyId, side: SIDE,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason, ms,
    deaths, starvedDays: hist.starvedDays,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: Game.won ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    wave4Day: waveHist.wave4Day, wave5Day: waveHist.wave5Day,
    maxArc: hist.maxArc, arc2: hist.maxArc >= 2 ? 1 : 0, arc3: hist.maxArc >= 3 ? 1 : 0, arc4: hist.maxArc >= 4 ? 1 : 0,
    maxFires: hist.maxFires, fourRealm: hist.maxFires >= 4 ? 1 : 0,
    maxVests: hist.maxVests,
    exiled: hist.exiled ? 1 : 0,
    // cap-door instrument
    surplusCalls: flow.calls,
    phantom: Math.round(flow.phantom),
    phantomEvap: Math.round(flow.phantomPos),   // recorded but never received (#453)
    phantomWindfall: Math.round(flow.phantomNeg), // received but never recorded (merge)
    refusedKcal: Math.round(flow.refused), voiceBeats: flow.beats,
    mismatches: flow.mismatches, mismatchLog: flow.mismatchLog || [],
    freeloadGossip: flow.freeload.gossip, freeloadWarning: flow.freeload.warning,
    freeloadVote: flow.freeload.vote,
    liveDeaths,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out));
  try {
    if (flow.beatLines && flow.beatLines.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}.json`), JSON.stringify(flow.beatLines, null, 1));
    }
  } catch (e) {}
  console.log(`  [${SIDE} ${policyId} s${seed}] d=${out.gameDays} end=${out.endReason} phantom=${out.phantom} refused=${out.refusedKcal} beats=${out.voiceBeats} nat=${out.national} wave=${out.maxWave} ms=${ms}`);
  return out;
}

// lib-guard: proof scripts require() with CAPDOORSWEEP_LIB=1.
if (process.env.CAPDOORSWEEP_LIB === '1') {
  module.exports = { attachCapdoor };
} else {
for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (substrate).'); process.exit(2); }
if (SIDE !== 'control' && SIDE !== 'armed') { console.error('SWEEP STOP: SIDE=control|armed required.'); process.exit(2); }
if (ARMED) process.env.CAPDOOR = '1'; else delete process.env.CAPDOOR;
(async () => {
  console.log(`== sweep-capdoor ${SIDE} x [${POLICIES.join(',')}] x [${SEEDS.join(',')}] ${DAYS}d ==`);
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      try { await oneRun(seed, pid); }
      catch (e) { console.log(`  [${SIDE} ${pid} s${seed}] THREW: ${(e && e.message) || e}`); }
    }
  }
  console.log('== done ==');
})();
}
