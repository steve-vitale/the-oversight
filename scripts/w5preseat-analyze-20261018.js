#!/usr/bin/env node
// w5preseat-analyze-20261018.js — binding-leg attribution for the wave-5
// door on the PRE-SEAT substrate (flesh-out loop arm sim-w5preseat,
// 2026-10-18).
//
// Attribution schema IDENTICAL to scripts/w5legs-analyze-20261018.js (the
// two censuses share a comparison frame): reads
// evidence/2026-10-18/perseed-w5preseat/<policy>/s<seed>.json and, per
// run, attributes WHICH leg of the wave-5 door binds (standing/armor/
// weapons/tricks/veterans), the day the bar could have cleared, the day
// the village died/won, and the gap. Prints the binding-leg ranking across
// the corpus + corpus summary. Writes the corpus summary JSON and the
// leg-attribution markdown table to evidence/2026-10-18/ (attached to the
// evidence file per the arm's §15 note: diagnostic, no balanced panel).
//
// Usage: node scripts/w5preseat-analyze-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-w5preseat');

const LEGS = ['standing', 'armor', 'weapons', 'tricks', 'veterans'];
const T5 = 200; // pinned by the proof script's bar-shape fixture (standingCfg t5).

function legSat(rec, leg) {
  try {
    switch (leg) {
      case 'standing': return (rec.cap | 0) >= T5;
      case 'armor': return rec.dem && (rec.arm | 0) >= (rec.dem.arm | 0);
      case 'weapons': return rec.dem && (rec.wpn | 0) >= (rec.dem.wpn | 0);
      case 'tricks': return rec.dem && (rec.trk | 0) >= (rec.dem.trk | 0);
      case 'veterans': return rec.dem && (rec.vet | 0) >= (rec.dem.vet | 0);
    }
  } catch (e) {}
  return false;
}
function legVal(rec, leg) {
  switch (leg) {
    case 'standing': return rec.cap | 0;
    case 'armor': return rec.arm | 0;
    case 'weapons': return rec.wpn | 0;
    case 'tricks': return rec.trk | 0;
    case 'veterans': return rec.vet | 0;
  }
  return -1;
}
function legDem(rec, leg) {
  if (leg === 'standing') return T5;
  if (!rec.dem) return null;
  return { armor: rec.dem.arm | 0, weapons: rec.dem.wpn | 0, tricks: rec.dem.trk | 0, veterans: rec.dem.vet | 0 }[leg];
}

function attribute(out) {
  const legs = (out.legs || []).slice().sort((a, b) => a.d - b.d);
  const firstSat = {};
  for (const leg of LEGS) {
    const hit = legs.find(r => legSat(r, leg));
    firstSat[leg] = hit ? hit.d : null;
  }
  const inPlay = legs.filter(r => (r.uw | 0) >= 4 && r.alive);
  const scope = inPlay.length ? inPlay : legs.filter(r => r.alive);
  const shortDays = {};
  for (const leg of LEGS) shortDays[leg] = scope.filter(r => !legSat(r, leg)).length;
  const endDay = out.gameDays | 0;
  const endKind = out.won ? 'won' : String(out.endReason || 'unknown');
  const attr = {
    seed: out.seed, policyId: out.policyId,
    endDay, endKind, wave5Day: out.wave5Day, wave4Day: out.wave4Day,
    maxWave: out.maxWave, national: out.national, table: out.table, won: out.won,
    firstSat, inPlayDays: inPlay.length, scopeDays: scope.length,
  };
  if (out.wave5Day != null) {
    // The binding leg is the one that cleared LAST.
    const sat = LEGS.filter(l => firstSat[l] != null);
    const last = Math.max(...sat.map(l => firstSat[l]));
    const binding = sat.filter(l => firstSat[l] === last);
    attr.unlocked = true;
    attr.bindingSet = binding;
    attr.bindingLeg = binding[0];
    attr.couldClearDay = out.wave5Day;
    attr.gap = endDay - out.wave5Day;
    attr.other4FirstJointDay = null;
  } else {
    attr.unlocked = false;
    const maxShort = Math.max(...LEGS.map(l => shortDays[l]));
    const binding = LEGS.filter(l => shortDays[l] === maxShort);
    attr.bindingSet = binding;
    attr.bindingLeg = binding[0];
    attr.shortDays = shortDays;
    // terminal shortfall from the run-end leg vector
    const end = out.endLegs || legs[legs.length - 1] || {};
    attr.terminalShortfall = {};
    for (const leg of LEGS) {
      const dem = legDem(end, leg);
      attr.terminalShortfall[leg] = dem == null ? null : dem - legVal(end, leg);
    }
    attr.couldClearDay = 'never';
    // first day the OTHER 4 legs were jointly satisfied (the day the
    // binding leg started keeping the door shut alone)
    const others = LEGS.filter(l => l !== attr.bindingLeg);
    const joint = legs.find(r => others.every(l => legSat(r, l)));
    attr.other4FirstJointDay = joint ? joint.d : null;
    attr.gap = joint ? endDay - joint.d : null;
    attr.neverInPlay = inPlay.length === 0;
  }
  // attribution completeness (the DIAG-GO machinery)
  attr.complete = !!(attr.bindingLeg && endDay != null && endKind &&
    (attr.unlocked ? attr.couldClearDay != null && attr.gap != null
      : attr.other4FirstJointDay !== undefined && attr.gap !== undefined));
  return attr;
}

