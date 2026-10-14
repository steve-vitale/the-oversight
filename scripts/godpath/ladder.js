#!/usr/bin/env node
// scripts/godpath/ladder.js — the god-path acceptance ladder.
//
// One check list for the whole build, grouped by phase (docs/godpath/PLAN.md).
// Checks at or below scripts/godpath/phase.json are enforced; later ones
// print as TODO so you always see what's next. Finish a phase = every check
// for it is green → bump phase.json in the same commit.
//
//   node scripts/godpath/ladder.js                  # enforce current phase
//   GODPATH_PHASE=2 node scripts/godpath/ladder.js  # preview phase 2
//
// These are CONTRACT checks: they only use the API names in PLAN.md
// ("Runtime contract"). Behaviour details belong in your own proof tests
// (scripts/godpath/test-*.js), which scripts/check.js also runs.
'use strict';
const K = require('./lib');
const T = K.reporter('godpath-ladder');

(async () => {
  const GP = K.readJSON('src/data/godpaths.json');
  const paths = GP.paths || {};
  const PIDS = Object.keys(paths);
  const gameSrc = K.readSrc('src/js/game.js');
  const baSrc = K.readSrc('src/js/buildarounds.js');
  const tableSrc = K.readSrc('src/js/table.js');
  const fnOf = (Game, name) => typeof Game[name] === 'function';

  // ── P0: foundations / cleanup ───────────────────────────────────────────
  T.section('P0 · foundations');
  T.ok('godpaths.json is in the data load list (game.js init)', /'godpaths\.json'/.test(gameSrc));
  T.ok('fusion code removed (rejected approach)', !/availableFusions|\bfuse\s*:/.test(baSrc));
  T.ok('use-count recognition removed (rejected: points/meter ascension)',
    !/onPathLived|uses\s*>=\s*50/.test(baSrc));
  T.ok('no god ability pushed into abilities without a slot check',
    !/abilities\.push\(\s*pdef\.godAbility\s*\)/.test(baSrc));
  T.ok('table.js never reads god-path state (victory is the Table, never gated on gods)',
    !/godpath|godAbility|pathLife|crimson_god|martyrs_aegis|isGod\b/.test(tableSrc));
  T.ok('synergy activation reads the real codex (state.codex, not scholar.codex)',
    !/\(sch\.codex \|\| \{\}\)\.techniques/.test(gameSrc));

  const Game = await K.load({ seed: 20261014 });
  T.ok('Game.data.godpaths is loaded at runtime', !!(Game.data && Game.data.godpaths && Game.data.godpaths.paths));

  // ── P1: conditions runtime ──────────────────────────────────────────────
  T.section('P1 · conditions');
  const hasAPI = fnOf(Game, 'hasCondition') && fnOf(Game, 'setCondition');
  T.ok('Game.hasCondition(fighterKey, cond) and Game.setCondition(fighterKey, cond, on) exist', hasAPI, '', 1);
  if (hasAPI) {
    K.newRun(Game);
    const c0 = (paths.hunter || {}).condition;
    let mf = K.fight(Game, 'hushwolf', { hp: 500 });
    let setOk = false, resetOk = false;
    try {
      Game.setCondition(mf.key, c0, true);
      setOk = Game.hasCondition(mf.key, c0) === true;
      K.fight(Game, 'hushwolf', { hp: 500 });
      mf = Game.tbfight.fighters.find(f => f.kind === 'monster');
      resetOk = Game.hasCondition(mf.key, c0) === false;
    } catch (e) { T.ok('condition API does not throw', false, e.message, 1); }
    T.ok('setCondition → hasCondition round-trips', setOk, '', 1);
    T.ok('fight-scoped conditions reset when a new fight starts', resetOk, '', 1);
    // fightStart-scoped: Survivalist's well-fed must read the kcal line at fight start.
    const sc = (paths.survivalist || {}).condition;
    const s = Game.state.scholar;
    const cap = Game.kcalCap ? Game.kcalCap() : 2400;
    s.kcal = cap; K.fight(Game, 'hushwolf', { hp: 500 });
    const fedOn = Game.hasCondition('p', sc);
    s.kcal = Math.round(cap * 0.3); K.fight(Game, 'hushwolf', { hp: 500 });
    const fedOff = Game.hasCondition('p', sc);
    T.ok(`fightStart condition "${sc}" follows the kcal line (on at full, off at 30%)`, fedOn === true && fedOff === false,
      `full=${fedOn} low=${fedOff}`, 1);
  }

  // ── P2: payoffs cash in ─────────────────────────────────────────────────
  T.section('P2 · payoffs');
  for (const pid of PIDS) {
    const p = paths[pid];
    const def = (Game.data.abilities || []).find(a => a.id === p.payoff);
    const act = def && (def.actions || [])[0];
    if (!def || !act || !hasAPI) { T.ok(`${pid}: payoff emits godpath_payoff with cashed true/false`, false, 'payoff/action/API missing', 2); continue; }
    K.newRun(Game); K.openSlots(Game, 6); K.giveAbility(Game, p.payoff, { force: true });
    const res = {};
    for (const on of [false, true]) {
      Game.state.scholar.kcal = 2000;
      const mf = K.fight(Game, 'hushwolf', { hp: 500 });
      Game.setCondition('p', p.condition, on); Game.setCondition(mf.key, p.condition, on);
      const before = K.teleEvents(Game, 'godpath_payoff').length;
      try { Game.useAbility(p.payoff, act.id, mf.key); } catch (e) {}
      const ev = K.teleEvents(Game, 'godpath_payoff').slice(before)[0];
      res[on] = ev ? ev.cashed : undefined;
    }
    T.ok(`${pid}: ${p.payoff} emits godpath_payoff — cashed:false without "${p.condition}", cashed:true with it`,
      res[false] === false && res[true] === true, JSON.stringify(res), 2);
  }

  // ── P3: Trials + ascension ──────────────────────────────────────────────
  T.section('P3 · trial and ascension');
  const trialAPI = ['godpathTrialEligible', 'godpathStartTrial', 'godpathAscend'].every(n => fnOf(Game, n));
  T.ok('Game.godpathTrialEligible(pid) / godpathStartTrial(pid) / godpathAscend(pid) exist', trialAPI, '', 3);
  if (trialAPI) {
    const pid = 'hunter', p = paths[pid];
    K.newRun(Game); K.openSlots(Game, 6);
    const s = Game.state.scholar;
    K.giveAbility(Game, p.payoff, { force: true, level: 3 });
    s.day = 40;
    T.ok('not eligible before day 80 (no mid-game godhood)', Game.godpathTrialEligible(pid) === false, '', 3);
    s.day = 85;
    s.godpath = Object.assign({}, s.godpath, { cashedAtL3: { [pid]: true } });
    T.ok('eligible at day 85 with payoff L3 + cashed at L3', Game.godpathTrialEligible(pid) === true, '', 3);
    const idxBefore = K.abilityIds(Game).indexOf(p.payoff);
    const countBefore = s.abilities.length;
    let asc = false; try { asc = Game.godpathAscend(pid); } catch (e) {}
    const ids = K.abilityIds(Game);
    T.ok('ascension transforms the payoff IN ITS SLOT (same index, same ability count)',
      asc && ids[idxBefore] === p.godAbility && s.abilities.length === countBefore && !ids.includes(p.payoff),
      `idx ${idxBefore} → ${ids[idxBefore]}`, 3);
    T.ok('emits godpath_ascended telemetry', K.teleEvents(Game, 'godpath_ascended').length > 0, '', 3);
    // One god per life.
    const q = paths.brawler;
    K.giveAbility(Game, q.payoff, { force: true, level: 3 });
    s.godpath.cashedAtL3.brawler = true;
    T.ok('one god per life: second path is never eligible', Game.godpathTrialEligible('brawler') === false, '', 3);
  }

  // ── P4: scale ───────────────────────────────────────────────────────────
  T.section('P4 · scale');
  T.ok('Game.godpathBladeValue(who) exists (a god counts as titanBlades toward the coalition gate)',
    fnOf(Game, 'godpathBladeValue'), '', 4);
  if (fnOf(Game, 'godpathBladeValue')) {
    K.newRun(Game);
    T.ok('a non-god counts as 1 blade', Game.godpathBladeValue('p') === 1, '', 4);
  }

  T.done();
})().catch(e => { console.error('LADDER HARNESS ERROR', e); process.exitCode = 2; });
