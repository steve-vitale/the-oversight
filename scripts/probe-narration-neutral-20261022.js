#!/usr/bin/env node
// probe-narration-neutral-20261022.js — one-off probe (not committed to the
// arm's evidence corpus): does narration:true in loadGame change the sim
// trajectory vs the silenced harness? The r3-style sense run of s65428/
// leadfeast (narration:true) diverged from the silenced census run
// (maxWave 4 / no win vs maxWave 5 / won d90) — this probe isolates the
// narration flag from the Game.say wrap.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));

async function oneRun(narration, wrapSay) {
  const { Game } = await loadGame({ seed: 65428, mode: 'narrprobe', fullTelemetry: false, narration: !!narration });
  const policy = VCE.armedFor('leadfeast');
  await setupGame(Game);
  if (wrapSay) {
    const osay = Game.say.bind(Game);
    Game.say = function (x) { return osay.apply(this, arguments); };
  }
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) { hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return policy.daily(Gm, ctx); },
  });
  await quietLog(async () => { await runDays(Game, wrapped, { days: 100, manifest: undefined, sampleEvery: 30 }); });
  let uw = 1, won = false;
  try { uw = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  try { won = !!Game.won; } catch (e) {}
  return { hashes, uw, won };
}

(async () => {
  const A = await oneRun(false, false); // silenced baseline
  const B = await oneRun(true, false);  // narration flag only
  const C = await oneRun(false, true);  // say-wrap only
  const D = await oneRun(true, true);   // both (the r3-sense shape)
  const same = (x, y) => x.hashes.length === y.hashes.length && x.hashes.every((h, i) => h === y.hashes[i]);
  console.log(JSON.stringify({
    A: { n: A.hashes.length, uw: A.uw, won: A.won },
    B: { n: B.hashes.length, uw: B.uw, won: B.won, sameAsA: same(A, B) },
    C: { n: C.hashes.length, uw: C.uw, won: C.won, sameAsA: same(A, C) },
    D: { n: D.hashes.length, uw: D.uw, won: D.won, sameAsA: same(A, D) },
  }, null, 1));
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e.message); process.exit(1); });
