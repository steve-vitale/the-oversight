#!/usr/bin/env node
// test-journey-establishment-r135-fieldgate.js — proof test for the r135
// field-ask gate (journey-establishment r135 2026-11-13).
//
// r134's people check: the field ask ("Teach me something from the wild.")
// ends in the closer "There's more, but that's for another fire." 12x on
// the r134-after panel (8 seeds; 3x to one beekeeper). Panel recount from
// the r134-after transcripts: 19 field asks -> 12 closers (all that one
// line — the first closer tried wins every fresh sitting) and 7 lessons
// (2 plant, 5 place). The expedition ask is healthy: 8 asks -> 0 closers.
//
// Mechanism (read from code, src/js/villager-agency.js): agencyChoices
// offers the field ask whenever npcFieldLessons is non-empty — it counts
// stale entries (teachable-plant entries whose plants the player already
// knows; fought species already observed/slain in the codex). The teach
// block (monster > plant > place > generic monsters>=2 fallback) then
// finds nothing to teach and the closer pool fires, first tried "There's
// more". Side effect: agencyTeachPlant burns a teachable entry
// (t.shift()) even when no untaught plant exists, so a dry ask also
// spends a lesson that never lands.
//
// The fix (src/js/villager-agency.js, gate + spend-on-delivery):
//   - new agencyFieldTeachable(vid), mirroring the teach block's own
//     conditions (teachable monsters > 0, OR teachable plants > 0 AND an
//     untaught plant exists in the data pool, OR places > 0, OR monsters
//     >= 2). agencyChoices offers the field ask only when it holds.
//     The expedition ask is untouched; the closer pool is untouched
//     (residual safety net); npcFieldLessons is untouched (the lesson
//     inventory — C13/C14 behavior preserved).
//   - agencyTeachPlant spends the teachable entry only when a lesson is
//     actually taught (t.shift() moved after the untaught-plant check),
//     so a dry teach never burns an entry.
//
// This test proves the fix:
//   source : the gate exists and mirrors the teach block; agencyChoices
//            calls it before offering ask_field; agencyTeachPlant spends
//            only on delivery; the expedition path is untouched; the
//            closer pool is untouched; npcFieldLessons is untouched; the
//            driver is the r134 driver with a tag rename only.
//   live   : on a harness-loaded Game, per seed (2601, 2602, 2603 — each
//            in its own process, one harness per process): a villager
//            with a teachable monster is offered the ask and teaches;
//            a villager with a place is offered the ask and teaches;
//            a villager with a teachable plant is offered the ask and
//            teaches; a dry villager (stale plants only, all plants
//            known) is NOT offered the ask and keeps the entry (and a
//            direct agencyTeachPlant call returns false without burning
//            it); a villager with monsters>=2 all learned is offered
//            the ask and answers with the generic line, not a closer;
//            a villager with expedition news is offered the expedition
//            ask, not the field ask.
//   analyzer: synthetic corpora through the REAL r135 analyzer prove
//            the Q2a/Q2b/Q2c verdict lines (GO when AFTER has 0 closers
//            and lessons conserved; NO-GO when AFTER still closes).
//   det-gate: the r135 driver run twice on 5d seed 2601 (HUNTSTAFF=2)
//            reproduces byte-identical outputs.
//
// Usage: node scripts/test-journey-establishment-r135-fieldgate.js
//        (live-seed mode, spawned by the main mode:
//         node scripts/test-journey-establishment-r135-fieldgate.js --live-seed 2601)
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ANALYZER = path.join(__dirname, 'analyze-journey-establishment-r135-20261113.py');
const DRIVER = path.join(__dirname, 'journey-establishment-r135-20261113.js');
const AGENCY_SRC = fs.readFileSync(path.join(ROOT, 'src', 'js', 'villager-agency.js'), 'utf8');
const DRIVER_SRC = fs.readFileSync(DRIVER, 'utf8');

const CLOSER_MORE = '"There\'s more, but that\'s for another fire."';
const CLOSER_LINES = [
  '"There\'s more, but that\'s for another fire."',
  '"That\'s everything I brought back. The rest is just walking."',
  '"I\'ve told you everything I know about that."',
];

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function finish() {
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
}

