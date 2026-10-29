# sim-hunthold-a — HUNT-HOLDS-THROUGH-DANGER LEVER: PILOT NO-GO (mechanism works, wave-4 proof missing, guards miss)

Run: build-gaps, arm build-pickdepart.
Axis: scale-onramp (blocking axis, converging, NOT converged).
Worker: build-pickdepart.
Assignment: HUNT-holds-through-danger lever candidate, SECOND step
from sim-pickdepart-a, AFTER the sim-departhold-a recorder
DIAG-GO. POLICY-SIDE ONLY, zero src/js, default OFF
(HUNTHOLD=1 gated). A GO verdict would have meant GO CANDIDATE
as an instrument, default-OFF only — landing live behavior is
a coordinator/Steve call, NOT made by this arm. No default
flips were made.
Preregistration (binding, committed BEFORE any judged run):
evidence/2026-10-29/sim-hunthold-a-prereg.md (commit 53292fb03
on branch build-pickdepart), plus a pre-run correction commit
(169b6467c: the recorder's hold record is action 'held-ready'
with SUB 'other-held', not an action — corrected before any
judged band ran, on smoke-seed evidence, with the substance
of the mapping unchanged). This evidence judges the lever
against that prereg. No metric was changed mid-run. The
analyzer exits 1 on any non-GO verdict by design; the
analysis JSON is written before exiting, and two analyzer
runs reproduce it byte-identically.

VERDICT: PILOT NO-GO — on three legs: the mechanism leg (P1),
the starvation guard (G1), and the wall guard (G2). The
count leg (P2), the completeness/instrument leg (P3), the
hygiene leg (P4), and the no-held-starvation guard (G3) all
pass. Because the pilot does not pass every leg, NO confirm
band runs (prereg: confirm only after a pilot GO). The lever
stays default-OFF. This NO-GO is not a kill of the mechanism
(kill discipline): the mechanism demonstrably works — 209
holds, 9 budget exhaustions, 71 waiting lines, and a clean
held-then-departed chain in the wild — but it did not
produce the wave-4 proof the prereg demands, and the band's
guards moved the wrong way. What the pilot does instead is
surface a second, unpreregistered finding: a wave-4 hunt
that died by being drafted as a guard, joined to the pick
by a stale huntMid the conversion never clears (see
"Corrected reading", below — reported, NOT re-scored).

## Plain words first

A villager who decides to go back for a big beast, and finds
the road looking a bit dangerous, now waits instead of
quietly swapping the hunt for housework. That waiting works:
across eight villages, hunts were held 209 times, and one
man waited through five dangerous afternoons for a small
beast and then walked out when the road cleared. But on the
big hunts — the wave-4 beasts this arm is judged on — the
waiting never got its chance. Both wave-4 hunts in the lever
villages walked out without ever needing to wait: one left
on a clear road, and the other left as someone else's
bodyguard, not as a hunter at all. And the villages with
the waiting rule did slightly worse on the guardrails: one
more villager starved, and fewer villages ever reached
wave 4. So the waiting rule is real, but this pilot cannot
say it helps the big hunts — and the rules it was judged
by say that is a NO-GO, not a maybe.

## Header (pre-registered) vs result

Substrate (named, never switched): tableseat-nowait, 180d
death-aware, LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
FIELDPARTY=1, RETURNS=1, FUNNEL=1, DEPARTHOLD=1 IN BOTH
corpora (the recorder is the instrument and must run in
both). Install order: hunthold FIRST, then the recorders,
so the recorder wraps outside the lever. Corpora:
evidence/2026-10-29/perseed-hunthold-off/ (HUNTHOLD unset)
and perseed-hunthold-on/ (HUNTHOLD=1), 8 seed rows +
summary.json each. Instrument committed before either
sweep ran; nothing else committed until sweeps + analysis
were done. Analyzer: scripts/test-hunthold-a.js (pure
reads over both corpora + src/data/monsters.json wave
lookup). Fixtures: scripts/test-hunthold-a-fixtures.js
(13/13). Lever: scripts/policies/hunthold.js (HUNTHOLD=1,
MAX_HOLD = 6, held verdicts ask/tighten only, defer never
held, engine early returns untouched, one waiting line on
the first hold when the player is at haven).

