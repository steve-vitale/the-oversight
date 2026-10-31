#!/usr/bin/env node
// pocketcall-trigger-analyze-20261031.js — before/after analysis for
// sim-pocketcall-trigger-a. Reads per-seed JSONs ONLY (no re-simulation),
// one corpus per arm, and prints a JSON summary + tables plus the
// prereg bar judgments for the seeds present.
// Usage:
//   node scripts/pocketcall-trigger-analyze-20261031.js [baseDir] [trigDir] [seed...]
// Defaults: evidence/2026-10-31/perseed-pocketcall-trigger-a/{baseline,trigger}.
// A corpus dir may also be given as a single dir (second arg omitted) for
// a single-arm summary (no comparison, no bar judgment).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyFight } = require(path.join(REPO, 'scripts', 'pocketcall-diag-20261031'));

const baseDir = process.argv[2] || path.join(REPO, 'evidence', '2026-10-31', 'perseed-pocketcall-trigger-a', 'baseline');
const trigDir = process.argv[3] || null;
const seedFilter = process.argv.slice(trigDir ? 4 : 3).map(s => parseInt(s, 10)).filter(Number.isFinite);

function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function shoutAnswered(log) {
  if (!Array.isArray(log)) return false;
  return log.some(l => typeof l === 'string' && l.indexOf('shouts for help!') !== -1 && l.indexOf('charges in!') !== -1);
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();
  const seeds = files.map(f => parseInt(f.slice(1, -5), 10)).filter(s => !seedFilter.length || seedFilter.includes(s));
  const out = { dir, seeds, ranged: [], dry: [], armed: [], wall: [],
    t1: { attempts: 0, armed: 0, craftFailed: 0, bySeed: {} },
    volley: { fights: 0, shots: 0, dmg: 0 },
    deaths: 0, starvation: 0, errs: { ammo: 0, pc: 0, supply: 0, stickfiber: 0, pd: 0 },
    joinProblems: [], pocketSeqProblems: [], t2Attributable: 0, t2Rows: [] };
  for (const seed of seeds) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, `s${seed}.json`), 'utf8'));
    out.wall.push({ seed, national: d.national, table: d.table, won: d.won,
      wave4: d.wave4, wave5: d.wave5, gameDays: d.gameDays, endReason: d.endReason });
    out.errs.ammo += (d.instrumentErrors || []).length;
    out.errs.pc += (d.pcErrors || []).length;
    out.errs.supply += (d.supplyErrors || []).length;
    out.errs.stickfiber += (d.stickfiberErrors || []).length;
    out.errs.pd += (d.pdErrors || []).length;
    const deaths = d.deaths || [];
    out.deaths += deaths.length;
    out.starvation += deaths.filter(x => x && x.cause === 'starvation').length;
    const t1 = d.t1Calls || [];
    out.t1.attempts += t1.length;
    out.t1.armed += t1.filter(x => x.after > x.before).length;
    out.t1.craftFailed += t1.filter(x => x.crafted && !x.craftedOk).length;
    out.t1.bySeed[seed] = { attempts: t1.length, armed: t1.filter(x => x.after > x.before).length,
      craftFailed: t1.filter(x => x.crafted && !x.craftedOk).length };
    const adFights = d.fights || [];
    const pcFights = d.pcFights || [];
    if (adFights.length !== pcFights.length) out.joinProblems.push({ seed, ad: adFights.length, pc: pcFights.length });
    const adPockets = d.pocketCalls || [];
    const pdSeqs = d.pdPocketSeq || [];
    if (adPockets.length !== pdSeqs.length) out.pocketSeqProblems.push({ seed, ad: adPockets.length, pd: pdSeqs.length });
    else {
      for (let i = 0; i < adPockets.length; i++) {
        if (adPockets[i].vid !== pdSeqs[i].vid || adPockets[i].day !== pdSeqs[i].day) {
          out.pocketSeqProblems.push({ seed, index: i }); break;
        }
      }
    }
    // Dry-fight history for T2 attribution (per seed, in fight order).
    const dryHistory = [];
    for (let i = 0; i < adFights.length; i++) {
      const f = adFights[i];
      if (!f.rangedAmmoId) continue;
      const pc = pcFights[i] || {};
      const cls = classifyFight({ carriedNeeded: f.carriedNeeded, pocketBefore: pc.pocketBefore || 0,
        departBefore: pc.departBefore || 0, wentBefore: pc.wentBefore || 0,
        fighterNode: pc.fighterNode, havenNode: pc.havenNode, away: pc.away, onExpedition: pc.onExpedition });
      const row = { seed, day: f.day, vid: f.vid, mid: f.mid, weapon: f.rangedWeaponId,
        ammo: f.rangedAmmoId, carried: f.carriedNeeded, cls: cls.cls, outcome: f.outcome,
        volley: f.volley || null, callerClass: f.callerClass || null,
        shoutAnswered: shoutAnswered(f.log) };
      out.ranged.push(row);
      if ((f.carriedNeeded || 0) === 0) {
        out.dry.push(row);
        dryHistory.push(row);
      } else {
        out.armed.push(row);
        // T1 attribution: a T1 call for this vid with after>0 on day <= fight day.
        const t1Before = t1.filter(x => x.vid === row.vid && x.after > x.before && x.day <= row.day);
        if (t1Before.length) row.t1Attributed = t1Before[t1Before.length - 1];
        // T2-attributable: fighter previously fought dry with a shout answered,
        // then got a T1 call after that fight and at/before this fight.
        const priorDryShout = dryHistory.filter(h => h.vid === row.vid && h.shoutAnswered);
        if (priorDryShout.length) {
          const lastDryDay = priorDryShout[priorDryShout.length - 1].day;
          const t2 = t1.filter(x => x.vid === row.vid && x.after > x.before && x.day > lastDryDay && x.day <= row.day);
          if (t2.length) { out.t2Attributable++; out.t2Rows.push({ seed, vid: row.vid, priorDryDay: lastDryDay, t1Day: t2[0].day, fightDay: row.day }); }
        }
      }
      if (f.volley) { out.volley.fights++; out.volley.shots += (f.volley.shots || 0); out.volley.dmg += (f.volley.dmg || 0); }
    }
    // T2 note for still-dry fighters too: a T1 call after a prior dry shout fight
    // that did NOT arm them before this fight is still a T2-moment attempt.
    for (const row of out.dry.filter(r => r.seed === seed)) {
      const prior = dryHistory.filter(h => h !== row && h.vid === row.vid && h.shoutAnswered && h.day < row.day);
      if (prior.length) {
        const lastDryDay = prior[prior.length - 1].day;
        const t2 = t1.filter(x => x.vid === row.vid && x.day > lastDryDay && x.day <= row.day);
        if (t2.length) out.t2Rows.push({ seed, vid: row.vid, priorDryDay: lastDryDay, t1Day: t2[0].day, fightDay: row.day, note: 'still-dry-at-fight' });
      }
    }
  }
  out.dryCount = out.dry.length;
  out.rangedCount = out.ranged.length;
  out.armedCount = out.armed.length;
  out.t1AttributedFights = out.armed.filter(r => r.t1Attributed).length;
  out.medianDays = medianOf(out.wall.map(w => w.gameDays));
  out.maxDays = out.wall.length ? Math.max.apply(null, out.wall.map(w => w.gameDays)) : null;
  out.national = out.wall.filter(w => w.national).length;
  out.table = out.wall.filter(w => w.table).length;
  out.wins = out.wall.filter(w => w.won).length;
  out.wave4 = out.wall.filter(w => w.wave4).length;
  out.wave5 = out.wall.filter(w => w.wave5).length;
  out.totalErrs = out.errs.ammo + out.errs.pc + out.errs.supply + out.errs.stickfiber + out.errs.pd;
  return out;
}

