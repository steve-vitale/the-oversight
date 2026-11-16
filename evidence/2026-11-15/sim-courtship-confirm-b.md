# sim-courtship-confirm-b — confirm of the courtship-rework2 PILOT GO (Loop B, 2330Z run)

**Verdict: CONFIRM NO-GO — on G3 alone, by tip drift, not by the lever.**
G1/G2/cost bar were never measured: no judged sim ran. The proof-test
re-run on this tip (required BEFORE any judged sim) fails one check —
test-covenant-b 32/33 against the recorded 33/33 — and the frozen
combination rule (any FAIL = CONFIRM NO-GO, never re-scored mid-run)
fixes the verdict here. The lever itself is NOT implicated: its own
three proof tests pass at their recorded baselines (59/59, 58/58,
57/57), no lever code changed, and the failing check tests the
covenant-road substrate, not the courtship lever. The confirm band
100621–100636 was NOT spent and stays fresh for the re-confirm after
the test is fixed. No panel was built (no corpora exist); no new wall
numbers were measured this run.

## What this run was

The rework2 pilot (8 seeds, band 100761–100768) went GO on all gates:
covenant staged 8/8, all answered 'pact', all sat; zero-movement
continuation pilgrim-days 0 band-wide; stale drops 0; cost bar PASS
(starvation 1 vs 5, median survival 175d vs 150d). The confirm was
owed on the reserved band 100621–100636 (16 seeds × 2 policies,
200d, identical seeds). Prereg
(sim-courtship-confirm-b-prereg.md) frozen before any judged sim,
band freshness verified (see below), instrument wired (driver
dirFor for RUN=courtship-confirm-b + new panel builder, same
construction as the pilot's). Then the proof-test re-run on this tip
(base master cb00f9818, the 2230Z batch ship) failed one check.
The run stops there, by the frozen rule — the sweep was not spent
to decorate a NO-GO.

## Prereg gates

| Gate | Bar | Result | Verdict |
|---|---|---|---|
| G1 instrument validity | full series + shape roll + daily opinion + daily pos + pilgrim state on all 32; 0 errors; every staged beat classified; UNCLASSIFIED ≤2 band-wide; pilgrim rollup present | NOT MEASURED — no judged sim ran | — |
| G2 the lever | covenant staged ≥6/16; every staged beat answered 'pact' and sat (death-day beats excluded); zero-move pilgrim-days band-wide ≤16 AND per-seed ≤8 on every seed; stale drops band-wide ≤8 | NOT MEASURED — no judged sim ran | — |
| G3 lever-only | zero `src/js` in the branch diff; proof tests green at recorded baselines | 0 `src/js` files in the branch diff; test-courtship-rework2-b **59/59**; test-courtship-rework-b **58/58**; test-courtship-b **57/57**; test-covenant-b **32/33 — 1 FAILED**; test-onlylead-b **29/29**; test-onlylead2-b **24/25** (known drift, unchanged) | **FAIL** |
| Cost bar (veto) | starvation ≤ baseline+2 AND median survival ≥0.8× baseline | NOT MEASURED — no judged sim ran | — |

**Combination rule: G3 FAIL → CONFIRM NO-GO.** No bar was re-scored;
no test was edited to go green.

## The failing check — diagnosis (proven, not guessed)

`test-covenant-b.js` §2, live 60d smoke on seed 100401, covenant
policy: check 'propose attempts are prerequisite refusals in the
smoke window' asserts `proposePrereq > 0 && proposeAccepted === 0`.
On this tip it fails deterministically (reproduced twice, identical
numbers; the test's own determinism checks pass):

- proposeCalls **51**, proposeAccepted **1**, proposePrereq **50**.
- The one acceptance: day **59**, village_1, detPeer **73** —
  a covenant peer link forms inside the 60-day smoke window.
- The test's frozen comment assumes the engine's opinion-10
  prerequisite "is only met at ~day 150 from a cold start (probe,
  2 seeds)". That assumption is now false on seed 100401.

Diagnostic probe (`/tmp/diag-covenant-op10.js`, in-memory oneRun,
no corpus written): max-known-opinion first reaches 10 on **day
59** (village_1: 10, village_0: 7) — the same day the proposal is
accepted. Trajectory: 0 at d10, 2 at d20, 8 at d30, 6 at d40–50,
10 at d59. Opinion-10 is met 90 days earlier than the test assumes.

**Cause, by elimination (tight).** The pilot tip was e577ef5f8; this
tip is cb00f9818. In that range the ONLY behavioral `src/js` change
is `src/js/conversation.js` in ce0f28a46 (journey landing r137:
want-thread resume re-poses the deflected question; the other
`src/js` diff, build.js, is a version stamp only). No change in
range to `scripts/policies/competent-covenant-b.js`, the
onlylead driver, sim-harness, or test-covenant-b.js itself; the
courtship-policy change in range (682f7354e, the BFS lever) is not
used by this smoke, which runs covenant vs scaleclimb. My branch
diff (driver dirFor +9 lines inside the main-module block, new
panel builder, prereg, this evidence file) cannot affect the smoke:
`oneRun` in module mode never executes the dirFor branch, and the
failure reproduced identically before and after my edits were in
place. The r137 change re-opens deflected question-wants
(stage 3→1) so a later answer can engage them — more answered
questions, opinion moving earlier. The exact opinion-gain path
through answered questions is inferred from the diff, not
separately instrumented; the elimination itself (conversation.js
is the only behavioral change in range) is proven.

**What the failure means.** The game changed under the test, not
under the lever. Opinion reaching 10 by day 59 means the covenant
road opens far earlier than the smoke assumed — if anything that is
good news for the road (the pilot's round-1 complaint was the road
gating on opinion at all). But the test's assertion encodes the old
timing, so on this tip the substrate proof is red and G3 fails.
The lever's own tests (rework2 59/59, rework 58/58, courtship
57/57) all pass — the BFS walk, the instrument, and the deeds are
untouched by the drift.

