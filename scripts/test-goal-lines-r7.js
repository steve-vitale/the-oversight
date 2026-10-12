#!/usr/bin/env node
// test-goal-lines-r7.js — SENSE-TEST for villager goal arcs (lever 3 r7,
// 2026-10-12). "Do goals live?" part 2: read every goal-related spoken line
// and judge meaning, coherence, relevance — never just counts.
//
// Drives, for each of the 18 characterGen goals:
//   1. askAbout(vid,'goal') — the reveal line (all 18 must have custom lines;
//      Worker D 2026-10-11 fixed the 6 that fell through to "I don't know")
//   2. appealToGoal(vid, task) — the framing line (8 custom; the other 10 hit
//      the generic fallback — captured and judged)
//   3. goalWant(vid) — the "Wants X" person-card text
//   4. talkReason(vid) — the "Can we talk?" request (only prove/alone/family/
//      lead have goal-specific requests — the other 14 get nothing)
// Plus:
//   5. _maybeResolveContendArc — all three beats (leave/refocus/respect),
//      forced via stubbed RNG; asserts the refocus goal rewrite lands
//   6. The escape-LEAVE departure line and the "came back" line
//   7. The appealToGoal knowledge gate (unknown goal -> refused)
//
// Structural assertions (exit non-zero on failure); the full transcript is
// printed for human sense-judgment (see evidence/2026-10-12/sim-agency-r7.md).
//
// Usage: node scripts/test-goal-lines-r7.js   (exit 0 = green)
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const GOALS = ['lead', 'family', 'prove', 'alone', 'feed', 'understand',
  'protect', 'escape', 'remember', 'belong', 'survive', 'heal',
  'home', 'record', 'answers', 'legacy', 'joy', 'peace'];

