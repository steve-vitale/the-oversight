// test-journey-deepening-r293-muster-20261128.js -- R269 muster-policy proof (r249 carried: r238 M1-M28 + M29 probe)
// (carried verbatim from r227; only the driver require path changed).
// Runs the REAL r232 driver musterDecision/musterPlay on synthetic stubs;
// no game needed.
// The r226 blank was a verb problem (0 muster verbs with the Herald present
// 253 titan-days). The r227 policy sounds the call when the omen locates.
// Safety rules under test (prereg): the call sounds ONCE per link-count
// change (a refusal costs trust −8 per call — never sound daily); the
// council is sat once per located omen; one commit cycle per muster; the
// two-tap commit completes in one daily tick.
// (M1) stage 0 -> nothing. (M2) stage 1 -> nothing. (M3) stage 2 + present
// + never called -> call + council + commit. (M4) already called at the
// same link count + council done + committed -> nothing. (M5) links grew
// since the last call -> call again. (M6) muster ready -> nothing.
// (M7) herald absent -> nothing even at stage 2. (M8) haven already 3 ->
// commit false, call/council still true. (M9) musterPlay on a stub Game:
// council once, call once, commit twice (two-tap), haven 0 -> 2, one log
// entry. (M10) same-day second musterPlay -> no new entry, no extra verb
// calls (day guard). (M11) next day, same links, council done, committed
// -> no new entry (no daily re-sound). (M12) next day with a NEW link ->
// the call sounds a second time.
// The titan carve-out in policy.fight is NOT unit-proved here (it needs a
// live fight fixture); the panel proves it via the titanFightsStood
// counter + titan fights in wildFightTable.
'use strict';
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function freshDriver() {
  const p = require.resolve('./journey-deepening-r293-20261128.js');
  delete require.cache[p];
  return require(p);
}
const D = freshDriver();
const dec = D.musterDecision;

// (M1) stage 0 -> nothing.
{
  const r = dec({ omenStage: 0, heraldPresent: true, links: 2, musterReady: false, havenBlades: 0, calledLinks: null, councilDone: false, committed: false });
  ok('(M1) stage 0: no call/council/commit', !r.call && !r.council && !r.commit, JSON.stringify(r));
}
// (M2) stage 1 -> nothing.
{
  const r = dec({ omenStage: 1, heraldPresent: true, links: 2, musterReady: false, havenBlades: 0, calledLinks: null, councilDone: false, committed: false });
  ok('(M2) stage 1 (named, not located): no call/council/commit', !r.call && !r.council && !r.commit, JSON.stringify(r));
}
// (M3) stage 2 + present + never called -> all three.
{
  const r = dec({ omenStage: 2, heraldPresent: true, links: 2, musterReady: false, havenBlades: 0, calledLinks: null, councilDone: false, committed: false });
  ok('(M3) stage 2 + present + never called: call + council + commit', r.call && r.council && r.commit, JSON.stringify(r));
}
// (M4) already called at this link count, council done, committed -> nothing.
{
  const r = dec({ omenStage: 2, heraldPresent: true, links: 2, musterReady: false, havenBlades: 2, calledLinks: 2, councilDone: true, committed: true });
  ok('(M4) called at same link count + done: nothing (no daily re-sound)', !r.call && !r.council && !r.commit, JSON.stringify(r));
}
// (M5) links grew since the last call -> call again (a new ally may answer).
{
  const r = dec({ omenStage: 2, heraldPresent: true, links: 3, musterReady: false, havenBlades: 2, calledLinks: 2, councilDone: true, committed: true });
  ok('(M5) links grew 2 -> 3: call again, council/commit stay done', r.call && !r.council && !r.commit, JSON.stringify(r));
}
// (M6) muster ready -> nothing, even never called.
{
  const r = dec({ omenStage: 2, heraldPresent: true, links: 2, musterReady: true, havenBlades: 0, calledLinks: null, councilDone: false, committed: false });
  ok('(M6) muster ready: nothing to do', !r.call && !r.council && !r.commit, JSON.stringify(r));
}
// (M7) herald absent -> nothing even at stage 2.
{
  const r = dec({ omenStage: 2, heraldPresent: false, links: 2, musterReady: false, havenBlades: 0, calledLinks: null, councilDone: false, committed: false });
  ok('(M7) herald absent: nothing (no marching into the dark)', !r.call && !r.council && !r.commit, JSON.stringify(r));
}
// (M8) haven already 3 -> commit false, call/council still true.
{
  const r = dec({ omenStage: 2, heraldPresent: true, links: 2, musterReady: false, havenBlades: 3, calledLinks: null, councilDone: false, committed: false });
  ok('(M8) haven already 3: call + council, no commit', r.call && r.council && !r.commit, JSON.stringify(r));
}

