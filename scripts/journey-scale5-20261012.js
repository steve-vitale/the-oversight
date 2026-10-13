#!/usr/bin/env node
// journey-scale5-20261012.js — SCALE leg r5 (staged methodology, MEASUREMENT.md §§9-12).
//
// PRE-REGISTRATION (2026-10-12, run 20:45 CDT; stale-lock recovery of the dead run_id 2026-10-13T00:26:21Z):
// - Question: the dead run's scalecourt pilot (seeds 60001-60004, covenant-road) formed
//   ZERO links and proposed ZERO — was the scale on-ramp even visible on those seeds?
//   (a) Do rumors fire in the sim-harness day loop (sleep()->endDay path) and produce
//       KNOWN villages, the prerequisite for every proposal? (DIAG mode, days 1-40)
//   (b) Does winseek (multi-road: proposeLink-as-subordinate, covenant, bidForPrimacy)
//       reach regional/national on the SAME seeds? If the seeds are fine and scalecourt
//       simply courts too passively, that's a policy finding. If the seeds have no
//       discoverable neighbors at all, that's a world-gen/on-ramp finding.
// - Primary metric: national reached by day <=90 (binary per seed).
// - Secondary: regional reached (day), links formed, proposals made, decline/accept text.
// - GO/interesting: >=1 national in 4 winseek runs -> on-ramp open (convergence axis moves).
//   0/4 with a NEWLY-mapped mechanical wall (rumors never fire / candidates never known /
//   proposals silently fail) -> interesting (feeds flesh-out lever work + a blank filled).
//   0/4 with the same food wall as r4 (scale3) -> confirming; document and move on.
// - Horizon: 140d cap; death-aware (harness stops at pop-zero / Game.over — never tick
//   a dead village). Rationale: leg window 80-140, national designed ~d65-90.
// - Seeds: 60001,60002,60003,60004 (same as the dead run's scalecourt baseline -> direct
//   comparability; scalecourt evidence read from the dead run's untracked JSONs, read-only).
// - Policies: winseek (BASE). Fight/contest drivers = journey-deepening r5/r7 lineage
//   (flee-boxed-safe, standoff-aware) for BOTH comparison legs, so comparison isolates
//   courtship, not fight skill.
// - People check: day 85/105/125 conversations, sense-read (SENSE-TESTING LAW).
//   Conversations must have meaning: the NPC wants something, options engage/deflect,
//   endings resolve/plant/owe. No fabricated shared history, no filler loops.
//
// Usage:
//   DIAG=1 node scripts/journey-scale5-20261012.js            # days 1-40, rumor/knowledge log
//   POLICY=winseek node scripts/journey-scale5-20261012.js    # full 140d legs
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [60001, 60002, 60003, 60004]);
const DAYCAP = parseInt(process.env.DAYCAP || (process.env.DIAG ? '40' : '140'), 10);
const POLICY_ID = process.env.POLICY || 'winseek';
const DIAG = !!process.env.DIAG;
const CONVO_DAYS = (process.env.CONVODAYS || '85,105,125').split(',').map(s => parseInt(s, 10));

const { mulberry32, loadGame, setupGame, runDays, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');
const BASE = POLICY_ID === 'winseek'
  ? require('./policies/winseek').winseek
  : require('./policies/scalecourt').scalecourt;

const EVIDIR = path.join(ROOT, 'evidence', '2026-10-12');

// ---- per-seed globals ----
let capture = [];
let _currentSeed = null;
let _G = null;
function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
}

