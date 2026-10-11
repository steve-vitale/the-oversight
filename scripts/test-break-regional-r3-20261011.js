#!/usr/bin/env node
// BREAK-IT REGIONAL r3 2026-10-11 — proof for four catches:
//
//   A. EXPLOIT: the Founding Council's 'pool' choice MINTS the shared
//      granary from thin air. The copy said "each pour 2,000 kcal into one
//      pool" while nobody's pantry moved — 6,000+ kcal of drawable famine
//      food from nothing. Same bug class as the thin-air tribute
//      (their_fields_pay) and the thin-air covenant pours (league_pool_
//      is_real_food), which both debit every fire's own stores. The founding
//      was never swept.
//   B. EXPLOIT+HONESTY: the conceded-crisis copy says "X's pool share halves
//      for four weeks" — but the engine halved HAVEN's share and never
//      touched the member's; counter-accepted terms (2,500 — "every fire
//      pours 2,500") poured 2,000 in the engine (hardcoded 2000 + first-link
//      rate). Copy and engine disagreed on whose food moves.
//   C. CANON+HONESTY: walking from the Binding ('walk') broke the link as a
//      'gambit' (-30 opinion, "broke faith") and NEVER refused the scale —
//      docs/SCALE.md: "the scale is refused with it". A clean walk could
//      re-court and hit national again next season; the beat's own copy
//      ("The door is not shut forever") lied about the permanence. The
//      answerNationalChoice comment even said walk "refuses the scale" —
//      the engine didn't.
//   D. CONSISTENCY: the young-link renegotiation beat wrote link.trust
//      directly, bypassing _trustGain's mourning choke and lastKeptDay
//      stamping (the single choke point every other gain uses).
//
// Run: SEED=11 node scripts/test-break-regional-r3-20261011.js (also 222, 3333)
// Node harness: full src/js/*.js list in index.html order, minus DOM-only
// (app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js). Math.random is
// seeded BEFORE eval (modules capture it at load).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '11', 10);
Math.random = mulberry32(SEED);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global; // equipment.js needs window at LOAD; deleted before play
[
  'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js',
  'src/js/convo-mood.js', 'src/js/convo-wants.js', 'src/js/convo-dialogue.js',
  'src/js/convo-beats.js', 'src/js/convo-scene.js', 'src/js/examine.js',
  'src/js/equipment.js', 'src/js/journal.js', 'src/js/party.js',
  'src/js/party-formal.js', 'src/js/truth.js', 'src/js/contests.js',
  'src/js/broadcast.js', 'src/js/storage.js', 'src/js/perceive.js',
  'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js',
  'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js',
  'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/ledger.js',
  'src/js/villager-agency.js', 'src/js/villager-objectives.js',
  'src/js/codex-people.js', 'src/js/membership.js', 'src/js/hierarchy.js',
  'src/js/comms.js', 'src/js/safetynets.js', 'src/js/debug-scenarios.js',
  'src/js/build.js',
].forEach(f => eval(fs.readFileSync(path.join(ROOT, f), 'utf8')));
delete global.window; // sync combat path, per harness lessons
const Game = globalThis.Scattering.Game;

const says = [];
const osay = Game.say.bind(Game);
Game.say = (t) => { says.push(String(t)); return osay(t); };
function saidHas(re) { return says.some(t => re.test(t)); }
function saidClear() { says.length = 0; }

