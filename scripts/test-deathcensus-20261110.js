// test-deathcensus-20261110.js — proof for journey-scale r125.
// The death-cause census instrument (scripts/deathcensus-instrument-
// 20261110.js) + the Arm A retro-classifier (scripts/deathcensus-
// analyze-20261110.js).
//
// (1) LIVE: load a real game (seed 97904 — the r123 pilot seed),
// install the census instrument, run the r113 trade-road policy
// 40 days, and assert the instrument's own bars: 0 errors, one
// daily row per policy day, every death carried a named engine
// cause (unattributed == 0), fallen == telemetry person-deaths,
// and the books close (initial + joins == final + deaths + leavers).
// (2) RETRO: classify r123's published deathLog rows (Arm A) —
// 0 ambiguous rows; every `who` is either a creature id or a
// villager id, and the person-death count is reported per seed.
// A failure in (2) means the Arm A census cannot be trusted and
// the attribution's before-side is unreadable.
//
// Green BEFORE the Arm B pilot runs.
// Usage: node scripts/test-deathcensus-20261110.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const DC = require('./deathcensus-instrument-20261110');
const AN = require('./deathcensus-analyze-20261110');
const LR = require('./policies/scalecourt-traderoad-r113-linkraise-sit');

let passed = 0, failed = 0;
function check(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => { passed += 1; console.log('ok ' + passed + ' - ' + name); })
    .catch((e) => { failed += 1; console.error('FAIL - ' + name + '\n  ' + (e && e.stack ? e.stack.split('\n').slice(0, 5).join('\n  ') : e)); process.exitCode = 1; });
}

