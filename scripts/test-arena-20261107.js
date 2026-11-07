// test-arena-20261107.js — proof for sim-arena-b (diagnostic arm).
//
// WHAT THE ARENA IS, WHAT "A STRANGER" IS — reproduced live.
//
// Corpus facts (evidence/2026-11-06/perseed-stageally-confirm-b/, anchor
// 2ff11cbf — PRE-fix instrument, see below):
//   - 53004 baseline d87: gen_93bg7ex ("Fritz") died fallen 'the arena'
//     with an unfinished Audit TB fight the same day (alien_tick wave 2
//     WON, audit wave 4 outcome None, scholarDiedInFight False).
//   - 53006 baseline d86: gen_76n8yer ("David") died fallen 'a stranger'
//     with NO fight row at all that day.
// Replay legs on current master (scripts/arena-replay-20261107.js,
// evidence/2026-11-07/perseed-arena-b/): both trajectories diverged
// (53004: 85d vs corpus 105d; 53006: 125d vs 105d), BUT both channels
// reproduced with names attached:
//   - 53006 replay d115: sari_wulandari died 'the arena' in contest
//     GAUNTLET, waves [buffering, sunback, reunion], waveIdx 2 — won
//     wave 1 (7 rounds), won wave 2 (1 round), LOST wave 3 to a THREE-
//     Reunion pack (6 rounds, monster 95.4% HP left).
//   - 53006 replay d29: gen_0djky10 ("Blanca") died 'a stranger' to
//     alienEncounterPid 'vex_marlowe' — fighter ap_vex_marlowe, kind
//     'hostile', alienPid 'vex_marlowe', name 'Stranger'.
// This test reproduces BOTH mechanisms live on current master, with the
// same wave list and the same persona as the replay, and pins the
// recorder shapes:
//   Leg A — Gauntlet chain death: win wave 1, win wave 2, lose wave 3;
//     assert the death cause is 'the arena', the contest id and waveIdx
//     are captured, the 📺 Gauntlet death line is said, and — with the
//     CURRENT (post-tbend-fix) instrument — every bout's row records its
//     outcome (the corpus Audit row's None is the PRE-fix shape: the
//     corpus anchor predates fix 1700ea5fc, whose pre-fix tbEnd wrapper
//     nulled _currentTb unconditionally after the first bout's post-block
//     had run, destroying the chained bout's row pointer).
//   Leg B — stranger fight: Vex Marlowe, pre-reveal; assert the fighter
//     is kind 'hostile' with alienPid, named 'Stranger'; losing records
//     cause 'a stranger' while the stageally instrument records NO tbFight
//     row for it (startAlienCombat builds tbfight directly and never
//     calls Game.startCombat — the corpus's missing row is the mechanism,
//     not a gap in the run).
//   Leg C — tbFightDeathCause taxonomy, unit level: arena-live +
//     monster-only -> 'the arena'; wild monster-only -> 'the wild';
//     hostile+alienPid -> 'a stranger'; empty/unknown -> 'the arena'
//     (the default fallback — an unclassifiable TB loss reads as arena).
//
// DIAG only, zero src/js. Usage: node scripts/test-arena-20261107.js
'use strict';
const K = require('./godpath/lib');
const STAGE = require('./stageally-instrument-20261106');
const CAP = require('./arena-capture-20261107');
const T = K.reporter('test-arena-20261107');

function monsterOf(f) {
  try { return (f.fighters || []).find(function (x) { return x && x.kind === 'monster'; }) || null; } catch (e) { return null; }
}
function midOf(f) {
  const m = monsterOf(f);
  return m ? ((m.mdef && m.mdef.id) || m.monsterId || m.id || null) : null;
}
function pFighter(Game) {
  try { return Game.tbFighter ? Game.tbFighter('p') : null; } catch (e) { return null; }
}

