// scripts/policies/rewards.js — Per-archetype reward spec (Roguelike Celebration
// audit Talk 1, G3/P1-3). READ-ONLY spec + sanity assertions: ZERO game behavior
// change. This file never touches src/js/game.js; it documents what each sim
// policy's scorers OPTIMIZE, what their DEGENERATE optimum looks like, and what
// BOUNDS them, then asserts the declared properties against the real scorers.
//
// ============================================================================
// REVIEW CONTRACT (binding on all scorer edits in scripts/policies/):
//  1. Every policy's scorer(s) must have an entry in REWARDS below with
//     non-empty X (optimizes), Y (degenerate optimum), Z (what bounds it).
//  2. Any edit that changes a scorer's objective, its optimum, or its bounds
//     MUST update that policy's entry in the same commit. Reviewers: if a
//     scorer diff is not reviewable against its declared intent, reject it.
//  3. If a policy gains a new scorer, add it here with its own X/Y/Z.
//  4. The 23-metric balance contract (scripts/balance-metrics.json) is NOT
//     changed by this file; contract changes are Steve's call.
//  5. This file is harness-side only. Never require it from src/js/.
// ============================================================================
//
// Run the self-check:  node scripts/policies/rewards.js
// Exits 0 with all assertions passing; non-zero with the failing check named.
'use strict';

const path = require('path');
const fs = require('fs');

// Scorer modules importable without a Game (pure or stub-driven):
const { harmScore } = require('./risk-aware');       // deterministic
const { scoreOffer, scoreTableOption } = require('./capable'); // stub-Game driven

