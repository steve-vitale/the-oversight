// wilddeath-b-analyze-20261124.js — "what kills a veteran in the
// wild" attribution analyzer (arm sim-wilddeath-b). Pure functions
// over one per-seed run JSON (wilddeath-b driver output, which
// reuses the standing-gearready instrument VERBATIM as its base
// plus the wilddeath capture layer). Derives, per seed:
//  - the veteran census (via vetpair-b-analyze, re-proven on this
//    fresh band): every wave-4+ killer's terminal status — bar 4.
//  - every tele death row with cause 'the wild' (kind
//    person/villager), joined to its playerDeath capture row (same
//    day + victim vid) or its registerDeath capture row, and
//    classified into exactly one frozen taxonomy class (prereg):
//      WILD-TB-FIGHT    — playerDeath stack has tbEnd; live fight
//                          is a proven wild fight (monster, no
//                          hostile, no arena/betrayal/table/coalition
//                          flag). Monster id(s) + wave(s) recorded.
//      WILD-TB-OTHER    — playerDeath stack has tbEnd but the live
//                          fight is not a proven wild fight (or was
//                          already cleared when captured).
//      WILD-DEFAULT     — playerDeath called with a falsy cause
//                          (the ledger.js default fired); stack names
//                          the site.
//      WILD-EXPLICIT    — playerDeath called with literal 'the wild'.
//      WILD-NON-SCHOLAR — non-scholar veteran wild death, no
//                          playerDeath row; classified from the
//                          registerDeath-wrap stack.
//      UNCLASSIFIED     — no usable capture row, or an inconsistent
//                          row (scholar tele death with no playerDeath
//                          row; playerDeath row whose causeArg is a
//                          named non-wild cause). Reason recorded.
//  - the dominant wild-killer class with counts + coverage.
// A wild death is a VETERAN death iff its victim has a wave-4+
// kill with day <= death day (deduped log rows only, via the
// vetpair census killers list).
// Usage: const AN = require('./wilddeath-b-analyze-20261124');
//   const s = AN.summarizeSeed(perSeedJson);
//   const all = AN.summarizeAll([perSeedJson, ...]);
//   AN.classifyWildDeath(deathRow, pdRow, regRow) // fixture-level
'use strict';

const VET = require('./vetpair-b-analyze-20261124');

function clone(o) { return JSON.parse(JSON.stringify(o)); }

// Frozen taxonomy (prereg). classifyWildDeath is pure: it reads
// only its three arguments, never the game.
function classifyWildDeath(death, pdRow, regRow) {
  const base = { day: (death && death.day) | 0, victim: (death && death.who) || null,
    player: !!(death && death.player), causeRaw: (death && death.cause) || null,
    class: null, reason: null, evidence: {} };
  if (!death || death.cause !== 'the wild') return null; // not a wild death at all
  if (pdRow) {
    base.evidence.site = pdRow.site || null;
    base.evidence.causeArg = (pdRow.causeArg == null) ? null : pdRow.causeArg;
    base.evidence.hasTbEnd = !!pdRow.hasTbEnd;
    if (pdRow.tb) {
      base.evidence.tbInFight = !!pdRow.tb.inTbFight;
      base.evidence.tbMonsterIds = (pdRow.tb.monsterIds || []).slice();
      base.evidence.tbMonsterWaves = (pdRow.tb.monsterWaves || []).slice();
      base.evidence.tbHasMonster = !!pdRow.tb.hasMonster;
      base.evidence.tbHasHostile = !!pdRow.tb.hasHostile;
      base.evidence.tbArenaContest = !!pdRow.tb.arenaContest;
      base.evidence.tbBetrayal = !!pdRow.tb.betrayal;
      base.evidence.tbTableTrial = !!pdRow.tb.tableTrial;
      base.evidence.tbCoalitionArena = !!pdRow.tb.coalitionArena;
      base.evidence.tbFighters = (pdRow.tb.fighters || []).length;
    }
    if (pdRow.where) {
      base.evidence.departed = pdRow.where.departed;
      base.evidence.location = pdRow.where.location;
      base.evidence.tileType = pdRow.where.tileType;
      base.evidence.dayPart = pdRow.where.dayPart;
      base.evidence.victimName = pdRow.victimName || null;
    }
    if (Array.isArray(pdRow.sayTail)) base.evidence.sayTail = pdRow.sayTail;
    if (pdRow.hasTbEnd) {
      const tb = pdRow.tb || {};
      const provenWild = !!tb.inTbFight && !!tb.hasMonster && !tb.hasHostile
        && !tb.arenaContest && !tb.betrayal && !tb.tableTrial && !tb.coalitionArena;
      base.class = provenWild ? 'WILD-TB-FIGHT' : 'WILD-TB-OTHER';
      base.reason = provenWild ? 'lost a played field fight vs monster(s)'
        : 'tbEnd loss, but the live fight is not a proven wild fight';
      return base;
    }
    if (pdRow.causeArg === '<undefined>' || pdRow.causeArg === '<null>') {
      base.class = 'WILD-DEFAULT';
      base.reason = 'playerDeath called with no cause; ledger.js default fired';
      return base;
    }
    if (pdRow.causeArg === 'the wild') {
      base.class = 'WILD-EXPLICIT';
      base.reason = 'playerDeath called with the literal string';
      return base;
    }
    // A named non-wild causeArg cannot produce a 'the wild' tele
    // row (the tele cause IS the playerDeath cause) — an
    // instrument inconsistency, never silently classified.
    base.class = 'UNCLASSIFIED';
    base.reason = 'inconsistent: playerDeath causeArg ' + JSON.stringify(pdRow.causeArg)
      + ' but tele cause is the wild';
    return base;
  }
  if (regRow) {
    base.evidence.site = regRow.site || null;
    base.evidence.hasTbEnd = !!regRow.hasTbEnd;
    base.evidence.tbInFight = !!regRow.tbInFight;
    base.evidence.tbMonsterIds = (regRow.tbMonsterIds || []).slice();
    base.evidence.tbMonsterWaves = (regRow.tbMonsterWaves || []).slice();
    if (base.player) {
      base.class = 'UNCLASSIFIED';
      base.reason = 'scholar tele death with no playerDeath capture row';
      return base;
    }
    base.class = 'WILD-NON-SCHOLAR';
    base.reason = 'non-scholar wild death; classified from registerDeath stack';
    return base;
  }
  base.class = 'UNCLASSIFIED';
  base.reason = 'no playerDeath row and no registerDeath row for this death';
  return base;
}

