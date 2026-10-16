#!/usr/bin/env node
'use strict';
// Diagnostic: why did observefarm's seek side engage 0 targets in 50 hunts?
// Samples Game.monsterAt across monster-country nodes on a live wave-3 game
// and reports what trickTargetOf sees.
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const OF_PATH = (() => { try { return require.resolve('./policies/observefarm'); } catch (e) { return null; } })();
if (!OF_PATH) { console.log('INFO-SKIP: layer absent'); process.exit(0); }
const OF = require(OF_PATH);
const WD = require('./policies/windefer');
const TF = require('./policies/tribfloor');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`need ${k}=1`); process.exit(2); }
}

(async () => {
  const tf = TF.belongfeast;
  const base = WD.withWinDefer(tf, 'belongfeast-windefer', 'diag');
  const { Game } = await loadGame({ seed: 141, mode: 'of-diag' });
  await setupGame(Game);
  // fast-forward to wave-3 with the naked base (no hunts)
  await quietLog(async () => { await runDays(Game, base, { days: 90, sampleEvery: 90 }); });
  const uw = Game.unlockedWave ? Game.unlockedWave() : '?';
  console.log(`unlockedWave=${uw} day=${(Game.state.scholar || {}).day}`);
  const defs = Game.villagerTrickDefs ? Game.villagerTrickDefs() : {};
  console.log('trick defs:', Object.keys(defs).join(','));
  let nodes = 0, withMonster = 0, trickBearer = 0, target = 0;
  const seenMids = {};
  const samples = [];
  const home = { x: Game.map.px, y: Game.map.py };
  for (const tt of (Game.travelTargets() || [])) {
    let t = null;
    try { t = Game.tileAt(tt.x, tt.y); } catch (e) {}
    if (!t || t.type === 'haven' || t.type === 'oldhaven') continue;
    if (!['thicket', 'ruin', 'forest', 'grove'].includes(t.type)) continue;
    nodes++;
    try { Game.travelTo(tt.x, tt.y); } catch (e) { continue; }
    if (Game.tbfight || Game.over) break; // honest gradient fired — stop sampling
    let wm = null;
    try { wm = Game.monsterAt(Game.map.px, Game.map.py); } catch (e) {}
    if (wm) {
      withMonster++;
      const mid = OF.beastMidOf(wm);
      const wave = OF.beastWaveOf(Game, mid);
      seenMids[mid] = (seenMids[mid] || 0) + 1;
      const isTrick = !!defs[mid];
      const isTarget = OF.trickTargetOf(Game, mid) != null;
      if (isTrick) trickBearer++;
      if (isTarget) target++;
      if (samples.length < 8) samples.push({ mid, wave, isTrick, isTarget, keys: Object.keys(wm).slice(0, 12) });
    }
  }
  console.log(`nodes=${nodes} withMonster=${withMonster} trickBearer=${trickBearer} target=${target}`);
  console.log('samples:', JSON.stringify(samples, null, 1).slice(0, 2000));
  console.log('mid histogram:', JSON.stringify(seenMids).slice(0, 1000));
})().catch(e => { console.error('DIAG CRASH:', e); process.exit(2); });
