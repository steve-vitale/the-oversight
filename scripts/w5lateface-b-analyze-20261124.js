// w5lateface-b — wave-5 facing after a LATE unlock (DIAG, re-analysis).
// Zero src/js. Reads only the committed corpora named in the prereg
// (gearready pilot, standingconfirm, vetpair, bloodcluster v2) and
// derives, per unlocked seed: door day, first-face day, runway,
// days-to-face, post-door contacts, post-door village state, and a
// frozen outcome class for every late-unlocked seed.
//   node scripts/w5lateface-b-analyze-20261124.js [--out <path>]
// Prints the JSON summary to stdout; with --out also writes it.
// Require-able: module.exports = { analyze, classifySeed, deriveSeed,
//   LATE_CUTOFF, CORPORA }.
'use strict';
const fs = require('fs');
const path = require('path');

const LATE_CUTOFF = 100; // frozen in the prereg: door day > 100 is LATE.
const ADEQUATE_RUNWAY = 30; // pre-registered secondary split.
const REPO = path.resolve(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-11-24');

const CORPORA = [
  { name: 'gearready-pilot', dir: 'perseed-standing-gearready-b',
    seeds: ['109301', '109302', '109303', '109304', '109305', '109306', '109307', '109308'],
    file: s => `standing-gearready-b-s${s}-standing-gearready-b.json` },
  { name: 'standingconfirm', dir: 'perseed-standing-gearready-b',
    seeds: ['109310', '109311', '109312', '109313', '109314', '109315', '109316', '109317',
            '109318', '109319', '109320', '109321', '109322', '109323', '109324', '109325'],
    file: s => `standing-gearready-b-s${s}-standingconfirm-b.json` },
  { name: 'vetpair', dir: 'perseed-vetpair-b',
    seeds: ['109310', '109311', '109312', '109313', '109314', '109315', '109316', '109317',
            '109318', '109319', '109320', '109321', '109322', '109323', '109324', '109325'],
    file: s => `vetpair-b-s${s}-vetpair-b.json` },
  { name: 'bloodcluster-v2', dir: 'perseed-bloodcluster-b',
    seeds: ['109310', '109311', '109312', '109313', '109314', '109315', '109316', '109317',
            '109318', '109319', '109320', '109321', '109322', '109323', '109324', '109325'],
    file: s => `bloodcluster-b-s${s}-bloodcluster-b-v2.json` },
];

function loadJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function minDay(days) {
  const ds = days.filter(d => d != null);
  return ds.length ? Math.min.apply(null, ds) : null;
}

// First daily snapshot with peak >= 5. Release lines may stamp the
// day before (the release fires after that day's snapshot); the
// cross-check in deriveSeed reports a >1-day disagreement.
function doorDayOf(rec) {
  const daily = rec.daily || [];
  for (const d of daily) { if ((d.peak | 0) >= 5) return d.day; }
  return null;
}

function releaseDayOf(rec) {
  const lines = rec.releaseLines || [];
  return lines.length ? Math.min.apply(null, lines.map(l => l.day)) : null;
}

function firstW5FacedDayOf(rec) {
  const daily = rec.daily || [];
  for (const d of daily) { if ((d.w5faced | 0) > 0) return d.day; }
  return null;
}

// Deduped wave-5 kills only: recordWaveKill can be called twice for
// one kill (vetpair correction — the second call has entryAdded false
// and adds no log row). Count log rows, never calls.
function w5KillsOf(rec) {
  return (rec.killEvents || [])
    .filter(k => (k.wave | 0) === 5 && k.entryAdded !== false)
    .map(k => ({ day: k.day, mid: k.mid, by: k.by, via: k.via }));
}

function firstW5KillDayOf(rec) {
  const ks = w5KillsOf(rec);
  return ks.length ? Math.min.apply(null, ks.map(k => k.day)) : null;
}

// Contact rows exist only in the bloodcluster corpus (fieldFights /
// tbStarts). Absent keys mean "no contact data", never "no contacts".
function postDoorContacts(rec, doorDay) {
  if (!rec.fieldFights && !rec.tbStarts) return null;
  const ff = rec.fieldFights || [];
  const tb = rec.tbStarts || [];
  const w5f = ff.filter(f => (f.wave | 0) === 5 && f.day >= doorDay);
  const w5t = tb.filter(t => (t.wave | 0) === 5 && t.day >= doorDay);
  const w4f = ff.filter(f => (f.wave | 0) === 4 && f.day >= doorDay);
  const w4t = tb.filter(t => (t.wave | 0) === 4 && t.day >= doorDay);
  return {
    w5field: w5f.length, w5tb: w5t.length,
    w4field: w4f.length, w4tb: w4t.length,
    w5total: w5f.length + w5t.length,
    w4total: w4f.length + w4t.length,
    firstW5ContactDay: minDay(w5f.concat(w5t).map(r => r.day)),
    w5fieldRows: w5f.map(f => ({ day: f.day, mid: f.mid, outcome: f.outcome, rounds: f.rounds })),
    w5tbRows: w5t.map(t => ({ day: t.day, mid: t.mid, partySize: t.partySize })),
  };
}

function postDoorState(rec, doorDay) {
  const daily = rec.daily || [];
  const after = daily.filter(d => d.day >= doorDay);
  if (!after.length) return null;
  const first = after[0];
  const last = after[after.length - 1];
  const bars = d => (d.readiness5 || {});
  return {
    atDoor: { day: first.day, ready: !!bars(first).ready,
      veterans: bars(first).veterans, armored: bars(first).armored,
      armed: bars(first).armed, short: (bars(first).short || []).slice() },
    atEnd: { day: last.day, ready: !!bars(last).ready,
      veterans: bars(last).veterans, armored: bars(last).armored,
      armed: bars(last).armed, short: (bars(last).short || []).slice() },
    readyDaysAfterDoor: after.filter(d => bars(d).ready).length,
  };
}

// Per-seed derivation from one corpus record. firstFaceDay is the
// earliest evidence of a blow-by-blow wave-5 fight: snapshot count,
// kill, or contact row. Snapshot timing can put a kill a day before
// the first w5faced snapshot (109306: kill d101, faced d102) — the
// kill is the face, so the min is the honest day.
function deriveSeed(rec) {
  const doorDay = doorDayOf(rec);
  const releaseDay = releaseDayOf(rec);
  const firstFaced = firstW5FacedDayOf(rec);
  const firstKill = firstW5KillDayOf(rec);
  const contacts = doorDay != null ? postDoorContacts(rec, doorDay) : null;
  const firstContact = contacts ? contacts.firstW5ContactDay : null;
  const firstFaceDay = minDay([firstFaced, firstKill, firstContact]);
  const days = rec.days;
  return {
    seed: String(rec.seed),
    days, endReason: rec.endReason || null,
    villageLost: !!rec.villageLost, scaleRank: rec.scaleRank || null,
    doorDay, releaseDay,
    doorCrossCheckOk: doorDay == null || releaseDay == null ||
      Math.abs(doorDay - releaseDay) <= 1,
    firstFacedDay: firstFaced, firstKillDay: firstKill,
    firstContactDay: firstContact,
    firstFaceDay,
    faced: firstFaceDay != null,
    runway: doorDay != null ? days - doorDay : null,
    daysToFace: (doorDay != null && firstFaceDay != null) ? firstFaceDay - doorDay : null,
    w5kills: w5KillsOf(rec),
    contacts,
    postDoorState: doorDay != null ? postDoorState(rec, doorDay) : null,
    hasContactData: !!(rec.fieldFights || rec.tbStarts),
  };
}

// Frozen outcome taxonomy (prereg). Every late seed gets exactly one
// class; anything else is UNCLASSIFIED and fails the GO bar.
function classifySeed(s) {
  if (s.doorDay == null) return { cls: 'UNCLASSIFIED', why: 'no door day in corpus' };
  if (s.faced) return { cls: 'FACED', why: 'first face day ' + s.firstFaceDay + ' (' + s.daysToFace + 'd after door)' };
  if (s.villageLost) return { cls: 'DIED-BEFORE-FACE', why: 'village lost day ' + s.days + ', no wave-5 contact before the loss' };
  // Survived to horizon with no face: only a NO-SPAWN call when the
  // spawn-side control shows the village kept meeting monsters
  // (wave-4+ contacts post-door) — otherwise the window may simply
  // have had no meetings at all, which the corpora cannot separate.
  if (s.contacts) {
    if (s.contacts.w5total === 0 && s.contacts.w4total > 0) {
      return { cls: 'NO-SPAWN', why: '0 wave-5 contacts in ' + s.runway + ' post-door days while ' + s.contacts.w4total + ' wave-4 contacts continued' };
    }
    return { cls: 'UNCLASSIFIED', why: 'survived, no wave-5 face, and no wave-4 post-door contacts to separate no-spawn from no-meetings' };
  }
  return { cls: 'UNCLASSIFIED', why: 'survived, no wave-5 face, and no contact rows in this corpus to test the spawn side' };
}

function analyze(evidenceDir) {
  const root = evidenceDir || EVID;
  const bySeed = {}; // seed -> { corpusName: derived }
  const missing = [];
  for (const corp of CORPORA) {
    for (const seed of corp.seeds) {
      const p = path.join(root, corp.dir, corp.file(seed));
      if (!fs.existsSync(p)) { missing.push(p); continue; }
      const rec = loadJson(p);
      const d = deriveSeed(rec);
      d.corpus = corp.name;
      (bySeed[seed] = bySeed[seed] || {})[corp.name] = d;
    }
  }
  // Cross-corpus agreement on seeds present in >1 corpus: door day
  // and face day from snapshot/kill evidence only (contact rows exist
  // in one corpus and legitimately precede the first snapshot).
  const disagreements = [];
  for (const seed of Object.keys(bySeed).sort()) {
    const group = bySeed[seed];
    const names = Object.keys(group);
    if (names.length < 2) continue;
    const doors = [...new Set(names.map(n => group[n].doorDay))];
    if (doors.length > 1) disagreements.push({ seed, field: 'doorDay', values: names.map(n => [n, group[n].doorDay]) });
    const faceNoContact = names.map(n => {
      const g = group[n];
      return minDay([g.firstFacedDay, g.firstKillDay]);
    });
    if ([...new Set(faceNoContact)].length > 1) {
      disagreements.push({ seed, field: 'firstFaceDay(snapshot/kill)', values: names.map((n, i) => [n, faceNoContact[i]]) });
    }
  }
  // One canonical record per seed: prefer the corpus with contact
  // rows (bloodcluster-v2), else standingconfirm, else vetpair, else
  // gearready-pilot. All corpora agree on door/face days (checked
  // above); the preference only decides which contact/state detail
  // is reported.
  const prefer = ['bloodcluster-v2', 'standingconfirm', 'vetpair', 'gearready-pilot'];
  const seeds = [];
  for (const seed of Object.keys(bySeed).sort()) {
    const group = bySeed[seed];
    const pick = prefer.find(n => group[n]) || Object.keys(group)[0];
    seeds.push(group[pick]);
  }
  const unlocks = seeds.filter(s => s.doorDay != null)
    .map(s => {
      const late = s.doorDay > LATE_CUTOFF;
      const cls = late ? classifySeed(s) : null;
      return Object.assign({}, s, { late, outcome: cls ? cls.cls : null, outcomeWhy: cls ? cls.why : null });
    })
    .sort((a, b) => a.doorDay - b.doorDay);
  const lateSeeds = unlocks.filter(s => s.late);
  const facedLate = lateSeeds.filter(s => s.outcome === 'FACED');
  const unclassified = lateSeeds.filter(s => s.outcome === 'UNCLASSIFIED');
  const facedUnlocks = unlocks.filter(s => s.faced);
  const lags = facedUnlocks.map(s => s.daysToFace).sort((a, b) => a - b);
  const median = lags.length ? lags[Math.floor(lags.length / 2)] : null;
  // Adequate-runway split (pre-registered secondary): late seeds
  // with >= 30 days of runway.
  const adequate = lateSeeds.filter(s => (s.runway | 0) >= ADEQUATE_RUNWAY);
  // Post-door wave-5 contact rate vs the 55% intended cast share
  // (Game.spawnWaveTarget, top wave 5): contacts are fights that
  // happened, not casts, so this is a contact-mix number, not a
  // cast number — reported as observed, with the 55% as the yardstick.
  const withContacts = unlocks.filter(s => s.contacts);
  const contactMix = withContacts.map(s => ({
    seed: s.seed, doorDay: s.doorDay, runway: s.runway,
    w5: s.contacts.w5total, w4: s.contacts.w4total,
    w5share: (s.contacts.w5total + s.contacts.w4total) > 0
      ? +(s.contacts.w5total / (s.contacts.w5total + s.contacts.w4total)).toFixed(2) : null,
  }));
  return {
    lateCutoff: LATE_CUTOFF, adequateRunway: ADEQUATE_RUNWAY,
    corpora: CORPORA.map(c => c.name),
    missingFiles: missing,
    seedsExamined: seeds.length,
    unlocks: unlocks.map(s => ({
      seed: s.seed, corpus: s.corpus, doorDay: s.doorDay, releaseDay: s.releaseDay,
      doorCrossCheckOk: s.doorCrossCheckOk, late: s.late,
      firstFaceDay: s.firstFaceDay, daysToFace: s.daysToFace, faced: s.faced,
      runway: s.runway, outcome: s.outcome, outcomeWhy: s.outcomeWhy,
      w5kills: s.w5kills, days: s.days, endReason: s.endReason, villageLost: s.villageLost,
      contacts: s.contacts ? {
        w5total: s.contacts.w5total, w4total: s.contacts.w4total,
        w5fieldRows: s.contacts.w5fieldRows, w5tbRows: s.contacts.w5tbRows,
      } : null,
      postDoorState: s.postDoorState,
    })),
    primary: {
      lateUnlocked: lateSeeds.length,
      facedLate: facedLate.length,
      share: lateSeeds.length ? +(facedLate.length / lateSeeds.length).toFixed(3) : null,
      unclassifiedLate: unclassified.length,
      unclassifiedSeeds: unclassified.map(s => s.seed),
    },
    secondary: {
      adequateRunwayLate: adequate.length,
      adequateRunwayFaced: adequate.filter(s => s.outcome === 'FACED').length,
      adequateRunwaySeeds: adequate.map(s => s.seed),
      daysToFaceAllFaced: lags,
      daysToFaceMedian: median,
      daysToFaceMax: lags.length ? lags[lags.length - 1] : null,
      contactMix,
    },
    crossCorpus: { disagreements },
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const out = analyze();
  const text = JSON.stringify(out, null, 2);
  if (outIdx >= 0 && args[outIdx + 1]) fs.writeFileSync(args[outIdx + 1], text + '\n');
  process.stdout.write(text + '\n');
}

module.exports = { analyze, classifySeed, deriveSeed, LATE_CUTOFF, ADEQUATE_RUNWAY, CORPORA };
