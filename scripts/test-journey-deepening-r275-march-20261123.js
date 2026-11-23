// test-journey-deepening-r275-march-20261123.js -- R269 march-step proof
// (runs the REAL r232 driver marchStep on synthetic stubs; no game needed).
// The march is the r228 scale step, carried verbatim into deepening: a ready
// muster walks to the lair so the engine's meeting flow can engage the
// coalition fight the next morning. Safety rules under test (prereg): the
// step fires ONLY for a located (stage >= 2), present, unslain titan with a
// READY muster; sanctity holds (tbfight / pendingEncounter / tableActive /
// sleeping) use the braced hold pattern (the r227 bare-continue bug must
// not recur); it never marches without a ready muster, never outfits, never
// touches campaign gates; the day guard stops double-marching.
// (W1) stage 1 -> no rows. (W2) stage 2 + present + muster NOT ready ->
// no rows. (W3) stage 2 + present + ready + already on the lair tile ->
// one row, onTile + arrived, no walk. (W4) stage 2 + present + ready +
// off-tile + walkable -> one row, arrived, from recorded. (W5) tbfight
// live -> held 'tbfight', no walk. (W6) tableActive -> held 'tableActive'.
// (W7) slain -> no rows. (W8) absent (no world monster) -> no rows.
// (W9) same-day second marchStep -> no new rows (day guard). (W10) walk
// blocked (travelTo refuses) -> held 'blocked-at:x,y'. (W11) walk arrives
// and the engine sets a pending encounter for the Herald -> pending true.
// The lagged march->fight join (same-day OR next-day) is an ANALYZER rule,
// proved in the analyzer test (case 40 pattern, carried from r228).
'use strict';
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function freshDriver() {
  const p = require.resolve('./journey-deepening-r275-20261123.js');
  delete require.cache[p];
  return require(p);
}
const D = freshDriver();

function stubGame(o) {
  o = o || {};
  const px = (o.onTile ? 7 : 4), py = (o.onTile ? 4 : 4);
  const G = {
    over: false,
    tbfight: o.tbfight ? { over: false } : null,
    pendingEncounter: false,
    pendingMonsterId: null,
    _sleeping: false,
    map: { px, py },
    state: {
      titans: {
        omens: { herald: { stage: (o.stage == null ? 2 : o.stage), day: 90 } },
        musters: { herald: { allies: new Array(10).fill({}), haven: [] } },
        slain: o.slain ? { herald: true } : {},
        cast: null,
      },
      scholar: { day: 100 },
    },
    data: { titans: { herald: { monster: 'herald', title: 'THE HERALD' } } },
    worldMonsters: function () {
      return o.present === false ? [] : [{ id: 'herald', tx: 7, ty: 4, hp: 700, maxHp: 700 }];
    },
    titanMusterReady: function () { return !!o.ready; },
    tableActive: function () { return !!o.tableActive; },
    travelTargets: function () {
      const out = [];
      const { px: x, py: y } = G.map;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        const nx = x + d[0], ny = y + d[1];
        if (nx >= 0 && nx < 9 && ny >= 0 && ny < 9) out.push({ x: nx, y: ny });
      });
      return out;
    },
    travelTo: function (x, y) {
      if (o.walkable === false) return; // refused: stay put
      G.map.px = x; G.map.py = y;
      if (o.setsPending && x === 7 && y === 4) {
        G.pendingEncounter = true;
        G.pendingMonsterId = 'herald';
      }
    },
  };
  return G;
}
function stubCtx() { return { shipWrapErrors: [] }; }

