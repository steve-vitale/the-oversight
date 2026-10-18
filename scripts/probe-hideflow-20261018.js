#!/usr/bin/env node
// probe-hideflow-20261018.js — diagnostic probe (not a proof test): how many
// hides/vines flow through the scholar's inventory on the FEASTSCALE pre-seat
// substrate, hide_armor knowledge levels over time, and craft events.
// 2 seeds x {leadfeast, belongfeast}, 180d death-aware.
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

async function runOne(seed, policyId) {
  const policy = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const { Game } = await loadGame({ seed, mode: 'probe-hideflow', fullTelemetry: false });
  await setupGame(Game);
  let maxHide = 0, maxVine = 0, hideHandleDay = null, hideL2Day = null;
  const base = Object.assign({}, policy);
  const oDaily = base.daily;
  base.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      const inv = (G.state.scholar && G.state.scholar.inventory) || [];
      const hide = inv.filter(i => i && i.material === 'hide').reduce((t, i) => t + (i.units || 0), 0);
      const vine = inv.filter(i => i && i.material === 'vine').reduce((t, i) => t + (i.units || 0), 0);
      if (hide > maxHide) maxHide = hide;
      if (vine > maxVine) maxVine = vine;
      const rk = (((G.state.codex || {}).recipes || {})['hide_armor']) || {};
      if ((rk.level || 0) >= 1 && hideHandleDay == null) hideHandleDay = G.state.scholar.day;
      if ((rk.level || 0) >= 2 && hideL2Day == null) hideL2Day = G.state.scholar.day;
    } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, base, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  const tel = (Game.state.telemetry || []);
  const crafts = tel.filter(t => t.type === 'craft');
  const hideCrafts = crafts.filter(t => (t.data || {}).id === 'hide_armor').length;
  const craftIds = {};
  for (const t of crafts) craftIds[(t.data || {}).id] = (craftIds[(t.data || {}).id] || 0) + 1;
  const inv = (Game.state.scholar && Game.state.scholar.inventory) || [];
  const endHide = inv.filter(i => i && i.material === 'hide').reduce((t, i) => t + (i.units || 0), 0);
  const endVine = inv.filter(i => i && i.material === 'vine').reduce((t, i) => t + (i.units || 0), 0);
  const rk = ((((Game.state.codex || {}).recipes || {})['hide_armor']) || {}).level || 0;
  let hideHandTeles = 0;
  for (const t of tel) if (t.type === 'hide_handled') hideHandTeles++;
  const hidesInVillageStash = (() => { try {
    const st = Game.stashState ? Game.stashState() : null;
    return ((st && st.materials) || {}).hide || 0;
  } catch (e) { return '?'; } })();
  console.log(`[${policyId} s${seed}] days=${result.days} end=${result.endReason} maxHide=${maxHide} maxVine=${maxVine} hideL1day=${hideHandleDay} hideL2day=${hideL2Day} hide_handled_teles=${hideHandTeles} hideCrafts=${hideCrafts} endHide=${endHide} endVine=${endVine} stashHide=${hidesInVillageStash}`);
  console.log(`   craftIds=${JSON.stringify(craftIds)} recipeLevel_end=${rk}`);
}

(async () => {
  for (const seed of SEEDS) for (const pid of POLICIES) await runOne(seed, pid);
  console.log('PROBE DONE');
})().catch(e => { console.error('PROBE CRASH:', e); process.exit(2); });
