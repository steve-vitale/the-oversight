#!/usr/bin/env node
// bankfood-probe-lump.js — lump-overnight probe (diagnostic, NOT a judged
// sim). The 2026-10-31 bank forages yielded ONLY unknown plants
// (unknownUnits 14/16/18/5; "unknown shoots/berries/nuts"), i.e. the bank
// was an UNKNOWN LUMP (kcalEach 0, edible false, hidden composition),
// not named edible food. This probe asks: does an engine-made lump
// survive the night + one upkeep cycle, and does upkeep touch it?
// Usage: node scripts/bankfood-probe-lump.js [seed]
// No policy runs here; no clock is set (late band reached by waits).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { competent } = require('./policies/competent');

function lumpSnap(Game) {
  const inv = ((Game.state || {}).scholar || {}).inventory || [];
  const lumps = inv.filter((it) => it && it.foodState === 'unknown' && it.lump)
    .map((it) => ({ name: it.name, units: it.units, spoilDay: it.spoilDay,
      comp: it.lump }));
  const edibleKcal = inv.reduce((t, it) => t + ((it.edible === false ? 0 : (it.kcalEach || 0)) * (it.units || 0)), 0);
  return { lumps, edibleKcal, nStacks: inv.length };
}
function snap(Game, stage) {
  const sch = (Game.state || {}).scholar || {};
  const l = lumpSnap(Game);
  return { stage, day: sch.day || 0, dayTicks: sch.dayTicks || 0,
    scholarKcal: Math.round(sch.kcal || 0), over: !!Game.over,
    packEdibleKcal: l.edibleKcal, lumps: l.lumps, nStacks: l.nStacks };
}
async function variant(seed, late) {
  const { Game } = await loadGame({ seed, mode: 'bankfood-probe-lump', fullTelemetry: false });
  const sayLines = [];
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (...args) {
      try { sayLines.push(String(args[0] || '').slice(0, 300)); } catch (e) {}
      return origSay.apply(this, args);
    };
  }
  await setupGame(Game);
  const out = [];
  if (late) {
    let guard = 0;
    while (((Game.state.scholar || {}).dayTicks || 0) < 449 && guard++ < 12 && !Game.over) {
      try { Game.doAction('wait'); } catch (e) { break; }
    }
  }
  // Engine-made lump, exactly as a blind evening forage builds it: pick a
  // real plant the scholar does NOT know (codex has no entry for it).
  const plants = (Game.data || {}).plants || [];
  const codex = ((Game.state || {}).codex || {}).plants || {};
  const unknown = plants.find((p) => !codex[p.id]) || plants[0];
  const day = (Game.state.scholar || {}).day || 0;
  let lumpErr = null;
  try { Game.addUnknownToLump(unknown, 14, day); } catch (e) { lumpErr = String(e && e.message).slice(0, 160); }
  out.push(Object.assign(snap(Game, late ? 'late:pre-sleep' : 'early:pre-sleep'),
    { plantId: unknown.id, plantSpoilageDays: unknown.spoilageDays || 2, lumpErr }));
  let sleepErr = null;
  try { Game.sleep(); } catch (e) { sleepErr = String(e && e.message).slice(0, 160); }
  const startDay = out[0].day;
  out.push(Object.assign(snap(Game, 'post-sleep'), { sleepErr, dayRolled: ((Game.state.scholar || {}).day || 0) !== startDay }));
  if (!out[out.length - 1].dayRolled && !Game.over) {
    let guard = 0;
    while (((Game.state.scholar || {}).day || 0) === startDay && guard++ < 12) {
      try { Game.doAction('wait'); } catch (e) { break; }
      out.push(snap(Game, 'post-wait-' + guard));
      if (Game.over) break;
    }
  }
  if (!Game.over) {
    // Three upkeep cycles, exactly as runDays runs them before daily().
    for (let i = 1; i <= 3; i++) {
      try { competent.upkeep(Game, {}); } catch (e) { out.push({ stage: 'upkeep-' + i + '-error', error: String(e && e.message).slice(0, 160) }); }
      out.push(snap(Game, 'post-upkeep-' + i));
    }
  }
  const spoilLines = sayLines.filter((l) => /went bad|spoiled|flies|threw out/i.test(l));
  return { variant: late ? 'late-lump' : 'early-lump', seed, stages: out, spoilLines: spoilLines.slice(0, 5) };
}

(async () => {
  const seed = parseInt(process.argv[2] || '15215', 10);
  const early = await variant(seed, false);
  console.log(JSON.stringify(early, null, 1));
  const late = await variant(seed, true);
  console.log(JSON.stringify(late, null, 1));
  const verdict = {};
  for (const v of [early, late]) {
    const pre = v.stages.find((s) => /pre-sleep/.test(s.stage));
    const postNight = v.stages.find((s) => (/post-sleep|post-wait/.test(s.stage)) && s.day !== (pre && pre.day));
    verdict[v.variant] = {
      preSleepLumpUnits: pre && pre.lumps.length ? pre.lumps[0].units : 0,
      preSleepLumpSpoilDay: pre && pre.lumps.length ? pre.lumps[0].spoilDay : null,
      firstPostNightLumpUnits: postNight && postNight.lumps.length ? postNight.lumps[0].units : 0,
      lumpSurvivedNight: !!(pre && postNight && postNight.lumps.length && postNight.lumps[0].units === pre.lumps[0].units),
      postUpkeep3LumpUnits: (() => { const s = v.stages.find((x) => x.stage === 'post-upkeep-3'); return s && s.lumps.length ? s.lumps[0].units : 0; })(),
    };
  }
  console.log('BANKFOOD-PROBE-LUMP-VERDICT ' + JSON.stringify(verdict));
})().catch((e) => { console.error('BANKFOOD-PROBE-LUMP CRASH', e && (e.stack || e)); process.exit(2); });
