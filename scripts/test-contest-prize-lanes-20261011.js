#!/usr/bin/env node
// test-contest-prize-lanes-20261011.js — long-run sim lever 9, round 2
// (abilities & godhood): the contest prize census (lever 6 r4 2026-10-11)
// proved ability unlocks / synergy hints / knowledge dumps NEVER existed
// as contest prizes, despite docs/CONTESTS.md "Prizes — every lane"
// promising all three. This test proves the three new lanes plus the
// villager prize deed:
//   A. _cxContestDeedTrack: category -> deed track mapping
//   B. _cxPrizeAbilityOffer: 1-of-3 System offer, lane rules
//      (no pending-offer trample, slots cap, dark/OP tiers excluded,
//      category bias, all unheld system_offer abilities)
//   C. _cxPrizeSynergyHint: +1 discovery attempt through the real
//      tease/unlock path (attempt 1 whisper, 2 shimmer+hint, 3 hero card)
//   D. _cxPrizeKnowledgeDump: identifies a plant via identifyPlant,
//      exhausts to false when everything is named
//   E. _cxPrizeLane: the roll, lane weights, fall-through when a lane is
//      impossible, system-not-arrived gate
//   F. villager prize deed: villagerGainXP feeds the contest's track
//   G. wiring: _contestEnd player-win and villager-win paths call the lanes
//   H. SENSE-TEST: the prize copy reads like the System, not a database
// Harness: full src/js list in index.html order (minus DOM-only), mulberry32
// seeded BEFORE eval. Never stub Game.save.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const { execSync } = require('child_process');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  ok:', name); }
  else { fail++; console.log('  FAIL:', name, extra === undefined ? '' : extra); }
}

