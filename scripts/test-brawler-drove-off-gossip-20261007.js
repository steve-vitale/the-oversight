// Proof test (2026-10-07): driving a villager off via the intimidation
// breaking point seeds a 'drove_off' gossip with REAL onlookers — not the
// fleeing victim, who can never spread it. Story must travel the village.
// Usage: node scripts/test-brawler-drove-off-gossip-20261007.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
// Loader: scripts/godpath/lib.js — index.html script order, seeded
// Math.random, frozen Date.now (flake fix 2026-10-14; the old
// hand-rolled eval list was unseeded and missed modules).
const K = require('./godpath/lib');
let Game;

let pass = 0, fail = 0;
const ok = (cond, name) => { if (cond) { pass++; } else { fail++; console.log('FAIL:', name); } };

(async () => {
  Game = await K.load({ seed: Number(process.env.SEED || 20261007), narration: true });
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.log.length = 0;
  const feed = () => { const s = Game.state.scholar; s.kcal = 2400; s.hydration = 100; s.health = Math.max(s.health, 90); };
  feed();
  const v = Game.state.village, me = Game.villagerId;
  const others = () => v.roster.filter(id => id !== me);
  // Pin the victim (flake fix 2026-10-14): the breaking-point path only
  // exists for cautious/withdrawn tempers. The old `|| others()[0]` fallback
  // handed a steady/bold villager to the test on seeds with no timid one, and
  // every assertion failed. Make the fallback timid instead.
  let vid = others().find(id => ['cautious', 'withdrawn'].includes(Game.npcTemper(id)));
  if (!vid) { vid = others()[0]; const vp = Game.vpOf(vid); vp.personality = vp.personality || {}; vp.personality.temperament = 'cautious'; }
  Game.npcNeeds(vid).fear = 0; // first two shakedowns must not start at the breaking point

  const r1 = Game.intimidate(vid); ok(r1 === 'yielded', 'first shakedown yields');
  const r2 = Game.intimidate(vid); ok(r2 === 'yielded', 'second shakedown yields (breaking-point warning)');
  const realRandom = Math.random;
  Math.random = () => 0.9; // force RUN (not SNAP) at the breaking point
  const r3 = Game.intimidate(vid);
  Math.random = realRandom;
  ok(r3 === 'fled', 'third shakedown drives them off');

  // victim is gone, recorded as fled
  ok(!v.roster.includes(vid), 'victim removed from roster');
  ok((v.exiles || []).some(e => e.vid === vid && e.how === 'fled'), 'exiles ledger records fled');

  // the crime is on the books
  ok(Game.justiceState().crimes.some(c => c.type === 'intimidation' && c.victim === vid), 'intimidation crime recorded');

  // THE FIX: 'drove_off' gossip seeded with living onlookers, not the victim
  const g = (v.gossip || []).find(x => x.action === 'drove_off');
  ok(!!g, "'drove_off' gossip seeded");
  ok(g && g.heard.length >= 1, "'drove_off' has onlooker hearers");
  ok(g && !g.heard.includes(vid), 'fled victim is NOT a teller');
  ok(g && g.heard.every(id => v.roster.includes(id)), 'every teller is still on the roster (can spread)');
  ok(g && g.dims && g.dims.honest === -20 && g.dims.generous === -15, "'drove_off' carries rep dims");

  // the story travels: force spread, heard must grow beyond the seeds
  const before = g.heard.length;
  Math.random = () => 0; // everyone tells, every time
  try { Game.spreadGossip(); Game.spreadGossip(); } catch (e) {}
  Math.random = realRandom;
  ok(g.heard.length > before, `story spreads: heard ${before} -> ${g.heard.length}`);

  // the pre-existing 'bully' gossip may name the victim as a hearer — they were
  // legitimately on the roster when seeded (second shakedown). That story dies
  // with their departure, which is honest; 'drove_off' is the one that travels.

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
