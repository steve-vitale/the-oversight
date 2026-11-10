// roundcap-redrive-20261110.js — sim-roundcap-b constructed cap-extension
// re-driver. Scripts only, zero src/js.
//
// Re-drives constructed field fights through the REAL Game.fieldFight with
// MAX_ROUNDS extended (+1/+2/+3) — the extension lives ONLY in the test's
// in-memory loaded copy of fieldFights.js, via the sim-harness
// `sourcePatch` hook (scripts/sim-harness.js). src/js on disk is never
// touched. The RNG stream is identical for a given seed family, so rounds
// 1-15 of a CAP=18 run are the same fight as the CAP=15 run — the proof
// test (scripts/test-roundcap-b.js) asserts that identity (CAP=15 patched
// == CAP=15 unpatched outcomes, and the CAP=15 log is a prefix of the
// CAP=18 log once the cap line is stripped).
//
// One process = one CAP value (a node process holds one loaded game).
// Usage:
//   CAP=15 node scripts/roundcap-redrive-20261110.js   (prints JSON lines)
//   CAP=18 SHAPES='[{"def":"buffering","max":310,"hps":[29,43,73],"items":["bow",{"id":"arrow","units":4}],"ally":true}]' node scripts/roundcap-redrive-20261110.js
// Env: CAP (default 15), SHAPES (JSON array, default = the Buffering
// anchor shapes), STREAMS (default 30), SEEDBASE (default 87104, the
// volleysoft family). Output: one JSON object per fight on stdout, plus
// a final {"summary": ...} line. Writes nothing into the repo.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog, mulberry32 } = require(path.join(REPO, 'scripts', 'sim-harness'));

const CAP = parseInt(process.env.CAP || '15', 10) || 15;
const STREAMS = parseInt(process.env.STREAMS || '30', 10) || 30;
const SEEDBASE = parseInt(process.env.SEEDBASE || '87104', 10) || 87104;
const DEFAULT_SHAPES = [
  // A. 99596 ANCHOR (corrected): HEALTHY fighter (100 HP) who knows the
  // Buffering trick, bow + 4 arrows, solo. Round 1 the fighter strikes
  // (100% >= 60% — no wait yet); the mirage misses ~half the strikes.
  // A missed round-1 strike + the beast's round-1 hit dropping the
  // fighter below 60% starts the stand-still wait from round 2, and the
  // wait then holds the beast at post-volley HP to the cap — the exact
  // wild shape (volleysoft corpus: mDealt == volley dmg in all three
  // capped meetings). A wounded (55 HP) entry does NOT reproduce it:
  // the beast's round-1 hit floors the fighter into a round-1 flee.
  { def: 'buffering', max: 310, hps: [29, 43, 73], items: ['bow', { id: 'arrow', units: 4 }], ally: false, health: 100, tricks: ['buffering'] },
  // B. WILD-TYPICAL: healthy fighter who knows the trick, healthy beast
  // (entry HPs are the wild census caps, 99636/99637: 149/158/210) —
  // strikes until hurt below 60%, then stands still for the rest.
  { def: 'buffering', max: 310, hps: [149, 158, 210], items: ['bow', { id: 'arrow', units: 4 }], ally: false, health: 100, tricks: ['buffering'] },
  // C. NO-TRICK CONTROL: healthy fighter who does NOT know the trick —
  // strikes through the mirage (50% miss) every round.
  { def: 'buffering', max: 310, hps: [43, 73], items: ['bow', { id: 'arrow', units: 4 }], ally: false, health: 100, tricks: [] },
  // D. STRIKING CAP (chorus_line): the wild census's non-Buffering cap
  // (99633 d94: entry 225/300, beast 40 HP at cap, fighter 70 HP) — the
  // fighter strikes most rounds (dance only on downbeats), so the cap
  // is a damage race lost by ~40 HP, not a wait. This is the shape a
  // cap extension could actually convert.
  { def: 'chorus_line', max: 300, hps: [225, 260], items: ['bow', { id: 'arrow', units: 4 }], ally: false, health: 100, tricks: ['chorus_line'] },
  // E. STRIKING CAP (callback): the wild census's other non-Buffering cap
  // (99639 d39: entry 260/260, beast 92 HP at cap, fighter 41 HP).
  { def: 'callback', max: 260, hps: [260], items: ['bow', { id: 'arrow', units: 4 }], ally: false, health: 100, tricks: ['callback'] },
];
let SHAPES = DEFAULT_SHAPES;
if (process.env.SHAPES) {
  try { SHAPES = JSON.parse(process.env.SHAPES); } catch (e) { console.error('RED RIVE STOP: bad SHAPES json: ' + e.message); process.exit(2); }
}

