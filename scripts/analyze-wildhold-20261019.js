#!/usr/bin/env node
// analyze-wildhold-20261019.js — arm-shift comparison for the sim-wildhold
// lever run (flesh-out loop, 2026-10-19, axis scale-onramp).
//
// Reads evidence/2026-10-19/perseed-wildhold/{control,wildhold}/{leadfeast,belongfeast}/s<seed>.json
// (validated before aggregating — the w5census 0-byte lesson) and compares
// the two arms on the PRE-REGISTERED read:
//   PRIMARY: wild-channel deaths per run — GO: >=30% fewer on the armed arm.
//   GUARDRAILS: starvation deaths <= control+1; wave-4 unlocks within +/-2/16
//               of control; median survival no worse than -10d; no new death mode.
// The window-death taxonomy (attemptsOf/attribute/addressability) is
// imported from analyze-windowsurvive-20261019.js — identical by
// construction, so window definitions match the diagnostic numbers.
// The panel is the instrument (build-wildhold-panels.js); the evidence
// header's pre-registered threshold is the judge.
//
// Writes: evidence/2026-10-19/wildhold-corpus-summary.json and
//         evidence/2026-10-19/wildhold-arm-shift.md
// Usage: node scripts/analyze-wildhold-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const { attemptsOf, attribute, addressability, nameToWave } = require('./analyze-windowsurvive-20261019');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-wildhold');
const OUTD = path.join(__dirname, '..', 'evidence', '2026-10-19');
const ARMS = ['control', 'wildhold'];
const POLICIES = ['leadfeast', 'belongfeast'];
const SEEDS = [63801, 63802, 63803, 63804, 63805, 63806, 63807, 63808, 63809, 63810, 63811, 63812];
const BASE_TAG = (() => { try { return require('child_process').execSync('git rev-parse --short=12 HEAD', { cwd: __dirname }).toString().trim(); } catch (e) { return 'unknown'; } })();

function loadValid() {
  const byArm = { control: [], wildhold: [] };
  const bad = [];
  for (const arm of ARMS) {
    for (const policyId of POLICIES) {
      for (const seed of SEEDS) {
        const p = path.join(EVID, arm, policyId, `s${seed}.json`);
        if (!fs.existsSync(p)) { bad.push(`${arm}/${policyId}/s${seed}.json: MISSING`); continue; }
        const stat = fs.statSync(p);
        if (stat.size === 0) { bad.push(`${arm}/${policyId}/s${seed}.json: 0 BYTES`); continue; }
        let rec;
        try { rec = JSON.parse(fs.readFileSync(p, 'utf8')); }
        catch (e) { bad.push(`${arm}/${policyId}/s${seed}.json: UNPARSEABLE (${e.message})`); continue; }
        if (!rec || !Array.isArray(rec.recs) || !rec.deathsAttributed) {
          bad.push(`${arm}/${policyId}/s${seed}.json: INCOMPLETE`); continue;
        }
        if (rec.winarm !== arm) { bad.push(`${arm}/${policyId}/s${seed}.json: ARM TAG MISMATCH (${rec.winarm})`); continue; }
        if ((rec.instrumentErrors | 0) !== 0) bad.push(`${arm}/${policyId}/s${seed}.json: NOTE instrumentErrors=${rec.instrumentErrors}`);
        byArm[arm].push(rec);
      }
    }
  }
  return { byArm, bad };
}

function median(xs) {
  const q = xs.slice().sort((a, b) => a - b);
  return q.length ? q[Math.floor(q.length / 2)] : -1;
}

function summarize(atts) {
  const agg = (f) => atts.filter(f).length;
  const wd = [];
  for (const a of atts) for (const d of a.windowDeaths) wd.push(Object.assign({ seed: a.seed, policy: a.policyId }, d));
  const byWho = { scholar: wd.filter(d => d.player).length, villager: wd.filter(d => !d.player).length };
  const byChannel = {};
  for (const d of wd) byChannel[d.channel] = (byChannel[d.channel] || 0) + 1;
  const byWave = { w4: 0, w3: 0, w12: 0, null: 0 };
  for (const d of wd) {
    const w = d.killerWave != null ? d.killerWave : d.wave;
    if (w === 4) byWave.w4++;
    else if (w === 3) byWave.w3++;
    else if (w != null && w <= 2) byWave.w12++;
    else byWave.null++;
  }
  const addr = wd.map(d => addressability(d));
  const causeUnion = {};
  for (const a of atts) for (const [c, k] of Object.entries(a.causeSpace)) causeUnion[c] = (causeUnion[c] || 0) + k;
  const outcomes = {};
  for (const a of atts) for (const w of a.attempts) outcomes[w.outcome] = (outcomes[w.outcome] || 0) + 1;
  return {
    n: atts.length,
    survival: { median: median(atts.map(a => a.endDay)), days: atts.map(a => a.endDay).sort((x, y) => x - y) },
    wall: {
      national: agg(a => a.national), table: agg(a => a.table), wins: agg(a => a.won),
      wave4: agg(a => a.maxWave >= 4), wave5: agg(a => a.wave5Day != null),
      exiled: agg(a => a.exiled),
    },
    door: { reached: agg(a => a.def5ever), diedInWindow: agg(a => a.diedInWindow), attempts: atts.reduce((x, a) => x + a.attempts.length, 0), outcomes },
    taxonomy: {
      windowDeaths: wd.length, who: byWho, where: byChannel, what: byWave,
      addressable: addr.filter(x => x.addressable).length,
      wildDeaths: byChannel.wild || 0,
      wildDeathsPerRun: atts.map(a => a.windowDeaths.filter(d => d.channel === 'wild').length),
    },
    starvationDeaths: (causeUnion.starvation || 0),
    causeSpace: causeUnion,
    perPolicy: POLICIES.map(p => {
      const ps = atts.filter(a => a.policyId === p);
      return { policy: p, n: ps.length, medianSurvival: median(ps.map(a => a.endDay)), national: ps.filter(a => a.national).length, table: ps.filter(a => a.table).length, wave4: ps.filter(a => a.maxWave >= 4).length, def5: ps.filter(a => a.def5ever).length };
    }),
  };
}

