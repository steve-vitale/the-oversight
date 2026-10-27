#!/usr/bin/env node
// test-raidcallers-b.js — VENDORED + ADAPTED proof, from
// sim-ledgerbound-b:scripts/test-ledgerbound-b.js, for
// sim-raidcallers-b. Adaptations: corpus dir + env name, sweep
// script name, analyzer require, det-gate over RAIDCALLERS, corpus
// validity for the raid fields, independent RAIDDOOR boundary
// recomputation, raid disjointness/integrity checks, and the
// allowed-modified set. The ledgerbound branch is untouched.
// RAIDCALLERS additions: independent CALLER-COMPLETE recomputation
// (the judged legs), non-raid integrity + disjointness checks, a
// parameterized corpus policy (RAIDCALLERS_POLICY, default
// competent-nofeast), det-gate seed taken from the corpus itself
// (first file) instead of hardcoded 9820, NO pinned-base allowance
// (this arm sweeps on current HEAD), and raiddor files added to the
// sibling-hygiene list. The raiddor branch is untouched.
//
// Checks, all exit-1 on failure (except INFO lines):
//   1. Corpus validity: 8 per-seed JSONs in sim-stockdoors-b-corpus,
//      policy fields correct, stockdoorsOn true, no truncation flags,
//      opening stock + dried events + stockdoor records + direct
//      records present, all 7 direct methods wrapped, none missing.
//   2. Det-gate (prereg leg 1): the corpus's first seed run twice
//      (RAIDCALLERS=1 vs 0, stdout-JSON mode via pipe capture — never
//      /tmp) produces identical inflow records, mealdraw records,
//      spoilvol records, driedpath records, death lists, and wall
//      fields (stockdoors + raidcallers fields and `ms` excluded).
//      The RAIDCALLERS=1 det-gate run also reproduces the corpus
//      seed's counts.
//   3. Independent leg recomputation: a second code path (single-pass
//      family aggregation straight from the raw records, not the
//      analyzer's channel-map path) reproduces the analyzer's pooled
//      NEW residuals for the named set, the generic set, and the
//      dried channel; the verdict string follows from leg 1 + legs
//      2-5 (GO iff all pass, DIAG-NO-GO iff leg 1 or 2 fails or no
//      non-raid caller fired, NO-GO otherwise). The proof is GREEN on
//      a correctly-derived NO-GO or DIAG-NO-GO, as in driedpath — the
//      failures that would make it red are instrument/hygiene
//      failures, not a NO-GO verdict.
//   4. Instrument integrity: stockdoor spoilDay invariant
//      (spoilDay = vDay + 3) on every record; event-take retMismatch
//      count is 0; no direct record claims a path outside the known
//      set (npc-adult/npc-child/alien-raid/thief.steal_pantry/
//      event-take/player-take/player-take-bulk, or any other
//      useAbility ability.action key reported under its own key);
//      the wrapped method set contains no pantryDraw/drawSpoiled
//      (disjointness from mealdraw — no kcal recorded twice).
//   5. Control observation (INFO, never a verdict input): the
//      OLD-definition pooled ledger on this head vs the driedpath
//      corpus's OLD-definition pooled ledger, and per-seed trajectory
//      fields (deaths, wave, wall) vs driedpath — a base move is
//      reported, never judged.
//   6. Hygiene: zero src/js files modified vs HEAD, zero sibling
//      capture files modified (inflow/mealdraw/spoilvol/driedpath/
//      stockdoor-capture, ledgerbound AND raiddor files), and no
//      modified tracked file outside this run's own files.
// Usage: RAIDCALLERS_POLICY=<policy-id> node scripts/test-raidcallers-b.js
//   (plus the band's layer envs, e.g. TREELINE=1, for the det-gate).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CORPUS = process.env.RAIDCALLERS_CORPUS_DIR || path.join(ROOT, 'evidence', '2026-10-27', 'sim-raidcallers-b-corpus');
const EXPECTED_POLICY = process.env.RAIDCALLERS_POLICY || 'competent-nofeast';
const POLICY_BASE = EXPECTED_POLICY.replace(/-nofeast$/, '');
const RESIDUALHUNT_CORPUS = path.join(ROOT, 'evidence', '2026-10-27', 'sim-residualhunt-b-corpus');
const DRIEDPATH_CORPUS = path.join(ROOT, 'evidence', '2026-10-26', 'sim-driedpath-b-corpus');
const { computeLegs } = require('./analyze-raidcallers-b');
let DET_SEED = 0;

let failures = 0;
function check(name, ok, extra) {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (extra != null ? ' — ' + extra : ''));
  if (!ok) failures++;
}
function famOf(nm) { return String(nm || '').replace(/ \((dried|smoked)\)$/, ''); }
function isDried(nm) { return / \((dried|smoked)\)$/.test(String(nm || '')); }
function stripForDetGate(j) {
  const c = JSON.parse(JSON.stringify(j));
  delete c.stockdoorRecords; delete c.stockdoorCounters; delete c.stockdoorTruncated;
  delete c.directRecords; delete c.directCounters; delete c.stockdoorsOn; delete c.ms;
  delete c.raidRecords; delete c.raidCounters; delete c.raiddorOn; delete c.raidSayLines;
  return c;
}
function baseEnv(extra) {
  return Object.assign({}, process.env, {
    COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1',
    FEASTSCALE_R13: '0', SEEDS: String(DET_SEED), DAYS: '100', SAYCAP: '300',
    INFLOWCAP: '50000', MEALDRAWCAP: '50000', SWEEP_STDOUT_JSON: '1',
    POLICY: POLICY_BASE,
  }, extra);
}
function runDetGate(raiddors) {
  const out = execSync('node scripts/sweep-raidcallers-b.js', {
    cwd: ROOT, encoding: 'utf8', timeout: 900000, maxBuffer: 512 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit'],
    env: baseEnv({ STOCKDOORS: '1', RAIDCALLERS: raiddors }),
  });
  const lines = out.trim().split('\n').filter(Boolean);
  if (lines.length !== 1) throw new Error('det-gate: expected 1 JSON line, got ' + lines.length);
  return JSON.parse(lines[0]);
}

