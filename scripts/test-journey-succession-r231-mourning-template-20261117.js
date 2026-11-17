#!/usr/bin/env node
// test-journey-succession-r231-mourning-template-20261117.js — proof test
// for the r231 MOURN-TEMPLATE fix (journey-succession r231).
//
// The r230 panel's watch item: the mourning lines are templated per dead
// person — "I keep expecting to see X at the fire. Stupid." fired 5x,
// "I keep turning over the last thing X said to me…" 4x, "The fire feels
// smaller without X" 2x. Same words, only the name changes.
//
// Root cause (traced this run): the dead person's name is baked into the
// line BEFORE the pick — t2fol_lately's nm() mapping (convoTopics.js)
// substituted {mname} before returning the pools, and t2gen_lately's
// opener built its templates by concatenating the name. convoPick
// dedupes by exact line text, and the village-fresh log + run-ledger
// preference compare text too, so (template x name) counted as a
// distinct line and the same template re-served for every new corpse.
// Fix: {mname} is resolved by t2fill AFTER the pick, so all three
// freshness mechanisms see the template.
//
// Cases (each in its own process — never two harnesses in one process):
//   opener-five-dead: one speaker, five staged deaths in turn (fresh
//     sitting per death). FIXED: all five served openers are DIFFERENT
//     templates (the pick dedupes on template text), each names its own
//     dead, none leaks a literal '{mname}'. UNFIXED: the five draws come
//     from five name-baked lines, so a template repeats (pigeonhole
//     over 5 templates only bites on the 6th draw — the assertion is
//     five DISTINCT templates, which random name-baked draws hit only
//     ~4% of the time; seed 5577 is verified red on the base file).
//   cope-two-speakers: speaker A drives opener+cope about dead 1;
//     speaker B drives opener+cope about dead 2, same day. FIXED: B's
//     opener AND cope templates both differ from A's (the village-fresh
//     log is template-aware once the pick notes the placeholder).
//     UNFIXED: B's pools are name-baked, the village log sees fresh
//     text, and B re-draws A's templates (seed 5578 verified red).
//   name-correct: the served opener for death 2 contains death 2's
//     first name, not death 1's, and no literal '{mname}' survives
//     t2fill (guards the post-pick substitution itself).
//
// Staging note: corpses are staged directly in state.corpses (a real
// roster villager's id + name, kind 'person', dayDied today) with
// village.grief = 1, which is the exact event path the game uses for a
// fresh named corpse (t2LatelyEvent fresh-corpse branch). The staged
// villager is not killed — the test is about line selection, and the
// death itself is out of scope here (the panel exercises real deaths).
// Usage: node scripts/test-journey-succession-r231-mourning-template-20261117.js [opener-five-dead|cope-two-speakers|name-correct]
//   Default (no arg): runs all three cases, spawning children.
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

