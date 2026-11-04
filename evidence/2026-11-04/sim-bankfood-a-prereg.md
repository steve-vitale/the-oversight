# sim-bankfood-a — PREREGISTRATION (binding; committed BEFORE any judged sim)

Run: oversight-flesh-out-loop, run fleshout-20261104T1445Z, arm sim-bankfood-a
(arm 1 of 2), axis food-economy. Worktree sim-bankfood-a.
Backlog item #1610 (open since 2026-10-31, evidence/2026-10-31/
sim-strandfix2-b.md, NO-GO): evening banks of 540-810 kcal of known-edible
food read pack 0 the next morning, morning scholar kcal still 0, morning
pack-eat never fired once in the confirm band; the flip line's "What you
banked waits for morning" clause is false as measured.
WARNING from #1647 (binding): the old strand set is EMPTY on current master
(lootabilities landings re-rolled the shared RNG stream) — the bank set MUST
be re-derived on current master first (wider than 8 seeds if the pilot finds
nothing) before any judging; the 2026-10-31 seeds are NEVER cited as
reproducing without a verbatim control re-run on this base.

## Base

Pinned base: worktree HEAD at prereg writing time (recorded in the commit;
the prereg commit adds evidence only, so all legs run on pinned-base game
code verbatim plus the new files below). POLICY-SIDE ARM ONLY unless a
small root-cause fix is found and proven: zero edits to any existing policy
file, zero src/js changes except a proven small fix, zero policy-default
flips. Sibling trees never touched; main tree never touched. Nothing is
pushed, bumped, or live-verified by this worker (coordinator merges via
--ff-only); report 'merged locally, pending ship' readiness.

## Stack (rebuilt, because strandfix2-diag.js never landed on master)

Nighttravel-stack driver adapted from scripts/strandfix-trace-b.js with ONLY
the changes disclosed here: the strandfix wrapper swapped for the bankfood
wrapper OUTSIDE the warmed stack (bankfood(warmed(woodcarry(nighttravel)))).
Env gates asserted FATAL: COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1, POLICY=nighttravel, WOODCARRY=1, WOODWARM=0|1,
BANKFOOD=0|1. BANKFOOD=0 legs are the OFF/det-gate legs (wrapper delegates
untouched); BANKFOOD=1 legs are the variant.
- Evening (variant only, after inner.daily): on a still creek evening
  only — clock >= 449: last-light bank (up to 2 forages); clock <= 448
  and 449 - clock <= 80: flip-bank (BFS walk to a gather stance +
  gatherFallen until branches >= 2, then forage presses, until
  clock >= 449 or 5 verbs); clock <= 448 and needed > 80: skip
  'flip-too-far'. One honest say line per acted evening. Never calls
  travelTo, buildBridge, takeWood, cutTree, clearBrush. This mirrors the
  strandfix2 evening as described in its evidence (§Instruments); the
  original policy file is not on master, so this is a reconstruction,
  and any behavior difference vs 2026-10-31 is a reconstruction
  difference, not a base difference — the det-gate (OFF legs reproduce
  control legs exactly on per-seed creek/still/rescued counts) is what
  proves the wrapper neutral when OFF.
- Morning (variant only, pre-daily, post-sleep): stranded-morning gate
  as prior arms; if canonical pack food kcal > 0, Game.eat() once,
  nothing else (no walk, no forage, no fell — position preserved).
