#!/usr/bin/env node
// scripts/test-holdvillage-20261015.js — proof for the village-mortality
// census instrument (sim-holdvillage, 2026-10-15, scale-onramp axis).
//
// FEASTSCALE_R13=1 asserted up front (#312: a proof without the substrate
// flag tests nothing).
//
// REAL-RED / REAL-GREEN, honest fixtures only:
//   F-E the entanglement: a raid→succession→starvation terminal crash on
//     top of 8 early whole-run combat deaths. A NAIVE whole-run
//     cause-grouping says 'combat' — misattributing what killed THIS
//     village (REAL-RED). The real instrument's 30d window names the
//     starvation-family deaths, the pantry crash, and the raid/succession
//     co-occurrence (REAL-GREEN).
//   F-O the late-window death: a starvation death recorded the day AFTER
//     daysRan (the holdloss s77 gday off-by-one). A NAIVE windowed
//     classifier without the repair drops it and calls the window 'combat'
//     on one death (REAL-RED). The real window [deathDay-30, deathDay+1]
//     counts it (REAL-GREEN).
//   + the attribution bar's readable/unreadable cases, the diedHolding
//     gate, the death narrative, and trajectory-neutrality: the
//     instrument's say/registerDeath wrappers are read-only — a 30d real
//     sim with the instrument ON is byte-identical to OFF.
'use strict';

const R13 = process.env.FEASTSCALE_R13 === '1';
if (!R13) {
  console.error('HOLDVILLAGE FATAL: FEASTSCALE_R13=1 not set (substrate gate — #312).');
  process.exit(2);
}

const HV = require('./holdvillage-lib-20261015');
const HL = require('./holdloss-lib-20261015');

function num(x, d) { const n = Number(x); return Number.isFinite(n) ? n : (d == null ? 0 : d); }

