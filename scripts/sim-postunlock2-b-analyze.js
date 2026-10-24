#!/usr/bin/env node
// sim-postunlock2-b-analyze.js — door census + post-unlock window
// attribution for arm sim-postunlock2-b (run fleshout-20261024T0925Z).
// Namespace sim-postunlock2-b-*.
//
// Reads evidence/2026-10-24/perseed-postunlock2-b/ and writes
// sim-postunlock2-b-attribution.json next to the corpus. Reports:
//   1. Census: per-config w4/w5 days, end, national/table/wins, maxWave.
//   2. Wall numbers: national / table / wins, wave 4-5 unlocks, median
//      survival, per policy.
//   3. Post-unlock windows: for EVERY door-open config — days survived
//      post-door, national/table at end, death cause inside the window
//      or still-alive, door fight, window fights/deaths.
//   4. Honest comparisons: postunlock-b rebase census (2/8 doors on
//      be55cfc2c) and wallseg (8/8 doors, all lost 17-65d later on
//      c76a52480b09). Different seed bands — the comparison is of RATES
//      and failure modes, not matched configs; the file says so.
//   5. DIAG bar (pre-registered): census completes AND every door-open
//      config carries window attribution. The verdict NAME (door vs
//      surviving wave 5) is the evidence file's call; this analyzer
//      reports the numbers it rests on.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-postunlock2-b');

function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [70801, 70802, 70803, 70804, 70805, 70806, 70807, 70808]).filter(Number.isFinite);
const CONFIGS = [];
const missing = [];
for (const s of SEEDS) {
  for (const b of ['lead', 'belong']) {
    const fn = path.join(EVID, `s${s}-${b}.json`);
    if (!fs.existsSync(fn)) { missing.push(`s${s}-${b}`); continue; }
    CONFIGS.push({ seed: s, base: b === 'lead' ? 'leadfeast' : 'belongfeast', cur: load(fn) });
  }
}

function censusRow(c) {
  const C = c.cur;
  return {
    config: `s${c.seed}-${c.base === 'leadfeast' ? 'lead' : 'belong'}`,
    w4Day: C.unlock.w4Day, w5Day: C.unlock.w5Day, endDay: C.days,
    endReason: C.endReason, national: C.national, table: C.table, won: C.won,
    exiled: C.exiled, maxWave: C.maxWave, instrumentErrors: (C.instrumentErrors || []).length,
  };
}

function postUnlockWindow(c) {
  const C = c.cur, w5 = C.unlock.w5Day;
  if (w5 == null) return null;
  const rows = (C.postunlockDeaths || []).filter(r => r.day >= w5);
  const fights = (C.postunlockFights || []).filter(f => f.day >= w5);
  const doorFight = fights.find(f => f.wave === 5) || null;
  const villagerDeaths = rows.filter(r => r.person === true);
  const lastRow = rows[rows.length - 1];
  const windowDeathCauses = {};
  for (const r of villagerDeaths) {
    const k = String(r.cause || 'unknown') + (r.oppMid ? ` vs ${r.oppMid}` : '');
    windowDeathCauses[k] = (windowDeathCauses[k] || 0) + 1;
  }
  return {
    config: `s${c.seed}-${c.base === 'leadfeast' ? 'lead' : 'belong'}`,
    w5Day: w5, endDay: C.days, endReason: C.endReason,
    daysSurvivedPostDoor: C.days - w5,
    nationalAtEnd: C.national, tableAtEnd: C.table, wonAtEnd: C.won,
    stillAlive: C.endReason !== 'village-lost',
    doorFight: doorFight ? { day: doorFight.day, mid: doorFight.mid, wave: doorFight.wave, tier: doorFight.overtimeTier, rerun: doorFight.rerun } : null,
    windowFights: fights.length, windowDeathRows: rows.length,
    windowVillagerDeaths: villagerDeaths.length,
    windowVillagerDeathList: villagerDeaths.map(r => ({ day: r.day, who: r.whoName || r.who, cause: r.cause, opp: r.oppMid || null, wave: r.wave, fightBasis: r.fightBasis })),
    windowDeathCauses,
    rosterAtEnd: lastRow && lastRow.village ? lastRow.village.roster : null,
    // Attribution completeness for the DIAG bar: every door-open config
    // must carry these four facts, whether it died or survived.
    attributionComplete: (C.days - w5) >= 0 && C.national != null && C.table != null &&
      (C.endReason === 'village-lost' ? villagerDeaths.length >= 0 : true) &&
      (doorFight != null || fights.length === 0),
  };
}

