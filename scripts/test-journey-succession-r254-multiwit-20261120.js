#!/usr/bin/env node
// test-journey-succession-r254-multiwit-20261120.js — proof test for the
// r254 MULTI-NAME WITNESS VARIANT build (journey-succession r254).
//
// The r248 finding: witnessed deaths arrive clustered (combat kills the
// people standing next to the dead), and the mourning pool serves
// relationship variants ONLY in the single-name branch — with >= 2 fresh
// person corpses the multi-name branch serves 4 generic templates and the
// witness variant cannot draw, exactly when witnessed deaths happen.
// This run adds the witness variant to the multi-name branch, gated on
// the speaker having witnessed the MOST-RECENT fresh dead
// (t2MournRel.witnessed, read from ev.witnesses — the latest corpse's
// witnesses only), with the same {mname} discipline as the single-name
// branch (filled by t2fill AFTER the pick; ev.name is the latest dead).
//
// Cases (each in its own process — never two harnesses in one process):
//   multiwit-fires: speaker in the LATEST corpse's witnesses.
//     FIXED: a witness opener appears within 7 sittings, naming the
//     latest dead. UNFIXED: none (the pool has no witness line in
//     multi-name).
//   multiwit-silent: speaker in NO corpse's witnesses. FIXED: 0 witness
//     openers in 7 sittings (the gate holds shut).
//   multiwit-wrongdead: speaker witnessed the EARLIER corpse only.
//     FIXED: 0 witness openers in 7 sittings — the lines must name the
//     latest dead, and the speaker did not see the latest die. A
//     serving here would be a fabrication, not a pass.
//   multiwit-names-latest: speaker in the latest corpse's witnesses.
//     FIXED: every served witness opener names the LATEST dead (never
//     the earlier one), no served line leaks a literal '{mname}', and
//     the lately event carries both names with name == the latest.
//
// Staging note: two corpses are staged directly in state.corpses (real
// roster villagers' ids + names, kind 'person', dayDied today) with
// village.grief = 1 — the exact event path the game uses for fresh named
// corpses (t2LatelyEvent fresh-corpse branch), same as the r232 proof
// test. The test is about line selection; the deaths themselves are out
// of scope here (the panel exercises real deaths).
// Usage: node scripts/test-journey-succession-r254-multiwit-20261120.js [case]
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

