#!/usr/bin/env node
// sweep-racksmoke-20261016.js — the RACK-side scholar smoke arm
// (flesh-out loop B, 2026-10-16, finding #50's named next).
//
// 8 FRESH seeds [103,215,327,439,541,653,765,877] (verified: zero prior
// per-seed files in evidence/ as seed values) x {belongfeast, leadfeast} x
// {control, armed} = 32 runs, 180d death-aware, identical seeds both sides.
// Own control in the SAME sweep. Both roads (the courtship road baseline
// 0/16 came from leadcourt in selfsmoke r18; belong runs here too).
//
// Substrate (asserted up front — #312 lesson):
//   FEASTSCALE_R13=1
//   SEATDRIVE=0 (explicit opt-out — since c004b9dd flipped the seat
//     default ON, unset would drive; the pre-seat substrate is the stack
//     with the seat layer gate-offed to pure delegation)
//   control: belongfeastRacksmoke/leadfeastRacksmoke with RACKSMOKE unset
//     (gate-offs to pure delegation — det-gate pins byte-identity)
//   armed:   the SAME objects + RACKSMOKE=1 (the scholar works the racks)
//
// Pre-registered GO (binding, MEASUREMENT §§9–12,14 — see
// evidence/2026-10-16/sim-racksmoke-b.md):
//   PRIMARY: scholar smoke/preserve calls per run — GO when >=4/8 armed
//     runs (per road) show >=1 rack smoke call (baseline 0/16 selfsmoke r18).
//   GUARDRAILS (binding): national >= control − 2 (per road);
//     median survival within 10d of control; starvation deaths <=
//     control + 2; no new death mode; fresh-rot kcal <= 1.15x control.
// Per-seed JSONs carry numeric national, table, wins, exiled, wave5,
// wave5Day for the coordinator's telemetry-check (keys EXACT — the
// won/wins schema-drift trap, twice today).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-racksmoke-20261016.js
// Targeted re-runs: SEEDS="103,215" ONLY="belongfeast,armed;leadfeast,control"
// Smoke only: SMOKE=1 (same env).
'use strict';
const fs = require('fs');
const path = require('path');
const RS = require('./policies/racksmoke');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const fc = require('./food-coupling-20261013');
const { attachScale, scaleRow, finalizeScale } = require('./scale-repro-20261013');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') {
  console.error('SWEEP STOP: SEATDRIVE=0 is required for the pre-seat substrate (seatdefault flip c004b9dd: unset now drives).');
  process.exit(2);
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [103, 215, 327, 439, 541, 653, 765, 877]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-racksmoke');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'racksmoke-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function policyFor(policyId) {
  return policyId === 'leadfeast' ? RS.leadfeastRacksmoke : RS.belongfeastRacksmoke;
}
function parentFor(policyId) {
  return policyId === 'leadfeast' ? leadfeast : belongfeast;
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// Beat capture: ring buffer keyed on smoke/rack/preserve/roster language
// for the SENSE-TESTING read (transcript beats, not just counts).
const BEAT_RE = /smoke|rack|preserv|dawn|pantry|donat|took |trust|spoil|rot|dinner|cook|died|dead|national|exile|won|win |table|wave ?[345]/i;
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

function attachDeaths(Game, t) {
  t.deaths = [];
  const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (origReg) {
    Game.registerDeath = function (opts) {
      const r = origReg(opts);
      try {
        const o = opts || {};
        if (t.deaths.length < 400) {
          t.deaths.push({
            day: gday(Game), kind: String(o.kind || '?'),
            vid: String(o.villagerId || o.monsterId || '?').slice(0, 24),
            name: String(o.name || '?').slice(0, 40),
            cause: String(o.cause || '?').slice(0, 60),
          });
        }
      } catch (e) {}
      return r;
    };
  }
}

// Preserve instruments: scholar preserveFood calls + preserve-teach events.
function attachPreserve(Game) {
  const p = { smokeCalls: 0, learnEvents: [], learnedDay: null };
  const origPF = Game.preserveFood;
  if (typeof origPF === 'function') {
    Game.preserveFood = function (...a) { try { p.smokeCalls++; } catch (e) {} return origPF.apply(this, a); };
  }
  const origLT = Game.learnTechnique;
  if (typeof origLT === 'function') {
    Game.learnTechnique = function (t, src) {
      try {
        if (String(t) === 'preserve') {
          p.learnEvents.push({ day: gday(Game), src: String(src || '?') });
          if (p.learnedDay == null) p.learnedDay = gday(Game);
        }
      } catch (e) {}
      return origLT.apply(this, arguments);
    };
  }
  return p;
}

function pantryPreservedKcal(Game) {
  let k = 0;
  try {
    for (const it of ((Game.state.village || {}).pantry || [])) {
      if (it && (it.foodState === 'preserved' || it.foodState === 'rendered'))
        k += (it.kcalEach || 0) * (it.units || 1);
    }
  } catch (e) {}
  return Math.round(k);
}

function freshRotKcal(rotBy) {
  let k = 0;
  try {
    for (const label of Object.keys(rotBy || {})) {
      for (const fs of Object.keys(rotBy[label] || {})) {
        if (/^(cleaned|cooked|raw|carcass)\//.test(fs)) k += rotBy[label][fs] || 0;
      }
    }
  } catch (e) {}
  return Math.round(k);
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.RACKSMOKE = '1'; else delete process.env.RACKSMOKE;
    const { Game } = await loadGame({ seed: 103, mode: `racksmoke-smoke-${side}`, fullTelemetry: false });
    await setupGame(Game);
    let ctxLive = null, rsLive = null;
    const base = policyFor('belongfeast');
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => {
      ctxLive = ctx; rsLive = RS.racksmokeOn();
      if (oSetup) return oSetup(G, ctx);
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`${side}: layer-live markers honest`, rsLive === (side === 'armed'), `rs=${rsLive}`);
    check(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    check(`${side}: expected policy id`, base.id === 'belongfeast-racksmoke', base.id);
    check(`${side}: parent byte-delegation sanity`, parentFor('belongfeast').id === 'belongfeast');
  }
  delete process.env.RACKSMOKE;
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  if (armed) process.env.RACKSMOKE = '1'; else delete process.env.RACKSMOKE;
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `racksmoke-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null, rsLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    runCtx = ctx; rsLive = RS.racksmokeOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const m = fc.attachInstruments(Game);
  attachScale(Game, m);
  const p = attachPreserve(Game);
  const hist = { maxRank: 0, everTable: false, exiled: false };
  const waveTrace = { maxWave: 1, wave4Day: null, wave5Day: null };
  let peakPres = 0;
  const hashes = [];
  const beats = { beats: [] };
  const deathsT = { deaths: [] };
  attachBeats(Game, beats);
  attachDeaths(Game, deathsT);
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      const uw = (G.unlockedWave ? G.unlockedWave() : 1) | 0;
      if (uw > waveTrace.maxWave) waveTrace.maxWave = uw;
      const day = gday(G);
      if (uw >= 4 && waveTrace.wave4Day == null) waveTrace.wave4Day = day;
      if (uw >= 5 && waveTrace.wave5Day == null) waveTrace.wave5Day = day;
      try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
      try { m.scale.daily.push(scaleRow(G)); } catch (e) {}
      try { const pk = pantryPreservedKcal(G); if (pk > peakPres) peakPres = pk; } catch (e) {}
    } catch (e) {}
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (rsLive !== armed)
    throw new Error(`layer-live marker mismatch: side=${side} rs=${rsLive}`);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const endInfo = { won: !!Game.won, gameDays: result.gameDays, endReason: result.endReason };
  const maxWave = Math.max(result.maxWaveUnlocked || 1, waveTrace.maxWave);
  let knowsEnd = false;
  try { knowsEnd = Game.knowsTechnique('preserve'); } catch (e) {}
  const f = fc.finalize(Game, m, result);
  const scale = finalizeScale(Game, m);
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: endInfo.won ? 1 : 0,
    maxWave, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave4Day: waveTrace.wave4Day, wave5Day: waveTrace.wave5Day,
    arc: f.arc, exiled: hist.exiled ? 1 : 0,
    // racksmoke primary + channel
    rackSmokes: (runCtx && runCtx.rackSmokes) || 0,
    rackSmokeDays: (runCtx && runCtx.rackSmokeDays) || 0,
    rackSmokedKcal: (runCtx && runCtx.rackSmokedKcal) || 0,
    rackStoodDown: (runCtx && runCtx._rackStoodDown) || 0,
    preserveCalls: p.smokeCalls,
    preserveLearns: p.learnEvents.length,
    preserveLearnedDay: p.learnedDay,
    knowsPreserveEnd: knowsEnd ? 1 : 0,
    // guardrails
    rotKcal: f.rotKcal,
    freshRotKcal: freshRotKcal(f.rotBy),
    starveDays: f.starveDays,
    vests: f.vests,
    pantryKcalEnd: f.pantryKcalEnd,
    preservedKcalEnd: pantryPreservedKcal(Game),
    preservedKcalPeak: peakPres,
    nationalHeldDays: scale.nationalHeldDays,
    hashes,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    if (beats.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} nat=${out.national} wave=${out.maxWave} table=${out.table} wins=${out.wins} rack=${out.rackSmokes}/${out.rackSmokeDays}d kcal=${out.rackSmokedKcal} learns=${out.preserveLearns} freshRot=${out.freshRotKcal} starveD=${out.starveDays} vests=${out.vests} exiled=${out.exiled}`);
  return out;
}

function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function starvationDeaths(rs) {
  return rs.reduce((t, r) => t + Object.keys(r.deaths || {}).filter(k => /starv/i.test(k)).reduce((a, k) => a + r.deaths[k], 0), 0);
}
function deathModes(rs) {
  const s = new Set();
  for (const r of rs) for (const k of Object.keys(r.deaths || {})) s.add(k);
  return s;
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

  const recs = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      for (const side of ['control', 'armed']) {
        if (!match(policyId, side)) continue;
        recs.push(await oneRun(seed, policyId, side));
      }
    }
  }
  delete process.env.RACKSMOKE;

  // ---- summary ----
  console.log('\n== racksmoke sweep summary (pre-seat stack, both roads) ==');
  for (const policyId of POLICIES) {
    for (const side of ['control', 'armed']) {
      const rs = recs.filter(r => r.policyId === policyId && r.side === side);
      const n = rs.length;
      const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
      const runsWithSmoke = rs.filter(r => (r.rackSmokes || 0) >= 1).length;
      console.log(`${policyId}/${side}: n=${n} rackRuns=${runsWithSmoke}/${n} rackSmokes=${sum('rackSmokes')} rackDays=${sum('rackSmokeDays')} rackKcal=${sum('rackSmokedKcal')} learns=${sum('preserveLearns')} knowsEnd=${sum('knowsPreserveEnd')}/${n} ` +
        `wins=${sum('wins')} national=${sum('national')}/${n} table=${sum('table')}/${n} wave4=${sum('wave45')}/${n} wave5=${sum('wave5')}/${n} exiled=${sum('exiled')}/${n} ` +
        `medianSurv=${median(rs.map(r => r.gameDays)).toFixed(1)}d starveDeaths=${starvationDeaths(rs)} freshRot=${sum('freshRotKcal')} rot=${sum('rotKcal')} vests=${sum('vests')}`);
    }
  }
  // Primary verdict per road: >=4/8 armed runs with >=1 rack smoke call.
  for (const policyId of POLICIES) {
    const a = recs.filter(r => r.policyId === policyId && r.side === 'armed');
    const c = recs.filter(r => r.policyId === policyId && r.side === 'control');
    const aSmoke = a.filter(r => (r.rackSmokes || 0) >= 1).length;
    const primary = aSmoke >= 4;
    const natA = a.filter(r => r.national).length, natC = c.filter(r => r.national).length;
    const medA = median(a.map(r => r.gameDays)), medC = median(c.map(r => r.gameDays));
    const sdA = starvationDeaths(a), sdC = starvationDeaths(c);
    const frA = a.reduce((t, r) => t + r.freshRotKcal, 0), frC = c.reduce((t, r) => t + r.freshRotKcal, 0);
    const modesA = deathModes(a), modesC = deathModes(c);
    const newModes = [...modesA].filter(m => !modesC.has(m));
    const g1 = natA >= natC - 2, g2 = medA >= medC - 10, g3 = sdA <= sdC + 2, g4 = newModes.length === 0, g5 = frC === 0 ? true : frA <= 1.15 * frC;
    console.log(`\nPRIMARY ${policyId}: armed rack runs ${aSmoke}/8 (bar >=4) -> ${primary ? 'GO' : 'NO-GO'}`);
    console.log(`  guardrails: national ${natA}>=${natC}-2 ${g1 ? 'ok' : 'MISS'}; medianSurv ${medA.toFixed(1)}d vs ${medC.toFixed(1)}d-10 ${g2 ? 'ok' : 'MISS'}; starveDeaths ${sdA}<=${sdC}+2 ${g3 ? 'ok' : 'MISS'}; newDeathModes [${newModes.join(',')}] ${g4 ? 'ok' : 'MISS'}; freshRot ${frA}<=1.15x${frC} ${g5 ? 'ok' : 'MISS'}`);
  }
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
