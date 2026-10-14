#!/usr/bin/env node
// probe-ledgerunload-20261014.js — mechanism + sense probe for the ledgerunload arm.
// Re-runs the armed side capturing (a) every homecoming unload (day, kcal),
// (b) total v.gives summed across ALL vids at end (succession-safe), and
// (c) filtered transcript beats on unload days for the sense-test.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');

const COMBOS = [];
for (const pid of ['belongseek', 'leadcourt'])
  for (const seed of [11, 22, 33, 44, 55, 66, 77, 88]) COMBOS.push([pid, seed]);
const DAYS = 180;
const UNLOAD_RE = /unload ([\d,]+) kcal into Haven's pantry/;
const BEAT_RE = /unload|Half ration|Village meal|trust|Trust|Hunger gnaws|starv|donat|Donat|freeload|exile/i;

async function runCombo(pid, seed, captureBeats) {
  const { Game } = await loadGame({ seed, mode: 'ledgerunload-probe' });
  await setupGame(Game);
  const unloads = []; // {day, kcal}
  const beats = [];
  const origSay = Game.say;
  Game.say = function (msg) {
    try {
      const m = String(msg), d = (Game.state.scholar || {}).day || 0;
      const um = m.match(UNLOAD_RE);
      if (um) {
        const kcal = parseInt(um[1].replace(/,/g, ''), 10);
        unloads.push({ day: d, kcal });
        if (captureBeats) beats.push({ day: d, msg: m.slice(0, 200) });
      } else if (captureBeats && BEAT_RE.test(m) && unloads.some(u => u.day === d)) {
        if (beats.length < 120) beats.push({ day: d, msg: m.slice(0, 200) });
      }
    } catch (e) {}
    return origSay.apply(this, arguments);
  };
  const base = pid === 'belongseek' ? belongseek : leadcourt;
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => { if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} } };
  let r;
  try { r = await runDays(Game, policy, { days: DAYS, sampleEvery: 1 }); }
  finally { Game.say = origSay; }
  const vv = Game.state.village || {};
  let givesAll = 0, takesAll = 0;
  for (const vid of Object.keys(vv.gives || {})) givesAll += vv.gives[vid] || 0;
  for (const vid of Object.keys(vv.takes || {})) takesAll += vv.takes[vid] || 0;
  return { policy: pid, seed, days: r.days, endReason: r.endReason,
    unloadCount: unloads.length, unloadKcal: unloads.reduce((t, u) => t + u.kcal, 0),
    givesAllVids: givesAll, takesAllVids: takesAll, beats };
}

async function main() {
  const out = [];
  // capture full beats on s33 (both policies — the regression case) and
  // leadcourt s66 (the big win) for the sense-test.
  const beatKeys = new Set(['belongseek:33', 'leadcourt:33', 'leadcourt:66', 'belongseek:11']);
  for (const [pid, seed] of COMBOS) {
    const r = await runCombo(pid, seed, beatKeys.has(`${pid}:${seed}`));
    out.push(r);
    console.log(`  [${pid} s${seed}] days=${r.days} end=${r.endReason} unloads=${r.unloadCount} unloadKcal=${r.unloadKcal} givesAll=${r.givesAllVids}`);
  }
  require('fs').writeFileSync('probe-ledgerunload.json', JSON.stringify(out, null, 1));
  console.log('wrote probe-ledgerunload.json');
  // print the two sense-test transcripts
  for (const r of out) {
    if (!beatKeys.has(`${r.policy}:${r.seed}`) || !r.beats.length) continue;
    console.log(`\n===== SENSE ${r.policy} s${r.seed} (unload-day beats) =====`);
    for (const b of r.beats.slice(0, 50)) console.log(`  d${b.day}: ${b.msg}`);
  }
}
main().catch(e => { console.error('THREW', e); process.exit(2); });
