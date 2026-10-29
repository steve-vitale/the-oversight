#!/usr/bin/env node
// scripts/test-tilejoin-a-fixtures.js — pure-function fixtures for the
// tilejoin prototype (no sim, no Game load). Proves: tile-only
// selection (never a roster/crew feed), trust order, cap 2, fighter
// exclusion, dead/unknown exclusion, gate matrix, opts cloning.
// Exits 0 only when every check passes; prints FIXTURES-PASS/FAIL.
'use strict';
const { selectTileMates, shouldFeed, buildFedOpts } = require('./policies/tilejoin-diag');

let checks = 0, fails = 0;
function check(name, cond, detail) {
  checks++;
  if (!cond) { fails++; console.log(`FAIL ${name} ${detail || ''}`); }
}

function fakeGame(opts) {
  const o = opts || {};
  return {
    villagerId: 'scholar1',
    state: { village: {
      roster: o.roster || [],
      nodePos: o.nodePos || {},
      trust: o.trust || {},
    } },
    _coDepart: o.coDepart || {},
    getPerson: (vid) => (o.dead || {})[vid],
    vpOf: (vid) => (o.dead || {})[vid],
  };
}
// dead map entries: {dead: true/false} or undefined (unknown).

// 1. Tile-only: only nodePos == monster tile; others never fed even
//    if trusted, even if "crew-like". (Dead-status note: fakeGame's
//    getPerson/vpOf return {dead:false} entries here, so all tile
//    mates resolve to known-alive.)
{
  const G = fakeGame({
    roster: ['f1', 'a', 'b', 'c'],
    nodePos: { f1: { nx: 3, ny: 3 }, a: { nx: 3, ny: 3 }, b: { nx: 4, ny: 3 }, c: { nx: 3, ny: 3 } },
    trust: { a: 50, b: 99, c: 10 },
    dead: { a: { dead: false }, b: { dead: false }, c: { dead: false } },
  });
  const sel = selectTileMates(G, 'f1', { tx: 3, ty: 3 });
  check('tile-only', sel.fed.map(f => f.vid).join(',') === 'a,c', JSON.stringify(sel.fed));
  check('tile-all-excludes-offtile', sel.tileAll.map(f => f.vid).join(',') === 'a,c', JSON.stringify(sel.tileAll));
}
// 2. Trust order desc, cap 2 (engine slices to 2 anyway).
{
  const G = fakeGame({
    roster: ['f1', 'a', 'b', 'c', 'd'],
    nodePos: { f1: { nx: 0, ny: 0 }, a: { nx: 0, ny: 0 }, b: { nx: 0, ny: 0 }, c: { nx: 0, ny: 0 }, d: { nx: 0, ny: 0 } },
    trust: { a: 10, b: 90, c: 50, d: 70 },
    dead: { a: { dead: false }, b: { dead: false }, c: { dead: false }, d: { dead: false } },
  });
  const sel = selectTileMates(G, 'f1', { tx: 0, ty: 0 });
  check('trust-order-cap2', sel.fed.map(f => f.vid).join(',') === 'b,d', JSON.stringify(sel.fed));
  check('tile-all-all4', sel.tileAll.length === 4, JSON.stringify(sel.tileAll));
}
// 3. Fighter never fed; known-dead never fed; unknown-dead IS fed
// (null is the normal living case — vp objects carry no `dead`
// property while living; 57/57 distinct null tile mates on the OFF
// band fight elsewhere in their seed).
{
  const G = fakeGame({
    roster: ['f1', 'a', 'b', 'c'],
    nodePos: { f1: { nx: 1, ny: 1 }, a: { nx: 1, ny: 1 }, b: { nx: 1, ny: 1 }, c: { nx: 1, ny: 1 } },
    trust: { a: 50, b: 50, c: 50 },
    dead: { a: { dead: true }, b: undefined, c: { dead: false } },
  });
  const sel = selectTileMates(G, 'f1', { tx: 1, ty: 1 });
  check('dead-excluded', sel.fed.map(f => f.vid).join(',') === 'b,c', JSON.stringify(sel.fed));
  check('dead-counts', sel.tileDeadKnown === 1 && sel.tileUnknownDead === 1, JSON.stringify(sel));
  // tileAll is the breakline def: deadKnown !== true only.
  check('tile-all-excludes-dead-known', sel.tileAll.map(f => f.vid).join(',') === 'b,c', JSON.stringify(sel.tileAll));
}
// 4. No tile -> empty; null tile -> empty.
{
  const G = fakeGame({ roster: ['f1', 'a'], nodePos: { f1: { nx: 0, ny: 0 }, a: { nx: 5, ny: 5 } }, dead: { a: { dead: false } } });
  check('no-tile-mates', selectTileMates(G, 'f1', { tx: 0, ty: 0 }).fed.length === 0, '');
  check('null-tile', selectTileMates(G, 'f1', null).fed.length === 0, '');
}
// 5. Stamp-partner flag is audit only (partner off-tile never fed;
//    partner on-tile flagged).
{
  const G = fakeGame({
    roster: ['f1', 'a', 'b'],
    nodePos: { f1: { nx: 2, ny: 2 }, a: { nx: 2, ny: 2 }, b: { nx: 9, ny: 9 } },
    trust: { a: 20, b: 20 },
    dead: { a: { dead: false }, b: { dead: false } },
    coDepart: { f1: { partners: ['a', 'b'] } },
  });
  const sel = selectTileMates(G, 'f1', { tx: 2, ty: 2 });
  check('stamp-flag', sel.fed.length === 1 && sel.fed[0].stampPartner === true, JSON.stringify(sel.fed));
}
// 6. Gate matrix.
{
  const base = { caller: 'resolve', inRaid: false, expedition: false, wave: 2,
    mTile: { tx: 0, ty: 0 }, isScholar: false, cornered: false,
    allyFromStart: false, origAllyVids: [], fedCount: 1 };
  check('gate-feed', shouldFeed(base).feed === true, '');
  const cases = [
    ['caller-other', { caller: 'other' }],
    ['caller-sortie', { caller: 'sortie' }],
    ['raid', { inRaid: true }],
    ['expedition', { expedition: true }],
    ['no-tile', { mTile: null }],
    ['wave-5', { wave: 5 }],
    ['wave-0', { wave: 0 }],
    ['scholar', { isScholar: true }],
    ['cornered', { cornered: true }],
    ['ally-from-start', { allyFromStart: true }],
    ['nonempty-allies', { origAllyVids: ['x'] }],
    ['no-fed-mates', { fedCount: 0 }],
  ];
  for (const [name, over] of cases) {
    const g = shouldFeed(Object.assign({}, base, over));
    check('gate-' + name, g.feed === false && !!g.skip, JSON.stringify(g));
  }
  // Waves 1..4 all feed; aid + patrol callers feed.
  for (const w of [1, 2, 3, 4]) check('gate-wave-' + w, shouldFeed(Object.assign({}, base, { wave: w })).feed === true, '');
  for (const c of ['patrol', 'aid']) check('gate-caller-' + c, shouldFeed(Object.assign({}, base, { caller: c })).feed === true, '');
}
// 7. buildFedOpts clones: original untouched, allies = fed count.
{
  const orig = { allies: 0, allyVids: [], cornered: false };
  const next = buildFedOpts(orig, ['a', 'b']);
  check('fed-opts', next.allies === 2 && next.allyVids.join(',') === 'a,b' && next.cornered === false, JSON.stringify(next));
  check('orig-untouched', orig.allies === 0 && orig.allyVids.length === 0, JSON.stringify(orig));
  check('fed-opts-undefined', buildFedOpts(undefined, ['a']).allies === 1, '');
  check('fed-opts-null', buildFedOpts(null, []).allies === 0, '');
}

console.log(`FIXTURES: ${checks - fails}/${checks} checks pass`);
console.log(fails === 0 ? 'FIXTURES-PASS' : 'FIXTURES-FAIL');
if (fails) process.exit(1);
