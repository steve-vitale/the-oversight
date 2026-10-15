#!/usr/bin/env node
// test-table-endings-20261014.js — endings by build (Steve 2026-10-14):
// "The ending you can win is set as you enter the table, but that doesn't
// mean they play the same table scenario or that they can't lose their
// scenario no matter what path, light or dark. Each playstyle and godhood
// path, moral choice version should have its own ending." / "The table
// should all be relative until actually entering it when it locks." /
// "Both, linked." / "the table prices the run, never gates on godhood".
//
// Proves: the ending key is relative before the seat and locks at it; the
// lookup falls back god > class/subclass > class > track > path; the
// build-aware beat appears for a named class and changes with the moral;
// the titan finale feeds the beat; every path stays losable (and winnable)
// for every fixture key; no godhood gate; endings resolve by key in play
// and reach telemetry.
//
// COMPOSED ENDINGS (Steve 2026-10-14 round 5, a design change, not a
// loosening): the ending is the path's final plus ONE build coda. Order:
// a bespoke path entry > god coda > class/subclass coda > track coda >
// none (the final alone). The relay's grey reads light/dark by relayLean.
// Tokens {name} {path} fill.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('table-endings');
const PATHS = ['feared', 'indispensable', 'beloved', 'witness', 'assimilated', 'defiant', 'relay'];

