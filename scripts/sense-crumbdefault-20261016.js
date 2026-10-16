#!/usr/bin/env node
// scripts/sense-crumbdefault-20261016.js — sense beats for sim-crumbdefault-b.
// Runs a short run on the CURRENT game.js, captures say() lines with day
// stamps, and prints the hungry-night beats where the mechanism matters:
//   control: days with crumbs-left starvations (the ruled-on bug, narrated).
//   armed:   days with whole-piece crumb takes (the fix, as people eating).
// Usage:
//   SEATDRIVE=0 SIDE=control SEED=3101 POLICY=leadcourt DAYS=60 node scripts/sense-crumbdefault-20261016.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installShareCensus, classify } = require('./sharcensus-20261014');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

async function main() {
  const side = process.env.SIDE || 'control';
  const seed = parseInt(process.env.SEED || '3101', 10);
  const pid = process.env.POLICY || 'leadcourt';
  const days = parseInt(process.env.DAYS || '60', 10);
  const base = pid === 'leadcourt' ? leadcourt : belongseek;
  const { Game } = await loadGame({ seed, mode: 'crumbdefault-sense-' + side, fullTelemetry: false });
  await setupGame(Game);
  const sayLines = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try { sayLines.push({ day: (Game.state.scholar || {}).day || 0, text: String(t).slice(0, 220) }); } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const cen = installShareCensus(Game);
  const oDraw = Game.pantryDraw;
  let crumbDays = {};
  Game.pantryDraw = function (v, want, opts) {
    const out = oDraw.apply(this, arguments);
    if (opts && opts.round === 'floor1' && out && out.items) {
      // Bit-identical replay of the engine's need chain (same operands, same
      // order) — matches the engine's floor() exactly, no epsilon drift.
      let need = want, fired = false;
      for (let i = 0; i < out.items.length; i++) {
        const it = out.items[i];
        const ek = it.effectiveKcal || 1;
        const needBefore = need;
        if (i > 0 && needBefore > 0 && Math.floor(needBefore / ek) === 0 && (it.units || 0) >= 1) fired = true;
        need -= (it.units || 0) * ek;
      }
      if (fired) { const d = (Game.state.scholar || {}).day || 0; crumbDays[d] = (crumbDays[d] || 0) + 1; }
    }
    return out;
  };
  const policy = Object.assign({}, base);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  Game.pantryDraw = oDraw; Game.say = oSay;
  const rows = cen.rows.map(r => ({ ...r, ...(classify(r)) }));
  cen.uninstall();
  console.log(`=== sense ${side} | ${pid} s${seed} | ${result.days}d ===`);
  if (side === 'control') {
    const cl = rows.filter(r => r.starved && r.starvePath === 'crumbs-left');
    console.log(`crumbs-left starved meal-days: ${cl.length}`);
    for (const r of cl.slice(0, 6)) {
      const nm = String(r.name || r.vid).split(' ')[0];
      console.log(`\n  d${r.day} ${nm}: ate ${Math.round(r.ate)}/${Math.round(r.need)} (drew ${Math.round(r.drew)}), pantry fresh after: ${Math.round(r.pantryFreshAfter)} kcal — CRUMBS LEFT, went hungry`);
      for (const s of sayLines.filter(s => s.day === r.day).slice(0, 4)) console.log(`    [say d${s.day}] ${s.text}`);
    }
    if (!cl.length) {
      const any = rows.filter(r => r.starved).slice(0, 3);
      console.log('  (no crumbs-left starvations; nearest starved rows:)');
      for (const r of any) console.log(`  d${r.day} ${String(r.name || r.vid).split(' ')[0]}: ate ${Math.round(r.ate)}/${Math.round(r.need)} path=${r.starvePath}`);
    }
  } else {
    const ds = Object.keys(crumbDays).map(Number).sort((a, b) => a - b);
    console.log(`days with whole-piece crumb takes: ${ds.length} (total takes: ${Object.values(crumbDays).reduce((a, b) => a + b, 0)})`);
    for (const d of ds.slice(0, 6)) {
      console.log(`\n  d${d}: ${crumbDays[d]} whole-piece take(s)`);
      for (const r of rows.filter(r => r.day === d && !r.starved && r.drew > r.need).slice(0, 3)) {
        const nm = String(r.name || r.vid).split(' ')[0];
        console.log(`    ${nm}: drew ${Math.round(r.drew)} vs need ${Math.round(r.need)} — ate ${Math.round(r.ate)}, pantry fresh after ${Math.round(r.pantryFreshAfter)}`);
      }
      for (const s of sayLines.filter(s => s.day === d && /hungry|sleep|ate|meal|food/i.test(s.text)).slice(0, 3)) console.log(`    [say d${s.day}] ${s.text}`);
    }
  }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
