// scripts/test-journey-scale-r36-bookmoves.js — proof for the journey-scale
// r36 arm: BOOK THE TWO UNBOOKED TRUST MOVES, no number changes.
//   (a) titans.js titanEscalate night-strike: the trust −5 now writes one
//       Game._linkNote(link, 'titan', …) next to the say line.
//   (b) hierarchy.js covenantTick league-pool shortfall: the trust −4 per
//       link now writes one _linkNote(link, 'pool', …) naming the shortfall.
// Static-wiring assertions read the source files (argv[2]/argv[3] override
// the paths, so running against HEAD copies must FAIL — the RED check).
// The titan half is also driven behaviorally: the REAL titanEscalate (via
// Game._titanTest) against a stubbed link source, asserting the note lands
// in that link's history with the right kind and day.
// Usage: node scripts/test-journey-scale-r36-bookmoves.js [titansPath] [hierarchyPath]
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const TITANS = process.argv[2] || path.join(ROOT, 'src/js/titans.js');
const HIER = process.argv[3] || path.join(ROOT, 'src/js/hierarchy.js');
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) { pass++; console.log('  ok   ' + label); } else { fail++; console.log('  FAIL ' + label); } }

// ---- static wiring: titan strike branch books a 'titan' note ----
const titansSrc = fs.readFileSync(TITANS, 'utf8');
const strikeAt = titansSrc.indexOf("link.trust = Math.max(0, (link.trust || 0) - 5);");
ok(strikeAt !== -1, 'titans.js still assigns the trust -5 (number unchanged)');
const strikeWindow = strikeAt !== -1 ? titansSrc.slice(strikeAt, strikeAt + 800) : '';
ok(strikeWindow.indexOf("Game._linkNote") !== -1, 'titan strike branch calls Game._linkNote');
ok(strikeWindow.indexOf("'titan'") !== -1, "titan strike note kind is 'titan'");
ok(strikeWindow.indexOf('trust −5') !== -1 || strikeWindow.indexOf('trust -5') !== -1, 'titan strike note names the -5');
ok(strikeWindow.indexOf('Game.say') !== -1, 'titan strike say line still present after the note');

// ---- static wiring: pool-short branch books a 'pool' note per link ----
const hierSrc = fs.readFileSync(HIER, 'utf8');
const poolAt = hierSrc.indexOf('if (paid < havenShare)');
ok(poolAt !== -1, 'hierarchy.js still has the pool-short branch');
const poolWindow = poolAt !== -1 ? hierSrc.slice(poolAt, poolAt + 1200) : '';
ok(poolWindow.indexOf('ls[i].trust = Math.max(0, ls[i].trust - 4)') !== -1, 'pool-short still assigns trust -4 per link (number unchanged)');
ok(poolWindow.indexOf('_linkNote(ls[i]') !== -1, 'pool-short branch books a note per link');
ok(poolWindow.indexOf("'pool'") !== -1, "pool-short note kind is 'pool'");
ok(poolWindow.indexOf('came up short') !== -1, 'pool-short note names the shortfall');