const TEMPLATE_MARKERS = {
  'opener:expect-fire': 'keep expecting to see',
  'opener:world-continues': 'is gone and the world just',
  'opener:owed-favor': 'owed me a favor',
  'opener:dreamed': 'I dreamed',
  'opener:burnt-piece': 'always took the burnt piece',
  'opener:wit-there': 'I was there when',
  'opener:wit-saw': 'go down. I did what I could',
  'opener:multi-lost': 'We lost',
  'opener:multi-gone': 'is gone and',
  'opener:multi-headcount': 'I do the headcount without thinking',
  'opener:multi-fire': "The fire doesn't care",
  'cope:habit-hands': "doesn't bring anyone back",
  'cope:last-words': 'keep turning over the last thing',
  'cope:sleep-strange': "Sleep's gone strange",
  'next:bury-grieve': 'We bury, we grieve',
  'next:name-right': "Nobody says",
  'next:fire-smaller': 'fire feels smaller without',
  'part:remember-them': 'I remember them. Someone has to do it properly',
  'part:pick-up-share': 'picking up',
  'part:habit-for': 'Feels like the least I can do',
};
const WIT_SHAPES = ['opener:wit-there', 'opener:wit-saw'];
function templateId(line) {
  if (typeof line !== 'string') return 'none:' + typeof line;
  for (const [id, mark] of Object.entries(TEMPLATE_MARKERS)) {
    if (line.indexOf(mark) !== -1) return id;
  }
  return 'unknown:' + line.slice(0, 60);
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

function stageDeaths(Game, entries) {
  // entries: [{vid, witnesses}] in death order — the LAST entry is the
  // most-recent fresh corpse (ev.name / ev.deadId / ev.witnesses read it).
  const day = (Game.state.scholar || {}).day || 40;
  const corpses = [];
  const names = [];
  for (const e of entries) {
    let name = null;
    try {
      const rc = ((Game.state.village || {}).rosterChars || {})[e.vid];
      if (rc && rc.name) name = rc.name;
    } catch (err) {}
    if (!name) {
      try { const ch = (Game.data.villagers || []).find(x => x.id === e.vid); if (ch && ch.name) name = ch.name; } catch (err) {}
    }
    if (!name) name = String(e.vid);
    corpses.push({ villagerId: e.vid, name, kind: 'person', dayDied: day, witnesses: e.witnesses || [] });
    names.push(firstName(name));
    try {
      const lin = (typeof Game.lineage === 'function') ? Game.lineage() : null;
      if (lin) lin.push({ name, villagerId: e.vid, day, cause: 'the wild' });
    } catch (err) {}
  }
  Game.state.corpses = corpses;
  return names;
}

function driveLately(Game, vid, beats) {
  const out = { opener: null, followups: [] };
  try {
    const r = Game.startConvo(vid);
    if (!(r && !r.refused)) return { ...out, refused: true };
    const ev = (typeof Game.t2LatelyEvent === 'function') ? Game.t2LatelyEvent(vid) : null;
    out.event = ev ? { kind: ev.kind, name: ev.name, names: ev.names || null } : null;
    out.opener = Game.topic2Ask(vid, 'lately');
    for (let i = 0; i < (beats || 0); i++) {
      const b = Game.topic2Beat(vid);
      if (b == null) break;
      out.followups.push(b);
    }
  } catch (e) { out.error = String(e && e.message); }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return out;
}

// Drive N sittings about the staged deaths; return every served line
// with its template id. The multi-name opener pool is 4 generic (+ 2
// witness when gated open), so N=7 is the honest positive window — the
// village-fresh + run-ledger preferences spread the pool across
// sittings, and per-speaker dedupe retires each template after one
// serving.
function driveSittings(Game, speaker, n) {
  const served = [];
  for (let i = 0; i < n; i++) {
    const d = driveLately(Game, speaker, 3);
    if (d.opener) served.push({ line: d.opener, template: templateId(d.opener) });
    for (const f of d.followups) served.push({ line: f, template: templateId(f) });
  }
  return served;
}

async function runCase(mode) {
  const seed = { 'multiwit-fires': 5588, 'multiwit-silent': 5589, 'multiwit-wrongdead': 5590, 'multiwit-names-latest': 5591 }[mode] || 5588;
  const { Game } = await loadGame({ seed, mode: 'succession-r254-multiwit-proof', fullTelemetry: true });
  await setupGame(Game);
  const roster = await setupBase(Game);
  check(`${mode}: roster has >= 7 villagers to stage deaths from`, roster.length >= 7, `roster=${roster.length}`);

  const speaker = roster[0];
  const earlyVid = roster[1]; // earlier fresh corpse
  const lateVid = roster[2]; // most-recent fresh corpse (ev.name)
  let witnesses;
  if (mode === 'multiwit-fires' || mode === 'multiwit-names-latest') witnesses = { early: [], late: [speaker] };
  else if (mode === 'multiwit-wrongdead') witnesses = { early: [speaker], late: [] };
  else witnesses = { early: [], late: [] };
  const names = stageDeaths(Game, [
    { vid: earlyVid, witnesses: witnesses.early },
    { vid: lateVid, witnesses: witnesses.late },
  ]);
  const earlyName = names[0], lateName = names[1];

  const d0 = driveLately(Game, speaker, 0);
  check(`${mode}: event resolves to multi-name mourning naming both dead`, d0.event && d0.event.kind === 'mourning' && d0.event.name === lateName && Array.isArray(d0.event.names) && d0.event.names.length === 2, JSON.stringify(d0.event));

  const served = driveSittings(Game, speaker, 7);
  const witHits = served.filter(s => WIT_SHAPES.indexOf(s.template) !== -1);
  if (mode === 'multiwit-fires') {
    check(`${mode}: >=1 witness opener in 7 sittings`, witHits.length >= 1, `wit openers=${witHits.length} templates=${witHits.map(s => s.template).join(',') || 'none'}`);
    check(`${mode}: every witness opener names the latest dead (${lateName})`, witHits.every(s => s.line.indexOf(lateName) !== -1), witHits.map(s => s.line.slice(0, 80)).join(' | '));
  } else if (mode === 'multiwit-silent') {
    check(`${mode}: 0 witness openers when the speaker witnessed neither death`, witHits.length === 0, `wit hits=${witHits.length} ${witHits.map(s => s.template).join(',')}`);
  } else if (mode === 'multiwit-wrongdead') {
    check(`${mode}: 0 witness openers when the speaker witnessed only the earlier death`, witHits.length === 0, `wit hits=${witHits.length} ${witHits.map(s => s.template).join(',')}`);
  } else if (mode === 'multiwit-names-latest') {
    check(`${mode}: >=1 witness opener in 7 sittings`, witHits.length >= 1, `wit openers=${witHits.length} templates=${witHits.map(s => s.template).join(',') || 'none'}`);
    check(`${mode}: no witness opener names the earlier dead (${earlyName})`, witHits.every(s => s.line.indexOf(earlyName) === -1), witHits.map(s => s.line.slice(0, 80)).join(' | '));
    check(`${mode}: every witness opener names the latest dead (${lateName})`, witHits.every(s => s.line.indexOf(lateName) !== -1), witHits.map(s => s.line.slice(0, 80)).join(' | '));
  }
  check(`${mode}: no served line leaks a literal {mname}`, served.every(s => s.line.indexOf('{mname}') === -1));
  check(`${mode}: no exhausted line served while variants remain`, served.every(s => s.line.indexOf("I've told you everything") === -1), served.map(s => s.template).join(','));
}

const CASES = ['multiwit-fires', 'multiwit-silent', 'multiwit-wrongdead', 'multiwit-names-latest'];

async function main() {
  const mode = process.argv[2];
  if (mode && CASES.includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('multiwit-fires');
    for (const m of CASES.slice(1)) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r254-multiwit-20261120.js'), m],
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
