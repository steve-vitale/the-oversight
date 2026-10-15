#!/usr/bin/env node
// scripts/sweep-survdiff-20261015.js — post-wave-4-unlock survival-differential
// sweep (sim-survdiff, 2026-10-15, scale-onramp axis). Executes sim-findings
// #268's named diagnostic: what distinguishes wave-4-unlock villages that
// survive 30d+ post-unlock from those that die 20-50d early?
//
// DIAGNOSTIC ARM, instrument-only: 8 seeds x {leadfeast, belongfeast},
// 180d death-aware, on the feast-stack substrate asserted up front:
//   FEASTSCALE_R13=1  (policy layer: the courtship road's real contribution
//                      (tribute/tend) arms the food-r7 feast gate)
//   TRIBFLOOR=1       (policy layer: tribute never below the 2-day pantry
//                      floor — policies imported from ./policies/tribfloor,
//                      same ids, wrapper delegates byte-identically when off)
//   SUCCGRACE=1       (game-code env gate: sub-bar-link answerable
//                      renegotiation beat at the funeral)
//   RAIDDENSITY=1     (game-code env gate: 7-day post-raid cooldown on
//                      young nationals, both rival-raid channels)
// Single side, no lever. For EVERY run that unlocks wave 4, the instrument
// records: unlock day; standing composition at unlock (war/dip/plenty,
// gated vs raw); and at unlock+30d (or at death if earlier): villager
// count, median villager HP, wound load, armor coverage, counters known
// (villagerTricks + monsterCounters), pantry kcal + fresh-days, wave-4+
// fight count and deaths in the window, death cause if died. Pure
// classifier: survivor (alive >=30d post-unlock) vs non-survivor.
// scripts/survdiff-lib-20261015.js holds the sampler + classifier; this file
// drives the sims and persists the rows.
//
// Modes:
//   SMOKE=1      15d x {leadfeast,belongfeast}: samples collect, no crash.
//   DETGATE=1    D1 gate determinism (60d x2 byte-identical, full substrate);
//                D2 instrument ON vs OFF byte-identical 60d.
//                D3 deaths captured on a 60d run (non-empty when the village dies).
//   default      the 16-run suite -> evidence/2026-10-15/perseed-survdiff/,
//                evidence/2026-10-15/sim-survdiff-runs.json.
//
// Env:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/sweep-survdiff-20261015.js
//   SMOKE=1 <flags> node scripts/sweep-survdiff-20261015.js
//   DETGATE=1 <flags> node scripts/sweep-survdiff-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const SD = require('./survdiff-lib-20261015');
const RB = require('./readinessbind-lib');

