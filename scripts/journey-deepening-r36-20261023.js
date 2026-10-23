// journey-deepening-r36-20261023.js -- DEEPENING leg R36:
// WAVE-2 MECHANIC SURFACING IN REAL FIGHTS.
//
// Leg question: in the deepening window (d40-80), wave 3's arrival is
// kill-gated and variable (r35: unlock d47/d53/never) — but wave 2 is the
// leg's GUARANTEED content (day 8 + 5 wave-1 ledger points). When competent
// players fight wave-2's 13 entertainment predators, do their signature
// mechanics actually play in the fight — or are fights over before the
// mechanics surface? SENSE-TESTING LAW: per-fight line dumps are saved for
// end-to-end reading; the counts are only the instrument.
//
// Instruments: harness-only wraps, zero src/js. Panel-compatible telemetry:
// top-level w2fights / engaged.w2 / fightsTotal / fightsByWave.2 (literal
// dotted keys, matching telemetry-baselines/deepening.json).
//
// Also carries: stay-green re-measure (death census, winnable, people
// check), + COMPETENT_EXIT_VERIFIED_FLEE=1 exercises the r36 consumed-push
// port on a real leg (zero effect when the gate is off).
//
// Usage: SEEDS=10001,10002,10003,10004 node scripts/journey-deepening-r36-20261023.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [10001, 10002, 10003, 10004]);
const DAYCAP = parseInt(process.env.DAYCAP || '80', 10);

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { census, r21Misread } = require('./lib/death-census');

const EVIDIR = path.join(ROOT, 'evidence', '2026-10-23');

let capture = [];
let _G = null;
let _currentSeed = null;
let deathReg = [];
let transcriptFiles = [];
let waveTrace = [];       // {day, wave, w1pts, w2pts}
let lastTracedDay = -1;
let w2UnlockDay = null;
let fights = [];          // {day, mid, wave}
let w2Fights = [];        // {day, mid, lines: n, text: [...]}
let w2FightLive = null;   // {mid, day, lines: []}
let counterLearned = [];  // {day, line}

function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function waveNow() { try { return _G.unlockedWave ? _G.unlockedWave() : null; } catch (e) { return null; } }
function wpts(w) { try { return (typeof _G.waveLedgerPoints === 'function') ? (_G.waveLedgerPoints(w) | 0) : null; } catch (e) { return null; } }

function traceDay() {
  const d = gday();
  if (d === lastTracedDay) return;
  lastTracedDay = d;
  const w = waveNow();
  waveTrace.push({ day: d, wave: w, w1pts: wpts(1), w2pts: wpts(2) });
  if (w2UnlockDay == null && w != null && w >= 2) w2UnlockDay = d;
}

function closeW2Fight() {
  if (!w2FightLive) return;
  w2Fights.push({ day: w2FightLive.day, mid: w2FightLive.mid, lines: w2FightLive.lines.length, text: w2FightLive.lines });
  console.log(`*** W2-FIGHT d${w2FightLive.day} ${w2FightLive.mid}: ${w2FightLive.lines.length} fight lines captured`);
  w2FightLive = null;
}

function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
  traceDay();
  if (/COUNTER LEARNED/i.test(s)) {
    counterLearned.push({ day: gday(), line: s.slice(0, 220) });
    console.log(`*** COUNTER d${gday()}: ${s.slice(0, 120)}`);
  }
  // wave-2 fight line tagging
  try {
    const tb = _G && _G.tbfight;
    const inFight = !!(tb && !tb.over);
    if (w2FightLive && !inFight) closeW2Fight();
    if (w2FightLive && inFight) w2FightLive.lines.push(s);
  } catch (e) {}
}

function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return {}; } }
function popAlive() { try { return (_G.state.village.roster || []).filter(id => !person(id).dead).length; } catch (e) { return null; } }
function buildCensus() {
  const roster = (_G.state.village && _G.state.village.roster) || [];
  const trust = (_G.state.village && _G.state.village.trust) || {};
  return roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (_G.plantsKnownBy(id) || []).length; } catch (e) {}
    return { id, name: vname(id), alive: !p.dead, occupation: p.formerOccupation || p.occupation || null,
      trust: (trust[id] !== undefined) ? trust[id] : null, plantsKnown: plants };
  });
}

