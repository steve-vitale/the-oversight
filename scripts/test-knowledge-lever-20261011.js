#!/usr/bin/env node
// test-knowledge-lever-20261011.js — proof for longsim lever 4 (knowledge &
// teaching): "the village experiments".
// Baseline (20 seeds x 200d, competent+ask): testCautiously 0 calls,
// testMonsterMeat 0 calls, experiments 0, testedVerdicts 0, monsterFoodSafe 0.
// The experiment path was real in code, dead in practice. The lever: once per
// day a villager runs the cautious protocol on an unknown lump (or unknown
// raw meat) at the fire, honestly, in the open — verdicts land in
// sharedKnowledge + rumor; the player learns by being there (presence-gated).
// Proves, on fixed seeds:
//   E1 experiment fires: unknown lump -> identified 'tested' + verdict,
//      sharedKnowledge + rumor seeded, tester recorded
//   E2 no true-name leak: the protocol narration never speaks the true name
//      before identification (descriptor only)
//   E3 once-per-day gate: second call same day is a no-op
//   E4 verdicts travel: a later identification via another channel carries
//      the village's tested verdict
//   E5 meat: unknown raw meat -> foodSafe via the beat (safe + toxic cases),
//      attributed to the tester
//   E6 honest sources: gratitude/sample identifyPlant sources are channel
//      types, teacher name rides in teacherName
//   E7 player-absent: beat is presence-gated (no witness, no player learning;
//      village still could — documented future blank, story waits)
// Run: node scripts/test-knowledge-lever-20261011.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

function unknownPlant(Game, n) {
  const cxp = (Game.state.codex || {}).plants || {};
  const cands = (Game.data.plants || []).filter(p => p && p.id && !cxp[p.id] && p.edibility);
  if (cands.length < n) throw new Error('not enough unknown plants');
  return cands.slice(0, n);
}
function liveVillager(Game) {
  const v = Game.state.village || {};
  const ids = (v.roster || []).filter(id => id !== Game.villagerId);
  for (const id of ids) {
    const p = Game.getPerson(id);
    if (p && !p.dead) return id;
  }
  throw new Error('no live villager');
}
function captureSay(Game) {
  const lines = [];
  const _say = Game.say;
  Game.say = function (m) { lines.push(String(m || '')); return _say.call(this, m); };
  return { lines, restore() { Game.say = _say; } };
}

