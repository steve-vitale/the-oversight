// scripts/test-ladder-cap.js — ladder cap + stage-transition proofs (leg 1).
// Prereg: evidence/2026-11-08/sim-ladder-leg1-prereg.md (bars L1/L2/L3).
// Uses the shared kit (scripts/godpath/lib.js); rigged states, no seeds.
'use strict';
const K = require('./godpath/lib');

function resetXp(Game) {
  // Zero every track for the scholar and every living villager, so each
  // rigged total is exact (npcXp() seeds an occupation lean on first
  // touch — overwriting every track after creation removes it).
  const T = ['combat', 'field', 'social', 'craft', 'strange'];
  const pt = Game.playerTracks();
  for (const t of T) pt[t].xp = 0;
  const roster = ((Game.state.village || {}).roster || []);
  for (const vid of roster) {
    if (!vid || vid === Game.villagerId) continue;
    const vp = Game.vpOf ? Game.vpOf(vid) : null;
    if (vp && vp.dead) continue;
    const x = Game.npcXp(vid);
    for (const t of T) x[t] = 0;
  }
}

function setLedger(Game, wave, points) {
  Game.state.waveLedger = Game.state.waveLedger || {};
  Game.state.waveLedger[wave] = { points, perType: {}, perTypeX: {} };
}

function resetLadderState(Game) {
  resetXp(Game);
  Game.state.waveLedger = {};
  Game.state.feastLog = [];
  Game.state.waveKillLog = [];
  try { Game.deedState().contestsSurvived = 0; } catch (e) {}
  try { Game.state.codex = { plants: {}, monsters: {}, animals: {}, recipes: {}, techniques: {}, skills: {} }; } catch (e) {}
  try { const ls = Game.hierarchyState(); ls.length = 0; } catch (e) {}
  delete Game.state._ladderPeakStage;
  delete Game.state._ladderCapBeat;
}

