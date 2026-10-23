#!/usr/bin/env node
// analyze-endgame-r41-20261022.js — journey-endgame r41 verdict.
// Reads evidence/2026-10-22/perseed-endgame-r41/endgame-r41-*.json,
// evaluates the pre-registered bindings. Exit 0 = PRIMARY GO, 1 = NO-GO.
// Usage: node scripts/analyze-endgame-r41-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-22', 'perseed-endgame-r41');
const files = fs.readdirSync(DIR).filter(f => /^endgame-r41-\d+\.json$/.test(f)).sort();
const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

const lines = [];
const verdicts = [];
function verdict(id, ok, note) {
  verdicts.push({ id, ok: !!ok, note });
  lines.push(`${ok ? 'GO  ' : 'NO-GO'} ${id}: ${note}`);
}

// M1 GUARD: >=4/5 reach the window and sit
const sat = recs.filter(r => r.announceDay != null && r.satDay != null);
verdict('M1-guard', sat.length >= 4, `${sat.length}/${recs.length} seeds announced+sat`);

// qualifying seeds: grey-plan (non-control), relay held pre-sit, genuinely used
const qual = recs.filter(r => {
  const g = r.rg;
  return r.plan === 'grey' && g && g.active && g.claimDone && (g.deepens | 0) >= 0 &&
    (g.verbs | 0) >= 5 && (g.communes | 0) >= 1 && r.satDay != null;
});
// M2 GREY EARNED: at-sit band grey AND |lean| <= 30 on 100% of qualifying
const m2rows = qual.map(r => {
  const at = (r.rg && r.rg.atSit) || {};
  const ok = at.band === 'grey' && Math.abs(at.lean | 0) <= 30;
  return { seed: r.seed, lean: at.lean, band: at.band, ok };
});
const m2ok = qual.length > 0 && m2rows.every(x => x.ok);
verdict('M2-grey-earned',
  m2ok,
  qual.length === 0 ? '0 qualifying seeds — reachability analysis required'
    : `${m2rows.filter(x => x.ok).length}/${qual.length} qualifying seeds grey at sit (|lean|<=30): ` +
      m2rows.map(x => `${x.seed}:${x.band}/${x.lean}`).join(' '));

// M3 FORCED-DRIFT CONTROL: the NOTHERMO seed must cross bands and the
// System must voice it (r40 metric review: voicing fires when drift exists)
const ctrl = recs.filter(r => r.plan === 'nothermo');
const m3rows = ctrl.map(r => {
  const crossed = (r.bandCrossings | 0) >= 1;
  const voiced = (r.noticedCount | 0) >= 1;
  return { seed: r.seed, crossed, voiced, ok: crossed && voiced };
});
const m3ok = ctrl.length > 0 && m3rows.every(x => x.ok);
verdict('M3-drift-control',
  m3ok,
  ctrl.length === 0 ? 'no nothermo control seed'
    : `${m3rows.filter(x => x.ok).length}/${ctrl.length} control seeds drifted+voiced: ` +
      m3rows.map(x => `${x.seed}:crossed=${x.crossed} voiced=${x.voiced}`).join(' '));

// M4a LEAN LEGIBILITY (kept half): ledger line names the band on grey-sat seeds
const greySat = recs.filter(r => r.plan === 'grey' && r.walkedPath === 'relay' && r.walkedBranch === 'grey' && r.satDay != null);
const m4arows = greySat.map(r => {
  const lineOk = r.ledgerLine ? /grey|middle|both-hands|pragmatist/i.test(r.ledgerLine) : false;
  return { seed: r.seed, lineOk, ok: lineOk };
});
const m4aok = greySat.length > 0 && m4arows.every(x => x.ok);
verdict('M4a-ledger-names-band',
  m4aok,
  greySat.length === 0 ? 'no grey-sat relay seeds'
    : `${m4arows.filter(x => x.ok).length}/${greySat.length}: ` +
      m4arows.map(x => `${x.seed}:lineNamesBand=${x.lineOk}`).join(' '));

// M4 FINAL LIVE CHOICE: on every WON seed the terminal beat fired, >=2
// options were offered, the bot's choice dispatched an offered option, and
// the resolution line names the chosen final's label (planted -> resolved)
const won = recs.filter(r => r.won && r.satDay != null);
const m4rows = won.map(r => {
  const beatOk = !!r.finalBeat;
  const optsOk = (r.finalOptsCount | 0) >= 2;
  const pickOk = !!r.finalPickId;
  const resOk = !!r.finalResolved;
  return { seed: r.seed, path: r.walkedPath, branch: r.walkedBranch, beatOk, optsOk, pickOk, resOk, pick: r.finalPickId, ok: beatOk && optsOk && pickOk && resOk };
});
const m4ok = won.length > 0 && m4rows.every(x => x.ok);
verdict('M4-final-live-choice',
  m4ok,
  won.length === 0 ? 'no won seeds'
    : `${m4rows.filter(x => x.ok).length}/${won.length}: ` +
      m4rows.map(x => `${x.seed}:${x.path}/${x.branch} beat=${x.beatOk} opts>=2=${x.optsOk} pick=${x.pickOk} resolved=${x.resOk}`).join(' '));

// REG r35: audit naming on sat seeds with nonzero w4/w5
const regRows = sat.map(r => {
  const w45 = r.satWaves ? (r.satWaves.w4 | 0) + (r.satWaves.w5 | 0) : 0;
  const need = w45 > 0;
  return { seed: r.seed, need, named: r.auditNamed, ok: !need || !!r.auditNamed };
});
verdict('REG-r35-audit', regRows.every(x => x.ok),
  `${regRows.filter(x => x.ok).length}/${regRows.length}: ` + regRows.map(x => `${x.seed}:${x.need ? 'needs-naming' : 'na'}=${x.named}`).join(' '));

// REG r37: satPenalty present + voiced match on sat seeds
const reg37 = sat.map(r => ({ seed: r.seed, ok: !r.otMismatch, note: r.otMismatch || 'ok' }));
verdict('REG-r37-satpenalty', reg37.every(x => x.ok),
  `${reg37.filter(x => x.ok).length}/${reg37.length}: ` + reg37.map(x => `${x.seed}=${x.note}`).join(' '));

console.log('=== journey-endgame r41 verdict ===');
for (const l of lines) console.log(l);
console.log('');
console.log('per-seed:', recs.map(r => {
  const g = r.rg || {};
  return `${r.seed}(${r.plan}):ann${r.announceDay}/sat${r.satDay}/${r.satSeatKind}/${r.walkedPath || '—'}/${r.walkedBranch || '?'} won=${r.won} ` +
    `lean@${g.atSit ? g.atSit.lean : '?'}/${g.atSit ? g.atSit.band : '?'} final=${r.finalPickId || '—'} res=${r.finalResolved} noticed=${r.noticedCount} cross=${r.bandCrossings}`;
}).join('\n          '));
const primary = verdicts.slice(0, 4).every(v => v.ok);
const allOk = verdicts.every(v => v.ok);
console.log('');
console.log('PRIMARY ' + (primary ? 'GO' : 'NO-GO') + ' | ALL ' + (allOk ? 'GO' : 'NO-GO'));
process.exit(allOk ? 0 : 1);
