#!/usr/bin/env node
// contactbreak-analyze-20261031.js — sim-contactbreak-a analyzer (DIAG only).
//
// Classifies EVERY wave-3 field-fight row in the landed fieldfinish2
// corpus as CONTACT / FOUGHT / UNCLASSIFIED, per the prereg
// (evidence/2026-10-31/sim-contactbreak-a-prereg.md). Reads corpus
// files only; loads no game code, runs no sims, changes nothing.
//
// CONTACT iff ALL of: mHpStart < 0.15 * mMaxHp, rounds <= 1,
// mDealt == 0, outcome in {mFlee, evade}. FOUGHT iff classifiable
// and any condition fails. UNCLASSIFIED iff any needed field is
// missing or non-numeric (never derived — mHpStart is NOT
// reconstructed from mDealt + mHpLeft).
//
// Usage: node scripts/contactbreak-analyze-20261031.js <baselineDir> <leverDir> [--out <file>]
//   Each dir holds leadfeast/s<seed>.json splitter output.
//   Prints a band summary to stdout; with --out writes the full JSON.
'use strict';
const fs = require('fs');
const path = require('path');

const CONTACT_OUTCOMES = ['mFlee', 'evade'];
const NEEDED = ['mHpStart', 'mMaxHp', 'rounds', 'mDealt', 'outcome'];

function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }

// Returns { cls, reason } — reason null unless UNCLASSIFIED (missing fields).
function classifyRow(f) {
  const missing = NEEDED.filter(k => {
    const v = f[k];
    if (k === 'outcome') return typeof v !== 'string' || !v;
    return !isNum(v);
  });
  if (missing.length) return { cls: 'UNCLASSIFIED', reason: 'missing:' + missing.join(',') };
  const contact = f.mHpStart < 0.15 * f.mMaxHp &&
    f.rounds <= 1 && f.mDealt === 0 &&
    CONTACT_OUTCOMES.indexOf(f.outcome) >= 0;
  return { cls: contact ? 'CONTACT' : 'FOUGHT', reason: null };
}

// Log check for one row. Strike evidence = a round line reporting a
// strike or a hit dealing damage (fought-log shape "R1: X strikes for
// N"). Break language = the contact drive-off line. A wording gap
// (no break line, no strikes) is NOT a disagreement per the prereg.
function checkLog(log) {
  const lines = Array.isArray(log) ? log.map(String) : [];
  const hasStrike = lines.some(l => /R\d+\s*:/.test(l) && /(strikes? for|hits .* for)/i.test(l));
  const hasBreak = lines.some(l => /broke before it ever closed/i.test(l) || /drove .* off/i.test(l));
  const hasRoundLine = lines.some(l => /R\d+\s*:/.test(l));
  return { hasStrike, hasBreak, hasRoundLine, wordingGap: !hasBreak && !hasStrike };
}

// Prereg resolution rule. For a CONTACT-classified row: a strike in
// the log proves a classifier field wrong -> move to FOUGHT naming
// the suspect field (mDealt recorded 0). A wording gap alone keeps
// CONTACT. For a FOUGHT negative control: a pure contact break
// (break language, no round line, no strike) is a disagreement to
// report, but the classifier class stands (definition-based).
function resolveLog(row, cls) {
  const c = checkLog(row.log);
  if (cls === 'CONTACT' && c.hasStrike) {
    return { finalCls: 'FOUGHT', disagreement: true, note: 'log shows strike while mDealt==0; moved CONTACT->FOUGHT, suspect field mDealt' };
  }
  if (cls === 'FOUGHT' && c.hasBreak && !c.hasRoundLine && !c.hasStrike) {
    return { finalCls: 'FOUGHT', disagreement: true, note: 'log shows pure contact break on a FOUGHT row; class stands, disagreement reported' };
  }
  return { finalCls: cls, disagreement: false, note: c.wordingGap ? 'wording gap only (no break line, no strikes); class stands' : '' };
}

function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function quartile(xs, p) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return null;
  if (s.length === 1) return s[0];
  const i = p * (s.length - 1);
  const lo = Math.floor(i), hi = Math.min(lo + 1, s.length - 1), frac = i - lo;
  return s[lo] * (1 - frac) + s[hi] * frac;
}

