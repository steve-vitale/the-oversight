#!/usr/bin/env node
// scripts/sweep-raiddef-20261014.js — 8-seed pilot sweep for the r35 ARM 3
// raid-channel defense layer (sim-findings RAID-CHANNEL REMAINDER).
//
// Control: leadfeast + FEASTSCALE_R13=1 (RAIDDEF unset).
// Armed:   leadfeast+raiddef + FEASTSCALE_R13=1 + RAIDDEF=1.
// Seeds: 11/22/33/44/55/66/77/88 (the plentycost road). Horizon: 180d
// death-aware (runDays stops on Game.over / village-dead tail).
//
// Pre-registered (evidence header):
//   PRIMARY: post-unlock non-draw Haven combat deaths per unlocker
//     <= control x 0.70
//   GUARDRAILS: median >= control-5d; national >= control-2;
//     wave-5 unlocks >= control-1; no new death mode (cause-family level,
//     count/seed floor per r34 metric review).
// Channel attribution: the raiddef-diag instrument (draw / raid-night /
//   lingerer / other), run on both sides.
//
// Usage:
//   node scripts/sweep-raiddef-20261014.js
//   SMOKE=1 node scripts/sweep-raiddef-20261014.js   # instrument-honesty gate
//   OUT=evidence/2026-10-14/raiddef-pilot.json node scripts/sweep-raiddef-20261014.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const path = require('path');
// 3184c187-pattern landed-tree guard (coordinator): the raiddef layer was
// deleted per kill protocol — degrade to INFO-SKIP, not MODULE_NOT_FOUND.
let rd = null;
try { rd = require('./policies/raiddef'); } catch (e) { /* absent: killed arm */ }
if (require.main === module && !rd) {
  console.log('INFO-SKIP: raiddef layer absent (killed arm, deleted per kill protocol).');
  process.exit(0);
}
const { leadfeastRaiddef } = rd;
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-14', 'raiddef-pilot.json');

function monsterWave(Game, monsterId) {
  try {
    const md = (Game.data.monsters || []).find(m => m.id === monsterId);
    return md ? (md.wave || null) : null;
  } catch (e) { return null; }
}
function isHavenLoc(loc) {
  return typeof loc === 'string' && /haven/i.test(loc);
}

