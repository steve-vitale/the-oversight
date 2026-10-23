#!/usr/bin/env node
// sense-plentydepri-confirm-b.js — SENSE-TESTING transcript sampler
// (sim-plentydepri-confirm-b, 2026-10-23).
//
// SENSE-TESTING LAW (Steve 2026-10-11): testing must prove things SENSICAL,
// not just functional. This sampler runs 2 fresh armed seeds (100d,
// FEASTSCALE_R13=1/SEATDRIVE=0, PLENTYDEPRI=1), captures every Game.say line
// carrying the plenty-depri easing marker (🍽️), and writes them to a
// transcript file for human reading. A human (the assessor) then judges:
// does the easing voice still read honest on fresh seeds? Do villagers act
// like people — rotating speakers, named instead-of work, never idle,
// never a trim narrated as a cut?
//
// SEEDS="9209,9222" POLICY=leadfeast DAYS=100 OUT=<txt> node scripts/sense-plentydepri-confirm-b.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
if (process.env.PLENTYDEPRI !== '1') {
  console.error('FATAL: sense sampler requires PLENTYDEPRI=1 explicitly');
  process.exit(2);
}
const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SEEDS = (process.env.SEEDS || '9209,9222').split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const OUT = process.env.OUT || require('path').join(require('os').homedir(), 'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-plentydepri-confirm-b/sense-plentydepri-confirm-b.txt'); // NEVER /tmp (wiped mid-run 2026-10-23)

(async () => {
  const out = [];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'sense-plentydepri-' + POLICY_ID, fullTelemetry: false });
    await setupGame(Game);
    const lines = [];
    const oSay = Game.say;
    Game.say = function (s) { try { lines.push({ day: (Game.state.scholar || {}).day || 0, text: String(s) }); } catch (e) {} return oSay.apply(this, arguments); };
    await runDays(Game, POLICY, { days: DAYS, manifest: null });
    const marked = lines.filter(l => l.text.includes('🍽️'));
    out.push(`===== seed ${seed} (${POLICY_ID}, armed, ${DAYS}d) =====`);
    out.push(`say lines total: ${lines.length}; easing-voice lines: ${marked.length}`);
    const byDay = {};
    for (const m of marked) { (byDay[m.day] = byDay[m.day] || []).push(m.text); }
    for (const d of Object.keys(byDay).sort((a, b) => a - b)) {
      for (const t of byDay[d]) out.push(`d${d}: ${t}`);
    }
    // speaker rotation + line variety stats
    const speakers = new Set(marked.map(m => m.text.replace(/^🍽️\s*/, '').split(' ')[0]));
    const texts = marked.map(m => m.text);
    const repeats = texts.filter((t, i) => texts.indexOf(t) !== i).length;
    out.push(`speakers: ${[...speakers].join(', ')} (${speakers.size} distinct)`);
    out.push(`exact-repeat lines: ${repeats}/${marked.length}`);
    out.push('');
  }
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, out.join('\n') + '\n');
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
