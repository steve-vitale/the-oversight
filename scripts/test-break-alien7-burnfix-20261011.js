// Proof test 3: break-it alienPlayers 2026-10-11 (run 7) — RE-BREAK the
// apPlaygroundBurn phantom-fire fix (74d7ebc7, break-it camps 2026-10-11).
// The fix purges the tracked fire entry when its cell burns and names the
// loss ("Your fire dies in the burn"). ATTACK: it never sweeps dead fires
// first — an EXPIRED-but-unswept fire (till passed, cell still 'fire') gets
// purged AND announced as killed by the burn, but the flame was already gone.
// Same class as the r10 apDousePlayerFire fix, which DOES sweepDeadFires()
// first ("a pit that burned down on its own").
// FAILS before the fix (message lies about an already-dead fire);
// PASSES after (sweep first: only live fires are named).
const H = require('./break-alien-harness.js');
const { Game, RNG } = H;
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) pass++; else { fail++; console.log('FAIL:', label); } }
const SEED = parseInt(process.env.SEED || '5150', 10);

async function main() {
  await H.boot();
  RNG.reset(SEED);
  H.fresh(45);
  try { Game.ledgerState()[1].points = 5; } catch (e) {}
  Game.state.systemArrived = true;
  try { Game.debugToWildNode(); } catch (e) {}
  const s = Game.state.scholar;
  const px = Game.map.px, py = Game.map.py;

  function placeFire(bx, by, till) {
    const bd = Game.genDetail(px, py);
    bd[by][bx] = 'fire';
    Game.state.fires = Game.state.fires || [];
    Game.state.fires.push({ tx: px, ty: py, cx: bx, cy: by, till: till, burn0: 100 });
  }
  const nowTick = Game._absTick();

  // Stub RNG so the burn always picks cell (2,2): 0.28*9=2.52 -> 2
  const realRandom = Math.random;
  Math.random = () => 0.28;

  try {
    // CASE A: expired fire (till long past), cell still reads 'fire'
    H.clearLog();
    Game.apState().lastBurnDay = -999;
    placeFire(2, 2, 0);
    const r1 = Game.apPlaygroundBurn('countess_sable');
    const txt1 = H.allText();
    const lied = /Your fire dies in the burn/.test(txt1);
    ok(!lied, 'CASE A expired fire: no "your fire dies" lie (said=' + lied + ', ret=' + r1 + ')');
    // the expired entry should be gone via sweep, not via burn-purge
    const left1 = (Game.state.fires || []).filter(f => f.cx === 2 && f.cy === 2).length;
    ok(left1 === 0, 'CASE A expired entry cleared');

    // CASE B: live fire — the message SHOULD appear (control: the fix keeps working)
    H.clearLog();
    Game.apState().lastBurnDay = -999;
    placeFire(2, 2, nowTick + 100000);
    const r2 = Game.apPlaygroundBurn('countess_sable');
    const txt2 = H.allText();
    ok(/Your fire dies in the burn/.test(txt2), 'CASE B live fire: loss named honestly');
    const left2 = (Game.state.fires || []).filter(f => f.cx === 2 && f.cy === 2).length;
    ok(left2 === 0, 'CASE B live entry purged');
    // grid cell is rubble, not a phantom fire
    const bd2 = Game.genDetail(px, py);
    ok(bd2[2][2] === 'rubble', 'CASE B cell is rubble (got ' + bd2[2][2] + ')');
    ok(Game.playerFireAt(2, 2) === false, 'CASE B playerFireAt false on rubble');
  } finally {
    Math.random = realRandom;
  }

  console.log('\nPASS ' + pass + ' / FAIL ' + fail);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
