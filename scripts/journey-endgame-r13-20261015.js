#!/usr/bin/env node
// journey-endgame-r13-20261015.js — ENDGAME leg (leg 4), 2026-10-15 playtest loop r13.
// PRE-REGISTERED (MEASUREMENT.md §11):
//   Question: on current master tip f0590b05, (A) does the OVERTIME tier
//     system (TABLE.md 2026-10-14, src/js/overtime.js) actually tick while a
//     priced seat sits UNANSWERED — r12's s37 sat 80d unanswered with zero
//     overtime instrumentation, so tiers 0-6 have never been measured in a
//     journey run; (B) does the seat-approach picture hold on 2 fresh + 2
//     known seeds (r12: 3/4 GO)?
//   Primary metric: (A) overtimeActive()==true && overtimeTier()>0 observed
//     on a run whose scene sat unanswered ≥42d past the win-day floor, with
//     the tier-N System line in the transcript and the overtime_tier
//     telemetry present. GO = tier ticks and is legible on ≥1 run.
//     NO-GO = the clock never starts (wire-gap) — filed as a blank.
//     (B) seatApproach GO = ≥2/4 seeds (same bar as r10/r11/r12).
//   Secondary: RERUN ×N labels on wave-4/5 fights during overtime; raid-knob
//     engagement; seat-price penalty (overtimeStanding) at fire-time vs later.
//   Seeds: 37, 48 (r12 known: s37 unanswered 80d; s48 full-seat), 5, 71 (fresh).
//     Policy: leadfeast (scripts/policies/feastscale.js, FEASTSCALE_R13=1) —
//     the pilot does NOT answer the scene (overtime needs the seat untaken).
//   Horizon: 180d death-aware (+10d tail; runDays stops on dead village).
//   Interesting-finding bar: tier-6 effects in the transcript; a RERUN fight
//     that matters; a silent clock (no lines, no telemetry); the third-titan
//     omen at tier 2.
// Anti-drift (§14): metrics bind. A miss is NO-GO, never re-scored.
// TOOLING ONLY — no game balance changes. Policy behaves as pinned.
'use strict';
process.env.FEASTSCALE_R13 = '1'; // the feast layer is the policy under test
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-15');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });
console.log('[r12] FEASTSCALE_R13=' + process.env.FEASTSCALE_R13);

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [37, 48, 5, 71]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast']).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const fc = require('./food-coupling-20261013');
const POLICY_REGISTRY = { leadfeast };

const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };

