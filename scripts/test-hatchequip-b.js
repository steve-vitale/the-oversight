#!/usr/bin/env node
// test-hatchequip-b.js — proof for sim-hatchequip-b (DIAG).
// Part A: static code-path assertions (the named mechanism, from source).
// Part B: corpus assertions over evidence/2026-10-30/sim-hatchequip-b-corpus.
// Exits non-zero on any failure; prints PASS lines otherwise.
// No game code is changed; no harness run (the corpus IS the live leg).
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS ' + name + (detail ? ' — ' + detail : ''));
  else { failures++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
const gameJs = fs.readFileSync(path.join(root, 'src/js/game.js'), 'utf8');
const agencyJs = fs.readFileSync(path.join(root, 'src/js/villager-agency.js'), 'utf8');
const competentJs = fs.readFileSync(path.join(root, 'scripts/policies/competent.js'), 'utf8');

// --- Part A: static ---
// A1: villagerGearUp's stash block sits BEHIND the early return.
const guStart = gameJs.indexOf('villagerGearUp(vid, acquire)');
check('A1a villagerGearUp exists', guStart >= 0);
const guBody = gameJs.slice(guStart, guStart + 9000);
const gateIdx = guBody.indexOf('if (wb > 0 || !acquire) return;');
const stashIdx = guBody.indexOf('They grab the best weapon they own');
check('A1b stash block is behind the wb/acquire gate', gateIdx >= 0 && stashIdx > gateIdx,
  'gate@' + gateIdx + ' stash@' + stashIdx);
// A2: the ONLY acquire=true call sites in src/js are the two NPC departures.
const allJs = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.js')) allJs.push(p);
  }
})(path.join(root, 'src/js'));
const trueSites = [];
for (const f of allJs) {
  const src = fs.readFileSync(f, 'utf8');
  const re = /villagerGearUp\([^)]*,\s*true\)/g;
  let m;
  while ((m = re.exec(src))) {
    const before = src.slice(Math.max(0, m.index - 4000), m.index);
    const site = /startExpedition/.test(before.slice(-3000)) ? 'startExpedition'
      : /resolvePatrol/.test(before) ? 'resolvePatrol' : 'UNKNOWN';
    trueSites.push(path.relative(root, f) + ':' + site);
  }
}
check('A2 exactly two acquire=true call sites, both NPC departures', trueSites.length === 2 &&
  trueSites.some((s) => /startExpedition/.test(s)) && trueSites.some((s) => /resolvePatrol/.test(s)),
  trueSites.join(' | '));
// A3: the bot's own equip (competent gearUp) never reads stashed.
const cgStart = competentJs.indexOf('function gearUp(Game, ctx)');
const cgEnd = competentJs.indexOf('// BEAST TRICKS', cgStart);
const cgBody = competentJs.slice(cgStart, cgEnd >= 0 ? cgEnd : cgStart + 20000);
check('A3a competent gearUp exists', cgStart >= 0 && cgBody.length > 1000);
check('A3b competent gearUp never mentions stashed', !/stashed/.test(cgBody));
check('A3c competent gearUp scans equipped + inventory', /s\.equipped/.test(cgBody) && /s\.inventory/.test(cgBody));
// A4: policy never calls Game.villagerGearUp at all.
check('A4 competent never calls villagerGearUp', !/villagerGearUp/.test(competentJs));

