#!/usr/bin/env node
// test-wave4flip-diverge-b.js — W2-vs-W3 divergence probe for seed 10421
// (sim-wave4flip-b; diagnostic follow-up to the committed prereg, NOT a
// judged metric change: the judged verdict rests on
// scripts/test-wave4flip-b.js band + standalone runs).
//
// Same band substrate as test-wave4flip-b.js (competent policy, 100d,
// seed 10421), plus a READ-ONLY daily snapshot of the wave-4 unlock
// inputs: unlockedWave, villageStanding() breakdown, gated total,
// waveUnlockReady(4) bars, wave ledger points, waveKillLog length,
// living roster. Nothing here writes game state. Also captures say
// lines mentioning standing/waves/readiness (the unlock/hold beats)
// for the sense read.
//
// Run: node scripts/test-wave4flip-diverge-b.js 10421
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

(async () => {
  const seed = Number(process.argv[2] || 10421);
  const { Game } = await loadGame({ seed, mode: 'caughtlift-fix-band', fullTelemetry: false });
  const waveLines = [];
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (...args) {
      try {
        const l = String(args[0] || '');
        if (/standing|ready|Mirror Draft|wave 4|fourth draft/i.test(l) && waveLines.length < 200) waveLines.push(l);
      } catch (e) {}
      return origSay.apply(this, args);
    };
  }
  await setupGame(Game);
  const snap = () => {
    try {
      const s = Game.villageStanding ? Game.villageStanding() : {};
      const rd = Game.waveUnlockReady ? Game.waveUnlockReady(4) : {};
      return {
        day: Game.state.scholar ? Game.state.scholar.day : '?',
        wave: Game.unlockedWave ? Game.unlockedWave() : '?',
        gated: Game.villageStandingTotal ? Game.villageStandingTotal() : '?',
        standing: { war: s.war | 0, diplomacy: s.diplomacy | 0, plenty: s.plenty | 0, total: s.total | 0 },
        ready: !!rd.ready, armored: rd.armored | 0, armed: rd.armed | 0,
        tricks: rd.tricks | 0, veterans: rd.veterans | 0, short: rd.short || [],
        ledger: [1, 2, 3].map(w => { try { return Game.waveLedgerPoints(w) | 0; } catch (e) { return '?'; } }),
        killLog: (Game.state.waveKillLog || []).length,
        roster: (Game.state.village.roster || []).length,
      };
    } catch (e) { return { error: String(e && e.message || e) }; }
  };
  const snaps = [];
  const base = competent;
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try { snaps.push(snap()); } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days: 100, sampleEvery: 10 });
  // Print every-10th-day snapshots + the final one, to bound output.
  const thinned = snaps.filter((_, i) => i % 10 === 0 || i === snaps.length - 1);
  console.log('DIVERGE seed=' + seed + ' days=' + result.days + ' end=' + result.endReason + ' wave=' + (result.maxWaveUnlocked || 1));
  for (const s of thinned) console.log('  SNAP ' + JSON.stringify(s));
  console.log('WAVE LINES ' + JSON.stringify(waveLines));
  console.log('FINAL ' + JSON.stringify(snap()));
})().catch(e => { console.error('DIVERGE CRASH', e && e.stack || e); process.exit(2); });
