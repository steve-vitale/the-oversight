#!/usr/bin/env node
// test-crisis-weirdness-lately-20261015.js — PROOF for the crisis-leg r16 blank:
// "the village is silent about alien transformations."
//
// Root cause: t2LatelyEvent (src/js/convoTopics.js) had an outbreak scan for
// MUNDANE sickness (r8) but no scan for the ALIEN pool. A villager with an
// active, audible transformation (croakbelly: gut ribbits audibly, vocal sac
// under the chin) talked monster names and nobody mentioned it —
// sense-tested on seed 6101 (diag-crisis-alienoutbreak-20261015.js).
// AFTER: a weirdness scan (any villager holding alien-pool statuses —
// howlbelly, gristlefit, croakbelly, shellgut, witness_maw, flockmind,
// eurika, east_nile, lemons — is "the village's business" from the FIRST
// one, because the want system deliberately gives alien quirks no sick_help
// and a lone changed villager otherwise has no conversational outlet at
// all) feeds t2LatelyEvent/t2gen_lately/t2fol_lately with
// symptom-honest lines, a first-person variant for the changed villager
// themself, and any weirdness displacing the naming debate (a transformation
// is unprecedented body horror — "what is happening to us" outshouts "what
// do we call that thing"; the debate resumes when it passes). The player counts: the Bearer's own warping is talk of the fire.
// Seeded PRNG, deterministic. Usage: node scripts/test-crisis-weirdness-lately-20261015.js
// Exit 0 = all green.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261015', 10);

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
global.window = global;
// Loader pattern from scripts/test-crisis-slope-kind-20261013.js.
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const order = [];
for (const m of html.matchAll(/src="([^"?]+\.js)\?v=/g)) {
  const f = m[1];
  if (!/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(f)) order.push(f);
}
const loadFails = [];
const gameIdx = order.indexOf('src/js/game.js');
const evalFile = (f) => {
  try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
  catch (e) { loadFails.push(f + ': ' + e.message); }
};
if (gameIdx >= 0) {
  for (let i = 0; i < gameIdx; i++) evalFile(order[i]);
  evalFile(order[gameIdx]);
  global.Game = globalThis.Scattering.Game;
  for (let i = gameIdx + 1; i < order.length; i++) evalFile(order[i]);
} else { for (const f of order) evalFile(order); }
if (loadFails.length) { console.log('LOAD FAILS:', loadFails); process.exit(2); }
delete global.window; // sync combat path for any runtime checks
const Game = global.Game;

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  PASS ' + label); }
  else { fail++; console.log('  FAIL ' + label); }
}

function freshState() {
  Game.state = Game.state || {};
  Game.state.scholar = { day: 30, statuses: [], inventory: [], kcal: 1500, mx: 4, my: 4 };
  Game.state.village = {};
  const v = Game.state.village;
  v.roster = ['vidP', 'vidA', 'vidB', 'vidC'];
  v.rosterChars = {
    vidP: { name: 'Bearer Bea' }, vidA: { name: 'Test Anna' },
    vidB: { name: 'Test Bruno' }, vidC: { name: 'Test Cara' },
  };
  v.trust = { vidP: 50, vidA: 50, vidB: 50, vidC: 50 };
  v.grief = 0;
  Game.villagerId = 'vidP';
  Game.state.systemArrived = true; // firstRef returns real names
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.monsters = {};
  Game.data = Game.data || {};
  Game.data.villagers = Game.data.villagers || [];
  // Real status defs — seDef reads Game.data.statusEffects.statuses.
  if (!Game.data.statusEffects) {
    Game.data.statusEffects = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/statusEffects.json'), 'utf8'));
  }
  for (const id of v.roster) {
    if (!Game.data.villagers.some(x => x.id === id)) {
      Game.data.villagers.push({ id, name: (v.rosterChars[id] || {}).name || id });
    }
  }
  // Test isolation: freshState resets statuses (person objects persist in
  // Game.data.villagers across calls).
  for (const p of (Game.data.villagers || [])) { try { p.statuses = []; } catch (e) {} }
  if (Game.state.scholar) Game.state.scholar.statuses = [];
  return v;
}
// REAL status application — the same call villagerMonsterWeirdness makes.
function quirkVillager(vid, qid) {
  const person = Game.getPerson(vid);
  return Game.applyStatus(person, qid, { source: 'the strange meat', silent: true });
}
function quirkPlayer(qid) {
  return Game.applyStatus('scholar', qid, { source: 'the strange meat', silent: true });
}

