#!/usr/bin/env node
'use strict';
const fs = require('fs'), path = require('path');
const K = require('../../scripts/godpath/lib'), T = K.reporter('cell-popup-dispatch');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  // Execute the shipped cellPopup against the shared game. Only the DOM
  // rendering seam and person-sheet navigation are replaced in this test.
  const src = fs.readFileSync(path.join(__dirname, '../../src/js/app.js'), 'utf8');
  const start = src.indexOf('  function cellPopup(cx, cy) {');
  const end = src.indexOf('  // refresh: full expedition', start);
  const slot = { innerHTML: '', dataset: {}, buttons: [], querySelectorAll() {
    this.buttons = [...this.innerHTML.matchAll(/data-tpact="(\d+)">([^<]*)<\/button>/g)].map(m => ({ dataset: { tpact: m[1] }, label: m[2] }));
    return this.buttons;
  } };
  const document = { getElementById: id => id === 'inlineslot' ? slot : id === 'tp-close' ? {} : null };
  let personOpened = null;
  const popup = new Function('Game', 'S', 'document', 'esc', 'personSheet', 'refresh', 'refreshTilePanel', src.slice(start, end) + '\nreturn cellPopup;')(G, globalThis.Scattering, document, String, id => { personOpened = id; }, () => {}, () => {});
  const s = G.state.scholar, detail = G.genDetail(G.map.px, G.map.py);
  const fire = detail.flatMap((row, y) => row.map((cell, x) => ({ cell, x, y }))).find(p => p.cell === 'fire');
  if (!fire) throw new Error('No generated Haven fire');
  s.mx = fire.x + 1; s.my = fire.y;
  G.state.village.positions = {};
  G.state.corpses = [];
  G.state.codex.techniques = { clean: false, cook: false, preserve: false, render: true, shell: true };
  s.inventory = [{ name: 'Prepared smoked meat', foodKind: 'meat', foodState: 'preserved', units: 2, kcalEach: 400 }, { name: 'Prepared rendered fat', foodKind: 'fat', foodState: 'rendered', units: 1, kcalEach: 810 }, { name: 'Prepared berries', foodKind: 'plant', plantId: 'blackberry', units: 2, kcalEach: 30 }];
  popup(fire.x, fire.y);
  T.ok('body API with no body still offers the fire action', slot.buttons.some(b => b.label === 'Warm hands'));
  const make = slot.buttons.find(b => /Make pemmican/.test(b.label));
  const ticks = s.dayTicks; if (make) make.onclick();
  T.ok('fire-menu pemmican binding pays the public action and creates food', !!make && s.dayTicks === ticks + 20 && s.inventory.some(i => i.foodState === 'pemmican'));
  const rid = G.state.village.roster.find(id => id !== G.villagerId);
  G.state.village.positions[rid] = { mx: fire.x, my: fire.y };
  popup(fire.x, fire.y);
  T.ok('empty body cell can dispatch to the real villager identity', personOpened === rid);
  const corpse = { id: 'prepared_body', kind: 'animal', name: 'Prepared dead animal', dayDied: s.day, node: { x: G.map.px, y: G.map.py }, mx: fire.x, my: fire.y, items: [{ itemId: 'stone_knife', units: 1 }] };
  G.state.corpses.push(corpse); personOpened = null; popup(fire.x, fire.y);
  T.ok('a real cell body retains search priority over terrain and villager sheets', slot.buttons.some(b => /Search the body/.test(b.label)) && !slot.buttons.some(b => b.label === 'Warm hands') && personOpened === null);
  corpse.buried = true; delete G.state.village.positions[rid]; popup(fire.x, fire.y);
  T.ok('buried body no longer swallows the terrain menu', slot.buttons.some(b => b.label === 'Warm hands'));
  corpse.buried = false; corpse.node.x = (G.map.px + 1) % 9; popup(fire.x, fire.y);
  T.ok('a body on another world tile does not swallow this fire', slot.buttons.some(b => b.label === 'Warm hands'));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
