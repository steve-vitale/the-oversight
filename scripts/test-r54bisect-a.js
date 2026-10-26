#!/usr/bin/env node
// scripts/test-r54bisect-a.js — sim-r54bisect-a proof
// (scale-onramp axis, 2026-10-26: bisect the 0126Z -> current drift.)
//
// Proves, from the committed corpus alone (plus git history):
//  (1) INVERSE IDENTITY: parsing de87ffe79's conversation.js diff
//      and reverse-applying it to the current HEAD file in memory
//      yields content whose sha256 equals every colB row's
//      conversationSha, and differs from every colA row's sha
//      (which equals the HEAD file's sha). The restored line is
//      present and the grace-beat markers are absent in the
//      inverse. This proves column B really ran without the r54
//      hunk and column A really ran with it.
//  (2) DETERMINISM: each column's 73671 rerun row matches its
//      main row exactly on every trajectory field + deaths map.
//  (3) COLUMN COMPARISON: band aggregates recomputed from the
//      rows equal summary.json's bands, and the pre-registered
//      verdict recomputed from colB equals summary.json's
//      verdict (CONFIRMED / EXONERATED / INCONCLUSIVE).
//  (4) SENSE: no win without national-ever + entered, no
//      entered table without national-ever, no table invite
//      without national-ever, on either column.
//  (5) CORPUS HYGIENE: 8 colA + 8 colB rows + 2 reruns +
//      summary.json present; every row carries all trajectory
//      fields, a conversationSha, and the r54bisect head.
//
// Usage: node scripts/test-r54bisect-a.js
// Exit 1 on any failure. No game code is touched, no files
// are written.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-r54bisect-a');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const TRAJECTORY = ['days', 'gameDays', 'endReason', 'won', 'waveReach', 'maxArc',
  'finalRank', 'maxRank', 'nationalEver', 'nationalFinal', 'table', 'entered',
  'deathTotal', 'starvationDeaths'];

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (detail ? ' :: ' + detail : '')); console.log('FAIL: ' + name + (detail ? ' :: ' + detail : '')); }
}
function sha(text) { return crypto.createHash('sha256').update(text).digest('hex'); }

// --- Parse the de87ffe79 conversation.js unified diff and invert it ---
function parseDiff(diffText) {
  const hunks = [];
  const lines = diffText.split('\n');
  let cur = null;
  for (const ln of lines) {
    const m = /^@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@/.exec(ln);
    if (m) { cur = { ops: [] }; hunks.push(cur); continue; }
    if (!cur) continue;
    if (ln.startsWith('+++') || ln.startsWith('---')) continue;
    if (ln.startsWith('+')) cur.ops.push({ t: 'add', text: ln.slice(1) });
    else if (ln.startsWith('-')) cur.ops.push({ t: 'del', text: ln.slice(1) });
    else if (ln.startsWith(' ')) cur.ops.push({ t: 'ctx', text: ln.slice(1) });
    else if (ln.startsWith('\\')) { /* "\ No newline" — ignored; file ends with newline in both */ }
  }
  return hunks;
}
// Reverse-apply: in the NEW file, added lines must be present and are
// removed; deleted lines are re-inserted; context must match exactly.
// Returns the reconstructed OLD content, or throws on any mismatch.
function invertHunks(newLines, hunks) {
  const out = newLines.slice();
  // Apply hunks bottom-up so earlier offsets stay valid.
  const spans = [];
  for (const h of hunks) {
    // Walk the new file to find the hunk's new-side sequence.
    const seq = [];
    for (const op of h.ops) if (op.t !== 'del') seq.push(op.text);
    let found = -1;
    for (let i = 0; i + seq.length <= out.length; i++) {
      let ok = true;
      for (let j = 0; j < seq.length; j++) if (out[i + j] !== seq[j]) { ok = false; break; }
      if (ok) { found = i; break; }
    }
    if (found < 0) throw new Error('hunk new-side sequence not found (first line: ' + JSON.stringify(seq[0]) + ')');
    spans.push({ at: found, hunk: h });
  }
  spans.sort((a, b) => b.at - a.at);
  for (const { at, hunk } of spans) {
    const replacement = [];
    for (const op of hunk.ops) if (op.t !== 'add') replacement.push(op.text);
    const seqLen = hunk.ops.filter(o => o.t !== 'del').length;
    out.splice(at, seqLen, ...replacement);
  }
  return out.join('\n');
}

