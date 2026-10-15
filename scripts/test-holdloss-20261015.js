#!/usr/bin/env node
// scripts/test-holdloss-20261015.js — proof for the holdloss instrument
// (sim-holdloss, 2026-10-15, scale-onramp axis).
//
// REAL-RED / REAL-GREEN, honest fixtures only:
//   - classifyDeathFamily: every family + the unnameable cases.
//   - nationalLoss: synthetic run records with KNOWN loss modes must
//     attribute correctly. A naive family-only classifier (inline, no
//     wave-unlock / succession-chain context) is run FIRST on the two
//     contextual fixtures and must FAIL (REAL-RED: it demonstrably cannot
//     name those modes); the real classifier must pass all (REAL-GREEN).
//   - trajectory-neutrality: the instrument's say/registerDeath wrappers
//     are read-only passthrough — a 30d real sim with the instrument ON is
//     byte-identical to OFF (trajectory hash, same pattern as the tworung
//     proof). FEASTSCALE_R13=1 asserted up front (#312 lesson: a sim proof
//     without the substrate flag tests nothing).
'use strict';
const HL = require('./holdloss-lib-20261015');

const R13 = process.env.FEASTSCALE_R13 === '1';

let pass = 0, fail = 0;
function chk(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// ---------------------------------------------------------------- fixtures
// rank schedule -> scaleRows; every fixture's loss mode is known by design.
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

function mkRec(o) {
  o = o || {};
  const N = o.days || 100;
  return {
    seed: o.seed || 1, policy: o.policy || 'leadfeast', days: N,
    endReason: o.endReason || 'village-lost', won: !!o.won,
    scaleRows: o.scaleRows || scaleRows([{ from: 41, to: N, rank: 'national' }], N),
    foodRows: [], standingRows: [],
    deaths: o.deaths || [], beats: o.beats || [],
    waveUnlockDays: o.waveUnlockDays || { 4: null, 5: null },
    breaks: o.breaks || [], exiledEver: !!o.exiledEver, exiledDay: o.exiledDay || null,
  };
}

// A naive family-only classifier: what the loss taxonomy looked like
// before this instrument (plurality of death families, no context modes).
// Used ONLY for the REAL-RED demonstration.
function naiveLoss(rec) {
  const fams = {};
  for (const d of (rec.deaths || [])) {
    const f = HL.classifyDeathFamily(d.cause);
    fams[f.family || 'other-named'] = (fams[f.family || 'other-named'] || 0) + 1;
  }
  const ranked = Object.keys(fams).sort((a, b) => fams[b] - fams[a]);
  return ranked.length ? ranked[0] : 'unattributed';
}

// ---------------------------------------------------------------- 1. families
console.log('F1: classifyDeathFamily');
chk('sickness: "sickness"', HL.classifyDeathFamily('sickness').family === 'sickness');
chk('sickness: "gutrot" id', HL.classifyDeathFamily('gutrot').family === 'sickness');
chk('sickness: "East Nile" name', HL.classifyDeathFamily('East Nile').family === 'sickness');
chk('sickness: "food poisoning"', HL.classifyDeathFamily('food poisoning').family === 'sickness');
chk('starvation: "starvation"', HL.classifyDeathFamily('starvation').family === 'starvation');
chk('starvation: "thirst"', HL.classifyDeathFamily('thirst').family === 'starvation');
chk('wounds: "a wound that wouldn\'t close"', HL.classifyDeathFamily("a wound that wouldn't close").family === 'wounds');
chk('wounds: "injuries"', HL.classifyDeathFamily('injuries').family === 'wounds');
chk('monster: "monster"', HL.classifyDeathFamily('monster').family === 'monster');
chk('monster: "Highbeam Deer" (corpus)', HL.classifyDeathFamily('Highbeam Deer').family === 'monster');
chk('combat: "combat"', HL.classifyDeathFamily('combat').family === 'combat');
chk('combat: "raid-defense" (village-on-village)', HL.classifyDeathFamily('raid-defense').family === 'combat');
chk('combat: "raid" (village-on-village)', HL.classifyDeathFamily('raid').family === 'combat');
chk('combat: "ambush"', HL.classifyDeathFamily('ambush').family === 'combat');
chk('combat: "split-fight: Highbeam Deer"', HL.classifyDeathFamily('split-fight: Highbeam Deer').family === 'combat');
chk('combat: "expedition" (player-death cause)', HL.classifyDeathFamily('expedition').family === 'combat');
chk('monster: descriptor "a dog-shaped silence at the treeline"', HL.classifyDeathFamily('a dog-shaped silence at the treeline').family === 'monster');
chk('monster descriptors loaded (>=50)', HL.MONSTER_DESCRIPTORS().length >= 50, 'got ' + HL.MONSTER_DESCRIPTORS().length);
chk('unnameable: "Big-Bane" (procedural name, trail kept)', HL.classifyDeathFamily('Big-Bane').family === null && HL.classifyDeathFamily('Big-Bane').raw === 'Big-Bane');
chk('unnameable: "the phoenix link"', HL.classifyDeathFamily('the phoenix link').family === null);
chk('unnameable: "" empty', HL.classifyDeathFamily('').family === null);
chk('monster corpus loaded (>=50 names)', HL.MONSTER_NAMES().length >= 50, 'got ' + HL.MONSTER_NAMES().length);

// ---------------------------------------------------------------- 2. fixtures
console.log('F2: nationalLoss fixtures');

// F-A starvation: 5 starvation + 1 combat in the loss window.
const recA = mkRec({ deaths: [
  mkDeath(82, 'Ava', 'starvation'), mkDeath(84, 'Ben', 'starvation'),
  mkDeath(86, 'Cid', 'starvation'), mkDeath(88, 'Dee', 'starvation'),
  mkDeath(90, 'Eli', 'starvation'), mkDeath(89, 'Fox', 'combat'),
]});
const lossA = HL.nationalLoss(recA);
chk('A starvation plurality -> starvation', lossA.lossMode === 'starvation', 'got ' + lossA.lossMode);
chk('A holdDays 60', lossA.holdDays === 60, 'got ' + lossA.holdDays);
chk('A lossDay = finalDay (village died holding)', lossA.lossDay === 100, 'got ' + lossA.lossDay);

// F-B monster: 3 monster + 1 combat.
const recB = mkRec({ deaths: [
  mkDeath(84, 'Ava', 'monster'), mkDeath(87, 'Ben', 'monster'),
  mkDeath(89, 'Cid', 'Highbeam Deer'), mkDeath(90, 'Dee', 'combat'),
]});
chk('B monster plurality -> monster', HL.nationalLoss(recB).lossMode === 'monster', 'got ' + HL.nationalLoss(recB).lossMode);

// F-C sickness.
const recC = mkRec({ deaths: [
  mkDeath(83, 'Ava', 'sickness'), mkDeath(86, 'Ben', 'gutrot'), mkDeath(90, 'Cid', 'food poisoning'),
]});
chk('C sickness -> sickness', HL.nationalLoss(recC).lossMode === 'sickness', 'got ' + HL.nationalLoss(recC).lossMode);

// F-D wounds.
const recD = mkRec({ deaths: [
  mkDeath(88, 'Ava', "a wound that wouldn't close"), mkDeath(91, 'Ben', 'injuries'),
]});
chk('D wounds -> wounds', HL.nationalLoss(recD).lossMode === 'wounds', 'got ' + HL.nationalLoss(recD).lossMode);

// the narrative fixture gets food rows (roster + pantry in the last 20d).
recA.foodRows = [
  { day: 80, need: 24000, pop: 12, pantryKcal: 60000, pantryDays: 2.5, ateShare: 92 },
  { day: 100, need: 6000, pop: 3, pantryKcal: 0, pantryDays: 0, ateShare: 40 },
];
const lossA2 = HL.nationalLoss(recA);
chk('A2 narrative still starvation with food rows', lossA2.lossMode === 'starvation');

// F-E wave-unlock: 2 combat + 1 monster in the window, wave-4 unlock d88,
// loss day 100. The NAIVE classifier sees only 'combat' — REAL-RED.
const recE = mkRec({
  deaths: [
    mkDeath(91, 'Ava', 'combat'), mkDeath(94, 'Ben', 'combat'), mkDeath(96, 'Cid', 'monster'),
  ],
  beats: [beat(88, '🌊 Wave 4 — the fourth draft. The mirror shows new teeth.')],
  waveUnlockDays: { 4: 93, 5: null },
});
const naiveE = naiveLoss(recE);
chk('E REAL-RED: naive family-only sees only combat (misses the unlock)', naiveE === 'combat', 'got ' + naiveE);
chk('E wave-unlock context -> wave-unlock', HL.nationalLoss(recE).lossMode === 'wave-unlock', 'got ' + HL.nationalLoss(recE).lossMode);
chk('E evidence names the unlock day', /wave-4 unlock day 93/.test(HL.nationalLoss(recE).lossEvidence.join(' ')));

// F-F succession-chain: repeated succession shocks. Naive sees starvation
// plurality and misses the chain — REAL-RED.
const recF = mkRec({
  deaths: [
    mkDeath(90, 'Devon Okafor', 'combat'), mkDeath(93, 'Howard', 'starvation'),
    mkDeath(95, 'Carlos', 'starvation'), mkDeath(97, 'Minh', 'starvation'),
  ],
  beats: [
    beat(90, '🕯️ Devon is dead — and the dead hold no treaties. Every link Haven has shakes.'),
    beat(93, '🕯️ Howard is dead — and the dead hold no treaties. Every link Haven has shakes.'),
    beat(95, '🕯️ Carlos is dead — and the dead hold no treaties. Every link Haven has shakes.'),
    beat(97, '◈ The realm came apart — no polity answers to Haven now.'),
  ],
});
const naiveF = naiveLoss(recF);
chk('F REAL-RED: naive sees starvation, misses the succession chain', naiveF === 'starvation', 'got ' + naiveF);
chk('F succession beats x4 -> succession-chain', HL.nationalLoss(recF).lossMode === 'succession-chain', 'got ' + HL.nationalLoss(recF).lossMode);

// F-G tie: 2 combat + 2 starvation -> other-named WITH the trail preserved.
const recG = mkRec({ deaths: [
  mkDeath(88, 'Ava', 'combat'), mkDeath(90, 'Ben', 'combat'),
  mkDeath(92, 'Cid', 'starvation'), mkDeath(94, 'Dee', 'starvation'),
]});
const lossG = HL.nationalLoss(recG);
chk('G family tie -> other-named', lossG.lossMode === 'other-named', 'got ' + lossG.lossMode);
chk('G trail preserved (famCounts + exact causes)', JSON.stringify(lossG.famCounts) === '{"combat":2,"starvation":2}' && /no family reaches 40%/.test(lossG.lossEvidence.join(' ')));

// F-H held-to-end: survived horizon at national.
const recH = mkRec({ endReason: 'survived', days: 180, deaths: [mkDeath(170, 'Ava', 'starvation')] });
chk('H survived at national -> held-to-end', HL.nationalLoss(recH).lossMode === 'held-to-end', 'got ' + HL.nationalLoss(recH).lossMode);

// F-I link-break while the village lives: rank falls, break near -> other-named with the mechanism named.
const schedI = [{ from: 41, to: 70, rank: 'national' }, { from: 71, to: 100, rank: 'regional' }];
const recI = mkRec({ endReason: 'survived', scaleRows: scaleRows(schedI, 100), breaks: [{ day: 70, link: 'v-Ridge' }] });
const lossI = HL.nationalLoss(recI);
chk('I link-break -> other-named', lossI.lossMode === 'other-named', 'got ' + lossI.lossMode);
chk('I mechanism named in evidence (not silent)', /link-break/.test(lossI.lossEvidence.join(' ')));
chk('I lossDay = lastNatDay+1', lossI.lossDay === 71, 'got ' + lossI.lossDay);

// F-J succession-collapse while the village lives: death +/-3d of the loss, nothing else -> succession-chain.
const schedJ = [{ from: 41, to: 80, rank: 'national' }, { from: 81, to: 100, rank: 'regional' }];
const recJ = mkRec({ endReason: 'survived', scaleRows: scaleRows(schedJ, 100),
  deaths: [mkDeath(81, 'Devon Okafor', 'combat')] });
chk('J rank falls on a leader death -> succession-chain', HL.nationalLoss(recJ).lossMode === 'succession-chain', 'got ' + HL.nationalLoss(recJ).lossMode);

// F-K no-deaths village death -> other-named with evidence (never silent).
const recK = mkRec({ deaths: [] });
const lossK = HL.nationalLoss(recK);
chk('K no deaths -> other-named', lossK.lossMode === 'other-named', 'got ' + lossK.lossMode);
chk('K evidence says no deaths', /no villager deaths recorded/.test(lossK.lossEvidence.join(' ')));

// F-L never reached -> reached:false.
chk('L never reached', HL.nationalLoss(mkRec({ scaleRows: scaleRows([], 100) })).reached === false);

// F-O window-end: a death recorded the day AFTER daysRan (the gday
// off-by-one) must be counted, not excluded by bookkeeping.
const recO = mkRec({ deaths: [
  mkDeath(99, 'Ava', 'starvation'), mkDeath(101, 'Ben', 'starvation'),
]});
const lossO = HL.nationalLoss(recO);
chk('O final-day+1 death counted -> starvation', lossO.lossMode === 'starvation', 'got ' + lossO.lossMode + ' ' + JSON.stringify(lossO.famCounts));

// F-P tie with the starvation context: 1 combat + 1 starvation in the
// window -> other-named WITH the full trail (the s77 shape).
const recP = mkRec({ deaths: [
  mkDeath(83, 'Jesse', 'combat'), mkDeath(92, 'James', 'starvation'),
]});
const lossP = HL.nationalLoss(recP);
chk('P combat/starvation tie -> other-named', lossP.lossMode === 'other-named', 'got ' + lossP.lossMode);
chk('P trail names both families', /combat/.test(JSON.stringify(lossP.famCounts)) && /starvation/.test(JSON.stringify(lossP.famCounts)));

// F-M narrative builder: the last-20d narrative is a first-class deliverable.
const nar = HL.last20Narrative(recA, lossA);
chk('M narrative has text with hold + roster', /national hold: first day 41/.test(nar.text) && /roster:/.test(nar.text));
chk('M narrative lists deaths with families', /\[starvation\]/.test(nar.text));
chk('M narrative keeps raw rows for audit', nar.rows.deaths.length === 6);

// F-N hold buckets.
chk('N buckets', HL.holdBucket(5) === '1-10d' && HL.holdBucket(25) === '11-30d' &&
  HL.holdBucket(45) === '31-60d' && HL.holdBucket(90) === '61-120d' && HL.holdBucket(150) === '121d+');

// ---------------------------------------------------------------- 3. trajectory neutrality (real sim)
console.log('F3: instrument trajectory-neutrality (real 30d sims)');
(async () => {
  if (!R13) { fail++; console.log('  FAIL F3: FEASTSCALE_R13=1 not set (substrate gate — #312)'); return finish(); }
  try {
    const { loadGame, setupGame, runDays } = require('./sim-harness');
    const { leadfeast } = require('./policies/feastscale');
    if (!leadfeast || leadfeast.id !== 'leadfeast') { fail++; console.log('  FAIL F3: leadfeast policy unwrap'); return finish(); }
    const crypto = require('crypto');
    async function traj(instrument) {
      const { Game } = await loadGame({ seed: 33, mode: 'holdloss-traj' });
      await setupGame(Game);
      const hashes = [];
      const t = { beats: [], deaths: [] };
      if (instrument) {
        const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; };
        const origSay = Game.say ? Game.say.bind(Game) : null;
        const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
        Game.say = function (msg) { try { t.beats.push({ day: gday(), text: String(msg) }); } catch (e) {} return origSay ? origSay(msg) : msg; };
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
    fail++; console.log('  FAIL F3 exception: ' + (e && e.message));
  }
  finish();
})();

function finish() {
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
