#!/usr/bin/env node
'use strict';
const fs = require('fs'), path = require('path');
const K = require('./godpath/lib'), T = K.reporter('coalition-presentation');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  const src = fs.readFileSync(path.join(__dirname, '../src/js/app.js'), 'utf8');
  const extract = (name, source = src) => {
    source = source.replace(/\r\n/g, '\n');
    const match = source.match(new RegExp('  function ' + name + '\\([^\\n]*\\) \\{[\\s\\S]*?\\n  \\}\\n'));
    if (!match) throw new Error('Missing actual UI function ' + name);
    return match[0];
  };
  const view = new Function('Game', extract('combatPresentation') + ';return combatPresentation;')(G);
  T.ok('ordinary field uses nine rows', view().gridSize === 9 && !view().active);
  const links = G.hierarchyState(); links.length = 0;
  for (const v of G.state.otherVillages) {
    G.genVillageRoster(v); v.opinion = 30;
    links.push({ primary: 'haven', subordinate: v.id, status: 'active', trust: 90, arrears: 0, theirSpeaker: { id: v.roster.find(r => r.age >= 18).id, name: 'Speaker' } });
  }
  G.state.titans = { omens: { herald: { stage: 2 } }, musters: {}, slain: {}, cast: null };
  const muster = G.soundTitanCall('herald');
  G.state.scholar.insideHaven = false;
  G.startCombat('herald');
  const f = G.tbfight, allies = f.fighters.filter(a => a.kind === 'ally');
  T.ok('real recruited army enters a twenty-four-cell battle', allies.length === muster.allies.length && allies.length >= 10 && G.tbGridSize() === 24);
  const outer = allies[0]; outer.mx = 23; outer.my = 23;
  const before = JSON.stringify({ state: G.state, fight: f });
  const v = view();
  T.ok('UI reads actual twenty-four-cell battlefield', v.gridSize === 24 && v.active);
  T.ok('UI includes every living named recruit', Object.values(v.allies).length === allies.length);
  T.ok('UI includes outer-row and outer-column fighters', v.allies['23,23'] === outer);
  T.ok('presentation read leaves game and battle unchanged', before === JSON.stringify({ state: G.state, fight: f }));
  outer.alive = false;
  T.ok('dead fighter is absent', !Object.values(view().allies).includes(outer));
  outer.alive = true; outer.fled = true;
  T.ok('fled fighter is absent', !Object.values(view().allies).includes(outer));
  outer.fled = false;
  f.gridSize = 9;
  T.ok('prepared nine-cell titan fight keeps nine rows', view().gridSize === 9);
  G.state.scholar.insideHaven = true;
  T.ok('interior never renders outdoor battle fighters', !view().active && Object.keys(view().allies).length === 0);
  G.state.scholar.insideHaven = false; f.over = true;
  T.ok('finished fight restores world grid and hides stale fighters', !view().active && view().gridSize === 9 && Object.keys(view().allies).length === 0);
  f.over = false; f.gridSize = 24;
  // Execute the actual renderer with the shared game. Only DOM/art helpers
  // are substituted; combat, names, geometry and roster state stay real.
  const empty = () => '', document = { body: { classList: { contains: () => true } } };
  const buckets = new Proxy({ swarmSrc: [], mon: {} }, { get: (o, k) => k in o ? o[k] : new Set() });
  const renderSource = process.env.COALITION_RENDER_SOURCE ? fs.readFileSync(process.env.COALITION_RENDER_SOURCE, 'utf8') : src;
  const render = new Function('Game', 'S', 'document', 'tbAllTelegraphCells', 'tgPlayerAlertClasses', 'villagerSpriteHtml', 'monsterSpriteHtml', 'humanoidSpriteHtml', 'CELL_GLYPH', 'PLANT_GLYPH', 'esc', 'targetingCells', extract('combatPresentation') + extract('renderDetail', renderSource) + ';return renderDetail;')(
    G, globalThis.Scattering, document, () => buckets, () => [], empty, empty, empty, {}, {}, s => String(s).replace(/</g, '&lt;'), () => new Set());
  const html = render(G._fullStatus.call(G));
  T.ok('actual renderer emits twenty-four rows and 576 cells', (html.match(/class="drow"/g) || []).length === 24 && (html.match(/data-cx=/g) || []).length === 576);
  T.ok('actual renderer draws living coalition actors', (html.match(/data-ent="ally:/g) || []).length === allies.length);
  const previousActor = f.actingKey; f.actingKey = outer.key;
  T.ok('current ally gets the existing acting pulse during their turn', /class="[^"]*\bacting\b[^"]*" data-cx="23" data-cy="23"/.test(render(G._fullStatus.call(G))));
  f.actingKey = previousActor;
  T.ok('outer-cell fighter is in the actual rendered cell', html.includes('data-cx="23" data-cy="23"><span class="vent" data-ent="ally:' + encodeURIComponent(outer.key)));
  outer.fled = true;
  const withoutFled = render(G._fullStatus.call(G));
  T.ok('actual renderer hides fled actor, rather than a stale world position', !withoutFled.includes('data-ent="ally:' + encodeURIComponent(outer.key) + '"'));
  f.gridSize = 9;
  const trial = render(G._fullStatus.call(G));
  T.ok('actual renderer respects prepared nine-row geometry despite titan skin', (trial.match(/class="drow"/g) || []).length === 9 && (trial.match(/data-cx=/g) || []).length === 81);
  f.gridSize = 24; outer.fled = false;
  const originalName = outer.name; outer.name = '<img src=x onerror="bad"> & Co';
  const escaped = render(G._fullStatus.call(G));
  T.ok('names cannot inject markup or accessible-label attributes', !escaped.includes('<img src=x') && escaped.includes('aria-label="&lt;img src=x onerror=&quot;bad&quot;> &amp; Co"'));
  outer.name = originalName;
  T.ok('recruited full name is available to assistive readers', render(G._fullStatus.call(G)).includes('aria-label="' + originalName + '"'));
  G.state.systemArrived = false;
  f.fighters.push({ key: 'unknown-helper', kind: 'villager', villagerId: 'unknown-face-proof', name: 'Unintroduced Proof', alive: true, mx: 10, my: 9 });
  const unknown = render(G._fullStatus.call(G));
  T.ok('unintroduced local helper does not reveal their name', !unknown.includes('Unintroduced') && unknown.includes('aria-label="Companion"'));
  f.over = true;
  G.state.village.positions[G.villagerId] = { mx: 5, my: 5 };
  G.state.scholar.mx = 4; G.state.scholar.my = 4;
  const world = render(G._fullStatus.call(G));
  T.ok('current bearer does not also render at stale NPC world position', !world.includes('data-ent="vil:' + G.villagerId + '"'));
  T.ok('world still renders the current bearer once', (world.match(/data-ent="me"/g) || []).length === 1);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
