// analyze-slingstone-a.js — analyzer + judge, arm sim-slingstone-a.
// DIAG: trace what drains carried sling stones between departures
// (finding #2600). Reads the slingstone driver corpora
// (perseed-slingstone-a-diag): the per-villager stone ledger —
// ammoDeparts (departure top-ups), stoneFights (all-wave volley
// spends for sling carriers), stoneDutyTakes (weapon/ammo/armor/
// gear duty pre/post deltas), stoneLoot, stoneDeaths (carried stone
// at death), ammoCensus + ammoBaseline (ledger anchors), ammoPile.
//
// Ledger (frozen prereg): per (vid, interval) between consecutive
// census rows of the same living sling/phase_sling carrier:
//   O = carried stone at the earlier census; C = carried at the later.
//   I = recorded inflows in (prevDay, day] (departure pocketed stones,
//     loot gains, duty gains); X = recorded outflows (volley shots,
//     duty takes, gear/gift takes).
//   P = O + I - X; R = P - C (R > 0 unexplained drain, R < 0
//     unexplained gain). Total drain D = sum(X + max(0, R)) over
//     alive-intervals + sum death-carried. Completeness =
//     1 - sum(max(0, R)) / D.
// Death interval: the closing balance is the stoneDeaths row's
// directly measured carriedStone. Weapon-switch: a carrier whose
// next census row holds another weapon carries their stones out of
// the ledger (counted as switchOut, NOT a drain). Vanished: a
// carrier whose census sequence ends with no death record and no
// later row — their last-known stones are residual drain.
//
// Judge (frozen prereg): DIAG-GO iff (1) completeness >= 0.90;
// (2) departure pool >= 15 stone-carrying sling/phase_sling
// departures; (3) drain pool >= 25 census-intervals with a positive
// net stone drain; (4) the split is fully quantified — volley and
// craft shares both measured numbers (0 counts when the wraps prove
// liveness) with the residual stated. The split names a majority
// cause (one category >= 50% of D) OR states both named candidates'
// measured shares with the residual unexplained.
// Otherwise DIAG-NO-GO (names what is missing).
//
// Usage:
//   node scripts/analyze-slingstone-a.js --dir DIR [--out FILE] [--no-judge]
//   node scripts/analyze-slingstone-a.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');

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
const SLING_IDS = { sling: true, phase_sling: true };
const CRAFT_DUTIES = { weaponCraft: true, ammoCraft: true, armorCraft: true };

