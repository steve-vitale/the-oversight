#!/usr/bin/env node
// test-journey-succession-r54-instruments-20261027.js — proof test for the
// r54 instrument (successor inheritance snapshot, on top of r53's
// deedContext + deedLedger call context + r51's donationLines +
// pantryKcal + r50's bumpTrust trap + C1v3 + MG2v2), RED/GREEN.
// RED:  r53 driver on proof seed 24999 (short config) must NOT emit the r54
//       fields (rec.inh, extended villager snapshots).
// GREEN: r54 driver on the same seed/config MUST emit all of them, with
//       every callMove bucketed and summing to its call line total, v2b <= v2,
//       and the C1v2 cross-check (every officeDaily move day has a callMove
//       OR a convoWindowMove). Tele counts are computed directly from the
//       raw arrays (tele is written before finish() — the r47 trap).
// The proof asserts on driver STDOUT JSON only; evidence files for seed
// 24999 are proof scratch and are deleted after the run (see run note).
// Usage: node scripts/test-journey-succession-r54-instruments-20261027.js
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const ENV = Object.assign({}, process.env, { SEED: '24999', EARLY_KILL_DAY: '5', POST_DAYS: '30' });

function runDriver(script) {
  const out = execFileSync('node', [path.join(ROOT, 'scripts', script)], {
    cwd: ROOT, env: ENV, timeout: 600000, maxBuffer: 64 * 1024 * 1024,
  }).toString();
  const start = out.lastIndexOf('\n{');
  const json = JSON.parse(out.slice(start + 1));
  return json;
}

let fails = [];
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails.push(name);
}

const ARMOR_LOCS = ['scholarPack', 'scholarWorn', 'scholarPrepStash', 'pantry',
  'livingWorn', 'livingPack', 'deadWorn', 'deadPack', 'corpses', 'stashed'];

// ---- RED: r53 must lack every r54 field ----
const red = runDriver('journey-succession-r53-20261027.js');
check('RED lacks rec.inh', red.inh === undefined);
check('RED villager snapshots lack invPack/plantKnow/trust', !(red.preDeathSnap && red.preDeathSnap.vill
  && Object.values(red.preDeathSnap.vill).some(v => v.invPack !== undefined || v.plantKnow !== undefined || v.trust !== undefined)));

// ---- GREEN: r54 must carry every r54 field (and keep the r53 fields) ----
const green = runDriver('journey-succession-r54-20261027.js');
check('GREEN scripted kill staged on proof seed (5 phase-A calls from day 1 land the kill on day 6)',
  green.death && green.death.scripted === true && green.death.day === 6,
  'death=' + JSON.stringify(green.death && { scripted: green.death.scripted, day: green.death.day }));
check('GREEN convoWindowMoves is an array (may be empty on the proof seed)',
  Array.isArray(green.convoWindowMoves),
  'moves=' + (green.convoWindowMoves || []).length);
check('GREEN officeDailyPostConvo is an array with one entry per post-loop day',
  Array.isArray(green.officeDailyPostConvo) && green.officeDailyPostConvo.length > 0,
  'entries=' + (green.officeDailyPostConvo || []).length);
check('GREEN every callMove carries moverNamedN + e1bClass + topMoverNamed',
  (green.officeCallMoves || []).every(m => typeof m.moverNamedN === 'number'
    && typeof m.e1bClass === 'string' && (m.topMoverNamed === null || typeof m.topMoverNamed === 'boolean')),
  'moves=' + (green.officeCallMoves || []).length);
check('GREEN mover-named counts are consistent (named <= movers, top flag agrees with the list)',
  (green.officeCallMoves || []).every(m => m.moverNamedN <= (m.movers || []).length
    && m.moverNamedN === (m.moverNamedMovers || []).length
    && (m.topMoverNamed === null || m.topMoverNamed === ((m.movers || [])[0] ? m.moverNamedMovers.includes(m.movers[0].id) : false))),
  'moves=' + (green.officeCallMoves || []).length);
