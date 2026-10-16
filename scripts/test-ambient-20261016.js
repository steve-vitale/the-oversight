#!/usr/bin/env node
// scripts/test-ambient-20261016.js — proof for sim-ambient-b (lever loop B,
// 2026-10-16, food-economy axis; sim-findings #394).
//
// THE BLANK: 9 ambient villager beats were single verbatim templates —
// REST "sleeping by the fire", EAT "eating by the fire — not talking, just
// eating", HAVEN_CHORE fire/repair/cook/sweep, the teach-less "finds" beat,
// the VISIT beat, and the game.js sick-recovery line "on the mend — X broke".
// On repeat exposure they read robotic (SENSE-TESTING LAW).
//
// THE FIX (VOICE ONLY): each beat gets 4 verb-phrase renderings
// (variant 0 = the original line verbatim), selected by a DETERMINISTIC
// pure function of (villager-id, day) via this._hashStr — never
// R()/Math.random() (findings #263/#264: any RNG draw-count change shifts
// downstream sims and fails the det-gate). Zero mechanics change: the same
// beats fire at the same rates behind the same gates; only the wording
// rotates. Knowledge-gating untouched ("If you don't know, it doesn't show").
//
// PART 0 — REAL RED: the >=3-distinct-variants assertion is run against the
//   verbatim PRE-FIX templates (from HEAD before the lever) and must FAIL
//   for every key — proving the test discriminates the blank it fills.
// PART A — fixtures on the real pools (Game.ambientBeats / ambientPick /
//   ambientLine): >=3 renderings per key, variant-0 verbatim, determinism,
//   rotation over the day axis, vid/day coverage, no-RNG source scan,
//   unknown-key silence, mend knowledge-gate slot.
// PART B — real-sim proof of effect: 1 seed x leadfeast x 40d on the real
//   engine; the ambientPick path must fire (>=3 variant selections) —
//   the lever is exercised, not just constructed.
//
// SMOKE=1: PART 0 + PART A + 1 seed x 1 policy x 25d PART B.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//     node scripts/test-ambient-20261016.js
'use strict';
const SMOKE = process.env.SMOKE === '1';
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (!process.env[k]) { console.log(`  (test default: ${k}=1)`); process.env[k] = '1'; }
}
if (!process.env.SEATDRIVE) { console.log('  (test default: SEATDRIVE=0)'); process.env.SEATDRIVE = '0'; }

let fails = [];
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails.push(name);
}

// Verbatim PRE-FIX templates from HEAD (before the lever). nm='ZZZ',
// tname2='YYY', mendOf='the fever'. The RED fixture.
const PREFIX = {
  rest: [`\u{1F634} ZZZ is sleeping by the fire.`],
  eat: [`\u{1F372} ZZZ is eating by the fire \u2014 not talking, just eating.`],
  chore_fire: [`ZZZ is tending the fire, coaxing it steady.`],
  chore_repair: [`ZZZ is mending something by the door \u2014 patient work.`],
  chore_cook: [`ZZZ is working the cookpot, tasting, adjusting.`],
  chore_sweep: [`ZZZ is sweeping the hall. Someone has to.`],
  finds: [`\u{1F4D6} ZZZ is going over their finds, re-tying the bundle.`],
  visit: [`\u{1F4AC} ZZZ is sitting with YYY, talking low. Not business. Just people.`],
  mend: [`\u{1F912} ZZZ is on the mend \u2014 the fever broke.`],
};
const KEYS = Object.keys(PREFIX);

// PART 0 — REAL RED
console.log('== PART 0 — RED: the >=3-variants assertion on the PRE-FIX templates ==');
let redFails = 0;
for (const k of KEYS) {
  const distinct = new Set(PREFIX[k]).size;
  const ok = distinct >= 3;
  if (ok) redFails++;
  console.log(`  ${ok ? 'UNEXPECTED-PASS' : 'RED-confirmed'} ${k}: ${distinct} distinct rendering(s)`);
}
check('RED: every pre-fix template has <3 renderings (the blank)', redFails === 0, `${KEYS.length - redFails}/${KEYS.length} RED`);