// ledgerSeed(d): the per-villager stone ledger for one corpus file.
// Returns the interval rows plus per-seed aggregates. Pure.
function ledgerSeed(d) {
  const out = { intervals: [], deaths: [], switches: [], vanished: [],
    volleyShots: 0, volleyFights: 0, volleyNull: 0, volleyXcheckBad: 0,
    craftTake: 0, craftTakeByDuty: {}, gearTake: 0,
    deathCarried: 0, residualDrain: 0, residualGain: 0,
    inflowTotal: 0, outflowRecorded: 0, drainTotal: 0,
    drainIntervals: 0, switchOut: 0, vanishedStones: 0,
    departuresStone: 0, pocketedStone: 0 };
  // Census rows per vid: baseline anchors first, then daily rows.
  // Keep EVERY row (sling and non-sling) so weapon-switches are seen.
  const byVid = {};
  function addRow(day, vid, rangedId, ammo) {
    if (!byVid[vid]) byVid[vid] = [];
    byVid[vid].push({ day: day, rangedId: rangedId || null, ammo: ammo | 0 });
  }
  if (d.ammoBaseline && Array.isArray(d.ammoBaseline.census)) {
    for (const row of d.ammoBaseline.census) addRow(d.ammoBaseline.day | 0, row.vid, row.rangedId, row.ammo);
  }
  for (const row of (d.ammoCensus || [])) addRow(row.day | 0, row.vid, row.rangedId, row.ammo);
  // Events per vid, sorted by day.
  function eventsIn(list, vid, prevDay, day) {
    const outList = [];
    for (const e of (list || [])) {
      if (e.vid !== vid) continue;
      const ed = e.day | 0;
      if (ed > prevDay && ed <= day) outList.push(e);
    }
    return outList;
  }
  // Death rows per vid (directly measured carried stone).
  const deathsByVid = {};
  for (const r of (d.stoneDeaths || [])) {
    if (!deathsByVid[r.vid]) deathsByVid[r.vid] = [];
    deathsByVid[r.vid].push(r);
  }
  const endDay = (d.days != null ? d.days : (d.gameDays != null ? d.gameDays : 0)) | 0;
  // The last census day in the corpus: a carrier whose sequence ends
  // ON this day was alive when the seed ended — their stones are still
  // held, not drained (no terminal interval). Only a sequence ending
  // EARLIER means the carrier left the roster (death / vanished).
  let maxCensusDay = -1;
  for (const vid of Object.keys(byVid)) {
    for (const r of byVid[vid]) if (r.day > maxCensusDay) maxCensusDay = r.day;
  }
  for (const vid of Object.keys(byVid)) {
    const rows = byVid[vid].slice().sort(function (a, b) { return a.day - b.day; });
    // De-duplicate same-day rows (keep the last — one row per vid per
    // census day in practice; the baseline day can coincide).
    const dedup = [];
    for (const r of rows) {
      if (dedup.length && dedup[dedup.length - 1].day === r.day) dedup[dedup.length - 1] = r;
      else dedup.push(r);
    }
    for (let i = 0; i < dedup.length; i++) {
      const cur = dedup[i];
      if (!SLING_IDS[cur.rangedId]) continue; // not a sling carrier on this row
      const next = dedup[i + 1];
      const O = cur.ammo;
      if (!next) {
        // Sequence ends here. Alive at the seed's last census day =
        // still holding (the seed ended, not the carrier) — no drain.
        if (cur.day >= maxCensusDay) continue;
        // Otherwise: death, or vanished.
        const deathRows = (deathsByVid[vid] || []).filter(function (r) { return (r.day | 0) > cur.day; });
        if (deathRows.length) {
          const dr = deathRows[0];
          const dd = dr.day | 0;
          const inflow = sumInflows(vid, cur.day, dd);
          const outflow = sumOutflows(vid, cur.day, dd);
          const carried = dr.carriedStone | 0;
          const R = O + inflow - outflow - carried;
          out.deaths.push({ vid: vid, day: dd, open: O, inflow: inflow, outflow: outflow,
            carriedStone: carried, residual: R });
          out.deathCarried += carried;
          out.residualDrain += Math.max(0, R);
          out.residualGain += Math.max(0, -R);
          out.inflowTotal += inflow;
          out.outflowRecorded += outflow;
          out.drainTotal += outflow + Math.max(0, R) + carried;
        } else {
          // No death record and no later row: vanished. Everything
          // last-known is residual drain (window to the seed end).
          const inflow = sumInflows(vid, cur.day, endDay);
          const outflow = sumOutflows(vid, cur.day, endDay);
          const lost = O + inflow - outflow;
          out.vanished.push({ vid: vid, day: cur.day, open: O, inflow: inflow, outflow: outflow, lost: lost });
          out.vanishedStones += Math.max(0, lost);
          out.residualDrain += Math.max(0, lost);
          out.residualGain += Math.max(0, -lost);
          out.inflowTotal += inflow;
          out.outflowRecorded += outflow;
          out.drainTotal += outflow + Math.max(0, lost);
        }
        continue;
      }
      if (!SLING_IDS[next.rangedId]) {
        // Weapon-switch: the carrier's stones leave the ledger with
        // them (still in the pack, no longer counted). Not a drain.
        const inflow = sumInflows(vid, cur.day, next.day);
        const outflow = sumOutflows(vid, cur.day, next.day);
        const carried = O + inflow - outflow;
        out.switches.push({ vid: vid, day: next.day, from: cur.rangedId, to: next.rangedId,
          open: O, inflow: inflow, outflow: outflow, carriedOut: carried });
        out.switchOut += carried;
        out.inflowTotal += inflow;
        out.outflowRecorded += outflow;
        continue;
      }
      // Alive sling-to-sling interval.
      const inflow = sumInflows(vid, cur.day, next.day);
      const outflow = sumOutflows(vid, cur.day, next.day);
      const C = next.ammo;
      const R = O + inflow - outflow - C;
      const netDrain = O + inflow - C;
      out.intervals.push({ vid: vid, dayFrom: cur.day, dayTo: next.day,
        open: O, close: C, inflow: inflow, outflow: outflow, residual: R });
      out.residualDrain += Math.max(0, R);
      out.residualGain += Math.max(0, -R);
      out.inflowTotal += inflow;
      out.outflowRecorded += outflow;
      out.drainTotal += outflow + Math.max(0, R);
      if (netDrain > 0) out.drainIntervals++;
    }
  }
  function sumInflows(vid, prevDay, day) {
    let n = 0;
    for (const e of eventsIn(d.ammoDeparts, vid, prevDay, day)) {
      if (e.ammoId === 'stone') n += (e.pocketed | 0);
    }
    for (const e of eventsIn(d.stoneLoot, vid, prevDay, day)) {
      const g = (e.stoneAfter | 0) - (e.stoneBefore | 0);
      if (g > 0) n += g;
    }
    for (const e of eventsIn(d.stoneDutyTakes, vid, prevDay, day)) {
      if ((e.took | 0) < 0) n += -(e.took | 0);
    }
    return n;
  }
  function sumOutflows(vid, prevDay, day) {
    let n = 0;
    for (const e of eventsIn(d.stoneFights, vid, prevDay, day)) {
      const shots = (e.volley && typeof e.volley.shots === 'number') ? (e.volley.shots | 0) : 0;
      n += shots;
      out.volleyShots += shots;
      out.volleyFights++;
      if (!e.volley) out.volleyNull++;
      if (e.volley && e.volley.ammoLeft != null && (e.volley.ammoLeft | 0) !== (e.ammoAtEntry | 0) - shots) out.volleyXcheckBad++;
    }
    for (const e of eventsIn(d.stoneDutyTakes, vid, prevDay, day)) {
      const took = e.took | 0;
      if (took > 0) {
        n += took;
        if (CRAFT_DUTIES[e.duty]) {
          out.craftTake += took;
          out.craftTakeByDuty[e.duty] = (out.craftTakeByDuty[e.duty] || 0) + took;
        } else if (e.duty === 'gearDay') out.gearTake += took;
      }
    }
    return n;
  }
  // Departure pool: sling/phase_sling departures carrying stones after
  // pocketAmmo (carriedAfter > 0). Pocketed totals beside it.
  for (const r of (d.ammoDeparts || [])) {
    if (!SLING_IDS[r.rangedId]) continue;
    if ((r.carriedAfter | 0) > 0) out.departuresStone++;
    out.pocketedStone += (r.pocketed | 0);
  }
  return out;
}

