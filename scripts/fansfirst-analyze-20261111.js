// fansfirst-analyze-20261111.js — fans / audience first-numbers analyzer
// (arm sim-fansfirst-a, run fleshout-20261111T0715Z). Pure functions over
// the per-seed JSONs the driver writes; no sim, no Game.
//
// Classifiers:
//   classifyFavorWhy(why) — contest-win / show / highlight /
//     fight-outcome / death-reel / sigW5 / group-encounter / other:<first
//     token> / unclassified. 'unclassified' means why is empty or
//     missing — never a guess.
//   classifyPackage(ev) — sent / gate-blocked / cooldown-blocked.
//     Roll-blocked lives on the DAILY record (pkgRoll), never on the
//     package event itself: a failed 25% roll means apCarePackage is
//     never called, so there is no event to classify.
//   classifyBoon(ev) — fired-<lane> / gate-blocked / cooldown-blocked /
//     roll-blocked (from pre-state + return: fired means returned true;
//     gate means top lane <25; cooldown means inside 5 days; else roll).
//   classifyFeed(ev) — fired-<band> / cooldown-blocked / roll-blocked
//     (fired band from favor at call: >=25 growing, <=-30 restless,
//     else watching).
//   classifySayLine(line) — package / package-club-credit / boon /
//     feed-growing / feed-restless / feed-watching / feed-lane /
//     favor-announce / trial-offer / trial-expired / trial-complete /
//     interference / persona-package / other-fan / unclassified.
//   findNamedFanLines(lines) — the canon check: lines that NAME a fan
//     persona (a proper noun attached to 'fan'/'viewer' as a person).
//     Returns matches; an empty result is a measured zero, not an
//     assumption — the corpus was searched, and the snapshots carry
//     no fan roster/pool/draw state.
//   reconcileFavor(seed) — snapshot club deltas vs summed favor
//     events per lane; residue per lane (drift is a −1/3d engine
//     move, not a favor event, so residue is expected to equal the
//     drift total — the reconciler reports drift separately and
//     flags any residue BEYOND drift as unattributed).
//
// summarize(seedObj) aggregates one per-seed file; summarizeBand(list)
// aggregates the band. CLI: node scripts/fansfirst-analyze-20261111.js
// <dir-with-per-seed-jsons> [out.json] — prints the band summary JSON.
'use strict';
const fs = require('fs');
const path = require('path');

const LANES = ['fight', 'survival', 'social', 'showbiz'];

function classifyFavorWhy(why) {
  if (why == null || String(why).trim() === '') return 'unclassified';
  const w = String(why);
  if (/won .* on camera/.test(w)) return 'contest-win';
  if (/shone on |beautiful disaster on /.test(w)) return 'show';
  if (/highlight package/.test(w)) return 'highlight';
  if (/Death Reel/.test(w)) return 'death-reel';
  if (/faced down a group encounter/.test(w)) return 'group-encounter';
  if (/defeated |lost to |fled from /.test(w)) return 'fight-outcome';
  if (/overrules your cancellation/.test(w)) return 'sigW5';
  if (/the audience can vote|voted/.test(w)) return 'boon-vote';
  const first = w.trim().split(/\s+/)[0].replace(/[^A-Za-z]/g, '') || 'other';
  return 'other:' + first.toLowerCase();
}

function classifyPackage(ev) {
  if (!ev) return 'unclassified';
  if (ev.returned) return 'sent';
  if ((ev.favorAtCall == null ? -999 : ev.favorAtCall) < 12) return 'gate-blocked';
  return 'cooldown-blocked';
}

function classifyBoon(ev) {
  if (!ev) return 'unclassified';
  if (ev.returned) return 'fired-' + (ev.topLane || 'unknown');
  if ((ev.topValue == null ? -999 : ev.topValue) < 25) return 'gate-blocked';
  if (ev.lastBoonDay != null && (ev.day - ev.lastBoonDay) < 5) return 'cooldown-blocked';
  return 'roll-blocked';
}

