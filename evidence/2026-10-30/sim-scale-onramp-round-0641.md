# sim-scale-onramp-round-0641 — recurrence-first + expedition-awareness

Run: flesh-out loop, run fleshout-20261030T0641Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Sibling loop B live on
food-economy the whole run (0635Z claim: woodwarm + bedroll at run
start; B landed 3f59a3f66 mid-run and opened new trees after this
run's merges) — NOT touched. This run worked scale-onramp, taking
the 0533Z run's ranked-next items in order: the recurrence-first
measurement and the expedition-awareness instrument — not another
fight-price arm, not a damage buff on chainclose pricing alone.

Both arms DIAG ONLY, measurement only, zero src/js game changes, no
default flip, no gate move, no deed-bar move. Merged locally,
pending ship. No push, no version bump, no live verification (the
batch ship job owns deploys).

## Pre-registration (binding, per arm)

- sim-recurrence-a: prereg ae1a4b5af (rebased 3ee3faa97) + correction
  5669fe527, committed BEFORE any judged analysis. Primary metric:
  recurrence-fate classification of every wild wave-4 chain on the
  chainclose band. GO bar: 16/16 valid seeds, joins 100%, 0
  UNCLASSIFIED chains, determinism gate (1 seed byte-identical),
  sense bar (all first-meeting transcripts read). Horizon 180d
  death-aware; seeds 75101–75116; substrate tableseat-nowait exactly
  as chainclose used it (verified from chainclose's sweep).
- sim-expaware-a: prereg e9873a75 (rebased 2dc921449), committed
  BEFORE any judged analysis. Primary metric: caller/awareness
  census + warned classification of every wave-4 meeting. GO bar:
  all seeds valid, joins 100%, taxonomy OTHER = 0, 0 UNCLASSIFIED
  wave-4 meetings (signals proven UNMEASURED counted separately),
  wave-4 n >= 5, determinism gate, sense bar. Horizon 180d
  death-aware; seeds 75101–75132; substrate tableseat-nowait + the
  full evadeshape recorder stack (verified from evadeshape's sweep).

## Arm 1 — sim-recurrence-a: DIAG-GO (LANDED)

Commits (rebased onto 2138ad07e, fixtures re-run green post-rebase,
merged --ff-only): prereg 3ee3faa97, correction cfb5dbebc,
instruments 9a9060ca5, evidence + corpus abe3e6414. Proof on merged
master: scripts/test-recurrence-a.js FIXTURES-PASS 45/45.
Substrate equivalence: 16/16 rows byte-identical to chainclose's
corpus — the census wrapper provably did not perturb the game.
Determinism: seed 75102 re-ran byte-identical (row + census),
scratch removed. Sense: 12/12 logs read.

Plain words: most wave-4 beasts are met once and never seen again,
and now we know why, chain by chain. Of 10 wild wave-4 chains:

| Fate | Chains |
|---:|---|
| BEAST-VANISHED | 4 (s75102 algorithm n=4, s75102 eulogy n=4, s75116 audit, s75116 suburb) |
| NEVER-CROSSED | 4 (s75102 audit, s75102 herald, s75110 reunion, s75114 audit) |
| VILLAGE-GONE | 2 (s75102 reunion, window 7d; s75113 audit, window 5d) |
| FINISHED / STILL-PRESENT / UNCLASSIFIED | 0 |

Every VANISHED verdict passed an all-HP census cross-check (no
vanished instance reappeared at a different HP). Neither host seed
entered the table, excluding the finale wipe, and 0 later
same-type meetings exclude villager removal — leaving scholar
turn-based encounters as the remaining code path: ordinary wild
monsters melt away on scholar flee/loss, titans/lingering only are
restored. That split (scholar-kill vs scholar-flee-melt) is
unmeasured and is ranked next blank #1. NEVER-CROSSED splits in
two: the s75102 pair sat on tile (4,4) through 4 aid-crisis
callback fights without meeting anyone (tile presence is not a
meeting — caller split required, finding F-3), while s75110 (3
field days in 61) and s75114 (2 in 45) barely went out as their
beasts drifted 4–5 tiles away. Both recurring chains end VANISHED,
not never-crossed. Raid wave-4 (n=4) stays INSUFFICIENT-DATA.

## Arm 2 — sim-expaware-a: DIAG-GO + WAVE-4-CHARACTERIZED (LANDED)

Commits (rebased onto 2138ad07e, then onto abe3e6414 after the
recurrence merge, analyzer re-run green after both, merged
--ff-only): prereg 2dc921449, instruments 3efdda7bc, evidence
8a66fe916, corpus part 2 8ac9686b3. Proof on merged master:
scripts/test-expaware-a.js MACHINE-LEGS-PASS (completeness,
classification, wave-4-n, OTHER = 0); taxonomy audit PASS (75101
pilot, 6 pairs covered); determinism PASS (seed 75120 re-ran
byte-identical, 916,709 bytes, scratch removed); sense PASS (all
35 wave-4 first-meeting transcripts read + 7 warned-repeat
transcripts post-hoc, disclosed).

Plain words: who meets a wave-4 beast, and whether they saw it
coming, does not change whether they live. Caller census (4,379
meetings): expedition/other is the ONLY awareness-eligible caller
(571 meetings: evade 327/57.4%, scatter 0, fought 243); every other
caller scatters or fights with zero evades. Code table: 11
fieldFight sites mapped; only villager-agency's expeditionMonster
passes awareness:true. Scatter collapses with wave on every
non-expedition caller (resolve/field 72.7% → 0.0% at wave 4;
resolve/raid 72.9% → 13.0%; aid/field 91.3% → 0.0%), while the
expedition evade rate is wave-independent (54% → 60%). Wave-4
(n=100; FLEE 64, DEATH 29, EVADE 3, SCATTER 3, DRIVE-OFF 1, KILL 0):
WARNED-NARROW = 65 and WARNED-EXPANDED = 65 — identical, because
same-individual (W3, 44) is a subset of prior-type (W1, 65) by
definition, fixture-proven and corpus-confirmed. Scout/rumor/shout
are UNMEASURED on all 100 meetings (counted separately, never
proxied: no type-specific scout report exists in code, no
monster-warning gossip kind, no pre-contact shout listener
record). Warned vs unwarned wave-4 survival is identical (FLEE
64.6% vs 62.9%, DEATH 29.2% vs 28.6%, KILL 0 vs 0). The damage gap
(warned mean 15.7 vs unwarned 25.4) is fully the Eulogy trick:
trickKnown ⟺ mDealt=0 ⟺ "contradicts the narration" lines, 21/21
both directions; non-Eulogy warned vs unwarned damage is identical
(25.3 vs 27.5). The single wave-4 drive-off is a trick-played
Eulogy fight (Jovan, s75129 d81); trick play does not improve
survival (death 19% vs 22%). All 35 wave-4 first meetings are
unwarned. Drift (diagnostic, not a leg): 30/32 seeds
byte-identical to evadeshape's corpus; 75104 (small) and 75120
(100d lost → 180d survived, wave-4 meetings 2 → 15) split late
with zero src/sweep-effective changes; mechanism unestablished,
detgate passes within-run; this corpus is the baseline per prereg.

## Wall numbers (this run's judged corpora, report-only)

- Recurrence band (16 seeds, identical to chainclose by
  byte-identity): wins 9/16 (full 0), national ever 13/16, final
  11/16, table 12/16, entered 9/16, wave reach 16/16/14/9/0, median
  survival 118d, deaths 527. Wild wave-4 contact 5/16 seeds.
- Expaware band (32 seeds): wins 14/32 (full 0), national ever
  23/32, final 19/32, table 22/32, entered 14/32, wave reach
  32/32/29/20/0, median 118d, deaths 1,122 (combat 41.0%).
  Unlock-vs-contact: 20/32 unlock wave 4, 13/32 meet one.
- Across both: full seat 0, wave 5 0, wave-4 kills 0 (now on 100
  wave-4 meetings in the expaware band). No gate number was moved
  on this evidence, per the 2026-10-29 gate-sequencing note (prove
  behavior normal before tuning gates to it).

## Reachability verdict

Waves 1–4 reachable; wave 5 unreachable on every band in this run
(0/48 seeds); the table reachable only through the lesser seat via
default-OFF instruments (entered 9/16 and 14/32); the full seat
unreached; wins only lesser, only via those instruments. The two
new measurements narrow the wall rather than moving it: chains do
not recur because beasts vanish (scholar-encounter melt) or are
never crossed (tile presence without meeting, or villages that
barely go out), and warning does not save wave-4 fighters.

## Village assessment (plain words)

The village in these bands is a place that meets its hardest
beasts once, by accident, and then loses track of them. A beast
that survives a meeting does not linger as a known threat to be
hunted down — it is gone from the record, or it drifts away while
the village stays home, or the village itself dies within a week
of first contact. When a wave-4 meeting does happen, foreknowledge
makes no difference to survival: warned and unwarned fighters die
at the same rate, flee at the same rate, kill nothing. The one
thing that does change a fight's shape is knowing the Eulogy's
trick — and even that only changes the narration, not the odds.
Villagers in the transcripts read as people meeting something
terrible without a plan for a second meeting, because the game
gives them no second meeting to plan for.

## Blanks filled or documented

Filled (measured, not built): recurrence fates for all 10 wild
wave-4 chains; the fieldFight caller/awareness census; the
warned-narrow vs warned-expanded identity; the Eulogy trick lock.
Documented, not built: the scholar tb-combat melt split, the
routing census for the s75102 pair, the outing-rate question for
s75110/s75114, the spawn-HP variance census, the wave-4
forced-fight Steve-call, the expedition-awareness predictor
instrument, and the rare-split nondeterminism on 75120. No fix
landed in game code this run; both arms were measurement only by
design, following the 0533Z direction.

## Metric review

Both preregs held as written; no mid-run re-scoring. Two notes for
the next run: (1) the recurrence fate taxonomy needs a tb-combat
split before it can price the VANISHED sink — the current fate is
a bucket, not a mechanism, at its split; (2) the expaware warned
definition should keep scout/rumor/shout as an explicit UNMEASURED
class until a recorder exists — proxying them from type contact
would collapse the expanded definition into the narrow one by
construction, as W3 already does. The telemetry-check field-shape
note below is a standing instrument caveat, not a metric change.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-10-30/perseed-<arm>-a/*.json' --metrics national,table,wins,exiled` on both
corpora: 2 LOUD lines each (national 12 -> 0, wins 16 -> 0);
table + exiled clean. EXPLAINED artifact, baseline NOT rolled:
the script reads top-level national/wins fields that these
per-seed rows do not carry (rows carry nationalEver/entered/won),
while each corpus's own wall numbers contradict "disappeared"
(recurrence wins 9/16, national ever 13/16; expaware wins 14/32,
national ever 23/32). This is the same KNOWN WINSEAT-baseline
regime + field-shape artifact class recorded by every scale run
since 1955Z.

## Infrastructure

Worktree registration slow (~7 min for both trees, git restat
class, not a failure). Master moved twice under the run (sibling
B round 3f59a3f66 + journey landing r73 2138ad07e) — both branches
rebased clean in their own worktrees (recurrence once, expaware
twice), zero file overlap, proofs re-run green after every rebase
(recurrence fixtures 45/45, expaware MACHINE-LEGS-PASS) and on
merged master. Safe-commit index clobber hit all worker commits;
repaired via HEAD-blob cacheinfo each time, commits verified
correct; no clobber on the coordinator merge path (merges are
--ff-only, no new commit). No EPERM flap this run. Reaper note at
closeout (not mine, left alone): journey2-social has uncommitted
changes, never auto-removed. check.js --quick NOT re-run: zero
src/js, zero green-list files; the standing 280/7 pre-existing
profile was recorded by the 2215Z/2315Z runs.

## Ranked next blanks (in order)

1. TB-combat recorder: split the vanished 4 into scholar-kill vs
   scholar-flee-melt-away (recurrence #1).
2. Wave-4 forced-fight Steve-call: wild wave-4 never scatters and
   warning does not change survival — rule whether wave-4
   meetings should be near-unavoidable fights before tuning
   anything (expaware #1).
3. Routing census: why worldTick routing never fired for the
   s75102 pair (player tile-entry frequency, 50% roll,
   shelter/rest, crisis consumption).
4. Outing-rate measurement: what keeps s75110/s75114 home (2–3
   field days in 45–61 days).
5. Expedition-awareness predictor instrument: capture tracking XP
   + abilities at expedition meetings (evadeshape ranked-next #1,
   still open).
6. Join-effectiveness prereg (chainclose observation, still open):
   allies 7.5% of wave-4 damage — needs its own prereg before any
   verdict.

scale-onramp stays converging (NOT converged): recurrence and
warning are now measured, not guessed, but the full seat is still
0, wave 5 is still 0, wave-4 kills are still 0, and wins still come
only through default-OFF instruments and the lesser seat. The
directive stands until the tracker records this axis converged on
measured evidence. food-economy stays converging (untouched;
sibling loop B lane). Claim deleted; lock deleted.
Evidence: evidence/2026-10-30/sim-scale-onramp-round-0641.md
(coordinator) + sim-recurrence-a-prereg.md + sim-recurrence-a.md
+ perseed-recurrence-a/ + sim-expaware-a-prereg.md +
sim-expaware-a.md + perseed-expaware-a/ (all on master, merged
locally pending ship).
