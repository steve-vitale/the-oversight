#!/usr/bin/env node
// test-agency-teachv-20261011.js — proof for longsim agency r2 lever
// (villager agency: the HAVEN_CHORE 'teach' chore made real).
//
// Design: a villager who knows plants (the identity system —
// plantsKnownBy) teaches a fellow villager one they don't know yet.
// villagerLearnsPlant lands the identity ('taught'); the learner also
// gains +1 tracking xp; a real lesson record + honest 'taught' deed land.
// The spoken line and deed name the plant through plantDisplayName
// (knowledge-gated). Monster lore stays the player channel.
//
// Proves on fixed seeds:
//   V1 real plant taught: the learner's plantsKnownBy gains a plant id
//      the teacher knew and the learner didn't
//   V2 learner xp: +1 tracking xp
//   V3 recorded: a.lessons entry {from, topic:'plants', pid, day}
//   V4 gated: a teacher who knows no plants teaches nothing — no identity,
//      no xp, no record, no deed (theater check)
//   V5 deed honest: exactly one 'taught' deed (mag 1), names the plant,
//      never collapses to bare "A"
//   V6 red, bad learner: unknown learner -> {taught:false}
//   V7 codex untouched: villager lessons never write the PLAYER codex
//   V8 chore gate: objPick never picks 'teach' for a villager who knows no
//      plants; picks it sometimes for one who does
//   V9 nothing-new: teacher knows only plants the learner already knows
//      -> {taught:false} (nothing to show)
//   V10 end-to-end: objTick's teach-chore branch records lessons and grants
//      xp over live day-parts
//   T3 transcript: repeated exhausted agency asks never split the view
//      from the transcript, never repeat verbatim, and end (noop)
//
// Run: [SEED=123] node scripts/test-agency-teachv-20261011.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

