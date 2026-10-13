#!/usr/bin/env node
// test-blitz-godrecords.js — PROOF for god jealousy + persistent Records
// (Steve 2026-10-13).
//
// The gap: ascensions existed (godhood.js) but gods had no attitudes toward
// the village — no awe, jealousy, fear, or rivalry that move with real
// deeds, no factions or scheming between gods, no architect credit in the
// run's own story. And there was no in-run Records ledger: public glory
// and secret achievements as the village's story, with zero mechanical
// power leaking into fresh runs.
//
// AFTER:
//   A. src/js/pantheon.js — gods register on ascension; recordDeed moves
//      awe/jealousy/fear/rivalry (great victories inspire awe, defiance
//      breeds jealousy, dark acts breed fear, consorting breeds jealousy);
//      factions derive (patrons/scheming/wary/watchers); a daily schemeTick
//      makes gods maneuver against each other, the village caught in it via
//      omens — fiction only, never a dashboard (omens contain no numbers).
//   B. src/js/records.js — public achievements (village's glory, visible,
//      announced) + secret achievements (tracked silently, revealed when
//      earned; unrevealed render NOWHERE). Architect credit fires on
//      facilitation plays and at ascension.
//   C. Zero fresh-run power: Records/pantheon write ONLY state.records /
//      state.pantheon + say lines — never stats, abilities, items,
//      knowledge, or localStorage. Static source scan + runtime deep-diff.
//   D. Hooks are defensive: recordWaveKill/_contestEnd/tableFacilitate/
//      eatCannibal/endDay wraps, exception-guarded.
//
// RED-verified: on pristine (no pantheon.js/records.js), S.Pantheon and
// S.RunRecords are undefined and every assertion fails.
//
// Seeded PRNG, deterministic. Usage: node scripts/test-blitz-godrecords.js
//        SEED=7 node scripts/test-blitz-godrecords.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261013', 10);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(SEED); // seeded BEFORE eval

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -120", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
order.forEach(f => {
  try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
  catch (e) { console.error('EVAL FAIL ' + f + ': ' + e.message); process.exit(2); }
});
delete global.window;
const S = globalThis.Scattering;
const Game = S.Game;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function noPlaceholders(s) { return !/\{[a-zA-Z_]+\}/.test(String(s)) && !/undefined/.test(String(s)); }
function noDigits(s) { return !/\d/.test(String(s)); }

function freshGame() {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.say = () => {};
  Game.sysSay = () => {};
  Game.state.scholar.kcal = 50000;
  const v = Game.state.village;
  v.trust = v.trust || {};
  v.convoSeeds = {};
  v.sick = {};
  v.memory = {};
  return (v.roster || []).filter(id => id !== Game.villagerId);
}

