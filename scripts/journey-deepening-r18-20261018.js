// journey-deepening-r18-20261018.js -- DEEPENING leg R18 (lane A).
// Base: master@80b442c38. All work in worktree journey-deepening.
//
// PRE-REGISTER (2026-10-18, MEASUREMENT.md sections 9-12, 14):
//   Leg question: in the deepening window (days 40-80) on the fixed tree —
//     (a) does the r18 article-class fix (Game.articlePhrase) hold in the
//     wild (zero "the The "/"the the "/"The the " across all captured text);
//     (b) does the landing-r22 "curious"-want filler loop (#541) persist in
//     mid-game transcripts, and if so, does substantive curious material
//     (added this run) actually surface; (c) the deepening census: wave 2-3
//     engagement, knowledge economy / specialists, regional links, haul-
//     pipeline health holds (r17 H2-H5).
//   Binding metrics (NO-GO never re-scored; revisions go to "metric review"):
//     A1 article-wild -- 0 double-article matches in captured sayLines across
//       all seeds (proof test 15/15 GREEN pre-run; this is the wild confirm).
//     A2 curious -- >=8 transcripts sense-read; filler flagged with counts.
//       If >=2 transcripts show curious-want filler, the content addition is
//       REQUIRED and must pass its proof test; the run is NO-GO without it.
//     H2-H5 holds -- pipeline health (choices, arrivals, tests, reveals) on
//       >=3/4 seeds (r17: GO 4/4 — carry as hold, not the question).
//     M5 people -- >=10 transcripts read in full, 0 senseless.
//     M6 winnable -- alive at day 100 on >=2/4 seeds (death-aware stop).
//   Interesting-finding bar: a villager-named monster's flesh referenced
//     cleanly in a real fireside beat; a mid-game curious conversation with
//     a real thread; specialists teaching in the window; regional link
//     beats read for sense.
//   Horizon: DAYCAP=100, death-aware stop (+10d tail max). Seeds: fresh
//     9101-9104 (pilot scale, MEASUREMENT.md section 9). Policy: competent.
// Canon read: CANON.md; MONSTER-WAVES.md (wave law); Steve 2026-10-16
// haul-unrevealed design; docs/PRESERVATION.md (specialists); no new canon.
//
// Usage: SEEDS=9101,9102 node scripts/journey-deepening-r18-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [9101, 9102, 9103, 9104]);
const DAYCAP = parseInt(process.env.DAYCAP || '100', 10);
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-18');

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const DOUBLE_RE = /(^|[^A-Za-z])(the The|the the|The the|The The|the a |the an )([^A-Za-z]|$)/;
const DRY_LINES = [
  "That's... pretty much all of it, honestly.",
  "I wish there was more to tell. That's it.",
  "That's the whole of it. Sorry.",
];
const FILLER_MARKS = ['(looks at fire)', '"So."', '"Well."', '"Anyway."'];

let _G = null, _seed = null, _lines = [];

function gday() { try { return (_G.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.vpOf ? _G.vpOf(vid) : (_G.data.villagers || []).find(v => v.id === vid) || {}; } catch (e) { return {}; } }
function popAlive() {
  try { return ((_G.data.villagers || []).filter(v => v && !v.dead && !((_G.state.village.dead || {})[v.id]))).length; } catch (e) { return 0; }
}
function pantryKcal() {
  try {
    let t = 0;
    for (const it of (((_G.state || {}).village || {}).pantry || [])) t += (it.kcalEach || 0) * (it.qty || 1);
    return t;
  } catch (e) { return 0; }
}
function scaleNow() { try { return (_G.state.village || {}).scaleRank || 'village'; } catch (e) { return 'village'; } }
function waveNow() {
  try {
    const ds = _G.deedState ? _G.deedState() : null;
    return (_G.state || {}).waveUnlocked || (_G.unlockedWave ? _G.unlockedWave() : 1);
  } catch (e) { return '?'; }
}
function specialists() {
  const out = [];
  try {
    for (const v of (_G.data.villagers || [])) {
      if (!v || v.dead) continue;
      const s = (v.specialistOf || v.specialist || v.role || '');
      if (s) out.push(`${vname(v.id)}:${s}`);
    }
    // also via codex roles
    const roles = ((_G.state || {}).village || {}).specialistRoles || {};
    for (const [vid, r] of Object.entries(roles)) out.push(`${vname(vid)}:${r}(codex)`);
  } catch (e) {}
  return out;
}

// ---- conversation driver (adapted from r17) ----
const ENGAGE = ['want:ask', 'want:help', 'want:join', 'dlg:more'];
const DEFLECT = ['dlg:deflect', 'dlg:change'];
function pickChoice(choices, turn) {
  const list = choices || [];
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}
const CONVO_DAYS = [45, 60, 80];
const convoLog = []; // {seed, day, vid, want, stage, resolution, curious, dryHits, fillerHits, file}
function runConversation(day, vid) {
  const fp = path.join(EVIDIR, `journey-deepening-r18-transcript-${_seed}-day${day}-${vid}.txt`);
  const L = [];
  const log = (s) => L.push(s);
  const rec = { seed: _seed, day, vid, want: 'none', stage: 0, resolution: 'none', curious: false, dryHits: 0, fillerHits: 0, file: path.basename(fp) };
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = _G.startConvo(vid);
    if (!r0) { log(`THEM: (no line — startConvo null for ${vid})`); fs.writeFileSync(fp, L.join('\n')); convoLog.push(rec); return fp; }
    const c = _G.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== seed ${_seed} day ${day} — conversation with ${nm} (${vid}) ===`);
    log(`occupation=${p.formerOccupation || p.occupation || '?'} trust=${((_G.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0})`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
    rec.want = want.id || 'none'; rec.stage = want.stage || 0;
    rec.curious = rec.want === 'curious';
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = _G.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      const w = (_G.convoGet(vid).want) || {};
      log(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (w.id) { rec.want = w.id; rec.stage = w.stage || 0; rec.curious = rec.curious || w.id === 'curious'; }
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = _G.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = _G.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    rec.resolution = w2.resolution || 'none';
    log(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${rec.resolution}`);
    // filler census for #541
    const full = L.join('\n');
    for (const dl of DRY_LINES) if (full.includes(dl)) rec.dryHits++;
    for (const fm of FILLER_MARKS) if (full.includes(fm)) rec.fillerHits++;
    if (rec.curious && (rec.dryHits || rec.fillerHits)) {
      log(`!! CURIOUS-FILLER: dry=${rec.dryHits} fillerMarks=${rec.fillerHits}`);
    }
  } catch (e) { log('CONVO ERROR: ' + (e && e.stack || e)); }
  fs.writeFileSync(fp, L.join('\n'));
  convoLog.push(rec);
  return fp;
}

