#!/usr/bin/env node
// scripts/capture-villgate-20261013.js — count objHealGate firings and sample
// its narration (after-code only). Wraps Game.say for 🩹 lines and the
// villagerHealCheck to count verdicts, on the standard 8-run pilot suite.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');

async function main() {
  const seeds = [11, 22, 33, 44];
  const policies = { belongseek, leadcourt };
  const totals = { gateChecks: 0, cleared: 0, satOut: 0, patched: 0, pharmacy: 0, leaveNoSit: 0 };
  const samples = { satOut: [], patched: [], leave: [] };
  for (const pid of Object.keys(policies)) {
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'villgate-cap-' + pid });
      await setupGame(Game);
      const origSay = Game.say.bind(Game);
      Game.say = function (msg) {
        try {
          const t = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
          if (/🩹/.test(t)) {
            const day = (Game.state.scholar || {}).day || 0;
            const rec = { day, policy: pid, seed, line: t.slice(0, 220) };
            if (/rest today/.test(t) && samples.satOut.length < 6) samples.satOut.push(rec);
            else if (/leaving anyway/.test(t) && samples.leave.length < 4) samples.leave.push(rec);
            else if (samples.patched.length < 6) samples.patched.push(rec);
          }
        } catch (e) {}
        return origSay(msg);
      };
      const origGate = Game.objHealGate.bind(Game);
      Game.objHealGate = function (vid, obj, hx, hy, pah) {
        totals.gateChecks++;
        const before = Object.assign({}, (Game.state.village || {}).health || {});
        const r = origGate(vid, obj, hx, hy, pah);
        const g = ((Game.state.village || {}).hurtGate || {})[vid] || {};
        if (g.satOut) totals.satOut++;
        else {
          totals.cleared++;
          if ((obj && obj.kind === 'LEAVE') && (before[vid] || 100) < 70) totals.leaveNoSit++;
          const after = ((Game.state.village || {}).health || {})[vid];
          if ((before[vid] || 100) < 70 && after > before[vid]) {
            totals.patched++;
          }
        }
        return r;
      };
      await quietLog(async () => { await runDays(Game, policies[pid], { days: 150, sampleEvery: 10 }); });
    }
  }
  console.log('GATE FIRINGS: ' + JSON.stringify(totals));
  console.log('\n--- sit-out samples ---');
  for (const s of samples.satOut) console.log(`[d${s.day} ${s.policy}s${s.seed}] ${s.line}`);
  console.log('\n--- patch-up samples ---');
  for (const s of samples.patched) console.log(`[d${s.day} ${s.policy}s${s.seed}] ${s.line}`);
  console.log('\n--- leave/no-sit-out samples ---');
  for (const s of samples.leave) console.log(`[d${s.day} ${s.policy}s${s.seed}] ${s.line}`);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
