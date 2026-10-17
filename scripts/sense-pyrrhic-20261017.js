#!/usr/bin/env node
// sense-pyrrhic-20261017.js — SENSE-TESTING LAW for the sim-pyrrhic arm.
// Captures the verbatim say/sysSay beats around a known pyrrhic kill
// (belongfeast-s1812, seq 3, day 21, gallowdeer/move_windup — scholar dies
// taking the deer with it) WITH the attribution fix, and prints them for a
// human meaning-judgment: does the village learning / codex 'slain' read
// coherently against the defeat narration?
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0 node scripts/sense-pyrrhic-20261017.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const TF = require(path.join(ROOT, 'scripts', 'policies', 'tribfloor'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR']) {
  if (process.env[k] !== '1') { console.error(`SENSE STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SENSE STOP: SEATDRIVE=0 required.'); process.exit(2); }

(async () => {
  const { Game } = await loadGame({ seed: 1812, mode: 'pyrrhic-sense', fullTelemetry: false });
  await setupGame(Game);

  // Wrap say/sysSay: capture verbatim beats with the current day.
  const beats = [];
  const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const _say = Game.say, _sys = Game.sysSay;
  Game.say = function (t) { try { beats.push({ d: gday(), who: 'say', t: String(t) }); } catch (e) {} return _say.apply(this, arguments); };
  Game.sysSay = function (t) { try { beats.push({ d: gday(), who: 'sys', t: String(t) }); } catch (e) {} return _sys.apply(this, arguments); };

  // Find the pyrrhic fight: wrap tbEnd, note the day of any lost fight with
  // a dead trick-bearing monster and a dead scholar.
  const pyrrhicDays = [];
  const _tbEnd = Game.tbEnd.bind(Game);
  Game.tbEnd = function (result) {
    try {
      const f = Game.tbfight;
      if (f && !f.over && result === 'lost') {
        const p = Game.tbFighter ? Game.tbFighter('p') : null;
        const deadM = (f.fighters || []).filter(x => x && x.kind === 'monster' && !x.alive && x.mdef);
        if (p && !p.alive && deadM.length) {
          pyrrhicDays.push({ d: gday(), mids: deadM.map(m => m.mdef.id) });
        }
      }
    } catch (e) {}
    return _tbEnd(result);
  };

  await quietLog(async () => { await runDays(Game, TF.belongfeast, { days: 180, manifest: undefined, sampleEvery: 30 }); });

  console.log('PYRRHIC FIGHTS (lost, scholar dead, monster dead): ' + JSON.stringify(pyrrhicDays));
  const st = Game.state || {};
  console.log('codex gallowdeer stage: ' + JSON.stringify((((st.codex || {}).monsters || {}).gallowdeer || {}).stage || null));
  console.log('villageSlain gallowdeer: ' + (((st.villageSlain || {}).gallowdeer) | 0));
  const wkl = (st.waveKillLog || []).filter(e => e && e.mid === 'gallowdeer');
  console.log('waveKillLog gallowdeer entries: ' + JSON.stringify(wkl.map(e => ({ d: e.d, trick: e.trick, by: e.by, via: e.via }))));
  for (const pd of pyrrhicDays) {
    console.log('\n===== BEATS day ' + (pd.d - 1) + ' .. ' + (pd.d + 1) + ' (pyrrhic: ' + pd.mids.join(',') + ', d' + pd.d + ') =====');
    for (const b of beats) {
      if (b.d >= pd.d - 1 && b.d <= pd.d + 1) console.log(`[d${b.d} ${b.who}] ${b.t}`);
    }
  }
})().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
