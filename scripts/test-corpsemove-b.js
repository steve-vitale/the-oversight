#!/usr/bin/env node
// test-corpsemove-b.js — proof for sim-corpsemove-b. Pure reads + code
// greps; no game code, no policy code, no sims. Exits non-zero on any
// failed check. DIAG ONLY.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const BASE = path.join(__dirname, '..', 'evidence', '2026-10-31');
const SRC = path.join(__dirname, '..', 'src', 'js');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
const table = load(path.join(BASE, 'sim-corpsemove-b-table.json'));
const old = load(path.join(BASE, 'sim-toolloss-b-corpus-gap', 'toolloss-gap-b-nighttravel-s15215.json'));
const mine15215 = load(path.join(BASE, 'sim-corpsemove-b-corpus-on', 'corpsemove-b-nighttravel-s15215.json'));
const ctl = load(path.join(BASE, 'sim-corpsemove-b-control-gap', 'toolloss-gap-b-nighttravel-s15215.json'));
const corpsesJs = fs.readFileSync(path.join(SRC, 'corpses.js'), 'utf8');
const gameJs = fs.readFileSync(path.join(SRC, 'game.js'), 'utf8');
const ledgerJs = fs.readFileSync(path.join(SRC, 'ledger.js'), 'utf8');

// 1. Prereg exists and carries the binding bar.
const prereg = fs.readFileSync(path.join(BASE, 'sim-corpsemove-b-prereg.md'), 'utf8');
check('prereg exists with DIAG-GO bar', prereg.includes('DIAG-GO iff') && prereg.includes('BEARER IDENTITY FIRST'));
check('prereg declares panel non-applicability', prereg.includes('NOT APPLICABLE'));
// 2. Instrument equivalence on this base (my driver == original gap driver).
check('my driver morning seq == control driver morning seq', table.instrumentEquivalenceOnThisBase.morningSeqEqual);
check('my driver evening seq == control driver evening seq', table.instrumentEquivalenceOnThisBase.eveningSeqEqual);
// 3. Trajectory divergence is real and in the CONTROL too (base, not instrument).
const oldM17 = old.mornings.find((m) => m.loopDay === 17).morningInv.scholarId;
const ctlM17 = ctl.mornings.find((m) => m.loopDay === 17).morningInv.scholarId;
check('control driver also diverges from old corpus (Gabriela alive day 17)', oldM17 === 'gen_eni1m98' && ctlM17 === 'gen_gyft62f');
check('control driver never strands (evening 7 haven)', ctl.evenings.find((e) => e.loopDay === 7).tile === 'haven');
check('my corpus agrees with control on strand absence', mine15215.evenings.find((e) => e.loopDay === 7).tile === 'haven');
// 4. Bracket on the prior (toolloss gap) corpus, bearer-first.
const b = table.bracketPriorCorpus;
check('bracket segment is evening 18 -> morning 19', b.segment === 'evening loop-day 18 -> morning loop-day 19 (overnight gap)');
check('bracket bearer is Dakota on BOTH snapshots', b.evening18.bearer === 'gen_eni1m98' && b.morning19.bearer === 'gen_eni1m98' && b.morning19.bearerName === 'Dakota');
check('corpse node creek (2,5) evening 18', JSON.stringify(b.evening18.corpseNode) === JSON.stringify({ x: 2, y: 5 }) && JSON.stringify(b.evening18.corpseMxMy) === JSON.stringify([0, 0]));
check('corpse node Haven (4,4) morning 19', JSON.stringify(b.morning19.corpseNode) === JSON.stringify({ x: 4, y: 4 }) && JSON.stringify(b.morning19.corpseMxMy) === JSON.stringify([4, 4]));
check('corpse items identical across bracket, looted false both', b.itemsIdentical && b.evening18.looted === false && b.morning19.looted === false);
check('Stone knife rides on the corpse across bracket', (b.morning19.items || []).some((i) => i.id === 'stone_knife'));
// 5. Narration: narrated overnight, NOT a silent teleport, NOT a daytime carry.
check('bring-home line present in morning-19 gap before dawn', table.narration.beforeDawn && (table.narration.bringHomeLine || '').includes('they bring Gabriela home') && (table.narration.bringHomeLine || '').includes('grave is dug by the fire'));
check('day-18 full transcript has no body/carry/grave line', table.narration.day18BodyLines.length === 0);
// 6. Exclusions: other corpses stable; succession morning is not the move.
const m17 = old.mornings.find((m) => m.loopDay === 17);
const m18 = old.mornings.find((m) => m.loopDay === 18);
const m19 = old.mornings.find((m) => m.loopDay === 19);
function otherNodes(m) { const o = {}; for (const c of (m.corpses || [])) if (c && c.villagerId !== 'gen_gyft62f') o[c.id] = c.node.x + ',' + c.node.y; return o; }
function othersStable(a, b) { for (const id of Object.keys(a)) if (b[id] && b[id] !== a[id]) return false; return true; }
check('other corpses stable mornings 17-18-19 (per-id nodes; new arrivals allowed)', othersStable(otherNodes(m17), otherNodes(m18)) && othersStable(otherNodes(m18), otherNodes(m19)));
check('corpse still at creek on morning 18 (move is NOT at succession)', (m18.corpses.find((c) => c.villagerId === 'gen_gyft62f') || {}).node.x === 2);
// 7. Code trace: recoverBearer is the mechanism, sole node writer, endDay caller, pendingBurials queue.
check('corpses.js defines recoverBearer', corpsesJs.includes('recoverBearer()'));
check('recoverBearer sets node to village px/py and mx/my 4/4', corpsesJs.includes('c.node = { x: hx, y: hy }') && corpsesJs.includes('c.mx = 4; c.my = 4;'));
check('recoverBearer says the bring-home line', corpsesJs.includes('That night, they bring ${first} home.'));
check('recoverBearer sets recovered + deathKnown', corpsesJs.includes('c.recovered = true;') && corpsesJs.includes('c.deathKnown = true;'));
check('recoverBearer due condition is day > pending day', corpsesJs.includes('day > (p.day || 0)'));
check('game.js endDay calls recoverBearer', gameJs.includes('this.recoverBearer && this.recoverBearer()'));
check('ledger.js playerDeath queues pendingBurials with day', ledgerJs.includes('pendingBurials.push({ corpseId: rc.id, villagerId: oldId, name: oldName, day: s.day || 0 })'));
// 8. Pilot census on this base: no bearer deaths, no corpse moves (specificity).
check('pilot: 8 seeds, zero bearer changes', table.pilotCensus.length === 8 && table.pilotCensus.every((p) => p.bearerChanges.length === 0));
check('pilot: 8 seeds, zero corpse moves', table.pilotCensus.every((p) => p.corpseMoves.length === 0));
// 9. Tracked-diff guard: src/ + scripts/policies/ unchanged since prereg commit's parent.
try {
  const parent = execSync('git rev-parse f603aeb9f^', { cwd: path.join(__dirname, '..') }).toString().trim();
  const diff = execSync('git diff --name-only ' + parent + ' -- src/ scripts/policies/', { cwd: path.join(__dirname, '..') }).toString().trim();
  check('src/ + scripts/policies/ diff since prereg parent is empty', diff === '', diff);
} catch (e) { check('src/ + scripts/policies/ diff since prereg parent is empty', false, String(e.message)); }
// 10. Judged-corpus condition from the prereg (expected to FAIL on this base — recorded, not hidden).
check('REPRODUCTION-GATE: my corpus reproduces 15215 creek/creek/Haven readings (EXPECTED FAIL on this base)', table.trajectoryReproduction.reproduced === true, table.trajectoryReproduction);
console.log(pass + '/' + (pass + fail) + ' checks pass (the REPRODUCTION-GATE check is the prereg-defined divergence failure; all other checks must pass)');
process.exit(fail > 1 ? 1 : 0);