async function main() {
  const T = K.reporter('test-ladder-cap');
  const Game = await K.load({ seed: 7 });
  K.newRun(Game);
  T.ok('ladder loaded via index.html order', typeof Game.villageLadder === 'function' && typeof Game.ladderStage === 'function');
  T.ok('endDay wrap installed (marker on Game)', Game._ladderEndDayWrapped === true);

  // --- rigged single-track village: Fight alone must NOT open Village ---
  resetLadderState(Game);
  setLedger(Game, 3, 30); // 30 ledger pts -> 15 Fight pts, nothing else
  let L = Game.villageLadder();
  T.ok('rigged Fight-only: Fight total 15', L.tracks.fight === 15, 'got ' + L.tracks.fight);
  T.ok('rigged Fight-only: counted capped at 7 (60% of 12)', L.counted === 7, 'got ' + L.counted);
  T.ok('rigged Fight-only: stage refuses to open (0)', L.stage === 0, 'got ' + L.stage);
  T.ok('rigged Fight-only: Fight named capped', L.capped.indexOf('fight') >= 0);
  T.ok('rigged Fight-only: line names the cap', /Fight 15 \u2192 7 \u00B7 capped/.test(Game.ladderLine()), Game.ladderLine());

  // --- even a huge single track cannot buy a rung ---
  resetLadderState(Game);
  setLedger(Game, 3, 60); setLedger(Game, 4, 60); setLedger(Game, 5, 60); // 90 Fight pts
  L = Game.villageLadder();
  T.ok('huge Fight-only: still stage 0', L.stage === 0, 'got ' + L.stage);
  T.ok('huge Fight-only: counted 7 at Village cap', L.counted === 7, 'got ' + L.counted);

  // --- stage transitions at exactly 12 / 26 / 40 counted ---
  resetLadderState(Game);
  setLedger(Game, 3, 12); // Fight 6
  Game.playerTracks().field.xp = 72; // Forage 6
  L = Game.villageLadder();
  T.ok('12 counted -> Village (1)', L.stage === 1 && L.counted === 12, 'stage ' + L.stage + ' counted ' + L.counted);
  T.ok('Village line names next rung', /12\/26 to Regional/.test(Game.ladderLine()), Game.ladderLine());

  resetLadderState(Game);
  setLedger(Game, 3, 30); // Fight 15
  Game.playerTracks().field.xp = 132; // Forage 11
  L = Game.villageLadder();
  T.ok('26 counted -> Regional (2)', L.stage === 2 && L.counted === 26, 'stage ' + L.stage + ' counted ' + L.counted);

  resetLadderState(Game);
  setLedger(Game, 3, 48); // Fight 24
  Game.playerTracks().field.xp = 192; // Forage 16
  L = Game.villageLadder();
  T.ok('40 counted -> National (3)', L.stage === 3 && L.counted === 40, 'stage ' + L.stage + ' counted ' + L.counted);
  T.ok('National: no next threshold', L.nextThreshold === null);
  // r111 (2026-11-08): the top-rung line repeated the stage name —
  // "Ladder — National Standing National Standing reached". The stage
  // name is already the subject; the target is just "reached".
  const natLine = Game.ladderLine();
  T.ok('National line reads "National Standing reached"', /^Ladder \u2014 National Standing reached \(/.test(natLine), natLine);
  T.ok('National line never repeats the stage name', !/National Standing National Standing/.test(natLine), natLine);

  // --- just-below boundaries stay down ---
  resetLadderState(Game);
  setLedger(Game, 3, 12); // Fight 6
  Game.playerTracks().field.xp = 60; // Forage 5 -> 11 counted
  L = Game.villageLadder();
  T.ok('11 counted -> still Unranked (0)', L.stage === 0 && L.counted === 11, 'stage ' + L.stage + ' counted ' + L.counted);

  resetLadderState(Game);
  setLedger(Game, 3, 30); // Fight 15
  Game.playerTracks().field.xp = 120; // Forage 10 -> 25 counted
  L = Game.villageLadder();
  T.ok('25 counted -> still Village (1)', L.stage === 1 && L.counted === 25, 'stage ' + L.stage + ' counted ' + L.counted);

  resetLadderState(Game);
  setLedger(Game, 3, 48); // Fight 24
  Game.playerTracks().field.xp = 180; // Forage 15 -> 39 counted
  L = Game.villageLadder();
  T.ok('39 counted -> still Regional (2)', L.stage === 2 && L.counted === 39, 'stage ' + L.stage + ' counted ' + L.counted);

  // --- the cap binds at every rung, not just Village ---
  resetLadderState(Game);
  setLedger(Game, 3, 60); // Fight 30
  Game.playerTracks().field.xp = 60; // Forage 5
  L = Game.villageLadder();
  // At the Regional cap (15): 15 + 5 = 20 < 26, so Village only; Fight capped.
  T.ok('Fight 30 + Forage 5 -> Village only (cap binds at Regional too)', L.stage === 1, 'stage ' + L.stage);
  T.ok('Fight capped toward Regional', L.capped.indexOf('fight') >= 0 && L.cap === 15, 'cap ' + L.cap);

  // --- ladderLine never hides a cap ---
  resetLadderState(Game);
  setLedger(Game, 3, 18); // Fight 9
  const line = Game.ladderLine();
  T.ok('line shows counted-vs-total for a capped track', /Fight 9 \u2192 7 \u00B7 capped/.test(line), line);
  T.ok('line shows the shortfall', /short 5/.test(line), line);

  // --- config is the brief's numbers ---
  const cfg = Game.ladderCfg();
  T.ok('cfg thresholds 12/26/40', JSON.stringify(cfg.thresholds) === '[12,26,40]', JSON.stringify(cfg.thresholds));
  T.ok('cfg cap fraction 0.6', cfg.capFrac === 0.6);

  // --- the wrap is LIVE: a real endDay() fires the stage beat ---
  // (the wrap sits inside the endDay chain — later modules wrap endDay
  // again, so only a real dawn proves the ladder is in the chain.)
  resetLadderState(Game);
  setLedger(Game, 3, 12); // Fight 6
  Game.playerTracks().field.xp = 72; // Forage 6 -> Village (12 counted)
  const dawnSays = [];
  Game.sysSay = (t) => { dawnSays.push(String(t)); };
  try { Game.endDay(); } catch (e) { T.ok('endDay runs without throwing', false, String(e && e.message)); }
  T.ok('real endDay fires the Village stage beat', dawnSays.some(s => /VILLAGE STANDING/.test(s)), dawnSays.join(' | '));
  T.ok('real endDay records the peak stage', (Game.state._ladderPeakStage | 0) === 1, 'got ' + Game.state._ladderPeakStage);

  T.done();
}

main().catch(e => { console.error(e); process.exitCode = 1; });
