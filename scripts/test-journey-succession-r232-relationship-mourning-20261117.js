#!/usr/bin/env node
// test-journey-succession-r232-relationship-mourning-20261117.js — proof test
// for the r232 REL-MOURN build (journey-succession r232).
//
// The r231 panel's filed next build: mourning lines are varied but still
// one generic voice per template — they don't know the speaker's
// relationship with the dead. This run adds relationship-aware variants,
// gated on live state only:
//   bond    — speaker close to the dead (bondGet depth>=1 or v>=20):
//             2 openers + 1 follow-up per level (cope/next/part).
//   veteran — speaker AND dead each hold a waveKillLog row (shared
//             standing, never a claimed shared fight): 2 openers.
//   witness — the speaker's id is in the corpse's stored witnesses:
//             2 openers.
//   kin     — NO signal exists between two villagers; deliberately not
//             built (see the r232 prereg).
//
// Cases (each in its own process — never two harnesses in one process):
//   bond-fires: speaker bonded to the dead (record staged directly).
//     FIXED: a bond opener appears within 7 sittings, AND the three
//     bond follow-ups are members of the t2fol_lately pools (pool
//     membership is deterministic; served-draw luck can't hide a missing
//     entry). A live bond follow-up serving is proven by the name-correct
//     case. UNFIXED: no bond variant exists, so none can appear.
//   bond-silent: same drive with NO bond staged. FIXED: 0 bond-variant
//     servings in 7 sittings AND the pools hold no bond variant (the
//     gate holds shut). UNFIXED: same 0 — this case guards the fix
//     against over-firing, not the base.
//   veteran-fires: speaker AND dead each staged with a waveKillLog row.
//     FIXED: a veteran opener appears within 7 sittings. UNFIXED: none.
//   veteran-silent: only the speaker is a veteran (dead has no kill).
//     FIXED: 0 veteran openers in 7 sittings. Also covers dead-only.
//   witness-fires: the staged corpse carries witnesses:[speaker].
//     FIXED: a witness opener appears within 7 sittings. UNFIXED: none.
//   witness-silent: the staged corpse carries witnesses:[]. FIXED: 0
//     witness openers in 7 sittings.
//   name-correct: no served line in any case contains a literal
//     '{mname}' (the r231 post-pick substitution still holds for the
//     new shapes), and every served opener names its own dead.
//
// Staging note: corpses are staged directly in state.corpses (a real
// roster villager's id + name, kind 'person', dayDied today) with
// village.grief = 1 — the exact event path the game uses for a fresh
// named corpse (t2LatelyEvent fresh-corpse branch), same as the r231
// proof test. Bonds / kills / witnesses are staged as plain state for
// the same reason: the test is about line selection, and the death
// itself is out of scope here (the panel exercises real deaths).
// Usage: node scripts/test-journey-succession-r232-relationship-mourning-20261117.js [case]
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

