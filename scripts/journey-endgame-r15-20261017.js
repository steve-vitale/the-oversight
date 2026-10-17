#!/usr/bin/env node
// journey-endgame-r15-20261017.js — ENDGAME leg (leg 4), 2026-10-17 playtest loop r15.
// PRE-REGISTERED (MEASUREMENT.md §§9-12, 14 — written before the pilot ran):
//
// Leg question: when a seated run plays its path badly — overreaching on the
//   build beat (stakeFail), refusing every defiant price — does the failure
//   downgrade RESOLVE the story end to end (fail beat -> smaller doors ->
//   weakened path played -> final -> epilogue), never wiping the run, with
//   sensical transcripts? (Queued by r14: "Failure downgrades remain unplayed
//   on real runs — next endgame leg should steer a weak door deliberately.")
//
// Failure instruments (deterministic, from TABLE.md + table-beats.json stakes):
//   feared:      b0 'fire' (terror 3) -> b1 'build' needs terror>=4 -> stakeFail
//   beloved:     b0 'funny' (audience 3) -> b1 'build' needs aud>=4/5 -> stakeFail
//   defiant:     REFUSE-EVERYTHING variant (r14 carried blank): grain/noone/
//                tear/notwice — the dignified walk, unplayed until now
//   assimilated: b0 'kitchens' (self 1) -> b1 'build' needs self>=2 (light) -> stakeFail
//   relay:       b0 'commune' (merge 1) -> b1 'build' needs merge>=2 -> stakeFail
//   defiant in CASCADE mode uses the stakefail variant ('half' -> 'build',
//     dignity 0 < 3/1 both branches) so the cascade can run to rock-bottom.
// Downgrade doors: played COMPETENTLY (drain's normal pick) — the realistic arc
//   is botch-then-recover: overreach on door 1, play the lesser door well.
//   Seed 0 (first pilot seed) runs CASCADE mode: weak driver stays on through
//   downgrades, measuring the rock-bottom plain ending.
//
// Binding metrics (a miss is NO-GO, never re-scored mid-run):
//   M1 reach: >=2/4 pilot seeds sit the seat (door offer answered).
//   M2 doors: the 7-door offer opens with >=1 weak-steerable door
//     (feared/beloved/defiant/assimilated) on >=1 seed.
//   M3 play: >=1 seed completes failure -> downgrade -> done with zero
//     engine errors.
//   M4 people: >=2 failure transcripts sense-read (fail beat + downgrade
//     beats + epilogue), 0 senseless flags.
//   M5 resolved: post-failure the run continues (phase 'done', no wipe,
//     village census real). Crash/softlock = NO-GO.
//
// Interesting-finding bar: a full failure->downgrade->weakened-completion arc
//   end to end; the rock-bottom plain ending (cascade seed); the
//   refuse-everything defiant walk; villagers acknowledging a failed table
//   walk; an outshone epilogue.
//
// Seeds: 8911-8914 pilot (fresh; r14 used 8901-8908). Policy: belongseat =
//   withSeatDrive(withWinDefer(tribfloor belongfeast)); TRIBFLOOR=1 +
//   WINDEFER=1 + FEASTSCALE_R13=1 + BELONG_V3=1; SEATDRIVE default-ON.
//   The weak driver wraps chooseTableOption and redirects door offers,
//   downgrade offers, and challenge-beat answers; finals/audit/conscript
//   beats are left to the landed drain.
// Horizon: DAYCAP=190, death-aware (+10d tail max) via sim-harness.
//
// TOOLING ONLY — no game balance changes. Policy behaves as pinned.
'use strict';
// Env BEFORE any require: belongseek reads BELONG_V3 at module load;
// feastscale gates its feast/devotion layer on FEASTSCALE_R13.
process.env.TRIBFLOOR = '1';
process.env.WINDEFER = '1';
process.env.FEASTSCALE_R13 = '1';
process.env.BELONG_V3 = '1';
// SEATDRIVE unset = default-ON.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-17');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [8911, 8912, 8913, 8914]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '190', 10);
// CASCADE=1: keep the weak driver on through downgrades (rock-bottom run).
// Default (recover mode): downgrade doors play competently via the drain.
const CASCADE = process.env.CASCADE === '1';

