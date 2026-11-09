#!/usr/bin/env node
// test-combat-social-duty-dawn.js — VILLAGER-BRAIN Phase 6 (OVE-71 / OVE-81):
// brain-offered combat (hunt/patrol), social (teach), and explore (scout) DUTY
// candidates can win dawn commitment via duty_top_score — same honesty as
// survival DUTY.
//
// Proves:
//   1. Heard raid danger → DUTY patrol in dutyFeedCands (full pantry; no survival ads).
//   2. Known prey → DUTY hunt in feed (weight beats teach soft ad).
//   3. Teachable knowledge + learner → DUTY teach in feed.
//   4. Top-scoring patrol / teach / hunt → commit DUTY + align (OVE-36 materialize≠commit).
//   5. Pantry+prey: hunt weight beats co-fired forage; dawn-commits hunt (OVE-76).
//      Soft pantry_protein without prey stays under forage (failing control shape).
//   5b. Codex-only animal depth (village.animals empty) → known_prey (OVE-78).
//      Failing control: empty village.animals + empty codex.animals → soft
//      pantry_protein under forage (same pantry belief).
//   6. Unmapped haven-ring fog → DUTY scout in feed; mapped ring → no scout (OVE-81).
//   7. Top-scoring scout → commit DUTY + align EXPLORE with practiceTask scout.
//   8. Failing control: vbrainDisableCombatSocialDuty strips combat/social/scout ads;
//      survival forage DUTY (when pantry low) still feeds.
//   9. gardenKeeper / standing assign still suppress DUTY ads.
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

function clearCodexAnimals(Game) {
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.animals = {};
}

function plantCodexPrey(Game, aid, level, day) {
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.animals = Game.state.codex.animals || {};
  Game.state.codex.animals[aid] = { level: level || 1, learnedDay: day || 0, via: 'test' };
}

