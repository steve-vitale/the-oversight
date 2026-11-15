// vetattrition-analyze-grecorder-20261115.js — v4 G-class analyzer for
// sim-grecorder-a. Same vet5-drop definition as the v3 analyzer
// (scripts/vetattrition-analyze-20261115.js analyzeGFile: drops between
// consecutive series rows, closed window [prev.d, cur.d]), but
// attribution uses the NEW recorder fields (deaths rows carry vid,
// veteran flag, w4/w5 kill counts at death — sim-grecorder-a) instead
// of candidate counting:
//
//   - drop of magnitude m, k veteran deaths in the window:
//     k === m  -> CLASSIFIED (each veteran death attributed by vid)
//     k === 0  -> NON-DEATH-EXIT (unclassified; investigated as in v3)
//     k !== m  -> AMBIGUOUS (unclassified; partial attribution listed)
//
// A drop is NEVER classified from a non-veteran death row.
// REFUSES old-format corpora: any villager/person death row without a
// boolean `veteran` field aborts the whole run (exit 2) — the frozen
// gorgeprice2 corpora must never be re-scored under this analyzer.
// Read-only over the corpora; prints JSON to stdout.
// Usage: node scripts/vetattrition-analyze-grecorder-20261115.js <dir>
'use strict';
const fs = require('fs');
const path = require('path');

function loadMonsterWaves(monstersPath) {
  const raw = JSON.parse(fs.readFileSync(monstersPath, 'utf8'));
  const list = raw.monsters || raw;
  const waveById = {};
  const w5 = [];
  const w4 = [];
  for (const m of list) {
    if (!m || !m.id) continue;
    waveById[m.id] = m.wave | 0;
    if (m.wave === 5) w5.push(m.id);
    if (m.wave === 4) w4.push(m.id);
  }
  return { waveById: waveById, w5: w5.sort(), w4: w4.sort() };
}

function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function seriesAt(series, day) {
  let best = null;
  for (const r of series || []) {
    if (r.d <= day) best = r;
    else break;
  }
  return best;
}

function causeClassOf(c, firstFacedDay) {
  const cause = (c.cause || '').toLowerCase();
  if (cause === 'monster') return (firstFacedDay !== null && c.day >= firstFacedDay) ? 'W5-ERA' : 'PRE-W5-ERA';
  if (cause === 'the wild') return 'WILD';
  if (cause === 'the expedition') return 'ROAD-EXPEDITION';
  if (cause === 'the arena') return 'ARENA';
  if (cause === 'contest') return 'CONTEST';
  if (cause === 'ambush') return 'AMBUSH';
  return 'OTHER:' + (c.cause || 'unknown');
}

function investigateGNonDeath(d, day) {
  const nearTable = ((d.tableChoices || []).filter(function (t) {
    return t && Math.abs((t.day | 0) - day) <= 2;
  }).map(function (t) { return { day: t.day, choice: t.choice || t.kind || null }; }));
  const nearSeat = ((d.seatTakes || []).filter(function (t) {
    return t && Math.abs((t.day | 0) - day) <= 2;
  }).map(function (t) { return { day: t.day }; }));
  return { nearTableChoices: nearTable.slice(0, 5), nearSeatTakes: nearSeat.slice(0, 5) };
}