function summarize(a) {
  return { seeds: a.seeds, ranged: a.rangedCount, dry: a.dryCount, armed: a.armedCount,
    t1AttributedFights: a.t1AttributedFights, t2Attributable: a.t2Attributable,
    t1Attempts: a.t1.attempts, t1Armed: a.t1.armed, t1CraftFailed: a.t1.craftFailed,
    volley: a.volley, national: a.national, table: a.table, wins: a.wins,
    wave4: a.wave4, wave5: a.wave5, medianDays: a.medianDays, maxDays: a.maxDays,
    deaths: a.deaths, starvation: a.starvation, totalErrs: a.totalErrs,
    joinProblems: a.joinProblems.length, pocketSeqProblems: a.pocketSeqProblems.length };
}

const base = analyzeDir(baseDir);
const result = { baseline: summarize(base) };
console.log('=== BASELINE ===');
console.log(JSON.stringify(result.baseline, null, 1));
console.log('--- baseline dry fights ---');
for (const r of base.dry) console.log(`  s${r.seed} d${r.day} ${r.vid} ${r.weapon} cls=${r.cls} outcome=${r.outcome} shoutAnswered=${r.shoutAnswered}`);
console.log('--- baseline armed fights ---');
for (const r of base.armed) console.log(`  s${r.seed} d${r.day} ${r.vid} ${r.weapon} carried=${r.carried} outcome=${r.outcome} volley=${r.volley ? (r.volley.shots + '/' + r.volley.dmg) : 'none'}`);

