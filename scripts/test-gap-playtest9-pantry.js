#!/usr/bin/env node
'use strict';
// Gap-playtest9 leg (d) PROOF: pantry-days display must be self-consistent.
// Diagnosis: the days figure and the mouths-need figure were both honest
// but measured DIFFERENT burns — days from the measured NET pantry draw
// (outflow minus village inflows, 7-day average), need from the GROSS
// daily requirement. A reader dividing pantry by gross need got ~2 days
// next to a printed "about 7 days". The fix: the panel now prints the
// measured net draw beside both figures, so days x net draw ~= pantry.
// This script proves the engine side (days and burn share one helper) on
// synthetic fixtures, and that the panel source prints the shared burn.
// Run: node scripts/test-gap-playtest9-pantry.js [seed]
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const seed = Number(process.argv[2] || 42);
let failures = 0;
function note(ok, label, extra) {
  console.log((ok ? 'PASS ' : 'FAIL ') + label + (extra !== undefined ? ' :: ' + extra : ''));
  if (!ok) failures++;
}
async function main() {
const { Game: G, loadFails } = await loadGame({ seed, narration: true });
if (loadFails.length) { console.log('LOAD FAILS', loadFails); process.exit(2); }
await setupGame(G);
const fullStatus = (typeof G._fullStatus === 'function') ? () => G._fullStatus() : () => G.status();
function setPantry(kcal) {
  G.state.village.pantry = [{ id: 'proof-meal', name: 'proof meal', kcalEach: kcal, units: 1, kind: 'food' }];
}
const pop = ((G.state.village.roster || []).length) || 12;
// Case 1: playtest-like numbers — 44,400 kcal, measured net draw 6,340/day.
setPantry(44400);
G.state.village.burnHistory = [6340, 6340, 6340];
let st = fullStatus();
console.log('case1: pantryKcal =', st.pantryKcal, '| pantryDays =', st.pantryDays, '| pantryNetBurn =', st.pantryNetBurn);
note(st.pantryDays === 7, 'case1: days = floor(44400/6340) = 7', 'days=' + st.pantryDays);
note(st.pantryNetBurn === 6340, 'case1: status exposes the measured net burn', 'burn=' + st.pantryNetBurn);
note(st.pantryDays * st.pantryNetBurn <= st.pantryKcal &&
  st.pantryKcal - st.pantryDays * st.pantryNetBurn < st.pantryNetBurn,
  'case1: days x net draw reconciles with the pantry (remainder < one day of draw)',
  `7x6340=44380, pantry 44400, remainder ${st.pantryKcal - st.pantryDays * st.pantryNetBurn}`);
// Case 2: village covers itself — measured draw zero or less.
G.state.village.burnHistory = [0, 0, -5];
st = fullStatus();
note(st.pantryDays === 999 && st.pantryNetBurn === null,
  'case2: zero/negative measured draw -> days 999, no burn printed', `days=${st.pantryDays} burn=${st.pantryNetBurn}`);
// Case 3: no history yet — worst-case fallback, unchanged, no burn printed.
G.state.village.burnHistory = [];
st = fullStatus();
const expectFallback = Math.floor(44400 / Math.max(1, pop * 2000));
note(st.pantryDays === expectFallback && st.pantryNetBurn === null,
  'case3: pre-history fallback unchanged, no burn printed', `days=${st.pantryDays} expected=${expectFallback} pop=${pop}`);
// Case 4: engine refactor preserved pantryDaysEstimate outputs exactly.
setPantry(100000);
G.state.village.burnHistory = [5000, 9000, 7000, 6000]; // mean 6750
st = fullStatus();
note(st.pantryDays === Math.floor(100000 / 6750) && st.pantryNetBurn === 6750,
  'case4: days and burn share one mean (no drift)', `days=${st.pantryDays} burn=${st.pantryNetBurn}`);
// Case 5: panel source prints the shared burn in both lines.
const appJs = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'app.js'), 'utf8');
note(/at a net draw of \$\{st\.pantryNetBurn\.toLocaleString\(\)\}\/day/.test(appJs),
  'case5: panel days line prints the net draw');
note(/pantry net draw \$\{st\.pantryNetBurn\.toLocaleString\(\)\}\/day \(7-day average\)/.test(appJs),
  'case5: panel mouths line prints the same net draw (7-day average)');
note(/shortfall \$\{net\.toLocaleString\(\)\}\/day/.test(appJs),
  'case5: gross shortfall wording kept only as the pre-history fallback');
console.log(failures ? `PANTRY PROOF: ${failures} failing check(s)` : 'PANTRY PROOF: all checks pass');
process.exit(failures ? 1 : 0);
}
main().catch(e => { console.error('PANTRY PROOF CRASH:', e); process.exit(1); });
