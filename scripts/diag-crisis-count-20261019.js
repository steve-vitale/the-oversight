#!/usr/bin/env node
// diag-crisis-count-20261019.js — CRISIS LEG r25: THE CRISIS COUNT.
// Question: in a competent full run (oracleV2, ~120d), how many of the 6
// crisis kinds (blood-on-air, breach, first-grave, hunger-winter, schism,
// the-siege) actually fire organically? The endgame deed gate needs 3+
// distinct crises weathered — if competent play routinely lands at 1-2,
// that gate is a winnable wall for exactly the player behavior the game wants.
// Phase 1: establish + run to DAYS (death-aware: villageLost/Game.over stops
// the run, +10d tail max per leg rules). Phase 2: census + death roll +
// crisis-kind timelines. Phase 3 (separate driver below): conversation
// people-check on the richest seed.
// Usage: SEED=7 DAYS=120 node scripts/diag-crisis-count-20261019.js
// Output: JSON record to stdout; narrative to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '7', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);
const CHUNK = 10;
const E = (s) => console.error(s);

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  const v = Game.state.village || {};
  return Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)));
}
function aliveCount(Game) {
  try { return (Game.state.village.roster || []).filter(id => {
    const c = (Game.state.village.rosterChars || {})[id];
    return c && c.alive !== false;
  }).length; } catch (e) { return -1; }
}
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-count' });
  await setupGame(Game);

  // instrument crisis firings: kind + day + game context
  const crisisFires = [];
  const _fc = Game.fireCrisis ? Game.fireCrisis.bind(Game) : null;
  if (_fc) {
    Game.fireCrisis = function (kind, ctx) {
      const r = _fc(kind, ctx);
      if (r) {
        crisisFires.push({ kind, day: dayOf(Game), alive: aliveCount(Game), pantry: pantryKcal(Game) });
        E(`[CRISIS] day ${dayOf(Game)}: ${kind} (alive=${aliveCount(Game)}, pantry=${pantryKcal(Game)})`);
      }
      return r;
    };
  }

  E(`[SETUP] seed ${SEED}: oracleV2 running to day ${DAYS}...`);
  const allDeaths = [];
  let day = 0, tailLeft = 10, deadAt = null, endReason = '?';
  while (day < DAYS) {
    const r = await runDays(Game, oracleV2, { days: CHUNK });
    day += (r.days || 0);
    (r.samples && r.samples.deaths || []).forEach(d => allDeaths.push(d));
    E(`[CHUNK] gameday ${dayOf(Game)} chunkday ${day} alive=${aliveCount(Game)}/${(Game.state.village.roster || []).length} over=${!!Game.over} extinct=${!!(Game.state.village || {}).extinct}`);
    if (Game.villageLost || Game.over) {
      deadAt = deadAt == null ? dayOf(Game) : deadAt;
      E(`[DEAD] village lost / game over at day ${deadAt}; tail ${tailLeft}d`);
      endReason = Game.villageLost ? 'village-lost' : 'over-other';
      const tail = await runDays(Game, oracleV2, { days: Math.min(tailLeft, CHUNK) });
      day += (tail.days || 0);
      (tail.samples && tail.samples.deaths || []).forEach(d => allDeaths.push(d));
      break;
    }
    if (r.endReason !== 'survived') { endReason = r.endReason; break; }
    endReason = 'survived';
  }
  if (endReason === 'survived' && day >= DAYS) endReason = 'survived';

  // census
  const v = Game.state.village || {};
  const roster = v.roster || [];
  const alive = [];
  for (const vid of roster) {
    const c = (v.rosterChars || {})[vid];
    if (c && c.alive !== false) alive.push({ name: firstName(rawName(Game, vid)), health: (v.health || {})[vid] });
  }
  let pgCrises = {};
  try { pgCrises = (Game.progState() || {}).crises || {}; } catch (e) {}

  // distinct crisis kind day-of first fire (authoritative timeline)
  const kindDay = {};
  for (const f of crisisFires) if (kindDay[f.kind] == null) kindDay[f.kind] = f.day;

  E(`--- seed ${SEED} summary ---`);
  E(`days=${day} endReason=${endReason} alive=${alive.length}/${roster.length} pantry=${pantryKcal(Game)}`);
  E(`crises fired: ${crisisFires.map(f => f.kind + '@' + f.day).join(', ') || '(none)'}`);
  E(`deaths: ${allDeaths.length}`);

  const rec = {
    tool: 'diag-crisis-count-20261019', seed: SEED, daysSimmed: day, endReason,
    crisisFires, kindDay, pgCrises: Object.keys(pgCrises),
    deathCount: allDeaths.length,
    deaths: allDeaths.map(d => ({ day: d.day, who: firstName(String(d.who || '')), cause: d.cause, player: !!d.player })),
    census: { alive: alive.length, roster: roster.length, pantryKcal: pantryKcal(Game),
              aliveList: alive.map(a => a.name + ':' + Math.round(a.health != null ? a.health : -1)) },
  };
  console.log(JSON.stringify(rec));
})();
