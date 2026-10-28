#!/usr/bin/env node
// test-grantdeath-b.js — proof for the death-cause trace
// instrument (sim-grantdeath-b). Synthetic legs only: each leg
// builds a fake Game, installs the REAL death wrappers exported
// by scripts/grantdeath-trace-b.js, and asserts the capture
// records a cause verbatim with a caller frame — or correctly
// reports UNRECORDED when nothing recorded it. The driver file
// is required, not run: its require.main guard means requiring
// it never starts the judged band (the env gates are set here
// before require so the module loads).
'use strict';
// Env gates the driver asserts at load time (values match the
// prereg substrate; they gate nothing in these synthetic legs).
process.env.COMPETENT_FEAST = '0';
process.env.SEATDRIVE = '0';
process.env.PLENTYDEPRI = '0';
process.env.DEPOSITGATE = '1';
const { snapshotScholar, localizeLoss, installDeathCapture, reassertDeathCapture, nameDeathCause, bracketDiff } = require('./grantdeath-trace-b');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function fakeGameWithDeath() {
  const scholar = { day: 4, dayTicks: 439, villagerId: 'vill_a', abilities: [{ id: 'fear_aura', level: 1 }], backgroundAbilities: [], health: 0, kcal: 0, hydration: 0, wounds: [{ id: 'w1' }], diseases: { scurvy: {} } };
  const calls = { playerDeath: [], registerDeath: [] };
  const obj = {
    state: { scholar, village: { fallen: [] }, telemetry: [] },
    villagerId: 'vill_a',
    over: false,
    hasAbility(id) { return (obj.state.scholar.abilities || []).some((e) => ((e && e.id) || e) === id); },
    playerDeath(cause) { calls.playerDeath.push(cause); return 'pd-ok'; },
    registerDeath(opts) { calls.registerDeath.push(opts); return 'rd-ok'; },
  };
  return { obj, calls, scholar };
}
function storeFor(sayLines) {
  return { sayLines: sayLines || [], deathEvents: [], regDeathEvents: [], reinstalls: 0, deathActive: false, regActive: false, getLastSnap: () => ({ phase: 'post-tap', seq: 4 }) };
}

// D1: playerDeath wrapper records the cause verbatim, a caller
// frame, and the body at entry — and the original still runs
// with its return value intact.
{
  const { obj, calls } = fakeGameWithDeath();
  const store = storeFor([]);
  installDeathCapture(obj, store);
  const ret = obj.playerDeath('starvation');
  const ev = store.deathEvents[0];
  ok('D1 playerDeath records cause verbatim + caller frame + body, original runs',
    ret === 'pd-ok' && calls.playerDeath.length === 1 && calls.playerDeath[0] === 'starvation'
    && store.deathEvents.length === 1 && ev.cause === 'starvation' && ev.oldId === 'vill_a'
    && ev.gameDay === 4 && ev.body.health === 0 && ev.body.woundsCount === 1
    && Array.isArray(ev.stack) && ev.stack.length >= 1 && ev.lastSnapPhase === 'post-tap', JSON.stringify(ev));
}

// D2: double-wrap guard — a later module wraps our wrapper,
// then a reassert wraps that; one death is still recorded
// exactly once, and the reinstall is counted.
{
  const { obj, calls } = fakeGameWithDeath();
  const store = storeFor([]);
  installDeathCapture(obj, store);
  const installed = obj.playerDeath;
  obj.playerDeath = function (...args) { return installed.apply(this, args); }; // later-module wrap, marker lost
  const n = reassertDeathCapture(obj, store);
  obj.playerDeath('dehydration');
  ok('D2 double-wrap records exactly once, reinstall counted',
    store.deathEvents.length === 1 && store.deathEvents[0].cause === 'dehydration'
    && calls.playerDeath.length === 1 && n >= 1 && store.reinstalls === 1,
    JSON.stringify({ deaths: store.deathEvents.length, calls: calls.playerDeath.length, n, reinstalls: store.reinstalls }));
}

// D3: registerDeath wrapper records opts verbatim.
{
  const { obj, calls } = fakeGameWithDeath();
  const store = storeFor([]);
  installDeathCapture(obj, store);
  const ret = obj.registerDeath({ kind: 'villager', villagerId: 'vill_a', name: 'Ana', cause: 'sickness', killerId: null, player: true });
  const ev = store.regDeathEvents[0];
  ok('D3 registerDeath records opts verbatim, original runs',
    ret === 'rd-ok' && calls.registerDeath.length === 1 && store.regDeathEvents.length === 1
    && ev.cause === 'sickness' && ev.villagerId === 'vill_a' && ev.player === true, JSON.stringify(ev));
}

