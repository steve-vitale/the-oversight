#!/usr/bin/env node
// scripts/diag-compvet-funnel-20261018.js — DIAGNOSTIC (not evidence).
// Quantify the wave-3 kill funnel on vetrel control. File output only
// (quietLog swallows console during the day loop).
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { vetrelLead } = require('./policies/vetrel');

const SEEDS = (process.env.SEEDS || '51904,51905').split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = '/tmp/compvet-funnel.jsonl';

function baseEnv() {
  delete process.env.COMPVET;
  process.env.VETREL = '1';
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  process.env.TRIBFLOOR = '1';
  process.env.SUCCGRACE = '1';
  process.env.RAIDDENSITY = '1';
}
const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const log = (o) => { try { fs.appendFileSync(OUT, JSON.stringify(o) + '\n'); } catch (e) {} };

async function runOne(policy, seed, days) {
  baseEnv();
  const { Game } = await loadGame({ seed, mode: 'compvet-diag-' + policy.id });
  await setupGame(Game);
  const snap = {};
  const fightShapes = [];
  let origEnd = null;
  try {
    origEnd = Game.tbEnd;
    Game.tbEnd = function (result, ...rest) {
      try {
        const f = Game.tbfight;
        if (f && !f.over) {
          const w3 = (f.fighters || []).filter(x => x && x.kind === 'monster' && x.mdef && (x.mdef.wave || 1) === 3);
          if (w3.length) {
            const comps = (f.fighters || []).filter(x => x && (x.kind === 'villager' || x.kind === 'ally') && x.villagerId);
            fightShapes.push({
              d: dayOf(Game), result, rounds: f.round || 0,
              compEngaged: comps.filter(c => c.alive && !c.fled).length,
              compFled: comps.filter(c => c.fled).length,
              compDead: comps.filter(c => !c.alive).length,
              compDealt: Math.round(comps.reduce((t, c) => t + (c._dealt || 0), 0)),
              w3dead: w3.filter(m => !m.alive).length, w3total: w3.length,
              w3hp0: Math.round((w3[0] || {}).maxHp || 0),
              rallyUsed: !!f.rallyUsed,
            });
          }
        }
      } catch (e) {}
      return origEnd.apply(this, [result, ...rest]);
    };
  } catch (e) {}
  const wrapped = Object.assign({}, policy, {
    daily(G, ctx) {
      if (policy.daily) { try { policy.daily(G, ctx); } catch (e) {} }
      try {
        for (const k of ['vetHunts', 'vetHuntFights', 'vetYields', 'vetBreakoffs',
                         'vetRescues', 'vetInvitesOk', 'vetHuntEngaged']) {
          if (ctx[k] != null) snap[k] = ctx[k];
        }
      } catch (e) {}
    },
  });
  await quietLog(async () => runDays(Game, wrapped, { days }));
  try { if (origEnd) Game.tbEnd = origEnd; } catch (e) {}
  const wlog = Game.state.waveKillLog || [];
  const w3 = wlog.filter(e => e && (e.w | 0) === 3);
  const byChannel = {};
  for (const e of w3) byChannel[e.via || '?'] = (byChannel[e.via || '?'] || 0) + 1;
  log({
    seed, policy: policy.id, days: dayOf(Game),
    w3fights: fightShapes.length,
    w3kills: w3.length, byChannel,
    compKills: w3.filter(e => e.via === 'companion').length,
    scholarKills: w3.filter(e => e.via === 'player').length,
    compKillDays: w3.filter(e => e.via === 'companion').map(e => e.d),
    snap, fightShapes,
  });
}

async function main() {
  try { fs.unlinkSync(OUT); } catch (e) {}
  for (const seed of SEEDS) {
    log({ progress: 'start', seed });
    try { await runOne(vetrelLead, seed, DAYS); }
    catch (e) { log({ progress: 'error', seed, error: String(e && e.message).slice(0, 200) }); }
    log({ progress: 'done', seed });
  }
}
main().catch(e => { log({ progress: 'crash', error: String(e && e.stack || e).slice(0, 300) }); process.exit(2); });
