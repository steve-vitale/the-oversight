#!/usr/bin/env node
// diag-table-ascension-20261013.js — PILOT (journey-endgame r7): NPC ascension +
// facilitation, end to end. Two scenarios on a rich synthetic day-140 village:
//   A: facilitator — the Bearer facilitates a strong villager (teach + shield),
//      walks BELOVED, reads the epilogue for THE ARCHITECT credit.
//   B: outshone — same strong villager, NO facilitation, Bearer weak; the
//      epilogue should fire the honest OUTSHONE beat ("you watched").
// PRE-fix expectations (2026-10-13): 'shield' writes v.shielded but nothing
// reads it; 'teach' writes nothing real; the score's knowledge component reads
// v.knowledgeBreadth/v.taughtPlants which no game system writes; the
// "bargaining power (+path strength)" is said aloud in the epilogue but priced
// nowhere. This script prints full transcripts for sense-testing.
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
const SEED0 = parseInt(process.env.SEED || '1301', 10);
Math.random = mulberry32(SEED0);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

const LINES = [];
const say = (l) => LINES.push(l);
const stripHtml = (s) => String(s).replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ');

function monstersOfWave(w, n) {
  return (Game.data.monsters || []).filter(m => (m.wave || 1) === w).slice(0, n).map(m => m.id);
}
function vname(vid) { try { return Game.displayName(vid) || vid; } catch (e) { return vid; } }

function texture(ledger) {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const me = Game.villagerId;
  Game.state.scholar.day = 140;
  Game.state.systemArrived = true;
  Game.state.scholar.integration = 55;
  Game.state.scholar.grounding = 100;
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== me);
  Game.state.village.trust = {};
  roster.forEach((id, i) => { Game.state.village.trust[id] = 45 + (i * 7) % 45; });
  for (const k of Object.keys(ledger || {})) { try { Game.ledgerAdd(k, ledger[k]); } catch (e) {} }
  Game.state.village.dead = Game.state.village.dead || {};
  Game.state.village.dead[roster[4]] = { cause: 'combat', day: 61 };
  Game.state.village.dead[roster[7]] = { cause: 'starvation', day: 92 };
  for (const w of [1, 2, 3]) for (const id of monstersOfWave(w, w === 3 ? 3 : 4)) Game.recordDeedFight(id);
  Game.deedState().contestsSurvived = 2;
  Game.fireCrisis('breach'); Game.fireCrisis('first-grave');
  Game.state.networkLive = true;
  Game.progState().sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = true;
  try { Game.shareFood(3200, roster[2]); Game.shareFood(1500, roster[5]); } catch (e) {}
  const v = Game.state.village; v.pantry = v.pantry || [];
  v.pantry.push({ kcalEach: 5000, units: 10 });
  Game.state.village.viewership = 20;
  return { me, roster };
}

// Build a genuinely strong villager from REAL game state:
// - 3 System abilities (the watching-grant path can grant these in real play)
// - 12 in-run taught plants (the fireside/fieldwork model — REAL stores)
// - notability deeds (contests.js weight)
// - bold traits, high trust
function buildHero(vid) {
  const v = (Game.data.villagers || []).find(x => x.id === vid);
  v.abilities = [
    { id: 'feastburn', name: 'Feastburn', desc: 'fight fed', level: 3, xp: 0 },
    { id: 'game_sense', name: 'Game Sense', desc: 'tracks', level: 2, xp: 0 },
    { id: 'triage', name: 'Triage', desc: 'field medicine', level: 2, xp: 0 },
  ];
  v.traits = Object.assign({}, v.traits, { temperament: 'bold', ambition: 'high' });
  const plantIds = (Game.data.plants || []).slice(0, 12).map(p => p.id);
  Game.state.village.taught = Game.state.village.taught || {};
  Game.state.village.taught[vid] = plantIds.slice();
  Game.state.village.trust[vid] = 85;
  Game.state.notability = Game.state.notability || {};
  Game.state.notability[vid] = { contest: 2, feat: 1 };
  return v;
}

