# Survival-collapse fresh-band confirm — coordinator evidence (Loop B adoption, run fleshout-b-2026-11-12T06:30Z)

Axis: scale-onramp / winnability chain. Adoption of the dead 03:29Z run's
two confirm legs (tracker blank #4 — "Loop B mcconfirm arms stranded
incomplete — B's adoption, not A's").

## Stale-lock recovery

Deleted the dead 03:29Z lock (03:29:05Z; 3h old, past the 90-min
fallback). Both worktree heartbeats 87–93 min stale at run start, all
prior subagents done, no file writes in either tree in the 15 min
before adoption. Host write flap that killed the dead run (~04:21–
04:42Z) probed CLEAR at 06:32Z (`git update-ref` write+delete OK) and
did not recur. Dead claim retired to .DEAD after the orphaned work was
safely committed (see closeout).

## Arms landed (both merged locally, pending ship)

Arm 1 sim-mcconfirm-ctrl-b: LANDED f72268b1c (rebase of cdc1458cc onto
dbce39504 + one test-only re-pin commit). Control leg complete —
survived 5/16, median 138d on fresh band 190419–190434, base
5157782a4. Evidence evidence/2026-11-11/sim-mcconfirm-ctrl-b.md.
Proof 51/51 green on the tip; analyzer LEG_COMPLETE, 0 instrument
errors. Adoption work: verified 3 finished per-seed JSONs, deleted 5
partial .tmp files + .probe-write, ran seeds 190422–190434.
Arm 2 sim-mcconfirm-merge-b: LANDED dbce39504 (rebase of 9317390f8
onto 80d4dcc49). Merge leg complete — survived 1/16, median 111d on
fresh band 190419–190434, merge base e4dbe581b with the fix swapped
in. Evidence evidence/2026-11-11/sim-mcconfirm-merge-b.md. Proof
65/65 green on the tip; analyzer exit 0, 0 instrument errors.
Adoption work: ran missing seed 190434 only, restored standing.js
byte-identical to the merge base (sha 75762cb2259d…), deleted the
scratch instrument. Zero src/js changes committed by either arm.

Coordinator verification on the tip (master f72268b1c): both analyzers
re-run against the committed corpora — verdicts reproduce (ctrl 5/16,
138d; merge 1/16, 111d); both proofs green on the tip (51/51 + 65/65).

## The numbers

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg (matched 190391–190398) | 5157782a4 | 6/8 (75%) | 150d |
| merge-a (matched 190391–190398) | e4dbe581b | 1/8 (12.5%) | 126d |
| control leg, FRESH 190419–190434 | 5157782a4 | 5/16 (31%) | 138d |
| merge leg, FRESH 190419–190434 | e4dbe581b | 1/16 (6%) | 111d |

Wall (fresh band, both legs): wins 0/16, national 0/16, table 0/16.
Control: wave-5 5/16, wave-4 15/16, deaths 1,365 (93.6%
combat-shaped; starvation 1), standing 75–620. Merge: wave-5 3/16,
wave-4 16/16, deaths 1,209 (96.7% combat-shaped; starvation 4,
thirst 5), standing 125–460.

## JOINT VERDICT: INCONCLUSIVE

Pre-registered joint rule, applied to the fresh-band inputs
(merge 1/16, control 5/16) by the analyzer's own exported
`jointVerdict` function (machine-checked on the tip):

- CONFIRMED needs merge ≤ control − 4 AND control ≥ 8/16.
  1 ≤ 1 holds, but control 5 < 8 FAILS.
- REFUTED needs merge ≥ control − 1. 1 ≥ 4 FAILS.
- Otherwise INCONCLUSIVE. `jointVerdict(1,5) = INCONCLUSIVE`
  (sanity: `jointVerdict(1,8) = CONFIRMED`,
  `jointVerdict(1,2) = REFUTED`).

The rule is honored as written — a miss is a verdict, never
re-scored. What the numbers say in plain words: the merge collapse
still shows up on fresh seeds (1/16, the worst leg), but the
"healthy" control number collapsed too — 5/16 on fresh seeds vs 6/8
on the matched band. The healthy number is strongly band-dependent,
so the CONFIRMED branch's floor (control ≥ 8/16) fails and the
verdict cannot be called either way. The collapse does not reproduce
*as framed*; the fresh band is harsher on both bases. The merge-a
verdict (COLLAPSE_INSIDE_MERGE on its 8 matched seeds) stands
unre-judged — this confirm neither confirms nor refutes it.

Village assessment: sixteen villages per leg, almost all funerals.
Villages reach regional standing and look healthy for three or four
months, then the fighting kills them faster than they can replace
fighters. The pantry is fine — food is not the killer (starvation 1
and 4). The missing blank is people who can kill a wave-4 monster
and live to do it again: only one control seed ended with 2 living
wave-4 veterans; seven control seeds sat stuck at standing exactly
199 (the t4-1 readiness hold), two of them surviving the full 150d
there. The merge leg's sole survivor (seed 190433, 150d, standing
460) still ended with 0 living veterans. Sense-testing on both legs:
villagers narrate their days in character; nothing robotic spotted
(one repeated basket template noted on the control leg, not a
defect).

