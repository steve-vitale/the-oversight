#!/usr/bin/env node
// test-synergy-stall.js — why do synergy attempts stall at 1-2?
// Replays seed 20261011 (god policy) to its end day and dumps:
//   - synergyAttempts keys + counts
//   - which synergies have both legs held but zero attempts
//   - abilityUseLog tail
//   - offer/grant telemetry
'use strict';
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
      if (used >= 2) break;
      const key = a.abilityId + '.' + a.actionId;
      if (NOPE_ACTIONS.has(key)) continue;
      if (!a.available) continue;
      const c = a.context || 'explore';
      if (c !== 'explore' && c !== 'camp') continue;
      try { const r = Game.useAbility(a.abilityId, a.actionId); if (r !== false) { used++; } } catch (e) {}
    }
  } catch (e) {}
}
function godPolicy() {
  const base = Object.assign({}, competent);
  const origDaily = base.daily, origFight = base.fight;
  base.id = 'god'; base.daily = (G, ctx) => { godUseAbilities(G, ctx); if (origDaily) return origDaily(G, ctx); };
  base.fight = (G, ctx) => origFight(G, ctx);
  return base;
}

(async () => {
  const { Game } = await loadGame({ seed: 20261011, mode: 'god' });
  await setupGame(Game);
  const policy = godPolicy();
  await runDays(Game, policy, { days: 94, sampleEvery: 1000 });
  const s = Game.state.scholar;
  console.log('=== abilities held ===');
  for (const a of (s.abilities || [])) console.log(' ', a.id, 'L' + (a.level || 1));
  console.log('=== synergyAttempts ===');
  console.log(JSON.stringify(s.synergyAttempts || {}, null, 1));
  console.log('=== synergies discovered ===', JSON.stringify(s.synergies || []));
  console.log('=== abilityUseLog tail (last 15) ===');
  for (const u of (s.abilityUseLog || []).slice(-15)) console.log(' ', u.id, 'day' + u.day, 'part' + u.part, u.target ? 'tgt=' + u.target : '');
  console.log('=== held-leg synergies with zero attempts ===');
  const syns = Game.data.synergies || [];
  const synIds = new Set(syns.map(x => x.id));
  const held = new Set((s.abilities || []).map(a => a.id));
  const hasReq = (rid) => {
    if (synIds.has(rid)) return (s.synergies || []).includes(rid);
    if (rid.startsWith('tech:')) return !!(((Game.state.codex || {}).techniques || {})[rid.slice(5)]);
    if (rid.startsWith('skill:')) return ((((Game.state.codex || {}).skills || {})[rid.slice(6)] || {}).level || 0) >= 1;
    return held.has(rid);
  };
  for (const syn of syns) {
    const reqs = syn.requires_any ? [...new Set(syn.requires_any.flat())] : (syn.requires || []);
    const bare = reqs.map(r => r.replace(/^(tech|skill):/, ''));
    if (reqs.every(hasReq)) {
      const att = (s.synergyAttempts || {})[syn.id] || 0;
      console.log(`  ${syn.id} attempts=${att} type=${(syn.discovery_method || {}).type} legs=[${reqs.join(',')}]`);
    }
  }
  console.log('=== ability_granted telemetry ===');
  let n = 0;
  for (const ev of (Game.state.telemetry || [])) {
    if (ev.type === 'ability_granted') { n++; if (n <= 15) console.log(' ', ev.day, ev.id, ev.who); }
  }
  console.log('total ability_granted events:', n);
})();
