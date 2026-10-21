#!/usr/bin/env node
// titanoutcome-detect-20261021.js — PHASE 1 (read-only, zero new sims).
//
// Reuses the existing per-seed corpora and tests whether titan
// muster/coalition engagement outcomes (fought / fled / slain / evaded /
// tb-refused) are detectable READ-ONLY from the logs. Reports the
// detection rate honestly: detection >=95% with 0 unexplained =
// instrument-only path; anything less = Phase 2 (game-side record).
//
// Corpora scanned:
//   evidence/2026-10-21/perseed-killdisc/  (16 runs, killdisc v2 capture:
//     tb engagements with started/end, kills, spawns)
//   evidence/2026-10-21/perseed-vgearconfirm/ (engagement capture absent —
//     reported as a gap, not scanned)
//
// Detection rules (read-only):
//   tb-refused: tb entry, titan mid, started=false  -> detectable
//   fought:     tb entry, titan mid, started=true   -> detectable
//   fled/slain: tb entry started=true + end in {won,lost,fled}
//               (end='won' + titan mid -> slain; 'lost'/'fled' -> fled)
//   evaded:     titanStandDown writes ledger 'titan':'standdown:' — NO
//               corpus captures the ledger -> NOT detectable read-only
//   slain (state): state.titans.slain — NO corpus persists final
//               state.titans -> NOT detectable read-only post-hoc
//
// Usage: node scripts/titanoutcome-detect-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const titanDefs = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'titans.json'), 'utf8'));
const TITAN_MIDS = Object.keys(titanDefs).filter(k => k.charAt(0) !== '_');

function scanKilldisc() {
  const dirs = ['leadfeast', 'belongfeast'];
  const base = path.join(REPO, 'evidence', '2026-10-21', 'perseed-killdisc');
  const out = { runs: 0, w4runs: 0, encounters: [], byClass: {}, unexplained: 0 };
  for (const d of dirs) {
    const dir = path.join(base, d);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      out.runs++;
      if (!j.w4Day) continue;
      out.w4runs++;
      for (const t of (j.tb || [])) {
        if (TITAN_MIDS.indexOf(t.mid) < 0) continue;
        const enc = { run: d + '/' + f.replace('.json', ''), day: t.d, mid: t.mid, started: !!t.started, end: t.end || null };
        let cls;
        if (!enc.started) cls = 'tb-refused';
        else if (enc.end === 'won') cls = 'slain';
        else if (enc.end === 'lost' || enc.end === 'fled') cls = 'fled';
        else if (enc.end === 'dissolved') cls = 'dissolved';
        else if (enc.end) cls = 'fled/other-terminal';
        else { cls = 'unresolved'; out.unexplained++; }
        enc.class = cls;
        out.encounters.push(enc);
        out.byClass[cls] = (out.byClass[cls] || 0) + 1;
      }
      // slain check: any waveKillLog kills on titan mids?
      for (const k of (j.kills || [])) {
        if (TITAN_MIDS.indexOf(k.mid) >= 0) {
          out.byClass['slain-via-killlog'] = (out.byClass['slain-via-killlog'] || 0) + 1;
        }
      }
    }
  }
  return out;
}

const kd = scanKilldisc();
const total = kd.encounters.length;
const attributed = kd.encounters.filter(e => e.class !== 'unresolved').length;
console.log('== PHASE 1: read-only detection on existing corpora ==');
console.log('titan mids:', TITAN_MIDS.join(', '));
console.log(`killdisc corpus: ${kd.runs} runs, ${kd.w4runs} wave-4-unlocked`);
console.log(`titan TB encounters observed: ${total}`);
console.log('classes:', JSON.stringify(kd.byClass));
console.log(`attributed: ${attributed}/${total} = ${total ? (100 * attributed / total).toFixed(1) : 'n/a'}%`);
console.log(`unexplained: ${kd.unexplained}`);
console.log('');
console.log('READ-ONLY GAPS (not in any corpus):');
console.log('  - evaded (titanStandDown -> ledger titan:standdown:): no corpus captures the ledger');
console.log('  - slain (state.titans.slain post-hoc): no corpus persists final state.titans');
console.log('  - fought/fled terminal: 0 instances observed in any corpus (capture path exists in killdisc v2, unproven)');
console.log('');
const foughtObserved = kd.encounters.filter(e => e.started).length;
if (total > 0 && kd.unexplained === 0 && attributed / total >= 0.95 && foughtObserved > 0) {
  console.log('VERDICT: read-only-sufficient');
} else if (total > 0 && kd.unexplained === 0 && foughtObserved === 0) {
  console.log('VERDICT: PARTIAL — tb-refused is 100% detectable read-only, but fought/fled/slain/evaded have');
  console.log('  ZERO observed instances and evaded/slain-state are uncapturable from existing corpora.');
  console.log('  The full 5-class taxonomy is NOT established read-only -> Phase 2 (game-side record).');
} else {
  console.log('VERDICT: read-only-insufficient -> Phase 2 (game-side record).');
}
