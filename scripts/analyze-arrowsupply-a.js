// analyze-arrowsupply-a.js — analyzer + judge, arm sim-arrowsupply-a.
// DIAG: quantify ammo supply for departing archers (finding #2594).
// Reads the arrowsupply driver corpora (perseed-arrowsupply-a-diag):
// ammoDeparts (every villagerPocketAmmo call on a ranged holder),
// ammoHomeCraft (every villagerAmmoCraftDay pass over a bow/crossbow
// carrier), ammoLoot / ammoPlayerCraft (acquisition events),
// ammoCensus + ammoPile (daily stock), ammoBaseline (day-0 stock),
// plus the bowopen launch-funnel recorder (v4encounters with
// rangedId / ammoAtEntry / volley) for the volley-loss cost.
//
// Encounter population (from analyze-bowopen-a.js legStats, reused
// verbatim): launched wave-4+ expedition meetings, joined to a gate
// row, pair-inclusive (|planParty| >= 1), party present, engaged
// (rounds > 0). The volley-loss split reads fighter ammoAtEntry
// among AMMO-BEARING ranged weapons only (spear/none excluded).
//
// Judge (frozen prereg): DIAG-GO iff (1) powered departure pool —
// >= 50 ammo-bearing-archer departures; (2) decisive answer —
// either one failure reason >= 50% of zero-ammo departures, or the
// zero-ammo rate <= 0.10; (3) powered encounter read — >= 8
// pair-inclusive engaged meetings with an ammo-bearing fighter at
// entry. Otherwise DIAG-NO-GO (names what is missing).
//
// Usage:
//   node scripts/analyze-arrowsupply-a.js --dir DIR [--out FILE] [--no-judge]
//   node scripts/analyze-arrowsupply-a.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const { legStats } = require('./analyze-bowopen-a.js');

function mean(xs) {
  if (!xs.length) return null;
  return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
}
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function isStarvation(d) {
  return /starvat/i.test(String((d && d.kind) || '')) || /starvat/i.test(String((d && d.cause) || ''));
}
function bucket(day) {
  if (day <= 30) return 'd0-30';
  if (day <= 60) return 'd31-60';
  if (day <= 100) return 'd61-100';
  return 'd101+';
}