// ---- conversation driver (engage-first, 8 turns; r30/r34/r35 behavior) ----
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass'];
const GQYN = ['gq:yn:unsure', 'gq:yn:honest_pass', 'gq:yn:no', 'gq:yn:yes'];
function pickChoice(choices, turn) {
  const list = choices || [];
  if (turn === 0) {
    const acc = list.find(x => x && x.id === 'betrayal:accept');
    if (acc) return acc;
    const dec = list.find(x => x && x.id === 'betrayal:decline');
    if (dec && list.every(x => !x || !ENGAGE.includes(x.id))) return dec;
  }
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of GQYN) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of ENGAGE2) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}
function runConversation(day, vid, tag) {
  const safeVid = String(vid).replace(/[^a-zA-Z0-9_-]/g, '');
  const fp = path.join(EVIDIR, `journey-deepening-r36-transcript-competent-${_currentSeed}-day${day}-${safeVid}${tag || ''}.txt`);
  const L = [];
  const log = (s) => L.push(s);
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = _G.startConvo(vid);
    if (!r0) { log(`THEM: (no line — startConvo returned null for ${vid})`); fs.writeFileSync(fp, L.join('\n')); return fp; }
    const c = _G.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== seed ${_currentSeed} day ${day} — conversation with ${nm} (${vid}) ===`);
    log(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${((_G.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0})`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      if (turn === 0) log(`(turn0 choices: ${(choices || []).map(c => c && c.id).join(', ') || 'NONE'})`);
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = _G.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      const w = (_G.convoGet(vid).want) || {};
      log(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = _G.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = _G.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    log(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
  } catch (e) { log('CONVO ERROR: ' + (e && e.stack || e)); }
  let out = L.join('\n');
  if (out.length > 200 * 1024) out = out.slice(0, 200 * 1024) + '\n[TRUNCATED at 200KB]';
  fs.writeFileSync(fp, out);
  transcriptFiles.push(fp);
  return fp;
}

function makePolicy() {
  const policy = Object.create(competent);
  policy.id = 'journey-deepening-r36-competent';
  return policy;
}

async function runSeed(seed) {
  _currentSeed = seed;
  capture = [];
  deathReg = []; transcriptFiles = [];
  waveTrace = []; lastTracedDay = -1; w2UnlockDay = null;
  fights = []; w2Fights = []; w2FightLive = null; counterLearned = [];
  console.log(`\n########## SEED ${seed} (wave-2 mechanic surfacing) ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-deepening-r36', fullTelemetry: true });
  _G = Game;

  const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
  Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  Game.sysSay = function (...a) { cap(a[0]); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }

  // startCombat wrap: fight log + wave-2 fight capture (harness-only)
  try {
    if (typeof Game.startCombat === 'function') {
      const _sc = Game.startCombat.bind(Game);
      Game.startCombat = function (monsterId, options) {
        try {
          const mid = monsterId || Game.pendingMonsterId || 'bulldozer';
          let wave = null;
          try { const mdef = (Game.data.monsters || []).find(m => m.id === mid); wave = mdef ? (mdef.wave || null) : null; } catch (e0) {}
          fights.push({ day: gday(), mid, wave });
          if (wave === 2) {
            if (w2FightLive) closeW2Fight();
            w2FightLive = { mid, day: gday(), lines: [] };
            console.log(`*** W2-FIGHT-OPEN d${gday()}: ${mid}`);
          }
        } catch (e0) {}
        return _sc.apply(this, arguments);
      };
    }
  } catch (e) { console.log('startCombat wrap ERROR: ' + (e && e.message)); }

  // registerDeath wrap: kind-aware death census (r27 lib)
  try {
    if (typeof Game.registerDeath === 'function') {
      const _rd = Game.registerDeath.bind(Game);
      Game.registerDeath = function (opts) {
        try {
          const o = opts || {};
          deathReg.push({ day: gday(), kind: o.kind || '?', cause: o.cause || '?',
            killerId: (o.killerId == null ? null : String(o.killerId)),
            vid: o.villagerId != null ? String(o.villagerId) : null,
            monsterId: o.monsterId != null ? String(o.monsterId) : null,
            who: o.villagerId || o.monsterId || o.name || '?', name: o.name || null, player: !!o.player });
        } catch (e0) {}
        return _rd.apply(this, arguments);
      };
    }
  } catch (e) { console.log('registerDeath wrap ERROR: ' + (e && e.message)); }

  await setupGame(Game);
  const policy = makePolicy();
  const result = await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'journey-deepening-r36', date: new Date().toISOString().slice(0, 10), node: process.version } });

  closeW2Fight();
  traceDay();

  // people check: up to 3 living villagers, end-state conversations
  try {
    const living = ((_G.state.village.roster || []).filter(id => !person(id).dead)).slice(0, 3);
    for (const vid of living) runConversation(result.gameDays, vid, '-end');
  } catch (e) { console.log('convo sampling ERROR: ' + (e && e.message)); }

  const endCensus = buildCensus();
  const rosterIds = (((Game.state || {}).village || {}).roster || []);
  const dcFull = census(deathReg, { playerId: 'p', roster: rosterIds });
  const dcWindow = census(deathReg.filter(d => (d.day || 0) >= 40), { playerId: 'p', roster: rosterIds });

  const w2distinct = [...new Set(fights.filter(f => f.wave === 2).map(f => f.mid))];
  const out = {
    seed, policy: 'competent', maxGameDay: result.gameDays, endReason: result.endReason, finalWave: waveNow(),
    // panel-compatible telemetry (literal dotted keys, summed by telemetry-check)
    w2fights: fights.filter(f => f.wave === 2).length,
    'engaged.w2': w2distinct.length,
    fightsTotal: fights.length,
    'fightsByWave.2': fights.filter(f => f.wave === 2).length,
    fightsByWave: fights.reduce((a, f) => { const k = String(f.wave == null ? '?' : f.wave); a[k] = (a[k] || 0) + 1; return a; }, {}),
    fights: fights,
    // wave-2 arrival
    w2UnlockDay,
    waveTrace,
    // counterplay learning
    counterLearned,
    w2CountersKnown: counterLearned.length,
    w2Fights: w2Fights.map(f => ({ day: f.day, mid: f.mid, lines: f.lines })),
    census: endCensus,
    deathCensus: { full: dcFull, window: dcWindow, windowFloor: 40, records: deathReg.length },
    deaths: deathReg.map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    transcripts: transcriptFiles,
    pacing: result.pacing || null,
  };
  const fp = path.join(EVIDIR, `journey-deepening-r36-competent-${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  // wave-2 fight line dumps (for end-to-end sense-reading)
  try {
    const parts = [];
    for (const f of w2Fights) {
      parts.push(`===== d${f.day} ${f.mid} (${f.text.length} lines) =====`);
      for (const ln of f.text) parts.push(ln);
      parts.push('');
    }
    fs.writeFileSync(path.join(EVIDIR, `journey-deepening-r36-w2fights-competent-${seed}.txt`), parts.join('\n'));
  } catch (e) { console.log('w2fights dump ERROR: ' + (e && e.message)); }
  try {
    let txt = capture.join('\n');
    if (txt.length > 1024 * 1024) txt = '[HEAD TRUNCATED]\n' + txt.slice(-1024 * 1024);
    fs.writeFileSync(path.join(EVIDIR, `journey-deepening-r36-capture-competent-${seed}.txt`), txt);
  } catch (e) { console.log('capture dump ERROR: ' + (e && e.message)); }
  console.log(`SEED ${seed} DONE: day=${result.gameDays} end=${result.endReason} wave=${waveNow()} pop=${popAlive()} ` +
    `w2unlock=${w2UnlockDay} w2fights=${out.w2fights} w2distinct=${w2distinct.length} counters=${counterLearned.length} -> ${fp}`);
  return out;
}

async function main() {
  const summary = [];
  for (const seed of SEEDS) {
    try { summary.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); summary.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  let w2f = 0, w2d = new Set(), alive = 0, cl = 0;
  for (const s of summary) {
    w2f += s.w2fights || 0; cl += s.w2CountersKnown || 0;
    for (const f of (s.fights || [])) if (f.wave === 2) w2d.add(f.mid);
    if (!s.fatal && s.endReason === 'survived') alive++;
    console.log(`seed ${s.seed}: day=${s.maxGameDay} end=${s.endReason} pop=${(s.census || []).filter(c => c.alive).length}/${(s.census || []).length} ` +
      `w2unlock=${s.w2UnlockDay} w2fights=${s.w2fights || 0} counters=${s.w2CountersKnown || 0}${s.fatal ? ' FATAL: ' + s.fatal : ''}`);
  }
  console.log(`TOTALS: w2fights=${w2f} w2distinct=${w2d.size} counters=${cl} alive=${alive}/${summary.length}`);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });

if (typeof module !== 'undefined') module.exports = { pickChoice };
