// test-reunionwild2-b.js — proof for arm sim-reunionwild2-b.
//
//   1. Analyzer determinism: summarizeSeed twice over the same corpus
//      JSON yields byte-identical output.
//   2. Spot-checks against the frozen prereg §6 numbers (computed from
//      the landed corpora, never hand-typed): bloodcluster recompute
//      (109312 = 68; pooled 300 / door 167 / non-door 133; exactly
//      the 10 published-mismatch seeds; every other §5 column
//      reproduces), herald old band (84 refused / 0 genuine /
//      19 field), succession corpus (109460 day 144, distinct
//      fightIds: Saengduean vs reunion x2, Brian vs editor).
//   3. Instrument smoke: the reunionwild2 instrument installs on a
//      live game and attaches liveFight context to the tbStarts row
//      its inner wrap pushes.
//   4. Eulogy repro (item 3, frozen §4 shape): stage the REAL doom
//      path through sigEulogyHook with verses exhausted and an
//      armored scholar, via the shared harness — no stubbed damage,
//      no hand-built tbDamage call. POST-FIX assertions: no absorb
//      line in the doom tail, scholar still dies, maybeCheatDeath
//      path intact (a second_wind scholar survives with the cheat
//      line, no absorb line either). Run on UN-FIXED code first: the
//      no-absorb assertions MUST fail there (the absorb line is
//      present) or the fix proves nothing.
//
// Usage: node scripts/test-reunionwild2-b.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const AN = require('./reunionwild2-b-analyze-20261127');
const INST = require('./reunionwild2-b-instrument-20261127');
const REPO = path.join(__dirname, '..');

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function loadJson(rel) { return JSON.parse(fs.readFileSync(path.join(REPO, rel), 'utf8')); }

async function stageDoom(seed, opts) {
  // opts: { armor: bool, cheat: bool } — stages one live Eulogy fight
  // and fires the real doom hook with verses exhausted. Returns the
  // game, the say lines, and the playerDeath calls.
  const { Game } = await loadGame({ seed: seed, mode: 'reunionwild2-b-proof', fullTelemetry: false });
  await setupGame(Game);
  Game.state.arenaContest = null;
  Game.state.phoenixLink = null;
  try { Game.state.scholar.abilities = []; } catch (e) {}
  try { Game.state.scholar.stats = Object.assign({}, Game.state.scholar.stats, { agi: 5 }); } catch (e) {}
  if (opts.cheat) {
    const s = Game.state.scholar;
    s.abilities = s.abilities || [];
    s.abilities.push({ id: 'second_wind', name: 'second_wind', level: 1, xp: 0 });
    try { Game.recomputeActiveSynergies(); } catch (e) {}
    try { s.secondWindDay = -1; s.secondWindUses = 0; } catch (e) {}
  }
  const sayLines = [];
  const deaths = [];
  const origSay = Game.say;
  Game.say = function () { try { sayLines.push(String(arguments[0] || '')); } catch (e) {} return origSay.apply(this, arguments); };
  const origPD = Game.playerDeath;
  Game.playerDeath = function (cause) { deaths.push(cause); return origPD.apply(this, arguments); };
  let prot = 0;
  if (opts.armor) {
    try {
      Game.state.scholar.equipped = Game.state.scholar.equipped || {};
      Game.state.scholar.equipped.torso = { itemId: 'military_vest' };
      prot = Game.armorBonus();
    } catch (e) { prot = -1; }
  }
  Game.startCombat('eulogy');
  const fight = Game.tbfight;
  assert.ok(fight && !fight.over, 'a live fight must be open after startCombat(eulogy)');
  const eulogy = fight.fighters.find(function (x) { return x && x.kind === 'monster' && ((x.mdef || {}).id || x.monsterId) === 'eulogy'; });
  assert.ok(eulogy, 'a Eulogy fighter must be in the fight');
  eulogy.sigEulogy = { verses: 0, contradicted: 0 };
  const HB = globalThis.MonsterBehaviorHooks || {};
  assert.strictEqual(typeof HB.sigEulogy, 'function', 'MonsterBehaviorHooks.sigEulogy must exist');
  const saidBefore = sayLines.length;
  const ret = HB.sigEulogy(Game, eulogy);
  assert.strictEqual(ret, true, 'the exhausted-verses hook must fire the doom (return true)');
  const tail = sayLines.slice(saidBefore);
  return { Game: Game, sayLines: sayLines, tail: tail, deaths: deaths, prot: prot, fightId: fight.id };
}

