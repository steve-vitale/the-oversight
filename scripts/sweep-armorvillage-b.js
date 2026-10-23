#!/usr/bin/env node
// sweep-armorvillage-b.js — sim-armorvillage-b PILOT sweep (completing the
// dead 0515Z run's arm; run fleshout-20261023T0713Z).
//
// Pre-registered design (§14 binding — from evidence/2026-10-23/sim-armorvillage-b.md):
//   Seeds 67601-67608 x {leadfeast, belongfeast} x {control, armed} = 32 configs,
//   180d death-aware. control = AD.armedFor(base) (ARMORYDRIVE=1 pinned both
//   arms); armed = AV.armedFor(base) + ARMORVILLAGE=1.
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1 (+ARMORVILLAGE=1 armed only).
//
// PRIMARY (binding): the structure's named outputs fire on armed seeds:
//   (1) pile deposits >=2/seed, (2) villagers equipped from pile/hand-off
//   >=2/seed, (3) NPC craft beats produce armor >=1/seed — each on >=6/8
//   armed seeds — AND median per-seed-median daily armored15-fighter count
//   (waveCombatReadiness(5).armored) armed > control + 0.5.
// Guardrails: median survival, starvation, no new death modes, no sink
// exploits (units conservation), death-cause shares sane.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-23/perseed-armorvillage-b/{control,armed}/s<seed>-<policy>.json.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARM=control SEEDS=67601,67602 node scripts/sweep-armorvillage-b.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARMORVILLAGE=1 ARM=armed SEEDS=67601,67602 node scripts/sweep-armorvillage-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));
const WS = require(path.join(REPO, 'scripts', 'instr-windowstay-20261021'));

// Pinned substrate guard (nothing else).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (pinned substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'TWOVETS', 'VGEAR', 'WAVE4ENGAGE', 'FEASTDISC', 'RESTRAINT']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
}

const DAYS = 180;
const ARM = process.env.ARM || 'control'; // control | armed
const SEEDS = String(process.env.SEEDS || '').split(',').map(s => parseInt(s, 10)).filter(Number.isFinite);
if (!SEEDS.length) { console.error('SWEEP STOP: SEEDS required'); process.exit(2); }
const POLICIES = ['leadfeast', 'belongfeast'];

function anchorCommit() {
  try { return execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); }
  catch (e) { return 'unknown'; }
}

async function oneRun(seed, policyName) {
  const armed = ARM === 'armed';
  const { Game } = await loadGame({ seed, mode: 'armorvillage-pilot', fullTelemetry: false });
  const t = { deathRecs: [], instrumentErrors: [], window: [], census: [], kills: [], engagements: [] };
  const uninstallWS = WS.install(Game, t);
  // Armor-channel counting: wrap tele AFTER the WS wrap (both fire).
  const ch = { deposits: 0, gifts: 0, pileTakes: 0, crafts: 0, giftVids: [], craftVids: [] };
  const wsWrappedTele = Game.tele;
  Game.tele = function (type, data) {
    const r = wsWrappedTele.apply(this, arguments);
    try {
      if (type === 'armor_gift') { ch.gifts++; if (data && data.vid) ch.giftVids.push(String(data.vid)); }
      if (type === 'villager_gear' && data && data.via === 'armor_pile') ch.pileTakes++;
      if (type === 'armor_craft' && data && data.ok) { ch.crafts++; if (data.vid) ch.craftVids.push(String(data.vid)); }
    } catch (e) {}
    return r;
  };
  const origDonate = Game.donateArmor.bind(Game);
  Game.donateArmor = function (idx) { const r = origDonate(idx); if (r !== null && r !== undefined) ch.deposits++; return r; };

  const base = armed ? AV.armedFor(AD.normBase(policyName)) : AD.armedFor(AD.normBase(policyName));
  const dailyArmored = [];
  const wrapped = Object.assign({}, base, {
    daily(Gm, ctx) {
      const r = base.daily(Gm, ctx);
      try { dailyArmored.push(Gm.waveCombatReadiness(5).armored | 0); } catch (e) { dailyArmored.push(-1); }
      return r;
    },
  });

  await setupGame(Game);
  const result = await quietLog(async () => {
    return await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 });
  });

  Game.tele = wsWrappedTele; // restore WS's wrapper first
  try { uninstallWS(); } catch (e) {}

  const st = Game.state || {};
  const scholar = st.scholar || {};
  const deaths = (t.deathRecs || []).map(d => ({
    d: d.day, who: d.who, kind: d.kind, cause: d.cause, player: !!d.player,
  }));
  const starv = deaths.filter(d => /starv/i.test(String(d.cause || ''))).length;
  const sorted = dailyArmored.filter(x => x >= 0).sort((a, b) => a - b);
  const medArmored = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
  const pileNow = ((st.village && st.village.stash && st.village.stash.armor) || []).length;

  return {
    seed, policy: policyName, arm: ARM,
    anchorCommit: anchorCommit(),
    days: scholar.day || 0,
    endReason: (result && result.endReason) || null,
    deposits: ch.deposits, gifts: ch.gifts, pileTakes: ch.pileTakes, crafts: ch.crafts,
    equippedFromStructure: ch.pileTakes + ch.gifts,
    giftVids: [...new Set(ch.giftVids)], craftVids: [...new Set(ch.craftVids)],
    medDailyArmored15: medArmored, dailyArmoredTail: dailyArmored.slice(-10),
    pileUnitsNow: pileNow,
    nDeaths: deaths.length, starvDeaths: starv,
    deaths,
    instrumentErrors: (t.instrumentErrors || []).slice(0, 5),
  };
}

(async () => {
  const outDir = path.join(REPO, 'evidence', '2026-10-23', 'perseed-armorvillage-b', ARM);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    for (const policyName of POLICIES) {
      const row = await oneRun(seed, policyName);
      const fp = path.join(outDir, `s${seed}-${policyName}.json`);
      fs.writeFileSync(fp, JSON.stringify(row, null, 1) + '\n');
      console.log(`${ARM} s${seed}-${policyName}: d${row.days} dep${row.deposits} gift${row.gifts} pile${row.pileTakes} craft${row.crafts} arm15med${row.medDailyArmored15} starv${row.starvDeaths} deaths${row.nDeaths}${row.endReason ? ' end:' + row.endReason : ''}`);
    }
  }
  console.log('done', ARM, SEEDS.join(','));
})().catch(e => { console.error('SWEEP FAIL:', e); process.exit(2); });
