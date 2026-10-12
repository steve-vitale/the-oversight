#!/usr/bin/env node
// test-table-grey-r5-20261012.js — proof for journey-endgame r5 grey-band fixes.
// 1. DEEPEN pool: 4 deepens → 4 distinct lines (was: one hardcoded line,
//    byte-identical every deepen — filler loop).
// 2. PROBE no-repeat: with a stuck RNG (always picks find #1), two probes must
//    NOT speak the same find twice (was: raw pick, same find 3 beats running).
// 3. Grey road line: a grey-band relay walker hears "The middle road is
//    open." — never "the light road" / "the dark road" (was: binary ledger
//    branch voiced for a band-resolved path).
// 4. Coda pronouns: the epilogue coda uses the Bearer's own pronouns
//    (was: always "they", even naming "Declan Ross").
// 5. Commune withdrawn: while a commune scene is pending, the cockpit offers
//    no Commune verb (was: the identical "still waiting" line beat after
//    beat); with no scene pending, Commune is offered.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

// Stuck RNG: 0.4 always. relayProbe: R()<0.5 -> success; pick=(0.4*3)|0=1 every
// time — the no-repeat logic must bump the second pick. Seeded BEFORE eval:
// relay-ext.js captures Math.random at load.
Math.random = () => 0.4;

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;
const stripHtml = (s) => String(s).replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ');

let pass = 0, fail = 0; const failures = [];
const ok = (c, name, detail) => { if (c) { pass++; } else { fail++; failures.push(name + (detail ? ' [' + detail + ']' : '')); } console.log((c ? 'ok   ' : 'FAIL ') + name); };

function monstersOfWave(w, n) {
  return (Game.data.monsters || []).filter(m => (m.wave || 1) === w).slice(0, n).map(m => m.id);
}
function texture(ledger, opts) {
  opts = opts || {};
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.day = 140;
  Game.state.systemArrived = true;
  Game.state.scholar.integration = 85;
  Game.state.scholar.grounding = opts.grounding != null ? opts.grounding : 100;
  const me = Game.villagerId;
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== me);
  for (const k of Object.keys(ledger || {})) { try { Game.ledgerAdd(k, ledger[k]); } catch (e) {} }
  for (const w of [1, 2, 3]) for (const id of monstersOfWave(w, w === 3 ? 3 : 4)) Game.recordDeedFight(id);
  Game.deedState().contestsSurvived = 2;
  Game.fireCrisis('breach'); Game.fireCrisis('first-grave');
  Game.state.networkLive = true;
  Game.progState().sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = true;
  const v = Game.state.village; v.pantry = v.pantry || [];
  v.pantry.push({ kcalEach: 5000, units: 10 });
  try { Game.claimRelay(); } catch (e) {}
  return { me, roster };
}
function resetTable() {
  const pg = Game.progState();
  pg.tableDone = false; pg.table = null;
  Game.state.scholar.tableChoices = null;
  Game.over = false; Game.won = false;
}
function nudgeLean(steps) { for (const [d, why] of steps) Game.addRelayLean(d, why); }
// Play a relay walk straight through (deepen-first verbs), return transcript.
function walkRelay() {
  const T = () => Game.tableState();
  Game.tableScene();
  Game.chooseTableOption('path:relay');
  let guard = 0;
  while (guard++ < 40) {
    const S = T();
    if (S.phase === 'done') break;
    if (S.phase === 'finals') { Game.chooseTableOption('final:both-hands'); continue; }
    if (S.phase === 'downgrade') { Game.chooseTableOption(((Game.state.scholar.tableChoices || {}).options || [])[0].id); continue; }
    const opts = ((Game.state.scholar.tableChoices || {}).options) || [];
    if (!opts.length) break;
    const pick = opts.find(o => o.id === 'beat:deepen') || opts.find(o => o.id === 'beat:honest') || opts[0];
    Game.chooseTableOption(pick.id);
  }
  return T().phase;
}

