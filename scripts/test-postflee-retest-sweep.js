#!/usr/bin/env node
// scripts/test-postflee-retest-sweep.js — sim-postflee-retest-a (2026-10-25).
// RE-TEST of sim-postflee-a on FRESH seeds 73679-73690 with a NEW
// pre-registered exposure-aware cost metric (see evidence header).
// The 1146Z NO-GO stands as judged and is NOT re-scored; this is a new
// band, new pre-registration, new verdict. Adapted from
// scripts/test-postflee-sweep.js; sweep/probe/aggregate logic unchanged
// except corpus dir + default seeds. Probe seed 73671 is a directed
// probe seed only, not a sweep seed.
//
// QUESTION (from sim-boughtflee-a): bought flee saves the fight, not the
// day — seed 73676's villager fled a suburb at 3 HP and re-met the SAME
// suburb the same day and died. The re-meet vector is villagerMonsterTick:
// the fled villager stays on the monster's tile, and the next worldTick
// rolls the same fight again. This arm: after a villager flees a FIELD
// fight ending below 25% max HP, they do not re-encounter that day —
// wild-tick fights and expedition monster legs skip them for the rest of
// that calendar day, narrated at flee time. All waves (this blank is not
// a wave-4 instrument). Raid defense, the monster break line, arena /
// contest routes, and the scholar are never touched.
//
// PAIRING (exact, identical seeds; ONE config per invocation because the
// lever is game code, not a policy toggle):
//   control = tableseat-nowait + deathcensus recorder, run BEFORE the
//     game-code edit (worktree clean). Must replicate the published
//     controls exactly, or STOP — never judge against a stale baseline.
//   armed   = same substrate + recorder, run AFTER the game-code edit.
//     The ONLY delta between control and armed corpora is the arm.
//   CONFIG env (control|armed) selects the filename tag; the script never
//     changes game code itself.
// Modes:
//   default (sweep): SEEDS env (default 73679-73690), DAYS=180 (default).
//     Per-seed corpus rows into evidence/2026-10-25/perseed-sim-postflee-retest-a/
//     via the shared writer (same write-retry discipline as the
//     deathcensus sweep). Exit 0 on a completed sweep regardless of
//     GO/NO-GO (the verdict is data); exit 1 on a sweep error.
//   --probe: directed proof on real engine paths (see probe()): a routed
//     wild vFlee ending below 25% sets the rest flag and narrates it;
//     a second same-day routed encounter for the same villager is skipped
//     with no fight and no HP change; raid and arena routes are untouched;
//     the scholar can never be flagged. Probe failure = NO-GO.
//     No corpus write.
//   --summarize: READ-ONLY aggregation of the corpus dir (never rewrites
//     rows — the 0644Z --summary rewrite lesson). Prints per-config
//     aggregates and every pre-registered GO leg. Exit 0 always (data,
//     not verdict); the evidence file judges.
//
// PRE-REGISTRATION (binding — judged only against this; the sweep prints
// the inputs, the evidence file judges). Full text lives in the evidence
// header; the class definition here is normative:
//   PRIMARY (mechanism class): routed (resolveFights-stream) FIELD vDie
//     rows where an EARLIER row in the same seed's resolveFights stream,
//     same calendar day, same villager, has outcome vFlee with
//     vHpLeft/vHpMax < 0.25. Bar: 0 (set from the control count — see
//     evidence header; the control class count is 1, the 73676 case).
//     Same-entity signature (same mid, mHpStart == earlier mHpLeft) is
//     reported alongside. Direct-stream (expedition etc.) same-day
//     post-flee deaths are counted and reported separately; they are
//     NOT in the primary bar (different router, already expedition-
//     shortened by expedHurt) but any armed direct-stream case is
//     inspected before a GO.
//   Guard legs (see evidence header): kind-filtered field deaths
//     REPORTED ONLY (raw count does not bind); composition-proof
//     survival; national-ever >= 6/8; wave-4-or-win >= 5/8;
//     kind-filtered raid deaths <= 2; starvation+sickness <= control
//     recount + 2; directed probe PASS.
//   Confirm (if pilot GO): 12 fresh seeds 73679-73690, same policy /
//     horizon, confirm control on the same fresh seeds, pro-rata legs
//     (see evidence header).
//
// METRIC REVIEW NOTE (carried from 0644Z, do not re-score anything under
// it): death-tele totals mix monster kills + scholar successions +
// villager deaths; only the kind-filtered population enters cost bars.
// The all-runs median is win-shortened; the wins-excluded median is the
// primary cost median. Wave-4 reach OR a win passes the wave guard.
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
  // ROWJSON_QUIET=1: skip printing the full row body (the row is held in
  // memory and written by the writer; printing it floods the session
  // log with ~150KB per seed for no benefit).
  if (String(process.env.ROWJSON_QUIET || '0') === '1') {
    console.log('ROWJSON-SKIPPED ' + path.basename(p) + ' bytes=' + Buffer.byteLength(body, 'utf8'));
  } else {
    console.log('ROWJSON-BEGIN ' + path.basename(p) + '\n' + body + '\nROWJSON-END');
  }
  // WRITER_WAIT=1 (flap response, 2026-10-25): the row lives in this
  // process's memory, never in /tmp, while the container write flap
  // persists — the 8-attempt block repeats every 60s until the write
  // lands (max 120 rounds ≈ 2h), so a flap cannot eat a finished sim.
  // Without it, behavior is exactly the old 8-attempt throw.
  const waitMode = String(process.env.WRITER_WAIT || '0') === '1';
  for (let round = 1; ; round++) {
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
        console.log(`WRITE-RETRY ${path.basename(p)} round=${round} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
        if (a < 8) sleepMs(Math.min(10000, 1000 * a));
      }
    }
    if (!waitMode || round >= 120) throw lastErr;
    console.log(`WRITE-WAIT ${path.basename(p)} round=${round} flap persists, retrying in 60s`);
    sleepMs(60000);
  }
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
  const { Game } = await loadGame({ seed, mode: 'postflee-' + config, fullTelemetry: false });
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
    policy: 'postflee-' + config, seed,
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
    starvationDeaths: 0, starvSickDeaths: 0, deathTeles: 0, recorderErrs: 0, orphanEvidence: 0,
    fieldFightsW4: 0, fieldVDieW4: 0, fieldVFleeW4: 0, fieldVKillW4: 0,
    // POSTFLEE primary class: routed same-day post-flee field deaths.
    // Per seed, walk the resolveFights stream IN ORDER: a field vDie row
    // counts when an earlier row, same day, same villager, has outcome
    // vFlee with vHpLeft/vHpMax < 0.25. Same-entity signature (same mid
    // and mHpStart == earlier mHpLeft) reported alongside. The direct
    // stream (expedition etc.) is counted separately and never folded
    // into the primary bar.
    postFleeDeaths: 0, postFleeDetail: [], postFleeSameEntity: 0,
    postFleeDirectDeaths: 0, postFleeDirectDetail: [],
    woundedFlees: 0, woundedFleesDirect: 0,
  };
  function postFleeClass(stream, seed) {
    const deaths = [], details = [];
    let sameEntity = 0, wounded = 0;
    const flees = [];
    for (const f of stream) {
      if (f.context !== 'field') continue;
      const endFrac = (f.vHpLeft != null && f.vHpMax) ? (f.vHpLeft / f.vHpMax) : null;
      if (f.outcome === 'vFlee' && endFrac != null && endFrac < 0.25) {
        wounded++;
        flees.push(f);
      }
      if (f.outcome === 'vDie') {
        const prior = flees.find(p => p.day === f.day && String(p.vid) === String(f.vid));
        if (prior) {
          deaths.push(f);
          const ent = (prior.mid === f.mid && prior.mHpLeft != null && f.mHpStart != null && prior.mHpLeft === f.mHpStart);
          if (ent) sameEntity++;
          details.push({ seed, day: f.day, vid: f.vid, mid: f.mid, wave: f.wave, priorMid: prior.mid, priorEndFrac: (prior.vHpLeft / prior.vHpMax), sameEntity: ent, vHpStartFrac: f.vHpStartFrac, vTaken: f.vTaken, rounds: f.rounds });
        }
      }
    }
    return { deaths, details, sameEntity, wounded };
  }
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
    out.deathTeles += r.deathTotal | 0;
    out.starvationDeaths += r.starvationDeaths | 0;
    out.recorderErrs += (r.diag && r.diag.errs) || 0;
    const a = r.deathcensus && r.deathcensus.analysis;
    if (!a) continue;
    out.villagerDeaths += a.population.villagerDeaths;
    out.fieldDeaths += a.byContext.field || 0;
    out.raidDeaths += a.byContext.raid || 0;
    out.arenaDeaths += a.byContext.arena || 0;
    out.tbDeaths += a.byContext.tb || 0;
    out.otherDeaths += a.byContext.other || 0;
    out.orphanEvidence += (a.orphanEvidence || []).length;
    // starvation+sickness: 'other'-context villager deaths whose stated
    // cause is starvation or a sickness/disease cause (not fight deaths).
    for (const d of (a.other || [])) {
      const sub = String((d && d.sub) || '');
      const cause = String((d && d.death && d.death.cause) || '');
      if (sub === 'starvation' || /starv|hunger|sick|disease|illness|fever|plague|infection|eurika|nile|lemons/i.test(sub + ' ' + cause)) out.starvSickDeaths++;
    }
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
        if ((f.wave || 1) >= 4) {
          out.fieldFightsW4++;
          if (f.outcome === 'vDie') out.fieldVDieW4++;
          if (f.outcome === 'vFlee') out.fieldVFleeW4++;
          if (f.outcome === 'vKill') out.fieldVKillW4++;
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
    // POSTFLEE class counts (per seed, stream order preserved).
    const dc2 = r.deathcensus || {};
    const pfR = postFleeClass(dc2.resolveFights || [], r.seed);
    out.postFleeDeaths += pfR.deaths.length;
    out.postFleeDetail.push(...pfR.details);
    out.postFleeSameEntity += pfR.sameEntity;
    out.woundedFlees += pfR.wounded;
    const pfD = postFleeClass(dc2.directFights || [], r.seed);
    out.postFleeDirectDeaths += pfD.deaths.length;
    out.postFleeDirectDetail.push(...pfD.details);
    out.woundedFleesDirect += pfD.wounded;
  }
  out.medianAll = medianOf(out.daysAll);
  out.medianWinsExcluded = medianOf(out.daysWinsExcluded);
  return out;
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

async function probe() {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 73671, mode: 'postflee-probe', fullTelemetry: false });
  await setupGame(Game);
  const scholarId = Game.villagerId || null;
  const roster = ((Game.state.village || {}).roster || []).slice();
  const hpOf = (vid) => {
    try {
      const vv = (Game.state || {}).village || {};
      if (vv.health && vv.health[vid] !== undefined) return vv.health[vid];
    } catch (e) { /* default */ }
    return 100;
  };
  const setHp = (vid, hp) => {
    const vv = Game.state.village;
    vv.health = vv.health || {};
    vv.health[vid] = hp;
  };
  const alive = (vid) => {
    try {
      const p = Game.getPerson ? Game.getPerson(vid) : null;
      if (p && !p.dead) return true;
      if (p && p.dead) return false;
    } catch (e) { /* fall through to hp check */ }
    return hpOf(vid) > 0;
  };
  const awayNews = () => {
    try { return ((Game.state.scholar || {}).awayNews || []).slice(); } catch (e) { return []; }
  };
  const resting = (vid) => {
    try { return !!(Game.isPostFleeResting && Game.isPostFleeResting(vid)); } catch (e) { return false; }
  };
  // SEARCH (real router, real fights): find a routed wild vFlee ending
  // below 25% max HP. Entry HPs 30/40/50 across strong monsters; each
  // attempt resets the villager's HP explicitly, so search wounds never
  // leak into the assertions. A vDie spends that villager; a vFlee at
  // >=25% sets no flag, so the villager stays usable.
  const mids = ['suburb', 'eater', 'algorithm', 'congregation', 'audit', 'gavel', 'focus_group', 'ad_break', 'hushwolf', 'nevermore'];
  const defs = {};
  for (const mid of mids) {
    const d = (Game.data.monsters || []).find(x => x.id === mid);
    if (d) defs[mid] = d;
  }
  if (!defs.suburb) throw new Error('probe: suburb def missing');
  let found = null;
  const used = new Set();
  for (const vid of roster) {
    if (found) break;
    if (vid === scholarId || used.has(vid)) continue;
    for (const mid of Object.keys(defs)) {
      if (found) break;
      for (const entry of [30, 40, 50]) {
        if (!alive(vid)) break;
        setHp(vid, entry);
        const aw0 = awayNews().length;
        let rec = null;
        try { rec = Game.resolveWildMonsterEncounter(vid, { id: mid, tx: 4, ty: 4 }, {}); } catch (e) { rec = null; }
        if (!rec || rec.outcome !== 'vFlee') continue;
        const endHp = hpOf(vid);
        const endFrac = endHp / Math.max(100, entry);
        if (endFrac < 0.25) {
          const news = awayNews().slice(aw0);
          found = { vid, mid, entry, endHp, endFrac, vTaken: rec.vTaken, rounds: rec.rounds, news, resting: resting(vid) };
          break;
        }
      }
    }
    used.add(vid);
  }
  if (!found) throw new Error('probe: no routed vFlee below 25% found across roster x monsters x entry HPs');
  // MAIN assertions: flag set, narration names the rest of the day.
  const main = {
    vid: found.vid, mid: found.mid, entry: found.entry, endHp: found.endHp, endFrac: found.endFrac,
    resting: found.resting,
    narrated: found.news.some(t => /rest of the day/i.test(String(t))),
    news: found.news,
    pass: found.resting === true && found.news.some(t => /rest of the day/i.test(String(t))),
  };
  // SKIP (router guard): same day, same villager, same monster entity —
  // the router returns null, HP unchanged, no new awayNews.
  const hpBeforeSkip = hpOf(found.vid);
  const awBeforeSkip = awayNews().length;
  const skipRec = Game.resolveWildMonsterEncounter(found.vid, { id: found.mid, tx: 4, ty: 4 }, {});
  const skip = {
    returnedNull: skipRec === null || skipRec === undefined,
    hpUnchanged: hpOf(found.vid) === hpBeforeSkip,
    newsUnchanged: awayNews().length === awBeforeSkip,
    pass: (skipRec === null || skipRec === undefined) && hpOf(found.vid) === hpBeforeSkip && awayNews().length === awBeforeSkip,
  };
  // TICK (the real re-meet vector): flagged villager on a monster's tile
  // is never fought across 30 ticks; an unflagged control villager on
  // another tile IS fought within 30 ticks (proves the tick path is live).
  const px = (Game.map && Game.map.px) || 4, py = (Game.map && Game.map.py) || 4;
  const tickTile = (px === 2 && py === 2) ? [6, 6] : [2, 2];
  const ctrlTile = (px === 3 && py === 3) ? [7, 7] : [3, 3];
  let tickOk = false, tickDetail = null;
  try {
    Game.npcSetNode(found.vid, tickTile[0], tickTile[1]);
    const tm = Game.spawnWorldMonster({ id: 'hushwolf' }, tickTile[0], tickTile[1], {});
    const hpT0 = hpOf(found.vid);
    const awT0 = awayNews().length;
    for (let i = 0; i < 30; i++) { try { Game.villagerMonsterTick(); } catch (e) { /* tick best-effort */ } }
    const tickSkip = hpOf(found.vid) === hpT0 && awayNews().length === awT0;
    // Control: a fresh unflagged villager on another tile with a monster.
    let ctrlVid = null;
    for (const id of roster) {
      if (id !== scholarId && id !== found.vid && alive(id) && !resting(id)) { ctrlVid = id; break; }
    }
    let ctrlFought = false;
    if (ctrlVid) {
      setHp(ctrlVid, 100);
      Game.npcSetNode(ctrlVid, ctrlTile[0], ctrlTile[1]);
      Game.spawnWorldMonster({ id: 'hushwolf' }, ctrlTile[0], ctrlTile[1], {});
      const hpC0 = hpOf(ctrlVid), awC0 = awayNews().length;
      for (let i = 0; i < 30; i++) {
        try { Game.villagerMonsterTick(); } catch (e) { /* tick best-effort */ }
        if (hpOf(ctrlVid) !== hpC0 || awayNews().length !== awC0) { ctrlFought = true; break; }
        if (!alive(ctrlVid)) { ctrlFought = true; break; }
      }
    }
    tickDetail = { tickSkip, ctrlVid, ctrlFought };
    tickOk = tickSkip === true && ctrlFought === true;
  } catch (e) { tickDetail = { error: String((e && e.message) || e).slice(0, 200) }; tickOk = false; }
  // RAID gate: a flagged villager is NOT skipped on the raid path.
  let raidRec = null, raidErr = null;
  try { raidRec = Game.resolveWildMonsterEncounter(found.vid, { id: 'hushwolf', tx: 4, ty: 4 }, { raid: true }); } catch (e) { raidErr = String((e && e.message) || e).slice(0, 120); }
  const raid = {
    outcome: raidRec ? raidRec.outcome : null, err: raidErr,
    pass: raidRec !== null && raidRec !== undefined && raidErr === null,
  };
  // ARENA gate: a direct noFlee fight never sets the flag.
  let arenaVid = null;
  for (const id of roster) {
    if (id !== scholarId && id !== found.vid && alive(id) && !resting(id)) { arenaVid = id; break; }
  }
  let arena = { vid: arenaVid, pass: false };
  if (arenaVid) {
    const adef = (Game.data.monsters || []).find(x => x.id === 'hushwolf');
    let arec = null;
    try { arec = Game.fieldFight(arenaVid, adef, null, { noFlee: true }); } catch (e) { arec = null; }
    arena = { vid: arenaVid, outcome: arec ? arec.outcome : null, restingAfter: resting(arenaVid), pass: resting(arenaVid) === false };
  }
  // SCHOLAR gate: the scholar can never be flagged, even by direct mark.
  let scholarMark = null;
  try { if (Game.markPostFleeRest && scholarId) Game.markPostFleeRest(scholarId); } catch (e) { /* mark best-effort */ }
  scholarMark = { scholarId, restingAfterMark: scholarId ? resting(scholarId) : null, pass: scholarId ? resting(scholarId) === false : false };
  // EXPEDITION gate: a flagged villager's expeditionMonster call fights
  // nothing (entry check precedes agency reads, so this holds even when
  // agency state is uninitialized in the probe process).
  let exped = { pass: false };
  try {
    let fightCalls = 0;
    const origFF = Game.fieldFight;
    Game.fieldFight = function () { fightCalls++; return origFF.apply(this, arguments); };
    let expErr = null;
    try { if (Game.expeditionMonster) Game.expeditionMonster(found.vid, 1, false); } catch (e) { expErr = String((e && e.message) || e).slice(0, 120); }
    Game.fieldFight = origFF;
    exped = { fightCalls, expErr, pass: fightCalls === 0 && expErr === null };
  } catch (e) { exped = { error: String((e && e.message) || e).slice(0, 120), pass: false }; }
  // NEXT-DAY expiry: the flag is day-scoped — tomorrow the router fights.
  let expiry = { pass: false };
  try {
    const day0 = (Game.state.scholar || {}).day || 0;
    Game.state.scholar.day = day0 + 1;
    const restingNext = resting(found.vid);
    let nextRec = null;
    try { setHp(found.vid, 100); nextRec = Game.resolveWildMonsterEncounter(found.vid, { id: 'hushwolf', tx: 4, ty: 4 }, {}); } catch (e) { nextRec = null; }
    expiry = { restingNextDay: restingNext, nextOutcome: nextRec ? nextRec.outcome : null, pass: restingNext === false && nextRec !== null && nextRec !== undefined };
  } catch (e) { expiry = { error: String((e && e.message) || e).slice(0, 120), pass: false }; }
  const checks = { main, skip, tick: { ok: tickOk, detail: tickDetail }, raid, arena, scholarMark, exped, expiry,
    pass: main.pass && skip.pass && tickOk && raid.pass && arena.pass && scholarMark.pass && exped.pass && expiry.pass };
  console.log('PROBE ' + JSON.stringify(checks, null, 1));
  if (!checks.pass) { console.log('PROBE-FAIL'); process.exit(1); }
  console.log('PROBE-PASS');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--probe')) { await probe(); return; }
  if (args.includes('--summarize')) {
    const evidDir = path.join(REPO, 'evidence', '2026-10-25', 'perseed-sim-postflee-retest-a');
    summarize(evidDir);
    return;
  }
  const config = (process.env.CONFIG || 'control').trim();
  if (config !== 'control' && config !== 'armed') throw new Error('CONFIG must be control|armed, got ' + config);
  const seedsArg = process.env.SEEDS || '73679-73690';
  const m = /^(\d+)-(\d+)$/.exec(seedsArg.trim());
  if (!m) throw new Error('SEEDS must be like 73679-73690, got ' + seedsArg);
  const seeds = [];
  for (let s = parseInt(m[1], 10); s <= parseInt(m[2], 10); s++) seeds.push(s);
  const days = parseInt(process.env.DAYS || '180', 10);
  const evidDir = path.join(REPO, 'evidence', '2026-10-25', 'perseed-sim-postflee-retest-a');
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
