#!/usr/bin/env node
// test-genericremainder-b.js — proof for sim-genericremainder-b.
// DIAG only, zero src/js. Re-derives BOTH failing generic rows from the
// committed raidcallers corpora via an INDEPENDENT recomputation (this
// file does NOT call scripts/analyze-raidcallers-b.js), reproduces the
// analyzer's caller-complete generic row values (9954 +3,700, 9970 +416),
// re-derives the OLD -> NEW -> BOUNDARY bridge for each row, and
// asserts every known-artifact exclusion the prereg requires before a
// mechanism may be named. Judged ONLY against
// evidence/2026-10-27/sim-genericremainder-b-prereg.md.
//
// Usage (from the worktree root): node scripts/test-genericremainder-b.js
// Exit 0 iff every check passes; any failure exits 1 with the failing
// check named. No jest, no network, no repo writes.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PILOT = path.join(ROOT, 'evidence', '2026-10-27', 'sim-raidcallers-b-corpus');
const CONFIRM = path.join(ROOT, 'evidence', '2026-10-27', 'sim-raidcallers-b-confirm-corpus');
const FAM = 'Foraged food';

function famOf(nm) { return String(nm || '').replace(/ \((dried|smoked)\)$/, ''); }
function isDried(nm) { return / \((dried|smoked)\)$/.test(String(nm || '')); }
function famTotal(channels, fam) {
  let t = 0;
  for (const ch of (channels || [])) if (famOf(ch.channel) === fam) t += ch.freshKcal || 0;
  return t;
}
function loadSeed(dir, seed) {
  const f = fs.readdirSync(dir).find((x) => x.indexOf('-s' + seed + '.json') >= 0);
  if (!f) throw new Error('no corpus file for seed ' + seed + ' in ' + dir);
  return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
}

let checks = 0, fails = 0;
function check(name, cond, detail) {
  checks++;
  if (cond) console.log('  PASS ' + name + (detail != null ? ' — ' + detail : ''));
  else { fails++; console.log('  FAIL ' + name + (detail != null ? ' — ' + detail : '')); }
}

