#!/usr/bin/env node
// analyze-winsupportdecomp-20261019.js — 5-arm shift comparison for the
// sim-winsupport-decomp run (flesh-out loop, 2026-10-19, axis scale-onramp).
// FORK of analyze-winsupport-20261019.js: the same summarize() machinery
// and the same window taxonomy (identical by construction), generalized to
// 5 arms with the DECOMP pre-registered bars (per armed variant: PRIMARY
// median survival +10d vs control; GUARDRAILS: table >= control-2, no new
// death modes, survival floor -10d, national/wave-4 not degraded).
// The original is untouched.
//
// Reads evidence/2026-10-19/perseed-winsupportdecomp/{control,winsupport-full,winsupport-triage,winsupport-posture,winsupport-gated}/{leadfeast,belongfeast}/s<seed>.json
// (validated before aggregating — the w5census 0-byte lesson) and compares
// each armed variant against the re-swept control on the PRE-REGISTERED read:
//   PRIMARY: per-run survival (median survival days) — GO: armed median +10d vs control.
//   GUARDRAILS: no new death modes; national/table reach not degraded;
//               wave-4/5 reach not degraded; survival -10d floor.
// The window-death taxonomy (attemptsOf/attribute/addressability) is
// imported from analyze-windowsurvive-20261019.js — identical by
// construction, so window definitions match the diagnostic numbers.
// The panel is the instrument (build-winsupport-panels.js); the evidence
// header's pre-registered threshold is the judge.
//
// Writes: evidence/2026-10-19/winsupportdecomp-corpus-summary.json and
//         evidence/2026-10-19/winsupportdecomp-arm-shift.md
// Usage: node scripts/analyze-winsupportdecomp-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const { attemptsOf, attribute, addressability, nameToWave } = require('./analyze-windowsurvive-20261019');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-winsupportdecomp');
const OUTD = path.join(__dirname, '..', 'evidence', '2026-10-19');
const ARMS = ['control', 'winsupport-full', 'winsupport-triage', 'winsupport-posture', 'winsupport-gated'];
const ARMED = ARMS.slice(1);
const POLICIES = ['leadfeast', 'belongfeast'];
const SEEDS = [65001, 65002, 65003, 65004, 65005, 65006, 65007, 65008, 65009, 65010, 65011, 65012, 65013, 65014, 65015, 65016];

function loadValid() {
  const byArm = {}; for (const arm of ARMS) byArm[arm] = [];
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
    },
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

function verdictFor(C, A) {
  // Per-variant verdict against the DECOMP pre-registered bars:
  // PRIMARY: median survival +10d armed vs control.
  // GUARDRAILS: table >= control-2; no new death modes; survival floor -10d;
  // national not degraded; wave-4 not degraded.
  const dMed = A.survival.median - C.survival.median;
  const newCauses = Object.keys(A.causeSpace).filter(c => !(c in C.causeSpace));
  const guards = {
    noNewDeathModes: { pass: newCauses.length === 0, detail: newCauses.length ? newCauses.join(',') : 'none' },
    nationalNotDegraded: { pass: A.wall.national >= C.wall.national, detail: `${A.wall.national} vs ${C.wall.national}` },
    tableBand: { pass: A.wall.table >= C.wall.table - 2, detail: `${A.wall.table} vs ${C.wall.table} (band >= control-2)` },
    wave4NotDegraded: { pass: A.wall.wave4 >= C.wall.wave4, detail: `${A.wall.wave4} vs ${C.wall.wave4}` },
    survivalFloor: { pass: dMed >= -10, detail: `delta ${dMed}d (floor -10d)` },
  };
  const goPrimary = dMed >= 10;
  const goAll = goPrimary && Object.values(guards).every(g => g.pass);
  const verdict = goAll ? 'GO (lands)'
    : (dMed >= -10 && Object.values(guards).every(g => g.pass) ? 'NO-GO (primary miss, guardrails hold — killed)'
    : 'NO-GO (guardrail breach — killed)');
  return { dMed, newCauses, guards, goPrimary, verdict };
}

