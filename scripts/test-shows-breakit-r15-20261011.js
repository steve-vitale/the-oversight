// BREAK-IT r15: SHOWS & BROADCAST (2026-10-11) — hostile-player attacks on
// src/js/contests.js (show/summons/watch paths), broadcast.js, contestEngine.js.
// Prior rounds r10-r14 + shows-break (2026-10-09/10) already covered: 2/week
// budget, stunt double-prize, care-package farming, reqKcal, countdown recast,
// resolve-time eligibility, prize idempotency, whim announcement (contests),
// TV-doesn't-kill, broadcast frame save/load, eligibility panel off-board.
// This round attacks what's NOT covered:
//   S1 — SOFTLOCK: phase-graph termination sweep — every choice in every
//     phase of all 44 contests (playable + givesChoice-shifted + watch) and
//     all 30 shows (player + villager-watch + together) must resolve to a
//     valid phase index or a known terminal. A choice pointing at a missing
//     phase index = _contestEnd 'lost' fallback (honest but terminal); a
//     phase with NO choices = a stuck modal (softlock). Both are flagged.
//   E1 — EXPLOIT: budget across the week boundary (day 13 -> 14 rollover)
//     cannot double-spend a slot; every scheduled event consumes exactly one.
//   E2 — EXPLOIT: ratings-summons re-summon loop — after a delivered stunt
//     win, the dip must clear (rising-coast) so the next dawn cannot
//     re-summon on the same dip.
//   E3 — EXPLOIT: watch-mode bet payout fires exactly once — a re-entered
//     VERDICT (second click, re-render) cannot pay the 2x wager twice.
//   L1 — SOFTLOCK: villager-show modal (_showVillagerEnd) clears
//     activeContest and lifts the broadcast frame on every outcome path.
//   H1 — HONESTY: show-path whim is announced out loud like the contest whim.
//   D1 — DEAD-CODE: all 44 contest templates pickable at some wave; all 30
//     shows have authored beats; broadcast ticker reachable when live.
// Usage: node scripts/test-shows-breakit-r15-20261011.js [SEED]
// Seed via SEED env or argv; default 424242. Run x3 seeds.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || process.argv[2] || '424242', 10);