(async () => {
  await Game.init();
  console.log(`seed=${SEED}`);

  // ============ module presence (RED gate: fails on pristine) ============
  console.log('\n-- module presence --');
  ok('S.Pantheon loads', !!(S.Pantheon && S.Pantheon.registerAscension && S.Pantheon.recordDeed));
  ok('S.RunRecords loads', !!(S.RunRecords && S.RunRecords.notePublic && S.RunRecords.revealSecret));
  if (!S.Pantheon || !S.RunRecords) { console.log(`\n${pass} passed, ${fail} failed`); process.exit(1); }

  const Pan = S.Pantheon, Rec = S.RunRecords;

  // ============ A. god attitudes move with deeds ============
  console.log('\n-- A. god jealousy: attitudes move with deeds --');
  freshGame();
  ok('fresh run: no pantheon yet', !Game.state.pantheon);
  const npcIds = freshGame();
  const npcId = npcIds[0] || 'v_test';
  let npcName = 'Test Villager';
  try { npcName = Game.displayName(npcId).split(' ')[0] || npcName; } catch (e) {}

  const g1 = Pan.registerAscension(Game, { vid: npcId, name: npcName, godhoodId: 'shepherd_of_the_dead', kind: 'npc', architect: null });
  ok('registerAscension returns a god', !!g1 && g1.id === 'npc:' + npcId, JSON.stringify(g1 && g1.id));
  const a0 = Pan.godAttitudes(Game, 'npc:' + npcId);
  ok('baseline attitudes sane', a0 && a0.awe === 45 && a0.jealousy === 5 && a0.fear === 0 && a0.rivalry === 0, JSON.stringify(a0));

  // (a) great victory -> awe UP, jealousy down
  const r1 = Pan.recordDeed(Game, 'great_victory', { wave: 3 });
  ok('great victory shifts attitudes', !!r1 && r1.shifted.some(s => s.att === 'awe' && s.delta > 0), JSON.stringify(r1 && r1.shifted));
  const a1 = Pan.godAttitudes(Game, 'npc:' + npcId);
  ok('awe rose on great victory (wave 3: +12)', a1.awe === 45 + 12, JSON.stringify(a1));
  ok('jealousy fell on great victory', a1.jealousy === Math.max(0, 5 - 3), JSON.stringify(a1));

  // (a2) defiance -> jealousy UP
  const before = Pan.godAttitudes(Game, 'npc:' + npcId).jealousy;
  const r2 = Pan.recordDeed(Game, 'defiance', { god: 'npc:' + npcId });
  const a2 = Pan.godAttitudes(Game, 'npc:' + npcId);
  ok('defiance breeds jealousy (+12)', a2.jealousy === Math.min(100, before + 12), `${before} -> ${a2.jealousy}`);
  ok('defiance emits a fiction omen', r2.omens.length === 1 && typeof r2.omens[0] === 'string', JSON.stringify(r2.omens));

  // dark acts -> fear UP
  Pan.recordDeed(Game, 'dark_act', { what: 'test' });
  const a3 = Pan.godAttitudes(Game, 'npc:' + npcId);
  ok('dark acts breed fear (+10)', a3.fear === 10, JSON.stringify(a3));

  // consorting with a rival power -> jealousy on the snubbed god
  Pan.registerAscension(Game, { vid: 'v_rival', name: 'Rival God', godhoodId: 'apex_predator', kind: 'npc', architect: null });
  const jBefore = Pan.godAttitudes(Game, 'npc:' + npcId).jealousy;
  Pan.recordDeed(Game, 'consort_rival', { god: 'npc:' + npcId, with: 'npc:v_rival' });
  const a4 = Pan.godAttitudes(Game, 'npc:' + npcId);
  ok('consorting breeds jealousy in the snubbed god (+14)', a4.jealousy === Math.min(100, jBefore + 14), `${jBefore} -> ${a4.jealousy}`);
  ok('consorted god gains rivalry (+10)', Pan.godAttitudes(Game, 'npc:v_rival').rivalry === 10, JSON.stringify(Pan.godAttitudes(Game, 'npc:v_rival')));

  // ascension of a second god made the first jealous (witnessed)
  const jAfter2nd = Pan.godAttitudes(Game, 'npc:' + npcId).jealousy;
  ok('new ascension resented by old god (+6 witnessed)', jAfter2nd >= 5 + 6, String(jAfter2nd));

  // factions derive, never managed
  const f1 = Pan.godFaction(Game, 'npc:' + npcId);
  const facs = Pan.factions(Game);
  ok('god has a derived faction', ['patrons', 'scheming', 'wary', 'watchers'].includes(f1), f1);
  ok('factions() partitions the gods', Object.values(facs).flat().length === 2, JSON.stringify(facs));

  // posture drives omens; omens contain no numbers (never a dashboard)
  Pan.recordDeed(Game, 'great_victory', { wave: 4 });
  Pan.recordDeed(Game, 'great_victory', { wave: 4 });
  ok('posture = favor when awe high', Pan.godPosture(Game, 'npc:v_rival') === 'favor' || Pan.godPosture(Game, 'npc:' + npcId) === 'favor',
    Pan.godPosture(Game, 'npc:v_rival') + '/' + Pan.godPosture(Game, 'npc:' + npcId));
  const omen = Pan.omenFor(Game, 'npc:' + npcId);
  ok('omen is fiction, no digits, no placeholders', !!omen && noDigits(omen) && noPlaceholders(omen), omen);

  // scheme tick: gods maneuver against each other; the village gets caught
  Pan.recordDeed(Game, 'defiance', { god: 'npc:v_rival' });
  Pan.recordDeed(Game, 'defiance', { god: 'npc:v_rival' });
  Pan.recordDeed(Game, 'consort_rival', { god: 'npc:v_rival', with: 'npc:' + npcId });
  const schemeLines = Pan.schemeTick(Game);
  ok('schemeTick fires with 2+ scheming gods', schemeLines.length === 1 && noPlaceholders(schemeLines[0]), schemeLines[0]);
  ok('schemer names a rival in fiction', /Rival God/.test(schemeLines[0]) || new RegExp(npcName).test(schemeLines[0]), schemeLines[0]);
  ok('god-god rivalry recorded', Pan.godRivalry(Game, 'npc:v_rival', 'npc:' + npcId) > 0, String(Pan.godRivalry(Game, 'npc:v_rival', 'npc:' + npcId)));

  // daily tick decays attitudes toward rest
  const hotAwe = Pan.godAttitudes(Game, 'npc:' + npcId).awe;
  for (let i = 0; i < 30; i++) Pan.dailyTick(Game);
  const cooled = Pan.godAttitudes(Game, 'npc:' + npcId);
  ok('dailyTick cools awe toward rest', cooled.awe < hotAwe, `${hotAwe} -> ${cooled.awe}`);
  ok('attitudes stay clamped 0-100', ['awe', 'jealousy', 'fear', 'rivalry'].every(k => cooled[k] >= 0 && cooled[k] <= 100), JSON.stringify(cooled));

  // ============ B. public + secret records ============
  console.log('\n-- B. persistent Records: public glory + secret achievements --');
  freshGame();
  const said = [];
  Game.sysSay = (t) => said.push(t);

  Rec.notePublic(Game, 'first_blood', 'The village drew first blood. It is written.');
  Rec.notePublic(Game, 'first_blood', 'A different telling.'); // idempotent
  const pub = Rec.publicLines(Game);
  ok('public record written once (idempotent)', pub.length === 1 && pub[0].text === 'The village drew first blood. It is written.', JSON.stringify(pub));
  ok('public record announced in fiction', said.some(t => /The Records: The village drew first blood/.test(t)), said.join(' | '));

  // secret: tracked silently, revealed nowhere until earned
  Rec.trackSecret(Game, 'defied_pantheon');
  ok('secret tracked silently', Rec.secretTracked(Game, 'defied_pantheon') && !Rec.isRevealed(Game, 'defied_pantheon'));
  ok('unrevealed secret renders NOWHERE', Rec.secretLines(Game).length === 0);
  ok('unrevealed secret never announced', !said.some(t => /defied_pantheon|secret is carved/i.test(t) && /defied/i.test(t)));
  Rec.revealSecret(Game, 'defied_pantheon', 'Someone refused a god\u2019s demand — and lived.');
  ok('secret reveals when earned', Rec.isRevealed(Game, 'defied_pantheon'));
  const sec = Rec.secretLines(Game);
  ok('revealed secret renders', sec.length === 1 && /refused a god/.test(sec[0].text), JSON.stringify(sec));
  ok('reveal announces once', said.filter(t => /secret is carved/i.test(t)).length === 1, said.join(' | '));
  Rec.revealSecret(Game, 'defied_pantheon', 'second telling'); // idempotent
  ok('reveal is idempotent', said.filter(t => /secret is carved/i.test(t)).length === 1);
  const counts = Rec.recordCount(Game);
  ok('recordCount', counts.public === 1 && counts.secret === 1, JSON.stringify(counts));

  // ============ D. architect credit on facilitation plays ============
  console.log('\n-- D. architect credit fires on facilitation plays --');
  freshGame();
  const saidD = [];
  Game.sysSay = (t) => saidD.push(t);
  const arch = Pan.architectCredit(Game, 'Maya — Shepherd of the Dead', 'the Bearer', ['teach', 'shield']);
  ok('architectCredit writes a public record', !!arch && /the Bearer/.test(arch.text) && /Maya/.test(arch.text), arch && arch.text);
  ok('architect credit is honest (god name + door builder, no diminishment)',
    /doors built by the Bearer/.test(arch.text) && /Both are true/.test(arch.text), arch.text);
  ok('architect record announced', saidD.some(t => /doors built by the Bearer/.test(t)), saidD.join(' | '));

  // registerAscension with an architect routes through the same credit
  freshGame();
  const saidE = [];
  Game.sysSay = (t) => saidE.push(t);
  Pan.registerAscension(Game, { vid: 'v_x', name: 'X', godhoodId: 'apex_predator', kind: 'npc', architect: { vid: 'v_b', name: 'the Bearer', acts: ['relay'] } });
  const pubE = Rec.publicLines(Game);
  ok('ascension with architect writes architect credit', pubE.some(e => /doors built by the Bearer/.test(e.text)), JSON.stringify(pubE.map(e => e.text)));

  // real hook: tableFacilitate writes the door record (defensive — skip if absent)
  if (typeof Game.tableFacilitate === 'function') {
    freshGame();
    const ids = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
    if (ids.length) {
      const saidF = [];
      Game.sysSay = (t) => saidF.push(t);
      Game.tableFacilitate('teach', ids[0]);
      ok('tableFacilitate hook writes the door record', Rec.publicLines(Game).some(e => /^door_/.test(e.id) && /building a door/.test(e.text)),
        JSON.stringify(Rec.publicLines(Game).map(e => e.id)));
    } else { ok('tableFacilitate hook (no roster to test)', true); }
  } else { ok('tableFacilitate hook (absent, skipped)', true); }

  // ============ C. zero fresh-run power ============
  console.log('\n-- C. ZERO fresh-run power: Records are meaning, not stats --');
  // static: strip comments, then forbid any write-shaped power token in
  // pantheon.js and records.js
  function stripComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
  }
  const forbWrites = [
    /\.abilities\s*=/, /\.inventory\s*=/, /\.kcal\s*=/, /\.health\s*=/, /\.hp\s*=/,
    /\.knowledge\s*=/, /\.equipment\s*=/, /\.synerg\w*\s*=/, /localStorage/,
    /metaUnlock/, /\.skill\w*\s*=/, /Game\.save\s*\(/,
  ];
  for (const f of ['src/js/pantheon.js', 'src/js/records.js']) {
    const code = stripComments(fs.readFileSync(path.join(ROOT, f), 'utf8'));
    const hits = forbWrites.filter(re => re.test(code));
    ok(`${f}: no power writes (static)`, hits.length === 0, hits.join(','));
  }
  // runtime: record a pile of deeds + records, then diff scholar/village
  freshGame();
  Game.sysSay = () => {};
  const snapScholar = JSON.stringify(Game.state.scholar);
  const snapVillage = JSON.stringify(Game.state.village);
  Pan.registerAscension(Game, { vid: 'v_a', name: 'A', godhoodId: 'shepherd_of_the_dead', kind: 'npc', architect: { vid: 'v_b', name: 'B', acts: ['teach'] } });
  Pan.registerAscension(Game, { vid: 'v_c', name: 'C', godhoodId: 'apex_predator', kind: 'player', architect: null });
  for (const k of ['great_victory', 'defiance', 'dark_act', 'consort_rival', 'offering', 'omen_defied', 'facilitation', 'ascension_witnessed', 'promise_broken'])
    Pan.recordDeed(Game, k, { wave: 4, god: 'npc:v_a', with: 'npc:v_c' });
  for (let i = 0; i < 5; i++) Pan.dailyTick(Game);
  Rec.notePublic(Game, 'p1', 'glory one');
  Rec.notePublic(Game, 'p2', 'glory two');
  Rec.trackSecret(Game, 's1'); Rec.revealSecret(Game, 's1', 'a secret earned');
  Rec.architectCredit(Game, 'D', 'E', ['shield']);
  ok('scholar untouched by any deed or record', JSON.stringify(Game.state.scholar) === snapScholar,
    'scholar diff: ' + diffKeys(JSON.parse(snapScholar), Game.state.scholar));
  ok('village untouched by any deed or record', JSON.stringify(Game.state.village) === snapVillage,
    'village diff: ' + diffKeys(JSON.parse(snapVillage), Game.state.village));
  // fresh run: empty Records, zero power carried
  freshGame();
  ok('fresh run: no records', !Game.state.records);
  ok('fresh run: no pantheon', !Game.state.pantheon);
  ok('fresh run: scholar has no record-derived abilities', !((Game.state.scholar.abilities || []).length), 'fresh scholar abilities: ' + JSON.stringify(Game.state.scholar.abilities || []).slice(0, 80));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(2); });

function diffKeys(a, b, path) {
  path = path || '';
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  const out = [];
  for (const k of keys) {
    const va = JSON.stringify(a && a[k]), vb = JSON.stringify(b && b[k]);
    if (va !== vb) out.push((path ? path + '.' : '') + k);
    if (out.length > 5) break;
  }
  return out.join(', ') || '(no key diff — ordering?)';
}
