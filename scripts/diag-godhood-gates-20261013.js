#!/usr/bin/env node
// DIAGNOSTIC: for each godhood, find the closest villager and report
// which gate (kit/core/synergy/item/day) is binding.
'use strict';
const { runComparison } = require('./sweep-compare');

const SEEDS = (process.env.SEEDS || '7,42,99').split(',').map(s => parseInt(s, 10));
const DAYS = parseInt(process.env.DAYS || '150', 10);

function diagnose(Game) {
  const S = globalThis.Scattering || {};
  const G = S.Godhood;
  if (!G) return { error: 'no Godhood' };
  const v = (Game.state || {}).village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  const out = {};
  for (const gh of G.godhoods()) {
    if (gh.id === 'voice_of_the_relay') continue;
    let best = null;
    for (const vid of roster) {
      const cl = G.villagerGodhoodCloseness(Game, vid, gh);
      if (!best || cl.kit > best.kit || (cl.kit === best.kit && cl.synergy && !best.synergy)) best = { ...cl, vid };
    }
    if (best) {
      out[gh.id] = {
        kit: `${best.kit}/${best.needKit}`,
        core: best.coreHit, synergy: best.synergy, item: best.item, dayOk: best.dayOk,
        missing: [
          best.kit < best.needKit ? `kit(${best.kit}/${best.needKit})` : null,
          !best.coreHit ? 'core' : null,
          !best.synergy ? 'synergy' : null,
          !best.item ? 'ITEM' : null,
          !best.dayOk ? 'day' : null,
        ].filter(Boolean).join(',') || 'NONE',
      };
    }
  }
  // also: how many tier-4 items exist in villager hands at all?
  let t4count = 0;
  try {
    const tiers = S.ITEM_TIER || {};
    for (const vid of roster) {
      const p = Game.getPerson ? Game.getPerson(vid) : null;
      for (const it of ((p && p.items) || [])) {
        const id = typeof it === 'string' ? it : (it.itemId || it.id);
        if (tiers[id] === 4) t4count++;
      }
    }
  } catch (e) {}
  out._t4_in_villager_hands = t4count;
  out._day = (Game.state || {}).day;
  return out;
}

(async () => {
  const rep = await runComparison({
    label: 'godhood-diagnostic',
    seeds: SEEDS,
    policies: ['competent'],
    days: DAYS,
    extraMetrics: (Game) => ({ diag: JSON.stringify(diagnose(Game)) }),
  });
  for (const r of (rep.runs || [])) {
    console.log(`\n=== seed ${r.seed} (day ${JSON.parse(r.extra.diag)._day}) ===`);
    const d = JSON.parse(r.extra.diag);
    for (const [gid, info] of Object.entries(d)) {
      if (gid.startsWith('_')) continue;
      console.log(`  ${gid}: kit=${info.kit} core=${info.core} syn=${info.synergy} item=${info.item} dayOk=${info.dayOk} MISSING: ${info.missing}`);
    }
    console.log(`  tier-4 in villager hands: ${d._t4_in_villager_hands}`);
  }
})().catch(e => { console.error(e); process.exit(1); });