let failures = 0, passes = 0;
function ok(cond, label) {
  if (cond) { passes++; console.log(`  PASS ${label}`); }
  else { failures++; console.log(`  FAIL ${label}`); }
}
function pantryKcal() {
  return (Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}
function stockPantry(kcal) {
  var v = Game.state.village || {}; v.pantry = v.pantry || [];
  v.pantry.push({ name: 'Test grain', kcalEach: kcal, units: 1, spoilDay: (Game.state.scholar || {}).day + 30 });
}

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  try { Game.depart(); } catch (e) {}
  Game.state.scholar.day = 100;
  var day = 100;

  var ovs = (Game.state.otherVillages || []).filter(v => v && v.id !== 'haven');
  // top up to 4 fires deterministically — the generator makes 3–4 and the
  // league needs 3 + a courtship fire for the walk test
  var vi = 0;
  while (ovs.length < 4) {
    var nid = 'testfire_' + (vi++);
    if (ovs.some(v => v.id === nid)) continue;
    var nv = { id: nid, name: 'Testfire ' + vi, x: 1, y: 1, day: 0,
      population: 10, pantryKcal: 20000, knowledge: 2, generated: true, rumored: true,
      roster: [{ id: 'tspk' + vi, name: 'Test Speaker ' + vi, alive: true }] };
    Game.state.otherVillages.push(nv);
    ovs.push(nv);
  }
  ovs.forEach((v, i) => {
    v.generated = true; v.opinion = 50; v.rumored = true;
    v.roster = [{ id: 'spk' + i, name: 'Speaker ' + i, alive: true }];
    v.pantryKcal = 20000;
  });
  var A = ovs[0], B = ovs[1], C = ovs[2], D = ovs[3];
  stockPantry(60000);

  console.log('== A. the founding pour must come from real stores ==');
  var cA = Game._formPeerLink(A.id, { kind: 'covenant' });
  var cB = Game._formPeerLink(B.id, { kind: 'covenant' });
  var cC = Game._formPeerLink(C.id, { kind: 'covenant' });
  var hbA = pantryKcal();
  var poolBefore = Game.leaguePool();
  Game.state.pendingNational = { shape: 'covenant', villages: ['haven', A.id, B.id, C.id], day: day };
  saidClear();
  Game.answerNationalChoice('pool');
  var poolDelta = Game.leaguePool() - poolBefore;
  var havenDelta = hbA - pantryKcal();
  console.log(`  pool +${Math.round(poolDelta)}; haven pantry -${Math.round(havenDelta)}; A/B/C pantries now ${[A, B, C].map(v => Math.round(v.pantryKcal)).join('/')}`);
  ok(Math.round(havenDelta) === 2000, 'Haven poured its 2,000 founding share from the pantry (not minted)');
  ok([A, B, C].every(v => Math.round(v.pantryKcal) === 18000), 'each other fire poured 2,000 from its own stores');
  ok(Math.round(poolDelta) === 8000, 'the pool holds exactly what was poured (2,000 x 4 fires), no minting');
  ok([cA, cB, cC].every(l => l.poolLive === true), 'the pool is live on every covenant bond');
  ok(Game.leaguePool() === Math.round(poolDelta), 'pool balance equals real pours');

  console.log('== A2. founding shortfalls are said aloud, never minted ==');
  // a thin fire pours what it has; the gap is counted, not conjured
  B.pantryKcal = 500;
  var poolBefore2 = Game.leaguePool();
  var hbA2 = pantryKcal();
  Game.state.pendingNational = { shape: 'covenant', villages: ['haven', A.id, B.id, C.id], day: day };
  saidClear();
  Game.answerNationalChoice('pool');
  var poolDelta2 = Game.leaguePool() - poolBefore2;
  console.log(`  pool +${Math.round(poolDelta2)} (B poured 500 of 2,000)`);
  ok(Math.round(B.pantryKcal) === 0, 'the thin fire poured everything it had');
  ok(Math.round(poolDelta2) === (hbA2 - pantryKcal()) + 2000 + 500 + 2000, 'pool grew only by actual pours');
  ok(saidHas(/poured short|short/i), 'the shortfall was said aloud');
  ok(cB.trust < 100, 'the short fire felt it in trust');

  console.log('== B. a conceded crisis halves THE MEMBER\'s share, not Haven\'s ==');
  saidClear();
  Game.covenantCrisis(cA.id, 'strain');
  var crisisRes = Game.answerCovenantCrisis(cA.id, 'concede');
  ok(crisisRes === 'conceded', 'crisis conceded');
  ok((cA.concessionUntil || 0) > day, 'concession window set on the member link');
  ok(saidHas(/pool share halves/i), 'concede copy names the member\'s share halving');
  A.pantryKcal = 20000; B.pantryKcal = 20000; C.pantryKcal = 20000;
  var hbB = pantryKcal();
  var poolBeforeB = Game.leaguePool();
  Game.state._leaguePoolWeek = -1; // force this week's pour
  Game.covenantTick(cA);
  var havenPaidB = hbB - pantryKcal();
  var aPaid = 20000 - A.pantryKcal, bPaid = 20000 - B.pantryKcal, cPaid = 20000 - C.pantryKcal;
  var poolDeltaB = Game.leaguePool() - poolBeforeB;
  console.log(`  haven -${Math.round(havenPaidB)}; A -${Math.round(aPaid)} (conceded); B -${Math.round(bPaid)}; C -${Math.round(cPaid)}; pool +${Math.round(poolDeltaB)}`);
  ok(Math.round(havenPaidB) === 2000, 'Haven still pours its FULL 2,000 while a member is conceded');
  ok(Math.round(aPaid) === 1000, 'the conceded member pours 1,000 (halved) — not Haven');
  ok(Math.round(bPaid) === 2000 && Math.round(cPaid) === 2000, 'unconceded members pour full shares');
  ok(Math.round(poolDeltaB) === Math.round(havenPaidB + aPaid + bPaid + cPaid), 'pool grew by actual pours only');

  console.log('== B2. counter-accepted terms (2,500) are league-wide ==');
  cB.poolKcalPerWeek = 2500; // counter accepted: "every fire pours 2,500"
  ok(Game._leaguePoolRate() === 2500, '_leaguePoolRate() reads the max bond rate (2,500)');
  Game.state.scholar.day = day + 7; // next week
  A.pantryKcal = 20000; B.pantryKcal = 20000; C.pantryKcal = 20000;
  var hbB2 = pantryKcal();
  Game.covenantTick(cA);
  var havenPaid2 = hbB2 - pantryKcal();
  var bPaid2 = 20000 - B.pantryKcal;
  console.log(`  haven -${Math.round(havenPaid2)}; B -${Math.round(bPaid2)} at league rate 2,500`);
  ok(Math.round(havenPaid2) === 2500, 'Haven pours 2,500 at counter terms (not the old first-link 2,000)');
  ok(Math.round(bPaid2) === 2500, 'members pour 2,500 at counter terms (not the old hardcoded 2,000)');

  console.log('== C. walking from the Binding refuses the scale with it ==');
  saidClear();
  var blink = Game._formLink(D.id, { asSubordinate: true, tributeKcalPerWeek: 4000 }, null);
  var opBefore = D.opinion;
  Game.state.pendingNational = { shape: 'belong', primary: D.id, villages: ['haven', D.id], day: Game.state.scholar.day };
  var walkRes = Game.answerNationalChoice('walk');
  console.log(`  walk -> ${walkRes}; opinion ${opBefore} -> ${D.opinion}; scaleRefused=${Game.state.scaleRefused}`);
  ok(walkRes === 'walked', 'walk resolves as a walk');
  ok(blink.status === 'broken', 'the link is broken');
  ok(Math.round(D.opinion) === Math.round(opBefore) - 10, 'a clean walk costs -10 opinion, not the gambit\'s -30');
  ok(Game.state.scaleRefused === true, 'the scale is refused WITH the walk (docs/SCALE.md)');
  ok(Game.state.scaleRefusedShape === 'belong', 'the refusal records the belong shape');
  ok(saidHas(/permanently|withdrawn/i), 'the permanence is said aloud');
  ok(!saidHas(/not shut forever/i), 'the old "not shut forever" lie is gone');
  // the offer must not return: a qualifying polity stages nothing now
  Game._checkNational();
  ok(!Game.state.pendingNational, 'no new national beat stages after the refusal (the offer does not return)');

  console.log('== D. the grief beat feeds trust through _trustGain ==');
  var glink = Game._formLink(D.id, { asSubordinate: true, tributeKcalPerWeek: 4000 }, null);
  glink.day = Game.state.scholar.day; // young link: the grace path
  saidClear();
  var scRes = Game.successionCrisis(glink.id);
  ok(scRes === 'grace', 'young link gets the staged renegotiation beat');
  ok(!!glink.pendingRenegotiation, 'beat staged');
  var trustBefore = glink.trust;
  var arRes = Game.answerRenegotiation(glink.id, 'gift');
  ok(arRes === 'gift', 'gift answered');
  ok(glink.trust === trustBefore + 8, 'gift grants +8 through the choke');
  ok(glink.lastKeptDay === Game.state.scholar.day, 'the gesture stamps lastKeptDay (the link is fed)');
  // and the mourning choke is single: a mourning link gains nothing
  var glink2 = Game._formLink(D.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  glink2.day = Game.state.scholar.day;
  Game.successionCrisis(glink2.id);
  glink2.mourningUntil = Game.state.scholar.day + 7;
  var t2b = glink2.trust;
  Game.answerRenegotiation(glink2.id, 'gift');
  ok(glink2.trust === t2b, 'mourning blocks the beat\'s gain — the choke is single');

  console.log('== E. copy/engine honesty (static) ==');
  var hierSrc = fs.readFileSync(path.join(ROOT, 'src/js/hierarchy.js'), 'utf8');
  ok(/how === 'walked'/.test(hierSrc), 'breakLink handles the walked parting');
  ok(!/found the shared POOL \(2,000 kcal a week/.test(hierSrc), 'no hardcoded 2,000 in the council staging copy');
  ok(typeof Game._leaguePoolRate === 'function', '_leaguePoolRate is live on Game');
  ok(typeof Game.polityNews === 'function' && typeof Game.worldFeed === 'function', 'polityNews/worldFeed exist');
  ok(/this\.polityNews\(\)/.test(hierSrc) && /this\.worldFeed\(\)/.test(hierSrc), 'polityNews/worldFeed are called from hierarchyDaily (wired, not dead)');

  console.log(`\n${passes} passed, ${failures} failed (seed ${SEED})`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('HARNESS CRASH:', e); process.exit(2); });
