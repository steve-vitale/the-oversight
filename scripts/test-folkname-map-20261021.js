#!/usr/bin/env node
// test-folkname-map-20261021.js — proof for arm sim-folkname-map
// (flesh-out loop run fleshout-20261021T0015Z, axis scale-onramp).
//
// CLOSES THE INSTRUMENT GAP: 'The Big Bastard' death cause = the
// village's own monsterDisplayName (encounters.js:139), living only in
// state.codex.monsters[mid].villageName — never in monsters.json, so
// the windowseat analyzer's static killer-wave lookup can't join it
// (evidence/2026-10-20/sim-windowseat.md metric doubts §14.2). The fix
// is INSTRUMENT-ONLY (zero src/js, zero game-logic changes): the probe
// persists the run's monsterDisplayName map per seed, and the analyzer
// joins folk-name death causes through it.
//
// PRE-REGISTRATION:
//   primary metric: the RED->GREEN fixture pair + the DET gate.
//   GO: (a) RED — with no per-seed folk-name map (the old instrument's
//       corpus shape) 'The Big Bastard' yields nameToWave null,
//       isCombatish false, class 'other:The Big Bastard', killerWave
//       null; (b) GREEN — the same death record with the recorded map
//       joins: killerMid 'gallowdeer', killerWave 1, killerVia
//       'folk-name-map', class expedition; (c) DET — paired seeds,
//       instrument-on vs instrument-off, byte-identical trajectories
//       (the map is a post-last-hash pure read).
//   horizon: 30d (naming needs codex entries; the join is structural,
//   so a short horizon proves it). seeds: 66001. policies: leadfeast,
//   belongfeast (the windowseat substrate pair).
//   NO-GO: any RED fixture passing, any GREEN fixture failing, any
//   DET pair diverging, or the corpus missing the folkNameMap field.
//
// METRIC REVIEW: n/a at write time — filled after the run.
//
// Usage (READ THIS — the 2026-10-20 env-trap lesson: the probe's
// SUBSTRATE GUARD runs at require time, so the sweep env is REQUIRED
// here too):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 NODEWITNESS=1 KILLDISC=1 WINDOWSEAT=1 \
//   node scripts/test-folkname-map-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const A = require('./analyze-windowseat-20261020');
const WSI = require('./windowseat-instrument-20261020');
const P = require('./probe-windowseat-20261020'); // substrate guard: env required

let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log(`  PASS ${name}`); }
  catch (e) { fail++; console.log(`  FAIL ${name}: ${e.message}`); }
}

const NS = A.nameSet();
const FOLK = 'The Big Bastard'; // gallowdeer's (Highbeam Deer) village name in run leadfeast-66001

// The synthetic death record shape the probe writes into the per-seed
// corpus (withFolk = with the new instrument's per-seed map).
function rec(withFolk) {
  return {
    fightStarts: [{ day: 55, mid: 'hushwolf', wave: 1, via: 'combat_start' }],
    folkNameMap: withFolk
      ? [{ mid: 'gallowdeer', folkName: FOLK, display: FOLK }]
      : null, // the old instrument's corpus shape: no map at all
    deathsAttributed: {
      attributed: [{ who: 'v1', day: 60, cause: FOLK, wave: null, ctx: {} }],
      unverifiable: [], phantomCount: 0, causeSpace: {},
    },
  };
}

console.log('== RED: folk-name death cause cannot join with the old instrument ==');
t('RED: static lookup misses the folk name', () => {
  assert.strictEqual(A.nameToWave(FOLK), null, 'static lookup must not know a village-authored name');
});
t('RED: folk-name cause is not combatish statically', () => {
  assert.strictEqual(A.isCombatish(FOLK, NS), false, 'static name set has no folk names');
});
t('RED: folk-name death classifies other:<cause> (unjoined)', () => {
  const d = { who: 'v1', day: 60, cause: FOLK, ctx: {} };
  assert.deepStrictEqual(A.classifyWall(d, new Set(), NS), ['other:' + FOLK, 'cause-named']);
});
t('RED: joinKillerWave leaves killerWave null without the map', () => {
  const ds = A.joinKillerWave(rec(false));
  assert.strictEqual(ds[0].killerWave, null);
  assert.strictEqual(ds[0].killerMid, null);
  assert.strictEqual(ds[0].killerVia, null);
});

