#!/usr/bin/env node
// scripts/test-comfort-pool-20261014.js — journey SCALE r4 PROOF (2026-10-14).
//
// Blank filled (r3 blank #2): seek_comfort response pools were tiny —
//   dlg:stay:lines=3, dlg:stay:deepen=2, dlg:comfort:lines=3 — and two villagers
//   recited the stay sequence VERBATIM (Ruby d85 ≡ Wolfgang d105: "Good.
//   Company's company." / "Stay as long as you like." / "Nice. Sit. The
//   fire's warm."). Same class as the mourning-pool blank (deepening r9).
//
// Fix (src/js/convo-dialogue.js): pools expanded to 7/5/7 with new variants
// in the gritty-warm villager voice — no filler, no fabricated shared history.
//
// RED (pristine): pool sizes captured at 3/2/3; two identically-driven
//   villagers' 3 pre-deepen stay lines share a 3-line universe (verbatim
//   shared script). The GREEN assertions fail here.
// GREEN (fixed): pool sizes 7/5/7; original lines all still present (tone
//   preserved); no unfilled {braces}; the two villagers' 3-stay sequences
//   differ (verbatim-repeat gone). Sample-gated: divergence must hold on a
//   majority of seeds.
//
// Usage: SEED=11 node scripts/test-comfort-pool-20261014.js  (default 11,22,33)
//
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// Drive a comfort visit: fresh convo, 4× stay (3 small + 1 deepen), 3× comfort.
function driveComfort(Game, vid) {
  const stay = [], deepen = [], comfort = [];
  try { Game.startConvo(vid); } catch (e) { return { stay, deepen, comfort, err: 'startConvo: ' + e.message }; }
  try {
    for (let i = 0; i < 4; i++) {
      const r = Game.convoTurn(vid, 'dlg:stay');
      const line = String((r && r.line) || '');
      if (i < 3) stay.push(line); else deepen.push(line);
      if (r && r.ended) break;
    }
    for (let i = 0; i < 3; i++) {
      const r = Game.convoTurn(vid, 'dlg:comfort');
      comfort.push(String((r && r.line) || ''));
      if (r && r.ended) break;
    }
  } catch (e) { return { stay, deepen, comfort, err: 'drive: ' + e.message }; }
  try { Game.endConvo(vid, 'done'); } catch (e) {}
  return { stay, deepen, comfort };
}

