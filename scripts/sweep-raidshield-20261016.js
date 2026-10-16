#!/usr/bin/env node
'use strict';
// sweep-raidshield-20261016.js — paired before/after sweep for the
// sim-raidshield arm (the shield wall, src/js/havenGrowth.js, RAIDSHIELD=1).
//
// Composes scripts/fieldfightsrc-20261016.js's read-only attribution
// (withFieldFightSrc / srcOf) with ZERO changes — the sortie's fights carry
// {raid:true} + m.lingering, so the existing RAID tag covers them. Adds a
// read-only 🛡️-beat counter (the exercise gates: shield-wall beats on
// apex raids, sorties firing).
//
// Substrate (pre-registration): FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
// RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 explicit, pre-seat.
// Policies: leadfeast / belongfeast (TF = tribfloor). Horizon 180d
// death-aware. 8 fresh seeds x 2 policies x {control, armed} = 32 runs.
//
// Run: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//        node scripts/sweep-raidshield-20261016.js
//   SEEDS=111,122 node scripts/sweep-raidshield-20261016.js   (subset)
const fs = require('fs');
const path = require('path');
const FFS = require('./fieldfightsrc-20261016');
const TF = require('./policies/tribfloor');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [111, 122, 133, 144, 155, 166, 177, 199]).filter(Number.isFinite);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-raidshield');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'raidshield-beats');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SUBSTRATE: ${k} must be 1`); process.exit(2); }
}
if (process.env.SEATDRIVE === undefined || process.env.SEATDRIVE === '0') {
  if (process.env.SEATDRIVE !== '0') { console.error('SUBSTRATE: SEATDRIVE must be 0 explicit (pre-seat)'); process.exit(2); }
}

function policyFor(policyId) { return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast; }

// read-only shield-beat counter: wraps Game.say AFTER the ffs wrap, records
// 🛡️ beats (wall forms / reserve follows / sortie). Never alters output.
function withShieldCounter(Game, ctx) {
  const rec = { wall: 0, reserve: 0, sortie: 0, sortieNone: 0, beats: [] };
  const orig = Game.say;
  Game.say = function (s) {
    try {
      const t = String(s || '');
      if (t.startsWith('🛡️')) {
        const day = (Game.state && Game.state.scholar && Game.state.scholar.day) || 0;
        if (/shield wall forms/.test(t)) rec.wall++;
        else if (/follows .* in —/.test(t)) rec.reserve++;
        else if (/takes the shield wall out/.test(t)) rec.sortie++;
        else if (/looks away/.test(t)) rec.sortieNone++;
        if (rec.beats.length < 400) rec.beats.push({ day, text: t.slice(0, 220) });
      }
    } catch (e) {}
    return orig.apply(this, arguments);
  };
  return rec;
}

async function oneRun(seed, policyId, armed) {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  if (armed) process.env.RAIDSHIELD = '1'; else delete process.env.RAIDSHIELD;
  const base = policyFor(policyId);
  const policy = FFS.withFieldFightSrc(base, base.id + '-rs', base.desc + (armed ? ' [RAIDSHIELD]' : ' [control]'));
  const { Game } = await loadGame({ seed, mode: 'raidshield', fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  const shield = withShieldCounter(Game, runCtx);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  delete process.env.RAIDSHIELD;
  const C = (runCtx && runCtx._ffs) || FFS.newRec();
  const gday = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const finalEngineDay = gday(Game);
  const isVillager = (d) => /person|villager/i.test(d.kind || '') || d.player === true;
  const postInvite = C.deaths.filter(d => C.inviteDay != null && d.day >= C.inviteDay && isVillager(d) && d.family === 'monster');
  const srcShare = { RAID: 0, EXPEDITION: 0, 'WILD-ENCOUNTER': 0, unattributed: 0 };
  for (const d of postInvite) srcShare[d.src] = (srcShare[d.src] || 0) + 1;
  const attributed = (srcShare.RAID || 0) + (srcShare.EXPEDITION || 0) + (srcShare['WILD-ENCOUNTER'] || 0);
  // RAID channel split: direct treeline waves (opts.raid, raid=true) vs
  // lingering-raider kills (m.lingering) — recorded by the instrument.
  let raidDirect = 0, raidLingering = 0;
  for (const d of postInvite) {
    if (d.src !== 'RAID') continue;
    if (d.monsterLingering) raidLingering++; else raidDirect++;
  }
  const out = {
    seed, policyId, armed: !!armed, mode: 'raidshield',
    days: result.days, gameDays: result.gameDays, finalEngineDay,
    endReason: result.endReason,
    won: !!Game.won,
    inviteDay: C.inviteDay, sittings: C.sittings,
    maxWave: C.dayTiers.length ? Math.max(1, ...C.dayTiers.map(r => r.wave || 1)) : 1,
    national: C.dayTiers.some(r => r.scale === 'national' || r.scale === 'global') ? 1 : 0,
    table: C.inviteDay != null ? 1 : 0,
    wins: !!Game.won ? 1 : 0, exiled: 0,
    nDeaths: C.deaths.length,
    postInviteMonsterVerb: postInvite.length,
    postInviteSrcShare: srcShare,
    raidDirect, raidLingering,
    attributionRate: postInvite.length ? attributed / postInvite.length : 1,
    shieldBeats: { wall: shield.wall, reserve: shield.reserve, sortie: shield.sortie, sortieNone: shield.sortieNone },
    deaths: C.deaths,
    dayTiers: C.dayTiers,
    beatsDropped: C.beatsDropped,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}-${armed ? 'armed' : 'control'}.json`), JSON.stringify(out, null, 1));
  try {
    if (shield.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}-${armed ? 'armed' : 'control'}.json`), JSON.stringify(shield.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${policyId} s${seed} ${armed ? 'ARMED' : 'control'}] days=${out.gameDays} end=${out.endReason} invDay=${C.inviteDay} ` +
    `raid=${srcShare.RAID}(direct ${raidDirect}/linger ${raidLingering}) mv-post=${postInvite.length} nat=${out.national} ` +
    `shield=${shield.wall}w/${shield.reserve}r/${shield.sortie}s`);
}

(async () => {
  if (require.main !== module) return;
  const RESUME = process.env.RESUME === '1';
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      if (RESUME) {
        const c = path.join(EVID, `${policyId}-s${seed}-control.json`);
        const a = path.join(EVID, `${policyId}-s${seed}-armed.json`);
        if (fs.existsSync(c) && fs.existsSync(a)) { console.log(`  [${policyId} s${seed}] resume-skip (both sides present)`); continue; }
      }
      await oneRun(seed, policyId, false);
      await oneRun(seed, policyId, true);
    }
  }
  console.log('sweep complete');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