console.log('== GREEN: the recorded per-seed map closes the gap ==');
t('GREEN: buildFolkMaps indexes the recorded map', () => {
  const fm = A.buildFolkMaps(rec(true));
  assert.ok(fm.set.has('the big bastard'), 'folk set must contain the lowercased folk name');
  assert.strictEqual(fm.mid.get('the big bastard'), 'gallowdeer');
});
t('GREEN: folkToMidWave resolves mid + wave (gallowdeer = wave 1)', () => {
  const fm = A.buildFolkMaps(rec(true));
  assert.deepStrictEqual(A.folkToMidWave(fm, FOLK), { mid: 'gallowdeer', wave: 1 });
});
t('GREEN: folk-name cause is combatish via the map', () => {
  const fm = A.buildFolkMaps(rec(true));
  assert.strictEqual(A.isCombatish(FOLK, NS, fm.set), true);
});
t('GREEN: folk-name death classifies expedition (combat in the field)', () => {
  const fm = A.buildFolkMaps(rec(true));
  const d = { who: 'v1', day: 60, cause: FOLK, ctx: {} };
  assert.deepStrictEqual(A.classifyWall(d, new Set(), NS, fm.set), ['expedition', 'field-combat']);
});
t('GREEN: joinKillerWave joins folk-name causes to the killer-wave map', () => {
  const ds = A.joinKillerWave(rec(true));
  assert.strictEqual(ds[0].killerWave, 1);
  assert.strictEqual(ds[0].killerMid, 'gallowdeer');
  assert.strictEqual(ds[0].killerVia, 'folk-name-map');
});
t('GREEN: folk map takes precedence over a coinciding static name', () => {
  // A village can name a monster after a static roster name; the cause
  // string is then the RUN's truth, not the static roster's.
  const r = rec(true);
  r.folkNameMap = [{ mid: 'gallowdeer', folkName: 'Static', display: 'Static' }];
  r.deathsAttributed.attributed = [{ who: 'v1', day: 60, cause: 'Static', wave: null, ctx: {} }];
  const ds = A.joinKillerWave(r);
  assert.strictEqual(ds[0].killerMid, 'gallowdeer', 'folk map must beat static lookup');
  assert.strictEqual(ds[0].killerWave, 1);
  assert.strictEqual(ds[0].killerVia, 'folk-name-map');
});
t('GREEN: old-corpus recs (no map) behave exactly as before', () => {
  const r = rec(false);
  r.deathsAttributed.attributed.push({ who: 'v2', day: 61, cause: 'combat', wave: null, ctx: {} });
  const a = A.attribute(r);
  const byWho = {};
  for (const d of a.otherDeaths) byWho[d.who] = d.wclass;
  assert.strictEqual(byWho.v1, 'other:' + FOLK);
  assert.strictEqual(byWho.v2, 'expedition');
  assert.strictEqual(a.unexplainedCount, 0);
});

