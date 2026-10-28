#!/usr/bin/env node
// analyze-arenalabel-b.js — before/after comparer for the
// sim-arenalabel-b arm. For each instance file present in
// BOTH dirs it extracts every playerDeath event and checks
// the five prereg-named fields for agreement (playerDeath
// arg, registerDeath cause, fallen cause, telemetry cause,
// narration death-line cause token), classifies the firing
// site from the wrapper stack (tbEnd vs endDay vs other),
// and diffs before vs after for determinism: endReason,
// grant-loss localization, bearer pairs, tap outcomes, and
// every death cause except the preregistered wild relabel
// ('the arena' -> 'the wild' for tbEnd losses).
//
// Usage:
//   node scripts/analyze-arenalabel-b.js <beforeDir> <afterDir>
// Prints a per-instance table and a verdict summary against
// the sim-arenalabel-b prereg (P1-P3 pilot clauses, C1-C4
// confirm clauses — same checker, different bands).
'use strict';
const fs = require('fs');
const path = require('path');
const beforeDir = process.argv[2];
const afterDir = process.argv[3];
if (!beforeDir || !afterDir) { console.error('usage: node scripts/analyze-arenalabel-b.js <beforeDir> <afterDir>'); process.exit(2); }
const beforeFiles = fs.readdirSync(beforeDir).filter((f) => f.endsWith('.json')).sort();
const afterFiles = new Set(fs.readdirSync(afterDir).filter((f) => f.endsWith('.json')));
function siteClass(stack) {
  const s = (stack || []).join('\n');
  if (/tbEnd/.test(s)) return 'tbEnd';
  if (/endDay|resolveDay/.test(s)) return 'endDay';
  return 'other';
}
function deathLineCauses(sayLines) {
  const out = [];
  for (const l of (sayLines || [])) {
    const line = typeof l === 'string' ? l : (l.line || '');
    const m = /is dead — (.+?)\./.exec(line);
    if (m) out.push(m[1]);
  }
  return out;
}
function summarize(dir, file) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  const deaths = [];
  for (const ev of (d.deathEvents || [])) {
    if (ev.kind !== 'playerDeath') continue;
    const oldId = ev.oldId;
    const regs = (d.regDeathEvents || []).filter((e) => e.villagerId === oldId);
    const fallen = (d.fallenFinal || []).filter((x) => x.villagerId === oldId);
    const teles = (d.teleDeathFinal || []).filter((x) => String(x.who) === String(oldId));
    const lineCauses = deathLineCauses(d.sayLines);
    const fields = {
      playerDeath: ev.cause,
      registerDeath: regs.length ? regs[regs.length - 1].cause : null,
      fallen: fallen.length ? fallen[fallen.length - 1].cause : null,
      telemetry: teles.length ? teles[teles.length - 1].cause : null,
      narration: lineCauses.length ? lineCauses : [],
    };
    const agree = fields.registerDeath === ev.cause && fields.fallen === ev.cause
      && fields.telemetry === ev.cause && lineCauses.includes(ev.cause);
    deaths.push({ oldId, cause: ev.cause, site: siteClass(ev.stack), stack0: (ev.stack || [])[0] || null, fields, agree });
  }
  const loc = d.lossLocalization || {};
  return {
    file, seed: d.seed, key: d.key, grantOk: d.grantOk, endReason: d.endReason,
    lost: !!loc.lost,
    lossBearerBefore: (loc.lastPresent || {}).bearerGame || null,
    lossBearerAfter: (loc.firstAbsent || {}).bearerGame || null,
    tapOutcomes: (d.taps || []).map((t) => t.outcome),
    deaths,
  };
}
let instances = 0, missingAfter = 0;
const rows = [];
const causeDiffs = [];
for (const f of beforeFiles) {
  if (!afterFiles.has(f)) { missingAfter++; console.log('MISSING AFTER: ' + f); continue; }
  const b = summarize(beforeDir, f);
  const a = summarize(afterDir, f);
  instances++;
  const detCore = b.endReason === a.endReason && b.lost === a.lost
    && b.lossBearerBefore === a.lossBearerBefore && b.lossBearerAfter === a.lossBearerAfter
    && JSON.stringify(b.tapOutcomes) === JSON.stringify(a.tapOutcomes);
  const bDeaths = b.deaths.map((x) => x.oldId + ':' + x.cause + ':' + x.site).join('|');
  const aDeaths = a.deaths.map((x) => x.oldId + ':' + x.cause + ':' + x.site).join('|');
  const diffs = [];
  const max = Math.max(b.deaths.length, a.deaths.length);
  for (let i = 0; i < max; i++) {
    const bd = b.deaths[i], ad = a.deaths[i];
    if (!bd || !ad) { diffs.push({ idx: i, before: bd ? bd.cause : null, after: ad ? ad.cause : null, kind: 'count-mismatch' }); continue; }
    if (bd.oldId !== ad.oldId || bd.site !== ad.site) diffs.push({ idx: i, before: bd.cause, after: ad.cause, kind: 'identity/site-mismatch' });
    else if (bd.cause !== ad.cause) diffs.push({ idx: i, before: bd.cause, after: ad.cause, site: bd.site, kind: (bd.site === 'tbEnd' && bd.cause === 'the arena' && ad.cause === 'the wild') ? 'wild-relabel' : 'OTHER-CAUSE-CHANGE' });
  }
  const det = detCore && diffs.every((x) => x.kind === 'wild-relabel');
  rows.push({ file: f, seed: b.seed, key: b.key, b, a, detCore, diffs, det });
  for (const x of diffs) causeDiffs.push({ file: f, seed: b.seed, key: b.key, ...x });
}
console.log('=== sim-arenalabel-b before/after: ' + instances + ' instances compared, ' + missingAfter + ' missing after ===');
for (const r of rows) {
  if (!r.b.deaths.length && !r.a.deaths.length) continue;
  console.log('- ' + r.seed + ' ' + r.key + ' lost=' + r.b.lost + ' det=' + r.det
    + ' | before deaths: ' + r.b.deaths.map((x) => x.oldId + '=' + x.cause + '(' + x.site + ',agree=' + x.agree + ')').join(', ')
    + ' | after deaths: ' + r.a.deaths.map((x) => x.oldId + '=' + x.cause + '(' + x.site + ',agree=' + x.agree + ')').join(', ')
    + (r.diffs.length ? ' | diffs: ' + JSON.stringify(r.diffs) : ''));
}
const lossRows = rows.filter((r) => r.b.lost);
console.log('\n=== loss instances: ' + lossRows.length + ' ===');
for (const r of lossRows) {
  console.log('- ' + r.seed + ' ' + r.key + ' ' + r.b.lossBearerBefore + ' -> ' + r.b.lossBearerAfter
    + ' | before: ' + r.b.deaths.map((x) => x.cause + '(' + x.site + ')').join(',')
    + ' | after: ' + r.a.deaths.map((x) => x.cause + '(' + x.site + ')').join(',')
    + ' | fieldsAgree after: ' + r.a.deaths.map((x) => x.agree).join(',')
    + ' | det=' + r.det);
}
const wildRelabels = causeDiffs.filter((x) => x.kind === 'wild-relabel');
const otherChanges = causeDiffs.filter((x) => x.kind !== 'wild-relabel');
const nonDet = rows.filter((r) => !r.det);
const disagreeAfter = rows.flatMap((r) => r.a.deaths.filter((x) => !x.agree).map((x) => r.file + ':' + x.oldId));
console.log('\n=== verdict summary ===');
console.log('instances: ' + instances);
console.log('loss instances: ' + lossRows.length);
console.log('wild relabels (tbEnd arena->wild): ' + wildRelabels.length);
console.log('OTHER cause changes: ' + otherChanges.length + (otherChanges.length ? ' ' + JSON.stringify(otherChanges) : ''));
console.log('non-deterministic instances: ' + nonDet.length + (nonDet.length ? ' ' + nonDet.map((r) => r.file).join(', ') : ''));
console.log('after-band deaths with field disagreement: ' + disagreeAfter.length + (disagreeAfter.length ? ' ' + disagreeAfter.join(', ') : ''));
console.log('before-band deaths with field disagreement: ' + rows.flatMap((r) => r.b.deaths.filter((x) => !x.agree).map((x) => r.file + ':' + x.oldId)).length);
const expectedLosses = [
  ['10041', 'animal_ken.read_beast'], ['10041', 'fear_aura.menace'], ['10041', 'molt.shed_skin'],
  ['10042', 'ambush.lay_wait'], ['10042', 'blood_trail.follow_blood'], ['10042', 'patient_aim.clean_shot'], ['10042', 'scarecrow.stage_injury'],
];
const repro = expectedLosses.filter(([s, k]) => lossRows.some((r) => String(r.seed) === s && r.key === k));
console.log('grantdeath 7-loss reproduction in before leg: ' + repro.length + '/7' + (repro.length < 7 ? ' MISSING: ' + JSON.stringify(expectedLosses.filter(([s, k]) => !repro.some(([a, b]) => a === s && b === k))) : ''));
const starvOk = lossRows.some((r) => String(r.seed) === '10041' && r.key === 'animal_ken.read_beast'
  && r.b.deaths.some((x) => x.cause === 'starvation') && r.a.deaths.some((x) => x.cause === 'starvation'));
console.log('starvation loss unchanged: ' + starvOk);
const wildOk = lossRows.filter((r) => !(String(r.seed) === '10041' && r.key === 'animal_ken.read_beast'))
  .every((r) => r.a.deaths.some((x) => x.site === 'tbEnd' && x.cause === 'the wild' && x.agree));
console.log('wild tbEnd losses relabeled + agreeing (loss rows, excl starvation): ' + wildOk);
