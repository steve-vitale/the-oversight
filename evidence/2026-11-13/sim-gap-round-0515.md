# Run fleshout-20261113T0515Z — coordinator evidence (axis scale-onramp)

Run: fleshout-20261113T0515Z, Loop A, axis scale-onramp.
Master tip at run start: dc95859a8 (version bump over f06c8e4e7).
Master tip at closeout: 4d79e6056 (both arms adopted; Loop B landed
proofrefresh-b10 7b0abd464 + coordinator evidence e2aa759d8 mid-run).
Claim: hidden_files/lever-claims/fleshout-20261113T0515Z.json
(arms sim-gap-candidates-a, sim-tendexact-confirm-a).
Loop B LIVE on its 0330Z claim (winnability chain) — NOT touched;
its mirror-cap panel trees (sim-mirrorcap-base-b, sim-mirrorcap-panel-b)
appeared mid-run — NOT touched.

This run took the 0455Z next blanks #1 (arm 2 deciding test) and #2
(arm 3 tendexact fresh-seed confirm). Both arms spawned, both landed.

## Verdicts

**Arm 2 sim-gap-candidates-a — GAP-NOT-DICE.** No RNG-only leg saved
either gap seed (190392, 190394). The +1 gap to the healthy pole is
NOT confirmed as dice; the 0455Z diagnostic's DIAG-GO conclusion is
superseded (see §1). Evidence evidence/2026-11-13/sim-gap-candidates-a.md
(commits e69d4594f + e320c8d54 + 4d79e6056; proof 82/0 on merged master).

**Arm 3 sim-tendexact-confirm-a — NO-GO.** Tendexact does NOT
generalize off the matched band: 0/8 vs baseline 1/8 on fresh seeds
190401–190408, and it killed the baseline's only survivor (190406).
The re-derived +1 is a matched-band result. Evidence
evidence/2026-11-13/sim-tendexact-confirm-a.md (commits 31269dfe8 +
244c187e1; proof 87/0 on merged master).

**Option-B search is now effectively complete:** L1/L2/L3/L4 all NO-GO
or deep-identical on the matched band, tendexact does not generalize,
and no RNG-only leg saves a gap seed. The remaining candidates are
narrow: (1) tendexact × stream-shift interaction (the pole carries
both; untested together), (2) more reseed burn offsets. Both are the
next run's first items.

## §1 — Arm 2: the deciding test (GAP-NOT-DICE)

Worker re-verified the arm-1 diagnosis from the committed corpora
under its own prereg first (Eater cascade on 190394, join lottery on
190392, L1/L2 deep-identity — all confirmed, plus one method
correction: snapshot deep-diffs must pair index-aligned, never
day-keyed, because of duplicate loss-day stamps). Legs on the far end
203a32775, seeds 190391–190398, 150d death-aware, competent verbatim,
roster-check fix swapped in. GO bar per leg: save ≥1 of {190392,
190394} with no regression on 190393/190397/190398.

| Leg | Survived | Gap seeds | Verdict |
|---|---|---|---|
| L1 r180 draw-removal (28875b1b1) | 4/8 | neither saved | NO-GO — DEEP-IDENTICAL on all 8 seeds |
| L2 joint r125 + r129/r130 | 4/8 | neither saved | NO-GO — DEEP-IDENTICAL on all 8 seeds |
| L3 reseed control (997-draw burn, no code change) | 3/8 | neither saved | NO-GO — lost baseline 190393 |
| L4 r172 confession guard (bd0bf10e2) | 4/8 | neither saved | NO-GO — DEEP-IDENTICAL on all 8 seeds |

The nuance matters: L1/L2/L4 are INERT, not weak — their draw sites
never fire differentially in sim play, so they never shift the stream
at all (concept-dead as survival carriers). L3 proves the band is
STRONGLY stream-sensitive: one 997-draw burn moved 4 of 8 fates
substantially — 190394 d43→d130 with the Eater never even appearing,
190392 d144→d72 (four-day wipe), 190393 survived→lost d122 at
standing 560, 190395/190398 newly reaching wave 5 — but it saved
neither gap seed. Only one burn offset was sampled, so GAP-NOT-DICE
is the pre-registered rule's verdict, not a proof that no stream shift
could save them. The reseed burn design (not a re-assignment) was
verified in code: five modules alias Math.random at load, including
the fight engine — a burn moves them all, a re-assignment would not.

**The 0455Z draft evidence is NOT adopted as written.** Its
"GAP-IS-DICE" verdict line is not confirmed by this test. The draft
(hidden_files/sim-gap-round-0455-DRAFT.md) stays in hidden_files as a
handoff record; its seed-level diagnosis stands as a re-verified
corpus read, but its conclusion is superseded by GAP-NOT-DICE. Do not
commit the draft as evidence without a correction header stating this.

## §2 — Arm 3: tendexact fresh-seed confirm (NO-GO)

Far end 203a32775 + tendexact e6911eb80, fresh band 190401–190408
(band verified fresh: 0 hits in all 799 preregs, all committed
evidence markdown, script seed lists, and docs; the used 190419–190434
mcconfirm band deliberately avoided), 150d death-aware, competent
verbatim, mode fix only. GO bar (all conjunctive): survived ≥
baseline+1 AND ≥5/8, median ≥0.8× baseline, starvation ≤ baseline+2.

| Leg | Survived | Median | Wave 5 | Rank | Verdict |
|---|---|---|---|---|---|
| Baseline (far end) | 1/8 | 81d | 2/8 | 8/8 REGIONAL_INTACT | BASELINE |
| Tendexact (+ e6911eb80) | 0/8 | 81d | 0/8 | 8/8 REGIONAL_INTACT | NO-GO |

