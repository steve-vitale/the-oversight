#!/usr/bin/env node
// analyze-pantrymealword-a.js — before/after census + transcript diff
// for the stranded-night pantry-wording fix (sim-pantrymealword-a).
// Reads ONLY judged JSONs + transcript JSONs written by
// scripts/pantrymealword-trace-a.js. No sims.
// Usage: node scripts/analyze-pantrymealword-a.js <beforeDir> <afterDir>
// Prints the pooled census per tag, the GO inputs, and the transcript
// diff: every differing line must be a camp-wild OLD→NEW substitution
// on a remote stranded night; any other diff is reported LOUD.
'use strict';
const fs = require('fs');
const path = require('path');
const { OLD_LINE, NEW_LINE, isCampWildLine } = require('./pantrymealword-trace-a');

const beforeDir = process.argv[2];
const afterDir = process.argv[3];
if (!beforeDir || !afterDir) { console.error('usage: analyze-pantrymealword-a.js <beforeDir> <afterDir>'); process.exit(2); }

function loadCensus(dir, tag) {
  const files = fs.readdirSync(dir).filter((f) => new RegExp('^pantrymealword-' + tag + '-s\\d+\\.json$').test(f)).sort();
  const seeds = [];
  let stranded = 0, falseClaims = 0, honest = 0, oldN = 0, newN = 0, silent = 0;
  for (const f of files) {
    const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    seeds.push(c);
    stranded += c.pooled.stranded; falseClaims += c.pooled.falseClaims; honest += c.pooled.honestLines;
    oldN += c.pooled.oldLines; newN += c.pooled.newLines; silent += c.pooled.silent;
  }
  return { files, seeds, stranded, falseClaims, honest, oldN, newN, silent };
}

function diffTranscripts(bDir, aDir, tag) {
  const bFiles = fs.readdirSync(bDir).filter((f) => f.endsWith('-transcript.json')).sort();
  let totalDiffs = 0, campDiffs = 0, otherDiffs = 0;
  const others = [];
  for (const f of bFiles) {
    const aFile = f.replace('-' + 'before' + '-', '-' + 'after' + '-');
    const bPath = path.join(bDir, f);
    const aPath = path.join(aDir, aFile);
    if (!fs.existsSync(aPath)) { console.log('DIFF MISSING after file for ' + f); otherDiffs++; continue; }
    const b = JSON.parse(fs.readFileSync(bPath, 'utf8'));
    const a = JSON.parse(fs.readFileSync(aPath, 'utf8'));
    if (b.length !== a.length) {
      console.log('DIFF LENGTH ' + f + ': before=' + b.length + ' after=' + a.length);
      otherDiffs++;
    }
    const n = Math.min(b.length, a.length);
    for (let i = 0; i < n; i++) {
      if (b[i].text !== a[i].text || b[i].phase !== a[i].phase || b[i].loopDay !== a[i].loopDay) {
        totalDiffs++;
        if (b[i].text === OLD_LINE && a[i].text === NEW_LINE) campDiffs++;
        else { otherDiffs++; if (others.length < 20) others.push(f + ' idx=' + b[i].idx + ' BEFORE=[' + b[i].text + '] AFTER=[' + a[i].text + ']'); }
      }
    }
  }
  return { totalDiffs, campDiffs, otherDiffs, others };
}

const before = loadCensus(beforeDir, 'before');
const after = loadCensus(afterDir, 'after');
for (const [label, c] of [['BEFORE', before], ['AFTER', after]]) {
  console.log(label + ' files=' + c.files.length + ' stranded=' + c.stranded
    + ' falseClaims=' + c.falseClaims + ' honestLines=' + c.honest
    + ' old=' + c.oldN + ' new=' + c.newN + ' silent=' + c.silent);
  for (const s of c.seeds) {
    console.log('  seed ' + s.seed + ' days=' + s.daysAlive + ' end=' + s.endReason
      + ' stranded=' + s.pooled.stranded + ' false=' + s.pooled.falseClaims
      + ' honest=' + s.pooled.honestLines + ' old=' + s.pooled.oldLines
      + ' new=' + s.pooled.newLines + ' silent=' + s.pooled.silent);
    for (const n of s.nights) {
      console.log('    night loopDay=' + n.loopDay + ' tile=' + n.tile + ' outcome=' + n.outcome
        + ' nightAccess=' + n.nightAccess + ' camp=' + JSON.stringify(n.campLines)
        + ' morningRemote=' + n.morningRemote + ' pantryGain=' + n.pantryGain
        + ' falseClaim=' + n.falseClaim);
    }
  }
}
const diff = diffTranscripts(beforeDir, afterDir, 'before');
console.log('TRANSCRIPT DIFF total=' + diff.totalDiffs + ' campWildOldToNew=' + diff.campDiffs + ' other=' + diff.otherDiffs);
for (const o of diff.others) console.log('  OTHER-DIFF ' + o);
console.log(diff.otherDiffs === 0 ? 'DIFF-VERDICT WORDING-ONLY' : 'DIFF-VERDICT DRIFT-LOUD');