check('GREEN armorMaps present with pre-death + post-handoff snapshots',
  Array.isArray(green.armorMaps) && green.armorMaps.some(a => a.at === 'pre-death')
  && green.armorMaps.some(a => a.at === 'post-handoff'),
  'maps=' + JSON.stringify((green.armorMaps || []).map(a => a.at)));
check('GREEN every armorMap entry carries all 10 location keys in locs and bark',
  (green.armorMaps || []).every(a => a.map && ARMOR_LOCS.every(l => Array.isArray(a.map.locs[l]) && Array.isArray(a.map.bark[l]))),
  'maps=' + (green.armorMaps || []).length);
check('GREEN armor d+1/d+2/d+3 snapshots present',
  ['d+1', 'd+2', 'd+3'].every(at => (green.armorMaps || []).some(a => a.at === at)),
  'maps=' + JSON.stringify((green.armorMaps || []).map(a => a.at)));
check('GREEN C1v2 cross-check ok (every daily move day has a callMove or a convoWindowMove)',
  green.callCheck && green.callCheck.ok === true && green.callCheckV2 && green.callCheckV2.ok === true,
  JSON.stringify(green.callCheck));
check('GREEN tele counts match the raw arrays directly (not finish-time objects)',
  green.tele && green.tele['succession.convoWindowMoves'] === (green.convoWindowMoves || []).length
  && green.tele['succession.callMovesMoverNamed'] === (green.officeCallMoves || []).filter(m => !m.bearerChanged && m.e1bClass === 'mover-named').length
  && green.tele['succession.armorMaps'] === (green.armorMaps || []).length,
  'tele=' + JSON.stringify(green.tele && { cw: green.tele['succession.convoWindowMoves'], mn: green.tele['succession.callMovesMoverNamed'], am: green.tele['succession.armorMaps'] }));
check('GREEN r47 fields still present (no regression)',
  green.e7 !== undefined && green.callCheck !== undefined && green.e6 !== undefined
  && green.e4 !== undefined && green.vouch45 !== undefined && Array.isArray(green.officeMoves),
  'e7=' + JSON.stringify(green.e7 && { solo: green.e7.soloOffice }));
check('GREEN every callMove bucketed and summing to its call total (carried)',
  (green.officeCallMoves || []).every(m => m.buckets && typeof m.buckets.bearerN === 'number'
    && typeof m.buckets.giftN === 'number' && typeof m.buckets.rumorN === 'number'
    && typeof m.buckets.crisisN === 'number' && typeof m.buckets.otherN === 'number'
    && (m.buckets.bearerN + m.buckets.giftN + m.buckets.rumorN + m.buckets.crisisN + m.buckets.otherN) === m.totalLines
    && m.from !== undefined && m.to !== undefined && Array.isArray(m.movers)),
  'moves=' + (green.officeCallMoves || []).length);
check('GREEN every mealAudit entry carries halfVoiceMeal (boolean)',
  (green.mealAudit || []).length > 0 && (green.mealAudit || []).every(m => typeof m.halfVoiceMeal === 'boolean'),
  'auditDays=' + (green.mealAudit || []).length);
check('GREEN callCheckV3 present with a boolean ok',
  green.callCheckV3 && typeof green.callCheckV3.ok === 'boolean',
  JSON.stringify(green.callCheckV3));
check('GREEN mg2v2 present (boolean)',
  typeof green.mg2v2 === 'boolean',
  'mg2v2=' + green.mg2v2 + ' mg2=' + green.mg2);
check('GREEN overCause present with over boolean',
  green.overCause && typeof green.overCause.over === 'boolean',
  JSON.stringify(green.overCause && { over: green.overCause.over, villageLost: green.overCause.villageLost }));
check('GREEN every armorMap carries holders + barkHolders + focusAccess keys',
  (green.armorMaps || []).length > 0 && (green.armorMaps || []).every(a => a.map
    && a.map.holders !== undefined && a.map.barkHolders !== undefined && a.map.focusAccess !== undefined),
  'maps=' + (green.armorMaps || []).length);
check('GREEN post-handoff focusAccess names the dead bearer record',
  (green.armorMaps || []).some(a => a.at === 'post-handoff' && a.map && a.map.focusAccess && a.map.focusAccess.found === true),
  'focusAccess=' + JSON.stringify((green.armorMaps || []).find(a => a.at === 'post-handoff')?.map?.focusAccess));
