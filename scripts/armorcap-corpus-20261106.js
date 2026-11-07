#!/usr/bin/env node
// Fresh field corpus for the armor-cap test re-baseline (finding #1832,
// prereg evidence/2026-11-06/sim-armorcap-b-prereg.md).
//
// MIRROR NOTE: the harness below (mulberry32, loadAll, freshScholar, KIT,
// runPlayerFight, runTank, Part 4 fieldFight) is a line-for-line mirror of
// scripts/test-armor-cap-20261009.js, parameterized only by SEED (env) and
// the tank fight count (12 here, 4 in the test — the guard redesign in the
// prereg). If the test file changes, this mirror must be re-diffed against
// it before the corpus is trusted. Run order mirrors the test: Part 2
// (spear, spear+hide, spear+kit) then Part 2b tank then Part 4.
//
// Usage: SEED=<seed> node scripts/armorcap-corpus-20261106.js
//   writes evidence/2026-11-06/perseed-armorcap-b/armorcap-<seed>.json
//   node scripts/armorcap-corpus-20261106.js --summarize
//   writes evidence/2026-11-06/perseed-armorcap-b/armorcap-corpus-summary.json
// Zero src/js touched. Never stubs Game.save.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const OUTDIR = path.join(ROOT, 'evidence', '2026-11-06', 'perseed-armorcap-b');
const SEEDS = [20261009, 7, 424242, 20261106, 555, 12345, 999, 31337];

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function loadAll(seed) {
  delete globalThis.Scattering;
  Math.random = mulberry32(seed);
  global.window = global;
  global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
  global.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const files = [...html.matchAll(/<script src="([^"]+)"/g)]
    .map(m => m[1].split('?')[0])
    .filter(f => f.startsWith('src/js/'))
    .filter(f => !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(f));
  for (const f of files) eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  delete global.window;
  return globalThis.Scattering.Game;
}