function summarizeSeed(out) {
  const vet = VET.summarizeSeed(out);
  const s = vet;
  s.arm = 'wilddeath-b';
  s.playerDeaths = (out.playerDeaths || []).length;
  s.regDeaths = (out.regDeaths || []).length;
  s.wildDeaths = [];
  s.wildVeteranDeaths = [];
  s.wildClassCounts = {};
  s.unclassifiedWildDeaths = [];
  s.unclassifiedWildVeteranDeaths = [];

  const deathEvents = (out.deathEvents || []).filter(function (e) {
    return e && (e.kind === 'person' || e.kind === 'villager') && e.who != null;
  });
  const pdRows = out.playerDeaths || [];
  const regRows = out.regDeaths || [];

  // Killer map: vid -> bloodDay (deduped-log killers only).
  const bloodByVid = {};
  for (const k of (vet.killers || [])) bloodByVid[String(k.vid)] = k.bloodDay;

  // Join: playerDeath rows keyed by day + victim vid (the row's
  // where.scholarId IS the victim — captured before succession).
  const pdByKey = {};
  for (const r of pdRows) {
    const vid = (r.where && r.where.scholarId) || null;
    if (vid == null) continue;
    pdByKey[(r.day | 0) + '|' + String(vid)] = r;
  }
  // registerDeath rows keyed by day + who.
  const regByKey = {};
  for (const r of regRows) {
    if (r.who == null) continue;
    regByKey[(r.day | 0) + '|' + String(r.who)] = r;
  }

  for (const e of deathEvents) {
    if (e.cause !== 'the wild') continue;
    const vid = String(e.who);
    const day = e.day | 0;
    // A scholar's tele row matches its playerDeath row on day +
    // victim; a non-scholar row matches its registerDeath row.
    // Fall back to a day-only match when the vid key misses (the
    // capture row's vid read failed) — flagged in the evidence.
    let pd = pdByKey[day + '|' + vid] || null;
    let reg = regByKey[day + '|' + vid] || null;
    let joinedBy = 'vid';
    if (!pd && !reg) {
      for (const r of pdRows) {
        if ((r.day | 0) === day && !r._used) { pd = r; joinedBy = 'day-only'; break; }
      }
      if (!pd) {
        for (const r of regRows) {
          if ((r.day | 0) === day && !r._used) { reg = r; joinedBy = 'day-only'; break; }
        }
      }
    }
    if (pd) pd._used = true;
    if (reg) reg._used = true;
    const rec = classifyWildDeath(e, pd, reg);
    if (!rec) continue;
    rec.joinedBy = joinedBy;
    const bloodDay = bloodByVid[vid];
    rec.veteran = (bloodDay != null && bloodDay <= day);
    rec.bloodDay = (bloodDay == null) ? null : bloodDay;
    rec.aliveAfter = rec.veteran ? (day - bloodDay) : null;
    s.wildDeaths.push(rec);
    s.wildClassCounts[rec.class] = (s.wildClassCounts[rec.class] || 0) + 1;
    if (rec.veteran) s.wildVeteranDeaths.push(rec);
    if (rec.class === 'UNCLASSIFIED') {
      s.unclassifiedWildDeaths.push(rec);
      if (rec.veteran) s.unclassifiedWildVeteranDeaths.push(rec);
    }
  }
  // Capture rows with no matching tele death (ANY cause): an
  // instrument leak (a playerDeath that never registered a death).
  // A playerDeath whose tele row carries a non-wild cause is NOT
  // a leak: it is a non-wild scholar death, correctly outside
  // this arm's wild population — it matches a tele row, so it is
  // not orphaned. regDeath rows are wild-cause only by
  // construction, so an unmatched one is a genuine miss.
  const teleKeys = {};
  for (const e of deathEvents) teleKeys[(e.day | 0) + '|' + String(e.who)] = true;
  s.orphanPlayerDeaths = pdRows.filter(function (r) {
    const vid = (r.where && r.where.scholarId) || null;
    if (vid == null) return true;
    return !teleKeys[(r.day | 0) + '|' + String(vid)];
  }).map(function (r) {
    return { day: r.day | 0, causeArg: r.causeArg, site: r.site || null };
  });
  s.orphanRegDeaths = regRows.filter(function (r) {
    if (r.who == null) return true;
    return !teleKeys[(r.day | 0) + '|' + String(r.who)];
  }).map(function (r) {
    return { day: r.day | 0, who: r.who, cause: r.cause };
  });
  // Clean the join markers before the object is serialized.
  for (const r of pdRows) delete r._used;
  for (const r of regRows) delete r._used;

  // Dominant class among VETERAN wild deaths (bar 3).
  let domClass = null, domCount = 0;
  const vc = {};
  for (const rec of s.wildVeteranDeaths) vc[rec.class] = (vc[rec.class] || 0) + 1;
  for (const c of Object.keys(vc)) {
    if (vc[c] > domCount) { domCount = vc[c]; domClass = c; }
  }
  s.dominantWildClass = domClass;
  s.dominantWildCount = domCount;
  s.dominantWildShare = s.wildVeteranDeaths.length
    ? +(domCount / s.wildVeteranDeaths.length).toFixed(3) : null;
  s.wildVeteranClassCounts = vc;
  return s;
}

