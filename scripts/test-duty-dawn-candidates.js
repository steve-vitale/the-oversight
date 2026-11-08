#!/usr/bin/env node
// test-duty-dawn-candidates.js — VILLAGER-BRAIN Phase 6 (OVE-60 + pick):
// duty candidates from believed village needs join the dawn scorer, and a
// top-scoring DUTY can win the dawn commitment (align → real errand).
//
// Proves:
//   1. Believed-low pantry → DUTY forage/cook appear in dutyFeedCands and
//      in the dawn scored candidate list (vbrainFeedExtras / vbrainScorePick).
//   2. Believed-full pantry → no DUTY ads.
//   3. Assigned villager (standing assignTask) → no competing DUTY ads.
//   4. Failing control: vbrainDutyIgnoreBelief strips the belief hook →
//      no DUTY ads even when believed pantry is low.
//   5. Top-scoring DUTY forage → commit DUTY + align FORAGE (materialize
//      stays core; OVE-36 honesty). No assignTask write.
//   6. Failing control: vbrainDisableDutyPick → DUTY scores but never commits.
//
// Usage: node scripts/test-duty-dawn-candidates.js
// Exit 0 = pass, 1 = fail, 2 = setup skip. No repo writes.
'use strict';
const path = require('path');
const repo = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(repo, 'scripts', 'sim-harness'));

const SEED = 20261108;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function out(o) { console.log(JSON.stringify(o)); }

function plantLowBelief(Game, vid, day) {
  const v = Game.state.village;
  v.resourceBelief = v.resourceBelief || {};
  v.resourceBelief[vid] = {
    pantryKcal: 800,
    pantryDays: 0.4,
    waterClean: 2000,
    waterDirty: 0,
    waterSupply: 2000,
    waterDays: 10,
    rosterN: (v.roster || []).length,
    seenDay: day,
  };
  Game._resourceBeliefForceStale = Game._resourceBeliefForceStale || {};
  Game._resourceBeliefForceStale[vid] = true;
}

function plantFullBelief(Game, vid, day) {
  const v = Game.state.village;
  v.resourceBelief = v.resourceBelief || {};
  v.resourceBelief[vid] = {
    pantryKcal: 20000,
    pantryDays: 10,
    waterClean: 2000,
    waterDirty: 0,
    waterSupply: 2000,
    waterDays: 10,
    rosterN: (v.roster || []).length,
    seenDay: day,
  };
  Game._resourceBeliefForceStale = Game._resourceBeliefForceStale || {};
  Game._resourceBeliefForceStale[vid] = true;
}