// ---- behavioral: real titanEscalate books the strike ----
(async () => {
  const { loadGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 85001, mode: 'journey-scale-r36-bookmoves' });
  ok(typeof Game._linkNote === 'function', 'Game._linkNote exists after load');
  ok(Game._titanTest && typeof Game._titanTest.titanEscalate === 'function', 'Game._titanTest.titanEscalate exists');
  // Minimal world: one allied link, one stage-2 omen 5 days unanswered.
  Game.state = Game.state || {};
  Game.state.scholar = Object.assign(Game.state.scholar || {}, { day: 80 });
  Game.state.otherVillages = [{ id: 'ashford', name: 'Ashford', opinion: 30, roster: [] }];
  const link = { id: 'l1', a: 'haven', b: 'ashford', kind: 'covenant', status: 'active', trust: 60, history: [] };
  Game.mshipState = () => ({ links: [link] });
  Game.state.titans = { omens: { herald: { stage: 2, day: 75, resolved: false } }, slain: {} };
  const said = [];
  const realSay = Game.say;
  Game.say = (t) => { said.push(String(t)); };
  // Escalate on successive strike days until the strike branch fires
  // (R() decides pantry-raid vs strike; the seeded sequence hits a strike
  // within a handful of strike days — cap at 40 attempts).
  let struck = false, strikeDay = null;
  for (let d = 80; d <= 80 + 5 * 40 && !struck; d += 5) {
    Game.state.scholar.day = d;
    const before = link.trust;
    try { Game._titanTest.titanEscalate('herald', d); } catch (e) { /* guarded paths only */ }
    if (link.trust === before - 5) { struck = true; strikeDay = d; }
  }
  Game.say = realSay;
  ok(struck, 'a titan strike fired within the attempt window (trust -5 observed)');
  if (struck) {
    const notes = (link.history || []).filter(h => h.kind === 'titan');
    ok(notes.length >= 1, 'strike wrote at least one titan note into link.history');
    const n = notes[notes.length - 1];
    ok(n && /−5/.test(n.note || ''), 'titan note names the -5');
    ok(n && n.day === strikeDay, 'titan note stamped with the strike day (day=' + (n && n.day) + ', strikeDay=' + strikeDay + ')');
    ok(said.some(t => /struck .* in the night/.test(t)), 'strike say line still voiced');
  }
  // _linkNote semantics: day stamp + 40-entry cap.
  const link2 = { history: [] };
  Game.state.scholar.day = 99;
  for (let i = 0; i < 45; i++) Game._linkNote(link2, 'pool', 'note ' + i);
  ok(link2.history.length === 40, '_linkNote caps history at 40 (got ' + link2.history.length + ')');
  ok(link2.history[link2.history.length - 1].note === 'note 44', '_linkNote keeps the newest entries');
  ok(link2.history[0].day === 99, '_linkNote stamps scholar day');
  // Behavioral pool-short: the REAL covenantTick with an empty pantry
  // must charge -4 per covenant link AND book a 'pool' note per link.
  // (The wild run's BOOK-POOL was vacuous — no pool-short fired on any
  // seed — so this drive is the pool half's behavioral proof.)
  Game.state.scholar.day = 70; // week 10
  Game.state._leaguePoolWeek = 9; // last pour was last week
  Game.state.village = Game.state.village || {};
  Game.state.village.pantry = []; // Haven cannot cover its share
  Game.state.otherVillages = [
    { id: 'v1', name: 'Fire One', pantryKcal: 0, roster: [] },
    { id: 'v2', name: 'Fire Two', pantryKcal: 0, roster: [] },
  ];
  const plink1 = { id: 'p1', a: 'haven', b: 'v1', kind: 'covenant', status: 'active', trust: 50, history: [], poolLive: true };
  const plink2 = { id: 'p2', a: 'haven', b: 'v2', kind: 'covenant', status: 'active', trust: 50, history: [], poolLive: true };
  Game.mshipState = () => ({ links: [plink1, plink2] });
  const poolSaid = [];
  Game.say = (t) => { poolSaid.push(String(t)); };
  Game.covenantTick(plink1);
  Game.say = realSay;
  // 50 - 2 (each fire's own empty-stores shortfall, pre-existing) - 4
  // (Haven's shortfall, the r36 arm) = 44. The -4 component is proven by
  // the came-up-short notes below, not by the total alone.
  ok(plink1.trust === 44 && plink2.trust === 44, 'pool shortfall charges -4 per link on top of the -2 member short (50->44 both)');
  ok((plink1.history || []).some(h => h.kind === 'pool' && /poured short/.test(h.note || '')), 'member shortfall note still present alongside the haven note');
  const pn1 = (plink1.history || []).filter(h => h.kind === 'pool' && /came up short/.test(h.note || ''));
  const pn2 = (plink2.history || []).filter(h => h.kind === 'pool' && /came up short/.test(h.note || ''));
  ok(pn1.length >= 1, 'pool shortfall books a came-up-short note on link 1');
  ok(pn2.length >= 1, 'pool shortfall books a came-up-short note on link 2');
  ok(pn1.length && pn1[0].day === 70, 'pool shortfall note stamped with the tick day');
  ok(poolSaid.some(t => /comes up short/.test(t)), 'pool shortfall say line still voiced');
  console.log(`bookmoves: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF ERROR:', e && e.stack || e); process.exit(2); });
