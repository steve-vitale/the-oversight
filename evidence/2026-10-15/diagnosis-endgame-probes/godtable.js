// REPO=<wt> GOD=living_garden|none PATH=feared STAKES=0|1 SEED=n node godtable.js
// Pinned Table: a real lesser seat (debug overtime3 state, tier reset to 0),
// a typical capable-run ledger, optional ascended god + named class; force the
// door, answer the rest with the capable bot's own scorer. One JSON line.
const path = require('path');
const REPO = process.env.REPO;
const H = require(path.join(REPO, 'scripts/sim-harness'));
(async () => {
  if (process.env.STAKES === '1') process.env.CAPABLE_READ_STAKES = '1';
  const { scoreTableOption } = require(path.join(REPO, 'scripts/policies/capable'));
  const seed = +process.env.SEED || 1;
  const { Game } = await H.quietLog(() => H.loadGame({ seed, mode: 'godtable' }));
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.debugScenario('overtime3');
  const pg = Game.progState();
  pg.overtime = 0; pg.overtimeDays = 0;
  Object.assign(Game.ledger(), { might: 90, brokerage: 4, showmanship: 20, embrace: 4, defiance: 5, exposed: 3, unified: 13, fractured: 3, foodShared: 60, foodHoarded: 0, protected: 30, killed: 0, betrayed: 0 });
  Game.state.viewership = 40;
  const god = process.env.GOD || 'none';
  const G = Game.data.godpaths.paths;
  if (god !== 'none') {
    const pid = Object.keys(G).find(k => G[k].god.id === god);
    Game.state.scholar.godhood = { recognized: { [god]: true }, active: [god] };
    Game.state.scholar.godpath = { path: pid, subclass: G[pid].subclasses ? Object.keys(G[pid].subclasses)[0] : null, since: 50, god };
  }
  const want = process.env.PATH_ID || 'feared';
  const tele = [];
  const _t = Game.tele; Game.tele = function (ty, d) { if (/^table_(path|failed|won)/.test(ty)) tele.push(ty + ':' + ((d || {}).path || '') + ':' + ((d || {}).reason || '').slice(0, 40)); return _t.apply(this, arguments); };
  const r = Game.tableTakeSeat();
  const picks = [];
  for (let n = 0; n < 40; n++) {
    const tc = (Game.state.scholar || {}).tableChoices;
    if (!tc || !tc.options || !tc.options.length || Game.won || (Game.progState().table || {}).phase === 'done') break;
    const T = Game.tableState();
    let pick = tc.options.find(o => o.id === 'path:' + want);
    if (!pick) {
      let best = null;
      for (const o of tc.options) { const sc = scoreTableOption(Game, o, T); if (!best || sc > best.sc) best = { o, sc }; }
      pick = best.o;
    }
    picks.push(pick.id + (/needs/.test(pick.label) ? '[' + pick.label.replace(/.*\((needs[^)]*)\).*/, '$1') + ']' : ''));
    const before = JSON.stringify(tc.options.map(o => o.id));
    Game.chooseTableOption(pick.id);
    const tc2 = (Game.state.scholar || {}).tableChoices;
    if (tc2 && JSON.stringify((tc2.options || []).map(o => o.id)) === before && tc2 === tc) break;
  }
  const doors = Game.tableEarnedPaths().filter(p => p.earned).map(p => p.id + ':' + p.strength).join(' ');
  console.log(JSON.stringify({ seed, god, path: want, stakes: process.env.STAKES || '0', seated: !!(r && r.ok), won: !!Game.won, tele, picks: picks.join(' '), doors }));
})();
