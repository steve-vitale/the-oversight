#!/usr/bin/env node
// analyze-endgame-r50-20261025.js — journey-endgame r50 verdict.
// Reads evidence/2026-10-25/perseed-endgame-r50/endgame-r50-*.json,
// evaluates the pre-registered bindings (see journey-endgame-r50-prereg.md).
// Exit 0 = ALL GO, 1 = any NO-GO.
// Usage: node scripts/analyze-endgame-r50-20261025.js
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-25', 'perseed-endgame-r50');
const files = fs.readdirSync(DIR).filter(f => /^endgame-r50-\d+\.json$/.test(f)).sort();
const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

const lines = [];
const verdicts = [];
function verdict(id, ok, note) {
  verdicts.push({ id, ok: !!ok, note });
  lines.push(`${ok ? 'GO  ' : 'NO-GO'} ${id}: ${note}`);
}

// M1 GUARD (r49 restatement, scaled): >=5/7 seeds reach the window
// (announceDay != null) OR resolve via a voiced non-table path.
function voicedNonTable(r) {
  if (r.endReason === 'village-lost') return 'honest-death';
  try {
    const t = fs.readFileSync(path.join(DIR, `endgame-r50-${r.seed}-transcript.txt`), 'utf8');
    if (/PELLET HUMS/.test(t)) return 'reactor-honesty';
  } catch (e) {}
  return null;
}
const m1rows = recs.map(r => {
  const announced = r.announceDay != null;
  const nt = announced ? null : voicedNonTable(r);
  return { seed: r.seed, ok: announced || !!nt, note: announced ? `announced d${r.announceDay}` : (nt || 'no-window-no-voice') };
});
verdict('M1-guard', m1rows.filter(x => x.ok).length >= 5,
  `${m1rows.filter(x => x.ok).length}/${recs.length}: ` + m1rows.map(x => `${x.seed}:${x.note}`).join(' '));

// ARMORY (info only in r50 — the substrate check, not a binding this run):
// waves seeds with >=1 armory donation.
const wavesAll = recs.filter(r => r.plan === 'waves' || r.plan === 'wavesnw');
const armRows = wavesAll.map(r => ({
  seed: r.seed, don: (r.armory && r.armory.donations) || 0,
  craft: (r.armory && r.armory.craftDonations) || 0, ok: ((r.armory && r.armory.donations) || 0) >= 1,
}));
console.log('INFO armory: ' + armRows.filter(x => x.ok).length + '/' + armRows.length + ': ' +
  armRows.map(x => `${x.seed}:don=${x.don} craftDon=${x.craft}`).join(' | '));

// M2 CENSUS COMPLETE (THE instrument question): every committed wave-4
// fight on waves seeds carries a primary outcome, AND >=2/3 Arm A waves
// seeds record >=1 committed wave-4 fight.
const OUTCOMES = ['vKill', 'vDie', 'talkDown', 'vFlee', 'mFlee', 'otherEnd'];
const censusRows = wavesAll.map(r => {
  const fc = r.fightCensus || {};
  const fights = fc.fights || [];
  const okOut = fights.every(f => OUTCOMES.indexOf(f.outcome) >= 0);
  return { seed: r.seed, plan: r.plan, n: fights.length, okOut,
    nonCom: fc.nonCommittedW4 || 0, errs: fc.censusErrors || 0,
    dist: fights.map(f => f.outcome).join(',') || 'none' };
});
const armA = censusRows.filter(x => x.plan === 'waves');
const m2ok = censusRows.every(x => x.okOut) && armA.filter(x => x.n >= 1).length >= 2;
verdict('M2-census', m2ok,
  `armA-with-fights=${armA.filter(x => x.n >= 1).length}/3 allOutcomesNamed=${censusRows.every(x => x.okOut)}: ` +
  censusRows.map(x => `${x.seed}(${x.plan}):n=${x.n} [${x.dist}] nonCom=${x.nonCom} errs=${x.errs}`).join(' | '));

