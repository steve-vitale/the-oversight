#!/usr/bin/env node
// test-journey-social-life-r231-c3d-recap-live-20261116.js — proof test for
// the r231 C3d fix (journey-social-life r231; the r229 C3d finding).
//
// THE DEFECT (r229 succession, second sighting; first was 14461 d31):
// seed 34312 d+53 Onni (trust 90): the recap "Wait — what were we talking
// about?" is answered "We were just talking. Nothing important." while a
// LIVE favor ask (the creek-water run, stated in the opener, requirements
// just discussed) plus a party naming ("The Company") and a role
// assignment (Onni → Scout) are on the table. Mechanism: convoRecapLine
// reads c.threadLog filtered to threads other than 'small'/'nonverbal';
// the log was EMPTY — stated-but-unengaged wants plant no thread
// (convoNoteBeat only fires on spoken beats), so the empty-log branch
// serves the recap-empty pool. The sitting itself resolves honestly
// afterward, but the recap erases real content.
//
// THE FIX (C3d): in the empty-log branch, check the sitting's live want
// FIRST (stage 1-2, surfaced and unresolved) and name it through its
// stale opener — the def's state-aware reframe, else the generic
// convoWantStaleOpener — the same escape the opener chain uses. Serve
// the pool only when nothing is open. Stage 0 wants are NOT live (opener
// never ran; r225); stage 3 wants are resolved.
//
// PROOF SHAPE (real sittings, real recap path — godpath lib, F6 pattern):
// stage a live want on a test villager with an EMPTY threadLog (the wild
// state: startConvo resets threadLog to [], and a stated-but-unengaged
// want plants no entry), then call Game.convoRecapLine(vid) directly.
// Fixed: the recap names the live thread. Unfixed: the recap serves the
// pool ("Nothing important").
//   1. live ask_favor stage 1 (water_haul, short 'the creek water run')
//      — recap names the creek water run (the Onni shape, verbatim)
//   2. live curious stage 2 (generic stale opener) — recap names
//      'what I asked you'
//   3. stage 3 ask_favor (resolved) — pool line (Ruth line: closed)
//   4. stage 0 ask_favor (opener never ran) — pool line (not live)
//   5. no want at all — pool line (Ruth non-sighting control)
//   6. live ask_favor with NO favor (staleOpener returns null) — pool
//      line (honest fallback, never a dry line or a fabricated short)
// Def acquisition is deterministic: convoPlantSeed(vid, {wantId}) then
// convoSelectWant(vid) returns the real def (the seed path, fromSeed).
// The donor is never the test villager (selection is read-only here —
// no sitting is opened on the donor — but the seed is planted on the
// donor only, keeping the test villager's state clean).
// Usage: node scripts/test-journey-social-life-r231-c3d-recap-live-20261116.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('journey-social-life-r231-c3d-recap-live');

const POOL_MARK = /Nothing important|Nothing to sum up|Nothing in particular|Nothing worth repeating/;
const CREEK = 'the creek water run';

