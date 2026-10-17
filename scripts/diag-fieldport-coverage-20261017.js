#!/usr/bin/env node
// diag-fieldport-coverage-20261017.js — diagnostic: why 0 audit/editor port
// fights on the vetrel substrate? Tallies every Game.fieldFight call by
// monster id + wave, plus wave-unlock days, on one wave-4-reaching seed.
//
// Usage: REPO=<tree> SEED=3906 POLICY=vetrel-lead node scripts/diag-fieldport-coverage-20261017.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { vetrelLead, vetrelBelong } = require(path.join(REPO, 'scripts', 'policies', 'vetrel'));

const SEED = parseInt(process.env.SEED || '3906', 10);
const POLICY = process.env.POLICY || 'vetrel-lead';
const DAYS = parseInt(process.env.DAYS || '180', 10);

(async () => {
  process.env.VETREL = '1';
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  const policy = POLICY === 'vetrel-lead' ? vetrelLead : vetrelBelong;
  const { Game } = await loadGame({ seed: SEED, mode: 'diag', fullTelemetry: false });
  await setupGame(Game);

  const tally = {};
  let total = 0;
  const _ff = Game.fieldFight.bind(Game);
  Game.fieldFight = function (vid, mdef, m, opts) {
    total++;
    try {
      const id = (mdef && mdef.id) || '?';
      tally[id] = (tally[id] || 0) + 1;
    } catch (e) {}
    return _ff(vid, mdef, m, opts);
  };

  const waveDay = {};
  const _uw = Game.unlockedWave ? Game.unlockedWave.bind(Game) : null;
  const baseDaily = policy.daily;
  const wrapped = Object.assign({}, policy, {
    daily(G, ctx) {
      try {
        const w = _uw ? _uw() : 1;
        for (let k = 2; k <= 5; k++) if (w >= k && !waveDay[k]) waveDay[k] = (G.state.scholar || {}).day || 0;
      } catch (e) {}
      if (baseDaily) return baseDaily(G, ctx);
    },
  });

  const result = await quietLog(async () => runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }));
  Game.fieldFight = _ff;
  const byId = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  console.log(`seed=${SEED} policy=${POLICY} days=${result.days} end=${result.endReason} totalFieldFights=${total}`);
  console.log('wave unlock days: ' + JSON.stringify(waveDay));
  console.log('field fights by monster id (top 25):');
  for (const [id, n] of byId.slice(0, 25)) console.log(`  ${id}: ${n}`);
  const w45 = byId.filter(([id]) => true);
  const waveOf = {};
  try { for (const m of (Game.data.monsters || [])) waveOf[m.id] = m.wave || 1; } catch (e) {}
  const w4fights = byId.filter(([id]) => (waveOf[id] || 0) >= 4).reduce((s, [, n]) => s + n, 0);
  console.log(`wave-4+ field fights: ${w4fights}`);
})().catch(e => { console.error('DIAG CRASH:', e); process.exit(1); });
