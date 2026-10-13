#!/usr/bin/env node
// test-blitz-memdepth.js — PROOF for the social-memory wiring (Steve 2026-10-13):
//
// Steve's gap: many memory types were write-only, villager-to-villager
// memory was sparse, and inter-village grievances were numeric trust
// rather than recallable events.
//
// BEFORE (audit 2026-10-13): these types were written and NEVER read —
//   wrongly_accused, confession, hostile, exposed_cannibal, offered_meat,
//   shared_secret, saw_weakness, warned, feast, moot_vote, heckled, appeal,
//   deal_refused, grudging_respect, blame, moot_case_held, moot_weak_case,
//   moot_split_fire, duel_terms, duel_fought, lost_duel
// 'hero' was written on villager killers' own records but never named by
// anyone; recordGrievance stored bare kinds ('ambushed') nobody could cite;
// _nudgeOpinion moved opinion numbers with no recallable what/why.
//
// AFTER:
//   A. every listed type has a conversation read (label + response line);
//      deal_refused additionally changes offerDeal behavior (the sweetener
//      shrinks and the NPC cites it).
//   B. villagers recall EACH OTHER's deeds: deedMemLine reads another
//      villager's 'hero'/'lost_duel'/'blame'/etc., subject-stamped
//      'saw_kill' witness memories ("I was there when..."), and recorded
//      grievances render as "still hasn't forgiven X for ..." — all
//      surfaced in the OTHERS gossip topic and sense-tested as transcripts.
//   C. inter-village grievances are events: _nudgeOpinion auto-stamps
//      ov.events on negative moves (why→human phrase), breakLink and
//      sabotage stamp direction-aware events, and ovOpinionExplain renders
//      "Opinion -40 — X remembers: Haven raided our stores (3 days back).
//      That's not a number to them. That's what happened."
//
// RED-verified: on pristine these fail (convoMemoryAbout returns null for
// the newly-labeled types, so the alive:memory menu item never appears;
// grievanceSay/stampKillWitnesses/ovEvent/ovOpinionExplain don't exist).
//
// Seeded PRNG, deterministic. Usage: node scripts/test-blitz-memdepth.js
//        SEED=7 node scripts/test-blitz-memdepth.js
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
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function noPlaceholders(s) { return !/\{[a-zA-Z_]+\}/.test(String(s)) && !/undefined/.test(String(s)); }
function realName(s) { return !/(^|\s)A(\s|$)/.test(String(s)); } // no collapsed "A " descriptors

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
const first = (n) => String(n || '').split(' ')[0];
function vfirst(id) {
  try { return first(Game.displayName(id)); } catch (e) { return id; }
}

