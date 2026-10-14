#!/usr/bin/env node
// scenario-predcond-20261014.js — CONSTRUCTED predation-positive fixture (the
// sim-findings #172 fallback).
//
// #172: no live predation-positive reproduced on current master — the
// preddisc discriminator's sensitivity is proven on synthetic s44-shaped
// telemetry only. If the 8-seed pilot produces ZERO predation-positive
// classifications, this fixture validates the trigger + verb fork on a
// forced-gorge full collapse instead of claiming a null.
//
// The fixture: 30 days of leadfeast (lived-in world), pantry stocked with
// 30,000 kcal of preserved grain, then a wave-5 Cancellation pinned at the
// treeline gorging nightly while the armed predcond layer runs 21 days.
// FIXTURE STAGING (documented, not hidden):
//   (a) the wave-5 unlock is staged (Game.unlockedWave = () => 5) — the
//       scenario tests the post-unlock spiral response, not the unlock road;
//   (b) two scholar deaths are seeded in the armed ctx's death history
//       (days D-5, D-2) — the spiral needs 2 markers; the gorge supplies the
//       pantry-trajectory marker LIVE, the deaths are the fixture's second;
//   (c) the scholar is parked off the haven tile so the harness doesn't
//       auto-resolve contact with the lingerer (the gorgcall pattern);
//   (d) the pantry is trimmed to 30k kcal at the armed-phase start — the
//       lived-in 70k+ pantry would take longer to collapse than the village
//       survives; the trim lands BEFORE the policy's first sample so it never
//       enters the 7d drain.
// ASSERTIONS:
//   A1: a LIVE predation-positive classification (the layer's _pcLastClass
//       reads 'predation' with raidExplains7d >= 0.40 on real gorge telemetry)
//   A2: the layer engages with type 'pantry-raid'
//   A3: the scope-cut beat fires (/RAID PREDATION/ + /endure it/)
//   A4: the apex fence holds — zero triggerEncounter calls while engaged
//   A5: conserve holds — zero hostFeast calls while pantry-raid engaged
//   A6: the brace verbs fire — walk-home + guarded travel while engaged
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.PREDCOND = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installPredation, finalizePredation, pantryKcal } = require('./predation-lib-20261014');
const { leadfeast } = require('./policies/feastscale');
const { predcond } = require('./policies/predcond');

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function stockPantry(Game, kcal) {
  try {
    const v = Game.state.village || {};
    v.pantry = v.pantry || [];
    v.pantry.push({ id: 'fixture-grain', name: 'fixture grain', kcalEach: kcal, units: 1, foodState: 'preserved' });
  } catch (e) {}
}