## Seed-band freshness (verified BEFORE any judged sim)

Per the seed-band skill — exact-seed grep over all dated preregs,
the convergence tracker, scripts/, and evidence filenames:

- CONFIRM BAND 100621–100636 (16 seeds): hits ONLY as the named
  reservation (courtship preregs; tracker; transplant2b-fresh
  NEVER list; producerparty parenthetical "USED by transplant/
  courtship preregs" = named/reserved, not spent). scripts/ = 0
  hits. Evidence filenames = 0 hits. No perseed dir, no panel, no
  judged corpus on any seed in the band. The one evidence-wide
  `grep -rln "100621"` hit outside the courtship line is substring
  noise (a float literal, 0.9910062187817061, in 2026-11-07 corpora).
  FRESH — and, because this confirm stopped before any judged sim,
  **still unspent** for the re-confirm.
- SPENT BANDS (never reuse): 100601–100608, 100641–100648,
  100761–100768.

## Wall numbers

NOT MEASURED this run — no judged sim ran, so there is no new
national / table / wins, wave 4–5 unlock, or median-survival read.
The last measured read is the pilot's (evidence/2026-11-15/
sim-courtship-rework2-b.md): armed national 8/8 ever, 6/8 held;
wins 0/8; wave-4 8/8, wave-5 6/8; median survival 175d vs 150d
control. Those are the pilot's numbers, not this run's; this run
adds none.

## Sense-testing

None this run — no corpus, no staged beats, no pilgrimage lines
were produced. Nothing to quote. (The one played line observed is
the failing check's own evidence: a covenant proposal accepted on
day 59 — the road opening early, which the test's assumption did
not expect.)

## §15 balanced panel

Not built — no corpora exist. The panel builder
(scripts/build-courtship-confirm-panels-20261115.js) is committed
for the re-confirm; the compare itself runs only once per-seed
JSONs exist.

## Metric review

1. **The G3 bar worked as designed — and the failure is the
   finding.** The proof re-run exists to catch exactly this: the
   game moved under a frozen test assumption between the pilot tip
   and the confirm tip. The verdict is NO-GO by rule, not by
   judgment about the lever. Do not re-score it.
2. **The smoke-window assertion is dead and must be revised for
   the NEXT run (proposal, not a change made here).** The 60d
   smoke's "no acceptance in the window" encodes an opinion-timing
   assumption (~day 150) that journey r137 falsified (day 59).
   Next run: revise the assertion to the new timing — e.g. assert
   prereq refusals only until max-opinion first reaches 10, then
   expect the acceptance; or shorten the window to the pre-op-10
   days. The revision is a test-maintenance change in its own
   commit, with the new opinion-timing number recorded, per repo
   AGENTS.md (a test broken because the design changed on purpose
   is updated in the same commit and said so). The r137 landing
   changed conversation behavior on purpose; the test update
   belongs with that change's follow-up, not smuggled into a sim
   arm.
3. **The confirm band stays fresh — the re-confirm needs no new
   band.** Because this run stopped before any judged sim, band
   100621–100636 is unspent. The next run re-uses this reservation
   (same band, same frozen gates) once the covenant test is green
   on its tip. If the test fix itself lands game-code changes that
   move opinion again, the prereg must re-verify the proof
   baselines on the new tip before spending the band.
4. **G1/G2/cost-bar numbers do not exist for this run.** The
   sweep was not run, so there is no fresh-seed read on whether
   the lever holds. That is the cost of the stop — accepted, per
   the frozen rule and the "do not spend a confirm to rescue a
   NO-GO" precedent. The pilot's numbers (8/8 staged, 0 stall
   days, cost bar pass) stand as the last measured read on the
   lever.
5. **A new watch item: the baseline may now stage on its own.**
   If opinion-10 is met by day 59 on the covenant leg too, the
   control leg in the re-confirm may stage covenant beats without
   any courtship deeds — compressing the G2 contrast the pilot
   measured (control staged 1/8). The re-confirm's per-seed
   opinion trajectories (already in the prereg) will show it;
   if the control stages often, the G2 bar (≥6/16 armed) still
   judges the armed leg, but the "lever opens the gate" story
   needs re-reading against a faster baseline.

## What stays open

- The re-confirm: same frozen shape (16 seeds × 2 policies, band
  100621–100636, 200d) once test-covenant-b is green on its tip
  — owed on the pilot GO, still owed.
- The findings-backlog item ("THE PILGRIMAGE STALLS ON FAR
  VILLAGES") stays [claimed], NOT [fixed] — [fixed] only if the
  re-confirm holds the pilot GO.
- New backlog item: the covenant smoke's opinion-timing assumption
  is dead (opinion-10 by day 59 on seed 100401, was ~day 150) —
  the test needs the revision proposed in metric review #2, and
  the road's opening speed on the new timing wants a fresh read
  (see metric review #5).
- The covenant road itself: the drift says it opens earlier than
  the test assumed. Whether that is a deliberate r137 effect (more
  answered questions → faster opinion) or a side effect is a
  question for the journey lane, not this arm.
