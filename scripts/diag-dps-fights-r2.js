#!/usr/bin/env node
// diag-dps-fights-r2.js — r1 follow-up: scholar-death-aware fight log.
// The scholar respawns as another villager on death (Game.over stays false),
// so r1's death detection missed everything. Track Game.villagerId across
// each fight: a change mid-fight = the scholar died in it.
// Also logs flee-walk progress (does the edge walk actually complete?).
// Usage: SEEDS="11,22,33,44" node scripts/diag-dps-fights-r2.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

(async () => {
  const seeds = (process.env.SEEDS || '11').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'dpsdiag2' });
    await setupGame(Game);
    const fights = [];
    let cur = null;
    const base = Object.assign({}, competent);
    const origFight = competent.fight;
    base.fight = (G, ctx) => {
      const f = G.tbfight;
      if (f && (!cur || cur.f !== f)) {
        let who = '?';
        try { who = G.villagerId; } catch (e) {}
        cur = {
          f, seed, who,
          mons: (f.fighters || []).filter(x => x.kind === 'monster').map(x => x.monsterId + ':' + Math.round(x.hp || 0)),
          turns: 0, dpsFledAt: 0, fledAt: 0, fledBadAt: 0, fledCount: 0,
          windows: [], pxTrace: [],
        };
        fights.push(cur);
      }
      if (cur && cur.f === f) {
        cur.turns++;
        try {
          const p = G.tbFighter('p');
          if (p && cur.turns <= 12) cur.pxTrace.push(`${p.mx},${p.my}@${Math.round(p.hp)}`);
        } catch (e) {}
        let whoNow = '?';
        try { whoNow = G.villagerId; } catch (e) {}
        if (whoNow !== cur.who) { cur.scholarDiedAt = cur.scholarDiedAt || cur.turns; cur.who = whoNow; }
      }
      const d0 = ctx.dpsFled || 0, f0 = ctx.fled || 0, fb0 = ctx.fledBad || 0, w0 = ctx.dpsWindows || 0;
      let whoBefore = '?';
      try { whoBefore = G.villagerId; } catch (e) {}
      const r = origFight(G, ctx);
      if (cur && cur.f === f) {
        let whoAfter = '?';
        try { whoAfter = G.villagerId; } catch (e) {}
        if (whoAfter !== whoBefore) cur.scholarDiedAt = cur.scholarDiedAt || cur.turns;
        if (whoAfter !== cur.who) { cur.who = whoAfter; }
        if ((ctx.dpsFled || 0) > d0) cur.dpsFledAt = cur.dpsFledAt || cur.turns;
        if ((ctx.fled || 0) > f0) { cur.fledAt = cur.fledAt || cur.turns; cur.fledCount++; }
        if ((ctx.fledBad || 0) > fb0 && !cur.fledBadAt) cur.fledBadAt = cur.turns;
        if ((ctx.dpsWindows || 0) > w0) {
          const st = ctx._dpsRace;
          cur.windows.push(`t${cur.turns}:streak=${st ? st.lostStreak : '?'}`);
        }
      }
      try {
        if ((!G.tbfight || G.tbfight.over || G.tbfight !== (cur && cur.f)) && cur && !cur.done) {
          cur.done = true;
          cur.endedHow = !G.tbfight ? 'tbfight-null' : (G.tbfight.over ? 'over' : 'replaced');
        }
      } catch (e) {}
      return r;
    };
    await runDays(Game, base, { days: 150, sampleEvery: 10 });
    console.log(`\n--- seed ${seed}: ${fights.length} fights ---`);
    const died = fights.filter(x => x.scholarDiedAt);
    console.log(`scholar deaths in fights: ${died.length}`);
    for (const ft of fights) {
      if (ft.scholarDiedAt || ft.turns >= 5 || ft.windows.length || ft.dpsFledAt) {
        console.log(`  turns=${ft.turns} mons=[${ft.mons.join(',')}] died@${ft.scholarDiedAt || '-'} ` +
          `dpsFled@${ft.dpsFledAt || '-'} fled@${ft.fledAt || '-'}x${ft.fledCount} fledBad@${ft.fledBadAt || '-'} ` +
          `end=${ft.endedHow || '?'} windows=[${ft.windows.join(' ')}]`);
        if (ft.turns >= 5 || ft.dpsFledAt) console.log(`    trace: ${ft.pxTrace.join(' ')}`);
      }
    }
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
