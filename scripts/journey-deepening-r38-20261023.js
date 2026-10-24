// journey-deepening-r38-20261023.js -- DEEPENING leg R38:
// WAVE 3 IN THE WILD.
//
// Leg question: the deepening window (d40-80) is wave 3's home turf
// (unlock = day 25 + 4 wave-2 ledger kills, kills-only, Steve's design --
// measured, never moved). r36 surfaced wave-2 mechanics; r9 history shows
// wave-3 fights can silently drop 6->0 in sims. Do natural wave-3 unlocks
// happen under competent play in the leg window? When the 9 wave-3 monsters
// fight, do their signature mechanics actually play? Are those fights
// winnable-but-costly (canon bands: mid-build 4-6 rounds)?
//
// Instruments: harness-only wraps, zero src/js. Panel-compatible telemetry:
// top-level w3fights / engaged.w3 / fightsTotal / fightsByWave.3 (literal
// dotted keys, matching telemetry-baselines/deepening.json).
// SENSE-TESTING LAW: full wave-3 fight line dumps are saved for end-to-end
// reading; the marker counts are only a triage instrument.
//
// Usage: SEEDS=38001,38002,38003,38004 node scripts/journey-deepening-r38-20261023.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [38001, 38002, 38003, 38004]);
const DAYCAP = parseInt(process.env.DAYCAP || '80', 10);
const EVIDIR = process.env.EVIDIR || path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-23');

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { census } = require('./lib/death-census');
const { wfsSync } = require('./lib/wfs');

// Hardened evidence write: primary EVIDIR, fallback repo evidence dir,
// last resort loud stdout dump. Never throws (a write flap must not kill
// the run the way EPERM killed the first r38 pilot).
const FALLBACKDIR = path.join(ROOT, 'evidence', '2026-10-23');
function evWrite(name, data) {
  const fp = path.join(EVIDIR, name);
  if (wfsSync(fp, data)) return fp;
  try { fs.mkdirSync(FALLBACKDIR, { recursive: true }); } catch (e) {}
  const fp2 = path.join(FALLBACKDIR, name);
  if (wfsSync(fp2, data, { tries: 4 })) { console.log(`evWrite FALLBACK: ${name} -> repo evidence dir`); return fp2; }
  console.log(`evWrite LOST (both dirs EPERM): ${name} — dumping ${String(data).length} chars to stdout`);
  console.log(`===== STDOUT-DUMP ${name} BEGIN =====`);
  console.log(String(data).slice(0, 300000));
  console.log(`===== STDOUT-DUMP ${name} END =====`);
  return null;
}

let capture = [];
let _G = null;
let _currentSeed = null;
let deathReg = [];
let transcriptFiles = [];
let waveTrace = [];       // {day, wave, w1pts, w2pts}
let lastTracedDay = -1;
let w3UnlockDay = null;
let w3UnlockW2pts = null;
let fights = [];          // {day, mid, wave}
let w3Fights = [];        // {day, mid, lines: n, text: [...], outcome}
let w3FightLive = null;   // {mid, day, lines: []}

// Triage markers for the 9 wave-3 signature mechanics (counts only;
// the binding judgment is the end-to-end sense-read of the dumps).
const MARKERS = {
  redactor: [/redact/i],
  gavel: [/trial/i, /verdict/i, /procedure/i, /objection/i],
  focus_group: [/focus group/i, /rate your/i, /rating/i],
  spool: [/reel/i, /tape/i, /replay/i, /record(ing)? (your|the)/i],
  chorus_line: [/beat/i, /downbeat/i, /kick/i, /4\/4/i],
  terms_of_service: [/clause/i, /fine print/i, /terminat/i, /§/],
  callback: [/funeral/i, /wears .*face/i, /dead .*face/i],
  buffering: [/three seconds/i, /in the past/i, /buffer/i],
  ad_break: [/ad break/i, /sponsor/i, /advertisement/i],
};

function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function waveNow() { try { return _G.unlockedWave ? _G.unlockedWave() : null; } catch (e) { return null; } }
function wpts(w) { try { return (typeof _G.waveLedgerPoints === 'function') ? (_G.waveLedgerPoints(w) | 0) : null; } catch (e) { return null; } }

