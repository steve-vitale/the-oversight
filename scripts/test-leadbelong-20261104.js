// test-leadbelong-20261104.js — proof for the leadbelong analyzer
// (arm sim-leadbelong-b). Pure fixture tests; writes nothing into
// the repo. Run: node scripts/test-leadbelong-20261104.js
'use strict';
const A = require('./leadbelong-analyze-20261104');
let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL: ' + name + (extra ? ' :: ' + extra : '')); }
}
// Shape classifier.
t('LEAD classified', A.classifyLink({ primary: 'haven', subordinate: 'village_0', kind: null }).shape === 'LEAD');
t('BELONG classified', A.classifyLink({ primary: 'village_1', subordinate: 'haven', kind: null }).shape === 'BELONG');
t('LEAGUE covenant classified', A.classifyLink({ kind: 'covenant', a: 'haven', b: 'village_2' }).shape === 'LEAGUE');
t('LEAGUE trade classified', A.classifyLink({ kind: 'trade', a: 'village_2', b: 'haven' }).shape === 'LEAGUE');
t('conquered modifier kept', A.classifyLink({ primary: 'haven', subordinate: 'village_0', conquered: true }).conquered === true
  && A.classifyLink({ primary: 'haven', subordinate: 'village_0', conquered: true }).shape === 'LEAD');
t('empty link unclassified', A.classifyLink({}).shape === 'UNCLASSIFIED');
t('null link unclassified', A.classifyLink(null).shape === 'UNCLASSIFIED');
// Proposal intent.
t('proposeLink subordinate=false is LEAD intent',
  A.intentOfProposal({ fn: 'proposeLink', opts: { asSubordinate: false } }) === 'LEAD');
t('proposeLink subordinate=true is BELONG intent',
  A.intentOfProposal({ fn: 'proposeLink', opts: { asSubordinate: true } }) === 'BELONG');
t('proposeCovenant is LEAGUE intent', A.intentOfProposal({ fn: 'proposeCovenant' }) === 'LEAGUE');
t('proposeTrade is LEAGUE intent', A.intentOfProposal({ fn: 'proposeTrade' }) === 'LEAGUE');
// Say-line classifier: over-catch first, strict second.
t('COUNTER LEARNED is overcatch', A.classifySay('You COUNTER LEARNED: brace beats lunge.') === 'overcatch-counter-learned');
t('keepsake bond is overcatch', A.classifySay('A keepsake bond deepens between Ana and Bo.') === 'overcatch-keepsake-bond');
t('proposed relief is overcatch', A.classifySay('Journal: Bessie proposed relief (sickness), day 3.') === 'overcatch-proposed-relief');
t('gossip opinions is overcatch', A.classifySay('Three retellings in, nobody remembers what actually happened — but everyone has opinions.') === 'overcatch-gossip-opinions');
t('reluctance Not today is overcatch', A.classifySay('Domingo hesitates, then backs off. "Not today. Sorry." (Low trust — reluctant.)') === 'overcatch-reluctance');
t('Word will travel is strict', A.classifySay('Word will travel: Haven is clean hands (Opinion +2 with every village that knows you)') === 'strict-diplomacy');
t('knowledge gate is strict', A.classifySay("We don't know them well enough to propose.") === 'strict-diplomacy');
t('counter negotiation is strict', A.classifySay('Stonebridge counters: they ask for tribute, not primacy.') === 'strict-diplomacy');
t('unrelated line is other', A.classifySay('Your chewing echoes off the trees.') === 'other');
// analyzeSeed on a synthetic mini-corpus: LEAD link seasons and
// holds; BELONG link from a counter-accept flip breaks early.
function miniDaily(day, detail, diplomacy) {
  return { day, ovs: [{ id: 'village_0', name: 'Emberhold', isSplinter: false }, { id: 'village_1', name: 'Stonebridge', isSplinter: false }],
    linkFunnel: { total: detail.length, active: detail.filter((x) => x.status === 'active').length,
      seasoned: detail.filter((x) => x.seasoned).length, regionalPlus: detail.filter((x) => x.regionalPlus).length, detail },
    standing: { diplomacy }, capped: 0, scaleRank: 'village',
    readiness5: { ready: false }, w4faced: 0, w5faced: 0 };
}
const mini = { seed: 1, policy: 'leadcourt', arm: 'test', anchorCommit: 'x', days: 60,
  endReason: 'test', won: false, scaleRank: 'regional', maxWave: 4, endUnlockedWave: 4,
  proposalEvents: [
    { day: 25, fn: 'proposeLink', target: 'village_0', opts: { asSubordinate: false }, ret: { id: 'L1', kind: null, status: 'active', primary: 'haven', subordinate: 'village_0' } },
    { day: 26, fn: 'proposeLink', target: 'village_1', opts: { asSubordinate: false }, ret: 'counter' },
  ],
  courtshipEvents: [
    { day: 27, fn: 'answerCounter', target: 'accept', ret: { id: 'L2', kind: null, status: 'active', primary: 'village_1', subordinate: 'haven' } },
  ],
  sayLines: [
    { day: 26, line: 'You COUNTER LEARNED: brace beats lunge.' },
    { day: 27, line: 'Word will travel: Haven is clean hands (Opinion +2 with every village that knows you)' },
  ],
  daily: [
    miniDaily(25, [{ id: 'L1', kind: null, primary: 'haven', subordinate: 'village_0', status: 'active', trust: 30, seasoned: false, regionalPlus: false }], 0),
    miniDaily(27, [
      { id: 'L1', kind: null, primary: 'haven', subordinate: 'village_0', status: 'active', trust: 42, seasoned: false, regionalPlus: false },
      { id: 'L2', kind: null, primary: 'village_1', subordinate: 'haven', status: 'active', trust: 30, seasoned: false, regionalPlus: false },
    ], 0),
    miniDaily(57, [
      { id: 'L1', kind: null, primary: 'haven', subordinate: 'village_0', status: 'active', trust: 55, seasoned: true, regionalPlus: false },
      { id: 'L2', kind: null, primary: 'village_1', subordinate: 'haven', status: 'broken', trust: 0, seasoned: false, regionalPlus: false },
    ], 0),
  ] };
