// sortiev2-replay.js — Q1 corpus replay for sim-sortiev2-a (diagnostic only).
// Replays the pre-registered reactive invalidation rule over the ARCHIVE
// sortie-b per-seed JSONs (evidence/2026-11-03/perseed-sortie-a/,
// variant arm only). No game code is loaded, no sim runs, no engine
// channel is read: the inputs are the recorded offers and attempts.
//
// RULE (from scripts/sortiev2-prereg-20261103.md): an offer recorded
// before a 'none' verb return is dead — the treeline was empty at that
// return, so every offer announced before it names a lingerer that has
// already left. A fresh offer recorded after the return may be answered.
// 'no-fighters' does NOT invalidate (treeline occupied, bench bare).
//
// ORDERING (why the day comparison is strict): in the day loop the
// policy daily runs BEFORE sleep, and the gorge lines are spoken during
// endDay (sleep). So an offer stamped with day O is announced AFTER
// that day's daily answers. An attempt on day N therefore answers an
// offer that predates a 'none' on day M iff offerDay < M < N. An offer
// stamped on the 'none' day itself postdates that day's answer and is
// fresh, not stale.
//
// The replay walks attempts in recorded order, carrying
// invalidatedThrough = the day of the latest KEPT 'none' (a suppressed
// attempt never happened, so it cannot invalidate anything further).
// An attempt is suppressed iff its offerDay < invalidatedThrough.
// The replay is a filter on the recorded sequence, NOT a re-simulation:
// 'none' returns happen before any muster or ration spend, so a
// suppressed attempt changes no game state except the spoken 'none'
// line itself, which no decision input reads. Kept attempts keep
// their recorded outcomes; the replay claims nothing about how a
// re-run trajectory would diverge past a kept attempt.
'use strict';
const fs = require('fs');
const path = require('path');

function replaySeed(doc) {
  const offers = doc.offers || [];
  const attempts = doc.attempts || [];
  let invalidatedThrough = -Infinity;
  let kept = 0, suppressed = 0;
  let keptNone = 0, suppressedNone = 0;
  const suppressedWhys = [];
  const keptList = [], suppressedList = [];
  for (const a of attempts) {
    const offerDay = (a.offerDay | 0);
    const day = (a.day | 0);
    if (invalidatedThrough !== -Infinity && offerDay < invalidatedThrough && invalidatedThrough < day) {
      suppressed++;
      if (a.why === 'none') suppressedNone++;
      suppressedWhys.push(a.why || null);
      suppressedList.push({ day, offerDay, name: a.name, why: a.why || null });
    } else {
      kept++;
      if (a.why === 'none') { keptNone++; invalidatedThrough = day; }
      keptList.push({ day, offerDay, name: a.name, why: a.why || null, ok: !!a.ok });
    }
  }
  return {
    seed: doc.seed, offers: offers.length, attempts: attempts.length,
    kept, suppressed, keptNone, suppressedNone,
    suppressedWhys, keptList, suppressedList,
  };
}

function replayDir(dir) {
  const files = fs.readdirSync(dir)
    .filter(f => f.startsWith('s-variant-') && f.endsWith('.json'))
    .sort();
  const perSeed = [];
  for (const f of files) {
    const doc = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    perSeed.push(replaySeed(doc));
  }
  const total = perSeed.reduce((acc, s) => {
    acc.offers += s.offers; acc.attempts += s.attempts;
    acc.kept += s.kept; acc.suppressed += s.suppressed;
    acc.keptNone += s.keptNone; acc.suppressedNone += s.suppressedNone;
    return acc;
  }, { offers: 0, attempts: 0, kept: 0, suppressed: 0, keptNone: 0, suppressedNone: 0 });
  return { perSeed, total };
}

if (require.main === module) {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-03', 'perseed-sortie-a');
  const { perSeed, total } = replayDir(dir);
  for (const s of perSeed) {
    console.log(`seed ${s.seed}: offers=${s.offers} attempts=${s.attempts} kept=${s.kept} suppressed=${s.suppressed} none kept=${s.keptNone} suppressed=${s.suppressedNone} suppressedWhys=[${s.suppressedWhys.join(',')}]`);
  }
  console.log(`TOTAL: offers=${total.offers} attempts=${total.attempts} kept=${total.kept} suppressed=${total.suppressed} none kept=${total.keptNone} suppressed=${total.suppressedNone}`);
}

module.exports = { replaySeed, replayDir };