function writeFileRetry(fp, data) {
  // Host EPERM flaps hit node writeFileSync intermittently (the w5census
  // 0-byte lesson; 2026-10-18/19 incidents). Transient I/O: retry.
  let last = null;
  for (let i = 0; i < 8; i++) {
    try { fs.writeFileSync(fp, data); return true; }
    catch (e) { last = e; if (e && e.code === 'EPERM') { const t = Date.now() + 45000; while (Date.now() < t); continue; } throw e; }
  }
  throw last;
}

function main() {
  const { byArm, bad } = loadValid();
  const atts = {}, sums = {};
  for (const arm of ARMS) {
    atts[arm] = byArm[arm].map(attribute);
    sums[arm] = summarize(atts[arm]);
  }
  const C = sums.control, W = sums.wildhold;
  const dMed = W.survival.median - C.survival.median;
  // PRIMARY (pre-registered): wild-channel deaths per run — GO bar >=30% fewer on armed.
  const wildC = C.taxonomy.wildDeaths, wildW = W.taxonomy.wildDeaths;
  const wildReduction = wildC > 0 ? (wildC - wildW) / wildC : 0;
  const goPrimary = wildC > 0 && wildReduction >= 0.30;
  // Guardrails (pre-registered).
  const newCauses = Object.keys(W.causeSpace).filter(c => !(c in C.causeSpace));
  const wave4Delta = W.wall.wave4 - C.wall.wave4;
  const guards = {
    starvationBound: { pass: W.starvationDeaths <= C.starvationDeaths + 1, detail: `${W.starvationDeaths} vs control ${C.starvationDeaths} (+1 allowed)` },
    wave4Band: { pass: Math.abs(wave4Delta) <= 2, detail: `${W.wall.wave4} vs control ${C.wall.wave4} (delta ${wave4Delta >= 0 ? '+' : ''}${wave4Delta}, band +/-2)` },
    survivalFloor: { pass: dMed >= -10, detail: `delta ${dMed >= 0 ? '+' : ''}${dMed}d (floor -10d)` },
    noNewDeathModes: { pass: newCauses.length === 0, detail: newCauses.length ? newCauses.join(',') : 'none' },
  };
  const goAll = goPrimary && Object.values(guards).every(g => g.pass);
  const verdict = goAll ? 'GO' : (!goPrimary && Object.values(guards).every(g => g.pass) ? 'NO-GO (primary miss, guardrails hold)' : 'NO-GO (guardrail breach)');

  const summary = {
    arms: ARMS, seeds: SEEDS, policies: POLICIES, filesBad: bad,
    control: C, wildhold: W,
    primary: { metric: 'wild-channel deaths (window)', control: wildC, wildhold: wildW, reduction: wildReduction, goBar: '>=30% fewer', go: goPrimary,
               perRunControl: C.taxonomy.wildDeathsPerRun, perRunWildhold: W.taxonomy.wildDeathsPerRun },
    guardrails: guards,
    verdict,
  };

  let md = `# sim-wildhold \u2014 arm-shift comparison (control vs wildhold)

`;
  md += `Runs: ${C.n} control + ${W.n} wildhold (8 seeds 63801\u201363808 x {leadfeast, belongfeast}, paired before/after on identical seeds), 180d death-aware, substrate w5path-vetrel1 + wildhold layer (armed only), VETREL=1, SEATDRIVE=0.
`;
  md += `Base: master ${BASE_TAG} (re-swept control \u2014 never compared against the windowsurvive corpus).
`;
  md += `Bad per-seed files: ${bad.length}${bad.length ? ' \u2014 ' + bad.join('; ') : ''}
`;
  md += `## PRIMARY \u2014 wild-channel deaths in the window

`;
  md += `control: ${wildC} [per-run: ${C.taxonomy.wildDeathsPerRun.join(', ')}]

`;
  md += `wildhold: ${wildW} [per-run: ${W.taxonomy.wildDeathsPerRun.join(', ')}]

`;
  md += `reduction: ${(wildReduction * 100).toFixed(1)}% \u2014 GO bar >=30% fewer: **${goPrimary ? 'GO' : 'NO-GO'}**

`;
  md += `## Guardrails

`;
  md += `| guardrail | result | detail |
|---|---|---|
`;
  for (const [k, g] of Object.entries(guards)) md += `| ${k} | ${g.pass ? 'PASS' : 'FAIL'} | ${g.detail} |
`;
  md += `
## Wall numbers

`;
  md += `| arm | national | table | wins | wave-4 | wave-5 | exiled | median survival |
|---|---|---|---|---|---|---|---|
`;
  for (const [arm, s] of [['control', C], ['wildhold', W]]) {
    md += `| ${arm} | ${s.wall.national}/${s.n} | ${s.wall.table}/${s.n} | ${s.wall.wins}/${s.n} | ${s.wall.wave4}/${s.n} | ${s.wall.wave5}/${s.n} | ${s.wall.exiled}/${s.n} | ${s.survival.median}d |
`;
  }
  md += `
## Per-policy split

`;
  md += `| arm | policy | n | median survival | national | table | wave-4 | def5 reached |
|---|---|---|---|---|---|---|---|
`;
  for (const [arm, s] of [['control', C], ['wildhold', W]]) {
    for (const p of s.perPolicy) md += `| ${arm} | ${p.policy} | ${p.n} | ${p.medianSurvival}d | ${p.national} | ${p.table} | ${p.wave4} | ${p.def5} |
`;
  }
  md += `
## The window (per arm)

`;
  for (const [arm, s] of [['control', C], ['wildhold', W]]) {
    md += `**${arm}**: door-reaching ${s.door.reached}/${s.n}, died in window ${s.door.diedInWindow}, attempts ${s.door.attempts} ${JSON.stringify(s.door.outcomes)}; window deaths ${s.taxonomy.windowDeaths} (scholar ${s.taxonomy.who.scholar} / villager ${s.taxonomy.who.villager}); channels ${JSON.stringify(s.taxonomy.where)}; wild-channel ${s.taxonomy.wildDeaths}; killer-wave ${JSON.stringify(s.taxonomy.what)}.

`;
  }
  // Lever-fidelity: did the wildhold mechanisms actually fire on the armed arm?
  const whRuns = byArm.wildhold.filter(r => r.wh);
  if (whRuns.length) {
    const sum = (k) => whRuns.reduce((x, r) => x + ((r.wh || {})[k] | 0), 0);
    md += `## Lever fidelity (armed arm)

`;
    md += `runs with any wildhold counter > 0: ${whRuns.length}/${byArm.wildhold.length}; hold-days ${sum('holdDays')}, scholar recalls ${sum('scholarRecalls')}, villager recalls ${sum('villagerRecalls')}, hunts stood down ${sum('huntsStood')}, window beats ${sum('beats')}.

`;
  } else {
    md += `## Lever fidelity (armed arm)

`;
    md += `NO wildhold counters fired on any armed run — the layer never engaged (windows never opened or the gate is broken).

`;
  }
  md += `## Cause space (guardrail: no new death modes)

`;
  md += `control: ${JSON.stringify(C.causeSpace)}

wildhold: ${JSON.stringify(W.causeSpace)}

new causes on armed: ${newCauses.length ? newCauses.join(', ') : 'none'}

`;
  md += `## Verdict

**${verdict}**
`;
  writeFileRetry(path.join(OUTD, 'wildhold-corpus-summary.json'), JSON.stringify(summary, null, 1));
  writeFileRetry(path.join(OUTD, 'wildhold-arm-shift.md'), md);
  console.log(`ARM SHIFT: control wild=${wildC} wildhold wild=${wildW} reduction=${(wildReduction * 100).toFixed(1)}% -> ${verdict}`);
  console.log(`  wall C: nat=${C.wall.national} table=${C.wall.table} wins=${C.wall.wins} w4=${C.wall.wave4} w5=${C.wall.wave5} med=${C.survival.median}d`);
  console.log(`  wall W: nat=${W.wall.national} table=${W.wall.table} wins=${W.wall.wins} w4=${W.wall.wave4} w5=${W.wall.wave5} med=${W.survival.median}d`);
  console.log(`  window deaths C=${C.taxonomy.windowDeaths} W=${W.taxonomy.windowDeaths} (scholar ${C.taxonomy.who.scholar}->${W.taxonomy.who.scholar}, villager ${C.taxonomy.who.villager}->${W.taxonomy.who.villager})`);
}

if (require.main === module) main();
module.exports = { loadValid, summarize, median };
