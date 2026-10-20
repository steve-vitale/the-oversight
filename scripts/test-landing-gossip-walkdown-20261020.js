#!/usr/bin/env node
// PROOF TEST: gossip walk-down never re-serves the same news twice in one
// sitting (journey landing r31 2026-10-20).
//
// R28 fixed the gossip thread re-serving the same rumor on every follow-up
// (Rafael d11: "Victor just walked away from Haven" x3) via per-sitting
// gossipServedSigs. R31 pilot (seed 202, Emma d6) exposed the hole: the
// walk-down dedupes by ENTRY sig
//   'gossip:' + action + '|' + dims.who + '|' + (partKey || 'd'+day)
// but seedGossip dedupes only per (action, partKey) — so the SAME news
// (same action+who) seeded on two different day-parts yields two entries
// with different sigs, and the walk-down served both back-to-back with a
// verbatim-identical rendered line. The player hears a parrot.
//
// FIX (src/js/game.js, freshGossip): skip an entry when its exact sig OR
// its news-content key (action|who) was already served this sitting.
// skipSigs stay per-sitting (reset each sitting), so a resumed thread in a
// new sitting still re-delivers its headline (the r28 resume intent).
// 'dark:'/'about:' sigs never start with 'gossip:' — untouched.
//
// RED (pre-fix, verified 2026-10-20 on HEAD e953f90b0): the same departure
//   sentence served 2x in one sitting -> FAIL, exit 1.
// GREEN (fixed): served at most once; the engine goes honestly dry.
// RED recipe (no stash — repo-global stack): git diff src/js/game.js >
//   /tmp/walkdown.patch && git checkout HEAD -- src/js/game.js &&
//   node scripts/test-landing-gossip-walkdown-20261020.js (expect FAIL) &&
//   git apply /tmp/walkdown.patch && node scripts/test-landing-gossip-walkdown-20261020.js (expect PASS)
//
// Usage: node scripts/test-landing-gossip-walkdown-20261020.js
// (uses scripts/sim-harness.js loadGame — seeded RNG before eval, per repo
// rules; never two harnesses in one process)

const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
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
  const L = roster[0]; // listener
  const S = roster[1]; // subject who "walked away" twice
  const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const lname = Game.displayName(L);
  const sname = Game.displayName(S);
  console.log(`listener=${lname} subject=${sname}`);
  // gossip menu gates on trust>=20 or relAge>=5 — open it directly.
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[L] = 30;

  // Two departure entries, same subject, different day-parts -> different partKeys/sigs.
  Game.dayPart = 'morning';
  Game.seedGossip('departure', { who: S }, [L]);
  Game.dayPart = 'evening';
  Game.seedGossip('departure', { who: S }, [L]);
  const entries = (Game.state.village.gossip || []).filter(g => g.action === 'departure');
  console.log('departure entries: ' + entries.length +
    ' partKeys=' + entries.map(g => g.partKey).join(','));

  const r0 = Game.startConvo(L);
  let choices = r0.choices || [];
  let r = r0;
  // Resolve the want-opener first: walk menus until ask:gossip appears.
  for (let t = 0; t < 10; t++) {
    choices = (r.choices || []);
    const gq = choices.find(c => c && c.id === 'ask:gossip');
    if (gq) break;
    const nx = choices.find(c => c && c.id !== 'leave' && c.id !== 'silence' && !/^dlg:/.test(c.id || ''))
      || choices.find(c => c && c.id !== 'leave');
    if (!nx) { console.log('menu dead-ended — probe inconclusive'); process.exit(2); }
    console.log(`  (opener turn ${t}: picking [${nx.id}])`);
    r = Game.convoTurn(L, nx.id);
    if (r.ended) { console.log('convo ended during opener — probe inconclusive'); process.exit(2); }
  }
  const find = (id) => ((r.choices || []).find(c => c && c.id === id));
  const served = [];
  const sigsOverTime = [];
  // Turn 1: ask:gossip
  let pick = find('ask:gossip');
  if (!pick) { console.log('no ask:gossip in opening menu — probe inconclusive'); process.exit(2); }
  r = Game.convoTurn(L, pick.id);
  choices = r.choices || [];
  // Turns 2..7: dlg:more while offered
  for (let t = 0; t < 6; t++) {
    pick = find('dlg:more');
    if (!pick) { console.log(`dlg:more not offered at turn ${t + 2} (thread dry/retired)`); break; }
    r = Game.convoTurn(L, pick.id);
    const c = Game.convoGet(L);
    const line = String((r && r.line) || '');
    served.push(line);
    sigsOverTime.push((c.gossipServedSigs || []).slice());
    console.log(`turn ${t + 2} served: ${line.slice(0, 110)}`);
    console.log(`         sigs: ${JSON.stringify(c.gossipServedSigs || [])}`);
    choices = r.choices || [];
    if (r.ended) break;
  }
  Game.endConvo(L, 'done');

  // The departure sentence for S, verbatim-identical each serve.
  const depRe = new RegExp(esc(sname) + ' just walked away from Haven', 'i');
  const depServes = served.filter(l => depRe.test(l));
  console.log(`\ndeparture-news serves in one sitting: ${depServes.length}`);
  ok(entries.length === 2, 'two distinct departure entries exist (precondition)');
  ok(depServes.length <= 1,
    'same (action,who) departure news served at most once per sitting');
  if (depServes.length > 1) {
    console.log('RED: verbatim repeat — the walk-down served the same news twice:');
    depServes.forEach(l => console.log('   | ' + l.slice(0, 120)));
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROBE ERROR', e); process.exit(2); });