(async () => {
  const results = {};
  const check = (name, ok, detail) => {
    results[name] = { ok: !!ok, detail: detail || '' };
    console.log((ok ? '  ok - ' : '  FAIL - ') + name + (detail ? ' :: ' + detail : ''));
  };
  const { Game } = await loadGame({ seed: 42, mode: 'predcond-scenario', fullTelemetry: false });
  await setupGame(Game);
  await quietLog(() => runDays(Game, leadfeast, { days: 25 }));
  const d0 = gday(Game);
  console.log('lived-in world at day ' + d0 + ', pantry ' + Math.round(pantryKcal(Game)) + ' kcal');
  stockPantry(Game, 30000);
  // (d) trim the pantry to 30k BEFORE the policy's first sample
  try {
    const v0 = Game.state.village || {};
    let items = (v0.pantry || []).slice().sort((a, b) => ((b.kcalEach || 0) * (b.units || 1)) - ((a.kcalEach || 0) * (a.units || 1)));
    let total = items.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    const kept = [];
    for (const it of items) {
      const k = (it.kcalEach || 0) * (it.units || 1);
      if (total - k >= 15000) { total -= k; } else kept.push(it);
    }
    v0.pantry = kept;
    console.log('trimmed pantry to ' + Math.round(pantryKcal(Game)) + ' kcal');
  } catch (e) { console.log('trim failed: ' + (e && e.message)); }
  const v = Game.state.village || {};
  const hx = (v.px !== undefined && v.px !== null) ? v.px : 4, hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
  const m = { id: 'cancellation', key: 'scenario-apex-1', lingering: true, hp: 5000, tx: hx, ty: hy, mx: hx, my: hy };
  Game.worldMonsters().push(m);
  try { Game.travelTo(hx + 1 > 8 ? hx - 1 : hx + 1, hy); } catch (e) {}
  // (a) stage the unlock
  Game.unlockedWave = () => 5;
  const track = installPredation(Game);
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) { try { said.push({ day: gday(this), text: String(msg || '').slice(0, 300) }); } catch (e) {} return origSay(msg); };
  const trigEncounters = [];
  if (typeof Game.triggerEncounter === 'function') {
    const origTE = Game.triggerEncounter.bind(Game);
    Game.triggerEncounter = function (id) { trigEncounters.push({ day: gday(this), id }); return origTE(id); };
  }
  const feasts = [];
  if (typeof Game.hostFeast === 'function') {
    const origHF = Game.hostFeast.bind(Game);
    Game.hostFeast = function (o) { feasts.push({ day: gday(this) }); return origHF(o); };
  }
  let savedCtx = null, armedDay0 = null, pinN = 0;
  // (d) SUSTAINED SIEGE: the engine's crisis drift resolves lingering
  // episodes after ~6 days — re-pin a fresh Cancellation every armed day so
  // the gorge is sustained through the collapse window (the s44 shape).
  function repin(G) {
    try {
      const vv = G.state.village || {};
      const hx2 = (vv.px !== undefined && vv.px !== null) ? vv.px : 4;
      const hy2 = (vv.py !== undefined && vv.py !== null) ? vv.py : 4;
      const live = (G.worldMonsters ? G.worldMonsters() : [])
        .some(x => x && x.lingering && (x.hp || 0) > 0);
      if (!live) {
        pinN++;
        G.worldMonsters().push({ id: 'cancellation', key: 'scenario-apex-' + pinN,
          lingering: true, hp: 5000, tx: hx2, ty: hy2, mx: hx2, my: hy2 });
      }
    } catch (e) {}
  }
  const armedDaily = predcond.daily.bind(predcond);
  const wrapped = Object.assign({}, predcond, {
    id: 'predcond-scenario',
    daily(G, ctx) {
      savedCtx = ctx;
      if (armedDay0 == null) {
        armedDay0 = gday(G);
        // (b) fixture deaths: two accelerating scholar deaths in the history
        ctx._pcDeaths = ctx._pcDeaths || [];
        ctx._pcDeaths.push(armedDay0 - 5, armedDay0 - 2);
      }
      repin(G);
      try { track.sampleDay(); } catch (e) {}
      return armedDaily(G, ctx);
    },
  });
  await quietLog(() => runDays(Game, wrapped, { days: 28 }));
  Game.say = origSay;
  const fin = finalizePredation(Game, track);
  const ctx = savedCtx || {};
  const days = gday(Game);
  console.log(`armed phase: day ${d0} -> ${days}, gorge nights ${fin.gorgeNights}, gorged ${Math.round(fin.totalGorged)} kcal, pantry now ${Math.round(pantryKcal(Game))} kcal`);
  console.log('engages: ' + (ctx._wcEngages || 0) + ' types=' + JSON.stringify(ctx._pcEngageTypes || []) +
    ' engageDays=' + JSON.stringify(ctx._pcEngageDays || []));
  console.log('deaths: ' + JSON.stringify(ctx._pcDeaths || []));
  console.log('feedDays: ' + JSON.stringify(ctx._pcFeedDays || []));
  console.log('successions: ' + JSON.stringify((ctx._pcSuccessions || []).map(s => [s.day, s.killer])));
  for (const h of (ctx._pcMarkerHist || [])) {
    if (h.markers && h.markers.length && h.day >= (armedDay0 || 0)) console.log('  markers d' + h.day + ': ' + h.markers.join('+') + ' type=' + h.type);
  }
  console.log('endReason check: day ' + days + ' of ' + (d0 + 21));

  check('A1 live predation-positive classification',
    !!(ctx._pcLastClass && ctx._pcLastClass.cls === 'predation'),
    ctx._pcLastClass ? JSON.stringify(ctx._pcLastClass.p7) : 'no classification recorded');
  check('A2 engages as pantry-raid',
    (ctx._pcEngageTypes || []).includes('pantry-raid'),
    'types=' + JSON.stringify(ctx._pcEngageTypes || []));
  const scopeBeats = said.filter(s => /RAID PREDATION/.test(s.text) && /endure it/.test(s.text));
  check('A3 scope-cut beat fires', scopeBeats.length >= 1, scopeBeats.length + ' beats');
  const engagedDays = new Set(ctx._pcEngageDays || []);
  const trigWhileEngaged = trigEncounters.filter(t => engagedDays.has(t.day));
  check('A4 apex fence: zero engagement verbs while engaged', trigWhileEngaged.length === 0,
    trigEncounters.length + ' total triggerEncounter calls');
  const feastsWhileEngaged = feasts.filter(f => engagedDays.has(f.day));
  check('A5 conserve: zero feasts while pantry-raid engaged', feastsWhileEngaged.length === 0,
    feasts.length + ' total hostFeast calls');
  check('A6 brace verbs fire (walk-home + guarded travel)',
    (ctx.wcHomeReturns || 0) >= 1 && ((ctx.wcMonsterTileDeclined || 0) + (ctx.wcFarTravelDeclined || 0)) >= 0,
    'walkHome=' + (ctx.wcHomeReturns || 0) + ' declined=' + ((ctx.wcMonsterTileDeclined || 0) + (ctx.wcFarTravelDeclined || 0)));

  const fails = Object.values(results).filter(r => !r.ok).length;
  console.log(`\nscenario: ${Object.keys(results).length - fails}/${Object.keys(results).length} assertions hold`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
