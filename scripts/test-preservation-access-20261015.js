#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib'), T = K.reporter('preservation-access');
const { preservationSnapshot } = require('./gear-usage-audit');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  const s = G.state.scholar;
  // Explicit prepared supplies and novice technique state. Public verbs and
  // the actual generated Haven fire perform the work; no fuel/helper mocks.
  G.state.codex.techniques = { clean: false, cook: false, preserve: false, render: false, shell: true };
  const food = (foodKind, foodState, units, kcalEach, more) => Object.assign({ foodKind, foodState, units, kcalEach, hiddenKcal: kcalEach, name: 'Prepared ' + foodKind, edible: true, safe: true, kg: 0.1, spoilDay: s.day + 4 }, more);
  const fat = (state, units, kcal) => food('fat', state, units, state === 'raw' ? 0 : kcal, { hiddenKcal: kcal, edible: state !== 'raw' });
  const meat = units => food('meat', 'preserved', units, 400);
  const berries = units => food('plant', 'raw', units, 30, { plantId: 'blackberry' });
  T.ok('generated Haven has an actual fire', G.nearFire());
  s.inventory = [food('meat', 'cooked', 2, 750)];
  let ticks = s.dayTicks; G.preserveFood();
  T.ok('blind smoke teaches and pays rough yield, shelf and time', G.knowsTechnique('preserve') && s.inventory[0].kcalEach === 600 && s.inventory[0].foodState === 'preserved' && s.inventory[0].spoilDay === s.day + 15 && s.dayTicks === ticks + 16);
  s.inventory = [food('meat', 'cooked', 2, 750)]; G.preserveFood();
  T.ok('next smoke uses learned 95 percent yield and 30 day shelf', s.inventory[0].kcalEach === 713 && s.inventory[0].spoilDay === s.day + 30);
  s.inventory = [fat('raw', 1, 1000)]; ticks = s.dayTicks; G.renderFat();
  T.ok('blind render teaches, retains 65 percent and pays 12 ticks', G.knowsTechnique('render') && s.inventory[0].kcalEach === 650 && s.inventory[0].foodState === 'rendered' && s.dayTicks === ticks + 12 && s.inventory[0].spoilDay === s.day + 90);
  s.inventory = [fat('raw', 1, 1000)]; G.renderFat();
  T.ok('next rendering uses learned 90 percent yield', s.inventory[0].kcalEach === 900);
  const ready = () => [meat(2), fat('rendered', 1, 810), berries(2)];
  s.inventory = ready(); G.state.codex.techniques.render = false;
  let before = JSON.stringify(s.inventory); ticks = s.dayTicks; G.makePemmican();
  T.ok('render knowledge gate preserves all inputs and time', JSON.stringify(s.inventory) === before && s.dayTicks === ticks);
  G.state.codex.techniques.render = true;
  const preview = G.pemmicanPreview(); G.makePemmican();
  const bars = s.inventory.filter(i => i.foodState === 'pemmican');
  const kcal = bars.reduce((n, i) => n + i.units * i.kcalEach, 0);
  T.ok('public make consumes exact set, matches preview and retains honest calories', s.inventory.length === 1 && bars.length === 1 && bars[0].units === preview.bars && Math.abs(kcal - 1670 * 0.97) <= bars[0].units / 2);
  T.ok('pemmican pays 20 ticks and keeps 120 days', s.dayTicks === ticks + 20 && bars[0].spoilDay === s.day + 120);
  // The counter is a real separate container; processing must stay there.
  const stash = G.prepStash(); stash.length = 0; stash.push(...ready());
  before = JSON.stringify(s.inventory); G.makePemmican(stash);
  T.ok('counter make transforms its own stock without moving the personal pack', JSON.stringify(s.inventory) === before && stash.length === 1 && stash[0].foodState === 'pemmican');
  s.inventory = ready(); s.inventory[1].units = 0;
  const snapshotState = JSON.stringify(G.state), snap = preservationSnapshot(G);
  T.ok('observer is read-only and excludes explicit empty fat', JSON.stringify(G.state) === snapshotState && snap.containers.pack.renderedFat === 0 && snap.containers.pack.ingredientSets === 0);
  for (const kind of ['fat', 'meat', 'berries']) {
    s.inventory = kind === 'fat' ? [meat(2), fat('rendered', 0, 810), berries(2)]
      : kind === 'meat' ? [meat(0), meat(0), fat('rendered', 1, 810), berries(2)]
      : [meat(2), fat('rendered', 1, 810), berries(0), berries(0)];
    before = JSON.stringify(s.inventory); ticks = s.dayTicks;
    const emptyPreview = G.pemmicanPreview(); G.makePemmican();
    T.ok('empty ' + kind + ' cannot fund pemmican or spend ingredients/time', emptyPreview.sets === 0 && JSON.stringify(s.inventory) === before && s.dayTicks === ticks);
  }
  s.inventory = ready(); delete s.inventory[1].units;
  T.ok('legacy singleton fat still funds exactly one set', G.pemmicanPreview().sets === 1);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