function traceDay() {
  const d = gday();
  if (d === lastTracedDay) return;
  lastTracedDay = d;
  const w = waveNow();
  waveTrace.push({ day: d, wave: w, w1pts: wpts(1), w2pts: wpts(2) });
  if (w3UnlockDay == null && w != null && w >= 3) { w3UnlockDay = d; w3UnlockW2pts = wpts(2); }
}

function fighterSnapshot() {
  try {
    const tb = _G && _G.tbfight;
    if (!tb || !tb.fighters) return null;
    return tb.fighters.map(f => ({
      name: f.name || f.key, kind: f.kind || null, monsterId: f.monsterId || (f.mdef && f.mdef.id) || null,
      hp: f.hp, maxHp: f.maxHp, dead: (f.hp || 0) <= 0,
    }));
  } catch (e) { return null; }
}

function closeW3Fight() {
  if (!w3FightLive) return;
  const text = Array.isArray(w3FightLive.lines) ? w3FightLive.lines : [];
  const joined = text.join('\n');
  const mid = w3FightLive.mid;
  const markers = {};
  for (const [k, rxs] of Object.entries(MARKERS[mid] || {})) markers[k] = 0;
  (MARKERS[mid] || []).forEach((rx, i) => { markers[i] = (joined.match(rx) || []).length; });
  let outcome = 'unknown';
  const snap = fighterSnapshot();
  if (snap) {
    const mon = snap.filter(f => (f.monsterId === mid) || (f.kind === 'monster'));
    const ply = snap.filter(f => f.kind === 'player' || f.kind === 'villager' || f.kind === 'ally');
    const monDead = mon.length && mon.every(f => f.dead);
    const plyDead = ply.length && ply.every(f => f.dead);
    if (monDead && !plyDead) outcome = 'win';
    else if (plyDead) outcome = 'party-wipe';
    else if (/flee|fled|run away|escape/i.test(joined.slice(-3000))) outcome = 'fled?';
  }
  w3Fights.push({ day: w3FightLive.day, mid, lines: text.length, outcome, markers, snap, text });
  console.log(`*** W3-FIGHT d${w3FightLive.day} ${mid}: ${text.length} lines, outcome=${outcome}`);
  w3FightLive = null;
}

function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
  traceDay();
  try {
    const tb = _G && _G.tbfight;
    const inFight = !!(tb && !tb.over);
    if (w3FightLive && !inFight) closeW3Fight();
    if (w3FightLive && inFight) w3FightLive.lines.push(s);
    if (/WAVE 3|wave 3|third wave/i.test(s) && w3UnlockDay == null) traceDay();
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
    let plants = 0, skills = 0, abilities = 0;
    try { plants = (_G.plantsKnownBy(id) || []).length; } catch (e) {}
    try { skills = ((p.skills || p.knownSkills) || []).length; } catch (e) {}
    try { abilities = ((_G.abilitiesOf && _G.abilitiesOf(id)) || []).length; } catch (e) {}
    return { id, name: vname(id), alive: !p.dead, occupation: p.formerOccupation || p.occupation || null,
      trust: (trust[id] !== undefined) ? trust[id] : null, plantsKnown: plants, skills, abilities };
  });
}

// ---- conversation driver (engage-first, 8 turns; r30/r34/r35/r36 behavior) ----
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
  const fp = path.join(EVIDIR, `journey-deepening-r38-transcript-competent-${_currentSeed}-day${day}-${safeVid}${tag || ''}.txt`);
  const L = [];
  const log = (s) => L.push(s);
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = _G.startConvo(vid);
    if (!r0) { log(`THEM: (no line — startConvo returned null for ${vid})`); evWrite(path.basename(fp), L.join('\n')); return fp; }
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
  evWrite(path.basename(fp), out);
  transcriptFiles.push(fp);
  return fp;
}

function makePolicy() {
  const policy = Object.create(competent);
  policy.id = 'journey-deepening-r38-competent';
  return policy;
}

