#!/usr/bin/env node
// scripts/sense-plentycap-20261015.js — SENSE-TEST the deferral/cap beats
// and unlock moments per variant. Replays a deterministic seed/policy from
// the sweep (same harness, same seeds) with beat capture, then dumps the
// System deferral/cap beats and the release beats around wave-4/5 unlocks
// for human reading.
//   VARIANT=control|faced-only|cap-only SEED=11 POLICY=leadfeast DAYS=180 \
//     node scripts/sense-plentycap-20261015.js
// Killed-arm INFO-SKIP: unknown variant or absent env reader -> INFO-SKIP,
// exit 0.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongfeast, leadfeast } = require('./policies/feastscale');

const VARIANT = process.env.VARIANT || 'control';
const ENV_FOR = { control: 'both', 'faced-only': 'faced-only', 'cap-only': 'cap-only' };
const SEED = parseInt(process.env.SEED || '11', 10);
const POLICY = process.env.POLICY || 'leadfeast';
const DAYS = parseInt(process.env.DAYS || '180', 10);

(async () => {
  if (!ENV_FOR[VARIANT]) { console.log(`INFO-SKIP: unknown variant ${VARIANT} — exit 0`); process.exit(0); }
  process.env.STANDING_VARIANT = ENV_FOR[VARIANT];
  const base = POLICY === 'belongfeast' ? belongfeast : leadfeast;
  const { Game } = await loadGame({ seed: SEED, mode: `sense-plentycap-${VARIANT}-${POLICY}` });
  await quietLog(async () => { await setupGame(Game); });
  if (typeof Game._standingVariant !== 'function') { console.log('INFO-SKIP: no env reader (arm killed) — exit 0'); process.exit(0); }
  const beats = [];
  const origSysSay = Game.sysSay;
  const stamp = () => { try { return 'd' + ((Game.state.scholar || {}).day || 0); } catch (e) { return 'd?'; } };
  Game.sysSay = function (t) { try { beats.push({ day: stamp(), kind: 'sys', text: String(t).slice(0, 700) }); } catch (e) {} if (origSysSay) return origSysSay.call(Game, t); };
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  const waves = [];
  const stLines = {};
  policy.daily = (G, ctx) => {
    try {
      const d = ((G.state.scholar || {}).day || 0);
      waves.push([d, (typeof G.unlockedWave === 'function') ? (G.unlockedWave() | 0) : 1]);
      if (typeof G.standingLine === 'function') stLines[d] = G.standingLine().slice(0, 260);
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 }); });
  let wave4Day = null, wave5Day = null;
  for (const [d, w] of waves) { if (w >= 4 && wave4Day == null) wave4Day = d; if (w >= 5 && wave5Day == null) wave5Day = d; }
  console.log(`run: ${VARIANT}/${POLICY}/s${SEED} days=${result.days} ${result.endReason} wave4=${wave4Day} wave5=${wave5Day}`);
  console.log(`\n--- deferral / cap beats (sys) ---`);
  let n = 0;
  for (const b of beats) {
    if (b.kind !== 'sys') continue;
    if (/Mirror Draft|fifth draft|bread alone|not for strangers|stand on the grid|Producers will take notice|RATINGS ARE UP/i.test(b.text)) {
      console.log(`[${b.day}] ${b.text}`);
      if (++n >= 14) { console.log('(...truncated)'); break; }
    }
  }
  if (!n) console.log('(no deferral/cap/release beats fired)');
  console.log(`\n--- standingLine around the first unlock ---`);
  const anchor = wave5Day != null ? wave5Day : wave4Day;
  if (anchor != null) {
    for (let d = Math.max(0, anchor - 20); d <= anchor; d += 10) {
      if (stLines[d]) console.log(`[d${d}] ${stLines[d]}`);
    }
  } else console.log('(no wave-4/5 unlock in this run)');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
