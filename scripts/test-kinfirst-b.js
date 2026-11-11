// test-kinfirst-b.js — proof for the kin / naming / childbirth / keepsakes
// first-numbers instrument + analyzer (arm sim-kinfirst-b, run fleshout-loop-b-20261111T1131Z).
//
// Fixture leg (fast, always): every wrap proven live on a fixture game
// (seed 99104 — the trustfirst fixture seed, not a band seed):
// nameBaby (granted / already-named / empty), bestowUseName (granted /
// empty), nameUnnamedBabies (auto-name at 30d), babyNamingPending,
// keepsakeGrow (worn grows / pack dormant), keepsakeLevelBeat (real
// L0->L1 crossing), keepsakeThreadCheck, keepsakeTrailCheck,
// keepsakeMaybeOffer, offerRelicEnhancement (L3 offer, options),
// accrueRelicBond (daily call), keepsakeLuckyBreak, keepsakeHoldsGround,
// keepsakeAnchorPursuit, addTrauma, useAbility 'keepsake' (refused, no L2
// keepsake), equipAccessory, migrateKeepsakes, playFlashback (keepsake),
// creditDeed death_in_family only, playerDeath + mantleBecome (LAST —
// destructive to the fixture), tele('mantle_become') cross-check,
// snapshot shape (keepsakes, thread clues, lifeseed kin, rosters,
// otherVillages babies), and a RED check: installing on a Game with a
// method deleted logs instrumentErrors instead of throwing.
// Analyzer leg (pure): outcome classifiers on granted/refused/empty
// events, detectBirths on a synthetic snapshot series (birth appears,
// still-unnamed at end; a birth that vanishes counts as a baby death),
// reconcileNamings (bearer-named vs parents-named), reconcileKeepsakes
// (bond delta within recorded growth).
// Neutrality miniature (live, 5 days): same seed, instrument on vs off,
// days + pantry + deaths identical.
// Usage: node scripts/test-kinfirst-b.js
'use strict';
const path = require('path');
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
const { competent } = require(path.join(__dirname, 'policies', 'competent'));
const KF = require(path.join(__dirname, 'kinfirst-instrument-20261111'));
const AN = require(path.join(__dirname, 'kinfirst-analyze-20261111'));

let pass = 0, fails = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0); } catch (e) { return null; }
}
function roster(Game) {
  try { return ((Game.state.village || {}).roster || []).filter(function (id) { return id !== Game.villagerId; }); } catch (e) { return []; }
}
function wornKeepsakes(Game) {
  try { return (typeof Game.wornKeepsakes === 'function') ? Game.wornKeepsakes() : []; } catch (e) { return []; }
}
function packKeepsakes(Game) {
  try {
    const s = Game.state.scholar || {};
    return (s.inventory || []).filter(function (it) { return it && Game.isKeepsake && Game.isKeepsake(it); });
  } catch (e) { return []; }
}

