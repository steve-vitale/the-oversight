#!/usr/bin/env node
// sweep-table-experience-20261012.js — endgame-leg EXPERIENCE drive (journey-endgame r4).
// Plays the table itself across all 7 paths (light/dark variants, a failure-downgrade
// walk, the pods demand, the callous-oversight epilogue) on a rich synthetic run:
// day 140, real ledger, real dead, real fights via recordDeedFight, pods texture.
// The lesser-seat BAR cheats are IN-HARNESS ONLY (never shipped): the bars are the
// win-path lever worker's territory; this run judges the EXPERIENCE past the bars.
// Writes one full transcript per walk to evidence/2026-10-12/table-experience/.
// SENSE-TESTING LAW: the transcripts are the deliverable; read them, don't count them.
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
const SEED0 = parseInt(process.env.SEED || '1201', 10);
Math.random = mulberry32(SEED0);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

const OUTDIR = path.join(ROOT, 'evidence', '2026-10-12', 'table-experience');
fs.mkdirSync(OUTDIR, { recursive: true });

const stripHtml = (s) => String(s).replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ');

function monstersOfWave(w, n) {
  return (Game.data.monsters || []).filter(m => (m.wave || 1) === w).slice(0, n).map(m => m.id);
}
function vname(vid) { try { return Game.displayName(vid) || vid; } catch (e) { return vid; } }

// ---------- rich run texture (the "village as it would be at day 140") ----------
function texture(ledger, opts) {
  opts = opts || {};
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const me = Game.villagerId;
  Game.state.scholar.day = opts.day || 140;
  Game.state.systemArrived = true;
  Game.state.scholar.integration = opts.integration || 55;
  if (opts.sysBond) Game.progState().sysBond = opts.sysBond;
  Game.state.scholar.grounding = opts.grounding != null ? opts.grounding : 100;
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== me);
  Game.state.village.trust = {};
  roster.forEach((id, i) => { Game.state.village.trust[id] = 45 + (i * 7) % 45; });
  for (const k of Object.keys(ledger || {})) { try { Game.ledgerAdd(k, ledger[k]); } catch (e) {} }
  // three dead villagers — a combat death, a starvation death, a wave-2 death
  Game.state.village.dead = Game.state.village.dead || {};
  Game.state.village.dead[roster[4]] = { cause: 'combat', day: 61 };
  Game.state.village.dead[roster[7]] = { cause: 'starvation', day: 92 };
  Game.state.village.dead[roster[9]] = { cause: 'combat', day: 118 };
  // the lesser-seat bar (IN-HARNESS GRANT — bars are the lever worker's territory)
  for (const w of [1, 2, 3]) for (const id of monstersOfWave(w, w === 3 ? 3 : 4)) Game.recordDeedFight(id);
  Game.deedState().contestsSurvived = 2;
  Game.fireCrisis('breach'); Game.fireCrisis('first-grave');
  Game.state.networkLive = true;
  Game.progState().sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = true;
  // foodShared through the REAL shareFood path (wired r3)
  try { Game.shareFood(3200, roster[2]); Game.shareFood(1500, roster[5]); } catch (e) {}
  // real promises
  try { Game.promise(roster[1], 'feed the winter'); Game.keepPromise(roster[1]); } catch (e) {}
  try { Game.promise(roster[3], 'teach the children'); Game.breakPromise(roster[3]); } catch (e) {}
  // pods texture: a mourner, a kept promise, a broken one (KIN canon: weight, not meter)
  // History kinds (pods.js): 'asked', 'acted', 'promise-kept', 'promise-broken',
  // 'shrugged'. championed = acted>=2 && kept>=1 (reads kindly-worded history).
  try {
    if (opts.championPods) {
      Game.podRemember && Game.podRemember('asked', { note: 'asked the System about the pods; it deflected' });
      Game.podRemember && Game.podRemember('asked', { note: 'asked again; the System noticed you care' });
      Game.podRemember && Game.podRemember('promise-kept', { note: 'kept a pod promise to a mourner' });
    } else if (!opts.noPods) {
      Game.podRemember && Game.podRemember('mourner-asked', { vid: roster[1], note: 'asked about the pods; you promised' });
      Game.podRemember && Game.podRemember('promise-kept', { vid: roster[1], note: 'pod promise kept once' });
    }
  } catch (e) {}
  // pantry for prices (a fresh village starts ~47k kcal; thin = truly bare)
  const v = Game.state.village; v.pantry = v.pantry || [];
  if (opts.pantryThin) v.pantry = [];
  else v.pantry.push({ kcalEach: 5000, units: 10 });
  Game.state.village.viewership = opts.viewership != null ? opts.viewership : 20;
  try { if (opts.claimRelay) { Game.claimRelay(); } } catch (e) {}
  if (opts.relayAbils) { try { Game.state.scholar.relayAbils = Object.assign({}, opts.relayAbils); } catch (e) {} }
  return { me, roster };
}

