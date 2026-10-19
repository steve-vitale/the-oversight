// FORAGER BREAK-IT 2026-10-11 r2: strip-and-regrow softlock + cost honesty.
// SOFTLOCK probe: pick a wild tile's grid clean with real doAction('forage')
// presses, then jump 3 days and run regrowTiles — the forager must not be
// stranded on a permanently barren tile.
// HONESTY probe: each press must advance exactly 16 ticks and charge exactly
// 60 kcal (the promised "quick 16-tick beat"); the "+K kcal" in the sweep
// message must equal the edible kcal actually added to the pack.
'use strict';
const h = require('./break-monsters-harness.js');
h.ORDER.splice(h.ORDER.indexOf('src/js/hierarchy.js'), 0, 'src/js/havenGrowth.js');

async function main() {
  const G = await h.freshGame(777);
  const s = G.state.scholar;
  let fails = 0;
  const check = (n, c, d) => { console.log((c ? 'PASS' : 'FAIL') + ' | ' + n + (d ? ' | ' + d : '')); if (!c) fails++; };
  const says = [];
  G.say = (m) => says.push(String(m));

  G.debugToWildNode();
  const t = G.playerTile();
  check('R0 on a wild node', t && t.type !== 'haven' && t.type !== 'ruin', 'tile=' + (t && t.type));
  const detail = G.genDetail(G.map.px, G.map.py);
  // KNOWLEDGE: identify every plant species on this tile (L4) so hauls are
  // named and kcal-counted — the honest-haul path.
  const pids = new Set();
  for (let y = 0; y <= 8; y++) for (let x = 0; x <= 8; x++) {
    const c = detail[y] && detail[y][x];
    if (!['plant', 'bush', 'tree', 'bigtree'].includes(c)) continue;
    const pid = G.cellPlantSpecies(t, x, y, c);
    if (pid) pids.add(pid);
  }
  G.state.codex.plants = G.state.codex.plants || {};
  for (const pid of pids) G.state.codex.plants[pid] = { level: 4, identifiedDay: s.day, harvests: 99 };
  check('R0b species present', pids.size > 0, pids.size + ' species');

  s.inventory = [];
  s.kcal = 2500;
  s.dayTicks = 0;
  G.dayPart = 0;

  const greens = () => {
    const out = [];
    for (let y = 0; y <= 8; y++) for (let x = 0; x <= 8; x++) {
      const c = detail[y] && detail[y][x];
      if (!['plant', 'bush', 'tree', 'bigtree'].includes(c)) continue;
      if (t.detailRegrow && t.detailRegrow[x + ',' + y]) continue;
      if (G.cellScorched(x, y)) continue;
      out.push([x, y]);
    }
    return out;
  };
  const packKcal = () => s.inventory.reduce((a, i) => a + ((i.edible === false ? 0 : (i.kcalEach || 0)) * (i.units || 1)), 0);

  // H1/H2/H3: press until the tile is picked clean.
  let presses = 0, blocked = 0, cleanMsg = null;
  let costOk = true, msgKcalOk = true, note = '';
  for (let guard = 0; guard < 60; guard++) {
    const g = greens();
    if (!g.length) break;
    const [gx, gy] = g[0];
    // stand adjacent (the sweep works the 3x3 around you)
    s.mx = Math.max(0, gx - 1); s.my = gy;
    says.length = 0;
    // a villager's 'bring me X' quest turned in on this press takes food out
    // of the pack mid-measure; whether one is open is roster luck
    // (origins-world 2026-10-14). H3 measures the forage message vs the haul.
    s.activeQuest = null;
    const kcalBefore = s.kcal, ticksBefore = s.dayTicks, packBefore = packKcal();
    G.doAction('forage');
    const msg = says.join(' || ');
    const dKcal = s.kcal - kcalBefore, dTicks = s.dayTicks - ticksBefore, dPack = packKcal() - packBefore;
    if (/pack is full/i.test(msg)) {
      // PACK-FULL BLOCK (honest): the press must be free — no ticks, no kcal.
      blocked++;
      if (dTicks !== 0 || dKcal !== 0) { costOk = false; note = `blocked press charged ticks=${dTicks} kcal=${dKcal}`; }
      s.inventory = []; // eat it off-screen; keep stripping the tile
      s.kcal = 2500;
      continue;
    }
    presses++;
    if (dTicks !== 16) { costOk = false; note = `press ${presses}: ticks +${dTicks} (want 16)`; }
    const expectedCost = 60 + Math.ceil(G.burden().workAdd * 16 / G.TIME.TICKS_PER_BATCH);
    if (dKcal !== -expectedCost) { costOk = false; note = `press ${presses}: kcal ${dKcal} (want -${expectedCost}, including actual burden)`; }
    const m = msg.match(/\(([\d,]+) kcal\)/);
    if (m) {
      const promised = parseInt(m[1].replace(/,/g, ''), 10);
      if (promised !== dPack) { msgKcalOk = false; note = `press ${presses}: msg says ${promised} kcal, pack gained ${dPack}`; }
    }
    if (/worked out|nothing within reach/i.test(msg)) { cleanMsg = msg; break; }
  }
  check('H1 every press advanced exactly 16 ticks', costOk && presses > 0, note || `${presses} presses, ${blocked} blocked-free`);
  check('H2 every press charged base60 plus its actual burden effort', costOk, note || `${presses} presses, ${blocked} blocked-free`);
  check('H3 message kcal == pack kcal gained', msgKcalOk, note || `${presses} presses`);

  // S1: the picked-clean press charges nothing and says something honest.
  const g0 = greens().length;
  says.length = 0;
  const k0 = s.kcal, t0 = s.dayTicks;
  G.doAction('forage');
  const cleanSaid = says.join(' || ');
  check('S1 picked-clean press is free and honest',
    g0 === 0 && s.kcal === k0 && s.dayTicks === t0 && /worked out|nothing within reach|nothing left to take here/i.test(cleanSaid),
    `greens=${g0} kcalΔ=${s.kcal - k0} ticksΔ=${s.dayTicks - t0} msg="${cleanSaid.slice(0, 80)}"`);

  // S2: three days later the ground gives again (no stranded forager).
  const regrowBefore = Object.keys(t.detailRegrow || {}).length;
  s.day += 3;
  G.regrowTiles(s.day);
  const regrowAfter = Object.keys(t.detailRegrow || {}).length;
  const greensAfter = greens().length;
  check('S2 regrow consumed the depletion ledger', regrowBefore > 0 && regrowAfter === 0,
    `ledger ${regrowBefore} -> ${regrowAfter}`);
  check('S3 green cells restored', greensAfter > 0, `${greensAfter} green cells`);
  says.length = 0;
  if (greensAfter) {
    const [gx, gy] = greens()[0];
    s.mx = Math.max(0, gx - 1); s.my = gy;
    s.inventory = []; s.kcal = 2500; // fresh pack, clean read
    const pkBefore = packKcal();
    G.doAction('forage');
    check('S4 post-regrow press yields food', packKcal() > pkBefore,
      `pack kcal ${pkBefore} -> ${packKcal()}; msg="${says.join(' || ').slice(0, 90)}"`);
  }

  console.log(fails ? `\n${fails} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