(async () => {
  const Game = await K.load({ seed: 231100 });

  function fresh() {
    K.newRun(Game);
    const roster = (Game.state.village && Game.state.village.roster) || [];
    const scholarId = Game.villagerId;
    const others = roster.filter(v => v && v !== scholarId);
    const speaking = others.filter(vid => {
      try { const c = Game.commLevel(vid); return c && c.level !== 'none'; } catch (e) { return false; }
    });
    if (speaking.length < 2) throw new Error('fresh run needs >= 2 speaking non-scholar roster members');
    return { speaking };
  }
  function convo(vid) { try { return Game.convoGet(vid); } catch (e) { return null; } }
  function openVid(vid) {
    try {
      const opened = Game.talkTo(vid);
      if (!opened) return false;
      const c = convo(vid);
      if (c && c.active) return true;
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    } catch (e) {}
    return false;
  }
  function day() { try { return (Game.state.scholar || {}).day || 1; } catch (e) { return 1; } }
  // findDef: plant a seed for wantId on a donor villager and read the real
  // def back through selection. The donor never opens a sitting.
  function findDef(speaking, wantId) {
    for (const vid of speaking) {
      try { Game.convoPlantSeed(vid, { wantId, note: 'r231 proof' }); } catch (e) {}
      let sel = null;
      try { sel = Game.convoSelectWant(vid); } catch (e) { sel = null; }
      if (sel && sel.id === wantId && sel.def) return { donor: vid, def: sel.def };
    }
    return null;
  }
  function makeFavor(vid, kind, state, short) {
    const favor = { vid, id: 'favor-r231-' + kind + '-' + vid + '-' + day(), kind, state, askedDay: day(), short };
    try { Game.convoStoreFavor(favor); } catch (e) {}
    return favor;
  }
  function recap(vid) {
    let line = null;
    try { line = Game.convoRecapLine(vid); } catch (e) { line = 'ERR:' + (e && e.message); }
    return String(line || '');
  }
  function pickTestVid(speaking, exclude) {
    for (const vid of speaking) {
      if (vid !== exclude) return vid;
    }
    return null;
  }

  // ---- 1. Live ask_favor stage 1 — the Onni shape. ----
  T.section('1. Live ask_favor stage 1, empty threadLog — recap names the creek water run');
  let f = fresh();
  let askDef = findDef(f.speaking, 'ask_favor');
  T.ok('found the ask_favor def via a seeded donor', !!askDef, askDef && ('donor=' + askDef.donor));
  if (askDef) {
    const vid = pickTestVid(f.speaking, askDef.donor);
    T.ok('picked a test villager (not the donor)', !!vid, 'vid=' + vid);
    T.ok('opened a sitting on the test villager', openVid(vid));
    const favor = makeFavor(vid, 'water_haul', 'asked', CREEK);
    const c = convo(vid);
    c.want = { id: 'ask_favor', def: askDef.def, favor, stage: 1, fromSeed: true, seedFavorId: favor.id };
    c.threadLog = [];
    T.ok('staged: live want stage 1, empty threadLog', (c.want.stage === 1) && (c.threadLog.length === 0));
    const line = recap(vid);
    T.ok('recap ran', !!line && line.indexOf('ERR:') !== 0, 'line=' + line.slice(0, 120));
    T.ok('recap names the creek water run', line.toLowerCase().indexOf(CREEK) !== -1, 'line=' + line.slice(0, 140));
    T.ok('recap does NOT serve the empty pool', !POOL_MARK.test(line), 'line=' + line.slice(0, 140));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 2. Live curious stage 2 — generic stale opener names the question. ----
  T.section('2. Live curious stage 2, empty threadLog — recap names what was asked');
  f = fresh();
  const curDef = findDef(f.speaking, 'curious');
  T.ok('found the curious def via a seeded donor', !!curDef, curDef && ('donor=' + curDef.donor));
  if (curDef) {
    const vid = pickTestVid(f.speaking, curDef.donor);
    T.ok('picked a test villager (not the donor)', !!vid, 'vid=' + vid);
    T.ok('opened a sitting on the test villager', openVid(vid));
    const c = convo(vid);
    c.want = { id: 'curious', def: curDef.def, stage: 2, fromSeed: true, seedQid: null, seedNote: null };
    c.threadLog = [];
    T.ok('staged: live want stage 2, empty threadLog', (c.want.stage === 2) && (c.threadLog.length === 0));
    const line = recap(vid);
    T.ok('recap ran', !!line && line.indexOf('ERR:') !== 0, 'line=' + line.slice(0, 120));
    T.ok('recap names the open question', /what I asked you|Still wondering|turning it over/i.test(line), 'line=' + line.slice(0, 140));
    T.ok('recap does NOT serve the empty pool', !POOL_MARK.test(line), 'line=' + line.slice(0, 140));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 3. Resolved ask_favor (stage 3) — the pool stays honest. ----
  T.section('3. Resolved ask_favor stage 3 — recap serves the empty pool');
  f = fresh();
  askDef = findDef(f.speaking, 'ask_favor');
  T.ok('found the ask_favor def via a seeded donor', !!askDef, askDef && ('donor=' + askDef.donor));
  if (askDef) {
    const vid = pickTestVid(f.speaking, askDef.donor);
    T.ok('picked a test villager (not the donor)', !!vid, 'vid=' + vid);
    T.ok('opened a sitting on the test villager', openVid(vid));
    const favor = makeFavor(vid, 'water_haul', 'fulfilled', CREEK);
    const c = convo(vid);
    c.want = { id: 'ask_favor', def: askDef.def, favor, stage: 3, fromSeed: true, seedFavorId: favor.id };
    c.threadLog = [];
    const line = recap(vid);
    T.ok('recap ran', !!line && line.indexOf('ERR:') !== 0, 'line=' + line.slice(0, 120));
    T.ok('recap serves the empty pool (want resolved)', POOL_MARK.test(line), 'line=' + line.slice(0, 140));
    T.ok('recap does NOT name the resolved favor', line.toLowerCase().indexOf(CREEK) === -1, 'line=' + line.slice(0, 140));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 4. Stage-0 ask_favor (opener never ran) — not live, pool. ----
  T.section('4. Stage-0 ask_favor — recap serves the empty pool (not live)');
  f = fresh();
  askDef = findDef(f.speaking, 'ask_favor');
  T.ok('found the ask_favor def via a seeded donor', !!askDef, askDef && ('donor=' + askDef.donor));
  if (askDef) {
    const vid = pickTestVid(f.speaking, askDef.donor);
    T.ok('picked a test villager (not the donor)', !!vid, 'vid=' + vid);
    T.ok('opened a sitting on the test villager', openVid(vid));
    const favor = makeFavor(vid, 'water_haul', 'asked', CREEK);
    const c = convo(vid);
    c.want = { id: 'ask_favor', def: askDef.def, favor, stage: 0, fromSeed: true, seedFavorId: favor.id };
    c.threadLog = [];
    const line = recap(vid);
    T.ok('recap ran', !!line && line.indexOf('ERR:') !== 0, 'line=' + line.slice(0, 120));
    T.ok('recap serves the empty pool (want never surfaced)', POOL_MARK.test(line), 'line=' + line.slice(0, 140));
    T.ok('recap does NOT name the unsurfaced favor', line.toLowerCase().indexOf(CREEK) === -1, 'line=' + line.slice(0, 140));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 5. No want at all — the Ruth non-sighting control. ----
  T.section('5. No want, empty threadLog — recap serves the empty pool');
  f = fresh();
  {
    const vid = f.speaking[0];
    T.ok('picked a test villager', !!vid, 'vid=' + vid);
    T.ok('opened a sitting on the test villager', openVid(vid));
    const c = convo(vid);
    c.want = null;
    c.threadLog = [];
    const line = recap(vid);
    T.ok('recap ran', !!line && line.indexOf('ERR:') !== 0, 'line=' + line.slice(0, 120));
    T.ok('recap serves the empty pool (nothing open)', POOL_MARK.test(line), 'line=' + line.slice(0, 140));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 6. Live want, stale opener null — honest pool fallback. ----
  T.section('6. Live ask_favor, no favor to name — recap serves the empty pool');
  f = fresh();
  askDef = findDef(f.speaking, 'ask_favor');
  T.ok('found the ask_favor def via a seeded donor', !!askDef, askDef && ('donor=' + askDef.donor));
  if (askDef) {
    const vid = pickTestVid(f.speaking, askDef.donor);
    T.ok('picked a test villager (not the donor)', !!vid, 'vid=' + vid);
    T.ok('opened a sitting on the test villager', openVid(vid));
    const c = convo(vid);
    // No favor anywhere: c.want.favor unset AND nothing in the favor
    // ledger for this villager — ask_favor.staleOpener returns null, and
    // the generic fallback is never reached (the def's own staleOpener
    // answers first). The recap must fall through to the pool, honestly.
    c.want = { id: 'ask_favor', def: askDef.def, favor: null, stage: 1, fromSeed: true, seedFavorId: null };
    c.threadLog = [];
    const line = recap(vid);
    T.ok('recap ran', !!line && line.indexOf('ERR:') !== 0, 'line=' + line.slice(0, 120));
    T.ok('recap serves the empty pool (nothing nameable)', POOL_MARK.test(line), 'line=' + line.slice(0, 140));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