const says = [];
function endTurn(Game) {
  if (!Game.tbfight || Game.tbfight.over) return;
  if (!Game.tbIsPlayerTurn()) return;
  const p = Game.tbFighter('p'); p.moveLeft = 0; p.acted = true;
  Game.tbAfterPlayerAction();
}
function freshScholar(Game) {
  const s = Game.state.scholar;
  for (const k of ['tradeOpen', 'settleDebtBonus', 'debtSettled', 'braceActive', 'shakeOffUsed',
    'haymakerReady', 'rageActive', 'fightRead', 'loomActive', 'fightDamageTaken',
    'ambushReady', 'noDodgeNext', 'aimBonus', 'deadAimShot', 'ignoreArmorNext']) delete s[k];
  s.health = 100; s.kcal = 2600; s.hydration = 80; s.energy = 100; s.water = [];
  s.trauma = 0; s.mx = 4; s.my = 4; s.equipped = {};
  s.abilities = []; s.backgroundAbilities = [];
  return s;
}
const KIT = [
  ['head', 'skull_helm', 'Skull Helm'],
  ['torso', 'hide_armor', 'Hide Armor'],
  ['legs', 'canvas_pants', 'Canvas Pants'],
  ['hands', 'work_gloves', 'Work Gloves'],
  ['shoes', 'good_boots', 'Good Boots'],
];
function runPlayerFight(Game, monId, gear) {
  if (Game.inCombat()) { try { Game.tbfight.over = true; } catch (e) {} }
  const s = freshScholar(Game);
  s.equipped.melee = { itemId: 'hunting_spear', name: 'Hunting Spear' };
  if (gear === 'spear+hide') s.equipped.torso = { itemId: 'hide_armor', name: 'Hide Armor' };
  if (gear === 'spear+kit') for (const [slot, id, name] of KIT) s.equipped[slot] = { itemId: id, name };
  const prot = Game.armorBonus();
  says.length = 0;
  Game.startCombat(monId);
  const mRefs = Game.tbfight ? Game.tbfight.fighters.filter(x => x.kind === 'monster') : [];
  let rounds = 0, minHp = 100, fled = false;
  const absorbLines = [];
  while (Game.inCombat() && rounds < 40) {
    const p = Game.tbFighter('p');
    if (!p || !p.alive) break;
    if (p.hp < minHp) minHp = p.hp;
    const m = Game.tbfight.fighters.find(x => x.kind === 'monster' && x.alive && !x.fled);
    if (!m) break;
    if (p.fled) { fled = true; break; }
    if (!Game.tbIsPlayerTurn()) { endTurn(Game); continue; }
    Game.tbPlayerStrike(m.key);
    rounds++;
    endTurn(Game);
  }
  for (const t of says) { const m = /Armor absorbs (\d+)/.exec(t); if (m) absorbLines.push(+m[1]); }
  says.length = 0;
  const p = Game.tbFighter('p');
  if (p && p.alive && p.hp < minHp) minHp = p.hp;
  const dead = mRefs.filter(m => m.hp <= 0).length;
  const routed = mRefs.filter(m => m.hp > 0 && m.fled).length;
  if (Game.inCombat()) { try { Game.tbfight.over = true; } catch (e) {} }
  return { rounds, hpCost: 100 - minHp, killed: dead, routed, fled,
           playerAlive: !p || p.alive, resolved: dead + routed === mRefs.length, prot, absorbLines };
}
function runTank(Game, monId) {
  if (Game.inCombat()) { try { Game.tbfight.over = true; } catch (e) {} }
  const s = freshScholar(Game);
  s.equipped.melee = { itemId: 'hunting_spear', name: 'Hunting Spear' };
  s.equipped.torso = { itemId: 'hide_armor', name: 'Hide Armor' }; // P=20
  says.length = 0;
  Game.startCombat(monId);
  let rounds = 0;
  const absorbLines = [];
  while (Game.inCombat() && rounds < 8) {
    const p = Game.tbFighter('p');
    if (!p || !p.alive) break;
    if (!Game.tbIsPlayerTurn()) {
      const q = Game.tbFighter('p'); if (q) { q.moveLeft = 0; q.acted = true; }
      try { Game.tbAfterPlayerAction(); } catch (e) {}
      continue;
    }
    try { Game.tbPlayerWait(); } catch (e) { break; }
    rounds++;
  }
  for (const t of says) { const m = /Armor absorbs (\d+)/.exec(t); if (m) absorbLines.push(+m[1]); }
  says.length = 0;
  if (Game.inCombat()) { try { Game.tbfight.over = true; } catch (e) {} }
  return absorbLines;
}

const MONS = ['hushwolf', 'belltoad', 'bulldozer', 'lockpick_raccoon'];
const N = 6;          // Part 2 fights per (gear, monster) per seed — test's own N
const N_TANK = 12;    // tank fights per monster per seed — prereg redesign (was 4)