check('GREEN tele armorHolders + mealAuditDays match the raw arrays',
  green.tele && green.tele['succession.mealAuditDays'] === (green.mealAudit || []).length
  && green.tele['succession.armorHolders'] === Object.keys((((green.armorMaps || [])[(green.armorMaps || []).length - 1] || {}).map || {}).holders || {}).length,
  'tele=' + JSON.stringify(green.tele && { ah: green.tele['succession.armorHolders'], mad: green.tele['succession.mealAuditDays'] }));
check('GREEN bumpLog present with day/vid/before/after/delta consistent (delta === after-before)',
  Array.isArray(green.bumpLog) && green.bumpLog.every(b => typeof b.day === 'number' && typeof b.vid === 'string'
    && typeof b.before === 'number' && typeof b.after === 'number' && typeof b.delta === 'number'
    && Math.abs(b.delta - Math.round((b.after - b.before) * 100) / 100) < 0.001),
  'bumpCalls=' + (green.bumpLog || []).length);
check('GREEN every callMove carries a bumpEntries array',
  (green.officeCallMoves || []).every(m => Array.isArray(m.bumpEntries)),
  'moves=' + (green.officeCallMoves || []).length);
check('GREEN every convoWindowMove carries a bumpEntries array',
  (green.convoWindowMoves || []).every(m => Array.isArray(m.bumpEntries)),
  'moves=' + (green.convoWindowMoves || []).length);
check('GREEN tele bumpCalls + callMovesWithBump match the raw arrays',
  green.tele && green.tele['succession.bumpCalls'] === (green.bumpLog || []).length
  && green.tele['succession.callMovesWithBump'] === (green.officeCallMoves || []).filter(m => (m.bumpEntries || []).length > 0).length,
  'tele=' + JSON.stringify(green.tele && { bc: green.tele['succession.bumpCalls'], cmwb: green.tele['succession.callMovesWithBump'] }));
check('GREEN r50 fields still present (no regression)',
  green.callCheckV3 !== undefined && typeof green.mg2v2 === 'boolean' && green.overCause !== undefined,
  'v3ok=' + (green.callCheckV3 && green.callCheckV3.ok));
check('GREEN v2b <= v2', (green.funeral.echoV2b || 0) <= (green.funeral.echoV2 || 0));
check('GREEN m3v2b present', green.m3v2b !== undefined,
  'm3v2b=' + green.m3v2b + ' (' + (green.m3v2bDetail || '') + ')');

check('GREEN every callMove carries a donationLines array (may be empty)',
  (green.officeCallMoves || []).every(m => Array.isArray(m.donationLines)),
  'moves=' + (green.officeCallMoves || []).length);
check('GREEN every donationLine matches the donation voice',
  (green.officeCallMoves || []).every(m => (m.donationLines || []).every(l => /Donated .*Trust \+/i.test(l))),
  'donationLines=' + (green.officeCallMoves || []).reduce((a, m) => a + (m.donationLines || []).length, 0));
check('GREEN every officeDaily entry carries a numeric pantryKcal',
  Array.isArray(green.officeDaily) && green.officeDaily.length > 0 && green.officeDaily.every(d => typeof d.pantryKcal === 'number'),
  'entries=' + (green.officeDaily || []).length);
check('GREEN tele callMovesWithDonation matches the raw array count',
  green.tele && green.tele['succession.callMovesWithDonation'] === (green.officeCallMoves || []).filter(m => (m.donationLines || []).length > 0).length,
  'tele=' + JSON.stringify(green.tele && { cmd: green.tele['succession.callMovesWithDonation'] }));


