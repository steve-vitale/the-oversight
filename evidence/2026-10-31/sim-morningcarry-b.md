# sim-morningcarry-b — ADOPTION EVIDENCE (judged, NO-GO)

Run: oversight-flesh-out-loop-b, adoption run for arm
sim-morningcarry-b, axis food-economy. Worktree
sim-morningcarry-adopt-b. POLICY PROTOTYPE ONLY: one new policy
file (scripts/policies/morningcarry-diag.js), zero edits to any
existing policy file, zero src/js changes, zero policy-default
flips. This worker does NOT push, bump, or verify live; the
coordinator merges. Status to coordinator: merged locally,
pending ship (after coordinator merge — this worker only commits
in its worktree).

## Adoption note (read first)

The original run (fleshout-loop-b-20261031T0841Z) died
mid-confirm. Its branch sim-morningcarry-b held exactly two
commits, cherry-picked IN ORDER onto this adoption branch with
no conflicts: 0e7957b3b → 73b86b671 (trace instruments + trace
corpora + prereg) and 13eb26b70 → 72a6b67a8 (probe instruments:
policy + driver + analyzer + proof). `git show --stat` matches
the originals exactly (8 files, then 4 files, new files only).
The old tree (sim-morningcarry-b) was never touched; the old
trace corpora (base 003a9c2f3) are reference only and were NOT
reused as judged data. Every judged leg below was re-run fresh
on the adoption base.

Adoption base: 6856df77f (current master at adoption time).
All counts below are on that base.

## Canon read

docs/CANON.md first, then docs/PRESERVATION.md (the ladder:
cleaned ~2d < cooked ~5d < smoked 30d < rendered 90d < pemmican
120d; rot can't be smoked back) and docs/TIME-ECONOMY.md
(ticks/day-parts, ~2200 kcal/day metabolic burn, fell 96 ticks
+ 80 kcal, bridge 96 ticks + 60 kcal). No canon doc covers the
morning-carry blank itself — stated in the prereg, not invented.

## The lever played

Morning-side food, two separately-metered halves, env-gated
MORNINGCARRY=1, wrapping nighttravel + woodcarry + woodwarm:

- Half (a) — wake pack-eat: at the first upkeep after a day
  change, if the previous evening was still-creek and the wake
  is outside the haven, eat once from the pack (Game.eat()).
- Half (b) — haven-departure pack carry: on a haven morning,
  take pantry food into the pack toward DAYWANT (2000 kcal),
  longest-shelf first (spoilDay-366 staples first).

Substrate (asserted FATAL in both drivers): POLICY=nighttravel,
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
WOODCARRY=1, WOODWARM=0 (guard) / 1 (ON), MORNINGCARRY=0/1,
DAYS=30, PRESSB unset/0, STRANDFIX unset/0. Seeds: the 8-seed
pilot band 15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337.

## Proof tests

- scripts/test-morningcarry-b.js: 7/7 pure green, then 14/14
  green with judged corpora (det-gate + determinism checks
  included).
- scripts/test-morningcarry-trace-b.js: 6/6 pure green.
- No driver errors on any leg (errs 0 everywhere).

## PILOT (sniff only, never judged) — PASS

8 seeds, ON variant leg only, corpus
sim-morningcarry-b-corpus-pilot-on: 8/8 files present, errs 0,
the single 15215 ON still evening (loop 4) carries a complete
record, half (b) evaluated on 15215 haven mornings (11 acted
departs), half (a) evaluated on the 15215 strand morning (loop
5 wake-eat acted, ate 2400). Pilot already showed the confirm
shape: the variant strands once, early, then never again.

## CONFIRM (judged) — before/after numbers

Paired compare:
evidence/2026-10-31/sim-morningcarry-b-compare.md, from
evidence/2026-10-31/sim-morningcarry-b-census-{on,guard}.json.
Det-gate: OFF reproduces control creek/still/rescued exactly on
every seed, both legs. Determinism: ON variant re-run
byte-identical (diff clean).

Primary metric — 15215 stranded-evening census (still =
woodcarry bucket creek + rescued false):

| leg | control still | variant still | fall |
|-----|---------------|---------------|------|
| ON | [7,8,9,10,11,12,13,14,15,16] (10, run 10) | [4] (1, run 1) | 9 |
| guard | [7,8,9] (3, run 3) | [4,5,6] (3, run 3) | 0 |

Half-(a) firings on 15215 strand mornings: ON — loop 5 only
(knownBefore 2630, ate 2400; loop 5 evening rescued=true).
Guard — loops 5 (ate 1690) and 6 (ate 750); loop 6 evening
still (wood 0). No firing on any strand morning inside the
control strand range 7–16 on either leg — the variant legs
never enter a still evening there at all.

Half-(b) on 15215: ON 11 acted departs (day-7 depart: 4× Canned
soup, 1000 kcal, spoilDay 366); guard 18 acted departs (day-7
depart: 8 portions, 2000 kcal, spoilDay 366). Carries fire on
nearly every haven morning from loop 1, not only pre-strand
departures.

## Verdict against the prereg GO clauses — NO-GO

(a) Still-count fall >= 2 on ON variant with causal link —
FAIL as written. The fall bar is met (10 → 1, fall 9), but the
causal-link bar is not: the prereg requires at least one
half-(a) firing on a strand morning within the control strand's
day range (7–16). The only ON firing is loop 5, outside that
range. The control evenings 7–16 were prevented by
trajectory-wide daily feeding (half-(b) acting from loop 1
re-routed the run from day 2), not by the prereg's hypothesized
day-7 departure → day-8 wake-eat → day-8 rescue chain. The
loop-5 firing did end the variant's own strand ([4] → loop 5
evening rescued), but that is not the chain the prereg defined.
The verdict does not hinge on this reading: clause (c) fails
independently (below), so NO-GO stands under either reading.