function resetTable() {
  const pg = Game.progState();
  pg.tableDone = false; pg.table = null;
  Game.state.scholar.tableChoices = null;
  Game.over = false; Game.won = false;
}

// ---------- walk one path ----------
function walk(pathId, strat, finalPick, log) {
  const T = () => Game.tableState();
  log(`--- walking path: ${pathId} (strat=${strat}, final=${finalPick}) ---`);
  Game.tableScene();
  const tc0 = Game.state.scholar.tableChoices;
  const offered = ((tc0 && tc0.options) || []).map(o => o.id);
  log(`(seat: ${Game.tableSeat().seat} | branch for ${pathId}: ${Game.tableBranch(pathId)} | offered: ${offered.join(', ')})`);
  if (!offered.includes('path:' + pathId)) { log(`!! ${pathId} NOT OFFERED — abort walk`); return 'not-offered'; }
  Game.chooseTableOption('path:' + pathId);
  // In-harness stall force: Long Road already spent, so the thin pantry
  // harvest genuinely stalls -> exercises the downgrade path.
  if (strat === 'fail') { try { T().longRoadUsed = true; } catch (e) {} }
  let guard = 0, stall = 0;
  while (guard++ < 40) {
    const S = T();
    if (S.phase === 'done') break;
    if (S.phase === 'finals') {
      const tc = Game.state.scholar.tableChoices;
      const opts = (tc && tc.options) || [];
      log(`(finals, branch=${S.branch}: ${opts.map(o => o.id).join(', ')})`);
      let pick = null;
      if (finalPick === 'poddemand' && opts.some(o => o.id.indexOf('poddemand') >= 0)) pick = 'final:poddemand';
      else if (finalPick === 'last') pick = opts[opts.length - 1].id;
      else pick = opts[0].id;
      log(`YOU choose final: ${pick}`);
      Game.chooseTableOption(pick);
      if (T().phase === 'demand-price') {
        const dpc = Game.state.scholar.tableChoices;
        const dpopts = (dpc && dpc.options) || [];
        log(`(demand prices: ${dpopts.map(o => o.id).join(', ')})`);
        if (dpopts.length) { log(`YOU pay: ${dpopts[0].id}`); Game.chooseTableOption(dpopts[0].id); }
      }
      continue;
    }
    if (S.phase === 'downgrade') {
      const tc = Game.state.scholar.tableChoices;
      const opts = (tc && tc.options) || [];
      log(`(DOWNGRADE at beat ${S.beat}: ${opts.map(o => o.id).join(', ')})`);
      if (!opts.length) { log('!! no downgrade options'); return 'downgrade-stuck'; }
      log(`YOU choose downgrade: ${opts[0].id}`);
      Game.chooseTableOption(opts[0].id);
      continue;
    }
    const tc = Game.state.scholar.tableChoices;
    const opts = (tc && tc.options) || [];
    if (!opts.length) { log(`!! no options at beat ${S.beat}`); return 'stall'; }
    log(`beat ${S.beat} options: ${opts.map(o => '[' + o.id + '] ' + stripHtml(o.label || '').slice(0, 60)).join(' | ')}`);
    let pick;
    if (strat === 'last') pick = opts[opts.length - 1];
    else if (strat === 'trial' && S.beat === 1) pick = opts.find(o => o.id === 'beat:trial') || opts[0];
    else if (strat === 'fail') {
      // deliberately reach for the unpayable price (thin pantry -> stall)
      pick = opts.find(o => o.id === 'beat:harvest') || opts.find(o => /can't|can't pay|stall|no|refuse|walk/i.test(o.id + ' ' + (o.label || ''))) || opts[opts.length - 1];
    } else pick = opts[0];
    const b0 = S.beat, m0 = JSON.stringify(S.meters || {}), p0 = S.phase;
    log(`YOU: [${pick.id}] ${stripHtml(pick.label || '').slice(0, 70)}`);
    Game.chooseTableOption(pick.id);
    const S2 = T();
    // Trial fired: a real fight began (harness ends the fight offscreen and
    // drives the resume — the fight itself is the combat engine's domain).
    if (S2.phase === 'challenge' && S2.trialPending && Game.tbfight) {
      log('(TRIAL FIRED — the Finale is in the ring; the harness ends the fight offscreen and resumes)');
      Game.tbfight = null;
      Game.tableTrialResume('won');
      log('(post-trial resume: terror maxed, challenge continues)');
      stall = 0; continue;
    }
    if (S2.phase === p0 && S2.beat === b0 && JSON.stringify(S2.meters || {}) === m0) {
      stall++;
      if (stall >= 3) { log('!! true stall: nothing advances'); return 'stall'; }
      // try a different option
      const alt = opts.find(o => o.id !== pick.id);
      if (alt) { log(`(no advance — trying alt: ${alt.id})`); Game.chooseTableOption(alt.id); stall = 0; }
    } else stall = 0;
  }
  const S = T();
  log(`(end: phase=${S.phase}, path=${S.path}, branch=${S.branch}, won=${!!Game.won}, over=${!!Game.over})`);
  return S.phase;
}

