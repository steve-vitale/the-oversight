#!/usr/bin/env node
// scripts/test-tbstarts-sense.js — SENSE-ONLY replay for
// sim-tbstarts-a. NON-MEASURED: narration replays never enter
// any count (the harness notes narration can shift trajectories).
// Purpose: read ONE cluster in plain words — the d113-118 cluster
// on 73675, fixed in the prereg. Same say/sysSay tap pattern as
// test-w4melt-sense.js: wraps only record text and call the
// original, drawing no RNG. The replay hunts herald/treeline/
// lingering beats, the startCombat-refusal line ("Already in a
// fight"), and fight-start lines; if its trajectory shifts past
// the census thread, the evidence discloses the divergence and
// the replay proves wording only.
// Usage: SEED=73675 DAYS=120 node scripts/test-tbstarts-sense.js
// (DAYS is the replay length; hits are taken from day 111 up.)
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { tableseatNowait } = require(path.join(REPO, 'scripts', 'policies', 'tableseat-nowait'));

const SEED = parseInt(process.env.SEED || '73675', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);
const FROM_DAY = 111;
const HIT_RE = /herald|Already in a fight|treeline|lingering|gorges|HERALD|trumpet|omen/i;
const FIGHT_RE = /Turn-based now/i;

(async () => {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed: SEED, mode: 'tbstarts-sense', fullTelemetry: false, narration: true });
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
  console.log('=== tbstarts sense replay: seed=' + SEED + ' tableseat-nowait narration=on, ' + DAYS + 'd (NON-MEASURED) ===');
  console.log('--- herald / refusal / treeline hits from d' + FROM_DAY + ' (' + hits.length + ') ---');
  for (const h of hits) console.log('  ' + h);
  console.log('--- fight-start lines from d' + FROM_DAY + ' (' + fights.length + ') ---');
  for (const f of fights) console.log('  ' + f);
  if (!hits.length && !fights.length) console.log('(no cluster beats fired in this replay from d' + FROM_DAY + ')');
})().catch(e => { console.error('TBSTARTS SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