async function runSeed(seed) {
  _seed = seed; _lines = [];
  console.log(`\n########## SEED ${seed} (competent, DAYCAP=${DAYCAP}) ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-deepening-r18', fullTelemetry: true });
  _G = Game;
  const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
  Game.say = function (...a) { _lines.push(String(a[0])); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  Game.sysSay = function (...a) { _lines.push(String(a[0])); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _emit === 'function') Game.emit = function (...a) { _lines.push(String(a[0])); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };

  const policy = Object.create(competent);
  policy.id = 'journey-deepening-r18-competent';
  const _origDaily = competent.daily ? competent.daily.bind(competent) : null;
  const _origSetup = competent.setup ? competent.setup.bind(competent) : null;
  policy.setup = function (G, ctx) { if (_origSetup) _origSetup(G, ctx); policy._ctx = ctx; };
  const convoDaysDone = {};
  policy.daily = function (G, ctx) {
    if (_origDaily) _origDaily(G, ctx);
    const d = gday();
    if (CONVO_DAYS.indexOf(d) >= 0 && !convoDaysDone[d]) {
      convoDaysDone[d] = true;
      try {
        const alive = (_G.data.villagers || []).filter(v => v && !v.dead && !((_G.state.village.dead || {})[v.id])).map(v => v.id).slice(0, 3);
        for (const vid of alive) runConversation(d, vid);
      } catch (e) { console.log('convo day err ' + (e && e.message)); }
    }
  };
  await setupGame(Game);
  const result = await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'journey-deepening-r18', date: new Date().toISOString().slice(0, 10), node: process.version } });
  const ctx = policy._ctx || {};

  // article-double scan
  const doubles = [];
  for (const s of _lines) {
    if (DOUBLE_RE.test(s)) doubles.push(s.slice(0, 160));
    if (doubles.length >= 10) break;
  }

  // fireside test beats (r17 H4 class)
  const testBeats = _lines.filter(s => /set aside time with/i.test(s)).length;

  const out = {
    seed, stoppedDay: gday(), result: (result && (result.outcome || result.stopped)) || '?',
    popAlive: popAlive(), pantryKcal: pantryKcal(), scale: scaleNow(), wave: waveNow(),
    specialists: specialists(),
    articleDoubles: doubles.length, articleDoubleSamples: doubles.slice(0, 5),
    firesideTestBeats: testBeats,
    convos: convoLog.filter(c => c.seed === seed),
  };
  const ofp = path.join(EVIDIR, `journey-deepening-r18-census-${seed}.json`);
  fs.writeFileSync(ofp, JSON.stringify(out, null, 1));
  console.log(`seed ${seed}: day ${out.stoppedDay}, pop ${out.popAlive}, scale ${out.scale}, wave ${out.wave}, articleDoubles ${out.articleDoubles}, testBeats ${out.firesideTestBeats}, pantry ${out.pantryKcal}`);
  return out;
}

async function main() {
  const results = [];
  for (const s of SEEDS) {
    try { results.push(await runSeed(s)); }
    catch (e) { console.log(`SEED ${s} CRASH: ` + (e && e.stack || e)); results.push({ seed: s, crash: String(e && e.message || e) }); }
  }
  // cross-seed curious census
  const curious = convoLog.filter(c => c.curious);
  const curiousFiller = curious.filter(c => c.dryHits > 0 || c.fillerHits > 0);
  const summary = {
    seeds: SEEDS, daycap: DAYCAP,
    results: results.map(r => ({ seed: r.seed, day: r.stoppedDay, pop: r.popAlive, scale: r.scale, wave: r.wave, articleDoubles: r.articleDoubles, testBeats: r.firesideTestBeats, specs: (r.specialists || []).length })),
    articleDoublesTotal: results.reduce((a, r) => a + (r.articleDoubles || 0), 0),
    convosTotal: convoLog.length,
    curiousConvos: curious.length,
    curiousWithFiller: curiousFiller.length,
    curiousFillerFiles: curiousFiller.map(c => c.file),
  };
  fs.writeFileSync(path.join(EVIDIR, 'journey-deepening-r18-summary.json'), JSON.stringify(summary, null, 1));
  console.log('\n=== R18 PILOT SUMMARY ===');
  console.log(JSON.stringify(summary, null, 1));
}
main().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