const r = A.analyzeSeed(mini);
t('mini: 2 links found', r.links.length === 2, JSON.stringify(r.links.map((l) => l.id)));
const L1 = r.links.find((l) => l.id === 'L1');
const L2 = r.links.find((l) => l.id === 'L2');
t('mini: L1 LEAD at formation and end', L1.formationShape === 'LEAD' && L1.endShape === 'LEAD');
t('mini: L1 seasoned-ever, held to end', L1.seasonedEver === true && L1.heldToEnd === true);
t('mini: L2 BELONG at formation', L2.formationShape === 'BELONG');
t('mini: L2 never seasoned, not held', L2.seasonedEver === false && L2.heldToEnd === false);
t('mini: no shape change', r.links.every((l) => !l.shapeChanged));
t('mini: 1 accepted counter, 1 flip', r.acceptedCounters.length === 1 && r.flips.length === 1);
t('mini: flip is LEAD intent -> BELONG', r.flips[0].intent === 'LEAD' && r.flips[0].resultShape === 'BELONG');
t('mini: direct accept is not a flip', r.proposals.find((p) => p.target === 'village_0').outcome === 'direct-accept');
t('mini: say overcatch 1 of 2', r.sayCaptured === 2 && r.overcatch === 1 && r.strictDiplomacyLineCount === 1);
// Direct-accept BELONG intent that stays BELONG is not a flip.
const mini2 = JSON.parse(JSON.stringify(mini));
mini2.proposalEvents = [{ day: 25, fn: 'proposeLink', target: 'village_1', opts: { asSubordinate: true },
  ret: { id: 'L2', kind: null, status: 'active', primary: 'village_1', subordinate: 'haven' } }];
mini2.courtshipEvents = [];
const r2 = A.analyzeSeed(mini2);
t('mini2: BELONG direct accept, zero flips', r2.flips.length === 0 && r2.acceptedCounters.length === 0);
console.log('test-leadbelong-20261104: ' + pass + ' PASS, ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
