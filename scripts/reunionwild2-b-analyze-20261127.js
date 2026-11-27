// reunionwild2-b-analyze-20261127.js — Reunionwild findings-cluster
// analyzer (arm sim-reunionwild2-b). Pure functions over one per-seed
// run JSON (reunionwild2-b driver output: bloodcluster base +
// live-fight context on tbStarts + playerDeaths), plus the two
// corpus analyzers (bloodcluster recompute, succession corpus).
// Reuses the bloodcluster analyzer for the base seed summary
// (contacts, kills, linkage, bloodings).
//   - herald: every herald tbStarts row classified GENUINE /
//     REFUSED-WITH-LIVE-FIGHT / REFUSED-WITH-NO-LIVE-FIGHT, retry
//     outcome per refusal (later herald contact on the same seed),
//     audibility bar (>= 20 herald calls), verdict read off the
//     frozen prereg §4 decision table (a)/(b)/(c)/(d).
//   - bloodcluster recompute: per-seed W4 contacts from the v2
//     judged JSONs only, frozen definition (fieldFight wave >= 4,
//     outcome !== 'alreadyDead' + genuine TB starts wave >= 4),
//     against the published §5 table; pooled totals must reproduce
//     exactly (300 contacts; door 167 / non-door 133).
//   - succession: corpus test on the landed wilddeath JSON for seed
//     109460 (day-144 playerDeaths fightId-distinctness) + fresh-band
//     same-day double scholar deaths.
//   - wall: wins / national / table / wave-4 unlock / wave-5 unlock
//     / wave-5 faced / median survival (censored).
// Usage: const AN = require('./reunionwild2-b-analyze-20261127');
//   const s = AN.summarizeSeed(perSeedJson);
//   const all = AN.summarizeAll([perSeedJson, ...]);
//   const bc = AN.recomputeBloodcluster(REPO);
//   const sc = AN.successionCorpus(pathToWilddeath109460);
'use strict';

const fs = require('fs');
const path = require('path');
const BC = require('./bloodcluster-b-analyze-20261124');

const DOOR_SEEDS_BC = [109311, 109312, 109313, 109314];
// Published §5 table of evidence/2026-11-24/sim-bloodcluster-b.md
// (W4 contacts column only, as published — the recompute judges it).
const PUBLISHED_BC = {
  109310: 30, 109311: 34, 109312: 61, 109313: 40, 109314: 32,
  109315: 7, 109316: 0, 109317: 9, 109318: 17, 109319: 12,
  109320: 13, 109321: 36, 109322: 19, 109323: 6, 109324: 2, 109325: 12,
};
// Published values for the OTHER §5 columns, in the same row order:
// [days, end, w4Kills, bloodings, w5Unlock(1/0), w5Faced(1/0), w5Kills].
const PUBLISHED_BC_OTHER = {
  109310: [150, 'survived', 1, 1, 0, 0, 0],
  109311: [150, 'survived', 5, 4, 1, 1, 0],
  109312: [150, 'survived', 10, 8, 1, 1, 2],
  109313: [97, 'village-lost', 5, 4, 1, 1, 1],
  109314: [150, 'survived', 4, 2, 1, 0, 0],
  109315: [96, 'village-lost', 0, 0, 0, 0, 0],
  109316: [49, 'village-lost', 0, 0, 0, 0, 0],
  109317: [150, 'survived', 1, 1, 0, 0, 0],
  109318: [150, 'survived', 3, 2, 0, 0, 0],
  109319: [150, 'survived', 1, 1, 0, 0, 0],
  109320: [150, 'survived', 2, 2, 0, 0, 0],
  109321: [122, 'village-lost', 4, 3, 0, 0, 0],
  109322: [150, 'survived', 3, 2, 0, 0, 0],
  109323: [68, 'village-lost', 0, 0, 0, 0, 0],
  109324: [150, 'survived', 0, 0, 0, 0, 0],
  109325: [150, 'survived', 2, 1, 0, 0, 0],
};

