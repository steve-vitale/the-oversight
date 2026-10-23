// test-linkdissolve.js — proof for the linkdissolve instrument
// (flesh-out loop arm sim-linkdissolve, axis scale-onramp, backlog #853).
// Namespace linkdissolve-*. Proves:
//   1. snapshotLinks reads the REAL engine (sim-harness live game, seeded):
//      well-formed rows on a fresh game (0 links), scalar fields present.
//   2. classifyDissolutionEvent names the channel correctly on synthetic
//      fixtures: a trust-decay dissolution, a break (succession), a
//      succession-chaos dissolution, and a tribute-arrears dissolution each
//      classify exactly; a no-event control produces no event.
//   3. det-gate convention: identical input -> byte-identical output
//      (classifier run twice over every fixture).
// Exits non-zero on any failure. Writes nothing into the repo.
'use strict';
const path = require('path');
const assert = require('assert');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { snapshotLinks } = require(path.join(REPO, 'scripts', 'diag-linkdissolve'));
const { ownBar, classifyDissolutionEvent, analyzeSeed } = require(path.join(REPO, 'scripts', 'linkdissolve-analyze'));

let pass = 0;
function ok(name, cond, detail) {
  if (!cond) { console.error('FAIL:', name, detail || ''); process.exitCode = 1; return; }
  pass++;
  console.log('ok:', name);
}

// ---- fixture builders (census days-object shape) ----
function subLink(other, trust, extra) {
  return Object.assign({
    id: 'link-' + other, other, ovName: 'Village ' + other, kind: 'subordinate', role: 'primary',
    trust, status: 'active', formedDay: 50, conquered: false,
    arrears: 0, tributeWk: 4000, histN: 0,
  }, extra || {});
}
function dayRow(links, dipLinks, histByLink) {
  // histByLink: {other: [{d,k,n}, ...]} — histTail on the last day only
  const rows = links.map(l => {
    const r = Object.assign({}, l);
    const h = (histByLink || {})[l.other];
    if (h) { r.histTail = h; r.histN = h.length; }
    return r;
  });
  return { links: rows, dip: dipLinks * 34, dipLinks, rank: dipLinks ? 'national' : 'village', nationalLive: !!dipLinks };
}

// ---- 1. live-engine smoke ----
async function smoke() {
  const { Game } = await loadGame({ seed: 424242, mode: 'linkdissolve-test', fullTelemetry: false });
  await setupGame(Game);
  const s = snapshotLinks(Game, { prevHistN: {} });
  ok('smoke: snapshot returns object', s && typeof s === 'object');
  ok('smoke: links array', Array.isArray(s.links), JSON.stringify(s).slice(0, 200));
  ok('smoke: dipLinks is a number', typeof s.dipLinks === 'number', String(s.dipLinks));
  ok('smoke: fresh game has no links', s.links.length === 0, String(s.links.length));
  ok('smoke: ownBar rejects fresh/young', ownBar(subLink('v9', 60, { formedDay: 5 }), 10) === false);
  ok('smoke: ownBar accepts seasoned 40+', ownBar(subLink('v9', 40, { formedDay: 0 }), 31) === true);
  ok('smoke: ownBar rejects trust<40', ownBar(subLink('v9', 39, { formedDay: 0 }), 31) === false);
  ok('smoke: ownBar rejects broken', ownBar(subLink('v9', 60, { formedDay: 0, status: 'broken' }), 31) === false);
  ok('smoke: conquered needs season only', ownBar(subLink('v9', 15, { formedDay: 0, conquered: true }), 31) === true);
}

// ---- 2. classification fixtures ----
const fixtures = [];
function fixture(name, days, D, want) { fixtures.push({ name, days, D, want }); }

