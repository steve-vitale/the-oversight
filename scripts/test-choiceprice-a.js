#!/usr/bin/env node
// scripts/test-choiceprice-a.js — sim-choiceprice-a proof test
// (scale-onramp axis, 2026-10-26: the choice-price gap. DIAG
// ONLY, zero src/js changes. This test reads the STORED corpus
// in evidence/2026-10-26/perseed-sim-choiceprice-a/ plus the
// engine source strings it quotes; it runs NO sims and judges
// nothing the evidence header did not pre-register. Exit 1 on
// any failure; prints "PASSED n / FAILED 0" on success.)
//
// PRE-REGISTERED DIAG-GO legs (evidence header):
//   (i) forfeiture event with day + quoted choice text on
//       >= 4/5 collapsed seeds (73903, 73904, 73906, 73907,
//       73908 — anchor-invited, hunt-not, per hunttable);
//   (ii) surface inventory covers >= 6 surfaces with verbatim
//        quotes or explicit absence (8 inventoried; the static
//        legs below pin the 4 code-quoted surfaces);
//   (iii) recorder-neutrality det-gate PASS on pilot seed 73901
//        (plain vs wrapped identical; hunttable-row reproduction
//        is reported as a base-drift control disagreement, not
//        smoothed — see the evidence file's control section).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-choiceprice-a');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; }
  else { failed++; fails.push(name + (extra ? ' :: ' + extra : '')); console.log(`  FAIL: ${name}${extra ? ' :: ' + extra : ''}`); }
}
function row(seed) {
  return JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-choiceprice-hunt.json`), 'utf8'));
}
const SEEDS = [73901, 73902, 73903, 73904, 73905, 73906, 73907, 73908];
const COLLAPSED = [73903, 73904, 73906, 73907, 73908];
const rows = {};
for (const s of SEEDS) rows[s] = row(s);

// --- Corpus integrity.
for (const s of SEEDS) {
  const r = rows[s];
  check(`row s${s} days>0`, r.days > 0, `days=${r.days}`);
  check(`row s${s} recorder errors 0`, (r.choiceprice.errs || []).length === 0, JSON.stringify(r.choiceprice.errs || []));
  check(`row s${s} recorder installed all 5`, ['say', 'grant', 'driveoff', 'face', 'clear'].every(k => r.choiceprice.installed[k]), JSON.stringify(r.choiceprice.installed));
}
// --- Det-gate (leg iii, neutrality substance).
const dg = JSON.parse(fs.readFileSync(path.join(EVID, 'detgate.json'), 'utf8'));
check('detgate match', dg.match === true, JSON.stringify(dg));
check('detgate wrapped days 29', dg.wrapped.days === 29, `days=${dg.wrapped.days}`);
check('detgate wrapped deaths 11', dg.wrapped.deaths === 11, `deaths=${dg.wrapped.deaths}`);
check('detgate wrapped won 0', dg.wrapped.won === 0);
check('detgate wrapped ts null', dg.wrapped.ts == null, `ts=${dg.wrapped.ts}`);
// --- Per-seed draw counts (fresh grants with a draw).
const expDraws = { 73901: 0, 73902: 2, 73903: 8, 73904: 7, 73905: 8, 73906: 0, 73907: 1, 73908: 8 };
for (const s of SEEDS) {
  check(`s${s} draws=${expDraws[s]}`, rows[s].counts.draws === expDraws[s], `got ${rows[s].counts.draws}`);
  check(`s${s} faces=0 (all draws driven off)`, rows[s].counts.faces === 0, `faces=${rows[s].counts.faces}`);
  check(`s${s} driveoffs=draws`, rows[s].counts.driveoffs === expDraws[s], `driveoffs=${rows[s].counts.driveoffs}`);
}
const totalDraws = SEEDS.reduce((t, s) => t + rows[s].counts.draws, 0);
check('corpus draws total 34', totalDraws === 34, `got ${totalDraws}`);
// --- Completed forfeitures: driveoff ok, deed false before AND
// after, and the deed never rescued inside that buff's window
// (surge day null, or surge day after the grant's untilDay).
function completedForfeits(r) {
  const out = [];
  for (const d of (r.choiceprice.driveoffs || [])) {
    if (!d.ok) continue;
    if (d.before.feastSurgeUsed || d.after.feastSurgeUsed) continue;
    const g = (r.choiceprice.grants || []).find(x => x.day === d.day && x.draw);
    const until = g ? g.untilDay : null;
    const surge = r.firsts.barSurgeDay;
    const rescued = surge != null && until != null && surge <= until;
    if (!rescued) out.push(d);
  }
  return out;
}
const expForfeits = { 73901: 0, 73902: 2, 73903: 8, 73904: 7, 73905: 5, 73906: 0, 73907: 1, 73908: 8 };
for (const s of SEEDS) {
  const cf = completedForfeits(rows[s]);
  check(`s${s} completed forfeits=${expForfeits[s]}`, cf.length === expForfeits[s], `got ${cf.length}`);
  for (const d of cf) {
    check(`s${s} forfeit d${d.day} deed F->F`, d.before.feastSurgeUsed === false && d.after.feastSurgeUsed === false);
    check(`s${s} forfeit d${d.day} offer quoted`, typeof d.offerText === 'string' && /Face it while the feast is in you/.test(d.offerText), 'offer missing or unquoted');
    check(`s${s} forfeit d${d.day} driveoff line quoted`, (d.driveoffLines || []).some(t => /The devotion stays armed/.test(t)), 'driveoff line missing');
  }
}
const totalForfeits = SEEDS.reduce((t, s) => t + completedForfeits(rows[s]).length, 0);
check('corpus completed forfeits total 31', totalForfeits === 31, `got ${totalForfeits}`);
// --- Leg (i): collapsed coverage >= 4/5 with day + quoted text.
let covered = 0;
for (const s of COLLAPSED) {
  const cf = completedForfeits(rows[s]);
  const ok = cf.some(d => d.day != null && typeof d.offerText === 'string' && /Face it while the feast is in you/.test(d.offerText));
  if (ok) covered++;
  console.log(`  collapsed s${s}: completedForfeits=${cf.length} quotedCovered=${ok}`);
}
check('leg (i) collapsed coverage >= 4/5', covered >= 4, `covered=${covered}/5`);
check('leg (i) 73906 zero-draw leg explicit', completedForfeits(rows[73906]).length === 0 && rows[73906].counts.draws === 0, '73906 must show NO choice presented, not a silent forfeit');
// --- The 73905 rescue: driveoff d96 followed by surge day 97
// inside the same window (untilDay 98) with faces 0 — a driven
// draw need not forfeit when another fight spends the surge.
const r05 = rows[73905];
check('73905 surge day 97', r05.firsts.barSurgeDay === 97, `got ${r05.firsts.barSurgeDay}`);
check('73905 faces 0 despite surge', r05.counts.faces === 0);
const d96 = (r05.choiceprice.driveoffs || []).find(d => d.day === 96 && d.ok);
check('73905 d96 driveoff exists, deed F->F', !!d96 && d96.before.feastSurgeUsed === false && d96.after.feastSurgeUsed === false);
const g96 = (r05.choiceprice.grants || []).find(x => x.day === 96 && x.draw);
check('73905 d96 window untilDay 98 covers surge 97', !!g96 && g96.untilDay === 98, `untilDay=${g96 ? g96.untilDay : 'none'}`);
// --- Naming leg: no village's captured say lines name the deed
// in the draw-choice context (same regex as the sweep summary).
let naming = 0;
for (const s of SEEDS) {
  const hit = (rows[s].choiceprice.sayLines || []).some(x =>
    /circling|drive off|drove off/i.test(x.text) && /deed|table.*price|pric.*table|feastSurgeUsed|surge.*deed/i.test(x.text));
  if (hit) naming++;
}
check('villages with choice-context deed naming 0/8', naming === 0, `naming=${naming}`);
// --- Static legs (leg ii support): the quoted surfaces exist
// in code exactly as the evidence quotes them.
const feastBuff = fs.readFileSync(path.join(REPO, 'src/js/feastBuff.js'), 'utf8');
check('static: draw offer text in feastBuff.js', feastBuff.includes('Face it while the feast is in you — or let the watch drive it off.'));
check('static: driveoff line in feastBuff.js', feastBuff.includes('The devotion stays armed; the feast\'s fire still burns in you.'));
check('static: grant line names no deed', /Strikes and abilities hit with the feast behind them\./.test(feastBuff));
const prog = fs.readFileSync(path.join(REPO, 'src/js/progression.js'), 'utf8');
check('static: seat-waiting flicker names food-thesis deeds', prog.includes('the food-thesis deeds') && prog.includes('The ledger still wants:'));
check('static: pellet flicker variant exists', prog.includes('NO FEAST, NO SURGE, NOTHING HERE WE CAN PRICE'));
const table = fs.readFileSync(path.join(REPO, 'src/js/table.js'), 'utf8');
check('static: lesser seat prices foodDeeds conjunction', table.includes('pg.sentimentTaught && s.prog && s.prog.feastSurgeUsed'));
check('static: lesser seat line never names food deeds', (() => {
  const i = table.indexOf('tableSeatLine(seat)');
  const j = table.indexOf('tableWithdrawLine', i);
  if (i < 0 || j < 0) return false;
  const span = table.slice(i, j);
  const m = span.match(/return `A lesser seat[^`]*`/);
  return !!m && !/food|deed/i.test(m[0]);
})(), 'lesser seat line must not name the food deeds');
// --- Band headlines on the current base (reported, not judged).
const band = {
  won: SEEDS.reduce((t, s) => t + rows[s].won, 0),
  natEver: SEEDS.reduce((t, s) => t + rows[s].nationalEver, 0),
  table: SEEDS.reduce((t, s) => t + rows[s].table, 0),
  entered: SEEDS.reduce((t, s) => t + rows[s].entered, 0),
  arc4: SEEDS.filter(s => (rows[s].maxArc || 1) >= 4).length,
  wave4: SEEDS.filter(s => (rows[s].waveReach || 1) >= 4).length,
  wave5: SEEDS.filter(s => (rows[s].waveReach || 1) >= 5).length,
  deaths: SEEDS.reduce((t, s) => t + rows[s].deathTotal, 0),
};
check('band won 1/8', band.won === 1, `won=${band.won}`);
check('band natEver 7/8', band.natEver === 7, `natEver=${band.natEver}`);
check('band table 1/8', band.table === 1, `table=${band.table}`);
check('band entered 1/8', band.entered === 1, `entered=${band.entered}`);
check('band arc4 1/8', band.arc4 === 1, `arc4=${band.arc4}`);
check('band wave4 5/8', band.wave4 === 5, `wave4=${band.wave4}`);
check('band wave5 0/8', band.wave5 === 0, `wave5=${band.wave5}`);
check('band deaths 240', band.deaths === 240, `deaths=${band.deaths}`);
// --- GO computation (legs i + iii-neutrality; leg ii is the
// evidence inventory count, 8 surfaces, asserted by the static
// legs above + the inventory section).
const GO = covered >= 4 && dg.match === true;
check('DIAG-GO computation', GO === true, `covered=${covered} detgate=${dg.match}`);
console.log(`\n  choiceprice-a proof: PASSED ${passed} / FAILED ${failed}`);
if (failed) { console.log(`  failures:\n  - ${fails.join('\n  - ')}`); process.exit(1); }