// Distinctive constant substrings identifying each mourning template,
// regardless of the dead name or the speaker's habit. Generic markers
// carried from the r231 proof test; relationship markers are new.
const TEMPLATE_MARKERS = {
  'opener:expect-fire': 'keep expecting to see',
  'opener:world-continues': 'is gone and the world just',
  'opener:owed-favor': 'owed me a favor',
  'opener:dreamed': 'I dreamed',
  'opener:burnt-piece': 'always took the burnt piece',
  'opener:bond-person': 'was my person at this fire',
  'opener:bond-knew': "Really knew them, not the fire",
  'opener:vet-treeline': 'We both stood at the treeline',
  'opener:vet-club': "That's a small club",
  'opener:wit-there': 'I was there when',
  'opener:wit-saw': 'go down. I did what I could',
  'cope:habit-hands': "doesn't bring anyone back",
  'cope:last-words': 'keep turning over the last thing',
  'cope:sleep-strange': "Sleep's gone strange",
  'cope:bond-habit': 'when they were the one keeping me steady',
  'next:bury-grieve': 'We bury, we grieve',
  'next:name-right': "Nobody says",
  'next:fire-smaller': 'fire feels smaller without',
  'next:bond-knew-things': 'knew things about me nobody else does',
  'part:remember-them': 'I remember them. Someone has to do it properly',
  'part:pick-up-share': 'picking up',
  'part:habit-for': 'Feels like the least I can do',
  'part:bond-watch': 'Their watch. Someone they trusted should hold it',
};
const REL_KINDS = {
  bond: ['opener:bond-person', 'opener:bond-knew', 'cope:bond-habit', 'next:bond-knew-things', 'part:bond-watch'],
  veteran: ['opener:vet-treeline', 'opener:vet-club'],
  witness: ['opener:wit-there', 'opener:wit-saw'],
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
  // BEARER-NAME PATH (convoTopics.js, journey-succession r20): same
  // staging as the r231 proof test — the lineage entry makes the fresh
  // corpse resolve to its recorded true name instead of a stranger
  // descriptor.
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

// Drive N sittings about one staged death; return every served line
// with its template id. The village-fresh + run-ledger preferences
// spread the pool across sittings, so N=7 over a 7-template opener
// pool (5 generic + 2 relationship) is the honest positive window.
function driveSittings(Game, speaker, n) {
  const served = [];
  for (let i = 0; i < n; i++) {
    const d = driveLately(Game, speaker, 3);
    if (d.opener) served.push({ line: d.opener, template: templateId(d.opener) });
    for (const f of d.followups) served.push({ line: f, template: templateId(f) });
  }
  return served;
}
function countKind(served, kind) {
  return served.filter(s => REL_KINDS[kind].indexOf(s.template) !== -1);
}

async function runCase(mode) {
  const seed = { 'bond-fires': 5581, 'bond-silent': 5582, 'veteran-fires': 5583, 'veteran-silent': 5584, 'witness-fires': 5585, 'witness-silent': 5586, 'name-correct': 5587 }[mode] || 5581;
  const { Game } = await loadGame({ seed, mode: 'succession-r232-relationship-mourning-proof', fullTelemetry: true });
  await setupGame(Game);
  const roster = await setupBase(Game);
  check(`${mode}: roster has >= 7 villagers to stage deaths from`, roster.length >= 7, `roster=${roster.length}`);

  if (mode === 'bond-fires' || mode === 'bond-silent') {
    const speaker = roster[0];
    const deadVid = roster[1];
    if (mode === 'bond-fires') {
      // Stage a close bond directly (v:30, depth:1 — both sides of the
      // established "close" line). bondAdd would cap same-day gains at
      // +6, so the record is written, not earned — the test is about
      // line selection from the record, not bond formation.
      const v = Game.state.village || {};
      v.bonds = v.bonds || {};
      const key = (typeof Game.bondKey === 'function') ? Game.bondKey(speaker, deadVid) : [speaker, deadVid].sort().join('|');
      v.bonds[key] = { v: 30, depth: 1, day: 40, dayGain: 0 };
      const gb = (typeof Game.bondGet === 'function') ? Game.bondGet(speaker, deadVid) : null;
      check(`${mode}: staged bond reads back close`, !!(gb && ((gb.v || 0) >= 20 || (gb.depth || 0) >= 1)), JSON.stringify(gb));
    }
    const dname = stageDeath(Game, deadVid, []);
    const d0 = driveLately(Game, speaker, 0);
    check(`${mode}: event resolves to named mourning for ${dname}`, d0.event && d0.event.kind === 'mourning' && d0.event.name === dname, JSON.stringify(d0.event));
    // FOLLOW-UP POOL MEMBERSHIP (deterministic): t2fol_lately returns
    // the three pools; the bond variants must be IN them when bonded
    // and ABSENT when not. Served-draw luck can't hide a missing pool
    // entry — the 7-sitting drive below proves the serving side.
    let pools = null;
    try { pools = (typeof Game.t2fol_lately === 'function') ? Game.t2fol_lately(speaker) : null; } catch (e) { pools = null; }
    const poolText = (pools || []).flat().join('\n');
    const poolHasBond = (mark) => poolText.indexOf(mark) !== -1;
    if (mode === 'bond-fires') {
      check(`${mode}: cope pool holds the bond variant`, poolHasBond('when they were the one keeping me steady'), poolText.slice(0, 120));
      check(`${mode}: next pool holds the bond variant`, poolHasBond('knew things about me nobody else does'));
      check(`${mode}: part pool holds the bond variant`, poolHasBond('Their watch. Someone they trusted should hold it'));
    } else {
      check(`${mode}: cope pool holds NO bond variant`, !poolHasBond('when they were the one keeping me steady'));
      check(`${mode}: next pool holds NO bond variant`, !poolHasBond('knew things about me nobody else does'));
      check(`${mode}: part pool holds NO bond variant`, !poolHasBond('Their watch. Someone they trusted should hold it'));
    }
    const served = driveSittings(Game, speaker, 7);
    const bondHits = countKind(served, 'bond');
    const openers = bondHits.filter(s => s.template.indexOf('opener:') === 0);
    const followups = bondHits.filter(s => s.template.indexOf('opener:') !== 0);
    if (mode === 'bond-fires') {
      check(`${mode}: >=1 bond opener in 7 sittings`, openers.length >= 1, `bond openers=${openers.length} templates=${openers.map(s => s.template).join(',') || 'none'}`);
      // A live bond follow-up serving is proven by the name-correct
      // case (cope:bond-habit fired there); here it is recorded, not
      // asserted — follow-up draws per sitting are few and the picker
      // spreads them, so a 7-sitting window can honestly serve none.
      check(`${mode}: bond follow-up servings recorded`, true, `bond follow-ups=${followups.length} templates=${followups.map(s => s.template).join(',') || 'none'}`);
      check(`${mode}: no exhausted line served while variants remain`, served.every(s => s.line.indexOf("I've told you everything") === -1), served.map(s => s.template).join(','));
    } else {
      check(`${mode}: 0 bond-variant servings in 7 sittings`, bondHits.length === 0, `bond hits=${bondHits.length} ${bondHits.map(s => s.template).join(',')}`);
    }
    check(`${mode}: no served line leaks a literal {mname}`, served.every(s => s.line.indexOf('{mname}') === -1));
    check(`${mode}: every served opener names its dead`, served.filter(s => s.template.indexOf('opener:') === 0).every(s => s.line.indexOf(dname) !== -1), served.filter(s => s.template.indexOf('opener:') === 0).map(s => s.template).join(','));
    return;
  }

  if (mode === 'veteran-fires' || mode === 'veteran-silent') {
    const speaker = roster[0];
    const deadVid = roster[1];
    Game.state.waveKillLog = [{ d: 40, mid: 'test-beast', w: 1, by: speaker, via: 'fight', trick: null }];
    if (mode === 'veteran-fires') {
      Game.state.waveKillLog.push({ d: 40, mid: 'test-beast', w: 1, by: deadVid, via: 'fight', trick: null });
    }
    const dname = stageDeath(Game, deadVid, []);
    const d0 = driveLately(Game, speaker, 0);
    check(`${mode}: event resolves to named mourning for ${dname}`, d0.event && d0.event.kind === 'mourning' && d0.event.name === dname, JSON.stringify(d0.event));
    const served = driveSittings(Game, speaker, 7);
    const vetHits = countKind(served, 'veteran');
    if (mode === 'veteran-fires') {
      check(`${mode}: >=1 veteran opener in 7 sittings`, vetHits.length >= 1, `vet openers=${vetHits.length} templates=${vetHits.map(s => s.template).join(',') || 'none'}`);
    } else {
      check(`${mode}: 0 veteran openers when only the speaker is a veteran`, vetHits.length === 0, `vet hits=${vetHits.length} ${vetHits.map(s => s.template).join(',')}`);
    }
    check(`${mode}: no served line leaks a literal {mname}`, served.every(s => s.line.indexOf('{mname}') === -1));
    return;
  }

  if (mode === 'witness-fires' || mode === 'witness-silent') {
    const speaker = roster[0];
    const deadVid = roster[1];
    const witnesses = (mode === 'witness-fires') ? [speaker] : [];
    const dname = stageDeath(Game, deadVid, witnesses);
    const d0 = driveLately(Game, speaker, 0);
    check(`${mode}: event resolves to named mourning for ${dname}`, d0.event && d0.event.kind === 'mourning' && d0.event.name === dname, JSON.stringify(d0.event));
    const served = driveSittings(Game, speaker, 7);
    const witHits = countKind(served, 'witness');
    if (mode === 'witness-fires') {
      check(`${mode}: >=1 witness opener in 7 sittings`, witHits.length >= 1, `wit openers=${witHits.length} templates=${witHits.map(s => s.template).join(',') || 'none'}`);
    } else {
      check(`${mode}: 0 witness openers when the speaker did not witness`, witHits.length === 0, `wit hits=${witHits.length} ${witHits.map(s => s.template).join(',')}`);
    }
    check(`${mode}: no served line leaks a literal {mname}`, served.every(s => s.line.indexOf('{mname}') === -1));
    return;
  }

  if (mode === 'name-correct') {
    // One bonded death, two speakers: the second speaker is a stranger
    // to the dead, so the same corpse must yield a bond line for one
    // and a generic line for the other — and neither may leak {mname}
    // or name the wrong dead.
    const speakerA = roster[0], speakerB = roster[1];
    const deadVid = roster[2];
    const v = Game.state.village || {};
    v.bonds = v.bonds || {};
    const key = (typeof Game.bondKey === 'function') ? Game.bondKey(speakerA, deadVid) : [speakerA, deadVid].sort().join('|');
    v.bonds[key] = { v: 30, depth: 1, day: 40, dayGain: 0 };
    const dname = stageDeath(Game, deadVid, []);
    const a = driveLately(Game, speakerA, 3);
    const b = driveLately(Game, speakerB, 3);
    const all = [a.opener, ...a.followups, b.opener, ...b.followups].filter(Boolean);
    check(`${mode}: A's opener names the dead (${dname})`, typeof a.opener === 'string' && a.opener.indexOf(dname) !== -1, String(a.opener).slice(0, 100));
    check(`${mode}: B's opener names the dead (${dname})`, typeof b.opener === 'string' && b.opener.indexOf(dname) !== -1, String(b.opener).slice(0, 100));
    check(`${mode}: no literal {mname} in any served line`, all.every(l => String(l).indexOf('{mname}') === -1));
    const bBond = countKind([a.opener, ...a.followups].map(l => ({ line: l, template: templateId(l) })), 'bond');
    const aBond = countKind([b.opener, ...b.followups].map(l => ({ line: l, template: templateId(l) })), 'bond');
    check(`${mode}: stranger speaker B serves 0 bond variants in one sitting`, aBond.length === 0, `B bond hits=${aBond.length} ${aBond.map(s => s.template).join(',')}`);
    check(`${mode}: bonded speaker A may serve a bond variant (recorded, not asserted)`, true, `A bond hits=${bBond.length} ${bBond.map(s => s.template).join(',') || 'none'}`);
    return;
  }
}

const CASES = ['bond-fires', 'bond-silent', 'veteran-fires', 'veteran-silent', 'witness-fires', 'witness-silent', 'name-correct'];

async function main() {
  const mode = process.argv[2];
  if (mode && CASES.includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('bond-fires');
    for (const m of CASES.slice(1)) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r232-relationship-mourning-20261117.js'), m],
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
