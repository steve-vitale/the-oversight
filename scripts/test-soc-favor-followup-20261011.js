#!/usr/bin/env node
// PROOF: favor-followup menu hijack fix (journey sociallife 2026-10-11).
//
// BUG (before): an uncommitted favor ask ('asked' state) resurfaced via a
// seed follow-up ("About the pantry run — still need hands. Are you in?").
// The want def's opener set stage=2 ("menu goes straight to commit/deflect"),
// but startConvo's generic-Q classifier re-classified the trailing "Are you
// in?" as a fresh yes/no question, suppressing the want menu (convoWantMenu
// returns [] when c.genericQ hangs). The menu was gq:yn:* only — answering
// "Yes." did NOT commit (favor stayed 'asked', re-seeded, asked forever).
//
// FIX (conversation.js startConvo): when the opener came from the live want
// def (thread 'want') at stage >= 2 and the def supplies its own menu
// options, the want def OWNS the question — skip reactive/generic-Q
// classification. Fresh-ask flow (stage 0/1) untouched.
//
// SECOND FIX (convo-wants.js convoFavorFollowup): the 'asked' re-ask was one
// verbatim template across 60+ days ("still need hands. Are you in?" from 5
// villagers). Now 4 cycling variants.
//
// Seeded BEFORE eval (modules capture Math.random at load). Full production
// script list in index.html order (minus DOM-only + drama.js).
//
// Usage: node scripts/test-soc-favor-followup-20261011.js [SEED=...]

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261011', 10);

