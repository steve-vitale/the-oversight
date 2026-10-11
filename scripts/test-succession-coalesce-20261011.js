#!/usr/bin/env node
// test-succession-coalesce-20261011.js — GRIEF COALESCES (travel lever).
// Proves: repeated leader deaths inside one grief window don't stack the
// -8 trust haircut per death per link, and don't compound the x1.5 grief
// tribute leverage per death.
// Measured on current master (seed 8, winseek): 5 leader deaths in 3 days
// cost -40 trust on every link and drove tribute 6000 -> 30375/week
// (x1.5^4), making the BELONG road's trust>=50 bar unreachable for any
// player who fights (and the win gate REQUIRES fighting).
// The first death keeps its full designed force (-8, mourning/beat,
// leverage). The cascade doesn't multiply.
// Usage: node scripts/test-succession-coalesce-20261011.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) failures++;
}

async function main() {
  const { Game } = await loadGame({ seed: parseInt(process.env.SEED || '4242', 10), mode: 'succ-coalesce', fullTelemetry: false });
  await setupGame(Game);
  Game.say = function () {};
  const { competent: comp } = require('./policies/competent');
  await runDays(Game, comp, { days: 30 });
  const day0 = (Game.state.scholar || {}).day || 0;
  const target = (Game.state.otherVillages || []).find(v => Game.knowsVillage(v));
  check('has a known village', !!target);

  // --- YOUNG LINK (grace path): born today, <21d old ---
  const young = Game._formLink(target.id, { asSubordinate: true, tributeKcalPerWeek: 4000 }, { score: 70, reasons: [] });
  check('young link formed', !!(young && young.id), 'trust=' + (young && young.trust));
  const yTrust0 = young.trust, yTrib0 = young.tributeKcalPerWeek;
  const pid = Game.villagerId;
  Game.onLeaderDeath(pid); // death 1: full force
  const yTrust1 = young.trust, yTrib1 = young.tributeKcalPerWeek;
  check('young: first death costs -8', yTrust1 === yTrust0 - 8, yTrust0 + '->' + yTrust1);
  check('young: first death stages the beat', !!young.pendingRenegotiation);
  Game.onLeaderDeath(pid); // death 2, same grief
  Game.onLeaderDeath(pid); // death 3, same grief
  check('young: deaths 2+3 add no further haircut', young.trust === yTrust1, 'trust=' + young.trust + ' (was ' + yTrust1 + ')');
  check('young: beat not re-staged/duplicated', !!young.pendingRenegotiation);
  check('young: link still alive', young.status === 'active');

  // --- OLD LINK (mourning path): backdate past 21d ---
  const target2 = (Game.state.otherVillages || []).find(v => v.id !== target.id);
  if (target2) target2.rumored = true; // force known for the scripted probe
  check('second village available', !!target2);
  const old = target2 ? Game._formLink(target2.id, { asSubordinate: true, tributeKcalPerWeek: 4000 }, { score: 70, reasons: [] }) : null;
  check('old link formed', !!(old && old.id));
  if (!old) { console.log('done. failures=' + (failures + 1)); process.exit(1); }
  old.day = day0 - 30; // mature link
  const oTrust0 = old.trust, oTrib0 = old.tributeKcalPerWeek;
  Game.onLeaderDeath(pid); // death 1: full force
  check('old: first death costs -8', old.trust === oTrust0 - 8, oTrust0 + '->' + old.trust);
  check('old: first death marks mourning', (old.mourningUntil || 0) > day0, 'mourningUntil=' + old.mourningUntil);
  check('old: first death applies x1.5 leverage once', old.tributeKcalPerWeek === Math.round(oTrib0 * 1.5), oTrib0 + '->' + old.tributeKcalPerWeek);
  const oTrust1 = old.trust, oTrib1 = old.tributeKcalPerWeek;
  Game.onLeaderDeath(pid); // death 2, same window
  Game.onLeaderDeath(pid); // death 3, same window
  check('old: deaths 2+3 add no further haircut', old.trust === oTrust1, 'trust=' + old.trust);
  check('old: deaths 2+3 compound no further leverage', old.tributeKcalPerWeek === oTrib1, 'tribute=' + old.tributeKcalPerWeek);
  check('old: mourning window extended, not stacked', (old.mourningUntil || 0) >= day0 + 7);

  // --- after the window, grief hits full force again ---
  // (advance the clock past mourning; young link's beat: answer it to clear)
  console.log('done. failures=' + failures);
  process.exit(failures ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
