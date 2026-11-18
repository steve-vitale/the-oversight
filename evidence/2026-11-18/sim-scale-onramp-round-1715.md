# sim-scale-onramp-round-1715 — coordinator evidence

Run fleshout-20261118T1715Z, Loop A, axis scale-onramp. Loop B live at run
start on winnability chain (fleshout-loop-b-20261118T1735Z: partysize4-b,
NOT touched; B still live at closeout — lock + claim present). This run
took the 1515Z next blanks (1) seedplan-b re-registration and (2) the
field-engine carrier port, on the shared pilot band 104601–104608 (the
same band the 1515Z arms ran, so baselines stay comparable across arms).
Master at run start c4a9ba498; at closeout 41a47a7b9 (moved twice under
the run: batch ship bump 5c1976462 + journey succession r233
9704401d1/41a47a7b9 — zero overlap with either arm). No merge from this
run: BOTH arms NO-GO, both HELD on their branches.

## Arm 1 — sim-wildavoid-seedplan-b: NO-GO (confirm), fix HELD

Branch `sim-wildavoid-seedplan-b`, tip 5a4700a4c (fix ba5568812 ←
4f5feae78, driver 65e0ebc07 ← 646f661b1, prereg 594e27716, instruments
877c5387f, evidence 5a4700a4c). Worktree clean, NOT on master. The
re-registered confirm of the held seedplan fix with corrected bars
(finding #2556).

Pilot (8 seeds 104601–104608, 150d, identical seeds; ctl = avoid on, no
seed; arm = avoid + seed): reproduces the 1515Z corpus EXACTLY (268/268
v4seeds rows identical except the caller-frame fix and the 4 `wild-avoid`
labels). All pilot bars pass under the corrected bars (B1 ratio 1.0,
B2 5/5, B3 18/18 deaths and 2,528/2,528 flee damage, B4 0, B5 sayOk
per-leg, C1–C3 pass; panel `review_required`, no `regression_signal`).
Sniff test PASS, so the confirm ran. (The analyzer's `verdict` field on
the pilot invocation reads METRIC-BROKEN on B1 contact 4 < 8 — the
analyzer's verdict logic is the confirm logic; the frozen prereg defines
the pilot sniff test separately. Recorded, not re-judged.)

Confirm (12 FRESH seeds 104701–104712, verified 0 hits in every prereg,
150d, identical seeds):

| Bar | Ctl → Arm | Result |
| --- | --- | --- |
| B1 avoids (ratio ≥ 0.5, contact ≥ 8) | 32 → 29, ratio 0.9063 | PASS |
| B2 launches (≥ 90%, floor 8 cleared: 92) | 92 → 76 (82.6%) | FAIL |
| B3 wild deaths / flee damage | 22 → 25 / 9,040 → 8,018 | FAIL (deaths half) |
| B4 outmatched non-raid Suburb | 0 deaths, 0 fought | PASS |
| B5 instrument (say lines per leg) | 12/12 files, D3 91/91 & 77/77, say 32/32 & 29/29 | PASS |
| C1 median survival | 147.5 → 146 (0.9898) | PASS |
| C2 starvation deaths | 2 → 5 | FAIL |
| C3 community loss | 7 → 8 | PASS |
| Panel | `review_required`, no `regression_signal`, 1 `regression_watch` (community loss +0.0833 = the 104705 village, investigated) | PASS |

The whole NO-GO lives on two seeds (other ten identical): **104708**
launches 31 → 13 (−18; one villager loops on the Reunion 7× in a week,
flee-seeds 78 → 60, herald launches 8 → 0 — the seed converts flee-seeds
into retargets of a stalled plan and starves the launch pipeline) and
**104705** (village dies d134; its 4 influencer launches are the seed
working as designed — parties of 2–3 with ≤1 killer, 0 kills, all later
meetings fled). Wild kills 14 → 12; avoid-seeds band-wide 22 rows (17
unblocked, 5 blocked Suburb calls that seed nothing — exclusion held).
Wall (confirm): national standing 5 → 3, rank 0, table 0, wins 0,
wave-4 12/12, wave-5 5 → 3, median survival 147.5 → 146.

**Finding #2556: CLOSED.** Both halves of the metric-construction miss
are fixed and pass on the confirm with population present (B1 and B5).
The NO-GO is a lever verdict, not a metric verdict. **Finding #2547
(avoid-seeded plan stalls at party formation) still open** — now with
confirm-band instances (104705's launched-but-fleeing parties; 104708's
stalled reunion plan starving the pipeline).

Proof: `scripts/test-wildavoid-seedplan-b.js` ALL PASS (74 assertions);
analyzer selftest ALL PASS (49 checks); `test-wildavoid-a.js` 90/91
(§5 expected, frozen in prereg); D1 repeatability PASS; D2 wrap
neutrality 59/59; D3 gate agreement 1.0 both legs.

Disposition: the seedplan fix stays HELD, unmerged, on the branch. The
landed avoid itself (5402d4cc3) is untouched — the seedplan is an
addition to it, not the avoid, so no revert fallback is triggered by
this NO-GO. The next lever is the party, not the seed.

## Arm 2 — sim-fieldcarrier-a: NO-GO THIN-POOL, carrier HELD

Branch `sim-fieldcarrier-a`, tip d86025eb9 (prereg 9846098e7, carrier
e3a77c411 [needs-eyes], driver/analyzer bceb0e433, evidence 82d0a9c5,
corpora d86025eb9). Worktree clean, NOT on master. The field-engine
Rage carrier port (finding #2552), re-measured on the frozen dmg bars.

The carrier works in the field engine: `fieldBegin` (godpath.js, new
4th arg `wave`) marks a launched holder vs wave-4+ as holding rage;
`fieldAct` fires it through the existing Rage branch (3 rounds, double
damage, same voice line, honest 60 kcal via `fieldPay`). Engine-side
detection (finding #2553 — snapshot proxy retired): `fieldAct` sets
`G.carrierRageFired`, carried onto the fight record. Proof test
`scripts/test-fieldcarrier-a.js` 38/38; analyzer selftest 12/12;
regressions green (dmg analyzer 10/10, fightcap 20/20, abilityfirst
43/43, ability-gaps 16/16, godpath-villagers 58/58, aidleave-b all pass).

Pilot (8 seeds 104601–104608, 150d, identical seeds, ctl vs arm, 0
instrument errors):

| Frozen bar | Ctl | Arm | Result |
| --- | --- | --- | --- |
| Pool floor (pair n ≥ 10) | 2 | 2 | FAIL |
| Kill share (pair-inclusive) | 0.000 (0/2) | 0.000 (0/2) | FAIL |
| Carrier fires in judged population | 0 | 0 | FAIL (mechanism) |
| Community loss / starvation / median | 3/8 / 2 / 150d | 2/8 / 2 / 150d | PASS |

**Verdict: NO-GO, THIN-POOL** — no confirm run, no re-score. Funnel:
19–20 wave-4+ expedition encounters → party absent at 12 → 5–6 evades
→ 2 engaged. Trio+ pool 0 both legs. Wall: national 0/8 both, wins 0/8
both, wave-5 ctl 4/8 vs arm 3/8. Panel `review_required`, no material
signal. 6/8 seeds bit-identical; 104606 diverged (standing 365→199,
wave 5→4) and 104608 diverged (village-lost→survived, deaths 104→89) —
the carrier moved trajectories on 2/8 seeds, in opposite directions.

The carrier DID fire in the wild (arm 16 held / 6 fired, ctl 0/0), all
outside the judged population because the launched party was absent at
each meeting. All 6 fires ended vFlee, 0 kills. Closest: Aroha 104606
d143 vs Algorithm, 794/1080 HP (74%), 12 rounds. Cleanest paired
comparison: Katarina 104608 d95 vs Reunion — carrier added +118 damage
(+56%, 327 vs ctl 209), strikes 73/80/80 at x2.5 vs 36–39, still fled
at 27% HP. Finding #2554 in the flesh, now with the carrier actually
firing: a doubled strong base adds ~118 damage against ~1,200 HP.

New mechanism findings (appended #2557, #2558):
- **#2557 — the carrier is food-gated twice over.** 2 of 8 engaged held
  fights never fired; a probe verified both candidate gates live (food
  tier `tight`/`starving` blocks `fieldAct`; hunger 79 blocks the
  60-kcal pay). The corpus records neither tier nor hunger — the next
  arm should instrument them.
- **#2558 — a learned trick displaces `fieldAct`/Rage.** The villager
  works the trick instead of raging; trick knowledge and the carrier
  compete for the same turn.

**Finding #2552 stays OPEN (thin-pool).** The carrier is proven to fire
in the field engine; the kill-share question is still open pending a
population where the party is present. Do NOT re-run this band without
the sense substrate (held 480168a58) or equivalent party-presence work
— it would re-measure the same empty pool. The TB carrier (b9a2a295)
remains a mechanism reference only; the launchparty-sense substrate was
never landed and never cherry-picked.

## Ladder-bundle base-pinned check — SETTLED (next blank #8 from 1515Z)

Orphan branch `ladderbase-check` deleted (writes clear — the 1515Z flap
did not recur on any .git ref write this run). Scratch tree
sim-ladderbase-check (registered, then released as abandoned and
removed): `node scripts/test-ladder-bundle-20261108.js` at 5402d4cc3^
AND at 5402d4cc3 gives the IDENTICAL result — **78 passed, 1 failed**
(control: 200 monster turns WITHOUT delivery fire the ambient raid,
fires 0). The failure PREDATES the wildavoid landing; 5402d4cc3 is
exonerated. Appended as finding #2559 (control failure pre-existing,
cause still unknown, earlier than 5402d4cc3 — the next question is the
actual cause, not the wildavoid diff).

## Wall (this run's judged corpora, 40 configs)

- Seedplan confirm: national standing 5 → 3, rank 0/12, table 0, wins 0,
  wave-5 5 → 3, median 147.5 → 146.
- Fieldcarrier pilot: national 0/8 both, table 0, wins 0, wave-5 4 → 3,
  median 150 both.
- Pooled: national standing 5/20 → 3/20, rank 0/20, table 0, wins 0,
  wave-5 9/20 → 6/20. The wall is unchanged: villages reach 200+
  standing on a quarter of one band and none convert to national rank;
  standing-199 stall visible again (7/12 control villages at exactly
  199 on the seedplan confirm band).

## Village assessment, in plain words

On the seedplan side, the promise is now kept at the seeding step and
broken at the party step. One village did everything right — a woman
stepped aside from a beast, a plan was left behind, and her village
sent four hunting parties after it in two weeks where before nobody
ever went back — but the parties went out too small and too green, and
every one of them ran, and the village died a month early anyway. On
another village the seed did worse than nothing: one villager met the
same beast seven times in a week, each step-aside filing the same plan
away instead of starting a new one, and the whole village slowly
stopped going out after beasts at all. Everywhere else the two legs
are the same village living the same life.

On the damage side, the extra strength finally reaches the real fight
— a fighter's eyes go red, her strikes hit two and a half times as
hard, and she still runs while the monster stands at three-quarters
health. Twice over the test could not even stage the question: the
launched party almost never shows up whole, and when the village is
hungry the strength never fires at all. Nothing got cheaper or dearer
anywhere else: deaths, starvation, and survival are identical on both
sides of both tests, except where the seedplan's two villages diverged.

## Telemetry deviation check

`telemetry-check.js` against the scale-wall baseline on both corpora:
REFUSED recorder-corpus input on both (all rows carry top-level
anchorCommit; exit 2 — same documented refusal as the 1515Z run).
Baseline NOT rolled. The fieldcarrier worker's note that the baseline
"does not exist in this tree" is a worktree-path artifact — the
baseline exists at the goal path
`hidden_files/telemetry-baselines/scale-wall.json` and was used from
the main tree.

## Metric review

- Seedplan-b: the corrected bars judged the fix instead of the
  instrument (B1/B5 pass with population; B2 floor cleared at 92). The
  NO-GO is a lever verdict: the seedplan costs launches on a launch-rich
  band (92 → 76), driven by one village against a +2 gain on another.
  The bar did its job — it caught a real cost the pilot could not see.
  The pilot analyzer `verdict` field reading METRIC-BROKEN while the
  prereg's pilot sniff test passes is a known instrument quirk (verdict
  logic is the confirm logic); a future instrument pass could thread
  the pilot distinction into the verdict field.
- Fieldcarrier: the bars judged as written. The pool floor failed at 2
  (bar ≥ 10), so the verdict is NO-GO THIN-POOL by the frozen ladder —
  the kill-share question is inconclusive, not answered. Nothing in the
  wild-fire data changes that. No metric is re-scored here; the NO-GO
  stands.

## Infrastructure

- Registration slow again (~4–8 min per tree, registry lock contention
  with Loop B running concurrently; reaper skipped once — registry lock
  held by another reaper run).
- Safe-commit index clobber struck both workers (3 of 4 seedplan-b
  commits; fieldcarrier evidence commits incl. `MM` on godpath.js /
  fieldFights.js) — repaired via the documented `ls-tree -r |
  update-index --add --index-info` pipe each time, commits verified
  correct. Coordinator commits were clean.
- `scripts/safe-commit.sh` has lost its executable bit in the main tree
  too (mode 644, tracked as such — `git status` clean); both workers
  invoked it via `bash`. No mode change made here; flagging so the next
  run knows `bash scripts/safe-commit.sh` is the working form.
- No write flap this run: the orphan-branch delete, both registrations,
  and all commits went through. The 1515Z flap did not recur.
- Master moved twice under the run (ship bump + journey succession
  r233); zero file overlap with either arm; no rebase was needed because
  neither arm merges.
- check.js --quick NOT re-run: zero src/js, zero green-list files land
  on master this run (evidence-only coordinator commit). The standing
  profile is the 1515Z addendum's 336 passed / 6 failed, with the
  ladder-bundle failure now re-confirmed as pre-existing rather than
  green.

## Sense-testing notes

- Seedplan: the "going back for help" line is now half-true in a new
  way — the plan exists, bids, and sometimes launches, but the help
  that comes is too small and too green. Yuki's 35 days of empty-party
  bidding (pilot, reproduced exactly) still reads as a village that
  cannot find a second person. Sari's death (104708 d88, matched trio,
  wise round-1 leave, parting hit 13 damage) reads as the leave-trick
  not making the leave free — the re-judge's correction, live again.
- Fieldcarrier: Katarina's paired fight reads exactly like a fighter
  burning bright — she rages on round one, hits three times as hard as
  her other self, calls in two allies who stay and strike, and still
  flees at 16 HP. Aroha's 12-round near-kill (74%) suggests the
  multiplier CAN carry a fight when the party actually fights — but
  n=1, not a verdict. Mia's fight (carrier fired on a dying fighter,
  bought one strike) reads as Rage not saving a fight already lost.

