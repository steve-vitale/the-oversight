#!/usr/bin/env node
// armorfetch-verdict-b.js — flap-proof verdict driver for sim-armorfetch-b.
// Same substrate and policy stack as scripts/armorfetch-trace-b.js
// (nighttravel + woodcarry, WOODWARM=0, same env gates), but it prints
// ONE JSON summary line per seed to stdout and writes NO files: the
// container EPERM flap turns node fs writes into 0-byte files, so the
// judged quantities (stash-loss day, kit-arrival day, equip day, cost
// bar) are carried on stdout instead of in a corpus dir. The verdict
// logic mirrors scripts/analyze-armorfetch-b.js (window: first 7 game
// days; WORN = stash-loss + equipped; FETCHED = stash-loss + packed).
// Usage: COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY=nighttravel WOODCARRY=1 WOODWARM=0 SEEDS=16101,... DAYS=60
//   node scripts/armorfetch-verdict-b.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
if (process.env.WOODCARRY !== '1') { console.error('FATAL: WOODCARRY must be 1'); process.exit(2); }
if (process.env.WOODWARM !== '0') { console.error('FATAL: WOODWARM must be 0 (guard leg)'); process.exit(2); }
if (process.env.POLICY !== 'nighttravel') { console.error('FATAL: POLICY must be nighttravel'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '16101,16102,16103,16104,16105,16106,16107,16108,16109,16110,16111,16112,16113,16114,16115,16116')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '60', 10);
const idOf = (e) => (e && (e.itemId || e.id)) || (typeof e === 'string' ? e : null);
const idsOf = (arr) => (arr || []).map(idOf).filter(Boolean);

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'nighttravel-b', fullTelemetry: false });
  const fetchLines = [];
  try {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { const line = String(args[0] || ''); if (/fetch it/i.test(line) && fetchLines.length < 50) fetchLines.push({ day: (Game.state.scholar || {}).day || 0, line: line.slice(0, 300) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  } catch (e) {}
  await setupGame(Game);
  const vid = Game.villagerId;
  const defs = Game.data.items || [];
  const defOf = (id) => defs.find((d) => d.id === id) || null;
  const person = () => (typeof Game.getPerson === 'function' && vid) ? Game.getPerson(vid) : null;
  const spawnStash = idsOf((person() || {}).stashed || []);
  const spawnArmor = spawnStash.filter((id) => { const d = defOf(id); return d && d.armor; });
  const track = {};
  for (const item of spawnArmor) track[item] = { stashLost: null, firstKit: null, firstEq: null, prev: true };
  const snap = () => {
    const p = person();
    const sch = (Game.state || {}).scholar || {};
    return { stash: idsOf((p || {}).stashed || []), inv: idsOf(sch.inventory || []), eq: idsOf(Object.values(sch.equipped || {})) };
  };
  const observe = (gameDay) => {
    if (gameDay > 7) return;
    const s = snap();
    for (const item of spawnArmor) {
      const t = track[item];
      const has = s.stash.indexOf(item) >= 0;
      if (t.prev && !has && t.stashLost === null) t.stashLost = gameDay;
      t.prev = has;
      if (t.firstKit === null && (s.inv.indexOf(item) >= 0 || s.eq.indexOf(item) >= 0)) t.firstKit = gameDay;
      if (t.firstEq === null && s.eq.indexOf(item) >= 0) t.firstEq = gameDay;
    }
  };
  observe(0);
  let callIdx = 0;
  const wcStore = newStore();
  const base = withWoodcarry(nighttravel, wcStore);
  const wwStore = newWwStore();
  const warmed = withWoodwarm(base, wwStore);
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      if (callIdx > 1) observe((Game2.state.scholar || {}).day || 0);
      warmed.daily(Game2, ctx);
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  const verdicts = {};
  for (const item of spawnArmor) {
    const t = track[item];
    verdicts[item] = (t.stashLost !== null && t.firstEq !== null) ? 'WORN'
      : (t.stashLost !== null && t.firstKit !== null) ? 'FETCHED' : 'NO-GO';
  }
  console.log(JSON.stringify({ seed, spawnArmor, track, verdicts, fetchLines,
    daysAlive: result.days, endReason: result.endReason, maxWaveUnlocked: result.maxWaveUnlocked,
    villageLost: !!Game.villageLost }));
}

(async () => {
  for (const seed of SEEDS) await oneInstance(seed);
  console.log('VERDICT-DONE seeds=' + SEEDS.join(','));
})().catch((e) => { console.error('VERDICT CRASH', e && (e.stack || e)); process.exit(2); });
