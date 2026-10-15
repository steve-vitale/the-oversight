#!/usr/bin/env node
// PROOF: unfinished-business seed notes speak in the villager's voice
// (journey endgame leg, 2026-10-11).
//
// The seed note is composed INTO the villager's spoken opener:
//   "About <seedNote> — <opener>"
// Notes written in third person ("whatever's been weighing on them")
// read as a template seam: the villager would never say that about
// their own grief. This test drives the REAL loop: open a conversation,
// leave it hanging, read the seed the game's own resolve() planted,
// then open the next-day conversation and read the composed opener.
// SENSE-READ: prints every composed opener (MEASUREMENT.md #4).
//
// Usage: node scripts/test-convo-seed-voice-20261011.js
//   env: SEED=20261012 (single-seed override)

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEED ? [parseInt(process.env.SEED, 10)] : [20261012, 777123, 424242, 90210]);

let _s = 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
function reseed(seed) { _s = seed >>> 0; }

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
Game.debugRegion = 'na_eastern_woodlands'; // explicit woodland scene fixture
if (typeof Game.emit !== 'function') Game.emit = function (m) { return m; };

// The four wants whose seed notes referenced the speaker in 3rd person.
const TARGETS = ['seek_comfort', 'share_news', 'ask_favor', 'seek_taken'];

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS: ${name}`); }
  else { fail++; console.log(`FAIL: ${name}` + (extra ? ` — ${extra}` : '')); }
}
function vname(vid) { try { return Game.villagerName(vid) || vid; } catch (e) { return vid; } }

async function oneSeed(seed) {
  reseed(seed);
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.day = 20;
  const npcs = (Game.state.village.roster || []).filter(id => id !== Game.villagerId)
    .filter(id => { try { return Game.npcComm(id).level !== 'none'; } catch (e) { return true; } });
  // Skip the first-meeting curiosity override (convo gaps 2026-10-11):
  // first meetings always open with curiosity, which never plants a
  // speaker-referencing seed. Established relationships pick real wants.
  for (const vid of npcs) { try { Game.convoGet(vid).count = 5; } catch (e) {} }
  console.log(`\n=== SEED ${seed} ===`);

  const found = {}; // wantId -> {vid, note, day}
  const collectedVids = new Set(); // don't revisit: a 2nd 'left' consumes the seed
  // Two collection phases: natural state first (share_news/seek_taken
  // surface on their own), then fear pinned — seek_comfort needs fear>60
  // and quiet day-20 conversations never produce it.
  const PHASES = [10, 85];
  outer:
  for (const fearLevel of PHASES) {
    for (const vid of npcs) { try { Game.npcNeeds(vid).fear = fearLevel; } catch (e) {} }
    for (let day = 20; day <= 30; day++) {
      for (const vid of npcs) {
        if (Object.keys(found).length >= 4) break outer;
        if (collectedVids.has(vid)) continue;
        Game.state.scholar.day = day;
        try {
          const r = Game.startConvo(vid);
          let rr = r;
          for (let t = 0; t < 2 && rr && !rr.ended; t++) {
            const ch = (rr.choices || []).find(x => x && x.id === 'dlg:react') ||
                       (rr.choices || []).find(x => x && x.id && x.id !== 'leave');
            if (!ch || ch.id === 'leave') break;
            rr = Game.convoTurn(vid, ch.id);
          }
          Game.endConvo(vid, 'left');
        } catch (e) { /* convo unavailable — skip */ }
        const s = (Game.state.village.convoSeeds || {})[vid];
        if (s && TARGETS.indexOf(s.wantId) !== -1 && !found[s.wantId]) {
          found[s.wantId] = { vid, note: s.note, day };
          collectedVids.add(vid);
        }
      }
    }
  }
  console.log(`planted seeds found: ${Object.keys(found).join(', ') || 'none'}`);

  // Next day: reopen each — read the composed seed opener (SENSE-READ).
  for (const wantId of Object.keys(found)) {
    const { vid, note, day } = found[wantId];
    Game.state.scholar.day = day + 1;
    const r = Game.startConvo(vid);
    const line = String((r && r.line) || '');
    const w = Game.convoGet(vid).want || {};
    console.log(`THEM [${wantId} ← ${vname(vid)}]: ${line}`);
    // The planted note is the real source text: no 3rd-person about the speaker.
    const noteOk = !/\b(they|them|their)\b/i.test(note || '');
    ok(`${wantId}: planted note first-person`, noteOk, `note="${note}"`);
    let openerOk = false;
    if (w.fromSeed) {
      // Only the "About X —" prefix is asserted; the opener body may
      // legitimately say they/them about someone else.
      const m = /^"About (.+?) —/.exec(line) || /^About (.+?) —/.exec(line);
      if (m) {
        openerOk = !/\b(they|them|their)\b/i.test(m[1]);
        ok(`${wantId}: opener prefix first-person`, openerOk, `prefix="${m[1]}"`);
        // QUOTE HYGIENE: no dangling quote — a "speech." opener keeps its
        // narration outside the spoken line (seek_comfort shape). Dangling
        // = a quote-close mid-line (." + narration) AND a stray final quote.
        const quotes = (line.match(/"/g) || []).length;
        const dangling = /[.?!]"[^"]*"[^.?!]*$/.test(line) && /"$/.test(line);
        ok(`${wantId}: opener quote hygiene`, quotes % 2 === 0 && !dangling,
          `quotes=${quotes} line=${line.slice(0, 90)}...`);
      } else {
        // The want's opener names its own ask (ask_favor follow-up) —
        // no double prefix by design; the note itself was verified above.
        console.log(`(want ${wantId}: opener names its own ask, no About-prefix)`);
        openerOk = true;
      }
    } else {
      // Pre-empted by another hook (talk request etc.) — recorded, not
      // counted: the planted note itself was verified above.
      console.log(`(want ${wantId}: seed not resumed — opener: ${line.slice(0, 70)}...)`);
    }
    if (noteOk) { PROVEN[wantId] = PROVEN[wantId] || {}; PROVEN[wantId].note = true; }
    if (openerOk) { PROVEN[wantId] = PROVEN[wantId] || {}; PROVEN[wantId].opener = true; }
    Game.endConvo(vid, 'done');
  }
}

const PROVEN = {}; // wantId -> {note, opener} across all seeds

// DISMISSAL-CLOSER PROOF (journey endgame 2026-10-11): a 'quick'-pace
// villager's " — anyway." / " — comedy." closers must never land after a
// direct question ("Will you help me? — anyway." answers yourself).
// Statements keep the closer (the mannerism still exists).
function voiceCheck(seed) {
  reseed(seed * 7 + 1);
  const npcs = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const quick = npcs.find(id => {
    try { return Game.convoSpeechDNA(id).pace === 'quick'; } catch (e) { return false; }
  });
  if (!quick) { console.log(`(seed ${seed}: no quick-paced villager — voice check skipped)`); return; }
  const qSeen = new Set(), sSeen = new Set();
  for (let i = 0; i < 60; i++) {
    const q = Game.voiceLine(quick, '"Will you help me clean it?"');
    const s = Game.voiceLine(quick, '"I can\'t clean it properly one-handed."');
    if (q) qSeen.add(q);
    if (s) sSeen.add(s);
  }
  const badQ = [...qSeen].filter(l => /\? — (anyway|comedy)\."$/.test(l));
  ok(`seed ${seed}: no dismissal closer after a question`, badQ.length === 0,
    badQ.slice(0, 2).join(' | ').slice(0, 120));
  const stillThere = [...sSeen].some(l => / — anyway\."$/.test(l));
  ok(`seed ${seed}: statements still get the anyway closer`, stillThere,
    [...sSeen].join(' | ').slice(0, 120));
  // SENSE-READ: print what the quick villager actually sounds like.
  console.log(`quick-paced voice samples (${vname(quick)}):`);
  for (const l of [...qSeen].slice(0, 3)) console.log(`  Q: ${l}`);
  for (const l of [...sSeen].slice(0, 3)) console.log(`  S: ${l}`);
}

async function main() {
  for (const s of SEEDS) { await oneSeed(s); voiceCheck(s); }
  for (const wantId of TARGETS) {
    const p = PROVEN[wantId] || {};
    ok(`${wantId}: proven first-person note (any seed)`, !!p.note);
    ok(`${wantId}: proven clean seed opener (any seed)`, !!p.opener);
  }
  console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
