#!/usr/bin/env node
// Proof: lesson-beat hygiene (journey establishment r6, 2026-10-12).
//
// Two sense-failures caught live in r6 transcripts:
//   A. MONSTER-LESSON TEMPLATE REPETITION — "Teach me something from the
//      wild." spoke one generic template for every species ("the tracks,
//      the sound it makes before it moves, where not to stand"), and
//      agencyTeachMonster's narrator beat repeated the SAME template, so a
//      single teach doubled it ("...walks you through it — the tracks..."
//      then the villager: "The X — the tracks..."). Five teaches = five
//      copies with a swapped name. Fixed: lessons teach the monster's real
//      tell (first sentence of its primary-attack telegraph, data) + when
//      it hunts; the narrator beat now only frames + records the codex
//      effect. Counter TRICKS stay gated (beasttricks/discoverMonsterCounter
//      — slain types only): field lessons teach 'observed'-level knowledge.
//      Also fixed: "The ${monsterDisplayName}" article-doubling pre-naming
//      ("The a dog-shaped silence...") via monsterNoun.
//   B. WATER-HAUL FAVOR QUOTE MIXING — the water favor glued its ask OUTSIDE
//      the quotes ("The cistern's nearly dry — 4 liters left." I can't
//      carry enough alone...) — the player couldn't tell what was spoken vs.
//      narrated, and the ask IS the favor (the menu's commit/decline answers
//      it). Fixed: the whole favor line + whyLine are quoted speech, like
//      every sibling favor.
// RED on pristine (old templates present in HEAD source; behavioral on the
// fixed tree), GREEN fixed.
// Usage: node scripts/test-est-lesson-beats-r6-20261012.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let _s = 20261012;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global;
const EXCLUDE = new Set(['app.js', 'sprites.js', 'tile-scenes.js', 'move-anim.js', 'drama.js']);
const files = [];
{
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const seen = new Set();
  for (const m of html.matchAll(/src="([^"]+)"/g)) {
    let f = m[1].split('?')[0];
    if (!f.endsWith('.js')) continue;
    const base = path.basename(f);
    if (EXCLUDE.has(base)) continue;
    if (seen.has(f)) continue;
    seen.add(f);
    files.push(f);
  }
}
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}

// ---------- RED-verification against the pristine base ----------
// NOTE: this must be the PARENT of the fix commit (the base the branch was
// built on), not HEAD itself — after a rebase HEAD is the fix commit, and
// these checks would trivially fail. The sibling's base commit is pristine
// for these files (their commit touched only scripts/evidence).
const baseSha = execSync('git rev-parse HEAD~1', { cwd: ROOT, encoding: 'utf8' }).trim();
const vaHead = execSync(`git show ${baseSha}:src/js/villager-agency.js`, { cwd: ROOT, encoding: 'utf8' });
const cwHead = execSync(`git show ${baseSha}:src/js/convo-wants.js`, { cwd: ROOT, encoding: 'utf8' });
check('RED: pristine narrator beat had the doubled template',
  vaHead.includes('walks you through it — the tracks, the sound it makes before it moves'),
  'old 📖 template not found in HEAD source');
check('RED: pristine spoken lesson was the generic template',
  vaHead.includes('"The ${mwhat} — the tracks, the sound it makes before it moves'),
  'old spoken template not found in HEAD source');
check('RED: pristine water_haul glued the ask outside the quotes',
  cwHead.includes("const line = openers[hh % 3] + ' ' + asks[(hh >>> 2) % 3];"),
  'old mixed-quote composition not found in HEAD source');

