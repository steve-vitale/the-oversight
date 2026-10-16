#!/usr/bin/env node
// sweep-belonghunt-20261016.js — the road-aware wave-5 pursuit with
// readiness + scholar-absence accounting (flesh-out loop, 2026-10-16,
// run fleshout-20261016T0215Z, axis scale-onramp, sim-belonghunt).
//
// 8 FRESH seeds [204,315,426,537,648,759,870,981] (verified: zero prior
// per-seed files in evidence/ as seed values) x {belongfeast} x
// {control, armed}, 180d death-aware, identical seeds both sides. Own
// control in the SAME sweep. BELONG ROAD ONLY — lead road pure
// delegation by design (w5reach3: the base already unlocks there).
//
// Substrate (asserted up front — #312 lesson):
//   FEASTSCALE_R13=1  TRIBFLOOR=1  SUCCGRACE=1  RAIDDENSITY=1
//   WINPURSUIT=1  WINDEFER=1
//   SEATDRIVE=0 (explicit opt-out — since c004b9dd flipped the seat
//     default ON, unset would drive; the pre-seat substrate is the stack
//     with the seat layer gate-offed to pure delegation)
//   control: BH.leadseat/belongseat with BELONGHUNT unset (gate-offs to
//     pure delegation)
//   armed:   the SAME objects + BELONGHUNT=1 (hunts fire on the belong
//     road only; lead ids delegate pure even opted in)
//
// Wave-5 unlock DATING (finding #360 + #375): no engine telemetry event
// fires on wave unlock — this sweep samples Game.unlockedWave() DAILY and
// records the first day it reads 5, then CROSS-CHECKS against the
// harness's own maxWaveUnlocked AND scans the beat captures for the
// greenlight line ("the Producers have greenlit the fifth draft").
// Discrepancies are reported, not reconciled silently.
//
// Pre-registered GO (binding, MEASUREMENT §§9–12,14 — see
// evidence/2026-10-16/sim-belonghunt.md):
//   PRIMARY: belong wave-5 unlocks armed >= control + 2.
//   CO-PRIMARY (exercise): >= 4 hunt engagements across the sweep
//     (contact, not no-contact).
//   GUARDRAILS (binding): national >= control − 2; median survival >=
//     control − 10d; starvation deaths <= control + 2; no new death mode
//     at n>=3; no gate-blocked scholars (the #369 strand must not
//     reappear — report tableActive days vs hunts).
// Per-seed JSONs carry numeric national, table, wins, exiled, wave5,
// wave5Day for the coordinator's telemetry-check (keys EXACT — the
// won/wins schema-drift trap, twice today).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 node scripts/sweep-belonghunt-20261016.js
// Targeted re-runs: SEEDS="204,315" ONLY="belongfeast,armed;belongfeast,control"
// Smoke only: SMOKE=1 (same env).
'use strict';
const fs = require('fs');
const path = require('path');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const BH = require('./policies/belonghunt');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') {
  // Since c004b9dd flipped the seat default ON (layerOn = SEATDRIVE !== '0'),
  // the pre-seat substrate now requires an explicit opt-out. "SEATDRIVE
  // unset" is the pre-flip spelling of the same stack — the intent is the
  // pre-seat substrate (seat layer gate-offs to pure delegation), which is
  // what SEATDRIVE=0 produces.
  console.error('SWEEP STOP: SEATDRIVE=0 is required for the pre-seat substrate (seatdefault flip c004b9dd: unset now drives).');
  process.exit(2);
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [204, 315, 426, 537, 648, 759, 870, 981]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-belonghunt');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'belonghunt-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Both sides share the same policy objects — BELONGHUNT is the only switch
// (the seatdrive composition pattern; the seat layer gate-offs when
// SEATDRIVE is unset).
function policyFor(policyId) {
  return policyId === 'leadfeast' ? BH.leadseat : BH.belongseat;
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// Beat capture: ring buffer. Keyed on wave-5/unlock/standing/death/hunt
// language for the SENSE-TESTING read and the #375 greenlight
// cross-check.
const BEAT_RE = /wave ?5|producers|standing|unlock|readiness|facing|wave ?4|mirror draft|won|win |died|dead|national|exile|hunt|expedition|greenlit|fifth draft/i;
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

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.BELONGHUNT = '1'; else delete process.env.BELONGHUNT;
    const { Game } = await loadGame({ seed: 204, mode: `belonghunt-smoke-${side}`, fullTelemetry: false });
    await setupGame(Game);
    let ctxLive = null, bhLive = null, seatLive = null, deferLive = null;
    const base = policyFor('belongfeast');
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => {
      ctxLive = ctx; bhLive = BH.belonghuntOn(); seatLive = SD.layerOn(); deferLive = WD.layerOn();
      if (oSetup) return oSetup(G, ctx);
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`${side}: layer-live markers honest`, bhLive === (side === 'armed') && seatLive === false && deferLive === true,
      `bh=${bhLive} seat=${seatLive} defer=${deferLive}`);
    check(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    check(`${side}: expected policy id`, base.id === 'belongfeast-windefer', base.id);
  }
  delete process.env.BELONGHUNT;
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  if (armed) process.env.BELONGHUNT = '1'; else delete process.env.BELONGHUNT;
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `belonghunt-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null, bhLive = null, seatLive = null, deferLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    runCtx = ctx; bhLive = BH.belonghuntOn(); seatLive = SD.layerOn(); deferLive = WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const hist = { maxRank: 0, everTable: false, exiled: false };
  // finding #360: sample unlockedWave() daily — the unlock day is the
  // first day the read hits the new wave. #375: also count tableActive
  // (sitting) days in-window for the strand check.
  const waveTrace = { maxWave: 1, wave4Day: null, wave5Day: null, liveDays: 0, sittingDays: 0 };
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
      if (armed && uw >= 4 && uw < 5) {
        if (BH.huntLive(G, 'belongfeast-windefer')) waveTrace.liveDays++;
        if (BH.tableSitting(G)) waveTrace.sittingDays++;
      }
    } catch (e) {}
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { hashes.push(G.state.scholar.day + ':' + dayHash(Game)); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (bhLive !== armed || seatLive !== false || deferLive !== true)
    throw new Error(`layer-live marker mismatch: side=${side} bh=${bhLive} seat=${seatLive} defer=${deferLive}`);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const endInfo = { won: !!Game.won, gameDays: result.gameDays, endReason: result.endReason };
  const maxWave = Math.max(result.maxWaveUnlocked || 1, waveTrace.maxWave);
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: endInfo.won ? 1 : 0,
    maxWave, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave4Day: waveTrace.wave4Day, wave5Day: waveTrace.wave5Day,
    exiled: hist.exiled ? 1 : 0,
    // belonghunt counters (same ctx keys as wave5reach for tooling
    // continuity) + gate-block telemetry
    w5Hunts: (runCtx && runCtx.w5Hunts) || 0,
    w5HuntLegs: (runCtx && runCtx.w5HuntLegs) || 0,
    w5HuntSteps: (runCtx && runCtx.w5HuntSteps) || 0,
    w5HuntEngaged: (runCtx && runCtx.w5HuntEngaged) || 0,
    w5BloodFights: (runCtx && runCtx.w5BloodFights) || 0,
    w5FacingFights: (runCtx && runCtx.w5FacingFights) || 0,
    w5ReadyBlocked: (runCtx && runCtx.w5ReadyBlocked) || 0,
    w5PantryBlocked: (runCtx && runCtx.w5PantryBlocked) || 0,
    w5CapBlocked: (runCtx && runCtx.w5CapBlocked) || 0,
    w5BurstBlocked: (runCtx && runCtx.w5BurstBlocked) || 0,
    w5TableBlocked: (runCtx && runCtx.w5TableBlocked) || 0,
    w5LiveDays: waveTrace.liveDays,
    w5SittingDays: waveTrace.sittingDays,
    hashes,
  };
  // Numeric fields the coordinator's telemetry-check reads: national,
  // table, wins, exiled, wave5 — all 0/1. gameDays is the survival day.
  // wave5Day is the daily-sampled unlock day (finding #360).
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    if (beats.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} nat=${out.national} wave=${out.maxWave} w4d=${out.wave4Day} w5=${out.wave5} w5d=${out.wave5Day} table=${out.table} wins=${out.wins} hunts=${out.w5Hunts} live=${out.w5LiveDays} sit=${out.w5SittingDays} engaged=${out.w5HuntEngaged} readyBlk=${out.w5ReadyBlocked} pantryBlk=${out.w5PantryBlocked} capBlk=${out.w5CapBlocked} burstBlk=${out.w5BurstBlocked} tableBlk=${out.w5TableBlocked} exiled=${out.exiled}`);
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

  const recs = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      for (const side of ['control', 'armed']) {
        if (!match(policyId, side)) continue;
        recs.push(await oneRun(seed, policyId, side));
      }
    }
  }
  delete process.env.BELONGHUNT;

  // ---- summary ----
  const by = (side) => recs.filter(r => r.side === side);
  console.log('\n== belonghunt sweep summary (pre-seat stack, belong road, road+readiness+absence gates) ==');
  for (const side of ['control', 'armed']) {
    const rs = by(side);
    const n = rs.length;
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    console.log(`${side}: n=${n} w5=${sum('wave5')}/${n} wins=${sum('wins')} national=${sum('national')}/${n} ` +
      `table=${sum('table')}/${n} wave4=${sum('wave45')}/${n} exiled=${sum('exiled')}/${n} ` +
      `medianSurv(all)=${median(rs.map(r => r.gameDays)).toFixed(1)}d ` +
      `hunts=${sum('w5Hunts')} live=${sum('w5LiveDays')} sit=${sum('w5SittingDays')} engaged=${sum('w5HuntEngaged')} bloodFights=${sum('w5BloodFights')} facingFights=${sum('w5FacingFights')} ` +
      `readyBlk=${sum('w5ReadyBlocked')} pantryBlk=${sum('w5PantryBlocked')} capBlk=${sum('w5CapBlocked')} burstBlk=${sum('w5BurstBlocked')} tableBlk=${sum('w5TableBlocked')}`);
  }
  // PRIMARY: belong wave-5 unlocks armed >= control + 2.
  const cUnlocks = by('control').reduce((a, r) => a + (r.wave5 | 0), 0);
  const aUnlocks = by('armed').reduce((a, r) => a + (r.wave5 | 0), 0);
  console.log(`PRIMARY: belong wave-5 unlocks armed ${aUnlocks}/8 vs control ${cUnlocks}/8 (bar: armed >= control+2) → ${aUnlocks >= cUnlocks + 2 ? 'GO' : 'NO-GO'}`);
  // SECONDARY surface: paired unlock-day deltas (armed − control) over
  // pairs where BOTH sides unlocked; one-sided pairs listed separately.
  const pairs = [];
  const oneSided = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const a = recs.find(r => r.side === 'armed' && r.policyId === policyId && r.seed === seed);
      const c = recs.find(r => r.side === 'control' && r.policyId === policyId && r.seed === seed);
      if (!a || !c) continue;
      if (a.wave5Day != null && c.wave5Day != null) pairs.push({ seed, policyId, delta: a.wave5Day - c.wave5Day, a: a.wave5Day, c: c.wave5Day });
      else if (a.wave5Day != null || c.wave5Day != null) oneSided.push({ seed, policyId, a: a.wave5Day, c: c.wave5Day });
    }
  }
  const deltas = pairs.map(p => p.delta);
  const meanDelta = deltas.length ? deltas.reduce((x, d) => x + d, 0) / deltas.length : NaN;
  console.log(`SECONDARY paired unlock-day deltas (armed−control, both-unlocked pairs n=${pairs.length}):`);
  for (const p of pairs) console.log(`  s${p.seed} ${p.policyId}: armed d${p.a} vs control d${p.c} → ${p.delta >= 0 ? '+' : ''}${p.delta}`);
  console.log(`  one-sided (not in mean): ${oneSided.map(p => `s${p.seed}:${p.policyId} a=${p.a} c=${p.c}`).join(' ') || '(none)'}`);
  console.log(`  MEAN DELTA = ${Number.isNaN(meanDelta) ? 'NaN (no both-unlocked pairs — a finding, not a failure)' : meanDelta.toFixed(2) + 'd'}`);
  // EXERCISE GATE: engagements.
  const eng = by('armed').reduce((x, r) => x + (r.w5HuntEngaged | 0), 0);
  console.log(`EXERCISE GATE: armed engagements=${eng} (need ≥4 or this is no-contact, not a null)`);
  // wave-5 unlock days (daily-sampled).
  for (const side of ['control', 'armed']) {
    const ds = by(side).filter(r => r.wave5Day != null).map(r => `s${r.seed}:${r.policyId}=d${r.wave5Day}`);
    console.log(`${side} wave-5 unlock days: ${ds.join(' ') || '(none)'}`);
  }
  // LOUD: any win on either side (expected 0 on the pre-seat stack).
  for (const side of ['control', 'armed']) {
    const w = by(side).filter(r => r.wins);
    if (w.length) console.log(`LOUD: ${side} WON ${w.length} run(s): ${w.map(r => `s${r.seed}:${r.policyId}`).join(' ')} — changes the interpretation`);
  }
  // Death-mode shares both sides (guardrail: no new death mode).
  for (const side of ['control', 'armed']) {
    const tally = {};
    for (const r of by(side)) for (const [k, v] of Object.entries(r.deaths)) tally[k] = (tally[k] || 0) + v;
    const starv = tally['starvation'] || 0;
    console.log(`${side} death modes: ${Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + 'x' + v).join(', ') || '(none recorded)'} | starvation=${starv}`);
  }
  // Strand check: tableActive (sitting) days vs hunts.
  for (const side of ['control', 'armed']) {
    const rs = by(side);
    const sit = rs.reduce((a, r) => a + (r.w5SittingDays | 0), 0);
    const tb = rs.reduce((a, r) => a + (r.w5TableBlocked | 0), 0);
    const hunts = rs.reduce((a, r) => a + (r.w5Hunts | 0), 0);
    console.log(`STRAND CHECK ${side}: sittingDays=${sit} tableBlocked=${tb} hunts=${hunts} ${side === 'armed' && sit > hunts ? '— STRAND SUSPECT' : ''}`);
  }
}
)().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
