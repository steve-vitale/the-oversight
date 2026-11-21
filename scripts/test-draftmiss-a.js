// test-draftmiss-a.js — proof test for arm sim-draftmiss-a.
// Proves the draft-miss classification BEFORE any judged sim:
// (1) the analyzer's selftest is green (old corpus shapes + the new
//     launch-level draftMissStats / judgeDraftmiss shapes);
// (2) the reproduction gate holds on the committed corpus (64
//     poolDraftMiss rows -> 21 distinct pairs, exactly as the
//     presence counter records);
// (3) the full classification runs and the reported counts match
//     the pinned values in the evidence file
//     (evidence/2026-11-20/sim-draftmiss-a.md);
// (4) draftMissMoment evaluates the launch the draft would see —
//     every frozen cause (no-living-holder / sheltered-holder /
//     post-flee-resting / low-health / on-tile /
//     adjacent-but-unreachable / adjacent-eligible / out-of-earshot /
//     stale-pre-tick-read / raid), the would-fire bound, the
//     tick-stale overlay (flips the cause, keeps the underlying
//     one), and the out-of-scope nulls (wave 1, loaded lead) —
//     staged through the REAL verbs/methods (shelterVillagers,
//     markPostFleeRest, agencyState().exped, village.away,
//     npcSetNode/npcSetInside), with 0 draws and pure reads
//     (nothing moved);
// (5) the analyzer CLI --selftest passes as a subprocess.
// Pure reads + corpus reads — no game code, no new sims.
// Encounter-gear fixture throughout: a geared villager fighter
// with a party, never a fresh un-geared solo scholar.
//
// Usage: node scripts/test-draftmiss-a.js
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const analyze = require('./analyze-draftmiss-a.js');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { ammoCountOf, rangedKitOf, nearMissMoment, draftMissMoment } = require('./draftmiss-driver-a');
const REPO = path.join(__dirname, '..');

const ARM = path.join(__dirname, '..', 'evidence', '2026-11-20', 'perseed-presence-a-arm');
const CTL = path.join(__dirname, '..', 'evidence', '2026-11-20', 'perseed-presence-a-ctl');

// Pinned from the classifying run (evidence/2026-11-20/sim-draftmiss-a.md).
// Filled in by the evidence commit; the test fails loudly if the instrument
// ever reproduces different numbers.
const PINNED = {
  rows: 64, pairs: 21, fights: 25,
  counts: { a: 2, b: 0, c: 0, d: 0, e: 7, f: 12 },
  verdict: 'NO-GO'
};

