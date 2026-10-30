# sim-warmthrestr2-b — evidence (warmth-default restraint, current-master re-judgment)

Verdict: **R1 GO (GUARD-EQUIVALENT), R2 GO (GUARD-EQUIVALENT)**
— judged ONLY against the prereg bars in
`evidence/2026-10-30/sim-warmthrestr2-b-prereg.md` (committed as
05d797a18, BEFORE any judged leg, pinned base
ee3be4fc5f4e3561e6f98df359e680d70a4d8b8e). This is a fresh
re-judgment on current master, NOT a re-report of the previous run:
every leg below was run fresh through this run's own driver, and
the previous run's corpora are never cited as current-master
behavior. Both named-tracker restraints hold the strand guard
exactly, and both retain ZERO warmth benefit on this bank. That is
the finding, stated plainly: on this trajectory there is NO middle
between unconditional warmth (trap) and never lighting (guard) — a
restrained warmth-default bot IS the guard bot. No src/js change, no
policy-default change — measurement only. The Steve-call stays
OPEN, and this run re-sharpens it rather than answering it.

## Base pin and what was run

- PINNED BASE: ee3be4fc5f4e3561e6f98df359e680d70a4d8b8e
  (worktree HEAD at prereg writing time). The prereg commit added
  only the prereg file. The final tracked diff vs the pin for `src/`
  is EMPTY — the legs ran on pinned-base game code verbatim. The
  only policy change is the OPT-IN restraint parameter on
  scripts/policies/woodwarm.js (default null = unconditional
  behavior); the prior proof script (scripts/test-woodwarm-b.js)
  still passes unmodified, including byte-identical determinism.
  New files are measurement scripts + evidence + corpora only.
  No file was cherry-picked, copied, or committed from branch
  sim-warmthrestraint-b.
- DRIVER: scripts/warmthrestr2-trace-b.js (this run's own driver,
  adapted from the current scripts/woodwarm-trace-b.js in this
  worktree; same honesty guards). Env asserted FATAL on every leg:
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=nighttravel WOODCARRY=1 WOODWARM=0|1
  WARMTH_RESTRAINT=off|R1|R2 DAYS=30.
- BASELINE legs (BEFORE any variant judging, through the NEW
  driver): guard (WOODWARM=0) + unconditional ON (WOODWARM=1,
  WARMTH_RESTRAINT=off) on all 10 qualifier seeds (15003, 15009,
  15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439), 30
  loop-days each. REPRODUCTION: EXACT on every prereg bar (see
  below) — NO base drift on this bank, and the new driver is proven
  equivalent on this bank.
- PILOT (instrument validation): R1 + R2 on the first 8 bank seeds.
  Instrument valid (errs 0, restraint records present with the full
  field set, evening loopDay sequences intact). Pilot legs ARE
  judged bank legs (stated in prereg).
- BANK (judged variant legs): R1 + R2 on all 10 seeds (pilot 8 +
  15376, 15439), 30 loop-days each. All 10 seeds survived the 30
  days on all four legs.

## The two restraints, as implemented

Bridge cost B = 4 logs (WOOD_NEEDED, woodcarry.js). Both apply AFTER
warmDecision returns act, BEFORE makeFire:

- R1 — bridge-feasibility: act only if woodBefore - 1 >= 4, i.e.
  woodBefore >= 5. Otherwise miss 'restraint-r1'. (Prereg reading
  note: the feasibility reading, unit-tested wood 5 -> act, wood 4
  -> block; the literal >4 reading coincides on this bank — max
  pack is 4 — so the choice cannot move the verdict.)
- R2 — bridge-already-lost: act only if woodBefore < 4 (act window
  1..3, since warmDecision already requires wood >= 1). Otherwise
  miss 'restraint-r2'. "Rescue out of reach" means the bridge cannot
  be built tonight or on any later stranded night until a
  haven-morning refill, so the log spent is not a bridge log
  anymore. The rejected reading (tonight's kcal/ticks skip = rescue
  out of reach) is NOT implemented: the fresh guard trajectory
  re-proves kcal/ticks recovery on day 10.

