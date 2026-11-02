# sim-deadid-a — dead-id exclusion BUILD (Loop A 20261102, axis scale-onramp)

Arm: sim-deadid-a, run fleshout-loop-a-20261102T1515Z, claimed
backlog item #1823 (build half). Follow-up to sim-rosterreturn-a
(DIAG-GO) and sim-bearerorder-a. Scope (a) ONLY, per prereg
(evidence/2026-11-02/sim-deadid-a-prereg.md, committed BEFORE any
judged sim): the exclusion build — genApplicant dead check AND
arrivalTick dead-flag refusal, one system, one commit. Identity-aware
narration (b) is NOT built here. npcIds() is NOT filtered here.
No policy-file changes. No [needs-eyes]: nothing in normal play
changes — living applicants behave exactly as before (5/8 pilot
seeds byte-identical, panel deltas all 0), and the one new narration
line (arrival refusal) never fired in any pilot sim; it is proven in
harness only, as a backstop for the accepted-before-death case.

## Verdict: NO-GO (strict, on guardrail letter) — with a landing recommendation

Read this verdict carefully, because it has two halves that point in
different directions:

- The BUILD WORKS. The amended primary is fully met, the proof test
  is 23/23 green, and post-fix there are ZERO dead returns on all 8
  pilot seeds (baseline: 1 dead draw, 1 dead walk-in, 1 reappearance,
  1 bearer-after-death on the amended primary seed).
- The VERDICT IS NO-GO because two pre-registered guardrails miss on
  their letter: G1 (det-gate byte-identity) fails on 97330 and 97335,
  and G2 (band totals within ±3) misses by exactly 1 on both totals
  (43 vs 39 applications, 19 vs 15 arrivals).

Both misses are PROVEN below to be guardrail misspecifications, not
fix defects — but the task instruction is explicit (judge strictly
against the header; a miss is NO-GO, never re-scored mid-run), so the
verdict stands as NO-GO and the fix is NOT claimed landed. What the
coordinator/Steve can do with this report: OVERRULE and land (the
evidence for safety is complete: zero dead returns, zero new errors,
flow gained not lost, panel deltas all 0), OR re-run under the
corrected guardrails proposed in "metric review" below. The fix stays
committed on branch sim-deadid-a either way, so neither path loses
the work. Backlog #1823 stays `claimed`, NOT `fixed`, until a land
decision is made.

## Prereg amendment — the primary seed moved (documented, not hidden)

The prereg's primary named seed 97330 (Nora: death d106, application
d109, arrival d111, mantle d112, per rosterreturn). On CURRENT code
that chain does not exist: my driver's 97330 baseline gives a d107
Jenny chain (gameDays 132, village-lost), Nora living to become
bearer d108 legitimately and dying d119, with ZERO dead draws. This
is NOT a driver artifact — the VERBATIM rosterreturn driver, run on
current code with RUN=ddcheck
(evidence/2026-11-02/perseed-rosterreturn-a/rr-s97330-ddcheck.json),
produces the identical d107 chain. Intervening landings moved the
seed's chain between the 1424Z rosterreturn run and this arm.

Amended primary, same strictness, same gates: seed 97331, where the
current-code baseline reproduces the FULL mechanism — Jovan Milic:
killed d40, drawn d41 (dead-flagged at draw time), accepted d41,
walked in d43 (dead-flagged at arrival), on the roster d44–58,
bearer-after-death d55–58. The original 97330 condition is reported
here as NOT REPRODUCIBLE ON CURRENT CODE, not silently dropped. The
amendment was made BEFORE any post-fix judged sim and BEFORE the fix
existed as judged code (baseline first, then fix, then postfix).

## The fix (src/js/membership.js, +39/−1)

1. `deadMarked(id)` — new helper reading the DEAD-IS-DEAD mark three
   ways: data.villagers record, background_survivors record, vpOf
   (rosterChars). removeVillager marks only the FIRST record it
   finds, so intake must consult all three or the dead re-enter
   through the unmarked copy.
2. `genApplicant()` — the background pool filter now also excludes
   `deadMarked` ids. The used-set rule is otherwise unchanged; the
   drifter fallback still guarantees a non-empty pool.