// ----------------------------------------------------------------------------
// REWARDS: the per-archetype reward functions. Each entry answers the Kingsford
// question — "are you making an optimized game or a fun game?" — for one policy
// archetype: what it optimizes (X), what its degenerate optimum is (Y), and
// what bounds it (Z).
// ----------------------------------------------------------------------------
const REWARDS = [
  {
    id: 'competent', file: 'competent.js',
    scorers: ['talkScore', 'fleeDirScore', 'pickTalkChoice (priority rule)'],
    X: 'Survival-with-dignity: an aware experienced player — learns, cooks, avoids disease vectors, fights with advantage, comforts the grieving, holds real conversations (answers questions first, teaches, no repeat lectures).',
    Y: 'Degenerate optimum: perfect logistics robot — never takes a real risk, grinds safe kcal forever, wins slowly and joylessly. (This is why winseek/oracle exist as counter-probes.)',
    Z: 'Bounded by the "default baseline" rule (policies/README.md): keep behavior STABLE; survival levers are measured against it, never tuned to it.',
  },
  {
    id: 'capable', file: 'capable.js',
    scorers: ['scoreOffer (ability picks)', 'contestReward − harmScore×w (contests)', 'scoreTableOption (Table)', 'answerRelic (relic picker)', 'ACTION_PLAN/SIG_PREF (signature verbs)'],
    X: 'The game as a capable player plays it: scored ability offers (synergy completion first), scored contest phases (reward minus harm, harm-weighted up when hurt), scored Table options (priced paths + light/dark branch), feast-then-fight roads, relay play.',
    Y: 'Degenerate optimum: max-extract from every scored system — takes every +EV contest choice and priced path, never declines power; reads as min-maxer chasing build value over survival margin.',
    Z: 'Bounded by: trial-by-combat hard −100 (never volunteered); harm weight w scales 1→4 when hurt/wave≥3; the ONE-BRAIN rule — when Game.buildScore exists the engine scores, the local scorer is only the fallback.',
  },
  {
    id: 'winseek', file: 'winseek.js',
    scorers: ['6-road gate pursuit (wave deed bars, 3 contests survived, national+ scale, 3 crises, feast surge used, integration ≥3)'],
    X: 'Table-gate reachability: seek encounters (never flee at start), always participate in contests, court subordinate links, answer every beat, use feastburn — every passive instinct inverted into a pursuing one.',
    Y: 'Degenerate optimum: dies maximally — engages every fight, chases deed bars regardless of cost, the run optimized for gate completion at the expense of survival. Win-seeking is the ceiling probe, not the strategy.',
    Z: 'Bounded by: all roads best-effort and try/catch-guarded; patrol cadence (~3x/week, feastbuff-gated); flee allowed near-death.',
  },
  {
    id: 'risk-aware', file: 'risk-aware.js',
    scorers: ['harmScore(choice) — expected harm from declared `do` block: dmg-range midpoint ×1.5 + die ×1000 + trauma ×25 + kcal-loss/500'],
    X: 'Fear measurement: reads contest billing, refuses high/extreme billing when hurt (<70% HP), hedges in-phase choices by expected harm (takes the minimum), ejects from fights at 45% HP, tops kcal to 90% before optional risk.',
    Y: 'Degenerate optimum: never participates — the min-harm argmin over the choice set; always picks REFUSE when offered and the mildest phase choice otherwise. The policy is the warm-pole contrast for fear, not a winning strategy.',
    Z: 'Bounded by: refuses ONLY high/extreme billing when hurt (never low billing); contest refusal is a played sequence (shame/notability), not a free pass; same survival base as competent otherwise.',
  },
  {
    id: 'kind', file: 'kind.js',
    scorers: ['competent base + never steals, shares surplus, comforts grieving'],
    X: 'The warm pole: uniform kindness — never steals, shares surplus, comforts the grieving. Measures what generosity costs.',
    Y: 'Degenerate optimum: exploited to death — gives away survival-critical food, never defends, the "nicest villager starves first" reading. That failure is data, not a bug.',
    Z: 'Bounded by: competent survival brain underneath; contrast pairing with larceny-leaning on identical seeds is the instrument.',
  },
  {
    id: 'larceny-leaning', file: 'larceny-leaning.js',
    scorers: ['competent base + steals when hungry (and on schedule)'],
    X: 'The cold pole: steals when hungry — measures the justice system (moot firings, trust/gossip response) as a consequence of real theft.',
    Y: 'Degenerate optimum: career thief — steals on schedule regardless of need, trust collapses, moot fires the scholar. The optimum of theft is eviction.',
    Z: 'Bounded by: stealing is gated on hunger/schedule, not free; competent base everywhere else; contrast with kind.',
  },
  {
    id: 'deed-seeking', file: 'deed-seeking.js',
    scorers: ['competent base + patrols, channels, always takes cameras; hunts notability deeds'],
    X: 'Notability accumulation: patrols, channels keepsakes, always takes cameras — measures deed-accumulation curves and table-bar pacing.',
    Y: 'Degenerate optimum: camera-hogging fame farmer — maximizes deeds per day at survival cost, a leaderboard without a village behind it.',
    Z: 'Bounded by: competent survival brain; deeds are engine-recorded (real deeds only — no invented magnitudes).',
  },
  {
    id: 'maker', file: 'livelihood.js',
    scorers: ['capable survival brain + studies real books/known ruins, crafts learned funded recipes, preserves a selected safe cooked batch; no deliberate hunts'],
    X: 'Builder archetype: knowledge-driven crafting from learned, funded recipes only; hidden recipes stay hidden. Measures the maker playstyle.',
    Y: 'Degenerate optimum: library hermit — grinds studies and safe batches while the village starves; never fights, never feasts-fights.',
    Z: 'Bounded by: inherits capable survival/choice/defense brain; deliberate hunts and feast-fight seeking disabled; unavoidable combat/contests remain (not a pacifist).',
  },
  {
    id: 'merchant', file: 'livelihood.js',
    scorers: ['capable brain + seeks real stock, pays real cart prices, keeps a personal meal buffer; market-dealer/market-hoarder are Miser intent cohorts on this'],
    X: 'Trader archetype: real paid trade at real cart prices; three kcalCap buffers for capacity; deliberate risk only within a 1200-kcal quote budget.',
    Y: 'Degenerate optimum: hoards personal buffer, trades while the pantry burns — merchant wealth with a starving village.',
    Z: 'Bounded by: real prices, real stock (no minted gear, no duplicate defaults); intent cohorts prefer authored subclass payoffs deliberately at survival cost.',
  },
  {
    id: 'caregiver', file: 'livelihood.js',
    scorers: ['capable brain + treats one physically present living patient/day with known medicine or real wound care; comforts visible needs'],
    X: 'Healer archetype: available treatment only, real patients only (no remote, no dead roster entries); comfort via actual visible needs.',
    Y: 'Degenerate optimum: triage saint — spends all energy on patients, lets own needs collapse; death-by-compassion.',
    Z: 'Bounded by: one patient/day cap; knowledge-gated medicine; capable survival brain underneath.',
  },
  {
    id: 'oracle-v3', file: 'oracle-v3.js',
    scorers: ['tribute-priority layer on oracleV2: pay at first upkeep of week, answer every link demand (counsel always; tribute only if pantry covers full cost; aid visit when safe; refuse never chosen), succession-watch tribute-current'],
    X: 'Measurement probe (NOT shipped AI, NOT a game tweak): asks whether vesting is reachable AT ALL by a policy that actually prioritizes tribute/trust upkeep. Extends oracleV2; survival play inherited verbatim.',
    Y: 'Degenerate optimum: tribute machine — pays every demand instantly, starves the pantry for trust points; vest-chasing with a dead village.',
    Z: 'Bounded by: honest-measurement rules — no invented proveWorth magnitudes (real deeds only), no survival-behavior change vs oracleV2, mourning-window payment deferral (zeroed trust gains), full-cost-only tribute honors (no arrears accrual).',
  },
  {
    id: 'idle.zero / idle.mvc / idle.leader', file: 'idle.js',
    scorers: ['basement bounds: zero acts nothing; mvc follows the minimal-viable loop; leader leads without personal labor'],
    X: 'Basement bounds: the worst-case policies a run can contain. zero = does nothing (death-by-neglect clock); mvc = minimal viable play; leader = delegates without labor.',
    Y: 'Degenerate optimum: zero\'s optimum is literally extinction — that IS its measurement (how long does the village last with a useless scholar?).',
    Z: 'Bounded by: they are lower bounds only; never used as tuning targets, only as floor references for "better than doing nothing".',
  },
  {
    id: 'socialite', file: 'socialite.js',
    scorers: ['competent base + talk-first prioritization via talkScore (unresolved wants +100, grieving/scared +50, stranger-first bond delta)'],
    X: 'Social playstyle: maximizes real conversation throughput — the canon want system (they want something; endings resolve/plant/owe) as the objective function.',
    Y: 'Degenerate optimum: conversationalist — talks through the famine, all comfort and no food; trust-rich and starving.',
    Z: 'Bounded by: competent survival brain; talk choices are scored, never free (NO REPEATS rule: one id per sitting).',
  },
  {
    id: 'feastseek', file: 'feastseek.js',
    scorers: ['feast-first pursuit layer'],
    X: 'Feast-centered play: seeks and hosts feasts; the FEASTED surge is the objective (hunt every day while buff is live and unused).',
    Y: 'Degenerate optimum: gorges on feasts while pantry drains — the feast economy measured to its limit.',
    Z: 'Bounded by: real feast costs, real pantry; buff-usage honesty (hunts only while buff live).',
  },
  {
    id: 'huntengage', file: 'huntengage.js',
    scorers: ['observeGame/stalkedAid/gday — engagement-layer observation policy'],
    X: 'Engagement observation: stalked-aid patterns and engagement reads layered onto survival play; measures how being watched/intervened changes outcomes.',
    Y: 'Degenerate optimum: over-intervention — aid everywhere, turning the sim into a shepherded run that proves nothing about the game.',
    Z: 'Bounded by: observation-layer scoping; engagement actions are recorded, not assumed effective.',
  },
  {
    id: 'winpursuit', file: 'winpursuit.js',
    scorers: ['withWinPursuit/layerOn — win-pursuit table-road layer (leadpursuit, belongpursuit)'],
    X: 'Layered pursuit: the table road as an add-on layer over other play, with lead/belong pursuit variants — win-drive without a dedicated policy base.',
    Y: 'Degenerate optimum: the layer dominates the base policy — every run becomes table-chasing regardless of archetype.',
    Z: 'Bounded by: layer scoping (applies only where registered); the base policy\'s own survival brain remains primary.',
  },
  {
    id: 'windefer', file: 'windefer.js',
    scorers: ['table-pursuit deferral layer — sits the ready seat, waits'],
    X: 'The waiting archetype: greedy waits while the run looks strong (Haven holds 5+ people, <3 lost while waiting, bearer >40% HP, tier under cap), measures the priced cost of Overtime (Steve\'s "a cost, but also an opportunity for the truly powerful").',
    Y: 'Degenerate optimum: waits forever — the pure cost of waiting (CAPABLE_GREEDY_RECKLESS=1 drops the strength checks, waits to tier cap or day 145).',
    Z: 'Bounded by: env-gated (CAPABLE_GREEDY=1 only, off by default); loss/roster/tier/horizon gates on waiting; the tuning dashboard measures the plain bot.',
  },
  {
    id: 'tablepaths', file: 'tablepaths.js',
    scorers: ['table-path driver: scored path selection among the 7 paths × light/dark'],
    X: 'Path coverage: drives runs toward each table path so all 14 endings are measured as real play, not declared.',
    Y: 'Degenerate optimum: path-railroading — optimizes one path\'s pricing at the cost of everything else; the "best ending" discovered by degenerate focus, not balance.',
    Z: 'Bounded by: the Table prices the run, never gates on godhood; earned paths are engine-priced (strength from actual play).',
  },
  {
    id: 'progress', file: ['progress-bal.js', 'weird-c.js'],
    scorers: ['progress policy; weird-c variants (mvc, survivalist, socialite)'],
    X: 'Progress-measurement variants: survivalist/socialite poles plus mvc baseline for progress-curve comparisons across runs.',
    Y: 'Degenerate optimum: single-axis maximization — pure survivalist outlives everything but experiences nothing; the curve is the point, not the extreme.',
    Z: 'Bounded by: identical seeds + shared tooling on both roots; contrast is between variants, never a tuning target.',
  },
];

