// test-retribution-b.js — proof test for sim-retribution-b (finding:
// RETRIBUTION NARRATED AFTER ITS KILL, filed by sim-strikefall-a).
// Proves the COUNTING instrument (regexes, unleash->falls->summary judge)
// plus the game-level RED/GREEN: on pre-fix code a killing retribution
// unleash narrates "X falls." BEFORE the "RETRIBUTION: N damage erupts
// outward — K enemies caught in it." summary line (G1 FAILS); on fixed
// code the summary line comes first and the falls lines follow (G1
// PASSES), with damage, kill count and the 25% self-hit unchanged.
// The fixture stages the build-around engine with stored damage, per
// the finding: grant the retribution ability, stage stored damage on
// scholar.buildaround, start a hushwolf pack fight, put the wolves
// adjacent, and press the real path Game.useAbility('retribution',
// 'unleash').
// Run: node scripts/test-retribution-b.js [--game]  (exit 0 = all green)
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const D = require(path.join(REPO, 'scripts', 'retribution-check-driver-20261113'));
const A = require(path.join(REPO, 'scripts', 'retribution-check-analyze-20261113'));

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// §1 — the regexes match the exact finding lines.
t('unleash-re matches BA.unleash self-hit line', D.RETRIB_UNLEASH_RE.test('RETRIBUTION: 40 erupts outward — and 10 stays with you. Pain has to go somewhere.'));
t('unleash-re matches BA.unleash no-self-hit line', D.RETRIB_UNLEASH_RE.test('RETRIBUTION: 40 erupts outward!'));
t('summary-re matches the shockwave summary line', D.RETRIB_SUMMARY_RE.test('RETRIBUTION: 40 damage erupts outward — 2 enemies caught in it.'));
t('summary-re matches the singular summary line', D.RETRIB_SUMMARY_RE.test('RETRIBUTION: 40 damage erupts outward — 1 enemy caught in it.'));
t('summary-re does NOT match the BA.unleash line (different emit site)', !D.RETRIB_SUMMARY_RE.test('RETRIBUTION: 40 erupts outward — and 10 stays with you. Pain has to go somewhere.'));
t('unleash-re does NOT match the summary line', !D.RETRIB_UNLEASH_RE.test('RETRIBUTION: 40 damage erupts outward — 2 enemies caught in it.'));
t('stored-re matches the battery announcement', D.RETRIB_STORED_RE.test('RETRIBUTION: 40 stored. Unleash it. (active ability)'));
t('noadj-re matches the empty shockwave line', D.RETRIB_NOADJ_RE.test('The shockwave finds no one adjacent — the stored fury dissipates into the air.'));
t('falls-re matches a monster falls line', D.FALLS_RE.test('The Hushwolf falls.'));

// §2 — the judge on synthetic corpora: a falls line strictly between an
// unleash line and the following summary line (same fight) is one
// inversion; a falls line AFTER the summary is correct order.
function synthCorpus(entries) {
  // entries: [{seq, kind: 'unleash'|'summary'|'falls', day, fight, line}]
  const d = {
    seed: 1, days: 10, endReason: 'x', won: false, maxWave: 1, standing: 0, scaleRank: 'village',
    fallsCount: 0, retribSummaryCount: 0, retribUnleashCount: 0, retribStoredCount: 0, retribNoAdjCount: 0,
    freezelineCount: 0, applyCount: 0, bellowCount: 0, sayCount: 20, instrumentErrors: [],
    fallsLines: [], retribSummaryLines: [], retribUnleashLines: [], retribStoredLines: [], retribNoAdjLines: [],
    freezelineLines: [], applyLines: [], bellowLines: [],
  };
  for (const e of entries) {
    const rec = { seq: e.seq, day: e.day || 10, fight: e.fight != null ? e.fight : 1, line: e.line, fighters: null };
    if (e.kind === 'falls') { rec.person = false; d.fallsLines.push(rec); d.fallsCount++; }
    if (e.kind === 'summary') { d.retribSummaryLines.push(rec); d.retribSummaryCount++; }
    if (e.kind === 'unleash') { d.retribUnleashLines.push(rec); d.retribUnleashCount++; }
  }
  return d;
}
const UNLEASH = 'RETRIBUTION: 40 erupts outward — and 10 stays with you. Pain has to go somewhere.';
const SUMMARY = 'RETRIBUTION: 40 damage erupts outward — 2 enemies caught in it.';
const FALLS1 = 'The Hushwolf falls.';
const FALLS2 = 'The Hushwolf falls.';
t('judge: unleash@5 falls@6 falls@7 summary@8 counts 2 inversions',
  A.judgeOne(1, synthCorpus([
    { seq: 5, kind: 'unleash', line: UNLEASH },
    { seq: 6, kind: 'falls', line: FALLS1 },
    { seq: 7, kind: 'falls', line: FALLS2 },
    { seq: 8, kind: 'summary', line: SUMMARY },
  ])).inversions === 2);
