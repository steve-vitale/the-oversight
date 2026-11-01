# Long-run sim loop — scale-onramp round 0615Z (2026-11-01)

Coordinator: fleshout-loop-a-20261101T0615Z. Axis: scale-onramp
(converging, NOT converged). Loop B live on food-economy the whole run
(0545Z claim: eveningstep + death17549 — NOT touched; B landed both arms
mid-run as 1ae181c27, plus journey lanes; absorbed via rebase, no overlap).
Rotation file untouched (convergence override; rotation still 3).
Pre-flight: main tree clean, disk 21%, reaper removed nothing (6/16 active,
all sibling trees correctly refused). Lock + claim written before any sims.
No lock at run start (Loop A lock absent).

## Pre-registration (this run's bars, written before any sims)

Both arms DIAG ONLY (zero src/js, instrument/policy scripts only).
Arm 1 sim-s87135-traj-a DIAG-GO bar: divergence day identified +
every baseline wave-3 row classified (converted-beast lineage / other
beast / other cause) + a mechanism statement with at least one
falsified alternative hypothesis. Arm 2 sim-fullseat-recheck-a DIAG-GO
bar: 8/8 configs produce end/win full-seat snapshots with
per-component distances plus a ranked binding-blocker list, zero
UNCLASSIFIED, plus living-veteran counts and wave-5 fight counts for
comparison against 2115Z and backlog #1649. Both arms judged exactly
against these bars; no re-scoring.

## Arm 1 — sim-s87135-traj-a: DIAG-GO (LANDED a6eba6749)

Question (0515Z closeout blank 1): why did two contact-finish
conversions reroute seed 87135's whole meeting stream? Confirm-band
stack reproduced exactly for seed 87135 only (baseline rule OFF via
fieldFights.js swap to the 1a6dce59d version, verified byte-identical
and differing from HEAD by the rule block only; restored from a backup
copy, never `git checkout`; `git diff HEAD` verified empty before the
lever leg). Baseline: 47 wave-3 rows, 11 finishable CONTACT meetings,
national 1, table 0, won 0, 144d village-lost. Lever: 6 wave-3 rows,
2 attempts, national 0, table 0, won 0, 163d village-lost.

Mechanism, in plain words: the rule does not reroute the village by
removing Spool meetings. It hands the village the key to wave 4, 48
days early — and wave 4 makes the whole village hide indoors for
weeks. Day 85: Sigrun strikes a 17-HP Spool with her crowbar for 10
(7 left, beast breaks away; baseline same meeting flees untouched
with the old bow lie). Day 87: Francisco kills a 7-HP Spool with the
fire-hardened spear (16 damage) — the run's FIRST wave-3+ kill
(baseline first wave-3+ kill is day 135, also a Spool, and wave 4
unlocks the same day: the first wave-3 kill is the wave-4 key, per
the readiness veterans bar of 1 living villager with a wave-3+ kill).
Day 88: wave 4 opens (baseline day 135). A wave-4 Algorithm (1000 HP)
spawns at (3,3), distance 1 from Haven (4,4), inside muster radius 2.
Day 89: the game-side auto-muster shelters all 10 non-scholar
villagers behind the barricaded hall door; sheltered count stays 10
through day 120, easing to 6 by day 130 and 2 by day 150. Baseline
never shelters once in 144 days. Sheltered villagers are filtered
out of the wild-encounter router: post-87 wild opportunities 192
(baseline) → 5 (lever), fights 95 → 4, while the tick's
fight-per-opportunity rate stays healthy (0.80 vs 0.50) — nobody is
on the treeline to be jumped. The bill: the sheltered village lives
longer (163d vs 144d, both village-lost) but ends regional where
baseline ends national. Correction to the confirm's framing: "no
national on lever" is end-state only — mid-run the lever leg peaks
at GLOBAL on day 125 (baseline: national), then falls back to
regional by day 163 as the long shelter drags on.

