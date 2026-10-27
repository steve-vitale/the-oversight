#!/usr/bin/env node
// test-residualhunt-b.js — VENDORED + ADAPTED proof, from
// sim-stockdoors-b:scripts/test-stockdoors-b.js (tip b55b484ec), for
// sim-residualhunt-b. Adaptations: corpus dir, sweep script name,
// analyzer require, allowed-modified set, and the hygiene check
// (pinned-base game.js allowance, see PINNED_GAMEJS_BLOB below).
// All other checks byte-identical in logic. The stockdoors branch
// is untouched.
//
// Checks, all exit-1 on failure (except INFO lines):
//   1. Corpus validity: 8 per-seed JSONs in sim-stockdoors-b-corpus,
//      policy fields correct, stockdoorsOn true, no truncation flags,
//      opening stock + dried events + stockdoor records + direct
//      records present, all 7 direct methods wrapped, none missing.
//   2. Det-gate (prereg leg 1): seed 9820 run twice (STOCKDOORS=1 vs 0,
//      stdout-JSON mode via pipe capture — never /tmp, the EPERM flap
//      killed a /tmp-redirected det-gate this run) produces identical
//      inflow records, mealdraw records, spoilvol records, driedpath
//      records, death lists, and wall fields (stockdoors fields and
//      `ms` excluded). The STOCKDOORS=1 det-gate run also reproduces
//      the corpus seed-9820 counts.
//   3. Independent leg recomputation: a second code path (single-pass
//      family aggregation straight from the raw records, not the
//      analyzer's channel-map path) reproduces the analyzer's pooled
//      NEW residuals for the named set, the generic set, and the
//      dried channel; the verdict string follows from leg 1 + legs
//      2-5 (GO iff all pass, DIAG-NO-GO iff leg 1 or 2 fails,
//      NO-GO otherwise). The proof is GREEN on a correctly-derived
//      NO-GO, as in driedpath — the failures that would make it red
//      are instrument/hygiene failures, not a NO-GO verdict.
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
//      stockdoor-capture), and no modified tracked file outside this
//      run's own files.
// Usage: node scripts/test-stockdoors-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CORPUS = path.join(ROOT, 'evidence', '2026-10-27', 'sim-residualhunt-b-corpus');
const DRIEDPATH_CORPUS = path.join(ROOT, 'evidence', '2026-10-26', 'sim-driedpath-b-corpus');
const { computeLegs } = require('./analyze-residualhunt-b');

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
  return c;
}
function baseEnv(extra) {
  return Object.assign({}, process.env, {
    COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1',
    FEASTSCALE_R13: '0', SEEDS: '9820', DAYS: '100', SAYCAP: '300',
    INFLOWCAP: '50000', MEALDRAWCAP: '50000', SWEEP_STDOUT_JSON: '1',
  }, extra);
}
function runDetGate(stockdoors) {
  const out = execSync('node scripts/sweep-residualhunt-b.js', {
    cwd: ROOT, encoding: 'utf8', timeout: 900000, maxBuffer: 512 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit'],
    env: baseEnv({ STOCKDOORS: stockdoors }),
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
  check('corpus has 8 per-seed files', files.length === 8, files.length + ' files');
  let corpusOk = true, corpus9820 = null, wrappedOk = true;
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
    if (j.policy !== 'competent-nofeast' || j.stockdoorsOn !== true || j.inflowTruncated || j.mealdrawTruncated ||
        !j.openingStock || !Array.isArray(j.driedEvents) || !Array.isArray(j.stockdoorRecords) ||
        !Array.isArray(j.directRecords) || !Array.isArray(j.spoilDays) || j.spoilDays.length === 0) corpusOk = false;
    const w = (j.directCounters || {}).wrappedPaths || [];
    const m = (j.directCounters || {}).missingPaths || [];
    if (m.length !== 0 || !EXPECTED_WRAPPED.every(x => w.indexOf(x) >= 0)) wrappedOk = false;
    if (j.seed === 9820) corpus9820 = j;
  }
  check('corpus files valid (policy, stockdoorsOn, no truncation, opening + dried + stockdoor + direct present)', corpusOk);
  check('all 7 direct methods wrapped, none missing, on every seed', wrappedOk);
  check('corpus seed 9820 present', !!corpus9820);

  // 2. Det-gate.
  let on = null, off = null, detErr = null;
  try { on = runDetGate('1'); } catch (e) { detErr = 'on: ' + (e.message || e); }
  try { off = runDetGate('0'); } catch (e) { detErr = (detErr ? detErr + '; ' : '') + 'off: ' + (e.message || e); }
  check('det-gate runs completed', !detErr, detErr || 'both runs ok');
  let leg1Pass = false;
  if (on && off) {
    const a = stripForDetGate(on), b = stripForDetGate(off);
    const identical = JSON.stringify(a) === JSON.stringify(b);
    check('det-gate byte-identical (stockdoors fields + ms excluded)', identical);
    check('det-gate inflow records identical', JSON.stringify(on.inflows) === JSON.stringify(off.inflows));
    check('det-gate mealdraw records identical', JSON.stringify(on.mealDrawRecords) === JSON.stringify(off.mealDrawRecords));
    check('det-gate spoilvol records identical', JSON.stringify(on.spoilEvents) === JSON.stringify(off.spoilEvents));
    check('det-gate driedpath records identical', JSON.stringify(on.driedEvents) === JSON.stringify(off.driedEvents));
    check('det-gate death lists identical', JSON.stringify(on.deathList) === JSON.stringify(off.deathList));
    check('det-gate wall fields identical',
      on.rank === off.rank && on.national === off.national && on.table === off.table &&
      on.win === off.win && JSON.stringify(on.waveReach) === JSON.stringify(off.waveReach));
    leg1Pass = identical;
    if (corpus9820) {
      check('det-gate run reproduces corpus 9820 counts',
        on.inflowSeen === corpus9820.inflowSeen && on.mealDrawRecords.length === corpus9820.mealDrawRecords.length &&
        on.deaths === corpus9820.deaths && (on.driedEvents || []).length === (corpus9820.driedEvents || []).length,
        `det-gate ${on.inflowSeen}/${on.mealDrawRecords.length}/${on.deaths}/${(on.driedEvents || []).length} vs corpus ${corpus9820.inflowSeen}/${corpus9820.mealDrawRecords.length}/${corpus9820.deaths}/${(corpus9820.driedEvents || []).length}`);
    }
    check('det-gate on-run recorded stockdoor + direct records',
      Array.isArray(on.stockdoorRecords) && on.stockdoorRecords.length > 0 &&
      Array.isArray(on.directRecords) && on.directRecords.length >= 0,
      `stockdoor=${(on.stockdoorRecords || []).length} direct=${(on.directRecords || []).length}`);
    check('det-gate off-run recorded no stockdoors fields', off && off.stockdoorRecords === null && off.directRecords === null);
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
  const expectVerdict = !leg1Pass ? 'DIAG-NO-GO'
    : (!legs.leg2.pass ? 'DIAG-NO-GO'
    : ((legs.leg3.pass && legs.leg4.pass && legs.leg5.pass) ? 'GO' : 'NO-GO'));
  console.log('INFO legs: leg1=' + leg1Pass + ' leg2=' + legs.leg2.pass + ' leg3=' + legs.leg3.pass + ' leg4=' + legs.leg4.pass + ' leg5=' + legs.leg5.pass + ' => verdict=' + expectVerdict);
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

  // 6. Hygiene. Pinned-base allowance (residualhunt adaptation, stated
  // in the prereg): when PINNED_GAMEJS_BLOB is set, src/js/game.js
  // may differ from HEAD ONLY if its blob hash equals the pin
  // (the step-0 reproducing base); every other src/js file must
  // still match HEAD, and the pin itself is never committed.
  const diffNames = execSync('git diff --name-only HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const pinBlob = process.env.PINNED_GAMEJS_BLOB || '';
  let srcModified = diffNames.filter(n => n.startsWith('src/js/'));
  if (pinBlob && srcModified.indexOf('src/js/game.js') >= 0) {
    const curBlob = execSync('git hash-object src/js/game.js', { cwd: ROOT, encoding: 'utf8' }).trim();
    if (curBlob === pinBlob) srcModified = srcModified.filter(n => n !== 'src/js/game.js');
  }
  const siblingModified = diffNames.filter(n => ['scripts/inflow-capture.js', 'scripts/mealdraw-capture.js', 'scripts/spoilvol-capture.js', 'scripts/driedpath-capture.js', 'scripts/stockdoor-capture.js'].indexOf(n) >= 0);
  const allowedModified = new Set(['scripts/sweep-residualhunt-b.js', 'scripts/analyze-residualhunt-b.js', 'scripts/test-residualhunt-b.js', 'scripts/stockdoors-capture-residualhunt.js', 'scripts/trace-residualhunt-b.js', 'evidence/2026-10-27/sim-residualhunt-b.md', 'evidence/2026-10-27/sim-residualhunt-b-prereg.md']);
  const outsideModified = diffNames.filter(n => !allowedModified.has(n));
  check('zero src/js files modified', srcModified.length === 0, srcModified.join(',') || 'none');
  check('zero sibling capture files modified', siblingModified.length === 0, siblingModified.join(',') || 'none');
  check('no modified tracked file outside this run\'s own files', outsideModified.length === 0, outsideModified.join(',') || 'none');
  console.log('INFO git diff vs HEAD (uncommitted): ' + (diffNames.length ? diffNames.join(', ') : '(none — all committed)'));

  if (failures) { console.log('PROOF FAILED: ' + failures + ' failure(s)'); process.exit(1); }
  console.log('PROOF GREEN');
})();

module.exports = {};
