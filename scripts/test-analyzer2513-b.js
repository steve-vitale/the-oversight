// test-analyzer2513-b.js — proof for finding #2513: the fleerepair2
// analyzer's instrument file-count check must be derived from the
// corpus itself, not hard-coded to 8.
//   - reads 8 on an 8-seed corpus, 16 on a 16-seed corpus
//   - still reads DIRTY on a genuinely short corpus (7 of 8 files)
//   - still reads DIRTY on a seed-set mismatch (same count, other seeds)
//   - still reads DIRTY on instrument errors / missing HP rows
// Synthetic corpora live under os.tmpdir(); nothing writes into the repo.
// Usage: node scripts/test-analyzer2513-b.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const a = require('./analyze-fleerepair2-b.js');

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS ' + name);
  else { failures++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// Minimal per-seed JSON that seedAnalysis accepts: empty legs, no
// encounters, no deaths, no instrument errors.
function seedJson(seed, extra) {
  const j = { seed: seed, days: 150, gameDays: 150, endReason: 'done',
    standing: 0, scaleRank: 'village', won: false, maxWave: 4,
    villageLost: false, instrumentErrors: [],
    v4departs: [], dawnbidScores: [], v4encounters: [],
    deaths: [], winPlanStats: {} };
  if (extra) Object.assign(j, extra);
  return j;
}

function writeCorpus(dir, seeds, perSeedExtra) {
  fs.mkdirSync(dir, { recursive: true });
  const files = [];
  for (const s of seeds) {
    const f = 'seed-' + s + '.json';
    fs.writeFileSync(path.join(dir, f),
      JSON.stringify(seedJson(s, perSeedExtra ? perSeedExtra(s) : null)));
    files.push(f);
  }
  return files;
}

// summarize() wants analyzed seeds: run seedAnalysis over each file,
// mirroring main().
function summarizeDir(dir) {
  const bySeed = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed[j.seed] = a.seedAnalysis(j);
  }
  return a.summarize({ bySeed: bySeed, files: files });
}

function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'analyzer2513-'));
  try {
    // 1. 8-seed corpus: expected 8, clean.
    const ctl8 = path.join(root, 'ctl8'), arm8 = path.join(root, 'arm8');
    writeCorpus(ctl8, [1, 2, 3, 4, 5, 6, 7, 8]);
    writeCorpus(arm8, [1, 2, 3, 4, 5, 6, 7, 8]);
    const s8 = a.judgeInstrument(summarizeDir(ctl8), summarizeDir(arm8));
    check('8-seed corpus reads expectedFiles 8', s8.expectedFiles === 8, 'got ' + s8.expectedFiles);
    check('8-seed corpus instrument CLEAN', s8.pass === true);

    // 2. 16-seed corpus: expected 16, clean (the re-judge2 shape).
    const ctl16 = path.join(root, 'ctl16'), arm16 = path.join(root, 'arm16');
    const seeds16 = []; for (let i = 1; i <= 16; i++) seeds16.push(i);
    writeCorpus(ctl16, seeds16);
    writeCorpus(arm16, seeds16);
    const s16 = a.judgeInstrument(summarizeDir(ctl16), summarizeDir(arm16));
    check('16-seed corpus reads expectedFiles 16', s16.expectedFiles === 16, 'got ' + s16.expectedFiles);
    check('16-seed corpus instrument CLEAN', s16.pass === true);

    // 3. Genuinely short corpus: ctl 8 files, arm 7 (seed 8 missing).
    const arm7 = path.join(root, 'arm7');
    writeCorpus(arm7, [1, 2, 3, 4, 5, 6, 7]);
    const s7 = a.judgeInstrument(summarizeDir(ctl8), summarizeDir(arm7));
    check('7-of-8 corpus reads expectedFiles 8', s7.expectedFiles === 8, 'got ' + s7.expectedFiles);
    check('7-of-8 corpus instrument DIRTY', s7.pass === false);
    check('7-of-8 corpus seedsMatch false', s7.seedsMatch === false);

    // 4. Same count, different seeds: arm swaps seed 8 for 999.
    const armX = path.join(root, 'armX');
    writeCorpus(armX, [1, 2, 3, 4, 5, 6, 7, 999]);
    const sX = a.judgeInstrument(summarizeDir(ctl8), summarizeDir(armX));
    check('seed-mismatch corpus instrument DIRTY', sX.pass === false);
    check('seed-mismatch corpus seedsMatch false', sX.seedsMatch === false);

    // 5. Instrument error on one arm seed still reads DIRTY.
    const armE = path.join(root, 'armE');
    writeCorpus(armE, [1, 2, 3, 4, 5, 6, 7, 8], function (s) {
      return s === 3 ? { instrumentErrors: ['boom'] } : null;
    });
    const sE = a.judgeInstrument(summarizeDir(ctl8), summarizeDir(armE));
    check('instrument-error corpus DIRTY', sE.pass === false);

    // 6. Fought encounter row missing mHpStart still reads DIRTY.
    const armH = path.join(root, 'armH');
    writeCorpus(armH, [1, 2, 3, 4, 5, 6, 7, 8], function (s) {
      return s === 3 ? { v4encounters: [{ outcome: 'fled', rounds: 1, mDealt: 5 }] } : null;
    });
    const sH = a.judgeInstrument(summarizeDir(ctl8), summarizeDir(armH));
    check('missing-HP corpus DIRTY', sH.pass === false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
  if (failures) { console.log('FAILURES: ' + failures); process.exitCode = 1; }
  else console.log('ALL GREEN (analyzer2513)');
}

main();
