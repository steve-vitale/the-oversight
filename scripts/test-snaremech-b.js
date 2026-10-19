// test-snaremech-b.js — finding #631 (flesh-out loop B, 2026-10-19).
//
// Question: are snare_wire L2/L3 `trap_success` mechanicals (0.2/0.4 in
// src/data/knowledge.json) actually read by the engine, or dormant?
// A 2026-10-19 grep claimed "zero callers" — but the mechanical key is
// consumed GENERICALLY (engine/modifiers.js KNOWLEDGE_MOD_MAP), never by
// name, so the grep may be a measurement artifact. This test pins the
// real end-to-end behavior and says which it is.
//
// What "live" means here (traced, not assumed):
//   knowledge.json snare_wire L2/L3 mechanical {trap_success: 0.2/0.4}
//     -> modifiers.js KNOWLEDGE_MOD_MAP 'trap_success' -> {target:'hunt.trap_catch', op:'add'}
//     -> collectKnowledgeModifiers((state.codex||{}).skills, data.knowledge), cumulative over levels, 'unlock' skipped
//     -> game.js allModifiers() -> mods() -> modTarget('hunt.trap_catch', 0.4)
//     -> game.js checkTraps() line ~3631: trapChance = min(0.95, modTarget(...))
//
// Expected if cumulative-add: L0 0.4 / L1 0.4 (unlock only) / L2 0.6 /
// L3 1.0 (0.4 base + 0.2 + 0.4) — capped to 0.95 at the checkTraps call
// site (game.js ~3631). The test pins whatever the code does and reports it.
//
// Uses the shared kit (scripts/sim-harness.js) per repo convention. One
// harness load per process; skill grants are monotonic so L0->L1->L2->L3 can
// be pinned sequentially in one game.
const { loadGame, setupGame, mulberry32, ROOT } = require('./sim-harness.js');

const results = [];
function check(name, cond, detail) {
  results.push({ name, ok: !!cond, detail: String(detail) });
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (detail !== undefined ? ' | ' + detail : ''));
}

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 20261019, narration: false });
  check('harness loads clean', loadFails.length === 0, loadFails.join('; ') || 'no load failures');
  await setupGame(Game);

  // Isolate the measurement: a generated roster's occupation could already
  // grant snare_wire (core-occupation background = L2). Start from a clean codex.
  Game.state.codex.skills = {};
  const tc = () => Game.modTarget('hunt.trap_catch', 0.4);

  // ---- det-gate: no snare_wire ranks -> pipeline must be invisible ----
  const baseline = tc();
  check('L0 trapChance pins at 0.4', Math.abs(baseline - 0.4) < 1e-9, baseline);
  // unrelated skills with live mechanicals at L3 must not leak into hunt.trap_catch
  for (const sid of ['fire_rain', 'wound_care', 'foraging', 'track_read']) {
    Game.learnSkill(sid, 3, 'test-control');
  }
  const afterUnrelated = tc();
  check('det-gate: 4 unrelated L3 skills, trapChance byte-identical', afterUnrelated === baseline, afterUnrelated);
  Game.state.codex.skills = {}; // reset again for the real pins

  // ---- the pins ----
  check('snare_wire L0 -> 0.4', Math.abs(tc() - 0.4) < 1e-9, tc());
  Game.learnSkill('snare_wire', 1, 'test');
  check('snare_wire L1 -> 0.4 (L1 is unlock-only, adds nothing)', Math.abs(tc() - 0.4) < 1e-9, tc());
  Game.learnSkill('snare_wire', 2, 'test');
  check('snare_wire L2 -> 0.6 (cumulative +0.2)', Math.abs(tc() - 0.6) < 1e-9, tc());
  Game.learnSkill('snare_wire', 3, 'test');
  check('snare_wire L3 -> 1.0 (cumulative +0.2+0.4; capped 0.95 in checkTraps)', Math.abs(tc() - 1.0) < 1e-9, tc());
  // the modifiers carry their source tag — proves the value came through the knowledge lane
  const mods = Game.allModifiers().filter(m => m.target === 'hunt.trap_catch');
  check('knowledge source tag present on the +0.6', mods.some(m => m.source === 'knowledge:snare_wire'),
    JSON.stringify(mods.map(m => [m.source, m.op, m.value])));

  // ---- end-to-end: real checkTraps() dawns, seeded RNG, shyness isolated ----
  // A snare on game-rich ground, wildlife + trap uses + trap-shyness reset
  // every dawn so the per-dawn probability is what we measure (shyness is a
  // separate mechanic, honestly noted, not part of this pin).
  const e2e = (skillLevel, seed) => {
    Game.state.codex.skills = {};
    if (skillLevel > 0) Game.learnSkill('snare_wire', skillLevel, 'test-e2e');
    const day = Game.state.scholar.day;
    const tile = Game.tileAt(4, 4);
    tile.traps = [{ recipeId: 'snare', mx: 4, my: 4, setDay: day, uses: 9999 }];
    Math.random = mulberry32(seed);
    let catches = 0;
    const before = Game.state.scholar.inventory.length;
    for (let d = 0; d < 60; d++) {
      tile.wildlife = { cottontail_rabbit: 99, gray_squirrel: 99, opossum: 99 };
      tile.trapShy = {};
      tile.traps[0].uses = 9999;
      Game.checkTraps();
    }
    const newItems = Game.state.scholar.inventory.slice(before);
    catches = newItems.filter(i => i.how === 'trapped').length;
    tile.traps = [];
    return catches;
  };
  const SEED = 777;
  const c0 = e2e(0, SEED);
  const c3 = e2e(3, SEED);
  console.log(`e2e 60 seeded dawns: L0 catches=${c0}, L3 catches=${c3}`);
  check('e2e: L3 catches strictly more than L0 on identical seed', c3 > c0, `L0=${c0} L3=${c3}`);
  check('e2e: L0 rate near 0.4 (60 dawns)', c0 >= 12 && c0 <= 40, `L0=${c0}/60`);
  check('e2e: L3 rate near cap 0.95 (60 dawns)', c3 >= 45 && c3 <= 60, `L3=${c3}/60`);

  const fails = results.filter(r => !r.ok);
  console.log(`\n${results.length - fails.length}/${results.length} checks pass`);
  if (fails.length) { console.log('FAILURES:'); fails.forEach(f => console.log(' - ' + f.name)); process.exit(1); }
}

main().catch(e => { console.error('HARNESS ERROR:', e && e.stack || e); process.exit(2); });
