#!/usr/bin/env node
// BLITZ-SCALEDISC PROOF (2026-10-13): in-world discovery of the scale ladder.
// Steve's gap: 128 days of competent play produced zero mentions of
// regional/national — villages die never knowing the wider world exists.
// Scale transitions must be FELT as moments, not crossed as thresholds.
//
// What this proves:
//   (a) a thriving village receives in-world pointers toward regional/national
//       (traveler word, villager mention, System producer nudges, audience
//       whisper) — discovery events fire in sim;
//   (b) the transition moment fires on the first real step (first link):
//       System announcement + village reaction, a beat not a notification;
//   (c) a struggling/early village does NOT get the pitch (gating holds);
//   (d) sense-test: every discovery line is read — a moment, not a
//       notification; no mechanics jargon leaks ("scaleRank", "unlock",
//       "Wave 4", checklists).
//
// RED-verified: fails on pristine (no scaleDiscovery API), green after build.
// Run: node scripts/test-blitz-scaledisc.js (SEED env override)
const assert = require('assert');
const H = require('./sim-harness');
const SEED = parseInt(process.env.SEED || '424242', 10);
let Game, says = [], discLines = [], inDiscovery = false;
const clearSays = () => { says = []; discLines = []; };
function installObservers() {
  const say = Game.say;
  Game.say = function (t) {
    const text = String(t); says.push(text); if (inDiscovery) discLines.push(text);
    return say.call(this, t);
  };
  for (const name of ['scaleDiscoveryDaily', '_sdFirstAccordMoment']) {
    const original = Game[name];
    Game[name] = function (...args) {
      inDiscovery = true;
      try { return original.apply(this, args); } finally { inDiscovery = false; }
    };
  }
}

let failures = 0;
function ok(cond, label) {
  if (cond) { console.log(`  PASS ${label}`); }
  else { failures++; console.log(`  FAIL ${label}`); }
}
const setDay = (d) => { Game.state.scholar.day = d; };
const day = () => Game.state.scholar.day || 0;

// pantry helpers: thriving = 2+ days of food at 2000 kcal/day/villager
function livingCount() {
  try {
    const ids = Game.npcIds ? Game.npcIds() : [];
    return Math.max(1, ids.length);
  } catch (e) { return 12; }
}
function setPantry(days) {
  const v = Game.state.village;
  v.pantry = [];
  const kcal = Math.round(livingCount() * 2000 * days);
  if (kcal > 0) v.pantry.push({ id: 'grain', name: 'grain', kcalEach: kcal, units: 1, spoilDay: 9999 });
}
function pantryKcal() { try { return Game.pantryKcal(); } catch (e) { return 0; } }

async function freshGame() {
  await H.setupGame(Game);
  Game.state.systemArrived = true; // System present (integration stage 1+)
  clearSays();
}

