#!/usr/bin/env node
// scripts/test-w4melt-sense.js — SENSE-ONLY replay for
// sim-w4melt-a. NON-MEASURED: narration replays never enter
// the census (the harness notes narration can shift trajectories).
// Purpose: read ONE seed's wave-4 thread in plain words. The seed
// is chosen by the pre-registered rule (most wave-4 arrivals in the
// new corpus, ties by most wave-4 kills, then lowest seed) and
// passed in via SEED; the run length via DAYS (the seed's end day).
// Same say/sysSay tap pattern as test-w4funnel-repin-sense.js: wraps only
// record text and call the original, drawing no RNG. The replay
// hunts the wave-4 arrival/fight/kill beats and the readiness-hold
// beats; if its trajectory shifts past the census thread, the
// evidence discloses the divergence and the replay proves wording
// only.
// Usage: SEED=73677 DAYS=130 node scripts/test-w4melt-sense.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { tableseatNowait } = require(path.join(REPO, 'scripts', 'policies', 'tableseat-nowait'));

const SEED = parseInt(process.env.SEED || '73678', 10);
const DAYS = parseInt(process.env.DAYS || '116', 10);
const FROM_DAY = Math.max(0, DAYS - 30);
const HIT_RE = /strike|eulogy|eater|reunion|suburb|feast draw|circling the firelight|tent|burst out through the flap|they'?re still here|waiting|trap|shut the grid down|mirror draft|not ready|blood your fighters|armor the village|put weapons in hands|treeline|lingering|melts back into the dark/i;
const FIGHT_RE = /Turn-based now/i;

(async () => {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed: SEED, mode: 'w4melt-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const hits = [];
  const fights = [];
  const wrap = (name) => {
    const orig = Game[name];
    if (typeof orig !== 'function') return;
    Game[name] = function (x) {
      try {
        const s = String(x);
        const day = ((Game.state || {}).scholar || {}).day || 0;
        if (day >= FROM_DAY) {
          if (HIT_RE.test(s)) hits.push('[d' + day + '] ' + s.slice(0, 300));
          if (FIGHT_RE.test(s)) fights.push('[d' + day + '] ' + s.slice(0, 300));
        }
      } catch (e) {}
      return orig.apply(this, arguments);
    };
  };
  wrap('say'); wrap('sysSay');
  await quietLog(async () => { await runDays(Game, tableseatNowait, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  console.log('=== w4melt sense replay: seed=' + SEED + ' tableseat-nowait narration=on, ' + DAYS + 'd (NON-MEASURED) ===');
  console.log('--- wave-4 / hold hits from d' + FROM_DAY + ' (' + hits.length + ') ---');
  for (const h of hits) console.log('  ' + h);
  console.log('--- fight-start lines from d' + FROM_DAY + ' (' + fights.length + ') ---');
  for (const f of fights) console.log('  ' + f);
  if (!hits.length && !fights.length) console.log('(no wave-4 thread beats fired in this replay from d' + FROM_DAY + ')');
})().catch(e => { console.error('W4MELT SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
