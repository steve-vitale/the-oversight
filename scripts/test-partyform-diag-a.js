// test-partyform-diag-a.js — proof test, arm sim-partyform-diag-a.
// Proves the DIAGNOSTIC instrument and the dawn-path gates finding
// #2547 rests on (no game code changes in this arm — pure diag):
//   §1 poolReplica reports the companion pool truthfully: counts sum
//      to rosterN, every member counted once at its FIRST failing
//      check, eligible list = members passing every check, against an
//      independent re-implementation of the check order on live game
//      state (ranger vs forager vs away vs trust-low vs off-Haven).
//   §2 deriveLaunchBlock: 'range-0' for a homebody (maxDist 0),
//      'hurt-no-medicine-no-healer' for a hurt villager with no
//      medicine and no healer, null for a healthy ranger.
//   §3 planIsWave4 truth table (needWave >= 4, wave-4 target id,
//      non-wave-4 target, null plan).
//   §4 The dawn gate itself, live: a wave-4 plan holder who is AWAY
//      (purpose 'leave', duration 999) gets ZERO vbrainScorePick calls
//      across objTick at dawn, and winPlanHavenTick returns null for
//      them; the same holder at Haven gets scored (>= 1 call) and
//      HavenTick returns the plan. This is the Yuki mechanism
//      (seed 104607 d106-140: 35 holder-days, 0 score calls).
// Live sections run through scripts/sim-harness.js (seeded, full
// src/js list in index.html order, Math.random seeded before eval).
// Usage: node scripts/test-partyform-diag-a.js
'use strict';
const path = require('path');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const D = require('./partyform-diag-driver');