t('judge: unleash@5 summary@6 falls@7 counts 0 (correct order)',
  A.judgeOne(1, synthCorpus([
    { seq: 5, kind: 'unleash', line: UNLEASH },
    { seq: 6, kind: 'summary', line: SUMMARY },
    { seq: 7, kind: 'falls', line: FALLS1 },
  ])).inversions === 0);
t('judge: falls before the unleash line counts 0',
  A.judgeOne(1, synthCorpus([
    { seq: 4, kind: 'falls', line: FALLS1 },
    { seq: 5, kind: 'unleash', line: UNLEASH },
    { seq: 6, kind: 'summary', line: SUMMARY },
  ])).inversions === 0);
t('judge: falls in a different fight than the summary counts 0',
  A.judgeOne(1, synthCorpus([
    { seq: 5, kind: 'unleash', line: UNLEASH, fight: 1 },
    { seq: 6, kind: 'falls', line: FALLS1, fight: 2 },
    { seq: 7, kind: 'summary', line: SUMMARY, fight: 1 },
  ])).inversions === 0);
t('judge: no unleash line — adjacent falls run directly before the summary counts (fallback)',
  (function () {
    const j = A.judgeOne(1, synthCorpus([
      { seq: 6, kind: 'falls', line: FALLS1 },
      { seq: 7, kind: 'falls', line: FALLS2 },
      { seq: 8, kind: 'summary', line: SUMMARY },
    ]));
    return j.inversions === 2 && j.inversionsFallback === 2;
  })());
t('judge: person falls (☠) never counts as an inversion',
  A.judgeOne(1, (function () {
    const c = synthCorpus([
      { seq: 5, kind: 'unleash', line: UNLEASH },
      { seq: 6, kind: 'falls', line: '☠ Ava falls.' },
      { seq: 7, kind: 'summary', line: SUMMARY },
    ]);
    c.fallsLines[0].person = true;
    return c;
  }())).inversions === 0);

