#!/usr/bin/env node
// analyze-strandfix-morning-b.js — strand-fix morning-recovery census
// for sim-strandfix-morning-b corpora (scripts/strandfix-trace-b.js,
// scripts/kcalshort-trace-b.js control legs, scripts/woodday-trace-b.js
// fresh baselines). Pure reads; no game code.
// Usage: node scripts/analyze-strandfix-morning-b.js --out <census.json>
//   --compare <compare.md> base-guard=<dir> base-on=<dir>
//   control-guard=<dir> control-on=<dir> off-guard=<dir> off-on=<dir>
//   variant-guard=<dir> variant-on=<dir> [pilot-on-variant=<dir>]
//   [determinism=<dir>]
// Raw-gate classification is kcalshort's (scripts/analyze-kcalshort-b.js,
// imported with attribution, never the bridge skip alone); mode names
// are mapped to this arm's prereg classes: all-three -> ticks-plus-both,
// wood+ticks -> ticks-plus-wood, kcal+ticks -> ticks-plus-kcal.
'use strict';
const fs = require('fs');
const path = require('path');
const { classify: kcalClassify, median } = require('./analyze-kcalshort-b');

const MODE_MAP = {
  'all-three': 'ticks-plus-both',
  'wood+ticks': 'ticks-plus-wood',
  'kcal+ticks': 'ticks-plus-kcal',
};

function classifyRaw(e) {
  const c = kcalClassify(e);
  if (c.unclassified) return c;
  return Object.assign({}, c, { mode: MODE_MAP[c.mode] || c.mode });
}

