#!/usr/bin/env node
// R185 = r182 analyzer verbatim EXCEPT input dir, r182->r185, + the
// r185 prereg revisions: M21 full-seat exemption via direct satWaves
// deed-bar check (5/5/4/3/2); M23 counts only refusals-despite-ready;
// M25-buyout DROPPED from the printed set; --wide flag gates the wide
// pass to M25c + starvation only. M24b/M25c/M2b/CAPSTONE/BUYOUT
// sections carried from r182. DIR overridable via ANALYZEDIR env
// (pass B reads perseed-endgame-r185-b, pass C perseed-endgame-r185-c,
// pass C-wide perseed-endgame-r185-cwide).
// PRIMARY-BINDINGS headline (r135 metric review, adopted by the r156 prereg, carried by r178
// prereg): bindings-only PRIMARY beside legacy PRIMARY and ALL.
// The M10 revision (r129 metric review, adopted by the r135 prereg): a sat
// seed meeting all full bars but sitting lesser passes with
// gap='seat-kind: lesser despite full bars met'.
// analyze-endgame-r185-20261111.js — journey-endgame r185 verdict.
// R128 = r124 analyzer verbatim EXCEPT input dir, r124->r135, and the
// HURTRETURN + FALLEN-ambush sections below (both named in the r135 prereg).
// analyze-endgame-r185-20261111.js — journey-endgame r185 verdict.
// R118 = r110 analyzer verbatim EXCEPT: MFLEE-ROUTED + SIT-DAY-DEATHS
// sections (r110's metric review) and the r124 input dir. Matched
// comparison to r110 lives in compare-endgame-r135-vs-r110.js.
// Reads evidence/2026-11-12/perseed-endgame-r185/endgame-r185-*.json,
// evaluates the pre-registered bindings (see journey-endgame-r185-prereg.md).
// Exit 0 = ALL GO, 1 = any NO-GO.
// Usage: node scripts/analyze-endgame-r185-20261111.js
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.env.ANALYZEDIR || path.join(__dirname, '..', 'evidence', '2026-11-12', 'perseed-endgame-r185');
const files = fs.readdirSync(DIR).filter(f => /^endgame-r185-\d+\.json$/.test(f)).sort();
const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

// R185 --wide (r182 metric review): the C-wide pass is judged on M25c +
// starvation only. In wide mode, console.log is gated to the M25c verdict
// line, the STARVATION section, and the WIDE-VERDICT line; every section
// still computes (verdicts are recorded but neither printed nor judged).
// console.error is never gated, so a crash still shows its trace.
const WIDE = process.argv.includes('--wide');
if (WIDE) {
  const _log = console.log;
  console.log = (...a) => { const s = a.join(' '); if (/M25c-buyout-early|STARVATION|WIDE-VERDICT/.test(s)) _log(...a); };
}

const lines = [];
const verdicts = [];
function verdict(id, ok, note) {
  verdicts.push({ id, ok: !!ok, note });
  lines.push(`${ok ? 'GO  ' : 'NO-GO'} ${id}: ${note}`);
}

