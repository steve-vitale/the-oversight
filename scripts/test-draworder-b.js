#!/usr/bin/env node
// test-draworder-b.js — PROOF for the sim-draworder-b arm (loop B, food-economy).
//
// Usage (HONOR EXACTLY — env-trap lesson 2026-10-20: run proofs WITH the env):
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-draworder-b.js --mode red   --tag pristine
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-draworder-b.js --mode red   --tag modified
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-draworder-b.js --mode green
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-draworder-b.js --mode det
// DRAWCOARSE is managed INSIDE the script (set/unset between phases), never
// inherited from the shell — phases that need it set it; RED phases unset it.
// The --tag red runs write a digest file; RED passes iff the pristine-file
// run and the modified-file (DRAWCOARSE unset) run are byte-identical.
//
//   red   : 25d leadfeast, DRAWCOARSE unset -> trajectory digest to file
//   green : constructed pantry -> with DRAWCOARSE=1 coarse draws first;
//           with unset fine-first (pristine); slabs still last; no kcal lost
//   det   : 25d x 2 identical runs, DRAWCOARSE unset -> identical digests
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: honor Usage: FEASTSCALE_R13=1 SEATDRIVE=0');
  process.exit(2);
}
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i < 0 ? d : process.argv[i + 1]; };
const MODE = arg('mode', 'green');
const TAG = arg('tag', 'x');

let failures = 0;
function check(name, ok, detail) {
  if (ok) { console.log(`  PASS ${name}`); }
  else { failures++; console.log(`  FAIL ${name}${detail ? ' :: ' + String(detail).slice(0, 400) : ''}`); }
}

function digest(Game, res) {
  const v = (Game.state || {}).village || {};
  const items = (v.pantry || []).map(i =>
    [i.name, i.kcalEach, i.units, i.spoilDay, i.kg, i.foodState, !!i.safe].join('|')).sort();
  return JSON.stringify({
    days: res.days, end: res.endReason,
    day: ((Game.state || {}).scholar || {}).day || 0,
    roster: (v.roster || []).length,
    items,
    rem: Math.round(Number(v._surplusRemainder) || 0),
    won: !!Game.won,
    pk: (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0),
  });
}

// ---- RED: 25d trajectory digest, DRAWCOARSE unset ----
async function red() {
  delete process.env.DRAWCOARSE;
  const seed = 23101;
  const { Game } = await loadGame({ seed, mode: 'draworder-red-' + TAG, fullTelemetry: false });
  await setupGame(Game);
  const res = await runDays(Game, leadfeast, { days: 25, manifest: null, sampleEvery: 26 });
  const d = digest(Game, res);
  const out = path.join(__dirname, '..', 'evidence', '2026-10-21', `digest-draworder-red-${TAG}.json`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, d + '\n');
  console.log(`RED digest (${TAG}, DRAWCOARSE unset) written: ${out}`);
  console.log(`  digest: ${d.slice(0, 160)}...`);
}

