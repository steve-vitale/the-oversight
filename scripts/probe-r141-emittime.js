#!/usr/bin/env node
// probe-r141-emittime.js — TEMPORARY diagnostic (not a proof test).
// Question: on seed 41802, were the M6 lines the corrected slice found
// on "stranded" days actually emitted while the scholar was AWAY (a real
// hole in the fix) or while AT Haven (a day-attribution artifact: the
// slice covers the previous day's parts, the stranded flag reads the
// next morning's position)?
// Method: run seed 41802 with the socialite policy for 55 days, classify
// every burst/settle/witness/tale line AT EMIT TIME with the scholar's
// position then. A line emitted while away = real hole; all lines
// emitted at Haven = attribution artifact.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { socialite } = require('./policies/socialite');
const gc = require('./policies/gossipcensus-diag');

(async () => {
  const { Game, manifest } = await loadGame({ seed: 41802, mode: 'probe-r141-emittime', fullTelemetry: true, narration: true });
  const away = { burst: [], settle: [], witness: [], tale: [] };
  const home = { burst: 0, settle: 0, witness: 0, tale: 0 };
  const _emit = Game.emit;
  Game.emit = function (...a) {
    try {
      const t = String(a[0] || '');
      let kind = null;
      if (gc.isGossipBurstLine(t)) kind = 'burst';
      else if (gc.isSettleLine(t)) kind = 'settle';
      else if (/came back from the treeline white-faced/.test(t)) kind = 'witness';
      else if (/The fire settles\./.test(t)) kind = 'tale';
      if (kind) {
        let atHaven = null;
        try { atHaven = Game.scholarAtHaven(); } catch (e) {}
        if (atHaven) home[kind]++;
        else away[kind].push({ day: (Game.state.scholar || {}).day || 0, text: t.slice(0, 120) });
      }
    } catch (e) {}
    try { return _emit.apply(this, a); } catch (e) { return a[0]; }
  };
  await setupGame(Game);
  await runDays(Game, socialite, { days: 55, manifest });
  console.log('emitted AT HAVEN: ' + JSON.stringify(home));
  console.log('emitted AWAY: burst=' + away.burst.length + ' settle=' + away.settle.length + ' witness=' + away.witness.length + ' tale=' + away.tale.length);
  for (const k of ['burst', 'settle', 'witness', 'tale']) {
    for (const l of away[k]) console.log('  AWAY ' + k + ' d' + l.day + ': ' + l.text);
  }
  console.log('namingKicked=' + Object.values((Game.state.codex || {}).monsters || {}).filter(e => e.namingKicked).length + ' settled=' + Object.values((Game.state.codex || {}).monsters || {}).filter(e => e.villageName).length);
  console.log('pendingHavenNews=' + (Game.state.pendingHavenNews || []).length);
})().catch((e) => { console.error('PROBE CRASH', e && (e.stack || e)); process.exit(2); });