## Results (10-seed bank, pinned base)

Committed records:
`evidence/2026-10-30/sim-warmthrestr2-b-census-{guard,on,r1,r2}.json`
(analyzer scripts/analyze-warmthrestr2-b.js); corpora
`sim-warmthrestr2-b-corpus-{guard,on,r1,r2}` (10 files each); proof
scripts/test-warmthrestr2-b.js.

| leg | creek | still | rescued | warmth acted | log-spent | staged | 15215 strand |
|-----|-------|-------|---------|--------------|-----------|--------|--------------|
| guard (fresh) | 15 | 4 | 11 | 0 | 0 | 0 | days 7-9 (3) |
| ON (fresh) | 21 | 11 | 10 | 6 | 4 | 7 | days 7-16 (10) |
| R1 | 15 | 4 | 11 | 0 | 0 | 0 | days 7-9 (3) |
| R2 | 15 | 4 | 11 | 0 | 0 | 0 | days 7-9 (3) |

- DRIFT / REPRODUCTION: fresh guard matches the reference bars
  exactly (15/4/11, still skip kcal 3 / ticks 1, wood 4 on all 15,
  haven mornings 263, pile min days 2+ = 8, pile-floor after day 1
  = 0, strands 15009 [13] and 15215 [7,8,9]). Fresh ON matches
  exactly too (21/11/10, still skip kcal 3 / ticks 1 / wood-short 7,
  warmth acted 6 / log-spent 4 / fire-failed 2, spends 15215 days
  9/11/12/13, staged 7, strand 7-16). NO DRIFT. Judged legs are
  judged against this fresh guard, as preregistered.
- R1 census is IDENTICAL to the fresh guard census on every number:
  still skip kcal 3 / ticks 1, wood 4 on all 15 creek evenings,
  haven mornings 263, pile min days 2+ = 8, pile-floor after day 1
  = 0. Miss reasons: not-creek 285 / rescued 11 / branches 1 /
  ticks 1 / restraint-r1 2. The two restraint misses are both seed
  15215: night 8 (wood 4, branches 0, ticksLeft 239, ground 0,0)
  and night 9 (wood 4, branches 0, ticksLeft 109, ground 7,1) —
  exactly the nights where unconditional warmth would have acted
  (night 8's ON attempt failed the friction lottery; night 9's ON
  attempt spent the first log).
- R2 census is IDENTICAL to R1's, with restraint-r2 x 2 on the same
  two nights.
- Trajectory identity, stronger than census identity: on all 10
  seeds, both variants show ZERO evening-field diffs vs guard
  (inside, mx/my, tile, kcal, eveningOutcome, woodcarry record).
  The restrained playthroughs ARE the guard playthrough, differing
  only in warmth miss reasons. Village summaries agree too:
  R1/R2 = guard on every stat (survived 10/10, wave 2 in 10/10,
  wave kills 68 + 8 = 76, death-log entries 109); ON differs only
  as before (kills 80, deaths 110, on seed 15215 only).
- Divergence scan (prereg prediction test): wood max on creek
  evenings = 4 on ALL four legs; pack >= 5 evenings = 0;
  sub-4-without-spend evenings = 0; unstaged wood-short evenings
  = 0. NEITHER divergence condition fired anywhere on the bank.
  The prereg's predicted outcome (both variants zero acts) held
  exactly — not by luck: R1 needs a pack >= 5 that never exists,
  R2 needs a pack < 4 that only a warmth spend creates.

## Bars — judged, one by one

- PRIMARY R1: 15215 strand (3) == guard strand (3) AND no seed
  exceeds its guard strand: YES — GO.
- PRIMARY R2: same: YES — GO.
- SECONDARY (reported, no bar): R1 benefit retained 0/4 log-spends,
  0/7 staged, 0/6 warmth acted, rescued 11 (ON 10 / guard 11).
  R2 identical. INTERPRETATION RULE (prereg): both variants are
  GUARD-EQUIVALENT — trap prevented, warmth benefit fully forgone
  — NOT warmth-preserving defaults. Neither earns the words
  "warmth-preserving restraint" (that required PRIMARY + benefit
  >= 1).
