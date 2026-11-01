#!/usr/bin/env node
// scripts/sim-stay-a-sweep.js — sim-stay-a staying/morale pilot.
// DIAG ONLY: base code, no game change, no policy-default change.
// Band: sim-wave4leth-a PLAYED band VERBATIM (tableseat-nowait,
// LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware,
// fieldparty-form-diag reused VERBATIM, sortie-driver layer living
// ONLY in this script: once per lingerer episode, when a gorge line
// has been seen, call answerLingerer('sortie'); NO HP GATE) with ONE
// change: a POLICY switch selecting the judged daily policy.
//   POLICY=baseline     → tableseat-nowait (fresh baseline leg)
//   POLICY=holdline-off → holdline with HOLDLINE=0 (det-gate leg:
//                         must reproduce the baseline leg exactly)
//   POLICY=candidate    → holdline with HOLDLINE=1 (candidate leg)
// The read-only ammo-diag instrument (scripts/ammo-diag-20261031.js,
// det-gate proven) is installed IDENTICALLY in all legs for the
// secondary arrow-carriage census (backlog #1718). Symmetric
// instrumentation: any perturbation applies equally to both legs.
// Corpus: every wave-4 fieldFight on seeds 75101-75108, all caller
// classes, via the diag meetings PLUS this arm's recorder-only
// fieldFight wrapper (installed OUTSIDE the diag wrap so it sees the
// same rec): vHpLeft, minHpFrac, fleeHpFrac, rec.volley.dmg,
// allyHpLeft/allyDied parsed from rec.log (last "hits <allyName> for
// X (N left)" line; null = ally never struck, never guessed),
// ability-note inventory, pantry kcal at fight start, full rec.log
// for wave-4 fights only (sense transcripts).
// Say/answerLingerer wraps and the episode tracker are the sortiedpr
// recorder pattern (recorder-only, no game-state writes, no RNG
// draws). Modes: --one <seed> | --summary | (no args) pilot seeds
// then summary. Corpus: evidence/2026-11-01/sim-stay-a/<leg>/
// (EVID override). Exit 1 in --summary mode if the corpus is
// incomplete or any recorder errored/overflowed.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { holdline } = require('./policies/holdline');
const {
  newStore: newFieldpartyStore, installFieldpartyDiag, withFieldpartyDiag,
} = require('./policies/fieldparty-form-diag');
const ammoDiag = require('./ammo-diag-20261031');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const GORGE_RE = /🌙 Night\. The lingering (.*?) gorges at the treeline — ([\d,]+) kcal/;
const MUSTER_RE = /⚔️ SORTIE — (.*?) take up arms/;
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const POLICY = (process.env.POLICY || 'baseline').trim();
const LEGS = { baseline: 'baseline', 'holdline-off': 'holdline-off', candidate: 'candidate' };
if (!LEGS[POLICY]) { console.error('POLICY must be baseline|holdline-off|candidate, got ' + POLICY); process.exit(2); }

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
// Flap-hardened (2026-11-01 sim-stay-a: the intermittent host write-EPERM
// flap killed a 180d smoke at its terminal write after 8 attempts): 30
// attempts with growing sleeps. A corpus write failing LOUDLY after 30
// attempts aborts the leg; completed seeds' files persist and the leg
// can resume with SEEDS=<remaining>.
function writeFileRetry(p, body) {
  let lastErr = null;
  for (let a = 1; a <= 30; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return; }
    catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 30) sleepMs(Math.min(30000, 2000 * a));
    }
  }
  throw lastErr;
}
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return Math.round((Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); } catch (e) { return 0; }
}
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function lingerersNow(Game) {
  try { if (typeof Game.lingeringRaiders === 'function') return Game.lingeringRaiders() || []; } catch (e) {}
  try { return (Game.worldMonsters() || []).filter(m => m && m.lingering && (m.hp || 0) > 0); } catch (e) { return []; }
}
function waveOf(Game, m) {
  try { if (m && m.id && typeof Game.crisisWaveOf === 'function') { const w = Game.crisisWaveOf(m) | 0; if (w) return w; } } catch (e) {}
  try { const def = ((Game.data || {}).monsters || []).find(d => d && d.id === (m && m.id)); if (def && (def.wave | 0)) return def.wave | 0; } catch (e) {}
  return 1;
}
function snap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}
function deathSummary(deaths) {
  const m = {};
  for (const d of (deaths || [])) { const k = (d.player ? 'player:' : 'villager:') + String(d.cause || 'unknown'); m[k] = (m[k] || 0) + 1; }
  return m;
}
function evidDirOf() { return path.join(process.env.EVID || path.join(REPO, 'evidence', '2026-11-01', 'sim-stay-a', LEGS[POLICY])); }

