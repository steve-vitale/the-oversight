#!/usr/bin/env node
// SLEEP-CRISIS BEDTIME GATE — PROOF (playtest loop 2026-10-11, landing leg).
//
// BUG: sleep()'s metabolic-crisis gate is DOCUMENTED as a bedtime gate —
//   "Dehydrated (hydration 0) or starving (kcal 0) at bedtime" (game.js) and
//   the UI warns "Drink and eat before you sleep."
// but IMPLEMENTED as a post-sleep read: `const crisis = (s.hydration||0) <= 0`
// runs AFTER the sleep loop, i.e. after endDay burned the night's metabolism
// (night 30 + day 12 base + exertion ~16 at the midnight rollover = ~58 on a
// neutral day). One drink (+50) at bedtime burns to ~0 overnight, so the
// midnight spiral took its cut (-12 health, DEHYDRATED) AND the dawn crisis
// fired (half heal, energy 60, "wrung-out morning") — double punishment for
// one night, ~5 HP/day bleed for a diligent player who drank before bed.
// A no-water player died on day 11 in the landing-leg playthrough.
//
// FIX: capture the bedtime body at sleep start (same pattern as nightWeather /
// fireLasts, captured two lines above for exactly this reason) and grade the
// gate on it. The spiral keeps its midnight cut; the crisis fires only when
// you went to bed truly empty.
//
// Cases:
//   A. hydration 51 (one drink) + fed at bedtime -> NO crisis (the bug case)
//   B. hydration 0 at bedtime -> crisis (guard: still fires)
//   C. kcal 0 at bedtime -> crisis (guard: still fires)
//   D. hydration 70 + fed at bedtime -> NO crisis (sanity)
//
// Usage: node scripts/test-sleep-crisis-bedtime-20261011.js [SEED=...]

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

async function oneNight(hydration, kcal) {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const s = Game.state.scholar;
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = (m) => { lines.push(String(m)); return osay(m); };
  const oemit = (typeof Game.emit === 'function') ? Game.emit.bind(Game) : null;
  if (oemit) Game.emit = (m) => { lines.push(String(m)); return oemit(m); };
  Game.state.weather = 'overcast'; // neutral burn: 30 + 12 + 16 exert = 58/night
  s.dayTicks = 384;                // dusk: 128 ticks of night left
  s.hydration = hydration;
  s.kcal = kcal;
  s.health = 80;
  s.energy = 90;
  s.trauma = 0;
  Game.sleep();
  const wake = lines.filter(l => /Dawn\. You wake/i.test(l)).join(' ');
  return {
    lines,
    wake,
    crisis: /wrung-out morning/i.test(wake),
    energy: Math.round(s.health !== undefined ? Game.state.scholar.energy : 0),
    dehydratedWarning: lines.some(l => /DEHYDRATED/i.test(l)),
  };
}

async function main() {
  console.log(`=== sleep-crisis bedtime gate (seed ${SEED}) ===`);

  // A. THE BUG CASE: one drink (+50 -> 51) and fed at bedtime.
  {
    const r = await oneNight(51, 1500);
    ok('A: bedtime-hydrated player does NOT wake in crisis',
      !r.crisis && r.energy === 100,
      `crisis=${r.crisis} energy=${r.energy} wake="${r.wake.slice(0, 90)}"`);
    ok('A: the midnight spiral still takes its cut (burn is real, gate is not double-punishment)',
      r.dehydratedWarning, 'no DEHYDRATED spiral warning fired');
  }
  // B. Guard: truly empty at bedtime -> crisis still fires.
  {
    const r = await oneNight(0, 1500);
    ok('B: bedtime-dehydrated player DOES wake in crisis',
      r.crisis && r.energy === 60,
      `crisis=${r.crisis} energy=${r.energy}`);
  }
  // C. Guard: starving at bedtime -> crisis still fires.
  {
    const r = await oneNight(70, 0);
    ok('C: bedtime-starving player DOES wake in crisis',
      r.crisis && r.energy === 60,
      `crisis=${r.crisis} energy=${r.energy}`);
  }
  // D. Sanity: comfortable at bedtime -> clean night.
  {
    const r = await oneNight(70, 1500);
    ok('D: comfortable bedtime -> no crisis, no spiral',
      !r.crisis && r.energy === 100 && !r.dehydratedWarning,
      `crisis=${r.crisis} energy=${r.energy} spiral=${r.dehydratedWarning}`);
  }

  console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