function stoneStats(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const st = { dir: dir, n: 0, valid: 0, errors: 0,
    bowopenOn: {}, senseexpedOn: {},
    // ledger totals
    intervals: 0, drainIntervals: 0, departuresStone: 0, pocketedStone: 0,
    volleyShots: 0, volleyFights: 0, volleyNull: 0, volleyXcheckBad: 0,
    craftTake: 0, craftTakeByDuty: {}, gearTake: 0,
    deathCarried: 0, deathsN: 0, switchesN: 0, switchOut: 0,
    vanishedN: 0, vanishedStones: 0,
    residualDrain: 0, residualGain: 0,
    inflowTotal: 0, outflowRecorded: 0, drainTotal: 0,
    completeness: null,
    split: null, majorityCause: null,
    dutyCalls: { weaponCraft: 0, ammoCraft: 0, armorCraft: 0, gearDay: 0 },
    dutyTakesRows: 0, lootStoneRows: 0, deathRows: 0,
    // sling census re-check
    censusSlingDays: 0, censusSlingZero: 0, censusSlingZeroShare: null,
    censusSlingMean: null, censusByWeapon: {},
    // wall numbers
    days: [], medianDays: null, communityLost: 0, national: 0,
    seedWins: 0, wave4: 0, wave5: 0, scaleRanks: {},
    starvation: 0, starvationVillager: 0,
    // volley detail
    volleyByWave: {}, volleyByOrigin: {},
    intervalDetail: [], residualDetail: [] };
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  const slingAmmo = [];
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
    for (const k of Object.keys(st.dutyCalls)) st.dutyCalls[k] += ((d.dutyCalls || {})[k] | 0);
    st.dutyTakesRows += (d.stoneDutyTakes || []).length;
    st.lootStoneRows += (d.stoneLoot || []).length;
    st.deathRows += (d.stoneDeaths || []).length;
    // volley detail (all-wave sling fights)
    for (const r of (d.stoneFights || [])) {
      const shots = (r.volley && typeof r.volley.shots === 'number') ? (r.volley.shots | 0) : 0;
      const w = 'w' + (r.wave | 0);
      if (!st.volleyByWave[w]) st.volleyByWave[w] = { fights: 0, shots: 0, nulls: 0 };
      st.volleyByWave[w].fights++;
      st.volleyByWave[w].shots += shots;
      if (!r.volley) st.volleyByWave[w].nulls++;
      const o = r.origin || 'unclassified';
      if (!st.volleyByOrigin[o]) st.volleyByOrigin[o] = { fights: 0, shots: 0 };
      st.volleyByOrigin[o].fights++;
      st.volleyByOrigin[o].shots += shots;
    }
    // sling census re-check (all ranged census rows, sling weapons only)
    const censusRows = [];
    if (d.ammoBaseline && Array.isArray(d.ammoBaseline.census)) {
      for (const row of d.ammoBaseline.census) censusRows.push(row);
    }
    for (const row of (d.ammoCensus || [])) censusRows.push(row);
    for (const row of censusRows) {
      if (!SLING_IDS[row.rangedId]) continue;
      st.censusSlingDays++;
      slingAmmo.push(row.ammo | 0);
      if ((row.ammo | 0) === 0) st.censusSlingZero++;
      if (!st.censusByWeapon[row.rangedId]) st.censusByWeapon[row.rangedId] = { days: 0, zero: 0, ammoSum: 0 };
      const w = st.censusByWeapon[row.rangedId];
      w.days++;
      if ((row.ammo | 0) === 0) w.zero++;
      w.ammoSum += (row.ammo | 0);
    }
    // the ledger
    const lg = ledgerSeed(d);
    st.intervals += lg.intervals.length;
    st.drainIntervals += lg.drainIntervals;
    st.departuresStone += lg.departuresStone;
    st.pocketedStone += lg.pocketedStone;
    st.volleyShots += lg.volleyShots;
    st.volleyFights += lg.volleyFights;
    st.volleyNull += lg.volleyNull;
    st.volleyXcheckBad += lg.volleyXcheckBad;
    st.craftTake += lg.craftTake;
    for (const k of Object.keys(lg.craftTakeByDuty)) st.craftTakeByDuty[k] = (st.craftTakeByDuty[k] || 0) + lg.craftTakeByDuty[k];
    st.gearTake += lg.gearTake;
    st.deathCarried += lg.deathCarried;
    st.deathsN += lg.deaths.length;
    st.switchesN += lg.switches.length;
    st.switchOut += lg.switchOut;
    st.vanishedN += lg.vanished.length;
    st.vanishedStones += lg.vanishedStones;
    st.residualDrain += lg.residualDrain;
    st.residualGain += lg.residualGain;
    st.inflowTotal += lg.inflowTotal;
    st.outflowRecorded += lg.outflowRecorded;
    st.drainTotal += lg.drainTotal;
    for (const iv of lg.intervals) st.intervalDetail.push(Object.assign({ seed: d.seed }, iv));
    for (const iv of lg.intervals) if (iv.residual !== 0) st.residualDetail.push(Object.assign({ seed: d.seed }, iv));
    for (const v of lg.vanished) st.residualDetail.push(Object.assign({ seed: d.seed }, v, { kind: 'vanished' }));
    for (const dd of lg.deaths) if (dd.residual !== 0) st.residualDetail.push(Object.assign({ seed: d.seed }, dd, { kind: 'death' }));
  }
  st.censusSlingZeroShare = st.censusSlingDays ? st.censusSlingZero / st.censusSlingDays : null;
  st.censusSlingMean = mean(slingAmmo);
  for (const k of Object.keys(st.censusByWeapon)) {
    const w = st.censusByWeapon[k];
    w.zeroShare = w.days ? w.zero / w.days : null;
    w.meanAmmo = w.days ? w.ammoSum / w.days : null;
  }
  st.medianDays = median(st.days);
  st.completeness = st.drainTotal ? 1 - st.residualDrain / st.drainTotal : null;
  // Drain split (shares of D).
  const D = st.drainTotal;
  const split = {
    volley: D ? st.volleyShots / D : null,
    craft: D ? st.craftTake / D : null,
    gear: D ? st.gearTake / D : null,
    death: D ? st.deathCarried / D : null,
    residual: D ? st.residualDrain / D : null,
  };
  st.split = split;
  let maj = null, majShare = 0;
  for (const k of Object.keys(split)) {
    if (split[k] != null && split[k] > majShare) { maj = k; majShare = split[k]; }
  }
  st.majorityCause = majShare >= 0.5 ? maj : null;
  st.majorityShare = majShare;
  return st;
}

