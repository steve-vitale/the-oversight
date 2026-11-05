#!/usr/bin/env node
// test-sitter-coda-r138-20261105.js — journey-endgame r138 (lane B, 2026-11-05).
// PROOF TEST for the seat-taker-voice fix in src/js/table.js (tableEpilogue):
// the win coda's walk-out line must name the one who walked the scenario.
// Before the fix it always named the Bearer (this.villagerId), so a
// villager sitter's walk ended with "Bill Palmer walks out of the light
// alone" even though Amelia Moon sat and played the whole walk — and the
// pronouns followed the bearer too. After the fix the coda names the
// sitter (with the sitter's pronouns); a self-sitter keeps the current
// bearer (so a trial death still hands the line to the mantle's heir).
// Walk: prepared-state dark feared walk (mercy opening, trial withheld
// for the sitter, hold, name, example) at day 90, seed 777 — the same
// walk as dark-probe V3. Two walks: A = villager sitter, B = self-sitter
// control (no regression on the default path). Exit 0 = all pass.
// Usage: node scripts/test-sitter-coda-r138-20261105.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

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

function teleEvents(Game, type) {
  const t = (Game.state && Game.state.telemetry) || [];
  const arr = Array.isArray(t) ? t : (t.events || []);
  return arr.filter(e => e && (e.type === type || e.t === type));
}

async function walk(label, useSitter) {
  const { Game } = await loadGame({ seed: 777 });
  await setupGame(Game, 'Columbus, Ohio');
  const lines = [];
  const origSay = Game.say, origSys = Game.sysSay;
  Game.say = function (t) { lines.push(String(t)); try { return origSay.apply(this, arguments); } catch (e) {} };
  Game.sysSay = function (t) { lines.push('SYS:' + String(t)); try { return origSys.apply(this, arguments); } catch (e) {} };
  const T = () => Game.tableState();
  const offered = () => { const tc = Game.state.scholar.tableChoices; return tc ? (tc.options || []).map(o => o.id) : []; };
  const checks = [];
  const check = (id, ok, detail) => { checks.push({ id, ok: !!ok, detail: detail || '' }); console.log(`  [${label}] ${ok ? 'PASS' : 'FAIL'} ${id}${detail ? ' — ' + detail : ''}`); };
  try {
    lesserSeat(Game);
    const bearerId = Game.villagerId;
    const bearer = (Game.data.villagers || []).find(v => v.id === bearerId) || {};
    const bearerFull = bearer.name || 'the Bearer';
    let sitter = null, sitterFull = null, sitterPro = null;
    if (useSitter) {
      const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
      const sid = roster[0];
      sitter = (Game.data.villagers || []).find(v => v.id === sid) || {};
      sitterFull = sitter.name || 'the Sitter';
      sitterPro = sitter.gender === 'm' ? 'he' : sitter.gender === 'f' ? 'she' : 'they';
      Game.tableState().seatTaker = { id: sid, name: sitter.name || 'the Sitter', self: false };
    }
    Game.state.scholar.day = 90;
    Game.tableScene();
    check('seat-lesser', (Game.tableSeat() || {}).seat === 'lesser', 'seat=' + ((Game.tableSeat() || {}).seat));
    Game.chooseTableOption('path:feared');
    if (T().phase === 'conscript') Game.chooseTableOption('conscript:no');
    Game.chooseTableOption('beat:mercy');
    if (useSitter) {
      Game.chooseTableOption('beat:trial');
      check('trial-withheld', lines.some(l => /TRIAL WITHHELD/.test(l)), 'guard line present');
      Game.chooseTableOption('beat:hold');
    } else {
      // Self-sitter control skips the trial (V2 pattern): taking it with
      // fresh gear kills the bearer and the walk leaves the win path.
      Game.chooseTableOption('beat:hold');
    }
    Game.chooseTableOption('beat:name');
    if (T().phase === 'downgrade') throw new Error('unexpected curdle: horror hit 5 on a mercy opening');
    Game.chooseTableOption('final:example');
    const won = teleEvents(Game, 'table_won');
    check('ending-recorded', won.length > 0, `table_won events=${won.length}`);
    const walkOut = lines.find(l => /walks out of the light alone/.test(l)) || '';
    check('walkout-line-present', !!walkOut, walkOut ? walkOut.slice(0, 60) + '…' : 'no walk-out line in transcript');
    if (useSitter) {
      check('coda-names-sitter', new RegExp(sitterFull.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' walks out of the light').test(walkOut), `sitter=${sitter.name} walkout=${walkOut.slice(0, 80)}`);
      check('coda-not-bearer', !new RegExp(bearerFull.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' walks out of the light').test(walkOut), `bearer=${bearer.name} must not own the line`);
      check('coda-sitter-pronoun', new RegExp(`which is how ${sitterPro} walked in`).test(walkOut), `sitter gender=${sitter.gender} pro=${sitterPro}`);
    } else {
      check('coda-names-bearer', new RegExp(bearerFull.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' walks out of the light').test(walkOut), `bearer=${bearer.name} walkout=${walkOut.slice(0, 80)}`);
    }
    return checks;
  } finally {
    try { Game.say = origSay; Game.sysSay = origSys; } catch (e) {}
  }
}

(async () => {
  let all = [];
  all = all.concat(await walk('A-sitter', true));
  all = all.concat(await walk('B-self', false));
  const fails = all.filter(c => !c.ok);
  console.log(`\nSITTER-CODA: ${all.length - fails.length}/${all.length} checks passed${fails.length ? ' — FAILURES: ' + fails.map(f => f.id).join(', ') : ''}`);
  process.exit(fails.length ? 1 : 0);
})();
