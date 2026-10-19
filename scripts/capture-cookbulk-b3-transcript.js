#!/usr/bin/env node
// scripts/capture-cookbulk-b3-transcript.js — sense-test transcript capture.
//
// Captures the engine's voiced fiction (G.say + G.sysSay restored via
// narration:true — the harness stubs sysSay to no-op by default, lesson (a))
// for one armed run, so a human can read what the village actually did and
// said around the batch-cooking.
//
// Usage:
//   SEED=94101 POLICY=leadfeast DAYS=60 node scripts/capture-cookbulk-b3-transcript.js
// Writes: evidence/2026-10-19/sense-cookbulk-b3-<policy>-s<seed>.txt
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const CB3 = require('./policies/cookbulk-b3');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '94101', 10);
const POLICY = process.env.POLICY || 'leadfeast';
const DAYS = parseInt(process.env.DAYS || '60', 10);
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-19',
  `sense-cookbulk-b3-${POLICY}-s${SEED}.txt`);

const COOK_RE = /cook|batch|pot|cistern|water|ration|fire|bean|rice|stove|hearth/i;

(async () => {
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  process.env.COOKBULK_B3 = '1';
  const base = POLICY === 'leadfeast' ? leadfeast : belongfeast;
  const policy = CB3.withCookBulkB3(base, `${POLICY}+cookbulk-b3`, 'sense');
  const { Game } = await loadGame({ seed: SEED, mode: 'leanwinter', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const lines = [];
  const dayOf = () => { try { return Game.state.scholar.day | 0; } catch (e) { return -1; } };
  const cap = (who, m) => {
    const s = String(m == null ? '' : m);
    lines.push(`[d${dayOf()} ${who}] ${s}`);
    if (lines.length > 20000) lines.shift();
  };
  const oSay = Game.say.bind(Game);
  Game.say = (m) => { try { cap('say', m); } catch (e) {} return oSay(m); };
  const oSys = Game.sysSay.bind(Game);
  Game.sysSay = (m) => { try { cap('sys', m); } catch (e) {} return oSys(m); };
  const oDaily = policy.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) { r = undefined; } }
    try {
      if (ctx && (ctx._cb3CookDays || 0) > (policy._lastCookDays || 0)) {
        policy._lastCookDays = ctx._cb3CookDays;
        cap('layer', `BATCH-DAY: cookedKcal=${Math.round(ctx._cb3CookedKcal || 0)} waterDrawnL=${ctx._cb3WaterDrawnL || 0}`);
      }
    } catch (e) {}
    return r;
  };
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  const cooking = lines.filter(l => COOK_RE.test(l));
  const header = [
    `# sense transcript — sim-cookbulk-b3, ${POLICY} s${SEED}, ${DAYS}d, COOKBULK_B3=1`,
    `# ${lines.length} voiced lines total; ${cooking.length} match the cooking/water filter.`,
    `# Full stream first, filtered cooking/water stream after the ===== marker.`,
    '',
  ].join('\n');
  fs.writeFileSync(OUT, header + lines.join('\n') + '\n\n===== COOKING/WATER FILTERED =====\n\n' + cooking.join('\n') + '\n');
  console.log(`wrote ${OUT} (${lines.length} lines, ${cooking.length} cooking/water)`);
})().catch(e => { console.error('CAPTURE CRASHED', e); process.exit(2); });
