#!/usr/bin/env node
// Analyzer for journey ESTABLISHMENT r51 (2026-10-28): the tackle question —
// do teach / outing / invite fire in the establishment window? Read-only:
// prints to stdout, writes nothing. Usage:
//   node scripts/analyze-journey-establishment-r51-tackle-20261028.js [EVIDDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-28';
const load = (n) => JSON.parse(fs.readFileSync(path.join(EVID, n), 'utf8'));
const SEEDS = [209, 228, 238, 239];
const panel = {};
for (const s of SEEDS) panel[s] = load(`journey-establishment-r51-seed${s}.json`);
const inWin = (x) => x.day <= 42;
const inSit = (x) => x.day > 42;

console.log('== TEACH: skill-teach (teachSkill wrap) ==');
for (const s of SEEDS) {
  const d = panel[s], win = d.teachLog.filter(inWin), sit = d.teachLog.filter(inSit);
  const okW = win.filter(x => x.ok), failW = win.filter(x => !x.ok);
  const knewT = win.filter(x => x.knewBefore === true).length;
  const byVia = {};
  for (const x of win) byVia[x.via || '?'] = (byVia[x.via || '?'] || 0) + 1;
  const failWhy = {};
  for (const x of failW) failWhy[x.failWhy || '?'] = (failWhy[x.failWhy || '?'] || 0) + 1;
  console.log(`  ${s}: attempts ${win.length} (win) / ${sit.length} (sit) | ok ${okW.length} | knewBefore=true ${knewT} | fails ${failW.length} ${JSON.stringify(failWhy)} | vias ${JSON.stringify(byVia)}`);
  if (failW.length) for (const x of failW) console.log(`    fail d${x.day} ${x.teacher}->${x.learner} ${x.skill} via=${x.via} why=${x.failWhy}`);
}
const totTeachWin = SEEDS.reduce((a, s) => a + panel[s].teachLog.filter(inWin).length, 0);
const totTeachOk = SEEDS.reduce((a, s) => a + panel[s].teachLog.filter(x => inWin(x) && x.ok).length, 0);
console.log(`  PANEL in-window: attempts ${totTeachWin}, successes ${totTeachOk} -> ${totTeachOk >= 1 ? 'TEACH GO' : 'TEACH NO-GO/OPPORTUNITY-0'}`);

console.log('== TALK-TEACH: conversation ability-teaches (npcLearnFromTalk wrap) ==');
for (const s of SEEDS) {
  const d = panel[s], win = d.talkTeachLog.filter(inWin), sit = d.talkTeachLog.filter(inSit);
  const nb0w = win.filter(x => x.knowBefore === 0).length, nb1w = win.filter(x => x.knowBefore === 1).length;
  const nb0s = sit.filter(x => x.knowBefore === 0).length, nb1s = sit.filter(x => x.knowBefore === 1).length;
  const nullW = win.filter(x => !x.ability).length, nullS = sit.filter(x => !x.ability).length;
  console.log(`  ${s}: win calls ${win.length} (new ${nb0w}, deepen ${nb1w}, null ${nullW}) | sit calls ${sit.length} (new ${nb0s}, deepen ${nb1s}, null ${nullS})`);
}
const totTTWinNew = SEEDS.reduce((a, s) => a + panel[s].talkTeachLog.filter(x => inWin(x) && x.knowBefore === 0).length, 0);
const totTTSitNew = SEEDS.reduce((a, s) => a + panel[s].talkTeachLog.filter(x => inSit(x) && x.knowBefore === 0).length, 0);
console.log(`  PANEL: in-window new ${totTTWinNew} | sittings new ${totTTSitNew} -> ${totTTSitNew >= 1 ? 'channel works when held' : 'channel silent even when held'}`);

