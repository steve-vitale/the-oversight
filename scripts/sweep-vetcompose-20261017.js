#!/usr/bin/env node
// scripts/sweep-vetcompose-20261017.js — sim-vetcompose sweep (2026-10-17,
// scale-onramp axis; evidence/2026-10-17/sim-vetcompose.md).
//
// THE ARM: compose vetrel's companion-veteran channel into the FULL win-side
// stack. Policies = withVetrel over the seatdrive-composed leadseat/belongseat
// (scripts/vetcompose-lib-20261017.js — shared with the proof so instrument
// and composition can never drift). Armed adds VETREL=1; control is the same
// wrapper with VETREL explicitly unset (gate-off = pure delegation — the
// proof's det-gate pins byte-identical vs the naked seatdrive stack).
//
// 8 fresh seeds x {leadseat, belongseat} x {armed, control}, 180d death-aware,
// identical seeds both sides, own in-sweep control.
//
// Substrate (asserted up front — #312 lesson):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//   WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1  (explicit, full win-side stack)
//   ALLOWGATE2 unset (landed layer default-OFF stays OFF)
//
// Per-seed JSON keys (telemetry-check alignment): national, table, wins,
// exiled, sittings (numeric), gameDays.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 SMOKE=1 node scripts/sweep-vetcompose-20261017.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/sweep-vetcompose-20261017.js
// Targeted re-runs: SEEDS="2271121,2381233" ONLY="leadseat,armed;belongseat,control"
'use strict';
const fs = require('fs');
const path = require('path');
const LIB = require('./vetcompose-lib-20261017');
const { SEEDS, POLICIES, DAYS, SD, VR, policyFor, makeInstrument } = LIB;
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// --- substrate assertion (before anything runs) ---
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.ALLOWGATE2 === '1') {
  console.error('SWEEP STOP: ALLOWGATE2=1 is set — landed allowgate2 default-OFF stays OFF. Substrate moved; STOP.');
  process.exit(2);
}

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-vetcompose');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-17', 'vetcompose-beats');

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function existingSeedLiterals() {
  const out = new Set();
  const ev = path.join(__dirname, '..', 'evidence');
  const walk = (dir) => {
    let ents = [];
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const e of ents) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else {
        const m = /-s(\d+)\.json$/.exec(e.name);
        if (m) out.add(m[1]);
      }
    }
  };
  walk(ev);
  return out;
}

const BEAT_RE = /table|seat|ring of pale|path of|defer|overtime|won|win |died|dead|starv|national|regional|exile|crisis|wave [345]|ascend|veteran|blood/i;
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
    process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1'; process.env.SEATDRIVE = '1';
    if (side === 'armed') process.env.VETREL = '1'; else delete process.env.VETREL;
    const { Game } = await loadGame({ seed: 2271121, mode: `vetcompose-smoke-${side}`, fullTelemetry: false });
    await setupGame(Game);
    let vetLive = null, seatLive = null;
    const base = policyFor('belongseat');
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => {
      vetLive = VR.vetrelOn(); seatLive = SD.layerOn();
      if (oSetup) return oSetup(G, ctx);
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`${side}: layer-live markers honest`,
      vetLive === (side === 'armed') && seatLive === true,
      `vetrel=${vetLive} seat=${seatLive}`);
    check(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    check(`${side}: expected policy id`, base.id === 'belongseat-vetcomp', base.id);
  }
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

