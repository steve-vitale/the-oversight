#!/usr/bin/env node
// analyze-winsupport-20261019.js — arm-shift comparison for the sim-winsupport
// lever run (flesh-out loop, 2026-10-19, axis scale-onramp).
//
// Reads evidence/2026-10-19/perseed-winsupport/{control,winsupport}/{leadfeast,belongfeast}/s<seed>.json
// (validated before aggregating — the w5census 0-byte lesson) and compares
// the two arms on the PRE-REGISTERED read:
//   PRIMARY: per-run survival (median survival days) — GO: armed median +10d vs control.
//   GUARDRAILS: no new death modes; national/table reach not degraded;
//               wave-4/5 reach not degraded; survival -10d floor.
// The window-death taxonomy (attemptsOf/attribute/addressability) is
// imported from analyze-windowsurvive-20261019.js — identical by
// construction, so window definitions match the diagnostic numbers.
// The panel is the instrument (build-winsupport-panels.js); the evidence
// header's pre-registered threshold is the judge.
//
// Writes: evidence/2026-10-19/winsupport-corpus-summary.json and
//         evidence/2026-10-19/winsupport-arm-shift.md
// Usage: node scripts/analyze-winsupport-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const { attemptsOf, attribute, addressability, nameToWave } = require('./analyze-windowsurvive-20261019');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-winsupport');
const OUTD = path.join(__dirname, '..', 'evidence', '2026-10-19');
const ARMS = ['control', 'winsupport'];
const POLICIES = ['leadfeast', 'belongfeast'];
const SEEDS = [64001, 64002, 64003, 64004, 64005, 64006, 64007, 64008];