// ----------------------------------------------------------------------------
// REVIEW CONTRACT — structural assertions: every entry is complete and every
// named file/scorer actually exists, so drift between the doc and the code
// fails loudly instead of silently.
// ----------------------------------------------------------------------------
const SELF_CHECK = [];
function ok(name, cond, detail) {
  SELF_CHECK.push({ name, pass: !!cond, detail: detail || '' });
}

(function structural() {
  const dir = __dirname;
  REWARDS.forEach((r) => {
    const files = [].concat(r.file);
    ok(`entry ${r.id}: X declared`, typeof r.X === 'string' && r.X.length > 20, r.X);
    ok(`entry ${r.id}: Y declared`, typeof r.Y === 'string' && r.Y.length > 20, r.Y);
    ok(`entry ${r.id}: Z declared`, typeof r.Z === 'string' && r.Z.length > 20, r.Z);
    files.forEach((f) => ok(`entry ${r.id}: file exists`, fs.existsSync(path.join(dir, f)), f));
  });
})();

// ----------------------------------------------------------------------------
// Scorer semantics — the declared optima and bounds are real, not prose.
//
// risk-aware: harmScore must be the exact expected-harm formula (dmg midpoint
// ×1.5, die ×1000, trauma ×25, kcal-loss/500), and its argmin over a choice
// set must be the declared degenerate optimum (the safest choice).
// ----------------------------------------------------------------------------
(function riskAware() {
  const a = { do: { dmg: [4, 8] } };       // midpoint 6 ×1.5 = 9
  const b = { do: { die: 0.05 } };         // 0.05 ×1000 = 50
  const c = { do: { trauma: 4, kcal: -1000 } }; // 4×25 + 1000/500 = 102
  const d = { do: {} };
  ok('harmScore: dmg midpoint ×1.5 exact', harmScore(a) === 9, 'got ' + harmScore(a));
  ok('harmScore: die weighted ×1000 exact', harmScore(b) === 50, 'got ' + harmScore(b));
  ok('harmScore: trauma + kcal-loss exact', harmScore(c) === 102, 'got ' + harmScore(c));
  ok('harmScore: empty do-block is zero', harmScore(d) === 0, 'got ' + harmScore(d));
  // Degenerate optimum reachable: argmin is the safest choice (d), and the
  // die-risk choice (b) outranks even moderate damage (a) — death is priced
  // catastrophically, as declared.
  const argmin = [a, b, c, d].reduce((m, ch) => harmScore(ch) < harmScore(m) ? ch : m);
  ok('harmScore: degenerate optimum (safest choice) is the argmin', argmin === d);
  ok('harmScore: death priced above moderate damage', harmScore(b) > harmScore(a));
})();

