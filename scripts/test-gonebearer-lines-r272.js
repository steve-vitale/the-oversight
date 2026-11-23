#!/usr/bin/env node
// Proof: GONE-BEARER LINES — a dead bearer's joint run is never urged as
// finishable (journey-deepening r272, 2026-11-23).
//
// Wild evidence — deepening r272, seed 105138, Nikos d67: the previous
// scholar (bearer of a live forage run, started d35) died d62 in the wild.
// The successor sits with the holder and the repay want urges a finish
// the successor cannot deliver: "The packs aren't empty. That's the help
// — finish the outing." / "We still need to get this haul home. Come on."
// The opener is false the same way: "We still have the outing to
// finish." (the opening fn returns null — the successor is not a
// companion — so the fallback fires). The run then strands 39 dawns
// (d62–d100) because the only close is the r265 BEARER-END menu verb at
// Haven, which no sitting ever offered. The r269 moot-close covers
// ledger overwrites, not this: the favor is never overwritten, the
// bearer is dead, and the words keep promising a finish.
//
// AFTER (the fix, convo-wants.js): when the run's bearer is a previous
// scholar who is dead or roster-gone (the exact r265 BEARER-END
// condition, via convoRunGoneBearerName), the repay opener + engageBeat
// name the gone bearer and point at closing the books at Haven — for
// both forage_help and water_haul. A LIVING previous bearer still owns
// their outing (finish lines unchanged — the r265 fail-control shape);
// the current bearer is unchanged too.
// Staging mirrors test-bearer-end-r265.js (promise + live run + strand
// to a predecessor + kill) plus a planted repay seed (repay is
// seed-driven; test-convo-broken-favor-resolved-r250 pattern).
// Uses the shared harness (scripts/sim-harness). Exits nonzero on failure.
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const ROOT = path.join(__dirname, '..');

let pass = 0;
function check(name, cond, extra) {
  assert(cond, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const day0 = (Game.state.scholar || {}).day || 0;
  const living = ((Game.state.village || {}).roster || []).filter(id => {
    if (String(id) === String(Game.villagerId)) return false;
    try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return true; }
  });
  const v = Game.state.village || {};
  const home = (Number.isFinite(v.px) && Number.isFinite(v.py)) ? { x: v.px, y: v.py } : { x: 4, y: 4 };
  if (Number.isFinite(v.px) && Number.isFinite(v.py)) { Game.map.px = v.px; Game.map.py = v.py; }
  Game.dayPart = 0;
  function promisedFavor(vid, kind) {
    const f = { id: 'test-' + kind + '-' + String(vid), vid, kind, goal: kind, task: 'test ' + kind,
      state: 'asked', askedDay: day0 - 7, deadline: (day0 - 7) + 2, line: '"test"', short: kind === 'water_haul' ? 'the creek water run' : 'the pantry run' };
    Game.convoStoreFavor(f);
    const r = Game.convoFavorCommit(vid, f);
    return { f, r };
  }
  function placeAdjacent(vid) {
    const vv = Game.state.village || {}, s = Game.state.scholar || {};
    vv.nodePos = vv.nodePos || {}; vv.nodePos[vid] = { nx: home.x, ny: home.y };
    vv.positions = vv.positions || {};
    vv.positions[vid] = { mx: (s.mx ?? 4), my: (s.my ?? 4) };
    vv.npcInside = vv.npcInside || {}; vv.npcInside[vid] = false;
    s.insideHaven = false;
    if (vv.away) delete vv.away[vid];
  }
  function liveRun(vid, f) {
    f.forageRun = { bearer: Game.villagerId, startedDay: day0,
      playerHaul: [], partnerHaul: [],
      forageCount: 1, talked: false, talkCount: 0, returned: false, deliveredKcal: 0 };
    placeAdjacent(vid);
    return f.forageRun;
  }
  function liveWaterRun(vid, f) {
    f.waterRun = { bearer: Game.villagerId, startedDay: day0,
      target: { x: home.x + 1, y: home.y },
      partnerWater: [], returned: false };
    placeAdjacent(vid);
    return f.waterRun;
  }
  function strandRun(vid, f, predecessorId) {
    const p = ((Game.state.village || {}).promises || {})[vid];
    if (p) { p.kept = 'released'; p.inherited = true; }
    f.state = 'asked';
    const run = f.forageRun || f.waterRun;
    if (run) run.bearer = predecessorId;
    return run;
  }
  function killPerson(id) {
    const p = Game.getPerson(id);
    if (p) p.dead = true;
    return p;
  }
  function firstName(id) {
    const p = Game.getPerson(id);
    const nm = (p && p.name) || '';
    return nm.split(' ')[0] || null;
  }
  function repayLines(vid, f) {
    Game.convoPlantSeed(vid, { wantId: 'repay', note: f.short + ' you promised', favorId: f.id });
    const sel = Game.convoSelectWant(vid);
    check('repay selected', !!(sel && sel.id === 'repay'), 'want=' + (sel && sel.id));
    const c = Game.convoGet(vid);
    c.want = sel; c.want.favor = f;
    const opener = sel.def.opener.call(Game, vid) || '';
    const beat = sel.def.engageBeat.call(Game, vid) || '';
    return { opener, beat };
  }
  function endSit(vid) { try { if (Game.endConvo) Game.endConvo(vid, 'done'); } catch (e) {} }
  return { Game, day0, living, home, promisedFavor, liveRun, liveWaterRun, strandRun, killPerson, firstName, repayLines, endSit };
}