const { loadGame, setupGame, runDays } = require('./sim-harness');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');

const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };
function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ---- transcript capture (same as r14) ----
function attachTranscript(G, m) {
  const t = m.trans = { say: [], frames: [], lastFrameSig: null };
  const osay = G.say, osys = G.sysSay;
  const push = (tag, x) => {
    try {
      const s = stripHtml(x).slice(0, 500);
      if (s) t.say.push(`[d${day(G)}] ${tag}: ${s}`);
    } catch (e) {}
  };
  G.say = function (x) { push('SAY', x); try { return osay.call(this, x); } catch (e) {} };
  G.sysSay = function (x) { push('SYS', x); try { return osys.call(this, x); } catch (e) {} };
  return t;
}
function snapshotFrame(G, m) {
  try {
    const s = G.state.scholar || {};
    const tc = s.tableChoices;
    if (!tc || !tc.options || !tc.options.length) return;
    const sig = (tc.frame || '') + '|' + tc.options.map(o => o.id).join(',');
    if (sig === m.trans.lastFrameSig) return;
    m.trans.lastFrameSig = sig;
    m.trans.frames.push({
      day: day(G), frame: tc.frame || '',
      prompt: stripHtml(tc.prompt || '').slice(0, 1200),
      options: tc.options.map(o => `${o.id} :: ${stripHtml(o.label || '').slice(0, 160)}`),
    });
  } catch (e) {}
}

// ---- table ladder / seat instrument (adapted from r14) ----
function attachTable(G, m) {
  const t = m.table = {
    ladder: [], sceneFires: [], doors: [], downgrades: [], failEvents: [],
    failSteer: [], beats: 0, finals: 0,
    seatTakes: [], won: 0, wonDetail: null, teleTable: [],
  };
  const otele = G.tele;
  if (typeof otele === 'function') {
    G.tele = function (ev, data) {
      try {
        if (String(ev).indexOf('table') === 0 || ev === 'overtime_tier') {
          t.teleTable.push({ day: day(G), ev, data: JSON.parse(JSON.stringify(data || {})) });
          if (ev === 'table_won') { t.won = 1; t.wonDetail = data; }
        }
      } catch (e) {}
      return otele.call(this, ev, data);
    };
  }
  const origScene = G.tableScene;
  if (typeof origScene === 'function') {
    G.tableScene = function () {
      try { t.sceneFires.push({ day: day(G) }); } catch (e) {}
      return origScene.apply(this, arguments);
    };
  }
  // instrument failures (tableFail -> downgrade machinery)
  const origFail = G.tableFail;
  if (typeof origFail === 'function') {
    G.tableFail = function (reason) {
      try {
        const T = (G.tableState ? G.tableState() : {}) || {};
        t.failEvents.push({ day: day(G), path: T.path || '?', reason: String(reason).slice(0, 300) });
      } catch (e) {}
      return origFail.apply(this, arguments);
    };
  }
  const origPrompt = G.tablePrompt;
  if (typeof origPrompt === 'function') {
    G.tablePrompt = function (html, options, frame) {
      try {
        t.frames = t.frames || [];
        t.frames.push({
          day: day(G), frame: frame || '',
          prompt: stripHtml(html || '').slice(0, 1500),
          options: (options || []).map(o => `${o.id} :: ${stripHtml(o.label || '').slice(0, 160)}`),
        });
      } catch (e) {}
      return origPrompt.apply(this, arguments);
    };
  }
  return t;
}
function sampleSeat(G) {
  const s = { day: 0, seat: 'none', w1: 0, w2: 0, w3: 0, contests: 0, crises: 0, rank: 'village', stage: 0, foodDeeds: false };
  try { s.day = day(G); } catch (e) {}
  try {
    const r = G.tableSeat ? G.tableSeat() : null;
    if (r) {
      s.seat = r.seat || 'none';
      const d = r.detail || {};
      s.w1 = d.w1 | 0; s.w2 = d.w2 | 0; s.w3 = d.w3 | 0;
      s.contests = d.contestsN | 0; s.crises = d.crisesN | 0;
      s.rank = d.rank || 'village'; s.stage = d.stage | 0; s.foodDeeds = !!d.foodDeeds;
    }
  } catch (e) {}
  return s;
}
function tableSummary(G) {
  const out = { phase: null, path: null, branch: null, doors: [], weakened: 0, ascensions: [], facilitated: null };
  try {
    const pg = (G.progState && G.progState()) || {};
    const T = pg.table || {};
    out.phase = T.phase || null; out.path = T.path || null; out.branch = T.branch || T.band || null;
    out.doors = (T.doors || []).slice(); out.weakened = T.weakened | 0;
  } catch (e) {}
  try {
    const asc = (typeof G.tableAscended === 'function') ? G.tableAscended() : [];
    out.ascensions = asc.map(a => ({ name: a.name || a.id, score: a.score | 0, facilitated: !!a.facilitated }));
  } catch (e) {}
  try {
    const pg = (G.progState && G.progState()) || {};
    out.facilitated = (pg.table && pg.table.facilitated) || null;
  } catch (e) {}
  return out;
}

