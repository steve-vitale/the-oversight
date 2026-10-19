#!/usr/bin/env node
// probe-diphold-20261019.js — sim-diphold sweep probe (flesh-out loop A, axis scale-onramp).
//
// Armed vs control on identical seeds, shared substrate: the seasonblock
// harness + instruments, reused verbatim (bond census, beat capture,
// death capture, flow recording, DET/SMOKE/FIDELITY gates).
//
//   control 'belongfeast'    = the seasonblock composition verbatim
//                              (SD/WD/RP over TF.belongfeast)
//   armed   'belongfeast-dh' = the same stack with the diphold layer inserted
//                              UNDER tribfloor:
//   withSeatDrive(withWinDefer(withReposition(
//     withTribFloor(withDipHold(FS.belongfeast)))))
//
// so the two arms differ by the diphold layer ONLY. The tribfloor verb gate
// (2-day pantry floor) binds on the layer's own payTribute calls, because the
// layer runs inside the gate's daily window.
//
// Env: the seasonblock substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
// RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1)
// plus DIPHOLD=1 for the armed sweep (the layer is gated; the control sweep
// does not need it). isBare via DIPHOLD_BARE=1 (DET gate: hashes only).
//
// Usage:
//   <env> node scripts/probe-diphold-20261019.js det        # DET gate (4/4 byte-identical)
//   <env> node scripts/probe-diphold-20261019.js smoke      # SMOKE (1 run, sanity)
//   <env> node scripts/probe-diphold-20261019.js fidelity   # FIDELITY vs seasonblock corpus
//   <env> node scripts/probe-diphold-20261019.js sweep      # full 16-run pilot sweep
//   ONLY=belongfeast-dh SEEDS=64207 ...                    # filters
'use strict';
const fs = require('fs');
const path = require('path');
const SB = require('./probe-seasonblock-20261019');
const FG = require('./probe-feastgap-20261019');
const TF = require('./policies/tribfloor');
const FS = require('./policies/feastscale');
const DH = require('./policies/diphold');
const RP = require('./policies/reposition');
const WD = require('./policies/windefer');
const SD = require('./policies/seatdrive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['belongfeast', 'belongfeast-dh'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-diphold');
const isBare = () => process.env.DIPHOLD_BARE === '1';

const scholarDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// policyFor: the seasonblock composition verbatim; the armed side inserts the
// diphold layer under tribfloor (tag 'belong-dh'). Control is byte-identical
// to FG.policyFor('belongfeast') by construction (pinned by FIDELITY).
function policyFor(policyId) {
  const armed = policyId === 'belongfeast-dh';
  const tag = armed ? 'belong-dh' : 'belong';
  const base = armed
    ? TF.withTribFloor(
        DH.withDipHold(FS.belongfeast, 'belongfeast-dh-inner', 'belongfeast + diphold: arrears-clearing payment priority when the belong bond\'s dip-margin <= 2 days'),
        'belongfeast-dh', 'belongfeast-dh + tribfloor (TRIBFLOOR=1): tribute payments never leave the pantry below the 2-day floor')
    : TF.belongfeast;
  const rp = RP.withReposition(base, `${tag}-rp`, `${policyId} + reposition (REPOSITION unset: inert)`);
  const wd = WD.withWinDefer(rp, `${tag}-windefer`, `${policyId} + win-side layers (WINPURSUIT=1 + WINDEFER=1)`);
  return SD.withSeatDrive(wd, `${tag}-windefer`, `${policyId} + win-side stack (SEATDRIVE=0: pure delegation)`);
}

