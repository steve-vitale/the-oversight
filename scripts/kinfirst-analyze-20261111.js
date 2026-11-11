// kinfirst-analyze-20261111.js — kin / naming / childbirth / keepsakes
// first-numbers analyzer (arm sim-kinfirst-b, run fleshout-loop-b-20261111T1131Z).
//
// Reads per-seed JSON from evidence/2026-11-11/perseed-kinfirst-b/
// (control + neutral legs) and writes a band summary JSON (+ prints a
// markdown GO table). Pure aggregation; no sims.
// Usage:
//   node scripts/kinfirst-analyze-20261111.js [per-seed-dir] [summary-out.json]
'use strict';
const path = require('path');
const fs = require('fs');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-11', 'perseed-kinfirst-b');
const OUT = process.argv[3] || path.join(__dirname, '..', 'evidence', '2026-11-11', 'kinfirst-summary-kinfirst-pilot.json');

const WRAPS = ['nameBaby', 'bestowUseName', 'nameUnnamedBabies', 'babyNamingPending',
  'keepsakeGrow', 'keepsakeLevelBeat', 'keepsakeThreadCheck', 'keepsakeTrailCheck',
  'keepsakeMaybeOffer', 'offerRelicEnhancement', 'accrueRelicBond',
  'keepsakeLuckyBreak', 'keepsakeHoldsGround', 'keepsakeAnchorPursuit', 'addTrauma',
  'useAbility', 'equipAccessory', 'migrateKeepsakes', 'playFlashback',
  'creditDeed', 'playerDeath', 'mantleBecome', 'tele'];

function inc(map, k, n) { map[k] = (map[k] || 0) + (n == null ? 1 : n); }

function loadSeeds() {
  const files = fs.readdirSync(DIR).filter(function (f) { return f.indexOf('kinfirst-s') === 0 && f.slice(-5) === '.json'; }).sort();
  const out = [];
  for (const f of files) {
    try { out.push(JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))); }
    catch (e) { console.error('KINFIRST ANALYZE: unreadable ' + f + ': ' + e.message); }
  }
  return out;
}

// ---- classifiers: every kin event gets a known kind + outcome, or 'unclassified' ----
function outcomeNameBaby(ev) {
  if (!ev || ev.babyId == null) return 'unclassified';
  if (ev.ok) return 'granted';
  if (ev.already) return 'already-named';
  if (ev.empty) return 'empty';
  return 'refused-other';
}
function outcomeUseName(ev) {
  if (!ev || ev.vid == null) return 'unclassified';
  if (ev.ok) return 'granted';
  if (ev.empty) return 'empty';
  return 'refused-other';
}
function outcomeGrow(ev) {
  if (!ev || ev.id == null || ev.why == null) return 'unclassified';
  if (ev.applied && ev.applied > 0) return 'grew';
  return 'dormant';
}
function outcomeThread(ev) {
  if (!ev || ev.id == null) return 'unclassified';
  if (ev.newClue) return 'clue-recorded';
  if (ev.takenKinFound) return 'taken-no-clue';
  return 'not-taken';
}
function outcomeRelicOffer(ev) {
  if (!ev || ev.id == null || ev.threshold == null) return 'unclassified';
  if (ev.choices) return ev.keepsake ? 'offered-keepsake' : 'offered-other-relic';
  return 'no-offer';
}
function outcomePlayerDeath(ev) {
  if (!ev || ev.oldId == null || ev.cause == null) return 'unclassified';
  if (ev.newId) return 'mantle-passed';
  return 'no-successor';
}

