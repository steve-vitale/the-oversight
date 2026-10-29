#!/usr/bin/env node
// scripts/test-geartier-a-sweep.js — sim-geartier-a PILOT/CONFIRM sweep.
// Two arms on identical seeds, same VERBATIM substrate
// (tableseat-nowait, LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d
// death-aware) + the fieldparty-form-diag recorder reused VERBATIM
// (never edited). The arms differ ONLY by a sweep-script-only
// fieldFight wrapper (never a policy default, never game code):
//   natural — wrapper is READ-ONLY: records snare fields per fight
//     (heldSnare, snareSet, snareDamage) + day-7/end holder snapshots.
//     It grants nothing, draws no RNG, changes no behavior.
//   armed   — SATURATION instrument: the wrapper equips tangle_line
//     on every fieldFight leader before the fight (push to their own
//     items; fight-entry gearUp equips it if an acc slot is free —
//     slot competition stays honest). This measures the ACTION's
//     ceiling in the wild, not the earn rate. Disclosed as such.
// Join: wrapper fights and fieldparty meetings are the same
// fieldFight call sequence, so they join by order index; the
// analyzer verifies mid+vid at every index and reports any
// mismatch instead of silently joining.
// Judged-data paths report errors via wrapErrs (house rule: no
// empty catch in new code); probe reads with safe defaults keep
// the predecessors' pattern.
// Modes: --one <band> <seed> | --summary <band> | (no args) pilot.
// Corpus: evidence/2026-10-29/perseed-geartier-a/<band>/ (EVID override).
// Exit 1 in --summary mode if the corpus is incomplete, any recorder
// errored/overflowed, any wrapper error logged, or any join mismatched.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const {
  newStore: newFieldpartyStore, installFieldpartyDiag, withFieldpartyDiag,
} = require('./policies/fieldparty-form-diag');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function meanOf(arr) { return arr.length ? arr.reduce((t, x) => t + x, 0) / arr.length : 0; }
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function writeFileRetry(p, body) {
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return; }
    catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  // EPERM-flap fallback (2026-10-24 lesson): /tmp has been flap-free
  // for evidence writes when the worktree is not. The caller copies
  // fallback files into the corpus dir before --summary; the row is
  // never silently lost. Never throw away a completed seed-run.
  try {
    const fb = path.join('/tmp', 'geartier-fallback', path.basename(path.dirname(p)) + '-' + path.basename(p));
    fs.mkdirSync(path.dirname(fb), { recursive: true });
    fs.writeFileSync(fb, body);
    console.log(`WRITE-FALLBACK ${p} -> ${fb}`);
    return;
  } catch (e) { console.log(`WRITE-FALLBACK-FAILED ${String((e && e.message) || e).slice(0, 160)}`); }
  throw lastErr;
}
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function snap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}
function deathSummary(deaths) {
  const m = {};
  for (const d of (deaths || [])) {
    const k = (d.player ? 'player:' : 'villager:') + String(d.cause || 'unknown');
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}
function evidDirOf(band) { return path.join(process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-geartier-a'), band); }
function makeErrLog() {
  const errs = [];
  return { errs, note: (where, e) => { errs.push(where + ': ' + String((e && e.message) || e).slice(0, 120)); } };
}

function holderScan(Game, errLog) {
  // Roster villagers only (joiners appear here too — flagged by the
  // analyzer against the day-7 roster, never silently counted).
  const out = [];
  try {
    const roster = ((Game.state || {}).village || {}).roster || [];
    for (const vid of roster) {
      let person = null;
      try { person = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) { if (errLog) errLog.note('holderScan.getPerson', e); }
      if (!person) continue;
      const has = (list) => (list || []).some(e => {
        const id = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
        return id === 'tangle_line';
      });
      const eq = person.equipped || {};
      const equipped = ['acc1', 'acc2', 'acc3', 'acc4'].some(s => {
        const e = eq[s]; const id = (typeof e === 'string') ? e : (e && (e.itemId || e.id));
        return id === 'tangle_line';
      });
      const carried = has(person.items);
      const stashed = has(person.stashed);
      if (carried || equipped || stashed) out.push({ vid, carried, equipped, stashed });
    }
  } catch (e) { if (errLog) errLog.note('holderScan', e); }
  return out;
}

async function runOne(seed, days, evidDir, band) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FIELDPARTY = '1';
  const fpStore = newFieldpartyStore();
  const base = withFieldpartyDiag(tableseatNowait, 'fieldparty-diag', 'tableseat-nowait + field-party formation census', fpStore);
  const { Game } = await loadGame({ seed, mode: 'geartier-a-' + band, fullTelemetry: false });
  await setupGame(Game);
  try { installFieldpartyDiag(Game, fpStore); } catch (e) { console.log('FIELD PARTY DIAG INSTALL FAILED: ' + String((e && e.message) || e).slice(0, 160)); }

  const fights = [];
  let granted = 0;
  const errLog = makeErrLog();
  const _ff = Game.fieldFight ? Game.fieldFight.bind(Game) : null;
  if (_ff) {
    Game.fieldFight = function (...args) {
      const vid = args[0], mdef = args[1] || {};
      let grantedHere = false;
      if (band === 'armed') {
        try {
          const person = Game.getPerson ? Game.getPerson(vid) : null;
          if (person && !person.dead) {
            person.items = person.items || [];
            const has = person.items.some(e => {
              const id = (typeof e === 'string') ? e : (e && (e.itemId || e.id));
              return id === 'tangle_line';
            });
            if (!has) { person.items.push('tangle_line'); granted++; grantedHere = true; }
          }
        } catch (e) { errLog.note('armed.grant', e); }
      }
      const r = _ff(...args);
      try {
        let heldSnare = false;
        try {
          const person = Game.getPerson ? Game.getPerson(vid) : null;
          const eq = (person && person.equipped) || {};
          heldSnare = ['acc1', 'acc2', 'acc3', 'acc4'].some(s => {
            const e = eq[s]; const id = (typeof e === 'string') ? e : (e && (e.itemId || e.id));
            return id === 'tangle_line';
          });
        } catch (e) { errLog.note('fight.heldSnare', e); }
        fights.push({ day: dayOf(Game), vid: String(vid), mid: mdef.id || null, wave: mdef.wave || null,
          outcome: r.outcome || null, rounds: r.rounds | 0, mDealt: r.mDealt | 0, vTaken: r.vTaken | 0,
          allyDealt: r.allyDealt | 0, heldSnare, snareSet: !!r.snareSet,
          snareDamage: r.snareDamage | 0, snareTicks: r.snareTicks | 0, granted: grantedHere });
      } catch (e) { errLog.note('fight.record', e); }
      return r;
    };
  }

  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  let day7 = null, day7Roster = [];
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
      } catch (e) {}
      if (base.daily) { try { base.daily(G, ctx); } catch (e) {} }
      if (day7 === null && dayOf(G) >= 7) {
        day7 = holderScan(G, errLog);
        try { day7Roster = (((G.state || {}).village || {}).roster || []).slice(); } catch (e) { errLog.note('day7Roster', e); }
      }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  let tableState = null;
  try { const tst = Game.tableState ? Game.tableState() : null; if (tst) tableState = { path: tst.path || null, branch: tst.branch || null, phase: tst.phase || null, seat: tst.seat || null }; } catch (e) {}
  const row = {
    policy: 'tableseat-nowait', band, seed,
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
    fights, granted,
    day7Holders: day7 || [], day7Roster,
    endHolders: holderScan(Game, errLog),
    wrapErrs: errLog.errs,
    fieldparty: fpStore ? {
      meetings: fpStore.meetings, partCounter: fpStore.partCounter,
      diag: { errs: fpStore.errs, errors: fpStore.errors, overflow: fpStore.overflow, installed: fpStore.installed },
    } : null,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${band}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

async function summaryMode(band) {
  const evidDir = evidDirOf(band);
  const rows = [];
  for (const seed of SEEDS) rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-${band}.json`), 'utf8')));
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && r.fieldparty && Array.isArray(r.fieldparty.meetings)
    && r.fieldparty.diag.errs === 0 && Object.values(r.fieldparty.diag.overflow || {}).every(v => (v | 0) === 0)
    && (r.wrapErrs || []).length === 0);
  // Join wrapper fights to recorder meetings by order index, verified.
  let joinMismatch = 0;
  const joined = [];
  for (const r of rows) {
    const ms = r.fieldparty.meetings || [], fs = r.fights || [];
    if (ms.length !== fs.length) joinMismatch += Math.abs(ms.length - fs.length);
    const n = Math.min(ms.length, fs.length);
    for (let i = 0; i < n; i++) {
      const m = ms[i], f = fs[i];
      if (m.mid !== f.mid || String(m.vid) !== String(f.vid)) joinMismatch++;
      joined.push(Object.assign({ seed: r.seed }, m, {
        wHeldSnare: f.heldSnare, wSnareSet: f.snareSet, wSnareDamage: f.snareDamage,
        wSnareTicks: f.snareTicks, wGranted: f.granted, wDay: f.day,
      }));
    }
  }
  const judgedU = joined.filter(m =>
    m.wave === 4 && m.channel === 'field' && ['resolve', 'patrol', 'aid'].includes(m.caller)
    && !(m.leader && m.leader.isScholar));
  const foughtU = judgedU.filter(m => (m.rounds | 0) >= 1);
  const bandOut = {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    wonFull: rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length,
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
  };
  const deathsByCause = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;
  // P3 earn census (natural arm only; armed is grant-polluted by design).
  let earnedClean = [], earnedJoiner = [];
  if (band === 'natural') {
    for (const r of rows) {
      const d7 = new Map((r.day7Holders || []).map(h => [h.vid, h]));
      const d7Roster = new Set(r.day7Roster || []);
      for (const h of (r.endHolders || [])) {
        if (!d7.has(h.vid)) {
          if (d7Roster.has(h.vid)) earnedClean.push({ seed: r.seed, vid: h.vid, carried: h.carried, equipped: h.equipped, stashed: h.stashed });
          else earnedJoiner.push({ seed: r.seed, vid: h.vid, carried: h.carried, equipped: h.equipped, stashed: h.stashed });
        }
      }
      for (const f of (r.fights || [])) {
        if (f.heldSnare && f.day > 14 && d7Roster.has(f.vid) && !d7.has(f.vid)
          && !earnedClean.some(e => e.seed === r.seed && e.vid === f.vid)) {
          earnedClean.push({ seed: r.seed, vid: f.vid, via: 'fight', day: f.day });
        }
      }
    }
  }
  const summary = { band, bandOut, deathsByCause,
    corpusOk, joinMismatch,
    meetings: joined.length, judgedU: judgedU.length, foughtU: foughtU.length,
    judged: {
      kills: foughtU.filter(m => m.outcome === 'vKill').length,
      drives: foughtU.filter(m => m.outcome === 'mFlee').length,
      fled: foughtU.filter(m => m.outcome === 'vFlee').length,
      died: foughtU.filter(m => m.outcome === 'vDie').length,
      outcomes: foughtU.map(m => m.outcome).join('/'),
      mDealtMean: +meanOf(foughtU.map(m => m.mDealt || 0)).toFixed(1),
      mDealtMed: medianOf(foughtU.map(m => m.mDealt || 0)),
      roundsMed: medianOf(foughtU.map(m => m.rounds || 0)),
      roundsMean: +meanOf(foughtU.map(m => m.rounds || 0)).toFixed(2),
      snareSet: foughtU.filter(m => m.wSnareSet).length,
      snareDamageMean: +meanOf(foughtU.map(m => m.wSnareDamage || 0)).toFixed(1),
      heldSnare: foughtU.filter(m => m.wHeldSnare).length,
    },
    granted: rows.reduce((t, r) => t + (r.granted || 0), 0),
    earnedClean, earnedJoiner,
  };
  writeFileRetry(path.join(evidDir, 'summary.json'), JSON.stringify(summary, null, 1) + '\n');
  console.log(`=== sim-geartier-a ${band} ===`);
  console.log(`corpus: rows=${rows.length}/${SEEDS.length} ok=${corpusOk} joinMismatch=${joinMismatch} wrapErrs=${rows.reduce((t, r) => t + (r.wrapErrs || []).length, 0)} meetings=${joined.length} judgedU=${judgedU.length} foughtU=${foughtU.length}`);
  console.log(`JUDGED-U: kills=${summary.judged.kills} drives=${summary.judged.drives} fled=${summary.judged.fled} died=${summary.judged.died} mDealtMean=${summary.judged.mDealtMean} mDealtMed=${summary.judged.mDealtMed} roundsMed=${summary.judged.roundsMed} roundsMean=${summary.judged.roundsMean} snareSet=${summary.judged.snareSet}/${foughtU.length} heldSnare=${summary.judged.heldSnare} granted=${summary.granted}`);
  console.log(`WALL: won=${bandOut.won} (full=${bandOut.wonFull}) natEver=${bandOut.nationalEver} natFinal=${bandOut.nationalFinal} table=${bandOut.table} entered=${bandOut.entered} wave4=${bandOut.wave4} wave5=${bandOut.wave5} median=${bandOut.medianDays} starv=${bandOut.starvationTotal} deaths=${bandOut.deathTotal}`);
  console.log(`DEATHS-BY-CAUSE: ${JSON.stringify(deathsByCause)}`);
  if (band === 'natural') console.log(`EARN: clean=${earnedClean.length} ${JSON.stringify(earnedClean)} joinerFlagged=${earnedJoiner.length} ${JSON.stringify(earnedJoiner)}`);
  for (const r of rows) {
    console.log(`  s${r.seed} days=${r.days} end=${r.endReason} won=${r.won} wave=${r.waveReach} fights=${(r.fights || []).length} fpMeetings=${(r.fieldparty.meetings || []).length} fpErrs=${r.fieldparty.diag.errs} wrapErrs=${(r.wrapErrs || []).length} granted=${r.granted} day7Holders=${(r.day7Holders || []).length} endHolders=${(r.endHolders || []).length} starv=${r.starvationDeaths} deaths=${r.deathTotal}`);
  }
  if (!corpusOk || joinMismatch) { console.log('CORPUS-INVALID'); process.exit(1); }
}

async function main() {
  const args = process.argv.slice(2);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  if (args[0] === '--summary') { await summaryMode(args[1] || 'natural'); return; }
  if (args[0] === '--one') {
    const band = args[1], seed = parseInt(args[2], 10);
    const evidDir = evidDirOf(band);
    fs.mkdirSync(evidDir, { recursive: true });
    const row = await runOne(seed, days, evidDir, band);
    console.log(`  [${band} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} won=${row.won} fights=${row.fights.length} fpMeetings=${row.fieldparty.meetings.length} fpErrs=${row.fieldparty.diag.errs} wrapErrs=${row.wrapErrs.length} granted=${row.granted} day7Holders=${row.day7Holders.length} endHolders=${row.endHolders.length}`);
    return;
  }
  for (const band of ['natural', 'armed']) {
    const evidDir = evidDirOf(band);
    for (const seed of SEEDS) {
      const row = await runOne(seed, days, evidDir, band);
      console.log(`  [${band} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} won=${row.won} fights=${row.fights.length} fpMeetings=${row.fieldparty.meetings.length} fpErrs=${row.fieldparty.diag.errs} wrapErrs=${row.wrapErrs.length} granted=${row.granted} day7Holders=${row.day7Holders.length} endHolders=${row.endHolders.length}`);
    }
    await summaryMode(band);
  }
}
main().catch(e => { console.error('GEARTIER SWEEP FAILED:', e && e.stack || e); process.exit(1); });
