#!/usr/bin/env node
// analyze-strandfix-ticks-b.js — pure-read analyzer for
// sim-strandfix-ticks-b (prereg:
// evidence/2026-10-30/sim-strandfix-ticks-b-prereg.md).
// Reads ONLY the corpora named on the command line (via --pilot
// for pilot corpora, default confirm corpora); writes census,
// hold table, and paired compare .md under evidence/2026-10-30/.
// Classification uses RAW GATES from the woodcarry
// classification record, never the bridge skip reason alone.
// Attribution classes follow sim-tickbudget-b-prereg.md
// (decisive / contributing / routine-only, with the
// missing-counterpart-never-decisive refinement).
'use strict';
const fs = require('fs');
const path = require('path');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-30');
const BANK = [15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439];
const PILOT_BANK = BANK.slice(0, 8);
const pilot = process.argv.includes('--pilot');
const SFX = pilot ? '-pilot' : '';

function dirFor(kind, leg) {
  // kind: control-variant | instrument | control-control | detgate
  // leg: guard | on
  if (pilot) return path.join(EVID, `sim-strandfix-ticks-b-corpus-pilot-${kind}-${leg}`);
  return path.join(EVID, `sim-strandfix-ticks-b-corpus-${kind}-${leg}`);
}
function loadCorpus(kind, leg) {
  const dir = dirFor(kind, leg);
  const out = {};
  if (!fs.existsSync(dir)) return { dir, missing: true, seeds: out };
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    try { const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); out[inst.seed] = inst; } catch (e) {}
  }
  return { dir, missing: false, seeds: out };
}
function creekEvenings(inst) {
  return (inst.evenings || []).filter((e) => e.woodcarry && e.woodcarry.bucket === 'creek');
}
function gates(e) {
  const cls = (e.woodcarry && e.woodcarry.classification) || {};
  const wood = cls.woodPlayer;
  const kcal = (cls.kcalLive === null || cls.kcalLive === undefined) ? cls.kcal : cls.kcalLive;
  const ticks = cls.ticksToDayEnd;
  return { wood, kcal, ticks,
    woodGate: wood !== null && wood !== undefined && wood >= 4,
    kcalGate: kcal !== null && kcal !== undefined && kcal >= 60,
    ticksGate: ticks !== null && ticks !== undefined && ticks >= 96 };
}
function ticksClass(e) {
  const g = gates(e);
  if (g.ticksGate) return 'pass';
  if (!g.woodGate && !g.kcalGate) return 'plus-both';
  if (!g.woodGate) return 'plus-wood';
  if (!g.kcalGate) return 'plus-kcal';
  return 'alone';
}
function probeSpent(e, layer) {
  const rec = (e.tickProbe || []).find((p) => p.layer === layer);
  return rec ? rec.spent : null;
}
function pressTicks(e) {
  // Press is outermost (unprobed): daily total minus woodwarm
  // total, on still evenings (no bridge build inside). Returns
  // null when the inputs are unavailable.
  if (e.morningDayTicks === null || e.morningDayTicks === undefined) return null;
  if (e.eveningDayTicks === null || e.eveningDayTicks === undefined) return null;
  const ww = probeSpent(e, 'woodwarm');
  if (ww === null) return null;
  return (e.eveningDayTicks - e.morningDayTicks) - ww;
}
function routineTicks(e) {
  // On hold evenings inner.daily never ran: no nighttravel
  // probe; the strandfix probe total IS the night-step total
  // (routine = 0 by construction). Otherwise the nighttravel
  // probe total is the routine.
  if (e.strandfixHold) return probeSpent(e, 'strandfix');
  return probeSpent(e, 'nighttravel');
}
function strandDays(inst) {
  const still = creekEvenings(inst).filter((e) => !e.woodcarry.rescued).map((e) => e.loopDay).sort((a, b) => a - b);
  const runs = [];
  let cur = [];
  for (const d of still) {
    if (cur.length && d !== cur[cur.length - 1] + 1) { runs.push(cur); cur = []; }
    cur.push(d);
  }
  if (cur.length) runs.push(cur);
  return runs;
}
function bearerDeathDay(inst) {
  const ds = (inst.deaths || []).filter((d) => d.player === true).map((d) => d.day).sort((a, b) => a - b);
  return ds.length ? ds[0] : null;
}
function attribute(e, counterpart) {
  // e: a ticks-short evening on a PRESSB=1 leg; counterpart:
  // same seed/loopDay on the PRESSB=0 leg of same WOODWARM.
  const press = e.pressbAttempt || null;
  const cls = ticksClass(e);
  const shortfall = 96 - gates(e).ticks;
  if (!press) return { cls: 'ROUTINE-ONLY', shortfall, pressTicks: 0 };
  const pt = press.ticksSpent || 0;
  if (cls !== 'alone') return { cls: 'PRESS-CONTRIBUTING', shortfall, pressTicks: pt };
  if (!counterpart) return { cls: 'PRESS-CONTRIBUTING', shortfall, pressTicks: pt, note: 'counterpart-missing' };
  const cg = gates(counterpart);
  if (!cg.ticksGate) return { cls: 'PRESS-CONTRIBUTING', shortfall, pressTicks: pt, note: 'counterpart-also-ticks-short' };
  if (pt >= shortfall) return { cls: 'PRESS-DECISIVE', shortfall, pressTicks: pt };
  return { cls: 'PRESS-CONTRIBUTING', shortfall, pressTicks: pt };
}
function censusOf(corpus) {
  const perSeed = {};
  let creek = 0, still = 0, rescued = 0, ticksShort = 0;
  const split = { alone: 0, 'plus-wood': 0, 'plus-kcal': 0, 'plus-both': 0 };
  const ticksShortRows = [];
  let errs = 0, nonCreekRefused = 0;
  for (const seed of Object.keys(corpus.seeds).map(Number).sort((a, b) => a - b)) {
    const inst = corpus.seeds[seed];
    const ce = creekEvenings(inst);
    const st = ce.filter((e) => !e.woodcarry.rescued);
    const re = ce.filter((e) => e.woodcarry.rescued);
    const ts = ce.filter((e) => !gates(e).ticksGate);
    for (const e of ts) {
      split[ticksClass(e)]++;
      ticksShortRows.push({ seed, loopDay: e.loopDay, class: ticksClass(e),
        wood: gates(e).wood, kcal: gates(e).kcal, ticks: gates(e).ticks,
        shortfall: 96 - gates(e).ticks, skip: (e.woodcarry.bridge || {}).skip || null,
        rescued: !!e.woodcarry.rescued, held: !!e.strandfixHold,
        pressTicks: e.pressbAttempt ? (e.pressbAttempt.ticksSpent || 0) : 0,
        pressFired: !!e.pressbAttempt,
        morningDayTicks: e.morningDayTicks, routine: routineTicks(e) });
    }
    perSeed[seed] = { creek: ce.length, still: st.length, rescued: re.length,
      ticksShort: ts.length, strands: strandDays(inst),
      daysAlive: inst.daysAlive, endReason: inst.endReason,
      maxWave: inst.maxWaveUnlocked, bearerDeathDay: bearerDeathDay(inst),
      allDeaths: (inst.deaths || []).length,
      wcErrs: (inst.woodcarryStore || {}).errs || 0,
      wwErrs: (inst.warmthStore || {}).errs || 0,
      pbErrs: (inst.pressbStore || {}).errs || 0,
      sfErrs: (inst.strandfixStore || {}).errs || 0,
      wwActed: (inst.warmthStore || {}).acted || 0,
      evenings: (inst.evenings || []).length };
    creek += ce.length; still += st.length; rescued += re.length; ticksShort += ts.length;
    errs += perSeed[seed].wcErrs + perSeed[seed].wwErrs + perSeed[seed].pbErrs + perSeed[seed].sfErrs;
    nonCreekRefused += (inst.evenings || []).filter((e) => e.eveningOutcome === 'travel-refused' && !(e.woodcarry && e.woodcarry.bucket === 'creek')).length;
  }
  return { dir: corpus.dir, missing: corpus.missing, creek, still, rescued, ticksShort, split, ticksShortRows, perSeed, errs, nonCreekRefused };
}
function holdCensusOf(corpus) {
  const rows = [];
  let holds = 0, skips = 0;
  for (const seed of Object.keys(corpus.seeds).map(Number).sort((a, b) => a - b)) {
    const inst = corpus.seeds[seed];
    const sf = inst.strandfixStore || {};
    holds += (sf.holds || []).length; skips += (sf.skips || []).length;
    for (const h of (sf.holds || [])) {
      const ev = (inst.evenings || []).find((e) => e.loopDay === h.loopDay) || {};
      const wc = ev.woodcarry || {};
      rows.push({ seed, loopDay: h.loopDay, morningDayTicks: h.morningDayTicks, ticksLeft: h.ticksLeft,
        eveningOutcome: ev.eveningOutcome || null, bucket: wc.bucket || null,
        rescued: wc.rescued === undefined ? null : !!wc.rescued,
        wood: gates(ev).wood, kcal: gates(ev).kcal, ticks: gates(ev).ticks,
        strandfixProbe: probeSpent(ev, 'strandfix'), nighttravelProbe: probeSpent(ev, 'nighttravel') });
    }
  }
  const mdt = {};
  for (const r of rows) mdt[r.morningDayTicks] = (mdt[r.morningDayTicks] || 0) + 1;
  return { holds, skips, rows, morningDayTicksDist: mdt };
}
function reconciliation(corpus) {
  // Still creek evenings only: classification ticks must equal
  // 512 - (morning + pressOwn + routine + carryOwn), with
  // carryOwn = woodcarry probe total - inner probe total (= 0
  // on still evenings, no bridge attempt). Warmth excluded
  // (post-decision). Returns mismatch list.
  const mismatches = [];
  for (const seed of Object.keys(corpus.seeds).map(Number).sort((a, b) => a - b)) {
    const inst = corpus.seeds[seed];
    for (const e of creekEvenings(inst).filter((x) => !x.woodcarry.rescued)) {
      if (e.morningDayTicks === null || e.morningDayTicks === undefined) continue;
      const pt = pressTicks(e);
      const rt = routineTicks(e);
      const wcTotal = probeSpent(e, 'woodcarry');
      const innerTotal = e.strandfixHold ? probeSpent(e, 'strandfix') : probeSpent(e, 'nighttravel');
      if (pt === null || rt === null || wcTotal === null || innerTotal === null) { mismatches.push({ seed, loopDay: e.loopDay, why: 'probe-missing' }); continue; }
      const carryOwn = wcTotal - innerTotal;
      const clsTicks = 512 - (e.morningDayTicks + pt + rt + carryOwn);
      const g = gates(e);
      if (g.ticks !== clsTicks) mismatches.push({ seed, loopDay: e.loopDay, why: 'ticks-mismatch', classification: g.ticks, computed: clsTicks, morning: e.morningDayTicks, press: pt, routine: rt, carryOwn });
    }
  }
  return mismatches;
}

