#!/usr/bin/env node
// PROOF: topic-thread exhaustion fix (journey sociallife 2026-10-11).
//
// BUG (before): the mourning 'lately' thread's follow-up pools hold exactly
// one line per level (cope/next/part). "Tell me more" past exhaustion:
//   (1) topic2Beat's index clamp re-served the last level's line verbatim,
//   (2) t2pick's `|| pool[0]` fallback defeated the no-repeat ledger, and
//   (3) the dlg:more handler returned the composed line even when sayLine
//       blocked it — so the PLAYER SAW "My part? I remember them. Someone
//       has to do it properly." x3 while the transcript ledger stayed clean.
// The no-repeat invariant held in the ledger but not on the screen.
//
// FIX (convoTopics.js topic2Beat): return null when the opener + one beat
// per level are consumed (topic2HasMore's contract) — the caller says the
// honest "that's all of it" and the menu retires "tell me more".
// FIX (convo-dialogue.js dlg:more / dlg:react): respect sayLine's null — a
// blocked repeat is treated as dry, never shown.
//
// Seeded BEFORE eval. Full production script list (minus DOM-only + drama).
// Usage: node scripts/test-soc-thread-exhaustion-20261011.js [SEED=...]

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261011', 10);

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
Game.emit = function (m) { return m; };

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS: ${name}`); }
  else { fail++; console.log(`FAIL: ${name}` + (extra ? ` — ${extra}` : '')); }
}

async function main() {
  await Game.init();
  Game.genDetail = () => ({});
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  // Force a live mourning event (grief > 0 -> t2LatelyEvent returns mourning).
  Game.state.village.grief = 1;

  const roster = Game.state.village.roster.filter(id => id !== Game.villagerId);
  let vid = null, opened = null;
  for (const id of roster) {
    try {
      const comm = Game.npcComm ? Game.npcComm(id) : { level: 'full' };
      if (comm.level === 'none') continue;
    } catch (e) {}
    const r0 = Game.startConvo(id);
    const ids = (r0.choices || []).map(c => c.id);
    const pick = ids.includes('alive:event:mourning') ? 'alive:event:mourning'
      : ids.includes('ask:lately') ? 'ask:lately' : null;
    if (pick) {
      const r1 = Game.convoTurn(id, pick);
      if (r1 && r1.line && /grief|died|lost someone|schedule itself/i.test(r1.line)) {
        vid = id; opened = r1;
        break;
      }
    }
    try { Game.endConvo(id, 'done'); } catch (e) {}
  }
  ok('a mourning lately-thread opened', !!vid, vid || 'none qualified');
  if (!vid) { console.log('SETUP FAILED'); process.exit(2); }
  console.log(`thread opened: ${String(opened.line).slice(0, 90)}`);

  // Hammer "tell me more" 8 times — past the 3 follow-up beats.
  const seen = [];
  let dryAdmission = false;
  let r = opened;
  for (let t = 0; t < 8; t++) {
    const ids = (r.choices || []).map(c => c.id);
    if (!ids.includes('dlg:more')) {
      console.log(`turn ${t}: dlg:more retired from menu (ids: ${ids.slice(0, 6).join(',')})`);
      break;
    }
    r = Game.convoTurn(vid, 'dlg:more');
    if (r.line) {
      seen.push(String(r.line));
      console.log(`more#${t + 1}: ${String(r.line).slice(0, 80)}`);
      if (/pretty much all of it|more to tell|whole of it/i.test(r.line)) dryAdmission = true;
    }
    if (r.ended) break;
  }
  Game.endConvo(vid, 'done');

  // THE PROOF: no verbatim repeat on the player-visible surface.
  const dupes = seen.filter((x, i) => seen.indexOf(x) !== i);
  ok('zero verbatim repeats across 8 "tell me more" taps (player-visible)',
    dupes.length === 0, dupes.slice(0, 1).join(' | ').slice(0, 120));
  ok('the thread dries honestly (dry admission spoken or menu retired)',
    dryAdmission || seen.length <= 4,
    `seen=${seen.length} dryAdmission=${dryAdmission}`);
  // And the transcript ledger agrees (it always did — the bug was on screen).
  const t = (Game.convoGet(vid).transcript || []).filter(e => e.who === 'them').map(e => String(e.text));
  const tdupes = t.filter((x, i) => t.indexOf(x) !== i);
  ok('zero verbatim repeats in the transcript ledger', tdupes.length === 0,
    tdupes.slice(0, 1).join(' | ').slice(0, 120));

  console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
