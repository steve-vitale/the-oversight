#!/usr/bin/env node
// PROOF TEST: share_news gossip render never doubles the subject
// (journey landing r33 2026-10-20).
//
// WILD FINDING (r33 pilot, seed 300 day 5, Luz share_news): the knack
// gossip line already names the subject via {first}, but the share_news
// render at convo-wants.js prefixed displayName again:
//   "Okay, so — A man, maybe 40s, with a nervous tic. the man in his
//    40s, with a nervous tic ate something last month that should've
//    killed them. They're fine. Don't say I told you."
// The subject appears twice (two different descriptor registers) — a
// copy wart, not senselessness.
//
// ROOT CAUSE (convo-wants.js gossipNews): the `${nm}.` prefix exists for
// the gossipLine (occupation/origin) fallback, which never names the
// subject ("Turns out they weren't a surgeon..."). But truth.js and the
// knack fallback both build complete fiction in g.line WITH the subject
// named ({first} interpolations) — the prefix doubles them.
//
// FIX: prefix ${nm} only on the fallback path; serve complete g.line
// bodies as-is.
//
// RED (pre-fix, verified 2026-10-20): knack-gossip render contains nm -> FAIL.
// GREEN (fixed): knack-gossip render names the subject exactly once;
//   occupation-fallback render keeps the ${nm} prefix.
// RED recipe (no stash — repo-global stack):
//   cp <this> /tmp/x.js # (fix already applied)
//   git diff src/js/convo-wants.js > /tmp/gsub.patch && git checkout HEAD -- src/js/convo-wants.js &&
//   node scripts/test-gossip-subject-dedupe-20261020.js (expect FAIL) &&
//   git apply /tmp/gsub.patch && node scripts/test-gossip-subject-dedupe-20261020.js (expect PASS)
//
// Usage: node scripts/test-gossip-subject-dedupe-20261020.js
// (uses scripts/sim-harness.js loadGame — seeded RNG before eval, per repo
// rules; never two harnesses in one process)

const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

async function main() {
  await loadGame({ seed: 4242, mode: 'probe' });
  const Game = globalThis.Scattering.Game;
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  const scholar = Game.generatedRoster[0].id;
  Game.newGame('Columbus, Ohio', null, scholar);
  Game.depart();

  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const T = roster[0]; // teller
  const S = roster[1]; // subject
  const nm = Game.displayName(S);
  const first = Game.firstRef(S);
  console.log(`teller=${Game.displayName(T)} subject nm=${JSON.stringify(nm)} first=${JSON.stringify(first)}`);

  const realGossip = Game.npcGossipAbout;

  // CASE 1: knack gossip with a complete rendered line naming the subject.
  // Mimics spawn-knack.js knackGossipLine (always includes ${first}).
  const knackLine = `"${first} ate something last month that should've killed them. They're fine."`;
  Game.npcGossipAbout = function () {
    return { line: knackLine, target: S, field: 'knack', truth: 'iron_stomach', contradictsLie: false };
  };
  const line1 = Game.convoWantNews(T);
  console.log('  knack render: ' + line1);
  ok(typeof line1 === 'string' && line1.length > 0, 'knack gossip renders a line');
  // The subject must be named exactly once: nm must not appear at all
  // (the complete body already names them via first). Guard: on a rare
  // seed nm === first (known villager), doubling is impossible by
  // construction, so the check is vacuous there.
  ok(nm === first || line1.indexOf(nm) === -1, 'knack gossip: no doubled subject (nm absent)', line1);
  ok(line1.indexOf(first) !== -1, 'knack gossip: subject still named once via body', line1);

  // CASE 2: occupation fallback (no g.line) — the ${nm} prefix must stay,
  // because gossipLine never names the subject.
  Game.npcGossipAbout = function () {
    return { field: 'occupation', truth: 'surgeon', lie: null, line: null, target: S, contradictsLie: false };
  };
  const line2 = Game.convoWantNews(T);
  console.log('  occupation render: ' + line2);
  // gossipNews picks a random roster target, so the prefix names whatever
  // target was drawn — check the structural pattern, not a specific name:
  // "Okay, so — <Name>. Turns out they ..." (subject carried by the prefix).
  ok(typeof line2 === 'string' && /\. Turns out they /.test(line2),
    'occupation fallback keeps the nm prefix (subject would otherwise be unnamed)', line2);

  // CASE 3: truth.js-style gossip line naming the subject — also no prefix.
  const truthLine = `"${first}? A surgeon, back before. Solid person."`;
  Game.npcGossipAbout = function () {
    return { line: truthLine, target: S, field: 'occupation', truth: 'surgeon', lie: 'baker', contradictsLie: true };
  };
  const line3 = Game.convoWantNews(T);
  console.log('  truth render: ' + line3);
  ok(typeof line3 === 'string' && line3.indexOf(nm + '. ') === -1,
    'truth gossip: no doubled subject prefix', line3);

  Game.npcGossipAbout = realGossip;

  console.log(`\ntest-gossip-subject-dedupe-20261020: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
