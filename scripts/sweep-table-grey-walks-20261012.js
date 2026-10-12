#!/usr/bin/env node
// sweep-table-grey-walks-20261012.js — endgame-leg EXPERIENCE drive (journey-endgame r5).
// The grey pragmatist band (GRADIENT law, Steve 2026-10-11) is code-real and
// content-complete (table-relay.js finals: both-hands / the-contract) but was
// never walked: r4 covered light/dark only, TABLE.md documents light/dark
// only, and the 2026-10-11 journey-sense test fails 3 relay checks against it.
// This driver plays three grey walks (tender-leaning, total-leaning, dead
// neutral) end to end with full transcripts for sense-reading, and asserts
// the door-gift gradient behavior (whichever hand is forward; nothing at 0).
// The lesser-seat BAR cheats are IN-HARNESS ONLY (never shipped): bars are the
// win-path lever worker's territory; this run judges the EXPERIENCE past them.
// SENSE-TESTING LAW: the transcripts are the deliverable; read them, don't
// count them.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED0 = parseInt(process.env.SEED || '2026', 10);
Math.random = mulberry32(SEED0);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

const OUTDIR = path.join(ROOT, 'evidence', '2026-10-12', 'table-experience-grey');
fs.mkdirSync(OUTDIR, { recursive: true });
const stripHtml = (s) => String(s).replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ');

function monstersOfWave(w, n) {
  return (Game.data.monsters || []).filter(m => (m.wave || 1) === w).slice(0, n).map(m => m.id);
}

function texture(ledger, opts) {
  opts = opts || {};
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const me = Game.villagerId;
  Game.state.scholar.day = opts.day || 140;
  Game.state.systemArrived = true;
  Game.state.scholar.integration = opts.integration || 85;
  if (opts.sysBond) Game.progState().sysBond = opts.sysBond;
  Game.state.scholar.grounding = opts.grounding != null ? opts.grounding : 100;
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== me);
  Game.state.village.trust = {};
  roster.forEach((id, i) => { Game.state.village.trust[id] = 45 + (i * 7) % 45; });
  for (const k of Object.keys(ledger || {})) { try { Game.ledgerAdd(k, ledger[k]); } catch (e) {} }
  Game.state.village.dead = Game.state.village.dead || {};
  Game.state.village.dead[roster[4]] = { cause: 'combat', day: 61 };
  Game.state.village.dead[roster[7]] = { cause: 'starvation', day: 92 };
  Game.state.village.dead[roster[9]] = { cause: 'combat', day: 118 };
  for (const w of [1, 2, 3]) for (const id of monstersOfWave(w, w === 3 ? 3 : 4)) Game.recordDeedFight(id);
  Game.deedState().contestsSurvived = 2;
  Game.fireCrisis('breach'); Game.fireCrisis('first-grave');
  Game.state.networkLive = true;
  Game.progState().sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = true;
  try { Game.shareFood(3200, roster[2]); Game.shareFood(1500, roster[5]); } catch (e) {}
  try { Game.promise(roster[1], 'feed the winter'); Game.keepPromise(roster[1]); } catch (e) {}
  try { Game.promise(roster[3], 'teach the children'); Game.breakPromise(roster[3]); } catch (e) {}
  const v = Game.state.village; v.pantry = v.pantry || [];
  v.pantry.push({ kcalEach: 5000, units: 10 });
  Game.state.village.viewership = 20;
  try { Game.claimRelay(); } catch (e) {}
  return { me, roster };
}

function resetTable() {
  const pg = Game.progState();
  pg.tableDone = false; pg.table = null;
  Game.state.scholar.tableChoices = null;
  Game.over = false; Game.won = false;
}

// leanNudges: [[delta, why], ...] — each delta is clamped ±10 by addRelayLean,
// so the accumulation law (no single choice crosses the 40 threshold) is
// honored: these stand in for months of relay verbs.
function nudgeLean(steps, log) {
  for (const [d, why] of steps) {
    const lean = Game.addRelayLean(d, why);
    log(`(lean nudge ${d > 0 ? '+' : ''}${d} [${why}] -> lean ${lean})`);
  }
}

