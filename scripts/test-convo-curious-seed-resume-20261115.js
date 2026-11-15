#!/usr/bin/env node
// Curious-seed resume stutter — PROOF (journey-scale r215, 2026-11-15).
// A curious seed's opener IS its question, and the seed note IS that
// question's topic — so the seed composition's "About {note} — " prefix
// restated the topic the question already asks:
//
//   Heidi  r215: "About whether you're staying — Are you going to stay?
//                  With us. For real."
//   Gabriel r215: "About what you believe in — Do you believe in
//                  anything? Now, I mean. After everything."
//   Amara  r215: "About how this changed you — Has this changed you?
//                  Like, fundamentally?"
//   Rufina r207: "About your plan here — So what's your plan here?
//                  Just... get through it?"
//
// 3/3 curious resumes this band + r207's case all stutter. The fix
// (conversation.js seed composition): a curious resume asks the question
// bare, like a fresh ask; same for any opener whose spoken part already
// contains the note verbatim. A non-curious seed whose opener does NOT
// name the note (share_news) must KEEP the prefix — the control.
//
// Seeded PRNG BEFORE module eval. Full production script list, minus
// DOM-only modules.
//
// Usage: node scripts/test-convo-curious-seed-resume-20261115.js [SEED=...]

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261115', 10);

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
  'src/js/game.js', 'src/js/encounters.js', 'src/js/text.js', 'src/js/conversation.js',
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

async function main() {
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.day = 20;

  const npcs = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const commAble = npcs.filter(id => { try { return Game.npcComm(id).level !== 'none'; } catch (e) { return true; } });
  ok('has a comm-able villager to talk to', commAble.length > 0, `npcs=${npcs.length}`);

  // resumeWithSeed: plant the seed, advance a day, open the conversation,
  // return the opener line. Tries villagers in order until one resumes the
  // seed (a grief/goal thread can displace the want opener).
  function resumeWithSeed(seed) {
    for (const vid of commAble) {
      Game.state.scholar.day = (Game.state.scholar.day || 20) + 1;
      Game.convoPlantSeed(vid, seed);
      const r = Game.startConvo(vid);
      const w = Game.convoGet(vid).want || {};
      const line = String(r.line || '');
      Game.endConvo(vid, 'left');
      if (w.fromSeed === true && w.id === seed.wantId) return { vid, line, w };
      // Not a seed resume (displaced thread) — try the next villager.
    }
    return { vid: null, line: '', w: {} };
  }

  const cases = [
    { qid: 'q_stay', note: "whether you're staying", frag: 'Are you going to stay?', label: 'Heidi r215 (q_stay)' },
    { qid: 'q_believe', note: 'what you believe in', frag: 'Do you believe in anything?', label: 'Gabriel r215 (q_believe)' },
    { qid: 'q_plan', note: 'your plan here', frag: "what's your plan here?", label: 'Rufina r207 (q_plan, note-echo)' },
    { qid: 'q_change', note: 'how this changed you', frag: 'Has this changed you?', label: 'Amara r215 (q_change)' },
  ];
  for (const c of cases) {
    const res = resumeWithSeed({ wantId: 'curious', note: c.note, qid: c.qid });
    console.log(`\n--- ${c.label} ---`);
    console.log(`THEM: ${res.line}`);
    ok(`${c.label}: seed resumed as curious`, res.w.fromSeed === true && res.w.id === 'curious',
      `fromSeed=${res.w.fromSeed} id=${res.w.id}`);
    ok(`${c.label}: no "About {note} —" stutter prefix`, !/^"About /i.test(res.line.trim()),
      res.line.slice(0, 120));
    ok(`${c.label}: the question is still asked (bare)`, res.line.includes(c.frag),
      res.line.slice(0, 120));
  }

  // SCOPE CASE (main67 control): a curious seed WITHOUT a qid picks a
  // FRESH question — the note is the only link to what was left hanging,
  // so the "About {note} —" prefix must stay.
  const noqid = resumeWithSeed({ wantId: 'curious', note: 'the storehouse', qid: null });
  console.log(`\n--- scope control (curious, no qid) ---`);
  console.log(`THEM: ${noqid.line}`);
  ok('scope control: seed resumed as curious', noqid.w.fromSeed === true && noqid.w.id === 'curious',
    `fromSeed=${noqid.w.fromSeed} id=${noqid.w.id}`);
  ok('scope control: "About {note} —" prefix kept (fresh question, note is the only link)',
    /^"About the storehouse — /i.test(noqid.line.trim()), noqid.line.slice(0, 140));

  // CONTROL: share_news seed — opener never names the note, so the
  // "About {note} —" prefix must still appear.
  const ctrl = resumeWithSeed({ wantId: 'share_news', note: 'that news I was bursting to share' });
  console.log(`\n--- control (share_news) ---`);
  console.log(`THEM: ${ctrl.line}`);
  ok('control: seed resumed as share_news', ctrl.w.fromSeed === true && ctrl.w.id === 'share_news',
    `fromSeed=${ctrl.w.fromSeed} id=${ctrl.w.id}`);
  ok('control: "About {note} —" prefix still present', /^"About that news I was bursting to share — /i.test(ctrl.line.trim()),
    ctrl.line.slice(0, 140));

  console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