- P1 MECHANISM — at least one ON primary pick with >= 1
  lever hold AND a pick-linked departure after the hold(s):
  RESULT 0 such picks (ON primary heldLeverEvals = 0 for
  both picks) -> FAIL.
- P2 COUNT NOT WORSE — ON primary departed >= OFF primary
  departed: RESULT ON 2 >= OFF 1 -> PASS (but see the
  corrected reading: one of the ON 2 is a GUARD departure
  joined on a stale huntMid; HUNT-kind departures are
  ON 1 vs OFF 1 — the leg passes either way, and the
  verdict does not rest on this leg).
- P3 COMPLETENESS + INSTRUMENT — 100% of ON primary
  classified, 0 unknown; 0 unexplained other-held in
  either corpus; no recorder action 'other' on wave-4
  objectives; every ON overwrite carries a danger verdict
  + subtype: RESULT unknown 0, onOther 0,
  onOtherHeldUnexplained 0, offOtherHeldUnexplained 0,
  onOverwriteWithoutVerdict 0 -> PASS.
- P4 HYGIENE — every recorder errs 0 + overflow empty in
  both corpora, recorder installed in both, lever store
  present in ON (errs 0) and null in OFF: RESULT
  hygieneOk = true -> PASS.
- G1 STARVATION — starvationDeaths ON <= OFF: RESULT
  ON 2 > OFF 1 -> FAIL.
- G2 WALL — wins ON >= OFF wins AND wave-4 reach ON >=
  OFF wave-4 reach: RESULT wins 3 = 3 (pass) but wave-4
  reach 4 < 6 -> FAIL.
- G3 NO HELD STARVATION — zero held villagers starve
  while holding, any wave: RESULT heldStarvation = [] ->
  PASS.
- OVERALL: PILOT GO requires ALL legs -> PILOT NO-GO
  (P1, G1, G2 fail). No confirm band. The lever stays
  default-OFF.

## Judged numbers

Primary universe, ON corpus (2 picks, both seed 75107,
both monster influencer, wave 4):

| villager | pick | class (prereg) | holds | fate, as recorded |
| --- | --- | --- | --- | --- |
| visjoin_171 | d176 part 700, huntDay 174 | departed-pick-linked | 0 | departure part 701 day 176, danger go/1, genuine HUNT departure |
| visjoin_171 | d177 part 706, huntDay 176 | departed-pick-linked | 0 | departure part 708 day 178 — but the departure record is kind GUARD, purpose guard (see corrected reading) |

Primary universe, OFF corpus (2 picks, both seed 75106,
both eulogy, d135 part 536 — the recorder band's own
picks, reproduced exactly):

| villager | class | fate |
| --- | --- | --- |
| visjoin_113 | superseded-by-needs-pick | first later pick part 539 chose EAT |
| visjoin_115 | departed-pick-linked | departure part 544, genuine HUNT departure |

Classes: OFF {needs 1, departed 1}; ON {departed 2}.
Departed counts: OFF 1, ON 2 (prereg join); HUNT-kind
departures: OFF 1, ON 1 (corrected reading).
Wave-lookup coverage complete: unknownWave = [].

## Guards (prereg-scored G1-G3 above; the rest reported)

OFF vs ON totals:

| guard | OFF | ON |
| --- | --- | --- |
| starvation deaths | 1 | 2 |
| deaths total | 286 | 236 |
| median days | 146 | 153 |
| wave-4 reach (seeds) | 6 | 4 |
| wins | 3 | 3 |

