#!/usr/bin/env node
// sweep-travel-r4-20261012.js — TRAVEL & REGIONAL lever r4 deep telemetry.
// 12 seeds (r3 set) x 200d, winseek. Extends the r3 baseline with:
//   - _regionStir bank/kinds weekly (engagement-deed cadence)
//   - foreign polity growth events (pair seeded / grew / stalled)
//   - link tribute economics: cumulative paid kcal, arrears, demands
//   - catchUpSim invocations (count + villages touched)
//   - representative loans (issued, returned, currently out)
//   - death-cause line
// Shard-friendly: SEEDS="1-6" OUT=scripts/sweep-travel-r4-deep-s1.json
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
const OUT = process.env.OUT || path.join(ROOT, 'scripts', 'sweep-travel-r4-deep.json');

function deepSample(Game, ctx, S) {
  let day = 0;
  try { day = (Game.state.scholar || {}).day || 0; } catch (e) {}
  let rank = '?';
  try { rank = Game.scaleRank ? Game.scaleRank() : '?'; } catch (e) {}
  if (day % 7 !== 0) return;
  if (S.weeklyDeep.length && S.weeklyDeep[S.weeklyDeep.length - 1].day === day) return;
  const links = (() => { try { return Game.hierarchyState ? Game.hierarchyState() : []; } catch (e) { return []; } })();
  let paidKcal = 0, arrears = 0, active = 0, maxTrust = 0;
  for (const l of links) {
    if (l.status !== 'active') continue;
    active++;
    paidKcal += (l.tributePaidKcal || 0);
    arrears += (l.arrears || 0);
    if ((l.trust || 0) > maxTrust) maxTrust = l.trust;
  }
  let fp = [];
  try { fp = Game.foreignPolities ? Game.foreignPolities() : []; } catch (e) {}
  const fpSizes = fp.map(f => 1 + ((f.subs || []).length));
  const fpsPrev = S._fpsPrev || [];
  const grew = fpSizes.length > fpsPrev.length || fpSizes.some((s, i) => s > (fpsPrev[i] || 0));
  S._fpsPrev = fpSizes.slice();
  let stir = 0, stirKinds = [];
  try { stir = Game.state._regionStir || 0; stirKinds = (Game.state._regionStirKinds || []).slice(); } catch (e) {}
  let loaned = null;
  try { const m = Game.mshipState ? Game.mshipState() : null; if (m && m.loaned && day < (m.loaned.untilDay || 0)) loaned = { to: m.loaned.to, vid: m.loaned.vid, until: m.loaned.untilDay }; } catch (e) {}
  S.weeklyDeep.push({ day, rank, stir, stirKinds, fp: fpSizes.slice(), fpGrew: grew, paidKcal, arrears, active, maxTrust, loaned });
}

const policy = Object.assign({}, winseek, {
  id: 'travelwinseek',
  daily(Game, ctx) {
    try { if (winseek.daily) winseek.daily(Game, ctx); } catch (e) {}
    try {
      if (!Game._travelDeep) {
        Game._travelDeep = { weeklyDeep: [], catchUp: { calls: 0, villages: {} }, loans: { issued: 0 }, sayLines: [] };
        const oc = Game.catchUpSim.bind(Game);
        Game.catchUpSim = function (v) {
          try {
            ctx.catchUp = ctx.catchUp || { calls: 0 };
            Game._travelDeep.catchUp.calls++;
            const id = v && v.id;
            if (id) Game._travelDeep.catchUp.villages[id] = (Game._travelDeep.catchUp.villages[id] || 0) + 1;
          } catch (e) {}
          return oc(v);
        };
        const oSay = Game.say.bind(Game);
        Game.say = function (m) {
          try {
            if (typeof m === 'string') {
              if (/walks out to sit at|walks out to serve/.test(m)) Game._travelDeep.loans.issued++;
              if (/first gesture|2,000 kcal walks|walks out to sit at|ink dries on its own/.test(m)) Game._travelDeep.gestures = (Game._travelDeep.gestures || 0) + 1;
              if (Game._travelDeep.sayLines.length < 4000) Game._travelDeep.sayLines.push(m);
            }
          } catch (e) {}
          return oSay(m);
        };
      }
      deepSample(Game, ctx, Game._travelDeep);
    } catch (e) {}
  },
});

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
      const D = Game._travelDeep || {};
      const over = (D.sayLines || []).filter(m => /scattering|No one is left|dies out|season ends|wiped out|village is gone/i.test(m));
      let natShape = null, natDay = null, globDay = null;
      for (const w of (D.weeklyDeep || [])) {
        if (w.rank === 'national' || w.rank === 'global') { if (natDay == null) natDay = w.day; }
        if (w.rank === 'global' && globDay == null) globDay = w.day;
      }
      try { const pn = Game.state.pendingNational; if (pn) natShape = (pn.led ? 'lead:' : '') + (pn.shape || '?'); } catch (e) {}
      row = {
        seed, days: res.days, gameDays: res.gameDays, endReason: res.endReason,
        deathLine: over.length ? over[over.length - 1].slice(0, 140) : null,
        natDay, natShape, globDay,
        catchUpCalls: (D.catchUp || {}).calls || 0,
        catchUpVillages: Object.keys((D.catchUp || {}).villages || {}),
        loansIssued: (D.loans || {}).issued || 0,
        gesturesPlayed: D.gestures || 0,
        weekly: D.weeklyDeep || [],
        ms: res.ms,
      };
    } catch (e) {
      row = { seed, error: String(e && e.message || e) };
    }
    row.msTotal = Date.now() - t0;
    rows.push(row);
    console.log(JSON.stringify({ seed, days: row.days, endReason: row.endReason, cu: row.catchUpCalls, loans: row.loansIssued, ms: row.msTotal }));
  }
  fs.writeFileSync(OUT, JSON.stringify({ when: new Date().toISOString(), days: DAYS, seeds: SEEDS, commit: commitSha(), rows }, null, 1));
  console.log('wrote ' + OUT + ' (' + rows.length + ' rows)');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
