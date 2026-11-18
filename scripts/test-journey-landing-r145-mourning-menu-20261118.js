#!/usr/bin/env node
// test-journey-landing-r145-mourning-menu-20261118.js — proof test for the
// r144 metric-review item 3 (mourning watch UNMEASURED on live panels):
// the mourning thread must fire through the REAL conversation menu —
// pick `alive:event:mourning` in a sitting, read the line — with the
// r232 REL-MOURN relationship variants.
//
// What the existing tests do NOT cover:
//   - test-mourning-name-r8.js drives the menu path but predates REL-MOURN
//     and only checks the generic line has no bare-"A" name.
//   - test-journey-succession-r232-relationship-mourning-20261117.js proves
//     REL-MOURN selection, but drives topic2Ask('lately') + topic2Beat
//     directly — it never touches the menu where a player actually picks
//     the thread. A gate that strands the thread behind the menu (the
//     convo-beats.js r8 history) would pass that test and still starve
//     the player.
// This test drives the menu path end to end: startConvo -> find the
// `alive:event:mourning` choice -> convoTurn -> read the transcript line.
//
// Cases (each in its own process — never two harnesses in one process):
//   bond-menu-fires: speaker bonded to the dead (record staged directly).
//     FIXED: the mourning choice is offered in a sitting, AND a bond
//     opener appears within 7 menu sittings, AND every served opener
//     names the dead by first name, AND no served line leaks a literal
//     {mname} or a bare "A". UNFIXED (control case below): no bond
//     opener can appear.
//   bond-menu-silent: same drive with NO bond staged. FIXED: the
//     mourning choice is still offered and the served openers still name
//     the dead, but 0 bond-variant servings in 7 sittings (the gate
//     holds shut for a stranger). This case guards the fix against
//     over-firing, not the base — and it is also the RED control for
//     bond-menu-fires: the same assertion that passes there fails here.
//
// Staging: corpses are staged directly in state.corpses (a real roster
// villager's id + name, kind 'person', dayDied today) with village.grief
// = 1 — the exact event path the game uses for a fresh named corpse
// (t2LatelyEvent fresh-corpse branch), same as the r231/r232 proof tests.
// Bonds are staged as plain state for the same reason: the test is about
// line selection through the menu, and the death itself is out of scope
// here (the panel exercises real deaths).
// Usage: node scripts/test-journey-landing-r145-mourning-menu-20261118.js [case]
//   Default (no arg): runs all cases, spawning children.
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

// Bond-opener markers (r232 REL-MOURN). Distinctive constant substrings,
// regardless of the dead name or the speaker's habit.
const BOND_MARKERS = [
  'was my person at this fire',
  'Really knew them, not the fire',
];
const GENERIC_MARKERS = [
  'keep expecting to see',
  'is gone and the world just',
  'owed me a favor',
  'I dreamed',
  'always took the burnt piece',
];
function isBondOpener(line) {
  return BOND_MARKERS.some(m => String(line).indexOf(m) !== -1);
}
function isKnownOpener(line) {
  return BOND_MARKERS.concat(GENERIC_MARKERS).some(m => String(line).indexOf(m) !== -1);
}
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }

async function setupBase(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  v.trust = v.trust || {};
  for (const vid of roster) v.trust[vid] = 90;
  v.grief = 1;
  Game.state.scholar.day = 40;
  return roster;
}

function stageDeath(Game, vid, witnesses) {
  const day = (Game.state.scholar || {}).day || 40;
  let name = null;
  try {
    const rc = ((Game.state.village || {}).rosterChars || {})[vid];
    if (rc && rc.name) name = rc.name;
  } catch (e) {}
  if (!name) {
    try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) name = ch.name; } catch (e) {}
  }
  if (!name) name = String(vid);
  Game.state.corpses = [{ villagerId: vid, name, kind: 'person', dayDied: day, witnesses: witnesses || [] }];
  try {
    const lin = (typeof Game.lineage === 'function') ? Game.lineage() : null;
    if (lin) lin.push({ name, villagerId: vid, day, cause: 'the wild' });
  } catch (e) {}
  return firstName(name);
}

// Drive ONE menu sitting: open the convo, hunt for the mourning choice,
// pick it, read the line it serves. Returns { offered, line } — offered
// is false when the sitting ends without ever showing the choice.
function driveMenuSitting(Game, vid) {
  const out = { offered: false, line: null };
  try {
    const r = Game.startConvo(vid);
    if (!(r && !r.refused)) return { ...out, refused: true };
    for (let t = 0; t < 12 && !out.offered; t++) {
      const choices = Game.convoChoices(vid) || [];
      const m = choices.find(c => c && c.id === 'alive:event:mourning');
      if (m) {
        out.offered = true;
        Game.convoTurn(vid, m.id);
        const c = Game.convoGet(vid);
        const last = (c.transcript || []).filter(e => e.who !== 'you').slice(-1)[0];
        out.line = last && last.text;
        break;
      }
      // Advance the menu with a neutral pick; never leave early.
      const pick = choices.find(c => c && /^gq:|^ans:q/.test(c.id))
        || choices.find(c => c && !/^(leave|bye|goodbye)/.test(c.id));
      if (!pick || /^(leave|bye|goodbye)/.test(pick.id)) break;
      Game.convoTurn(vid, pick.id);
    }
  } catch (e) { out.error = String(e && e.message); }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return out;
}