// runOne(seed, policyId, opts): instrumented 180d death-aware run. Mirrors
// the seasonblock runOne exactly, parameterized by policyFor above, plus the
// death list (starvation guardrail) and the diphold counters (ctx stash).
async function runOne(seed, policyId, opts) {
  opts = opts || {};
  const bare = isBare();
  const C = { instrumentErrors: 0, hashes: [], bond: [], maxWave: 1, wave4Day: null, wave5Day: null,
    maxRank: 0, nationalDay: null, everTable: false, exiled: false, successionDays: [], _prevVid: null };
  const base = policyFor(policyId);
  const policy = Object.assign({}, base);
  const holder = { monsterNames: null };
  let ctxRef = null;
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    if (!bare) {
      try { SB.installDeathCapture(G, C, holder.monsterNames || new Set()); } catch (e) { C.instrumentErrors++; }
      try { FG.installFlowRecording(G, C); } catch (e) { C.instrumentErrors++; }
      try { SB.installBeatCapture(G, C); } catch (e) { C.instrumentErrors++; }
    }
    return r;
  };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    if (!ctxRef) ctxRef = ctx;
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      C.hashes.push(scholarDay(G) + ':' + dayHash(G));
    } catch (e) {}
    if (!bare) {
      try {
        const bc = SB.bondCensus(G);
        const vids = new Set(bc.links.map(l => l.vid));
        const vid = vids.size ? [...vids][0] : '?';
        if (C._prevVid != null && vid !== C._prevVid) {
          C.successionDays.push({ day: bc.d, from: String(C._prevVid), to: vid });
        }
        C._prevVid = vid;
        bc.succession = (C.successionDays.length && C.successionDays[C.successionDays.length - 1].day === bc.d) ? 1 : 0;
        C.bond.push(bc);
        const rec = FG.dailyRec(G);
        if (rec.uw > C.maxWave) C.maxWave = rec.uw;
        if (rec.uw >= 4 && C.wave4Day == null) C.wave4Day = rec.d;
        if (rec.uw >= 5 && C.wave5Day == null) C.wave5Day = rec.d;
        let rank = 'village';
        try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
        const RANK_ORDER = { village: 0, local: 1, regional: 2, national: 3, global: 4 };
        C.maxRank = Math.max(C.maxRank, RANK_ORDER[rank] == null ? 0 : RANK_ORDER[rank]);
        if (rank === 'national' || rank === 'global') {
          if (C.nationalDay == null) C.nationalDay = rec.d;
        }
        const pg = G.progState ? G.progState() : null;
        if (pg && (pg.tableWaiting || pg.tableDone)) C.everTable = true;
        if ((G.state.scholar || {}).exiled) C.exiled = true;
      } catch (e) { C.instrumentErrors++; }
    }
    return r;
  };
  const { Game } = await loadGame({ seed, mode: 'feastgap', fullTelemetry: false });
  await setupGame(Game);
  let monsterNames = null;
  try {
    monsterNames = new Set();
    for (const m of (Game.data && Game.data.monsters) || []) {
      if (m && m.name) monsterNames.add(String(m.name).toLowerCase());
      if (m && m.id) monsterNames.add(String(m.id).toLowerCase().replace(/_/g, ' '));
      if (m && m.id) monsterNames.add(String(m.id).toLowerCase());
    }
  } catch (e) {}
  holder.monsterNames = monsterNames;
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: opts.days || daysNow(), manifest: undefined, sampleEvery: 30 }); });
  const endReason = Game.over ? (Game.villageLost ? 'village-lost' : 'over-other')
    : (result.gameDays >= (opts.days || daysNow()) ? 'survived' : (result.endReason || 'ended'));
  const attr = bare ? null : FG.attributeDeaths(Game, C, monsterNames || new Set());
  let endBond = null;
  try { endBond = bare ? null : SB.bondCensus(Game); } catch (e) { endBond = null; }
  let linkDump = null;
  try { linkDump = bare ? null : SB.linkHistoryDump(Game); } catch (e) { linkDump = null; }
  let flowAgg = null;
  if (!bare && C.flows) {
    try {
      let trib = 0, tribN = 0, tend = 0, tendN = 0, feast = 0;
      const feastDays = [];
      for (const f of C.flows) {
        if (f.kind === 'tribute') { trib += f.paid; tribN++; }
        else if (f.kind === 'tend') { tend += f.paid; tendN++; }
        else if (f.kind === 'feast' && f.paid > 0) { feast++; feastDays.push(f.day); }
      }
      flowAgg = { tributePaid: trib, tributeCalls: tribN, tendPaid: tend, tendCalls: tendN, feasts: feast, feastDays };
    } catch (e) { flowAgg = { error: String(e && e.message) }; }
  }
  let maxWave = C.maxWave;
  let gameDays = 0;
  try { gameDays = (Game.state.scholar || {}).day || 0; } catch (e) {}
  try {
    const endUw = (Game.unlockedWave ? Game.unlockedWave() : 1) | 0;
    if (endUw > maxWave) maxWave = endUw;
    if (maxWave >= 5 && C.wave5Day == null) C.wave5Day = gameDays;
    if (maxWave >= 4 && C.wave4Day == null) C.wave4Day = gameDays;
  } catch (e) {}
  // Diphold counters from the run's ctx (mechanism evidence: did the layer fire?).
  let dh = null;
  try {
    if (ctxRef) {
      dh = {
        arrearsClears: ctxRef.dhArrearsClears | 0, earlyPays: ctxRef.dhEarlyPays | 0,
        tfCapped: ctxRef.tfCapped | 0, tfDemandRefused: ctxRef.tfDemandRefused | 0,
      };
    }
  } catch (e) {}
  const out = {
    seed, policyId, substrate: 'pre-seat-winside-novetrel', diphold: policyId === 'belongfeast-dh',
    days: result.days, gameDays: result.gameDays, endReason,
    won: !!Game.won,
    maxRank: C.maxRank, national: C.nationalDay != null, nationalDay: C.nationalDay,
    table: !!C.everTable, exiled: !!C.exiled,
    maxWave, wave45: maxWave >= 4, wave5: maxWave >= 5,
    wave4Day: C.wave4Day, wave5Day: C.wave5Day,
    successions: C.successionDays.length,
    successionDays: C.successionDays,
    instrumentErrors: C.instrumentErrors | 0,
    deathsAttributed: attr ? { rawCount: attr.rawCount, attributedCount: attr.attributedCount, phantomCount: attr.phantomCount } : null,
    deaths: bare ? [] : ((attr && attr.deaths) || []),
    flows: bare ? [] : ((C.flows || []).map(f => [f.day, f.kind, f.paid])),
    flowAgg,
    beats: bare ? [] : (C.beats || []),
    bond: bare ? [] : C.bond,
    endBond, linkDump, dh,
    hashes: C.hashes,
  };
  if (!opts.noWrite) {
    const dir = path.join(EVID, policyId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out));
  }
  return out;
}

