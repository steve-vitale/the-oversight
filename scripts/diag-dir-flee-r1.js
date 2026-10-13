#!/usr/bin/env node
// diag-dir-flee-r1.js — r2 diagnostic: where do scholars die in tb fights,
// and what did the directional lever do in each fight?
// Tracks per fight: node, monsters, turns, holds/pushes/walks, scholar death.
// Usage: COMPETENT_DIRECTIONAL_FLEE=1 SEEDS="44" node scripts/diag-dir-flee-r1.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

(async () => {
  const seeds = (process.env.SEEDS || '44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'dirfleediag' });
    await setupGame(Game);
    const fights = [];
    let cur = null;
    const base = Object.assign({}, competent);
    const origFight = competent.fight;
    const origDaily = competent.daily;
    base.daily = (G, ctx) => { try { return origDaily(G, ctx); } catch (e) {} };
    base.fight = (G, ctx) => {
      const f = G.tbfight;
      if (f && (!cur || cur.f !== f)) {
        let who = '?';
        try { who = G.villagerId; } catch (e) {}
        let node = '?';
        try { node = `(${G.map.px},${G.map.py})`; } catch (e) {}
        cur = {
          f, seed, who, node,
          mons: (f.fighters || []).filter(x => x.kind === 'monster').map(x => x.monsterId + ':' + Math.round(x.hp || 0)),
          turns: 0, holds: 0, pushes: 0, walks: 0, fledBad: 0,
          scholarDied: false, endNode: null, pushDests: [],
        };
        fights.push(cur);
      }
      const h0 = ctx.fledHeld || 0, p0 = ctx.dirPushes || 0, w0 = ctx.dirWalks || 0, fb0 = ctx.fledBad || 0;
      let whoBefore = '?';
      try { whoBefore = G.villagerId; } catch (e) {}
      const r = origFight(G, ctx);
      if (cur && cur.f === f) {
        cur.turns++;
        let whoAfter = '?';
        try { whoAfter = G.villagerId; } catch (e) {}
        if (whoAfter !== cur.who) { cur.scholarDied = true; cur.who = whoAfter; }
        if ((ctx.fledHeld || 0) > h0) cur.holds++;
        if ((ctx.dirPushes || 0) > p0) {
          cur.pushes++;
          try { cur.pushDests.push(`(${G.map.px},${G.map.py})`); } catch (e) {}
        }
        if ((ctx.dirWalks || 0) > w0) cur.walks++;
        if ((ctx.fledBad || 0) > fb0) cur.fledBad++;
        try { cur.endNode = `(${G.map.px},${G.map.py})`; } catch (e) {}
      }
      return r;
    };
    await runDays(Game, base, { days: 150, sampleEvery: 150 });
    const died = fights.filter(x => x.scholarDied);
    console.log(`\nseed ${seed}: ${fights.length} fights, ${died.length} scholar-deaths in fight`);
    for (const x of died) {
      console.log(`  DIED node=${x.node}->${x.endNode} mons=[${x.mons.join(',')}] turns=${x.turns} holds=${x.holds} pushes=${x.pushes}${x.pushDests.length ? '->' + x.pushDests.join('') : ''} walks=${x.walks} fledBad=${x.fledBad}`);
    }
    const heldFights = fights.filter(x => x.holds > 0 && !x.scholarDied).length;
    const pushFights = fights.filter(x => x.pushes > 0);
    console.log(`  fights with holds (survived): ${heldFights}, fights with pushes: ${pushFights.length}`);
    for (const x of pushFights) {
      console.log(`  PUSH node=${x.node}->${x.endNode} mons=[${x.mons.join(',')}] died=${x.scholarDied} dests=${x.pushDests.join('')}`);
    }
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
