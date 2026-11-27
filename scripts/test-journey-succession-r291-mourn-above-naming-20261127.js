// Proof: journey-succession r291 — mourning above the naming debate.
//
// r291 panel (26 seeds, instrument-only): LATELY-DISPLACER 3/3 — every
// fired witness sitting served kind 'naming' instead of mourning while
// village grief was live (34599 Onni/Theo, 34604 Jada/Grace, 34605
// Devon/Mwirigi; all ambush deaths). Witness variant served 0/3.
// Root cause: in t2LatelyEvent (convoTopics.js) the NAMING DEBATE block
// returned before the grief block, and its yield guards covered a severe
// outbreak, weirdness, the table, and a fresh show — but NOT grief or
// the mantle. The documented priority (table comment: "below fresh
// grief, the mantle...") already put mourning above naming; the code
// didn't implement it.
//
// Fix: the grief block and the mantle-memory block now sit ABOVE the
// naming block (pure reorder + yield comments, no logic change).
//
// Cases (each in its own process; never two harnesses in one process):
//   grief-beats-naming — grief live + fresh corpse + naming debate live:
//                 FIXED: lately is named mourning for the dead, and the
//                 sitting serves a mourning line naming the dead.
//                 UNFIXED: lately is 'naming' (RED).
//   mantle-beats-naming — grief 0 + bearer death inside the 10-day tail
//                 + naming live: FIXED mourning (bearer), UNFIXED 'naming'.
//   naming-alone  — naming live, no grief, no mantle tail: 'naming' on
//                 both tips — the fix must not change the unblocked path.
//   grief-nameless — grief live, no fresh corpse, naming live: FIXED
//                 mourning with name null (nameless variants); UNFIXED
//                 'naming'.
//
// Usage: node scripts/test-journey-succession-r291-mourn-above-naming-20261127.js [case]
//   case: grief-beats-naming | mantle-beats-naming | naming-alone | grief-nameless | all (default)
'use strict';
const { execFileSync } = require('child_process');
const CASE = process.argv[2] || 'all';
const CASES = ['grief-beats-naming', 'mantle-beats-naming', 'naming-alone', 'grief-nameless'];
const SEED = { 'grief-beats-naming': 2911, 'mantle-beats-naming': 2912, 'naming-alone': 2913, 'grief-nameless': 2914 };