(async () => {
  // --- 1. analyzer determinism ---
  const v2 = loadJson('evidence/2026-11-24/perseed-bloodcluster-b/bloodcluster-b-s109312-bloodcluster-b-v2.json');
  ok('analyzer determinism: summarizeSeed twice over the same JSON is byte-identical', function () {
    const a = JSON.stringify(AN.summarizeSeed(JSON.parse(JSON.stringify(v2))));
    const b = JSON.stringify(AN.summarizeSeed(JSON.parse(JSON.stringify(v2))));
    assert.strictEqual(a, b, 'same inputs must give same outputs');
  });

  // --- 2. frozen §6 spot-checks ---
  ok('bloodcluster recompute: 109312 is 56 field + 12 genuine TB = 68 (published 61)', function () {
    const rec = AN.recomputeBloodcluster(REPO);
    assert.strictEqual(rec.files, 16, '16 v2 files');
    const r = rec.rows.find(function (x) { return x.seed === 109312; });
    assert.strictEqual(r.field, 56, '109312 field');
    assert.strictEqual(r.tb, 12, '109312 genuine TB');
    assert.strictEqual(r.contacts, 68, '109312 contacts');
    assert.strictEqual(r.published, 61, '109312 published');
    assert.strictEqual(r.match, false, '109312 mismatches the published table');
  });
  ok('bloodcluster recompute: pooled totals reproduce exactly (300; door 167 / non-door 133)', function () {
    const rec = AN.recomputeBloodcluster(REPO);
    assert.strictEqual(rec.pooled.total, 300, 'pooled contacts');
    assert.strictEqual(rec.pooled.door, 167, 'door contacts');
    assert.strictEqual(rec.pooled.nonDoor, 133, 'non-door contacts');
    assert.strictEqual(rec.pooledReproduces, true, 'pooled reproduction flag');
  });
  ok('bloodcluster recompute: exactly the 10 published-mismatch seeds, and every other §5 column reproduces', function () {
    const rec = AN.recomputeBloodcluster(REPO);
    assert.deepStrictEqual(rec.mismatches, [109310, 109312, 109313, 109314, 109315, 109318, 109319, 109323, 109324, 109325],
      'mismatch seeds, got ' + JSON.stringify(rec.mismatches));
    assert.deepStrictEqual(rec.otherColumnDiffs, [], 'no other §5 column may disagree, got ' + JSON.stringify(rec.otherColumnDiffs));
  });
  ok('herald old band: 84 refused / 0 genuine / 19 field contacts', function () {
    const h = AN.heraldOldBand(REPO);
    assert.strictEqual(h.refused, 84, 'refused herald starts');
    assert.strictEqual(h.genuine, 0, 'genuine herald starts');
    assert.strictEqual(h.field, 19, 'herald field contacts');
  });
  ok('succession corpus: 109460 day 144 is two fights, not one (Saengduean vs reunion x2; Brian vs editor)', function () {
    const sc = AN.successionCorpus(path.join(REPO, 'evidence', '2026-11-24', 'perseed-wilddeath-b', 'wilddeath-b-s109460-wilddeath-b.json'));
    assert.strictEqual(sc.rows.length, 2, 'two day-144 scholar deaths');
    assert.strictEqual(sc.twoFights, true, 'distinct fightIds');
    assert.strictEqual(sc.sameFight, false, 'not the same fight');
    assert.strictEqual(sc.rows[0].victim, 'Saengduean', 'first victim');
    assert.deepStrictEqual(sc.rows[0].monsters, ['reunion', 'reunion'], 'Saengduean dies to two Reunions');
    assert.strictEqual(sc.rows[1].victim, 'Brian', 'second victim');
    assert.deepStrictEqual(sc.rows[1].monsters, ['editor'], 'Brian dies to an Editor');
  });

  // --- 3. instrument smoke: liveFight context attaches ---
  {
    const { Game } = await loadGame({ seed: 109456, mode: 'reunionwild2-b-proof', fullTelemetry: false });
    await setupGame(Game);
    const inst = INST.install(Game);
    const before = (inst.t.tbStarts || []).length;
    Game.startCombat('eulogy');
    const rows = inst.t.tbStarts || [];
    assert.strictEqual(rows.length, before + 1, 'one tbStarts row per startCombat call');
    const row = rows[rows.length - 1];
    assert.ok('liveFight' in row, 'the row must carry liveFight context');
    assert.strictEqual(row.liveFight, null, 'no fight was live before this start, so liveFight is null');
    assert.strictEqual(row.mid, 'eulogy', 'row monster is the eulogy');
    assert.strictEqual(row.rebuilt, true, 'the start is genuine (rebuilt)');
    assert.strictEqual((inst.t.playerDeaths || []).length, 0, 'no scholar death yet');
    assert.deepStrictEqual(inst.t.instrumentErrors, [], 'no instrument errors, got ' + JSON.stringify(inst.t.instrumentErrors));
    try { inst.uninstall(); } catch (e) {}
    ok('instrument smoke: liveFight context attaches to the tbStarts row (null when no fight live)', function () {});
  }

  // --- 4. Eulogy repro (item 3) ---
  // Seed 109456 is the observed seed (day 116, "Armor absorbs 9735").
  // The fixture is staged, not a replay — the bar is the presence of
  // an absorb line on the doom beat, not the exact 9735.
  {
    const d = await stageDoom(109456, { armor: true, cheat: false });
    console.log('  info doom prot=' + d.prot + ' tail=' + JSON.stringify(d.tail));
    ok('eulogy doom is narrated as the story finishing', function () {
      assert.ok(d.tail.some(function (l) { return /they ended/.test(l); }), 'doom line present, tail=' + JSON.stringify(d.tail));
    });
    ok('eulogy doom prints NO armor-absorb line (doom bypasses armor)', function () {
      const absorb = d.tail.filter(function (l) { return /absorbs/.test(l); });
      assert.strictEqual(absorb.length, 0, 'absorb lines in the doom tail: ' + JSON.stringify(absorb));
    });
    ok('eulogy doom still kills the scholar', function () {
      assert.ok(d.Game.state.scholar.health <= 0 || d.deaths.length >= 1,
        'scholar health=' + d.Game.state.scholar.health + ' deaths=' + d.deaths.length);
      assert.ok(d.deaths.length >= 1, 'playerDeath must fire, got ' + d.deaths.length);
    });
  }
  {
    const d = await stageDoom(109456, { armor: true, cheat: true });
    console.log('  info cheat tail=' + JSON.stringify(d.tail));
    ok('maybeCheatDeath path intact: a second_wind scholar survives the doom with the cheat line, no absorb line', function () {
      assert.ok(d.tail.some(function (l) { return /SECOND WIND/.test(l); }), 'cheat line present, tail=' + JSON.stringify(d.tail));
      const absorb = d.tail.filter(function (l) { return /absorbs/.test(l); });
      assert.strictEqual(absorb.length, 0, 'absorb lines in the cheat doom tail: ' + JSON.stringify(absorb));
      assert.ok(d.Game.state.scholar.health > 0, 'cheating scholar survives, health=' + d.Game.state.scholar.health);
      assert.strictEqual(d.deaths.length, 0, 'no playerDeath on a cheated doom, got ' + d.deaths.length);
    });
  }

  console.log('PASS all ' + pass + ' reunionwild2-b checks');
  process.exit(0);
})().catch(function (e) { console.error('FAIL reunionwild2-b: ' + (e && e.stack || e)); process.exit(1); });
