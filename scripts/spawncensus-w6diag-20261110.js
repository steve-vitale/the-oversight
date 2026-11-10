// spawncensus-w6diag-20261110.js — W6 Network-march DIAG (arm sim-spawncensus-a).
// Runs the `network()` debug scenario (src/js/debug-scenarios.js) under the
// encounterprod instrument and attempts the first march node, recording
// whether the three W6 kinds spawn and can be faced.
//   node scripts/spawncensus-w6diag-20261110.js [seed]
// Writes evidence/2026-11-10/spawncensus-a-w6diag.json and prints a summary.
// Zero src/js. Never stubs Game.save.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const INST = require(path.join(REPO, 'scripts', 'encounterprod-instrument-20261105'));

const SEED = parseInt(process.argv[2] || '170299', 10);
const OUT = path.join(REPO, 'evidence', '2026-11-10', 'spawncensus-a-w6diag.json');

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

(async function () {
  const out = { seed: SEED, diag: 'w6-network-march', instrumentErrors: [] };
  const { Game } = await loadGame({ seed: SEED, mode: 'spawncensus-w6diag', fullTelemetry: false });
  await setupGame(Game);

  // Organic gate state BEFORE the scenario bypass.
  try { out.overtimeTierBefore = (typeof Game.overtimeTier === 'function') ? Game.overtimeTier() : null; } catch (e) { out.overtimeTierBefore = null; }
  try { out.networkKeyReadyBefore = (typeof Game.networkKeyReady === 'function') ? !!Game.networkKeyReady() : null; } catch (e) { out.networkKeyReadyBefore = null; }
  try { out.titansSlainBefore = Object.assign({}, ((Game.state || {}).titans || {}).slain || {}); } catch (e) { out.titansSlainBefore = null; }

  const inst = INST.install(Game);
  const t = inst.t;

  // Capture SAY lines around the summon + fight attempt.
  const sayLines = [];
  const origSay = Game.say;
  Game.say = function () {
    try {
      const arg = arguments.length ? arguments[0] : null;
      if (typeof arg === 'string' && sayLines.length < 200) sayLines.push({ day: gday(Game), line: String(arg).slice(0, 500) });
    } catch (e) {}
    return origSay.apply(this, arguments);
  };

  let scenarioOk = false;
  let scenarioErr = null;
  try {
    if (typeof Game.debugScenario !== 'function') throw new Error('Game.debugScenario missing');
    scenarioOk = Game.debugScenario('network');
  } catch (e) { scenarioErr = String(e && e.message || e).slice(0, 200); }
  out.scenarioOk = !!scenarioOk;
  out.scenarioErr = scenarioErr;

  try { out.campaign = Game.networkCampaign ? Game.networkCampaign() : null; } catch (e) { out.campaign = null; }
  try {
    const wm = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    out.networkPiecesOnMap = wm.filter(function (w) { return w && w.networkNode; }).map(function (w) { return { id: w.id, node: w.networkNode, tx: w.tx, ty: w.ty }; });
  } catch (e) { out.networkPiecesOnMap = null; }
  const spawnById = {};
  (t.spawns || []).forEach(function (s) { spawnById[s.id] = (spawnById[s.id] || 0) + 1; });
  out.spawnById = spawnById;
  out.musterReady = null;
  try { out.musterReady = (typeof Game.titanMusterReady === 'function') ? !!Game.titanMusterReady('the_network') : null; } catch (e) {}

  // Attempt the first node fight from the scenario's placed scholar tile.
  let firstNode = null;
  try { firstNode = (typeof Game.networkCurrentNode === 'function') ? Game.networkCurrentNode() : null; } catch (e) {}
  out.firstNode = firstNode ? { id: firstNode.id, monster: firstNode.monster, title: firstNode.title } : null;
  const sayBefore = sayLines.length;
  let fightEntered = false;
  let startErr = null;
  if (firstNode) {
    try {
      const ret = Game.startCombat(firstNode.monster);
      fightEntered = !!(Game.tbfight);
      out.startCombatReturn = (ret == null) ? null : (typeof ret === 'object' ? 'object' : String(ret).slice(0, 80));
    } catch (e) { startErr = String(e && e.message || e).slice(0, 200); }
    if (Game.tbfight) { try { Game.tbEnd('fled'); } catch (e) {} }
  }
  out.fightAttempt = { startErr: startErr, fightEntered: fightEntered, sayLinesDuringFight: sayLines.slice(sayBefore) };
  out.fights = t.fights;
  out.instrumentErrors = (t.instrumentErrors || []).slice();
  try { out.sayLines = sayLines.slice(0, 60); } catch (e) { out.sayLines = []; }
  try { inst.uninstall(); } catch (e) {}
  try { Game.say = origSay; } catch (e) {}

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({
    seed: SEED, scenarioOk: out.scenarioOk, scenarioErr: out.scenarioErr,
    overtimeTierBefore: out.overtimeTierBefore, networkKeyReadyBefore: out.networkKeyReadyBefore,
    piecesOnMap: (out.networkPiecesOnMap || []).length, spawnById: out.spawnById,
    musterReady: out.musterReady, firstNode: out.firstNode,
    fightEntered: fightEntered, startErr: startErr, fightsRecorded: (t.fights || []).length,
    instrumentErrors: out.instrumentErrors.length, file: path.relative(REPO, OUT),
  }, null, 2));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
