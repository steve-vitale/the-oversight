#!/usr/bin/env node
// journey-endgame-r6-20261012.js — ENDGAME leg (leg 4): the two food-thesis deeds.
//
// Question: are sentimentTaught + feastSurgeUsed EARNABLE by a competent player?
// Known going in (journey-scale3 2026-10-12, 5 seeds; endgame r3 2026-10-11):
//   - a run reached the table's lesser seat ONE food-thesis deed away
//     (feastSurgeUsed/sentimentTaught unmarked, waves 12/10/5, 14 contests,
//     3 crises, stage 3) — the food-thesis deeds are the binding constraint.
//   - r3: the feast buff "grants but is never used in combat" — the chain
//     breaks somewhere between arming and combat use.
//
//   3b. feastRoad: feast at dusk when the surge is armed (feastseek).
//   3c. drawFaceRoad: the feast's smoke drew a scavenger — face it while
//       feasted (the deed's fight comes to the village; only the encounter
//       lottery is removed, never the fight).
//   3d. feastedHunt: while the buff is live and unused, patrol for a fight
//       instead of sleeping on it (r3's "grants but never used" lesson).
//   4. integrationRoad: system quests, trials, teaching, naming — the
//      integ -> 60+ driver.
//
// Method: the feastseek policy (competent + channel-keepsakes-daily +
// fights-with-abilities + dusk feast when armed) over DAYCAP=140, 6 seeds.
// Gentler than winseek's full courtship machinery (winseek scattered the
// village at day 9 on the smoke seed); this measures the deed chain in
// survival-stable competent play.
//
// Usage: SEEDS=70001,70002 node scripts/journey-endgame-r6-20261012.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [70001, 70002, 70003, 70004, 70005, 70006]);
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);

const { mulberry32, loadGame, setupGame, runDays, driveFights, driveContests } = require('./sim-harness');
const { feastseek } = require('./policies/feastseek');

const EVIDIR = path.join(ROOT, 'evidence', '2026-10-12');

// ---- per-seed globals ----
let capture = [];
let beatLines = [];
let _currentSeed = null;
let _G = null;
let _ctx = null;
function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function tagBeat(line) {
  const s = String(line || '');
  if (/RESONANCE HARMONICS/.test(s)) return 'sentiment-lesson';
  if (/DEMONSTRATION/.test(s)) return 'demo';
  if (/^◈ THE TRIAL/.test(s)) return 'slot60';
  if (/^💛/.test(s)) return 'channel';
  if (/^🍖/.test(s)) return 'feast';
  if (/pads at the edge of the light|beast circling|scavenger/i.test(s)) return 'draw';
  if (/feast.*(fade|dies|cools)|Feasted ends/i.test(s)) return 'buff-fade';
  if (/The table (sits|assembles)|priced|FULL SEAT|LESSER SEAT|not yours/i.test(s)) return 'table';
  return null;
}
function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
  const tag = tagBeat(s);
  if (tag) {
    beatLines.push({ day: gday(), tag, text: s.slice(0, 2500) });
    if (beatLines.length > 4000) beatLines.shift();
  }
}

function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return vid; } }
function pantryKcal() {
  try {
    return ((_G.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || i.count || 1), 0);
  } catch (e) { return 0; }
}
function popAlive() {
  try { return (_G.state.village.roster || []).filter(id => !person(id).dead).length; } catch (e) { return null; }
}
function goInside() {
  try {
    const t = _G.playerTile ? _G.playerTile() : null;
    if (t && t.type === 'haven') {
      const s = _G.state.scholar;
      if (s && !s.insideHaven && !s.insideTent && _G.enterBuilding) _G.enterBuilding();
    }
  } catch (e) {}
}

