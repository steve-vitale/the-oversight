// Proof test: traveler rumors arrive BEFORE first approach (2026-10-07).
// BUG: the rumor roll lived inside simVillageDay, which only runs during the
// catch-up sim triggered by approaching — so a rumor could only ever fire AS
// you walked in. The design comment always said travelers bring word to YOU
// first ("how you find the village 2 tiles north pretty early — not by
// stumbling into it, but because someone told you").
// FIX: maybeVillageRumor() runs from endDay() for every unvisited village.
// Seeded mulberry32 (default 20261007, SEED env override). Exits nonzero on failure.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const K = require('./godpath/lib');
const SEED = parseInt(process.env.SEED || '20261007', 10);
let Game;
let failures = 0, checks = 0;
const fail = (msg) => { failures++; console.log('  FAIL: ' + msg); };
const ok = (cond, msg) => { checks++; if (cond) console.log('  ok: ' + msg); else fail(msg); };
// force the next Math.random() calls to a fixed value (restores seeded PRNG after)
const rig = (v, fn) => { const saved = Math.random; Math.random = () => v; try { return fn(); } finally { Math.random = saved; } };

(async () => {
  Game = await K.load({ seed: SEED, narration: true });
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const villages = Game.state.otherVillages || [];
  ok(villages.length >= 2, `generated ${villages.length} distant villages`);
  const v = villages[0];
  ok(!v.generated && !v.rumored, 'village starts unvisited and unrumored');

  // 1. maybeVillageRumor fires when rigged, queues a well-formed rumor
  const n0 = (Game.state.scholar.rumors || []).length;
  const fired = rig(0, () => Game.maybeVillageRumor(v));
  ok(fired === true, 'maybeVillageRumor returns true on success');
  ok(v.rumored === true, 'village marked rumored');
  ok(v.rumorDay == null, 'queued word has no delivery day');
  ok(!Game.villageLoreEntry(Game.playerKnowerId(), v.id), 'queueing grants no player village lore');
  const rs = Game.state.scholar.rumors || [];
  ok(rs.length === n0 + 1, 'exactly one rumor queued');
  const r = rs[rs.length - 1];
  ok(r.type === 'village' && r.villageId === v.id && /traveler passed through/i.test(r.text) && r.text.includes(v.name),
    `rumor text names the village: "${String(r.text).slice(0, 70)}..."`);

  // The actual delivery grants knowledge and stamps the current day.
  ok(Game.deliverVillageRumors() === true, 'traveler actually delivers the queued rumor');
  ok(r.delivered === true && v.rumorDay === Game.state.scholar.day, 'delivery stamps the actual day');
  const lore = Game.villageLoreEntry(Game.playerKnowerId(), v.id);
  ok(lore && lore.how === 'rumor', 'delivery grants the player rumor provenance');

  // 2. no double-fire: second call (even rigged) does nothing
  const fired2 = rig(0, () => Game.maybeVillageRumor(v));
  ok(fired2 === false, 'no second rumor for an already-rumored village');
  ok((Game.state.scholar.rumors || []).length === n0 + 1, 'rumor count unchanged');

  // 3. endDay integration: an unrumored, unvisited village can rumor via endDay
  const v2 = villages[1];
  const unrumoredBefore = villages.filter(x => !x.rumored && !x.generated).map(x => x.id);
  const n1 = (Game.state.scholar.rumors || []).length;
  rig(0, () => Game.endDay());
  const rs2 = Game.state.scholar.rumors || [];
  ok(v2.rumored === true, 'endDay rolled a rumor for the second village');
  ok(rs2.length === n1 + unrumoredBefore.length, `endDay queued one rumor per unrumored village (${unrumoredBefore.length})`);
  ok(rs2[rs2.length - 1].villageId === v2.id || unrumoredBefore.includes(rs2[rs2.length - 1].villageId),
    'endDay rumors point at real unvisited villages');

  // 4. OLD behavior is gone: approaching an unrumored village does NOT rumor via catchUpSim.
  //    Reset v2 to unrumored, teleport next to it, catch up — no rumor should appear.
  v2.rumored = false;
  const n2 = (Game.state.scholar.rumors || []).length;
  Game.map.px = v2.x; Game.map.py = v2.y;
  Game.catchUpSim(v2);
  const afterSim = (Game.state.scholar.rumors || []).filter(x => x.villageId === v2.id && !x._pre).length;
  ok(v2.generated === true, 'catchUpSim still generates the village');
  ok(v2.rumored === false, 'catchUpSim no longer marks rumored');
  ok((Game.state.scholar.rumors || []).length === n2, 'approach sim queues no rumor (travelers come via endDay now)');
  void afterSim;

  // 5. visited villages never rumor again (rumorDay stays null-ish)
  const fired3 = rig(0, () => Game.maybeVillageRumor(v2));
  ok(fired3 === false, 'generated (visited) village never rumors');

  console.log(failures ? `\n${failures}/${checks} FAILURES` : `\nALL GREEN (${checks} checks)`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('HARNESS CRASH: ' + (e && e.stack || e)); process.exit(2); });
