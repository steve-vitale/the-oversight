#!/usr/bin/env node
// sense-trust-convos.js — SENSE-TESTING LAW sampler for the trust & social lever.
// Plays full multi-turn conversations with several villagers at different
// trust bands and prints the raw transcripts for a human to read: meaning,
// coherence, relevance, consequences — never just counts.
// Also dumps each villager's background/personality/voice fields so the
// reader can check for incoherence (Steve 2026-10-11: backgrounds have errors).
//
// Usage: node scripts/sense-trust-convos.js [SEED=...] [N=3]
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261011', 10);
const NCONV = parseInt(process.env.N || '3', 10);

let _s = SEED >>> 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
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
if (typeof Game.emit !== 'function') {
  Game.emit = function (msg) { try { (this.log = this.log || []).push(String(msg)); } catch (e) {} return msg; };
}

// Engage-ish picks: prefer wants, answers, reactions; occasionally change subject.
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy'];
function pickChoice(choices, turn) {
  for (const id of ENGAGE) {
    const c = (choices || []).find(x => x && x.id === id);
    if (c) return c;
  }
  const ans = (choices || []).find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  const gq = (choices || []).find(x => x && x.id && x.id.indexOf('gq:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (gq) return gq;
  if (turn >= 2) {
    const sub = (choices || []).find(x => x && x.id === 'dlg:subject');
    if (sub) return sub;
  }
  return (choices || []).find(x => x && x.id === 'leave') || null;
}

function runConversation(vid, maxTurns) {
  const lines = [];
  const trust0 = ((Game.state.village || {}).trust || {})[vid];
  const r0 = Game.startConvo(vid);
  if (r0.line) lines.push({ who: 'THEM', text: String(r0.line) });
  let r = r0;
  for (let turn = 0; turn < maxTurns; turn++) {
    const choices = (r.choices && r.choices.length) ? r.choices : Game.convoChoices(vid);
    const pick = pickChoice(choices, turn);
    if (!pick || pick.id === 'leave') break;
    lines.push({ who: 'YOU', text: String(pick.label) });
    r = Game.convoTurn(vid, pick.id);
    if (r.line) lines.push({ who: 'THEM', text: String(r.line) });
    if (r.ended) break;
  }
  const beforeEnd = Game.convoGet(vid).transcript.length;
  Game.endConvo(vid, 'done');
  const closing = Game.convoGet(vid).transcript.slice(beforeEnd).filter(e => e.who === 'them').map(e => e.text);
  for (const l of closing) lines.push({ who: 'THEM(close)', text: l });
  const trust1 = ((Game.state.village || {}).trust || {})[vid];
  const want = Game.convoGet(vid).want || {};
  return { lines, trust0, trust1, want };
}

function personCard(vid) {
  let p = {};
  try { p = Game.getPerson ? Game.getPerson(vid) : {}; } catch (e) {}
  const out = {
    name: Game.displayName ? Game.displayName(vid) : vid,
    id: vid,
    occupation: p.occupationId || p.formerOccupation || '?',
    origin: p.origin || p.hometown || '?',
    age: p.age != null ? p.age : '?',
    temperament: p.temperament || '?',
    goal: null, mood: null, trust: ((Game.state.village || {}).trust || {})[vid],
    backstory: null, voice: null, personality: null,
  };
  try { out.goal = Game.npcGoal(vid); } catch (e) {}
  try { out.mood = Game.npcMood ? Game.npcMood(vid) : null; } catch (e) {}
  try { out.backstory = (p.backstory || p.bio || p.past || null); } catch (e) {}
  try { out.voice = (p.voice || p.speechStyle || null); } catch (e) {}
  try { out.personality = (p.personality || p.traits || null); } catch (e) {}
  return out;
}

async function main() {
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.day = 30;

  const npcs = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const verbal = npcs.filter(id => { try { return Game.npcComm(id).level !== 'none'; } catch (e) { return true; } });
  const picks = verbal.slice(0, NCONV);
  // Trust bands: spread across the spectrum so the reader sees gated behavior.
  const bands = [12, 38, 62, 82];
  picks.forEach((vid, i) => {
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[vid] = bands[i % bands.length];
  });

  console.log(`# Sense-testing transcripts — trust & social (seed ${SEED}, day 30)\n`);
  for (const vid of picks) {
    const card = personCard(vid);
    console.log(`## ${card.name} — trust ${card.trust}, goal '${card.goal}', temperament '${card.temperament}', mood '${card.mood}'`);
    console.log(`occupation: ${card.occupation} | origin: ${card.origin} | age: ${card.age}`);
    console.log(`backstory: ${JSON.stringify(card.backstory)}`);
    console.log(`voice: ${JSON.stringify(card.voice)}`);
    console.log(`personality: ${JSON.stringify(card.personality)}\n`);
    const c = runConversation(vid, 8);
    for (const l of c.lines) console.log(`${l.who}: ${l.text}`);
    console.log(`\n[trust ${c.trust0} -> ${c.trust1} | want: ${c.want.id || 'none'} stage=${c.want.stage || 0} resolution=${c.want.resolution || 'none'}]`);
    console.log('\n---\n');
  }
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