Per-seed OFF (days/wave/won/starvation/deaths):
75101 d132/w4/won1/0/34; 75102 d180/w4/0/44;
75103 d132/w4/won1/0/28; 75104 d90/w3/won1/0/24;
75105 d180/w4/0/48; 75106 d146/w4/0/40;
75107 d180/w3/0/31; 75108 d102/w4/0/starvation 1/37.
Per-seed ON (days/wave/won/starvation/deaths/holds):
75101 d90/w3/won1/0/17/10; 75102 d90/w4/won1/0/24/31;
75103 d158/w4/0/29/15; 75104 d153/w4/0/45/26;
75105 d135/w3/won1/0/37/24; 75106 d180/w3/0/36/48;
75107 d180/w4/0/34/54; 75108 d28/w2/0/starvation 2/14/1.
The OFF band reproduces the recorder band's wall numbers
exactly (286 deaths, median 146, wave-4 6, wins 3,
starvation 1) — the fresh OFF baseline is sound, and the
drift comparison agrees (departhold-ON primary 2,
departed 1; fresh OFF primary 2, departed 1).

The two ON starvation deaths are both seed 75108, day 26
(ruby_callaghan, gen_ib98rb6); the OFF starvation death
is also seed 75108, day 23 (adaeze_nwosu). Seed 75108's
ON village collapsed at day 28 (vs day 102 OFF) with a
single lever hold recorded all seed. G3 holds: neither
ON starvation death was a villager holding an open HUNT
pick — the guard failure is a band-total difference on
one early-collapsing seed, not a demonstrated case of
the hold starving its holder. That context does NOT
rescue G1: as written, G1 counts totals, and 2 > 1 fails.

## The lever did work (secondary census, reported not judged)

The lever's own store (ON corpus): holds 209, budget
exhaustions 9, waiting lines narrated 71, errs 0. The
recorder agrees exactly: 209 held-ready/other-held
evaluations (the store count and the recorder count
match 1:1), 9 overwritten evaluations (every exhaustion
restores base behavior, as designed), 148 departed
evaluations, 332 held-ready evaluations total. OFF
corpus: other-held 0, holds 0, overwrites 81 — the
lever's OFF state moves nothing (overwrites fall from
81 OFF to 9 ON across all HUNT evaluations because
most non-'go' verdicts are now held, not overwritten).
ON danger verdicts on held evaluations: ask/2 (116),
tighten/4 (40), ask/3 (28), tighten/5 (25) — moderate
danger only. The 9 ON overwrites carry ask/2 (7) and
tighten/4 (2) and match the 9 budget exhaustions
exactly. Notably, NO defer verdict ever fired on a
HUNT evaluation in either corpus: OFF overwrites (81)
are ask/2 (45), ask/3 (23), tighten/4 (8), tighten/5
(5), and ON overwrites are ask/tighten only — so the
lever's held set (ask/tighten) covered 100% of the
overwrite verdicts this band actually produced, while
the defer-never-held rule went unexercised (a defer
hold is still untested by any band). Delegated ON
evaluations carry duplicated danger records (lever
pre-check plus the engine's identical re-check —
22/22 sampled pairs exact duplicates); the analyzer
dedupes them.

The funnel-pick secondary census is nearly blind to
these holds, and the next prereg must fix that: funnel
records picks ONLY for wave-4 memory holders (or
wave-4 HUNT choosers), so the ON corpus has just 8
funnel picks total (vs 92 OFF — trajectories diverged
and wave-4 memories grew rarer under the lever), and
the secondary census reports 0 picks with holds, 0
held-then-departed, 0 held-before-overwrite — not
because holds did not happen, but because the 209
holds happened on villagers outside the funnel
universe. The evaluation-level census (209 holds) is
the true secondary picture; the pick-level secondary
census is an artifact of the funnel's narrow universe.

## Corrected reading (reported, NOT a re-score)