function ammoStats(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const st = { dir: dir, n: 0, valid: 0, errors: 0,
    bowopenOn: {}, senseexpedOn: {},
    // departures
    departs: 0, archerDeparts: 0, spearDeparts: 0, zeroAmmo: 0,
    zeroAmmoRate: null,
    byWeapon: {}, // rangedId -> {n, zero}
    byOutcome: {}, // outcome -> n
    byReason: {}, // reason -> n (zero-ammo rows only)
    bySite: {}, // site -> {n, zero}
    planWave4Departs: 0, planWave4Zero: 0,
    pocketed: 0, craftedAttempts: 0, craftedOk: 0,
    // home duty
    homeRows: 0, homeAttempts: 0, homeSuccess: 0, homeReasons: {},
    // acquisition
    lootAmmo: 0, lootRanged: 0, lootByDrop: {},
    playerCraft: 0, playerCraftOk: 0,
    teleAmmoCraft: 0, // VF teleCounts cross-check (both beats)
    // census / stock
    baselineArchers: 0, baselineZero: 0, baselineZeroShare: null,
    censusRows: 0, censusArchers: 0, censusZero: 0, censusZeroShare: null,
    censusMeanAmmo: null, censusByBucket: {},
    pileMeans: {},
    // wall numbers
    days: [], medianDays: null, communityLost: 0, national: 0,
    seedWins: 0, wave4: 0, wave5: 0, scaleRanks: {},
    starvation: 0, starvationVillager: 0,
    // volley-loss cost (encounter split)
    encMeetings: 0, encArmed: 0, encZero: 0,
    encArmedDmgPerRound: null, encZeroDmgPerRound: null,
    encArmedMDealt: null, encZeroMDealt: null,
    encArmedRounds: null, encZeroRounds: null,
    encArmedOutcomes: {}, encZeroOutcomes: {},
    encArmedVolleyDmg: null, encZeroVolleyDmg: null,
    encZeroVolleyLost: 0, // zero-ammo meetings with volley null/0 shots
    encMatchedSeeds: 0, // seeds holding both a zero and an armed meeting
    encDetail: [] };
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  const censusAmmo = [];
  const pileSums = { stick: 0, stone: 0, fiber: 0, vine: 0, wood: 0, branch: 0 };
  let pileN = 0;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { st.errors++; continue; }
    st.n++;
    if (!d || typeof d !== 'object') { st.errors++; continue; }
    st.valid++;
    st.errors += ((d.instrumentErrors || []).length);
    if (d.bowopenOn != null) st.bowopenOn[String(d.bowopenOn)] = (st.bowopenOn[String(d.bowopenOn)] || 0) + 1;
    if (d.senseexpedOn != null) st.senseexpedOn[String(d.senseexpedOn)] = (st.senseexpedOn[String(d.senseexpedOn)] || 0) + 1;
    st.days.push(d.days != null ? d.days : (d.gameDays != null ? d.gameDays : 0));
    if ((RANK_ORDER[d.scaleRank] || 0) >= 2) st.national++;
    if (d.won) st.seedWins++;
    if ((d.maxWave | 0) >= 4) st.wave4++;
    if ((d.maxWave | 0) >= 5) st.wave5++;
    if (['village-lost', 'village-dead', 'pop-zero'].includes(d.endReason)) st.communityLost++;
    st.scaleRanks[d.scaleRank || '?'] = (st.scaleRanks[d.scaleRank || '?'] || 0) + 1;
    for (const death of (d.deaths || [])) {
      if (isStarvation(death)) { st.starvation++; if (!death.player) st.starvationVillager++; }
    }
    // VF tele cross-check: ammo_craft tele count (both beats emit it).
    try { st.teleAmmoCraft += ((d.teleCounts || {})['ammo_craft'] | 0); } catch (e) {}
    // ---- baseline (day 0) ----
    if (d.ammoBaseline && Array.isArray(d.ammoBaseline.census)) {
      for (const row of d.ammoBaseline.census) {
        if (!row.ammoId) continue;
        st.baselineArchers++;
        if ((row.ammo | 0) === 0) st.baselineZero++;
      }
    }
    // ---- departures ----
    for (const r of (d.ammoDeparts || [])) {
      st.departs++;
      st.byOutcome[r.outcome || '?'] = (st.byOutcome[r.outcome || '?'] || 0) + 1;
      if (!r.ammoId) { st.spearDeparts++; continue; } // spear / no-ammo weapon
      st.archerDeparts++;
      if (!st.byWeapon[r.rangedId]) st.byWeapon[r.rangedId] = { n: 0, zero: 0 };
      st.byWeapon[r.rangedId].n++;
      if (!st.bySite[r.site || 'other']) st.bySite[r.site || 'other'] = { n: 0, zero: 0 };
      st.bySite[r.site || 'other'].n++;
      if (r.planWave4) st.planWave4Departs++;
      st.pocketed += (r.pocketed | 0);
      st.craftedAttempts += (r.crafted | 0);
      if (r.craftedOk) st.craftedOk++;
      if ((r.carriedAfter | 0) === 0) {
        st.zeroAmmo++;
        st.byWeapon[r.rangedId].zero++;
        st.bySite[r.site || 'other'].zero++;
        if (r.planWave4) st.planWave4Zero++;
        if (r.reason) st.byReason[r.reason] = (st.byReason[r.reason] || 0) + 1;
      }
    }
    // ---- home duty ----
    for (const r of (d.ammoHomeCraft || [])) {
      st.homeRows++;
      if (r.attempted) st.homeAttempts++;
      if (r.success) st.homeSuccess++;
      if (r.reason) st.homeReasons[r.reason] = (st.homeReasons[r.reason] || 0) + 1;
    }
    // ---- acquisition ----
    for (const r of (d.ammoLoot || [])) {
      if (r.kind === 'ammo') st.lootAmmo++;
      else st.lootRanged++;
      st.lootByDrop[r.dropId || '?'] = (st.lootByDrop[r.dropId || '?'] || 0) + 1;
    }
    for (const r of (d.ammoPlayerCraft || [])) {
      st.playerCraft++;
      if (r.ok) st.playerCraftOk++;
    }
    // ---- census / pile ----
    for (const r of (d.ammoCensus || [])) {
      st.censusRows++;
      if (!r.ammoId) continue;
      st.censusArchers++;
      censusAmmo.push(r.ammo | 0);
      if ((r.ammo | 0) === 0) st.censusZero++;
      const b = bucket(r.day | 0);
      if (!st.censusByBucket[b]) st.censusByBucket[b] = { archers: 0, zero: 0, ammoSum: 0 };
      st.censusByBucket[b].archers++;
      if ((r.ammo | 0) === 0) st.censusByBucket[b].zero++;
      st.censusByBucket[b].ammoSum += (r.ammo | 0);
    }
    for (const p of (d.ammoPile || [])) {
      pileN++;
      for (const k of Object.keys(pileSums)) pileSums[k] += (p[k] || 0);
    }
  }
  st.zeroAmmoRate = st.archerDeparts ? st.zeroAmmo / st.archerDeparts : null;
  st.baselineZeroShare = st.baselineArchers ? st.baselineZero / st.baselineArchers : null;
  st.censusZeroShare = st.censusArchers ? st.censusZero / st.censusArchers : null;
  st.censusMeanAmmo = mean(censusAmmo);
  for (const b of Object.keys(st.censusByBucket)) {
    const x = st.censusByBucket[b];
    x.zeroShare = x.archers ? x.zero / x.archers : null;
    x.meanAmmo = x.archers ? x.ammoSum / x.archers : null;
  }
  for (const k of Object.keys(pileSums)) st.pileMeans[k] = pileN ? pileSums[k] / pileN : null;
  st.medianDays = median(st.days);
  // ---- volley-loss cost (encounter split, bowopen population) ----
  const pair = legStats(dir, { minPlanParty: 1 });
  st.encMeetings = pair.meetings;
  const armedDpr = [], zeroDpr = [], armedDealt = [], zeroDealt = [],
    armedRounds = [], zeroRounds = [], armedVolley = [], zeroVolley = [];
  const seedsWithZero = new Set(), seedsWithArmed = new Set();
  for (const m of (pair.meetingsDetail || [])) {
    if (!m.rangedId) continue; // no ranged weapon at entry — not the question
    // Ammo-bearing check: the ranged def carries weapon.ammo. The
    // corpus does not carry the def, so infer from the weapon id:
    // spears (hunting_spear / fire_hardened_spear) are the only
    // ranged-slot weapons without ammo.
    const isSpear = /spear/i.test(m.rangedId);
    if (isSpear) continue;
    const zero = (m.ammoAtEntry | 0) === 0;
    if (zero) { st.encZero++; seedsWithZero.add(m.seed); } else { st.encArmed++; seedsWithArmed.add(m.seed); }
    const out = m.outcome || '?';
    if (zero) st.encZeroOutcomes[out] = (st.encZeroOutcomes[out] || 0) + 1;
    else st.encArmedOutcomes[out] = (st.encArmedOutcomes[out] || 0) + 1;
    if (m.dmgPerRound != null) (zero ? zeroDpr : armedDpr).push(m.dmgPerRound);
    if (m.mDealt != null) (zero ? zeroDealt : armedDealt).push(m.mDealt);
    if (m.rounds != null) (zero ? zeroRounds : armedRounds).push(m.rounds);
    const volDmg = (m.volley && typeof m.volley.dmg === 'number') ? m.volley.dmg : 0;
    const volShots = (m.volley && typeof m.volley.shots === 'number') ? m.volley.shots : 0;
    (zero ? zeroVolley : armedVolley).push(volDmg);
    if (zero && volShots === 0) st.encZeroVolleyLost++;
    st.encDetail.push({ seed: m.seed, day: m.day, vid: m.vid, mid: m.mid,
      rangedId: m.rangedId, ammoAtEntry: m.ammoAtEntry, zero: zero,
      outcome: out, rounds: m.rounds, mDealt: m.mDealt,
      dmgPerRound: m.dmgPerRound, volley: m.volley });
  }
  st.encArmedDmgPerRound = mean(armedDpr);
  st.encZeroDmgPerRound = mean(zeroDpr);
  st.encArmedMDealt = mean(armedDealt);
  st.encZeroMDealt = mean(zeroDealt);
  st.encArmedRounds = mean(armedRounds);
  st.encZeroRounds = mean(zeroRounds);
  st.encArmedVolleyDmg = mean(armedVolley);
  st.encZeroVolleyDmg = mean(zeroVolley);
  for (const s of seedsWithZero) if (seedsWithArmed.has(s)) st.encMatchedSeeds++;
  return st;
}

