// journey-deepening-r35-20261023.js -- DEEPENING leg R35:
// WAVE-3 ARRIVAL + SIGNATURE SURFACING.
//
// Leg question: in the deepening window (d40-80), when does wave 3 actually
// arrive in competent play (unlock cadence), and when its monsters fight, do
// the wave-3 signature mechanics surface in real fights -- or are the fights
// over before the mechanics play?
//
// Instruments: harness-only wraps, zero src/js. Panel-compatible telemetry:
// top-level w3fights / engaged.w3 / fightsTotal / fightsByWave.3 (literal
// dotted keys, matching telemetry-baselines/deepening.json).
//
// Usage: SEEDS=9981,9982,9983,9984 node scripts/journey-deepening-r35-20261023.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [9981, 9982, 9983, 9984]);
const DAYCAP = parseInt(process.env.DAYCAP || '80', 10);

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { census, r21Misread } = require('./lib/death-census');

const EVIDIR = path.join(ROOT, 'evidence', '2026-10-23');

// Wave-3 signature-mechanic narration signatures (from sigW3a.js / sigW3b.js / sigW3c.js).
// Each regex names the mechanic; a wave-3 fight "surfaces" a mechanic when any fires.
const SIG_RX = {
  spool:      /🎞 REC|the reels spin up|the tape plays your|the tape loops/i,
  chorus:     /DOWNBEAT|BEAT [123]\/4 — the line faces/i,
  tos:        /scroll UNROLLS|scroll GLOWS|OBJECTION FILED/i,
  redactor:   /The handles|REDACTED|redacts your|The Redactor redacts/i,
  gavel:      /VERDICT FALLS|RECESS\. The gavel|ACCUSES/i,
  focusgroup: /The murmur/i,
  callback:   /wears .*'s face|the face shifts|The wrongness is the telegraph/i,
  buffering:  /IT WILL STEP|IT WILL STRIKE|afterimages smear/i,
  adbreak:    /SKIP AD|AD BREAK/i,
};

let capture = [];
let _G = null;
let _currentSeed = null;
let deathReg = [];
let transcriptFiles = [];
// wave instruments
let waveTrace = [];       // {day, wave, w2pts}
let lastTracedDay = -1;
let w3UnlockDay = null;
let fights = [];          // {day, mid, wave}
let w3Fights = [];        // {day, mid, mechanics: {sig: count}, lines: n}
let w3FightLive = null;   // {mid, day, mechanics:{}, lines: n}

function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function waveNow() { try { return _G.unlockedWave ? _G.unlockedWave() : null; } catch (e) { return null; } }
function w2pts() { try { return (typeof _G.waveLedgerPoints === 'function') ? (_G.waveLedgerPoints(2) | 0) : null; } catch (e) { return null; } }

function traceDay() {
  const d = gday();
  if (d === lastTracedDay) return;
  lastTracedDay = d;
  const w = waveNow();
  const p = w2pts();
  waveTrace.push({ day: d, wave: w, w2pts: p });
  if (w3UnlockDay == null && w != null && w >= 3) w3UnlockDay = d;
}

function closeW3Fight() {
  if (!w3FightLive) return;
  w3Fights.push({ day: w3FightLive.day, mid: w3FightLive.mid, lines: w3FightLive.lines, mechanics: w3FightLive.mechanics });
  const fired = Object.keys(w3FightLive.mechanics);
  if (fired.length) console.log(`*** W3-FIGHT d${w3FightLive.day} ${w3FightLive.mid}: mechanics surfaced: ${fired.join(', ')}`);
  else console.log(`*** W3-FIGHT d${w3FightLive.day} ${w3FightLive.mid}: NO signature mechanic narrated (${w3FightLive.lines} fight lines)`);
  w3FightLive = null;
}

function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
  traceDay();
  // wave-3 fight line tagging
  try {
    const tb = _G && _G.tbfight;
    const inFight = !!(tb && !tb.over);
    if (w3FightLive && !inFight) closeW3Fight();
    if (w3FightLive && inFight) {
      w3FightLive.lines++;
      for (const k of Object.keys(SIG_RX)) {
        if (SIG_RX[k].test(s)) { w3FightLive.mechanics[k] = (w3FightLive.mechanics[k] || 0) + 1; break; }
      }
    }
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

// ---- conversation driver (engage-first, 8 turns; r30/r34 behavior, r32b filenames) ----
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
  const fp = path.join(EVIDIR, `journey-deepening-r35-transcript-competent-${_currentSeed}-day${day}-${safeVid}${tag || ''}.txt`);
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
  policy.id = 'journey-deepening-r35-competent';
  return policy;
}

