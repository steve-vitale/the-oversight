#!/usr/bin/env node
// PROOF (2026-10-23 — Steve: "Gossip that never surfaces ever is an issue
// somewhere").
//
// Contest-outcome gossip (contest_won / contest_survived / contest_died)
// seeds fine and spreads fine (establishment r19: 1 -> 7 hearers in 2 days),
// but NEVER surfaces: the ask:gossip serving path buried it at the very end
// of the aboutOther walk-down — non-rumor verbs sort last, behind the 50%
// npcGossipAbout branch, the 45% dark-gossip branch, every rumor verb, and
// each day's ambient churn — and the entry died on the 3-day fuse unserved.
// r19 measured zero surfacing across 4 seeds: seed ✓ spread ✓ serve ✗.
//
// RED (pre-fix): with realistic ambient churn in the pool, 40 fresh-sitting
//   asks serve pool entries but NEVER the contest entry (each sitting
//   re-serves from the top; the walk-down never reaches the buried entry).
// GREEN (post-fix): unserved contest news jumps the queue (after scandals
//   about you, before the rumor walk-down) — the entry surfaces within a
//   few asks, ahead of rumor verbs.
//
// Drives the REAL path: Game._cxGossip -> ambient churn -> Game.askAbout.
// Served entries are read from askAbout's REAL return value (ret.gossip),
// not from parsing say output. The serving logic itself is not harnessed.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const fails = [];
  const ok = (cond, label) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + label); if (!cond) fails.push(label); };
  const isContest = (a) => a === 'contest_won' || a === 'contest_survived' || a === 'contest_died';

  const roster = ((Game.state.village || {}).roster || []).filter(id => {
    try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return false; }
  });
  const me = (() => { try { return Game.villagerId; } catch (e) { return null; } })();
  const others = roster.filter(id => id !== me);
  if (others.length < 4) { console.log('SKIP: need 4+ living non-player villagers'); process.exit(2); }
  const winner = others[0], teller = others[1];
  const day = (Game.state.scholar || {}).day || 1;

  // silence say; we read ret.gossip
  Game.say = () => {};

  // 1. seed the contest entry, heard by the teller, fresh (fuse not a factor)
  Game._cxGossip('won', winner, 'The Pit');
  const g = ((Game.state.village || {}).gossip || [])
    .find(x => x.action === 'contest_won' && x.dims && x.dims.who === winner);
  ok(!!g, 'contest_won entry seeded');
  if (!g) { console.log('ABORT: no entry'); process.exit(2); }
  g.heard = [teller];
  g.day = day;

  // 2. realistic ambient churn: 10 entries over the last 2 days, including
  //    rumor verbs (which sort ahead of non-rumor verbs in the walk-down)
  const churnActions = ['departure', 'return', 'stingy', 'generous', 'rescue',
    'departure', 'stingy', 'return', 'generous', 'departure'];
  churnActions.forEach((action, i) => {
    const who = others[(i + 2) % others.length];
    Game.state.village.gossip.push({
      action, dims: { who }, heard: [teller],
      distortion: 0, day: day - (i % 2),
      partKey: day + ':churn:' + i,
    });
  });
  const poolSize = Game.state.village.gossip.filter(x => (x.heard || []).includes(teller)).length;
  ok(poolSize >= 11, 'teller hears contest entry + 10 churn entries (' + poolSize + ')');

  // 3. ask fresh sittings (one ask per conversation, as in real play).
  //    Sanity: pool entries ARE served (asks reach the heard pool).
  //    The bug: the contest entry never is.
  let poolServes = 0, contestServes = 0, firstContestAsk = -1;
  for (let i = 0; i < 40; i++) {
    let ret = null;
    try { ret = Game.askAbout(teller, 'gossip'); } catch (e) { /* ignore */ }
    const served = ret && ret.gossip;
    if (served) {
      poolServes++;
      if (isContest(served.action)) {
        contestServes++;
        if (firstContestAsk < 0) firstContestAsk = i + 1;
      }
    }
  }
  ok(poolServes > 0, 'asks reach the heard pool (' + poolServes + '/40 pool serves)');
  ok(contestServes > 0, 'contest entry surfaces within 40 asks (RED: 0 — buried at walk-down end)');
  if (firstContestAsk > 0) console.log('   first contest serve on ask #' + firstContestAsk);

  // 4. the entry is still alive (not expired) — proves serving, not the fuse,
  //    was the failure mode
  const alive = ((Game.state.village || {}).gossip || []).includes(g);
  ok(alive, 'contest entry still in the pool (3-day fuse not the cause)');

  // 5. salience order: the FIRST pool serve after seeding fresh contest news
  //    alongside a fresh rumor verb should be the contest news, not the rumor
  Game._cxGossip('survived', winner, 'The Maw');
  const g2 = ((Game.state.village || {}).gossip || [])
    .find(x => x.action === 'contest_survived' && x.dims && x.dims.who === winner);
  if (g2) { g2.heard = [teller]; g2.day = day; }
  Game.state.village.gossip.push({
    action: 'stingy', dims: { who: others[2] }, heard: [teller],
    distortion: 0, day, partKey: day + ':churn:stingy-fresh',
  });
  let firstPoolAction = null;
  for (let i = 0; i < 40 && !firstPoolAction; i++) {
    let ret = null;
    try { ret = Game.askAbout(teller, 'gossip'); } catch (e) {}
    if (ret && ret.gossip) firstPoolAction = ret.gossip.action;
  }
  ok(firstPoolAction && isContest(firstPoolAction),
    'contest news outranks rumor verbs (first pool serve: ' + firstPoolAction + ')');

  console.log(fails.length ? '\nRESULT: FAIL (' + fails.length + ')' : '\nRESULT: ALL GREEN');
  process.exit(fails.length ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
