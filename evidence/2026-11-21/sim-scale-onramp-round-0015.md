# Loop A lever round fleshout-20261121T0015Z — round record (adoption closeout)

**Run:** fleshout-20261121T0015Z (Loop A, axis scale-onramp). The round timed out
before closeout; this record is the adoption closeout. All three arms adjudicated,
all three merged to master, lock + claim deleted. No push, no version bump —
merged locally, pending ship.

**Adoption notes:** the round's "merged arms" claim was verified, not trusted —
lendpool + fibersupply merges are ancestors of master with their evidence files
in the merge commits. The fiberfetch closeout was blocked on a safe-commit
refusal of the 138-line src/js revert; coordinator approval for `--force-delete`
was granted in the adoption brief for the revert commit only. The staged revert
was verified exact-inverse of the lever commit (+138/−6 → +6/−138, worktree
game.js byte-identical to the branch base, hash c6bcf1588b79bf9a1ffff9495bcf497b05491d76)
before the commit. First merge attempt failed cleanly (master moved to the r260
adoption gate commit 488bf51fc mid-adoption); rebased, proofs re-run, second
merge succeeded. The safe-commit index clobber did NOT strike on the revert
commit (status clean after commit) — first clean safe-commit in this adoption
series. No fresh full check.js on the merged tip (same caveat as the 1830Z /
2015Z rounds: arm proofs re-run green on each rebased tip is the bar met).

## Arm 1 — sim-lendpool-a: DIAG-GO (merged)

**Commits:** prereg `0e41b91a2`, evidence `3235672ad`. Instrument + evidence
only, 0 src/js changes. Proof test re-run on master: 35/35.

**Question (#2628):** why do searcaster holders never stand in earshot of an
unarmed fight lead? **Answer, measured on fresh band 107111–107118 (150d,
competent verbatim policy, LEND off, counter on): the pool is empty because
the holder population is empty.** At 130 of 141 unarmed-lead wave-4+ launches
(92.2%) there was NO living armed holder anywhere in the village. Sheltered 7,
at-home 2, on-expedition 1, in-camp 1. Earshot base rate over all 142 non-raid
wave-4+ launches: armed 7 (4.9%), eligible 2 (1.4%). Pool: 2 lendable moments
(both seed 107114, both gun, 1 tile + 1 adjacent) vs 0 on the lendfix band.
Supply census: 5 distinct holders ever, 116 holder-days of ~1,160 village-days
(10%), 4/8 villages never had a holder, never more than one at a time; when a
holder did exist, 7 of 11 launches had him sheltered. Sense-test: leads do call
for help and holders do charge in as allies (107114 d129: the lendable holder
joined and the lead won); the flat spot is one-round deaths with a sheltered
holder on the same tile saying nothing (107111 d60).

**Finding #2628 stays OPEN** on the opportunity question (answered) — next lever
named: **HOLDER SUPPLY** (put a searcaster + cells into a living villager's
hands before wave 4). Converges with #2631 (gun never reaches a villager on
plain master). Evidence: `evidence/2026-11-21/sim-lendpool-a.md`.

## Arm 2 — sim-fibersupply-a: DIAG-NO-GO (merged)

**Commits:** prereg `e572a384d`, instrument `a5d7861a3`, evidence `6e4e674f1`.
Instrument + evidence only, 0 src/js changes. Proof test re-run on master: 41/41.

