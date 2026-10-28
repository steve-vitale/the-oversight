#!/usr/bin/env node
// scripts/test-lingerer-vis-sense.js — SENSE-ONLY replay for sim-lingerer-vis-a.
// NON-MEASURED: narration replays never enter the census. Purpose: prove
// wording and presence only — does the new toll-wound clause fire when a
// toll-wounded lingerer is born at the treeline, and does any line
// contradict the wound (claim a healed/full-strength return)?
// Same say/sysSay tap pattern as test-w4damage-sense.js (wrap only,
// record text, call the original, draw no RNG).
// Usage: SEED=75106 DAYS=180 FROM_DAY=0 node scripts/test-lingerer-vis-sense.js
// Output: every clause line found (day + text), a count, and a short
// sample of raid/treeline/gorge lines for context. A control-code run
// must print 0 clause lines (the string does not exist in that code).
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { tableseatNowait } = require(path.join(REPO, 'scripts', 'policies', 'tableseat-nowait'));

const SEED = parseInt(process.env.SEED || '75106', 10);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const FROM_DAY = parseInt(process.env.FROM_DAY || '0', 10);
const CLAUSE_RE = /carries the wound at the treeline/;
const CONTEXT_RE = /RAID|palisade|treeline|gorges at the treeline|Nobody met/i;

(async () => {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed: SEED, mode: 'lingerervis-a-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const clauseLines = [];
  const context = [];
  const wrap = (name) => {
    const orig = Game[name];
    if (typeof orig !== 'function') return;
    Game[name] = function (x) {
      try {
        const s = String(x);
        const day = ((Game.state || {}).scholar || {}).day || 0;
        if (day >= FROM_DAY) {
          if (CLAUSE_RE.test(s)) clauseLines.push('[d' + day + '] ' + s.slice(0, 400));
          else if (CONTEXT_RE.test(s) && context.length < 40) context.push('[d' + day + '] ' + s.slice(0, 300));
        }
      } catch (e) {}
      return orig.apply(this, arguments);
    };
  };
  wrap('say'); wrap('sysSay');
  await quietLog(async () => { await runDays(Game, tableseatNowait, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  console.log('=== lingerer-vis-a sense replay: seed=' + SEED + ' tableseat-nowait narration=on, ' + DAYS + 'd from d' + FROM_DAY + ' (NON-MEASURED, clause presence only) ===');
  console.log('CLAUSE_LINES=' + clauseLines.length);
  for (const l of clauseLines) console.log('  CLAUSE ' + l);
  console.log('--- raid/treeline/gorge context (first 40) ---');
  for (const l of context) console.log('  ' + l);
})().catch(e => { console.error('LINGERER-VIS SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