check('GREEN deedContext present with one entry per post-loop day', Array.isArray(green.deedContext) && green.deedContext.length > 0, 'days=' + (green.deedContext || []).length);
check('GREEN every deedContext entry carries numeric gates + boolean gates', (green.deedContext || []).every(c => typeof c.teachablePairs === 'number' && typeof c.scholarKcal === 'number' && typeof c.kcalCap === 'number' && typeof c.packKcal === 'number' && typeof c.pantryKcal === 'number' && typeof c.kcalGateOpen === 'boolean' && typeof c.hallGated === 'boolean'), 'days=' + (green.deedContext || []).length);
check('GREEN every deedLedger entry carries argsJson + scholarKcal + pantryKcalAtCall', (green.deedLedger || []).every(d => Array.isArray(d.argsJson) && typeof d.scholarKcal === 'number' && typeof d.pantryKcalAtCall === 'number'), 'deeds=' + (green.deedLedger || []).length);
check('GREEN tele deedContextDays matches the raw array count', green.tele && green.tele['succession.deedContextDays'] === (green.deedContext || []).length, 'tele=' + JSON.stringify(green.tele && { dcd: green.tele['succession.deedContextDays'] }));
check('GREEN r51 fields still present (no regression)', (green.officeCallMoves || []).every(m => Array.isArray(m.donationLines)) && (green.officeDaily || []).every(d => typeof d.pantryKcal === 'number') && green.tele && typeof green.tele['succession.callMovesWithDonation'] === 'number', 'moves=' + (green.officeCallMoves || []).length);

check('GREEN every deedLedger entry carries site + siteRaw + stackHead', (green.deedLedger || []).every(d => typeof d.site === 'string' && typeof d.siteRaw === 'string' && Array.isArray(d.stackHead)), 'deeds=' + (green.deedLedger || []).length);
check('GREEN every deed with a site has a non-empty stackHead', (green.deedLedger || []).every(d => d.stackHead.length > 0), 'deeds=' + (green.deedLedger || []).length);
check('GREEN r52 fields still present (no regression)', Array.isArray(green.deedContext) && green.deedContext.length > 0 && (green.deedLedger || []).every(d => Array.isArray(d.argsJson) && typeof d.pantryKcalAtCall === 'number'), 'deedCtx=' + (green.deedContext || []).length);

check('GREEN rec.inh present and readable (successor-side snapshot exists)',
  green.inh && green.inh.readable === true,
  'readable=' + (green.inh && green.inh.readable) + ' scripted=' + (green.inh && green.inh.scripted));
check('GREEN succPre carries invPack/invWorn/plantKnow/trust',
  green.inh && green.inh.succPre && Array.isArray(green.inh.succPre.invPack)
  && Array.isArray(green.inh.succPre.invWorn) && Array.isArray(green.inh.succPre.plantKnow)
  && typeof green.inh.succPre.trust === 'number',
  'succPre=' + JSON.stringify(green.inh && green.inh.succPre && { inv: green.inh.succPre.invPack.concat(green.inh.succPre.invWorn), plants: green.inh.succPre.plantKnow, trust: green.inh.succPre.trust }));
check('GREEN scripted proof seed carries deadBearerPre + disposition covering every distinct dead-bearer item',
  green.inh && green.inh.scripted === true && green.inh.deadBearerPre
  && Array.isArray(green.inh.disposition) && green.inh.disposition.length === green.inh.deadPreDistinctN
  && green.inh.disposition.every(d => typeof d.presentAnywhere === 'boolean' && typeof d.vanished === 'boolean'),
  'distinct=' + (green.inh && green.inh.deadPreDistinctN) + ' disp=' + (green.inh && (green.inh.disposition || []).length));
check('GREEN inhD3 present (d+3 disposition re-check fired)',
  green.inhD3 && Array.isArray(green.inhD3.disposition) && green.inhD3.disposition.length === green.inh.deadPreDistinctN,
  'dplus=' + (green.inhD3 && green.inhD3.dplus));
check('GREEN succPost carries inv/codexPlants/codexSkills/trust',
  green.inh && green.inh.succPost && green.inh.succPost.inv
  && Array.isArray(green.inh.succPost.codexPlants) && Array.isArray(green.inh.succPost.codexSkills)
  && typeof green.inh.succPost.trust === 'number',
  'succPost trust=' + (green.inh && green.inh.succPost && green.inh.succPost.trust));

if (fails.length) { console.log(`\n${fails.length} FAILURES`); process.exit(1); }
console.log('\nALL GREEN');