function patch(file, src) {
  if (!/fieldFights\.js$/.test(file)) return src;
  const needle = 'var MAX_ROUNDS = 15;';
  const hits = src.split(needle).length - 1;
  if (hits !== 1) { console.error('REDRIVE STOP: MAX_ROUNDS needle hits=' + hits + ' in ' + file); process.exit(3); }
  return src.replace(needle, 'var MAX_ROUNDS = ' + CAP + ';');
}

async function main() {
  const { Game } = await loadGame({ seed: SEEDBASE, mode: 'roundcap-redrive', fullTelemetry: false, sourcePatch: patch });
  await quietLog(async () => { await setupGame(Game); });
  const roster = ((Game.state.village || {}).roster || []).filter(function (v) { return v !== Game.villagerId; });
  if (roster.length < 2) { console.error('REDRIVE STOP: roster too small: ' + roster.length); process.exit(4); }
  const defs = {};
  for (const m of (Game.data.monsters || [])) defs[m.id] = m;

  function runFight(vid, items, def, startHp, maxHp, streamSeed, health, allyVid, tricks) {
    const vp = (Game.data.villagers || []).find(function (x) { return x.id === vid; }) || {};
    vp.items = items.map(function (it) {
      if (typeof it === 'string') return { itemId: it, units: 1 };
      return { itemId: it.id, units: it.units || 1 };
    });
    delete vp.equipped;
    // Trick knowledge is village state (state.villagerTricks[mid]); the
    // test sets it up the way a village that survived Buffering would
    // have it. Zero game code touched — this is fixture state.
    try {
      Game.state.villagerTricks = {};
      (tricks || []).forEach(function (t) { Game.state.villagerTricks[t] = true; });
    } catch (e) {}
    var hv = Game.state.village.health || (Game.state.village.health = {});
    hv[vid] = health;
    if (allyVid) { hv[allyVid] = 100; }
    const opts = { allies: allyVid ? 1 : 0, allyVids: allyVid ? [allyVid] : [],
      allyFromStart: true, rng: mulberry32(streamSeed) };
    return Game.fieldFight(vid, def, { hp: startHp, maxHp: maxHp }, opts);
  }

  const out = [];
  for (const sh of SHAPES) {
    if (!defs[sh.def]) { console.error('REDRIVE STOP: unknown def ' + sh.def); process.exit(5); }
    for (const hp of sh.hps) {
      for (let s = 1; s <= STREAMS; s++) {
        const vid = roster[s % roster.length], allyVid = sh.ally === false ? null : roster[(s + 1) % roster.length];
        const streamSeed = s * 104729 + hp;
        let rec;
        try {
          rec = runFight(vid, sh.items, defs[sh.def], hp, sh.max, streamSeed, (sh.health != null ? sh.health : 100), allyVid, sh.tricks);
        } catch (e) { continue; }
        const row = { cap: CAP, shape: sh.def + '/' + (Array.isArray(sh.items) ? sh.items.map(function (i) { return typeof i === 'string' ? i : i.id; }).join('+') : '?') +
            '/h' + (sh.health != null ? sh.health : 100) + '/t' + ((sh.tricks || []).join(',') || 'none'),
          def: sh.def, entryHp: hp, maxHp: sh.max, stream: s, streamSeed: streamSeed,
          outcome: rec.outcome, rounds: rec.rounds, roundCap: !!rec.roundCap,
          vHpLeft: rec.vHpLeft, mHpLeft: rec.mHpLeft, mDealt: rec.mDealt,
          volleyDmg: (rec.volley && rec.volley.dmg) || 0,
          log: Array.isArray(rec.log) ? rec.log.slice() : [] };
        out.push(row);
        console.log(JSON.stringify(row));
      }
    }
  }
  const capped = out.filter(function (r) { return r.roundCap; });
  console.log(JSON.stringify({ summary: true, cap: CAP, fights: out.length,
    capped: capped.length, cappedNearDead30: capped.filter(function (r) { return r.mHpLeft <= 30; }).length,
    cappedNearDead10: capped.filter(function (r) { return r.mHpLeft <= 10; }).length,
    outcomes: (function () { const o = {}; out.forEach(function (r) { o[r.outcome] = (o[r.outcome] || 0) + 1; }); return o; })() }));
  process.exit(0);
}
main().catch(function (e) { console.error('REDRIVE FAILED:', (e && e.stack) || e); process.exit(1); });
