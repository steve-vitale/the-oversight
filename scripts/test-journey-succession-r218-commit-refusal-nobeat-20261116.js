#!/usr/bin/env node
// test-journey-succession-r218-commit-refusal-nobeat-20261116.js — proof test
// for the r218 F3 fix (journey-succession r218, the r209-leftover seam).
//
// The r209 second seam, traced this run: the dlg:commit handler in
// src/js/convo-dialogue.js speaks refusal reasons through sayLine with NO
// noBeat flag, so the refusal becomes the want thread's last beat and can
// be planted as the thread's memory snippet, then quoted in the next
// sitting's resume opener as if the NPC had said it about the favor.
// Three sites:
//
//   Site C (MENU-REACHABLE, headline): a water_haul favor in 'asked'
//   state with the partner away. convoFavorActionMenu offers dlg:commit
//   (canPromise = favor.state==='asked'; waterFavorAction's away block
//   carries no `unsupported` and no `canPromise:false`, so the menu gate
//   passes). Pressing it calls convoFavorCommit, whose R72/R113 away
//   guard returns {ok:false, away:true, line: away line}; the handler
//   speaks that line as `beat` and sayLine notes it as the thread beat.
//   The away line ("away from Haven, no dawn meet while I'm out") is
//   logistics, not the favor — quoting it as the water-haul memory is
//   the same shape as r209 F2's door-direction quote.
//   Site A (defense-in-depth, menu-hidden): stay_close gate fails
//   (legacy companyVersion, passed night) — the early return speaks
//   gate.reason with no noBeat. The menu already hides dlg:commit
//   when the gate fails, so menu-faithful players never reach it.
//   Site B (defense-in-depth, menu-hidden): convoFavorAction
//   unsupported (watch_shift has no playable action) — the early
//   return speaks the reason with no noBeat. Menu-hidden via
//   status.unsupported.
//
// The fix (src/js/convo-dialogue.js, dlg:commit handler only): noBeat
// on sites A and B; conditional `noBeat: !committed` on the main-path
// sayLine — a successful commit's thank-you beat is real conversation
// content and MUST still become thread content.
//
// Cases (each in its own process — never two harnesses in one process):
//   commit-away: real path — water_haul favor, partner away, dlg:commit
//     IS offered, pressed, away line spoken, thread memory stays the
//     favor ask.
//   commit-gate: stay_close favor, companyVersion forced to 0,
//     dlg:commit NOT offered, direct convoTurn speaks the gate reason,
//     thread memory stays the favor ask.
//   commit-unsupported: watch_shift favor (energy < 30), dlg:commit NOT
//     offered, direct convoTurn speaks the unsupported reason, thread
//     memory stays the favor ask.
//   control: water_haul favor, partner present and matched, dlg:commit
//     offered, pressed, commit succeeds, thank-you beat spoken AND it
//     DOES become the thread memory (noBeat is refusal-only).
// Usage: node scripts/test-journey-succession-r218-commit-refusal-nobeat-20261116.js [commit-away|commit-gate|commit-unsupported|control]
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

const ASK_RE = /cistern|liters|creek water run/i;
const AWAY_RE = /away from Haven|dawn meet/i;
const GATE_RE = /older request needs a new meeting night/i;
const UNSUP_RE = /no playable watch handover yet/i;

// Stage the whole roster: healthy, fed, rested, unafraid — then the
// caller tunes one reading (fear, energy, water) per case. Returns
// the roster.
async function setupBase(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  v.water = { clean: 0, dirty: 0 };
  v.health = v.health || {};
  v.hunger = v.hunger || {};
  v.energy = v.energy || {};
  v.fear = v.fear || {};
  v.sick = v.sick || {};
  v.promises = v.promises || {};
  v.favorDeclined = v.favorDeclined || {};
  v.trust = v.trust || {};
  v.away = v.away || {};
  for (const vid of roster) {
    v.health[vid] = 100;
    v.hunger[vid] = 0;
    v.energy[vid] = 100;
    v.fear[vid] = 0;
    delete v.sick[vid];
    delete v.promises[vid];
    delete v.favorDeclined[vid];
    delete v.away[vid];
    v.trust[vid] = 90;
    try { if (typeof Game.objResourceSee === 'function') Game.objResourceSee(vid); } catch (e) {}
  }
  return roster;
}