- Pack kcal is read CANONICALLY from Game.state.scholar.inventory
  (sum units * kcalEach over food stacks), never from status() (the
  sim-harness SIMOPT slim status() carries no inventory field) and
  never from any UI summary. Evening pack is snapshotted post-bank;
  morning pack is snapshotted pre-daily (the first driver observation
  of the new loop-day, before policy.daily, before any upkeep eat).
  A "true morning" snapshot is additionally recorded immediately
  post-sleep (before the harness's next loop-day upkeep/wait cycle)
  whenever sleep() rolls the day, so a sleep-refusal + wait-roll
  morning is never mistaken for a post-sleep morning.

## Direct overnight probe (diagnostic, NOT a judged sim)

Before judging the pilot, a no-policy probe places known-edible food
(pack stacks mimicking fresh forage yields, spoilDay = day + 2) in
scholar.inventory and advances through the night exactly as the
harness does (Game.sleep(); if sleep refuses, doAction('wait') ticks
to the day roll), snapshotting canonical pack kcal + scholar kcal at
each stage: pre-sleep, post-sleep/post-roll, and after one upkeep
cycle. Variants: (a) sleep with ticks to spare, (b) sleep refused
(dayTicks >= 449, the bank-evening clock band), (c) field tile vs
haven tile. The probe names the mechanism; the pilot judges the
phenomenon. A probe that shows pack surviving sleep does NOT by
itself kill the finding — it re-scopes it to the stack/harness path
(sleep-refusal + upkeep eating, competentEat ordering, succession,
or snapshot timing), which the pilot corpus must then trace.

## Primary metric (binding)

Share of evening-bank events (variant legs, BANKFOOD=1, evening bank
kcal > 0 recorded post-bank) whose kcal is still in the canonical
pack at the next true morning (pre-daily snapshot), PLUS morning
pack-eat firings on stranded mornings.

## GO thresholds (judged exactly against these; a miss is NO-GO,
never re-scored mid-run)

- GO for "reproduced": the vanish reproduces on >= 2/8 pilot seeds
  with a traced mechanism — i.e. >= 2 seeds each with >= 1 evening
  bank > 0 whose next true-morning canonical pack kcal = 0 AND
  whose morning scholar kcal does not account for the banked kcal
  (eaten-into-body excluded by the post-sleep snapshot chain), and
  the mechanism named from the probe + corpus trace (which engine
  or policy step removes it, with the snapshot stage where it goes).
  A bare count without a mechanism stage is NOT a reproduction.
- GO for "fix lands": fix + scripts/test-*.js proof test green +
  pilot re-run shows retention on the reproducing seeds (morning
  pack kcal > 0 after an evening bank, or morning pack-eat firing
  on the banked food) with no survival guardrail regression
  (median death-day delta >= -5d vs control legs on the same seeds).
- If no reproduction on a 16-seed wider sweep: verdict is
  INSUFFICIENT-DATA (not CONCEPT-DEAD) with the sweep documented.
- If a fix is large or its mechanism unclear: DO NOT land a
  half-fix — verdict DIAG, mechanism named, fix spec'd.

## Horizon, seeds, policy

- Horizon: 30 days, death-aware (dead villages stop simulating; the
  old band survived 30 days on every leg, so 30d is a census
  boundary, not a survival finding). Never a fixed 200d.
- Pilot seeds (8): 15003, 15009, 15091, 15211, 15215, 15220, 15221,
  15337 (the old band's first 8). Legs: guard (WOODWARM=0) and ON
  (WOODWARM=1), each control (BANKFOOD=0) and variant (BANKFOOD=1).
  Pilot gate: 8/8 files present per judged leg, errs 0, det-gate
  (OFF legs reproduce control legs on per-seed creek/still/rescued
  counts) before any confirm spend. There is no separate confirm
  band in this arm: the pilot IS the judged corpus if it reproduces
  with a mechanism; if it finds nothing, the wider sweep (below) is
  the confirm spend.
- Wider sweep seeds (16, only if pilot finds no bank event or no
  vanish): old 10 (15003, 15009, 15091, 15211, 15215, 15220, 15221,
  15337, 15376, 15439) + 16501, 16502, 16503, 16504, 16505, 16506
  (strandbank stage-2 band). Same legs.
- Policy: competent-player policy (nighttravel stack) + bankfood
  wrapper as above. No gate, price, deed bar, or win price changes.

## Panel note (§15)

scripts/balance-panel.js runs sweep-compare registry policies on
150-day horizons with its own scorecard; it cannot express the
nighttravel+woodcarry+woodwarm strand stack, the 30-day creek-evening
census, or an env-gated single-mechanism probe (same declaration as
every prior strand arm). The comparison here is control-vs-variant
legs on identical seeds through the census analyzer, and is never
labeled a panel comparison. Wall numbers (wins/national/table/wave
reach, median/max survival) are reported only where the corpus
reads them; a 30-day strand census does not read national/table/
wins, and that is stated plainly, not fabricated.

## Sense-testing law

Read transcripts. The flip line ("What you banked waits for
morning") is judged true/false against the measured morning pack,
not against the act's narration. Any fix that keeps a bank-promise
line must first prove banking survives the night.

## Metric review (for the NEXT run; this section is filled at end)

- (filled at end of run; revisions never apply mid-run)
