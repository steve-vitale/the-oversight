// analyze-craftgate-a.js — analyzer + DIAG judge, arm sim-craftgate-a.
// The home-duty craft-gate DIAG (2115Z blank #1): decompose the
// never-supplied empty pool (aidammo: 131/149) into the four named
// causes — carrier-absent / pile-materials-absent /
// carrier-present-but-not-crafting / other — from the daily gate rows.
//
// Reuses the aidammo analyzer's ledger/pool machinery (require
// ./analyze-aidammo-a.js): ammoAtEntryAll, ledgerStats, ledgerHash.
// New here: emptyFighterPool, gateDecomposition, pileStats,
// craftgateHash, judgeDiag (the frozen prereg §2 bars).
// Usage:
//   node scripts/analyze-craftgate-a.js --dir DIR [--out FILE]
//   node scripts/analyze-craftgate-a.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const AID = require('./analyze-aidammo-a.js');
const ammoAtEntryAll = AID.ammoAtEntryAll;
const ledgerStats = AID.ledgerStats;
const ledgerHash = AID.ledgerHash;
const isAmmoCapable = AID.isAmmoCapable;

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(xs) {
  if (!xs.length) return null;
  return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
}
function readSeeds(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const out = [];
  for (const f of files) {
    try { const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); if (d && typeof d === 'object') out.push(d); } catch (e) {}
  }
  return out;
}
// CAUSE_ORDER: tie-break order for a fighter's primary cause (frozen,
// prereg §1b): away > no-materials > present-but-not-crafting > other.
const CAUSE_ORDER = ['carrier-absent', 'pile-materials-absent', 'carrier-present-but-not-crafting', 'other'];
// NEEDING_STATES: gate states that are needing-days (a candidate short
// of ammo). 'no-weapon' / 'not-craftable' rows are NOT needing-days —
// the fighter no longer carries a craftable weapon, so there is no
// ammo need that day (reported as diagnostics, never as a cause).
// 'no-recipe' IS a needing-day (weapon + short, recipe missing).
const NEEDING_STATES = { away: true, cooldown: true, 'no-materials': true, 'attempt-eligible': true, 'no-recipe': true };

// emptyFighterPool(dir): the distinct empty-quivered fighters at
// wave-4+ entry (any origin, evades included; lead + allies), and the
// never-supplied subset. "Received" = a ledger production event for
// the vid with an ammo id they needed at an empty meeting (primary:
// any source incl. starting-kit; variant: excluding starting-kit).
function emptyFighterPool(dir) {
  const seeds = readSeeds(dir);
  const st = { dir: dir, files: seeds.length, valid: seeds.length,
    emptyRows: 0, distinctEmpty: 0, neverSupplied: 0, neverSuppliedNoKit: 0,
    supplied: 0, repeatEmpties: 0, emptyByVid: {}, neverSuppliedVids: [],
    suppliedVids: [], meetingsByVid: {} };
  const emptyByVid = {}; // vid -> {meetings, ammoIds:Set, seeds:Set}
  const receivedByVid = {}; // vid -> {ammoId -> true} from production events
  const receivedNoKitByVid = {};
  for (const d of seeds) {
    const led = d.ammoLedger || {};
    for (const ev of (led.events || [])) {
      if (ev.kind !== 'production') continue;
      if (!receivedByVid[ev.vid]) receivedByVid[ev.vid] = {};
      receivedByVid[ev.vid][ev.ammoId] = true;
      if (ev.source !== 'starting-kit') {
        if (!receivedNoKitByVid[ev.vid]) receivedNoKitByVid[ev.vid] = {};
        receivedNoKitByVid[ev.vid][ev.ammoId] = true;
      }
    }
    for (const r of (d.v4encounters || [])) {
      if ((r.wave | 0) < 4) continue;
      const addFighter = function (vid, rangedId, ammoAtEntry, ammoId) {
        if (vid == null || rangedId == null) return;
        if (!isAmmoCapable(rangedId)) return; // spears never count
        if ((ammoAtEntry | 0) > 0) return;
        st.emptyRows++;
        if (!emptyByVid[vid]) emptyByVid[vid] = { meetings: 0, ammoIds: {}, seeds: {} };
        emptyByVid[vid].meetings++;
        if (ammoId) emptyByVid[vid].ammoIds[ammoId] = true;
        emptyByVid[vid].seeds[d.seed] = true;
        if (!st.meetingsByVid[vid]) st.meetingsByVid[vid] = [];
        st.meetingsByVid[vid].push({ seed: d.seed, day: r.day, mid: r.mid, origin: r.origin || null, rangedId: rangedId, ammoId: ammoId || null });
      };
      // The lead's needed ammo id is resolved after the loop from
      // the gate rows (nearest gate row at or before the meeting,
      // same seed) — see below. Allies carry ammoId on the row.
      addFighter(r.vid, r.rangedId, r.ammoAtEntry, null);
      for (const a of (r.alliesAmmo || [])) addFighter(a.vid, a.rangedId, a.ammoAtEntry, a.ammoId || null);
    }
  }
  // Resolve each empty fighter's needed ammo ids from their gate rows
  // (nearest gate row at or before each empty meeting, same seed).
  const gateByVidDay = {};
  for (const d of seeds) {
    for (const g of (d.gateDays || [])) {
      if (!g || g.vid == null) continue;
      const k = d.seed + '|' + g.vid;
      if (!gateByVidDay[k]) gateByVidDay[k] = [];
      gateByVidDay[k].push(g);
    }
  }
  for (const vid of Object.keys(emptyByVid)) {
    const info = emptyByVid[vid];
    const needed = Object.keys(info.ammoIds);
    // Fill from gate rows: the ammo id the fighter's weapon needed.
    for (const m of (st.meetingsByVid[vid] || [])) {
      const rows = gateByVidDay[m.seed + '|' + vid] || [];
      let best = null;
      for (const g of rows) {
        if (g.day <= m.day && (!best || g.day > best.day) && g.ammoId) best = g;
      }
      if (best && best.ammoId) info.ammoIds[best.ammoId] = true;
    }
    const ids = Object.keys(info.ammoIds);
    // If no gate row ever named an ammo id (fighter never a candidate
    // in the gate rows — e.g. never home as a carrier), fall back to
    // "any ammo id": received = any production event at all.
    const got = (ids.length === 0)
      ? !!receivedByVid[vid]
      : ids.some(function (id) { return !!(receivedByVid[vid] || {})[id]; });
    const gotNoKit = (ids.length === 0)
      ? !!receivedNoKitByVid[vid]
      : ids.some(function (id) { return !!(receivedNoKitByVid[vid] || {})[id]; });
    info.neededAmmoIds = ids;
    info.received = got;
    info.receivedNoKit = gotNoKit;
    if (got) st.supplied++;
    else { st.neverSupplied++; st.neverSuppliedVids.push(vid); }
    if (!gotNoKit) st.neverSuppliedNoKit++;
    if (info.meetings > 1) st.repeatEmpties++;
  }
  st.distinctEmpty = Object.keys(emptyByVid).length;
  st.emptyByVid = emptyByVid;
  st.suppliedVids = Object.keys(emptyByVid).filter(function (v) { return emptyByVid[v].received; });
  return st;
}