(async () => {
  const { Game } = await loadGame({ seed: parseInt(process.env.SEED || '31337', 10), mode: 'teachv' });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  const teacher = roster[0], learner = roster[1], novice = roster[2];
  // clear occupation-background plant knowledge for staged villagers, so
  // the test controls exactly who knows what (background experts knowing
  // plants from day 1 is real behavior — V8's gate relies on it — but the
  // unit assertions need a clean slate)
  for (const id of roster) {
    try {
      if (v.plantKnowledge) delete v.plantKnowledge[id];
      if (v.familiar) delete v.familiar[id];
      if (v.taught) delete v.taught[id];
    } catch (e) {}
  }
  const st = Game.agencyState();
  const taughtDeeds = (vid) => (st.ach || []).filter(d => d.vid === vid && d.type === 'taught').length;
  const codexPlants = () => Object.values((Game.state.codex || {}).plants || {}).filter(p => p && p.source === 'taught').length;
  const knownBy = (vid) => { try { return Game.plantsKnownBy(vid); } catch (e) { return []; } };

  // real plant ids from the data pool
  const pids = (Game.data.plants || []).filter(p => p && p.id).map(p => p.id);
  const P1 = pids[0], P2 = pids[1], P3 = pids[2];

  // stage: teacher knows P1+P2, learner knows P2, novice knows nothing
  Game.villagerLearnsPlant(teacher, P1, 'fieldwork');
  Game.villagerLearnsPlant(teacher, P2, 'fieldwork');
  Game.villagerLearnsPlant(learner, P2, 'fieldwork');
  st.lessons[learner] = [];

  // ---- V4/V6/V9 red cases ----
  const xpL0 = Game.agencyOf(learner).xp[learner].tracking;
  const deedsN0 = taughtDeeds(novice);
  const r4 = Game.agencyTeachVillager(novice, learner);
  ok('V4 no plants known -> {taught:false}', r4 && r4.taught === false, JSON.stringify(r4));
  ok('V4 no plants known -> learner identity set unchanged',
    JSON.stringify(knownBy(learner).sort()) === JSON.stringify([P2]));
  ok('V4 no plants known -> learner xp unchanged', Game.agencyOf(learner).xp[learner].tracking === xpL0);
  ok('V4 no plants known -> no lesson recorded', (st.lessons[learner] || []).length === 0);
  ok('V4 no plants known -> no taught deed', taughtDeeds(novice) === deedsN0);

  const r6 = Game.agencyTeachVillager(teacher, 'nobody-at-all');
  ok('V6 unknown learner -> {taught:false}', r6 && r6.taught === false, JSON.stringify(r6));

  // teacher knows only P2 which the learner already knows -> nothing to show
  const t2id = roster[3];
  Game.villagerLearnsPlant(t2id, P2, 'fieldwork');
  const r9 = Game.agencyTeachVillager(t2id, learner);
  ok('V9 nothing new to show -> {taught:false}', r9 && r9.taught === false, JSON.stringify(r9));

  // ---- V1/V2/V3/V5/V7 green path ----
  const codex0 = codexPlants();
  const xp0 = Game.agencyOf(learner).xp[learner].tracking;
  const deeds0 = taughtDeeds(teacher);
  const r1 = Game.agencyTeachVillager(teacher, learner);
  ok('V1 taught a real plant (P1: teacher-knew, learner-did-not)',
    !!(r1 && r1.taught) && r1.plant === P1 && knownBy(learner).indexOf(P1) !== -1,
    JSON.stringify(r1 && { taught: r1.taught, plant: r1.plant }));
  ok('V2 learner gains +1 tracking xp', Game.agencyOf(learner).xp[learner].tracking === xp0 + 1);
  const recs = st.lessons[learner] || [];
  ok('V3 lesson recorded with plant id', recs.length === 1 && recs[0].from === teacher && recs[0].pid === P1,
    JSON.stringify(recs[0]));
  ok('V5 teacher gets exactly one honest taught deed', taughtDeeds(teacher) === deeds0 + 1);
  const lastDeed = (st.ach || []).filter(d => d.vid === teacher && d.type === 'taught').pop();
  ok('V5 deed text never collapses to bare "A"', lastDeed && !/(^|\s)A(\s)/.test(lastDeed.text),
    lastDeed && lastDeed.text);
  ok('V7 player codex untouched by villager lessons', codexPlants() === codex0);

  // ---- V8: chore gating in objPick ----
  let teachSeenLow = 0;
  for (let i = 0; i < 300; i++) {
    try { const o = Game.objPick(novice, 4, 4); if (o && o.chore === 'teach') teachSeenLow++; } catch (e) {}
  }
  ok('V8 objPick never picks teach for plant-ignorant villager (300 picks)', teachSeenLow === 0, `seen=${teachSeenLow}`);
  let teachSeenHigh = 0;
  for (let i = 0; i < 300; i++) {
    try { const o = Game.objPick(teacher, 4, 4); if (o && o.chore === 'teach') teachSeenHigh++; } catch (e) {}
  }
  ok('V8 objPick can pick teach for knowledgeable villager (300 picks)', teachSeenHigh > 0, `seen=${teachSeenHigh}`);

  // ---- V10: objTick end-to-end ----
  const t3 = roster[4], l3 = roster[5];
  Game.villagerLearnsPlant(t3, P3, 'fieldwork');
  const o = Game.objOf(t3);
  o.kind = 'HAVEN_CHORE'; o.indoor = true; o.state = 'indoor';
  o.chore = 'teach'; o.partsLeft = 99; o.purpose = 'chore';
  const xpSumAll = () => roster.reduce((n, id) => { try { return n + Game.agencyOf(id).xp[id].tracking; } catch (e) { return n; } }, 0);
  const xpSumBefore = xpSumAll();
  const t3Lessons = () => Object.values(st.lessons || {}).reduce((n, l) => n + ((l || []).filter(e => e && e.from === t3).length), 0);
  const lessonsBefore = t3Lessons();
  let ticks = 0;
  for (let i = 0; i < 40 && t3Lessons() === lessonsBefore; i++) {
    try { Game.objTick(); ticks++; } catch (e) {}
  }
  ok('V10 objTick teach chore records a lesson', t3Lessons() > lessonsBefore, `lessons=${t3Lessons() - lessonsBefore} ticks=${ticks}`);
  ok('V10 learner xp rose through the chore', xpSumAll() > xpSumBefore);

  // ---- T3: transcript/view agreement on repeated exhausted asks ----
  {
    const tv = roster[6];
    const vv = Game.state.village;
    vv.explorerNews = vv.explorerNews || {};
    const seenThem = [];
    let endedCount = 0, mismatch = 0;
    for (let i = 0; i < 8; i++) {
      vv.explorerNews[tv] = { day: 1, agency: true, dist: 4 };
      let r = null;
      try { r = Game.agencyTurn(tv, 'agency:ask_field'); } catch (e) {}
      if (!r) { mismatch++; continue; }
      if (r.ended) { endedCount++; continue; }
      if (!r.line) { mismatch++; continue; }
      seenThem.push(r.line);
      const inTranscript = (r.transcript || []).some(t => t.who === 'them' && t.text === r.line);
      if (!inTranscript) mismatch++;
    }
    const uniq = {};
    let repeats = 0;
    for (const l of seenThem) { if (uniq[l]) repeats++; uniq[l] = 1; }
    ok('T3 every shown line is in the transcript', mismatch === 0, `mismatches=${mismatch}`);
    ok('T3 no verbatim repeats across exhausted asks', repeats === 0, `repeats=${repeats}`);
    ok('T3 exhausted thread ends (noop) instead of looping', endedCount > 0, `ended=${endedCount}/8`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS CRASH', e); process.exit(2); });
