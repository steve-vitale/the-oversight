'use strict';
// Exercise the real app refresh and button wiring with DOM replacement semantics.
// Engine-only sims cannot catch discarded DOM handlers. Browser proof remains
// necessary for pointer input, overlays and asynchronous combat cadence.
const fs = require('fs'), path = require('path'), vm = require('vm');
const K = require('./lib'), T = K.reporter('combat refresh');
const source = fs.readFileSync(path.join(__dirname, '../../src/js/app.js'), 'utf8');
function fn(name, next) {
  return source.slice(source.indexOf(`  function ${name}(`), source.indexOf(`  function ${next}(`));
}
(async () => {
  const G = await K.load({seed: 20261018});
  K.newRun(G); G.startCombat('gallowdeer');
  const fight = G.tbfight;
  fight.turnIdx = fight.order.indexOf('p'); fight.asyncRunning = false;
  const p = G.tbFighter('p'); p.acted = false; p.moveLeft = 0;
  let elements = {}, writes = 0, calls = 0, renders = 0, targetWires = 0;
  const wrap = {
    set innerHTML(html) {
      writes++; elements = {};
      for (const match of html.matchAll(/id="([^"]+)"/g)) elements[match[1]] = {onclick: null};
    }
  };
  const sig = {log: 0, day: 1, part: 0, combat: true, over: false, tbm: 0};
  const context = {
    Game: G, globalThis, console,
    document: {
      getElementById: id => elements[id] || null,
      querySelector: selector => selector === '.ord-actions' ? wrap : null,
      querySelectorAll: () => []
    },
    moveSig: () => sig,
    expeditionScreen: () => { throw Error('expected light refresh, not full render'); },
    rerender: () => { renders++; },
    combatActionsHTML: () => '<button id="c-wait">Wait</button><button id="c-study">Study</button><button id="c-shout">Shout</button><button id="c-offer">Offer</button><button id="c-strike">Strike</button>',
    selfBarHTML: () => '', contextBarHTML: () => '', targetBarHTML: () => '',
    dangerBarHTML: () => '', abilityBarHTML: () => '', expHeadHTML: () => '',
    dayTickBar: () => '', statusBars: () => '',
    wireSelfBar: () => {}, wireContextBar: () => {}, wireAbilityBar: () => {},
    wireTargetBar: () => { targetWires++; }
  };
  vm.createContext(context);
  // Signature modules were loaded by the shared kit in the host realm.
  global.document = context.document;
  vm.runInContext(fn('setHTMLCached', 'syncAfterMove') + fn('syncAfterMove', 'dpadPress').split('  MoveAnim.hooks.step')[0] + fn('wireCombatPanel', 'wirePanel'), context);
  const wait = G.tbPlayerWait;
  G.tbPlayerWait = function () { calls++; return wait.call(this); };
  const sync = () => context.syncAfterMove({_sig: {...sig}}, {moved: false});
  sync();
  T.ok('blocked/no-moves refresh replaces action DOM', writes === 1);
  for (const id of ['c-wait','c-study','c-shout','c-offer','c-strike']) {
    T.ok(`${id} is connected after light refresh`, typeof elements[id].onclick === 'function');
  }
  T.ok('replacement target bar is also rewired', targetWires === 1);
  const firstWait = elements['c-wait']; sync();
  T.ok('identical cached refresh retains the same live button', writes === 1 && elements['c-wait'] === firstWait);
  const round = fight.round, turn = fight.turnIdx;
  if (firstWait.onclick) firstWait.onclick();
  T.ok('actual Wait invokes game once and rerenders once', calls === 1 && renders === 1);
  T.ok('0 move / 1 act Wait advances the real combat', fight.round !== round || fight.turnIdx !== turn || fight.over);
  T.ok('pad has no side-switch hotspot', !fn('dpadHTML','moveStepHook').includes('dp-side'));
  T.ok('handedness remains a labeled Settings control', source.includes('aria-label="Walk pad side"') && source.includes('padSide.onchange'));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