// Parse ally end-HP from rec.log: last "hits <allyName> for X (N left)".
// Returns { allyHpLeft, allyDied } with allyHpLeft null when never struck.
function allyEndFromLog(log, allyName) {
  if (!allyName || !Array.isArray(log)) return { allyHpLeft: null, allyDied: null };
  const esc = String(allyName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('hits ' + esc + ' for (\\d+) \\((\\d+) left\\)');
  let last = null;
  for (const line of log) { const m = re.exec(String(line)); if (m) last = parseInt(m[2], 10); }
  if (last === null) return { allyHpLeft: null, allyDied: null };
  return { allyHpLeft: last, allyDied: last <= 0 };
}
// Ability-note inventory: parenthetical tags on strike lines, counted.
function abilityNotes(log) {
  const notes = {};
  if (!Array.isArray(log)) return notes;
  for (const line of log) {
    const s = String(line);
    if (!/^R\d+: /.test(s) && !s.startsWith('  loosed')) continue;
    const tags = s.match(/\(([^)]+)\)/g) || [];
    for (const t of tags) {
      const inner = t.slice(1, -1);
      if (/left$/.test(inner) || /^\d+\/\d+ hit/.test(inner) || /spent/.test(inner)) continue;
      notes[inner] = (notes[inner] || 0) + 1;
    }
  }
  return notes;
}

function policyForLeg() {
  if (POLICY === 'baseline') return { base: tableseatNowait, baseId: 'tableseat-nowait' };
  return { base: holdline, baseId: 'holdline' };
}