// trust-decay: link v2 trust 45->38 on D=91, still active, no break, no chaos.
fixtures.push({
  name: 'trust-decay', D: 91, want: 'trust-decay',
  days: {
    90: dayRow([subLink('v1', 46), subLink('v2', 45), subLink('v3', 44)], 3),
    91: dayRow([subLink('v1', 47), subLink('v2', 38), subLink('v3', 45)], 0),
  },
});
// break (succession): v2 broken with the named how.
fixtures.push({
  name: 'break-succession', D: 91, want: 'break (succession)',
  days: {
    90: dayRow([subLink('v1', 46), subLink('v2', 45), subLink('v3', 44)], 3),
    91: dayRow([subLink('v1', 47), subLink('v2', 37, { status: 'broken' }), subLink('v3', 45)], 0,
      { v2: [{ d: 91, k: 'broken', n: 'Link broken (succession).' }] }),
  },
});
// succession chaos: funeral-hour notes + haircut, link holds.
fixtures.push({
  name: 'succession', D: 91, want: 'succession',
  days: {
    90: dayRow([subLink('v1', 46), subLink('v2', 44, { arrears: 2000 }), subLink('v3', 44)], 3),
    91: dayRow([subLink('v1', 47), subLink('v2', 37, { arrears: 9000 }), subLink('v3', 45)], 0,
      { v2: [{ d: 90, k: 'succession', n: 'Their speaker died; Haven renegotiated in the chaos. Tribute pressed up.' }] }),
  },
});
// tribute-arrears: arrears notes x3 in 21d, arrears spike coupled to the crossing.
fixtures.push({
  name: 'tribute-arrears', D: 91, want: 'tribute-arrears',
  days: {
    84: dayRow([subLink('v1', 46), subLink('v2', 41, { arrears: 2000 }), subLink('v3', 44)], 3),
    90: dayRow([subLink('v1', 46), subLink('v2', 41, { arrears: 2000 }), subLink('v3', 44)], 3,
      { v2: [
        { d: 71, k: 'arrears', n: 'Tribute short 1000/4000 kcal. Arrears 1000 kcal.' },
        { d: 78, k: 'arrears', n: 'Tribute short 1000/4000 kcal. Arrears 2000 kcal.' },
        { d: 85, k: 'arrears', n: 'Tribute short 6000/4000 kcal. Arrears 8000 kcal.' },
      ] }),
    91: dayRow([subLink('v1', 47), subLink('v2', 35, { arrears: 8000 }), subLink('v3', 45)], 0),
  },
});
// succession via village-wide funeral: the flipped link's own history copy
// is absent (sparse tails), but a sibling link carries the funeral's note
// at D-1 and the flipped link took the funeral-hour haircut (-13).
fixtures.push({
  name: 'succession-funeralNear', D: 91, want: 'succession',
  days: {
    90: dayRow([subLink('v1', 50), subLink('v2', 49, { arrears: 5000 }), subLink('v3', 44)], 3,
      { v1: [{ d: 90, k: 'succession', n: 'v1 pressed tribute down in Haven\'s chaos.' }] }),
    91: dayRow([subLink('v1', 42), subLink('v2', 36, { arrears: 5000 }), subLink('v3', 45)], 0),
  },
});
fixtures.push({
  name: 'control-no-event', D: 91, want: null,
  days: {
    90: dayRow([subLink('v1', 46), subLink('v2', 45), subLink('v3', 44)], 3),
    91: dayRow([subLink('v1', 47), subLink('v2', 45), subLink('v3', 46)], 3),
  },
});

function classify() {
  for (const f of fixtures) {
    if (f.want === null) {
      const evs = analyzeSeed({ seed: 1, arm: 'test', days: f.days });
      ok(f.name + ': no dissolution detected', evs.length === 0, JSON.stringify(evs));
      continue;
    }
    const c = classifyDissolutionEvent(f.days, f.D);
    ok(f.name + ': channel=' + f.want, c.channel === f.want, 'got ' + c.channel);
    ok(f.name + ': channel is named (not other-named)', !/^other-named/.test(c.channel), c.channel);
    if (f.want !== 'break (succession)') {
      // the flipped link is the named cause (v2 in every fixture)
      ok(f.name + ': attributes link v2', c.other === 'v2', String(c.other));
    }
  }
}

// ---- 3. det-gate: identical input -> identical output ----
function detGate() {
  for (const f of fixtures) {
    if (f.want === null) continue;
    const a = JSON.stringify(classifyDissolutionEvent(f.days, f.D));
    const b = JSON.stringify(classifyDissolutionEvent(f.days, f.D));
    ok(f.name + ': deterministic', a === b);
  }
}

(async () => {
  await smoke();
  classify();
  detGate();
  console.log(`\ntest-linkdissolve: ${pass} checks passed`);
})().catch(e => { console.error('HARNESS ERROR:', e && e.stack || e); process.exit(1); });
