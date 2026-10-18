#!/usr/bin/env node
// journey-endgame-r16-20261018.js — ENDGAME leg (leg 4), 2026-10-17/18 playtest loop r16.
// PRE-REGISTERED (MEASUREMENT.md §§9-12, 14 — written before the pilot ran):
//
// Leg question: once the Table is ANNOUNCED (day 90+), is WAITING a real
//   choice for a competent player? The overtime design (Steve 2026-10-14:
//   "waiting should have a cost — but also an opportunity for the truly
//   powerful") says a village can spend unseated weeks building power/deeds
//   while RERUN-scaled waves, faster raids and a degrading seat price eat
//   them. Does a 3-tier wait ever SIT STRONGER than sitting at dawn, or does
//   sitting immediately always dominate? (Open tuning question from r13.)
//
// Arms (paired seeds, identical base stack — only the sit timing differs):
//   CONTROL = sit-now: seatdrive default (tableTakeSeat the dawn it's ready)
//   WAIT    = hold the seat 21 days (3 overtime tiers) after first
//             announcement, keep playing the identical competent base, then sit.
//   The wait is a policy gate on SD.driveSeat only — winseek's tableRoad
//   only drains modals and never sits, so no other verb is suppressed.
//
// Binding metrics (a miss is NO-GO, never re-scored mid-run):
//   M1 reach:  >=3/4 pairs both reach announcement (control seated, wait invited).
//   M2 survive:>=2/4 wait runs survive the 21-day hold and sit.
//   M3 delta:  >=1 pair shows a material seat-quality delta attributable to
//              the wait (doors +/- , door standings, standings penalty,
//              outcome) — in EITHER direction. Inert arms are a finding too.
//   M4 people: >=2 transcripts sense-read (announcement + tier-ups + the sit),
//              0 senseless flags.
//   M5 census: village census real post-table on both arms; no crash/softlock.
//
// Interesting-finding bar: a wait that sits STRONGER than its control pair
//   (opportunity real) or LOSES something real during the hold (cost real,
//   seat withdrawn, deaths) — either resolves Steve's design question.
//   Both arms identical end to end = the wait is inert (a Steve question).
//
// Seeds: 8931-8934 (fresh; r15 used 8911-8921). Pilot 8931-8932 (1 pair),
//   expand to 4 pairs if the instrument works.
// Horizon: DAYCAP=210 (hold 21d + table resolution), death-aware (+10d tail).
// Policy: belongseat stack (TRIBFLOOR=1 + WINDEFER=1 + FEASTSCALE_R13=1 +
//   BELONG_V3=1); the wait arm wraps the same stack with the hold gate.
// SEATDRIVE default-ON applies only to the control arm's composition.
//
// TOOLING ONLY — no game balance changes. Policy behaves as pinned.
'use strict';
// Env BEFORE any require: belongseek reads BELONG_V3 at module load;
// feastscale gates its feast/devotion layer on FEASTSCALE_R13.
process.env.TRIBFLOOR = '1';
process.env.WINDEFER = '1';
process.env.FEASTSCALE_R13 = '1';
process.env.BELONG_V3 = '1';
// SEATDRIVE unset = default-ON (control arm relies on this).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-18');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [8931, 8932, 8933, 8934]).filter(Number.isFinite);
const ARMS = (process.env.ARMS ? process.env.ARMS.split(',') : ['control', 'wait']);
const DAYS = parseInt(process.env.DAYS || '210', 10);
const WAIT_DAYS = parseInt(process.env.WAIT_DAYS || '21', 10); // 3 overtime tiers

const { loadGame, setupGame, runDays } = require('./sim-harness');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');

const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };
function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ---- transcript capture (same as r14/r15) ----
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