// D4: bracket diff attaches only the interval since prev —
// the tapday-start window, not the whole run.
{
  const say = [{ line: 'day1 line' }];
  const deaths = [];
  const d1 = bracketDiff(null, { sayLines: say, deathEvents: deaths, regDeathEvents: [], fallen: [], teleDeaths: [] });
  say.push({ line: 'overnight line' });
  deaths.push({ kind: 'playerDeath', cause: 'wounds' });
  const fallen = [{ villagerId: 'vill_a', cause: 'wounds' }];
  const d2 = bracketDiff(d1.nextPrev, { sayLines: say, deathEvents: deaths, regDeathEvents: [], fallen, teleDeaths: [{ type: 'death', who: 'vill_a', cause: 'wounds' }] });
  ok('D4 bracket diff isolates the since-prev interval',
    d1.window.sayLines.length === 1 && d2.window.sayLines.length === 1 && d2.window.sayLines[0] === 'overnight line'
    && d2.window.deathEvents.length === 1 && d2.window.fallenAdded.length === 1 && d2.window.teleDeathAdded.length === 1,
    JSON.stringify(d2.window));
}

// D5: nameDeathCause priority — playerDeath beats registerDeath
// beats fallen beats telemetry; a mismatched bearer does not
// steal another death's cause.
{
  const named = nameDeathCause({
    deathEvents: [{ kind: 'playerDeath', cause: 'starvation', oldId: 'vill_a', stack: ['at Game.endDay (src/js/game.js:31787:10)'] }],
    regDeathEvents: [{ cause: 'sickness', villagerId: 'vill_a' }],
    fallen: [{ villagerId: 'vill_a', cause: 'wounds' }],
    teleDeaths: [{ type: 'death', who: 'vill_a', cause: 'dehydration' }],
  }, 'vill_a');
  const fallback = nameDeathCause({
    deathEvents: [{ kind: 'playerDeath', cause: 'starvation', oldId: 'vill_OTHER', stack: [] }],
    regDeathEvents: [{ cause: 'sickness', villagerId: 'vill_a', stack: ['at Game.foo (src/js/x.js:1:1)'] }],
    fallen: [], teleDeaths: [],
  }, 'vill_a');
  ok('D5 nameDeathCause prefers playerDeath, falls back per bearer',
    named.recorded === true && named.source === 'playerDeath' && named.cause === 'starvation' && /endDay/.test(named.site || '')
    && fallback.recorded === true && fallback.source === 'registerDeath' && fallback.cause === 'sickness',
    JSON.stringify({ named, fallback }));
}

// D6: body-only fixture is UNRECORDED — health/kcal alone
// never invent a cause (the prereg's counting rule).
{
  const r = nameDeathCause({ deathEvents: [], regDeathEvents: [], fallen: [], teleDeaths: [] }, 'vill_a');
  const r2 = nameDeathCause({ body: { health: 0, kcal: 0, hydration: 0 } }, 'vill_a');
  ok('D6 health/kcal-only fixture is UNRECORDED, not a cause',
    r.recorded === false && r.cause === null && r2.recorded === false, JSON.stringify({ r, r2 }));
}

// D7: same-object mantle fixture (grantpersist metric-review
// note): scholar object unchanged, bearer id + list replaced
// — detector still names the bearer change.
{
  const scholar = { day: 1, dayTicks: 100, villagerId: 'vill_a', abilities: [{ id: 'molt', level: 1 }], backgroundAbilities: [] };
  const G = { state: { scholar }, villagerId: 'vill_a', over: false,
    hasAbility(id) { return (G.state.scholar.abilities || []).some((e) => ((e && e.id) || e) === id); } };
  let refs = null;
  function snap(phase, seq) { const s = snapshotScholar(G, 'molt', phase, seq, refs); refs = { scholar: G.state.scholar, list: G.state.scholar.abilities }; return s; }
  const snaps = [snap('setup', 0)];
  // Mantle mutates the SAME scholar object in place.
  scholar.villagerId = 'vill_b'; G.villagerId = 'vill_b';
  scholar.abilities = [{ id: 'beast_calm', level: 1 }]; scholar.day = 2;
  snaps.push(snap('tapday-start', 1));
  const loc = localizeLoss(snaps, 'molt');
  ok('D7 same-object mantle: bearer change named, scholar object unchanged',
    loc.lost === true && loc.bearerChanged === true && loc.scholarChanged === false, JSON.stringify(loc));
}

// D8: snapshot carries body fields for last-present comparison.
{
  const scholar = { day: 2, dayTicks: 200, villagerId: 'vill_a', abilities: [{ id: 'ambush', level: 1 }], backgroundAbilities: [], health: 87, kcal: 1152, hydration: 60, wounds: [], diseases: {} };
  const G = { state: { scholar }, villagerId: 'vill_a', over: false, hasAbility: () => true };
  const s = snapshotScholar(G, 'ambush', 'post-tap', 3, null);
  ok('D8 snapshot body fields present',
    s.health === 87 && s.kcal === 1152 && s.hydration === 60 && s.woundsCount === 0 && Array.isArray(s.diseaseKeys), JSON.stringify(s));
}

console.log('test-grantdeath-b: ' + pass + ' passed, ' + fail + ' failed');
console.log(fail === 0 ? 'verdict PROOF-GREEN' : 'verdict PROOF-RED');
process.exit(fail === 0 ? 0 : 1);