async function runSeed(seed, policyId) {
  const armed = policyId === 'raiddef';
  if (armed) process.env.RAIDDEF = '1'; else delete process.env.RAIDDEF;
  const base = armed ? leadfeastRaiddef : leadfeast;
  const { Game } = await loadGame({ seed, mode: 'raiddef-' + policyId });
  await setupGame(Game);
  const audit = {
    playerDeaths: [], unlockDay5: null, raids: [], lingeringEver: new Set(),
    tableEver: false, tableDay: null, nationalDays: 0, maxUnlocked: 1,
  };

  const origRaidTick = Game.havenRaidTick ? Game.havenRaidTick.bind(Game) : null;
  if (origRaidTick) {
    Game.havenRaidTick = function () {
      const r = origRaidTick();
      try {
        if (r) {
          const s = Game.state.scholar || {};
          const v = Game.state.village || {};
          const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
          const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
          const raiders = (Game.worldMonsters ? Game.worldMonsters() : [])
            .filter(m => m && m.tx === hx && m.ty === hy)
            .map(m => m.id);
          audit.raids.push({ day: s.day || 0, raiderIds: raiders });
        }
      } catch (e) {}
      return r;
    };
  }

  const origPD = Game.playerDeath.bind(Game);
  Game.playerDeath = function (cause) {
    const rec = { day: null, cause: cause || '?', loc: null, monsters: [], draw: false, channel: 'unattributed' };
    try {
      const s = Game.state.scholar || {};
      rec.day = s.day || 0;
      rec.draw = !!(s.feastDraw && s.feastDraw.monsterId);
      try {
        const f = Game.tbfight;
        if (f && f.fighters) {
          for (const x of f.fighters) {
            if (x && x.kind === 'monster') rec.monsters.push({ id: x.monsterId || '?', wave: monsterWave(Game, x.monsterId) });
          }
        }
      } catch (e) {}
      try { rec.loc = (Game.nodeEpithet ? Game.nodeEpithet(Game.map.px, Game.map.py) : '?'); } catch (e) { rec.loc = '?'; }
      if (rec.draw) {
        rec.channel = 'draw';
      } else {
        const killerIds = rec.monsters.map(m => m.id);
        let raidHit = false;
        for (const raid of audit.raids) {
          if (rec.day >= raid.day && rec.day <= raid.day + 1 &&
              killerIds.some(k => raid.raiderIds.indexOf(k) !== -1)) { raidHit = true; break; }
        }
        if (raidHit) rec.channel = 'raid-night';
        else if (killerIds.some(k => audit.lingeringEver.has(k))) rec.channel = 'lingerer';
        else if (isHavenLoc(rec.loc) && rec.cause === 'combat') rec.channel = 'other';
        else rec.channel = 'nonhaven';
      }
    } catch (e) {}
    audit.playerDeaths.push(rec);
    return origPD(cause);
  };

  const policy = Object.assign({}, base);
  const origDaily = base.daily ? base.daily.bind(base) : null;
  policy.daily = (G, ctx) => {
    try { if (ctx && !G._raidCtx) G._raidCtx = ctx; } catch (e) {}
    try {
      const day = (G.state.scholar || {}).day || 0;
      const uw = G.unlockedWave ? G.unlockedWave() : 1;
      if (uw > audit.maxUnlocked) audit.maxUnlocked = uw;
      if (uw >= 5 && audit.unlockDay5 == null) audit.unlockDay5 = day;
      try {
        const pg = G.progState ? G.progState() : {};
        if (pg.tableWaiting && !audit.tableEver) { audit.tableEver = true; audit.tableDay = day; }
      } catch (e) {}
      try {
        const r = G.scaleRank ? G.scaleRank() : 'village';
        if (r === 'national' || r === 'global') audit.nationalDays++;
      } catch (e) {}
      try {
        const ms = G.worldMonsters ? G.worldMonsters() : [];
        for (const m of ms) {
          if (m && m.lingering && (m.hp || 0) > 0 && m.id) audit.lingeringEver.add(m.id);
        }
      } catch (e) {}
    } catch (e) {}
    return origDaily ? origDaily(G, ctx) : undefined;
  };

  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 }); });

  let arc = 1, won = false;
  try { arc = (Game.progState ? Game.progState() : {}).arc || 1; } catch (e) {}
  try { won = !!Game.won; } catch (e) {}
  // layer telemetry (armed side): ctx stashed on Game by the sweep wrapper
  let layer = null;
  try {
    const c = Game._raidCtx || {};
    if (armed) layer = {
      watchDays: c.raidWatchDays || 0, ripeDays: c.raidRipeDays || 0,
      sawThreats: c.raidDaysSaw || 0, engagements: c.raidEngagements || 0,
      heldHp: c.raidHeldHp || 0, heldAlone: c.raidHeldAlone || 0,
      heldTable: c.raidHeldTable || 0, blockedEarly: c.raidBlockedEarly || 0,
      invitesOk: c.raidInvitesOk || 0, invitesRefused: c.raidInvitesRefused || 0,
    };
  } catch (e) {}
  return {
    seed, policyId, days: result.days, endReason: result.endReason,
    maxUnlocked: audit.maxUnlocked, unlockDay5: audit.unlockDay5,
    tableEver: audit.tableEver, tableDay: audit.tableDay,
    nationalDays: audit.nationalDays, arc, won,
    raids: audit.raids.length, deaths: audit.playerDeaths, layer,
  };
}

