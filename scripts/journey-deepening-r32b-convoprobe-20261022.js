// journey-deepening-r32b-20261022.js -- DEEPENING leg R31:
// THE ALIEN-VECTOR CHANNEL. The deepening window's two wave-2 disease
// vectors (giant_mosquito, alien_tick) carry the ALIEN-pool diseases
// (eurika / east_nile / lemons) per docs/DISEASES.md — permanent warping:
// drawback + ability + transformation, "some avoid infection, others seek it
// as build fuel."
//
// Code read (2026-10-22, BEFORE instrumenting): the bite/latch infection
// channels are SCHOLAR-ONLY by construction — mosquitoBiteVirus() applies to
// 'scholar' and is called behind `foe.kind === 'player'` (game.js:37953);
// tbTickTurn's lemons roll is `foe.kind === 'player'`-gated (game.js:38061);
// fieldFights.js (the villager abstract combat model) has NO infection
// channel at all; ambient tick attach is 'scholar'-only. The one villager
// alien-pool channel that exists is villagerMonsterWeirdness (meat quirks).
//
// Leg question: does the vector channel FIRE in the deepening window, and
// for whom? MEASUREMENT run (DIAG class): zero src/js changes. Policy-side
// only. Natural behavior on all seeds (competent policy).
//
// PRE-REGISTER (2026-10-22, MEASUREMENT.md 9-12, 14 - BINDING): see
// evidence/2026-10-22/journey-deepening-r32.md. Binding: R1 channel census
// (4 fresh seeds 9941-9944, competent, DAYCAP=100, death-aware stop); R2
// narration sense (report-only); M1 >=3/4 alive; M2 >=6 transcripts,
// 0 senseless. Interesting-finding bar: >=1 landed vector infection (ANYONE)
// with honest narration, OR 0 vector fights on all 4 seeds (dormant), OR
// villagers fighting the same beasts with no infection path while the code
// gates bites to the player (scholar-body design vs oversight — MEASURE,
// don't move; a Steve call).
//
// Usage: SEEDS=9941,9942,9943,9944 node scripts/journey-deepening-r32b-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [9941, 9942, 9943, 9944]);
const DAYCAP = parseInt(process.env.DAYCAP || '100', 10);

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { census, r21Misread } = require('./lib/death-census');

const EVIDIR = path.join(ROOT, 'evidence', '2026-10-22');
const VECTOR_MIDS = ['giant_mosquito', 'alien_tick'];
const VECTOR_STATUSES = ['eurika', 'east_nile', 'lemons', 'tick_attached'];
const VECTOR_LINE_RX = /mosquito|alien_tick|tick|proboscis|latch|eurika|east.?nile|lemons|whine|drunk on blood|questing|mouthparts|mosquito-sense|crow|faceted|pinfeather|engorg/i;

// ---- per-seed globals ----
let capture = [];
let vectorLines = [];
let _G = null;
let _currentSeed = null;
let vectorFights = [];    // every fight (TB or field) vs a vector monster
let vectorBites = [];     // landed mosquito drinks / tick latches (tbDamage filter)
let vectorInfections = [];// applyStatus hits for the 4 vector statuses
let biteVirusCalls = [];  // mosquitoBiteVirus() invocations (scholar channel)
let meatQuirks = [];      // villagerMonsterWeirdness applications (contrast arm)
let deathReg = [];
let transcriptFiles = [];

