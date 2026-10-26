#!/usr/bin/env node
// sweep-stafffallback-b.js — staffing-fallback corpus recorder (sim-stafffallback-b,
// 2026-10-25, oversight-flesh-out-loop-b, arm sim-preserveact-b, axis
// food-economy).
//
// DECIDING QUESTION (evidence/2026-10-25/sim-preserveact-b.md): does
// preserver widening increase how much preserving villagers actually DO?
// Contrast: preserver widening OFF vs ON on CURRENT master substrate,
// identical seeds, one sweep. OFF = HEAD tree with ONLY the two widening
// hunks of 75fdd9258 reverted in src/js/food.js (SPECIALTIES.preserver
// table + TECHNIQUE_GRANTS.preserve list; committed patch
// scripts/preserveact-off.patch, applied by
// scripts/sweep-one-preserveact-arm.sh). ON = HEAD tree unmodified.
// Both trees run THIS driver (copied in by the runner), so the ONLY code
// difference between arms is those two tables.
//
// Derived verbatim from scripts/sweep-rotdecide2-b.js (same rot capture,
// death capture, villageDays exposure, depriKcal ledger read, wall
// fields, FATAL env asserts, death-aware horizons, EPERM-resilient
// writes, STDOUT_SPLIT routing, haul/preserve wrappers, inverted haul
// predicate). Declared deltas vs the source instrument:
//   1. Mode string 'preserveact-b-<policy>'; output names
//      preserveact-b-<arm>-<side>-dg1-<policy>-s<seed>.json; trace names
//      preserveact-b-trace-<arm>-<side>-dg1-<policy>-s<seed>.json.
//   2. Default seeds 9750-9757 (fresh pilot band), default corpus
//      evidence/2026-10-25/preserveact-b-corpus.
//   3. ARM=off|on + BASE=<HEAD sha> instead of ANCHOR=<sha>: per-seed
//      files carry arm + baseCommit (the base both trees were extracted
//      from), never an anchor pair.
//   4. THE HAULCOUNT TAP IS LIVE IN BOTH ARMS: the tap (game.js cook-duty
//      smoke block) postdates the rotdecide2 anchors but is IN current
//      master, and the OFF patch touches only food.js — so
//      preserveVillagerBatches/preserveVillagerKcal are REAL measurements
//      here, not the 0/0-by-construction of rotdecide2. The live villager
//      signals are batches (per stack converted) and resolutions (per
//      cook resolution with n > 0, creditDeed 'preserving'); batches >=
//      resolutions per cell by construction (one resolution converts >=1
//      stack). Scholar verbs are wrapped exactly as in rotdecide2; under
//      leadfeast the policy never calls them, so scholar attempts are
//      EXPECTED 0 (backlog #1038) — never read as "nothing preserved".
//   5. SAY SAMPLES (sense-testing): Game.emit is wrapped (counting only)
//      to record cook smoke-rack lines (matching /smoke racks|cooked for
//      the haven|racks are already full/i), day-tagged, capped at 60, into
//      TRACE files only. Per-seed files carry no say text. The wrapper
//      delegates and never changes game behavior, so trace re-runs stay
//      byte-identical to corpus files.
//   6. No summary MERGE change: each arm run writes its own summary file
//      (OUT env); the analyzer aggregates across arms.
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted); SIDE=pd0|pd1
//   PLENTYDEPRI explicit per SIDE; DEPOSITGATE=1 explicit; ARM=off|on
//   BASE=<HEAD sha>; POLICY=leadfeast; SEEDS="9750,...,9757"; DAYS=100
//   (death-aware; dead villages stop; +10d tail max).
// ARM=off|on BASE=<sha> SIDE=pd0|pd1 POLICY=leadfeast SEEDS=... OUT=<path>
//   PERSEED_DIR=<path> node scripts/sweep-preserveact-b.js
//
// INSTRUMENT ONLY: zero game-balance changes in this file. The OFF tree's
// food.js revert is a scratch-tree contrast, never committed anywhere.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
const ARM = process.env.ARM || '';
if (ARM !== 'off' && ARM !== 'on') {
  console.error('FATAL: ARM=off|on must be set explicitly (every per-seed JSON is tagged with it)');
  process.exit(2);
}
const BASE = process.env.BASE || '';
if (!/^[0-9a-f]{7,40}$/.test(BASE)) {
  console.error('FATAL: BASE=<HEAD git sha> must be set explicitly (both arm trees are extracted from it)');
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
const SEEDS = (process.env.SEEDS || '9750,9751,9752,9753,9754,9755,9756,9757')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-10-25', 'sim-stafffallback-b-corpus', `sweep-${ARM}-${SIDE}-dg1-${POLICY_ID}.json`);
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-25', 'sim-stafffallback-b-corpus');

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
  const { Game } = await loadGame({ seed, mode: 'stafffallback-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  // Wrapper-presence audit: a verb missing in a tree
  // must show up here, never as a silent zero in the counts.
  const wrappers = {
    stockPantry: typeof Game.stockPantry === 'function',
    depositPantryPieces: typeof Game.depositPantryPieces === 'function',
    preserveFood: typeof Game.preserveFood === 'function',
    renderFat: typeof Game.renderFat === 'function',
    makePemmican: typeof Game.makePemmican === 'function',
    creditDeed: typeof Game.creditDeed === 'function',
  };
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
    preserveVillagerResolutions: 0, traceEvents: [], saySamples: [],
    cookingDeeds: 0, cookingByVid: {}, cookingSkillDist: {}, preservingByVid: {}, preservingSkillDist: {}, snapshots: [], assignCalls: [], staffDays: [] };
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
    try {
      if (deedId === 'preserving') { W.preserveVillagerResolutions += 1; const sk = preserverSkillOf(who); W.preservingByVid[who] = (W.preservingByVid[who] || 0) + 1; W.preservingSkillDist[sk] = (W.preservingSkillDist[sk] || 0) + 1; tracePush({ day: dayNow(), kind: 'preserve', verb: 'villagerCook', items: 0 }); }
      if (deedId === 'cooking') { W.cookingDeeds += 1; const sk = preserverSkillOf(who); W.cookingByVid[who] = (W.cookingByVid[who] || 0) + 1; W.cookingSkillDist[sk] = (W.cookingSkillDist[sk] || 0) + 1; }
    } catch (e) {}
    return ret;
  };

  // SAY SAMPLES (sense-testing, counting only): record cook smoke-rack
  // lines for trace files. Delegates to the original emit; never changes
  // game behavior, so trace re-runs stay byte-identical.
  const oEmit = Game.emit;
  if (typeof oEmit === 'function') Game.emit = function (text, surface) {
    const ret = oEmit.apply(this, arguments);
    try {
      const t = String(text == null ? '' : text);
      if (/smoke racks|cooked for the haven|racks are already full|Trust too low|Why should I listen|haven't earned that yet|Ask someone who trusts you|Not today\. Sorry/i.test(t) && W.saySamples.length < 80)
        W.saySamples.push({ day: dayNow(), text: t.slice(0, 240) });
    } catch (e) {}
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


  // ONZERO9754 DIAG helpers (driver-side, read-only): preserver skill of a
  // villager, and a daily pantry/assignment snapshot replicating the
  // game.js cook-duty smoke-rack branch's eligibility + reserve rules
  // WITHOUT mutating anything. No say-capture, no game code.
  const personFor = (vid) => { try { if (typeof Game.getPerson === 'function') { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {} try { return ((Game.data || {}).villagers || []).find(x => x && x.id === vid) || {}; } catch (e) { return {}; } };
  const preserverSkillOf = (vid) => { try { const p = personFor(vid); return (typeof Game.specialistSkill === 'function') ? (Game.specialistSkill(p, 'preserver') || 0) : 0; } catch (e) { return 0; } };
  const snapshotDay = () => {
    try {
      const v = (Game.state || {}).village || {}; const day = ((Game.state || {}).scholar || {}).day || 0;
      const roster = (v.roster || []).slice();
      const reserve = 250 * (roster.length || 10);
      let pantryKcal = 0, preservedKcal = 0;
      const eligible = [];
      for (const it of (v.pantry || [])) {
        if (!it) continue;
        const k = (it.kcalEach || 0) * (it.units || 1); pantryKcal += k;
        if (it.foodState === 'preserved' || it.foodState === 'rendered') { preservedKcal += k; continue; }
        if ((it.kcalEach || 0) <= 0 || (it.units || 0) <= 0) continue;
        if (it.bonded) continue;
        if ((it.foodKind || '') === 'pemmican') continue;
        try { if (Game.isKeepsake && Game.isKeepsake(it)) continue; } catch (e) {}
        const sd = it.spoilDay; if (sd === undefined || sd === null || sd >= 9999) continue;
        try { if (Game.isSpoiled && Game.isSpoiled(it, 0)) continue; } catch (e) {}
        if (sd - day > 2) continue;
        eligible.push(it);
      }
      eligible.sort((a, b) => (a.spoilDay - b.spoilDay) || (((b.kcalEach || 0) * (b.units || 1)) - ((a.kcalEach || 0) * (a.units || 1))));
      let eligibleKcal = 0; for (const it of eligible) eligibleKcal += (it.kcalEach || 0) * (it.units || 1);
      let keepFresh = reserve, afterReserveKcal = 0, afterReserveStacks = 0;
      for (const it of eligible) {
        const per = it.kcalEach || 1, units = it.units || 1, k = per * units;
        if (keepFresh <= 0) { afterReserveKcal += k; afterReserveStacks += 1; continue; }
        if (keepFresh >= k) { keepFresh -= k; continue; }
        const keepUnits = Math.min(units, Math.ceil(keepFresh / per)); keepFresh = 0;
        if (keepUnits < units) { afterReserveKcal += per * (units - keepUnits); afterReserveStacks += 1; }
      }
      const pool = { 0: 0, 1: 0, 2: 0, 3: 0 }; const poolList = [];
      for (const vid of roster) { const sk = preserverSkillOf(vid); pool[sk] = (pool[sk] || 0) + 1; poolList.push({ vid, occ: String((personFor(vid).formerOccupation || '')), skill: sk }); }
      const asg = v.assignments || {}; const taskCounts = {}; const cooks = [];
      for (const vid of roster) { const t = asg[vid] && asg[vid].task; if (t) { taskCounts[t] = (taskCounts[t] || 0) + 1; if (t === 'cook') cooks.push(vid); } }
      const caps = {}; for (let sk = 0; sk <= 3; sk++) { const shelf = sk > 0 ? 30 + 5 * sk : 15; caps[sk] = 125 * (roster.length || 10) * Math.max(1, shelf - 2); }
      const racksFull = {}; for (let sk = 0; sk <= 3; sk++) racksFull[sk] = preservedKcal >= caps[sk];
      W.snapshots.push({ day, roster: roster.length, reserve, pantryKcal: Math.round(pantryKcal), preservedKcal: Math.round(preservedKcal), eligibleKcal: Math.round(eligibleKcal), eligibleStacks: eligible.length, afterReserveKcal: Math.round(afterReserveKcal), afterReserveStacks, cooks, taskCounts, pool, poolList: (W.snapshots.length === 0 || day === 100) ? poolList : undefined, caps, racksFull });
    } catch (e) {}
  };

  // ASSIGN-LOG (driver-side, delegating, counting only): every assignTask
  // call with its return, plus a per-day staffing record (freshKcal in
  // the staffing block's own 0..3-day window + assignments before/after
  // the policy daily). No say-capture, no game code.
  const staffFreshKcal = () => { try { const v = (Game.state || {}).village || {}; const day = ((Game.state || {}).scholar || {}).day || 0; let f = 0; for (const it of (v.pantry || [])) { const sd = it.spoilDay == null ? 99999 : it.spoilDay; if ((it.kcalEach || 0) > 0 && (it.units || 0) > 0 && sd - day <= 3 && sd - day >= 0 && it.foodState !== 'preserved') f += (it.kcalEach || 0) * (it.units || 1); } return Math.round(f); } catch (e) { return 0; } };
  const asgCopy = () => { try { const out = {}; const a = ((Game.state || {}).village || {}).assignments || {}; for (const [k, v2] of Object.entries(a)) out[k] = v2 && v2.task; return out; } catch (e) { return {}; } };
  const oAssign = Game.assignTask;
  if (typeof oAssign === 'function') Game.assignTask = function (vid, task, opts) {
    const ret = oAssign.apply(this, arguments);
    try { let rs = 'null'; if (ret && typeof ret === 'object') rs = ret.ok ? 'ok' : (ret.refused ? 'refused' : 'not-ok'); W.assignCalls.push({ day: dayNow(), vid, task, via: (opts && opts.via) || null, ret: rs, skill: preserverSkillOf(vid) }); } catch (e) {}
    return ret;
  };
  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  policy.daily = (G, ctx) => {
    try { W.villageDays += (((G.state || {}).village || {}).roster || []).length; } catch (e) {}
    let pre = null, preFresh = 0;
    try { pre = asgCopy(); preFresh = staffFreshKcal(); } catch (e) {}
    let r = undefined;
    if (origDaily) r = origDaily(G, ctx);
    try { W.staffDays.push({ day: dayNow(), freshKcalPre: preFresh, asgPre: pre, asgPost: asgCopy() }); } catch (e) {}
    try { snapshotDay(); } catch (e) {}
    return r;
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
  // cook-duty conversions recorded; absent (0) only when no cook
  // preserved. LIVE IN BOTH ARMS here (the tap is in current master and
  // the OFF patch touches only food.js) — unlike rotdecide2, where the
  // tap postdated both anchors and batches read 0/0 by construction.
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
    wrappers,
    deathCauses, national,
    table: won, win: won,
    waveReach, medianSurvival: null, // patched by the analyzer with the cell median
    cookingDeeds: W.cookingDeeds, cookingByVid: W.cookingByVid, cookingSkillDist: W.cookingSkillDist,
    preservingByVid: W.preservingByVid, preservingSkillDist: W.preservingSkillDist,
    snapshots: W.snapshots,
    snapAgg: (() => { const a = { days: W.snapshots.length, daysEligibleGt0: 0, daysAfterReserveGt0: 0, maxEligibleKcal: 0, maxAfterReserveKcal: 0, daysPreservedKcalGt0: 0, firstDayAfterReserveGt0: null, racksFullDays: { 0: 0, 1: 0, 2: 0, 3: 0 } }; for (const sn of W.snapshots) { if (sn.eligibleKcal > 0) a.daysEligibleGt0 += 1; if (sn.afterReserveKcal > 0) { a.daysAfterReserveGt0 += 1; if (a.firstDayAfterReserveGt0 === null) a.firstDayAfterReserveGt0 = sn.day; } if (sn.eligibleKcal > a.maxEligibleKcal) a.maxEligibleKcal = sn.eligibleKcal; if (sn.afterReserveKcal > a.maxAfterReserveKcal) a.maxAfterReserveKcal = sn.afterReserveKcal; if (sn.preservedKcal > 0) a.daysPreservedKcalGt0 += 1; for (let sk = 0; sk <= 3; sk++) if (sn.racksFull && sn.racksFull[sk]) a.racksFullDays[sk] += 1; } return a; })(),
    assignCalls: W.assignCalls, staffDays: W.staffDays, saySamples: W.saySamples,
    assignAgg: (() => { const a = { cookCalls: 0, cookOk: 0, cookRefused: 0, cookNull: 0, cookCallVids: {}, staffDaysFreshGt1500NoCook: 0, staffDaysTotal: W.staffDays.length }; for (const c of W.assignCalls) if (c.task === 'cook') { a.cookCalls += 1; if (c.ret === 'ok') a.cookOk += 1; else if (c.ret === 'refused') a.cookRefused += 1; else a.cookNull += 1; a.cookCallVids[c.vid] = (a.cookCallVids[c.vid] || 0) + 1; } for (const sd of W.staffDays) { const hasCookPre = Object.values(sd.asgPre || {}).some(t => t === 'cook'); const hasCookPost = Object.values(sd.asgPost || {}).some(t => t === 'cook'); if (!hasCookPre && sd.freshKcalPre > 1500 && !hasCookPost) a.staffDaysFreshGt1500NoCook += 1; } return a; })(),
    arm: ARM, baseCommit: BASE,
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
    eventsStored: W.traceEvents.length, events: W.traceEvents, saySamples: W.saySamples } : null;
  return { seed, perSeed, diag, trace };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed, diag, trace } = await oneRun(seed, DAYS);
    rows.push({ seed: s, perSeed, diag });
    try { fs.mkdirSync(PERSEED_DIR, { recursive: true }); }
    catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    emitFile(path.join(PERSEED_DIR, `stafffallback-b-${ARM}-${SIDE}-dg1-${POLICY_ID}-s${s}.json`),
      JSON.stringify(Object.assign({}, perSeed, { arm: ARM, baseCommit: BASE })));
    if (trace) emitFile(path.join(PERSEED_DIR, `stafffallback-b-trace-${ARM}-${SIDE}-dg1-${POLICY_ID}-s${s}.json`),
      JSON.stringify(trace));
    const rotK = Math.round((perSeed.rotFreshKcal + perSeed.rotPreservedKcal) / 1000);
    progress(`done arm=${ARM} seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} rot=${rotK}k depriK=${Math.round(perSeed.depriKcal / 1000)} haul=${perSeed.haulActions}/${Math.round(perSeed.haulKcal / 1000)}k invHaul=${perSeed.invHaulActions}/${Math.round(perSeed.invHaulKcal / 1000)}k dep=${perSeed.pantryDepositActions} presAtt=${perSeed.preserveAttempts} presOk=${perSeed.preserveSuccessItems} cookDeeds=${perSeed.cookingDeeds} villPres=${perSeed.preserveVillagerBatches}/${Math.round(perSeed.preserveVillagerKcal / 1000)}k res=${perSeed.preserveVillagerResolutions} won=${perSeed.win} (${diag.ms}ms)`);
  }
  try { fs.mkdirSync(require('path').dirname(OUT), { recursive: true }); }
  catch (e) { console.error('MKDIR FAIL LOUDLY', OUT, e.message); process.exit(2); }
  emitSweep(JSON.stringify({ meta: { arm: ARM, base: BASE, cell: SIDE + '-dg1', policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', PLENTYDEPRI: PD_WANT, DEPOSITGATE: '1' } }, rows }));
  progress('wrote ' + OUT + ' (' + rows.length + ' rows)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
