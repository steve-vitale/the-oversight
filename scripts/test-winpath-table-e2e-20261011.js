#!/usr/bin/env node
// test-winpath-table-e2e-20261011.js — win-path lever SENSE drive (2026-10-11).
// Drives the full chain on a constructed lesser-seat mid-game state:
//   lesser bar -> checkArc -> tableScene (dawn) -> defiant path walked
//   beat-by-beat through real chooseTableOption -> finals -> epilogue -> won.
// Dumps the FULL transcript for sense-reading (SENSE-TESTING LAW: prove it
// is SENSICAL, not just functional). Also runs two villager conversations
// at "day 105" for the people-check.
// This is a sense instrument, not a pass/fail gate: it exits 0 when the
// chain completes (won=true) and writes the transcript for human reading.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(parseInt(process.env.SEED || '777', 10));

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

const transcript = [];
Game.say = function (t) { transcript.push(String(t)); };
Game.sysSay = function (t) { transcript.push('SYS: ' + String(t)); };
Game.wipe = function () { transcript.push('(wipe called — run ends here)'); };
Game.save = function () {};

function monstersOfWave(w, n) {
  return (Game.data.monsters || []).filter(m => (m.wave || 1) === w).slice(0, n).map(m => m.id);
}
function vname(vid) { try { return Game.displayName(vid) || vid; } catch (e) { return vid; } }