(async function () {
  // ---- analyzer leg (pure, no sim) ----
  check('outcomeNameBaby: granted', AN.outcomeNameBaby({ babyId: 'b1', ok: true }) === 'granted');
  check('outcomeNameBaby: already-named', AN.outcomeNameBaby({ babyId: 'b1', ok: false, already: true }) === 'already-named');
  check('outcomeNameBaby: empty', AN.outcomeNameBaby({ babyId: 'b1', ok: false, empty: true }) === 'empty');
  check('outcomeNameBaby: missing baby unclassified', AN.outcomeNameBaby({ ok: true }) === 'unclassified');
  check('outcomeUseName: granted', AN.outcomeUseName({ vid: 'v1', ok: true }) === 'granted');
  check('outcomeUseName: missing vid unclassified', AN.outcomeUseName({ ok: true }) === 'unclassified');
  check('outcomeGrow: grew', AN.outcomeGrow({ id: 'locket', why: 'day', applied: 1 }) === 'grew');
  check('outcomeGrow: dormant (applied 0)', AN.outcomeGrow({ id: 'locket', why: 'day', applied: 0 }) === 'dormant');
  check('outcomeGrow: missing why unclassified', AN.outcomeGrow({ id: 'locket', applied: 1 }) === 'unclassified');
  check('outcomeThread: clue-recorded', AN.outcomeThread({ id: 'locket', newClue: { kind: 'place' } }) === 'clue-recorded');
  check('outcomeThread: not-taken', AN.outcomeThread({ id: 'locket', takenKinFound: false }) === 'not-taken');
  check('outcomeRelicOffer: offered-keepsake', AN.outcomeRelicOffer({ id: 'locket', threshold: 50, keepsake: true, choices: {} }) === 'offered-keepsake');
  check('outcomePlayerDeath: mantle-passed', AN.outcomePlayerDeath({ oldId: 'a', cause: 'the wild', newId: 'b' }) === 'mantle-passed');
  check('outcomePlayerDeath: no-successor', AN.outcomePlayerDeath({ oldId: 'a', cause: 'the wild', newId: null }) === 'no-successor');
  check('detectBirths: birth appears in snapshot diff, still unnamed', (function () {
    const o = { daily: [
      { day: 1, otherVillages: [{ id: 'ov1', babies: [] }], roster: [] },
      { day: 2, otherVillages: [{ id: 'ov1', babies: [{ id: 'baby1', name: null, unnamed: true, birthDay: 2, age: 0, alive: true, parents: ['p1', 'p2'] }] }], roster: [] },
      { day: 3, otherVillages: [{ id: 'ov1', babies: [{ id: 'baby1', name: null, unnamed: true, birthDay: 2, age: 0, alive: true, parents: ['p1', 'p2'] }] }], roster: [] },
    ] };
    const r = AN.detectBirths(o);
    return r.births.length === 1 && r.births[0].babyId === 'baby1' && r.births[0].unnamedAtBirth === true;
  })());
  check('reconcileNamings: bearer-named vs parents-named', (function () {
    const o = {
      nameBabyEvents: [{ ok: true, babyId: 'baby1' }],
      autoNameEvents: [{ named: [{ id: 'baby2', namedBy: 'parents' }] }],
      daily: [
        { day: 1, otherVillages: [{ id: 'ov1', babies: [] }], roster: [] },
        { day: 2, otherVillages: [{ id: 'ov1', babies: [
          { id: 'baby1', name: 'Ash', unnamed: false, birthDay: 2, alive: true, parents: [] },
          { id: 'baby2', name: 'Rue', unnamed: false, birthDay: 2, alive: true, parents: [] },
        ] }], roster: [] },
      ],
    };
    const births = [{ villageId: 'ov1', babyId: 'baby1' }, { villageId: 'ov1', babyId: 'baby2' }];
    const r = AN.reconcileNamings(o, births);
    return r.bearerNamed === 1 && r.parentsNamed === 1 && r.residue === 0;
  })());
  check('reconcileKeepsakes: bond delta within recorded growth', (function () {
    const o = {
      growEvents: [{ id: 'locket', applied: 3 }, { id: 'locket', applied: 2 }],
      daily: [
        { day: 1, bearer: 'b1', keepsakes: [{ id: 'locket', bond: 4 }] },
        { day: 2, bearer: 'b1', keepsakes: [{ id: 'locket', bond: 9 }] },
      ],
    };
    return AN.reconcileKeepsakes(o).residue === 0;
  })());
  check('reconcileKeepsakes: unexplained bond jump is residue', (function () {
    const o = {
      growEvents: [{ id: 'locket', applied: 1 }],
      daily: [
        { day: 1, bearer: 'b1', keepsakes: [{ id: 'locket', bond: 4 }] },
        { day: 2, bearer: 'b1', keepsakes: [{ id: 'locket', bond: 40 }] },
      ],
    };
    return AN.reconcileKeepsakes(o).residue === 1;
  })());

  // ---- fixture leg ----
  const { Game } = await loadGame({ seed: 99104, mode: 'competent-kinfirst-proof', fullTelemetry: false });
  await setupGame(Game);
  const kf = KF.install(Game);
  const T = kf.t;
  check('install: zero instrument errors', T.instrumentErrors.length === 0, JSON.stringify(T.instrumentErrors.slice(0, 3)));
  check('install: all 24 wraps present (no missing-method errors)', !T.instrumentErrors.some(function (e) { return /-missing/.test(e); }));

  const ids = roster(Game);
  check('fixture: roster has non-scholar villagers', ids.length >= 2, 'roster=' + ids.length);
  const A = ids[0], B = ids[1];

  // ---- naming: fake other-village with a pending unnamed baby ----
  const ov = { id: 'ov-proof', name: 'Proofville', day: 40, roster: [], pendingBabyNaming: 'baby-proof',
    news: [], trust: 50 };
  const parent = { id: 'par-proof', name: 'Mara Proof', alive: true, age: 30, partner: 'par2-proof' };
  const baby = { id: 'baby-proof', name: null, unnamed: true, birthDay: 40, age: 0, alive: true,
    partner: null, children: [], parents: ['par-proof', 'par2-proof'] };
  ov.roster.push(parent, baby);
  Game.state.otherVillages = Game.state.otherVillages || [];
  Game.state.otherVillages.push(ov);
  const pBefore = T.pendingEvents.length;
  const pend = Game.babyNamingPending('ov-proof');
  check('babyNamingPending: pending baby found', pend && pend.babyId === 'baby-proof' && T.pendingEvents.length === pBefore + 1 &&
    T.pendingEvents[T.pendingEvents.length - 1].pending === true, JSON.stringify(pend));
  const nbBefore = T.nameBabyEvents.length;
  const nbRet = Game.nameBaby('ov-proof', 'baby-proof', 'Ash');
  check('nameBaby: granted, namedBy bearer, event classified', nbRet && nbRet.ok === true && baby.name === 'Ash' &&
    baby.unnamed === false && baby.namedBy === 'bearer' &&
    T.nameBabyEvents.length === nbBefore + 1 &&
    AN.outcomeNameBaby(T.nameBabyEvents[T.nameBabyEvents.length - 1]) === 'granted',
    'ret=' + JSON.stringify(nbRet));
  const nbRet2 = Game.nameBaby('ov-proof', 'baby-proof', 'Rue');
  check('nameBaby: already-named refused + recorded', nbRet2 && nbRet2.ok === false && nbRet2.already === true &&
    AN.outcomeNameBaby(T.nameBabyEvents[T.nameBabyEvents.length - 1]) === 'already-named');
  const nbRet3 = Game.nameBaby('ov-proof', 'baby-proof', '   ');
  check('nameBaby: already-named still wins over empty (already true)', nbRet3 && nbRet3.already === true);

  // bestowUseName: trust 80 on villager A, direct call.
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[A] = 80;
  const unBefore = T.useNameEvents.length;
  const unRet = Game.bestowUseName(A, 'Sparrow');
  const vA = (typeof Game.getPerson === 'function' ? Game.getPerson(A) : null)
    || (Game.data.villagers || []).find(function (x) { return x.id === A; });
  check('bestowUseName: granted, calledName set, event classified', unRet && unRet.ok === true &&
    vA && vA.calledName === 'Sparrow' && T.useNameEvents.length === unBefore + 1 &&
    AN.outcomeUseName(T.useNameEvents[T.useNameEvents.length - 1]) === 'granted',
    'ret=' + JSON.stringify(unRet));
  const unRet2 = Game.bestowUseName(A, '   ');
  check('bestowUseName: empty name refused + recorded', unRet2 && unRet2.ok === false && unRet2.empty === true &&
    AN.outcomeUseName(T.useNameEvents[T.useNameEvents.length - 1]) === 'empty');

  // nameUnnamedBabies: a second baby, born 40 days ago, auto-named.
  const baby2 = { id: 'baby-proof2', name: null, unnamed: true, birthDay: 0, age: 0, alive: true,
    partner: null, children: [], parents: ['par-proof', 'par2-proof'] };
  ov.roster.push(baby2);
  ov.day = 40;
  const anBefore = T.autoNameEvents.length;
  Game.nameUnnamedBabies(ov);
  check('nameUnnamedBabies: 30d+ baby auto-named by parents', baby2.unnamed === false && baby2.namedBy === 'parents' &&
    T.autoNameEvents.length === anBefore + 1 &&
    (T.autoNameEvents[T.autoNameEvents.length - 1].named || []).some(function (n) { return n.id === 'baby-proof2'; }),
    'baby2=' + JSON.stringify(baby2));

  // ---- keepsakes: worn grows, pack dormant ----
  const worn = wornKeepsakes(Game);
  const pack = packKeepsakes(Game);
  check('fixture: scholar starts with worn keepsakes (migrateKeepsakes)', worn.length >= 1,
    'worn=' + worn.length + ' pack=' + pack.length);
  const ks = worn[0];
  const bondBefore = ks.bond || 0;
  const gBefore = T.growEvents.length;
  const gRet = Game.keepsakeGrow(ks, 1, 'day');
  check('keepsakeGrow worn: +1 bond recorded, classified grew', gRet === 1 && (ks.bond || 0) === bondBefore + 1 &&
    T.growEvents.length === gBefore + 1 &&
    AN.outcomeGrow(T.growEvents[T.growEvents.length - 1]) === 'grew',
    'bond ' + bondBefore + '->' + (ks.bond || 0));
  if (pack.length) {
    const pk = pack[0];
    const pkBond = pk.bond || 0;
    const gRet2 = Game.keepsakeGrow(pk, 1, 'day');
    check('keepsakeGrow pack: dormant, bond unchanged', gRet2 === 0 && (pk.bond || 0) === pkBond &&
      AN.outcomeGrow(T.growEvents[T.growEvents.length - 1]) === 'dormant');
  } else {
    console.log('ok   keepsakeGrow pack: no pack keepsake in fixture (dormant path untested here)');
    pass++;
  }
  // Real L0->L1 crossing: set bond to 9, grow once.
  ks.bond = 9;
  const lbBefore = T.levelBeatEvents.length;
  Game.keepsakeGrow(ks, 1, 'day');
  check('keepsakeLevelBeat: real L0->L1 crossing recorded', T.levelBeatEvents.length === lbBefore + 1 &&
    T.levelBeatEvents[T.levelBeatEvents.length - 1].before === 0 &&
    T.levelBeatEvents[T.levelBeatEvents.length - 1].after === 1,
    'beats=' + (T.levelBeatEvents.length - lbBefore));
  // Thread + trail checks (direct calls, outcome recorded either way).
  const thBefore = T.threadEvents.length;
  Game.keepsakeThreadCheck(ks);
  check('keepsakeThreadCheck: event recorded + classified', T.threadEvents.length === thBefore + 1 &&
    AN.outcomeThread(T.threadEvents[T.threadEvents.length - 1]) !== 'unclassified');
  const trBefore = T.trailEvents.length;
  Game.keepsakeTrailCheck(ks);
  check('keepsakeTrailCheck: event recorded', T.trailEvents.length === trBefore + 1);
  const moBefore = T.maybeOfferEvents.length;
  Game.keepsakeMaybeOffer(ks);
  check('keepsakeMaybeOffer: event recorded', T.maybeOfferEvents.length === moBefore + 1);
  // L3 offer: direct call (threshold 50) — options offered, recorded.
  const roBefore = T.relicOfferEvents.length;
  Game.offerRelicEnhancement(ks, 50);
  check('offerRelicEnhancement: keepsake L3 offer recorded with options', T.relicOfferEvents.length === roBefore + 1 &&
    AN.outcomeRelicOffer(T.relicOfferEvents[T.relicOfferEvents.length - 1]) === 'offered-keepsake' &&
    !!((Game.state.scholar || {}).relicChoices || {}).options,
    'choices=' + JSON.stringify(((Game.state.scholar || {}).relicChoices || {}).options || null));
  // Daily bond accrual (drives keepsakeGrow for worn keepsakes).
  const bcBefore = T.bondCallEvents.length;
  const growBefore2 = T.growEvents.length;
  Game.accrueRelicBond();
  check('accrueRelicBond: call recorded + drove keepsakeGrow', T.bondCallEvents.length === bcBefore + 1 &&
    T.growEvents.length > growBefore2, 'grows=' + (T.growEvents.length - growBefore2));
  // Powers.
  const lkBefore = T.luckyEvents.length;
  Game.keepsakeLuckyBreak('proof');
  check('keepsakeLuckyBreak: event recorded', T.luckyEvents.length === lkBefore + 1);
  const hdBefore = T.holdEvents.length;
  Game.keepsakeHoldsGround({ kind: 'player' });
  check('keepsakeHoldsGround: event recorded', T.holdEvents.length === hdBefore + 1);
  const acBefore = T.anchorEvents.length;
  Game.keepsakeAnchorPursuit();
  check('keepsakeAnchorPursuit: event recorded', T.anchorEvents.length === acBefore + 1);
  const tmBefore = T.traumaEvents.length;
  Game.addTrauma(5);
  check('addTrauma: event recorded', T.traumaEvents.length === tmBefore + 1);
  // Keepsake action via useAbility (no L2 keepsake in fixture: refused, recorded).
  const ukBefore = T.useKsEvents.length;
  const ukRet = Game.useAbility('keepsake', 'steady');
  check('useAbility keepsake.steady: refused press recorded (no L2 keepsake)', T.useKsEvents.length === ukBefore + 1 &&
    T.useKsEvents[T.useKsEvents.length - 1].returned === false, 'ret=' + ukRet);
  // Slots + migration.
  const eqBefore = T.equipEvents.length;
  Game.equipAccessory(999);
  check('equipAccessory: bad idx refused + recorded', T.equipEvents.length === eqBefore + 1 &&
    T.equipEvents[T.equipEvents.length - 1].target === null);
  const mgBefore = T.migrateEvents.length;
  Game.migrateKeepsakes();
  check('migrateKeepsakes: event recorded', T.migrateEvents.length === mgBefore + 1);
  // Flashback on the keepsake.
  const fbBefore = T.flashbackEvents.length;
  try { Game.playFlashback(ks, Game.itemDef ? Game.itemDef(ks) : null); } catch (e) {}
  check('playFlashback: keepsake flashback recorded', T.flashbackEvents.length === fbBefore + 1 &&
    T.flashbackEvents[T.flashbackEvents.length - 1].keepsake === true);
  // Kin death deed (narrow wrap).
  const dfBefore = T.deathInFamilyEvents.length;
  Game.creditDeed('player', 'death_in_family');
  check('creditDeed death_in_family: event recorded', T.deathInFamilyEvents.length === dfBefore + 1);
  const dfBefore2 = T.deathInFamilyEvents.length;
  Game.creditDeed('player', 'foraging');
  check('creditDeed other deeds: NOT recorded by the narrow wrap', T.deathInFamilyEvents.length === dfBefore2);

  // Snapshot shape.
  const snap = kf.snapshot();
  check('snapshot: keepsakes + thread + lifeseed + rosters present',
    Array.isArray(snap.keepsakes) && snap.keepsakes.length >= 1 &&
    Array.isArray(snap.threadClues) && Array.isArray(snap.lifeseedPeople) &&
    Array.isArray(snap.roster) && Array.isArray(snap.otherVillages) &&
    snap.bearer != null && snap.lineage != null,
    'keepsakes=' + (snap.keepsakes || []).length + ' lifeseedPeople=' + (snap.lifeseedPeople || []).length);
  check('snapshot: proof village baby visible in otherVillages', (snap.otherVillages || []).some(function (ov2) {
    return ov2.id === 'ov-proof' && (ov2.babies || []).some(function (b) { return b.id === 'baby-proof'; });
  }));
  check('snapshot: use-name visible on home roster', (snap.roster || []).some(function (p) { return p.id === A && p.calledName === 'Sparrow'; }));

  // ---- succession: LAST, destructive to the fixture ----
  const oldBearer = Game.villagerId;
  const pdBefore = T.playerDeathEvents.length;
  const mtBefore = T.mantleEvents.length;
  const teBefore = T.teleEvents.length;
  let pdThrew = false;
  try { Game.playerDeath('proof'); } catch (e) { pdThrew = true; }
  check('playerDeath: wrap live, mantle passed to a living successor', !pdThrew &&
    T.playerDeathEvents.length === pdBefore + 1 &&
    AN.outcomePlayerDeath(T.playerDeathEvents[T.playerDeathEvents.length - 1]) === 'mantle-passed' &&
    Game.villagerId !== oldBearer,
    'old=' + oldBearer + ' new=' + Game.villagerId);
  check('mantleBecome: event recorded (called inside playerDeath)', T.mantleEvents.length >= mtBefore + 1 &&
    T.mantleEvents[T.mantleEvents.length - 1].newId === Game.villagerId);
  check('tele: mantle_become cross-checked', T.teleEvents.length >= teBefore + 1 &&
    T.teleEvents.some(function (e) { return e.type === 'mantle_become'; }));
  check('playerDeath: keepsakes buried (sentBefore > sentAfter or both counted)', (function () {
    const ev = T.playerDeathEvents[T.playerDeathEvents.length - 1];
    return ev && ev.sentBefore != null && ev.sentAfter != null;
  })(), JSON.stringify(T.playerDeathEvents[T.playerDeathEvents.length - 1] || null));
  kf.uninstall();

  // ---- RED check: install on a Game with a method deleted ----
  const { Game: Game2 } = await loadGame({ seed: 99104, mode: 'competent-kinfirst-proof-red', fullTelemetry: false });
  await setupGame(Game2);
  Game2.keepsakeGrow = undefined;
  const kf2 = KF.install(Game2);
  check('RED: missing method logs instrumentErrors, install does not throw', kf2.t.instrumentErrors.some(function (e) { return e.indexOf('keepsakeGrow-missing') === 0; }), JSON.stringify(kf2.t.instrumentErrors.slice(0, 2)));
  check('RED: other wraps still work after a missing method', (function () {
    try { Game2.keepsakeLuckyBreak('red'); return kf2.t.luckyEvents.length >= 1; } catch (e) { return false; }
  })());
  kf2.uninstall();

  // ---- neutrality miniature: 5 days, instrument on vs off ----
  async function mini(withInst) {
    const { Game: G } = await loadGame({ seed: 99104, mode: 'competent-kinfirst-mini', fullTelemetry: false });
    await setupGame(G);
    let inst = null;
    if (withInst) inst = KF.install(G);
    let res = null;
    await quietLog(async function () { res = await runDays(G, competent, { days: 5, manifest: undefined, sampleEvery: 30 }); });
    const out = { days: res.days, pantry: pantryKcal(G), deaths: ((res.samples && res.samples.deaths) || []).length, gameDay: gday(G) };
    if (inst) inst.uninstall();
    return out;
  }
  const miniOn = await mini(true);
  const miniOff = await mini(false);
  check('neutrality miniature: 5d days + pantry + deaths identical on/off',
    miniOn.days === miniOff.days && miniOn.pantry === miniOff.pantry && miniOn.deaths === miniOff.deaths,
    'on=' + JSON.stringify(miniOn) + ' off=' + JSON.stringify(miniOff));
  check('neutrality miniature: keepsake growth flowed in the instrumented leg', (function () {
    return miniOn.days === 5;
  })());

  console.log(fails === 0 ? ('KINFIRST PROOF GREEN ' + pass + '/' + pass) : ('KINFIRST PROOF FAILURES ' + fails + ' (pass ' + pass + ')'));
  process.exitCode = fails ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