let failures = 0;
function check(name, cond, extra) {
  if (cond) console.log('ok: ' + name);
  else { failures++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

function runCorpus() {
  // 1. The analyzer's own selftest (every class fires on a fixture).
  const st = analyze.selftest();
  check('analyzer --selftest green', st === true, 'selftest returned false');

  // 2. Reproduction gate on the committed corpus.
  const docs = analyze.loadDir(ARM);
  check('arm corpus loads 8 seeds', docs.length === 8, 'got ' + docs.length);
  const rep = analyze.reproduceMiss(docs);
  check('reproduction: 64 poolDraftMiss rows', rep.missRows.length === 64, 'got ' + rep.missRows.length);
  check('reproduction: 21 distinct pairs', rep.pairs.length === 21, 'got ' + rep.pairs.length);

  // 3. Full classification runs and is structurally sound.
  const result = analyze.analyze(ARM, CTL);
  check('analysis verdict present', result.verdict === 'GO' || result.verdict === 'NO-GO', 'got ' + result.verdict);
  const total = Object.keys(result.counts).reduce(function (s, k) { return s + result.counts[k]; }, 0);
  check('counts sum to 21 pairs', total === 21, 'got ' + total);
  check('every pair has a class a-f', result.pairs.every(function (p) { return 'abcdef'.indexOf(p.cls) !== -1; }), '');
  check('every pair has a reason', result.pairs.every(function (p) { return typeof p.reason === 'string' && p.reason.length > 0; }), '');
  check('overcount rows = 64', result.overcount.rows === 64, 'got ' + result.overcount.rows);
  check('overcount pairs = 21', result.overcount.pairs === 21, 'got ' + result.overcount.pairs);
  check('overcount fights > 0', result.overcount.fights > 0, 'got ' + result.overcount.fights);
  check('no real miss is hidden (realMiss list matches f-with-realMiss)',
    result.realMiss.length === result.pairs.filter(function (p) { return p.realMiss; }).length, '');

  // 4. Pinned values (filled by the evidence commit once the classifying
  // run has produced them). Skipped while unpinned (fights === 0).
  if (PINNED.fights > 0) {
    check('pinned: fights', result.overcount.fights === PINNED.fights, 'got ' + result.overcount.fights + ', pinned ' + PINNED.fights);
    check('pinned: counts', JSON.stringify(result.counts) === JSON.stringify(PINNED.counts),
      'got ' + JSON.stringify(result.counts) + ', pinned ' + JSON.stringify(PINNED.counts));
    check('pinned: verdict', result.verdict === PINNED.verdict, 'got ' + result.verdict + ', pinned ' + PINNED.verdict);
    check('pinned: 0 UNCLASSIFIED when GO', PINNED.verdict !== 'GO' || result.counts.f === 0, 'f=' + result.counts.f);
  } else {
    console.log('note: pinned counts not yet filled (fights === 0) — fill from the classifying run before the evidence commit');
  }
}

// ---- live draftMissMoment fixtures (same harness pattern as
// test-lendpool-a.js: one fresh game per fixture, lead bow + holder
// searcaster + 2 cells, two more roster villagers on the tile) ----
function personOf(Game, vid) {
  try { if (Game.getPerson) { const p = Game.getPerson(vid); if (p) return p; } } catch (e) { /* person lookup is best-effort; fall through to the roster scan */ }
  return ((Game.data.villagers || []).find(x => x.id === vid) ||
    (Game.data.background_survivors || []).find(x => x.id === vid) || {});
}
function resetVillager(Game, p) {
  p.items = []; p.equipped = {}; p.stashed = [];
  try { Game.state.village.ammoCraft = Game.state.village.ammoCraft || {}; delete Game.state.village.ammoCraft[p.id]; } catch (e) { /* ammo-craft cleanup is best-effort */ }
  try { Game.state.village.arrowCraftCd = Game.state.village.arrowCraftCd || {}; delete Game.state.village.arrowCraftCd[p.id]; } catch (e) { /* cooldown cleanup is best-effort */ }
}
function withDraws(draws, fn) {
  const saved = Math.random;
  let di = 0;
  Math.random = function () { const v = draws[di % draws.length]; di++; return v; };
  try { return { out: fn(), used: di }; }
  finally { Math.random = saved; }
}
function setHp(Game, vid, hp) {
  Game.state.village.health = Game.state.village.health || {};
  if (hp === null) delete Game.state.village.health[vid];
  else Game.state.village.health[vid] = hp;
}
function havenOf(Game) {
  const v = Game.state.village || {};
  return { hx: (v.px != null ? v.px : 4), hy: (v.py != null ? v.py : 4) };
}
async function freshLaunch(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'draftmiss-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const lead = roster[0], holder = roster[1], plainB = roster[2], plainC = roster[3];
  const pLead = personOf(Game, lead), pHolder = personOf(Game, holder),
    pB = personOf(Game, plainB), pC = personOf(Game, plainC);
  const MTX = 5, MTY = 5;
  function armHolder(p, vid, cells) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
    if (cells > 0) p.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: cells, kg: 0.4 });
    Game.villagerGearUp(vid, true);
  }
  function armLeadBow(p, vid) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'crude_bow', name: 'Crude bow', units: 1, kg: 1.0 },
      { itemId: 'arrow', name: 'Arrow', units: 5, kg: 0.1 }];
    Game.villagerGearUp(vid, true);
  }
  function armLeadEmptyGun(p, vid) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
    Game.villagerGearUp(vid, true);
  }
  armLeadBow(pLead, lead);
  armHolder(pHolder, holder, 2);
  resetVillager(Game, pB); resetVillager(Game, pC);
  Game.npcSetNode(lead, MTX, MTY);
  Game.npcSetNode(holder, MTX + 1, MTY);
  Game.npcSetNode(plainB, MTX, MTY);
  Game.npcSetNode(plainC, MTX, MTY);
  setHp(Game, lead, 100);
  setHp(Game, holder, 100);
  return { Game: Game, roster: roster, lead: lead, holder: holder,
    pLead: pLead, pHolder: pHolder, MTX: MTX, MTY: MTY,
    armHolder: armHolder, armLeadBow: armLeadBow, armLeadEmptyGun: armLeadEmptyGun };
}
function callDraftMiss(b, m, opts, tickRows) {
  // The driver computes near itself in the wrap; here we pass the
  // same near row the wrap would (used only for the lendable
  // cross-check) so the fixture exercises the real call shape.
  const near = nearMissMoment(b.Game, b.lead, m, opts || {});
  return withDraws([0.5], function () { return draftMissMoment(b.Game, b.lead, m, opts || {}, near, tickRows || []); });
}
function tickRow(b, m, pooled) {
  const day = ((b.Game.state || {}).scholar || {}).day || 0;
  return { seq: 1, day: day, mid: m.id, wave: 4, tx: m.tx, ty: m.ty,
    nOnTile: (pooled.onTile || []).length, onTile: pooled.onTile || [],
    adjacent: pooled.adjacent || [], holderPresent: ((pooled.onTile || []).length + (pooled.adjacent || []).length) > 0 };
}