// ---- the weak driver: deliberate bad play on door 1 ----
// Door priority: failure-instrument doors first, controls after.
const DOOR_PRIORITY = ['feared', 'beloved', 'defiant', 'assimilated', 'relay', 'witness', 'indispensable'];
const coveredDoors = new Set(); // module-global: distinct doors across seeds
function attachWeakDriver(G, m) {
  const origChoose = G.chooseTableOption.bind(G);
  function earnedPaths() {
    try { return (G.tableEarnedPaths() || []).filter(p => p && p.earned); } catch (e) { return []; }
  }
  function pickWeakDoor() {
    const eps = earnedPaths();
    if (!eps.length) return null;
    const uncovered = eps.filter(p => !coveredDoors.has('path:' + p.id));
    const pool = uncovered.length ? uncovered : eps;
    pool.sort((a, b) => {
      const pa = DOOR_PRIORITY.indexOf(a.id), pb = DOOR_PRIORITY.indexOf(b.id);
      const ra = pa < 0 ? 99 : pa, rb = pb < 0 ? 99 : pb;
      return (ra - rb) || ((a.strength | 0) - (b.strength | 0));
    });
    return pool[0];
  }
  function pickWeakDowngrade(offeredIds) {
    // The player can only take an OFFERED door — the engine's tableFail
    // already excludes spent doors (cycle-breaker). Pick the weakest
    // among what's actually on the table.
    let T = {}; try { T = G.tableState ? G.tableState() : {}; } catch (e) {}
    const weakened = T.weakened | 0;
    const byId = {};
    try { for (const p of (G.tableEarnedPaths() || [])) if (p) byId[p.id] = p; } catch (e) {}
    const cands = (offeredIds || [])
      .map(x => String(x).replace(/^downgrade:/, ''))
      .filter(id => byId[id] && byId[id].earned);
    if (!cands.length) return null;
    cands.sort((a, b) => (Math.max(5, (byId[a].strength | 0) - 25 * weakened)) - (Math.max(5, (byId[b].strength | 0) - 25 * weakened)));
    return byId[cands[0]];
  }
  // weakBeatPick: the deliberate bad play. Returns the full option id or null
  // (null = leave the drain's pick alone).
  function weakBeatPick(opts) {
    let T = {}; try { T = G.tableState ? G.tableState() : {}; } catch (e) {}
    if ((T.phase || '') !== 'challenge' || !T.path) return null;
    const path = T.path, branch = T.branch || 'light', beat = T.beat | 0;
    const ids = opts.map(o => String(o.id).replace(/^beat:/, ''));
    const has = (x) => ids.indexOf(x) >= 0;
    let want = null;
    if (path === 'feared') {
      // b0 'fire': terror 3 (dreadfield 2 + 1) -> b1 'build' needs terror>=4 -> stakeFail
      if (beat === 0 && has('fire')) want = 'fire';
      else if (beat === 1 && has('build')) want = 'build';
    } else if (path === 'beloved') {
      // b0 'funny': audience 3 (spotlight 2 + 1) -> b1 'build' needs >=4/5 -> stakeFail
      if (beat === 0 && has('funny')) want = 'funny';
      else if (beat === 1 && has('build')) want = 'build';
    } else if (path === 'defiant') {
      if (CASCADE) {
        // b0 'half': dignity 0 -> b1 'build' needs dignity>=3/1 -> stakeFail (both branches)
        if (beat === 0 && has('half')) want = 'half';
        else if (beat === 1 && has('build')) want = 'build';
      } else {
        // REFUSE-EVERYTHING variant (r14 carried blank): the dignified walk.
        if (has('grain') || has('half')) want = has('grain') ? 'grain' : null;
        else if (has('noone')) want = 'noone';
        else if (has('tear')) want = 'tear';
        else if (has('notwice')) want = 'notwice';
        else if (has('records')) want = 'records';
      }
    } else if (path === 'assimilated') {
      // b0 'kitchens': self 1 (locket 1 + 0) -> b1 'build' needs self>=2 (light) -> stakeFail
      if (beat === 0 && has('kitchens')) want = 'kitchens';
      else if (beat === 1 && has('build')) want = 'build';
    } else if (path === 'relay') {
      // b0 'commune': merge 1 -> b1 'build' needs merge>=2 -> stakeFail
      if (beat === 0 && has('commune')) want = 'commune';
      else if (beat === 1 && has('build')) want = 'build';
    }
    // beats 2+: drain (either failed at b1 or the stake held).
    if (!want) return null;
    const full = opts.find(o => String(o.id).replace(/^beat:/, '') === want);
    return full ? full.id : null;
  }
  G.chooseTableOption = function (id) {
    try {
      const tc = (G.state.scholar || {}).tableChoices;
      const opts = (tc && tc.options) || [];
      if (opts.length) {
        const oids = opts.map(o => String(o.id));
        const allPath = oids.every(x => x.indexOf('path:') === 0);
        const allDown = oids.every(x => x.indexOf('downgrade:') === 0);
        const allFinal = oids.every(x => x.indexOf('final:') === 0);
        if (allPath) {
          const p = pickWeakDoor();
          if (p) {
            coveredDoors.add('path:' + p.id);
            let seatAtPick = 'none';
            try { seatAtPick = (G.tableSeat ? G.tableSeat().seat : 'none') || 'none'; } catch (e) {}
            m.table.doors.push({ day: day(G), door: 'path:' + p.id, strength: p.strength | 0, why: p.why || '', offered: oids, seatAtPick, weak: true, cascade: CASCADE });
            const nid = 'path:' + p.id;
            if (nid !== id) m.table.failSteer.push({ day: day(G), kind: 'door', from: id, to: nid });
            id = nid;
          }
        } else if (allDown) {
          const p = pickWeakDowngrade(oids);
          if (p) {
            let wk = 0; try { wk = (G.tableState ? G.tableState().weakened | 0 : 0); } catch (e) {}
            m.table.downgrades.push({ day: day(G), to: 'downgrade:' + p.id, weakened: wk });
            const nid = 'downgrade:' + p.id;
            if (nid !== id) m.table.failSteer.push({ day: day(G), kind: 'downgrade', from: id, to: nid });
            id = nid;
          }
        } else if (!allFinal) {
          let T = {}; try { T = G.tableState ? G.tableState() : {}; } catch (e) {}
          // In recover mode the weak driver only plays the FIRST door badly;
          // downgrade doors (weakened>=1) play competently via the drain.
          const firstDoorBad = (T.weakened | 0) === 0 || CASCADE;
          if (firstDoorBad) {
            const nid = weakBeatPick(opts);
            if (nid && nid !== id) {
              m.table.failSteer.push({ day: day(G), kind: 'beat', path: T.path || '?', beat: T.beat | 0, from: id, to: nid });
              id = nid;
            }
          }
        }
      }
    } catch (e) { m.table.driverErr = String(e && e.message || e).slice(0, 160); }
    return origChoose.call(G, id);
  };
}

