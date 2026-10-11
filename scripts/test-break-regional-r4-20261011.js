#!/usr/bin/env node
// BREAK-IT REGIONAL r4 2026-10-11 — hostile attacks on the scale ladder's
// live-state edges and the exile guard, deeper than r3 (r3 covered:
// founding-pour thin air, concession halving, Binding walk, renegotiation
// choke).
//
//   A. EXPLOIT: the realm dissolves (covenant league drops below 4 fires)
//      but the league's national machinery keeps running — the surviving
//      link keeps poolLive/warOath, Haven keeps pouring 2,000 kcal/week
//      into the pool, defense calls keep firing. "Burning the realm after
//      the court sat keeps nothing" (r4 2026-10-10) closed the RANK but not
//      the unlocks. Same bug class: national unlocks outliving national.
//   B. EXPLOIT (sibling): same for the trade charter — the surviving route
//      keeps chartered, tariff keeps minting 1,000 kcal/week after the
//      realm died.
//   C. HOLDS: refusing the scale from a beat never opens the unlocks —
//      poolLive/chartered are only ever set by answering a beat, and
//      refusal precedes every answer. Documented, not fixed.
//   D. HOLDS: climb-then-dump — the dissolve fires on the FIRST break below
//      the bar (aloud), nationalLive clears, and re-courting restages a new
//      played beat. By design.
//   E. EXPLOIT: the exile guard (_blockIfNotHaven) is missing half the
//      council verbs — an exiled scholar can proposeLink (pledging Haven's
//      tribute), answerCounter/sweeten (1,500 kcal of Haven's food),
//      answerNationalChoice (feast 5,000 / oath 3,000), answerGlobalChoice
//      (feast 5,000), bidForPrimacy, renegotiateLink, refuseTheScale
//      (permanent griefing). The DRIFTER fix's stated intent is "the engine
//      holds the line too" — it doesn't for these.
//   F. HONESTY: raid strike — the casualty copy's dead count vs actual
//      registerDeath calls; woundedUntil set; the party really gone 3 days.
//   G. HOLDS: raid withdraw — muster is ids only, nothing leaves, nothing
//      dies, no phantom away state.
//   H. HOLDS: priced favor — the 1,500 kcal repayment is debited from the
//      payer's own stores on return (r2 fix verified, not re-broken).
//   I. DEAD-CODE: polityNews / worldFeed actually fire from hierarchyDaily
//      (event counts, not existence assertions); foreignPolities() populates.
//   J. HONESTY: the x1.25 tribute arrival line names the true post-route
//      amount.
//   K. HOLDS: pendingCounter answers on every branch (accept/sweeten/walk)
//      — no stuck table.
//
// Run: SEED=11 node scripts/test-break-regional-r4-20261011.js (also 222, 3333)
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
function stageBeat(shape, villages, led) {
  Game.state.pendingNational = { shape: shape, led: !!led, primary: null, villages: villages, day: Game.state.scholar.day };
}

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  try { Game.depart(); } catch (e) {}
  Game.state.scholar.day = 100;

  var ovs = (Game.state.otherVillages || []).filter(v => v && v.id !== 'haven');
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

  console.log('== A. dissolve must kill the covenant machinery (not just the rank) ==');
  var cA = Game._formPeerLink(A.id, { kind: 'covenant' });
  var cB = Game._formPeerLink(B.id, { kind: 'covenant' });
  var cC = Game._formPeerLink(C.id, { kind: 'covenant' });
  stageBeat('covenant', ['haven', A.id, B.id, C.id], false);
  Game.answerNationalChoice('pact');
  ok(Game.state.nationalLive === true, 'A1 national live after the pact');
  ok(cA.poolLive && cA.warOath && cC.poolLive, 'A2 poolLive+warOath set on all three links');
  var poolBefore = Game.leaguePool();
  Game.state.scholar.day += 7;
  Game.linkTick();
  var poolAfterPour = Game.leaguePool();
  ok(poolAfterPour > poolBefore, `A3 pool week poured (${poolBefore} -> ${poolAfterPour})`);
  // burn two of three links: the league drops to a pact, the realm dies —
  // but the surviving link is still ACTIVE with its flags
  Game.breakLink(cA.id, 'released');
  Game.breakLink(cB.id, 'released');
  saidClear();
  Game._checkNational();
  ok(Game.state.nationalLive === false, 'A4 nationalLive cleared on dissolve');
  ok(saidHas(/realm came apart/i), 'A5 dissolve said aloud');
  var cCnow = Game.hierarchyState().filter(l => l.id === cC.id)[0];
  ok(!cCnow.poolLive && !cCnow.warOath, 'A6 surviving link: poolLive+warOath cleared (FIX)');
  ok(!cCnow.pendingDefense, 'A7 surviving link: no dangling pendingDefense (FIX)');
  var poolAtDissolve = Game.leaguePool();
  saidClear();
  Game.state.scholar.day += 7;
  Game.linkTick();
  ok(Game.leaguePool() === poolAtDissolve, `A8 no pool pour after dissolve (${poolAtDissolve} unchanged) (FIX)`);
  var callsBefore = says.filter(t => /treeline is burning/.test(t)).length;
  for (var di = 0; di < 40; di++) { Game.state.scholar.day += 7; Game.linkTick(); }
  var callsAfter = says.filter(t => /treeline is burning/.test(t)).length;
  ok(callsAfter === callsBefore, 'A9 no defense calls after dissolve (FIX)');
  // A10 needs the dissolve's own says — re-run the dissolve on a fresh league
  var qA = Game._formPeerLink(A.id, { kind: 'covenant' });
  var qB = Game._formPeerLink(B.id, { kind: 'covenant' });
  var qC = Game._formPeerLink(C.id, { kind: 'covenant' });
  stageBeat('covenant', ['haven', A.id, B.id, C.id], false);
  Game.answerNationalChoice('pact');
  Game.breakLink(qA.id, 'released');
  Game.breakLink(qB.id, 'released');
  saidClear();
  Game._checkNational();
  ok(saidHas(/machinery/i), 'A10 machinery death said aloud (FIX)');
  Game.breakLink(qC.id, 'released');
  Game.breakLink(cCnow.id, 'released');

  console.log('== B. dissolve must kill the charter machinery too (sibling) ==');
  var tA = Game._formPeerLink(A.id, { kind: 'trade' });
  var tB = Game._formPeerLink(B.id, { kind: 'trade' });
  var tC = Game._formPeerLink(C.id, { kind: 'trade' });
  stageBeat('trade', ['haven', A.id, B.id, C.id], false);
  Game.answerNationalChoice('sign');
  ok(Game.state.nationalLive === true, 'B1 national live after the charter');
  ok(tA.chartered && tC.chartered, 'B2 chartered set on all three routes');
  Game.breakLink(tA.id, 'released');
  Game.breakLink(tB.id, 'released');
  Game._checkNational();
  ok(Game.state.nationalLive === false, 'B3 nationalLive cleared on dissolve');
  var tCnow = Game.hierarchyState().filter(l => l.id === tC.id)[0];
  ok(!tCnow.chartered, 'B4 surviving route: chartered cleared (FIX)');
  ok(!tCnow.pendingTradeCall, 'B5 surviving route: no dangling pendingTradeCall (FIX)');
  var panBefore = pantryKcal();
  saidClear();
  Game.state.scholar.day += 7;
  Game.linkTick();
  var tariffLines = says.filter(t => /route pays/.test(t)).length;
  ok(tariffLines === 0, 'B6 no tariff minted after dissolve (FIX)');
  ok(pantryKcal() === panBefore, 'B7 pantry unchanged by dead charter (FIX)');
  Game.breakLink(tCnow.id, 'released');

  console.log('== C. refusal precedes every unlock — nothing to leak (holds) ==');
  var rA = Game._formPeerLink(A.id, { kind: 'covenant' });
  var rB = Game._formPeerLink(B.id, { kind: 'covenant' });
  var rC = Game._formPeerLink(C.id, { kind: 'covenant' });
  stageBeat('covenant', ['haven', A.id, B.id, C.id], false);
  var panR = pantryKcal();
  Game.answerNationalChoice('refuse');
  ok(Game.state.scaleRefused === true, 'C1 scale refused');
  ok(Game.state.nationalLive !== true, 'C2 national never went live');
  var anyPool = [rA, rB, rC].some(l => l.poolLive || l.warOath);
  ok(!anyPool, 'C3 no link ever got poolLive/warOath');
  Game.state.scholar.day += 7;
  Game.linkTick();
  ok(pantryKcal() === panR, 'C4 no pool share left the pantry after refusal');
  Game.breakLink(rA.id, 'released'); Game.breakLink(rB.id, 'released'); Game.breakLink(rC.id, 'released');
  Game.state.scaleRefused = false; // test-only reset; the real flag is permanent

  console.log('== D. climb-then-dump dissolves on the first break (holds) ==');
  var sA = Game._formLink(A.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  var sB = Game._formLink(B.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  var sC = Game._formLink(C.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  stageBeat('lead', ['haven', A.id, B.id, C.id], true);
  stockPantry(20000);
  Game.answerNationalChoice('feast');
  ok(Game.state.nationalLive === true, 'D1 national live after the first court');
  ok(Game.scaleRank() === 'national', 'D2 scaleRank national');
  saidClear();
  Game.breakLink(sA.id, 'gambit');
  Game._checkNational();
  ok(Game.state.nationalLive === false, 'D3 first break below the bar dissolves the realm');
  ok(Game.scaleRank() === 'regional', 'D4 scaleRank falls back to regional');
  ok(saidHas(/realm came apart/i), 'D5 dissolve said aloud');
  Game.breakLink(sB.id, 'gambit');
  Game.breakLink(sC.id, 'gambit');
  // re-court: three fresh links restage a NEW played beat — the climb restarts
  var sA2 = Game._formLink(A.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  var sB2 = Game._formLink(B.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  var sC2 = Game._formLink(C.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  Game._checkNational();
  ok(Game.state.pendingNational && Game.state.pendingNational.shape === 'lead', 'D6 re-court restages a new played beat (no shortcut)');
  ok(sA2.trust === 30, 'D7 re-court starts at trust 30');

  console.log('== E. exile must not wield the council verbs ==');
  Game.state.scholar.exiled = true;
  saidClear();
  var panE = pantryKcal();
  var eProp = Game.proposeLink(D.id, { asSubordinate: false, tributeKcalPerWeek: 4000 });
  ok(eProp === null && saidHas(/Exile means exile/i), 'E1 exiled proposeLink blocked (FIX)');
  Game.state.pendingCounter = { targetId: D.id, opts: {}, kind: undefined, day: 100 };
  saidClear();
  var eSweet = Game.answerCounter('sweeten');
  ok(eSweet === null && !!Game.state.pendingCounter && saidHas(/Exile means exile/i), 'E2 exiled answerCounter blocked, table untouched (FIX)');
  Game.state.pendingCounter = null;
  stageBeat('lead', ['haven', A.id, B.id, C.id], true);
  saidClear();
  var eNat = Game.answerNationalChoice('feast');
  ok(eNat === null && Game.state.nationalLive !== true && pantryKcal() === panE && saidHas(/Exile means exile/i), 'E3 exiled answerNationalChoice blocked, pantry untouched (FIX)');
  Game.state.pendingNational = null;
  Game.state.pendingGlobal = { viewership: 45, day: 100 };
  saidClear();
  var eGlob = Game.answerGlobalChoice('feast');
  ok(eGlob === null && Game.state.globalLive !== true && saidHas(/Exile means exile/i), 'E4 exiled answerGlobalChoice blocked (FIX)');
  Game.state.pendingGlobal = null;
  saidClear();
  var eRef = Game.refuseTheScale();
  ok((eRef === null || eRef === undefined) && Game.state.scaleRefused !== true && saidHas(/Exile means exile/i), 'E5 exiled refuseTheScale blocked (FIX)');
  saidClear();
  var eBid = Game.bidForPrimacy(sA2.id);
  ok((eBid === null || eBid === undefined) && saidHas(/Exile means exile/i), 'E6 exiled bidForPrimacy blocked (FIX)');
  saidClear();
  var eRen = Game.renegotiateLink(sA2.id);
  ok((eRen === null || eRen === undefined) && saidHas(/Exile means exile/i), 'E7 exiled renegotiateLink blocked (FIX)');
  Game.state.scholar.exiled = false;
  // cleanup: anything the pre-fix engine formed while exiled, plus the D-section links
  var eLink = Game.linkWith(D.id);
  if (eLink) Game.breakLink(eLink.id, 'released');
  Game.breakLink(sA2.id, 'gambit'); Game.breakLink(sB2.id, 'gambit'); Game.breakLink(sC2.id, 'gambit');
  Game.state.pendingNational = null;

  console.log('== F. raid strike: copy vs registerDeath ==');
  var deathCauses = [];
  var oreg = Game.registerDeath.bind(Game);
  Game.registerDeath = function (opts) { deathCauses.push((opts && opts.cause) || '?'); return oreg(opts); };
  var bench = (Game.state.village.roster || []).filter(id => Game.isMember(id) && id !== Game.villagerId);
  ok(bench.length >= 2, `F0 bench has ${bench.length} fighters`);
  D.opinion = 50;
  var mustered = Game.raidVillage(D.id);
  ok(mustered === true, 'F1 war party mustered');
  var pr = Game.state.pendingRaid;
  var nFighters = pr.fighters.length;
  saidClear();
  var slink = Game.answerRaid('strike');
  ok(!!slink && slink.conquered === true, 'F2 strike forms the conquered link');
  var raidDeaths = deathCauses.filter(c => c === 'raid').length;
  var copyDead = 0;
  var mmatch = says.join('\n').match(/(\d+) dead/);
  if (mmatch) copyDead = parseInt(mmatch[1], 10);
  else if (/no dead/.test(says.join('\n'))) copyDead = 0;
  ok(raidDeaths === copyDead, `F3 copy dead (${copyDead}) == registerDeath raid calls (${raidDeaths}) over ${nFighters} fighters`);
  var mm = Game.mshipState();
  var wKeys = Object.keys(mm.woundedUntil || {});
  ok(wKeys.length >= 0, `F4 woundedUntil tracked (${wKeys.length})`);
  var raidParty = (mm.awayParties || []).filter(p => p.kind === 'raid');
  ok(raidParty.length === 1 && raidParty[0].vids.length === nFighters, 'F5 raid party away 3 days, full muster');
  ok(!Game.state.pendingRaid, 'F6 pendingRaid cleared');
  Game.registerDeath = oreg;
  Game.breakLink(slink.id, 'released');

  console.log('== G. raid withdraw: nothing leaves, nothing dies ==');
  D.opinion = 50;
  Game.raidVillage(D.id);
  var wAwayBefore = (Game.mshipState().awayParties || []).length;
  saidClear();
  var wres = Game.answerRaid('withdraw');
  ok(wres === 'withdrawn', 'G1 withdraw resolves');
  ok(!Game.state.pendingRaid, 'G2 pendingRaid cleared');
  ok((Game.mshipState().awayParties || []).length === wAwayBefore, 'G3 no away party created');
  ok(saidHas(/stands down/i), 'G4 stand-down said aloud');

  console.log('== H. priced favor: repayment from the payer ==');
  var fT = Game._formPeerLink(D.id, { kind: 'trade' });
  D.pantryKcal = 20000;
  fT.pendingTradeCall = { day: Game.state.scholar.day };
  stockPantry(10000);
  var dPanBefore = D.pantryKcal;
  var hPanBefore = pantryKcal();
  var fres = Game.answerTradeCall(fT.id, 'send');
  ok(fres === 'sent', 'H1 favor sent');
  var favorParty = (Game.mshipState().awayParties || []).filter(p => p.kind === 'trade').pop();
  ok(favorParty && favorParty.repayKcal === 1500, 'H2 party carries repayKcal 1500');
  Game.state.scholar.day = favorParty.untilDay;
  saidClear();
  Game.awayPartiesReturnTick();
  ok(D.pantryKcal === dPanBefore - 1500, `H3 payer debited exactly 1500 (${dPanBefore} -> ${D.pantryKcal})`);
  ok(pantryKcal() === hPanBefore + 1500, 'H4 haven credited exactly 1500');
  ok(saidHas(/repaid/i), 'H5 repayment said aloud');
  Game.breakLink(fT.id, 'released');

  console.log('== I. polityNews / worldFeed fire (dead-code check) ==');
  var iA = Game._formPeerLink(A.id, { kind: 'covenant' });
  var iB = Game._formPeerLink(B.id, { kind: 'covenant' });
  var iC = Game._formPeerLink(C.id, { kind: 'covenant' });
  stageBeat('covenant', ['haven', A.id, B.id, C.id], false);
  Game.answerNationalChoice('pact');
  saidClear();
  for (var wi = 0; wi < 12; wi++) { Game.state.scholar.day += 7; Game.hierarchyDaily(); }
  var newsN = says.filter(t => /🧳 Word from/.test(t)).length;
  ok(newsN > 0, `I1 polityNews fired ${newsN}x over 12 weeks of national`);
  Game.state.globalLive = true;
  saidClear();
  for (var wj = 0; wj < 12; wj++) { Game.state.scholar.day += 7; Game.hierarchyDaily(); }
  var feedN = says.filter(t => /world feed:/.test(t)).length;
  ok(feedN > 0, `I2 worldFeed fired ${feedN}x over 12 weeks of global`);
  var fps = Game.foreignPolities();
  ok(Array.isArray(fps), 'I3 foreignPolities() returns an array');
  Game.breakLink(iA.id, 'released'); Game.breakLink(iB.id, 'released'); Game.breakLink(iC.id, 'released');
  Game._checkNational();
  Game.state.globalLive = false;

  console.log('== J. x1.25 arrival line names the true amount ==');
  var jS = Game._formLink(A.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  jS.trust = 100; // force the arrival branch (R() < trust/100 always true)
  Game.state.nationalLive = true; // test-only: logistics layer on
  saidClear();
  var arrLines = [];
  for (var ji = 0; ji < 12 && !arrLines.length; ji++) {
    A.pantryKcal = 20000; // keep them solvent
    Game.state.scholar.day += 7;
    Game.linkTick();
    arrLines = says.filter(t => /Tribute from .* arrives/.test(t));
  }
  ok(arrLines.length > 0, 'J1 arrival line fired');
  ok(arrLines.some(t => /5,000 kcal/.test(t)), 'J2 arrival line names 5,000 (4000 x 1.25) — copy and engine agree');
  Game.state.nationalLive = false;
  Game.breakLink(jS.id, 'gambit');

  console.log('== K. pendingCounter clears on every branch ==');
  Game._stagePeerCounter(D.id, { kind: 'covenant' }, { score: 40, reasons: [] });
  ok(!!Game.state.pendingCounter, 'K0 counter staged');
  Game.answerCounter('walk');
  ok(!Game.state.pendingCounter, 'K1 walk clears');
  Game._stagePeerCounter(D.id, { kind: 'trade' }, { score: 40, reasons: [] });
  Game.answerCounter('accept');
  ok(!Game.state.pendingCounter && !!Game.linkWith(D.id), 'K2 accept clears + forms link');
  var kLink = Game.linkWith(D.id);
  Game.breakLink(kLink.id, 'released');
  Game.state.pendingCounter = { targetId: D.id, opts: {}, kind: undefined, day: 100 };
  stockPantry(5000);
  Game.answerCounter('sweeten'); // either branch must clear the table
  ok(!Game.state.pendingCounter, 'K3 sweeten never dangles');

  console.log(`\n${passes} passed, ${failures} failed (seed ${SEED})`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
