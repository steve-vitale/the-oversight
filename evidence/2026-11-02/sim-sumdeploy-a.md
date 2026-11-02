# sim-sumdeploy-a — sum-trigger DEPLOY: the faithful rule, game-side

Run: fleshout-loop-a-20261102T0445Z, arm sim-sumdeploy-a, axis scale-onramp.
Worktree branch: sim-sumdeploy-a. Anchor: prereg ac13947da committed
BEFORE any game change or judged sim; game change + instruments in
the closing commits below. Prereg:
evidence/2026-11-02/sim-sumdeploy-a-prereg.md — judged against it
below; no bar was changed mid-run. The deploy changes NO gate,
stage, deed bar, win price, trustedAt (70) / trustedOpinion (10) /
quota (6/2) / need (10) value, no food-economy value, nothing from
the #1538 steve-call queue, no Layer-2 titan work. The game-change
commit carries [needs-eyes] (the war-council readiness line is
player-visible feel text). Panel (§15): NOT APPLICABLE, same
declaration class as sumtrigger / quotatrigger — a trigger-moment
census with an event-triggered intervention, not a sweep-compare
policy run; before/after is done directly on identical seeds.
No panel fabricated.

## Verdict: GO — the game-side rule reproduces the policy verdict exactly on current code (88/88 validator checks, death profile identical)

