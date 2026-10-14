#!/usr/bin/env node
// PROOF: godhood requirements rework (Steve 2026-10-13).
// The old model (6 exact abilities + 1-of-1-3 exact synergies + 1-of-1-2
// exact tier-4 items with NO acquisition path) had 0 activations ever.
// The new model: 4+ abilities from the godhood's pool (incl. a core ability),
// any 1 of the pool's synergies, ANY tier-4 item (Steve option (c)),
// after day 80 (endgame floor). Villagers get the same model via
// npcAbilities/npcSynergies/person.items.
//
// RED: the old exact-model check (inlined) rejects a realistic 4-pool build
//   — the item gate is 0% (named items have no acquisition path).
// GREEN: the new pool model accepts it; all gates (core/synergy/item/day)
//   still reject incomplete builds; villagers ascend; relay path untouched.
//
// MEASUREMENT.md: seeded PRNG before module load; SEED env override;
// run green on >=3 seeds (7, 42, 99).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '7', 10);
Math.random = mulberry32(SEED);

// minimal S namespace; godhood.js attaches S.Godhood
globalThis.Scattering = {};
const godhoodSrc = fs.readFileSync(path.join(ROOT, 'src/js/godhood.js'), 'utf8');
eval(godhoodSrc);
const S = globalThis.Scattering;

// load reworked data
S.GODHOODS = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/godhood.json'), 'utf8'));
const items = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/items.json'), 'utf8'));
S.ITEM_TIER = {};
for (const it of items) if (it && it.id && it.lootTier) S.ITEM_TIER[it.id] = it.lootTier;

const G = S.Godhood;
let failures = 0;
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

// ---- RED: the old model rejects a realistic build ----
// Old semantics (inlined from pre-rework godhood.js): exact 6 abilities,
// 1-of exact synergies, 1-of exact ITEMS. The apex build below holds 4 of
// the old 6 abilities and the old synergy — but the old exact item
// (apex_bow) has no acquisition path (not in the alien loot pool, no craft,
// no shop, no quest), so old complete === false. This is the 0% blocker.
function oldCloseness(sch, gh) {
  const abs = new Set((sch.abilities || []).map(a => (a && a.id) || a));
  const syns = new Set(sch.activeSynergies || []);
  const inv = new Set((sch.inventory || []).map(i => i.itemId || i.id));
  const kit = (gh.oldAbilities || []).filter(a => abs.has(a));
  const synergy = (gh.oldSynergies || []).some(s => syns.has(s));
  const item = (gh.oldItems || []).some(i => inv.has(i));
  return { complete: kit.length === (gh.oldAbilities || []).length && synergy && item };
}
// reconstruct the OLD apex requirement from the new file's capstoneItems + known old kit
const apex = G.byId('apex_predator');
const oldApex = {
  oldAbilities: ['tracker', 'echo_location', 'patient_aim', 'dead_aim', 'game_sense', 'soft_step'],
  oldSynergies: ['apex_sense'],
  oldItems: apex.requires.capstoneItems || ['apex_bow'],
};
// a realistic endgame hunter: 4 pool abilities incl. core, synergy discovered,
// and the best item they could actually earn (a tier-4 alien drop)
const hunterBuild = {
  abilities: [{ id: 'tracker' }, { id: 'echo_location' }, { id: 'game_sense' }, { id: 'stalk' }],
  activeSynergies: ['apex_sense'],
  inventory: [{ itemId: 'starfall_lance' }], // tier-4 alien loot, actually obtainable (12% apex)
};
const redResult = oldCloseness(hunterBuild, oldApex);
check('RED old-model rejects realistic 4-pool hunter (0% item path)', redResult.complete === false,
  `old complete=${redResult.complete} (missing exact item ${oldApex.oldItems[0]}, 2 exact abilities)`);

// ---- GREEN: new pool model ----
// T1: full new-model build completes
const t1 = G.godhoodCloseness(hunterBuild, apex, 85);
check('T1 apex completes: 4 pool + core + synergy + tier-4 @ day 85', t1.complete === true,
  JSON.stringify({ kit: t1.kit, needKit: t1.needKit, coreHit: t1.coreHit, synergy: t1.synergy, item: t1.item, dayOk: t1.dayOk }));

// T2: day gate — same build at day 79 is not complete
const t2 = G.godhoodCloseness(hunterBuild, apex, 79);
check('T2 day gate: no godhood before day 80', t2.complete === false && t2.dayOk === false);