GO bar: survived 0 vs baseline+1=2 and ≥5 — fail; median 81d vs
0.8× baseline 64.8d — pass; starvation 2 vs baseline+2=3 — pass.
The count hides the worse news: tendexact KILLED the baseline's only
survivor (190406: baseline survived 150d at standing 400, wave 5 →
tendexact lost d131, standing 199, wave 4) and cost 190404 26 days
plus its wave-5 unlock. The matched-band pantry footprint did not
reproduce — tendexact ended with LESS pantry than baseline on both
diverged seeds (190404: 4,358 vs 18,801; 190406: 0 vs 1,600).
4/8 seeds deep-identical (190401, 190402, 190407, 190408 — zero
differing daily snapshots): tendexact never moved a snapshot; the
NO-GO there is mechanical, same class as the rederive arm's L1/L2.
Every first divergence is a fight outcome or roster move — never
pantry first. Peak living wave-4 veterans: baseline reaches the bar
of 2 on 190404/190406; tendexact only on 190404.

## §3 — Wall numbers (this run's judged corpora)

- Arm 2, all four legs: national 0/8, table 0/8, wins 0/8. Wave-5
  reach varied by leg (reseed: 190395/190398 newly reaching wave 5).
- Arm 3, both legs: national 0/8, table 0/8, wins 0/8; wave-4 8/8
  (tendexact leg); deaths 667 (combat-dominated); standing 125–199;
  tribute ready 0/8.
- No lever has moved the wall numbers this run. The directive stands
  until the tracker records this axis converged on measured evidence.

Telemetry deviation check: REFUSED on both corpora (recorder-corpus
class — all 8 rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs; same refusal as the 0215Z run and both
workers). Baseline NOT rolled. No LOUD deviation lines to investigate.

## §4 — Sense-testing (transcripts)

- Arm 2: reseed 190394's final collapse passes in total silence (0
  vetSays d115–130 — same voiceless family as the draft's findings,
  already filed); reseed 190392's Pack-leader fight lines read
  coherent and consequential; joint 190392's joins pass silent
  (VOICELESS JOINS, already filed).
- Arm 3: dialogue coherent (door beats name fighters and hurt;
  veteran kills announced on camera; ARC IV fires, 8 lines per leg).
  One base artifact filed to sim-findings.md as [open] 2026-11-13:
  the pack-leader freeze line repeats 63× across the band on the old
  base — needs a current-master check before any fix.

## §5 — Metric review (§14)

Both arms pre-registered before sims and were judged against their
headers; both missed and both stand as NO-GO / GAP-NOT-DICE — no
re-scoring. One correction carried from the rederive evidence (noted
in the arm-2 prereg): snapshot deep-diffs must pair index-aligned,
never day-keyed, because duplicate loss-day stamps misalign day-keyed
diffs. The 0455Z draft's "phantom days (0 expected)" note stands as
recorded there.

## §6 — Infrastructure

- Host write flap: CLEARED for this run. ALL-OK continuously from
  05:25:31Z through closeout (no FAIL probe after 05:24:28Z). Both
  worktree registrations succeeded in the clear (candidates-a ~33 min
  checkout, tendexact-confirm-a ~15 min, under sibling load).
  Orphan branch sim-gap-diag-a (left by the 0455Z run's failed
  registration) deleted at run start.
- Pre-flight: disk 36%; tracked tree clean (`git status --short
  --untracked-files=no` — the FULL status scan hung, same symptom as
  the 0215Z run: full git status SIGTERMed after ~29.5 min under
  sibling load; cleanliness established via tracked/staged diffs +
  collision check + the ff-merge/cherry-pick gate, per that precedent).
- Service restart during the arm-2 release: the release command was
  interrupted mid-run; verified afterwards that the cherry-picks were
  already on master (4d79e6056) and the release had NOT applied
  (tree + branch still present, registry still active); re-ran
  release + remove + branch delete, all verified. No work lost.
- Loop B landed proofrefresh-b10 (7b0abd464 + e2aa759d8) mid-run;
  master moved under both arms; both rebased/adopted onto the
  then-current tip with proofs green after adoption and on merged
  master (gap-candidates 82/0, tendexact-confirm 87/0).
- No merges by --ff-only this run: both arms' commits descend from
  203a32775, so adoption was by cherry-pick (rederive precedent),
  verified ancestor-of-master after each pick.
- Rotation file left at 4: the standing directive overrides the
  lever rotation (no rotation lever was played this run; arms were
  diagnostic/confirm on the scale wall). Advancing the index would
  misattribute.

## Convergence state

scale-onramp stays converging (NOT converged): national/table/wins
still 0 on every band; the option-B search is now effectively
complete (L1/L2/L3/L4 NO-GO or deep-identical, tendexact does not
generalize, no RNG-only leg saves a gap seed) but the wall has not
moved. food-economy stays converging (untouched; parked). winnability
chain: Loop B live on 0330Z claim — NOT touched.

Next blanks, in order: (1) tendexact × stream-shift interaction leg
(the pole carries both; untested together); (2) more reseed burn
offsets; (3) proof refresh round 10 (Loop B owns — do not
pre-claim); (4) headcount-ceiling (Steve-call); (5) Reunion mirror
pack in the wild (Steve design call); (6) pack-leader freeze line
(sim-findings 2026-11-13, needs current-master check before any fix).

Claim deleted; lock deleted.