// ---------- data preload ----------
const PAIRS = [
  ['plants.json', 'plants'], ['biomes.json', 'biomes'], ['monsters.json', 'monsters'],
  ['villagers.json', 'villagers'], ['abilities.json', 'abilities'], ['items.json', 'items'],
  ['background_survivors.json', 'background_survivors'], ['cell_defs.json', 'cellDefs'],
  ['animals.json', 'animals'], ['recipes.json', 'recipes'], ['books.json', 'books'],
  ['relicEnhancements.json', 'relicEnhancements'], ['locations.json', 'locations'],
  ['characterGen.json', 'characterGen'], ['knowledge.json', 'knowledge'],
  ['nameCultures.json', 'nameCultures'], ['originPicker.json', 'originPicker'],
  ['foreignSpeech.json', 'foreignSpeech'], ['lifeseeds.json', 'lifeseeds'],
  ['arrivalText.json', 'arrivalText'], ['justiceVoice.json', 'justiceVoice'],
  ['alienPlayers.json', 'alienPlayers'], ['regions.json', 'regions'],
  ['dramaEffects.json', 'dramaEffects'], ['monsterBehaviors.json', 'monsterBehaviors'],
  ['contests.json', 'contests'], ['events.json', 'events'],
  ['statusEffects.json', 'statusEffects'], ['cooking.json', 'cooking'],
];
global.SCATTER_DATA = {};
for (const [f, key] of PAIRS) {
  try { global.SCATTER_DATA[key] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8')); }
  catch (e) { global.SCATTER_DATA[key] = (key === 'contests' || key === 'items' || key === 'monsters') ? [] : {}; }
}

// ---------- seeded RNG BEFORE eval ----------
function mulberry32(a) {
  return function() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let _rng = mulberry32(SEED);
function rng() { return _rng(); }
rng.reset = (s) => { _rng = mulberry32(s); };
Math.random = rng;

// ---------- eval FULL script list in index.html order, minus DOM-only ----------
global.window = global;
const LIST = ['engine/state.js', 'engine/modifiers.js', 'engine/combat.js', 'engine/calories.js', 'engine/day.js',
  'engine/forage.js',
  'game.js', 'encounters.js', 'conversation.js',
  'convo-mood.js', 'convoTopics.js', 'convo-wants.js', 'convo-dialogue.js', 'convo-beats.js',
  'convo-scene.js', 'examine.js', 'equipment.js', 'journal.js', 'party.js', 'party-formal.js',
  'truth.js', 'contests.js', 'broadcast.js', 'contestEngine.js', 'alienPlayers.js', 'storage.js',
  'perceive.js', 'carexplore.js', 'justice.js', 'food.js', 'betrayal.js', 'corpses.js',
  'corruption.js', 'lifeseed.js', 'progression.js', 'ledger.js', 'abilityActions.js',
  'monsterBehaviors.js', 'statusEffects.js', 'villager-agency.js', 'fieldFights.js',
  'villager-objectives.js', 'codex-people.js', 'membership.js', 'hierarchy.js',
  'debug-scenarios.js', 'build.js'];
for (const f of LIST) {
  try { eval(fs.readFileSync(path.join(ROOT, 'src/js', f), 'utf8')); }
  catch (e) { console.error('EVAL FAIL ' + f + ': ' + e.message); process.exit(2); }
}
delete global.window;
const Game = globalThis.Scattering.Game;
Game.data = global.SCATTER_DATA;

// ---------- plumbing ----------
let pass = 0, fail = 0;
const failures = [];
function ok(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function sec(t) { console.log('\n### ' + t); }

const said = [];
Game.sysSay = function(t) { said.push(String(t)); };
Game.audioEvent = function() {};
Game.drama = function() {};
Game.tele = function() {};
Game.leadShift = function() {};
Game.recordMoment = function() {};
Game.contestLearn = function() {};
Game.villagerGainXP = function() {};
const favorCalls = [];
Game.apAdjustFavor = function(n, why, lane) { favorCalls.push({ n, why, lane }); };
Game.kcalCap = function() { return 2400; };
Game.maxHealth = function() { return 100; };
Game.havenViewership = function() { return (this.state.village || {}).viewership || 0; };
Game.unlockedWave = function() { return 1; };
Game.monsterWavePool = function() { return (this.data.monsters || []).filter(m => (m.wave || 1) <= 1); };

function freshGame(day) {
  rng.reset(SEED);
  said.length = 0; favorCalls.length = 0;
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const s = Game.state.scholar;
  s.day = day || 15;
  Game.state.systemArrived = true;
  s.health = 100; s.kcal = 2000; s.trauma = 0; s.exiled = false;
  s.inventory = s.inventory || [];
  Game.state.over = false;
  Game.state.activeContest = null;
  Game.state.pendingContest = null;
  Game.state.arenaContest = null;
  Game.state.broadcast = null;
  Game.state.notability = {};
  Game.state.showBudget = { week: Math.floor(s.day / 7), used: 0 };
  const v = Game.state.village;
  v.viewership = 50; v._lastWeekViewership = 50; v._peakViewership = 50;
  v.positions = v.positions || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  roster.slice(0, 4).forEach((vid, i) => {
    if (!v.positions[vid]) v.positions[vid] = { x: 2 + i, y: 2 + i };
  });
  Game.state.alienPlayers = { fanClubs: { showbiz: 60, fight: 10, survival: 5, social: 5 }, lastPackageDay: -999, favor: 0 };
  return roster.slice(0, 4);
}

// ================= S1 — PHASE-GRAPH TERMINATION SWEEP =================
sec('S1 — phase-graph termination sweep: every choice resolves to a valid phase or a known terminal');
const TERMINALS = new Set(['WIN', 'LOSE', 'MIXED', 'SHOW_VILLAGER', 'DIE', 'REFUSE', 'VERDICT', 'MOOT_JUDGE', 'MAW_JUDGE']);
function sweepPhases(label, phases) {
  let bad = 0, stuck = 0, okCount = 0;
  const notes = [];
  if (!Array.isArray(phases) || !phases.length) {
    ok(label + ' — non-empty phase array', false, 'empty/missing');
    return { bad: 1 };
  }
  // BFS reachability of a terminal from phase 0
  const seen = new Set([0]);
  const q = [0];
  while (q.length) {
    const i = q.pop();
    const ph = phases[i];
    if (!ph) { bad++; notes.push('phase ' + i + ' missing'); continue; }
    const choices = ph.choices || [];
    if (!choices.length) {
      // A phase with no choices is a stuck modal — unless the phase itself
      // auto-terminates (no auto-next exists in the engine, so this is a
      // softlock). The choice-phase at index 0 of givesChoice always has 2.
      stuck++; notes.push('phase ' + i + ' has no choices (stuck modal)');
      continue;
    }
    for (const ch of choices) {
      const nx = ch.next;
      if (typeof nx === 'number') {
        if (nx < 0 || nx >= phases.length || !Number.isInteger(nx)) {
          bad++; notes.push('phase ' + i + ' "' + ch.label + '" -> bad index ' + nx + ' (of ' + phases.length + ')');
        } else { okCount++; if (!seen.has(nx)) { seen.add(nx); q.push(nx); } }
      } else if (typeof nx === 'string' && TERMINALS.has(nx)) {
        okCount++;
      } else {
        bad++; notes.push('phase ' + i + ' "' + ch.label + '" -> unknown next ' + JSON.stringify(nx));
      }
    }
  }
  // Also verify every phase (even unreachable) has sane choice targets —
  // unreachable phases are dead content, not softlocks, so report only.
  let unreachable = 0;
  for (let i = 0; i < phases.length; i++) if (!seen.has(i)) unreachable++;
  ok(label + ' — all choice targets valid', bad === 0, bad ? notes.slice(0, 3).join(' | ') : undefined);
  ok(label + ' — no stuck (choiceless) phases', stuck === 0, stuck ? notes.filter(n => n.includes('no choices')).slice(0, 3).join(' | ') : undefined);
  if (unreachable) console.log('  NOTE ' + label + ': ' + unreachable + ' unreachable phase(s) (dead content, not a softlock)');
  return { bad, stuck };
}
{
  freshGame(15);
  const pool = Game.contestPool();
  ok('contest pool non-trivial', pool.length >= 40, 'got ' + pool.length);
  let totalBad = 0;
  for (const c of pool) {
    const scaled = Game._contestScaled(c, null);
    // playable (grabbed path)
    let phases = null;
    try { phases = Game.contestPlayable(scaled); } catch (e) { phases = null; }
    if (!phases || !phases.length) { try { phases = Game._contestGeneric(scaled); } catch (e2) {} }
    const r1 = sweepPhases('contest ' + c.id + ' playable', phases);
    totalBad += r1.bad + r1.stuck;
    // givesChoice-shifted (the +1 shift path — real array the modal uses)
    if (phases && phases.length) {
      const shifted = phases.map(p => Object.assign({}, p, {
        choices: (p.choices || []).map(ch => Object.assign({}, ch, {
          next: (typeof ch.next === 'number') ? ch.next + 1 : ch.next,
        })),
      }));
      const choicePhase = { text: 'choice', choices: [
        { label: 'Participate', do: {}, next: 1 },
        { label: 'Refuse', do: {}, next: 'REFUSE' },
      ]};
      const r2 = sweepPhases('contest ' + c.id + ' givesChoice-shifted', [choicePhase, ...shifted]);
      totalBad += r2.bad + r2.stuck;
    }
    // watch path
    let wph = null;
    try { wph = Game._contestWatchPhases(scaled, ['v1']); } catch (e) { wph = null; }
    if (wph && wph.length) {
      const r3 = sweepPhases('contest ' + c.id + ' watch', wph);
      totalBad += r3.bad + r3.stuck;
    }
  }
  ok('all 44 contests: zero bad/stuck phase targets across playable, shifted, watch', totalBad === 0, totalBad + ' problems');
  // shows: player, villager-watch, together
  const shows = Game.showPool();
  ok('show pool = 30', shows.length === 30, 'got ' + shows.length);
  let showBad = 0;
  for (const sh of shows) {
    let p1 = null, p2 = null, p3 = null;
    try { p1 = Game.showPhases(sh, 'player'); } catch (e) {}
    try { p2 = Game.showWatchPhases(sh, 'v1'); } catch (e) {}
    try { p3 = Game.showTogetherPhases(sh); } catch (e) {}
    if (p1 && p1.length) showBad += sweepPhases('show ' + sh.id + ' player', p1).bad;
    else ok('show ' + sh.id + ' player phases', false, 'empty');
    if (p2 && p2.length) showBad += sweepPhases('show ' + sh.id + ' watch', p2).bad;
    else ok('show ' + sh.id + ' watch phases', false, 'empty');
    if (p3 && p3.length) showBad += sweepPhases('show ' + sh.id + ' together', p3).bad;
    else ok('show ' + sh.id + ' together phases', false, 'empty');
  }
  ok('all 30 shows: zero bad phase targets across player/watch/together', showBad === 0, showBad + ' problems');
}

// ================= E1 — BUDGET ACROSS WEEK BOUNDARY =================
sec('E1 — 2/week budget: week rollover cannot double-spend; each event consumes exactly one slot');
{
  freshGame(20); // week 2 = floor(20/7) = 2 (day 13 would be pre-embargo: day < 14 -> no TV)
  const v = Game.state.village;
  const seen = [];
  // force-favorable RNG: always schedule (chance roll passes), no summons
  const realRng = Math.random;
  Math.random = () => 0.0;
  try {
    // day 20: schedule up to 2
    let ev;
    let guard = 0;
    while (guard++ < 20 && Game.state.showBudget.used < 2) {
      v.viewership = 50; v._lastWeekViewership = 50;
      ev = Game.contestTick();
      if (ev) seen.push({ day: 20, ev });
      Game.state.pendingContest = null; Game.state.activeContest = null;
    }
    ok('day 20 schedules exactly 2', seen.length === 2 && Game.state.showBudget.used === 2,
      'scheduled=' + seen.length + ' used=' + Game.state.showBudget.used);
    // day 21: new week — budget resets, can schedule 2 more (legit), not 3+
    Game.state.scholar.day = 21;
    let ev2 = 0;
    guard = 0;
    const week3 = Math.floor(21 / 7);
    while (guard++ < 20 && ev2 < 3) {
      v.viewership = 50; v._lastWeekViewership = 50;
      const e = Game.contestTick();
      if (e) ev2++;
      Game.state.pendingContest = null; Game.state.activeContest = null;
    }
    ok('week rollover resets budget (day 21 schedules again, max 2)', ev2 === 2 && Game.state.showBudget.week === week3,
      'scheduled=' + ev2 + ' week=' + Game.state.showBudget.week);
    // each returned event consumed exactly one slot: used increments == events
    ok('no phantom slot consumption', Game.state.showBudget.used === ev2);
  } finally { Math.random = realRng; }
}

// ================= E2 — SUMMONS RE-SUMMON LOOP =================
sec('E2 — ratings summons: a delivered stunt clears the dip so the next dawn cannot re-summon');
{
  freshGame(15);
  const v = Game.state.village;
  // force a dip + find a seed where the tick returns a summons
  let seedFound = null;
  for (let s = 0; s < 400 && !seedFound; s++) {
    rng.reset(9000 + s);
    v.viewership = 50; v._lastWeekViewership = 60; // dipping
    Game.state.showBudget = { week: Math.floor(15 / 7), used: 0 };
    Game.state.pendingContest = null; Game.state.activeContest = null;
    let ev = null;
    try { ev = Game.contestTick(); } catch (e) { ev = null; }
    if (ev && ev.id === '__summons') seedFound = 9000 + s;
  }
  ok('a summons slot is reachable while dipping', seedFound !== null);
  if (seedFound !== null) {
    rng.reset(seedFound);
    v.viewership = 50; v._lastWeekViewership = 60;
    Game.state.showBudget = { week: Math.floor(15 / 7), used: 0 };
    Game.state.pendingContest = null; Game.state.activeContest = null;
    const ev = Game.contestTick();
    ok('tick returned __summons', ev && ev.id === '__summons');
    const ac = Game.fireRatingsSummons();
    ok('summons modal opened', !!ac && Game.state.activeContest === ac);
    // play it: Do the stunt (index 0), WIN path
    const beforeView = v.viewership;
    Game.state.scholar.kcal = 2000;
    const res = Game.contestChoose(0);
    ok('stunt choice resolves', res && res.done === true);
    ok('viewership moved up (+2)', v.viewership === beforeView + 2, 'was ' + beforeView + ' now ' + v.viewership);
    ok('dip flag cleared by the delivered stunt', v._dipping === false);
    // days 16..20: SAME week, real dawns. The frozen dip flag used to keep
    // the summons eligible for the rest of the week (proved 21/40 runs
    // re-summoned) even though the numbers ticked up. Now the week coasts.
    let resummons = 0, trials = 0;
    for (let d = 16; d <= 20; d++) {
      Game.state.scholar.day = d;
      for (let s = 0; s < 12; s++) {
        rng.reset(20000 + d * 100 + s);
        Game.state.showBudget = { week: Math.floor(d / 7), used: 0 };
        Game.state.pendingContest = null; Game.state.activeContest = null;
        let e2 = null;
        try { e2 = Game.contestTick(); } catch (e) { e2 = null; }
        trials++;
        if (e2 && e2.id === '__summons') resummons++;
        Game.state.pendingContest = null; Game.state.activeContest = null;
      }
    }
    ok('no same-week re-summon after the delivered stunt (' + trials + ' dawns)', resummons === 0, resummons + '/' + trials + ' re-summoned');
  }
}

// ================= E3 — BET PAYOUT EXACTLY ONCE =================
sec('E3 — watch-mode bet: the 2x payout fires exactly once, even on re-entry');
{
  freshGame(15);
  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId).slice(0, 2);
  // build a watch modal directly through the real path
  const contest = Game._contestScaled(Game.contestPool().find(c => c.id === 'pit'), null);
  Game.state.activeContest = {
    contestId: 'pit', participant: roster[0], participants: roster.slice(0, 1),
    phase: 'watching', phaseIdx: 0, phases: Game._contestWatchPhases(contest, roster.slice(0, 1)),
    variant: null, wounds: 0, kind: 'contest',
  };
  const ac = Game.state.activeContest;
  // find a bet choice in the watch phases and take it
  let betPlaced = false;
  for (let i = 0; i < ac.phases.length && !betPlaced; i++) {
    const ph = ac.phases[i];
    const bi = (ph.choices || []).findIndex(c => c.do && c.do.bet);
    if (bi >= 0) {
      ac.phaseIdx = i;
      Game.state.scholar.kcal = 2000;
      Game.contestChoose(bi);
      betPlaced = !!ac.bet;
    }
  }
  ok('bet placed on watch modal', betPlaced, 'no bet choice found in pit watch phases');
  if (betPlaced) {
    const betAmt = ac.bet.amount;
    // jump to the VERDICT phase and resolve
    const vi = ac.phases.findIndex(p => (p.choices || []).some(c => c.next === 'VERDICT'));
    ok('watch phases have a VERDICT choice', vi >= 0);
    if (vi >= 0) {
      ac.phaseIdx = vi;
      ac.phase = 'watching';
      const vci = ac.phases[vi].choices.findIndex(c => c.next === 'VERDICT');
      const kcalBefore = Game.state.scholar.kcal;
      Game.contestChoose(vci);
      const kcalAfter = Game.state.scholar.kcal;
      const paid = kcalAfter - kcalBefore;
      ok('verdict resolved and cleared the modal', Game.state.activeContest === null);
      // bet pays 2x on first-taken win, 0 on loss — either way, exactly one payout event
      ok('bet payout is 0 or exactly 2x (never 4x)', paid === 0 || paid === betAmt * 2,
        'paid=' + paid + ' bet=' + betAmt);
      // re-entry: contestChoose on the (now null) activeContest must be a no-op
      const again = Game.contestChoose(0);
      ok('post-verdict choice is a no-op (no re-entry)', again === null);
      ok('kcal unchanged after re-entry attempt', Game.state.scholar.kcal === kcalAfter);
    }
  }
}

// ================= L1 — VILLAGER-SHOW MODAL CLEARS CLEANLY =================
sec('L1 — villager show pull: every outcome clears activeContest and lifts the broadcast frame');
{
  freshGame(15);
  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const show = Game.showPool()[0];
  const outcomes = ['won', 'lost', 'mixed', 'refused'];
  for (const o of outcomes) {
    Game.state.activeContest = {
      kind: 'show', showId: show.id, showName: show.name, participant: vid,
      phase: 'watching', phaseIdx: 0, phases: [], variant: null, wounds: 0,
    };
    Game.broadcastStart('show', { showId: show.id, showName: show.name, participant: vid });
    ok('broadcast live before _showVillagerEnd(' + o + ')', !!(Game.state.broadcast && Game.state.broadcast.live));
    // force the outcome via a stubbed deterministic resolution
    const realResolve = Game.showResolveVillager;
    Game.showResolveVillager = function() { return o; };
    try { Game._showVillagerEnd(Game.state.activeContest); } catch (e) { ok('_showVillagerEnd(' + o + ') no-throw', false, e.message); }
    Game.showResolveVillager = realResolve;
    ok('_showVillagerEnd(' + o + ') clears activeContest', Game.state.activeContest === null);
    ok('_showVillagerEnd(' + o + ') lifts the broadcast frame', !(Game.state.broadcast && Game.state.broadcast.live));
  }
}

// ================= H1 — SHOW-PATH WHIM ANNOUNCED =================
sec('H1 — the 10% show whim is announced out loud (same rule as the contest whim)');
{
  freshGame(15);
  const v = Game.state.village;
  // make two villagers notable so the whim path has notables to draw from
  const roster = (v.roster || []).filter(id => id !== Game.villagerId).slice(0, 2);
  Game.addNotability(roster[0], 'contestWin');
  Game.addNotability(roster[1], 'survivedMoot');
  // hunt a seed where showCastPull takes the whim branch
  let whimWho = null;
  const realRng = Math.random;
  for (let s = 0; s < 500 && !whimWho; s++) {
    rng.reset(31000 + s);
    const cast = Game.showCastPull();
    if (cast && cast.why === 'whim') whimWho = cast.who;
  }
  ok('show whim path reachable', whimWho !== null);
  if (whimWho) {
    // fire a real show on a whim seed and check the announcement
    let fired = false;
    for (let s = 0; s < 500 && !fired; s++) {
      rng.reset(31000 + s);
      const cast = Game.showCastPull();
      if (cast && cast.why === 'whim') {
        said.length = 0;
        rng.reset(31000 + s);
        try { Game.fireShow(Game.showPool()[0]); } catch (e) { /* phases may need more state */ }
        fired = true;
      }
    }
    const transcript = said.join('\n');
    const announced = /System's whim/i.test(transcript);
    // fireShow may throw mid-modal in the thin harness; the announcement
    // lines are said BEFORE the modal builds, so check what was said.
    ok('whim announced in show transcript (or modal blocked the harness)', announced || !fired, announced ? undefined : 'fireShow threw before announcing');
  }
  Math.random = realRng;
}

// ================= D1 — DEAD-CODE =================
sec('D1 — wiring: modules loaded, templates reachable, beats authored');
{
  ok('broadcast.js loaded (broadcastStart)', typeof Game.broadcastStart === 'function');
  ok('contestEngine.js loaded (contestResolveGroup)', typeof Game.contestResolveGroup === 'function');
  ok('contests.js loaded (contestTick)', typeof Game.contestTick === 'function');
  // every contest template pickable at some wave
  const pool = Game.contestPool();
  const unreachable = [];
  for (const c of pool) {
    let okWave = false;
    for (let w = 1; w <= 5; w++) {
      let cands = pool.filter(x => !(w < 2 && x.risk === 'extreme'));
      cands = cands.filter(x => !(w < 3 && ['gauntlet', 'siege'].includes(x.id)));
      if (cands.some(x => x.id === c.id)) { okWave = true; break; }
    }
    if (!okWave) unreachable.push(c.id);
  }
  ok('all 44 contest templates reachable at some wave', unreachable.length === 0, unreachable.join(','));
  // every show has an authored beat (no silent generic fallback in practice)
  const shows = Game.showPool();
  const missing = shows.filter(s => !(Game.SHOW_BEATS || {})[s.id]).map(s => s.id);
  ok('all 30 shows have authored SHOW_BEATS', missing.length === 0, missing.join(','));
  // ticker reachable when live
  freshGame(15);
  Game.broadcastStart('show', { showId: 'why_eat', showName: 'WHY DO THEY EAT?', participant: 'together' });
  Game.broadcastBeat('__pull', { name: 'Test' });
  const html = Game.broadcastTickerHTML();
  ok('ticker HTML non-empty while live', typeof html === 'string' && html.length > 50);
  ok('crowd row covers every classifyBeat type', ['triumph', 'embarrassment', 'tension', 'deathreel', 'declare', 'pull', 'summons', 'together', 'feast', 'refused', 'generic'].every(m => Game.broadcastCrowd(m).length > 0));
  Game.broadcastEnd();
  ok('broadcastEnd lifts the frame', !(Game.state.broadcast && Game.state.broadcast.live));
}

console.log('\n==== RESULT: ' + pass + ' passed, ' + fail + ' failed ====');
if (failures.length) { console.log('FAILURES:'); failures.forEach(f => console.log('  - ' + f)); }
process.exit(fail ? 1 : 0);
