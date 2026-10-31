#!/usr/bin/env node
// analyze-endgame-r74-20261030.js — journey-endgame r74 verdict.
// Reads evidence/2026-10-30/perseed-endgame-r74/endgame-r74-*.json,
// evaluates the pre-registered bindings (see journey-endgame-r74-prereg.md).
// Exit 0 = ALL GO, 1 = any NO-GO.
// Usage: node scripts/analyze-endgame-r74-20261030.js
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-30', 'perseed-endgame-r74');
const files = fs.readdirSync(DIR).filter(f => /^endgame-r74-\d+\.json$/.test(f)).sort();
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
  if (r.withdrawal) return 'withdrawal';
  try {
    const t = fs.readFileSync(path.join(DIR, `endgame-r74-${r.seed}-transcript.txt`), 'utf8');
    if (/PELLET HUMS/.test(t)) return 'withdrawal';
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
console.log('=== journey-endgame r74: vFlee watch ===');
for (const r of wavesAll) {
  const fc = r.fightCensus || {};
  for (const f of (fc.fights || [])) {
    if (f.outcome === 'vFlee') console.log(`${r.seed}(${r.plan}): d${f.startDay} ${f.monsters.join('+')} escapeKind=${f.escapeKind} source=${f.source} committed=${f.committed}`);
  }
}
console.log('=== journey-endgame r74: withdrawal watch ===');
for (const r of recs) {
  if (r.withdrawal) console.log(`${r.seed}(${r.plan}): withdrawal day=${r.withdrawal.day != null ? r.withdrawal.day : '?'} line=${String(r.withdrawal.line || '').slice(0, 160)}`);
}

// M2b ATTRIBUTION (carried instrument question): every dieFlag fight is
// classified causal-vs-daywindow; >=1 dieFlag fight (if any exist)
// carries >=1 NAMED fight-causal death. NO-DATA if no dieFlag fights.
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
      return `${x.seed}:d${x.fight.startDay} ${x.fight.monsters.join('+')} diedDay=${(x.fight.diedInFight || []).join(',') || 'none'} causal=[${names}]`;
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
console.log('=== journey-endgame r74: exit canon (mFlee fights x codex slain) ===');
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
console.log('=== journey-endgame r74: blocked wave-4 arrivals (supply) ===');
let blockedTotal = 0;
for (const r of recs) {
  const ba = r.blockedArrivals || [];
  blockedTotal += ba.length;
  for (const b of ba) console.log(`${r.seed}(${r.plan}): monster=${b.monster || 'unnamed'} :: ${b.line}`);
  if (!ba.length) console.log(`${r.seed}(${r.plan}): no blocked arrivals observed`);
}
lines.push(`INFO M9-supply: ${blockedTotal} blocked wave-4 arrivals recorded across ${recs.length} seeds (see table above; GO/NO-GO judged in the run note against the code rule, not by count)`);

// Death-channel summary (r51): every recorded person-death with its fight context.
console.log('=== journey-endgame r74: death records (channel x fight context) ===');
for (const r of recs) {
  const drs = r.deathRecords || [];
  console.log(`${r.seed}(${r.plan}): deaths=${drs.length} wrapErrors=${r.deathWrapErrors | 0}`);
  for (const d of drs) {
    console.log(`  d${d.day} ${d.name || d.vid} via=${d.channel} cause=${d.cause || '?'} fightLive=${d.fightLive} fightOver=${d.fightOver} mons=${(d.monsters || []).map(m => m.id + '/w' + m.wave).join('+') || 'none'}`);
  }
}

// Census distribution table (all waves seeds) + per-fight detail.
console.log('=== journey-endgame r74: fight-outcome census ===');
for (const r of wavesAll) {
  const fc = r.fightCensus || {};
  for (const f of (fc.fights || [])) {
    console.log(`${r.seed}(${r.plan}): d${f.startDay}-d${f.endDay} ${f.monsters.join('+')} turns=${f.turns}${f.turnsObserved ? '' : '(turns-unobs)'} outcome=${f.outcome} src=${f.source || '?'} esc=${f.escapeKind || '?'} drv=${f.openDriver || '?'} com=${f.committed !== false} arena=${f.arenaMention ? 'Y' : 'n'} deathCauses=${(f.deathCauses || []).join(',') || 'none'} kill=${f.killFlag} die=${f.dieFlag} talk=${f.talkDown} gotAway=${f.gotAway} pFled=${f.playerFled} vFled=${f.villFled} mFled=${f.monFled} result=${f.result} close=${f.closeWhy} causal=${(f.causalDeaths || []).map(d => (d.name || d.vid) + ':' + d.channel).join('+') || 'none'} diedDay=${(f.diedInFight || []).join(',') || 'none'}`);
  }
}
// r54 FAST-FIGHT NOTE (census blind-spot fix): single-call wave-4
// fights, tallied separately, never merged into the outcome distribution.
console.log('=== journey-endgame r74: fast wave-4 fights (merged into census as source=policy-fast; separate tally retired) ===');
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
verdict('M4b-conjunction', m4brows.some(x => x.ok),
  `${m4brows.filter(x => x.ok).length}/${m4brows.length}: ` + m4brows.map(x => `${x.seed}:uw=${x.uw} ann=${x.ann == null ? 'never' : 'd' + x.ann}`).join(' | '));

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
const m5ok = (ctrl.length > 0 && m5rows.every(x => x.ok)) || m5fallback;
verdict('M5-voicing-canonical', m5ok,
  m5fallback ? `FALLBACK (control dead before window: ${ctrl.map(r => r.seed + ':' + r.endReason).join(' ')}): ${fallbackRelayNoticed.length} relay finals with notice lines (${fallbackRelayNoticed.map(r => r.seed + ':' + r.walkedBranch).join(' ')})`
    : ctrl.length === 0 ? 'no forcedrift control seed'
    : `${m5rows.filter(x => x.ok).length}/${ctrl.length}: ` +
      m5rows.map(x => `${x.seed}:crossed=${x.crossed} voiced=${x.voiced}`).join(' '));

// M5b RELAY-BRANCH TABULATION (r65, binding as preregistered): every relay
// final in the block — waves seeds included, not just the control — tabulated
// by branch, so the r60 lead (dark fires markers, grey did not) can be judged
// across branches. noticeLines are printed in full (they are short); a relay
// final missing from this table is a NO-GO, never a silent drop.
const relayFinals = recs.filter(r => r.walkedPath === 'relay' && r.satDay != null);
console.log('=== journey-endgame r74: M5b relay-branch tabulation ===');
for (const r of relayFinals) {
  const rg = r.rg || {};
  console.log(`${r.seed}(${r.plan}): branch=${r.walkedBranch} noticed=${r.noticedCount} bandCrossings=${r.bandCrossings} doorRelay=${rg.doorRelay} doorDelegated=${rg.doorDelegated} verbs=${rg.verbs} communes=${rg.communes} sat=${r.satDay} seat=${r.satSeatKind} won=${r.won} finalPick=${r.finalPickId} noticeLines=${JSON.stringify(r.noticeLines || [])}`);
}
const m5bTabulated = relayFinals.every(r => r.walkedBranch != null && (r.noticeLines != null));
const m5bCtrlNamed = ctrl.length > 0 && ctrl.every(r => r.walkedBranch != null);
verdict('M5b-relay-branch-tabulation', relayFinals.length === 0 ? m5bCtrlNamed : (m5bTabulated && relayFinals.length >= 1),
  relayFinals.length === 0
    ? `no relay final in block; control branch named=${m5bCtrlNamed} (${ctrl.map(r => r.seed + ':' + r.walkedPath + '/' + r.walkedBranch).join(' ')})`
    : `${relayFinals.length} relay finals tabulated: ` + relayFinals.map(r => `${r.seed}:${r.walkedBranch}:noticed=${r.noticedCount}:cross=${r.bandCrossings}`).join(' '));

// M6 GUARD NAMED (deferred scope, carried): every sat waves seed with
// deferDays >= 1 records a named window-end guard (not 'unknown').
const satWavesDef = recs.filter(r => (r.plan === 'waves' || r.plan === 'wavesnw') && r.satDay != null && (r.deferDays | 0) >= 1);
const m6rows = satWavesDef.map(r => ({ seed: r.seed, g: r.windowEndGuard, ok: r.windowEndGuard != null && r.windowEndGuard !== 'unknown' }));
verdict('M6-guard-named-deferred', satWavesDef.length > 0 && m6rows.every(x => x.ok),
  `${m6rows.filter(x => x.ok).length}/${satWavesDef.length} deferred sat waves named: ` +
  m6rows.map(x => `${x.seed}:guard=${x.g}`).join(' | '));

// Vetguard trace (info): per waves seed, guard-trace decision sequence.
console.log('=== journey-endgame r74: vetguard trace + same-day fix check ===');
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
console.log('=== journey-endgame r74: full-seat component reach (from max) ===');
for (const r of recs) {
  const fs50 = r.fullseat || {};
  console.log(`${r.seed}(${r.plan}): defer=${r.deferDays == null ? 'na' : r.deferDays + 'd'} greedyWaits=${(r.greedy && r.greedy.waits) || 0} armDon=${(r.armory && r.armory.donations) || 0} guard=${r.windowEndGuard} maxTier=${r.maxTier} satPen=${r.satPenalty ? JSON.stringify(r.satPenalty) : 'na'} otLines=${r.overtimeLines | 0} best=${fs50.bestSeat} ` +
    `firstFull=${fs50.firstFullSeatDay == null ? 'never' : 'd' + fs50.firstFullSeatDay} ` +
    `indispEver=${fs50.indispEver} standing_max=${(fs50.max || {}).standing} ` +
    `binding=[${bindingFromMax(fs50).join(', ')}]`);
}


// M10 FULL-SEAT GAP (r55 new): every sat waves seed's closest gap named —
// full reached (firstFullSeatDay != null) or a non-empty binding list.
const m10rows = recs.filter(r => (r.plan === 'waves' || r.plan === 'wavesnw') && r.announceDay != null && r.satDay != null).map(r => {
  const fs50 = r.fullseat || {};
  const b = bindingFromMax(fs50);
  const full = fs50.firstFullSeatDay != null;
  return { seed: r.seed, full, fullDay: fs50.firstFullSeatDay, gap: b, ok: full || b.length > 0 };
});
verdict('M10-fullseat-gap', m10rows.length > 0 && m10rows.every(x => x.ok),
  `${m10rows.filter(x => x.ok).length}/${m10rows.length}: ` +
  m10rows.map(x => `${x.seed}:${x.full ? 'FULL d' + x.fullDay : 'gap=[' + x.gap.join(',') + ']'}`).join(' | '));

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
console.log('=== journey-endgame r74: feast-chain census detail ===');
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
console.log('=== journey-endgame r74: dusk census detail ===');
for (const x of m16rows) {
  const r = recs.find(v => v.seed === x.seed);
  const awayDays = ((r.duskCensus || {}).days || []).filter(d => d.atHaven === false).map(d => d.day);
  console.log(`${x.seed}(${x.plan}): awayDusks=${awayDays.length} days=[${awayDays.slice(0, 40).join(',')}${awayDays.length > 40 ? ',...' : ''}]`);
}

// M17 SURGE-MODE NAMED (r71 new): every surged seed carries >=1 named spend.
const m17rows = recs.map(r => {
  const f = r.feastChain || {};
  const spends = r.surgeSpends || f.surgeSpends || [];
  const surged = f.surgeDay != null;
  const named = spends.filter(sp => sp.kind === 'combat' || sp.kind === 'healing');
  const ok = !surged || named.length >= 1;
  return { seed: r.seed, surged, surgeDay: f.surgeDay, spends, named, ok };
});
verdict('M17-surge-mode', m17rows.every(x => x.ok),
  `${m17rows.filter(x => x.ok).length}/${m17rows.length}: ` +
  m17rows.map(x => `${x.seed}:surge=${x.surgeDay == null ? 'never' : 'd' + x.surgeDay} spends=[${x.spends.map(sp => 'd' + sp.day + ':' + sp.kind + '(' + (sp.by || '?') + ')').join(',') || 'none'}]`).join(' | '));

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
console.log('=== journey-endgame r74: grant log detail ===');
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
const m21rows = recs.filter(r => r.announceDay != null && r.satDay != null).map(r => {
  const al = r.auditLine || '';
  const m123 = al.match(/waves 1–3 faced \((\d+)\/(\d+)\/(\d+)\)/);
  const m45 = al.match(/with (\d+) wave-4(?: and (\d+) wave-5)? fought/);
  const parsed = m123 ? { w1: +m123[1], w2: +m123[2], w3: +m123[3],
    w4: m45 ? +m45[1] : 0, w5: m45 && m45[2] ? +m45[2] : 0 } : null;
  const sw = r.satWaves || {};
  const match = !!parsed && parsed.w1 === (sw.w1 | 0) && parsed.w2 === (sw.w2 | 0) && parsed.w3 === (sw.w3 | 0)
    && parsed.w4 === (sw.w4 | 0) && parsed.w5 === (sw.w5 | 0);
  const censusN = ((r.fightCensus && r.fightCensus.fights) || []).length;
  const otherEnd = ((r.fightCensus && r.fightCensus.fights) || []).filter(f => f.outcome === 'otherEnd').length;
  return { seed: r.seed, parsed, sw, match, censusN, auditTypes: parsed ? parsed.w4 + parsed.w5 : null, otherEnd,
    ok: !!parsed && match };
});
verdict('M21-audit-crosscheck', m21rows.length > 0 && m21rows.every(x => x.ok),
  `${m21rows.filter(x => x.ok).length}/${m21rows.length}: ` +
  m21rows.map(x => x.parsed ? `${x.seed}:audit=(${x.parsed.w1}/${x.parsed.w2}/${x.parsed.w3})+${x.parsed.w4}/${x.parsed.w5} satWaves=(${x.sw.w1}/${x.sw.w2}/${x.sw.w3})+${x.sw.w4}/${x.sw.w5} match=${x.match} census=${x.censusN} auditTypes=${x.auditTypes} otherEnd=${x.otherEnd}` : `${x.seed}:AUDIT-UNPARSED`).join(' | '));

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
console.log('=== journey-endgame r74: feast-hold classification (per arm) ===');
for (const arm of ['waves', 'wavesnw', 'forcedrift']) {
  const rows = m22rows.filter(x => x.plan === arm);
  if (!rows.length) continue;
  const tot = {};
  for (const x of rows) for (const k of Object.keys(x.counts)) tot[k] = (tot[k] || 0) + x.counts[k];
  const dusks = Object.values(tot).reduce((a, b) => a + b, 0);
  console.log(`${arm}: dusks=${dusks} ` + Object.keys(tot).sort().map(k => `${k}=${tot[k]} (${dusks ? Math.round(tot[k] / dusks * 100) : 0}%)`).join(' '));
}

// M9b CONTENTION SHARE (r73 new, reported not gating): blocked wave-4
// arrivals / (blocked + committed wave-4 fights), per arm. No bar yet;
// r74 proposes one from these values.
for (const arm of ['waves', 'wavesnw', 'forcedrift']) {
  const rows = recs.filter(r => r.plan === arm);
  if (!rows.length) continue;
  const blocked = rows.reduce((t, r) => t + ((r.blockedArrivals || []).length), 0);
  const committed = rows.reduce((t, r) => t + (((r.fightCensus && r.fightCensus.fights) || []).length), 0);
  const share = blocked + committed ? Math.round(blocked / (blocked + committed) * 1000) / 10 : null;
  const r73 = { waves: 86.4, wavesnw: 80.3, forcedrift: 88.9 }[arm];
  const swing = (share == null || r73 == null) ? null : Math.abs(share - r73);
  console.log(`INFO M9b-contention-share ${arm}: blocked=${blocked} committed=${committed} share=${share == null ? 'na' : share + '%'} r73=${r73 == null ? 'na' : r73 + '%'} swing=${swing == null ? 'na' : swing.toFixed(1) + 'pt'} ${swing != null && swing > 10 ? 'WATCH-FLAG' : ''}`);
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
console.log('=== journey-endgame r74 verdict ===');
for (const l of lines) console.log(l);
console.log('');
console.log('per-seed:', recs.map(r => {
  const fs45 = r.fullseat || {};
  return `${r.seed}(${r.plan}):ann${r.announceDay}/sat${r.satDay}/${r.satSeatKind || '—'}/${r.walkedPath || '—'}/${r.walkedBranch || '?'} won=${r.won} end=${r.endReason} ` +
    `census=${((r.fightCensus && r.fightCensus.fights) || []).map(f => f.outcome).join(',') || 'none'} nonCom=${(r.fightCensus && r.fightCensus.nonCommittedW4) || 0} causalDeaths=${((r.fightCensus && r.fightCensus.fights) || []).reduce((t, f) => t + ((f.causalDeaths || []).length), 0)} blockedArr=${(r.blockedArrivals || []).length} ` +
    `full=${fs45.firstFullSeatDay == null ? 'never' : 'd' + fs45.firstFullSeatDay} w5max=${((fs45.max || {}).w5 | 0)} ` +
    `final=${r.finalPickId || '—'} res=${r.finalResolved} noticed=${r.noticedCount} cross=${r.bandCrossings} ` +
    `vetLiving=${((r.veterans || {}).livingVeteranCount | 0)} vetFights=${((r.veterans || {}).vetFights | 0)} dpsBails=${((r.veterans || {}).vetDpsFledSeen | 0)} uw=${(r.veterans || {}).unlockedWave} feast=${r.feastChain ? `f${r.feastChain.feasts}/a${r.feastChain.armedFeasts}/draw${r.feastChain.facedDraw}/fd${r.feastChain.feastedDays}/surge${r.feastChain.surgeDay == null ? 'never' : 'd' + r.feastChain.surgeDay}` : 'MISSING'}`;
}).join('\n          '));
const primaryIds = ['M1-guard', 'M2-census', 'M2c-engine-coverage', 'M2d-gate-named', 'M3b-peak', 'M4-wave5-or-full', 'M5-voicing-canonical', 'M5b-relay-branch-tabulation', 'M6-guard-named-deferred', 'M8-exit-canon', 'M10-fullseat-gap', 'M11-standing-peak', 'M12-bar-record', 'M13-release-snapshot', 'M14-invite-classification', 'M15-feast-census', 'M16-dusk-census', 'M17-surge-mode', 'M18-ghost-scan', 'M19-grant-log', 'M20-standing-trace', 'M21-audit-crosscheck', 'M22-feast-hold', 'REG-r35-audit', 'REG-r37-satpenalty'];
const primary = primaryIds.every(id => (id === 'M8-exit-canon' && mFleeFights.length === 0) ? true : (verdicts.find(v => v.id === id) || {}).ok);
const allOk = verdicts.every(v => v.ok);
console.log('');
console.log('PRIMARY ' + (primary ? 'GO' : 'NO-GO') + ' | ALL ' + (allOk ? 'GO' : 'NO-GO'));
process.exit(allOk ? 0 : 1);