// OVE-81: ±2 Chebyshev haven ring — same ring resolveOneAssignment scout maps.
function forEachScoutRingTile(Game, hx, hy, fn) {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const nx = hx + dx, ny = hy + dy;
      if (nx < 0 || nx > 8 || ny < 0 || ny > 8) continue;
      const t = Game.tileAt(nx, ny);
      if (t) fn(t, nx, ny);
    }
  }
}
function plantUnmappedScoutRing(Game, hx, hy) {
  let planted = 0;
  forEachScoutRingTile(Game, hx, hy, (t) => {
    if (!t.revealed) planted++;
  });
  if (planted > 0) return planted;
  const t = Game.tileAt(hx + 2, hy + 2);
  if (t) { t.revealed = false; return 1; }
  return 0;
}
function clearScoutRingFog(Game, hx, hy) {
  forEachScoutRingTile(Game, hx, hy, (t) => { t.revealed = true; });
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
    clearCodexAnimals(Game);
    v.gossip = [];
    v.animals = {};
    // Clear haven-ring fog so baseline has no scout opportunity either (OVE-81).
    clearScoutRingFog(Game, hx, hy);
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
    clearCodexAnimals(Game);
    v.gossip = [];
    v.animals = { rabbit: { level: 1, learnedDay: day, learnedBy: vid } };
    const feed = Game.dutyFeedCands(vid) || [];
    check('known prey: feed has DUTY hunt', dutyKinds(feed).indexOf('hunt') >= 0,
      JSON.stringify(dutyKinds(feed)));
    const hunt = feed.find(c => c.dutyTask === 'hunt');
    check('hunt: believed_need known_prey',
      !!(hunt && (hunt.considerations || []).some(x => x.id === 'believed_need' && x.note === 'known_prey')),
      JSON.stringify(hunt && hunt.considerations));
    check('known-prey-only: hunt weight beats teach soft ad',
      !!(hunt && hunt.w > 2.4), JSON.stringify(hunt && { w: hunt.w }));
    v.animals = {};
  }

  console.log('== pantry+prey: hunt beats forage for protein ==');
  {
    plantLowBelief(Game, vid, day);
    clearPlantKnowledge(v, roster);
    clearCodexAnimals(Game);
    v.gossip = [];
    v.animals = { rabbit: { level: 1, learnedDay: day, learnedBy: vid } };
    const feed = Game.dutyFeedCands(vid) || [];
    const forage = feed.find(c => c.dutyTask === 'forage');
    const hunt = feed.find(c => c.dutyTask === 'hunt');
    check('pantry+prey: feed has forage + hunt',
      !!(forage && hunt), JSON.stringify(dutyKinds(feed)));
    check('pantry+prey: hunt weight beats forage',
      !!(forage && hunt && hunt.w > forage.w),
      JSON.stringify({ huntW: hunt && hunt.w, forageW: forage && forage.w }));
    // Failing control shape: without known prey, speculative pantry_protein
    // stays soft under forage (same pantry belief).
    v.animals = {};
    clearCodexAnimals(Game);
    const soft = Game.dutyFeedCands(vid) || [];
    const softHunt = soft.find(c => c.dutyTask === 'hunt');
    const softForage = soft.find(c => c.dutyTask === 'forage');
    check('no-prey pantry_protein: hunt under forage',
      !!(softHunt && softForage && softHunt.w < softForage.w),
      JSON.stringify({ huntW: softHunt && softHunt.w, forageW: softForage && softForage.w }));
    v.animals = { rabbit: { level: 1, learnedDay: day, learnedBy: vid } };
  }

  console.log('== OVE-78: codex-only prey → known_prey (village.animals empty) ==');
  {
    plantLowBelief(Game, vid, day);
    clearPlantKnowledge(v, roster);
    v.gossip = [];
    v.animals = {};
    clearCodexAnimals(Game);
    // Failing control: neither store has prey → soft pantry_protein under forage.
    const soft = Game.dutyFeedCands(vid) || [];
    const softHunt = soft.find(c => c.dutyTask === 'hunt');
    const softForage = soft.find(c => c.dutyTask === 'forage');
    check('OVE-78 control: empty stores → pantry_protein',
      !!(softHunt && (softHunt.considerations || []).some(x =>
        x.id === 'believed_need' && x.note === 'pantry_protein')),
      JSON.stringify(softHunt && softHunt.considerations));
    check('OVE-78 control: soft hunt under forage',
      !!(softHunt && softForage && softHunt.w < softForage.w),
      JSON.stringify({ huntW: softHunt && softHunt.w, forageW: softForage && softForage.w }));
    // Treatment: codex animal depth only (same path encounters/_noteAnimalDepth use).
    plantCodexPrey(Game, 'rabbit', 1, day);
    const feed = Game.dutyFeedCands(vid) || [];
    const forage = feed.find(c => c.dutyTask === 'forage');
    const hunt = feed.find(c => c.dutyTask === 'hunt');
    check('OVE-78: codex-only → known_prey note',
      !!(hunt && (hunt.considerations || []).some(x =>
        x.id === 'believed_need' && x.note === 'known_prey')),
      JSON.stringify(hunt && hunt.considerations));
    check('OVE-78: codex-only hunt beats forage',
      !!(forage && hunt && hunt.w > forage.w),
      JSON.stringify({ huntW: hunt && hunt.w, forageW: forage && forage.w }));
    // Dawn-commit hunt via duty_top_score with village.animals still empty.
    const cands = [{ kind: 'HAVEN_CHORE', w: 0.01, chore: 'fire' }].concat(feed);
    clearCommit(Game, vid);
    Game.vbrainScorePick(vid, cands, { rng: () => 0 });
    const commit = Game.vbrainCommit(vid);
    check('OVE-78: codex-only dawn-commits hunt',
      commit && commit.kind === 'DUTY' && commit.dutyTask === 'hunt',
      JSON.stringify(commit));
    check('OVE-78: village.animals still empty',
      !Object.keys(v.animals || {}).length, JSON.stringify(v.animals));
    clearCodexAnimals(Game);
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

  console.log('== hunt DUTY dawn-commits + aligns (pantry+prey) ==');
  {
    // Authored protein need: low pantry + known prey. Hunt must top-score over
    // co-fired forage (OVE-76) and dawn-commit without assignTask.
    plantLowBelief(Game, vid, day);
    delete (v.assignments || {})[vid];
    clearPlantKnowledge(v, roster);
    v.gossip = [];
    v.animals = { rabbit: { level: 1, learnedDay: day, learnedBy: vid } };
    const feed = Game.dutyFeedCands(vid) || [];
    const hunt = feed.find(c => c.dutyTask === 'hunt');
    const forage = feed.find(c => c.dutyTask === 'forage');
    check('hunt pick setup: cand present', !!(hunt && hunt.w > 0), JSON.stringify(hunt));
    check('hunt pick setup: beats co-fired forage',
      !!(hunt && forage && hunt.w > forage.w),
      JSON.stringify({ huntW: hunt && hunt.w, forageW: forage && forage.w }));
    // Full extras list as dawn would see them (forage+cook+hunt) + soft core.
    const cands = [{ kind: 'HAVEN_CHORE', w: 0.01, chore: 'fire' }].concat(feed);
    clearCommit(Game, vid);
    const mat = Game.vbrainScorePick(vid, cands, { rng: () => 0 });
    const log = Game.vbrainLastLog(vid);
    const commit = Game.vbrainCommit(vid);
    check('hunt pick: materialize stays core', mat && mat.kind === 'HAVEN_CHORE',
      JSON.stringify(mat));
    check('hunt pick: override duty_top_score', log && log.override === 'duty_top_score',
      JSON.stringify({ override: log && log.override, pick: log && log.pick }));
    check('hunt pick: commit DUTY hunt',
      commit && commit.kind === 'DUTY' && commit.dutyTask === 'hunt',
      JSON.stringify(commit));
    check('hunt pick: no assignTask write',
      !((v.assignments || {})[vid] && (v.assignments || {})[vid].task),
      JSON.stringify((v.assignments || {})[vid]));
    const o = {
      kind: 'HAVEN_CHORE', purpose: 'chore', indoor: true, state: 'indoor',
      chore: 'fire', tx: hx, ty: hy, tightness: 0, partsLeft: 2,
    };
    Game.vbrainAlignObjective(vid, o, hx, hy);
    check('hunt align: kind HUNT', o.kind === 'HUNT', JSON.stringify(o));
    check('hunt align: purpose hunt', o.purpose === 'hunt', JSON.stringify(o));
    check('hunt align: outdoor ready', o.indoor === false && o.state === 'ready', JSON.stringify(o));

    // Soft pantry_protein without prey still loses duty_top_score to forage.
    v.animals = {};
    clearCodexAnimals(Game);
    const softFeed = Game.dutyFeedCands(vid) || [];
    const softCands = [{ kind: 'HAVEN_CHORE', w: 0.01, chore: 'fire' }].concat(softFeed);
    clearCommit(Game, vid);
    Game.vbrainScorePick(vid, softCands, { rng: () => 0 });
    const softCommit = Game.vbrainCommit(vid);
    check('no-prey control: commit forage not hunt',
      softCommit && softCommit.kind === 'DUTY' && softCommit.dutyTask === 'forage',
      JSON.stringify(softCommit));
    plantFullBelief(Game, vid, day);
    v.animals = {};
    clearCodexAnimals(Game);
  }

  console.log('== unmapped haven ring → DUTY scout ==');
  {
    plantFullBelief(Game, vid, day);
    clearPlantKnowledge(v, roster);
    clearCodexAnimals(Game);
    v.gossip = [];
    v.animals = {};
    const fogN = plantUnmappedScoutRing(Game, hx, hy);
    check('scout setup: fog in haven ring', fogN > 0, String(fogN));
    const feed = Game.dutyFeedCands(vid) || [];
    check('unmapped: feed has DUTY scout', dutyKinds(feed).indexOf('scout') >= 0,
      JSON.stringify(dutyKinds(feed)));
    const scout = feed.find(c => c.dutyTask === 'scout');
    check('scout: vbrainSrc duty', !!(scout && scout.vbrainSrc === 'duty'));
    check('scout: believed_need unmapped_land',
      !!(scout && (scout.considerations || []).some(x =>
        x.id === 'believed_need' && x.note === 'unmapped_land')),
      JSON.stringify(scout && scout.considerations));
    check('scout: soft vs teach weight', !!(scout && scout.w < 2.4),
      JSON.stringify(scout && { w: scout.w }));
    clearScoutRingFog(Game, hx, hy);
    const cleared = Game.dutyFeedCands(vid) || [];
    check('mapped ring: no DUTY scout', dutyKinds(cleared).indexOf('scout') < 0,
      JSON.stringify(dutyKinds(cleared)));
    plantUnmappedScoutRing(Game, hx, hy);
  }

  console.log('== scout DUTY dawn-commits + aligns ==');
  {
    plantFullBelief(Game, vid, day);
    delete (v.assignments || {})[vid];
    clearPlantKnowledge(v, roster);
    clearCodexAnimals(Game);
    v.gossip = [];
    v.animals = {};
    plantUnmappedScoutRing(Game, hx, hy);
    const duty = (Game.dutyFeedCands(vid) || []).find(c => c.dutyTask === 'scout');
    check('scout pick setup: cand present', !!(duty && duty.w > 0), JSON.stringify(duty));
    const cands = [{ kind: 'HAVEN_CHORE', w: 0.01, chore: 'fire' }, duty].filter(Boolean);
    clearCommit(Game, vid);
    const mat = Game.vbrainScorePick(vid, cands, { rng: () => 0 });
    const log = Game.vbrainLastLog(vid);
    const commit = Game.vbrainCommit(vid);
    check('scout pick: materialize stays core', mat && mat.kind === 'HAVEN_CHORE',
      JSON.stringify(mat));
    check('scout pick: override duty_top_score', log && log.override === 'duty_top_score',
      JSON.stringify({ override: log && log.override, pick: log && log.pick }));
    check('scout pick: commit DUTY scout',
      commit && commit.kind === 'DUTY' && commit.dutyTask === 'scout',
      JSON.stringify(commit));
    check('scout pick: no assignTask write',
      !((v.assignments || {})[vid] && (v.assignments || {})[vid].task),
      JSON.stringify((v.assignments || {})[vid]));
    const o = {
      kind: 'HAVEN_CHORE', purpose: 'chore', indoor: true, state: 'indoor',
      chore: 'fire', tx: hx, ty: hy, tightness: 0, partsLeft: 2,
    };
    Game.vbrainAlignObjective(vid, o, hx, hy);
    check('scout align: kind EXPLORE', o.kind === 'EXPLORE', JSON.stringify(o));
    check('scout align: purpose explore', o.purpose === 'explore', JSON.stringify(o));
    check('scout align: outdoor ready', o.indoor === false && o.state === 'ready', JSON.stringify(o));
    check('scout align: practiceTask scout', o.practiceTask === 'scout', JSON.stringify(o));
  }

  console.log('== failing control: vbrainDisableCombatSocialDuty ==');
  {
    plantFullBelief(Game, vid, day);
    clearPlantKnowledge(v, roster);
    clearCodexAnimals(Game);
    v.gossip = [{ action: 'raid', day: day, heard: [vid], village: 'ove71-raid' }];
    v.animals = { rabbit: { level: 1, learnedDay: day, learnedBy: vid } };
    v.taught[vid] = ['yarrow'];
    v.taught[buddy] = [];
    plantUnmappedScoutRing(Game, hx, hy);
    const withHook = Game.dutyFeedCands(vid) || [];
    check('control setup: combat/social/scout DUTY present',
      dutyKinds(withHook).indexOf('patrol') >= 0 &&
      dutyKinds(withHook).indexOf('hunt') >= 0 &&
      dutyKinds(withHook).indexOf('teach') >= 0 &&
      dutyKinds(withHook).indexOf('scout') >= 0,
      JSON.stringify(dutyKinds(withHook)));
    Game.vbrainDisableCombatSocialDuty = true;
    const stripped = Game.dutyFeedCands(vid) || [];
    check('control: no patrol/hunt/teach/scout',
      dutyKinds(stripped).indexOf('patrol') < 0 &&
      dutyKinds(stripped).indexOf('hunt') < 0 &&
      dutyKinds(stripped).indexOf('teach') < 0 &&
      dutyKinds(stripped).indexOf('scout') < 0,
      JSON.stringify(dutyKinds(stripped)));
    // Survival DUTY still works under the role-duty seam.
    plantLowBelief(Game, vid, day);
    const survival = Game.dutyFeedCands(vid) || [];
    check('control: survival forage still feeds', dutyKinds(survival).indexOf('forage') >= 0,
      JSON.stringify(dutyKinds(survival)));
    Game.vbrainDisableCombatSocialDuty = false;
    plantFullBelief(Game, vid, day);
    clearPlantKnowledge(v, roster);
    clearCodexAnimals(Game);
    v.gossip = [{ action: 'raid', day: day, heard: [vid], village: 'ove71-raid' }];
    v.animals = {};
    const restored = Game.dutyFeedCands(vid) || [];
    check('control restored: patrol returns', dutyKinds(restored).indexOf('patrol') >= 0,
      JSON.stringify(dutyKinds(restored)));
    check('control restored: scout returns', dutyKinds(restored).indexOf('scout') >= 0,
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