async function runOne(seed, sense) {
  console.log(`\n### seed ${seed}`);
  const { Game } = await loadGame({ seed, mode: 'comfort-pool-r4' });
  await setupGame(Game);

  // capture pool sizes (and contents) by wrapping convoPickCycle
  const poolSize = {}, poolContent = {};
  const _pc = Game.convoPickCycle.bind(Game);
  Game.convoPickCycle = function (vid, key, pool) {
    if (key === 'dlg:stay:lines' || key === 'dlg:stay:deepen' || key === 'dlg:comfort:lines') {
      poolSize[key] = (pool || []).length;
      poolContent[key] = (pool || []).map(String);
    }
    return _pc(vid, key, pool);
  };

  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const alive = roster.filter(id => !(Game.getPerson(id) || {}).dead);
  if (alive.length < 2) { console.log('  FAIL setup: need 2 live NPCs'); fail++; return { seed, diverged: false }; }
  const [vidA, vidB] = alive.slice(0, 2);

  const a = driveComfort(Game, vidA);
  const b = driveComfort(Game, vidB);

  const nm = (vid) => { try { return Game.displayName(vid) || vid; } catch (e) { return vid; } };
  console.log(`  INFO A=${nm(vidA)} stays:`, a.stay);
  console.log(`  INFO B=${nm(vidB)} stays:`, b.stay);
  console.log(`  INFO A comfort:`, a.comfort);
  console.log(`  INFO pool sizes:`, JSON.stringify(poolSize));

  if (sense) {
    console.log(`\n  --- SENSE transcript (seed ${seed}) ---`);
    console.log(`  A (${nm(vidA)}) stays:`);
    a.stay.forEach((l, i) => console.log(`    ${i + 1}. ${l}`));
    console.log(`  A deepen: ${a.deepen[0]}`);
    console.log(`  A comfort:`);
    a.comfort.forEach((l, i) => console.log(`    ${i + 1}. ${l}`));
    console.log(`  B (${nm(vidB)}) stays:`);
    b.stay.forEach((l, i) => console.log(`    ${i + 1}. ${l}`));
    console.log(`  B deepen: ${b.deepen[0]}`);
  }

  ok('drive clean (A)', !a.err, a.err);
  ok('drive clean (B)', !b.err, b.err);
  if (a.err || b.err) return { seed, diverged: false };

  // sample gate: both villagers must have 3 stay lines before deepening
  const gated = a.stay.length === 3 && b.stay.length === 3 && a.stay.every(Boolean) && b.stay.every(Boolean);
  ok('sample-gated (3+3 stay lines)', gated, `A:${a.stay.length} B:${b.stay.length}`);
  if (!gated) return { seed, diverged: false };

  // GREEN assertions
  ok('dlg:stay:lines pool = 7', poolSize['dlg:stay:lines'] === 7, String(poolSize['dlg:stay:lines']));
  ok('dlg:stay:deepen pool = 5', poolSize['dlg:stay:deepen'] === 5, String(poolSize['dlg:stay:deepen']));
  ok('dlg:comfort:lines pool = 7', poolSize['dlg:comfort:lines'] === 7, String(poolSize['dlg:comfort:lines']));

  const union3 = new Set([...a.stay, ...b.stay]);
  const verbatimSame = a.stay.join('|') === b.stay.join('|');
  console.log(`  INFO 3-stay universe size: ${union3.size} (pristine=3), verbatim-identical: ${verbatimSame}`);
  ok('villagers diverge (not verbatim-identical 3-stay sequence)', !verbatimSame,
    a.stay.join(' / ').slice(0, 160));
  ok('stay universe > 3 (shared script broken)', union3.size > 3, String(union3.size));

  // tone preservation: the three original stay lines still in the pool
  const originals = [
    '"Nice. Sit. The fire\'s warm."',
    '"Good. Company\'s company."',
    'They shift over, making room. "Stay as long as you like."',
    '"...I keep thinking about them. About — everyone. Sorry. It just comes out, sitting here."',
    '"You know what\'s worst? The quiet parts. When the fire\'s the only one talking."',
    '"Thanks. ...Thanks for saying that."',
    '"I — yeah. It helps, hearing that."',
    '"You\'re kind. Don\'t let this place change that."',
  ];
  // verify via a fresh drive that all originals appear in captured pools —
  // approximate by checking union of all lines seen across both villagers
  // still contains each original (said-filters mean a single drive may miss
  // one; check the captured union with a generous net)
  // tone preservation: the original lines still in the pool — check the
  // captured pool CONTENTS, not random draws (pools are bigger than the
  // drive samples them).
  const allPool = [...(poolContent['dlg:stay:lines'] || []), ...(poolContent['dlg:stay:deepen'] || []),
    ...(poolContent['dlg:comfort:lines'] || [])];
  const missed = originals.filter(o => !allPool.some(l => l.includes(o)));
  ok('original lines preserved (tone)', missed.length === 0, 'missing: ' + missed.join(' || ').slice(0, 200));

  // full variant lists for the sense-print
  if (sense) {
    console.log(`  --- full variant lists (seed ${seed}) ---`);
    for (const k of ['dlg:stay:lines', 'dlg:stay:deepen', 'dlg:comfort:lines']) {
      console.log(`  ${k} (${poolSize[k]}):`);
      (poolContent[k] || []).forEach((l, i) => console.log(`    ${i + 1}. ${l}`));
    }
  }

  // no unfilled template braces anywhere in captured lines
  const braces = allPool.filter(l => /\{[a-zA-Z]+\}/.test(l));
  ok('no unfilled {braces}', braces.length === 0, braces.join(' || ').slice(0, 200));

  return { seed, diverged: !verbatimSame };
}

async function main() {
  const seeds = process.env.SEED ? [parseInt(process.env.SEED, 10)] : [11, 22, 33];
  const sense = process.env.SENSE === '1';
  const results = [];
  for (const s of seeds) results.push(await runOne(s, sense));
  const div = results.filter(r => r.diverged).length;
  ok(`divergence majority across seeds (${div}/${results.length})`, div * 2 > results.length);
  console.log(`\n==== ${pass} passed, ${fail} failed ====`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