// gateDecomposition(dir, pool): for each never-supplied empty fighter,
// classify their needing-days into the four named causes and pick the
// primary cause (plurality, CAUSE_ORDER tie-break). Also pooled day
// counts, sub-counts inside 'other', the no-materials split, attempt
// outcomes by blind/learned, the autoEquip gap, the atHaven divergence,
// and gate coverage (observed needing-days vs unobserved short-days on
// duty-missing days, from pileDaily census counts).
function gateDecomposition(dir, pool) {
  const seeds = readSeeds(dir);
  const st = { dir: dir, files: seeds.length,
    needingDays: 0, needingDaysByCause: {}, needingDaysByState: {},
    fighters: {}, unassigned: 0, unassignedVids: [],
    primaryCauseCounts: {}, primaryCauseDays: {},
    subOther: { 'attempt-failed': 0, 'eligible-no-attempt': 0, 'attempt-success-anomaly': 0, 'no-recipe': 0, 'no-weapon': 0, 'not-craftable': 0 },
    noMaterialsSplit: { pileShort: 0, ownShort: 0, bothShort: 0 },
    shortfallMats: {},
    attemptsLinked: 0, attemptsBlind: 0, attemptsBlindOk: 0, attemptsLearned: 0, attemptsLearnedOk: 0,
    attemptsTotal: 0, attemptsOk: 0,
    autoEquipGapRows: 0, autoEquipGapVids: {},
    notAwayNotHavenRows: 0,
    dutyCalls: 0, dutyDays: 0, pileDays: 0,
    observedNeeding: 0, unobservedShortDays: 0, coverage: null,
    duplicateGateRows: 0, noWeaponRows: 0, notCraftableRows: 0 };
  const neverSet = new Set(pool.neverSuppliedVids || []);
  // Per-fighter day maps: vid -> {day -> cause} (first gate row wins
  // per vid-day; later rows same day are duplicates, counted).
  const fighterDays = {}; // vid -> {day: {cause, state, sub}}
  const attemptIdx = {}; // seed|vid|day -> attempt row
  for (const d of seeds) {
    st.dutyCalls += (d.dutyCalls | 0);
    const pileDays = d.pileDaily || [];
    st.pileDays += pileDays.length;
    const gateDaysByDay = {};
    for (const a of (d.attempts || [])) {
      attemptIdx[d.seed + '|' + a.vid + '|' + a.day] = a;
      st.attemptsTotal++;
      if (a.success) st.attemptsOk++;
      if (a.blind) { st.attemptsBlind++; if (a.success) st.attemptsBlindOk++; }
      else { st.attemptsLearned++; if (a.success) st.attemptsLearnedOk++; }
    }
    for (const g of (d.gateDays || [])) {
      if (!g || g.vid == null) continue;
      const dk = g.day;
      if (!gateDaysByDay[dk]) gateDaysByDay[dk] = 0;
      gateDaysByDay[dk]++;
      if (g.weaponSource === 'carried-autoequip') {
        st.autoEquipGapRows++;
        st.autoEquipGapVids[g.vid] = true;
      }
      if (g.away === false && g.atHaven === false && g.state !== 'away') st.notAwayNotHavenRows++;
      if (g.state === 'no-weapon') st.noWeaponRows++;
      if (g.state === 'not-craftable') st.notCraftableRows++;
      if (!NEEDING_STATES[g.state]) continue;
      if (!neverSet.has(g.vid)) continue;
      if (!fighterDays[g.vid]) fighterDays[g.vid] = {};
      if (fighterDays[g.vid][g.day]) { st.duplicateGateRows++; continue; }
      // Cause for this needing-day.
      let cause = g.cause, sub = null;
      if (g.state === 'attempt-eligible') {
        const att = attemptIdx[d.seed + '|' + g.vid + '|' + g.day];
        if (!att) { cause = 'other'; sub = 'eligible-no-attempt'; }
        else {
          st.attemptsLinked++;
          if (att.success) { cause = 'other'; sub = 'attempt-success-anomaly'; }
          else { cause = 'other'; sub = 'attempt-failed'; }
        }
      } else if (g.state === 'no-recipe') { cause = 'other'; sub = 'no-recipe'; }
      if (cause === 'other' && sub && st.subOther[sub] != null) st.subOther[sub]++;
      if (g.state === 'no-materials') {
        const sf = g.shortfall || [];
        let pileShort = false, ownShort = false;
        for (const s of sf) {
          st.shortfallMats[s.mat] = (st.shortfallMats[s.mat] || 0) + 1;
          if ((s.pile | 0) < (s.need | 0)) pileShort = true;
          if ((s.own | 0) < (s.need | 0)) ownShort = true;
        }
        if (pileShort && ownShort) st.noMaterialsSplit.bothShort++;
        else if (pileShort) st.noMaterialsSplit.pileShort++;
        else if (ownShort) st.noMaterialsSplit.ownShort++;
      }
      fighterDays[g.vid][g.day] = { cause: cause, state: g.state, sub: sub };
    }
    // Duty-missing days: pileDaily rows on days with no gate rows at
    // all — the census `short` count is unobserved needing-days.
    const pileDaySet = {};
    for (const p of pileDays) pileDaySet[p.day] = p;
    for (const day of Object.keys(pileDaySet)) {
      if (!gateDaysByDay[day]) st.unobservedShortDays += (pileDaySet[day].short | 0);
    }
    st.dutyDays += Object.keys(gateDaysByDay).length;
  }
  for (const vid of Object.keys(fighterDays)) {
    const days = fighterDays[vid];
    const byCause = {};
    for (const day of Object.keys(days)) {
      const c = days[day].cause;
      byCause[c] = (byCause[c] || 0) + 1;
      st.needingDaysByCause[c] = (st.needingDaysByCause[c] || 0) + 1;
      st.needingDaysByState[days[day].state] = (st.needingDaysByState[days[day].state] || 0) + 1;
      st.needingDays++;
    }
    // Primary cause: plurality, CAUSE_ORDER tie-break.
    let best = null, bestN = -1;
    for (const c of CAUSE_ORDER) {
      const n = byCause[c] || 0;
      if (n > bestN) { bestN = n; best = c; }
    }
    const tied = CAUSE_ORDER.filter(function (c) { return (byCause[c] || 0) === bestN; }).length;
    st.fighters[vid] = { needingDays: Object.keys(days).length, byCause: byCause,
      primaryCause: bestN > 0 ? best : null, tied: tied > 1 };
    if (!best || bestN <= 0) { st.unassigned++; st.unassignedVids.push(vid); }
    else {
      st.primaryCauseCounts[best] = (st.primaryCauseCounts[best] || 0) + 1;
      st.primaryCauseDays[best] = (st.primaryCauseDays[best] || 0) + (byCause[best] || 0);
    }
  }
  // Never-supplied fighters with NO needing-day rows at all are
  // unassigned (the instrument never observed them needing).
  for (const vid of (pool.neverSuppliedVids || [])) {
    if (!st.fighters[vid]) {
      st.fighters[vid] = { needingDays: 0, byCause: {}, primaryCause: null, tied: false };
      st.unassigned++;
      st.unassignedVids.push(vid);
    }
  }
  st.observedNeeding = st.needingDays;
  const denom = st.observedNeeding + st.unobservedShortDays;
  st.coverage = denom ? st.observedNeeding / denom : null;
  return st;
}

