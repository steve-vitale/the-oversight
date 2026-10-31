#!/usr/bin/env node
// analyze-strandfix2-b.js — pure reads over strandfix2 corpora.
// Usage: node scripts/analyze-strandfix2-b.js [--control-guard DIR]
//   [--control-on DIR] [--variant-guard DIR] [--variant-on DIR]
//   [--off-guard DIR] [--off-on DIR] [--out FILE]
// Prints the census JSON to stdout (and to --out when given).
// Strand extraction matches tickfell-a: still = woodcarry bucket creek
// + rescued false; rescued = bucket creek + rescued true.
'use strict';
const fs = require('fs');
const path = require('path');

function arg(name) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

function loadDir(dir) {
  if (!dir) return null;
  const out = {};
  let files = [];
  try { files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort(); } catch (e) { return null; }
  for (const f of files) {
    try {
      const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      out[d.seed] = d;
    } catch (e) { /* skip unreadable file; counted below */ }
  }
  return { dir, files, seeds: out };
}

function creekRows(file) {
  const rows = [];
  for (const e of (file.evenings || [])) {
    const wc = e.woodcarry || {};
    if (wc.bucket !== 'creek') continue;
    const c = wc.classification || {};
    rows.push({
      loopDay: e.loopDay,
      rescued: wc.rescued === true,
      outcome: wc.outcome || null,
      wood: (c.woodPlayer === undefined ? null : c.woodPlayer),
      kcal: (c.kcal === undefined ? null : c.kcal),
      dayTicks: (c.dayTicks === undefined ? null : c.dayTicks),
      ticksLeft: (c.ticksToDayEnd === undefined ? null : c.ticksToDayEnd),
      ticksShort: (c.ticksToDayEnd !== undefined && c.ticksToDayEnd !== null && c.ticksToDayEnd < 96),
      warmth: e.warmth || null,
      sf2Morning: e.sf2Morning || null,
      sf2Evening: e.sf2Evening || null,
    });
  }
  return rows;
}

function maxRun(days) {
  let best = 0, cur = 0, prev = null;
  for (const d of days) {
    if (prev !== null && d === prev + 1) cur++;
    else cur = 1;
    prev = d;
    if (cur > best) best = cur;
  }
  return best;
}

function censusLeg(loaded) {
  if (!loaded) return null;
  const perSeed = {};
  for (const [seed, file] of Object.entries(loaded.seeds)) {
    const rows = creekRows(file);
    const still = rows.filter((r) => !r.rescued).map((r) => r.loopDay);
    const rescued = rows.filter((r) => r.rescued).map((r) => r.loopDay);
    const playerDeaths = (file.deaths || []).filter((d) => d.player === true).map((d) => d.day);
    perSeed[seed] = {
      creek: rows.length, still: still.length, rescued: rescued.length,
      stillDays: still, rescuedDays: rescued, maxRun: maxRun(still),
      ticksShort: rows.filter((r) => !r.rescued && r.ticksShort).length,
      ticksShortDays: rows.filter((r) => !r.rescued && r.ticksShort).map((r) => r.loopDay),
      rows,
      daysAlive: file.daysAlive, endReason: file.endReason,
      playerDeathDays: playerDeaths,
      errs: ((file.strandfix2Store || {}).errs ?? (file.woodcarryStore || {}).errs ?? null),
      sf2Errs: (file.strandfix2Store || {}).errs ?? null,
    };
  }
  return { files: loaded.files, perSeed };
}

function detGate(a, b) {
  if (!a || !b) return null;
  const mismatches = [];
  for (const seed of Object.keys(a.perSeed)) {
    const x = a.perSeed[seed], y = (b.perSeed || {})[seed];
    if (!y) { mismatches.push(seed + ': missing'); continue; }
    if (x.creek !== y.creek || x.still !== y.still || x.rescued !== y.rescued ||
      JSON.stringify(x.stillDays) !== JSON.stringify(y.stillDays)) {
      mismatches.push(seed + ': ' + x.creek + '/' + x.still + '/' + x.rescued + ' vs ' + y.creek + '/' + y.still + '/' + y.rescued);
    }
  }
  return { match: mismatches.length === 0, mismatches };
}

