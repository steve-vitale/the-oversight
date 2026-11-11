// R126 PRESSHOP analyzer (journey-landing r126, Q1 combat-interrupted
// evening chain) — clone of the r121 analyzer with the H-COMBAT split.
// Usage: node analyze-landing-r126-presshop.js <before-dir> <after-dir>
//   (one dir also works: prints that corpus's counts only).
// Reads journey-landing-r62-census-*.json and counts, per corpus, from
// r41Summary.outingAttempts (in file order):
//   pressFailEvening / pressFailTotal / togetherStopped /
//   strippedSecondFails / speciesLessCorner / zeroYieldOk — as r121.
//   farUnreached / nearUnreached — from 'evening-blocked' lines, counting
//     ONLY the 'unreached' reason (r126: a hop that fails because combat
//     is active records the reason 'combat-interrupted' and does NOT count).
//   combatInterruptedNodes — 'evening-blocked' line entries with the reason
//     'combat-interrupted' (the r126 driver records these when a hop fails
//     with combat still active after the drive + retry).
//   hopClass — per hopDetail entry with reached===false: H-COMBAT (blocked
//     === 'combat-interrupted'), H-ROUTE (an engine-named block with
//     ticksLeftBefore > 0), H-HOP (dayPart advanced during the hop),
//     H-GUARD (steps hit MAX with no block named), H-OTHER.
//     Plus detourReached: reached hops whose steps exceed the Manhattan
//     home→target distance (the walk went around something).
// The Q1/Q2 verdict lines print the pre-registered comparisons; keptTotal
// comes from the outingchain analyzer (the chain verdict), not from here.
// The r126 Q1 bar: AFTER farUnreached < BEFORE farUnreached AND zero AFTER
// unreached hops with steps=0 and no named block while combat was active
// (every remaining unreached hop carries an engine-named block or a
// combat-interrupted record).
'use strict';
const fs = require('fs');
const path = require('path');

function classifyEveningLine(line) {
  const out = [];
  // Same parse as the r118 outingchain analyzer (r121 fix: the optional
  // ,sN stock suffix — "(0,0,d4,s47):unreached" — must parse, or every
  // r119+ unreached entry silently drops and farUnreached reads 0).
  const re = /\((\d+),(\d+)(?:,d(\d+))?(?:,s\d+)?\):([a-z-]+)/g;
  let m;
  while ((m = re.exec(line || '')) !== null) {
    out.push({ x: +m[1], y: +m[2], d: m[3] == null ? null : +m[3], reason: m[4] });
  }
  return out;
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(f => /census-.*\.json$/.test(f)).sort();
  const c = {
    dir, seeds: 0, attempts: 0,
    pressFailEvening: 0, pressFailTotal: 0,
    togetherStopped: 0, stoppedList: [],
    strippedSecondFails: 0, strippedList: [],
    speciesLessCorner: 0, speciesList: [],
    zeroYieldOk: 0, zeroYieldGreen0: 0, zeroYieldGreenPos: 0, zeroYieldGreenNull: 0,
    farUnreached: 0, nearUnreached: 0,
    combatInterruptedNodes: 0, combatList: [],
    hopUnreached: 0, hopCombat: 0, hopRoute: 0, hopHop: 0, hopGuard: 0, hopOther: 0,
    hopReached: 0, detourReached: 0, detourList: [],
  };
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const seed = d.seed;
    const attempts = (d.r41Summary || {}).outingAttempts || [];
    c.seeds++;
    c.attempts += attempts.length;
    // Last ok press per seed/day/vid/node, for the stripped-second shape.
    const lastOk = {};
    for (const a of attempts) {
      const key = [seed, a.day, a.vid, a.node && a.node.x, a.node && a.node.y].join(':');
      if (a.kind === 'together' && !a.ok) {
        c.pressFailTotal++;
        if (a.via === 'evening') c.pressFailEvening++;
        if (a.press === 1) {
          const prev = lastOk[key];
          if (prev && prev.press === 0 && prev.pressYield === 0 && prev.green3x3After === 0) {
            c.strippedSecondFails++;
            c.strippedList.push(`seed ${seed} d${a.day} ${a.name || a.vid} (${a.node && a.node.x},${a.node && a.node.y})`);
          }
        }
      } else if (a.kind === 'together' && a.ok) {
        lastOk[key] = a;
        if (a.pressYield === 0) {
          c.zeroYieldOk++;
          if (a.green3x3After === 0) c.zeroYieldGreen0++;
          else if (a.green3x3After != null && a.green3x3After > 0) c.zeroYieldGreenPos++;
          else c.zeroYieldGreenNull++;
          if (a.press === 0 && a.green3x3After != null && a.green3x3After > 0) {
            c.speciesLessCorner++;
            c.speciesList.push(`seed ${seed} d${a.day} ${a.name || a.vid} (${a.node && a.node.x},${a.node && a.node.y}) g3After=${a.green3x3After}`);
          }
        }
      } else if (a.kind === 'together-stopped') {
        c.togetherStopped++;
        c.stoppedList.push(`seed ${seed} d${a.day} ${a.name || a.vid} (${a.node && a.node.x},${a.node && a.node.y}) g3After=${a.node && a.node.green3x3}`);
      } else if (a.kind === 'evening-blocked') {
        for (const e of classifyEveningLine(a.line)) {
          if (e.reason === 'unreached') { if (e.d != null && e.d > 3) c.farUnreached++; else c.nearUnreached++; }
          else if (e.reason === 'combat-interrupted') {
            c.combatInterruptedNodes++;
            c.combatList.push(`seed ${seed} d${a.day} ${a.name || a.vid} (${e.x},${e.y},d${e.d})`);
          }
        }
        for (const h of (a.hopDetail || [])) {
          if (h.reached) {
            c.hopReached++;
            const from = h.from || {};
            if (Number.isFinite(from.x) && Number.isFinite(h.tx)) {
              const man = Math.abs(h.tx - from.x) + Math.abs(h.ty - from.y);
              if ((h.steps || 0) > man) {
                c.detourReached++;
                c.detourList.push(`seed ${seed} d${a.day} (${h.tx},${h.ty}) steps=${h.steps} manhattan=${man}`);
              }
            }
          } else {
            c.hopUnreached++;
            // R126 H-COMBAT: the hop failed with combat active (driver
            // recorded blocked === 'combat-interrupted'). This is a chain
            // interrupted by a fight, not a routing failure — it must not
            // count as H-ROUTE/H-OTHER and its node must not count as
            // far-unreached (the line reason is 'combat-interrupted').
            if (h.blocked === 'combat-interrupted') c.hopCombat++;
            else if (h.blocked && (h.ticksLeftBefore == null || h.ticksLeftBefore > 0)) c.hopRoute++;
            else if (h.dayPartBefore != null && h.dayPartAfter != null && h.dayPartAfter > h.dayPartBefore) c.hopHop++;
            else if ((h.steps || 0) >= 16 && !h.blocked) c.hopGuard++;
            else c.hopOther++;
          }
        }
      }
    }
  }
  return c;
}