async function main() {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const SD = require('./policies/seatdrive');

  console.log('== PART A — fixtures on the real pools ==');
  let Game = null;
  await quietLog(async () => {
    const r = await loadGame({ seed: 777001, mode: 'ambient-fixture' });
    Game = r.Game;
    await setupGame(Game);
  });
  check('harness loads with the lever', typeof Game.ambientPick === 'function' && typeof Game.ambientBeats === 'function' && typeof Game.ambientLine === 'function');

  const pools = Game.ambientBeats();
  // A1: all keys present, >=3 renderings each
  for (const k of KEYS) {
    check(`A1 pool ${k} has >=3 renderings`, !!(pools[k] && pools[k].length >= 3), `n=${pools[k] ? pools[k].length : 0}`);
  }
  // A2: >=3 DISTINCT rendered strings per key
  for (const k of KEYS) {
    const rendered = pools[k].map(fn => { try { return fn('Zed', k === 'visit' ? 'Yan' : 'the fever'); } catch (e) { return 'ERR'; } });
    check(`A2 pool ${k} renders >=3 distinct strings`, new Set(rendered).size >= 3, `${new Set(rendered).size} distinct`);
  }
  // A3: variant 0 is the original line verbatim
  for (const k of KEYS) {
    let v0 = null;
    try { v0 = pools[k][0]('ZZZ', k === 'visit' ? 'YYY' : 'the fever'); } catch (e) {}
    check(`A3 pool ${k} variant 0 is the original verbatim`, v0 === PREFIX[k][0], v0 === PREFIX[k][0] ? '' : `got: ${v0}`);
  }
  // A4: determinism — same (vid,key,day) -> same index, 200 calls x 12 vids
  const vids = ['v_1', 'v_2', 'v_abc', 'villager_99', 'p', 'vx', 'v_1000', 'v_q', 'v_zed', 'v_7', 'v_42', 'v_k'];
  let detOk = true;
  for (const vid of vids) for (const k of KEYS) {
    const first = Game.ambientPick(vid, k, pools[k].length);
    for (let i = 0; i < 200; i++) if (Game.ambientPick(vid, k, pools[k].length) !== first) { detOk = false; break; }
  }
  check('A4 ambientPick deterministic (200x12 vids x 9 keys)', detOk);
  // A5: rotation — the day axis actually moves the pick (fixed vid, 120 days)
  Game.state.scholar.day = 0;
  let rotOk = true;
  for (const k of KEYS) {
    const seen = new Set();
    for (let d = 0; d < 120; d++) { Game.state.scholar.day = d; seen.add(Game.ambientPick('v_rot_7', k, pools[k].length)); }
    if (seen.size < 2) rotOk = false;
    check(`A5 pool ${k} rotates over days`, seen.size >= 2, `${seen.size} indices / 120 days`);
  }
  // A6: coverage — 24 vids x days 0..89: >=3 distinct indices per key
  for (const k of KEYS) {
    const seen = new Set();
    for (let vi = 0; vi < 24; vi++) for (let d = 0; d < 90; d++) {
      Game.state.scholar.day = d;
      seen.add(Game.ambientPick('v_cov_' + vi, k, pools[k].length));
    }
    check(`A6 pool ${k} >=3 indices over vid/day space`, seen.size >= 3, `${seen.size} distinct`);
  }
  Game.state.scholar.day = 1;
  // A7: no-RNG source scan — ambientPick, ambientLine, and every pool fn
  // must not draw RNG (R( / Math.random / the module pick( helper).
  const rngRe = /(^|[^a-zA-Z_$])R\s*\(|Math\s*\.\s*random|[^a-zA-Z_$]pick\s*\(/;
  let rngOk = true, rngWhere = [];
  for (const [label, fn] of [['ambientPick', Game.ambientPick], ['ambientLine', Game.ambientLine]]) {
    const src = Function.prototype.toString.call(fn);
    if (rngRe.test(src)) { rngOk = false; rngWhere.push(label); }
  }
  for (const k of KEYS) for (let i = 0; i < pools[k].length; i++) {
    const src = Function.prototype.toString.call(pools[k][i]);
    if (rngRe.test(src)) { rngOk = false; rngWhere.push(`${k}[${i}]`); }
  }
  check('A7 no RNG draws in picker/line/pools (source scan)', rngOk, rngWhere.join(',') || 'clean');
  // A8: unknown key stays silent (old "unknown chore = no say" behavior)
  check('A8 ambientLine unknown key -> null', Game.ambientLine('chore_dance', 'v_1', 'Zed') === null);
  let visitLine = null;
  try { visitLine = Game.ambientLine('visit', 'v_1', 'Asha', 'Bram'); } catch (e) {}
  check('A8 visit line names both villagers', typeof visitLine === 'string' && visitLine.includes('Asha') && visitLine.includes('Bram'), String(visitLine).slice(0, 80));
  // A9: mend knowledge-gate slot — every variant carries the `of` argument
  let mendOk = true;
  for (const ofName of ['gut rot', 'the fever', 'wound fever']) {
    for (const fn of pools.mend) {
      let s = ''; try { s = fn('Zed', ofName); } catch (e) {}
      if (!s.includes(ofName)) mendOk = false;
    }
  }
  check('A9 every mend variant voices the known-or-fever slot', mendOk);

  // PART B — real-sim proof of effect
  console.log('== PART B — real-sim proof of effect ==');
  const days = SMOKE ? 25 : 40;
  const base = SD.leadseat;
  const policy = Object.assign({}, base);
  const od = base.daily;
  let picks = 0;
  const pickKeys = {};
  await quietLog(async () => {
    const r = await loadGame({ seed: 777002, mode: 'ambient-proof' });
    const G2 = r.Game;
    await setupGame(G2);
    const oPick = G2.ambientPick.bind(G2);
    G2.ambientPick = function (vid, key, n) {
      const i = oPick(vid, key, n);
      picks++; pickKeys[key] = (pickKeys[key] || 0) + 1;
      return i;
    };
    policy.daily = (G, ctx) => (od ? od(G, ctx) : undefined);
    await runDays(G2, policy, { days, sampleEvery: 1 });
  });
  console.log(`  variant selections in ${days}d sim: ${picks} (${Object.keys(pickKeys).join(', ') || 'none'})`);
  check('B1 ambientPick path fires in a real sim', picks >= 3, `${picks} selections`);
  check('B2 >=2 beat kinds exercised', Object.keys(pickKeys).length >= 2, Object.keys(pickKeys).join(','));

  console.log(fails.length ? `\nRESULT: ${fails.length} FAILURE(S): ${fails.join('; ')}` : '\nRESULT: ALL GREEN');
  process.exit(fails.length ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
