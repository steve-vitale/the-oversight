#!/usr/bin/env node
// scripts/sweep-tribcollapse-20261015.js — national-hold loss-mode census R6
// (sim-tribcollapse, 2026-10-15, scale-onramp axis).
//
// DIAGNOSTIC ARM, instrument-only: 8 seeds x {leadfeast, belongfeast},
// 180d death-aware, on the CURRENT tip with the post-r4 levers armed:
//   FEASTSCALE_R13=1  (substrate, unchanged from r4/r5)
//   TRIBFLOOR=1       (policy layer: tribute never below the 2-day pantry
//                      floor — policies imported from ./policies/tribfloor,
//                      same ids, wrapper delegates byte-identically when off)
//   SUCCGRACE=1       (game-code env gate: sub-bar-link answerable
//                      renegotiation beat at the funeral)
//   RAIDDENSITY=1     (game-code env gate: 7-day post-raid cooldown on
//                      young nationals, both rival-raid channels)
// The question: with 'tribute-collapse' PROMOTED to a named mode
// (scripts/holdloss-lib-20261015.js r6 — the existing arrearsSpike
// detector restricted to Haven's BELONG links, plus a level gate, a
// grief-leverage trail requirement, and a starve-paying guard), what is
// the loss-mode distribution NOW? Secondaries: tribute-collapse share
// per road; arrears-at-dissolve distribution (median/p90/max); how many
// tribute-collapses TRIBFLOOR converts from "starve paying" to "dissolve
// on arrears" (floor-capped payments vs arrears posted).
//
// vs sim-holdloss2: the substrate is IDENTICAL (same four flags, same
// seeds, same policies, no game-code change since the r5 run — the base
// is the same master tip), so trajectories should be byte-identical and
// the ONLY expected movement is the s44-belongfeast loss reclassifying
// from other-named to tribute-collapse. The sweep verifies this by
// comparing per-run trajHash against sim-holdloss2-runs.json
// (report-only; a mismatch is LOUD, not fatal — the tree may have moved).
//
// Persistence change (sim-holdloss2 evidence, "documented"): the per-seed
// -full.json files now persist the FULL scaleRows (with per-link
// arrears), not the {day, rank, exiled} mapping — the link-level rows
// the arrears-spike detector reads are kept for audit.
//
// Instrument: scripts/holdloss-lib-20261015.js (r6). Loss window = 20d
// ending on the loss day (finalDay+1 for village-death losses).
// B-branch priority: link-break -> exile -> tribute-collapse ->
// arrears-spike-remainder -> deaths-in-3d succession.
//
// Modes:
//   SMOKE=1      15d x {leadfeast,belongfeast}: samples collect, no crash.
//   DETGATE=1    D1 gate determinism (60d x2 byte-identical, full r6
//                substrate); D2 instrument ON vs OFF byte-identical 60d.
//   default      the 16-run suite -> evidence/2026-10-15/perseed-tribcollapse/,
//                evidence/2026-10-15/sim-tribcollapse-runs.json.
//
// Env:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/sweep-tribcollapse-20261015.js
//   SMOKE=1 <flags> node scripts/sweep-tribcollapse-20261015.js
//   DETGATE=1 <flags> node scripts/sweep-tribcollapse-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');
const TW = require('./tworung-lib-20261015');
const RB = require('./readinessbind-lib');
const HL = require('./holdloss-lib-20261015');

const flags = { R13: process.env.FEASTSCALE_R13 === '1', TF: process.env.TRIBFLOOR === '1', SG: process.env.SUCCGRACE === '1', RD: process.env.RAIDDENSITY === '1' };
const missing = Object.entries(flags).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error('TRIBCOLLAPSE FATAL: r6 substrate flags required: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 (missing: ' + missing.join(',') + ').');
  process.exit(2);
}
const TF = require('./policies/tribfloor');
if (!TF.layerOn()) {
  console.error('TRIBCOLLAPSE FATAL: tribfloor layerOn() false despite TRIBFLOOR=1 — wrapper not armed.');
  process.exit(2);
}

const { leadfeast, belongfeast } = TF;
const POLICY_REGISTRY = { leadfeast, belongfeast };
for (const [pid, pol] of Object.entries(POLICY_REGISTRY)) {
  if (!pol || pol.id !== pid) {
    console.error(`TRIBCOLLAPSE FATAL: policy '${pid}' failed named-export unwrap (got id '${pol && pol.id}'). Suite refuses to run policy-less.`);
    process.exit(2);
  }
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; };
// Beat capture: national/scale/wave/death/succession beats for attribution,
// plus the full-text sample for loss narratives (capped). r6 additions for
// the tribute-collapse detector: the grief-leverage ratchet line
// ("tribute rises to ... kcal/week") and the TRIBFLOOR floor-cap line
// ("tribute takes ... of ... kcal and no more") — both already match the
// /tribute/ arm of the regex below; listed here so a future regex edit
// keeps them.
const BEAT_RE = /wave 4|wave 5|mirror draft|standing|national|regional|link|break|tribute|exile|table|died|dead|starv|ascend|treaty|succession|realm came apart|pantry|famine|won\b|bond is fraying|silence answered|grief delays the verdict|doubled watch/i;