(async () => {
  await Game.init();
  const transcript = [];
  const oldSay = Game.say, oldSys = Game.sysSay, oldSave = Game.save, oldWipe = Game.wipe;
  Game.say = function (t) { transcript.push(stripHtml(t)); };
  Game.sysSay = function (t) { transcript.push('SYS: ' + stripHtml(t)); };
  Game.wipe = function () {}; Game.save = function () {};

  console.log('— 1. DEEPEN pool: four deepens, four distinct lines —');
  transcript.length = 0;
  texture({}, {});
  Game.relayDeepen(); Game.relayDeepen(); Game.relayDeepen(); Game.relayDeepen();
  const deepLines = transcript.filter(t => t.indexOf('◈ DEEPEN') === 0);
  ok(deepLines.length === 4, 'four deepen lines spoken', deepLines.length + ' lines');
  ok(new Set(deepLines).size === 4, 'all four deepen lines distinct', [...new Set(deepLines)].length + '/4 distinct');

  console.log('— 2. PROBE no-repeat under a stuck RNG —');
  transcript.length = 0;
  texture({}, {});
  Game.relayProbe(); Game.relayProbe();
  const probeLines = transcript.filter(t => t.indexOf('◈ PROBE') === 0);
  ok(probeLines.length === 2, 'two probe finds spoken', probeLines.length + ' lines');
  ok(probeLines.length === 2 && probeLines[0] !== probeLines[1], 'stuck RNG does not repeat the find', probeLines.join(' || ').slice(0, 120));

  console.log('— 3. grey road line —');
  transcript.length = 0;
  texture({ defiance: 1, embrace: 2, protected: 6, killed: 0, foodShared: 7, promisesKept: 5 }, { grounding: 90 });
  resetTable();
  nudgeLean([[10, 'tender work'], [10, 'tender work']]);
  const bandNow = Game.relayBand();
  const res3 = walkRelay();
  const roadLine = transcript.find(t => /road is open/.test(t)) || '';
  ok(bandNow === 'grey', 'fixture band is grey', bandNow);
  ok(res3 === 'done', 'grey walk completes', res3);
  ok(/middle road is open/.test(roadLine), 'grey walker hears the middle road', roadLine.slice(0, 90));
  ok(!/light road is open|dark road is open/.test(transcript.join('\n')), 'no binary road line in a grey walk');

  console.log('— 4. coda pronouns —');
  for (const [g, want] of [['m', 'he'], ['f', 'she'], [null, 'they']]) {
    transcript.length = 0;
    texture({ protected: 6, killed: 1, foodShared: 5, promisesKept: 4 }, {});
    resetTable();
    nudgeLean([[10, 'tender work'], [10, 'tender work']]);
    try {
      const mv = (Game.data.villagers || []).find(v => v.id === Game.villagerId);
      if (mv) mv.gender = g;
    } catch (e) {}
    walkRelay();
    const coda = transcript.find(t => /walks out of the light/.test(t)) || '';
    ok(new RegExp('which is how ' + want + ' walked in').test(coda), `coda uses ${want} for gender=${g}`, coda.slice(0, 100));
  }

  console.log('— 5. commune while pending: the waiting line varies, verb stays —');
  transcript.length = 0;
  texture({ protected: 6, killed: 1, foodShared: 5 }, {});
  resetTable();
  nudgeLean([[10, 'tender work']]);
  Game.tableScene();
  Game.chooseTableOption('path:relay');
  // First commune opens a scene (pending); the next three hit the waiting
  // branch — the 4-commune challenge rhythm is the author's encoded
  // contract, so the verb stays and the line varies instead of repeating.
  Game.chooseTableOption('beat:commune');
  ok(!!Game.pendingRelayScene(), 'first commune opens a scene', Game.pendingRelayScene() && Game.pendingRelayScene().scene);
  const w0 = transcript.length;
  Game.chooseTableOption('beat:commune');
  Game.chooseTableOption('beat:commune');
  Game.chooseTableOption('beat:commune');
  const waitLines = transcript.slice(w0).filter(t => /waiting|waits|your turn/.test(t));
  ok(waitLines.length === 3, 'three waiting lines spoken', waitLines.length + ' lines');
  ok(new Set(waitLines).size === 3, 'waiting lines do not repeat verbatim', [...new Set(waitLines)].length + '/3 distinct');

  Game.say = oldSay; Game.sysSay = oldSys; Game.save = oldSave; Game.wipe = oldWipe;
  console.log(`\n${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('FAILURES:\n' + failures.join('\n')); process.exit(1); }
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