let _s = SEED >>> 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.window = global;
const files = [
  'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js',
  'src/js/convo-mood.js', 'src/js/convoTopics.js', 'src/js/convo-wants.js',
  'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js',
  'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
  'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js',
  'src/js/contests.js', 'src/js/broadcast.js', 'src/js/contestEngine.js',
  'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js',
  'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js',
  'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js',
  'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/waveLedger.js',
  'src/js/feastBuff.js', 'src/js/ledger.js', 'src/js/abilityActions.js',
  'src/js/monsterBehaviors.js', 'src/js/partyTactics.js',
  'src/js/sigW3a.js', 'src/js/statusEffects.js', 'src/js/sigW3b.js',
  'src/js/metaProgression.js', 'src/js/sigW3c.js',
  'src/js/villager-agency.js', 'src/js/fieldFights.js',
  'src/js/villager-objectives.js', 'src/js/codex-people.js',
  'src/js/membership.js', 'src/js/havenGrowth.js', 'src/js/hierarchy.js',
  'src/js/comms.js', 'src/js/safetynets.js', 'src/js/villageAgency.js',
  'src/js/debug-scenarios.js', 'src/js/build.js',
];
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window;
const Game = globalThis.Scattering.Game;
Game.emit = function (m) { return m; };

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS: ${name}`); }
  else { fail++; console.log(`FAIL: ${name}` + (extra ? ` — ${extra}` : '')); }
}
const menuIds = (r) => (r.choices || []).map(c => c.id).join(',');

// Drive a conversation to the favor's stated stage without committing.
// Returns { favor, seed } if the villager now holds an uncommitted 'asked'
// favor with a planted follow-up seed, else null.
function reachAsked(vid) {
  let r = Game.startConvo(vid);
  const w0 = Game.convoGet(vid).want || {};
  if (w0.id !== 'ask_favor') { try { Game.endConvo(vid, 'done'); } catch (e) {} return null; }
  for (let t = 0; t < 6; t++) {
    const ids = (r.choices || []).map(c => c.id);
    let p = null;
    if (ids.includes('gq:yn:yes')) p = 'gq:yn:yes';
    else if (ids.includes('dlg:help')) p = 'dlg:help';
    else if (ids.includes('goon')) p = 'goon';
    if (!p) break;
    r = Game.convoTurn(vid, p);
    if (r.ended) break;
  }
  Game.endConvo(vid, 'done');
  const fav = Game.convoGetFavor(vid);
  const seed = (Game.state.village.convoSeeds || {})[vid];
  if (fav && fav.state === 'asked' && seed && seed.wantId === 'ask_favor') return { favor: fav, seed };
  return null;
}

// Find a villager who will hold an uncommitted 'asked' favor (want selection
// is RNG-driven — don't assume roster[0] qualifies). Also captures the fresh
// ask's stage-0/1 menu for the regression check.
function findAskedVillager(exclude) {
  const roster = Game.state.village.roster.filter(id => id !== Game.villagerId && id !== exclude);
  for (const vid of roster) {
    let r = Game.startConvo(vid);
    const w0 = Game.convoGet(vid).want || {};
    const freshMenu = (r.choices || []).map(c => c.id).join(',');
    if (w0.id !== 'ask_favor') { try { Game.endConvo(vid, 'done'); } catch (e) {} continue; }
    for (let t = 0; t < 6; t++) {
      const ids = (r.choices || []).map(c => c.id);
      let p = null;
      if (ids.includes('gq:yn:yes')) p = 'gq:yn:yes';
      else if (ids.includes('dlg:help')) p = 'dlg:help';
      else if (ids.includes('goon')) p = 'goon';
      if (!p) break;
      r = Game.convoTurn(vid, p);
      if (r.ended) break;
    }
    Game.endConvo(vid, 'done');
    const fav = Game.convoGetFavor(vid);
    const seed = (Game.state.village.convoSeeds || {})[vid];
    if (fav && fav.state === 'asked' && seed && seed.wantId === 'ask_favor') {
      return { vid, favor: fav, seed, freshMenu };
    }
  }
  return null;
}

async function main() {
  await Game.init();
  Game.genDetail = () => ({});
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const rosterAll = Game.state.village.roster.filter(id => id !== Game.villagerId);

  console.log(`=== favor-followup fix proof (seed ${SEED}) ===`);

  // --- SETUP: find a villager holding an uncommitted 'asked' favor ---
  const found = findAskedVillager(null);
  ok('a villager holds an uncommitted asked favor with a planted seed', !!found,
    found ? `vid ok` : 'no villager qualified (want RNG)');
  if (!found) { console.log('SETUP FAILED — cannot prove the fix on this seed'); process.exit(2); }
  const vid = found.vid;
  const fav = found.favor;
  const seed = found.seed;
  console.log(`after day1: favor state=${fav && fav.state} seed=${seed && seed.wantId}`);

  // --- TEST 1: fresh-ask flow unchanged (stage 0/1 -> genericQ classifies) ---
  // (uses the found villager's fresh day-1 menu, captured before driving)
  console.log(`day1 fresh menu=[${found.freshMenu}]`);
  ok('fresh ask still routes through the question menu at stage 0/1',
    /gq:(yn|open)/.test(found.freshMenu),
    `menu=${found.freshMenu}`);

  // --- TEST 2b: re-ask lines vary (no verbatim loop) ---
  // Use the REAL asked favor (a fake favor fails convoFavorNeedLive and
  // falls into the 'moot' branch — honest, but not what we're testing).
  {
    const realFav = Game.convoGetFavor(vid);
    const lines = new Set();
    for (let i = 0; i < 4; i++) {
      const l = Game.convoFavorFollowup(vid, realFav);
      if (l) lines.add(l);
    }
    console.log(`re-ask variants seen: ${lines.size}`);
    for (const l of lines) console.log(`  ${String(l).slice(0, 75)}`);
    ok('asked follow-up lines vary across re-asks', lines.size >= 2, `${lines.size} distinct`);
    const allAbout = [...lines].every(l => /^"About /.test(l));
    ok('all variants lead with "About {short}" (seed-prefix safe)', allAbout);
  }

  // --- TEST 3: the followup menu offers commit/deflect (THE FIX) ---
  Game.state.scholar.day = 4;
  const r4 = Game.startConvo(vid);
  const w4 = Game.convoGet(vid).want || {};
  console.log(`day4: line=${String(r4.line).slice(0, 80)}`);
  console.log(`day4: menu=[${menuIds(r4)}] want=${w4.id} stage=${w4.stage}`);
  ok('followup want is ask_favor from seed at stage 2',
    w4.id === 'ask_favor' && w4.fromSeed && w4.stage === 2,
    `id=${w4.id} fromSeed=${w4.fromSeed} stage=${w4.stage}`);
  ok('followup menu offers commit (engage the want)',
    menuIds(r4).split(',').includes('dlg:commit'),
    `menu=${menuIds(r4)}`);
  ok('followup menu offers cant (deflect the want)',
    menuIds(r4).split(',').includes('dlg:cant'),
    `menu=${menuIds(r4)}`);
  ok('no generic-Q hijack on the followup menu',
    !/gq:yn/.test(menuIds(r4)),
    `menu=${menuIds(r4)}`);

  // --- TEST 4: committing from the followup keeps the promise ---
  const r5 = Game.convoTurn(vid, 'dlg:commit');
  if (r5.line) console.log(`commit beat: ${String(r5.line).slice(0, 100)}`);
  Game.endConvo(vid, 'done');
  const w5 = Game.convoGet(vid).want || {};
  const fav2 = Game.convoGetFavor(vid);
  const prom = (Game.state.village.promises || {})[vid];
  ok('commit from followup resolves promised', w5.resolution === 'promised', w5.resolution);
  ok('favor state becomes promised', fav2 && fav2.state === 'promised', fav2 && fav2.state);
  ok('a tracked promise is recorded', !!(prom && prom.favorId && !prom.kept), JSON.stringify(prom).slice(0, 120));

  const found2 = findAskedVillager(vid);
  ok('a second villager holds an asked favor to settle', !!found2,
    found2 ? 'vid ok' : 'no second villager qualified (want RNG)');
  if (!found2) { console.log('SETUP FAILED (part 2)'); process.exit(2); }
  const vid2 = found2.vid;
  const favB = found2.favor;
  const seedB = found2.seed;
  if (favB) favB.state = 'fulfilled'; // natural pre-acknowledgment state
  Game.state.scholar.day = 5; // within the 7-day seed window
  const rB = Game.startConvo(vid2);
  const wB = Game.convoGet(vid2).want || {};
  console.log(`settled: want=${wB.id} fromSeed=${!!wB.fromSeed}`);
  console.log(`settled: line=${String(rB.line).slice(0, 90)} menu=[${menuIds(rB)}]`);
  ok('settled followup resurfaces the favor seed', wB.id === 'ask_favor' && !!wB.fromSeed, `${wB.id} fromSeed=${wB.fromSeed}`);
  ok('settled favor followup offers no commit',
    !menuIds(rB).split(',').includes('dlg:commit'),
    `menu=${menuIds(rB)}`);
  try { Game.endConvo(vid2, 'done'); } catch (e) {}

  // --- TEST 6: after the want is decided, generic "can't" retires ---
  // (journey sociallife 2026-10-11: the menu kept offering "Can't right now"
  // after deflection — 7 picks cycling 2 lines. The want menu is already
  // empty at stage 3; the generic pool must not re-offer the deflect verb.)
  {
    const found3 = findAskedVillager(vid2);
    if (!found3) { console.log('SETUP FAILED (part 3)'); process.exit(2); }
    const v3 = found3.vid;
    Game.state.scholar.day = 6;
    const rD = Game.startConvo(v3);
    const wD = Game.convoGet(v3).want || {};
    ok('deflect test: followup at stage 2 with cant offered',
      wD.id === 'ask_favor' && wD.stage === 2 && menuIds(rD).split(',').includes('dlg:cant'),
      `want=${wD.id} stage=${wD.stage} menu=${menuIds(rD)}`);
    Game.convoTurn(v3, 'dlg:cant');
    const wD2 = Game.convoGet(v3).want || {};
    const menuAfter = (Game.convoChoices(v3) || []).map(c => c.id);
    console.log(`after deflect: want stage=${wD2.stage} resolution=${wD2.resolution} menu=[${menuAfter.join(',')}]`);
    ok('deflect resolves the want', wD2.resolution === 'deflected', wD2.resolution);
    ok('generic cant retires after the want is decided',
      !menuAfter.includes('dlg:cant'), `menu=${menuAfter.join(',')}`);
    Game.endConvo(v3, 'done');
  }

  console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