function summarizeSeed(out) {
  const s = BC.summarizeSeed(out);
  s.arm = 'reunionwild2-b';

  // --- herald classification (frozen prereg §4 item 1) ---
  const heraldRows = (out.tbStarts || []).filter(function (t) { return t && t.mid === 'herald'; });
  const heraldField = (out.fieldFights || []).filter(function (f) { return f && f.mid === 'herald'; });
  s.heraldCalls = heraldRows.length;
  s.heraldFieldContacts = heraldField.length;
  s.heraldGenuine = 0; s.heraldRefusedLive = 0; s.heraldRefusedNoLive = 0; s.heraldUnannotated = 0;
  s.heraldRows = [];
  for (const row of heraldRows) {
    let cls;
    if (row.rebuilt !== false) { cls = 'GENUINE'; s.heraldGenuine++; }
    else if (!('liveFight' in row) || row.liveFight === undefined) { cls = 'UNANNOTATED'; s.heraldUnannotated++; }
    else if (row.liveFight && row.liveFight.fightId && !row.liveFight.over) { cls = 'REFUSED-WITH-LIVE-FIGHT'; s.heraldRefusedLive++; }
    else { cls = 'REFUSED-WITH-NO-LIVE-FIGHT'; s.heraldRefusedNoLive++; }
    s.heraldRows.push({ day: row.day | 0, cls: cls, fightId: row.fightId || null,
      liveFightId: (row.liveFight && row.liveFight.fightId) || null,
      liveMonsterIds: (row.liveFight && row.liveFight.monsterIds) || null });
  }
  s.heraldClassificationComplete = (s.heraldUnannotated === 0);
  // Retry outcome per refusal: a later herald contact on the same
  // seed (fieldFight row or genuine TB start, strictly later day).
  // sameDayContact is informational only — the frozen bar reads the
  // strictly-later-day contact.
  s.heraldRefusals = [];
  for (const row of heraldRows) {
    if (row.rebuilt !== false) continue;
    const day = row.day | 0;
    const laterField = heraldField.some(function (f) { return (f.day | 0) > day; });
    const laterTb = heraldRows.some(function (t) { return t.rebuilt !== false && (t.day | 0) > day; });
    const sameDay = heraldField.some(function (f) { return (f.day | 0) === day; })
      || heraldRows.some(function (t) { return t.rebuilt !== false && (t.day | 0) === day; });
    s.heraldRefusals.push({ day: day, laterContact: !!(laterField || laterTb),
      laterField: !!laterField, laterTb: !!laterTb, sameDayContact: !!sameDay });
  }
  s.heraldRefusedTotal = s.heraldRefusedLive + s.heraldRefusedNoLive;
  s.heraldRefusalsWithLaterContact = s.heraldRefusals.filter(function (r) { return r.laterContact; }).length;
  s.heraldRefusalsNeverAgain = s.heraldRefusals.filter(function (r) { return !r.laterContact; }).length;
  // Frozen decision table (prereg §4 item 1). The verdict is read
  // off it — (d) audibility first, then (a), then (c), then (b).
  if (s.heraldCalls < 20) s.heraldVerdict = 'SILENT';
  else if (s.heraldGenuine >= 1) s.heraldVerdict = 'ENTRY WORKS';
  else if (s.heraldRefusedNoLive > 0 || s.heraldRefusalsNeverAgain > 0) s.heraldVerdict = 'DEFECT NAMED';
  else s.heraldVerdict = 'NOISE';
  s.heraldAudible = s.heraldCalls >= 20;
  s.heraldDiagGo = s.heraldClassificationComplete && s.heraldAudible && s.heraldVerdict !== 'SILENT';

  // --- succession watch (frozen prereg §4 item 4) ---
  const deaths = (out.playerDeaths || []).slice();
  s.playerDeathCount = deaths.length;
  const byDay = {};
  for (const d of deaths) {
    const k = d.day | 0;
    (byDay[k] = byDay[k] || []).push(d);
  }
  s.sameDayDoubles = [];
  for (const k of Object.keys(byDay)) {
    if (byDay[k].length >= 2) {
      s.sameDayDoubles.push({ day: parseInt(k, 10),
        rows: byDay[k].map(function (d) {
          return { victim: d.victimName || null,
            fightId: (d.tb && d.tb.fightId) || null,
            monsters: (d.tb && d.tb.monsterIds) || [],
            monsterWaves: (d.tb && d.tb.monsterWaves) || [],
            cause: d.causeArg || null };
        }),
        distinctFights: new Set(byDay[k].map(function (d) { return (d.tb && d.tb.fightId) || null; })).size,
      });
    }
  }

  // --- wall numbers (prereg §5) ---
  const daily = out.daily || [];
  s.wall = {
    won: !!out.won,
    scaleRank: out.scaleRank || null,
    maxWave: out.maxWave || 1,
    endUnlockedWave: (out.endUnlockedWave == null ? null : out.endUnlockedWave),
    peak4: daily.some(function (d) { return d && (d.peak | 0) >= 4; }),
    peak5: daily.some(function (d) { return d && (d.peak | 0) >= 5; }),
    w5Faced: (function () {
      const types = new Set();
      for (const t of (out.tbStarts || [])) if (t && (t.wave | 0) === 5 && t.rebuilt !== false) types.add(t.mid);
      for (const f of (out.fieldFights || [])) if (f && (f.wave | 0) === 5) types.add(f.mid);
      return types.size > 0;
    })(),
    endDay: out.days | 0,
    survived: !out.villageLost,
    villageLost: !!out.villageLost,
  };
  return s;
}

