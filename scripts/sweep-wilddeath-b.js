#!/usr/bin/env node
// sweep-wilddeath-b.js — fed-at-home "wild" death CAUSE INSTRUMENT
// (sim-wilddeath-cause-b, Loop B food-economy diagnosis arm).
//
// WHAT IT DOES: runs competent (or, for diagnostic reproduction only,
// a POLICY_FILE policy) seeds and records, for EVERY player death,
// the trace the tele string alone cannot give: the RAW playerDeath
// argument (before ledger.js's `cause || 'the wild'` fallback), the
// call stack (which call site ended the life), a death-moment
// snapshot (tile, haven-ness, kcal, health, sickness, live fight),
// the registerDeath record that produced the tele event (including
// double-death-guard no-ops), and the scholar's recent damage trail.
//
// WHAT IT DOES NOT DO: it changes nothing. Every wrapper delegates
// to the original function and only records. Zero src/js, zero
// policy edits, zero default flips. No guard policy, trip walk, or
// return walk is touched — the instrument only watches.
//
//   POLICY_FILE=<abs path to policy module, optional> POLICY_ID=<label>
//   SIDE=<label> SEEDS="62201,...,62208" DAYS=30 DEPOSITGATE=0
//     OUT=<path> node scripts/sweep-wilddeath-b.js
//
// POLICY_FILE contract: the module must export the policy object
// itself, or { competent } / { stepwalk }. When unset, the in-tree
// scripts/policies/competent.js policy is used. Diagnostic runs that
// load the held stepwalk policy do so from a /tmp extract, never
// from a file committed into this branch (see the prereg).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');

if (process.env.DEPOSITGATE !== '0') { console.error('FATAL: DEPOSITGATE=0 must be set explicitly'); process.exit(2); }
for (const g of ['COMPETENT_STANDING_HOME', 'COMPETENT_ROUTE_AROUND', 'COMPETENT_TRIPHOME_ROUTE_AROUND']) {
  if (process.env[g]) { console.error('FATAL: ' + g + ' must be unset'); process.exit(2); }
}
const SIDE = process.env.SIDE || 'control';
const POLICY_ID = process.env.POLICY_ID || 'competent';
const SEEDS = (process.env.SEEDS || '62201,62202,62203,62204,62205,62206,62207,62208')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
const OUT = process.env.OUT || ('/tmp/sim-wilddeath-b/sweep-' + SIDE + '.json');

function loadPolicy() {
  if (process.env.POLICY_FILE) {
    const mod = require(process.env.POLICY_FILE);
    return mod.stepwalk || mod.competent || mod.default || mod;
  }
  return require('./policies/competent').competent;
}
const POLICY = loadPolicy();

function scholarDay(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => (i.kcalEach || 0) * (i.units || 1) + t, 0); } catch (e) { return 0; }
}
function scholarKey(Game) {
  try { if (Game.villagerId) return String(Game.villagerId); const s = (Game.state || {}).scholar || {}; return String(s.name || s.id || ''); } catch (e) { return ''; }
}
function havenTile(Game) {
  try { const v = (Game.state || {}).village || {}; return { hx: (v.px === undefined ? 4 : v.px), hy: (v.py === undefined ? 4 : v.py) }; } catch (e) { return { hx: 4, hy: 4 }; }
}
function safe(fn, fallback) { try { const v = fn(); return (v === undefined ? fallback : v); } catch (e) { return fallback; } }

function fightSummary(Game) {
  try {
    const f = Game.tbfight || null;
    if (!f) return { live: false };
    const fighters = (f.fighters || []).map(o => ({
      kind: o.kind || null, villagerId: o.villagerId || null,
      monsterId: o.monsterId || (o.mdef && o.mdef.id) || null,
      name: o.name || null, alive: o.alive !== false, hp: (o.hp === undefined ? null : o.hp),
    }));
    return {
      live: true, betrayal: !!f.betrayal, tableTrial: !!f.tableTrial,
      coalitionArena: !!f.coalitionArena,
      arenaContest: !!((Game.state || {}).arenaContest),
      fighters,
    };
  } catch (e) { return { live: false, error: String(e.message || e) }; }
}