(b) Strand length non-increasing on either variant leg — PASS
on 15215. ON: total 10 → 1, run 10 → 1. Guard: total 3 → 3,
run 3 → 3 (equal, not increased).

(c) Guardrails — FAIL. Three independent breaches:
- Newly ticks-short still evenings: ON 15211 control 0 →
  variant 1 (loop 28); guard 15211 0 → 2 (loops 28, 29); guard
  15215 1 (loop 7) → 2 (loops 4, 5). Only ON 15215 holds (1 → 1).
- Creek still counts up on a non-strand seed: 15211 control []
  → variant [28,29] (ON) and [28,29,30] (guard). All other
  non-strand seeds unchanged at 0.
- Earlier/new vessel deaths: 15215 ON vessel death day 17
  (control) → day 9 (variant); 15215 guard none → days 6, 17;
  15211 both legs none → day 17; 15337 both legs none → day 27.
  (15009 and 15091 vessel deaths move later, not earlier.)
  Held: median survival 30d vs 30d (both legs pooled), no
  game-over on any leg, no driver errors, zero
  'Someone watches' / 'Caught' pantry lines on judged legs.

Overall verdict: NO-GO. Per the task brief, the prototype +
instruments + corpora + evidence are committed anyway; the
coordinator handles prototype cleanup. Nothing is deleted
silently.

## SENSE TEST (law) — PASS

