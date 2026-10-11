#!/usr/bin/env node
// Proof: journey-deepening fixes (2026-10-11).
//  A. convo-beats.js: 17 stray-"]" typos in REPLY_POOLS third variants —
//     rendered as `"Tell me about before."]` in choice menus. All fixed.
//  B. game.js ask:gossip fresh-path: fetched the freshest gossip `g` then
//     ignored it, saying a static "doing right by people" line while the
//     comment promised "with their distortion". Now renders the actual
//     gossip's strongest positive dim, exaggerated at distortion >= 2.
//  C. conversation.js voiceLine: comma-openers ("Honestly, ") composed with
//     the capital-W resume opener -> "Honestly, We never finished…".
//     Now continues lowercase for common sentence-starters; dash/sentence
//     openers and the pronoun I / names keep their case.
//  D. convo-dialogue.js dlg:stay: six stays cycled 3 lines verbatim, the
//     seek_comfort want stalling at stage 2 with grief never named. The
//     fourth stay now deepens and resolves the want as 'comforted'.
//
// Usage: node scripts/test-journey-deepening-fixes-20261011.js
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

function testBeatsTypos(Game, seed) {
  const tag = `[seed ${seed}]`;
  // A1: static — the typo signature is gone from source.
  const src = fs.readFileSync(path.join(ROOT, 'src/js/convo-beats.js'), 'utf8');
  check(tag + ' A1 no stray-"]" typo clusters in convo-beats.js', !/["?!]"\]'/.test(src));
  // A2: behavioral — drive real conversations, sweep every rendered label.
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId).slice(0, 3);
  let labels = 0, bad = 0;
  for (const vid of roster) {
    let st;
    try { st = Game.startConvo(vid); } catch (e) { continue; }
    if (!st) continue;
    let choices = st.choices || [];
    for (let turn = 0; turn < 25; turn++) {
      for (const ch of choices) {
        if (!ch || ch.id === 'leave') continue;
        labels++;
        const lab = String(ch.label || '');
        if (lab.includes(']')) { bad++; }
  // A4: data-level — every REPLY_POOLS label literal is a clean quoted string.
  const lines = src.split('\n');
  const poolStart = lines.findIndex(l => l.includes('const REPLY_POOLS'));
  let depth = 0, poolEnd = -1;
  for (let i = poolStart; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch === '{') depth++; if (ch === '}') depth--; }
    if (depth === 0 && i > poolStart) { poolEnd = i; break; }
  }
  const poolSrc = lines.slice(poolStart, poolEnd + 1).join('\n');
  const lits = poolSrc.match(/'"(?:[^'\\]|\\.)*"'/g) || [];
  const badLits = lits.filter(l => l.includes(']'));
  check(tag + ' A4 all ' + lits.length + ' REPLY_POOLS labels are clean quoted strings',
    lits.length > 40 && badLits.length === 0,
    'labels=' + lits.length + ' bad=' + JSON.stringify(badLits).slice(0, 200));
      }
      const pick = choices.find(c => c && (c.id === 'dlg:more' || c.id === 'dlg:react'))
        || choices.find(c => c && c.id !== 'leave' && c.id !== 'silence');
      if (!pick) break;
      let res;
      try { res = Game.convoTurn(vid, pick.id); } catch (e) { break; }
      if (!res || res.ended) break;
      choices = res.choices || [];
    }
    try { Game.endConvo(vid); } catch (e) {}
  }
  check(tag + ' A2 labels swept: ' + labels, labels > 20, 'labels=' + labels);
  check(tag + ' A3 no "]" in any rendered choice label', bad === 0, 'bad=' + bad);
}

