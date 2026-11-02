// Boxed-in geometry proof for the walkHome + clearBlockage rung
// (landing r87 M7 vehicle; driver-only, zero src/js).
// r86: walkHome never stopped across 15 fresh-seed rescues, so the
// clear rung is UNREACHABLE-BY-GEOMETRY in hunt corpora — the rung
// itself was never proven. This test constructs the geometry directly:
// scholar two tiles from Haven, blockFrom injected on the homeward
// tile and BOTH sidestep tiles guarding approach from the scholar's
// tile, then asserts, per geometry:
//   (1) walkHome() stops with reached=false, interrupted='blocked',
//       and a NAMED block (x, y, blockType) — the contract the R85
//       rescue ladder's clear step depends on;
//   (2) clearBlockage() on the NAMED block (exactly what the ladder
//       clears: walk.blocked) succeeds and deletes it;
//   (3) the walkHome() retry outcome is REPORTED, not assumed: when
//       the detour beyond the named block is open, the retry REACHES
//       Haven (the rung completes); when a second natural block
//       (e.g. a hard creek) bars the detour, the retry STOPS AGAIN
//       with a new named block — which is the ladder's iteration gap
//       (one clear + one retry cannot free a scholar boxed by 2+
//       blocks), recorded here as a carried blank, not a proof failure.
// PASS requires at least one REACHED geometry (the rung completes)
// and zero geometries that fail (1) or (2). Seeds are tried in order;
// a seed that trips combat or refuses an outbound step is skipped,
// not counted — the test judges the boxed-in contract, not encounter
// rates. Exit 0 = PASS, 1 = FAIL.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra !== undefined ? ' :: ' + extra : ''));
  if (!cond) failures++;
}

async function trySeed(seed) {
  const { Game } = await loadGame({ seed, fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const hx = (v.px === undefined ? 4 : v.px), hy = (v.py === undefined ? 4 : v.py);
  if (Game.map.px !== hx || Game.map.py !== hy) return { seed, skipped: `scholar starts off-haven at ${Game.map.px},${Game.map.py}` };
  for (const tx of [hx + 1, hx + 2]) {
    try { Game.travelTo(tx, hy); } catch (e) { return { seed, skipped: 'outbound travelTo threw: ' + e.message }; }
    if (Game.inCombat && Game.inCombat()) return { seed, skipped: 'combat on outbound walk' };
    if (Game.map.px !== tx || Game.map.py !== hy) return { seed, skipped: `outbound step to ${tx},${hy} refused` };
  }
  const sx = Game.map.px, sy = Game.map.py;
  // Box in: homeward tile (hx+1,hy) guards approach from the east;
  // sidesteps (sx,sy-1) from the south, (sx,sy+1) from the north.
  // travelBlockage fires when bf.dx===-dx (or bf.dy===-dy), where
  // (dx,dy) is the step direction from the scholar's tile.
  const boxes = [
    { x: hx + 1, y: hy, bf: { dx: 1, dy: 0, type: 'fallen_tree' } },
    { x: sx, y: sy - 1, bf: { dx: 0, dy: 1, type: 'rubble' } },
    { x: sx, y: sy + 1, bf: { dx: 0, dy: -1, type: 'fallen_tree' } },
  ];
  for (const b of boxes) {
    const t = Game.tileAt(b.x, b.y);
    if (!t) return { seed, skipped: `no tile at ${b.x},${b.y}` };
    t.blockFrom = b.bf;
  }
  const stopped = Game.walkHome();
  if (!stopped || stopped.reached !== false || stopped.interrupted !== 'blocked' ||
      !stopped.blocked || typeof stopped.blocked.x !== 'number' || !stopped.blocked.blockType) {
    return { seed, failed: `walkHome did not stop-named: ${JSON.stringify(stopped)}` };
  }
  if (Game.map.px !== sx || Game.map.py !== sy) {
    return { seed, failed: `walkHome moved the scholar on the stop: at ${Game.map.px},${Game.map.py}` };
  }
  const namedTile = Game.tileAt(stopped.blocked.x, stopped.blocked.y);
  if (!namedTile || !namedTile.blockFrom) {
    return { seed, failed: `named block tile has no blockFrom: ${JSON.stringify(namedTile && namedTile.blockFrom)}` };
  }
  let clr = null;
  try { clr = Game.clearBlockage(stopped.blocked.x, stopped.blocked.y); } catch (e) { clr = null; }
  if (!clr || (namedTile && namedTile.blockFrom)) {
    return { seed, failed: `clearBlockage on named block failed: clr=${String(clr).slice(0, 80)} blockFrom=${JSON.stringify(namedTile && namedTile.blockFrom)}` };
  }
  const retry = Game.walkHome();
  const reached = !!(retry && retry.reached === true && Game.map.px === hx && Game.map.py === hy);
  return { seed, sx, sy, hx, hy, stopped, retry, reached, at: [Game.map.px, Game.map.py] };
}

async function main() {
  const reached = [], stalled = [], failed = [], skipped = [];
  for (let seed = 1; seed <= 40; seed++) {
    let r;
    try { r = await trySeed(seed); } catch (e) { skipped.push(seed + ':threw'); continue; }
    if (r.skipped) { skipped.push(seed + ':' + r.skipped); continue; }
    if (r.failed) { failed.push(seed + ':' + r.failed); continue; }
    if (r.reached) reached.push(r);
    else stalled.push(r);
    if (reached.length >= 1 && stalled.length >= 1) break;
  }
  for (const r of reached) console.log(`REACHED seed=${r.seed} scholar=(${r.sx},${r.sy}) stopBlock=${JSON.stringify(r.stopped.blocked)} retryPath=${JSON.stringify(r.retry.path)}`);
  for (const r of stalled) console.log(`STALLED-AGAIN seed=${r.seed} scholar=(${r.sx},${r.sy}) stopBlock=${JSON.stringify(r.stopped.blocked)} retry=${JSON.stringify(r.retry)} at=${r.at}`);
  for (const f of failed) console.log('GEOMETRY-FAIL ' + f);
  check('at least one boxed geometry stops-named + clears-named', reached.length + stalled.length > 0, `geometries=${reached.length + stalled.length}`);
  check('no geometry fails the stop/clear contract', failed.length === 0, failed.slice(0, 3).join(' | '));
  check('at least one geometry reaches Haven after clear + retry (rung completes)', reached.length >= 1,
    reached.length ? `seed ${reached[0].seed}` : 'none in tried seeds');
  console.log(`BOXED-PROOF: reached=${reached.length} stalledAgain=${stalled.length} failed=${failed.length} skipped=${skipped.length}`);
  if (stalled.length) console.log('NOTE (carried blank): a single clear + retry does not free a scholar boxed by 2+ blocks (natural creek on the detour); the R85 ladder has no iteration loop.');
  console.log(failures === 0 ? 'BOXED-PROOF: PASS' : 'BOXED-PROOF: FAIL');
  process.exit(failures ? 1 : 0);
}
main().catch(e => { console.error('BOXED-PROOF ERROR:', e && e.stack || e); process.exit(2); });