function main() {
  const cg = censusLeg(loadDir(arg('control-guard')));
  const co = censusLeg(loadDir(arg('control-on')));
  const vg = censusLeg(loadDir(arg('variant-guard')));
  const vo = censusLeg(loadDir(arg('variant-on')));
  const og = censusLeg(loadDir(arg('off-guard')));
  const oo = censusLeg(loadDir(arg('off-on')));
  const out = { controlGuard: cg, controlOn: co, variantGuard: vg, variantOn: vo, offGuard: og, offOn: oo,
    detGateGuard: detGate(cg, og), detGateOn: detGate(co, oo) };
  // Both-evening table (seed 15215 only, where the strand lives).
  if (co && cg && co.perSeed['15215'] && cg.perSeed['15215']) {
    const both = cg.perSeed['15215'].stillDays.filter((d) => co.perSeed['15215'].stillDays.includes(d));
    const fate = (leg, day) => {
      if (!leg || !leg.perSeed['15215']) return null;
      const rows = leg.perSeed['15215'].rows;
      const row = rows.find((r) => r.loopDay === day);
      if (!row) return 'no-creek-evening';
      return row.rescued ? 'rescued' : 'still';
    };
    const link = (leg, day) => {
      // Causal link: an sf2 evening act on the previous loop-day, or a
      // morning eat on the day itself, on the variant leg.
      if (!leg || !leg.perSeed['15215']) return false;
      const rows = leg.perSeed['15215'].rows;
      const prev = rows.find((r) => r.loopDay === day - 1);
      const self = rows.find((r) => r.loopDay === day);
      const eveAct = !!(prev && prev.sf2Evening && prev.sf2Evening.actions && prev.sf2Evening.actions.length);
      const mornEat = !!(self && self.sf2Morning && self.sf2Morning.ate);
      return { eveAct, mornEat, any: eveAct || mornEat };
    };
    out.bothEvenings = both;
    out.bothTable = both.map((day) => ({
      day,
      variantGuard: fate(vg, day), variantOn: fate(vo, day),
      linkGuard: link(vg, day), linkOn: link(vo, day),
    }));
    // Strand-ending rescue link: for each variant leg, the first
    // still->non-still transition and whether a recorded act precedes it.
    const strandEndLink = (control, variant) => {
      if (!control || !variant || !control.perSeed['15215'] || !variant.perSeed['15215']) return null;
      const cStill = control.perSeed['15215'].stillDays;
      const vRows = variant.perSeed['15215'].rows;
      for (const day of cStill) {
        const vRow = vRows.find((r) => r.loopDay === day);
        if (!vRow || vRow.rescued) {
          // The strand ended on or before this day on the variant leg:
          // link = any sf2 act on an evening before this day, or a
          // morning eat on/before this day, on the variant leg.
          const acts = vRows.filter((r) => r.loopDay < day && r.sf2Evening && r.sf2Evening.actions && r.sf2Evening.actions.length)
            .map((r) => r.loopDay);
          const eats = vRows.filter((r) => r.loopDay <= day && r.sf2Morning && r.sf2Morning.ate).map((r) => r.loopDay);
          return { endedByDay: day, eveActDays: acts, mornEatDays: eats, linked: acts.length > 0 || eats.length > 0 };
        }
      }
      return { endedByDay: null, eveActDays: [], mornEatDays: [], linked: false };
    };
    out.strandEndLinkGuard = strandEndLink(cg, vg);
    out.strandEndLinkOn = strandEndLink(co, vo);
    const fall = (control, variant) => {
      if (!control || !variant || !control.perSeed['15215'] || !variant.perSeed['15215']) return null;
      return {
        stillFall: control.perSeed['15215'].still - variant.perSeed['15215'].still,
        controlStill: control.perSeed['15215'].still, variantStill: variant.perSeed['15215'].still,
        controlMaxRun: control.perSeed['15215'].maxRun, variantMaxRun: variant.perSeed['15215'].maxRun,
        lengthened: variant.perSeed['15215'].still > control.perSeed['15215'].still ||
          variant.perSeed['15215'].maxRun > control.perSeed['15215'].maxRun,
      };
    };
    out.fallGuard = fall(cg, vg);
    out.fallOn = fall(co, vo);
  }
  // Guardrails across all seeds present on both a control and a variant leg.
  const guardrails = [];
  for (const [cLeg, vLeg, name] of [[cg, vg, 'guard'], [co, vo, 'on']]) {
    if (!cLeg || !vLeg) continue;
    for (const seed of Object.keys(cLeg.perSeed)) {
      const c = cLeg.perSeed[seed], v = (vLeg.perSeed || {})[seed];
      if (!v) continue;
      const cDeath = Math.min(...(c.playerDeathDays.length ? c.playerDeathDays : [Infinity]));
      const vDeath = Math.min(...(v.playerDeathDays.length ? v.playerDeathDays : [Infinity]));
      guardrails.push({ leg: name, seed,
        stillDelta: v.still - c.still,
        ticksShortDelta: v.ticksShort - c.ticksShort,
        earlierDeath: vDeath < cDeath,
        controlPlayerDeaths: c.playerDeathDays, variantPlayerDeaths: v.playerDeathDays,
        controlDeathCauses: null, variantDeathCauses: null });
    }
  }
  out.guardrails = guardrails;
  const text = JSON.stringify(out, null, 1);
  const outFile = arg('out');
  if (outFile) fs.writeFileSync(outFile, text);
  process.stdout.write(text + '\n');
}

if (require.main === module) main();
module.exports = { censusLeg, loadDir, detGate };
