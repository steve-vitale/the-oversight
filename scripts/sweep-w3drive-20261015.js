#!/usr/bin/env node
// sweep-w3drive-20261015.js — the wave-3 counter-learning sweep
// (flesh-out loop, 2026-10-15, scale-onramp axis, sim-w3drive).
//
// 8 seeds x {leadfeast, belongfeast} x {control, armed}, 180d death-aware,
// identical seeds both sides. Own control in the SAME sweep.
//
// Substrate (asserted up front — #312 lesson):
//   FEASTSCALE_R13=1  TRIBFLOOR=1  SUCCGRACE=1  RAIDDENSITY=1
//   WINPURSUIT=1  WINDEFER=1  (set inside oneRun)
//   SEATDRIVE NEVER set (asserted — the pre-seat stack; wincensus proved it
//   inert: 0/16 wins)
//   control: naked tribfloor->windefer chain (WD.withWinDefer(TF.*, id
//   'leadfeast-windefer'/'belongfeast-windefer')) + W3DRIVE unset
//   armed:   the SAME construction + withW3Drive + W3DRIVE=1
//   (W3.leadw3 / W3.belongw3 — both sides share the objects pattern, W3DRIVE
//   is the only switch)
//
// THE INSTRUMENT (see the proof's tele-funnel pin):
//   - A per-run observe-only Game.tele wrap captures day-stamped
//     'counter_discovered' events (the ONLY funnel into state.villagerTricks
//     — _trickObservation always fires it) and 'wave_unlock' events.
//   - PRIMARY wave-3+ counter-kill share: for each state.waveKillLog entry
//     with w >= 3, a kill is counter-attributed iff a counter_discovered
//     event for that mid fired at day <= kill day. Share = attributed /
//     total wave-3+ kills. (wave-4/5 have no trick defs by design — they
//     contribute denominator kills only; the metric is honest about that.)
//   - CO-PRIMARY wave-3+ counter discoveries: count of counter_discovered
//     events for wave>=3 mids per run.
//   The wrap never throws, never writes game state, never touches RNG —
//   it cannot move the sim (the det-gate pins gate-off byte-identical).
//
// Pre-registered GO (binding, MEASUREMENT §14 — see
// evidence/2026-10-15/sim-w3drive.md):
//   PRIMARY: wave-3+ counter-kill share armed >= 1.5x control.
//   CO-PRIMARY: wave-3+ counter discoveries armed >= control + 2.
//   GUARDRAILS: median survival armed >= control - 10d; starvation deaths
//     armed <= control + 2; no new death mode (n>=3).
//   PILOT GATE: 8 pairs (SEEDS subset 151,262,373,484 x {leadfeast,
//     belongfeast}) first; GO to confirm if armed discoveries >= control
//     + 1 OR armed share >= 1.5x control (on pairs with wave-3+ kills);
//     KILL at pilot otherwise (delete the layer file, evidence-only commit).
//   NO-COVERAGE rule: if control has zero wave-3+ kills, the primary share
//     is undefined — verdict NO-COVERAGE and the co-primary decides.
// Per-seed JSONs carry numeric national, table, wins, exiled, w3, wave3
// for the coordinator's telemetry-check (keys EXACT — the won/wins
// schema-drift trap, twice today).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 SMOKE=1 node scripts/sweep-w3drive-20261015.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/sweep-w3drive-20261015.js
// Targeted re-runs: SEEDS="151,262" ONLY="leadfeast,armed;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
const WD = require('./policies/windefer');
const TF = require('./policies/tribfloor');
// KILL PROTOCOL: the layer was deleted after the confirm-stage guardrail
// miss (see evidence/2026-10-15/sim-w3drive.md). The sweep refuses to run
// without it; instruments are retained.
const W3_PATH = (() => { try { return require.resolve('./policies/w3drive'); } catch (e) { return null; } })();
if (!W3_PATH) { console.error('SWEEP STOP: scripts/policies/w3drive.js absent (layer deleted per kill protocol). Instruments retained.'); process.exit(2); }
const W3 = require(W3_PATH);
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE === '1') { console.error('SWEEP STOP: SEATDRIVE must NOT be set (pre-seat stack).'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [151, 262, 373, 484, 595, 706, 817, 928]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-w3drive');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-15', 'w3drive-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Both sides share the same construction — W3DRIVE is the only switch
// (the composition pattern from the proof: armed = W3.leadw3/belongw3,
// control = naked tribfloor->windefer with the same ids).
function policyFor(policyId, side) {
  if (side === 'armed') return policyId === 'leadfeast' ? W3.leadw3 : W3.belongw3;
  const tf = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  return WD.withWinDefer(tf, `${policyId}-windefer`, 'naked tribfloor->windefer for the w3drive control side');
}
function expectedId(policyId) { return `${policyId}-windefer`; }

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function beastWaveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 1;
  } catch (e) { return 1; }
}