function classifyFeed(ev) {
  if (!ev) return 'unclassified';
  if (ev.returned) {
    const f = ev.favorAtCall;
    if (f != null && f >= 25) return 'fired-growing';
    if (f != null && f <= -30) return 'fired-restless';
    return 'fired-watching';
  }
  if (ev.lastFeedDay != null && (ev.day - ev.lastFeedDay) < 1) return 'cooldown-blocked';
  return 'roll-blocked';
}

function classifySayLine(line) {
  if (line == null || String(line).trim() === '') return 'unclassified';
  const s = String(line);
  if (/AUDIENCE TRIAL/.test(s)) return 'trial-offer';
  if (/The trial window closed/.test(s)) return 'trial-expired';
  if (/care package drops/.test(s)) return 'package';
  if (/WE LOVE YOU/.test(s)) return 'package-club-credit';
  if (/voted: a training stimulant|voted: trail rations|voted: a spotlight segment|voted: a wacky curio/.test(s)) return 'boon';
  if (/fan club is GROWING|Betting pools favor you/.test(s)) return 'feed-growing';
  if (/crowd is getting restless|approval rating just dropped|threw a tomato/.test(s)) return 'feed-restless';
  if (/The audience is watching/.test(s)) return 'feed-watching';
  if (/fight clubs are making banners|long-haul fans are sending trail mix|moot crowd has a chant|most watchable human/.test(s)) return 'feed-lane';
  if (/📈|📉/.test(s) && /favor:/.test(s)) return 'favor-announce';
  if (/in the judging booth|judges is smiling/.test(s)) return 'interference';
  if (/fan letter|biggest fan \(you\)/.test(s)) return 'persona-package';
  if (/fan|audience|viewer|favor|showbiz|moot|crowd|cheer|boo|📦/i.test(s)) return 'other-fan';
  return 'unclassified';
}

// The canon check: a line NAMES a fan persona when a capitalized
// proper noun sits next to fan/viewer language as a person
// ("Zyx the fan", "your fan, Zyx", "fan Zyx says"). Generic club
// nouns ("your fight fans", "the moot crowd") do NOT match: they
// name a segment, not a person. A match is reported verbatim so a
// reader can judge it; no match is a measured zero.
function findNamedFanLines(lines) {
  const out = [];
  const NONAME = { Your: 1, The: 1, Our: 1, That: 1, This: 1, A: 1, An: 1 };
  // Two separate patterns, name-after-fan first: in 'Your fan, Mara',
  // the name is Mara, not Your — a single alternation matches 'Your
  // fan' at position 0 and never reaches the 'fan, Mara' branch.
  // NO /i flag: with /i, [A-Z] matches lowercase words too, so 'fan
  // sends' and 'fan club' would "name" sends/club. Fan/viewer are
  // matched case-insensitively by hand; the NAME must be truly
  // capitalized.
  const AFTER = /\b(?:[Ff]an|[Vv]iewer)\s*,?\s+(?:named\s+)?([A-Z][a-z]{2,})\b|\b[Ff]an\s+([A-Z][a-z]{2,})\s+says\b/;
  const BEFORE = /\b([A-Z][a-z]{2,})\s+(?:the\s+)?(?:[Ff]an|[Vv]iewer)\b/;
  (lines || []).forEach(function (l) {
    const line = (l && l.line != null) ? String(l.line) : String(l || '');
    if (!line) return;
    // Exclude the known generic segment nouns.
    if (/your (fight|survival|showbiz) fans|your moot crowd|your fans\b/i.test(line)) {
      // Still allow a match if a distinct proper noun is attached.
      if (!/\b[A-Z][a-z]{2,}\b.*\bfan\b|\bfan\b.*\b[A-Z][a-z]{2,}\b/.test(line)) return;
    }
    let name = null;
    const m1 = AFTER.exec(line);
    if (m1) name = m1[1] || m1[2] || null;
    if (!name) {
      const m2 = BEFORE.exec(line);
      if (m2) name = m2[1] || null;
    }
    // 'Your fan club' is not a person named Your: determiners and
    // possessives are not names.
    if (name && NONAME[name]) name = null;
    if (name) out.push({ line: line.slice(0, 300), name: name, day: (l && l.day != null) ? l.day : null });
  });
  return out;
}