// pileStats(dir): pile-recipe availability + carrier census means.
function pileStats(dir) {
  const seeds = readSeeds(dir);
  const st = { files: seeds.length, days: 0, arrowRecipeDays: 0, boltRecipeDays: 0,
    arrowRecipeShare: null, boltRecipeShare: null,
    meanPile: { stick: null, stone: null, fiber: null },
    meanCandidates: null, meanAtHome: null, meanShort: null, meanMatsOk: null,
    meanNoMaterials: null, meanCooldown: null, meanAttemptEligible: null,
    perSeed: [] };
  const sticks = [], stones = [], fibers = [];
  const cands = [], homes = [], shorts = [], matsOks = [], noMats = [], cds = [], elig = [];
  for (const d of seeds) {
    let arrowOk = 0, boltOk = 0, n = 0;
    for (const p of (d.pileDaily || [])) {
      n++;
      if (p.arrowRecipeOk) arrowOk++;
      if (p.boltRecipeOk) boltOk++;
      sticks.push((p.pile || {}).stick | 0);
      stones.push((p.pile || {}).stone | 0);
      fibers.push((p.pile || {}).fiber | 0);
      cands.push(p.candidates | 0); homes.push(p.atHome | 0); shorts.push(p.short | 0);
      matsOks.push(p.matsOk | 0); noMats.push(p.noMaterials | 0); cds.push(p.cooldown | 0); elig.push(p.attemptEligible | 0);
    }
    st.days += n;
    st.arrowRecipeDays += arrowOk;
    st.boltRecipeDays += boltOk;
    st.perSeed.push({ seed: d.seed, days: n, arrowRecipeShare: n ? arrowOk / n : null,
      boltRecipeShare: n ? boltOk / n : null, meanCandidates: mean((d.pileDaily || []).map(function (p) { return p.candidates | 0; })),
      homeDutyBatches: ((d.ammoLedger || {}).counters || {}).homeDutyBatches | 0,
      homeDutyCalls: ((d.ammoLedger || {}).counters || {}).homeDutyCalls | 0 });
  }
  st.arrowRecipeShare = st.days ? st.arrowRecipeDays / st.days : null;
  st.boltRecipeShare = st.days ? st.boltRecipeDays / st.days : null;
  st.meanPile = { stick: mean(sticks), stone: mean(stones), fiber: mean(fibers) };
  st.meanCandidates = mean(cands); st.meanAtHome = mean(homes); st.meanShort = mean(shorts);
  st.meanMatsOk = mean(matsOks); st.meanNoMaterials = mean(noMats);
  st.meanCooldown = mean(cds); st.meanAttemptEligible = mean(elig);
  return st;
}