async function runSeed(seed) {
  _currentSeed = seed;
  capture = [];
  deathReg = []; transcriptFiles = [];
  waveTrace = []; lastTracedDay = -1; w3UnlockDay = null;
  fights = []; w3Fights = []; w3FightLive = null;
  console.log(`\n########## SEED ${seed} (wave-3 arrival + signature surfacing) ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-deepening-r35', fullTelemetry: true });
  _G = Game;

  const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
  Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  Game.sysSay = function (...a) { cap(a[0]); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }

  // startCombat wrap: fight log + wave-3 fight open (harness-only)
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
            w3FightLive = { mid, day: gday(), lines: 0, mechanics: {} };
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
  const result = await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'journey-deepening-r35', date: new Date().toISOString().slice(0, 10), node: process.version } });

  closeW3Fight(); // in case the last fight was still "live" at run end
  traceDay();     // final day sample

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
  const mechFights = w3Fights.filter(f => Object.keys(f.mechanics).length > 0).length;
  const out = {
    seed, policy: 'competent', maxGameDay: result.gameDays, endReason: result.endReason, finalWave: waveNow(),
    // panel-compatible telemetry (literal dotted keys, summed by telemetry-check)
    w3fights: fights.filter(f => f.wave === 3).length,
    'engaged.w3': w3distinct.length,
    fightsTotal: fights.length,
    'fightsByWave.3': fights.filter(f => f.wave === 3).length,
    fightsByWave: fights.reduce((a, f) => { const k = String(f.wave == null ? '?' : f.wave); a[k] = (a[k] || 0) + 1; return a; }, {}),
    // wave-3 arrival (P1)
    w3UnlockDay,
    waveTrace,
    // signature surfacing (P2)
    w3Fights,
    w3MechanicsSurfaced: mechFights,
    w3DistinctMids: w3distinct,
    census: endCensus,
    deathCensus: { full: dcFull, window: dcWindow, windowFloor: 40, records: deathReg.length },
    deaths: deathReg.map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    transcripts: transcriptFiles,
    pacing: result.pacing || null,
  };
  const fp = path.join(EVIDIR, `journey-deepening-r35-competent-${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  // wave-3 fight line dump (for sense-reading mechanic narration)
  try {
    const w3lines = [];
    for (const f of w3Fights) {
      w3lines.push(`===== d${f.day} ${f.mid} (mechanics: ${Object.keys(f.mechanics).join(', ') || 'NONE'}) =====`);
    }
    fs.writeFileSync(path.join(EVIDIR, `journey-deepening-r35-w3fights-competent-${seed}.txt`), w3lines.join('\n'));
  } catch (e) { console.log('w3fights dump ERROR: ' + (e && e.message)); }
  try {
    let txt = capture.join('\n');
    if (txt.length > 1024 * 1024) txt = '[HEAD TRUNCATED]\n' + txt.slice(-1024 * 1024);
    fs.writeFileSync(path.join(EVIDIR, `journey-deepening-r35-capture-competent-${seed}.txt`), txt);
  } catch (e) { console.log('capture dump ERROR: ' + (e && e.message)); }
  console.log(`SEED ${seed} DONE: day=${result.gameDays} end=${result.endReason} wave=${waveNow()} pop=${popAlive()} ` +
    `w3unlock=${w3UnlockDay} w3fights=${out.w3fights} mechSurfaced=${mechFights} -> ${fp}`);
  return out;
}

async function main() {
  const summary = [];
  for (const seed of SEEDS) {
    try { summary.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); summary.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  let w3f = 0, mech = 0, alive = 0, unlocked = 0;
  for (const s of summary) {
    w3f += s.w3fights || 0; mech += s.w3MechanicsSurfaced || 0;
    if (!s.fatal && s.endReason === 'survived') alive++;
    if (s.w3UnlockDay != null) unlocked++;
    console.log(`seed ${s.seed}: day=${s.maxGameDay} end=${s.endReason} pop=${(s.census || []).filter(c => c.alive).length}/${(s.census || []).length} ` +
      `w3unlock=${s.w3UnlockDay} w3fights=${s.w3fights || 0} mechSurfaced=${s.w3MechanicsSurfaced || 0}${s.fatal ? ' FATAL: ' + s.fatal : ''}`);
  }
  console.log(`TOTALS: w3fights=${w3f} mechSurfaced=${mech} w3unlocked=${unlocked}/${summary.length} alive=${alive}/${summary.length}`);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
