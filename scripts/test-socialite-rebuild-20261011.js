#!/usr/bin/env node
// Socialite adversarial playtest, run 2026-10-11 (rotation index 2 -> socialite).
// Target: the REBUILT conversation system (convo-wants.js want spine,
// convo-dialogue.js per-option trust pays, convo-scene.js resolver, seeds).
//
// KILLS (all measured BEFORE, fixed, proofed AFTER):
//  1. WINDDOWN BYPASS (exploit): the rebuild's dlg: handlers early-return
//     before the base turn's budget enforcement — 60 exchanges on budget 3,
//     conversation never winding down. One 10-kcal conversation farmed the
//     whole 40 words-trust allowance ("tell me more" x33: 10->40).
//  2. QUESTION RE-QUEUE LOOP (softlock): first-conversation forceQ re-queued a
//     fresh bespoke question every turn; any non-continuer choice discarded it
//     unrevealed with no dodge recorded (r12 counted silence only) — heldAsk
//     true at every turn end, winddown never firing. Measured infinite.
//  3. GOODBYE SPURN (softlock): even with the winddown queued, never tapping
//     the continuer dodged the goodbye forever on every path.
//  4. SEED NUKE (honesty): convoResolveWant planted the follow-up seed THEN
//     deleted convoSeeds[vid] for fromSeed wants — promised favors never got
//     their 'repay' follow-up; unfinished business evaporated.
//  5. FABRICATED HISTORY (honesty): the repay opener said "what you did for
//     me" when the player had only promised — Steve's conversation quality
//     bar: no fabricated shared history.
//
// Fixes: convoMaybeWinddown (shared budget enforcement incl. spurn rule),
// convoDropUnspoken counts any-choice dodges, new-question branch gated while
// a dodge is in progress, consume-before-plant in convoResolveWant, repay
// fiction corrected to the promise.
//
// Run: node scripts/test-socialite-rebuild-20261011.js   (SEED env override)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '20261011', 10);
Math.random = mulberry32(SEED); // seed BEFORE eval — modules capture it at load

// ---------- boot the full engine ----------
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -60", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