function countBy(arr, fn) {
  const out = {};
  (arr || []).forEach(function (x) {
    const k = fn(x);
    out[k] = (out[k] || 0) + 1;
  });
  return out;
}

function summarize(seed) {
  const s = { seed: seed.seed, mode: seed.mode, days: seed.days, endReason: seed.endReason,
    won: seed.won, maxWave: seed.maxWave, standing: seed.standing, scaleRank: seed.scaleRank,
    endPantryKcal: seed.endPantryKcal, deaths: (seed.deaths || []).length,
    errors: (seed.instrumentErrors || []).length };
  if (seed.mode === 'neutral' || !seed.favorEvents) {
    s.neutral = true;
    return s;
  }
  const fav = seed.favorEvents || [];
  s.favorEvents = fav.length;
  s.favorByLane = countBy(fav, function (e) { return e.lane || 'unknown'; });
  s.favorByWhy = countBy(fav, function (e) { return classifyFavorWhy(e.why); });
  s.favorUnclassified = fav.filter(function (e) { return classifyFavorWhy(e.why) === 'unclassified'; }).length;
  s.favorNetByLane = {};
  LANES.forEach(function (L) {
    s.favorNetByLane[L] = fav.filter(function (e) { return e.lane === L; })
      .reduce(function (a, e) { return a + (typeof e.n === 'number' ? e.n : 0); }, 0);
  });
  s.maxLane = {};
  LANES.forEach(function (L) {
    let mx = 0;
    (seed.daily || []).forEach(function (d) {
      const v = d.fanClubs ? (d.fanClubs[L] || 0) : 0;
      if (v > mx) mx = v;
    });
    s.maxLane[L] = mx;
  });
  s.daysLaneGe12 = {};
  s.daysLaneGe25 = {};
  LANES.forEach(function (L) {
    s.daysLaneGe12[L] = (seed.daily || []).filter(function (d) { return d.fanClubs && (d.fanClubs[L] || 0) >= 12; }).length;
    s.daysLaneGe25[L] = (seed.daily || []).filter(function (d) { return d.fanClubs && (d.fanClubs[L] || 0) >= 25; }).length;
  });
  s.daysFavorGe12 = (seed.daily || []).filter(function (d) { return (d.favor || 0) >= 12; }).length;
  s.daysFavorGe25 = (seed.daily || []).filter(function (d) { return (d.favor || 0) >= 25; }).length;

  const pkgs = seed.packageEvents || [];
  s.packageAttempts = pkgs.length;
  s.packageByOutcome = countBy(pkgs, classifyPackage);
  s.packagesSent = pkgs.filter(function (e) { return e.returned; }).length;
  s.packageGifts = countBy(pkgs.filter(function (e) { return e.returned; }), function (e) { return e.giftId || 'vault-shy'; });
  s.packageKcal = pkgs.filter(function (e) { return e.returned; })
    .reduce(function (a, e) { return a + (((e.kcalAfter || 0) - (e.kcalBefore || 0)) || 0); }, 0);
  s.packageOrigin = countBy(pkgs, function (e) { return e.origin || 'unknown'; });
  const dailies = seed.dailyEvents || [];
  s.pkgRoll = countBy(dailies, function (e) { return e.pkgRoll || 'unknown'; });

  const boons = seed.boonEvents || [];
  s.boonAttempts = boons.length;
  s.boonByOutcome = countBy(boons, classifyBoon);
  s.boonsFired = boons.filter(function (e) { return e.returned; }).length;

  const feeds = seed.feedEvents || [];
  s.feedAttempts = feeds.length;
  s.feedByOutcome = countBy(feeds, classifyFeed);
  s.feedsFired = feeds.filter(function (e) { return e.returned; }).length;

  const trials = seed.trialEvents || [];
  s.trialOffers = trials.filter(function (e) { return e.kind === 'offer' && e.offered; }).length;
  s.trialOfferReasons = countBy(trials.filter(function (e) { return e.kind === 'offer' && e.offered; }), function (e) { return e.reason || 'unknown'; });
  s.trialTaskIds = countBy(trials.filter(function (e) { return e.kind === 'offer' && e.offered; }), function (e) { return e.taskId || 'unknown'; });
  s.trialCompletions = trials.filter(function (e) { return e.kind === 'complete'; }).length;
  s.trialStruggleChecks = trials.filter(function (e) { return e.kind === 'struggle-check'; }).length;

  const interf = seed.interferenceEvents || [];
  s.interferenceCalls = interf.length;
  s.interferenceWinModNonzero = interf.filter(function (e) { return (e.winMod || 0) !== 0; }).length;
  s.interferenceDeathSaves = interf.filter(function (e) { return e.deathSave; }).length;

  s.personaPackages = (seed.personaPackageEvents || []).filter(function (e) { return e.returned; }).length;
  s.personaPackageAttempts = (seed.personaPackageEvents || []).length;

  const daily = seed.daily || [];
  const vws = daily.map(function (d) { return d.viewership; }).filter(function (v) { return typeof v === 'number'; });
  s.viewershipStart = vws.length ? vws[0] : null;
  s.viewershipMax = vws.length ? Math.max.apply(null, vws) : null;
  s.viewershipEnd = vws.length ? vws[vws.length - 1] : null;
  s.daysViewershipGe40 = vws.filter(function (v) { return v >= 40; }).length;
  s.daysViewershipGe25 = vws.filter(function (v) { return v >= 25; }).length;
  s.endClubs = daily.length ? (daily[daily.length - 1].fanClubs || null) : null;
  s.endFavor = daily.length ? daily[daily.length - 1].favor : null;
  s.endTrial = daily.length ? (daily[daily.length - 1].trial || null) : null;
  s.dailyTicks = (seed.dailyEvents || []).length;
  s.dailyEligible = (seed.dailyEvents || []).filter(function (e) { return e.eligible; }).length;
  s.driftDays = (seed.dailyEvents || []).filter(function (e) { return e.drift; }).length;

  const says = seed.fanSaysFull || seed.fanSays || [];
  s.fanSayLines = says.length;
  s.fanSayByClass = countBy(says, function (l) { return classifySayLine(l.line != null ? l.line : l); });
  s.fanSayUnclassified = says.filter(function (l) { return classifySayLine(l.line != null ? l.line : l) === 'unclassified'; }).length;
  s.namedFanLines = findNamedFanLines(says);
  s.teleFanEvents = (seed.teleEvents || []).length;
  s.wrapLive = seed.wrapLive || {};
  s.wrapCounts = seed.wrapCounts || {};
  s.sayDropped = seed.sayDropped || 0;
  return s;
}

