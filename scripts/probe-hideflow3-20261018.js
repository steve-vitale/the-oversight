#!/usr/bin/env node
// probe-hideflow3-20261018.js — where do butchered hides END UP?
// End-of-run census: scholar pack hides, prepStash hides, village stash
// materials, all villagers' items with material 'hide', and armor items
// named hide_armor anywhere.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required'); process.exit(2); }

const SEEDS = [6113417, 6223527];
const POLICIES = ['leadfeast', 'belongfeast'];

const hideCount = (arr) => (arr || []).filter(i => i && i.material === 'hide').reduce((t, i) => t + (i.units || 0), 0);

async function runOne(seed, policyId) {
  const policy = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const { Game } = await loadGame({ seed, mode: 'probe-hideflow3', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  const s = Game.state.scholar || {};
  const pack = hideCount(s.inventory);
  const counter = hideCount(s.prepStash);
  let stashMat = 0;
  try { stashMat = ((Game.stashState().materials) || {}).hide || 0; } catch (e) {}
  let villHides = 0, villHideArmor = 0, packHideArmor = 0, wornHideArmor = 0;
  try {
    const roster = (Game.state.village || {}).roster || [];
    for (const vid of roster) {
      const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null;
      if (!vp || vp.dead) continue;
      villHides += hideCount(vp.items);
      for (const it of (vp.items || [])) if ((it.itemId || it.id) === 'hide_armor') villHideArmor++;
      for (const sl of Object.keys(vp.equipped || {})) {
        const e = vp.equipped[sl];
        if (e && (e.itemId || e.id) === 'hide_armor') wornHideArmor++;
      }
    }
  } catch (e) {}
  for (const it of (s.inventory || [])) if ((it.itemId || it.id) === 'hide_armor') packHideArmor++;
  const wornScholar = (() => { try {
    for (const sl of Object.keys(s.equipped || {})) { const e = s.equipped[sl]; if (e && (e.itemId || e.id) === 'hide_armor') return 1; }
    return 0;
  } catch (e) { return '?'; } })();
  const rk = ((((Game.state.codex || {}).recipes || {})['hide_armor']) || {}).level || 0;
  console.log(`[${policyId} s${seed}] days=${result.days} end=${result.endReason}`);
  console.log(`   hides: pack=${pack} counter=${counter} stashMat=${stashMat} villagers=${villHides}`);
  console.log(`   hide_armor items: pack=${packHideArmor} villagerItems=${villHideArmor} worn(villagers)=${wornHideArmor} wornScholar=${wornScholar} recipeL=${rk}`);
}

(async () => {
  for (const seed of SEEDS) for (const pid of POLICIES) await runOne(seed, pid);
  console.log('PROBE3 DONE');
})().catch(e => { console.error('PROBE CRASH:', e); process.exit(2); });
