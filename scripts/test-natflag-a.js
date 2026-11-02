#!/usr/bin/env node
// test-natflag-a.js — proof test for sim-natflag-a (DIAGNOSIS ONLY).
// Asserts the traced facts on the natflag driver artifacts
// (evidence/2026-11-02/perseed-natflag-a/nf-closecommit-s<seed>-r1.json),
// their reproduction match against the musterupkeep baseline JSONs, and
// the code-read claims in src/js/hierarchy.js. No sim is re-run here;
// the driver (scripts/natflag-driver-20261102-a.js) is the measurement.
// Usage: node scripts/test-natflag-a.js  (exit 0 = all checks pass)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function load(p) { return JSON.parse(fs.readFileSync(path.join(REPO, p), 'utf8')); }
const nf38 = load('evidence/2026-11-02/perseed-natflag-a/nf-closecommit-s97338-r1.json');
const nf30 = load('evidence/2026-11-02/perseed-natflag-a/nf-closecommit-s97330-r1.json');
const mu38 = load('evidence/2026-11-02/perseed-musterupkeep-a/mu-closecommit-s97338-r1.json');
const mu30 = load('evidence/2026-11-02/perseed-musterupkeep-a/mu-closecommit-s97330-r1.json');
const hier = fs.readFileSync(path.join(REPO, 'src/js', 'hierarchy.js'), 'utf8');

check('driver errors empty on both seeds', nf38.errors.length === 0 && nf30.errors.length === 0, { e38: nf38.errors, e30: nf30.errors });
// Reproduction match against musterupkeep baseline (identical stack/seeds).
for (const [nf, mu, s] of [[nf38, mu38, '97338'], [nf30, mu30, '97330']]) {
  check(`reproduction ${s}: national/table/won/endReason/gameDays match musterupkeep`,
    nf.national === mu.national && nf.table === mu.table && nf.won === mu.won &&
    nf.endReason === mu.endReason && nf.gameDays === mu.gameDays,
    { nf: [nf.national, nf.table, nf.won, nf.endReason, nf.gameDays], mu: [mu.national, mu.table, mu.won, mu.endReason, mu.gameDays] });
}
// 97338 flip trace.
function flips(rec) {
  const out = []; let prev = null;
  rec.scaleTrace.forEach(function (r) { if (r.rank !== prev) { out.push({ day: r.day, rank: r.rank }); prev = r.rank; } });
  return out;
}
const f38 = flips(nf38);
check('97338 flips village->regional d47->national d77->global d114', JSON.stringify(f38) === JSON.stringify([
  { day: 2, rank: 'village' }, { day: 47, rank: 'regional' }, { day: 77, rank: 'national' }, { day: 114, rank: 'global' }]), f38);
const tr38 = {}; nf38.scaleTrace.forEach(function (r) { tr38[r.day] = r; });
check('97338 nationalDay 77, shape lead, primary haven', nf38.finalScale.nationalDay === 77 && nf38.finalScale.nationalShape === 'lead' && nf38.finalScale.nationalPrimary === 'haven', nf38.finalScale);
check('97338 alive at both flips (roster>0, not village-lost)', tr38[77].villageLost === false && tr38[77].rosterLen === 8 && tr38[114].villageLost === false && tr38[114].rosterLen === 5, { d77: tr38[77], d114: tr38[114] });
check('97338 final read: global, roster 0, village-lost d122, realm intact', nf38.finalRank === 'global' && nf38.finalScale.villageLost === true && nf38.finalScale.rosterLen === 0 && nf38.finalScale.polity && nf38.finalScale.polity.size === 4, nf38.finalScale);
check('97338 First Court staged d76 (lead, 4 villages)', nf38.scaleLines.some(function (l) { return l.day === 76 && /first court/i.test(l.line) && /Emberhold/.test(l.line); }), nf38.scaleLines.map(function (l) { return l.day + ':' + l.line.slice(0, 60); }));
check('97338 Watchers journal line d113 precedes global flip', nf38.scaleLines.some(function (l) { return l.day === 113 && /Watchers/.test(l.line); }), nf38.scaleLines.map(function (l) { return l.day; }));
// 97338 game-path consequences: scale true, but no table, no win, no wave 5.
check('97338 deedGate: scale true but ok false on waves (w3=2, w5=0)', nf38.deedGate.scale === true && nf38.deedGate.ok === false && nf38.deedGate.waves === false && nf38.deedGate.w3 === 2 && nf38.deedGate.w5 === 0, nf38.deedGate);
check('97338 table 0, won 0, maxWave 4', nf38.table === 0 && nf38.won === 0 && nf38.maxWave === 4, { table: nf38.table, won: nf38.won, maxWave: nf38.maxWave });
// 97330 comparison: national reached, then dissolved — flag is live, not sticky.
const f30 = flips(nf30);
check('97330 flips national d86 then back to regional d103', JSON.stringify(f30) === JSON.stringify([
  { day: 2, rank: 'village' }, { day: 56, rank: 'regional' }, { day: 86, rank: 'national' }, { day: 103, rank: 'regional' }]), f30);
check('97330 realm-came-apart narrated d102, final rank regional, flag 0', nf30.scaleLines.some(function (l) { return l.day === 102 && /realm came apart/i.test(l.line); }) && nf30.finalRank === 'regional' && nf30.national === 0, { lines: nf30.scaleLines.map(function (l) { return l.day; }), finalRank: nf30.finalRank });
const tr30 = {}; nf30.scaleTrace.forEach(function (r) { tr30[r.day] = r; });
check('97330 dissolution mechanism: polity null at d102 (Thornfield trust 39 < seasoned 40)', tr30[102].polity === null && tr30[102].links.some(function (l) { return l.subordinate === 'village_2' && l.trust === 39; }), tr30[102]);
// Code reads.
check('scaleRank reads globalLive/nationalLive/networkLive flags', /scaleRank\(\) \{[\s\S]{0,400}globalLive[\s\S]{0,200}nationalLive[\s\S]{0,200}networkLive/.test(hier));
const hierLines = hier.split('\n');
const natFn = hierLines.findIndex(function (l) { return l.indexOf('answerNationalChoice(how) {') >= 0; });
const globFn = hierLines.findIndex(function (l) { return l.indexOf('answerGlobalChoice(how) {') >= 0; });
const natSet = hierLines.findIndex(function (l) { return l.indexOf('this.state.nationalLive = true;') >= 0; });
check('court answer sets nationalLive=true (inside answerNationalChoice)', natFn >= 0 && globFn > natFn && natSet > natFn && natSet < globFn, { natFn: natFn, natSet: natSet, globFn: globFn });
check('global answer sets globalLive=true', /answerGlobalChoice[\s\S]{0,3000}this\.state\.globalLive = true/.test(hier));
check('dissolution branch clears nationalLive+globalLive when polity gone', /REALM CAME APART[\s\S]{0,800}this\.state\.nationalLive = false;[\s\S]{0,200}this\.state\.globalLive = false/.test(hier));
check('hierarchy.js never references villageLost (death cannot clear the flag)', !/villageLost/.test(hier));

console.log(`\ntest-natflag-a: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