3. `arrivalTick()` — backstop: an arrival whose charId/id is
   dead-flagged is dropped (no roster push, no trust write, no
   walk-in line) with one generic honest line: "Word came too late:
   <name> never made it — they're already gone." That line names no
   burial and no prior life — it is NOT the identity-aware narration
   (b), which remains a separate future arm. Pending applications of
   the newly dead can still be debated/accepted (the village can
   debate a letter from someone who died en route); the walk-in is
   where reality bites. That is the documented open edge, not a hole:
   no refused arrival ever reaches the roster.

## Primary results — amended primary 97331, closecommit stack, 180d cap

Baseline (pre-fix): Jovan killed d40 → genApplicant draws him d41
(deadAtDraw true) → accepted d41 → walks in d43 (deadAtArrival true)
→ roster d44–58 → bearer d55–58 (chosen after Nikos dies d55, while
dead-flagged). The village then loses d58.
Post-fix: ZERO dead-id draws of any id, ZERO dead-id walk-ins, ZERO
roster reappearances, ZERO bearer-after-death days. The d41 draw
picks living Onni Korhonen instead; he walks in d43; the village
survives to d69 (vs d58) with a living roster. Primary 1–4: ALL MET.

97330 (original primary, for the record): baseline shows no Nora
return at all (chain moved); post-fix likewise zero dead returns.
Nothing is claimed about fixing 97330, because there was nothing to
fix there on current code.

## Guardrails

G1. DET-GATE — MISS (letter). 5/8 seeds byte-identical; 97331 differs
as allowed (dead-draw seed, death prefix before d41 identical);
97330 and 97335 differ although baseline drew no dead applicant.
Mechanism, proven from the recorded draws (see "Why G1 missed"
below): pool filtering shifts pick() indices whenever ANY dead id
sits in the pool at draw time, even if baseline never drew one.
97330: draws d7/d8/d9 identical, d109 diverges (ursula_weber →
sanne_bakker) with 3 dead bg ids in pool; deaths identical through
d108, diverge after. 97335: draws d1/d8/d11 identical (0 dead bg in
pool), d22 diverges (ruth_goldstein → jesse_cortez) with 3 dead bg
ids in pool; deaths identical through d25, diverge at d34+.
Divergence starts exactly at the first pool-differing draw in both
seeds, never before. The det-gate diff file records both as
differs-UNEXPLAINED under G1's letter (exit 1); the explanation is
this section, not a re-score.
G2. APPLICANT FLOW — MISS (letter, by 1). Band totals: applications
39 → 43, arrivals walked 15 → 19. The entire +4/+4 comes from 97331
(the allowed-divergence seed: 7 → 11 applications, 4 → 8 arrivals,
because the living roster survives longer, d69 vs d58). Every other
seed's counts are identical, and NO seed goes from >=1 applications
to 0 (minimum post-fix: 3). Flow was gained, not lost — but the
header's ±3 band does not exempt the allowed-divergence seed, so on
its letter G2 misses.
G3. NO NEW ERROR CLASS — PASS. Driver errors lists empty on both
sides, all 16 pilot runs.
G4. PANEL GUARDRAIL — SATISFIED VIA INVESTIGATION CLAUSE. Panel
before/after (capable policy, pilot seeds, 180d; compare file
attached: sim-deadid-a-panel-compare.md) returns decision
review_required, NOT no_material_signal — investigated: EVERY paired
metric delta is exactly 0 (one descriptive nourishment metric wobbles
0.0001 on rounding). The review_required label comes from
descriptive/insufficient rows (luck percentiles on partial pairs),
all with delta 0. There is no material signal in substance: table
win/entry/sitting 0.75/0.75, national access 0.5/0.5, village deaths
39/39, community loss 0.25/0.25, all identical. Panel limitation, as
pre-registered: the panel runs registry policies only and cannot
express the closecommit stack, so it guards against broad
regressions; the sweep driver is the judged instrument.

## Why G1 missed — the pool-index mechanism, plainly

