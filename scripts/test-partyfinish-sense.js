#!/usr/bin/env node
// scripts/test-partyfinish-sense.js — SENSE-ONLY replay for sim-partyfinish-a.
// NON-MEASURED: replay text never enters any count. Purpose: wording and
// presence only — when a cornered party holds a broken beast for round 1,
// do the sortie lines read like people finishing a hurt beast at their
// treeline, and does any line overclaim (promise a kill, hide the risk,
// hide the ration cost)?
// Same say/sysSay tap pattern as test-lingerer-vis-sense.js (wrap only,
// record text, call the original, draw no RNG).
// Usage: SEED=75101 DAYS=180 node scripts/test-partyfinish-sense.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { partyfinish } = require(path.join(REPO, 'scripts', 'policies', 'partyfinish'));

const SEED = parseInt(process.env.SEED || '75101', 10);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SORTIE_RE = /SORTIE|treeline is quiet|still hold.*treeline|carcass is out there/;
const CORNER_RE = /cornered at the treeline/;

(async () => {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.PARTYFINISH = '1';
  const { Game } = await loadGame({ seed: SEED, mode: 'partyfinish-a-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const sortieLines = [];
  const cornerLines = [];
  const wrap = (name) => {
    const orig = Game[name];
    if (typeof orig !== 'function') return;
    Game[name] = function (x) {
      try {
        const s = String(x);
        const day = ((Game.state || {}).scholar || {}).day || 0;
        if (SORTIE_RE.test(s)) sortieLines.push('[d' + day + '] ' + s.slice(0, 500));
        if (CORNER_RE.test(s)) cornerLines.push('[d' + day + '] ' + s.slice(0, 500));
      } catch (e) {}
      return orig.apply(this, arguments);
    };
  };
  wrap('say'); wrap('sysSay');
  let endReason = null, days = 0;
  await quietLog(async () => {
    const r = await runDays(Game, partyfinish, { days: DAYS, manifest: undefined, sampleEvery: 30 });
    endReason = r.endReason; days = r.days;
  });
  console.log('=== partyfinish-a sense replay: seed=' + SEED + ' partyfinish narration=on, ' + DAYS + 'd (NON-MEASURED, wording/presence only) ===');
  console.log('END days=' + days + ' end=' + endReason);
  console.log('SORTIE_LINES=' + sortieLines.length);
  for (const l of sortieLines) console.log('  SORTIE ' + l);
  console.log('CORNER_LINES=' + cornerLines.length);
  for (const l of cornerLines) console.log('  CORNER ' + l);
})().catch(e => { console.error('PARTYFINISH SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
