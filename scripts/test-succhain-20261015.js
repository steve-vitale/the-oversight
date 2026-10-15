#!/usr/bin/env node
// scripts/test-succhain-20261015.js — proof for the succhain instrument
// (sim-succhain, 2026-10-15, scale-onramp axis).
//
// REAL-RED / REAL-GREEN, honest fixtures only:
//   - A naive grouping (no gap window, no young-window restriction) is
//     run FIRST on the boundary fixtures and must MISFIRE demonstrably
//     (chains two deaths 45d apart; counts a pre-national death into a
//     young-national chain). The real builder must do neither.
//   - Chain building: length, gaps, the gap-7/8 boundary, cause sequence
//     naming (incl. unnameable-raw), polity state per death, snap/raid
//     co-occurrence, pantry trajectory, rank-fall impact, attribution
//     bar accounting (unreadable polity state counts AGAINST).
//   - Trajectory-neutrality: the instrument's say/registerDeath wrappers
//     are read-only passthrough — a 30d real sim with the instrument ON
//     is byte-identical to OFF. FEASTSCALE_R13=1 asserted up front (#312).
'use strict';
const SC = require('./succhain-lib-20261015');
const HL = require('./holdloss-lib-20261015');

const R13 = process.env.FEASTSCALE_R13 === '1';

