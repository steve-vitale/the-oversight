#!/usr/bin/env node
// scripts/test-w4dpr2-fixtures.js — sim-w4dpr2 parser + classifier legs.
// No judged sweep, no game change: (1) synthetic-log parser cases
// (strike attribution incl. same-first-name fallback, volley,
// monster hits, un-write heals, unknown subjects); (2) break-reason
// classifier cases, one per prereg class; (3) a DRIVEN field fight
// (machete+bow vs audit, fieldability shape, seeded rng) whose
// rec.log is parsed by the real parser and whose parsed sums are
// checked against rec.mDealt / rec.vTaken + rec.allyTaken /
// rec.allyDealt — the parser leg the corpus numbers rest on.
// Exit 0 with FIXTURES PASS iff every leg passes; any failure
// exits 1 with the failing leg named.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { parseFightLog, classifyBreak, loadoutClass } = require('./w4dpr2-lib');

let checks = 0, fails = 0;
function check(name, cond, extra) {
  checks++;
  if (!cond) { fails++; console.log(`FAIL ${name} ${extra || ''}`); }
  else console.log(`ok ${name}`);
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function syntheticLegs() {
  // 1. Basic attribution: volley + leader/ally strikes + hits.
  const f1 = { log: [
    'Mara sees the grey man coming and nocks an arrow — the fight opens at range (3 shots).',
    '  loosed — it takes the grey man for 17 (1083 left).',
    '  loosed wide — the arrow buries itself in the dirt. (spent)',
    '  loosed — it takes the grey man for 15 (1068 left).',
    'Mara lowers the bow — the grey man is on them now. (2/3 hit)',
    'R1: Assessment hits Mara for 65 (35 left)',
    'R1: Mara strikes for 41 (x1.2) (1027 left)',
    'R1: Jon strikes for 5 (1022 left)',
    'R2: Assessment hits Jon for 10 (60 left)',
    'R2: Mara strikes for 30 (992 left)',
  ], leaderFirst: 'Mara', allyFirst: 'Jon', outcome: 'vFlee', rounds: 2, mDealt: 17 + 15 + 41 + 5 + 30, vTaken: 65, allyDealt: 5, allyTaken: 10, fleeHopeless: false, fleeLearn: false };
  const p1 = parseFightLog(f1);
  check('parse.volley', p1.volleyDealt === 32, `got ${p1.volleyDealt}`);
  check('parse.leaderDealt', p1.leaderDealt === 71, `got ${p1.leaderDealt}`);
  check('parse.allyDealt', p1.allyDealt === 5, `got ${p1.allyDealt}`);
  check('parse.dealtDelta', p1.dealtDelta === 0, `got ${p1.dealtDelta}`);
  check('parse.takenDelta', p1.takenDelta === 0, `got ${p1.takenDelta}`);
  check('parse.allyDelta', p1.allyDelta === 0, `got ${p1.allyDelta}`);
  check('parse.perRound.r1', p1.per[1].leaderDealt === 41 && p1.per[1].allyDealt === 5 && p1.per[1].leaderTaken === 65, JSON.stringify(p1.per[1]));
  check('parse.perRound.r2', p1.per[2].leaderDealt === 30 && p1.per[2].allyTaken === 10, JSON.stringify(p1.per[2]));
  // 2. Same-first-name fallback: first strike line in a round = leader.
  const f2 = { log: ['R1: Sam strikes for 20 (980 left)', 'R1: Sam strikes for 4 (976 left)', 'R1: Bite hits Sam for 9 (91 left)'],
    leaderFirst: 'Sam', allyFirst: 'Sam', outcome: 'vFlee', rounds: 1, mDealt: 24, vTaken: 9, allyDealt: 4, allyTaken: 0, fleeHopeless: false, fleeLearn: false };
  const p2 = parseFightLog(f2);
  check('parse.samename.strikes', p2.leaderDealt === 20 && p2.allyDealt === 4, `leader=${p2.leaderDealt} ally=${p2.allyDealt}`);
  check('parse.samename.hitUnknown', p2.unknownTaken === 9 && p2.takenDelta === -9, `unknownTaken=${p2.unknownTaken} takenDelta=${p2.takenDelta}`);
  // 3. 'strikes again' always ally; un-write heal tracked, not dealt.
  const f3 = { log: ['R1: Mara strikes for 10 (990 left)', 'R1: Mara strikes again for 6 (984 left)', 'R2: the Redactor redacts Mara\'s last turn — the wounds un-write. (+10)'],
    leaderFirst: 'Mara', allyFirst: 'Jon', outcome: 'vFlee', rounds: 2, mDealt: 16, vTaken: 0, allyDealt: 6, allyTaken: 0, fleeHopeless: false, fleeLearn: false };
  const p3 = parseFightLog(f3);
  check('parse.againIsAlly', p3.allyDealt === 6 && p3.leaderDealt === 10, `ally=${p3.allyDealt} leader=${p3.leaderDealt}`);
  check('parse.unwrite', p3.heals === 10 && p3.dealtDelta === 0, `heals=${p3.heals} delta=${p3.dealtDelta}`);
  // 4. Unknown subject counted, never guessed.
  const f4 = { log: ['R1: ??? strikes for 7 (993 left)'], leaderFirst: 'Mara', allyFirst: 'Jon', outcome: 'vFlee', rounds: 1, mDealt: 7, vTaken: 0, allyDealt: 0, allyTaken: 0, fleeHopeless: false, fleeLearn: false };
  const p4 = parseFightLog(f4);
  check('parse.unknownSubject', p4.unknownDealt === 7 && p4.dealtDelta === -7, `unknown=${p4.unknownDealt} delta=${p4.dealtDelta}`);
}

function classifyLegs() {
  const base = { log: [], rounds: 2, mDealt: 10, vTaken: 10, allyDealt: 0, allyTaken: 0, leaderFirst: 'A', allyFirst: 'B' };
  const cases = [
    [{ ...base, outcome: 'vKill' }, 'KILL'],
    [{ ...base, outcome: 'mFlee' }, 'DRIVE-OFF'],
    [{ ...base, outcome: 'vDie' }, 'PARTY-DEATH'],
    [{ ...base, outcome: 'vFlee', fleeHopeless: true }, 'HOPELESS'],
    [{ ...base, outcome: 'vFlee', fleeLearn: true }, 'LEARN-WITHDRAWAL'],
    [{ ...base, outcome: 'vFlee', fleeWise: true }, 'TRICK-EXIT'],
    [{ ...base, outcome: 'vFlee' }, 'WOUND-FLOOR'],
    [{ ...base, outcome: 'vFlee', rounds: 15, log: ['Neither gives after 15 rounds — the worse-off side disengages.'] }, 'CAP'],
    [{ ...base, outcome: 'mFlee', rounds: 15, log: ['Neither gives after 15 rounds — the worse-off side disengages.'] }, 'CAP'],
    [{ ...base, outcome: 'evade', rounds: 0 }, 'OTHER'],
  ];
  for (const [f, want] of cases) {
    const got = classifyBreak(f).reason;
    check(`classify.${want}`, got === want, `got ${got}`);
  }
  // Loadout classes: spear in ranged is a spear config, never a dual.
  check('loadout.spearRanged', loadoutClass({ melee: null, ranged: 'hunting_spear', carriedWeapons: ['hunting_spear'] }) === 'ranged-only:hunting_spear+carried:hunting_spear');
  check('loadout.dual', loadoutClass({ melee: 'machete', ranged: 'bow', carriedWeapons: ['machete', 'bow'] }) === 'machete+bow');
  check('loadout.bowCarried', loadoutClass({ melee: 'machete', ranged: null, carriedWeapons: ['machete', 'bow'] }) === 'machete+bow-carried-not-equipped');
  check('loadout.unarmed', loadoutClass({ melee: null, ranged: null, carriedWeapons: [] }) === 'unarmed');
}

async function drivenLeg() {
  const { Game: G, loadFails } = await loadGame({ seed: 75106, mode: 'w4dpr2-fixture', fullTelemetry: false });
  if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(G);
  try { G.state.scholar.day = 120; } catch (e) {}
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  if (roster.length < 2) throw new Error('fewer than 2 roster villagers');
  const leader = roster[0], ally = roster[1];
  const KIT_ARMOR = ['hide_armor', 'skull_helm', 'canvas_pants', 'work_gloves', 'good_boots'];
  for (const vid of [leader, ally]) {
    const vp = (G.data.villagers || []).find(x => x.id === vid) || (G.data.background_survivors || []).find(x => x.id === vid);
    if (!vp) throw new Error('no villager record ' + vid);
    vp.items = ['machete', 'bow'].concat(KIT_ARMOR);
    vp.items.push({ itemId: 'arrow', units: 5, name: 'arrow' });
    vp.equipped = {};
    vp.equipped.melee = { itemId: 'machete', name: 'machete' };
    vp.equipped.ranged = { itemId: 'bow', name: 'bow' };
  }
  const vv = G.state.village || (G.state.village = {});
  vv.health = vv.health || {};
  vv.health[leader] = 100; vv.health[ally] = 100;
  const def = (G.data.monsters || []).find(m => m && m.id === 'audit');
  if (!def) throw new Error('monster def not found: audit');
  const entity = { id: def.id, hp: 1100, maxHp: 1100, tx: 2, ty: 2 };
  const rec = G.fieldFight(leader, def, entity, { allies: 1, allyVids: [ally], rng: mulberry32(9000 + 1100) });
  const firstOf = (vid) => {
    try { if (vid !== G.villagerId && typeof G.firstRef === 'function') { const f = G.firstRef(vid); if (f) return String(f); } } catch (e) {}
    try { return String(G.displayName(vid)).split(' ')[0]; } catch (e) { return 'Someone'; }
  };
  const f = { log: rec.log, leaderFirst: firstOf(leader), allyFirst: firstOf(ally), outcome: rec.outcome, rounds: rec.rounds,
    mDealt: rec.mDealt, vTaken: rec.vTaken, allyDealt: rec.allyDealt, allyTaken: rec.allyTaken,
    fleeHopeless: !!rec.fleeHopeless, fleeLearn: !!rec.fleeLearn, fleeWise: !!rec.fleeWise };
  const p = parseFightLog(f);
  console.log(`driven: outcome=${rec.outcome} rounds=${rec.rounds} mDealt=${rec.mDealt} vTaken=${rec.vTaken} allyDealt=${rec.allyDealt} allyTaken=${rec.allyTaken} logLines=${(rec.log || []).length}`);
  console.log(`driven-parse: dealt=${p.dealt} (delta ${p.dealtDelta}) taken=${p.taken} (delta ${p.takenDelta}) allyDealt=${p.allyDealt} (delta ${p.allyDelta}) volley=${p.volleyDealt} unknownDealt=${p.unknownDealt} unknownTaken=${p.unknownTaken}`);
  check('driven.parseDealt', p.dealtDelta === 0, `delta=${p.dealtDelta}`);
  check('driven.parseTaken', p.takenDelta === 0, `delta=${p.takenDelta}`);
  check('driven.parseAlly', p.allyDelta === 0, `delta=${p.allyDelta}`);
  check('driven.breakClassified', classifyBreak(f).reason !== 'OTHER', `got ${classifyBreak(f).reason}`);
  check('driven.logPresent', Array.isArray(rec.log) && rec.log.length > 0);
  // Name attribution sanity: the log's strike subjects must include
  // at least the stored leader first name (else attribution is blind).
  const strikes = (rec.log || []).filter(l => /strikes for/.test(String(l)));
  check('driven.namesInLog', strikes.some(l => String(l).indexOf(f.leaderFirst) >= 0), `leaderFirst=${f.leaderFirst} strikes=${strikes.length}`);
}

async function main() {
  syntheticLegs();
  classifyLegs();
  await drivenLeg();
  console.log(`checks=${checks} fails=${fails}`);
  if (fails) { console.log('FIXTURES-FAIL'); process.exit(1); }
  console.log('FIXTURES-PASS');
}
main().catch(e => { console.error('FIXTURES-FAIL', e && e.stack || e); process.exit(1); });