// ---- independent family ledger for one seed (fresh + dried split) ----
function ledger(ps) {
  const L = {
    opening: 0, openingFresh: 0, openingDried: 0,
    closing: 0, closingFresh: 0, closingDried: 0,
    lastSnapDay: null,
    // OLD definition
    oldInflow: 0, oldDraws: 0, oldSweep: 0, oldLoss: 0,
    // NEW definition (all days)
    newInflow: 0, newDraws: 0, newSweep: 0, newLoss: 0,
    newFresh: null, newDried: null,
    // boundary (flows <= horizon; closing adjustments)
    bInflow: 0, bDraws: 0, bSweep: 0, bLoss: 0, bPost: 0,
    stock100: 0, meal100: 0, cc100: 0, cc100Dried: 0,
    stockdoorKcal: 0, stockdoorGive: 0,
    directRetMismatch: 0, raidRetMismatch: 0,
    unlinkedPost: 0, unlinkedEvents: 0,
    postHorizonNet: 0,
    otherWantMax: 0, otherCount: 0, alienRaidRecords: 0,
    takenItemsBonusGap: 0,
  };
  for (const ch of (ps.openingStock.channels || [])) {
    if (famOf(ch.channel) !== FAM) continue;
    L.opening += ch.freshKcal || 0;
    if (isDried(ch.channel)) L.openingDried += ch.freshKcal || 0; else L.openingFresh += ch.freshKcal || 0;
  }
  const last = (ps.spoilDays || [])[(ps.spoilDays || []).length - 1] || {};
  L.lastSnapDay = last.day != null ? last.day : null;
  for (const ch of (last.channels || [])) {
    if (famOf(ch.channel) !== FAM) continue;
    L.closing += ch.freshKcal || 0;
    if (isDried(ch.channel)) L.closingDried += ch.freshKcal || 0; else L.closingFresh += ch.freshKcal || 0;
  }
  const H = 100; // boundary horizon day (flows dated > 100 excluded)
  const flows = []; // {day, inflow, draws, sweep, loss, fresh, dried} for sub-ledgers
  const push = (day, o) => flows.push(Object.assign({ day }, o));
  for (const r of (ps.inflows || [])) {
    if (r.name == null || famOf(r.name) !== FAM) continue;
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    const k = r.kcal || 0;
    push(r.day, { inflow: k, fresh: isDried(r.name) ? 0 : k, dried: isDried(r.name) ? k : 0 });
  }
  for (const r of (ps.stockdoorRecords || [])) {
    if (r.name !== FAM) continue;
    L.stockdoorGive += r.give || 0; L.stockdoorKcal += r.kcal || 0;
    if (r.kcal > 0) push(r.day, { inflow: r.kcal, fresh: r.kcal, dried: 0 });
  }
  const drawItems = (recs) => {
    for (const r of recs) {
      for (const it of (r.items || [])) {
        if (it.name == null || famOf(it.name) !== FAM) continue;
        const k = (it.units || 0) * (it.kcalEach || 0);
        push(r.day, { draws: k, fresh: isDried(it.name) ? 0 : k, dried: isDried(it.name) ? k : 0 });
      }
    }
  };
  drawItems((ps.mealDrawRecords || []).filter((r) => r.kind === 'pantryDraw' || r.kind === 'drawSpoiled'));
  drawItems(ps.directRecords || []);
  drawItems(ps.raidRecords || []);
  for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
    for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) {
      if (famOf(bc.channel) !== FAM) continue;
      const k = bc.kcal || 0;
      push(sw.day, { sweep: k, fresh: isDried(bc.channel) ? 0 : k, dried: isDried(bc.channel) ? k : 0 });
    }
  }
  // transforms: linked loss (fresh outflow) + linked post (dried inflow)
  const freshTF = { pre: 0 }, driedTF = { post: 0 };
  for (const e of (ps.driedEvents || [])) {
    const nm = (e.before && e.before.channel) || '?';
    if (famOf(nm) !== FAM) continue;
    if (e.linked && e.lossKcal != null) {
      push(e.day, { loss: e.lossKcal || 0, fresh: e.lossKcal || 0, dried: 0 });
      freshTF.pre += e.preKcal || 0; driedTF.post += e.postKcal || 0;
      // dried sub-ledger: post is an inflow to dried, pre is an outflow from fresh
      push(e.day, { driedIn: e.postKcal || 0, freshOut: e.preKcal || 0 });
    } else { L.unlinkedEvents++; L.unlinkedPost += e.postKcal || 0; }
  }
  // Aggregate OLD / NEW / boundary from the same flow list.
  const agg = (pred) => {
    const a = { inflow: 0, draws: 0, sweep: 0, loss: 0, freshIn: 0, freshDraws: 0, freshSweep: 0, freshPre: 0, driedIn: 0, driedDraws: 0, driedSweep: 0, driedPost: 0 };
    for (const fl of flows) {
      if (!pred(fl)) continue;
      a.inflow += fl.inflow || 0; a.draws += fl.draws || 0; a.sweep += fl.sweep || 0; a.loss += fl.loss || 0;
      a.freshIn += fl.fresh != null && fl.inflow ? fl.fresh : 0;
      a.freshDraws += fl.fresh != null && fl.draws ? fl.fresh : 0;
      a.freshSweep += fl.fresh != null && fl.sweep ? fl.fresh : 0;
      a.freshPre += fl.freshOut || 0;
      a.driedIn += fl.dried != null && fl.inflow ? fl.dried : 0;
      a.driedDraws += fl.dried != null && fl.draws ? fl.dried : 0;
      a.driedSweep += fl.dried != null && fl.sweep ? fl.dried : 0;
      a.driedPost += fl.driedIn || 0;
    }
    return a;
  };
  // OLD: inflows minus stockdoor, draws minus drawSpoiled/direct/raid.
  // Recompute directly (cleaner than filtering the shared list):
  let oldIn = 0, oldDr = 0;
  for (const r of (ps.inflows || [])) {
    if (r.name == null || famOf(r.name) !== FAM) continue;
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    oldIn += r.kcal || 0;
  }
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.kind !== 'pantryDraw') continue;
    for (const it of (r.items || [])) {
      if (it.name == null || famOf(it.name) !== FAM) continue;
      oldDr += (it.units || 0) * (it.kcalEach || 0);
    }
  }
  let oldSw = 0;
  for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
    for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) {
      if (famOf(bc.channel) === FAM) oldSw += bc.kcal || 0;
    }
  }
  let oldLoss = 0;
  for (const e of (ps.driedEvents || [])) {
    const nm = (e.before && e.before.channel) || '?';
    if (famOf(nm) === FAM && e.linked && e.lossKcal != null) oldLoss += e.lossKcal || 0;
  }
  L.oldInflow = oldIn; L.oldDraws = oldDr; L.oldSweep = oldSw; L.oldLoss = oldLoss;
  L.oldResidual = (L.closing - L.opening) - (oldIn - oldDr - oldSw - oldLoss);
  const nw = agg(() => true);
  L.newInflow = nw.inflow; L.newDraws = nw.draws; L.newSweep = nw.sweep; L.newLoss = nw.loss;
  L.newResidual = (L.closing - L.opening) - (nw.inflow - nw.draws - nw.sweep - nw.loss);
  // fresh / dried NEW sub-ledgers
  const freshIn = nw.freshIn, freshDr = nw.freshDraws, freshSw = nw.freshSweep, freshPre = nw.freshPre;
  const driedIn = nw.driedIn, driedDr = nw.driedDraws, driedSw = nw.driedSweep, driedPost = nw.driedPost;
  L.newFreshResidual = (L.closingFresh - L.openingFresh) - (freshIn - freshDr - freshSw - freshPre);
  L.newDriedResidual = (L.closingDried - L.openingDried) - (driedPost + driedIn - driedDr - driedSw);
  L._fresh = { freshIn, freshDr, freshSw, freshPre, driedIn, driedDr, driedSw, driedPost };
  // boundary: flows dated <= 100 only
  const bd = agg((fl) => fl.day <= H);
  L.bInflow = bd.inflow; L.bDraws = bd.draws; L.bSweep = bd.sweep; L.bLoss = bd.loss;
  // day-100 adjustments (only apply when the seed lived to day 100)
  if (L.lastSnapDay === 100 || ps.daysAlive >= 100) {
    for (const r of (ps.mealDrawRecords || [])) {
      if (r.day !== 100 || (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled')) continue;
      for (const it of (r.items || [])) {
        if (it.name == null || famOf(it.name) !== FAM) continue;
        L.meal100 += (it.units || 0) * (it.kcalEach || 0);
      }
    }
    for (const r of (ps.stockdoorRecords || [])) {
      if (r.day === 100 && r.name === FAM && r.kcal > 0) L.stock100 += r.kcal;
    }
  }
  for (const r of (ps.raidRecords || [])) {
    if (r.day !== L.lastSnapDay) continue;
    for (const it of (r.items || [])) {
      if (it.name == null || famOf(it.name) !== FAM) continue;
      const k = (it.units || 0) * (it.kcalEach || 0);
      L.cc100 += k; if (isDried(it.name)) L.cc100Dried += k;
    }
  }
  L.bClosing = L.closing + L.stock100 - L.meal100 - L.cc100;
  L.bResidual = (L.bClosing - L.opening) - (bd.inflow - (bd.draws) - bd.sweep - bd.loss);
  // NOTE: bd.draws already includes ALL raid draws dated <= 100 (the
  // caller-complete set), matching the analyzer's cBDraws construction
  // (bDraws + raid draws <= 100) once the shared flow list is used.
  // post-horizon family net (flows dated > last snapshot day)
  // Post-horizon net, recomputed cleanly from the raw records (the
  // shared flow list double-counts transform rows, so it is not used
  // for this figure):
  let post = 0;
  const postDay = L.lastSnapDay;
  for (const r of (ps.inflows || [])) {
    if (r.day <= postDay || r.name == null || famOf(r.name) !== FAM) continue;
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    post += r.kcal || 0;
  }
  for (const r of (ps.stockdoorRecords || [])) {
    if (r.day <= postDay || r.name !== FAM || !(r.kcal > 0)) continue;
    post += r.kcal;
  }
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.day <= postDay || (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled')) continue;
    for (const it of (r.items || [])) {
      if (it.name == null || famOf(it.name) !== FAM) continue;
      post -= (it.units || 0) * (it.kcalEach || 0);
    }
  }
  for (const r of (ps.directRecords || [])) {
    if (r.day <= postDay) continue;
    for (const it of (r.items || [])) {
      if (it.name == null || famOf(it.name) !== FAM) continue;
      post -= (it.units || 0) * (it.kcalEach || 0);
    }
  }
  for (const r of (ps.raidRecords || [])) {
    if (r.day <= postDay) continue;
    for (const it of (r.items || [])) {
      if (it.name == null || famOf(it.name) !== FAM) continue;
      post -= (it.units || 0) * (it.kcalEach || 0);
    }
  }
  for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
    if (sw.day <= postDay) continue;
    for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) {
      if (famOf(bc.channel) === FAM) post -= bc.kcal || 0;
    }
  }
  for (const e of (ps.driedEvents || [])) {
    if (e.day <= postDay) continue;
    const nm = (e.before && e.before.channel) || '?';
    if (famOf(nm) === FAM && e.linked && e.lossKcal != null) post -= e.lossKcal || 0;
  }
  L.postHorizonNet = post;
  // exclusion checks
  for (const r of (ps.directRecords || [])) if (r.retMismatch) L.directRetMismatch++;
  for (const r of (ps.raidRecords || [])) {
    if (r.retMismatch) L.raidRetMismatch++;
    const s = (r.items || []).reduce((t, it) => t + (it.units || 0) * (it.kcalEach || 0), 0);
    if (r.totalKcal !== s) L.raidRetMismatch++;
  }
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.kind !== 'pantryDraw' || r.context !== 'other') continue;
    L.otherCount++;
    if (r.want > L.otherWantMax) L.otherWantMax = r.want;
    // taken-items gap must equal the cooking bonus, never an undercount
    const s = (r.items || []).reduce((t, it) => t + (it.units || 0) * (it.kcalEach || 0), 0);
    const bonus = (r.items || []).reduce((t, it) => t + (it.units || 0) * ((it.effectiveKcal || 0) - (it.kcalEach || 0)), 0);
    if ((r.taken || 0) - s !== bonus) L.takenItemsBonusGap += Math.abs((r.taken || 0) - s - bonus);
  }
  for (const r of (ps.directRecords || [])) if (r.path === 'alien-raid') L.alienRaidRecords++;
  return L;
}

