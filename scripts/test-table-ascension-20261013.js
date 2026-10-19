#!/usr/bin/env node
// test-table-ascension-20261013.js — PROOF (journey-endgame r7).
// NPC ascension + facilitation, end to end. Four fixes:
//   F1 shield: tableFacilitate('shield') promises "the village's fights will
//      spend others first" — wired: shielded villagers stand at the BACK of
//      the raid defender line (havenGrowth.js).
//   F2 teach: tableFacilitate('teach') actually teaches — the villager learns
//      plants the Bearer knows, via the real stores (taught + taughtByPlayer).
//   F3 score: villagerAscensionScore's knowledge component reads the REAL
//      villager knowledge model (taught + familiar), not the never-written
//      v.knowledgeBreadth/v.taughtPlants.
//   F4 pricing: ascensions add real bargaining power — +10 path strength each
//      (cap 100) in tableEarnedPaths, voiced in the audit.
// RED-verified: revert the fix hunks (git checkout HEAD -- the two files) and
// every numbered test below FAILS; re-apply and all PASS.
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
Math.random = mulberry32(parseInt(process.env.SEED || '1313', 10));

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, decodeURIComponent(new URL(f, 'https://fixture.invalid/').pathname).slice(1)), 'utf8'))) });
// Full script list (was `| head -80`: tracks.js, 2026-10-14, shifted the
// window and silently dropped table-beloved.js — the sim-harness HEAD-80 bug).
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

// ---------- build a synthetic endgame-capable village ----------
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
  // beloved-ledger texture (this test walks BELOVED)
  for (const k of ['showmanship', 'protected', 'promisesKept']) {
    try { Game.ledgerAdd(k, { showmanship: 9, protected: 7, promisesKept: 6 }[k]); } catch (e) {}
  }
  // lesser-seat texture (bars are the lever worker's territory; this test
  // judges the ascension machinery past the bars)
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
  // the player knows 8 plants (codex level 1+)
  const teachable = (Game.data.plants || []).slice(0, 8).map(p => p.id);
  for (const pid of teachable) Game.identifyPlant(pid, 'test');
  return { me, roster, teachable };
}