// Beat capture: ring buffer. Keyed on counter/trick/hunt language for the
// SENSE-TESTING read (do villagers act like people learning monster tricks?).
const BEAT_RE = /counter|trick|beast|lived to tell|hunt|expedition|spool|chorus|buffering|wave ?3|final draft|died|dead|starv|national/i;
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

// Instrument: observe-only Game.tele wrap. Captures day-stamped
// counter_discovered (the single funnel into villagerTricks — the proof
// pins that) and wave_unlock events. Never throws, never writes game
// state, never touches RNG.
function attachCounterInstrument(Game, t) {
  t.counterDiscovered = []; // {day, id, via}
  t.waveUnlock = [];        // {day, wave}
  try {
    const orig = Game.tele ? Game.tele.bind(Game) : null;
    if (!orig) return;
    Game.tele = function (type, data) {
      try {
        if (type === 'counter_discovered' && data && data.id) {
          t.counterDiscovered.push({ day: gday(Game), id: String(data.id), via: String(data.via || '?') });
        } else if (type === 'wave_unlock' && data) {
          t.waveUnlock.push({ day: gday(Game), wave: (data.wave | 0) || 0 });
        }
      } catch (e) {}
      return orig(type, data);
    };
  } catch (e) {}
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
    if (side === 'armed') process.env.W3DRIVE = '1'; else delete process.env.W3DRIVE;
    if (process.env.SEATDRIVE === '1') throw new Error('SEATDRIVE leaked into smoke');
    const base = policyFor('belongfeast', side);
    const { Game } = await loadGame({ seed: 151, mode: `w3drive-smoke-${side}`, fullTelemetry: false });
    await setupGame(Game);
    let ctxLive = null, w3Live = null, tfLive = null, wdLive = null;
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => {
      ctxLive = ctx; w3Live = W3.w3driveOn(); tfLive = TF.layerOn(); wdLive = WD.layerOn();
      if (oSetup) return oSetup(G, ctx);
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`${side}: layer-live markers honest`, w3Live === (side === 'armed') && tfLive === true && wdLive === true,
      `w3=${w3Live} tf=${tfLive} wd=${wdLive}`);
    check(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    check(`${side}: expected policy id`, base.id === 'belongfeast-windefer', base.id);
  }
  delete process.env.W3DRIVE;
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  process.env.WINPURSUIT = '1';
  process.env.WINDEFER = '1';
  if (armed) process.env.W3DRIVE = '1'; else delete process.env.W3DRIVE;
  if (process.env.SEATDRIVE === '1') throw new Error('SEATDRIVE set mid-sweep — aborting');
  const base = policyFor(policyId, side);
  const { Game } = await loadGame({ seed, mode: `w3drive-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null, w3Live = null, tfLive = null, wdLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    runCtx = ctx; w3Live = W3.w3driveOn(); tfLive = TF.layerOn(); wdLive = WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const hist = { maxRank: 0, everTable: false, exiled: false, wave3Day: null };
  const hashes = [];
  const beats = { beats: [] };
  const inst = { counterDiscovered: [], waveUnlock: [] };
  attachBeats(Game, beats);
  attachCounterInstrument(Game, inst);
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      if (hist.wave3Day == null) {
        try { if (G.unlockedWave && G.unlockedWave() >= 3) hist.wave3Day = gday(G); } catch (e) {}
      }
    } catch (e) {}
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (w3Live !== armed || tfLive !== true || wdLive !== true)
    throw new Error(`layer-live marker mismatch: side=${side} w3=${w3Live} tf=${tfLive} wd=${wdLive}`);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const endInfo = { won: !!Game.won, gameDays: result.gameDays, endReason: result.endReason };
  const maxWave = result.maxWaveUnlocked || 1;
  // wave-3 unlock day: authoritative from daily unlockedWave() sampling
  // (the wave_unlock tele name doesn't exist — the wave5reach sweep's
  // tele-based capture was equally vacuous; pinned here).
  const wave3Day = hist.wave3Day;
  // --- counter knowledge instrument ---
  // discoveries: counter_discovered events for wave>=3 mids (the only
  // wave-3 trick funnel — the proof pins it).
  const discDay = {}; // mid -> first discovery day
  for (const ev of inst.counterDiscovered) {
    if (beastWaveOf(Game, ev.id) < 3) continue;
    if (!(ev.id in discDay)) discDay[ev.id] = ev.day;
  }
  const discoveries = Object.keys(discDay).length;
  // kills: waveKillLog (engine-logged, every kill path) with w>=3.
  // counterKill: trick knowledge existed at kill day (discovery day <= kill day).
  let w3Kills = 0, w3CounterKills = 0, w3TrickExecKills = 0;
  try {
    const log = (Game.state && Game.state.waveKillLog) || [];
    for (const k of log) {
      if ((k.w | 0) < 3) continue;
      w3Kills++;
      const dd = discDay[k.mid];
      if (dd != null && dd <= (k.d | 0)) w3CounterKills++;
      if (k.trick) w3TrickExecKills++;
    }
  } catch (e) {}
  const share = w3Kills > 0 ? w3CounterKills / w3Kills : null;
  // end-state trick knowledge (villagerTricks keys, wave>=3) — cross-check
  // against the tele capture.
  let vtW3 = 0;
  try {
    const vt = (Game.state && Game.state.villagerTricks) || {};
    for (const mid of Object.keys(vt)) if (vt[mid] && beastWaveOf(Game, mid) >= 3) vtW3++;
  } catch (e) {}
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: endInfo.won ? 1 : 0,
    maxWave, w3: maxWave >= 3 ? 1 : 0, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave3Day,
    exiled: hist.exiled ? 1 : 0,
    // w3drive counters
    w3Hunts: (runCtx && runCtx.w3Hunts) || 0,
    w3HuntLegs: (runCtx && runCtx.w3HuntLegs) || 0,
    w3HuntSteps: (runCtx && runCtx.w3HuntSteps) || 0,
    w3HuntEngaged: (runCtx && runCtx.w3HuntEngaged) || 0,
    w3BloodFights: (runCtx && runCtx.w3BloodFights) || 0,
    // counter knowledge instrument
    discoveries,            // wave-3+ counter discoveries (tele funnel)
    vtW3,                   // wave-3+ villagerTricks at end state (cross-check)
    w3Kills, w3CounterKills, w3TrickExecKills,
    share,                  // null when no wave-3+ kills (NO-COVERAGE rule)
    hashes,
  };
  // Numeric fields the coordinator's telemetry-check reads: national,
  // table, wins, exiled, w3, wave5 — all 0/1. gameDays is the survival day.
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    if (beats.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} w3=${out.w3} w3day=${out.wave3Day} nat=${out.national} wins=${out.wins} table=${out.table} hunts=${out.w3Hunts} engaged=${out.w3HuntEngaged} blood=${out.w3BloodFights} disc=${out.discoveries} vtW3=${out.vtW3} kills=${out.w3Kills} ckills=${out.w3CounterKills} share=${out.share == null ? 'nc' : out.share.toFixed(2)} exiled=${out.exiled}`);
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
  delete process.env.W3DRIVE;

  // ---- summary ----
  const by = (side) => recs.filter(r => r.side === side);
  console.log('\n== w3drive sweep summary ==');
  for (const side of ['control', 'armed']) {
    const rs = by(side);
    const n = rs.length;
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    const kills = sum('w3Kills'), ckills = sum('w3CounterKills');
    console.log(`${side}: n=${n} w3=${sum('w3')}/${n} nat=${sum('national')}/${n} table=${sum('table')}/${n} ` +
      `wave4=${sum('wave45')}/${n} wave5=${sum('wave5')}/${n} wins=${sum('wins')}/${n} exiled=${sum('exiled')}/${n} ` +
      `medianSurv(all)=${median(rs.map(r => r.gameDays)).toFixed(1)}d ` +
      `hunts=${sum('w3Hunts')} engaged=${sum('w3HuntEngaged')} bloodFights=${sum('w3BloodFights')} ` +
      `discoveries=${sum('discoveries')} w3Kills=${kills} w3CounterKills=${ckills} ` +
      `share=${kills ? (ckills / kills).toFixed(3) : 'nc'}`);
  }
  // PRIMARY: wave-3+ counter-kill share, armed vs control.
  const shareOf = (rs) => {
    const k = rs.reduce((a, r) => a + r.w3Kills, 0), c = rs.reduce((a, r) => a + r.w3CounterKills, 0);
    return k ? c / k : null;
  };
  const shA = shareOf(by('armed')), shC = shareOf(by('control'));
  console.log(`PRIMARY counter-kill share: armed=${shA == null ? 'nc' : shA.toFixed(3)} control=${shC == null ? 'nc' : shC.toFixed(3)} ` +
    `ratio=${(shA != null && shC) ? (shA / shC).toFixed(2) + 'x' : 'n/a (zero-control or no-coverage)'}`);
  // CO-PRIMARY: wave-3+ discoveries.
  const dA = by('armed').reduce((a, r) => a + r.discoveries, 0);
  const dC = by('control').reduce((a, r) => a + r.discoveries, 0);
  console.log(`CO-PRIMARY discoveries: armed=${dA} control=${dC} delta=${dA - dC}`);
  // GUARDRAILS: matched median survival on pairs; starvation deaths.
  const pairs = [];
  for (const r of by('armed')) {
    const c = recs.find(x => x.side === 'control' && x.policyId === r.policyId && x.seed === r.seed);
    if (c) pairs.push({ seed: r.seed, policyId: r.policyId, armed: r.gameDays, control: c.gameDays });
  }
  console.log(`matched pairs: n=${pairs.length} ` +
    `medianSurv armed=${median(pairs.map(p => p.armed)).toFixed(1)}d ` +
    `control=${median(pairs.map(p => p.control)).toFixed(1)}d`);
  const starv = (rs) => rs.reduce((a, r) => a + Object.entries(r.deaths || {})
    .filter(([k]) => /starv/i.test(k)).reduce((x, [, v]) => x + v, 0), 0);
  console.log(`starvation deaths: armed=${starv(by('armed'))} control=${starv(by('control'))}`);
  // Death-mode shares both sides.
  for (const side of ['control', 'armed']) {
    const tally = {};
    for (const r of by(side)) for (const [k, v] of Object.entries(r.deaths)) tally[k] = (tally[k] || 0) + v;
    console.log(`${side} death modes: ${Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + 'x' + v).join(', ') || '(none recorded)'}`);
  }
  // wave-3 unlock days (mechanism sanity: hunts start at uw=3).
  console.log(`wave3 unlock day: armed=[${by('armed').map(r => r.wave3Day == null ? 'x' : r.wave3Day).join(',')}] ` +
    `control=[${by('control').map(r => r.wave3Day == null ? 'x' : r.wave3Day).join(',')}]`);
}
)().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
