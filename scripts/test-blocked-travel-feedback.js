// Real blocked taps explain themselves; every prepared obstacle branch is tested.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('blocked-travel-feedback');
(async () => {
  const G = await K.load({ seed: Number(process.env.SEED || 20261017), narration: true });
  K.newRun(G);
  const s = G.state.scholar;
  if (s.insideHaven) G.exitBuilding();
  T.ok('case starts on Haven grounds outside combat/ending', !s.insideHaven && !G.inCombat() && !G.over);
  const home = { x:G.map.px, y:G.map.py };
  const neighbors = G.travelTargets().filter(t => t.d === 1);
  T.ok('three independent adjacent targets exist', neighbors.length >= 3);
  if (neighbors.length < 3) throw new Error('Missing prepared targets');
  const [obstacle, creek, clear] = neighbors;
  for (const t of [obstacle, creek, clear]) {
    const tile = G.tileAt(t.x, t.y);
    tile.type = 'meadow'; delete tile.blockFrom;
    tile.needsBridge = false; tile.bridged = false;
  }
  const creekTile = G.tileAt(creek.x, creek.y);
  creekTile.type = 'creek'; creekTile.needsBridge = true;
  const withoutSwimmer = entries => (entries || []).filter(a => (a.id || a) !== 'swimmer');
  s.abilities = withoutSwimmer(s.abilities);
  s.backgroundAbilities = withoutSwimmer(s.backgroundAbilities);
  const swim = G.abilityDef('swimmer');
  if (G.state.codex.skills) delete G.state.codex.skills[(swim && swim.skillId) || 'swimmer'];
  T.ok('prepared scholar does not know swimmer in any lane', !G.hasAbility('swimmer'));
  function invoke(fn) {
    const start = G.log.length;
    const result = fn();
    return { result, text:G.log.slice(start).map(l => typeof l === 'string' ? l : l.text).join('\n') };
  }
  const position = () => JSON.stringify({ x:G.map.px, y:G.map.py });
  const unchangedPosition = () => position() === JSON.stringify(home);
  const clock = () => s.day * 512 + s.dayTicks;
  const refusedBefore = { kcal:s.kcal, clock:clock() };
  const hard = invoke(() => G.travelTo(creek.x, creek.y));
  T.ok('creek travel returns actual creek blockage', hard.result && hard.result.kind === 'blockage' && hard.result.blockType === 'creek');
  T.ok('creek travel emits creek feedback', /creek/i.test(hard.text));
  T.ok('creek travel does not move the scholar', unchangedPosition());
  const cantClear = invoke(() => G.clearBlockage(creek.x, creek.y));
  T.ok('clearBlockage on creek returns false', cantClear.result === false);
  T.ok('clearBlockage on creek emits bridge or swim guidance', /bridge|swim/i.test(cantClear.text));
  T.ok('creek blockage remains', G.travelBlockage(creek.x, creek.y).blockType === 'creek');
  const noWork = invoke(() => G.clearBlockage(clear.x, clear.y));
  T.ok('clear ground really has no blockFrom or hard creek', !G.tileAt(clear.x, clear.y).blockFrom && !G.travelBlockage(clear.x, clear.y));
  T.ok('clearBlockage on clear ground returns false', noWork.result === false);
  T.ok('clearBlockage on clear ground emits nothing-to-clear feedback', /nothing to clear/i.test(noWork.text));
  T.ok('all refused work preserves position, kcal and time', unchangedPosition() && s.kcal === refusedBefore.kcal && clock() === refusedBefore.clock);

  for (const kind of ['fallen_tree', 'rubble']) {
    const tile = G.tileAt(obstacle.x, obstacle.y);
    tile.blockFrom = { dx:home.x-obstacle.x, dy:home.y-obstacle.y, type:kind };
    const blocked = invoke(() => G.travelTo(obstacle.x, obstacle.y));
    T.ok(kind + ': travel returns correct blockage', blocked.result && blocked.result.kind === 'blockage' && blocked.result.blockType === kind);
    T.ok(kind + ': blocked travel emits its reason', (kind === 'rubble' ? /rubble/i : /tree/i).test(blocked.text));
    T.ok(kind + ': refused travel never moves the scholar', unchangedPosition());
    const before = { clock:clock(), kcal:s.kcal, wood:G.woodCount(), stone:G.materialCount('stone') };
    const work = invoke(() => G.clearBlockage(obstacle.x, obstacle.y));
    T.ok(kind + ': actual work clears blockFrom', !tile.blockFrom && G.travelBlockage(obstacle.x, obstacle.y) === null);
    T.ok(kind + ': clearing emits path-clear feedback', /path is clear/i.test(work.text));
    T.ok(kind + ': work pays32 ticks and effort kcal', clock() === before.clock + 32 && s.kcal <= before.kcal - (kind === 'rubble' ? 40 : 60));
    T.ok(kind + ': clearing stays on current node', unchangedPosition());
    if (kind === 'fallen_tree') T.ok('fallen tree yields exactly two real wood', G.woodCount() === before.wood + 2);
    else T.ok('rubble yields one to three real stone', G.materialCount('stone') >= before.stone + 1 && G.materialCount('stone') <= before.stone + 3);
  }
  T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