// ---- stub-Game musterPlay tests (M9)-(M12) ----
function stubGame() {
  const muster = { allies: [], haven: [], day: 62, outfitted: {} };
  const calls = { council: 0, sound: 0, commit: 0, standDown: 0 };
  let links = 2;
  let pending = null;
  let present = true;
  const state = { titans: { omens: { herald: { stage: 2, day: 61 } }, musters: { herald: muster }, slain: {}, cast: null }, scholar: { day: 62 } };
  return {
    _muster: muster, _calls: calls,
    setLinks: function (n) { links = n; },
    setPresent: function (b) { present = !!b; },
    state: state,
    worldMonsters: function () { return present ? [{ id: 'herald', hp: 700, maxHp: 700 }] : []; },
    hierarchyState: function () { return new Array(links).fill({}); },
    titanMusterReady: function () { return (muster.allies.length + muster.haven.length) >= 10; },
    titanWarCouncil: function () { calls.council++; return 'sat'; },
    soundTitanCall: function () { calls.sound++; muster.allies.push({ villageId: 'x', vid: 'a' + calls.sound }); return muster; },
    titanStandDown: function () {
      // The real verb nulls the muster record, releases the committed,
      // and says the MUSTER BREAKS line; the stub nulls the record and
      // clears the blades (the arrays live on the muster object the
      // test reads via G._muster).
      calls.standDown++;
      muster.allies.length = 0;
      muster.haven.length = 0;
      state.titans.musters.herald = null;
      return true;
    },
    titanCommitOwn: function () {
      calls.commit++;
      if (muster.haven.length >= 2) return muster;
      if (!pending) { pending = true; return 'confirm'; }
      pending = null;
      muster.haven.push({ vid: 'v_h1' }, { vid: 'v_h2' });
      return muster;
    },
  };
}
function stubCtx() { return { shipWrapErrors: [] }; }
// r243 Q1-PROBE stub: like stubGame, but the world census is the LIVE
// state.worldMonsters array (what the real engine's worldMonsters()
// returns), so the probe's splice is visible to the same call's present
// read. The base stub's worldMonsters() returns a fresh array per call,
// which a splice could never change.
function stubGameProbe() {
  const base = stubGame();
  base.state.worldMonsters = [{ id: 'herald', hp: 700, maxHp: 700 }];
  base.worldMonsters = function () { return base.state.worldMonsters; };
  return base;
}
{
  const G = stubGame();
  const ctx = stubCtx();
  D.musterPlay(G, ctx);
  ok('(M9) musterPlay: council 1x, call 1x, commit 2x (two-tap), haven 0 -> 2, one log entry with after.haven=2',
    G._calls.council === 1 && G._calls.sound === 1 && G._calls.commit === 2 &&
    G._muster.haven.length === 2 && (ctx.musterLog || []).length === 1 &&
    ctx.musterLog[0].after.haven === 2 && ctx.musterLog[0].after.allies === 1 &&
    ctx.musterLog[0].results.commit.second === 'done',
    JSON.stringify({ calls: G._calls, log: ctx.musterLog, errs: ctx.shipWrapErrors }));
  // (M10) same-day second call -> day guard, nothing new.
  D.musterPlay(G, ctx);
  ok('(M10) same-day second musterPlay: no new log entry, no extra verb calls',
    (ctx.musterLog || []).length === 1 && G._calls.council === 1 && G._calls.sound === 1 && G._calls.commit === 2,
    JSON.stringify({ calls: G._calls, logN: (ctx.musterLog || []).length }));
  // (M11) next day (reset the day guard), same links, council done, committed -> no new entry.
  ctx._musterPlayDay = -1;
  D.musterPlay(G, ctx);
  ok('(M11) next day, same links, done: no re-sound, no new entry',
    (ctx.musterLog || []).length === 1 && G._calls.sound === 1,
    JSON.stringify({ calls: G._calls, logN: (ctx.musterLog || []).length }));
  // (M12) next day with a NEW link -> the call sounds a second time.
  ctx._musterPlayDay = -1;
  G.setLinks(3);
  D.musterPlay(G, ctx);
  ok('(M12) new link (2 -> 3): call sounds again, allies grow, second log entry',
    (ctx.musterLog || []).length === 2 && G._calls.sound === 2 &&
    ctx.musterLog[1].after.allies === 2 && ctx.musterLog[1].call === true,
    JSON.stringify({ calls: G._calls, log: ctx.musterLog }));
}