function attachBeats(Game, t) {
  t.beats = [];
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 300);
      if (BEAT_RE.test(s)) {
        t.beats.push({ day: gday(Game), text: s });
        if (t.beats.length > 3000) t.beats.splice(0, 500);
      }
    } catch (e) {}
  };
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  Game.say = function (msg) { push(msg); return origSay ? origSay(msg) : msg; };
  if (origSys) Game.sysSay = function (msg) { push(msg); return origSys ? origSys(msg) : msg; };
}

function attachDeaths(Game, t) {
  t.deaths = [];
  const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (origReg) {
    Game.registerDeath = function (opts) {
      const r = origReg(opts);
      try {
        const o = opts || {};
        if (t.deaths.length < 500) {
          t.deaths.push({
            day: gday(Game), kind: String(o.kind || '?'),
            vid: String(o.villagerId || o.monsterId || '?').slice(0, 24),
            name: String(o.name || '?').slice(0, 40),
            cause: String(o.cause || '?').slice(0, 80),
          });
        }
      } catch (e) {}
      return r;
    };
  }
}

async function oneRun(seed, pid, days, opts) {
  opts = opts || {};
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const { Game } = await loadGame({ seed, mode: 'tribcollapse-' + pid });
  await setupGame(Game);

  const m = fc.attachInstruments(Game);
  sr.attachScale(Game, m);
  const t = {};
  if (opts.instrument !== false) {
    attachBeats(Game, t);
    attachDeaths(Game, t);
  }
  const hashes = [];
  const scaleRows = [];
  const foodRows = [];
  const standingRows = [];
  const waveUnlockDays = { 4: null, 5: null };
  let lastWave = 1;
  let nSamples = 0;

  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try {
      hashes.push(RB.trajectoryHash(G));
      const fr = fc.dailyRow(G); foodRows.push(fr);
      const srw = sr.scaleRow(G); scaleRows.push(srw);
      const st = TW.standingSample(G);
      standingRows.push({ day: st.day, unlockedWave: st.unlockedWave, rank: st.rank, gated: st.gated, tableSeat: st.tableSeat });
      if (st.unlockedWave > lastWave) {
        for (let w = lastWave + 1; w <= st.unlockedWave; w++) {
          if (w === 4 || w === 5) waveUnlockDays[w] = st.day;
        }
        lastWave = st.unlockedWave;
      }
      nSamples++;
    } catch (e) {}
  };

  const result = await runDays(Game, policy, { days, sampleEvery: 10 });
  const daysRan = result.days;
  const trajHash = crypto.createHash('sha1').update(hashes.join('|')).digest('hex');

  const exiledRow = scaleRows.find(r => r.exiled);
  let tableSeat = 'none', maxWave = 1;
  try { const s = (Game.tableSeat || (() => null)).call(Game); tableSeat = (s && s.seat) || 'none'; } catch (e) {}
  try { maxWave = Number((Game.unlockedWave || (() => 1)).call(Game)) || 1; } catch (e) {}

  const rec = {
    seed, policy: pid, days: daysRan, endReason: result.endReason,
    won: /win|won/i.test(String(result.endReason || '')),
    scaleRows, foodRows, standingRows, waveUnlockDays,
    deaths: t.deaths || [], beats: t.beats || [],
    breaks: (m.scale.breaks || []).map(b => ({ day: b.day, link: b.link })),
    exiledEver: !!exiledRow, exiledDay: exiledRow ? exiledRow.day : null,
  };
  const loss = HL.nationalLoss(rec);
  const narrative = loss.reached ? HL.last20Narrative(rec, Object.assign({ waveUnlockDays }, loss)) : null;
  loss.waveUnlockDays = waveUnlockDays;

  // r6: arrears-at-dissolve for tribute-collapse losses — the belong-link
  // arrears level at/just after the loss day (the number Steve's
  // grief-leverage call needs). Read from the same window the detector
  // uses, on the full rows.
  let arrearsAtLoss = null;
  if (loss.lossMode === 'tribute-collapse') {
    try {
      const win = scaleRows.filter(r => r.day >= loss.lossDay - 7 && r.day <= loss.lossDay + 1 && r.links);
      const sumB = (row) => (row.links || []).reduce((t, l) => t + (l.kind === 'belong' ? (Number(l.arrears) || 0) : 0), 0);
      if (win.length) arrearsAtLoss = Math.round(sumB(win[win.length - 1]));
    } catch (e) {}
  }

  const row = {
    seed, policy: pid, days: daysRan, endReason: result.endReason, trajHash, nSamples,
    national: !!loss.reached, holdDays: loss.reached ? loss.holdDays : 0,
    holdBucket: loss.reached ? HL.holdBucket(loss.holdDays) : 'n/a',
    lossMode: loss.reached ? loss.lossMode : 'n/a',
    lossDay: loss.reached ? loss.lossDay : null,
    arrearsAtLoss,
    graceBeats: loss.graceBeats || 0,
    won: rec.won, table: tableSeat !== 'none', tableSeat, maxWave,
    survivalDays: daysRan, exiled: rec.exiledEver,
    nDeaths: rec.deaths.length, famCounts: loss.famCounts || {},
  };
  return { row, rec, loss, narrative };
}

