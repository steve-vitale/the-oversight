#!/usr/bin/env node
// test-dipholdbar.js — proof for the sim-diphold-bar engine change
// (flesh-out loop arm sim-diphold-bar, run fleshout-20261019T1726Z).
//
// Proves, on a real loaded Game with a crafted belong bond (Haven
// subordinate to a 4-fire primary, trust 100, age 30):
//   T1  baseline: no arrears -> polityOf holds (both engines)
//   T2  RED/GREEN: fresh arrears (grace day 0) -> polity holds on the NEW
//       bar, breaks on the OLD bar (the lever's whole point)
//   T3  arrears age 6d -> still in grace -> holds (new engine)
//   T4  teeth: arrears age 7d -> grace expired -> breaks
//   T5  teeth: ancient arrears -> breaks
//   T6  clearing to zero restores the polity
//   T7  teeth: the trust leg (>=50) is unchanged
//   T8  teeth: the age leg (>=14) is unchanged
//   T9  teeth: kingdomEndingEligible still requires arrears===0 — grace
//       holds the doorway, not the room
//   T10 episode clock (new engine only): 0->>0 stamps arrearsPostedDay and
//       returns true; later postings in the same episode do NOT re-stamp
//       and return false
//   T11 grace say-line (new engine only): fires once per episode on a
//       dip-granting bond; silent otherwise
//
// RED run: `git checkout HEAD -- src/js/hierarchy.js` then run — T2 and T3
// fail (old bar ignores arrearsPostedDay), T10/T11 skip (helpers absent).
// GREEN run: with the change — all pass.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.log('  FAIL ' + name); } }

async function main() {
  const { Game } = await loadGame({ seed: 64207, mode: 'feastgap', fullTelemetry: false });
  await setupGame(Game);
  const hasBar = typeof Game._arrearsPost === 'function';

  Game.state.scholar = Game.state.scholar || {};
  Game.state.scholar.day = 100;
  const link = {
    id: 'testlink', status: 'active', primary: 'testprimary', subordinate: 'haven',
    trust: 100, day: 70, arrears: 0, tributeKcalPerWeek: 4000,
  };
  Game.hierarchyState().push(link);
  Game.state.foreignPolities = [{ primary: 'testprimary', subs: ['vA', 'vB'] }]; // 2+2 = 4 fires
  const polity = () => { try { return Game.polityOf('testprimary'); } catch (e) { return null; } };

  ok('T1 baseline: no arrears -> polity holds', !!polity());

  link.arrears = 5000; link.arrearsPostedDay = 100;
  ok('T2 RED/GREEN: fresh arrears (grace day 0) -> polity holds', !!polity());

  link.arrearsPostedDay = 94;
  ok('T3: arrears age 6d -> polity holds', !!polity());

  link.arrearsPostedDay = 93;
  ok('T4 teeth: arrears age 7d -> polity breaks', !polity());

  link.arrearsPostedDay = 50;
  ok('T5 teeth: arrears age 50d -> polity breaks', !polity());

  link.arrears = 0;
  ok('T6: arrears cleared -> polity holds', !!polity());

  link.trust = 49;
  ok('T7 teeth: trust 49 -> polity breaks', !polity());
  link.trust = 100;

  link.day = 90;
  ok('T8 teeth: age 10d -> polity breaks', !polity());
  link.day = 70;

  link.arrears = 5000; link.arrearsPostedDay = 100;
  let elig = null;
  try { elig = Game.kingdomEndingEligible(); } catch (e) {}
  ok('T9 teeth: ending frame still requires arrears 0', !(elig && elig.eligible));
  link.arrears = 0;

  if (hasBar) {
    const l2 = { arrears: 0 };
    Game.state.scholar.day = 120;
    const fresh1 = Game._arrearsPost(l2, 100);
    ok('T10a: new episode stamps clock + returns true', fresh1 === true && l2.arrearsPostedDay === 120 && l2.arrears === 100);
    const fresh2 = Game._arrearsPost(l2, 50);
    ok('T10b: same episode does NOT re-stamp + returns false', fresh2 === false && l2.arrearsPostedDay === 120 && l2.arrears === 150);
    Game.state.scholar.day = 100;

    const said = [];
    const oSay = Game.say;
    Game.say = (s) => { said.push(String(s)); };
    try {
      Game._arrearsGraceSay(link, true);
      ok('T11a: grace line fires on new episode of dip bond', said.some(s => /seven days to make the books right/.test(s)));
      const n0 = said.length;
      Game._arrearsGraceSay(link, false);
      ok('T11b: no line when not a new episode', said.length === n0);
      Game.state.foreignPolities = [{ primary: 'testprimary', subs: [] }]; // 2 fires: no dip
      Game._arrearsGraceSay(link, true);
      ok('T11c: no line when bond holds no dip', said.length === n0);
    } finally { Game.say = oSay; }
  } else {
    console.log('  (engine bar absent — T10/T11 skipped; this is the RED run)');
  }

  console.log(`test-dipholdbar: ${pass} pass, ${fail} fail${hasBar ? '' : ' (RED run)'}`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
