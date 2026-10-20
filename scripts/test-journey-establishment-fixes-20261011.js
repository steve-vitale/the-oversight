#!/usr/bin/env node
// Proof: journey-establishment fixes (2026-10-11).
//  A. Overnight starvation death is recorded as 'starvation', never 'the night'
//     (game.js endDay: the branch's own comment + cheat-death kind + the
//     villager parallel all say starvation; the record said 'the night').
//  B. share_news gossip grammar: no "weren't a what they said", a/an
//     agreement, occupations lowercased mid-sentence.
//  C. share_news news-type freshness: "tell me more" never repeats a news
//     type inside one conversation; exhaustion is honest.
//  D. Hook promise: the treeline opener is answered by the sighting first.
//
// Usage: node scripts/test-journey-establishment-fixes-20261011.js
// (SEEDS env override, default 20261011,777,424242)

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [20261011, 777, 424242]);

let _s = 0;
function seedRng(seed) {
  _s = seed >>> 0;
  Math.random = function () {
    _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
    let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (detail ? ' :: ' + detail : '')); console.log('FAIL: ' + name + (detail ? ' :: ' + detail : '')); }
}

async function setup(seed) {
  seedRng(seed);
  global.window = global;
  const files = [
    'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
    'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
    'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js',
    'src/js/convo-mood.js', 'src/js/convoTopics.js', 'src/js/convo-wants.js',
    'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js',
    'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
    'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js',
    'src/js/contests.js', 'src/js/broadcast.js', 'src/js/contestEngine.js',
    'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js',
    'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js',
    'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js',
    'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/waveLedger.js',
    'src/js/feastBuff.js', 'src/js/ledger.js', 'src/js/abilityActions.js',
    'src/js/monsterBehaviors.js', 'src/js/partyTactics.js',
    'src/js/sigW3a.js', 'src/js/statusEffects.js', 'src/js/sigW3b.js',
    'src/js/metaProgression.js', 'src/js/sigW3c.js',
    'src/js/villager-agency.js', 'src/js/fieldFights.js',
    'src/js/villager-objectives.js', 'src/js/codex-people.js',
    'src/js/membership.js', 'src/js/havenGrowth.js', 'src/js/hierarchy.js',
    'src/js/comms.js', 'src/js/safetynets.js', 'src/js/villageAgency.js',
    'src/js/debug-scenarios.js', 'src/js/build.js',
  ];
  for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
  delete global.window;
  const Game = globalThis.Scattering.Game;
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  return Game;
}

async function testStarvationCause(Game, seed) {
  const tag = `[seed ${seed}]`;
  // Force the overnight starvation spiral: no reserves, no water, 1 HP.
  const s = Game.state.scholar;
  s.kcal = 0; s.hydration = 0; s.health = 1; s.energy = 10;
  s.inventory = [];
  try { Game.state.village.pantry = []; } catch (e) {}
  // Isolate the branch under test: no healer rescue, no cheat-death.
  const _healer = Game.healerRounds, _cheat = Game.maybeCheatDeath, _pd = Game.playerDeath;
  Game.healerRounds = function () { return null; };
  Game.maybeCheatDeath = function () { return false; };
  let deathCause = null;
  const said = [];
  const _say = Game.say;
  Game.say = function (line) { said.push(String(line)); try { return _say.apply(this, arguments); } catch (e) {} };
  Game.playerDeath = function (cause) { deathCause = cause; return _pd.call(this, cause); };
  try { Game.endDay(); } catch (e) { /* death flow may throw past the record */ }
  Game.healerRounds = _healer; Game.maybeCheatDeath = _cheat; Game.playerDeath = _pd; Game.say = _say;

  check(tag + ' A1 starvation death fires playerDeath', deathCause !== null, 'playerDeath never called');
  check(tag + ' A2 death cause is starvation', deathCause === 'starvation', 'cause=' + deathCause);
  const deathLine = said.find(l => /is dead/.test(l)) || '';
  check(tag + ' A3 death line names starvation', /starvation/.test(deathLine), deathLine.slice(0, 120));
  check(tag + ' A4 death line never says "the night"', !/the night/.test(deathLine), deathLine.slice(0, 120));
  try {
    const fallen = (Game.state.village.fallen || []).slice(-1)[0] || {};
    check(tag + ' A5 fallen record cause is starvation', fallen.cause === 'starvation', 'fallen.cause=' + fallen.cause);
  } catch (e) { check(tag + ' A5 fallen record readable', false, e.message); }
}