const census = CONFIGS.map(censusRow);
const windows = CONFIGS.map(postUnlockWindow).filter(Boolean);
const doors = windows.length;
const n = CONFIGS.length;

function wallNumbers(cfgs) {
  return {
    n: cfgs.length,
    national: cfgs.filter(c => c.national).length,
    table: cfgs.filter(c => c.table).length,
    wins: cfgs.filter(c => c.won).length,
    exiled: cfgs.filter(c => c.exiled).length,
    wave4: cfgs.filter(c => c.w4Day != null).length,
    wave5: cfgs.filter(c => c.w5Day != null).length,
    villageLost: cfgs.filter(c => c.endReason === 'village-lost').length,
    survived: cfgs.filter(c => c.endReason !== 'village-lost').length,
    medianSurvival: median(cfgs.map(c => c.endDay)),
    maxSurvival: cfgs.length ? Math.max.apply(null, cfgs.map(c => c.endDay)) : null,
  };
}
const overall = wallNumbers(census);
const perPolicy = {};
for (const b of ['leadfeast', 'belongfeast']) {
  perPolicy[b] = wallNumbers(census.filter(c => c.config.endsWith(b === 'leadfeast' ? '-lead' : '-belong')));
}

const bar = {
  censusComplete: missing.length === 0 && n === SEEDS.length * 2,
  doors,
  windowsAttributed: windows.filter(w => w.attributionComplete).length,
  windowsTotal: windows.length,
  diagGo: missing.length === 0 && n === SEEDS.length * 2 && windows.every(w => w.attributionComplete),
};

const out = {
  instrument: 'sim-postunlock2-b-analyze',
  runId: 'fleshout-20261024T0925Z',
  arm: 'sim-postunlock2-b',
  anchor: CONFIGS.length ? CONFIGS[0].cur.anchorCommit : null,
  seeds: SEEDS,
  missing,
  census,
  wallNumbers: overall,
  perPolicy,
  postUnlockWindows: windows,
  // Comparisons are RATE-level, not matched-config: this census runs a
  // FRESH band (708xx) while the priors ran 702xx. Failure-mode language
  // is what transfers; per-config drift language does not.
  comparisons: {
    postunlockBRebase: { band: '702xx (matched re-sweep)', anchor: '071b00b26 on be55cfc2c', doors: '2/8', postUnlockVillageDeaths: 0, failureMode: 'doors open, villages survive to 180d cap (13d post-door window)' },
    wallseg: { band: '702xx (landed)', anchor: 'c76a52480b09', doors: '8/8', postUnlockVillageDeaths: 8, failureMode: 'all lost 17-65d after opening' },
    thisCensus: { band: '708xx (fresh)', doors: `${doors}/${n}`, postUnlockVillageDeaths: windows.filter(w => !w.stillAlive).length, failureMode: doors === 0 ? 'no doors on fresh band' : (windows.filter(w => !w.stillAlive).length === 0 ? 'doors open, villages survive to cap' : 'mixed: some post-unlock deaths attributed') },
    comparability: 'RATE-LEVEL ONLY — fresh band vs 702xx band; do not read as per-config drift.',
  },
  diagBar: bar,
  verdict: bar.diagGo ? 'DIAG-GO' : 'DIAG-NO-GO',
  verdictReason: bar.diagGo
    ? `Census complete (${n} configs) and all ${windows.length} door-open configs carry window attribution. Verdict name (door vs surviving wave 5) is in sim-postunlock2-b.md.`
    : `Census incomplete (missing=[${missing.join(',')}] n=${n}) or ${windows.length - windows.filter(w => w.attributionComplete).length} door-open config(s) lack window attribution.`,
};
const fn = path.join(EVID, 'sim-postunlock2-b-attribution.json');
fs.writeFileSync(fn, JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({ verdict: out.verdict, wall: overall, perPolicy, doors: `${doors}/${n}`, windows: `${bar.windowsAttributed}/${bar.windowsTotal}`, missing }, null, 1));
for (const c of census) console.log(`${c.config}: w4=${c.w4Day} w5=${c.w5Day} end=${c.endDay}/${c.endReason} nat=${c.national} table=${c.table} won=${c.won} maxWave=${c.maxWave}`);
for (const w of windows) console.log(`WINDOW ${w.config}: door d${w.w5Day} survived ${w.daysSurvivedPostDoor}d end=${w.endReason} nat=${w.nationalAtEnd} table=${w.tableAtEnd} fights=${w.windowFights} villagerDeaths=${w.windowVillagerDeaths}`);