function judge(st) {
  // Frozen bars (prereg): (1) completeness >= 0.90; (2) departure
  // pool >= 15 stone-carrying sling departures; (3) drain pool >= 25
  // intervals with a positive net drain; (4) split fully quantified
  // (volley + craft shares measured, duty wraps live).
  const bars = [];
  const compOk = st.completeness != null && st.completeness >= 0.90;
  bars.push({ id: 'completeness', pass: compOk,
    detail: 'delta-attribution completeness ' + (st.completeness == null ? 'n/a' : st.completeness.toFixed(3)) + ' (bar >= 0.90); total drain D=' + st.drainTotal + ', residual drain ' + st.residualDrain + ', unexplained gains ' + st.residualGain });
  const depOk = st.departuresStone >= 15;
  bars.push({ id: 'departure-pool', pass: depOk,
    detail: 'stone-carrying sling/phase_sling departures ' + st.departuresStone + ' (floor 15); stones pocketed ' + st.pocketedStone });
  const drainOk = st.drainIntervals >= 25;
  bars.push({ id: 'drain-pool', pass: drainOk,
    detail: 'census-intervals with a positive net stone drain ' + st.drainIntervals + ' (floor 25); alive intervals ' + st.intervals + ', deaths ' + st.deathsN + ', switches ' + st.switchesN + ', vanished ' + st.vanishedN });
  const dutyLive = (st.dutyCalls.weaponCraft | 0) > 0 && (st.dutyCalls.ammoCraft | 0) > 0 &&
    (st.dutyCalls.armorCraft | 0) > 0 && (st.dutyCalls.gearDay | 0) > 0;
  const splitOk = st.split && st.split.volley != null && st.split.craft != null && dutyLive;
  const majNote = st.majorityCause
    ? ('majority cause: ' + st.majorityCause + ' ' + (st.majorityShare * 100).toFixed(0) + '%')
    : ('no majority cause; volley ' + (st.split.volley == null ? 'n/a' : (st.split.volley * 100).toFixed(1) + '%') +
      ' vs craft ' + (st.split.craft == null ? 'n/a' : (st.split.craft * 100).toFixed(1) + '%') +
      ', residual ' + (st.split.residual == null ? 'n/a' : (st.split.residual * 100).toFixed(1) + '%'));
  bars.push({ id: 'split-quantified', pass: splitOk,
    detail: 'volley ' + (st.split.volley == null ? 'n/a' : st.split.volley.toFixed(3)) +
      ', craft ' + (st.split.craft == null ? 'n/a' : st.split.craft.toFixed(3)) +
      ', gear ' + (st.split.gear == null ? 'n/a' : st.split.gear.toFixed(3)) +
      ', death ' + (st.split.death == null ? 'n/a' : st.split.death.toFixed(3)) +
      ', residual ' + (st.split.residual == null ? 'n/a' : st.split.residual.toFixed(3)) +
      '; duty wraps live: ' + JSON.stringify(st.dutyCalls) + ' — ' + majNote });
  const xcheckOk = st.volleyXcheckBad === 0;
  bars.push({ id: 'instrument-volley-xcheck', pass: xcheckOk,
    detail: 'volley rows where ammoLeft != ammoAtEntry - shots: ' + st.volleyXcheckBad + ' of ' + st.volleyFights + ' sling fights (cross-check, not a verdict bar)' });
  const verdict = (compOk && depOk && drainOk && splitOk) ? 'DIAG-GO' : 'DIAG-NO-GO';
  return { verdict: verdict, bars: bars };
}