function summarize(rows) {
  const unlockers = rows.filter(r => r.unlockDay5 != null);
  const channels = { draw: 0, 'raid-night': 0, lingerer: 0, other: 0 };
  let postHavenCombat = 0, postNonDraw = 0;
  const deathModes = {};
  for (const r of unlockers) {
    for (const d of r.deaths) {
      if (d.day < r.unlockDay5) continue;
      const k = d.cause;
      deathModes[k] = (deathModes[k] || 0) + 1;
      if (d.cause !== 'combat') continue;
      if (!isHavenLoc(d.loc)) continue;
      postHavenCombat++;
      channels[d.channel] = (channels[d.channel] || 0) + 1;
      if (d.channel !== 'draw') postNonDraw++;
    }
  }
  const days = rows.map(r => r.days).sort((a, b) => a - b);
  const layer = { watchDays: 0, engagements: 0, heldHp: 0, heldAlone: 0 };
  for (const r of rows) {
    if (!r.layer) continue;
    layer.watchDays += r.layer.watchDays || 0;
    layer.engagements += r.layer.engagements || 0;
    layer.heldHp += r.layer.heldHp || 0;
    layer.heldAlone += r.layer.heldAlone || 0;
  }
  return {
    n: rows.length,
    unlockers: unlockers.length,
    postUnlockHavenCombat: postHavenCombat,
    postUnlockNonDraw: postNonDraw,
    postUnlockNonDrawPerUnlocker: unlockers.length ? postNonDraw / unlockers.length : 0,
    channels,
    medianDays: days[Math.floor(days.length / 2)],
    national: rows.filter(r => r.nationalDays > 0).length,
    table: rows.filter(r => r.tableEver).length,
    wave5: rows.filter(r => r.maxUnlocked >= 5).length,
    won: rows.filter(r => r.won).length,
    deathModes,
    layer,
  };
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  check('named export unwraps (r20b)', !!(leadfeastRaiddef && leadfeastRaiddef.id === 'leadfeast+raiddef'),
    'id=' + (leadfeastRaiddef && leadfeastRaiddef.id));
  check('unwrapped daily is a function', typeof leadfeastRaiddef.daily === 'function', '');
  check('control unwraps', !!(leadfeast && leadfeast.id === 'leadfeast'), '');
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failure — the suite would run policy-less.'); process.exit(1); }
  process.env.RAIDDEF = '1';
  const { Game } = await loadGame({ seed: 11, mode: 'raiddef-sweep-smoke' });
  await setupGame(Game);
  const policy = Object.assign({}, leadfeastRaiddef);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 10, sampleEvery: 10 }); });
  const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
  check('harness drives armed policy.daily', meanCalls > 0, 'mean=' + meanCalls);
  delete process.env.RAIDDEF;
  if (fails.length) { console.log('\nSMOKE STOP: instrument-honesty gate failed.'); process.exit(1); }
  console.log('SMOKE GREEN: unwrap honest, harness drives the armed policy.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const rows = [];
  for (const seed of SEEDS) {
    for (const pid of ['leadfeast', 'raiddef']) {
      console.log(`[raiddef] seed ${seed} policy ${pid} ...`);
      const row = await runSeed(seed, pid);
      rows.push(row);
      console.log(`  -> ${row.days}d ${row.endReason} wave≤${row.maxUnlocked} unlock=${row.unlockDay5 == null ? 'no' : 'd' + row.unlockDay5} table=${row.tableEver ? 'd' + row.tableDay : 'no'} deaths=${row.deaths.length}`);
    }
  }
  const control = summarize(rows.filter(r => r.policyId === 'leadfeast'));
  const armed = summarize(rows.filter(r => r.policyId === 'raiddef'));
  console.log('--- CONTROL (leadfeast) ---');
  console.log(JSON.stringify(control, null, 1));
  console.log('--- ARMED (raiddef) ---');
  console.log(JSON.stringify(armed, null, 1));

  // pre-registered verdict
  const primaryGO = armed.postUnlockNonDrawPerUnlocker <= control.postUnlockNonDrawPerUnlocker * 0.70;
  const gMedian = armed.medianDays >= control.medianDays - 5;
  const gNational = armed.national >= control.national - 2;
  const gWave5 = armed.wave5 >= control.wave5 - 1;
  // no-new-death-mode with count/seed floor (r34 metric review): a mode is
  // new only if it appears on 2+ armed seeds at cause-family level
  const controlModes = new Set(Object.keys(control.deathModes));
  const armedModeSeeds = {};
  for (const r of rows.filter(r => r.policyId === 'raiddef')) {
    const modes = new Set();
    for (const d of r.deaths) if (r.unlockDay5 != null && d.day >= r.unlockDay5) modes.add(d.cause);
    for (const m of modes) armedModeSeeds[m] = (armedModeSeeds[m] || 0) + 1;
  }
  const newModes = Object.keys(armedModeSeeds).filter(k => !controlModes.has(k) && armedModeSeeds[k] >= 2);
  const gModes = newModes.length === 0;
  console.log('--- PRE-REGISTERED VERDICT ---');
  console.log(`PRIMARY postUnlockNonDrawPerUnlocker ${armed.postUnlockNonDrawPerUnlocker.toFixed(2)} <= ${control.postUnlockNonDrawPerUnlocker.toFixed(2)} x 0.70 = ${(control.postUnlockNonDrawPerUnlocker * 0.70).toFixed(2)}: ${primaryGO ? 'GO' : 'NO-GO'}`);
  console.log(`guardrail median ${armed.medianDays} >= ${control.medianDays - 5}: ${gMedian ? 'PASS' : 'FAIL'}`);
  console.log(`guardrail national ${armed.national} >= ${control.national - 2}: ${gNational ? 'PASS' : 'FAIL'}`);
  console.log(`guardrail wave5 ${armed.wave5} >= ${control.wave5 - 1}: ${gWave5 ? 'PASS' : 'FAIL'}`);
  console.log(`guardrail no-new-death-mode (n-floor 2 seeds): ${gModes ? 'PASS' : 'FAIL — ' + newModes.join(',')}`);
  const verdict = (primaryGO && gMedian && gNational && gWave5 && gModes) ? 'GO' : 'NO-GO';
  console.log(`VERDICT: ${verdict}`);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({
    generated: new Date().toISOString(), seeds: SEEDS, days: DAYS,
    control: 'leadfeast+FEASTSCALE_R13=1', armed: 'leadfeast+raiddef+FEASTSCALE_R13=1+RAIDDEF=1',
    summary: { control, armed },
    verdict: { primaryGO, gMedian, gNational, gWave5, gModes, newModes, verdict },
    rows,
  }, null, 1));
  console.log(`wrote ${OUT}`);
  if (verdict !== 'GO') process.exit(2);
}

if (require.main === module) { main().catch(e => { console.error('FATAL', e); process.exit(1); }); }
module.exports = { runSeed, SEEDS, DAYS, summarize };
