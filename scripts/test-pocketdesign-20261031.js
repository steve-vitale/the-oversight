#!/usr/bin/env node
// test-pocketdesign-20261031.js — proof for sim-pocketdesign-a.
// 1. Pure fixtures: attributeGate precedence (site-aware), nodeDelta.
// 2. Static read-only scan of the PD instrument (de-commented source
//    must not contain state-initializing calls, RNG draws, or saves).
// 3. Synthetic corpus: a hand-built per-seed JSON through the real
//    analyzer asserts patrol outcomes, gate table, drySub
//    spent-in-outing, and shout delta computation.
// 4. Live gate: the real sweep on NON-band seed 85901, 60d, patrol
//    stack, run twice into /tmp dirs — outputs must be byte-identical
//    (determinism), instrument errors 0, joins 1:1. Band seeds never
//    appear here, so proof runs are not judged sims.
// Writes only under /tmp (never into the repo). Exits non-zero on
// any failure. Usage: node scripts/test-pocketdesign-20261031.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { attributeGate, nodeDelta } = require(path.join(REPO, 'scripts', 'pocketdesign-diag-20261031'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`ok - ${name}`); }
  else { fail++; console.log(`FAIL - ${name}${extra ? ' :: ' + extra : ''}`); }
}

// --- 1. attributeGate fixtures (site-aware code order) ---
check('gate: exped heal beats sick', attributeGate({ kind: 'startExpedition', healTrue: true, sickBefore: true }) === 'heal');
check('gate: exped sick beats range', attributeGate({ kind: 'startExpedition', healTrue: false, sickBefore: true }) === 'sick');
check('gate: exped neither -> range', attributeGate({ kind: 'startExpedition', healTrue: false, sickBefore: false }) === 'range');
check('gate: patrol heal', attributeGate({ kind: 'resolvePatrol', healTrue: true, sickBefore: true }) === 'heal');
check('gate: patrol sick flag is NOT a gate -> other', attributeGate({ kind: 'resolvePatrol', healTrue: false, sickBefore: true }) === 'other');
check('gate: patrol neither -> other', attributeGate({ kind: 'resolvePatrol', healTrue: false, sickBefore: false }) === 'other');
check('gate: healObserved false + healTrue false exped -> range', attributeGate({ kind: 'startExpedition', healObserved: false, healTrue: false, sickBefore: false }) === 'range');
// --- nodeDelta fixtures ---
check('delta: 3,3 vs 4,4 -> manhattan 2 chebyshev 1', (() => { const d = nodeDelta({ nx: 3, ny: 3 }, { nx: 4, ny: 4 }); return d.manhattan === 2 && d.chebyshev === 1; })());
check('delta: same node -> 0,0', (() => { const d = nodeDelta({ nx: 4, ny: 4 }, { nx: 4, ny: 4 }); return d.manhattan === 0 && d.chebyshev === 0; })());
check('delta: null node -> nulls', (() => { const d = nodeDelta(null, { nx: 4, ny: 4 }); return d.manhattan === null && d.chebyshev === null; })());

// --- 2. Static read-only scan ---
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}
const diagSrc = stripComments(fs.readFileSync(path.join(REPO, 'scripts', 'pocketdesign-diag-20261031.js'), 'utf8'));
const FORBIDDEN = ['npcNode(', 'npcInside(', 'campPeopleIds', 'partyMembers', 'stashState',
  'agencyState', 'npcMaxDist(', 'npcRangeProfile(', 'ensureVillagerPositions', 'Math.random',
  'Game.save(', '.save()'];
for (const f of FORBIDDEN) check(`scan: instrument source has no ${f}`, !diagSrc.includes(f));
// The instrument wraps (never calls) the departure/pocket/fight methods:
// wrapping references Game[name] via the generic wrap() helper, so no
// literal 'Game.villagerPocketAmmo(' call exists outside the wrap table.
check('scan: no direct Game.villagerPocketAmmo( call', !diagSrc.includes('Game.villagerPocketAmmo('));
check('scan: no direct Game.fieldFight( call', !diagSrc.includes('Game.fieldFight('));