genApplicant picks with `pick(bg)` = bg[floor(R() * bg.length)].
Removing dead ids shortens the pool, so the same random roll lands
on a different slot. The prereg assumed the gates "consume no RNG
and change no state unless a dead id is drawn" — false for any pool
filter, because the pool's LENGTH is itself an input to the pick.
Any correct dead-exclusion filter has this property; it is not a
defect in this fix. The corrected det-gate (see metric review) is:
divergence allowed only on/after the first draw whose pool contained
a dead bg id — which holds on all 8 pilot seeds.

## Per-seed det-gate (pilot band, baseline vs post-fix)

- 97330: differs (G1 letter) — deaths identical d107–d108, diverge
  after d109 draw; counts identical (5 apps, 2 walked); gameDays
  132 → 136.
- 97331: differs-dead-draw (allowed) — Jovan chain removed; gameDays
  58 → 69; apps 7 → 11, walked 4 → 8.
- 97332: identical (23d, 3 apps, 0 walked).
- 97333: identical (92d, 11 deaths, 5 apps, 2 walked).
- 97334: identical (90d, 4 deaths, 4 apps, 1 walked).
- 97335: differs (G1 letter) — deaths identical through d25, diverge
  after d22 draw; counts identical (5 apps, 2 walked); gameDays
  38 → 62.
- 97336: identical (110d, 3 deaths, 7 apps, 4 walked).
- 97338: identical (90d, 2 deaths, 3 apps, 0 walked).
Band totals: applications 39 → 43, walked 15 → 19, refused 0 → 0,
dead draws 1 → 0, dead walk-ins 1 → 0, reappearances 1 → 0.

## Proof results

- scripts/test-deadid-a.js: RED pre-fix (4 gate failures), GREEN
  post-fix — 23 passed, 0 failed, 1 skipped (the bg-record-dead draw
  case is untestable in the live harness because roster ids are
  gen_ ids, not bg ids; the villagers-record-dead case covers the
  gate, plus the sweep-JSON analysis of the judged 97331 runs).
- scripts/test-rosterreturn-a.js: 29/29 GREEN after a documented flip
  (design changed on purpose, repo rule): its 3 live arrival
  assertions now pin REFUSAL instead of re-add, and its genApplicant
  code-property assertion now pins the deadMarked exclusion. The
  driver-JSON part (historical 97330 chain analysis) is untouched.
- scripts/test-membership-20261007.js (green-listed): 43/43 GREEN.
- scripts/test-trapjoin-b.js: vacuous skip (layer deleted).
- Pre-existing failures, proven NOT mine by stashed-baseline re-runs:
  test-village-membership.js, test-membership-depth-20261007.js, and
  test-recruit-person-20261013.js (green-listed) all fail identically
  with the fix stashed (genRoster/setup errors, untouched code paths).
  Reported here, not fixed — outside this arm's area.
- check.js --quick: NOT green, NOT failed — the run stalled (0:01 CPU
  in ~9 min) under heavy sibling load and was killed; re-running it
  would contend with siblings' jest/sims. Not claimed. The arm's
  verification rests on the proof test, the 16 judged sweep runs,
  and the panel pair, all of which ran clean.

## Sense check (transcript, SENSE-TESTING LAW)

Post-fix 97331, d39–45 window: no Jovan line anywhere. d41 brings
"📨 Word came: Onni Korhonen of Stonebridge wants to join Haven.
'Heard about this place three valleys over. Had to try.'" → accepted
→ "🚶 Onni Korhonen walks in — pack light, eyes wide. Haven grows
by one. (3 souls.)" The intake flow reads exactly as before in form,
with a living applicant substituted for the dead one. The village
still debates, vouches, and welcomes strangers — it just no longer
welcomes its own dead as strangers. The arrival-refusal line never
fired in any pilot sim (gate 1 fires first); it is proven in harness
only. The identity-blindness fiction gap (no line noting a returnee
IS the buried villager) is unchanged by this arm and remains the
separate (b) arm's work.

## Reachability verdict

