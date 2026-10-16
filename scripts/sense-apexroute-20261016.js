#!/usr/bin/env node
'use strict';
// KILL PROTOCOL (2026-10-16: pilot NO-GO): the lever is reverted.
// INFO-SKIP instead of running a no-op sense capture.
(function () {
  const fs = require('fs');
  const path = require('path');
  try {
    const gj = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
    if (gj.indexOf('apexRouteOn') === -1) {
      console.log('SKIP sense-apexroute-20261016 (lever reverted per kill protocol — apexRouteOn absent from src/js/game.js)');
      process.exit(0);
    }
  } catch (e) {}
})();
// sense-apexroute-20261016.js — SENSE-TESTING LAW read for sim-apexroute.
// Runs ONE armed seed with a say-capture for apex beats (👁 sightings) and
// the surrounding departure/death narration, saved for a human read:
// do diversions read as villagers sensibly avoiding known danger?
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 APEXROUTE=1 \
//     node scripts/sense-apexroute-20261016.js [seed] [policy]
// Defaults: seed 117, leadfeast. Writes evidence/2026-10-16/apexroute-sense-s<seed>.txt
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const seed = parseInt(process.argv[2] || '117', 10);
const policyId = process.argv[3] || 'leadfeast';
const OUT = path.join(__dirname, '..', 'evidence', '2026-10-16', `apexroute-sense-s${seed}.txt`);
// capture apex sightings + departures + deaths + expedition returns
const KEEP = /👁|came back white-faced|give that ground room|heads out to forage|heads out for water|heads out to check the snares|wanders off|Word comes back|didn't come back|is back from|killed|died|stood down|gave it room|fled/i;

(async () => {
  const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const { Game } = await loadGame({ seed, mode: 'apexroute-sense', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const oSay = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const s = String(t || '');
      if (KEEP.test(s)) lines.push(`[d${(Game.state.scholar || {}).day || 0}] ${s.slice(0, 300)}`);
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  await quietLog(async () => { await runDays(Game, base, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  const v = Game.state.village || {};
  const header = [
    `# apexroute sense-read — ${policyId} s${seed} (APEXROUTE=1)`,
    `# apexStats: ${JSON.stringify(v.apexStats || {})}`,
    `# hot tiles at end: ${JSON.stringify(Object.keys(v.apexSights || {}).slice(0, 20))}`,
    '',
  ].join('\n');
  fs.writeFileSync(OUT, header + lines.join('\n') + '\n');
  console.log(`wrote ${OUT} (${lines.length} lines)`);
})().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