const realTableSeat = Game.tableSeat;
const walks = [
  // [name, ledger, opts, strategy, final]
  ['feared-light', { might: 5, protected: 9, killed: 1, betrayed: 0, promisesKept: 5, defiance: 1, foodShared: 6, foodHoarded: 0 }, {}, 'first', 'first'],
  ['feared-trial', { might: 9, protected: 1, killed: 12, betrayed: 2, promisesBroken: 3, defiance: 6, foodShared: 1, foodHoarded: 4 }, {}, 'trial', 'first'],
  ['feared-dark', { might: 9, protected: 1, killed: 12, betrayed: 2, promisesBroken: 3, defiance: 6, foodShared: 1, foodHoarded: 4 }, { grounding: 90 }, 'first', 'last'],
  ['indispensable', { might: 6, brokerage: 8, foodShared: 12, foodHoarded: 1, protected: 8, killed: 1, promisesKept: 7, unified: 5, fractured: 0 }, { fullSeat: true }, 'first', 'first'],
  ['beloved', { showmanship: 9, protected: 7, killed: 0, betrayed: 0, promisesKept: 6 }, { viewership: 20 }, 'first', 'first'],
  ['witness-light', { exposed: 6, protected: 6, killed: 1, betrayed: 0, promisesKept: 4 }, {}, 'first', 'first'],
  ['witness-dark', { exposed: 6, protected: 1, killed: 9, betrayed: 2, promisesBroken: 2 }, {}, 'last', 'last'],
  ['assimilated', { embrace: 7, defiance: 1, protected: 5, killed: 1, foodShared: 4 }, {}, 'first', 'first'],
  ['defiant-pay', { defiance: 8, protected: 6, killed: 2, promisesKept: 3, foodShared: 5 }, {}, 'first', 'first'],
  ['defiant-stall', { defiance: 9, protected: 5, killed: 2 }, { pantryThin: true }, 'fail', 'first'],
  ['relay-light', { defiance: 0, embrace: 2, protected: 6, killed: 0, foodShared: 7, promisesKept: 5 }, { integration: 85, sysBond: 3, claimRelay: true, relayAbils: { deepListen: true, faithfulCarry: true, relaySight: true, translate: true, sanctuary: true, advocate: true } }, 'first', 'first'],
  ['relay-dark', { defiance: 1, killed: 4, betrayed: 1, promisesBroken: 2, foodShared: 0, foodHoarded: 3 }, { integration: 85, sysBond: 2, claimRelay: true, relayAbils: { rewrite: true, skim: true, omnipresence: true, rewriteUses: 6, skimUses: 4 }, grounding: 45 }, 'last', 'last'],
  ['defiant-pods', { defiance: 7, protected: 8, killed: 1, foodShared: 8, promisesKept: 6 }, { championPods: true }, 'first', 'poddemand'],
  ['feared-callous', { might: 7, protected: 8, killed: 1, promisesKept: 5 }, { noPods: true }, 'first', 'first'],
];

