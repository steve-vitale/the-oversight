#!/usr/bin/env node
// sweep-winwall-20261016.js — wall census on the new default-ON seatdrive
// composition (flesh-out loop ARM sim-winwall, 2026-10-16, scale-onramp
// axis).
//
// 8 FRESH seeds x {leadfeast, belongfeast} x {control, armed}, 180d
// death-aware, identical seeds both sides. Own control in the SAME sweep
// (#247 — never inherit a baseline).
//
// Substrate (asserted up front — #312 lesson):
//   FEASTSCALE_R13=1  TRIBFLOOR=1  SUCCGRACE=1  RAIDDENSITY=1
//   WINPURSUIT=1  WINDEFER=1  both sides.
//   BOTH sides compose withSeatDrive (SD.leadseat / SD.belongseat —
//   finding #389: uncomposed sweeps run the pre-seat substrate regardless
//   of the c004b9dd default-ON flip).
//   control: SEATDRIVE=0 explicit opt-out (pure delegation, det-gate pins
//            byte-identical to naked)
//   armed:   SEATDRIVE unset (default ON post-c004b9dd)
// ALLOWGATE2 unset — the landed allowgate2 layer is default-OFF and stays
// OFF for this replicate.
//
// Pre-registered GO (binding, MEASUREMENT §14 — see
// evidence/2026-10-16/sim-winwall.md):
//   PRIMARY: wins armed >= 8/16. CO-PRIMARY: wins control == 0.
//   GUARDRAILS: national armed >= national control - 2; exiled armed == 0;
//     armed death modes a subset of control's (no new death mode);
//     per-seed "control survived >= armed seatDay" (the winconfirm3
//     successor metric — the win must not cut a life short).
// Per-seed JSONs carry EXACT numeric keys national, table, wins, exiled,
// sittings (the schema-drift LOUD class).
//
// Wave unlocks: daily unlockedWave() sampling (#360) cross-checked against
// the harness's run-end maxWaveUnlocked and the beats (#375 final-day
// sampling edge). wave4 = max(dailyMax, harnessMax) >= 4; wave5 likewise.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 SMOKE=1 node scripts/sweep-winwall-20261016.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/sweep-winwall-20261016.js
// Targeted re-runs: SEEDS="1701,1702" ONLY="leadfeast,armed;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [1701, 1702, 1703, 1704, 1705, 1706, 1707, 1708]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-winwall');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'winwall-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function policyFor(policyId) {
  return policyId === 'leadfeast' ? SD.leadseat : SD.belongseat;
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

const BEAT_RE = /table|seat|ring of pale|path of|defer|overtime|won|win |died|dead|starv|national|regional|exile|crisis|wave [345]|ascend|treaty/i;
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

function seatDetail(Game) {
  try {
    const d = (Game.deedState ? Game.deedState() : {}) || {};
    const faced = d.wavesFaced || {};
    let w1 = 0, w2 = 0, w3 = 0, w4 = 0, w5 = 0;
    for (const mid of Object.keys(faced)) {
      const w = faced[mid] | 0;
      if (w === 1) w1++; else if (w === 2) w2++; else if (w === 3) w3++; else if (w === 4) w4++; else if (w === 5) w5++;
    }
    return { w1, w2, w3, w4, w5, contestsN: d.contestsSurvived | 0 };
  } catch (e) { return {}; }
}

