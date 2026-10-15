#!/usr/bin/env node
// scripts/sweep-w5avoid2-20261015.js — 8-seed pilot sweep for the
// W5-AVOIDANCE DOCTRINE arm, clearing half deleted (scale-onramp,
// run fleshout-a-2026-10-15-0015 ARM 1).
//
// Control: leadfeast + FEASTSCALE_R13=1 (W5AVOID2 unset).
// Armed:   leadfeast+w5avoid2 + FEASTSCALE_R13=1 + W5AVOID2=1.
// Seeds: 11/22/33/44/55/66/77/88 (the plentycost road). Horizon: 180d
// death-aware (runDays stops on Game.over / village-dead tail).
//
// Pre-registered (evidence header, evidence/2026-10-15/sim-w5avoid2.md):
//   PRIMARY: median survival (days) — GO = armed >= control + 15d.
//   GUARDRAILS: national >= control-2; no new death mode (cause-family
//     level, count/seed floor n>=2 per r34 metric review); w1/w2 scholar
//     combat deaths <= control (the r36 successor-feed must not leak back).
// Channel attribution: the raiddef-diag instrument (draw / raid-night /
//   lingerer / other / nonhaven), run on both sides.
//
// KILLED-ARM GUARD: if the layer is absent (deleted per kill protocol),
// degrade to INFO-SKIP, not MODULE_NOT_FOUND (6th-instance lesson).
//
// Usage:
//   node scripts/sweep-w5avoid2-20261015.js
//   SMOKE=1 node scripts/sweep-w5avoid2-20261015.js   # instrument-honesty gate
//   OUT=evidence/2026-10-15/w5avoid2-pilot.json node scripts/sweep-w5avoid2-20261015.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const path = require('path');
// landed-tree guard: the w5avoid2 layer may be deleted per kill protocol —
// degrade to INFO-SKIP, not MODULE_NOT_FOUND.
let wa = null;
try { wa = require('./policies/w5avoid2'); } catch (e) { /* absent: killed arm */ }
if (require.main === module && !wa) {
  console.log('INFO-SKIP: w5avoid2 layer absent (killed arm, deleted per kill protocol).');
  process.exit(0);
}
const { leadfeastW5avoid2 } = wa;
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-15', 'w5avoid2-pilot.json');
const PERSEED = path.join(__dirname, '..', 'evidence', '2026-10-15', 'w5avoid2-per-seed');

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
  const armed = policyId === 'w5avoid2';
  if (armed) process.env.W5AVOID2 = '1'; else delete process.env.W5AVOID2;
  const base = armed ? leadfeastW5avoid2 : leadfeast;
  const { Game } = await loadGame({ seed, mode: 'w5avoid2-' + policyId });
  await setupGame(Game);
  const audit = {
    playerDeaths: [], unlockDay5: null, raids: [], lingeringEver: new Set(),
    tableEver: false, tableDay: null, nationalDays: 0, maxUnlocked: 1,
    exiledEver: false,
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
    try { if (ctx && !G._w5aCtx) G._w5aCtx = ctx; } catch (e) {}
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
      try { if (G.state.scholar && G.state.scholar.exiled) audit.exiledEver = true; } catch (e) {}
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
    const c = Game._w5aCtx || {};
    if (armed) layer = {
      alertDays: c.w5AlertDays || 0, avoided: c.w5Avoided || 0,
      avoidedRaider: c.w5Avoided_raider || 0, avoidedLinger: c.w5Avoided_lingerer || 0,
      avoidedFollower: c.w5Avoided_follower || 0, marchRefused: c.w5MarchRefused || 0,
    };
  } catch (e) {}
  return {
    seed, policyId, days: result.days, endReason: result.endReason,
    maxUnlocked: audit.maxUnlocked, unlockDay5: audit.unlockDay5,
    tableEver: audit.tableEver, tableDay: audit.tableDay,
    nationalDays: audit.nationalDays, exiledEver: audit.exiledEver, arc, won,
    raids: audit.raids.length, deaths: audit.playerDeaths, layer,
  };
}

