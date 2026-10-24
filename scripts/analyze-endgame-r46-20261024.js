#!/usr/bin/env node
// analyze-endgame-r46-20261024.js — journey-endgame r46 verdict.
// Reads evidence/2026-10-24/perseed-endgame-r46/endgame-r46-*.json,
// evaluates the pre-registered bindings. Exit 0 = ALL GO, 1 = any NO-GO.
// Usage: node scripts/analyze-endgame-r46-20261024.js
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-24', 'perseed-endgame-r46');
const files = fs.readdirSync(DIR).filter(f => /^endgame-r46-\d+\.json$/.test(f)).sort();
const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

const lines = [];
const verdicts = [];
function verdict(id, ok, note) {
  verdicts.push({ id, ok: !!ok, note });
  lines.push(`${ok ? 'GO  ' : 'NO-GO'} ${id}: ${note}`);
}

// M1 GUARD (r44 restatement): >=3/4 reach the window
// (announceDay != null) OR resolve via a voiced non-table path.
// Voiced non-table paths: (a) the reactor priced refusal (PELLET HUMS beat
// in the transcript), (b) honest death-scatter (endReason village-lost).
function voicedNonTable(r) {
  if (r.endReason === 'village-lost') return 'honest-death';
  try {
    const t = fs.readFileSync(path.join(DIR, `endgame-r46-${r.seed}-transcript.txt`), 'utf8');
    if (/PELLET HUMS/.test(t)) return 'reactor-honesty';
  } catch (e) {}
  return null;
}
const m1rows = recs.map(r => {
  const announced = r.announceDay != null;
  const nt = announced ? null : voicedNonTable(r);
  return { seed: r.seed, ok: announced || !!nt, note: announced ? `announced d${r.announceDay}` : (nt || 'no-window-no-voice') };
});
verdict('M1-guard', m1rows.filter(x => x.ok).length >= 3,
  `${m1rows.filter(x => x.ok).length}/${recs.length}: ` + m1rows.map(x => `${x.seed}:${x.note}`).join(' '));

// M2 VETERAN KILLS (the leg's question): >=1/3 waves seeds ends with
// >=1 LIVING veteran (veterans.livingVeteranCount >= 1). Strong form:
// >=1 seed reaches veterans 2/2 (the bar met).
const waves = recs.filter(r => r.plan === 'waves');
const m2rows = waves.map(r => {
  const v = r.veterans || {};
  return { seed: r.seed, living: (v.livingVeteranCount | 0), bar: (v.rd5veterans | 0),
    short: (v.rd5short || []).join(','), kills: (v.w4plusKills | 0),
    fights: (v.vetFights | 0), dpsBails: (v.vetDpsFledSeen | 0), uw: v.unlockedWave };
});
verdict('M2-veteran-kills', m2rows.some(x => x.living >= 1),
  m2rows.filter(x => x.living >= 1).length + '/' + m2rows.length + ': ' +
  m2rows.map(x => `${x.seed}:living=${x.living} bar=${x.bar} kills=${x.kills} vetFights=${x.fights} dpsBails=${x.dpsBails} uw=${x.uw} short=${x.short}`).join(' | '));

// M3 WAVE-5 OPEN / FULL-SEAT REACH: >=1/3 waves seeds unlocks wave 5
// (veterans.unlockedWave >= 5) OR earns the full seat (diag
// firstFullSeatDay != null). Strong hypothesis, falsifiable.
const m3rows = waves.map(r => {
  const fs46 = r.fullseat || {};
  const v = r.veterans || {};
  const got = (v.unlockedWave | 0) >= 5 || fs46.firstFullSeatDay != null;
  return { seed: r.seed, got, uw: v.unlockedWave, full: fs46.firstFullSeatDay, best: fs46.bestSeat || '?' };
});
verdict('M3-wave5-or-full', m3rows.some(x => x.got),
  m3rows.filter(x => x.got).length + '/' + m3rows.length + ': ' +
  m3rows.map(x => `${x.seed}:${x.got ? 'OPEN' : 'closed'} uw=${x.uw} full=${x.full == null ? 'never' : 'd' + x.full} best=${x.best}`).join(' | '));