// ---- (M13)-(M15) R236 GROWTH AMENDMENT (driver-only) ----
// The growth line is the game's own word that a re-sounded call would
// bring more blades — so when it fired since the last call, the policy
// re-sounds the call that day. The flag is day-scoped (the say-wrap sets
// ctx._growthHeardDay to the current game day) and resets when the call
// sounds, so it can never cause a daily re-sound on its own.
{
  // (M13) growth heard, same links, council done, committed -> call again.
  const r = dec({ omenStage: 2, heraldPresent: true, links: 2, musterReady: false, havenBlades: 2, calledLinks: 2, councilDone: true, committed: true, growthHeard: true });
  ok('(M13) growth heard at same link count: call again, council/commit stay done', r.call && !r.council && !r.commit, JSON.stringify(r));
  // (M14) growth heard but muster ready -> nothing (the march owns it).
  const r2 = dec({ omenStage: 2, heraldPresent: true, links: 2, musterReady: true, havenBlades: 2, calledLinks: 2, councilDone: true, committed: true, growthHeard: true });
  ok('(M14) growth heard + muster ready: nothing to do', !r2.call && !r2.council && !r2.commit, JSON.stringify(r2));
  // (M15) musterPlay with the flag set (frozen stub day is 62): the call
  // sounds a second time at the same link count, the entry records
  // growthHeard, the flag resets — and the next day without the line,
  // nothing re-sounds.
  const G = stubGame();
  const ctx = stubCtx();
  D.musterPlay(G, ctx);
  ok('(M15a) first musterPlay: call 1x, one log entry',
    G._calls.sound === 1 && (ctx.musterLog || []).length === 1,
    JSON.stringify({ calls: G._calls, logN: (ctx.musterLog || []).length }));
  ctx._musterPlayDay = -1;
  ctx._growthHeardDay = 0; // gday() is 0 in the stub context (no live Game loaded); the say-wrap sets this to the current game day in the wild
  D.musterPlay(G, ctx);
  ok('(M15b) growth heard: call sounds again at same links, entry records growthHeard, flag resets',
    G._calls.sound === 2 && (ctx.musterLog || []).length === 2 &&
    ctx.musterLog[1].growthHeard === true && ctx._growthHeardDay == null,
    JSON.stringify({ calls: G._calls, log: ctx.musterLog, flag: ctx._growthHeardDay }));
  ctx._musterPlayDay = -1;
  D.musterPlay(G, ctx);
  ok('(M15c) next day without the line: no re-sound, no new entry',
    (ctx.musterLog || []).length === 2 && G._calls.sound === 2,
    JSON.stringify({ calls: G._calls, logN: (ctx.musterLog || []).length }));
}