function med(arr) {
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

// w1/w2 scholar combat deaths: the r36 successor-feed guardrail — scholar
// (player) deaths with cause 'combat' and any killer monster of wave 1 or 2.
function w12ScholarCombatDeaths(rows) {
  let n = 0;
  for (const r of rows) {
    for (const d of r.deaths) {
      if (d.cause !== 'combat') continue;
      if ((d.monsters || []).some(m => m.wave === 1 || m.wave === 2)) n++;
    }
  }
  return n;
}

function summarize(rows) {
  const unlockers = rows.filter(r => r.unlockDay5 != null);
  const channels = { draw: 0, 'raid-night': 0, lingerer: 0, other: 0, nonhaven: 0, unattributed: 0 };
  let postHavenCombat = 0, postNonDraw = 0;
  const deathModes = {};
  for (const r of unlockers) {
    for (const d of r.deaths) {
      if (d.day < r.unlockDay5) continue;
      deathModes[d.cause] = (deathModes[d.cause] || 0) + 1;
      if (d.cause !== 'combat') continue;
      if (!isHavenLoc(d.loc)) continue;
      postHavenCombat++;
      channels[d.channel] = (channels[d.channel] || 0) + 1;
      if (d.channel !== 'draw') postNonDraw++;
    }
  }
  const layer = { alertDays: 0, avoided: 0, marchRefused: 0 };
  for (const r of rows) {
    if (!r.layer) continue;
    layer.alertDays += r.layer.alertDays || 0;
    layer.avoided += r.layer.avoided || 0;
    layer.marchRefused += r.layer.marchRefused || 0;
  }
  return {
    n: rows.length,
    unlockers: unlockers.length,
    postUnlockHavenCombat: postHavenCombat,
    postUnlockNonDraw: postNonDraw,
    postUnlockNonDrawPerUnlocker: unlockers.length ? postNonDraw / unlockers.length : 0,
    channels,
    medianDays: med(rows.map(r => r.days)),
    maxDays: Math.max(...rows.map(r => r.days)),
    national: rows.filter(r => r.nationalDays > 0).length,
    table: rows.filter(r => r.tableEver).length,
    wave4: rows.filter(r => r.maxUnlocked >= 4).length,
    wave5: rows.filter(r => r.maxUnlocked >= 5).length,
    won: rows.filter(r => r.won).length,
    exiled: rows.filter(r => r.exiledEver).length,
    deathModes,
    w12ScholarCombatDeaths: w12ScholarCombatDeaths(rows),
    layer,
  };
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  check('named export unwraps (r20b)', !!(leadfeastW5avoid2 && leadfeastW5avoid2.id === 'leadfeast+w5avoid2'),
    'id=' + (leadfeastW5avoid2 && leadfeastW5avoid2.id));
  check('unwrapped daily is a function', typeof leadfeastW5avoid2.daily === 'function', '');
  check('control unwraps', !!(leadfeast && leadfeast.id === 'leadfeast'), '');
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failure — the suite would run policy-less.'); process.exit(1); }
  process.env.W5AVOID2 = '1';
  const { Game } = await loadGame({ seed: 11, mode: 'w5avoid2-sweep-smoke' });
  await setupGame(Game);
  const policy = Object.assign({}, leadfeastW5avoid2);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 10, sampleEvery: 10 }); });
  const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
  check('harness drives armed policy.daily', meanCalls > 0, 'mean=' + meanCalls);
  delete process.env.W5AVOID2;
  if (fails.length) { console.log('\nSMOKE STOP: instrument-honesty gate failed.'); process.exit(1); }
  console.log('SMOKE GREEN: unwrap honest, harness drives the armed policy.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const rows = [];
  for (const seed of SEEDS) {
    for (const pid of ['leadfeast', 'w5avoid2']) {
      console.log(`[w5avoid2] seed ${seed} policy ${pid} ...`);
      const row = await runSeed(seed, pid);
      rows.push(row);
      console.log(`  -> ${row.days}d ${row.endReason} wave≤${row.maxUnlocked} unlock=${row.unlockDay5 == null ? 'no' : 'd' + row.unlockDay5} table=${row.tableEver ? 'd' + row.tableDay : 'no'} deaths=${row.deaths.length}`);
    }
  }
  const control = summarize(rows.filter(r => r.policyId === 'leadfeast'));
  const armed = summarize(rows.filter(r => r.policyId === 'w5avoid2'));
  console.log('--- CONTROL (leadfeast) ---');
  console.log(JSON.stringify(control, null, 1));
  console.log('--- ARMED (w5avoid2) ---');
  console.log(JSON.stringify(armed, null, 1));

  // pre-registered verdict
  const primaryGO = armed.medianDays >= control.medianDays + 15;
  const gNational = armed.national >= control.national - 2;
  // no-new-death-mode with count/seed floor (r34 metric review): a mode is
  // new only if it appears on 2+ armed seeds at cause-family level
  const controlModes = new Set(Object.keys(control.deathModes));
  const armedModeSeeds = {};
  for (const r of rows.filter(r => r.policyId === 'w5avoid2')) {
    const modes = new Set();
    for (const d of r.deaths) if (r.unlockDay5 != null && d.day >= r.unlockDay5) modes.add(d.cause);
    for (const m of modes) armedModeSeeds[m] = (armedModeSeeds[m] || 0) + 1;
  }
  const newModes = Object.keys(armedModeSeeds).filter(k => !controlModes.has(k) && armedModeSeeds[k] >= 2);
  const gModes = newModes.length === 0;
  const gW12 = armed.w12ScholarCombatDeaths <= control.w12ScholarCombatDeaths;
  console.log('--- PRE-REGISTERED VERDICT ---');
  console.log(`PRIMARY medianDays ${armed.medianDays} >= ${control.medianDays} + 15 = ${control.medianDays + 15}: ${primaryGO ? 'GO' : 'NO-GO'}`);
  console.log(`guardrail national ${armed.national} >= ${control.national - 2}: ${gNational ? 'PASS' : 'FAIL'}`);
  console.log(`guardrail no-new-death-mode (n-floor 2 seeds): ${gModes ? 'PASS' : 'FAIL — ' + newModes.join(',')}`);
  console.log(`guardrail w1/w2 scholar combat deaths ${armed.w12ScholarCombatDeaths} <= ${control.w12ScholarCombatDeaths}: ${gW12 ? 'PASS' : 'FAIL'}`);
  console.log(`report-only: wave4 control ${control.wave4} armed ${armed.wave4}; wave5 control ${control.wave5} armed ${armed.wave5}`);
  const verdict = (primaryGO && gNational && gModes && gW12) ? 'GO' : 'NO-GO';
  console.log(`VERDICT: ${verdict}`);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({
    generated: new Date().toISOString(), seeds: SEEDS, days: DAYS,
    control: 'leadfeast+FEASTSCALE_R13=1', armed: 'leadfeast+w5avoid2+FEASTSCALE_R13=1+W5AVOID2=1',
    summary: { control, armed },
    verdict: { primaryGO, gNational, gModes, newModes, gW12, verdict },
    rows,
  }, null, 1));
  console.log(`wrote ${OUT}`);
  // per-seed telemetry files for scripts/telemetry-check.js (metrics
  // national,table,wins,exiled as dot-paths per file)
  fs.mkdirSync(PERSEED, { recursive: true });
  for (const r of rows) {
    fs.writeFileSync(path.join(PERSEED, `s${r.seed}-${r.policyId}.json`), JSON.stringify({
      seed: r.seed, policyId: r.policyId,
      national: r.nationalDays > 0 ? 1 : 0, table: r.tableEver ? 1 : 0,
      wins: r.won ? 1 : 0, exiled: r.exiledEver ? 1 : 0,
      days: r.days, maxUnlocked: r.maxUnlocked, unlockDay5: r.unlockDay5,
    }, null, 1));
  }
  console.log(`wrote ${rows.length} per-seed files to ${PERSEED}`);
  if (verdict !== 'GO') process.exit(2);
}

if (require.main === module) { main().catch(e => { console.error('FATAL', e); process.exit(1); }); }
module.exports = { runSeed, SEEDS, DAYS, summarize };