The prereg's departure join (verbatim from departhold:
same vid, same huntMid, dep.part >= pick.part, no
intervening pick) does NOT filter by departure kind.
It misfires once in this band, and the misfire matters
enough to name precisely — while changing nothing
about the verdict (P1 fails, G1 fails, G2 fails with
or without it; P2 passes either way):

- ON pick 2 (visjoin_171, influencer, d177 part 706)
  is joined to departure part 708 whose record reads:
  kind GUARD, purpose guard, targetVid visjoin_155,
  tx 5, ty 5, huntMid influencer, huntTx 4, huntTy 5,
  huntDay 176. The villager did NOT depart as a hunter.
  Between the pick (706) and the next funnel pick
  (WATER, 712), the villager was drafted as a companion:
  objAskCompanion rewrites a companion's objective to
  GUARD (kind, purpose, state, target, companion) but
  never clears huntMid/huntTx/huntTy/huntDay — the
  stale provenance then joins to the HUNT pick. The
  HUNT decision died by being drafted, not by danger,
  not by needs, not by departure. The taxonomy has no
  class for this fate; under its first-later-pick rule
  the pick would read as superseded-by-needs-pick
  (WATER at 712), which is equally wrong about the
  mechanism. The honest class is a missing one:
  guard-drafted (companion-ask conversion).
- The same stale-provenance shape exists on the
  overwrite path (objTightenOrDefer / inline defer
  rewrite kind/purpose/indoor/state but never clear
  huntMid) — which is why a post-overwrite chore can
  still carry a huntMid. objPick is the only writer
  that clears hunt fields. A future fix should clear
  hunt provenance on every objective conversion, or
  the join must filter by kind.
- Corrected counts under a kind-filtered join
  (departure objective kind == 'HUNT'): OFF departed 1
  (visjoin_115, genuine), ON departed 1 (visjoin_171
  pick 1, genuine). P2 under the corrected reading is
  1 >= 1 (still pass); P1 is still 0 held-then-departed
  (still fail). The verdict is NO-GO under either
  reading. The next run's prereg must pre-register the
  kind-filtered join and a guard-drafted class before
  judging any departure count again.

## Sense bar: verdict chains, verbatim from the ON corpus

WAVE-4 PICK 1 (the genuine departure — no hold, and
that is the point: the road was clear):

PICK s75107 visjoin_171 influencer d176 part=700 huntDay=174
-> departed-pick-linked (dep part=701 day=176)
  EVAL part=701 d176 dayPart=1 atHaven=true fresh=false
  action=departed sub=null reason=null
  danger=[{"verdict":"go","score":1}] heldByLever=false
  heal=[{"satOut":false,"cached":false}] tighten=[]
  depart=[{"ret":true,"postState":"out"}]

WAVE-4 PICK 2 (the guard draft — the chain the prereg
taxonomy misreads as a departure):

PICK s75107 visjoin_171 influencer d177 part=706 huntDay=176
-> departed-pick-linked (dep part=708 day=178, prereg join)
  (no evaluation records for this pick)
  Departure record, verbatim fields: kind=GUARD,
  purpose=guard, targetVid=visjoin_155, tx=5, ty=5,
  huntMid=influencer (stale), huntDay=176.
  Next funnel pick: WATER part=712 day=179.

ALL-WAVE HOLD CHAIN (the mechanism working as designed,
wave-1 sanjun — quoted because the wave-4 chains show
no holds at all, and the mechanism claim must rest on
a chain that actually holds):