(async function () {
  const Game = await K.load({ seed: 51002, narration: true });
  K.newRun(Game);
  const inst = STAGE.install(Game);
  const cap = CAP.install(Game);
  const t = inst.t;

  // --- Chain detection: tbEnd depth + startCombat calls inside it. ---
  let tbEndDepth = 0, nestedChainStarts = 0;
  const origTbEnd = Game.tbEnd;
  Game.tbEnd = function () {
    tbEndDepth++;
    try { return origTbEnd.apply(this, arguments); }
    finally { tbEndDepth--; }
  };
  const origStart = Game.startCombat;
  Game.startCombat = function () {
    try { if (tbEndDepth > 0) nestedChainStarts++; } catch (e) {}
    return origStart.apply(this, arguments);
  };

  // ================= Leg C — the cause taxonomy, unit level =================
  T.section('leg C: tbFightDeathCause taxonomy (unit level)');
  const savedArc = Game.state.arenaContest || null;
  try { Game.state.arenaContest = null; } catch (e) {}
  const fMonster = { fighters: [{ key: 'm_0', kind: 'monster' }] };
  const fAlien = { fighters: [{ key: 'ap_vex', kind: 'hostile', alienPid: 'vex_marlowe' }] };
  const fMixed = { fighters: [{ key: 'm_0', kind: 'monster' }, { key: 'ap_vex', kind: 'hostile', alienPid: 'vex_marlowe' }] };
  T.ok('wild monster-only loss reads the wild', Game.tbFightDeathCause(fMonster) === 'the wild', 'got=' + Game.tbFightDeathCause(fMonster));
  T.ok('hostile alien fighter reads a stranger', Game.tbFightDeathCause(fAlien) === 'a stranger', 'got=' + Game.tbFightDeathCause(fAlien));
  T.ok('monster + hostile alien reads a stranger', Game.tbFightDeathCause(fMixed) === 'a stranger', 'got=' + Game.tbFightDeathCause(fMixed));
  T.ok('unclassifiable loss falls back to the arena', Game.tbFightDeathCause({ fighters: [] }) === 'the arena', 'got=' + Game.tbFightDeathCause({ fighters: [] }));
  T.ok('betrayal flag reads betrayal', Game.tbFightDeathCause({ betrayal: true, fighters: [] }) === 'betrayal');
  T.ok('table-trial flag reads the table trial', Game.tbFightDeathCause({ tableTrial: true, fighters: [] }) === 'the table trial');
  T.ok('coalition flag reads the coalition arena', Game.tbFightDeathCause({ coalitionArena: true, fighters: [] }) === 'the coalition arena');
  try { Game.state.arenaContest = { contestId: 'gauntlet', waves: ['buffering', 'sunback', 'reunion'], waveIdx: 0 }; } catch (e) {}
  T.ok('arena-live monster-only loss reads the arena', Game.tbFightDeathCause(fMonster) === 'the arena', 'got=' + Game.tbFightDeathCause(fMonster));
  try { Game.state.arenaContest = savedArc; } catch (e) {}

  // ================= Leg A — Gauntlet chain death =================
  T.section('leg A: gauntlet chain death (replay waves: buffering, sunback, reunion)');
  const scholarA = Game.villagerId;
  const chainsBefore = nestedChainStarts;
  const deathsBefore = cap.t.deaths.length;
  const rowsBefore = t.tbFights.length;
  // Arena state, exactly as _contestArena writes it (cf. test-tbend):
  // the replay's Gauntlet waves, same order, same ids. The scholar
  // brings a party (party:true keeps the roster, so nearby villagers
  // join): the replay's wave 3 was THREE Reunions because the Reunion
  // mirrors the party — tactics.packSpawn {mirror:true, max:3} in
  // monsters.json, count = min(3, partyN) via tbPackSpawnCount — and the
  // replay's scholar fought with 3 allies (partyN 4 -> 3 beasts). A solo
  // scholar faces a single Reunion (partyN 1 -> 1); the pack is set at
  // spawn by party size, not summoned mid-fight.
  Game.state.activeContest = { contestId: 'gauntlet' };
  Game.state.arenaContest = { contestId: 'gauntlet', waves: ['buffering', 'sunback', 'reunion'], waveIdx: 0 };
  const mf = K.fight(Game, 'buffering', { px: 5, py: 4, mx: 6, my: 4, hp: 1000, party: true });
  T.ok('buffering bout started', !!Game.tbfight && midOf(Game.tbfight) === 'buffering');
  if (mf) mf.hp = 100; // fast bout; the chain is HP-independent

  function playWave(mid, mode) {
    // Play the live bout until it ends or chains into the next bout.
    // mode 'win': strike until the monster falls. mode 'lose': wait
    // (never strike) until the monster kills. In 'lose' mode the scholar
    // is left at fighting HP for the first ~20 steps so the bout's own
    // mechanics get to run (the Reunion summons its dead mid-fight),
    // then dropped to 1 HP; the death check runs FIRST every step,
    // because tbEnd nulls the fight the moment the killing blow lands.
    let guard = 0;
    while (guard++ < 300) {
      if (cap.t.deaths.length > deathsBefore) return 'died';
      const f = Game.tbfight;
      if (!f || f.over) return 'ended';
      if (midOf(f) !== mid) return 'chained';
      if (mode === 'lose') {
        const monsters = (f.fighters || []).filter(function (x) { return x && x.kind === 'monster'; });
        if (guard > 20 || monsters.length > 1) {
          const p = pFighter(Game);
          if (p && (p.hp || 0) > 1) { try { p.hp = 1; } catch (e) {} }
        }
      }
      if (Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
        if (mode === 'win') Game.tbPlayerStrike('m_0');
        else Game.tbPlayerWait();
        // NODE HARNESS: a spent player turn does NOT auto-advance (no
        // window). Advance explicitly while the SAME bout is still live
        // — never once it has chained, or the new bout's opening player
        // turn is skipped (same pattern as test-tbend-20261106).
        if (Game.tbfight && !Game.tbfight.over && midOf(Game.tbfight) === mid &&
            Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
          try { Game.tbAdvance(); } catch (e) {}
        }
      } else {
        try { Game.tbAdvance(); } catch (e) { return 'stuck'; }
      }
    }
    return 'guard';
  }

  T.ok('wave 1 (buffering) won', playWave('buffering', 'win') === 'chained');
  const sun = monsterOf(Game.tbfight || {});
  if (sun) sun.hp = 100;
  T.ok('wave 2 (sunback) live after chain', !!Game.tbfight && midOf(Game.tbfight) === 'sunback');
  T.ok('wave 2 (sunback) won', playWave('sunback', 'win') === 'chained');
  T.ok('wave 3 (reunion) live after chain', !!Game.tbfight && midOf(Game.tbfight) === 'reunion');
  T.ok('wave 3 (reunion) kills the scholar', playWave('reunion', 'lose') === 'died');
  T.ok('two nested chain starts (one per won bout)', (nestedChainStarts - chainsBefore) === 2, 'nested=' + (nestedChainStarts - chainsBefore));

  const deathA = cap.t.deaths[cap.t.deaths.length - 1];
  T.ok('a death was captured', !!deathA);
  if (deathA) {
    T.ok('death cause is the arena', deathA.causeArg === 'the arena', 'causeArg=' + deathA.causeArg);
    T.ok('death names the gauntlet contest', deathA.activeContestId === 'gauntlet', 'contest=' + deathA.activeContestId);
    T.ok('death was on waveIdx 2 (third wave)', deathA.arenaContest && deathA.arenaContest.waveIdx === 2, 'waveIdx=' + (deathA.arenaContest && deathA.arenaContest.waveIdx));
    T.ok('death was in combat', deathA.inCombat === true);
    // The Reunion mirrors the party (packSpawn {mirror:true, max:3}):
    // with 3 allies in the fight the wave-3 pack is 3 beasts, as in the
    // replay. The death capture reads the fighters live at playerDeath.
    const packAtDeath = (deathA.fighters || []).filter(function (x) { return x && x.kind === 'monster' && x.monsterId === 'reunion'; });
    T.ok('reunion pack is 3 (party mirror, as in the replay)', packAtDeath.length === 3, 'reunions=' + packAtDeath.length);
    const alliesAtDeath = (deathA.fighters || []).filter(function (x) { return x && x.kind === 'villager'; });
    T.ok('party fought beside the scholar (3+ allies, partyN 4+)', alliesAtDeath.length >= 3, 'allies=' + alliesAtDeath.length);
  }
  // The 📺 Gauntlet death line is said by _contestArenaAfter AFTER
  // playerDeath (tbEnd's arena hook runs after the loss branch), so it
  // is NOT in the death capture's 25-line window — it is in the rolling
  // 200-line say tail. Same for the summon line.
  const fullTailA = (cap.t.sayTail || []).map(function (l) { return l.text; }).join('\n');
  T.ok('gauntlet death line was said', /almost cleared the Gauntlet/.test(fullTailA));
  // The Reunion's signature line ("Another face surfaces — ... The dead
  // gather") is its trick firing, not a summon: the pack itself is set
  // at spawn by the party mirror (see above).
  T.ok('reunion faces line was said', /Another face surfaces/.test(fullTailA));
  const newRows = t.tbFights.slice(rowsBefore);
  const rowBuf = newRows.find(function (r) { return r.mid === 'buffering'; });
  const rowSun = newRows.find(function (r) { return r.mid === 'sunback'; });
  const rowReu = newRows.find(function (r) { return r.mid === 'reunion'; });
  T.ok('buffering row records won', !!(rowBuf && rowBuf.outcome === 'won'), 'outcome=' + (rowBuf && rowBuf.outcome));
  T.ok('sunback row records won', !!(rowSun && rowSun.outcome === 'won'), 'outcome=' + (rowSun && rowSun.outcome));
  T.ok('reunion row records lost (fixed instrument — corpus None was pre-fix)', !!(rowReu && rowReu.outcome === 'lost'), 'outcome=' + (rowReu && rowReu.outcome));
  T.ok('reunion row flags scholar death in fight', !!(rowReu && rowReu.scholarDiedInFight === true), 'flag=' + (rowReu && rowReu.scholarDiedInFight));
  T.ok('dead scholar is the leg-A scholar', !!(deathA && deathA.scholarId === scholarA), 'scholarId=' + (deathA && deathA.scholarId));
  T.ok('no instrument errors', (t.instrumentErrors || []).length === 0, JSON.stringify(t.instrumentErrors || []));
  try { Game.state.arenaContest = null; } catch (e) {}
  try { Game.state.activeContest = null; } catch (e) {}

  // ================= Leg B — the stranger =================
  T.section('leg B: the stranger is Vex Marlowe, an alien player (pre-reveal)');
  K.newRun(Game); // fresh run: leg A's scholar died with an emptied roster
  const scholarB = Game.villagerId;
  T.ok('fresh scholar for leg B', !!scholarB && scholarB !== scholarA);
  const pid = 'vex_marlowe';
  T.ok('vex_marlowe is a real persona', !!Game.apPersona(pid));
  T.ok('vex is unrevealed pre-fight (apKnowsAlien false)', Game.apKnowsAlien(pid) === false);
  const fighter = Game.apBuildFighter(pid, 4, 4);
  T.ok('fighter built', !!fighter);
  if (fighter) {
    T.ok('fighter kind is hostile (a person, not a monster)', fighter.kind === 'hostile', 'kind=' + fighter.kind);
    T.ok('fighter carries alienPid', fighter.alienPid === pid, 'alienPid=' + fighter.alienPid);
    T.ok('fighter is named Stranger pre-reveal', fighter.name === 'Stranger', 'name=' + fighter.name);
  }
  const rowsBeforeB = t.tbFights.length;
  const deathsBeforeB = cap.t.deaths.length;
  const started = Game.apStartEncounter(pid);
  T.ok('alien encounter started', started === true);
  T.ok('alienEncounter names vex_marlowe', !!((Game.state || {}).alienEncounter && Game.state.alienEncounter.pid === pid));
  T.ok('alien fight opened with NO tbFight row (startAlienCombat bypasses startCombat)', t.tbFights.length === rowsBeforeB, 'rows=' + t.tbFights.length + ' before=' + rowsBeforeB);
  T.ok('alien fight is live', !!Game.tbfight);
  const apFighter = (Game.tbfight && Game.tbfight.fighters || []).find(function (x) { return x && x.kind === 'hostile'; });
  T.ok('live fight has the hostile stranger', !!(apFighter && apFighter.alienPid === pid), 'found=' + JSON.stringify(apFighter && { kind: apFighter.kind, alienPid: apFighter.alienPid, name: apFighter.name }));
  const tailBefore = cap.t.sayTail.length;
  let guardB = 0, diedB = false;
  while (guardB++ < 300) {
    if (cap.t.deaths.length > deathsBeforeB) { diedB = true; break; }
    const f = Game.tbfight;
    if (!f || f.over) break;
    const p = pFighter(Game);
    if (p && (p.hp || 0) > 1) { try { p.hp = 1; } catch (e) {} }
    if (Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
      Game.tbPlayerWait();
      if (Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
        try { Game.tbAdvance(); } catch (e) {}
      }
    } else {
      try { Game.tbAdvance(); } catch (e) { break; }
    }
    if (cap.t.deaths.length > deathsBeforeB) { diedB = true; break; }
  }
  T.ok('the stranger kills the scholar', diedB, 'guard=' + guardB);
  const deathB = cap.t.deaths[cap.t.deaths.length - 1];
  T.ok('stranger death was captured', !!deathB);
  if (deathB) {
    T.ok('death cause is a stranger', deathB.causeArg === 'a stranger', 'causeArg=' + deathB.causeArg);
    T.ok('death names vex_marlowe as the alien encounter', deathB.alienEncounterPid === pid, 'alien=' + deathB.alienEncounterPid);
    T.ok('death was in combat', deathB.inCombat === true);
    const bf = (deathB.fighters || []).find(function (x) { return x && x.kind === 'hostile'; });
    T.ok('death fighters include the hostile stranger', !!(bf && bf.alienPid === pid && bf.name === 'Stranger'), 'fighter=' + JSON.stringify(bf));
    // The treeline intro is said at encounter start; the fight's own
    // narration (beam warnings, hits) pushes it out of the death
    // capture's 25-line window, so read the rolling 200-line tail.
    const fullTailB = (cap.t.sayTail || []).map(function (l) { return l.text; }).join('\n');
    T.ok('treeline intro was said', /A figure steps out of the treeline/.test(fullTailB));
    T.ok('dead scholar is the leg-B scholar', deathB.scholarId === scholarB, 'scholarId=' + deathB.scholarId);
  }
  T.ok('still NO tbFight row for the alien fight (corpus shape reproduced)', t.tbFights.length === rowsBeforeB, 'rows=' + t.tbFights.length + ' before=' + rowsBeforeB);
  const sdB = (t.scholarDeaths || []).filter(function (e) { return e && e.scholarId === scholarB; });
  T.ok('scholarDeaths records the stranger death in combat', sdB.length === 1 && sdB[0].causeArg === 'a stranger' && sdB[0].inCombat === true, JSON.stringify(sdB));
  // Codex: pre-reveal the entry is filed under 'someone' / 'stranger',
  // and after a real encounter the note names what happened — without
  // ever naming the alien truth.
  let enc = 0;
  try { enc = (((Game.apState() || {}).met || {})[pid] || {}).encounters || 0; } catch (e) {}
  T.ok('the encounter was recorded (encounters>=1)', enc >= 1, 'encounters=' + enc);
  if (enc >= 1 && typeof Game.apCodexEntry === 'function') {
    const entry = Game.apCodexEntry(pid);
    T.ok('codex entry title is stranger (not the true title)', entry && entry.title === 'stranger', 'title=' + (entry && entry.title));
    T.ok('codex entry name is someone (not the true name)', entry && entry.name === 'someone', 'name=' + (entry && entry.name));
    T.ok('codex note says a stranger crossed you out', !!(entry && entry.note && /A stranger crossed you out in the wild/.test(entry.note)), 'note=' + (entry && entry.note));
  }
  T.ok('no instrument errors (leg B)', (t.instrumentErrors || []).length === 0, JSON.stringify(t.instrumentErrors || []));
  void tailBefore;

  try { cap.uninstall(); } catch (e) {}
  try { inst.uninstall(); } catch (e) {}
  Game.tbEnd = origTbEnd;
  Game.startCombat = origStart;
  T.done();
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