// Path census (diagnostic): the table's path/branch at run end, read-only
// from tableState (not tableTheme, which writes T.theme).
function winPathOf(Game) {
  try {
    const T = Game.tableState ? Game.tableState() : null;
    return { path: (T && T.path) || null, branch: (T && T.branch) || null };
  } catch (e) { return { path: null, branch: null }; }
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const side of ['control', 'armed']) {
    process.env.WINPURSUIT = '1';
    process.env.WINDEFER = '1';
    if (side === 'armed') delete process.env.SEATDRIVE; // default-ON post-c004b9dd
    else process.env.SEATDRIVE = '0';                   // explicit opt-out (#389)
    const { Game } = await loadGame({ seed: 1701, mode: `winwall-smoke-${side}`, fullTelemetry: false });
    await setupGame(Game);
    let seatLive = null, deferLive = null;
    const base = policyFor('belongfeast');
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => {
      seatLive = SD.layerOn(); deferLive = WD.layerOn();
      if (oSetup) return oSetup(G, ctx);
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`${side}: layer-live markers honest`, seatLive === (side === 'armed') && deferLive === true,
      `seat=${seatLive} defer=${deferLive}`);
    check(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    check(`${side}: expected policy id`, base.id === 'belongfeast-windefer', base.id);
  }
  delete process.env.SEATDRIVE;
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  process.env.WINPURSUIT = '1';
  process.env.WINDEFER = '1';
  if (armed) delete process.env.SEATDRIVE; // default-ON
  else process.env.SEATDRIVE = '0';        // explicit opt-out
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `winwall-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null, seatLive = null, deferLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    runCtx = ctx; seatLive = SD.layerOn(); deferLive = WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const hist = { maxRank: 0, everTable: false, exiled: false };
  const waveHist = { dailyMax: 1, wave4Day: null, wave5Day: null };
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
      // daily unlockedWave() sampling (#360); final-day edge cross-checked
      // against the harness's run-end maxWaveUnlocked (#375).
      try {
        const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1;
        if (w > waveHist.dailyMax) {
          waveHist.dailyMax = w;
          if (w >= 4 && waveHist.wave4Day == null) waveHist.wave4Day = gday(G);
          if (w >= 5 && waveHist.wave5Day == null) waveHist.wave5Day = gday(G);
        }
      } catch (e) {}
    } catch (e) {}
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (seatLive !== armed || deferLive !== true)
    throw new Error(`layer-live marker mismatch: side=${side} seat=${seatLive} defer=${deferLive}`);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const endInfo = { won: !!Game.won, gameDays: result.gameDays, endReason: result.endReason };
  const decisions = ((runCtx && runCtx._windefer && runCtx._windefer.decisions) || []).slice();
  const holds = decisions.filter(d => d.hold).length;
  // Wave unlocks: the larger of daily sampling and the harness run-end
  // telemetry (#375 final-day edge — harness maxWaveUnlocked is the
  // run-end sample).
  const harnessMax = (result.maxWaveUnlocked || 1) | 0;
  const waveMax = Math.max(waveHist.dailyMax, harnessMax);
  const winPath = winPathOf(Game);
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: endInfo.won ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    wave4Day: waveHist.wave4Day, wave5Day: waveHist.wave5Day,
    waveSampleNote: harnessMax > waveHist.dailyMax ? `harness-max ${harnessMax} exceeds daily ${waveHist.dailyMax} (#375 edge)` : 'daily||harness agree',
    exiled: hist.exiled ? 1 : 0,
    sittings: (runCtx && runCtx.sdSeatTaken) | 0,
    seatAttempts: (runCtx && runCtx.sdSeatAttempts) | 0,
    seatFailed: (runCtx && runCtx.sdSeatFailed) | 0,
    guardRefused: (runCtx && runCtx.sdGuardRefused) | 0,
    previewSeen: (runCtx && runCtx.sdPreviewSeen) | 0,
    seatDay: (runCtx && runCtx.sdSeatDay) || null,
    seatKind: (runCtx && runCtx.sdSeatKind) || null,
    tableAnswers: (runCtx && runCtx.tableAnswers) || 0,
    winPath: winPath.path, winBranch: winPath.branch,
    seatDetail: seatDetail(Game),
    holds, decisions,
    hashes,
  };
  // Numeric keys the coordinator's telemetry-check reads: national,
  // table, wins, exiled, sittings — 0/1 except sittings (count).
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    if (beats.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} nat=${out.national} wave=${out.maxWave} table=${out.table} sits=${out.sittings} wins=${out.wins} ans=${out.tableAnswers} holds=${holds} exiled=${out.exiled}`);
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
  delete process.env.SEATDRIVE;

  // ---- summary ----
  const by = (side) => recs.filter(r => r.side === side);
  console.log('\n== winwall sweep summary ==');
  for (const side of ['control', 'armed']) {
    const rs = by(side);
    const n = rs.length;
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    console.log(`${side}: n=${n} sittings=${sum('sittings')} wins=${sum('wins')} national=${sum('national')}/${n} ` +
      `table=${sum('table')}/${n} wave4=${sum('wave4')}/${n} wave5=${sum('wave5')}/${n} exiled=${sum('exiled')}/${n} ` +
      `medianSurv(all)=${median(rs.map(r => r.gameDays)).toFixed(1)}d ` +
      `answers=${sum('tableAnswers')} holds=${sum('holds')} guardRef=${sum('guardRefused')}`);
  }
  // winconfirm3 successor metric: per-seed control survived >= armed seatDay.
  let survMet = 0, survN = 0;
  for (const r of by('armed')) {
    const c = recs.find(x => x.side === 'control' && x.policyId === r.policyId && x.seed === r.seed);
    if (c && r.seatDay) { survN++; if (c.gameDays >= r.seatDay) survMet++; }
  }
  console.log(`control survived >= armed seatDay: ${survMet}/${survN}`);
  // Matched median survival on NON-WINNING runs (pre-registered).
  const pairs = [];
  for (const r of by('armed')) {
    const c = recs.find(x => x.side === 'control' && x.policyId === r.policyId && x.seed === r.seed);
    if (c && !r.wins && !c.wins) pairs.push({ seed: r.seed, policyId: r.policyId, armed: r.gameDays, control: c.gameDays });
  }
  console.log(`matched non-winning pairs: n=${pairs.length} ` +
    `medianSurv armed=${median(pairs.map(p => p.armed)).toFixed(1)}d ` +
    `control=${median(pairs.map(p => p.control)).toFixed(1)}d`);
  // Death-mode shares both sides.
  for (const side of ['control', 'armed']) {
    const tally = {};
    for (const r of by(side)) for (const [k, v] of Object.entries(r.deaths)) tally[k] = (tally[k] || 0) + v;
    console.log(`${side} death modes: ${Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + 'x' + v).join(', ') || '(none recorded)'}`);
  }
  // PRIMARY / CO-PRIMARY / guardrail verdict lines.
  const A = by('armed'), C = by('control');
  const sum = (rs, f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
  console.log(`PRIMARY wins: armed=${sum(A, 'wins')} control=${sum(C, 'wins')} (GO needs armed >= 8)`);
  console.log(`CO-PRIMARY control wins: ${sum(C, 'wins')} (needs == 0)`);
  console.log(`guardrail national: armed=${sum(A, 'national')} control=${sum(C, 'national')} (needs >= control-2)`);
  console.log(`guardrail exiled: armed=${sum(A, 'exiled')} (needs == 0)`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
