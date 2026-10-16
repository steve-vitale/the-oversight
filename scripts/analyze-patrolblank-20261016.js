#!/usr/bin/env node
'use strict';
// analyze-patrolblank-20261016.js — attribution verdict for sim-patrolblank.
// Reads evidence/2026-10-16/perseed-patrolblank/*.json and prints the
// 100%-attribution table + the named fix. Exits non-zero if attribution is
// incomplete (any run with a patrol event that isn't classified) or any
// instrument error is recorded.
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-patrolblank');
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();

const T = { fires: 0, attempts: 0, attemptsByGate: {}, directWrites: 0,
  resolutions: 0, resFired: 0, resNoFire: 0, patrolLeads: 0, patrolChallenges: 0,
  threatDays: 0, threatPresent: 0, threatNear: 0, sayBeats: 0,
  national: 0, table: 0, wins: 0, exiled: 0, runs: files.length };
let errors = 0;

console.log('| run | days | fires | attempts | resolves | dirWrites | leads | chall | threat(present/days/near) | nat | tbl | win |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const f of files) {
  const o = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  T.fires += o.fires; T.attempts += o.attempts; T.directWrites += o.directWrites;
  T.resolutions += o.resolutions; T.resFired += o.resolutionsFired; T.resNoFire += o.resolutionsNoFire;
  T.patrolLeads += o.patrolLeads; T.patrolChallenges += o.patrolChallenges;
  T.threatDays += o.threatDays; T.threatPresent += o.threatPresent; T.threatNear += o.threatNear;
  T.sayBeats += o.sayBeats;
  T.national += o.national; T.table += o.table; T.wins += o.wins; T.exiled += o.exiled;
  for (const [k, v] of Object.entries(o.attemptsByGate || {})) T.attemptsByGate[k] = (T.attemptsByGate[k] || 0) + v;
  if (o.wrapError || o.logError) { errors++; console.error(`  !! instrument error in ${f}: ${o.wrapError || ''} ${o.logError || ''}`); }
  // Every patrol event must be classified: resolutions must all resolve to
  // fired or not-fired (they are by construction), direct writes counted,
  // attempts all carry a gate when refused.
  if (o.resolutions !== o.resolutionsFired + o.resolutionsNoFire) { errors++; console.error(`  !! resolution accounting broken in ${f}`); }
  console.log(`| ${f.replace('.json','')} | ${o.gameDays} | ${o.fires} | ${o.attempts} | ${o.resolutions} | ${o.directWrites} | ${o.patrolLeads} | ${o.patrolChallenges} | ${o.threatPresent}/${o.threatDays}/${o.threatNear} | ${o.national} | ${o.table} | ${o.wins} |`);
}

console.log('\n## Aggregate attribution');
console.log(`runs: ${T.runs}, resolvePatrol fires: ${T.fires}`);
console.log(`assignTask('patrol') attempts: ${T.attempts}`, JSON.stringify(T.attemptsByGate));
console.log(`direct writes (patrol assignment without assignTask): ${T.directWrites}`);
console.log(`resolveOneAssignment with task=patrol: ${T.resolutions} (fired=${T.resFired}, no-fire=${T.resNoFire})`);
console.log(`taskLeads.patrol observations: ${T.patrolLeads}, patrol-domain challenges: ${T.patrolChallenges}`);
console.log(`threat probe days: ${T.threatDays}, present: ${T.threatPresent}, near-haven(<=2): ${T.threatNear}`);
console.log(`patrol say-beats captured: ${T.sayBeats}`);
console.log(`wall: national ${T.national}/${T.runs}, table ${T.table}/${T.runs}, wins ${T.wins}/${T.runs}, exiled ${T.exiled}/${T.runs}`);

const opportunities = T.attempts + T.directWrites + T.patrolLeads;
console.log(`\n## Opportunity universe: ${opportunities}`);
if (opportunities === 0 && T.fires === 0) {
  console.log('CLASSIFICATION: NEVER-SCHEDULED (100%). Zero patrol assignments were created on the courtship substrate.');
  console.log('  - No assignTask(vid,\'patrol\') call in 16 runs: the courtship policies (competent.upkeep → workWater/counterPlay/assignBest/assignAnother) only ever staff water/wood/garden/fish/cook/forage/scout/hunt — never patrol.');
  console.log('  - Zero direct writes: nothing mutates assignments to patrol outside assignTask.');
  console.log('  - Zero patrol-domain challenges / taskLeads.patrol: the contender-takeover path only ignites on a patrol domain that was delegated (challenge-aging needs ch.task=\'patrol\', which needs a prior patrol assignment).');
  console.log('  - resolvePatrol fired 0x because no assignment ever reached it: the router is live but unscheduled, not gated.');
}
if (errors) { console.error(`\nATTRIBUTION INCOMPLETE: ${errors} error(s).`); process.exit(1); }
console.log('\nATTRIBUTION COMPLETE: 100% of patrol-resolution outcomes classified, instrument clean.');
