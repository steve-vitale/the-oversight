#!/usr/bin/env node
// Prepared ending contracts, not evidence of natural ascension or Table wins.
'use strict';
const K = require('./lib'), T = K.reporter('coda-coverage');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  const s = G.state.scholar, pg = G.progState(), D = G.data.tableEndings;
  const EK = globalThis.Scattering.EndingKey, paths = G.data.godpaths.paths;
  const doors = ['assimilated', 'beloved', 'defiant', 'feared', 'indispensable', 'relay', 'witness'];
  const builds = [];
  for (const [pid, p] of Object.entries(paths)) {
    builds.push({ selector: 'god:' + p.god.id, path: pid, sub: Object.keys(p.subclasses)[0], god: p.god.id });
    for (const sub of Object.keys(p.subclasses)) builds.push({ selector: 'class:' + pid + '/' + sub, path: pid, sub });
  }
  for (const track of ['combat', 'field', 'social', 'craft', 'strange']) builds.push({ selector: 'track:' + track, track });
  T.ok('all 35 real god/subclass/track selectors have two authored lines in each moral', builds.length === 35 && builds.every(b => ['light', 'dark'].every(m => D.codas[b.selector]?.[m]?.length === 2)));
  const text = builds.flatMap(b => ['light', 'dark'].flatMap(m => D.codas[b.selector][m]));
  T.ok('all 140 authored lines are nonempty and distinct', text.every(t => t.trim().length > 0) && new Set(text).size === 140);
  G.state.systemArrived = true; s.day = 95;
  G.wipe = () => {}; // retain prepared runs for checking emitted text/telemetry
  const configure = b => {
    for (const [id, state] of Object.entries(G.playerTracks())) state.xp = id === (b.track || 'combat') ? 500 : 0;
    s.godpath = b.path ? { path: b.path, subclass: b.sub, since: 80, god: null } : null;
    s.godhood = b.god ? { active: [b.god], recognized: { [b.god]: 85 } } : { active: [], recognized: {} };
    pg.table = {}; pg._teleSeen = {}; G.over = false; G.won = false;
  };
  const expected = (b, door) => door === 'defiant' && b.path === 'brawler' ? 'class:brawler'
    : door === 'beloved' && b.path === 'socialite' && b.sub === 'showrunner' ? 'class:socialite/showrunner' : b.selector;
  const bad = []; let count = 0;
  for (const b of builds) for (const door of doors) {
    for (const [moral, lean] of [['light', 0], ['dark', 0], ...(door === 'relay' ? [['grey', -3], ['grey', 0], ['grey', 3]] : [])]) {
      configure(b); G.endingKeyLock(); G.endingKeyEnter(door, moral); G.relayLean = () => lean;
      const e = G.tableEndingFor(door, moral, 'unused-final'); count++;
      if (!e || e.selector !== expected(b, door) || e.lines.length !== 2 || e.lines.some(l => /\{\w+\}/.test(l)) || (moral === 'grey' && e.moral !== (lean < 0 ? 'dark' : 'light'))) bad.push(b.selector + '/' + door + '/' + moral + '/' + lean);
    }
  }
  T.ok('all 595 locked-build/path/moral cases resolve and fill, preserving bespoke priority and grey lean', count === 595 && bad.length === 0, bad.slice(0, 8).join(', '));
  // Missing-content fallbacks remain meaningful even after production coverage is full.
  const sparse = { codas: { 'track:combat': D.codas['track:combat'] }, paths: {} };
  const fallback = EK.resolveEnding(sparse, 'beloved', { god: 'living_garden', godpath: 'forager', subclass: 'gardener', track: 'combat' }, 'light');
  T.ok('sparse/older data still falls back to track, then the path alone', fallback?.sel === 'track:combat' && EK.resolveEnding({ codas: {}, paths: {} }, 'beloved', {}, 'dark') === null);
  const failures = []; let actual = 0;
  for (const b of builds) for (const moral of ['light', 'dark']) {
    configure(b); G.endingKeyLock(); G.endingKeyEnter('beloved', moral);
    const state = G.tableState(); state.path = 'beloved'; state.branch = moral; state.phase = 'finals';
    const expectedEnd = G.tableEndingFor('beloved', moral, 'audience');
    const said = K.captureSays(G); G.chooseTableOption('final:audience'); said.restore(); actual++;
    const all = said.join('\n'), at = all.indexOf(expectedEnd.lines[0]);
    const base = moral === 'light' ? 'The show becomes the government.' : 'The audience speaks';
    // Showrunner has an authored bespoke outcome; every other build retains the path outcome.
    const retained = b.path === 'socialite' && b.sub === 'showrunner' ? expectedEnd.outcome?.every(l => all.includes(l)) : all.includes(base) && all.indexOf(base) < at;
    const event = K.teleEvents(G, 'table_won').pop();
    if (!G.won || !retained || expectedEnd.lines.some(l => all.split(l).length !== 2) || G.tableState().ending.selector !== expected(b, 'beloved') || event?.ending !== expected(b, 'beloved')) failures.push(b.selector + '/' + moral);
  }
  T.ok('70 actual prepared final choices preserve the path outcome and emit one selected coda with win telemetry', actual === 70 && failures.length === 0, failures.slice(0, 8).join(', '));
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
