#!/usr/bin/env node
// scripts/test-sortiedpr-a-sense.js — sim-sortiedpr-a sense replay.
// NON-MEASURED: replays ONE seed (SEED env, default 75101) through the
// PLAYED driver with SORTIEDPR_SENSE=1 and prints the captured sortie
// transcript: the SORTIE say line, the fight log of the first
// multi-round sortie fight (else the first sortie fight), and the
// say lines of its day. The script asserts CAPTURE only (a transcript
// exists to read); COHERENT/MIXED/DISCONNECTED is judged by the human
// reading the quoted output, never by the script.
// Output: transcript to stdout; sense row to a scratch dir (EVID env
// override, default evidence/2026-10-28/perseed-sortiedpr-a/sense/)
// which is deleted after reading — never committed as corpus.
// Usage: SEED=75101 node scripts/test-sortiedpr-a-sense.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
process.env.SORTIEDPR_SENSE = '1';
const { runOne, evidDirOf } = require('./test-sortiedpr-a-sweep');

async function main() {
  const seed = parseInt(process.env.SEED || '75101', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const scratch = process.env.EVID || path.join(REPO, 'evidence', '2026-10-28', 'perseed-sortiedpr-a', 'sense');
  fs.mkdirSync(scratch, { recursive: true });
  const row = await runOne(seed, days, scratch, 'played');
  const fights = row.senseFights || [];
  console.log(`=== sim-sortiedpr-a sense replay: seed ${seed}, days=${row.days} ===`);
  console.log(`sortie attempts=${(row.opportunities.sortieAttempts || []).length} senseFights captured=${fights.length}`);
  for (const a of (row.opportunities.sortieAttempts || [])) {
    console.log(`ATTEMPT d${a.day} how=${a.how} ok=${a.ret && a.ret.ok} cleared=${a.ret && a.ret.cleared} broke=${a.ret && a.ret.broke} paid=${a.ret && a.ret.paid} lingerersBefore=${JSON.stringify(a.lingerersBefore)}`);
  }
  for (const m of (row.opportunities.sortieMusters || [])) console.log(`SORTIE-LINE d${m.day}: ${m.line}`);
  const multi = fights.filter(f => f.rounds >= 2);
  const pick = multi[0] || fights[0] || null;
  if (!pick) { console.log('SENSE-TRANSCRIPT: NONE (no sortie fight captured on this seed)'); return; }
  console.log(`--- picked fight: d${pick.day} ${pick.monster} leader=${pick.leaderName} outcome=${pick.outcome} rounds=${pick.rounds} mDealt=${pick.mDealt} allyDealt=${pick.allyDealt} vTaken=${pick.vTaken} partySize=${pick.partySize} corneredHold=${pick.corneredHold} ---`);
  console.log('FIGHT LOG (quoted verbatim):');
  for (const line of (pick.log || [])) console.log('  ' + line);
  console.log(`SAY LINES d${pick.day} (quoted verbatim):`);
  for (const s of (row.senseSay || []).filter(x => x.day === pick.day)) console.log(`  d${s.day}: ${s.line}`);
  console.log('SENSE-TRANSCRIPT: CAPTURED (coherence judged by the human reader in evidence, never by this script)');
}
main().catch(e => { console.error('SENSE-FAIL', e && e.stack || e); process.exit(1); });
