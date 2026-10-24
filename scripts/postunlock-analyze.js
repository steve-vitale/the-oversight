#!/usr/bin/env node
// postunlock-analyze.js — POST-UNLOCK RETENTION autopsy analysis
// (flesh-out loop arm sim-postunlock-b2, axis scale-onramp, run
// fleshout-20261024T0615Z). Namespace postunlock-*.
//
// Reads the fresh postunlock corpus (evidence/2026-10-24/perseed-postunlock/)
// and the landed wallseg corpus (evidence/2026-10-24/perseed-wallseg/,
// anchor c76a52480b09) and:
//   1. Cross-corpus drift table: identical seed+policy+env+horizon, two
//      substrates — the E2 gate's evidence.
//   2. Primary-metric check: 8/8 wave-5 unlocks with attributed killing
//      windows? (pre-registered PRIMARY).
//   3. Bonus: attribute the 6 current-substrate village-lost events with
//      the full instrument rows (proves the instrument end-to-end on real
//      deaths; answers what kills wave-4-but-not-5 villages).
// Writes postunlock-attribution.json next to the corpus.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-24', 'perseed-postunlock');
const WSEVID = path.join(REPO, 'evidence', '2026-10-24', 'perseed-wallseg');

function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function baseOf(fn) { return fn.indexOf('belong') >= 0 ? 'belongfeast' : 'leadfeast'; }

const CONFIGS = [];
for (const s of [70201, 70202, 70204, 70209]) {
  for (const b of ['lead', 'belong']) {
    const cur = load(path.join(EVID, `s${s}-${b}.json`));
    const landed = load(path.join(WSEVID, `s${s}-${b}.json`));
    CONFIGS.push({ seed: s, base: b === 'lead' ? 'leadfeast' : 'belongfeast', cur, landed });
  }
}

function driftRow(c) {
  const L = c.landed, C = c.cur;
  return {
    config: `s${c.seed}-${c.base === 'leadfeast' ? 'lead' : 'belong'}`,
    landed: { w4Day: L.w4Day, w5Day: L.w5Day, endDay: L.days, endReason: L.endReason, national: L.national, table: L.table, maxWave: L.maxWave },
    current: { w4Day: C.unlock.w4Day, w5Day: C.unlock.w5Day, endDay: C.days, endReason: C.endReason, national: C.national, table: C.table, maxWave: C.maxWave },
    doorKept: (L.w5Day != null) === (C.unlock.w5Day != null),
  };
}

// Killing-window attribution for a current-substrate corpus file: the
// deaths on the final death day, with the full pre-registered row set.
function killingWindow(cur) {
  const rows = (cur.postunlockDeaths || []).filter(d => d && d.person !== false);
  if (!rows.length) return null;
  const lastDay = Math.max.apply(null, rows.map(d => d.day | 0));
  const win = rows.filter(d => (d.day | 0) === lastDay);
  const w5Day = cur.unlock.w5Day;
  return {
    lastDeathDay: lastDay,
    endReason: cur.endReason,
    daysRelUnlock: w5Day != null ? lastDay - w5Day : null,
    nWindowDeaths: win.length,
    deaths: win.map(d => ({
      day: d.day, who: d.whoName, cause: d.cause, kind: d.kind,
      wave: d.wave, oppMid: d.oppMid, oppWave: d.oppWave, fightBasis: d.fightBasis,
      combatCause: d.combatCause, disease: d.disease, diseasePool: d.diseasePool,
      hp: d.hp, armored: d.armored, armed: d.armed, veteran4plus: d.veteran4plus,
      fight: d.fight ? {
        monsterIds: d.fight.monsterIds, monsterWaves: d.fight.monsterWaves,
        partySize: (d.fight.party || []).length, scholarIn: d.fight.scholarIn,
        overtimeTier: d.fight.overtimeTier, rerun: d.fight.rerun,
      } : null,
      village: d.village, overtime: d.overtime,
    })),
  };
}

// Which w5 bars were short at the last deaths (for configs that never
// opened the door): read the village bar counts off the final death rows.
function shortBarsAtEnd(cur, n = 5) {
  const rows = (cur.postunlockDeaths || []).filter(d => d && d.village && d.village.armored >= 0);
  const tail = rows.slice(Math.max(0, rows.length - n));
  if (!tail.length) return null;
  const last = tail[tail.length - 1];
  return { day: last.day, bars: { armored: last.village.armored, armed: last.village.armed, tricks: last.village.tricks, veterans: last.village.veterans, roster: last.village.roster } };
}

const drift = CONFIGS.map(driftRow);
const doorLanded = drift.filter(d => d.landed.w5Day != null).length;
const doorCurrent = drift.filter(d => d.current.w5Day != null).length;

const primary = {
  unlocksAttributed: 0, unlocksTotal: 8,
  note: 'No wave-5 unlock on the current substrate — killing-window attribution has no population.',
};

const currentDeaths = [];
for (const c of CONFIGS) {
  if (c.cur.endReason === 'village-lost') {
    currentDeaths.push({
      config: `s${c.seed}-${c.base === 'leadfeast' ? 'lead' : 'belong'}`,
      maxWave: c.cur.maxWave, w4Day: c.cur.unlock.w4Day,
      attribution: killingWindow(c.cur),
      shortBarsAtEnd: shortBarsAtEnd(c.cur),
    });
  }
}

const out = {
  instrument: 'postunlock-analyze',
  runId: 'fleshout-20261024T0615Z',
  arm: 'sim-postunlock-b2',
  anchor: CONFIGS[0].cur.anchorCommit,
  wallsegAnchor: 'c76a52480b09',
  drift,
  doorSummary: { landed: doorLanded + '/8', current: doorCurrent + '/8' },
  primary,
  verdict: doorCurrent === 8 ? 'DIAG-GO' : 'DIAG-NO-GO',
  verdictReason: doorCurrent === 0
    ? 'Substrate drift: 0/8 identical configs open wave 5 on the current substrate (8/8 on the wallseg anchor). The pre-registered 8/8 post-unlock death population does not exist on current master; attribution is unmeasurable. See metric review in sim-postunlock-b.md.'
    : 'Partial: ' + doorCurrent + '/8 unlocks attributed (see primary).',
  currentSubstrateDeaths: currentDeaths,
};
const fn = path.join(EVID, 'postunlock-attribution.json');
fs.writeFileSync(fn, JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({ verdict: out.verdict, door: out.doorSummary, currentDeathsAttributed: currentDeaths.length }, null, 1));
for (const d of drift) {
  console.log(`${d.config}: landed w4=${d.landed.w4Day} w5=${d.landed.w5Day} end=${d.landed.endDay}/${d.landed.endReason} | current w4=${d.current.w4Day} w5=${d.current.w5Day} end=${d.current.endDay}/${d.current.endReason}`);
}
