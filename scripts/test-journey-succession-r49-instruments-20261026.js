#!/usr/bin/env node
// test-journey-succession-r49-instruments-20261026.js — proof test for the
// r49 instrument (C1v3 transition rule + MG2v2 meal-line + armor holder
// identity + over-cause), RED/GREEN.
// RED:  r48 driver on proof seed 24999 (short config) must NOT emit the r49
//       fields (halfVoiceMeal, callCheckV3, mg2v2, overCause, armor holders,
//       deadBearerAccess).
// GREEN: r49 driver on the same seed/config MUST emit all of them, with
//       every callMove bucketed and summing to its call line total, v2b <= v2,
//       and the C1v2 cross-check (every officeDaily move day has a callMove
//       OR a convoWindowMove). Tele counts are computed directly from the
//       raw arrays (tele is written before finish() — the r47 trap).
// The proof asserts on driver STDOUT JSON only; evidence files for seed
// 24999 are proof scratch and are deleted after the run (see run note).
// Usage: node scripts/test-journey-succession-r49-instruments-20261026.js
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

// ---- RED: r48 must lack every r49 field ----
const red = runDriver('journey-succession-r48-20261026.js');
check('RED halfVoiceMeal absent', !(red.mealAudit || []).some(m => m.halfVoiceMeal !== undefined));
check('RED callCheckV3 absent', red.callCheckV3 === undefined);
check('RED mg2v2 absent', red.mg2v2 === undefined);
check('RED overCause absent', red.overCause === undefined);
check('RED armor holders absent', !(red.armorMaps || []).some(a => a.map && a.map.holders !== undefined));
check('RED focusAccess absent', !(red.armorMaps || []).some(a => a.map && a.map.focusAccess !== undefined));
check('RED tele lacks armorHolders', !red.tele || red.tele['succession.armorHolders'] === undefined);

// ---- GREEN: r49 must carry every r49 field (and keep the r48 fields) ----
const green = runDriver('journey-succession-r49-20261026.js');
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
check('GREEN v2b <= v2', (green.funeral.echoV2b || 0) <= (green.funeral.echoV2 || 0));
check('GREEN m3v2b present', green.m3v2b !== undefined,
  'm3v2b=' + green.m3v2b + ' (' + (green.m3v2bDetail || '') + ')');

if (fails.length) { console.log(`\n${fails.length} FAILURES`); process.exit(1); }
console.log('\nALL GREEN');