let pass = 0, fail = 0;
function chk(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// ---------------------------------------------------------------- fixtures
function scaleRows(schedule, N, links) {
  const rows = [];
  for (let d = 1; d <= N; d++) {
    let rank = 'village';
    for (const s of schedule) if (d >= s.from && d <= s.to) rank = s.rank;
    rows.push({ day: d, rank, exiled: false, links: links || [] });
  }
  return rows;
}
const LINK_A = { vid: 'v-Ridge', kind: 'lead', trust: 55, arrears: 0, perWeek: 4000, age: 40 };
const LINK_B = { vid: 'v-Thorn', kind: 'lead', trust: 62, arrears: 1200, perWeek: 4000, age: 40 };
function bdeath(day, name, cause, player) {
  return { day, name, cause, kind: 'villager', player: player == null ? true : player };
}
function food(day, pantryDays, pantryKcal, pop) {
  return { day, pop: pop || 12, pantryKcal: pantryKcal == null ? 30000 : pantryKcal, pantryDays: pantryDays == null ? 5 : pantryDays, ateShare: 90 };
}
function mkRec(o) {
  o = o || {};
  const N = o.days || 100;
  return {
    seed: 1, policy: 'leadfeast', days: N, endReason: 'survived', won: false,
    scaleRows: o.scaleRows || scaleRows([{ from: 65, to: N, rank: 'national' }], N, [LINK_A, LINK_B]),
    foodRows: o.foodRows || [],
    standingRows: [],
    deaths: o.deaths || [], beats: o.beats || [],
    waveUnlockDays: { 4: null, 5: null },
    breaks: [], exiledEver: false, exiledDay: null,
  };
}

// a naive grouping: no gap window (chains everything), no young window
// (counts every bearer <redacted> the run). Used ONLY for REAL-RED.
function naiveChains(rec) {
  const deaths = ((rec || {}).deaths || []).filter(SC.isBearerDeath)
    .sort((a, b) => a.day - b.day);
  return deaths.length ? [{ length: deaths.length, deaths }] : [];
}

// ---------------------------------------------------------------- 1. bearer detection
console.log('F1: bearer detection');
chk('player:true flag marks the bearer', SC.isBearerDeath({ kind: 'villager', player: true }));
chk('kind fallback: "player"', SC.isBearerDeath({ kind: 'player' }));
chk('kind fallback: "scholar"', SC.isBearerDeath({ kind: 'scholar' }));
chk('ordinary villager is NOT a bearer', !SC.isBearerDeath({ kind: 'villager', player: false }));
chk('monster is NOT a bearer', !SC.isBearerDeath({ kind: 'monster' }));

// ---------------------------------------------------------------- 2. REAL-RED
console.log('F2: REAL-RED — the naive grouping misfires');

// R1: two bearer deaths 45d apart (d70, d115), national from d65.
// Naive: one 2-chain. Real: two 1-chains (gap 45 > 7).
const recR1 = mkRec({ deaths: [bdeath(70, 'A', 'combat'), bdeath(115, 'B', 'combat')] });
chk('R1 REAL-RED: naive chains the 45d pair', naiveChains(recR1)[0].length === 2);
const builtR1 = SC.buildChains(recR1);
chk('R1 real builder splits at gap 45', builtR1.chains.length === 2 &&
  builtR1.chains[0].length === 1 && builtR1.chains[1].length === 1,
  'got ' + JSON.stringify(builtR1.chains.map(c => c.length)));

// R2: a pre-national bearer death (d40) + a young-national death (d70),
// national from d65. Naive: one 2-chain spanning the ladder. Real: the
// pre-national death is context, the young window holds one 1-chain.
const recR2 = mkRec({ deaths: [bdeath(40, 'A', 'combat'), bdeath(70, 'B', 'combat')] });
chk('R2 REAL-RED: naive spans the ladder (pre-national + national)',
  naiveChains(recR2)[0].length === 2 && naiveChains(recR2)[0].deaths[0].day === 40);
const builtR2 = SC.buildChains(recR2);
chk('R2 real: pre-national death is context, not a chain',
  builtR2.chains.length === 1 && builtR2.chains[0].firstDay === 70 &&
  builtR2.outsideWindow.length === 1 && builtR2.outsideWindow[0].day === 40,
  'got chains=' + JSON.stringify(builtR2.chains.map(c => c.firstDay)) + ' outside=' + JSON.stringify(builtR2.outsideWindow.map(d => d.day)));

// ---------------------------------------------------------------- 3. chain building (GREEN)
console.log('F3: chain building — the real builder');

// G1: three deaths d70,71,78 in the young window (national d65) -> one
// 3-chain, gaps [1,7] (the s22 holdloss shape: gap 7 chains).
const recG1 = mkRec({
  deaths: [bdeath(70, 'Elif', 'combat'), bdeath(71, 'Zoe', 'combat'), bdeath(78, 'Rin', 'Highbeam Deer')],
  foodRows: [food(70, 4.0, 40000, 12), food(78, 1.5, 12000, 8)],
  beats: [{ day: 69, text: '🌙 Night. Shouts from the treeline — Kai of Thorn with 3 others, and they\'re not here to talk.' }],
});
const attr1 = SC.attributeChains(recG1);
chk('G1 one 3-chain', attr1.nChains === 1 && attr1.chains[0].length === 3, 'got ' + attr1.nChains);
chk('G1 gaps [1,7]', JSON.stringify(attr1.chains[0].gaps) === '[1,7]', 'got ' + JSON.stringify(attr1.chains[0].gaps));
chk('G1 boundary: gap exactly 7 chains', attr1.chains[0].lastDay === 78);
chk('G1 cause sequence names every death',
  /d70 Elif \(combat \[combat\]\)/.test(attr1.chains[0].impact.causeSeq) &&
  /d78 Rin \(Highbeam Deer \[monster\]\)/.test(attr1.chains[0].impact.causeSeq),
  attr1.chains[0].impact.causeSeq);
chk('G1 polity state at each death (2 links, arrears 1200)',
  attr1.chains[0].deaths.every(d => d.polity && d.polity.nLinks === 2 && d.polity.totalArrears === 1200),
  JSON.stringify(attr1.chains[0].deaths.map(d => d.polity && d.polity.nLinks)));
chk('G1 raid co-occurrence ±3d fires', attr1.chains[0].deaths[0].cooccur.raids.length === 1,
  JSON.stringify(attr1.chains[0].deaths[0].cooccur.raids));
chk('G1 pantry trajectory through the chain named',
  /pantry through the chain: 4\.0d/.test(attr1.chains[0].impact.evidence.join(' ')),
  attr1.chains[0].impact.evidence.join(' | '));
chk('G1 chain attributed', attr1.nAttributed === 1 && attr1.attribRate === 1);

// G2: boundary the other way — deaths d70, d78 (gap 8) split.
const recG2 = mkRec({ deaths: [bdeath(70, 'A', 'combat'), bdeath(78, 'B', 'combat')] });
const builtG2 = SC.buildChains(recG2);
chk('G2 boundary: gap 8 splits', builtG2.chains.length === 2,
  'got ' + JSON.stringify(builtG2.chains.map(c => c.length)));

// G3: unnameable cause stays raw-named, trail kept (holdloss convention).
const recG3 = mkRec({ deaths: [bdeath(70, 'A', 'Big-Bane')] });
const attr3 = SC.attributeChains(recG3);
chk('G3 unnameable cause named raw', /Big-Bane \[other-named\]/.test(attr3.chains[0].impact.causeSeq),
  attr3.chains[0].impact.causeSeq);

// G4: snap co-occurrence + rank fall impact.
const recG4 = mkRec({
  scaleRows: scaleRows([{ from: 65, to: 79, rank: 'national' }, { from: 80, to: 100, rank: 'regional' }], 100, [LINK_A]),
  deaths: [bdeath(70, 'A', 'combat'), bdeath(73, 'B', 'combat')],
  beats: [{ day: 74, text: "In the chaos, the neglected link snaps — no tribute, no deeds, no one left who kept it. Nobody meant it. That's how these things go." }],
});
const attr4 = SC.attributeChains(recG4);
chk('G4 snap co-occurrence named', attr4.chains[0].impact.snapsInChain === 1,
  'got ' + attr4.chains[0].impact.snapsInChain);
chk('G4 rank fell within 7d of last death', attr4.chains[0].impact.rankFell7d === true,
  'got rank7dAfter=' + attr4.chains[0].impact.rank7dAfter);

// G5: no national reached -> no window, bearer deaths are context.
const recG5 = mkRec({
  scaleRows: scaleRows([], 100, []),
  deaths: [bdeath(40, 'A', 'combat')],
});
const attr5 = SC.attributeChains(recG5);
chk('G5 no national: no chains, death is context',
  attr5.window === null && attr5.nChains === 0 && attr5.outsideWindow.length === 1);

// G6: polity state unreadable -> counts AGAINST attribution.
const recG6 = mkRec({
  scaleRows: [],  // scale rows missing entirely, but a window can't form...
  deaths: [bdeath(70, 'A', 'combat')],
});
const attr6 = SC.attributeChains(recG6);
chk('G6 no window at all when scaleRows are absent', attr6.window === null && attr6.attribRate === null);

// G7: rows after the death day are never forward-read (nearestRow).
chk('G7 nearestRow never forward-reads',
  SC.nearestRow([{ day: 60 }, { day: 70 }, { day: 80 }], 75).day === 70 &&
  SC.nearestRow([{ day: 60 }, { day: 70 }, { day: 80 }], 59) === null);

// G8: narrative is a first-class deliverable (mentions length, deaths,
// polity, impact).
const nar = SC.chainNarrative(recG1, attr1.chains[0]);
chk('G8 narrative has chain shape', /3 bearers, d70->d78/.test(nar));
chk('G8 narrative names deaths + polity', /Elif dies/.test(nar) && /v-Ridge/.test(nar));

// ---------------------------------------------------------------- 4. trajectory neutrality (real sim)
console.log('F4: instrument trajectory-neutrality (real 30d sim)');
(async () => {
  if (!R13) { fail++; console.log('  FAIL F4: FEASTSCALE_R13=1 not set (substrate gate — #312)'); return finish(); }
  try {
    const { loadGame, setupGame, runDays } = require('./sim-harness');
    const { leadfeast } = require('./policies/feastscale');
    if (!leadfeast || leadfeast.id !== 'leadfeast') { fail++; console.log('  FAIL F4: leadfeast policy unwrap'); return finish(); }
    const crypto = require('crypto');
    async function traj(instrument) {
      const { Game } = await loadGame({ seed: 33, mode: 'succhain-traj' });
      await setupGame(Game);
      const hashes = [];
      const t = { beats: [], deaths: [] };
      if (instrument) {
        const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; };
        const BEAT_RE = /wave 4|wave 5|mirror draft|standing|national|regional|link|break|tribute|exile|table|died|dead|starv|ascend|treaty|succession|realm came apart|pantry|famine|snap|raid|treeline|won\b/i;
        const origSay = Game.say ? Game.say.bind(Game) : null;
        const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
        const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
        const push = (text) => {
          try {
            const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 300);
            if (BEAT_RE.test(s)) t.beats.push({ day: gday(), text: s });
          } catch (e) {}
        };
        Game.say = function (msg) { push(msg); return origSay ? origSay(msg) : msg; };
        if (origSys) Game.sysSay = function (msg) { push(msg); return origSys ? origSys(msg) : msg; };
        if (origReg) {
          Game.registerDeath = function (opts) {
            const r = origReg(opts);
            try {
              const o = opts || {};
              t.deaths.push({ day: gday(), kind: String(o.kind || '?'), name: String(o.name || '?'), cause: String(o.cause || '?'), player: !!o.player });
            } catch (e) {}
            return r;
          };
        }
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
    chk('instrument actually sampled (beats>0)', on.beats > 0, `beats=${on.beats} deaths=${on.deaths}`);
  } catch (e) {
    fail++; console.log('  FAIL F4 exception: ' + (e && e.message));
  }
  finish();
})();

function finish() {
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
