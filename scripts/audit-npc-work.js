#!/usr/bin/env node
'use strict';
// Real campaign call-chain audit. Every case has an independent, unobserved
// control; an instrumented run alone cannot certify its own neutrality.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const z = require('zlib'), crypto = require('crypto'), assert = require('assert/strict');
const value = (key, fallback) => { const i = process.argv.indexOf('--' + key); return i < 0 ? fallback : process.argv[i + 1]; };
const root = path.resolve(value('root', path.join(__dirname, '..')));
const requestedOutput = value('out', null);
const output = requestedOutput ? path.resolve(requestedOutput) : null, days = Number(value('days', 80));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const auditDigest = hash(fs.readFileSync(__filename));
function createReport(seed, observed) {
  return { seed, observed, choices: {}, needTrackQueries: {}, dutyCalls: {}, objectiveDutyCalls: {}, refusedDutyCalls: {}, deedCalls: {}, objectiveDeedCalls: {}, gearChoices: [], gearWork: [], weaponWork: [], materialWork: [], unknownIdentityCalls: 0 };
}
function install(G, report) {
  let depth = 0;
  const person = id => (G.data.villagers || []).find(p => p.id === id) ||
    G.state.village.rosterChars?.[id] || (G.data.background_survivors || []).find(p => p.id === id);
  const owned = id => {
    const p = person(id);
    return p ? JSON.parse(JSON.stringify({ items: p.items || [], equipped: p.equipped || {}, stashed: p.stashed || [] })) : null;
  };
  function resident(id) {
    const v = G.state.village;
    if (id === G.villagerId || id === G.state.scholar.villagerId || !(v.roster || []).includes(id)) return false;
    const p = person(id);
    if (!p) { report.unknownIdentityCalls++; return false; }
    return !p.dead;
  }
  const bump = (group, key) => { report[group][key] = (report[group][key] || 0) + 1; };
  const tick = G.objTick;
  G.objTick = function (...args) { depth++; try { return tick.apply(this, args); } finally { depth--; } };
  const pick = G.objPick;
  G.objPick = function (id, ...args) {
    const result = pick.call(this, id, ...args);
    if (resident(id)) {
      bump('choices', result.kind + (result.chore ? '/' + result.chore : ''));
      if (result.chore === 'gear' || result.craftMaterial) report.gearChoices.push({ id,
        day: G.state.scholar.day, part: G.dayPart, kind: result.kind,
        chore: result.chore, material: result.craftMaterial, tx: result.tx, ty: result.ty });
    }
    return result;
  };
  const need = G.villagerNeedTrack;
  G.villagerNeedTrack = function (id, ...args) {
    const result = need.call(this, id, ...args);
    if (resident(id)) bump('needTrackQueries', result || 'none');
    return result;
  };
  const execute = G.resolveOneAssignment;
  G.resolveOneAssignment = function (id, task, ...args) {
    const known = resident(id);
    if (known) { bump('dutyCalls', task.task); if (depth) bump('objectiveDutyCalls', task.task); }
    const result = execute.call(this, id, task, ...args);
    if (known && result === false) bump('refusedDutyCalls', task.task);
    return result;
  };
  const credit = G.creditDeed;
  G.creditDeed = function (id, deed, ...args) {
    const result = credit.call(this, id, deed, ...args);
    if (resident(id)) { bump('deedCalls', deed); if (depth) bump('objectiveDeedCalls', deed); }
    return result;
  };
  // Observe actual execution, not a readiness query (which can hydrate an
  // actor). IDs, coordinates and before/after rows come from existing state.
  if (typeof G.npcWorkGear === 'function') {
    const work = G.npcWorkGear;
    G.npcWorkGear = function (id, ...args) {
      const before = owned(id), pileBefore = { ...G.state.village.stash?.materials };
      const result = work.call(this, id, ...args);
      if (resident(id)) report.gearWork.push({ id, day: G.state.scholar.day,
        part: G.dayPart, ...result, before, after: owned(id), pileBefore,
        pileAfter: { ...G.state.village.stash?.materials } });
      return result;
    };
  }
  if (typeof G.npcForageCraftMaterial === 'function') {
    const forage = G.npcForageCraftMaterial;
    G.npcForageCraftMaterial = function (id, nx, ny, ...args) {
      const result = forage.call(this, id, nx, ny, ...args);
      if (resident(id)) report.materialWork.push({ id, nx, ny,
        day: G.state.scholar.day, part: G.dayPart, paid: result === true,
        source: result ? { ...G.state.village.objectives[id].materialSource } : null });
      return result;
    };
  }
  if (typeof G.villagerWeaponCraftDay === 'function') {
    const work = G.villagerWeaponCraftDay;
    report.weaponWork ||= [];
    G.villagerWeaponCraftDay = function (...args) {
      const state=G.state,v=state.village,day=state.scholar.day,bearer=G.villagerId;
      const ids=(v.roster||[]).filter(resident);
      // These are raw existing records, not readiness calls. Keep unknown XP
      // explicit and preserve both string/object inventory rows for analysis.
      const snapshot=id=>({id,owned:owned(id),knowledge:{...v.weaponCraft?.[id]},lastAttemptDay:v.weaponCraftCd?.[id]??null,
        away:!!v.away?.[id],node:v.nodePos?.[id]||null,xp:v.npcXp?.[id]?.craft??null});
      const before=ids.map(snapshot),pileBefore={...v.stash?.materials};
      const result=work.apply(this,args);
      report.weaponWork.push({day,bearer,result,stateUnchanged:G.state===state,bearerUnchanged:G.villagerId===bearer,
        before,after:ids.map(snapshot),pileBefore,pileAfter:{...v.stash?.materials}});
      return result;
    };
  }
}
async function worker() {
  const seed = Number(value('seed', 7)), observed = value('observe', '0') === '1';
  const S = require(path.join(root, 'scripts/sweep-compare'));
  const B = require('./balance-panel'), gear = require('./gear-usage-audit');
  const sources = B.manifest(root), before = JSON.stringify(sources), base = S.POLICY_REGISTRY.capable;
  const report = createReport(seed, observed);
  S.POLICY_REGISTRY.capable = { ...base, setup(G, context) { if (observed) install(G, report); if (base.setup) return base.setup(G, context); } };
  let finalHash;
  const result = await S.runComparison({ label: 'npc-work-audit', policies: ['capable'], seeds: [seed], days, origin: 'Columbus, Ohio', extraMetrics(G) { finalHash = gear.gameplayHash(G.state); return {}; } });
  assert.equal(JSON.stringify(B.manifest(root)), before, 'Game/controller inputs changed during audit');
  assert.equal(hash(fs.readFileSync(__filename)), auditDigest, 'Audit changed during campaign');
  fs.writeFileSync(path.join(output, seed + '-' + (observed ? 'on' : 'off') + '.json.gz'), z.gzipSync(JSON.stringify({ report, row: result.runs[0], finalHash, sources, sourceStable: true, auditDigest })), { flag: 'wx' });
}
async function main() {
  assert(output, 'Usage: node scripts/audit-npc-work.js --out <new-directory> [--root <frozen-root>] [--seeds 7,42] [--days 80]');
  assert(Number.isSafeInteger(days) && days > 0);
  if (process.argv.includes('--worker')) return worker();
  const seeds = value('seeds', '7,42').split(',').map(Number);
  assert(seeds.length && seeds.every(Number.isSafeInteger) && new Set(seeds).size === seeds.length);
  assert(!fs.existsSync(output), 'Keep previous audits; choose a fresh output directory');
  fs.mkdirSync(output, { recursive: true });
  const results = [];
  for (const seed of seeds) {
    await Promise.all(['0', '1'].map(observe => new Promise((resolve, reject) => {
      const fd = fs.openSync(path.join(output, seed + '-' + observe + '.log'), 'wx');
      const child = cp.spawn(process.execPath, [__filename, '--worker', '--root', root, '--out', output, '--seed', String(seed), '--days', String(days), '--observe', observe], { cwd: root, windowsHide: true, stdio: ['ignore', fd, fd] });
      fs.closeSync(fd); child.on('error', reject); child.on('close', code => code === 0 ? resolve() : reject(Error('Audit child failed: seed ' + seed + ', observe ' + observe + ', exit ' + code)));
    })));
    const read = mode => JSON.parse(z.gunzipSync(fs.readFileSync(path.join(output, seed + '-' + mode + '.json.gz'))));
    const off = read('off'), on = read('on');
    assert.deepEqual(on.sources, off.sources, 'Control used different source');
    assert.equal(on.finalHash, off.finalHash, 'Observer changed gameplay');
    assert.deepEqual(on.row, off.row, 'Observer changed the actual campaign result');
    results.push({ ...on.report, neutral: true, finalHash: on.finalHash });
  }
  const report = { schemaVersion: 1, root, days, seeds, auditDigest, results, scope: 'Actual capable campaigns with exact whole-row/gameplay-hash observer controls. Counts are real calls, not universal successes, unique opportunities or all-feature coverage. Deed calls are reported separately. Iteration caps are not run endings; this is not balance or human-input clearance.' };
  fs.writeFileSync(path.join(output, 'summary.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify(report));
}
if (require.main === module) main().catch(error => { console.error(error.stack); process.exitCode = 1; });
module.exports = { install, createReport };