// Drive up to N menu sittings about one staged death; return every
// served opener. The lately pool spreads across sittings, so N=7 over a
// 7-template opener pool (5 generic + 2 bond) is the honest positive
// window — same window as the r232 proof test.
function driveMenuSittings(Game, speaker, n) {
  const served = [];
  let offeredCount = 0;
  for (let i = 0; i < n; i++) {
    const d = driveMenuSitting(Game, speaker);
    if (d.offered) offeredCount++;
    if (d.line) served.push(d.line);
  }
  return { served, offeredCount };
}

async function runCase(mode) {
  const seed = { 'bond-menu-fires': 5591, 'bond-menu-silent': 5592 }[mode] || 5591;
  const { Game } = await loadGame({ seed, mode: 'landing-r145-mourning-menu-proof', fullTelemetry: true });
  await setupGame(Game);
  const roster = await setupBase(Game);
  check(`${mode}: roster has >= 7 villagers to stage deaths from`, roster.length >= 7, `roster=${roster.length}`);

  const speaker = roster[0];
  const deadVid = roster[1];
  if (mode === 'bond-menu-fires') {
    const v = Game.state.village || {};
    v.bonds = v.bonds || {};
    const key = (typeof Game.bondKey === 'function') ? Game.bondKey(speaker, deadVid) : [speaker, deadVid].sort().join('|');
    v.bonds[key] = { v: 30, depth: 1, day: 40, dayGain: 0 };
    const gb = (typeof Game.bondGet === 'function') ? Game.bondGet(speaker, deadVid) : null;
    check(`${mode}: staged bond reads back close`, !!(gb && ((gb.v || 0) >= 20 || (gb.depth || 0) >= 1)), JSON.stringify(gb));
  }
  const dname = stageDeath(Game, deadVid, []);
  // The event itself must resolve to named mourning before the menu can
  // offer it — if this fails, the menu drive below would fail silently.
  let ev0 = null;
  try { ev0 = (typeof Game.t2LatelyEvent === 'function') ? Game.t2LatelyEvent(speaker) : null; } catch (e) { ev0 = { err: String(e && e.message) }; }
  check(`${mode}: event resolves to named mourning for ${dname}`, !!(ev0 && ev0.kind === 'mourning' && ev0.name === dname), JSON.stringify(ev0));

  const { served, offeredCount } = driveMenuSittings(Game, speaker, 7);
  check(`${mode}: mourning choice offered in >=1 of 7 menu sittings`, offeredCount >= 1, `offered=${offeredCount}/7 sittings`);
  check(`${mode}: >=1 opener served through the menu`, served.length >= 1, `served=${served.length}`);
  const bondHits = served.filter(isBondOpener);
  const unknownOpeners = served.filter(l => !isKnownOpener(l));
  if (mode === 'bond-menu-fires') {
    check(`${mode}: >=1 bond opener through the menu in 7 sittings`, bondHits.length >= 1, `bond openers=${bondHits.length} templates=${served.map(l => (isBondOpener(l) ? 'bond' : 'generic')).join(',') || 'none'}`);
  } else {
    check(`${mode}: 0 bond-variant servings in 7 menu sittings`, bondHits.length === 0, `bond hits=${bondHits.length} ${bondHits.join(' | ').slice(0, 200)}`);
  }
  check(`${mode}: every served opener names the dead (${dname})`, served.every(l => String(l).indexOf(dname) !== -1), served.map(l => String(l).slice(0, 80)).join(' || '));
  check(`${mode}: no served line leaks a literal {mname}`, served.every(l => String(l).indexOf('{mname}') === -1));
  check(`${mode}: no served line collapses the dead to bare "A"`, served.every(l => !/(^|[^a-zA-Z])A($|[^a-zA-Z])/.test(String(l)) || !/died|thinking about|is gone/.test(String(l))));
  check(`${mode}: every served opener is a known template`, unknownOpeners.length === 0, unknownOpeners.map(l => String(l).slice(0, 100)).join(' || '));
}

const CASES = ['bond-menu-fires', 'bond-menu-silent'];

async function main() {
  const mode = process.argv[2];
  if (mode && CASES.includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('bond-menu-fires');
    for (const m of CASES.slice(1)) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-landing-r145-mourning-menu-20261118.js'), m],
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
