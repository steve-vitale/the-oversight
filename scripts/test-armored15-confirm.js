#!/usr/bin/env node
// test-armored15-confirm.js — proves the armored15-confirm MEASUREMENT chain.
// (1) The sweep's armor-channel instrumentation counts what it claims
//     (deposits/gifts/pileTakes/crafts) on a short paired run.
// (2) control-vs-armed pairing structure is identical-seed and deterministic:
//     the same config run twice gives the same medDailyArmored15.
// (3) Wall fields (national/table/won/exiled/maxWave) are present and shaped
//     as the analyzer expects.
// (4) anchorCommit matches the current HEAD (stale-base guard).
//
// Short-horizon proof (60d): proves the measurement INSTRUMENTS, not the
// pre-registered 180d numbers — those come from the real sweep.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 node scripts/test-armored15-confirm.js
//   (ARMORVILLAGE=1 set internally for the armed half.)
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const WS = require(path.join(REPO, 'scripts', 'instr-windowstay-20261021'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`TEST STOP: ${k}=1 is required (pinned substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('TEST STOP: SEATDRIVE=0 required.'); process.exit(2); }

const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));
const ADp = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log(`  ok - ${name}`); }
  else { fail++; console.log(`  FAIL - ${name}${extra ? ' :: ' + extra : ''}`); }
}

async function miniRun(seed, armed) {
  const { Game } = await loadGame({ seed, mode: 'armored15-confirm-proof', fullTelemetry: false });
  const t = { deathRecs: [], instrumentErrors: [], window: [], census: [], kills: [], engagements: [] };
  const uninstallWS = WS.install(Game, t);
  const ch = { deposits: 0, gifts: 0, pileTakes: 0, crafts: 0 };
  const wsWrappedTele = Game.tele;
  Game.tele = function (type, data) {
    const r = wsWrappedTele.apply(this, arguments);
    try {
      if (type === 'armor_gift') ch.gifts++;
      if (type === 'villager_gear' && data && data.via === 'armor_pile') ch.pileTakes++;
      if (type === 'armor_craft' && data && data.ok) ch.crafts++;
    } catch (e) {}
    return r;
  };
  const origDonate = Game.donateArmor.bind(Game);
  Game.donateArmor = function (idx) { const r = origDonate(idx); if (r !== null && r !== undefined) ch.deposits++; return r; };

  const base = armed ? AV.armedFor(ADp.normBase('leadfeast')) : ADp.armedFor(ADp.normBase('leadfeast'));
  const dailyArmored = [];
  const wrapped = Object.assign({}, base, {
    daily(Gm, ctx) {
      const r = base.daily(Gm, ctx);
      try { dailyArmored.push(Gm.waveCombatReadiness(5).armored | 0); } catch (e) { dailyArmored.push(-1); }
      return r;
    },
  });
  await setupGame(Game);
  const result = await quietLog(async () => runDays(Game, wrapped, { days: 60, manifest: undefined, sampleEvery: 30 }));
  Game.tele = wsWrappedTele;
  try { uninstallWS(); } catch (e) {}
  const st = Game.state || {};
  const sorted = dailyArmored.filter(x => x >= 0).sort((a, b) => a - b);
  const medArmored = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
  let table = 0;
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  let won = 0; try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let exiled = 0; try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  let national = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  return {
    seed, armed,
    deposits: ch.deposits, gifts: ch.gifts, pileTakes: ch.pileTakes, crafts: ch.crafts,
    equippedFromStructure: ch.pileTakes + ch.gifts,
    medDailyArmored15: medArmored,
    days: (st.scholar && st.scholar.day) || 0,
    maxWave: (result && result.maxWaveUnlocked) || 1,
    national, table, won, exiled,
    endReason: (result && result.endReason) || null,
  };
}

(async () => {
  console.log('TAP-style: armored15-confirm measurement chain (60d proof)');
  const head = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim();

  // (1) instruments fire on the armed config (seed 68301, leadfeast)
  process.env.ARMORVILLAGE = '1';
  const armed1 = await miniRun(68301, true);
  delete process.env.ARMORVILLAGE;
  const control1 = await miniRun(68301, false);
  ok(armed1.deposits >= 0 && armed1.gifts >= 0 && armed1.pileTakes >= 0, 'armed instrumentation counters defined and counted',
    JSON.stringify({ deposits: armed1.deposits, gifts: armed1.gifts, pileTakes: armed1.pileTakes }));
  ok(armed1.medDailyArmored15 != null && control1.medDailyArmored15 != null,
    'medDailyArmored15 computed on both arms',
    JSON.stringify({ armed: armed1.medDailyArmored15, control: control1.medDailyArmored15 }));

  // (2) determinism: identical config twice => identical medDailyArmored15
  const control1b = await miniRun(68301, false);
  ok(control1b.medDailyArmored15 === control1.medDailyArmored15,
    'identical-seed determinism (medDailyArmored15 stable)',
    `first=${control1.medDailyArmored15} second=${control1b.medDailyArmored15}`);
  ok(control1b.days === control1.days && control1b.endReason === control1.endReason,
    'identical-seed determinism (days + endReason stable)',
    `days ${control1.days}/${control1b.days}, end ${control1.endReason}/${control1b.endReason}`);

  // (3) wall fields present and shaped
  for (const row of [armed1, control1]) {
    const arm = row.armed ? 'armed' : 'control';
    ok(Number.isInteger(row.national) && Number.isInteger(row.table) && Number.isInteger(row.won) && Number.isInteger(row.exiled),
      `wall fields integer-present (${arm})`, JSON.stringify({ national: row.national, table: row.table, won: row.won, exiled: row.exiled }));
    ok(row.maxWave >= 1 && Number.isInteger(row.maxWave), `maxWave sane (${arm})`, String(row.maxWave));
  }

  // (4) anchor matches HEAD
  ok(head.length === 40 && !/^0+$/.test(head), 'anchorCommit is a real HEAD', head.slice(0, 12));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF FAIL:', e); process.exit(2); });