function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return {}; } }
function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function scaleNow() { try { return _G.scaleRank ? _G.scaleRank() : null; } catch (e) { return null; } }
function pantryKcal() {
  try {
    return ((_G.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || i.count || 1), 0);
  } catch (e) { return 0; }
}
function popAlive() {
  try { return ((_G.state.village.roster || []).filter(id => !person(id).dead)).length; } catch (e) { return null; }
}
function viewership() { try { return (_G.havenViewership ? _G.havenViewership() : 0) || 0; } catch (e) { return 0; } }
function tableSeat() { try { return _G.tableSeat ? _G.tableSeat() : null; } catch (e) { return null; } }
function linksActive() {
  try {
    const ls = _G.hierarchyState ? _G.hierarchyState() : [];
    return ls.filter(l => l && l.status === 'active').length;
  } catch (e) { return 0; }
}
function foreignPolityCount() {
  try {
    const fp = _G.foreignPolities ? _G.foreignPolities() : [];
    return Array.isArray(fp) ? fp.length : 0;
  } catch (e) { return 0; }
}
function nationalLive() { try { return !!_G.state.nationalLive; } catch (e) { return false; } }
function globalLive() { try { return !!_G.state.globalLive; } catch (e) { return false; } }
function waveNow() { try { return _G.unlockedWave ? _G.unlockedWave() : null; } catch (e) { return null; } }

// ---- DIAG: village-knowledge state snapshot ----
function diagKnowledge() {
  const out = { day: gday(), otherVillages: 0, known: 0, rumored: 0, generated: 0, rumorQueue: 0, names: [] };
  try {
    const ovs = (_G.state.otherVillages || []);
    out.otherVillages = ovs.length;
    out.rumorQueue = ((_G.state.scholar || {}).rumors || []).length;
    for (const v of ovs) {
      if (!v || v.id === 'haven') continue;
      const known = _G.knowsVillage ? _G.knowsVillage(v) : false;
      if (known) { out.known++; out.names.push(v.name + (v.rumored && !v.generated ? '(rumor)' : v.generated ? '(seen)' : '')); }
      if (v.rumored) out.rumored++;
      if (v.generated) out.generated++;
    }
  } catch (e) { out.err = String(e && e.message); }
  return out;
}

// ---- goInside: travelTo leaves the scholar outside the hall ----
function goInside() {
  try {
    const t = _G.playerTile ? _G.playerTile() : null;
    if (t && t.type === 'haven') {
      const s = _G.state.scholar;
      if (s && !s.insideHaven && !s.insideTent && _G.enterBuilding) _G.enterBuilding();
    }
  } catch (e) {}
}

// ---- fight driver (journey-deepening r5/r7 lineage: flee-boxed-safe, standoff-aware) ----
function finalizeFight(ctx) {
  const rec = ctx._fr;
  ctx._fr = null;
  if (!rec) return;
  try {
    const f = rec.obj;
    rec.rounds = f.round;
    rec.result = f.result;
    rec.over = !!f.over;
    const slice = capture.slice(rec.capStart).join('\n');
    rec.dmgLines = (slice.match(/\(\d+ damage\)/g) || []).length;
    for (const m of rec.monsters) {
      const w = m.wave || 1;
      ctx.fightsByWave = ctx.fightsByWave || {};
      ctx.fightsByWave[w] = (ctx.fightsByWave[w] || 0) + 1;
    }
    ctx.fightsLog.push(rec);
  } catch (e) {
    ctx.fightsLog.push({ id: rec.id, err: String(e && e.message), monsters: rec.monsters });
  }
}
function fightPolicy(G, ctx) {
  try {
    driveFights._orig = driveFights._orig || null;
  } catch (e) {}
  // default driveFights handles it; we just observe via wrap below
  return null;
}
function contestPolicy(G, ctx) {
  return null;
}

// ---- conversation driver (engage-first, 8 turns; pattern from the journey-scale4
// dead run's proven driver — startConvo/r.choices/endConvo, NOT talkTo) ----
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass'];
function pickChoice(choices, turn) {
  const list = choices || [];
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of ENGAGE2) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}
function runConversation(day, vid) {
  const fp = `/tmp/journey-scale5-transcript-${_currentSeed}-${POLICY_ID}-day${day}.txt`;
  const L = [];
  const log = (s) => L.push(s);
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = _G.startConvo(vid);
    const c = _G.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== seed ${_currentSeed} day ${day} — conversation with ${nm} (${vid}) ===`);
    let pmood = '?';
    try { pmood = _G.npcMood ? _G.npcMood(vid) : '?'; } catch (e) {}
    log(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${((_G.state.village.trust || {})[vid] != null ? _G.state.village.trust[vid] : '?')} dead=${!!p.dead} mood=${pmood} scale=${scaleNow()}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0}${want.fromSeed ? ', fromSeed' : ''})`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
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
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = _G.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = _G.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    log(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
    const t = (c2 && c2.transcript) || [];
    const themLines = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themLines.filter((x, i) => themLines.indexOf(x) !== i);
    if (dupes.length) log(`!! VERBATIM REPEATS: ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`);
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
  }
  let out = L.join('\n');
  if (out.length > 200 * 1024) out = out.slice(0, 200 * 1024) + '\n[TRUNCATED at 200KB]';
  fs.writeFileSync(fp, out);
  return fp;
}

