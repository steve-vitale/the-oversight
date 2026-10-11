#!/usr/bin/env node
// sweep-abilities.js — long-run sim lever 9: ABILITIES & GODHOOD (2026-10-11).
// Measures, per run (200-day horizon, competent policy + god variant):
//   - player: abilities held (ids/levels), slots filled, integration,
//     slot moments, synergies discovered, synergy attempts, ability-use
//     volume, surgeResonance, feastSurgeUsed
//   - villagers: npcAbilities counts, track XP levels
//   - standard: win, arc, wave, survival, death causes
//
// Policies:
//   competent  — the existing policy (takes offers, never activates)
//   god        — competent + godhood hook: USES held abilities like an
//                experienced player (track/read_sign/stalk before forage,
//                field-dress at camp, read_stance/rage/brace in combat).
//                This is harness tooling (tooling freedom, Steve 2026-10-11),
//                not a game change: a real competent player uses their kit.
//
// Usage:
//   SEEDS="1,2,3" POLICIES="god" DAYS=200 OUT=/tmp/x.json \
//     node scripts/sweep-abilities.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const idle = require('./policies/idle');
const { competent } = require('./policies/competent');

// Abilities an honest experienced player would NOT press on purpose.
const NOPE_ACTIONS = new Set([
  'thief.steal_pantry',        // stealing from your own pantry
  'grave_robber.rob_grave',    // robbing graves
  'molt.shed_skin',            // 100 kcal vanity shed
  'fear_aura.loom', 'fear_aura.menace', // terrorizing own village-adjacent
  'intimidating_presence.stare_down', 'intimidating_presence.end_it_before',
]);

// godUseAbilities(Game, ctx): fire available explore/camp/social ability actions
// the way a competent player would — before the forage trip (tracking,
// reading sign), after kills at camp (dressing game), mediating when there's
// a dispute to mediate. Up to 3/day: a real player presses their kit.
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