const flags = { R13: process.env.FEASTSCALE_R13 === '1', TF: process.env.TRIBFLOOR === '1', SG: process.env.SUCCGRACE === '1', RD: process.env.RAIDDENSITY === '1' };
const missing = Object.entries(flags).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error('SURVDIFF FATAL: substrate flags required: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 (missing: ' + missing.join(',') + ').');
  process.exit(2);
}
const TF = require('./policies/tribfloor');
if (!TF.layerOn()) {
  console.error('SURVDIFF FATAL: tribfloor layerOn() false despite TRIBFLOOR=1 — wrapper not armed.');
  process.exit(2);
}
const { leadfeast, belongfeast } = TF;
const POLICY_REGISTRY = { leadfeast, belongfeast };
for (const [pid, pol] of Object.entries(POLICY_REGISTRY)) {
  if (!pol || pol.id !== pid) {
    console.error(`SURVDIFF FATAL: policy '${pid}' failed named-export unwrap (got id '${pol && pol.id}'). Suite refuses to run policy-less.`);
    process.exit(2);
  }
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; };
// Beat capture: wave/standing/death/succession/combat beats for the
// post-unlock window sense read, plus the narrative slices. Bounded.
const BEAT_RE = /wave 4|wave 5|mirror draft|standing|national|regional|link|break|tribute|exile|table|died|dead|starv|ascend|treaty|succession|realm came apart|pantry|famine|won\b|bond is fraying|silence answered|grief delays the verdict|doubled watch|combat|raid|breach|funeral/i;

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
        if (t.deaths.length < 2000) {
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

// attachFights: record wave>=2 fights (villager fieldFights + player
// startCombats). Read-only wraps — the fight itself is untouched. The
// window analysis filters wave>=4; per-wave totals are kept unbounded
// for the whole run so no wave is invisible.
function attachFights(Game, t) {
  t.fights = [];
  t.fightCounts = {};
  const push = (f) => { if (t.fights.length < 5000) t.fights.push(f); };
  const count = (w) => { t.fightCounts[w] = (t.fightCounts[w] | 0) + 1; };
  const origFF = Game.fieldFight ? Game.fieldFight.bind(Game) : null;
  if (origFF) {
    Game.fieldFight = function (vid, mdef, m, opts) {
      const r = origFF(vid, mdef, m, opts);
      try {
        const wave = SD.fightWaveOf(mdef);
        count(wave);
        if (wave >= 2) {
          push({ day: gday(Game), side: 'villager', vid: String(vid).slice(0, 16),
            mid: String((mdef && mdef.id) || '?').slice(0, 40), wave,
            outcome: String((r && r.outcome) || '?'), rounds: (r && r.rounds | 0) || 0,
            vTaken: Math.round((r && r.vTaken) || 0), mDealt: Math.round((r && r.mDealt) || 0),
            log: ((r && r.log) || []).slice(-12) });
        }
      } catch (e) {}
      return r;
    };
  }
  const origSC = Game.startCombat ? Game.startCombat.bind(Game) : null;
  if (origSC) {
    Game.startCombat = function (monsterId) {
      const r = origSC(monsterId);
      try {
        const mdef = ((Game.data || {}).monsters || []).find(x => x && x.id === monsterId) || {};
        const wave = (mdef.wave | 0) || 1;
        // Record only real starts: the refuse path (a fight already live)
        // is not a new fight.
        if (wave >= 2 && Game.tbfight && !Game.tbfight.over) {
          count(wave);
          push({ day: gday(Game), side: 'player', mid: String(monsterId).slice(0, 40), wave, outcome: 'started', rounds: 0 });
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
  const { Game } = await loadGame({ seed, mode: 'survdiff-' + pid });
  await setupGame(Game);

  const t = {};
  if (opts.instrument !== false) {
    attachBeats(Game, t);
    attachDeaths(Game, t);
    attachFights(Game, t);
  }
  const hashes = [];
  const dailyRows = [];
  let unlock4 = null, unlock5day = null;

  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try {
      hashes.push(RB.trajectoryHash(G));
      const st = SD.sampleStanding(G);
      const vs = SD.sampleVillageState(G);
      const faced = SD.sampleFaced(G);
      if (unlock4 === null && st.uw >= 4) unlock4 = { day: st.day, standing: { raw: st.raw, gated: st.gated, war: st.war, diplomacy: st.diplomacy, plenty: st.plenty, warPts: st.warPts, links: st.links, feasts: st.feasts } };
      if (unlock5day === null && st.uw >= 5) unlock5day = st.day;
      dailyRows.push({ day: st.day, uw: st.uw, standing: { raw: st.raw, gated: st.gated, war: st.war, diplomacy: st.diplomacy, plenty: st.plenty }, vs, faced });
    } catch (e) {}
  };

  const result = await runDays(Game, policy, { days, sampleEvery: 10 });
  const daysRan = result.days;
  const endReason = result.endReason;
  const finalDay = SD.gday(Game);
  const trajHash = crypto.createHash('sha1').update(hashes.join('|')).digest('hex');

  // Merge the two death sources (registerDeath wrap + harness tele capture
  // with its player flag), deduped by day|id|cause. The tele `who` is the
  // id (vid); the wrap records vid + '/' + name — dedupe on the vid only
  // or the same death counts twice (2026-10-15: s55 showed 32 rows for
  // ~16 deaths).
  const seen = new Set(), deaths = [];
  const addDeath = (day, who, cause, player) => {
    const id = String(who).split('/')[0];
    const k = day + '|' + id + '|' + cause;
    if (seen.has(k)) return;
    seen.add(k);
    deaths.push({ day, who: String(who).slice(0, 24), cause: String(cause).slice(0, 80), player: !!player });
  };
  for (const d of (t.deaths || [])) addDeath(d.day, d.vid + '/' + d.name, d.cause, /player|scholar/i.test(d.kind));
  for (const d of (((result.samples || {}).deaths) || [])) addDeath(d.day, d.who, d.cause, d.player);

  let tableSeat = 'none', maxWave = 1, scaleRank = 'village';
  try { const s = (Game.tableSeat || (() => null)).call(Game); tableSeat = (s && s.seat) || 'none'; } catch (e) {}
  try { maxWave = Number((Game.unlockedWave || (() => 1)).call(Game)) || 1; } catch (e) {}
  try { scaleRank = Game.scaleRank ? (Game.scaleRank() || 'village') : 'village'; } catch (e) {}

  const rec = {
    seed, policy: pid, days: daysRan, endReason, trajHash, nSamples: dailyRows.length,
    unlockDay: null, verdict: 'no-unlock',
  };

  if (unlock4) {
    const ud = unlock4.day;
    const evalDay = Math.min(ud + 30, daysRan);
    const alive30 = daysRan >= ud + 30;
    const rowAt = (d) => dailyRows.find(r => r.day === d) || dailyRows[dailyRows.length - 1];
    const stateAtUnlock = (rowAt(ud) || {}).vs || null;
    const stateAtEval = (rowAt(evalDay) || {}).vs || null;
    // SELF-CONSISTENCY GUARD (2026-10-15: the day-0 stamping bug — gday()
    // called without Game stamped every fight day 0 and silently zeroed
    // the window count on the first sweep). The bound is the final game
    // day, not the loop counter: fights can fire after the last sleep()
    // (e.g. a contest fight on scholar-day 131 when the loop ended at 130).
    // Fail loudly, never measure a phantom.
    for (const f of (t.fights || [])) {
      if (!(f.day >= 1 && f.day <= finalDay)) {
        throw new Error(`SURVDIFF FATAL: fight record with day=${f.day} outside [1,${finalDay}] (${f.side}:${f.mid} w${f.wave}) — day stamping broken`);
      }
    }
    const fightsW4 = (t.fights || []).filter(f => f.day > ud && f.day <= evalDay && f.wave >= 4);
    const deathsWindow = deaths.filter(d => d.day > ud && d.day <= evalDay);
    let deathFamily = null;
    const playerDeaths = deathsWindow.filter(d => d.player);
    if (playerDeaths.length) {
      deathFamily = SD.classifyDeathFamily(playerDeaths[playerDeaths.length - 1].cause).family;
    } else if (deathsWindow.length) {
      const tally = {};
      for (const d of deathsWindow) {
        const f = SD.classifyDeathFamily(d.cause).family || 'other';
        tally[f] = (tally[f] | 0) + 1;
      }
      deathFamily = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0];
    }
    const fU = (rowAt(ud) || {}).faced || { w4: [], w5: [] };
    const fE = (rowAt(evalDay) || {}).faced || { w4: [], w5: [] };
    rec.unlockDay = ud;
    rec.standingAtUnlock = unlock4.standing;
    rec.road = SD.dominantRoad(unlock4.standing);
    rec.evalDay = evalDay;
    rec.windowDays = evalDay - ud;
    rec.alive30 = alive30;
    rec.diedInWindow = !alive30;
    rec.stateAtUnlock = stateAtUnlock;
    rec.stateAtEval = stateAtEval;
    rec.fightsW4plus = fightsW4.length;
    rec.fightsW4plusLog = fightsW4.slice(0, 60);
    rec.deathsWindow = deathsWindow;
    rec.deathFamily = deathFamily;
    rec.newFacedW4 = fE.w4.filter(m => fU.w4.indexOf(m) < 0);
    rec.newFacedW5 = fE.w5.filter(m => fU.w5.indexOf(m) < 0);
    rec.unlock5day = unlock5day;
    rec.w5InWindow = unlock5day != null && unlock5day <= evalDay;
    rec.verdict = SD.classifyRecord(rec).verdict;
  }

  const row = {
    seed, policy: pid, days: daysRan, endReason, trajHash, nSamples: rec.nSamples,
    unlockDay: rec.unlockDay, verdict: rec.verdict, road: rec.road || null,
    alive30: rec.alive30 === true, windowDays: rec.windowDays | 0,
    unlock5day: rec.unlock5day != null ? rec.unlock5day : null,
    w5InWindow: rec.w5InWindow === true,
    won: /win|won/i.test(String(endReason || '')), table: tableSeat !== 'none',
    maxWave, scaleRank, exiled: false,
    nDeaths: deaths.length, fightCounts: t.fightCounts || {},
  };
  return { row, rec, t, dailyRows };
}

async function detgate() {
  console.log('DETGATE: byte-identical checks (feast-stack substrate)');
  let fail = 0;
  const chk = (name, a, b) => {
    if (a === b) { console.log('  PASS ' + name); }
    else { fail++; console.log('  FAIL ' + name + ' — ' + String(a).slice(0, 16) + ' != ' + String(b).slice(0, 16)); }
  };
  const c1 = await oneRun(11, 'leadfeast', 60, { instrument: false });
  const c2 = await oneRun(11, 'leadfeast', 60, { instrument: false });
  chk('D1 gate determinism (11/leadfeast/60d x2, instrument OFF)', c1.row.trajHash, c2.row.trajHash);
  const i1 = await oneRun(33, 'belongfeast', 60, { instrument: true });
  const i2 = await oneRun(33, 'belongfeast', 60, { instrument: false });
  chk('D2 instrument ON vs OFF byte-identical (33/belongfeast/60d)', i1.row.trajHash, i2.row.trajHash);
  // D3: deaths are actually captured on a 60d run.
  const dN = (i1.rec && i1.rec.unlockDay != null) ? 'n/a-unlocked' : i1.row.nDeaths;
  if (i1.row.nDeaths > 0) console.log('  PASS D3 deaths captured (33/belongfeast/60d: n=' + i1.row.nDeaths + ')');
  else { fail++; console.log('  FAIL D3 deaths captured — 0 deaths on 33/belongfeast/60d'); }
  // D4: the daily sampler is intact (standing/village rows on every day).
  if (i1.dailyRows.length >= 55 && i1.dailyRows.every(r => r.standing && r.vs)) console.log('  PASS D4 sampler rows intact (' + i1.dailyRows.length + ' rows)');
  else { fail++; console.log('  FAIL D4 sampler rows intact — n=' + i1.dailyRows.length); }
  if (fail) { console.error('DETGATE FAILED'); process.exit(1); }
  console.log('DETGATE GREEN');
}

async function smoke() {
  console.log('SMOKE: 15d x {leadfeast,belongfeast} (feast-stack substrate)');
  let fail = 0;
  for (const pid of ['leadfeast', 'belongfeast']) {
    const { row, dailyRows } = await oneRun(11, pid, 15);
    const ok = row.nSamples >= 12 && row.days === 15 && dailyRows.length >= 12 && dailyRows.every(r => r.standing && r.vs && r.faced);
    if (ok) console.log(`  PASS ${pid} — ${row.nSamples} samples, 15d, fights=${JSON.stringify(row.fightCounts)}`);
    else { fail++; console.log(`  FAIL ${pid} — nSamples=${row.nSamples} days=${row.days} rows=${dailyRows.length}`); }
  }
  if (fail) { console.error('SMOKE FAILED'); process.exit(1); }
  console.log('SMOKE GREEN');
}

async function runSweep() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(x => x.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-15/sim-survdiff-runs.json';
  const perseedDir = process.env.PERSEED_DIR || 'evidence/2026-10-15/perseed-survdiff';
  fs.mkdirSync(perseedDir, { recursive: true });
  const rows = [];
  const t0 = Date.now();
  for (const pid of policyIds) {
    for (const seed of seeds) {
      console.log(`-- ${pid} seed ${seed}`);
      const { row, rec, t, dailyRows } = await oneRun(seed, pid, days);
      rows.push(row);
      const pname = `${pid}-s${seed}`;
      const senseWindow = rec.unlockDay != null
        ? { from: Math.max(1, rec.unlockDay - 5), to: rec.evalDay + 5,
            beats: (t.beats || []).filter(b => b.day >= Math.max(1, rec.unlockDay - 5) && b.day <= rec.evalDay + 5) }
        : null;
      fs.writeFileSync(path.join(perseedDir, pname + '.json'),
        JSON.stringify({ seed, policy: pid, row, rec, senseWindow }, null, 1));
      fs.writeFileSync(path.join(perseedDir, pname + '-rows.json'),
        JSON.stringify({ seed, policy: pid, daysRan: row.days, endReason: row.endReason, dailyRows }, null, 1));
      console.log(`   d=${row.days} ${row.endReason} unlock4=${row.unlockDay} verdict=${row.verdict} road=${row.road} alive30=${row.alive30} fightsW4=${rec.fightsW4plus | 0} deathsW=${(rec.deathsWindow || []).length} w5=${row.unlock5day} maxW=${row.maxWave}`);
    }
  }
  fs.writeFileSync(out, JSON.stringify(rows, null, 1));
  analyzeVerdict(rows, perseedDir);
  console.log(`\nwrote ${rows.length} rows -> ${out} (${Math.round((Date.now() - t0) / 1000)}s)`);
}

// analyzeVerdict(rows, perseedDir): the pure verdict analysis, factored out
// so ANALYZE=1 can run it over already-persisted per-seed files without
// re-running sims (used when a sweep is interrupted mid-run).
function analyzeVerdict(rows, perseedDir) {
  const unlocking = rows.filter(r => r.unlockDay != null).map(r => {
    const full = JSON.parse(fs.readFileSync(path.join(perseedDir, `${r.policy}-s${r.seed}.json`), 'utf8'));
    return full.rec;
  });
  const classified = unlocking.map(r => ({ verdict: SD.classifyRecord(r).verdict, rec: r }));
  const surv = classified.filter(c => c.verdict === 'survivor');
  const nons = classified.filter(c => c.verdict === 'non-survivor');
  const pct = unlocking.length ? Math.round(100 * (surv.length + nons.length) / unlocking.length) : 0;
  console.log(`\nCLASSIFICATION: ${unlocking.length} unlocked, ${surv.length} survivor, ${nons.length} non-survivor (${pct}% classified)`);
  const factors = SD.differentialFactors(classified.map(c => c.rec));
  console.log('DIFFERENTIAL FACTORS:');
  for (const f of factors) {
    console.log(`  ${f.perfect ? 'PERFECT' : 'STRONG'} ${f.label} (${f.side}): thr=${f.threshold} — survivors ${f.survOK}/${f.survN}, non-survivors ${f.nonOK}/${f.nonN}`);
  }
  if (!factors.length) console.log('  (none — no candidate separates the classes)');
  const roads = SD.roadSplit(classified.map(c => c.rec));
  console.log('ROAD SPLIT:', JSON.stringify(roads));
  const go = pct >= 90 && factors.length > 0;
  console.log(`\nPRIMARY GO (>=90% classified WITH named factors): ${go ? 'GO' : 'NO-GO'}`);
  fs.writeFileSync(path.join(perseedDir, 'verdict.json'),
    JSON.stringify({ n: rows.length, unlocked: unlocking.length, survivor: surv.length, nonsurvivor: nons.length, pctClassified: pct, factors, roads, go }, null, 1));
}

async function analyzeOnly() {
  const perseedDir = process.env.PERSEED_DIR || 'evidence/2026-10-15/perseed-survdiff';
  const out = process.env.OUT || 'evidence/2026-10-15/sim-survdiff-runs.json';
  const rows = [];
  for (const f of fs.readdirSync(perseedDir)) {
    if (!f.endsWith('.json') || f.indexOf('-rows') >= 0 || f === 'verdict.json') continue;
    try {
      const full = JSON.parse(fs.readFileSync(path.join(perseedDir, f), 'utf8'));
      if (full && full.row) rows.push(full.row);
    } catch (e) {}
  }
  rows.sort((a, b) => (a.policy < b.policy ? -1 : a.policy > b.policy ? 1 : a.seed - b.seed));
  fs.writeFileSync(out, JSON.stringify(rows, null, 1));
  console.log(`ANALYZE: ${rows.length} rows from ${perseedDir}`);
  analyzeVerdict(rows, perseedDir);
  console.log(`\nwrote ${rows.length} rows -> ${out}`);
}

(async () => {
  if (process.env.SMOKE === '1') return smoke();
  if (process.env.DETGATE === '1') return detgate();
  if (process.env.ANALYZE === '1') return analyzeOnly();
  return runSweep();
})().catch(e => { console.error('SURVDIFF FATAL:', e && e.stack || e); process.exit(1); });