// ---- (M16)-(M18) R236 PILOT-2: FRESH HAVEN GROWTH RE-OPENS THE COMMIT ----
// The call brings allies only; Haven marches on the commit. The commit is
// once-per-muster — but when the growth line names FRESH Haven volunteers,
// the policy re-commits (up to the cap of 3). Allied-only growth does not
// re-open it, and a full Haven contingent (3) never re-commits.
{
  // (M16) growth heard + 2 fresh Haven volunteers + committed + 1 Haven blade -> commit again.
  const r = dec({ omenStage: 2, heraldPresent: true, links: 2, musterReady: false, havenBlades: 1, calledLinks: 2, councilDone: true, committed: true, growthHeard: true, havenGain: 2 });
  ok('(M16) growth heard + fresh Haven volunteers: call again AND commit again (below cap)', r.call && !r.council && r.commit, JSON.stringify(r));
  // (M17) growth heard, allied-only (havenGain 0), committed -> call again, commit stays done.
  const r2 = dec({ omenStage: 2, heraldPresent: true, links: 2, musterReady: false, havenBlades: 1, calledLinks: 2, councilDone: true, committed: true, growthHeard: true, havenGain: 0 });
  ok('(M17) growth heard, allied-only growth: call again, commit stays done', r2.call && !r2.council && !r2.commit, JSON.stringify(r2));
  // (M18) growth heard + fresh Haven volunteers, but Haven already at the cap of 3 -> no re-commit.
  const r3 = dec({ omenStage: 2, heraldPresent: true, links: 2, musterReady: false, havenBlades: 3, calledLinks: 2, councilDone: true, committed: true, growthHeard: true, havenGain: 2 });
  ok('(M18) growth heard + fresh Haven volunteers, Haven at cap 3: call again, no re-commit', r3.call && !r3.council && !r3.commit, JSON.stringify(r3));
}
// ---- (M19)-(M23) R237 F1/F2 (driver-only) ----
// F1: musterPlay moved from policy.daily to policy.upkeep (first call
// post-dawn, before any wait), so the policy acts on the dawn pool the
// growth line named. A fight active at the first upkeep defers the
// DECISION (not the snapshot) and carries a heard growth line one day
// forward. F2: a muster that had blades and is now empty has dissolved
// (stood down) — the per-muster flags re-arm so the next muster can
// call, council, and commit fresh. A muster that never had blades (a
// refused call with an empty commit) does NOT reset.
{
  // (M19a) fight active at the first upkeep + growth heard: no verbs, no
  // log entry, the growth is carried (deferred flag set).
  const G = stubGame();
  G.tbfight = { over: false };
  const ctx = stubCtx();
  ctx._growthHeardDay = 0; // gday() is 0 in the stub context
  D.musterPlay(G, ctx);
  ok('(M19a) tbfight active: no verbs, no log entry, growth carried forward',
    G._calls.council === 0 && G._calls.sound === 0 && G._calls.commit === 0 &&
    (ctx.musterLog || []).length === 0 && ctx._musterDeferredGrowth === true,
    JSON.stringify({ calls: G._calls, logN: (ctx.musterLog || []).length, deferred: ctx._musterDeferredGrowth }));
  // (M19b) next day, fight over: the decision runs and consumes the
  // carried growth (call sounds again at the same link count).
  G.tbfight.over = true;
  ctx._musterPlayDay = -1;
  D.musterPlay(G, ctx);
  ok('(M19b) fight over next day: call sounds on the carried growth, deferred flag cleared',
    G._calls.sound === 1 && (ctx.musterLog || []).length === 1 &&
    ctx.musterLog[0].growthHeard === true && ctx._musterDeferredGrowth === false,
    JSON.stringify({ calls: G._calls, log: ctx.musterLog, deferred: ctx._musterDeferredGrowth }));
}
{
  // (M20) F2 reset: a muster with blades stands down (state record
  // nulled, as titanStandDown does) — the next musterPlay resets the
  // per-muster flags, logs the reset, and re-arms the call + commit.
  // (The stub's verbs close over the original muster object, so the
  // log entry's `after` still reads 0/0 from the nulled state record —
  // a stub artifact; the flags and verb counts are the asserted thing.)
  const G = stubGame();
  const ctx = stubCtx();
  D.musterPlay(G, ctx);
  ok('(M20a) first muster: call + council + commit, haven 0 -> 2',
    G._calls.sound === 1 && G._calls.council === 1 && G._calls.commit === 2 &&
    (ctx.musterLog || []).length === 1,
    JSON.stringify({ calls: G._calls, logN: (ctx.musterLog || []).length }));
  // Stand-down: the game nulls state.titans.musters.herald.
  G.state.titans.musters.herald = null;
  G._muster.allies.length = 0;
  G._muster.haven.length = 0;
  ctx._musterPlayDay = -1;
  D.musterPlay(G, ctx);
  ok('(M20b) stood-down muster: reset logged once, call + council + commit re-armed',
    (ctx.musterResets || []).length === 1 && ctx.musterResets[0].reason === 'stood-down' &&
    G._calls.sound === 2 && G._calls.council === 2 && G._calls.commit === 4 &&
    (ctx.musterLog || []).length === 2 && ctx.musterLog[1].commit === true &&
    ctx._musterCommitted === true && ctx._musterCouncilDone === true,
    JSON.stringify({ calls: G._calls, resets: ctx.musterResets, log: ctx.musterLog }));
  // (M20c) the day after the reset: no duplicate reset, no re-sound
  // (the re-armed call already sounded; links unchanged, no growth).
  ctx._musterPlayDay = -1;
  D.musterPlay(G, ctx);
  ok('(M20c) day after reset: no duplicate reset, no re-sound',
    (ctx.musterResets || []).length === 1 && G._calls.sound === 2 &&
    (ctx.musterLog || []).length === 2,
    JSON.stringify({ calls: G._calls, resets: ctx.musterResets, logN: (ctx.musterLog || []).length }));
}
{
  // (M21) no reset when the muster never had blades: the call is refused
  // (0 allies) AND the commit finds no volunteers (0 haven). The flags
  // must not reset — a refused call must never re-sound daily.
  const muster = { allies: [], haven: [], day: 62, outfitted: {} };
  const calls = { council: 0, sound: 0, commit: 0 };
  const G = {
    _muster: muster, _calls: calls,
    state: { titans: { omens: { herald: { stage: 2, day: 61 } }, musters: { herald: muster }, slain: {}, cast: null }, scholar: { day: 62 } },
    worldMonsters: function () { return [{ id: 'herald', hp: 700, maxHp: 700 }]; },
    hierarchyState: function () { return [{}, {}]; },
    titanMusterReady: function () { return false; },
    titanWarCouncil: function () { calls.council++; return 'sat'; },
    soundTitanCall: function () { calls.sound++; return null; }, // refused: no allies answer
    titanCommitOwn: function () { calls.commit++; return null; }, // no volunteers: nothing to commit
  };
  const ctx = stubCtx();
  D.musterPlay(G, ctx);
  ok('(M21a) refused call + empty commit: verbs ran once, no reset logged',
    calls.sound === 1 && calls.council === 1 && (ctx.musterResets || []).length === 0,
    JSON.stringify({ calls, resets: ctx.musterResets }));
  ctx._musterPlayDay = -1;
  D.musterPlay(G, ctx);
  ok('(M21b) next day: still no reset, call does NOT re-sound (refusals stay once per link count)',
    (ctx.musterResets || []).length === 0 && calls.sound === 1,
    JSON.stringify({ calls, resets: ctx.musterResets, log: ctx.musterLog }));
}
{
  // (M22) the pure reset predicate: had-blades + now-empty resets; every
  // other shape does not.
  ok('(M22) musterDissolveReset: had blades + empty -> true; never had blades -> false; still has blades -> false',
    D.musterDissolveReset({ hadBlades: true, allies: 0, haven: 0 }) === true &&
    D.musterDissolveReset({ hadBlades: false, allies: 0, haven: 0 }) === false &&
    D.musterDissolveReset({ hadBlades: true, allies: 3, haven: 0 }) === false &&
    D.musterDissolveReset({ hadBlades: true, allies: 0, haven: 2 }) === false &&
    D.musterDissolveReset(null) === false,
    JSON.stringify({}));
}
{
  // (M23) driver source check (r240 precedent): musterPlay is invoked in
  // policy.upkeep and NOT in policy.daily — the F1 move is in the file
  // the panel runs, not just in the prereg.
  const fs = require('fs');
  const src = fs.readFileSync(require.resolve('./journey-deepening-r293-20261128.js'), 'utf8');
  const upStart = src.indexOf('policy.upkeep = function');
  const upEnd = src.indexOf('BASE.upkeep(G, ctx)', upStart);
  const upBody = (upStart >= 0 && upEnd > upStart) ? src.slice(upStart, upEnd) : '';
  const dStart = src.indexOf('policy.daily = function');
  const dEnd = src.indexOf('BASE.daily(G, ctx)', dStart);
  const dBody = (dStart >= 0 && dEnd > dStart) ? src.slice(dStart, dEnd) : '';
  ok('(M23) musterPlay called in policy.upkeep (before BASE.upkeep), not in policy.daily (before BASE.daily)',
    upBody.indexOf('musterPlay(_G, ctx)') !== -1 && dBody.indexOf('musterPlay(') === -1,
    JSON.stringify({ upHas: upBody.indexOf('musterPlay(_G, ctx)') !== -1, dailyHas: dBody.indexOf('musterPlay(') !== -1 }));
}
// ---- (M24)-(M28) R238 F1 STAND-DOWN (driver-only, port of the r242
// scale driver's muster-step rule, herald-scoped) ----
// A muster standing for a titan that has LEFT the world is stood down
// the first morning it is seen absent, so the blades stop eating upkeep
// for a fight that will never come (r237 104602: 11 → 9 over ~35 days).
// The verb fires only when the muster holds blades, the herald is
// absent, and the herald is NOT slain; it never fires mid-fight, and a
// muster that never had blades is untouched.
{
  // (M24) muster formed (1 ally + 2 haven), herald leaves the world:
  // the next musterPlay stands it down — standDown 1x, one log entry
  // with held 'stood-down', before 1/2, after 0/0, no council/call/
  // commit verbs that morning.
  const G = stubGame();
  const ctx = stubCtx();
  D.musterPlay(G, ctx);
  ok('(M24a) first muster: call + council + commit, haven 0 -> 2',
    G._calls.sound === 1 && G._calls.council === 1 && G._calls.commit === 2 &&
    (ctx.musterLog || []).length === 1,
    JSON.stringify({ calls: G._calls, logN: (ctx.musterLog || []).length }));
  G.setPresent(false);
  ctx._musterPlayDay = -1;
  D.musterPlay(G, ctx);
  ok('(M24b) herald absent + muster holds blades: standDown 1x, stood-down entry, before 1/2, after 0/0, no other verbs',
    G._calls.standDown === 1 && (ctx.musterLog || []).length === 2 &&
    ctx.musterLog[1].held === 'stood-down' &&
    ctx.musterLog[1].before.allies === 1 && ctx.musterLog[1].before.haven === 2 &&
    ctx.musterLog[1].after.allies === 0 && ctx.musterLog[1].after.haven === 0 &&
    G._calls.sound === 1 && G._calls.council === 1 && G._calls.commit === 2,
    JSON.stringify({ calls: G._calls, log: ctx.musterLog }));
  // (M24c) the morning after the stand-down: the muster is empty, the
  // F2 reset fires once (flags re-armed), and no second stand-down
  // sounds — the strand is closed within one dawn.
  ctx._musterPlayDay = -1;
  D.musterPlay(G, ctx);
  ok('(M24c) morning after stand-down: F2 reset logged once, no second standDown',
    (ctx.musterResets || []).length === 1 && ctx.musterResets[0].reason === 'stood-down' &&
    G._calls.standDown === 1,
    JSON.stringify({ calls: G._calls, resets: ctx.musterResets }));
}
{
  // (M25) herald SLAIN with a muster standing: no stand-down — victory
  // releases the committed at tbEnd, and the verb itself returns null
  // for a slain titan.
  const G = stubGame();
  const ctx = stubCtx();
  D.musterPlay(G, ctx);
  G.state.titans.slain.herald = true;
  G.setPresent(false);
  ctx._musterPlayDay = -1;
  D.musterPlay(G, ctx);
  ok('(M25) herald slain + muster standing: no standDown, no new log entry',
    G._calls.standDown === 0 && (ctx.musterLog || []).length === 1,
    JSON.stringify({ calls: G._calls, logN: (ctx.musterLog || []).length }));
}
{
  // (M26) herald absent but the muster never had blades (refused call):
  // nothing stands, so no stand-down sounds.
  const G = stubGame();
  const ctx = stubCtx();
  G.setPresent(false);
  D.musterPlay(G, ctx);
  ok('(M26) herald absent + muster empty: no standDown, no log entry',
    G._calls.standDown === 0 && (ctx.musterLog || []).length === 0,
    JSON.stringify({ calls: G._calls, logN: (ctx.musterLog || []).length }));
}
{
  // (M27) fight active on the departure morning: the fight guard runs
  // first — no stand-down sounds mid-fight (the verb itself refuses),
  // and the next morning, fight over, the stand-down fires.
  const G = stubGame();
  const ctx = stubCtx();
  D.musterPlay(G, ctx);
  G.setPresent(false);
  G.tbfight = { over: false };
  ctx._musterPlayDay = -1;
  D.musterPlay(G, ctx);
  ok('(M27a) tbfight active on departure morning: no standDown, no log entry',
    G._calls.standDown === 0 && (ctx.musterLog || []).length === 1,
    JSON.stringify({ calls: G._calls, logN: (ctx.musterLog || []).length }));
  G.tbfight.over = true;
  ctx._musterPlayDay = -1;
  D.musterPlay(G, ctx);
  ok('(M27b) fight over next morning: standDown fires once, stood-down entry logged',
    G._calls.standDown === 1 && (ctx.musterLog || []).length === 2 &&
    ctx.musterLog[1].held === 'stood-down',
    JSON.stringify({ calls: G._calls, log: ctx.musterLog }));
}
{
  // (M28) driver source check: musterPlay calls titanStandDown for an
  // absent herald with blades — the F1 stand-down is in the file the
  // panel runs, not just in the prereg.
  const fs = require('fs');
  const src = fs.readFileSync(require.resolve('./journey-deepening-r293-20261128.js'), 'utf8');
  const mpStart = src.indexOf('function musterPlay(G, ctx)');
  const mpEnd = src.indexOf('// R232 Q2-MARCH', mpStart);
  const mpBody = (mpStart >= 0 && mpEnd > mpStart) ? src.slice(mpStart, mpEnd) : '';
  ok('(M28) musterPlay calls G.titanStandDown(\'herald\') when blades stand and the herald is absent',
    mpBody.indexOf("titanStandDown('herald')") !== -1 && mpBody.indexOf("held: 'stood-down'") !== -1,
    JSON.stringify({ hasVerb: mpBody.indexOf("titanStandDown('herald')") !== -1, hasHeld: mpBody.indexOf("held: 'stood-down'") !== -1 }));
}
{
  // (M29) r243 Q1-PROBE: on the probe seed, the first dawn with blades
  // standing removes the herald from the world census — the probe fires
  // once, the stand-down follows the same morning, and the probe never
  // re-fires. On a non-probe seed the same mornings do nothing (M24
  // covers the wild path: the stand-down fires only when the herald is
  // seen absent, never by staging).
  const G = stubGameProbe();
  const ctx = stubCtx();
  ctx._probeSeed = true;
  D.musterPlay(G, ctx);
  ok('(M29a) probe seed first muster: call + council + commit, 3 blades standing, herald present',
    G._calls.sound === 1 && G._calls.council === 1 && G._calls.commit === 2 &&
    (ctx.musterLog || []).length === 1 &&
    (G.state.worldMonsters || []).some(m => m && m.id === 'herald'),
    JSON.stringify({ calls: G._calls, logN: (ctx.musterLog || []).length }));
  // Next morning: the probe removes the herald BEFORE the present read,
  // so the same morning's stand-down fires on the staged departure.
  G.state.scholar.day = 63;
  ctx._musterPlayDay = -1;
  D.musterPlay(G, ctx);
  ok('(M29b) probe fires once: herald removed from the world census, standDown 1x, probeLog row, stood-down entry, after 0/0',
    (G.state.worldMonsters || []).some(m => m && m.id === 'herald') === false &&
    G._calls.standDown === 1 && (ctx.probeLog || []).length === 1 &&
    (ctx.probeLog[0] || {}).probe === 'staged-departure' &&
    (ctx.probeLog[0] || {}).before.allies === 1 && (ctx.probeLog[0] || {}).before.haven === 2 &&
    (ctx.probeLog[0] || {}).removed === 1 &&
    (ctx.musterLog || []).length === 2 && ctx.musterLog[1].held === 'stood-down' &&
    ctx.musterLog[1].after.allies === 0 && ctx.musterLog[1].after.haven === 0,
    JSON.stringify({ calls: G._calls, probe: ctx.probeLog, log: ctx.musterLog }));
  // Third morning: the probe does not re-fire and no second stand-down
  // sounds — the strand is closed within one dawn.
  G.state.scholar.day = 64;
  ctx._musterPlayDay = -1;
  D.musterPlay(G, ctx);
  ok('(M29c) probe never re-fires: probeLog still 1 row, standDown still 1x',
    (ctx.probeLog || []).length === 1 && G._calls.standDown === 1,
    JSON.stringify({ probeN: (ctx.probeLog || []).length, standDown: G._calls.standDown }));
}
{
  // (M30) r243 Q1-PROBE, negative: the probe does NOT fire on a panel
  // seed (ctx._probeSeed unset) even with blades standing and the herald
  // present — the world census is untouched.
  const G = stubGameProbe();
  const ctx = stubCtx();
  D.musterPlay(G, ctx);
  G.state.scholar.day = 63;
  ctx._musterPlayDay = -1;
  D.musterPlay(G, ctx);
  ok('(M30) non-probe seed: no probeLog, herald still present, no standDown',
    (ctx.probeLog || []).length === 0 &&
    (G.state.worldMonsters || []).some(m => m && m.id === 'herald') &&
    G._calls.standDown === 0,
    JSON.stringify({ probe: ctx.probeLog, standDown: G._calls.standDown }));
}
console.log(`r293 muster proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