function judge(st) {
  // Frozen bars (prereg): (1) pool >= 50 archer departures;
  // (2) decisive — one reason >= 50% of zero-ammo departures OR
  // zero-ammo rate <= 0.10; (3) encounter read >= 8 meetings with
  // an ammo-bearing fighter at entry.
  const bars = [];
  const poolOk = st.archerDeparts >= 50;
  bars.push({ id: 'pool-departures', pass: poolOk,
    detail: 'ammo-bearing-archer departures ' + st.archerDeparts + ' (floor 50); all ranged-holder departures ' + st.departs + ', spear ' + st.spearDeparts });
  let dominant = null, dominantShare = null;
  for (const r of Object.keys(st.byReason)) {
    const share = st.zeroAmmo ? st.byReason[r] / st.zeroAmmo : 0;
    if (dominantShare == null || share > dominantShare) { dominant = r; dominantShare = share; }
  }
  const rateLow = st.zeroAmmoRate != null && st.zeroAmmoRate <= 0.10;
  const domOk = dominantShare != null && dominantShare >= 0.50;
  const decisiveOk = domOk || rateLow;
  bars.push({ id: 'decisive-answer', pass: decisiveOk,
    detail: 'zero-ammo ' + st.zeroAmmo + '/' + st.archerDeparts + ' (rate ' + (st.zeroAmmoRate == null ? 'n/a' : st.zeroAmmoRate.toFixed(3)) + '); dominant reason ' + (dominant || 'none') + ' ' + (dominantShare == null ? 'n/a' : (dominantShare * 100).toFixed(0) + '%') + ' (bar >=50% or rate <=0.10); reasons ' + JSON.stringify(st.byReason) });
  const encN = st.encArmed + st.encZero;
  const encOk = encN >= 8;
  bars.push({ id: 'encounter-read', pass: encOk,
    detail: 'pair-inclusive engaged meetings with an ammo-bearing fighter ' + encN + ' (armed ' + st.encArmed + ', zero-ammo ' + st.encZero + ', floor 8); matched seeds (both kinds) ' + st.encMatchedSeeds });
  const mechOk = (st.craftedAttempts + st.homeAttempts) > 0 || st.teleAmmoCraft > 0;
  bars.push({ id: 'instrument-craft-seen', pass: mechOk,
    detail: 'departure craft attempts ' + st.craftedAttempts + ' (ok ' + st.craftedOk + '), home-duty attempts ' + st.homeAttempts + ' (ok ' + st.homeSuccess + '), tele ammo_craft ' + st.teleAmmoCraft + ' — cross-check, not a verdict bar' });
  const verdict = (poolOk && decisiveOk && encOk) ? 'DIAG-GO' : 'DIAG-NO-GO';
  return { verdict: verdict, bars: bars };
}