(async () => {
  // ============ E1/E2/E3: plant experiment ============
  {
    const { Game } = await loadGame({ seed: 90210, mode: 'knowledge-lever' });
    await setupGame(Game);
    const [p1, p2] = unknownPlant(Game, 2);
    const vid = liveVillager(Game);
    Game.state.scholar.prepStash = [{ lump: { [p1.id]: { units: 5 }, [p2.id]: { units: 5 } } }];
    const cap = captureSay(Game);
    const day = (Game.state.scholar || {}).day || 0;
    Game.villagerExperimentBeat(true);
    const v = Game.state.village;
    ok('E1 beat ran once today (lastExperimentDay)', v.lastExperimentDay === day, `day=${day} last=${v.lastExperimentDay}`);
    const e1 = (Game.state.codex.plants || {})[p1.id];
    ok('E1 unknown lump identified', !!e1 && e1.level >= 1, JSON.stringify(e1 && { level: e1.level, by: e1.by }));
    ok('E1 source is tested', e1 && e1.by === 'tested', `by=${e1 && e1.by}`);
    ok('E1 verdict recorded on entry', e1 && ['safe', 'caution', 'cook', 'avoid'].includes(e1.tested), `tested=${e1 && e1.tested}`);
    const sh = (v.sharedKnowledge || {})[p1.id] || {};
    ok('E1 sharedKnowledge carries verdict+tester', !!sh.tested && !!sh.testedBy, JSON.stringify({ tested: sh.tested, by: !!sh.testedBy }));
    ok('E1 rumor seeded', !!((v.plantRumors || {})[p1.id]), 'no rumor');
    ok('E1 tester learned it', Game.plantKnownBy(sh.testedBy, p1.id), `tester=${sh.testedBy}`);
    // E2: the protocol line (before identification) must not speak the name
    const proto = cap.lines.find(l => /spends the afternoon/.test(l));
    ok('E2 protocol narrated', !!proto, cap.lines.join(' | ').slice(0, 200));
    if (proto) {
      ok('E2 no true-name leak in protocol line', proto.indexOf(p1.name) === -1,
        `leaked "${p1.name}" in: ${proto.slice(0, 160)}`);
      ok('E2 descriptor used', proto.toLowerCase().indexOf((p1.description || 'unfamiliar plant').toLowerCase().slice(0, 12)) !== -1,
        proto.slice(0, 160));
    }
    // E3: same-day second call is a no-op — p2 stays unknown
    Game.villagerExperimentBeat(true);
    ok('E3 once-per-day gate (p2 still unknown)', !Game.plantKnown(p2.id), 'second experiment fired same day');
    cap.restore();
  }

  // ============ E4: verdicts travel ============
  {
    const { Game } = await loadGame({ seed: 90211, mode: 'knowledge-lever' });
    await setupGame(Game);
    const [p] = unknownPlant(Game, 1);
    const vid = liveVillager(Game);
    const v = Game.state.village;
    v.sharedKnowledge = v.sharedKnowledge || {};
    v.sharedKnowledge[p.id] = { discoveredBy: vid, day: 1, level: 1, tested: 'cook', testedBy: vid };
    const cap = captureSay(Game);
    ok('E4 identify via another channel works', Game.identifyPlant(p.id, 'taught', 'Someone'));
    const e = (Game.state.codex.plants || {})[p.id];
    ok('E4 verdict traveled with the name', e && e.tested === 'cook', `tested=${e && e.tested}`);
    ok('E4 verdict narrated', cap.lines.some(l => /already tested this one/.test(l) && /cook it, or else/.test(l)),
      cap.lines.join(' | ').slice(0, 220));
    cap.restore();
  }

  // ============ E5: meat experiments (safe + toxic) ============
  {
    const { Game } = await loadGame({ seed: 90212, mode: 'knowledge-lever' });
    await setupGame(Game);
    const defs = Game.data.monsters || [];
    const safeM = defs.find(m => m && m.id && !m.toxicFlesh && m.id !== 'belltoad');
    const toxM = defs.find(m => m && (m.toxicFlesh || m.id === 'belltoad'));
    if (!safeM || !toxM) { console.log('SKIP E5 — monster defs missing'); }
    else {
      Game.state.scholar.prepStash = [];
      Game.state.scholar.inventory = [
        { foodKind: 'meat', edible: false, plantId: 'meat_' + safeM.id, name: 'unknown flesh', units: 2 },
      ];
      const cap = captureSay(Game);
      const vid = liveVillager(Game);
      const hpBefore = ((Game.state.village.health || {})[vid] !== undefined)
        ? Game.state.village.health[vid] : 100;
      Game.villagerExperimentBeat(true);
      const me = (Game.state.codex.monsters || {})[safeM.id] || {};
      ok('E5 safe meat: foodSafe learned', me.foodSafe === true, JSON.stringify({ foodSafe: me.foodSafe, how: me.foodSafeHow }));
      ok('E5 safe meat: tester attributed', !!me.foodTestedBy, `foodTestedBy=${me.foodTestedBy}`);
      ok('E5 safe meat: narrated without forcing a name', cap.lines.some(l => /It.s food/.test(l)),
        cap.lines.join(' | ').slice(0, 200));
      // toxic: next day, new meat
      Game.state.village.lastExperimentDay = -1;
      Game.state.scholar.inventory = [
        { foodKind: 'meat', edible: false, plantId: 'meat_' + toxM.id, name: 'unknown flesh', units: 2, prep: '' },
      ];
      Game.villagerExperimentBeat(true);
      const te = (Game.state.codex.monsters || {})[toxM.id] || {};
      ok('E5 toxic meat: poison recorded', te.foodTested === 'poison' && te.foodSafe === false,
        JSON.stringify({ foodTested: te.foodTested, foodSafe: te.foodSafe }));
      const toxTester = te.foodTestedBy;
      const hpAfter = toxTester && (Game.state.village.health || {})[toxTester];
      ok('E5 toxic meat: tester paid a real cost', toxTester && hpAfter !== undefined && hpAfter < 100,
        `tester=${toxTester} health=${hpAfter}`);
      ok('E5 toxic meat: item marked', /POISON/.test(Game.state.scholar.inventory[0].prep || ''),
        Game.state.scholar.inventory[0].prep);
      cap.restore();
    }
  }

  // ============ E6: honest sources ============
  {
    const { Game } = await loadGame({ seed: 90213, mode: 'knowledge-lever' });
    await setupGame(Game);
    const [p] = unknownPlant(Game, 1);
    ok('E6 gratitude source is a channel type', Game.identifyPlant(p.id, 'gratitude', 'Some Villager')
      && (Game.state.codex.plants[p.id] || {}).by === 'gratitude',
      `by=${(Game.state.codex.plants[p.id] || {}).by}`);
    const [p2] = unknownPlant(Game, 1);
    ok('E6 sample source is a channel type', Game.identifyPlant(p2.id, 'sample', 'Some Villager')
      && (Game.state.codex.plants[p2.id] || {}).by === 'sample',
      `by=${(Game.state.codex.plants[p2.id] || {}).by}`);
  }

  // ============ E7: presence gate ============
  {
    const { Game } = await loadGame({ seed: 90214, mode: 'knowledge-lever' });
    await setupGame(Game);
    const [p] = unknownPlant(Game, 1);
    Game.state.scholar.prepStash = [{ lump: { [p.id]: { units: 5 } } }];
    const day = (Game.state.scholar || {}).day || 0;
    Game.villagerExperimentBeat(false); // player away: story waits
    ok('E7 away: player learns nothing', !Game.plantKnown(p.id), 'learned while away');
    ok('E7 away: no experiment consumed', Game.state.village.lastExperimentDay !== day,
      `last=${Game.state.village.lastExperimentDay} day=${day}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
