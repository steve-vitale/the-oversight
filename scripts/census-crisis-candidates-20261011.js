#!/usr/bin/env node
// census-crisis-candidates-20261011.js — measure fire rates for the two
// crisis-kind candidates (win-path lever 10, 2026-10-11).
// Candidate 1: 'the-siege' — raid crisis (crisis.raiders) resolved 'fought'.
// Candidate 2: 'the-fever' — a villager (not the player) dies with cause 'sickness'.
// Instruments via monkey-patched counters ONLY (no game-code change).
// Same seeds/policies/days as the winpath baseline so results are comparable.
// Usage: SEEDS="1-16" POLICIES="competent,winseek" DAYS=200 OUT=/tmp/cc.json node scripts/census-crisis-candidates-20261011.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { winseek } = require('./policies/winseek');
const POLICIES = { competent, winseek };

function parseSeeds(s) {
  const out = [];
  for (const part of String(s || '1-8').split(',')) {
    const m = part.trim().match(/^(\d+)-(\d+)$/);
    if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.push(i); }
    else if (part.trim() !== '') out.push(+part.trim());
  }
  return out;
}

(async () => {
  const seeds = parseSeeds(process.env.SEEDS || '1-8');
  const policyIds = String(process.env.POLICIES || 'competent,winseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '200', 10);
  const OUT = process.env.OUT || '/tmp/crisis-candidates.json';
  const rows = [];
  const t0 = Date.now();
  let n = 0;
  for (const pid of policyIds) {
    const base = POLICIES[pid];
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: pid });
      await setupGame(Game);
      const cnt = { raidFires: 0, raidFought: 0, raidMovedOn: 0, raidOther: 0, vilSickDeaths: 0, crisesFired: [] };
      // instrument
      const _raid = Game.havenRaidTick;
      if (_raid) Game.havenRaidTick = function () {
        const r = _raid.apply(this, arguments);
        if (r === true) cnt.raidFires++;
        return r;
      };
      const _res = Game.resolveAidCrisis;
      if (_res) Game.resolveAidCrisis = function (how) {
        try {
          const c = this.aidCrisis ? this.aidCrisis() : null;
          if (c && c.raiders) {
            if (how === 'fought') cnt.raidFought++;
            else if (how === 'moved-on') cnt.raidMovedOn++;
            else cnt.raidOther++;
          }
        } catch (e) {}
        return _res.apply(this, arguments);
      };
      const _rd = Game.registerDeath;
      if (_rd) Game.registerDeath = function (opts) {
        try {
          opts = opts || {};
          if ((opts.kind === 'villager' || opts.kind === 'person') && opts.villagerId &&
              opts.villagerId !== this.villagerId && opts.cause === 'sickness') {
            cnt.vilSickDeaths++;
          }
        } catch (e) {}
        return _rd.apply(this, arguments);
      };
      const _fc = Game.fireCrisis;
      if (_fc) Game.fireCrisis = function (kind, ctx) {
        const r = _fc.apply(this, arguments);
        if (r === true) cnt.crisesFired.push(kind);
        return r;
      };
      await runDays(Game, base, { days });
      const day = ((Game.state || {}).scholar || {}).day || 0;
      const pg = (Game.progState ? Game.progState() : {}) || {};
      rows.push(Object.assign({ seed, policy: pid, days: day, crises: Object.keys(pg.crises || {}) }, cnt));
      n++;
      console.log(`[${n} ${((Date.now() - t0) / 1000).toFixed(0)}s] ${pid} seed=${seed} d${day} raids=${cnt.raidFires} siege-eligible(fought)=${cnt.raidFought} movedOn=${cnt.raidMovedOn} vilSickDeaths=${cnt.vilSickDeaths} crises=[${cnt.crisesFired.join(',')}]`);
    }
  }
  fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));
  const F = (f) => rows.filter(f).length;
  console.log('== CANDIDATE CENSUS (n=' + rows.length + ') ==');
  console.log('raids fired: ' + rows.reduce((t, r) => t + r.raidFires, 0) + ' | runs with >=1 raid: ' + F(r => r.raidFires > 0));
  console.log('the-siege eligible (raid+fought): ' + F(r => r.raidFought > 0) + ' runs');
  console.log('raids moved-on: ' + F(r => r.raidMovedOn > 0) + ' runs');
  console.log('the-fever eligible (villager sickness death): ' + F(r => r.vilSickDeaths > 0) + ' runs, total deaths ' + rows.reduce((t, r) => t + r.vilSickDeaths, 0));
  const ck = {};
  for (const r of rows) for (const k of r.crisesFired) ck[k] = (ck[k] || 0) + 1;
  console.log('crisis kind fire counts: ' + JSON.stringify(ck));
  console.log('runs with crisesN>=2: ' + F(r => r.crises.length >= 2));
  console.log('wrote ' + OUT);
})();