async function testNewsFixes(Game, seed) {
  const tag = `[seed ${seed}]`;
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  // Control the gossip source so the template is exercised deterministically.
  const _gossip = Game.npcGossipAbout, _memAbout = Game.convoMemoryAbout, _lately = Game.t2LatelyEvent;
  const gossipQueue = [
    { field: 'occupation', lie: null, truth: 'ER nurse' },
    { field: 'occupation', lie: 'doctor', truth: 'tailor' },
    { field: 'occupation', lie: null, truth: 'Veterinarian' },
    { field: 'origin', lie: null, truth: 'Chicago' },
  ];
  let gi = 0;
  Game.npcGossipAbout = function () { return gossipQueue[gi++] || null; };
  Game.convoMemoryAbout = function () { return null; };
  Game.t2LatelyEvent = function () { return null; };
  // Keep the village neutral so the observation branch stays dry.
  try { Game.state.village.grief = 0; Game.state.village.cheer = 0; } catch (e) {}

  Game.startConvo(vid);

  // Grammar variants: one gossip per conversation (the freshness rule), so
  // each variant gets a fresh want.
  const variants = [
    { g: { field: 'occupation', lie: null, truth: 'ER nurse' },
      checks: [
        ['no "weren\'t a what they said"', (l) => !/weren't a what they said/.test(l)],
        ['a/an agreement ("an ER nurse")', (l) => /an ER nurse/.test(l)],
      ] },
    { g: { field: 'occupation', lie: 'doctor', truth: 'tailor' },
      checks: [
        ['known lie keeps "weren\'t a <lie>"', (l) => /weren't a doctor/.test(l)],
        ['mid-sentence occupation lowercased', (l) => /a tailor/.test(l) && !/a Tailor/.test(l)],
      ] },
    { g: { field: 'occupation', lie: null, truth: 'Veterinarian' },
      checks: [
        ['"a veterinarian" not "a Veterinarian"', (l) => /a veterinarian/.test(l)],
      ] },
    { g: { field: 'origin', lie: null, truth: 'Chicago' },
      checks: [
        ['origin branch grammatical', (l) => /not from where they said/.test(l)],
      ] },
  ];
  let bi = 0;
  for (const v of variants) {
    bi++;
    const w = Game.convoGet(vid).want || {};
    w.hook = null; w.newsGiven = [];
    gi = 0; gossipQueue.length = 0; gossipQueue.push(v.g);
    const l = Game.convoWantNews(vid);
    for (const [nm, fn] of v.checks) {
      check(tag + ` B${bi} ${nm}`, fn(l), l);
    }
  }

  // Freshness: even with gossip available, the same template must never
  // repeat inside one conversation — and the exhaustion line appears only
  // after every type is spent.
  const w3 = Game.convoGet(vid).want || {};
  w3.hook = null; w3.newsGiven = [];
  gi = 0; gossipQueue.length = 0;
  gossipQueue.push({ field: 'occupation', lie: null, truth: 'baker' });
  gossipQueue.push({ field: 'occupation', lie: null, truth: 'mason' });
  const seen = [];
  for (let i = 0; i < 8; i++) {
    const l = Game.convoWantNews(vid);
    seen.push(l);
    if (/everything I've got/.test(l)) break;
  }
  check(tag + ' C1 exhaustion line eventually appears', seen.some(l => /everything I've got/.test(l)),
    seen.join(' || ').slice(0, 300));
  const gossipLines = seen.filter(l => /Don't say I told you/.test(l));
  check(tag + ' C2 gossip template never repeats in one conversation', gossipLines.length <= 1,
    gossipLines.length + ' gossip lines: ' + gossipLines.join(' || ').slice(0, 200));
  const preExhaust = seen.slice(0, seen.findIndex(l => /everything I've got/.test(l)));
  const uniq = new Set(preExhaust);
  check(tag + ' C3 no verbatim line repeats before exhaustion', uniq.size === preExhaust.length,
    'dupes: ' + preExhaust.filter((x, i) => preExhaust.indexOf(x) !== i).join(' || ').slice(0, 200));
  check(tag + ' C4 second "tell me more" is not gossip again', !/Don't say I told you/.test(seen[1] || ''),
    (seen[1] || '').slice(0, 160));
  const w2 = Game.convoGet(vid).want || {};
  w2.hook = 'treeline'; w2.newsGiven = [];
  gi = 0; // gossip available again — the hook must still win
  const h1 = Game.convoWantNews(vid);
  check(tag + ' D1 treeline hook answered by the sighting', /treeline, this morning/.test(h1), h1);

  Game.npcGossipAbout = _gossip; Game.convoMemoryAbout = _memAbout; Game.t2LatelyEvent = _lately;
  try { Game.endConvo(vid, 'done'); } catch (e) {}
}

async function testCommitStageBlindness(Game, seed) {
  const tag = `[seed ${seed}]`;
  // Find a villager whose want is ask_favor (re-roll across passes; the
  // want draw is RNG-driven and rare on some seeds).
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid=roster[0];
  try { Game.endConvo(vid,'done'); } catch(e) {}
  Game.npcNeeds(vid).hunger=90;
  const favor=Game.convoBuildFavor(vid,{kind:'food_share',hunger:90});Game.convoStoreFavor(favor);
  Game.convoPlantSeed(vid,{wantId:'ask_favor',favorId:favor.id,note:favor.short});Game.startConvo(vid);
  check(tag+' E0 prepared supported food favor opens',Game.convoGet(vid).want?.id==='ask_favor');
  const trustOf = () => ((Game.state.village.trust || {})[vid] === undefined ? 10 : Game.state.village.trust[vid]);

  // Drive to stage 2, then commit.
  Game.convoTurn(vid, 'dlg:help');
  const t0 = trustOf();
  Game.convoTurn(vid, 'dlg:commit');
  const w1 = (Game.convoGet(vid).want || {});
  const t1 = trustOf();
  check(tag + ' E1 commit resolves promised', w1.stage === 3 && w1.resolution === 'promised',
    `stage=${w1.stage} resolution=${w1.resolution}`);
  check(tag + ' E2 first commit grants trust', t1 > t0, `trust ${t0} -> ${t1}`);

  // E3: post-commit "can't" must NOT fire the favor-refusal guilt trip.
  const r3 = Game.convoTurn(vid, 'dlg:cant');
  const w3 = (Game.convoGet(vid).want || {});
  check(tag + ' E3 post-commit cant: no guilt trip', !/Forget I asked/i.test(r3.line || ''), (r3.line || '').slice(0, 120));
  check(tag + ' E4 post-commit cant: resolution stays promised', w3.resolution === 'promised',
    `resolution=${w3.resolution}`);
  check(tag + ' E5 post-commit cant: trust unchanged', trustOf() === t1, `trust ${t1} -> ${trustOf()}`);
  const mems = (((Game.state.village || {}).memory || {})[vid]) || [];
  check(tag + ' E6 post-commit cant: no false deflected memory',
    !mems.some(m => m && m.t === 'deflected'), JSON.stringify(mems.slice(-2)));

  // E7: post-commit "commit" again must NOT re-fire the thank-you + trust.
  const r4 = Game.convoTurn(vid, 'dlg:commit');
  check(tag + ' E7 repeat commit: honest "already said" line', /already said/i.test(r4.line || ''), (r4.line || '').slice(0, 120));
  check(tag + ' E8 repeat commit: no trust farm', trustOf() === t1, `trust ${t1} -> ${trustOf()}`);

  try { Game.endConvo(vid, 'done'); } catch (e) {}
}

async function main() {
  for (const seed of SEEDS) {
    console.log(`\n##### seed ${seed} #####`);
    try {
      const Game = await setup(seed);
      await testStarvationCause(Game, seed);
      await testNewsFixes(Game, seed);
      await testCommitStageBlindness(Game, seed);
    } catch (e) {
      check(`[seed ${seed}] harness survived`, false, (e && e.stack || e).split('\n').slice(0, 3).join(' | '));
    }
  }
  console.log(`\nPASS ${pass} / FAIL ${fail}`);
  if (failures.length) { console.log('FAILURES:\n- ' + failures.join('\n- ')); process.exit(1); }
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