// --- Part B: corpus ---
const corpusDir = path.join(root, 'evidence', '2026-10-30', 'sim-hatchequip-b-corpus');
const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.json')).sort();
check('B1 corpus has 16 seeds', files.length === 16, files.length + ' files');
const rows = files.map((f) => JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8')));
check('B2 zero recorder wrap errors', rows.every((d) => ((d.log || {}).wrapErrors || []).length === 0));
const vesselCalls = rows.reduce((t, d) => t + ((d.log || {}).gearUpVessel || []).length, 0);
const otherCalls = rows.reduce((t, d) => t + (((d.log || {}).gearUpOther || {}).total || 0), 0);
const otherTrue = rows.reduce((t, d) => t + (((d.log || {}).gearUpOther || {}).acquireTrue || 0), 0);
check('B3 zero gearUp calls targeted the vessel', vesselCalls === 0, vesselCalls + ' calls');
check('B4 gearUp DID fire for NPCs (wrapper live)', otherCalls > 1000 && otherTrue > 0,
  otherCalls + ' other calls, ' + otherTrue + ' acquire=true');
const hatchetCases = rows.filter((d) => (((d.spawnSnap || {}).pool || {}).stashed || []).indexOf('hatchet') >= 0);
check('B5 four spawn-hatchet-stashed vessels', hatchetCases.length === 4,
  hatchetCases.map((d) => d.seed).join(','));
let stashLost = 0, endStash = 0, kitHeld = 0;
for (const d of hatchetCases) {
  let prev = true, lost = false;
  for (const m of (d.mornings || [])) {
    const has = (m.person.stash || []).indexOf('hatchet') >= 0;
    if (prev && !has) lost = true;
    prev = has;
  }
  if (lost) stashLost++;
  const last = d.mornings[d.mornings.length - 1];
  if (last && (last.person.stash || []).indexOf('hatchet') >= 0) endStash++;
  if ((d.mornings || []).some((m) => (m.scholar.inv || []).indexOf('hatchet') >= 0 || (m.scholar.eq || []).indexOf('hatchet') >= 0)) kitHeld++;
}
check('B6 stashed hatchet never left the stash on any hatchet case', stashLost === 0, stashLost + ' lost');
check('B7 stashed hatchet still in stash at end on all hatchet cases', endStash === hatchetCases.length,
  endStash + '/' + hatchetCases.length);
// B8: 16101 stone_knife control — knap day 4, equip day 5, stash intact.
const s16101 = rows.find((d) => d.seed === 16101);
const knap = (s16101.log.crafts || []).filter((c) => c.recipe === 'stone_knife');
const equip = (s16101.log.equips || []).filter((e) => e.item === 'stone_knife');
const morn5 = (s16101.mornings || []).find((m) => m.gameDay === 5);
check('B8a 16101 knapped stone_knife day 4 (ok)', knap.length > 0 && knap[0].day === 4 && knap[0].ok === true,
  JSON.stringify(knap[0] || null));
check('B8b 16101 equipped stone_knife day 5', equip.length > 0 && equip[0].day === 5 && equip[0].ok === true,
  JSON.stringify(equip[0] || null));
check('B8c 16101 stashed stone_knife STILL in stash on day 5 (knapped, not stash-fed)',
  !!morn5 && (morn5.person.stash || []).indexOf('stone_knife') >= 0,
  morn5 ? morn5.person.stash.join(',') : 'no morning 5');
// B9: trajectory equivalence vs axeacq (recorder behavior-neutral).
const bySeed = (s) => rows.find((d) => d.seed === s);
const firstKitHatchetDay = (d) => {
  for (const m of (d.mornings || [])) {
    if ((m.scholar.inv || []).indexOf('hatchet') >= 0 || (m.scholar.eq || []).indexOf('hatchet') >= 0) return m.gameDay;
  }
  return null;
};
check('B9a 16103 village-lost day 50 (axeacq match)', bySeed(16103).endReason === 'village-lost' && bySeed(16103).daysAlive === 50,
  bySeed(16103).endReason + ' ' + bySeed(16103).daysAlive);
check('B9b 16105 first hatchet-kit day 42 (axeacq loot match)', firstKitHatchetDay(bySeed(16105)) === 42,
  String(firstKitHatchetDay(bySeed(16105))));
check('B9c 16111 first hatchet-kit day 31 (axeacq loot match)', firstKitHatchetDay(bySeed(16111)) === 31,
  String(firstKitHatchetDay(bySeed(16111))));
check('B9d 16108 first hatchet-kit day 50 (axeacq succession match)', firstKitHatchetDay(bySeed(16108)) === 50,
  String(firstKitHatchetDay(bySeed(16108))));

console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);