function dayFlows(ps, day) {
  // family flows on one day, by door (for the death-day trace)
  const o = { inflow: [], stockdoor: [], draws: [], total: 0 };
  for (const r of (ps.inflows || [])) {
    if (r.day !== day || r.name == null || famOf(r.name) !== FAM) continue;
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    o.inflow.push(r.kcal || 0); o.total += r.kcal || 0;
  }
  for (const r of (ps.stockdoorRecords || [])) {
    if (r.day !== day || r.name !== FAM || !(r.kcal > 0)) continue;
    o.stockdoor.push(r.kcal); o.total += r.kcal;
  }
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.day !== day || (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled')) continue;
    for (const it of (r.items || [])) {
      if (it.name == null || famOf(it.name) !== FAM) continue;
      const k = (it.units || 0) * (it.kcalEach || 0);
      o.draws.push([r.context, k]); o.total -= k;
    }
  }
  for (const r of (ps.directRecords || [])) {
    if (r.day !== day) continue;
    for (const it of (r.items || [])) {
      if (it.name == null || famOf(it.name) !== FAM) continue;
      const k = (it.units || 0) * (it.kcalEach || 0);
      o.draws.push([r.path, k]); o.total -= k;
    }
  }
  for (const r of (ps.raidRecords || [])) {
    if (r.day !== day) continue;
    for (const it of (r.items || [])) {
      if (it.name == null || famOf(it.name) !== FAM) continue;
      const k = (it.units || 0) * (it.kcalEach || 0);
      o.draws.push([r.path, k]); o.total -= k;
    }
  }
  return o;
}
function cumThrough(ps, upto) {
  let t = 0;
  const add = (day, v) => { if (day <= upto) t += v; };
  for (const r of (ps.inflows || [])) {
    if (r.name == null || famOf(r.name) !== FAM) continue;
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    add(r.day, r.kcal || 0);
  }
  for (const r of (ps.stockdoorRecords || [])) {
    if (r.name === FAM && r.kcal > 0) add(r.day, r.kcal);
  }
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
    for (const it of (r.items || [])) {
      if (it.name == null || famOf(it.name) !== FAM) continue;
      add(r.day, -((it.units || 0) * (it.kcalEach || 0)));
    }
  }
  for (const r of (ps.directRecords || [])) {
    for (const it of (r.items || [])) {
      if (it.name == null || famOf(it.name) !== FAM) continue;
      add(r.day, -((it.units || 0) * (it.kcalEach || 0)));
    }
  }
  for (const r of (ps.raidRecords || [])) {
    for (const it of (r.items || [])) {
      if (it.name == null || famOf(it.name) !== FAM) continue;
      add(r.day, -((it.units || 0) * (it.kcalEach || 0)));
    }
  }
  for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
    for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) {
      if (famOf(bc.channel) === FAM) add(sw.day, -(bc.kcal || 0));
    }
  }
  for (const e of (ps.driedEvents || [])) {
    const nm = (e.before && e.before.channel) || '?';
    if (famOf(nm) === FAM && e.linked && e.lossKcal != null) add(e.day, -(e.lossKcal || 0));
  }
  return t;
}
function snapFam(ps, idx) {
  const sd = (ps.spoilDays || [])[idx];
  if (!sd) return null;
  let t = 0, stacks = 0;
  for (const ch of (sd.channels || [])) {
    if (famOf(ch.channel) === FAM) { t += ch.freshKcal || 0; stacks += ch.stacks || 0; }
  }
  return { day: sd.day, total: t, stacks };
}