(async () => {
  await Game.init();
  const summary = [];
  for (const [name, ledger, opts, strat, finalPick] of walks) {
    // override Math.random per-walk for independent villages
    Math.random = mulberry32(SEED0 + summary.length * 7919);
    const lines = [];
    const log = (t) => { lines.push(t); transcript.push(t); };
    const transcript = [];
    const oldSay = Game.say, oldSys = Game.sysSay, oldWipe = Game.wipe, oldSave = Game.save;
    Game.say = function (t) { transcript.push(stripHtml(t)); };
    Game.sysSay = function (t) { transcript.push('SYS: ' + stripHtml(t)); };
    Game.wipe = function () { transcript.push('(wipe — run ends)'); };
    Game.save = function () {};
    let result = '?';
    try {
      texture(ledger, opts);
      // full-seat cheat is per-walk, in-harness only; always restore.
      Game.tableSeat = opts.fullSeat ? function () { return { seat: 'full', detail: {} }; } : realTableSeat;
      resetTable();
      const pathId = name.split('-')[0];
      const seat = Game.tableSeat();
      transcript.push(`##### walk ${name}: seat=${seat.seat}, ledger=${JSON.stringify(ledger)}`);
      if (opts.noPods && Game.state && Game.state.village) {
        // callous: wipe any pod memory/history for the oversight reading
        try { delete Game.state.village.pods; } catch (e) {}
      }
      result = walk(pathId, strat, finalPick, transcript.push.bind(transcript));
      transcript.push(`RESULT: ${result} | won=${!!Game.won}`);
    } catch (e) {
      transcript.push('HARNESS ERROR: ' + (e && e.stack || e));
      result = 'error';
    }
    Game.say = oldSay; Game.sysSay = oldSys; Game.wipe = oldWipe; Game.save = oldSave;
    fs.writeFileSync(path.join(OUTDIR, 'walk-' + name + '.txt'), transcript.join('\n'));
    summary.push(`${name}: ${result}`);
    console.log(`${name}: ${result} (transcript ${transcript.join('\n').length} chars)`);
  }
  // ---- people check: two conversations at day 140 ----
  Math.random = mulberry32(SEED0 + 31337);
  const oldSay2 = Game.say, oldSys2 = Game.sysSay;
  Game.say = function () {}; Game.sysSay = function () {}; Game.wipe = function () {}; Game.save = function () {};
  texture({ protected: 7, killed: 2, foodShared: 6, promisesKept: 4, defiance: 3 }, {});
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  const alive = roster.filter(id => !(Game.state.village.dead || {})[id]);
  const conv = [];
  const vname2 = (vid) => { try { return Game.displayName(vid) || vid; } catch (e) { return vid; } };
  for (const vid of alive.slice(0, 2)) {
    try {
      conv.push(`=== day 140 conversation with ${vname2(vid)} ===`);
      const r0 = Game.startConvo(vid);
      conv.push(`THEM: ${stripHtml(r0.line || '(no line)')}`);
      let r = r0;
      for (let turn = 0; turn < 10; turn++) {
        let choices = (r.choices && r.choices.length) ? r.choices : [];
        if (!choices.length) { try { choices = Game.convoChoices(vid); } catch (e) { choices = []; } }
        if (!choices.length) break;
        const ans = choices.find(x => x && x.id && x.id.indexOf('ans:') === 0);
        const pick = ans || choices.find(x => x && (x.id === 'dlg:engage' || x.id === 'dlg:ask' || x.id === 'dlg:listen')) || choices.find(x => x && x.id && x.id !== 'leave') || choices[0];
        if (!pick || pick.id === 'leave') { conv.push('YOU: (leave)'); break; }
        conv.push(`YOU: [${pick.id}] ${stripHtml(pick.label || '').slice(0, 80)}`);
        r = Game.convoTurn(vid, pick.id);
        if (r.line) conv.push(`THEM: ${stripHtml(r.line)}`);
        if (r.ended) { conv.push('(ended by engine)'); break; }
      }
      const endR = Game.endConvo(vid, 'done');
      if (endR && endR.line) conv.push(`closing: ${stripHtml(endR.line)}`);
    } catch (e) { conv.push('CONVO ERROR: ' + (e && e.message)); }
  }
  Game.say = oldSay2; Game.sysSay = oldSys2;
  fs.writeFileSync(path.join(OUTDIR, 'people-check.txt'), conv.join('\n'));
  console.log('\npeople-check: ' + conv.join('\n').length + ' chars');
  console.log('\nSUMMARY\n' + summary.join('\n'));
  fs.writeFileSync(path.join(OUTDIR, 'summary.txt'), summary.join('\n'));
})().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