function reconcileFavor(seed) {
  // Snapshot club deltas per lane vs summed favor events per lane.
  // Drift (−1 per lane per 3rd day, inside apDailyTick) is an engine
  // move, not a favor event: expected residue = drift total per lane.
  // Anything beyond drift is unattributed favor movement.
  const out = { perLane: {}, ok: true };
  if (!seed.daily || !seed.favorEvents) return out;
  LANES.forEach(function (L) {
    let first = null, last = null;
    seed.daily.forEach(function (d) {
      if (!d.fanClubs) return;
      if (first == null) first = d.fanClubs[L] || 0;
      last = d.fanClubs[L] || 0;
    });
    const snapDelta = (first == null || last == null) ? null : (last - first);
    const eventSum = seed.favorEvents.filter(function (e) { return e.lane === L; })
      .reduce(function (a, e) { return a + (typeof e.n === 'number' ? e.n : 0); }, 0);
    let drift = 0;
    (seed.dailyEvents || []).forEach(function (e) {
      if (!e.drift) return;
      const b = (e.drift.before || {})[L] || 0, a = (e.drift.after || {})[L] || 0;
      drift += (a - b);
    });
    const residue = (snapDelta == null) ? null : (snapDelta - eventSum - drift);
    out.perLane[L] = { snapDelta: snapDelta, eventSum: eventSum, drift: drift, residue: residue };
    if (residue !== 0 && residue != null) out.ok = false;
  });
  return out;
}