const DRY = [
  '"...Sorry, lost my train of thought."',
  '"Hm. Never mind — go on."',
  '"...Actually, forget it."',
  '"...Where was I? Gone. Ask me something else."',
  '"Huh. That went clean out of my head."',
  '"...No, it\'s not coming back. What were you saying?"',
  '"Lost it. The thought, I mean. Go on."',
  '"...Sorry — that one slipped away from me."',
];
const isDry = (t) => DRY.some(d => String(t || '').includes(d.replace(/"/g, '')));
function lastNpcLine(Game, vid) {
  const c = Game.convoGet(vid);
  const tr = (c && c.transcript) || [];
  for (let i = tr.length - 1; i >= 0; i--) {
    if (tr[i].who === 'them') return String(tr[i].text || '');
  }
  return '';
}
function transcriptHasDry(Game, vid) {
  const c = Game.convoGet(vid);
  const tr = (c && c.transcript) || [];
  return tr.some(e => e.who === 'them' && isDry(e.text));
}
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function villagerName(Game, vid) {
  try {
    const rc = ((Game.state.village || {}).rosterChars || {})[vid];
    if (rc && rc.name) return rc.name;
  } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid);
}
// A beast awaiting its village name: namingKicked, no villageName.
function stageNamingDebate(Game) {
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.monsters = { 'sunbasker': { namingKicked: true } };
  return !!(typeof Game.monsterNamingActive === 'function' && Game.monsterNamingActive());
}
function stageFreshCorpse(Game, vid, dayDied) {
  const name = villagerName(Game, vid);
  Game.state.corpses = [{ villagerId: vid, name, kind: 'person', dayDied, witnesses: [] }];
  try {
    const lin = (typeof Game.lineage === 'function') ? Game.lineage() : null;
    if (lin) lin.push({ name, villagerId: vid, day: dayDied, cause: 'the wild' });
  } catch (e) {}
  return firstName(name);
}
function stageBearerDeath(Game, vid, dayDied) {
  const name = villagerName(Game, vid);
  Game.state.corpses = [];
  try {
    const lin = (typeof Game.lineage === 'function') ? Game.lineage() : null;
    if (lin) lin.push({ name, villagerId: vid, day: dayDied, cause: 'the wild' });
  } catch (e) {}
  return firstName(name);
}

async function runCase(mode) {
  const { loadGame, setupGame } = require('./sim-harness.js');
  const { Game } = await loadGame({ seed: SEED[mode], mode: 'succession-r291-mourn-above-naming-proof', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  v.trust = v.trust || {};
  for (const id of roster) v.trust[id] = 90;
  Game.state.scholar.day = 40;
  const results = [];
  function ok(label, cond, detail) { results.push([label, !!cond, String(detail == null ? '' : detail)]); }
  ok(mode + ': roster has >= 3 villagers', roster.length >= 3, 'roster=' + roster.length);
  if (roster.length < 3) { console.log('FAIL roster too small'); process.exit(1); }
  const speaker = roster[0];
  const deadVid = roster[1];

  if (mode === 'grief-beats-naming') {
    v.grief = 1;
    const dname = stageFreshCorpse(Game, deadVid, 37);
    ok(mode + ': naming debate is live', stageNamingDebate(Game), '');
    const ev = Game.t2LatelyEvent(speaker);
    ok(mode + ': lately is named mourning for ' + dname, !!(ev && ev.kind === 'mourning' && ev.name === dname && ev.deadId === deadVid), JSON.stringify(ev));
    if (!ev || ev.kind !== 'mourning') { console.log('FAIL lately is not mourning: ' + JSON.stringify(ev)); process.exit(1); }
    Game.startConvo(speaker);
    Game.convoTurn(speaker, 'alive:event:mourning');
    const served = lastNpcLine(Game, speaker);
    ok(mode + ': sitting serves a line naming the dead', served.indexOf(dname) !== -1, JSON.stringify(served));
    ok(mode + ': sitting has no dry line', !transcriptHasDry(Game, speaker), '');
  } else if (mode === 'mantle-beats-naming') {
    v.grief = 0;
    const dname = stageBearerDeath(Game, deadVid, 35);
    ok(mode + ': naming debate is live', stageNamingDebate(Game), '');
    const ev = Game.t2LatelyEvent(speaker);
    ok(mode + ': lately is bearer mourning for ' + dname, !!(ev && ev.kind === 'mourning' && ev.name === dname && ev.bearer === true), JSON.stringify(ev));
  } else if (mode === 'naming-alone') {
    v.grief = 0;
    Game.state.corpses = [];
    ok(mode + ': naming debate is live', stageNamingDebate(Game), '');
    const ev = Game.t2LatelyEvent(speaker);
    ok(mode + ': lately is still the naming debate', !!(ev && ev.kind === 'naming' && ev.mid === 'sunbasker'), JSON.stringify(ev));
  } else if (mode === 'grief-nameless') {
    v.grief = 1;
    Game.state.corpses = [];
    ok(mode + ': naming debate is live', stageNamingDebate(Game), '');
    const ev = Game.t2LatelyEvent(speaker);
    ok(mode + ': lately is nameless mourning (grief real, no body)', !!(ev && ev.kind === 'mourning' && ev.name === null), JSON.stringify(ev));
  }

  let fails = 0;
  for (const [label, pass, detail] of results) {
    console.log((pass ? 'PASS' : 'FAIL') + ' ' + label + (detail ? ' — ' + detail : ''));
    if (!pass) fails++;
  }
  console.log(mode.toUpperCase() + ' ' + (fails === 0 ? 'PASS' : 'FAIL') + ' (' + (results.length - fails) + '/' + results.length + ')');
  process.exit(fails === 0 ? 0 : 1);
}
if (CASE === 'all') {
  let fails = 0;
  for (const name of CASES) {
    try {
      execFileSync(process.execPath, [__filename, name], { stdio: 'inherit' });
    } catch (e) { fails++; }
  }
  console.log('ALL ' + (fails === 0 ? 'PASS' : 'FAIL') + ' (' + (CASES.length - fails) + '/' + CASES.length + ' cases)');
  process.exit(fails === 0 ? 0 : 1);
} else if (CASES.indexOf(CASE) >= 0) {
  runCase(CASE);
} else {
  console.log('unknown case: ' + CASE);
  process.exit(1);
}