// §3 — the prereg exists and pins the driver to an explicit anchor.
t('prereg file exists', fs.existsSync(path.join(REPO, 'evidence', '2026-11-13', 'sim-retribution-b-prereg.md')));
let prereg = '';
try { prereg = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-13', 'sim-retribution-b-prereg.md'), 'utf8'); } catch (e) {}
t('prereg states the GO bar (0 retribution-kill inversions after the fix)', prereg.indexOf('(a) RETRIBUTION-KILL INVERSIONS 0') !== -1);
let drv = '';
try { drv = fs.readFileSync(path.join(REPO, 'scripts', 'retribution-check-driver-20261113.js'), 'utf8'); } catch (e) {}
t('driver refuses to run without EXPECTED_ANCHOR', drv.indexOf('EXPECTED_ANCHOR required') !== -1);

console.log('test-retribution-b: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);

// §4+ — GAME-LEVEL RED/GREEN (runs only with --game).
async function gameLevel() {
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  const K = require('./godpath/lib');
  let gpass = 0, gfail = 0;
  function gok(name, cond, extra) {
    if (cond) { gpass++; console.log('PASS(game) ' + name); }
    else { gfail++; console.log('FAIL(game) ' + name + (extra ? ' — ' + extra : '')); }
  }
  const idx = function (lines, re) {
    for (let i = 0; i < lines.length; i++) if (re.test(lines[i])) return i;
    return -1;
  };

  async function newGame(seed) {
    const { Game } = await loadGame({ seed: seed, mode: 'retribution-proof' });
    await setupGame(Game);
    return Game;
  }

  // Stage the build-around engine with stored damage: grant the ability,
  // charge the battery, top up kcal for the 30-kcal cost, start a
  // hushwolf pack fight (3 wolves), put the wolves adjacent to the
  // player, and set HP per leg. The lead stays alive in the kill legs:
  // killing the lead routs the pack (wolf-lead melt, 60% per wolf), which
  // would make the kill count nondeterministic — the lead is not part of
  // what this fix proves.
  function stage(Game, stored) {
    K.giveAbility(Game, 'retribution');
    const s = Game.state.scholar;
    s.buildaround = s.buildaround || {};
    s.buildaround.retribution = stored;
    s.kcal = 500;
    s.health = 100;
  }
  function packFight(Game) {
    const mf = K.fight(Game, 'hushwolf', { mx: 3, my: 4 }); // player (2,4); monster adjacent
    // Solo scouts get a duel (partyTactics tbPackSpawnCount: solo hushwolf
    // spawns 1), but the fixture needs a pack. Clone the engine-built
    // fighter twice: a shallow copy with a fresh key is a faithful second
    // fighter (tbFighter looks fighters up by key; the retribution loop
    // iterates f.fighters directly). Clones are not the lead (wolfLead is
    // only set on wolves[0]) and never take turns (absent from f.order) —
    // they are damageable targets, which is all this fixture needs.
    const f = Game.tbfight;
    const first = (f.fighters || []).find(function (x) { return x.kind === 'monster'; });
    for (let i = 1; i <= 2; i++) {
      // Clones are NOT the lead: the lead flag is only set on wolves[0]
      // (game.js ~35765), and killing the lead routs the pack — the
      // fixture's kills must be non-lead wolves. Clones also get distinct
      // names: the falls line is once-per-exact-text-per-fight
      // (COMBATDEDUP), so two identical wolves would announce only once
      // and the two-kill leg could not count two falls lines.
      const c = Object.assign({}, first, { key: 'm_' + i, wolfLead: false, name: first.name + ' (' + (i + 1) + ')' });
      f.fighters.push(c);
    }
    const wolves = (f.fighters || []).filter(function (x) { return x.kind === 'monster'; });
    const spots = [[3, 4], [2, 3], [2, 5]];
    wolves.forEach(function (w, i) { w.mx = spots[i][0]; w.my = spots[i][1]; });
    return { lead: wolves.find(function (w) { return w.wolfLead; }) || wolves[0], others: wolves.filter(function (w) { return !w.wolfLead; }), all: wolves, first: mf };
  }

  // G1: one killing unleash — the summary line must precede the falls line.
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    stage(Game, 40);
    const pk = packFight(Game);
    gok('G1 fight started with 3 wolves', !!Game.tbfight && pk.all.length === 3, 'wolves=' + pk.all.length);
    pk.lead.hp = 500; pk.lead.maxHp = 500;
    pk.others[0].hp = 1; pk.others[0].maxHp = 50;
    pk.others[1].hp = 500; pk.others[1].maxHp = 500;
    let ok = false;
    await quietLog(async () => { ok = Game.useAbility('retribution', 'unleash'); });
    const si = idx(lines, D.RETRIB_SUMMARY_RE);
    const fi = idx(lines, / falls\.$/);
    gok('G1 unleash fired', !!ok, 'useAbility returned ' + ok);
    gok('G1 one wolf died from the shockwave', !pk.others[0].alive, 'alive=' + pk.others[0].alive + ' hp=' + pk.others[0].hp);
    gok('G1 lead + second wolf survived', pk.lead.alive && pk.others[1].alive, 'lead alive=' + pk.lead.alive + ' other alive=' + pk.others[1].alive);
    gok('G1 summary line present', si !== -1, 'lines=' + JSON.stringify(lines.slice(-8)));
    gok('G1 falls line present (the kill is still announced)', fi !== -1, 'lines=' + JSON.stringify(lines.slice(-8)));
    gok('G1 summary line precedes falls line', si !== -1 && fi !== -1 && si < fi, 'summary@' + si + ' falls@' + fi);
    lines.restore();
  }

  // G2: two kills in one shockwave — BOTH falls lines follow the summary.
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    stage(Game, 40);
    const pk = packFight(Game);
    gok('G2 fight started with 3 wolves', !!Game.tbfight && pk.all.length === 3, 'wolves=' + pk.all.length);
    pk.lead.hp = 500; pk.lead.maxHp = 500;
    pk.others[0].hp = 1; pk.others[0].maxHp = 50;
    pk.others[1].hp = 1; pk.others[1].maxHp = 50;
    let ok = false;
    await quietLog(async () => { ok = Game.useAbility('retribution', 'unleash'); });
    const si = idx(lines, D.RETRIB_SUMMARY_RE);
    const fallsIdx = [];
    lines.forEach(function (l, i) { if (/ falls\.$/.test(l)) fallsIdx.push(i); });
    gok('G2 unleash fired', !!ok, 'useAbility returned ' + ok);
    gok('G2 both non-lead wolves died', !pk.others[0].alive && !pk.others[1].alive, 'alive=' + pk.others.map(function (w) { return w.alive; }).join(','));
    gok('G2 summary says 3 enemies hit', /3 enemies caught in it/.test(lines[si] || ''), 'summary=' + JSON.stringify(lines[si]));
    gok('G2 two falls lines', fallsIdx.length === 2, 'falls@' + fallsIdx.join(','));
    gok('G2 summary precedes BOTH falls lines', si !== -1 && fallsIdx.length === 2 && fallsIdx.every(function (f) { return si < f; }), 'summary@' + si + ' falls@' + fallsIdx.join(','));
    lines.restore();
  }

  // G3: non-killing unleash — summary present, no falls line, unchanged.
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    stage(Game, 40);
    const pk = packFight(Game);
    gok('G3 fight started with 3 wolves', !!Game.tbfight && pk.all.length === 3, 'wolves=' + pk.all.length);
    pk.all.forEach(function (w) { w.hp = 500; w.maxHp = 500; });
    let ok = false;
    await quietLog(async () => { ok = Game.useAbility('retribution', 'unleash'); });
    const si = idx(lines, D.RETRIB_SUMMARY_RE);
    const fi = idx(lines, / falls\.$/);
    gok('G3 unleash fired', !!ok, 'useAbility returned ' + ok);
    gok('G3 all wolves survived', pk.all.every(function (w) { return w.alive; }), 'alive=' + pk.all.map(function (w) { return w.alive; }).join(','));
    gok('G3 summary line present', si !== -1, 'lines=' + JSON.stringify(lines.slice(-8)));
    gok('G3 no falls line', fi === -1, 'falls@' + fi);
    lines.restore();
  }

  // G4: no adjacent enemy — the precheck refuses before anything is
  // spent: the battery stays charged, no summary, no falls.
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    stage(Game, 40);
    const mf = K.fight(Game, 'hushwolf', { mx: 6, my: 4 }); // far: no one adjacent
    gok('G4 fight started', !!Game.tbfight && !!mf, 'no fight/monster');
    let ok = true;
    await quietLog(async () => { ok = Game.useAbility('retribution', 'unleash'); });
    const si = idx(lines, D.RETRIB_SUMMARY_RE);
    gok('G4 unleash refused (no one adjacent)', ok === false, 'useAbility returned ' + ok);
    gok('G4 battery untouched', Game.state.scholar.buildaround.retribution === 40, 'stored=' + Game.state.scholar.buildaround.retribution);
    gok('G4 no summary line', si === -1, 'summary@' + si);
    lines.restore();
  }

  // G5: mechanics pinned — the summary states the stored number and the
  // hit count; the unleash line states the 25% self-hit (40 stored ->
  // 10 stays). Damage, kills and counts are identical to pre-fix.
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    stage(Game, 40);
    const pk = packFight(Game);
    pk.lead.hp = 500; pk.lead.maxHp = 500;
    pk.others[0].hp = 1; pk.others[0].maxHp = 50;
    pk.others[1].hp = 500; pk.others[1].maxHp = 500;
    let ok = false;
    await quietLog(async () => { ok = Game.useAbility('retribution', 'unleash'); });
    const si = idx(lines, D.RETRIB_SUMMARY_RE);
    const ui = idx(lines, D.RETRIB_UNLEASH_RE);
    gok('G5 unleash fired', !!ok, 'useAbility returned ' + ok);
    gok('G5 summary states 40 damage, 3 enemies hit', /40 damage erupts outward \u2014 3 enemies caught in it/.test(lines[si] || ''), 'summary=' + JSON.stringify(lines[si]));
    gok('G5 unleash line states the 25% self-hit (10 stays)', /and 10 stays with you/.test(lines[ui] || ''), 'unleash=' + JSON.stringify(lines[ui]));
    gok('G5 battery emptied by the unleash', (Game.state.scholar.buildaround.retribution || 0) === 0, 'stored=' + Game.state.scholar.buildaround.retribution);
    lines.restore();
  }

  // G6: a second unleash with an empty battery is refused — the battery
  // drains exactly once, and the refusal spends nothing.
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    stage(Game, 40);
    const pk = packFight(Game);
    pk.all.forEach(function (w) { w.hp = 500; w.maxHp = 500; });
    let ok1 = false, ok2 = true;
    await quietLog(async () => { ok1 = Game.useAbility('retribution', 'unleash'); });
    const summariesBefore = lines.filter(function (l) { return D.RETRIB_SUMMARY_RE.test(l); }).length;
    await quietLog(async () => { ok2 = Game.useAbility('retribution', 'unleash'); });
    const summariesAfter = lines.filter(function (l) { return D.RETRIB_SUMMARY_RE.test(l); }).length;
    gok('G6 first unleash fired', !!ok1, 'useAbility returned ' + ok1);
    gok('G6 second unleash refused (battery empty)', ok2 === false, 'useAbility returned ' + ok2);
    gok('G6 no second summary line', summariesAfter === summariesBefore && summariesBefore === 1, 'before=' + summariesBefore + ' after=' + summariesAfter);
    lines.restore();
  }

  console.log('test-retribution-b(game): ' + gpass + ' passed, ' + gfail + ' failed');
  return gfail;
}

if (process.argv.indexOf('--game') !== -1) {
  gameLevel().then(function (gf) { process.exit(gf ? 1 : 0); }).catch(function (e) { console.error(e.stack); process.exit(1); });
} else {
  process.exit(0);
}
