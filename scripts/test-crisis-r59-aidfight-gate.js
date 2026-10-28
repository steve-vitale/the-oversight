// AIDFIGHT LINGERERS-FIRST GATE (journey crisis r59, lane B leg 6).
// Before/after proof for the comms.js aidFight fix: aidFight resolved
// 'fought' unconditionally on vKill/mFlee, even with living lingerers
// still holding the treeline (the tick and the sortie both check
// first). The gate must:
//  (A) leave the crisis OPEN when another living lingerer remains
//      after the fought monster falls, and say so honestly;
//  (B) still resolve 'fought' when the fought monster was the last
//      lingerer (no regression on the clean case);
//  (C) leave the crisis OPEN on mFlee, because a fled lingerer did
//      not leave the siege (it keeps lingering=true and is re-pinned
//      at dawn; only the sortie clears lingering on a drive-off).
// Method: stub fieldFight to a fixed outcome, PRODUCTION-FAITHFUL:
// fieldFight writes wounds back onto m.hp only when the monster lives
// (fieldFights.js: "Wounds persist onto m.hp when the monster lives");
// on vKill it leaves m.hp at its pre-fight value and the CALLER
// removes the corpse only AFTER aidFight returns. So inside aidFight
// a killed beast still shows hp > 0 and lingering — the gate must
// exclude it by IDENTITY, not by hp, and the stub must not set hp 0
// (an earlier stub did, and masked exactly this).
// Usage: node scripts/test-crisis-r59-aidfight-gate.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('crisis-r59-aidfight-gate');

function setup(Game, nLingerers) {
  K.newRun(Game);
  const v = Game.state.village;
  const hx = v.px != null ? v.px : 4, hy = v.py != null ? v.py : 4;
  const vid = (v.roster || []).find(id => id !== Game.villagerId);
  v.health = v.health || {}; v.health[vid] = 100;
  Game.state.aidCrisis = null;
  Game.raiseAidCrisis('test raiders', 1);
  const crisis = Game.aidCrisis();
  crisis.raiders = true;
  crisis.helpAtDoor = [];
  const mdef = (Game.data.monsters || []).find(x => x.wave === 1 && Array.isArray(x.hp)) || (Game.data.monsters || [])[0];
  const ms = [];
  for (let i = 0; i < nLingerers; i++) {
    const m = Game.spawnWorldMonster(mdef.id, hx, hy, {});
    m.lingering = true; m.hp = (m.hp || 50);
    ms.push(m);
  }
  return { vid, ms, mdef };
}

function runAidFight(Game, vid, mdef, m, outcome) {
  const say = [];
  const oSay = Game.say, oFF = Game.fieldFight;
  Game.say = function (s) { try { say.push(String(s)); } catch (e) {} return oSay.apply(this, arguments); };
  Game.fieldFight = function () {
    // Production-faithful: on vKill the world object keeps its
    // pre-fight hp (no writeback) and stays in the world list until
    // the caller removes it after aidFight returns. On mFlee the
    // writeback happens (mHpLeft) and lingering stays true.
    if (outcome === 'mFlee') { try { m.hp = Math.max(1, (m.hp || 50) - 1); } catch (e) {} }
    return { outcome, vTaken: 0 };
  };
  let rec = null;
  try { rec = Game.aidFight(vid, mdef, m, {}); } catch (e) { rec = { error: String(e && e.message || e) }; }
  Game.say = oSay; Game.fieldFight = oFF;
  return { rec, say };
}

(async () => {
  const Game = await K.load({ seed: 20261028 });

  T.section('A: another lingerer remains -> crisis stays open, no door-quiet line');
  {
    const { vid, ms, mdef } = setup(Game, 2);
    const { rec, say } = runAidFight(Game, vid, mdef, ms[0], 'vKill');
    T.ok('aidFight returned the vKill record', rec && rec.outcome === 'vKill', JSON.stringify(rec && rec.outcome));
    T.ok('crisis still open', !!Game.aidCrisis() && !Game.aidCrisis().resolved, 'aidCrisis=' + JSON.stringify(Game.aidCrisis()));
    T.ok('no "door holds" line', !say.some(s => /door holds/.test(s)), JSON.stringify(say));
    T.ok('no "door is quiet" line', !say.some(s => /door is quiet/.test(s)), JSON.stringify(say));
    T.ok('honest still-holds line spoken', say.some(s => /still hold/.test(s)), JSON.stringify(say));
  }

  T.section('B: last lingerer killed -> crisis resolves fought, door-holds line kept');
  {
    const { vid, ms, mdef } = setup(Game, 1);
    const { say } = runAidFight(Game, vid, mdef, ms[0], 'vKill');
    T.ok('crisis resolved (null)', Game.aidCrisis() === null, 'aidCrisis=' + JSON.stringify(Game.aidCrisis()));
    T.ok('"door holds" line kept', say.some(s => /door holds/.test(s)), JSON.stringify(say));
  }

  T.section('C: fled lingerer stays a lingerer -> crisis stays open');
  {
    const { vid, ms, mdef } = setup(Game, 1);
    const { say } = runAidFight(Game, vid, mdef, ms[0], 'mFlee');
    T.ok('fled monster still lingering', !!ms[0].lingering, 'lingering=' + ms[0].lingering);
    T.ok('crisis still open', !!Game.aidCrisis() && !Game.aidCrisis().resolved, 'aidCrisis=' + JSON.stringify(Game.aidCrisis()));
    T.ok('no "door holds" line on a flee', !say.some(s => /door holds/.test(s)), JSON.stringify(say));
  }

  T.done();
})();
