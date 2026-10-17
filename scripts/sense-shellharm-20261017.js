#!/usr/bin/env node
// scripts/sense-shellharm-20261017.js — SENSE-TESTING LAW: read the death beats
// of the extra starvation cases (sim-shellharm-b).
//
// Picks the worst pairs (largest shell-control villager-starvation excess) from
// evidence/2026-10-17/perseed-shellharm/, re-runs those seeds (control + shell
// arms) capturing say-beats around starvation death days, and prints them.
// Question: do the beats read as the shelling taking food out of mouths, or as
// chaos?
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const SC = require('./policies/shellcounter');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';

const IN = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-shellharm');

async function capture(seed, policyId, arm, targetDays) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const policy = arm === 'shell'
    ? SC.withShellCounter(base, policyId + '+shellcounter', 'sense')
    : base;
  if (arm === 'shell') process.env.SHELLCOUNTER = '1'; else delete process.env.SHELLCOUNTER;
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false, narration: true });
  await setupGame(Game);
  // sim-harness stubs say/sysSay; re-attach capture AFTER (like sense-shellcounter did)
  const beats = [];
  Game.say = function (m) {
    try {
      const s = String((m && (m.text || m.msg || m.message)) || m);
      beats.push({ day: (Game.state.scholar || {}).day || 0, text: s.slice(0, 260) });
      if (beats.length > 4000) beats.splice(0, 500);
    } catch (e) {}
  };
  const deaths = [];
  const oTele = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    const r = oTele.apply(this, arguments);
    try {
      if (type === 'death' && /starv/i.test(String((data && data.cause) || '')))
        deaths.push({ day: (Game.state.scholar || {}).day || 0, who: data && data.who, player: !!(data && data.player) });
    } catch (e) {}
    return r;
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, sampleEvery: 30 }); });
  delete process.env.SHELLCOUNTER;
  const keep = new Set(targetDays);
  return beats.filter(b => keep.has(b.day) || /crack and pick|Put away|counter/i.test(b.text)).slice(-220);
}

(async () => {
  const files = fs.readdirSync(IN).filter(f => f.endsWith('.json'));
  const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(IN, f), 'utf8')));
  const by = {};
  for (const r of runs) by[`${r.policyId}:s${r.seed}:${r.arm}`] = r;
  const pairs = [];
  for (const r of runs.filter(x => x.arm === 'control')) {
    const s = by[`${r.policyId}:s${r.seed}:shell`];
    if (!s) continue;
    const excess = s.villagerStarvationDeaths - r.villagerStarvationDeaths;
    if (excess > 0) pairs.push({ policyId: r.policyId, seed: r.seed, excess, s, c: r });
  }
  pairs.sort((a, b) => b.excess - a.excess);
  const top = pairs.slice(0, 3);
  console.log('WORST PAIRS:', top.map(p => `${p.policyId} s${p.seed} excess=${p.excess}`).join('; '));
  for (const p of top) {
    for (const arm of ['control', 'shell']) {
      const run = arm === 'control' ? p.c : p.s;
      const days = (run.villStarvDeathList || []).map(d => d.day);
      const beats = await capture(p.seed, p.policyId, arm, days);
      console.log(`\n===== ${p.policyId} s${p.seed} ${arm} (vill-starv days: ${days.join(',')}) =====`);
      for (const b of beats) {
        if (/starv|hunger|nothing edible|no food|half ration|pantry is|went bad|put away|crack and pick|counter/i.test(b.text))
          console.log(`  d${b.day}: ${b.text}`);
      }
    }
  }
})().catch(e => { console.error('FAILED', e); process.exit(1); });