**Question (#2590, serve half):** is fiber supply the binding constraint?
**Diagnosis, measured on fresh band 107091–107098 (150d, SPEARGATE substrate):
yes, and the WHY is quantified.** Deadfall is the only recurring pile-fiber
source (336 fiber / 652 hauls = 0.348/village-day), one hauler does 81% of all
hauling band-wide. The home arrow-craft (`villagerAmmoCraftDay`) eats the
trickle first: 155 fiber vs 16 at departures, 89% of all outflow. The
departure arrow-craft reads only the pile, never the carrier's pack, and runs
last — 65 departures hit no-mats with pile fiber 0 (19% of 339 departures).
Ledger closes: 336 in − 174 out = 162 = summed final pile fiber. Frozen bar 1
missed (pile-zero share 0.208 vs 0.40) because the band mixes two regimes:
bow-less villages accumulate (107094 ends holding 113 fiber, 0 departures)
while bow-holding villages starve (107098 empty 108/143 days). Sense-test: no
villager ever talks about, seeks, or notices fiber.

**Finding #2590 stays OPEN** on the serve half — next lever named: trailhead
fiber fetch at the departure arrow-craft attempt (which arm 3 then built and
killed). Evidence: `evidence/2026-11-21/sim-fibersupply-a.md`.

## Arm 3 — sim-fiberfetch-a: NO-GO CONCEPT-DEAD (merged)

**Commits:** lever + evidence `90ba06a29`, revert `6331a09c7` (coordinator
`--force-delete` approved for the revert only). Final tree: instrument +
evidence only, 0 src/js changes. Analyzer selftest re-run on the rebased tip:
85/85. Proof test verified 71/71 at the lever commit (run against the lever
code by restoring it to the worktree file, then restoring the revert byte-for-byte);
it fails on the reverted tree by design, as the roll35/ammo/evade tests do on
master (their lever code is not on master either; none of these arm tests is on
the green list).

**Question (#2590, serve half):** the trailhead fiber fetch the fibersupply
diagnosis named — the departing villager gathers 1 fiber at the trailhead when
the pile is short. **Verdict: the fetch NEVER fired.** 0 fetch rows in 216 arm
departures, 0/20 served departures fiber-short (pile fiber 3–55 at served
attempts), 0 fetch-attributable volleys vs bar ≥ 1. Mechanism: serving and
fiber-shortage live in different parts of the run — bows are served mid-game
when the pile holds fiber; fiber hits 0 only late (d92–d136) after serving
stops, or day 2 before serving starts. The premise was wrong at served
departures. Substrate served 5 (bar ≥ 3), pool 3 (exactly at floor), 1
served-bow volley (Sam Wilson, 107107 d44, 2 shots / 2 hits / 34 dmg, died
R2). Consistency FAIL (departures +9.1%, spearSeen 7 vs 32 — serving drains
the candidate pool, so the bar fails when the substrate works); starvation FAIL
by 1 (3 vs 0, n=3). The remaining served gap is the ROLL wall: all 6 served
departures that left with 0 ammo failed their 60% craft with fiber plentiful.

**Finding #2590 stays OPEN** on the serve half. Next levers, in order: (1) the
roll wall; (2) evade-on-a-quivered-bow. Do NOT retry the narrow fetch without
a new mechanism; a broader fetch (any departure) would be a new mechanism, not
a re-score. Evidence: `evidence/2026-11-21/sim-fiberfetch-a.md`.

## Wall numbers (round)

Wins 0, national 0, table 0 on every judged band. Wave 4 reached 8/8
everywhere. Wave 5: fibersupply 3/8, fiberfetch ctl 3/8 / arm 4/8. Median
survival 143.5–147.5d. Lendpool band: 8/8 villages survived to 150d.

## Next blanks, in order

1. **#2590** — the roll wall, then evade-on-a-quivered-bow (fiberfetch's
   named next levers). The fiber question is closed at the departure: the fetch
   attacks a wall that barely exists where it matters.
2. **#2628** — HOLDER SUPPLY: put a searcaster + cells into a living
   villager's hands before wave 4 (converges with #2631).
3. **#2626** — sibling Loop B's reseedwide-b (0030Z round) returned GO
   (combined) HELD: dead-target launches 0 on both armed legs, guardrail 4/4.
   The coordinator call the reseed arm left open now has a positive combined
   judgment — land the combined fix on the re-seed half + guardrail, or
   re-derive the 7-day bar, or run a rumor-poor band by construction. A third
   wide band is not recommended. Loop B also filed #2632 (expired-plan re-seed
   launches silently — no-silent-actions law).
4. **#2605** — launch engine (Loop B's launcheng-b DIAG-NO-GO, 0030Z round).

## Closeout verification

- Lendpool `3235672ad` + fibersupply `6e4e674f1` + fiberfetch `6331a09c7` all
  ancestors of master; evidence files confirmed in each merge commit.
- Findings #2628 + #2590 updated in `sim-findings.md` (lendpool DIAG UPDATE,
  fibersupply DIAG UPDATE, fiberfetch CONCEPT-DEAD update — the fiberfetch
  line's "revert pending approval" note updated to revert commit `6331a09c7`).
- Convergence tracker updated with this review section (axis scale-onramp,
  still converging, NOT converged).
- Lock `fleshout-20261121T0015Z` + claim deleted last on run_id match.
- Fiberfetch worktree released done-merged, removed, branch deleted.
- Telemetry: no LOUD lines reported by the arms; baseline NOT rolled.
- No fresh full check.js on the merged tip — see adoption note above.
