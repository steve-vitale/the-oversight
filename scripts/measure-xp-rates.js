#!/usr/bin/env node
// measure-xp-rates.js — measure real ability XP accrual per day under the
// god policy (competent + uses kit). Used to retune L1->L2 / L2->L3
// thresholds so mastery is achievable in a 100-130 day run.
// Usage: SEEDS="1,2,3,4,5,6" DAYS=130 node scripts/measure-xp-rates.js
'use strict';
const { loadGame, setupGame, runDays, manifest } = require('./sim-harness');
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
      try { const r = Game.useAbility(a.abilityId, a.actionId); if (r !== false) used++; } catch (e) {}
    }
  } catch (e) {}
}
function godPolicy() {
  const base = Object.assign({}, competent);
  const origDaily = base.daily;
  base.id = 'god'; base.desc = 'god';
  base.daily = (G, ctx) => { godUseAbilities(G, ctx); if (origDaily) return origDaily(G, ctx); };
  return base;
}

async function main() {
  const seeds = (process.env.SEEDS || '1,2,3,4,5,6').split(',').map(Number);
  const DAYS = parseInt(process.env.DAYS || '130', 10);
  const xpTotals = {};
  const daysAlive = {};
  const l3reached = {};
  const l2reached = {};
  for (const seed of seeds) {
    const { Game, manifest: man } = await loadGame({ seed, mode: 'god', fullTelemetry: false });
    await setupGame(Game);
    const policy = godPolicy();
    // Track xp events per ability by wrapping gainAbilityXP.
    const perAb = {};
    const origGain = Game.gainAbilityXP.bind(Game);
    Game.gainAbilityXP = function (id, amt) {
      perAb[id] = perAb[id] || { xp: 0, events: 0 };
      perAb[id].xp += (amt || 1); perAb[id].events++;
      return origGain(id, amt);
    };
    const result = await runDays(Game, policy, { days: DAYS, manifest: man, sampleEvery: 10 });
    const s = Game.state.scholar;
    const lived = Math.min(DAYS, result.days || DAYS);
    const held = (s.abilities || []).concat(s.backgroundAbilities || []);
    for (const id of Object.keys(perAb)) {
      xpTotals[id] = (xpTotals[id] || 0) + perAb[id].xp;
      daysAlive[id] = (daysAlive[id] || 0) + lived;
      const ab = held.find(a => (a.id || a) === id);
      if (ab && (ab.level || 1) >= 3) l3reached[id] = (l3reached[id] || 0) + 1;
      else if (ab && (ab.level || 1) >= 2) l2reached[id] = (l2reached[id] || 0) + 1;
    }
    const heldStr = held.map(a => `${a.id}:L${a.level || 1}(${a.xp || 0}xp)`).join(' | ') || 'none';
    console.log(`seed ${seed}: lived ${lived}d, held: ${heldStr}`);
  }
  console.log('\n=== XP per ability (summed over seeds) ===');
  const rows = Object.keys(xpTotals).map(id => ({
    id, xp: xpTotals[id],
    perDay: (xpTotals[id] / (daysAlive[id] || 1)).toFixed(3),
    l2: l2reached[id] || 0, l3: l3reached[id] || 0,
  })).sort((a, b) => b.xp - a.xp);
  for (const r of rows) console.log(`${r.id}: totalXp=${r.xp} xp/day=${r.perDay} L2seeds=${r.l2}/${seeds.length} L3seeds=${r.l3}/${seeds.length}`);
}
main().catch(e => { console.error(e); process.exit(1); });
