#!/usr/bin/env node
// scripts/test-w4lethality-sense.js — SENSE-ONLY replay for sim-w4lethality.
// NON-MEASURED: narration replays never enter the census (the harness
// notes narration can shift trajectories). Purpose: read ONE seed's
// late-run thread — the seed by the pre-registered rule: most wave-4 kills;
// ties by most wave-4 engaged arrivals, then lowest seed; if zero kills,
// the seed with the most wave-4 engaged arrivals (ties: lowest seed) — and judge in plain words whether villagers act like
// people (goals, routines, reactions, dialogue).
// Same say/sysSay tap pattern as test-w4funnel-repin-sense.js: wraps
// only record text and call the original, drawing no RNG. The replay
// proves wording and presence only, never entity identity or counts.
// Usage: SEED=74301 DAYS=180 node scripts/test-w4lethality-sense.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { tableseatNowait } = require(path.join(REPO, 'scripts', 'policies', 'tableseat-nowait'));

const SEED = parseInt(process.env.SEED || '75101', 10);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const FROM_DAY = parseInt(process.env.FROM_DAY || String(Math.max(0, DAYS - 30)), 10); // prereg: windowed on the seed's wave-4 window, NOT the horizon tail
// Wave-5 / standing-hold beats + villager-life beats (talk, teach,
// gossip, feast, routine, reaction). Deliberately broad: the question
// is whether the late run reads as people living, not just gates.
const HIT_RE = /producers|mirror draft|not ready|blood your fighters|armor the village|put weapons in hands|learn their tricks|veteran kill|put down|standing|feast|gossip|taught|teach|talk|conversation|argument|mourns|grieve|celebrat|wedding|born|funeral|patrol|hunt|harvest|cook|share|died|fallen|lost them/i;
const FIGHT_RE = /Turn-based now/i;

(async () => {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed: SEED, mode: 'w4lethality-sense', fullTelemetry: false, narration: true });
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
  console.log('=== w4lethality sense replay: seed=' + SEED + ' tableseat-nowait narration=on, ' + DAYS + 'd from d' + FROM_DAY + ' (NON-MEASURED, wave-4 window) ===');
  console.log('--- life / gate hits from d' + FROM_DAY + ' (' + hits.length + ') ---');
  for (const h of hits) console.log('  ' + h);
  console.log('--- fight-start lines from d' + FROM_DAY + ' (' + fights.length + ') ---');
  for (const f of fights) console.log('  ' + f);
  if (!hits.length && !fights.length) console.log('(no beats fired in this replay from d' + FROM_DAY + ')');
})().catch(e => { console.error('W4LETHALITY SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