function main() {
  const legs = {};
  const kinds = pilot ? ['control-variant', 'instrument'] : ['control-variant', 'instrument', 'control-control', 'detgate'];
  for (const kind of kinds) for (const leg of ['guard', 'on']) {
    legs[`${kind}-${leg}`] = censusOf(loadCorpus(kind, leg));
  }
  const control = { guard: legs['control-variant-guard'], on: legs['control-variant-on'] };
  const instr = { guard: legs['instrument-guard'], on: legs['instrument-on'] };
  const holdC = { guard: holdCensusOf(loadCorpus('instrument', 'guard')), on: holdCensusOf(loadCorpus('instrument', 'on')) };
  // Attribution of control ticks-short evenings (counterpart:
  // control-control same seed/loopDay/leg).
  const attribution = [];
  for (const leg of ['guard', 'on']) {
    const cc = legs[`control-control-${leg}`] || censusOf(loadCorpus('control-control', leg));
    const ccBySeedDay = {};
    if (!cc.missing) for (const seed of Object.keys(cc.perSeed)) {
      const inst = loadCorpus('control-control', leg).seeds[seed];
      if (inst) for (const e of creekEvenings(inst)) ccBySeedDay[`${seed}/${e.loopDay}`] = e;
    }
    for (const r of control[leg].ticksShortRows) {
      const inst = loadCorpus('control-variant', leg).seeds[r.seed];
      const ev = inst ? creekEvenings(inst).find((e) => e.loopDay === r.loopDay) : null;
      const at = ev ? attribute(ev, ccBySeedDay[`${r.seed}/${r.loopDay}`] || null) : { cls: 'UNKNOWN', shortfall: r.shortfall, pressTicks: 0 };
      attribution.push({ leg, seed: r.seed, loopDay: r.loopDay, class: r.class, attribution: at.cls, shortfall: at.shortfall, pressTicks: at.pressTicks, note: at.note || null });
    }
  }
  // Conversion table: control ticks-short -> instrument same-day.
  const conversions = [];
  for (const leg of ['guard', 'on']) {
    const ci = loadCorpus('instrument', leg);
    for (const r of control[leg].ticksShortRows) {
      const inst = ci.seeds[r.seed];
      const ev = inst ? (inst.evenings || []).find((e) => e.loopDay === r.loopDay) : null;
      let outcome = 'no-instrument-evening';
      if (ev) {
        const wc = ev.woodcarry || {};
        if (wc.bucket === 'creek' && wc.rescued && wc.bridge && wc.bridge.built) outcome = 'converted-rescued';
        else if (wc.bucket === 'creek' && !wc.rescued && gates(ev).ticksGate) outcome = 'ticks-cleared-not-rescued';
        else if (wc.bucket === 'creek' && !wc.rescued && !gates(ev).ticksGate) outcome = 'still-ticks-short';
        else if (wc.bucket === 'creek' && wc.rescued) outcome = 'rescued-other';
        else outcome = `no-creek-evening (${ev.eveningOutcome || '?'})`;
      }
      conversions.push({ leg, seed: r.seed, loopDay: r.loopDay, controlClass: r.class, controlTicks: r.ticks, controlShortfall: r.shortfall,
        instrumentOutcome: outcome,
        instrumentWood: ev ? gates(ev).wood : null, instrumentKcal: ev ? gates(ev).kcal : null, instrumentTicks: ev ? gates(ev).ticks : null,
        instrumentHeld: ev ? !!ev.strandfixHold : null });
    }
  }
  const controlTicksTotal = control.guard.ticksShort + control.on.ticksShort;
  const instrTicksTotal = instr.guard.ticksShort + instr.on.ticksShort;
  const fall = controlTicksTotal - instrTicksTotal;
  const converted = conversions.filter((c) => c.instrumentOutcome === 'converted-rescued');
  const go = (fall >= 2) && (converted.length >= 1);
  // Newly ticks-short / newly still on instrument legs.
  const newlyTicksShort = [], newlyStill = [];
  for (const leg of ['guard', 'on']) {
    const ci = loadCorpus('instrument', leg);
    const cv = loadCorpus('control-variant', leg);
    for (const seed of Object.keys(ci.seeds).map(Number)) {
      const ii = ci.seeds[seed], vi = cv.seeds[seed];
      if (!ii || !vi) continue;
      for (const e of creekEvenings(ii)) {
        const vEv = creekEvenings(vi).find((x) => x.loopDay === e.loopDay);
        if (!gates(e).ticksGate && (!vEv || gates(vEv).ticksGate)) newlyTicksShort.push({ leg, seed, loopDay: e.loopDay, ticks: gates(e).ticks });
        if (!e.woodcarry.rescued && (!vEv || vEv.woodcarry.rescued)) newlyStill.push({ leg, seed, loopDay: e.loopDay, wood: gates(e).wood, kcal: gates(e).kcal, ticks: gates(e).ticks });
      }
    }
  }
  // Death-delay pairing control -> instrument.
  const deathDelay = [];
  for (const leg of ['guard', 'on']) {
    for (const seed of Object.keys(control[leg].perSeed).map(Number).sort((a, b) => a - b)) {
      const c = control[leg].perSeed[seed].bearerDeathDay;
      const i = instr[leg].perSeed[seed] ? instr[leg].perSeed[seed].bearerDeathDay : null;
      deathDelay.push({ leg, seed, control: c, instrument: i, delay: (c === null && i === null) ? 'CENSORED' : (c === null || i === null) ? 'uncensored-one-side' : (i - c) });
    }
  }
  // Day-7 report per leg (instrument same-day outcome).
  const day7 = [];
  for (const leg of ['guard', 'on']) {
    const cRow = control[leg].ticksShortRows.find((r) => r.seed === 15215 && r.loopDay === 7) || null;
    const conv = conversions.find((x) => x.leg === leg && x.seed === 15215 && x.loopDay === 7) || null;
    day7.push({ leg, controlTicksShort: !!cRow, control: cRow, instrument: conv });
  }
  const recon = {};
  for (const kind of kinds) for (const leg of ['guard', 'on']) {
    recon[`${kind}-${leg}`] = reconciliation(loadCorpus(kind, leg));
  }
  const waveReach = {};
  for (const kind of kinds) for (const leg of ['guard', 'on']) {
    const c = legs[`${kind}-${leg}`];
    const per = c.perSeed;
    waveReach[`${kind}-${leg}`] = { w1: Object.values(per).filter((p) => p.maxWave >= 1).length, w2: Object.values(per).filter((p) => p.maxWave >= 2).length, w3: Object.values(per).filter((p) => p.maxWave >= 3).length, w4: Object.values(per).filter((p) => p.maxWave >= 4).length, w5: Object.values(per).filter((p) => p.maxWave >= 5).length, n: Object.keys(per).length };
  }
  const median = (arr) => { const s = arr.slice().sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : null; };
  const survival = {};
  for (const kind of kinds) for (const leg of ['guard', 'on']) {
    survival[`${kind}-${leg}`] = median(Object.values(legs[`${kind}-${leg}`].perSeed).map((p) => p.daysAlive));
  }
  // Det-gate identity (confirm only): census + trajectory identity
  // detgate vs control-variant, per seed/leg/evening.
  let detgate = null;
  if (!pilot) {
    detgate = { mismatches: [] };
    for (const leg of ['guard', 'on']) {
      const cv = loadCorpus('control-variant', leg), dg = loadCorpus('detgate', leg);
      for (const seed of BANK) {
        const a = cv.seeds[seed], b = dg.seeds[seed];
        if (!a || !b) { detgate.mismatches.push({ leg, seed, why: 'missing-file' }); continue; }
        const ca = censusOf({ dir: '', missing: false, seeds: { [seed]: a } });
        const cb = censusOf({ dir: '', missing: false, seeds: { [seed]: b } });
        if (ca.creek !== cb.creek || ca.still !== cb.still || ca.rescued !== cb.rescued || ca.ticksShort !== cb.ticksShort) {
          detgate.mismatches.push({ leg, seed, why: 'census', control: [ca.creek, ca.still, ca.rescued, ca.ticksShort], detgate: [cb.creek, cb.still, cb.rescued, cb.ticksShort] });
        }
        for (const e of creekEvenings(a)) {
          const be = creekEvenings(b).find((x) => x.loopDay === e.loopDay);
          if (!be) { detgate.mismatches.push({ leg, seed, loopDay: e.loopDay, why: 'evening-missing' }); continue; }
          const ga = gates(e), gb = gates(be);
          if (ga.wood !== gb.wood || ga.kcal !== gb.kcal || ga.ticks !== gb.ticks || !!e.woodcarry.rescued !== !!be.woodcarry.rescued) {
            detgate.mismatches.push({ leg, seed, loopDay: e.loopDay, why: 'evening-gates', control: ga, detgate: gb });
          }
          if (e.eveningDayTicks !== be.eveningDayTicks) detgate.mismatches.push({ leg, seed, loopDay: e.loopDay, why: 'eveningDayTicks', control: e.eveningDayTicks, detgate: be.eveningDayTicks });
        }
      }
    }
  }
  const census = { pilot, control, instrument: instr, holdCensus: holdC, attribution, conversions,
    goBar: { controlTicksTotal, instrumentTicksTotal: instrTicksTotal, fall, converted: converted.length, go },
    newlyTicksShort, newlyStill, deathDelay, day7, reconciliation: recon, waveReach, survival,
    controlControl: pilot ? null : { guard: legs['control-control-guard'], on: legs['control-control-on'] },
    detgate };
  const censusPath = path.join(EVID, `sim-strandfix-ticks-b-census${SFX}.json`);
  fs.writeFileSync(censusPath, JSON.stringify(census, null, 2));
  const holdPath = path.join(EVID, `sim-strandfix-ticks-b-hold-table${SFX}.json`);
  fs.writeFileSync(holdPath, JSON.stringify(holdC, null, 2));
  // Compare .md (paired, NOT an official panel run — see prereg §15).
  const L = [];
  L.push(`# sim-strandfix-ticks-b — paired compare${pilot ? ' (PILOT)' : ''}`);
  L.push('');
  L.push('Paired compare .md (NOT an official balance-panel run: the official panel driver cannot express the strand stack — see prereg §15). Control = control-variant legs (PRESSB=1, no strandfix); instrument = instrument legs (PRESSB=1, STRANDFIX=1). Same seeds, same env, same WOODWARM legs.');
  L.push('');
  L.push(`GO bar: ticks-short fall = ${fall} (control ${controlTicksTotal} -> instrument ${instrTicksTotal}); bridge-built conversions = ${converted.length}; GO = ${go ? 'YES' : 'NO'} (fall >= 2 AND conversions >= 1).`);
  L.push('');
  L.push('| leg | control creek/still/rescued | instrument creek/still/rescued | control ticks-short | instrument ticks-short |');
  L.push('|-----|------------------------------|---------------------------------|----------------------|-------------------------|');
  for (const leg of ['guard', 'on']) {
    L.push(`| ${leg} | ${control[leg].creek}/${control[leg].still}/${control[leg].rescued} | ${instr[leg].creek}/${instr[leg].still}/${instr[leg].rescued} | ${control[leg].ticksShort} (${JSON.stringify(control[leg].split)}) | ${instr[leg].ticksShort} (${JSON.stringify(instr[leg].split)}) |`);
  }
  L.push('');
  L.push('## Conversions (control ticks-short -> instrument same-day)');
  for (const c of conversions) L.push(`- ${c.leg} seed ${c.seed} day ${c.loopDay}: control ${c.controlClass} ticks ${c.controlTicks} (shortfall ${c.controlShortfall}) -> ${c.instrumentOutcome} (instrument wood ${c.instrumentWood} kcal ${c.instrumentKcal} ticks ${c.instrumentTicks} held ${c.instrumentHeld})`);
  L.push('');
  L.push('## Attribution (control ticks-short evenings)');
  for (const a of attribution) L.push(`- ${a.leg} seed ${a.seed} day ${a.loopDay}: ${a.class} -> ${a.attribution} (shortfall ${a.shortfall}, pressTicks ${a.pressTicks}${a.note ? ', ' + a.note : ''})`);
  L.push('');
  L.push('## Hold census (instrument legs)');
  for (const leg of ['guard', 'on']) L.push(`- ${leg}: holds ${holdC[leg].holds}, skips ${holdC[leg].skips}, morningDayTicks dist ${JSON.stringify(holdC[leg].morningDayTicksDist)}`);
  L.push('');
  L.push('## Death delay (bearer-death day, control -> instrument)');
  for (const d of deathDelay) L.push(`- ${d.leg} seed ${d.seed}: ${d.control} -> ${d.instrument} (delay ${d.delay})`);
  L.push('');
  L.push('## Wave reach / median survival');
  for (const k of Object.keys(waveReach)) L.push(`- ${k}: waves ${JSON.stringify(waveReach[k])}, median survival ${survival[k]}`);
  if (detgate) L.push('', `## Det-gate (instrument-OFF vs control-variant): mismatches ${detgate.mismatches.length}` + (detgate.mismatches.length ? '\n' + detgate.mismatches.slice(0, 20).map((m) => `- ${JSON.stringify(m)}`).join('\n') : ' (identity holds)'));
  L.push('', '## Day 7 (reported separately, not part of the GO bar)');
  for (const d of day7) L.push(`- ${d.leg}: control ticks-short ${d.controlTicksShort}; instrument outcome ${d.instrument ? d.instrument.instrumentOutcome : 'n/a'}`);
  const comparePath = path.join(EVID, `sim-strandfix-ticks-b-compare${SFX}.md`);
  fs.writeFileSync(comparePath, L.join('\n') + '\n');
  console.log(`census ${censusPath}`);
  console.log(`hold table ${holdPath}`);
  console.log(`compare ${comparePath}`);
  console.log(`GO fall=${fall} converted=${converted.length} go=${go}`);
}

if (require.main === module) main();
module.exports = { gates, ticksClass, attribute, strandDays, bearerDeathDay, routineTicks, pressTicks };