async function main() {
  // (2) RETRO first — no sim needed; if the classifier cannot read
  // Arm A, the attribution has no before-side.
  await check('Arm A retro-classifier: r123 deathLog rows classify with 0 ambiguous', async () => {
    const creatureSet = AN.creatureIds();
    assert.ok(creatureSet.size >= 180, 'creature id set loads (monsters + animals): ' + creatureSet.size);
    const dir = path.join(__dirname, '..', 'evidence', '2026-11-09', 'journey-scale-r123');
    let totalPerson = 0, totalCreature = 0, totalAmb = 0;
    for (const seed of [97901, 97902, 97903, 97904]) {
      const trust = JSON.parse(fs.readFileSync(path.join(dir, `journey-scale-r123-trust-${seed}.json`), 'utf8'));
      const rows = (trust.census.deathLog || []);
      assert.ok(rows.length > 0, `seed ${seed}: deathLog non-empty`);
      const classified = rows.map(r => AN.classifyRow({ who: r.who, cause: r.cause, day: r.day, player: !!r.player }, creatureSet));
      const amb = classified.filter(x => x.kind === 'ambiguous');
      assert.strictEqual(amb.length, 0, `seed ${seed}: ambiguous rows (who/cause disagree): ` + JSON.stringify(amb.slice(0, 3)));
      const person = classified.filter(x => x.kind === 'person');
      const creature = classified.filter(x => x.kind === 'creature');
      assert.ok(person.length > 0, `seed ${seed}: at least one person death classified`);
      assert.ok(creature.length > 0, `seed ${seed}: at least one creature death classified`);
      totalPerson += person.length; totalCreature += creature.length; totalAmb += amb.length;
      console.log(`    seed ${seed}: rows=${rows.length} person=${person.length} creature=${creature.length} ambiguous=0`);
    }
    console.log(`    Arm A totals: person=${totalPerson} creature=${totalCreature} ambiguous=${totalAmb}`);
  });

  await check('Arm A retro-classifier: bucket vocabulary covers every person cause', async () => {
    const creatureSet = AN.creatureIds();
    const dir = path.join(__dirname, '..', 'evidence', '2026-11-09', 'journey-scale-r123');
    const other = {};
    for (const seed of [97901, 97902, 97903, 97904]) {
      const trust = JSON.parse(fs.readFileSync(path.join(dir, `journey-scale-r123-trust-${seed}.json`), 'utf8'));
      for (const r of (trust.census.deathLog || [])) {
        const c = AN.classifyRow({ who: r.who, cause: r.cause, day: r.day }, creatureSet);
        if (c.kind === 'person' && String(c.bucket).indexOf('other:') === 0) other[c.bucket] = (other[c.bucket] || 0) + 1;
      }
    }
    // 'other:' buckets are allowed only when the raw cause is printed
    // in the run note — the test pins the set so a new cause cannot
    // slip in silently. On r123's data the set is EMPTY (every person
    // cause buckets); a failure here names the new cause for pinning.
    console.log('    other-bucket person causes: ' + JSON.stringify(other));
    assert.deepStrictEqual(other, {}, 'new unbucketed person cause(s) — pin them in bucketCause + this test: ' + JSON.stringify(other));
  });

  // (1) LIVE: 40 days on 97904 with the trade-road policy.
  await check('LIVE 97904x40d: instrument installs, 0 errors, one row per day', async () => {
    const { Game } = await loadGame({ seed: 97904, mode: 'journey-scale-r125-proof' });
    await setupGame(Game);
    const dc = DC.install(Game);
    const policy = Object.create(LR.sitPolicy);
    policy.id = 'journey-scale-r125-proof';
    policy._ctx = null;
    const baseDaily = LR.sitPolicy.daily.bind(LR.sitPolicy);
    const baseSetup = LR.sitPolicy.setup ? LR.sitPolicy.setup.bind(LR.sitPolicy) : null;
    policy.setup = function (G, ctx) { if (baseSetup) baseSetup(G, ctx); policy._ctx = ctx; };
    policy.daily = function (G, ctx) { baseDaily(G, ctx); try { dc.snapshot(ctx); } catch (e) { dc.t.errors.push({ day: 0, where: 'proof:snapshot', err: String(e && e.message) }); } };
    const result = await runDays(Game, policy, { days: 40, manifest: { seed: 97904, mode: 'journey-scale-r125-proof', date: new Date().toISOString().slice(0, 10), node: process.version } });
    const fin = dc.finalize();
    dc.uninstall();
    assert.strictEqual(fin.errors.length, 0, 'instrument errors: ' + JSON.stringify(fin.errors.slice(0, 3)));
    assert.strictEqual(fin.daily.length, result.days, `one daily row per policy day: rows=${fin.daily.length} days=${result.days}`);
    for (const row of fin.daily) {
      assert.ok(row.day != null && row.alive != null && row.rosterLen != null, 'context row complete: ' + JSON.stringify(row));
      assert.ok(row.pantryKcal != null, 'pantry read present: ' + JSON.stringify(row));
    }
    console.log(`    days=${result.days} endReason=${result.endReason} dailyRows=${fin.daily.length} deaths=${fin.summary.deaths} teleDeaths=${fin.summary.teleDeaths}`);
    global.__proofFin = fin;
    global.__proofGame = Game;
  });

  await check('LIVE 97904x40d: every death attributed, books close', async () => {
    const fin = global.__proofFin;
    assert.ok(fin, 'live run above must have produced a finalize');
    assert.strictEqual(fin.summary.unattributed, 0, 'deaths with no cause: ' + JSON.stringify(fin.deaths.filter(d => !d.cause).slice(0, 3)));
    assert.strictEqual(fin.summary.deaths, fin.summary.telePerson,
      `fallen deaths (${fin.summary.deaths}) == telemetry person deaths (${fin.summary.telePerson})`);
    assert.strictEqual(fin.summary.booksClose, true,
      `books close: initial=${fin.summary.initialRosterLen} joins=${fin.summary.joins} final=${fin.summary.finalRosterLen} deaths=${fin.summary.deaths} leavers=${fin.summary.leavers}`);
    assert.strictEqual(fin.summary.leavers, fin.leavers.length, 'leavers counted');
    for (const d of fin.deaths) {
      assert.ok(d.day != null && d.cause, 'death row has day + cause: ' + JSON.stringify(d));
    }
    console.log(`    deaths=${fin.summary.deaths} byCause=${JSON.stringify(fin.summary.byCause)} joins=${fin.summary.joins} leavers=${fin.summary.leavers} multiDeathDays=${JSON.stringify(fin.summary.multiDeathDays)}`);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error('PROOF ERROR:', e && e.stack || e); process.exit(2); });