// (W1) stage 1 -> no rows.
{
  const G = stubGame({ stage: 1, ready: true });
  const ctx = stubCtx();
  D.marchStep(G, ctx);
  ok('(W1) stage 1 (named, not located): no march rows', (ctx.marchWatch || []).length === 0, JSON.stringify(ctx.marchWatch));
}
// (W2) stage 2 + present + muster NOT ready -> no rows.
{
  const G = stubGame({ stage: 2, ready: false });
  const ctx = stubCtx();
  D.marchStep(G, ctx);
  ok('(W2) muster not ready: no march rows (the muster step owns it)', (ctx.marchWatch || []).length === 0, JSON.stringify(ctx.marchWatch));
}
// (W3) already on the lair tile -> onTile + arrived, no walk.
{
  const G = stubGame({ stage: 2, ready: true, onTile: true });
  const ctx = stubCtx();
  D.marchStep(G, ctx);
  const rows = ctx.marchWatch || [];
  ok('(W3) on lair tile: one row, onTile + arrived, no walk needed',
    rows.length === 1 && rows[0].onTile === true && rows[0].arrived === true && !rows[0].held &&
    rows[0].from && rows[0].from[0] === 7 && rows[0].from[1] === 4,
    JSON.stringify(rows));
}
// (W4) off-tile + walkable -> arrived, from recorded.
{
  const G = stubGame({ stage: 2, ready: true, walkable: true });
  const ctx = stubCtx();
  D.marchStep(G, ctx);
  const rows = ctx.marchWatch || [];
  ok('(W4) off-tile, walkable: one row, arrived at 7,4, from 4,4',
    rows.length === 1 && rows[0].arrived === true && !rows[0].held &&
    rows[0].from && rows[0].from[0] === 4 && rows[0].from[1] === 4 &&
    rows[0].lair && rows[0].lair[0] === 7 && rows[0].lair[1] === 4,
    JSON.stringify(rows));
}
// (W5) tbfight live -> held 'tbfight', no walk (still at 4,4).
{
  const G = stubGame({ stage: 2, ready: true, tbfight: true });
  const ctx = stubCtx();
  D.marchStep(G, ctx);
  const rows = ctx.marchWatch || [];
  ok('(W5) live fight: held tbfight, scholar unmoved',
    rows.length === 1 && rows[0].held === 'tbfight' && G.map.px === 4 && G.map.py === 4,
    JSON.stringify(rows));
}
// (W6) tableActive -> held 'tableActive'.
{
  const G = stubGame({ stage: 2, ready: true, tableActive: true });
  const ctx = stubCtx();
  D.marchStep(G, ctx);
  const rows = ctx.marchWatch || [];
  ok('(W6) table active: held tableActive, scholar unmoved',
    rows.length === 1 && rows[0].held === 'tableActive' && G.map.px === 4,
    JSON.stringify(rows));
}
// (W7) slain -> no rows.
{
  const G = stubGame({ stage: 2, ready: true, slain: true });
  const ctx = stubCtx();
  D.marchStep(G, ctx);
  ok('(W7) titan slain: no march rows', (ctx.marchWatch || []).length === 0, JSON.stringify(ctx.marchWatch));
}
// (W8) absent -> no rows.
{
  const G = stubGame({ stage: 2, ready: true, present: false });
  const ctx = stubCtx();
  D.marchStep(G, ctx);
  ok('(W8) herald absent: no march rows (nothing to march against)', (ctx.marchWatch || []).length === 0, JSON.stringify(ctx.marchWatch));
}
// (W9) same-day second marchStep -> no new rows (day guard).
{
  const G = stubGame({ stage: 2, ready: true, walkable: true });
  const ctx = stubCtx();
  D.marchStep(G, ctx);
  D.marchStep(G, ctx);
  ok('(W9) same-day second marchStep: no new rows (day guard)',
    (ctx.marchWatch || []).length === 1, JSON.stringify(ctx.marchWatch));
}
// (W10) walk blocked -> held 'blocked-at:4,4'.
{
  const G = stubGame({ stage: 2, ready: true, walkable: false });
  const ctx = stubCtx();
  D.marchStep(G, ctx);
  const rows = ctx.marchWatch || [];
  ok('(W10) walk refused: held blocked-at:4,4, scholar unmoved',
    rows.length === 1 && rows[0].held === 'blocked-at:4,4' && G.map.px === 4 && G.map.py === 4,
    JSON.stringify(rows));
}
// (W11) walk arrives and the engine sets a pending encounter -> pending true.
{
  const G = stubGame({ stage: 2, ready: true, walkable: true, setsPending: true });
  const ctx = stubCtx();
  D.marchStep(G, ctx);
  const rows = ctx.marchWatch || [];
  ok('(W11) arrival sets pending encounter for the herald: pending true',
    rows.length === 1 && rows[0].arrived === true && rows[0].pending === true,
    JSON.stringify(rows));
}
console.log(`r275 march proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