function summarizeAll(seeds) {
  const per = seeds.map(function (o) { return summarizeSeed(o); });
  const heraldCalls = per.reduce(function (a, s) { return a + s.heraldCalls; }, 0);
  const heraldGenuine = per.reduce(function (a, s) { return a + s.heraldGenuine; }, 0);
  const heraldRefusedLive = per.reduce(function (a, s) { return a + s.heraldRefusedLive; }, 0);
  const heraldRefusedNoLive = per.reduce(function (a, s) { return a + s.heraldRefusedNoLive; }, 0);
  const heraldField = per.reduce(function (a, s) { return a + s.heraldFieldContacts; }, 0);
  const wins = per.filter(function (s) { return s.wall.won; }).length;
  const national = per.filter(function (s) { return s.wall.scaleRank === 'national' || s.wall.scaleRank === 'global'; }).length;
  const table = 0; // no table reach is recorded by the instrument; wins==0 covers it — reported as 0 with this note
  const w4Unlock = per.filter(function (s) { return s.wall.peak4; }).length;
  const w5Unlock = per.filter(function (s) { return s.wall.peak5; }).length;
  const w5Faced = per.filter(function (s) { return s.wall.w5Faced; }).length;
  const days = per.map(function (s) { return s.wall.endDay; }).sort(function (a, b) { return a - b; });
  const medianSurvival = days.length ? days[Math.floor(days.length / 2)] : null;
  const censored = per.filter(function (s) { return s.wall.survived; }).length;
  return {
    seeds: per.length,
    heraldCalls: heraldCalls, heraldGenuine: heraldGenuine,
    heraldRefusedLive: heraldRefusedLive, heraldRefusedNoLive: heraldRefusedNoLive,
    heraldField: heraldField,
    heraldVerdicts: per.map(function (s) { return { seed: s.seed, calls: s.heraldCalls, genuine: s.heraldGenuine, verdict: s.heraldVerdict }; }),
    wall: { wins: wins, national: national, table: table,
      w4Unlock: w4Unlock, w5Unlock: w5Unlock, w5Faced: w5Faced,
      medianSurvival: medianSurvival, censored: censored,
      survivals: days },
    sameDayDoubles: per.reduce(function (a, s) { return a.concat(s.sameDayDoubles.map(function (d) { return { seed: s.seed, day: d.day, distinctFights: d.distinctFights, rows: d.rows }; })); }, []),
    playerDeaths: per.reduce(function (a, s) { return a + s.playerDeathCount; }, 0),
    instrumentErrors: per.reduce(function (a, s) { return a + ((s.instrumentErrors || []).length); }, 0),
    perSeed: per,
  };
}