// M1 GUARD (r49 restatement, PILOT-scaled per r124 prereg): >=3/4 seeds reach the window
// (announceDay != null) OR resolve via a voiced non-table path.
function voicedNonTable(r) {
  if (r.endReason === 'village-lost') return 'honest-death';
  if (r.endReason === 'survived') return 'survived'; // r156 metric review: surviving the window honestly is a voiced non-table resolution
  if (r.withdrawal) return 'withdrawal';
  try {
    const t = fs.readFileSync(path.join(DIR, `endgame-r185-${r.seed}-transcript.txt`), 'utf8');
    if (/PELLET HUMS/.test(t)) return 'withdrawal';
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

// M2c ENGINE COVERAGE (carried instrument question): census fights ==
// distinct wave-4 opens (engine opens + policy-only opens), no errors,
// no double-count.
const m2crows = wavesAll.map(r => {
  const fc = r.fightCensus || {};
  const opens = (fc.engineOpensW4 | 0) + (fc.policyOnlyOpensW4 | 0);
  const n = (fc.fights || []).length;
  return { seed: r.seed, n, opens, eng: fc.engineOpensW4 | 0, pol: fc.policyOnlyOpensW4 | 0, errs: fc.censusErrors | 0, ok: n === opens && (fc.censusErrors | 0) === 0 };
});
verdict('M2c-engine-coverage', m2crows.every(x => x.ok),
  `${m2crows.filter(x => x.ok).length}/${m2crows.length}: ` +
  m2crows.map(x => `${x.seed}:fights=${x.n} opens=${x.opens}(eng=${x.eng}+pol=${x.pol}) errs=${x.errs}`).join(' | '));

// M2d COMMIT-GATE NAMED (carried instrument question): every committed=false
// census fight on waves seeds carries a gate classification:
// never-observed (engine-only daily-round fight), gate:<component>
// (observed, that gate failed), or gate-passed-uncommitted (observed,
// gate passed, flags still unset — the wrapper-path finding). A
// committed=false fight with NO snapshot is NO-GO and is named.
function gateClass(f) {
  if (!f.turnsObserved) return 'never-observed';
  const g = f.gateAtFirstObserve || f.gateAtOpen || null;
  if (!g || g.error) return 'missing-snapshot';
  if (!g.vetcommitOn) return 'gate:vetcommit-off';
  if (g.uw < 4 || g.uw >= 5) return 'gate:uw=' + g.uw;
  if (!g.veteransShort) return 'gate:veterans-met';
  if (g.hpPct < 0.5) return 'gate:hp=' + g.hpPct;
  return 'gate-passed-uncommitted';
}
const uncomFights = [];
for (const r of wavesAll) {
  const fc = r.fightCensus || {};
  for (const f of (fc.fights || [])) {
    if (f.committed === false) uncomFights.push({ seed: r.seed, plan: r.plan, fight: f, cls: gateClass(f) });
  }
}
verdict('M2d-gate-named', uncomFights.every(x => x.cls !== 'missing-snapshot'),
  `uncommitted=${uncomFights.length} classified=${uncomFights.filter(x => x.cls !== 'missing-snapshot').length}/${uncomFights.length}: ` +
  (uncomFights.map(x => {
    const f = x.fight, g = f.gateAtFirstObserve || f.gateAtOpen || {};
    return `${x.seed}:d${f.startDay} ${f.monsters.join('+')}(${f.outcome},src=${f.source},obs=${!!f.turnsObserved}) cls=${x.cls} gate={uw:${g.uw},vetsShort:${g.veteransShort},hp:${g.hpPct},live:${g.commitLive},ctx:${f.ctxCommitAtFirstObserve}}`;
  }).join(' | ') || 'none'));

// r54 WATCH TABLES: vFlee split positives + withdrawal positives.
console.log('=== journey-endgame r95: vFlee watch ===');
for (const r of wavesAll) {
  const fc = r.fightCensus || {};
  for (const f of (fc.fights || [])) {
    if (f.outcome === 'vFlee') console.log(`${r.seed}(${r.plan}): d${f.startDay} ${f.monsters.join('+')} escapeKind=${f.escapeKind} source=${f.source} committed=${f.committed}`);
  }
}
console.log('=== journey-endgame r95: withdrawal watch ===');
for (const r of recs) {
  if (r.withdrawal) console.log(`${r.seed}(${r.plan}): withdrawal day=${r.withdrawal.day != null ? r.withdrawal.day : '?'} line=${String(r.withdrawal.line || '').slice(0, 160)}`);
}

// M2b ATTRIBUTION (REVISED RULE, r178 prereg §M2b REVISION): diedInFight
// is party-restricted (open-snapshot non-monster fighters + explicit
// scholar-death read); the roster-wide day-window list rides as
// diedDayWindow for audit. Every dieFlag fight is classified
// causal-vs-daywindow; >=1 dieFlag fight (if any exist) carries >=1
// NAMED fight-causal death. NO-DATA if no dieFlag fights.
const dieFights = [];
for (const r of wavesAll) {
  const fc = r.fightCensus || {};
  for (const f of (fc.fights || [])) {
    if (f.dieFlag) dieFights.push({ seed: r.seed, plan: r.plan, fight: f });
  }
}
if (dieFights.length === 0) {
  lines.push('NO-DATA M2b-attribution: no dieFlag fights on waves seeds (nothing to attribute)');
} else {
  const classified = dieFights.every(x => Array.isArray(x.fight.causalDeaths));
  const named = dieFights.filter(x => (x.fight.causalDeaths || []).length >= 1);
  verdict('M2b-attribution', classified && named.length >= 1,
    `dieFlag=${dieFights.length} classified=${classified} named>=1: ${named.length}/${dieFights.length}: ` +
    dieFights.map(x => {
      const cd = x.fight.causalDeaths || [];
      const names = cd.map(d => `${d.name || d.vid}(${d.channel}/${d.cause || '?'})`).join('+') || 'day-window-only';
      return `${x.seed}:d${x.fight.startDay} ${x.fight.monsters.join('+')} diedParty=${(x.fight.diedInFight || []).join(',') || 'none'} scholarDied=${!!x.fight.scholarDiedInFight} diedDayWindow=${(x.fight.diedDayWindow || []).join(',') || 'none'}${x.fight.partyFallback ? ' PARTY-FALLBACK' : ''} causal=[${names}]`;
    }).join(' | '));
}

// M8 EXIT CANON (r51): every mFlee census fight matched to its monster's
// codex slain text (designed-outcome vs flight vs scripted-departure is
// judged in the run note; the analyzer prints the evidence).
let MON = null;
try {
  MON = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8'));
} catch (e) {}
function slainText(mid) {
  if (!MON) return 'monsters.json unreadable';
  let found = null;
  const walk = (o) => {
    if (found) return;
    if (Array.isArray(o)) { for (const v of o) walk(v); return; }
    if (o && typeof o === 'object') {
      if (o.id === mid) { found = o; return; }
      for (const v of Object.values(o)) walk(v);
    }
  };
  walk(MON);
  if (!found) return 'monster not in monsters.json';
  const cs = found.codexStages || {};
  return (cs.slain || 'no slain stage').slice(0, 280);
}
const mFleeFights = [];
for (const r of wavesAll) {
  const fc = r.fightCensus || {};
  for (const f of (fc.fights || [])) if (f.outcome === 'mFlee') mFleeFights.push({ seed: r.seed, plan: r.plan, fight: f });
}
console.log('=== journey-endgame r95: exit canon (mFlee fights x codex slain) ===');
for (const x of mFleeFights) {
  for (const mid of x.fight.monsters) {
    console.log(`${x.seed}(${x.plan}): d${x.fight.startDay} ${mid} turns=${x.fight.turns} gotAway=${x.fight.gotAway} result=${x.fight.result} :: ${slainText(mid)}`);
  }
}
if (mFleeFights.length === 0) {
  lines.push('VACUOUS M8-exit-canon: 0 mFlee fights in block — conditional binding does not gate PRIMARY (r68 metric-review fix, applied r71)');
} else {
  verdict('M8-exit-canon', mFleeFights.every(x => x.fight.monsters.every(mid => slainText(mid) !== 'monster not in monsters.json' && slainText(mid) !== 'no slain stage')),
    `${mFleeFights.length} mFlee fights, all matched to a codex slain stage: ` +
    mFleeFights.map(x => `${x.seed}:${x.fight.monsters.join('+')}`).join(' | '));
}

// M9 SUPPLY (r51): blocked wave-4 arrivals recorded with cause lines.
// R101 GAP 3 (r98 metric-review): the old label called this count
// 'blocked wave-4 arrivals' when it summed ALL blocked arrivals.
// Report total + wave split; the count itself is unchanged (series
// comparability), only the label is corrected.
console.log('=== journey-endgame r105: blocked arrivals (supply, total + wave split) ===');
let blockedTotal = 0, blockedW4 = 0, blockedW5 = 0, blockedOther = 0;
for (const r of recs) {
  const ba = r.blockedArrivals || [];
  blockedTotal += ba.length;
  blockedW4 += ba.filter(b => b.wave === 4).length;
  blockedW5 += ba.filter(b => b.wave === 5).length;
  blockedOther += ba.filter(b => b.wave !== 4 && b.wave !== 5).length;
  for (const b of ba) console.log(`${r.seed}(${r.plan}): d${b.day != null ? b.day : '?'} w${b.wave != null ? b.wave : '?'} monster=${b.monster || 'unnamed'} :: ${b.line}`);
  if (!ba.length) console.log(`${r.seed}(${r.plan}): no blocked arrivals observed`);
}
lines.push(`INFO M9-supply: ${blockedTotal} blocked arrivals total across ${recs.length} seeds (w4=${blockedW4} w5=${blockedW5} other/unmapped=${blockedOther}; see table above; GO/NO-GO judged in the run note against the code rule, not by count)`);

// Death-channel summary (r51): every recorded person-death with its fight context.
console.log('=== journey-endgame r95: death records (channel x fight context) ===');
for (const r of recs) {
  const drs = r.deathRecords || [];
  console.log(`${r.seed}(${r.plan}): deaths=${drs.length} wrapErrors=${r.deathWrapErrors | 0}`);
  for (const d of drs) {
    console.log(`  d${d.day} ${d.name || d.vid} via=${d.channel} cause=${d.cause || '?'} fightLive=${d.fightLive} fightOver=${d.fightOver} mons=${(d.monsters || []).map(m => m.id + '/w' + m.wave).join('+') || 'none'}`);
  }
}

// Census distribution table (all waves seeds) + per-fight detail.
console.log('=== journey-endgame r95: fight-outcome census ===');
for (const r of wavesAll) {
  const fc = r.fightCensus || {};
  for (const f of (fc.fights || [])) {
    console.log(`${r.seed}(${r.plan}): d${f.startDay}-d${f.endDay} ${f.monsters.join('+')} turns=${f.turns}${f.turnsObserved ? '' : '(turns-unobs)'} outcome=${f.outcome} src=${f.source || '?'} esc=${f.escapeKind || '?'} drv=${f.openDriver || '?'} com=${f.committed !== false} arena=${f.arenaMention ? 'Y' : 'n'} deathCauses=${(f.deathCauses || []).join(',') || 'none'} kill=${f.killFlag} die=${f.dieFlag} talk=${f.talkDown} gotAway=${f.gotAway} pFled=${f.playerFled} vFled=${f.villFled} mFled=${f.monFled} result=${f.result} close=${f.closeWhy} causal=${(f.causalDeaths || []).map(d => (d.name || d.vid) + ':' + d.channel).join('+') || 'none'} diedDay=${(f.diedInFight || []).join(',') || 'none'}`);
  }
}
// r54 FAST-FIGHT NOTE (census blind-spot fix): single-call wave-4
// fights, tallied separately, never merged into the outcome distribution.
console.log('=== journey-endgame r95: fast wave-4 fights (merged into census as source=policy-fast; separate tally retired) ===');
for (const r of wavesAll) {
  const fc = r.fightCensus || {};
  const fw = fc.fastW4 || [];
  console.log(`${r.seed}(${r.plan}): fastCommitted=${fw.length} fastNonCommitted=${fc.fastNonCommittedW4 | 0}`);
  for (const f of fw) {
    console.log(`  d${f.day} ${f.monsters.join('+')} result=${f.result} gotAway=${f.gotAway} partyEscaped=${f.partyEscaped} causal=${(f.causalDeaths || []).map(d => (d.name || d.vid) + ':' + d.channel).join('+') || 'none'} dayKills=${(f.dayKills || []).map(k => k.mid + ':' + (k.by || '?') + '/' + (k.via || '?')).join('+') || 'none'}`);
  }
}

const distAll = {};
for (const x of censusRows) for (const o of (x.dist === 'none' ? [] : x.dist.split(','))) distAll[o] = (distAll[o] | 0) + 1;
console.log('distribution (waves seeds): ' + JSON.stringify(distAll));

// M3 CONVERSION: Arm B total wave-4+ kills > Arm A total wave-4+ kills.
const killsOf = (plan) => wavesAll.filter(r => r.plan === plan)
  .reduce((t, r) => t + ((r.veterans && r.veterans.w4plusKills) || 0), 0);
const killsA = killsOf('waves'), killsB = killsOf('wavesnw');
// r74: a tie prints TIE (tally only per prereg; M3 is NOT in PRIMARY).

// R118 MFLEE-ROUTED (r110's metric review item 1): per mFlee fight, the
// routed path as recorded at close — fled-flag (monFled true),
// result-named (closeSnapResult non-null), or gotAway-only — plus a
// day-boundary flag and the raw SAY lines. Descriptive + coverage bar.
console.log('=== journey-endgame r185: MFLEE-ROUTED ===');
const routedRows = mFleeFights.map(x => {
  const f = x.fight;
  const cls = f.monFled ? 'fled-flag' : (f.closeSnapResult != null ? 'result-named' : 'gotAway-only');
  const dayBoundary = (f.endDay | 0) > (f.startDay | 0);
  return { seed: x.seed, plan: x.plan, startDay: f.startDay, endDay: f.endDay, monsters: f.monsters, turns: f.turns, closeWhy: f.closeWhy, cls, dayBoundary, gotAwayLines: f.gotAwayLines, result: f.result, closeSnapResult: f.closeSnapResult };
});
for (const rr of routedRows) console.log(`${rr.seed}(${rr.plan}): d${rr.startDay}-d${rr.endDay} ${(rr.monsters || []).join('+')} turns=${rr.turns} close=${rr.closeWhy} class=${rr.cls}${rr.dayBoundary ? ' DAY-BOUNDARY' : ''} result=${rr.result} closeSnapResult=${rr.closeSnapResult} lines=${JSON.stringify(((rr.gotAwayLines || []).map(s => String(s).slice(0, 160))))}`);
verdict('MFLEE-routed-coverage', routedRows.every(rr => Array.isArray(rr.gotAwayLines)),
  routedRows.length ? `${routedRows.filter(rr => Array.isArray(rr.gotAwayLines)).length}/${routedRows.length} mFlee fights carry gotAwayLines: ` + routedRows.map(rr => `${rr.seed}:${rr.cls}${rr.dayBoundary ? '+dayBoundary' : ''}`).join(' | ') : 'no mFlee fights (vacuous)');

verdict('M3-conversion', killsB > killsA,
  `${killsB === killsA ? 'TIE ' : ''}armB kills=${killsB} vs armA kills=${killsA}: ` +
  wavesAll.map(r => `${r.seed}(${r.plan}):kills=${((r.veterans || {}).w4plusKills | 0)}`).join(' | '));

// M3b LIVING VETERAN (r58 prereg, carried: replication bar raised): >=1/6 waves
// seeds ends with >=2 LIVING veterans (r55's solve, replicated). The
// spread (>=1) is still reported in the text, but the verdict is the
// >=2 replication bar — the analyzer's old >=1 bar is not the binding.
const m3brows = wavesAll.map(r => {
  const v = r.veterans || {};
  return { seed: r.seed, living: (v.livingVeteranCount | 0), bar: (v.rd5veterans | 0),
    kills: (v.w4plusKills | 0), fights: (v.vetFights | 0), uw: v.unlockedWave };
});
// r65: the binding is the PEAK (daily snapshot), per r61's metric review.
// End-state counts are reported alongside for series continuity, not gated.
const m3bpeak = wavesAll.map(r => ({ seed: r.seed, peak: (r.peakLivingVeterans | 0), peakDay: r.peakLivingVetDay, end: ((r.veterans || {}).livingVeteranCount | 0) }));
verdict('M3b-peak', m3bpeak.some(x => x.peak >= 2),
  `peak(>=2):${m3bpeak.filter(x => x.peak >= 2).length}/${m3bpeak.length} spread-peak(>=1):${m3bpeak.filter(x => x.peak >= 1).length}/${m3bpeak.length}: ` +
  m3bpeak.map(x => `${x.seed}:peak=${x.peak}@d${x.peakDay} end=${x.end}`).join(' | '));

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

// M4b CONJUNCTION (r65 new): a waves seed BOTH unlocks wave 5 AND is announced.
// Expected NO-GO on r61's evidence; a NO-GO names the gap, it does not fail the run.
const m4brows = wavesAll.map(r => ({ seed: r.seed, uw: ((r.veterans || {}).unlockedWave | 0), ann: r.announceDay, ok: ((r.veterans || {}).unlockedWave | 0) >= 5 && r.announceDay != null }));
console.log('INFO M4b-conjunction (retired r98; conjunction proven r95):', m4brows.some(x => x.ok),
  `${m4brows.filter(x => x.ok).length}/${m4brows.length}: ` + m4brows.map(x => `${x.seed}:uw=${x.uw} ann=${x.ann == null ? 'never' : 'd' + x.ann}`).join(' | '));

// W5-QUESTION (r98 new; r95 metric-review question): for every seed
// reaching uw=5, classify the wave-5 facing fork from complete W5
// records: FACED / BLOCKED-ONLY / MENTIONED-NOT-FACED / NEVER-ARRIVED.
// GO iff >=1 seed reaches uw=5 AND every uw=5 seed's records are
// complete (face events + mentions + blocked arrivals with wave fields).
const w5rows = recs.map(r => {
  const uw = ((r.veterans || {}).unlockedWave | 0);
  const faced = (r.w5FaceEvents || []);
  const facedIds = [...new Set(faced.map(f => f.id))];
  const blocked5 = (r.blockedArrivals || []).filter(b => b.wave === 5);
  const blocked4 = (r.blockedArrivals || []).filter(b => b.wave === 4);
  const mentioned = (r.w5Mentions || []).filter(m => (m.count | 0) > 0);
  // R101 CLEANED MENTIONS (r98 metric-review gap 2): raw mentions mix
  // presence with lookalikes. The reported class uses cleaned mentions
  // only (kinds broadcast / buff-move excluded); raw stays beside it.
  const cleanedMentioned = (r.w5Mentions || []).filter(m => (m.count | 0) > 0 && (m.firstLineKind === 'presence' || m.firstLineKind === 'crew-beat'));
  const endDay = r.satDay != null ? r.satDay : (r.gameDays || 180);
  const windowDays = r.releaseSnap ? (endDay - r.releaseSnap.day) : null;
  let cls = 'no-uw5';
  if (uw >= 5) {
    if (facedIds.length >= 1) cls = 'FACED';
    else if (blocked5.length >= 1) cls = 'BLOCKED-ONLY';
    else if (cleanedMentioned.length >= 1) cls = 'MENTIONED-NOT-FACED(cleaned)';
    else cls = 'NEVER-ARRIVED';
  }
  const complete = Array.isArray(r.w5FaceEvents) && Array.isArray(r.w5Mentions) && Array.isArray(r.blockedArrivals);
  return { seed: r.seed, plan: r.plan, uw, cls, facedIds, faceDays: faced.map(f => f.day + ':' + f.id), blocked5: blocked5.length, blocked5Days: blocked5.map(b => b.day), blocked4: blocked4.length,
    mentionedIds: mentioned.map(m => m.id + '@d' + m.firstDay), cleanedIds: cleanedMentioned.map(m => m.id + '@d' + m.firstDay + ':' + (m.firstLineKind || '?')), windowDays, unlockDay: r.releaseSnap ? r.releaseSnap.day : null, satDay: r.satDay, complete };
});
const uw5rows = w5rows.filter(x => x.uw >= 5);
verdict('W5-question', uw5rows.length >= 1 && uw5rows.every(x => x.complete),
  (uw5rows.length >= 1 ? '' : 'NO uw=5 SEED (question unanswered) ') +
  w5rows.map(x => `${x.seed}(${x.plan}):uw${x.uw} ${x.cls} faced=[${x.facedIds.join(',') || 'none'}] faceDays=[${x.faceDays.join(',') || 'none'}] blockedW5=${x.blocked5}@[${x.blocked5Days.join(',') || ''}] blockedW4=${x.blocked4} mentionedRaw=[${x.mentionedIds.join(',') || 'none'}] mentionedClean=[${x.cleanedIds.join(',') || 'none'}] window=${x.windowDays == null ? '?' : x.windowDays + 'd from d' + x.unlockDay} complete=${x.complete}`).join(' | '));

// W3-LASTMILE + FEAST-SCAVENGER RATE (r101 question, INFO only): for
// every uw=5 seed, the full-seat deed bars that matter now (w3 breadth
// 4/4, w5 2/2) beside the feast supply that could draw a Producer.
const lmRows = uw5rows.map(x => {
  const r = recs.find(q => q.seed === x.seed);
  const fs = (r.fullseat || {}).max || {};
  const fc = r.feastChain || {};
  return `${x.seed}(${x.plan}): w3=${fs.w3 != null ? fs.w3 : '?'}/4 w4=${fs.w4 != null ? fs.w4 : '?'}/3 w5=${fs.w5 != null ? fs.w5 : '?'}/2 seat=${r.satSeatKind || 'none'} feasts=${fc.feasts | 0} fsFeasts=${fc.fsFeasts | 0} feastedDays=${fc.feastedDays | 0} facedW5=${x.facedIds.length}`;
});
lines.push('INFO W3-lastmile+feast-rate (uw=5 seeds): ' + (lmRows.length ? lmRows.join(' | ') : 'none'));

// M13 RELEASE SNAPSHOT (r65 new): every waves seed reaching uw=5 carries a
// release-day snapshot (day, rd5 counts, living veterans) from the daily hook.
const m13rows = wavesAll.filter(r => ((r.veterans || {}).unlockedWave | 0) >= 5).map(r => ({ seed: r.seed, ok: r.releaseSnap != null, snap: r.releaseSnap }));
verdict('M13-release-snapshot', m13rows.length === 0 || m13rows.every(x => x.ok),
  m13rows.length === 0 ? 'no waves seed reached uw=5 (vacuous)' : m13rows.map(x => `${x.seed}:${x.ok ? 'snap d' + x.snap.day + ' vets=' + x.snap.livingVeteranCount + ' rd5=' + JSON.stringify(x.snap.rd5) : 'MISSING'}`).join(' | '));

// M14 INVITE CLASSIFICATION (r65 new): every waves seed carries inviteClass,
// and every surviving non-announced waves seed is withdrawal or silent (never unclassified).
const m14rows = wavesAll.map(r => ({ seed: r.seed, cls: r.inviteClass || null, ann: r.announceDay, end: r.endReason,
  ok: r.inviteClass != null && (r.announceDay != null || r.inviteClass === 'withdrawal' || r.inviteClass === 'silent' || r.inviteClass === 'village-lost') }));
verdict('M14-invite-classification', m14rows.every(x => x.ok),
  `${m14rows.filter(x => x.ok).length}/${m14rows.length}: ` + m14rows.map(x => `${x.seed}:${x.cls} ann=${x.ann == null ? 'never' : 'd' + x.ann} end=${x.end}`).join(' | '));

// M5 VOICING CANONICAL: 88914 (forcedrift) — crossings >= 1 AND notices >= 1.
const ctrl = recs.filter(r => r.plan === 'forcedrift');
const m5rows = ctrl.map(r => {
  const crossed = (r.bandCrossings | 0) >= 1;
  const voiced = (r.noticedCount | 0) >= 1;
  return { seed: r.seed, crossed, voiced, ok: crossed && voiced };
});
// M5 FALLBACK (r68 prereg, from r65 metric review): a control that died
// before the window is a control mortality, not a voicing failure — judge
// the block's relay finals' notice lines instead, labeled as fallback.
const ctrlDeadBeforeWindow = ctrl.length > 0 && ctrl.every(r => r.announceDay == null && r.endReason === 'village-lost');
const fallbackRelayNoticed = recs.filter(r => r.walkedPath === 'relay' && r.satDay != null && Array.isArray(r.noticeLines) && r.noticeLines.length >= 1);
const m5fallback = ctrlDeadBeforeWindow && fallbackRelayNoticed.length >= 1;
const m5vacuous = ctrlDeadBeforeWindow && fallbackRelayNoticed.length === 0 && recs.filter(r => r.walkedPath === 'relay' && r.satDay != null).length === 0;
const m5ok = (ctrl.length > 0 && m5rows.every(x => x.ok)) || m5fallback || m5vacuous;
verdict('M5-voicing-canonical', m5ok,
  m5vacuous ? `VACUOUS (r124 metric review applied: control dead before window, no relay final in block — voicing unmeasured, not failed: ${ctrl.map(r => r.seed + ':' + r.endReason).join(' ')})`
    : m5fallback ? `FALLBACK (control dead before window: ${ctrl.map(r => r.seed + ':' + r.endReason).join(' ')}): ${fallbackRelayNoticed.length} relay finals with notice lines (${fallbackRelayNoticed.map(r => r.seed + ':' + r.walkedBranch).join(' ')})`
    : ctrl.length === 0 ? 'no forcedrift control seed'
    : `${m5rows.filter(x => x.ok).length}/${ctrl.length}: ` +
      m5rows.map(x => `${x.seed}:crossed=${x.crossed} voiced=${x.voiced}`).join(' '));

// M5b RELAY-BRANCH TABULATION (r65, binding as preregistered): every relay
// final in the block — waves seeds included, not just the control — tabulated
// by branch, so the r60 lead (dark fires markers, grey did not) can be judged
// across branches. noticeLines are printed in full (they are short); a relay
// final missing from this table is a NO-GO, never a silent drop.
const relayFinals = recs.filter(r => r.walkedPath === 'relay' && r.satDay != null);
console.log('=== journey-endgame r95: M5b relay-branch tabulation ===');
for (const r of relayFinals) {
  const rg = r.rg || {};
  console.log(`${r.seed}(${r.plan}): branch=${r.walkedBranch} moral=${r.walkedMoral} noticed=${r.noticedCount} bandCrossings=${r.bandCrossings} doorRelay=${rg.doorRelay} doorDelegated=${rg.doorDelegated} verbs=${rg.verbs} communes=${rg.communes} sat=${r.satDay} seat=${r.satSeatKind} won=${r.won} finalPick=${r.finalPickId} noticeLines=${JSON.stringify(r.noticeLines || [])}`);
}
const m5bTabulated = relayFinals.every(r => (r.walkedBranch != null || r.walkedMoral != null) && (r.noticeLines != null));
const m5bCtrlNamed = ctrl.length > 0 && ctrl.every(r => r.walkedBranch != null || r.walkedMoral != null);
// R76 prereg fix (r75 metric review): the zero-relay-final case is VACUOUS-GO
// — NO-GO only when a relay final exists but is untabulated. The r75 analyzer
// wrongly NO-GO'd on a null control branch with no relay final at all.
verdict('M5b-relay-branch-tabulation', relayFinals.length === 0 ? true : (m5bTabulated && relayFinals.length >= 1),
  relayFinals.length === 0
    ? `no relay final in block — vacuous GO per r76 prereg; control branch named=${m5bCtrlNamed} (${ctrl.map(r => r.seed + ':' + r.walkedPath + '/' + (r.walkedBranch || r.walkedMoral)).join(' ')})`
    : `${relayFinals.length} relay finals tabulated: ` + relayFinals.map(r => `${r.seed}:${r.walkedBranch || r.walkedMoral}:noticed=${r.noticedCount}:cross=${r.bandCrossings}`).join(' '));

// M6 GUARD NAMED (deferred scope, carried): every sat waves seed with
// deferDays >= 1 records a named window-end guard (not 'unknown').
const satWavesDef = recs.filter(r => (r.plan === 'waves' || r.plan === 'wavesnw') && r.satDay != null && (r.deferDays | 0) >= 1);
const m6rows = satWavesDef.map(r => ({ seed: r.seed, g: r.windowEndGuard, ok: r.windowEndGuard != null && r.windowEndGuard !== 'unknown' }));
verdict('M6-guard-named-deferred', satWavesDef.length > 0 && m6rows.every(x => x.ok),
  `${m6rows.filter(x => x.ok).length}/${satWavesDef.length} deferred sat waves named: ` +
  m6rows.map(x => `${x.seed}:guard=${x.g}`).join(' | '));

// Vetguard trace (info): per waves seed, guard-trace decision sequence.
console.log('=== journey-endgame r95: vetguard trace + same-day fix check ===');
for (const r of wavesAll) {
  const gt = r.guardTrace || [];
  const seq = gt.map(e => `d${e.day}:${e.decision}${e.vets != null ? '(v' + e.vets + ')' : ''}`).join(' ');
  const sameDay = r.announceDay != null && r.satDay != null && r.deferDays === 0;
  console.log(`${r.seed}: defer=${r.deferDays} endGuard=${r.windowEndGuard} bankedEnd=${r.windowEndGuard === 'veteran-banked'} sameDay=${sameDay} trace=[${seq}]`);
}

// Full-seat component reach table (from max).
const BARS45 = { w1: 5, w2: 5, w3: 4, w4: 3, w5: 2, contests: 3, crises: 3, stage: 2 };
function bindingFromMax(fs50, r) {
  const m = (fs50 && fs50.max) || {};
  const b = [];
  for (const k of Object.keys(BARS45)) if ((m[k] | 0) < BARS45[k]) b.push(`${k}:${m[k] | 0}/${BARS45[k]}`);
  // r178 LADDER (leg 2 surgery): foodDeeds is sentimentTaught ALONE —
  // the feast surge no longer gates the seat, so a missing surge is
  // NOT a gap. The full seat also needs ladder peak >= National (3)
  // + a delivered capstone (no bot policy delivers one — see prereg).
  const fd = (fs50.sentDay != null) ? null : 'foodDeeds:no-sent';
  if (fd) b.push(fd);
  const L = (r && r.ladder) || {};
  if ((L.peak | 0) < 3) b.push(`ladderPeak:${L.peak == null ? '?' : L.peak}/3`);
  if (!L.capstone) b.push('capstone:none');
  return b;
}
console.log('=== journey-endgame r95: full-seat component reach (from max) ===');
for (const r of recs) {
  const fs50 = r.fullseat || {};
  console.log(`${r.seed}(${r.plan}): defer=${r.deferDays == null ? 'na' : r.deferDays + 'd'} greedyWaits=${(r.greedy && r.greedy.waits) || 0} armDon=${(r.armory && r.armory.donations) || 0} guard=${r.windowEndGuard} maxTier=${r.maxTier} satPen=${r.satPenalty ? JSON.stringify(r.satPenalty) : 'na'} otLines=${r.overtimeLines | 0} best=${fs50.bestSeat} ` +
    `firstFull=${fs50.firstFullSeatDay == null ? 'never' : 'd' + fs50.firstFullSeatDay} ` +
    `indispEver=${fs50.indispEver} standing_max=${(fs50.max || {}).standing} ` +
    `binding=[${bindingFromMax(fs50, r).join(', ')}]`);
}


// M10 FULL-SEAT GAP (r55 new, REVISED r156 per r129 metric review,
 // REVISED r178 per the r178 prereg: foodDeeds sentiment-only, ladder
 // peak + capstone named as gaps; a sitting seed whose only missing
 // full-seat piece is the capstone passes with that gap named): every
// sat waves seed's closest gap named — full reached
// (firstFullSeatDay != null), a non-empty binding list, or the seat-kind
// case: all full bars met (empty binding list) yet the seed sat lesser —
// the gap is the seat kind, not a bar, and it PASSES as
// 'seat-kind: lesser despite full bars met'.
const m10rows = recs.filter(r => (r.plan === 'waves' || r.plan === 'wavesnw') && r.announceDay != null && r.satDay != null).map(r => {
  const fs50 = r.fullseat || {};
  const b = bindingFromMax(fs50, r);
  const full = fs50.firstFullSeatDay != null;
  const seatKind = (b.length === 0 && !full && r.satSeatKind === 'lesser');
  return { seed: r.seed, full, fullDay: fs50.firstFullSeatDay, gap: b, seatKind, ok: full || b.length > 0 || seatKind };
});
verdict('M10-fullseat-gap', m10rows.length > 0 && m10rows.every(x => x.ok),
  `${m10rows.filter(x => x.ok).length}/${m10rows.length}: ` +
  m10rows.map(x => `${x.seed}:${x.full ? 'FULL d' + x.fullDay : (x.seatKind ? 'gap=[seat-kind: lesser despite full bars met]' : 'gap=[' + x.gap.join(',') + ']')}`).join(' | '));

// M11 STANDING PEAK (carried from r56): every waves seed's standing peak is
// reported from fullseat max; the chase is judged on peaks (any >= 200
// advances it), not on the unlock alone.
const m11rows = wavesAll.map(r => {
  const fs50 = r.fullseat || {};
  return { seed: r.seed, peak: (fs50.max || {}).standing, uw: (r.veterans || {}).unlockedWave };
});
verdict('M11-standing-peak', m11rows.length > 0 && m11rows.every(x => x.peak != null),
  `peaks reported ${m11rows.filter(x => x.peak != null).length}/${m11rows.length}, at-199:${m11rows.filter(x => x.peak === 199).length}, at-200+:${m11rows.filter(x => (x.peak | 0) >= 200).length}: ` +
  m11rows.map(x => `${x.seed}:peak=${x.peak == null ? '?' : x.peak} uw=${x.uw}`).join(' | '));


// M12 BAR RECORD (r60 tooling): every sat waves seed's probe record must
// carry raw readiness counts (armored/armed/tricks/veterans), not just
// the short-list — the note's M12 table is built from these + audits.
const m12rows = recs.filter(r => (r.plan === 'waves' || r.plan === 'wavesnw') && r.satDay != null).map(r => {
  const v = r.veterans || {};
  const ok = v.rd5armored != null && v.rd5armed != null && v.rd5tricks != null && v.rd5veterans != null;
  return { seed: r.seed, ok, arm: v.rd5armored, wps: v.rd5armed, trk: v.rd5tricks, vet: v.rd5veterans, short: v.rd5short };
});
verdict('M12-bar-record', m12rows.length > 0 && m12rows.every(x => x.ok),
  `${m12rows.filter(x => x.ok).length}/${m12rows.length}: ` +
  m12rows.map(x => `${x.seed}:arm=${x.arm} armed=${x.wps} tricks=${x.trk} vet=${x.vet} short=[${(x.short || []).join(',')}]`).join(' | '));

// M15 FEAST-CHAIN CENSUS (r68 new): every seed's chain stages tabulated
// (feasts, armed feasts, feasted-window days, draws faced, feast sorties
// and fights, feasted-day fights, surge day or honest absence). A missing
// feastChain object or a missing stage field is NO-GO; surgeDay null is
// an honest absence, not a missing field.
const m15rows = recs.map(r => {
  const f = r.feastChain || null;
  const fields = ['feasts', 'armedFeasts', 'fsFeasts', 'fsArmedFeasts', 'facedDraw', 'devotionChannels', 'huntSorties', 'huntFeastFights', 'feastedDays', 'armedDays'];
  const ok = !!f && fields.every(k => typeof f[k] === 'number') && Array.isArray(f.feastedDayFights) && ('surgeDay' in f);
  return { seed: r.seed, ok, f };
});
verdict('M15-feast-census', m15rows.every(x => x.ok),
  `${m15rows.filter(x => x.ok).length}/${m15rows.length}: ` +
  m15rows.map(x => {
    const f = x.f || {};
    return `${x.seed}:feasts=${f.feasts} armed=${f.armedFeasts} fs=${f.fsFeasts}/${f.fsArmedFeasts} draw=${f.facedDraw} dev=${f.devotionChannels} sorties=${f.huntSorties} feastFights=${f.huntFeastFights} feastedDays=${f.feastedDays} armedDays=${f.armedDays} surge=${f.surgeDay == null ? 'never' : 'd' + f.surgeDay} feastedDayFights=${(f.feastedDayFights || []).length}`;
  }).join(' | '));
console.log('=== journey-endgame r95: feast-chain census detail ===');
for (const x of m15rows) {
  const f = x.f || {};
  console.log(`${x.seed}(${recs.find(r => r.seed === x.seed).plan}): feasts=${f.feasts} armedFeasts=${f.armedFeasts} fsFeasts=${f.fsFeasts} fsArmedFeasts=${f.fsArmedFeasts} facedDraw=${f.facedDraw} devotionChannels=${f.devotionChannels} huntSorties=${f.huntSorties} huntFeastFights=${f.huntFeastFights} huntWaveFights=${f.huntWaveFights} huntNoTarget=${f.huntNoTarget} huntGone=${f.huntGone} huntUnreached=${f.huntUnreached} feastedDays=${f.feastedDays} armedDays=${f.armedDays} surgeDay=${f.surgeDay} feastedDayFights=${JSON.stringify(f.feastedDayFights || [])} surgeDayFights=${JSON.stringify(f.surgeDayFights)}`);
}

// M16 DUSK CENSUS (r71 new): every seed living past day 1 records dusk
// samples with atHaven+away+unknown == dusks; away-share per plan.
const m16rows = recs.map(r => {
  const dc = r.duskCensus || null;
  const lived = (r.gameDays | 0) > 1;
  const n = dc ? dc.days.length : 0;
  const sum = dc ? (dc.atHaven | 0) + (dc.away | 0) + (dc.unknown | 0) : -1;
  const ok = !lived || (!!dc && n >= 1 && sum === n);
  const share = n > 0 ? Math.round(((dc.away | 0) / n) * 100) : null;
  return { seed: r.seed, plan: r.plan, lived, n, at: dc ? dc.atHaven : null, away: dc ? dc.away : null, unk: dc ? dc.unknown : null, share, ok };
});
verdict('M16-dusk-census', m16rows.every(x => x.ok),
  `${m16rows.filter(x => x.ok).length}/${m16rows.length}: ` +
  m16rows.map(x => `${x.seed}(${x.plan}):dusks=${x.n} haven=${x.at} away=${x.away} unk=${x.unk} awayShare=${x.share == null ? 'na' : x.share + '%'}`).join(' | '));
console.log('=== journey-endgame r105: dusk census detail ===');
for (const x of m16rows) {
  const r = recs.find(v => v.seed === x.seed);
  const awayDays = ((r.duskCensus || {}).days || []).filter(d => d.atHaven === false).map(d => d.day);
  console.log(`${x.seed}(${x.plan}): awayDusks=${awayDays.length} days=[${awayDays.slice(0, 40).join(',')}${awayDays.length > 40 ? ',...' : ''}]`);
}

// M17 SURGE-MODE NAMED (r71 new): every surged seed carries >=1 named spend.
// M17 SURGE-MODE NAMED (r71 new; r105 split per r101 metric review):
// a surged seed passes with a named spend, with an other-kind spend
// receipt, or as surge-unspent (still banked at end, no receipt);
// only a spent-but-unreceipted seed is a capture gap (NO-GO).
const m17rows = recs.map(r => {
  const f = r.feastChain || {};
  const spends = r.surgeSpends || f.surgeSpends || [];
  const surged = f.surgeDay != null;
  const named = spends.filter(sp => sp.kind === 'combat' || sp.kind === 'healing');
  const es = r.surgeEndState || {};
  const receipt = es.useReceipt || null;
  const otherKind = spends.filter(sp => sp.kind !== 'combat' && sp.kind !== 'healing');
  let cls = 'not-surged'; let ok = true;
  if (surged) {
    if (named.length >= 1) cls = 'named-spend';
    else if (receipt && receipt.kind && receipt.kind !== 'combat' && receipt.kind !== 'healing') cls = 'other-kind-spend:' + receipt.kind;
    else if (otherKind.length >= 1) cls = 'other-kind-spend:' + otherKind[0].kind;
    else if (es.banked) cls = 'surge-unspent';
    else { cls = 'spend-capture-gap'; ok = false; }
  }
  return { seed: r.seed, surged, surgeDay: f.surgeDay, spends, named, cls, ok, endBanked: !!es.banked, endUsed: !!es.used, receipt };
});
verdict('M17-surge-mode', m17rows.every(x => x.ok),
  `${m17rows.filter(x => x.ok).length}/${m17rows.length}: ` +
  m17rows.map(x => `${x.seed}:surge=${x.surgeDay == null ? 'never' : 'd' + x.surgeDay} ${x.cls} spends=[${x.spends.map(sp => 'd' + sp.day + ':' + sp.kind + '(' + (sp.by || '?') + ')').join(',') || 'none'}] endBanked=${x.endBanked} endUsed=${x.endUsed} receipt=${x.receipt ? ('d' + x.receipt.day + ':' + x.receipt.kind) : 'none'}`).join(' | '));


// KILL-ANATOMY (r105 new, descriptive + coverage bar): every multi-turn
// census fight on waves seeds should carry anatomy; the decomposition
// table (by outcome) is the r101-named kill-wall question's first
// measurement — no outcome bar this run, coverage is the binding.
const kaAll = [];
wavesAll.forEach(r => { (r.fightCensus.fights || []).forEach(f => {
  if (f.source === 'policy-fast') return;
  kaAll.push({ seed: r.seed, plan: r.plan, outcome: f.outcome, turns: f.turns || 0,
    anatomy: f.anatomy || null, committed: f.committed !== false, closeWhy: f.closeWhy || null });
}); });
const kaCov = kaAll.filter(x => x.anatomy && !x.anatomy.error);
verdict('KILL-ANATOMY-coverage', kaAll.length === 0 || kaCov.length / kaAll.length >= 0.9,
  `anatomy=${kaCov.length}/${kaAll.length} multi-turn fights` +
  (kaAll.length - kaCov.length ? ` missing=[${kaAll.filter(x => !x.anatomy || x.anatomy.error).map(x => x.seed + ':' + x.outcome).join(',')}]` : ''));
const med = xs => { if (!xs.length) return null; const s = xs.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const kaByOut = {};
kaCov.forEach(x => {
  const o = x.outcome;
  if (!kaByOut[o]) kaByOut[o] = [];
  const an = x.anatomy;
  kaByOut[o].push({ party: an.partySize, turns: x.turns, dmg: an.dmgDealt, pool: an.openMonsterHp,
    share: an.openMonsterHp ? Math.round(an.dmgDealt / an.openMonsterHp * 100) / 100 : null,
    feasted: an.feastedAtStart === true ? 1 : 0, mons: an.monsterCount });
});
lines.push('INFO KILL-ANATOMY decomposition (waves seeds, multi-turn fights only): ' +
  Object.keys(kaByOut).map(o => {
    const rows = kaByOut[o];
    return `${o} n=${rows.length} partyMed=${med(rows.map(r => r.party))} turnsMed=${med(rows.map(r => r.turns))} dmgMed=${med(rows.map(r => r.dmg))} poolMed=${med(rows.map(r => r.pool))} shareMed=${med(rows.map(r => r.share))} feasted=${rows.reduce((s, r) => s + r.feasted, 0)}/${rows.length} monsMed=${med(rows.map(r => r.mons))}`;
  }).join(' | '));
lines.push('INFO KILL-ANATOMY per-fight: ' + kaCov.map(x => `${x.seed}:${x.outcome} party=${x.anatomy.partySize} turns=${x.turns} dmg=${x.anatomy.dmgDealt}/${x.anatomy.openMonsterHp} closeHp=${x.anatomy.closeMonsterHp} mons=${x.anatomy.monsterCount} feasted=${x.anatomy.feastedAtStart} closeWhy=${x.closeWhy}`).join(' | '));
lines.push('INFO KILL-ANATOMY closeWhy caveat: dmgDealt is damage observed up to the last policy.fight sample, not total fight damage; ref-change/day-end closes are lower bounds (the killing tail can land after the last sample — proven on 89501 Eater d94: anatomy 543/960, transcript total 1065+). Counts: ' + ['ref-change', 'over', 'day-end', 'fast-single-call'].map(w => w + '=' + kaAll.filter(x => x.closeWhy === w).length).join(' ') + '.');

// M18 GHOST SCAN (r71 new): the scan ran on every seed (ghostLines and
// ghostHits present, same length); hits are findings, not NO-GOs.
const m18rows = recs.map(r => {
  const gl = r.ghostLines, gh = r.ghostHits;
  const ok = Array.isArray(gl) && Array.isArray(gh) && gl.length === gh.length;
  return { seed: r.seed, ok, n: ok ? gl.length : null, hits: ok ? gh.filter(h => h.hit) : [], gh: ok ? gh : [] };
});
verdict('M18-ghost-scan', m18rows.every(x => x.ok),
  `${m18rows.filter(x => x.ok).length}/${m18rows.length}: ` +
  m18rows.map(x => `${x.seed}:lines=${x.n} confirmed=${x.hits.map(h => 'd' + h.day + ':' + h.companion + '(died d' + h.deathDay + ')').join(',') || 'none'} firstNameOnly=${(x.gh || []).filter(h => h.firstNameHit && !h.hit).map(h => 'd' + h.day + ':' + h.companion).join(',') || 'none'}`).join(' | '));

// M19 GRANT LOG (r72 new): every seed carries grantLog; every refused
// grant is classified (reactor / devotion-gate / other). The grant table
// answers r71's arming-at-grant question per seed.
const m19rows = recs.map(r => {
  const gl = r.grantLog;
  const ok = Array.isArray(gl) && gl.every(g => typeof g.granted === 'boolean' && (g.granted || g.whyClass != null));
  const granted = ok ? gl.filter(g => g.granted).length : 0;
  const refr = ok ? gl.filter(g => g.refreshed).length : 0;
  const reac = ok ? gl.filter(g => g.whyClass === 'reactor').length : 0;
  const dev = ok ? gl.filter(g => g.whyClass === 'devotion-gate').length : 0;
  const oth = ok ? gl.filter(g => g.whyClass === 'other-refusal').length : 0;
  return { seed: r.seed, plan: r.plan, ok, n: ok ? gl.length : null, granted, refr, reac, dev, oth };
});
verdict('M19-grant-log', m19rows.every(x => x.ok),
  `${m19rows.filter(x => x.ok).length}/${m19rows.length}: ` +
  m19rows.map(x => `${x.seed}(${x.plan}):calls=${x.n} granted=${x.granted} refreshed=${x.refr} reactorRef=${x.reac} devotionRef=${x.dev} otherRef=${x.oth}`).join(' | '));
console.log('=== journey-endgame r95: grant log detail ===');
for (const r of recs) {
  const gl = r.grantLog || [];
  console.log(`${r.seed}(${r.plan}): grants=${gl.length}`);
  for (const g of gl) {
    console.log(`  d${g.day} granted=${g.granted} refreshed=${g.refreshed} mult=${g.mult} q=${g.quality} pre={reactor:${g.pre ? g.pre.reactor : '?'} progSurge:${g.pre ? g.pre.progSurge : '?'} feastSurge:${g.pre ? g.pre.feastSurge : '?'}} why=${g.whyClass || '-'}`);
  }
}

// M20 STANDING TRACE (r72 new): every lived seed carries a daily pure-read
// trace; the gated total is derived here from the standing.js formula
// (plenty cap, defer4/defer5 holds, peak floor) using the seed's own
// standingCfg. A derived peak of exactly 199 is classified by mechanism:
// raw>=200 with a defer5/cap hold on some day (mechanism) vs raw peaking
// at 199 itself (coincidence). Trace completeness gates; the mechanism
// classification is a finding printed, not a forced verdict.
function derivedGated(trace, cfg) {
  const t4 = (cfg.t4 | 0) || 100, t5 = (cfg.t5 | 0) || 200, cap = (cfg.plentyCapT5 | 0) || 100;
  let peak = 0;
  let peakGated = 0, peakDay = null, daysAt199 = 0, mech199 = false, rawPeak = 0;
  for (const e of trace) {
    const capped = (e.war | 0) + (e.diplomacy | 0) + Math.min((e.plenty | 0), cap);
    const bounds = [];
    if ((e.raw | 0) >= t5 && capped < t5) bounds.push({ bound: t5 - 1, kind: 'cap' });
    if ((e.raw | 0) >= t4 && !e.rd4ready) bounds.push({ bound: t4 - 1, kind: 'defer4' });
    if (capped >= t5 && !e.rd5ready) bounds.push({ bound: t5 - 1, kind: 'defer5' });
    let gated = (e.raw | 0);
    for (const b of bounds) if (b.bound < gated) gated = b.bound;
    const floor = peak >= 5 ? t5 : peak >= 4 ? t4 : 0;
    gated = Math.max(gated, floor);
    if (gated >= t5) peak = 5; else if (gated >= t4) peak = 4;
    if (gated > peakGated) { peakGated = gated; peakDay = e.day; }
    if (gated === 199) { daysAt199++; if ((e.raw | 0) >= 200 && bounds.some(b => b.bound === 199)) mech199 = true; }
    if ((e.raw | 0) > rawPeak) rawPeak = (e.raw | 0);
  }
  return { peakGated, peakDay, daysAt199, mech199, rawPeak };
}
const m20rows = recs.map(r => {
  const tr = r.standingTrace;
  const cfg = r.standingCfg || (recs.find(x => x.standingCfg) || {}).standingCfg || null;
  const lived = (r.gameDays | 0) > 1;
  const ok = !lived || (Array.isArray(tr) && tr.length >= 1 && !!cfg);
  const d = ok && lived ? derivedGated(tr, cfg) : null;
  const fs50 = r.fullseat || {};
  return { seed: r.seed, plan: r.plan, ok, n: Array.isArray(tr) ? tr.length : null, d,
    fsMax: (fs50.max || {}).standing };
});
verdict('M20-standing-trace', m20rows.every(x => x.ok),
  `${m20rows.filter(x => x.ok).length}/${m20rows.length}: ` +
  m20rows.map(x => x.d ? `${x.seed}(${x.plan}):trace=${x.n} derivedPeak=${x.d.peakGated}@d${x.d.peakDay} rawPeak=${x.d.rawPeak} daysAt199=${x.d.daysAt199} mech199=${x.d.mech199} fsMax=${x.fsMax}` : `${x.seed}:trace=${x.n}`).join(' | '));

// M21 AUDIT CROSS-CHECK (r72 new): every sat seed's audit numbers match
// satWaves exactly (w1-3 faced triple + w4/w5 fought counts; a missing
// fought clause reads as 0/0, per 88945). Census fight count vs audit
// distinct-type count is reported with the otherEnd count — a census
// excess over audit types is repeat fights, not a mismatch, and is
// judged in the note, not by this verdict.
// R185 REVISION (r182 metric review): the full-seat audit line carries
// NO numbers (table.js: "every wave faced, the deeds complete"), so the
// parser marks every full seat AUDIT-UNPARSED. A sat seed with
// satSeatKind 'full' is exempt from the parse and passes iff its
// satWaves meets the deed bars directly (5/5/4/3/2 distinct fought per
// wave — progression.js deedGateReady, table.js:79). Lesser seats keep
// the parse rule.
const m21rows = recs.filter(r => r.announceDay != null && r.satDay != null).map(r => {
  const al = r.auditLine || '';
  const m123 = al.match(/waves 1–3 faced \((\d+)\/(\d+)\/(\d+)\)/);
  const m45 = al.match(/with (\d+) wave-4(?: and (\d+) wave-5)? fought/);
  const parsed = m123 ? { w1: +m123[1], w2: +m123[2], w3: +m123[3],
    w4: m45 ? +m45[1] : 0, w5: m45 && m45[2] ? +m45[2] : 0 } : null;
  const sw = r.satWaves || {};
  const match = !!parsed && parsed.w1 === (sw.w1 | 0) && parsed.w2 === (sw.w2 | 0) && parsed.w3 === (sw.w3 | 0)
    && parsed.w4 === (sw.w4 | 0) && parsed.w5 === (sw.w5 | 0);
  const fullSeat = r.satSeatKind === 'full';
  const deedBars = (sw.w1 | 0) >= 5 && (sw.w2 | 0) >= 5 && (sw.w3 | 0) >= 4 && (sw.w4 | 0) >= 3 && (sw.w5 | 0) >= 2;
  const censusN = ((r.fightCensus && r.fightCensus.fights) || []).length;
  const otherEnd = ((r.fightCensus && r.fightCensus.fights) || []).filter(f => f.outcome === 'otherEnd').length;
  return { seed: r.seed, parsed, sw, match, fullSeat, deedBars, censusN, auditTypes: parsed ? parsed.w4 + parsed.w5 : null, otherEnd,
    ok: fullSeat ? deedBars : (!!parsed && match) };
});
verdict('M21-audit-crosscheck', m21rows.length > 0 && m21rows.every(x => x.ok),
  `${m21rows.filter(x => x.ok).length}/${m21rows.length}: ` +
  m21rows.map(x => x.fullSeat ? `${x.seed}:FULL-EXEMPT satWaves=(${x.sw.w1}/${x.sw.w2}/${x.sw.w3})+${x.sw.w4}/${x.sw.w5} deedBars(5/5/4/3/2)=${x.deedBars} census=${x.censusN} otherEnd=${x.otherEnd}` : x.parsed ? `${x.seed}:audit=(${x.parsed.w1}/${x.parsed.w2}/${x.parsed.w3})+${x.parsed.w4}/${x.parsed.w5} satWaves=(${x.sw.w1}/${x.sw.w2}/${x.sw.w3})+${x.sw.w4}/${x.sw.w5} match=${x.match} census=${x.censusN} auditTypes=${x.auditTypes} otherEnd=${x.otherEnd}` : `${x.seed}:AUDIT-UNPARSED`).join(' | '));

// M22 FEAST-HOLD DIAGNOSTIC (r73 new): every lived seed carries
// feastHoldLog + hostLog; every sampled dusk classifies into exactly one
// of HELD / AWAY / ALREADY_FED_TODAY / PLAN_REFUSED / BUFFER_SHORT /
// CADENCE / CONTRIBUTION / UNEXPLAINED. The distribution is the finding;
// only a missing log or an unclassifiable dusk (UNKNOWN haven, NO_PLAN)
// fails this metric.
function classifyDusk(d, hostOkDays) {
  if (hostOkDays.has(d.day)) return 'HELD';
  if (d.atHaven === false) return 'AWAY';
  if (d.atHaven !== true) return 'UNKNOWN';
  if (d.feastDay === d.day) return 'ALREADY_FED_TODAY';
  if (!d.plan) return 'NO_PLAN';
  if (!d.plan.ok) return 'PLAN_REFUSED';
  if (!d.plan.bufferOk) return 'BUFFER_SHORT';
  if (d.cadenceBlocked) return 'CADENCE';
  if (d.contrib && d.contrib.total < 1500) return 'CONTRIBUTION';
  return 'UNEXPLAINED';
}
const m22rows = recs.map(r => {
  const fh = r.feastHoldLog, hl = r.hostLog;
  const lived = (r.gameDays | 0) > 1;
  const hostOkDays = new Set(Array.isArray(hl) ? hl.filter(h => h.ok).map(h => h.day) : []);
  const counts = {};
  const planWhys = {};
  const bufferRatios = [];
  const contribShorts = [];
  const unexplainedDays = [];
  let bad = 0;
  if (Array.isArray(fh)) for (const d of fh) {
    const cls = classifyDusk(d, hostOkDays);
    counts[cls] = (counts[cls] || 0) + 1;
    if (cls === 'UNKNOWN' || cls === 'NO_PLAN') bad++;
    if (cls === 'PLAN_REFUSED') planWhys[d.plan.why || '?'] = (planWhys[d.plan.why || '?'] || 0) + 1;
    if (cls === 'BUFFER_SHORT' && d.plan && d.plan.cost) bufferRatios.push(Math.round((d.plan.have / d.plan.cost) * 100) / 100);
    if (cls === 'CONTRIBUTION' && d.contrib) contribShorts.push(1500 - d.contrib.total);
    if (cls === 'UNEXPLAINED') unexplainedDays.push(d.day);
  }
  const ok = !lived || (Array.isArray(fh) && Array.isArray(hl) && bad === 0);
  return { seed: r.seed, plan: r.plan, ok, n: Array.isArray(fh) ? fh.length : null,
    counts, planWhys, bufferRatios, contribShorts, unexplainedDays,
    hostCalls: Array.isArray(hl) ? hl.length : null, hostOk: hostOkDays.size };
});
verdict('M22-feast-hold', m22rows.every(x => x.ok),
  `${m22rows.filter(x => x.ok).length}/${m22rows.length}: ` +
  m22rows.map(x => `${x.seed}(${x.plan}):dusks=${x.n} host=${x.hostOk}/${x.hostCalls} ` +
    Object.keys(x.counts).sort().map(k => `${k}=${x.counts[k]}`).join(' ') +
    (Object.keys(x.planWhys).length ? ` planWhys=${JSON.stringify(x.planWhys)}` : '') +
    (x.bufferRatios.length ? ` bufRatio(min/med)=${Math.min(...x.bufferRatios)}/${x.bufferRatios.slice().sort((a, b) => a - b)[Math.floor(x.bufferRatios.length / 2)]}` : '') +
    (x.contribShorts.length ? ` contribShort(med)=${x.contribShorts.slice().sort((a, b) => a - b)[Math.floor(x.contribShorts.length / 2)]}` : '') +
    (x.unexplainedDays.length ? ` unexplainedDays=${x.unexplainedDays.slice(0, 12).join(',')}${x.unexplainedDays.length > 12 ? '+' + (x.unexplainedDays.length - 12) + 'more' : ''}` : '')).join(' | '));
console.log('=== journey-endgame r95: feast-hold classification (per arm) ===');
for (const arm of ['waves', 'wavesnw', 'forcedrift']) {
  const rows = m22rows.filter(x => x.plan === arm);
  if (!rows.length) continue;
  const tot = {};
  for (const x of rows) for (const k of Object.keys(x.counts)) tot[k] = (tot[k] || 0) + x.counts[k];
  const dusks = Object.values(tot).reduce((a, b) => a + b, 0);
  console.log(`${arm}: dusks=${dusks} ` + Object.keys(tot).sort().map(k => `${k}=${tot[k]} (${dusks ? Math.round(tot[k] / dusks * 100) : 0}%)`).join(' '));
}

// M9b CONTENTION SHARE (r73 new, reported not gating): blocked = TOTAL
// blocked arrivals (r101 label correction; count unchanged for series comparability).
// arrivals / (blocked + committed wave-4 fights), per arm. No bar yet;
// r95 compares against r74 values (waves 79.4%, wavesnw 93.1%) AND r77
// values (waves 94.0%, wavesnw 100.0%, forcedrift 71.4%). Each baseline
// flags separately; a single-baseline flag overstates on this series.
for (const arm of ['waves', 'wavesnw', 'forcedrift']) {
  const rows = recs.filter(r => r.plan === arm);
  if (!rows.length) continue;
  const blocked = rows.reduce((t, r) => t + ((r.blockedArrivals || []).length), 0);
  const committed = rows.reduce((t, r) => t + (((r.fightCensus && r.fightCensus.fights) || []).length), 0);
  const share = blocked + committed ? Math.round(blocked / (blocked + committed) * 1000) / 10 : null;
  const r74 = { waves: 79.4, wavesnw: 93.1, forcedrift: null }[arm];
  const r77 = { waves: 94.0, wavesnw: 100.0, forcedrift: 71.4 }[arm];
  const sw74 = (share == null || r74 == null) ? null : Math.abs(share - r74);
  const sw77 = (share == null || r77 == null) ? null : Math.abs(share - r77);
  console.log(`INFO M9b-contention-share ${arm}: blocked=${blocked} committed=${committed} share=${share == null ? 'na' : share + '%'} r74=${r74 == null ? 'na' : r74 + '%'} swing74=${sw74 == null ? 'na' : sw74.toFixed(1) + 'pt'} ${sw74 != null && sw74 > 10 ? 'WATCH-FLAG-r74' : ''} r77=${r77 + '%'} swing77=${sw77 == null ? 'na' : sw77.toFixed(1) + 'pt'} ${sw77 != null && sw77 > 10 ? 'WATCH-FLAG-r77' : ''}`);
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

// LASTMILE (r75 new, question metric, not PRIMARY-gating): per sat waves
// seed, faced w3 ids (end of run) vs the monsters.json wave-3 roster,
// w3 first-reached days, stall window (first day at final w3 count to
// satDay), dusk away-share inside the stall window (attention proxy),
// whole-run blocked-arrival count (contention proxy, wave-4 instrument
// only — correlation, never claimed as the w3 cause), crisis keys +
// first-reached days. Transcript mentions use roster display names.
console.log('=== journey-endgame r95: LASTMILE ===');
let rosterW3 = [], rosterNames = {};
try {
  const mons = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8'));
  for (const m of mons) if (m && m.wave === 3) { rosterW3.push(m.id); rosterNames[m.id] = m.name || m.id; }
} catch (e) { console.log('LASTMILE roster load failed: ' + e.message); }
for (const r of recs.filter(x => (x.plan === 'waves' || x.plan === 'wavesnw') && x.announceDay != null && x.satDay != null)) {
  const faced = r.wavesFacedKeys || {};
  const facedW3 = Object.keys(faced).filter(id => (faced[id] | 0) === 3);
  const missing = rosterW3.filter(id => facedW3.indexOf(id) < 0);
  // R76: mentions come from the probe's FULL-RUN capture log (rec.w3Mentions),
  // never from the announce-sliced transcript (r75's void instrument).
  const w3m = {};
  for (const m of (r.w3Mentions || [])) if (m && m.id) w3m[m.id] = m;
  const mention = {};
  for (const id of missing) { const m = w3m[id]; mention[id] = (m && m.count > 0) ? `mentioned-d${m.firstDay}x${m.count}` : 'never-mentioned(full-run)'; }
  for (const id of missing) { const m = w3m[id]; if (m && m.count > 0 && m.firstLine) console.log(`    FIRSTLINE ${r.seed} ${id} d${m.firstDay}: ${String(m.firstLine).replace(/\n/g, ' ')}`); }
  const wt = r.waveTrace || [];
  const w3first = {};
  for (const t of wt) { const c = t.w3 | 0; if (w3first[c] == null) w3first[c] = t.day; }
  const finalW3 = wt.length ? (wt[wt.length - 1].w3 | 0) : null;
  const stallStart = (finalW3 != null && w3first[finalW3] != null) ? w3first[finalW3] : null;
  const stallEnd = r.satDay;
  let duskIn = [];
  if (stallStart != null) {
    const dc = (r.duskCensus && r.duskCensus.days) || [];
    duskIn = dc.filter(d => d.day >= stallStart && d.day <= stallEnd);
  }
  const awayShare = duskIn.length ? Math.round(duskIn.filter(d => !d.atHaven).length / duskIn.length * 100) : null;
  const crisFirst = {};
  for (const t of wt) { const c = t.crises; if (c != null && crisFirst[c] == null) crisFirst[c] = t.day; }
  console.log(`${r.seed}: satWaves w3=${(r.satWaves || {}).w3}/4 crises=${((r.fullseat || {}).max || {}).crises}/3 facedW3end=[${facedW3.join(',')}] unFacedW3=[${missing.map(id => id + ':' + mention[id]).join(',')}] w3first=${JSON.stringify(w3first)} stall=${stallStart == null ? 'na' : 'd' + stallStart + '-d' + stallEnd + ' (' + (stallEnd - stallStart) + 'd)'} duskAwayInStall=${awayShare == null ? 'na' : awayShare + '% (n=' + duskIn.length + ')'} blockedArrWholeRun=${(r.blockedArrivals || []).length} crisisKeys=[${(r.crisisKeys || []).join(',')}] crisesFirst=${JSON.stringify(crisFirst)}`);
}

// R95 VETCONV (r92's named question, with r92's named instrument fixes):
// Pre-registered rule: per-turn iff comN>=1 and |total - sumTurns| <= 2; else
// per-turn-dropped iff every increment is captured inside census fights
// (sumDelta == total) while some committed turns did not increment
// (commitLive lapses); else per-fight iff total == committed n; else
// per-turn-attributed (R95 NEW) iff the increment log sums to total AND
// every increment carries >=1 monster (post- or pre-call) — this covers
// seeds whose increments rode engine-only fights, now attributed by the
// pre-call capture instead of reading 'unseen'; else mismatch-unexplained
// (NO-GO on the instrument). A mismatch now means a genuinely
// unattributed increment or a sum gap, not a sampling artifact.
console.log('=== journey-endgame r95: VETCONV reconciliation ===');
const vetRows = wavesAll.map(r => {
  const fc = r.fightCensus || {};
  const com = (fc.fights || []).filter(f => f.committed !== false);
  const sumTurns = com.reduce((t, f) => t + (f.turns | 0), 0);
  const deltas = com.map(f => f.vetDelta).filter(v => v != null);
  const sumDelta = deltas.reduce((t, v) => t + v, 0);
  const nulls = com.length - deltas.length;
  const total = ((r.veterans || {}).vetFights | 0);
  const kills = ((r.veterans || {}).w4plusKills | 0);
  const inc = r.vetIncrements || [];
  const sumInc = inc.reduce((t, x) => t + (x.delta | 0), 0);
  const unattributed = inc.filter(x => !(x.monsters || []).length).length;
  const preCallN = inc.filter(x => x.preCall).length;
  let cls;
  if (com.length === 0 && total === 0) cls = 'no-activity';
  else if (com.length >= 1 && Math.abs(total - sumTurns) <= 2) cls = 'per-turn';
  else if (com.length >= 1 && sumDelta === total && sumTurns > total) cls = 'per-turn-dropped';
  else if (total === com.length) cls = 'per-fight';
  else if (total > 0 && sumInc === total && unattributed === 0) cls = 'per-turn-attributed';
  else cls = 'mismatch-unexplained';
  const hist = {};
  for (const f of com) hist[f.outcome] = (hist[f.outcome] | 0) + 1;
  return { seed: r.seed, plan: r.plan, total, comN: com.length, sumTurns, sumDelta, nulls, kills, cls, hist, sumInc, unattributed, preCallN };
});
for (const x of vetRows) console.log(`${x.seed}(${x.plan}): vetFights=${x.total} committedN=${x.comN} sumTurns=${x.sumTurns} sumDelta=${x.sumDelta} nullDelta=${x.nulls} incSum=${x.sumInc} unattributed=${x.unattributed} preCall=${x.preCallN} w4plusKills=${x.kills} class=${x.cls} outcomes=${JSON.stringify(x.hist)}`);
console.log('=== journey-endgame r95: VETCONV increment log ===');
for (const r of wavesAll) {
  const inc = r.vetIncrements || [];
  const sumInc = inc.reduce((t, x) => t + (x.delta | 0), 0);
  const unseen = inc.filter(x => x.censusState === 'unseen');
  console.log(`${r.seed}(${r.plan}): increments=${inc.length} sumDelta=${sumInc} vetFights=${((r.veterans || {}).vetFights | 0)} unseen=${unseen.length} preCall=${inc.filter(x => x.preCall).length} unattributed=${inc.filter(x => !(x.monsters || []).length).length}`);
  for (const x of unseen) console.log(`    UNSEEN ${r.seed} d${x.day} delta=${x.delta} committed=${x.committed} over=${x.over} mons=${(x.monsters || []).map(m => m.mid + '(data' + m.dataWave + '/mdef' + m.mdefWave + ')').join('+')}`);
}
verdict('VETCONV-recon', vetRows.every(x => x.cls !== 'mismatch-unexplained'),
  `${vetRows.filter(x => x.cls !== 'mismatch-unexplained').length}/${vetRows.length} reconciled: ` +
  vetRows.map(x => `${x.seed}:${x.cls}(tot=${x.total},turns=${x.sumTurns},delta=${x.sumDelta},n=${x.comN},kills=${x.kills})`).join(' | '));
console.log(`INFO VETCONV-kills: any w4+ kill on waves seeds: ${vetRows.some(x => x.kills > 0) ? 'YES' : 'NO'} (kills=${vetRows.map(x => x.seed + ':' + x.kills).join(',')})`);

// R109 SECOND-VETERAN (r105's named next question): walk each waves seed's
// killLog chronology; after each kill, the living-veteran set is the killers
// minus anyone with a death record on/before that kill day (death day < kill
// day removes before the kill; a killer dying the same day still counts that
// day). Coverage bar: >=90% of veteran-counted kills carry killer + day, and
// every kill after the first names the previous killer's fate (alive at end
// or death day + cause). No outcome bar — one block cannot set a recipe.
console.log('=== journey-endgame r110: SECOND-VETERAN ===');
const svRows = wavesAll.map(r => {
  const kl = (r.veterans || {}).killLog;
  const deaths = r.deathRecords || [];
  if (!Array.isArray(kl)) return { seed: r.seed, plan: r.plan, missing: true, kills: ((r.veterans || {}).w4plusKills | 0) };
  const sorted = kl.slice().sort((x, y) => (x.d | 0) - (y.d | 0));
  const withKD = sorted.filter(k => k.killer && k.killer !== '?' && k.d != null);
  const deadBefore = (vid, day) => deaths.find(d => String(d.vid) === String(vid) && (d.day | 0) < (day | 0));
  const fateOf = (vid) => {
    const d = deaths.find(x => String(x.vid) === String(vid));
    return d ? `died d${d.day} (${d.cause || '?'})` : 'alive at end';
  };
  // R110 KILL-CHANNEL: match each kill (day, mid) against census fights.
  // A vKill fight ending that day on that monster with turnsObserved is
  // 'census'; a matching fight with anatomy null is 'fast'; no matching
  // fight is 'villager-side' (the kill happened off the player census).
  const fights = ((r.fightCensus && r.fightCensus.fights) || []);
  const channelOf = (k) => {
    const m = fights.find(f => f.outcome === 'vKill' && (f.endDay | 0) === (k.d | 0) && (f.monsters || []).indexOf(k.mid) >= 0);
    if (!m) return 'villager-side';
    if (m.turnsObserved) return 'census';
    if (m.anatomy == null) return 'fast';
    return 'census?';
  };
  const living = new Set();
  let secondDay = null, secondPair = null, firstKillDay = null;
  const steps = sorted.map(k => {
    for (const v of [...living]) { const db = deadBefore(v, k.d); if (db) living.delete(v); }
    const prevLiving = [...living];
    living.add(k.killer);
    if (firstKillDay == null) firstKillDay = k.d;
    if (secondDay == null && living.size >= 2) { secondDay = k.d; secondPair = [...living].join('+'); }
    const prevKiller = prevLiving.length ? prevLiving[prevLiving.length - 1] : null;
    return { day: k.d, killer: k.killer, mid: k.mid, livingAfter: [...living], prevKiller, prevFate: prevKiller ? fateOf(prevKiller) : null, channel: channelOf(k) };
  });
  const cov = sorted.length ? withKD.length / sorted.length : 1;
  const prevNamed = steps.filter(x => x.prevKiller).every(x => x.prevFate != null);
  const chanNamed = steps.every(x => !!x.channel);
  // R110 PAIR-LIFETIME: days from the second-bank kill to the first event
  // that ends the pair — a pair member's death, the sit, or the scatter
  // line — else 'ongoing' to the run's end day.
  let pairLife = null;
  if (secondDay != null && secondPair) {
    const pair = secondPair.split('+');
    const cands = [];
    for (const vid of pair) { const d = deaths.find(x => String(x.vid) === String(vid) && (x.day | 0) >= (secondDay | 0)); if (d) cands.push({ day: d.day | 0, kind: 'pair-death:' + vid }); }
    if (r.satDay != null && (r.satDay | 0) >= (secondDay | 0)) cands.push({ day: r.satDay | 0, kind: 'sit' });
    const ld = (r.loss || {}).lineDay; if (ld != null && (ld | 0) >= (secondDay | 0)) cands.push({ day: ld | 0, kind: 'scatter:' + ((r.loss || {}).kind || '?') });
    cands.sort((a, b) => a.day - b.day);
    const endDay = (r.gameDays != null ? r.gameDays : (r.days != null ? r.days : 180)) | 0;
    pairLife = cands.length ? { days: cands[0].day - (secondDay | 0), end: cands[0].kind, endDay: cands[0].day } : { days: endDay - (secondDay | 0), end: 'ongoing-to-end', endDay };
  }
  return { seed: r.seed, plan: r.plan, kills: sorted.length, cov, prevNamed, chanNamed, secondDay, secondPair,
    gap: secondDay != null && firstKillDay != null ? secondDay - firstKillDay : null,
    peak: r.peakLivingVeterans, steps, pairLife };
});
for (const x of svRows) {
  if (x.missing) { console.log(`${x.seed}(${x.plan}): killLog MISSING (w4plusKills=${x.kills})`); continue; }
  console.log(`${x.seed}(${x.plan}): kills=${x.kills} cov=${x.cov.toFixed(2)} prevNamed=${x.prevNamed} chanNamed=${x.chanNamed} secondDay=${x.secondDay == null ? 'never' : 'd' + x.secondDay} pair=${x.secondPair || '—'} gap=${x.gap == null ? '—' : x.gap + 'd'} peak=${x.peak} pairLife=${x.pairLife ? x.pairLife.days + 'd->' + x.pairLife.end + '(d' + x.pairLife.endDay + ')' : '—'}`);
  for (const st of x.steps) console.log(`    d${st.day} ${st.killer} (${st.mid}) [${st.channel}] living=[${st.livingAfter.join(',')}] prev=${st.prevKiller || '—'} fate=${st.prevFate || '—'}`);
}
verdict('SECOND-VETERAN-coverage', svRows.every(x => !x.missing && x.cov >= 0.9 && x.prevNamed && x.chanNamed),
  `${svRows.filter(x => !x.missing && x.cov >= 0.9 && x.prevNamed && x.chanNamed).length}/${svRows.length}: ` +
  svRows.map(x => x.missing ? `${x.seed}:MISSING` : `${x.seed}:cov=${x.cov.toFixed(2)} prevNamed=${x.prevNamed} chan=${x.chanNamed} second=${x.secondDay == null ? 'never' : 'd' + x.secondDay}`).join(' | '));


// R124 FIRENARR (new instrument): every pilot JSON must carry a firenarr
// array (instrument health). Counts/kinds/days are descriptive; the sense
// judgment (falling-store evenings, no table-final pollution) is in the
// run note, from reading transcript context around firings.
console.log('=== journey-endgame r185: FIRENARR ===');
for (const r of recs) {
  const fn = r.firenarr || null;
  const kinds = {};
  if (Array.isArray(fn)) for (const f of fn) kinds[f.kind || '?'] = (kinds[f.kind || '?'] | 0) + 1;
  console.log(`${r.seed}(${r.plan}): firenarr n=${Array.isArray(fn) ? fn.length : 'MISSING'} kinds=${JSON.stringify(kinds)} days=${Array.isArray(fn) ? fn.map(f => 'd' + f.day + ':' + f.kind).join(',') : '—'} first=${Array.isArray(fn) && fn.length ? '"' + (fn[0].line || '').slice(0, 140) + '"' : 'none'}`);
}
verdict('FIRENARR-captured', recs.every(r => Array.isArray(r.firenarr)),
  `${recs.filter(r => Array.isArray(r.firenarr)).length}/${recs.length} JSONs carry firenarr arrays; total lines=${recs.reduce((s, r) => s + (Array.isArray(r.firenarr) ? r.firenarr.length : 0), 0)}`);


// R128 HURTRETURN (new instrument): every pilot JSON must carry a
// hurtreturn array (instrument health). Counts/days are descriptive; the
// sense judgment (trip return for a hurt villager, hp 1..7, never a
// walk-out) is in the run note, from reading transcript context —
// hurt-return lines fire pre-announce, so they do NOT appear in the
// announce-sliced transcripts; the JSON lines themselves are the evidence.
console.log('=== journey-endgame r185: HURTRETURN ===');
for (const r of recs) {
  const hr = r.hurtreturn || null;
  console.log(`${r.seed}(${r.plan}): hurtreturn n=${Array.isArray(hr) ? hr.length : 'MISSING'} days=${Array.isArray(hr) ? hr.map(h => 'd' + h.day).join(',') : '—'} first=${Array.isArray(hr) && hr.length ? '"' + (hr[0].line || '').slice(0, 140) + '"' : 'none'}`);
}
verdict('HURTRETURN-captured', recs.every(r => Array.isArray(r.hurtreturn)),
  `${recs.filter(r => Array.isArray(r.hurtreturn)).length}/${recs.length} JSONs carry hurtreturn arrays; total lines=${recs.reduce((s, r) => s + (Array.isArray(r.hurtreturn) ? r.hurtreturn.length : 0), 0)}`);

// R128 FALLEN-ambush (r125 fix check): ambush-murder victims must enter
// village.fallen. INFO print per seed; verdict GO iff every ambush-cause
// deathRecord has a matching fallen entry (same vid, or same name+day),
// or there are no ambush-cause deaths at all (vacuous, reported as such).
console.log('=== journey-endgame r185: FALLEN-ambush ===');
const faRows = recs.map(r => {
  const fallen = ((r.census || {}).fallen || []);
  const ambFallen = fallen.filter(f => (f.cause || '') === 'ambush');
  const ambDeaths = (r.deathRecords || []).filter(d => /ambush/i.test(d.cause || ''));
  const unmatched = ambDeaths.filter(d => !fallen.some(f => (f.id != null && String(f.id) === String(d.vid)) || (f.name && d.name && f.name === d.name && f.day === d.day)));
  console.log(`${r.seed}(${r.plan}): fallenAmbush=${ambFallen.map(f => (f.id || f.name) + '@d' + f.day).join(',') || 'none'} ambushDeaths=${ambDeaths.map(d => d.vid + ':' + d.cause + '@d' + d.day).join(',') || 'none'} unmatched=${unmatched.length}`);
  return { seed: r.seed, ok: unmatched.length === 0, ambFallen: ambFallen.length, ambDeaths: ambDeaths.length };
});
verdict('FALLEN-ambush', faRows.every(x => x.ok),
  `${faRows.filter(x => x.ok).length}/${faRows.length}: ` + faRows.map(x => `${x.seed}:fallenAmbush=${x.ambFallen} ambushDeaths=${x.ambDeaths}`).join(' | '));

// R147 V-WAITVARIETY (r144 question 6, Fix B volume): the hold line
// rotates through 5 variants (game.js tbVillagerWaitLine), so no two
// consecutive hold lines in a transcript may be identical. Per-seed:
// extract hold lines in transcript order, count per variant, and flag
// any adjacent repeat. A repeat after intervening different hold lines
// is allowed (the rotation wraps every 5).
console.log('=== journey-endgame r185: V-WAITVARIETY ===');
const HOLD_VARIANTS = [
  'holds and watches.',
  'waits, eyes on the beast.',
  'holds position, watching for an opening.',
  'stands ready, watching.',
  'keeps their distance and watches.',
];
const wvRows = recs.map(r => {
  let holds = [];
  try {
    const t = fs.readFileSync(path.join(DIR, `endgame-r185-${r.seed}-transcript.txt`), 'utf8');
    for (const line of t.split('\n')) {
      for (let i = 0; i < HOLD_VARIANTS.length; i++) {
        if (line.indexOf(HOLD_VARIANTS[i]) >= 0) { holds.push(i); break; }
      }
    }
  } catch (e) { holds = null; }
  const counts = [0, 0, 0, 0, 0];
  let adjacentRepeat = 0;
  if (Array.isArray(holds)) {
    for (let i = 0; i < holds.length; i++) {
      counts[holds[i]]++;
      if (i > 0 && holds[i] === holds[i - 1]) adjacentRepeat++;
    }
  }
  const ok = Array.isArray(holds) && adjacentRepeat === 0;
  console.log(`${r.seed}(${r.plan}): holds total=${Array.isArray(holds) ? holds.length : 'TRANSCRIPT-MISSING'} per-variant=[${counts.join(',')}] adjacentRepeats=${adjacentRepeat}`);
  return { seed: r.seed, ok, total: Array.isArray(holds) ? holds.length : -1, counts, adjacentRepeat };
});
verdict('V-WAITVARIETY', wvRows.every(x => x.ok),
  `${wvRows.filter(x => x.ok).length}/${wvRows.length}: ` + wvRows.map(x => `${x.seed}:total=${x.total} [${x.counts.join(',')}] adjRepeat=${x.adjacentRepeat}`).join(' | '));

// R118 SIT-DAY-DEATHS (r110's metric review item): deaths on the sat day
// and in the pre-sit week, flagged veteran-killer or not. INFO only.
console.log('=== journey-endgame r185: SIT-DAY-DEATHS ===');
for (const r of recs) {
  if (r.satDay == null) continue;
  const killers = new Set((((r.veterans || {}).killLog || []).map(k => String(k.killer))));
  const ds = (r.deathRecords || []).map(d => ({ vid: d.vid, day: d.day | 0, cause: d.cause || '?', vet: killers.has(String(d.vid)) }));
  const sitDay = ds.filter(d => d.day === (r.satDay | 0));
  const preWeek = ds.filter(d => d.day >= (r.satDay | 0) - 7 && d.day < (r.satDay | 0));
  console.log(`${r.seed}(${r.plan}): sat d${r.satDay} sit-day deaths=${sitDay.map(d => d.vid + ':' + d.cause + (d.vet ? ':VET' : '')).join(',') || 'none'} pre-sit-week=${preWeek.map(d => 'd' + d.day + ':' + d.vid + ':' + d.cause + (d.vet ? ':VET' : '')).join(',') || 'none'}`);
}

// R109 'other'-kind residual: after codex/telegraph kinds, what firstLines
// still read 'other'? INFO only — the W5 verdict uses cleaned-presence.
const otherRows = [];
for (const r of recs) for (const m of (r.w5Mentions || [])) if ((m.count | 0) > 0 && m.firstLineKind === 'other') otherRows.push({ seed: r.seed, id: m.id, day: m.firstDay, line: m.firstLine });
console.log('INFO W5 other-kind residual: ' + (otherRows.length ? otherRows.map(x => `${x.seed}:${x.id}@d${x.day} "${(x.line || '').slice(0, 120)}"`).join(' | ') : 'EMPTY (0)'));

// R109 feasted-at-open tally: among anatomy fights, how many sampled at open.
const faOpen = kaCov.filter(x => x.anatomy.feastedSource === 'open').length;
const faFb = kaCov.filter(x => x.anatomy.feastedSource !== 'open').length;
console.log(`INFO KILL-ANATOMY feasted source: open=${faOpen} postdaily-fallback=${faFb} feastedAtOpen-true=${kaCov.filter(x => x.anatomy.feastedAtOpen === true).length}/${kaCov.length}`);

// R92 LOSSKIND (r77's named item): every village-lost seed classified.
console.log('=== journey-endgame r95: LOSSKIND ===');
const lostRows = recs.filter(r => r.endReason === 'village-lost');
for (const r of lostRows) {
  const l = r.loss || {};
  console.log(`${r.seed}(${r.plan}): kind=${l.kind || 'MISSING'} source=${l.kindSource || '?'} lineKind=${l.lineKind || 'none'} lineDay=${l.lineDay == null ? 'na' : 'd' + l.lineDay} alive=${l.aliveAtEnd} pantry=${l.pantryAtEnd} scattered=${l.scatteredFlag} extinct=${l.extinctFlag} line=${(l.line || '').slice(0, 160)}`);
}
verdict('LOSSKIND-classified', lostRows.every(r => ['scattering', 'extinction', 'no-successor'].indexOf((r.loss || {}).kind) >= 0),
  lostRows.length ? `${lostRows.filter(r => ['scattering', 'extinction', 'no-successor'].indexOf((r.loss || {}).kind) >= 0).length}/${lostRows.length} classified: ` +
  lostRows.map(r => `${r.seed}:${(r.loss || {}).kind || 'MISSING'}`).join(' | ') : 'no village-lost seeds (vacuous)');

// r178 LADDER (new substrate: the staged Standing ladder prices the seats).
// L-PEAK (binding): every pilot JSON carries ladderSnapshot (stage, peak,
// counted, capstone). L-VOICE (info): seat-shortfall lines naming the ladder.
console.log('=== journey-endgame r185: LADDER ===');
const ladRows = recs.map(r => {
  const L = r.ladder || {};
  return { seed: r.seed, plan: r.plan, ok: L.stage != null && L.peak != null && L.counted != null,
    stage: L.stage, peak: L.peak, counted: L.counted, total: L.total, capstone: L.capstone || 'none',
    bundles: (L.bundleStages || []).join(',') || 'none', lines: (r.ladderLines || []).length };
});
for (const x of ladRows) console.log(`${x.seed}(${x.plan}): stage=${x.stage} peak=${x.peak} counted=${x.counted} total=${x.total} capstone=${x.capstone} bundles=${x.bundles} ladderLines=${x.lines}`);
verdict('L-PEAK', ladRows.length > 0 && ladRows.every(x => x.ok),
  `${ladRows.filter(x => x.ok).length}/${ladRows.length}: ` + ladRows.map(x => `${x.seed}:peak=${x.peak} counted=${x.counted} capstone=${x.capstone}`).join(' | '));

// r185 CAPSTONE (prereg §CAPSTONE POLICY; pass B only, CAPSTONE=1).
// M23 REVISED (r182 metric review): for every pass-B/C seed where
// deedGateReady().ok was true AND ladder peak >= 3
// (deedGateFirstOkDay != null), the probe must have attempted a
// delivery and every attempt must have succeeded counting ONLY
// refusals-despite-ready (a non-ok attempt whose reason is not
// 'none-ready'); honest none-ready attempts do not fail the rule.
// AND tableSeat() must have priced 'full' (firstFullSeatDay
// from the real tableSeat() read, or satSeatKind 'full') on at least one
// such seed. VACUOUS (no eligible seed) is recorded as NO-GO with the
// VACUOUS note — the headline question is unanswered, not passed; the
// run note carries the blocking deed bar per seed. M24 (A2 revised):
// if military_tribute fired, readiness at delivery was >= need
// (readiness counts the scholar per Steve's ruling) AND the delivery
// paid exactly need non-scholar veterans. Vacuous (no tribute delivery)
// is ok=true with a VACUOUS note — the check only applies when tribute
// fires. M24b (NEW): a scholar+1 seed (readiness veterans>=need but
// payable<need) must record a delivery refusal — the probe records the
// game's 'veterans-short' refusal alongside the readiness entry
// (veterans>=need, payable<need), which is the observable naming the
// fix provides (the game's reason string itself is generic).
console.log('=== journey-endgame r185: CAPSTONE ===');
const capRows = recs.map(r => {
  const c = r.capstone || {};
  const att = Array.isArray(c.attempts) ? c.attempts : [];
  const del = c.delivery || null;
  const dg = c.deedGate || null;
  const eligible = !!c.enabled && c.deedGateFirstOkDay != null;
  const refused = att.filter(a => !(a.result && a.result.ok));
  // R185 REVISION (r182 metric review): an honest none-ready attempt
  // (no kind ready yet) is NOT a refusal-despite-readiness. Only a
  // non-ok attempt with a reason other than 'none-ready' counts
  // against the rule; the none-ready count is still printed in the
  // verdict note below.
  const refusedReady = att.filter(a => a.result && !a.result.ok && a.result.reason !== 'none-ready');
  const fs = r.fullseat || {};
  const pricedFull = fs.firstFullSeatDay != null || r.satSeatKind === 'full';
  const bo = r.buyout || {};
  const boa = Array.isArray(bo.attempts) ? bo.attempts : [];
  console.log(`${r.seed}(${r.plan}): enabled=${!!c.enabled} deedGateFirstOk=${c.deedGateFirstOkDay == null ? 'never' : 'd' + c.deedGateFirstOkDay} deedGateEnd=${dg ? JSON.stringify({ ok: dg.ok, w5: dg.w5, scale: dg.scale, rank: dg.rank, pantryKcal: dg.pantryKcal, atHaven: dg.atHaven }) : 'none'} attempts=${att.length} delivery=${del ? del.kind + '@d' + del.day + (del.names ? ' (' + del.names.join('+') + ')' : '') : 'none'} refused=${refused.map(a => (a.result && a.result.reason) || '?').join(',') || 'none'} missedSit=${c.missedSit ? 'd' + c.missedSit.satDay + ' ready:' + (c.missedSit.readyKinds || []).join(',') : 'none'} pricedFull=${pricedFull ? 'd' + (fs.firstFullSeatDay != null ? fs.firstFullSeatDay : r.satDay) : 'no'} sat=${r.satSeatKind || '—'} buyout=${bo.enabled ? (boa.length ? boa.map(a => `d${a.day}${a.early ? '(early)' : ''}@${a.atHaven ? 'haven' : 'away'}/pantry${a.pantryKcal}:${a.result ? (a.result.ok ? `BOUGHT spent${a.result.spent} after${a.result.pantryAfter}` : a.result.why) : '?'}`).join(' | ') : 'enabled, no attempts (pantry<8000 or away or kind-ready in-window)') : 'disabled'}`);
  return { seed: r.seed, eligible, attempts: att.length, delivered: !!del, refused: refused.length, refusedReady: refusedReady.length, pricedFull, del, buyout: boa };
});
const capPassB = recs.some(r => (r.capstone || {}).enabled);
const capEligible = capRows.filter(x => x.eligible);
const capNoRefusal = capEligible.every(x => x.refusedReady === 0 && x.delivered);
const capPriced = capEligible.some(x => x.pricedFull);
// 'refused' above counts every non-ok attempt; a 'none-ready' attempt is
// NOT a refusal-despite-readiness — it means no kind was ready to
// deliver. Count those separately so the note names the real failure:
// nothing ready (a capstone-readiness finding) vs a refused delivery
// (a readiness/delivery agreement failure).
const capNoneReady = recs.reduce((s, r) => s + (((r.capstone || {}).attempts) || []).filter(a => a.result && a.result.reason === 'none-ready').length, 0);
const capRefusedReady = recs.reduce((s, r) => s + (((r.capstone || {}).attempts) || []).filter(a => a.result && !a.result.ok && a.result.reason !== 'none-ready').length, 0);
verdict('M23-capstone', !capPassB || (capEligible.length > 0 && capNoRefusal && capPriced),
  !capPassB ? 'pass A: capstone leg disabled (see pass B)'
  : capEligible.length === 0 ? `VACUOUS: no pass-B seed reached deedGateReady().ok && peak>=3 (deedGate ends: ${recs.map(r => `${r.seed}:${((r.capstone || {}).deedGate || {}).ok ? 'ok' : 'no(' + (((r.capstone || {}).deedGate || {}).w5) + 'w5/' + (((r.capstone || {}).deedGate || {}).rank) + ')'}`).join(' | ')})`
  : `${capEligible.length} eligible: delivered ${capEligible.filter(x => x.delivered).length}/${capEligible.length}, none-ready ${capNoneReady}, refused-despite-ready ${capRefusedReady}, pricedFull ${capEligible.filter(x => x.pricedFull).length}/${capEligible.length} — ` +
    capEligible.map(x => `${x.seed}:${x.del ? x.del.kind + '@d' + x.del.day : 'none'}${x.pricedFull ? '/FULL' : ''}`).join(' | '));
const tribRows = capRows.filter(x => x.del && x.del.kind === 'military_tribute');
// r178 AMENDMENT A1 (pre-pilot, smoke evidence — see prereg amendment):
// the r162 formulation (readyVeterans === paid) conflates "veterans on
// hand" with "veterans paid": a correct delivery pays `need` (2) of N on
// hand, so it NO-GOs whenever N > 2 (smoke: 4 on hand, 2 paid). The
// agreement that matters is: readiness said >= need on hand, and the
// delivery paid exactly need. GO iff that holds on every tribute
// delivery; vacuous if no tribute delivery fires.
const tribOk = tribRows.every(x => x.del.readyVeterans != null && x.del.readyNeed != null && x.del.veterans != null && x.del.readyVeterans >= x.del.readyNeed && x.del.veterans.length === x.del.readyNeed);
verdict('M24-tribute-agreement', !capPassB || tribOk,
  !capPassB ? 'pass A: capstone leg disabled (see pass B)'
  : tribRows.length === 0 ? 'VACUOUS: no military_tribute delivery fired'
  : `${tribRows.length} tribute deliveries: ` + tribRows.map(x => `${x.seed}:onHand=${x.del.readyVeterans} need=${x.del.readyNeed} paid=${(x.del.veterans || []).length}`).join(' | '));
// r178 M24b-SCHOLAR-PLUS-ONE (prereg §M24b; pass B and C): a seed that
// reaches deedGate ok && peak>=3 with military_tribute readiness
// veterans>=need but payable<need (the scholar is counted but cannot
// be paid) must record a delivery refusal — the probe records the
// game's 'veterans-short' refusal alongside the readiness entry
// (veterans>=need, payable<need), which is the observable naming the
// fix provides. GO iff every such seed carries >=1 recorded refusal
// (or the seat opened via another kind first, which moots the gap);
// VACUOUS if no such seed. A scholar+1 seed with NO recorded refusal
// and NO delivery is a silent skip — FAIL LOUDLY.
const m24bSeeds = [];
for (const r of recs) {
  const c = r.capstone || {};
  const att = Array.isArray(c.attempts) ? c.attempts : [];
  let scholarPlusOne = false, refusedNamed = false;
  for (const a of att) {
    const t = (a.readiness || []).find(x => x.kind === 'military_tribute');
    if (!t || !t.ready) continue;
    if ((t.veterans | 0) >= (t.need | 0) && t.payable != null && (t.payable | 0) < (t.need | 0)) {
      scholarPlusOne = true;
      if (a.result && !a.result.ok && a.result.reason === 'veterans-short') refusedNamed = true;
    }
  }
  if (scholarPlusOne) m24bSeeds.push({ seed: r.seed, refusedNamed, coveredByDelivery: !!c.delivery });
}
const m24bOk = m24bSeeds.every(x => x.refusedNamed || x.coveredByDelivery);
verdict('M24b-scholar-plus-one', !capPassB || m24bOk,
  !capPassB ? 'pass A: capstone leg disabled (see pass B)'
  : m24bSeeds.length === 0 ? 'VACUOUS: no scholar+1 seed (no day with tribute readiness veterans>=need, payable<need)'
  : `${m24bSeeds.length} scholar+1 seeds: ` + m24bSeeds.map(x => `${x.seed}:${x.refusedNamed ? 'refusal-recorded' : (x.coveredByDelivery ? 'covered-by-delivery' : 'SILENT-SKIP')}`).join(' | '));
// R185: M25-BUYOUT DROPPED from the printed set entirely (r182
// metric-review proposal, adopted in the r185 prereg: vacuous a fourth
// straight run — the early buy-out buys the bundle before the window
// opens, so the in-window rule never fires). M25c-buyout-early stays
// PRIMARY. The buyout window data is still recorded in the per-seed
// JSONs; nothing is computed or printed here.
// r178 M25c-BUYOUT-EARLY (prereg §PASS-C; pass C only, BUYOUT_EARLY=1):
// same coverage rule as M25 but over the early window (peak >= 3,
// deedGate ok or not, no bundle done, no kind ready): every day with
// pantryKcal >= 8000 AND the scholar at Haven must carry a buy-out
// attempt. GO iff every such day was attempted AND every attempt
// result is recorded with ok/why. VACUOUS (no such day) is recorded
// as NO-GO with the VACUOUS note — the early Joja path stays
// unmeasured, not passed. A buy-out that starves the village before
// the seat is a finding (recorded per seed), not a metric miss.
const buyEarlyPassC = recs.some(r => (r.buyout || {}).earlyEnabled);
const buyWinE = [];
for (const r of recs) for (const w of ((r.buyout || {}).windowEarly || [])) buyWinE.push({ seed: r.seed, day: w.day, deedGateOk: w.deedGateOk, pantryKcal: w.pantryKcal, atHaven: w.atHaven, bundleDone: w.bundleDone, anyReady: w.anyReady, attempted: w.attempted, buyOk: w.buyOk });
const buyEligibleE = buyWinE.filter(w => (w.pantryKcal | 0) >= 8000 && w.atHaven === true && !w.bundleDone && !w.anyReady);
const buySkippedE = buyEligibleE.filter(w => !w.attempted);
const buyAttemptsE = recs.reduce((s, r) => s + (((r.buyout || {}).attempts) || []).filter(a => a.early).length, 0);
const buyBoughtE = recs.reduce((s, r) => s + (((r.buyout || {}).attempts) || []).filter(a => a.early && a.result && a.result.ok).length, 0);
verdict('M25c-buyout-early', !buyEarlyPassC || (buyEligibleE.length > 0 && buySkippedE.length === 0),
  !buyEarlyPassC ? 'pass A/B: early buy-out leg disabled (see pass C)'
  : buyEligibleE.length === 0 ? `VACUOUS: no peak>=3 day with pantry>=8000 at Haven and no bundle/kind ready (early window days: ${buyWinE.length})`
  : `${buyEligibleE.length} eligible early-days, ${buySkippedE.length} skipped, ${buyAttemptsE} early attempts, ${buyBoughtE} bought — ` +
    buyEligibleE.map(w => `${w.seed}:d${w.day}/pantry${w.pantryKcal}@haven${w.deedGateOk ? '/dg-ok' : '/dg-not-ok'}:${w.attempted ? (w.buyOk ? 'BOUGHT' : 'attempted-refused') : 'SKIPPED'}`).join(' | '));

// R185 STARVATION WATCH (prereg §PASS-C-WIDE; printed on every pass,
// JUDGED only on the wide pass): per-seed early buy-out vs starvation
// deaths. 'after' is pantry-spent — the JSON's recorded pantryAfter
// snapshots the pantry before the buy settles (r182 run-note
// arithmetic: 21111-8100=13011), so it is not used here. A buy that
// starves the village before the seat is a FINDING about the price,
// not a metric miss. Starvation deaths come from deathRecords
// (cause === 'starvation', with name and day).
console.log('=== journey-endgame r185: STARVATION ===');
for (const r of recs) {
  const bo = r.buyout || {};
  const bought = ((bo.attempts) || []).filter(a => a.result && a.result.ok);
  const starved = ((r.deathRecords) || []).filter(d => d.cause === 'starvation');
  console.log(`STARVATION ${r.seed}(${r.plan}): bought=${bought.map(a => `d${a.day}/pantry${a.pantryKcal}/spent${(a.result || {}).spent}/after${(a.pantryKcal | 0) - ((a.result || {}).spent | 0)}`).join(' | ') || 'none'} starvationDeaths=${starved.map(d => `${d.name || d.vid} d${d.day}`).join(', ') || 'none'} sat=${r.satSeatKind || '—'}@d${r.satDay == null ? '?' : r.satDay}`);
}

// R185 --wide exit: judge the wide pass on M25c only (the STARVATION
// section above is the tally; it never fails the run). Exit follows
// M25c, not ALL. Placed before the full lines dump so the wide pass
// prints only the M25c line, the STARVATION section, and this line.
if (WIDE) {
  const m25c = verdicts.find(v => v.id === 'M25c-buyout-early');
  console.log((m25c && m25c.ok ? 'GO  ' : 'NO-GO') + ' M25c-buyout-early: ' + (m25c ? m25c.note : 'missing'));
  console.log('WIDE-VERDICT ' + (m25c && m25c.ok ? 'GO' : 'NO-GO') + ' | M25c only (wide pass: M25c + starvation)');
  process.exit(m25c && m25c.ok ? 0 : 1);
}

console.log('');
console.log('=== journey-endgame r185 verdict ===');
for (const l of lines) console.log(l);
console.log('');
console.log('per-seed:', recs.map(r => {
  const fs45 = r.fullseat || {};
  return `${r.seed}(${r.plan}):ann${r.announceDay}/sat${r.satDay}/${r.satSeatKind || '—'}/${r.walkedPath || '—'}/${r.walkedBranch || '?'} won=${r.won} end=${r.endReason} ` +
    `census=${((r.fightCensus && r.fightCensus.fights) || []).map(f => f.outcome).join(',') || 'none'} nonCom=${(r.fightCensus && r.fightCensus.nonCommittedW4) || 0} causalDeaths=${((r.fightCensus && r.fightCensus.fights) || []).reduce((t, f) => t + ((f.causalDeaths || []).length), 0)} blockedArr=${(r.blockedArrivals || []).length} ` +
    `full=${fs45.firstFullSeatDay == null ? 'never' : 'd' + fs45.firstFullSeatDay} w5max=${((fs45.max || {}).w5 | 0)} ` +
    `final=${r.finalPickId || '—'} res=${r.finalResolved} noticed=${r.noticedCount} cross=${r.bandCrossings} ` +
    `vetLiving=${((r.veterans || {}).livingVeteranCount | 0)} vetFights=${((r.veterans || {}).vetFights | 0)} dpsBails=${((r.veterans || {}).vetDpsFledSeen | 0)} uw=${(r.veterans || {}).unlockedWave} feast=${r.feastChain ? `f${r.feastChain.feasts}/a${r.feastChain.armedFeasts}/draw${r.feastChain.facedDraw}/fd${r.feastChain.feastedDays}/surge${r.feastChain.surgeDay == null ? 'never' : 'd' + r.feastChain.surgeDay}` : 'MISSING'} ladder=${r.ladder ? `peak${r.ladder.peak}/st${r.ladder.stage}/c${r.ladder.counted}/cap:${r.ladder.capstone || 'none'}/bun:${(r.ladder.bundleStages || []).join(',') || 'none'}` : 'MISSING'}`;
}).join('\n          '));
const primaryIds = ['M1-guard', 'M2-census', 'M2c-engine-coverage', 'M2d-gate-named', 'M3b-peak', 'M4-wave5-or-full', 'M5-voicing-canonical', 'M5b-relay-branch-tabulation', 'M6-guard-named-deferred', 'M8-exit-canon', 'M10-fullseat-gap', 'M11-standing-peak', 'M12-bar-record', 'M13-release-snapshot', 'M14-invite-classification', 'M15-feast-census', 'M16-dusk-census', 'M17-surge-mode', 'M18-ghost-scan', 'M19-grant-log', 'M20-standing-trace', 'M21-audit-crosscheck', 'M22-feast-hold', 'REG-r35-audit', 'REG-r37-satpenalty', 'VETCONV-recon', 'LOSSKIND-classified', 'W5-question', 'KILL-ANATOMY-coverage', 'SECOND-VETERAN-coverage', 'MFLEE-routed-coverage', 'FIRENARR-captured', 'HURTRETURN-captured', 'FALLEN-ambush', 'V-WAITVARIETY', 'L-PEAK', 'M23-capstone', 'M24-tribute-agreement', 'M24b-scholar-plus-one', 'M25c-buyout-early'];
const primary = primaryIds.every(id => (id === 'M8-exit-canon' && mFleeFights.length === 0) ? true : (verdicts.find(v => v.id === id) || {}).ok);
// R135 FIX (r131 metric-review proposal, owned by r156): M4-wave5-or-full
// and W5-question are ROAD TALLIES per the prereg, not bindings, but they
// sat inside primaryIds, so PRIMARY NO-GO on a closed road read as a
// binding failure. PRIMARY is kept byte-for-byte for continuity; the new
// PRIMARY-BINDINGS line judges only the binding ids (primaryIds minus
// the tally ids, M3-conversion included defensively though it was never
// in primaryIds). No threshold changed, no verdict changed, exit code
// still follows ALL.
const tallyIds = ['M3-conversion', 'M4-wave5-or-full', 'W5-question'];
const bindingsIds = primaryIds.filter(id => !tallyIds.includes(id));
const bindingsOk = bindingsIds.every(id => (id === 'M8-exit-canon' && mFleeFights.length === 0) ? true : (verdicts.find(v => v.id === id) || {}).ok);
const allOk = verdicts.every(v => v.ok);
console.log('');
console.log('PRIMARY-BINDINGS ' + (bindingsOk ? 'GO' : 'NO-GO') + ' | PRIMARY ' + (primary ? 'GO' : 'NO-GO') + ' | ALL ' + (allOk ? 'GO' : 'NO-GO'));
process.exit(allOk ? 0 : 1);