async function runLive() {
  console.log('\n=== draftMissMoment live fixtures ===');
  const m4 = { id: 'eulogy', tx: 5, ty: 5 };
  const m1 = { id: 'mirrormoth', tx: 5, ty: 5 };
  check('draftMissMoment exported by the draftmiss driver', typeof draftMissMoment === 'function');

  // (a) no living holder anywhere: the empty-pool shape.
  let b = await freshLaunch(7);
  resetVillager(b.Game, b.pHolder);
  let r = callDraftMiss(b, m4, {}, []);
  check('draftMiss (a): no living holder -> no-living-holder, dist null, count 0, no earshot, wouldFire false, 0 draws',
    r.out && r.out.cause === 'no-living-holder' && r.out.underlyingCause === 'no-living-holder' &&
    r.out.nearestHolder === null && r.out.nearestDist === null && r.out.livingHolders === 0 &&
    r.out.anyArmedEarshot === false && r.out.anyEligibleEarshot === false &&
    r.out.lendable === false && r.out.wouldFire === false && r.out.tickStale === false && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);

  // (b) sheltered holder in earshot (Haven is adjacent to the monster tile).
  b = await freshLaunch(7);
  b.Game.shelterVillagers([b.holder], { quiet: true, reason: 'test' });
  const hv = havenOf(b.Game);
  const shelterDist = Math.max(Math.abs(hv.hx - 5), Math.abs(hv.hy - 5));
  r = callDraftMiss(b, m4, {}, []);
  check('draftMiss (b): sheltered holder in earshot -> sheltered-holder, armed yes / eligible no, wouldFire false',
    r.out && r.out.cause === 'sheltered-holder' && r.out.nearestState === 'sheltered' &&
    r.out.nearestDist === shelterDist && r.out.anyArmedEarshot === true &&
    r.out.anyEligibleEarshot === false && r.out.wouldFire === false && r.out.lendable === false && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used + ' shelterDist=' + shelterDist);

  // (c) resting holder adjacent.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 6, 5);
  b.Game.markPostFleeRest(b.holder);
  r = callDraftMiss(b, m4, {}, []);
  check('draftMiss (c): resting holder adjacent -> post-flee-resting, eligible no, wouldFire false',
    r.out && r.out.cause === 'post-flee-resting' && r.out.nearestState === 'resting' &&
    r.out.nearestDist === 1 && r.out.anyArmedEarshot === true &&
    r.out.anyEligibleEarshot === false && r.out.wouldFire === false && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);

  // (d) low-health holder adjacent.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 6, 5);
  setHp(b.Game, b.holder, 15);
  r = callDraftMiss(b, m4, {}, []);
  check('draftMiss (d): HP-15 holder adjacent -> low-health, health 15, wouldFire false',
    r.out && r.out.cause === 'low-health' && r.out.nearestState === 'low-health' &&
    r.out.nearestHealth === 15 && r.out.nearestDist === 1 &&
    r.out.anyArmedEarshot === true && r.out.anyEligibleEarshot === false && r.out.wouldFire === false && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);

  // (e) holder on the monster's tile: the would-fire shape.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 5, 5);
  r = callDraftMiss(b, m4, {}, []);
  check('draftMiss (e): holder on-tile -> on-tile, dist 0, wouldFire true, lendable true',
    r.out && r.out.cause === 'on-tile' && r.out.nearestDist === 0 &&
    r.out.wouldFire === true && r.out.lendable === true && r.out.anyEligibleEarshot === true && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);

  // (f) holder adjacent, out in the world: the would-fire shape.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 6, 5);
  r = callDraftMiss(b, m4, {}, []);
  check('draftMiss (f): holder adjacent out-in-world -> adjacent-eligible, wouldFire true, lendable true',
    r.out && r.out.cause === 'adjacent-eligible' && r.out.nearestDist === 1 &&
    r.out.nearestState === 'out-in-world' && r.out.wouldFire === true &&
    r.out.lendable === true && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);

  // (g) holder adjacent but on an expedition: the draft cannot reach
  // them even though they stand next to the fight. NOTE the lendable
  // cross-check stays true here — the LEND would lend to an
  // expedition holder (lendpool test (g)); the DRAFT would not fire.
  // The two instruments answer different questions.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 6, 5);
  b.Game.agencyState().exped[b.holder] = { target: 'eulogy', tx: 6, ty: 5, day: 1, encounters: [] };
  r = callDraftMiss(b, m4, {}, []);
  check('draftMiss (g): exped holder adjacent -> adjacent-but-unreachable (on-expedition), wouldFire false, lendable true (lend would lend; draft would not fire)',
    r.out && r.out.cause === 'adjacent-but-unreachable' && r.out.subreason === 'on-expedition' &&
    r.out.nearestDist === 1 && r.out.wouldFire === false && r.out.lendable === true && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);

  // (h) holder adjacent but away from the village.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 6, 5);
  b.Game.state.village.away = b.Game.state.village.away || {};
  b.Game.state.village.away[b.holder] = { purpose: 'forage', day: 1 };
  r = callDraftMiss(b, m4, {}, []);
  check('draftMiss (h): away holder adjacent -> adjacent-but-unreachable (away), wouldFire false',
    r.out && r.out.cause === 'adjacent-but-unreachable' && r.out.subreason === 'away' &&
    r.out.nearestDist === 1 && r.out.wouldFire === false && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);

  // (i) holder 3 tiles away, out in the world.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 8, 5);
  r = callDraftMiss(b, m4, {}, []);
  check('draftMiss (i): holder 3 away -> out-of-earshot (out-in-world), dist 3, no earshot, wouldFire false',
    r.out && r.out.cause === 'out-of-earshot' && r.out.subreason === 'out-in-world' &&
    r.out.nearestDist === 3 && r.out.anyArmedEarshot === false &&
    r.out.anyEligibleEarshot === false && r.out.wouldFire === false && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);

  // (j) stale pre-tick read: the tick pooled a holder who is gone at
  // launch time (no living holder now). The cause flips to
  // stale-pre-tick-read; the launch-time cause stays underlying.
  b = await freshLaunch(7);
  resetVillager(b.Game, b.pHolder);
  r = callDraftMiss(b, m4, {}, [tickRow(b, m4, { adjacent: ['ghost_holder'] })]);
  check('draftMiss (j): pooled holder gone at launch -> stale-pre-tick-read, underlying no-living-holder, tickStale true',
    r.out && r.out.cause === 'stale-pre-tick-read' && r.out.underlyingCause === 'no-living-holder' &&
    r.out.tickStale === true && JSON.stringify(r.out.tickPooled) === JSON.stringify(['ghost_holder']) &&
    r.out.wouldFire === false && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);

  // (k) stale, second shape: the tick pooled NOBODY, but an eligible
  // holder stands adjacent now — the pre-pass missed them.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 6, 5);
  r = callDraftMiss(b, m4, {}, [tickRow(b, m4, { onTile: [], adjacent: [] })]);
  check('draftMiss (k): empty tick pool + eligible holder adjacent -> stale-pre-tick-read, underlying adjacent-eligible, wouldFire true',
    r.out && r.out.cause === 'stale-pre-tick-read' && r.out.underlyingCause === 'adjacent-eligible' &&
    r.out.tickStale === true && r.out.wouldFire === true && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);

  // (l) NOT stale: the pooled holder is still there, just sheltered —
  // the launch-time cause wins and tickStale stays false.
  b = await freshLaunch(7);
  b.Game.shelterVillagers([b.holder], { quiet: true, reason: 'test' });
  r = callDraftMiss(b, m4, {}, [tickRow(b, m4, { adjacent: [b.holder] })]);
  check('draftMiss (l): pooled holder still present but sheltered -> sheltered-holder, tickStale false',
    r.out && r.out.cause === 'sheltered-holder' && r.out.underlyingCause === 'sheltered-holder' &&
    r.out.tickStale === false && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);

  // (m) raid: a raid is a real fight through the same choke point,
  // but the draft never fires on one.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 6, 5);
  r = callDraftMiss(b, m4, { raid: true }, []);
  check('draftMiss (m): raid + adjacent holder -> raid, lendable false, wouldFire false',
    r.out && r.out.cause === 'raid' && r.out.raid === true &&
    r.out.lendable === false && r.out.wouldFire === false && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);

  // (n) below wave 4: null.
  b = await freshLaunch(7);
  r = callDraftMiss(b, m1, {}, []);
  check('draftMiss (n): wave-1 beast -> null', r.out === null && r.used === 0,
    'out=' + JSON.stringify(r.out) + ' draws=' + r.used);

  // (o) loaded lead: null (not a draft miss).
  b = await freshLaunch(7);
  b.armHolder(b.pLead, b.lead, 2);
  b.Game.npcSetNode(b.holder, 6, 5);
  r = callDraftMiss(b, m4, {}, []);
  check('draftMiss (o): loaded lead + adjacent holder -> null', r.out === null && r.used === 0,
    'out=' + JSON.stringify(r.out) + ' draws=' + r.used);

  // (p) empty-gun (cells) lead + adjacent holder: the cells shape.
  b = await freshLaunch(7);
  b.armLeadEmptyGun(b.pLead, b.lead);
  b.Game.npcSetNode(b.holder, 6, 5);
  r = callDraftMiss(b, m4, {}, []);
  check('draftMiss (p): empty-gun lead + adjacent holder -> adjacent-eligible, leadKind cells, wouldFire true',
    r.out && r.out.cause === 'adjacent-eligible' && r.out.leadKind === 'cells' &&
    r.out.wouldFire === true && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);

  // (q) pure reads — nothing moved by the evaluation.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 6, 5);
  r = callDraftMiss(b, m4, {}, []);
  check('draftMiss (q): pure reads — kits and ammo unchanged after the call',
    r.out && rangedKitOf(b.Game, b.pHolder).rwId === 'searcaster' &&
    rangedKitOf(b.Game, b.pLead).rwId === 'crude_bow' &&
    ammoCountOf(b.pHolder.items, 'fusion_cell') === 2 && ammoCountOf(b.pLead.items, 'fusion_cell') === 0,
    'holder=' + JSON.stringify(rangedKitOf(b.Game, b.pHolder)) + ' lead=' + JSON.stringify(rangedKitOf(b.Game, b.pLead)));

  // (r) analyzer CLI --selftest passes as a subprocess (proves the
  // CLI wiring, not just the in-process selftest).
  console.log('\n=== Analyzer CLI selftest (analyze-draftmiss-a --selftest) ===');
  let anaSelf = null, anaCount = null;
  try {
    const anaOut = execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-draftmiss-a.js'), '--selftest'],
      { encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024, env: process.env });
    console.log('  ' + anaOut.trim().split('\n').filter(Boolean).pop());
    const m = /(\d+) passed, 0 failed/.exec(anaOut);
    anaCount = m ? parseInt(m[1], 10) : null;
    anaSelf = anaCount != null && anaCount >= 40;
  } catch (e) {
    console.log('  (analyzer selftest failed: ' + (e && e.message) + ')');
  }
  check('analyzer CLI selftest passes (>= 40 passed, 0 failed — incl. the launch-level judge)', anaSelf === true, anaCount === null ? 'no output' : 'passed=' + anaCount);
}

(async function main() {
  runCorpus();
  await runLive();
  console.log(failures === 0 ? 'test-draftmiss-a: ALL GREEN' : 'test-draftmiss-a: ' + failures + ' FAILURE(S)');
  process.exit(failures === 0 ? 0 : 1);
})().catch(function (e) { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