function summarizeAll(seeds) {
  const vetAll = VET.summarizeAll(seeds);
  const all = vetAll;
  all.wildDeaths = 0;
  all.wildVeteranDeaths = 0;
  all.wildClassCounts = {};
  all.wildVeteranClassCounts = {};
  all.unclassifiedWildDeaths = 0;
  all.unclassifiedWildVeteranDeaths = 0;
  all.orphanPlayerDeaths = 0;
  all.orphanRegDeaths = 0;
  all.seedsWithWildVeteranDeath = 0;
  all.tbFightMonsters = {};
  all.tbFightMonsterWaves = {};
  for (const out of seeds) {
    const s = summarizeSeed(out);
    all.wildDeaths += s.wildDeaths.length;
    all.wildVeteranDeaths += s.wildVeteranDeaths.length;
    if (s.wildVeteranDeaths.length) all.seedsWithWildVeteranDeath++;
    for (const c of Object.keys(s.wildClassCounts)) {
      all.wildClassCounts[c] = (all.wildClassCounts[c] || 0) + s.wildClassCounts[c];
    }
    for (const c of Object.keys(s.wildVeteranClassCounts)) {
      all.wildVeteranClassCounts[c] = (all.wildVeteranClassCounts[c] || 0) + s.wildVeteranClassCounts[c];
    }
    all.unclassifiedWildDeaths += s.unclassifiedWildDeaths.length;
    all.unclassifiedWildVeteranDeaths += s.unclassifiedWildVeteranDeaths.length;
    all.orphanPlayerDeaths += (s.orphanPlayerDeaths || []).length;
    all.orphanRegDeaths += (s.orphanRegDeaths || []).length;
    for (const rec of s.wildVeteranDeaths) {
      if (rec.class === 'WILD-TB-FIGHT') {
        for (let i = 0; i < (rec.evidence.tbMonsterIds || []).length; i++) {
          const mid = rec.evidence.tbMonsterIds[i];
          const wv = rec.evidence.tbMonsterWaves[i];
          all.tbFightMonsters[mid] = (all.tbFightMonsters[mid] || 0) + 1;
          if (wv != null) all.tbFightMonsterWaves['w' + wv] = (all.tbFightMonsterWaves['w' + wv] || 0) + 1;
        }
      }
    }
  }
  let domClass = null, domCount = 0;
  for (const c of Object.keys(all.wildVeteranClassCounts)) {
    if (all.wildVeteranClassCounts[c] > domCount) { domCount = all.wildVeteranClassCounts[c]; domClass = c; }
  }
  all.dominantWildClass = domClass;
  all.dominantWildCount = domCount;
  all.dominantWildShare = all.wildVeteranDeaths
    ? +(domCount / all.wildVeteranDeaths).toFixed(3) : null;
  return all;
}

module.exports = { summarizeSeed: summarizeSeed, summarizeAll: summarizeAll,
  classifyWildDeath: classifyWildDeath };
