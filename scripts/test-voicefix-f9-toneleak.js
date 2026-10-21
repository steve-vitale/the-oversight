#!/usr/bin/env node
// PROOF: F9 tone-tag leak — DNA discourse closers ' — comedy.' / ' — anyway.'
// rendered INSIDE quoted speech as stage directions (audit blank F9,
// evidence/2026-10-21/sim-villagersense.md). 7x observed in journey
// transcripts, e.g.  THEM "…twice the ground. — comedy."
//
// RED (2026-10-21, pre-fix on master): a dry-humor villager's closer pool
// contains the literal stage direction ' — comedy.' and quick-paced
// ' — anyway.'; voiced statements come out as "…twice the ground. — comedy."
//
// GREEN (post-fix): the closers are spoken words — quick-pace drops
// ", anyway." (comma-folded: "…twice the ground, anyway."), dry humor gives
// the flat deadpan " Ha." ("…twice the ground. Ha."). Both are things a
// PERSON would say, not stage directions.
//
// SENSE-TESTING LAW: prints every sample line so a human can read them aloud.
//
// Usage: node scripts/test-voicefix-f9-toneleak.js
//   Never run concurrent jest; use --cacheDirectory=/tmp/jest-cache-<slug> (N/A here).

'use strict';
const K = require('./godpath/lib');
const SEEDS = [7, 777, 424242, 90210, 1306, 1501, 20261021, 31337];

let Game, pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}` + (extra ? ` — ${extra}` : '')); }
}
function vname(vid) { try { return Game.villagerName(vid) || vid; } catch (e) { return vid; } }

// Force the marker branch deterministically (same pattern as the green-list
// test-convo-seed-voice-20261011.js voiceCheck): first Math.random() -> 0
// (marker gate passes), subsequent -> 0.99 (closers chosen, no openers).
function sweep(vid, line, n) {
  const out = [];
  const random = Math.random;
  try {
    for (let i = 0; i < n; i++) {
      let call = 0;
      Math.random = () => call++ === 0 ? 0 : 0.99;
      out.push(Game.voiceLine(vid, line));
    }
  } finally { Math.random = random; }
  return out;
}

async function main() {
  let quick = null, dry = null, quickSeed = null, drySeed = null;
  for (const seed of SEEDS) {
    Game = await K.load({ seed });
    K.newRun(Game);
    const npcs = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
    for (const vid of npcs) {
      let dna = null;
      try { dna = Game.convoSpeechDNA(vid); } catch (e) { continue; }
      if (!dna) continue;
      if (!quick && dna.pace === 'quick') { quick = vid; quickSeed = seed; }
      if (!dry && dna.humor === 'dry') { dry = vid; drySeed = seed; }
      if (quick && dry) break;
    }
    if (quick && dry) break;
  }
  if (!quick) { console.log('no quick-paced villager found across seeds — abort'); process.exit(2); }
  if (!dry) { console.log('no dry-humor villager found across seeds — abort'); process.exit(2); }
  console.log(`quick: ${vname(quick)} (seed ${quickSeed}) | dry: ${vname(dry)} (seed ${drySeed})`);

  const LINE = '"We covered twice the ground."';

  // --- DNA pool content ---
  Game = await K.load({ seed: quickSeed }); K.newRun(Game);
  const quickMarkers = Game.convoSpeechMarkers(quick);
  Game = await K.load({ seed: drySeed }); K.newRun(Game);
  const dryMarkers = Game.convoSpeechMarkers(dry);
  console.log(`quick closers: ${JSON.stringify(quickMarkers.close)}`);
  console.log(`dry closers:   ${JSON.stringify(dryMarkers.close)}`);

  const dashTags = c => c.filter(x => /^ — (anyway|comedy)\.$/.test(String(x)));
  ok('quick DNA closer pool has no dash tone-tags (" — anyway."/" — comedy.")',
    dashTags(quickMarkers.close).length === 0,
    `found: ${JSON.stringify(dashTags(quickMarkers.close))}`);
  ok('dry DNA closer pool has no dash tone-tags (" — anyway."/" — comedy.")',
    dashTags(dryMarkers.close).length === 0,
    `found: ${JSON.stringify(dashTags(dryMarkers.close))}`);
  ok('quick DNA closer pool still carries the spoken anyway-tic',
    quickMarkers.close.some(x => /, anyway\.$/.test(String(x))),
    `pool: ${JSON.stringify(quickMarkers.close)}`);
  ok('dry DNA closer pool still carries the dry-humor marker (flat "Ha.")',
    dryMarkers.close.some(x => /(^|\s)Ha\.$/.test(String(x))),
    `pool: ${JSON.stringify(dryMarkers.close)}`);

  // --- voiced output (reload fresh runs so cycles start clean) ---
  Game = await K.load({ seed: quickSeed }); K.newRun(Game);
  const qOut = sweep(quick, LINE, 120);
  Game = await K.load({ seed: drySeed }); K.newRun(Game);
  const dOut = sweep(dry, LINE, 120);

  const leaked = qOut.concat(dOut).filter(l => /— (anyway|comedy)\."$/.test(String(l)));
  ok('voiced statements never leak "— anyway."/"— comedy." inside quotes', leaked.length === 0,
    `leaked: ${leaked.slice(0, 3).join(' | ')}`);
  const spokenAnyway = qOut.filter(l => /, anyway\."$/.test(String(l)));
  ok('quick villager still drops the spoken ", anyway." tic on statements', spokenAnyway.length > 0,
    `seen: ${[...new Set(qOut)].join(' | ').slice(0, 200)}`);
  const deadpanHa = dOut.filter(l => / Ha\."$/.test(String(l)));
  ok('dry-humor villager gives the flat deadpan "Ha." on statements', deadpanHa.length > 0,
    `seen: ${[...new Set(dOut)].join(' | ').slice(0, 200)}`);

  console.log(`\nquick-paced samples (${vname(quick)}):`);
  for (const l of [...new Set(qOut)].slice(0, 6)) console.log(`  ${l}`);
  console.log(`dry-humor samples (${vname(dry)}):`);
  for (const l of [...new Set(dOut)].slice(0, 6)) console.log(`  ${l}`);

  console.log(`\nvoicefix-f9-toneleak: ${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exitCode = 2; });
