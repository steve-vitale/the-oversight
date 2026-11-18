// test-journey-deepening-r237-muster-20261118.js -- R237 muster-policy proof
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
  const p = require.resolve('./journey-deepening-r237-20261118.js');
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
  const calls = { council: 0, sound: 0, commit: 0 };
  let links = 2;
  let pending = null;
  return {
    _muster: muster, _calls: calls,
    setLinks: function (n) { links = n; },
    state: { titans: { omens: { herald: { stage: 2, day: 61 } }, musters: { herald: muster }, slain: {}, cast: null }, scholar: { day: 62 } },
    worldMonsters: function () { return [{ id: 'herald', hp: 700, maxHp: 700 }]; },
    hierarchyState: function () { return new Array(links).fill({}); },
    titanMusterReady: function () { return (muster.allies.length + muster.haven.length) >= 10; },
    titanWarCouncil: function () { calls.council++; return 'sat'; },
    soundTitanCall: function () { calls.sound++; muster.allies.push({ villageId: 'x', vid: 'a' + calls.sound }); return muster; },
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
  const src = fs.readFileSync(require.resolve('./journey-deepening-r237-20261118.js'), 'utf8');
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
console.log(`r237 muster proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