function analyzeGFile(d, monsters) {
  const errors = [];
  const seed = d.seed;
  const w5set = new Set(monsters.w5);
  const series = Array.isArray(d.series) ? d.series.slice().sort(function (a, b) { return a.d - b.d; }) : null;
  if (!series || !series.length) errors.push('no-series');
  if (!d.waveKills || typeof d.waveKills !== 'object') errors.push('no-waveKills');
  if (Array.isArray(d.instrumentErrors) && d.instrumentErrors.length) {
    errors.push('instrumentErrors:' + d.instrumentErrors.length);
  }
  // Old-format refusal: every villager/person death row must carry the
  // new recorder fields. A frozen corpus without them is not re-scored.
  const peopleDeaths = (d.deaths || []).filter(function (x) { return x.kind === 'villager' || x.kind === 'person'; });
  for (const x of peopleDeaths) {
    if (typeof x.veteran !== 'boolean' || typeof x.vid !== 'string' || typeof x.w4kills !== 'number') {
      errors.push('old-format-deaths: row day ' + x.day + ' who ' + x.who + ' lacks vid/veteran/w4kills — refusing to re-score a frozen corpus');
      break;
    }
  }
  const ev = (d.events || []).filter(function (e) { return e.kind === 'unlockedWave' && e.wave === 5; });
  const unlockDay = ev.length ? ev[0].day : null;
  const unlockedByEvent = unlockDay !== null;
  const unlockedByMax = (d.maxWave || 0) >= 5;
  if (unlockedByMax && !unlockedByEvent) errors.push('maxWave5-no-unlock-event');
  const unlocked = unlockedByEvent || unlockedByMax;
  const last = series && series.length ? series[series.length - 1] : null;
  let firstFacedDay = null;
  if (series) {
    for (const r of series) { if ((r.w5 || 0) > 0) { firstFacedDay = r.d; break; } }
  }
  let nationalEver = false, tableDone = false;
  if (series) {
    for (const r of series) {
      if (r.scale === 'national' || r.scale === 'galactic') nationalEver = true;
      if (r.tableDone) tableDone = true;
    }
  }
  const kills5 = (d.waveKills && d.waveKills['5']) || 0;
  const kills4 = (d.waveKills && d.waveKills['4']) || 0;

  const w5rows = (d.deaths || []).filter(function (x) { return w5set.has(x.who); });
  const w5MonsterDeaths = w5rows.filter(function (x) { return x.kind === 'monster'; }).length;
  const w5VillagerDeaths = w5rows.filter(function (x) { return x.kind === 'villager' || x.kind === 'person'; }).length;
  const w5PlayerFlag = w5rows.filter(function (x) { return x.player; }).length;

  const drops = [];
  let rises = 0;
  let vet5AtUnlock = null;
  let vet5AtEnd = null;
  if (series) {
    if (last) vet5AtEnd = last.vet5 || 0;
    if (unlocked && unlockDay !== null) {
      const atUnlock = seriesAt(series, unlockDay);
      vet5AtUnlock = atUnlock ? (atUnlock.vet5 || 0) : null;
    }
    for (let i = 1; i < series.length; i++) {
      const prev = series[i - 1];
      const cur = series[i];
      const pv = prev.vet5 || 0;
      const cv = cur.vet5 || 0;
      if (cv > pv) rises += (cv - pv);
      if (cv >= pv) continue;
      const mag = pv - cv;
      const windowDeaths = (d.deaths || []).filter(function (x) {
        return (x.kind === 'villager' || x.kind === 'person') &&
          x.day >= prev.d && x.day <= cur.d;
      });
      const vetDeaths = windowDeaths.filter(function (x) { return x.veteran === true; });
      const drop = {
        prevDay: prev.d, day: cur.d, magnitude: mag,
        unlockDay: unlockDay,
        daysAfterUnlock: unlockDay !== null ? (cur.d - unlockDay) : null,
        veteranDeaths: vetDeaths.map(function (x) {
          return {
            vid: x.vid, name: x.name || null, day: x.day, cause: x.cause || null,
            player: !!x.player, w4kills: x.w4kills, w5kills: x.w5kills, maxWave: x.maxWave,
            causeClass: causeClassOf(x, firstFacedDay),
          };
        }),
        nonVeteranDeathsInWindow: windowDeaths.length - vetDeaths.length,
        causeClass: null, causeClasses: null, deathDay: null, deathCause: null,
        scholarAtDeath: null, investigation: null,
      };
      if (vetDeaths.length === mag) {
        drop.causeClasses = drop.veteranDeaths.map(function (x) { return x.causeClass; });
        drop.causeClass = drop.causeClasses.length === 1 ? drop.causeClasses[0] : 'MULTI:' + drop.causeClasses.join('+');
        drop.deathDay = vetDeaths.map(function (x) { return x.day; });
        drop.scholarAtDeath = vetDeaths.some(function (x) { return !!x.player; });
      } else if (vetDeaths.length === 0) {
        drop.causeClass = 'NON-DEATH-EXIT';
        drop.investigation = investigateGNonDeath(d, cur.d);
      } else {
        drop.causeClass = 'AMBIGUOUS';
      }
      drops.push(drop);
    }
  }
  // classCounts counts ATTRIBUTED veteran deaths by cause (a multi
  // drop contributes one count per veteran death), plus one count per
  // unclassified drop under its residue class.
  const classCounts = {};
  drops.forEach(function (x) {
    if (x.causeClasses) {
      x.causeClasses.forEach(function (c) { classCounts[c] = (classCounts[c] || 0) + 1; });
    } else {
      classCounts[x.causeClass] = (classCounts[x.causeClass] || 0) + 1;
    }
  });
  const classified = drops.filter(function (x) {
    return x.causeClass !== 'AMBIGUOUS' && x.causeClass !== 'NON-DEATH-EXIT';
  }).length;
  const unclassified = drops.length - classified;
  return {
    seed: seed, cls: 'G', errors: errors,
    days: d.days, endReason: d.endReason, maxWave: d.maxWave,
    unlocked: unlocked, unlockDay: unlockDay, firstFacedDay: firstFacedDay,
    nationalEver: nationalEver, tableDone: tableDone, won: !!d.won,
    facedDistinct: last ? (last.w5 || 0) : 0,
    kills5: kills5, kills4: kills4,
    w5rowsTotal: w5rows.length, w5MonsterDeaths: w5MonsterDeaths,
    w5VillagerDeaths: w5VillagerDeaths, w5PlayerFlag: w5PlayerFlag,
    vet5AtUnlock: vet5AtUnlock, vet5AtEnd: vet5AtEnd,
    vet5Rises: rises, dropsTotal: drops.length,
    drops: drops, classCounts: classCounts,
    classified: classified, unclassified: unclassified,
  };
}

