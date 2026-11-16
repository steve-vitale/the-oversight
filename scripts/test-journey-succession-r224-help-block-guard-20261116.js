#!/usr/bin/env node
// test-journey-succession-r224-help-block-guard-20261116.js — proof test
// for the r224 F4c fix (journey-succession r224, the r218-leftover seam).
//
// The r218 panel's DRY CENSUS failed on 1 other-class hit: seed 34293
// d105, Carl, pick `dlg:help`, key the Saad/pods line. The resume opener
// quoted the Saad line as the thread snippet, then dlg:help's engageBeat
// returned the SAME line and sayLine ledger-blocked it → dry
// ("...Sorry, lost my train of thought."). Root cause (traced this run,
// correcting r218's shorthand): the opener quote does NOT ledger the
// snippet (the opener is one structural sayLine whose ledger key is its
// frame) — the block is `preRun:true`, i.e. the seek_taken repeat-ack
// engageBeat line is FULLY DETERMINISTIC after the first telling
// ("Still nothing on ${first}. I told you about the pods...", 
// convo-wants.js), so any earlier sitting that spoke it within the
// 48-entry run-ledger window blocks the re-ask.
//
// Two-layer fix: (1) SOURCE — the repeat-ack line gets variants via
// convoPickCycle (3 honest phrasings, all keeping "still nothing" +
// pods + first name), so repeats cycle instead of parroting; (2)
// BACKSTOP — the dlg:help handler (convo-dialogue.js) checks
// `convoWouldBlock` on the composed want line and falls to the nowant
// pool instead of speaking a line the ledger would swallow (the
// r209-F1 guard class, generalized from r218's filed snippet-equality
// shape to the actual block predicate).
//
// Cases (each in its own process — never two harnesses in one process):
//   blocked-falls-to-nowant: the seek_taken repeat-ack line(s) poisoned
//     in the run ledger — dlg:help must fall to the nowant pool (fixed)
//     instead of going dry (unfixed).
//   unblocked-speaks-verbatim: same staging, no poison — dlg:help speaks
//     the repeat-ack line verbatim (the guard must not over-fire).
//   variants-cycle: engageBeat called 6 times — at least 2 distinct
//     phrasings (fixed) instead of 1 parroted line (unfixed).
//   control: a water_haul favor's dlg:help still speaks the favor ask
//     (no regression in the help path for favors).
// Usage: node scripts/test-journey-succession-r224-help-block-guard-20261116.js [blocked-falls-to-nowant|unblocked-speaks-verbatim|variants-cycle|control]
//   Default (no arg): runs all four cases, spawning children for the
//   three non-default cases (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

