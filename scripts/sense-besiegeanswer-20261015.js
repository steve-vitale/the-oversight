#!/usr/bin/env node
// scripts/sense-besiegeanswer-20261015.js — SENSE-TESTING for the besiegeanswer
// arm (SENSE-TESTING LAW, Steve 2026-10-11): read the drive-off fights for
// meaning, coherence, consequences — never just counts.
//
// Runs one armed seed with a full say-log; prints the ~25 lines around every
// drive-off line (🛡️ ... drive it off) so a human can judge whether the
// answer reads as a village decision, whether the fight that follows is
// legible, and whether anything robotic or repeated surfaces.
//
// Usage: SEED=55 node scripts/sense-besiegeanswer-20261015.js
'use strict';
process.env.FOURTHLINK = '1';
process.env.BESIEGEANSWER = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
let ba = null;
try { ba = require('./policies/besiegeanswer'); } catch (e) { /* deleted per kill protocol */ }
if (!ba) {
  console.log('INFO-SKIP: besiegeanswer layer deleted per kill protocol; see evidence/2026-10-15/sim-besiegeanswer.md');
  process.exit(0);
}

async function main() {
  const seed = parseInt(process.env.SEED || '55', 10);
  const days = parseInt(process.env.DAYS || '180', 10);
  const { Game } = await loadGame({ seed, mode: 'besiegeanswer-sense', fullTelemetry: true });
  await setupGame(Game);
  const log = []; // {day, msg}
  const gday = () => ((Game.state || {}).scholar || {}).day || 0;
  const origSay = Game.say.bind(Game);
  Game.say = function (m) {
    try { log.push({ day: gday(), msg: String(m).slice(0, 300) }); } catch (e) {}
    return origSay.apply(this, arguments);
  };
  // tile-stamp wrap (same as the sweep's instrument — the layer reads ev.tile;
  // without it every death fails safe and no answer fires).
  const origTele = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    try {
      if (type === 'death' && data && data.player) {
        try { data.tile = this.map ? [this.map.px, this.map.py] : null; } catch (e2) {}
      }
    } catch (e) {}
    return origTele.apply(this, arguments);
  };
  const policy = ba.policyForRun();
  const result = await quietLog(() => runDays(Game, policy, { days, sampleEvery: 10 }));
  const DRIVE_RE = /drive it off/;
  const hits = log.map((e, i) => ({ e, i })).filter(({ e }) => DRIVE_RE.test(e.msg));
  console.log(`seed ${seed}: ${result.days}d, ${hits.length} drive-off answer(s), ${log.length} say lines total`);
  for (const { e, i } of hits) {
    console.log(`\n===== drive-off at day ${e.day} (log line ${i}) =====`);
    const lo = Math.max(0, i - 12), hi = Math.min(log.length, i + 14);
    for (let j = lo; j < hi; j++) {
      const mark = j === i ? '>>>' : '   ';
      console.log(`${mark} d${log[j].day} ${log[j].msg.slice(0, 200)}`);
    }
  }
  if (!hits.length) console.log('(no drive-off answers fired on this seed)');
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}
