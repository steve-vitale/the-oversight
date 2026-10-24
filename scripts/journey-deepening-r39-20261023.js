// journey-deepening-r39-20261023.js -- DEEPENING leg R39:
// DOES THE WIDER WORLD BECOME VISIBLE DURING DEEPENING?
//
// Leg question: Steve's gap (2026-10-13): "nothing in-world points at
// national/regional -- 128 days of competent play produced zero mentions."
// The scaleDiscovery pointer system (traveler word, villager mention, System
// producer-brain nudges, audience whisper) + hierarchy FIRST CONTACT were
// built in response. This run measures whether those pointers fire under
// competent d40-80 play, and sense-reads every fired beat (SENSE-TESTING
// LAW: the full beat lines are saved; the counts are triage, not verdict).
//
// Instruments: harness-only wraps, zero src/js gameplay changes.
// Panel-compatible telemetry: keep r38 keys (w3fights / engaged.w3 /
// fightsTotal / fightsByWave.3) for the deviation check; add sd* keys.
// Per-seed beat dumps: journey-deepening-r39-sdbeats-competent-<seed>.txt.
//
// Usage: SEEDS=39001,39002,39003,39004 node scripts/journey-deepening-r39-20261023.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [39001, 39002, 39003, 39004]);
const DAYCAP = parseInt(process.env.DAYCAP || '80', 10);
const EVIDIR = process.env.EVIDIR || path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-24');

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { census } = require('./lib/death-census');
const { wfsSync } = require('./lib/wfs');

// Hardened evidence write (r38 pattern: EPERM-flap resistant).
const FALLBACKDIR = path.join(ROOT, 'evidence', '2026-10-24');
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