// ================= live-seed mode (one harness per process) =================
if (process.argv.includes('--live-seed')) {
  const seed = parseInt(process.argv[process.argv.indexOf('--live-seed') + 1], 10);
  (async () => {
    const { loadGame, setupGame } = require('./sim-harness');
    let Game;
    try {
      ({ Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: false }));
      await setupGame(Game);
    } catch (e) {
      check(`live-seed-${seed}-loads`, false, 'loadGame/setupGame: ' + (e && e.message));
      finish();
      return;
    }
    check(`live-seed-${seed}-loads`, !!Game && typeof Game.agencyChoices === 'function' && typeof Game.agencyFieldTeachable === 'function');
    const living = (Game.state.village.roster || []).filter(id => String(id) !== String(Game.villagerId) && !((Game.getPerson(id) || {}).dead));
    if (living.length < 6) { check(`live-seed-${seed}-has-villagers`, false, `only ${living.length} living villagers`); finish(); return; }
    const st = Game.agencyState();
    const breadth = () => Game.codexBreadth();
    const hasAskField = (vid) => (Game.agencyChoices(vid) || []).some(c => c.id === 'agency:ask_field');
    const hasAskExpedition = (vid) => (Game.agencyChoices(vid) || []).some(c => c.id === 'agency:ask_expedition');
    const isCloser = (line) => typeof line === 'string' && CLOSER_LINES.some(c => line.indexOf(c) !== -1);
    // Scenarios run in this order so codex mutations do not cross-contaminate:
    // monster -> places -> plant -> dry/stale -> monsters>=2 -> expedition.
    // --- 1. TEACHABLE MONSTER: fought species, not yet learned ---
    try {
      const vid = living[0];
      const a = Game.agencyOf(vid);
      a.know[vid].fought = ['hushwolf'];
      a.know[vid].places = [];
      a.know[vid].monsters = 1;
      check(`live-seed-${seed}-monster-teachable`, Game.agencyFieldTeachable(vid) === true, `teachable=${Game.agencyFieldTeachable(vid)}`);
      check(`live-seed-${seed}-monster-ask-offered`, hasAskField(vid), JSON.stringify((Game.agencyChoices(vid) || []).map(c => c.id)));
      const b0 = breadth();
      const turn = Game.agencyTurn(vid, 'agency:ask_field');
      check(`live-seed-${seed}-monster-lesson-taught`, !!turn && typeof turn.line === 'string' && !isCloser(turn.line) && breadth() === b0 + 1,
        `line=${turn && turn.line} breadth ${b0} -> ${breadth()}`);
      console.log(`MONSTER LESSON seed ${seed}: ${turn && turn.line}`);
    } catch (e) {
      check(`live-seed-${seed}-monster`, false, 'monster checks threw: ' + (e && e.message));
    }
    // --- 2. PLACES: a known place to show ---
    try {
      const vid = living[1];
      const a = Game.agencyOf(vid);
      a.know[vid].fought = [];
      a.know[vid].places = ['a ridge with a view for miles'];
      a.know[vid].monsters = 0;
      check(`live-seed-${seed}-places-teachable`, Game.agencyFieldTeachable(vid) === true);
      check(`live-seed-${seed}-places-ask-offered`, hasAskField(vid));
      const turn = Game.agencyTurn(vid, 'agency:ask_field');
      check(`live-seed-${seed}-places-lesson-taught`, !!turn && typeof turn.line === 'string' && !isCloser(turn.line) && turn.line.indexOf('ridge') !== -1,
        `line=${turn && turn.line}`);
      console.log(`PLACE LESSON seed ${seed}: ${turn && turn.line}`);
    } catch (e) {
      check(`live-seed-${seed}-places`, false, 'places checks threw: ' + (e && e.message));
    }
    // --- 3. TEACHABLE PLANT: an entry and an untaught plant ---
    try {
      const vid = living[2];
      const a = Game.agencyOf(vid);
      a.know[vid].fought = [];
      a.know[vid].places = [];
      a.know[vid].monsters = 0;
      st.teachable[vid] = [{ topic: 'plants', day: 1 }];
      check(`live-seed-${seed}-plant-teachable`, Game.agencyFieldTeachable(vid) === true);
      check(`live-seed-${seed}-plant-ask-offered`, hasAskField(vid));
      const b0 = breadth();
      const turn = Game.agencyTurn(vid, 'agency:ask_field');
      check(`live-seed-${seed}-plant-lesson-taught`, !!turn && typeof turn.line === 'string' && !isCloser(turn.line) && breadth() === b0 + 1,
        `line=${turn && turn.line} breadth ${b0} -> ${breadth()}`);
      check(`live-seed-${seed}-plant-entry-spent`, (st.teachable[vid] || []).length === 0, `entries left=${(st.teachable[vid] || []).length}`);
      console.log(`PLANT LESSON seed ${seed}: ${turn && turn.line}`);
    } catch (e) {
      check(`live-seed-${seed}-plant`, false, 'plant checks threw: ' + (e && e.message));
    }
    // --- 4. DRY / STALE PLANTS: entry exists but every plant is known ---
    try {
      const vid = living[3];
      const a = Game.agencyOf(vid);
      a.know[vid].fought = [];
      a.know[vid].places = [];
      a.know[vid].monsters = 0;
      const cx = Game.state.codex || {};
      cx.plants = cx.plants || {};
      for (const p of (Game.data.plants || [])) if (p && p.id) cx.plants[p.id] = { level: 1 };
      st.teachable[vid] = [{ topic: 'plants', day: 1 }];
      check(`live-seed-${seed}-dry-not-teachable`, Game.agencyFieldTeachable(vid) === false, `teachable=${Game.agencyFieldTeachable(vid)}`);
      check(`live-seed-${seed}-dry-ask-not-offered`, !hasAskField(vid), JSON.stringify((Game.agencyChoices(vid) || []).map(c => c.id)));
      check(`live-seed-${seed}-dry-entry-kept`, (st.teachable[vid] || []).length === 1, `entries=${(st.teachable[vid] || []).length}`);
      const taught = Game.agencyTeachPlant(vid);
      check(`live-seed-${seed}-dry-teachplant-false-no-burn`, taught === false && (st.teachable[vid] || []).length === 1,
        `taught=${taught} entries=${(st.teachable[vid] || []).length}`);
    } catch (e) {
      check(`live-seed-${seed}-dry`, false, 'dry checks threw: ' + (e && e.message));
    }
    // --- 5. MONSTERS>=2 ALL LEARNED: generic fallback, not a closer ---
    // The generic line is reached THROUGH a stale plant entry: the ask is
    // only offered when npcFieldLessons is non-empty, so the villager needs
    // a plant entry (stale here — scenario 4 marked every plant known) for
    // the menu to show the ask at all; the teach block then finds no
    // teachable monster/plant/place and falls back to the generic line.
    // The stale entry must survive the turn (spend-on-delivery).
    try {
      const vid = living[4];
      const a = Game.agencyOf(vid);
      a.know[vid].fought = ['hushwolf', 'highbeam_deer'];
      a.know[vid].places = [];
      a.know[vid].monsters = 2;
      st.teachable[vid] = [{ topic: 'plants', day: 1 }];
      Game.state.codex.monsters = Game.state.codex.monsters || {};
      Game.state.codex.monsters['hushwolf'] = { stage: 'observed' };
      Game.state.codex.monsters['highbeam_deer'] = { stage: 'observed' };
      check(`live-seed-${seed}-generic-teachable`, Game.agencyFieldTeachable(vid) === true, 'monsters>=2 keeps the ask (generic fallback)');
      check(`live-seed-${seed}-generic-ask-offered`, hasAskField(vid));
      const b0 = breadth();
      const turn = Game.agencyTurn(vid, 'agency:ask_field');
      check(`live-seed-${seed}-generic-line-not-closer`, !!turn && typeof turn.line === 'string' && !isCloser(turn.line) && turn.line.indexOf('too many joints') !== -1 && breadth() === b0,
        `line=${turn && turn.line} breadth ${b0} -> ${breadth()}`);
      check(`live-seed-${seed}-generic-stale-entry-kept`, (st.teachable[vid] || []).length === 1,
        `entries=${(st.teachable[vid] || []).length}`);
      console.log(`GENERIC LINE seed ${seed}: ${turn && turn.line}`);
    } catch (e) {
      check(`live-seed-${seed}-generic`, false, 'generic checks threw: ' + (e && e.message));
    }
    // --- 6. EXPEDITION NEWS: expedition ask offered, field ask gated ---
    try {
      const vid = living[5];
      const a = Game.agencyOf(vid);
      a.know[vid].fought = [];
      a.know[vid].places = [];
      a.know[vid].monsters = 0;
      st.teachable[vid] = [];
      const v = Game.state.village;
      v.explorerNews = v.explorerNews || {};
      v.explorerNews[vid] = { day: 1, agency: true, dist: 3 };
      check(`live-seed-${seed}-expedition-ask-offered`, hasAskExpedition(vid), JSON.stringify((Game.agencyChoices(vid) || []).map(c => c.id)));
      check(`live-seed-${seed}-expedition-field-not-offered`, !hasAskField(vid), 'news replaces the field ask, as before');
      check(`live-seed-${seed}-expedition-not-teachable`, Game.agencyFieldTeachable(vid) === false, 'nothing teachable behind the news');
    } catch (e) {
      check(`live-seed-${seed}-expedition`, false, 'expedition checks threw: ' + (e && e.message));
    }
    // --- 7. NOTHING AT ALL: a fresh villager with no knowledge ---
    try {
      const vid = living.length > 6 ? living[6] : living[0];
      const a = Game.agencyOf(vid);
      // living[0] already taught a monster above; use a fresh one if available.
      if (vid === living[0]) { check(`live-seed-${seed}-nothing-skipped`, true, 'no 7th villager — dry case already covers the gate'); }
      else {
        a.know[vid].fought = [];
        a.know[vid].places = [];
        a.know[vid].monsters = 0;
        st.teachable[vid] = [];
        check(`live-seed-${seed}-nothing-not-teachable`, Game.agencyFieldTeachable(vid) === false);
        check(`live-seed-${seed}-nothing-ask-not-offered`, !hasAskField(vid));
      }
    } catch (e) {
      check(`live-seed-${seed}-nothing`, false, 'nothing checks threw: ' + (e && e.message));
    }
    finish();
  })();
  return;
}

