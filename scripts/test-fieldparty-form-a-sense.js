#!/usr/bin/env node
// scripts/test-wave4demand-sense.js — SENSE-ONLY replay for sim-fieldparty-form-a
// (copy of test-w4convert-sense.js, labels only; the original is untouched).
// NON-MEASURED: narration replays never enter the census (the harness
// notes narration can shift trajectories). Purpose: read ONE seed's
// wave-4 window in plain words — the sense seed from this band's
// corpus (most wave-4 fights, tie -> lowest) — and judge whether the
// participants in a wave-4 fight act like people (goals, reactions,
// retreat judgment) or robotic, and whether the fight looks like the
// demanded party+geared undertaking or solo/under-equipped play.
// Same say/sysSay tap pattern as test-w4lethality-rebase-sense.js:
// wraps only record text and call the original, drawing no RNG.
// The replay proves wording and presence only, never entity identity
// or counts.
// Usage: SEED=75104 DAYS=180 FROM_DAY=60 node scripts/test-w4damage-sense.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { tableseatNowait } = require(path.join(REPO, 'scripts', 'policies', 'tableseat-nowait'));

const SEED = parseInt(process.env.SEED || '75104', 10);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const FROM_DAY = parseInt(process.env.FROM_DAY || String(Math.max(0, DAYS - 30)), 10); // prereg: windowed on the seed's wave-4 window, NOT the horizon tail
// Wave-4 / raid / toll beats + villager-life beats. The toll question
// adds: raid, palisade, stakes, toll, treeline, sortie, patrol.
const HIT_RE = /producers|mirror draft|not ready|blood your fighters|armor the village|put weapons in hands|learn their tricks|veteran kill|put down|standing|feast|gossip|taught|teach|talk|conversation|argument|mourns|grieve|celebrat|wedding|born|funeral|patrol|hunt|harvest|cook|share|died|fallen|lost them|raid|palisade|stakes|toll|treeline|sortie|gorge/i;
const FIGHT_RE = /Turn-based now/i;

(async () => {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed: SEED, mode: 'fieldparty-form-a-sense', fullTelemetry: false, narration: true });
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
  console.log('=== fieldparty-form-a sense replay: seed=' + SEED + ' tableseat-nowait narration=on, ' + DAYS + 'd from d' + FROM_DAY + ' (NON-MEASURED, wave-4 window) ===');
  console.log('--- life / gate hits from d' + FROM_DAY + ' (' + hits.length + ') ---');
  for (const h of hits) console.log('  ' + h);
  console.log('--- fight-start lines from d' + FROM_DAY + ' (' + fights.length + ') ---');
  for (const f of fights) console.log('  ' + f);
  if (!hits.length && !fights.length) console.log('(no beats fired in this replay from d' + FROM_DAY + ')');
})().catch(e => { console.error('FIELDPARTY SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
