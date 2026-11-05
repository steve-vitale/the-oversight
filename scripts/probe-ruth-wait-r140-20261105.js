#!/usr/bin/env node
// probe-ruth-wait-r140-20261105.js — journey-endgame r140 diagnostic (NOT a
// pilot instrument; writes ONLY to perseed-endgame-r140-diag-ruth/).
//
// QUESTION: in the r138 dark-probe transcripts (v1a/v1b/v1c), Ruth takes a
// turn every round ("SYS:Ruth's turn") and never acts — no strike, no patch,
// no flee, no line at all. WHY? This probe replays the v1c trial walk
// (apex-tank, 5000-HP pool, longest fight) with villagerDecide wrapped, and
// logs every ally decide: ai, HP, distance to the foe, action type, moves.
// The wrapper is read-only: it records and delegates, changing nothing.
//
// Usage: node scripts/probe-ruth-wait-r140-20261105.js
//   writes evidence/2026-11-05/perseed-endgame-r140-diag-ruth/ruth-decide.json
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, driveFights } = require('./sim-harness');

const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-11-05', 'perseed-endgame-r140-diag-ruth');
fs.mkdirSync(OUTDIR, { recursive: true });

const DARK_LEDGER = { might: 8, brokerage: 2, showmanship: 2, embrace: 0, defiance: 6, exposed: 2, unified: 2, fractured: 1, foodShared: 1, foodHoarded: 8, protected: 2, killed: 12, betrayed: 2 };

function lesserSeat(Game) {
  Game.state.systemArrived = true; Game.state.scholar.integration = 55;
  Game.state.networkLive = true;
  Game.progState().sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {}; Game.state.scholar.prog.feastSurgeUsed = true;
  const faced = {};
  [[1, 4], [2, 4], [3, 3]].forEach(([w, n]) => { for (let i = 0; i < n; i++) faced['w' + w + 'm' + i] = w; });
  Game.progState().deeds = { wavesFaced: faced, contestsSurvived: 2 };
  Game.progState().crises = { c1: 1, c2: 1 };
  Game.progState().ledger = DARK_LEDGER;
  Game.state.village.trust = {};
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  roster.forEach((id, i) => { Game.state.village.trust[id] = 45 + (i * 3) % 30; });
  Game.state.village.viewership = 20;
}

function gearUp(Game) {
  const s = Game.state.scholar;
  s.equipped = s.equipped || {};
  s.equipped.ranged = { itemId: 'apex_bow', name: 'Apex Bow' };
  s.inventory = s.inventory || [];
  s.inventory.push({ itemId: 'arrow', material: 'arrow', units: 200, name: 'Arrows' });
  s.health = 5000;
}

(async () => {
  const { Game } = await loadGame({ seed: 777 });
  await setupGame(Game, 'Columbus, Ohio');
  const lines = [];
  const origSay = Game.say, origSys = Game.sysSay;
  Game.say = function (t) { lines.push(String(t)); try { return origSay.apply(this, arguments); } catch (e) {} };
  Game.sysSay = function (t) { lines.push('SYS:' + String(t)); try { return origSys.apply(this, arguments); } catch (e) {} };

  // Wrap villagerDecide: record every ally/villager decision, then delegate.
  const S = globalThis.Scattering || {};
  const combat = S.combat || {};
  const origDecide = combat.villagerDecide;
  const decides = [];
  if (typeof origDecide === 'function') {
    combat.villagerDecide = function (f, fighters, blocked, dangerCells, preferKey, gridMax) {
      const out = origDecide.apply(this, arguments);
      try {
        const foe = (fighters || []).filter(o => o && o.alive && !o.fled && o.kind === 'monster');
        let dmin = null;
        for (const m of foe) {
          const d = Math.max(Math.abs((f.mx || 0) - (m.mx || 0)), Math.abs((f.my || 0) - (m.my || 0)));
          if (dmin === null || d < dmin) dmin = d;
        }
        decides.push({
          round: (Game.tbfight || {}).round || null,
          key: f.key, name: f.name, kind: f.kind, ai: f.ai || null,
          hp: f.hp, maxHp: f.maxHp, speed: f.speed,
          pos: [f.mx, f.my], distFoe: dmin,
          action: (out.action || {}).type, target: (out.action || {}).target || null,
          moves: (out.moves || []).length,
          wbonus: f.wbonus || 0,
        });
      } catch (e) {}
      return out;
    };
  } else {
    console.log('RUTH-DIAG: villagerDecide NOT FOUND — cannot instrument');
  }

  lesserSeat(Game);
  Game.state.scholar.day = 90;
  gearUp(Game);
  Game.tableScene();
  Game.chooseTableOption('path:feared');
  if (Game.tableState().phase === 'conscript') Game.chooseTableOption('conscript:no');
  Game.chooseTableOption('beat:mercy');
  Game.chooseTableOption('beat:trial');
  const fightLive = !!(Game.tbfight && !Game.tbfight.over);
  console.log('RUTH-DIAG: trial fight live:', fightLive);
  const ctx = { policyId: 'ruth-diag', notes: [] };
  let calls = 0;
  while (Game.tbfight && !Game.tbfight.over && calls++ < 12) driveFights(Game, {}, ctx);
  console.log('RUTH-DIAG: drive calls:', calls, 'fight over:', !(Game.tbfight && !Game.tbfight.over));

  // Per-fighter summary.
  const byFighter = {};
  for (const d of decides) {
    const b = (byFighter[d.name] = byFighter[d.name] || { name: d.name, key: d.key, kind: d.kind, ai: d.ai, turns: 0, actions: {}, dists: [], wbonus: d.wbonus });
    b.turns++;
    b.actions[d.action] = (b.actions[d.action] || 0) + 1;
    if (d.distFoe !== null) b.dists.push(d.distFoe);
  }
  for (const b of Object.values(byFighter)) {
    b.distMin = b.dists.length ? Math.min.apply(null, b.dists) : null;
    b.distMax = b.dists.length ? Math.max.apply(null, b.dists) : null;
    delete b.dists;
  }
  // The silent-turn count: SYS "<name>'s turn" lines with no following
  // action line from that fighter before the next turn header.
  const turnHeaders = lines.filter(l => /^SYS:.+'s turn$/.test(l));
  const out = {
    probe: 'ruth-wait-r140', fightLive, driveCalls: calls,
    turns: decides.length, byFighter, decides,
    ruthTurnHeaders: turnHeaders.filter(l => l.indexOf('Ruth') >= 0).length,
    ruthDecides: decides.filter(d => d.name === 'Ruth'),
  };
  fs.writeFileSync(path.join(OUTDIR, 'ruth-decide.json'), JSON.stringify(out, null, 1));
  console.log('RUTH-DIAG: turns recorded:', decides.length);
  for (const b of Object.values(byFighter)) console.log('  ', JSON.stringify(b));
  console.log('RUTH-DIAG: Ruth turn headers:', out.ruthTurnHeaders, '| Ruth decides:', out.ruthDecides.length);
  process.exit(0);
})().catch(e => { console.error('RUTH-DIAG FAILED:', e && e.stack || e); process.exit(1); });
