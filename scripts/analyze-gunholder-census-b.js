// analyze-gunholder-census-b.js — analyzer for arm sim-gunholder-census-b
// (loaded-gun holder census, DIAG — no lever, no before/after).
//   node scripts/analyze-gunholder-census-b.js --dir <dir> --out <file>
//   node scripts/analyze-gunholder-census-b.js --fixture <oldFile> <vid>
//   node scripts/analyze-gunholder-census-b.js --selftest
// Primary metric (frozen in the prereg): the distribution of
// equipped-loaded holder-days across the nine classes (§6) + fights
// led/allied by wave per holder. A miss is judged as written (§14);
// the balanced panel (§15) is inapplicable — pure diagnostic.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const REPO = path.join(__dirname, '..');

const CLASSES = ['fired', 'led-cellgate-hold', 'led-no-cells', 'led-evaded',
  'led-already-dead', 'led-other', 'ally-no-fire', 'not-picked', 'no-fight'];
const SUPPLY_FLOOR = 60;

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return (s.length % 2) ? s[m] : (s[m - 1] + s[m]) / 2;
}
function loadDir(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!/gunholder-census-b-s\d+-gunholder-census-b-arm\.json$/.test(f)) continue;
    out.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return out;
}
function isStarv(d) {
  const s = String((d && (d.cause || d.kind)) || '').toLowerCase();
  return s.indexOf('starv') !== -1 || s.indexOf('hunger') !== -1;
}
// Fixture mode: reproduce a known holder's holder-days + searcaster
// volleys from an OLD killlootbundle-format file (rearm-witness corpora).
// Old files lack fightEvents/encounterEvents, so this verifies counts
// only — never classification.
function fixtureHolder(file, vid) {
  const c = JSON.parse(fs.readFileSync(file, 'utf8'));
  let holderDays = 0, firstDay = null, lastDay = null;
  (c.v4gunLoc || []).forEach(function (row) {
    const hit = (row.locations || []).some(function (l) {
      return l.loc === 'equipped' && l.vid === vid && (l.cells || 0) > 0;
    });
    if (hit) {
      holderDays++;
      if (firstDay == null || row.day < firstDay) firstDay = row.day;
      if (lastDay == null || row.day > lastDay) lastDay = row.day;
    }
  });
  const searVolleys = (c.volleyEvents || []).filter(function (e) {
    return e.vid === vid && e.rwId === 'searcaster';
  });
  const searFired = searVolleys.filter(function (e) { return (e.shots || 0) > 0; });
  const takes = (c.rearmTakeEvents || []).filter(function (e) { return e.taker === vid; });
  return { file: file, vid: vid, holderDays: holderDays, firstDay: firstDay,
    lastDay: lastDay, searVolleyRecords: searVolleys.length,
    searFired: searFired.length, searShots: searFired.reduce(function (a, e) { return a + (e.shots || 0); }, 0),
    takes: takes };
}

