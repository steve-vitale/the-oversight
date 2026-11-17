// test-journey-deepening-r227-muster-20261117.js -- R227 muster-policy proof
// (runs the REAL r227 driver musterDecision/musterPlay on synthetic stubs;
// no game needed).
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
  const p = require.resolve('./journey-deepening-r227-20261117.js');
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
console.log(`r227 muster proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