async function detgate() {
  console.log('DETGATE: byte-identical checks (r6 substrate)');
  let fail = 0;
  const chk = (name, a, b) => {
    if (a === b) { console.log('  PASS ' + name); }
    else { fail++; console.log('  FAIL ' + name + ' — ' + String(a).slice(0, 16) + ' != ' + String(b).slice(0, 16)); }
  };
  const c1 = await oneRun(11, 'leadfeast', 60, { instrument: false });
  const c2 = await oneRun(11, 'leadfeast', 60, { instrument: false });
  chk('D1 gate determinism (11/leadfeast/60d x2, instrument OFF, r6 substrate)', c1.row.trajHash, c2.row.trajHash);
  const i1 = await oneRun(33, 'belongfeast', 60, { instrument: true });
  const i2 = await oneRun(33, 'belongfeast', 60, { instrument: false });
  chk('D2 instrument ON vs OFF byte-identical (33/belongfeast/60d)', i1.row.trajHash, i2.row.trajHash);
  if (fail) { console.error('DETGATE FAILED'); process.exit(1); }
  console.log('DETGATE GREEN');
}

async function smoke() {
  console.log('SMOKE: 15d x {leadfeast,belongfeast} (r6 substrate)');
  let fail = 0;
  for (const pid of ['leadfeast', 'belongfeast']) {
    const { row, rec } = await oneRun(11, pid, 15);
    const ok = row.nSamples >= 10 && row.days === 15 && rec.scaleRows.length >= 10 && rec.foodRows.length >= 10;
    if (ok) console.log(`  PASS ${pid} — ${row.nSamples} samples, 15d, beats=${rec.beats.length}, deaths=${rec.deaths.length}`);
    else { fail++; console.log(`  FAIL ${pid} — nSamples=${row.nSamples} days=${row.days} scaleRows=${rec.scaleRows.length} foodRows=${rec.foodRows.length}`); }
  }
  if (fail) { console.error('SMOKE FAILED'); process.exit(1); }
  console.log('SMOKE GREEN');
}

async function runSweep() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(x => x.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-15/sim-tribcollapse-runs.json';
  const perseedDir = process.env.PERSEED_DIR || 'evidence/2026-10-15/perseed-tribcollapse';
  fs.mkdirSync(perseedDir, { recursive: true });
  // r6: trajectory-identity check vs the r5 census (same base expected).
  let r5rows = [];
  try {
    r5rows = JSON.parse(fs.readFileSync('evidence/2026-10-15/sim-holdloss2-runs.json', 'utf8'));
  } catch (e) { console.log('  (no r5 rows for traj-identity check: ' + (e && e.message || e) + ')'); }
  const r5hash = {};
  for (const r of r5rows) r5hash[r.policy + '-s' + r.seed] = r.trajHash;
  const rows = [];
  const t0 = Date.now();
  for (const pid of policyIds) {
    for (const seed of seeds) {
      console.log(`-- ${pid} seed ${seed}`);
      const { row, rec, loss, narrative } = await oneRun(seed, pid, days);
      rows.push(row);
      const ident = r5hash[pid + '-s' + seed];
      const identTag = ident ? (ident === row.trajHash ? 'TRAJ-IDENTICAL-r5' : 'TRAJ-DIVERGED-r5') : 'no-r5-row';
      const pname = `${pid}-s${seed}`;
      fs.writeFileSync(path.join(perseedDir, pname + '.json'),
        JSON.stringify({ seed, policy: pid, loss, narrative, famCounts: loss.famCounts, subCauses: loss.subCauses }, null, 1));
      // r6: persist the FULL scaleRows (with per-link arrears) for audit —
      // the r5 mapping dropped the rows the spike detector reads.
      fs.writeFileSync(path.join(perseedDir, pname + '-full.json'),
        JSON.stringify({ seed, policy: pid, daysRan: row.days, endReason: row.endReason, loss,
          deaths: rec.deaths, beats: rec.beats.slice(-400),
          foodRows: rec.foodRows, scaleRows: rec.scaleRows,
          standingRows: rec.standingRows, breaks: rec.breaks }));
      console.log(`   d=${row.days} ${row.endReason} national=${row.national} hold=${row.holdDays}d mode=${row.lossMode} grace=${row.graceBeats} table=${row.table} w=${row.maxWave} ${identTag}`);
    }
  }
  fs.writeFileSync(out, JSON.stringify(rows, null, 1));
  console.log(`\nwrote ${rows.length} rows -> ${out} (${Math.round((Date.now() - t0) / 1000)}s)`);
}

(async () => {
  if (process.env.SMOKE === '1') return smoke();
  if (process.env.DETGATE === '1') return detgate();
  return runSweep();
})().catch(e => { console.error('TRIBCOLLAPSE FATAL:', e && e.stack || e); process.exit(1); });