async function gateDet() {
  let pass = 0, total = 0;
  for (const policyId of POLICIES) {
    for (const seed of [SEEDS[0], SEEDS[1] || SEEDS[0]]) {
      total++;
      const a = await runOne(seed, policyId, { noWrite: true });
      const b = await runOne(seed, policyId, { noWrite: true });
      const ok = a.hashes.length === b.hashes.length &&
        a.hashes.every((h, i) => h === b.hashes[i]);
      if (ok) pass++;
      console.log(`  DET ${policyId} s${seed}: ${ok ? 'PASS' : 'FAIL'} (${a.hashes.length} days)`);
    }
  }
  console.log(`DET: ${pass}/${total}`);
  return pass === total;
}

async function gateSmoke() {
  for (const policyId of POLICIES) {
    const out = await runOne(SEEDS[0], policyId, { noWrite: true });
    const up = (out.bond || []).filter(b => b.links.some(l => l.sub === 'haven' && l.st === 'active'));
    console.log(`  SMOKE ${policyId} s${SEEDS[0]}: days=${out.gameDays} end=${out.endReason} bondrecs=${out.bond.length} upActive=${up.length} dh=${JSON.stringify(out.dh)} ierr=${out.instrumentErrors}`);
  }
}

async function gateFidelity() {
  // Control fidelity vs the seasonblock corpus: the control composition is
  // byte-identical to the seasonblock sweep's by construction; this gate
  // verifies it on hashes (base drift between 8c055140a and 18f9f8440 would
  // show here — instrument-only commit, expected PASS).
  const corpus = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-seasonblock', 'belongfeast', `s${SEEDS[0]}.json`);
  if (!fs.existsSync(corpus)) { console.log('FIDELITY: SKIP (no seasonblock corpus)'); return true; }
  const c = JSON.parse(fs.readFileSync(corpus, 'utf8'));
  const out = await runOne(SEEDS[0], 'belongfeast', { noWrite: true });
  const ok = out.hashes.length === c.hashes.length && out.hashes.every((h, i) => h === c.hashes[i]);
  console.log(`FIDELITY s${SEEDS[0]} belongfeast: ${ok ? 'PASS' : 'FAIL'} (control ${out.hashes.length}d vs corpus ${c.hashes.length}d)`);
  return ok;
}

async function sweep() {
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      const out = await runOne(seed, policyId);
      console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} nat=${out.national} wave=${out.maxWave} succ=${out.successions} dh=${JSON.stringify(out.dh)} ierr=${out.instrumentErrors}`);
    }
  }
  console.log('sweep complete ->', EVID);
}

module.exports = { policyFor, runOne, SEEDS, POLICIES, EVID };

if (require.main === module) {
  (async () => {
    const cmd = process.argv[2] || 'sweep';
    if (cmd === 'det') { const ok = await gateDet(); process.exit(ok ? 0 : 1); }
    if (cmd === 'smoke') { await gateSmoke(); }
    else if (cmd === 'fidelity') { const ok = await gateFidelity(); process.exit(ok ? 0 : 1); }
    else if (cmd === 'sweep') { await sweep(); }
    else { console.error('unknown cmd: ' + cmd); process.exit(2); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}
