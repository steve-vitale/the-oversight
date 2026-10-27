#!/usr/bin/env node
// scripts/test-w4abstain-a-sense.js — SENSE-ONLY replay for sim-w4abstain-a.
// NON-MEASURED: narration replays never enter the census (the harness
// notes narration can shift trajectories). Purpose: read ONE seed's
// wave-4 thread — the seed by the pre-registered rule: lowest seed with
// a villager wave-4 kill; fallback vetsurvive rule (highest gated at
// end; ties by most wave-4 kills, then lowest seed) if no villager
// kill exists — and judge in plain words whether villagers act like
// people (goals, routines, reactions, dialogue) and what the village
// did about the wave-4 monsters it met.
// Same say/sysSay tap pattern as test-vetsurvive-a-sense.js: wraps
// only record text and call the original, drawing no RNG. The replay
// proves wording and presence only, never entity identity or counts.
// Usage: SEED=75101 DAYS=180 node scripts/test-w4abstain-a-sense.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { w4abstain } = require(path.join(REPO, 'scripts', 'policies', 'w4abstain'));

const SEED = parseInt(process.env.SEED || '75101', 10);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const FROM_DAY = Math.max(0, DAYS - 30);
// Wave-4 / abstention / villager-life beats. Deliberately broad: the
// question is whether the late run reads as people living with the
// monsters they meet — and whether a fled wave-4 fight reads as a
// choice, not a silence.
const HIT_RE = /producers|mirror draft|not ready|blood your fighters|armor the village|put weapons in hands|learn their tricks|veteran kill|put down|standing|feast|drive it off|circles the cookfire|flee|fled|barrier|retreat|ran from|turned away|gossip|taught|teach|talk|conversation|argument|mourns|grieve|celebrat|wedding|born|funeral|patrol|hunt|harvest|cook|share|died|fallen|lost them/i;
const FIGHT_RE = /Turn-based now/i;

(async () => {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.W4ABSTAIN = '1';
  delete process.env.TABLEDEFIANT;
  const { Game } = await loadGame({ seed: SEED, mode: 'w4abstain-a-sense', fullTelemetry: false, narration: true });
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
  await quietLog(async () => { await runDays(Game, w4abstain, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  console.log('=== w4abstain sense replay: seed=' + SEED + ' w4abstain narration=on, ' + DAYS + 'd (NON-MEASURED) ===');
  console.log('--- life / gate hits from d' + FROM_DAY + ' (' + hits.length + ') ---');
  for (const h of hits) console.log('  ' + h);
  console.log('--- fight-start lines from d' + FROM_DAY + ' (' + fights.length + ') ---');
  for (const f of fights) console.log('  ' + f);
  if (!hits.length && !fights.length) console.log('(no beats fired in this replay from d' + FROM_DAY + ')');
})().catch(e => { console.error('W4ABSTAIN SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