// ---- table ladder instrument ----
// ---- overtime instrument (r13): does the tier clock tick on unanswered seats? ----
function attachOvertime(G, m) {
  const t = m.overtime = { samples: [], lines: [], maxTier: 0, tierDays: {}, firstTierDay: null, teleEvents: 0 };
  const osay = G.say, osys = G.sysSay;
  const cap = (tag, fn) => function (x) {
    try {
      const s = String(x);
      if (/OVERTIME|RERUN ×|overtime_tier|the season kept going/i.test(s)) {
        t.lines.push(`[${tag} d${day(G)}] ${s.slice(0, 220)}`);
        if (/RERUN ×/.test(s)) t.rerunFights = (t.rerunFights || 0) + 1;
      }
    } catch (e) {}
    return fn.call(this, x);
  };
  G.say = cap('say', osay);
  G.sysSay = cap('sys', osys);
  // telemetry: count overtime_tier events without disturbing the real sink
  try {
    const otele = G.tele;
    if (typeof otele === 'function') {
      G.tele = function (ev, data) {
        try { if (ev === 'overtime_tier') { t.teleEvents++; t.tierDays[(data && data.tier) | 0] = day(G); if (t.firstTierDay == null) t.firstTierDay = day(G); } } catch (e) {}
        return otele.call(this, ev, data);
      };
    }
  } catch (e) {}
  return t;
}
function sampleOvertime(G, m) {
  const t = m.overtime, d = day(G);
  const s = { day: d, active: 0, tier: 0, days: 0, losses: 0 };
  try { s.active = G.overtimeActive ? (G.overtimeActive() ? 1 : 0) : 0; } catch (e) {}
  try { s.tier = G.overtimeTier ? (G.overtimeTier() | 0) : 0; } catch (e) {}
  try {
    const pg = (G.progState && G.progState()) || {};
    s.days = pg.overtimeDays | 0; s.losses = pg.overtimeLosses | 0;
    s.waiting = pg.tableWaiting ? 1 : 0; s.done = pg.tableDone ? 1 : 0;
    s.seat = (G.tableSeat ? (G.tableSeat().seat || 'none') : 'none');
  } catch (e) {}
  if (s.tier > t.maxTier) t.maxTier = s.tier;
  t.samples.push(s);
  return s;
}
function finalizeOvertime(m) {
  const t = m.overtime;
  return {
    maxTier: t.maxTier, firstTierDay: t.firstTierDay, tierDays: t.tierDays,
    teleEvents: t.teleEvents, rerunFights: t.rerunFights || 0,
    lineCount: t.lines.length, lines: t.lines.slice(0, 40),
    samples: t.samples.filter((_, i) => i % 3 === 0),
  };
}
function attachTable(G, m) {
  const t = m.table = { ladder: [], sceneFires: [] };
  const safe = (fn, wrap) => {
    if (typeof fn !== 'function') return fn;
    return function (...a) {
      let r;
      try { r = fn.apply(this, a); } catch (e) { throw e; }
      try { wrap(r, a); } catch (e) {}
      return r;
    };
  };
  if (typeof G.tableScene === 'function') G.tableScene = safe(G.tableScene, () => {
    t.sceneFires.push({ day: day(G) });
  });
  return t;
}
function sampleSeat(G) {
  const s = { day: 0, seat: 'none', w1: 0, w2: 0, w3: 0, contests: 0, crises: 0, rank: 'village', stage: 0, foodDeeds: false,
    standing: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0, wave: 1 };
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
  try {
    const b = G.villageStanding ? G.villageStanding() : null;
    if (b) { s.standing = b.total | 0; s.war = b.war | 0; s.diplomacy = b.diplomacy | 0; s.plenty = b.plenty | 0; s.warPts = b.warPts | 0; s.links = b.links | 0; s.feasts = b.feasts | 0; }
    else if (typeof G.villageStandingTotal === 'function') s.standing = G.villageStandingTotal() | 0;
  } catch (e) {}
  try { s.wave = (typeof G.unlockedWave === 'function') ? (G.unlockedWave() | 0) : 1; } catch (e) {}
  return s;
}
function finalizeTable(m, G) {
  const t = m.table, out = {};
  out.tableSceneFires = t.sceneFires.length;
  out.tableSceneFireDays = t.sceneFires.map(x => x.day);
  out.tableSceneFired = t.sceneFires.length > 0 ? 1 : 0;
  out.tableSceneCompleted = (t.tableDoneDay != null) ? 1 : 0;
  out.tableDoneDay = t.tableDoneDay != null ? t.tableDoneDay : null;
  out.tableWaitingEver = t.tableWaitingEver ? 1 : 0;
  out.arc4day = t.arc4day != null ? t.arc4day : null;
  const order = { none: 0, lesser: 1, full: 2 };
  let best = 'none', bestD = null;
  const maxes = { w1: 0, w2: 0, w3: 0, contests: 0, crises: 0, stage: 0, foodDeeds: 0 };
  for (const s of t.ladder) {
    if ((order[s.seat] || 0) > (order[best] || 0)) { best = s.seat; bestD = s; }
    maxes.w1 = Math.max(maxes.w1, s.w1); maxes.w2 = Math.max(maxes.w2, s.w2); maxes.w3 = Math.max(maxes.w3, s.w3);
    maxes.contests = Math.max(maxes.contests, s.contests); maxes.crises = Math.max(maxes.crises, s.crises);
    maxes.stage = Math.max(maxes.stage, s.stage); if (s.foodDeeds) maxes.foodDeeds = 1;
  }
  out.seatBest = best; out.seatBestDetail = bestD;
  out.seatApproach = (best !== 'none' || t.sceneFires.length > 0) ? 1 : 0;
  out.rungMaxes = maxes;
  let w4day = null, w5day = null, stMax = 0, stMaxDay = null;
  const src = { warPts: 0, links: 0, feasts: 0 };
  for (const s of t.ladder) {
    if ((s.wave | 0) >= 4 && w4day === null) w4day = s.day;
    if ((s.wave | 0) >= 5 && w5day === null) w5day = s.day;
    if ((s.standing | 0) > stMax) { stMax = s.standing | 0; stMaxDay = s.day; src.warPts = s.warPts | 0; src.links = s.links | 0; src.feasts = s.feasts | 0; }
  }
  out.wave4day = w4day; out.wave5day = w5day; out.wave5unlocked = (w5day != null) ? 1 : 0;
  out.standingMax = stMax; out.standingMaxDay = stMaxDay; out.standingSrc = src;
  // NPC ascensions (table-scored).
  let ascN = 0, ascNames = [];
  try {
    const asc = (typeof G.tableAscended === 'function') ? G.tableAscended() : [];
    ascN = asc.length; ascNames = asc.map(a => a.name || a.id).slice(0, 8);
  } catch (e) {}
  out.ascensions = ascN; out.ascensionNames = ascNames;
  out.ladder = t.ladder.filter((_, i) => i % 3 === 0);
  return out;
}