function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
  if (VECTOR_LINE_RX.test(s) && !(vectorLines.length && vectorLines[vectorLines.length - 1] === s)) {
    vectorLines.push(`[d${gday()}] ${s}`);
  }
}
function waveOf(mid) { try { const d = (_G.data.monsters || []).find(m => m.id === mid); return (d && d.wave) || 1; } catch (e) { return 1; } }
function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return {}; } }
function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function waveNow() { try { return _G.unlockedWave ? _G.unlockedWave() : null; } catch (e) { return null; } }
function scaleNow() { try { return _G.scaleRank ? _G.scaleRank() : null; } catch (e) { return null; } }
function popAlive() { try { return (_G.state.village.roster || []).filter(id => !person(id).dead).length; } catch (e) { return null; } }
function targetDesc(t) {
  try {
    if (t === 'scholar' || (t && t === 'p')) return 'scholar';
    if (t && typeof t === 'object') {
      const nm = t.name || (t.vid && vname(t.vid)) || t.id || '?';
      return String(nm).slice(0, 40);
    }
    return String(t).slice(0, 40);
  } catch (e) { return '?'; }
}
function buildCensus() {
  const roster = (_G.state.village && _G.state.village.roster) || [];
  const trust = (_G.state.village && _G.state.village.trust) || {};
  return roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (_G.plantsKnownBy(id) || []).length; } catch (e) {}
    let statuses = [];
    try {
      const sts = (p.statuses || p.conditions || []);
      statuses = (Array.isArray(sts) ? sts : Object.keys(sts)).map(s => (s && s.id) || String(s)).filter(s => VECTOR_STATUSES.indexOf(s) >= 0);
    } catch (e) {}
    return {
      id, name: vname(id), alive: !p.dead,
      occupation: p.formerOccupation || p.occupation || null,
      trust: (trust[id] !== undefined) ? trust[id] : null,
      plantsKnown: plants, vectorStatuses: statuses,
    };
  });
}

// ---- conversation driver (engage-first, 8 turns; from r30, verbatim behavior) ----
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
  const fp = path.join(EVIDIR, `journey-deepening-r32b-transcript-competent-${_currentSeed}-day${day}${tag || ''}.txt`);
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
  policy.id = 'journey-deepening-r32b-competent';
  return policy;
}