function deathSnapshot(Game) {
  const s = (Game.state || {}).scholar || {};
  const v = (Game.state || {}).village || {};
  const vid = scholarKey(Game);
  const px = safe(() => Game.map.px, null), py = safe(() => Game.map.py, null);
  let tileType = null;
  try { const row = (Game.map.tiles || [])[py]; tileType = row && row[px] ? (row[px].type || null) : null; } catch (e) {}
  return {
    day: scholarDay(Game), scholarKey: vid,
    tile: [px, py], tileType,
    departed: safe(() => !!Game.departed, null),
    insideHaven: (s.insideHaven === undefined ? null : !!s.insideHaven),
    atHaven: safe(() => (typeof Game.playerAtHaven === 'function' ? !!Game.playerAtHaven() : null), null),
    kcal: Math.round(s.kcal || 0),
    kcalCap: safe(() => (typeof Game.kcalCap === 'function' ? Math.round(Game.kcalCap()) : 2400), 2400),
    health: (s.health === undefined ? null : Math.round(s.health)),
    villageHealth: (v.health && v.health[vid] !== undefined ? Math.round(v.health[vid]) : null),
    sick: safe(() => { const rec = (v.sick || {})[vid]; return rec ? { name: rec.name || null, daysLeft: rec.daysLeft ?? null, severity: rec.severity ?? null } : null; }, null),
    fight: fightSummary(Game),
  };
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'wilddeath-b-' + POLICY_ID + '-' + SIDE, fullTelemetry: false });
  await setupGame(Game);
  const dayEnds = [];
  const sayLines = [];
  const deathCaptures = [];
  const regCaptures = [];
  const hurtTrail = [];

  const oSay = Game.say;
  if (typeof oSay === 'function') Game.say = function (msg) {
    try { sayLines.push({ d: scholarDay(Game), line: String(msg || '').slice(0, 300) }); if (sayLines.length > 200) sayLines.shift(); } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const oReg = Game.registerDeath;
  if (typeof oReg === 'function') Game.registerDeath = function (opts) {
    let ret = null, threw = null;
    try { ret = oReg.apply(this, arguments); } catch (e) { threw = String(e.message || e); throw e; }
    try {
      const o = opts || {};
      regCaptures.push({
        day: scholarDay(Game),
        kind: o.kind || null, villagerId: o.villagerId || null, monsterId: o.monsterId || null,
        name: o.name || null, mx: (o.mx === undefined ? null : o.mx), my: (o.my === undefined ? null : o.my),
        cause: (o.cause === undefined ? null : o.cause), killerId: o.killerId || null,
        witnesses: Array.isArray(o.witnesses) ? o.witnesses.slice(0, 8) : [],
        player: !!o.player, returnedNull: (ret === null || ret === undefined), threw,
      });
    } catch (e) {}
    return ret;
  };
  const oHurt = Game.hurtVillager;
  if (typeof oHurt === 'function') Game.hurtVillager = function (vid, dmg, cause, settlement, damageContext) {
    const r = oHurt.apply(this, arguments);
    try {
      const me = (vid === 'player' ? scholarKey(Game) : String(vid));
      if (me === scholarKey(Game)) {
        hurtTrail.push({ day: scholarDay(Game), dmg: dmg, cause: (cause === undefined ? null : cause), nonviolent: !!(damageContext && damageContext.nonviolent) });
        if (hurtTrail.length > 40) hurtTrail.shift();
      }
    } catch (e) {}
    return r;
  };
  const oPD = Game.playerDeath;
  if (typeof oPD === 'function') Game.playerDeath = function (cause) {
    let snap = null, stack = null;
    try { snap = deathSnapshot(Game); } catch (e) { snap = { error: String(e.message || e) }; }
    try {
      const st = (new Error('wilddeath-capture').stack || '').split('\n').slice(1, 12)
        .map(l => l.replace(/^.*\/worktrees\/[^/]+\//, '').replace(/^.*\/the-scattering\//, '').trim());
      stack = st;
    } catch (e) { stack = null; }
    try {
      deathCaptures.push({
        rawArg: (cause === undefined ? null : cause),
        stack, snap,
        sayTail: sayLines.slice(-30),
        hurtTail: hurtTrail.slice(-20),
      });
    } catch (e) {}
    return oPD.apply(this, arguments);
  };

  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  policy.daily = (G, c) => {
    const r = origDaily ? origDaily(G, c) : undefined;
    try {
      const { hx, hy } = havenTile(G);
      const s = (G.state || {}).scholar || {};
      const cap = (typeof G.kcalCap === 'function') ? G.kcalCap() : 2400;
      const away = !(G.map && G.map.px === hx && G.map.py === hy);
      dayEnds.push({
        d: scholarDay(G), tile: [G.map ? G.map.px : null, G.map ? G.map.py : null],
        away, kcal: Math.round(s.kcal || 0), frac: cap ? +((s.kcal || 0) / cap).toFixed(3) : null,
        pantryKcal: Math.round(pantryKcal(G)), scholarKey: scholarKey(G),
        health: (s.health === undefined ? null : Math.round(s.health)),
      });
    } catch (e) {}
    return r;
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;
  const pg = (() => { try { return Game.progState() || {}; } catch (e) { return {}; } })();
  const deaths = (result.samples && result.samples.deaths ? result.samples.deaths : []).map(d => {
    let player = false;
    try { player = !!d.player; } catch (e) {}
    return { day: d.day || 0, kind: d.kind || '?', who: String(d.who || '?').slice(0, 24), cause: String(d.cause || '?').slice(0, 40), player };
  });
  // Post-run recorded-cause join: fallen + corpse for each captured death.
  let fallen = [], corpses = [];
  try { fallen = ((Game.state.village || {}).fallen || []).map(f => ({ villagerId: f.villagerId || f.id || null, day: f.day || 0, cause: f.cause || null, name: f.name || null })); } catch (e) {}
  try {
    const list = (typeof Game.corpses === 'function' ? Game.corpses() : []) || [];
    corpses = list.map(c => ({ villagerId: c.villagerId || null, dayDied: c.dayDied || 0, cause: c.cause || null, mx: c.mx ?? null, my: c.my ?? null }));
  } catch (e) {}
  return {
    seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: !!Game.won, rank: (() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })(),
    nationalLive: !!((Game.state || {}).nationalLive), tableWaiting: !!pg.tableWaiting, tableEntered: !!pg.tableDone,
    arc: pg.arc || 1, maxWave: result.maxWaveUnlocked || 1,
    rosterEnd: (() => { try { return ((Game.state || {}).village || {}).roster.length; } catch (e) { return 0; } })(),
    pantryEnd: Math.round(pantryKcal(Game)),
    deaths, dayEnds, deathCaptures, regCaptures, hurtTrail, fallen, corpses,
    ms,
  };
}

async function main() {
  const rows = [];
  for (const seed of SEEDS) {
    const row = await oneRun(seed, DAYS);
    rows.push(row);
    const wild = row.deaths.filter(d => d.player && d.cause === 'the wild').length;
    console.log(`done seed=${seed} days=${row.days} end=${row.endReason} playerWildDeaths=${wild} captures=${row.deathCaptures.length} deaths=${row.deaths.length} won=${row.won} nat=${row.nationalLive} wave=${row.maxWave} (${row.ms}ms)`);
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ meta: { side: SIDE, policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { DEPOSITGATE: '0', COMPETENT_STANDING_HOME: 'unset', COMPETENT_ROUTE_AROUND: 'unset', COMPETENT_TRIPHOME_ROUTE_AROUND: 'unset' } }, rows }, null, 1));
  console.log('wrote ' + OUT);
}
if (require.main === module) main().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
module.exports = { POLICY_ID };
