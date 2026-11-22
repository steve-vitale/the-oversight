// test-leadgate-a.js — proof for arm sim-leadgate-a (wave-4+ lead question).
// Proves the leadgate instrument is sound before any judged band runs:
//   * the analyzer's staged selftest passes 100% (lead attribution,
//     gun-holder-in-party vs gun-holder-as-lead, member gaps never
//     invented, unaccounted grants, dead-holder flags, zero-launch
//     INCONCLUSIVE, aggregate GO-pending shape)
//   * the driver emits every field the analyzer reads (v4departs with
//     members, v4fights with lead/allies, planSeeds, planCensus,
//     v4gunLoc census, prizeEvents gains, volleyEvents)
//   * attrsOf (the member snapshot) reads correctly off a stub Game:
//     gun equipped detection, carried counts, cells, wave-kill counts,
//     veteran flags, dead flag, plan read, scholar handling
//   * the code rule the prereg names is present on this base:
//     plans seed only from a personal wave-3+ face, findCompanion
//     gates on trust 15 + ranger profile, companionScore carries no
//     gun term, the launch launches the HOLDER's own plan
//   * the zero-launch rule: a band with < 5 wave-4+ launches judges
//     INCONCLUSIVE, never GO or NO-GO
// Run: node scripts/test-leadgate-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const leadgate = require(path.join(__dirname, 'analyze-leadgate-a.js'));
const driver = require(path.join(__dirname, 'leadgate-driver-a.js'));

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// --- 1. Analyzer selftest (staged corpora) ---
check('leadgate selftest passes 100%', leadgate.selftest() === true);

