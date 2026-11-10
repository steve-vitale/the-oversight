#!/usr/bin/env node
// test-assign-dawn-commit.js — VILLAGER-BRAIN Phase 6 (OVE-65):
// player/conversation assignTask standing orders become dawn scorer
// commitments (assign_standing), not ads-only / ignored.
//
// Proves:
//   1. Standing assignment → ASSIGN cand in assignFeedCand / vbrainFeedExtras.
//   2. Dawn pick: commit ASSIGN + override assign_standing; materialize stays
//      core (OVE-36); align maps forage onto FORAGE. Assignment row unchanged.
//   3. Failing control: vbrainDisableAssignPick → ASSIGN scores, never commits.
//   4. Disobey / no standing order → no ASSIGN cand (obedience already gated
//      at assignTask write — unscored people stay uncommitted).
//   5. gardenKeeper + garden assign: ASSIGN commits garden haven chore; DUTY
//      still suppressed for the caretaker.
//
// Usage: node scripts/test-assign-dawn-commit.js
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

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);

  if (typeof Game.assignFeedCand !== 'function' || typeof Game.vbrainScorePick !== 'function' ||
      typeof Game.vbrainAlignObjective !== 'function') {
    out({ skip: 'assign dawn commit API missing' });
    process.exit(2);
  }

  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  try { Game.stockPantry(20000, 'test'); } catch (e) {}
  v.water = v.water || {};
  v.water.clean = 2000;
  v.water.dirty = 0;
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

  console.log('== standing assignTask feeds ASSIGN cand ==');
  {
    check('unassigned: no ASSIGN cand', Game.assignFeedCand(vid) == null);
    v.assignments[vid] = { task: 'forage', assignedDay: day, assignedPart: 0, via: 'test' };
    const cand = Game.assignFeedCand(vid);
    check('assigned: ASSIGN cand present', !!(cand && cand.kind === 'ASSIGN'), JSON.stringify(cand));
    check('assigned: assignTask forage', cand && cand.assignTask === 'forage', JSON.stringify(cand));
    check('assigned: vbrainSrc assign', cand && cand.vbrainSrc === 'assign', JSON.stringify(cand));
    check('assigned: standing_order consideration',
      !!(cand && (cand.considerations || []).some(x => x.id === 'standing_order')));
    const cands = [{ kind: 'HAVEN_CHORE', w: 1.4, chore: 'fire' }];
    Game.vbrainFeedExtras(vid, cands, hx, hy);
    check('vbrainFeedExtras appends ASSIGN',
      cands.some(c => c.kind === 'ASSIGN' && c.assignTask === 'forage'),
      JSON.stringify(cands.map(c => c.kind + (c.assignTask ? ':' + c.assignTask : ''))));
    // Competing DUTY ads stay suppressed for assigned people (OVE-60).
    check('assigned: no DUTY ads against standing order',
      !cands.some(c => c.kind === 'DUTY'),
      JSON.stringify(cands.filter(c => c.kind === 'DUTY')));
  }

  console.log('== assign_standing wins dawn commit + align ==');
  {
    v.assignments[vid] = { task: 'forage', assignedDay: day, assignedPart: 0, via: 'test' };
    const assign = Game.assignFeedCand(vid);
    const cands = [{ kind: 'HAVEN_CHORE', w: 0.01, chore: 'fire' }, assign].filter(Boolean);
    try {
      const br = v.vbrain;
      if (br && br.commit) delete br.commit[vid];
    } catch (e) {}
    const mat = Game.vbrainScorePick(vid, cands, { rng: () => 0 });
    const log = Game.vbrainLastLog(vid);
    const commit = Game.vbrainCommit(vid);
    check('pick: materialize stays core HAVEN_CHORE', mat && mat.kind === 'HAVEN_CHORE',
      JSON.stringify(mat));
    check('pick: log override assign_standing', log && log.override === 'assign_standing',
      JSON.stringify({ override: log && log.override, pick: log && log.pick }));
    check('pick: log pick ASSIGN', log && log.pick === 'ASSIGN',
      JSON.stringify({ pick: log && log.pick }));
    check('pick: commit kind ASSIGN', commit && commit.kind === 'ASSIGN',
      JSON.stringify(commit));
    check('pick: commit assignTask forage', commit && commit.assignTask === 'forage',
      JSON.stringify(commit));
    check('pick: commit vbrainSrc assign', commit && commit.vbrainSrc === 'assign',
      JSON.stringify(commit));
    const o = {
      kind: 'HAVEN_CHORE', purpose: 'chore', indoor: true, state: 'indoor',
      chore: 'fire', tx: hx, ty: hy, tightness: 0, partsLeft: 2,
    };
    Game.vbrainAlignObjective(vid, o, hx, hy);
    check('align: kind FORAGE', o.kind === 'FORAGE', JSON.stringify(o));
    check('align: purpose forage', o.purpose === 'forage', JSON.stringify(o));
    check('align: outdoor ready', o.indoor === false && o.state === 'ready', JSON.stringify(o));
    check('align: left home tile', !(o.tx === hx && o.ty === hy), JSON.stringify({ tx: o.tx, ty: o.ty, hx, hy }));
    check('align: assignment row unchanged',
      (v.assignments[vid] || {}).task === 'forage',
      JSON.stringify(v.assignments[vid]));
  }

  console.log('== failing control: pick hook removed ==');
  {
    v.assignments[vid] = { task: 'forage', assignedDay: day, assignedPart: 0, via: 'test' };
    const assign = Game.assignFeedCand(vid);
    const cands = [{ kind: 'HAVEN_CHORE', w: 0.01, chore: 'fire' }, assign].filter(Boolean);
    Game.vbrainDisableAssignPick = true;
    try {
      const br = v.vbrain;
      if (br && br.commit) delete br.commit[vid];
    } catch (e) {}
    Game.vbrainScorePick(vid, cands, { rng: () => 0 });
    const log = Game.vbrainLastLog(vid);
    const commit = Game.vbrainCommit(vid);
    const scoredAssign = ((log && log.candidates) || []).some(c => c.kind === 'ASSIGN');
    check('pick-control: ASSIGN still scored in log', scoredAssign,
      JSON.stringify((log && log.candidates || []).map(c => c.kind)));
    check('pick-control: no assign_standing override', !(log && log.override === 'assign_standing'),
      JSON.stringify({ override: log && log.override, pick: log && log.pick }));
    check('pick-control: commit is not ASSIGN', !(commit && commit.kind === 'ASSIGN'),
      JSON.stringify(commit));
    Game.vbrainDisableAssignPick = false;
    try {
      const br = v.vbrain;
      if (br && br.commit) delete br.commit[vid];
    } catch (e) {}
    const assign2 = Game.assignFeedCand(vid);
    const cands2 = [{ kind: 'HAVEN_CHORE', w: 0.01, chore: 'fire' }, assign2].filter(Boolean);
    Game.vbrainScorePick(vid, cands2, { rng: () => 0 });
    const commit2 = Game.vbrainCommit(vid);
    check('pick-control restored: ASSIGN commits',
      commit2 && commit2.kind === 'ASSIGN' && commit2.assignTask === 'forage',
      JSON.stringify(commit2));
  }

  console.log('== no standing order: no ASSIGN ==');
  {
    delete v.assignments[vid];
    check('cleared: no ASSIGN cand', Game.assignFeedCand(vid) == null);
    v.assignments[vid] = { task: 'rest', assignedDay: day, assignedPart: 0, via: 'test' };
    check('rest task: no ASSIGN cand', Game.assignFeedCand(vid) == null);
    delete v.assignments[vid];
  }

  console.log('== gardenKeeper + garden assign: haven commit, no DUTY steal ==');
  {
    const prevKeeper = v.gardenKeeper;
    v.gardenKeeper = buddy;
    v.assignments[buddy] = { task: 'garden', assignedDay: day, assignedPart: 0, via: 'test' };
    const assign = Game.assignFeedCand(buddy);
    check('gardenKeeper assign: ASSIGN garden',
      !!(assign && assign.kind === 'ASSIGN' && assign.assignTask === 'garden'),
      JSON.stringify(assign));
    check('gardenKeeper assign: still no DUTY ads',
      (Game.dutyFeedCands(buddy) || []).length === 0,
      JSON.stringify(Game.dutyFeedCands(buddy)));
    const cands = [{ kind: 'HAVEN_CHORE', w: 0.01, chore: 'fire' }, assign].filter(Boolean);
    try {
      const br = v.vbrain;
      if (br && br.commit) delete br.commit[buddy];
    } catch (e) {}
    Game.vbrainScorePick(buddy, cands, { rng: () => 0 });
    const log = Game.vbrainLastLog(buddy);
    const commit = Game.vbrainCommit(buddy);
    check('gardenKeeper: assign_standing override',
      log && log.override === 'assign_standing',
      JSON.stringify({ override: log && log.override, pick: log && log.pick }));
    check('gardenKeeper: commit ASSIGN garden',
      commit && commit.kind === 'ASSIGN' && commit.assignTask === 'garden',
      JSON.stringify(commit));
    const o = {
      kind: 'HAVEN_CHORE', purpose: 'chore', indoor: true, state: 'indoor',
      chore: 'fire', tx: hx, ty: hy, tightness: 0, partsLeft: 2,
    };
    Game.vbrainAlignObjective(buddy, o, hx, hy);
    check('gardenKeeper align: haven garden chore',
      o.kind === 'HAVEN_CHORE' && o.chore === 'garden' && o.indoor === true,
      JSON.stringify(o));
    check('gardenKeeper: no duty_top_score',
      !(log && log.override === 'duty_top_score'));
    delete v.assignments[buddy];
    v.gardenKeeper = prevKeeper || null;
  }

  console.log('== summary ==');
  out({ pass: fail === 0, passCount: pass, failCount: fail });
  process.exit(fail === 0 ? 0 : 1);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