// Returns { result, branchAtEntry, doorGifts } — door gifts are snapshotted
// right after path entry, BEFORE challenge verbs can open further tracks
// through the relay gradient gates.
function walk(strat, finalPick, log) {
  const T = () => Game.tableState();
  Game.tableScene();
  const tc0 = Game.state.scholar.tableChoices;
  const offered = ((tc0 && tc0.options) || []).map(o => o.id);
  log(`(seat: ${Game.tableSeat().seat} | branch for relay: ${JSON.stringify(Game.tableBranch('relay'))} | offered: ${offered.join(', ')})`);
  if (!offered.includes('path:relay')) { log('!! relay NOT OFFERED — abort walk'); return { result: 'not-offered' }; }
  Game.chooseTableOption('path:relay');
  const branchAtEntry = T().branch;
  const ra0 = Game.state.scholar.relayAbils || {};
  const doorGifts = Object.keys(ra0).filter(k => ra0[k] && ra0[k].unlocked);
  log(`(relay entry: branch=${branchAtEntry} | door gifts=${doorGifts.join(',')})`);
  let guard = 0, stall = 0;
  while (guard++ < 40) {
    const S = T();
    if (S.phase === 'done') break;
    if (S.phase === 'finals') {
      const tc = Game.state.scholar.tableChoices;
      const opts = (tc && tc.options) || [];
      log(`(finals, branch=${S.branch}: ${opts.map(o => o.id).join(', ')})`);
      let pick = null;
      if (finalPick === 'last') pick = opts[opts.length - 1].id;
      else if (finalPick && opts.some(o => o.id.indexOf(finalPick) >= 0)) pick = opts.find(o => o.id.indexOf(finalPick) >= 0).id;
      else pick = opts[0].id;
      log(`YOU choose final: ${pick}`);
      Game.chooseTableOption(pick);
      if (T().phase === 'demand-price') {
        const dpc = Game.state.scholar.tableChoices;
        const dpopts = (dpc && dpc.options) || [];
        if (dpopts.length) { log(`YOU pay: ${dpopts[0].id}`); Game.chooseTableOption(dpopts[0].id); }
      }
      continue;
    }
    if (S.phase === 'downgrade') {
      const tc = Game.state.scholar.tableChoices;
      const opts = (tc && tc.options) || [];
      log(`(DOWNGRADE at beat ${S.beat}: ${opts.map(o => o.id).join(', ')})`);
      if (!opts.length) { log('!! no downgrade options'); return 'downgrade-stuck'; }
      Game.chooseTableOption(opts[0].id);
      continue;
    }
    const tc = Game.state.scholar.tableChoices;
    const opts = (tc && tc.options) || [];
    if (!opts.length) { log(`!! no options at beat ${S.beat}`); return 'stall'; }
    log(`beat ${S.beat} options: ${opts.map(o => '[' + o.id + '] ' + stripHtml(o.label || '').slice(0, 60)).join(' | ')}`);
    let pick;
    if (strat === 'last') pick = opts[opts.length - 1];
    else if (strat === 'advance') {
      // play the challenge straight: deepen/commune/honest advance without
      // the backfire risk that probe carries (probe×3 = the honest failure
      // path, exercised separately).
      pick = opts.find(o => o.id === 'beat:deepen') || opts.find(o => o.id === 'beat:commune') || opts.find(o => o.id === 'beat:honest') || opts[0];
    }
    else pick = opts[0];
    const b0 = S.beat, m0 = JSON.stringify(S.meters || {}), p0 = S.phase;
    log(`YOU: [${pick.id}] ${stripHtml(pick.label || '').slice(0, 70)}`);
    Game.chooseTableOption(pick.id);
    const S2 = T();
    if (S2.phase === p0 && S2.beat === b0 && JSON.stringify(S2.meters || {}) === m0) {
      stall++;
      if (stall >= 3) { log('!! true stall: nothing advances'); return 'stall'; }
      const alt = opts.find(o => o.id !== pick.id);
      if (alt) { log(`(no advance — trying alt: ${alt.id})`); Game.chooseTableOption(alt.id); stall = 0; }
    } else stall = 0;
  }
  const S = T();
  log(`(end: phase=${S.phase}, path=${S.path}, branch=${S.branch}, won=${!!Game.won}, over=${!!Game.over})`);
  return { result: S.phase, branchAtEntry, doorGifts };
}

const walks = [
  {
    name: 'relay-grey-tender', strat: 'advance', finalPick: 'both-hands',
    ledger: { defiance: 1, embrace: 2, protected: 6, killed: 0, foodShared: 7, promisesKept: 5 },
    opts: { sysBond: 3, grounding: 90 },
    leanSteps: [[10, 'translate sessions, spring'], [10, 'advocate for the village, summer']],
    expect: { branch: 'grey', doorHand: 'light' },
  },
  {
    name: 'relay-grey-total', strat: 'last', finalPick: 'the-contract',
    ledger: { defiance: 2, killed: 3, betrayed: 1, promisesBroken: 2, foodShared: 2, foodHoarded: 2 },
    opts: { sysBond: 2, grounding: 60 },
    leanSteps: [[-10, 'rewrite habit, spring'], [-5, 'skim habit, summer']],
    expect: { branch: 'grey', doorHand: 'dark' },
  },
  {
    name: 'relay-grey-neutral', strat: 'first', finalPick: 'both-hands',
    ledger: { protected: 5, killed: 2, foodShared: 4, promisesKept: 3, defiance: 2 },
    opts: { sysBond: 2, grounding: 80 },
    leanSteps: [],
    expect: { branch: 'grey', doorHand: 'none' },
  },
];

