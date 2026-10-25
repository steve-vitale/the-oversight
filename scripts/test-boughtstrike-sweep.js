#!/usr/bin/env node
// scripts/test-boughtstrike-sweep.js — sim-boughtstrike-a pilot + proof
// (scale-onramp axis, 2026-10-25, FIELD-fight wave-4 one-shot cap PLUS
// a spendable bought round: the villager's round-2 strike deals 2x).
//
// QUESTION (from sim-scale-onramp-round-0730, metric review item 3):
// the oneshotcap companion bought a round but gave the villager nothing
// to spend it on — villagers fled or died one round later, field deaths
// 12 -> 13, KILLED at pilot. This arm is the SECOND half of the 0730Z
// next blank (1): the SAME cap (a single round's damage to a villager
// in a FIELD fight, wave 4+, capped below half max HP — 100-HP villager
// vs a real wave-4 eater at max rolls: uncapped 160, capped exactly 49),
// AND the bought round is spendable by striking back: the villager's
// next attack (round 2 only) deals 2x damage. No other change: if the
// villager still dies in round 2, that is measured, not hidden. This
// is the "strike" way to spend the bought round, as an ALTERNATIVE to
// the sibling flee arm — at most one of the two lands.
//
// PAIRING (exact, identical seeds; ONE config per invocation because the
// lever is game code, not a policy toggle):
//   control = tableseat-nowait + deathcensus recorder, run BEFORE the
//     game-code edit (worktree clean). Must replicate the 0644Z controls
//     exactly, or STOP — never judge against a stale baseline.
//   armed   = same substrate + recorder, run AFTER the game-code edit.
//     The ONLY delta between control and armed corpora is the
//     cap-plus-boost. SCOPE of the game change (flag-gated, fieldguard
//     pattern): the cap+boost fire ONLY when the caller passes
//     opts.boughtStrike — the wild-encounter router (non-raid, non-aid)
//     and expedition meetings. Raid, arena (noFlee), contest, aid,
//     sortie, alien, patrol, and tb routes NEVER carry the flag, and
//     the scholar is never guarded. Wave-1/2/3 are NOT softened.
//   CONFIG env (control|armed) selects the filename tag; the script never
//     changes game code itself.
// Modes:
//   default (sweep): SEEDS env (default 73671-73678), DAYS=180 (default).
//     Per-seed corpus rows into evidence/2026-10-25/perseed-boughtstrike-a/
//     via the shared writer (same write-retry discipline as the
//     deathcensus sweep). Exit 0 on a completed sweep regardless of
//     GO/NO-GO (the verdict is data); exit 1 on a sweep error.
//   --probe: scripted field meeting: a 100-HP villager vs a real wave-4
//     eater with max-roll RNG, called with opts.boughtStrike. Asserts
//     the cap fires (rec.oneShotCapFires), the pre-cap round-1 damage
//     would have one-shot (>= entry HP), the capped round-1 damage is
//     < 50% of max HP, the villager survives round 1, AND a boosted
//     strike lands in round 2 (rec.boughtStrikeFires >= 1, and the
//     round-2 strike damage is exactly 2x the round-1 strike damage —
//     same villager, same max-roll base). Probe failure = mechanism
//     unproven = NO-GO. No corpus write.
//   --summarize: READ-ONLY aggregation of the corpus dir (never rewrites
//     rows — the 0644Z --summary rewrite lesson). Prints per-config
//     aggregates and every pre-registered GO leg. Exit 0 always (data,
//     not verdict); the evidence file judges.
//
// PRE-REGISTRATION (binding — judged only against this; the sweep prints
// the inputs, the evidence file judges):
//   PRIMARY: one-round FIELD villager deaths at >=50% entry HP = 0
//     (baseline recount must be 3: eater 103 / suburb 87 / suburb 69).
//     Counting: attributed combat-death detail rows (deathcensus
//     analysis) with context 'field', rounds == 1, vHpStartFrac >= 0.50.
//     Deaths are KIND-FILTERED (person/villager, non-scholar) by the
//     analyzer; mixed harness totals are never used for cost bars.
//   Field villager deaths <= 9 (baseline 12, >=25% cut).
//   Survival, COMPOSITION-PROOF (0730Z metric review, adopted this run):
//     the wins-excluded median binds ONLY if there are >= 4 non-winners
//     in BOTH control and armed; otherwise judge survival on the full
//     8-seed distribution — armed all-8 mean survival days >= control
//     all-8 mean AND armed villages dying before day 100 <= control
//     count + 1. The full 8-seed survival-day distribution is reported
//     for both sides either way.
//   Cost: national-ever >= 6/8, wave-4-or-win >= 5/8, kind-filtered
//     raid villager deaths <= 2 (baseline 1), starvation+sickness
//     (kind-filtered villager deaths, cause starvation or sickness)
//     <= control recount + 2.
//   Field-deaths-per-exposure (field deaths / field fights) reported
//     alongside raw counts; the raw count still binds.
//   Stall sense check + wave-4 field vKill diagnostic (reported, not
//     binding): a boosted strike that never lands anywhere is a
//     mechanism failure (probe), but a kill may be impossible even at
//     2x against wave-4 HP bands, so vKill is diagnostic only.
//   Confirm (if pilot GO): 12 fresh seeds 73679-73690, same policy /
//     horizon, pro-rata legs: one-round >=50% deaths = 0, field deaths
//     <= 13, composition-proof survival leg (same rule), national-ever
//     >= 9/12, wave-4-or-win >= 8/12, raid villager deaths <= 3,
//     starvation+sickness <= confirm-control recount + 3. The confirm
//     control runs on the same fresh seeds (game code stashed, then
//     restored), never judged against the pilot baseline.
//
// METRIC REVIEW NOTE (carried from 0644Z/0730Z, do not re-score
// anything under it): death-tele totals mix monster kills + scholar
// successions + villager deaths; only the kind-filtered population
// enters cost bars. Wave-4 reach OR a win passes the wave guard.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { copyKillLog } = require('./policies/vetkill-diag');
const {
  newStore, installDeathcensusDiag, withDeathcensusDiag, analyzeDeathcensus,
} = require('./policies/deathcensus-diag');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) { /* sleep best-effort */ } }
function snap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) { /* snap best-effort */ }
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) { /* snap best-effort */ }
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) { /* snap best-effort */ }
  return out;
}
function writeRowViaWriter(p, body) {
  console.log('ROWJSON-BEGIN ' + path.basename(p) + '\n' + body + '\nROWJSON-END');
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
function copyFaced(Game) {
  const out = { faced: {}, errs: 0, error: null };
  try {
    const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const faced = (ds && ds.wavesFaced) || {};
    for (const k of Object.keys(faced)) out.faced[k] = faced[k] | 0;
  } catch (e) { out.errs++; out.error = 'wavesFaced: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}

async function runOne(config, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.DEATHCENSUS = '1';
  const store = newStore();
  const base = withDeathcensusDiag(tableseatNowait, 'deathcensus-diag', 'tableseat-nowait + villager death-context census recorder', store);
  const { Game } = await loadGame({ seed, mode: 'boughtstrike-' + config, fullTelemetry: false });
  await setupGame(Game);
  const scholarId = Game.villagerId || null;
  try { installDeathcensusDiag(Game, store); } catch (e) { /* install best-effort; daily hook retries */ }
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  let capturedCtx = null;
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
      } catch (e) { /* hist best-effort */ }
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) { /* delegate best-effort */ } }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  const deaths = (result.samples.deaths || []).map(d => {
    let player = false;
    try { player = !!d.player; } catch (e) { player = false; }
    return { day: d.day | 0, kind: d.kind || null, who: (d.who != null) ? String(d.who) : null, cause: (d.cause != null) ? String(d.cause) : null, player: player };
  });
  const faced = copyFaced(Game);
  const log = copyKillLog(Game);
  const dc = {
    faced: faced.faced, facedErrs: faced.errs, facedError: faced.error,
    logEntries: log.entries, logErrs: log.errs, logError: log.error,
    deaths: deaths,
    resolveFights: store.resolveFights,
    directFights: store.directFights,
    tbFights: store.tbFights,
    analysis: analyzeDeathcensus(store, deaths, scholarId),
    diag: { errs: store.errs, errors: store.errors, overflow: store.overflow, installed: store.installed },
  };
  const ts = {};
  const ctxExtra = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
      if (k.indexOf('court') === 0 || k === 'tended' || k === 'proposedLead' || k === 'defenseCalls') ctxExtra[k] = capturedCtx[k];
    }
  }
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const row = {
    policy: 'boughtstrike-' + config, seed,
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
    deathTotal: deaths.length,
    starvationDeaths: starv.length,
    ts, ctxExtra,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    deathcensus: dc,
    diag: { errs: store.errs, overflow: store.overflow },
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${config}.json`);
    const body = JSON.stringify(row, null, 1) + '\n';
    const sha = writeRowViaWriter(fn, body);
    row.corpusFile = fn; row.corpusSha = sha;
  }
  return row;
}

// aggregate(rows): every pre-registered leg input, per config, from corpus
// rows (armed-with-recorder rows only; the analysis is already inside).
function aggregate(rows) {
  const out = {
    n: rows.length, won: 0, nationalEver: 0, nationalFinal: 0, table: 0, entered: 0,
    wave4: 0, wave5: 0, wave4orWin: 0, maxArc: 0,
    daysAll: [], daysWinsExcluded: [],
    villagerDeaths: 0, fieldDeaths: 0, raidDeaths: 0, arenaDeaths: 0, tbDeaths: 0, otherDeaths: 0,
    oneRoundGe50: 0, oneRoundGe50Detail: [],
    fieldFights: 0, fieldVKill: 0, fieldVDie: 0, fieldMFlee: 0, fieldVFlee: 0,
    raidFights: 0, raidVDie: 0, raidVKill: 0, raidMFlee: 0,
    villagerMonsterKills: 0, capFires: 0, capDamageSaved: 0,
    starvationDeaths: 0, sicknessDeaths: 0, starvSick: 0,
    deathsBefore100: 0, meanAll: 0,
    fieldDeathsPerExposure: null, wave4FieldFights: 0, wave4FieldVKill: 0,
    deathTeles: 0, recorderErrs: 0, orphanEvidence: 0,
  };
  for (const r of rows) {
    out.won += r.won ? 1 : 0;
    out.nationalEver += r.nationalEver ? 1 : 0;
    out.nationalFinal += r.nationalFinal ? 1 : 0;
    out.table += r.table ? 1 : 0;
    out.entered += r.entered ? 1 : 0;
    if ((r.waveReach || 1) >= 4) out.wave4++;
    if ((r.waveReach || 1) >= 5) out.wave5++;
    if ((r.waveReach || 1) >= 4 || r.won) out.wave4orWin++;
    out.maxArc = Math.max(out.maxArc, r.maxArc || 1);
    out.daysAll.push(r.days | 0);
    if (!r.won) out.daysWinsExcluded.push(r.days | 0);
    if (!r.won && (r.days | 0) < 100) out.deathsBefore100++;
    out.deathTeles += r.deathTotal | 0;
    out.recorderErrs += (r.diag && r.diag.errs) || 0;
    const a = r.deathcensus && r.deathcensus.analysis;
    if (!a) continue;
    // Kind-filtered starvation/sickness ONLY (analysis population);
    // the mixed harness starvation count on the row is never a leg.
    out.starvationDeaths += a.starvationDeaths || 0;
    out.sicknessDeaths += (a.byCause && a.byCause.sickness) || 0;
    out.villagerDeaths += a.population.villagerDeaths;
    out.fieldDeaths += a.byContext.field || 0;
    out.raidDeaths += a.byContext.raid || 0;
    out.arenaDeaths += a.byContext.arena || 0;
    out.tbDeaths += a.byContext.tb || 0;
    out.otherDeaths += a.byContext.other || 0;
    out.orphanEvidence += (a.orphanEvidence || []).length;
    for (const d of (a.combatDeathDetail || [])) {
      if (d.context === 'field' && d.rounds === 1 && d.vHpStartFrac != null && d.vHpStartFrac >= 0.50) {
        out.oneRoundGe50++;
        out.oneRoundGe50Detail.push({ seed: r.seed, day: d.seedDay, vid: d.vid, mid: d.mid, wave: d.wave, vHpStartFrac: d.vHpStartFrac, vTaken: d.vTaken, mDealt: d.mDealt });
      }
    }
    const rows2 = (r.deathcensus.resolveFights || []).concat(r.deathcensus.directFights || []);
    for (const f of rows2) {
      if (f.context === 'field') {
        out.fieldFights++;
        if (f.outcome === 'vKill') { out.fieldVKill++; out.villagerMonsterKills++; }
        if (f.outcome === 'vDie') out.fieldVDie++;
        if (f.outcome === 'mFlee') out.fieldMFlee++;
        if (f.outcome === 'vFlee') out.fieldVFlee++;
        if ((f.wave | 0) >= 4) {
          out.wave4FieldFights++;
          if (f.outcome === 'vKill') out.wave4FieldVKill++;
        }
      }
      if (f.context === 'raid') {
        out.raidFights++;
        if (f.outcome === 'vDie') out.raidVDie++;
        if (f.outcome === 'vKill') { out.raidVKill++; }
        if (f.outcome === 'mFlee') out.raidMFlee++;
      }
    }
    // Cap-fire telemetry: fight records carry oneShotCapFires only on the
    // armed corpus if the recorder stored rec fields — it does not, so
    // count via direct/resolve rows is unavailable; cap fires are counted
    // in the probe, and the armed corpus shows the EFFECT (fewer vDie).
    // (Kept explicit so a future reader does not mistake 0 for "never".)
    out.capFires = null;
  }
  out.medianAll = medianOf(out.daysAll);
  out.medianWinsExcluded = medianOf(out.daysWinsExcluded);
  out.meanAll = out.daysAll.length ? (out.daysAll.reduce((s, x) => s + x, 0) / out.daysAll.length) : 0;
  out.starvSick = out.starvationDeaths + out.sicknessDeaths;
  out.fieldDeathsPerExposure = out.fieldFights ? (out.fieldDeaths / out.fieldFights) : null;
  return out;
}

// Corpus dir: pilot default perseed-boughtstrike-a; EVID_SUFFIX (e.g.
// '-confirm') selects a sibling dir so a confirm never mixes into the
// pilot aggregate (both --summarize and the sweep honor it).
function evidDirFor() {
  return path.join(REPO, 'evidence', '2026-10-25', 'perseed-boughtstrike-a' + (process.env.EVID_SUFFIX || ''));
}

function summarize(evidDir) {
  const files = fs.readdirSync(evidDir).filter(f => /^s\d+-(control|armed)\.json$/.test(f)).sort();
  const byConfig = { control: [], armed: [] };
  for (const f of files) {
    const row = JSON.parse(fs.readFileSync(path.join(evidDir, f), 'utf8'));
    const m = /-(control|armed)\.json$/.exec(f);
    if (m) byConfig[m[1]].push(row);
  }
  const out = {};
  for (const cfg of ['control', 'armed']) out[cfg] = aggregate(byConfig[cfg]);
  console.log(JSON.stringify(out, null, 1));
  return out;
}

async function probe(useFlag) {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 73671, mode: 'boughtstrike-probe', fullTelemetry: false });
  await setupGame(Game);
  // Find a living non-scholar villager and put them at full health.
  const roster = ((Game.state.village || {}).roster || []).slice();
  const scholarId = Game.villagerId || null;
  let vid = null;
  for (const id of roster) {
    if (id === scholarId) continue;
    try {
      const p = Game.getPerson ? Game.getPerson(id) : null;
      if (p && !p.dead) { vid = id; break; }
    } catch (e) { /* try next */ }
  }
  if (!vid) throw new Error('probe: no living villager found');
  // Effective HP exactly as fieldFight reads it: village.health[vid], or
  // 100 when the map has no entry (a fresh-setup villager IS at 100 by
  // the engine's own default — no write needed, and none is attempted).
  let entryHp = 100;
  try {
    const vv = (Game.state || {}).village || {};
    if (vv.health && vv.health[vid] !== undefined) entryHp = vv.health[vid];
  } catch (e) { /* default 100 */ }
  if (entryHp < 50) throw new Error('probe: villager below 50% HP (' + entryHp + '), not a one-shot test');
  const mdef = (Game.data.monsters || []).find(x => x.id === 'eater');
  if (!mdef || mdef.wave !== 4) throw new Error('probe: eater def missing or not wave 4');
  // Max-roll RNG: every draw lands at the top of its range, so the eater's
  // base blow + sigW4 gorge bonus land at their maxima — a would-be
  // one-shot by construction (base 75 + sig 75 = 150 before mitigation).
  // The boughtStrike flag is passed exactly as the wild router passes it.
  // With useFlag false (the --probe-noflag scope control), the same
  // fight must run UNcapped: the one-shot lands, the villager dies in
  // round 1, no boost — proving the flag, not the wave, is the gate.
  const rec = Game.fieldFight(vid, mdef, null, useFlag === false
    ? { rng: () => 0.999999 }
    : { rng: () => 0.999999, boughtStrike: true });
  // Parse round-1 damage from the log: each cap line immediately precedes
  // its (capped) hit line, so pair them — the cap line gives the pre-cap
  // total, the hit line gives the landed total. A plain hit line counts
  // its total on both sides. (No allies in the probe, so every 'hits'
  // line is a hit on the villager.) Strike lines give the doubling
  // check: the round-2 strike must carry the bought-round note and
  // deal exactly 2x the round-1 strike (same villager, same max-roll
  // base, no ability modifiers on a fresh-setup villager).
  let uncappedR1 = 0, cappedR1 = 0, preCapMax = 0, capLines = 0, pendingCap = null;
  let strikeR1 = null, strikeR2 = null, strikeR2Note = false;
  for (const line of (rec.log || [])) {
    const capM = /^R(\d+): .*would have taken (\d+) — .*Capped to (\d+)/.exec(line);
    if (capM) {
      if (parseInt(capM[1], 10) === 1) pendingCap = parseInt(capM[2], 10);
      preCapMax = Math.max(preCapMax, parseInt(capM[2], 10));
      capLines++;
      continue;
    }
    const hitM = /^R(\d+): .* hits .* for (\d+) /.exec(line);
    if (hitM && parseInt(hitM[1], 10) === 1) {
      if (pendingCap != null) { uncappedR1 += pendingCap; cappedR1 += parseInt(hitM[2], 10); pendingCap = null; }
      else { uncappedR1 += parseInt(hitM[2], 10); cappedR1 += parseInt(hitM[2], 10); }
    }
    const strM = /^R(\d+): .* strikes for (\d+)(.*)$/.exec(line);
    if (strM) {
      const rnd = parseInt(strM[1], 10), dmg = parseInt(strM[2], 10), note = strM[3] || '';
      if (rnd === 1 && strikeR1 == null) strikeR1 = dmg;
      if (rnd === 2 && strikeR2 == null) { strikeR2 = dmg; strikeR2Note = /bought round/i.test(note); }
    }
  }
  const survivedR1 = !(rec.outcome === 'vDie' && rec.rounds === 1);
  const checks = {
    vid, entryHp: entryHp, maxHp: Math.max(100, entryHp), monster: 'eater', wave: 4,
    outcome: rec.outcome, rounds: rec.rounds, vTaken: rec.vTaken,
    oneShotCapFires: rec.oneShotCapFires || 0, oneShotCapped: rec.oneShotCapped || 0,
    boughtStrikeFires: rec.boughtStrikeFires || 0, boughtStrikeBonus: rec.boughtStrikeBonus || 0,
    capLogLines: capLines, preCapMax: preCapMax,
    uncappedR1: uncappedR1, cappedR1: cappedR1,
    survivedR1: survivedR1,
    strikeR1: strikeR1, strikeR2: strikeR2, strikeR2Note: strikeR2Note,
    strikeDoubled: (strikeR1 != null && strikeR2 != null) ? (strikeR2 === 2 * strikeR1) : false,
    probeLog: rec.log,
    pass: useFlag === false
      ? ((rec.oneShotCapFires || 0) === 0 && (rec.boughtStrikeFires || 0) === 0
        && rec.outcome === 'vDie' && rec.rounds === 1 && uncappedR1 >= entryHp)
      : ((rec.oneShotCapFires || 0) >= 1 && uncappedR1 >= entryHp && cappedR1 < 50 && survivedR1
        && (rec.boughtStrikeFires || 0) >= 1 && strikeR2Note && strikeR2 != null && strikeR2 > 0 && strikeR2 === 2 * strikeR1),
  };
  console.log('PROBE ' + JSON.stringify(checks, null, 1));
  if (!checks.pass) { console.log('PROBE-FAIL'); process.exit(1); }
  console.log('PROBE-PASS');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--probe-noflag')) { await probe(false); return; }
  if (args.includes('--probe')) { await probe(true); return; }
  if (args.includes('--summarize')) {
    summarize(evidDirFor());
    return;
  }
  const config = (process.env.CONFIG || 'control').trim();
  if (config !== 'control' && config !== 'armed') throw new Error('CONFIG must be control|armed, got ' + config);
  const seedsArg = process.env.SEEDS || '73671-73678';
  const m = /^(\d+)-(\d+)$/.exec(seedsArg.trim());
  if (!m) throw new Error('SEEDS must be like 73671-73678, got ' + seedsArg);
  const seeds = [];
  for (let s = parseInt(m[1], 10); s <= parseInt(m[2], 10); s++) seeds.push(s);
  const days = parseInt(process.env.DAYS || '180', 10);
  const evidDir = evidDirFor();
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const seed of seeds) {
    console.log(`SEED-START config=${config} seed=${seed}`);
    const row = await runOne(config, seed, days, evidDir);
    console.log(`SEED-DONE config=${config} seed=${seed} days=${row.days} won=${row.won} waveReach=${row.waveReach} nationalEver=${row.nationalEver}`);
    rows.push(row);
  }
  const agg = aggregate(rows);
  console.log('AGGREGATE ' + JSON.stringify(agg, null, 1));
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
