#!/usr/bin/env node
// test-crisis-moot-cannibal-20261018.js — CRISIS LEG r24: THE MOOT TRIES THE CANNIBAL.
//
// Witnessed cannibalism in a HEALTHY village (cannibalNorm()==='exile') must
// run the canon ladder (docs/CORRUPTION.md): confrontation names the charge,
// no buy-off, moot convenes on the cannibalism charge, exile sentence, exile
// enforced. Four RED→GREEN assertions through the real functions:
//   T1 justiceConfront: the ⚖ line names the eating (never generic "we need
//      to talk") when witnessed cannibalism is on the books.
//   T2 justiceRespond('pay'): refused with {refused:'cannibalism'} — the food
//      stays in the pack, the confrontation stays open.
//   T3 sentenceCase: charge=cannibalism + norm 'exile' → resolution 'exile'
//      even with a friendly belief ledger (avg ≥ −5), never weregild.
//   T4 seedAccuserStory: the accuser's story for cannibalism names the eating,
//      never the "wronged the village" fallback.
// Seeds: 7, 42, 99 (crisis-proof convention). Exit 0 iff all assertions hold.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = [7, 42, 99];
const E = (s) => console.error(s);
let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; E(`  PASS ${label}`); }
  else { fail++; E(`  FAIL ${label}`); }
}

async function runSeed(seed) {
  E(`## seed ${seed}`);
  const { Game } = await loadGame({ seed, mode: 'crisis-moot-proof', fullTelemetry: false });
  await setupGame(Game);
  const sayBuf = [];
  const _say = Game.say;
  Game.say = function (t) { try { sayBuf.push(String(t)); } catch (e) {} return _say.apply(this, arguments); };

  // Norm sanity: the test stages a HEALTHY village.
  let norm = '?';
  try { norm = Game.cannibalNorm(); } catch (e) { norm = 'threw:' + e.message; }
  ok(norm === 'exile', `T0 healthy village (cannibalNorm=${norm})`);

  // ---- T1: confrontation names the charge ----
  try { Game.recordCrime('cannibalism', { witnessed: true }); } catch (e) { E('  recordCrime threw: ' + e.message); }
  const mark1 = sayBuf.length;
  try { Game.justiceConfront(); } catch (e) { E('  justiceConfront threw: ' + e.message); }
  const confLines = sayBuf.slice(mark1).filter(l => l.startsWith('⚖'));
  const confText = confLines.join(' ');
  ok(confLines.length > 0, 'T1 confrontation said a ⚖ line');
  ok(/ate|eat/i.test(confText), `T1 confrontation names the eating (${confText.slice(0, 90)}…)`);
  ok(!/we need to talk/i.test(confText), 'T1 confrontation is not the generic fallback');

  // ---- T2: pay is refused for witnessed cannibalism ----
  const inv = Game.state.scholar.inventory || [];
  inv.push({ id: 'proof_food', name: 'Proof jerky', plantId: 'proof_jerky', foodKind: 'meat', foodState: 'smoked', edible: true, units: 10, kcalEach: 500 });
  const unitsBefore = inv.find(i => i.id === 'proof_food').units;
  let r = null;
  try { r = Game.justiceRespond('pay'); } catch (e) { E('  justiceRespond threw: ' + e.message); }
  ok(r && r.refused === 'cannibalism' && r.paid === 0 && r.enough === false,
    `T2 pay refused for cannibalism (${JSON.stringify(r)})`);
  const unitsAfter = (Game.state.scholar.inventory || []).find(i => i.id === 'proof_food');
  ok(unitsAfter && unitsAfter.units === unitsBefore, 'T2 refused food stays in the pack');
  const payLine = sayBuf.slice(mark1).join(' ');
  ok(/not for this|buy your way back/i.test(payLine), 'T2 refusal line names why');

  // ---- T3/T4: moot case on the cannibalism charge ----
  const npcs = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const accuser = npcs[0];
  let c = null;
  try { c = Game.openPlayerCase(accuser, 'cannibalism', [], false); } catch (e) { E('  openPlayerCase threw: ' + e.message); }
  ok(!!c, 'T3 case opened on cannibalism charge');
  if (c) {
    ok(c.charge === 'cannibalism', `T3 charge is cannibalism (${c.charge})`);
    // T4 first (sentenceCase resolves the case; read the story before).
    ok(/ate one of us/i.test(c.accuserStory || ''),
      `T4 accuser story names the eating (${(c.accuserStory || '').slice(0, 80)}…)`);
    ok(!/wronged the village/i.test(c.accuserStory || ''), 'T4 no "wronged the village" fallback');
    // Friendly ledger: boost belief so avg ≥ −5 (the old weregild hole: a
    // first-time cannibal the village doesn't hate yet bought weregild).
    try { Game.moveBelief(c, 40, 'test: friendly ledger'); } catch (e) { E('  moveBelief threw: ' + e.message); }
    const avg = Game.avgBelief(c);
    ok(avg >= -5, `T3 precondition: friendly ledger (avgBelief=${Math.round(avg)})`);
    try { Game.sentenceCase(c); } catch (e) { E('  sentenceCase threw: ' + e.message); }
    ok(c.resolution === 'exile', `T3 sentence is exile, not weregild (${c.resolution})`);
    const sentLines = sayBuf.slice(mark1).join(' ');
    ok(/take what you can carry/i.test(sentLines), 'T3 exile sentence spoken');
  }
  Game.say = _say;
}

async function main() {
  for (const s of SEEDS) await runSeed(s);
  E(`\n==== ${pass} pass, ${fail} fail ====`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