// ---- conversation driver (people check; same as r14) ----
function pickChoice(list, turn) {
  if (!list || !list.length) return null;
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of ['dlg:engage', 'dlg:ask', 'dlg:comfort', 'dlg:share', 'dlg:teach', 'dlg:listen', 'ask:teach_me', 'want:ask']) {
    const c = list.find(x => x && x.id === id); if (c) return c;
  }
  for (const id of ['dlg:encourage', 'dlg:reassure', 'dlg:joke', 'dlg:smalltalk']) {
    const c = list.find(x => x && x.id === id); if (c) return c;
  }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  const stay = list.find(x => x && x.id && x.id !== 'leave' && x.id.indexOf('leave') !== 0);
  if (stay && turn < 5) return stay;
  return list.find(x => x && x.id === 'leave') || null;
}
function runConversation(G, vid, dayNum) {
  const L = [];
  try {
    let cur = G.startConvo(vid);
    if (!cur) { L.push(`(startConvo returned null for ${vid})`); return L; }
    const nm = (() => { try { return G.displayName(vid) || vid; } catch (e) { return vid; } })();
    L.push(`=== day ${dayNum} — conversation with ${nm} ===`);
    L.push(`THEM: ${stripHtml(cur.line || '(no line)')}`);
    let turn = 0;
    while (turn < 12 && cur && !cur.ended) {
      const opts = cur.choices || [];
      const c = pickChoice(opts, turn);
      if (!c) { L.push('(no choice matched — menu exhausted)'); break; }
      L.push(`YOU [${c.id}]: ${stripHtml(c.label || c.id)}`);
      const isLeave = String(c.id).indexOf('leave') === 0;
      try { cur = G.convoTurn(vid, c.id); } catch (e) { L.push(`(convoTurn threw: ${String(e && e.message || e).slice(0, 120)})`); break; }
      if (!cur) { L.push('(convoTurn returned null)'); break; }
      if (cur.ended) { L.push('(conversation ended)'); break; }
      L.push(`THEM: ${stripHtml(cur.line || '(no line)')}`);
      if (isLeave) break;
      turn++;
    }
    L.push(`(turns: ${turn})`);
  } catch (e) { L.push(`(conversation failed: ${String(e && e.message || e).slice(0, 160)})`); }
  return L;
}
function census(G) {
  try {
    return (G.state.village.roster || []).map(id => {
      let p = {}; try { p = G.getPerson(id) || {}; } catch (e) {}
      let nm = id; try { nm = G.displayName(id) || id; } catch (e) {}
      return { name: nm, alive: !p.dead, occ: p.formerOccupation || p.occupation || null };
    });
  } catch (e) { return []; }
}

