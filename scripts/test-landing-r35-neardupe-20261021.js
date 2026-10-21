#!/usr/bin/env node
// Proof test: R35 near-dupe detector refinement (r34 metric-review queue).
// RED: the r34 (old) detector flags a resume opener that QUOTES the previous
// sitting's true close as a near-dupe of that close — the probe-101-day12
// STRICT MISS: honest mechanism (resume quote + legitimate re-fired gratitude
// line), not a defect. GREEN: the r35 detector excludes quote-explained pairs
// while still flagging genuine wrapper-hidden repeats.
// Mirrors scripts/journey-landing-r35-20261021.js's detector exactly
// (normCore + pair loop; the driver's pair source is themT).
'use strict';
const normCore = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// OLD (r34): exact copy of the r34 detector logic.
function oldDetect(themT) {
  const pairs = themT.map(t => ({ line: t, core: normCore(t) })).filter(p => p.core.length >= 40);
  const out = [];
  for (let i = 0; i < pairs.length; i++)
    for (let j = i + 1; j < pairs.length; j++) {
      if (pairs[i].core === pairs[j].core) continue;
      if (pairs[i].core.indexOf(pairs[j].core) !== -1 || pairs[j].core.indexOf(pairs[i].core) !== -1)
        out.push([i, j]);
    }
  return out;
}

// NEW (r35): quote-explained pairs excluded (>=20-char quoted segment of one
// line contained in the other's core).
const QUOTE_FLOOR = 20;
const quoteSegs = (line) => (String(line || '').match(/"[^"]*"/g) || [])
  .map(q => normCore(q)).filter(s => s.length >= QUOTE_FLOOR);
const quoteExplained = (a, b) =>
  a.quotes.some(q => b.core.indexOf(q) !== -1) ||
  b.quotes.some(q => a.core.indexOf(q) !== -1);
function newDetect(themT) {
  const pairs = themT.map(t => ({ line: t, core: normCore(t), quotes: quoteSegs(t) }))
    .filter(p => p.core.length >= 40);
  const out = [];
  for (let i = 0; i < pairs.length; i++)
    for (let j = i + 1; j < pairs.length; j++) {
      if (pairs[i].core === pairs[j].core) continue;
      if (quoteExplained(pairs[i], pairs[j])) continue;
      if (pairs[i].core.indexOf(pairs[j].core) !== -1 || pairs[j].core.indexOf(pairs[i].core) !== -1)
        out.push([i, j]);
    }
  return out;
}

let pass = 0, fail = 0;
const T = (name, cond) => { if (cond) { pass++; } else { fail++; console.log('FAIL:', name); } };

// Case 1 — the r34 STRICT MISS shape: previous close + resume opener quoting
// it + legitimately re-fired gratitude line.
const close = "You kept your word. That meant everything to me, truly.";
const resumeOpener = 'Last we spoke you told me "You kept your word. That meant everything to me, truly." So here we are again, friend.';
const refire = "You kept your word. That meant everything to me, truly.";
const honest = [close, "The river is high today, mind the crossing.", resumeOpener, "We should mend the nets before dusk.", refire];
T('RED: old detector flags the honest quote pair', oldDetect(honest).length >= 1);
T('GREEN: new detector does NOT flag the honest quote pair', newDetect(honest).length === 0);

// Case 2 — genuine wrapper-hidden repeat (r16's voiceLine case): still caught.
const genuine = [
  "You know what \u2014 I need your help with the pantry stores right now",
  "The deer came closer than I have ever seen one come before",
  "I need your help with the pantry stores right now",
];
T('genuine dupe: old flags', oldDetect(genuine).length === 1);
T('genuine dupe: new still flags', newDetect(genuine).length === 1);

// Case 3 — tiny quote cannot explain a pair (guard against over-exclusion).
// B's core is a true substring of A's; B's only quote is 5 chars (<20).
const tiny = [
  "The old fence by the river needs mending before the rains come down",
  'The old "fence" by the river needs mending before the rains',
];
T('tiny quote: old flags', oldDetect(tiny).length === 1);
T('tiny quote: new still flags (quote <20 chars cannot explain)', newDetect(tiny).length === 1);

// Case 4 — unrelated lines: neither flags.
const unrelated = [
  "The harvest looks thin this season and we must ration carefully",
  "I saw a strange bird by the river at dawn",
];
T('unrelated: old quiet', oldDetect(unrelated).length === 0);
T('unrelated: new quiet', newDetect(unrelated).length === 0);

// Case 5 — quote explaining containment in the OTHER direction (the quoted
// line contains the quote of the shorter line).
const rev = [
  'He leaned in and said "we should mend the nets before dusk falls" and left',
  "We should mend the nets before dusk falls",
];
T('reverse quote: old flags', oldDetect(rev).length === 1);
T('reverse quote: new excludes', newDetect(rev).length === 0);

// Case 6 — lines under the 40-char floor are never compared (r33 standard).
const short = ['"quoted"', 'quoted'];
T('short lines: both quiet', oldDetect(short).length === 0 && newDetect(short).length === 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