const NOWANT_RE = /Honestly\? I['’]m alright right now|Nothing I can name/;
const DRY_RE = /lost my train of thought/;
const REPEAT_RE = /Still nothing on |No word on /;

// Stage the roster healthy + trusting, so no acute need pre-empts
// the planted seek_taken seed.
async function setupBase(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  v.water = { clean: 0, dirty: 0 };
  v.health = v.health || {};
  v.hunger = v.hunger || {};
  v.energy = v.energy || {};
  v.fear = v.fear || {};
  v.sick = v.sick || {};
  v.trust = v.trust || {};
  v.away = v.away || {};
  for (const vid of roster) {
    v.health[vid] = 100;
    v.hunger[vid] = 0;
    v.energy[vid] = 100;
    v.fear[vid] = 0;
    delete v.sick[vid];
    delete v.away[vid];
    v.trust[vid] = 90;
    try { if (typeof Game.objResourceSee === 'function') Game.objResourceSee(vid); } catch (e) {}
  }
  return roster;
}

function lastNpcLine(Game, vid) {
  const c = Game.convoGet(vid);
  const tr = (c && c.transcript) || [];
  for (let i = tr.length - 1; i >= 0; i--) {
    if (tr[i].who === 'them') return String(tr[i].text || '');
  }
  return '';
}

function hasChoice(Game, vid, id) {
  const choices = Game.convoChoices(vid) || [];
  return choices.some(x => x.id === id);
}

// First roster villager with taken kin, or null.
function findTakenVillager(Game, roster) {
  for (const vid of roster) {
    try {
      const kin = Game.takenKinOf(vid) || [];
      if (kin.length) return { vid, kin: kin[0] };
    } catch (e) {}
  }
  return null;
}

// Open a seek_taken sitting deterministically: plant the seed (seeds
// outrank the weighted pick), then startConvo.
function openTakenSitting(Game, vid) {
  Game.convoPlantSeed(vid, { wantId: 'seek_taken', note: 'about the taken' });
  const r = Game.startConvo(vid);
  if (!(r && !r.refused)) return null;
  const c = Game.convoGet(vid);
  if (!c || !c.want || c.want.id !== 'seek_taken') { try { Game.endConvo(vid, 'left'); } catch (e) {} return null; }
  return { vid, c };
}

async function runCase(mode) {
  const seed = { 'blocked-falls-to-nowant': 5581, 'unblocked-speaks-verbatim': 5585, 'variants-cycle': 5586, control: 5584 }[mode] || 5581;
  const { Game } = await loadGame({ seed, mode: 'succession-r224-help-block-guard-proof', fullTelemetry: true });
  await setupGame(Game);
  const roster = await setupBase(Game);
  const v = Game.state.village || {};

  if (mode === 'control') {
    // Water-haul favor sitting (r218 openFavorSitting pattern): the
    // help path must still speak the favor ask.
    let st = null;
    for (const vid of roster) {
      try {
        const need = Game.convoFindFavorNeed(vid);
        if (!need || need.kind !== 'water_haul') continue;
        const rec = Game.convoGet(vid);
        if (rec) rec.count = 2;
        const r = Game.startConvo(vid);
        if (!(r && !r.refused)) continue;
        const c = Game.convoGet(vid);
        if (!c || !c.want || c.want.id !== 'ask_favor') { try { Game.endConvo(vid, 'left'); } catch (e) {} continue; }
        const favor = (typeof Game.convoGetFavor === 'function') ? Game.convoGetFavor(vid) : null;
        if (!favor || favor.kind !== 'water_haul') { try { Game.endConvo(vid, 'left'); } catch (e) {} continue; }
        st = { vid, c, favor };
        break;
      } catch (e) { try { Game.endConvo(vid, 'left'); } catch (e2) {} continue; }
    }
    check(`${mode}: water-haul favor sitting opened`, !!st, 'vid=' + (st && st.vid));
    if (!st) return;
    // NOTE: dlg:help is driver-pressed via convoTurn, not a menu id — the
    // panel driver presses it directly, so no menu-offering check here.
    Game.convoTurn(st.vid, 'dlg:help');
    const turn = lastNpcLine(Game, st.vid);
    check(`${mode}: dlg:help speaks the favor ask, not a fallback`, /cistern|liters|creek water run/i.test(turn), turn.slice(0, 140));
    try { Game.endConvo(st.vid, 'left'); } catch (e) {}
    return;
  }

  // seek_taken cases: stage the villager + the first telling.
  const found = findTakenVillager(Game, roster);
  check(`${mode}: a taken-kin villager exists on this seed`, !!found, found ? found.vid : 'none on roster');
  if (!found) return;
  const { vid, kin } = found;
  const first = (kin.name || 'they').split(' ')[0];
  Game.convoSaidFact(vid, 'taken-story', first);

  if (mode === 'variants-cycle') {
    const st = openTakenSitting(Game, vid);
    check(`${mode}: seek_taken sitting opened`, !!st, 'vid=' + vid);
    if (!st) return;
    const def = st.c.want.def;
    const seen = [];
    for (let i = 0; i < 6; i++) {
      const line = def.engageBeat.call(Game, vid);
      if (line && seen.indexOf(line) === -1) seen.push(line);
    }
    check(`${mode}: engageBeat cycles through at least 2 distinct phrasings`, seen.length >= 2, `distinct=${seen.length} e.g. ${String(seen[0] || '').slice(0, 90)}`);
    check(`${mode}: every variant still names the kin and the pods`, seen.every(l => l.indexOf(first) !== -1 && /pods/i.test(l)), seen.map(l => l.slice(0, 60)).join(' | '));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  // blocked / unblocked: collect the repeat-ack line(s) first (the
  // sitting's engageBeat draws the next cycle variant, so poison ALL
  // distinct variants — on unfixed code there is exactly one).
  const probe = openTakenSitting(Game, vid);
  check(`${mode}: seek_taken sitting opened (probe)`, !!probe, 'vid=' + vid);
  if (!probe) return;
  const def = probe.c.want.def;
  const variants = [];
  for (let i = 0; i < 3; i++) {
    const line = def.engageBeat.call(Game, vid);
    if (line && variants.indexOf(line) === -1) variants.push(line);
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  check(`${mode}: a repeat-ack line exists to test`, variants.length > 0, variants.map(l => l.slice(0, 60)).join(' | '));
  if (!variants.length) return;

  if (mode === 'blocked-falls-to-nowant') {
    // Poison the run ledger with every variant, through the real
    // emission choke point, spoken by another villager.
    const vidA = roster.find(id => id !== vid);
    for (const line of variants) Game.sayLine(vidA, line);
    check(`${mode}: every variant IS run-blocked for the bearer`, variants.every(l => Game.convoWouldBlock(vid, l) === true));
  }

  // Fresh sitting (the probe sitting ended; the seed was consumed, so
  // re-plant it — the takenWantDay gate only blocks the want PICK, and
  // seeds outrank the pick).
  const st = openTakenSitting(Game, vid);
  check(`${mode}: seek_taken sitting opened (test)`, !!st, 'vid=' + vid);
  if (!st) return;
  // NOTE: dlg:help is driver-pressed via convoTurn, not a menu id.
  Game.convoTurn(vid, 'dlg:help');
  const turn = lastNpcLine(Game, vid);
  if (mode === 'blocked-falls-to-nowant') {
    check(`${mode}: dlg:help does NOT go dry`, !DRY_RE.test(turn), turn.slice(0, 140));
    check(`${mode}: dlg:help falls to the nowant pool, not the blocked line`, NOWANT_RE.test(turn) && !REPEAT_RE.test(turn), turn.slice(0, 140));
  } else {
    check(`${mode}: dlg:help speaks the repeat-ack line verbatim`, REPEAT_RE.test(turn) && turn.indexOf(first) !== -1, turn.slice(0, 140));
    check(`${mode}: dlg:help does NOT go dry`, !DRY_RE.test(turn), turn.slice(0, 140));
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
}

async function main() {
  const mode = process.argv[2];
  if (mode && ['blocked-falls-to-nowant', 'unblocked-speaks-verbatim', 'variants-cycle', 'control'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('blocked-falls-to-nowant');
    for (const m of ['unblocked-speaks-verbatim', 'variants-cycle', 'control']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r224-help-block-guard-20261116.js'), m],
          { timeout: 300000, maxBuffer: 64 * 1024 * 1024 }).toString();
        console.log(out.split('\n').filter(l => l.startsWith('PASS') || l.startsWith('FAIL')).join('\n'));
        if (/FAIL/.test(out)) fails++;
      } catch (e) {
        check(`${m} child run passes`, false, String((e.stdout || e.message || e)).slice(0, 300));
      }
    }
  }
  if (fails) { console.log(`\n${fails} FAILURES`); process.exit(1); }
  console.log('\nALL GREEN');
}

main().catch(e => { console.error('THREW', e); process.exit(1); });
