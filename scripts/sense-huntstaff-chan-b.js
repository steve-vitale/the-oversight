#!/usr/bin/env node
// scripts/sense-huntstaff-chan-b.js — sense-read capture for the huntstaff-b arm.
// (scripts/sense-huntstaff-b.js is the OLD arm's kept instrument — this is
// the channel-staffing arm's own.)
//
// Runs 2 armed configs (leadstaffhunt, belongstaffhunt) 60d with narration ON,
// capturing: the layer's staffing say lines + the engine's hunt-resolve beats
// + hunting-wound beats. Writes evidence/2026-10-21/huntstaff-beats/*.txt
// for the SENSE-TESTING LAW read (meaning, coherence, consequences —
// never just counts).
//
// Usage (READ THE HEADER — the env trap):
//   FEASTSCALE_R13=1 SEATDRIVE=0 HUNTSTAFF_B=1 node scripts/sense-huntstaff-chan-b.js
'use strict';
const fs = require('fs');
const path = require('path');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SENSE STOP: ${k}=1 is required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SENSE STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.HUNTSTAFF_B !== '1') { console.error('SENSE STOP: HUNTSTAFF_B=1 required (this reads the armed voice).'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadstaffhunt, belongstaffhunt } = require('./policies/huntstaff-b');

const OUT = path.join(__dirname, '..', 'evidence', '2026-10-21', 'huntstaff-beats');
const STAFF_RE = /take up spears|hunt goes out|game trails|Spears up/i;
const HUNT_RE = /returns with meat|brings back meat|got hurt out there|in no shape for the treeline|wearing thin|still hurting from the hunt|Nothing to bring home|Clean hunt|hunted out|finds sign but no game/i;

async function capture(seed, policy, outFile) {
  const { Game } = await loadGame({ seed, mode: `huntstaffb-sense-${policy.id}`, fullTelemetry: false, narration: true });
  await quietLog(async () => { await setupGame(Game); });
  const lines = [];
  const oSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const s = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
      if (STAFF_RE.test(s) || HUNT_RE.test(s)) {
        const day = ((Game.state || {}).scholar || {}).day || 0;
        lines.push(`d${day} [${STAFF_RE.test(s) ? 'STAFF' : 'HUNT'}] ${s}`);
      }
    } catch (e) {}
    return oSay(msg);
  };
  await quietLog(async () => { await runDays(Game, Object.assign({}, policy), { days: 60, sampleEvery: 30 }); });
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(outFile, lines.join('\n') + '\n');
  console.log(`wrote ${outFile} (${lines.length} beats)`);
}

(async () => {
  await capture(8902, leadstaffhunt, path.join(OUT, 'leadstaffhunt-s8902-60d.txt'));
  await capture(8903, belongstaffhunt, path.join(OUT, 'belongstaffhunt-s8903-60d.txt'));
})().catch(e => { console.error('SENSE CRASH', e && e.stack || e); process.exit(2); });