// --- 3. Synthetic corpus through the real analyzer ---
const tmpSyn = fs.mkdtempSync(path.join('/tmp', 'pd-proof-syn-'));
const ammoMap = (stone) => ({ arrow: 0, bolt: 0, stone, fusion_cell: 0, heartseeker_arrows: 0 });
const syn = {
  seed: 89999, policyId: 'synthetic', arm: 'patrol', anchorCommit: 'synthetic',
  maxWave: 4, wave4: 1, wave5: 0, endUnlockedWave: 4, endScaleRank: 'village',
  national: 0, table: 0, won: 0, days: 60, gameDays: 60, endReason: 'days',
  fights: [{ day: 10, vid: 'v1', mid: 'the_eulogy', wave: 4, outcome: 'evade',
    rangedWeaponId: 'sling', rangedAmmoId: 'stone', carriedNeeded: 0,
    pile: { stick: 100, fiber: 50, stone: 200 },
    callerClass: 'expeditionMonster', volley: { shots: 0, hits: 0, dmg: 0, ammoLeft: 0 },
    log: [] }],
  fightCount: 1, pocketCalls: [{ day: 5, vid: 'v1', pre: ammoMap(0), post: ammoMap(6), out: { pocketed: 6 } }],
  departures: [], weaponFirstSeen: {}, pocketOverflow: 0, fieldFightCalls: 4, lowWaveFights: 3,
  supplyPocketCalls: [], supplyDaily: [], supplyOverflow: 0, stickfiberRows: [],
  deadfallHauls: 0, deadfallSticks: 0, deadfallFiber: 0,
  pcFights: [{ day: 10, vid: 'v1', mid: 'the_eulogy', wave: 4, pocketBefore: 1, departBefore: 1, wentBefore: 1,
    fighterNode: { nx: 3, ny: 3 }, havenNode: { nx: 4, ny: 4 }, scholarNode: { nx: 4, ny: 4 },
    fighterGrid: null, scholarGridRaw: null, crewIncludesVid: false, crewAliveOthers: [],
    partyIncludesVid: false, away: { purpose: 'expedition' }, onExpedition: true,
    monsterNode: { tx: 3, ty: 3 }, optAllies: 0, optAllyVids: [] }],
  pcDepartures: [], pcLowWave: 3, pcErrors: [],
  pdVolleyRows: [
    { seq: 20, day: 5, vid: 'v1', mid: 'drumbelly_tanuki', wave: 1, volley: { shots: 2, hits: 2, dmg: 10, ammoLeft: 4 }, preCarried: ammoMap(6), postCarried: ammoMap(4), outcome: 'vKill' },
    { seq: 30, day: 5, vid: 'v1', mid: 'review_drone', wave: 1, volley: { shots: 2, hits: 1, dmg: 5, ammoLeft: 2 }, preCarried: ammoMap(4), postCarried: ammoMap(2), outcome: 'mFlee' },
    { seq: 40, day: 6, vid: 'v1', mid: 'ad_break', wave: 1, volley: { shots: 2, hits: 1, dmg: 5, ammoLeft: 0 }, preCarried: ammoMap(2), postCarried: ammoMap(0), outcome: 'mFlee' },
    { seq: 50, day: 10, vid: 'v1', mid: 'the_eulogy', wave: 4, volley: { shots: 0, hits: 0, dmg: 0, ammoLeft: 0 }, preCarried: ammoMap(0), postCarried: ammoMap(0), outcome: 'evade' },
  ],
  pdPocketSeq: [{ seq: 10, day: 5, vid: 'v1' }],
  pdDepartures: [
    { seq: 9, day: 5, vid: 'v1', kind: 'startExpedition', went: true, pocketDelta: 1, gate: null, healObserved: true, healTrue: false, healCalls: 1, sickBefore: false, hpBefore: 100, cachedProfile: 'wanderer', cachedMaxD: 3, awayAfter: true, expedAfter: true, integrity: [], volleyDuring: 0, volleyDuringWaves: [], volleyDuringRanged: false, volleyDuringShots: 0 },
    { seq: 60, day: 12, vid: 'v2', kind: 'startExpedition', went: false, pocketDelta: 0, gate: 'heal', healObserved: true, healTrue: true, healCalls: 1, sickBefore: false, hpBefore: 55, cachedProfile: null, cachedMaxD: null, awayAfter: false, expedAfter: false, integrity: [], volleyDuring: 0, volleyDuringWaves: [], volleyDuringRanged: false, volleyDuringShots: 0 },
    { seq: 61, day: 12, vid: 'v3', kind: 'startExpedition', went: false, pocketDelta: 0, gate: 'sick', healObserved: true, healTrue: false, healCalls: 1, sickBefore: true, hpBefore: 90, cachedProfile: null, cachedMaxD: null, awayAfter: false, expedAfter: false, integrity: [], volleyDuring: 0, volleyDuringWaves: [], volleyDuringRanged: false, volleyDuringShots: 0 },
    { seq: 62, day: 12, vid: 'v4', kind: 'startExpedition', went: false, pocketDelta: 0, gate: 'range', healObserved: true, healTrue: false, healCalls: 1, sickBefore: false, hpBefore: 100, cachedProfile: 'homebody', cachedMaxD: 0, awayAfter: false, expedAfter: false, integrity: [], volleyDuring: 0, volleyDuringWaves: [], volleyDuringRanged: false, volleyDuringShots: 0 },
    { seq: 63, day: 12, vid: 'v5', kind: 'resolvePatrol', went: false, pocketDelta: 0, gate: 'other', healObserved: true, healTrue: false, healCalls: 1, sickBefore: true, hpBefore: 100, cachedProfile: null, cachedMaxD: null, awayAfter: false, expedAfter: false, integrity: [], volleyDuring: 0 },
    { seq: 64, day: 13, vid: 'v6', kind: 'resolvePatrol', went: true, pocketDelta: 1, gate: null, healObserved: true, healTrue: false, healCalls: 1, sickBefore: false, hpBefore: 100, cachedProfile: null, cachedMaxD: null, awayAfter: false, expedAfter: false, integrity: [], volleyDuring: 0, volleyDuringWaves: [], volleyDuringRanged: false, volleyDuringShots: 0 },
    { seq: 65, day: 13, vid: 'v7', kind: 'resolvePatrol', went: true, pocketDelta: 1, gate: null, healObserved: true, healTrue: false, healCalls: 1, sickBefore: false, hpBefore: 100, cachedProfile: null, cachedMaxD: null, awayAfter: false, expedAfter: false, integrity: [], volleyDuring: 1, volleyDuringWaves: [1], volleyDuringRanged: true, volleyDuringShots: 2 },
  ],
  pdHealCalls: [], pdAssigns: [
    { day: 13, vid: 'v6', assignedAfter: true, retOk: true, retRefused: false },
    { day: 13, vid: 'v7', assignedAfter: true, retOk: true, retRefused: false },
    { day: 13, vid: 'v8', assignedAfter: false, retOk: false, retRefused: true },
  ],
  pdObjDeparts: [{ day: 6, vid: 'v9' }], pdReturns: [{ seq: 70, day: 20, vid: 'v1' }],
  pdErrors: [], pdOptionalMissing: [], pdSeq: 70, pdDepSeq: 7,
  deaths: [], hashes: [], instrumentErrors: [], supplyErrors: [], stickfiberErrors: [],
};
fs.writeFileSync(path.join(tmpSyn, 's89999.json'), JSON.stringify(syn, null, 1) + '\n');
let synOut;
try {
  const raw = execFileSync('node', [path.join(REPO, 'scripts', 'pocketdesign-analyze-20261031.js')],
    { env: Object.assign({}, process.env, { EVID: tmpSyn }), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const jsonPart = raw.slice(0, raw.indexOf('\n--- ranged fights'));
  synOut = JSON.parse(jsonPart);
} catch (e) { check('synthetic: analyzer runs', false, String((e && e.message) || e)); }
if (synOut) {
  check('synthetic: joins ok', synOut.joinOk === true && synOut.pocketSeqOk === true, JSON.stringify(synOut.joinProblems) + JSON.stringify(synOut.pocketSeqProblems));
  check('synthetic: class DRY-AT-FIGHT 1', synOut.classCounts['DRY-AT-FIGHT'] === 1, JSON.stringify(synOut.classCounts));
  check('synthetic: patrol calls 3 went 2 satOut 1', synOut.input1Patrol.calls === 3 && synOut.input1Patrol.went === 2 && synOut.input1Patrol.satOut === 1, JSON.stringify(synOut.input1Patrol));
  check('synthetic: patrol fought-by-wave (departure-based) wave1 1', synOut.input1Patrol.foughtByWaveDepartureBased.wave1 === 1, JSON.stringify(synOut.input1Patrol.foughtByWaveDepartureBased));
  check('synthetic: patrol ranged fights (departure-based) 1', synOut.input1Patrol.patrolRangedFightsDepartureBased === 1, JSON.stringify(synOut.input1Patrol.patrolRangedFightsDepartureBased));
  check('synthetic: patrol outcomes uneventful 1 fought 1 heal-sat-out 1', synOut.input1Patrol.outcomes.uneventful === 1 && synOut.input1Patrol.outcomes.fought === 1 && synOut.input1Patrol.outcomes['heal-sat-out'] === 1, JSON.stringify(synOut.input1Patrol.outcomes));
  check('synthetic: gate table heal/sick/range/other 1 each', synOut.input2SatOut.gateTable.heal === 1 && synOut.input2SatOut.gateTable.sick === 1 && synOut.input2SatOut.gateTable.range === 1 && synOut.input2SatOut.gateTable.other === 1, JSON.stringify(synOut.input2SatOut.gateTable));
  check('synthetic: attributed share 3/4', synOut.input2SatOut.attributed === 3 && synOut.input2SatOut.total === 4, JSON.stringify(synOut.input2SatOut));
  check('synthetic: drySub spent-in-outing 1', synOut.input3TopUp.drySubCounts['spent-in-outing'] === 1, JSON.stringify(synOut.input3TopUp.drySubCounts));
  check('synthetic: spends since pocket 6 over 3 fights', (() => { const t = synOut.input3TopUp.dryTimelines[0]; return t && t.spendsSincePocket === 6 && t.volleyFightsSincePocket === 3; })(), JSON.stringify(synOut.input3TopUp.dryTimelines));
  check('synthetic: shout delta d2 for call pop', synOut.input4Shout.shoutByDelta.d2 === 1, JSON.stringify(synOut.input4Shout.shoutByDelta));
  check('synthetic: shout unreachable 1', synOut.input4Shout.shoutChannels.unreachable === 1, JSON.stringify(synOut.input4Shout.shoutChannels));
}

// --- 4. Live gate: sweep seed 85901, 60d, patrol stack, twice, byte-identical ---
const envBase = { FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1',
  SEATDRIVE: '1', FULLSEAT: '1', AMMODIAG: '1', SUPPLYDIAG: '1', STICKFIBERDIAG: '1',
  PCDIAG: '1', PDIAG: '1', DEADFALL_B: '1', SEEDS: '85901', ARM: 'patrol', PDSTACK: 'patrol', DAYS: '60' };
const liveDirs = [];
let liveOk = true;
try {
  for (let i = 0; i < 2; i++) {
    const dir = fs.mkdtempSync(path.join('/tmp', 'pd-proof-live-'));
    liveDirs.push(dir);
    execFileSync('node', [path.join(REPO, 'scripts', 'pocketdesign-sweep-20261031.js')],
      { env: Object.assign({}, process.env, envBase, { EVID: dir }), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  }
  const a = fs.readFileSync(path.join(liveDirs[0], 'patrol', 's85901.json'), 'utf8');
  const b = fs.readFileSync(path.join(liveDirs[1], 'patrol', 's85901.json'), 'utf8');
  check('live: byte-identical re-run (determinism)', a === b, `lengths ${a.length} vs ${b.length}`);
  const j = JSON.parse(a);
  check('live: days > 0', (j.gameDays || 0) > 0, `gameDays=${j.gameDays}`);
  check('live: instrument errors 0', (j.instrumentErrors || []).length === 0 && (j.pcErrors || []).length === 0 &&
    (j.supplyErrors || []).length === 0 && (j.stickfiberErrors || []).length === 0 && (j.pdErrors || []).length === 0,
    `ammo=${(j.instrumentErrors || []).length} pc=${(j.pcErrors || []).length} supply=${(j.supplyErrors || []).length} sf=${(j.stickfiberErrors || []).length} pd=${(j.pdErrors || []).length}`);
  check('live: PD rows present', Array.isArray(j.pdVolleyRows) && Array.isArray(j.pdDepartures) && Array.isArray(j.pdPocketSeq), 'missing PD arrays');
  check('live: pocket-seq count equals pocketCalls count', (j.pdPocketSeq || []).length === (j.pocketCalls || []).length,
    `pdSeq=${(j.pdPocketSeq || []).length} pockets=${(j.pocketCalls || []).length}`);
  // NOTE (verified 2026-10-31, not assumed): seed 85901 yields ZERO
  // pocket-site departures in 60d on ALL stacks — patrol, supply, and
  // the pocketcall sweep itself (all three instruments agree at 0:
  // ammo departures, pcDepartures, pdDepartures). The village departs
  // via objectives instead (397 objDeparts on the supply stack).
  // So the live gate asserts cross-instrument AGREEMENT, not a
  // nonzero count; departure attribution itself is proven by the
  // synthetic corpus above, and judged bands (200d) exercise it live.
  check('live: departure instruments agree (ammo == pc == pd)', (j.departures || []).length === (j.pcDepartures || []).length &&
    (j.pcDepartures || []).length === (j.pdDepartures || []).length,
    `ammo=${(j.departures || []).length} pc=${(j.pcDepartures || []).length} pd=${(j.pdDepartures || []).length}`);
  const ana = execFileSync('node', [path.join(REPO, 'scripts', 'pocketdesign-analyze-20261031.js')],
    { env: Object.assign({}, process.env, { EVID: path.join(liveDirs[0], 'patrol') }), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const anaJson = JSON.parse(ana.slice(0, ana.indexOf('\n--- ranged fights')));
  check('live: analyzer joins ok', anaJson.joinOk === true && anaJson.pocketSeqOk === true,
    JSON.stringify(anaJson.joinProblems) + JSON.stringify(anaJson.pocketSeqProblems));
  console.log(`live: seed 85901 60d patrol stack: gameDays=${j.gameDays} maxWave=${j.maxWave} fights=${j.fightCount} patrolCalls=${(j.pdDepartures || []).filter(x => x.kind === 'resolvePatrol').length} pdVolley=${(j.pdVolleyRows || []).length}`);
} catch (e) {
  liveOk = false;
  check('live: sweep + analyzer run clean', false, String((e && e.message) || e) + '\n' + String((e && e.stdout) || '') + String((e && e.stderr) || ''));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
