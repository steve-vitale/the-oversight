#!/usr/bin/env node
// scenario-gorgcall-20261014.js — CONSTRUCTED gorge-night fixture (gorgcall arm).
//
// The pre-screen found the phenomenon nearly absent on the leadfeast road
// (1 sub-day wave-5 episode, 0 gorge nights, across 8 seeds x 180d). This
// deterministic fixture proves the mechanism end to end on a sustained
// wave-5 gorge episode and measures honestly what the aid chain does:
//   call -> help marches -> help ARRIVES -> gorge nights while help is at
//   the door -> episode resolution + kcal ledger.
// If help arrives and the gorge continues (aidFight is dormant in
// production), that is the measured finding — documented, not built.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.GORGCALL = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installPredation, finalizePredation, pantryKcal } = require('./predation-lib-20261014');
const gorgcall = require('./policies/gorgcall');

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function stockPantry(Game, kcal) {
  try {
    const v = Game.state.village || {};
    v.pantry = v.pantry || [];
    v.pantry.push({ id: 'fixture-grain', name: 'fixture grain', kcalEach: kcal, units: 1, foodState: 'preserved' });
  } catch (e) {}
}

(async () => {
  const { Game } = await loadGame({ seed: 42, mode: 'gorgcall-scenario', fullTelemetry: false });
  await setupGame(Game);
  // 30 days of leadfeast so the world is lived-in (links may or may not
  // exist — the fixture then forms one honestly via the engine's own birth).
  await quietLog(() => runDays(Game, gorgcall.leadfeast, { days: 30 }));
  try {
    const ovs = ((Game.state || {}).otherVillages || []).filter(o => o && o.id && o.id !== 'haven');
    if (ovs.length && !Game.villageLinks('haven').length) {
      const link = Game._formLink(ovs[0].id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
      if (link) link.trust = 65;
    }
  } catch (e) {}
  stockPantry(Game, 30000);
  const pan0 = pantryKcal(Game);
  // The sustained episode: a wave-5 Cancellation pinned at the treeline.
  const v = Game.state.village || {};
  const hx = (v.px !== undefined && v.px !== null) ? v.px : 4, hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
  const m = { id: 'cancellation', key: 'scenario-apex-1', lingering: true, hp: 5000, tx: hx, ty: hy, mx: hx, my: hy };
  Game.worldMonsters().push(m);
  // The scholar must NOT be on the haven tile: the harness auto-resolves
  // contact encounters (startCombat + driveFights), which would delete the
  // episode on contact. The gorge loop doesn't care where the scholar is.
  try { Game.travelTo(hx + 1 > 8 ? hx - 1 : hx + 1, hy); } catch (e) {}
  const track = installPredation(Game);
  track.helpArrivals = [];
  const origArr = Game.aidHelpArrived.bind(Game);
  Game.aidHelpArrived = function (h) {
    try { track.helpArrivals.push({ day: gday(this), villageId: h && h.villageId, partySize: h && h.partySize, leader: h && h.leader }); } catch (e) {}
    return origArr(h);
  };
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) { try { said.push({ day: gday(this), text: String(msg || '').slice(0, 300) }); } catch (e) {} return origSay(msg); };
  let savedCtx = null;
  const armedDaily = gorgcall.leadfeastGorgcall.daily;
  const wrapped = Object.assign({}, gorgcall.leadfeastGorgcall, {
    id: 'leadfeast+gorgcall-scenario',
    daily(G, ctx) { savedCtx = ctx; try { track.sampleDay(); } catch (e) {} return armedDaily.call(this, G, ctx); },
  });
  await quietLog(() => runDays(Game, wrapped, { days: 14 }));
  Game.say = origSay; Game.aidHelpArrived = origArr;
  const fin = finalizePredation(Game, track);
  const pan1 = pantryKcal(Game);
  const ep = (fin.episodes || []).find(e => e.key === 'scenario-apex-1') || null;
  const beats = said.filter(s => /beacon|carry a call|sends a runner|walks in with|gorges at the treeline|Refused|said no|stands alone|no fire is linked/i.test(s.text));
  const out = {
    seed: 42, pantryBefore: Math.round(pan0), pantryAfter: Math.round(pan1),
    pantryDelta: Math.round(pan0 - pan1),
    episode: ep ? { firstDay: ep.firstDay, lastDay: ep.lastDay, gorgeNights: ep.gorgeNights,
      gorgeKcal: Math.round(ep.gorgeKcal || 0), resolution: ep.resolution, killer: ep.killer } : null,
    gorgeNights: fin.gorgeNights.length, totalGorged: Math.round(fin.totalGorged || 0),
    helpCalls: fin.helpCalls,
    helpArrivals: track.helpArrivals,
    policyCtx: savedCtx ? { daysSaw: savedCtx.gorgeCallDaysSaw || 0, calls: (savedCtx.gorgeCalls || []).length,
      tiers: (savedCtx.gorgeCalls || []).map(c => c.tier + ':' + c.result),
      crisisRaised: savedCtx.gorgeCrisisRaised || 0, crisisResolved: savedCtx.gorgeCrisisResolved || 0 } : null,
    beats,
    instrErrors: fin.instrErrors,
  };
  require('fs').writeFileSync('evidence/2026-10-14/gorgcall-scenario.json', JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})().catch(e => { console.error('HARNESS ERROR:', e && e.stack || e); process.exit(2); });