## Next blanks, in order

1. #2547 party-formation for seeded plans (or #2545 repeat-avoid loop)
   — the seedplan confirm's named next lever. CHECK Loop B's partysize4
   outcome first: B is working adjacent ground this same hour; do not
   claim a party arm until B's result is in the tracker.
2. Fieldcarrier re-measurement — gated on a party-present population
   (sense substrate held 480168a58, or Loop B's partysize work). Do NOT
   re-run the thin pool.
3. #2557 carrier food-gate instrumentation — instrument tier + hunger on
   the encounter row; measure how often the gates bite before any
   carrier retune.
4. #2559 ladder-bundle control failure root cause (earlier than
   5402d4cc3) — bisect further back or fix the control.
5. #2546 sling fiction bug (one-line fix, unclaimed).
6. #2510 steering call — accept the 4 unknowns as closed-by-instrument
   or stage them deliberately (#2541).
7. #2542 scholar plan machinery — Steve-call whether intended or a gap.
8. Twins-test CONSUME harness fix (#2555).

Findings appended: #2557, #2558, #2559; #2556 marked fixed; #2547
still open with confirm-band instances; #2552 stays open (thin-pool).
Both arms HELD on their branches with fresh heartbeats
(sim-wildavoid-seedplan-b 5a4700a4c, sim-fieldcarrier-a d86025eb9).
Nothing merged to master this run except this evidence file. Merged
locally, pending ship: evidence only.