console.log('== sim-genericremainder-b proof ==');
console.log('-- row 9970 (confirm corpus, died day 16) --');
{
  const ps = loadSeed(CONFIRM, 9970);
  const L = ledger(ps);
  check('9970 boundary residual reproduces +416', L.bResidual === 416, 'bResidual=' + L.bResidual);
  check('9970 NEW residual reproduces +416', L.newResidual === 416, 'newResidual=' + L.newResidual);
  check('9970 last snapshot day is the death day (16)', L.lastSnapDay === 16 && ps.daysAlive === 16, 'lastSnapDay=' + L.lastSnapDay);
  check('9970 post-horizon family net is 0', L.postHorizonNet === 0, 'post=' + L.postHorizonNet);
  check('9970 no post-snapshot caller takes (cc100=0)', L.cc100 === 0, 'cc100=' + L.cc100);
  check('9970 no unlinked transform events', L.unlinkedEvents === 0, 'unlinked=' + L.unlinkedEvents);
  check('9970 no direct/raid ret mismatches', L.directRetMismatch === 0 && L.raidRetMismatch === 0, '');
  const snapPrev = snapFam(ps, ps.spoilDays.length - 2);
  const snapLast = snapFam(ps, ps.spoilDays.length - 1);
  check('9970 day-15 snapshot family total is 0', snapPrev && snapPrev.total === 0, JSON.stringify(snapPrev));
  check('9970 day-16 snapshot is a single 416 stack', snapLast && snapLast.total === 416 && snapLast.stacks === 1, JSON.stringify(snapLast));
  const cum15 = cumThrough(ps, 15);
  check('9970 cumulative family flows through day 15 are 0', cum15 === 0, 'cum15=' + cum15);
  const d16 = dayFlows(ps, 16);
  check('9970 day-16 family flows net 0', d16.total === 0, 'day16net=' + d16.total + ' inflow=' + JSON.stringify(d16.inflow) + ' stockdoor=' + JSON.stringify(d16.stockdoor) + ' draws=' + JSON.stringify(d16.draws));
  // closing(416) = opening(0) + cumThrough15(0) + pre16  => pre16 = 416;
  // post16 = day16net - pre16 = -416.
  const pre16 = snapLast.total - L.opening - cum15;
  const post16b = d16.total - pre16;
  check('9970 post-snapshot death-day net is -416 (mechanism closes the row)', post16b === -416, 'pre16=' + pre16 + ' post16=' + post16b);
  check('9970 mechanism kcal equals boundary residual within 1 kcal', Math.abs(-post16b - L.bResidual) <= 1, '-post16=' + (-post16b) + ' bResidual=' + L.bResidual);
}
console.log('-- row 9954 (pilot corpus, survived day 100) --');
{
  const ps = loadSeed(PILOT, 9954);
  const L = ledger(ps);
  check('9954 boundary residual reproduces +3700', L.bResidual === 3700, 'bResidual=' + L.bResidual);
  check('9954 NEW residual reproduces +5719', L.newResidual === 5719, 'newResidual=' + L.newResidual);
  check('9954 bridge: NEW + stock100 - meal100 - cc100 = boundary', L.newResidual + L.stock100 - L.meal100 - L.cc100 === L.bResidual, 'stock100=' + L.stock100 + ' meal100=' + L.meal100 + ' cc100=' + L.cc100);
  check('9954 dried sub-ledger closes exactly (0)', L.newDriedResidual === 0, 'driedResid=' + L.newDriedResidual);
  check('9954 fresh sub-ledger carries the whole NEW residual', L.newFreshResidual === 5719, 'freshResid=' + L.newFreshResidual);
  check('9954 no unlinked transform events', L.unlinkedEvents === 0, 'unlinked=' + L.unlinkedEvents);
  check('9954 no direct/raid ret mismatches', L.directRetMismatch === 0 && L.raidRetMismatch === 0, '');
  check('9954 post-horizon family net is 0', L.postHorizonNet === 0, 'post=' + L.postHorizonNet);
  check('9954 stockdoor give-kcal gap is 49 (not the residual)', L.stockdoorGive - L.stockdoorKcal === 49, 'give-kcal=' + (L.stockdoorGive - L.stockdoorKcal));
  check('9954 no feast-preview draws: max other-want < 1500 (feast cost floor)', L.otherWantMax < 1500, 'otherCount=' + L.otherCount + ' maxWant=' + L.otherWantMax);
  check('9954 taken-items gaps all equal cooking bonus (gap 0)', L.takenItemsBonusGap === 0, 'gap=' + L.takenItemsBonusGap);
  check('9954 no alien-raid direct records fired', L.alienRaidRecords === 0, 'alienRaid=' + L.alienRaidRecords);
  // hard lower bound: post-snapshot day-100 draws cannot exceed all
  // day-100 recorded draws (5419); NEW residual 5719 exceeds that, so
  // at least 5719 - 5419 = 300 kcal is unaccounted under ANY timing model.
  const d100 = dayFlows(ps, 100);
  const day100Draws = d100.draws.reduce((t, [, k]) => t + k, 0);
  check('9954 day-100 recorded draws total 5419', day100Draws === 5419, 'day100draws=' + day100Draws + ' inflow=' + JSON.stringify(d100.inflow) + ' stockdoor=' + JSON.stringify(d100.stockdoor));
  check('9954 unexplained lower bound is 300 kcal (5719 - 5419)', L.newResidual - day100Draws === 300, 'bound=' + (L.newResidual - day100Draws));
  check('9954 boundary-model unexplained is 3700', L.bResidual === 3700, '');
}
console.log('-- corroboration: death-day mechanism on pilot dead seeds --');
{
  const ps1 = loadSeed(PILOT, 9951);
  const L1 = ledger(ps1);
  const snap1 = snapFam(ps1, ps1.spoilDays.length - 1);
  const cum25 = cumThrough(ps1, 25);
  const d26 = dayFlows(ps1, 26);
  const pre26 = snap1.total - L1.opening - cum25;
  const post26 = d26.total - pre26;
  check('9951 death-day mechanism predicts +427 (same signature)', L1.bResidual === 427 && post26 === -427, 'bResidual=' + L1.bResidual + ' snap26=' + snap1.total + ' cum25=' + cum25 + ' day26net=' + d26.total + ' post26=' + post26);
  const ps3 = loadSeed(PILOT, 9953);
  const L3 = ledger(ps3);
  check('9953 death-day residual is 0 (mechanism present, invisible)', L3.bResidual === 0, 'bResidual=' + L3.bResidual);
  const ps62 = loadSeed(CONFIRM, 9962);
  const L62 = ledger(ps62);
  check('9962 death-day residual is 0 (mechanism present, invisible)', L62.bResidual === 0, 'bResidual=' + L62.bResidual);
}
console.log('checks=' + checks + ' fails=' + fails);
if (fails > 0) { console.log('PROOF: FAIL'); process.exit(1); }
console.log('PROOF: GREEN — 9970 TRACED (death-day snapshot timing, -416 post-snapshot net); 9954 UNEXPLAINED (fresh +5719 NEW / +3700 boundary, >=300 under any timing model); verdict PARTIAL (one row traced, one unexplained).');