function main() {
  const { byArm, bad } = loadValid();
  const atts = {}, sums = {}, verdicts = {};
  for (const arm of ARMS) {
    atts[arm] = byArm[arm].map(attribute);
    sums[arm] = summarize(atts[arm]);
  }
  const C = sums.control;
  for (const arm of ARMED) verdicts[arm] = verdictFor(C, sums[arm]);

  const summary = {
    arms: ARMS, seeds: SEEDS, policies: POLICIES, filesBad: bad,
    perArm: Object.fromEntries(ARMS.map(a => [a, sums[a]])),
    verdicts: Object.fromEntries(ARMED.map(a => [a, {
      primary: { metric: 'median survival days', control: C.survival.median, armed: sums[a].survival.median, delta: verdicts[a].dMed, goBar: '+10d', go: verdicts[a].goPrimary },
      guardrails: verdicts[a].guards, verdict: verdicts[a].verdict,
    }])),
  };

  let md = `# sim-winsupport-decomp — 5-arm shift comparison\n\n`;
  md += `Runs: ${C.n}/arm x 5 arms = ${C.n * ARMS.length} (16 seeds 65001–65016 x {leadfeast, belongfeast}, paired on identical seeds), 180d death-aware, substrate w5path-vetrel1 + arm layer (armed only), VETREL=1, SEATDRIVE=0.\n`;
  md += `Base: current master (re-swept control — never compared against the parked corpus).\n`;
  md += `Pre-registered bars per armed variant: PRIMARY median survival +10d vs control; GUARDRAILS table >= control-2, no new death modes, survival floor -10d, national/wave-4 not degraded.\n`;
  md += `Bad per-seed files: ${bad.length}${bad.length ? ' — ' + bad.join('; ') : ''}\n\n`;
  md += `## Per-variant verdicts\n\n`;
  md += `| variant | control med | armed med | delta | primary +10d | guardrails | verdict |\n|---|---|---|---|---|---|---|\n`;
  for (const arm of ARMED) {
    const v = verdicts[arm], A = sums[arm];
    const gtxt = Object.entries(v.guards).map(([k, g]) => `${k}:${g.pass ? 'PASS' : 'FAIL'}`).join(' ');
    md += `| ${arm} | ${C.survival.median}d | ${A.survival.median}d | ${v.dMed >= 0 ? '+' : ''}${v.dMed}d | ${v.goPrimary ? 'GO' : 'NO-GO'} | ${gtxt} | **${v.verdict}** |\n`;
  }
  md += `\n## Wall numbers\n\n`;
  md += `| arm | national | table | wins | wave-4 | wave-5 | exiled | median survival |\n|---|---|---|---|---|---|---|---|\n`;
  for (const arm of ARMS) {
    const sm = sums[arm];
    md += `| ${arm} | ${sm.wall.national}/${sm.n} | ${sm.wall.table}/${sm.n} | ${sm.wall.wins}/${sm.n} | ${sm.wall.wave4}/${sm.n} | ${sm.wall.wave5}/${sm.n} | ${sm.wall.exiled}/${sm.n} | ${sm.survival.median}d |\n`;
  }
  md += `\n## Survival distributions\n\n`;
  for (const arm of ARMS) md += `**${arm}**: ${sums[arm].survival.median}d [${sums[arm].survival.days.join(', ')}]\n\n`;
  md += `## Per-policy split\n\n`;
  md += `| arm | policy | n | median survival | national | table | wave-4 | def5 reached |\n|---|---|---|---|---|---|---|---|\n`;
  for (const arm of ARMS) {
    for (const pp of sums[arm].perPolicy) md += `| ${arm} | ${pp.policy} | ${pp.n} | ${pp.medianSurvival}d | ${pp.national} | ${pp.table} | ${pp.wave4} | ${pp.def5} |\n`;
  }
  md += `\n## The window (per arm)\n\n`;
  for (const arm of ARMS) {
    const sm = sums[arm];
    md += `**${arm}**: door-reaching ${sm.door.reached}/${sm.n}, died in window ${sm.door.diedInWindow}, attempts ${sm.door.attempts} ${JSON.stringify(sm.door.outcomes)}; window deaths ${sm.taxonomy.windowDeaths} (scholar ${sm.taxonomy.who.scholar} / villager ${sm.taxonomy.who.villager}); channels ${JSON.stringify(sm.taxonomy.where)}; killer-wave ${JSON.stringify(sm.taxonomy.what)}; addressable ${sm.taxonomy.addressable}/${sm.taxonomy.windowDeaths}.\n\n`;
  }
  md += `## Cause space (guardrail: no new death modes)\n\n`;
  md += `control: ${JSON.stringify(C.causeSpace)}\n\n`;
  for (const arm of ARMED) {
    const v = verdicts[arm];
    md += `${arm}: ${JSON.stringify(sums[arm].causeSpace)}\n\nnew causes vs control: ${v.newCauses.length ? v.newCauses.join(', ') : 'none'}\n\n`;
  }
  writeFileRetry(path.join(OUTD, 'winsupportdecomp-corpus-summary.json'), JSON.stringify(summary, null, 1));
  writeFileRetry(path.join(OUTD, 'winsupportdecomp-arm-shift.md'), md);
  for (const arm of ARMED) {
    const v = verdicts[arm];
    console.log(`ARM SHIFT [${arm}]: control med=${C.survival.median}d armed med=${sums[arm].survival.median}d delta=${v.dMed >= 0 ? '+' : ''}${v.dMed}d -> ${v.verdict}`);
  }
}

if (require.main === module) main();
module.exports = { loadValid, summarize, median, verdictFor };