let failures = 0;
function fail(msg) { failures++; console.error('FAIL: ' + msg); }
function ok(msg) { console.log('ok: ' + msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

async function live() {
  process.env.WILDAVOID = '1';
  process.env.VETREENGAGE = '1';
  process.env.WILDSEEDPLAN = '1';
  process.env.FLEEREPAIR2 = '1';
  const { Game, loadFails } = await loadGame({ seed: 104607, mode: 'test' });
  if (loadFails && loadFails.length) { fail('live module load failures: ' + loadFails.join('; ')); return; }
  await setupGame(Game);
  const v = Game.state.village;
  const hx = v.px != null ? v.px : 4, hy = v.py != null ? v.py : 4;
  const roster = (v.roster || []).filter(function (id) { return id !== Game.villagerId; });
  assert(roster.length >= 8, '§1 live need 8+ NPCs, have ' + roster.length);
  // Silence say output for the fixture manipulations.
  const origSay = Game.say;
  Game.say = function () {};

  // ---- §3 planIsWave4 truth table (pure) ----
  assert(D.planIsWave4(Game, { needWave: 4, target: null }) === true, '§3 needWave 4 is wave-4');
  assert(D.planIsWave4(Game, { needWave: 3, target: 'influencer' }) === true, '§3 influencer target is wave-4');
  assert(D.planIsWave4(Game, { needWave: 3, target: 'buffering' }) === false, '§3 buffering target is not wave-4');
  assert(D.planIsWave4(Game, { needWave: 2, target: null }) === false, '§3 needWave 2 is not wave-4');
  assert(D.planIsWave4(Game, null) === false, '§3 null plan is not wave-4');

  // ---- §1 poolReplica vs independent check order ----
  // Stage a mixed roster: one away, one trust-low, one off-Haven,
  // one homebody at Haven, one forager at Haven; the rest untouched.
  const trust = (v.trust = v.trust || {});
  const away = (v.away = v.away || {});
  const byProfile = {};
  for (const id of roster) {
    const p = Game.npcRangeProfile ? Game.npcRangeProfile(id) : null;
    (byProfile[p] = byProfile[p] || []).push(id);
  }
  const pick = function (prof, notId) {
    const list = byProfile[prof] || [];
    for (const id of list) if (id !== notId) return id;
    return null;
  };
  const holder = pick('wanderer') || pick('explorer') || roster[0];
  const awayVid = pick('forager', holder) || roster[1];
  const trustVid = pick('explorer', holder) || roster[2];
  const offVid = (function () {
    const list = byProfile['forager'] || [];
    for (const id of list) if (id !== holder && id !== awayVid) return id;
    for (const id of roster) if (id !== holder && id !== awayVid && id !== trustVid) return id;
    return null;
  })();
  const homeVid = pick('homebody') || null;
  away[awayVid] = { purpose: 'forage', sinceDay: 1, duration: 4 };
  trust[trustVid] = 5;
  try { Game.npcSetNode(offVid, hx + 2 > 8 ? hx - 2 : hx + 2, hy); } catch (e) {}
  if (trust[holder] === undefined) trust[holder] = 90;
  // Independent first-fail computation (same check order, written here).
  const expected = { counts: { selfOrScholar: 0, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 }, fails: {}, eligible: [] };
  for (const cid of v.roster || []) {
    if (!cid || cid === holder || cid === Game.villagerId) { expected.counts.selfOrScholar++; if (cid) expected.fails[cid] = 'selfOrScholar'; continue; }
    let dead = false;
    try { const p = Game.getPerson ? Game.getPerson(cid) : null; dead = !!(p && p.dead); } catch (e) {}
    const isAway = !!away[cid];
    const t = (trust[cid] === undefined ? 10 : trust[cid]);
    let node = null;
    try { const n = Game.npcNode ? Game.npcNode(cid) : null; if (n) node = { nx: n.nx, ny: n.ny }; } catch (e) {}
    const atHaven = !!(node && node.nx === hx && node.ny === hy);
    let engaged = false;
    try { engaged = !!(Game.isEngaged && Game.isEngaged(cid)); } catch (e) {}
    let prof = null;
    try { prof = Game.npcRangeProfile ? Game.npcRangeProfile(cid) : null; } catch (e) {}
    let onExped = false;
    try { const a = Game.agencyState ? Game.agencyState() : null; onExped = !!(a && a.exped && a.exped[cid]); } catch (e) {}
    let ff = null;
    if (dead) { expected.counts.dead++; ff = 'dead'; }
    else if (isAway) { expected.counts.away++; ff = 'away'; }
    else if (t < 15) { expected.counts.trustLow++; ff = 'trustLow'; }
    else if (!atHaven) { expected.counts.notAtHaven++; ff = 'notAtHaven'; }
    else if (engaged) { expected.counts.engaged++; ff = 'engaged'; }
    else if (prof !== 'wanderer' && prof !== 'explorer') { expected.counts.notRanger++; ff = 'notRanger'; }
    else if (onExped) { expected.counts.onExped++; ff = 'onExped'; }
    else { expected.counts.eligible++; ff = 'eligible'; expected.eligible.push(cid); }
    expected.fails[cid] = ff;
  }
  const pool = D.poolReplica(Game, holder);
  assert(!!pool, '§1 poolReplica returns a pool');
  if (pool) {
    assert(eq(pool.counts, expected.counts), '§1 counts match independent order ' + JSON.stringify(pool.counts));
    assert(eq(pool.fails, expected.fails), '§1 per-member first-fail matches independent order');
    assert(eq(pool.eligible.slice().sort(), expected.eligible.slice().sort()), '§1 eligible list matches independent order');
    const sum = Object.keys(pool.counts).reduce(function (a, k) { return a + pool.counts[k]; }, 0);
    assert(sum === pool.rosterN, '§1 counts sum to rosterN (' + sum + ' vs ' + pool.rosterN + ')');
    assert(pool.fails[awayVid] === 'away', '§1 away member fails as away');
    assert(pool.fails[trustVid] === 'trustLow', '§1 trust-5 member fails as trustLow');
    assert(pool.fails[offVid] === 'notAtHaven', '§1 off-Haven member fails as notAtHaven');
    if (homeVid) assert(pool.fails[homeVid] === 'notRanger', '§1 homebody at Haven fails as notRanger, not eligible');
    assert(pool.holderNode && pool.holderNode.nx === hx && pool.holderNode.ny === hy, '§1 holder reads at Haven (4,4)');
  }
  // Clean the staging so §4 starts from a neutral village.
  delete away[awayVid];
  trust[trustVid] = 90;
  try { Game.npcSetNode(offVid, hx, hy); } catch (e) {}

  // ---- §2 deriveLaunchBlock ----
  if (homeVid) {
    const md = Game.npcMaxDist ? Game.npcMaxDist(homeVid) : null;
    assert(md === 0, '§2 homebody maxDist is 0 (got ' + md + ')');
    assert(D.deriveLaunchBlock(Game, homeVid) === 'range-0', '§2 homebody launch block is range-0');
  } else {
    ok('§2 SKIP: no homebody on this roster (range-0 branch unproven here)');
  }
  const healthyRanger = pick('wanderer', holder) || pick('explorer', holder);
  if (healthyRanger) {
    try { ((v.health = v.health || {}))[healthyRanger] = 100; } catch (e) {}
    try { if (v.sick) delete v.sick[healthyRanger]; } catch (e) {}
    assert(D.deriveLaunchBlock(Game, healthyRanger) === null, '§2 healthy ranger has no launch block');
    try { ((v.health = v.health || {}))[healthyRanger] = 50; } catch (e) {}
    const meds = (function () { try { const st = Game.stashState ? Game.stashState() : null; return (st && st.medicine) || []; } catch (e) { return []; } })();
    // The hurt branch needs no medicine AND no healer at the holder's
    // camp: campPeopleIds('haven') excludes away residents, so send
    // the camp healer away for the check, then restore.
    let healerId = null;
    try { healerId = Game.campHealerId ? Game.campHealerId('haven') : null; } catch (e) {}
    if (healerId) { try { (v.away = v.away || {})[healerId] = { purpose: 'forage', sinceDay: 1, duration: 4 }; } catch (e) {} }
    const hasHealerAfter = (function () { try { return !!Game.campHealerId && !!Game.campHealerId('haven'); } catch (e) { return false; } })();
    if (meds.length === 0 && !hasHealerAfter) {
      assert(D.deriveLaunchBlock(Game, healthyRanger) === 'hurt-no-medicine-no-healer', '§2 hurt ranger with no medicine/healer blocks as hurt');
    } else {
      ok('§2 SKIP: medicine/healer still present, hurt branch not isolated on this fixture');
    }
    if (healerId) { try { delete (v.away || {})[healerId]; } catch (e) {} }
    try { ((v.health = v.health || {}))[healthyRanger] = 100; } catch (e) {}
  }

  // ---- §4 the dawn gate, live ----
  // Give the holder a wave-4 party-stage plan (fixture state; the seed
  // path itself is proven by test-wildavoid-seedplan-b.js §1).
  const wp = (v.winPlan = v.winPlan || {});
  wp[holder] = { stage: 'party', target: 'influencer', node: { nx: 0, ny: 4 }, party: [], sinceDay: 0, holdSinceDay: -1, needWave: 4 };
  let scoreCalls = 0;
  const origScore = Game.vbrainScorePick;
  if (typeof origScore === 'function') {
    Game.vbrainScorePick = function (vid) {
      if (vid === holder) scoreCalls++;
      return origScore.apply(this, arguments);
    };
  } else { fail('§4 vbrainScorePick missing — cannot prove the dawn gate'); }
  const setDayPart = function (part) {
    try { Game.dayPart = part; } catch (e) {}
    try { if (Game.state && Game.state.scholar) Game.state.scholar.dayPart = part; } catch (e) {}
  };
  // AWAY at dawn: the holder left on day 1, duration 999 (Yuki's shape).
  away[holder] = { purpose: 'leave', sinceDay: 1, duration: 999 };
  try { Game.npcSetNode(holder, 0, 4); } catch (e) {}
  setDayPart(0);
  scoreCalls = 0;
  await quietLog(async function () { try { Game.objTick(); } catch (e) { fail('§4 objTick away threw: ' + e.message); } });
  assert(scoreCalls === 0, '§4 away-at-dawn holder gets 0 vbrainScorePick calls (got ' + scoreCalls + ')');
  let htAway = null;
  try { htAway = Game.winPlanHavenTick ? Game.winPlanHavenTick(holder, hx, hy) : 'missing'; } catch (e) { htAway = 'threw'; }
  assert(htAway === null, '§4 winPlanHavenTick returns null away from Haven (got ' + JSON.stringify(htAway) + ')');
  // AT HAVEN at dawn: same holder, same plan — the gate opens.
  delete away[holder];
  try { Game.npcSetNode(holder, hx, hy); } catch (e) {}
  setDayPart(0);
  scoreCalls = 0;
  await quietLog(async function () { try { Game.objTick(); } catch (e) { fail('§4 objTick haven threw: ' + e.message); } });
  assert(scoreCalls >= 1, '§4 at-Haven holder gets scored at dawn (got ' + scoreCalls + ' calls)');
  let htHome = null;
  try { htHome = Game.winPlanHavenTick ? Game.winPlanHavenTick(holder, hx, hy) : 'missing'; } catch (e) { htHome = 'threw'; }
  assert(htHome && htHome.stage === 'party', '§4 winPlanHavenTick returns the plan at Haven (got ' + JSON.stringify(htHome && htHome.stage) + ')');
  try { Game.vbrainScorePick = origScore; } catch (e) {}
  try { Game.say = origSay; } catch (e) {}

  // Restore the staged-away villager so the process exits clean.
  try { delete away[holder]; } catch (e) {}
}

async function main() {
  await live();
  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
}
if (require.main === module) {
  main().catch(function (e) { console.error(e && e.stack || e); process.exit(1); });
}
