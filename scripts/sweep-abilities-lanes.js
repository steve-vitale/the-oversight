#!/usr/bin/env node
// sweep-abilities-lanes.js — lever 9 r2 measurement: before/after of the
// contest prize lanes on identical seeds (god policy, 200-day horizon).
// Telemetry: counts _cxPrizeLane fires by lane (ability/synergy/knowledge),
// contest wins (player + villager), and reuses sweep-abilities' snapshot
// for the acquisition numbers (abilities held, slot fill, synergies,
// resonance, villager grants).
//
// Usage:
//   SEEDS="20261011,7,42,99,1337,4242" POLICIES="god" DAYS=200 OUT=/tmp/x.json \
//     node scripts/sweep-abilities-lanes.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const NOPE_ACTIONS = new Set([
  'thief.steal_pantry', 'grave_robber.rob_grave', 'molt.shed_skin',
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

(async () => {
  const seeds = parseList('SEEDS', '20261011,7,42,99,1337,4242').map(Number);
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;
  const runs = [];
  for (const seed of seeds) {
    const { Game, manifest, loadFails } = await loadGame({ seed, mode: 'god', fullTelemetry: true });
    if (loadFails && loadFails.length) console.error('load fails:', loadFails.join(';'));
    await setupGame(Game);
    // lane telemetry: wrap the lane roller and the lane grants.
    // Villager wins are counted at _cxWinnerShare (every villager-win path
    // flows through it: watch verdict + multi-take co-winners).
    const lane = { fires: 0, ability: 0, synergy: 0, knowledge: 0, playerWins: 0, villagerWins: 0 };
    const lanesExist = typeof Game._cxPrizeLane === 'function';
    // win counting is unconditional (works on pristine code too — baseline)
    if (typeof Game._cxWinnerShare === 'function') {
      const origWS = Game._cxWinnerShare;
      Game._cxWinnerShare = function (p) { lane.villagerWins++; return origWS.call(this, p); };
    }
    // player wins: _contestEnd 'won' with the player as participant
    // (stacks on metaProgression's wrapHook — the wrapper calls through).
    if (typeof Game._contestEnd === 'function') {
      const origEnd = Game._contestEnd;
      Game._contestEnd = function (ac, outcome, prize) {
        const r = origEnd.call(this, ac, outcome, prize);
        if (outcome === 'won' && !(ac && ac.participant && ac.participant !== 'player')) lane.playerWins++;
        return r;
      };
    }
    if (lanesExist) {
      const origLane = Game._cxPrizeLane;
      const origA = Game._cxPrizeAbilityOffer, origS = Game._cxPrizeSynergyHint, origK = Game._cxPrizeKnowledgeDump;
      Game._cxPrizeAbilityOffer = function (c) { const r = origA.call(this, c); if (r) lane.ability++; return r; };
      Game._cxPrizeSynergyHint = function () { const r = origS.call(this); if (r) lane.synergy++; return r; };
      Game._cxPrizeKnowledgeDump = function () { const r = origK.call(this); if (r) lane.knowledge++; return r; };
      Game._cxPrizeLane = function (ac, c) { const r = origLane.call(this, ac, c); if (r) lane.fires++; return r; };
    }
    const policy = godPolicy();
    const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
    const s = Game.state.scholar || {};
    const v = Game.state.village || {};
    let villAbilities = 0;
    for (const list of Object.values(v.npcAbilities || {})) if (list && list.length) villAbilities += list.length;
    const att = s.synergyAttempts || {};
    let attempts = 0;
    for (const k of Object.keys(att)) { if (!/_days|_lastday/.test(k) && att[k] > 0) attempts++; }
    runs.push({
      seed, days: result.days, endReason: result.endReason,
      lanes: lane,
      abilities: (s.abilities || []).map(a => a.id + ':L' + (a.level || 1)),
      abilityCount: (s.abilities || []).length,
      slots: Game.abilitySlots ? Game.abilitySlots() : 0,
      synergies: (s.synergies || []).slice(),
      attempts,
      resonance: ((s.prog || {}).surgeResonance) || 0,
      codexPlants: Object.keys((Game.state.codex || {}).plants || {}).length,
      villAbilities,
      integ: Math.round(s.integration || 0),
    });
    console.log(`done: seed=${seed} days=${result.days} end=${result.endReason} ` +
      `ab=${(s.abilities || []).length} slots=${Game.abilitySlots ? Game.abilitySlots() : 0} ` +
      `syn=[${(s.synergies || []).join(',')}] lanes=${lanesExist ? JSON.stringify(lane) : 'n/a'}`);
  }
  // aggregate
  const agg = { n: runs.length, meanAbilities: 0, meanSlots: 0, runsWithSynergy: 0, meanAttempts: 0,
    meanResonance: 0, meanCodexPlants: 0, meanVillAbilities: 0, totalLaneFires: 0, laneMix: { ability: 0, synergy: 0, knowledge: 0 },
    totalPlayerWins: 0, totalVillagerWins: 0, medianDays: 0 };
  for (const r of runs) {
    agg.meanAbilities += r.abilityCount; agg.meanSlots += r.slots;
    if (r.synergies.length) agg.runsWithSynergy++;
    agg.meanAttempts += r.attempts; agg.meanResonance += r.resonance;
    agg.meanCodexPlants += r.codexPlants; agg.meanVillAbilities += r.villAbilities;
    agg.totalLaneFires += r.lanes.fires;
    agg.laneMix.ability += r.lanes.ability; agg.laneMix.synergy += r.lanes.synergy; agg.laneMix.knowledge += r.lanes.knowledge;
    agg.totalPlayerWins += r.lanes.playerWins; agg.totalVillagerWins += r.lanes.villagerWins;
  }
  for (const k of ['meanAbilities', 'meanSlots', 'meanAttempts', 'meanResonance', 'meanCodexPlants', 'meanVillAbilities'])
    agg[k] = +(agg[k] / runs.length).toFixed(2);
  const ds = runs.map(r => r.days).sort((a, b) => a - b);
  agg.medianDays = ds[Math.floor(ds.length / 2)];
  const out = { meta: { days, date: '2026-10-11', lanes: 'prize_lanes' }, agg, runs };
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify(out, null, 2)); console.log('wrote', outFile); }
  else console.log(JSON.stringify(agg, null, 2));
})();