// ================= main mode: source checks =================
check('A gate-exists-mirrors-teach-block',
  /agencyFieldTeachable\(vid\) \{/.test(AGENCY_SRC) &&
  /agencyTeachableMonsters\(vid\)\.length/.test(AGENCY_SRC) &&
  /k\.places/.test(AGENCY_SRC) &&
  /k\.monsters[\s\S]{0,20}>= 2/.test(AGENCY_SRC),
  'agencyFieldTeachable must check teachable monsters, places, and the monsters>=2 fallback');
check('B gate-checks-untaught-plant',
  /agencyFieldTeachable[\s\S]{0,2000}!\(\(cx\[p\.id\]/.test(AGENCY_SRC),
  'the plant branch must require an untaught plant in the data pool, not just a teachable entry');
check('C choices-calls-gate-before-field-ask',
  /agencyChoices\(vid\)[\s\S]{0,800}agencyFieldTeachable\(vid\)/.test(AGENCY_SRC) &&
  /if \(!this\.agencyFieldTeachable\(vid\)\) return \[\];/.test(AGENCY_SRC),
  'agencyChoices must gate the field ask on agencyFieldTeachable');
check('D teachplant-spends-only-on-delivery',
  (() => {
    const m = AGENCY_SRC.match(/agencyTeachPlant\(vid\) \{([\s\S]{0,1500})/);
    if (!m) return false;
    const body = m[1];
    const shiftAt = body.indexOf('t.shift()');
    const candsAt = body.indexOf('if (!cands.length) return false;');
    return shiftAt !== -1 && candsAt !== -1 && shiftAt > candsAt;
  })(),
  't.shift() must come AFTER the no-untaught-plant return, so a dry teach burns nothing');
check('E expedition-path-untouched',
  /if \(v\.explorerNews && v\.explorerNews\[vid\] && v\.explorerNews\[vid\]\.agency\) \{\s*return \[\{ id: 'agency:ask_expedition'/.test(AGENCY_SRC),
  'the expedition ask must still be offered first when news exists');
check('F closer-pool-untouched',
  // Source-escaped forms: the file holds the closers inside single-quoted
  // JS strings, so the apostrophes are backslash-escaped there.
  ['There\\\'s more, but that\\\'s for another fire.',
   'That\\\'s everything I brought back. The rest is just walking.',
   'I\\\'ve told you everything I know about that.'].every(l => AGENCY_SRC.indexOf(l) !== -1),
  'all three honest closers must still be in villager-agency.js');
check('G npcfieldlessons-untouched',
  /npcFieldLessons\(vid\) \{[\s\S]{0,600}topic: 'plants'/.test(AGENCY_SRC) &&
  /npcFieldLessons\(vid\) \{[\s\S]{0,600}topic: 'monsters'/.test(AGENCY_SRC) &&
  /npcFieldLessons\(vid\) \{[\s\S]{0,600}topic: 'places'/.test(AGENCY_SRC),
  'npcFieldLessons (the lesson inventory) must be unchanged — the gate is separate');
check('H driver-is-r134-clone-tag-rename',
  /TAG=r135-after/.test(DRIVER_SRC) &&
  /const TAG = process\.env\.TAG \|\| 'r135'/.test(DRIVER_SRC) &&
  /SEEDS=2601,2602/.test(DRIVER_SRC) &&
  /withHuntStaff\(withDelegate\(competent, 'competent-delegate'\), 'competent-hunt'\)/.test(DRIVER_SRC));

// ================= analyzer synthetic corpora (r134 pattern) =================
const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder'];
const SEEDS16 = [2601, 2602, 2603, 2604, 2605, 2606, 2607, 2608, 2609, 2610, 2611, 2612, 2613, 2614, 2615, 2616];
function villager(id, name, occ, comp, prac, spec, food, skills, alive) {
  const c = {}, p = {}, s = {}, f = {};
  for (const t of TASKS) { c[t] = comp[t] != null ? comp[t] : 1.0; p[t] = (prac && prac[t]) || 0; }
  for (const t of SPECS) { s[t] = (spec && spec[t] != null) ? spec[t] : 0; f[t] = (food && food[t]) || 0; }
  return { id, name, alive: alive !== false, occ, competence: c, practice: p, specialist: s, foodXp: f, npcSkills: (skills || []).slice() };
}
function snap(day, villagers) { return villagers ? { day, snap: villagers } : null; }
function dailyRows() {
  const rows = [];
  for (let d = 2; d <= 43; d++) rows.push({ day: d, alive: 8, roster: 12, pantryKcal: 20000, over: false, wave: 1, ledger2: 0 });
  return rows;
}
function baseSeed(seed, practice) {
  return { seed, run: 'r135-after', days: 42, endDay: 43, gameOver: false, startCensus: [],
    holdingsStart: [], holdingsEnd: [], practice: practice || { d1: null, d14: null, d28: null, dEnd: null },
    playerAbilitiesEnd: [], aliveAt40: 8, aliveEnd: 8, waveReached: 1, pantryKcalEnd: 20000,
    deaths: [{ day: 20, who: 'X', cause: 'monster', kind: 'monster', player: false }],
    census: [], daily: dailyRows(), matTrace: [], craftLog: [], npcCraftLog: [],
    huntLog: [], careLog: [], healerLog: [], treatLog: [], cookLog: [], mendLog: [],
    huntStaff: { layerOn: true, prepOn: true, assignments: 0, assignLog: [], refusalLog: [], woundLog: [], prepLog: [] },
    huntEligEnd: [], huntEligEver: [], leanTrace: [],
    guardrails: { deaths: 1, popAlive: 8, pantryKcal: 20000 }, c3: { starvationDeaths: 0 },
    playerPackArmor: [], playerEquipped: [], playerRecipes: {},
    contestTele: [], contestCounts: {}, waveSysLines: [], teleTypes: {}, skillRows: [],
    skillCounts: {}, teachDays: [], teleAll: [], playerCodexSkills: {}, avCraftEnd: {} };
}
function convoTxt(turns, tag) {
  // 4 held convos per seed; each turn is a field ask + the THEM reply.
  let out = `=== ${tag} PEOPLE CHECK (4 held convos, end of run) ===\n`;
  const names = [['Ana', 'v1', 'forager'], ['Ben', 'v2', 'cook'], ['Cid', 'v3', 'smith'], ['Dee', 'v4', 'hunter']];
  for (const [nm, id, occ] of names) {
    out += `\n-- ${nm} (${id}) occ=${occ} --\nOPENING: hello\n`;
    for (const reply of turns) {
      out += `YOU: [agency:ask_field] "Teach me something from the wild."\nTHEM: ${reply}\n`;
    }
    out += `(ended by engine)\nclosing: goodbye\n`;
  }
  return out;
}
const LESSON_LINE = '"a ridge with a view for miles — remember the shape of it. It\'s real, and it\'s yours now."';
function corpus(dir, beforeTurns, afterTurns) {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  for (const seed of SEEDS16) {
    const practice = mk();
    fs.writeFileSync(path.join(dir, `journey-establishment-r135-before-seed${seed}.json`), JSON.stringify(baseSeed(seed, practice)));
    fs.writeFileSync(path.join(dir, `journey-establishment-r135-after-seed${seed}.json`), JSON.stringify(baseSeed(seed, practice)));
    fs.writeFileSync(path.join(dir, `journey-establishment-r135-before-convo-seed${seed}.txt`), convoTxt(beforeTurns, 'r135-before'));
    fs.writeFileSync(path.join(dir, `journey-establishment-r135-after-convo-seed${seed}.txt`), convoTxt(afterTurns, 'r135-after'));
  }
}
function runAnalyzer(dir) {
  return execFileSync('python3', [ANALYZER, dir], { encoding: 'utf8' });
}
function withDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r135-fieldgate-'));
  try { return fn(dir); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
}
// GO corpus: BEFORE asks all close with "There's more"; AFTER asks all teach.
// (4 convos x 1 ask per seed = 64 asks per panel.)
withDir((dir) => {
  corpus(dir, [CLOSER_MORE], [LESSON_LINE]);
  const out = runAnalyzer(dir);
  const q2 = out.slice(out.indexOf('Q2 FIELD-ASK COUNTER'));
  check('J analyzer-go-corpus-q2a', /Q2a CLOSER COUNT: "There's more" BEFORE=64 AFTER=0 \(bar AFTER = 0\) -> GO/.test(out), q2);
  check('K analyzer-go-corpus-q2b', /Q2b NO LESSON HIDDEN: field-ask lessons BEFORE=0 AFTER=64 \(bar AFTER >= BEFORE - 1\) -> GO/.test(out), q2);
  check('L analyzer-go-corpus-q2c', /Q2c ASK->LESSON RATE: AFTER asks=64 closers=0 \(bar 0 closers\) -> GO/.test(out), q2);
  check('M analyzer-go-corpus-q2-verdict', /Q2 verdict: GO/.test(out), q2);
});
// NO-GO corpus: AFTER still closes with "There's more" on every ask.
withDir((dir) => {
  corpus(dir, [CLOSER_MORE], [CLOSER_MORE]);
  const out = runAnalyzer(dir);
  const q2 = out.slice(out.indexOf('Q2 FIELD-ASK COUNTER'));
  check('N analyzer-nogo-corpus-q2a', /Q2a CLOSER COUNT: "There's more" BEFORE=64 AFTER=64 \(bar AFTER = 0\) -> NO-GO/.test(out), q2);
  check('O analyzer-nogo-corpus-q2-verdict', /Q2 verdict: NO-GO/.test(out), q2);
});

// ================= live seeds (subprocesses, one harness each) =================
for (const seed of [2601, 2602, 2603]) {
  try {
    const out = execFileSync(process.execPath, [__filename, '--live-seed', String(seed)],
      { encoding: 'utf8', timeout: 600000, cwd: ROOT });
    const m = out.match(/(\d+) passed, (\d+) failed/);
    const ok = m && parseInt(m[2], 10) === 0;
    check(`P live-seed-${seed}-green`, ok, out);
    // Sense-read (§4): the lesson lines the test printed.
    for (const line of out.split('\n')) {
      if (/^(MONSTER|PLACE|PLANT|GENERIC) LESSON/.test(line)) console.log('  ' + line);
    }
  } catch (e) {
    check(`P live-seed-${seed}-green`, false, 'live-seed subprocess failed: ' + (e && e.message) + '\n' + (e && e.stdout || ''));
  }
}

// ================= det-gate: r135 driver twice, 5d seed 2601 =================
(function detGate() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r135-detgate-'));
  try {
    const run = (tag) => {
      const env = Object.assign({}, process.env, { SEEDS: '2601', DAYS: '5', TAG: tag, EVID: dir, HUNTSTAFF: '2' });
      execFileSync(process.execPath, [DRIVER], { encoding: 'utf8', env, timeout: 600000, cwd: ROOT });
      return JSON.parse(fs.readFileSync(path.join(dir, `journey-establishment-${tag}-seed2601.json`), 'utf8'));
    };
    let a, b;
    try { a = run('r135-detgate-a'); } catch (e) { check('Q det-gate-first-run', false, 'first driver run exit/timeout: ' + (e && e.message)); return; }
    try { b = run('r135-detgate-b'); } catch (e) { check('Q det-gate-second-run', false, 'second driver run exit/timeout: ' + (e && e.message)); return; }
    check('Q det-gate-both-runs', !!a && !!b);
    const strip = (o) => { const c = Object.assign({}, o); delete c.run; return c; };
    check('R det-gate-outputs-identical', JSON.stringify(strip(a)) === JSON.stringify(strip(b)),
      'two runs of the same driver/seed produce byte-identical JSON (minus the run tag)');
    const keys = ['endDay', 'aliveEnd', 'aliveAt40', 'waveReached', 'pantryKcalEnd'];
    const diffs = [];
    for (const k of keys) if (a[k] !== b[k]) diffs.push(`${k}: run-a=${a[k]} run-b=${b[k]}`);
    if (JSON.stringify(a.practice) !== JSON.stringify(b.practice)) diffs.push('practice snapshots differ');
    if (JSON.stringify(a.cookLog) !== JSON.stringify(b.cookLog)) diffs.push('cookLog differs');
    if (JSON.stringify(a.mendLog) !== JSON.stringify(b.mendLog)) diffs.push('mendLog differs');
    if (JSON.stringify(a.deaths) !== JSON.stringify(b.deaths)) diffs.push('deaths differ');
    if (JSON.stringify(a.guardrails) !== JSON.stringify(b.guardrails)) diffs.push('guardrails differ');
    check('S det-gate-funnel-practice-logs-identical', diffs.length === 0, diffs.join('; ') || 'funnel/practice/cookLog/mendLog/deaths/guardrails identical');
    check('T det-gate-snapshots-present', !!b.practice && !!b.practice.d1 && b.practice.d1.snap.length > 0 && !!b.practice.dEnd,
      `practice keys=${Object.keys(b.practice || {})}`);
    const granting = (b.cookLog || []).filter(r => (r.fxPreserverAfter || 0) > (r.fxPreserverBefore || 0));
    const missing = granting.filter(r => r.fxPreserverUnitsAfter == null);
    check('U det-gate-units-fields-present', missing.length === 0,
      `${granting.length} granting rows, ${missing.length} missing units fields`);
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  }
})();

finish();
