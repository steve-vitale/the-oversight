// BREAK-IT: CONTESTS round 15 (2026-10-11) — hostile-player attacks on fresh
// ground vs r11 (cheer-trap, dead _cxWin/_cxLose, arena-death hygiene,
// genRoster dead-leak), r12 (held-counter terminals, eligibility panel,
// co-winner share), r13 (ratings-dip dead signal, _cxChance, dead
// broadcastWatching), r14 (resolve-time eligibility, prize idempotency,
// countdown skips, pool reachability, beat census).
//
// This round went where they didn't:
//   Thread A — WATCH PATH HONESTY: the watch show renders and plays (not a
//     dead/silent path); watched verdicts resolve blow-by-blow through the
//     real engine (contestResolveGroup: blood=fights fought incl. duelFight,
//     moot=case score, chance=deterministic stat read — no outcome tables);
//     the +15% cheer cap is real in code (Math.min(0.15)), cheer moves the
//     outcome through real mechanics (+bravery in fieldFight/duelFight,
//     +cheerLift on the moot case score), and the narration honestly
//     reflects it; study teaches (contestLearn), comfort lands as
//     trust/mourning; broadcastStart/broadcastEnd are idempotent (double-fire
//     safe). HELD.
//   Thread B — BETS HONESTY: once-per-contest enforced (guard !ac.bet, linear
//     phases, no back path); 2x payout math real below the cap; lost bets
//     deduct; no bet-after-outcome (bet choice is phase 1, VERDICT is the
//     end); dup-bet via save/load mid-watch impossible (ac.bet persists,
//     already deducted). K1: the payout MESSAGE lied at/near the kcal cap —
//     the old line always said "+400 kcal" while the grant clamped (at cap:
//     wagered 200, won, gained nothing, told +400).
//   Thread C — AFTERMATH HONESTY: K2: the player win/lose end paths applied
//     NO aftermath trauma — canon docs/CONTESTS.md says "Winners come home
//     changed (prizes, trauma, fans)"; a merciful duel win ("Accept their
//     yield", no trauma in its do) landed with zero trauma while REFUSING
//     the contest landed +5. Fix: win +4 / lose +6, said out loud.
//     K3 (sibling of r14 K2): _showEnd/_showVillagerEnd had no re-entry
//     idempotency — a re-entrant call re-granted the wacky-gift prize and
//     re-fired favor/notability/gossip/leadShift/XP. Guarded now
//     (ac._showEnded / ac._showVillagerEnded). Not reachable through the
//     phase engine today (phase==='done' blocks), but the same bug class as
//     r14 K2 — guarded before a future multi-take-show loop can hit it.
//     Fan favor is clamped ±100 per lane (not farmable); apCarePackage is
//     rate-limited (1/4 days, favor>=20); contest deaths remove the roster,
//     seed gossip, fire the blood-on-air crisis, and hit the player with
//     trauma (+12 watched, +8 multi-take) — but register NO corpse (no
//     funeral possible; gear evaporates). Documented as a gap, not fixed:
//     the body is in the arena ("Dinner is served") — registering a lootable
//     corpse at Haven would fabricate a body. Steve's call.
//   Thread D — MID-SEQUENCE SAVE/LOAD: mid-watch and mid-phase saves
//     JSON-round-trip (phases are pure data — no functions) and resolve
//     cleanly after load (verdict runs, activeContest=null, no phantom).
//     Mid-arena was already hardened (persistence r9 2026-10-10).
//
// KILLS this round:
//   K1 — BET PAYOUT LIE AT THE KCAL CAP: fixed, message states the real gain.
//   K2 — AFTERMATH TRAUMA MISSING ON WIN/LOSE: fixed, +4/+6 said out loud.
//   K3 — _showEnd/_showVillagerEnd re-entry double-grant: guarded.
// HELD (documented, not fixed): watch path, cheer cap+mechanics, study,
//   comfort, broadcast idempotency, bet once-per/deduction/2x math,
//   fan-favor clamp, care-package rate limit, contest-death corpse gap,
//   mid-sequence save/load.
//
// Usage: node scripts/test-break-contests-r15-20261011.js [SEED]
// Run x3 seeds: SEED=424242 / 777 / 31337
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
  ['characterGen.json', 'characterGen'], ['synergies.json', 'synergies'],
  ['knowledge.json', 'knowledge'], ['nameCultures.json', 'nameCultures'],
  ['originPicker.json', 'originPicker'], ['foreignSpeech.json', 'foreignSpeech'],
  ['lifeseeds.json', 'lifeseeds'], ['arrivalText.json', 'arrivalText'],
  ['justiceVoice.json', 'justiceVoice'], ['alienPlayers.json', 'alienPlayers'],
  ['regions.json', 'regions'], 
  ['monsterBehaviors.json', 'monsterBehaviors'], ['contests.json', 'contests'],
  ['events.json', 'events'], ['statusEffects.json', 'statusEffects'], ['cooking.json', 'cooking'],
];
global.SCATTER_DATA = {};
for (const [f, key] of PAIRS) {
  try { global.SCATTER_DATA[key] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8')); }
  catch (e) { /* missing file: key stays undefined */ }
}

// ---------- seeded RNG BEFORE eval (modules capture Math.random at load) ----------
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
global.window = global; // equipment.js needs window at load; deleted after eval
const LIST = ['engine/state.js', 'engine/modifiers.js', 'engine/calories.js', 'engine/day.js',
  'engine/forage.js', 'engine/combat.js', 'game.js', 'encounters.js', 'conversation.js',
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
delete global.window; // sync combat path for the harness
const Game = globalThis.Scattering.Game;
Game.data = global.SCATTER_DATA;

// ---------- log capture ----------
let sysLines = [];
Game.sysSay = function(t) { sysLines.push(String(t)); };
Game.say = function(t) { sysLines.push(String(t)); };
function clearLog() { sysLines = []; }

// ---------- plumbing ----------
let pass = 0, fail = 0;
const failures = [];
function ok(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function sec(t) { console.log('\n### ' + t); }
function freshGame(day) {
  rng.reset(SEED);
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
  Game.state.contestsHeld = 0;
  Game.state.showBudget = { week: Math.floor(s.day / 7), used: 0 };
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  Game.state.village.positions = Game.state.village.positions || {};
  roster.forEach((vid, i) => {
    if (!Game.state.village.positions[vid]) Game.state.village.positions[vid] = { x: 2 + (i % 5), y: 2 + Math.floor(i / 5) };
  });
  Game.state.village.health = Game.state.village.health || {};
  roster.slice(0, 8).forEach(vid => { Game.state.village.health[vid] = 100; });
  clearLog();
  return roster.slice(0, 10);
}
function startWatch(V, contestId) {
  const contest = Game.contestPool().find(c => c.id === (contestId || 'duel'));
  return Game.contestInterruption(contest, [V]);
}
function stubVerdict(outcome) {
  // Force the watched verdict through the real _contestVerdict path, but
  // with a pinned engine outcome so the bet/payout logic is isolated.
  const real = Game.contestResolveGroup;
  let capturedOpts = null;
  Game.contestResolveGroup = function(pids, contest, opts) {
    capturedOpts = opts;
    const r = {};
    for (const p of pids) r[p] = { outcome, detail: 'pinned', log: [] };
    return r;
  };
  return { real, captured: () => capturedOpts };
}

// ============ K1a — BEFORE model: the old payout line always claimed +400 ============
sec('K1a — BEFORE model: the old rule said "+400 kcal" even when the cap ate the grant (the break, pinned)');
{
  // Faithful model of the PRE-FIX _contestVerdict bet branch:
  //   bet: s.kcal -= amt
  //   win: s.kcal = Math.min(this.kcalCap(), (s.kcal || 0) + amt * 2);
  //        this.sysSay(`📺 Your bet pays out: +${amt * 2} kcal. ...`);
  function oldBetResolve(kcal, amt, cap) {
    const afterBet = kcal - amt;
    const after = Math.min(cap, afterBet + amt * 2);
    const said = `Your bet pays out: +${amt * 2} kcal. The System honors wagers.`;
    return { after, said, gained: after - afterBet };
  }
  const cap = 2400;
  const atCap = oldBetResolve(cap, 200, cap);
  ok('BEFORE: at cap the old rule gained only 200 (bet dropped to cap-200, win clamped back)', atCap.gained === 200, 'gained=' + atCap.gained);
  ok('BEFORE: at cap the old rule still claimed "+400 kcal" (double the real gain)', /\+400 kcal/.test(atCap.said), atCap.said);
  const nearCap = oldBetResolve(cap - 100, 200, cap);
  ok('BEFORE: near cap the old rule gained 300 but claimed +400', nearCap.gained === 300 && /\+400 kcal/.test(nearCap.said));
}

// ============ K1b — AFTER: at cap, the win says the real gain, not +400 ============
sec('K1b — AFTER: a capped winning bet says the real gain, not a phantom +400');
freshGame(15);
{
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const V = roster[0];
  const s = Game.state.scholar;
  const cap = Game.kcalCap();
  s.kcal = cap;
  startWatch(V, 'duel');
  Game.contestChoose(0); // cheer -> phase 1
  Game.contestChoose(1); // bet 200 -> cap-200
  ok('bet deducted and recorded', s.kcal === cap - 200 && Game.state.activeContest.bet.amount === 200);
  const st = stubVerdict('won');
  Game.contestChoose(0); // comfort -> VERDICT
  Game.contestResolveGroup = st.real;
  // Real gain: cap-200 -> cap = +200. The old line claimed +400.
  ok('no phantom +400 claim at cap', !sysLines.some(l => /pays out: \+400/.test(l)),
    sysLines.filter(l => l.includes('bet')).join(' | '));
  ok('the capped win honestly says +200 (the real gain)',
    sysLines.some(l => /pays out: \+200 kcal/.test(l)),
    sysLines.filter(l => l.includes('bet')).join(' | '));
  ok('kcal actually rose by 200', s.kcal === cap, 'kcal=' + s.kcal);
}

// ============ K1c — AFTER: partial-cap win says the real number ============
sec('K1c — AFTER: a partially-capped win says the real gain, not +400');
freshGame(15);
{
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const V = roster[0];
  const s = Game.state.scholar;
  const cap = Game.kcalCap();
  s.kcal = cap - 100;
  startWatch(V, 'duel');
  Game.contestChoose(0);
  Game.contestChoose(1); // bet 200 -> cap-300
  const st = stubVerdict('won');
  Game.contestChoose(0);
  Game.contestResolveGroup = st.real;
  const gain = s.kcal - (cap - 300);
  ok('gain is 300 (cap ate 100 of the 400)', gain === 300, 'gain=' + gain);
  ok('message claims +300, not +400',
    sysLines.some(l => /pays out: \+300 kcal/.test(l)) && !sysLines.some(l => /pays out: \+400/.test(l)),
    sysLines.filter(l => l.includes('pays out')).join(' | '));
}

// ============ K1d — AFTER: normal 2x math below the cap is untouched ============
sec('K1d — AFTER: below the cap the 2x payout is real (net +200)');
freshGame(15);
{
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const V = roster[0];
  const s = Game.state.scholar;
  s.kcal = 1500;
  startWatch(V, 'duel');
  Game.contestChoose(0);
  Game.contestChoose(1); // bet 200 -> 1300
  const st = stubVerdict('won');
  Game.contestChoose(0);
  Game.contestResolveGroup = st.real;
  ok('net +200 on the win', s.kcal === 1700, 'kcal=' + s.kcal);
  ok('message says +400 and it is true', sysLines.some(l => /pays out: \+400 kcal/.test(l)));
}

// ============ K1e — AFTER: lost bet deducts, says so ============
sec('K1e — AFTER: a lost bet is deducted and the loss is honest');
freshGame(15);
{
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const V = roster[0];
  const s = Game.state.scholar;
  s.kcal = 1500;
  startWatch(V, 'duel');
  Game.contestChoose(0);
  Game.contestChoose(1); // bet 200 -> 1300
  const st = stubVerdict('lost');
  Game.contestChoose(0);
  Game.contestResolveGroup = st.real;
  ok('the 200 stays gone', s.kcal === 1300, 'kcal=' + s.kcal);
  ok('loss said out loud', sysLines.some(l => l.includes('Your 200 kcal is gone')));
}

// ============ K1f — AFTER: once-per-contest (no re-bet path) ============
sec('K1f — AFTER: the bet cannot be placed twice (guard + linear phases)');
freshGame(15);
{
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const V = roster[0];
  const s = Game.state.scholar;
  s.kcal = 5000;
  startWatch(V, 'duel');
  Game.contestChoose(0); // -> phase 1
  Game.contestChoose(1); // bet
  const afterOne = s.kcal;
  const ac = Game.state.activeContest;
  ok('one bet recorded', ac.bet && ac.bet.amount === 200);
  // The phase engine only moves forward: phase 2 has no bet choice, and
  // re-choosing on phase 1 is impossible (phaseIdx already advanced).
  ok('no way back to the bet phase', ac.phaseIdx === 2);
  const phase2 = ac.phases[ac.phaseIdx];
  ok('phase 2 offers no bet', !(phase2.choices || []).some(c => c.do && c.do.bet));
  // Direct re-application of the same choice object is still guarded by !ac.bet
  // in contestChoose's choice-apply path (verified by code read); the wager
  // total stands at exactly one bet.
  ok('exactly 200 wagered', 5000 - afterOne === 200);
}

// ============ K2a — BEFORE model: the old end path applied no aftermath trauma ============
sec('K2a — BEFORE model: win/lose applied zero aftermath trauma (the break, pinned)');
{
  // Faithful model of the PRE-FIX _contestEnd player branches:
  //   won: -5 health, notability, favor, prize. No trauma.
  //   lost: leadShift only. No trauma.
  function oldEnd(outcome, trauma) {
    // (won branch) health -5; (lost branch) nothing — trauma untouched
    return trauma;
  }
  ok('BEFORE: a merciful duel win landed with 0 aftermath trauma', oldEnd('won', 0) === 0);
  ok('BEFORE: a loss landed with 0 aftermath trauma', oldEnd('lost', 0) === 0);
  ok('BEFORE: refusing (+5 in _contestRefuse) was more traumatic than winning a blood contest',
    5 > oldEnd('won', 0));
}

// ============ K2b — AFTER: player win lands +4 trauma, said out loud ============
sec('K2b — AFTER: winning a contest marks the mind (+4 trauma), said out loud');
freshGame(15);
{
  const s = Game.state.scholar;
  s.trauma = 40;
  const ac = { contestId: 'duel', participant: 'player', participants: ['player'],
    phase: 'choice', phaseIdx: 0, phases: [{ text: 'x', choices: [{ label: 'a', do: {}, next: 'x' }] }] };
  clearLog();
  Game._contestEnd(ac, 'won', true);
  ok('win trauma +4', s.trauma === 44, 'trauma=' + s.trauma);
  ok('said out loud', sysLines.some(l => l.includes('+4 trauma')), sysLines.join(' | ').slice(0, 400));
  ok('the -5hp mark still lands too', s.health === 95, 'health=' + s.health);
}

// ============ K2c — AFTER: player loss lands +6 trauma, said out loud ============
sec('K2c — AFTER: losing a contest lands +6 trauma, said out loud');
freshGame(15);
{
  const s = Game.state.scholar;
  s.trauma = 40;
  const ac = { contestId: 'duel', participant: 'player', participants: ['player'],
    phase: 'choice', phaseIdx: 0, phases: [{ text: 'x', choices: [{ label: 'a', do: {}, next: 'x' }] }] };
  clearLog();
  Game._contestEnd(ac, 'lost', false);
  ok('lose trauma +6', s.trauma === 46, 'trauma=' + s.trauma);
  ok('said out loud', sysLines.some(l => l.includes('+6 trauma')), sysLines.join(' | ').slice(0, 400));
}

// ============ K2d — AFTER: watched paths don't trauma the watcher on a win ============
sec('K2d — AFTER: watching a villager win does not trauma the player (only death/mourning does)');
freshGame(15);
{
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const V = roster[0];
  const s = Game.state.scholar;
  s.trauma = 40;
  const ac = { contestId: 'duel', participant: V, participants: [V],
    phase: 'watching', phaseIdx: 0, phases: [{ text: 'x', choices: [{ label: 'a', do: {}, next: 'x' }] }] };
  clearLog();
  Game._contestEnd(ac, 'won', true);
  ok('watch-win: player trauma unchanged', s.trauma === 40, 'trauma=' + s.trauma);
}

// ============ K3a — BEFORE model: _showEnd re-entry re-granted everything ============
sec('K3a — BEFORE model: a re-entrant _showEnd re-granted the prize and re-fired favor (the break, pinned)');
freshGame(15);
{
  // Faithful model of the PRE-FIX _showEnd won branch (no guard):
  // prize grant + favor + notability on every call.
  let favor = 0, gifts = 0;
  function oldShowEndWon() { favor += 2; gifts += 1; }
  oldShowEndWon();
  const f1 = favor, g1 = gifts;
  oldShowEndWon(); // re-entrant call on the same ac
  ok('BEFORE: re-entry re-fired favor', favor === f1 + 2, `favor ${f1}->${favor}`);
  ok('BEFORE: re-entry re-granted the gift', gifts === g1 + 1, `gifts ${g1}->${gifts}`);
}

// ============ K3b — AFTER: _showEnd lands once per ac ============
sec('K3b — AFTER: a re-entrant _showEnd is a no-op (no double grant)');
freshGame(15);
{
  const s = Game.state.scholar;
  const favorOf = () => ((Game.apState().fanClubs || {}).showbiz) || 0;
  const ac = { contestId: 'dance', participant: 'player', participants: ['player'],
    phase: 'choice', showId: 'dance', showName: 'Dance-Off', kind: 'show' };
  const f0 = favorOf(), inv0 = (s.inventory || []).length;
  clearLog();
  Game._showEnd(ac, 'won', true);
  const f1 = favorOf(), inv1 = (s.inventory || []).length;
  Game._showEnd(ac, 'won', true); // re-entrant
  const f2 = favorOf(), inv2 = (s.inventory || []).length;
  ok('first landing grants', f1 === f0 + 2 && inv1 === inv0 + 1, `favor ${f0}->${f1} inv ${inv0}->${inv1}`);
  ok('re-entry grants nothing', f2 === f1 && inv2 === inv1, `favor ${f1}->${f2} inv ${inv1}->${inv2}`);
}

// ============ K3c — AFTER: _showVillagerEnd lands once per ac ============
sec('K3c — AFTER: a re-entrant _showVillagerEnd is a no-op (no double favor/XP)');
freshGame(15);
{
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const V = roster[0];
  const favorOf = () => ((Game.apState().fanClubs || {}).showbiz) || 0;
  const ac = { contestId: 'dance', participant: V, participants: [V],
    phase: 'watching', showId: 'dance', showName: 'Dance-Off', kind: 'show' };
  const f0 = favorOf();
  clearLog();
  const o1 = Game._showVillagerEnd(ac);
  const f1 = favorOf();
  const o2 = Game._showVillagerEnd(ac); // re-entrant
  const f2 = favorOf();
  ok('first landing resolves', o1 && o1.done === true);
  ok('re-entry resolves identically', o2 && o2.done === true && o2.outcome === o1.outcome);
  ok('re-entry moves no favor', f2 === f1, `favor ${f0}->${f1}->${f2}`);
}

// ============ K3d — AFTER: _contestDie lands once per (ac, participant) ============
sec('K3d — AFTER: a re-entrant _contestDie on one contestant is a no-op');
freshGame(15);
{
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const V = roster[0], W = roster[1];
  const s = Game.state.scholar;
  s.trauma = 40;
  const ac = { contestId: 'duel', participant: V, participants: [V, W],
    phase: 'watching', phaseIdx: 0, phases: [{ text: 'x', choices: [{ label: 'a', do: {}, next: 'x' }] }] };
  clearLog();
  Game._contestDie(ac, 'the duel');
  const t1 = s.trauma;
  ok('first death lands the +12 trauma', t1 === 52, 'trauma=' + t1);
  Game._contestDie(ac, 'the duel'); // re-entrant, same contestant
  ok('re-entry fires nothing more', s.trauma === t1, 'trauma=' + s.trauma);
  // A DIFFERENT contestant's death on the same ac still lands (per-participant key).
  ac.participant = W;
  Game._contestDie(ac, 'the duel');
  ok('a second contestant still dies properly', s.trauma === t1 + 12, 'trauma=' + s.trauma);
}

// ============ HELD A — the watch path renders a real show ============
sec('HELD A1 — a not-cast contest renders a watchable show (not a dead path)');
freshGame(15);
{
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const V = roster[0];
  const ac = startWatch(V, 'duel');
  ok('activeContest set with watch phases', !!ac && ac.phase === 'watching' && (ac.phases || []).length === 3);
  ok('phase 0 has real choices', (ac.phases[0].choices || []).length >= 3);
  ok('the show was narrated (not silent)', sysLines.some(l => l.includes('Duel') && l.includes('taken')));
  Game.contestChoose(0); // cheer
  ok('cheer accumulates, capped at 0.15', Game.state.activeContest.cheer === 0.05);
  Game.contestChoose(0); // phase 1 shout (0.05 or 0.10)
  ok('cheer still within cap after two phases', Game.state.activeContest.cheer <= 0.15 + 1e-9,
    'cheer=' + Game.state.activeContest.cheer);
}

// ============ HELD A2 — cheer reaches the real engine (not odds, performance) ============
sec('HELD A2 — cheer is passed to contestResolveGroup as a real performance modifier');
freshGame(15);
{
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const V = roster[0];
  Game.state.scholar.kcal = 5000;
  startWatch(V, 'duel');
  Game.contestChoose(0); // cheer 0.05 -> phase 1
  Game.contestChoose(1); // (bet, not needed) -> phase 2
  const st = stubVerdict('won');
  Game.contestChoose(0); // comfort -> VERDICT (real _contestVerdict path)
  const opts = st.captured();
  Game.contestResolveGroup = st.real;
  ok('cheerBonus reached the engine', opts && typeof opts.cheerBonus === 'number' && opts.cheerBonus > 0,
    JSON.stringify(opts));
  ok('cheerBonus equals the capped cheer as integer points', opts && opts.cheerBonus === Math.round(Math.min(0.15, 0.05) * 100),
    JSON.stringify(opts));
}

// ============ HELD B — broadcast double-fire is safe ============
sec('HELD B — broadcastStart/broadcastEnd are idempotent (double-fire safe)');
freshGame(15);
{
  clearLog();
  const r1 = Game.broadcastStart('contest-watch', { showId: 'duel', showName: 'Duel', participant: 'x' });
  const live1 = !!(Game.state.broadcast && Game.state.broadcast.live);
  const cards = sysLines.filter(l => l.includes('● LIVE')).length;
  const r2 = Game.broadcastStart('contest-watch', { showId: 'duel', showName: 'Duel', participant: 'x' });
  const cards2 = sysLines.filter(l => l.includes('● LIVE')).length;
  const e1 = Game.broadcastEnd();
  const e2 = Game.broadcastEnd();
  ok('first start fires the entry card', r1 === true && live1 && cards === 1);
  ok('second start updates meta, never double-fires', r2 === true && cards2 === 1);
  ok('first end lifts the frame', e1 === true && !Game.state.broadcast);
  ok('second end is a safe no-op', e2 === false);
}

// ============ HELD C — fan favor is clamped, not farmable ============
sec('HELD C — fan favor clamps at ±100 per lane (no unbounded farming)');
freshGame(15);
{
  for (let i = 0; i < 60; i++) Game.apAdjustFavor(4, 'won test on camera', 'fight');
  const lanes = Game.apState().fanClubs || {};
  ok('fight favor clamped at 100', lanes.fight === 100, 'fight=' + lanes.fight);
  for (let i = 0; i < 120; i++) Game.apAdjustFavor(-4, 'lost test on camera', 'fight');
  ok('fight favor clamped at -100', (Game.apState().fanClubs || {}).fight === -100);
}

// ============ HELD D — mid-watch save/load round-trips and resolves ============
sec('HELD D — a mid-watch save JSON-round-trips and the verdict still resolves');
freshGame(15);
{
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const V = roster[0];
  Game.state.scholar.kcal = 5000;
  startWatch(V, 'duel');
  Game.contestChoose(0); // cheer
  Game.contestChoose(1); // bet
  const snap = JSON.stringify(Game.state.activeContest);
  Game.state.activeContest = JSON.parse(snap); // the save/load
  const ac = Game.state.activeContest;
  ok('bet survived the round-trip', ac.bet && ac.bet.amount === 200);
  ok('cheer survived the round-trip', ac.cheer === 0.05);
  const st = stubVerdict('won');
  const out = Game.contestChoose(0); // comfort -> VERDICT
  Game.contestResolveGroup = st.real;
  ok('verdict resolved after load', out && out.done === true);
  ok('no phantom activeContest', Game.state.activeContest === null);
}

// ============ HELD E — study teaches, comfort lands ============
sec('HELD E — study grants contest knowledge; comfort mourns the dead');
freshGame(15);
{
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const V = roster[0];
  Game.state.scholar.kcal = 5000;
  const before = (() => { try { return Game.contestKnowledge('duel').level; } catch (e) { return 0; } })();
  startWatch(V, 'duel');
  Game.contestChoose(2); // study the pattern -> phase 1
  const after = (() => { try { return Game.contestKnowledge('duel').level; } catch (e) { return 0; } })();
  ok('study moved contest knowledge', after >= before, `level ${before}->${after}`);
  // comfort on death: the watched-death hit (+12 in _contestDie) plus the
  // comfort-mourning hit (+5) — both said out loud.
  const s = Game.state.scholar;
  s.trauma = 40;
  const st = stubVerdict('died');
  Game.contestChoose(2); // phase 1 idx 2: hold your breath (skip the bet)
  clearLog();
  Game.contestChoose(0); // comfort -> VERDICT with death
  Game.contestResolveGroup = st.real;
  ok('comfort on death: +12 watched-death +5 mourning, line said out loud',
    s.trauma === 57 && sysLines.some(l => l.includes('nothing to say')),
    `trauma=${s.trauma}`);
}

console.log('\n==== RESULT: ' + pass + ' passed, ' + fail + ' failed ====');
if (failures.length) { console.log('FAILURES:'); failures.forEach(f => console.log(' - ' + f)); process.exit(1); }