## Metric review (§14)

- The pre-registered joint rule held and was applied by the exported
  function, not by hand. It did its job: it refused to call a
  verdict the data cannot support.
- The metric set's weak spot is the one the control leg's evidence
  names: the healthy number is band-dependent (75% matched vs 31%
  fresh), so a confirm that leans on an absolute control floor is
  fragile. Next confirm should pre-register band-size sensitivity
  (e.g. a relative gap rule, or a bigger band), and a "days held at
  t4-1" metric — seven seeds parked at standing 199 is a signal the
  current metrics only catch sideways.
- Cosmetic staleness (not verdict-touching): the ctrl analyzer's
  printed context line still reads "merge 1/8 vs control 5/16" —
  it references merge-a's matched leg, not the fresh-band merge
  leg's 1/16. The `jointVerdict` export is the authority and it
  was called with (1, 5). A one-line context re-pin is owed, not a
  re-run.

## Telemetry deviation check

Attempted; REFUSED by the tool (recorder-corpus class — all 16
--current rows carry top-level anchorCommit, sweep recorder rows,
not runs). Recorded, not waived, baseline NOT rolled. Same refusal
class as vetphantom-b, merge-a, and every prior bisect arm.

## Infrastructure

- Safe-commit index clobber struck on 3 of 4 adoption commits (both
  variants, including the MM form on the re-pin commit) — repaired
  every time with the ls-tree -r pipe; commits always correct.
- Adoption re-pin (coordinator, test-only, commit f72268b1c): after
  rebase onto current master the ctrl proof went 50/51 — its live
  on-disk standing.js check pinned the vetphantom fix sha
  f8fda4295a99, but master's file carries the byte-identical ROSTER
  CHECK hunk under a later sha (1eec2c9235a8; surrounding content
  moved after the vetphantom base). Re-pinned the one assertion to
  the current-master sha (marker present + sha + guard refuses on
  exact-sha); the driver guard itself is untouched and stays
  exact-sha strict. Proof 51/51 on the tip.
- safe-commit.sh still takes no directory pathspecs (merge leg's
  corpus went in as a second commit with explicit file paths).

## Next blanks, in order

1. Bisect round 4 — midpoint/suspect-commit leg in
   5157782a4..3f136f07e, same 8-seed band (tracker 0615Z blank 1).
   This confirm's INCONCLUSIVE means round 4 should carry a bigger
   band or a pre-registered relative-gap rule if it re-tests the
   collapse — do not re-run the same absolute-floor confirm.
2. Synergy fix shape (design question — Steve call or dedicated
   build arm).
3. Ctrl analyzer context line re-pin ("merge 1/8" → "merge 1/16"
   fresh-band input; one line, test-only).
4. Arm-2 toggle run (field-fight damage+staying toggle, tracker
   blank #4 in the re-point queue) still without a verdict.

scale-onramp stays converging (NOT converged): national/table/wins
still 0 on every band; the collapse is confirmed on the shipped
tree (reconciled-a 1/8) and reproduces at 1/16 on fresh seeds, but
the fresh-band control (5/16) will not certify it. Claim deleted;
lock deleted.