function summarize(st) {
  const o = {};
  for (const k of ['dir', 'n', 'valid', 'errors', 'bowopenOn', 'senseexpedOn',
    'departs', 'archerDeparts', 'spearDeparts', 'zeroAmmo', 'zeroAmmoRate',
    'byWeapon', 'byOutcome', 'byReason', 'bySite',
    'planWave4Departs', 'planWave4Zero',
    'pocketed', 'craftedAttempts', 'craftedOk',
    'homeRows', 'homeAttempts', 'homeSuccess', 'homeReasons',
    'lootAmmo', 'lootRanged', 'lootByDrop',
    'playerCraft', 'playerCraftOk', 'teleAmmoCraft',
    'baselineArchers', 'baselineZero', 'baselineZeroShare',
    'censusRows', 'censusArchers', 'censusZero', 'censusZeroShare',
    'censusMeanAmmo', 'censusByBucket', 'pileMeans',
    'medianDays', 'communityLost', 'national', 'seedWins', 'wave4', 'wave5', 'scaleRanks',
    'starvation', 'starvationVillager',
    'encMeetings', 'encArmed', 'encZero',
    'encArmedDmgPerRound', 'encZeroDmgPerRound',
    'encArmedMDealt', 'encZeroMDealt',
    'encArmedRounds', 'encZeroRounds',
    'encArmedOutcomes', 'encZeroOutcomes',
    'encArmedVolleyDmg', 'encZeroVolleyDmg',
    'encZeroVolleyLost', 'encMatchedSeeds']) o[k] = st[k];
  return o;
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) passed++;
    else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'as-analyze-'));
  const dir = path.join(tmp, 'leg');
  fs.mkdirSync(dir);
  function mkSeed(o) {
    return Object.assign({ seed: 1, days: 150, gameDays: 150, scaleRank: 'regional', won: false,
      maxWave: 4, endReason: 'survived', instrumentErrors: [], bowopenOn: false, senseexpedOn: true,
      deaths: [], teleCounts: { ammo_craft: 3 },
      daily: [{ day: 1, roster: [{ vid: 'h1', name: 'Holly One' }, { vid: 'c1', name: 'Cora A' }, { vid: 'c2', name: 'Cid B' }] }],
      samples: { villagers: [[1, [{ vid: 'h1', abilities: ['rage'] }, { vid: 'c1', abilities: [] }, { vid: 'c2', abilities: [] }]]] },
      v4departs: [], v4gates: [], v4encounters: [],
      ammoDeparts: [], ammoHomeCraft: [], ammoLoot: [], ammoPlayerCraft: [],
      ammoCensus: [], ammoPile: [], ammoBaseline: null }, o);
  }
  const seed = mkSeed({
    ammoBaseline: { day: 0, census: [
      { vid: 'h1', rangedId: 'bow', ammoId: 'arrow', ammo: 5, stashAmmo: 0, away: false, exped: false },
      { vid: 'c1', rangedId: 'crossbow', ammoId: 'bolt', ammo: 0, stashAmmo: 0, away: false, exped: false },
      { vid: 'c2', rangedId: null, ammoId: null, ammo: 0, stashAmmo: 0, away: false, exped: false },
    ], pile: { stick: 10, stone: 10, fiber: 5, vine: 5, wood: 5, branch: 5 } },
    ammoDeparts: [
      { day: 10, vid: 'h1', site: 'expedition', planWave4: true, rangedId: 'bow', ammoId: 'arrow', carriedBefore: 0, carriedAfter: 5, stashBefore: 0, pocketed: 0, crafted: 1, craftedOk: true, outcome: 'craft-ok', reason: null },
      { day: 11, vid: 'h1', site: 'expedition', planWave4: true, rangedId: 'bow', ammoId: 'arrow', carriedBefore: 0, carriedAfter: 0, stashBefore: 0, pocketed: 0, crafted: 1, craftedOk: false, outcome: 'craft-failed', reason: 'craft-failed' },
      { day: 12, vid: 'c1', site: 'patrol', planWave4: false, rangedId: 'crossbow', ammoId: 'bolt', carriedBefore: 0, carriedAfter: 0, stashBefore: 0, pocketed: 0, crafted: 0, craftedOk: false, outcome: 'no-materials', reason: 'no-materials' },
      { day: 13, vid: 'c2', site: 'expedition', planWave4: false, rangedId: 'searcaster', ammoId: 'fusion_cell', carriedBefore: 0, carriedAfter: 0, stashBefore: 0, pocketed: 0, crafted: 0, craftedOk: false, outcome: 'no-source-kind', reason: 'no-source-kind' },
      { day: 14, vid: 'h1', site: 'expedition', planWave4: true, rangedId: 'hunting_spear', ammoId: null, carriedBefore: 0, carriedAfter: 0, stashBefore: 0, pocketed: 0, crafted: 0, craftedOk: false, outcome: 'spear-no-ammo', reason: 'spear-no-ammo' },
      { day: 15, vid: 'h1', site: 'expedition', planWave4: true, rangedId: 'bow', ammoId: 'arrow', carriedBefore: 3, carriedAfter: 3, stashBefore: 0, pocketed: 0, crafted: 0, craftedOk: false, outcome: 'already-had', reason: null },
    ],
    ammoHomeCraft: [
      { day: 10, vid: 'h1', rangedId: 'bow', ammoId: 'arrow', carriedBefore: 0, carriedAfter: 5, attempted: true, success: true, reason: null },
      { day: 11, vid: 'h1', rangedId: 'bow', ammoId: 'arrow', carriedBefore: 0, carriedAfter: 0, attempted: true, success: false, reason: 'craft-failed' },
      { day: 12, vid: 'c1', rangedId: 'crossbow', ammoId: 'bolt', carriedBefore: 0, carriedAfter: 0, attempted: false, success: false, reason: 'cooldown' },
      { day: 13, vid: 'c1', rangedId: 'crossbow', ammoId: 'bolt', carriedBefore: 0, carriedAfter: 0, attempted: false, success: false, reason: 'no-materials' },
    ],
    ammoLoot: [
      { day: 20, vid: 'h1', mid: 'eulogy', dropId: 'arrow', kind: 'ammo' },
      { day: 21, vid: 'h1', mid: 'audit', dropId: 'bow', kind: 'ranged' },
    ],
    ammoPlayerCraft: [{ day: 22, vid: 'p', recipeId: 'arrow', ok: true }],
    ammoCensus: [
      { day: 10, vid: 'h1', rangedId: 'bow', ammoId: 'arrow', ammo: 5, stashAmmo: 0, away: false, exped: true },
      { day: 10, vid: 'c1', rangedId: 'crossbow', ammoId: 'bolt', ammo: 0, stashAmmo: 0, away: false, exped: false },
      { day: 40, vid: 'h1', rangedId: 'bow', ammoId: 'arrow', ammo: 2, stashAmmo: 0, away: false, exped: false },
    ],
    ammoPile: [
      { day: 10, stick: 10, stone: 10, fiber: 5, vine: 5, wood: 5, branch: 5 },
      { day: 40, stick: 4, stone: 8, fiber: 2, vine: 5, wood: 5, branch: 5 },
    ],
    v4gates: [
      { day: 20, vid: 'h1', mid: 'audit', planParty: ['c1', 'c2'], sensed: ['h1', 'c1', 'c2'], result: 'null', reason: null, allArmed: true, allArmored: true, gear: { h1: { armed: true, armored: true, armorP: 30 }, c1: { armed: true, armored: true, armorP: 20 }, c2: { armed: true, armored: true, armorP: 10 } } },
      { day: 21, vid: 'h1', mid: 'audit', planParty: ['c1', 'c2'], sensed: ['h1', 'c1', 'c2'], result: 'null', reason: null, allArmed: true, allArmored: true, gear: { h1: { armed: true, armored: true, armorP: 30 }, c1: { armed: true, armored: true, armorP: 20 }, c2: { armed: true, armored: true, armorP: 10 } } },
    ],
    v4encounters: [
      // armed bow fighter: volley fires, flee after 6 rounds, 240 dealt
      { day: 20, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', allyVids: ['c1', 'c2'], allyVid: 'c1', ally2Vid: 'c2', outcome: 'vFlee', rounds: 6, mDealt: 240, mHpStart: 1000, vTaken: 100, rangedId: 'bow', ammoAtEntry: 5, volley: { shots: 3, hits: 2, dmg: 34, ammoLeft: 2 }, log: [] },
      // zero-ammo bow fighter: no volley, flee after 6 rounds, 210 dealt
      { day: 21, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', allyVids: ['c1', 'c2'], allyVid: 'c1', ally2Vid: 'c2', outcome: 'vFlee', rounds: 6, mDealt: 210, mHpStart: 1000, vTaken: 100, rangedId: 'bow', ammoAtEntry: 0, volley: null, log: [] },
    ],
  });
  fs.writeFileSync(path.join(dir, 's1.json'), JSON.stringify(seed));
  const st = ammoStats(dir);
  check('archer departures 5 (spear excluded)', st.archerDeparts === 5, 'got ' + st.archerDeparts);
  check('spear departures 1', st.spearDeparts === 1, 'got ' + st.spearDeparts);
  check('zero-ammo 3/5 (rate 0.6)', st.zeroAmmo === 3 && Math.abs(st.zeroAmmoRate - 0.6) < 1e-9, JSON.stringify({ z: st.zeroAmmo, r: st.zeroAmmoRate }));
  check('byWeapon bow 3 (1 zero), crossbow 1 (1 zero), searcaster 1 (1 zero)', st.byWeapon.bow.n === 3 && st.byWeapon.bow.zero === 1 && st.byWeapon.crossbow.zero === 1 && st.byWeapon.searcaster.zero === 1, JSON.stringify(st.byWeapon));
  check('reasons: craft-failed 1, no-materials 1, no-source-kind 1', st.byReason['craft-failed'] === 1 && st.byReason['no-materials'] === 1 && st.byReason['no-source-kind'] === 1, JSON.stringify(st.byReason));
  check('craft attempts 2, ok 1', st.craftedAttempts === 2 && st.craftedOk === 1, JSON.stringify({ a: st.craftedAttempts, ok: st.craftedOk }));
  check('planWave4 departures 3, zero 1', st.planWave4Departs === 3 && st.planWave4Zero === 1, JSON.stringify({ d: st.planWave4Departs, z: st.planWave4Zero }));
  check('home duty: rows 4, attempts 2, success 1', st.homeRows === 4 && st.homeAttempts === 2 && st.homeSuccess === 1, JSON.stringify({ r: st.homeRows, a: st.homeAttempts, s: st.homeSuccess }));
  check('home reasons: craft-failed 1, cooldown 1, no-materials 1', st.homeReasons['craft-failed'] === 1 && st.homeReasons.cooldown === 1 && st.homeReasons['no-materials'] === 1, JSON.stringify(st.homeReasons));
  check('loot: ammo 1, ranged 1', st.lootAmmo === 1 && st.lootRanged === 1, JSON.stringify({ a: st.lootAmmo, r: st.lootRanged }));
  check('player craft 1 ok', st.playerCraft === 1 && st.playerCraftOk === 1, JSON.stringify({ n: st.playerCraft, ok: st.playerCraftOk }));
  check('tele cross-check 3', st.teleAmmoCraft === 3, 'got ' + st.teleAmmoCraft);
  check('baseline: 2 archers, 1 zero (share 0.5)', st.baselineArchers === 2 && st.baselineZero === 1 && Math.abs(st.baselineZeroShare - 0.5) < 1e-9, JSON.stringify({ a: st.baselineArchers, z: st.baselineZero }));
  check('census: 3 archers, 1 zero, mean ammo 7/3', st.censusArchers === 3 && st.censusZero === 1 && Math.abs(st.censusMeanAmmo - 7 / 3) < 1e-9, JSON.stringify({ a: st.censusArchers, z: st.censusZero, m: st.censusMeanAmmo }));
  check('census bucket d0-30: 2 archers, 1 zero, mean 2.5', st.censusByBucket['d0-30'].archers === 2 && st.censusByBucket['d0-30'].zero === 1 && Math.abs(st.censusByBucket['d0-30'].meanAmmo - 2.5) < 1e-9, JSON.stringify(st.censusByBucket['d0-30']));
  check('pile means: stick 7, fiber 3.5', Math.abs(st.pileMeans.stick - 7) < 1e-9 && Math.abs(st.pileMeans.fiber - 3.5) < 1e-9, JSON.stringify(st.pileMeans));
  check('encounter split: armed 1, zero 1', st.encArmed === 1 && st.encZero === 1, JSON.stringify({ a: st.encArmed, z: st.encZero }));
  check('volley-loss: zero meeting lost the volley (1), armed volley 34', st.encZeroVolleyLost === 1 && Math.abs(st.encArmedVolleyDmg - 34) < 1e-9 && st.encZeroVolleyDmg === 0, JSON.stringify({ l: st.encZeroVolleyLost, a: st.encArmedVolleyDmg, z: st.encZeroVolleyDmg }));
  check('damage/round: armed 40, zero 35', Math.abs(st.encArmedDmgPerRound - 40) < 1e-9 && Math.abs(st.encZeroDmgPerRound - 35) < 1e-9, JSON.stringify({ a: st.encArmedDmgPerRound, z: st.encZeroDmgPerRound }));
  check('mDealt: armed 240, zero 210', st.encArmedMDealt === 240 && st.encZeroMDealt === 210, JSON.stringify({ a: st.encArmedMDealt, z: st.encZeroMDealt }));
  check('matched seeds 1 (same seed holds both kinds)', st.encMatchedSeeds === 1, 'got ' + st.encMatchedSeeds);
  check('bowopenOn false recorded, senseexpedOn true recorded', st.bowopenOn['false'] === 1 && st.senseexpedOn['true'] === 1, JSON.stringify({ b: st.bowopenOn, s: st.senseexpedOn }));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  // Judge shapes (bars: 0 pool, 1 decisive, 2 encounter, 3 instrument).
  function mk(o) {
    return Object.assign({ archerDeparts: 60, departs: 80, spearDeparts: 5, zeroAmmo: 30, zeroAmmoRate: 0.5,
      byReason: { 'craft-failed': 20, 'no-materials': 10 },
      encArmed: 6, encZero: 4, encMatchedSeeds: 2,
      craftedAttempts: 10, craftedOk: 4, homeAttempts: 5, homeSuccess: 2, teleAmmoCraft: 15 }, o);
  }
  let j = judge(mk({}));
  check('judge DIAG-GO dominant cause (craft-failed 20/30 = 67%)', j.verdict === 'DIAG-GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judge(mk({ zeroAmmo: 5, zeroAmmoRate: 5 / 60, byReason: { 'craft-failed': 2, 'no-materials': 2, 'no-source-kind': 1 } }));
  check('judge DIAG-GO rare rate (5/60 = 0.083, max reason 40% < 50%)', j.verdict === 'DIAG-GO', JSON.stringify(j.bars));
  j = judge(mk({ archerDeparts: 40, zeroAmmo: 20, zeroAmmoRate: 0.5 }));
  check('judge DIAG-NO-GO thin departure pool (<50)', j.verdict === 'DIAG-NO-GO' && !j.bars[0].pass, JSON.stringify(j.bars));
  j = judge(mk({ zeroAmmo: 30, zeroAmmoRate: 0.5, byReason: { 'craft-failed': 10, 'no-materials': 10, 'no-source-kind': 10 } }));
  check('judge DIAG-NO-GO fragmented reasons (no reason >= 50%)', j.verdict === 'DIAG-NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(mk({ encArmed: 3, encZero: 2 }));
  check('judge DIAG-NO-GO thin encounter read (<8)', j.verdict === 'DIAG-NO-GO' && !j.bars[2].pass, JSON.stringify(j.bars));
  j = judge(mk({ craftedAttempts: 0, homeAttempts: 0, teleAmmoCraft: 0 }));
  check('judge instrument bar fails when no craft ever seen (verdict still GO — instrument is not a verdict bar)', j.bars[3].pass === false && j.verdict === 'DIAG-GO', JSON.stringify(j));
  console.log('analyze-arrowsupply-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) selftest();
  let dir = null, outFile = null;
  const noJudge = args.indexOf('--no-judge') !== -1;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!dir) { console.error('usage: analyze-arrowsupply-a.js --dir DIR [--out FILE] [--no-judge] | --selftest'); process.exit(2); }
  const st = ammoStats(dir);
  const j = noJudge ? null : judge(st);
  const result = { verdict: j ? j.verdict : null, bars: j ? j.bars : null,
    diag: summarize(st), encDetail: st.encDetail };
  console.log(JSON.stringify({ verdict: result.verdict, bars: result.bars, diag: summarize(st) }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { ammoStats: ammoStats, judge: judge, bucket: bucket };
