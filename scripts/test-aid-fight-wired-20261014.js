// AID FIGHT WIRED (audit 2026-10-14): help_fights_blow_by_blow promised that
// allies at Haven's door join the crisis fight as real combatants (aidFight),
// but aidFight had zero production callers. resolveWildMonsterEncounter and
// resolvePatrol now route a LINGERING raider fight through aidFight while an
// aid crisis is open. Proof: allies at the door are in the fight
// (allyFromStart, foreign ally vids), and the kill is scored exactly once.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('aid-fight-wired');

function setup(Game) {
  K.newRun(Game);
  const v = Game.state.village;
  const hx = v.px != null ? v.px : 4, hy = v.py != null ? v.py : 4;
  const vid = (v.roster || []).find(id => id !== Game.villagerId);
  v.health = v.health || {}; v.health[vid] = 100;
  Game.state.aidCrisis = null;
  Game.raiseAidCrisis('test raiders', 1);
  const crisis = Game.aidCrisis();
  crisis.raiders = true;
  const ov = (Game.state.otherVillages || [])[0];
  crisis.helpAtDoor.push({ villageId: ov ? ov.id : 'ov-test', partySize: 3, leader: 'Testface', faces: ['Testface'], garbled: false });
  const mdef = (Game.data.monsters || []).find(x => x.wave === 1 && Array.isArray(x.hp)) || (Game.data.monsters || [])[0];
  const m = Game.spawnWorldMonster(mdef.id, hx, hy, {});
  m.lingering = true;
  return { vid, m, mdef };
}

function spy(Game) {
  const calls = { ff: [], aid: 0, scored: [] };
  const oFF = Game.fieldFight, oAid = Game.aidFight, oRWK = Game.recordWaveKill;
  Game.fieldFight = function (vid, mdef, m, opts) { calls.ff.push(Object.assign({}, opts || {})); return oFF.apply(this, arguments); };
  Game.aidFight = function () { calls.aid++; return oAid.apply(this, arguments); };
  Game.recordWaveKill = function (mid, vid, via) { calls.scored.push(via); return oRWK.apply(this, arguments); };
  calls.restore = () => { Game.fieldFight = oFF; Game.aidFight = oAid; Game.recordWaveKill = oRWK; };
  return calls;
}

(async () => {
  const Game = await K.load({ seed: 20261014 });

  T.section('wild encounter with a lingering raider during an aid crisis');
  {
    const { vid, m } = setup(Game);
    const c = spy(Game);
    Game.resolveWildMonsterEncounter(vid, m, { raid: true });
    c.restore();
    T.ok('routed through aidFight', c.aid === 1, 'aidFight calls=' + c.aid);
    const o = c.ff[0] || {};
    T.ok('allies at the door fight from round one (allyFromStart)', o.allyFromStart === true, JSON.stringify(o));
    T.ok('the foreign ally is a real combatant vid', (o.allyVids || []).some(x => /^aid:/.test(x)), JSON.stringify(o.allyVids));
    T.ok('one fight, not two', c.ff.length === 1, 'fieldFight calls=' + c.ff.length);
    T.ok('a kill is scored at most once', c.scored.length <= 1, JSON.stringify(c.scored));
    T.ok('a kill scores on the aid-crisis channel', c.scored.every(x => x === 'aid-crisis'), JSON.stringify(c.scored));
  }

  T.section('patrol meets a lingering raider during an aid crisis');
  {
    const { vid } = setup(Game);
    const c = spy(Game);
    Game.resolvePatrol(vid, 'Tester');
    c.restore();
    T.ok('patrol routed through aidFight', c.aid === 1, 'aidFight calls=' + c.aid);
    T.ok('patrol scores at most once', c.scored.length <= 1, JSON.stringify(c.scored));
  }

  T.section('no crisis: ordinary wild fight is untouched');
  {
    const { vid, m } = setup(Game);
    Game.state.aidCrisis = null;
    const c = spy(Game);
    Game.resolveWildMonsterEncounter(vid, m, {});
    c.restore();
    T.ok('no crisis -> plain fieldFight', c.aid === 0 && c.ff.length === 1 && !c.ff[0].allyFromStart);
  }

  T.done();
})();