let senseWritten = 0; // cap sense transcripts
async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1'; process.env.SEATDRIVE = '1';
  if (armed) process.env.VETREL = '1'; else delete process.env.VETREL; // EXPLICIT both sides
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `vetcompose-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null, vetLive = null, seatLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    runCtx = ctx; vetLive = VR.vetrelOn(); seatLive = SD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const hist = { maxRank: 0, everTable: false, exiled: false, vet2peak: 0, maxVeterans: 0, scholarDeaths: 0 };
  const hashes = [];
  const beats = { beats: [] };
  const deathsT = { deaths: [] };
  const narration = []; // full transcript — persisted only for sense runs
  const hookNar = (fnName, surface) => {
    const orig = Game[fnName] ? Game[fnName].bind(Game) : null;
    Game[fnName] = function (text) {
      try {
        let msg = text;
        if (msg && typeof msg === 'object') msg = msg.text || msg.desc || msg.msg || msg.message || String(msg);
        msg = String(msg == null ? '' : msg);
        if (msg) {
          narration.push({ day: gday(Game), surface, text: msg.slice(0, 500) });
          if (narration.length > 12000) narration.splice(0, 2000);
        }
      } catch (e) {}
      return orig ? orig(text) : text;
    };
  };
  hookNar('say', 'narration'); hookNar('sysSay', 'sys');
  attachBeats(Game, beats);
  attachDeaths(Game, deathsT);
  const oDaily = base.daily;
  const instr = makeInstrument(hist, oDaily);
  policy.daily = (G, ctx) => {
    const r = instr(G, ctx);
    try { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  // WINS: Game.won is the engine flag (table.js won=true) — runDays does NOT
  // return won. 2026-10-17 correction: an earlier draft read result.won
  // (undefined -> wins 0 on every run); the beat-file win-line cross-check
  // confirmed the runs did win.
  const gameWon = !!Game.won;
  if (vetLive !== armed || seatLive !== true)
    throw new Error(`layer-live marker mismatch: side=${side} vetrel=${vetLive} seat=${seatLive}`);
  const vetSnap = {};
  for (const k of ['vetInvitesOk', 'vetHunts', 'vetHuntLegs', 'vetHuntEngaged', 'vetHuntFights', 'vetYields', 'vetBreakoffs', 'vetRescues']) {
    if (runCtx && runCtx[k] != null) vetSnap[k] = runCtx[k];
  }
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const log = Game.state.waveKillLog || [];
  const w3by = {};
  let companionW3 = 0, w3kills = 0;
  for (const e of log) {
    if (e && (e.w | 0) >= 3) {
      w3kills++;
      w3by[e.via || '?'] = (w3by[e.via || '?'] || 0) + 1;
      if (e.via === 'companion') companionW3++;
    }
  }
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: gameWon ? 1 : 0,
    maxWave: result.maxWaveUnlocked || 1, wave45: (result.maxWaveUnlocked || 1) >= 4 ? 1 : 0,
    exiled: hist.exiled ? 1 : 0,
    sittings: (runCtx && runCtx.sdSeatTaken) | 0,
    seatAttempts: (runCtx && runCtx.sdSeatAttempts) | 0,
    seatDay: (runCtx && runCtx.sdSeatDay) || null,
    seatKind: (runCtx && runCtx.sdSeatKind) || null,
    tableAnswers: (runCtx && runCtx.tableAnswers) || 0,
    holds: (((runCtx && runCtx._windefer && runCtx._windefer.decisions) || []).filter(d => d.hold)).length,
    vet2peak: hist.vet2peak | 0, maxVeterans: hist.maxVeterans | 0, scholarDeaths: hist.scholarDeaths | 0,
    w3kills, w3by, companionW3,
    vetSnap,
    hashes,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  if (beats.beats.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats.beats, null, 1));
  }
  // SENSE-TESTING capture: full transcript for the first 3 armed vet2 runs.
  if (armed && out.vet2peak && senseWritten < 3) {
    senseWritten++;
    fs.writeFileSync(path.join(__dirname, '..', 'evidence', '2026-10-17',
      `vetcompose-sense-${policyId}-s${seed}.txt`), JSON.stringify(narration, null, 1));
    console.log(`  [sense] wrote full transcript vetcompose-sense-${policyId}-s${seed}.txt (${narration.length} lines)`);
  }
  console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} vet2=${out.vet2peak} maxVet=${out.maxVeterans} compW3=${out.companionW3} w3k=${out.w3kills} w4=${out.wave45} nat=${out.national} wins=${out.wins} sits=${out.sittings} exiled=${out.exiled} schD=${out.scholarDeaths}`);
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
  let seedList = SEEDS.slice();
  if (process.env.SEEDS) {
    const want = new Set(process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)));
    seedList = seedList.filter(sd => want.has(sd));
  }
  // Fresh-seed collision assertion (before ANY run writes anything).
  const pre = existingSeedLiterals();
  const collisions = seedList.filter(seed => pre.has(String(seed)));
  if (collisions.length) {
    console.error('SWEEP STOP: seed literals already exist in evidence/ filenames: ' +
      collisions.map(s => `s${s}`).join(', ') + ' — seeds are not fresh. STOP.');
    process.exit(2);
  }
  console.log(`seed collision check: ${seedList.length} seeds clean.`);

  if (process.env.SMOKE === '1') { await smokeGate(); }

  const recs = [];
  for (const seed of seedList) {
    for (const policyId of POLICIES) {
      for (const side of ['control', 'armed']) {
        if (!match(policyId, side)) continue;
        recs.push(await oneRun(seed, policyId, side));
      }
    }
  }

  // ---- summary ----
  const sum = (rs, f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
  console.log('\n== vetcompose sweep summary ==');
  for (const side of ['control', 'armed']) {
    const rs = recs.filter(r => r.side === side);
    console.log(`${side}: n=${rs.length} vet2peak=${sum(rs, 'vet2peak')}/${rs.length} compW3=${sum(rs, 'companionW3')} ` +
      `w4=${sum(rs, 'wave45')}/${rs.length} wins=${sum(rs, 'wins')} national=${sum(rs, 'national')}/${rs.length} ` +
      `table=${sum(rs, 'table')}/${rs.length} exiled=${sum(rs, 'exiled')} sittings=${sum(rs, 'sittings')} ` +
      `medianSurv=${median(rs.map(r => r.gameDays)).toFixed(1)}d`);
  }
  const A = recs.filter(r => r.side === 'armed'), C = recs.filter(r => r.side === 'control');
  console.log(`PRIMARY vet2peak: armed=${sum(A, 'vet2peak')}/${A.length} control=${sum(C, 'vet2peak')}/${C.length} diff=${sum(A, 'vet2peak') - sum(C, 'vet2peak')} (GO needs >= +3)`);
  console.log(`MECHANISM compW3: armed=${sum(A, 'companionW3')} control=${sum(C, 'companionW3')} diff=${sum(A, 'companionW3') - sum(C, 'companionW3')} (GO needs >= +6)`);
  console.log(`GUARD wins: armed=${sum(A, 'wins')} control=${sum(C, 'wins')} (armed >= control-2)`);
  console.log(`GUARD national: armed=${sum(A, 'national')} control=${sum(C, 'national')} (armed >= control-2)`);
  console.log(`GUARD exiled: armed=${sum(A, 'exiled')} control=${sum(C, 'exiled')} (0 both)`);
  // Matched non-winning pairs: median survival + successor metric.
  const pairs = [];
  let successor = 0, successorDenom = 0;
  for (const r of A) {
    const c = C.find(x => x.policyId === r.policyId && x.seed === r.seed);
    if (c && !r.wins && !c.wins) pairs.push({ seed: r.seed, policyId: r.policyId, armed: r.gameDays, control: c.gameDays });
    if (c && r.wins && r.seatDay) { successorDenom++; if (c.gameDays >= r.seatDay) successor++; }
  }
  console.log(`matched non-winning pairs: n=${pairs.length} ` +
    (pairs.length ? `medianSurv armed=${median(pairs.map(p => p.armed)).toFixed(1)}d control=${median(pairs.map(p => p.control)).toFixed(1)}d` : '(vacuous)') +
    `; successor control-survived>=armed-seatDay: ${successor}/${successorDenom}`);
  // Death-mode shares (paired counterfactual: armed vs OWN controls).
  for (const side of ['control', 'armed']) {
    const tally = {};
    for (const r of recs.filter(r => r.side === side)) for (const [k, v] of Object.entries(r.deaths)) tally[k] = (tally[k] || 0) + v;
    console.log(`${side} death modes: ${Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + 'x' + v).join(', ') || '(none recorded)'}`);
  }
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
