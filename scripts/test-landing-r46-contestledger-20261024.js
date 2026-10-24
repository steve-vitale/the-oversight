// Proof test for the landing r46 contest analyzer (scripts/analyze-landing-r46-20261024.js).
// Synthetic corpora only — no game code, no repo writes outside temp dirs
// (created under os.tmpdir, removed in finally blocks).
// Cases:
//   A: arena death inside a fired+ended contest span -> CONTEXT OK (+ name/phase print).
//   B: televised arena death with no ledger entry anywhere -> MISSING CONTEXT, NO-GO verdict.
//   C: contest fired, still open at horizon -> counted open, not an orphan end.
//   D: arena-cause death with no span AND no TV death line -> WILD-ARENA
//      (wild fight loss, grid-as-arena), verdict still GO.
//   E: driver context agrees with the recomputed span in every case (no DISAGREE).
// Two analyzer runs: a NO-GO corpus (A+B+C) and a GO corpus (A+D+C).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

function series(days, griefFrom) {
  return days.map(d => ({ day: d, pop: 12, villageGrief: (griefFrom != null && d >= griefFrom) ? 3 : 0,
    scholarKcal: 1000, loc: 'haven', pantryKcal: 20000 }));
}
const base = (seed, extra) => Object.assign({
  seed, systemDay: 8, series: series([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], null),
  deaths: [], mantleLog: [], awayDayDigest: [], starvAutopsies: [], r41Summary: {},
  census: [{ id: 'v1', name: 'Test One' }], contestsHeld: 0, contestLedger: [], contestDeathAutopsies: [],
}, extra);

const seedA = base(613, {
  series: series([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], 15),
  deaths: [{ day: 15, who: 'v1', cause: 'the arena', kind: 'villager' }],
  contestsHeld: 1,
  contestLedger: [{ contestId: 'the-pit', name: 'The Pit', kind: 'contest', firedDay: 15, endDay: 16, outcome: 'won',
    participants: ['Test One'], firedFromTele: true, endedFromTele: true,
    tvExcerpts: ['📺 The Pit — the last rush.'], tvLineCount: 4,
    phaseExcerpts: ['The Pit — first blood.', 'The Pit — the crowd roars.'] }],
  contestDeathAutopsies: [{ day: 15, who: 'v1', cause: 'the arena', kind: 'villager', arenaish: true,
    contestId: 'the-pit', contestOutcome: 'won', contestParticipants: ['Test One'],
    deathLines: ['📺 Test One dies in the arena. The show keeps the footage.'], context: 'LEDGER' }],
});
const seedB = base(614, {
  series: series([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 17),
  deaths: [{ day: 17, who: 'v1', cause: 'the arena', kind: 'villager' }],
  contestsHeld: 0, contestLedger: [],
  contestDeathAutopsies: [{ day: 17, who: 'v1', cause: 'the arena', kind: 'villager', arenaish: true,
    contestId: null, contestOutcome: null, contestParticipants: null,
    deathLines: ['📺 Test One dies in the arena. The show keeps the footage.'], context: 'MISSING' }],
});
const seedC = base(615, {
  series: series([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], null),
  contestsHeld: 1,
  contestLedger: [{ contestId: 'sweet-tooth', kind: 'contest', firedDay: 20, endDay: null, outcome: null,
    participants: ['Test One'], firedFromTele: true, endedFromTele: false,
    tvExcerpts: ['📺 Sweet Tooth — Test One is at the comb.'], tvLineCount: 3 }],
  contestDeathAutopsies: [],
});
const seedD = base(616, {
  series: series([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 9),
  deaths: [{ day: 9, who: 'v1', cause: 'the arena', kind: 'villager' }],
  contestsHeld: 0, contestLedger: [],
  contestDeathAutopsies: [{ day: 9, who: 'v1', cause: 'the arena', kind: 'villager', arenaish: true,
    contestId: null, contestOutcome: null, contestParticipants: null, deathLines: [], context: 'WILD-ARENA' }],
});

let failures = 0;
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`);
  if (!cond) failures++;
};
function runCorpus(label, entries) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'r46-proof-'));
  try {
    for (const [n, obj] of entries) fs.writeFileSync(path.join(dir, `census-${n}.json`), JSON.stringify(obj));
    return execFileSync('node', [path.join(__dirname, 'analyze-landing-r46-20261024.js'), dir], { encoding: 'utf8' });
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { console.log('temp cleanup note: ' + e.message); }
  }
}
try {
  const noGo = runCorpus('NO-GO', [[613, seedA], [614, seedB], [615, seedC]]);
  check('A: contest death carries context', noGo.includes('CONTEST DEATH d15') && noGo.includes('CONTEXT OK'));
  check('A: ledger prints the plain-words contest name + phases', noGo.includes('name=The Pit') && noGo.includes('PHASE: The Pit — first blood.'));
  check('B: televised arena death without ledger flagged', noGo.includes('CONTEST DEATH d17') && noGo.includes('MISSING CONTEXT'));
  check('B: summary counts the missing death', /deathsMissing=1/.test(noGo));
  check('C: open contest counted, not orphaned', /openAtHorizon=1/.test(noGo) && /orphanEnds=0/.test(noGo));
  check('NO-GO corpus verdict is NO-GO', noGo.includes('CONTEST LEDGER: NO-GO'));
  check('NO-GO corpus: no driver/recomputed disagreement', !noGo.includes('AUTOPSY DISAGREE'));
  check('NO-GO corpus: grief watch still holds', noGo.includes('GRIEF WATCH: holds'));
  check('NO-GO corpus: starvation watch still GO', noGo.includes('STARVATION: GO'));

  const go = runCorpus('GO', [[613, seedA], [616, seedD], [615, seedC]]);
  check('D: untelevised arena death classified wild-arena, not missing', go.includes('WILD-ARENA DEATH d9') && /wildArenaDeaths=1/.test(go));
  check('D: GO corpus counts zero missing', /deathsMissing=0/.test(go));
  check('GO corpus verdict is GO', go.includes('CONTEST LEDGER: GO'));
  check('GO corpus: no driver/recomputed disagreement', !go.includes('AUTOPSY DISAGREE'));
} catch (e) {
  console.log('FAIL harness error: ' + (e && e.message));
  if (e && e.stdout) console.log(String(e.stdout).slice(0, 2000));
  failures++;
}
console.log(failures === 0 ? 'PROOF: ALL GREEN' : `PROOF: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
