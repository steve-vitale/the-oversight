#!/usr/bin/env node
// PROOF: lure invitations are spoken even when the no-repeat ledgers would block
// them (journey landing r7 2026-10-12).
//
// OBSERVED (r7 sims: lureSilent=3/10): when another villager had spoken the same
// invite label recently, the run ledger blocked the spoken-lure beat and sayLine
// fell back to the dry line "...Sorry, lost my train of thought." — while the
// betrayal:accept/decline menu quoted the invitation VERBATIM. The player was
// asked to accept an invitation that was never extended (armed-plot invites
// travel the same channel — a blind walk-in). Additionally, saidLines persists
// across sittings, so a villager re-inviting with the same label in a later
// conversation was self-blocked into the same silence.
// Fixed: invitation beats are exempt from both no-repeat blocks (they still
// feed the ledgers); the spoken beat and the menu can never disagree.
//
// ALSO (same run, seed 999 day 6): a bare-punctuation voice closer ('!', from
// the effusive speech-register pool) appended after the line's own terminal
// mark stutters ("...knows about? !"). Fixed: voiceLine folds bare-punctuation
// closers — questions keep '?' (closer dropped), other lines swap the terminal
// mark for the closer.
//
// RED on pristine HEAD: invite beat falls back to dry / goes silent (FAIL).
// GREEN fixed: invite label spoken in the transcript in all cases (PASS).
//
// Usage: node scripts/test-landing-lure-spoken-20261012.js
//   RED:  CONVO_FILE=/tmp/pristine-conversation.js node scripts/test-landing-lure-spoken-20261012.js
//         (build /tmp/pristine-conversation.js via: git show HEAD:src/js/conversation.js > /tmp/pristine-conversation.js)

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let _s = 90210;
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
const CONVO_OVERRIDE = process.env.CONVO_FILE || null;
const EXCLUDE = new Set(['app.js', 'sprites.js', 'tile-scenes.js', 'move-anim.js', 'drama.js']);
for (const m of fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/src="([^"]+)"/g)) {
  const f = m[1].split('?')[0];
  if (!f.endsWith('.js')) continue;
  if (EXCLUDE.has(path.basename(f))) continue;
  let srcPath = path.join(ROOT, f);
  if (CONVO_OVERRIDE && path.basename(f) === 'conversation.js') srcPath = CONVO_OVERRIDE;
  eval(fs.readFileSync(srcPath, 'utf8'));
}
delete global.window;
const Game = globalThis.Scattering.Game;
if (CONVO_OVERRIDE) console.log('NOTE: conversation.js loaded from PRISTINE override: ' + CONVO_OVERRIDE);

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

const DRY = /lost my train of thought|Never mind — go on|Actually, forget it/;

async function main() {
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const defs = Game.INVITE_DEFS();
  const def = defs.find(d => d.id === 'carry') || defs[1];
  const LABEL_CORE = 'haul something back'; // inside the invite label text
  const day = (Game.state.scholar && Game.state.scholar.day) || 1;
  const themOf = (vid) => (Game.convoGet(vid).transcript || [])
    .filter(e => e.who === 'them').map(e => String(e.text)).join('\n');

  // CASE 1: run-ledger block — another villager said the same lure recently
  const a = roster[0];
  Game.inviteHistory(a).pending = { defId: def.id, day };
  Game.convoRunLedger().push(def.label);
  require('./lib/conversation-playtest').openInvite(Game,a);
  const t1 = themOf(a);
  Game.endConvo(a, 'done');
  console.log('case1 them (trimmed): ' + t1.slice(-140).replace(/\n/g, ' | '));
  ok(t1.indexOf(LABEL_CORE) !== -1, 'run-ledger-blocked lure is still spoken verbatim');
  ok(!DRY.test(t1), 'no dry non-sequitur in place of the invitation');

  // CASE 2: self-block — the same villager invites again in a later sitting
  const b = roster[1];
  Game.inviteHistory(b).pending = { defId: def.id, day };
  require('./lib/conversation-playtest').openInvite(Game,b);
  const t2a = themOf(b);
  Game.endConvo(b, 'done');
  console.log('case2a (sanity) lure spoken: ' + (t2a.indexOf(LABEL_CORE) !== -1));
  Game.inviteHistory(b).pending = { defId: def.id, day }; // new pending, same label
  require('./lib/conversation-playtest').openInvite(Game,b);
  const t2 = themOf(b);
  Game.endConvo(b, 'done');
  console.log('case2 them (trimmed): ' + t2.slice(-140).replace(/\n/g, ' | '));
  ok(t2.indexOf(LABEL_CORE) !== -1, 'repeat invite from the same villager spoken again (no self-block silence)');
  ok(!DRY.test(t2), 'no dry non-sequitur for the repeat invite');

  // CASE 3: bare-punctuation voice closer fold — find a villager whose
  // register reaches the closer path, then force the bare '!' closer.
  // (Pristine yields the '"What is it? !"' stutter; fixed yields the clean
  // line. Opener-path villagers ('"!What is it?"' on both) are skipped.)
  const origPC = Game.convoPickCycle, origRand = Math.random;
  Game.convoPickCycle = () => '!';
  Math.random = () => 0;
  let c = null;
  for (const vid of roster.slice(2)) {
    const probe = Game.voiceLine(vid, '"What is it?"');
    if (probe === '"What is it?"' || probe === '"What is it? !"') { c = vid; break; }
  }
  ok(c !== null, 'found a villager on the voice-closer path (test setup)');
  if (c) {
    const q = Game.voiceLine(c, '"What is it?"');
    // For statements the stubbed Math.random=0 forces the opener path; the
    // gate consumes the first roll and the useOpen decision the second, so
    // feed [0 (pass gate), 0.9 (decline the opener)] to reach the closer.
    const seq = [0, 0.9];
    Math.random = () => (seq.length ? seq.shift() : 0);
    const s = Game.voiceLine(c, '"We made it."');
    console.log('case3 question: ' + q + ' | statement: ' + s);
    ok(q === '"What is it?"', 'question keeps its mark, bare ! dropped (got: ' + q + ')');
    ok(s === '"We made it!"', 'statement swaps terminal mark for the closer (got: ' + s + ')');
    ok(!/\?\s*!/.test(q), 'no "? !" stutter');
    ok(!/\.\s*!/.test(s), 'no ". !" stutter');
  }
  Game.convoPickCycle = origPC; Math.random = origRand;

  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('TEST ERROR:', e); process.exit(2); });