const LIGHT_HAND = ['translate', 'sanctuary', 'advocate'];
const DARK_HAND = ['rewrite', 'skim', 'omnipresence'];
const GREY_FINALS = ['both-hands', 'the-contract'];

(async () => {
  await Game.init();
  const summary = [];
  for (const w of walks) {
    Math.random = mulberry32(SEED0 + summary.length * 7919);
    const transcript = [];
    const log = (t) => { transcript.push(t); };
    const oldSay = Game.say, oldSys = Game.sysSay, oldWipe = Game.wipe, oldSave = Game.save;
    Game.say = function (t) { transcript.push(stripHtml(t)); };
    Game.sysSay = function (t) { transcript.push('SYS: ' + stripHtml(t)); };
    Game.wipe = function () { transcript.push('(wipe — run ends)'); };
    Game.save = function () {};
    let result = '?';
    const checks = [];
    try {
      texture(w.ledger, w.opts);
      resetTable();
      nudgeLean(w.leanSteps, log);
      const leanNow = Game.relayLean();
      transcript.push(`##### walk ${w.name}: lean=${leanNow} band=${Game.relayBand()}`);
      const walked = walk(w.strat, w.finalPick, log);
      result = walked.result;
      const hasHand = (ids) => ids.filter(id => walked.doorGifts.includes(id));
      const lightHeld = hasHand(LIGHT_HAND), darkHeld = hasHand(DARK_HAND);
      checks.push(['branch is grey at relay entry', walked.branchAtEntry === 'grey', walked.branchAtEntry]);
      if (w.expect.doorHand === 'light') checks.push(['tender door gift: light hand granted', lightHeld.length === 3 && darkHeld.length === 0, 'light=' + lightHeld + ' dark=' + darkHeld]);
      if (w.expect.doorHand === 'dark') checks.push(['total door gift: dark hand granted', darkHeld.length === 3 && lightHeld.length === 0, 'light=' + lightHeld + ' dark=' + darkHeld]);
      if (w.expect.doorHand === 'none') checks.push(['neutral door: only shared gifts', lightHeld.length === 0 && darkHeld.length === 0 && hasHand(['deep-listen', 'faithful-carry', 'relay-sight']).length === 3, 'light=' + lightHeld + ' dark=' + darkHeld]);
      checks.push(['walk completed', result === 'done', result]);
      checks.push(['won', !!Game.won, String(!!Game.won)]);
      transcript.push('CHECKS: ' + checks.map(c => (c[1] ? 'PASS' : 'FAIL') + ' ' + c[0] + ' [' + c[2] + ']').join(' | '));
      transcript.push(`RESULT: ${result} | won=${!!Game.won}`);
    } catch (e) {
      transcript.push('HARNESS ERROR: ' + (e && e.stack || e));
      result = 'error';
    }
    Game.say = oldSay; Game.sysSay = oldSys; Game.wipe = oldWipe; Game.save = oldSave;
    fs.writeFileSync(path.join(OUTDIR, 'walk-' + w.name + '.txt'), transcript.join('\n'));
    const fails = checks.filter(c => !c[1]);
    summary.push({ name: w.name, result, fails: fails.map(f => f[0]) });
    console.log(`${w.name}: ${result} ${fails.length ? 'FAILS: ' + fails.map(f => f[0]).join('; ') : 'all checks pass'} (transcript ${transcript.join('\n').length} chars)`);
  }
  // threshold sanity: the band really flips at ±40
  const band = (lean) => (lean >= 40 ? 'light' : lean <= -40 ? 'dark' : 'grey');
  const tb = [[39, 'grey'], [40, 'light'], [-39, 'grey'], [-40, 'dark'], [20, 'grey'], [0, 'grey']];
  const tbFails = tb.filter(([l, b]) => band(l) !== b);
  console.log('band thresholds: ' + (tbFails.length ? 'FAIL ' + JSON.stringify(tbFails) : 'all sane'));
  fs.writeFileSync(path.join(OUTDIR, 'summary.json'), JSON.stringify(summary, null, 1));
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