console.log('== UNIT: folkNameMap(Game) — the instrument read ==');
function mockGame(codex, withDisplay) {
  return {
    state: { codex: { monsters: codex } },
    data: { monsters: [] },
    monsterDisplayName: withDisplay === false ? undefined : (mid) => {
      const e = (codex || {})[mid] || {};
      return e.villageName || 'something moving';
    },
  };
}
t('UNIT: extracts mid -> folkName + display from codex', () => {
  const G = mockGame({
    gallowdeer: { stage: 'encountered', villageName: 'The Big Bastard', namingKicked: true },
    belltoad: { stage: 'encountered' },
  });
  const m = WSI.folkNameMap(G);
  assert.strictEqual(m.length, 2);
  assert.deepStrictEqual(m[0], { mid: 'belltoad', folkName: null, display: 'something moving' });
  assert.deepStrictEqual(m[1], { mid: 'gallowdeer', folkName: 'The Big Bastard', display: 'The Big Bastard' });
});
t('UNIT: skips entries never encountered or named; skips junk', () => {
  const G = mockGame({ fresh: {}, junk: 'not-an-object' });
  assert.deepStrictEqual(WSI.folkNameMap(G), []);
});
t('UNIT: null/empty codex -> [], never throws', () => {
  assert.deepStrictEqual(WSI.folkNameMap({ state: {}, data: {} }), []);
  assert.deepStrictEqual(WSI.folkNameMap({ state: { codex: null }, data: null }, null), []);
  assert.deepStrictEqual(WSI.folkNameMap(null), []);
});
t('UNIT: missing monsterDisplayName -> display null (still returns folkName)', () => {
  const G = mockGame({ gallowdeer: { stage: 'encountered', villageName: 'The Big Bastard' } }, false);
  const m = WSI.folkNameMap(G);
  assert.strictEqual(m.length, 1);
  assert.strictEqual(m[0].folkName, 'The Big Bastard');
  assert.strictEqual(m[0].display, null);
});
t('UNIT: never throws on hostile shapes', () => {
  const G = { get state() { throw new Error('boom'); } };
  assert.deepStrictEqual(WSI.folkNameMap(G), []);
});

console.log('== PERSISTENCE + DET: the real instrument on a real run ==');
(async () => {
  // PERSISTENCE: the probe persists the map alongside the per-seed
  // corpus (noWrite: never touches the repo), and the analyzer reads it
  // back from that exact serialized shape (round-trip through /tmp).
  for (const policyId of ['leadfeast', 'belongfeast']) {
    const out = await P.runOne(66001, policyId, { noWrite: true, days: 30 });
    assert.ok(out.gameDays > 0, `${policyId} drove 0 days`);
    assert.ok(Array.isArray(out.folkNameMap), `${policyId}: corpus must carry folkNameMap`);
    const named = out.folkNameMap.filter(r => r.folkName);
    console.log(`  PERSIST ${policyId} s66001: ${out.gameDays}d, codex entries=${out.folkNameMap.length}, folk-named=${named.length}${named.length ? ` (e.g. ${named[0].folkName} -> ${named[0].mid})` : ''}`);
    const tmp = path.join('/tmp', `folkname-roundtrip-${policyId}.json`);
    fs.writeFileSync(tmp, JSON.stringify(out));
    const back = JSON.parse(fs.readFileSync(tmp, 'utf8'));
    assert.ok(Array.isArray(back.folkNameMap), `${policyId}: round-trip must preserve folkNameMap`);
    A.joinKillerWave(back); // must not throw on the real corpus shape
    fs.unlinkSync(tmp);
    pass++;
  }
  // DET: instrument-on vs instrument-off byte-identical trajectories
  // (the folk-name map is a pure post-last-hash read — it cannot
  // perturb the sim).
  let ok = true;
  for (const policyId of ['leadfeast', 'belongfeast']) {
    process.env.WSEAT_BARE = '1';
    const b1 = await P.runOne(66001, policyId, { noWrite: true, days: 30 });
    const b2 = await P.runOne(66001, policyId, { noWrite: true, days: 30 });
    delete process.env.WSEAT_BARE;
    const c1 = await P.runOne(66001, policyId, { noWrite: true, days: 30 });
    const c2 = await P.runOne(66001, policyId, { noWrite: true, days: 30 });
    const hb1 = b1.hashes.join('|'), hb2 = b2.hashes.join('|');
    const hc1 = c1.hashes.join('|'), hc2 = c2.hashes.join('|');
    const p = hb1 === hb2 && hc1 === hc2 && hb1 === hc1;
    console.log(`  DET s66001 ${policyId}: ${p ? 'PASS' : 'FAIL'} (bare-stable=${hb1 === hb2} census-stable=${hc1 === hc2} identical=${hb1 === hc1}, ${b1.hashes.length} days)`);
    if (p) pass++; else { fail++; ok = false; }
  }
  console.log(ok ? 'DET: ALL PASS' : 'DET: FAILURES — instrument perturbs the trajectory');
  console.log(`\nPROOF: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF FATAL:', e && e.message); process.exit(2); });