const PAY = { 'dlg:commit': 3, 'dlg:help': 2, 'dlg:comfort': 2, 'dlg:empathize': 2, 'dlg:more': 1, 'dlg:askwhy': 1, 'dlg:details': 1, 'dlg:stay': 1, 'dlg:heed': 1, 'dlg:react': 0.5 };

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.say = () => {};
  const trustOf = (vid) => ((Game.state.village.trust || {})[vid] === undefined ? 10 : Game.state.village.trust[vid]);
  const setTrust = (vid, v) => { (Game.state.village.trust || (Game.state.village.trust = {}))[vid] = v; };
  const roster = () => (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  Game.state.scholar.kcal = 50000;

  const transcripts = [];
  function dumpTranscript(vid, tag) {
    const c = Game.convoGet(vid);
    const t = (c.transcript || []).map(e => (e.who === 'you' ? 'YOU: ' : 'NPC: ') + e.text);
    transcripts.push('## ' + tag + ' (want=' + ((c.want && c.want.id) || '?') + ')\n' + t.join('\n\n'));
  }

  // ================= KILL 1+3: winddown binds the dlg: path =================
  console.log('\n[exploit] winddown binds hostile dlg: spam (budget enforcement)');
  {
    const vid = roster()[0];
    setTrust(vid, 10);
    Game.state.village.convoSeeds = {};
    Game.startConvo(vid);
    const budget = Game.convoGet(vid).budget;
    let turns = 0, trustStart = trustOf(vid);
    // hostile: always the highest-paying OFFERED choice, never goon, never leave
    while (turns < 60) {
      const ch = (Game.convoChoices(vid) || []).filter(x => x.id !== 'leave' && x.id !== 'goon');
      if (!ch.length) break;
      let best = ch[0], bp = -1;
      for (const x of ch) { const p = PAY[x.id] === undefined ? 0.05 : PAY[x.id]; if (p > bp) { bp = p; best = x; } }
      const r = Game.convoTurn(vid, best.id);
      turns++;
      if (!r || r.ended || !Game.convoGet(vid).active) break;
    }
    const c = Game.convoGet(vid);
    const gained = trustOf(vid) - trustStart;
    console.log('    budget=' + budget + ' turns=' + turns + ' trust 10->' + trustOf(vid).toFixed(1) + ' active=' + c.active);
    ok(!c.active || turns < 60, 'hostile dlg: spam cannot hold a conversation open (winddown binds)', 'turns=' + turns + ' active=' + c.active);
    ok(turns <= budget + 4, 'conversation ends within budget+4 turns', 'budget=' + budget + ' turns=' + turns);
    ok(gained < 30, 'one conversation cannot farm the whole words allowance', 'gained=' + gained.toFixed(1));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ================= KILL 2: question re-queue loop =================
  console.log('\n[softlock] first-conversation question re-queue loop');
  {
    const vid = roster()[1];
    setTrust(vid, 10);
    Game.state.village.convoSeeds = {};
    Game.startConvo(vid);
    const budget = Game.convoGet(vid).budget;
    let turns = 0;
    // hostile: recap forever, never the continuer — the old infinite loop
    while (turns < 40) {
      const ch = Game.convoChoices(vid) || [];
      const pick = ch.find(x => x.id === 'recap') || ch.find(x => x.id !== 'leave' && x.id !== 'goon');
      if (!pick) break;
      const r = Game.convoTurn(vid, pick.id);
      turns++;
      if (!r || r.ended || !Game.convoGet(vid).active) break;
    }
    const c = Game.convoGet(vid);
    console.log('    budget=' + budget + ' turns=' + turns + ' active=' + c.active + ' heldAsk=' + c.heldAsk);
    ok(!c.active || turns < 40, 'recap-dodging questions cannot hold a conversation open', 'turns=' + turns + ' active=' + c.active);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ================= KILL 4+5: seed chain + repay honesty =================
  console.log('\n[honesty] commit -> repay seed chain, no fabricated history');
  {
    const vid = roster()[2];
    setTrust(vid, 10);
    Game.state.village.promises = {};
    Game.state.village.convoSeeds = {};
    try { const n = Game.npcNeeds(vid); n.hunger = 90; n.fear = 0; n.energy = 100; } catch (e) {}
    // drive naturally: answer what's offered until dlg:commit is reachable
    let committed = false, guard = 0;
    Game.startConvo(vid);
    while (guard++ < 25 && !committed) {
      const ch = Game.convoChoices(vid) || [];
      const ids = ch.map(x => x.id);
      let pick = null;
      if (ids.includes('dlg:commit')) pick = 'dlg:commit';
      else if (ids.includes('dlg:help')) pick = 'dlg:help';
      else if (ids.includes('dlg:more')) pick = 'dlg:more';
      else pick = (ch.find(x => /^ans:/.test(x.id)) || ch.find(x => x.id === 'goon') || ch.find(x => x.id !== 'leave'));
      if (!pick) break;
      const r = Game.convoTurn(vid, pick.id || pick);
      if (pick === 'dlg:commit' || (pick && pick.id === 'dlg:commit')) committed = true;
      if (!r || r.ended || !Game.convoGet(vid).active) break;
    }
    dumpTranscript(vid, 'commit conversation');
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    const tracked = ((Game.state.village.promises || {})[vid]) || null;
    ok(!tracked, 'dlg:commit creates no tracked promise (formal vow stays the tracked door)', JSON.stringify(tracked));
    const seed = Game.convoCheckSeeds(vid);
    if (committed) {
      ok(!!(seed && seed.wantId === 'repay'), 'promised favor plants a surviving repay seed (no seed-nuke)', JSON.stringify(seed));
      // the follow-up conversation's fiction
      const st2 = Game.startConvo(vid);
      const opener = String((st2 && st2.line) || '');
      dumpTranscript(vid, 'repay follow-up');
      ok(!/what you did for me/i.test(opener), 'repay opener does not claim the deed was done', opener.slice(0, 100));
      try { Game.endConvo(vid, 'left'); } catch (e) {}
      // SEED-NUKE, direct: a fromSeed conversation whose resolution plants a
      // follow-up must keep it (BEFORE: planted then deleted by the
      // fromSeed consumption running after the plant).
      Game.state.village.convoSeeds[vid] = { wantId: 'ask_favor', note: 'the help they asked you for', day: Game.state.scholar.day || 0 };
      Game.startConvo(vid);
      let g2 = 0, committed2 = false;
      while (g2++ < 25 && !committed2) {
        const ch = Game.convoChoices(vid) || [];
        const ids = ch.map(x => x.id);
        let pick = null;
        if (ids.includes('dlg:commit')) pick = 'dlg:commit';
        else if (ids.includes('dlg:help')) pick = 'dlg:help';
        else if (ids.includes('dlg:more')) pick = 'dlg:more';
        else pick = (ch.find(x => /^ans:/.test(x.id)) || ch.find(x => x.id === 'goon') || ch.find(x => x.id !== 'leave'));
        if (!pick) break;
        const r = Game.convoTurn(vid, pick.id || pick);
        if ((pick === 'dlg:commit') || (pick && pick.id === 'dlg:commit')) committed2 = true;
        if (!r || r.ended || !Game.convoGet(vid).active) break;
      }
      try { Game.endConvo(vid, 'left'); } catch (e) {}
      const seed2 = Game.convoCheckSeeds(vid);
      ok(committed2 && !!(seed2 && seed2.wantId === 'repay'), 'fromSeed commit keeps its follow-up seed (consume-before-plant)', 'committed=' + committed2 + ' seed=' + JSON.stringify(seed2));
    } else {
      console.log('    (dlg:commit not reached this seed; seed=' + JSON.stringify(seed) + ')');
    }
  }

  // ================= words cap under greedy play =================
  console.log('\n[exploit] the 40 words cap holds under greedy play');
  {
    const vid = roster()[3];
    setTrust(vid, 10);
    Game.state.village.convoSeeds = {};
    let over40 = false;
    for (let i = 0; i < 14 && trustOf(vid) < 40; i++) {
      Game.startConvo(vid);
      let t = 0;
      while (t++ < 40) {
        const ch = (Game.convoChoices(vid) || []).filter(x => x.id !== 'leave');
        if (!ch.length) break;
        let best = ch[0], bp = -1;
        for (const x of ch) { const p = PAY[x.id] === undefined ? 0.05 : PAY[x.id]; if (p > bp) { bp = p; best = x; } }
        const r = Game.convoTurn(vid, best.id);
        if (!r || r.ended || !Game.convoGet(vid).active) break;
      }
      try { Game.endConvo(vid, 'left'); } catch (e) {}
      if (trustOf(vid) > 40) { over40 = true; break; }
    }
    console.log('    final trust=' + trustOf(vid).toFixed(1));
    ok(!over40, 'words alone never push trust past 40', 'final=' + trustOf(vid).toFixed(1));
  }

  // ================= fuzz: no strand, terminates, no throw =================
  console.log('\n[softlock] fuzz: random-choice conversations');
  {
    let stranded = 0, hung = 0, crashed = 0, repeats = 0, n = 0;
    for (const vid of roster().slice(4, 9)) {
      setTrust(vid, 10);
      for (let k = 0; k < 4; k++) {
        n++;
        const st = Game.startConvo(vid);
        if (!st) continue;
        let choices = st.choices || [], steps = 0, ended = false, isStranded = false;
        while (!ended && steps < 60) {
          steps++;
          if (!choices.length) { isStranded = true; break; }
          const id = choices[Math.floor(Math.random() * choices.length)].id;
          let turn = null;
          try { turn = Game.convoTurn(vid, id); }
          catch (e) { crashed++; console.log('    CRASH ' + vid.slice(0, 8) + ' on ' + id + ': ' + String(e && e.message).slice(0, 60)); break; }
          if (!turn || turn.ended || !Game.convoGet(vid).active) { ended = true; break; }
          choices = turn.choices || [];
        }
        if (isStranded) stranded++;
        else if (!ended && steps >= 60) hung++;
        try { Game.endConvo(vid, 'left'); } catch (e) { crashed++; }
        const c = Game.convoGet(vid);
        const seen = {};
        for (const e of (c.transcript || [])) {
          if (e.who !== 'you' && e.text && e.text.length > 40) {
            if (seen[e.text]) { repeats++; if (process.env.REPVERBOSE) console.log('    REPEAT vid=' + vid.slice(0, 8) + ': ' + e.text.slice(0, 110)); break; }
            seen[e.text] = true;
          }
        }
      }
    }
    ok(stranded === 0, 'no conversation strands with an empty menu', 'stranded=' + stranded + '/' + n);
    ok(hung === 0, 'every conversation terminates within 60 steps', 'hung=' + hung + '/' + n);
    ok(crashed === 0, 'no turn or endConvo throws under fuzz', 'crashed=' + crashed + '/' + n);
    ok(repeats === 0, 'no verbatim NPC-line repeats within one conversation', 'repeats=' + repeats + '/' + n);
  }

  // transcripts for the sense read
  const tdir = process.env.TRANSCRIPT_DIR || '/tmp';
  try {
    fs.writeFileSync(path.join(tdir, 'playtest-socialite-transcripts-20261011-' + SEED + '.md'),
      '# Socialite transcripts, seed ' + SEED + ' (2026-10-11, post-fix)\n\n' + transcripts.join('\n\n---\n\n'));
    console.log('\n[transcripts] wrote ' + transcripts.length + ' to ' + tdir);
  } catch (e) { console.log('\n[transcripts] write failed: ' + e.message); }

  console.log('\n==== ' + pass + ' pass, ' + fail + ' fail ====');
  if (failures.length) { console.log('failures:'); failures.forEach(f => console.log(' - ' + f)); }
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS CRASH: ' + (e && e.stack || e)); process.exit(2); });