// craftgateHash(d): canonical hash of one seed's gate rows + attempt
// rows + ledger events + encounter ammo fields — the determinism
// re-run check (prereg §2). Two runs of the same seed under identical
// env must hash equal: the instrument draws no RNG.
function craftgateHash(d) {
  const canon = { gateDays: d.gateDays || [], attempts: d.attempts || [],
    pileDaily: d.pileDaily || [],
    events: (d.ammoLedger || {}).events || [],
    encounters: ((d.v4encounters || []).map(function (r) {
      return { day: r.day, vid: r.vid, mid: r.mid, origin: r.origin || null,
        rangedId: r.rangedId || null, ammoAtEntry: r.ammoAtEntry | 0,
        ammoProv: r.ammoProv || [], alliesAmmo: r.alliesAmmo || [],
        volleySpend: r.volleySpend || null, volley: r.volley || null,
        outcome: r.outcome || null, rounds: r.rounds | 0 };
    })) };
  return crypto.createHash('sha256').update(JSON.stringify(canon)).digest('hex');
}

function judgeDiag(pool, ledger, gate, ammo) {
  const bars = [];
  const poolOk = pool.distinctEmpty >= 10;
  bars.push({ id: 'pool-floor', pass: poolOk,
    detail: 'distinct empty-quivered fighters at wave-4+ entry: ' + pool.distinctEmpty +
      ' (' + pool.emptyRows + ' empty rows; never-supplied ' + pool.neverSupplied + ') (floor 10)' });
  const comp = ledger.attributionCompleteness;
  const compPass = comp != null && comp >= 0.90;
  bars.push({ id: 'attribution-completeness', pass: compPass,
    detail: 'known-source units at entry / total units at entry: ' + (comp == null ? 'n/a' : comp.toFixed(3)) +
      ' (bar >= 0.90)' });
  const cov = gate.coverage;
  const covPass = cov != null && cov >= 0.90;
  bars.push({ id: 'gate-coverage', pass: covPass,
    detail: 'needing-days with a gate row / all needing-days: ' + (cov == null ? 'n/a' : cov.toFixed(3)) +
      ' (' + gate.observedNeeding + ' observed + ' + gate.unobservedShortDays + ' unobserved short-days on duty-missing days; duty ran ' +
      gate.dutyDays + ' days, ' + gate.dutyCalls + ' calls) (bar >= 0.90)' });
  const unassOk = gate.unassigned === 0;
  bars.push({ id: 'decomposition-complete', pass: unassOk,
    detail: 'never-supplied fighters without a primary cause: ' + gate.unassigned +
      (gate.unassignedVids.length ? ' (' + gate.unassignedVids.join(', ') + ')' : '') + ' (bar 0)' });
  const mechRate = ammo ? ammo.rate : null;
  bars.push({ id: 'mechanism-ammo-at-entry', pass: mechRate != null,
    detail: 'ammo-at-entry (all origins, lead+allies): ' + (mechRate == null ? 'n/a' : mechRate.toFixed(3)) +
      ' vs bar 0.70 — RE-MEASURE, reported not judged (the DIAG measures the bar, it does not pass/fail on it)' });
  let verdict = 'DIAG-NO-GO', kind = '';
  if (!poolOk) { verdict = 'DIAG-NO-GO'; kind = 'THIN-POOL'; }
  else if (!compPass) { verdict = 'DIAG-NO-GO'; kind = 'ATTRIBUTION'; }
  else if (!covPass) { verdict = 'DIAG-NO-GO'; kind = 'COVERAGE'; }
  else if (!unassOk) { verdict = 'DIAG-NO-GO'; kind = 'UNASSIGNED'; }
  else { verdict = 'DIAG-GO'; kind = 'DECOMPOSED'; }
  return { verdict: verdict, kind: kind, bars: bars, mechanismRate: mechRate };
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) passed++;
    else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-craftgate-'));
  const dir = path.join(tmp, 'leg');
  fs.mkdirSync(dir);
  function mkSeed(o) {
    return Object.assign({ seed: 1, days: 150, gameDays: 150, scaleRank: 'regional', won: false,
      maxWave: 4, endReason: 'survived', instrumentErrors: [],
      dutyCalls: 150,
      ammoLedger: { events: [], other: [], unattributedSpend: [], transfers: [], spends: [],
        counters: { homeDutyBatches: 0, homeDutyCalls: 150, departureCalls: 0, departureCraftAttempts: 0, departureCraftOk: 0, departureStones: 0, departureStashMoved: 0, lootDrops: 0, lootAmmoDrops: 0 },
        finalProv: {} },
      gateDays: [], attempts: [], pileDaily: [], v4encounters: [] }, o);
  }
  // Seed 1: two empty fighters (h2 bow, h3 crossbow), one supplied (h1).
  // h2: 3 away days + 1 no-materials day => primary carrier-absent.
  // h3: 2 no-materials + 2 cooldown => tie; order puts no-materials first.
  // h4: empty with a spear — never in the pool.
  const seed1 = mkSeed({
    v4encounters: [
      { day: 20, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', allyVids: ['h2'], outcome: 'vKill', rounds: 5, mDealt: 500, mHpStart: 1000, vTaken: 100, rangedId: 'bow', ammoAtEntry: 5, ammoProv: [{ source: 'home-duty', units: 5 }], alliesAmmo: [{ vid: 'h2', rangedId: 'bow', ammoId: 'arrow', ammoAtEntry: 0, prov: [], spent: null }], volley: { shots: 3, hits: 2, dmg: 34 }, log: [] },
      { day: 21, vid: 'h3', mid: 'eulogy', wave: 4, origin: 'aid', allyVids: [], outcome: 'vFlee', rounds: 2, mDealt: 71, mHpStart: 1311, vTaken: 70, rangedId: 'crossbow', ammoAtEntry: 0, ammoProv: [], alliesAmmo: [], volley: null, log: [] },
      { day: 22, vid: 'h4', mid: 'reunion', wave: 4, origin: 'world-tick', allyVids: [], outcome: 'vDie', rounds: 1, mDealt: 0, mHpStart: 900, vTaken: 900, rangedId: 'hunting_spear', ammoAtEntry: 0, ammoProv: [], alliesAmmo: [], volley: null, log: [] },
      { day: 23, vid: 'h2', mid: 'suburb', wave: 4, origin: 'world-tick', allyVids: [], outcome: 'evade', rounds: 0, mDealt: 0, mHpStart: 1000, vTaken: 0, rangedId: 'bow', ammoAtEntry: 0, ammoProv: [], alliesAmmo: [], volley: null, log: [] },
    ],
    ammoLedger: { events: [
      { seq: 1, day: 1, kind: 'production', vid: 'h1', ammoId: 'arrow', units: 5, source: 'home-duty', loc: 'carried' },
    ], other: [], unattributedSpend: [], transfers: [], spends: [],
      counters: { homeDutyBatches: 1, homeDutyCalls: 150, departureCalls: 0, departureCraftAttempts: 0, departureCraftOk: 0, departureStones: 0, departureStashMoved: 0, lootDrops: 0, lootAmmoDrops: 0 },
      finalProv: {} },
    gateDays: [
      { day: 5, vid: 'h2', state: 'away', cause: 'carrier-absent', rangedId: 'bow', ammoId: 'arrow', weaponSource: 'equipped', carried: 0, away: true, atHaven: false, cooldown: false, level: 1, own: {}, need: { stick: 2, stone: 1, fiber: 1 }, shortfall: [], pile: { stick: 0, stone: 0, fiber: 0 } },
      { day: 6, vid: 'h2', state: 'away', cause: 'carrier-absent', rangedId: 'bow', ammoId: 'arrow', weaponSource: 'equipped', carried: 0, away: true, atHaven: false, cooldown: false, level: 1, own: {}, need: { stick: 2, stone: 1, fiber: 1 }, shortfall: [], pile: { stick: 0, stone: 0, fiber: 0 } },
      { day: 7, vid: 'h2', state: 'away', cause: 'carrier-absent', rangedId: 'bow', ammoId: 'arrow', weaponSource: 'equipped', carried: 0, away: true, atHaven: false, cooldown: false, level: 1, own: {}, need: { stick: 2, stone: 1, fiber: 1 }, shortfall: [], pile: { stick: 0, stone: 0, fiber: 0 } },
      { day: 8, vid: 'h2', state: 'no-materials', cause: 'pile-materials-absent', rangedId: 'bow', ammoId: 'arrow', weaponSource: 'equipped', carried: 0, away: false, atHaven: true, cooldown: false, level: 1, own: { stick: 0, stone: 0, fiber: 0 }, need: { stick: 2, stone: 1, fiber: 1 }, shortfall: [{ mat: 'stick', need: 2, have: 0, own: 0, pile: 0 }], pile: { stick: 0, stone: 0, fiber: 0 } },
      { day: 5, vid: 'h3', state: 'no-materials', cause: 'pile-materials-absent', rangedId: 'crossbow', ammoId: 'bolt', weaponSource: 'equipped', carried: 0, away: false, atHaven: true, cooldown: false, level: 1, own: { stick: 1, stone: 0 }, need: { stick: 2, stone: 1 }, shortfall: [{ mat: 'stick', need: 2, have: 1, own: 1, pile: 0 }, { mat: 'stone', need: 1, have: 0, own: 0, pile: 0 }], pile: { stick: 0, stone: 0, fiber: 0 } },
      { day: 6, vid: 'h3', state: 'no-materials', cause: 'pile-materials-absent', rangedId: 'crossbow', ammoId: 'bolt', weaponSource: 'equipped', carried: 0, away: false, atHaven: true, cooldown: false, level: 1, own: { stick: 1, stone: 0 }, need: { stick: 2, stone: 1 }, shortfall: [{ mat: 'stick', need: 2, have: 1, own: 1, pile: 0 }], pile: { stick: 0, stone: 0, fiber: 0 } },
      { day: 7, vid: 'h3', state: 'cooldown', cause: 'carrier-present-but-not-crafting', rangedId: 'crossbow', ammoId: 'bolt', weaponSource: 'equipped', carried: 0, away: false, atHaven: true, cooldown: true, level: 1, own: { stick: 2, stone: 1 }, need: { stick: 2, stone: 1 }, shortfall: [], pile: { stick: 5, stone: 5, fiber: 5 } },
      { day: 8, vid: 'h3', state: 'cooldown', cause: 'carrier-present-but-not-crafting', rangedId: 'crossbow', ammoId: 'bolt', weaponSource: 'equipped', carried: 0, away: false, atHaven: true, cooldown: true, level: 1, own: { stick: 2, stone: 1 }, need: { stick: 2, stone: 1 }, shortfall: [], pile: { stick: 5, stone: 5, fiber: 5 } },
      // A stocked row for h1 (not a needing-day) + a duplicate h2 day-5 row.
      { day: 9, vid: 'h1', state: 'stocked', cause: null, rangedId: 'bow', ammoId: 'arrow', weaponSource: 'equipped', carried: 5, away: false, atHaven: true, cooldown: false, level: 2, own: {}, need: { stick: 2, stone: 1, fiber: 1 }, shortfall: [], pile: { stick: 5, stone: 5, fiber: 5 } },
      { day: 5, vid: 'h2', state: 'away', cause: 'carrier-absent', rangedId: 'bow', ammoId: 'arrow', weaponSource: 'equipped', carried: 0, away: true, atHaven: false, cooldown: false, level: 1, own: {}, need: { stick: 2, stone: 1, fiber: 1 }, shortfall: [], pile: { stick: 0, stone: 0, fiber: 0 } },
    ],
    attempts: [
      { day: 10, vid: 'h1', ammoId: 'arrow', attempted: true, success: true, unitsGained: 5, level: 2, blind: false },
    ],
    pileDaily: [
      { day: 5, pile: { stick: 0, stone: 0, fiber: 0 }, arrowRecipeOk: false, boltRecipeOk: false, candidates: 3, atHome: 2, away: 1, short: 3, stocked: 0, matsOk: 0, noMaterials: 2, cooldown: 0, attemptEligible: 0 },
      { day: 6, pile: { stick: 0, stone: 0, fiber: 0 }, arrowRecipeOk: false, boltRecipeOk: false, candidates: 3, atHome: 2, away: 1, short: 3, stocked: 0, matsOk: 0, noMaterials: 2, cooldown: 0, attemptEligible: 0 },
      { day: 7, pile: { stick: 5, stone: 5, fiber: 5 }, arrowRecipeOk: true, boltRecipeOk: true, candidates: 3, atHome: 2, away: 1, short: 3, stocked: 0, matsOk: 0, noMaterials: 0, cooldown: 1, attemptEligible: 0 },
      { day: 8, pile: { stick: 5, stone: 5, fiber: 5 }, arrowRecipeOk: true, boltRecipeOk: true, candidates: 3, atHome: 2, away: 1, short: 3, stocked: 0, matsOk: 0, noMaterials: 1, cooldown: 1, attemptEligible: 0 },
      { day: 9, pile: { stick: 5, stone: 5, fiber: 5 }, arrowRecipeOk: true, boltRecipeOk: true, candidates: 3, atHome: 2, away: 1, short: 2, stocked: 1, matsOk: 0, noMaterials: 0, cooldown: 0, attemptEligible: 0 },
    ],
  });
  fs.writeFileSync(path.join(dir, 's1.json'), JSON.stringify(seed1));
  // Seed 2: one more empty fighter (h5, bow) with ONLY attempt-eligible
  // days that failed (attempt rows present, success false) => primary
  // other (attempt-failed). Plus a duty-missing day: pileDaily day 11
  // with short 2 and no gate rows that day => unobserved short-days 2.
  const seed2 = mkSeed({ seed: 2, dutyCalls: 149,
    v4encounters: [
      { day: 30, vid: 'h5', mid: 'audit', wave: 4, origin: 'expedition', allyVids: [], outcome: 'vFlee', rounds: 2, mDealt: 71, mHpStart: 1311, vTaken: 70, rangedId: 'bow', ammoAtEntry: 0, ammoProv: [], alliesAmmo: [], volley: null, log: [] },
    ],
    gateDays: [
      { day: 10, vid: 'h5', state: 'attempt-eligible', cause: 'attempt', rangedId: 'bow', ammoId: 'arrow', weaponSource: 'equipped', carried: 0, away: false, atHaven: true, cooldown: false, level: 1, own: { stick: 2, stone: 1, fiber: 1 }, need: { stick: 2, stone: 1, fiber: 1 }, shortfall: [], pile: { stick: 5, stone: 5, fiber: 5 } },
      { day: 11, vid: 'h5', state: 'attempt-eligible', cause: 'attempt', rangedId: 'bow', ammoId: 'arrow', weaponSource: 'equipped', carried: 0, away: false, atHaven: true, cooldown: false, level: 1, own: { stick: 2, stone: 1, fiber: 1 }, need: { stick: 2, stone: 1, fiber: 1 }, shortfall: [], pile: { stick: 5, stone: 5, fiber: 5 } },
    ],
    attempts: [
      { day: 10, vid: 'h5', ammoId: 'arrow', attempted: true, success: false, unitsGained: 0, level: 1, blind: true },
      { day: 11, vid: 'h5', ammoId: 'arrow', attempted: true, success: false, unitsGained: 0, level: 1, blind: true },
    ],
    pileDaily: [
      { day: 10, pile: { stick: 5, stone: 5, fiber: 5 }, arrowRecipeOk: true, boltRecipeOk: true, candidates: 1, atHome: 1, away: 0, short: 1, stocked: 0, matsOk: 1, noMaterials: 0, cooldown: 0, attemptEligible: 1 },
      { day: 11, pile: { stick: 5, stone: 5, fiber: 5 }, arrowRecipeOk: true, boltRecipeOk: true, candidates: 1, atHome: 1, away: 0, short: 2, stocked: 0, matsOk: 1, noMaterials: 0, cooldown: 0, attemptEligible: 1 },
    ],
  });
  fs.writeFileSync(path.join(dir, 's2.json'), JSON.stringify(seed2));

  // ---- emptyFighterPool ----
  const pool = emptyFighterPool(dir);
  check('pool: 4 empty rows (h2 x2, h3, h5; spear h4 excluded)', pool.emptyRows === 4, 'got ' + pool.emptyRows);
  check('pool: 3 distinct empty fighters', pool.distinctEmpty === 3, 'got ' + pool.distinctEmpty);
  check('pool: h1 supplied (5 arrows, home-duty), not in the pool', pool.suppliedVids.indexOf('h1') === -1 && pool.emptyByVid.h1 === undefined);
  check('pool: never-supplied 3 (h2, h3, h5)', pool.neverSupplied === 3, 'got ' + pool.neverSupplied);
  check('pool: repeat empties 1 (h2 twice)', pool.repeatEmpties === 1, 'got ' + pool.repeatEmpties);

  // ---- gateDecomposition ----
  const gate = gateDecomposition(dir, pool);
  check('decomp: 10 needing-days (h2 4 + h3 4 + h5 2)', gate.needingDays === 10, 'got ' + gate.needingDays);
  check('decomp: h2 primary carrier-absent (3 away vs 1 no-materials)',
    gate.fighters.h2 && gate.fighters.h2.primaryCause === 'carrier-absent', JSON.stringify(gate.fighters.h2));
  check('decomp: h3 tie 2/2 breaks to pile-materials-absent (order)',
    gate.fighters.h3 && gate.fighters.h3.primaryCause === 'pile-materials-absent' && gate.fighters.h3.tied === true, JSON.stringify(gate.fighters.h3));
  check('decomp: h5 primary other (attempt-failed x2)',
    gate.fighters.h5 && gate.fighters.h5.primaryCause === 'other', JSON.stringify(gate.fighters.h5));
  check('decomp: primary-cause counts 1/1/1',
    gate.primaryCauseCounts['carrier-absent'] === 1 && gate.primaryCauseCounts['pile-materials-absent'] === 1 && gate.primaryCauseCounts.other === 1,
    JSON.stringify(gate.primaryCauseCounts));
  check('decomp: unassigned 0', gate.unassigned === 0, 'got ' + gate.unassigned);
  check('decomp: subOther attempt-failed 2', gate.subOther['attempt-failed'] === 2, JSON.stringify(gate.subOther));
  check('decomp: duplicate gate row counted (h2 day 5 twice)', gate.duplicateGateRows === 1, 'got ' + gate.duplicateGateRows);
  check('decomp: no-materials split bothShort 3 (h2 day 8 + h3 days 5-6: pile 0 AND own short)',
    gate.noMaterialsSplit.bothShort === 3, JSON.stringify(gate.noMaterialsSplit));
  check('decomp: shortfall mats stick 3 / stone 1 (day-6 fixture lists stick only)',
    gate.shortfallMats.stick === 3 && gate.shortfallMats.stone === 1, JSON.stringify(gate.shortfallMats));
  check('decomp: attempts blind 2/2 failed', gate.attemptsBlind === 2 && gate.attemptsBlindOk === 0, JSON.stringify({ b: gate.attemptsBlind, ok: gate.attemptsBlindOk }));
  check('decomp: coverage counts unobserved short-days on duty-missing days (seed2 day 11 has gate rows — none missing; seed1 days all have gate rows)',
    gate.unobservedShortDays === 0, 'got ' + gate.unobservedShortDays);
  check('decomp: coverage 1.0 when nothing unobserved', gate.coverage === 1, 'got ' + gate.coverage);

  // ---- pileStats ----
  const pile = pileStats(dir);
  check('pile: arrow-recipe share 5/7', Math.abs(pile.arrowRecipeShare - 5 / 7) < 1e-9, 'got ' + pile.arrowRecipeShare);
  check('pile: per-seed home-duty batches seed1 1 / seed2 0',
    pile.perSeed[0].homeDutyBatches === 1 && pile.perSeed[1].homeDutyBatches === 0, JSON.stringify(pile.perSeed));

  // ---- judgeDiag shapes ----
  const led = ledgerStats(dir);
  const ammo = ammoAtEntryAll(dir);
  let j = judgeDiag(pool, led, gate, ammo);
  check('judge DIAG-NO-GO thin-pool (3 distinct < 10)', j.verdict === 'DIAG-NO-GO' && j.kind === 'THIN-POOL', JSON.stringify(j));
  const bigPool = Object.assign({}, pool, { distinctEmpty: 12 });
  j = judgeDiag(bigPool, led, gate, ammo);
  check('judge DIAG-GO decomposed when all bars pass (completeness 1.0 here: no unknown units)',
    j.verdict === 'DIAG-GO' && j.kind === 'DECOMPOSED', JSON.stringify(j));
  j = judgeDiag(bigPool, Object.assign({}, led, { attributionCompleteness: 0.5 }), gate, ammo);
  check('judge DIAG-NO-GO attribution (0.50)', j.verdict === 'DIAG-NO-GO' && j.kind === 'ATTRIBUTION', JSON.stringify(j));
  j = judgeDiag(bigPool, led, Object.assign({}, gate, { coverage: 0.5 }), ammo);
  check('judge DIAG-NO-GO coverage (0.50)', j.verdict === 'DIAG-NO-GO' && j.kind === 'COVERAGE', JSON.stringify(j));
  j = judgeDiag(bigPool, led, Object.assign({}, gate, { unassigned: 2, unassignedVids: ['h9', 'h10'] }), ammo);
  check('judge DIAG-NO-GO unassigned (2)', j.verdict === 'DIAG-NO-GO' && j.kind === 'UNASSIGNED', JSON.stringify(j));

  // ---- craftgateHash ----
  const h1 = craftgateHash(seed1);
  const h2 = craftgateHash(JSON.parse(JSON.stringify(seed1)));
  check('craftgateHash stable on identical input', h1 === h2, h1 + ' vs ' + h2);
  const seed1b = JSON.parse(JSON.stringify(seed1));
  seed1b.gateDays[0].state = 'cooldown';
  check('craftgateHash changes when a gate row changes', craftgateHash(seed1b) !== h1, 'hash did not change');
  const seed1c = JSON.parse(JSON.stringify(seed1));
  seed1c.attempts[0].success = false;
  check('craftgateHash changes when an attempt changes', craftgateHash(seed1c) !== h1, 'hash did not change');

  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log('analyze-craftgate-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) selftest();
  let dir = null, outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!dir) { console.error('usage: analyze-craftgate-a.js --dir DIR [--out FILE] | --selftest'); process.exit(2); }
  const ammo = ammoAtEntryAll(dir);
  const ledger = ledgerStats(dir);
  const pool = emptyFighterPool(dir);
  const gate = gateDecomposition(dir, pool);
  const pile = pileStats(dir);
  const j = judgeDiag(pool, ledger, gate, ammo);
  const result = { verdict: j.verdict, kind: j.kind, bars: j.bars,
    mechanismRate: j.mechanismRate,
    ammo: ammo, ledger: ledger, pool: pool, gate: gate, pile: pile };
  console.log(JSON.stringify({ verdict: result.verdict, kind: result.kind, bars: result.bars,
    mechanismRate: result.mechanismRate,
    pool: { distinctEmpty: pool.distinctEmpty, emptyRows: pool.emptyRows, neverSupplied: pool.neverSupplied, neverSuppliedNoKit: pool.neverSuppliedNoKit, supplied: pool.supplied, repeatEmpties: pool.repeatEmpties },
    primaryCauseCounts: gate.primaryCauseCounts, primaryCauseDays: gate.primaryCauseDays,
    needingDaysByCause: gate.needingDaysByCause, needingDaysByState: gate.needingDaysByState,
    subOther: gate.subOther, noMaterialsSplit: gate.noMaterialsSplit, shortfallMats: gate.shortfallMats,
    coverage: gate.coverage, unassigned: gate.unassigned,
    attempts: { total: gate.attemptsTotal, ok: gate.attemptsOk, blind: gate.attemptsBlind, blindOk: gate.attemptsBlindOk, learned: gate.attemptsLearned, learnedOk: gate.attemptsLearnedOk },
    autoEquipGapRows: gate.autoEquipGapRows, notAwayNotHavenRows: gate.notAwayNotHavenRows,
    dutyCalls: gate.dutyCalls, dutyDays: gate.dutyDays, pileDays: gate.pileDays,
    pile: { arrowRecipeShare: pile.arrowRecipeShare, boltRecipeShare: pile.boltRecipeShare, meanPile: pile.meanPile, meanCandidates: pile.meanCandidates, meanAtHome: pile.meanAtHome, meanShort: pile.meanShort, meanMatsOk: pile.meanMatsOk, meanNoMaterials: pile.meanNoMaterials, meanCooldown: pile.meanCooldown, meanAttemptEligible: pile.meanAttemptEligible, perSeed: pile.perSeed },
    ammoRate: ammo.rate, ammoCapableRate: ammo.capableRate, ammoByOrigin: ammo.byOrigin,
    unitsAtEntryBySource: ammo.unitsAtEntryBySource,
    batchesBySource: ledger.batchesBySource, unitsBySource: ledger.unitsBySource,
    deliveredBatchesBySource: ledger.deliveredBatchesBySource,
    attributionCompleteness: ledger.attributionCompleteness,
    otherUnits: ledger.otherUnits, unattributedSpendUnits: ledger.unattributedSpendUnits }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { emptyFighterPool: emptyFighterPool, gateDecomposition: gateDecomposition,
  pileStats: pileStats, craftgateHash: craftgateHash, judgeDiag: judgeDiag,
  NEEDING_STATES: NEEDING_STATES, CAUSE_ORDER: CAUSE_ORDER,
  ammoAtEntryAll: ammoAtEntryAll, ledgerStats: ledgerStats, ledgerHash: ledgerHash };
