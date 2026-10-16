#!/usr/bin/env node
// scripts/test-god-verbs-wired-20261015.js — every god's ONE verb is in play.
//
// Steve: "Paint a path towards functional godhood. If they learn and
// experiment enough, people can get there and it's scary good." /
// "when in doubt we treat them the same way".
//
// The endgame diagnosis (evidence/2026-10-15/diagnosis-endgame.md §1) found
// ascension gave no gameplay power: 9 of 10 god verbs had no caller. This
// proves, through the real game code (useAbility('god', ...), tbDamage,
// tbVillagerAbility, startCombat, tbRoundWrap, maybeCheatDeath, endDay),
// for each of the 10 gods: an ascended holder (the player AND a villager,
// both named by the real ceremony) uses the verb in a real fight or scene,
// the effect happens, the food cost is paid, and the weakness bites.
// Never writes into the repo.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('test-god-verbs-wired-20261015');

(async () => {
  const Game = await K.load({ seed: 1015 });
  const S = globalThis.Scattering;
  const GH = S.Godhood, GV = S.GodVerbs;
  K.newRun(Game);
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  const v = Game.state.village;
  const roster0 = (v.roster || []).slice();
  // villagers other than the body the player wears (Game.villagerId sits on the roster too)
  const [vidA, vidB, vidC] = roster0.filter(id => id !== Game.villagerId);
  T.ok('three villagers to test with', !!(vidA && vidB && vidC), roster0.length);
  T.ok('the god-verb module is loaded and registered', !!GV && typeof Game.godActionDef === 'function' && !!globalThis.AbilityActionImpls['god.turn_the_pain']);

  // food tier pinned: villager casts are pantry-gated (foodPower.js)
  const _vft = Game.villageFoodTier;
  Game.villageFoodTier = function () { return 'secure'; };

  const quiet = (fn) => { const l = K.captureSays(Game); try { return fn(); } finally { l.restore(); } };
  function ascendPlayer(id) {
    s.godhood = { recognized: {}, active: [] };
    quiet(() => GH.recognitionCeremony(Game, id));
    return Game.holderGod('player');
  }
  function ascendVillager(vid, id) {
    v.npcGodhood = v.npcGodhood || {};
    delete v.npcGodhood[vid];
    quiet(() => GH.villagerRecognitionCeremony(Game, vid, id));
    return Game.holderGod(vid);
  }
  function clearGods() { s.godhood = { recognized: {}, active: [] }; v.npcGodhood = {}; }
  function needs(vid, h) { const n = Game.npcNeeds(vid); n.hunger = h == null ? 10 : h; return n; }
  // arena: player + up to three villager fighters vs one monster (more on request)
  function arena(o) {
    o = o || {};
    Game.tbfight = null;
    v.roster = roster0.slice();
    s.health = 100; s.kcal = o.kcal != null ? o.kcal : 4000;
    const m = quiet(() => K.fight(Game, o.monster || 'hushwolf', { px: o.px != null ? o.px : 0, py: o.py != null ? o.py : 0, mx: o.mx != null ? o.mx : 4, my: o.my != null ? o.my : 4, hp: 100 }));
    v.roster = roster0.slice(); // K.fight empties it for a solo arena; the village still exists
    const f = Game.tbfight;
    if (!f) throw new Error('no fight');
    f.round = 1;
    m.hp = m.maxHp = o.mhp || 600;
    const mk = (key, vid, x, y, hp) => {
      const a = { key, kind: 'villager', villagerId: vid, name: 'V' + key, emoji: '🧍', hp: hp || 30, maxHp: 30, speed: 3, mx: x, my: y, alive: true, fled: false, ai: 'brave' };
      f.fighters.push(a); f.order.push(a.key); return a;
    };
    const A = o.a ? mk('v_a', vidA, o.a.x, o.a.y, o.a.hp) : null;
    const B = o.b ? mk('v_b', vidB, o.b.x, o.b.y, o.b.hp) : null;
    const C = o.c ? mk('v_c', vidC, o.c.x, o.c.y, o.c.hp) : null;
    const extra = [];
    for (const [x, y] of (o.more || [])) {
      const c = Object.assign({}, m, { key: 'm_x' + extra.length, mx: x, my: y, telegraph: null, hesitate: 0, blind: 0, stunned: 0, _frozen: 0, threatQueue: [] });
      f.fighters.push(c); f.order.push(c.key); extra.push(c);
    }
    return { f, m, A, B, C, p: Game.tbFighter('p'), extra };
  }
  const ev = (verb, who) => K.teleEvents(Game, 'god_verb').filter(e => { const d = e.data || e; return d.verb === verb && (who == null || d.who === who); });
  const use = (id, tgt) => quiet(() => Game.useAbility('god', id, tgt));
  const cast = (fi) => quiet(() => Game.tbVillagerAbility(fi));
  const hit = (key, n, label, src) => quiet(() => Game.tbDamage(key, n, label || 'claws', src));

  // ================= 1. THE ONE-PERSON ARMY: Turn the Pain =================
  T.section('One-Person Army: Turn the Pain');
  {
    clearGods();
    T.ok('player ascends through the ceremony', ascendPlayer('one_person_army') === 'one_person_army');
    const { f, m, p } = arena({ px: 3, py: 4, mx: 4, my: 4 });
    // Initiative may resolve a setup hit before K.fight positions the arena.
    // This case begins explicitly unwounded; the subsequent public hits fund it.
    s.fightDamageTaken = 0;
    const bar = Game.activatableAbilities().find(a => a.id === 'god.turn_the_pain');
    T.ok('the verb is on the fight action bar', !!bar);
    T.ok('before any wound it is refused (nothing to give back)', bar && bar.available === false);
    hit('p', 30, 'claws', m.key); hit('p', 25, 'claws', m.key);
    const taken = s.fightDamageTaken;
    hit('p', 20, 'beam', m.key);
    T.ok('WEAKNESS: a beam wound feeds no pain (pool = the bleeding wounds only)', GV.painPool(f, p) === taken && s.fightDamageTaken > taken, `${GV.painPool(f, p)} vs ${s.fightDamageTaken}`);
    const k0 = s.kcal, h0 = m.hp, pool = GV.painPool(f, p);
    T.ok('the verb fires through useAbility', use('turn_the_pain') === true);
    const e = ev('turn_the_pain', 'player').slice(-1)[0];
    T.ok('the monster takes the whole pool back, uncapped (>= the pool)', h0 - m.hp >= pool && e && (e.data || e).dealt === h0 - m.hp, `${h0 - m.hp} vs pool ${pool}`);
    T.ok('it cost 150 kcal of food', k0 - s.kcal === 150, k0 - s.kcal);
    T.ok('once per fight: a second Turn the Pain is refused', use('turn_the_pain') === false);
    // PARTY: allies see you bleed
    const r2 = arena({ px: 3, py: 4, mx: 6, my: 6, a: { x: 3, y: 5 } });
    hit('p', 60, 'claws', r2.m.key);
    T.ok('PARTY: below half HP, the allies near you are rallied', (r2.A.rallied || 0) >= 3 && (r2.A.rallyBuff || 0) >= 3, `${r2.A.rallied}`);
    // TITAN: the titan's blows on your people come back too
    const r3 = arena({ px: 3, py: 4, mx: 4, my: 4, a: { x: 2, y: 2, hp: 30 } });
    r3.m.titan = true;
    hit('p', 20, 'claws', r3.m.key); hit(r3.A.key, 12, 'claws', r3.m.key);
    const hT = r3.m.hp;
    use('turn_the_pain');
    T.ok('TITAN: against a titan the blow also returns what it did to your allies', hT - r3.m.hp >= 32, hT - r3.m.hp);
    // villager parity
    clearGods();
    T.ok('a villager ascends the same way', ascendVillager(vidA, 'one_person_army') === 'one_person_army');
    const n = needs(vidA);
    const r4 = arena({ px: 0, py: 0, mx: 4, my: 4, a: { x: 3, y: 4, hp: 30 } });
    hit(r4.A.key, 14, 'claws', r4.m.key);
    const vh0 = r4.m.hp, hung0 = n.hunger;
    T.ok('the villager casts it on their own turn (tbVillagerAbility)', cast(r4.A) === true);
    T.ok('the villager gives their pain back (>= 14)', vh0 - r4.m.hp >= 14, vh0 - r4.m.hp);
    T.ok('the villager paid from their belly (150 kcal = +6 hunger)', n.hunger - hung0 === 6, n.hunger - hung0);
  }

  // ================= 2. THE UNDYING WARD: Take the Wound =================
  T.section('Undying Ward: Take the Wound');
  {
    clearGods();
    ascendPlayer('undying_ward');
    const { f, m, p, A } = arena({ px: 3, py: 3, mx: 4, my: 4, a: { x: 5, y: 5, hp: 30 } });
    const k0 = s.kcal, pHp = p.hp;
    hit(A.key, 20, 'claws', m.key);
    T.ok('a big hit on an ally lands on the Ward instead', A.hp === 30 && p.hp === pHp - 20, `${A.hp} / ${p.hp}`);
    T.ok('each redirect costs 60 kcal', k0 - s.kcal === 60, k0 - s.kcal);
    p.hp = 5; s.health = 5;
    hit(A.key, 80, 'claws', m.key);
    T.ok('a redirected wound cannot drop the Ward below 1 HP', p.alive && p.hp === 1 && A.hp === 30, `${p.hp}`);
    hit(A.key, 20, 'claws', m.key);
    T.ok('three strains: the Ward collapses (loses a whole turn)', (p.stunned || 0) >= 1 && p.stunFull === 1);
    hit(A.key, 20, 'claws', m.key);
    T.ok('after the collapse the ally takes their own wounds', A.hp === 10, A.hp);
    // weakness: the priority target, slow self-heal
    const r2 = arena({ px: 6, py: 6, mx: 4, my: 4, a: { x: 4, y: 5, hp: 30 } });
    const aim = S.combat.nearestEnemy(r2.f.fighters, r2.m);
    T.ok('WEAKNESS: monsters aim at the Ward over a nearer ally', aim && aim.f === r2.p, aim && aim.f && aim.f.key);
    r2.p.hp = 50; s.health = 50;
    quiet(() => Game.addHealth(20));
    T.ok('WEAKNESS: the Ward heals itself at half mid-fight (+20 -> +10)', s.health === 60, s.health);
    // villager ward
    clearGods();
    ascendVillager(vidB, 'undying_ward');
    const nB = needs(vidB);
    const r3 = arena({ px: 0, py: 0, mx: 4, my: 4, a: { x: 5, y: 5, hp: 30 }, b: { x: 3, y: 3, hp: 30 } });
    hit(r3.A.key, 15, 'claws', r3.m.key);
    T.ok('a villager Ward takes the ally\'s wound', r3.A.hp === 30 && r3.B.hp === 15, `${r3.A.hp}/${r3.B.hp}`);
    T.ok('the villager Ward paid from their belly (+2 hunger)', nB.hunger === 12, nB.hunger);
    const playerHP = r3.p.hp;
    hit('p', 25, 'claws', r3.m.key);
    T.ok('villager Ward protects the player by the same rule', r3.p.hp === playerHP && r3.B.hp === 1);
    hit(r3.A.key, 15, 'claws', r3.m.key);
    T.ok('the villager Ward collapses out of the fight at three strains', r3.B.fled === true && r3.B.alive);
  }

  // ================= 3. THE APEX PREDATOR: Choose the Terms =================
  T.section('Apex Predator: Choose the Terms');
  {
    clearGods();
    ascendPlayer('apex_predator');
    let r = arena({ px: 1, py: 4, mx: 4, my: 4, more: [[5, 6]] });
    const k0 = s.kcal;
    T.ok('Ambush fires before the first blow', use('terms_ambush') === true);
    T.ok('every foe loses its first turn; the next strike is x3', r.m.hesitate >= 1 && r.extra[0].hesitate >= 1 && s.ambushReady && s.ambushReady.mult === 3);
    T.ok('it cost 120 kcal', k0 - s.kcal === 120, k0 - s.kcal);
    T.ok('the terms are set once: Range is refused now', use('terms_range') === false);
    r = arena({ px: 1, py: 4, mx: 3, my: 4 });
    T.ok('Range fires', use('terms_range') === true);
    T.ok('the foe is driven back to 4 tiles', Math.max(Math.abs(r.m.mx - r.p.mx), Math.abs(r.m.my - r.p.my)) >= 4, `${r.m.mx},${r.m.my}`);
    const mult = S.Godpath.damageMult(Game, r.m);
    T.ok('from 2+ tiles your strikes hit x1.5', Math.abs(mult - 1.5) < 1e-9, mult);
    r.m.mx = r.p.mx + 1; r.m.my = r.p.my;
    quiet(() => Game.tbRoundWrap(r.f));
    T.ok('WEAKNESS: contact ends the terms (x1.5 gone once it reaches you)', Math.abs(S.Godpath.damageMult(Game, r.m) - 1) < 1e-9, S.Godpath.damageMult(Game, r.m));
    r = arena({ px: 1, py: 4, mx: 5, my: 4 });
    r.m.titan = true;
    T.ok('Ground fires', use('terms_ground') === true);
    T.ok('TITAN: Ground roots even a titan (2 rounds); you dodge +25%', (r.m._frozen || 0) >= 2 && S.Godpath.dodgeBonus(Game) >= 0.25);
    r = arena({ px: 1, py: 4, mx: 5, my: 4 });
    r.f.round = 3;
    T.ok('after the first round the terms are refused', use('terms_ambush') === false);
    clearGods();
    ascendVillager(vidA, 'apex_predator');
    const n = needs(vidA);
    r = arena({ px: 0, py: 0, mx: 5, my: 4, a: { x: 3, y: 4 } });
    T.ok('a villager hunter chooses the terms on round 1 (free, then acts)', cast(r.A) !== undefined && !!(r.f._gv && r.f._gv.terms) && r.f._gv.terms.key === r.A.key);
    T.ok('their ambush: the foe loses a turn, their next strike x3', r.m.hesitate >= 1 && r.A._nextStrikes && r.A._nextStrikes.mult === 3);
    T.ok('paid from their belly (+5 hunger)', n.hunger === 15, n.hunger);
  }

  // ================= 4. THE SHEPHERD OF THE DEAD: Raise Echo =================
  T.section('Shepherd of the Dead: Raise Echo');
  {
    clearGods();
    ascendPlayer('shepherd_of_the_dead');
    const r = arena({ px: 2, py: 2, mx: 4, my: 4, a: { x: 4, y: 5, hp: 30 }, b: { x: 3, y: 5, hp: 30 } });
    const k0 = s.kcal, fallen0 = (v.fallen || []).length;
    hit(r.A.key, 999, 'claws', r.m.key);
    T.ok('the fallen ally rises as an echo at full HP', r.A.alive && r.A.hp === r.A.maxHp && !!r.A._echo);
    T.ok('the death is real and final (off the roster, in the fallen)', !(v.roster || []).includes(vidA) && (v.fallen || []).length === fallen0 + 1);
    T.ok('it cost 150 kcal', k0 - s.kcal === 150, k0 - s.kcal);
    T.ok('the echo hits x2', r.A._nextStrikes && r.A._nextStrikes.mult === 2);
    hit(r.B.key, 999, 'claws', r.m.key);
    T.ok('once per fight: the second fallen ally stays down', !r.B.alive);
    r.f.round += 3;
    quiet(() => Game.tbRoundWrap(r.f));
    T.ok('after 3 rounds the echo fades for good', !r.A.alive && !r.A._echo);
    const fallen1 = (v.fallen || []).length;
    const r2 = arena({ px: 2, py: 2, mx: 4, my: 4, c: { x: 4, y: 5, hp: 30 } });
    hit(r2.C.key, 999, 'claws', r2.m.key);
    const fallen2 = (v.fallen || []).length;
    hit(r2.C.key, 999, 'claws', r2.m.key);
    T.ok('an echo struck down breaks apart without dying twice', !r2.C.alive && (v.fallen || []).length === fallen2 && fallen2 === fallen1 + 1);
    // TITAN/ARMY: in a titan fight every fallen ally rises
    roster0.forEach(id => { if (!v.roster.includes(id)) v.roster.push(id); });
    const r3 = arena({ px: 2, py: 2, mx: 4, my: 4, a: { x: 4, y: 5 }, b: { x: 3, y: 5 } });
    r3.m.titan = true;
    hit(r3.A.key, 999, 'claws', r3.m.key); hit(r3.B.key, 999, 'claws', r3.m.key);
    T.ok('ARMY/TITAN: in a titan fight every fallen ally rises (100 kcal each after the first)', r3.A.alive && r3.B.alive && r3.A._echo && r3.B._echo);
    // WEAKNESS: alone, no echoes (a Shepherd who is down raises nothing)
    const r4 = arena({ px: 2, py: 2, mx: 4, my: 4, a: { x: 4, y: 5 } });
    r4.p.alive = false;
    hit(r4.A.key, 999, 'claws', r4.m.key);
    T.ok('WEAKNESS: no living Shepherd on the field, no echo', !r4.A.alive);
    r4.p.alive = true;
    // villager shepherd
    clearGods();
    roster0.forEach(id => { if (!v.roster.includes(id)) v.roster.push(id); });
    ascendVillager(vidB, 'shepherd_of_the_dead');
    const nB = needs(vidB);
    const r5 = arena({ px: 0, py: 0, mx: 4, my: 4, a: { x: 4, y: 5 }, b: { x: 3, y: 3 } });
    hit(r5.A.key, 999, 'claws', r5.m.key);
    T.ok('a villager Shepherd raises the echo', r5.A.alive && !!r5.A._echo);
    T.ok('paid from their belly (+6 hunger)', nB.hunger === 16, nB.hunger);
  }
  // the village took losses above; bring it back for the rest
  v.roster = roster0.slice();
  for (const id of roster0) { try { const vp = Game.vpOf(id); if (vp) vp.dead = false; } catch (e) { /* not a person record */ } }

  // ================= 5. THE BETWEEN: Phase Out =================
  T.section('The Between: Phase Out');
  {
    clearGods();
    ascendPlayer('the_between');
    const r = arena({ px: 3, py: 4, mx: 4, my: 4 });
    const k0 = s.kcal, hp0 = r.p.hp, x0 = r.p.mx, y0 = r.p.my;
    r.f.ksHold = true;
    hit('p', 60, 'claws', r.m.key);
    T.ok('a big hit passes through empty air', r.p.hp === hp0);
    T.ok('it cost 100 kcal', k0 - s.kcal === 100, k0 - s.kcal);
    T.ok('WEAKNESS: phasing is a retreat (moved away, hold broken)', (r.p.mx !== x0 || r.p.my !== y0) && !r.f.ksHold && Math.max(Math.abs(r.m.mx - r.p.mx), Math.abs(r.m.my - r.p.my)) > 1);
    hit('p', 60, 'claws', r.m.key);
    T.ok('once per fight: the next big hit lands', r.p.hp === hp0 - 60, r.p.hp);
    const r2 = arena({ px: 6, py: 6, mx: 4, my: 4, a: { x: 4, y: 5 } });
    const aim = S.combat.nearestEnemy(r2.f.fighters, r2.m);
    T.ok('PARTY: the Between draws the fire (aimed at first)', aim && aim.f === r2.p);
    const r3 = arena({ px: 3, py: 4, mx: 4, my: 4 });
    r3.m.titan = true;
    hit('p', 60, 'claws', r3.m.key); hit('p', 60, 'claws', r3.m.key);
    T.ok('TITAN: against a titan the phase covers every hit from it that round', r3.p.hp === 100, r3.p.hp);
    clearGods();
    ascendVillager(vidA, 'the_between');
    const n = needs(vidA);
    const r4 = arena({ px: 0, py: 0, mx: 4, my: 4, a: { x: 3, y: 4, hp: 30 } });
    hit(r4.A.key, 12, 'claws', r4.m.key);
    T.ok('a villager phases out of a big hit', r4.A.hp === 30);
    T.ok('paid from their belly (+4 hunger)', n.hunger === 14, n.hunger);
  }

  // ================= 6. THE ALL-SEEING: No Lies =================
  T.section('All-Seeing: No Lies');
  {
    clearGods();
    ascendPlayer('all_seeing');
    const r = arena({ px: 2, py: 2, mx: 4, my: 4, a: { x: 4, y: 5, hp: 30 } });
    const k0 = s.kcal;
    T.ok('Read Them Aloud fires', use('no_lies') === true);
    T.ok('it cost 100 kcal', k0 - s.kcal === 100, k0 - s.kcal);
    let missed = 0;
    for (let i = 0; i < 60; i++) { r.A.hp = 30; r.A.alive = true; hit(r.A.key, 5, 'claws', r.m.key); if (r.A.hp === 30) missed++; }
    T.ok('allies slip about half the blows (they hear it called)', missed >= 18 && missed <= 42, missed);
    let landedOnHolder = 0;
    for (let i = 0; i < 20; i++) { r.p.hp = 100; s.health = 100; hit('p', 5, 'claws', r.m.key); if (r.p.hp < 100) landedOnHolder++; }
    T.ok('WEAKNESS: the holder is still fragile (no dodge from the reading)', landedOnHolder >= 15, landedOnHolder);
    r.m.telegraph = { kind: 'direct', turnsLeft: 1, attackName: 'Lunge' };
    T.ok('your strikes on a foe winding up hit x1.5', Math.abs(S.Godpath.damageMult(Game, r.m) - 1.5) < 1e-9);
    // out of a fight: a lie cannot be told to you
    const liar = roster0.filter(id => id !== Game.villagerId).find(id => { const L = Game.npcLies && Game.npcLies(id); return L && Object.keys(L).some(k => L[k] && L[k].told && !L[k].confessed); });
    if (liar) {
      const L = Game.npcLies(liar), k = Object.keys(L).find(x => L[x] && L[x].told && !L[x].confessed);
      delete s._godSightDay; s.kcal = 400;
      T.ok('No Lies cannot see through deception on an empty stomach', Game.lieLive(liar, L[k]) === true);
      s.kcal = 2000; const sightFood = s.kcal;
      T.ok('NO LIES: a villager\'s lie is never live to the All-Seeing', Game.lieLive(liar, L[k]) === false);
      T.ok('daily sight pays food once, before revealing truth', sightFood - s.kcal === 60);
      Game.lieLive(liar, L[k]);
      T.ok('later lies that day do not charge the same faculty twice', sightFood - s.kcal === 60);
      Game.tbfight = null;
      const tr0 = (v.trust || {})[liar] || 0;
      s._godKnown = {};
      quiet(() => GV.godDaily(Game));
      const d = (Game.state.codex.doubts || []).find(x => x.vid === liar && /No Lies/.test((x.evidence || []).join(' ')));
      T.ok('at dawn you know the lie (a doubt with the truth)', !!d);
      T.ok('COST: the liar feels your gaze (-1 trust a day)', ((v.trust || {})[liar] || 0) < tr0 || tr0 === 0, `${tr0} -> ${(v.trust || {})[liar]}`);
    } else T.ok('a liar in the village to test against', false);
    // an ambush that relies on a lie never springs
    const plot = { id: 'p_test', leader: vidB, inviter: vidB, target: Game.villagerId, accomplices: [], tells: [], active: true, sprung: false };
    const res = quiet(() => Game.springAmbush(plot));
    T.ok('NO LIES: an ambush built on a lie never springs', res && res.foiled === true && plot.sprung && !plot.active);
    clearGods();
    ascendVillager(vidA, 'all_seeing');
    needs(vidA);
    const r2 = arena({ px: 3, py: 3, mx: 4, my: 4, a: { x: 5, y: 5 } });
    cast(r2.A);
    T.ok('a villager reads the fight aloud', r2.f._gv && r2.f._gv.truth && r2.f._gv.truth.key === r2.A.key);
    let pm = 0;
    for (let i = 0; i < 40; i++) { r2.p.hp = 100; s.health = 100; hit('p', 5, 'claws', r2.m.key); if (r2.p.hp === 100) pm++; }
    T.ok('...and the player (their ally) slips blows', pm >= 8, pm);
  }

  // ================= 7. THE VOICE OF THE RELAY: Speak and Be Heard =================
  T.section('Voice of the Relay: Speak and Be Heard');
  {
    clearGods();
    ascendPlayer('voice_of_the_relay');
    const g0 = Game.grounding ? Game.grounding() : null;
    const r = arena({ px: 2, py: 2, mx: 5, my: 5, a: { x: 3, y: 3 }, b: { x: 2, y: 3 } });
    const k0 = s.kcal;
    T.ok('Rally Cry fires', use('rally_cry') === true);
    T.ok('every ally is emboldened, next strikes x1.5; every foe hesitates', r.A.rallyBuff >= 2 && r.B.rallyBuff >= 2 && r.m.hesitate >= 1 && r.B._nextStrikes && r.B._nextStrikes.mult === 1.5);
    T.ok('it cost 120 kcal', k0 - s.kcal === 120, k0 - s.kcal);
    T.ok('each word costs grounding', g0 == null || Game.grounding() < g0, `${g0} -> ${Game.grounding && Game.grounding()}`);
    Game.tbfight = null;
    const tA = (v.trust || {})[vidA] || 0, kd = s.kcal;
    T.ok('Be Heard (out of a fight) fires once a day', use('be_heard') === true && use('be_heard') === false);
    T.ok('every Haven villager hears it (+trust) for 150 kcal', ((v.trust || {})[vidA] || 0) > tA && kd - s.kcal === 150);
    const r2 = arena({ px: 2, py: 2, mx: 5, my: 5, a: { x: 3, y: 3 } });
    quiet(() => Game.tbVillagerTurn(r2.A));
    T.ok('...and every fight today starts rallied (the ally\'s first turn)', (r2.A.rallied || 0) >= 2 && r2.A._gvVoiced === true, r2.A.rallied);
    clearGods();
    ascendVillager(vidA, 'voice_of_the_relay');
    needs(vidA);
    const r3 = arena({ px: 0, py: 0, mx: 5, my: 5, a: { x: 3, y: 3 }, b: { x: 2, y: 3 } });
    T.ok('a villager Voice cries the rally on their turn', cast(r3.A) === true && r3.B.rallyBuff >= 2);
    hit(r3.A.key, 999, 'claws', r3.m.key);
    T.ok('WEAKNESS: the Voice falls and the network goes dark (allies stunned)', (r3.B.stunned || 0) >= 1);
  }

  // ================= 8. THE UNKILLABLE: Phoenix =================
  T.section('Unkillable: Phoenix');
  {
    clearGods();
    v.roster = roster0.slice();
    ascendPlayer('unkillable');
    Game.tbfight = null;
    s.kcal = 3000; s.health = 0;
    const live0 = Game.phoenixLivingVillagers().length;
    const ok = quiet(() => Game.maybeCheatDeath('test'));
    T.ok('the player rises out of someone else\'s ash (no clause held)', ok === true && s.health >= 1 && !Game.hasAbility('phoenix_clause'));
    T.ok('a villager burned for it', Game.phoenixLivingVillagers().length === live0 - 1);
    T.ok('it cost 500 kcal', s.kcal === 2500, s.kcal);
    Game.state.phoenixLink = null;
    s.kcal = 520; s.health = 0;
    s.kcal = 300;
    T.ok('WEAKNESS: no fuel, no fire: starving, the death sticks', quiet(() => Game.maybeCheatDeath('test')) === false);
    s.health = 100; s.kcal = 3000;
    clearGods();
    const live = Game.phoenixLivingVillagers();
    const bearer = live[0];
    ascendVillager(bearer, 'unkillable');
    needs(bearer);
    const r = arena({ px: 0, py: 0, mx: 4, my: 4 });
    const fi = { key: 'v_ph', kind: 'villager', villagerId: bearer, name: 'Ph', hp: 30, maxHp: 30, speed: 3, mx: 3, my: 4, alive: true, fled: false, ai: 'brave' };
    r.f.fighters.push(fi); r.f.order.push(fi.key);
    const lv = Game.phoenixLivingVillagers().length;
    hit(fi.key, 999, 'claws', r.m.key);
    T.ok('a villager Unkillable crawls out of the ash (alive at 1 HP, out of the fight)', fi.alive && fi.hp === 1 && fi.fled && (v.roster || []).includes(bearer));
    T.ok('...and someone else burned', Game.phoenixLivingVillagers().length === lv - 1);
    Game.state.phoenixLink = null;
  }

  // ================= 9. THE MARKET GOD =================
  T.section('Market God: Buy Passage, Name Your Price, the Guard');
  {
    clearGods();
    v.roster = roster0.slice();
    ascendPlayer('market_god');
    let r = arena({ px: 3, py: 4, mx: 4, my: 4 });
    const k0 = s.kcal;
    T.ok('Buy Passage fires in the fight grid', use('buy_passage') === true);
    T.ok('the monster takes the coin and leaves', r.m.fled === true);
    T.ok('it cost the wave price (1000) plus the haggle', k0 - s.kcal === 1040, k0 - s.kcal);
    r = arena({ px: 3, py: 4, mx: 4, my: 4 });
    r.m.titan = true;
    T.ok('WEAKNESS: the big ones don\'t haggle (titans refuse)', use('buy_passage') === false && !r.m.fled);
    r = arena({ px: 3, py: 4, mx: 4, my: 4 });
    s.godhood.guardDepletion = [];
    const hp0 = r.p.hp;
    hit('p', 30, 'claws', r.m.key);
    T.ok('the Gilded Guard eats a claw', r.p.hp === hp0);
    hit('p', 30, 'beam', r.m.key);
    T.ok('WEAKNESS: the coins never stop a beam', r.p.hp < hp0);
    Game.tbfight = null;
    const inv0 = (s.inventory || []).length, kn = s.kcal;
    T.ok('Name Your Price (no target: the market picks the weapon you lack)', use('name_price') === true && (s.inventory || []).length === inv0 + 1 && kn > s.kcal);
    T.ok('once a day', use('name_price') === false);
    s.godhood.marketDebt = 3;
    const invA = (s.inventory || []).length;
    quiet(() => GV.godDaily(Game));
    T.ok('dawn: the day verbs refresh and the Audit collects at 3 markers', !((s.godhood.capstoneUsed || {}).namePrice) && (s.godhood.marketDebt || 0) === 0 && (s.inventory || []).length <= invA);
    clearGods();
    ascendVillager(vidA, 'market_god');
    const n = needs(vidA);
    r = arena({ px: 0, py: 0, mx: 4, my: 4, a: { x: 3, y: 4, hp: 8 } });
    T.ok('a villager Market God buys passage when it goes badly', cast(r.A) === true && r.m.fled === true);
    T.ok('paid from their belly (1000 kcal price + the 40 kcal haggle = +42 hunger)', n.hunger === 52, n.hunger);
    r = arena({ px: 0, py: 0, mx: 6, my: 6, a: { x: 3, y: 4, hp: 30 } });
    hit(r.A.key, 20, 'claws', r.m.key);
    T.ok('the villager carries the coins too (a hit absorbed)', r.A.hp === 30, r.A.hp);
  }

  // ================= 10. THE LIVING GARDEN: Feed the Multitude =================
  T.section('Living Garden: Feed the Multitude');
  {
    clearGods();
    v.roster = roster0.slice();
    ascendPlayer('living_garden');
    Game.tbfight = null;
    for (const id of roster0) needs(id, 60);
    s.kcal = 3000;
    T.ok('Feed the Multitude fires out of a fight', use('feed_multitude') === true);
    const living = () => roster0.filter(id => id !== Game.villagerId && (v.roster || []).includes(id) && !((Game.vpOf(id) || {}).dead));
    T.ok('every Haven villager eats their fill', living().length >= 2 && living().every(id => (Game.npcNeeds(id).hunger || 0) === 0), living().map(id => Game.npcNeeds(id).hunger).join(','));
    T.ok('it cost 200 kcal and fed you nothing (does not skip dinner)', s.kcal === 2800, s.kcal);
    T.ok('once a day', use('feed_multitude') === false);
    const r = arena({ px: 2, py: 2, mx: 5, my: 5, a: { x: 3, y: 3 } });
    const blade = { key: 'al_x', kind: 'ally', villagerId: 'blade_from_away', name: 'Blade', hp: 40, maxHp: 40, mx: 3, my: 4, alive: true, fled: false };
    r.f.fighters.push(blade);
    const bm = S.Godpath.villagerStrikeMult(Game, blade, r.m);
    T.ok('PARTY: Haven fights fed (overcharged)', S.Godpath.villagerPowerMult(Game, living()[0]) > 1, living()[0]);
    T.ok('TITAN: a coalition blade from away hits fed too (x1.25)', bm >= 1.25 - 1e-9, bm);
    T.ok('WEAKNESS: not a fighter (your strikes x0.8)', Math.abs(S.Godpath.damageMult(Game, r.m) - 0.8) < 1e-9);
    const r2 = arena({ px: 6, py: 6, mx: 4, my: 4, a: { x: 4, y: 5 } });
    const aim = S.combat.nearestEnemy(r2.f.fighters, r2.m);
    T.ok('WEAKNESS: monsters go for the garden first', aim && aim.f === r2.p);
    clearGods();
    Game.tbfight = null;
    ascendVillager(vidA, 'living_garden');
    // Earlier fatal-refusal scenes can leave this prepared caster dead.
    // A daily god verb requires its actual living person, like other actors.
    Game.getPerson(vidA).dead = false;
    T.ok('Garden daily fixture has a living resident caster', v.roster.includes(vidA) && !Game.getPerson(vidA).dead);
    for (const id of roster0) needs(id, 60);
    v.harvestDay = -1;
    quiet(() => GV.godDaily(Game));
    T.ok('a villager garden feeds Haven at dawn when it is hungry', living().filter(id => id !== vidA).every(id => (Game.npcNeeds(id).hunger || 0) === 0));
    T.ok('...from their own belly, never into it (+8 hunger)', Game.npcNeeds(vidA).hunger === 68, Game.npcNeeds(vidA).hunger);
  }

  T.section('wiring');
  {
    clearGods();
    T.ok('a non-god has no god verbs on the bar', !Game.activatableAbilities().some(a => a.abilityId === 'god'));
    T.ok('a non-god cannot fire one', quiet(() => Game.useAbility('god', 'turn_the_pain')) === false);
    Game.tbfight = null; ascendPlayer('living_garden');
    const oldRoster = v.roster; v.roster = [Game.villagerId]; s.kcal = 2000;
    T.ok('an empty garden action refuses before food is spent', use('feed_multitude') === false && s.kcal === 2000);
    v.roster = oldRoster;

    ascendPlayer('market_god');
    Game.tbfight = null;
    s.godhood.capstoneUsed = { namePrice: true };
    s.health = 100; s.kcal = 3000;
    quiet(() => Game.endDay());
    T.ok('a real endDay runs the dawn god tick (Name Your Price is back)', !Game.over && !((s.godhood.capstoneUsed || {}).namePrice));
  }
  Game.villageFoodTier = _vft;
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
