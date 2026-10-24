#!/usr/bin/env node
// sim-leanlink-rescue-sweep.js — LEANLINKRESCUE lean courtship arm (flesh-out loop arm
// sim-leanlink-rescue, axis scale-onramp, parent run fleshout-20261024T1615Z).
//
// POLICY-SIDE ONLY. ZERO src/js changes. Pairing (the crux, defined exactly):
//   control = scripts/policies/competent.js (LEANLINKRESCUE unset)
//   armed   = scripts/policies/leanlinkrescue.js with LEANLINKRESCUE=1
// (cap 3, rescue-tend-only below trust 40; see leanlinkrescue.js header).
// leanlinkrescue daily (armed) = competent.daily + leanlinkRescueCourtship,
// so the delta is EXACTLY that courtship: answer pending counters /
// accords / national / global beats, tend ONLY Haven-primary links below
// trust 40 weekly, propose from day 25, 1/day, 7-day cooldown, tribute
// 4000 kcal/week, subordinate cap 3. competent.daily contains NO scale
// verbs at all (no proposeLink/tendLink/answerCounter/answerAccord/
// answerNationalChoice/answerGlobalChoice/hierarchyState — proven by
// scripts/test-sim-leanlink-rescue.js T1), so the delta is the WHOLE
// courtship with the rescue cap and rescue-tend gate, not just the cap
// difference. This sweep only ever sets LEANLINKRESCUE=1 or deletes it.
//
// MEASUREMENT: 180d death-aware (runDays stops at engine endings; dead
// villages stop, +10d tail is the harness's own stop semantics — the
// sweep never extends a dead village). One loadGame per config, seeds
// sequential in one process per invocation (harness rule: never two
// harnesses in one process).
//
// WRITES: this process reads worktree files at loadGame, and the
// container's read-taint class blocks direct file writes from such a
// process (proven 2026-10-24 by sibling arms). ALL per-seed writes go
// through the chunked writer subprocess scripts/sim-postunlock2-b-writer.js
// (read-only reuse: it reads stdin only, never the worktree, so its
// writes succeed). Sweep stdout carries progress; the evidence file
// carries the judgment.
//
// SENSE MODE (SENSE=1): a SEPARATE narration-on run whose words only are
// judged — never its numbers. loadGame silences Game.say by default, so
// a silent pilot run has no transcript to judge; the sense run enables
// narration and records keyword courtship lines. Its corpus lives in a
// separate EVID dir and is excluded from the judged paired comparison.
//
// Usage:
//   ARM=control SEEDS=73501,73502 DAYS=180 EVID=<dir> node scripts/sim-leanlink-rescue-sweep.js
//   ARM=armed   SEEDS=73501,73502 DAYS=180 EVID=<dir> node scripts/sim-leanlink-rescue-sweep.js
//   SENSE=1 ARM=armed SEEDS=73501 DAYS=180 EVID=<sense-dir> node scripts/sim-leanlink-rescue-sweep.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync, execFileSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

const ARM = (process.env.ARM || '').trim();
if (ARM !== 'control' && ARM !== 'armed') { console.error('SWEEP STOP: ARM must be control|armed.'); process.exit(2); }
const SENSE = process.env.SENSE === '1';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
if (!SEEDS.length) { console.error('SWEEP STOP: SEEDS required.'); process.exit(2); }
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-leanlinkrescue');
try { fs.mkdirSync(EVID, { recursive: true }); } catch (e) { /* pre-created by coordinator; existing dir is fine */ }

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
const ANCHOR12 = ANCHOR.slice(0, 12);

function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }

// Write via the chunked writer subprocess (read-only reuse). Retries with
// backoff; a failed attempt never leaves a 0-byte corpse (writer uses a
// tmp file + hash-verified rename).
function writeViaWriter(p, body) {
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try {
      const out = execFileSync('node', [path.join(REPO, 'scripts', 'sim-postunlock2-b-writer.js'), p],
        { input: body, cwd: REPO, encoding: 'utf8', timeout: 600000 });
      const m = /WROTE ([0-9a-f]{12})/.exec(out || '');
      if (!m) throw new Error('writer gave no WROTE line: ' + String(out).slice(0, 200));
      const sha = crypto.createHash('sha256').update(body).digest('hex').slice(0, 12);
      if (m[1] !== sha) throw new Error('writer sha mismatch');
      return sha;
    } catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  throw lastErr;
}

function pantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function linksNow(Game) {
  try {
    const ls = Game.hierarchyState ? Game.hierarchyState() : [];
    return (ls || []).map(l => ({
      id: l && l.id, status: l && l.status, primary: l && l.primary,
      conquered: !!(l && l.conquered),
      trust: (l && (l.trust != null ? l.trust : (l.trustLevel != null ? l.trustLevel : null))),
      tendedWeek: l && l.tendedWeek, pendingDefense: !!(l && l.pendingDefense),
    }));
  } catch (e) { return []; }
}
function scaleRank(Game) { try { return Game.scaleRank ? Game.scaleRank() : 'village'; } catch (e) { return 'village'; } }

// SENSE FILTER (tightened after the control sense run): the broad filter
// ('fire', 'trust', ...) saturated the 600-line cap by day ~5 with generic
// village chatter and would have drowned the courtship beats. The tight
// filter keeps Haven's own courtship + scale beats and foreign-polity
// news (the world climbing around a silent player). 'counter' alone is
// excluded (the pantry counter); 'terms'/'table is set' carry counters.
const SAY_KEY = /⛓️|bows to Haven|NETWORK|First Court|table is being set|Watchers|accord|seasoned|polity|realm|oath|speaker at|council|tribute|gift talks|door is shut|doesn't say no|declines\.|cooling|drifting from ours/i;
const COURT_KEYS = ['courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'proposedLead', 'tended', 'defenseCalls'];

async function oneRun(seed) {
  const fn = path.join(EVID, `s${seed}-${ARM}.json`);
  if (fs.existsSync(fn)) {
    try {
      const d = JSON.parse(fs.readFileSync(fn, 'utf8'));
      if (d.seed === seed && d.arm === ARM && d.anchorCommit === ANCHOR && d.daysRequested === DAYS && Array.isArray(d.deaths)) {
        console.log(`SKIP resumed seed=${seed} arm=${ARM}`);
        return { seed, arm: ARM, resumed: true, days: d.days, gameDays: d.gameDays };
      }
      console.log(`RE-RUN seed=${seed} arm=${ARM}: existing file invalid or anchor/days mismatch`);
    } catch (e) { console.log(`RE-RUN seed=${seed} arm=${ARM}: unparseable (${String((e && e.message) || e).slice(0, 120)})`); }
  }

  // ONE DELTA ONLY: set the env exactly as the arm requires, before any daily runs.
  if (ARM === 'armed') process.env.LEANLINKRESCUE = '1';
  else delete process.env.LEANLINKRESCUE;
  const base = ARM === 'control'
    ? require(path.join(REPO, 'scripts', 'policies', 'competent')).competent
    : require(path.join(REPO, 'scripts', 'policies', 'leanlinkrescue')).leanlinkrescue;

  const acc = {
    prev: {}, counterEvents: [], formed: [], dissolved: [], weekly: [],
    sayLines: [], seen: {}, errors: [],
  };
  for (const k of COURT_KEYS) acc.prev[k] = 0;

  const wrapped = Object.assign({}, base, {
    id: ARM === 'control' ? 'competent' : 'leanlinkrescue-1',
    daily(Game, ctx) {
      try { base.daily(Game, ctx); } catch (e) { acc.errors.push('daily: ' + String((e && e.message) || e).slice(0, 120)); throw e; }
      try {
        const day = gday(Game);
        for (const k of COURT_KEYS) {
          const cur = ctx[k] || 0;
          if (cur > acc.prev[k]) {
            acc.counterEvents.push({ day, event: k, delta: cur - acc.prev[k], total: cur, pantry: pantryKcal(Game), rank: scaleRank(Game) });
            acc.prev[k] = cur;
          }
        }
        if (ctx.tendTrusts && ctx.tendTrusts.length > (acc.prevTendTrusts || 0)) {
          acc.tendTrusts = (acc.tendTrusts || []).concat(ctx.tendTrusts.slice(acc.prevTendTrusts || 0));
          acc.prevTendTrusts = ctx.tendTrusts.length;
        }
        const links = linksNow(Game);
        const activeIds = new Set();
        for (const l of links) {
          if (!l || !l.id) continue;
          if (l.status === 'active') activeIds.add(l.id);
          if (!acc.seen[l.id]) {
            acc.seen[l.id] = { firstDay: day, lastTrust: l.trust, lastStatus: l.status };
            acc.formed.push({ day, id: l.id, primary: l.primary, conquered: l.conquered, trust: l.trust });
          } else {
            acc.seen[l.id].lastTrust = l.trust; acc.seen[l.id].lastStatus = l.status;
          }
        }
        for (const id of Object.keys(acc.seen)) {
          if (acc.seen[id].lastStatus === 'active' && !activeIds.has(id) && !acc.seen[id].dissolved) {
            acc.seen[id].dissolved = true;
            acc.dissolved.push({ day, id, lastTrust: acc.seen[id].lastTrust });
          }
        }
        if (day % 7 === 0 || day === 1) {
          const subs = links.filter(l => l.status === 'active' && l.primary === 'haven' && !l.conquered);
          acc.weekly.push({ day, rank: scaleRank(Game), subs: subs.length,
            subTrusts: subs.map(l => l.trust), pantry: pantryKcal(Game) });
        }
      } catch (e) { acc.errors.push('wrapper: ' + String((e && e.message) || e).slice(0, 120)); }
    },
  });

  const { Game } = await loadGame({ seed, mode: 'leanlinkrescue', fullTelemetry: true, narration: SENSE });
  if (SENSE) {
    // Capture courtship narration (silent runs have no transcript to judge).
    const origSay = Game.say, origSys = Game.sysSay;
    const cap = (who, args) => {
      try {
        const text = args.map(a => String(a)).join(' ');
        if (SAY_KEY.test(text) && acc.sayLines.length < 600) {
          acc.sayLines.push({ day: gday(Game), who, text: text.slice(0, 400) });
        }
      } catch (e) {}
    };
    try { Game.say = function () { cap('say', Array.prototype.slice.call(arguments)); return origSay.apply(this, arguments); }; } catch (e) {}
    try { Game.sysSay = function () { cap('sys', Array.prototype.slice.call(arguments)); return origSys.apply(this, arguments); }; } catch (e) {}
  }
  await setupGame(Game);
  const initialScholarVid = (() => { try { return String(Game.villagerId || ''); } catch (e) { return ''; } })();
  let result;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });

  const st = Game.state || {};
  const rank = scaleRank(Game);
  let table = 0, exiled = 0, won = 0;
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  const deaths = (result.samples && result.samples.deaths) || [];
  const byCause = {};
  for (const d of deaths) byCause[d.cause || 'unknown'] = (byCause[d.cause || 'unknown'] || 0) + 1;
  const COMBAT_RE = /combat|fight|slain|killed|monster|raid|wound|duel|ambush|beast/i;
  const scholarDeaths = deaths.filter(d => d.player);
  const villagerDeaths = deaths.filter(d => !d.player);
  const villagerCombatDeaths = villagerDeaths.filter(d => COMBAT_RE.test(String(d.cause || '')));
  const finalLinks = linksNow(Game);
  const brokenLinks = finalLinks.filter(l => l.status === 'broken');
  const tendTrusts = acc.tendTrusts || [];
  const tendAbove40 = tendTrusts.filter(t => (t.trust || 0) >= 40).length;
  const finalSubs = finalLinks.filter(l => l.status === 'active' && l.primary === 'haven' && !l.conquered);
  const maxSubs = acc.weekly.reduce((m, w) => Math.max(m, w.subs || 0), 0);
  let otherVillages = 0, knownVillages = 0;
  try {
    const ovs = st.otherVillages || [];
    otherVillages = ovs.length;
    knownVillages = ovs.filter(v => { try { return Game.knowsVillage && Game.knowsVillage(v); } catch (e) { return false; } }).length;
  } catch (e) {}
  let finalRoster = 0, finalScholarVid = '';
  try { finalRoster = ((st.village || {}).roster || []).length; } catch (e) {}
  try { finalScholarVid = String((st.scholar || {}).villagerId || ''); } catch (e) {}

  const out = {
    seed, arm: ARM, sense: SENSE,
    policyId: wrapped.id,
    instrument: 'sim-harness runDays + daily-wrapper courtship/link recorder (no src/js, no policy changes)',
    substrate: ARM === 'armed' ? 'leanlinkrescue.js LEANLINKRESCUE=1 over competent.daily' : 'competent.js, LEANLINKRESCUE unset',
    anchorCommit: ANCHOR, anchor12: ANCHOR12,
    daysRequested: DAYS, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    scaleRank: rank, regional: rank !== 'village' ? 1 : 0,
    national: (rank === 'national' || rank === 'global') ? 1 : 0,
    global: rank === 'global' ? 1 : 0, table, won, exiled,
    maxWave: result.maxWaveUnlocked || 1,
    initialScholarVid, finalScholarVid, finalRoster,
    otherVillages, knownVillages,
    deaths: deaths.map(d => ({ day: d.day, kind: d.kind, who: d.who, cause: d.cause, player: !!d.player })),
    deathTotals: { total: deaths.length, scholar: scholarDeaths.length, villager: villagerDeaths.length,
      villagerCombat: villagerCombatDeaths.length, byCause },
    court: Object.fromEntries(COURT_KEYS.map(k => [k, acc.prev[k]])),
    tendTrusts, tendTrustMax: tendTrusts.reduce((m, t) => Math.max(m, t.trust || 0), -1),
    tendAbove40,
    links: { formed: acc.formed.length, dissolved: acc.dissolved.length,
      broken: brokenLinks.length, dissolvedCombined: acc.dissolved.length + brokenLinks.length,
      brokenDetail: brokenLinks,
      maxSubs, finalSubs: finalSubs.length, finalLinks, formedDetail: acc.formed, dissolvedDetail: acc.dissolved },
    trustWeekly: acc.weekly,
    counterEvents: acc.counterEvents,
    sayLines: acc.sayLines,
    errors: acc.errors,
  };
  const body = JSON.stringify(out, null, 1) + '\n';
  // PRINT_JSON=1 (EPERM-flap fallback): the full per-seed JSON also goes to
  // stdout BEFORE the file write, so a write-flap failure loses no data —
  // the corpus can be rebuilt from captured stdout once writes work again.
  if (process.env.PRINT_JSON === '1') console.log('SEEDJSON-BEGIN\n' + body + 'SEEDJSON-END');
  const sha = writeViaWriter(fn, body);
  console.log(`CONFIG ${JSON.stringify({ seed, arm: ARM, sense: SENSE, days: out.days, gameDays: out.gameDays, endReason: out.endReason, rank, national: out.national, table, won, exiled, maxWave: out.maxWave, deaths: deaths.length, formed: out.links.formed, dissolved: out.links.dissolved, sha })}`);
  return { seed, arm: ARM, resumed: false, days: out.days, gameDays: out.gameDays, endReason: out.endReason, rank, national: out.national, sha };
}

(async () => {
  console.log(`SIM-LEANLINKRESCUE-SWEEP-START anchor=${ANCHOR12} arm=${ARM} sense=${SENSE} seeds=${SEEDS.join(',')} days=${DAYS} evid=${EVID}`);
  const rows = [];
  for (const s of SEEDS) {
    const t0 = Date.now();
    const r = await oneRun(s);
    r.secs = 'n/a (frozen clock)';
    rows.push(r);
  }
  console.log(`SIM-LEANLINKRESCUE-SWEEP-DONE ${JSON.stringify({ ran: rows.filter(r => !r.resumed).length, resumed: rows.filter(r => r.resumed).length, anchor: ANCHOR12, arm: ARM })}`);
})().catch(e => { console.error('SWEEP FAILED: ' + ((e && e.stack) || e)); process.exit(1); });