// ---- the deed chain, read as one object ----
function chainState() {
  const G = _G, s = (G.state || {}).scholar || {};
  let pg = {};
  try { pg = (G.progState && G.progState()) || {}; } catch (e) {}
  let keepsakes = 0;
  try { keepsakes = (s.inventory || []).filter(it => G.isKeepsake && G.isKeepsake(it)).length; } catch (e) {}
  const abs = [...(s.abilities || []), ...(s.backgroundAbilities || [])];
  let buffActive = false, buffUsed = false;
  try { buffActive = !!(G.feastedActive && G.feastedActive()); } catch (e) {}
  try { buffUsed = !!((s.feastBuff || {}).used); } catch (e) {}
  let stage = null;
  try { stage = G.integrationStage ? G.integrationStage() : null; } catch (e) {}
  return {
    day: s.day || 0,
    integ: s.integration || 0, stage, arrived: !!(G.state || {}).systemArrived,
    sentimentTaught: !!pg.sentimentTaught,
    slot60: !!(pg.slotMoments && pg.slotMoments[60]),
    keepsakes,
    channels: (_ctx && _ctx.channels) || 0,
    resonance: pg.surgeResonance || 0,
    maxed: abs.filter(a => (a.level || 1) >= 3).length,
    abTotal: abs.length,
    armed: pg.feastSurge || false,
    feastSurgeUsed: !!pg.feastSurgeUsed,
    buffActive, buffUsed,
    trauma: s.trauma || 0,
    feasts: (_ctx && _ctx.feasts) || 0,
    facedDraw: (_ctx && _ctx.facedDraw) || 0,
    trials: (_ctx && _ctx.trials) || 0,
    taught: (_ctx && _ctx.taught) || 0,
  };
}
const FIRSTS = [
  ['sentimentTaught', 'daySentimentTaught'],
  ['armed', 'dayArmed'],
  ['buffActive', 'dayBuffActive'],
  ['buffUsed', 'dayBuffUsed'],
  ['feastSurgeUsed', 'dayFeastSurgeUsed'],
];
function noteFirsts(ctx) {
  const st = chainState();
  for (const [key, name] of FIRSTS) {
    if (st[key] && !ctx[name]) { ctx[name] = st.day; }
  }
}

