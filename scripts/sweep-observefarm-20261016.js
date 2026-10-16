#!/usr/bin/env node
// sweep-observefarm-20261016.js — the non-lethal observation-farming sweep
// (flesh-out loop, 2026-10-16, scale-onramp axis, sim-observefarm).
//
// 8 fresh seeds x {leadfeast, belongfeast} x {control, armed}, 180d
// death-aware, identical seeds both sides. Own control in the SAME sweep.
// Pilot: seeds 141,252,363,474 (8 pairs); confirm: 191,302,413,524
// (8 pairs). Seed freshness verified against evidence/2026-10-1* at
// proof time (none of these 8 appear in any prior sweep's seed list).
//
// Substrate (asserted up front — #312 lesson):
//   FEASTSCALE_R13=1  TRIBFLOOR=1  SUCCGRACE=1  RAIDDENSITY=1
//   WINPURSUIT=1  WINDEFER=1  (set inside oneRun)
//   SEATDRIVE NEVER set (asserted — the pre-seat stack, comparable to the
//   whole w3drive line)
//   control: naked tribfloor->windefer chain (WD.withWinDefer(TF.*, id
//   'leadfeast-windefer'/'belongfeast-windefer')) + OBSERVEFARM unset
//   armed:   the SAME construction + withObserveFarm + OBSERVEFARM=1
//   (OF.leadseat / OF.belongseat — both sides share the objects pattern,
//   OBSERVEFARM is the only switch)
//
// THE INSTRUMENT (see the proof's tele-funnel pin):
//   - A per-run observe-only Game.tele wrap captures day-stamped
//     'counter_discovered' events (the ONLY funnel into
//     state.villagerTricks — _trickObservation always fires it) and
//     'counter_observed' events (the per-encounter bar increments, with
//     n — feeds the per-engagement observation rate secondary).
//   - PRIMARY: wave-3+ trick discoveries (count of counter_discovered
//     events for wave>=3 mids per run). Bar: armed >= control + 4 (the
//     bar w3drive2 missed at +3 — this arm must honestly beat it).
//   - SECONDARY (report-only): knowledge->execution conversion
//     (counter-executed kills of observed species — waveKillLog trick
//     flag x discovery-day), per-engagement observation rate
//     (counter_observed events / ofHuntEngaged).
//   - Mantle transfers (scholar deaths) counted from beats — the
//     "scholar combat deaths" guardrail.
// The wrap never throws, never writes game state, never touches RNG —
// it cannot move the sim (the det-gate pins gate-off byte-identical).
//
// Pre-registered GO (binding, MEASUREMENT §14 — see
// evidence/2026-10-16/sim-observefarm.md):
//   PRIMARY: wave-3+ trick discoveries armed >= control + 4.
//   GUARDRAILS: median survival armed >= control - 10d; scholar combat
//     deaths (mantle transfers) armed <= control + 1; starvation deaths
//     armed <= control; national armed >= control - 2; no new death mode
//     (n>=3).
//   PILOT GATE: 8 pairs (SEEDS 141,252,363,474 x {leadfeast,belongfeast})
//     first; GO to confirm iff armed discoveries >= control + 2 AND
//     median survival >= control - 10d AND scholar deaths <= control + 1
//     on the pilot pairs; KILL at pilot otherwise (delete the layer file
//     per kill protocol, keep instruments + evidence).
//   REPORT: per-seed pair survival deltas, mantle-transfer counts,
//     ofHunts/ofHuntEngaged/ofRetreats (lever-live proof).
// Per-seed JSONs carry EXACT numeric keys national, table, wins, won,
// exiled, w3, wave5 for the coordinator's telemetry-check (the won/wins
// schema-drift trap — emit BOTH).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 SMOKE=1 node scripts/sweep-observefarm-20261016.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/sweep-observefarm-20261016.js
// Targeted re-runs: SEEDS="141,252" ONLY="leadfeast,armed;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
const WD = require('./policies/windefer');
const TF = require('./policies/tribfloor');
const OF_PATH = (() => { try { return require.resolve('./policies/observefarm'); } catch (e) { return null; } })();
if (!OF_PATH) { console.error('SWEEP STOP: scripts/policies/observefarm.js absent. Instruments retained.'); process.exit(2); }
const OF = require(OF_PATH);
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE === '1') { console.error('SWEEP STOP: SEATDRIVE must NOT be set (pre-seat stack).'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [141, 252, 363, 474, 191, 302, 413, 524]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-observefarm');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'observefarm-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Both sides share the same construction — OBSERVEFARM is the only switch
// (armed = OF.leadseat/belongseat, control = naked tribfloor->windefer
// with the same ids).
function policyFor(policyId, side) {
  if (side === 'armed') return policyId === 'leadfeast' ? OF.leadseat : OF.belongseat;
  const tf = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  return WD.withWinDefer(tf, `${policyId}-windefer`, 'naked tribfloor->windefer for the observefarm control side');
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function beastWaveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 1;
  } catch (e) { return 1; }
}

// Beat capture: ring buffer. Keyed on counter/trick/observation language
// for the SENSE-TESTING read, plus mantle language for the scholar-death
// count and starvation language for the pantry-gate read.
const BEAT_RE = /counter|trick|beast|lived to tell|hunt|expedition|spool|chorus|buffering|wave ?3|died|dead|starv|mantle|national|retreat|withdrew|broke off/i;
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
// pins that), counter_observed (per-encounter bar increments), and
// wave_unlock events. Never throws, never writes game state, never
// touches RNG.
function attachCounterInstrument(Game, t) {
  t.counterDiscovered = []; // {day, id, via}
  t.counterObserved = [];   // {day, id, n, vid}
  t.waveUnlock = [];        // {day, wave}
  try {
    const orig = Game.tele ? Game.tele.bind(Game) : null;
    if (!orig) return;
    Game.tele = function (type, data) {
      try {
        if (type === 'counter_discovered' && data && data.id) {
          t.counterDiscovered.push({ day: gday(Game), id: String(data.id), via: String(data.via || '?') });
        } else if (type === 'counter_observed' && data && data.id) {
          t.counterObserved.push({ day: gday(Game), id: String(data.id), n: (data.n | 0) || 0, vid: String(data.vid || '?') });
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
    if (side === 'armed') process.env.OBSERVEFARM = '1'; else delete process.env.OBSERVEFARM;
    if (process.env.SEATDRIVE === '1') throw new Error('SEATDRIVE leaked into smoke');
    const base = policyFor('belongfeast', side);
    const { Game } = await loadGame({ seed: 141, mode: `observefarm-smoke-${side}`, fullTelemetry: false });
    await setupGame(Game);
    let ofLive = null, tfLive = null, wdLive = null;
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => {
      ofLive = OF.observefarmOn(); tfLive = TF.layerOn(); wdLive = WD.layerOn();
      if (oSetup) return oSetup(G, ctx);
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`${side}: layer-live markers honest`, ofLive === (side === 'armed') && tfLive === true && wdLive === true,
      `of=${ofLive} tf=${tfLive} wd=${wdLive}`);
    check(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    check(`${side}: expected policy id`, base.id === 'belongfeast-windefer', base.id);
  }
  delete process.env.OBSERVEFARM;
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

function countMantleTransfers(beats) {
  let n = 0;
  for (const b of beats) {
    if (/mantle transfer|mantle passes to/i.test(b.text || '')) n++;
  }
  return n;
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  process.env.WINPURSUIT = '1';
  process.env.WINDEFER = '1';
  if (armed) process.env.OBSERVEFARM = '1'; else delete process.env.OBSERVEFARM;
  if (process.env.SEATDRIVE === '1') throw new Error('SEATDRIVE set mid-sweep — aborting');
  const base = policyFor(policyId, side);
  const { Game } = await loadGame({ seed, mode: `observefarm-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null, ofLive = null, tfLive = null, wdLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    runCtx = ctx; ofLive = OF.observefarmOn(); tfLive = TF.layerOn(); wdLive = WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const hist = { maxRank: 0, everTable: false, exiled: false, wave3Day: null };
  const hashes = [];
  const beats = { beats: [] };
  const inst = { counterDiscovered: [], counterObserved: [], waveUnlock: [] };
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
  if (ofLive !== armed || tfLive !== true || wdLive !== true)
    throw new Error(`layer-live marker mismatch: side=${side} of=${ofLive} tf=${tfLive} wd=${wdLive}`);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const won = !!Game.won;
  const maxWave = result.maxWaveUnlocked || 1;
  // wave-3 unlock day: authoritative from daily unlockedWave() sampling
  // (daily sampling can miss final-day unlocks — cross-check beats).
  const wave3Day = hist.wave3Day;
  // --- counter knowledge instrument (tele funnel ONLY — hygiene (d)) ---
  const discDay = {}; // mid -> first discovery day
  for (const ev of inst.counterDiscovered) {
    if (beastWaveOf(Game, ev.id) < 3) continue;
    if (!(ev.id in discDay)) discDay[ev.id] = ev.day;
  }
  const discoveries = Object.keys(discDay).length;
  const w3Observed = inst.counterObserved.filter(ev => beastWaveOf(Game, ev.id) >= 3).length;
  // kills: waveKillLog (engine-logged, every kill path) with w>=3.
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
  let vtW3 = 0;
  try {
    const vt = (Game.state && Game.state.villagerTricks) || {};
    for (const mid of Object.keys(vt)) if (vt[mid] && beastWaveOf(Game, mid) >= 3) vtW3++;
  } catch (e) {}
  const mantleTransfers = countMantleTransfers(beats.beats);
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: won ? 1 : 0, won: won ? 1 : 0,
    maxWave, w3: maxWave >= 3 ? 1 : 0, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave3Day,
    exiled: hist.exiled ? 1 : 0,
    // observefarm counters
    ofHunts: (runCtx && runCtx.ofHunts) || 0,
    ofHuntLegs: (runCtx && runCtx.ofHuntLegs) || 0,
    ofHuntSteps: (runCtx && runCtx.ofHuntSteps) || 0,
    ofHuntEngaged: (runCtx && runCtx.ofHuntEngaged) || 0,
    ofPantryGateBlocks: (runCtx && runCtx.ofPantryGateBlocks) || 0,
    ofFarmDoneSkips: (runCtx && runCtx.ofFarmDoneSkips) || 0,
    ofRetreats: (runCtx && runCtx.ofRetreats) || 0,
    ofFarmTurns: (runCtx && runCtx.ofFarmTurns) || 0,
    mantleTransfers,
    // counter knowledge instrument
    discoveries,            // PRIMARY: wave-3+ trick discoveries (tele funnel)
    w3Observed,             // wave-3+ counter_observed events (per-encounter bar increments)
    vtW3,                   // wave-3+ villagerTricks at end state (cross-check)
    w3Kills, w3CounterKills, w3TrickExecKills,
    share,                  // null when no wave-3+ kills
    hashes,
  };
  // Numeric fields the coordinator's telemetry-check reads: national,
  // table, wins, exiled, w3, wave5 — all 0/1 (won duplicated for the
  // won/wins schema-drift trap). gameDays is the survival day.
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    if (beats.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} w3=${out.w3} w3day=${out.wave3Day} nat=${out.national} wins=${out.wins} table=${out.table} hunts=${out.ofHunts} engaged=${out.ofHuntEngaged} retreats=${out.ofRetreats} gateblocks=${out.ofPantryGateBlocks} doneSkips=${out.ofFarmDoneSkips} mantle=${out.mantleTransfers} disc=${out.discoveries} obs=${out.w3Observed} vtW3=${out.vtW3} kills=${out.w3Kills} ckills=${out.w3CounterKills} share=${out.share == null ? 'nc' : out.share.toFixed(2)} exiled=${out.exiled}`);
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
  delete process.env.OBSERVEFARM;

  // ---- summary ----
  const by = (side) => recs.filter(r => r.side === side);
  console.log('\n== observefarm sweep summary ==');
  for (const side of ['control', 'armed']) {
    const rs = by(side);
    const n = rs.length;
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    const kills = sum('w3Kills'), ckills = sum('w3CounterKills');
    console.log(`${side}: n=${n} w3=${sum('w3')}/${n} nat=${sum('national')}/${n} table=${sum('table')}/${n} ` +
      `wave4=${sum('wave45')}/${n} wave5=${sum('wave5')}/${n} wins=${sum('wins')}/${n} exiled=${sum('exiled')}/${n} ` +
      `medianSurv(all)=${median(rs.map(r => r.gameDays)).toFixed(1)}d ` +
      `hunts=${sum('ofHunts')} engaged=${sum('ofHuntEngaged')} retreats=${sum('ofRetreats')} gateblocks=${sum('ofPantryGateBlocks')} doneSkips=${sum('ofFarmDoneSkips')} ` +
      `mantle=${sum('mantleTransfers')} discoveries=${sum('discoveries')} obs=${sum('w3Observed')} w3Kills=${kills} w3CounterKills=${ckills} ` +
      `share=${kills ? (ckills / kills).toFixed(3) : 'nc'}`);
  }
  // PRIMARY: wave-3+ trick discoveries.
  const dA = by('armed').reduce((a, r) => a + r.discoveries, 0);
  const dC = by('control').reduce((a, r) => a + r.discoveries, 0);
  console.log(`PRIMARY discoveries: armed=${dA} control=${dC} delta=${dA - dC} (bar: >= control+4)`);
  // secondary: counter-kill share + per-engagement observation rate
  const shareOf = (rs) => {
    const k = rs.reduce((a, r) => a + r.w3Kills, 0), c = rs.reduce((a, r) => a + r.w3CounterKills, 0);
    return k ? c / k : null;
  };
  const shA = shareOf(by('armed')), shC = shareOf(by('control'));
  console.log(`secondary counter-kill share: armed=${shA == null ? 'nc' : shA.toFixed(3)} control=${shC == null ? 'nc' : shC.toFixed(3)} ` +
    `ratio=${(shA != null && shC) ? (shA / shC).toFixed(2) + 'x' : 'n/a'}`);
  const obsRate = (rs) => {
    const o = rs.reduce((a, r) => a + r.w3Observed, 0), e = rs.reduce((a, r) => a + r.ofHuntEngaged, 0);
    return e ? o / e : null;
  };
  const orA = obsRate(by('armed')), orC = obsRate(by('control'));
  console.log(`secondary per-engagement observation rate: armed=${orA == null ? 'nc' : orA.toFixed(2)} control=${orC == null ? 'nc' : orC.toFixed(2)}`);
  // GUARDRAILS: matched median survival on pairs; scholar deaths; starvation; national.
  const pairs = [];
  for (const r of by('armed')) {
    const c = recs.find(x => x.side === 'control' && x.policyId === r.policyId && x.seed === r.seed);
    if (c) pairs.push({ seed: r.seed, policyId: r.policyId, armed: r.gameDays, control: c.gameDays, delta: r.gameDays - c.gameDays });
  }
  console.log(`matched pairs: n=${pairs.length} ` +
    `medianSurv armed=${median(pairs.map(p => p.armed)).toFixed(1)}d ` +
    `control=${median(pairs.map(p => p.control)).toFixed(1)}d`);
  console.log(`pair deltas (armed-control days): ${pairs.map(p => `${p.policyId}-s${p.seed}:${p.delta >= 0 ? '+' : ''}${p.delta}`).join(' ')}`);
  const starv = (rs) => rs.reduce((a, r) => a + Object.entries(r.deaths || {})
    .filter(([k]) => /starv/i.test(k)).reduce((x, [, v]) => x + v, 0), 0);
  console.log(`starvation deaths: armed=${starv(by('armed'))} control=${starv(by('control'))} (bar: <= control)`);
  const natA = by('armed').reduce((a, r) => a + r.national, 0), natC = by('control').reduce((a, r) => a + r.national, 0);
  console.log(`national: armed=${natA} control=${natC} (bar: >= control-2)`);
  const manA = by('armed').reduce((a, r) => a + r.mantleTransfers, 0), manC = by('control').reduce((a, r) => a + r.mantleTransfers, 0);
  console.log(`scholar deaths (mantle transfers): armed=${manA} control=${manC} (bar: <= control+1)`);
  // Death-mode shares both sides.
  for (const side of ['control', 'armed']) {
    const tally = {};
    for (const r of by(side)) for (const [k, v] of Object.entries(r.deaths)) tally[k] = (tally[k] || 0) + v;
    console.log(`${side} death modes: ${Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + 'x' + v).join(', ') || '(none recorded)'}`);
  }
  console.log(`wave3 unlock day: armed=[${by('armed').map(r => r.wave3Day == null ? 'x' : r.wave3Day).join(',')}] ` +
    `control=[${by('control').map(r => r.wave3Day == null ? 'x' : r.wave3Day).join(',')}]`);
}
)().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
