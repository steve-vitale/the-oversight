#!/usr/bin/env node
// test-combat-social-duty-dawn.js — VILLAGER-BRAIN Phase 6 (OVE-71):
// brain-offered combat (hunt/patrol) and social (teach) DUTY candidates
// can win dawn commitment via duty_top_score — same honesty as survival DUTY.
//
// Proves:
//   1. Heard raid danger → DUTY patrol in dutyFeedCands (full pantry; no survival ads).
//   2. Known prey → DUTY hunt in feed.
//   3. Teachable knowledge + learner → DUTY teach in feed.
//   4. Top-scoring patrol / teach → commit DUTY + align (OVE-36 materialize≠commit).
//   5. Failing control: vbrainDisableCombatSocialDuty strips combat/social ads;
//      survival forage DUTY (when pantry low) still feeds.
//   6. gardenKeeper / standing assign still suppress DUTY ads.
//
// Usage: node scripts/test-combat-social-duty-dawn.js
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

function dutyKinds(cands) {
  return (cands || [])
    .filter(c => c && c.kind === 'DUTY')
    .map(c => c.dutyTask || '?');
}

function clearCommit(Game, vid) {
  try {
    const br = Game.state.village.vbrain;
    if (br && br.commit) delete br.commit[vid];
  } catch (e) {}
}