All six prereg bars PASS, with one honest complication that is
reported, not hidden: the prereg named the sumtrigger pilot corpus
as BEFORE, but that corpus was produced on anchor 8dc12023, which
is NOT an ancestor of this run's HEAD — sibling arms landed
between the two runs (titanghost B1/B2, gardenpool, succession,
and others). On current code the trajectories of 3/8 seeds moved
before any herald contact, so the old-corpus comparison fails on
exactly those seeds (8 fails, all "no herald contact at all on
current code"). The methodologically correct repair, run in this
arm and reported alongside, is a policy control: the POLICY replay
re-run on current code. Against that identical-conditions control
the game function is exact on all 8 seeds (88/88, 0 fails), the
wall numbers are identical, and the death-cause distribution is
identical to the death (281 deaths, same counts in every cause).
The old-corpus comparison is kept in the corpus (it documents the
base drift); the GO verdict rests on the identical-conditions
comparison, which is what the prereg bar actually asks for ("on
identical seeds" — identical seeds AND identical code).

## What was built (the hook exists — no new system invented)

`src/js/titans.js` only, 158 lines:

- `Game.titanCallReadiness(titanId)` (also
  `Game._titanTest.titanCallReadiness`): the faithful sum rule,
  counted through the call's own face-picker
  (`titanAlliedFaces`), so the counted faces are the faces a
  sound would send. Refusing links contribute 0; otherwise quota
  6 iff trust >= 70 AND opinion >= 10, else 2; contribution
  min(quota - already, freeAdults after the call's own roster
  generation); HavenProj = havenValid + min(3 - havenValid,
  volunteers); READY iff allies + Haven >= need (herald 10, from
  data). The naive sum (refusals ignored) rides along as
  `naiveTotal` for evidence only, never the verdict. Returns
  null for an unknown titan id.
- Wiring into the decision point: `titanWarCouncil` computes the
  readiness once (guarded — a failed projection says nothing
  rather than breaking the council) and says one line after its
  header. Ready: "The call, sounded now, would bring N blades —
  A from allied fires and H of Haven's own — against the N THE
  HERALD demands. The coalition is ready; the cost is named, not
  hidden." Not ready: the same count against the need, plus each
  refusing fire named with its reason in the call's own words
  ("they do not trust this coalition with their people" / "old
  blood between you" / "debts unpaid between you"), or "Closer
  bonds would bring more volunteers" when nobody refuses.
- Deliberately NOT wired: `titanSelfActions` call-button hint
  rendering never calls the generating projection (lazy rule).
  No change to `soundTitanCall`, `titanCommitOwn`,
  `titanMusterReady`, combat gating, or any other function.
  Readiness creates no muster, moves no trust/opinion/arrears,
  touches no omen/gate/stage/ledger, and duplicates no presence
  or stage gate (those stay with the buttons and the call).

## Prereg verdict, bar by bar

1. READINESS EXACT — PASS on identical conditions (control):
   game projectedAllies == policy projectedAllies == soundedAllies
   on all 6 sounded seeds of the control band (90111: 7+3=10 day
   97; 95425: 10+3=13 day 157; 95434: 11+3=14 day 138; 95437:
   13+3=16 day 180; 95438/95446: no herald contact on current
   code under EITHER rule, see base-drift note), havenProj and
   totals equal, trigger days equal, and every projection row
   equal per-link (trust/opinion/arrears/quota/already/snapFree/
   generatedHere/freeAdults/wouldRefuse/contribution/naive) on
   all 8 seeds — 88/88 validator checks, 0 fails, vs the
   current-code policy control. Vs the OLD corpus: 80/88, with
   the 8 fails confined to the 3 drift seeds (95411: 0 rows vs
   11; 95438: no trigger vs day 86; 95446: no trigger vs day
   71) — all pre-contact trajectory moves, none a projection
   mismatch (every row that exists on both sides is equal).
2. FIGHT CONVERSION — PASS: every sounded call in the deploy
   band fights the same day and the Herald is slain (90111 day
   97, 95425 day 157, 95434 day 138, 95437 day 180 — 4/4 on
   current code; the pilot's 6/6 becomes 4/4 because two seeds
   no longer reach herald contact at all, under either rule).
3. GUARDRAILS — PASS: link count unchanged 3->3 on every
   sounded seed; every responder verified on its roster;
   instrument + muster-diag errors 0; the diff touches
   titans.js projection + council line only; unit-proven that
   the check itself moves no trust/opinion/arrears, changes no
   omen, and creates no muster entry.
4. LAZY + MOMENTARY — PASS (unit proof, 27/27): self-bar render
   generates no roster and consumes no RNG; readiness on
   rostered fires consumes no RNG; readiness on a rosterless
   fire generates exactly once (second call: generatedNow empty,
   same contribution, no RNG); changing trust/arrears between
   calls changes the projection (no cache). Quota 6/2, refusal
   exclusion incl. arrears, free-adult cap, Haven cap 3, no
   weakest-link veto, and the 95423 shape (faithful 9, naive 15)
   all proven.
5. SENSE-TEST — PASS (transcripts read): council ready line —
   "The call, sounded now, would bring 11 blades — 8 from allied
   fires and 3 of Haven's own — against the 10 THE HERALD
   demands. The coalition is ready; the cost is named, not
   hidden." Council refusal line — "The call, sounded now, would
   bring 0 blades — 0 from allied fires and 0 of Haven's own —
   against the 10 THE HERALD demands. It is not enough yet.
   Emberhold cannot answer while debts unpaid between you."
   The call transcripts themselves read humanly (named people,
   one fire answering at a time, the trust-holds line). No
   list-fed narration: quota and refusal still come from
   trust/opinion/arrears only.
6. PROOF TESTS GREEN — PASS (qualified, see below):
   `scripts/test-sumdeploy-a.js` (27/27),
   `scripts/test-sumdeploy-compare-a.js` vs control (88/88, 0
   fails), and `node scripts/check.js --quick`: 284 passed, 6
   failed in 639s. The 6 failures are PROVEN PRE-EXISTING, not
   caused by this change: with `src/js/titans.js` stashed (my
   change fully reverted) all 6 fail identically —
   godpath/test-measurement-proof-update.js (retained neutrality
   proof stale), godpath/test-measurement-workflow.js,
   godpath/test-mobile-combat-cadence.js (Continue round wrap),
   godpath/test-occupation-panels.js, godpath/test-phone-frame-
   proof.js (retained browser inputs / phone receipt stale),
   test-establishment-r20-fixes-20261020.js (racks-full voice
   gate). None touches titans, council, or readiness; the change
   was restored after the isolation run and all proofs re-run
   green (unit 27/27, compare vs control 88/88). The prereg's
   operative clause is "a green-list break CAUSED by the council
   line fails this bar" — no such break exists, so the bar
   passes with the 6 pre-existing failures disclosed, not hidden.

## Before/after numbers (identical seeds, DAYS=180, frozen stack)

Deploy band (game function, current code) vs policy control band
(policy projection, SAME current code) — identical on every seed:

| Seed | Trigger | Proj allies+Haven | Sounded | Haven | Fought | Slain | Tail |
|---|---|---|---|---|---|---|---|
| 90111 | day 97 | 7+3=10 | 7 | 3 | day 97 | yes | won day 152 (lesser seat) |
| 95411 | — | max — (0 rows) | — | — | — | — | died day 74 |
| 95423 | — | max 6+3=9 | — | — | — | — | died day 117 |
| 95425 | day 157 | 10+3=13 | 10 | 3 | day 157 | yes | survived 181 |
| 95434 | day 138 | 11+3=14 | 11 | 3 | day 138 | yes | won day 179 (lesser seat) |
| 95437 | day 180 | 13+3=16 | 13 | 3 | day 180 | yes | survived 180 |
| 95438 | — | — (no contact) | — | — | — | — | won day 90 (lesser seat) |
| 95446 | — | — (no contact) | — | — | — | — | won day 90 (lesser seat) |

The policy control band reproduces this table seed for seed,
including projection-row counts (90111: 32 rows; 95423: 11 rows;
95425/95434/95437: 1 row each; 95411/95438/95446: 0 rows).

## Wall numbers (bands kept separate, never pooled)

Deploy band (current code): national(end) 4/8, table 6/8, won
4/8, wave-4 8/8, wave-5 1/8, median survival 134.5d, max 181d;
ends: lesser-seat win (over-other) 4, village-lost 2, survived 2.
Policy control band (current code): IDENTICAL on every number.
Old sumtrigger pilot band (anchor 8dc12023): national(end) 5/8,
table 5/8, won 3/8, wave-4 8/8, wave-5 2/8, median 134.5d, max
181d; ends: over-other 3, village-lost 2, survived 3. The deltas
between the old band and the current bands are base drift (the
policy control reproduces them), not an effect of this change —
no full-seat win on any band; wins here are lesser-seat wins.
Death-cause shares, deploy vs control: IDENTICAL (281 deaths
each: combat 114, villager combat 71, the wild 42, expedition 17,
monster 10, sickness 6, arena 4, wound 4, contest 4, starvation 3,
ambush 2, thirst 2, dehydration 1, The Audit 1). Old policy band:
274 deaths with small deltas (villager combat 73, wild 43,
expedition 14, monster 11, sickness 4, arena 2, starvation 1,
Static Kite 1) — again base drift, visible in the control.

## Village assessment (plain words)

The village's friendships now answer a question the player can
actually ask. Sitting the council, the player hears what the
call would bring — not a perfect promise, but an honest count:
these fires answer, this fire cannot while debts stand, and
here is whether it is enough. On four seeds the village had done
enough of the slow work that the call went out, the blades
marched, and the sky-tyrant died the same day. On two seeds the
village had not done the work — one barely acquainted, one with
a friendship in arrears — and no counting trick makes ten blades
out of that. On two more seeds the village won its lesser seat
before the Herald ever came near, which is its own story: the
road to the table does not always run through the sky. The
deploy does not change what the village can do — it changes
when the village can tell it is ready, and the telling is
honest: it counts the people the call itself brings into being,
it names the fire that cannot answer and why, and it never
pretends a refused fire is marching.

## Metric review (no bar changed here)

1. BASE DRIFT, HANDLED WITHOUT RE-SCORING: the prereg named the
   old corpus as BEFORE, but the code moved under the run
   (8dc12023 is not an ancestor of this HEAD). The bar itself —
   "game reproduces policy on identical seeds" — is unchanged;
   what changed is the comparison's code identity, repaired by
   running the policy control on current code and reporting
   BOTH comparisons. A future deploy arm should re-run its
   policy control in the same run rather than trusting a prior
   run's corpus across sibling landings. The old-corpus deltas
   are not a verdict on this change: the policy control
   reproduces them exactly.
2. LAZY, AS DECIDED: "no RNG on a mere check" holds for every
   background path (menu render, rostered readiness) and is
   unit-proven with an RNG-call counter. The explicit check on
   a rosterless fire DOES generate — that is the call's own
   contact, paid once, and the sound that follows reuses it.
   A sim policy that projected at every refusal would re-pay
   the 90111 cost in sims; deployed play has no such loop, and
   the measurement instrument's per-refusal projection is
   instrument behavior, not deployed behavior.
3. MOMENTARY: Haven availability still moves within bursts
   (the control reproduces 95423's 3 -> 0 shape in its first
   row 6+3=9 as the max); nothing is cached, and the council
   line is recomputed at every sitting.
4. 95438/95446 NO-CONTACT: on current code these seeds win the
   lesser seat on day 90 with zero herald attempts under either
   rule. That is a base-drift observation (the win road moved
   earlier), not a muster finding, and it is carried as a
   finding for the scale-onramp axis, not chased here.
5. PANEL (§15): not applicable (see header). No panel fabricated.
6. CONFIRM: none run in this arm, same rationale as the pilot —
   a confirm needs a resumed screen with its own prereg. This
   is a deploy GO (exactness proven), not a confirm GO.

## Corpus

evidence/2026-11-02/perseed-sumdeploy-a/ — pilot.stdout/.stderr
(deploy replay), pilot-s<seed>.json (8 judged per-seed files),
compare-vs-old.txt (80/88, drift documented),
compare-vs-control.txt (88/88, 0 fails).
evidence/2026-11-02/perseed-sumdeploy-control/ — control.stdout/
.stderr (policy replay on current code), pilot-s<seed>.json (8
control files). Instruments: scripts/sumdeploy-replay-20261101.js
(deploy replay; the sumtrigger replay with ONLY the projection
source swapped), scripts/sumdeploy-split-20261101.js,
scripts/test-sumdeploy-a.js (unit proof, 27/27),
scripts/test-sumdeploy-compare-a.js (validator; accepts
SUMDEPLOY_DEPLOY_DIR / SUMDEPLOY_POLICY_DIR overrides, defaults
are the prereg paths). Baseline: sumtrigger corpus (old anchor)
plus the current-code policy control (the identical-conditions
baseline for the verdict).

## Blanks filled / documented

- FILLED (game change): faithful sum-readiness available at the
  decision point — `Game.titanCallReadiness` + war-council line,
  exact against the policy on identical conditions (88/88),
  lazy + momentary + refusal-respecting by unit proof (27/27),
  guardrails held (no muster created, no trust moved, link
  count unchanged, responders verified, errors 0).
- DOCUMENTED (not fixed, out of scope or follow-up): (1) base
  drift between the pilot anchor and this run moves 3/8 pilot
  trajectories before herald contact — future arms must re-run
  policy controls in-run, not trust prior corpora across
  sibling landings; (2) 95438/95446 win the lesser seat day 90
  with zero herald contact on current code (scale-onramp
  finding, carried not chased); (3) confirm needs a resumed
  screen with its own prereg; (4) roster first-name collisions
  inside a call persist unchanged from quotatrigger/sumtrigger
  (90111: Kenji Ford + Kenji Delgado).
- NOT touched per task bounds: #1538 steve-call queue, Layer-2
  titan work, gates/stages/deed bars/win prices, trustedAt /
  trustedOpinion / quota / need values, food economy, sibling
  trees/branches, hidden_files (coordinator-owned).

## Convergence state

scale-onramp: converging, NOT converged. The WHEN-to-sound
question is now answered in game code, not just in a policy
variant: the player can sit the council and hear an honest,
refusal-respecting count of what the call would bring, and the
count reproduces the measured policy verdict blade for blade on
identical conditions. But no confirm has run, the full seat
remains unwon on every band, and the base-drift lesson stands:
pilot corpora go stale across sibling landings, so the next arm
re-runs its control in-run.
