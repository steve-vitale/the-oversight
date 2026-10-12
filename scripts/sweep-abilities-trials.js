#!/usr/bin/env node
// sweep-abilities-trials.js — lever 9 r3 measurement: audience-trial cadence
// before/after on identical seeds (god policy, 200-day horizon).
// Trial telemetry: wraps offerAudienceTrial (counts offers by reason) and
// completeTrial (counts completions + whether the ability gift fired), plus
// the same ability snapshot as sweep-abilities.js (abilities held, slots,
// synergies, attempts, resonance, villager grants).
//
// Usage:
//   SEEDS="20261011,7,42,99,1337,4242" DAYS=200 OUT=/tmp/trials-base.json \
//     node scripts/sweep-abilities-trials.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

// god policy: verbatim copy of the r1 harness (scripts/sweep-abilities.js) —
// competent + uses held abilities like an experienced player.
const NOPE_ACTIONS = new Set([
  'thief.steal_pantry',
  'grave_robber.rob_grave',
  'molt.shed_skin',
  'fear_aura.loom', 'fear_aura.menace',
  'intimidating_presence.stare_down', 'intimidating_presence.end_it_before',
]);

function godUseAbilities(Game, ctx) {
  try {
    const s = Game.state.scholar;
    const day = s.day || 0;
    if ((ctx._godDay || 0) === day) return;
    ctx._godDay = day;
    let list = [];
    try { list = Game.activatableAbilities ? Game.activatableAbilities() : []; } catch (e) { return; }
    let used = 0;
    for (const a of list) {
      if (used >= 3) break;
      const key = a.abilityId + '.' + a.actionId;
      if (NOPE_ACTIONS.has(key)) continue;
      if (!a.available) continue;
      const c = a.context || 'explore';
      if (c !== 'explore' && c !== 'camp' && c !== 'social') continue;
      try {
        const r = Game.useAbility(a.abilityId, a.actionId);
        if (r !== false) { used++; ctx.godUsed = (ctx.godUsed || 0) + 1; }
      } catch (e) {}
    }
  } catch (e) {}
}

function godPolicy() {
  const base = Object.assign({}, competent);
  const origDaily = base.daily;
  const origFight = base.fight;
  base.id = 'god';
  base.daily = (G, ctx) => {
    godUseAbilities(G, ctx);
    if (origDaily) return origDaily(G, ctx);
  };
  base.fight = (G, ctx) => {
    try {
      const f = G.tbfight;
      if (f && !f.over && G.tbIsPlayerTurn() && ctx._godFight !== f) {
        ctx._godFight = f;
        const list = G.activatableAbilities ? G.activatableAbilities() : [];
        for (const a of list) {
          if (a.context !== 'combat' || !a.available) continue;
          const key = a.abilityId + '.' + a.actionId;
          if (NOPE_ACTIONS.has(key)) continue;
          const p = G.tbFighter('p');
          const hpPct = (p.hp || 0) / Math.max(1, p.maxHp || 1);
          if (/read|stalk|aim/i.test(key) || (/rage|war_cry|haymaker/i.test(key) && hpPct > 0.7) ||
              (/brace|refuse|shake_off/i.test(key) && hpPct < 0.5)) {
            try {
              const tgt = f.fighters.find(x => x.kind === 'monster' && (x.hp || 0) > 0);
              const r = G.useAbility(a.abilityId, a.actionId, tgt ? tgt.key : undefined);
              if (r !== false) {
                const q = G.tbFighter('p'); q.moveLeft = 0; q.acted = true; G.tbAfterPlayerAction();
                return true;
              }
            } catch (e) {}
            break;
          }
        }
      }
    } catch (e) {}
    return origFight(G, ctx);
  };
  return base;
}

function parseList(env, def) {
  return (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);
}

function abilitySnapshot(Game) {
  const out = {
    abilities: [], synergies: [], attempts: 0, useVol: 0, useDistinct: 0,
    slots: 0, integ: 0, maxInteg: 0, slotMoments: [],
    resonance: 0, feastSurge: false,
    villAbilities: 0, villWithAb: 0,
  };
  try {
    const s = Game.state.scholar || {};
    out.abilities = (s.abilities || []).map(a => a.id + ':L' + (a.level || 1));
    out.synergies = (s.synergies || []).slice();
    const att = s.synergyAttempts || {};
    out.attempts = Object.keys(att).filter(k => !k.endsWith('_days') && !k.endsWith('_lastday')).length;
    const log = s.abilityUseLog || [];
    out.useVol = log.length;
    out.useDistinct = new Set(log.map(u => u.id)).size;
    out.slots = Game.abilitySlots ? Game.abilitySlots() : 0;
    out.integ = Math.round(s.integration || 0);
    out.resonance = ((s.prog || {}).surgeResonance) || 0;
    out.feastSurge = !!((s.prog || {}).feastSurgeUsed);
    const pg = Game.progState ? Game.progState() : {};
    out.slotMoments = Object.keys(pg.slotMoments || {}).map(Number).sort((a, b) => a - b);
  } catch (e) {}
  try {
    const v = Game.state.village || {};
    const na = v.npcAbilities || {};
    for (const [vid, list] of Object.entries(na)) {
      if (list && list.length) { out.villAbilities += list.length; out.villWithAb++; }
    }
  } catch (e) {}
  return out;
}

