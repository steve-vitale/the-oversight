// combatdedup-analyze-20261113.js — judge combat-line repetition corpora.
// Usage:
//   node scripts/combatdedup-analyze-20261113.js <checkDir> [afterDir]
// Prints per-seed/per-class maxPerDay + totals + worst groups for the
// CHECK corpus, and — when an AFTER corpus is given — the same for it,
// the repeat-reduction per class, the GO/NO-GO verdict vs the preregged
// bar, and the byte-identical survival comparison (days, endReason,
// maxWave, standing, scaleRank, endPantryKcal, deaths).
// Exit 0 on GO (or on a CHECK-only run that REPRODUCES), 1 on NO-GO /
// KILLED-ON-CHECK, 2 on missing input.
'use strict';
const fs = require('fs');
const path = require('path');

const CLASSES = ['strike', 'falls', 'snaps', 'freeze'];

function loadDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  return files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
}

function summarize(corpus, label) {
  console.log('=== ' + label + ' (' + corpus.length + ' seeds) ===');
  let worstOverall = 0;
  for (const s of corpus) {
    const row = [String(s.seed), 'days=' + s.days, s.endReason, 'w' + s.maxWave, 'stand=' + s.standing, s.scaleRank];
    for (const c of CLASSES) {
      const st = s.stats[c];
      row.push(c + ':tot' + st.total + '/maxDay' + st.maxPerDay + (st.maxPerDayDay != null ? '@d' + st.maxPerDayDay : '') + '/maxFight' + st.maxPerFight + '/rep' + st.repeatLines);
      if (c !== 'freeze' && st.maxPerDay > worstOverall) worstOverall = st.maxPerDay;
    }
    console.log(row.join('  '));
    for (const c of CLASSES) {
      const st = s.stats[c];
      for (const g of (st.groups || []).slice(0, 3)) {
        console.log('    [' + c + '] x' + g.count + ' d' + g.day + ' fights=' + g.fights + ' :: ' + g.line.slice(0, 120));
      }
    }
  }
  return worstOverall;
}

function totals(corpus, cls) {
  let tot = 0, rep = 0, distinct = 0;
  for (const s of corpus) { tot += s.stats[cls].total; rep += s.stats[cls].repeatLines; distinct += s.stats[cls].distinct; }
  return { total: tot, repeatLines: rep, distinct: distinct };
}

function main() {
  const checkDir = process.argv[2];
  const afterDir = process.argv[3] || null;
  if (!checkDir || !fs.existsSync(checkDir)) { console.error('usage: node scripts/combatdedup-analyze-20261113.js <checkDir> [afterDir]'); process.exit(2); }
  const check = loadDir(checkDir);
  const worstCheck = summarize(check, 'CHECK (baseline)');
  const checkVerdict = worstCheck >= 4 ? 'REPRODUCES' : 'KILLED-ON-CHECK';
  console.log('CHECK verdict: ' + checkVerdict + ' (worst maxPerDay across strike/falls/snaps = ' + worstCheck + '; bar ≥ 4)');
  if (!afterDir) { process.exit(checkVerdict === 'REPRODUCES' ? 0 : 1); }
  if (!fs.existsSync(afterDir)) { console.error('after dir missing: ' + afterDir); process.exit(2); }
  const after = loadDir(afterDir);
  const worstAfter = summarize(after, 'AFTER (fix)');
  console.log('--- repeat reduction (Σ(count−1) over repeat groups) ---');
  let go = true;
  for (const c of ['strike', 'snaps']) {
    const b = totals(check, c), a = totals(after, c);
    const red = b.repeatLines === 0 ? 100 : Math.round(100 * (b.repeatLines - a.repeatLines) / b.repeatLines);
    const worstA = Math.max.apply(null, after.map(function (s) { return s.stats[c].maxPerDay; }));
    const ok = worstA <= 3 && red >= 80;
    if (!ok) go = false;
    console.log(c + ': repeatLines ' + b.repeatLines + ' -> ' + a.repeatLines + ' (' + red + '% reduction, bar ≥80%); worst maxPerDay ' + worstA + ' (bar ≤3) — ' + (ok ? 'PASS' : 'FAIL'));
  }
  const fb = totals(check, 'falls'), fa = totals(after, 'falls');
  const worstFallsA = Math.max.apply(null, after.map(function (s) { return s.stats.falls.maxPerDay; }));
  console.log('falls: repeatLines ' + fb.repeatLines + ' -> ' + fa.repeatLines + '; worst maxPerDay ' + worstFallsA + ' (judged by the prereg falls decision rule — see evidence file)');
  const fzB = totals(check, 'freeze'), fzA = totals(after, 'freeze');
  console.log('freeze (control, NOT fixed by this arm): total ' + fzB.total + ' -> ' + fzA.total + '; repeatLines ' + fzB.repeatLines + ' -> ' + fzA.repeatLines);
  console.log('--- survival byte-identical check (same 8 seeds) ---');
  let identical = true;
  for (const b of check) {
    const a = after.find(function (s) { return s.seed === b.seed; });
    if (!a) { console.log('seed ' + b.seed + ': MISSING in after corpus'); identical = false; continue; }
    const same = b.days === a.days && b.endReason === a.endReason && b.maxWave === a.maxWave &&
      b.standing === a.standing && b.scaleRank === a.scaleRank && b.endPantryKcal === a.endPantryKcal &&
      JSON.stringify(b.deaths) === JSON.stringify(a.deaths);
    if (!same) {
      identical = false;
      console.log('seed ' + b.seed + ': DIFFERS — days ' + b.days + '->' + a.days + ', end ' + b.endReason + '->' + a.endReason +
        ', wave ' + b.maxWave + '->' + a.maxWave + ', standing ' + b.standing + '->' + a.standing +
        ', rank ' + b.scaleRank + '->' + a.scaleRank + ', pantry ' + b.endPantryKcal + '->' + a.endPantryKcal +
        ', deaths ' + b.deaths.length + '->' + a.deaths.length);
    } else console.log('seed ' + b.seed + ': identical');
  }
  if (!identical) go = false;
  console.log('AFTER verdict: ' + (go ? 'GO' : 'NO-GO') + (identical ? ' (survival byte-identical)' : ' (SURVIVAL DIFFERS — fix rejected)'));
  process.exit(go ? 0 : 1);
}
main();