function census(G) {
  try {
    return (G.state.village.roster || []).map(id => {
      const p = person(id);
      return { name: vname(id), alive: !p.dead, occ: p.formerOccupation || p.occupation || null };
    });
  } catch (e) { return []; }
}
function person(id) { try { return _G.getPerson(id) || {}; } catch (e) { return {}; } }
function vname(id) { try { return _G.displayName(id) || id; } catch (e) { return id; } }
let _G = null, _seed = null, _pol = null;
function exiledOf(m) { try { return m.table.exiledEver ? 1 : 0; } catch (e) { return 0; } }

async function runOne(pid, seed) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  _seed = seed; _pol = pid;
  const { Game } = await loadGame({ seed, mode: 'endgame-r13-' + pid });
  _G = Game;
  await setupGame(Game);
  const m = fc.attachInstruments(Game);
  attachTable(Game, m);
  attachOvertime(Game, m);
  const rungHistory = [];
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    const d = day(G);
    try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
    try {
      if (G.state && G.state.scholar && G.state.scholar.exiled && !m.table.exiledEver) {
        m.table.exiledEver = true; m.table.exileDay = d;
      }
      const pg = (G.progState && G.progState()) || {};
      if (pg.tableWaiting && !m.table.tableWaitingEver) { m.table.tableWaitingEver = true; m.table.tableWaitingDay = d; }
      if ((pg.arc | 0) >= 4 && m.table.arc4day == null) m.table.arc4day = d;
      if (pg.table && pg.table.phase === 'done' && m.table.tableDoneDay == null) m.table.tableDoneDay = d;
    } catch (e) {}
    if (d % 10 === 0) {
      const s = sampleSeat(G);
      m.table.ladder.push(s);
      const ot = sampleOvertime(G, m);
      if (ot.tier > 0) rungHistory.push({ day: d, seat: s.seat, ot: 'tier' + ot.tier, detail: `${s.w1}/${s.w2}/${s.w3}w c${s.contests} cr${s.crises} ${s.rank} st${s.stage} fd${s.foodDeeds ? 1 : 0}` });
      else if (s.seat !== 'none') rungHistory.push({ day: d, seat: s.seat, detail: `${s.w1}/${s.w2}/${s.w3}w c${s.contests} cr${s.crises} ${s.rank} st${s.stage} fd${s.foodDeeds ? 1 : 0}` });
    }
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 });
  const frow = fc.finalize(Game, m, result);
  const trow = finalizeTable(m, Game);
  const orow = finalizeOvertime(m);
  const out = {
    label: 'journey-endgame-r13', policy: pid, seed,
    days: result.days, endReason: result.endReason,
    // telemetry-check key set (must stay top-level)
    national: frow.national, table: frow.table, wins: frow.won ? 1 : 0,
    exiled: exiledOf(m), seatApproach: trow.seatApproach,
    wave5unlocked: trow.wave5unlocked,
    tableSceneFired: trow.tableSceneFired, tableSceneCompleted: trow.tableSceneCompleted,
    ascensions: trow.ascensions,
    overtime: { maxTier: orow.maxTier, firstTierDay: orow.firstTierDay, teleEvents: orow.teleEvents, rerunFights: orow.rerunFights, lineCount: orow.lineCount },
    // detail
    rank: frow.rank, maxWave: frow.maxWave,
    tableWaiting: !!frow.tableWaiting, tableWaitingEver: trow.tableWaitingEver,
    arc4day: trow.arc4day, tableDoneDay: trow.tableDoneDay,
    ascensionNames: trow.ascensionNames,
    vests: frow.vests,
    seatBest: trow.seatBest, rungMaxes: trow.rungMaxes,
    rungHistory, ladder: trow.ladder,
    tableSceneFires: trow.tableSceneFires, tableSceneFireDays: trow.tableSceneFireDays,
    wave4day: trow.wave4day, wave5day: trow.wave5day,
    overtimeDetail: orow,
    standingMax: trow.standingMax, standingMaxDay: trow.standingMaxDay, standingSrc: trow.standingSrc,
    census: census(Game),
    deaths: (result.samples && result.samples.deaths) || [],
    ms: result.ms,
  };
  const fp = path.join(EVIDIR, `journey-endgame-r13-${pid}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r13-overtime-s${seed}.txt`), m.overtime.lines.join('\n'));
  const pop = out.census.filter(c => c.alive).length;
  console.log(`[${pid} s${seed}] d=${out.days} ${out.endReason} rank=${out.rank} nat=${out.national} wave=${out.maxWave} w4d=${out.wave4day ?? '—'} w5d=${out.wave5day ?? '—'} st=${out.standingMax}@${out.standingMaxDay ?? '—'} (w${out.standingSrc.warPts}/l${out.standingSrc.links}/f${out.standingSrc.feasts}) seat=${out.seatBest} scene=${out.tableSceneFired}/${out.tableSceneCompleted} arc4d=${out.arc4day ?? '—'} asc=${out.ascensions} won=${out.wins} pop=${pop}/${out.census.length} exiled=${out.exiled} rungs=${out.rungMaxes.w1}/${out.rungMaxes.w2}/${out.rungMaxes.w3}w c${out.rungMaxes.contests} cr${out.rungMaxes.crises} st${out.rungMaxes.stage} fd${out.rungMaxes.foodDeeds} OT=${out.overtime.maxTier}@${out.overtime.firstTierDay ?? '—'} tele=${out.overtime.teleEvents} rerun=${out.overtime.rerunFights}`);
  return out;
}