(async () => {
  const seeds = parseList('SEEDS', '20261011,7,42,99,1337,4242').map(Number);
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;
  const runs = [];
  for (const seed of seeds) {
    const { Game, manifest, loadFails } = await loadGame({ seed, mode: 'god', fullTelemetry: false });
    if (loadFails && loadFails.length) console.error('load fails:', loadFails.join(';'));
    await setupGame(Game);
    // trial telemetry: wrap offer + complete paths (works on pristine code).
    const tr = { offers: 0, offerReasons: {}, completes: 0, gifts: 0, giftNames: [], expired: 0 };
    if (typeof Game.offerAudienceTrial === 'function') {
      const orig = Game.offerAudienceTrial;
      Game.offerAudienceTrial = function (reason) {
        tr.offers++;
        tr.offerReasons[reason || '?'] = (tr.offerReasons[reason || '?'] || 0) + 1;
        return orig.call(this, reason);
      };
    }
    if (typeof Game.completeTrial === 'function') {
      const orig = Game.completeTrial;
      Game.completeTrial = function () {
        const before = (Game.state.scholar.abilities || []).length;
        const r = orig.call(this);
        tr.completes++;
        const after = (Game.state.scholar.abilities || []).length;
        if (after > before) {
          tr.gifts++;
          const last = Game.state.scholar.abilities[after - 1];
          tr.giftNames.push((last && last.id) || '?');
        }
        return r;
      };
    }
    const policy = godPolicy();
    let maxInteg = 0;
    const origDaily = policy.daily;
    policy.daily = (G, ctx) => {
      try { maxInteg = Math.max(maxInteg, Math.round(((G.state.scholar || {}).integration) || 0)); } catch (e) {}
      if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
    };
    const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
    const ab = abilitySnapshot(Game);
    ab.maxInteg = maxInteg;
    let arc = 1, wave = 1, won = false, table = false;
    try { arc = (Game.progState() || {}).arc || 1; } catch (e) {}
    try { wave = result.maxWaveUnlocked; } catch (e) {}
    try { won = !!Game.won; } catch (e) {}
    try { table = !!((Game.progState() || {}).tableWaiting); } catch (e) {}
    const rec = {
      seed, days: result.days, endReason: result.endReason,
      arc, wave, won, table, ms: result.ms,
      trials: tr, ab,
    };
    runs.push(rec);
    console.log(`done: seed=${seed} days=${result.days} end=${result.endReason} arc=${arc} wave=${wave} ` +
      `trials=${tr.offers}o/${tr.completes}c/${tr.gifts}g ` +
      `ab=[${ab.abilities.join(',')}] slots=${ab.slots} syn=${ab.synergies.length} att=${ab.attempts} ` +
      `res=${ab.resonance} villAb=${ab.villAbilities} (${result.ms}ms)`);
  }

  const sum = (f) => runs.reduce((a, r) => a + f(r), 0);
  const ds = runs.map(r => r.days).sort((a, b) => a - b);
  const reasons = {};
  for (const r of runs) for (const [k, v] of Object.entries(r.trials.offerReasons)) reasons[k] = (reasons[k] || 0) + v;
  const agg = {
    n: runs.length,
    medianDays: ds[Math.floor(ds.length / 2)], maxDays: ds[ds.length - 1],
    won: runs.filter(r => r.won).length, table: runs.filter(r => r.table).length,
    arcDist: runs.reduce((m, r) => { m[r.arc] = (m[r.arc] || 0) + 1; return m; }, {}),
    waveDist: runs.reduce((m, r) => { m[r.wave] = (m[r.wave] || 0) + 1; return m; }, {}),
    // trial pipe
    totalOffers: sum(r => r.trials.offers),
    totalCompletes: sum(r => r.trials.completes),
    totalGifts: sum(r => r.trials.gifts),
    offerReasons: reasons,
    giftNames: [...new Set(runs.flatMap(r => r.trials.giftNames))].sort(),
    meanOffersPerRun: +(sum(r => r.trials.offers) / runs.length).toFixed(2),
    // lever metrics
    meanAbilities: +(sum(r => r.ab.abilities.length) / runs.length).toFixed(2),
    maxAbilities: Math.max.apply(null, runs.map(r => r.ab.abilities.length)),
    meanSlots: +(sum(r => r.ab.slots) / runs.length).toFixed(2),
    maxInteg: Math.max.apply(null, runs.map(r => r.ab.maxInteg)),
    slotMomentsEver: [...new Set(runs.flatMap(r => r.ab.slotMoments))].sort((a, b) => a - b),
    synergiesDiscovered: sum(r => r.ab.synergies.length),
    runsWithSynergy: runs.filter(r => r.ab.synergies.length > 0).length,
    synergyIds: [...new Set(runs.flatMap(r => r.ab.synergies))].sort(),
    meanAttempts: +(sum(r => r.ab.attempts) / runs.length).toFixed(2),
    meanUseVol: +(sum(r => r.ab.useVol) / runs.length).toFixed(1),
    meanResonance: +(sum(r => r.ab.resonance) / runs.length).toFixed(1),
    maxResonance: Math.max.apply(null, runs.map(r => r.ab.resonance)),
    feastSurgeRuns: runs.filter(r => r.ab.feastSurge).length,
    villAbilities: sum(r => r.ab.villAbilities),
    villWithAb: sum(r => r.ab.villWithAb),
  };
  console.log('\n=== AGGREGATE ===');
  console.log(JSON.stringify(agg, null, 2));
  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify({ meta: { days, date: '2026-10-11', lever: 'trial_cadence_r3' }, agg, runs }, null, 1));
    console.log('wrote ' + outFile);
  }
})();