function printCorpus(label, c) {
  console.log(`\n=== ${label} (${c.dir}) ===`);
  console.log(`seeds=${c.seeds} attempts=${c.attempts}`);
  console.log(`Q1: pressFailEvening=${c.pressFailEvening} pressFailTotal=${c.pressFailTotal} strippedSecondFails=${c.strippedSecondFails} togetherStopped=${c.togetherStopped} speciesLessCorner=${c.speciesLessCorner}`);
  console.log(`Q1: zeroYieldOk=${c.zeroYieldOk} (green3x3After 0:${c.zeroYieldGreen0} >0:${c.zeroYieldGreenPos} null:${c.zeroYieldGreenNull})`);
  if (c.strippedList.length) console.log('  stripped 2nd-press fails: ' + c.strippedList.join(' | '));
  if (c.stoppedList.length) console.log('  together-stopped: ' + c.stoppedList.join(' | '));
  if (c.speciesList.length) console.log('  species-less corner: ' + c.speciesList.join(' | '));
  console.log(`Q2: farUnreached=${c.farUnreached} nearUnreached=${c.nearUnreached} combatInterruptedNodes=${c.combatInterruptedNodes} hopUnreached=${c.hopUnreached} (H-COMBAT:${c.hopCombat} H-ROUTE:${c.hopRoute} H-HOP:${c.hopHop} H-GUARD:${c.hopGuard} H-OTHER:${c.hopOther}) hopReached=${c.hopReached} detourReached=${c.detourReached}`);
  if (c.combatList.length) console.log('  combat-interrupted nodes: ' + c.combatList.join(' | '));
  if (c.detourList.length) console.log('  detour reaches: ' + c.detourList.join(' | '));
}

const dirs = process.argv.slice(2);
if (!dirs.length) { console.error('usage: node analyze-landing-r121-presshop.js <before-dir> [<after-dir>]'); process.exit(2); }
const before = analyzeDir(dirs[0]);
printCorpus('BEFORE', before);
let after = null;
if (dirs[1]) {
  after = analyzeDir(dirs[1]);
  printCorpus('AFTER', after);
  console.log('\n=== BEFORE/AFTER (matched seeds) ===');
  console.log(`Q1 pressFailEvening: ${before.pressFailEvening} -> ${after.pressFailEvening} (bar AFTER <= 2)`);
  console.log(`Q1 strippedSecondFails: ${before.strippedSecondFails} -> ${after.strippedSecondFails} (bar AFTER 0)`);
  console.log(`Q1 togetherStopped: ${before.togetherStopped} -> ${after.togetherStopped} (bar AFTER >= 1 with g3After 0)`);
  console.log(`Q2 farUnreached: ${before.farUnreached} -> ${after.farUnreached} (bar AFTER < BEFORE, or both 0 = UNTESTED)`);
  console.log(`Q2 combatInterruptedNodes: ${before.combatInterruptedNodes} -> ${after.combatInterruptedNodes} (BEFORE must be 0 — the reason is new in r126; AFTER counts chains that stayed interrupted after the drive + retry)`);
  console.log(`Q2 hop classes AFTER: H-COMBAT:${after.hopCombat} H-ROUTE:${after.hopRoute} H-HOP:${after.hopHop} H-GUARD:${after.hopGuard} H-OTHER:${after.hopOther} (every AFTER unreached hop must carry an engine-named block or a combat-interrupted record)`);
  if (after.pressFailEvening <= 2 && after.strippedSecondFails === 0 && after.togetherStopped >= 1) {
    console.log('Q1: DOUBLE-PRESS-STOP-WORKS (keptTotal >= 1 still owed from the outingchain analyzer)');
  } else {
    console.log('Q1: NOT-MET (see counts above — adjudicate in the run note, do not re-score)');
  }
  if (before.farUnreached === 0 && after.farUnreached === 0) {
    console.log('Q2: UNTESTED (no unreached far nodes on either corpus — carried)');
  } else if (after.farUnreached < before.farUnreached) {
    console.log('Q2: COMBAT-FIX-HELPS (fewer unreached far nodes after driving the interrupting fight)');
  } else {
    console.log('Q2: NOT-MET (unreached far did not fall — adjudicate by case in the run note)');
  }
}
