#!/usr/bin/env node
// sweep-haulinvert-b.js — haul/preserve action-count recorder, INVERTED
// predicate (sim-haulinvert-b, 2026-10-25, oversight-flesh-out-loop-b,
// axis food-economy).
//
// INSTRUMENT ONLY: zero game-balance changes. Derived verbatim from
// scripts/sweep-leg2drift-b.js (the instrument that produced the
// leg2decide/rotdecide corpora) — same rot capture (sweepSpoiled
// wrapper, same dedupe), death capture, villageDays exposure, depriKcal
// ledger read, wall fields, FATAL env asserts, death-aware horizons,
// EPERM-resilient writes, STDOUT_SPLIT routing — PLUS haul/preserve
// action counts, which the rotcompanion/rotragged runs proved missing:
// per-seed files carried rot outcomes but no haul amounts and no
// preservation action counts, so a pd0 blowup could not be attributed
// to "hauled far more fresh food" vs "preserved less".
//
// Declared deltas vs the source instrument (everything else identical):
//   1. Mode string 'haulinvert-b-<policy>'; output names
//      haulinvert-b-<ANCHOR8>-<SIDE>-dg1-<POLICY>-s<seed>.json.
//   2. HAUL counting (wrappers delegate to the originals; counting
//      blocks are try/catch-isolated so a counting failure can never
//      change game behavior):
//      - stockPantry(kcal, name, opts): every call with rounded kcal > 0
//        is a pantry deposit (pantryDepositActions/pantryDepositKcal).
//        The HAUL subset is calls whose name (defaulting to
//        'Foraged food' when falsy, mirroring stockPantry itself)
//        passes isFieldHaul: the generic duty names (forage/game/
//        garden/fish/expedition/aid-crew), the trap lines ('Snared
//        meat', 'Pit meat (X)'), the haul-return default ('Hauled
//        meat'), and the emergency hunt ('Emergency hunt meat').
//        System gifts (Weregild, Hoarder's interest, Genesis
//        fruit, trial feasts, leftovers, refunds) and other deposits
//        count ONLY in the pantryDeposit totals, never in haulActions.
//      - depositPantryPieces(v, src, pieceKcal): the homecoming/village
//        pooling path. Counts only when the target village IS the home
//        village (v === Game.state.village) AND the src name does not
//        start with 'Tribute ' (tribute grain to a subordinate fire is
//        a transfer, not a haul; exile-amends pooling into another
//        village's fire is likewise excluded by the village check).
//        Deposited kcal is the ORIGINAL's return value (never a
//        re-derivation). These calls count in BOTH haulActions and
//        pantryDepositActions: a homecoming unload IS a haul, and it IS
//        a pantry deposit.
//      - haulActions/haulKcal are therefore "real food-haul deposits
//        into the home pantry", not ticks, not promises, not System
//        gifts. If a future analyzer wants total inflow, it reads
//        pantryDepositActions/pantryDepositKcal instead.
//   3. PRESERVE counting (scholar verbs, wrappers delegate; the verbs
//      return null on every path, so success is NEVER read from the
//      return value — it is the item-state delta in the same container
//      the verb acted on, counted before/after delegation):
//      - preserveFood: attempt = one call; smoked units = delta of
//        preserved units (sum of units over items with foodState
//        'preserved') in the acted container — a stack's units, not
//        stack objects, so throughput scales with the stack.
//      - renderFat: attempt = one call; rendered units = delta of
//        rendered units in the acted container, same units rule.
//      - makePemmican: attempt = one call; sets = delta of pemmican
//        stacks (itemId 'pemmican'), bars = delta of their total units.
//      - preserveAttempts = sum of the three verbs' calls;
//        preserveSuccessItems = smoked + rendered UNITS;
//        preservePemmicanSets / preservePemmicanBars as above.
//        A call that finds nothing to preserve (no fire, no targets,
//        no render knowledge, no plan) is an ATTEMPT with zero
//        successes — exactly the distinction the rot question needs.
//   4. VILLAGER preserving (the cook-duty smoke racks, src/js/game.js
//      a.task === 'cook'): the conversion is INLINE game code, not a
//      verb, so no wrapper can see it. It is counted by a
//      counting-only tap in game.js (HAULCOUNT TAP markers) that
//      mirrors the game's own per-resolution n/keptKcal into
//      Game._haulcount — zero behavior change, no other game state
//      written. The sweep reads Game._haulcount at end of run into
//      preserveVillagerBatches/preserveVillagerKcal. As a
//      wrapper-visible cross-check, creditDeed calls with deedId
//      'preserving' are counted into preserveVillagerResolutions
//      (one per cook resolution with n > 0; the ONLY 'preserving'
//      creditDeed call site is that same cook block). Invariants
//      the test enforces on every pilot file: batches >= resolutions
//      when resolutions > 0, and kcal <= 4000 * resolutions (the
//      cook's per-resolution budget cap).
//   5. TRACE mode (HAULCOUNT_TRACE=1, off by default): wrappers also
//      record per-event {day, via, name, kcal} for deposits and
//      {day, verb, items} for scholar preserves, capped at 500 stored
//      events (totals always complete). Trace JSONs land beside the
//      per-seed files as
//      haulinvert-b-trace-<ANCHOR8>-<SIDE>-dg1-<POLICY>-s<seed>.json.
//      Trace runs are deterministic re-runs: their per-seed files
//      must be byte-identical to the pilot's (the test asserts this
//      where trace files exist).
//   6. No summary MERGE change: each anchor run writes its own
//      summary file (OUT env); the analyzer aggregates across anchors.
//   7. HAULINVERT deltas vs sweep-haulcount-b.js (this file only):
//      the current-predicate counting is byte-identical in behavior
//      (same FIELD_HAUL_NAMES, same pieces home/non-Tribute rule), and
//      alongside it the inverted predicate counts every deposit as a
//      haul except the exclusion list in the code comment above
//      (exact names + two prefixes, derived from every call site).
//      New per-seed fields: invHaulActions/invHaulKcal,
//      invStockExcludedActions/invStockExcludedKcal,
//      invPiecesHomeExcludedActions/invPiecesHomeExcludedKcal,
//      invPiecesForeignActions/invPiecesForeignKcal. Trace events gain
//      curHaul/invHaul/home flags, pieces events are traced for ALL
//      villages (foreign transfers included, flagged home:false),
//      and the trace cap rises 500 -> 1000 stored events (totals
//      always complete regardless of the cap).
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted); SIDE=pd0|pd1
//   PLENTYDEPRI explicit per SIDE; DEPOSITGATE=1 explicit; ANCHOR=<sha>
//   POLICY=leadfeast|belongfeast; SEEDS="9400,...,9407"; DAYS=100
//   (death-aware; dead villages stop; +10d tail max).
// ANCHOR=<sha> SIDE=pd0|pd1 POLICY=leadfeast SEEDS=... OUT=<path>
//   PERSEED_DIR=<path> node scripts/sweep-haulinvert-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
const ANCHOR = process.env.ANCHOR || '';
if (!/^[0-9a-f]{7,40}$/.test(ANCHOR)) {
  console.error('FATAL: ANCHOR=<git sha> must be set explicitly (every per-seed JSON is tagged with it)');
  process.exit(2);
}
const SIDE = process.env.SIDE || 'pd0'; // pd0 | pd1
const PD_WANT = SIDE === 'pd1' ? '1' : '0';
if (process.env.PLENTYDEPRI !== PD_WANT) {
  console.error(`FATAL: SIDE=${SIDE} requires PLENTYDEPRI=${PD_WANT} explicitly (unset = default-ON)`);
  process.exit(2);
}
if (process.env.DEPOSITGATE !== '1') {
  console.error('FATAL: this recorder is dg1-only; DEPOSITGATE=1 must be set explicitly');
  process.exit(2);
}
const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SEEDS = (process.env.SEEDS || '9400,9401,9402,9403,9404,9405,9406,9407')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-10-25', 'haulinvert-b-corpus', `sweep-${ANCHOR.slice(0, 8)}-${SIDE}-dg1-${POLICY_ID}.json`);
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-25', 'haulinvert-b-corpus');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

