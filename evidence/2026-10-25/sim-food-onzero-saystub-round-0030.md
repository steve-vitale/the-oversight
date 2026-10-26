# Loop B round 0030 — food-economy: 9754 ON-zero diag + say-capture instrument (coordinator evidence)

Run: fleshout-loop-b-20261026T0030Z, axis food-economy (converging).
Loop A live throughout on scale-onramp (claim fleshout-20261026T0017Z,
arms sim-feastdraw-a + sim-tbmelt-a) — NOT touched.
Both arms merged locally, pending ship. No push, no version bump, no live
verification (ship loop owns deploys).

## Arm 1 — sim-onzero9754-b: DIAG, mechanism proven, verdict DIAG NO-GO on D2's letter

Question (the 2330Z run's named next blank #1): why did preserver
widening (75fdd9258) zero out cook resolutions entirely on seed 9754
(leadfeast/dg1/100d) in the preserveact pilot, on both pd0 and pd1?

Answer, in plain words: widening does not break the smoke racks, the
pantry, or the cook's hands. It breaks the staffing pick. On this seed
the widening gives exactly one villager a preserver skill she did not
have — Rosa Mendez, the line cook, skill 0 → 2 (the sole day-1 pool
change; rosters otherwise identical). The competent policy's smoke-rack
staffing picks the single highest-preserver free villager and never
falls through to a second choice. Under widening that pick is Rosa
every single day — and Rosa refuses cook duty every single time (cook
is not "food work" in checkObedience, so it needs trust 20+; her 152
refusals across both arms rule out the 40%-reluctant roll and point at
the hard gate). With no cook ever staffed, no cook duty ever resolves,
nothing is ever smoked, and the about-to-rot surplus rots fresh
instead. The village still lives 100 days and stays national on fresh
haul — which is why this zero hid inside a healthy-looking village.
The racks-full guard is innocent: preserved stock stays exactly 0 all
100 days, so the guard never fires — its silence is a consequence,
not a cause.

Deciding numbers (reproduction on HEAD 4f5f3b61 at arm time):
- OFF pd0 59 batches / 27 resolutions (EXACT match to published);
  OFF pd1 60/22 (DIVERGES from published 72/32 — reported plainly,
  not re-baselined; exact counts across bases are fragile, the
  zero/non-zero pattern survived).
- ON pd0 0/0, ON pd1 0/0. Villager cooking deeds OFF 88/75 → ON 0/0.
- Day-1 skilled pool OFF 0 → ON 1 (Rosa only). Eligible days
  OFF 90/92 → ON 91/91. Preserved kcal ON = 0 on all 100 snapshot
  days, both sides. Racks-full days ON = 0, all skills.
- Assign-call trace (the proof): ON cook calls 60 (pd0) / 67 (pd1),
  ALL to Rosa, ALL refused, 0 ok. OFF 40 ok / 0 refused (pd0),
  38 ok / 25 refused (pd1, all 25 refusals also Rosa). First refused
  ON call lands the same day OFF first staffs a cook (day 14 pd0 /
  day 19 pd1). The assign driver reproduces main-corpus counts
  exactly on all 4 cells.
- Wall (4 cells): national 4/4, table 0 (construction — SEATDRIVE=0),
  wins 0, max wave {4: 3, 3: 1}, median survival 100d. Deaths 35
  total, arena 21, starvation 4 (1 per cell, both arms — the ON
  village does not starve more).

Verdict, judged against the pre-registered header, not re-scored:
DIAG NO-GO on D2's letter. D2 requires exactly one step meeting
"ON == 0 both sides, OFF > 0 at least one side"; two steps meet it
syntactically — villagerCooking (88/75 → 0/0) and racksFullSkill0 days
(7/2 → 0/0). The assign-call trace resolves the ambiguity causally:
the racks-full zero is downstream of the cook zero (no cook → no
conversion → no stock to guard), while the cook zero is upstream and
call-proven. The verdict stands as written; the metric-review fix for
the next run is recorded in the arm evidence (D2 needs a causal-order
rule naming the highest zero, plus a blocking-direction rule for
inhibitor steps, plus the assign-call instrument as a standard
step-1 sub-proof). No neighbouring seeds were run — the pre-reg
allows them only to disambiguate, and the assign trace already does
so on 9754 itself.

Proofs: scripts/test-onzero9754-b.js 12 PASS / 1 FAIL (the FAIL is D2
itself, exit 1 by design); scripts/test-onzero9754-assign-b.js
9 PASS / 0 FAIL (assign mechanism proven). Rebased onto master
878247f96 clean; both proofs re-green post-rebase and on merged
master.
Commit: 5d803275b (rebased from 43f7c3f1d), 23 files, zero src/js.
Evidence: evidence/2026-10-25/sim-onzero9754-b.md + corpus
sim-onzero9754-b-corpus/ (4 main + 4 assign per-seed files).

## Arm 2 — sim-saystub-b: GO, instrument proven

Question (the 2330Z run's named next blank #2): the preserveact pilot
recorded saySamples = 0 on all four trace files — no cook smoke-rack
say-lines captured, so no cook dialogue could be quoted.

Root cause, proven: a harness-stub swallow, not a matcher bug and not
"cooks never speak." Cook duty calls this.say(...) → G.say →
emit, but sim-harness.js loadGame replaces G.say with a no-op when
narration is unset, and the preserveact sweep passed no narration
option — so the line never reached its Game.emit wrapper at all.
Proof-test T2 shows a direct Game.say of the known cook line
reaching no emit wrapper and no log line under the stock harness,
while the new capture records the identical call.

Instrument (zero game changes, zero shared-harness edits): new file
scripts/say-capture.js wraps Game.say after loadGame (the
probe-killattr pattern), recording only lines matching the
preserveact matcher verbatim. It writes only to a caller-owned array
and delegates with identical args/this/return value. Sweep driver
scripts/sweep-saystub-b.js, proof scripts/test-saystub-b.js.
No src/js file touched, no game say text changed, no default flipped.

Deciding numbers (16 configs, seeds 9750–9757, leadfeast/pd0/dg1,
100d, CAP=0 stock vs CAP=1 capture on current head):
- A (known-line capture): HOLDS. 273 worked smoke-rack lines
  captured; worked-line count equals resolutions on every cell
  (44/40/32/24/0/43/47/43). Example, seed 9753 day 15: "Owen cooked
  for the haven — meals stretched. Owen worked the smoke racks
  too — 2 batches preserved (~3762 kcal, keeps for weeks)."
- B (neutrality): HOLDS. CAP=0 vs CAP=1 numeric fields identical on
  8/8 cells (daysAlive, batches, kcal, resolutions, deaths,
  national, waveReach, rank). Bonus: the CAP=0 arm reproduces the
  published preserveact ON pd0 batches/resolutions/days EXACTLY on
  all 8 seeds — no substrate drift on these fields.
- C (cook-rich sample): HOLDS. saySamples > 0 on all 7 batches>0
  cells; 887 total cook lines captured.
- Sense: lines read as villager speech — named cooks (up to 6 per
  seed; 9753 is a one-cook village, Owen alone), batch counts 1–7,
  kcal ~97–3762, days d13–d100, shelf note tracks skill ("keeps for
  weeks" skilled vs "a couple of weeks" blind on 9757). One
  observation, not a defect claim: 9757's racks-full voice fires
  106 times on a racks-bound village.
- Wall (16 configs): national 16/16, table 0 (construction —
  SEATDRIVE=0), wins 0, median daysAlive 100, wave reach {3: 4,
  4: 12}. Deaths 63/arm, arena ~63%.

Proof: scripts/test-saystub-b.js 19 PASS / 0 FAIL, re-green after
rebase and on merged master.
Commit: 878247f96 (rebased from 13c388df), 20 files, zero src/js.
Evidence: evidence/2026-10-25/sim-saystub-b.md + corpus
sim-saystub-b-corpus/ (16 files).
Boundary respected: seed 9754 appears only as a neutrality cell
(say=0 with batches=0 on both arms); its zero was NOT investigated
by this arm. The preserveact NO-GO verdict was not re-judged.

## Telemetry deviation check (both corpora, scale-wall baseline)

Same 2 LOUD lines on each corpus, both the known regime-artifact
class: table 16 → 0, wins 16 → 0. Both corpora are SEATDRIVE=0
measurement substrates on which the table is unreachable and wins
are 0 by construction; the WINSEAT baseline's regime forbids this
comparison. Baseline NOT rolled, no investigation item.
Balanced panel (§15): no compare .md on either arm — recorder-row
ingestion class (onzero: TypeError reading 'days' at comparePanels;
saystub: panel compare needs panel pairs). Analyzer/sweep-compare
tables in the arm evidence files are the comparison of record.

## Village assessment (plain words)

Two villages-worth of lessons from one seed family. The 9754 village
looks healthy — full 100 days, national standing — while quietly
smoking nothing at all, because a single newly-skilled cook captures
the staffing pick and then refuses the job every day, and nobody
else ever gets asked. The fix is not "more preservers" — more
preservers is what broke it. The fix has to be in the asking: a
fallback when the top pick refuses, or a pick that only counts
villagers who will actually take the job. Separately, cooks were
talking all along — the sim harness was just throwing their words
away. With the capture stub, a cook-rich village now yields hundreds
of named, dated smoke-rack lines, and future runs can finally quote
what the village sounds like instead of counting it in silence.

## Infrastructure

- Safe-commit index clobber hit both worker commits (repaired via
  cacheinfo each time, commits verified correct) and did NOT hit the
  coordinator commit (verified below).
- Saystub first CAP=1 sweep capped samples at 200 and seed 9757 hit
  it (200 samples, only 23 of 43 worked lines); 9757 CAP=1 was
  genuinely re-run once with SAYCAP=1000 (numerics identical to
  both the capped run and CAP=0; 370 samples, worked=43=res).
  Future runs should default SAYCAP ≥ 500.
- Saystub check.js --quick killed after ~7 min under load; not
  required by that arm's assignment; its proof test is green.
- No EPERM flap blocked this run's writes. Worktree registration
  ran slow (~5 min for two trees) under sibling load, not failed.
- Master moved once under the run before landing (journey-social
  r54 92fa1c799); saystub rebased onto it, onzero rebased onto
  saystub — zero file overlap between arms, proofs green after
  every rebase and on merged master.

## Next blanks, in order

1. A staffing-fallback arm on the 9754 mechanism (fallback to the
   next preserver when the top pick refuses, or a willingness-gated
   pick) with its own pre-registration — NOT bundled with any other
   lever, and NOT a "more preservers" arm.
2. The D2 causal-order metric fix (name the highest zero; blocking
   direction for inhibitor steps; assign-call instrument as step-1
   sub-proof) before the next staffing diag reuses D2.
3. Future say-capture runs default SAYCAP ≥ 500; the 9757 racks-full
   voice repetition (106 fires) is a narration-variety observation
   for a future sense arm, not a defect claim.
4. The onzero worker's out-of-scope observation (fish staffing
   refuses ~99% of calls yet fish assignments persist in snapshots)
   is already in the findings backlog.

food-economy stays converging (NOT converged): the 9754 zero is
explained and the say-capture gap is closed, but no food-economy
game-code fix has landed from this round. scale-onramp stays
converging (untouched; sibling loop A). Claim deleted; lock deleted.
