// test-mournblooded-b.js — proof for sim-mournblooded-b (backlog #472).
// The hold beat names the veteran bind honestly but, when a blooded veteran
// died between snapshots, fell back from "(1 of 2 veterans)" to "(0 of 2
// veterans)" with no fiction for the loss (sim-vetcompose sense #2/#3).
// The fix: _standingMournFallen diffs the living-veteran set across
// hold-beat firings and voices one short eulogy line — in the hold beat's
// own 📡 voice — for each veteran lost WITH positive evidence of death.
// Fixture band (one loadGame, seed 99107, constructed state mirroring the
// vetcompose villages: wave 4 already released, standing capped 250 >= t5
// 200, one wave-4 killer): T1 establish, T2 death-day, T3 rise, T4
// no-change, T5 exile (roster move), T6 succession, T7 pre-arrival
// fallback (a second death-day transition, beast unnameable). GO = the
// eulogy fires on every death-day transition (2/2) and on no other
// transition (0 false).
// Usage: node scripts/test-mournblooded-b.js
'use strict';
const path = require('path');
const assert = require('assert');

let pass = 0;
function ok(name) { pass++; console.log('ok ' + pass + ' - ' + name); }

(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const sysLines = [];
  const sayLines = [];
  const { Game } = await loadGame({ seed: 99107, mode: 'mournblooded-proof', fullTelemetry: false });
  // Capture narration AFTER loadGame (the harness silences it); both
  // voices feed the transcript the sense-check reads.
  Game.say = function (t) { sayLines.push(String(t)); };
  Game.sysSay = function (t) { sysLines.push(String(t)); };
  await setupGame(Game);

  const day = () => ((Game.state.scholar || {}).day || 0);
  const setDay = (d) => { Game.state.scholar.day = d; };
  // step(fn): run fn, return the sysSay/say lines it produced. The hold
  // beat can fire from villageStandingTotal() OR from inside
  // recordWaveKill's unlock check — collecting per step covers either.
  const step = (fn) => {
    const s0 = sysLines.length, y0 = sayLines.length;
    fn();
    return { sys: sysLines.slice(s0), say: sayLines.slice(y0) };
  };
  const holdLines = (lines) => lines.filter((l) => l.includes('fifth draft') || l.includes('next act'));
  const eulogyLines = (lines) => lines.filter((l) => l.includes('Remember the name'));
  const vets = () => Game.waveCombatReadiness(5).veterans;
  const vetIds = () => Game.livingVeteranIds(5);
  const pinCount = (where) => {
    assert.strictEqual(vetIds().length, vets(), where + ': livingVeteranIds size == waveCombatReadiness count');
  };

  const roster = () => ((Game.state.village || {}).roster || []).slice();
  const scholar = Game.villagerId;
  const m4s = (Game.data.monsters || []).filter((m) => m && (m.wave || 1) === 4);
  const m3s = (Game.data.monsters || []).filter((m) => m && (m.wave || 1) === 3);
  assert.ok(m4s.length >= 1, 'a wave-4 monster def must exist');
  assert.ok(m3s.length >= 2, 'two wave-3 monster defs must exist for war staging');
  const mX = m4s[0].id;   // the beast VidA bloods (and the eulogy names)
  const mZ = m3s[0].id, mW = m3s[1].id; // war-staging filler (wave-3: no wave-5 veteran)
  const others = roster().filter((id) => id && id !== scholar);
  assert.ok(others.length >= 4, 'roster needs 4+ non-scholar villagers for the band');
  const vidA = others[0], vidB = others[1], vidC = others[2], vidD = others[3];

  // ---- staging: wave 4 already released, standing capped >= t5 ----
  // War: VidA kills mX x2 (2 ledger pts) + VidC kills mZ x2 + mW x2 (4 pts)
  // = 6 pts x 25 = 150. Plenty: 6 feastLog entries x 20 = 120, capped at
  // 100 toward t5. Capped total 250 >= t5 200. Only VidA is a wave-5
  // veteran (wave-4+ kill); VidC's wave-3 kills make a wave-4 veteran only.
  Game.recordWaveKill(mX, vidA, 'wild', 'mourn-a1');
  Game.recordWaveKill(mX, vidA, 'wild', 'mourn-a2');
  Game.recordWaveKill(mZ, vidC, 'wild', 'mourn-c1');
  Game.recordWaveKill(mZ, vidC, 'wild', 'mourn-c2');
  Game.recordWaveKill(mW, vidC, 'wild', 'mourn-c3');
  Game.recordWaveKill(mW, vidC, 'wild', 'mourn-c4');
  Game.state.feastLog = [];
  for (let i = 0; i < 6; i++) Game.state.feastLog.push({ quality: 1, day: 1 });
  Game.state._standingPeakWave = 4; // wave 4 already released (vetcompose state)
  // The System arrived long before a wave-5 hold can bite (arrival ~day 7,
  // holds need day 25+ standing): stage systemArrived so monsterNoun /
  // displayName behave as real play does at this stage (true names, not
  // "something" / stranger-descriptors). T7 re-clears it to prove the
  // pre-arrival fallback line.
  Game.state.systemArrived = true;
  // Clean band start: staging may have fired defer4 beats; key 5 is fresh.
  Game.state._standingDeferBeat = {};
  delete Game.state._standingVeteranSet;
  const st = Game.villageStanding();
  const capped = Game.standingPlentyCappedTotal();
  assert.ok(capped >= 200, 'staging must reach t5: capped=' + capped + ' raw=' + st.total + ' war=' + st.war + ' plenty=' + st.plenty);
  assert.strictEqual(vets(), 1, 'staging: exactly 1 living wave-5 veteran (VidA)');
  assert.deepStrictEqual(vetIds(), [vidA], 'staging: the veteran set is [VidA]');
  pinCount('staging');
  const d0 = day();
  ok('staging: peak 4, capped ' + capped + ' >= t5 200, veterans 1 of 2 (VidA)');

  // ---- T1: establish — first defer5 firing names the bind, no eulogy ----
  const t1 = step(() => { setDay(d0 + 7); Game.villageStandingTotal(); });
  assert.ok(holdLines(t1.sys).some((l) => l.includes('(1 of 2 veterans)')), 'T1 hold beat reads (1 of 2 veterans): ' + JSON.stringify(holdLines(t1.sys)));
  assert.strictEqual(eulogyLines(t1.sys).length, 0, 'T1: no eulogy on the first firing (no prior snapshot)');
  assert.deepStrictEqual((Game.state._standingVeteranSet[5] || {}).vids, [vidA], 'T1: snapshot stores [VidA]');
  pinCount('T1');
  ok('T1 establish: "(1 of 2 veterans)", no eulogy');

  // ---- T2: DEATH-DAY — VidA dies through the real hurtVillager pipeline ----
  const t2 = step(() => {
    setDay(d0 + 14);
    // Lethal hurt, retried: worn avoidance / a death refusal could in
    // principle blunt one hit; the pipeline either kills or it does not,
    // and the asserts below fail loudly either way.
    for (let i = 0; i < 5 && roster().includes(vidA); i++) {
      Game.hurtVillager(vidA, 999, 'monster', null, { monsterId: mX, monsterName: mX });
    }
    assert.ok(!roster().includes(vidA), 'T2: VidA left the roster (died)');
    assert.ok((Game.state.village.deathSeen || {})[vidA] != null, 'T2: deathSeen records VidA');
    assert.ok((Game.state.village.fallen || []).some((f) => f && f.villagerId === vidA), 'T2: fallen roll records VidA');
    assert.strictEqual(vets(), 0, 'T2: veterans 0 after the death');
    Game.villageStandingTotal();
  });
  assert.ok(holdLines(t2.sys).some((l) => l.includes('(0 of 2 veterans)')), 'T2 hold beat reads (0 of 2 veterans): ' + JSON.stringify(holdLines(t2.sys)));
  const eu2 = eulogyLines(t2.sys);
  assert.strictEqual(eu2.length, 1, 'T2: exactly one eulogy line: ' + JSON.stringify(eu2));
  const nameA = Game.npcName(vidA);
  const firstA = String(nameA).split(' ')[0];
  assert.ok(eu2[0].includes(firstA), 'T2: eulogy names VidA by true name (' + nameA + '): ' + eu2[0]);
  assert.ok(!/A (man|woman|person),/.test(eu2[0]), 'T2: no stranger-descriptor in the eulogy: ' + eu2[0]);
  assert.ok(!eu2[0].includes('something'), 'T2: the beast is named, never "something": ' + eu2[0]);
  assert.ok(eu2[0].includes('blooded'), 'T2: eulogy says blooded: ' + eu2[0]);
  assert.ok(!eu2[0].includes('was blooded'), 'T2: the beast is named (no fallback line): ' + eu2[0]);
  const beastPhrase = Game.articlePhrase(Game.monsterNoun(mX), false);
  assert.ok(eu2[0].includes(beastPhrase), 'T2: eulogy names the beast (' + beastPhrase + '): ' + eu2[0]);
  assert.deepStrictEqual((Game.state._standingVeteranSet[5] || {}).vids, [], 'T2: snapshot advanced to [] (no double-mourn)');
  pinCount('T2');
  ok('T2 death-day: "(0 of 2 veterans)" + eulogy "' + eu2[0] + '"');

  // ---- T3: rise — VidB bloods a wave-4 kill, count rises, no eulogy ----
  const t3 = step(() => {
    setDay(d0 + 21);
    Game.recordWaveKill(mX, vidB, 'wild', 'mourn-b1');
    assert.strictEqual(vets(), 1, 'T3: veterans back to 1');
    Game.villageStandingTotal();
  });
  assert.ok(holdLines(t3.sys).some((l) => l.includes('(1 of 2 veterans)')), 'T3 hold beat reads (1 of 2 veterans)');
  assert.strictEqual(eulogyLines(t3.sys).length, 0, 'T3: no eulogy on a rise (nobody died)');
  pinCount('T3');
  ok('T3 rise: "(1 of 2 veterans)", no eulogy');

  // ---- T4: no-change — same count, no eulogy ----
  const t4 = step(() => { setDay(d0 + 28); Game.villageStandingTotal(); });
  assert.ok(holdLines(t4.sys).some((l) => l.includes('(1 of 2 veterans)')), 'T4 hold beat reads (1 of 2 veterans)');
  assert.strictEqual(eulogyLines(t4.sys).length, 0, 'T4: no eulogy when nothing changed');
  pinCount('T4');
  ok('T4 no-change: "(1 of 2 veterans)", no eulogy');

  // ---- T5: roster move — VidB exiled (alive), count drops, NO eulogy ----
  const t5 = step(() => {
    setDay(d0 + 35);
    Game.removeVillager(vidB, 'exiled');
    assert.ok(!roster().includes(vidB), 'T5: VidB left the roster (exiled)');
    assert.ok((Game.state.village.deathSeen || {})[vidB] == null, 'T5: no deathSeen for an exile');
    assert.ok(!(Game.state.village.fallen || []).some((f) => f && f.villagerId === vidB), 'T5: no fallen entry for an exile');
    assert.strictEqual(vets(), 0, 'T5: veterans 0 after the exile');
    Game.villageStandingTotal();
  });
  assert.ok(holdLines(t5.sys).some((l) => l.includes('(0 of 2 veterans)')), 'T5 hold beat reads (0 of 2 veterans)');
  assert.strictEqual(eulogyLines(t5.sys).length, 0, 'T5: NO eulogy for a roster move (exile is not death)');
  pinCount('T5');
  ok('T5 exile: "(0 of 2 veterans)", no eulogy');

  // ---- T6: succession — the scholar is a counted veteran, then dies ----
  // T6a: the scholar bloods a wave-4 kill (counts: isLiving(scholar) is true).
  const t6a = step(() => {
    setDay(d0 + 42);
    Game.recordWaveKill(mX, scholar, 'player', 'mourn-scholar');
    assert.strictEqual(vets(), 1, 'T6a: scholar counts as the 1 veteran');
    assert.deepStrictEqual(vetIds(), [scholar], 'T6a: veteran set is [scholar]');
    Game.villageStandingTotal();
  });
  assert.ok(holdLines(t6a.sys).some((l) => l.includes('(1 of 2 veterans)')), 'T6a hold beat reads (1 of 2 veterans)');
  assert.strictEqual(eulogyLines(t6a.sys).length, 0, 'T6a: no eulogy on the scholar joining the count');
  pinCount('T6a');
  ok('T6a scholar blooded: "(1 of 2 veterans)", no eulogy');
  // T6b: the scholar dies (real registerDeath + roster removal, as
  // playerDeath does) and the mantle passes to a new bearer. The count
  // drops — but succession is not a hold-beat eulogy.
  const oldName = Game.displayName(scholar);
  const oldFirst = String(oldName).split(' ')[0];
  const t6b = step(() => {
    setDay(d0 + 49);
    Game.registerDeath({ kind: 'villager', villagerId: scholar, name: oldName, cause: 'the wild', killerId: null, player: true });
    Game.removeVillager(scholar, 'killed');
    const successor = roster().find((id) => id && id !== scholar && id !== vidD);
    assert.ok(successor, 'T6b: a successor exists on the roster');
    Game.villagerId = successor;
    Game.state.scholar.villagerId = successor;
    assert.strictEqual(vets(), 0, 'T6b: veterans 0 after succession');
    Game.villageStandingTotal();
  });
  assert.ok(holdLines(t6b.sys).some((l) => l.includes('(0 of 2 veterans)')), 'T6b hold beat reads (0 of 2 veterans)');
  assert.strictEqual(eulogyLines(t6b.sys).length, 0, 'T6b: NO eulogy for the old scholar (succession, not a mournable loss)');
  assert.ok(!t6b.sys.some((l) => l.includes(oldFirst) && l.includes('Remember the name')), 'T6b: old scholar name never eulogized');
  pinCount('T6b');
  ok('T6b succession: "(0 of 2 veterans)", no eulogy for ' + oldName);

  // ---- T7: pre-arrival fallback — beast unnameable, name still lands ----
  // The System has NOT arrived: monsterNoun returns 'something' for the
  // unidentified beast. The eulogy must take the generic line (never
  // "blooded the something") while still naming the fallen by true name.
  const t7a = step(() => {
    setDay(d0 + 56);
    Game.state.systemArrived = false;
    Game.recordWaveKill(mX, vidD, 'wild', 'mourn-d7');
    assert.strictEqual(vets(), 1, 'T7a: VidD counts as the 1 veteran');
    Game.villageStandingTotal();
  });
  assert.ok(holdLines(t7a.sys).some((l) => l.includes('(1 of 2 veterans)')), 'T7a hold beat reads (1 of 2 veterans)');
  assert.strictEqual(eulogyLines(t7a.sys).length, 0, 'T7a: no eulogy on the rise');
  pinCount('T7a');
  ok('T7a pre-arrival rise: "(1 of 2 veterans)", no eulogy');
  const t7b = step(() => {
    setDay(d0 + 63);
    for (let i = 0; i < 5 && roster().includes(vidD); i++) {
      Game.hurtVillager(vidD, 999, 'monster', null, { monsterId: mX, monsterName: mX });
    }
    assert.ok(!roster().includes(vidD), 'T7b: VidD left the roster (died)');
    assert.ok((Game.state.village.deathSeen || {})[vidD] != null, 'T7b: deathSeen records VidD');
    assert.strictEqual(vets(), 0, 'T7b: veterans 0 after the death');
    Game.villageStandingTotal();
  });
  assert.ok(holdLines(t7b.sys).some((l) => l.includes('(0 of 2 veterans)')), 'T7b hold beat reads (0 of 2 veterans)');
  const eu7 = eulogyLines(t7b.sys);
  assert.strictEqual(eu7.length, 1, 'T7b: exactly one eulogy line: ' + JSON.stringify(eu7));
  assert.ok(eu7[0].includes(Game.npcName(vidD)), 'T7b: eulogy still names VidD by true name: ' + eu7[0]);
  assert.ok(eu7[0].includes('was blooded'), 'T7b: generic line (beast unnameable): ' + eu7[0]);
  assert.ok(!eu7[0].includes('something'), 'T7b: never "blooded the something": ' + eu7[0]);
  pinCount('T7b');
  ok('T7b pre-arrival death-day: "(0 of 2 veterans)" + eulogy "' + eu7[0] + '"');

  // ---- band verdict ----
  const allEulogies = eulogyLines(sysLines);
  assert.strictEqual(allEulogies.length, 2, 'band: exactly TWO eulogies in the whole fixture band (T2 + T7b): ' + JSON.stringify(allEulogies));
  // The count line itself is unchanged by the fix: same numbers on
  // identical staging (the fix voices deaths, it never moves a number).
  const counts = sysLines.filter((l) => l.includes('of 2 veterans')).map((l) => l.match(/\((\d) of 2 veterans\)/)[1]);
  assert.deepStrictEqual(counts, ['1', '0', '1', '1', '0', '1', '0', '1', '0'], 'band: hold-beat count sequence 1,0,1,1,0,1,0,1,0: ' + JSON.stringify(counts));
  console.log('PASS ' + pass + '/' + pass);
  console.log('--- band transcript (hold beats + eulogy only) ---');
  sysLines.filter((l) => l.includes('veterans') || l.includes('Remember the name')).forEach((l) => console.log('  ' + l));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