async function runOne(seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FIELDPARTY = '1';
  process.env.HOLDLINE = (POLICY === 'candidate') ? '1' : '0';
  const { base, baseId } = policyForLeg();
  const fpStore = newFieldpartyStore();
  const wrapped = withFieldpartyDiag(base, 'fieldparty-diag', baseId + ' + field-party formation census', fpStore);
  const ammoStore = { fights: [], pocketCalls: [], departures: [], weaponFirstSeen: {}, pocketOverflow: 0, fieldFightCalls: 0, lowWaveFights: 0, instrumentErrors: [] };
  const { Game } = await loadGame({ seed, mode: 'stay-a', fullTelemetry: false });
  await setupGame(Game);
  try { installFieldpartyDiag(Game, fpStore); } catch (e) {}
  // Ammo-diag installed identically in every leg (read-only wrappers;
  // call-through, no RNG, no game-state writes). Installed AFTER the
  // fieldparty wrap so the stack shape matches across legs.
  try { ammoDiag.install(Game, ammoStore); } catch (e) { ammoStore.instrumentErrors.push('install: ' + String((e && e.message) || e)); }

  const opp = { gorgeNights: [], sortieMusters: [], sortieAttempts: [], episodes: [], lingererDays: 0, answerCalls: 0 };
  const w4 = []; // this arm's wave-4 fight rows (wrapper-level)
  let wrapErrs = 0;
  const wrapErrors = [];

  const _say = Game.say ? Game.say.bind(Game) : null;
  if (_say) {
    Game.say = function (t) {
      try {
        const line = String(t), day = dayOf(Game);
        const gm = GORGE_RE.exec(line);
        if (gm) opp.gorgeNights.push({ day, monster: gm[1], kcal: parseInt(gm[2].replace(/,/g, ''), 10) || 0 });
        if (MUSTER_RE.test(line)) opp.sortieMusters.push({ day, line: line.slice(0, 300) });
      } catch (e) {}
      return _say(t);
    };
  }
  const _ans = Game.answerLingerer ? Game.answerLingerer.bind(Game) : null;
  if (_ans) {
    Game.answerLingerer = function (how) {
      const before = pantryKcal(Game);
      let lingBefore = [];
      try { lingBefore = lingerersNow(Game).map(m => ({ id: m.id, hp: m.hp || 0 })); } catch (e) {}
      let r = null;
      try { r = _ans(how); } catch (e) { r = { threw: String(e && e.message).slice(0, 120) }; }
      try {
        opp.answerCalls++;
        opp.sortieAttempts.push({
          day: dayOf(Game), how: String(how),
          ret: (r && typeof r === 'object') ? { ok: !!r.ok, cleared: r.cleared, broke: !!r.broke, remaining: r.remaining, paid: r.paid, why: r.why || null } : String(r),
          pantryBefore: before, pantryAfter: pantryKcal(Game), lingerersBefore: lingBefore,
        });
      } catch (e) {}
      return r;
    };
  }
  // Recorder-only wrapper OUTSIDE the diag wraps: same rec, extra fields.
  if (Game.fieldFight) {
    const _ff = Game.fieldFight.bind(Game);
    Game.fieldFight = function (vid, mdef, m, opts) {
      const pantryBefore = pantryKcal(Game);
      const dayBefore = dayOf(Game);
      // mHpStart MUST be snapshotted pre-fight: the live monster object is
      // mutated by the fight, so a post-fight read returns end HP, not
      // start HP (caught 2026-11-01 on wave4leth: wrapper mHpStart equalled
      // diag mHpLeft on fled fights).
      const mHpStartPre = (m && m.hp != null) ? Math.round(m.hp) : null;
      let rec = null;
      try { rec = _ff(vid, mdef, m, opts); } catch (e) { throw e; }
      try {
        const live = m || null, defObj = mdef || null;
        const wave = waveOf(Game, live || defObj);
        if (wave === 4) {
          const allyVid = (rec && rec.allyVid != null) ? String(rec.allyVid) : null;
          const allyName = allyVid ? rawName(Game, allyVid) : null;
          const allyEnd = allyEndFromLog(rec ? rec.log : null, allyName);
          const stack = (new Error()).stack || '';
          const names = [];
          for (const line of stack.split('\n')) { const mm = line.match(/at\s+(?:Object\.)?([A-Za-z_$][\w$]*)/); if (mm && names.indexOf(mm[1]) < 0) names.push(mm[1]); }
          let caller = 'other';
          if (names.indexOf('lingererSortie') >= 0) caller = 'sortie';
          else if (names.indexOf('aidFight') >= 0) caller = 'aid';
          else if (names.indexOf('resolvePatrol') >= 0) caller = 'patrol';
          else if (names.indexOf('resolveWildMonsterEncounter') >= 0) caller = 'resolve';
          w4.push({
            day: dayBefore, vid: vid != null ? String(vid) : null,
            leaderName: rawName(Game, vid),
            mid: (live && live.id) || (defObj && defObj.id) || null,
            caller, stackNames: names.slice(0, 20).join(','),
            mHpStart: mHpStartPre,
            outcome: rec ? (rec.outcome || null) : null, rounds: rec ? (rec.rounds | 0) : null,
            mDealt: rec ? (rec.mDealt | 0) : null, vTaken: rec ? (rec.vTaken | 0) : null,
            vHpLeft: rec ? (rec.vHpLeft != null ? Math.round(rec.vHpLeft) : null) : null,
            mHpLeft: rec ? (rec.mHpLeft != null ? Math.round(rec.mHpLeft) : null) : null,
            minHpFrac: rec ? (rec.minHpFrac != null ? +rec.minHpFrac.toFixed(3) : null) : null,
            fleeHpFrac: rec ? (rec.fleeHpFrac != null ? +rec.fleeHpFrac.toFixed(3) : null) : null,
            allyVid, allyName, joined: !!allyVid,
            allyDealt: rec ? (rec.allyDealt | 0) : null, allyTaken: rec ? (rec.allyTaken | 0) : null,
            allyHpLeft: allyEnd.allyHpLeft, allyDied: allyEnd.allyDied,
            engineAllies: (opts && opts.allies != null) ? (opts.allies | 0) : null,
            allyVids: (opts && Array.isArray(opts.allyVids)) ? opts.allyVids.map(a => String(a)) : [],
            allyFromStart: !!(opts && opts.allyFromStart), cornered: !!(opts && opts.cornered),
            calledHelp: rec ? !!rec.calledHelp : null,
            everHopeless: rec ? !!rec.everHopeless : null, everWinning: rec ? !!rec.everWinning : null,
            fleeHopeless: rec ? !!rec.fleeHopeless : null, fleeLearn: rec ? !!rec.fleeLearn : null,
            volleyDmg: (rec && rec.volley) ? (rec.volley.dmg | 0) : 0,
            volleyShots: (rec && rec.volley) ? (rec.volley.shots | 0) : 0,
            abilityNotes: abilityNotes(rec ? rec.log : null),
            pantryBefore, log: (rec && rec.log) ? rec.log.slice(0, 200) : [],
          });
        }
      } catch (e) { wrapErrs++; wrapErrors.push(String((e && e.message) || e).slice(0, 160)); }
      return rec;
    };
  }

  const tracked = new Map();
  function episodeDayHook() {
    try {
      const now = lingerersNow(Game);
      const nowSet = new Set(now);
      for (const [obj, ep] of [...tracked]) {
        if (!nowSet.has(obj)) {
          opp.episodes.push({ firstDay: ep.firstDay, lastDay: dayOf(Game), gorgeSeen: ep.gorgeSeen, sortied: ep.sortied, sortieDay: ep.sortieDay || null });
          tracked.delete(obj);
        }
      }
      for (const obj of now) {
        if (!tracked.has(obj)) tracked.set(obj, { firstDay: dayOf(Game), gorgeSeen: false, sortied: false, sortieDay: null });
      }
      opp.lingererDays += now.length;
      if (opp.gorgeNights.some(g => g.day <= dayOf(Game))) for (const ep of tracked.values()) ep.gorgeSeen = true;
      if (_ans) {
        const cands = [...tracked.values()].filter(ep => ep.gorgeSeen && !ep.sortied);
        if (cands.length) {
          for (const ep of cands) { ep.sortied = true; ep.sortieDay = dayOf(Game); }
          try { Game.answerLingerer('sortie'); } catch (e) {}
        }
      }
    } catch (e) {}
  }

  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  // Holdline-layer attribution, recorder-only: snapshot patrol assignments
  // around wrapped.daily. The base policy never assigns patrol (verified:
  // competent assigns water/wood/garden/fish only; leanlinkrescue and
  // tableseat assign no tasks), so any NEW patrol assignment after a
  // daily is the holdline layer's — and the baseline leg must read 0,
  // which is the negative control. Pure state reads + own counters.
  const hlDaily = { days: 0, atHavenDays: 0, newPatrol: 0, patrolDays: 0 };
  const policy = Object.assign({}, wrapped, {
    daily(G, ctx) {
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
      } catch (e) {}
      try { ammoDiag.scanDay(G, ammoStore); } catch (e) {}
      let beforePatrol = null;
      try {
        const asg = (G.state.village || {}).assignments || {};
        beforePatrol = new Set(Object.entries(asg).filter(([, a]) => a && a.task === 'patrol').map(([vid]) => vid));
        if (G.playerAtHaven && G.playerAtHaven()) hlDaily.atHavenDays++;
      } catch (e) {}
      if (wrapped.daily) { try { wrapped.daily(G, ctx); } catch (e) {} }
      try {
        const asg = (G.state.village || {}).assignments || {};
        let added = 0;
        for (const [vid, a] of Object.entries(asg)) {
          if (a && a.task === 'patrol' && !(beforePatrol && beforePatrol.has(vid))) added++;
        }
        if (added > 0) { hlDaily.newPatrol += added; hlDaily.patrolDays++; }
        hlDaily.days++;
      } catch (e) {}
      episodeDayHook();
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  for (const [obj, ep] of [...tracked]) {
    opp.episodes.push({ firstDay: ep.firstDay, lastDay: dayOf(Game), gorgeSeen: ep.gorgeSeen, sortied: ep.sortied, sortieDay: ep.sortieDay || null, open: true });
  }
  const end = snap(Game);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  let tableState = null;
  try { const tst = Game.tableState ? Game.tableState() : null; if (tst) tableState = { path: tst.path || null, branch: tst.branch || null, phase: tst.phase || null, seat: tst.seat || null }; } catch (e) {}
  const row = {
    policy: POLICY + '-played-sortie-driver', band: 'played', seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    finalRank: end.rank,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    nationalEver: Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    nationalFinal: (RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    entered: (hist.everEntered || end.tableEntered) ? 1 : 0,
    deaths: deathSummary(deaths),
    deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    tableState,
    opportunities: opp,
    hlDaily,
    wave4Fights: w4,
    wrapDiag: { errs: wrapErrs, errors: wrapErrors.slice(0, 20) },
    fieldparty: fpStore ? {
      meetings: fpStore.meetings, partCounter: fpStore.partCounter,
      diag: { errs: fpStore.errs, errors: fpStore.errors, overflow: fpStore.overflow, installed: fpStore.installed },
    } : null,
    ammo: {
      fights: ammoStore.fights, pocketCalls: ammoStore.pocketCalls, departures: ammoStore.departures,
      weaponFirstSeen: ammoStore.weaponFirstSeen, pocketOverflow: ammoStore.pocketOverflow,
      fieldFightCalls: ammoStore.fieldFightCalls, lowWaveFights: ammoStore.lowWaveFights,
      instrumentErrors: ammoStore.instrumentErrors,
    },
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-played.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const rows = [];
  for (const seed of SEEDS) rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-played.json`), 'utf8')));
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && r.fieldparty && Array.isArray(r.fieldparty.meetings)
    && r.fieldparty.diag.errs === 0 && Object.values(r.fieldparty.diag.overflow || {}).every(v => (v | 0) === 0)
    && (r.wrapDiag.errs | 0) === 0
    && r.ammo && (r.ammo.instrumentErrors || []).length === 0 && (r.ammo.pocketOverflow | 0) === 0);
  const w4 = [];
  for (const r of rows) for (const f of (r.wave4Fights || [])) w4.push(Object.assign({ seed: r.seed }, f));
  const summary = { band: 'played', policy: POLICY, corpusOk,
    rows: rows.map(r => ({ seed: r.seed, days: r.days, end: r.endReason, wave: r.waveReach, won: r.won, w4: (r.wave4Fights || []).length })),
    w4Total: w4.length };
  writeFileRetry(path.join(evidDir, 'summary.json'), JSON.stringify(summary, null, 1) + '\n');
  console.log(`=== sim-stay-a ${POLICY} ===`);
  console.log(`corpus: rows=${rows.length}/${SEEDS.length} ok=${corpusOk} wave4Fights=${w4.length}`);
  for (const r of rows) console.log(`  s${r.seed} days=${r.days} end=${r.endReason} wave=${r.waveReach} won=${r.won} w4=${(r.wave4Fights || []).length} fpMeetings=${(r.fieldparty.meetings || []).length} fpErrs=${r.fieldparty.diag.errs} wrapErrs=${r.wrapDiag.errs} ammoErrs=${(r.ammo.instrumentErrors || []).length}`);
  if (!corpusOk) { console.log('CORPUS-INVALID'); process.exit(1); }
}

async function main() {
  const args = process.argv.slice(2);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  if (args[0] === '--summary') { await summaryMode(); return; }
  if (args[0] === '--one') {
    const seed = parseInt(args[1], 10);
    const evidDir = evidDirOf();
    fs.mkdirSync(evidDir, { recursive: true });
    const row = await runOne(seed, days, evidDir);
    console.log(`  [${POLICY} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} won=${row.won} w4=${row.wave4Fights.length} fpMeetings=${row.fieldparty.meetings.length} fpErrs=${row.fieldparty.diag.errs} wrapErrs=${row.wrapDiag.errs} ammoErrs=${row.ammo.instrumentErrors.length}`);
    return;
  }
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  for (const seed of SEEDS) {
    const row = await runOne(seed, days, evidDir);
    console.log(`  [${POLICY} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} won=${row.won} w4=${row.wave4Fights.length} fpMeetings=${row.fieldparty.meetings.length} fpErrs=${row.fieldparty.diag.errs} wrapErrs=${row.wrapDiag.errs} ammoErrs=${row.ammo.instrumentErrors.length}`);
  }
  await summaryMode();
}

if (require.main === module) {
  main().catch(e => { console.error('SWEEP-FAIL', e && e.stack || e); process.exit(1); });
}
module.exports = { runOne, summaryMode, evidDirOf, SEEDS, POLICY, allyEndFromLog, abilityNotes, waveOf, medianOf };