// Scale-discovery beat classifiers (keyed to the exact say() texts in
// src/js/scaleDiscovery.js; WORD TRAVELS in src/js/ledger.js).
const BEAT_RX = [
  ['region.traveler', /a trader lingers after the meal|walk as ONE|bigger games than yours/i],
  ['region.villager', /mending a net by the fire|speaker for speakers/i],
  ['realm.traveler', /FOUR fires under one head|called it a REALM|tribute flows uphill/i],
  ['nextAct.system', /BIGGER STAGE|Get me a network|the next act needs/i],
  ['nation.system', /FINALES need a NATION|make it a REALM|higher-ups are watching/i],
  ['natBeatEcho.villager', /I don't think one fire faces it/i],
  ['table.system', /There's a table, little fires|A big one\. Far away/i],
  ['knock.system', /NEIGHBORS\. You know what neighbors are for|it's CONTENT/i],
  ['hunger.villager', /has grain\. We have hands\. Someone should walk over/i],
  ['whisper.audience', /the chat is doing the thing again|RANKING fires/i],
  ['firstAccord.moment', /FIRST CONTACT|PILOT for a whole new SHOW|We're not alone anymore|Coordination layer: warming up/i],
  ['wordtravels', /WORD TRAVELS/i],
];

let _G = null;
let _currentSeed = null;
let capture = [];
let deathReg = [];
let transcriptFiles = [];
let waveTrace = [];
let lastTracedDay = -1;
let w3UnlockDay = null;
let w3UnlockW2pts = null;
let fights = [];
let sdBeats = [];   // {day, cls, line}

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

function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
  traceDay();
  for (const [cls, rx] of BEAT_RX) {
    if (rx.test(s)) {
      sdBeats.push({ day: gday(), cls, line: s.length > 600 ? s.slice(0, 600) : s });
      break;
    }
  }
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

// ---- conversation driver (engage-first, 8 turns; r30/r34/r35/r36/r38 behavior) ----
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
  const fp = path.join(EVIDIR, `journey-deepening-r39-transcript-competent-${_currentSeed}-day${day}-${safeVid}${tag || ''}.txt`);
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
  policy.id = 'journey-deepening-r39-competent';
  return policy;
}

async function runSeed(seed) {
  _currentSeed = seed;
  capture = [];
  deathReg = []; transcriptFiles = [];
  waveTrace = []; lastTracedDay = -1; w3UnlockDay = null; w3UnlockW2pts = null;
  fights = []; sdBeats = [];
  console.log(`\n########## SEED ${seed} (scale visibility in the wild) ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-deepening-r39', fullTelemetry: true });
  _G = Game;

  const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
  Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  Game.sysSay = function (...a) { cap(a[0]); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }

  // startCombat wrap: fight counts only (telemetry continuity)
  try {
    if (typeof Game.startCombat === 'function') {
      const _sc = Game.startCombat.bind(Game);
      Game.startCombat = function (monsterId, options) {
        try {
          const mid = monsterId || Game.pendingMonsterId || 'bulldozer';
          let wave = null;
          try { const mdef = (Game.data.monsters || []).find(m => m.id === mid); wave = mdef ? (mdef.wave || null) : null; } catch (e0) {}
          fights.push({ day: gday(), mid, wave });
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
  const result = await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'journey-deepening-r39', date: new Date().toISOString().slice(0, 10), node: process.version } });

  traceDay();

  // end-of-run scale state (harness reads, engine owns)
  let sdState = null, scaleRank = null, linkCount = null, knownVillages = null;
  try { sdState = (typeof _G.scaleDiscovery === 'function') ? _G.scaleDiscovery() : null; } catch (e) {}
  try { scaleRank = (typeof _G.scaleRank === 'function') ? _G.scaleRank() : null; } catch (e) {}
  try {
    const hs = (typeof _G.hierarchyState === 'function') ? _G.hierarchyState() : null;
    if (hs && hs.links) linkCount = Object.keys(hs.links).length;
    else if (Array.isArray(hs)) linkCount = hs.length;
  } catch (e) {}
  try {
    const ov = (_G.state && _G.state.otherVillages) || {};
    knownVillages = Object.keys(ov).length;
  } catch (e) {}

  // people check: up to 3 living villagers, end-state conversations
  try {
    const living = ((_G.state.village.roster || []).filter(id => !person(id).dead)).slice(0, 3);
    for (const vid of living) runConversation(result.gameDays, vid, '-end');
  } catch (e) { console.log('convo sampling ERROR: ' + (e && e.message)); }

  const endCensus = buildCensus();
  const rosterIds = (((Game.state || {}).village || {}).roster || []);
  const dcFull = census(deathReg, { playerId: 'p', roster: rosterIds });
  const dcWindow = census(deathReg.filter(d => (d.day || 0) >= 40), { playerId: 'p', roster: rosterIds });

  const beatsByCls = {};
  for (const b of sdBeats) { beatsByCls[b.cls] = (beatsByCls[b.cls] || 0) + 1; }
  const sdKeySet = {};
  if (sdState) for (const k of Object.keys(sdState)) sdKeySet[k] = sdState[k];

  const w3distinct = [...new Set(fights.filter(f => f.wave === 3).map(f => f.mid))];
  const out = {
    seed, policy: 'competent', maxGameDay: result.gameDays, endReason: result.endReason, finalWave: waveNow(),
    // panel-compatible telemetry (literal dotted keys, summed by telemetry-check)
    w3fights: fights.filter(f => f.wave === 3).length,
    'engaged.w3': w3distinct.length,
    fightsTotal: fights.length,
    'fightsByWave.3': fights.filter(f => f.wave === 3).length,
    fightsByWave: fights.reduce((a, f) => { const k = String(f.wave == null ? '?' : f.wave); a[k] = (a[k] || 0) + 1; return a; }, {}),
    // scale-visibility telemetry
    sdBeats: sdBeats.length,
    sdBeatsByCls: beatsByCls,
    sdState: sdKeySet,
    sdRegionFired: !!(sdState && sdState.region),
    sdRealmFired: !!(sdState && sdState.realm),
    sdNationFired: !!(sdState && sdState.nation),
    sdTableFired: !!(sdState && sdState.table),
    sdFirstAccord: !!(sdState && sdState.firstAccord),
    scaleRank, linkCount, knownVillages,
    w3UnlockDay, w3UnlockW2pts,
    waveTrace,
    census: endCensus,
    deathCensus: { full: dcFull, window: dcWindow, windowFloor: 40, records: deathReg.length },
    deaths: deathReg.map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    transcripts: transcriptFiles,
    pacing: result.pacing || null,
  };
  const fp = evWrite(`journey-deepening-r39-competent-${seed}.json`, JSON.stringify(out, null, 1));
  // beat line dumps for end-to-end sense-reading
  try {
    const parts = [`===== SEED ${seed} scale-discovery beats (${sdBeats.length}) =====`, `sdState=${JSON.stringify(sdKeySet)} scaleRank=${scaleRank} links=${linkCount} knownVillages=${knownVillages}`, ''];
    for (const b of sdBeats) {
      parts.push(`--- d${b.day} [${b.cls}] ---`);
      parts.push(b.line);
      parts.push('');
    }
    if (!sdBeats.length) parts.push('(no beats captured)');
    evWrite(`journey-deepening-r39-sdbeats-competent-${seed}.txt`, parts.join('\n'));
  } catch (e) { console.log('sdbeats dump ERROR: ' + (e && e.message)); }
  console.log(`SEED ${seed} DONE: day=${result.gameDays} end=${result.endReason} wave=${waveNow()} pop=${popAlive()} ` +
    `sdBeats=${sdBeats.length} sdKeys=${Object.keys(sdKeySet).join(',') || 'none'} links=${linkCount} w3unlock=${w3UnlockDay} -> ${fp}`);
  return out;
}

async function main() {
  const summary = [];
  for (const seed of SEEDS) {
    try { summary.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); summary.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  let alive = 0;
  for (const s of summary) {
    if (!s.fatal && s.endReason === 'survived') alive++;
    console.log(`seed ${s.seed}: day=${s.maxGameDay} end=${s.endReason} pop=${(s.census || []).filter(c => c.alive).length}/${(s.census || []).length} ` +
      `sdBeats=${s.sdBeats || 0} sdKeys=${Object.keys(s.sdState || {}).join(',') || 'none'} links=${s.linkCount} w3unlock=${s.w3UnlockDay}${s.fatal ? ' FATAL: ' + s.fatal : ''}`);
  }
  console.log(`TOTALS: alive=${alive}/${summary.length}`);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