function otherVillages() {
  return (Game.state.otherVillages || []).filter(v => v && v.id !== 'haven');
}
function runDiscoveryDays(fromDay, toDay, conceptsOnly = false) {
  for (let d = fromDay; d <= toDay; d++) {
    setDay(d);
    Game.scaleDiscoveryDaily();
    if (Game.scaleDiscovery().region && Game.scaleDiscovery().realm &&
        (conceptsOnly || Game.scaleDiscovery().table)) break;
  }
}
function sd() { return Game.scaleDiscovery(); }
// Prepared capability, not a naturally progressed campaign. Use actual
// people, item definitions, counter learning and attributed kill receipts.
function prepareReadiness(w3) {
  const demand = Game.standingCfg().readyDemand[4], v = Game.state.village;
  const n = Math.max(demand.armored, demand.armed, demand.veterans);
  const ids = v.roster.filter(id => id !== Game.villagerId && Game.vpOf(id) &&
    !Game.vpOf(id).dead && ((v.health || {})[id] ?? 100) > 0).slice(0, n);
  assert.equal(ids.length, n, 'actual living villagers for prepared capability');
  const eq = globalThis.Scattering.equipment;
  const armor = Game.data.items.find(d => d.armor?.protection >= demand.armorP && eq.slotForItem(d) === 'torso');
  const weapon = Game.data.items.find(d => d.weapon && eq.slotForItem(d) === 'melee');
  assert(armor && weapon, 'actual worn armor and melee definitions');
  for (const id of ids) {
    const vp = Game.vpOf(id); vp.items = [weapon.id, armor.id];
    vp.equipped = { melee: { itemId: weapon.id }, torso: { itemId: armor.id } };
  }
  const counters = Game.data.monsters.filter(m => m.wave === 1 && m.counter).slice(0, demand.tricks);
  assert.equal(counters.length, demand.tricks);
  for (const m of counters) Game.discoverMonsterCounter(m.id, 'taught');
  for (let i = 0; i < demand.veterans; i++) Game.recordWaveKill(w3[i], ids[i], 'prepared-discovery');
  const rd = Game.waveUnlockReady(4);
  ok(rd.ready && rd.armored >= demand.armored && rd.armed >= demand.armed &&
    rd.tricks >= demand.tricks && rd.veterans >= demand.veterans,
    'actual prepared armor/weapons/knowledge/veterans satisfy readiness');
  console.log('READINESS_RECEIPT ' + JSON.stringify({ ids, armor: armor.id, weapon: weapon.id,
    counters: counters.map(m => m.id), readiness: rd, raw: Game.villageStanding(), released: Game.villageStandingTotal() }));
}


