#!/usr/bin/env node
// scripts/probe-woundward-20261013.js — headroom probe for the wound-ward lever.
// Daily sample: pharmacy doses, healer presence, villagers <50/<70 HP,
// heal-check outcomes. 2 seeds x belongseek, 150d death-aware.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');

function sample(Game) {
  const v = Game.state.village || {};
  let med = 0;
  try {
    const st = Game.stashState ? Game.stashState() : null;
    const pile = (st && st.medicine) || [];
    for (const e of pile) med += (e.doses != null ? e.doses : 1);
  } catch (e) {}
  let healer = null;
  try { healer = Game.campHealerName ? Game.campHealerName() : null; } catch (e) {}
  let below50 = 0, below70 = 0, alive = 0;
  for (const id of (v.roster || [])) {
    let hp = null;
    try { hp = (v.health || {})[id]; } catch (e) {}
    if (hp == null || hp <= 0) continue;
    alive++;
    if (hp < 50) below50++;
    if (hp < 70) below70++;
  }
  return { med, healer: healer ? 1 : 0, below50, below70, alive };
}

async function main() {
  for (const seed of [11, 22]) {
    const { Game } = await loadGame({ seed, mode: 'woundward-probe' });
    await setupGame(Game);
    const base = belongseek;
    const policy = Object.assign({}, base);
    const origDaily = base.daily, origSetup = base.setup;
    const ctx = { policyId: 'belongseek' };
    const samples = [];
    policy.setup = (G) => { if (origSetup) { try { origSetup(G, ctx); } catch (e) {} } };
    policy.daily = (G) => {
      if (((G.state.scholar || {}).day || 0) % 5 === 0) samples.push(Object.assign({ day: (G.state.scholar || {}).day }, sample(G)));
      if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
    };
    // capture heal-check say lines
    const lines = [];
    const origSay = Game.say.bind(Game);
    Game.say = function (msg) {
      try {
        const t = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
        if (/🩹/.test(t) && lines.length < 200) lines.push({ day: (Game.state.scholar || {}).day || 0, t: t.slice(0, 160) });
      } catch (e) {}
      return origSay(msg);
    };
    let result;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 150, sampleEvery: 10 }); });
    console.log(`seed ${seed}: d=${result.days} ${result.endReason}`);
    const avg = (k) => (samples.reduce((t, s) => t + s[k], 0) / Math.max(1, samples.length)).toFixed(1);
    console.log(`  pharmacyDoses avg=${avg('med')} healerPresent=${(samples.filter(s=>s.healer).length)}/${samples.length} below50 avg=${avg('below50')} below70 avg=${avg('below70')} alive avg=${avg('alive')}`);
    console.log(`  heal-check lines: ${lines.length}`);
    lines.slice(0, 8).forEach(l => console.log(`    d${l.day} ${l.t}`));
  }
}
main().catch(e => { console.error(e); process.exit(1); });
