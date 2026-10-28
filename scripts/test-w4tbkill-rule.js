#!/usr/bin/env node
// scripts/test-w4tbkill-rule.js — unit proof for the phase-A rule.
// Exit 0 only when every case passes; each failure names its case.
'use strict';
const { assessW4TbFight } = require('./policies/w4tbkill');

const cases = [
  { name: 'fightable-party3-single-1500-70pct', inp: { wave4: true, party: 3, monsterCount: 1, totalMhp: 1500, scholarPct: 0.70 }, want: true },
  { name: 'fightable-party4-1095-full', inp: { wave4: true, party: 4, monsterCount: 1, totalMhp: 1095, scholarPct: 1.0 }, want: true },
  { name: 'party2-not-fightable', inp: { wave4: true, party: 2, monsterCount: 1, totalMhp: 1214, scholarPct: 1.0 }, want: false },
  { name: 'solo-not-fightable', inp: { wave4: true, party: 1, monsterCount: 1, totalMhp: 900, scholarPct: 1.0 }, want: false },
  { name: 'crew-not-fightable', inp: { wave4: true, party: 3, monsterCount: 4, totalMhp: 13959, scholarPct: 1.0 }, want: false },
  { name: 'over1500-not-fightable', inp: { wave4: true, party: 3, monsterCount: 1, totalMhp: 1501, scholarPct: 1.0 }, want: false },
  { name: 'scholar69-not-fightable', inp: { wave4: true, party: 3, monsterCount: 1, totalMhp: 1000, scholarPct: 0.69 }, want: false },
  { name: 'not-wave4-not-applicable', inp: { wave4: false, party: 5, monsterCount: 1, totalMhp: 100, scholarPct: 1.0 }, want: false },
];
let fails = 0;
for (const c of cases) {
  const got = assessW4TbFight(c.inp);
  if (got.fightable !== c.want) { console.error(`FAIL ${c.name}: want fightable=${c.want}, got ${JSON.stringify(got)}`); fails++; }
  else console.log(`PASS ${c.name}: ${got.reason}`);
}
if (fails) { console.error(`FAILURES: ${fails}`); process.exit(1); }
console.log('ALL PASS: w4tbkill rule');