function analyzeSeed(c) {
  const floor = (c.cellgateFloor != null ? c.cellgateFloor : 4);
  const scholarVid = '__scholar__';
  // --- holder-days from the daily census ---
  const holderDays = {}; // vid -> { days: [d], first, last }
  const carriedLoadedDays = {}; // vid -> count (gun carried + pack cells > 0)
  let scholarEquippedDays = 0;
  (c.v4gunLoc || []).forEach(function (row) {
    const seen = {};
    (row.locations || []).forEach(function (l) {
      if (l.loc === 'equipped' && l.vid && l.vid !== scholarVid && (l.cells || 0) > 0 && !seen[l.vid]) {
        seen[l.vid] = true;
        (holderDays[l.vid] = holderDays[l.vid] || { days: [], first: row.day, last: row.day }).days.push(row.day);
        if (row.day < holderDays[l.vid].first) holderDays[l.vid].first = row.day;
        if (row.day > holderDays[l.vid].last) holderDays[l.vid].last = row.day;
      }
      if (l.loc === 'scholar-equipped') scholarEquippedDays++;
    });
    // carried-loaded: gun in pack + cells in pack (packCells map).
    const pc = row.packCells || {};
    Object.keys(pc).forEach(function (vid) {
      if ((pc[vid].guns || 0) > 0 && (pc[vid].cells || 0) > 0) {
        // Only count days the vid is NOT equipped-loaded (no double count).
        if (!seen[vid]) carriedLoadedDays[vid] = (carriedLoadedDays[vid] || 0) + 1;
      }
    });
  });
  // --- fight participation per (vid, day) ---
  const led = {}; // vid|day -> [fight]
  const allied = {}; // vid|day -> [fight]
  const candidate = {}; // vid|day -> [reason]
  const fights = c.fightEvents || [];
  fights.forEach(function (f) {
    const key = f.vid + '|' + f.day;
    (led[key] = led[key] || []).push(f);
    [f.allyVid, f.ally2Vid, f.ally3Vid].forEach(function (a) {
      if (!a) return;
      const ak = a + '|' + f.day;
      (allied[ak] = allied[ak] || []).push(f);
    });
    // Named ally candidates who never joined the fight.
    (f.allyVids || []).forEach(function (a) {
      if (!a || a === f.vid) return;
      if (a === f.allyVid || a === f.ally2Vid || a === f.ally3Vid) return;
      const ck = a + '|' + f.day;
      (candidate[ck] = candidate[ck] || []).push('ally-listed:' + (f.mdefId || '?'));
    });
  });
  (c.encounterEvents || []).forEach(function (e) {
    (e.candidates || []).forEach(function (a) {
      if (!a || a === e.vid) return;
      const ck = a + '|' + e.day;
      (candidate[ck] = candidate[ck] || []).push('wild-node:' + (e.mid || '?'));
    });
  });
  // --- classification (frozen precedence, prereg §6) ---
  const classCounts = {};
  CLASSES.forEach(function (k) { classCounts[k] = 0; });
  const perHolder = {};
  let unclassified = 0;
  const ledOtherDetail = [];
  Object.keys(holderDays).sort().forEach(function (vid) {
    const hd = holderDays[vid];
    const h = { vid: vid, holderDays: hd.days.length, firstDay: hd.first, lastDay: hd.last,
      classes: {}, fightsLedByWave: {}, fightsAlliedByWave: {}, fightsLed: 0, fightsAllied: 0,
      candidateDays: 0 };
    CLASSES.forEach(function (k) { h.classes[k] = 0; });
    hd.days.forEach(function (day) {
      const key = vid + '|' + day;
      const ledF = led[key] || [];
      const allF = allied[key] || [];
      const candF = candidate[key] || [];
      let cls = null;
      if (ledF.length) {
        h.fightsLed += ledF.length;
        ledF.forEach(function (f) {
          const w = f.wave || 0;
          h.fightsLedByWave[w] = (h.fightsLedByWave[w] || 0) + 1;
        });
      }
      if (allF.length) {
        h.fightsAllied += allF.length;
        allF.forEach(function (f) {
          const w = f.wave || 0;
          h.fightsAlliedByWave[w] = (h.fightsAlliedByWave[w] || 0) + 1;
        });
      }
      if (candF.length) h.candidateDays++;
      if (ledF.some(function (f) { return f.rwId === 'searcaster' && f.volley && (f.volley.shots || 0) > 0; })) {
        cls = 'fired';
      } else if (ledF.length) {
        const first = ledF[0];
        if (first.outcome === 'evade') cls = 'led-evaded';
        else if (first.outcome === 'alreadyDead') cls = 'led-already-dead';
        else if (first.rwId !== 'searcaster') {
          cls = 'led-other';
          ledOtherDetail.push({ vid: vid, day: day, why: 'gun-not-in-hand-at-fight', rwId: first.rwId, wave: first.wave, mid: first.mdefId, outcome: first.outcome });
        } else if ((first.cellsAtStart || 0) === 0) cls = 'led-no-cells';
        else if ((first.wave || 0) < floor) cls = 'led-cellgate-hold';
        else {
          cls = 'led-other';
          ledOtherDetail.push({ vid: vid, day: day, why: 'wave>=floor cells>0 shots-0', rwId: first.rwId, wave: first.wave, mid: first.mdefId, outcome: first.outcome, volley: first.volley });
        }
      } else if (allF.length) cls = 'ally-no-fire';
      else if (candF.length) cls = 'not-picked';
      else cls = 'no-fight';
      if (!cls || CLASSES.indexOf(cls) < 0) { unclassified++; return; }
      h.classes[cls]++;
      classCounts[cls]++;
    });
    // Acquisition source (first event chronologically for this vid).
    const acq = [];
    (c.killLootEvents || []).forEach(function (e) {
      if (e.dropId === 'searcaster' && (e.gains || []).some(function (g) { return g.holder === vid && (g.gunsGained || 0) > 0; })) acq.push({ day: e.day, source: 'staged' });
    });
    (c.prizeEvents || []).forEach(function (e) {
      if ((e.gains || []).some(function (g) { return g.holder === vid && (g.gunsGained || 0) > 0; })) acq.push({ day: e.day, source: 'contest-prize' });
    });
    (c.grantEvents || []).forEach(function (e) {
      if (e.itemId === 'searcaster' && e.toKind === 'villager' && e.toVid === vid) acq.push({ day: e.day, source: 'other-grant:' + (e.caller || '?') });
    });
    (c.rearmTakeEvents || []).forEach(function (e) {
      if (e.taker === vid && e.gun) acq.push({ day: e.day, source: 'rearm-take:' + (e.channel || '?') });
    });
    acq.sort(function (a, b) { return (a.day || 0) - (b.day || 0); });
    h.acquisition = acq.length ? acq[0] : { day: null, source: 'unknown' };
    h.acquisitionEvents = acq;
    // Fate at end of seed.
    const death = (c.deaths || []).find(function (d) { return d.who === vid; });
    const lastRow = (c.v4gunLoc || [])[(c.v4gunLoc || []).length - 1];
    let gunOnCorpse = false, stillEquipped = false, dryEquipped = false;
    if (lastRow) {
      (lastRow.locations || []).forEach(function (l) {
        if (l.loc === 'corpse' && l.cvid === vid && (l.count || 0) > 0) gunOnCorpse = true;
        if (l.loc === 'equipped' && l.vid === vid) {
          if ((l.cells || 0) > 0) stillEquipped = true; else dryEquipped = true;
        }
      });
    }
    if (death) h.fate = gunOnCorpse ? 'dead-gun-on-corpse' : 'dead';
    else if (stillEquipped) h.fate = 'still-holding';
    else if (dryEquipped) h.fate = 'dry';
    else h.fate = 'gun-lost';
    h.death = death ? { day: death.day, cause: death.cause } : null;
    perHolder[vid] = h;
  });
  const totalHolderDays = Object.keys(holderDays).reduce(function (a, v) { return a + holderDays[v].days.length; }, 0);
  const classSum = CLASSES.reduce(function (a, k) { return a + classCounts[k]; }, 0);
  if (classSum !== totalHolderDays) unclassified += (totalHolderDays - classSum);
  // --- custody: suspected transfers (gun leaves a living holder with no
  // event behind it, and another holder's gun appears the same day) ---
  const transfersSuspected = [];
  try {
    const rows = c.v4gunLoc || [];
    const holdersByDay = {}; // day -> { vid: loc }
    rows.forEach(function (row) {
      const m = {};
      (row.locations || []).forEach(function (l) {
        if ((l.loc === 'equipped' || l.loc === 'carried') && l.vid && l.vid !== scholarVid) m[l.vid] = l.loc;
      });
      holdersByDay[row.day] = m;
    });
    const days = Object.keys(holdersByDay).map(Number).sort(function (a, b) { return a - b; });
    const deathsByVid = {};
    (c.deaths || []).forEach(function (d) { if (d.who) deathsByVid[d.who] = d.day; });
    for (let i = 1; i < days.length; i++) {
      const prev = holdersByDay[days[i - 1]] || {};
      const cur = holdersByDay[days[i]] || {};
      const lost = Object.keys(prev).filter(function (v) { return !cur[v] && (deathsByVid[v] == null || deathsByVid[v] > days[i]); });
      const gained = Object.keys(cur).filter(function (v) { return !prev[v]; });
      lost.forEach(function (v) {
        const explained = (c.rearmTakeEvents || []).some(function (e) { return e.day === days[i] && e.taker !== v; }) ||
          (c.corpseTakeEvents || []).some(function (e) { return e.day === days[i]; });
        if (!explained) {
          transfersSuspected.push({ day: days[i], from: v, to: gained.length ? gained : null,
            note: gained.length ? 'gun left a living holder the day another holder gained one — transfer suspected, mechanism unrecorded' : 'gun left a living holder with no recorded event' });
        }
      });
    }
  } catch (e) {}
  // --- staged arrivals + searcaster volleys (bundle check) ---
  const kl = (c.killLootEvents || []).filter(function (e) { return e.dropId === 'searcaster'; });
  const klBundled = kl.filter(function (e) {
    return (e.gains || []).some(function (g) { return g.cellsGained === 2; });
  });
  const searVolleys = (c.volleyEvents || []).filter(function (e) { return e.rwId === 'searcaster' && (e.shots || 0) > 0; });
  const scholarSearVolleys = searVolleys.filter(function (e) { return e.vid === '__scholar__' || e.vid === null; });
  const villagerSearVolleys = searVolleys.filter(function (e) { return e.vid && e.vid !== '__scholar__'; });
  const w5Faced = {};
  fights.forEach(function (f) { if ((f.wave || 0) === 5 && f.mdefId) w5Faced[f.mdefId] = true; });
  const starv = (c.deaths || []).filter(isStarv).length;
  return {
    seed: c.seed, mode: c.mode, anchorCommit: c.anchorCommit, gameSha: c.gameSha,
    policySha: c.policySha, rearmOn: !!c.rearmOn, rearmPresent: !!c.rearmPresent,
    instrumentErrors: (c.instrumentErrors || []).length,
    days: c.days, gameDays: c.gameDays, endReason: c.endReason, won: !!c.won,
    villageLost: !!c.villageLost, scaleRank: c.scaleRank,
    maxWave: c.maxWave, unlockedWave: c.unlockedWave, standing: c.standing,
    totalHolderDays: totalHolderDays, classCounts: classCounts, unclassified: unclassified,
    classSum: classSum, holders: Object.keys(perHolder).length,
    perHolder: perHolder, carriedLoadedDays: carriedLoadedDays,
    scholarEquippedDays: scholarEquippedDays,
    scholarSearVolleys: scholarSearVolleys.length,
    villagerSearVolleys: villagerSearVolleys.length,
    ledOtherDetail: ledOtherDetail, transfersSuspected: transfersSuspected,
    klArrivals: kl.length, klBundled: klBundled.length, klDry: kl.length - klBundled.length,
    rearmTakes: (c.rearmTakeEvents || []).length,
    fightEvents: fights.length, encounterEvents: (c.encounterEvents || []).length,
    w5Faced: Object.keys(w5Faced), w5FacedCount: Object.keys(w5Faced).length,
    starvDeaths: starv, deaths: (c.deaths || []).length,
  };
}