// ---- conversation driver (engage-first, 8 turns) — people check ----
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
const CONVO_DAYS = (process.env.CONVO_DAYS ? process.env.CONVO_DAYS.split(',').map(s => parseInt(s, 10)) : [70, 110]);
function runConversation(day, vid) {
  const fp = `/tmp/journey-endgame-r6-transcript-${_currentSeed}-day${day}-${vid}.txt`;
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
    log(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${((_G.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead} mood=${pmood}`);
    const st = chainState();
    log(`chain: integ=${st.integ} stage=${st.stage} sentimentTaught=${st.sentimentTaught} resonance=${st.resonance} maxed=${st.maxed}/${st.abTotal} feastSurgeUsed=${st.feastSurgeUsed}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0})`);
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
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
  }
  let out = L.join('\n');
  if (out.length > 200 * 1024) out = out.slice(0, 200 * 1024) + '\n[TRUNCATED at 200KB]';
  fs.writeFileSync(fp, out);
  return fp;
}

function buildCensus() {
  const roster = (_G.state.village && _G.state.village.roster) || [];
  const trust = (_G.state.village && _G.state.village.trust) || {};
  return roster.map(id => {
    const p = person(id);
    let ax = null;
    try { ax = _G.agencyOf ? _G.agencyOf(id) : null; } catch (e) {}
    return {
      id, name: vname(id), alive: !p.dead,
      occupation: p.formerOccupation || p.occupation || null,
      temperament: (p.personality && p.personality.temperament) || p.temperament || null,
      trust: (trust[id] !== undefined) ? trust[id] : null,
      agencyXP: (ax && typeof ax === 'object' && ax.xp != null) ? ax.xp : (typeof ax === 'number' ? ax : null),
    };
  });
}
function deathsSoFar() {
  try { return (_G.state.telemetry || []).filter(e => e && e.type === 'death'); } catch (e) { return []; }
}

// ---- policy roads (winseek lineage, gentler: no scale courtship) ----

// Face the feast's drawn scavenger while feasted. The smoke's draw is the
// deed's fight delivered to the village — a competent player who armed the
// surge and hosted the feast meets it with blades warm.
function drawFaceRoad(G, ctx) {
  try {
    if (G.over || G.tbfight) return;
    if (!(G.feastDrawPending && G.feastDrawPending())) return;
    if (!(G.feastedActive && G.feastedActive())) return;
    const b = (G.state.scholar || {}).feastBuff || null;
    if (b && b.used) return;
    if (G.faceFeastDraw) G.faceFeastDraw();
    ctx.facedDraw = (ctx.facedDraw || 0) + 1;
  } catch (e) {}
}

// While the feast buff is live and unused, patrol for a fight — the window
// decays at dawn, and r3's lesson was "grants but never used in combat"
// because the policy feasted then slept. A real player who feasts at dusk
// hunts the same night or at first light.
function feastedHuntRoad(G, ctx) {
  try {
    if (G.over || G.tbfight) return;
    if (!(G.feastedActive && G.feastedActive())) return;
    const s = G.state.scholar || {};
    const b = s.feastBuff || null;
    if (b && b.used) return;
    if ((s.kcal || 0) < ((G.kcalCap && G.kcalCap() * 0.4) || 800)) return; // not starving
    const hx = G.map.px, hy = G.map.py;
    const cands = [];
    for (const tt of (G.travelTargets() || [])) {
      let t = null;
      try { t = G.tileAt(tt.x, tt.y); } catch (e) {}
      if (!t || t.type === 'haven') continue;
      let blocked = false;
      try { blocked = !!G.travelBlockage(tt.x, tt.y); } catch (e) {}
      if (blocked) continue;
      cands.push({ x: tt.x, y: tt.y, d: tt.d });
    }
    cands.sort((a, b) => b.d - a.d);
    if (process.env.HUNTTRACE) { try { console.error('[hunt] cands=' + cands.length + ' day=' + (s.day || 0)); } catch (e) {} }
    let sweeps = 0;
    while (!G.over && !G.tbfight && G.feastedActive && G.feastedActive() && sweeps < 2) {
      sweeps++;
      if (process.env.HUNTTRACE) { try { console.error('[hunt] sweep ' + sweeps); } catch (e) {} }
      for (const c of cands.slice(0, 4)) {
        if (G.over || G.tbfight) break;
        if (!(G.feastedActive && G.feastedActive())) break;
        if (process.env.HUNTTRACE) { try { console.error('[hunt] travelTo ' + c.x + ',' + c.y); } catch (e) {} }
        try { G.travelTo(c.x, c.y); } catch (e) { if (process.env.HUNTTRACE) { try { console.error('[hunt] travelTo threw ' + (e && e.message)); } catch (e2) {} } break; }
        if (G.over || G.tbfight) break;
        if (G.map.px !== c.x || G.map.py !== c.y) continue;
        if (process.env.HUNTTRACE) { try { console.error('[hunt] forage @' + c.x + ',' + c.y); } catch (e) {} }
        try { G.doAction('forage', {}); } catch (e) {}
        if (process.env.HUNTTRACE) { try { console.error('[hunt] forage done'); } catch (e) {} }
        if (G.over || G.tbfight) break;
      }
    }
    if (process.env.HUNTTRACE) { try { console.error('[hunt] sweeps done: ' + sweeps); } catch (e) {} }
    ctx.feastedSweeps = (ctx.feastedSweeps || 0) + sweeps;
    if (!G.tbfight) { try { G.travelTo(hx, hy); } catch (e) {} }
  } catch (e) {}
}

// Integration road (winseek lineage): system quests, trials, teaching,
// naming — the honest integ driver. A competent player engaging the System
// is how integration climbs to 60 in play.
function integrationRoad(G, ctx) {
  try {
    const s = G.state.scholar || {};
    if ((s.integration || 0) >= 80) return;
    try {
      const q = s.activeQuest;
      if (q && q.type === 'system_teach' && G.checkQuest) {
        G.checkQuest('teach');
        ctx.sq = (ctx.sq || 0) + 1;
      }
    } catch (e) {}
    try {
      if (G.offerSystemQuest && !s.activeQuest) {
        G.offerSystemQuest('event');
        ctx.sqOffered = (ctx.sqOffered || 0) + 1;
      }
    } catch (e) {}
    try {
      const pg = s.prog || {};
      if (pg.trial && G.completeTrial) {
        G.completeTrial();
        ctx.trials = (ctx.trials || 0) + 1;
      }
    } catch (e) {}
    try {
      const roster = ((G.state.village || {}).roster || []).filter(id => id !== G.villagerId);
      for (const vid of roster.slice(0, 2)) {
        if (G.teachVillager) { G.teachVillager(vid); ctx.taught = (ctx.taught || 0) + 1; break; }
      }
    } catch (e) {}
    try {
      const roster = ((G.state.village || {}).roster || []).filter(id => id !== G.villagerId);
      if (roster.length && G.askAbout) {
        const r = G.askAbout(roster[0], 'namebeast');
        if (r && r.ok && r.naming && r.naming.mid && G.backMonsterName) {
          try { G.backMonsterName(r.naming.mid, r.naming.mid); } catch (e2) {}
          ctx.named = (ctx.named || 0) + 1;
        }
      }
    } catch (e) {}
  } catch (e) {}
}

// ---- policy: feastseek + deed roads + chain instrumentation ----
function makePolicy() {
  const policy = Object.assign({}, feastseek);
  policy.id = 'journey-endgame-r6';
  policy.setup = function (G, ctx) {
    try { feastseek.setup && feastseek.setup(G, ctx); } catch (e) {}
    _ctx = ctx;
    ctx.beatLines = beatLines;
    ctx.chainTrack = [];
    ctx.convoFiles = [];
    ctx._convoDaysDone = {};
    // wrap key deed functions to count + capture full-text beats
    const wrap = (name, tag) => {
      try {
        const orig = G[name];
        if (typeof orig !== 'function') return;
        G[name] = function (...args) {
          const cap0 = beatLines.length;
          let r;
          try { r = orig.apply(this, args); } catch (e) { r = { err: String(e && e.message) }; }
          if (beatLines.length === cap0) {
            // function produced no captured lines — record the call anyway
            beatLines.push({ day: gday(), tag, text: `[${name} called: ${JSON.stringify(args).slice(0, 300)}] -> ${String(r && r.ok !== undefined ? 'ok=' + r.ok : String(r)).slice(0, 300)}` });
          }
          return r;
        };
      } catch (e) {}
    };
    wrap('channelSentiment', 'channel-call');
    wrap('hostFeast', 'feast-call');
    wrap('faceFeastDraw', 'draw-call');
  };
  policy.upkeep = function (G, ctx) {
    if (process.env.DAYTRACE) { try { console.error('[daytrace] upkeep day ' + gday()); } catch (e) {} }
    try { feastseek.upkeep && feastseek.upkeep(G, ctx); } catch (e) {}
    if (!process.env.R6_NO_ROADS) {
      if (!process.env.R6_NO_DRAW) drawFaceRoad(G, ctx);
      if (!process.env.R6_NO_HUNT) feastedHuntRoad(G, ctx);
    }
  };
  policy.daily = function (G, ctx) {
    goInside();
    feastseek.daily(G, ctx);
    if (!process.env.R6_NO_ROADS && !process.env.R6_NO_INTEG) integrationRoad(G, ctx);
    noteFirsts(ctx);
    const day = gday();
    ctx.chainTrack.push(Object.assign({}, chainState()));
    if ([20, 40, 60, 80, 100, 120, 140].includes(day)) {
      let seat = null;
      try { const ts = G.tableSeat ? G.tableSeat() : null; seat = ts && ts.seat; } catch (e) {}
      ctx.checkpoints = ctx.checkpoints || [];
      ctx.checkpoints.push(Object.assign({ seat }, chainState(), { pop: popAlive(), pantry: Math.round(pantryKcal()) }));
    }
    if (CONVO_DAYS.includes(day) && !ctx._convoDaysDone[day]) {
      ctx._convoDaysDone[day] = true;
      try {
        const roster = (_G.state.village.roster || []).filter(id => id !== _G.villagerId);
        const cands = [];
        for (const id of roster) {
          const p = person(id);
          if (p.dead) continue;
          let cnt = -1;
          try { const c0 = _G.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
          cands.push({ id, cnt });
        }
        cands.sort((a, b) => a.cnt - b.cnt);
        for (const c0 of cands.slice(0, 1)) {
          try { ctx.convoFiles.push(runConversation(day, c0.id)); } catch (e) {}
        }
      } catch (e) {}
    }
  };
  policy.fight = function (G, ctx) { try { return feastseek.fight(G, ctx); } catch (e) { return false; } };
  policy.contest = function (G, ctx) { try { return feastseek.contest(G, ctx); } catch (e) { return false; } };
  return policy;
}

async function runSeed(seed) {
  _currentSeed = seed;
  capture = [];
  beatLines = [];
  console.log(`\n########## SEED ${seed} ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-endgame-r6', fullTelemetry: true });
  _G = Game;
  const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
  Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  Game.sysSay = function (...a) { cap(a[0]); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }
  await setupGame(Game);
  const policy = makePolicy();
  const result = await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'journey-endgame-r6', date: new Date().toISOString().slice(0, 10), node: process.version } });
  const ctx = policy._ctx || _ctx || {};
  let lineage = null;
  try { lineage = Game.lineage ? Game.lineage() : null; } catch (e) {}
  const out = {
    seed, maxGameDay: result.gameDays, endReason: result.endReason,
    // firsts: the deed-chain timeline
    firsts: {
      daySentimentTaught: ctx.daySentimentTaught || null,
      dayArmed: ctx.dayArmed || null,
      dayBuffActive: ctx.dayBuffActive || null,
      dayBuffUsed: ctx.dayBuffUsed || null,
      dayFeastSurgeUsed: ctx.dayFeastSurgeUsed || null,
    },
    checkpoints: ctx.checkpoints || [],
    chainTrack: ctx.chainTrack || [],
    beatLines: ctx.beatLines || [],
    census: buildCensus(),
    deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    lineage: lineage || null,
    convoFiles: ctx.convoFiles || [],
    ctxSummary: {
      channels: ctx.channels || 0, feasts: ctx.feasts || 0, facedDraw: ctx.facedDraw || 0,
      patrols: ctx.patrols || 0, fled: ctx.fled || 0,
      trials: ctx.trials || 0, taught: ctx.taught || 0, sq: ctx.sq || 0, sqOffered: ctx.sqOffered || 0,
      named: ctx.named || 0,
      tableAnswers: ctx.tableAnswers || 0, answeredTable: !!ctx.answeredTable,
      contestCalls: ctx.contestCalls || 0,
      timeFreezeCleared: ctx.timeFreezeCleared || 0,
      integ: ctx._integ, sqTot: ctx._sq,
    },
    pacing: result.pacing,
    ms: result.ms,
  };
  const fp = path.join(EVIDIR, `journey-endgame-r6-${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  // also write a slim beat-text file for sense-testing reads
  const beats = (out.beatLines || []).map(b => `--- day ${b.day} [${b.tag}]\n${b.text}`).join('\n');
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r6-${seed}-beats.txt`), beats);
  const cps = (ctx.checkpoints || []).map(c => `d${c.day}:integ${c.integ}/st${c.stage}/res${c.resonance}/max${c.maxed}/arm${!!c.armed}/feasts${c.feasts}/used${c.feastSurgeUsed}/seat:${c.seat}`).join(' ');
  console.log(`SEED ${seed} DONE: day=${result.gameDays} end=${result.endReason} pop=${popAlive()} firsts=${JSON.stringify(out.firsts)}`);
  console.log(`  ${cps} ms=${result.ms} -> ${fp}`);
  return out;
}

async function main() {
  const summary = [];
  for (const seed of SEEDS) {
    try { summary.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); summary.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  for (const s of summary) {
    if (s.fatal) { console.log(`seed ${s.seed}: FATAL ${s.fatal}`); continue; }
    console.log(`seed ${s.seed}: day=${s.maxGameDay} end=${s.endReason} firsts=${JSON.stringify(s.firsts)} pop=${(s.census || []).filter(c => c.alive).length}/${(s.census || []).length}`);
  }
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