async function main() {
  const predecessor = (t) => t.living[1] || t.living[0];

  // A: forage run, bearer DEAD — the words name the gone bearer.
  {
    const t = await freshGame(2721);
    const Game = t.Game;
    const vid = t.living[0];
    const pred = predecessor(t);
    const first = t.firstName(pred);
    const c = t.promisedFavor(vid, 'forage_help');
    check('A0 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    t.killPerson(pred);
    check('A0b bearer is dead', !!(Game.getPerson(pred) || {}).dead);
    check('A0c bearer has a first name', !!first, 'first=' + first);
    const { opener, beat } = t.repayLines(vid, c.f);
    check('A1 opener names the gone bearer', opener.includes(first), 'opener=' + JSON.stringify(opener));
    check('A2 opener points at closing the books at Haven', /close the books at Haven/i.test(opener), 'opener=' + JSON.stringify(opener));
    check('A3 opener does NOT say the outing can still be finished', !/still have the outing to finish/i.test(opener), 'opener=' + JSON.stringify(opener));
    check('A4 engageBeat names the gone bearer', beat.includes(first), 'beat=' + JSON.stringify(beat));
    check('A5 engageBeat points at closing the books at Haven', /close the books at Haven|they close at Haven|close it at Haven/i.test(beat), 'beat=' + JSON.stringify(beat));
    check('A6 engageBeat does NOT say finish the outing', !/finish the outing/i.test(beat), 'beat=' + JSON.stringify(beat));
    check('A7 engageBeat does NOT say get this haul home', !/get this haul home/i.test(beat), 'beat=' + JSON.stringify(beat));
    check('A8 engageBeat does NOT say unload what we hauled', !/unload what we hauled/i.test(beat), 'beat=' + JSON.stringify(beat));
    t.endSit(vid);
  }

  // B: water run, bearer DEAD — same honest words.
  {
    const t = await freshGame(2722);
    const Game = t.Game;
    const vid = t.living[0];
    const pred = predecessor(t);
    const first = t.firstName(pred);
    const c = t.promisedFavor(vid, 'water_haul');
    check('B0 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveWaterRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    t.killPerson(pred);
    const { opener, beat } = t.repayLines(vid, c.f);
    check('B1 opener names the gone bearer', opener.includes(first), 'opener=' + JSON.stringify(opener));
    check('B2 opener points at closing the books at Haven', /close the books at Haven/i.test(opener), 'opener=' + JSON.stringify(opener));
    check('B3 opener does NOT say the creek trip can still be finished', !/still have a creek trip to finish/i.test(opener), 'opener=' + JSON.stringify(opener));
    check('B4 engageBeat names the gone bearer', beat.includes(first), 'beat=' + JSON.stringify(beat));
    check('B5 engageBeat points at closing the books at Haven', /close the books at Haven|they close at Haven|close it at Haven/i.test(beat), 'beat=' + JSON.stringify(beat));
    check('B6 engageBeat does NOT say finish the haul', !/finish the haul/i.test(beat), 'beat=' + JSON.stringify(beat));
    check('B7 engageBeat does NOT say get this water home', !/get this water home/i.test(beat), 'beat=' + JSON.stringify(beat));
    t.endSit(vid);
  }

  // C (fail-control): a LIVING previous bearer still owns the outing —
  // the finish lines are unchanged.
  {
    const t = await freshGame(2723);
    const Game = t.Game;
    const vid = t.living[0];
    const pred = predecessor(t);
    const c = t.promisedFavor(vid, 'forage_help');
    t.liveRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    check('C0 bearer is alive', !(Game.getPerson(pred) || {}).dead);
    const { opener, beat } = t.repayLines(vid, c.f);
    check('C1 living-bearer opener still says the outing can be finished', /still have the outing to finish/i.test(opener), 'opener=' + JSON.stringify(opener));
    check('C2 living-bearer engageBeat still urges the finish', /finish the outing|get this haul home|unload what we hauled/i.test(beat), 'beat=' + JSON.stringify(beat));
    check('C3 living-bearer lines do NOT name a gone bearer', !/who's gone|close the books/i.test(beat + ' ' + opener), 'beat=' + JSON.stringify(beat));
    t.endSit(vid);
  }

  // D (control): the CURRENT bearer is unchanged — finish lines stand.
  {
    const t = await freshGame(2724);
    const Game = t.Game;
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    t.liveRun(vid, c.f);
    const { opener, beat } = t.repayLines(vid, c.f);
    check('D1 current-bearer opener still says the outing can be finished', /still have the outing to finish|Packs filling|Ready to forage|get this into the pantry/i.test(opener), 'opener=' + JSON.stringify(opener));
    check('D2 current-bearer engageBeat still urges the finish', /finish the outing|get this haul home|unload what we hauled/i.test(beat), 'beat=' + JSON.stringify(beat));
    t.endSit(vid);
  }

  // E (source): the helper + branches exist; the old finish lines stand
  // for the live-bearer path.
  {
    const src = fs.readFileSync(path.join(ROOT, 'src/js/convo-wants.js'), 'utf8');
    check('E1 helper exists', /convoRunGoneBearerName\(run\)/.test(src));
    check('E2 opener checks the gone bearer (water)', /convoRunGoneBearerName\(favor\.waterRun\)/.test(src));
    check('E3 opener checks the gone bearer (forage)', /convoRunGoneBearerName\(favor\.forageRun\)/.test(src));
    check('E4 engageBeat gone-bearer pool (water)', /repay:help:water:gonebearer/.test(src));
    check('E5 engageBeat gone-bearer pool (forage)', /repay:help:forage:gonebearer/.test(src));
    check('E6 live-bearer finish lines still present', src.includes('finish the outing') && src.includes('finish the haul'));
  }

  console.log(`\n${pass} passed`);
}
main().catch(e => { console.error('CRASH', e && e.stack || e); process.exit(1); });