// ---- table ladder / seat instrument (adapted from r15) ----
function attachTable(G, m) {
  const t = m.table = {
    ladder: [], sceneFires: [], doors: [], downgrades: [], failEvents: [],
    failSteer: [], beats: 0, finals: 0,
    seatTakes: [], won: 0, wonDetail: null, teleTable: [],
    announceCount: 0, announceDay: null, atAnnounce: null, atSit: null,
    tierTicks: [], deathsInWait: [],
  };
  const otele = G.tele;
  if (typeof otele === 'function') {
    G.tele = function (ev, data) {
      try {
        if (String(ev).indexOf('table') === 0 || ev === 'overtime_tier') {
          t.teleTable.push({ day: day(G), ev, data: JSON.parse(JSON.stringify(data || {})) });
          if (ev === 'table_won') { t.won = 1; t.wonDetail = data; }
          if (ev === 'overtime_tier') t.tierTicks.push({ day: day(G), tier: (data || {}).tier });
        }
      } catch (e) {}
      return otele.call(this, ev, data);
    };
  }
  const origScene = G.tableScene;
  if (typeof origScene === 'function') {
    G.tableScene = function () {
      try {
        t.sceneFires.push({ day: day(G) });
        // roster + seat snapshot AT SIT TIME (pre-scene) — the run may end
        // the same day, so this cannot wait for a later daily.
        if (t.rosterAtSit == null) { t.rosterAtSit = rosterIds(G); t.atSit = seatSnapshot(G); t.sitSceneDay = day(G); }
      } catch (e) {}
      return origScene.apply(this, arguments);
    };
  }
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
function seatSnapshot(G) {
  const s = { day: day(G), seat: 'none', doors: {}, standingCost: 0, overtimeTier: 0 };
  try { s.overtimeTier = (typeof G.overtimeTier === 'function') ? G.overtimeTier() : 0; } catch (e) {}
  try {
    const pv = G.tablePreview ? G.tablePreview() : null;
    if (pv) { s.standingCost = pv.standingCost | 0; }
  } catch (e) {}
  try {
    const se = G.tableSeat ? G.tableSeat() : null;
    if (se) s.seat = se.seat || 'none';
  } catch (e) {}
  try {
    for (const p of (G.tableEarnedPaths() || [])) {
      if (p) s.doors[p.id] = { earned: !!p.earned, strength: p.strength | 0, why: (p.why || '').slice(0, 120) };
    }
  } catch (e) {}
  return s;
}
function rosterIds(G) {
  try {
    const r = G.state.village.roster || [];
    const out = [];
    for (const id of r) { try { out.push({ id, dead: !!(G.getPerson(id) || {}).dead }); } catch (e) {} }
    return out;
  } catch (e) { return []; }
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

// ---- the WAIT gate: hold the seat WAIT_DAYS after first announcement ----
function waitDriveSeat(Game, ctx) {
  const m = ctx._r16m;
  const pg = (Game.progState && Game.progState()) || {};
  if (pg.tableDone) return;
  let pv = null;
  try { pv = Game.tablePreview(); } catch (e) { pv = null; }
  if (!pv) {
    // invitation lapsed (seat withdrawn etc.) — clear the hold; a fresh
    // announcement starts a fresh window. Only counts when an announcement
    // was previously live.
    if (ctx.wdAnnounceDay != null) {
      ctx.wdAnnounceLost = (ctx.wdAnnounceLost | 0) + 1;
      if (m) m.table.announceLost = (m.table.announceLost | 0) + 1;
    }
    ctx.wdAnnounceDay = null;
    return;
  }
  const d = day(Game);
  if (ctx.wdAnnounceDay == null) {
    ctx.wdAnnounceDay = d;
    if (m) {
      m.table.announceCount += 1;
      if (m.table.announceDay == null) {
        m.table.announceDay = d;
        m.table.atAnnounce = seatSnapshot(Game);
        m.table.rosterAtAnnounce = rosterIds(Game);
      }
    }
  }
  if (d < ctx.wdAnnounceDay + WAIT_DAYS) { ctx.wdHeld = (ctx.wdHeld | 0) + 1; return; }
  // window over: sit now (the classified driver, exactly as seatdrive does)
  SD.driveSeat(Game, ctx);
}

// ---- conversation driver (people check; same as r14/r15, fixed pick order) ----
// r16: prefer choices the driver hasn't used yet in this conversation — the
// old first-match-every-turn policy looped dlg:comfort 8x in a row (a driver
// artifact, not a game bug — r15). Fresh-first keeps the transcript readable;
// repeats are allowed only when nothing fresh remains.
function pickChoice(list, turn, used) {
  if (!list || !list.length) return null;
  used = used || new Set();
  const fresh = (id) => !used.has(id);
  const byIdFresh = (id) => list.find(x => x && x.id === id && fresh(id));
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === 0 && fresh(x.id));
  if (ans) return ans;
  for (const id of ['dlg:engage', 'dlg:ask', 'dlg:comfort', 'dlg:share', 'dlg:teach', 'dlg:listen', 'ask:teach_me', 'want:ask']) {
    const c = byIdFresh(id); if (c) return c;
  }
  for (const id of ['dlg:encourage', 'dlg:reassure', 'dlg:joke', 'dlg:smalltalk']) {
    const c = byIdFresh(id); if (c) return c;
  }
  const react = list.find(x => x && x.id === 'dlg:react' && fresh('dlg:react'));
  if (react && turn < 6) return react;
  const stay = list.find(x => x && x.id && x.id !== 'leave' && x.id.indexOf('leave') !== 0 && fresh(x.id));
  if (stay && turn < 5) return stay;
  // nothing fresh: fall back to any non-leave (old behavior) so the
  // conversation continues rather than stalling.
  const anyStay = list.find(x => x && x.id && x.id !== 'leave' && x.id.indexOf('leave') !== 0);
  if (anyStay && turn < 10) return anyStay;
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
    const used = new Set();
    while (turn < 12 && cur && !cur.ended) {
      const opts = cur.choices || [];
      const c = pickChoice(opts, turn, used);
      if (!c) { L.push('(no choice matched — menu exhausted)'); break; }
      used.add(c.id);
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
      return { id, name: nm, alive: !p.dead, occ: p.formerOccupation || p.occupation || null };
    });
  } catch (e) { return []; }
}