if (trigDir) {
  const trig = analyzeDir(trigDir);
  result.trigger = summarize(trig);
  result.deltas = { dry: trig.dryCount - base.dryCount, ranged: trig.rangedCount - base.rangedCount,
    starvation: trig.starvation - base.starvation, medianDays: trig.medianDays - base.medianDays,
    national: trig.national - base.national, table: trig.table - base.table, wins: trig.wins - base.wins,
    wave4: trig.wave4 - base.wave4, wave5: trig.wave5 - base.wave5, deaths: trig.deaths - base.deaths };
  // Prereg bars for the seeds present (pilot = 8 seeds, confirm = 16).
  const nSeeds = base.seeds.length;
  const bars = {};
  bars.P1_C4_instrumentsClean = (base.totalErrs === 0 && trig.totalErrs === 0 && base.joinProblems.length === 0 && trig.joinProblems.length === 0 && base.pocketSeqProblems.length === 0 && trig.pocketSeqProblems.length === 0);
  bars.P2_mechanismFires = (trig.t1.attempts >= 3 && trig.t1.armed >= 1);
  bars.costScreen_starvation = (trig.starvation <= base.starvation + 2);
  bars.costScreen_median = (base.medianDays === null || trig.medianDays === null) ? null : (trig.medianDays >= 0.8 * base.medianDays);
  bars.pilotGO = bars.P1_C4_instrumentsClean && bars.P2_mechanismFires && bars.costScreen_starvation && bars.costScreen_median;
  bars.C1_primary = (base.dryCount === 0) ? null : (trig.dryCount <= Math.floor(2 / 3 * base.dryCount));
  bars.C2_attribution = (trig.t1AttributedFights >= 1);
  bars.C3_cost = bars.costScreen_starvation && bars.costScreen_median;
  bars.confirmGO = bars.P1_C4_instrumentsClean && bars.C1_primary === true && bars.C2_attribution && bars.C3_cost;
  if (nSeeds <= 8) {
    bars.verdict = bars.pilotGO ? 'PILOT-GO' : 'PILOT-NO-GO';
  } else {
    bars.verdict = (base.dryCount === 0) ? 'INSUFFICIENT-DATA (baseline dry 0)'
      : (!bars.confirmGO && bars.C1_primary === true && !bars.C2_attribution) ? 'INSUFFICIENT-DATA (reduction without T1 attribution)'
      : bars.confirmGO ? 'GO' : 'NO-GO';
  }
  result.bars = bars;
  console.log('=== TRIGGER ===');
  console.log(JSON.stringify(result.trigger, null, 1));
  console.log('--- trigger dry fights ---');
  for (const r of trig.dry) console.log(`  s${r.seed} d${r.day} ${r.vid} ${r.weapon} cls=${r.cls} outcome=${r.outcome} shoutAnswered=${r.shoutAnswered}`);
  console.log('--- trigger armed fights ---');
  for (const r of trig.armed) console.log(`  s${r.seed} d${r.day} ${r.vid} ${r.weapon} carried=${r.carried} outcome=${r.outcome} volley=${r.volley ? (r.volley.shots + '/' + r.volley.dmg) : 'none'} t1=${r.t1Attributed ? ('d' + r.t1Attributed.day + ' ' + r.t1Attributed.before + '->' + r.t1Attributed.after) : 'none'}`);
  console.log('--- trigger T1 by seed ---');
  for (const [seed, v] of Object.entries(trig.t1.bySeed)) console.log(`  s${seed}: attempts=${v.attempts} armed=${v.armed} craftFailed=${v.craftFailed}`);
  console.log('--- T2 rows ---');
  for (const r of trig.t2Rows) console.log('  ' + JSON.stringify(r));
  console.log('=== DELTAS + BARS ===');
  console.log(JSON.stringify({ deltas: result.deltas, bars }, null, 1));
}
console.log('=== FULL ===');
console.log(JSON.stringify(result, null, 1));
