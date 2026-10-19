#!/usr/bin/env node
// pilot-crisis-schism-20261019.js — CRISIS LEG r28 (lane B): THE SCHISM QUESTION.
//
// Pre-registration:
//   QUESTION: is the schism crisis reachable? It fires only on exile
//   (moot verdict 'exile' / freeloader vote-out via removeVillager(vid,'exiled'),
//   or exilePlayer('moot') when the moot casts the player out). r25: 0/4
//   competent (oracleV2) seeds fired it. The endgame deed gate needs 3+ of 6
//   crisis kinds and is reachable without schism — but schism is the
//   crime-path crisis, and the r24 cannibalism work ranked it above murder.
//   If a dedicated thief can't get exiled, the beat is effectively unfireable.
//   Seeds: 7, 42, 99, 424242 (continuity with r25). Policy: larcenyLeaning
//   (steals, cold neighbor, crime-pressure). Horizon: 120d death-aware (+10d tail).
// Interesting finding: schism fires >=1/4 hot seeds (reachable), or 0/4
//   (blank: unfireable beat / exile machinery dead under hot play).
// Metrics: schismFires (bound: any >0 = reachable); mootFirings; exile count;
//   case resolutions by path; justiceHeat series.
// Usage: SEED=7 DAYS=120 node pilot-crisis-schism-20261019.js > rec.json 2> log
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const POLICY_NAME = process.env.POLICY || 'larceny';
const policy = POLICY_NAME === 'drain'
  ? require(path.join(ROOT, 'scripts', 'policies', 'pantry-drain')).pantryDrain
  : require(path.join(ROOT, 'scripts', 'policies', 'larceny-leaning')).larcenyLeaning;

const SEED = parseInt(process.env.SEED || '7', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);
const CHUNK = 10;
const E = (s) => console.error(s);

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function aliveCount(Game) {
  try {
    return (Game.state.village.roster || []).filter(id => {
      const c = (Game.state.village.rosterChars || {})[id]; return c && c.alive !== false;
    }).length;
  } catch (e) { return -1; }
}
function nm(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return String(rc.name).split(' ')[0]; } catch (e) {}
  try { return String(Game.displayName(vid)).split(' ')[0]; } catch (e) {}
  return String(vid).slice(0, 10);
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-schism' });
  await setupGame(Game);

  // --- instruments ---
  const schismFires = [];   // {day, ctxName, alive}
  const exileCalls = [];    // removeVillager 'exiled' calls {day, who}
  const playerExiles = [];  // exilePlayer calls {day, how}
  const schismLines = [];   // say() lines mentioning exile/cast-out within 2 days of a fire
  const _fc = Game.fireCrisis ? Game.fireCrisis.bind(Game) : null;
  if (_fc) {
    Game.fireCrisis = function (kind, ctx) {
      const r = _fc(kind, ctx);
      if (r && kind === 'schism') {
        schismFires.push({ day: dayOf(Game), name: (ctx && ctx.name) || '?', alive: aliveCount(Game) });
        E(`[SCHISM] day ${dayOf(Game)}: name=${(ctx && ctx.name) || '?'} alive=${aliveCount(Game)}`);
      }
      return r;
    };
  }
  const _rv = Game.removeVillager ? Game.removeVillager.bind(Game) : null;
  if (_rv) {
    Game.removeVillager = function (vid, how) {
      if (how === 'exiled') exileCalls.push({ day: dayOf(Game), who: nm(Game, vid) });
      return _rv(vid, how);
    };
  }
  const _ep = Game.exilePlayer ? Game.exilePlayer.bind(Game) : null;
  if (_ep) {
    Game.exilePlayer = function (how) {
      playerExiles.push({ day: dayOf(Game), how });
      E(`[PLAYER-EXILE] day ${dayOf(Game)} how=${how}`);
      return _ep(how);
    };
  }
  // capture the loud schism/exile lines (say is the narration channel)
  const _say = Game.say ? Game.say.bind(Game) : null;
  if (_say) {
    Game.say = function (txt) {
      const t = String(txt || '');
      if (/exil|cast out|walk out|schism/i.test(t)) schismLines.push({ day: dayOf(Game), line: t.slice(0, 300) });
      return _say(txt);
    };
  }

  // justice heat series + moot case count
  const heatSeries = [];
  const caseResolutions = [];
  const seenCases = new Set();

  E(`[SETUP] seed ${SEED}: ${POLICY_NAME} running to day ${DAYS}...`);
  let day = 0, tailLeft = 10, deadAt = null, endReason = '?';
  while (day < DAYS) {
    const r = await runDays(Game, policy, { days: CHUNK });
    day += (r.days || 0);
    try {
      const h = typeof Game.justiceHeat === 'function' ? Game.justiceHeat() : null;
      heatSeries.push({ day: dayOf(Game), heat: h });
    } catch (e) {}
    // sweep cases for new resolutions
    try {
      const cases = ((Game.betrayalState && Game.betrayalState()) || {}).cases || [];
      for (const c of cases) {
        if (c && c.id != null && !seenCases.has(c.id)) {
          seenCases.add(c.id);
          caseResolutions.push({
            day: dayOf(Game), id: c.id, charge: c.charge,
            accused: (c.accused || []).map(a => nm(Game, a)),
            status: c.status, resolution: c.resolution,
          });
          E(`[CASE] day ${dayOf(Game)}: ${c.charge} vs ${(c.accused || []).map(a => nm(Game, a)).join(',')} -> ${c.resolution || c.status}`);
        }
      }
    } catch (e) {}
    E(`[CHUNK] gameday ${dayOf(Game)} chunkday ${day} alive=${aliveCount(Game)} over=${!!Game.over}`);
    if (Game.villageLost || Game.over) {
      deadAt = deadAt == null ? dayOf(Game) : dayOf(Game);
      E(`[DEAD] village lost / game over at day ${deadAt}; tail ${tailLeft}d`);
      endReason = Game.villageLost ? 'village-lost' : 'over-other';
      const tail = await runDays(Game, policy, { days: Math.min(tailLeft, CHUNK) });
      day += (tail.days || 0);
      break;
    }
    if (r.endReason !== 'survived') { endReason = r.endReason; break; }
    endReason = 'survived';
  }
  if (endReason === 'survived' && day >= DAYS) endReason = 'survived';

  let pgCrises = {};
  try { pgCrises = (Game.progState() || {}).crises || {}; } catch (e) {}

  const rec = {
    tool: 'pilot-crisis-schism-20261019', seed: SEED, daysSimmed: day, endReason,
    schismFires, schismFireCount: schismFires.length,
    exileCalls, playerExiles,
    caseResolutions,
    heatSeries,
    schismLines: schismLines.slice(0, 40),
    pgCrises: Object.keys(pgCrises),
    census: { alive: aliveCount(Game), roster: (Game.state.village.roster || []).length },
  };
  E(`--- seed ${SEED} summary: schism=${schismFires.length} exiles=${exileCalls.length} playerExiles=${playerExiles.length} cases=${caseResolutions.length} ---`);
  console.log(JSON.stringify(rec));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