(async () => {
  const loaded = await H.loadGame({ seed: SEED, mode: 'scale-discovery-proof', narration: true });
  Game = loaded.Game;
  ok(loaded.loadFails.length === 0, 'all production modules load through the shared harness');
  installObservers();
  // ---------- RED GATE ----------
  console.log('== RED gate: the API must exist ==');
  const hasDaily = typeof Game.scaleDiscoveryDaily === 'function';
  const hasRead = typeof Game.scaleDiscovery === 'function';
  ok(hasDaily, 'Game.scaleDiscoveryDaily() exists');
  ok(hasRead, 'Game.scaleDiscovery() exists');
  if (!hasDaily || !hasRead) {
    console.log('\nRED: scale-discovery API absent on this tree — feature not built.');
    process.exit(1);
  }

  // ---------- (a) thriving village hears the ladder ----------
  console.log('== (a) thriving village receives pointers ==');
  await freshGame();
  setPantry(30); // well-fed: travelers linger, villagers talk
  runDiscoveryDays(20, 200, true);
  const d1 = sd();
  ok(!!(d1.region && d1.region.day), `regional discovered in-world (day ${d1.region && d1.region.day})`);
  ok(d1.region && d1.region.day >= 15, `regional discovery not before day 15 (day ${d1.region && d1.region.day})`);
  ok(!!(d1.realm && d1.realm.day), `national discovered in-world (day ${d1.realm && d1.realm.day})`);
  ok(d1.realm && d1.realm.day > (d1.region && d1.region.day || 0), 'national discovery comes after regional (concepts ladder)');
  ok(['traveler', 'villager', 'system'].includes(d1.region && d1.region.via),
    `regional discovery has an in-world vector (via=${d1.region && d1.region.via})`);

  // System pointer at the wave-3 bar: "the next act needs a bigger stage"
  clearSays();
  const w2 = (Game.data.monsters || []).filter(m => m.wave === 2).slice(0, 5).map(m => m.id);
  ok(w2.length >= 5, 'test has 5 distinct wave-2 monster ids');
  w2.forEach(id => Game.scoreLedgerKill(id));
  setDay(Math.max(32, day() + 1)); setPantry(30);
  for (let d = day(), end = d + 20; d <= end && !sd().nextAct; d++) { setDay(d); Game.scaleDiscoveryDaily(); }
  ok(!!(sd().nextAct && sd().nextAct.day), `System "next act" pointer fired at wave-3 bar (day ${sd().nextAct && sd().nextAct.day})`);
  ok(says.some(t => /next act/i.test(t) && /STAGE|stage/i.test(t)), 'next-act line names a bigger stage, not a mechanic');

  // System pointer at the wave-4 bar: "finales need a nation"
  clearSays();
  Game.state.networkLive = true; // regional rung reached
  Game.state.networkLiveDay = 33;
  const w3 = (Game.data.monsters || []).filter(m => m.wave === 3).slice(0, 4).map(m => m.id);
  ok(w3.length >= 4, 'test has 4 distinct wave-3 monster ids');
  w3.forEach(id => Game.scoreLedgerKill(id));
  setDay(Math.max(60, day() + 1)); setPantry(30);
  const rawBefore = Game.villageStanding(), heldBefore = Game.villageStandingTotal();
  ok(rawBefore.total >= Game.standingCfg().t4 && !Game.waveUnlockReady(4).ready && Game.unlockedWave() === 3,
    'raw standing and regional flag alone leave wave4 held by readiness');
  Game.scaleDiscoveryDaily();
  ok(!sd().nation, 'unready regional village receives no wave4 national pitch');
  console.log('HELD_RECEIPT ' + JSON.stringify({ raw: rawBefore, released: heldBefore, readiness: Game.waveUnlockReady(4), wave: Game.unlockedWave() }));
  prepareReadiness(w3);
  ok(Game.unlockedWave() === 4, 'prepared capability releases actual wave4');
  clearSays();
  for (let d = day(), end = d + 20; d <= end && !sd().nation; d++) { setDay(d); Game.scaleDiscoveryDaily(); }
  ok(!!(sd().nation && sd().nation.day), `System national pointer fired at wave-4 bar (day ${sd().nation && sd().nation.day})`);

  ok(says.some(t => /FINALES.*NATION/.test(t)), 'national pitch names the next political step');
  const firedDay = sd().nation && sd().nation.day;
  clearSays(); Game.scaleDiscoveryDaily(); setDay(day() + 1); Game.scaleDiscoveryDaily();
  console.log('NATION_RECEIPT ' + JSON.stringify({ day: day(), nation: sd().nation, echoDay: Game.state.scaleDiscover.nationEchoDay, echoSaid: Game.state.scaleDiscover.nationEchoSaid, lines: says }));
  ok(sd().nation?.day === firedDay && !says.some(t => /FINALES.*NATION/.test(t)), 'national pitch fires once');
  ok(Game.state.scaleDiscover.nationEchoSaid && says.some(t => /Whatever.s coming/.test(t)), 'villager echo follows the national pitch');

  // table discovery at national
  clearSays();
  Game.state.nationalLive = true;
  setDay(Math.max(85, day() + 1));
  Game.scaleDiscoveryDaily();
  ok(!!(sd().table && sd().table.day), 'table discovered in-world at national');
  ok(says.some(t => /table/i.test(t)), 'table line names the table');

  // ---------- (b) the first-step moment ----------
  console.log('== (b) the first-link moment ==');
  await freshGame();
  setPantry(30);
  const ovs = otherVillages();
  ovs.forEach(v => { v.generated = true; v.rumored = true; v.opinion = 20; });
  clearSays();
  setDay(24);
  Game._formLink(ovs[0].id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  const d2 = sd();
  ok(!!(d2.firstAccord && d2.firstAccord.day), 'first-accord moment fired on first link');
  ok(says.some(t => /FIRST CONTACT/i.test(t)), 'System announces first contact (producer voice)');
  ok(says.some(t => /not alone|know our names|NAMES/i.test(t)), 'villagers react — the village feels it');
  ok(says.some(t => /warming up|coordination/i.test(t)), 'overlay growth is said aloud (canon: System overlay grows)');
  const momentLines = says.filter(t => /FIRST CONTACT|not alone|warming up|isn't just Haven/.test(t));
  ok(momentLines.length >= 3, `moment is a beat, not a line (${momentLines.length} spoken beats)`);

  // once-only: a second link must not re-fire the moment
  clearSays();
  Game._formLink(ovs[1].id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  ok(!says.some(t => /FIRST CONTACT/i.test(t)), 'first-contact moment fires once, not per link');

  // ---------- (c) struggling/early village gets no pitch ----------
  console.log('== (c) gating: the struggling village hears nothing ==');
  await freshGame();
  Game.state.systemArrived = false; // pre-arrival: no System voice yet
  setPantry(0); // starving: no lingering travelers, no fire-side talk
  setDay(8);
  for (let d = 8; d <= 33; d++) { setDay(d); Game.scaleDiscoveryDaily(); }
  const d3 = sd();
  ok(!d3.region, 'starving day-8 village: no regional discovery');
  ok(!d3.realm, 'starving day-8 village: no national discovery');
  ok(!d3.table, 'starving day-8 village: no table discovery');
  ok(!d3.nextAct && !d3.nation, 'starving day-8 village: no System pointers');
  ok(!says.some(t => /◈ SYSTEM/i.test(t)), 'no System voice before arrival');
  // struggling but later: still nothing without deeds/food
  setDay(40);
  for (let d = 40; d <= 60; d++) { setDay(d); Game.scaleDiscoveryDaily(); }
  const d3b = sd();
  ok(!d3b.region && !d3b.realm, 'starving day-40 village: still no ladder discovery (thriving gate holds)');

  // Give the pre-arrival world a real neighbor opportunity, so silence
  // cannot pass merely because every other pointer prerequisite was absent.
  otherVillages().forEach(v => { v.generated = true; v.rumored = true; });
  setPantry(30); setDay(day() + 1); clearSays();
  ok(Game.integrationStage() === 0 && otherVillages().some(v => Game.knowsVillage(v)),
    'known neighboring fire exists while the System is absent');
  Game.scaleDiscoveryDaily();
  ok(!says.some(t => /◈ SYSTEM/.test(t)), 'even a fed village with known neighbors gets no pre-arrival System pitch');

  // ---------- (d) sense-test: read every line ----------
  console.log('== (d) sense-test: the lines ==');
  await freshGame();
  setPantry(30);
  otherVillages().forEach(v => { v.generated = true; v.rumored = true; v.opinion = 20; });
  runDiscoveryDays(15, 200, true);
  w2.forEach(id => Game.scoreLedgerKill(id));
  setDay(Math.max(60, day() + 1)); Game.scaleDiscoveryDaily();
  Game.state.networkLive = true; Game.state.networkLiveDay = day();
  w3.forEach(id => Game.scoreLedgerKill(id));
  prepareReadiness(w3);
  for (let d = day(), end = d + 20; d <= end; d++) { setDay(d); Game.scaleDiscoveryDaily(); }
  Game.state.nationalLive = true; setDay(Math.max(90, day() + 1)); Game.scaleDiscoveryDaily();
  Game._formLink(otherVillages()[0].id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);

  const JARGON = /scaleRank|nationalLive|networkLive|unlock|Wave [0-9]|checklist|quest log|\bbar\b.*point/i;
  const sysLines = discLines.filter(t => /◈ SYSTEM/.test(t));
  ok(sysLines.length > 0, `System spoke (${sysLines.length} lines)`);
  const jargonHits = discLines.filter(t => JARGON.test(t));
  ok(jargonHits.length === 0, 'no mechanics jargon leaks into discovery lines' +
    (jargonHits.length ? ' :: ' + jargonHits.map(t => t.slice(0, 120)).join(' || ') : ''));
  ok(!discLines.some(t => /undefined|NaN/.test(t)), 'no broken interpolations');
  console.log(`\n----- DISCOVERY TRANSCRIPT (seed ${SEED}) -----`);
  const seen = new Set();
  for (const t of discLines) {
    if (seen.has(t)) continue; seen.add(t);
    console.log('  ' + t);
  }
  console.log('----- END TRANSCRIPT -----\n');
  ok(discLines.length > 0 && sd().nation && sd().table, 'transcript includes actual national and Table discovery');

  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS CRASH:', e); process.exit(2); });