// --- Item 2: bloodcluster recompute from the v2 judged JSONs ---
function recomputeBloodcluster(repoRoot) {
  const dir = path.join(repoRoot, 'evidence', '2026-11-24', 'perseed-bloodcluster-b');
  const files = fs.readdirSync(dir).filter(function (f) { return /-v2\.json$/.test(f); }).sort();
  const rows = [];
  let pooledField = 0, pooledTb = 0, pooledDoor = 0, pooledNonDoor = 0;
  const otherDiffs = [];
  for (const f of files) {
    const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const s = BC.summarizeSeed(o);
    const field = (o.fieldFights || []).filter(function (x) { return x && (x.wave | 0) >= 4 && x.outcome !== 'alreadyDead'; }).length;
    const tb = (o.tbStarts || []).filter(function (x) { return x && (x.wave | 0) >= 4 && x.rebuilt !== false; }).length;
    const sum = field + tb;
    const door = DOOR_SEEDS_BC.indexOf(o.seed) >= 0;
    pooledField += field; pooledTb += tb;
    if (door) pooledDoor += sum; else pooledNonDoor += sum;
    // Other §5 columns, reproduced from the same raw JSONs.
    const w5kills = (o.killEvents || []).filter(function (k) { return k && (k.wave | 0) === 5 && k.entryAdded; }).length;
    const w5Types = new Set();
    for (const t of (o.tbStarts || [])) if (t && (t.wave | 0) === 5 && t.rebuilt !== false) w5Types.add(t.mid);
    for (const x of (o.fieldFights || [])) if (x && (x.wave | 0) === 5) w5Types.add(x.mid);
    const gotOther = [o.days | 0, o.villageLost ? 'village-lost' : 'survived',
      s.w4Kills, s.bloodings.length, s.peak5 ? 1 : 0, w5Types.size > 0 ? 1 : 0, w5kills];
    const pubOther = PUBLISHED_BC_OTHER[o.seed];
    if (JSON.stringify(gotOther) !== JSON.stringify(pubOther)) {
      otherDiffs.push({ seed: o.seed, got: gotOther, published: pubOther });
    }
    rows.push({ seed: o.seed, door: door, field: field, tb: tb, contacts: sum,
      published: PUBLISHED_BC[o.seed], match: sum === PUBLISHED_BC[o.seed] });
  }
  const pooled = { field: pooledField, tb: pooledTb, total: pooledField + pooledTb,
    door: pooledDoor, nonDoor: pooledNonDoor };
  return {
    files: files.length,
    rows: rows,
    mismatches: rows.filter(function (r) { return !r.match; }).map(function (r) { return r.seed; }),
    pooled: pooled,
    pooledReproduces: pooled.total === 300 && pooled.door === 167 && pooled.nonDoor === 133,
    otherColumnDiffs: otherDiffs,
  };
}

// Frozen item-2 bar: 16/16 rows recomputed, corrected table matches
// the recompute exactly, pooled totals reproduce exactly.
function bloodclusterBar(rec) {
  return rec.files === 16 && rec.rows.length === 16
    && rec.pooledReproduces
    && rec.rows.every(function (r) { return r.contacts != null; });
}

// --- Item 4: succession corpus test on the landed wilddeath JSON ---
function successionCorpus(filePath) {
  const o = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const rows = (o.playerDeaths || []).filter(function (r) { return (r.day | 0) === 144; })
    .map(function (r) {
      return { victim: r.victimName || null, day: r.day | 0,
        fightId: (r.tb && r.tb.fightId) || null,
        monsters: (r.tb && r.tb.monsterIds) || [],
        monsterWaves: (r.tb && r.tb.monsterWaves) || [],
        cause: r.causeArg || null,
        partyVillagers: (r.tb && r.tb.villagerIds) || [] };
    });
  const ids = rows.map(function (r) { return r.fightId; });
  return {
    seed: o.seed, day: 144, rows: rows,
    distinctFights: new Set(ids).size,
    sameFight: rows.length >= 2 && new Set(ids).size === 1,
    twoFights: rows.length >= 2 && new Set(ids).size === rows.length,
  };
}

// --- Herald on the OLD band (frozen §6 spot-check, from v2 JSONs) ---
function heraldOldBand(repoRoot) {
  const dir = path.join(repoRoot, 'evidence', '2026-11-24', 'perseed-bloodcluster-b');
  const files = fs.readdirSync(dir).filter(function (f) { return /-v2\.json$/.test(f); }).sort();
  let refused = 0, genuine = 0, field = 0;
  for (const f of files) {
    const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    for (const t of (o.tbStarts || [])) {
      if (t && t.mid === 'herald') { if (t.rebuilt === false) refused++; else genuine++; }
    }
    field += (o.fieldFights || []).filter(function (x) { return x && x.mid === 'herald'; }).length;
  }
  return { refused: refused, genuine: genuine, field: field };
}

module.exports = { summarizeSeed: summarizeSeed, summarizeAll: summarizeAll,
  recomputeBloodcluster: recomputeBloodcluster, bloodclusterBar: bloodclusterBar,
  successionCorpus: successionCorpus, heraldOldBand: heraldOldBand,
  PUBLISHED_BC: PUBLISHED_BC, PUBLISHED_BC_OTHER: PUBLISHED_BC_OTHER };