async function collect(seed) {
  const Game = loadAll(seed);
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  try { Game.location = 'haven'; } catch (e) {}
  Game.state.weather = 'clear';
  Game.say = (t) => { says.push(String(t)); };

  const part2 = {};
  for (const gear of ['spear', 'spear+hide', 'spear+kit']) {
    part2[gear] = {};
    for (const id of MONS) {
      const fights = [];
      for (let i = 0; i < N; i++) {
        const r = runPlayerFight(Game, id, gear);
        fights.push({ rounds: r.rounds, hpCost: r.hpCost, killed: r.killed,
          routed: r.routed, fled: r.fled, playerAlive: r.playerAlive,
          resolved: r.resolved, prot: r.prot, nAbs: r.absorbLines.length,
          maxAbs: r.absorbLines.length ? Math.max(...r.absorbLines) : 0,
          absorbs: r.absorbLines });
      }
      const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
      part2[gear][id] = { fights, batchMeanCost: +mean(fights.map(f => f.hpCost)).toFixed(2),
        batchMeanRounds: +mean(fights.map(f => f.rounds)).toFixed(2),
        totalAbsLines: fights.reduce((x, f) => x + f.nAbs, 0) };
    }
  }

  const tank = {};
  for (const id of ['hushwolf', 'bulldozer', 'belltoad']) {
    const fights = [];
    for (let i = 0; i < N_TANK; i++) {
      const abs = runTank(Game, id);
      fights.push({ nHits: abs.length, absorbs: abs,
        meanAbs: abs.length ? +(abs.reduce((a, b) => a + b, 0) / abs.length).toFixed(2) : null,
        maxAbs: abs.length ? Math.max(...abs) : 0 });
    }
    const all = fights.flatMap(f => f.absorbs);
    tank[id] = { fights, totalHits: all.length,
      meanAbsorbed: all.length ? +(all.reduce((a, b) => a + b, 0) / all.length).toFixed(2) : null,
      batchMeanAbsorbedPerFight: +(fights.reduce((x, f) => x + (f.meanAbs || 0), 0) / fights.length).toFixed(2) };
  }

  // Part 4 characterization (relational checks, not banded): villager
  // fieldFight vs hushwolf, 4 unarmored + 4 hide-armored.
  const part4 = {};
  {
    const v = Game.state.village;
    const npcIds = (v.roster || []).filter(id => id !== Game.villagerId);
    const vid = npcIds[3] || npcIds[0];
    const vp = (Game.data.villagers || []).find(x => x.id === vid) ||
               (Game.data.background_survivors || []).find(x => x.id === vid);
    const mdef = (Game.data.monsters || []).find(m => m.id === 'hushwolf');
    v.health = v.health || {};
    const run4 = (equip) => {
      if (equip) { vp.items = ['hide_armor']; vp.equipped = { torso: { itemId: 'hide_armor', name: 'Hide Armor' } }; }
      else { vp.items = []; vp.equipped = {}; }
      const fights = [];
      for (let i = 0; i < 4; i++) {
        v.health[vid] = 100;
        const rec = Game.fieldFight(vid, mdef, null, {});
        fights.push({ vTaken: rec.vTaken, rounds: rec.rounds, outcome: rec.outcome,
          absorbLines: (rec.log || []).filter(l => /gear absorbs/.test(l)).length });
      }
      return fights;
    };
    part4.villagerId = vid;
    part4.unarmored = run4(false);
    part4.armored = run4(true);
    vp.items = []; vp.equipped = {};
  }

  let head = '';
  try { head = execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim(); } catch (e) {}
  return { seed, generated_utc: new Date().toISOString(), base: head,
    armorK: 6, nPerCell: N, nTank: N_TANK, part2, tank, part4 };
}

function mean(a) { return a.reduce((x, y) => x + y, 0) / a.length; }
function sd(a) {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(a.reduce((x, y) => x + (y - m) * (y - m), 0) / (a.length - 1));
}

