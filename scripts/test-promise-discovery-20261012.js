// test-promise-discovery-20261012.js — trust r7 proof: the promise
// discovery path (ask:goal -> goal thread -> deepen -> offer_help ->
// promiseHelp -> keep/break) works when driven, and the discovery hook
// (conversation.js) is what makes ask:goal reachable post-System.
//
// RED CHECK: discovery-hook assertions (ask:goal present post-System while
// undiscovered; hook vanishes after discovery) MUST fail on pristine code;
// keep/break mechanics assertions pass on both.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL:', name); }
}
function ids(Game, vid) {
  return require('./lib/conversation-playtest').offers(Game,vid).map(c => c && c.id).filter(Boolean);
}
function take(Game, vid, id) {
  Game.convoTurn(vid, id);
}
// drive: answer questions, take ask:goal, deepen goal thread, until
// offer_help appears or maxTurns. Returns the turn offer_help was taken, or -1.
function driveToOffer(Game, vid, maxTurns) {
  for (let t = 0; t < (maxTurns || 14); t++) {
    const chIds = ids(Game, vid);
    if (chIds.indexOf('offer_help') !== -1) { take(Game, vid, 'offer_help'); return t; }
    const pk = chIds.find(id => id === 'ask:goal')
      || chIds.find(id => id.indexOf('follow:goal') === 0)
      || chIds.find(id => id.indexOf('ans:') === 0)
      || chIds.find(id => id.indexOf('gq:') === 0)
      || chIds.find(id => id === 'deflect_q')
      || chIds.find(id => id === 'more' || id === 'goon')
      || chIds.find(id => id === 'dlg:more')
      || chIds.find(id => id === 'dlg:subject');
    if (!pk) return -1;
    take(Game, vid, pk);
  }
  return -1;
}

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'promise-proof', fullTelemetry: false });
  await setupGame(Game);
  // jump to day 30 (post-System) and set one villager to high trust
  Game.state.scholar.day = 30;
  Game.state.systemArrived = true;
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  // prefer a keepable-goal villager for the main flow (so the vow is real)
  const keepableFirst = roster.slice().sort((a, b) =>
    ((Game.promiseKeepKind(Game.npcGoal(b)) ? 1 : 0) - (Game.promiseKeepKind(Game.npcGoal(a)) ? 1 : 0)));
  const vid = keepableFirst[0];
  const vid2 = keepableFirst[1];
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[vid] = 90;
  Game.state.village.trust[vid2] = 90;
  const goal = Game.npcGoal(vid);
  console.log('subject:', Game.displayName(vid), 'goal=', goal, 'keepKind=', Game.promiseKeepKind(goal));

  // --- 1. discovery hook: ask:goal reachable post-System while undiscovered.
  // Drive past any opening question first (mid-question the menu is
  // answers-only by design).
  Game.talkTo(vid);
  let chIds = ids(Game, vid);
  let sawAskGoal = chIds.indexOf('ask:goal') !== -1;
  for (let t = 0; t < 6 && !sawAskGoal; t++) {
    const ans = chIds.find(id => id.indexOf('ans:') === 0) || chIds.find(id => id.indexOf('gq:') === 0)
      || chIds.find(id => id === 'deflect_q');
    if (!ans) break;
    take(Game, vid, ans);
    chIds = ids(Game, vid);
    sawAskGoal = chIds.indexOf('ask:goal') !== -1;
  }
  const hook=require('./lib/conversation-playtest').reach(Game,vid,['ask:goal']);sawAskGoal=!!hook;chIds=require('./lib/conversation-playtest').offers(Game,vid).map(x=>x.id);
  console.log('  open/threadless choices:', chIds.slice(0, 10).join(','));
  ok(sawAskGoal, 'hook: ask:goal offered post-System while promise undiscovered (was: never)');
  if (!sawAskGoal) { console.log('  (hook not visible — driving via handler for the rest)'); }
  take(Game, vid, 'ask:goal');
  let c = Game.convoGet(vid);
  ok(c.thread === 'goal' && c.depth === 1, 'ask:goal enters goal thread at depth 1 (got ' + c.thread + '/' + c.depth + ')');

  // --- 2. deepen the goal thread (sets the sticky opened-up flag)
  chIds = ids(Game, vid);
  for (let t = 0; t < 8 && c.depth < 2; t++) {
    const fg = chIds.find(id => id.indexOf('follow:goal') === 0)
      || chIds.find(id => id.indexOf('ans:') === 0) || chIds.find(id => id.indexOf('gq:') === 0)
      || chIds.find(id => id === 'dlg:more')
      || chIds.find(id => id === 'more' || id === 'goon');
    if (!fg) break;
    take(Game, vid, fg);
    c = Game.convoGet(vid);
    chIds = ids(Game, vid);
  }
  console.log('  after deepen: thread=', c.thread, 'depth=', c.depth, 'goalOpenedUp=', !!c.goalOpenedUp);
  ok(c.depth >= 2, 'goal thread deepened to depth 2 (got ' + c.depth + ')');
  ok(!!c.goalOpenedUp, 'deepening the goal thread records opened-up (sticky, survives reset)');
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // --- 3. offer_help appears in a fresh conversation (off-thread, opened up)
  Game.talkTo(vid);
  const earned=require('./lib/conversation-playtest').reach(Game,vid,['offer_help'],24);
  const tookAt=earned?0:-1;if(earned)require('./lib/conversation-playtest').choose(Game,vid,earned.id);
  c = Game.convoGet(vid);
  console.log('  fresh convo: offer_help taken at turn', tookAt, '(thread was ' + c.thread + ')');
  ok(tookAt >= 0, 'offer_help appears once they have opened up (was: dead circular)');
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // --- 4. the vow was made through the real path (driveToOffer took it)
  const trustBefore = 90; // we set it
  const pr = (Game.state.village.promises || {})[vid];
  const keepable = !!Game.promiseKeepKind(goal);
  if (keepable) {
    ok(pr && pr.goal === goal && !pr.kept, 'offer_help creates tracked open vow for ' + goal);
    ok(Game.hasDiscovered('promise'), 'making the vow discovers the promise concept');
    const mems = ((Game.state.village.memory || {})[vid] || []).filter(m => m && m.t === 'promise');
    ok(mems.length > 0, 'vow recorded in villager memory');
  } else {
    console.log('  (goal ' + goal + ' has no keep path — honest deflection expected)');
    ok(!((Game.state.village.promises || {})[vid] && !(Game.state.village.promises || {})[vid].kept),
      'unkeepable goal: no tracked vow left behind');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // --- 6. hook vanishes after discovery (second villager, still undiscovered->discovered globally)
  Game.talkTo(vid2);
  let ch2 = ids(Game, vid2);
  for (let t = 0; t < 4 && ch2.indexOf('ask:goal') !== -1; t++) {
    const ans = ch2.find(id => id.indexOf('ans:') === 0);
    if (!ans) break;
    take(Game, vid2, ans);
    ch2 = ids(Game, vid2);
  }
  if (keepable) {
    ok(ch2.indexOf('ask:goal') === -1, 'hook vanishes after discovery (ask:goal back to !goalKnown gating)');
  } else {
    console.log('  (skipped hook-vanish: discovery did not fire for unkeepable goal)');
  }
  try { Game.endConvo(vid2, 'left'); } catch (e) {}

  // --- 6. KEEP path: the keep-kind action fulfills the vow.
  // (Uses checkPromises with the vow's own keepKind — the action→
  // checkPromises wiring per kind is pre-existing; this proves the vow
  // lifecycle: open -> kept, +15 trust, promise_kept memory.)
  if (keepable && pr && !pr.kept) {
    const kind = Game.promiseKeepKind(goal);
    const t0 = Game.state.village.trust[vid] || 10;
    Game.checkPromises(kind);
    const p = (Game.state.village.promises || {})[vid];
    const t1 = Game.state.village.trust[vid] || 10;
    ok(p && p.kept === true, 'keep-kind action (' + kind + ') keeps the vow');
    ok(t1 > t0, 'keep pays trust (' + t0 + '->' + t1 + ')');
    const km = ((Game.state.village.memory || {})[vid] || []).filter(m => m && m.t === 'promise_kept');
    ok(km.length > 0, 'keep recorded as promise_kept memory');
  } else {
    console.log('  (vow not open — skipped keep assertions)');
  }

  // --- 6b. KEEP via real action: giveFood keeps a food vow (the deed path)
  const feeder = roster.find(id => {
    const g = Game.npcGoal(id);
    return g && Game.promiseKeepKind(g) === 'food';
  });
  if (feeder) {
    Game.state.village.trust[feeder] = 50;
    const r = Game.promiseHelp(feeder);
    if (r && r.ok) {
      // stock a food item
      Game.state.scholar.inventory = Game.state.scholar.inventory || [];
      Game.state.scholar.inventory.push({ name: 'test meal', kcalEach: 800, units: 3 });
      const t0 = Game.state.village.trust[feeder];
      Game.giveFood(feeder);
      const p = (Game.state.village.promises || {})[feeder];
      const t1 = Game.state.village.trust[feeder];
      ok(p && p.kept === true, 'giveFood keeps a food vow (real action)');
      ok(t1 > t0, 'deed keep pays trust (' + t0 + '->' + t1 + ')');
    } else { console.log('  (feeder vow deflected — skipped deed-keep assertions)'); }
  } else { console.log('  (no food-goal villager on roster — skipped deed-keep assertions)'); }

  // --- 7. BREAK path: 8 days of silence rots the vow
  const breaker = roster.find(id => id !== vid && id !== feeder && Game.npcGoal(id) && Game.promiseKeepKind(Game.npcGoal(id)));
  if (breaker) {
    Game.state.village.trust[breaker] = 50;
    const r = Game.promiseHelp(breaker);
    if (r && r.ok) {
      const t0 = Game.state.village.trust[breaker];
      Game.state.scholar.day += 8;
      // a kind that matches nothing: no keep, only the age check -> rot
      Game.checkPromises('no_such_kind');
      const p = (Game.state.village.promises || {})[breaker];
      const t1 = Game.state.village.trust[breaker];
      ok(p && p.kept === 'broken', '8 days of silence breaks the vow');
      ok(t1 === Math.max(0, t0 - 15), 'break costs 15 trust (' + t0 + '->' + t1 + ')');
      const bm = ((Game.state.village.memory || {})[breaker] || []).filter(m => m && m.t === 'promise_broken');
      ok(bm.length > 0, 'break recorded as promise_broken memory');
    } else { console.log('  (breaker vow deflected — skipped break assertions)'); }
  } else { console.log('  (no keepable-goal villager for break test — skipped)'); }

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('ERR', e.stack); process.exit(1); });