// ---- births: snapshot diffs over otherVillages + home roster ----
// A birth is ONLY a baby matching the birth-code signature
// (game.js simVillageDay): born unnamed (unnamed true) with a birthDay.
// Distant-village rosters ALSO contain pre-existing worldgen children
// (age 1–4, named, no birthDay, parents []) — those are NOT births and
// must not be counted (false-positive class caught in analysis).
function detectBirths(seedObj) {
  const daily = seedObj.daily || [];
  const seen = {}; // key villageId + baby id -> {village, birthDay, parents}
  const births = [];
  const babyDeaths = [];
  const seenAlive = {};
  daily.forEach(function (snap) {
    const villages = [];
    (snap.otherVillages || []).forEach(function (ov) {
      villages.push({ id: ov.id, name: ov.name, babies: ov.babies || [] });
    });
    // home roster babies (expected none — births only exist in simVillageDay)
    const homeBabies = ((snap.roster || []).filter(function (p) { return p && (p.unnamed || p.birthDay != null); })
      .map(function (p) { return { id: p.id, name: p.name, unnamed: !!p.unnamed, birthDay: p.birthDay, age: p.age, alive: !!p.alive, parents: p.parents || [] }; }));
    villages.push({ id: 'home', name: 'home', babies: homeBabies });
    villages.forEach(function (vg) {
      vg.babies.forEach(function (b) {
        const key = vg.id + '|' + b.id;
        // Birth signature only: unnamed at first sight AND a birthDay.
        if (!seen[key] && b.unnamed && b.birthDay != null) {
          seen[key] = true;
          births.push({ villageId: vg.id, villageName: vg.name, babyId: b.id,
            birthDay: b.birthDay, parents: (b.parents || []).slice(),
            firstSeenDay: snap.day, unnamedAtBirth: !!b.unnamed });
        }
        if (seen[key]) seenAlive[key] = !!b.alive;
      });
    });
  });
  // baby deaths: a TRUE birth seen alive earlier, dead at the end.
  const lastSnap = daily[daily.length - 1];
  if (lastSnap) {
    const aliveNow = {};
    (lastSnap.otherVillages || []).forEach(function (ov) {
      (ov.babies || []).forEach(function (b) { aliveNow[ov.id + '|' + b.id] = !!b.alive; });
    });
    ((lastSnap.roster || []).filter(function (p) { return p && (p.unnamed || p.birthDay != null); })
      .forEach(function (p) { aliveNow['home|' + p.id] = !!p.alive; }));
    Object.keys(seenAlive).forEach(function (key) {
      if (aliveNow[key] === false) babyDeaths.push({ key: key });
    });
  }
  return { births: births, babyDeaths: babyDeaths };
}

// ---- naming reconciliation: snapshot namedBy vs events ----
function reconcileNamings(seedObj, births) {
  const daily = seedObj.daily || [];
  let bearerNamed = 0, parentsNamed = 0, stillUnnamed = 0, residue = 0;
  const namedBy = {};
  daily.forEach(function (snap) {
    (snap.otherVillages || []).forEach(function (ov) {
      (ov.babies || []).forEach(function (b) {
        if (b.birthDay == null) return;
        namedBy[ov.id + '|' + b.id] = b.unnamed ? 'unnamed' : 'named';
      });
    });
  });
  // final snapshot: classify each birth by its end state
  const lastSnap = daily[daily.length - 1];
  const endState = {};
  if (lastSnap) {
    (lastSnap.otherVillages || []).forEach(function (ov) {
      (ov.babies || []).forEach(function (b) { endState[ov.id + '|' + b.id] = b; });
    });
    ((lastSnap.roster || []).filter(function (p) { return p && (p.unnamed || p.birthDay != null); })
      .forEach(function (p) { endState['home|' + p.id] = { id: p.id, name: p.name, unnamed: !!p.unnamed, birthDay: p.birthDay }; }));
  }
  births.forEach(function (b) {
    const key = b.villageId + '|' + b.babyId;
    const st = endState[key];
    if (!st) { residue++; return; }
    if (st.unnamed) { stillUnnamed++; return; }
    // named: by whom? nameBaby events name the bearer; autoName events name parents.
    const byBearer = (seedObj.nameBabyEvents || []).some(function (e) { return e.ok && e.babyId === b.babyId; });
    if (byBearer) bearerNamed++;
    else parentsNamed++;
  });
  return { bearerNamed: bearerNamed, parentsNamed: parentsNamed, stillUnnamed: stillUnnamed, residue: residue };
}