// T3: 4 pool but no core ability -> not complete (build identity matters)
const noCore = {
  abilities: [{ id: 'game_sense' }, { id: 'stalk' }, { id: 'blood_trail' }, { id: 'patient_aim' }],
  activeSynergies: ['apex_sense'],
  inventory: [{ itemId: 'starfall_lance' }],
};
const t3 = G.godhoodCloseness(noCore, apex, 85);
check('T3 core required: 4 pool without tracker/echo_location fails', t3.complete === false && t3.coreHit === false);

// T4: 3 pool -> close (hint fires) but not complete
const threePool = {
  abilities: [{ id: 'tracker' }, { id: 'echo_location' }, { id: 'game_sense' }],
  activeSynergies: ['apex_sense'],
  inventory: [{ itemId: 'starfall_lance' }],
};
const t4 = G.godhoodCloseness(threePool, apex, 85);
check('T4 3 pool: close=true, complete=false', t4.close === true && t4.complete === false);

// T5: no item -> not complete
const noItem = {
  abilities: [{ id: 'tracker' }, { id: 'echo_location' }, { id: 'game_sense' }, { id: 'stalk' }],
  activeSynergies: ['apex_sense'],
  inventory: [],
};
const t5 = G.godhoodCloseness(noItem, apex, 85);
check('T5 item still required: no tier-4 fails', t5.complete === false && t5.item === false);

// T6: no synergy -> not complete
const noSyn = {
  abilities: [{ id: 'tracker' }, { id: 'echo_location' }, { id: 'game_sense' }, { id: 'stalk' }],
  activeSynergies: [],
  inventory: [{ itemId: 'starfall_lance' }],
};
const t6 = G.godhoodCloseness(noSyn, apex, 85);
check('T6 synergy still required: undiscovered fails', t6.complete === false && t6.synergy === false);

// T7: named capstone item also qualifies (the ideal, not just any tier-4)
const namedItem = {
  abilities: [{ id: 'tracker' }, { id: 'echo_location' }, { id: 'game_sense' }, { id: 'stalk' }],
  activeSynergies: ['apex_sense'],
  inventory: [{ itemId: 'apex_bow' }],
};
const t7 = G.godhoodCloseness(namedItem, apex, 85);
check('T7 named capstone item (apex_bow) qualifies', t7.complete === true && t7.item === true);

// T8: tier-3 item does NOT qualify (tier gate is real)
const t3item = {
  abilities: [{ id: 'tracker' }, { id: 'echo_location' }, { id: 'game_sense' }, { id: 'stalk' }],
  activeSynergies: ['apex_sense'],
  inventory: [{ itemId: 'feast_king_cauldron' }], // lootTier 3
};
const t8 = G.godhoodCloseness(t3item, apex, 85);
check('T8 tier-3 item does not qualify', t8.complete === false && t8.item === false);

// ---- villager path ----
function mockGame(vid, npcAbilities, npcSynergies, personItems, day) {
  return {
    state: {
      day,
      village: {
        npcAbilities: { [vid]: npcAbilities },
        npcSynergies: { [vid]: npcSynergies },
        npcGodhood: {},
      },
    },
    getPerson: (id) => (id === vid ? { items: personItems } : null),
  };
}
// T9: villager army build completes (combat-5 kit: patient_aim/haymaker/rage/ambush + blood_rage + tier-4)
const army = G.byId('one_person_army');
const vg = mockGame('v1', ['patient_aim', 'haymaker', 'rage', 'ambush'], ['blood_rage'], ['searcaster'], 90);
const t9 = G.villagerGodhoodCloseness(vg, 'v1', army);
check('T9 villager army completes', t9.complete === true,
  JSON.stringify({ kit: t9.kit, coreHit: t9.coreHit, synergy: t9.synergy, item: t9.item, dayOk: t9.dayOk }));

// T10: villager without synergy does not complete
const vg2 = mockGame('v2', ['patient_aim', 'haymaker', 'rage', 'ambush'], [], ['searcaster'], 90);
const t10 = G.villagerGodhoodCloseness(vg2, 'v2', army);
check('T10 villager without synergy fails', t10.complete === false);

