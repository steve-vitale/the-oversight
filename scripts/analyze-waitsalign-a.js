#!/usr/bin/env node
// analyze-waitsalign-a.js — pure-read scan of evening->morning
// clock transitions in strand corpora (selecttrim-a + any
// waitsalign-a corpora given on the command line).
// Prediction (prereg): evening dayTicks <= 448 -> next
// morning 384 (sleep accepted, 3 full waits); evening >= 449
// -> next morning 256 (sleep refused, first wait is the
// rollover stub, then 2 full waits). Every mismatch is
// classified: leg-ended / succession / day-jump / UNEXPLAINED.
// Writes evidence/2026-10-31/sim-waitsalign-a-scan.json
// (retry loop for the EPERM flap) and prints the table.
// No state edits, no RNG.
'use strict';
const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, '..', 'evidence', '2026-10-31');

function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function writeRetry(filePath, data) {
  for (let i = 0; i < 12; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, data);
      if (fs.readFileSync(filePath, 'utf8') === data) return true;
    } catch (e) { realSleepMs(2000); }
  }
  return false;
}

function loadCorpus(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  if (!files.length) throw new Error('no json in ' + dir);
  return JSON.parse(fs.readFileSync(path.join(dir, files[0]), 'utf8'));
}

function probeSpent(evening, layers) {
  for (const layer of layers) {
    const rec = (evening.tickProbe || []).find((p) => p.layer === layer);
    if (rec) return { layer, spent: rec.spent };
  }
  return { layer: null, spent: null };
}