// --- 2. Driver emits the fields the analyzer reads ---
const driverSrc = fs.readFileSync(path.join(__dirname, 'leadgate-driver-a.js'), 'utf8');
check('driver records v4departs', /v4departs/.test(driverSrc));
check('driver records v4fights', /v4fights/.test(driverSrc));
check('driver records planSeeds', /planSeeds/.test(driverSrc));
check('driver records planCensus', /planCensus/.test(driverSrc));
check('driver records v4gunLoc census', /v4gunLoc/.test(driverSrc));
check('driver records prizeEvents gains', /prizeEvents/.test(driverSrc) && /gunsGained/.test(driverSrc));
check('driver records volleyEvents', /volleyEvents/.test(driverSrc));
check('driver depart rows carry members', /members: members/.test(driverSrc));
check('driver fight rows carry lead + allies', /lead: leadAttrs/.test(driverSrc) && /allies: allyAttrs/.test(driverSrc));
check('driver wraps both departure paths', /winPlanDepart/.test(driverSrc) && /vbrainExecuteDepart/.test(driverSrc));
check('driver wraps winPlanSeedFromFight', /winPlanSeedFromFight/.test(driverSrc));
// REGRESSION (leadgate band leg-1, 2026-11-22): the v4fights push
// reads the volley `v`, which was first declared as a block-scoped
// `const` inside the volley try — every wave-4+ fight threw
// "v is not defined" and v4fights stayed 0. The volley must be
// declared with `let` at wrap-function scope, before the volley try.
check('driver volley is let-scoped for the v4fights push (regression)', /let v = null;\s*\n\s*try \{\s*\n\s*v = \(rec && rec\.volley\)/.test(driverSrc));

// --- 3. attrsOf on a stub Game ---
function stubGame() {
  const items = [
    { id: 'searcaster', weapon: { damage: 68, ammo: 'fusion_cell' } },
    { id: 'fusion_cell' },
    { id: 'spear', weapon: { damage: 10 } },
    { id: 'leather_armor' },
  ];
  const alice = { id: 'alice', dead: false, occupationId: 'hunter',
    items: [{ itemId: 'searcaster' }, { itemId: 'fusion_cell' }, { itemId: 'fusion_cell' }],
    equipped: { ranged: { itemId: 'searcaster' } } };
  const bob = { id: 'bob', dead: false, occupationId: 'smith',
    items: [{ itemId: 'spear' }], equipped: {} };
  const dead = { id: 'carol', dead: true, occupationId: 'farmer',
    items: [{ itemId: 'searcaster' }], equipped: { ranged: { itemId: 'searcaster' } } };
  const people = { alice: alice, bob: bob, carol: dead };
  return {
    villagerId: '__scholar__',
    data: { items: items, villagers: [alice, bob, dead] },
    state: {
      village: {
        roster: ['alice', 'bob', 'carol'],
        health: { alice: 80, bob: 100, carol: 0 },
        trust: { alice: 40, bob: 20 },
        away: {}, sick: {},
        npcSkills: { alice: ['tracking', 'archery'], bob: ['smithing'] },
        px: 4, py: 4,
        winPlan: { alice: { stage: 'hunt', target: 'eater', needWave: 4, party: ['bob'] } },
      },
      scholar: { day: 30, inventory: [], equipped: {} },
      waveKillLog: [
        { by: 'alice', w: 3, type: 'gavel' },
        { by: 'alice', w: 4, type: 'eater' },
        { by: 'bob', w: 2, type: 'moderator' },
      ],
    },
    getPerson: function (vid) { return people[vid] || null; },
    vpOf: function (vid) { return people[vid] || null; },
    npcRangeProfile: function (vid) { return vid === 'alice' ? 'wanderer' : 'forager'; },
    npcTemper: function (vid) { return vid === 'alice' ? 'bold' : 'steady'; },
    npcGoal: function (vid) { return vid === 'alice' ? 'lead' : 'survive'; },
    npcNode: function () { return { nx: 4, ny: 4 }; },
    isEngaged: function () { return false; },
    agencyState: function () { return { exped: {} }; },
  };
}
const G = stubGame();
// Stub the equipment module the gear replica reads.
globalThis.Scattering = { equipment: {
  armorOf: function () { return 0; },
  weaponBonusOf: function (person) {
    if (!person) return 0;
    for (const e of (person.items || [])) if (e.itemId === 'searcaster') return 68;
    for (const e of (person.items || [])) if (e.itemId === 'spear') return 10;
    return 0;
  },
  rangedWeaponOf: function (person) {
    if (!person) return null;
    const r = (person.equipped || {}).ranged;
    return r || null;
  },
} };
const aAlice = driver.attrsOf(G, 'alice');
check('attrsOf: alice read', !!aAlice);
check('attrsOf: alice gun equipped + 2 cells', aAlice && aAlice.gunEquipped === true && aAlice.cells === 2);
check('attrsOf: alice kills 2 total / 2 w3 / 1 w4, veteran3+4', aAlice && aAlice.killsTotal === 2 && aAlice.kills3 === 2 && aAlice.kills4 === 1 && aAlice.veteran3 === true && aAlice.veteran4 === true);
check('attrsOf: alice armed, profile wanderer, plan hunt/eater/w4', aAlice && aAlice.armed === true && aAlice.profile === 'wanderer' && aAlice.plan && aAlice.plan.stage === 'hunt' && aAlice.plan.needWave === 4);
check('attrsOf: alice hp 80, temper bold, goal lead, occupation hunter', aAlice && aAlice.hp === 80 && aAlice.temper === 'bold' && aAlice.goal === 'lead' && aAlice.occupation === 'hunter');
check('attrsOf: alice skills list kept', aAlice && Array.isArray(aAlice.skills) && aAlice.skills.indexOf('tracking') !== -1);
const aBob = driver.attrsOf(G, 'bob');
check('attrsOf: bob no gun, 0 w3+ kills, not veteran', aBob && aBob.gunEquipped === false && aBob.gunCarried === 0 && aBob.kills3 === 0 && aBob.veteran3 === false);
check('attrsOf: bob no plan', aBob && aBob.plan === null);
const aCarol = driver.attrsOf(G, 'carol');
check('attrsOf: dead holder flagged dead, gun still read', aCarol && aCarol.dead === true && aCarol.gunEquipped === true);
check('attrsOf: unknown vid returns null', driver.attrsOf(G, 'nobody') === null);
check('attrsOf: no combat-skill number invented', aAlice && !('combatSkill' in aAlice) && !('combat' in aAlice));
delete globalThis.Scattering;

// --- 4. The code rule the prereg names is present on this base ---
const wpSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'win-plan.js'), 'utf8');
check('winPlanSeedFromFight gates wave >= 3', /winPlanSeedFromFight\(vid, mdef, outcome\)/.test(wpSrc) && /\(mdef\.wave \|\| 1\) < 3/.test(wpSrc));
check('findCompanion gates trust >= 15', /trust\[cid\]\) < 15/.test(wpSrc));
check('findCompanion gates ranger profile', /prof !== 'wanderer' && prof !== 'explorer'/.test(wpSrc));
check('extraCompanionScan tiers killers then armed', /living wave-3\+ killers/.test(wpSrc) && /currently armed/.test(wpSrc));
check('launch launches the holder own plan (launchParty in winPlanDepart)', /winPlanDepart\(vid/.test(wpSrc) && /var launchParty = function/.test(wpSrc));
const csSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'companion-score.js'), 'utf8');
check('companionScore carries no gun term', !/searcaster|gun/i.test(csSrc));
const csCode = csSrc.split('\n').filter(function (l) { return l.trim().indexOf('//') !== 0; }).join('\n');
check('companionScore is pure (no Math.random in code)', !/Math\.random/.test(csCode));

// --- 5. Zero-launch rule: INCONCLUSIVE, never GO/NO-GO ---
const emptySeed = {
  seed: 999002, mode: 'ctl', gameDays: 150, endReason: 'survived', won: false,
  villageLost: false, maxWave: 5, standing: 300, scaleRank: 'regional',
  contestEvents: [], grantEvents: [], killLootEvents: [], prizeEvents: [],
  volleyEvents: [], corpseTakeEvents: [], v4gunLoc: [], deaths: [],
  instrumentErrors: [], v4departs: [], v4fights: [], planSeeds: [],
  planCensus: [],
};
const emptyAgg = leadgate.aggregate([leadgate.analyzeSeed(emptySeed)]);
check('zero launches -> INCONCLUSIVE', emptyAgg.verdict === 'INCONCLUSIVE', 'verdict: ' + emptyAgg.verdict);
check('zero launches -> launchesTotal 0', emptyAgg.launchesTotal === 0);

console.log('TEST-LEADGATE-A: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