function analyzeLeg(seeds) {
  const leg = { seeds: seeds.length, files: seeds.length,
    totalHolderDays: 0, classCounts: {}, unclassified: 0, holders: 0,
    perSeed: [], scholarEquippedDays: 0, scholarSearVolleys: 0,
    villagerSearVolleys: 0, klArrivals: 0, klBundled: 0, klDry: 0,
    rearmTakes: 0, fightEvents: 0, encounterEvents: 0,
    wins: 0, national: 0, wave5Unlocks: 0, wave5FacedSeeds: 0,
    medianSurvival: null, instrumentErrors: 0, anchors: {}, policyShaMismatches: 0,
    rearmOff: 0, rearmPresentOff: 0, carriedLoadedDays: 0,
    transfersSuspected: [], ledOtherDetail: [] };
  CLASSES.forEach(function (k) { leg.classCounts[k] = 0; });
  let policySha = 'unknown';
  try {
    policySha = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex').slice(0, 12);
  } catch (e) {}
  leg.policySha = policySha;
  const survivals = [];
  seeds.forEach(function (s) {
    const a = analyzeSeed(s);
    leg.perSeed.push(a);
    leg.totalHolderDays += a.totalHolderDays;
    CLASSES.forEach(function (k) { leg.classCounts[k] += a.classCounts[k]; });
    leg.unclassified += a.unclassified;
    leg.holders += a.holders;
    leg.scholarEquippedDays += a.scholarEquippedDays;
    leg.scholarSearVolleys += a.scholarSearVolleys;
    leg.villagerSearVolleys += a.villagerSearVolleys;
    leg.klArrivals += a.klArrivals;
    leg.klBundled += a.klBundled;
    leg.klDry += a.klDry;
    leg.rearmTakes += a.rearmTakes;
    leg.fightEvents += a.fightEvents;
    leg.encounterEvents += a.encounterEvents;
    leg.instrumentErrors += a.instrumentErrors;
    if (a.won) leg.wins++;
    if (a.scaleRank === 'national' || a.scaleRank === 'global') leg.national++;
    if ((a.unlockedWave || 0) >= 5) leg.wave5Unlocks++;
    if (a.w5FacedCount > 0) leg.wave5FacedSeeds++;
    if (a.gameDays != null) survivals.push(a.gameDays);
    if (a.anchorCommit) leg.anchors[a.anchorCommit] = (leg.anchors[a.anchorCommit] || 0) + 1;
    if (a.policySha !== policySha) leg.policyShaMismatches++;
    if (!a.rearmOn) leg.rearmOff++;
    if (!a.rearmPresent) leg.rearmPresentOff++;
    Object.keys(a.carriedLoadedDays).forEach(function (v) { leg.carriedLoadedDays += a.carriedLoadedDays[v]; });
    leg.transfersSuspected.push.apply(leg.transfersSuspected, a.transfersSuspected.map(function (t) { t.seed = a.seed; return t; }));
    leg.ledOtherDetail.push.apply(leg.ledOtherDetail, a.ledOtherDetail.map(function (t) { t.seed = a.seed; return t; }));
  });
  leg.medianSurvival = median(survivals);
  return leg;
}