// ----------------------------------------------------------------------------
// capable: scoreOffer — the declared optimum (an offer completing a synergy,
// aligned with the held build) is actually reachable and maximal; scores are
// non-negative (lower bounded).
// ----------------------------------------------------------------------------
(function scoreOfferCheck() {
  const Game = {
    data: {
      abilities: [
        { id: 'a', path: 'hunt', role: 'payoff', pool: 'combat',
          actions: [{ context: 'combat' }] },
        { id: 'b', path: 'hunt', role: 'payoff', pool: 'combat',
          actions: [{ context: 'combat' }] },
        { id: 'c', path: 'hearth', role: 'enabler', pool: 'camp',
          actions: [{ context: 'explore' }] },
      ],
      synergies: [{ requires: ['a', 'b'] }],
    },
    hasAbility: (id) => id === 'a',
  };
  const held = ['a'];
  const sa = scoreOffer(Game, { id: 'b' }, held); // completes the synergy (+20) + shared path (+3)
  const sc = scoreOffer(Game, { id: 'c' }, held); // unrelated: jitter only
  ok('scoreOffer: synergy-completing offer outranks unrelated by >20', sa - sc > 20,
    `sa=${sa.toFixed(2)} sc=${sc.toFixed(2)}`);
  // Degenerate optimum reachable: argmax over the set is the synergy finisher.
  const best = [{ id: 'b' }, { id: 'c' }, { id: 'a' }]
    .reduce((m, o) => scoreOffer(Game, o, held) > scoreOffer(Game, m, held) ? o : m);
  ok('scoreOffer: declared optimum (synergy finisher) is the argmax', best.id === 'b');
  // Bounded below: all terms are non-negative; jitter in [0, 0.5).
  ok('scoreOffer: scores are non-negative', sc >= 0 && sa >= 0);
})();

