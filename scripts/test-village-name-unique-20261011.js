#!/usr/bin/env node
// test-village-name-unique-20261011.js — travel lever r3 proof (Steve 2026-10-11).
// Village names must be unambiguous in-world: no exact duplicates, no
// near-duplicates (one name containing another). The old schism scheme named
// splinters "<parent> <suffix>", so "Emberhold" and "Emberhold the Red Table"
// sat in the same rumor pool and rumors ("X has bound Y") went ambiguous.
// Design call: lineage lives in the rumor copy ("A faction of X has split —
// ... they call the new fire <name>"), never in the name itself.
// Runs BEFORE and AFTER the fix on identical seeds: before, the uniqueness
// assertions fail (the bug, documented); after, all pass.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = [4242, 7, 99];
const CAUSES = ['cannibal', 'famine-flight', 'hardline', 'peaceful', 'succession-loser'];

// The in-world ambiguity rule: exact match (case-insensitive), or one name
// containing the other ("Emberhold" vs "Emberhold the Red Table"). The one
// sanctioned exception: ordinal-marked kin ("The Red Table" vs
// "The Red Table II") — the numbered mark IS the disambiguator, so they are
// not ambiguous with each other.
function stripMark(s) {
  return String(s || '').toLowerCase().trim()
    .replace(/\s+(ii|iii|iv|ix|v|vi|vii|viii|x)$/, '')
    .replace(/\s+#\d+$/, '');
}
function nearDup(a, b) {
  const x = String(a || '').toLowerCase().trim(), y = String(b || '').toLowerCase().trim();
  if (!x || !y) return false;
  return x === y || x.indexOf(y) >= 0 || y.indexOf(x) >= 0;
}
function ordinalKin(a, b) {
  const x = String(a || '').toLowerCase().trim(), y = String(b || '').toLowerCase().trim();
  return x !== y && stripMark(x) === stripMark(y);
}
function countPairs(names) {
  let exact = 0, badNear = 0, kin = 0; const pairs = [];
  for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) {
    const a = names[i], b = names[j];
    if (String(a).toLowerCase() === String(b).toLowerCase()) { exact++; pairs.push(['exact', a, b]); }
    else if (nearDup(a, b)) {
      if (ordinalKin(a, b)) { kin++; }
      else { badNear++; pairs.push(['near', a, b]); }
    }
  }
  return { exact, badNear, kin, pairs };
}

let pass = 0, fail = 0;
function ok(cond, label, detail) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL: ' + label + (detail ? ' — ' + detail : '')); }
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'nameuniq', fullTelemetry: false });
  await setupGame(Game);
  const ovs = () => (Game.state.otherVillages || []);
  const parents = ovs().slice();
  const parentNames = parents.map(v => v && v.name);
  // Force a schism storm: every cause from every village, twice each. The old
  // scheme produced "<parent> <cause-suffix>" — same parent + same cause =
  // an EXACT duplicate; any parent + any cause = a NEAR duplicate.
  const formed = [];
  for (const v of parents) {
    for (const c of CAUSES) {
      for (let k = 0; k < 2; k++) {
        try {
          const res = Game.fireSplinter(v.id, c);
          if (res && res.newVillage) formed.push({ nv: res.newVillage, parent: v.name, cause: c });
        }
        catch (e) { /* schism may decline (n<2); fine */ }
      }
    }
  }
  const names = ovs().map(v => v && v.name).filter(Boolean);
  const { exact, badNear, kin, pairs } = countPairs(names);

  console.log(`seed ${seed}: villages=${ovs().length} splinters-formed=${formed.length}`);
  console.log('  names: ' + JSON.stringify(names));
  console.log(`  collision pairs: exact=${exact} badNear=${badNear} (sanctioned ordinal-kin=${kin})`);
  for (const [kind, a, b] of pairs.slice(0, 8)) console.log(`    ${kind}: "${a}" ~ "${b}"`);

  ok(exact === 0, 'no exact-duplicate village names', `exact=${exact}`);
  ok(badNear === 0, 'no ambiguous near-duplicate village names', `badNear=${badNear}`);
  ok(formed.length > 0, 'schism storm formed at least one splinter', `formed=${formed.length}`);

  // No splinter may carry its parent's name inside its own.
  let parentCarry = 0;
  for (const f of formed) {
    if (nearDup(f.nv.name, f.parent)) {
      parentCarry++;
      if (parentCarry <= 4) console.log(`    parent-carry: parent="${f.parent}" splinter="${f.nv.name}" (${f.cause})`);
    }
  }
  ok(parentCarry === 0, 'no splinter name contains its parent name', `parentCarry=${parentCarry}`);

  // Rumor copy: lineage legible, new fire named, names unambiguous.
  let rumor = '', wrongRumor = '';
  try {
    const v = parents[0], nv = formed.length ? formed[0].nv : null;
    rumor = Game._vaRumorText(v, 'schism', false, { cause: 'cannibal', newVillageId: nv && nv.id }) || '';
    wrongRumor = Game._vaRumorText(v, 'schism', true, { cause: 'cannibal', newVillageId: nv && nv.id }) || '';
  } catch (e) { console.log('  rumor ERR: ' + e.message); }
  console.log('  rumor: ' + rumor);
  console.log('  rumor(wrong): ' + wrongRumor);
  ok(rumor.indexOf(v_name(parents[0])) >= 0, 'rumor carries the parent lineage', rumor);
  const newName = formed.length ? formed[0].nv.name : '';
  ok(newName && rumor.indexOf(newName) >= 0, 'rumor names the new fire', rumor);
  ok(!(newName && nearDup(newName, v_name(parents[0]))), 'rumored new name is unambiguous vs parent', `"${newName}" vs "${v_name(parents[0])}"`);
  ok(/split/i.test(wrongRumor), 'wrong-variant still says it split (the correction)', wrongRumor);

  return { seed, villages: ovs().length, formed: formed.length, exact, badNear, kin, names };
}
function v_name(v) { return (v && v.name) || 'a village'; }

async function main() {
  const rows = [];
  for (const s of SEEDS) { try { rows.push(await runSeed(s)); } catch (e) { console.log(`seed ${s} ERROR: ${e.message}`); fail++; } }
  console.log(`\nRESULT: ${pass} pass, ${fail} fail (seeds ${SEEDS.join(',')})`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