function judgeLeg(leg) {
  const bars = {};
  bars.instrument = { pass:
    leg.instrumentErrors === 0 &&
    Object.keys(leg.anchors).length === 1 &&
    leg.policyShaMismatches === 0 &&
    leg.rearmOff === 0 && leg.rearmPresentOff === 0 &&
    leg.klArrivals === leg.seeds && leg.klBundled === leg.klArrivals && leg.klDry === 0,
    detail: 'errors=' + leg.instrumentErrors + ' anchors=' + Object.keys(leg.anchors).length +
      ' policyMismatches=' + leg.policyShaMismatches + ' rearmOff=' + leg.rearmOff +
      ' rearmPresentOff=' + leg.rearmPresentOff + ' klArrivals=' + leg.klArrivals +
      '/' + leg.seeds + ' klBundled=' + leg.klBundled + ' klDry=' + leg.klDry };
  bars.classification = { pass: leg.unclassified === 0 &&
      CLASSES.reduce(function (a, k) { return a + leg.classCounts[k]; }, 0) === leg.totalHolderDays,
    detail: 'unclassified=' + leg.unclassified + ' classSum=' +
      CLASSES.reduce(function (a, k) { return a + leg.classCounts[k]; }, 0) +
      ' holderDays=' + leg.totalHolderDays };
  bars.supply = { pass: leg.totalHolderDays >= SUPPLY_FLOOR,
    detail: 'holderDays=' + leg.totalHolderDays + ' floor=' + SUPPLY_FLOOR };
  bars.wall = { pass: true,
    detail: 'wins=' + leg.wins + ' national=' + leg.national +
      ' wave5Unlocks=' + leg.wave5Unlocks + ' wave5FacedSeeds=' + leg.wave5FacedSeeds +
      ' medianSurvival=' + leg.medianSurvival + ' (table: not instrumented)' };
  bars.noGameCode = { pass: true, detail: 'zero src/js diffs in this arm (driver-side recorder only) — verified at evidence time via git status' };
  let verdict = 'COMPLETE';
  if (!bars.instrument.pass || !bars.classification.pass) verdict = 'INCOMPLETE';
  else if (!bars.supply.pass) verdict = 'INCONCLUSIVE-by-supply';
  return { verdict: verdict, bars: bars };
}

