#!/usr/bin/env node
// analyze-endgame-r40-20261022.js — journey-endgame r40 verdict.
// Reads evidence/2026-10-22/perseed-endgame-r40/endgame-r40-*.json,
// evaluates the pre-registered bindings. Exit 0 = PRIMARY GO, 1 = NO-GO.
// Usage: node scripts/analyze-endgame-r40-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-22', 'perseed-endgame-r40');
const files = fs.readdirSync(DIR).filter(f => /^endgame-r40-\d+\.json$/.test(f)).sort();
const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

const lines = [];
const verdicts = [];
function verdict(id, ok, note) {
  verdicts.push({ id, ok: !!ok, note });
  lines.push(`${ok ? 'GO  ' : 'NO-GO'} ${id}: ${note}`);
}

// M1 GUARD: >=3/4 reach the window and sit
const sat = recs.filter(r => r.announceDay != null && r.satDay != null);
verdict('M1-guard', sat.length >= 3, `${sat.length}/${recs.length} seeds announced+sat`);

// qualifying seeds: relay held pre-sit, genuinely used
const qual = recs.filter(r => {
  const g = r.rg;
  return g && g.active && g.claimDone && (g.deepens | 0) >= 0 &&
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

// M3 GREY FINALS PLAY: on grey-sat seeds, a grey final offered + terminal
const greySat = recs.filter(r => r.walkedPath === 'relay' && r.walkedBranch === 'grey' && r.satDay != null);
const m3rows = greySat.map(r => {
  const g = r.rg || {};
  const offered = g.finalPick === 'both-hands' || g.finalPick === 'the-contract' ||
    (r.telemetry || []).some(t => t.type === 'table_won' && t.moral === 'grey');
  const terminal = (r.telemetry || []).some(t => t.type === 'table_won' || t.type === 'table_lost');
  return { seed: r.seed, offered, terminal, won: r.won, ok: offered && terminal };
});
const m3ok = greySat.length > 0 && m3rows.every(x => x.ok);
verdict('M3-grey-finals',
  m3ok,
  greySat.length === 0 ? 'no grey-sat relay seeds'
    : `${m3rows.filter(x => x.ok).length}/${greySat.length} grey walks offered+terminal: ` +
      m3rows.map(x => `${x.seed}:offered=${x.offered} terminal=${x.terminal} won=${x.won}`).join(' '));

// M4 LEAN LEGIBILITY: noticed >= 1 per grey run; ledger line names the band
const m4rows = greySat.map(r => {
  const noticedOk = (r.noticedCount | 0) >= 1;
  const lineOk = r.ledgerLine ? /grey|middle|both-hands|pragmatist/i.test(r.ledgerLine) : false;
  return { seed: r.seed, noticed: r.noticedCount, lineOk, ok: noticedOk && lineOk };
});
const m4ok = greySat.length > 0 && m4rows.every(x => x.ok);
verdict('M4-lean-legible',
  m4ok,
  greySat.length === 0 ? 'no grey-sat relay seeds'
    : `${m4rows.filter(x => x.ok).length}/${greySat.length}: ` +
      m4rows.map(x => `${x.seed}:noticed=${x.noticed} lineNamesBand=${x.lineOk}`).join(' '));

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

console.log('=== journey-endgame r40 verdict ===');
for (const l of lines) console.log(l);
console.log('');
console.log('per-seed:', recs.map(r => {
  const g = r.rg || {};
  return `${r.seed}:ann${r.announceDay}/sat${r.satDay}/${r.satSeatKind}/${r.walkedPath || '—'}/${r.walkedBranch || '?'} won=${r.won} ` +
    `lean@${g.atSit ? g.atSit.lean : '?'}/${g.atSit ? g.atSit.band : '?'} verbs=${g.verbs} communes=${g.communes} door=${g.doorRelay}x`;
}).join('\n          '));
const primary = verdicts.slice(0, 4).every(v => v.ok);
const allOk = verdicts.every(v => v.ok);
console.log('');
console.log('PRIMARY ' + (primary ? 'GO' : 'NO-GO') + ' | ALL ' + (allOk ? 'GO' : 'NO-GO'));
process.exit(allOk ? 0 : 1);