async function runOne(seed) {
  const pid = 'belongseat-tablefail';
  // Recomposed daily: seatdrive's driveSeat OPENS the 7-door offer inside
  // base.daily; the weak driver (chooseTableOption wrapper) redirects the
  // door, downgrade, and challenge-beat answers; the windefer drain answers
  // everything else exactly like the landed stack. Correct order:
  // driveSeat -> drain (driver intercepts inside chooseTableOption).
  const TF = require('./policies/tribfloor');
  const drainBase = WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer',
    'belongfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base');
  const myDaily = (G, ctx) => {
    const m = ctx._r15m;
    try { SD.driveSeat(G, ctx); } catch (e) { if (m) m.table.seatDriveErr = String(e && e.message || e).slice(0, 160); }
    return drainBase.daily(G, ctx);
  };
  // Object.assign copies setup/upkeep/fight/contest from the landed stack —
  // only daily is overridden (r14 fix: a bare {id,desc,daily} dropped the
  // fight/upkeep verbs and all four villages died).
  const policy = Object.assign({}, SD.belongseat, {
    id: pid,
    desc: 'belongseat recomposed (driveSeat -> weak-driver -> windefer drain): at the 7-door offer pick the weakest uncovered failure-instrument door; play door 1 badly (stakeFail/refuse), downgrades competently (recover) or badly (cascade)',
    daily: myDaily,
  });
  const { Game } = await loadGame({ seed, mode: 'endgame-r15-' + pid });
  await setupGame(Game);
  const m = { ctx: null };
  attachTranscript(Game, m);
  attachTable(Game, m);
  attachWeakDriver(Game, m);
  const ctx = { _r15m: m };
  const rungHistory = [];
  const wrappedDaily = policy.daily;
  policy.daily = (G, c2) => {
    c2._r15m = m;
    const d = day(G);
    try {
      const pg = (G.progState && G.progState()) || {};
      if (pg.tableWaiting && !m.table.waitingEver) { m.table.waitingEver = true; m.table.waitingDay = d; }
      if (pg.table && pg.table.phase === 'done' && m.table.doneDay == null) m.table.doneDay = d;
      if (pg.table && pg.table.phase === 'downgrade' && m.table.downgradeDay == null) m.table.downgradeDay = d;
      snapshotFrame(G, m);
    } catch (e) {}
    if (d % 10 === 0 || (d >= 80 && d % 5 === 0)) {
      const s = sampleSeat(G);
      m.table.ladder.push(s);
      if (s.seat !== 'none') rungHistory.push({ day: d, seat: s.seat, detail: `${s.w1}/${s.w2}/${s.w3}w c${s.contests} cr${s.crises} ${s.rank} st${s.stage} fd${s.foodDeeds ? 1 : 0}` });
    }
    // PEOPLE CHECK at day 80 (pre-table): two full villager conversations.
    if (d === 80 && !m.convosDone) {
      m.convosDone = true;
      try {
        const living = (G.state.village.roster || []).filter(id => { try { return !(G.getPerson(id) || {}).dead; } catch (e) { return false; } });
        const scholarId = G.villagerId;
        const others = living.filter(id => id !== scholarId).slice(0, 2);
        m.convos = [];
        for (const vid of others) m.convos.push(runConversation(G, vid, d));
      } catch (e) { m.convos = [['(people check failed: ' + String(e && e.message || e).slice(0, 160) + ')']]; }
    }
    return wrappedDaily(G, c2);
  };
  const result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 });
  const convos = m.convos || [['(people check never ran — run ended before day 80)']];
  const tsum = tableSummary(Game);
  const order = { none: 0, lesser: 1, full: 2 };
  let best = 'none';
  for (const s of m.table.ladder) if ((order[s.seat] || 0) > (order[best] || 0)) best = s.seat;
  let bestRank = 'village';
  for (const s of m.table.ladder) {
    const ro = { village: 0, regional: 1, national: 2, global: 3 };
    if ((ro[s.rank] || 0) > (ro[bestRank] || 0)) bestRank = s.rank;
  }
  const out = {
    label: 'journey-endgame-r15', policy: pid, seed, cascade: CASCADE,
    days: result.days, endReason: result.endReason,
    seatBest: best, bestRank, sceneFired: m.table.sceneFires.length, sceneFireDays: m.table.sceneFires.map(x => x.day),
    waitingEver: !!m.table.waitingEver, waitingDay: m.table.waitingDay || null,
    doneDay: m.table.doneDay != null ? m.table.doneDay : null,
    downgradeDay: m.table.downgradeDay != null ? m.table.downgradeDay : null,
    doors: m.table.doors, downgrades: m.table.downgrades,
    failEvents: m.table.failEvents, failSteer: m.table.failSteer,
    driverErr: m.table.driverErr || null, seatDriveErr: m.table.seatDriveErr || null,
    won: m.table.won, wonDetail: m.table.wonDetail,
    table: tsum,
    teleTable: m.table.teleTable,
    rungHistory, ladder: m.table.ladder.filter((_, i) => i % 2 === 0),
    census: census(Game),
    deaths: (result.samples && result.samples.deaths) || [],
    ms: result.ms,
  };
  const fp = path.join(EVIDIR, `journey-endgame-r15-${pid}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  const tx = [];
  tx.push(`# journey-endgame-r15 table transcript — seed ${seed} (${pid}${CASCADE ? ', CASCADE' : ''})`);
  tx.push(`days=${out.days} end=${out.endReason} seat=${out.seatBest} doors=${JSON.stringify(out.doors.map(d => d.door))} fails=${out.failEvents.length} downgrades=${JSON.stringify(out.downgrades.map(d => d.to))} done=${out.doneDay != null ? 'd' + out.doneDay : '—'} won=${out.won} finalpath=${tsum.path || '—'}/${tsum.branch || '—'} weakened=${tsum.weakened} asc=${tsum.ascensions.length}`);
  tx.push('');
  tx.push('## frames (audit / door offer / beats / finals / epilogue prompts)');
  for (const f of (m.table.frames || [])) {
    tx.push(`--- d${f.day} [${f.frame}] ---`);
    tx.push(f.prompt);
    for (const o of f.options) tx.push(`  > ${o}`);
    tx.push('');
  }
  tx.push('## table say/sysSay lines');
  tx.push(m.trans.say.join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r15-transcript-s${seed}.txt`), tx.join('\n'));
  const cx = [`# journey-endgame-r15 conversations — seed ${seed}`, ''];
  for (const c of convos) { cx.push(c.join('\n')); cx.push(''); }
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r15-convos-s${seed}.txt`), cx.join('\n'));
  const pop = out.census.filter(c => c.alive).length;
  console.log(`[s${seed}] d=${out.days} ${out.endReason} seat=${out.seatBest} scene=${out.sceneFired}x doors=${JSON.stringify(out.doors.map(d => d.door))} fails=${out.failEvents.length} downgrades=${JSON.stringify(out.downgrades.map(d => d.to))} done=${out.doneDay != null ? 'd' + out.doneDay : '—'} won=${out.won} path=${tsum.path || '—'}/${tsum.branch || '—'} weak=${tsum.weakened} pop=${pop}/${out.census.length} ms=${out.ms}`);
  return out;
}

async function main() {
  const rows = [];
  for (const seed of SEEDS) {
    try { rows.push(await runOne(seed)); }
    catch (e) { console.log(`[s${seed}] FATAL: ` + (e && e.stack || e)); rows.push({ seed, fatal: String(e && e.message || e) }); }
  }
  const agg = (fn) => rows.reduce((t, r) => t + (fn(r) || 0), 0);
  const seated = agg(r => (r.doors && r.doors.length) ? 1 : 0);
  const failed = agg(r => (r.failEvents && r.failEvents.length) ? 1 : 0);
  const downgraded = agg(r => (r.downgrades && r.downgrades.length) ? 1 : 0);
  const resolved = agg(r => ((r.table && r.table.phase === 'done') || r.won) && (r.failEvents && r.failEvents.length) ? 1 : 0);
  console.log(`\n=== journey-endgame-r15 PILOT ${CASCADE ? '(CASCADE)' : '(RECOVER)'} === seeds=[${SEEDS.join(',')}] days=${DAYS}`);
  console.log(`seated ${seated}/${rows.length} failed ${failed}/${rows.length} downgraded ${downgraded}/${rows.length} failure-resolved ${resolved}/${rows.length} won ${agg(r => r.won ? 1 : 0)}/${rows.length}`);
  console.log(`M1 reach (>=2/4 seated): ${seated >= 2 ? 'GO' : 'NO-GO'}`);
  console.log(`M2 doors (>=1 weak-steerable door): ${agg(r => r.doors && r.doors.some(d => /feared|beloved|defiant|assimilated/.test(d.door)) ? 1 : 0) >= 1 ? 'GO' : 'NO-GO'}`);
  console.log(`M3 play (>=1 failure->downgrade->done, no engine errors): ${resolved >= 1 && !agg(r => r.fatal || r.driverErr ? 1 : 0) ? 'GO' : 'NO-GO'}`);
  console.log(`M5 resolved (failures resolve, no crash): ${!agg(r => r.fatal ? 1 : 0) ? 'GO' : 'NO-GO'}`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