CHAIN s75102 stan_kowalski sanjun wave=1
  EVAL part=161 d41 dayPart=1 action=held-ready
  sub=other-held danger=["ask/2"] pre=HUNT/ready
  post=HUNT/ready
  EVAL part=162 d41 dayPart=2 action=held-ready
  sub=other-held danger=["ask/2"] pre=HUNT/ready
  post=HUNT/ready
  EVAL part=164 d42 dayPart=0 action=held-ready
  sub=other-held danger=["ask/2"] pre=HUNT/ready
  post=HUNT/ready
  EVAL part=165 d42 dayPart=1 action=held-ready
  sub=other-held danger=["ask/2"] pre=HUNT/ready
  post=HUNT/ready
  EVAL part=166 d42 dayPart=2 action=held-ready
  sub=other-held danger=["ask/2"] pre=HUNT/ready
  post=HUNT/ready
  EVAL part=168 d43 dayPart=0 action=departed sub=null
  danger=["go/0","go/0"] pre=HUNT/ready post=HUNT/out

Judgment (SENSE-TESTING LAW): stan_kowalski reads like a
person waiting — five afternoons of mild danger (ask/2,
the same verdict each time: a cautious walk to a near
tile, not a crisis), then a clear road and a walk. The
duplicated go/0 record on the departure is the lever's
pre-check plus the engine's re-check, identical as
designed. visjoin_171's wave-4 picks read differently:
the first is a person walking out on a clear road; the
second is a person whose decision was replaced by
someone else's errand — drafted as a guard — with no
record of the draft except a stale beast-name on a
guard's departure. The lever cannot hold a decision
that no longer exists, and the taxonomy cannot see a
draft it never named. Both gaps are now on the record.

## What this does NOT prove

- The lever is NOT proven to help wave-4 hunts: zero
  wave-4 picks were held in this band, so the held-then-
  departed pattern is unobserved at wave 4. The wave-1
  chain proves the mechanism, not the wave-4 effect.
- The guard failures are NOT proven to be lever-caused:
  G1's extra starvation is an early-collapse seed
  difference (day 26, one hold all seed, holder-starvation
  count zero), and G2's wave-4 reach drop (6 -> 4) sits
  on 8 seeds of diverging trajectories (median days UP
  146 -> 153, deaths DOWN 286 -> 236, wins flat 3 = 3).
  The prereg scores the guards as written, so they
  fail — but the evidence does not show the lever
  starving or weakening villages; it shows noisy guards
  on a tiny band, which the next prereg must size
  honestly (see metric review).
- The nikos d173 pattern is NOT re-tested: no wave-4
  pick in either corpus met a non-'go' danger verdict
  while pre-ready. Fresh OFF wave-4 evaluations: 6,
  wave-4 overwrites: 0 (the 81 OFF overwrites are
  all-wave); ON wave-4 evaluations: 1 (pick 1's go
  departure). The hold's value for the exact nikos
  shape (a wave-4 hunt facing ask/tighten the part
  after picking) remains unobserved in a band, though
  the wave-1 chain shows the shape working.
- The fresh-pick-in-call scope limit is NOT measured
  for wave-4: fresh-pick overwrites on primary picks = 0
  in both corpora (no fresh-pick wave-4 overwrite
  occurred to count).

## Metric review (for the NEXT run — never a mid-run re-score)

