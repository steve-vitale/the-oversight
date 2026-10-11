// Proof test 2: break-it alienPlayers 2026-10-11 (run 7) — LIVE FIGHT.
// A real alien encounter, fought in the node harness:
//  F1 encounter starts; pre-reveal fighter is 'Stranger', human emoji
//  F2 stasis field consumes the barrier exit (no flee while Rax lives)
//  F3 beam fires through apMaybeBeamAttack and lands real damage
//  F4 killing Rax ends the fight, marks him dead, clears encounter state
//  F5 the corpse never re-encounters (rolls + activation)
const H = require('./break-alien-harness.js');
const { Game, RNG } = H;
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) pass++; else { fail++; console.log('FAIL:', label); } }
const SEED = parseInt(process.env.SEED || '4242', 10);

async function main() {
  await H.boot();
  RNG.reset(SEED);
  H.fresh(45);
  try { Game.ledgerState()[1].points = 5; } catch (e) {}
  Game.state.systemIntegration = 2;
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  s.hp = 200; s.maxHp = 200; // survive a beam for the test

  // F1: start the encounter
  H.clearLog();
  const started = Game.apStartEncounter('rax_dentist');
  ok(started === true, 'F1 apStartEncounter(rax_dentist) starts');
  const f = Game.tbfight;
  ok(!!f && !f.over, 'F1 tbfight active');
  const foe = (f.fighters || []).find(x => x.alienPid === 'rax_dentist');
  ok(!!foe, 'F1 Rax fighter present');
  ok(foe.name === 'Stranger', 'F1 pre-reveal name is Stranger (got ' + foe.name + ')');
  ok(foe.kind === 'hostile' && foe.kind !== 'monster', 'F1 kind is hostile, not monster');
  ok(foe.emoji === '🧑', 'F1 looks human');

  // F2: stasis consumes the barrier exit
  H.clearLog();
  let exitResult = null;
  try { exitResult = Game.tbBarrierExit(1, 0); } catch (e) { exitResult = 'threw:' + e.message; }
  ok(exitResult === true, 'F2 barrier exit consumed by stasis (got ' + exitResult + ')');
  ok(!!Game.tbfight && !Game.tbfight.over, 'F2 fight continues after blocked flee');
  const stasisTxt = H.allText();
  ok(/stasis field/i.test(stasisTxt), 'F2 stasis message shown');
  ok(!/Rax/.test(stasisTxt), 'F2 stasis message does not name Rax pre-reveal');

  // F3: force a beam through the real roll path
  H.clearLog();
  f._beamCooldown = 0;
  let beamFired = false, hpBefore = s.hp;
  for (let i = 0; i < 300 && !beamFired; i++) {
    try { beamFired = !!Game.apMaybeBeamAttack(foe); } catch (e) {}
  }
  ok(beamFired, 'F3 beam fired via apMaybeBeamAttack');
  const beamTxt = H.allText();
  ok(/beam weapon/i.test(beamTxt) && !/Rax/.test(beamTxt), 'F3 beam announced without naming Rax pre-reveal');
  const t = Game.tbFighter ? Game.tbFighter('p') : null;
  const pHp = t ? t.hp : s.hp;
  ok(pHp < hpBefore, 'F3 beam dealt real damage (' + hpBefore + ' -> ' + pHp + ')');

  // heal up, then kill Rax for real
  s.hp = 200; if (t) t.hp = 200;
  H.clearLog();
  Game.tbDamage(foe.key, 9999, 'test killing blow', 'p');
  try { Game.tbEndCheck(); } catch (e) {}
  ok(!Game.tbfight || Game.tbfight.over, 'F4 fight ended after the kill');
  ok(Game.apIsDead('rax_dentist'), 'F4 Rax marked dead');
  ok(!Game.state.alienEncounter, 'F4 encounter state cleared');
  const rec = (Game.apState().met || {}).rax_dentist || {};
  ok(rec.encounters >= 1, 'F4 met record has the encounter');

  // F5: corpse never re-encounters
  RNG.reset(SEED + 7);
  let seen = 0;
  for (let i = 0; i < 300; i++) { if (Game.apRollEncounter() === 'rax_dentist') seen++; }
  ok(seen === 0, 'F5 dead Rax never re-rolled (' + seen + '/300)');
  let actSeen = false;
  for (let i = 0; i < 60; i++) { if (Game.apMaybeActivate() === 'rax_dentist') actSeen = true; }
  ok(!actSeen, 'F5 dead Rax never re-activated');

  console.log('\nPASS ' + pass + ' / FAIL ' + fail);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