function summarizeBand(perSeed) {
  const band = { seeds: perSeed.length, perSeed: perSeed };
  const sum = function (k) { return perSeed.reduce(function (a, s) { return a + (s[k] || 0); }, 0); };
  const mergeCounts = function (k) {
    const out = {};
    perSeed.forEach(function (s) {
      Object.keys(s[k] || {}).forEach(function (key) { out[key] = (out[key] || 0) + (s[k][key] || 0); });
    });
    return out;
  };
  band.days = sum('days');
  band.wins = perSeed.filter(function (s) { return s.won; }).length;
  band.survived = perSeed.filter(function (s) { return s.endReason === 'survived' || (s.days >= 150 && !s.villageLost); }).length;
  band.deaths = sum('deaths');
  band.errors = sum('errors');
  band.favorEvents = sum('favorEvents');
  band.favorByLane = mergeCounts('favorByLane');
  band.favorByWhy = mergeCounts('favorByWhy');
  band.favorUnclassified = sum('favorUnclassified');
  band.packagesSent = sum('packagesSent');
  band.packageByOutcome = mergeCounts('packageByOutcome');
  band.packageGifts = mergeCounts('packageGifts');
  band.packageKcal = sum('packageKcal');
  band.pkgRoll = mergeCounts('pkgRoll');
  band.boonsFired = sum('boonsFired');
  band.boonByOutcome = mergeCounts('boonByOutcome');
  band.feedsFired = sum('feedsFired');
  band.feedByOutcome = mergeCounts('feedByOutcome');
  band.trialOffers = sum('trialOffers');
  band.trialCompletions = sum('trialCompletions');
  band.interferenceCalls = sum('interferenceCalls');
  band.interferenceWinModNonzero = sum('interferenceWinModNonzero');
  band.fanSayLines = sum('fanSayLines');
  band.fanSayByClass = mergeCounts('fanSayByClass');
  band.fanSayUnclassified = sum('fanSayUnclassified');
  band.namedFanLines = [];
  perSeed.forEach(function (s) { (s.namedFanLines || []).forEach(function (l) { band.namedFanLines.push(l); }); });
  band.maxLaneBand = {};
  LANES.forEach(function (L) {
    band.maxLaneBand[L] = Math.max.apply(null, perSeed.map(function (s) { return (s.maxLane || {})[L] || 0; }));
  });
  band.viewershipMaxBand = Math.max.apply(null, perSeed.map(function (s) { return (s.viewershipMax == null ? -1 : s.viewershipMax); }));
  band.daysViewershipGe40 = sum('daysViewershipGe40');
  return band;
}

if (require.main === module) {
  const dir = process.argv[2];
  const outFile = process.argv[3] || null;
  if (!dir) { console.error('usage: node fansfirst-analyze-20261111.js <perseed-dir> [out.json]'); process.exit(2); }
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('fansfirst-s') === 0 && f.endsWith('.json'); }).sort();
  const perSeed = files.map(function (f) {
    const obj = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const s = summarize(obj);
    s.reconcile = reconcileFavor(obj);
    s.file = f;
    return s;
  });
  const band = summarizeBand(perSeed);
  const text = JSON.stringify(band, null, 2) + '\n';
  if (outFile) fs.writeFileSync(outFile, text);
  process.stdout.write(text);
}

module.exports = { classifyFavorWhy: classifyFavorWhy, classifyPackage: classifyPackage,
  classifyBoon: classifyBoon, classifyFeed: classifyFeed, classifySayLine: classifySayLine,
  findNamedFanLines: findNamedFanLines, summarize: summarize, summarizeBand: summarizeBand,
  reconcileFavor: reconcileFavor };