Read end to end: every half-(a) firing morning's say line
(ON 15215 loop 5, guard 15215 loops 5–6, ON/guard 15211 loop 29
— each "You eat from your pack before the day's walk — morning
food, carried from home. (+N kcal)"), every half-(b) day-7
departure line (ON 15215: "You pack 4 portions from the pantry
for the road — 1000 kcal carried."; guard 15215: "You pack 8
portions … 2000 kcal carried."), and the rescued evening's
narration (15215 ON loop 5: "You lash logs together. A rough
bridge spans the gap." then travel home). Nothing converts
silently. The one sour note is narrated too: on 15211, the
loop-29 wake-eat (+1400 kcal) still ends in a still evening
because the wood is gone (wood 0) — food cannot fix a
wood-bleed evening, and the transcript shows the failure, not
a silent success.

## Reachability verdict

Wall numbers (national / table / wins) are NOT observable on
a 30-day pre-seat census — reported as such, never fabricated.
Within the window: 15215 max wave unlocked rises 1 → 2 on both
variant legs (control 1); the full band's max waves are
otherwise unchanged (2s and one 1 per leg). No wave-4/5 reach,
no regional/national/table content is in scope of this census.

## Village assessment, in plain words

Picture the village on the strand seed without the lever: the
traveler leaves home fed, walks to the creek, and gets stuck
there night after night — ten stuck nights in a row when the
fire is warm, three when it is not — because each morning she
wakes with nothing edible in her pack and the day's work eats
the hours she would need to bridge home. With the lever, she
packs pantry food every morning she starts at home — tinned
soup and rice that cannot spoil — and eats from her pack at
first light. On the strand seed that breaks the ten-night
stranding down to a single stuck night. But the lever is a
blunt tool, not a scalpel: because it packs food every single
home morning from day 2, it re-routes the whole trip, not just
the stranded nights. On one healthy seed it re-routes the trip
into a NEW stranding at the far end of the month (seed 15211:
stuck nights 28–30 where the control seed never stuck at all),
and on fed days the traveler still runs out of hours before
she can bridge — food fills her belly but does not buy her
evening hours back. The mechanism is real and narrated, but it
trades one stranding pattern for another and does not survive
its own guardrails.

## Blanks filled or documented

- Documented: half-(b) as built fires on EVERY haven morning,
  so the judged effect is a whole-trajectory feeding change,
  not the narrow day-7 → day-8 rescue chain the prereg
  hypothesized. A future run testing the narrow chain must gate
  departure packing to pre-strand windows (or accept and re-bar
  trajectory-level prevention).
- Documented: fed-but-ticks-short is real. Variant 15215 ON
  loop 4 (kcal 2180, pack 2630) and guard loops 4–5 (kcal 2250,
  2230) still end ticks-short. Food does not restore the
  96-tick evening bridge budget; the fed routine works MORE
  hours, not fewer.
- Documented: wood-bleed still blocks fed evenings. 15211
  loop 29 (wake-eat +1400) and 15215 guard loop 6 both end
  still with wood 0. The bridge's wood gate, not its kcal gate,
  is the binding constraint once food is carried.
- Documented: the new 15211 end-of-horizon stranding (loops
  28–30) is the guardrail breach that kills this arm, not a
  footnote — any future morning-food lever must be checked on
  15211 as well as 15215.
- Filled (instrument): the adoption itself — the stranded arm
  is now judged on current master with fresh corpora, a
  byte-identical determinism re-run, and a clean det-gate.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg Q1 (does a fed routine keep evening ticksLeft >=
  96?) — ANSWERED by the judged legs: no. Fed evenings end
  ticks-short on both legs. A future arm must treat the
  evening tick budget as its own gate, not as a side effect of
  feeding.
- Prereg Q2 (does day-7 carried food survive uneaten to the
  evening?) — NOT tested in narrow form: trajectory divergence
  from loop 1 means there is no clean single day-7 carry to
  judge. Day-7 evening pack on variant ON 15215 is 2000 known,
  but that is daily top-up, not one carry surviving the day.
- Prereg Q3 (evening-forage spoil rule vs day-forage lumps) —
  unchanged and untested by this arm, as designed; carried
  staples are spoilDay 366 and survive every night observed.
- Prereg Q4 (GO bar too coarse if guard shortens by 2 but ON
  by 1) — moot: the guard leg did not shorten at all (3 → 3)
  and the ON fall, though large, fails its causal-link clause
  and the guardrails.
- New doubts for the NEXT run, not re-scored here: (1) the
  causal-link clause assumes the variant trajectory stays
  aligned with control through the control strand; any
  daily-firing lever breaks that assumption by construction —
  next run should either gate the lever to strand windows or
  re-bar the link to trajectory-level prevention. (2) The
  vessel-death guardrails as written are near-unpassable for
  any lever that changes routine decisions from day 2, because
  succession death days move under ordinary divergence — next
  run should define that guardrail against game-over days or
  lever-caused death modes, or scope it to deaths on the
  strand seed's strand window.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry policies
on 150-day horizons with its own scorecard and observer
contract. It cannot express the nighttravel+woodcarry+woodwarm
strand stack, the 30-day creek-evening census, or an env-gated
single-mechanism probe — the same declaration every prior
strand arm made. The comparison here is control-vs-variant
legs on identical seeds through the census analyzer (paired
compare above), never labeled a panel comparison. No panel
result is fabricated; the panel tool was not invoked on this
corpus.