// ---- keepsake reconciliation: snapshot bond deltas vs growEvents ----
function reconcileKeepsakes(seedObj) {
  const daily = seedObj.daily || [];
  const grows = seedObj.growEvents || [];
  const appliedByItem = {};
  grows.forEach(function (g) {
    if (!g.id || !g.applied) return;
    appliedByItem[g.id] = (appliedByItem[g.id] || 0) + g.applied;
  });
  // snapshot bond per item id at first and last snapshot (same bearer only —
  // mantle churn swaps the whole inventory, so per-bearer segments)
  let residue = 0;
  const segments = [];
  let cur = null;
  daily.forEach(function (snap) {
    if (!cur || cur.bearer !== snap.bearer) {
      if (cur) segments.push(cur);
      cur = { bearer: snap.bearer, first: snap, last: snap };
    }
    cur.last = snap;
  });
  if (cur) segments.push(cur);
  segments.forEach(function (seg) {
    const firstMap = {};
    (seg.first.keepsakes || []).forEach(function (k) { firstMap[k.id] = k.bond || 0; });
    const lastMap = {};
    (seg.last.keepsakes || []).forEach(function (k) { lastMap[k.id] = k.bond || 0; });
    Object.keys(lastMap).forEach(function (id) {
      const delta = lastMap[id] - (firstMap[id] || 0);
      const applied = appliedByItem[id] || 0;
      // applied is band-wide; within one bearer segment the delta must be
      // <= band applied (other segments may hold the same item id). Only
      // flag a residue when delta EXCEEDS what grows recorded anywhere.
      if (delta > applied) residue++;
    });
  });
  return { residue: residue, segments: segments.length };
}

function analyzeSeed(s) {
  const isControl = s.mode === 'control';
  const r = { seed: s.seed, mode: s.mode, days: s.days, gameDays: s.gameDays,
    endReason: s.endReason, won: !!s.won, villageLost: !!s.villageLost,
    maxWave: s.maxWave, unlockedWave: s.unlockedWave, standing: s.standing,
    scaleRank: s.scaleRank, endPantryKcal: s.endPantryKcal,
    deaths: (s.deaths || []).length, instrumentErrors: (s.instrumentErrors || []).length,
    sayLines: (s.kinSays || []).length };
  if (!isControl) return r;

  const unclassified = [];
  function countEvents(list, outcomeFn, bucket) {
    const counts = {};
    (list || []).forEach(function (ev) {
      const o = outcomeFn(ev);
      if (o === 'unclassified') unclassified.push({ kind: bucket, ev: ev });
      inc(counts, o);
    });
    return counts;
  }

  r.nameBaby = countEvents(s.nameBabyEvents, outcomeNameBaby, 'nameBaby');
  r.useName = countEvents(s.useNameEvents, outcomeUseName, 'useName');
  r.grow = countEvents(s.growEvents, outcomeGrow, 'grow');
  r.thread = countEvents(s.threadEvents, outcomeThread, 'thread');
  r.relicOffer = countEvents(s.relicOfferEvents, outcomeRelicOffer, 'relicOffer');
  r.playerDeath = countEvents(s.playerDeathEvents, outcomePlayerDeath, 'playerDeath');
  r.trail = { ok: 0, notOk: 0 };
  (s.trailEvents || []).forEach(function (e) { if (e.ok) r.trail.ok++; else r.trail.notOk++; });
  r.lucky = { fired: 0, notFired: 0 };
  (s.luckyEvents || []).forEach(function (e) { if (e.returned) r.lucky.fired++; else r.lucky.notFired++; });
  r.hold = { fired: 0, notFired: 0 };
  (s.holdEvents || []).forEach(function (e) { if (e.returned) r.hold.fired++; else r.hold.notFired++; });
  r.anchor = { values: {} };
  (s.anchorEvents || []).forEach(function (e) { inc(r.anchor.values, String(e.returned)); });
  r.trauma = { calls: (s.traumaEvents || []).length,
    resolveOn: (s.traumaEvents || []).filter(function (e) { return e.resolvePassiveOn; }).length };
  r.ksUses = {};
  (s.useKsEvents || []).forEach(function (e) { inc(r.ksUses, (e.action || 'unknown') + ':' + (e.returned ? 'ok' : 'fail')); });
  r.flashbacks = { keepsake: 0, other: 0 };
  (s.flashbackEvents || []).forEach(function (e) { if (e.keepsake) r.flashbacks.keepsake++; else r.flashbacks.other++; });
  r.deathInFamily = (s.deathInFamilyEvents || []).length;
  r.mantles = (s.mantleEvents || []).length;
  r.teleMantle = (s.teleEvents || []).length;
  r.autoNames = 0; (s.autoNameEvents || []).forEach(function (e) { r.autoNames += (e.named || []).length; });
  r.pendingSeen = (s.pendingEvents || []).filter(function (e) { return e.pending; }).length;
  r.pendingChecks = (s.pendingEvents || []).length;
  r.levelBeats = {};
  (s.levelBeatEvents || []).forEach(function (e) { inc(r.levelBeats, e.before + '->' + e.after); });
  r.maybeOffers = { offered: 0, notOffered: 0 };
  (s.maybeOfferEvents || []).forEach(function (e) { if (e.offered) r.maybeOffers.offered++; else r.maybeOffers.notOffered++; });
  r.bondCalls = (s.bondCallEvents || []).length;
  r.equips = { worn: 0, refused: 0 };
  (s.equipEvents || []).forEach(function (e) { if (e.target) r.equips.worn++; else r.equips.refused++; });
  r.migrates = (s.migrateEvents || []).length;

  // births + naming reconciliation
  const bd = detectBirths(s);
  r.births = bd.births;
  r.babyDeaths = bd.babyDeaths.length;
  r.namingRecon = reconcileNamings(s, bd.births);
  // keepsake reconciliation
  r.ksRecon = reconcileKeepsakes(s);
  // mantle reconciliation: playerDeath vs mantleBecome vs tele
  r.mantleRecon = { deaths: (s.playerDeathEvents || []).length,
    mantles: (s.mantleEvents || []).length, tele: (s.teleEvents || []).length,
    mismatch: Math.abs((s.playerDeathEvents || []).length - (s.mantleEvents || []).length) };
  // keepsakes buried: the dead bearer's sentimental count at death
  // (sentBefore — the predecessor's keepsakes leave the scholar inventory
  // at death; the successor arrives with their own). The NET change
  // (sentBefore - sentAfter) understates burials when the successor
  // brings keepsakes, so it is reported separately.
  r.keepsakesBuried = 0;
  r.keepsakesBuriedNet = 0;
  (s.playerDeathEvents || []).forEach(function (e) {
    if (e.sentBefore != null) r.keepsakesBuried += e.sentBefore;
    if (e.sentBefore != null && e.sentAfter != null && e.sentBefore > e.sentAfter) r.keepsakesBuriedNet += (e.sentBefore - e.sentAfter);
  });
  // end-state keepsakes + thread clues + taken kin
  const lastSnap = (s.daily || [])[(s.daily || []).length - 1] || null;
  r.endKeepsakes = lastSnap ? (lastSnap.keepsakes || []).map(function (k) {
    return { id: k.id, kin: k.kin, lane: k.lane, bond: k.bond, level: k.level, worn: k.worn, memoryOf: k.memoryOf };
  }) : [];
  r.endThreadClues = lastSnap ? (lastSnap.threadClues || []) : [];
  r.endTakenKin = lastSnap ? (lastSnap.takenKin || []) : [];
  r.endLineage = lastSnap ? (lastSnap.lineage || []).length : 0;
  r.endFallen = lastSnap ? (lastSnap.fallen || []).length : 0;
  // lifeseed kin across bearers
  const bearers = {};
  (s.daily || []).forEach(function (snap) {
    if (snap.bearer && !bearers[snap.bearer]) {
      bearers[snap.bearer] = { name: snap.bearerName || null,
        people: snap.lifeseedPeople || [], taken: snap.takenKinOf || [] };
    }
  });
  r.bearers = Object.keys(bearers).map(function (id) { return Object.assign({ id: id }, bearers[id]); });
  r.unclassified = unclassified;
  r.unclassifiedCount = unclassified.length;
  r.wrapLive = s.wrapLive || {};
  r.wrapCounts = s.wrapCounts || {};
  return r;
}