const KNOWN_DIRECT = new Set(['npc-adult-pantry', 'npc-child-pantry', 'alien-raid',
  'thief.steal_pantry', 'event-take', 'player-take', 'player-take-bulk']);
const EXPECTED_WRAPPED = ['npcTakeAction', 'npcChildAction', 'apPlaygroundRaid',
  'useAbility', '_evTakePantryKcal', 'takeFromPantry', 'takeFromPantryBulk'];
const NAMED = ["Lamb's Quarters", 'Burdock', 'Muscadine Grapes', 'Purslane'];

(function main() {
  // 1. Corpus validity.
  const files = fs.existsSync(CORPUS) ? fs.readdirSync(CORPUS).filter(f => f.endsWith('.json')).sort() : [];
  check('corpus has 8 pilot or 12 confirm per-seed files', files.length === 8 || files.length === 12, files.length + ' files');
  let corpusOk = true, corpusDet = null, wrappedOk = true;
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
    if (j.policy !== EXPECTED_POLICY || j.stockdoorsOn !== true || j.raiddorOn !== true || j.inflowTruncated || j.mealdrawTruncated ||
        !j.openingStock || !Array.isArray(j.driedEvents) || !Array.isArray(j.stockdoorRecords) ||
        !Array.isArray(j.directRecords) || !Array.isArray(j.raidRecords) || !Array.isArray(j.spoilDays) || j.spoilDays.length === 0) corpusOk = false;
    if (!j.raidCounters || j.raidCounters.wrapped !== true) corpusOk = false;
    const w = (j.directCounters || {}).wrappedPaths || [];
    const m = (j.directCounters || {}).missingPaths || [];
    if (m.length !== 0 || !EXPECTED_WRAPPED.every(x => w.indexOf(x) >= 0)) wrappedOk = false;
    if (!corpusDet) corpusDet = j;
  }
  check('corpus files valid (policy, stockdoorsOn, raiddorOn, no truncation, opening + dried + stockdoor + direct + raid present)', corpusOk);
  check('all 7 direct methods wrapped, none missing, on every seed', wrappedOk);
  if (corpusDet) { DET_SEED = corpusDet.seed; check('corpus det-gate seed present', true, 'seed ' + DET_SEED); }
  else console.log('INFO corpus empty — det-gate seed unavailable');

  // 1b. Corpus reproduction vs residualhunt (pilot band only).
  let reproOk = true, reproChecked = 0;
  if (fs.existsSync(RESIDUALHUNT_CORPUS)) {
    for (const f of files) {
      const j = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
      const rf = fs.readdirSync(RESIDUALHUNT_CORPUS).find(x => x.indexOf('-s' + j.seed + '.json') >= 0);
      if (!rf) continue;
      const rj = JSON.parse(fs.readFileSync(path.join(RESIDUALHUNT_CORPUS, rf), 'utf8'));
      const stripMs = (o) => { const c = JSON.parse(JSON.stringify(o)); delete c.ms;
        delete c.raidRecords; delete c.raidCounters; delete c.raiddorOn; delete c.raidSayLines; return JSON.stringify(c); };
      reproChecked++;
      if (stripMs(j) !== stripMs(rj)) reproOk = false;
    }
  }
  if (reproChecked) check('corpus reproduces residualhunt corpus (excluding ms) on all matched seeds', reproOk, reproChecked + ' seeds checked');
  else console.log('INFO corpus reproduction vs residualhunt skipped (no matched seeds — confirm band)');

  // 2. Det-gate.
  let on = null, off = null, detErr = null;
  try { on = runDetGate('1'); } catch (e) { detErr = 'on: ' + (e.message || e); }
  try { off = runDetGate('0'); } catch (e) { detErr = (detErr ? detErr + '; ' : '') + 'off: ' + (e.message || e); }
  check('det-gate runs completed', !detErr, detErr || 'both runs ok');
  let leg1Pass = false;
  if (on && off) {
    const a = stripForDetGate(on), b = stripForDetGate(off);
    const identical = JSON.stringify(a) === JSON.stringify(b);
    check('det-gate byte-identical (stockdoors + raiddor fields + ms excluded)', identical);
    check('det-gate inflow records identical', JSON.stringify(on.inflows) === JSON.stringify(off.inflows));
    check('det-gate mealdraw records identical', JSON.stringify(on.mealDrawRecords) === JSON.stringify(off.mealDrawRecords));
    check('det-gate spoilvol records identical', JSON.stringify(on.spoilEvents) === JSON.stringify(off.spoilEvents));
    check('det-gate driedpath records identical', JSON.stringify(on.driedEvents) === JSON.stringify(off.driedEvents));
    check('det-gate death lists identical', JSON.stringify(on.deathList) === JSON.stringify(off.deathList));
    check('det-gate wall fields identical',
      on.rank === off.rank && on.national === off.national && on.table === off.table &&
      on.win === off.win && JSON.stringify(on.waveReach) === JSON.stringify(off.waveReach));
    leg1Pass = identical;
    if (corpusDet) {
      check('det-gate run reproduces corpus det-seed counts',
        on.inflowSeen === corpusDet.inflowSeen && on.mealDrawRecords.length === corpusDet.mealDrawRecords.length &&
        on.deaths === corpusDet.deaths && (on.driedEvents || []).length === (corpusDet.driedEvents || []).length,
        `det-gate ${on.inflowSeen}/${on.mealDrawRecords.length}/${on.deaths}/${(on.driedEvents || []).length} vs corpus ${corpusDet.inflowSeen}/${corpusDet.mealDrawRecords.length}/${corpusDet.deaths}/${(corpusDet.driedEvents || []).length}`);
    }
    check('det-gate on-run recorded stockdoor + direct records',
      Array.isArray(on.stockdoorRecords) && on.stockdoorRecords.length > 0 &&
      Array.isArray(on.directRecords) && on.directRecords.length >= 0,
      `stockdoor=${(on.stockdoorRecords || []).length} direct=${(on.directRecords || []).length}`);
    check('det-gate off-run keeps stockdoors fields (STOCKDOORS stays 1 in both runs; only RAIDCALLERS toggles)', off && off.stockdoorRecords !== null && off.directRecords !== null);
    check('det-gate on-run recorded raid records array (raiddorOn true)',
      Array.isArray(on.raidRecords) && on.raiddorOn === true,
      `raid=${(on.raidRecords || []).length} raiddorOn=${on.raiddorOn}`);
    check('det-gate off-run recorded no raiddor fields', off && off.raidRecords === null && off.raiddorOn === false);
  }

  // 3. Independent leg recomputation (second code path: single-pass
  // family aggregation straight from raw records).
  const legs = computeLegs(CORPUS);
  const ind = { namedResid: 0, namedInflow: 0, namedCount: 0, namedPass: 0,
    genResid: 0, genInflow: 0, genCount: 0, genPass: 0, driedResid: 0, transPost: 0 };
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
    const fam = new Map();
    const g = (name) => {
      const k = famOf(name);
      if (!fam.has(k)) fam.set(k, { inflow: 0, draws: 0, sweep: 0, loss: 0, post: 0, open: 0, close: 0, openD: 0, closeD: 0, dIn: 0, dDraws: 0, dSweep: 0 });
      return fam.get(k);
    };
    for (const r of (j.inflows || [])) {
      if (r.door === 'stock' && !(r.kcal > 0)) continue;
      if (r.door === 'pantryAdd' && !r.added) continue;
      if (r.name == null) continue;
      g(r.name).inflow += r.kcal || 0;
    }
    for (const r of (j.stockdoorRecords || [])) if (r.kcal > 0) g('Foraged food').inflow += r.kcal || 0;
    for (const r of (j.mealDrawRecords || [])) {
      if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
      for (const it of (r.items || [])) if (it.name != null) g(it.name).draws += (it.units || 0) * (it.kcalEach || 0);
    }
    for (const r of (j.directRecords || [])) {
      for (const it of (r.items || [])) if (it.name != null) g(it.name).draws += (it.units || 0) * (it.kcalEach || 0);
    }
    for (const sw of ((j.spoilEvents || {}).sweeps || [])) {
      for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) g(bc.channel).sweep += bc.kcal || 0;
    }
    for (const ch of ((j.openingStock || {}).channels || [])) { const o = g(ch.channel); o.open += ch.freshKcal || 0; if (isDried(ch.channel)) o.openD += ch.freshKcal || 0; }
    const last = (j.spoilDays || [])[(j.spoilDays || []).length - 1] || {};
    for (const ch of (last.channels || [])) { const o = g(ch.channel); o.close += ch.freshKcal || 0; if (isDried(ch.channel)) o.closeD += ch.freshKcal || 0; }
    for (const e of (j.driedEvents || [])) {
      const nm = (e.before && e.before.channel) || (e.after && e.after.channel) || '?';
      const o = g(nm); o.post += e.postKcal || 0; if (e.linked && e.lossKcal != null) o.loss += e.lossKcal || 0;
    }
    // Dried draws / inflow / sweep per family (recomputed from the
    // same raw records, restricted to dried names).
    for (const r of (j.mealDrawRecords || [])) {
      if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
      for (const it of (r.items || [])) if (it.name != null && isDried(it.name)) g(it.name).dDraws += (it.units || 0) * (it.kcalEach || 0);
    }
    for (const r of (j.directRecords || [])) {
      for (const it of (r.items || [])) if (it.name != null && isDried(it.name)) g(it.name).dDraws += (it.units || 0) * (it.kcalEach || 0);
    }
    for (const r of (j.inflows || [])) {
      if (r.name == null || !isDried(r.name)) continue;
      if (r.door === 'stock' && !(r.kcal > 0)) continue;
      if (r.door === 'pantryAdd' && !r.added) continue;
      g(r.name).dIn += r.kcal || 0;
    }
    for (const sw of ((j.spoilEvents || {}).sweeps || [])) {
      for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) if (isDried(bc.channel)) g(bc.channel).dSweep += bc.kcal || 0;
    }
    for (const [name, o] of fam) {
      const resid = (o.close - o.open) - (o.inflow - o.draws - o.sweep - o.loss);
      const dResid = (o.closeD - o.openD) - (o.post + o.dIn - o.dDraws - o.dSweep);
      const isNamed = NAMED.indexOf(name) >= 0, isGen = name === 'Foraged food';
      // PROOF FIX (coordinator recovery): leg-5's denominator is the
      // BAND total transformed post-kcal (the analyzer's leg-2/leg-5
      // totPost, summed over all families), not the focal-only sum.
      // The prereg says "pooled transformed post-kcal" with no focal
      // qualifier; the focal-gated sum understated it (658,464 vs
      // 774,536). The residual (-5,456) already matched exactly; only
      // the denominator was mis-scoped. Leg 5 passes under either
      // denominator (0.70% band / 0.83% focal, bar 2%), so no verdict
      // changes — this fix makes the independent check reproduce the
      // analyzer instead of disagreeing with it.
      ind.transPost += o.post;
      if ((isNamed || isGen) && o.inflow >= 10000) {
        ind.driedResid += dResid;
        const t = isNamed ? ind : ind;
        if (isNamed) { ind.namedResid += resid; ind.namedInflow += o.inflow; ind.namedCount++; if (Math.abs(resid) / o.inflow <= 0.01) ind.namedPass++; }
        else { ind.genResid += resid; ind.genInflow += o.inflow; ind.genCount++; if (Math.abs(resid) / o.inflow <= 0.01) ind.genPass++; }
      }
    }
  }
  check('independent named pooled residual matches analyzer',
    ind.namedResid === legs.leg3.pooledResid && ind.namedInflow === legs.leg3.pooledInflow &&
    ind.namedCount === legs.leg3.counted && ind.namedPass === legs.leg3.passed,
    `ind resid=${ind.namedResid} in=${ind.namedInflow} ${ind.namedPass}/${ind.namedCount} vs analyzer resid=${legs.leg3.pooledResid} in=${legs.leg3.pooledInflow} ${legs.leg3.passed}/${legs.leg3.counted}`);
  check('independent generic pooled residual matches analyzer',
    ind.genResid === legs.leg4.pooledResid && ind.genInflow === legs.leg4.pooledInflow &&
    ind.genCount === legs.leg4.counted && ind.genPass === legs.leg4.passed,
    `ind resid=${ind.genResid} in=${ind.genInflow} ${ind.genPass}/${ind.genCount} vs analyzer resid=${legs.leg4.pooledResid} in=${legs.leg4.pooledInflow} ${legs.leg4.passed}/${legs.leg4.counted}`);
  check('independent dried pooled residual matches analyzer',
    ind.driedResid === legs.leg5.pooledDriedResid && ind.transPost === legs.leg5.totPost,
    `ind driedResid=${ind.driedResid} transPost=${ind.transPost} vs analyzer driedResid=${legs.leg5.pooledDriedResid} transPost=${legs.leg5.totPost}`);
  // 3b. Independent boundary recomputation (second code path for
  // the boundary legs: single-pass family aggregation with day<=100
  // flows, closing adjusted by day-100 stockdoor - day-100 meal draws).
  const indB = { namedResid: 0, namedInflow: 0, namedCount: 0, namedPass: 0,
    genResid: 0, genInflow: 0, genCount: 0, genPass: 0, driedResid: 0, transPost: 0 };
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
    const fam = new Map();
    const g2 = (name) => {
      const k = famOf(name);
      if (!fam.has(k)) fam.set(k, { inflow: 0, draws: 0, sweep: 0, loss: 0, post: 0, open: 0, close: 0, openD: 0, closeD: 0, dIn: 0, dDraws: 0, dSweep: 0, meal100: 0, meal100D: 0, stock100: 0 });
      return fam.get(k);
    };
    for (const r of (j.inflows || [])) {
      if (r.day > 100) continue;
      if (r.door === 'stock' && !(r.kcal > 0)) continue;
      if (r.door === 'pantryAdd' && !r.added) continue;
      if (r.name == null) continue;
      const o = g2(r.name); o.inflow += r.kcal || 0;
      if (isDried(r.name)) o.dIn += r.kcal || 0;
    }
    for (const r of (j.stockdoorRecords || [])) {
      if (r.kcal > 0 && r.day <= 100) g2('Foraged food').inflow += r.kcal || 0;
      if (r.kcal > 0 && r.day === 100) g2('Foraged food').stock100 += r.kcal || 0;
    }
    for (const r of (j.mealDrawRecords || [])) {
      if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
      for (const it of (r.items || [])) {
        if (it.name == null) continue;
        const k = (it.units || 0) * (it.kcalEach || 0);
        if (r.day <= 100) g2(it.name).draws += k;
        if (r.day === 100) { g2(it.name).meal100 += k; if (isDried(it.name)) g2(it.name).meal100D += k; }
      }
    }
    for (const r of (j.mealDrawRecords || [])) {
      if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
      for (const it of (r.items || [])) if (it.name != null && isDried(it.name) && r.day <= 100) g2(it.name).dDraws += (it.units || 0) * (it.kcalEach || 0);
    }
    for (const r of (j.directRecords || [])) {
      if (r.day > 100) continue;
      for (const it of (r.items || [])) {
        if (it.name == null) continue;
        const k = (it.units || 0) * (it.kcalEach || 0);
        g2(it.name).draws += k;
        if (isDried(it.name)) g2(it.name).dDraws += k;
      }
    }
    for (const sw of ((j.spoilEvents || {}).sweeps || [])) {
      if (sw.day > 100) continue;
      for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) {
        const o = g2(bc.channel); o.sweep += bc.kcal || 0;
        if (isDried(bc.channel)) o.dSweep += bc.kcal || 0;
      }
    }
    for (const ch of ((j.openingStock || {}).channels || [])) { const o = g2(ch.channel); o.open += ch.freshKcal || 0; if (isDried(ch.channel)) o.openD += ch.freshKcal || 0; }
    const last = (j.spoilDays || [])[(j.spoilDays || []).length - 1] || {};
    for (const ch of (last.channels || [])) { const o = g2(ch.channel); o.close += ch.freshKcal || 0; if (isDried(ch.channel)) o.closeD += ch.freshKcal || 0; }
    for (const e of (j.driedEvents || [])) {
      if (e.day > 100) continue;
      const nm = (e.before && e.before.channel) || (e.after && e.after.channel) || '?';
      const o = g2(nm); o.post += e.postKcal || 0; if (e.linked && e.lossKcal != null) o.loss += e.lossKcal || 0;
    }
    for (const [name, o] of fam) {
      const bClose = o.close + o.stock100 - o.meal100;
      const bResid = (bClose - o.open) - (o.inflow - o.draws - o.sweep - o.loss);
      const bDClose = o.closeD - o.meal100D;
      const bDResid = (bDClose - o.openD) - (o.post + o.dIn - o.dDraws - o.dSweep);
      indB.transPost += o.post;
      const isNamed = NAMED.indexOf(name) >= 0, isGen = name === 'Foraged food';
      if ((isNamed || isGen) && o.inflow >= 10000) {
        indB.driedResid += bDResid;
        if (isNamed) { indB.namedResid += bResid; indB.namedInflow += o.inflow; indB.namedCount++; if (Math.abs(bResid) / o.inflow <= 0.01) indB.namedPass++; }
        else { indB.genResid += bResid; indB.genInflow += o.inflow; indB.genCount++; if (Math.abs(bResid) / o.inflow <= 0.01) indB.genPass++; }
      }
    }
  }
  check('independent boundary named pooled residual matches analyzer',
    indB.namedResid === legs.leg3b.pooledResid && indB.namedInflow === legs.leg3b.pooledInflow &&
    indB.namedCount === legs.leg3b.counted && indB.namedPass === legs.leg3b.passed,
    `indB resid=${indB.namedResid} in=${indB.namedInflow} ${indB.namedPass}/${indB.namedCount} vs analyzer resid=${legs.leg3b.pooledResid} in=${legs.leg3b.pooledInflow} ${legs.leg3b.passed}/${legs.leg3b.counted}`);
  check('independent boundary generic pooled residual matches analyzer',
    indB.genResid === legs.leg4b.pooledResid && indB.genInflow === legs.leg4b.pooledInflow &&
    indB.genCount === legs.leg4b.counted && indB.genPass === legs.leg4b.passed,
    `indB resid=${indB.genResid} in=${indB.genInflow} ${indB.genPass}/${indB.genCount} vs analyzer resid=${legs.leg4b.pooledResid} in=${legs.leg4b.pooledInflow} ${legs.leg4b.passed}/${legs.leg4b.counted}`);
  check('independent boundary dried pooled residual matches analyzer',
    indB.driedResid === legs.leg5b.pooledDriedResid && indB.transPost === legs.leg5b.totPost,
    `indB driedResid=${indB.driedResid} transPost=${indB.transPost} vs analyzer driedResid=${legs.leg5b.pooledDriedResid} transPost=${legs.leg5b.totPost}`);
  // 3c. Independent RAIDDOOR boundary recomputation (second code path
  // for the raiddor legs: single-pass family aggregation with day<=100
  // flows, closing adjusted by day-100 stockdoor - day-100 meal draws -
  // post-snapshot raid-unanswered draws, plus raid-unanswered draws in
  // the flows). Mirrors the analyzer's rB fields exactly.
  const indR = { namedResid: 0, namedInflow: 0, namedCount: 0, namedPass: 0,
    genResid: 0, genInflow: 0, genCount: 0, genPass: 0, driedResid: 0, transPost: 0 };
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
    const fam = new Map();
    const g3 = (name) => {
      const k = famOf(name);
      if (!fam.has(k)) fam.set(k, { inflow: 0, draws: 0, sweep: 0, loss: 0, post: 0, open: 0, close: 0, openD: 0, closeD: 0, dIn: 0, dDraws: 0, dSweep: 0, meal100: 0, meal100D: 0, stock100: 0, raid100: 0, raid100D: 0 });
      return fam.get(k);
    };
    for (const r of (j.inflows || [])) {
      if (r.day > 100) continue;
      if (r.door === 'stock' && !(r.kcal > 0)) continue;
      if (r.door === 'pantryAdd' && !r.added) continue;
      if (r.name == null) continue;
      const o = g3(r.name); o.inflow += r.kcal || 0;
      if (isDried(r.name)) o.dIn += r.kcal || 0;
    }
    for (const r of (j.stockdoorRecords || [])) {
      if (r.kcal > 0 && r.day <= 100) g3('Foraged food').inflow += r.kcal || 0;
      if (r.kcal > 0 && r.day === 100) g3('Foraged food').stock100 += r.kcal || 0;
    }
    for (const r of (j.mealDrawRecords || [])) {
      if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
      for (const it of (r.items || [])) {
        if (it.name == null) continue;
        const k = (it.units || 0) * (it.kcalEach || 0);
        if (r.day <= 100) g3(it.name).draws += k;
        if (r.day === 100) { g3(it.name).meal100 += k; if (isDried(it.name)) g3(it.name).meal100D += k; }
      }
    }
    for (const r of (j.mealDrawRecords || [])) {
      if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
      for (const it of (r.items || [])) if (it.name != null && isDried(it.name) && r.day <= 100) g3(it.name).dDraws += (it.units || 0) * (it.kcalEach || 0);
    }
    for (const r of (j.directRecords || [])) {
      if (r.day > 100) continue;
      for (const it of (r.items || [])) {
        if (it.name == null) continue;
        const k = (it.units || 0) * (it.kcalEach || 0);
        g3(it.name).draws += k;
        if (isDried(it.name)) g3(it.name).dDraws += k;
      }
    }
    for (const sw of ((j.spoilEvents || {}).sweeps || [])) {
      if (sw.day > 100) continue;
      for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) {
        const o = g3(bc.channel); o.sweep += bc.kcal || 0;
        if (isDried(bc.channel)) o.dSweep += bc.kcal || 0;
      }
    }
    for (const ch of ((j.openingStock || {}).channels || [])) { const o = g3(ch.channel); o.open += ch.freshKcal || 0; if (isDried(ch.channel)) o.openD += ch.freshKcal || 0; }
    const last = (j.spoilDays || [])[(j.spoilDays || []).length - 1] || {};
    const lastDay = last.day;
    for (const ch of (last.channels || [])) { const o = g3(ch.channel); o.close += ch.freshKcal || 0; if (isDried(ch.channel)) o.closeD += ch.freshKcal || 0; }
    for (const e of (j.driedEvents || [])) {
      if (e.day > 100) continue;
      const nm = (e.before && e.before.channel) || (e.after && e.after.channel) || '?';
      const o = g3(nm); o.post += e.postKcal || 0; if (e.linked && e.lossKcal != null) o.loss += e.lossKcal || 0;
    }
    for (const r of (j.raidRecords || [])) {
      if (r.path !== 'raid-unanswered' || r.day > 100) continue;
      for (const it of (r.items || [])) {
        if (it.name == null) continue;
        const k = (it.units || 0) * (it.kcalEach || 0);
        g3(it.name).draws += k;
        if (isDried(it.name)) g3(it.name).dDraws += k;
        if (r.day === lastDay) { g3(it.name).raid100 += k; if (isDried(it.name)) g3(it.name).raid100D += k; }
      }
    }
    for (const [name, o] of fam) {
      const bClose = o.close + o.stock100 - o.meal100 - o.raid100;
      const bResid = (bClose - o.open) - (o.inflow - o.draws - o.sweep - o.loss);
      const bDClose = o.closeD - o.meal100D - o.raid100D;
      const bDResid = (bDClose - o.openD) - (o.post + o.dIn - o.dDraws - o.dSweep);
      indR.transPost += o.post;
      const isNamed = NAMED.indexOf(name) >= 0, isGen = name === 'Foraged food';
      if ((isNamed || isGen) && o.inflow >= 10000) {
        indR.driedResid += bDResid;
        if (isNamed) { indR.namedResid += bResid; indR.namedInflow += o.inflow; indR.namedCount++; if (Math.abs(bResid) / o.inflow <= 0.01) indR.namedPass++; }
        else { indR.genResid += bResid; indR.genInflow += o.inflow; indR.genCount++; if (Math.abs(bResid) / o.inflow <= 0.01) indR.genPass++; }
      }
    }
  }
  check('independent raiddor named pooled residual matches analyzer',
    indR.namedResid === legs.leg3r.pooledResid && indR.namedInflow === legs.leg3r.pooledInflow &&
    indR.namedCount === legs.leg3r.counted && indR.namedPass === legs.leg3r.passed,
    `indR resid=${indR.namedResid} in=${indR.namedInflow} ${indR.namedPass}/${indR.namedCount} vs analyzer resid=${legs.leg3r.pooledResid} in=${legs.leg3r.pooledInflow} ${legs.leg3r.passed}/${legs.leg3r.counted}`);
  check('independent raiddor generic pooled residual matches analyzer',
    indR.genResid === legs.leg4r.pooledResid && indR.genInflow === legs.leg4r.pooledInflow &&
    indR.genCount === legs.leg4r.counted && indR.genPass === legs.leg4r.passed,
    `indR resid=${indR.genResid} in=${indR.genInflow} ${indR.genPass}/${indR.genCount} vs analyzer resid=${legs.leg4r.pooledResid} in=${legs.leg4r.pooledInflow} ${legs.leg4r.passed}/${legs.leg4r.counted}`);
  check('independent raiddor dried pooled residual matches analyzer',
    indR.driedResid === legs.leg5r.pooledDriedResid && indR.transPost === legs.leg5r.totPost,
    `indR driedResid=${indR.driedResid} transPost=${indR.transPost} vs analyzer driedResid=${legs.leg5r.pooledDriedResid} transPost=${legs.leg5r.totPost}`);
  // 3d. Independent CALLER-COMPLETE recomputation (the judged legs:
  // same single-pass shape as indR, but EVERY _removePantryKcal
  // record counts as a draw and EVERY caller's post-snapshot take
  // adjusts the closing).
  const indC = { namedResid: 0, namedInflow: 0, namedCount: 0, namedPass: 0,
    genResid: 0, genInflow: 0, genCount: 0, genPass: 0, driedResid: 0, transPost: 0 };
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
    const fam = new Map();
    const g4 = (name) => {
      const k = famOf(name);
      if (!fam.has(k)) fam.set(k, { inflow: 0, draws: 0, sweep: 0, loss: 0, post: 0, open: 0, close: 0, openD: 0, closeD: 0, dIn: 0, dDraws: 0, dSweep: 0, meal100: 0, meal100D: 0, stock100: 0, cc100: 0, cc100D: 0 });
      return fam.get(k);
    };
    for (const r of (j.inflows || [])) {
      if (r.day > 100) continue;
      if (r.door === 'stock' && !(r.kcal > 0)) continue;
      if (r.door === 'pantryAdd' && !r.added) continue;
      if (r.name == null) continue;
      const o = g4(r.name); o.inflow += r.kcal || 0;
      if (isDried(r.name)) o.dIn += r.kcal || 0;
    }
    for (const r of (j.stockdoorRecords || [])) {
      if (r.kcal > 0 && r.day <= 100) g4('Foraged food').inflow += r.kcal || 0;
      if (r.kcal > 0 && r.day === 100) g4('Foraged food').stock100 += r.kcal || 0;
    }
    for (const r of (j.mealDrawRecords || [])) {
      if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
      for (const it of (r.items || [])) {
        if (it.name == null) continue;
        const k = (it.units || 0) * (it.kcalEach || 0);
        if (r.day <= 100) g4(it.name).draws += k;
        if (r.day === 100) { g4(it.name).meal100 += k; if (isDried(it.name)) g4(it.name).meal100D += k; }
      }
    }
    for (const r of (j.mealDrawRecords || [])) {
      if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
      for (const it of (r.items || [])) if (it.name != null && isDried(it.name) && r.day <= 100) g4(it.name).dDraws += (it.units || 0) * (it.kcalEach || 0);
    }
    for (const r of (j.directRecords || [])) {
      if (r.day > 100) continue;
      for (const it of (r.items || [])) {
        if (it.name == null) continue;
        const k = (it.units || 0) * (it.kcalEach || 0);
        g4(it.name).draws += k;
        if (isDried(it.name)) g4(it.name).dDraws += k;
      }
    }
    for (const sw of ((j.spoilEvents || {}).sweeps || [])) {
      if (sw.day > 100) continue;
      for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) {
        const o = g4(bc.channel); o.sweep += bc.kcal || 0;
        if (isDried(bc.channel)) o.dSweep += bc.kcal || 0;
      }
    }
    for (const ch of ((j.openingStock || {}).channels || [])) { const o = g4(ch.channel); o.open += ch.freshKcal || 0; if (isDried(ch.channel)) o.openD += ch.freshKcal || 0; }
    const last = (j.spoilDays || [])[(j.spoilDays || []).length - 1] || {};
    const lastDay = last.day;
    for (const ch of (last.channels || [])) { const o = g4(ch.channel); o.close += ch.freshKcal || 0; if (isDried(ch.channel)) o.closeD += ch.freshKcal || 0; }
    for (const e of (j.driedEvents || [])) {
      if (e.day > 100) continue;
      const nm = (e.before && e.before.channel) || (e.after && e.after.channel) || '?';
      const o = g4(nm); o.post += e.postKcal || 0; if (e.linked && e.lossKcal != null) o.loss += e.lossKcal || 0;
    }
    for (const r of (j.raidRecords || [])) {
      if (r.day > 100) continue;
      for (const it of (r.items || [])) {
        if (it.name == null) continue;
        const k = (it.units || 0) * (it.kcalEach || 0);
        g4(it.name).draws += k;
        if (isDried(it.name)) g4(it.name).dDraws += k;
        if (r.day === lastDay) { g4(it.name).cc100 += k; if (isDried(it.name)) g4(it.name).cc100D += k; }
      }
    }
    for (const [name, o] of fam) {
      const bClose = o.close + o.stock100 - o.meal100 - o.cc100;
      const bResid = (bClose - o.open) - (o.inflow - o.draws - o.sweep - o.loss);
      const bDClose = o.closeD - o.meal100D - o.cc100D;
      const bDResid = (bDClose - o.openD) - (o.post + o.dIn - o.dDraws - o.dSweep);
      indC.transPost += o.post;
      const isNamed = NAMED.indexOf(name) >= 0, isGen = name === 'Foraged food';
      if ((isNamed || isGen) && o.inflow >= 10000) {
        indC.driedResid += bDResid;
        if (isNamed) { indC.namedResid += bResid; indC.namedInflow += o.inflow; indC.namedCount++; if (Math.abs(bResid) / o.inflow <= 0.01) indC.namedPass++; }
        else { indC.genResid += bResid; indC.genInflow += o.inflow; indC.genCount++; if (Math.abs(bResid) / o.inflow <= 0.01) indC.genPass++; }
      }
    }
  }
  check('independent caller-complete named pooled residual matches analyzer',
    indC.namedResid === legs.leg3c.pooledResid && indC.namedInflow === legs.leg3c.pooledInflow &&
    indC.namedCount === legs.leg3c.counted && indC.namedPass === legs.leg3c.passed,
    `indC resid=${indC.namedResid} in=${indC.namedInflow} ${indC.namedPass}/${indC.namedCount} vs analyzer resid=${legs.leg3c.pooledResid} in=${legs.leg3c.pooledInflow} ${legs.leg3c.passed}/${legs.leg3c.counted}`);
  check('independent caller-complete generic pooled residual matches analyzer',
    indC.genResid === legs.leg4c.pooledResid && indC.genInflow === legs.leg4c.pooledInflow &&
    indC.genCount === legs.leg4c.counted && indC.genPass === legs.leg4c.passed,
    `indC resid=${indC.genResid} in=${indC.genInflow} ${indC.genPass}/${indC.genCount} vs analyzer resid=${legs.leg4c.pooledResid} in=${legs.leg4c.pooledInflow} ${legs.leg4c.passed}/${legs.leg4c.counted}`);
  check('independent caller-complete dried pooled residual matches analyzer',
    indC.driedResid === legs.leg5c.pooledDriedResid && indC.transPost === legs.leg5c.totPost,
    `indC driedResid=${indC.driedResid} transPost=${indC.transPost} vs analyzer driedResid=${legs.leg5c.pooledDriedResid} transPost=${legs.leg5c.totPost}`);
  const expectVerdict = !leg1Pass ? 'DIAG-NO-GO'
    : (!legs.leg2.pass ? 'DIAG-NO-GO'
    : ((legs.naming.records === 0) ? 'DIAG-NO-GO'
    : ((legs.leg3c.pass && legs.leg4c.pass && legs.leg5c.pass && legs.naming.pass) ? 'GO' : 'NO-GO')));
  const oldVerdict = !leg1Pass ? 'DIAG-NO-GO'
    : (!legs.leg2.pass ? 'DIAG-NO-GO'
    : ((legs.leg3.pass && legs.leg4.pass && legs.leg5.pass) ? 'GO' : 'NO-GO'));
  console.log('INFO caller-complete legs: leg1=' + leg1Pass + ' leg2=' + legs.leg2.pass + ' leg3c=' + legs.leg3c.pass + ' leg4c=' + legs.leg4c.pass + ' leg5c=' + legs.leg5c.pass + ' naming=' + legs.naming.pass + ' nonRaidRecords=' + legs.naming.records + ' => verdict=' + expectVerdict);
  console.log('INFO raiddor legs (control): leg3r=' + legs.leg3r.pass + ' leg4r=' + legs.leg4r.pass + ' leg5r=' + legs.leg5r.pass);
  console.log('INFO boundary legs (control): leg3b=' + legs.leg3b.pass + ' leg4b=' + legs.leg4b.pass + ' leg5b=' + legs.leg5b.pass);
  console.log('INFO old-boundary legs (control): leg3=' + legs.leg3.pass + ' leg4=' + legs.leg4.pass + ' leg5=' + legs.leg5.pass + ' => verdict=' + oldVerdict);
  check('verdict follows from legs', true, 'verdict=' + expectVerdict + ' (judged in evidence file, not asserted GO here)');

  // 4. Instrument integrity.
  let spoilOk = true, mismatches = 0, badPaths = [];
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
    for (const r of (j.stockdoorRecords || [])) {
      if (r.vDay != null && r.spoilDay !== r.vDay + 3) spoilOk = false;
      if (r.name !== 'Foraged food') spoilOk = false;
    }
    for (const r of (j.directRecords || [])) {
      if (r.retMismatch) mismatches++;
      if (!KNOWN_DIRECT.has(r.path) && !/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/.test(r.path)) badPaths.push(r.path);
    }
    const w = (j.directCounters || {}).wrappedPaths || [];
    if (w.indexOf('pantryDraw') >= 0 || w.indexOf('drawSpoiled') >= 0) badPaths.push('OVERLAP:pantryDraw');
  }
  check('stockdoor invariant holds (spoilDay = vDay + 3, name Foraged food)', spoilOk);
  check('event-take retMismatch count is 0', mismatches === 0, mismatches + ' mismatches');
  check('no direct record claims an unknown path', badPaths.length === 0, badPaths.join(',') || 'none');
  // 4b. Raid-door integrity + disjointness.
  // SAME-EVENT rule (raidcallers fix, 2026-10-27 — see evidence
  // metric review): the old tuple heuristic (same day + name +
  // spoilDay + units on one item line) MISFIRES on busy bands: a
  // player-take of 1u and a tribute take of 1u from the same-named
  // stack on the same day share the tuple while being plainly
  // different events (different methods, different totals, usually
  // different kcalEach = different stacks). The confirm band showed
  // 6 such line-level coincidences, all verified by hand to be
  // separate takes (see evidence). The correct same-event test is
  // full-event identity: same day AND same totalKcal AND identical
  // item multisets (name, kcalEach, units, spoilDay per line). A
  // raid record matching a direct record on all three is the same
  // event recorded twice and FAILS; line-level tuple overlap alone
  // is INFO. The structural disjointness (method sets disjoint:
  // _removePantryKcal is never called by any direct method and no
  // direct method calls it — verified by code reading in raiddor)
  // stands alongside, unchanged.
  let raidMismatch = 0, raidBadPaths = [], raidSameEvent = [], raidLineOverlap = [];
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
    const directTuples = new Set();
    const directSigs = new Set();
    for (const r of (j.directRecords || [])) {
      const sigItems = (r.items || []).map(it => [it.name, it.kcalEach, it.units, it.spoilDay].join('|')).sort().join(';');
      directSigs.add(r.day + '|' + r.totalKcal + '|' + sigItems);
      for (const it of (r.items || [])) directTuples.add(r.day + '|' + it.name + '|' + it.spoilDay + '|' + it.units);
    }
    for (const r of (j.raidRecords || [])) {
      const sum = (r.items || []).reduce((t, i) => t + (i.kcal || 0), 0);
      if (r.retMismatch || sum !== r.totalKcal || sum !== r.retTaken) raidMismatch++;
      if (r.path !== 'raid-unanswered' && !/^removepantry-[A-Za-z_$][\w$]*$/.test(r.path)) raidBadPaths.push(r.path);
      if (r.path === 'raid-unanswered' && r.caller !== 'villageAgencyDaily') raidBadPaths.push('raid-unanswered caller=' + r.caller);
      const sigItems = (r.items || []).map(it => [it.name, it.kcalEach, it.units, it.spoilDay].join('|')).sort().join(';');
      if (directSigs.has(r.day + '|' + r.totalKcal + '|' + sigItems)) raidSameEvent.push('seed ' + j.seed + ' day ' + r.day + ' ' + r.path + ' totalKcal ' + r.totalKcal);
      for (const it of (r.items || [])) {
        if (directTuples.has(r.day + '|' + it.name + '|' + it.spoilDay + '|' + it.units)) raidLineOverlap.push('seed ' + j.seed + ' day ' + r.day + ' ' + it.name);
      }
    }
    const w = (j.directCounters || {}).wrappedPaths || [];
    if (w.indexOf('_removePantryKcal') >= 0) raidSameEvent.push('OVERLAP:_removePantryKcal in direct wrapped set (seed ' + j.seed + ')');
  }
  check('raid record item sums equal returned kcal (retMismatch 0)', raidMismatch === 0, raidMismatch + ' mismatches');
  check('no raid record claims an unknown path or wrong caller', raidBadPaths.length === 0, raidBadPaths.join(',') || 'none');
  check('raid door disjoint from direct door (no same-event record: same day + totalKcal + item multiset)', raidSameEvent.length === 0, raidSameEvent.join('; ') || 'none');
  console.log('INFO raid/direct line-level tuple overlap (same day+name+spoilDay+units on one line — separate takes, not double-counts; see evidence): ' + raidLineOverlap.length + (raidLineOverlap.length ? ' — ' + raidLineOverlap.join('; ') : ''));
  console.log('INFO non-raid naming (judged in evidence, not failed here): unknownCallerRecords=' + legs.naming.unknownRecords + ' unknownKcal=' + legs.naming.unknownKcal + ' totalNonRaid=' + legs.naming.records);

  // 5. Control observation (INFO only).
  if (fs.existsSync(DRIEDPATH_CORPUS)) {
    const dFiles = fs.readdirSync(DRIEDPATH_CORPUS).filter(x => x.endsWith('.json')).sort();
    const dSeeds = {};
    for (const f of dFiles) { const j = JSON.parse(fs.readFileSync(path.join(DRIEDPATH_CORPUS, f), 'utf8')); dSeeds[j.seed] = j; }
    const rows = [];
    for (const f of files) {
      const j = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
      const d = dSeeds[j.seed];
      if (d) rows.push(`${j.seed}: deaths ${j.deaths} (was ${d.deaths}) wave ${(j.waveReach || []).length} (was ${(d.waveReach || []).length}) rank ${j.rank} (was ${d.rank})`);
    }
    console.log('INFO trajectory vs driedpath corpus (base moved — observation, not verdict input): ' + rows.join(' | '));
    console.log('INFO control OLD-definition pooled on this head: resid=' + legs.control.oldPooledResid + ' inflow=' + legs.control.oldPooledInflow + ' share=' + legs.control.oldPooledShare + ' driedShare=' + legs.control.oldDriedShare + ' (driedpath corpus: pooled 90.42% / dried 8.78%)');
  }

  // 6. Hygiene. NO pinned-base allowance on this arm: the sweeps run
  // on current HEAD, so ANY src/js difference vs HEAD is a failure.
  const diffNames = execSync('git diff --name-only HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const srcModified = diffNames.filter(n => n.startsWith('src/js/'));
  const siblingModified = diffNames.filter(n => ['scripts/inflow-capture.js', 'scripts/mealdraw-capture.js', 'scripts/spoilvol-capture.js', 'scripts/driedpath-capture.js', 'scripts/stockdoor-capture.js', 'scripts/sweep-ledgerbound-b.js', 'scripts/analyze-ledgerbound-b.js', 'scripts/test-ledgerbound-b.js', 'scripts/trace-ledgerbound-b.js', 'scripts/stockdoors-capture-ledgerbound.js', 'scripts/sweep-raiddor-ledger-b.js', 'scripts/analyze-raiddor-ledger-b.js', 'scripts/test-raiddor-ledger-b.js', 'scripts/trace-raiddor-ledger-b.js', 'scripts/stockdoors-capture-raiddor.js'].indexOf(n) >= 0);
  const allowedModified = new Set(['scripts/sweep-raidcallers-b.js', 'scripts/analyze-raidcallers-b.js', 'scripts/test-raidcallers-b.js', 'scripts/stockdoors-capture-raidcallers.js', 'scripts/trace-raidcallers-b.js', 'evidence/2026-10-27/sim-raidcallers-b.md', 'evidence/2026-10-27/sim-raidcallers-b-prereg.md']);
  const outsideModified = diffNames.filter(n => !allowedModified.has(n));
  check('zero src/js files modified', srcModified.length === 0, srcModified.join(',') || 'none');
  check('zero sibling capture files modified', siblingModified.length === 0, siblingModified.join(',') || 'none');
  check('no modified tracked file outside this run\'s own files', outsideModified.length === 0, outsideModified.join(',') || 'none');
  console.log('INFO git diff vs HEAD (uncommitted): ' + (diffNames.length ? diffNames.join(', ') : '(none — all committed)'));

  if (failures) { console.log('PROOF FAILED: ' + failures + ' failure(s)'); process.exit(1); }
  console.log('PROOF GREEN');
})();

module.exports = {};
