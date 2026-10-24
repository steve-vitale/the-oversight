#!/usr/bin/env node
// test-sim-leanlink-cap5.js — proof test for arm sim-leanlink-cap5 (flesh-out loop,
// axis scale-onramp). READ-ONLY (stdout only, exit non-zero on failure): asserts on the
// committed pilot corpora in evidence/2026-10-24/perseed-leanlinkcap5/ plus the
// pairing/delta source proof. Run AFTER the pilot sweep completes.
// T1: pairing/delta source proof — competent.daily contains NO scale verbs; the
//   leanlinkcap5 delta vs LINKFORM=2 is EXACTLY the missing tend verb (no tendLink,
//   no ctx.tended anywhere in the policy file); cap stays 5; proposeFrom 25, perDay 1,
//   7-day cooldown, tribute 4000, pantry gates 12000/25000; env gate default-OFF.
// T2: corpus completeness — 16 pilot files, seeds exactly 73501-73508 x
//   {control, armed}, single anchor, daysRequested 180, zero errors.
// T3: recomputation — the pre-registered primary + guardrails recomputed from the
//   corpora; tends MUST be 0 on every armed row (the arm's defining zero).
// T4: no coupling / no game-code trace — leanlinkcap5 requires only competent (never
//   linkform/leadcourt); no tracked src/js, competent.js, linkform.js or leadcourt.js
//   file is modified in the worktree.
// Usage: node scripts/test-sim-leanlink-cap5.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-24', 'perseed-leanlinkcap5');
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail != null ? ' — ' + detail : ''));
  if (!cond) failures++;
}
const load = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };

// T1a: competent has no scale verbs.
const compSrc = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8');
for (const verb of ['Game.proposeLink', 'Game.tendLink', 'Game.answerCounter', 'Game.answerAccord',
  'Game.answerNationalChoice', 'Game.answerGlobalChoice', 'Game.hierarchyState']) {
  check('T1a competent lacks ' + verb, !compSrc.includes(verb));
}
// T1b: leanlinkcap5 shape — cap 5, linkform numbers, NO tend verb anywhere.
const llSrc = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'leanlinkcap5.js'), 'utf8');
check('T1b leanlinkcap5 subCap 5', llSrc.includes('const subCap = 5;'));
check('T1b leanlinkcap5 proposeFrom 25, perDay 1', llSrc.includes('const proposeFrom = 25;') && llSrc.includes('const perDay = 1;'));
check('T1b leanlinkcap5 7-day cooldown', llSrc.includes('+ 7 > day'));
check('T1b leanlinkcap5 tribute 4000', llSrc.includes('tributeKcalPerWeek: 4000'));
check('T1b leanlinkcap5 pantry gates 12000/25000', llSrc.includes('> 12000') && llSrc.includes('> 25000'));
check('T1b leanlinkcap5 answers counters/accords/national/global', llSrc.includes('Game.answerCounter') && llSrc.includes('Game.answerAccord') && llSrc.includes('Game.answerNationalChoice') && llSrc.includes('Game.answerGlobalChoice'));
check('T1b leanlinkcap5 defense calls kept', llSrc.includes('Game.answerDefenseCall'));
check('T1b leanlinkcap5 has NO tendLink call', !llSrc.includes('tendLink'));
check('T1b leanlinkcap5 has NO ctx.tended assignment', !llSrc.includes('ctx.tended'));
check('T1b leanlinkcap5 gate-off delegates to competent.daily', llSrc.includes('if (mode === 0) return competent.daily(Game, ctx);'));
check('T1b leanlinkcap5 armed branch = competent.daily + leanCourtship', llSrc.includes('competent.daily(Game, ctx);') && llSrc.includes('leanCourtship(Game, ctx);'));
// T1c: env gate.
const { leanlinkcap5Mode } = require(path.join(REPO, 'scripts', 'policies', 'leanlinkcap5'));
process.env.LEANLINKCAP5 = '1';
check('T1c LEANLINKCAP5=1 maps to mode 1', leanlinkcap5Mode() === 1);
process.env.LEANLINKCAP5 = '0';
check('T1c LEANLINKCAP5=0 maps to off', leanlinkcap5Mode() === 0);
process.env.LEANLINKCAP5 = '2';
check('T1c LEANLINKCAP5=2 maps to off (no other mode exists)', leanlinkcap5Mode() === 0);
delete process.env.LEANLINKCAP5;
check('T1c LEANLINKCAP5 unset maps to off', leanlinkcap5Mode() === 0);
// T1d: no coupling to linkform/leadcourt.
check('T1d leanlinkcap5 does not require linkform or leadcourt', !llSrc.includes("require('./linkform')") && !llSrc.includes("require('./leadcourt')"));