function selftest() {
  let pass = 0, fail = 0;
  function check(name, cond, detail) {
    if (cond) { pass++; console.log('ok   ' + name); }
    else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
  }
  function baseSeed(over) {
    const c = { seed: 1, mode: 'arm', anchorCommit: 'abc', gameSha: 'g', policySha: 'p',
      rearmOn: true, rearmPresent: true, cellgateFloor: 4,
      days: 150, gameDays: 150, endReason: 'survived', won: false, villageLost: false,
      scaleRank: 'regional', maxWave: 4, unlockedWave: 4, standing: 199,
      instrumentErrors: [], deaths: [], v4gunLoc: [], fightEvents: [],
      encounterEvents: [], killLootEvents: [], prizeEvents: [], grantEvents: [],
      rearmTakeEvents: [], corpseTakeEvents: [], volleyEvents: [], supplyCorpseRows: [] };
    if (over) Object.keys(over).forEach(function (k) { c[k] = over[k]; });
    return c;
  }
  function gunRow(day, vid, cells) {
    return { day: day, locations: [{ loc: 'equipped', vid: vid, count: 1, cells: cells }], total: 1, personFlags: {}, packCells: {} };
  }
  // F1: one holder-day per class (9 days, 9 classes) + precedence.
  const c1 = baseSeed();
  const holder = 'ada';
  for (let d = 1; d <= 9; d++) c1.v4gunLoc.push(gunRow(d, holder, 2));
  c1.fightEvents = [
    { day: 1, vid: holder, rwId: 'searcaster', ammoAtStart: 2, cellsAtStart: 2, wave: 4, mdefId: 'audit', allyVids: [], allies: 0, outcome: 'vKill', volley: { shots: 2, hits: 1, dmg: 33, ammoLeft: 0 }, allyVid: null, ally2Vid: null, ally3Vid: null, intent: 'engage', rounds: 3, vTaken: 10, calledHelp: false },
    { day: 2, vid: holder, rwId: 'searcaster', ammoAtStart: 2, cellsAtStart: 2, wave: 2, mdefId: 'review_drone', allyVids: [], allies: 0, outcome: 'vKill', volley: { shots: 0, hits: 0, dmg: 0, ammoLeft: 2 }, allyVid: null, ally2Vid: null, ally3Vid: null, intent: 'engage', rounds: 3, vTaken: 5, calledHelp: false },
    { day: 3, vid: holder, rwId: 'searcaster', ammoAtStart: 0, cellsAtStart: 0, wave: 4, mdefId: 'audit', allyVids: [], allies: 0, outcome: 'vKill', volley: { shots: 0, hits: 0, dmg: 0, ammoLeft: 0 }, allyVid: null, ally2Vid: null, ally3Vid: null, intent: 'engage', rounds: 3, vTaken: 5, calledHelp: false },
    { day: 4, vid: holder, rwId: 'searcaster', ammoAtStart: 2, cellsAtStart: 2, wave: 3, mdefId: 'spool', allyVids: [], allies: 0, outcome: 'evade', volley: null, allyVid: null, ally2Vid: null, ally3Vid: null, intent: 'learn', rounds: 0, vTaken: 0, calledHelp: false },
    { day: 5, vid: holder, rwId: 'searcaster', ammoAtStart: 2, cellsAtStart: 2, wave: 1, mdefId: 'bulldozer', allyVids: [], allies: 0, outcome: 'alreadyDead', volley: null, allyVid: null, ally2Vid: null, ally3Vid: null, intent: 'engage', rounds: 0, vTaken: 0, calledHelp: false },
    { day: 6, vid: holder, rwId: 'searcaster', ammoAtStart: 2, cellsAtStart: 2, wave: 5, mdefId: 'finale', allyVids: [], allies: 0, outcome: 'vFlee', volley: { shots: 0, hits: 0, dmg: 0, ammoLeft: 2 }, allyVid: null, ally2Vid: null, ally3Vid: null, intent: 'engage', rounds: 4, vTaken: 40, calledHelp: false },
    { day: 7, vid: 'bob', rwId: 'bow', ammoAtStart: 5, cellsAtStart: null, wave: 2, mdefId: 'heckler', allyVids: [], allies: 0, outcome: 'vKill', volley: { shots: 2, hits: 2, dmg: 30, ammoLeft: 3 }, allyVid: holder, ally2Vid: null, ally3Vid: null, intent: 'engage', rounds: 3, vTaken: 5, calledHelp: false },
    { day: 8, vid: 'carol', rwId: 'bow', ammoAtStart: 5, cellsAtStart: null, wave: 1, mdefId: 'bulldozer', allyVids: [holder], allies: 1, outcome: 'vKill', volley: null, allyVid: null, ally2Vid: null, ally3Vid: null, intent: 'engage', rounds: 2, vTaken: 0, calledHelp: false },
  ];
  c1.encounterEvents = [
    { day: 9, vid: 'dave', mid: 'hushwolf', wave: 1, candidates: [holder, 'erin'], raid: false, avoided: false, avoidReason: null, retOutcome: 'vKill' },
  ];
  // Day 8 note: holder is in carol's allyVids but never joined (allyVid null) -> candidate, not ally.
  const s1 = analyzeSeed(c1);
  check('class: 9 holder-days counted', s1.totalHolderDays === 9, 'got ' + s1.totalHolderDays);
  check('class: fired 1', s1.classCounts.fired === 1, JSON.stringify(s1.classCounts));
  check('class: led-cellgate-hold 1', s1.classCounts['led-cellgate-hold'] === 1, JSON.stringify(s1.classCounts));
  check('class: led-no-cells 1', s1.classCounts['led-no-cells'] === 1, JSON.stringify(s1.classCounts));
  check('class: led-evaded 1', s1.classCounts['led-evaded'] === 1, JSON.stringify(s1.classCounts));
  check('class: led-already-dead 1', s1.classCounts['led-already-dead'] === 1, JSON.stringify(s1.classCounts));
  check('class: led-other 1 (wave-5 cells>0 shots-0)', s1.classCounts['led-other'] === 1, JSON.stringify(s1.classCounts));
  check('class: ally-no-fire 1', s1.classCounts['ally-no-fire'] === 1, JSON.stringify(s1.classCounts));
  check('class: not-picked 2 (ally-listed day 8 + wild-node candidate day 9)', s1.classCounts['not-picked'] === 2, JSON.stringify(s1.classCounts));
  check('class: no-fight 0 (every day accounted for)', s1.classCounts['no-fight'] === 0, JSON.stringify(s1.classCounts));
  check('class: sum equals holder-days, 0 unclassified', s1.classSum === 9 && s1.unclassified === 0, 'sum=' + s1.classSum + ' unc=' + s1.unclassified);
  check('class: fightsLedByWave recorded', JSON.stringify(s1.perHolder[holder].fightsLedByWave) === JSON.stringify({ 1: 1, 2: 1, 3: 1, 4: 2, 5: 1 }), JSON.stringify(s1.perHolder[holder].fightsLedByWave));
  check('class: fightsAlliedByWave recorded', s1.perHolder[holder].fightsAlliedByWave[2] === 1, JSON.stringify(s1.perHolder[holder].fightsAlliedByWave));
  // F2: precedence — fired beats a cellgate hold on the same day.
  const c2 = baseSeed();
  c2.v4gunLoc.push(gunRow(1, holder, 2));
  c2.fightEvents = [
    { day: 1, vid: holder, rwId: 'searcaster', ammoAtStart: 2, cellsAtStart: 2, wave: 2, mdefId: 'review_drone', allyVids: [], allies: 0, outcome: 'vKill', volley: { shots: 0, hits: 0, dmg: 0, ammoLeft: 2 }, allyVid: null, ally2Vid: null, ally3Vid: null, intent: 'engage', rounds: 3, vTaken: 5, calledHelp: false },
    { day: 1, vid: holder, rwId: 'searcaster', ammoAtStart: 2, cellsAtStart: 2, wave: 4, mdefId: 'audit', allyVids: [], allies: 0, outcome: 'vKill', volley: { shots: 2, hits: 1, dmg: 33, ammoLeft: 0 }, allyVid: null, ally2Vid: null, ally3Vid: null, intent: 'engage', rounds: 3, vTaken: 10, calledHelp: false },
  ];
  const s2 = analyzeSeed(c2);
  check('precedence: fired wins over a same-day hold', s2.classCounts.fired === 1 && s2.classCounts['led-cellgate-hold'] === 0, JSON.stringify(s2.classCounts));
  // F3: first-led-fight decides among led-* (evade first, hold second -> evaded).
  const c3 = baseSeed();
  c3.v4gunLoc.push(gunRow(1, holder, 2));
  c3.fightEvents = [
    { day: 1, vid: holder, rwId: 'searcaster', ammoAtStart: 2, cellsAtStart: 2, wave: 3, mdefId: 'spool', allyVids: [], allies: 0, outcome: 'evade', volley: null, allyVid: null, ally2Vid: null, ally3Vid: null, intent: 'learn', rounds: 0, vTaken: 0, calledHelp: false },
    { day: 1, vid: holder, rwId: 'searcaster', ammoAtStart: 2, cellsAtStart: 2, wave: 2, mdefId: 'review_drone', allyVids: [], allies: 0, outcome: 'vKill', volley: { shots: 0, hits: 0, dmg: 0, ammoLeft: 2 }, allyVid: null, ally2Vid: null, ally3Vid: null, intent: 'engage', rounds: 3, vTaken: 5, calledHelp: false },
  ];
  const s3 = analyzeSeed(c3);
  check('precedence: first led fight decides (evade first)', s3.classCounts['led-evaded'] === 1 && s3.classCounts['led-cellgate-hold'] === 0, JSON.stringify(s3.classCounts));
  // F4: fixture counter on a synthetic old-format file (Ella shape).
  const old = { seed: 107737, v4gunLoc: [], volleyEvents: [], rearmTakeEvents: [{ day: 73, taker: 'ella_johnson', corpseVid: 'sam_wilson', kind: 'second-life', gun: true, cells: 2, channel: 'expedition' }] };
  for (let d = 74; d <= 150; d++) old.v4gunLoc.push(gunRow(d, 'ella_johnson', 2));
  const fx = (function () {
    let holderDays = 0;
    (old.v4gunLoc || []).forEach(function (row) {
      if ((row.locations || []).some(function (l) { return l.loc === 'equipped' && l.vid === 'ella_johnson' && (l.cells || 0) > 0; })) holderDays++;
    });
    const searFired = (old.volleyEvents || []).filter(function (e) { return e.vid === 'ella_johnson' && e.rwId === 'searcaster' && (e.shots || 0) > 0; });
    return { holderDays: holderDays, searFired: searFired.length };
  })();
  check('fixture-counter: Ella shape 77 holder-days', fx.holderDays === 77, 'got ' + fx.holderDays);
  check('fixture-counter: Ella shape 0 searcaster volleys fired', fx.searFired === 0, 'got ' + fx.searFired);
  // F5: acquisition sources.
  const c5 = baseSeed();
  c5.v4gunLoc.push(gunRow(10, 'bob', 2), gunRow(11, 'bob', 2));
  c5.killLootEvents = [{ day: 9, vid: 'bob', dropId: 'searcaster', gains: [{ holder: 'bob', gunsGained: 1, cellsGained: 2, cellsAfter: 2 }] }];
  c5.rearmTakeEvents = [];
  const s5 = analyzeSeed(c5);
  check('acquisition: staged kill-loot arrival', s5.perHolder.bob.acquisition.source === 'staged' && s5.perHolder.bob.acquisition.day === 9, JSON.stringify(s5.perHolder.bob.acquisition));
  check('acquisition: fate still-holding', s5.perHolder.bob.fate === 'still-holding', s5.perHolder.bob.fate);
  const c5b = baseSeed();
  c5b.v4gunLoc.push(gunRow(10, 'bob', 2));
  c5b.rearmTakeEvents = [{ day: 9, taker: 'bob', corpseVid: 'amina', kind: 'second-life', gun: true, cells: 1, channel: 'expedition' }];
  const s5b = analyzeSeed(c5b);
  check('acquisition: rearm-take expedition', s5b.perHolder.bob.acquisition.source === 'rearm-take:expedition', JSON.stringify(s5b.perHolder.bob.acquisition));
  const c5c = baseSeed();
  c5c.v4gunLoc.push(gunRow(10, 'bob', 2));
  const s5c = analyzeSeed(c5c);
  check('acquisition: unknown when no event', s5c.perHolder.bob.acquisition.source === 'unknown', JSON.stringify(s5c.perHolder.bob.acquisition));
  // F6: judgeLeg verdicts (built from leg objects directly; the
  // instrument bar's policySha/anchor inputs are judged by analyzeLeg
  // on real corpora, not by these synthetic legs).
  const legOk = { seeds: 8, totalHolderDays: 120, classCounts: { fired: 10, 'led-cellgate-hold': 20, 'led-no-cells': 0, 'led-evaded': 5, 'led-already-dead': 0, 'led-other': 0, 'ally-no-fire': 15, 'not-picked': 10, 'no-fight': 60 }, unclassified: 0, instrumentErrors: 0, anchors: { abc: 8 }, policyShaMismatches: 0, rearmOff: 0, rearmPresentOff: 0, klArrivals: 8, klBundled: 8, klDry: 0, wins: 0, national: 0, wave5Unlocks: 0, wave5FacedSeeds: 0, medianSurvival: 140 };
  const jOk = judgeLeg(legOk);
  check('judge: COMPLETE on valid + supplied leg', jOk.verdict === 'COMPLETE', jOk.verdict);
  const legThin = Object.assign({}, legOk, { totalHolderDays: 40, classCounts: { fired: 0, 'led-cellgate-hold': 0, 'led-no-cells': 0, 'led-evaded': 0, 'led-already-dead': 0, 'led-other': 0, 'ally-no-fire': 0, 'not-picked': 0, 'no-fight': 40 } });
  const jThin = judgeLeg(legThin);
  check('judge: INCONCLUSIVE-by-supply below the 60 floor', jThin.verdict === 'INCONCLUSIVE-by-supply', jThin.verdict);
  const legBad = Object.assign({}, legOk, { unclassified: 3 });
  const jBad = judgeLeg(legBad);
  check('judge: INCOMPLETE on unclassified days', jBad.verdict === 'INCOMPLETE', jBad.verdict);
  const legErr = Object.assign({}, legOk, { instrumentErrors: 1 });
  const jErr = judgeLeg(legErr);
  check('judge: INCOMPLETE on instrument errors', jErr.verdict === 'INCOMPLETE', jErr.verdict);
  console.log('SELFTEST: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  } else if (args.indexOf('--fixture') !== -1) {
    const i = args.indexOf('--fixture');
    const file = args[i + 1], vid = args[i + 2];
    if (!file || !vid) { console.error('usage: --fixture <oldPerSeedFile> <vid>'); process.exit(2); }
    console.log(JSON.stringify(fixtureHolder(file, vid), null, 2));
    process.exit(0);
  } else {
    const di = args.indexOf('--dir');
    const dir = di !== -1 ? args[di + 1] : null;
    if (!dir) { console.error('usage: --selftest | --fixture <file> <vid> | --dir <dir> [--out <file>]'); process.exit(2); }
    const leg = analyzeLeg(loadDir(dir));
    leg.judgment = judgeLeg(leg);
    const oi = args.indexOf('--out');
    if (oi !== -1 && args[oi + 1]) fs.writeFileSync(args[oi + 1], JSON.stringify(leg, null, 2) + '\n');
    console.log(JSON.stringify({ verdict: leg.judgment.verdict, bars: leg.judgment.bars,
      totalHolderDays: leg.totalHolderDays, classCounts: leg.classCounts,
      unclassified: leg.unclassified, holders: leg.holders,
      klArrivals: leg.klArrivals, klBundled: leg.klBundled, klDry: leg.klDry,
      rearmTakes: leg.rearmTakes, fightEvents: leg.fightEvents,
      encounterEvents: leg.encounterEvents, wins: leg.wins, national: leg.national,
      wave5Unlocks: leg.wave5Unlocks, wave5FacedSeeds: leg.wave5FacedSeeds,
      medianSurvival: leg.medianSurvival, instrumentErrors: leg.instrumentErrors,
      carriedLoadedDays: leg.carriedLoadedDays,
      scholarEquippedDays: leg.scholarEquippedDays,
      scholarSearVolleys: leg.scholarSearVolleys,
      villagerSearVolleys: leg.villagerSearVolleys,
      transfersSuspected: leg.transfersSuspected, ledOtherDetail: leg.ledOtherDetail }, null, 2));
    process.exit(leg.judgment.verdict === 'INCOMPLETE' ? 1 : 0);
  }
}

module.exports = { analyzeSeed: analyzeSeed, analyzeLeg: analyzeLeg, judgeLeg: judgeLeg,
  fixtureHolder: fixtureHolder, median: median, selftest: selftest,
  CLASSES: CLASSES, SUPPLY_FLOOR: SUPPLY_FLOOR };
