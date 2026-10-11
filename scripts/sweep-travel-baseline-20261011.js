#!/usr/bin/env node
// sweep-travel-baseline-20261011.js — TRAVEL & REGIONAL lever baseline sweep.
// 12+ seeds, 200-day horizon, winseek policy (courts villages, pays tribute,
// answers beats). Measures the scale ladder as a TRAJECTORY, not an end state:
//   - firstContact day (first rumored / first generated village)
//   - scaleRank transitions with days (village->regional->national->global)
//   - national road (which shape of the six) + day
//   - foreignPolities(): does any reach 4-realm? how fast? drift vs engaged
//   - havenViewership() progression (weekly trace)
//   - link/courtship mechanics: proposals, counters, accepts, declines
//   - survival, wave deed bars, table, won
// Shard-friendly: SEEDS="1-6" OUT=scripts/sweep-travel-s1.json
//   DAYS=200 node scripts/sweep-travel-baseline-20261011.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, manifest } = require('./sim-harness');
const { winseek } = require('./policies/winseek');

const DAYS = parseInt(process.env.DAYS || '200', 10);
const SEEDS = (() => {
  const s = process.env.SEEDS || '1-12';
  if (s.indexOf('-') >= 0) {
    const [a, b] = s.split('-').map(x => parseInt(x, 10));
    const out = []; for (let i = a; i <= b; i++) out.push(i); return out;
  }
  return s.split(',').map(x => parseInt(x, 10));
})();
const OUT = process.env.OUT || path.join(ROOT, 'scripts', 'sweep-travel-baseline.json');

function blankScale() {
  return {
    firstRumored: null, firstGenerated: null, rankTrace: [], natDay: null, natShape: null,
    globDay: null, lastRank: null, firstLinkDay: null,
    weekly: [], // {day, vw, fpMax, fpN, links, maxTrust, subCount, peerCount, fpMaxName}
    proposed: 0, proposedPeer: 0, counterAccepted: 0, tributePaid: 0, nationalAnswered: 0,
  };
}

function scaleSample(Game, ctx) {
  if (!Game._travelScale) Game._travelScale = blankScale();
  const S = Game._travelScale;
  // copy courtship counters winseek kept in ctx (runDays doesn't return ctx)
  for (const k of ['proposed', 'proposedPeer', 'counterAccepted', 'tributePaid', 'nationalAnswered', 'beatsAnswered', 'demandsAnswered'])
    if (ctx[k] != null) S[k] = ctx[k];
  let day = 0;
  try { day = (Game.state.scholar || {}).day || 0; } catch (e) {}
  const ovs = (() => { try { return Game.state.otherVillages || []; } catch (e) { return []; } })();
  if (S.firstRumored == null) { for (const ov of ovs) { if (ov.rumored) { S.firstRumored = day; break; } } }
  if (S.firstGenerated == null) { for (const ov of ovs) { if (ov.generated) { S.firstGenerated = day; break; } } }
  let rank = '?';
  try { rank = Game.scaleRank ? Game.scaleRank() : '?'; } catch (e) {}
  if (S.lastRank === null) { S.lastRank = rank; S.rankTrace.push([day, rank]); }
  else if (rank !== S.lastRank) { S.lastRank = rank; S.rankTrace.push([day, rank]); }
  let pn = null; try { pn = Game.state.pendingNational; } catch (e) {}
  if (pn && S.natShape == null) { S.natShape = (pn.led ? 'lead:' : '') + (pn.shape || '?'); }
  let natLive = false, globLive = false;
  try { natLive = !!(Game.state.nationalLive || rank === 'national' || rank === 'global'); } catch (e) {}
  try { globLive = !!(Game.state.globalLive || rank === 'global'); } catch (e) {}
  if (natLive && S.natDay == null) S.natDay = day;
  if (globLive && S.globDay == null) S.globDay = day;
  if (S.firstLinkDay == null && natLive) { /* national implies link; fine */ }
  if (day % 7 === 0 && (!S.weekly.length || S.weekly[S.weekly.length - 1].day !== day)) {
    let fpMax = 0, fpN = 0, fpMaxName = null;
    try {
      const fps = Game.foreignPolities ? Game.foreignPolities() : [];
      fpN = fps.length;
      for (const f of fps) { const sz = 1 + ((f.subs || []).length); if (sz > fpMax) { fpMax = sz; fpMaxName = f.primary || null; } }
    } catch (e) {}
    let vw = null; try { vw = Game.havenViewership ? Game.havenViewership() : null; } catch (e) {}
    let links = 0, maxTrust = 0, subCount = 0, peerCount = 0;
    try {
      const hs = Game.hierarchyState ? Game.hierarchyState() : [];
      for (const l of hs) {
        if (l.status !== 'active') continue;
        links++;
        if (S.firstLinkDay == null) S.firstLinkDay = day;
        if ((l.trust || 0) > maxTrust) maxTrust = l.trust;
        if (l.subordinate === 'haven') subCount++;
        if (l.kind) peerCount++;
      }
    } catch (e) {}
    S.weekly.push({ day, vw: vw == null ? null : +vw.toFixed(1), fpMax, fpN, fpMaxName, links, maxTrust, subCount, peerCount });
  }
}

const policy = Object.assign({}, winseek, {
  id: 'travelwinseek',
  daily(Game, ctx) {
    try { if (winseek.daily) winseek.daily(Game, ctx); } catch (e) {}
    try { scaleSample(Game, ctx); } catch (e) {}
  },
});

function endSnap(Game) {
  const out = { rank: '?', table: false, won: false, day: 0, w: [0, 0, 0, 0, 0], gate: false, maxWave: 1 };
  try { out.rank = Game.scaleRank ? Game.scaleRank() : '?'; } catch (e) {}
  try { out.day = (Game.state.scholar || {}).day || 0; } catch (e) {}
  try { out.won = !!Game.won; } catch (e) {}
  try {
    const pg = Game.progState ? Game.progState() : {};
    out.table = !!(pg.tableWaiting || pg.tableDone);
    const g = Game.deedGateReady ? Game.deedGateReady() : null;
    if (g) { out.w = [g.w1, g.w2, g.w3, g.w4, g.w5]; out.gate = !!g.ok; }
  } catch (e) {}
  try { out.maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  return out;
}

function commitSha() {
  try { return require('child_process').execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim(); } catch (e) { return '?'; }
}

async function main() {
  const rows = [];
  for (const seed of SEEDS) {
    const t0 = Date.now();
    let row;
    try {
      const { Game, manifest: mf } = await loadGame({ seed, mode: 'travelwinseek', fullTelemetry: false });
      await setupGame(Game);
      const res = await runDays(Game, policy, { days: DAYS, manifest: mf });
      row = {
        seed, days: res.days, gameDays: res.gameDays, endReason: res.endReason,
        scale: Game._travelScale || null,
        end: endSnap(Game), ms: res.ms,
      };
    } catch (e) {
      row = { seed, error: String(e && e.message || e) };
    }
    row.msTotal = Date.now() - t0;
    rows.push(row);
    console.log(JSON.stringify({
      seed, days: row.days, endReason: row.endReason, rank: row.end && row.end.rank,
      fr: row.scale && row.scale.firstRumored, reg: row.scale && row.scale.rankTrace, ms: row.msTotal,
    }));
  }
  fs.writeFileSync(OUT, JSON.stringify({ when: new Date().toISOString(), days: DAYS, seeds: SEEDS, commit: commitSha(), rows }, null, 1));
  console.log('wrote ' + OUT + ' (' + rows.length + ' rows)');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
