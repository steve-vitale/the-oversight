#!/usr/bin/env node
// test-contest-adapt-repeat-20261011.js — the headline metric: does the
// SAME strategy keep winning? A "memorized line" policy replays its
// winning indices every repeat. Adaptation (bans, stipulations, heat)
// must make repeat winners LOSE more often.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const ROOT = path.resolve(__dirname, '..');
const SEED = parseInt(process.env.SEED || '424242', 10);
let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; } else { fail++; console.log('FAIL:', name); }
}

// DFS solver: first index-path from phase 0 that reaches 'WIN'.
function solveLine(phases) {
  const seen = new Set();
  function dfs(pi, path) {
    if (pi === 'WIN') return path;
    if (pi === 'LOSE' || pi === 'DIE' || pi === 'REFUSE') return null;
    if (typeof pi !== 'number' || !phases[pi] || seen.has(pi)) return null;
    seen.add(pi);
    const chs = phases[pi].choices || [];
    for (let i = 0; i < chs.length; i++) {
      const r = dfs(chs[i].next, path.concat(i));
      if (r) return r;
    }
    seen.delete(pi);
    return null;
  }
  return dfs(0, []);
}
// Play a memorized index line against (possibly adapted) phases.
function playLine(phases, line) {
  let pi = 0, guard = 0;
  while (guard++ < 20) {
    if (pi === 'WIN') return 'won';
    if (pi === 'LOSE' || pi === 'DIE') return 'lost';
    if (pi === 'REFUSE') return 'refused';
    const ph = phases[pi];
    if (!ph || !ph.choices || !ph.choices.length) return 'stuck';
    const want = line[pi] != null ? line[pi] : 0;
    const idx = want < ph.choices.length ? want : 0;
    pi = ph.choices[idx].next;
  }
  return 'stuck';
}

(async () => {
  Math.random = mulberry32(SEED);
  global.fetch = (f) => Promise.resolve({
    json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
  });
  const order = execSync(`grep -o 'src/js/[^\"'\"'\"']*\\.js' index.html | head -80`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
  global.window = global;
  for (const f of order) { try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { console.log('LOAD FAIL', f, e.message); process.exit(1); } }
  delete global.window;
  const Game = globalThis.Scattering.Game;
  Game.say = function () {}; Game.audioEvent = function () {};
  Game.sysSay = function () {};
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.day = 20;

  // Reset adaptation state for a clean measurement.
  Game.state.cxAdapt = null;
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.contests = {};

  const SAMPLE = ['riddle', 'auction', 'sorting', 'witness', 'cache', 'longodds',
    'price', 'impress', 'lockpick', 'wrongmap', 'alibi', 'echo', 'tidepool', 'windfall'];
  const REPS = 5;
  const winsByRep = Array(REPS).fill(0);
  const playedByRep = Array(REPS).fill(0);
  let disrupted = 0, totalAdapted = 0;

  for (const id of SAMPLE) {
    const base = Game.contestPool().find(c => c.id === id);
    if (!base) continue;
    // Isolate per-contest history so each contest is measured independently.
    const keepAdapt = Game.state.cxAdapt;
    Game.state.cxAdapt = null;
    Game.state.codex.contests[id] = undefined;
    let memLine = null;
    for (let rep = 0; rep < REPS; rep++) {
      let phases;
      try { phases = Game.contestPlayable(Game._contestScaled(Object.assign({}, base), null)); }
      catch (e) { break; }
      if (!phases || !phases.length) break;
      // Adaptation applies (no-op on rep 0 by construction).
      const contest = Game._contestScaled(Object.assign({}, base), null);
      phases = Game._cxApplyAdaptation(contest, phases);
      if (rep > 0) totalAdapted++;
      if (!memLine) {
        memLine = solveLine(phases);
        if (!memLine) break; // no winning line exists — skip contest
      }
      const outcome = playLine(phases, memLine);
      playedByRep[rep]++;
      // Record like a real win would: approach + learn + dossier.
      if (outcome === 'won') {
        winsByRep[rep]++;
        const approach = {};
        let pi = 0, g = 0;
        while (g++ < 20 && typeof pi === 'number' && phases[pi]) {
          const want = memLine[pi] != null ? memLine[pi] : 0;
          const idx = want < phases[pi].choices.length ? want : 0;
          approach[pi] = idx;
          pi = phases[pi].choices[idx].next;
        }
        Game.contestLearn(id, 'won');
        Game._cxRecordOutcome({ contestId: id, participant: 'player', _approach: approach }, 'won');
      } else if (outcome === 'lost') {
        Game.contestLearn(id, 'lost');
        Game._cxRecordOutcome({ contestId: id, participant: 'player' }, 'lost');
      }
      // Did adaptation disrupt the memorized line? (bans change the tree)
      if (rep > 0) {
        const plain = Game.contestPlayable(Game._contestScaled(Object.assign({}, base), null));
        const sigA = JSON.stringify(phases.map(p => (p.choices || []).length));
        const sigP = JSON.stringify(plain.map(p => (p.choices || []).length));
        if (sigA !== sigP) disrupted++;
      }
    }
    Game.state.cxAdapt = keepAdapt;
  }

  console.log('wins by repeat:', winsByRep.map((w, i) => `rep${i}:${w}/${playedByRep[i]}`).join(' '));
  const early = winsByRep[0] + winsByRep[1], earlyN = playedByRep[0] + playedByRep[1];
  const late = winsByRep[3] + winsByRep[4], lateN = playedByRep[3] + playedByRep[4];
  const earlyRate = earlyN ? early / earlyN : 0, lateRate = lateN ? late / lateN : 0;
  console.log(`early win rate: ${(earlyRate * 100).toFixed(1)}%, late win rate: ${(lateRate * 100).toFixed(1)}%`);
  ok(playedByRep[0] > 0, 'R1: sample contests playable');
  ok(disrupted > 0, `R2: adaptation disrupted memorized lines (${disrupted}/${totalAdapted} adapted plays)`);
  ok(lateRate < earlyRate, `R3: repeat winners win LESS (${(earlyRate * 100).toFixed(0)}% -> ${(lateRate * 100).toFixed(0)}%)`);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