async function main() {
  const rows = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      try { rows.push(await runOne(pid, seed)); }
      catch (e) { console.log(`[${pid} s${seed}] FATAL: ` + (e && e.stack || e)); rows.push({ policy: pid, seed, fatal: String(e && e.message || e) }); }
    }
  }
  const agg = (fn) => rows.reduce((t, r) => t + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const s = {
    runs: rows.length,
    national: agg(r => r.national), table: agg(r => r.table), wins: agg(r => r.wins),
    seatApproach: agg(r => r.seatApproach),
    exiled: agg(r => r.exiled),
    medianDays: med(rows.map(r => r.days || 0)),
    wave4: agg(r => (r.wave4day != null) ? 1 : 0),
    wave5: agg(r => (r.wave5day != null) ? 1 : 0),
    sceneFired: agg(r => r.tableSceneFired),
    sceneCompleted: agg(r => r.tableSceneCompleted),
    asc: rows.map(r => r.ascensions || 0),
  };
  console.log(`\n=== journey-endgame-r12 pilot === policies=[${POLICIES.join(',')}] seeds=[${SEEDS.join(',')}] days=${DAYS}`);
  console.log(`wall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} won ${s.wins}/${s.runs} seatApproach ${s.seatApproach}/${s.runs} medianDays ${s.medianDays} exiled ${s.exiled}/${s.runs}`);
  console.log(`STANDING: wave-4 ${s.wave4}/${s.runs} wave-5 ${s.wave5}/${s.runs} | sceneFired ${s.sceneFired}/${s.runs} sceneCompleted ${s.sceneCompleted}/${s.runs} | ascensions [${s.asc.join(',')}]`);
  console.log(`PRIMARY (GO >=2/4 seat-approach-or-scene): ${s.seatApproach >= 2 ? 'GO' : 'NO-GO — document, deliver people check + one blank'}`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
