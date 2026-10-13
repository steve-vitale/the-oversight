#!/usr/bin/env node
// diag-dps-fights-r1.js — WHY does the DPS-race lever almost never fire?
// Wraps competent.fight and logs per-fight: monsters, player turns, outcome,
// dps windows/verdicts. Read the fights, not just the counts.
// Usage: SEEDS="11,22,33,44" node scripts/diag-dps-fights-r1.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

(async () => {
  const seeds = (process.env.SEEDS || '11').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'dpsdiag' });
    await setupGame(Game);
    const fights = [];
    let cur = null;
    const base = Object.assign({}, competent);
    const origFight = competent.fight;
    base.fight = (G, ctx) => {
      const f = G.tbfight;
      if (f && (!cur || cur.f !== f)) {
        cur = {
          f, seed,
          mons: (f.fighters || []).filter(x => x.kind === 'monster').map(x => x.monsterId + ':' + Math.round(x.hp || 0)),
          turns: 0, dpsFledAt: 0, fledAt: 0, fledBadAt: 0,
          windows: [],
        };
        fights.push(cur);
      }
      if (cur && cur.f === f) cur.turns++;
      const d0 = ctx.dpsFled || 0, f0 = ctx.fled || 0, fb0 = ctx.fledBad || 0, w0 = ctx.dpsWindows || 0;
      const r = origFight(G, ctx);
      if (cur && cur.f === f) {
        if ((ctx.dpsFled || 0) > d0) cur.dpsFledAt = cur.dpsFledAt || cur.turns;
        if ((ctx.fled || 0) > f0 && !cur.fledAt) cur.fledAt = cur.turns;
        if ((ctx.fledBad || 0) > fb0 && !cur.fledBadAt) cur.fledBadAt = cur.turns;
        if ((ctx.dpsWindows || 0) > w0) {
          const st = ctx._dpsRace;
          cur.windows.push(`t${cur.turns}:streak=${st ? st.lostStreak : '?'}`);
        }
      }
      // fight ended?
      try {
        if (!G.tbfight || G.tbfight.over || G.tbfight !== (cur && cur.f)) {
          if (cur && !cur.outcome) {
            cur.outcome = G.over ? 'PLAYER-DIED' : 'ended';
            cur.php = null;
            try { const p = G.tbFighter('p'); cur.php = p ? Math.round(p.hp) : null; } catch (e) {}
          }
        }
      } catch (e) {}
      return r;
    };
    await runDays(Game, base, { days: 150, sampleEvery: 10 });
    // finalize outcomes: a fight whose monster list all died = won
    console.log(`\n--- seed ${seed}: ${fights.length} fights ---`);
    const byLen = {};
    let died = 0;
    for (const ft of fights) {
      byLen[ft.turns] = (byLen[ft.turns] || 0) + 1;
      if (ft.outcome === 'PLAYER-DIED') died++;
    }
    const lens = Object.keys(byLen).map(Number).sort((a, b) => a - b);
    console.log('fight player-turns distribution:', lens.map(l => `${l}:${byLen[l]}`).join(' '));
    console.log('player deaths in fights:', died);
    // show the interesting ones: long fights, dps windows, deaths
    for (const ft of fights) {
      if (ft.turns >= 5 || ft.windows.length || ft.outcome === 'PLAYER-DIED' || ft.dpsFledAt) {
        console.log(`  turns=${ft.turns} mons=[${ft.mons.join(',')}] outcome=${ft.outcome || '?'} php=${ft.php} dpsFled@${ft.dpsFledAt || '-'} fled@${ft.fledAt || '-'} fledBad@${ft.fledBadAt || '-'} windows=[${ft.windows.join(' ')}]`);
      }
    }
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
