#!/usr/bin/env node
// probe: what doors does the feastscale road earn at sit time? (fixed: dumps
// collected inside the loop, printed after quietLog restores console.log)
// FEASTSCALE_R13=1 SEATDRIVE=0 TAKESEAT=1 node scripts/probe-modalplay-doors-20261017.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadtakeseat, belongtakeseat } = require('./policies/takeseat');

const SEEDS = [9801, 9802, 9803];
const ROADS = { leadfeast: leadtakeseat, belongfeast: belongtakeseat };

(async () => {
  for (const [road, policy] of Object.entries(ROADS)) {
    for (const seed of SEEDS) {
      const { Game } = await loadGame({ seed, mode: `modalplay-probe-${road}` });
      await setupGame(Game);
      const dumps = [];
      let dumped = false;
      const baseDaily = policy.daily;
      const wrapped = Object.assign({}, policy, {
        daily(G, ctx) {
          let r;
          try { r = baseDaily ? baseDaily(G, ctx) : undefined; } catch (e) { r = undefined; }
          try {
            const T = G.tableState ? G.tableState() : {};
            const tc = (G.state.scholar || {}).tableChoices;
            if (!dumped && T.phase === 'paths' && !T.path && tc && tc.options && tc.options.length) {
              dumped = true;
              const day = (G.state.scholar || {}).day;
              const earned = (typeof G.tableEarnedPaths === 'function') ? G.tableEarnedPaths() : [];
              const d = { road, seed, day, doors: [], optionIds: tc.options.map(o => o.id) };
              for (const p of earned) {
                d.doors.push({ id: p.id, earned: !!p.earned, strength: p.strength, why: String(p.why).slice(0, 90) });
              }
              try {
                const L = G.ledger ? G.ledger() : {};
                d.exposed = L.exposed | 0; d.killed = L.killed | 0; d.protected = L.protected | 0;
              } catch (e) {}
              dumps.push(d);
              try { G.over = true; } catch (e) {} // stop once we have the offer
            }
          } catch (e) { dumps.push({ road, seed, error: e.message }); }
          return r;
        },
      });
      await quietLog(async () => { await runDays(Game, wrapped, { days: 180, sampleEvery: 30 }); });
      if (!dumps.length) {
        let td = '?';
        try { td = Game.progState().tableDone; } catch (e) {}
        console.log(`=== ${road} s${seed}: NO DOOR OFFER SEEN (tableDone=${td})`);
      }
      for (const d of dumps) {
        console.log(`=== ${d.road} s${d.seed} day=${d.day}`);
        for (const p of d.doors) console.log(`  ${p.earned ? 'EARNED' : '      '} ${p.id} strength=${p.strength} why=${p.why}`);
        console.log('  option ids: ' + (d.optionIds || []).join(', '));
        console.log(`  ledger: exposed=${d.exposed} killed=${d.killed} protected=${d.protected}`);
      }
    }
  }
})().catch(e => { console.error('PROBE FATAL', e); process.exit(1); });