// Census distribution table (all waves seeds) + per-fight detail.
console.log('=== journey-endgame r50: fight-outcome census ===');
for (const r of wavesAll) {
  const fc = r.fightCensus || {};
  for (const f of (fc.fights || [])) {
    console.log(`${r.seed}(${r.plan}): d${f.startDay}-d${f.endDay} ${f.monsters.join('+')} turns=${f.turns} outcome=${f.outcome} kill=${f.killFlag} die=${f.dieFlag} talk=${f.talkDown} gotAway=${f.gotAway} pFled=${f.playerFled} vFled=${f.villFled} mFled=${f.monFled} result=${f.result} close=${f.closeWhy}`);
  }
}
const distAll = {};
for (const x of censusRows) for (const o of (x.dist === 'none' ? [] : x.dist.split(','))) distAll[o] = (distAll[o] | 0) + 1;
console.log('distribution (waves seeds): ' + JSON.stringify(distAll));

// M3 CONVERSION: Arm B total wave-4+ kills > Arm A total wave-4+ kills.
const killsOf = (plan) => wavesAll.filter(r => r.plan === plan)
  .reduce((t, r) => t + ((r.veterans && r.veterans.w4plusKills) || 0), 0);
const killsA = killsOf('waves'), killsB = killsOf('wavesnw');
verdict('M3-conversion', killsB > killsA,
  `armB kills=${killsB} vs armA kills=${killsA}: ` +
  wavesAll.map(r => `${r.seed}(${r.plan}):kills=${((r.veterans || {}).w4plusKills | 0)}`).join(' | '));

// M3b LIVING VETERAN (carried): >=1/6 waves seeds ends with >=1 living veteran.
const m3brows = wavesAll.map(r => {
  const v = r.veterans || {};
  return { seed: r.seed, living: (v.livingVeteranCount | 0), bar: (v.rd5veterans | 0),
    kills: (v.w4plusKills | 0), fights: (v.vetFights | 0), uw: v.unlockedWave };
});
verdict('M3b-veteran', m3brows.some(x => x.living >= 1),
  m3brows.filter(x => x.living >= 1).length + '/' + m3brows.length + ': ' +
  m3brows.map(x => `${x.seed}:living=${x.living} bar=${x.bar} kills=${x.kills} vetTurns=${x.fights} uw=${x.uw}`).join(' | '));

// M4 WAVE-5 OPEN / FULL-SEAT REACH (carried): >=1/6 waves seeds unlocks
// wave 5 OR earns the full seat.
const m4rows = wavesAll.map(r => {
  const fs50 = r.fullseat || {};
  const v = r.veterans || {};
  const got = (v.unlockedWave | 0) >= 5 || fs50.firstFullSeatDay != null;
  return { seed: r.seed, got, uw: v.unlockedWave, full: fs50.firstFullSeatDay, best: fs50.bestSeat || '?' };
});
verdict('M4-wave5-or-full', m4rows.some(x => x.got),
  m4rows.filter(x => x.got).length + '/' + m4rows.length + ': ' +
  m4rows.map(x => `${x.seed}:${x.got ? 'OPEN' : 'closed'} uw=${x.uw} full=${x.full == null ? 'never' : 'd' + x.full} best=${x.best}`).join(' | '));

// M5 VOICING CANONICAL: 88054 (forcedrift) — crossings >= 1 AND notices >= 1.
const ctrl = recs.filter(r => r.plan === 'forcedrift');
const m5rows = ctrl.map(r => {
  const crossed = (r.bandCrossings | 0) >= 1;
  const voiced = (r.noticedCount | 0) >= 1;
  return { seed: r.seed, crossed, voiced, ok: crossed && voiced };
});
const m5ok = ctrl.length > 0 && m5rows.every(x => x.ok);
verdict('M5-voicing-canonical', m5ok,
  ctrl.length === 0 ? 'no forcedrift control seed'
    : `${m5rows.filter(x => x.ok).length}/${ctrl.length}: ` +
      m5rows.map(x => `${x.seed}:crossed=${x.crossed} voiced=${x.voiced}`).join(' '));

// M6 GUARD NAMED (deferred scope, carried): every sat waves seed with
// deferDays >= 1 records a named window-end guard (not 'unknown').
const satWavesDef = recs.filter(r => (r.plan === 'waves' || r.plan === 'wavesnw') && r.satDay != null && (r.deferDays | 0) >= 1);
const m6rows = satWavesDef.map(r => ({ seed: r.seed, g: r.windowEndGuard, ok: r.windowEndGuard != null && r.windowEndGuard !== 'unknown' }));
verdict('M6-guard-named-deferred', satWavesDef.length > 0 && m6rows.every(x => x.ok),
  `${m6rows.filter(x => x.ok).length}/${satWavesDef.length} deferred sat waves named: ` +
  m6rows.map(x => `${x.seed}:guard=${x.g}`).join(' | '));

