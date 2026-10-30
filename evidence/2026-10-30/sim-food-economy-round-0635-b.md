# sim-food-economy-round-0635-b — coordinator evidence (Loop B, axis food-economy)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T0635Z.
Axis: food-economy (second non-converged axis; sibling loop A live on
scale-onramp the whole run under claim fleshout-20261030T0533Z,
arms sim-evadeshape-a + sim-chainclose-a, NOT touched — A closed
mid-run as coordinator commit 43ea03a02, and playtest-loop journey
r56 landed as ed9e22516; both worker branches rebased cleanly onto
each new master and re-proven before merging, see Infrastructure).

Pre-flight: main tree clean, disk 18%, reap 3/16 active at start
(sim-lackingline3-b held, sim-evadeshape-a, journey-scale — all
untouched; journey-scale's uncommitted changes left alone).

Note on the previous B run: run fleshout-loop-b-20261030T0230Z
landed both its arms on master BEFORE this run started
(sim-raidnamefix-b 1aaeb7343 + evidence 561bbbd86, [needs-eyes];
sim-woodshort-ledger-b evidence 7ec9ed828 + prereg d3d938511),
but left no coordinator round commit and no tracker entry. Those
outcomes are recorded here so the history is not lost; this run
did not re-do them, and its tracker entry covers both.

## Arm 1 — sim-woodwarm-b: GO, measurement only, zero src/js

Backlog #1456 wood-short sub-item, following sim-woodshort-ledger-b
(INSUFFICIENT-DATA): the cooking-campfire staging route could not
fire because the bot's stranded nights are foodless. This arm tests
the ledger run's named next path — a fire for warmth, no food
needed, spending 1 bridge log per successful fire.

Pre-registration committed before any judged leg (ffc1e11c0, base
c795e7e25). Bank: the 10-seed qualifier bank (15003, 15009, 15091,
15211, 15215, 15220, 15221, 15337, 15376, 15439), 30 loop-days,
POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1 plus the warmth policy
(scripts/policies/woodwarm.js, measurement only).

Result: ON+warmth 21 creek evenings, 11 still-refused, 10 rescued;
still skips kcal-short 3, ticks-short 1, WOOD-SHORT 7 — GO bar was
>= 2. All 7 staged evenings are seed 15215, each after a warmth
log-spend with no intervening haven-morning refill: spend night 9
(4→3) → nights 10, 11; spend 11 (3→2) → night 12; spend 12 (2→1) →
night 13; spend 13 (1→0) → nights 14, 15, 16. Window ends day-17
morning when the carry refills 0→4. Warmth acted 6, log-spent 4,
fire-failed 2 (friction lottery, honestly no spend). Guard leg
(warmth off) reproduces the ledger ON census EXACTLY (15 creek /
4 still / 11 rescued, wood 4 on all 15) — no base drift on this
bank. Sense-read PASS on nights 9–13 full tails. Proof
scripts/test-woodwarm-b.js ALL GREEN, re-run green after both
rebases and post-merge in the main tree.

Caveat carried forward (do NOT over-claim): unconditional warmth
fires trap the bot — guard 15215 strands days 7–9 only (day 10 the
bridge builds and it goes home), while ON 15215 strands days 7–16
because each spent log is a bridge log lost. This run proves the
line CAN play honestly; it does NOT propose warmth-every-
stranded-night as a bot default. The Steve-call stays open:
should the bot learn warmth fires, and with what restraint (never
spend the last bridge logs, or only when rescue is out of reach),
versus leaving it a real-player behavior? The ledger run's
narrower claim ("unplayable under competent+nighttravel bot
play") is superseded for the warmth purpose only. Full detail:
evidence/2026-10-30/sim-woodwarm-b.md (merged 17f61476d).

## Arm 2 — sim-bedroll-b: GO, narration fix [needs-eyes]

Findings item 2026-10-28 (food-economy/narration): "EYES ON YOUR
BEDROLL" fired for never-slept players (dawnhall: 10712/10720
sleep refused, player waited awake in the hall).

Pre-registration committed before any judged leg (3f041e5a7, base
c795e7e25). Band 10710–10725, 30 loop-days, dawnhall substrate.
Baseline re-derived on the pinned base (old dawnhall miss mornings
drifted under sibling landings; drift proven tracer-innocent by
re-running the unmodified dawnhall driver): 30 raid player-line
nights, 4 never-slept bedroll lies, 26 slept bedroll nights.

Fix (src/js/havenGrowth.js havenRaidTick only): the line branches
on the game's own _sleeping flag — asleep players hear the
byte-identical bedroll line; awake players hear the same sentence
ending "eyes on you." No spawn, draft, damage, crisis, pantry, or
economy value touched. After: 30 nights, 0 lies, all 4 replaced
1:1 at the same (seed, night) — 10712/morning 8, 10712/morning 20,
10717/morning 10, 10720/morning 16 — slept nights unchanged
26 → 26. Neutrality: zero non-stack diffs on all 16 seeds;
stack-normalized corpora fully equal; deaths 119, wave kills 77/9,
max-wave shape identical. _sleeping agreed with transcript
markers on all 60 player-line nights, 0 disagreements — a verified
signal, not a guessed condition. Proof scripts/test-bedroll-b.js
PROOF-GREEN T1–T6, re-run green after both rebases and post-merge.
Commit carries [needs-eyes] (narration change needing Steve's
phone eyes). Browser ordering of the raid line and the
hall-shelter question explicitly untouched. Full detail:
evidence/2026-10-30/sim-bedroll-b.md (merged 03bc53381).

## Village assessment (plain words)

The banked villages are working villages in a short window: all 10
woodwarm-bank villages survived 30 days on both legs (ceiling
effect of the window + banking selection, not a survival claim),
wave 1 in 10/10, wave 2 in 10/10, waves 3–5 not reached in 30 days.
The warmth trajectory's extra stranded days cost a few more
death-log entries (110 vs 109 guard) without changing combat.
The bedroll band's villages are the familiar dawn-raid shape:
raids arrive, people sleep or wait awake in the hall, and now the
line tells the truth about which one happened.

## Wall numbers

NOT OBSERVABLE on 30-day evening legs (pre-seat, no field) for
both arms — reported, never zeros. No national, table, or win
claim is made or implied by this run.

## Telemetry deviation check

On both corpora (woodwarm ON, bedroll after): 3 LOUD lines each
(national 12→0, table 16→0, wins 16→0) — the KNOWN WINSEAT-baseline
vs pre-seat regime artifact; exiled clean. Baseline NOT rolled.

## Metric review

Pre-registered metrics bound both arms and both were judged
against their headers only. Woodwarm: the GO bar (>= 2 staged +
sense pass) was met at 7 staged; no bar was lowered. Bedroll:
the GO bar (>= 1 reproduced case fixed + neutrality + sense)
was met at 4 fixed; the baseline was re-derived on the pinned
base rather than quoted from dawnhall, per the drift rule.
Revision for the NEXT run: any future warmth-default proposal
needs its own prereg with a restraint rule (last-bridge-log guard
or rescue-out-of-reach gate) and a strand-length guard, judged
against the guard trajectory — never folded into this run's
staging verdict.

## Infrastructure

- Woodwarm merged --ff-only first (17f61476d); bedroll's
  --ff-only then failed (master had moved under it) — rebased
  onto the new master in its worktree, proof re-run green,
  merged --ff-only (03bc53381). No conflicts, no force.
- Safe-commit index clobber hit worker commits on both arms;
  repaired via HEAD-blob cacheinfo each time, commits verified
  correct, worktrees clean at closeout.
- Post-merge proofs in the main tree: woodwarm ALL GREEN,
  bedroll PROOF-GREEN T1–T6.
- check.js --quick in the main tree post-merge: 290 scripts,
  exit 0 (covers the bedroll worker's missed check — it had
  killed its attempt under sibling jest load rather than
  contend; no green-list test asserts the bedroll line).
- No push, no version bump, no live verification. Merged
  locally, pending ship (ship loop owns deploys).
- Held sim-lackingline3-b branch + worktree left registered
  with a FRESH heartbeat, NOT merged, NOT deleted (superseded
  by lackingline4 on current master, but the only record of
  the old-base result; a later B run may release it).
- Claim deleted; lock deleted.
