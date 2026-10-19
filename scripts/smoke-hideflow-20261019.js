#!/usr/bin/env node
// smoke-hideflow-20261019.js — where do hides GO? control-substrate tracer.
'use strict';
const WS = require('./probe-windowsurvive-20261019');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

async function runOne(seed, policyId, days) {
  const base = WS.policyFor(policyId);
  const policy = Object.assign({}, base);
  const C = { hides: [], sources: { butcher: 0, loot: 0 }, sayLines: [] };
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    // wrap carcassToMeat: count hide material pushes
    try {
      const orig = G.carcassToMeat.bind(G);
      G.carcassToMeat = function (inv, i, knows) {
        const r2 = orig(inv, i, knows);
        try {
          for (const it of (inv || [])) {
            if (it && it.material === 'hide' && it._flowCounted !== true) {
              // count only fresh ones: units may merge; use a flag round
            }
          }
        } catch (e) {}
        return r2;
      };
    } catch (e) {}
    try {
      const origSay = G.say.bind(G);
      G.say = function (msg) {
        try {
          if (typeof msg === 'string' && /hide|Hide/.test(msg)) C.sayLines.push({ day: (G.state.scholar || {}).day, msg });
        } catch (e) {}
        return origSay.apply(this, arguments);
      };
    } catch (e) {}
    return r;
  };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    const r = oDaily ? oDaily(G, ctx) : undefined;
    try {
      const inv = (G.state.scholar || {}).inventory || [];
      const hidectl = (arr) => { let t = 0; for (const it of (arr || [])) if (it && it.material === 'hide') t += it.units || 0; return t; };
      const packH = hidectl(inv);
      let prepH = 0; try { prepH = hidectl((G.state.scholar || {}).prepStash); } catch (e) {}
      let stashH = 0;
      try { const st = G.stashState && G.stashState(); stashH = (st && st.materials && st.materials.hide) || 0; } catch (e) {}
      let pantryH = 0; try { pantryH = hidectl((G.state.village || {}).pantry); } catch (e) {}
      let cacheH = 0; try { cacheH = hidectl((G.state.scholar || {}).caches ? [].concat(...Object.values(G.state.scholar.caches).map(c => c.items || [])) : []); } catch (e) {}
      let carcassN = 0;
      for (const it of inv) if (it && it.foodState === 'carcass') carcassN++;
      C.hides.push({ day: (G.state.scholar || {}).day, packH, prepH, stashH, pantryH, cacheH, carcassN, cleaned: ctx.cleanedCarcasses || 0 });
    } catch (e) {}
    return r;
  };
  const { Game } = await loadGame({ seed, mode: 'hideflow', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  console.log(`seed=${seed} days=${result.gameDays} end=${Game.over ? 'over' : 'alive'}`);
  const maxPack = Math.max(...C.hides.map(h => h.packH));
  const totStash = C.hides[C.hides.length - 1].stashH;
  const e2 = C.hides[C.hides.length-1];
  console.log(`  maxPackHides=${maxPack} maxPrep=${Math.max(...C.hides.map(h=>h.prepH))} maxPantry=${Math.max(...C.hides.map(h=>h.pantryH))} maxCache=${Math.max(...C.hides.map(h=>h.cacheH))} endStashHides=${totStash} cleanedCarcasses=${e2.cleaned}`);
  const hideDays = C.hides.filter(h => h.packH > 0).length;
  console.log(`  daysWithPackHide=${hideDays}/${C.hides.length}`);
  const lastN2 = C.hides.slice(-8).map(h => `d${h.day}:p${h.packH}/pr${h.prepH}/pa${h.pantryH}/ca${h.cacheH}/c${h.carcassN}`).join(' ');
  console.log(`  tail: ${lastN2}`);
  const hideSay = C.sayLines.slice(-12);
  for (const s of hideSay) console.log(`  [d${s.day}] ${String(s.msg).slice(0, 130)}`);
  return C;
}

(async () => {
  await runOne(63801, 'leadfeast', 90);
  await runOne(63802, 'leadfeast', 90);
})();