// ----------------------------------------------------------------------------
// capable: scoreTableOption — trial-by-combat is a HARD bound (−100, never
// volunteered); a priced, earned, affordable path outranks plain options; the
// CAPABLE_READ_STAKES penalty applies only under the env gate.
// ----------------------------------------------------------------------------
(function scoreTableOptionCheck() {
  const earned = [{ id: 'relay', strength: 50 }];
  const Game = {
    tableEarnedPaths: () => earned,
    tableBranch: () => ({ branch: 'light' }),
  };
  const T = { branch: 'light', meters: { terror: 9 } };
  ok('scoreTableOption: trial-by-combat hard −100 (id)', scoreTableOption(Game, { id: 'trial_by_combat', label: 'x' }, T) === -100);
  ok('scoreTableOption: trial-by-combat hard −100 (label)', scoreTableOption(Game, { id: 'x', label: 'TRIAL BY COMBAT' }, T) === -100);
  const pathOpt = { id: 'path:relay', label: 'Relay path (needs terror 4+)' };
  const plainOpt = { id: 'rest', label: 'rest a while' };
  const sp = scoreTableOption(Game, pathOpt, T);
  const so = scoreTableOption(Game, plainOpt, T);
  // 50 (earned strength) + 8 (light branch) vs ≤ 7 (jitter 4 + light word 3):
  // the priced-path optimum is reachable and strictly maximal.
  ok('scoreTableOption: earned affordable path strictly outranks plain options', sp - so > 40,
    `path=${sp.toFixed(2)} plain=${so.toFixed(2)}`);
  // Env-gated read-stakes bound: off by default the build line is plain.
  // NOTE: this gate sits AFTER the earned-path early return, so the test uses
  // a build-labeled non-path option.
  const buildOpt = { id: 'build:terror', label: 'Scary build (needs terror 4+)' };
  const T2 = { branch: 'light', meters: { terror: 1 } }; // short of "needs terror 4+"
  delete process.env.CAPABLE_READ_STAKES;
  const sOff = scoreTableOption(Game, buildOpt, T2);
  process.env.CAPABLE_READ_STAKES = '1';
  const sOn = scoreTableOption(Game, buildOpt, T2);
  delete process.env.CAPABLE_READ_STAKES;
  ok('scoreTableOption: read-stakes gate inactive by default', sOff >= 0, 'got ' + sOff.toFixed(2));
  ok('scoreTableOption: unaffordable build option penalized −50 under gate', sOn <= 4 - 50, 'got ' + sOn.toFixed(2));
})();

// ----------------------------------------------------------------------------
// Self-check runner.
// ----------------------------------------------------------------------------
function runSelfCheck() {
  const fails = SELF_CHECK.filter((s) => !s.pass);
  SELF_CHECK.forEach((s) => {
    console.log(`${s.pass ? 'PASS' : 'FAIL'}  ${s.name}${s.pass || !s.detail ? '' : ' — ' + s.detail}`);
  });
  console.log(`\n${SELF_CHECK.length - fails.length}/${SELF_CHECK.length} checks passed.`);
  if (fails.length) {
    console.error('\nREWARD SPEC SELF-CHECK FAILED — scorer intent has drifted from its declaration. See the REVIEW CONTRACT at the top of this file.');
    process.exitCode = 1;
  }
}

if (require.main === module) runSelfCheck();

module.exports = { REWARDS, runSelfCheck, ok, SELF_CHECK };