Divergence day: day 85 (first differing field: world-monster roster,
Spool HP 17 vs 7). Classification of all 47 reproduced baseline
wave-3 rows: 12 converted-beast lineage (Spool, day ≥ 85; type-level,
world entities carry no stable instance id) + 35 other beast
(Callback 11, Focus Group 9, Redactor 9, Chorus Line 3, pre-85 Spool 3)
+ 0 other cause. Post-87: baseline 43 wave-3 rows (all wild caller)
vs lever 1 (expedition); total fights post-87 collapse across all
waves (109 → 17).

Falsified alternatives (prereg order): (a) killed-entity removal
cascade — FALSIFIED as main mechanism (Spool lineage only 12/47;
32 other-beast post-85 rows vanish too; lever roaming population
not depleted, 25 → 34 monsters, spawns 56 vs 49). (b) Location
divergence — FALSIFIED for scholar tile (identical all 144
shared-window days; villager nodes diverge from day 87 on RNG shift
but tick opportunities still collapse because the tick filters
sheltered villagers). (c) Scholar/roster change — FALSIFIED as
driver (roster identical until day 119; scholar HP/kcal identical
until day 87). (d) Gate-timing shift — CONFIRMED as the link
(wave-3 rung never differs; wave-4 gate shifts day 135 → 88).
(e) Survival-length calendar shift — FALSIFIED (divergence starts
day 85, collapse lands days 89+, before baseline's day-144 end).
(f) RNG-stream shift — CONFIRMED as trigger, NOT sufficient alone
(first post-strike fight difference day 86; first spawn difference
day 87; a reshuffle cannot suppress fights 8× over 76 days while
the per-opportunity rate stays normal).

Sense-reads (3): lever d85 Sigrun honest on weapon/damage/remainder/
flight vs baseline's bow lie for a crowbar-armed fighter; lever d87
Francisco a real single strike with the held spear named, beast
already at 7 HP — a mercy blow that later locks the village
indoors; the d88–89 muster beat itself was NOT captured (the
contactfinish recorder's say-line filter keeps only wave-3-named
lines; the muster names a wave-4 monster) — proven by state (10
sheltered from day 89, Algorithm 1 tile from Haven) + code. Recorder
gap filed to the backlog.

Proof: scripts/test-s87135traj-a.js 27/27 (post-rebase re-run also
27/27). Commit a6eba6749 (16 files, zero src/js; rebased once onto
b2f09444b, clean). Caveats carried: (1) standing arithmetic not
decomposed — whether the day-87 kill tipped standing over t4 via
blood or standing was already over t4 with veterans as sole blocker
is not separately instrumented; the kill is the trigger either way.
(2) One seed, one stack — no general trajectory-safety verdict; a
future safety claim needs a band-level check for early-gate
acceleration + muster episodes. (3) The shelter episode itself is
working-as-designed (auto-muster + shelter cost are documented
design); whether a 40+-day shelter from one early wave-4 sighting
is intended tuning is a design question for Steve, not a bug claim.

## Arm 2 — sim-fullseat-recheck-a: DIAG-GO (LANDED c265fb7cf)

Question (0515Z closeout blank 3): the full-seat path on current
master, with contact-finish landed. Tableseat-nowait substrate +
scripts/policies/fullseat-diag.js and vet2-diag.js reused UNMODIFIED,
180d death-aware, fresh seeds 78201–78208. Freshness: prereg
originally named 76201–76208, but the freshness grep caught those
as already used by sim-witnesource and sim-linkgen-a — the band was
replaced wholesale before any sims, and 78201–78208 verified clean
against corpus filenames, dated evidence .md files, and the
forbidden bands 73641–73648, 73671–73678, and the 871xx confirm
band. Base HEAD 1c21a87fd, contact-finish confirmed as an ancestor.

Wall numbers (armed, 8 seeds): won 1/8 (78206, lesser seat, feared
path, day 90); national ever 5/8, national final 1/8; table reached
3/8, entered 1/8 (lesser), enteredFull 0/8; wave 4 reached 7/8,
wave 5 reached 0/8, full seat 0/8; median run length 164d, max 180d
(2 seeds survived to cap).

Ranked binding blockers (end snapshot; max-distance medians
identical — no village was ever closer mid-run than at its end on
any deed component): 1. w5 — 8/8, median distance 2. 2. w3 — 5/8,
median 1. 3. w4 — 4/8, median 1. 4. foodDeeds — 4/8, median 1
(always the feastSurgeUsed half; sentimentTaught true on 8/8).
5. w2 — 1/8 (78207 only). 6. contests — 1/8 (78207 only). w1,
crises, stage — 0/8. Zero UNCLASSIFIED.

Veteran counts + wave-5 fights: living wave-4+ killers (vet5) max 1
(seeds 78201, 78208), 0 on the other six, 0 at end on all eight —
never 2. Living wave-3+ killers (vet4) max 2 on 78202 and 78206 (the
winner holds 2 living wave-3 killers at its win); end vet4 = 2 only
on 78206. Wave-5 distinct fought 0/0 (end/max) on all eight;
wave-5 kills 0. Closest seed 78201 meets every full-seat bar at end
AND at closest approach except w5 (distance 2); its end-state
deferral short list is [weapons (4/6 armed), veterans (0/2)].

Comparison, in plain words: the contact-finish rule did NOT move
the full-seat path. 2115Z ranked w5 8/8 at distance 2, w4 6/8 at 3,
w3 6/8 at 2, foodDeeds 6/8 at 1, full seat 0/16, wave 5 0/32. Here w5
is identical (8/8, distance 2), while the other bars tightened
(w4 4/8 at 1, w3 5/8 at 1, foodDeeds 4/8 at 1) — villages get closer
on everything except the one bar that matters. Backlog #1649
reproduces on the veteran count (max 1 living wave-4+ killer vs
demand 2; the winner never faced wave 4 at all, w4 = 0), with a
refinement: on the closest seed the end-state hold beat names
WEAPONS as well as veterans ("put weapons in hands (4 of 6 armed);
blood your fighters (0 of 2 veterans)", day 179), not veterans
alone as 2115Z read it. Whether weapons-short persists at closest
approach or is end-state decay is unmeasured (no daily rd5short
series) — left for the next band.

Sense-reads (2): 78201 (closest-to-full) — the endgame voice is
honest about the wall; the day-179 hold beat names both short bars,
and day-180 overtime ×2 docks standing −8 and says "Take your seat
from Haven to stop the clock." The village holds a priced lesser
seat 16 days (first lesser day 165) and never sits while the clock
ticks. 78206 (the win) — a coherent, complete win; the audit reads
truthfully ("A lesser seat — national standing, waves 1–3 faced
(17/7/4), 9 contests survived, 3 crises weathered. The table does
not rise. It prices.") and even names the unmet bar inside the
victory ("Even now the wave-5 bar reads: blood your fighters (0 of
2 veterans)"). Nothing pretends wave 4 or 5 happened.

Proof: scripts/test-fullseat-recheck-a.js 55/55 (post-rebase re-run
also 55/55); G1 det-gate PASS (recorders unset: 180/181 days, ts
identical, no recorder surface); G2 recorder neutrality PASS 8/8;
G3 corpus integrity PASS; determinism leg PASS (judged 78201-armed
JSON byte-identical to scratch re-run, 3,582 bytes; scratch
deleted); analyzer independently reproduces the sweep verdict.
Commit c265fb7cf (26 files, 15,086 insertions, zero src/js;
rebased once onto a6eba6749, clean). Worker note: safe-commit
index clobber struck the worker commit (26 files shown
staged-deleted after a correct commit); the worker's first repair
used a non-recursive ls-tree and created 17 slash-less bogus index
paths — caught, removed, and repaired from verified HEAD blobs
(all 17 worktree files hash-matched HEAD). The commit itself was
always correct; coordinator verified worktree clean + stat clean
before rebasing.

## Wall (this run's judged corpora)

Fullseat-recheck band (16 configs, armed+baseline on 8 seeds):
national ever 10/16, table 6/16, wins 2/16 (both legs' winner is
78206-class lesser), full seat 0/16, wave 5 0/16, median 164d.
Contactfinish trajectory (seed 87135, both legs): full seat 0,
wave 5 0, wave 4 unlock day 135 → 88 under the rule. Wall UNCHANGED
in substance: full seat 0 / wave 5 reached 0 stand as last measured
(Loop A lane). scale-onramp stays converging (NOT converged): the
s87135 mechanism is now accounted and the full-seat path is
re-measured on the landed rule with the same binding bar, but no
wave-5 or full-seat reachability is shown. food-economy untouched
(sibling Loop B lane).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-01/perseed-fullseat-recheck-a/*.json' --metrics
national,table,wins,exiled` → 3 LOUD lines (national 12→0, table
−62% 16→6, wins 16→0, n=17 files). INVESTIGATED, all artifacts,
baseline NOT rolled: (1) the baseline's own _regime note forbids
this comparison — it is the WINSEAT full win-side stack
(12/16 national, 16/16 table/wins), while this corpus is a
tableseat-nowait diag substrate where wins are structurally rare.
(2) Field-shape: per-seed rows carry `won`, `nationalEver`, and
`table`, never top-level `national`/`wins`, so the script reads 0
for both regardless of content (verified: armed-leg truth is won
1/8, table 3/8, nationalEver 5/8; pooled won 2/16, nationalEver
10/16). (3) The glob's n=17 includes summary.json, which carries
no per-seed fields. No investigation item beyond this note.

## Infrastructure

- Worktree registration slow (~3 min for two trees under sibling
  load; retries only, no force). Reap at pre-flight removed nothing.
- Master moved under the run (Loop B eveningstep+death17549
  landing 1ae181c27, journey lanes, Loop B new round trees) — both
  arms rebased clean in their own worktrees, proofs re-ran green
  after every rebase, merged --ff-only in sequence (a6eba6749,
  c265fb7cf). Trees released done-merged, branches deleted, main
  tree clean at closeout.
- Safe-commit index clobber: hit the worker-2 commit (repaired by
  the worker, verified by the coordinator); hit the worker-1 commit
  in its earlier run (repaired there). No clobber on either
  coordinator merge or this coordinator evidence commit — verified
  below before claiming clean.
- check.js --quick NOT re-run: zero src/js on both arms, arm proofs
  are the landing verification (27/27 + 55/55 post-rebase); the
  standing 284/6 pre-existing profile was last recorded by the
  0515Z run on the same base family. Cited neither as pass nor
  failure.

## Metric review (for the NEXT run, not these verdicts)

- End-state rank understates mid-run scale (lever 87135 peaks
  global day 125, ends regional): trajectory arms should report
  peak rank alongside end rank. Backlog line filed.
- The contactfinish say-line filter (wave-3 names only) misses the
  muster/shelter beat — the most consequential narration in the
  s87135 trajectory. Backlog line filed.
- Fullseat-recheck endDist == maxDist on all 8 seeds is itself a
  finding (no mid-run closeness lost), but it also means the
  weapons-short question needs a daily series, not another
  end-snapshot band.
- The 0515Z "do NOT re-litigate the 2/3 confirm rate" instruction
  was honored: no contact-finish rate re-measurement in this run.

## Findings appended (4 lines, see sim-findings.md)

- contactfinish say-line filter misses the muster beat.
- Peak rank alongside end rank for trajectory arms.
- 78201 held a priced lesser seat 16 days without sitting while
  overtime ticked to ×2.
- Closest seed 78201 ends short on weapons (4/6) as well as
  veterans (0/2), not veterans alone.

## Next blanks, in order

1. Band-level trajectory-safety check for early-gate acceleration +
   muster episodes (s87135 caveat 2): does early wave-4 unlocking
   + long shelter recur, and is a 40+-day shelter from one early
   wave-4 sighting intended tuning? Steve design question, not a
   bug claim.
2. Daily rd5short series on 78201-class seeds: does weapons-short
   persist at closest approach, or is it end-state decay?
3. Seat-taking hesitation: why 78201 holds a priced lesser seat 16
   days without sitting while overtime ticks to ×2.
4. The full-seat wall itself: veterans-2 manufacture remains the
   binding gap (w5 8/8 at distance 2, vet5 max 1, never 2, wave 5
   0/16) — a vet2 arm must address manufacture, per #1649.

Claim deleted; lock deleted. Merged locally, pending ship.