// Wrap the competent policy with the godhood hook.
function godPolicy() {
  const base = Object.assign({}, competent);
  const origDaily = base.daily;
  const origFight = base.fight;
  base.id = 'god';
  base.desc = 'competent + uses held abilities (track/read/dress/rage/brace)';
  base.daily = (G, ctx) => {
    godUseAbilities(G, ctx);
    if (origDaily) return origDaily(G, ctx);
  };
  base.fight = (G, ctx) => {
    // First player turn of a fight: read the fight if we can.
    try {
      const f = G.tbfight;
      if (f && !f.over && G.tbIsPlayerTurn() && ctx._godFight !== f) {
        ctx._godFight = f;
        const list = G.activatableAbilities ? G.activatableAbilities() : [];
        for (const a of list) {
          if (a.context !== 'combat' || !a.available) continue;
          const key = a.abilityId + '.' + a.actionId;
          if (NOPE_ACTIONS.has(key)) continue;
          // read_stance / read_fight first (information), rage only when healthy
          const p = G.tbFighter('p');
          const hpPct = (p.hp || 0) / Math.max(1, p.maxHp || 1);
          if (/read|stalk|aim/i.test(key) || (/rage|war_cry|haymaker/i.test(key) && hpPct > 0.7) ||
              (/brace|refuse|shake_off/i.test(key) && hpPct < 0.5)) {
            try {
              const tgt = f.fighters.find(x => x.kind === 'monster' && (x.hp || 0) > 0);
              const r = G.useAbility(a.abilityId, a.actionId, tgt ? tgt.key : undefined);
              if (r !== false) {
                ctx.godUsedCombat = (ctx.godUsedCombat || 0) + 1;
                // end turn after the combat action
                try { const q = G.tbFighter('p'); q.moveLeft = 0; q.acted = true; G.tbAfterPlayerAction(); } catch (e) {}
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

const POLICIES = { zero: idle.zero, mvc: idle.mvc, leader: idle.leader, competent, god: null };

function parseList(env, def) {
  return (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);
}

function abilitySnapshot(Game) {
  const out = {
    abilities: [], synergies: [], attempts: 0, attemptsDist: {},
    useVol: 0, useDistinct: 0,
    slots: 0, integ: 0, maxInteg: 0, slotMoments: [],
    resonance: 0, feastSurge: false, teases: 0,
    villAbilities: 0, villWithAb: 0, villTracks: { combat: 0, field: 0, social: 0, craft: 0 },
  };
  try {
    const s = Game.state.scholar || {};
    out.abilities = (s.abilities || []).map(a => a.id + ':L' + (a.level || 1));
    out.synergies = (s.synergies || []).slice();
    const att = s.synergyAttempts || {};
    out.attempts = Object.keys(att).filter(k => !k.endsWith('_days') && !k.endsWith('_lastday')).length;
    for (const [k, v] of Object.entries(att)) {
      if (/_days|_lastday/.test(k)) continue;
      out.attemptsDist[v] = (out.attemptsDist[v] || 0) + 1;
      if (v >= 1 && v < 3) out.teases++; // attempt 1-2 = tease seen
    }
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
    const nx = v.npcXp || {};
    for (const x of Object.values(nx)) {
      for (const t of ['combat', 'field', 'social', 'craft']) {
        const xp = (x || {})[t] || 0;
        let lvl = 0;
        for (const th of [3, 8, 16, 32, 64]) if (xp >= th) lvl++;
        if (lvl > 0) out.villTracks[t]++;
      }
    }
  } catch (e) {}
  return out;
}

(async () => {
  const seeds = parseList('SEEDS', '20261011,7,42,99,1337,4242').map(Number);
  const policyIds = parseList('POLICIES', 'god');
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;

  const runs = [];
  for (const pid of policyIds) {
    const base = pid === 'god' ? godPolicy() : POLICIES[pid];
    if (!base) { console.error(`unknown policy: ${pid}`); process.exit(1); }
    for (const seed of seeds) {
      const { Game, manifest, loadFails } = await loadGame({ seed, mode: pid, fullTelemetry: false });
      if (loadFails && loadFails.length) console.error('load fails:', loadFails.join('; '));
      await setupGame(Game);
      const policy = Object.assign({}, base);
      let maxInteg = 0;
      const origDaily = base.daily;
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
      const deathCauses = {};
      try {
        for (const d of (result.samples.deaths || [])) {
          const c = d.cause || d.kind || '?';
          deathCauses[c] = (deathCauses[c] || 0) + 1;
        }
      } catch (e) {}
      const rec = {
        policy: pid, seed,
        days: result.days, endReason: result.endReason,
        arc, wave, won, table,
        deathCauses,
        godUsed: (policy.daily && undefined) || 0,
        ms: result.ms,
        ab,
      };
      // recover god-use counters from ctx — runDays doesn't return ctx; count from telemetry instead
      try {
        let g = 0;
        for (const ev of (result.telemetry || [])) {
          if (ev.type === 'ability_granted') g++;
        }
        rec.abilityGrantedEvents = g;
      } catch (e) {}
      runs.push(rec);
      console.log(`done: ${pid} seed=${seed} days=${result.days} end=${result.endReason} arc=${arc} wave=${wave} ` +
        `ab=[${ab.abilities.join(',')}] slots=${ab.slots} integ=${ab.integ}(max${maxInteg}) ` +
        `syn=${ab.synergies.length} att=${ab.attempts} use=${ab.useVol}/${ab.useDistinct} res=${ab.resonance} feast=${ab.feastSurge} ` +
        `villAb=${ab.villAbilities}(${ab.villWithAb}v) (${result.ms}ms)`);
    }
  }

  // ---- aggregate ----
  const agg = {};
  for (const pid of policyIds) {
    const pr = runs.filter(r => r.policy === pid);
    if (!pr.length) continue;
    const ds = pr.map(r => r.days).sort((a, b) => a - b);
    const sum = (f) => pr.reduce((a, r) => a + f(r), 0);
    const deaths = {};
    for (const r of pr) for (const [k, v] of Object.entries(r.deathCauses || {})) deaths[k] = (deaths[k] || 0) + v;
    // slots-filled distribution at end
    const slotDist = {};
    for (const r of pr) {
      const k = r.ab.abilities.length + '/' + r.ab.slots;
      slotDist[k] = (slotDist[k] || 0) + 1;
    }
    agg[pid] = {
      n: pr.length,
      medianDays: ds[Math.floor(ds.length / 2)], maxDays: ds[ds.length - 1],
      survived: pr.filter(r => r.endReason === 'survived').length,
      won: pr.filter(r => r.won).length, table: pr.filter(r => r.table).length,
      arcDist: pr.reduce((m, r) => { m[r.arc] = (m[r.arc] || 0) + 1; return m; }, {}),
      waveDist: pr.reduce((m, r) => { m[r.wave] = (m[r.wave] || 0) + 1; return m; }, {}),
      deathCauses: deaths,
      // lever metrics
      meanAbilities: +(sum(r => r.ab.abilities.length) / pr.length).toFixed(2),
      maxAbilities: Math.max.apply(null, pr.map(r => r.ab.abilities.length)),
      slotFillDist: slotDist,
      meanSlots: +(sum(r => r.ab.slots) / pr.length).toFixed(2),
      meanInteg: +(sum(r => r.ab.integ) / pr.length).toFixed(1),
      maxInteg: Math.max.apply(null, pr.map(r => r.ab.maxInteg)),
      slotMomentsEver: [...new Set(pr.flatMap(r => r.ab.slotMoments))].sort((a, b) => a - b),
      synergiesDiscovered: sum(r => r.ab.synergies.length),
      runsWithSynergy: pr.filter(r => r.ab.synergies.length > 0).length,
      meanAttempts: +(sum(r => r.ab.attempts) / pr.length).toFixed(2),
      meanUseVol: +(sum(r => r.ab.useVol) / pr.length).toFixed(1),
      meanUseDistinct: +(sum(r => r.ab.useDistinct) / pr.length).toFixed(1),
      meanResonance: +(sum(r => r.ab.resonance) / pr.length).toFixed(1),
      maxResonance: Math.max.apply(null, pr.map(r => r.ab.resonance)),
      feastSurgeRuns: pr.filter(r => r.ab.feastSurge).length,
      resonance35Runs: pr.filter(r => r.ab.resonance >= 35).length,
      villAbilities: sum(r => r.ab.villAbilities),
      villWithAb: sum(r => r.ab.villWithAb),
      villTracks: pr.reduce((m, r) => { for (const [k, v] of Object.entries(r.ab.villTracks)) m[k] = (m[k] || 0) + v; return m; }, {}),
    };
  }
  console.log('\n=== AGGREGATE ===');
  console.log(JSON.stringify(agg, null, 2));
  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify({ meta: { days, date: new Date().toISOString().slice(0, 10) }, agg, runs }, null, 1));
    console.log('wrote ' + outFile);
  }
})();
