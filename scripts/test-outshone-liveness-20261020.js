#!/usr/bin/env node
// test-outshone-liveness-20261020.js — PROOF (sim-outshone-liveness diag arm).
// Out-of-arm finding from sim-tablepathdriver-confirm: the leadfeast-s81302
// armed epilogue names "Marcus Webb" in the OUTSHONE beat while a villager
// named Marcus died day 88 to The Callback on the same run.
// Diagnosis: tableAscended() iterates data.villagers with no dead filter, so
// dead villagers are named as the present-tense outshining god ("The god is
// someone else") AND priced into the audit's standing (+10 path strength per
// ascension, voiced in the audit). No canon supports posthumous ascension;
// table.js's own conventions require living villagers elsewhere (line 293
// names with !x.dead; tableFacilitate('teach') rejects person.dead).
// Fix: tableAscended(bar) skips v.dead.
// RED-verified: revert the table.js hunk (git stash pattern is FORBIDDEN on
// this tree — use `git diff src/js/table.js > /tmp/x.patch && git checkout
// HEAD -- src/js/table.js`, then `git apply /tmp/x.patch`) and the dead-
// villager tests below FAIL; re-apply and all PASS.
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
Math.random = mulberry32(parseInt(process.env.SEED || '81302', 10));

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, decodeURIComponent(new URL(f, 'https://fixture.invalid/').pathname).slice(1)), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

const SAID = [];
const realSay = Game.say.bind(Game);
Game.say = (m) => { SAID.push(String(m).replace(/<[^>]*>/g, '')); realSay(m); };

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

function monstersOfWave(w, n) {
  return (Game.data.monsters || []).filter(m => (m.wave || 1) === w).slice(0, n).map(m => m.id);
}

function buildVillage() {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const me = Game.villagerId;
  Game.state.scholar.day = 140;
  Game.state.systemArrived = true;
  Game.state.scholar.integration = 55;
  Game.state.scholar.grounding = 100;
  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== me);
  v.trust = {};
  roster.forEach((id, i) => { v.trust[id] = 45 + (i * 7) % 45; });
  for (const k of ['showmanship', 'protected', 'promisesKept']) {
    try { Game.ledgerAdd(k, { showmanship: 9, protected: 7, promisesKept: 6 }[k]); } catch (e) {}
  }
  for (const w of [1, 2, 3]) for (const id of monstersOfWave(w, w === 3 ? 3 : 4)) Game.recordDeedFight(id);
  Game.deedState().contestsSurvived = 2;
  Game.fireCrisis('breach'); Game.fireCrisis('first-grave');
  Game.state.networkLive = true;
  Game.progState().sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = true;
  v.pantry = v.pantry || [];
  v.pantry.push({ kcalEach: 5000, units: 10 });
  Game.state.village.viewership = 20;
  const teachable = (Game.data.plants || []).slice(0, 8).map(p => p.id);
  for (const pid of teachable) Game.identifyPlant(pid, 'test');
  return { me, roster };
}

// A genuinely strong villager (clears the 45 bar) from REAL game state.
function buildHero(vid) {
  const v = (Game.data.villagers || []).find(x => x.id === vid);
  v.abilities = [
    { id: 'feastburn', name: 'Feastburn', desc: 'fight fed', level: 3, xp: 0 },
    { id: 'game_sense', name: 'Game Sense', desc: 'tracks', level: 2, xp: 0 },
    { id: 'triage', name: 'Triage', desc: 'field medicine', level: 2, xp: 0 },
  ];
  v.traits = Object.assign({}, v.traits, { temperament: 'bold', ambition: 'high' });
  const plantIds = (Game.data.plants || []).slice(20, 32).map(p => p.id);
  Game.state.village.taught = Game.state.village.taught || {};
  Game.state.village.taught[vid] = plantIds.slice();
  Game.state.village.trust[vid] = 85;
  Game.state.notability = Game.state.notability || {};
  Game.state.notability[vid] = { contest: 2, feat: 1 };
  return v;
}

(async () => {
  await Game.init();
  console.log('== test-outshone-liveness-20261020 ==');

  const { roster } = buildVillage();
  const aliveId = roster[1], deadId = roster[3];
  const aliveV = buildHero(aliveId);
  const deadV = buildHero(deadId);
  const aliveName = aliveV.name, deadName = deadV.name;
  // The death machinery marks the SHARED data.villagers record (game.js:1642
  // comment). Mirror that exactly.
  deadV.dead = true; deadV.deadDay = 88;
  ok('T0pre both heroes clear the ascension bar',
    Game.villagerAscensionScore(aliveId).score >= 45 && Game.villagerAscensionScore(deadId).score >= 45,
    `alive=${Game.villagerAscensionScore(aliveId).score} dead=${Game.villagerAscensionScore(deadId).score}`);

  // ---- T1: the dead villager must not be in the ascension candidate pool ----
  const asc = Game.tableAscended();
  ok('T1 dead villager excluded from tableAscended()',
    !asc.some(a => a.vid === deadId),
    `pool=[${asc.map(a => a.name).join(', ')}] includes dead=${asc.some(a => a.vid === deadId)}`);

  // ---- T2: the OUTSHONE beat must not name the dead villager ----
  SAID.length = 0;
  try { Game.tableEpilogue({}, 'relay', 'final:merge'); } catch (e) {}
  const outshone = SAID.filter(s => s.indexOf('OUTSHONE') >= 0);
  ok('T2pre OUTSHONE beat fired', outshone.length === 1,
    `outshone lines=${outshone.length} all=${SAID.filter(s => s.indexOf('◈') === 0).map(s => s.slice(0, 24)).join(' | ')}`);
  ok('T2 the dead villager is not named as the outshining god',
    !outshone.some(s => s.indexOf(deadName) >= 0),
    `dead=${deadName} in: [${outshone.join(' || ')}]`);
  ok('T2b the living ascendant IS named (beat still honest)',
    outshone.some(s => s.indexOf(aliveName) >= 0),
    `alive=${aliveName} in: [${outshone.join(' || ')}]`);

  // ---- T3: the audit prices only living ascensions ----
  ok('T3 tableAscended() counts only living villagers for audit pricing',
    Game.tableAscended().length === 1,
    `count=${Game.tableAscended().length} (dead would make 2)`);

  console.log(`RESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF FATAL:', e && e.stack || e); process.exit(2); });