// M4 VOICING CANONICAL: 88014 (forcedrift, capable substrate) — crossings >= 1 AND notices >= 1
const ctrl = recs.filter(r => r.plan === 'forcedrift');
const m4rows = ctrl.map(r => {
  const crossed = (r.bandCrossings | 0) >= 1;
  const voiced = (r.noticedCount | 0) >= 1;
  return { seed: r.seed, crossed, voiced, ok: crossed && voiced };
});
const m4ok = ctrl.length > 0 && m4rows.every(x => x.ok);
verdict('M4-voicing-canonical', m4ok,
  ctrl.length === 0 ? 'no forcedrift control seed'
    : `${m4rows.filter(x => x.ok).length}/${ctrl.length}: ` +
      m4rows.map(x => `${x.seed}:crossed=${x.crossed} voiced=${x.voiced}`).join(' '));

// per-seed full-seat component reach table (the binding-blocker datum).
// Binding recomputed from max reach via the same bars the diag uses
// (progression.js:613): w1>=5 w2>=5 w3>=4 w4>=3 w5>=2 contests>=3 crises>=3
// stage>=2 foodDeeds(sentiment && surge).
const BARS45 = { w1: 5, w2: 5, w3: 4, w4: 3, w5: 2, contests: 3, crises: 3, stage: 2 };
function bindingFromMax(fs45) {
  const m = (fs45 && fs45.max) || {};
  const b = [];
  for (const k of Object.keys(BARS45)) if ((m[k] | 0) < BARS45[k]) b.push(`${k}:${m[k] | 0}/${BARS45[k]}`);
  const fd = (fs45.sentDay != null && fs45.surgeDay != null) ? null
    : `foodDeeds:${fs45.sentDay != null ? 'sent' : 'no-sent'}+${fs45.surgeDay != null ? 'surge' : 'no-surge'}`;
  if (fd) b.push(fd);
  return b;
}
console.log('=== journey-endgame r46: full-seat component reach (from max) ===');
for (const r of recs) {
  const fs45 = r.fullseat || {};
  console.log(`${r.seed}(${r.plan}): best=${fs45.bestSeat} ` +
    `firstFull=${fs45.firstFullSeatDay == null ? 'never' : 'd' + fs45.firstFullSeatDay} ` +
    `indispEver=${fs45.indispEver} standing_max=${(fs45.max || {}).standing} ` +
    `binding=[${bindingFromMax(fs45).join(', ')}]`);
}

// REG r35: audit naming on sat seeds with nonzero w4/w5
const sat = recs.filter(r => r.announceDay != null && r.satDay != null);
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

console.log('');
console.log('=== journey-endgame r46 verdict ===');
for (const l of lines) console.log(l);
console.log('');
console.log('per-seed:', recs.map(r => {
  const fs45 = r.fullseat || {};
  return `${r.seed}(${r.plan}):ann${r.announceDay}/sat${r.satDay}/${r.satSeatKind || '—'}/${r.walkedPath || '—'}/${r.walkedBranch || '?'} won=${r.won} end=${r.endReason} ` +
    `full=${fs45.firstFullSeatDay == null ? 'never' : 'd' + fs45.firstFullSeatDay} w5max=${((fs45.max || {}).w5 | 0)} ` +
    `final=${r.finalPickId || '—'} res=${r.finalResolved} noticed=${r.noticedCount} cross=${r.bandCrossings} ` +
    `vetLiving=${((r.veterans || {}).livingVeteranCount | 0)} vetFights=${((r.veterans || {}).vetFights | 0)} dpsBails=${((r.veterans || {}).vetDpsFledSeen | 0)} uw=${(r.veterans || {}).unlockedWave}`;
}).join('\n          '));
const primary = verdicts.slice(0, 4).every(v => v.ok);
const allOk = verdicts.every(v => v.ok);
console.log('');
console.log('PRIMARY ' + (primary ? 'GO' : 'NO-GO') + ' | ALL ' + (allOk ? 'GO' : 'NO-GO'));
process.exit(allOk ? 0 : 1);
