#!/usr/bin/env node
// PROOF TEST: departure gossip renders the truth per purpose (journey
// landing r32 2026-10-20).
//
// The 'departure' gossip action used to render EVERY leaving as a dramatic
// walk-out ("just walked away from Haven. Didn't look back.") — including
// routine forage/water/trap trips. R32 pilot, seed 205: Luz "walked away"
// 7 times in 14 days, every one a routine expedition. The announce line
// villagers actually hear ("Luz heads out to forage. 'Back before dark.
// Probably.'") contradicted the gossip version — false drama.
//
// FIX:
//   - villager-objectives.js: the departure seed now carries
//     dims.purpose = obj.purpose (forage/water/traps/visit/explore/
//     leave/haul/guard).
//   - villager-agency.js: multi-day expeditions seed purpose:'expedition'.
//   - game.js (contender walk-out): purpose:'walkout' (a real walk-out).
//   - game.js gossipActionDims: 'purpose' excluded from rep keys (it is
//     render metadata, not reputation).
//   - game.js walk-down render + journal note: branch on purpose —
//     routine trips render "headed out to forage" etc.; expeditions
//     "set out on a long trek"; walk-outs (and purposeless legacy
//     entries) keep the dramatic telling.
//
// RED (pre-fix, verified via the patch-file recipe in the header): routine
//   and expedition departures render "walked away from Haven" -> FAIL.
// GREEN (fixed): purpose-honest renders; walk-out + legacy unchanged.
// RED recipe (no stash — repo-global stack): git diff src/js/game.js
//   src/js/villager-objectives.js src/js/villager-agency.js >
//   /tmp/deppurp.patch && git checkout HEAD -- src/js/game.js
//   src/js/villager-objectives.js src/js/villager-agency.js &&
//   node scripts/test-departure-purpose-r32-20261020.js (expect FAIL) &&
//   git apply /tmp/deppurp.patch &&
//   node scripts/test-departure-purpose-r32-20261020.js (expect PASS)
//
// Usage: node scripts/test-departure-purpose-r32-20261020.js
// (uses scripts/sim-harness.js loadGame — seeded RNG before eval, per repo
// rules; never two harnesses in one process)

const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + '  <--'); }
}

async function main() {
  await loadGame({ seed: 5150, mode: 'probe' });
  const Game = globalThis.Scattering.Game;
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  const scholar = Game.generatedRoster[0].id;
  Game.newGame('Columbus, Ohio', null, scholar);
  Game.depart();

  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const L = roster[0];                 // listener
  const S_forage = roster[1];          // routine trip
  const S_walkout = roster[2];         // real walk-out
  const S_exped = roster[3];           // long expedition
  const S_legacy = roster[4];          // old entry, no purpose
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[L] = 30;    // open the gossip menu

  // Isolate: clear generated gossip so the walk-down can only serve ours.
  Game.state.village.gossip = [];
  // Seeding happens after the opener walk (see below): the walk itself can
  // seed gossip, so we isolate there. Preconditions checked post-seed.
  const entries0 = (Game.state.village.gossip || []).filter(g => g.action === 'departure');
  console.log(`(pre-walk departures in ledger: ${entries0.length} — ignored, re-seeded later)`);

  const served = [];
  const r0 = Game.startConvo(L);
  let r = r0;
  for (let t = 0; t < 10; t++) {
    const choices = (r.choices || []);
    const gq = choices.find(c => c && c.id === 'ask:gossip');
    if (gq) break;
    const nx = choices.find(c => c && c.id !== 'leave' && c.id !== 'silence' && !/^dlg:/.test(c.id || ''))
      || choices.find(c => c && c.id !== 'leave');
    if (!nx) { console.log('menu dead-ended — probe inconclusive'); process.exit(2); }
    r = Game.convoTurn(L, nx.id);
    if (r.ended) { console.log('convo ended during opener — probe inconclusive'); process.exit(2); }
  }
  const find = (id) => ((r.choices || []).find(c => c && c.id === id));
  let pick = find('ask:gossip');
  if (!pick) { console.log('no ask:gossip — probe inconclusive'); process.exit(2); }
  Game.endConvo(L, 'done');
  // Drive the gossip engine directly (deterministic): askAbout's
  // "people talk about each other" branch is a 50% coin flip ahead of the
  // walk-down, so loop until the walk-down has served all 4 departures,
  // carrying skipSigs like convoGossipBeat does.
  Game.state.village.gossip = [];
  const parts = ['dawn', 'midday', 'dusk', 'night'];
  const subs = [S_forage, S_walkout, S_exped, S_legacy];
  const purps = [{ purpose: 'forage' }, { purpose: 'walkout' }, { purpose: 'expedition' }, {}];
  subs.forEach((S, i) => {
    Game.dayPart = parts[i];
    Game.seedGossip('departure', Object.assign({ who: S }, purps[i]), [L]);
  });
  const entries = (Game.state.village.gossip || []).filter(g => g.action === 'departure');
  ok(entries.length === 4, `four departure entries seeded (got ${entries.length})`);
  const skipSigs = [];
  for (let t = 0; t < 14 && served.length < 4; t++) {
    const said = [];
    const origSay = Game.say;
    Game.say = (x) => { said.push(String(x)); };
    let res = null;
    try { res = Game.askAbout(L, 'gossip', { inConvo: true, skipSigs }); }
    catch (e) { Game.say = origSay; throw e; }
    Game.say = origSay;
    if (res && res.gossipSig) skipSigs.push(res.gossipSig);
    if (res && res.gossip && res.gossip.action === 'departure') {
      served.push(said.filter(x => !/^\s*(📓|❓)/.test(x)).join(' '));
    }
  }
  console.log(`walk-down served ${served.length}/4 departures`);
  const blob = served.join('\n');
  console.log('served lines:');
  served.forEach(l => console.log('   | ' + l.slice(0, 110)));

  const nm = (id) => { try { return Game.displayName(id); } catch (e) { return id; } };
  // Subjects are unnamed this early ("A person, maybe 20s, with a
  // gap-toothed grin") — match on the full descriptor, longest first so
  // "A person, maybe 20s, with a gap-toothed grin" doesn't collide with
  // "A person, maybe 20s, with restless hands".
  const lineFor = (id) => served.find(l => l.indexOf(nm(id)) !== -1) || '';
  const fLine = lineFor(S_forage), wLine = lineFor(S_walkout);
  const eLine = lineFor(S_exped), lLine = lineFor(S_legacy);

  ok(/headed out to forage/i.test(fLine),
    `routine forage renders honestly ("${fLine.slice(0, 80)}")`);
  ok(!/walked away from Haven/i.test(fLine),
    'routine forage does NOT render as a walk-out');
  ok(/walked away from Haven\. Didn't look back/i.test(wLine),
    `real walk-out keeps the dramatic telling ("${wLine.slice(0, 80)}")`);
  ok(/long trek|won't be back for days/i.test(eLine),
    `expedition renders as a long trek ("${eLine.slice(0, 80)}")`);
  ok(!/walked away from Haven/i.test(eLine),
    'expedition does NOT render as a walk-out');
  ok(/walked away from Haven\. Didn't look back/i.test(lLine),
    `legacy purposeless entry keeps the old telling ("${lLine.slice(0, 80)}")`);

  // gossipActionDims: purpose must not leak into reputation.
  const rd = Game.gossipActionDims('departure', { who: S_forage, purpose: 'forage' });
  ok(!('purpose' in (rd || {})), 'purpose excluded from rep dims');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROBE ERROR', e); process.exit(2); });
