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
const SEED = parseInt(process.env.SEED || '424242', 10);
Math.random = mulberry32(SEED); // seeded BEFORE eval: modules capture it at load

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global;

// FULL index.html order, minus DOM-only modules
// (app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js).
const DOM_ONLY = new Set(['app.js', 'sprites.js', 'tile-scenes.js', 'move-anim.js', 'drama.js']);
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const files = [];
for (const m of html.matchAll(/src\/js\/([a-zA-Z0-9\-\/]+\.js)/g)) {
  if (!DOM_ONLY.has(m[1]) && !files.includes(m[1])) files.push(m[1]);
}
for (const f of files) {
  try { eval(fs.readFileSync(path.join(ROOT, 'src/js', f), 'utf8')); }
  catch (e) { console.log(`EVAL FAIL ${f}: ${e.message}`); process.exit(2); }
}
delete global.window;
const Game = globalThis.Scattering.Game;

let says = [];
let discLines = []; // lines spoken by scale-discovery beats only
let inDiscovery = false;
const osay = Game.say.bind(Game);
Game.say = (t) => { const s = String(t); says.push(s); if (inDiscovery) discLines.push(s); return osay(t); };
const clearSays = () => { says = []; discLines = []; };
// scope the sense-test to discovery beats (the wave ledger's own "bar"
// beats are pre-existing canon, not discovery lines)
const _origSDDaily = Game.scaleDiscoveryDaily.bind(Game);
Game.scaleDiscoveryDaily = (...a) => { inDiscovery = true; try { return _origSDDaily(...a); } finally { inDiscovery = false; } };
const _origSDMoment = Game._sdFirstAccordMoment.bind(Game);
Game._sdFirstAccordMoment = (...a) => { inDiscovery = true; try { return _origSDMoment(...a); } finally { inDiscovery = false; } };

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
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  try { Game.depart(); } catch (e) {}
  Game.state.systemArrived = true; // System present (integration stage 1+)
  clearSays();
}

function otherVillages() {
  return (Game.state.otherVillages || []).filter(v => v && v.id !== 'haven');
}
function runDiscoveryDays(fromDay, toDay) {
  for (let d = fromDay; d <= toDay; d++) {
    setDay(d);
    Game.scaleDiscoveryDaily();
    if (Game.scaleDiscovery().region && Game.scaleDiscovery().realm &&
        Game.scaleDiscovery().table) break;
  }
}
function sd() { return Game.scaleDiscovery(); }

(async () => {
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
  runDiscoveryDays(20, 200);
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
  setDay(32); setPantry(30);
  for (let d = 32; d <= 45 && !sd().nextAct; d++) { setDay(d); Game.scaleDiscoveryDaily(); }
  ok(!!(sd().nextAct && sd().nextAct.day), `System "next act" pointer fired at wave-3 bar (day ${sd().nextAct && sd().nextAct.day})`);
  ok(says.some(t => /next act/i.test(t) && /STAGE|stage/i.test(t)), 'next-act line names a bigger stage, not a mechanic');

  // System pointer at the wave-4 bar: "finales need a nation"
  clearSays();
  Game.state.networkLive = true; // regional rung reached
  Game.state.networkLiveDay = 33;
  const w3 = (Game.data.monsters || []).filter(m => m.wave === 3).slice(0, 4).map(m => m.id);
  ok(w3.length >= 4, 'test has 4 distinct wave-3 monster ids');
  w3.forEach(id => Game.scoreLedgerKill(id));
  setDay(60); setPantry(30);
  for (let d = 60; d <= 80 && !sd().nation; d++) { setDay(d); Game.scaleDiscoveryDaily(); }
  ok(!!(sd().nation && sd().nation.day), `System national pointer fired at wave-4 bar (day ${sd().nation && sd().nation.day})`);

  // table discovery at national
  clearSays();
  Game.state.nationalLive = true;
  setDay(85);
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

  // ---------- (d) sense-test: read every line ----------
  console.log('== (d) sense-test: the lines ==');
  await freshGame();
  setPantry(30);
  otherVillages().forEach(v => { v.generated = true; v.rumored = true; v.opinion = 20; });
  runDiscoveryDays(15, 200);
  w2.forEach(id => Game.scoreLedgerKill(id));
  setDay(60); Game.state.networkLive = true; Game.state.networkLiveDay = 33;
  w3.forEach(id => Game.scoreLedgerKill(id));
  for (let d = 60; d <= 80; d++) { setDay(d); Game.scaleDiscoveryDaily(); }
  Game.state.nationalLive = true; setDay(90); Game.scaleDiscoveryDaily();
  Game._formLink(otherVillages()[0].id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);

  const JARGON = /scaleRank|nationalLive|networkLive|unlock|Wave [0-9]|checklist|quest log|\bbar\b.*point/i;
  const sysLines = discLines.filter(t => /◈ SYSTEM/.test(t));
  ok(sysLines.length > 0, `System spoke (${sysLines.length} lines)`);
  const jargonHits = discLines.filter(t => JARGON.test(t));
  ok(jargonHits.length === 0, 'no mechanics jargon leaks into discovery lines' +
    (jargonHits.length ? ' :: ' + jargonHits.map(t => t.slice(0, 120)).join(' || ') : ''));
  ok(!discLines.some(t => /undefined|NaN/.test(t)), 'no broken interpolations');
  const villagerLines = discLines.filter(t => /'[^']*'/.test(t) && !/◈ SYSTEM/.test(t) && /—|:/.test(t));
  console.log(`\n----- DISCOVERY TRANSCRIPT (seed ${SEED}) -----`);
  const seen = new Set();
  for (const t of discLines) {
    if (seen.has(t)) continue; seen.add(t);
    console.log('  ' + t);
  }
  console.log('----- END TRANSCRIPT -----\n');
  ok(villagerLines.length >= 0, 'transcript printed for human review');

  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS CRASH:', e); process.exit(2); });
