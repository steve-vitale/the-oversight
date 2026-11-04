# Loop B run fleshout-loop-b-20261104T0046Z — food-economy (coordinator evidence)

Axis: food-economy (second non-converged axis). Loop A live on
scale-onramp throughout (2315Z at run start, 0115Z fleerepair +
trickavail at closeout) — NOT touched. Win, gap, journey,
ability-use, and goals lanes NOT touched. No gate/price/deed
changes anywhere in this run. Zero src/js in every landed
commit (instrument + design only).

Claim written before any sims; deleted at closeout. Lock
deleted at closeout.

## Arm 1 — sim-freshband-b: PILOT-GO (fresh-band re-judgment of (v**))

Tracker blank (1) from the 2330Z run, judged on a fresh band
under the envelope draft. Own preregistration committed FIRST
(b43ebb851), before any screen or judged leg: band 83401–83600
inclusive, 200 seeds, 30d, competent policy, verified
interval-disjoint from every consumed band in draft
Requirement 1 AND from 83201–83400; screen AND tracer on ONE
base (worktree base at screen start, never rebased between
screen and judgment); settled verification field adopted
verbatim from sim-verifyfield-b (rows contiguous in loopDay
1..N AND (N == daysAlive OR village-lost with N ==
daysAlive−1 and gameDays == N)); variant (v**) = (e**) OR (F),
first-firing wins, exactly as fixed in the streakfree-cost
prereg (E1 tightened 0.90 → 0.85 peak; (F) falls ≥ 3 AND pantry
≤ 0.80 peak, no streak; (c) verbatim); GO bars carried verbatim
(Stage-1 ≥ 4 collapsing; count gate traced still-collapsing
≥ 4 AND traced survivors ≥ 12; FIRE all; TIE all; STRICT ≥ 50%;
LEAD-ONE ≥ 75%; COST ≤ 25%; CROSS-CHECK all; TRACER with ≤ 1
re-run per leg; still-collapsing exclusion; survivor-drift =
INSUFFICIENT-DATA; survivor sample = FIRST 16 screened
survivors in seed order). P1 (settled field), P2 (descriptive
sensitivity columns), P4 (knife-edge fractions) adopted; P3
(larger survivor sample) NOT adopted — sample stays 16.

Tools + proof (daa696f00): scripts/analyze-freshband-b.js +
scripts/test-freshband-b.js, synthetic series only, no judged
seeds. Proof 70/70 post-rebase. Reused proofs re-run green on
the judging base before judging: streakfree-cost 24/24,
gatediseng 21/21, gatediseng-confirm 11/11.

Stage 1 screen (judging base daa696f00; game code identical
to parent 6e47e1a22): full band 83401–83600, 200/200 lines, 0
verification failures under the settled field. Screened
collapsing 9 (≥ 4 → Stage-1 GO): 83410, 83412, 83413, 83445,
83460, 83503, 83515, 83533, 83582. Survivors 189; first-16
sample 83401–83409, 83411, 83414–83419. Other 2 (lost without
starvation death). Screen rate 9/200 = 4.5%.

Stage 2 tracer legs (same base, no rebase): 25 legs. One
infrastructure incident, reported loudly: the first background
tracer attempt produced a file whose seed order could not be
accounted for (it began at 83533 with the first seven
candidates missing) while its shell showed no child process.
That file was DISCARDED IN FULL — nothing from it enters any
judged denominator — and Stage 2 was re-run in auditable
foreground chunks (5+4+8+8), each verified for seed order and
outcome. The killed background loop's stderr (delivered after
the fact) shows repeated EPERM write errors on its log
appends, consistent with the flap corrupting that attempt.
The judged corpus is the chunked redo only: 25/25 tracer lines
byte-identical to their screen lines; determinism spot-check
3/3; verification 24 exact + 1 loss-day-exempt (83582: rows 23,
daysAlive 24, gameDays 23). Membership 25/25; no
still-collapsing exclusions (9/9 still collapsing); no
survivor drift (16/16 still survivors).

