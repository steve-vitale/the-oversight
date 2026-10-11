#!/usr/bin/env node
// sweep-feastburn-20261011.js — lever 0 follow-up: the feast->damage loop.
//
// A/B on IDENTICAL seeds: competent vs feastseek (devotion-engine policy:
// channels keepsakes, fights with abilities, feasts at dusk when armed).
// Per run records:
//   - survival: days, endReason, wins, death causes
//   - devotion chain: sentimentTaught ever, resonance max, channels, armed
//     ever, feasts hosted, buff grants/refusals, feastSurgeUsed
//   - food->damage: feasted strikes, feasted damage dealt, estimated extra
//     damage from the uplift (dealt - dealt/mult)
//   - waste: spoilage kcal lost, by container + item name (garden vs fish vs
//     forage vs game meat) — the yield-side calibration question
//   - reach: max wave, arc, pantry kcal
// Usage: SEEDS="11,22" DAYS=200 OUT=/tmp/fb.json node scripts/sweep-feastburn-20261011.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { feastseek } = require('./policies/feastseek');

const parseList = (env, def) => (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);

function endState(Game) {
  const out = {
    won: !!Game.won, endReason: Game.over ? (Game.villageLost ? 'village-lost' : 'over-other') : 'survived',
    day: 0, arc: 1, breadth: 0, feastSurgeUsed: false, maxWave: 1, pantryKcal: 0,
  };
  try { out.day = Game.state.scholar.day || 0; } catch (e) {}
  try { out.arc = (Game.progState() || {}).arc || 1; } catch (e) {}
  try { out.breadth = Game.codexBreadth(); } catch (e) {}
  try { out.feastSurgeUsed = !!((Game.state.scholar || {}).prog || {}).feastSurgeUsed; } catch (e) {}
  try { out.maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  try { out.pantryKcal = ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) {}
  return out;
}

async function oneRun(seed, days, policyId) {
  const { Game } = await loadGame({ seed, mode: 'feastburn' });
  await setupGame(Game);
  const m = {
    feasts: 0, grants: 0, refusals: 0, channels: 0, abilityUses: 0,
    armedEver: false, taughtEver: false, resonanceMax: 0,
    feastedStrikes: 0, feastedDealt: 0, feastedExtra: 0,
    spoilLostKcal: 0, spoilLostItems: 0,
    wasteByName: {}, // container -> itemName -> kcal
  };
  const wrap = (name, fn) => {
    const f = Game[name];
    if (typeof f === 'function') Game[name] = function (...a) { try { fn.apply(null, a); } catch (e) {} return f.apply(this, a); };
  };
  wrap('hostFeast', () => { m.feasts++; });
  wrap('grantFeastBuff', () => {});
  {
    // grant/ refusal accounting needs the RETURN value — wrap with capture
    const orig = Game.grantFeastBuff;
    Game.grantFeastBuff = function (...a) {
      let r;
      try { r = orig.apply(this, a); } catch (e) { throw e; }
      try { if (r && r.granted) m.grants++; else m.refusals++; } catch (e) {}
      return r;
    };
  }
  wrap('channelSentiment', () => { m.channels++; });
  wrap('useAbility', (abilityId) => {
    try { if (Game.inCombat && Game.inCombat()) m.abilityUses++; } catch (e) {}
  });
  // feasted extra damage: wrap tbDamage, mirror the hook's own gating
  {
    const orig = Game.tbDamage;
    Game.tbDamage = function (targetKey, dmg, sourceLabel, sourceKey, opts) {
      let wasFeasted = false, fm = 1;
      try {
        wasFeasted = !!(Game.feastedActive && Game.feastedActive());
        fm = wasFeasted && Game.feastedMult ? Game.feastedMult() : 1;
      } catch (e) {}
      const ret = orig.apply(this, arguments);
      try {
        if (wasFeasted && fm > 1 && ret > 0) {
          const ps = sourceKey === 'p' || (sourceLabel === 'you' && sourceKey == null);
          let tk = null;
          try { const tf = Game.tbFighter ? Game.tbFighter(targetKey) : null; tk = tf && tf.kind; } catch (e) {}
          if (ps && (tk === 'monster' || tk === 'hostile')) {
            m.feastedStrikes++;
            m.feastedDealt += ret;
            m.feastedExtra += ret - ret / fm;
          }
        }
      } catch (e) {}
      return ret;
    };
  }
  // waste accounting: snapshot spoiled kcal just before the sweep runs
  {
    const origSweep = Game.sweepSpoiled;
    if (typeof origSweep === 'function') {
      Game.sweepSpoiled = function (...a) {
        try {
          const scan = (cont, label) => {
            for (const it of (cont || [])) {
              if (it && !it.bonded && Game.isSpoiled && Game.isSpoiled(it)) {
                const k = (it.kcalEach || 0) * (it.units || 1);
                m.spoilLostKcal += k; m.spoilLostItems++;
                const nm = String(it.name || it.itemId || it.id || '?');
                m.wasteByName[label] = m.wasteByName[label] || {};
                m.wasteByName[label][nm] = (m.wasteByName[label][nm] || 0) + k;
              }
            }
          };
          scan(Game.state.scholar.inventory, 'pack');
          scan((Game.state.village || {}).pantry, 'pantry');
        } catch (e) {}
        return origSweep.apply(this, a);
      };
    }
  }
  const base = policyId === 'feastseek' ? feastseek : competent;
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const pg = (G.state.scholar || {}).prog || {};
      if (pg.feastSurge || pg.feastSurgeUsed) m.armedEver = true;
      if (pg.sentimentTaught) m.taughtEver = true;
      if ((pg.surgeResonance || 0) > m.resonanceMax) m.resonanceMax = pg.surgeResonance || 0;
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  const deaths = (result.samples.deaths || []).map(d => ({ day: d.day, kind: d.kind, who: d.who, cause: d.cause }));
  return { seed, policy: policyId, days: result.days, gameDays: result.gameDays, endReason: result.endReason, m, end: endState(Game), deaths };
}

(async () => {
  const seeds = parseList('SEEDS', '11,22,33,44,55').map(Number);
  const days = parseInt(process.env.DAYS || '200', 10);
  const policies = parseList('POLICIES', 'competent,feastseek');
  const outFile = process.env.OUT || null;
  const rows = [];
  for (const seed of seeds) {
    for (const pid of policies) {
      const r = await oneRun(seed, days, pid);
      rows.push(r);
      const e = r.end, mm = r.m;
      console.error(`seed ${seed} ${pid}: ${r.endReason} d${e.day} feasts=${mm.feasts} grants=${mm.grants} refus=${mm.refusals} used=${e.feastSurgeUsed} taught=${mm.taughtEver} armed=${mm.armedEver} res=${mm.resonanceMax} ab=${mm.abilityUses} fDmg=${Math.round(mm.feastedDealt)} fXtra=${Math.round(mm.feastedExtra)} spoil=${Math.round(mm.spoilLostKcal / 1000)}k`);
    }
  }
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ when: new Date().toISOString(), days, rows }, null, 1)); console.error('wrote ' + outFile); }
})();