(a) KIND-FILTERED DEPARTURE JOIN (required): the next
prereg must join departures to picks on kind == 'HUNT'
(or purpose == 'hunt') in addition to vid + huntMid +
part, and must add a guard-drafted terminal class (a
pick whose objective was converted to GUARD by a
companion ask before any departure or later pick).
Without this, departure counts overstate HUNT
departures whenever a hunter is drafted.
(b) STALE huntMid PROVENANCE: objAskCompanion,
objTightenOrDefer, and the inline defer overwrite
should clear huntMid/huntTx/huntTy/huntDay on
conversion (objPick already clears them on fresh
picks). Until then, every join on huntMid must filter
by kind, and every census must say so.
(c) FUNNEL-UNIVERSE BLINDNESS: the secondary census
must census holds from evaluations directly (all
HUNT objectives, all waves), not via funnel picks —
funnel's wave-4-memory-holder universe captured 0 of
the 209 holds. The primary universe stays funnel-based
(wave-4 HUNT picks), but the lever's activity census
must be evaluation-based.
(d) GUARD SIZING AT n = 8: starvation totals and
wave-4 reach swung on single seeds (75108's day-26
collapse; 75101/75105/75106 losing wave-4 while
75104/75107 gained it). The next prereg should either
set guard tolerances (e.g. starvation within +1, wave-4
reach within -1) with reasons stated BEFORE the run,
or run the confirm band at 16+ seeds for guard
stability — it must not re-score this pilot's guards
with tolerances invented after seeing them.
(e) MAX_HOLD = 6: the stan_kowalski chain used 5 holds
and departed on go before exhaustion; 9 exhaustions
occurred band-wide. Whether 6 is the right budget, or
the budget should count days rather than evaluations,
is still open — the exhaustion cases should be
inspected for whether the overwrite-after-wait reads
as giving up or as the same silent swap delayed.
(f) FRESH-PICK-IN-CALL scope: still unmeasured for
wave-4 (0 occurrences). If the next band produces a
fresh-pick wave-4 overwrite, the restore-vs-scope
question reopens with data.
(g) The waiting line fired 71 times (once per held
objective, player at haven only). Whether it reads
well on a phone is a [needs-eyes] question for the
coordinator — this arm's sims cannot judge feel.

## Reproducibility

- Analyzer: scripts/test-hunthold-a.js (pure reads;
  node --check clean; determinism: two runs
  byte-identical output, and both reproduce the
  judged analysis JSON byte-identically).
  Run: node scripts/test-hunthold-a.js --sense --out
  evidence/2026-10-29/hunthold-a-analysis.json ->
  primary OFF 2 (needs 1, departed 1), ON 2
  (departed 2, prereg join), unknown 0; instrument
  onOther 0, unexplained 0/0; guards as above;
  legs P1 false, P2 true, P3 true, P4 true, G1 false,
  G2 false, G3 true; verdict NO-GO (exit 1 by design).
- Fixtures: node scripts/test-hunthold-a-fixtures.js
  -> 13/13 pass (every verdict, budget, early return,
  narration-once, OFF env-gate, heldByLever mapping).
- Sweeps: node scripts/test-hunthold-a-sweep.js
  (OFF, then HUNTHOLD=1 ON), seeds 75101-75108, both
  corpora corpusOk = true, all recorder errs 0,
  overflow empty, lever errs 0.
- Corpora (read-only after the run, never overwritten
  by later work): evidence/2026-10-29/
  perseed-hunthold-off/ and perseed-hunthold-on/
  (8 rows + summary.json each). Smoke corpora used
  for the pre-run correction live outside the repo
  (scratch, not judged).
- Zero src/js diff on this branch (verified at
  closeout). No push, no bump, no live verification
  (ship-loop line). No confirm band (pilot NO-GO).

## Commits

- 53292fb03 prereg (before any judged run).
- 5efb16be2 instrument: lever + sweep + analyzer +
  fixtures (policy-side, HUNTHOLD=1, zero src/js).
- 169b6467c prereg correction (pre-run): other-held
  is a recorder SUB under held-ready action, not an
  action; analyzer/fixtures/sweep/policy comment
  corrected to match.
- Analysis JSON + this evidence: final commit(s) on
  this branch (hashes in the run report to the
  coordinator).

## Convergence

scale-onramp stays converging (NOT converged): the
departure-hold lever is built, proof-tested, and
measured — and its pilot says NO-GO on the wave-4
proof and the guards, while proving the hold mechanism
itself and exposing the guard-draft loss path the
taxonomy never named. The next step is not another
lever on the same guess: it is the kind-filtered join
+ guard-drafted class + stale-provenance fix, then a
re-judgment on a band where wave-4 picks actually
meet non-'go' danger. The full seat stays 0, wave 5
stays 0, and no wave-4 field party has yet killed in
the field. The directive stands until the tracker
records this axis converged on measured evidence.
