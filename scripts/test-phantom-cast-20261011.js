#!/usr/bin/env node
// PHANTOM CAST — PROOF (playtest loop 2026-10-11, landing leg).
//
// The System-arrival and homecoming beats hardcoded "Mara"/"Jesse"/"Aki" — a
// fixed cast that doesn't exist in the generated 12-person roster (the landing
// playthrough caught "Mara grabs your arm" with no Mara in the village).
// Unique-person law: never hardcode a fixed cast.
// FIX: _beatCast(n) draws n distinct living non-player villagers; the five
// beats render them via displayName/firstRef (knowledge-gated, true names
// post-arrival since the System labels everyone).
//
// Drives the REAL functions: checkSystemArrival (at-Haven + away) and
// returnToVillage (arrival discussion, havenSecured milestone, won greeters).
// Before fix: phantom names in the lines. After: zero phantoms, and every
// beat voice belongs to a real roster member.
//
// Usage: node scripts/test-phantom-cast-20261011.js [SEED=...]

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

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS: ${name}`); }
  else { fail++; console.log(`FAIL: ${name}` + (extra ? ` — ${extra}` : '')); }
}

const PHANTOM = /\b(Mara|Jesse|Aki)\b/;
let rawLines = [];
function capture() {
  rawLines = [];
  const osay = Game.say.bind(Game);
  Game.say = (m) => { rawLines.push(String(m)); try { return osay(m); } catch (e) {} };
  const oemit = (typeof Game.emit === 'function') ? Game.emit.bind(Game) : null;
  if (oemit) Game.emit = (m) => { rawLines.push(String(m)); try { return oemit(m); } catch (e) {} };
}
// The emit rebuild routes say() through emit: wrapping both double-captures
// every line. Dedupe (the stream invariant guarantees no true repeats).
function flushed() {
  const seen = new Set();
  return rawLines.filter(l => !seen.has(l) && (seen.add(l), true));
}
function rosterNames() {
  return (Game.state.village.roster || [])
    .filter(id => id !== Game.villagerId)
    .map(id => { try { return Game.displayName(id); } catch (e) { return null; } })
    .filter(Boolean);
}
function namesRosterClean() {
  // Guard: if the RNG happened to generate a real Mara/Jesse/Aki, the
  // phantom-negative below is ambiguous — fail loudly, don't false-pass.
  const hit = rosterNames().filter(n => PHANTOM.test(n));
  return hit;
}

async function fresh(arrivalDay) {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.day = arrivalDay || 8;
  capture();
}

async function main() {
  console.log(`=== phantom cast (seed ${SEED}) ===`);

  // A. Arrival AT Haven: the arm-grab beat.
  await fresh(8);
  {
    const amb = namesRosterClean();
    ok('A: roster has no Mara/Jesse/Aki (phantom check is unambiguous)', amb.length === 0, amb.join(','));
    Game.checkSystemArrival();
    const grab = flushed().filter(l => /grabs your arm/i.test(l));
    ok('A: arm-grab beat fires', grab.length === 1, `${grab.length} lines`);
    ok('A: no phantom names in the arrival', !flushed().some(l => PHANTOM.test(l)),
      flushed().filter(l => PHANTOM.test(l)).slice(0, 2).join(' | ').slice(0, 140));
    const names = rosterNames();
    ok('A: the arm belongs to a real roster villager',
      grab.length === 1 && names.some(n => grab[0].includes(n)),
      grab[0] ? grab[0].slice(0, 120) : '(no line)');
  }

  // B. Arrival AWAY from Haven: the pending event blurb.
  await fresh(8);
  {
    try { Game.map.px = 0; Game.map.py = 0; } catch (e) {}
    Game.checkSystemArrival();
    const ev = Game.state.scholar.pendingVillageEvent;
    ok('B: pending village event was staged', !!(ev && ev.id === 'system_arrival_discussion'), ev && ev.id);
    ok('B: no phantom names in the event blurb', !(ev && PHANTOM.test(ev.desc || '')),
      ev && String(ev.desc).slice(0, 140));
    const names = rosterNames();
    const hits = names.filter(n => ev && String(ev.desc).includes(n));
    ok('B: the blurb names real roster villagers', hits.length >= 2, `${hits.length} roster names in blurb`);
  }

  // C. Return home renders the discussion with the real cast.
  {
    // (continuing game B: pendingVillageEvent is staged, player returns)
    Game.returnToVillage();
    const said = flushed().filter(l => /sky just|gift\? I said no|hasn't spoken since/i.test(l));
    ok('C: arrival discussion fires on return', said.length === 3, `${said.length} lines`);
    ok('C: no phantom names in the discussion', !flushed().some(l => PHANTOM.test(l)),
      flushed().filter(l => PHANTOM.test(l)).slice(0, 2).join(' | ').slice(0, 140));
    const names = rosterNames();
    const tags = said.map(l => (l.split(':')[0] || '').trim());
    ok('C: all three speakers are roster villagers',
      tags.length === 3 && tags.every(t => names.some(n => t.includes(n.split(' ')[0]))),
      tags.join(' / '));
  }

  // D. havenSecured milestone voice.
  await fresh(8);
  {
    Game.state.systemArrived = true; // arrival beats are day-8's; milestone is later
    Game.state.codex.plants = {};
    for (let i = 0; i < 10; i++) Game.state.codex.plants['testplant' + i] = { name: 'Test Plant ' + i };
    Game.state.village.pantry = [{ kcalEach: 1000, units: 10 }];
    Game.state.village.havenSecured = false;
    Game.returnToVillage();
    const ms = flushed().filter(l => /going to make it/i.test(l));
    ok('D: havenSecured milestone fires', ms.length >= 1, `${ms.length} lines`);
    ok('D: no phantom names in the milestone', !flushed().some(l => PHANTOM.test(l)),
      flushed().filter(l => PHANTOM.test(l)).slice(0, 2).join(' | ').slice(0, 140));
    const names = rosterNames();
    ok('D: the milestone voice is a roster villager',
      ms.length >= 1 && names.some(n => ms[0].includes(n.split(' ')[0])),
      ms[0] ? ms[0].slice(0, 110) : '(no line)');
  }

  // E. Won-return greeters.
  await fresh(8);
  {
    Game.state.systemArrived = true;
    Game.won = true;
    try { Game.returnToVillage(); } finally { Game.won = false; }
    const greets = flushed().filter(l => /Thinner and smarter|whole test, really|brought something green|That's enough/i.test(l));
    ok('E: won greeters fire', greets.length === 3, `${greets.length} lines`);
    ok('E: no phantom names among the greeters', !flushed().some(l => PHANTOM.test(l)),
      flushed().filter(l => PHANTOM.test(l)).slice(0, 2).join(' | ').slice(0, 140));
  }

  console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