async function main() {
  let v = freshState();

  // ---- 1. two quirked villagers -> the village talks about it ----
  quirkVillager('vidA', 'howlbelly');
  quirkVillager('vidB', 'croakbelly');
  ok(Game.hasStatus(Game.getPerson('vidA'), 'howlbelly'), 'sanity: Anna holds howlbelly (real applyStatus)');
  ok(Game.hasStatus(Game.getPerson('vidB'), 'croakbelly'), 'sanity: Bruno holds croakbelly (real applyStatus)');

  const evC = Game.t2LatelyEvent('vidC');
  ok(evC && evC.kind === 'weirdness', 'healthy villager lately event is weirdness (got ' + (evC && evC.kind) + ')');
  ok(evC && evC.n === 2, 'weirdness counts 2 changed (got ' + (evC && evC.n) + ')');
  ok(evC && evC.self === false, 'healthy villager is not self');

  const linesC = Game.t2gen_lately('vidC');
  const joinedC = linesC.join(' ');
  ok(linesC.length >= 2, 'weirdness opener renders lines for a healthy villager');
  ok(/howling at night|guts ribbiting/.test(joinedC), 'opener names a symptom honestly (got: ' + joinedC.slice(0, 90) + '...)');
  ok(!/howlbelly|croakbelly/i.test(joinedC), 'opener never uses the quirk true name');

  // ---- 2. the changed villager themself: first-person ----
  const evA = Game.t2LatelyEvent('vidA');
  ok(evA && evA.kind === 'weirdness' && evA.self === true, 'changed villager gets self=true weirdness');
  ok(evA && evA.selfDesc === 'howling at night', 'selfDesc is Anna\'s own symptom (got ' + (evA && evA.selfDesc) + ')');
  const linesA = Game.t2gen_lately('vidA');
  const joinedA = linesA.join(' ');
  ok(/howling at night/.test(joinedA) && /me\b|I /.test(joinedA), 'first-person opener names her own symptom (got: ' + joinedA.slice(0, 90) + '...)');

  // ---- 3. follow-up pools exist for the kind (healthy observers) ----
  const fol = Game.t2fol_lately('vidC');
  ok(Array.isArray(fol) && fol.length === 3, 't2fol_lately returns 3 pools for weirdness');
  ok(fol.every(p => Array.isArray(p) && p.length === 3 && p.every(l => typeof l === 'string' && l.length > 10)),
    'weirdness cope/next/part pools are full (3 variants each)');

  // ---- 3b. the changed villager's follow-ups are first-person ----
  const folSelf = Game.t2fol_lately('vidA');
  const joinedSelf = folSelf.map(p => p.join(' ')).join(' ');
  ok(/I eat apart|I don\'t hide it|stare back/.test(joinedSelf),
    'self follow-ups are first-person, not observer-voiced (got: ' + joinedSelf.slice(0, 80) + '...)');
  ok(!/try not to stare/.test(joinedSelf), 'self follow-ups never use the observer "stare" line');

  // ---- 4. a single changed villager IS the village's business ----
  // (unlike mundane sickness, the want system gives alien quirks no outlet —
  // a lone howler would otherwise pass in total conversational silence)
  v = freshState();
  quirkVillager('vidA', 'howlbelly');
  const ev1 = Game.t2LatelyEvent('vidC');
  ok(ev1 && ev1.kind === 'weirdness' && ev1.n === 1, 'single quirked villager fires weirdness (got ' + (ev1 && ev1.kind) + '/' + (ev1 && ev1.n) + ')');
  ok(ev1 && ev1.severe !== true, 'single quirk is not severe (naming debate keeps its voice)');
  const ev1self = Game.t2LatelyEvent('vidA');
  ok(ev1self && ev1self.self === true && ev1self.selfDesc === 'howling at night', 'lone changed villager gets the first-person variant');
  const lines1 = Game.t2gen_lately('vidC');
  ok(!/1 of us are/.test(lines1.join(' ')), 'pluralization: never "1 of us are" (got: ' + lines1.join(' ').slice(0, 80) + '...)');
  ok(/One of us is changing/.test(lines1.join(' ')), 'n=1 renders "One of us is changing"');

  // ---- 5. any weirdness displaces the naming debate ----
  // (unlike a mild mundane outbreak: a transformation is unprecedented body
  // horror with no other conversational outlet — "what is happening to us"
  // outshouts "what do we call that thing")
  v = freshState();
  quirkVillager('vidA', 'howlbelly');
  quirkVillager('vidB', 'croakbelly');
  Game.state.codex.monsters = { hushwolf: { namingKicked: true } };
  ok(Game.monsterNamingActive() === true, 'sanity: naming debate is active');
  const evS = Game.t2LatelyEvent('vidP');
  ok(evS && evS.kind === 'weirdness', 'weirdness displaces the naming debate (got ' + (evS && evS.kind) + ')');
  // severe still flags (used for outbreak-vs-weirdness ordering)
  v = freshState();
  quirkVillager('vidA', 'howlbelly');
  quirkVillager('vidB', 'croakbelly');
  quirkVillager('vidC', 'gristlefit');
  const evS3 = Game.t2LatelyEvent('vidP');
  ok(evS3 && evS3.kind === 'weirdness' && evS3.severe === true, 'three changed flags severe');

  // ---- 6. the Bearer's own warping counts ----
  v = freshState();
  quirkVillager('vidA', 'shellgut');
  quirkPlayer('gristlefit');
  ok(Game.hasStatus('scholar', 'gristlefit'), 'sanity: Bearer holds gristlefit (real applyStatus)');
  const evP = Game.t2LatelyEvent('vidB');
  ok(evP && evP.kind === 'weirdness' && evP.n === 2, 'Bearer + villager = the village\'s business (got ' + (evP && evP.kind) + '/' + (evP && evP.n) + ')');
  const evPSelf = Game.t2LatelyEvent('vidP');
  ok(evPSelf && evPSelf.kind === 'weirdness' && evPSelf.self === true, 'the Bearer themself gets self=true');

  // ---- 7. existing behavior preserved: mundane outbreak still wins when both live ----
  v = freshState();
  quirkVillager('vidA', 'howlbelly');
  quirkVillager('vidB', 'croakbelly');
  v.sick = {
    vidC: { name: 'gut rot', daysLeft: 4, severity: 1 },
    vidP: { name: 'gut rot', daysLeft: 4, severity: 1 },
  };
  const evB = Game.t2LatelyEvent('vidA');
  ok(evB && evB.kind === 'outbreak', 'mild weirdness + mild outbreak -> outbreak still wins (got ' + (evB && evB.kind) + ')');
  // and a severe weirdness beats a mild outbreak
  v = freshState();
  quirkVillager('vidA', 'howlbelly');
  quirkVillager('vidB', 'croakbelly');
  quirkVillager('vidC', 'witness_maw');
  v.sick = { vidP: { name: 'gut rot', daysLeft: 4, severity: 1 } };
  const evB2 = Game.t2LatelyEvent('vidP');
  ok(evB2 && evB2.kind === 'weirdness', 'severe weirdness beats mild outbreak (got ' + (evB2 && evB2.kind) + ')');

  // ---- 8. two-pool sanity: alien quirks never create mundane sick records ----
  v = freshState();
  quirkVillager('vidA', 'howlbelly');
  ok(!(v.sick && v.sick.vidA), 'alien quirk creates no v.sick record (two pools stay separate)');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(2); });