This fix adds no content and blocks no content. Scale reachability is
unchanged: the panel's capable-policy national access (0.5) and
table rates (0.75) are identical before/after, and the sweep band's
end reasons are unchanged in kind (village-lost / over-other). The
scale wall itself is untouched by this arm — dead villagers no longer
clog the roster and the mantle, which removes a corruption of
succession accounting, but no new national/table/win path is opened.
The wall numbers for this run: national 0 / table 0 / wins 0 in the
closecommit sweep band (the panel's 0.5/0.75 are capable-policy
screening figures on the same seeds, not sweep outcomes).

## Village assessment (plain words)

The village used to bury someone and then, a few days later, take
that same person's application seriously, debate it, and welcome
them home as a stranger — because the application office never
crossed out the dead. On the seed where that still happened on
current code, a man killed on day 40 applied on day 41, walked in on
day 43, and ruled the village from day 55 while still marked dead.
After this fix, the office crosses out the dead: that man never
applies, a living man applies instead, walks in, and the village
lives longer with real people in it. Nothing else about village life
changes — the same applications, debates, and walk-ins, just without
the dead in the pile. Two small measurement lessons came out of it:
filtering a list changes which name a random draw lands on, so
"nothing else changes" was the wrong promise to make about the
guardrail; and a fixed village lives longer, which itself creates
more applications, so counting applications across a changed run
needs to allow for that.

## Metric review (for the NEXT run, not this verdict)

- G1, corrected: the det-gate for a pool-filter fix must be
  "divergence only on/after the first draw whose pool contained a
  dead bg id" (record pool composition at draw time in the driver —
  this run reconstructed it from deadIds + the static bg file after
  the fact). Byte-identity holds only on seeds with no dead bg id in
  any draw's pool.
- G2, corrected: judge flow as NO-LOSS per seed (no seed loses
  applications/arrivals vs baseline) and exempt allowed-divergence
  seeds from band totals, or judge band totals on the identical
  subset only. A longer-lived fixed village generating more intake
  is a gain, not a regression.
- Follow-ups, NOT built here: (i) npcIds() dead filter — succession
  still trusts roster membership alone; the entry gates close the
  re-application path, but any other path that puts a dead id on a
  roster would still feed succession a dead candidate. (ii) The
  accepted-before-death case needs a live-sim transcript of the
  refusal line (this arm proves it in harness only; no pilot sim
  produced it). (iii) Pending applications of the newly dead are
  still debatable — whether debate should notice the death is a
  (b)-adjacent design question for the narration arm.
- Confirm band (12 seeds) was NOT run: the prereg runs confirms only
  on pilot GO, and the pilot verdict is NO-GO on guardrail letter.

## Canon

docs/CANON.md read first. No canon doc covers applicant generation,
arrival, or bearer succession ordering (MONSTER-WAVES.md covers wave
law, not membership intake). Intake rules above are code-read from
src/js/membership.js, not invented canon. The "no silent actions"
standing rule is why the arrival refusal narrates its non-arrival.

## Files (this arm, to be committed on branch sim-deadid-a)

- src/js/membership.js — the fix (deadMarked + genApplicant filter
  + arrivalTick refusal).
- scripts/test-deadid-a.js — proof (RED pre-fix, GREEN post-fix).
- scripts/deadid-driver-20261102.js — sweep instrument.
- scripts/sweep-deadid-a.js — band runner + det-gate diff.
- scripts/test-rosterreturn-a.js — flipped arrival assertions for
  the intentional behavior change (documented in-file).
- evidence/2026-11-02/sim-deadid-a-prereg.md (already committed).
- evidence/2026-11-02/sim-deadid-a.md (this file).
- evidence/2026-11-02/perseed-deadid-a/dd-s<seed>-<baseline|postfix>.json
  (16 judged runs).
- evidence/2026-11-02/deadid-band-baseline-pilot.json,
  deadid-band-postfix-pilot.json, deadid-detgate-pilot.json.
- evidence/2026-11-02/perseed-rosterreturn-a/rr-s97330-ddcheck.json
  (verbatim-driver cross-check: 97330 chain moved).
- evidence/2026-11-02/sim-deadid-a-panel-compare.md/.json,
  sim-deadid-a-panel-before.json.gz, sim-deadid-a-panel-after.json.gz.