// Open a sitting on the ask_favor want for the given favor kind.
// Loops the roster; first meetings lead with curiosity, so each
// candidate opens as a returning conversation (count = 2).
async function openFavorSitting(Game, kind) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  for (const vid of roster) {
    try {
      const need = Game.convoFindFavorNeed(vid);
      if (!need || need.kind !== kind) continue;
      const rec = Game.convoGet(vid);
      if (rec) rec.count = 2;
      const r = Game.startConvo(vid);
      if (!(r && !r.refused)) continue;
      const c = Game.convoGet(vid);
      if (!c || !c.want || c.want.id !== 'ask_favor') { try { Game.endConvo(vid, 'left'); } catch (e) {} continue; }
      const favor = (typeof Game.convoGetFavor === 'function') ? Game.convoGetFavor(vid) : null;
      if (!favor || favor.kind !== kind) { try { Game.endConvo(vid, 'left'); } catch (e) {} continue; }
      return { vid, c, favor };
    } catch (e) { try { Game.endConvo(vid, 'left'); } catch (e2) {} continue; }
  }
  return null;
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

async function runCase(mode) {
  const seed = { 'commit-away': 5541, 'commit-gate': 5542, 'commit-unsupported': 5543, control: 5544 }[mode] || 5541;
  const { Game } = await loadGame({ seed, mode: 'succession-r218-commit-refusal-nobeat-proof', fullTelemetry: true });
  await setupGame(Game);
  const roster = await setupBase(Game);
  const v = Game.state.village || {};

  if (mode === 'commit-gate') {
    // Fear > 70 stages the stay_close need (npcNeeds is the live
    // readings source — v.fear/v.energy maps do not feed it);
    // nothing else acute.
    for (const vid of roster) {
      const n = Game.npcNeeds(vid);
      n.fear = 90; n.hunger = 0; n.energy = 100;
    }
    const st = await openFavorSitting(Game, 'stay_close');
    check(`${mode}: stay_close favor sitting opened`, !!st, 'vid=' + (st && st.vid));
    if (!st) return;
    const vid = st.vid;
    const c = Game.convoGet(vid);
    check(`${mode}: sitting thread is want`, c.thread === 'want', `thread=${c.thread}`);
    // Force the legacy gate failure: companyVersion !== 1.
    st.favor.companyVersion = 0;
    check(`${mode}: dlg:commit NOT offered (menu hides a failed gate)`, !hasChoice(Game, vid, 'dlg:commit'), `choices=${(Game.convoChoices(vid) || []).map(x => x.id).join(',')}`);
    const before = Game.convoLastThreadSnippet(vid, 'want');
    Game.convoTurn(vid, 'dlg:commit');
    const turn = lastNpcLine(Game, vid);
    check(`${mode}: the gate reason IS spoken to the player`, GATE_RE.test(turn), turn.slice(0, 140));
    const after = Game.convoLastThreadSnippet(vid, 'want');
    check(`${mode}: the gate reason does NOT become the thread memory`, !!after && !GATE_RE.test(after), `snippet=${after}`);
    check(`${mode}: the thread memory stays the favor ask`, !!after && /night together|stay|company|fire/i.test(after), `snippet=${after} (before=${before})`);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'commit-unsupported') {
    // Energy < 30 stages the watch_shift need (npcNeeds is the live
    // readings source); nothing else acute.
    for (const vid of roster) {
      const n = Game.npcNeeds(vid);
      n.energy = 10; n.fear = 0; n.hunger = 0;
    }
    const st = await openFavorSitting(Game, 'watch_shift');
    check(`${mode}: watch_shift favor sitting opened`, !!st, 'vid=' + (st && st.vid));
    if (!st) return;
    const vid = st.vid;
    const c = Game.convoGet(vid);
    check(`${mode}: sitting thread is want`, c.thread === 'want', `thread=${c.thread}`);
    check(`${mode}: dlg:commit NOT offered (menu hides unsupported)`, !hasChoice(Game, vid, 'dlg:commit'), `choices=${(Game.convoChoices(vid) || []).map(x => x.id).join(',')}`);
    const before = Game.convoLastThreadSnippet(vid, 'want');
    Game.convoTurn(vid, 'dlg:commit');
    const turn = lastNpcLine(Game, vid);
    check(`${mode}: the unsupported reason IS spoken to the player`, UNSUP_RE.test(turn), turn.slice(0, 140));
    const after = Game.convoLastThreadSnippet(vid, 'want');
    check(`${mode}: the unsupported reason does NOT become the thread memory`, !!after && !UNSUP_RE.test(after), `snippet=${after}`);
    check(`${mode}: the thread memory stays the favor ask`, !!after && /running on empty|take my watch for a bit/i.test(after), `snippet=${after} (before=${before})`);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  // Water-haul cases (commit-away + control): cistern dry + believed dry
  // (setupBase already staged the roster and the dry cistern).
  const st = await openFavorSitting(Game, 'water_haul');
  check(`${mode}: water-haul favor sitting opened`, !!st, 'vid=' + (st && st.vid));
  if (!st) return;
  const vid = st.vid;
  const c = Game.convoGet(vid);
  check(`${mode}: sitting thread is want`, c.thread === 'want', `thread=${c.thread}`);

  if (mode === 'commit-away') {
    // Partner out on the road AFTER the ask was made.
    v.away[vid] = { until: 999 };
    check(`${mode}: dlg:commit IS offered (the menu-reachable seam)`, hasChoice(Game, vid, 'dlg:commit'), `choices=${(Game.convoChoices(vid) || []).map(x => x.id).join(',')}`);
    const before = Game.convoLastThreadSnippet(vid, 'want');
    Game.convoTurn(vid, 'dlg:commit');
    const turn = lastNpcLine(Game, vid);
    check(`${mode}: the away refusal IS spoken to the player`, AWAY_RE.test(turn), turn.slice(0, 140));
    const after = Game.convoLastThreadSnippet(vid, 'want');
    check(`${mode}: the away refusal does NOT become the thread memory`, !!after && !AWAY_RE.test(after), `snippet=${after}`);
    check(`${mode}: the thread memory stays the favor ask`, !!after && ASK_RE.test(after), `snippet=${after} (before=${before})`);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'control') {
    // Partner present, inside/outside matched (default) — a real commit.
    check(`${mode}: dlg:commit IS offered`, hasChoice(Game, vid, 'dlg:commit'), `choices=${(Game.convoChoices(vid) || []).map(x => x.id).join(',')}`);
    Game.convoTurn(vid, 'dlg:commit');
    const turn = lastNpcLine(Game, vid);
    const promised = !!((v.promises || {})[vid] && !(v.promises[vid]).kept);
    check(`${mode}: the commit succeeds (promise created)`, promised, `promises=${JSON.stringify((v.promises || {})[vid] || null)}`);
    check(`${mode}: a thank-you beat IS spoken`, /thank/i.test(turn), turn.slice(0, 140));
    const after = Game.convoLastThreadSnippet(vid, 'want');
    const beatCore = turn.replace(/[""]/g, '').trim().slice(0, 30);
    check(`${mode}: the successful commit beat DOES become thread content (noBeat is refusal-only)`, !!after && !!beatCore && after.replace(/[""]/g, '').includes(beatCore.slice(0, 20)), `snippet=${after} (beat=${turn.slice(0, 80)})`);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode && ['commit-away', 'commit-gate', 'commit-unsupported', 'control'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('commit-away');
    for (const m of ['commit-gate', 'commit-unsupported', 'control']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r218-commit-refusal-nobeat-20261116.js'), m],
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
