#!/usr/bin/env node
// journey-endgame-r14-20261017.js — ENDGAME leg (leg 4), 2026-10-17 playtest loop r14.
// PRE-REGISTERED (MEASUREMENT.md §§9-12, 14 — written before the pilot ran):
//
// Leg question: on the current tip (seat driver default-ON since 2026-10-16,
//   readiness-gated waves 4/5, the six approved design calls, overtime), does
//   a competent full run REACH the table, SIT, and PLAY a path challenge
//   beat-by-beat to a real ending — the win-path axis that measured 0 sittings
//   across all prior journey runs? Do the played path transcripts read as
//   sensical (SENSE-TESTING LAW)?
//
// Binding metrics (a miss is NO-GO, never re-scored mid-run):
//   M1 reach: >=2/4 pilot seeds sit the seat (tableTakeSeat ok).
//   M2 doors: the 7-door offer opens with >=1 earned door on >=1 seed.
//   M3 play: >=1 seed plays a full path (door -> beats -> final -> epilogue,
//     pg.table.phase 'done' or table_won) with no engine errors.
//   M4 people: >=4 table transcripts sense-read (audit + door + beats +
//     final + epilogue across seeds), 0 senseless flags.
//   M5 winnable: >=1 seed reaches a table ending (won resolution or priced
//     failure resolution per TABLE.md law 4). Crash/softlock = NO-GO.
//
// Interesting-finding bar: a full path played end-to-end on a real full run
//   (never journey-measured); branch-voiced outcomes matching the run's
//   ledger; the relay door on a stage-3 run; NPC ascension/facilitation beats
//   at the table; an outshone epilogue; a downgrade played through.
//
// Seeds: 8901-8904 (fresh; deepening-r15 used 8801-8808, scale-r4 used
//   8701-8708). Policy: belongseat (BELONG road held national 7/8 on this
//   tip, scale r4) = withSeatDrive(withWinDefer(tribfloor belongfeast));
//   TRIBFLOOR=1 + WINDEFER=1 + FEASTSCALE_R13=1 (the feast/devotion layer —
//   without it the food-thesis deed feastSurgeUsed can never mark) +
//   BELONG_V3=1 (v3 >= v2 proven 2026-10-12); SEATDRIVE default-ON. The ONE deliberate player
//   choice: at the 7-door offer pick the strongest earned door not yet
//   covered by an earlier pilot seed (competent play = best-fit door).
//   Challenge beats drain with options[0] exactly like the landed stack.
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

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [8901, 8902, 8903, 8904]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '190', 10);

const { loadGame, setupGame, runDays } = require('./sim-harness');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');

const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };
function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ---- transcript capture ----
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