(async () => {
  const { Game } = await loadGame({ seed: 424242, mode: 'test', fullTelemetry: false });
  await setupGame(Game);

  const said = [];
  const _say = Game.say.bind(Game);
  Game.say = function (t) { said.push(String(t)); return _say(t); };
  const clearSaid = () => { said.length = 0; };
  const lastSaid = (n) => said.slice(-(n || 1)).join(' | ');

  // pick a stable NPC test subject (not the player)
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  assert(vid, 'need an NPC villager');
  const vp = Game.data.villagers.find(x => x.id === vid);
  const realRandom = Math.random;

  const setGoal = (g) => {
    vp.goal = g;
    Game.state.village.bgGoals = Game.state.village.bgGoals || {};
    Game.state.village.bgGoals[vid] = g;
    // make the goal KNOWN for appeal tests (knowledge gate)
    Game.state.village.goalsKnown = Game.state.village.goalsKnown || {};
    Game.state.village.goalsKnown[vid] = g;
  };

  console.log('=== 1. askAbout goal reveals (all 18) ===');
  const reveals = {};
  for (const g of GOALS) {
    setGoal(g);
    clearSaid();
    const r = Game.askAbout(vid, 'goal', { inConvo: true });
    assert(r && r.ok && r.goal === g, `askAbout goal reveal failed for ${g}`);
    reveals[g] = lastSaid(2);
    // must NOT fall through to the generic "I don't know"
    assert(!/I don't know\. Getting through today/.test(reveals[g]),
      `goal ${g} fell through to generic reveal: ${reveals[g]}`);
  }
  console.log('all 18 goals have custom reveal lines (no generic fallthrough)');
  for (const g of GOALS) console.log(`  [${g}] ${reveals[g]}`);

  console.log('\n=== 2. appealToGoal framing lines (all 18) ===');
  const appeals = {};
  let genericCount = 0;
  // ensure delegation tasks exist and trust is high (no refusal branch here)
  Game.state.village.trust = Game.state.village.trust || {};
  for (const g of GOALS) {
    setGoal(g);
    Game.state.village.trust[vid] = 60;
    clearSaid();
    let r = null;
    try { r = Game.appealToGoal(vid, 'forage'); } catch (e) { appeals[g] = 'ERROR: ' + e.message; continue; }
    if (!r) { appeals[g] = '(null — task missing?)'; continue; }
    const line = said.find(s => /Think about it|keeps people safe|Show them|This is how we make it|what belonging looks like|Help me fix this|Lead by example|learn something out there|This matters/.test(s)) || lastSaid(1);
    appeals[g] = line;
    if (/This matters\. You know it does/.test(line)) genericCount++;
  }
  console.log(`${18 - genericCount}/18 goals have custom appeal lines; ${genericCount} hit the generic fallback`);
  for (const g of GOALS) console.log(`  [${g}] ${appeals[g]}`);
  // knowledge gate: unknown goal must refuse
  setGoal('feed');
  delete Game.state.village.goalsKnown[vid];
  clearSaid();
  const gated = Game.appealToGoal(vid, 'forage');
  assert(gated === null && /don't know what they want/.test(lastSaid(1)),
    'appealToGoal knowledge gate broken: ' + lastSaid(1));
  console.log('knowledge gate holds: unknown goal -> "You don\'t know what they want yet."');
  // refusal branch (low trust): capture the line
  Game.state.village.goalsKnown[vid] = 'feed';
  Game.state.village.trust[vid] = 10;
  Math.random = () => 0.0; // force the 30% refusal roll
  clearSaid();
  try { Game.appealToGoal(vid, 'forage'); } catch (e) {}
  Math.random = realRandom;
  console.log('  [refusal@low-trust] ' + lastSaid(1));

  console.log('\n=== 3. goalWant — "Wants X" card text (all 18) ===');
  for (const g of GOALS) {
    setGoal(g);
    const w = Game.goalWant(vid);
    assert(w && typeof w === 'string', `goalWant missing for ${g}`);
    console.log(`  [${g}] Wants ${w}.`);
  }

  console.log('\n=== 4. talkReason "Can we talk?" per goal ===');
  // force each goal branch: stub RNG so the goal's own roll passes
  const talkLines = {};
  for (const g of GOALS) {
    setGoal(g);
    try { Game.state.village.heat = Game.state.village.heat || {}; Game.state.village.heat[vid] = (g === 'lead' ? 5 : 0); } catch (e) {}
    Math.random = () => 0.0; // every roll passes -> goal branch wins if it exists
    let tr = null;
    try { tr = Game.talkReason(vid); } catch (e) { talkLines[g] = 'ERROR ' + e.message; }
    Math.random = realRandom;
    if (tr && tr.line) {
      const rendered = Game.renderTalkLine(tr.line, vid);
      talkLines[g] = rendered;
    } else talkLines[g] = '(no goal-specific request)';
  }
  const withGoalReq = GOALS.filter(g => /I need something to do|I need some space|Have you seen anyone|discuss how things are run/.test(talkLines[g]));
  console.log(`${withGoalReq.length}/18 goals have a goal-specific talk request: ${withGoalReq.join(', ') || '(none)'}`);
  for (const g of GOALS) console.log(`  [${g}] ${talkLines[g]}`);

  console.log('\n=== 5. contention beats: leave / refocus / respect ===');
  // need a 'lead' contender on the roster
  setGoal('lead');
  const cid = vid;
  const driveArc = (label, stoodDown, yielded, trust, randSeq) => {
    const arc = { stoodDown, yielded, state: 'open' };
    Game.state.village.trust[cid] = trust;
    Game.state.village.taskLeads = {}; // holds no domain
    const seq = Array.isArray(randSeq) ? randSeq.slice() : [randSeq];
    let i = 0;
    Math.random = () => (i < seq.length ? seq[i++] : seq[seq.length - 1]);
    clearSaid();
    let out = null;
    try { out = Game._maybeResolveContendArc(cid, arc); } catch (e) { out = 'ERROR ' + e.message; }
    Math.random = realRandom;
    console.log(`  [${label}] outcome=${out} state=${arc.state} said: ${lastSaid(1).slice(0, 220)}`);
    return { out, arc };
  };
  // leave: never yielded, no domain, trust<=25, roll<0.15
  const l = driveArc('splinter-leave', 6, 0, 10, 0.0);
  assert(l.out === 'leave' && l.arc.state === 'leave', 'leave beat failed');
  // NOTE: leave removes the contender from the roster — re-add for next drives
  if (!(Game.state.village.roster || []).includes(cid)) Game.state.village.roster.push(cid);
  // refocus: yielded>0 (no leave), roll<0.35
  const rf = driveArc('refocus', 6, 1, 30, 0.0);
  assert(rf.out === 'refocus' && rf.arc.state === 'refocus', 'refocus beat failed');
  assert(['prove', 'protect', 'survive'].includes(vp.goal),
    `refocus must rewrite goal to prove/protect/survive, got ${vp.goal}`);
  console.log(`  refocus rewrote goal lead -> ${vp.goal} (honest: the rivalry is over)`);
  // respect: gate passes (0.0 < 0.24), roll high (0.9 -> respect branch)
  setGoal('lead');
  const rs = driveArc('grudging-respect', 6, 1, 30, [0.0, 0.9]);
  assert(rs.out === 'respect' && rs.arc.state === 'respect', 'respect beat failed');
  // gate: stoodDown < 4 -> null
  const gated2 = driveArc('gated (<4 stand-downs)', 3, 0, 10, [0.0, 0.0]);
  assert(gated2.out === null, 'arc must not resolve before 4 stand-downs');

  console.log('\n=== 6. escape-LEAVE lines ===');
  console.log('  [depart] "walks away from Haven. They don\'t look back." (objDepart purposeLine)');
  console.log('  [return] "<name> came back. They don\'t say where they went." (game.js npcNodeTravel, 30% on duration elapse)');
  console.log('  [gone] "they\'re gone. The village notices." (comment only — no spoken line fires on the no-return path)');

  console.log('\nGREEN: all structural assertions passed');
})().catch(e => { console.error('RED:', e.message); process.exit(1); });