// Tool-gate derivation (pilot finding, prereg addendum): a cutTree
// verb that changes no wood is a TOOL refusal when the day's own
// say lines carry the engine's axe hint ("can't fell" / "You need
// an axe"). Derived purely from already-recorded day lines, never
// from a new probe; the policy itself is unchanged.
function toolGateFromLines(lines) {
  if (!lines) return false;
  return lines.some((l) => /can't fell|You need an axe/i.test(l));
}

function loadDir(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  return files.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

function bearerDeaths(inst) {
  return (inst.deaths || []).filter((x) => x && x.player === true)
    .map((x) => ({ day: (x.day === undefined ? null : x.day), cause: x.cause || x.kind || null, who: x.who || null }));
}

function censusDir(dir) {
  const insts = loadDir(dir);
  const perSeed = {};
  const strands = [];
  const table = [];
  const unclassified = [];
  let seeds = 0, evenings = 0, creek = 0, still = 0, rescued = 0, errs = 0;
  for (const inst of insts) {
    const s = inst.seed;
    seeds++;
    const evs = inst.evenings || [];
    evenings += evs.length;
    errs += ((inst.woodcarryStore && inst.woodcarryStore.errs) || 0)
      + ((inst.warmthStore && inst.warmthStore.errs) || 0)
      + ((inst.strandfixStore && inst.strandfixStore.errs) || 0);
    perSeed[s] = { evenings: evs.length, creek: 0, still: 0, rescued: 0, strands: [],
      daysAlive: inst.daysAlive, endReason: inst.endReason, maxWaveUnlocked: inst.maxWaveUnlocked,
      deaths: (inst.deaths || []).length, bearerDeaths: bearerDeaths(inst),
      sfAttempts: (inst.strandfixStore && inst.strandfixStore.attempts || []).length,
      sfSkips: (inst.strandfixStore && inst.strandfixStore.skips || []).length,
      sfErrs: (inst.strandfixStore && inst.strandfixStore.errs) || 0 };
    const mornByDay = {};
    for (const m of (inst.mornings || [])) mornByDay[m.loopDay] = m;
    for (const e of evs) {
      const wc = e.woodcarry || {};
      if (wc.bucket !== 'creek') continue;
      creek++; perSeed[s].creek++;
      if (wc.rescued) { rescued++; perSeed[s].rescued++; }
      else { still++; perSeed[s].still++; }
    }
    let run = [];
    const flush = () => {
      if (!run.length) return;
      const rec = { seed: s, nights: run.map((e) => e.loopDay), length: run.length,
        eveningWoods: run.map((e) => {
          const cls = (e.woodcarry || {}).classification || {};
          return (cls.woodPlayer === undefined ? null : cls.woodPlayer);
        }) };
      strands.push(rec);
      perSeed[s].strands.push(rec);
      for (const e of run) {
        const c = classifyRaw(e);
        const m = mornByDay[e.loopDay] || null;
        table.push({ seed: s, loopDay: e.loopDay,
          morningKcal: m ? m.kcal : null, morningWood: m ? m.morningWood : null,
          morningTile: m ? (m.mapPx + ',' + m.mapPy) : null,
          morningCell: m ? (m.mx + ',' + m.my) : null,
          adjSources: m ? m.adjSources : null,
          postEveningKcal: (e.kcal === undefined ? null : e.kcal),
          warmthActed: !!(e.warmth && e.warmth.acted),
          warmthFireLit: (e.warmth && e.warmth.fireLit) || null,
          warmthLogSpent: (e.warmth && e.warmth.logSpent) || null,
          eveningOutcome: e.eveningOutcome || null,
          rescued: !!((e.woodcarry || {}).rescued),
          bridgeBuilt: ((e.woodcarry || {}).bridge || {}).built || null,
          ...c });
        if (c.unclassified) unclassified.push({ seed: s, loopDay: e.loopDay, reason: c.reason });
      }
      run = [];
    };
    const sorted = [...evs].sort((a, b) => a.loopDay - b.loopDay);
    for (const e of sorted) {
      const wc = e.woodcarry || {};
      if (wc.bucket === 'creek' && !wc.rescued) {
        if (run.length && e.loopDay !== run[run.length - 1].loopDay + 1) flush();
        run.push(e);
      } else flush();
    }
    flush();
  }
  const byClass = {};
  for (const r of table) { if (!r.unclassified) byClass[r.mode] = (byClass[r.mode] || 0) + 1; }
  return { dir, seeds, evenings, creek, still, rescued, errs, perSeed, strands, table, unclassified, byClass,
    strandEvenings: table.length };
}

function detGateCompare(base, off) {
  const mismatches = [];
  const seeds = Object.keys(base.perSeed).sort();
  for (const s of seeds) {
    const b = base.perSeed[s], o = off.perSeed[s];
    if (!o) { mismatches.push({ seed: s, what: 'missing-off-seed' }); continue; }
    if (b.creek !== o.creek || b.still !== o.still || b.rescued !== o.rescued) {
      mismatches.push({ seed: s, what: 'census', base: [b.creek, b.still, b.rescued], off: [o.creek, o.still, o.rescued] });
    }
    const bn = (b.strands || []).map((x) => x.nights.join(',')).join(';');
    const on = (o.strands || []).map((x) => x.nights.join(',')).join(';');
    if (bn !== on) mismatches.push({ seed: s, what: 'strand-nights', base: bn, off: on });
    const bw = JSON.stringify((b.strands || []).map((x) => x.eveningWoods));
    const ow = JSON.stringify((o.strands || []).map((x) => x.eveningWoods));
    if (bw !== ow) mismatches.push({ seed: s, what: 'evening-woods', base: bw, off: ow });
  }
  return { match: mismatches.length === 0, mismatches };
}

// Attempt table for a variant leg: every strandfix attempt/skip
// joined to its loop-day evening row + morning row.
function attemptTable(dir) {
  const insts = loadDir(dir);
  const rows = [];
  for (const inst of insts) {
    const evByDay = {};
    for (const e of (inst.evenings || [])) evByDay[e.loopDay] = e;
    const mornByDay = {};
    for (const m of (inst.mornings || [])) mornByDay[m.loopDay] = m;
    const sf = inst.strandfixStore || {};
    for (const a of (sf.attempts || [])) {
      const e = evByDay[a.loopDay] || null;
      const m = mornByDay[a.loopDay] || null;
      const wc = (e && e.woodcarry) || {};
      const cls = e ? classifyRaw(e) : null;
      const prevStill = (() => {
        const pe = evByDay[a.loopDay - 1];
        return !!(pe && pe.woodcarry && pe.woodcarry.bucket === 'creek' && !pe.woodcarry.rescued);
      })();
      const eveningStill = !!(e && wc.bucket === 'creek' && !wc.rescued);
      rows.push({ seed: inst.seed, loopDay: a.loopDay, kind: 'attempt',
        // An attempt whose own evening is NOT still is the boundary
        // morning (the previous evening was still; the policy fired
        // on the morning after the last still evening).
        isBoundaryMorning: prevStill && !eveningStill,
        morningKcal: a.morningKcal, morningWood: a.morningWood, morningTicksLeft: a.morningTicksLeft,
        morningTile: m ? (m.mapPx + ',' + m.mapPy) : null, morningCell: m ? (m.mx + ',' + m.my) : null,
        adjSources: m ? m.adjSources : null,
        foodPhase: a.foodPhase, walkPhase: a.walkPhase, woodPhase: a.woodPhase,
        woodDelta: (a.woodPhase && typeof a.woodPhase.woodDelta === 'number') ? a.woodPhase.woodDelta : null,
        packReached4: (a.woodAfterMorning !== null && a.woodAfterMorning !== undefined) ? a.woodAfterMorning >= 4 : null,
        kcalAfterWood: a.kcalAfterWood, ticksLeftAfter: a.ticksLeftAfter,
        eveningStill, eveningRescued: !!(e && wc.rescued), eveningOutcome: e ? e.eveningOutcome : null,
        eveningClass: (e && wc.rescued) ? 'rescued' : (cls && !cls.unclassified ? cls.mode : (cls ? 'unclassified' : null)),
        toolGate: toolGateFromLines(e ? (e.fullDaySay || []) : null),
        eveningLogs: cls && !cls.unclassified ? cls.logs : null,
        eveningKcal: cls && !cls.unclassified ? cls.kcal : null,
        eveningTicks: cls && !cls.unclassified ? cls.ticks : null,
        bridgeBuilt: ((wc.bridge || {}).built) || null,
        fullDaySay: e ? (e.fullDaySay || null) : null });
    }
    for (const sk of (sf.skips || [])) {
      // Only strand-gate-fired skips carry recovery phase detail;
      // prev-not-stranded skips are routine mornings, counted
      // separately in the guardrail, not in the attempt table.
      if (sk.skip === 'prev-not-stranded' || sk.skip === 'haven-morning' || sk.skip === 'game-over' || sk.skip === 'combat') continue;
      const e = evByDay[sk.loopDay] || null;
      const wc = (e && e.woodcarry) || {};
      const cls = e ? classifyRaw(e) : null;
      rows.push({ seed: inst.seed, loopDay: sk.loopDay, kind: 'skip',
        skip: sk.skip, foodPhase: sk.foodPhase, walkPhase: sk.walkPhase, woodPhase: sk.woodPhase,
        morningKcal: sk.morningKcal, morningWood: sk.morningWood, morningTicksLeft: sk.morningTicksLeft,
        eveningStill: !!(e && wc.bucket === 'creek' && !wc.rescued),
        eveningRescued: !!(e && wc.rescued),
        eveningClass: (e && wc.rescued) ? 'rescued' : (cls && !cls.unclassified ? cls.mode : (cls ? 'unclassified' : null)) });
    }
  }
  return rows;
}

function pairCompare(control, variant) {
  const perSeed = {};
  const seeds = Object.keys(control.perSeed).sort();
  let controlStill = 0, variantStill = 0;
  const converted = [];
  const convertedAllThree = [];
  for (const s of seeds) {
    const c = control.perSeed[s], v = variant.perSeed[s];
    if (!v) continue;
    controlStill += c.still; variantStill += v.still;
    perSeed[s] = { controlStill: c.still, variantStill: v.still, fall: c.still - v.still,
      controlStrands: (c.strands || []).map((x) => x.nights),
      variantStrands: (v.strands || []).map((x) => x.nights),
      daysAlive: [c.daysAlive, v.daysAlive], endReason: [c.endReason, v.endReason],
      maxWave: [c.maxWaveUnlocked, v.maxWaveUnlocked],
      deaths: [c.deaths, v.deaths],
      bearerDeaths: [c.bearerDeaths, v.bearerDeaths] };
  }
  // Converted both-evenings: variant evening rescued on a loop-day
  // that is a still evening on the control leg, with a strandfix
  // attempt that morning on the variant leg.
  const cTable = {};
  for (const r of control.table) cTable[r.seed + ':' + r.loopDay] = r;
  // variant attempt mornings: recompute from variant table rows is
  // not enough (attempts live in the store); caller fills this via
  // attemptTable — see main() which attaches converted separately.
  return { perSeed, controlStill, variantStill, fall: controlStill - variantStill, converted, convertedAllThree };
}

function deathPairs(control, variant) {
  const out = [];
  for (const s of Object.keys(control.perSeed).sort()) {
    const c = control.perSeed[s], v = variant.perSeed[s];
    if (!v) continue;
    const cDay = (c.bearerDeaths && c.bearerDeaths.length) ? c.bearerDeaths[0].day : null;
    const vDay = (v.bearerDeaths && v.bearerDeaths.length) ? v.bearerDeaths[0].day : null;
    const cCause = (c.bearerDeaths && c.bearerDeaths.length) ? c.bearerDeaths[0].cause : null;
    const vCause = (v.bearerDeaths && v.bearerDeaths.length) ? v.bearerDeaths[0].cause : null;
    out.push({ seed: s, controlDay: cDay, variantDay: vDay,
      delay: (cDay !== null && vDay !== null) ? (vDay - cDay) : null,
      censored: (cDay === null || vDay === null), sameCause: cCause === vCause,
      controlCause: cCause, variantCause: vCause,
      endReason: [c.endReason, v.endReason], daysAlive: [c.daysAlive, v.daysAlive],
      maxWave: [c.maxWaveUnlocked, v.maxWaveUnlocked], deaths: [c.deaths, v.deaths] });
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  let outJson = null, compareMd = null;
  const dirs = {};
  for (const a of args) {
    if (a.startsWith('--out=')) outJson = a.slice(6);
    else if (a.startsWith('--compare=')) compareMd = a.slice(10);
    else if (a.includes('=')) { const [k, v] = a.split('='); dirs[k] = v; }
  }
  const need = ['base-guard', 'base-on', 'control-guard', 'control-on', 'off-guard', 'off-on', 'variant-guard', 'variant-on'];
  for (const k of need) if (!dirs[k]) { console.error('missing leg dir: ' + k); process.exit(2); }
  const C = {};
  for (const k of Object.keys(dirs)) {
    if (k === 'determinism') continue;
    C[k] = censusDir(dirs[k]);
    console.log(k + ': seeds ' + C[k].seeds + ' creek ' + C[k].creek + ' still ' + C[k].still + ' rescued ' + C[k].rescued + ' errs ' + C[k].errs + ' strands ' + JSON.stringify(C[k].strands.map((x) => x.seed + ':' + x.nights.join('-'))));
  }
  const detGuard = detGateCompare(C['base-guard'], C['off-guard']);
  const detOn = detGateCompare(C['base-on'], C['off-on']);
  console.log('DET-GATE guard match=' + detGuard.match + ' mismatches=' + JSON.stringify(detGuard.mismatches));
  console.log('DET-GATE on match=' + detOn.match + ' mismatches=' + JSON.stringify(detOn.mismatches));
  const offVsControlGuard = detGateCompare(C['control-guard'], C['off-guard']);
  const offVsControlOn = detGateCompare(C['control-on'], C['off-on']);
  console.log('OFF-vs-CONTROL guard match=' + offVsControlGuard.match + ' ' + JSON.stringify(offVsControlGuard.mismatches));
  console.log('OFF-vs-CONTROL on match=' + offVsControlOn.match + ' ' + JSON.stringify(offVsControlOn.mismatches));

  const attempts = { 'variant-guard': attemptTable(dirs['variant-guard']), 'variant-on': attemptTable(dirs['variant-on']) };
  for (const k of ['variant-guard', 'variant-on']) {
    const at = attempts[k].filter((r) => r.kind === 'attempt');
    console.log(k + ' attempts ' + at.length + ' skips(gate-fired) ' + (attempts[k].length - at.length)
      + ' woodDelta>0 ' + at.filter((r) => (r.woodDelta || 0) > 0).length
      + ' pack>=4 ' + at.filter((r) => r.packReached4).length);
  }
  const pairs = {};
  for (const leg of ['guard', 'on']) {
    const pc = pairCompare(C['control-' + leg], C['variant-' + leg]);
    // Converted both-evenings, computed with variant attempt mornings.
    const attByKey = {};
    for (const r of attempts['variant-' + leg]) if (r.kind === 'attempt') attByKey[r.seed + ':' + r.loopDay] = r;
    const variantInsts = loadDir(dirs['variant-' + leg]);
    const vEvByKey = {};
    for (const inst of variantInsts) for (const e of (inst.evenings || [])) vEvByKey[inst.seed + ':' + e.loopDay] = e;
    const conv = [], convAT = [];
    for (const r of C['control-' + leg].table) {
      if (r.unclassified) continue;
      const key = r.seed + ':' + r.loopDay;
      const ve = vEvByKey[key];
      const att = attByKey[key];
      if (!ve || !att) continue;
      const vwc = ve.woodcarry || {};
      if (vwc.rescued) {
        const rec = { seed: r.seed, loopDay: r.loopDay, controlClass: r.mode,
          variantEveningOutcome: ve.eveningOutcome, bridgeBuilt: (vwc.bridge || {}).built || null,
          attemptFood: att.foodPhase, attemptWood: att.woodPhase };
        if (r.mode === 'both') conv.push(rec);
        else if (r.mode === 'ticks-plus-both') convAT.push(rec);
      }
    }
    pc.converted = conv; pc.convertedAllThree = convAT;
    pc.deaths = deathPairs(C['control-' + leg], C['variant-' + leg]);
    pairs[leg] = pc;
    console.log('PAIR ' + leg + ': controlStill ' + pc.controlStill + ' variantStill ' + pc.variantStill + ' fall ' + pc.fall
      + ' convertedBoth ' + conv.length + ' convertedAllThree ' + convAT.length);
  }
  // GO judgment inputs (prereg bars): denominator = pairs where
  // either leg strands (elimination counts with fall = control
  // length); variant-strand-only denominator reported alongside.
  const pairFalls = [];
  for (const leg of ['guard', 'on']) {
    const pc = pairs[leg];
    const eitherStrands = pc.controlStill > 0 || pc.variantStill > 0;
    const variantStrands = pc.variantStill > 0;
    pairFalls.push({ leg, controlStill: pc.controlStill, variantStill: pc.variantStill, fall: pc.fall, eitherStrands, variantStrands });
  }
  const denomEither = pairFalls.filter((p) => p.eitherStrands);
  const denomVariant = pairFalls.filter((p) => p.variantStrands);
  const goAeither = denomEither.length > 0 && denomEither.filter((p) => p.fall >= 3).length > denomEither.length / 2;
  const goAvariant = denomVariant.length > 0 && denomVariant.filter((p) => p.fall >= 3).length > denomVariant.length / 2;
  const convertedTotal = pairs.guard.converted.length + pairs.on.converted.length;
  const goB = convertedTotal >= 1;
  const go = goAeither && goB;
  console.log('GO-A (either-strands denom): ' + goAeither + ' pairs ' + JSON.stringify(pairFalls));
  console.log('GO-A (variant-strand-only denom): ' + goAvariant);
  console.log('GO-B convertedBoth total=' + convertedTotal + ' -> ' + goB + ' | GO overall=' + go);
  console.log('DET-GATE overall: ' + (detGuard.match && detOn.match));
  if (dirs['pilot-on-variant']) {
    const P = censusDir(dirs['pilot-on-variant']);
    C['pilot-on-variant'] = P;
    console.log('PILOT on-variant: seeds ' + P.seeds + ' creek ' + P.creek + ' still ' + P.still + ' rescued ' + P.rescued + ' errs ' + P.errs + ' strands ' + JSON.stringify(P.strands.map((x) => x.seed + ':' + x.nights.join('-'))));
  }
  let determinism = null;
  if (dirs.determinism) {
    const files = fs.readdirSync(dirs.determinism).filter((f) => f.endsWith('.json')).sort();
    determinism = { files: files.length };
    for (const f of files) {
      const seed = f.match(/s(\d+)\.json/);
      const judged = fs.readdirSync(dirs['variant-on']).filter((g) => g.includes('s' + (seed ? seed[1] : '') + '.json'));
      let same = false;
      if (judged.length) {
        const a = fs.readFileSync(path.join(dirs.determinism, f), 'utf8');
        const b = fs.readFileSync(path.join(dirs['variant-on'], judged[0]), 'utf8');
        same = (a === b);
      }
      determinism[f] = { judgedFile: judged[0] || null, byteIdentical: same };
      console.log('DETERMINISM ' + f + ' vs ' + (judged[0] || 'none') + ' identical=' + same);
    }
  }
  const result = { censuses: C, detGate: { guard: detGuard, on: detOn },
    offVsControl: { guard: offVsControlGuard, on: offVsControlOn },
    attempts, pairs, pairFalls, goInputs: { denomEither, denomVariant, goAeither, goAvariant, convertedTotal, goB, go },
    determinism };
  if (outJson) { fs.mkdirSync(path.dirname(outJson), { recursive: true }); fs.writeFileSync(outJson, JSON.stringify(result, null, 2)); console.log('wrote ' + outJson); }
  if (compareMd) {
    const L = [];
    L.push('# sim-strandfix-morning-b — paired compare (NOT an official panel run)');
    L.push('');
    L.push('§15 DEVIATION (stated on its face): the official balance-panel driver cannot express this arm — its policies are sweep-compare registry policies, not the nighttravel+woodcarry+woodwarm strand stack, and the 23-metric contract has no strand-length / recovery-cost / conversion metrics (same standing as sim-fedexile-b and sim-tickbudget-b). This compare pairs control (kcalshort driver) and variant (strandfix driver, STRANDFIX=1) legs seed-by-seed on the pre-registered metrics, plus guardrail metrics (survival, death causes, wave reach). The panel is the instrument here in paired form; the pre-registered GO bars in the prereg are the judge. This is a DESIGN measurement — no behavior is landed or enabled by this arm.');
    L.push('');
    for (const leg of ['guard', 'on']) {
      const pc = pairs[leg];
      L.push('## ' + leg + ' leg (WOODWARM=' + (leg === 'on' ? '1' : '0') + ')');
      L.push('- control still evenings: ' + pc.controlStill + '; variant still evenings: ' + pc.variantStill + '; fall: ' + pc.fall);
      L.push('- converted both-evenings: ' + pc.converted.length + '; converted ticks-plus-both (not counted toward bar (b) under the strict reading): ' + pc.convertedAllThree.length);
      for (const s of Object.keys(pc.perSeed).sort()) {
        const p = pc.perSeed[s];
        L.push('  - seed ' + s + ': still ' + p.controlStill + ' -> ' + p.variantStill + ' (fall ' + p.fall + '); control strands ' + JSON.stringify(p.controlStrands) + '; variant strands ' + JSON.stringify(p.variantStrands) + '; daysAlive ' + p.daysAlive.join('->') + '; end ' + p.endReason.join('->') + '; waves ' + p.maxWave.join('->') + '; deaths ' + p.deaths.join('->'));
      }
      for (const d of pc.deaths) {
        L.push('  - death seed ' + d.seed + ': bearer <redacted> ' + d.controlDay + ' -> ' + d.variantDay + ' delay ' + d.delay + (d.censored ? ' CENSORED' : '') + ' sameCause ' + d.sameCause);
      }
      L.push('');
    }
    L.push('## GO inputs');
    L.push('- pair falls: ' + JSON.stringify(pairFalls));
    L.push('- GO-A (either-strands denominator): ' + goAeither + '; GO-A (variant-strand-only denominator): ' + goAvariant);
    L.push('- GO-B converted both-evenings total: ' + convertedTotal + ' -> ' + goB);
    L.push('- GO overall (either-strands reading): ' + go);
    L.push('- DET-GATE guard: ' + detGuard.match + '; on: ' + detOn.match);
    fs.mkdirSync(path.dirname(compareMd), { recursive: true });
    fs.writeFileSync(compareMd, L.join('\n') + '\n');
    console.log('wrote ' + compareMd);
  }
  return result;
}

if (require.main === module) main();
module.exports = { classifyRaw, censusDir, detGateCompare, attemptTable, pairCompare, deathPairs, MODE_MAP, toolGateFromLines };
