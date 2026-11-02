# Loop A 0445Z round — scale-onramp: sum-trigger CONFIRM (NO-GO) + sum-trigger DEPLOY (GO)

Run: fleshout-loop-a-20261102T0445Z, axis scale-onramp, 2 arms.
Sibling Loop B live on food-economy throughout (0330Z claim closed
mid-run, new 0459Z claim opened) — NOT touched. Claim written before
any sims. Pre-flight: main tree clean, disk 25%. Master moved
repeatedly under the run (batch-ship bump, journey-endgame r101);
both arms rebased clean onto the moving tip before merging
--ff-only, no merge conflict, no force, no sibling branch touched.
Rotation untouched (convergence-directed axis work supersedes
rotation; rotation stands at 3).

## Arm sim-sumconfirm-a (commits b2e8180b3 prereg + cc6e3c5db evidence,
## policy-side, zero src/js): CONFIRM NO-GO, 2 validator fails

Resumed the quotatrigger no-call screen at 95447 (UNMODIFIED
scripts/muster3-sweep-20261101.js, DAYS=180): 66 seeds scanned
(95447–95512), stopped exactly at the 12th qualifier. Confirm seeds:
95447, 95448, 95453, 95454, 95462, 95463, 95464, 95477, 95478,
95492, 95495, 95512. Same frozen quotatrigger stack, same
sumtrigger replay, own prereg committed before any judged replay.
Validator scripts/test-sumconfirm-a.js (corpus-only): VERDICT NO-GO
fails=2.

- (a) Trigger defined >= 9/12 — FAIL, 8/12. Undefined: 95447 (max
  faithful 7), 95464 (max 9 — one blade short), 95478 (max 6),
  95512 (max 3). All four blocked by arrears refusals; naive
  quota-sum would have fired on 3 of the 4 and sent musters the
  call itself refuses.
- (b) Sounded yield >= 10 AND projectedAllies == soundedAllies on
  every sounded seed — PASS, 8/8 (yields 10–19; exact-10 seed 95454
  with 0 Haven; snapshot-0 → sounded-14 seed 95477).
- (c) Fight outcome + casualties recorded — PASS, 8/8. All fought,
  Herald slain 8/8, tbHerald 'won' 8/8 — 7 same-day, 1 next-day
  (95495: trigger day 147, fight day 148; staging reason
  unestablished).
- (d) Guardrails — PASS, 8/8 (links 3→3, responders verified,
  errors 0).
- (e) Median survival >= screen median for the same 12 seeds —
  FAIL, 99d vs 109.5d. Driven by tail moves, not fight deaths.
Casualties: 7/8 fights zero allied lives; 95453 cost 3 of 11
(day-matched). Haven fight deaths 0/8. Generation side effect now
measured on non-sounding seeds too: 95478 (0 generation rows)
identical to its screen row; 95464/95447/95512 (1 row each) all
moved tails, three flipping win→lost — even a never-sounding
projection perturbs the timeline. Deploy must still choose lazy
vs eager generation (the deploy arm chose lazy; see below).

Wall (bands kept separate, never pooled). Confirm intervened (12):
national(end) 9/12, table 6/12, won 5/12, wave-4 12/12, wave-5
1/12 (95492), median 99d, max 181d; ends lost 6 / over-other 5 /
survived 1. Screen no-call (same 12): national 9/12, table 8/12,
won 8/12, wave-4 12/12, wave-5 0/12, median 109.5d, max 181d.
No full-seat win on either band. Death causes confirm (448) vs
screen (434): combat 212 vs 207, villager combat 84 vs 85, the
wild 82 vs 64, expedition 23 vs 22; no new death shape.

Coordinator re-verification: validator re-run post-merge with the
correct prefix argument reproduces NO-GO exactly (bare invocation
prints usage only — the worker's "corpus-only" claim holds with
the documented `confirm` prefix). Policy unit proof 16/16.
Index clobber struck both worker safe-commit.sh commits (known
class); worker repaired via HEAD-blob cacheinfo, commits verified
correct, trees clean.

## Arm sim-sumdeploy-a (commits b125dda5b prereg + e52a2715e game +
## 75c78a805 evidence, src/js/titans.js only, [needs-eyes]): DEPLOY GO