async function runOne(seed, arm) {
  const pid = 'belongseat-overtime-wait';
  const TF = require('./policies/tribfloor');
  const drainBase = WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer',
    'belongfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base');
  const myDaily = (G, ctx) => {
    const m = ctx._r16m;
    try {
      if (arm === 'wait') waitDriveSeat(G, ctx);
      else SD.driveSeat(G, ctx);
    } catch (e) { if (m) m.table.seatDriveErr = String(e && e.message || e).slice(0, 160); }
    return drainBase.daily(G, ctx);
  };
  // Object.assign copies setup/upkeep/fight/contest from the landed stack —
  // only daily is overridden (r14 fix: a bare {id,desc,daily} dropped the
  // fight/upkeep verbs and all four villages died).
  const policy = Object.assign({}, SD.belongseat, {
    id: pid + '-' + arm,
    desc: 'belongseat recomposed (driveSeat -> windefer drain), arm=' + arm +
      (arm === 'wait' ? ` (hold the seat ${WAIT_DAYS}d after announcement, then sit)` : ' (sit the dawn ready)'),
    daily: myDaily,
  });
  const { Game } = await loadGame({ seed, mode: 'endgame-r16-' + pid + '-' + arm });
  await setupGame(Game);
  const m = { ctx: null };
  attachTranscript(Game, m);
  attachTable(Game, m);
  const ctx = { _r16m: m };
  let harnessCtx = null; // runDays passes its own ctx to policy.daily — the
  // real counters (sdSeatTaken, wdHeld, ...) live there, not on this object.
  const rungHistory = [];
  const wrappedDaily = policy.daily;
  let convoWaitDay = null;
  policy.daily = (G, c2) => {
    c2._r16m = m;
    harnessCtx = c2;
    const d = day(G);
    try {
      const pg = (G.progState && G.progState()) || {};
      if (pg.tableWaiting && !m.table.waitingEver) { m.table.waitingEver = true; m.table.waitingDay = d; }
      if (pg.table && pg.table.phase === 'done' && m.table.doneDay == null) m.table.doneDay = d;
      snapshotFrame(G, m);
    } catch (e) {}
    if (d % 10 === 0 || (d >= 80 && d % 5 === 0)) {
      const s = seatSnapshot(G);
      m.table.ladder.push({ day: s.day, seat: s.seat, w1: 0, w2: 0, w3: 0 });
      if (s.seat !== 'none') rungHistory.push({ day: d, seat: s.seat, tier: s.overtimeTier, doors: Object.keys(s.doors).filter(k => s.doors[k].earned).join(',') });
    }
    // PEOPLE CHECK at day 80 (pre-table): two full villager conversations.
    if (d === 80 && !m.convosDone) {
      m.convosDone = true;
      m.convos = probeConvos(Game, 80, 2);
    }
    // WAIT-arm only: one conversation mid-hold (~10d into the overtime wait).
    if (arm === 'wait' && convoWaitDay == null && m.table.announceDay != null && d >= m.table.announceDay + 10) {
      convoWaitDay = d;
      m.convosWait = probeConvos(Game, d, 1);
    }
    return wrappedDaily(G, c2);
  };
  function probeConvos(G, dayNum, n) {
    try {
      const living = (G.state.village.roster || []).filter(id => { try { return !(G.getPerson(id) || {}).dead; } catch (e) { return false; } });
      const scholarId = G.villagerId;
      const others = living.filter(id => id !== scholarId).slice(0, n);
      const out = [];
      for (const vid of others) out.push(runConversation(G, vid, dayNum));
      return out;
    } catch (e) { return [['(people check failed: ' + String(e && e.message || e).slice(0, 160) + ')']]; }
  }
  const result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 });
  const hc = harnessCtx || {};
  const convos = m.convos || [['(people check never ran — run ended before day 80)']];
  const tsum = tableSummary(Game);
  const order = { none: 0, lesser: 1, full: 2 };
  let best = 'none';
  for (const s of m.table.ladder) if ((order[s.seat] || 0) > (order[best] || 0)) best = s.seat;
  // deaths during the wait window (wait arm only): roster ids present at
  // announce but gone at sit (the dead leave the roster — overtime.js
  // counts the same vanishings as its losses).
  let deathsInWait = [];
  try {
    if (arm === 'wait' && m.table.rosterAtAnnounce && m.table.rosterAtSit) {
      const sitIds = new Set(m.table.rosterAtSit.map(r => r.id));
      deathsInWait = m.table.rosterAtAnnounce.filter(r => !sitIds.has(r.id)).map(r => {
        let nm = r.id; try { nm = Game.displayName(r.id) || r.id; } catch (e) {}
        let dead = true; try { const p = Game.getPerson(r.id); dead = !p || !!p.dead; } catch (e) {}
        return { name: nm, dead };
      });
    }
  } catch (e) {}
  const out = {
    label: 'journey-endgame-r16', policy: pid, seed, arm,
    days: result.days, endReason: result.endReason,
    seatBest: best, sceneFired: m.table.sceneFires.length, sceneFireDays: m.table.sceneFires.map(x => x.day),
    waitingEver: !!m.table.waitingEver, waitingDay: m.table.waitingDay || null,
    announceCount: m.table.announceCount, announceLost: m.table.announceLost || 0,
    announceDay: m.table.announceDay, sitDay: m.table.sitSceneDay || null,
    heldDays: hc.wdHeld | 0, wdAnnounceLost: hc.wdAnnounceLost | 0,
    rosterAtAnnounceN: (m.table.rosterAtAnnounce || []).length,
    rosterAtSitN: (m.table.rosterAtSit || []).length,
    atAnnounce: m.table.atAnnounce, atSit: m.table.atSit,
    deathsInWait, tierTicks: m.table.tierTicks,
    doneDay: m.table.doneDay != null ? m.table.doneDay : null,
    doors: m.table.doors, downgrades: m.table.downgrades,
    failEvents: m.table.failEvents, failSteer: m.table.failSteer,
    driverErr: m.table.driverErr || null, seatDriveErr: m.table.seatDriveErr || null,
    sdSeatAttempts: hc.sdSeatAttempts | 0, sdSeatTaken: hc.sdSeatTaken | 0, sdSeatDay: hc.sdSeatDay || null,
    won: m.table.won, wonDetail: m.table.wonDetail,
    table: tsum,
    teleTable: m.table.teleTable,
    rungHistory, ladder: m.table.ladder.filter((_, i) => i % 2 === 0),
    census: census(Game),
    deaths: (result.samples && result.samples.deaths) || [],
    ms: result.ms,
  };
  const fp = path.join(EVIDIR, `journey-endgame-r16-${arm}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  const tx = [];
  tx.push(`# journey-endgame-r16 table transcript — seed ${seed} (${arm})`);
  tx.push(`days=${out.days} end=${out.endReason} seat=${out.seatBest} announce=${out.announceDay != null ? 'd' + out.announceDay : '—'} sit=${out.sitDay != null ? 'd' + out.sitDay : '—'} held=${out.heldDays} deathsInWait=${JSON.stringify(deathsInWait)} done=${out.doneDay != null ? 'd' + out.doneDay : '—'} won=${out.won} finalpath=${tsum.path || '—'}/${tsum.branch || '—'} weakened=${tsum.weakened} asc=${tsum.ascensions.length}`);
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
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r16-transcript-${arm}-s${seed}.txt`), tx.join('\n'));
  const cx = [`# journey-endgame-r16 conversations — seed ${seed} (${arm})`, ''];
  for (const c of convos) { cx.push(c.join('\n')); cx.push(''); }
  if (m.convosWait) { cx.push(`# — mid-wait conversations (overtime pressure) —`); for (const c of m.convosWait) { cx.push(c.join('\n')); cx.push(''); } }
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r16-convos-${arm}-s${seed}.txt`), cx.join('\n'));
  const pop = out.census.filter(c => c.alive).length;
  console.log(`[s${seed}/${arm}] d=${out.days} ${out.endReason} seat=${out.seatBest} ann=${out.announceDay != null ? 'd' + out.announceDay : '—'} sit=${out.sitDay != null ? 'd' + out.sitDay : '—'} held=${out.heldDays} tier@${'sit'}:${(out.atSit || {}).overtimeTier} deathsInWait=${deathsInWait.length} done=${out.doneDay != null ? 'd' + out.doneDay : '—'} won=${out.won} path=${tsum.path || '—'}/${tsum.branch || '—'} weak=${tsum.weakened} pop=${pop}/${out.census.length} ms=${out.ms}`);
  return out;
}

async function main() {
  const rows = [];
  for (const seed of SEEDS) {
    for (const arm of ARMS) {
      try { rows.push(await runOne(seed, arm)); }
      catch (e) { console.log(`[s${seed}/${arm}] FATAL: ` + (e && e.stack || e)); rows.push({ seed, arm, fatal: String(e && e.message || e) }); }
    }
  }
  const agg = (fn) => rows.reduce((t, r) => t + (fn(r) || 0), 0);
  const invited = (arm) => agg(r => (r.arm === arm && (r.announceDay != null || r.sitDay != null || (r.sceneFireDays || []).length)) ? 1 : 0);
  const seated = (arm) => agg(r => (r.arm === arm && r.sitDay != null) ? 1 : 0);
  const pairs = SEEDS.length;
  console.log(`\n=== journey-endgame-r16 PILOT === seeds=[${SEEDS.join(',')}] arms=[${ARMS.join(',')}] days=${DAYS} wait=${WAIT_DAYS}d`);
  console.log(`invited control ${invited('control')}/${pairs} wait ${invited('wait')}/${pairs}`);
  console.log(`seated control ${seated('control')}/${pairs} wait ${seated('wait')}/${pairs}`);
  console.log(`wait holds: ${rows.filter(r => r.arm === 'wait').map(r => r.heldDays).join(',')}`);
  console.log(`M1 reach (>=3/4 pairs invited): ${invited('control') >= 3 && invited('wait') >= 3 ? 'GO' : 'NO-GO (pilot)'}`);
  console.log(`M2 survive (>=2/4 wait seated): ${seated('wait') >= 2 ? 'GO' : 'NO-GO (pilot)'}`);
  console.log(`M5 no-crash: ${!agg(r => r.fatal ? 1 : 0) ? 'GO' : 'NO-GO'}`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