(async () => {
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];

  // ---------- A. per-monster lessons ----------
  const GENERIC = 'the tracks, the sound it makes before it moves';
  const mids = ['bulldozer', 'hushwolf', 'gallowdeer', 'mirrormoth', 'belltoad',
    'voice_mimic_radio', 'moderator', 'union_rep', 'nevermore', 'statickite', 'giant_mosquito'];
  const lines = {};
  for (const mid of mids) {
    const line = Game.agencyMonsterLessonLine(mid);
    lines[mid] = line;
    check(`lesson ${mid}: not the generic template`, !line.includes(GENERIC), line.slice(0, 80));
    check(`lesson ${mid}: quoted speech`, line.startsWith('"') && line.endsWith('"'), line.slice(0, 60));
    check(`lesson ${mid}: no article doubling`, !/The (a |an |the )/i.test(line), line.slice(0, 70));
    const dq = (line.match(/"/g) || []).length;
    check(`lesson ${mid}: balanced double-quotes`, dq % 2 === 0, line.slice(0, 70));
    check(`lesson ${mid}: deterministic`, Game.agencyMonsterLessonLine(mid) === line, 'same mid gave different text');
  }
  check('lessons differ across species', new Set(Object.values(lines)).size === mids.length,
    'two species share a lesson line');
  // prose descriptors (union_rep) fall back to 'something', never mangled
  check('lesson union_rep: prose descriptor not mangled into grammar',
    !lines.union_rep.includes('clipboard'), lines.union_rep.slice(0, 90));
  // the tell is the monster's own data: bulldozer's telegraph first sentence
  check('lesson bulldozer: teaches the real tell',
    lines.bulldozer.includes('Lowers its head, paws the earth.'), lines.bulldozer);
  check('lesson bulldozer: teaches when it hunts',
    lines.bulldozer.includes('by day'), lines.bulldozer);
  check('lesson hushwolf: nocturnal warning',
    lines.hushwolf.includes('at night'), lines.hushwolf);
  // tricks stay gated: no counter.trick leaks into field lessons
  const tricks = mids.map(m => ((Game.data.monsters.find(x => x.id === m) || {}).counter || {}).trick).filter(Boolean);
  const leaks = tricks.filter(t => Object.values(lines).some(l => l.includes(t)));
  check('lessons never teach the counter trick (stays gated)', leaks.length === 0, leaks.join(' | ').slice(0, 120));

  // ---------- A2. the teach flow: framing beat + spoken lesson, no doubling ----------
  const said = [];
  const _say = Game.say;
  Game.say = function (s) { said.push(String(s)); return _say.apply(this, arguments); };
  const st = Game.agencyState();
  st.know[vid] = st.know[vid] || {};
  st.know[vid].fought = ['moderator'];
  delete (Game.state.codex.monsters || {}).moderator;
  const taught = Game.agencyTeachMonster(vid);
  Game.say = _say;
  check('agencyTeachMonster: taught the fought species', taught === 'moderator', String(taught));
  const frame = said.find(s => s.includes('walks you through'));
  check('framing beat spoken', !!frame, said.join(' || ').slice(0, 160));
  if (frame) {
    check('framing beat: no lesson-template doubling', !frame.includes(GENERIC), frame.slice(0, 120));
    check('framing beat: codex effect honest', frame.includes('(Monster codex: observed.)'), frame.slice(0, 120));
  }
  // spoken lesson via the real agencyTurn path — re-seed a teachable species
  // (A2's teach spent 'moderator' above)
  st.know[vid].fought = ['moderator'];
  delete (Game.state.codex.monsters || {}).moderator;
  const r0 = Game.startConvo(vid);
  const rt = Game.convoTurn(vid, 'agency:ask_field');
  check('agencyTurn: lesson spoken', !!rt.line, 'no line returned');
  if (rt.line) {
    check('agencyTurn: lesson is the per-monster line', rt.line === Game.agencyMonsterLessonLine('moderator'), rt.line.slice(0, 90));
    check('agencyTurn: lesson not the generic template', !rt.line.includes(GENERIC), rt.line.slice(0, 90));
    const c = Game.convoGet(vid);
    const them = (c.transcript || []).filter(e => e.who === 'them').map(e => String(e.text));
    check('agencyTurn: lesson in the convo transcript', them.some(t => t === rt.line),
      'spoken line missing from transcript');
  }
  try { Game.endConvo(vid, 'done'); } catch (e) {}

  // ---------- B. water_haul favor quoting ----------
  for (let i = 0; i < 6; i++) {
    const parts = Game.convoBuildFavor(vid, { kind: 'water_haul', water: 4 });
    check(`water_haul #${i}: line fully quoted`, parts.line.startsWith('"') && parts.line.endsWith('"'),
      parts.line.slice(0, 90));
    check(`water_haul #${i}: exactly one quote pair`, (parts.line.match(/"/g) || []).length === 2,
      parts.line.slice(0, 90));
    check(`water_haul #${i}: whyLine fully quoted`,
      parts.whyLine.startsWith('"') && parts.whyLine.endsWith('"') && (parts.whyLine.match(/"/g) || []).length === 2,
      String(parts.whyLine).slice(0, 90));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF ERROR: ' + (e && e.stack || e)); process.exit(2); });