// EPERM-FLAP-RESILIENT WRITE (carried over from the source instrument,
// plus the leg2drift existing-target fast path, declared 2026-10-24
// during a create-block episode): atomic temp + rename, retries,
// read-back verification, FAIL LOUDLY. FAST PATH: when the target
// already exists, write DIRECTLY to it (same bytes, same readback
// check) — during create-block episodes the container denies creat(2)
// for new inodes while writes to existing inodes succeed (proven
// 2026-10-24: truncate-write + rename + append all OK while every
// create failed, system-wide). The tmp+rename path is retained when
// the target does not exist. Atomicity tradeoff of the fast path
// (crash mid-write could leave a truncated file) is covered by the
// readback check plus the runner's JSON-parse skip validation, which
// re-runs any corrupt file; the analyzer FATALs on unparseable files.
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 60; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 59) { console.error('WRITE FAIL LOUDLY', filePath, e.code || e.message); process.exit(2); }
      const t0 = Date.now(); while (Date.now() - t0 < 2000) {}
    }
  }
}

const STDOUT_SPLIT = process.env.STDOUT_SPLIT === '1';
function emitFile(filePath, data) {
  if (STDOUT_SPLIT) { process.stdout.write('@@FILE ' + path.basename(filePath) + '\n'); process.stdout.write(data + '\n'); return; }
  writeRobust(filePath, data);
}
function emitSweep(data) {
  if (STDOUT_SPLIT) { process.stdout.write('@@SWEEP\n'); process.stdout.write(data + '\n'); return; }
  writeRobust(OUT, data);
}
const progress = (...a) => { if (STDOUT_SPLIT) console.error(...a); else console.log(...a); };

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'haulinvert-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  // HAULCOUNT W: every count below is a non-negative integer of REAL
  // events (a deposit call that placed kcal, a verb call, an item-state
  // conversion, a cook-duty resolution). Nothing here counts ticks,
  // promises, or unrelated events. All wrappers delegate to the
  // original; counting blocks are try/catch-isolated and run AFTER
  // delegation (except the preserve pre-counts, which must precede
  // the mutation they measure) so a counting failure can never
  // change game behavior.
  const W = { deaths: [], deathSeen: new Set(), villageDays: 0, rot_fast: 0, rot_preserved: 0,
    haulActions: 0, haulKcal: 0, pantryDepositActions: 0, pantryDepositKcal: 0,
    invHaulActions: 0, invHaulKcal: 0,
    invStockExcludedActions: 0, invStockExcludedKcal: 0,
    invPiecesHomeExcludedActions: 0, invPiecesHomeExcludedKcal: 0,
    invPiecesForeignActions: 0, invPiecesForeignKcal: 0,
    preserveAttempts: 0, preserveSuccessItems: 0, preservePemmicanSets: 0, preservePemmicanBars: 0,
    preserveVillagerResolutions: 0, traceEvents: [] };
  const TRACE = process.env.HAULCOUNT_TRACE === '1';
  const tracePush = (ev) => { if (TRACE && W.traceEvents.length < 1000) W.traceEvents.push(ev); };
  const dayNow = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  // stockPantry's own default name (mirrored, not redefined): a falsy
  // name arrives as 'Foraged food'. The HAUL rule below is a caller
  // census, not a guess: every stockPantry call site was read
  // (2026-10-25). Field/duty hauls: the generic duty names, the
  // trap lines (villager-objectives snare/pit returns), the
  // haul-return default ('Hauled meat', villager-objectives haul
  // return via ho.haulName), and the emergency hunt (safetynets:
  // named villagers go out and come back heavy). Everything else a
  // caller passes is NOT a haul and counts only in the
  // pantryDeposit totals: System gifts (Weregild, Hoarder's
  // interest, System aid cache / SYNTHETIC bricks, trial feasts,
  // System-replicated meals), aid transfers ('Aid from X',
  // 'Remedy stores from X'), refunds, restitution, leftovers,
  // returned rations. Residual gap, stated not hidden: a
  // haul-return whose haulName is a bare custom label (a site label
  // other than 'Hauled meat') would miss the predicate — no such
  // name appeared in the 4 traced pilot runs, and a future trace
  // showing one is the signal to widen the predicate.
  const FIELD_HAUL_NAMES = new Set(['Foraged food', 'Game meat', 'Garden harvest', 'Fish catch', 'Expedition haul', 'Aid crew haul', 'Snared meat', 'Hauled meat', 'Emergency hunt meat']);
  const isFieldHaul = (nm) => FIELD_HAUL_NAMES.has(nm) || (typeof nm === 'string' && nm.startsWith('Pit meat ('));
  // INVERTED PREDICATE (sim-haulinvert-b): every stock deposit counts
  // as a haul EXCEPT the exclusion list below, derived from EVERY
  // stockPantry call site read 2026-10-25 (see the evidence file's
  // derivation table for the call site behind each entry). Exact
  // names: justice payments (Weregild, Restitution), minted interest
  // (Hoarder's interest), System gifts (System-replicated stew /
  // meal, System aid cache, SYNTHETIC SUSTENANCE BRICKS, Trial
  // feast), re-deposits (Refunded trade goods, Meal leftovers,
  // Ration returned). Prefixes: aid transfers from other villages
  // (Aid from X, Remedy stores from X). Everything else — including
  // Expedition meat, Buried cache, Genesis fruit, and any custom
  // haulLabel — counts. By construction the inversion is a superset
  // of the census predicate (no census name is excluded).
  const INV_EXCLUDED_NAMES = new Set(['Weregild', "Hoarder's interest", 'System-replicated stew', 'System-replicated (enthusiastic) meal', 'System aid cache', 'SYNTHETIC SUSTENANCE BRICKS', 'Trial feast', 'Refunded trade goods', 'Meal leftovers', 'Restitution', 'Ration returned']);
  const INV_EXCLUDED_PREFIXES = ['Aid from ', 'Remedy stores from '];
  const isInvExcluded = (nm) => INV_EXCLUDED_NAMES.has(nm) || INV_EXCLUDED_PREFIXES.some((p) => typeof nm === 'string' && nm.startsWith(p));
  const countStock = (kcal, name) => {
    const k = Math.round(kcal || 0);
    if (k <= 0) return;
    W.pantryDepositActions += 1; W.pantryDepositKcal += k;
    const nm = name || 'Foraged food';
    if (isFieldHaul(nm)) { W.haulActions += 1; W.haulKcal += k; }
    if (isInvExcluded(nm)) { W.invStockExcludedActions += 1; W.invStockExcludedKcal += k; }
    else { W.invHaulActions += 1; W.invHaulKcal += k; }
  };
  const oStock = Game.stockPantry;
  if (typeof oStock === 'function') Game.stockPantry = function (kcal, name, opts) {
    const ret = oStock.apply(this, arguments);
    try { countStock(kcal, name); tracePush({ day: dayNow(), kind: 'haul', via: 'stock', name: name || 'Foraged food', kcal: Math.round(kcal || 0), curHaul: isFieldHaul(name || 'Foraged food'), invHaul: !isInvExcluded(name || 'Foraged food') }); } catch (e) {}
    return ret;
  };
  const oPieces = Game.depositPantryPieces;
  if (typeof oPieces === 'function') Game.depositPantryPieces = function (v, src, pieceKcal) {
    const deposited = oPieces.apply(this, arguments);
    try {
      const dep = Math.round(deposited || 0);
      if (dep > 0) {
        W.pantryDepositActions += 1; W.pantryDepositKcal += dep;
        // Home-pantry pooling only: another village's fire (exile
        // amends) and tribute grain are transfers, not hauls.
        const srcName = String((src && src.name) || 'Foraged food');
        const isHome = !!(v && Game.state && v === Game.state.village);
        if (isHome && !srcName.startsWith('Tribute ')) {
          W.haulActions += 1; W.haulKcal += dep;
        }
        if (!isHome) { W.invPiecesForeignActions += 1; W.invPiecesForeignKcal += dep; }
        else if (srcName.startsWith('Tribute ')) { W.invPiecesHomeExcludedActions += 1; W.invPiecesHomeExcludedKcal += dep; }
        else { W.invHaulActions += 1; W.invHaulKcal += dep; }
        tracePush({ day: dayNow(), kind: 'haul', via: 'pieces', name: srcName, kcal: dep, home: isHome, curHaul: isHome && !srcName.startsWith('Tribute '), invHaul: isHome && !srcName.startsWith('Tribute ') });
      }
    } catch (e) {}
    return deposited;
  };
  // Scholar preserve verbs: the verbs return null on EVERY path
  // (success, failure, no-targets), so success is the item-state
  // delta in the acted container, never the return value.
  const countState = (arr, pred) => { let n = 0; try { for (const it of (arr || [])) if (it && pred(it)) n += (it.units ?? 1); } catch (e) {} return n; };
  const wrapPreserveVerb = (verb, statePred, onDelta) => {
    const orig = Game[verb];
    if (typeof orig !== 'function') return;
    Game[verb] = function (idx, container) {
      const inv = container || ((Game.state || {}).scholar || {}).inventory;
      let before = null;
      try { before = countState(inv, statePred); } catch (e) { before = null; }
      const ret = orig.apply(this, arguments);
      try {
        W.preserveAttempts += 1;
        if (before != null) {
          const delta = countState(inv, statePred) - before;
          if (delta > 0) { onDelta(delta); tracePush({ day: dayNow(), kind: 'preserve', verb, items: delta }); }
        }
      } catch (e) {}
      return ret;
    };
  };
  wrapPreserveVerb('preserveFood', (it) => it.foodState === 'preserved', (d) => { W.preserveSuccessItems += d; });
  wrapPreserveVerb('renderFat', (it) => it.foodState === 'rendered', (d) => { W.preserveSuccessItems += d; });
  const oPem = Game.makePemmican;
  if (typeof oPem === 'function') Game.makePemmican = function (container) {
    const inv = container || ((Game.state || {}).scholar || {}).inventory;
    let beforeStacks = null, beforeBars = null;
    try { beforeStacks = (inv || []).filter((it) => it && it.itemId === 'pemmican').length; beforeBars = countState(inv, (it) => it.itemId === 'pemmican'); } catch (e) { beforeStacks = null; }
    const ret = oPem.apply(this, arguments);
    try {
      W.preserveAttempts += 1;
      if (beforeStacks != null) {
        const dStacks = (inv || []).filter((it) => it && it.itemId === 'pemmican').length - beforeStacks;
        const dBars = countState(inv, (it) => it.itemId === 'pemmican') - beforeBars;
        if (dStacks > 0) { W.preservePemmicanSets += dStacks; W.preservePemmicanBars += dBars; tracePush({ day: dayNow(), kind: 'preserve', verb: 'makePemmican', items: dBars }); }
      }
    } catch (e) {}
    return ret;
  };
  const oCredit = Game.creditDeed;
  if (typeof oCredit === 'function') Game.creditDeed = function (who, deedId, trackOverride) {
    const ret = oCredit.apply(this, arguments);
    try { if (deedId === 'preserving') { W.preserveVillagerResolutions += 1; tracePush({ day: dayNow(), kind: 'preserve', verb: 'villagerCook', items: 0 }); } } catch (e) {}
    return ret;
  };

  const rotCounted = new Set();
  const oSweep = Game.sweepSpoiled;
  if (typeof oSweep === 'function') Game.sweepSpoiled = function () {
    try {
      for (const it of (((Game.state.village || {}).pantry) || [])) {
        if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
          rotCounted.add(it);
          const fs = (it.foodState === 'preserved' || it.foodState === 'rendered') ? 'preserved' : 'fresh';
          W['rot_' + fs] = (W['rot_' + fs] || 0) + (it.kcalEach || 0) * (it.units || 1);
        }
      }
    } catch (e) {}
    return oSweep.apply(this, arguments);
  };

  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const who = String((opts && (opts.villagerId || opts.name)) || '?');
        const day = (Game.state.scholar || {}).day || 0;
        const cause = canonCause((opts && opts.cause) || '?');
        const key = who + '|' + day + '|' + cause;
        if (!W.deathSeen.has(key)) { W.deathSeen.add(key); W.deaths.push({ day, who: who.slice(0, 24), kind, cause }); }
      }
    } catch (e) {}
  };

  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  policy.daily = (G, ctx) => {
    try { W.villageDays += (((G.state || {}).village || {}).roster || []).length; } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;

  let depriKcal = 0;
  try {
    const lg = (Game.state.village || {})._plentyDepri;
    if (lg) for (const d of Object.values(lg.days || {})) depriKcal += (d.kcal || 0);
  } catch (e) {}
  // Villager smoke-rack tap (game.js HAULCOUNT TAP): batches + kcal the
  // cook-duty conversions recorded; absent (0) when no cook preserved.
  let villagerBatches = 0, villagerKcal = 0;
  try {
    const hc = Game._haulcount || {};
    villagerBatches = hc.villagerPreserveBatches || 0;
    villagerKcal = hc.villagerPreserveKcal || 0;
  } catch (e) {}
  const deathCauses = {};
  for (const d of W.deaths) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const national = /national|global/i.test(rank) || !!((Game.state || {}).nationalLive);
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const waveReach = [];
  for (let w = 1; w <= maxWave; w++) waveReach.push(w);

  const perSeed = {
    seed, policy: POLICY_ID,
    plentydepri: PD_WANT === '1' ? 1 : 0, depositgate: 1,
    daysAlive: result.days, villageDays: W.villageDays,
    rotFreshKcal: Math.round(W.rot_fresh || 0), rotPreservedKcal: Math.round(W.rot_preserved || 0),
    depriKcal: Math.round(depriKcal),
    // HAULCOUNT fields (new in this instrument; all non-negative ints):
    haulActions: W.haulActions, haulKcal: Math.round(W.haulKcal),
    pantryDepositActions: W.pantryDepositActions, pantryDepositKcal: Math.round(W.pantryDepositKcal),
    // HAULINVERT fields (inverted predicate; disjoint buckets close the
    // arithmetic: pantryDeposit = invHaul + stockExcluded + homeExcluded
    // + foreign, for actions and kcal alike):
    invHaulActions: W.invHaulActions, invHaulKcal: Math.round(W.invHaulKcal),
    invStockExcludedActions: W.invStockExcludedActions, invStockExcludedKcal: Math.round(W.invStockExcludedKcal),
    invPiecesHomeExcludedActions: W.invPiecesHomeExcludedActions, invPiecesHomeExcludedKcal: Math.round(W.invPiecesHomeExcludedKcal),
    invPiecesForeignActions: W.invPiecesForeignActions, invPiecesForeignKcal: Math.round(W.invPiecesForeignKcal),
    preserveAttempts: W.preserveAttempts, preserveSuccessItems: W.preserveSuccessItems,
    preservePemmicanSets: W.preservePemmicanSets, preservePemmicanBars: W.preservePemmicanBars,
    preserveVillagerBatches: villagerBatches, preserveVillagerKcal: Math.round(villagerKcal),
    preserveVillagerResolutions: W.preserveVillagerResolutions,
    deathCauses, national,
    table: won, win: won,
    waveReach, medianSurvival: null, // patched by the analyzer with the cell median
    anchorCommit: ANCHOR,
  };
  const diag = {
    endReason: result.endReason, rank, maxWave,
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    ms,
  };
  const trace = TRACE ? { seed, policy: POLICY_ID, plentydepri: PD_WANT === '1' ? 1 : 0,
    totals: { haulActions: W.haulActions, haulKcal: Math.round(W.haulKcal),
      pantryDepositActions: W.pantryDepositActions, pantryDepositKcal: Math.round(W.pantryDepositKcal),
      invHaulActions: W.invHaulActions, invHaulKcal: Math.round(W.invHaulKcal),
      invStockExcludedActions: W.invStockExcludedActions, invStockExcludedKcal: Math.round(W.invStockExcludedKcal),
      invPiecesHomeExcludedActions: W.invPiecesHomeExcludedActions, invPiecesHomeExcludedKcal: Math.round(W.invPiecesHomeExcludedKcal),
      invPiecesForeignActions: W.invPiecesForeignActions, invPiecesForeignKcal: Math.round(W.invPiecesForeignKcal),
      preserveAttempts: W.preserveAttempts, preserveSuccessItems: W.preserveSuccessItems,
      preservePemmicanSets: W.preservePemmicanSets, preservePemmicanBars: W.preservePemmicanBars,
      preserveVillagerResolutions: W.preserveVillagerResolutions },
    eventsStored: W.traceEvents.length, events: W.traceEvents } : null;
  return { seed, perSeed, diag, trace };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed, diag, trace } = await oneRun(seed, DAYS);
    rows.push({ seed: s, perSeed, diag });
    try { fs.mkdirSync(PERSEED_DIR, { recursive: true }); }
    catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    emitFile(path.join(PERSEED_DIR, `haulinvert-b-${ANCHOR.slice(0, 8)}-${SIDE}-dg1-${POLICY_ID}-s${s}.json`),
      JSON.stringify(Object.assign({}, perSeed, { anchorCommit: ANCHOR })));
    if (trace) emitFile(path.join(PERSEED_DIR, `haulinvert-b-trace-${ANCHOR.slice(0, 8)}-${SIDE}-dg1-${POLICY_ID}-s${s}.json`),
      JSON.stringify(trace));
    const rotK = Math.round((perSeed.rotFreshKcal + perSeed.rotPreservedKcal) / 1000);
    progress(`done anchor=${ANCHOR.slice(0, 8)} seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} rot=${rotK}k depriK=${Math.round(perSeed.depriKcal / 1000)} haul=${perSeed.haulActions}/${Math.round(perSeed.haulKcal / 1000)}k invHaul=${perSeed.invHaulActions}/${Math.round(perSeed.invHaulKcal / 1000)}k dep=${perSeed.pantryDepositActions} presAtt=${perSeed.preserveAttempts} presOk=${perSeed.preserveSuccessItems} villPres=${perSeed.preserveVillagerBatches}/${Math.round(perSeed.preserveVillagerKcal / 1000)}k res=${perSeed.preserveVillagerResolutions} won=${perSeed.win} (${diag.ms}ms)`);
  }
  try { fs.mkdirSync(require('path').dirname(OUT), { recursive: true }); }
  catch (e) { console.error('MKDIR FAIL LOUDLY', OUT, e.message); process.exit(2); }
  emitSweep(JSON.stringify({ meta: { anchor: ANCHOR, cell: SIDE + '-dg1', policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', PLENTYDEPRI: PD_WANT, DEPOSITGATE: '1' } }, rows }));
  progress('wrote ' + OUT + ' (' + rows.length + ' rows)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