function clearPlantKnowledge(v, ids) {
  v.familiar = v.familiar || {};
  v.taught = v.taught || {};
  v.plantKnowledge = v.plantKnowledge || {};
  for (const id of ids) {
    v.familiar[id] = [];
    v.taught[id] = [];
    v.plantKnowledge[id] = [];
    try {
      const vp = null; // snare/pit live on person profiles; tests don't set them
      void vp;
    } catch (e) {}
  }
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);

  if (typeof Game.dutyFeedCands !== 'function' || typeof Game.vbrainScorePick !== 'function' ||
      typeof Game.vbrainAlignObjective !== 'function' || typeof Game.objDangerBelief !== 'function') {
    out({ skip: 'combat/social duty dawn API missing' });
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
  Game.vbrainDisableCombatSocialDuty = false;
  Game.vbrainDisableDutyPick = false;
  Game.vbrainDutyIgnoreBelief = false;

  console.log('== heard danger → DUTY patrol ==');
  {
    plantFullBelief(Game, vid, day);
    plantFullBelief(Game, buddy, day);
    clearPlantKnowledge(v, roster);
    v.gossip = [];
    v.animals = {};
    let feed = Game.dutyFeedCands(vid) || [];
    check('baseline full pantry: no survival/role DUTY', feed.length === 0,
      JSON.stringify(dutyKinds(feed)));

    v.gossip = [{ action: 'raid', day: day, heard: [vid], village: 'ove71-raid' }];
    const bel = Game.objDangerBelief(vid) || {};
    check('hearer: danger belief threat', !!(bel.threat || bel.freshRaid), JSON.stringify(bel));
    feed = Game.dutyFeedCands(vid) || [];
    check('heard raid: feed has DUTY patrol', dutyKinds(feed).indexOf('patrol') >= 0,
      JSON.stringify(dutyKinds(feed)));
    check('heard raid: no forage (pantry full)', dutyKinds(feed).indexOf('forage') < 0,
      JSON.stringify(dutyKinds(feed)));
    const patrol = feed.find(c => c.dutyTask === 'patrol');
    check('patrol: vbrainSrc duty', !!(patrol && patrol.vbrainSrc === 'duty'));
    check('patrol: believed_need fresh_raid/heard_danger',
      !!(patrol && (patrol.considerations || []).some(x =>
        x.id === 'believed_need' && (x.note === 'fresh_raid' || x.note === 'heard_danger'))),
      JSON.stringify(patrol && patrol.considerations));

    // Unhearing buddy: no patrol ad from the same gossip.
    const muteFeed = Game.dutyFeedCands(buddy) || [];
    check('unhearing: no DUTY patrol', dutyKinds(muteFeed).indexOf('patrol') < 0,
      JSON.stringify(dutyKinds(muteFeed)));
  }

  console.log('== known prey → DUTY hunt ==');
  {
    plantFullBelief(Game, vid, day);
    clearPlantKnowledge(v, roster);
    v.gossip = [];
    v.animals = { rabbit: { level: 1, learnedDay: day, learnedBy: vid } };
    const feed = Game.dutyFeedCands(vid) || [];
    check('known prey: feed has DUTY hunt', dutyKinds(feed).indexOf('hunt') >= 0,
      JSON.stringify(dutyKinds(feed)));
    const hunt = feed.find(c => c.dutyTask === 'hunt');
    check('hunt: believed_need known_prey',
      !!(hunt && (hunt.considerations || []).some(x => x.id === 'believed_need' && x.note === 'known_prey')),
      JSON.stringify(hunt && hunt.considerations));
    v.animals = {};
  }

  console.log('== teachable knowledge → DUTY teach ==');
  {
    plantFullBelief(Game, vid, day);
    plantFullBelief(Game, buddy, day);
    clearPlantKnowledge(v, roster);
    v.gossip = [];
    v.animals = {};
    // Give vid a plant buddy does not know.
    v.taught[vid] = ['yarrow'];
    v.taught[buddy] = [];
    const feed = Game.dutyFeedCands(vid) || [];
    check('teachable: feed has DUTY teach', dutyKinds(feed).indexOf('teach') >= 0,
      JSON.stringify(dutyKinds(feed)));
    const teach = feed.find(c => c.dutyTask === 'teach');
    check('teach: believed_need teachable_knowledge',
      !!(teach && (teach.considerations || []).some(x =>
        x.id === 'believed_need' && x.note === 'teachable_knowledge')),
      JSON.stringify(teach && teach.considerations));
    // Learner with nothing to teach: no teach ad.
    const learnerFeed = Game.dutyFeedCands(buddy) || [];
    check('learner with no knowledge: no DUTY teach',
      dutyKinds(learnerFeed).indexOf('teach') < 0,
      JSON.stringify(dutyKinds(learnerFeed)));
  }

  console.log('== patrol DUTY dawn-commits + aligns ==');
  {
    plantFullBelief(Game, vid, day);
    delete (v.assignments || {})[vid];
    clearPlantKnowledge(v, roster);
    v.gossip = [{ action: 'raid', day: day, heard: [vid], village: 'ove71-raid' }];
    v.animals = {};
    const duty = (Game.dutyFeedCands(vid) || []).find(c => c.dutyTask === 'patrol');
    check('patrol pick setup: cand present', !!(duty && duty.w > 0), JSON.stringify(duty));
    const cands = [{ kind: 'HAVEN_CHORE', w: 0.01, chore: 'fire' }, duty].filter(Boolean);
    clearCommit(Game, vid);
    const mat = Game.vbrainScorePick(vid, cands, { rng: () => 0 });
    const log = Game.vbrainLastLog(vid);
    const commit = Game.vbrainCommit(vid);
    check('patrol pick: materialize stays core', mat && mat.kind === 'HAVEN_CHORE',
      JSON.stringify(mat));
    check('patrol pick: override duty_top_score', log && log.override === 'duty_top_score',
      JSON.stringify({ override: log && log.override, pick: log && log.pick }));
    check('patrol pick: commit DUTY patrol',
      commit && commit.kind === 'DUTY' && commit.dutyTask === 'patrol',
      JSON.stringify(commit));
    check('patrol pick: no assignTask write',
      !((v.assignments || {})[vid] && (v.assignments || {})[vid].task),
      JSON.stringify((v.assignments || {})[vid]));
    const o = {
      kind: 'HAVEN_CHORE', purpose: 'chore', indoor: true, state: 'indoor',
      chore: 'fire', tx: hx, ty: hy, tightness: 0, partsLeft: 2,
    };
    Game.vbrainAlignObjective(vid, o, hx, hy);
    check('patrol align: kind EXPLORE', o.kind === 'EXPLORE', JSON.stringify(o));
    check('patrol align: purpose explore', o.purpose === 'explore', JSON.stringify(o));
    check('patrol align: outdoor ready', o.indoor === false && o.state === 'ready', JSON.stringify(o));
  }

  console.log('== teach DUTY dawn-commits + aligns ==');
  {
    plantFullBelief(Game, vid, day);
    delete (v.assignments || {})[vid];
    clearPlantKnowledge(v, roster);
    v.gossip = [];
    v.animals = {};
    v.taught[vid] = ['yarrow'];
    v.taught[buddy] = [];
    const duty = (Game.dutyFeedCands(vid) || []).find(c => c.dutyTask === 'teach');
    check('teach pick setup: cand present', !!(duty && duty.w > 0), JSON.stringify(duty));
    const cands = [{ kind: 'HAVEN_CHORE', w: 0.01, chore: 'fire' }, duty].filter(Boolean);
    clearCommit(Game, vid);
    const mat = Game.vbrainScorePick(vid, cands, { rng: () => 0 });
    const log = Game.vbrainLastLog(vid);
    const commit = Game.vbrainCommit(vid);
    check('teach pick: materialize stays core', mat && mat.kind === 'HAVEN_CHORE',
      JSON.stringify(mat));
    check('teach pick: override duty_top_score', log && log.override === 'duty_top_score',
      JSON.stringify({ override: log && log.override }));
    check('teach pick: commit DUTY teach',
      commit && commit.kind === 'DUTY' && commit.dutyTask === 'teach',
      JSON.stringify(commit));
    const o = {
      kind: 'HAVEN_CHORE', purpose: 'chore', indoor: true, state: 'indoor',
      chore: 'fire', tx: hx, ty: hy, tightness: 0, partsLeft: 2,
    };
    Game.vbrainAlignObjective(vid, o, hx, hy);
    check('teach align: kind HAVEN_CHORE', o.kind === 'HAVEN_CHORE', JSON.stringify(o));
    check('teach align: chore teach', o.chore === 'teach', JSON.stringify(o));
    check('teach align: indoor', o.indoor === true && o.state === 'indoor', JSON.stringify(o));
    check('teach align: no assignTask write',
      !((v.assignments || {})[vid] && (v.assignments || {})[vid].task),
      JSON.stringify((v.assignments || {})[vid]));
  }

  console.log('== failing control: vbrainDisableCombatSocialDuty ==');
  {
    plantFullBelief(Game, vid, day);
    clearPlantKnowledge(v, roster);
    v.gossip = [{ action: 'raid', day: day, heard: [vid], village: 'ove71-raid' }];
    v.animals = { rabbit: { level: 1, learnedDay: day, learnedBy: vid } };
    v.taught[vid] = ['yarrow'];
    v.taught[buddy] = [];
    const withHook = Game.dutyFeedCands(vid) || [];
    check('control setup: combat/social DUTY present',
      dutyKinds(withHook).indexOf('patrol') >= 0 &&
      dutyKinds(withHook).indexOf('hunt') >= 0 &&
      dutyKinds(withHook).indexOf('teach') >= 0,
      JSON.stringify(dutyKinds(withHook)));
    Game.vbrainDisableCombatSocialDuty = true;
    const stripped = Game.dutyFeedCands(vid) || [];
    check('control: no patrol/hunt/teach',
      dutyKinds(stripped).indexOf('patrol') < 0 &&
      dutyKinds(stripped).indexOf('hunt') < 0 &&
      dutyKinds(stripped).indexOf('teach') < 0,
      JSON.stringify(dutyKinds(stripped)));
    // Survival DUTY still works under the role-duty seam.
    plantLowBelief(Game, vid, day);
    const survival = Game.dutyFeedCands(vid) || [];
    check('control: survival forage still feeds', dutyKinds(survival).indexOf('forage') >= 0,
      JSON.stringify(dutyKinds(survival)));
    Game.vbrainDisableCombatSocialDuty = false;
    plantFullBelief(Game, vid, day);
    clearPlantKnowledge(v, roster);
    v.gossip = [{ action: 'raid', day: day, heard: [vid], village: 'ove71-raid' }];
    v.animals = {};
    const restored = Game.dutyFeedCands(vid) || [];
    check('control restored: patrol returns', dutyKinds(restored).indexOf('patrol') >= 0,
      JSON.stringify(dutyKinds(restored)));
  }

  console.log('== gardenKeeper + assign still suppress ==');
  {
    plantFullBelief(Game, vid, day);
    clearPlantKnowledge(v, roster);
    v.gossip = [{ action: 'raid', day: day, heard: [vid], village: 'ove71-raid' }];
    v.animals = { rabbit: { level: 1 } };
    v.taught[vid] = ['yarrow'];
    v.taught[buddy] = [];
    const prevKeeper = v.gardenKeeper;
    v.gardenKeeper = vid;
    check('gardenKeeper: no combat/social DUTY', (Game.dutyFeedCands(vid) || []).length === 0,
      JSON.stringify(dutyKinds(Game.dutyFeedCands(vid))));
    v.gardenKeeper = prevKeeper || null;
    v.assignments[vid] = { task: 'forage', assignedDay: day, assignedPart: 0, via: 'test' };
    check('assigned: no competing DUTY ads', (Game.dutyFeedCands(vid) || []).length === 0,
      JSON.stringify(dutyKinds(Game.dutyFeedCands(vid))));
    delete v.assignments[vid];
  }

  console.log('== summary ==');
  out({ pass: fail === 0, passCount: pass, failCount: fail });
  process.exit(fail === 0 ? 0 : 1);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
