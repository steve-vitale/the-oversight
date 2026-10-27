#!/usr/bin/env node
// scripts/test-arroworigin-a.js — proof for sim-arroworigin-a.
// Re-derives EVERY summary number from the corpus files (never trusts
// summary.json's prose): band table, G2 identity, per-seed first-arrow
// day + holder + fullPool trace, zero-arrow confirmation on 6 seeds,
// scholar-bucket check, change-event consistency, and the ammostorage
// cross-check recomputed from BOTH corpora. Exits nonzero on any FAIL.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-27', 'perseed-arroworigin-a');
const AMMO_DIR = path.join(REPO, 'evidence', '2026-10-26', 'perseed-ammostorage-a');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const BAND1920 = { wins: 2, nationalEver: 6, nationalFinal: 5, table: 4, entered: 2, wave4: 6, wave5: 0, medianDays: 152, deaths: 307, starvation: 1 };

let pass = 0, fail = 0;
const fails = [];
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; fails.push(name + (detail ? ' :: ' + detail : '')); console.log(`FAIL ${name}${detail ? ' :: ' + detail : ''}`); }
}
function medianOf(arr) {
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

const summary = load(path.join(EVID, 'summary.json'));
const rows = {};
for (const seed of SEEDS) {
  for (const pid of ['baseline', 'armed']) rows[`${seed}-${pid}`] = load(path.join(EVID, `s${seed}-${pid}.json`));
}

// --- Band table, re-derived from per-seed rows (baseline arm) ---
const base = SEEDS.map(s => rows[`${s}-baseline`]);
const armed = SEEDS.map(s => rows[`${s}-armed`]);
function bandOf(rs) {
  const wave = (n) => rs.filter(r => (r.waveReach || 1) >= n).length;
  return {
    wins: rs.reduce((t, r) => t + r.won, 0),
    nationalEver: rs.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rs.reduce((t, r) => t + r.nationalFinal, 0),
    table: rs.reduce((t, r) => t + r.table, 0),
    entered: rs.reduce((t, r) => t + r.entered, 0),
    wave4: wave(4), wave5: wave(5),
    medianDays: medianOf(rs.map(r => r.days)),
    deaths: rs.reduce((t, r) => t + r.deathTotal, 0),
    starvation: rs.reduce((t, r) => t + r.starvationDeaths, 0),
  };
}
const bBase = bandOf(base), bArmed = bandOf(armed);
for (const k of Object.keys(BAND1920)) check(`baseline band ${k} == 1920Z`, bBase[k] === BAND1920[k], `derived=${bBase[k]} 1920Z=${BAND1920[k]}`);
// Summary band keys differ from BAND1920 keys on three fields
// (won/deathTotal/starvationTotal vs wins/deaths/starvation); map them
// instead of comparing undefined against derived.
for (const k of Object.keys(BAND1920)) {
  const sk = ({ wins: 'won', deaths: 'deathTotal', starvation: 'starvationTotal' })[k] || k;
  check(`summary baselineBand ${k} matches derived`, summary.baselineBand[sk] === bBase[k], `summary=${summary.baselineBand[sk]} derived=${bBase[k]}`);
}
check('summary verdict field present', typeof summary.verdict === 'string');
check('summary armedBand deaths matches derived', summary.armedBand.deathTotal === bArmed.deaths, `summary=${summary.armedBand.deathTotal} derived=${bArmed.deaths}`);

// --- G2 identity per seed (baseline vs armed) ---
for (const seed of SEEDS) {
  const c = rows[`${seed}-baseline`], a = rows[`${seed}-armed`];
  check(`G2 seed ${seed} days`, c.days === a.days, `${c.days} vs ${a.days}`);
  check(`G2 seed ${seed} gameDays`, c.gameDays === a.gameDays, `${c.gameDays} vs ${a.gameDays}`);
  check(`G2 seed ${seed} ts`, JSON.stringify(Object.fromEntries(Object.entries(c.ts || {}).sort())) === JSON.stringify(Object.fromEntries(Object.entries(a.ts || {}).sort())));
  check(`G2 seed ${seed} starvation`, c.starvationDeaths === a.starvationDeaths);
  // Faced comparison is SEMANTIC (sorted keys): JSON key order carries
  // no game meaning, and one corpus file (73671 baseline) was transcribed
  // with alphabetically sorted keys while its armed twin keeps run order.
  // Values must still match exactly; order must not fail the leg.
  check(`G2 seed ${seed} faced`, JSON.stringify(Object.fromEntries(Object.entries(c.faced || {}).sort())) === JSON.stringify(Object.fromEntries(Object.entries(a.faced || {}).sort())));
  check(`G2 seed ${seed} kill log`, JSON.stringify((c.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])) === JSON.stringify((a.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])));
}