function main() {
  const headFile = fs.readFileSync(path.join(REPO, 'src', 'js', 'conversation.js'), 'utf8');
  const headSha = sha(headFile);
  const diffText = execFileSync('git', ['show', 'de87ffe79', '--', 'src/js/conversation.js'], { cwd: REPO, encoding: 'utf8' });
  const hunks = parseDiff(diffText);
  check('r54 diff parses to exactly 1 hunk', hunks.length === 1, 'hunks=' + hunks.length);
  const added = hunks.reduce((t, h) => t + h.ops.filter(o => o.t === 'add').length, 0);
  const removed = hunks.reduce((t, h) => t + h.ops.filter(o => o.t === 'del').length, 0);
  // NOTE: the brief's "+18/-1" misreads git's stat total (17 added +
  // 1 removed = 18 changed lines). The patch itself is +17/-1, and
  // the worktree reverse diff confirms it (1 insertion, 17 deletions,
  // index 53a4bceed..f1eb01639 — the commit's index line reversed).
  check('r54 hunk is +17/-1', added === 17 && removed === 1, `+${added}/-${removed}`);
  let inverseText = null;
  try {
    const headLines = headFile.split('\n');
    // split/join round-trips the trailing newline exactly when the
    // file ends with one (it does); guard the edge anyway.
    inverseText = invertHunks(headLines, hunks);
    if (!headFile.endsWith('\n')) inverseText = inverseText.replace(/\n$/, '');
  } catch (e) {
    check('inverse hunk applies exactly to HEAD file', false, String(e.message));
  }
  let inverseSha = null;
  if (inverseText !== null) {
    check('inverse hunk applies exactly to HEAD file', true);
    inverseSha = sha(inverseText);
    check('inverse restores the quiet-close line', inverseText.includes('if (wdEnd) return wdEnd;'));
    // 'nv:nod' alone is NOT a grace marker: the id exists elsewhere
    // (choice definitions at 4405/5613). The r54-specific marker is
    // its full choice-list line plus the comment header.
    check('inverse removes the grace-beat block', !inverseText.includes('WIND-DOWN GRACE BEAT') && !inverseText.includes("['more', 'agree', 'joke', 'silence', 'nv:nod'].includes(choiceId)"));
    check('HEAD file contains the grace beat', headFile.includes('WIND-DOWN GRACE BEAT'));
    check('inverse sha differs from HEAD sha', inverseSha !== headSha);
  }

  const summary = JSON.parse(fs.readFileSync(path.join(EVID, 'summary.json'), 'utf8'));
  const rowsA = [], rowsB = [];
  for (const seed of SEEDS) {
    rowsA.push(JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-colA.json`), 'utf8')));
    rowsB.push(JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-colB.json`), 'utf8')));
  }
  check('summary corpusOk flag is true', summary.corpusOk === true);
  check('summary verdict is one of the three pre-registered values',
    ['CONFIRMED', 'EXONERATED', 'INCONCLUSIVE'].indexOf(summary.verdict) >= 0, summary.verdict);

  // (1) Inverse identity, per row.
  // Rows record the HEAD they swept under; that HEAD moves when this
  // arm commits (and again when the coordinator merges), so the leg
  // must NOT require head == current HEAD. Instead: every row shares
  // one head, and that head is an ancestor of the current HEAD
  // (the sweep base the branch grew from).
  const sweepHeads = new Set([...rowsA, ...rowsB].map(r => r.head));
  check('all rows share one sweep head', sweepHeads.size === 1, [...sweepHeads].join(','));
  let headIsAncestor = false;
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', [...sweepHeads][0], 'HEAD'], { cwd: REPO, encoding: 'utf8' });
    headIsAncestor = true;
  } catch (e) { headIsAncestor = false; }
  check('sweep head is an ancestor of current HEAD', headIsAncestor, [...sweepHeads].join(','));
  for (const r of rowsA) {
    check(`colA s${r.seed} conversationSha == HEAD sha`, r.conversationSha === headSha);
  }
  if (inverseSha) {
    for (const r of rowsB) {
      check(`colB s${r.seed} conversationSha == inverse sha`, r.conversationSha === inverseSha);
    }
    check('colA and colB conversation shas differ', rowsA[0].conversationSha !== rowsB[0].conversationSha);
    check('all colA shas identical', new Set(rowsA.map(r => r.conversationSha)).size === 1);
    check('all colB shas identical', new Set(rowsB.map(r => r.conversationSha)).size === 1);
  }

  // (2) Determinism legs (73671 reruns, recorded during each column's phase).
  for (const col of ['colA', 'colB']) {
    const main = (col === 'colA' ? rowsA : rowsB).find(r => r.seed === 73671);
    const rerun = JSON.parse(fs.readFileSync(path.join(EVID, `s73671-${col}-rerun.json`), 'utf8'));
    const sameTraj = TRAJECTORY.every(k => JSON.stringify(main[k]) === JSON.stringify(rerun[k]));
    const sameDeaths = JSON.stringify(main.deaths) === JSON.stringify(rerun.deaths);
    check(`${col} 73671 rerun matches main on trajectory fields`, sameTraj);
    check(`${col} 73671 rerun matches main on deaths map`, sameDeaths);
    check(`${col} 73671 rerun ran under the same conversationSha`, rerun.conversationSha === main.conversationSha);
  }

  // (3) Band recomputation + verdict recomputation.
  function band(rows) {
    const med = (arr) => { const s = arr.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
    const wave = (n) => rows.filter(r => (r.waveReach || 1) >= n).length;
    return {
      n: rows.length,
      won: rows.reduce((t, r) => t + r.won, 0),
      medianDays: med(rows.map(r => r.days)),
      maxDays: Math.max.apply(null, rows.map(r => r.days).concat([0])),
      nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
      nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
      table: rows.reduce((t, r) => t + r.table, 0),
      entered: rows.reduce((t, r) => t + r.entered, 0),
      wave3: wave(3), wave4: wave(4), wave5: wave(5),
      maxArc: Math.max.apply(null, rows.map(r => r.maxArc).concat([1])),
      starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
      deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
    };
  }
  const bA = band(rowsA), bB = band(rowsB);
  check('summary bandA equals recomputation', JSON.stringify(summary.bandA) === JSON.stringify(bA));
  check('summary bandB equals recomputation', JSON.stringify(summary.bandB) === JSON.stringify(bB));
  const verdictOf = (b) => {
    if (b.deathTotal <= 270 && b.nationalEver <= 6 && b.starvationTotal >= 6
      && b.table >= 3 && b.won >= 3 && b.nationalFinal >= 4) return 'CONFIRMED';
    if (b.deathTotal >= 290 && b.nationalEver === 8) return 'EXONERATED';
    return 'INCONCLUSIVE';
  };
  check('summary verdict equals recomputed verdict', summary.verdict === verdictOf(bB),
    `summary=${summary.verdict} recomputed=${verdictOf(bB)}`);

  // (4) Sense checks on both columns.
  for (const [name, rows] of [['colA', rowsA], ['colB', rowsB]]) {
    for (const r of rows) {
      check(`${name} s${r.seed}: win implies nationalEver + entered`, !(r.won) || (r.nationalEver === 1 && r.entered === 1));
      check(`${name} s${r.seed}: entered implies nationalEver`, !(r.entered) || r.nationalEver === 1);
      check(`${name} s${r.seed}: table implies nationalEver`, !(r.table) || r.nationalEver === 1);
      check(`${name} s${r.seed}: all trajectory fields present`,
        TRAJECTORY.every(k => r[k] !== undefined && r[k] !== null) && r.conversationSha && r.deaths);
    }
  }

  // (5) Corpus hygiene.
  const expected = new Set(['summary.json']);
  for (const seed of SEEDS) { expected.add(`s${seed}-colA.json`); expected.add(`s${seed}-colB.json`); }
  expected.add('s73671-colA-rerun.json'); expected.add('s73671-colB-rerun.json');
  const actual = new Set(fs.readdirSync(EVID));
  const missing = [...expected].filter(f => !actual.has(f));
  const extra = [...actual].filter(f => !expected.has(f));
  check('corpus files complete', missing.length === 0, 'missing=' + missing.join(','));
  check('corpus has no unexpected files', extra.length === 0, 'extra=' + extra.join(','));

  console.log(`\ntest-r54bisect-a: ${pass} passed, ${fail} failed`);
  if (fail) { console.log('FAILURES:\n' + failures.map(f => ' - ' + f).join('\n')); process.exit(1); }
}
main();
