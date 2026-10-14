// scripts/godpath/lib.js — shared test kit for god-path work (2026-10-14).
//
// Every god-path test/sim requires THIS instead of copying eval boilerplate.
// It wraps scripts/sim-harness.js (seeded RNG, frozen clock, index.html
// script order, sync combat) and adds small helpers for fights, abilities,
// phase gating, and pass/fail reporting.
//
//   const K = require('./lib');
//   const T = K.reporter('my-test');
//   const Game = await K.load({ seed: 7 });
//   K.newRun(Game);
//   K.giveAbility(Game, 'patient_aim');
//   const mf = K.fight(Game, 'hushwolf');
//   T.ok('fight started', !!Game.tbfight);
//   T.done();               // prints summary, sets exit code
'use strict';
const fs = require('fs');
const path = require('path');
const H = require('../sim-harness');

const ROOT = H.ROOT;

function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}
function readSrc(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

// Current build phase (docs/godpath/PLAN.md). Checks for phases above it are
// reported as TODO, not failures — so the ladder is always runnable.
function phase() {
  if (process.env.GODPATH_PHASE != null) return Number(process.env.GODPATH_PHASE);
  try { return readJSON('scripts/godpath/phase.json').phase; } catch (e) { return 0; }
}

// reporter(name): ok/todo/skip bookkeeping with a stable summary line that
// scripts/check.js parses ("N passed, M failed").
function reporter(name) {
  let pass = 0, fail = 0, todo = 0;
  const fails = [];
  const cur = phase();
  return {
    // ok(label, cond, extra?, atPhase?) — atPhase > current phase => TODO.
    ok(label, cond, extra, atPhase) {
      if (atPhase != null && atPhase > cur) {
        todo++;
        console.log(`  todo [P${atPhase}] ${label}${cond ? ' (already passing)' : ''}`);
        return;
      }
      if (cond) { pass++; console.log(`  ok   ${label}`); }
      else { fail++; fails.push(label); console.log(`  FAIL ${label}${extra ? ' — ' + extra : ''}`); }
    },
    section(t) { console.log(`\n${t}`); },
    done() {
      console.log(`\n${name}: ${pass} passed, ${fail} failed, ${todo} todo (phase ${cur})`);
      if (fail) console.log('failing: ' + fails.slice(0, 12).join(' | ') + (fails.length > 12 ? ` | …+${fails.length - 12} more` : ''));
      process.exitCode = fail ? 1 : 0;
      return { pass, fail, todo };
    },
  };
}

// load({seed}) -> Game. Quiet by default (game logs are noise in tests).
async function load(opts) {
  opts = opts || {};
  const { Game } = await H.quietLog(() => H.loadGame({ seed: opts.seed != null ? opts.seed : 20261014, mode: 'godpath' }));
  return Game;
}

// newRun(Game): fresh character, departed, ready to play.
function newRun(Game, place) {
  if (Game.tbfight && !Game.tbfight.over) { try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; } }
  place = place || 'Columbus, Ohio';
  Game.genRoster(place);
  Game.newGame(place, null, Game.generatedRoster[0].id);
  Game.depart();
  return Game.state.scholar;
}

// Abilities are stored as ids or {id,...} depending on path; normalise.
function abilityIds(Game) {
  return (Game.state.scholar.abilities || []).map(a => (typeof a === 'string' ? a : a && a.id));
}

// giveAbility: test-only grant that BYPASSES offers but RESPECTS slot count
// unless {force:true}. Returns true if granted.
function giveAbility(Game, id, o) {
  o = o || {};
  const s = Game.state.scholar;
  s.abilities = s.abilities || [];
  if (abilityIds(Game).includes(id)) return true;
  const cap = Game.abilitySlots ? Game.abilitySlots() : 6;
  if (!o.force && s.abilities.length >= cap) return false;
  // Same shape chooseAbility writes (game.js ~21707).
  const def = ((Game.data && Game.data.abilities) || []).find(a => a.id === id) || {};
  s.abilities.push({ id, name: def.name || id, desc: def.description || '', level: o.level || 1, xp: 0 });
  return true;
}

// openSlots(Game, n): raise integration so n slots are available
// (game.js abilitySlots: 1 → 6 at integration 20/35/50/65/80).
function openSlots(Game, n) {
  const need = [0, 0, 20, 35, 50, 65, 80][Math.max(1, Math.min(6, n))];
  const s = Game.state.scholar;
  s.integration = Math.max(s.integration || 0, need);
}

// fight(Game, monsterId, {px,py,mx,my,hp,party}) -> monster fighter.
// Pattern lifted from scripts/test-aggro-audio-hooks-20261008.js (known-good).
function fight(Game, monsterId, o) {
  o = o || {};
  if (Game.tbfight && !Game.tbfight.over) { try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; } }
  const s = Game.state.scholar;
  const px = o.px != null ? o.px : 2, py = o.py != null ? o.py : 4;
  const mx = o.mx != null ? o.mx : 6, my = o.my != null ? o.my : 4;
  s.mx = px; s.my = py;
  if (Game.ensureVillagerPositions) Game.ensureVillagerPositions();
  if (!o.party) {
    Game.state.village.roster = [];
    const vpos = Game.state.village.positions || {};
    for (const k of Object.keys(vpos)) vpos[k] = { mx: 8, my: 8 };
  }
  s.monster = { id: monsterId, mx, my };
  Game.startCombat(monsterId);
  const mf = Game.tbfight && Game.tbfight.fighters.find(f => f.kind === 'monster');
  if (mf) { mf.mx = mx; mf.my = my; }
  const pf = Game.tbFighter && Game.tbFighter('p');
  if (pf) { pf.mx = px; pf.my = py; if (o.hp) { pf.hp = o.hp; pf.maxHp = o.hp; } }
  return mf;
}

// captureSays(Game) -> array that fills with every Game.say() line.
function captureSays(Game) {
  const lines = [];
  const orig = Game.say;
  Game.say = function (m) { lines.push(String(m)); try { return orig.apply(this, arguments); } catch (e) {} };
  lines.restore = () => { Game.say = orig; };
  return lines;
}

// teleEvents(Game, type) -> telemetry events of a type (needs fullTelemetry
// for long sims; fine for short tests).
function teleEvents(Game, type) {
  const t = (Game.state && Game.state.telemetry) || [];
  const arr = Array.isArray(t) ? t : (t.events || []);
  return arr.filter(e => e && (e.type === type || e.t === type));
}

module.exports = {
  ROOT, H, readJSON, readSrc, phase, reporter, load, newRun, abilityIds,
  giveAbility, openSlots, fight, captureSays, teleEvents,
};