// a genuinely strong villager from REAL game state
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
  console.log('== test-table-ascension-20261013 ==');

  // ---- T1 (F3): score's knowledge component reads the real model ----
  {
    const { roster } = buildVillage();
    const hero = roster[1];
    buildHero(hero);
    const sc = Game.villagerAscensionScore(hero);
    const kb = Math.min(20, ((Game.state.village.taught[hero] || []).length) + ((Game.state.village.familiar[hero] || []).length));
    ok('T1a knowledge component fires from real taught stores', sc.notes.indexOf('taught and teaching') >= 0,
      `notes=[${sc.notes.join('; ')}] score=${sc.score}`);
    ok('T1b knowledge adds min(20, taught+familiar)', sc.score >= kb,
      `score=${sc.score} expected>=${kb}`);
    ok('T1c hero clears the ascension bar (45)', sc.score >= 45, `score=${sc.score}`);
  }

  // ---- T2 (F2): teach facilitation really teaches ----
  {
    const { me, roster, teachable } = buildVillage();
    const hero = roster[1];
    buildHero(hero);
    const preKnown = teachable.filter(pid => Game.plantKnown(pid));
    ok('T2pre player knows the teachable plants', preKnown.length === teachable.length,
      `known=${preKnown.length}/${teachable.length}`);
    const scPre = Game.villagerAscensionScore(hero).score;
    Game.tableFacilitate('teach', hero);
    const tbp = ((Game.state.village.taughtByPlayer || {})[hero] || []);
    const taught = (Game.state.village.taught[hero] || []);
    ok('T2a taughtByPlayer records the lesson', tbp.length > 0, `taughtByPlayer=${tbp.length}`);
    ok('T2b v.taught grew', taught.length >= 12 + tbp.length, `taught=${taught.length}`);
    const newOnes = tbp.filter(pid => Game.plantKnown(pid));
    ok('T2c only plants the Bearer knows are taught', newOnes.length === tbp.length,
      `${newOnes.length}/${tbp.length} taught=${tbp.join(',')}`);
    const scPost = Game.villagerAscensionScore(hero).score;
    ok('T2d the lesson raises their ascension score', scPost > scPre, `${scPre} -> ${scPost}`);
  }

  // ---- T3 (F1): shielded villagers are spent LAST in raid defense ----
  {
    const { me, roster } = buildVillage();
    const hero = roster[1]; // early in roster order — pre-fix they'd fight first
    buildHero(hero);
    const v = Game.state.village;
    v.health = {}; // everyone healthy
    v.away = {};
    Game.tableFacilitate('shield', hero);
    ok('T3pre shielded flag set', !!((v.shielded || {})[hero]));
    // seed 3 wave-1 raiders at the treeline, thin pantry (raidN=3)
    const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
    const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
    for (const [i, mid] of monstersOfWave(1, 3).entries()) {
      try { Game.spawnWorldMonster({ id: mid }, hx + i, hy, {}); } catch (e) {}
    }
    v.pantry = [{ kcalEach: 1000, units: 6 }]; // 6000 kcal -> raidN=3
    v.lastRaidDay = (Game.state.scholar.day || 140) - 8;
    const fought = [];
    const realRWE = Game.resolveWildMonsterEncounter.bind(Game);
    Game.resolveWildMonsterEncounter = (vid, m) => { fought.push(vid); return realRWE(vid, m); };
    let fired = false;
    for (let t = 0; t < 60 && !fired; t++) {
      Game.state.scholar.day = (Game.state.scholar.day || 140) + 1;
      const n0 = fought.length;
      try { Game.havenRaidTick(); } catch (e) {}
      if (fought.length > n0) fired = true;
    }
    Game.resolveWildMonsterEncounter = realRWE;
    ok('T3a a raid fired and defenders fought', fired && fought.length > 0,
      `fired=${fired} fought=${fought.length}`);
    if (fired && fought.length) {
      const heroIdx = fought.indexOf(hero);
      const othersMax = Math.max.apply(null, fought.map((f, i) => f === hero ? -1 : i));
      ok('T3b shielded hero is spent last (or not at all)', heroIdx === -1 || heroIdx >= othersMax,
        `order=${fought.map(f => f === hero ? 'HERO' : 'v').join(',')}`);
      ok('T3c unshielded defenders were spent first', othersMax >= 0,
        `order=${fought.map(f => f === hero ? 'HERO' : 'v').join(',')}`);
    }
  }

  // ---- T4 (F4): ascensions price into path standing, voiced in the audit ----
  {
    buildVillage();
    const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
    const hero = roster[1];
    buildHero(hero);
    // base standing with NO ascensions (drop the hero below the bar)
    const hv = (Game.data.villagers || []).find(x => x.id === hero);
    const keepAbils = hv.abilities; hv.abilities = [];
    const basePaths = Game.tableEarnedPaths();
    const baseBeloved = (basePaths.find(p => p.id === 'beloved') || {}).strength | 0;
    hv.abilities = keepAbils;
    const asc = Game.tableAscended();
    ok('T4pre hero ascends', asc.length === 1 && asc[0].vid === hero,
      `ascended=${asc.map(a => a.name).join(',')}`);
    const paths = Game.tableEarnedPaths();
    const beloved = (paths.find(p => p.id === 'beloved') || {}).strength | 0;
    ok('T4a ascension adds +10 to path standing', beloved === Math.min(100, baseBeloved + 10),
      `base=${baseBeloved} with-asc=${beloved}`);
    SAID.length = 0;
    Game.tableScene();
    const auditLine = SAID.find(l => /its terms improve accordingly/.test(l));
    ok('T4b audit voices the ascension pricing', !!auditLine, auditLine ? auditLine.slice(0, 80) : 'none');
    // walk beloved to the epilogue; the terms-held line replaces the old duplicate
    const offered = (((Game.state.scholar.tableChoices || {}).options) || []).map(o => o.id);
    ok('T4c-pre beloved is actually offered', offered.indexOf('path:beloved') >= 0, offered.join(','));
    const T = () => Game.tableState();
    Game.chooseTableOption('path:beloved');
    let guard = 0;
    while (guard++ < 40 && T().phase !== 'done') {
      const S = T();
      const opts = ((Game.state.scholar.tableChoices || {}).options) || [];
      if (!opts.length) break;
      Game.chooseTableOption(opts[0].id);
    }
    ok('T4c epilogue confirms the terms held (no duplicate pricing line)',
      SAID.some(l => /The terms held/.test(l)) && SAID.filter(l => /Nobody has ever seen that before/.test(l)).length === 1,
      `termsHeld=${SAID.some(l => /The terms held/.test(l))} dupes=${SAID.filter(l => /Nobody has ever seen that before/.test(l)).length}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
