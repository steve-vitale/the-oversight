#!/usr/bin/env node
// Proof for the r28 governance instrument: extracts the driver's govClass
// classifier (regexes + function, verbatim from the driver source) and runs
// real engine lines (copied from hierarchy.js / game.js) through it.
// Proves the CLASSIFIER, not the engine: the main r28 run is the end-to-end
// proof that the classes fire in the wild. Deterministic, no sim, no writes.
'use strict';
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'journey-scale-r28-20261024.js'), 'utf8');
const start = src.indexOf('const GOV_RX');
const fnStart = src.indexOf('function govClass');
if (start < 0 || fnStart < 0) { console.error('FAIL: classifier block not found in driver'); process.exit(1); }
const fnEnd = src.indexOf('\n}\n', fnStart);
if (fnEnd < 0) { console.error('FAIL: govClass end not found'); process.exit(1); }
const block = src.slice(start, fnEnd + 3);
// eslint-disable-next-line no-new-func
const govClass = new Function(`${block}; return govClass;`)();
const cases = [
  ['◈ SYSTEM: "Four fires. One head. GOVERNANCE LAYER: online — polity tribute routing, the court calendar, famine reserves. You built a realm. Try not to lose it the way you found it."', 'govAnnounce'],
  ['🌾 Tribute from Red Creek arrives — 5,000 kcal of grain into the pantry. Their fields, our fire.', 'tribArrive'],
  ['🌾 Red Creek\'s tribute arrives light — half the grain "lost on the road." Nobody believes it. Sabotage wears a thin mask. (Arrears +2,000 kcal.)', 'tribShort'],
  ['🍲 The shared granary opens: 5,000 kcal for every fire of the realm, no strings.', 'feastCourt'],
  ['🌾 The pantry stands empty — and the league granary opens, as the covenant promised. Famine relief, not a feast.', 'granaryDraw'],
  ['Three fires bow to Haven. But a realm isn\'t leverage — it\'s seasons. These bonds are young; tend them, keep the trust, and the court will come.', 'courtLine'],
  ['The village eats well today.', null],
];
let fails = 0;
for (const [line, want] of cases) {
  const got = govClass(line);
  const ok = got === want;
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'} want=${want} got=${got} :: ${line.slice(0, 80)}`);
}
if (fails) { console.error(`${fails} classifier case(s) failed`); process.exit(1); }
console.log('ALL GREEN: r28 govClass classifier 7/7');