(async () => {
  await Game.init();
  console.log(`seed=${SEED}`);

  // ================= A. previously write-only memories now have readers =================
  console.log('\n-- A. write-only batteries: label + menu item + response line --');
  const TYPES = [
    // [type, response-must-contain]
    ['wrongly_accused', 'liar'],
    ['confession', 'truth once'],
    ['hostile', 'Carefully'],
    ['exposed_cannibal', 'chose wrong'],
    ['offered_meat', 'all it ever is'],
    ['shared_secret', "didn't look away"],
    ['saw_weakness', 'I saw'],
    ['warned', 'Pulling weight'],
    ['feast', 'firelight'],
    ['moot_vote', 'stood up at the moot'],
    ['heckled', 'cameras saw'],
    ['appeal', 'take the work'],
    ['grudging_respect', 'stopped watching'],
    ['blame', 'the pot'],
    ['moot_case_held', 'fire agreed'],
    ['moot_weak_case', 'overreached'],
    ['moot_split_fire', 'split the fire'],
    ['duel_terms', 'the terms'],
    ['duel_fought', "It's settled"],
    ['lost_duel', 'witnessed'],
  ];
  for (const [type, needle] of TYPES) {
    const ids = freshGame();
    const vid = ids[0];
    const label = Game.convoMemoryAbout(type);
    ok(`A:${type} label exists`, typeof label === 'string' && label.length > 3, String(label));
    Game.remember(vid, type, 'test note');
    Game.state.village.trust[vid] = 80;
    Game.startConvo(vid);
    const alive = Game.convoWhatsAlive(vid) || [];
    const item = alive.find(x => x && x.id === 'alive:memory:' + type);
    ok(`A:${type} menu item surfaces`, !!item, JSON.stringify(alive.map(x => x.id)));
    const turn = Game.convoTurn(vid, 'alive:memory:' + type);
    ok(`A:${type} response names the deed`, turn && String(turn.line).indexOf(needle) >= 0, String(turn && turn.line).slice(0, 120));
  }

  // A2. deal_refused has a BEHAVIOR read: the sweetener shrinks and they cite it.
  console.log('\n-- A2. deal_refused changes offerDeal behavior --');
  {
    const ids = freshGame();
    const vid = ids[0];
    Game.state.scholar.inventory = [{ name: 'Test rations', kcalEach: 150, units: 4, spoilDay: 999 }];
    const said = [];
    const keepSay = Game.say; Game.say = (s) => said.push(String(s));
    Game.state.village.trust[vid] = 10;
    Game.offerDeal(vid, 'forage');
    const citedClean = said.some(s => /took the food and walked/.test(s));
    ok('A2: no deal_refused memory -> no citation', !citedClean, said.join(' | ').slice(0, 200));
    Game.state.scholar.inventory = [{ name: 'Test rations', kcalEach: 150, units: 4, spoilDay: 999 }];
    Game.remember(vid, 'deal_refused', 'took food, still refused forage');
    said.length = 0;
    Game.offerDeal(vid, 'forage');
    const cited = said.some(s => /took the food and walked/.test(s));
    ok('A2: deal_refused memory -> NPC cites it before dealing', cited, said.join(' | ').slice(0, 200));
    Game.say = keepSay;
  }

  // A3. saw_kill witness stamping: subject-stamped, on the witness's record.
  console.log('\n-- A3. stampKillWitnesses: allies remember with subject=doer --');
  {
    const ids = freshGame();
    const doer = ids[0], ally = ids[1], other = ids[2];
    Game.stampKillWitnesses(doer, 'the highbeam deer', [ally, other, doer]);
    const am = (Game.state.village.memory[ally] || []).filter(m => m.t === 'saw_kill');
    ok('A3: ally got saw_kill', am.length === 1, JSON.stringify(am));
    ok('A3: subject is the doer', am[0] && am[0].subject === doer, JSON.stringify(am[0]));
    const dm = (Game.state.village.memory[doer] || []).filter(m => m.t === 'saw_kill');
    ok('A3: doer does not witness themselves', dm.length === 0);
  }

  // ================= B. villager-to-villager transcripts (sense-tested) =================
  console.log('\n-- B1. transcript: villager recalls another villager\'s kill --');
  {
    const ids = freshGame();
    const vid = ids[0], oid = ids[1];
    Game.state.village.trust[vid] = 80;
    Game.remember(oid, 'hero', 'killed the highbeam deer');
    const origPick = Game.t2pickOther;
    Game.t2pickOther = () => ({ id: oid, why: 'neutral' });
    Game.startConvo(vid);
    const line = Game.convoAskTopic(vid, 'others');
    Game.t2pickOther = origPick;
    console.log('   T1> ' + line);
    const oname = vfirst(oid);
    ok('B1: names the doer', String(line).indexOf(oname) >= 0 && realName(line), line);
    ok('B1: names the deed', /highbeam deer/i.test(String(line)), line);
    ok('B1: no placeholders', noPlaceholders(line), line);
    ok('B1: reads as a person talking, not a ledger', /sleep better|brag/i.test(String(line)), line);
  }

  console.log('\n-- B2. transcript: "still hasn\'t forgiven" — recorded grievance between villagers --');
  {
    const ids = freshGame();
    const vid = ids[0], oid = ids[1];
    Game.state.village.trust[vid] = 80;
    Game.recordGrievance(vid, oid, 'ambushed', 60);
    const gl = Game.convoGrievanceLine(vid, oid);
    console.log('   T2> ' + gl);
    ok('B2: grievance renders as a human phrase', !!gl && /what happened on the trail/.test(gl), gl);
    ok('B2: "still hasn\'t forgiven" frame', !!gl && /haven't forgiven/.test(gl), gl);
    const origPick = Game.t2pickOther;
    Game.t2pickOther = () => ({ id: oid, why: 'vgrievance' });
    Game.startConvo(vid);
    const line = Game.convoAskTopic(vid, 'others');
    Game.t2pickOther = origPick;
    console.log('   T2t> ' + line);
    ok('B2: surfaces in the OTHERS topic', !!line && /haven't forgiven/.test(line), line);
    ok('B2: no placeholders', noPlaceholders(line), line);
  }

  console.log('\n-- B3. transcript: witness line — "I was there when..." --');
  {
    const ids = freshGame();
    const vid = ids[0], oid = ids[1];
    Game.state.village.trust[vid] = 80;
    Game.remember(oid, 'hero', 'killed the highbeam deer');
    Game.stampKillWitnesses(oid, 'the highbeam deer', [vid]);
    const dl = Game.deedMemLine(vid, oid);
    console.log('   T3> ' + dl);
    ok('B3: witness memory beats generic deed recall', !!dl && /I was there/.test(dl), dl);
    const origPick = Game.t2pickOther;
    Game.t2pickOther = () => ({ id: oid, why: 'neutral' });
    Game.startConvo(vid);
    const line = Game.convoAskTopic(vid, 'others');
    Game.t2pickOther = origPick;
    console.log('   T3t> ' + line);
    ok('B3: transcript carries the witness frame', !!line && /I was there/.test(line), line);
    ok('B3: no placeholders, real names', noPlaceholders(line) && realName(line), line);
  }

  // B4. cook's blame is recallable by others — write the note the way the
  // game does (descriptor-safe first()).
  console.log('\n-- B4. blame: villagers recall what the cook\'s pot did --');
  {
    const ids = freshGame();
    const vid = ids[0], cook = ids[1], sick = ids[2];
    const sickRef = (() => { const dn = String(Game.displayName(sick)); return /^an? /i.test(dn) ? dn : dn.split(' ')[0]; })();
    Game.remember(cook, 'blame', 'their cooking sickened ' + sickRef);
    const dl = Game.deedMemLine(vid, cook);
    console.log('   T4> ' + dl);
    ok('B4: blame recalled with the victim', !!dl && String(dl).indexOf(sickRef) >= 0, dl);
    ok('B4: no collapsed "A" names, no bad possessives', !/(^|\s)A(\s|['’]|$)/.test(String(dl)) && !/40s's/.test(String(dl)), dl);
  }

  // ================= C. inter-village grievances as events =================
  console.log('\n-- C. inter-village grievance events --');
  {
    const ids = freshGame();
    const vid = ids[0];
    Game.state.otherVillages = [{ id: 'v_cinder', name: 'Cinderhold', opinion: 0, generated: true, rumored: true }];
    Game._nudgeOpinion('v_cinder', -40, 'raid');
    const ov = Game._otherVillage('v_cinder');
    ok('C: opinion moved', ov.opinion === -40, String(ov.opinion));
    ok('C: negative nudge stamped a recallable event', (ov.events || []).length === 1 && ov.events[0].what === 'Haven raided our stores',
      JSON.stringify(ov.events));
    const expl = Game.ovOpinionExplain('v_cinder');
    console.log('   EX> ' + expl);
    ok('C: explain renders number + event', /Opinion -40/.test(expl) && /Haven raided our stores/.test(expl), expl);
    ok('C: explain closes with the meaning frame', /That's what happened/.test(expl), expl);
    // them->haven direction: sabotage is THEIR deed, remembered as theirs
    Game.ovEvent('v_cinder', 'their tribute arrived light — grain "lost on the road"', 'sabotage', 'theirs');
    const grs = Game.ovGrievances('v_cinder');
    ok('C: both directions recalled', grs.length === 2 && grs[0].dir === 'theirs', JSON.stringify(grs.map(g => g.dir)));
    // the neighbors gossip topic names the deed
    Game.state.village.trust[vid] = 80;
    Game.startConvo(vid);
    const line = Game.convoAskTopic(vid, 'neighbors');
    console.log('   CN> ' + line);
    // newest event first: the sabotage is the freshest recallable deed —
    // either grievance event proves the number became a story.
    ok('C: neighbors topic names the village and a recallable deed',
      !!line && /Cinderhold/.test(line) && (/Haven raided our stores/.test(line) || /lost on the road/.test(line)), line);
    ok('C: no placeholders', noPlaceholders(line), line);
    // positive nudges stay number-only — grievances are the read surface
    const before = (Game._otherVillage('v_cinder').events || []).length;
    Game._nudgeOpinion('v_cinder', 5, 'gift');
    ok('C: positive nudges do not stamp grievance events', (Game._otherVillage('v_cinder').events || []).length === before);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(2); });