function summarize(st) {
  const o = {};
  for (const k of ['dir', 'n', 'valid', 'errors', 'bowopenOn', 'senseexpedOn',
    'intervals', 'drainIntervals', 'departuresStone', 'pocketedStone',
    'volleyShots', 'volleyFights', 'volleyNull', 'volleyXcheckBad',
    'craftTake', 'craftTakeByDuty', 'gearTake',
    'deathCarried', 'deathsN', 'switchesN', 'switchOut',
    'vanishedN', 'vanishedStones',
    'residualDrain', 'residualGain',
    'inflowTotal', 'outflowRecorded', 'drainTotal',
    'completeness', 'split', 'majorityCause', 'majorityShare',
    'dutyCalls', 'dutyTakesRows', 'lootStoneRows', 'deathRows',
    'censusSlingDays', 'censusSlingZero', 'censusSlingZeroShare',
    'censusSlingMean', 'censusByWeapon',
    'medianDays', 'communityLost', 'national', 'seedWins', 'wave4', 'wave5', 'scaleRanks',
    'starvation', 'starvationVillager',
    'volleyByWave', 'volleyByOrigin']) o[k] = st[k];
  return o;
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) passed++;
    else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ss-analyze-'));
  const dir = path.join(tmp, 'leg');
  fs.mkdirSync(dir);
  // Fixture seed: one sling carrier 's1' with a clean volley-drain
  // ledger, one phase_sling carrier 's2' drained by a weapon-craft
  // take, one carrier 's3' who dies carrying stones, one carrier
  // 's4' who switches to a bow (stones leave the ledger, not a
  // drain), one carrier 's5' who vanishes (residual), plus an
  // unexplained-gain interval on s1.
  function mkSeed(o) {
    return Object.assign({ seed: 1, days: 150, gameDays: 150, scaleRank: 'regional', won: false,
      maxWave: 4, endReason: 'survived', instrumentErrors: [], bowopenOn: false, senseexpedOn: true,
      deaths: [], teleCounts: {},
      dutyCalls: { weaponCraft: 150, ammoCraft: 150, armorCraft: 150, gearDay: 150 },
      ammoDeparts: [], stoneFights: [], stoneDutyTakes: [], stoneLoot: [], stoneDeaths: [],
      ammoCensus: [], ammoPile: [], ammoBaseline: null }, o);
  }
  const seed = mkSeed({
    ammoBaseline: { day: 0, census: [
      { vid: 's1', rangedId: 'sling', ammoId: 'stone', ammo: 0, stashAmmo: 0, away: false, exped: false },
      { vid: 's2', rangedId: 'phase_sling', ammoId: 'stone', ammo: 0, stashAmmo: 0, away: false, exped: false },
      { vid: 's3', rangedId: 'sling', ammoId: 'stone', ammo: 0, stashAmmo: 0, away: false, exped: false },
      { vid: 's4', rangedId: 'sling', ammoId: 'stone', ammo: 0, stashAmmo: 0, away: false, exped: false },
      { vid: 's5', rangedId: 'sling', ammoId: 'stone', ammo: 0, stashAmmo: 0, away: false, exped: false },
    ], pile: { stick: 10, stone: 10, fiber: 5, vine: 5, wood: 5, branch: 5 } },
    ammoDeparts: [
      { day: 5, vid: 's1', site: 'expedition', rangedId: 'sling', ammoId: 'stone', carriedBefore: 0, carriedAfter: 6, pocketed: 6, outcome: 'pile-stone', reason: null },
      { day: 5, vid: 's2', site: 'expedition', rangedId: 'phase_sling', ammoId: 'stone', carriedBefore: 0, carriedAfter: 6, pocketed: 6, outcome: 'pile-stone', reason: null },
      { day: 5, vid: 's3', site: 'expedition', rangedId: 'sling', ammoId: 'stone', carriedBefore: 0, carriedAfter: 6, pocketed: 6, outcome: 'pile-stone', reason: null },
      { day: 5, vid: 's4', site: 'expedition', rangedId: 'sling', ammoId: 'stone', carriedBefore: 0, carriedAfter: 6, pocketed: 6, outcome: 'pile-stone', reason: null },
      { day: 5, vid: 's5', site: 'expedition', rangedId: 'sling', ammoId: 'stone', carriedBefore: 0, carriedAfter: 6, pocketed: 6, outcome: 'pile-stone', reason: null },
    ],
    stoneFights: [
      // s1: two volleys of 3 + 2 = 5 shots, then a 1-shot volley
      { day: 6, vid: 's1', mid: 'boar', wave: 1, origin: 'world-tick', rangedId: 'sling', ammoAtEntry: 6, volley: { shots: 3, hits: 2, dmg: 20, ammoLeft: 3 }, outcome: 'vFlee', rounds: 2, allyVids: [] },
      { day: 7, vid: 's1', mid: 'deer', wave: 1, origin: 'expedition', rangedId: 'sling', ammoAtEntry: 3, volley: { shots: 2, hits: 1, dmg: 9, ammoLeft: 1 }, outcome: 'vFlee', rounds: 3, allyVids: [] },
      // s1 later: a 1-shot volley on day 12 (after an unexplained gain)
      { day: 12, vid: 's1', mid: 'moth', wave: 2, origin: 'patrol', rangedId: 'sling', ammoAtEntry: 3, volley: { shots: 1, hits: 1, dmg: 8, ammoLeft: 2 }, outcome: 'vFlee', rounds: 1, allyVids: [] },
      // s2: evade before the volley (null) — no spend
      { day: 6, vid: 's2', mid: 'boar', wave: 1, origin: 'expedition', rangedId: 'phase_sling', ammoAtEntry: 6, volley: null, outcome: 'evade', rounds: 0, allyVids: [] },
      // a cross-check violation: ammoLeft does not match entry - shots
      { day: 8, vid: 's1', mid: 'toad', wave: 1, origin: 'world-tick', rangedId: 'sling', ammoAtEntry: 1, volley: { shots: 1, hits: 0, dmg: 0, ammoLeft: 1 }, outcome: 'vFlee', rounds: 1, allyVids: [] },
    ],
    stoneDutyTakes: [
      // s2: weapon craft takes 4 of their 6 carried stones
      { day: 6, duty: 'weaponCraft', vid: 's2', rangedId: 'phase_sling', before: 6, after: 2, took: 4 },
    ],
    stoneLoot: [],
    stoneDeaths: [
      // s3 dies day 9 carrying 4 stones (6 topped up, 2 spent? no —
      // s3 fought nothing: 6 in, 0 out, dies with 4? No: carriedStone
      // is the DIRECT measurement — 4, so 2 drained unexplained
      // before death, residual 2 on the death interval.)
      { day: 9, vid: 's3', rangedId: 'sling', carriedStone: 4, kind: 'person', cause: 'fight' },
    ],
    ammoCensus: [
      { day: 2, vid: 's1', rangedId: 'sling', ammoId: 'stone', ammo: 0, stashAmmo: 0, away: false, exped: false },
      { day: 2, vid: 's2', rangedId: 'phase_sling', ammoId: 'stone', ammo: 0, stashAmmo: 0, away: false, exped: false },
      { day: 2, vid: 's3', rangedId: 'sling', ammoId: 'stone', ammo: 0, stashAmmo: 0, away: false, exped: false },
      { day: 2, vid: 's4', rangedId: 'sling', ammoId: 'stone', ammo: 0, stashAmmo: 0, away: false, exped: false },
      { day: 2, vid: 's5', rangedId: 'sling', ammoId: 'stone', ammo: 0, stashAmmo: 0, away: false, exped: false },
      // day 10 census: s1 at 1 (6 - 5 volley = 1 ✓), s2 at 2 (6 - 4 craft = 2 ✓),
      // s4 switched to a bow (row present, rangedId bow), s5 GONE (vanished)
      { day: 10, vid: 's1', rangedId: 'sling', ammoId: 'stone', ammo: 1, stashAmmo: 0, away: false, exped: false },
      { day: 10, vid: 's2', rangedId: 'phase_sling', ammoId: 'stone', ammo: 2, stashAmmo: 0, away: false, exped: false },
      { day: 10, vid: 's4', rangedId: 'bow', ammoId: 'arrow', ammo: 3, stashAmmo: 0, away: false, exped: false },
      // day 14 census: s1 at 3 — 1 + 1 volley shot (day 12) + 1 xcheck
      // shot (day 8)... wait: window (10,14]: fights day 12 (1 shot).
      // O=1, I=0, X=1, C=3 → R = 1+0-1-3 = -3: an unexplained GAIN of 3.
      { day: 14, vid: 's1', rangedId: 'sling', ammoId: 'stone', ammo: 3, stashAmmo: 0, away: false, exped: false },
      { day: 14, vid: 's2', rangedId: 'phase_sling', ammoId: 'stone', ammo: 2, stashAmmo: 0, away: false, exped: false },
    ],
    ammoPile: [{ day: 10, stick: 10, stone: 300, fiber: 5, vine: 5, wood: 5, branch: 5 }],
  });
  fs.writeFileSync(path.join(dir, 's1.json'), JSON.stringify(seed));
  const st = stoneStats(dir);
  // Hand-computed expectations:
  // s1 intervals: (0,2] empty (O=0, I=0, X=0, C=0, R=0); (2,10]:
  // O=0, I=6, X=6 (day-6, day-7, day-8 fights: 3+2+1 shots), C=1 →
  // R = 0+6-6-1 = -1 (gain 1).
  // s1 interval (10,14]: O=1, I=0, X=1 (day-12 fight), C=3 → R = -3 (gain 3).
  // s2 interval (2,10]: O=0, I=6, X=4 (craft take; day-6 evade volley null = 0), C=2 → R=0.
  // s2 interval (10,14]: O=2, I=0, X=0, C=2 → R=0.
  // s3 death interval: last census day 2 (O=0), death day 9, I=6, X=0,
  //   carriedStone=4 → R = 0+6-0-4 = 2 residual drain; death-carried 4.
  // s4 switch: last sling census day 2 (O=0), next row day 10 bow:
  //   I=6, X=0 → carriedOut 6 (NOT a drain).
  // s5 vanished: last census day 2 (O=0), I=6, X=0 → lost 6 residual.
  // Totals: volleyShots = 3+2+1+1 = 7; craftTake = 4; gearTake = 0;
  //   deathCarried = 4; residualDrain = 2 (s3 death) + 6 (s5) = 8;
  //   residualGain = 1 + 3 = 4; inflowTotal = 6*5 = 30;
  //   outflowRecorded = 7 + 4 = 11;
  //   D = alive intervals (X + max(0,R)) + death (X + max(0,R) + carried)
  //     = s1 (6+0) + (1+0) + s2 (4+0) + (0+0) + s3 death (0+2+4) + s5 (0+6)
  //     = 7 + 4 + 6 + 6 = 23.
  //   completeness = 1 - 8/23 = 0.652...
  check('intervals: 9 alive (s1 x3, s2 x3, s3/s4/s5 x1 empty (0,2] baselines)', st.intervals === 9, 'got ' + st.intervals);
  check('drain intervals: s1 (2,10] net 5, s2 (2,10] net 4 → 2', st.drainIntervals === 2, 'got ' + st.drainIntervals);
  check('departures carrying stone: 5', st.departuresStone === 5, 'got ' + st.departuresStone);
  check('pocketed stone: 30', st.pocketedStone === 30, 'got ' + st.pocketedStone);
  check('volley shots 7 across 5 sling fights (1 null evade)', st.volleyShots === 7 && st.volleyFights === 5 && st.volleyNull === 1, JSON.stringify({ s: st.volleyShots, f: st.volleyFights, n: st.volleyNull }));
  check('volley xcheck violation counted (1)', st.volleyXcheckBad === 1, 'got ' + st.volleyXcheckBad);
  check('craft take 4 (weaponCraft)', st.craftTake === 4 && st.craftTakeByDuty.weaponCraft === 4, JSON.stringify(st.craftTakeByDuty));
  check('gear take 0', st.gearTake === 0, 'got ' + st.gearTake);
  check('death-carried 4 (s3)', st.deathCarried === 4 && st.deathsN === 1, JSON.stringify({ d: st.deathCarried, n: st.deathsN }));
  check('switch: 1, carried out 6, not a drain', st.switchesN === 1 && st.switchOut === 6, JSON.stringify({ n: st.switchesN, o: st.switchOut }));
  check('vanished: 1 carrier, 6 stones residual', st.vanishedN === 1 && st.vanishedStones === 6, JSON.stringify({ n: st.vanishedN, s: st.vanishedStones }));
  check('residual drain 8 (s3 2 + s5 6)', st.residualDrain === 8, 'got ' + st.residualDrain);
  check('residual gain 4 (s1 intervals)', st.residualGain === 4, 'got ' + st.residualGain);
  check('total drain D = 23', st.drainTotal === 23, 'got ' + st.drainTotal);
  check('completeness 1 - 8/23', Math.abs(st.completeness - (1 - 8 / 23)) < 1e-9, 'got ' + st.completeness);
  check('split: volley 7/23, craft 4/23, death 4/23, residual 8/23', Math.abs(st.split.volley - 7 / 23) < 1e-9 && Math.abs(st.split.craft - 4 / 23) < 1e-9 && Math.abs(st.split.death - 4 / 23) < 1e-9 && Math.abs(st.split.residual - 8 / 23) < 1e-9, JSON.stringify(st.split));
  check('no majority cause (max 8/23 = 35%)', st.majorityCause === null, 'got ' + st.majorityCause);
  check('census sling days 14, zero 10, mean 8/14', st.censusSlingDays === 14 && st.censusSlingZero === 10 && Math.abs(st.censusSlingMean - 8 / 14) < 1e-9, JSON.stringify({ d: st.censusSlingDays, z: st.censusSlingZero, m: st.censusSlingMean }));
  check('census by weapon: sling 10 days / 8 zero, phase_sling 4 days / 2 zero', st.censusByWeapon.sling.days === 10 && st.censusByWeapon.sling.zero === 8 && st.censusByWeapon.phase_sling.days === 4 && st.censusByWeapon.phase_sling.zero === 2, JSON.stringify(st.censusByWeapon));
  check('volley by wave: w1 4 fights / 6 shots, w2 1 fight / 1 shot', st.volleyByWave.w1.fights === 4 && st.volleyByWave.w1.shots === 6 && st.volleyByWave.w2.fights === 1 && st.volleyByWave.w2.shots === 1, JSON.stringify(st.volleyByWave));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  // Judge shapes.
  function mk(o) {
    return Object.assign({ completeness: 0.95, departuresStone: 20, drainIntervals: 30,
      drainTotal: 100, residualDrain: 5, residualGain: 0,
      pocketedStone: 120, intervals: 40, deathsN: 2, switchesN: 1, vanishedN: 0,
      split: { volley: 0.6, craft: 0.1, gear: 0.0, death: 0.2, residual: 0.1 },
      majorityCause: 'volley', majorityShare: 0.6,
      dutyCalls: { weaponCraft: 150, ammoCraft: 150, armorCraft: 150, gearDay: 150 },
      volleyXcheckBad: 0, volleyFights: 50 }, o);
  }
  let j = judge(mk({}));
  check('judge DIAG-GO (completeness .95, pools pass, volley majority 60%)', j.verdict === 'DIAG-GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judge(mk({ completeness: 0.92, majorityCause: null, majorityShare: 0.35, split: { volley: 0.35, craft: 0.30, gear: 0.0, death: 0.25, residual: 0.08 } }));
  check('judge DIAG-GO both-candidates-measured (no majority, volley 35% vs craft 30%, residual 8%)', j.verdict === 'DIAG-GO', JSON.stringify(j.bars));
  j = judge(mk({ completeness: 0.85 }));
  check('judge DIAG-NO-GO low completeness (<0.90)', j.verdict === 'DIAG-NO-GO' && !j.bars[0].pass, JSON.stringify(j.bars));
  j = judge(mk({ departuresStone: 10 }));
  check('judge DIAG-NO-GO thin departure pool (<15)', j.verdict === 'DIAG-NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(mk({ drainIntervals: 20 }));
  check('judge DIAG-NO-GO thin drain pool (<25)', j.verdict === 'DIAG-NO-GO' && !j.bars[2].pass, JSON.stringify(j.bars));
  j = judge(mk({ dutyCalls: { weaponCraft: 0, ammoCraft: 150, armorCraft: 150, gearDay: 150 } }));
  check('judge DIAG-NO-GO split unquantified (weapon-craft wrap never ran)', j.verdict === 'DIAG-NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
  j = judge(mk({ volleyXcheckBad: 3 }));
  check('judge xcheck bar fails but verdict stays GO (cross-check, not a verdict bar)', j.bars[4].pass === false && j.verdict === 'DIAG-GO', JSON.stringify(j));
  console.log('analyze-slingstone-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
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
  if (!dir) { console.error('usage: analyze-slingstone-a.js --dir DIR [--out FILE] [--no-judge] | --selftest'); process.exit(2); }
  const st = stoneStats(dir);
  const j = noJudge ? null : judge(st);
  const result = { verdict: j ? j.verdict : null, bars: j ? j.bars : null,
    diag: summarize(st), residualDetail: st.residualDetail };
  console.log(JSON.stringify({ verdict: result.verdict, bars: result.bars, diag: summarize(st) }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { stoneStats: stoneStats, ledgerSeed: ledgerSeed, judge: judge, bucket: bucket, SLING_IDS: SLING_IDS };