async function main() {
  Math.random = mulberry32(20261011);
  global.fetch = (f) => Promise.resolve({
    json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
  });
  const order = execSync(`grep -o 'src/js/[^"'"'"']*\\.js' index.html | head -80`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
  global.window = global;
  for (const f of order) { try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { console.log('LOAD FAIL', f, e.message); process.exit(1); } }
  delete global.window;
  const Game = globalThis.Scattering.Game;
  // capture narration for the sense read
  const lines = [];
  Game.say = function (t) { lines.push(t); };
  Game.sysSay = function (t) { lines.push(t); };
  Game.audioEvent = function () {};
  if (Game.drama === undefined) Game.drama = function () {};
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  s.abilities = [];
  s.abilityChoices = null;
  s.synergies = [];
  s.synergyAttempts = {};
  const BANNED = new Set(['vile', 'body_horror', 'overpowered']);

  // ---- A. deed track mapping ----
  console.log('A. contest category -> deed track');
  ok(Game._cxContestDeedTrack({ cat: 'blood' }) === 'combat', 'blood -> combat');
  ok(Game._cxContestDeedTrack({ cat: 'endurance' }) === 'field', 'endurance -> field');
  ok(Game._cxContestDeedTrack({ cat: 'forage' }) === 'field', 'forage -> field');
  ok(Game._cxContestDeedTrack({ cat: 'moot' }) === 'social', 'moot -> social');
  ok(Game._cxContestDeedTrack({ cat: 'weird' }) === 'social', 'weird -> social');
  ok(Game._cxContestDeedTrack({ cat: 'puzzle' }) === 'social', 'puzzle -> social');
  ok(Game._cxContestDeedTrack({ cat: 'detective' }) === 'social', 'detective -> social');
  ok(Game._cxContestDeedTrack({ cat: 'chance' }) === 'social', 'chance -> social');
  ok(Game._cxContestDeedTrack({}) === 'social', 'missing cat -> social');

  // ---- B. ability offer lane ----
  console.log('B. ability offer lane');
  const realRandom = Math.random;
  Math.random = () => 0.99; // deterministic-ish pool picks
  let fired = Game._cxPrizeAbilityOffer({ cat: 'blood', id: 'pit', risk: 'high' });
  ok(fired === true, 'offer fires with free slots');
  const ch = s.abilityChoices || [];
  ok(ch.length === 3, 'offer is 1-of-3', ch.length);
  const owned = new Set(['zzz']);
  const allDefs = Game.data.abilities || [];
  ok(ch.every(c => !owned.has(c.id)) && ch.every(c => !s.abilities.some(a => (a.id || a) === c.id)), 'all choices unheld');
  ok(ch.every(c => { const d = allDefs.find(a => a.id === c.id); return d && d.unlock && d.unlock.type === 'system_offer'; }),
    'all choices are alien System abilities (system_offer)');
  ok(ch.every(c => { const d = allDefs.find(a => a.id === c.id); return d && !BANNED.has(d.tier); }),
    'no vile/body_horror/overpowered in the gift bag', ch.map(c => (allDefs.find(a => a.id === c.id) || {}).tier).join(','));
  // category bias: blood contest -> combat-tier lead if one is available unheld
  const combatAvail = allDefs.some(a => a.tier === 'combat' && a.unlock && a.unlock.type === 'system_offer');
  if (combatAvail) {
    const leadTier = (allDefs.find(a => a.id === ch[0].id) || {}).tier;
    ok(leadTier === 'combat', 'blood win biases the lead pick to combat tier', leadTier);
  } else { ok(true, 'blood bias n/a (no combat-tier system_offer abilities)'); }
  ok(lines.some(t => /PICK A TRICK/.test(t)), 'offer narration fires ("PICK A TRICK")');
  // pending offer is not trampled
  const keep = s.abilityChoices;
  ok(Game._cxPrizeAbilityOffer({ cat: 'weird' }) === false, 'pending offer blocks a second offer');
  ok(s.abilityChoices === keep, 'pending offer untouched');
  // slots full -> no offer
  s.abilityChoices = null;
  const slots = Game.abilitySlots();
  s.abilities = Array.from({ length: slots }, (_, i) => ({ id: 'fill' + i, name: 'Fill', level: 1, xp: 0 }));
  ok(Game._cxPrizeAbilityOffer({ cat: 'moot' }) === false, 'full slots -> no offer');
  ok(!s.abilityChoices, 'full slots -> no dangling offer');
  s.abilities = [];
  Math.random = realRandom;

  // ---- C. synergy hint lane ----
  console.log('C. synergy hint lane');
  const pmv = (Game.data.synergies || []).find(x => x.id === 'peacemakers_voice');
  ok(!!pmv, 'peacemakers_voice exists in data');
  // no qualifying pairing -> false
  s.synergies = []; s.synergyAttempts = {};
  ok(Game._cxPrizeSynergyHint() === false, 'no held pairing -> no hint');
  // diplomat + mediator held -> attempt path through tease/unlock
  const abil = (id) => ({ id, name: id, level: 1, xp: 0 });
  s.abilities = [abil('diplomat'), abil('mediator')];
  lines.length = 0;
  ok(Game._cxPrizeSynergyHint() === true, 'hint fires for held pairing');
  ok(s.synergyAttempts['peacemakers_voice'] === 1, 'attempt 1 credited');
  ok(lines.some(t => /The audience SAW it/.test(t)), 'hint frame line spoken');
  ok(Game._cxPrizeSynergyHint() === true && s.synergyAttempts['peacemakers_voice'] === 2, 'attempt 2 credited');
  ok(Game._cxPrizeSynergyHint() === true && (s.synergies || []).includes('peacemakers_voice'),
    'attempt 3 -> discovered through the real unlock path');
  ok(lines.some(t => /SYNERGY DISCOVERED/.test(t)), 'hero card fires at unlock');

  // ---- D. knowledge dump lane ----
  console.log('D. knowledge dump lane');
  const plants = Game.data.plants || [];
  ok(plants.length > 0, 'plant data exists (' + plants.length + ')');
  lines.length = 0;
  ok(Game._cxPrizeKnowledgeDump() === true, 'dump fires with unidentified plants');
  const known = Object.keys(Game.state.codex.plants || {});
  const dumped = known.find(pid => (Game.state.codex.plants[pid] || {}).by === 'prize');
  ok(!!dumped, 'codex entry lands with provenance "prize"', JSON.stringify(known.slice(0, 3)));
  ok(lines.some(t => /KNOWLEDGE DUMP/.test(t)), 'dump frame line spoken');
  ok(lines.some(t => /IDENTIFIED/.test(t)), 'identifyPlant celebration fires');
  // exhaust: identify everything, dump returns false
  for (const p of plants) Game.state.codex.plants[p.id] = { identifiedDay: 0, level: 1, by: 'prize' };
  ok(Game._cxPrizeKnowledgeDump() === false, 'everything named -> no dump');

  // ---- E. the lane roller ----
  console.log('E. lane roller');
  Game.state.codex.plants = {}; // restore some unnamed plants
  s.abilities = []; s.abilityChoices = null; s.synergies = []; s.synergyAttempts = {};
  Game.state.systemArrived = false;
  Math.random = () => 0.0;
  ok(Game._cxPrizeLane({}, { risk: 'low' }) === false, 'pre-System arrival -> no lanes');
  Game.state.systemArrived = true;
  Math.random = () => 0.0; // chance roll passes (0 < 0.50); lane order ['a','s','k']
  ok(Game._cxPrizeLane({}, { risk: 'low' }) === true, 'lane fires on a win roll');
  ok((s.abilityChoices || []).length === 3, 'ability lane wins the roll first');
  // fall-through: slots full -> ability lane impossible -> synergy lane
  s.abilityChoices = null;
  const sl = Game.abilitySlots();
  s.abilities = [abil('diplomat'), abil('mediator')];
  while (s.abilities.length < sl) s.abilities.push(abil('fillx' + s.abilities.length));
  ok(Game._cxPrizeLane({}, { risk: 'low' }) === true, 'fall-through: full slots still land a lane');
  ok(s.synergyAttempts['peacemakers_voice'] === 1, 'fall-through landed the synergy hint');
  ok(!s.abilityChoices, 'no offer created when slots are full');
  Math.random = realRandom;
  s.abilities = [];

  // ---- F. villager prize deed ----
  console.log('F. villager prize deed');
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  ok(!!vid, 'a villager exists to prize');
  const xpBefore = ((Game.state.village.npcXp || {})[vid] || {}).combat || 0;
  Game.villagerGainXP(vid, Game._cxContestDeedTrack({ cat: 'blood' }), 3, 'won The Blood Tithe on camera');
  const xpAfter = ((Game.state.village.npcXp || {})[vid] || {}).combat || 0;
  ok(xpAfter === xpBefore + 3, 'contest win feeds the combat deed track (+3)', xpBefore + ' -> ' + xpAfter);
  const granted = ((Game.state.village.npcAbilities || {})[vid] || []);
  ok(granted.includes('patient_aim') || xpBefore >= 3,
    'first rung lights at threshold 3 (patient_aim) for a nobody', JSON.stringify(granted));
  ok(lines.some(t => /Earned, not given/.test(t)), 'grant narrates "Earned, not given"');

  // ---- G. wiring ----
  // NOTE: metaProgression.js wrapHook()s _contestEnd, so Game._contestEnd
  // is the WRAPPER (its toString is the wrapper) — but the wrapper calls
  // orig.apply(this, args), i.e. the real implementation below. Check the
  // source file instead: the hook calls must sit inside _contestEnd's body.
  console.log('G. _contestEnd wiring');
  const cxSrc = fs.readFileSync(path.join(ROOT, 'src/js/contests.js'), 'utf8');
  const endStart = cxSrc.indexOf('G._contestEnd = function');
  const endBody = cxSrc.slice(endStart, endStart + 16000);
  ok(endStart >= 0, '_contestEnd defined in contests.js');
  ok(endBody.includes('this._cxPrizeLane(ac, contest)'), 'player-win path rolls the prize lanes');
  ok(endBody.includes('this._cxContestDeedTrack(contest)'), 'villager-win path feeds the deed track');
  const othersSrc = Game._contestResolveOthers.toString();
  ok(othersSrc.includes('_cxContestDeedTrack'), 'multi-take co-winner path feeds the deed track');

  // ---- H. sense read ----
  console.log('H. sense read (copy)');
  const sense = lines.join('\n');
  ok(/The System LIKED that/.test(sense), 'ability offer copy is System-voice');
  ok(/We want the third one on camera/.test(sense), 'synergy hint copy is System-voice');
  ok(/We read the world so you don\'t have to/.test(sense), 'knowledge dump copy is System-voice');
  ok(!/\bundefined\b|\bNaN\b|\[object Object\]/.test(sense), 'no template leakage in prize copy');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