Judged legs (lead = reference day − firing day; (c) via reused
analyzer, (v**) via this arm's analyzer):

| seed | ref | (c) lead | (v**) firing / lead | tie | strict |
|---|---|---|---|---|---|
| 83410 | 21 | 4 | 17 E1 / 4 | yes | no (equal) |
| 83412 | 28 | 20 | 8 F / 20 | yes | no (equal) |
| 83413 | 15 | −1 | 15 E2 / 0 | yes | yes |
| 83445 | 16 | 1 | 14 E2 / 2 | yes | yes |
| 83460 | 28 | 0 | 24 E2 / 4 | yes | yes |
| 83503 | 29 | 3 | 25 E2 / 4 | yes | yes |
| 83515 | 20 | −1 | 8 F / 12 | yes | yes |
| 83533 | 20 | 5 | 13 E2 / 7 | yes | yes |
| 83582 | 20 | 0 | 17 E2 / 3 | yes | yes |

Verdict: PILOT-GO — Stage-1 GO, count gates hold (9 ≥ 4,
16 ≥ 12), FIRE 9/9, TIE 9/9, STRICT 7/9 = 77.8%, LEAD-ONE 8/9 =
88.9%, COST 3/16 = 18.75% (firing survivors 83401 day 13 E2,
83405 day 14 E1, 83408 day 8 F), CROSS-CHECK 0 mismatches on
25/25. Mean lead (v**) 6.2d vs (c) 3.4d, coverage identical
9/9 both. Death-knell firing (lead 0): 83413 alone. This GO
does NOT erase the verifyfield PILOT-NO-GO on 83248 —
different band, different base, nothing pooled; the tie
failure does not recur on this fresh supply. A GO here lands
an instrument file + evidence only; no deploy claim may cite
this pilot alone.

Descriptive only (never judged, never pooled): envelope
sensitivity columns E1 at 0.87/0.88/0.90 holding (F) and (c)
verbatim give IDENTICAL variant days on all 25 traced legs —
no 0.87/0.88 dead zone, no 0.90 gain on this band; the old
corpus's fraction discrimination does not replicate.
Knife-edge visibility: only two E1 firings in the traced set,
both far from any boundary (83410 day 17, 0.7744; 83405 day 14,
0.6604). The envelope fraction is therefore UNIDENTIFIABLE on
this band — the GO is fraction-robust here but is NOT evidence
that 0.85 is the right fraction.

Sense test (plain words): on all three firing evenings read,
the warning would land silently. 83515 day 8 (F, lead 12) is a
hopeful evening (ability gained, grapes sown) whose closest
line notices the day's haul, not the store's three falls.
83413 day 15 (E2, lead 0, death-knell, pantry 1,400) is a
productive evening (acorns worked, a mauling survived) with
no line mentioning the store or the same-day starvation death.
83410 day 17 (E1, lead 4, streak 6) is a knowledge/ability
evening, again with no store line. Framing constraint carried:
a future deploy must frame (v**) as the village store's fall,
never as personal hunger, and must SAY something on the
firing evening.

Evidence: evidence/2026-11-03/sim-freshband-b.md (full,
with metric review), sim-freshband-b-summary.json (verdict
PILOT-GO), sim-freshband-b-tracer.jsonl (25 judged legs).
Merged as b43ebb851 + daa696f00 + d86c1854a (after rebase
onto 488bed90d, proof re-run 70/70).

## Arm 2 — sim-firenarr-b: SPEC-READY (firing-evening narration spec)

Tracker blank (2) from the 2330Z run. DESIGN ONLY: the (v**)
rule is not deployed, so no src/js and no policy files were
written (dead code for an undeployed rule is forbidden).

Sampled 10 firing evenings across 8 seeds from the existing
83201–83400 corpus (descriptive reuse only — no number enters
any judged denominator): E2 cliffs (83230 d13, 83341 d14),
E1 + (F) ties (83248 d18, 83201 d15 survivor), the 83272 d20
0.8496 knife-edge E1, E1s (83336 d21, 83377 d14, 83379 d23),
(F) trailing evenings (83230 d14, 83336 d23). Corpus fact:
(F) never wins a first firing alone here — it ties twice and
trails everywhere else — so the F-first template is specified
from the rule definition, not observed (gap below).

Sense test: on all 10 evenings the warning would land
silently. "Pantry" appears ONLY in the haul line "You keep a
day's food (N kcal) — nothing extra for the pantry this
time" (6/10 evenings); the other 4 firing evenings contain no
pantry word at all. The haul line also speaks on non-firing
recovery evenings, so it cannot carry the warning. Collision
spam counted: "You walk back into Haven… glad to see you"
10×, "This patch is picked clean" 8×, "This patch is worked
out" 9×, "The body is stripped" 5×, "Something moves out
there" 4×, "Travel N tiles" 20×. Hence the spec's ⚠ marker
(precedent: the existing `villageEats()` line "⚠ Haven's
pantry is empty…", game.js:31704) and its ban on reusing the
haul line's phrasing.

Spec (full self-contained text in
evidence/2026-11-03/sim-firenarr-b.md): trigger = first
evening D of a disengaged stretch with D > S, D ≥ 8,
satisfying (e**) or (F), computed on the evening store; the
variant's first-firing clause (ties → (e**)) selects the
template. Emission: end of `endDay()` (game.js:32284), after
the `villageEats()` call (32526), via `this.say()` — NOT hung
on the `returnToVillage()` unload line (game.js:8874), which
is absent on 4 firing evenings and speaks on non-firing
evenings. Templates (all ≤ 85 chars, peak-anchored,
store-framed, never hunger-framed): E1 first "⚠ The store
has fallen from its recent high — the shelves are
thinning."; E2 first "⚠ The store has fallen far from its
recent high — the shelves are nearly bare."; F first "⚠ The
store keeps slipping from its recent high — evening after
evening, lower."; escalation (once per stretch, only after
E1/F first firing, on crossing the 0.65 cliff) "⚠ The store
has fallen further still from its recent high.";
new-stretch first firings use "again" variants. Repeats:
silence — no re-speak, paraphrase, or echo. Death-knell
firings still speak. Must NOT be said: any numbers (kcal,
fractions, %, fall counts), any days-left claim, any
hunger/belly framing, any stand-down/gate/throttle language,
any blame or promises. Plain-words why speak: "Because the
store's fall is visible to anyone who looks in the pantry,
and on these evenings nobody says it out loud — the warning
names what everyone is already living through, before the
first empty shelf."

Proof: scripts/test-firenarr-20261104.js, 107/107 green
post-rebase, synthetic-only (loads no game code, no judged
seeds, no real corpus seeds). It proves template selection
(kind + occasion → right template; non-firing → nothing),
the (e**)-wins-ties rule, and table constraints (≤ 100 chars,
says "store" + "recent high", no digits, no %, no "days", no
hunger words, no stand-down/gate language).

Status: firing-evening narration finding item: open →
SPEC-READY (spec + proof committed; the item itself stays
[open] in sim-findings.md until a deploy lands — a spec is
not a fix, and no new status word was invented for the file).
Gaps the spec could not close: (1) hook unpinned as a single
call site — no game code computes stretch peak/falls/envelope;
the deploy arm must add stretch state and verify evening-store
read ordering (endDay vs the tracer's policy.daily-end read);
(2) (F)-first template untested against a real transcript
(F never wins alone in this corpus); deploy arm must read a
real (F)-first evening (slow drain, streak 0) first;
(3) repeat/escalation/"again" variants untested in live play
(no deploy exists); no sampled leg shows two stretches with
two firings; (4) death-knell line placement against
starvation/death narration inside endDay() unknown from the
tracer; (5) mobile render at 390px untested (design arm, no
browser work); (6) 83272's 0.8496 knife-edge firing carried,
not fixed — the fraction is the sibling arms' decision, not
this spec's.

Merged as 488bed90d (after rebase onto 49b27504c, proof
re-run 107/107).

## Village assessment (plain words)

What the village looked like: on the fresh band, most villages
survive the 30-day window (189 of 200 screened), and the nine
that collapse do so while their evenings stay silent about
the store. A village can lose people to hunger on the very
day its evening transcript celebrates new knowledge, a new
ability, or a good haul — nothing in the transcript connects
the falling store to the deaths. The (v**) shape now survives
its first fresh-band judgment: it fires on every collapsing
village, beats or ties the old (c) rule on every one, and
gives a longer warning on most (average about 6 days vs
about 3). But the warning is only a shape on paper — no
evening in the game says it yet, and the exact strictness of
the rule (0.85 vs 0.87/0.88/0.90) made no difference at all on
this band, so the number is still a guess, not a finding.
Three of sixteen surviving villages also tripped the rule
without collapsing; one of those (83401) did suffer a
starvation death while the village survived, which softens
the false-alarm reading — the rule is not crying wolf about
nothing, but it is not a collapse predictor either.

Who thrived and who died and why: collapsing villages died
of starvation after their stores fell from recent highs
across multi-day disengaged stretches; survivors mostly never
fell that far, and the three firing survivors recovered.
What knowledge/capabilities were missing: the villages lack
any spoken warning when the store falls (blank 2, now
spec-ready, not deployed), and the project lacks a principled
fraction choice (blank carried forward).

## Reachability verdict

Waves 2–3 in window (screen waves: wave 2 on 44, wave 3 on
156; traced legs wave 2 on 8, wave 3 on 17; collapsing: wave 2
on 5, wave 3 on 4). Waves 4–5, Arc II/III/IV, regional →
national, the table, the win flag: NOT REACHED IN WINDOW —
expected for 30d instrument legs, NOT a wall movement claim.
Full seat still unwon; wave-5 kill still 0 in normal play
(Loop A lane).

## Wall numbers (traced legs, 30d limit stated — NOT wall movement)

Survival 16/25; median days alive 30, max 30; traced
collapsing 9; national / table / wins 0 in window.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
…/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-03/sim-freshband-b-tracer.jsonl' --metrics
national,table,wins,exiled` (with and without --sweep-rows):
PARSE REFUSAL — "could not parse … Unexpected
non-whitespace character after JSON at position 373730
(line 2 column 1)". The tracer file is one-object-per-line
(25 judged legs); the script parses the current argument as
whole-file JSON. Same refusal class as the 1030Z/1135Z
homeward corpora — NOT a metric deviation, NOT investigated
as one. Baseline NOT rolled. Both arms changed zero game
code, so no wall metric could have moved.

## Metric review (coordinator level)

The freshband prereg was honored exactly: band, base freeze,
settled field, bars, no pooling, no re-score, no mid-run
substitution. The descriptive sensitivity columns did not
discriminate — that is a finding about the band, not a
license to re-pick the fraction after seeing the legs.
Questions carried to the NEXT run (revisions apply there,
never to this one): (a) how is the deploy fraction chosen
when 0.85/0.87/0.88/0.90 are identical on a 25-leg traced set
— a larger collapsing set, a different band shape, or a
principled tie-break stated before judging? (b) the
freshband worker's own metric-review items (83503 game-clock
skew: last row loopDay 28 carries gameDay 29, starvation
death recorded on gameDay 29; survivor 83401's starvation
death softening the cost leg; tie-leg fragility both
directions; cost-bar coarseness at n=16; loss-exemption
scope) — all carried, none re-scored here.
check.js --quick NOT re-run (zero src/js in every landed
commit this run, proofs green post-rebase) — same conditional
skip as the 2330Z run, with reason, not claimed as green.

## Infrastructure

Registry-flock congestion all night (coordinator tree
registration ~14 min; pre-flight reap ~4 min; releases ~2–3
min). EPERM flap mid-run: the firenarr rebase was interrupted
mid-state (pick staged, not committed; abort also EPERM'd
while the flap was active) — recovered after the flap passed
via abort + clean rebase, branch verified intact throughout
(8fdab4b2d → 488bed90d); the freshband background tracer
attempt was discarded for unaccountable seed order with EPERM
stderr, judged corpus re-run in foreground chunks. Safe-commit
index clobber hit all worker commits (repaired via HEAD-blob
cacheinfo, commits verified correct, trees clean). Sibling
landings handled by rebase-before-merge each time (Loop A
2315Z coordinator evidence dbfeb63eb; journey-deepening r91
49b27504c). Main tree clean at closeout. No push, no bump, no
live verification (ship loop owns deploys).

## Blanks filled or documented

Filled (judged): fresh-band re-judgment of (v**) at 0.85 —
PILOT-GO (instrument + evidence only; deploy needs its own
prereg and must not cite this pilot alone).
Documented (spec-ready, not deployed): firing-evening
narration for a future (v**) deploy — templates, trigger,
emission branch, and six named gaps.
Still open: hurt-traveler turn-home behavior half
(narration half closed by 2130Z); the deploy fraction choice;
the deploy itself.

Merged locally, pending ship (firenarr 488bed90d,
freshband b43ebb851 + daa696f00 + d86c1854a, coordinator
evidence this file).