// Vetguard trace (info): per waves seed, guard-trace decision sequence.
console.log('=== journey-endgame r50: vetguard trace + same-day fix check ===');
for (const r of wavesAll) {
  const gt = r.guardTrace || [];
  const seq = gt.map(e => `d${e.day}:${e.decision}${e.vets != null ? '(v' + e.vets + ')' : ''}`).join(' ');
  const sameDay = r.announceDay != null && r.satDay != null && r.deferDays === 0;
  console.log(`${r.seed}: defer=${r.deferDays} endGuard=${r.windowEndGuard} bankedEnd=${r.windowEndGuard === 'veteran-banked'} sameDay=${sameDay} trace=[${seq}]`);
}

// Full-seat component reach table (from max).
const BARS45 = { w1: 5, w2: 5, w3: 4, w4: 3, w5: 2, contests: 3, crises: 3, stage: 2 };
function bindingFromMax(fs50) {
  const m = (fs50 && fs50.max) || {};
  const b = [];
  for (const k of Object.keys(BARS45)) if ((m[k] | 0) < BARS45[k]) b.push(`${k}:${m[k] | 0}/${BARS45[k]}`);
  const fd = (fs50.sentDay != null && fs50.surgeDay != null) ? null
    : `foodDeeds:${fs50.sentDay != null ? 'sent' : 'no-sent'}+${fs50.surgeDay != null ? 'surge' : 'no-surge'}`;
  if (fd) b.push(fd);
  return b;
}
console.log('=== journey-endgame r50: full-seat component reach (from max) ===');
for (const r of recs) {
  const fs50 = r.fullseat || {};
  console.log(`${r.seed}(${r.plan}): defer=${r.deferDays == null ? 'na' : r.deferDays + 'd'} greedyWaits=${(r.greedy && r.greedy.waits) || 0} armDon=${(r.armory && r.armory.donations) || 0} guard=${r.windowEndGuard} maxTier=${r.maxTier} satPen=${r.satPenalty ? JSON.stringify(r.satPenalty) : 'na'} otLines=${r.overtimeLines | 0} best=${fs50.bestSeat} ` +
    `firstFull=${fs50.firstFullSeatDay == null ? 'never' : 'd' + fs50.firstFullSeatDay} ` +
    `indispEver=${fs50.indispEver} standing_max=${(fs50.max || {}).standing} ` +
    `binding=[${bindingFromMax(fs50).join(', ')}]`);
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
console.log('=== journey-endgame r50 verdict ===');
for (const l of lines) console.log(l);
console.log('');
console.log('per-seed:', recs.map(r => {
  const fs45 = r.fullseat || {};
  return `${r.seed}(${r.plan}):ann${r.announceDay}/sat${r.satDay}/${r.satSeatKind || '—'}/${r.walkedPath || '—'}/${r.walkedBranch || '?'} won=${r.won} end=${r.endReason} ` +
    `census=${((r.fightCensus && r.fightCensus.fights) || []).map(f => f.outcome).join(',') || 'none'} nonCom=${(r.fightCensus && r.fightCensus.nonCommittedW4) || 0} ` +
    `full=${fs45.firstFullSeatDay == null ? 'never' : 'd' + fs45.firstFullSeatDay} w5max=${((fs45.max || {}).w5 | 0)} ` +
    `final=${r.finalPickId || '—'} res=${r.finalResolved} noticed=${r.noticedCount} cross=${r.bandCrossings} ` +
    `vetLiving=${((r.veterans || {}).livingVeteranCount | 0)} vetFights=${((r.veterans || {}).vetFights | 0)} dpsBails=${((r.veterans || {}).vetDpsFledSeen | 0)} uw=${(r.veterans || {}).unlockedWave}`;
}).join('\n          '));
const primary = ['M1-guard', 'M2-census', 'M3-conversion', 'M4-wave5-or-full'].every(id => (verdicts.find(v => v.id === id) || {}).ok);
const allOk = verdicts.every(v => v.ok);
console.log('');
console.log('PRIMARY ' + (primary ? 'GO' : 'NO-GO') + ' | ALL ' + (allOk ? 'GO' : 'NO-GO'));
process.exit(allOk ? 0 : 1);