let pass = 0, fail = 0;
function chk(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// ---------------------------------------------------------------- fixtures
function scaleRows(schedule, N) {
  const rows = [];
  for (let d = 1; d <= N; d++) {
    let rank = 'village';
    for (const s of schedule) if (d >= s.from && d <= s.to) rank = s.rank;
    rows.push({ day: d, rank, links: [], exiled: false });
  }
  return rows;
}
function mkDeath(day, name, cause, kind) {
  return { day, name, cause, kind: kind || 'villager' };
}
function beat(day, text) { return { day, text }; }
function foodRow(day, pantryDays, starved, ateShare, pop) {
  return { day, need: 24000, pop: pop == null ? 12 : pop,
    pantryKcal: Math.round(pantryDays * 24000), pantryDays, ateShare: ateShare == null ? 90 : ateShare,
    starved: !!starved };
}

function mkRec(o) {
  o = o || {};
  const N = o.days || 100;
  return {
    seed: o.seed || 1, policy: o.policy || 'leadfeast', days: N,
    endReason: o.endReason || 'village-lost', won: !!o.won,
    scaleRows: o.scaleRows || scaleRows([{ from: 41, to: N, rank: 'national' }], N),
    foodRows: o.foodRows || [], standingRows: [],
    deaths: o.deaths || [], beats: o.beats || [],
    waveUnlockDays: o.waveUnlockDays || { 4: null, 5: null },
    breaks: o.breaks || [], exiledEver: !!o.exiledEver, exiledDay: o.exiledDay || null,
  };
}

// A naive whole-run cause-grouping: what mortality attribution looked like
// before this instrument (plurality over the WHOLE run, no terminal
// window, no off-by-one repair). Used ONLY for the REAL-RED demonstration.
function naiveWholeRun(rec) {
  const fams = {};
  for (const d of (rec.deaths || [])) {
    const f = HL.classifyDeathFamily(d.cause);
    fams[f.family || 'other-named'] = (fams[f.family || 'other-named'] || 0) + 1;
  }
  const ranked = Object.keys(fams).sort((a, b) => fams[b] - fams[a]);
  return ranked.length ? ranked[0] : 'unattributed';
}
// A naive windowed classifier: windowed but WITHOUT the final-day+1 repair.
function naiveWindow(rec) {
  const dd = num(rec.days, 0);
  const wd = (rec.deaths || []).filter(d => num(d.day, 0) >= dd - 30 && num(d.day, 0) <= dd);
  const fams = {};
  for (const d of wd) {
    const f = HL.classifyDeathFamily(d.cause);
    fams[f.family || 'other-named'] = (fams[f.family || 'other-named'] || 0) + 1;
  }
  const ranked = Object.keys(fams).sort((a, b) => fams[b] - fams[a]);
  return { mode: ranked.length ? ranked[0] : 'unattributed', total: wd.length };
}

// ---------------------------------------------------------------- 1. the gate
console.log('F1: villageDeathWindow — the diedHolding gate');
const recA = mkRec({});
chk('A national + village-lost -> diedHolding', HV.villageDeathWindow(recA) !== null && HV.villageDeathWindow(recA).deathDay === 100);
const schedF = [{ from: 41, to: 70, rank: 'national' }, { from: 71, to: 100, rank: 'regional' }];
const recA2 = mkRec({ endReason: 'village-lost', scaleRows: scaleRows(schedF, 100) });
chk('A2 rank fell before death -> NOT diedHolding (holdloss territory)', HV.villageDeathWindow(recA2) === null);
const recA3 = mkRec({ endReason: 'survived', days: 180, scaleRows: scaleRows([{ from: 41, to: 180, rank: 'national' }], 180) });
chk('A3 survived at national -> NOT diedHolding', HV.villageDeathWindow(recA3) === null);
const recA4 = mkRec({ endReason: 'village-dead', days: 90, scaleRows: scaleRows([{ from: 41, to: 90, rank: 'global' }], 90) });
chk('A4 global + village-dead -> diedHolding (global counts as the hold)', HV.villageDeathWindow(recA4) !== null);
chk('A5 never reached -> NOT diedHolding', HV.villageDeathWindow(mkRec({ scaleRows: scaleRows([], 100), endReason: 'village-lost' })) === null);

// ---------------------------------------------------------------- 2. the entanglement (REAL-RED)
console.log('F2: the entanglement — raid→succession→starvation under 8 early combats');
// 8 early whole-run combat deaths (the engine's normal mortality) + the
// terminal crash in the last 30d: 2 starvations + 1 sickness, pantry
// crashing to 0, a raid beat and a succession beat in the ±4d window.
const earlyDeaths = [30, 35, 40, 45, 50, 55, 60, 65].map((d, i) => mkDeath(d, 'F' + i, 'combat'));
const recE = mkRec({
  deaths: earlyDeaths.concat([
    mkDeath(88, 'James', 'starvation'),
    mkDeath(90, 'Ruth', 'sickness'),
    mkDeath(95, 'Silas', 'starvation'),
  ]),
  beats: [
    beat(97, 'They carried off ~5000 kcal from the pantry. Nobody\'s dead, but the message is clear.'),
    beat(98, '🕯️ Elias is dead — and the dead hold no treaties. Every link Haven has shakes.'),
  ],
  foodRows: [
    foodRow(70, 12, false, 92), foodRow(80, 6, false, 84),
    foodRow(90, 1, true, 30), foodRow(95, 0, true, 20), foodRow(100, 0, true, 10, 3),
  ],
});
recE.scaleRows.forEach(r => { if (r.day >= 41) r.links = [{ vid: 'v1', kind: 'lead', trust: 60, arrears: 4000, perWeek: 4000, age: 50 }]; });

const naiveE = naiveWholeRun(recE);
chk('E REAL-RED: naive whole-run grouping says combat (misses the terminal crash)', naiveE === 'combat', 'got ' + naiveE);

const pE = HV.attributeVillageDeath(recE);
chk('E diedHolding', pE.diedHolding === true);
chk('E attributed (all four parts readable)', pE.attributed === true, pE.evidence.join(' // '));
chk('E window sees only the 3 terminal deaths', pE.deathShares.total === 3, 'got ' + pE.deathShares.total);
chk('E modal family = starvation (not combat)', pE.deathShares.modalFamily === 'starvation', 'got ' + pE.deathShares.modalFamily);
chk('E pantry names the crash (hit 0 in the window)', pE.pantry.readable && pE.pantry.hitZeroDay != null, JSON.stringify(pE.pantry.hitZeroDay));
chk('E pantry min near 0 at the end', pE.pantry.minPantryDays <= 0.1, 'got ' + pE.pantry.minPantryDays);
chk('E co-occurrence names the raid + succession', pE.cooccur.raids.length === 1 && pE.cooccur.successions.length === 1,
  `raids=${pE.cooccur.raids.length} succ=${pE.cooccur.successions.length}`);
// F-E2 raid-bucket precision: treeline-sighting / night-ambience beats are
// NOT village raids (the 2026-10-15 s77 repair — 8 counted, 5 were
// sightings). Only the specific raid phrases bucket.
const recE2 = mkRec({
  beats: [
    beat(97, 'The mosquito stops at the treeline — pacing, unwilling.'),
    beat(98, 'Night. The treeline is just a sound now.'),
    beat(99, '🌙 Raid — The Bloodied came in the night from the northeast. They carried off ~940 kcal from the pantry.'),
    beat(100, 'Shouts from the treeline — the raid is answered.'),
  ],
});
const coE2 = HV.coOccur4(recE2, 100);
chk('E2 treeline sightings do NOT bucket as raids', coE2.raids.length === 2, `got ${coE2.raids.length}: ${coE2.raids.map(b => b.text.slice(0, 40)).join(' | ')}`);
chk('E2 the two real raid phrases do bucket', coE2.raids.every(b => /🌙 Raid|Shouts from the treeline/.test(b.text)));
chk('E polity at death named (rank + links + arrears)', pE.polity && pE.polity.rank === 'national' && pE.polity.totalArrears === 4000 && pE.polity.minTrust === 60,
  JSON.stringify(pE.polity && { rank: pE.polity.rank, arrears: pE.polity.totalArrears, trust: pE.polity.minTrust }));
chk('E wave/draft bucket is labeled honestly (not wave-unlock)', /wave\/draft/.test(pE.evidence.join(' ')) && !/wave-unlock/.test(pE.evidence.join(' ')));

// ---------------------------------------------------------------- 3. the late-window death (REAL-RED)
console.log('F3: the late-window death — the gday off-by-one');
// days=91 (the holdloss s77 shape): a starvation death recorded d92, the
// day AFTER runDays' returned day count.
const recO = mkRec({
  days: 91, scaleRows: scaleRows([{ from: 61, to: 91, rank: 'national' }], 91),
  deaths: [mkDeath(88, 'Jesse', 'combat'), mkDeath(92, 'James', 'starvation')],
  foodRows: [foodRow(61, 8, false, 90), foodRow(91, 0, true, 20, 9)],
});
recO.scaleRows.forEach(r => { if (r.day >= 61) r.links = [{ vid: 'v1', kind: 'lead', trust: 55, arrears: 0, perWeek: 4000, age: 40 }]; });

const naiveO = naiveWindow(recO);
chk('O REAL-RED: naive window [61,91] misses the d92 death (total 1, combat)', naiveO.total === 1 && naiveO.mode === 'combat',
  `total=${naiveO.total} mode=${naiveO.mode}`);
const pO = HV.attributeVillageDeath(recO);
chk('O real window [61,92] counts the d92 death', pO.deathShares.total === 2, 'got ' + pO.deathShares.total);
chk('O starvation present in the shares', pO.deathShares.famCounts.starvation === 1, JSON.stringify(pO.deathShares.famCounts));
chk('O attributed', pO.attributed === true);

// ---------------------------------------------------------------- 4. the attribution bar — unreadable cases
console.log('F4: the attribution bar — unreadable parts count against');
const recC = mkRec({ deaths: [mkDeath(90, 'Ava', 'starvation')] }); // no foodRows at all
const pC = HV.attributeVillageDeath(recC);
chk('C no foodRows -> pantry unreadable -> NOT attributed', pC.attributed === false, pC.evidence.join(' // '));
chk('C says what is missing (honest, not silent)', /pantry trajectory unreadable/.test(pC.evidence.join(' ')));
const recD = mkRec({ deaths: [], foodRows: [foodRow(70, 5, false, 80), foodRow(100, 0, true, 20, 9)] });
const pD = HV.attributeVillageDeath(recD);
chk('D zero deaths in the window -> family unnameable -> NOT attributed', pD.attributed === false, pD.evidence.join(' // '));
chk('D names the zero-death fact', /no person deaths in the 30d window/.test(pD.evidence.join(' ')));
chk('polityAtDeath null on empty rows (defensive branch)', HV.polityAtDeath({ scaleRows: [] }, 100) === null);

// ---------------------------------------------------------------- 5. the narrative
console.log('F5: deathNarrative — the sense-read deliverable');
const nar = HV.deathNarrative(recE, pE);
chk('M narrative names the hold span', /national since d41/.test(nar) && /d100 with the rank still on/.test(nar));
chk('M narrative tells the pantry story (all four marks)', /the pantry story: 12\.0d on d70 -> 6\.0d on d80 -> 1\.0d on d90 -> 0\.0d on d95/.test(nar) && /hit 0/.test(nar), nar.split('\n')[1]);
chk('M narrative lists deaths with families', /d88 James — starvation \[starvation\]/.test(nar) && /d90 Ruth — sickness \[sickness\]/.test(nar));
chk('M narrative names the co-occurrence', /1 raid\(s\)/.test(nar) && /1 succession beat\(s\)/.test(nar));
chk('M narrative names the polity at death', /the polity holds: national, 1 link\(s\), total arrears 4000kcal/.test(nar));
chk('M narrative ends with an ATTRIBUTED verdict', /verdict: ATTRIBUTED/.test(nar));
const narU = HV.deathNarrative(recC, pC);
chk('M2 unattributed narrative says so aloud', /verdict: UNATTRIBUTED/.test(narU));
chk('M3 non-diedHolding narrative says outside the census', /outside the census/.test(HV.deathNarrative(recA3, HV.attributeVillageDeath(recA3))));

// ---------------------------------------------------------------- 6. window boundaries
console.log('F6: window boundaries — deathDay±30 inclusive, +1 inclusive, +2 excluded');
const recN = mkRec({
  deaths: [
    mkDeath(69, 'Out', 'combat'),        // deathDay-31: excluded
    mkDeath(70, 'Edge', 'sickness'),      // deathDay-30: included
    mkDeath(101, 'Late', 'starvation'),   // deathDay+1: included (the repair)
    mkDeath(102, 'Far', 'wounds'),        // deathDay+2: excluded
  ],
  foodRows: [foodRow(70, 5, false, 80), foodRow(100, 1, true, 40, 9)],
});
const pN = HV.attributeVillageDeath(recN);
chk('N boundaries', pN.deathShares.total === 2 &&
  pN.deathShares.famCounts.sickness === 1 && pN.deathShares.famCounts.starvation === 1,
  JSON.stringify(pN.deathShares.famCounts));

// ---------------------------------------------------------------- 7. trajectory neutrality (real sim)
console.log('F7: instrument trajectory-neutrality (real 30d sims)');
(async () => {
  try {
    const { loadGame, setupGame, runDays } = require('./sim-harness');
    const { leadfeast } = require('./policies/feastscale');
    if (!leadfeast || leadfeast.id !== 'leadfeast') { fail++; console.log('  FAIL F7: leadfeast policy unwrap'); return finish(); }
    const crypto = require('crypto');
    async function traj(instrument) {
      const { Game } = await loadGame({ seed: 33, mode: 'holdvillage-traj' });
      await setupGame(Game);
      const hashes = [];
      const t = { beats: [], deaths: [] };
      if (instrument) {
        const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; };
        const origSay = Game.say ? Game.say.bind(Game) : null;
        const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
        const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
        Game.say = function (msg) { try { t.beats.push({ day: gday(), text: String(msg) }); } catch (e) {} return origSay ? origSay(msg) : msg; };
        if (origSys) Game.sysSay = function (msg) { try { t.beats.push({ day: gday(), text: String(msg) }); } catch (e) {} return origSys ? origSys(msg) : msg; };
        Game.registerDeath = function (opts) {
          const r = origReg(opts);
          try { t.deaths.push({ day: gday(), cause: (opts || {}).cause }); } catch (e) {}
          return r;
        };
      }
      const RB = require('./readinessbind-lib');
      const policy = Object.assign({}, leadfeast);
      const origDaily = leadfeast.daily;
      policy.daily = (G, ctx) => {
        if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
        try { hashes.push(RB.trajectoryHash(G)); } catch (e) {}
      };
      await runDays(Game, policy, { days: 30 });
      return { hash: crypto.createHash('sha1').update(hashes.join('|')).digest('hex'), beats: t.beats.length, deaths: t.deaths.length };
    }
    const off = await traj(false);
    const on = await traj(true);
    chk('instrument ON vs OFF byte-identical 30d', on.hash === off.hash, on.hash.slice(0, 12) + ' vs ' + off.hash.slice(0, 12));
    chk('instrument actually sampled (beats+deaths>0)', (on.beats + on.deaths) > 0, `beats=${on.beats} deaths=${on.deaths}`);
  } catch (e) {
    fail++; console.log('  FAIL F7 exception: ' + (e && e.message));
  }
  finish();
})();

function finish() {
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