// T11: checkVillagerGodhood is idempotent (recognized once)
const fresh1 = G.checkVillagerGodhood(vg, 'v1');
check('T11a first check returns army', fresh1.includes('one_person_army'));
// simulate recognition marking
vg.state.village.npcGodhood['v1'] = { recognized: { one_person_army: 90 }, active: ['one_person_army'] };
const fresh2 = G.checkVillagerGodhood(vg, 'v1');
check('T11b second check returns nothing (fires once)', fresh2.length === 0);

// T12: player checkGodhood idempotent too
const sch = {
  abilities: [{ id: 'tracker' }, { id: 'echo_location' }, { id: 'game_sense' }, { id: 'stalk' }],
  activeSynergies: ['apex_sense'],
  inventory: [{ itemId: 'starfall_lance' }],
  godhood: { recognized: {}, active: [] },
};
const p1 = G.checkGodhood(sch, 85);
check('T12a player check returns apex_predator', p1.includes('apex_predator'));
sch.godhood.recognized['apex_predator'] = 85; sch.godhood.active.push('apex_predator');
const p2 = G.checkGodhood(sch, 86);
check('T12b player re-check returns nothing', p2.length === 0);

// T13: relay office path untouched
const relay = G.byId('voice_of_the_relay');
check('T13 relay keeps office path + minDay', relay.requires.office === 'relay_holder' && relay.requires.minDay === 80);

// T14: all 10 kit godhoods have the new format; pools reference real abilities
const abIds = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/abilities.json'), 'utf8')).map(a => a.id));
const syIds = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/synergies.json'), 'utf8')).map(s => s.id));
let formatOk = true, fmtDetail = [];
for (const gh of G.godhoods()) {
  if (gh.id === 'voice_of_the_relay') continue;
  const r = gh.requires || {};
  if (!r.abilityPool || !r.coreAbilities || !r.abilitiesNeeded || !r.synergies || !r.itemTiers || !r.minDay) {
    formatOk = false; fmtDetail.push(gh.id + ':missing-keys');
  }
  for (const a of [...(r.abilityPool || []), ...(r.coreAbilities || [])]) {
    if (!abIds.has(a)) { formatOk = false; fmtDetail.push(gh.id + ':bad-ability:' + a); }
  }
  for (const s of (r.synergies || [])) {
    if (!syIds.has(s)) { formatOk = false; fmtDetail.push(gh.id + ':bad-synergy:' + s); }
  }
}
check('T14 all kit godhoods: new format, real ability/synergy ids', formatOk, fmtDetail.join('; ') || '10/10 ok');

// T15: villager-reachable four — kit order actually yields 4+ pool incl. core in first 5 grants
const kits = {
  combat: ['patient_aim', 'haymaker', 'rage', 'ambush', 'phoenix_clause'],
  field: ['game_sense', 'field_dressing', 'stalk', 'tracker', 'echo_location'],
  social: ['peacemaker', 'mediator', 'diplomat', 'generous', 'silver_tongue'],
  craft: ['steady_hands', 'triage', 'field_medicine', 'preservation_instinct', 'iron_stomach'],
};
const villagerPaths = [
  ['one_person_army', 'combat'],
  ['apex_predator', 'field'],
  ['shepherd_of_the_dead', 'social'],
  ['undying_ward', 'craft'],
];
let pathsOk = true, pathDetail = [];
for (const [gid, track] of villagerPaths) {
  const gh = G.byId(gid);
  const r = gh.requires;
  const first5 = kits[track];
  const hits = first5.filter(a => (r.abilityPool || []).includes(a));
  const core = first5.some(a => (r.coreAbilities || []).includes(a));
  if (!(hits.length >= r.abilitiesNeeded && core)) {
    pathsOk = false; pathDetail.push(`${gid}: hits=${hits.length}/${r.abilitiesNeeded} core=${core}`);
  }
}
check('T15 four villager paths: first-5 kit grants satisfy pool+core', pathsOk, pathDetail.join('; ') || '4/4 ok');

// ---- sense-read: print the player-facing copy ----
console.log('\n--- SENSE-READ: apex hint + ceremony beats ---');
console.log('HINT:', apex.hint);
const beats = G.ceremonyBeats(apex, [{ name: 'Mara', line: 'I saw it happen. I was THERE.' }], 'dusk');
for (const b of beats) console.log(`[${b.beat}/${b.kind}] ${b.text.slice(0, 160)}${b.text.length > 160 ? '…' : ''}`);

console.log(`\n${failures ? 'FAILURES: ' + failures : 'ALL GREEN'} (seed ${SEED})`);
process.exit(failures ? 1 : 0);