async function runSeed(seed) {
  _currentSeed = seed;
  capture = [];
  deathReg = []; transcriptFiles = [];
  waveTrace = []; lastTracedDay = -1; w3UnlockDay = null; w3UnlockW2pts = null;
  fights = []; w3Fights = []; w3FightLive = null;
  console.log(`\n########## SEED ${seed} (wave-3 in the wild) ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-deepening-r38', fullTelemetry: true });
  _G = Game;

  const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
  Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  Game.sysSay = function (...a) { cap(a[0]); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }

  // startCombat wrap: fight log + wave-3 fight capture (harness-only)
  try {
    if (typeof Game.startCombat === 'function') {
      const _sc = Game.startCombat.bind(Game);
      Game.startCombat = function (monsterId, options) {
        try {
          const mid = monsterId || Game.pendingMonsterId || 'bulldozer';
          let wave = null;
          try { const mdef = (Game.data.monsters || []).find(m => m.id === mid); wave = mdef ? (mdef.wave || null) : null; } catch (e0) {}
          fights.push({ day: gday(), mid, wave });
          if (wave === 3) {
            if (w3FightLive) closeW3Fight();
            w3FightLive = { mid, day: gday(), lines: [] };
            console.log(`*** W3-FIGHT-OPEN d${gday()}: ${mid}`);
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
  const result = await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'journey-deepening-r38', date: new Date().toISOString().slice(0, 10), node: process.version } });

  closeW3Fight();
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

  const w3distinct = [...new Set(fights.filter(f => f.wave === 3).map(f => f.mid))];
  const out = {
    seed, policy: 'competent', maxGameDay: result.gameDays, endReason: result.endReason, finalWave: waveNow(),
    // panel-compatible telemetry (literal dotted keys, summed by telemetry-check)
    w3fights: fights.filter(f => f.wave === 3).length,
    'engaged.w3': w3distinct.length,
    fightsTotal: fights.length,
    'fightsByWave.3': fights.filter(f => f.wave === 3).length,
    w2fights: fights.filter(f => f.wave === 2).length,
    'fightsByWave.2': fights.filter(f => f.wave === 2).length,
    fightsByWave: fights.reduce((a, f) => { const k = String(f.wave == null ? '?' : f.wave); a[k] = (a[k] || 0) + 1; return a; }, {}),
    fights: fights,
    // wave-3 arrival
    w3UnlockDay, w3UnlockW2pts,
    waveTrace,
    // wave-3 fights with mechanic-marker triage + outcomes
    w3Fights: w3Fights.map(f => ({ day: f.day, mid: f.mid, lines: f.lines, outcome: f.outcome, markers: f.markers, snap: f.snap })),
    census: endCensus,
    deathCensus: { full: dcFull, window: dcWindow, windowFloor: 40, records: deathReg.length },
    deaths: deathReg.map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    transcripts: transcriptFiles,
    pacing: result.pacing || null,
  };
  const fp = evWrite(`journey-deepening-r38-competent-${seed}.json`, JSON.stringify(out, null, 1));
  // wave-3 fight line dumps (for end-to-end sense-reading)
  try {
    const parts = [];
    for (const f of w3Fights) {
      const arr = Array.isArray(f.text) ? f.text : [];
      parts.push(`===== d${f.day} ${f.mid} (${arr.length} lines, outcome=${f.outcome}) =====`);
      for (const ln of arr) parts.push(String(ln));
      parts.push('');
    }
    evWrite(`journey-deepening-r38-w3fights-competent-${seed}.txt`, parts.join('\n'));
  } catch (e) { console.log('w3fights dump ERROR: ' + (e && e.message)); }
  console.log(`SEED ${seed} DONE: day=${result.gameDays} end=${result.endReason} wave=${waveNow()} pop=${popAlive()} ` +
    `w3unlock=${w3UnlockDay} w3fights=${out.w3fights} w3distinct=${w3distinct.length} -> ${fp}`);
  return out;
}

async function main() {
  const summary = [];
  for (const seed of SEEDS) {
    try { summary.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); summary.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  let w3f = 0, w3d = new Set(), alive = 0;
  for (const s of summary) {
    w3f += s.w3fights || 0;
    for (const f of (s.fights || [])) if (f.wave === 3) w3d.add(f.mid);
    if (!s.fatal && s.endReason === 'survived') alive++;
    console.log(`seed ${s.seed}: day=${s.maxGameDay} end=${s.endReason} pop=${(s.census || []).filter(c => c.alive).length}/${(s.census || []).length} ` +
      `w3unlock=${s.w3UnlockDay} w3fights=${s.w3fights || 0}${s.fatal ? ' FATAL: ' + s.fatal : ''}`);
  }
  console.log(`TOTALS: w3fights=${w3f} w3distinct=${w3d.size} alive=${alive}/${summary.length}`);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