// --- Per-seed arrow trace, re-derived from dailyRows ---
for (const seed of SEEDS) {
  const a = rows[`${seed}-armed`];
  const ao = a.arroworigin;
  check(`seed ${seed} diag clean`, (ao.diag.errs | 0) === 0 && (ao.diag.overflow.dailyRows | 0) === 0 && (ao.diag.overflow.changeEvents | 0) === 0 && (ao.diag.overflow.newPersons | 0) === 0, `errs=${ao.diag.errs} overflow=${JSON.stringify(ao.diag.overflow)}`);
  const dr = ao.dailyRows;
  check(`seed ${seed} dailyRows == days`, dr.length === a.days, `rows=${dr.length} days=${a.days}`);
  const first = dr.find(r => (r.total | 0) > 0) || null;
  const maxTot = dr.reduce((m, r) => Math.max(m, r.total | 0), 0);
  const daysWith = dr.filter(r => (r.total | 0) > 0).length;
  const scholarMax = dr.reduce((m, r) => Math.max(m, r.scholarArrow | 0), 0);
  // Summary perSeed entry must match the re-derivation.
  const ps = summary.perSeed.find(p => p.seed === seed);
  check(`seed ${seed} summary firstArrowDay matches rows`, ps.firstArrowDay === (first ? first.day : null), `summary=${ps.firstArrowDay} rows=${first ? first.day : null}`);
  check(`seed ${seed} summary maxTotal matches rows`, ps.maxTotal === maxTot, `summary=${ps.maxTotal} rows=${maxTot}`);
  check(`seed ${seed} summary daysWithArrow matches rows`, ps.daysWithArrow === daysWith, `summary=${ps.daysWithArrow} rows=${daysWith}`);
  check(`seed ${seed} scholar never holds an arrow`, scholarMax === 0, `scholarMax=${scholarMax}`);
  // Daily totals are consistent: total == carried + stashed, and the
  // holder list sums to the total.
  for (const r of dr) {
    if ((r.total | 0) !== (r.totalCarried | 0) + (r.totalStashed | 0)) { check(`seed ${seed} day ${r.day} total arithmetic`, false); break; }
    const hsum = (r.holders || []).reduce((t, h) => t + (h.carried | 0) + (h.stashed | 0), 0);
    if (hsum !== (r.total | 0)) { check(`seed ${seed} day ${r.day} holder sum == total`, false, `holders=${hsum} total=${r.total}`); break; }
  }
  check(`seed ${seed} daily arithmetic clean`, true);
  if (seed === 73672 || seed === 73676) {
    check(`seed ${seed} has exactly one arrow seed`, !!first && maxTot === 1, `first=${first ? first.day : null} max=${maxTot}`);
    // Compact v2 rows carry the full holder record as holderDetail;
    // full rows carry it on the first arrow day's holders[0].
    const h = (ao.holderDetail) || (first.holders || [])[0];
    check(`seed ${seed} first arrow is stashed, not carried`, !!h && h.stashed === 1 && h.carried === 0, JSON.stringify(h && { carried: h.carried, stashed: h.stashed }));
    check(`seed ${seed} holder fullPool contains arrow`, !!h && Array.isArray(h.fullPool) && h.fullPool.indexOf('arrow') >= 0, `fullPool=${h && JSON.stringify(h.fullPool)}`);
    check(`seed ${seed} holderDetail day == first arrow day`, !ao.holderDetail || ao.holderDetail.day === (first ? first.day : null), `detailDay=${ao.holderDetail && ao.holderDetail.day} firstDay=${first ? first.day : null}`);
    const np = ao.newPersons.find(n => n.vid === h.vid);
    check(`seed ${seed} holder new-person record exists`, !!np, `holder=${h.vid}`);
    // The new-person record means different things per case and must not
    // be checked with one blanket rule: for the founder (73676) it IS the
    // day-1 full record (fullPool carries the arrow); for the
    // joiner-population holder (73672) it is the day-1 PRE-hydration
    // placeholder (empty lists, fullPool null) — the arrow-carrying pool
    // lives in holderDetail (day 40), checked above. A blanket
    // fullPool-has-arrow check on the placeholder would be a false fail.
    if (seed === 73676) check(`seed 73676 holder new-person record fullPool has arrow`, !!np && Array.isArray(np.fullPool) && np.fullPool.indexOf('arrow') >= 0);
    if (seed === 73672) check(`seed 73672 holder new-person record is the pre-hydration placeholder (fullPool null, day 1)`, !!np && np.fullPool === null && np.day === 1, `np=${np && JSON.stringify({ day: np.day, fullPool: np.fullPool })}`);
    check(`seed ${seed} summary source named`, !!summary.sources[String(seed)], `sources=${JSON.stringify(summary.sources)}`);
    // No change event should ever move the arrow after arrival (it never
    // leaves the stash): change events for the holder, if any, are only
    // the arrival-day population event itself.
    const arrowChanges = ao.changeEvents.filter(e => e.vid === h.vid);
    const afterArrival = arrowChanges.filter(e => e.day !== first.day);
    check(`seed ${seed} holder has no arrow change events after arrival`, afterArrival.length === 0, `changesAfter=${afterArrival.length}`);
    if (seed === 73676) {
      // Founder: day-1 full person, zero change events, roster day 1.
      check(`seed 73676 holder first roster day == arrow day 1`, !!np && np.day === 1 && first.day === 1, `rosterDay=${np && np.day} arrowDay=${first.day}`);
      check(`seed 73676 holder has zero change events`, arrowChanges.length === 0, `changes=${arrowChanges.length}`);
    }
    if (seed === 73672) {
      // Joiner-population: exactly one change event, on the arrow day,
      // with EMPTY previous lists (person record populated that day).
      check(`seed 73672 holder has exactly one change event, on arrow day`, arrowChanges.length === 1 && arrowChanges[0].day === first.day, `changes=${JSON.stringify(arrowChanges.map(c => c.day))}`);
      const ch = arrowChanges[0];
      check(`seed 73672 arrival change has empty previous lists`, !!ch && !(ch.prevItems || []).length && !(ch.prevStashedList || []).length, `prevItems=${ch && JSON.stringify(ch.prevItems)} prevStashed=${ch && JSON.stringify(ch.prevStashedList)}`);
      check(`seed 73672 arrival change curStashed contains arrow`, !!ch && (ch.curStashedList || []).indexOf('arrow') >= 0);
      check(`seed 73672 summary arrival flags changePrevEmpty`, !!ps.arrival && ps.arrival.changePrevEmpty === true);
    }
  } else {
    check(`seed ${seed} zero arrows all days`, !first && maxTot === 0 && daysWith === 0, `first=${first ? first.day : null} max=${maxTot} daysWith=${daysWith}`);
    check(`seed ${seed} no holders any day`, dr.every(r => (r.holders || []).length === 0));
    check(`seed ${seed} no arrow change events`, ao.changeEvents.length === 0, `changes=${ao.changeEvents.length}`);
  }
}
check('exactly 2 arrow seeds', SEEDS.filter(s => summary.perSeed.find(p => p.seed === s).firstArrowDay != null).length === 2);
check('arrow seeds are 73672 and 73676', JSON.stringify(SEEDS.filter(s => summary.perSeed.find(p => p.seed === s).firstArrowDay != null)) === JSON.stringify([73672, 73676]));
check('73672 first day is 40', summary.perSeed.find(p => p.seed === 73672).firstArrowDay === 40);
check('73676 first day is 1', summary.perSeed.find(p => p.seed === 73676).firstArrowDay === 1);
check('verdict is DIAG-GO', summary.verdict === 'DIAG-GO', `verdict=${summary.verdict}`);