function loadValid() {
  const byArm = { control: [], winsupport: [] };
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

function main() {
  const { byArm, bad } = loadValid();
  const atts = {}, sums = {};
  for (const arm of ARMS) {
    atts[arm] = byArm[arm].map(attribute);
    sums[arm] = summarize(atts[arm]);
  }
  const C = sums.control, W = sums.winsupport;
  const dMed = W.survival.median - C.survival.median;
  // Guardrails.
  const newCauses = Object.keys(W.causeSpace).filter(c => !(c in C.causeSpace));
  const guards = {
    noNewDeathModes: { pass: newCauses.length === 0, detail: newCauses.length ? newCauses.join(',') : 'none' },
    nationalNotDegraded: { pass: W.wall.national >= C.wall.national, detail: `${W.wall.national} vs ${C.wall.national}` },
    tableNotDegraded: { pass: W.wall.table >= C.wall.table, detail: `${W.wall.table} vs ${C.wall.table}` },
    wave4NotDegraded: { pass: W.wall.wave4 >= C.wall.wave4, detail: `${W.wall.wave4} vs ${C.wall.wave4}` },
    wave5NotDegraded: { pass: W.wall.wave5 >= C.wall.wave5, detail: `${W.wall.wave5} vs ${C.wall.wave5}` },
    survivalFloor: { pass: dMed >= -10, detail: `delta ${dMed}d (floor -10d)` },
  };
  const goPrimary = dMed >= 10;
  const goAll = goPrimary && Object.values(guards).every(g => g.pass);
  const verdict = goAll ? 'GO' : (dMed >= -10 && Object.values(guards).every(g => g.pass) ? 'NO-GO (primary miss, guardrails hold)' : 'NO-GO (guardrail breach)');

  const summary = {
    arms: ARMS, seeds: SEEDS, policies: POLICIES, filesBad: bad,
    control: C, winsupport: W,
    primary: { metric: 'median survival days', control: C.survival.median, winsupport: W.survival.median, delta: dMed, goBar: '+10d', go: goPrimary },
    guardrails: guards,
    verdict,
  };

  let md = `# sim-winsupport — arm-shift comparison (control vs winsupport)\\n\\n`;
  md += `Runs: ${C.n} control + ${W.n} winsupport (8 seeds 64001–64008 x {leadfeast, belongfeast}, paired before/after on identical seeds), 180d death-aware, substrate w5path-vetrel1 + winsupport layer (armed only), VETREL=1, SEATDRIVE=0.\\n`;
  md += `Base: master 51e42cea9bfc99a08f99e6cd9fdc6de519d5eb7f (re-swept control — never compared against the windowsurvive corpus).\\n`;
  md += `Bad per-seed files: ${bad.length}${bad.length ? ' — ' + bad.join('; ') : ''}\\n\\n`;
  md += `## PRIMARY — median survival days\\n\\n`;
  md += `control: ${C.survival.median}d [${C.survival.days.join(', ')}]\\n\\n`;
  md += `winsupport: ${W.survival.median}d [${W.survival.days.join(', ')}]\\n\\n`;
  md += `delta: ${dMed >= 0 ? '+' : ''}${dMed}d — GO bar +10d: **${goPrimary ? 'GO' : 'NO-GO'}**\\n\\n`;
  md += `## Guardrails\\n\\n`;
  md += `| guardrail | result | detail |\\n|---|---|---|\\n`;
  for (const [k, g] of Object.entries(guards)) md += `| ${k} | ${g.pass ? 'PASS' : 'FAIL'} | ${g.detail} |\\n`;
  md += `\\n## Wall numbers\\n\\n`;
  md += `| arm | national | table | wins | wave-4 | wave-5 | exiled | median survival |\\n|---|---|---|---|---|---|---|---|\\n`;
  for (const [arm, s] of [['control', C], ['winsupport', W]]) {
    md += `| ${arm} | ${s.wall.national}/${s.n} | ${s.wall.table}/${s.n} | ${s.wall.wins}/${s.n} | ${s.wall.wave4}/${s.n} | ${s.wall.wave5}/${s.n} | ${s.wall.exiled}/${s.n} | ${s.survival.median}d |\\n`;
  }
  md += `\\n## Per-policy split\\n\\n`;
  md += `| arm | policy | n | median survival | national | table | wave-4 | def5 reached |\\n|---|---|---|---|---|---|---|---|\\n`;
  for (const [arm, s] of [['control', C], ['winsupport', W]]) {
    for (const p of s.perPolicy) md += `| ${arm} | ${p.policy} | ${p.n} | ${p.medianSurvival}d | ${p.national} | ${p.table} | ${p.wave4} | ${p.def5} |\\n`;
  }
  md += `\\n## The window (per arm)\\n\\n`;
  for (const [arm, s] of [['control', C], ['winsupport', W]]) {
    md += `**${arm}**: door-reaching ${s.door.reached}/${s.n}, died in window ${s.door.diedInWindow}, attempts ${s.door.attempts} ${JSON.stringify(s.door.outcomes)}; window deaths ${s.taxonomy.windowDeaths} (scholar ${s.taxonomy.who.scholar} / villager ${s.taxonomy.who.villager}); channels ${JSON.stringify(s.taxonomy.where)}; killer-wave ${JSON.stringify(s.taxonomy.what)}; addressable ${s.taxonomy.addressable}/${s.taxonomy.windowDeaths}.\\n\\n`;
  }
  md += `## Cause space (guardrail: no new death modes)\\n\\n`;
  md += `control: ${JSON.stringify(C.causeSpace)}\\n\\nwinsupport: ${JSON.stringify(W.causeSpace)}\\n\\nnew causes on armed: ${newCauses.length ? newCauses.join(', ') : 'none'}\\n\\n`;
  md += `## Verdict\\n\\n**${verdict}**\\n`;
  writeFileRetry(path.join(OUTD, 'winsupport-corpus-summary.json'), JSON.stringify(summary, null, 1));
  writeFileRetry(path.join(OUTD, 'winsupport-arm-shift.md'), md);
  console.log(`ARM SHIFT: control med=${C.survival.median}d winsupport med=${W.survival.median}d delta=${dMed >= 0 ? '+' : ''}${dMed}d -> ${verdict}`);
  console.log(`  wall C: nat=${C.wall.national} table=${C.wall.table} wins=${C.wall.wins} w4=${C.wall.wave4} w5=${C.wall.wave5}`);
  console.log(`  wall W: nat=${W.wall.national} table=${W.wall.table} wins=${W.wall.wins} w4=${W.wall.wave4} w5=${W.wall.wave5}`);
  console.log(`  window deaths C=${C.taxonomy.windowDeaths} W=${W.taxonomy.windowDeaths} (scholar ${C.taxonomy.who.scholar}->${W.taxonomy.who.scholar})`);
}

if (require.main === module) main();
module.exports = { loadValid, summarize, median };
