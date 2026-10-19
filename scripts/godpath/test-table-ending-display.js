#!/usr/bin/env node
'use strict';
const K = require('./lib'), T = K.reporter('table-ending-display');
(async () => {
  const G = await K.load({ seed: Number(process.env.SEED || 7) }); K.newRun(G);
  const s = G.state.scholar, pg = G.progState(); s.day = 100; G.state.systemArrived = true;
  if (G._fullStatus) G.status = G._fullStatus;
  // Real wipe/save tombstone path remains active.
  s.godpath = { path: 'forager', subclass: 'gardener', since: 80 };
  s.godhood = { active: [], recognized: {} }; pg.table = {}; G.endingKeyLock(); G.endingKeyEnter('assimilated', 'light');
  const table = G.tableState(); table.phase = 'finals'; table.path = 'assimilated'; table.branch = 'light';
  G.chooseTableOption('final:comfort');
  T.ok('real final stores its exact base outcome followed by the selected build coda', G.won && table.resolution?.finalId === 'comfort' && table.resolution.lines[0].includes('Warm, safe, dim') && table.resolution.lines.slice(-2).join('|') === G.data.tableEndings.codas['class:forager/gardener'].light.join('|'));
  const source = K.readSrc('src/js/app.js'), start = source.indexOf('  function ending()'), end = source.indexOf('  // ============ DEBUG MODE', start);
  const screen = { innerHTML: '' }, again = {}; let titleCalls=0;
  const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const render = new Function('Game', 'screen', 'document', 'esc', 'bar', 'title', source.slice(start, end) + '; return ending;')(G, screen, { getElementById: () => again }, escape, () => '', () => {titleCalls++;});
  render();
  T.ok('actual ending renderer shows the resolved path title, final outcome and coda', screen.innerHTML.includes('THE ASSIMILATED') && screen.innerHTML.includes('Warm, safe, dim') && screen.innerHTML.includes('You had left enough seed for a season you might not see.'));
  const resolved = JSON.stringify(table.resolution); G.log.length = 0;
  s.godpath = null; render();
  T.ok('clearing the log or changing the live build does not change the locked ending text', JSON.stringify(table.resolution) === resolved && screen.innerHTML.includes('You had left enough seed for a season you might not see.'));
  table.resolution.lines.push('<img src=x onerror=alert(1)>'); render();
  T.ok('resolved narrative is escaped rather than interpreted as HTML', screen.innerHTML.includes('&lt;img src=x onerror=alert(1)&gt;') && !screen.innerHTML.includes('<img src=x'));
  G.won = false; render();
  T.ok('a non-winning ending never reveals retained win text', !screen.innerHTML.includes('At the Table') && !screen.innerHTML.includes('Warm, safe, dim'));
  G.won = true; delete table.resolution; render();
  T.ok('older completed states without retained text still render their record', screen.innerHTML.includes('Expedition record') && !screen.innerHTML.includes('At the Table'));
  // Special endings keep their base story in addition to a build coda.
  G.over = false; G.won = false; pg.table = {}; G.endingKeyLock(); G.endingKeyEnter('assimilated', 'light');
  const hosts = G.tableState(); hosts.path = 'assimilated'; hosts.branch = 'light'; pg.networkFallen = true;
  G.tableResolveHosts({ name: 'the Assimilated' }, 'light');
  T.ok('THE HOSTS retains the Taken return story, not only the appended coda', hosts.resolution?.finalId === 'hosts' && hosts.resolution.lines.some(l => l.includes('The Taken walk in')) && hosts.resolution.lines.length > 2);
  G.over = false; G.won = false; pg.table = {}; G.endingKeyLock(); G.endingKeyEnter('assimilated', 'light');
  const pods = G.tableState(); pods.path = 'assimilated'; pods.branch = 'light';
  G.state.village.pantryKcal=16000;
  G.tableResolveDemandPrice('tribute');
  T.ok('actual pod tribute charges12000 once and retains its exact price and closing text',G.state.village.pantryKcal===4000&&pods.resolution?.finalId==='poddemand'&&pods.resolution.lines.some(l=>l.includes('12,000 kcal'))&&pods.resolution.lines.length>2);
  render();again.onclick();
  T.ok('actual replay handler calls the title function without a local title shadow',titleCalls===1);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