// --- Ammostorage cross-check, recomputed from BOTH corpora ---
for (const seed of SEEDS) {
  const am = load(path.join(AMMO_DIR, `s${seed}-armed.json`));
  const snaps = (am.ammostorage && am.ammostorage.dailySnapshots) || [];
  let aFirst = null, aMax = 0;
  for (const sn of snaps) {
    const st = sn.storage || {};
    const tot = ((st.otherPersonsStashed && st.otherPersonsStashed.arrow) | 0)
      + ((st.otherPersonsCarried && st.otherPersonsCarried.arrow) | 0)
      + ((st.scholarInventory && st.scholarInventory.arrow) | 0);
    if (tot > aMax) aMax = tot;
    if (tot > 0 && !aFirst) aFirst = sn.day;
  }
  const ps = summary.perSeed.find(p => p.seed === seed);
  check(`xcheck seed ${seed} first day vs ammostorage`, ps.firstArrowDay === aFirst, `mine=${ps.firstArrowDay} ammo=${aFirst}`);
  check(`xcheck seed ${seed} max vs ammostorage`, ps.maxTotal === aMax, `mine=${ps.maxTotal} ammo=${aMax}`);
  const xs = summary.ammostorageCrossCheck.perSeed.find(x => x.seed === seed);
  check(`xcheck seed ${seed} summary xcheck agrees`, !!xs && xs.firstDayMatch && xs.maxMatch);
}

// --- Death band (armed) re-derived ---
const deathBand = {};
for (const r of armed) for (const k of Object.keys(r.deaths || {})) deathBand[k] = (deathBand[k] || 0) + (r.deaths[k] | 0);
check('death band total == armed deaths', Object.keys(deathBand).reduce((t, k) => t + deathBand[k], 0) === bArmed.deaths);
for (const k of Object.keys(deathBand)) check(`death band ${k} matches summary`, summary.deathBandArmed[k] === deathBand[k], `summary=${summary.deathBandArmed[k]} derived=${deathBand[k]}`);

console.log(`\nPROOF sim-arroworigin-a: ${pass} PASS, ${fail} FAIL`);
if (fails.length) { console.log('FAILURES:'); for (const f of fails) console.log(' - ' + f); process.exit(1); }