(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  const s = Game.state.scholar, pg = Game.progState();
  const EK = globalThis.Scattering.EndingKey;
  Game.state.systemArrived = true;
  s.day = 95;
  Game.wipe = () => {};                          // keep the run in memory for assertions
  Game.tableTrialByCombat = function () { this.tableState().trialed = true; }; // no grid fight in the walk
  Game.podConscriptOffer = null;                 // the conscript beat is its own test

  // Fixture builds. setBuild touches only real stores the engine reads.
  const tracks = Game.playerTracks();
  const setBuild = (b) => {
    for (const t of Object.keys(tracks)) tracks[t].xp = 0;
    if (b.track) tracks[b.track].xp = 500;
    s.godpath = b.cls ? { path: b.cls[0], subclass: b.cls[1], since: 80, god: null } : null;
    s.godhood = b.god ? { recognized: { [b.god]: 85 }, active: [b.god] } : { recognized: {}, active: [] };
    Game.state.titans = { omens: {}, musters: {}, slain: Object.assign({}, b.slain || {}), cast: { herald: 'herald', apocalypse: 'finale' } };
    pg.networkFallen = !!b.network;
  };
  const FIX = {
    none: {},
    track: { track: 'combat' },
    showrunner: { track: 'social', cls: ['socialite', 'showrunner'] },
    demagogue: { track: 'social', cls: ['socialite', 'demagogue'] },
    berserker: { track: 'combat', cls: ['brawler', 'berserker'] },
    keeper: { track: 'combat', cls: ['caregiver', 'keeper'] },
    god: { track: 'combat', cls: ['brawler', 'berserker'], god: 'one_person_army', slain: { herald: true, finale: true } },
  };

  // ---------------------------------------------------------------- 1
  T.section('1. The key: relative until the seat, locked at it');
  Game.tableSeat = () => ({ seat: 'full', detail: {} });
  pg.table = {}; pg.tableDone = false; pg.tableWaiting = true;
  setBuild(FIX.showrunner);
  T.ok('before the seat: no locked key', Game.endingKey() === null && !Game.tableState().endingKey);
  let live = Game.endingKeyLive();
  T.ok('live key reads the build (track, class, subclass)', live.track === 'social' && live.godpath === 'socialite' && live.subclass === 'showrunner' && live.god === null && live.tablePath === null, JSON.stringify(live));
  setBuild(FIX.god);
  live = Game.endingKeyLive();
  T.ok('relative: the live key follows the build as it changes (now a god, apocalypse slain)', live.god === 'one_person_army' && live.godpath === 'brawler' && live.titanFinale === 'apocalypse', JSON.stringify(live));
  s.godpath = Object.assign({}, s.godpath, { lapsed: 70 });
  T.ok('a lapsed class does not count (if you don\'t know it, it doesn\'t show)', Game.endingKeyLive().godpath === null);
  setBuild(FIX.showrunner);
  Game.tableTakeSeat();
  const locked = Game.endingKey();
  T.ok('taking the seat locks the build half', locked && locked.locked === 95 && locked.godpath === 'socialite' && locked.subclass === 'showrunner' && locked.track === 'social' && locked.tablePath === null, JSON.stringify(locked));
  setBuild(FIX.berserker);
  T.ok('after the lock the build half never moves', Game.endingKey().godpath === 'socialite' && Game.endingKeyLive().godpath === 'brawler');
  const te = K.teleEvents(Game, 'table_entered').pop() || {};
  T.ok('table_entered carries the key', te.godpath === 'socialite' && te.subclass === 'showrunner' && te.track === 'social' && te.titanFinale === 'none', JSON.stringify(te));
  Game.tableBranch = () => ({ branch: 'dark', light: 0, dark: 3, notes: [] });
  Game.tableStartPath('beloved');
  T.ok('entering a door fills the path and the moral the Table earned', Game.endingKey().tablePath === 'beloved' && Game.endingKey().moral === 'dark');
  Game.tableBranch = () => ({ branch: 'light', light: 3, dark: 0, notes: [] });
  Game.tableStartPath('defiant');
  T.ok('a downgrade re-fills the path half; the doors are remembered', Game.endingKey().tablePath === 'defiant' && Game.endingKey().moral === 'light' && Game.endingKey().doors.join(',') === 'beloved,defiant');

  // ---------------------------------------------------------------- 2
  T.section('2. Lookup order and fallbacks');
  const k = (b) => { setBuild(b); return Game.endingKeyLive(); };
  T.ok('selectors: god > class/subclass > class > track > default',
    EK.selectorsFor(k(FIX.god)).map(x => x.sel).join(' ') === 'god:one_person_army class:brawler/berserker class:brawler track:combat default');
  T.ok('endingSelectors() is the same order', Game.endingSelectors(k(FIX.god)).length === 5);
  const BD = Game.data.tableBeats, ED = Game.data.tableEndings;
  T.ok('data loaded (table-beats.json, table-endings.json)', !!(BD && BD.paths && ED && ED.paths));
  // end(): 'path' (the final alone), a bespoke selector, or 'coda <sel>'.
  const end = (b, p, m, lean) => { const r = EK.resolveEnding(ED, p, k(b), m, lean); return r ? (r.kind === 'coda' ? 'coda ' + r.sel : r.sel) : 'path'; };
  T.ok('ending: showrunner on Beloved resolves its bespoke slice, light and dark', end(FIX.showrunner, 'beloved', 'light') === 'class:socialite/showrunner' && end(FIX.showrunner, 'beloved', 'dark') === 'class:socialite/showrunner');
  T.ok('ending: demagogue (same path, no slice) falls back to Beloved\'s own finals', end(FIX.demagogue, 'beloved', 'light') === 'path');
  T.ok('ending: a berserker on Defiant falls back one level to the brawler slice', end(FIX.berserker, 'defiant', 'dark') === 'class:brawler');
  T.ok('ending: a bespoke path entry wins over a god coda (god on Defiant -> the brawler slice)', end(FIX.god, 'defiant', 'light') === 'class:brawler');
  T.ok('coda: no bespoke entry -> the god coda (god on Beloved, light and dark)', end(FIX.god, 'beloved', 'light') === 'coda god:one_person_army' && end(FIX.god, 'beloved', 'dark') === 'coda god:one_person_army');
  const godKeeper = { track: 'combat', cls: ['caregiver', 'keeper'], god: 'one_person_army' };
  T.ok('coda: god > class/subclass (a keeper who ascended plays the god coda)', end(godKeeper, 'feared', 'light') === 'coda god:one_person_army');
  T.ok('coda: class/subclass > track (keeper, combat track -> the keeper coda)', end(FIX.keeper, 'feared', 'dark') === 'coda class:caregiver/keeper' && end(FIX.keeper, 'witness', 'light') === 'coda class:caregiver/keeper');
  T.ok('coda: a subclass with no coda falls through to its track coda (berserker on Beloved -> combat)', end(FIX.berserker, 'beloved', 'light') === 'coda track:combat');
  T.ok('coda: track-only runs get the track coda on every path', PATHS.every(p => end(FIX.track, p, 'light') === 'coda track:combat'));
  T.ok('none: no coda for the key and no bespoke entry -> the final alone (no build; social track)', end(FIX.none, 'beloved', 'dark') === 'path' && end(FIX.demagogue, 'feared', 'light') === 'path');
  const cm = (lean) => { const r = EK.resolveEnding(ED, 'relay', k(FIX.track), 'grey', lean); return r && r.moral; };
  T.ok('grey relay: the coda reads the forward hand (lean > 0 light, < 0 dark, 0 light)', cm(3) === 'light' && cm(-3) === 'dark' && cm(0) === 'light');
  const one = EK.resolveEnding(ED, 'beloved', k(godKeeper), 'light');
  T.ok('exactly one coda: the god coda alone, its own lines', one && one.kind === 'coda' && one.entry.lines.length === ED.codas['god:one_person_army'].light.length);
  const beatSel = (b, p, m) => { const r = EK.resolveBeatOption(BD, p, k(b), m); return r ? `${r.sel}${r.bespoke ? '' : '(template)'}` : null; };
  T.ok('beat: showrunner on Beloved plays its bespoke option', beatSel(FIX.showrunner, 'beloved', 'light') === 'class:socialite/showrunner');
  T.ok('beat: demagogue on Beloved plays the class template', beatSel(FIX.demagogue, 'beloved', 'light') === 'class:socialite/demagogue(template)');
  T.ok('beat: a god plays its verb (god template) on every path', PATHS.every(p => beatSel(FIX.god, p, 'light') === 'god:one_person_army(template)'));
  T.ok('beat: no class, no god -> the path default (exists for every path and moral)', PATHS.every(p => ['light', 'dark'].every(m => beatSel(FIX.none, p, m) === 'default')) && beatSel(FIX.none, 'relay', 'grey') === 'default');

  // ---------------------------------------------------------------- 3
  T.section('3. The scenario plays the build');
  const startAt = (b, p, moral) => {
    setBuild(b);
    pg.table = {}; pg.tableDone = true; Game.over = false; Game.won = false;
    s.grounding = 100; s.relay = {}; pg.sysBond = 0;
    Game.tableBranch = () => ({ branch: moral === 'grey' ? 'light' : moral, band: p === 'relay' ? moral : undefined, light: 0, dark: 0, notes: [] });
    Game.tableState().phase = 'paths';
    Game.tableStartPath(p);
  };
  const opts = () => ((s.tableChoices || {}).options || []);
  const buildOpt = () => opts().find(o => o.id === 'beat:build');
  const prompt = () => (s.tableChoices || {}).prompt || '';
  startAt(FIX.showrunner, 'beloved', 'light');
  T.ok('beat one (not the build beat) has no build option', !buildOpt());
  Game.chooseTableOption('beat:hunter');
  const lightLbl = (buildOpt() || {}).label || '';
  T.ok('the build beat offers the showrunner\'s own option (light)', /Run the show from the floor/.test(lightLbl), lightLbl);
  T.ok('the prompt names the build', /YOUR BUILD/.test(prompt()) && /Showrunner/.test(prompt()), prompt().slice(0, 300));
  T.ok('the stake is legible on the option', /needs audience 4\+/.test(lightLbl));
  startAt(FIX.showrunner, 'beloved', 'dark');
  Game.chooseTableOption('beat:hunter');
  const darkLbl = (buildOpt() || {}).label || '';
  T.ok('the same class reads differently on the dark side (moral changes the option)', /control room/.test(darkLbl) && darkLbl !== lightLbl, darkLbl);
  const aud0 = Game.tableState().meters.audience | 0;
  Game.chooseTableOption('beat:build');
  T.ok('playing it moves the path meter by its data (dark +4) and records the play', (Game.tableState().meters.audience | 0) === aud0 + 4 && Game.tableState().buildPlayed.selector === 'class:socialite/showrunner', JSON.stringify(Game.tableState().meters));
  startAt(FIX.demagogue, 'beloved', 'light');
  Game.chooseTableOption('beat:hunter');
  T.ok('a class with no bespoke beat still gets an option in its own name', /Demagogue/.test((buildOpt() || {}).label || ''), (buildOpt() || {}).label);
  startAt(FIX.god, 'defiant', 'light');
  Game.chooseTableOption('beat:grain');
  T.ok('a god unlocks its verb as the option', /Turn the Pain/.test((buildOpt() || {}).label || ''), (buildOpt() || {}).label);
  T.ok('the titan finale feeds the beat (apocalypse line in the prompt)', /titan coming down/.test(prompt()));
  const dg0 = Game.tableState().meters.dignity | 0;
  Game.chooseTableOption('beat:build');
  T.ok('odds: god level (+2) and the slain apocalypse (+1) add to the default gain (+2)', (Game.tableState().meters.dignity | 0) === dg0 + 5, `${dg0} -> ${Game.tableState().meters.dignity}`);
  startAt(FIX.berserker, 'defiant', 'dark');
  Game.chooseTableOption('beat:grain');
  T.ok('defiant x brawler (dark): the collector\'s hands', /collector's hands/.test((buildOpt() || {}).label || ''));
  startAt(FIX.showrunner, 'beloved', 'light');
  Game.chooseTableOption('beat:funny');
  Game.chooseTableOption('beat:build');
  T.ok('the build option fails if the room is not yours yet (stake: audience 3 < 4) -> downgrade, never a wipe', Game.tableState().phase === 'downgrade' && !Game.over);

  // ---------------------------------------------------------------- 4
  T.section('4. Every path losable and winnable, for every fixture key');
  let fails = 0;
  const _fail = Game.tableFail;
  Game.tableFail = function () { fails++; return _fail.apply(this, arguments); };
  // walk(b, p, m): DFS over every choice sequence until both a fail and a
  // finals are found. Returns {lose, win}.
  const walk = (b, p, m) => {
    const res = { lose: false, win: false };
    const visit = (seq) => {
      if (res.lose && res.win) return;
      startAt(b, p, m);
      fails = 0;
      for (const c of seq) { Game.chooseTableOption(c); if (fails) break; }
      const Ts = Game.tableState();
      if (fails) { res.lose = true; return; }
      if (Ts.phase === 'finals') { res.win = true; return; }
      if (Ts.phase !== 'challenge' || Ts.trialed || seq.length > 6) return;
      for (const o of opts()) visit(seq.concat([o.id]));
    };
    visit([]);
    return res;
  };
  const bad = [], unwinnable = [];
  for (const fx of Object.keys(FIX)) {
    for (const p of PATHS) {
      for (const m of (p === 'relay' ? ['light', 'dark', 'grey'] : ['light', 'dark'])) {
        const r = walk(FIX[fx], p, m);
        if (!r.lose) bad.push(`${fx}/${p}/${m}`);
        if (!r.win) unwinnable.push(`${fx}/${p}/${m}`);
      }
    }
  }
  Game.tableFail = _fail;
  T.ok(`losable: every path x moral x fixture key can fail (${Object.keys(FIX).length * 15} walks)`, bad.length === 0, bad.join(' '));
  T.ok('winnable: every path x moral reaches its finals with every key, including no class and no god', unwinnable.length === 0, unwinnable.join(' '));

  // ---------------------------------------------------------------- 5
  T.section('5. Never a gate');
  Game.tableSeat = function () { return { seat: 'full', detail: {} }; };
  setBuild(FIX.none);
  const plain = JSON.stringify(Game.tableEarnedPaths());
  setBuild(FIX.god);
  const godly = JSON.stringify(Game.tableEarnedPaths());
  T.ok('the doors and their standing are identical with and without a god', plain === godly);
  const src = ['table.js'].concat(PATHS.map(p => `table-${p}.js`)).map(f => K.readSrc('src/js/' + f)).join('\n');
  T.ok('table*.js still never reads god-path state (the key is handed in by endingKey.js)', !/Godhood\b|\.godhood\b|godpath|recognizeClass|classLine/.test(src));
  const ekSrc = K.readSrc('src/js/endingKey.js');
  T.ok('endingKey.js never touches seat pricing or the earned doors', !/tableSeat\(|tableEarnedPaths\(|minSeat/.test(ekSrc));

  // ---------------------------------------------------------------- 6
  T.section('6. Endings resolve by key, in play');
  const finish = (b, p, m, seq, fid) => {
    startAt(b, p, m);
    Game.tableEndingFor && Game.endingKeyLock();
    for (const c of seq) Game.chooseTableOption(c);
    const said = K.captureSays(Game);
    Game.chooseTableOption('final:' + fid);
    said.restore();
    return said;
  };
  pg._teleSeen = {};
  let said = finish(FIX.showrunner, 'beloved', 'light', ['beat:hunter', 'beat:build', 'beat:quiet'], 'quiet');
  T.ok('beloved x showrunner x light: the bespoke final replaces the outcome and the coda plays', said.some(l => /good lighting/.test(l)) && said.some(l => /SHOWRUNNER'S FINALE/.test(l)) && !said.some(l => /making sure nobody else needs to be/.test(l)), said.slice(0, 4).join(' | '));
  T.ok('{name} is filled with the bearer\'s name', !said.some(l => /\{name\}/.test(l)));
  T.ok('the win lands and the resolved ending is noted', Game.won === true && Game.tableState().ending.selector === 'class:socialite/showrunner');
  const tw = K.teleEvents(Game, 'table_won').pop() || {};
  T.ok('table_won carries the key and which ending resolved', tw.godpath === 'socialite' && tw.subclass === 'showrunner' && tw.moral === 'light' && tw.ending === 'class:socialite/showrunner' && tw.buildPlayed === 'class:socialite/showrunner', JSON.stringify(tw));
  said = finish(FIX.showrunner, 'beloved', 'dark', ['beat:hunter', 'beat:build', 'beat:raw'], 'contract');
  T.ok('beloved x showrunner x dark: its own cut', said.some(l => /strike out the part where they own you/.test(l)) && said.some(l => /SHOWRUNNER'S CUT/.test(l)));
  said = finish(FIX.berserker, 'defiant', 'light', ['beat:grain', 'beat:build', 'beat:tear', 'beat:notwice'], 'walk');
  T.ok('defiant x brawler x light: THE DOORWAY', said.some(l => /walking backwards the whole way out/.test(l)) && said.some(l => /THE DOORWAY/.test(l)));
  said = finish(FIX.berserker, 'defiant', 'dark', ['beat:grain', 'beat:build', 'beat:tear', 'beat:records'], 'terms');
  T.ok('defiant x brawler x dark: THE SALTED ROAD', said.some(l => /blood still on your hands/.test(l)) && said.some(l => /SALTED ROAD/.test(l)));
  said = finish(FIX.demagogue, 'beloved', 'light', ['beat:hunter', 'beat:song', 'beat:quiet'], 'quiet');
  T.ok('no slice and no coda for the key: the path\'s own light ending plays alone, noted as the path', said.some(l => /making sure nobody else needs to be/.test(l)) && Game.tableState().ending.level === 'path' && Game.tableState().ending.kind === 'path');

  T.section('7. Composed endings in play: the path\'s final + one coda');
  const coda = (sel, m) => ED.codas[sel][m];
  const has = (said, line) => said.some(l => l.indexOf(line.slice(-40)) >= 0);
  pg._teleSeen = {};
  said = finish(FIX.track, 'defiant', 'light', ['beat:grain', 'beat:noone', 'beat:tear', 'beat:notwice'], 'walk');
  const iWalk = said.findIndex(l => /poorer, whole, free/.test(l));
  const iCoda = said.findIndex(l => /You came to the Table as/.test(l));
  T.ok('track coda: the path\'s own final plays, then the coda after it', iWalk >= 0 && iCoda > iWalk, said.join(' | ').slice(0, 400));
  T.ok('{path} fills with the path\'s name and {name} with the bearer\'s', said.some(l => /You came to the Table as the Defiant the hard way/.test(l)) && !said.some(l => /\{(path|name)\}/.test(l)));
  T.ok('exactly one coda: no god or class coda lines alongside it', !said.some(l => /called you|keepsakes/.test(l)));
  T.ok('the resolved coda is noted', Game.tableState().ending.kind === 'coda' && Game.tableState().ending.selector === 'track:combat');
  const tw2 = K.teleEvents(Game, 'table_won').pop() || {};
  T.ok('table_won records which coda resolved', tw2.ending === 'track:combat' && tw2.endingKind === 'coda' && tw2.endingLevel === 'track', JSON.stringify(tw2));
  said = finish(FIX.god, 'beloved', 'light', ['beat:hunter', 'beat:song', 'beat:quiet'], 'quiet');
  T.ok('god coda in play: Beloved\'s final, then the god\'s light coda with {god} filled', said.some(l => /making sure nobody else needs to be/.test(l)) && said.some(l => /The System called you The One-Person Army\. You never wanted an army/.test(l)) && Game.tableState().ending.selector === 'god:one_person_army');
  said = finish(FIX.keeper, 'beloved', 'light', ['beat:hunter', 'beat:song', 'beat:quiet'], 'quiet');
  T.ok('class coda in play: the keeper\'s light coda', has(said, coda('class:caregiver/keeper', 'light')[0]) && Game.tableState().ending.selector === 'class:caregiver/keeper');
  setBuild(FIX.track); pg.table = {};
  Game.relayLean = () => -3;
  const g1 = Game.tableEndingFor('relay', 'grey', 'none');
  Game.relayLean = () => 2;
  const g2 = Game.tableEndingFor('relay', 'grey', 'none');
  T.ok('grey relay in play: the coda follows relayLean, {path} = the Relay', g1 && g1.moral === 'dark' && /made sure the hard way/.test(g1.lines[0]) && /the Relay/.test(g1.lines[0]) && g2 && g2.moral === 'light', JSON.stringify([g1, g2]).slice(0, 300));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
