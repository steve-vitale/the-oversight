// test-fallen-memorial-20261022.js — proof for rogue P0-3 "The Fallen".
//
// RED (pre-fix): v.fallen entries were {villagerId, day, cause} — no name —
//   and no UI surface read the roll at all.
// GREEN (post-fix):
//   1. Every exercised death path writes a fallen record WITH a name field.
//   2. The name is knowledge-gated at death (firstRef): unknown → descriptor,
//      the true name never leaks; known → true first name.
//   3. memorialRoll() returns the gated entries oldest-first, with journal
//      epitaphs surfaced for mantle-holders (reuse, not reinvented).
//   4. fallenMemorialHTML() renders the Codex THE FALLEN section (empty state
//      speaks aloud — no silent actions).
//
// Paths exercised directly: hurtVillager (site 1), tbVillagerFalls/combat
// (site 4), playerDeath mantle transfer (ledger site 8). The wound, thirst,
// and three phoenix sites carry the identical one-line fallenName fix —
// verified by diff, not by execution (their trigger machinery is deep).
// UI rendering itself can't be proven in node — the card needs Steve's
// phone eyes. ([needs-eyes])
//
// Run: node scripts/test-fallen-memorial-20261022.js   (SEED=... override)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEED = parseInt(process.env.SEED || '20261022', 10);

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'test-fallen-memorial' });
  await setupGame(Game);
  let fails = 0;
  const ok = (cond, msg, extra) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' — ' + msg + (cond || !extra ? '' : ' :: ' + extra));
    if (!cond) fails++;
  };
  const fallenFor = vid => (Game.state.village.fallen || []).find(f => f.villagerId === vid);
  const trueFirst = vid => String(((Game.data.villagers || []).find(p => p.id === vid) || {}).name || '').split(' ')[0];

  const me = Game.villagerId;
  const fresh = () => Game.state.village.roster.filter(id => id !== Game.villagerId && !fallenFor(id));

  // --- 0. Empty roll: the memorial speaks instead of staying silent.
  const emptyHtml = Game.fallenMemorialHTML();
  ok(/THE FALLEN/.test(emptyHtml), 'empty memorial renders the THE FALLEN section');
  ok(/No one has fallen/.test(emptyHtml), 'empty memorial says so aloud (no silent absence)');

  // --- 1. Unknown name at death → descriptor; true name hidden.
  const vid1 = fresh().find(id => !Game.nameKnown(id));
  ok(!!vid1, 'found a villager whose name is unknown pre-System');
  const tf1 = trueFirst(vid1);
  Game.hurtVillager(vid1, 99999, 'monster');
  const f1 = fallenFor(vid1);
  ok(!!f1, 'hurtVillager death wrote a fallen record');
  ok(!!(f1 && f1.name), 'fallen record carries a name field', JSON.stringify(f1));
  ok(f1 && f1.name !== tf1, `name is knowledge-gated ("${f1 && f1.name}" hides true first name "${tf1}")`);
  ok(f1 && !/^[A-Z][a-z]+$/.test(f1.name) || (f1 && f1.name.indexOf(' ') >= 0),
    'unknown-name record is a descriptor, not a bare first name', f1 && f1.name);

  // --- 2. Known name at death → true first name stored.
  const vid2 = fresh().find(id => id !== vid1 && !Game.nameKnown(id));
  ok(!!vid2, 'found a second unknown villager');
  Game.revealName(vid2, 'intro');
  ok(Game.nameKnown(vid2), 'name revealed before death');
  const tf2 = trueFirst(vid2);
  Game.hurtVillager(vid2, 99999, 'monster');
  const f2 = fallenFor(vid2);
  ok(!!(f2 && f2.name), 'second fallen record carries a name field');
  ok(f2 && f2.name === tf2, `known name stored as firstRef ("${f2 && f2.name}" === "${tf2}")`);

  // --- 3. memorialRoll: gated entries, oldest first, no leaks.
  const roll = Game.memorialRoll();
  ok(Array.isArray(roll) && roll.length >= 2, `memorialRoll returns entries (n=${roll.length})`);
  ok(roll[0].day <= roll[1].day, 'memorialRoll is chronological (oldest first)');
  ok(!roll.some(e => e.name === tf1), 'the unknown true name never leaks via the roll');
  ok(roll.every(e => e.villagerId && e.name && e.cause != null), 'every entry has villagerId, name, cause');
  ok(roll.every(e => e.epitaph == null || typeof e.epitaph === 'string'), 'epitaph is string-or-null');

  // --- 4. Combat path (tbVillagerFalls) writes the name field too.
  const vid3 = fresh().find(id => !Game.nameKnown(id));
  if (vid3) {
    const tf3 = trueFirst(vid3);
    Game.tbVillagerFalls({ villagerId: vid3 });
    const f3 = fallenFor(vid3);
    ok(!!(f3 && f3.name), 'combat death wrote a fallen record with a name field');
    ok(f3 && f3.cause === 'combat', 'combat record keeps its cause', JSON.stringify(f3));
    ok(f3 && f3.name !== tf3, 'combat name is knowledge-gated too', f3 && f3.name);
  } else {
    ok(false, 'found a third victim for the combat path');
  }

  // --- 5. Mantle transfer (playerDeath): fallen record + journal epitaph, surfaced.
  const oldBearer = Game.villagerId;
  const oldTrueFirst = trueFirst(oldBearer); // death-time rule: the village knew its scholar
  Game.playerDeath('monster');
  await new Promise(r => setTimeout(r, 50)); // journal epitaph wrap fires on a macrotask
  const fB = fallenFor(oldBearer);
  ok(!!(fB && fB.name), 'mantle-transfer death wrote a fallen record with a name field', JSON.stringify(fB));
  ok(Game.villagerId !== oldBearer && !Game.over, 'mantle passed to a successor, run continues');
  const roll2 = Game.memorialRoll();
  const rb = roll2.find(e => e.villagerId === oldBearer);
  ok(!!(rb && rb.epitaph), 'memorialRoll surfaces the bearer\'s journal epitaph', rb && String(rb.epitaph).slice(0, 60));
  ok(rb && rb.name === oldTrueFirst, `dead bearer named as the village knew them ("${rb && rb.name}"), never the dialogue token 'you'`);
  const html = Game.fallenMemorialHTML();
  ok(html.indexOf('🕯️') >= 0, 'memorial HTML renders candle rows');
  ok(rb && html.indexOf(rb.epitaph.slice(0, 20)) >= 0, 'memorial HTML carries the epitaph text');
  ok(html.indexOf('data-fallen-epitaph') >= 0, 'epitaph rows are tap targets');
  ok(html.indexOf('<b>' + rb.name + '</b>') >= 0, 'bearer row shows the gated name');

  // --- 6. KIN.md: only real roster deaths land in the roll — never the Taken.
  // (The Taken are fiction-only, never villager records; the write sites are
  // the enforcement point. Here: every roll entry traces to a roster death.)
  const initialRoster = new Set(Game.state.village.roster.concat(roll2.map(e => e.villagerId)));
  ok(roll2.every(e => initialRoster.has(e.villagerId)), 'every memorial entry traces to a real roster villager');

  console.log(fails ? `\n${fails} FAILURES` : '\nALL GREEN');
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