// --- conversation driver (adapted from test-journey-endgame-20261011.js) ---
function pickChoice(list, turn) {
  if (!list || !list.length) return null;
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of ['dlg:engage', 'dlg:ask', 'dlg:comfort', 'dlg:share', 'dlg:teach', 'dlg:listen', 'ask:teach_me', 'want:ask']) {
    const c = list.find(x => x && x.id === id); if (c) return c;
  }
  for (const id of ['dlg:encourage', 'dlg:reassure', 'dlg:joke', 'dlg:smalltalk']) {
    const c = list.find(x => x && x.id === id); if (c) return c;
  }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  // stay a while before leaving: prefer any non-leave choice
  const stay = list.find(x => x && x.id && x.id !== 'leave' && x.id.indexOf('leave') !== 0);
  if (stay && turn < 5) return stay;
  return list.find(x => x && x.id === 'leave') || null;
}
function runConversation(vid, day) {
  const L = [];
  try {
    const r0 = Game.startConvo(vid);
    L.push(`=== day ${day} — conversation with ${vname(vid)} ===`);
    L.push(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : [];
      if (!choices.length) { try { choices = Game.convoChoices(vid); } catch (e) { choices = []; } }
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { L.push('YOU: (leave)'); break; }
      L.push(`YOU: [${pick.id}] ${(pick.label || '').slice(0, 80)}`);
      r = Game.convoTurn(vid, pick.id);
      if (r.line) L.push(`THEM: ${r.line}`);
      if (r.ended) { L.push('(ended by engine)'); break; }
    }
    const endR = Game.endConvo(vid, 'done');
    if (endR && endR.line) L.push(`closing: ${endR.line}`);
  } catch (e) { L.push('CONVO ERROR: ' + (e && e.message)); }
  return L.join('\n');
}

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const me = Game.villagerId;

  // ---- village texture: trust, a moral ledger, day 105 ----
  Game.state.scholar.day = 105;
  Game.state.systemArrived = true;
  Game.state.scholar.integration = 55;
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== me);
  Game.state.village.trust = {};
  roster.forEach((id, i) => { Game.state.village.trust[id] = 45 + (i * 7) % 45; });
  try {
    Game.ledgerAdd('protected', 6); Game.ledgerAdd('might', 4);
    Game.ledgerAdd('foodShared', 5); Game.ledgerAdd('promisesKept', 3);
    Game.ledgerAdd('defiance', 5); // earn the defiant door
    Game.ledgerAdd('showmanship', 4);
  } catch (e) {}
  // two dead villagers in the record (witness texture)
  try {
    Game.state.village.dead = Game.state.village.dead || {};
    Game.state.village.dead[roster[8]] = { cause: 'combat', day: 61 };
    Game.state.village.dead[roster[9]] = { cause: 'starvation', day: 77 };
  } catch (e) {}

  // ---- the lesser bar (real feeds where cheap) ----
  for (const w of [1, 2, 3]) for (const id of monstersOfWave(w, w === 3 ? 3 : 4)) Game.recordDeedFight(id);
  Game.deedState().contestsSurvived = 2;
  Game.fireCrisis('breach'); Game.fireCrisis('first-grave');
  Game.state.networkLive = true;
  Game.progState().sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = true;
  // pantry for the defiant's first price
  try {
    const v = Game.state.village; v.pantry = v.pantry || [];
    v.pantry.push({ kcalEach: 5000, units: 10 });
  } catch (e) {}

  transcript.push('########## THE CHAIN: checkArc -> tableScene ##########');
  const seat = Game.tableSeat();
  transcript.push(`(seat: ${seat.seat})`);
  const pg = Game.progState();
  pg.arc = 3; pg.arcSeen = { 1: true, 2: true, 3: true };
  const cx = (Game.state.codex = Game.state.codex || {});
  cx.plants = cx.plants || {};
  for (let i = 0; i < 14; i++) cx.plants['e2eplant' + i] = { level: 2 };
  Game.state.contestsHeld = 1; // arc-2 deed prereq (orthogonal scaffolding)
  Game.checkArc();
  transcript.push(`(arc after checkArc: ${pg.arc}, tableWaiting: ${pg.tableWaiting})`);
  if (!pg.tableWaiting) transcript.push('!! tableWaiting NOT set — the invitation did not fire');
  Game.tableScene();

  // ---- walk the defiant path ----
  const tc0 = Game.state.scholar.tableChoices;
  const earned = (tc0 && tc0.options) || [];
  transcript.push(`(paths offered: ${earned.map(o => o.id).join(', ')})`);
  const defiantOpt = earned.find(o => o.id === 'path:defiant');
  if (!defiantOpt) { transcript.push('!! defiant not offered at lesser seat'); }
  else {
    Game.chooseTableOption('path:defiant');
    let guard = 0;
    while (guard++ < 30) {
      const T = Game.tableState();
      if (T.phase === 'done') break;
      if (T.phase === 'finals') {
        const def = (function () { try { return Game.tablePathDef ? Game.tablePathDef('defiant') : null; } catch (e) { return null; } })();
        const tc = Game.state.scholar.tableChoices;
        const finOpt = tc && tc.options && tc.options[0];
        transcript.push(`(finals options: ${(tc.options || []).map(o => o.id).join(', ')})`);
        Game.chooseTableOption(finOpt ? finOpt.id : 'final:x');
        continue;
      }
      if (T.phase === 'downgrade') { transcript.push('!! challenge failed -> downgrade'); break; }
      const tc = Game.state.scholar.tableChoices;
      const opts = (tc && tc.options) || [];
      if (!opts.length) { transcript.push('!! no options at beat ' + T.beat); break; }
      // Try options in order until the beat advances.
      let advanced = false;
      for (const o of opts) {
        const b0 = T.beat, m0 = JSON.stringify(T.meters || {});
        Game.chooseTableOption(o.id);
        const T2 = Game.tableState();
        if (T2.phase !== 'challenge' || T2.beat !== b0 || JSON.stringify(T2.meters || {}) !== m0) { advanced = true; break; }
      }
      if (!advanced) { transcript.push('!! stall: no option advanced beat ' + T.beat); break; }
    }
    const T = Game.tableState();
    transcript.push(`(table phase: ${T.phase}, path: ${T.path}, branch: ${T.branch})`);
  }
  transcript.push(`(won=${!!Game.won} over=${!!Game.over})`);

  // ---- people check: two conversations at day 105 ----
  transcript.push('');
  transcript.push('########## PEOPLE CHECK (day 105) ##########');
  const alive = roster.filter(id => !(Game.state.village.dead || {})[id]).slice(0, 4);
  transcript.push(runConversation(alive[0], 105));
  transcript.push('');
  transcript.push(runConversation(alive[1], 105));

  const out = transcript.join('\n');
  fs.writeFileSync('/tmp/winpath-e2e-transcript.txt', out);
  console.log(out.slice(0, 6000));
  console.log('\n... (full transcript: /tmp/winpath-e2e-transcript.txt, ' + out.length + ' chars)');
  console.log('CHAIN COMPLETE: won=' + !!Game.won);
})().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
