#!/usr/bin/env node
// analyze-endgame-r43-20261023.js — journey-endgame r43 verdict.
// Reads evidence/2026-10-23/perseed-endgame-r43/endgame-r43-*.json,
// evaluates the pre-registered bindings. Exit 0 = ALL GO, 1 = any NO-GO.
// Usage: node scripts/analyze-endgame-r43-20261023.js
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-23', 'perseed-endgame-r43');
const files = fs.readdirSync(DIR).filter(f => /^endgame-r43-\d+\.json$/.test(f)).sort();
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

// M2 VOICING CANONICAL: 85012 (forcedrift) — crossings >= 1 AND notices >= 1
const ctrl = recs.filter(r => r.plan === 'forcedrift');
const m2rows = ctrl.map(r => {
  const crossed = (r.bandCrossings | 0) >= 1;
  const voiced = (r.noticedCount | 0) >= 1;
  return { seed: r.seed, crossed, voiced, ok: crossed && voiced };
});
const m2ok = ctrl.length > 0 && m2rows.every(x => x.ok);
verdict('M2-voicing-canonical',
  m2ok,
  ctrl.length === 0 ? 'no forcedrift control seed'
    : `${m2rows.filter(x => x.ok).length}/${ctrl.length}: ` +
      m2rows.map(x => `${x.seed}:crossed=${x.crossed} voiced=${x.voiced}`).join(' '));

// M2b VOICING DEEP: 85013 (forcedrift-deep, 2 forced reroutes/day)
const deep = recs.filter(r => r.plan === 'forcedrift-deep');
const m2brows = deep.map(r => {
  const crossed = (r.bandCrossings | 0) >= 1;
  const voiced = (r.noticedCount | 0) >= 1;
  return { seed: r.seed, crossed, voiced, ok: crossed && voiced };
});
const m2bok = deep.length > 0 && m2brows.every(x => x.ok);
verdict('M2b-voicing-deep',
  m2bok,
  deep.length === 0 ? 'no forcedrift-deep seed'
    : `${m2brows.filter(x => x.ok).length}/${deep.length}: ` +
      m2brows.map(x => `${x.seed}:crossed=${x.crossed} voiced=${x.voiced}`).join(' '));

// M3 GREY ROAD CONTINUITY: 85011 qualifies (held, >=5 verbs, >=1 commune)
// -> at-sit band grey AND |lean| <= 30
const qual = recs.filter(r => {
  const g = r.rg;
  return r.plan === 'grey' && g && g.active && g.claimDone &&
    (g.verbs | 0) >= 5 && (g.communes | 0) >= 1 && r.satDay != null;
});
const m3rows = qual.map(r => {
  const at = (r.rg && r.rg.atSit) || {};
  const ok = at.band === 'grey' && Math.abs(at.lean | 0) <= 30;
  return { seed: r.seed, lean: at.lean, band: at.band, ok };
});
const m3ok = qual.length > 0 && m3rows.every(x => x.ok);
verdict('M3-grey-continuity',
  m3ok,
  qual.length === 0 ? '0 qualifying grey seeds — reachability analysis required'
    : `${m3rows.filter(x => x.ok).length}/${qual.length}: ` +
      m3rows.map(x => `${x.seed}:${x.band}/${x.lean}`).join(' '));

// M4 DOOR CENSUS (binding as measured+reported): on each sitting base seed
// the relay-door datum is complete
const baseSat = recs.filter(r => r.plan === 'base' && r.satDay != null);
const m4rows = baseSat.map(r => {
  const d = r.relayDoor || {};
  const need = ['heldAtSit', 'leanAtSit', 'bandAtSit', 'bondAtSit', 'groundingAtSit', 'doorWalked'];
  const missing = need.filter(k => d[k] == null);
  const offerOk = Array.isArray(d.doorsOffered) && d.doorsOffered.length > 0;
  return { seed: r.seed, ok: missing.length === 0 && offerOk, missing, offerOk, door: d };
});
const m4ok = baseSat.length > 0 && m4rows.every(x => x.ok);
verdict('M4-door-census',
  m4ok,
  baseSat.length === 0 ? 'no sitting base seeds — census impossible'
    : `${m4rows.filter(x => x.ok).length}/${baseSat.length} complete: ` +
      m4rows.map(x => {
        const d = x.door;
        return `${x.seed}:held=${d.heldAtSit} bond=${d.bondAtSit} lean=${d.leanAtSit}/${d.bandAtSit} ` +
          `cap{claim:${d.capClaimed} ans:${d.capAnswers} com:${d.capCommunes} rre:${d.capReroutes}} ` +
          `walked=${d.doorWalked}${x.ok ? '' : ' MISSING:' + x.missing.join(',') + ' offerOk=' + x.offerOk}`;
      }).join(' | '));

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

console.log('=== journey-endgame r43 verdict ===');
for (const l of lines) console.log(l);
console.log('');
console.log('per-seed:', recs.map(r => {
  const g = r.rg || {};
  const d = r.relayDoor || {};
  return `${r.seed}(${r.plan}):ann${r.announceDay}/sat${r.satDay}/${r.satSeatKind}/${r.walkedPath || '—'}/${r.walkedBranch || '?'} won=${r.won} ` +
    `lean@${g.atSit ? g.atSit.lean : '?'}/${g.atSit ? g.atSit.band : '?'} final=${r.finalPickId || '—'} res=${r.finalResolved} noticed=${r.noticedCount} cross=${r.bandCrossings} ` +
    `door{held=${d.heldAtSit} lean=${d.leanAtSit}/${d.bandAtSit} walked=${d.doorWalked}}`;
}).join('\n          '));
// wave-deed census (reported): w4/w5 deeds per sat seed
console.log('');
console.log('wave-deed census:', sat.map(r => {
  const w = r.satWaves || {};
  return `${r.seed}:w1=${w.w1 | 0} w2=${w.w2 | 0} w3=${w.w3 | 0} w4=${w.w4 | 0} w5=${w.w5 | 0}`;
}).join(' '));
const primary = verdicts.slice(0, 5).every(v => v.ok);
const allOk = verdicts.every(v => v.ok);
console.log('');
console.log('PRIMARY ' + (primary ? 'GO' : 'NO-GO') + ' | ALL ' + (allOk ? 'GO' : 'NO-GO'));
process.exit(allOk ? 0 : 1);