// Distinctive constant substrings identifying each name-parameterized
// mourning template, regardless of the dead name or the speaker's habit.
const TEMPLATE_MARKERS = {
  'opener:expect-fire': 'keep expecting to see',
  'opener:world-continues': 'is gone and the world just',
  'opener:owed-favor': 'owed me a favor',
  'opener:dreamed': 'I dreamed',
  'opener:burnt-piece': 'always took the burnt piece',
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

function stageDeath(Game, vid) {
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
  Game.state.corpses = [{ villagerId: vid, name, kind: 'person', dayDied: day }];
  // BEARER-NAME PATH (convoTopics.js, journey-succession r20): a fresh
  // corpse whose villagerId matches the lineage's last bearer-death
  // entry is mourned by its recorded true name. Without the lineage
  // entry the name falls back to firstRef, which knowledge-gates it to
  // a stranger descriptor ("the person in their 60s…") in a fresh game
  // where the speaker has met nobody yet — the event would resolve, but
  // to a descriptor, not a name. The lineage entry is the exact path
  // real bearer deaths take (playerDeath records oldName).
  try {
    const lin = (typeof Game.lineage === 'function') ? Game.lineage() : null;
    if (lin) lin.push({ name, villagerId: vid, day, cause: 'the wild' });
  } catch (e) {}
  return firstName(name);
}

function driveLately(Game, vid, beats) {
  const out = { opener: null, followups: [] };
  try {
    const r = Game.startConvo(vid);
    if (!(r && !r.refused)) return { ...out, refused: true };
    // The lately event must resolve to a named mourning event for the
    // staged corpse; fail loudly if the staging did not take.
    const ev = (typeof Game.t2LatelyEvent === 'function') ? Game.t2LatelyEvent(vid) : null;
    out.event = ev ? { kind: ev.kind, name: ev.name } : null;
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

async function runCase(mode) {
  const seed = { 'opener-five-dead': 5577, 'cope-two-speakers': 5578, 'name-correct': 5579 }[mode] || 5577;
  const { Game } = await loadGame({ seed, mode: 'succession-r231-mourning-template-proof', fullTelemetry: true });
  await setupGame(Game);
  const roster = await setupBase(Game);
  check(`${mode}: roster has >= 7 villagers to stage deaths from`, roster.length >= 7, `roster=${roster.length}`);

  if (mode === 'opener-five-dead') {
    const speaker = roster[0];
    const dead = roster.slice(1, 6);
    const served = [];
    for (const dvid of dead) {
      const dname = stageDeath(Game, dvid);
      const d = driveLately(Game, speaker, 0);
      check(`${mode}: event resolves to named mourning for ${dname}`, d.event && d.event.kind === 'mourning' && d.event.name === dname, JSON.stringify(d.event));
      check(`${mode}: opener served for ${dname}`, typeof d.opener === 'string' && d.opener.length > 0, String(d.opener).slice(0, 80));
      served.push({ dead: dname, line: d.opener, template: templateId(d.opener) });
    }
    const templates = served.map(s => s.template);
    const distinct = new Set(templates);
    check(`${mode}: all 5 openers are DIFFERENT templates`, distinct.size === 5, `templates=${templates.join(' | ')}`);
    check(`${mode}: no served line leaks a literal {mname}`, served.every(s => s.line.indexOf('{mname}') === -1), served.map(s => s.line).join(' / ').slice(0, 200));
    check(`${mode}: each opener names its own dead`, served.every(s => s.line.indexOf(s.dead) !== -1), served.map(s => `${s.dead}:${s.line.indexOf(s.dead) !== -1}`).join(', '));
    return;
  }

  if (mode === 'cope-two-speakers') {
    const speakerA = roster[0], speakerB = roster[1];
    const dead1 = stageDeath(Game, roster[2]);
    const a = driveLately(Game, speakerA, 1);
    check(`${mode}: A's opener + cope served about ${dead1}`, typeof a.opener === 'string' && a.followups.length === 1, `opener=${String(a.opener).slice(0, 60)} followups=${a.followups.length}`);
    const dead2 = stageDeath(Game, roster[3]);
    const b = driveLately(Game, speakerB, 1);
    check(`${mode}: B's opener + cope served about ${dead2}`, typeof b.opener === 'string' && b.followups.length === 1, `opener=${String(b.opener).slice(0, 60)} followups=${b.followups.length}`);
    check(`${mode}: B's opener template differs from A's`, templateId(b.opener) !== templateId(a.opener), `A=${templateId(a.opener)} B=${templateId(b.opener)}`);
    check(`${mode}: B's cope template differs from A's`, templateId(b.followups[0]) !== templateId(a.followups[0]), `A=${templateId(a.followups[0])} B=${templateId(b.followups[0])}`);
    check(`${mode}: no served line leaks a literal {mname}`, [a.opener, a.followups[0], b.opener, b.followups[0]].every(l => String(l).indexOf('{mname}') === -1));
    return;
  }

  if (mode === 'name-correct') {
    const speaker = roster[0];
    const dead1 = stageDeath(Game, roster[1]);
    const d1 = driveLately(Game, speaker, 0);
    const dead2 = stageDeath(Game, roster[2]);
    const d2 = driveLately(Game, speaker, 0);
    check(`${mode}: opener 1 names dead 1 (${dead1})`, typeof d1.opener === 'string' && d1.opener.indexOf(dead1) !== -1, String(d1.opener).slice(0, 100));
    check(`${mode}: opener 2 names dead 2 (${dead2}), not dead 1`, typeof d2.opener === 'string' && d2.opener.indexOf(dead2) !== -1 && d2.opener.indexOf(dead1) === -1, String(d2.opener).slice(0, 100));
    check(`${mode}: opener 2 is a different template from opener 1`, templateId(d2.opener) !== templateId(d1.opener), `d1=${templateId(d1.opener)} d2=${templateId(d2.opener)}`);
    check(`${mode}: no literal {mname} in either opener`, [d1.opener, d2.opener].every(l => String(l).indexOf('{mname}') === -1));
    return;
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode && ['opener-five-dead', 'cope-two-speakers', 'name-correct'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('opener-five-dead');
    for (const m of ['cope-two-speakers', 'name-correct']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r231-mourning-template-20261117.js'), m],
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