console.log('== INVITE: npcInviteDecision wrap ==');
for (const s of SEEDS) {
  const d = panel[s];
  for (const scope of [['win', inWin], ['sit', inSit]]) {
    const rows = d.inviteLog.filter(scope[1]);
    const byKind = {};
    for (const x of rows) { const k = x.kind || '?'; byKind[k] = byKind[k] || { n: 0, acc: 0 }; byKind[k].n++; if (x.accept) byKind[k].acc++; }
    const parts = Object.entries(byKind).map(([k, v]) => `${k} ${v.acc}/${v.n} (${v.n ? (v.acc / v.n).toFixed(2) : '-'})`);
    console.log(`  ${s} ${scope[0]}: ${rows.length} calls | ${parts.join(', ') || 'none'}`);
  }
  const selfRows = d.inviteLog.filter(x => x.invitee === x.inviter);
  if (selfRows.length) console.log(`    SELF-invite rows: ${selfRows.length} (e.g. ${JSON.stringify(selfRows[0])})`);
}

console.log('== OUTING: favor snapshots + performForageFavor ==');
for (const s of SEEDS) {
  const d = panel[s];
  const snaps = d.favorSnaps || [];
  const winSnaps = snaps.filter(x => x.day <= 42);
  let maxAsk = 0, maxProm = 0, everKinds = new Set(), endSnap = snaps[snaps.length - 1] || {};
  for (const sn of winSnaps) {
    const asks = sn.favors.filter(f => f.state === 'asked').length;
    const proms = sn.favors.filter(f => f.state === 'promised').length;
    if (asks > maxAsk) maxAsk = asks;
    if (proms > maxProm) maxProm = proms;
    for (const f of sn.favors) everKinds.add(f.kind);
  }
  const endF = (endSnap.favors || []).map(f => `${f.kind}:${f.state}`).join(', ');
  const endP = (endSnap.promises || []).length;
  const runs = d.forageLog || [];
  console.log(`  ${s}: win maxAsked ${maxAsk}, maxPromised ${maxProm}, kinds [${[...everKinds].join(',')}] | endSnap d${endSnap.day}: favors [${endF}] promises ${endP} | performCalls ${runs.length}`);
  const firstAsk = winSnaps.find(sn => sn.favors.length);
  if (firstAsk) console.log(`    first favors day ${firstAsk.day}: ${firstAsk.favors.map(f => f.vid + ':' + f.kind + ':' + f.state).join(', ')}`);
}
const totForage = SEEDS.reduce((a, s) => a + (panel[s].forageLog || []).length, 0);
console.log(`  PANEL performForageFavor calls: ${totForage} -> ${totForage >= 1 ? 'OUTING GO (performed)' : 'OUTING WATCH (promised, 0 performed) or OPPORTUNITY-0'}`);

console.log('== HOLDS ==');
for (const s of SEEDS) {
  const d = panel[s];
  const teleTypes = {};
  for (const row of (d.foodLedger || [])) for (const [k, v] of Object.entries(row.typeCounts || {})) teleTypes[k] = (teleTypes[k] || 0) + v;
  console.log(`  ${s}: C3 ${d.c3.verdict} (starv ${d.c3.starvationDeaths}, streak ${d.c3.maxCrisisStreak}) | C4 ${d.c4.verdict} | arrivals ${d.guardrails.arrivals} | pantry ${d.guardrails.pantryKcal} alive ${d.guardrails.popAlive} tier ${d.guardrails.tier} contests ${d.guardrails.contests} [${(d.guardrails.contestList || []).map(c => c.day + ':' + c.cid).join(',')}] | skill_lesson tele ${teleTypes.skill_lesson || 0} | talk_teach tele ${teleTypes.villager_talk_teach || 0}`);
}
console.log('== CONTROL vs r50 (same seeds, same dir) ==');
for (const s of SEEDS) {
  try {
    const o = load(`journey-establishment-r50-seed${s}.json`);
    const d = panel[s];
    console.log(`  ${s}: pantry ${o.guardrails.pantryKcal} -> ${d.guardrails.pantryKcal} | alive ${o.guardrails.popAlive} -> ${d.guardrails.popAlive} | contests ${o.guardrails.contests} -> ${d.guardrails.contests} | censusPantry ${o.censusPantryKcal} -> ${d.censusPantryKcal}`);
  } catch (e) { console.log(`  ${s}: r50 seed JSON missing (${e.message})`); }
}
