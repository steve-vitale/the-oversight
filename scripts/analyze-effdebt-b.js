#!/usr/bin/env node
// analyze-effdebt-b.js — pure reads over sim-effdebt-b census corpora.
// No game code, no RNG, no state edits. Prints a summary and writes
// evidence/2026-10-30/sim-effdebt-b-census.json (per-seed tables,
// every negative press with restoration, stranded field mornings).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EV = path.join(ROOT, 'evidence', '2026-10-30');

function loadCorpus(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out.push({ file: f, ...j });
  }
  return out;
}

function analyzeLeg(leg, dir) {
  const seeds = [];
  let totPress = 0, totNeg = 0, totWould = 0, totRefused = 0, totYield = 0;
  const negatives = [];
  const stranded = [];
  for (const inst of loadCorpus(dir)) {
    const taps = inst.taps || [];
    const forage = taps.filter((t) => t.kind === 'forage');
    const neg = [];
    forage.forEach((p, idx) => {
      if (p.kcalAfter < 0) {
        // RESTORATION (corrected definition — see evidence: the tap
        // does not cover startConvo, so "first tapped event >= 0"
        // misattributed floors to eat). Measured here: food gain
        // from eat/eatOne events between the press and the next
        // morning snap, and the next morning snap's kcal. If food
        // gain alone does not climb out of the debt, the balance
        // was floored without food — by the next clamped spend
        // (proven by the setter-trap probe: startConvo floors
        // -16 -> 0 and -60 -> 0 on 15215 days 8-9) or by the
        // overnight resolveDay floor. Morning snap >= 0 in all
        // cases is the check that no debt survives the night.
        const gi = taps.indexOf(p);
        let foodGain = 0, morningSnap = null;
        for (let k = gi + 1; k < taps.length; k++) {
          const tk = taps[k];
          if (tk.kind === 'morning') { morningSnap = tk.kcalAfter; break; }
          if ((tk.kind === 'eat' || tk.kind === 'eatOne') && tk.kcalAfter > tk.kcalBefore) foodGain += (tk.kcalAfter - tk.kcalBefore);
        }
        const debt = -p.kcalAfter;
        const rest = { foodGain, morningSnap,
          foodRestored: foodGain >= debt,
          kind: foodGain >= debt ? 'ate-food' : 'floored-without-food' };
        const rec = { leg, seed: inst.seed, loopDay: p.loopDay, gameDay: p.gameDay,
          pos: p.pos || null, kcalBefore: p.kcalBefore, kcalAfter: p.kcalAfter,
          delta: p.kcalAfter - p.kcalBefore, sayAdded: p.sayAdded || [],
          packDiff: p.packDiff || [], restoration: rest,
          namesKcal: (p.sayAdded || []).some((l) => /kcal/i.test(l)),
          namesCost: (p.sayAdded || []).some((l) => /60 kcal|effort/i.test(l)) };
        neg.push(rec); negatives.push(rec);
      }
    });
    const would = forage.filter((p) => p.kcalBefore < 60);
    const refused = forage.filter((p) => p.kcalAfter === p.kcalBefore);
    const yielding = forage.filter((p) => p.kcalAfter < p.kcalBefore);
    // stranded field mornings: evening bucket creek + not rescued, joined to morning snap, wake tile not haven
    const mByDay = new Map((inst.mornings || []).map((m) => [m.loopDay, m]));
    for (const ev of inst.evenings || []) {
      const wc = ev.woodcarry;
      if (wc && wc.bucket === 'creek' && !wc.rescued) {
        const m = mByDay.get(ev.loopDay);
        if (!m) { stranded.push({ leg, seed: inst.seed, loopDay: ev.loopDay, error: 'no-morning-snap' }); continue; }
        const isHaven = m.tile === 'haven';
        stranded.push({ leg, seed: inst.seed, loopDay: ev.loopDay, gameDay: m.gameDay,
          tile: m.tile, mx: m.mx, my: m.my, mapPx: m.mapPx, mapPy: m.mapPy,
          kcal: m.kcal, morningWood: m.morningWood, havenMorning: isHaven,
          fieldMorning: !isHaven, sweep: m.sweepAnalysis || null });
      }
    }
    seeds.push({ seed: inst.seed, endReason: inst.endReason, daysAlive: inst.daysAlive,
      tapEvents: taps.length, tapErrs: inst.tapErrs || 0,
      foragePresses: forage.length, yieldingPresses: yielding.length,
      refusedPresses: refused.length, wouldBeDebt: would.length,
      negativePresses: neg.length, minKcalAfter: forage.length ? Math.min(...forage.map((p) => p.kcalAfter)) : null,
      negativeLoopDays: neg.map((n) => n.loopDay) });
    totPress += forage.length; totNeg += neg.length; totWould += would.length;
    totRefused += refused.length; totYield += yielding.length;
  }
  return { leg, seeds, totals: { foragePresses: totPress, yieldingPresses: totYield, refusedPresses: totRefused, wouldBeDebt: totWould, negativePresses: totNeg },
    negatives, stranded };
}

const guard = analyzeLeg('guard', path.join(EV, 'sim-effdebt-b-corpus-guard'));
const on = analyzeLeg('on', path.join(EV, 'sim-effdebt-b-corpus-on'));
const out = { guard, on,
  totals: { foragePresses: guard.totals.foragePresses + on.totals.foragePresses,
    yieldingPresses: guard.totals.yieldingPresses + on.totals.yieldingPresses,
    refusedPresses: guard.totals.refusedPresses + on.totals.refusedPresses,
    wouldBeDebt: guard.totals.wouldBeDebt + on.totals.wouldBeDebt,
    negativePresses: guard.totals.negativePresses + on.totals.negativePresses } };
fs.writeFileSync(path.join(EV, 'sim-effdebt-b-census.json'), JSON.stringify(out, null, 2));
for (const leg of [guard, on]) {
  console.log(`LEG ${leg.leg}: presses=${leg.totals.foragePresses} yielding=${leg.totals.yieldingPresses} refused=${leg.totals.refusedPresses} wouldBeDebt(<60)=${leg.totals.wouldBeDebt} negative=${leg.totals.negativePresses}`);
  for (const s of leg.seeds) console.log(`  seed ${s.seed}: end=${s.endReason} days=${s.daysAlive} presses=${s.foragePresses} yielding=${s.yieldingPresses} refused=${s.refusedPresses} would=${s.wouldBeDebt} neg=${s.negativePresses} minAfter=${s.minKcalAfter} tapErrs=${s.tapErrs}`);
  for (const n of leg.negatives) console.log(`  NEG ${leg.leg} s${n.seed} loopDay=${n.loopDay} gameDay=${n.gameDay} ${n.pos ? n.pos.tile + ' (' + n.pos.mx + ',' + n.pos.my + ')' : '?'} ${n.kcalBefore}->${n.kcalAfter} rest=${n.restoration.kind} foodGain=${n.restoration.foodGain} morningSnap=${n.restoration.morningSnap} namesKcal=${n.namesKcal} namesCost=${n.namesCost}`);
  for (const s of leg.stranded) console.log(`  STRAND ${leg.leg} s${s.seed} loopDay=${s.loopDay} tile=${s.tile} kcal=${s.kcal} field=${s.fieldMorning} haven=${s.havenMorning}${s.error ? ' ERR=' + s.error : ''}`);
}
console.log(`TOTALS: presses=${out.totals.foragePresses} yielding=${out.totals.yieldingPresses} refused=${out.totals.refusedPresses} would=${out.totals.wouldBeDebt} negative=${out.totals.negativePresses}`);