function main() {
  const files = [];
  for (const policy of ['belongfeast', 'leadfeast']) {
    const dir = path.join(EVID, policy);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f))) {
      files.push(path.join(dir, f));
    }
  }
  if (!files.length) { console.error('ANALYZE STOP: no per-seed files in ' + EVID); process.exit(2); }
  const runs = files.map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
  runs.sort((a, b) => (a.policyId < b.policyId ? -1 : a.policyId > b.policyId ? 1 : a.seed - b.seed));
  const attrs = runs.map(attribute);

  // binding-leg ranking: primary-leg counts + binding-set membership
  const primary = {}, inset = {};
  for (const l of LEGS) { primary[l] = 0; inset[l] = 0; }
  for (const a of attrs) { primary[a.bindingLeg] = (primary[a.bindingLeg] | 0) + 1; for (const l of a.bindingSet) inset[l] = (inset[l] | 0) + 1; }
  const ranked = LEGS.slice().sort((a, b) => primary[b] - primary[a]);

  const n = runs.length;
  const c = (f) => runs.filter(f).length;
  const surv = runs.map(r => r.gameDays | 0).sort((a, b) => a - b);
  const median = surv.length ? surv[Math.floor(surv.length / 2)] : 0;
  const complete = attrs.filter(a => a.complete).length;

  console.log(`\n=== sim-w5preseat attribution (${n} runs) ===`);
  console.log(`DIAG-GO: attribution ${complete}/${n} (bar >=${Math.ceil(n * 0.95)}) -> ${complete >= Math.ceil(n * 0.95) ? 'GO' : 'NO-GO'}`);
  console.log(`\nBinding-leg ranking (primary):`);
  for (const l of ranked) console.log(`  ${l.padEnd(9)} primary=${primary[l]}  in-binding-set=${inset[l]}`);
  console.log(`\nPer-run attribution:`);
  console.log(`  policy/seed        end        w4d  w5d  binding      firstSat(S/A/W/T/V)            other4joint  gap`);
  for (const a of attrs) {
    const fs5 = LEGS.map(l => a.firstSat[l] == null ? '—' : a.firstSat[l]).join('/');
    const end = `${a.endKind}:${a.endDay}`;
    console.log(`  ${(a.policyId + '-s' + a.seed).padEnd(18)} ${end.padEnd(10)} ${(a.wave4Day == null ? '—' : 'd' + a.wave4Day).padEnd(4)} ${(a.wave5Day == null ? '—' : 'd' + a.wave5Day).padEnd(4)} ${a.bindingLeg.padEnd(12)} ${fs5.padEnd(30)} ${(a.other4FirstJointDay == null ? '—' : 'd' + a.other4FirstJointDay).padEnd(6)} ${a.gap == null ? '—' : a.gap + 'd'}`);
  }
  console.log(`\nCorpus: national=${c(r => r.national)} table=${c(r => r.table)} wins=${c(r => r.won)} wave4=${c(r => r.wave45)} wave5=${c(r => r.wave5)} medianSurv=${median}d`);
  const w5 = runs.filter(r => r.wave5);
  console.log(`wave5Days: ${w5.map(r => `${r.policyId}-s${r.seed}=d${r.wave5Day}`).join(' ')}`);
  // closest-to-door: unlocked first, then never-unlocked by terminal
  // shortfall of the primary binding leg (ascending)
  const close = attrs.slice().sort((a, b) => {
    if (!!a.unlocked !== !!b.unlocked) return a.unlocked ? -1 : 1;
    if (a.unlocked) return a.wave5Day - b.wave5Day;
    const sa = a.terminalShortfall[a.bindingLeg], sb = b.terminalShortfall[b.bindingLeg];
    return (sa == null ? 1e9 : sa) - (sb == null ? 1e9 : sb);
  });
  console.log(`\nClosest to the door:`);
  for (const a of close.slice(0, 5)) {
    console.log(`  ${a.policyId}-s${a.seed}: ${a.unlocked ? 'UNLOCKED d' + a.wave5Day : 'blocked by ' + a.bindingLeg + ' (shortfall ' + a.terminalShortfall[a.bindingLeg] + ', short ' + a.shortDays[a.bindingLeg] + '/' + a.scopeDays + 'd, other4joint ' + (a.other4FirstJointDay == null ? '—' : 'd' + a.other4FirstJointDay) + ')'} end ${a.endKind}:${a.endDay}`);
  }

  // missed-window stats per leg (never-unlocked runs where other4 jointly sat)
  console.log(`\nMissed windows (never-unlocked; days the village held the other 4 while the binding leg kept the door shut):`);
  for (const l of LEGS) {
    const gaps = attrs.filter(a => !a.unlocked && a.bindingLeg === l && a.gap != null).map(a => a.gap);
    if (!gaps.length) { console.log(`  ${l.padEnd(9)} n=0`); continue; }
    gaps.sort((a, b) => a - b);
    const med = gaps[Math.floor(gaps.length / 2)];
    console.log(`  ${l.padEnd(9)} n=${gaps.length} median=${med}d range=${gaps[0]}-${gaps[gaps.length - 1]}d`);
  }

  const summary = {
    runs: n, diagGo: { attributed: complete, bar: Math.ceil(n * 0.95), met: complete >= Math.ceil(n * 0.95) },
    ranking: { primary, inBindingSet: inset, order: ranked },
    corpus: { national: c(r => r.national), table: c(r => r.table), wins: c(r => r.won), wave4: c(r => r.wave45), wave5: c(r => r.wave5), medianSurvival: median },
    attributions: attrs,
  };
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-18');
  fs.writeFileSync(path.join(dir, 'w5preseat-corpus-summary.json'), JSON.stringify(summary, null, 1));
  let md = `# sim-w5preseat — leg-attribution table (2026-10-18)\n\nDIAG-GO: ${complete}/${n} attributed (bar ${Math.ceil(n * 0.95)}) — ${summary.diagGo.met ? 'GO' : 'NO-GO'}.\n\n## Binding-leg ranking\n\n| leg | primary | in binding set |\n|---|---|---|\n`;
  for (const l of ranked) md += `| ${l} | ${primary[l]} | ${inset[l]} |\n`;
  md += `\n## Per-run attribution\n\n| run | end | w4 day | w5 day | binding leg | binding set | firstSat S/A/W/T/V | other4 joint | gap |\n|---|---|---|---|---|---|---|---|---|\n`;
  for (const a of attrs) {
    md += `| ${a.policyId}-s${a.seed} | ${a.endKind}:${a.endDay} | ${a.wave4Day == null ? '—' : 'd' + a.wave4Day} | ${a.wave5Day == null ? '—' : 'd' + a.wave5Day} | ${a.bindingLeg} | ${a.bindingSet.join('+')} | ${LEGS.map(l => a.firstSat[l] == null ? '—' : 'd' + a.firstSat[l]).join(' / ')} | ${a.other4FirstJointDay == null ? '—' : 'd' + a.other4FirstJointDay} | ${a.gap == null ? '—' : a.gap + 'd'} |\n`;
  }
  md += `\n## Corpus\n\nnational=${summary.corpus.national} table=${summary.corpus.table} wins=${summary.corpus.wins} wave4=${summary.corpus.wave4} wave5=${summary.corpus.wave5} medianSurvival=${summary.corpus.medianSurvival}d\n`;
  fs.writeFileSync(path.join(dir, 'w5preseat-leg-attribution.md'), md);
  console.log(`\nwrote evidence/2026-10-18/w5preseat-corpus-summary.json + w5preseat-leg-attribution.md`);
}

if (require.main === module) main();
module.exports = { attribute, legSat, legVal, legDem, LEGS, T5 };