async function runSeed(seed) {
  _currentSeed = seed;
  capture = []; vectorLines = [];
  vectorFights = []; vectorBites = []; vectorInfections = []; biteVirusCalls = []; meatQuirks = [];
  deathReg = []; transcriptFiles = [];
  console.log(`\n########## SEED ${seed} (vector-channel census) ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-deepening-r32', fullTelemetry: true });
  _G = Game;

  // --- text capture (r30 pattern) + vector-filtered buffer (r30 lesson: filter at write time) ---
  const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
  Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  Game.sysSay = function (...a) { cap(a[0]); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }

  // --- applyStatus wrap: the infection census (target, status, source, day) ---
  let applyErr = null;
  try {
    if (typeof Game.applyStatus === 'function') {
      const _as = Game.applyStatus.bind(Game);
      Game.applyStatus = function (target, id, opts) {
        try {
          if (VECTOR_STATUSES.indexOf(String(id)) >= 0) {
            vectorInfections.push({ day: gday(), target: targetDesc(target), id: String(id), source: String((opts && opts.source) || '').slice(0, 120) });
            console.log(`*** VECTOR-INFECTION d${gday()}: ${targetDesc(target)} <- ${id} (src: ${String((opts && opts.source) || '').slice(0, 60)})`);
          }
        } catch (e0) {}
        return _as.apply(this, arguments);
      };
    } else applyErr = 'applyStatus missing';
  } catch (e) { applyErr = 'wrap ERROR: ' + (e && e.message); }

  // --- mosquitoBiteVirus wrap: the scholar-channel call census ---
  try {
    if (typeof Game.mosquitoBiteVirus === 'function') {
      const _mbv = Game.mosquitoBiteVirus.bind(Game);
      Game.mosquitoBiteVirus = function () {
        let r = null;
        try { r = _mbv.apply(this, arguments); } catch (e) { r = 'ERR:' + (e && e.message); }
        biteVirusCalls.push({ day: gday(), result: r });
        console.log(`*** MOSQUITO-BITE-VIRUS d${gday()}: applied=${r}`);
        return r;
      };
    }
  } catch (e) { console.log('mosquitoBiteVirus wrap ERROR: ' + (e && e.message)); }

  // --- tbDamage wrap: landed mosquito drinks / tick latches by target kind ---
  try {
    if (typeof Game.tbDamage === 'function') {
      const _tbd = Game.tbDamage.bind(Game);
      Game.tbDamage = function (key, amount, source, byKey, opts) {
        let landed = null;
        try { landed = _tbd.apply(this, arguments); }
        catch (e) { landed = 'ERR'; }
        try {
          const src = String(source || '');
          if (/drink|latch|feed|proboscis/i.test(src)) {
            const f = Game.tbfight;
            const mons = (f && f.fighters ? f.fighters.filter(x => x && x.kind === 'monster') : [])
              .map(x => ((x.mdef || {}).id) || x.mid || '?');
            if (mons.indexOf('giant_mosquito') >= 0 || mons.indexOf('alien_tick') >= 0) {
              let kind = '?';
              try { const foe = Game.tbFighter ? Game.tbFighter(key) : null; kind = (foe && foe.kind) || (key === 'p' ? 'player' : '?'); }
              catch (e0) { kind = key === 'p' ? 'player' : '?'; }
              vectorBites.push({ day: gday(), source: src.slice(0, 60), targetKey: key, targetKind: kind, landed: landed, monsters: mons });
            }
          }
        } catch (e0) {}
        return landed;
      };
    }
  } catch (e) { console.log('tbDamage wrap ERROR: ' + (e && e.message)); }

  // --- startCombat wrap: TB fights vs vector monsters ---
  try {
    if (typeof Game.startCombat === 'function') {
      const _sc = Game.startCombat.bind(Game);
      Game.startCombat = function (mid) {
        try {
          if (VECTOR_MIDS.indexOf(String(mid)) >= 0) {
            vectorFights.push({ day: gday(), model: 'tb', mid: String(mid), wave: waveOf(mid) });
            console.log(`*** VECTOR-FIGHT(TB) d${gday()}: vs ${mid}`);
          }
        } catch (e0) {}
        return _sc.apply(this, arguments);
      };
    }
  } catch (e) { console.log('startCombat wrap ERROR: ' + (e && e.message)); }

  // --- fieldFight wrap: villager field fights vs vector monsters ---
  try {
    if (typeof Game.fieldFight === 'function') {
      const _ff = Game.fieldFight.bind(Game);
      Game.fieldFight = function (vid, mdef, m, opts) {
        let rec = null;
        try { rec = _ff(vid, mdef, m, opts); } catch (e) { rec = null; }
        try {
          const md = mdef || {};
          if (VECTOR_MIDS.indexOf(String(md.id)) >= 0) {
            vectorFights.push({
              day: gday(), model: 'field', mid: String(md.id), wave: md.wave || 1,
              vid: vid || null, vname: vname(vid),
              outcome: rec ? rec.outcome : null, rounds: rec ? rec.rounds : 0,
              vHpLeft: rec ? rec.vHpLeft : null, mHpLeft: rec ? rec.mHpLeft : null,
              trickLog: ((rec && rec.trickLog) || []).slice(),
              logTail: ((rec && rec.log) || []).slice(-20),
            });
            console.log(`*** VECTOR-FIGHT(FIELD) d${gday()}: ${vname(vid)} vs ${md.id} outcome=${rec ? rec.outcome : 'ERR'}`);
          }
        } catch (e2) {}
        return rec;
      };
    }
  } catch (e) { console.log('fieldFight wrap ERROR: ' + (e && e.message)); }

  // --- villagerMonsterWeirdness wrap: the existing villager alien-pool channel (contrast arm) ---
  try {
    if (typeof Game.villagerMonsterWeirdness === 'function') {
      const _vmw = Game.villagerMonsterWeirdness.bind(Game);
      Game.villagerMonsterWeirdness = function (vid, item, chanceOverride) {
        let r = false;
        try { r = _vmw.apply(this, arguments); } catch (e) { r = 'ERR'; }
        try { if (r === true) meatQuirks.push({ day: gday(), vid: vid || null, vname: vname(vid), item: String((item && (item.name || item.plantId)) || '').slice(0, 60) }); }
        catch (e0) {}
        return r;
      };
    }
  } catch (e) { console.log('villagerMonsterWeirdness wrap ERROR: ' + (e && e.message)); }

  // --- registerDeath wrap: kind-aware death census (r27 lib) ---
  try {
    if (typeof Game.registerDeath === 'function') {
      const _rd = Game.registerDeath.bind(Game);
      Game.registerDeath = function (opts) {
        try {
          const o = opts || {};
          deathReg.push({
            day: gday(), kind: o.kind || '?', cause: o.cause || '?',
            killerId: (o.killerId == null ? null : String(o.killerId)),
            vid: o.villagerId != null ? String(o.villagerId) : null,
            monsterId: o.monsterId != null ? String(o.monsterId) : null,
            who: o.villagerId || o.monsterId || o.name || '?',
            name: o.name || null, player: !!o.player,
          });
        } catch (e0) {}
        return _rd.apply(this, arguments);
      };
    }
  } catch (e) { console.log('registerDeath wrap ERROR: ' + (e && e.message)); }

  await setupGame(Game);
  const policy = makePolicy();
  const result = await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'journey-deepening-r32', date: new Date().toISOString().slice(0, 10), node: process.version } });

  // --- people check: 2 living-villager conversations at days ~45/60/80 ---
  // runDays completed the whole horizon; sample conversations at end-state.
  try {
    const living = ((_G.state.village.roster || []).filter(id => !person(id).dead)).slice(0, 3);
    for (const vid of living) runConversation(result.gameDays, vid, '-probe-' + String(vid).slice(0, 12));
  } catch (e) { console.log('convo sampling ERROR: ' + (e && e.message)); }

  // --- per-seed census: any villager holding vector statuses at end? ---
  const endCensus = buildCensus();
  const vecHolders = endCensus.filter(c => (c.vectorStatuses || []).length > 0);
  let scholarStatuses = [];
  try {
    const s = _G.state.scholar || {};
    const sts = s.statuses || {};
    scholarStatuses = Object.keys(sts).filter(k => VECTOR_STATUSES.indexOf(k) >= 0);
  } catch (e) {}

  // --- death census (r27 kind-aware) ---
  const rosterIds = (((Game.state || {}).village || {}).roster || []);
  const dcFull = census(deathReg, { playerId: 'p', roster: rosterIds });
  const dcWindow = census(deathReg.filter(d => (d.day || 0) >= 40), { playerId: 'p', roster: rosterIds });

  const out = {
    seed, policy: 'competent', maxGameDay: result.gameDays, endReason: result.endReason,
    finalWave: waveNow(), finalScale: scaleNow(),
    // R1: the channel census
    vectorFights, vectorBites, vectorInfections, biteVirusCalls, meatQuirks,
    channelSummary: {
      vectorFightCount: vectorFights.length,
      vectorFightsTB: vectorFights.filter(f => f.model === 'tb').length,
      vectorFightsField: vectorFights.filter(f => f.model === 'field').length,
      mosquitoFights: vectorFights.filter(f => f.mid === 'giant_mosquito').length,
      tickFights: vectorFights.filter(f => f.mid === 'alien_tick').length,
      landedBites: vectorBites.filter(b => typeof b.landed === 'number' && b.landed > 0).length,
      landedBitesOnPlayer: vectorBites.filter(b => typeof b.landed === 'number' && b.landed > 0 && (b.targetKind === 'player' || b.targetKey === 'p')).length,
      landedBitesOnVillager: vectorBites.filter(b => typeof b.landed === 'number' && b.landed > 0 && !(b.targetKind === 'player' || b.targetKey === 'p')).length,
      infectionsTotal: vectorInfections.length,
      infectionsById: vectorInfections.reduce((o, e) => { o[e.id] = (o[e.id] || 0) + 1; return o; }, {}),
      infectionsByTarget: vectorInfections.reduce((o, e) => { o[e.target] = (o[e.target] || 0) + 1; return o; }, {}),
      biteVirusCalls: biteVirusCalls.length,
      meatQuirksVillager: meatQuirks.length,
      villagerVectorHoldersAtEnd: vecHolders.map(c => ({ id: c.id, name: c.name, statuses: c.vectorStatuses })),
      scholarVectorStatusesAtEnd: scholarStatuses,
    },
    applyStatusInstrumentErr: applyErr,
    census: endCensus,
    deathCensus: { full: dcFull, window: dcWindow, windowFloor: 40, r21misreadFull: r21Misread(deathReg), records: deathReg.length },
    deaths: deathReg.map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    transcripts: transcriptFiles,
    pacing: result.pacing || null,
  };
  const fp = path.join(EVIDIR, `journey-deepening-r32b-competent-${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  // vector-filtered lines: full (r30 lesson — filtered at write time, no cap needed)
  try { fs.writeFileSync(path.join(EVIDIR, `journey-deepening-r32b-vectorlines-competent-${seed}.txt`), vectorLines.join('\n')); }
  catch (e) { console.log('vectorlines dump ERROR: ' + (e && e.message)); }
  // main capture: tail 1MB (r30's 1.5MB head-truncate missed late game)
  try {
    let txt = capture.join('\n');
    if (txt.length > 1024 * 1024) txt = '[HEAD TRUNCATED — see vectorlines file for vector narration]\n' + txt.slice(-1024 * 1024);
    fs.writeFileSync(path.join(EVIDIR, `journey-deepening-r32b-capture-competent-${seed}.txt`), txt);
  } catch (e) { console.log('capture dump ERROR: ' + (e && e.message)); }
  const cs = out.channelSummary;
  console.log(`SEED ${seed} DONE: day=${result.gameDays} end=${result.endReason} wave=${waveNow()} pop=${popAlive()} ` +
    `vFights=${cs.vectorFightCount}(tb${cs.vectorFightsTB}/f${cs.vectorFightsField}) mosq=${cs.mosquitoFights} tick=${cs.tickFights} ` +
    `bites=${cs.landedBites}(p${cs.landedBitesOnPlayer}/v${cs.landedBitesOnVillager}) inf=${cs.infectionsTotal} ${JSON.stringify(cs.infectionsById)} ` +
    `mbvCalls=${cs.biteVirusCalls} meatQ=${cs.meatQuirksVillager} -> ${fp}`);
  return out;
}

async function main() {
  const summary = [];
  for (const seed of SEEDS) {
    try { summary.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); summary.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  let totFights = 0, totBites = 0, totInf = 0, totMBV = 0, totMQ = 0, alive = 0;
  for (const s of summary) {
    const cs = s.channelSummary || {};
    totFights += cs.vectorFightCount || 0; totBites += cs.landedBites || 0;
    totInf += cs.infectionsTotal || 0; totMBV += cs.biteVirusCalls || 0; totMQ += cs.meatQuirksVillager || 0;
    if (!s.fatal && s.endReason === 'survived') alive++;
    console.log(`seed ${s.seed}: day=${s.maxGameDay} end=${s.endReason} pop=${(s.census || []).filter(c => c.alive).length}/${(s.census || []).length} ` +
      `vFights=${cs.vectorFightCount || 0} bites=${cs.landedBites || 0}(p${cs.landedBitesOnPlayer || 0}/v${cs.landedBitesOnVillager || 0}) ` +
      `inf=${cs.infectionsTotal || 0} mbv=${cs.biteVirusCalls || 0} meatQ=${cs.meatQuirksVillager || 0}${s.fatal ? ' FATAL: ' + s.fatal : ''}`);
  }
  console.log(`TOTALS: vectorFights=${totFights} landedBites=${totBites} infections=${totInf} biteVirusCalls=${totMBV} meatQuirks=${totMQ} alive=${alive}/${summary.length}`);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