// T2: corpus completeness.
const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(x => /^s7350[1-8]-(control|armed)\.json$/.test(x)).sort() : [];
check('T2a pilot files = 16', files.length === 16, `got ${files.length}`);
const rows = files.map(f => load(path.join(DIR, f)));
const byArm = { control: rows.filter(r => r.arm === 'control'), armed: rows.filter(r => r.arm === 'armed') };
check('T2b 8 control + 8 armed', byArm.control.length === 8 && byArm.armed.length === 8,
  `${byArm.control.length} control, ${byArm.armed.length} armed`);
const seedsOk = s => { const srt = [...s].sort((a, b) => a - b); return srt.length === 8 && srt.every((v, i) => v === 73501 + i); };
check('T2c control seeds 73501-73508', seedsOk(byArm.control.map(r => r.seed)), byArm.control.map(r => r.seed).join(','));
check('T2c armed seeds 73501-73508', seedsOk(byArm.armed.map(r => r.seed)), byArm.armed.map(r => r.seed).join(','));
const anchors = new Set(rows.map(r => r.anchor12));
check('T2d single anchor', anchors.size === 1, [...anchors].join(','));
check('T2e all daysRequested 180', rows.every(r => r.daysRequested === 180));
check('T2f zero sweep errors', rows.every(r => (r.errors || []).length === 0),
  rows.map(r => (r.errors || []).length).join(','));
check('T2g paired seeds identical', JSON.stringify(byArm.control.map(r => r.seed).sort()) === JSON.stringify(byArm.armed.map(r => r.seed).sort()));
check('T2h broken-link fields present on every row', rows.every(r => r.links && typeof r.links.brokenFinal === 'number' && typeof r.links.dissolvedPlusBroken === 'number'));

// T3: recomputation of the pre-registered bar.
const nat = a => a.reduce((t, r) => t + (r.national || 0), 0);
const starv = a => a.reduce((t, r) => t + ((r.deathTotals.byCause || {}).starvation || 0), 0);
const cNat = nat(byArm.control), aNat = nat(byArm.armed);
const cMed = med(byArm.control.map(r => r.gameDays)), aMed = med(byArm.armed.map(r => r.gameDays));
const cStarv = starv(byArm.control), aStarv = starv(byArm.armed);
const spikes = Object.keys(byArm.armed.reduce((m, r) => { for (const [k, v] of Object.entries(r.deathTotals.byCause || {})) m[k] = (m[k] || 0) + v; return m; }, {}))
  .filter(k => { const av = byArm.armed.reduce((t, r) => t + ((r.deathTotals.byCause || {})[k] || 0), 0); const cv = byArm.control.reduce((t, r) => t + ((r.deathTotals.byCause || {})[k] || 0), 0); return av >= 3 && cv === 0; });
console.log(`T3 recomputed: national control=${cNat}/8 armed=${aNat}/8; median control=${cMed} armed=${aMed} ratio=${cMed ? (aMed / cMed).toFixed(3) : 'n/a'}; starvation control=${cStarv} armed=${aStarv} diff=${aStarv - cStarv}; spikes=${JSON.stringify(spikes)}`);
check('T3a primary legs computable (integers 0..8)', Number.isInteger(cNat) && Number.isInteger(aNat) && cNat >= 0 && cNat <= 8 && aNat >= 0 && aNat <= 8);
check('T3b guardrail legs computable', Number.isFinite(cMed) && Number.isFinite(aMed) && Number.isInteger(cStarv) && Number.isInteger(aStarv));
check('T3c villager-combat co-primary present on every row',
  rows.every(r => typeof r.deathTotals.villagerCombat === 'number' && typeof r.deathTotals.villager === 'number'));
check('T3d court counters present on every row',
  rows.every(r => r.court && typeof r.court.proposedLead === 'number' && typeof r.court.tended === 'number'));
check('T3e control courtship is zero (pairing holds in the corpora)',
  byArm.control.every(r => Object.values(r.court || {}).every(v => v === 0)),
  byArm.control.map(r => JSON.stringify(r.court)).join(' '));
check('T3f armed tends are ZERO on every row (the arm\'s defining zero)',
  byArm.armed.every(r => (r.court || {}).tended === 0),
  byArm.armed.map(r => `${r.seed}:${(r.court || {}).tended}`).join(' '));

// T4: no tracked game-code/policy-file modifications by this arm.
let status = '';
try { status = execSync('git status --porcelain', { cwd: REPO, encoding: 'utf8' }); } catch (e) { status = ''; }
const modifiedTracked = status.split('\n').filter(l => /^( M|M |A )/.test(l)).map(l => l.slice(3).trim());
const badMods = modifiedTracked.filter(f => f.startsWith('src/') || f === 'scripts/policies/competent.js' || f === 'scripts/policies/linkform.js' || f === 'scripts/policies/leadcourt.js');
check('T4 no tracked src/js or competent/linkform/leadcourt modifications', badMods.length === 0, badMods.join(',') || 'none');

console.log(failures ? `TEST-FAILURES: ${failures}` : 'TEST-OK');
process.exit(failures ? 1 : 0);