function analyzeLeg(name, data) {
  const evenings = data.evenings || [];
  const mornings = data.mornings || [];
  const deaths = data.deaths || [];
  const rows = [];
  for (const e of evenings) {
    const next = mornings.find((m) => m.loopDay === e.loopDay + 1);
    const eve = e.eveningDayTicks;
    if (eve === null || eve === undefined) continue;
    const predicted = eve <= 448 ? 384 : 256;
    let actual = next ? next.morningDayTicks : null;
    // Waitsalign corpora store morningDayTicks on the evening
    // row of the NEXT day too; fall back to it when the
    // mornings array lacks the row.
    if (actual === null || actual === undefined) {
      const nextEve = evenings.find((x) => x.loopDay === e.loopDay + 1);
      if (nextEve && nextEve.morningDayTicks !== null && nextEve.morningDayTicks !== undefined) actual = nextEve.morningDayTicks;
    }
    let cause = null;
    if (actual === null || actual === undefined) cause = 'leg-ended';
    else if (actual === predicted) cause = 'match';
    else {
      // Succession wake: a still-refused evening whose next
      // morning wakes at haven (4,4) after a player death on
      // that morning's gameDay. (A morning at the strand cell
      // is NOT succession, even if a death shares the day —
      // the d22 case: bearer dies during day 23, after waking
      // at the creek on its morning.)
      const died = deaths.filter((d) => {
        const dd = (d.day !== undefined ? d.day : (d.gameDay !== undefined ? d.gameDay : null));
        return next && next.gameDay !== undefined && dd === next.gameDay && (d.player === true || d.who === undefined);
      });
      const morningAtHaven = next && next.mx === 4 && next.my === 4 && next.tile === 'haven';
      if (died.length && morningAtHaven) cause = 'succession?death-night';
      else if (next && next.gameDay !== undefined && e.gameDay !== undefined && next.gameDay !== e.gameDay + 1) cause = 'day-jump';
      else cause = 'UNEXPLAINED';
    }
    // Sleep-refusal narration check (waitsalign corpora carry
    // sayLines; selecttrim corpora do not).
    let refusalLine = null;
    if (Array.isArray(data.sayLines) && e.gameDay !== undefined) {
      const hit = data.sayLines.find((s) => s.day === e.gameDay && /too late for real sleep|Dawn's an hour off/i.test(s.line || ''));
      refusalLine = hit ? hit.line.slice(0, 120) : null;
    }
    const routine = probeSpent(e, ['waitsalign', 'selecttrim']);
    rows.push({
      loopDay: e.loopDay, gameDay: e.gameDay, eve, remaining: 512 - eve,
      predicted, actual, match: actual === predicted, cause,
      eveningOutcome: e.eveningOutcome || (e.woodcarry ? 'wc' : null),
      morningCell: next ? (next.mx + ',' + next.my) : null,
      eveningCell: (e.mx + ',' + e.my),
      routineLayer: routine.layer, routineTotal: routine.spent,
      trim: !!e.selecttrimTrim, ask: !!e.waitsalignAsk,
      refusalLine,
    });
  }
  return rows;
}

const defaultLegs = [
  ['selecttrim-guard-control', 'sim-selecttrim-a-corpus-guard-control'],
  ['selecttrim-guard-trim', 'sim-selecttrim-a-corpus-guard-trim'],
  ['selecttrim-on-control', 'sim-selecttrim-a-corpus-on-control'],
  ['selecttrim-on-trim', 'sim-selecttrim-a-corpus-on-trim'],
];
const extraDirs = process.argv.slice(2);
const legs = defaultLegs.slice();
for (const d of extraDirs) {
  const base = path.basename(d);
  legs.push([base.replace(/^sim-waitsalign-a-corpus-/, 'waitsalign-'), d]);
}
// Nightwatch reclassification (same seed + substrate, evening
// equality verified before applying): a mismatch whose night
// record shows sleep interrupted mid-loop (day unchanged,
// clock advanced by 32-tick chunks, 'wake with a start' line)
// is an interrupted sleep, not an unexplained exception.
function applyNightwatch(rows, nwPath) {
  if (!fs.existsSync(nwPath)) return 0;
  let nw;
  try { nw = JSON.parse(fs.readFileSync(nwPath, 'utf8')); } catch (e) { return 0; }
  const byDay = {};
  for (const j of (nw.nights || [])) byDay[j.loopDay] = j;
  let applied = 0;
  for (const r of rows) {
    if (r.match || r.cause === 'leg-ended') continue;
    const j = byDay[r.loopDay];
    if (!j || !j.sleep || j.eve !== r.eve) continue;
    const s = j.sleep;
    const woke = (s.lines || []).some((l) => /wake with a start/i.test(l));
    if (s.before.day === s.after.day && s.after.dayTicks > s.before.dayTicks && woke) {
      r.cause = 'interrupted-sleep@' + s.after.dayTicks;
      r.nightwatch = { sleepBefore: s.before.dayTicks, sleepAfter: s.after.dayTicks, waits: (j.waits || []).map((w) => w.before.dayTicks + '->' + w.after.dayTicks) };
      applied++;
    }
  }
  return applied;
}

const out = { legs: {}, totals: { transitions: 0, matches: 0, unexplained: 0, otherMornings: 0 } };
for (const [name, dir] of legs) {
  const full = path.isAbsolute(dir) ? dir : path.join(BASE, dir);
  if (!fs.existsSync(full)) { console.error('SKIP missing ' + full); continue; }
  const data = loadCorpus(full);
  const rows = analyzeLeg(name, data);
  if (name === 'selecttrim-on-control') {
    const n = applyNightwatch(rows, path.join(BASE, 'sim-waitsalign-a-nightwatch-on-control', 'waitsalign-nightwatch-s15215.json'));
    if (n) console.log('  nightwatch reclassified ' + n + ' mismatches');
  }
  out.legs[name] = rows;
  for (const r of rows) {
    out.totals.transitions++;
    if (r.match) out.totals.matches++;
    if (r.cause === 'UNEXPLAINED') out.totals.unexplained++;
    if (r.actual !== null && r.actual !== 256 && r.actual !== 384) out.totals.otherMornings++;
  }
  console.log('## ' + name + ' (' + rows.length + ' transitions, '
    + rows.filter((r) => r.match).length + ' match, '
    + rows.filter((r) => r.cause === 'UNEXPLAINED').length + ' UNEXPLAINED)');
  for (const r of rows) {
    if (!r.match) console.log('  MISMATCH d' + r.loopDay + ' eve=' + r.eve + ' rem=' + r.remaining
      + ' pred=' + r.predicted + ' actual=' + r.actual + ' cause=' + r.cause
      + ' outcome=' + r.eveningOutcome);
  }
  const others = rows.filter((r) => r.actual !== null && r.actual !== 256 && r.actual !== 384);
  for (const r of others) console.log('  OTHER-MORNING d' + r.loopDay + ' eve=' + r.eve + ' actual=' + r.actual + ' cause=' + r.cause);
}
console.log('TOTALS transitions=' + out.totals.transitions + ' matches=' + out.totals.matches
  + ' unexplained=' + out.totals.unexplained + ' otherMornings=' + out.totals.otherMornings);
const outPath = path.join(BASE, 'sim-waitsalign-a-scan.json');
if (!writeRetry(outPath, JSON.stringify(out, null, 1))) {
  console.error('WRITE FAIL LOUDLY ' + outPath);
  process.exit(3);
}
console.log('wrote ' + outPath);