Prereg committed BEFORE any game change or judged sim. Decisions:
LAZY (readiness computed only on explicit demand — war-council
sitting or direct call — never on ticks/upkeep/menu render; at
the explicit moment it generates rosterless fires through the
call's own generator, once, and a following sound reuses it);
momentary (never cached — Haven availability moves within
bursts); faithful-only (refusals contribute 0; quota-sum ignoring
refusals over-sounds and is not the deploy rule). No titan
canon doc exists in docs/ — stated, none invented.

Built: `Game.titanCallReadiness(titanId)` in src/js/titans.js
(158 lines, also `_titanTest`), counted through the call's own
`titanAlliedFaces`, plus one war-council line. Deliberately NOT
wired into self-bar hint rendering (lazy rule); no change to
`soundTitanCall`, `titanCommitOwn`, `titanMusterReady`, or combat
gating. Council ready line: "The call, sounded now, would bring
11 blades — 8 from allied fires and 3 of Haven's own — against
the 10 THE HERALD demands. The coalition is ready; the cost is
named, not hidden." Refusal line names the fire and reason
("Emberhold cannot answer while debts unpaid between you.").

All six prereg bars PASS: (1) readiness exact vs current-code
policy control, 88/88 validator checks, 0 fails — trigger days,
projected allies/Haven/total, sounded yields, every projection
row per-link equal on all 8 pilot seeds; (2) fight conversion —
every sounded call fights the same day, Herald slain 4/4 on
current code; (3) guardrails — links 3→3, responders verified,
errors 0, check creates no muster and moves no trust/opinion/
arrears; (4) lazy + momentary — unit proof 27/27 (menu render
generates nothing, consumes no RNG; rostered readiness consumes
no RNG; rosterless generates exactly once; trust/arrears changes
move the projection); (5) sense-test — council lines read
humanly, named people, no list-fed narration; (6) proofs green
(qualified): unit 27/27, compare 88/88, check.js --quick 284
passed / 6 failed, all 6 proven pre-existing (fail identically
with the titans.js change stashed; stale measurement/phone-frame
proofs, mobile-combat cadence, occupation panels, racks-full
voice gate — none touches titans/council).

Before/after (8 pilot seeds, DAYS=180, frozen stack): deploy band
== policy control band identically, seed for seed. Wall identical
across both current-code bands: national(end) 4/8, table 6/8,
won 4/8, wave-4 8/8, wave-5 1/8, median 134.5d, max 181d. Death
profile identical to the death (281 deaths, same counts every
cause).

Base drift, handled without re-scoring: the prereg-named old
corpus sits on anchor 8dc12023, NOT an ancestor of this HEAD
(sibling landings intervened). Vs the old corpus the comparison
is 80/88, all 8 fails confined to 3 seeds whose trajectories
moved BEFORE any herald contact (95438/95446: zero herald
attempts on current code under either rule). The policy replay
run on current code as a control reproduces the drift exactly —
drift is in the base, not the change. Both comparisons are in
the corpus (compare-vs-old.txt, compare-vs-control.txt); the GO
verdict rests on the identical-conditions comparison, as the
prereg bar requires. Follow-up note: re-run policy controls
in-run rather than trusting prior corpora across sibling
landings. Coordinator catch: the compare script's default
policy dir is the OLD corpus — bare invocation gives fails=8
(the documented drift); with SUMDEPLOY_POLICY_DIR pointed at
perseed-sumdeploy-control it gives 88/88, 0 fails. GO stands.
Index clobber struck all three worker commits; repaired, verified.

## Telemetry

telemetry-check.js REFUSED the sumconfirm corpus by design
(recorder rows carry top-level anchorCommit; compared via
sweep-compare tables, never against a run baseline) — same
refusal class as the 0045Z/0250Z closeouts. No override, no
baseline reseed, baseline NOT rolled. No LOUD deviation line.

## Convergence state

scale-onramp stays converging (NOT converged): the when-to-sound
rule now lives in game code and reproduces the measured policy
verdict blade for blade, but the confirm bars missed, and the
full seat remains unwon on every band. The binding constraint
visible from this round is no longer the trigger rule — it is
arrears: friendships in debt refuse the call, and the next move
on this axis is a tribute/arrears question, not another trigger
retune. Next blanks, in order: (1) tribute/arrears-clearing path
to a ready muster (what clears arrears in time, what it costs,
whether a muster waits or routes around a indebted fire);
(2) sum-trigger CONFIRM re-run on a fresh band only after an
arrears lever lands (re-running the same bars on the same rule
without a lever change would re-prove the same NO-GO);
(3) Layer-2 titan meaning (steve-call: re-placement vs
kill-gating vs slain credit); (4) replay history-stream 40-entry
cap instrument fix; (5) full-seat bars w4>=3 + w5>=2 reachability
on any stack (still 0).

Coordinator evidence: evidence/2026-11-02/sim-scale-onramp-round-0445.md
Merged locally, pending ship (confirm: measurement record only;
deploy: game-code change [needs-eyes]).