function main() {
  const seeds = loadSeeds();
  const control = seeds.filter(function (s) { return s.mode === 'control'; }).sort(function (a, b) { return a.seed - b.seed; });
  const neutral = seeds.filter(function (s) { return s.mode === 'neutral'; }).sort(function (a, b) { return a.seed - b.seed; });
  const analyzed = control.map(analyzeSeed);

  // neutrality: days + endPantryKcal + deaths exact, per seed
  const neutrality = [];
  control.forEach(function (c) {
    const n = neutral.find(function (x) { return x.seed === c.seed; });
    if (!n) { neutrality.push({ seed: c.seed, match: false, why: 'no-neutral' }); return; }
    neutrality.push({ seed: c.seed,
      match: (c.days === n.days && c.endPantryKcal === n.endPantryKcal &&
        (c.deaths || []).length === (n.deaths || []).length),
      days: [c.days, n.days], pantry: [c.endPantryKcal, n.endPantryKcal],
      deaths: [(c.deaths || []).length, (n.deaths || []).length] });
  });

  const total = function (fn) { return analyzed.reduce(function (a, r) { return a + (fn(r) || 0); }, 0); };
  const band = {
    seeds: analyzed,
    neutrality: neutrality,
    neutralityMatch: neutrality.filter(function (x) { return x.match; }).length + '/' + neutrality.length,
    totals: {
      grows: total(function (r) { return (r.grow.grew || 0) + (r.grow.dormant || 0); }),
      growsApplied: total(function (r) { return r.grow.grew || 0; }),
      growsDormant: total(function (r) { return r.grow.dormant || 0; }),
      levelBeats: total(function (r) { let n = 0; Object.keys(r.levelBeats || {}).forEach(function (k) { n += r.levelBeats[k]; }); return n; }),
      threadClues: total(function (r) { return r.thread['clue-recorded'] || 0; }),
      threadTaken: total(function (r) { return (r.thread['taken-no-clue'] || 0) + (r.thread['clue-recorded'] || 0); }),
      relicOffers: total(function (r) { return (r.relicOffer['offered-keepsake'] || 0) + (r.relicOffer['offered-other-relic'] || 0); }),
      keepsakeOffers: total(function (r) { return r.relicOffer['offered-keepsake'] || 0; }),
      luckyFired: total(function (r) { return r.lucky.fired; }),
      ksUses: total(function (r) { let n = 0; Object.keys(r.ksUses || {}).forEach(function (k) { n += r.ksUses[k]; }); return n; }),
      flashbacksKeepsake: total(function (r) { return r.flashbacks.keepsake; }),
      deathInFamily: total(function (r) { return r.deathInFamily; }),
      playerDeaths: total(function (r) { return (r.playerDeath['mantle-passed'] || 0) + (r.playerDeath['no-successor'] || 0); }),
      mantles: total(function (r) { return r.mantles; }),
      teleMantle: total(function (r) { return r.teleMantle; }),
      keepsakesBuried: total(function (r) { return r.keepsakesBuried; }),
      births: total(function (r) { return r.births.length; }),
      nameBabyGranted: total(function (r) { return r.nameBaby.granted || 0; }),
      useNameGranted: total(function (r) { return r.useName.granted || 0; }),
      autoNames: total(function (r) { return r.autoNames; }),
      unclassified: total(function (r) { return r.unclassifiedCount; }),
      instrumentErrors: total(function (r) { return r.instrumentErrors; }),
    },
    wall: {
      wins: analyzed.filter(function (r) { return r.won; }).length,
      national: analyzed.filter(function (r) { return r.scaleRank === 'national'; }).length,
      wave4: analyzed.filter(function (r) { return r.maxWave >= 4; }).length,
      wave5: analyzed.filter(function (r) { return r.maxWave >= 5; }).length,
      medianSurvival: (function () {
        const ds = analyzed.map(function (r) { return r.days; }).sort(function (a, b) { return a - b; });
        return ds.length ? ds[Math.floor(ds.length / 2)] : null;
      })(),
      deaths: total(function (r) { return r.deaths; }),
      days: total(function (r) { return r.days; }),
    },
    wraps: WRAPS.map(function (w) {
      const live = analyzed.filter(function (r) { return r.wrapLive && r.wrapLive[w]; }).length;
      const count = analyzed.reduce(function (a, r) { return a + ((r.wrapCounts && r.wrapCounts[w]) || 0); }, 0);
      return { wrap: w, liveSeeds: live, calls: count };
    }),
  };

  fs.writeFileSync(OUT, JSON.stringify(band, null, 2) + '\n');
  console.log('KINFIRST ANALYZE: wrote ' + OUT);
  console.log('neutrality: ' + band.neutralityMatch);
  console.log('totals: ' + JSON.stringify(band.totals));
  console.log('wall: ' + JSON.stringify(band.wall));
  console.log('unclassified: ' + band.totals.unclassified + '  errors: ' + band.totals.instrumentErrors);
  band.wraps.forEach(function (w) { console.log('wrap ' + w.wrap + ': live ' + w.liveSeeds + '/8, calls ' + w.calls); });
}

if (require.main === module) main();

module.exports = { outcomeNameBaby: outcomeNameBaby, outcomeUseName: outcomeUseName,
  outcomeGrow: outcomeGrow, outcomeThread: outcomeThread,
  outcomeRelicOffer: outcomeRelicOffer, outcomePlayerDeath: outcomePlayerDeath,
  detectBirths: detectBirths, reconcileNamings: reconcileNamings,
  reconcileKeepsakes: reconcileKeepsakes, analyzeSeed: analyzeSeed };