function summarize() {
  const files = SEEDS.map(s => path.join(OUTDIR, `armorcap-${s}.json`));
  for (const f of files) if (!fs.existsSync(f)) throw new Error('missing corpus file ' + f);
  const corpora = files.map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
  const summary = { seeds: SEEDS, generated_utc: new Date().toISOString(), base: corpora[0].base,
    unarmoredBaseline: {}, tank: {}, part4: {} };
  for (const id of MONS) {
    const batchMeans = corpora.map(c => c.part2['spear'][id].batchMeanCost);
    const m = mean(batchMeans), s = sd(batchMeans), sem = s / Math.sqrt(batchMeans.length);
    const M = Math.max(10, 2 * sem);
    summary.unarmoredBaseline[id] = { batchMeans, mean: +m.toFixed(2), sd: +s.toFixed(2),
      sem: +sem.toFixed(2), margin: +M.toFixed(2),
      band: [Math.max(0, Math.floor(m - M)), Math.min(100, Math.ceil(m + M))] };
  }
  for (const id of ['hushwolf', 'bulldozer', 'belltoad']) {
    // Per-batch mean absorbed OVER LANDED HITS ONLY: a fight the monster
    // never attacks absorbs nothing and says nothing about the absorb size.
    // A batch (seed) with zero landed hits is EXCLUDED from the derivation
    // set, not counted as 0 — counting it as 0 would drag the band below
    // the value the test itself measures (mean over landed hits) and make
    // the test fail its own band. If fewer than 4 batches have hits, no
    // avg-absorbed band is derived for that monster (band: null) and the
    // test skips the avg check for it.
    const batchMeans = corpora.map(c => {
      const landed = c.tank[id].fights.flatMap(f => f.absorbs);
      return landed.length ? mean(landed) : null;
    }).filter(x => x !== null);
    const totalHits = corpora.reduce((x, c) => x + c.tank[id].totalHits, 0);
    const allAbs = corpora.flatMap(c => c.tank[id].fights.flatMap(f => f.absorbs));
    if (batchMeans.length >= 4) {
      const m = mean(batchMeans), s = sd(batchMeans), sem = s / Math.sqrt(batchMeans.length);
      const M = Math.max(2, 2 * sem);
      summary.tank[id] = { batchMeans: batchMeans.map(x => +x.toFixed(2)), mean: +m.toFixed(2),
        sd: +s.toFixed(2), sem: +sem.toFixed(2), margin: +M.toFixed(2),
        band: [Math.max(0, Math.floor(m - M)), Math.ceil(m + M)],
        batchesWithHits: batchMeans.length,
        totalHits, pooledMeanAbsorbed: allAbs.length ? +(allAbs.reduce((a, b) => a + b, 0) / allAbs.length).toFixed(2) : null };
    } else {
      summary.tank[id] = { batchMeans: batchMeans.map(x => +x.toFixed(2)), mean: null,
        sd: null, sem: null, margin: null, band: null,
        batchesWithHits: batchMeans.length,
        totalHits, pooledMeanAbsorbed: allAbs.length ? +(allAbs.reduce((a, b) => a + b, 0) / allAbs.length).toFixed(2) : null,
        note: 'fewer than 4 batches with landed hits — no avg-absorbed band derived; test skips the avg check for this monster' };
    }
  }
  for (const leg of ['unarmored', 'armored']) {
    const perRound = corpora.flatMap(c => c.part4[leg].map(f => f.vTaken / Math.max(1, f.rounds)));
    summary.part4[leg] = { fights: corpora.reduce((x, c) => x + c.part4[leg].length, 0),
      meanPerRound: +mean(perRound).toFixed(2),
      outcomes: corpora.flatMap(c => c.part4[leg].map(f => f.outcome)).reduce((acc, o) => { acc[o] = (acc[o] || 0) + 1; return acc; }, {}) };
  }
  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(path.join(OUTDIR, 'armorcap-corpus-summary.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify(summary, null, 2));
}

(async () => {
  if (process.argv.includes('--summarize')) { summarize(); return; }
  const seed = parseInt(process.env.SEED || '20261009', 10);
  const rec = await collect(seed);
  fs.mkdirSync(OUTDIR, { recursive: true });
  const out = path.join(OUTDIR, `armorcap-${seed}.json`);
  fs.writeFileSync(out, JSON.stringify(rec, null, 2) + '\n');
  console.log('wrote ' + out);
  console.log(`  seed ${seed}: unarmored batchMeanCost ` +
    MONS.map(id => `${id}=${rec.part2['spear'][id].batchMeanCost}`).join(' ') +
    ` | tank totalHits ` +
    ['hushwolf', 'bulldozer', 'belltoad'].map(id => `${id}=${rec.tank[id].totalHits} (meanAbs ${rec.tank[id].meanAbsorbed})`).join(' '));
})().catch(e => { console.error('CORPUS ERROR', e); process.exit(2); });