function walkBeloved(log) {
  const T = () => Game.tableState();
  Game.tableScene();
  const tc0 = Game.state.scholar.tableChoices;
  const offered = ((tc0 && tc0.options) || []).map(o => o.id);
  log(`(seat: ${Game.tableSeat().seat} | offered: ${offered.join(', ')})`);
  if (!offered.includes('path:beloved')) { log('!! beloved NOT OFFERED — abort'); return 'not-offered'; }
  Game.chooseTableOption('path:beloved');
  let guard = 0;
  while (guard++ < 40) {
    const S = T();
    if (S.phase === 'done') break;
    if (S.phase === 'finals') {
      const opts = ((Game.state.scholar.tableChoices || {}).options) || [];
      log(`(finals, branch=${S.branch}: ${opts.map(o => o.id).join(', ')})`);
      Game.chooseTableOption(opts[0].id);
      continue;
    }
    if (S.phase === 'downgrade') {
      const opts = ((Game.state.scholar.tableChoices || {}).options) || [];
      log(`(DOWNGRADE: ${opts.map(o => o.id).join(', ')})`);
      Game.chooseTableOption(opts[0].id);
      continue;
    }
    const opts = ((Game.state.scholar.tableChoices || {}).options) || [];
    if (!opts.length) { log(`!! stall at beat ${S.beat}`); return 'stall'; }
    Game.chooseTableOption(opts[0].id);
  }
  const S = T();
  log(`(end: phase=${S.phase}, won=${!!Game.won})`);
  return S.phase;
}

function scenarioA() {
  LINES.push('\n================ SCENARIO A: THE FACILITATOR ================');
  texture({ showmanship: 9, protected: 7, killed: 0, betrayed: 0, promisesKept: 6 });
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  const heroVid = roster[1];
  buildHero(heroVid);
  const pre = Game.villagerAscensionScore(heroVid);
  say(`hero: ${vname(heroVid)} — pre-facilitation ascension score=${pre.score} [${pre.notes.join('; ')}]`);
  // the player knows some plants (codex) so 'teach' has something to give
  const cpx = Game.state.codex.plants = Game.state.codex.plants || {};
  (Game.data.plants || []).slice(12, 20).forEach(p => { cpx[p.id] = { identified: true }; });
  Game.tableFacilitate('teach', heroVid);
  Game.tableFacilitate('shield', heroVid);
  const post = Game.villagerAscensionScore(heroVid);
  say(`hero: ${vname(heroVid)} — post-facilitation ascension score=${post.score} [${post.notes.join('; ')}]`);
  say(`v.shielded[${vname(heroVid)}] = ${!!((Game.state.village.shielded || {})[heroVid])}`);
  say(`taughtByPlayer now has ${(((Game.state.village.taughtByPlayer || {})[heroVid]) || []).length} entries`);
  // ascended list at table time
  const asc = Game.tableAscended();
  say(`tableAscended(): ${asc.map(a => `${a.name}(${a.score})`).join(', ') || 'NONE'}`);
  // path strength with ascensions (pre-fix: ascensions not priced)
  const paths = Game.tableEarnedPaths();
  say(`beloved standing at audit: ${(paths.find(p => p.id === 'beloved') || {}).strength}`);
  LINES.push('--- walking BELOVED as the facilitator ---');
  walkBeloved((l) => say(l));
}

function scenarioB() {
  LINES.push('\n================ SCENARIO B: THE WATCHER (outshone) ================');
  texture({ showmanship: 9, protected: 7, killed: 0, betrayed: 0, promisesKept: 6 });
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  const heroVid = roster[1];
  buildHero(heroVid);
  const pre = Game.villagerAscensionScore(heroVid);
  say(`hero: ${vname(heroVid)} — ascension score=${pre.score} [${pre.notes.join('; ')}] (NO facilitation)`);
  say(`tableAscended(): ${Game.tableAscended().map(a => `${a.name}(${a.score})`).join(', ') || 'NONE'}`);
  LINES.push('--- walking BELOVED as the watcher ---');
  walkBeloved((l) => say(l));
}

// capture Game.say output into LINES too
const realSay = Game.say.bind(Game);
Game.say = (msg) => { LINES.push(stripHtml(msg)); realSay(msg); };
const realSysSay = Game.sysSay ? Game.sysSay.bind(Game) : null;
if (realSysSay) Game.sysSay = (msg) => { LINES.push('[SYS] ' + stripHtml(msg)); realSysSay(msg); };

(async () => {
  await Game.init();
  scenarioA();
  // reset run state between scenarios
  (function () {
    const pg = Game.progState();
    pg.tableDone = false; pg.table = null;
    Game.state.scholar.tableChoices = null;
    Game.over = false; Game.won = false;
  })();
  scenarioB();
  const outdir = path.join(ROOT, 'evidence', '2026-10-13');
  fs.mkdirSync(outdir, { recursive: true });
  fs.writeFileSync(path.join(outdir, 'journey-endgame-r7-pilot.txt'), LINES.join('\n'));
  console.log('wrote', path.join(outdir, 'journey-endgame-r7-pilot.txt'), `(${LINES.length} lines)`);
  for (const l of LINES) {
    if (/ARCHITECT|OUTSHONE|PANTHEON|score=|shielded\[|standing|Ascension/i.test(l)) console.log('>>', l.slice(0, 170));
  }
})();
