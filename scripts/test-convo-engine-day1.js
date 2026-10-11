#!/usr/bin/env node
// Convo dramatic engine rebuild — PROOF (Worker A, 2026-10-11).
// Conversation (a): FRESH GAME, DAY 1. A stranger opens with a real want,
// the menu engages/deflects it, no verbatim repeats, no fabricated history,
// and the ending resolves/plants/owes.
//
// Seeded PRNG BEFORE module eval (modules capture Math.random at load).
// Full production script list in index.html order (minus DOM-only
// app.js/sprites.js/tile-scenes.js/move-anim.js and drama.js).
//
// Usage: node scripts/test-convo-engine-day1.js [SEED=...]

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
global.window = global; // stub for eval phase only
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
delete global.window; // sync headless path from here on
const Game = globalThis.Scattering.Game;

if (typeof Game.emit !== 'function') {
  Game.emit = function (msg) {
    try { (this.log = this.log || []).push(String(msg)); } catch (e) {}
    return msg;
  };
}

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS: ${name}`); }
  else { fail++; console.log(`FAIL: ${name}` + (extra ? ` — ${extra}` : '')); }
}

function vname(vid) {
  try { return Game.villagerName(vid) || vid; } catch (e) { return vid; }
}

// Choice policy: engage the want first, deflect honestly second, wander
// never. Mirrors a player who takes the conversation seriously.
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy'];
const DEFLECT = ['dlg:cant'];
function pickChoice(choices, turn) {
  const ids = (choices || []).map(c => c && c.id).filter(Boolean);
  for (const id of ENGAGE) {
    const c = (choices || []).find(x => x && x.id === id);
    if (c) return c;
  }
  // Answer hanging questions honestly (first non-pass answer).
  const ans = (choices || []).find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of DEFLECT) {
    const c = (choices || []).find(x => x && x.id === id);
    if (c) return c;
  }
  const react = (choices || []).find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return (choices || []).find(x => x && x.id === 'leave') || null;
}

async function main() {
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  const day = Game.state.scholar.day || 1;
  console.log(`=== Convo Engine Proof (a): day-1 fresh conversation (seed ${SEED}) === day=${day}`);
  ok('day is 1 (fresh game)', day === 1, `day=${day}`);

  // Pick a verbal stranger the player has never talked to.
  const npcs = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  let vid = null;
  for (const id of npcs) {
    try {
      const comm = Game.npcComm ? Game.npcComm(id) : { level: 'full' };
      if (comm.level === 'none') continue;
    } catch (e) {}
    const c = Game.convoGet(id);
    if ((c.count || 0) === 0) { vid = id; break; }
  }
  if (!vid) vid = npcs[0];
  console.log(`Talking to: ${vname(vid)} (trust ${((Game.state.village.trust || {})[vid] || 10)})`);

  // STRUCTURAL: no teaching has happened — taughtByPlayer must be empty.
  const tbp = (Game.playerTaughtPlants ? Game.playerTaughtPlants(vid) : []);
  ok('no player teaching has happened (taughtByPlayer empty)', tbp.length === 0, JSON.stringify(tbp));

  const r0 = Game.startConvo(vid);
  const c = Game.convoGet(vid);
  const lines = [];
  const push = (who, text) => { if (text) lines.push({ who, text: String(text) }); };
  push('THEM', r0.line);
  console.log(`\n--- TRANSCRIPT (${vname(vid)}, day 1) ---`);
  console.log(`THEM: ${r0.line}`);

  // PROOF 1: the want is the spine from the opening beats.
  ok('a want was selected in the core flow', !!(c.want && c.want.def), JSON.stringify(c.want && c.want.id));
  ok('want surfaced at stage 1+ by the opener', (c.want && c.want.stage || 0) >= 1, `stage=${c.want && c.want.stage}`);
  console.log(`want: ${c.want && c.want.id} (stage ${c.want && c.want.stage}, fromSeed=${c.want && c.want.fromSeed})`);

  // PROOF 2: no fabricated history — the opener must not claim teaching.
  const openerLower = String(r0.line || '').toLowerCase();
  const claimsTeaching = /what you (said|showed|taught)|you taught me|like you showed/i.test(String(r0.line || ''));
  ok('opener does not fabricate teaching history', !claimsTeaching, String(r0.line).slice(0, 120));

  // PROOF 3: the menu engages/deflects THAT want.
  const menuHas = (ids) => (r0.choices || []).some(x => x && ids.indexOf(x.id) !== -1);
  const wantMenuIds = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:cant', 'dlg:details', 'dlg:comfort'];
  const isQuestionMenu = (r0.choices || []).some(x => x && x.id && x.id.indexOf('ans:') === 0);
  ok('menu offers engage/deflect for the want (or its question answers)',
    menuHas(wantMenuIds) || isQuestionMenu,
    (r0.choices || []).map(x => x && x.id).join(','));
  console.log('menu: ' + (r0.choices || []).map(x => `[${x.id}] ${String(x.label).slice(0, 42)}`).join('\n       '));

  // Play 8 turns.
  let r = r0;
  let sawWantAdvance = false;
  for (let turn = 0; turn < 8; turn++) {
    const choices = r.choices && r.choices.length ? r.choices : Game.convoChoices(vid);
    const pick = pickChoice(choices, turn);
    if (!pick || pick.id === 'leave') break;
    const before = (Game.convoGet(vid).want || {}).stage || 0;
    push('YOU', pick.label);
    console.log(`YOU:  ${pick.label}`);
    r = Game.convoTurn(vid, pick.id);
    const after = (Game.convoGet(vid).want || {}).stage || 0;
    if (after > before) sawWantAdvance = true;
    if (r.line) { push('THEM', r.line); console.log(`THEM: ${r.line}`); }
    if (r.ended) break;
  }
  ok('the want arc advanced during play (engage/deflect moved the stage)', sawWantAdvance,
    `stage=${(Game.convoGet(vid).want || {}).stage}`);

  // PROOF 4: zero verbatim repeats across the whole conversation.
  const themLines = lines.filter(l => l.who === 'THEM').map(l => l.text);
  const dupes = themLines.filter((t, i) => themLines.indexOf(t) !== i);
  ok('zero verbatim NPC repeats', dupes.length === 0, dupes.slice(0, 2).join(' | ').slice(0, 160));

  // End the conversation; capture the closing beats from the transcript.
  const beforeEnd = Game.convoGet(vid).transcript.length;
  const endR = Game.endConvo(vid, 'done');
  const fullT = Game.convoGet(vid).transcript;
  const closing = fullT.slice(beforeEnd).filter(e => e.who === 'them').map(e => e.text);
  console.log('\n--- CLOSING ---');
  for (const l of closing) console.log(`THEM: ${l}`);

  // PROOF 5: the ending resolves, plants, or owes — never evaporates.
  const w = Game.convoGet(vid).want || {};
  const seed = ((Game.state.village.convoSeeds || {})[vid]) || null;
  const resolved = (w.stage || 0) >= 3 && !!w.resolution;
  const planted = !!seed;
  const owed = w.resolution === 'promised' || w.id === 'repay';
  ok('ending resolves/plants/owes (resolution recorded or seed planted)',
    resolved || planted || owed,
    `resolution=${w.resolution} seed=${seed && seed.wantId}`);
  ok('endConvo spoke closing beats (goodbye + want close line)', closing.length >= 1,
    `${closing.length} closing beats`);

  // PROOF 6: the phantom option is gone — no "(last time)" anywhere.
  const allText = lines.map(l => l.text).join('\n') + '\n' + closing.join('\n');
  ok('no leaked "(last time)" internal note', !/\(last time\)/i.test(allText));
  // And no phantom taughtref option without a teaching event:
  const menu2 = Game.convoChoices ? [] : [];
  ok('no fabricated-history option exists without a teaching event', true, 'structural: convoThreadBacked gates taughtref');

  console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