function testGossipFresh(Game, seed) {
  const tag = `[seed ${seed}]`;
  // NOTE: the ask:gossip choice routes to Game.convoAskTopic(vid, 'gossip')
  // (conversation.js), which captures askAbout's beats and returns the line
  // the player reads. Driving it directly is the exact choice path, without
  // fighting the menu builder's trust/mood gating.
  const _dark = Game.npcDark;
  Game.npcDark = function () { return null; }; // keep the dark branch dry
  const _gossipAbout = Game.npcGossipAbout;
  Game.npcGossipAbout = function () { return null; }; // keep the 50/50
  // people-gossip pre-branch dry — we are testing the fresh-path rendering
  try {
    Game.state.village.gossip = [];
    const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
    const w0 = roster[0];
    Game.seedGossip('honor_dead', { honest: 4, generous: 3, brave: 0, competent: 0 }, [w0]);
    const g = Game.state.village.gossip[0];
    check(tag + ' B1 gossip seeded and heard by the NPC', !!g && g.heard.includes(w0),
      'g=' + JSON.stringify(g && g.heard));

    Game.startConvo(w0);
    const line = String(Game.convoAskTopic(w0, 'gossip') || '');
    check(tag + ' B2 fresh gossip renders its actual content', /told it straight/.test(line), line.slice(0, 160));
    check(tag + ' B3 static line is gone', !/doing right by people/.test(line), line.slice(0, 160));
    try { Game.endConvo(w0); } catch (e) {}

    // Distortion tier: the third retelling exaggerates, per the seedGossip
    // contract ("she's giving away all the supplies").
    g.distortion = 3;
    Game.startConvo(w0);
    const big = String(Game.convoAskTopic(w0, 'gossip') || '');
    check(tag + ' B4 distortion>=2 exaggerates honestly', /can't tell a lie to save your life/.test(big), big.slice(0, 160));
    check(tag + ' B5 plain variant not used at distortion 3', !/told it straight/.test(big), big.slice(0, 160));
    try { Game.endConvo(w0); } catch (e) {}
  } finally {
    Game.npcDark = _dark; Game.npcGossipAbout = _gossipAbout;
  }
}

function testVoiceCase(Game, seed) {
  const tag = `[seed ${seed}]`;
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const _pick = Game.convoPickCycle;
  const _rand = Math.random;
  try {
    // Force the comma-opener: "Honestly, " + resume opener (the reported bug).
    Game.convoPickCycle = function () { return 'Honestly, '; };
    Math.random = () => 0; // useOpen path
    const bug = Game.voiceLine(vid, '"We never finished talking about that question — we got cut off."');
    check(tag + ' C1 comma-opener continues lowercase', bug === '"Honestly, we never finished talking about that question — we got cut off."', bug);
    const iKept = Game.voiceLine(vid, '"I keep thinking about them."');
    check(tag + ' C2 pronoun I keeps its case', iKept === '"Honestly, I keep thinking about them."', iKept);
    const nameKept = Game.voiceLine(vid, '"Wanda never came back."');
    check(tag + ' C3 names never downcased', nameKept === '"Honestly, Wanda never came back."', nameKept);
    // Dash openers start a new clause — capital stands.
    Game.convoPickCycle = function () { return 'Let me be straight — '; };
    const dash = Game.voiceLine(vid, '"We never finished talking about that question — we got cut off."');
    check(tag + ' C4 dash-opener keeps the capital', dash === '"Let me be straight — We never finished talking about that question — we got cut off."', dash);
    // Sentence openers keep the capital.
    Game.convoPickCycle = function () { return 'Look. '; };
    const sent = Game.voiceLine(vid, '"We never finished talking about that question — we got cut off."');
    check(tag + ' C5 sentence-opener keeps the capital', sent === '"Look. We never finished talking about that question — we got cut off."', sent);
  } finally {
    Game.convoPickCycle = _pick; Math.random = _rand;
  }
}

function testStayDeepens(Game, seed) {
  const tag = `[seed ${seed}]`;
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  // Plant an unresolved seek_comfort seed so the want is the conversation's.
  Game.state.village.convoSeeds = Game.state.village.convoSeeds || {};
  Game.state.village.convoSeeds[vid] = { wantId: 'seek_comfort', note: 'test', day: Game.state.scholar.day || 0 };
  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  check(tag + ' D1 seek_comfort want is live', c && c.want && c.want.id === 'seek_comfort',
    'want=' + (c && c.want && c.want.id));
  // Stage 2 unlocks the dlg:stay menu option; engage twice to get there.
  Game.convoTurn(vid, 'dlg:comfort');
  Game.convoTurn(vid, 'dlg:comfort');
  const stage = (Game.convoGet(vid).want || {}).stage;
  check(tag + ' D2 want reached stage 2', stage >= 2, 'stage=' + stage);

  const lines = [];
  for (let i = 0; i < 6; i++) {
    const res = Game.convoTurn(vid, 'dlg:stay');
    if (!res) break;
    lines.push(res.line);
  }
  check(tag + ' D3 six stays delivered', lines.length === 6, 'got=' + lines.length);
  const first3 = lines.slice(0, 3);
  check(tag + ' D4 first three stays are the 3-line pool, no verbatim repeat',
    new Set(first3).size === 3, JSON.stringify(first3).slice(0, 200));
  const deep = lines[3] || '';
  check(tag + ' D5 fourth stay deepens (grief named)', /keep thinking about them|quiet parts/.test(deep), String(deep).slice(0, 140));
  const w = Game.convoGet(vid).want || {};
  check(tag + ' D6 want resolves as comforted', w.stage === 3 && w.resolution === 'comforted',
    'stage=' + w.stage + ' resolution=' + w.resolution);
  check(tag + ' D7 no fifth/sixth stay repeats the filler pool verbatim',
    !lines.slice(4).some(l => first3.includes(l)));
  try { Game.endConvo(vid); } catch (e) {}
}

(async function main() {
  for (const seed of SEEDS) {
    const Game = await setup(seed);
    testBeatsTypos(Game, seed);
    testGossipFresh(Game, seed);
    testVoiceCase(Game, seed);
    testStayDeepens(Game, seed);
  }
  console.log(`\n${pass} passed, ${fail} failed${fail ? ' — see FAIL lines above' : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
