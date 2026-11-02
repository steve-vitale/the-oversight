#!/usr/bin/env node
// test-sumdeploy-compare-a.js — corpus-only validator for sim-sumdeploy-a.
// Compares the deploy replay corpus (game-side Game.titanCallReadiness)
// against the sumtrigger pilot corpus (policy projection) on identical
// seeds, field by field. No game load. Prereg:
// evidence/2026-11-02/sim-sumdeploy-a-prereg.md (GO bar 1: readiness
// exact; GO bar 2: fight conversion; GO bar 3: guardrails).
// Usage: node scripts/test-sumdeploy-compare-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DEPLOY_DIR = process.env.SUMDEPLOY_DEPLOY_DIR || path.join(REPO, 'evidence', '2026-11-02', 'perseed-sumdeploy-a');
const POLICY_DIR = process.env.SUMDEPLOY_POLICY_DIR || path.join(REPO, 'evidence', '2026-11-02', 'perseed-sumtrigger-a');
const SEEDS = [90111, 95411, 95423, 95425, 95434, 95437, 95438, 95446];
let fails = 0, checks = 0;
function check(name, cond, detail) {
  checks++;
  if (cond) console.log('ok ' + name);
  else { fails++; console.log('FAIL ' + name + (detail !== undefined ? ' :: ' + JSON.stringify(detail) : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

const wallDeploy = { national: 0, table: 0, won: 0, wave4: 0, wave5: 0, days: [] };
const wallPolicy = { national: 0, table: 0, won: 0, wave4: 0, wave5: 0, days: [] };
const endsDeploy = {}, endsPolicy = {};

for (const seed of SEEDS) {
  const dPath = path.join(DEPLOY_DIR, 'pilot-s' + seed + '.json');
  const pPath = path.join(POLICY_DIR, 'pilot-s' + seed + '.json');
  if (!fs.existsSync(dPath)) { fails++; console.log('FAIL missing deploy corpus seed ' + seed); continue; }
  if (!fs.existsSync(pPath)) { fails++; console.log('FAIL missing policy corpus seed ' + seed); continue; }
  const d = JSON.parse(fs.readFileSync(dPath, 'utf8'));
  const p = JSON.parse(fs.readFileSync(pPath, 'utf8'));
  const dp = d.post || {}, pp = p.post || {};
  check('s' + seed + ' triggerDefined equal', d.triggerDefined === p.triggerDefined, { deploy: d.triggerDefined, policy: p.triggerDefined });
  if (d.triggerDefined) {
    check('s' + seed + ' trigger day equal', dp.day === pp.day, { deploy: dp.day, policy: pp.day });
    check('s' + seed + ' projectedAllies equal', dp.projectedAllies === pp.projectedAllies, { deploy: dp.projectedAllies, policy: pp.projectedAllies });
    check('s' + seed + ' projectedHaven equal', dp.projectedHaven === pp.projectedHaven, { deploy: dp.projectedHaven, policy: pp.projectedHaven });
    check('s' + seed + ' projectedTotal equal', dp.projectedTotal === pp.projectedTotal, { deploy: dp.projectedTotal, policy: pp.projectedTotal });
    check('s' + seed + ' naiveTotalAtTrigger equal', dp.naiveTotalAtTrigger === pp.naiveTotalAtTrigger, { deploy: dp.naiveTotalAtTrigger, policy: pp.naiveTotalAtTrigger });
    check('s' + seed + ' projectedAllies == soundedAllies (game)', dp.projectedAllies === dp.actualAllies, { proj: dp.projectedAllies, actual: dp.actualAllies });
    check('s' + seed + ' sounded allies equal', dp.actualAllies === pp.actualAllies, { deploy: dp.actualAllies, policy: pp.actualAllies });
    check('s' + seed + ' havenAfter equal', dp.havenAfter === pp.havenAfter, { deploy: dp.havenAfter, policy: pp.havenAfter });
    check('s' + seed + ' readyAfter equal', dp.readyAfter === pp.readyAfter, { deploy: dp.readyAfter, policy: pp.readyAfter });
    check('s' + seed + ' link count unchanged by call', dp.linkCountBefore === dp.linkCountAfter && dp.linkCountBefore != null, { before: dp.linkCountBefore, after: dp.linkCountAfter });
    check('s' + seed + ' responders verified', dp.respondersVerified === true && (dp.responderProblems || []).length === 0, dp.responderProblems);
    check('s' + seed + ' instrument errors 0', (d.instrumentErrors || []).length === 0 && (dp.interceptorErrors || []).length === 0, { inst: d.instrumentErrors, inter: dp.interceptorErrors });
    check('s' + seed + ' muster-diag errs 0', (d.musterErrs || 0) === 0, d.musterErrs);
    const dfo = d.fightOutcome || {}, pfo = p.fightOutcome || {};
    check('s' + seed + ' fought same day as trigger', eq(dfo.foughtSameDay, [dp.day]) && eq(pfo.foughtSameDay, [pp.day]), { deploy: dfo.foughtSameDay, policy: pfo.foughtSameDay });
    check('s' + seed + ' herald slain both', dfo.heraldSlain === true && pfo.heraldSlain === true, { deploy: dfo.heraldSlain, policy: pfo.heraldSlain });
  } else {
    check('s' + seed + ' never ready: max faithful total equal', d.maxFaithfulTotal === p.maxFaithfulTotal, { deploy: d.maxFaithfulTotal, policy: p.maxFaithfulTotal });
  }
  // Projection trajectories, row by row, per-link field by field.
  const dt = d.projectionTrajectory || [], pt = p.projectionTrajectory || [];
  check('s' + seed + ' projection row count equal', dt.length === pt.length, { deploy: dt.length, policy: pt.length });
  const nrows = Math.min(dt.length, pt.length);
  let rowFails = 0;
  for (let i = 0; i < nrows; i++) {
    const dr = dt[i], pr = pt[i];
    const rowOk = dr.day === pr.day && dr.alliesProj === pr.alliesProj && dr.havenProj === pr.havenProj &&
      dr.total === pr.total && dr.naiveTotal === pr.naiveTotal && dr.ready === pr.ready &&
      eq((dr.generatedNow || []).map(function (g) { return g.villageId; }), (pr.generatedNow || []).map(function (g) { return g.villageId; })) &&
      eq((dr.links || []).map(function (l) { return [l.villageId, l.trust, l.opinion, l.arrears, l.quota, l.already, l.snapFree, l.generatedHere, l.freeAdults, l.wouldRefuse, l.contribution, l.naiveContribution]; }),
        (pr.links || []).map(function (l) { return [l.villageId, l.trust, l.opinion, l.arrears, l.quota, l.already, l.snapFree, l.generatedHere, l.freeAdults, l.wouldRefuse, l.contribution, l.naiveContribution]; }));
    if (!rowOk) { rowFails++; if (rowFails <= 2) console.log('FAIL s' + seed + ' row ' + i + ' :: deploy=' + JSON.stringify(dr) + ' policy=' + JSON.stringify(pr)); }
  }
  check('s' + seed + ' all projection rows equal', rowFails === 0, { rowFails: rowFails, rows: nrows });
  wallDeploy.national += d.national || 0; wallDeploy.table += d.table || 0; wallDeploy.won += d.won || 0;
  wallDeploy.wave4 += d.wave4 || 0; wallDeploy.wave5 += d.wave5 || 0; wallDeploy.days.push(d.gameDays || 0);
  wallPolicy.national += p.national || 0; wallPolicy.table += p.table || 0; wallPolicy.won += p.won || 0;
  wallPolicy.wave4 += p.wave4 || 0; wallPolicy.wave5 += p.wave5 || 0; wallPolicy.days.push(p.gameDays || 0);
  endsDeploy[d.endReason || '?'] = (endsDeploy[d.endReason || '?'] || 0) + 1;
  endsPolicy[p.endReason || '?'] = (endsPolicy[p.endReason || '?'] || 0) + 1;
}
function median(a) { const s = a.slice().sort(function (x, y) { return x - y; }); return (s[3] + s[4]) / 2; }
console.log('WALL deploy: national ' + wallDeploy.national + '/8 table ' + wallDeploy.table + '/8 won ' + wallDeploy.won + '/8 wave4 ' + wallDeploy.wave4 + '/8 wave5 ' + wallDeploy.wave5 + '/8 median ' + median(wallDeploy.days) + 'd max ' + Math.max.apply(null, wallDeploy.days) + 'd ends ' + JSON.stringify(endsDeploy));
console.log('WALL policy: national ' + wallPolicy.national + '/8 table ' + wallPolicy.table + '/8 won ' + wallPolicy.won + '/8 wave4 ' + wallPolicy.wave4 + '/8 wave5 ' + wallPolicy.wave5 + '/8 median ' + median(wallPolicy.days) + 'd max ' + Math.max.apply(null, wallPolicy.days) + 'd ends ' + JSON.stringify(endsPolicy));
console.log('SUMDEPLOY-COMPARE checks=' + checks + ' fails=' + fails);
if (fails) process.exit(1);