function analyzeLeg(dir) {
  const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();
  const out = { dir, files: files.length, total: 0, contact: 0, fought: 0, unclassified: 0,
    unclassifiedReasons: {}, contactRows: [], unclassifiedRows: [],
    contactBySeed: {}, contactByMonster: {}, contactByIntent: {}, totalBySeed: {} };
  const contactHp = [];
  for (const fn of files) {
    const obj = JSON.parse(fs.readFileSync(path.join(dir, fn), 'utf8'));
    const seed = String(obj.seed);
    for (const f of (obj.fieldFights || [])) {
      if (f.wave !== 3) continue;
      out.total += 1;
      out.totalBySeed[seed] = (out.totalBySeed[seed] || 0) + 1;
      const r = classifyRow(f);
      if (r.cls === 'UNCLASSIFIED') {
        out.unclassified += 1;
        out.unclassifiedReasons[r.reason] = (out.unclassifiedReasons[r.reason] || 0) + 1;
        out.unclassifiedRows.push({ seed, day: f.day, mid: f.mid, outcome: f.outcome, rounds: f.rounds, mDealt: f.mDealt, reason: r.reason });
      } else if (r.cls === 'CONTACT') {
        out.contact += 1;
        contactHp.push(f.mHpStart);
        out.contactBySeed[seed] = (out.contactBySeed[seed] || 0) + 1;
        out.contactByMonster[f.mid] = (out.contactByMonster[f.mid] || 0) + 1;
        out.contactByIntent[f.intent || 'null'] = (out.contactByIntent[f.intent || 'null'] || 0) + 1;
        out.contactRows.push({ seed, day: f.day, vid: f.vid, mid: f.mid, outcome: f.outcome,
          rounds: f.rounds, mHpStart: f.mHpStart, mMaxHp: f.mMaxHp, mDealt: f.mDealt,
          mHpLeft: f.mHpLeft, intent: f.intent, log: f.log || null });
      } else {
        out.fought += 1;
      }
    }
  }
  out.shares = {
    contact: out.total ? out.contact / out.total : null,
    fought: out.total ? out.fought / out.total : null,
    unclassified: out.total ? out.unclassified / out.total : null,
  };
  out.reconciles = (out.contact + out.fought + out.unclassified) === out.total;
  const s = contactHp.slice().sort((a, b) => a - b);
  out.contactMHpStart = { n: s.length, median: median(s), q1: quartile(s, 0.25),
    q3: quartile(s, 0.75), min: s.length ? s[0] : null, max: s.length ? s[s.length - 1] : null,
    sorted: s,
    le15: s.filter(x => x <= 15).length, le30: s.filter(x => x <= 30).length,
    le45: s.filter(x => x <= 45).length };
  // Log validation: census of CONTACT rows + first 3 FOUGHT rows per leg in corpus order.
  out.logValidation = { contactChecked: 0, contactDisagreements: [], controlChecked: 0, controlDisagreements: [], wordingGaps: 0 };
  for (const row of out.contactRows) {
    out.logValidation.contactChecked += 1;
    const res = resolveLog(row, 'CONTACT');
    if (res.disagreement) out.logValidation.contactDisagreements.push({ seed: row.seed, day: row.day, mid: row.mid, note: res.note, log: row.log });
    else if (res.note) out.logValidation.wordingGaps += 1;
  }
  // Negative controls are re-derived in corpus order from the files.
  let controls = 0;
  for (const fn of files) {
    if (controls >= 3) break;
    const obj = JSON.parse(fs.readFileSync(path.join(dir, fn), 'utf8'));
    for (const f of (obj.fieldFights || [])) {
      if (controls >= 3) break;
      if (f.wave !== 3) continue;
      const r = classifyRow(f);
      if (r.cls !== 'FOUGHT') continue;
      controls += 1;
      out.logValidation.controlChecked += 1;
      const res = resolveLog(f, 'FOUGHT');
      if (res.disagreement) out.logValidation.controlDisagreements.push({ seed: String(obj.seed), day: f.day, mid: f.mid, note: res.note, log: f.log || null });
    }
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const outFile = outIdx >= 0 ? args[outIdx + 1] : null;
  const dirs = outIdx >= 0 ? args.filter((a, i) => i !== outIdx && i !== outIdx + 1) : args.slice();
  if (dirs.length !== 2) {
    console.error('usage: node scripts/contactbreak-analyze-20261031.js <baselineDir> <leverDir> [--out <file>]');
    process.exit(2);
  }
  const result = { baseline: analyzeLeg(dirs[0]), lever: analyzeLeg(dirs[1]) };
  const summary = {};
  for (const leg of ['baseline', 'lever']) {
    const b = result[leg];
    summary[leg] = { total: b.total, contact: b.contact, fought: b.fought, unclassified: b.unclassified,
      shares: b.shares, reconciles: b.reconciles, contactMHpStart: b.contactMHpStart,
      contactBySeed: b.contactBySeed, contactByMonster: b.contactByMonster,
      contactByIntent: b.contactByIntent, unclassifiedReasons: b.unclassifiedReasons,
      logValidation: { contactChecked: b.logValidation.contactChecked,
        contactDisagreements: b.logValidation.contactDisagreements.length,
        controlChecked: b.logValidation.controlChecked,
        controlDisagreements: b.logValidation.controlDisagreements.length,
        wordingGaps: b.logValidation.wordingGaps } };
  }
  console.log(JSON.stringify(summary, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
}

if (require.main === module) main();
module.exports = { classifyRow, checkLog, resolveLog, median, quartile, analyzeLeg };
