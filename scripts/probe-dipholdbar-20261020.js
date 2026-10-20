#!/usr/bin/env node
// probe-dipholdbar-20261020.js — sim-dipholdbar sweep probe, SECOND VARIANT
// (flesh-out loop A, run fleshout-20261020T0015Z, axis scale-onramp).
// The 2026-10-19 run killed a DIFFERENT variant (7-day grace from first
// arrears posting: 1.231x, NO-GO). This run tests the coordinator-approved
// bill-current variant: the BELONG good-standing bar's arrears leg becomes
// "current on new bills" — trailing-7d tribute actually paid >= 1x the
// current weekly bill (legacy arrears may stand).
//
// ARMED vs CONTROL on identical seeds, shared substrate: the seasonblock
// harness + instruments, reused verbatim (bond census, beat capture,
// death capture, flow recording, DET/SMOKE/FIDELITY gates).
//
//   control {leadfeast,belongfeast} = the seasonblock composition verbatim
//                           (SD/WD/RP over TF.leadfeast/TF.belongfeast) —
//                           the committed seasonblock corpus, reused
//                           fidelity-gated
//   armed   {leadfeast,belongfeast} = the SAME composition on the MODIFIED
//                           engine (hierarchy.js: _billCurrent replaces the
//                           arrears==0 leg; payTribute stamps tributePaidLog)
//
// The divergence surface is ENGINE CODE ONLY — there is no policy delta.
// The control sweep is not re-run: the committed seasonblock corpus
// (evidence/2026-10-19/perseed-seasonblock/{leadfeast,belongfeast}/) is
// reused, gated by FIDELITY (byte-identical hashes on s64201 with the
// unmodified engine, run BEFORE the hierarchy.js change).
//
// Env: the seasonblock substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
// RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1).
// isBare via DIPHOLDBAR_BARE=1 (DET gate: hashes only).
// DIPBAR_SIDE=control|armed selects the output side dir (default armed).
//
// Usage:
//   <env> node scripts/probe-dipholdbar-20261020.js det        # DET gate (self-consistency)
//   <env> node scripts/probe-dipholdbar-20261020.js smoke      # SMOKE (1 run, sanity)
//   <env> node scripts/probe-dipholdbar-20261020.js fidelity   # FIDELITY vs seasonblock corpus
//   <env> node scripts/probe-dipholdbar-20261020.js sweep      # 16-run armed sweep
//   ONLY=belongfeast SEEDS=64207 ...                            # filters
'use strict';
const fs = require('fs');
const path = require('path');
const SB = require('./probe-seasonblock-20261019');
const FG = require('./probe-feastgap-20261019');
const TF = require('./policies/tribfloor');
const FS = require('./policies/feastscale');
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
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const SIDE = (process.env.DIPBAR_SIDE || 'armed').toLowerCase();
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-dipholdbar', SIDE);
const isBare = () => process.env.DIPHOLDBAR_BARE === '1';

const scholarDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// policyFor: the seasonblock composition verbatim — identical on both sides
// of this experiment. The armed/control divergence is the ENGINE (the
// policyFor: the seasonblock/feastgap composition verbatim, both roads —
// identical on both sides of this experiment. The armed/control divergence
// is the ENGINE (hierarchy.js: _billCurrent replaces the arrears==0 leg),
// not a policy layer. Control is byte-identical to FG.policyFor by
// construction (pinned by FIDELITY).
function policyFor(policyId) {
  const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
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
        // BILL-CURRENT MECHANISM COUNTER (this arm): days where an active
        // upward belong link reads bill-current via the NEW engine helper
        // while carrying arrears>0 — the signature the old bar could never
        // produce. Guarded by typeof: the pristine control engine has no
        // _billCurrent (fidelity/DET runs must not crash on it).
        try {
          if (typeof G._billCurrent === 'function') {
            const ls = (G.hierarchyState ? G.hierarchyState() : []) || [];
            for (const l of ls) {
              if (l && l.status === 'active' && l.subordinate === 'haven' && (l.arrears || 0) > 0 && G._billCurrent(l)) {
                C.billCurrentArrearsDays = (C.billCurrentArrearsDays | 0) + 1;
                break;
              }
            }
          }
        } catch (e) { C.instrumentErrors++; }
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
  // Mechanism counters: the bill-current signature is read from the bond
  // census (dip=1 days with arrears>0 — impossible under the old bar) plus
  // the daily _billCurrent read (C.billCurrentArrearsDays). The dh ctx
  // counters belong to the killed diphold policy layer; zeros expected.
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
    seed, policyId, substrate: 'pre-seat-winside-novetrel', diphold: false,
    engineBar: 'bill-current-7d',
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
    billCurrentArrearsDays: C.billCurrentArrearsDays | 0,
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
  // verifies it on hashes, both roads. RUN BEFORE the hierarchy.js change —
  // after the change the engine diverges by design and this gate no longer
  // applies.
  let allOk = true;
  for (const policyId of POLICIES) {
    const corpus = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-seasonblock', policyId, `s${SEEDS[0]}.json`);
    if (!fs.existsSync(corpus)) { console.log(`FIDELITY ${policyId}: SKIP (no seasonblock corpus)`); continue; }
    const c = JSON.parse(fs.readFileSync(corpus, 'utf8'));
    const out = await runOne(SEEDS[0], policyId, { noWrite: true });
    const ok = out.hashes.length === c.hashes.length && out.hashes.every((h, i) => h === c.hashes[i]);
    console.log(`FIDELITY s${SEEDS[0]} ${policyId}: ${ok ? 'PASS' : 'FAIL'} (control ${out.hashes.length}d vs corpus ${c.hashes.length}d)`);
    if (!ok) allOk = false;
  }
  return allOk;
}

async function sweep() {
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      const out = await runOne(seed, policyId);
      console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} nat=${out.national} wave=${out.maxWave} succ=${out.successions} billCurArr=${out.billCurrentArrearsDays} ierr=${out.instrumentErrors}`);
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