- INSTRUMENT bars: errs 0/0 on all judged legs — HOLDS.
  Determinism re-run of 15215 R1 byte-identical — YES (staging dir
  deleted). Baseline reproduction bars all hold — NO DRIFT.
- SENSE-TEST: full tails read for seed 15215, nights 7-10, on BOTH
  variant corpora (not quoted from guard). Verdict: PASS on the
  guard-equivalent trajectory.
  - Night 7: ticks-short refusal, honest ("47 ticks left in the
    day, and a bridge takes 96 ticks."), warmth miss ticks-short.
    Day-walk content (Stone knife craft, Dakota naming) coherent.
  - Nights 8-9: kcal-short refusals, honest ("0 kcal in hand, and
    the lashing takes 60."), warmth miss restraint-r1/r2 with full
    fields. NO fire lines anywhere — the restraint blocks before
    makeFire, so no narration claims a fire. Coherent: a cold
    night outside with the bridge logs kept.
  - Night 10: rescued — "Walking 4 squares (8 kcal)… You step into
    the Haven hall." The warmth record is miss 'rescued' (wood 0
    after the bridge spend, correctly not acted on a rescued
    night). Coherent.
  - Ambient wrinkle, noted not hidden: nights 8-9 carry "It
    followed you" + ability-gain + gossip/counter-learned lines —
    the same pre-existing day-walk ambient class noted in earlier
    sense-reads, not restraint narration. It does not break the
    stranded nights' coherence.
- CLOSE-AS-UNPLAYABLE is not claimed (not an available verdict).
  The narrower closure HOLDS for both variants (PRIMARY met + zero
  benefit + no divergence condition fired anywhere): "no
  named-tracker restraint preserves warmth benefit on this bank".

## Village assessment (plain words)

The 10 banked villages all survived the 30 days on all four legs —
same selection frame as woodwarm (villages that lived long enough
to get caught at a creek). Under R1 and R2, the village of seed
15215 is exactly the guard village: caught out at a creek on day 7
for want of time, days 8-9 for want of food, carrying
unidentified berries it cannot cook — and walking home on day 10
with its 4 bridge logs intact, because on nights 8 and 9 it did NOT
light the fire that unconditional warmth would have lit. The
restraint is invisible in the village's story except as the absence
of the trap: no warmth fires, no knack learned, no week-long
strand. That absence IS the measurement: the bot that never spends
its bridge logs is the bot that comes home on day 10. What is
missing, and what this run documents rather than fills: any warmth
benefit under restraint. The fires' only engine-visible yield on
this bank was narration + the friction-fire knack (ON nights 9-13)
— and the restrained bot gets neither, because any first spend
breaks the bridge.

## Reachability verdict

On this 30-day evening band: wave 1 in 10/10 villages, wave 2 in
10/10, waves 3-5 not reached in this window. Arc II/III/IV,
regional, national, and the table are not reached on 30-day legs
and are not claimed either way from them (see wall numbers).

## Wall numbers

NOT OBSERVABLE on 30-day evening legs (pre-seat, no field).
National / table / wins are reported as NOT OBSERVABLE, never as
zeros. Wave reach on the banked band: wave 1 in 10/10 villages,
wave 2 in 10/10, waves 3-5 not reached in this 30-day window.
Median survival is 30 days (all 10 survived the window, all four
legs) — a ceiling effect of the short window and the banking
selection, not a survival claim.

## Metric review (prereg doubts, answered; revisions for the NEXT run)

- The strand-length primary proved to be the right judge again on
  the fresh base: it separates unconditional (10) from
  guard/restrained (3) cleanly, and the per-seed "no seed exceeds
  guard" clause was load-bearing as a check (no seed did). Keep it
  for any future restraint prereg.
- The benefit-secondary-with-interpretation-rule (not a bar) proved
  necessary again: without it, a GUARD-EQUIVALENT GO would read as
  "warmth works with restraint." The rule kept the verdict honest.
  Keep the rule wherever a restraint is judged.
- The predicted-coincidence design (both variants predict zero
  acts, divergence conditions named) proved falsifiable and useful
  again: the divergence scan, not the verdict alone, is what closes
  the "no middle" claim. A future run that finds a pack >= 5
  evening or a sub-4-without-spend evening reopens R1 or R2
  respectively — the scan fields are in the analyzer for exactly
  that.
- The rejected R2 reading (tonight's kcal/ticks skip = rescue out of
  reach) stays rejected: the fresh guard trajectory re-proves
  kcal/ticks recovery on day 10. Do not re-litigate it without new
  trajectory evidence.
- The literal >4 vs feasibility reading of R1 stays moot on this
  bank (both give zero acts); if a future bank shows pack-5
  evenings, the prereg for that run must pick one reading BEFORE
  legs — the feasibility reading (spend 5 -> 4 allowed) is the one
  unit-tested here.
- No balanced-panel compare .md is produced, as pre-registered:
  this is a 30-day position measurement of a policy-side behavior
  with zero src/js changes, so there is no game-root delta for a
  panel to compare, and the panel's registry policies do not
  include the nighttravel trace policy. The determinism re-run is
  the instrument-perturbation proof, and the bars above are the
  judge. (Same standing as the woodwarm prereg.)
- NEXT-run recommendation (not a ruling): do NOT re-test R1/R2 on
  this bank — this re-judgment confirms the previous finding on
  current master. Either take the daytime wood-recovery question
  (the only named route to a middle), or carry the
  GUARD-EQUIVALENT finding to the Steve-call as the measurement
  answer.

## Proof

`scripts/test-warmthrestr2-b.js` — all 42 checks green: restraint
unit gates (R1 4-block / 5-act, R2 3-act / 4-block, null + off act,
unknown fails closed); warmDecision regression spot-check; census
agreement on all four legs; R1/R2 PRIMARY bars (15215 strand 3 ==
guard 3, no seed exceeds guard); benefit numbers (0/4, 0/7, 0/6,
rescued 11) with GUARD-EQUIVALENT labels; restraint-miss field
checks (2 records each, full fields); divergence scans (wood max 4,
pack >= 5 evenings 0). Determinism (15215 R1 re-run byte-identical,
staging dir deleted) verified separately during the run. Run:
`node scripts/test-warmthrestr2-b.js`. Prior proof
`scripts/test-woodwarm-b.js` also re-run green after the policy
extension (including its byte-identical determinism).

## Landing

- Prereg: already committed (05d797a18), not recommitted. Note:
  after that safe-commit the main-index clobber hit (committed file
  showing staged-as-deleted while the worktree file was byte-
  identical to HEAD); repaired via `git update-index --add
  --cacheinfo` and re-verified status empty + diff HEAD empty
  before continuing. The commit itself was correct.
- This commit: restraint parameter on scripts/policies/woodwarm.js
  (opt-in, default off, byte-identical unconditional behavior),
  driver (scripts/warmthrestr2-trace-b.js), analyzer
  (scripts/analyze-warmthrestr2-b.js), guard + ON + R1 + R2 corpora
  (40 files), four census JSONs, evidence file (this file), proof
  script (scripts/test-warmthrestr2-b.js).
- Measurement only: no src/js change, no policy-default change, no
  wording change. No [needs-eyes]: no wording is changed, and the
  played lines are the already-landed woodcarry lackingLines,
  sense-read here.
- Report: committed, pending coordinator merge. Verdicts R1 GO
  (GUARD-EQUIVALENT) + R2 GO (GUARD-EQUIVALENT) on pinned base
  ee3be4fc5f4e3561e6f98df359e680d70a4d8b8e: both restraints hold
  the 3-night guard strand on seed 15215 with zero warmth benefit
  retained (0/4 spends, 0/7 staged), no base drift, proof all green,
  Steve-call stays open with the two-way sharpened and the
  daytime-wood-recovery third path named.
