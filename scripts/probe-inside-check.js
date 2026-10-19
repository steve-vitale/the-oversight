#!/usr/bin/env node
// Manual mechanism check: does fighting INSIDE (with villagers inside)
// produce joiners? Uses the real harness + real game code.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

(async () => {
  const { Game } = await loadGame({ seed: 63511, mode: 'inside-check', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  // Fast-forward to a night with villagers: use the engine's day/part.
  // We'll manually set up: scholar at Haven, inside, villagers inside.
  const s = Game.state.scholar;
  const v = Game.state.village;
  // Ensure we're at Haven node
  console.log('map:', Game.map.px, Game.map.py, 'haven:', v.px, v.py);
  console.log('scholar inside:', s.insideHaven, 'atHaven:', Game.playerAtHaven());
  console.log('roster:', (v.roster || []).length);
  // Villager inside/outside + node
  let inside = 0, outside = 0, away = 0;
  for (const rid of (v.roster || [])) {
    if (rid === Game.villagerId) continue;
    const np = (v.nodePos || {})[rid];
    const atHaven = np && np.nx === (v.px ?? 4) && np.ny === (v.py ?? 4);
    if (!atHaven) { away++; continue; }
    if (Game.npcInside(rid)) inside++; else outside++;
  }
  console.log(`villagers: inside=${inside} outside=${outside} away=${away}`);
  console.log('positions count:', Object.keys(v.positions || {}).length);
  // Force the scholar inside, then move a step to trigger ensureVillagerPositions
  if (Game.playerAtHaven() && !s.insideHaven) {
    console.log('goInside:', Game.goInside ? Game.goInside() : 'no verb');
  }
  console.log('after goInside: scholar inside=', s.insideHaven, 'mx,my=', s.mx, s.my);
  console.log('positions count:', Object.keys(v.positions || {}).length);
  // Move one step (triggers ensureVillagerPositions via microMove)
  try {
    if (Game.microMove) { Game.microMove(4, 6); console.log('microMove done'); }
  } catch (e) { console.log('microMove err', e.message); }
  console.log('positions count after move:', Object.keys(v.positions || {}).length);
  const vpos = v.positions || {};
  const px = s.mx ?? 4, py = s.my ?? 4;
  let inRange = 0;
  for (const rid of Object.keys(vpos)) {
    const p = vpos[rid];
    const d = Math.max(Math.abs(p.mx - px), Math.abs(p.my - py));
    if (d <= 4) inRange++;
  }
  console.log(`scholar at (${px},${py}); villagers in range: ${inRange}/${Object.keys(vpos).length}`);
  process.exit(0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