function analyzeDir(dir, monsters) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  const perSeed = [];
  let parseErrors = 0;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch (e) { parseErrors += 1; continue; }
    perSeed.push(analyzeGFile(d, monsters));
  }
  return { dir: dir, cls: 'G', files: files.length, parseErrors: parseErrors, perSeed: perSeed };
}

function poolLeg(perSeed) {
  const classCounts = {};
  let dropsTotal = 0, classified = 0, unclassified = 0;
  let unlocked = 0, vet5AtUnlock2 = 0, vet5AtEnd0 = 0;
  let nationalEver = 0, tableDone = 0, wins = 0;
  let scholarDeaths = 0;
  const daysAfterUnlock = [];
  const survivals = [];
  perSeed.forEach(function (s) {
    Object.keys(s.classCounts || {}).forEach(function (k) {
      classCounts[k] = (classCounts[k] || 0) + s.classCounts[k];
    });
    dropsTotal += s.dropsTotal;
    classified += s.classified;
    unclassified += s.unclassified;
    if (s.unlocked) unlocked += 1;
    if (s.vet5AtUnlock === 2) vet5AtUnlock2 += 1;
    if (s.vet5AtEnd === 0) vet5AtEnd0 += 1;
    if (s.nationalEver) nationalEver += 1;
    if (s.tableDone) tableDone += 1;
    if (s.won) wins += 1;
    if (typeof s.days === 'number') survivals.push(s.days);
    s.drops.forEach(function (x) {
      if (x.scholarAtDeath) scholarDeaths += 1;
      if (x.daysAfterUnlock !== null && x.daysAfterUnlock !== undefined) daysAfterUnlock.push(x.daysAfterUnlock);
    });
  });
  return {
    seeds: perSeed.length, cls: 'G', unlocked: unlocked,
    dropsTotal: dropsTotal, classified: classified, unclassified: unclassified,
    classifiedShare: dropsTotal ? +(classified / dropsTotal).toFixed(3) : null,
    classCounts: classCounts,
    vet5AtUnlock2: vet5AtUnlock2, vet5AtEnd0: vet5AtEnd0,
    nationalEver: nationalEver, tableDone: tableDone, wins: wins,
    medianSurvival: med(survivals),
    scholarDeaths: scholarDeaths,
    medianDaysAfterUnlock: med(daysAfterUnlock),
    daysAfterUnlock: daysAfterUnlock.slice().sort(function (a, b) { return a - b; }),
    instrumentErrors: perSeed.reduce(function (a, s) { return a + (s.errors || []).length; }, 0),
    errorSeeds: perSeed.filter(function (s) { return (s.errors || []).length; }).map(function (s) { return { seed: s.seed, errors: s.errors }; }),
  };
}

const isMain = require.main === module;
if (isMain) {
  const dirs = process.argv.slice(2);
  if (!dirs.length) {
    console.error('usage: node scripts/vetattrition-analyze-grecorder-20261115.js <dir>');
    process.exit(2);
  }
  const monstersPath = path.join(__dirname, '..', 'src', 'data', 'monsters.json');
  const monsters = loadMonsterWaves(monstersPath);
  const out = { w5Ids: monsters.w5, w4Ids: monsters.w4, legs: [] };
  let fatal = null;
  for (const dir of dirs) {
    const leg = analyzeDir(dir, monsters);
    leg.pooled = poolLeg(leg.perSeed);
    out.legs.push(leg);
    if (leg.perSeed.some(function (s) { return (s.errors || []).some(function (e) { return String(e).indexOf('old-format-deaths') === 0; }); })) {
      fatal = 'old-format corpus in ' + dir + ' — refusing to re-score frozen corpora';
    }
  }
  if (fatal) { console.error('VETATTRITION-GRECORDER STOP: ' + fatal); process.exit(2); }
  const leg = out.legs[0];
  leg.verdict = (leg.pooled.classifiedShare !== null && leg.pooled.classifiedShare >= 0.90 && leg.pooled.instrumentErrors === 0)
    ? 'GO' : 'NO-GO';
  leg.bar = 'G-class drops classified >= 0.90 with 0 instrument errors (per-class bar, sim-grecorder-a prereg)';
  console.log(JSON.stringify(out, null, 2));
}

module.exports = {
  loadMonsterWaves: loadMonsterWaves, analyzeGFile: analyzeGFile,
  analyzeDir: analyzeDir, poolLeg: poolLeg, med: med, causeClassOf: causeClassOf,
};