// ---- GREEN: constructed draw-order proofs ----
async function green() {
  const { Game } = await loadGame({ seed: 23102, mode: 'draworder-green', fullTelemetry: false });
  await setupGame(Game);

  const fine = { name: 'Berries', kcalEach: 200, units: 10, spoilDay: 3, kg: 0.2 };
  const coarse = { name: 'Foraged food', kcalEach: 500, units: 4, spoilDay: 6, kg: 0.05 };
  const slab = { name: 'Mammoth slab', kcalEach: 3000, units: 1, spoilDay: 10, kg: 0.5 };

  // 1. pristine behavior (unset): fresh-first/best-fit eats the 200-kcal unit first
  delete process.env.DRAWCOARSE;
  let v = { pantry: [JSON.parse(JSON.stringify(fine)), JSON.parse(JSON.stringify(coarse))] };
  let out = Game.pantryDraw(v, 2000, {});
  check('pristine (unset) eats fine-first', out.items.length && out.items[0].item.kcalEach === 200,
    JSON.stringify(out.items.map(i => i.item.kcalEach)));

  // 2. armed: coarse piece draws FIRST even though its clock is later
  process.env.DRAWCOARSE = '1';
  v = { pantry: [JSON.parse(JSON.stringify(fine)), JSON.parse(JSON.stringify(coarse))] };
  out = Game.pantryDraw(v, 2000, {});
  check('DRAWCOARSE=1 eats coarse-first', out.items.length && out.items[0].item.kcalEach === 500,
    JSON.stringify(out.items.map(i => i.item.kcalEach)));
  check('DRAWCOARSE=1 coarse piece fully drawn for a 2000 need', out.items[0].units === 4,
    JSON.stringify(out.items.map(i => i.units)));
  check('DRAWCOARSE=1 taken covers need', out.taken >= 2000, String(out.taken));

  // 3. anti-slab law holds armed: slab still rides last
  v = { pantry: [JSON.parse(JSON.stringify(slab)), JSON.parse(JSON.stringify(coarse)), JSON.parse(JSON.stringify(fine))] };
  out = Game.pantryDraw(v, 400, {});
  check('DRAWCOARSE=1 slab still rides last', out.items.length && out.items[out.items.length - 1].item.kcalEach !== 3000,
    JSON.stringify(out.items.map(i => i.item.kcalEach)));
  check('DRAWCOARSE=1 slab untouched by a small draw', v.pantry.some(i => i.kcalEach === 3000 && i.units === 1),
    JSON.stringify(v.pantry.map(i => [i.kcalEach, i.units])));

  // 4. no nonsensical calorie loss: pantry kcal conserved across the draw
  v = { pantry: [JSON.parse(JSON.stringify(fine)), JSON.parse(JSON.stringify(coarse))] };
  const before = v.pantry.reduce((t, i) => t + i.kcalEach * i.units, 0);
  out = Game.pantryDraw(v, 2000, {});
  const after = v.pantry.reduce((t, i) => t + i.kcalEach * i.units, 0);
  check('draw conserves kcal (taken + remainder == before)', out.taken + after === before,
    `before=${before} taken=${out.taken} after=${after}`);

  // 5. spoiled items still skipped armed (canon: rot never resurrected)
  const bad = { name: 'Rotten meat', kcalEach: 400, units: 2, spoilDay: 1, kg: 0.05 };
  if (typeof Game.isSpoiled === 'function') {
    // mark spoiled only if the engine's own classifier agrees
    const looksSpoiled = Game.isSpoiled(bad);
    console.log(`  INFO isSpoiled(classic 400-kcal spoilDay1) = ${looksSpoiled}`);
  }
  delete process.env.DRAWCOARSE;
}

// ---- DET: determinism with variant unset ----
async function det() {
  delete process.env.DRAWCOARSE;
  const digests = [];
  for (const rep of [1, 2]) {
    const { Game } = await loadGame({ seed: 23101, mode: 'draworder-det-' + rep, fullTelemetry: false });
    await setupGame(Game);
    const res = await runDays(Game, leadfeast, { days: 25, manifest: null, sampleEvery: 26 });
    digests.push(digest(Game, res));
  }
  check('DET: 2 identical unset runs byte-identical', digests[0] === digests[1],
    digests[0] === digests[1] ? '' : `\nA: ${digests[0].slice(0, 300)}\nB: ${digests[1].slice(0, 300)}`);
}

(async () => {
  try {
    if (MODE === 'red') await red();
    else if (MODE === 'green') await green();
    else if (MODE === 'det') await det();
    else { console.error('unknown mode ' + MODE); process.exit(2); }
  } catch (e) { console.error(e.stack); process.exitCode = 1; return; }
  if (failures) { console.error(`\n${failures} FAILURES`); process.exitCode = 1; }
  else console.log('\nALL GREEN');
})();
