#!/usr/bin/env node
// test-tile-annotations-20261017.js — proof for the tile-annotation render
// fix (2026-10-17): garden plots, traps, and bridges were Pattern-T tile
// annotations invisible to the renderers — RENDERING-BLINDNESS, not lost
// writes (see evidence/2026-10-17/garden-siblings-audit.md).
//
// RED (pre-fix): Game.trapMarkerAt / Game.gardenStripHtml /
//   Game.bridgeBadgeHTML / Game.gardenGate / Game.gardenStatus undefined;
//   app.js renderers had zero trap/plot/bridge references.
// GREEN (post-fix): the checks below — annotation renders after the action,
//   save/load round-trip keeps the render, gated garden actions name their
//   gate, and the renderer call sites are wired.
//
// Run: node scripts/test-tile-annotations-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 20261017, mode: 'test-tile-annotations' });
  await setupGame(Game);
  let fails = 0;
  const ok = (cond, msg) => { console.log((cond ? '  ok: ' : '  FAIL: ') + msg); if (!cond) fails++; };
  const said = [];
  Game.say = (t) => { said.push(String(t)); };

  // ---- methods exist (RED would fail here) ----
  ok(typeof Game.trapMarkerAt === 'function', 'Game.trapMarkerAt exists');
  ok(typeof Game.gardenStripHtml === 'function', 'Game.gardenStripHtml exists');
  ok(typeof Game.gardenGate === 'function', 'Game.gardenGate exists');
  ok(typeof Game.gardenStatus === 'function', 'Game.gardenStatus exists');
  ok(typeof Game.bridgeBadgeHTML === 'function', 'Game.bridgeBadgeHTML exists');

  // ---- renderer call sites wired (static) ----
  const appSrc = fs.readFileSync(path.join(__dirname, '..', 'src/js/app.js'), 'utf8');
  ok(appSrc.includes('Game.trapMarkerAt(cx, cy)'), 'renderDetail calls Game.trapMarkerAt');
  ok(appSrc.includes('Game.gardenStripHtml()'), 'haven panel calls Game.gardenStripHtml()');
  ok(appSrc.includes('data-garden'), 'garden buttons wired via data-garden');
  ok(appSrc.includes('Game.bridgeBadgeHTML(x, y)'), 'renderMap calls Game.bridgeBadgeHTML');

  // ---- TRAPS: marker renders after the action ----
  Game.state.scholar.tools = Game.state.scholar.tools || [];
  Game.state.scholar.tools.push({ recipeId: 'snare', uses: 10 });
  const mx = Game.state.scholar.mx ?? 4, my = Game.state.scholar.my ?? 4;
  Game.setTrap('snare');
  const tile = Game.playerTile();
  ok((tile.traps || []).some(t => t.mx === mx && t.my === my), 'setTrap stores mx,my on the tile');
  const marker = Game.trapMarkerAt(mx, my);
  ok(marker.includes('🪤'), 'trap marker renders on the trapped cell');
  ok(/snare/i.test(marker), 'trap marker names the trap in its title');
  ok(Game.trapMarkerAt((mx + 1) % 9, my) === '', 'no trap marker on untrapped cells');

  // ---- TRAPS: save/load round-trip keeps the render ----
  Game.syncRun();
  const blob = JSON.stringify(Game.state);
  Game.map = JSON.parse(blob).run.map;
  ok(Game.trapMarkerAt(mx, my).includes('🪤'), 'trap marker survives save/load round-trip');

  // ---- GARDEN: strip renders plot state in the haven panel ----
  Game.map.px = 4; Game.map.py = 4;
  Game.state.scholar.insideHaven = false;
  Game.state.scholar.kcal = 5000;
  const strip0 = Game.gardenStripHtml();
  ok(strip0.includes('no plots yet'), 'garden strip shows empty state with 0 plots');
  ok(strip0.includes('data-garden="make"'), 'garden strip offers Make a garden plot');
  ok(!strip0.includes('data-garden="sow"'), 'no Sow/Tend/Harvest buttons before any plot exists');
  Game.makePlot();
  Game.makePlot();
  const strip1 = Game.gardenStripHtml();
  ok(/2 plots/.test(strip1), 'garden strip shows plot count after makePlot x2');
  ok(strip1.includes('empty'), 'garden strip shows the empty plot');
  ok(strip1.includes('data-garden="sow"'), 'garden strip surfaces Sow seeds in the haven panel');
  ok(strip1.includes('data-garden="tend"'), 'garden strip surfaces Tend the garden in the haven panel');
  ok(strip1.includes('data-garden="harvest"'), 'garden strip surfaces Harvest the garden in the haven panel');

  // ---- GARDEN: every gate names itself (no silent dead-ends) ----
  const gSow = Game.gardenGate('sow');
  ok(!gSow.ok && /seed stock/.test(gSow.reason), 'sow gate says WHY (seed stock): ' + gSow.short);
  ok(/forage 2\+ units/.test(gSow.reason), 'sow gate names the remedy');
  const gTend = Game.gardenGate('tend');
  ok(!gTend.ok && /sow first/i.test(gTend.reason), 'tend gate names its gate with nothing planted');
  const gHarv = Game.gardenGate('harvest');
  ok(!gHarv.ok && /nothing ripe/i.test(gHarv.reason), 'harvest gate names its gate with nothing ripe');
  ok(strip1.includes('no seed stock'), 'gated Sow button labels its gate inline');
  ok(strip1.includes('ghost'), 'gated buttons render ghosted, still tappable for the reason');

  // ---- GARDEN: sow with seed stock -> status shows growing ----
  const plants = Game.data.plants || [];
  const cand = plants.find(p => ['shoots', 'berries', 'roots'].includes(p.form));
  ok(!!cand, 'test found a gardenable plant (' + (cand && cand.id) + ')');
  Game.state.codex = Game.state.codex || {}; Game.state.codex.plants = Game.state.codex.plants || {};
  Game.state.codex.plants[cand.id] = { level: 1 };
  Game.state.scholar.inventory = Game.state.scholar.inventory || [];
  Game.state.scholar.inventory.push({ plantId: cand.id, units: 5, name: cand.name });
  const gSow2 = Game.gardenGate('sow');
  ok(gSow2.ok, 'sow gate opens with 2+ units of a known gardenable plant');
  Game.sowPlot(cand.id);
  const gs = Game.gardenStatus();
  ok(gs.live === 1 && gs.empty === 1, 'gardenStatus: 1 live, 1 empty after sowing one of two plots');
  ok(gs.lines.length === 1 && /ripe in \d+d|maturing|growing/.test(gs.lines[0]),
    'gardenStatus line shows growth state: ' + gs.lines[0]);
  const strip2 = Game.gardenStripHtml();
  ok(strip2.includes('data-garden="sow"') && !/Sow seeds \(/.test(strip2.split('data-garden="tend"')[0]),
    'sow button enabled once seed stock exists (no gate label)');
  // tend: just sowed -> tended today
  const gTend2 = Game.gardenGate('tend');
  ok(!gTend2.ok && /tended today/i.test(gTend2.reason), 'tend gate says tended-today right after sowing');
  // simulate a day passing -> tend opens
  const day = (Game.state.scholar || {}).day || 0;
  Game.gardenPlots().forEach(p => { if (p.pid) p.lastTend = day - 1; });
  ok(Game.gardenGate('tend').ok, 'tend gate opens on an untended day');
  // simulate maturity -> harvest opens (lastHarvest 3+ days ago: the
  // every-3-days rule; a fresh test game is still on day 1)
  Game.gardenPlots().forEach(p => { if (p.pid) { p.plantedDay = day - 30; p.lastHarvest = day - 3; } });
  const gHarv2 = Game.gardenGate('harvest');
  ok(gHarv2.ok, 'harvest gate opens when a plot is ripe');
  const strip3 = Game.gardenStripHtml();
  ok(/ripe/.test(strip3), 'garden strip shows the ripe plot');

  // ---- GARDEN: make gate at cap ----
  while (Game.gardenPlots().length < 6) Game.gardenPlots().push({ pid: null, plantedDay: 0, lastTend: 0, lastHarvest: 0, weeds: 0, dead: false });
  const gMake = Game.gardenGate('make');
  ok(!gMake.ok && /Six plots/.test(gMake.reason), 'make gate names the 6-plot cap');

  // ---- GARDEN: save/load round-trip keeps the strip ----
  Game.syncRun();
  const blob2 = JSON.stringify(Game.state);
  Game.map = JSON.parse(blob2).run.map;
  const stripAfter = Game.gardenStripHtml();
  ok(/6 plots/.test(stripAfter), 'garden strip survives save/load round-trip (6 plots)');
  ok(stripAfter.includes('data-garden="harvest"'), 'harvest button still surfaced after load');

  // ---- BRIDGE: badge renders on bridged tile ----
  const bx = 2, by = 3;
  const bt = Game.tileAt(bx, by);
  bt.bridged = true;
  const badge = Game.bridgeBadgeHTML(bx, by);
  ok(badge.includes('🌉'), 'bridge badge renders on the bridged tile');
  ok(/bridge/i.test(badge), 'bridge badge titles honestly');
  ok(Game.bridgeBadgeHTML(5, 5) === '', 'no bridge badge on unbridged tiles');
  delete bt.bridged;
  ok(Game.bridgeBadgeHTML(bx, by) === '', 'bridge badge clears when the bridge is gone');

  Game.say = () => {};
  console.log(fails ? `\n${fails} FAILURES` : '\nALL GREEN');
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