function dutyKinds(cands) {
  return (cands || [])
    .filter(c => c && c.kind === 'DUTY')
    .map(c => c.dutyTask || '?');
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);

  if (typeof Game.dutyFeedCands !== 'function' || typeof Game.vbrainFeedExtras !== 'function' ||
      typeof Game.objResourceBelief !== 'function') {
    out({ skip: 'duty dawn candidate API missing' });
    process.exit(2);
  }

  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  try { Game.stockPantry(20000, 'test'); } catch (e) {}
  v.water = v.water || {};
  v.water.clean = 2000;
  v.water.dirty = 0;
  v.burnHistory = [2000, 2000, 2000, 2000, 2000, 2000, 2000];
  Game.state.scholar.day = 20;
  const day = Game.state.scholar.day;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 2) { out({ skip: 'roster<2' }); process.exit(2); }

  for (const id of roster) {
    try {
      const n = Game.npcNeeds(id);
      if (n) { n.hunger = 10; n.energy = 80; n.social = 40; n.fear = 10; }
    } catch (e) {}
    v.trust = v.trust || {}; v.trust[id] = 80;
    v.sick = v.sick || {}; delete v.sick[id];
    v.assignments = v.assignments || {};
    delete v.assignments[id];
    try { Game.npcSetNode(id, hx, hy); } catch (e) {}
    try { Game.npcSetInside(id, true); } catch (e) {}
  }

  const vid = roster[0];
  const buddy = roster[1];

  console.log('== believed-low pantry surfaces DUTY forage/cook ==');
  {
    plantLowBelief(Game, vid, day);
    const bel = Game.objResourceBelief(vid) || {};
    check('low belief: not unknown', bel.unknown === false, JSON.stringify(bel));
    check('low belief: pantryKcal low', bel.pantryKcal === 800, 'kcal=' + bel.pantryKcal);
    check('low belief: fromLive false (stale)', bel.fromLive === false);

    const feed = Game.dutyFeedCands(vid) || [];
    const tasks = dutyKinds(feed);
    check('low: feed has DUTY forage', tasks.indexOf('forage') >= 0, JSON.stringify(tasks));
    check('low: feed has DUTY cook', tasks.indexOf('cook') >= 0, JSON.stringify(tasks));
    check('low: forage cand has vbrainSrc duty',
      !!(feed.find(c => c.dutyTask === 'forage' && c.vbrainSrc === 'duty')));
    check('low: forage has believed_need consideration',
      !!(feed.find(c => c.dutyTask === 'forage' &&
        (c.considerations || []).some(x => x.id === 'believed_need'))));
    check('low: forage has competence consideration',
      !!(feed.find(c => c.dutyTask === 'forage' &&
        (c.considerations || []).some(x => x.id === 'competence'))));

    const cands = [{ kind: 'HAVEN_CHORE', w: 1.4, chore: 'fire' }];
    Game.vbrainFeedExtras(vid, cands, hx, hy);
    check('vbrainFeedExtras appends DUTY',
      cands.some(c => c.kind === 'DUTY' && c.dutyTask === 'forage'),
      JSON.stringify(cands.map(c => c.kind + (c.dutyTask ? ':' + c.dutyTask : ''))));

    // Dawn log via objPick.
    const o = Game.objOf(vid);
    o.kind = 'idle'; o.state = 'idle';
    const before = (Game.vbrainLogs() || []).length;
    Game.objPick(vid, hx, hy);
    const logs = Game.vbrainLogs() || [];
    const last = logs.length > before ? logs[logs.length - 1] : Game.vbrainLastLog(vid);
    const scored = (last && last.candidates) || [];
    const dutyScored = scored.filter(c => c.kind === 'DUTY');
    check('dawn log has DUTY candidate', dutyScored.length >= 1,
      JSON.stringify({ pick: last && last.pick, kinds: scored.map(c => c.kind + (c.dutyTask ? ':' + c.dutyTask : '')) }));
    check('dawn DUTY forage score > 0',
      !!(dutyScored.find(c => c.dutyTask === 'forage' && c.score > 0)),
      JSON.stringify(dutyScored.find(c => c.dutyTask === 'forage')));
    check('dawn DUTY feeder note',
      !!(dutyScored.find(c => (c.considerations || []).some(x => x.id === 'feeder' && x.note === 'duty'))));
  }

  console.log('== believed-full pantry: no DUTY ads ==');
  {
    plantFullBelief(Game, vid, day);
    const bel = Game.objResourceBelief(vid) || {};
    check('full belief: pantry not low', bel.pantryKcal >= 4000 && bel.pantryDays >= 3,
      JSON.stringify({ kcal: bel.pantryKcal, days: bel.pantryDays }));
    const feed = Game.dutyFeedCands(vid) || [];
    check('full: feed has no DUTY', feed.length === 0, JSON.stringify(dutyKinds(feed)));
  }

  console.log('== assigned villager: standing order honored ==');
  {
    plantLowBelief(Game, buddy, day);
    // Direct assignment write — mirrors a committed assignTask without
    // needing face-to-face / obedience UI path in the harness.
    v.assignments = v.assignments || {};
    v.assignments[buddy] = { task: 'patrol', assignedDay: day, assignedPart: 0, via: 'test' };
    check('buddy has standing assignment', !!(Game.assignmentFor(buddy) || {}).task);
    const feed = Game.dutyFeedCands(buddy) || [];
    check('assigned: no DUTY ads against standing order', feed.length === 0,
      JSON.stringify(dutyKinds(feed)));
    delete v.assignments[buddy];
    const feedFree = Game.dutyFeedCands(buddy) || [];
    check('unassigned again: DUTY ads return',
      dutyKinds(feedFree).indexOf('forage') >= 0, JSON.stringify(dutyKinds(feedFree)));
  }

  console.log('== failing control: belief hook removed ==');
  {
    plantLowBelief(Game, vid, day);
    const withHook = Game.dutyFeedCands(vid) || [];
    check('control setup: hook produces DUTY', dutyKinds(withHook).indexOf('forage') >= 0,
      JSON.stringify(dutyKinds(withHook)));
    Game.vbrainDutyIgnoreBelief = true;
    const stripped = Game.dutyFeedCands(vid) || [];
    check('control: ignore-belief → no DUTY', stripped.length === 0,
      JSON.stringify(dutyKinds(stripped)));
    const cands = [{ kind: 'HAVEN_CHORE', w: 1.4, chore: 'fire' }];
    Game.vbrainFeedExtras(vid, cands, hx, hy);
    check('control: vbrainFeedExtras has no DUTY',
      !cands.some(c => c.kind === 'DUTY'),
      JSON.stringify(cands.map(c => c.kind)));
    Game.vbrainDutyIgnoreBelief = false;
    const restored = Game.dutyFeedCands(vid) || [];
    check('control restored: DUTY returns', dutyKinds(restored).indexOf('forage') >= 0,
      JSON.stringify(dutyKinds(restored)));
  }

  console.log('== top-scoring DUTY wins dawn commit + align ==');
  {
    plantLowBelief(Game, vid, day);
    delete (v.assignments || {})[vid];
    const duty = (Game.dutyFeedCands(vid) || []).find(c => c.dutyTask === 'forage');
    check('pick setup: forage DUTY present', !!(duty && duty.w > 0), JSON.stringify(duty));
    const cands = [{ kind: 'HAVEN_CHORE', w: 0.01, chore: 'fire' }, duty].filter(Boolean);
    try {
      const br = v.vbrain;
      if (br && br.commit) delete br.commit[vid];
    } catch (e) {}
    const mat = Game.vbrainScorePick(vid, cands, { rng: () => 0 });
    const log = Game.vbrainLastLog(vid);
    const commit = Game.vbrainCommit(vid);
    check('pick: materialize stays core HAVEN_CHORE', mat && mat.kind === 'HAVEN_CHORE',
      JSON.stringify(mat));
    check('pick: log override duty_top_score', log && log.override === 'duty_top_score',
      JSON.stringify({ override: log && log.override, pick: log && log.pick }));
    check('pick: log pick DUTY', log && log.pick === 'DUTY',
      JSON.stringify({ pick: log && log.pick }));
    check('pick: commit kind DUTY', commit && commit.kind === 'DUTY',
      JSON.stringify(commit));
    check('pick: commit dutyTask forage', commit && commit.dutyTask === 'forage',
      JSON.stringify(commit));
    check('pick: commit vbrainSrc duty', commit && commit.vbrainSrc === 'duty',
      JSON.stringify(commit));
    // Align maps commitment → real FORAGE objective (no assignTask).
    const o = {
      kind: 'HAVEN_CHORE', purpose: 'chore', indoor: true, state: 'indoor',
      chore: 'fire', tx: hx, ty: hy, tightness: 0, partsLeft: 2,
    };
    Game.vbrainAlignObjective(vid, o, hx, hy);
    check('align: kind FORAGE', o.kind === 'FORAGE', JSON.stringify(o));
    check('align: purpose forage', o.purpose === 'forage', JSON.stringify(o));
    check('align: outdoor ready', o.indoor === false && o.state === 'ready', JSON.stringify(o));
    check('align: left home tile', !(o.tx === hx && o.ty === hy), JSON.stringify({ tx: o.tx, ty: o.ty, hx, hy }));
    check('align: no assignment written',
      !((v.assignments || {})[vid] && (v.assignments || {})[vid].task),
      JSON.stringify((v.assignments || {})[vid]));
  }

  console.log('== failing control: pick hook removed ==');
  {
    plantLowBelief(Game, vid, day);
    delete (v.assignments || {})[vid];
    const duty = (Game.dutyFeedCands(vid) || []).find(c => c.dutyTask === 'forage');
    const cands = [{ kind: 'HAVEN_CHORE', w: 0.01, chore: 'fire' }, duty].filter(Boolean);
    Game.vbrainDisableDutyPick = true;
    try {
      const br = v.vbrain;
      if (br && br.commit) delete br.commit[vid];
    } catch (e) {}
    Game.vbrainScorePick(vid, cands, { rng: () => 0 });
    const log = Game.vbrainLastLog(vid);
    const commit = Game.vbrainCommit(vid);
    const scoredDuty = ((log && log.candidates) || []).some(c => c.kind === 'DUTY');
    check('pick-control: DUTY still scored in log', scoredDuty,
      JSON.stringify((log && log.candidates || []).map(c => c.kind)));
    check('pick-control: no duty_top_score override', !(log && log.override === 'duty_top_score'),
      JSON.stringify({ override: log && log.override, pick: log && log.pick }));
    check('pick-control: commit is not DUTY', !(commit && commit.kind === 'DUTY'),
      JSON.stringify(commit));
    Game.vbrainDisableDutyPick = false;
    // Restore: same cand list wins DUTY again.
    try {
      const br = v.vbrain;
      if (br && br.commit) delete br.commit[vid];
    } catch (e) {}
    const duty2 = (Game.dutyFeedCands(vid) || []).find(c => c.dutyTask === 'forage');
    const cands2 = [{ kind: 'HAVEN_CHORE', w: 0.01, chore: 'fire' }, duty2].filter(Boolean);
    Game.vbrainScorePick(vid, cands2, { rng: () => 0 });
    const commit2 = Game.vbrainCommit(vid);
    check('pick-control restored: DUTY commits', commit2 && commit2.kind === 'DUTY' && commit2.dutyTask === 'forage',
      JSON.stringify(commit2));
  }

  console.log('== summary ==');
  out({ pass: fail === 0, passCount: pass, failCount: fail });
  process.exit(fail === 0 ? 0 : 1);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