function deathsSoFar() {
  try {
    return (Game_global().state.telemetry || []).filter(ev => ev.type === 'death')
      .map(ev => ({ day: ev.day, who: ev.who, cause: ev.cause }));
  } catch (e) { return []; }
}
function Game_global() { return _G; }

function buildCensus() {
  const census = { seed: _currentSeed, day: gday(), scale: scaleNow(), alive: [], dead: [] };
  try {
    const roster = (_G.state.village.roster || []);
    for (const id of roster) {
      const p = person(id);
      const rec = {
        name: vname(id), occ: p.occupationId || p.formerOccupation || '?',
        dead: !!p.dead, dayDied: p.dayDied || null, cause: p.deathCause || null,
        skills: p.skills ? Object.keys(p.skills).length : 0,
      };
      (p.dead ? census.dead : census.alive).push(rec);
    }
  } catch (e) { census.err = String(e && e.message); }
  return census;
}

function makePolicy() {
  const policy = Object.assign({}, BASE);
  policy.id = 'journey-scale5-' + POLICY_ID;
  policy.setup = function (G, ctx) {
    try { BASE.setup && BASE.setup(G, ctx); } catch (e) {}
    try { competent.setup && competent.setup(G, ctx); } catch (e) {}
    policy._ctx = ctx;
    ctx.fightsLog = [];
    ctx.scaleBeats = [];      // {day, beat, how, scale, text:[lines]}
    ctx.scaleTrack = [];      // per-day: scale, viewership, links, pantry, pop, wave
    ctx.checkpoints = [];
    ctx._fr = null;
    ctx.convoFiles = [];
    ctx.diagLog = [];
    installBeatWraps(_G, ctx);
  };
  policy.upkeep = function (G, ctx) {
    goInside();
    try { BASE.upkeep && BASE.upkeep(G, ctx); } catch (e) {}
  };
  policy.daily = function (G, ctx) {
    goInside();
    // BASE.daily runs competent.daily + the policy's courtship behavior
    // (scalecourt.daily: covenant-road courtship; winseek.daily: climb +
    // diplomacy + table roads). The dead run's script shadowed daily WITHOUT
    // calling BASE.daily — its "0 proposals" result measured a competent-only
    // village, not the covenant road. This wrapper MUST call BASE.daily.
    try { BASE.daily && BASE.daily(G, ctx); } catch (e) {}
    const day = gday();
    if (DIAG) {
      // daily knowledge snapshot — the on-ramp prerequisite
      const k = diagKnowledge();
      k.proposed = ctx.proposed || 0; k.proposedPeer = ctx.proposedPeer || 0;
      k.courtCounters = ctx.courtCounters || 0; k.courtAccords = ctx.courtAccords || 0;
      k.pantry = Math.round(pantryKcal()); k.pop = popAlive(); k.scale = scaleNow();
      ctx.diagLog.push(k);
    }
    if (!DIAG) {
      ctx.scaleTrack.push({
        day, scale: scaleNow(), vw: viewership(), links: linksActive(),
        foreign: foreignPolityCount(), pantry: Math.round(pantryKcal()), pop: popAlive(), wave: waveNow(),
        national: nationalLive(), global: globalLive(),
      });
      if ([40, 60, 80, 100, 120, 140].includes(day)) {
        let seat = null, seatDetail = null;
        try { const s = tableSeat(); seat = s && s.seat; seatDetail = s && s.detail; } catch (e) {}
        let crisesN = null, foodDeeds = null, sentimentTaught = null;
        try {
          const ps = G.progState ? G.progState() : null;
          crisesN = ps && ps.crises ? Object.keys(ps.crises).length : 0;
          foodDeeds = !!(ps && ps.sentimentTaught && G.state.scholar && G.state.scholar.prog && G.state.scholar.prog.feastSurgeUsed);
          sentimentTaught = !!(ps && ps.sentimentTaught);
        } catch (e) {}
        ctx.checkpoints.push({
          day, scale: scaleNow(), viewership: viewership(), links: linksActive(),
          foreignPolities: foreignPolityCount(), pantry: Math.round(pantryKcal()), pop: popAlive(),
          wave: waveNow(), national: nationalLive(), global: globalLive(),
          seat, seatDetail,
          crisesN, foodDeeds, sentimentTaught,
          crisesKinds: (function () { try { return Object.keys((G.progState() || {}).crises || {}); } catch (e) { return []; } })(),
          wavesFaced: (function () { try { const d2 = G.deedState ? G.deedState() : null; return d2 && d2.wavesFaced ? JSON.parse(JSON.stringify(d2.wavesFaced)) : null; } catch (e) { return null; } })(),
          contestsSurvived: (function () { try { const d2 = G.deedState ? G.deedState() : null; return d2 && d2.contestsSurvived; } catch (e) { return null; } })(),
          integrationStage: (function () { try { return G.integrationStage ? G.integrationStage() : null; } catch (e) { return null; } })(),
        });
      }
      if (CONVO_DAYS.includes(day)) {
        let vid = null;
        try {
          const roster = (_G.state.village.roster || []).filter(id => id !== _G.villagerId);
          for (const id of roster) {
            const p = person(id);
            if (p.dead) continue;
            try { const comm = _G.npcComm ? _G.npcComm(id) : { level: 'full' }; if (comm.level === 'none') continue; } catch (e) {}
            let cnt = -1;
            try { const c0 = _G.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
            if (cnt < 2) { vid = id; break; }
          }
          if (!vid && roster.length) vid = roster.find(id => !person(id).dead) || null;
        } catch (e) {}
        if (vid) {
          try { ctx.convoFiles.push(runConversation(day, vid)); } catch (e) {}
        }
      }
    }
  };
  policy.fight = function (G, ctx) { return fightPolicy(G, ctx); };
  policy.contest = function (G, ctx) { return contestPolicy(G, ctx); };
  return policy;
}

// Wrap the scale-beat answering paths so beat TEXT is captured (sense testing).
function installBeatWraps(G, ctx) {
  const watch = (name, fnName) => {
    try {
      const orig = G[fnName];
      if (typeof orig !== 'function') return;
      G[fnName] = function (...args) {
        const cap0 = capture.length;
        let r;
        try { r = orig.apply(this, args); } catch (e) { r = { err: String(e && e.message) }; }
        const text = capture.slice(cap0, cap0 + 40).filter(s => s && s.trim());
        ctx.scaleBeats.push({ day: gday(), beat: name, args: args.map(a => String(a)).slice(0, 3), scale: scaleNow(), text });
        return r;
      };
    } catch (e) {}
  };
  watch('accord', 'answerAccord');
  watch('counter', 'answerCounter');
  watch('national', 'answerNationalChoice');
  watch('global', 'answerGlobalChoice');
  watch('link-propose', 'proposeLink');
  watch('covenant-propose', 'proposeCovenant');
  watch('trade-propose', 'proposeTrade');
  watch('primacy-bid', 'bidForPrimacy');
}

async function runOne(seed) {
  _currentSeed = seed;
  capture = [];
  const { Game } = await loadGame({ seed, mode: 'journey-scale5-' + POLICY_ID });
  _G = Game;
  // capture displayed text for beat sense-testing
  const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
  Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  Game.sysSay = function (...a) { cap(a[0]); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }
  try { await setupGame(Game); } catch (e) {
    return { seed, err: 'setup: ' + e.message };
  }
  const policy = makePolicy();
  const result = await runDays(Game, policy, {
    days: DAYCAP,
    manifest: { seed, mode: 'journey-scale5-' + POLICY_ID, date: new Date().toISOString().slice(0, 10), node: process.version },
  });
  if (policy._ctx && policy._ctx._fr) finalizeFight(policy._ctx);
  const ctx = policy._ctx || {};
  // LINKTABLE=1: dump the hierarchy link table + village opinion table at end
  // (diagnoses the national-gate: which links are seasoned, trust levels).
  let linkTable = null, villageTable = null;
  if (process.env.LINKTABLE) {
    try {
      linkTable = (Game.hierarchyState ? Game.hierarchyState() : []).map(l => ({
        id: l.id, kind: l.kind, status: l.status, primary: l.primary, subordinate: l.subordinate,
        day: l.day, trust: l.trust, a: l.a, b: l.b,
      }));
    } catch (e) { linkTable = { err: String(e && e.message) }; }
    try {
      villageTable = ((Game.state.otherVillages || []) || []).filter(v => v && v.id !== 'haven').map(v => ({
        id: v.id, name: v.name, opinion: v.opinion, rumored: !!v.rumored, generated: !!v.generated,
        known: Game.knowsVillage ? !!Game.knowsVillage(v) : null,
      }));
    } catch (e) { villageTable = { err: String(e && e.message) }; }
  }
  const out = {
    seed, policy: POLICY_ID,
    ms: result.ms,
    maxGameDay: result.gameDays,
    endReason: result.endReason,
    finalScale: scaleNow(),
    deaths: (result.samples.deaths || []),
    census: buildCensus(),
    fightsTotal: (ctx.fightsLog || []).length,
    fightsByWave: ctx.fightsByWave || {},
    ctxSummary: {
      struck: ctx.struck, fled: ctx.fled,
      courtAccords: ctx.courtAccords, courtCounters: ctx.courtCounters,
      courtNational: ctx.courtNational, courtGlobal: ctx.courtGlobal,
      proposed: ctx.proposed, proposedPeer: ctx.proposedPeer,
      primacyBids: ctx.primacyBids, defenseCalls: ctx.defenseCalls,
      tributePaid: ctx.tributePaid, poolPaid: ctx.poolPaid, tradeCalls: ctx.tradeCalls,
      covenantCrises: ctx.covenantCrises, demands: ctx.demands,
    },
  };
  if (DIAG) {
    out.diagLog = ctx.diagLog;
  } else {
    out.checkpoints = ctx.checkpoints;
    out.scaleBeats = (ctx.scaleBeats || []).map(b => ({
      day: b.day, beat: b.beat, args: b.args, scale: b.scale,
      text: (b.text || []).join('\n').slice(0, 4000),
    }));
    out.scaleTrack = ctx.scaleTrack;
    out.scaleDays = (ctx.scaleTrack || []).reduce((m, r) => { m[r.scale] = (m[r.scale] || 0) + 1; return m; }, {});
    out.convoFiles = ctx.convoFiles;
    out.wavesFaced = (function () { try { const d2 = _G.deedState ? _G.deedState() : null; return d2 && d2.wavesFaced; } catch (e) { return null; } })();
    out.wave = waveNow();
    out.pacing = result.pacing;
    if (process.env.LINKTABLE) { out.linkTable = linkTable; out.villageTable = villageTable; }
  }
  const fname = DIAG
    ? `journey-scale5-${seed}-diag.json`
    : `journey-scale5-${seed}-${POLICY_ID}.json`;
  fs.writeFileSync(path.join(EVIDIR, fname), JSON.stringify(out, null, 1));
  return { seed, days: result.gameDays, end: result.endReason, scale: scaleNow(), ms: result.ms };
}

(async () => {
  for (const seed of SEEDS) {
    try {
      const r = await runOne(seed);
      console.log(JSON.stringify(r));
    } catch (e) {
      console.log(JSON.stringify({ seed, err: String((e && e.stack) || e).slice(0, 300) }));
    }
  }
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