// ---- table ladder / seat instrument (adapted from r13) ----
function attachTable(G, m) {
  const t = m.table = {
    ladder: [], sceneFires: [], doors: [], beats: 0, finals: 0,
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
  // tablePrompt hook: record every table modal as it opens (the drain
  // answers modals within the same tick, so daily-start snapshots miss
  // them). This is the audit / door / beat / final / epilogue record.
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
  const out = { phase: null, path: null, branch: null, doors: [], ascensions: [], facilitated: null };
  try {
    const pg = (G.progState && G.progState()) || {};
    const T = pg.table || {};
    out.phase = T.phase || null; out.path = T.path || null; out.branch = T.branch || T.band || null;
    out.doors = (T.doors || []).slice();
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

// ---- the one deliberate player choice: steer the 7-door offer ----
// At the door offer (options are path:<id> for earned doors), pick the
// strongest earned door not yet covered by an earlier pilot seed. Respects
// the windefer hold (never answers on a hold day). Everything after the door
// drains with options[0] exactly like the landed stack.
const coveredDoors = new Set();
function steerDoor(G, m, ctx) {
  const s = G.state.scholar || {};
  const tc = s.tableChoices;
  if (!tc || !tc.options || !tc.options.length) return;
  if (tc.options[0].id.indexOf('path:') !== 0) return; // not the door offer
  let dec = null;
  try { dec = WD.shouldHoldOffer(G); } catch (e) {}
  if (dec && dec.hold) { m.table.holdSkips = (m.table.holdSkips | 0) + 1; return; }
  let earned = [];
  try { earned = G.tableEarnedPaths() || []; } catch (e) {}
  const rank = {};
  for (const p of earned) if (p && p.earned) rank['path:' + p.id] = { strength: p.strength | 0, why: p.why || '' };
  const opts = tc.options.filter(o => o && o.id.indexOf('path:') === 0);
  if (!opts.length) return;
  opts.sort((a, b) => {
    const sa = (rank[a.id] || {}).strength || 0, sb = (rank[b.id] || {}).strength || 0;
    return ((coveredDoors.has(a.id) ? 1 : 0) - (coveredDoors.has(b.id) ? 1 : 0)) || (sb - sa);
  });
  const pick = opts[0];
  coveredDoors.add(pick.id);
  let seatAtPick = 'none';
  try { seatAtPick = (G.tableSeat ? G.tableSeat().seat : 'none') || 'none'; } catch (e) {}
  m.table.doors.push({ day: day(G), door: pick.id, strength: (rank[pick.id] || {}).strength || 0, why: (rank[pick.id] || {}).why || '', offered: opts.map(o => o.id), seatAtPick });
  ctx.tableDoorPick = pick.id; ctx.tableDoorDay = day(G);
  try { Game_choose(G, pick.id); } catch (e) { m.table.doorErr = String(e && e.message || e).slice(0, 200); }
}
function Game_choose(G, id) { return G.chooseTableOption(id); }

// ---- conversation driver (people check; adapted from test-winpath-table-e2e) ----
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
    L.push(`=== day ${dayNum} \u2014 conversation with ${nm} ===`);
    L.push(`THEM: ${stripHtml(cur.line || '(no line)')}`);
    let turn = 0;
    while (turn < 12 && cur && !cur.ended) {
      const opts = cur.choices || [];
      const c = pickChoice(opts, turn);
      if (!c) { L.push('(no choice matched \u2014 menu exhausted)'); break; }
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
  const pid = 'belongseat-tableplay';
  // Recomposed daily: seatdrive's driveSeat OPENS the 7-door offer inside
  // base.daily, after which windefer's drain answers it with options[0]
  // before any outer steer can see it (r14 pilot bug: steer ran first and
  // never saw the offer). Correct order: driveSeat -> steerDoor -> drain.
  const TF = require('./policies/tribfloor');
  const drainBase = WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer',
    'belongfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base');
  const myDaily = (G, ctx) => {
    const m = ctx._r14m;
    try { SD.driveSeat(G, ctx); } catch (e) { if (m) m.table.seatDriveErr = String(e && e.message || e).slice(0, 160); }
    try { steerDoor(G, m, ctx); } catch (e) { if (m) m.table.steerErr = String(e && e.message || e).slice(0, 160); }
    return drainBase.daily(G, ctx);
  };
  // Object.assign copies setup/upkeep/fight/contest from the landed stack —
  // only daily is overridden (r14 fix: a bare {id,desc,daily} dropped the
  // fight/upkeep verbs and all four villages died).
  const policy = Object.assign({}, SD.belongseat, {
    id: pid,
    desc: 'belongseat recomposed (driveSeat -> door-steer -> windefer drain): at the 7-door offer pick the strongest earned door not yet covered by an earlier pilot seed (windefer hold respected)',
    daily: myDaily,
  });
  const { Game } = await loadGame({ seed, mode: 'endgame-r14-' + pid });
  await setupGame(Game);
  const m = { ctx: null };
  attachTranscript(Game, m);
  attachTable(Game, m);
  const ctx = { _r14m: m };
  const rungHistory = [];
  const wrappedDaily = policy.daily;
  policy.daily = (G, c2) => {
    c2._r14m = m;
    const d = day(G);
    try {
      const pg = (G.progState && G.progState()) || {};
      if (pg.tableWaiting && !m.table.waitingEver) { m.table.waitingEver = true; m.table.waitingDay = d; }
      if (pg.table && pg.table.phase === 'done' && m.table.doneDay == null) m.table.doneDay = d;
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
  const out = {
    label: 'journey-endgame-r14', policy: pid, seed,
    days: result.days, endReason: result.endReason,
    seatBest: best, sceneFired: m.table.sceneFires.length, sceneFireDays: m.table.sceneFires.map(x => x.day),
    waitingEver: !!m.table.waitingEver, waitingDay: m.table.waitingDay || null,
    doneDay: m.table.doneDay != null ? m.table.doneDay : null,
    doors: m.table.doors,
    steerErr: m.table.steerErr || null, doorErr: m.table.doorErr || null, holdSkips: m.table.holdSkips | 0,
    won: m.table.won, wonDetail: m.table.wonDetail,
    table: tsum,
    teleTable: m.table.teleTable,
    rungHistory, ladder: m.table.ladder.filter((_, i) => i % 2 === 0),
    census: census(Game),
    deaths: (result.samples && result.samples.deaths) || [],
    ms: result.ms,
  };
  const fp = path.join(EVIDIR, `journey-endgame-r14-${pid}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  const tx = [];
  tx.push(`# journey-endgame-r14 table transcript — seed ${seed} (${pid})`);
  tx.push(`days=${out.days} end=${out.endReason} seat=${out.seatBest} doors=${JSON.stringify(out.doors)} won=${out.won}`);
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
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r14-transcript-s${seed}.txt`), tx.join('\n'));
  const cx = [`# journey-endgame-r14 conversations — seed ${seed}`, ''];
  for (const c of convos) { cx.push(c.join('\n')); cx.push(''); }
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r14-convos-s${seed}.txt`), cx.join('\n'));
  const pop = out.census.filter(c => c.alive).length;
  console.log(`[s${seed}] d=${out.days} ${out.endReason} seat=${out.seatBest} scene=${out.sceneFired}x waiting=${out.waitingEver ? 'd' + out.waitingDay : '—'} doors=${JSON.stringify(out.doors.map(d => d.door))} done=${out.doneDay != null ? 'd' + out.doneDay : '—'} won=${out.won} path=${tsum.path || '—'}/${tsum.branch || '—'} asc=${tsum.ascensions.length} pop=${pop}/${out.census.length} ms=${out.ms}`);
  return out;
}

async function main() {
  const rows = [];
  for (const seed of SEEDS) {
    try { rows.push(await runOne(seed)); }
    catch (e) { console.log(`[s${seed}] FATAL: ` + (e && e.stack || e)); rows.push({ seed, fatal: String(e && e.message || e) }); }
  }
  const agg = (fn) => rows.reduce((t, r) => t + (fn(r) || 0), 0);
  const sat = agg(r => (r.doors && r.doors.length) ? 1 : 0);
  const played = agg(r => (r.table && r.table.phase === 'done') || r.won ? 1 : 0);
  const wonN = agg(r => r.won ? 1 : 0);
  const seated = agg(r => (r.seatBest && r.seatBest !== 'none') || (r.sceneFired > 0) ? 1 : 0);
  console.log(`\n=== journey-endgame-r14 PILOT === seeds=[${SEEDS.join(',')}] days=${DAYS}`);
  console.log(`seated ${seated}/${rows.length} doors-entered ${sat}/${rows.length} path-completed ${played}/${rows.length} won ${wonN}/${rows.length}`);
  console.log(`M1 reach (>=2/4 seated): ${seated >= 2 ? 'GO' : 'NO-GO'}`);
  console.log(`M2 doors (>=1/4 door offer w/ earned door): ${agg(r => r.doors && r.doors.length ? 1 : 0) >= 1 ? 'GO' : 'NO-GO'}`);
  console.log(`M3 play (>=1 full path, no engine errors): ${played >= 1 && !agg(r => r.fatal || r.doorErr || r.steerErr ? 1 : 0) ? 'GO' : 'NO-GO'}`);
  console.log(`M5 winnable (>=1 table ending): ${wonN >= 1 ? 'GO' : 'NO-GO'}`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
