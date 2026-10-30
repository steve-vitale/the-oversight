# sim-fedexile-b — fed exile: the counts behind "fed but still stuck"

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T2230Z,
arm sim-fedexile-b, axis food-economy. Worktree sim-fedexile-b.
DIAG ONLY: measurement, zero src/js changes, zero policy-default
flips, zero new policy files, zero edits to any existing policy
file. The variant leg reuses scripts/policies/pressb-diag.js
VERBATIM (landed by the 1928Z closeout into this base). Sibling
trees, claims, and branches never touched. The main tree never
touched. The strand set is re-derived by this arm's own legs on
the pinned base; no sibling arm's output is used as input
(sim-strandbank-b runs in parallel and its results are not
this arm's input, by task order).

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-30/sim-fedexile-b-prereg.md (commit
f011cfeab). Pinned base 359a384cc3ff7516235c52777ef66bccd4c01f11
(worktree HEAD at prereg time). Primary metric: fed-vs-unfed
strand length in exile days (paired per stranded villager),
with death-delay and wave reach as co-reported outcomes.
DIAG-GO bars, judged exactly as written: (a) paired table
complete for 100% of stranded mornings on the current-master
strand set; (b) fed-vs-unfed strand-length delta quantified
(median + per-seed), death-delay quantified in days,
endReason/bearer-death pairing reported; (c) wood-seeking
conversion rate on fed mornings reported (counts, not
assumption); (d) determinism re-run byte-identical on at
least one leg; proof suite green. §15 panel: declared
applicable in paired form only — the official panel driver
cannot express the strand stack (see Panel section); the
paired compare .md is attached, never presented as an
official panel run.

## Instruments (reuse, no reinvention)

- Variant policy: scripts/policies/pressb-diag.js UNMODIFIED
  (PRESSB=1 arms the morning press + eat; PRESSB=0 delegates
  untouched).
- Driver: scripts/pressb-trace-b.js UNMODIFIED (stack
  pressb(warmed(woodcarry(nighttravel)))); OUTDIR override
  only. Same substrate env as pressb (POLICY=nighttravel,
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
  DEPOSITGATE=1, WOODCARRY=1, DAYS=30, bank 15003, 15009,
  15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439).
- Analyzer: scripts/analyze-fedexile-b.js (new, pure reads):
  strand extraction, per-seed pairing, deltas, death-delay,
  fed-morning wood-seeking line-scan + daytime wood delta,
  guardrail census, wall numbers, §15 paired compare .md.
- Proof: scripts/test-fedexile-b.js (27 pure unit tests +
  corpus checks).
- One leg interruption, disclosed: the variant ON leg's
  driver was killed mid-run when the coordinator-side exec
  session holding it was aborted (8/10 seed files written;
  no process left running). The 8 completed files are final
  (the driver writes each file only after its instance
  completes, with readback verification), and the remaining
  2 seeds (15376, 15439) were re-run with the same driver
  and env into the same OUTDIR (SEEDS=15376,15439). No
  judged number comes from a partial file; the variant
  corpus is 10 complete files, and the determinism re-run
  below covers the strand seed end to end.

## Band reproduction (pre-registered report, not a bar) — NO DRIFT on ON legs

| leg | creek | still | rescued |
|-----|-------|-------|---------|
| ON control (PRESSB=0, WOODWARM=1) | 18 | 10 | 8 |
| ON variant (PRESSB=1, WOODWARM=1) | 25 | 17 | 8 |
| guard control (PRESSB=0, WOODWARM=0) | 12 | 3 | 9 |
| guard variant (PRESSB=1, WOODWARM=0) | 13 | 4 | 9 |

ON control 18/10/8 and ON variant 25/17/8 reproduce pressb's
16-seed confirm censuses EXACTLY (pressb's pilot+confirm
control 18/10/8, variant 25/17/8 — the extension seeds added
no creek evenings, so the 10-seed bank totals equal the
16-seed totals). Guard control 12/3/9 reproduces pressb's
guard census EXACTLY. Guard variant (no pressb comparator —
pressb ran guard control only) is new: 13/4/9, the extra
still evening being a TICKS-SHORT evening (see below), not
a wood-short one. All 10 seeds survived 30 days on every
leg; errs 0/0; stalls 0; control legs press-free (0
attempts on all control legs — the gate-leakage check
passes: where there is no stranded morning, the variant
changes nothing on non-stranding seeds, whose trajectories
are byte-identical control-vs-variant on every per-seed
count checked: daysAlive, endReason, bearer deaths,
all-deaths counts, wave reach — 9/9 non-stranding seeds
identical).

## 1. THE PAIRED STRAND TABLE (bar b, primary metric)

Only ONE seed strands on this base, on either ON leg:
15215. The walktree bank's second stranded seed (15009)
still does not strand (creek 0 on every leg here, as in
wakeforage/pressb — the #1554 strand loss stands). Pairing
by order of appearance is therefore trivially safe: one
strand per leg, same start day, the variant strand being
the control strand extended.

| seed | control strand (still evenings) | variant strand | delta |
|------|--------------------------------|----------------|-------|
| 15215 | days 7–16, length 10 | days 7–23, length 17 | +7 |

Median delta across paired strands: +7 (n = 1 paired
strand; the median is the single delta, stated so the n
is honest — this is a one-strand census, not a
multi-strand average). Unpaired strands: 0. Variant-only
mornings: 7 (days 17–23), each in the morning table with
full rows, flagged VARIANT-ONLY per pressb's coverage
lesson.

Evening binding mix on strand evenings: control
wood-short 7, kcal-short 2, null 1; variant wood-short
14, kcal-short 2, null 1. The extension is PURELY
wood-short: the 7 added evenings all fail on wood, none
on kcal. The press changes the kcal gate only (as
pressb found); the evenings it adds are wood-gated
evenings the fed villager now survives to reach.

## 2. DEATH-DELAY + ENDREASON / BEARER-DEATH PAIRING (bar b)

| seed | bearer death day control → variant | delay | same cause | endReason c → v | daysAlive c → v | waves c → v | all deaths c → v |
|------|-------------------------------------|-------|------------|-----------------|-----------------|-------------|------------------|
| 15003 | none → none | CENSORED | — | survived → survived | 30 → 30 | 2 → 2 | 6 → 6 |
| 15009 | 18 → 18 | 0 | yes | survived → survived | 30 → 30 | 2 → 2 | 8 → 8 |
| 15091 | 8 → 8 | 0 | yes | survived → survived | 30 → 30 | 2 → 2 | 15 → 15 |
| 15211 | none → none | CENSORED | — | survived → survived | 30 → 30 | 2 → 2 | 13 → 13 |
| 15215 | 17 → 23 | +6 | yes ("the wild") | survived → survived | 30 → 30 | 1 → 2 | 8 → 14 |
| 15220 | none → none | CENSORED | — | survived → survived | 30 → 30 | 2 → 2 | 15 → 15 |
| 15221 | 31 → 31 | 0 | yes | survived → survived | 30 → 30 | 1 → 1 | 8 → 8 |
| 15337 | none → none | CENSORED | — | survived → survived | 30 → 30 | 2 → 2 | 8 → 8 |
| 15376 | 17 → 17 | 0 | yes | survived → survived | 30 → 30 | 2 → 2 | 7 → 7 |
| 15439 | none → none | CENSORED | — | survived → survived | 30 → 30 | 3 → 3 | 18 → 18 |

Death-delay on the stranded seed: +6 days (day 17 →
day 23, same bearer, same cause "the wild") — exactly
pressb's number, reproduced on the new base. Every other
seed: delay 0 (same bearer-death day both legs) or
CENSORED (no bearer death on either leg; the village
survives 30 days with its bearer intact). No seed's
endReason worsens; no new bearer-death cause appears on
any seed. (Bearer deaths here are deaths of the played
character across bearer changes — e.g. 15091's day-8
bearer death on both legs with endReason survived — not
run-ending deaths; the pairing is on the played
character's death line, as pressb barred it.) The
all-deaths rise on 15215 (8 → 14) is, as pressb found,
extra monster kills and villager-combat entries on the
longer fed trajectory, not new bearer deaths.

## 3. WOOD-SEEKING CONVERSION ON FED MORNINGS (bar c — the question, answered)

Fed morning = a variant-leg strand morning on which the
press fired. Wood-seeking day = the same loop-day's
fullDaySay lines contain a wood-gain line (fell "comes
down with a crack that echoes. +N wood.", brush clear
"+1 wood (brushwood)", fallen-tree clear "+2 wood") or
the attempt line ("Nothing to cut there.") — refusal,
fire, travel, and forage lines excluded by pattern
(proof-checked against all four classes).

| fed morning (15215) | wake kcal | morning wood | press E | wood-seeking? | matched lines | daytime wood delta | next-day seeking? | evening binding |
|---|---|---|---|---|---|---|---|---|
| day 10 | 0 | 3 | 540 | NO | — | 0 | NO | wood-short |
| day 14 | 0 | 2 | 900 | NO | — | 0 | NO | wood-short |
| day 18 | 236 | 0 | 810 | NO | — | 0 | NO | wood-short |
| day 22 | 780 | 0 | 990 | NO | — | 0 | NO | wood-short |

CONVERSION RATE: 0 / 4 fed mornings followed by a
wood-seeking day (0.000). Secondary splits, same answer
everywhere: skipped variant strand mornings 0 / 13
seeking; fed mornings with next-day lines recorded 0 / 4
next-day seeking; fed mornings with a positive daytime
wood delta 0 / 4; line-scan / numeric-delta disagreements
0 (both instruments agree: no wood sought, no wood
gained, on any fed morning). The fed villager never, on
any of its 4 fed mornings, walks to a tree, fells, clears
brush, or cuts a fallen tree — and its pack never rises
during any fed day.

The adjacent-source bound (why "never" is structural,
not a missed verb): every fed morning's wake sweep holds
ZERO adjacent trees, bigtrees, or bushes — but 8 bigtrees
on the whole tile, every time (the woodday finding,
restated on fed mornings). A wood-seeking day on this
tile would first require a MICRO-WALK to a non-adjacent
bigtree — a behavior no bot policy has (woodday's
walk-to-tree middle, still open) — and then a fell the
starving mornings could not afford anyway (felling costs
80 kcal; fed mornings 10/14 wake at 0 kcal). The routine
as measured does not convert fed mornings into
wood-seeking days because it has no wood-seeking day to
convert them into: no verb runs, no walk runs, no pack
gain. The answer to the design question is therefore not
"the routine chooses food over wood" — it is "the
routine has no wood move at all on this tile, fed or
unfed." Whether "fed but still stuck" is acceptable is
the coordinator's / Steve's call; what this census
certifies is that fed exile is LONGER exile (7 extra
wood-short nights), not exile working its way out.

## 4. GUARD-LEG NOTE (band report: the press's tick cost bites once)

Guard variant strand: days 7–10 (length 4) vs guard
control days 7–9 (length 3). The extra evening, day 10,
is TICKS-SHORT ("No bridge tonight — 93 ticks left in
the day, and a bridge takes 96 ticks"), not wood-short:
the guard-control villager walks home on day 10, while
the guard-variant villager — which pressed that morning
(17 ticks: 16 press + 1 eat) — ends the day at the creek
3 ticks short of a bridge, and rescues on day 11. The
press's time cost is the proximate timing difference
(93 < 96, press costs 17); RNG divergence also moves
between legs, so this is reported as the observed
difference with the tick arithmetic shown, not as a
proven sole cause. The guard-variant villager also
reaches maxWave 3 (guard control: 1; wave kills 1:9,
2:4) — a longer, fight-richer trajectory on the
warmth-off leg, reported as observed, mechanism not
isolated. The ON-leg story (the judged legs) is
unaffected: there the extension is 7 wood-short
evenings, not a tick artifact.

## Sense-test (law — read end to end, judged for meaning)

Variant ON 15215, day 18 — a VARIANT-ONLY fed morning
(the control villager is home this day; there is no
control day 18 to compare against, which is the point):
wakes east (8,0) with 236 kcal and 0 logs, works the
patch ("9× Muscadine Grapes — and 11× unknown shoots,
9× unknown berries you can't name yet. This patch is
picked clean"), EATS the muscadine (810 kcal), travels
to wetland, works Purslane (330 kcal), eats it, returns
to creek, and is refused honestly ("No bridge tonight
— the pack holds 0 logs, and a bridge needs 4").
PASS, and the reading is the verdict in miniature: a
well-fed person (236 + 810 + 330 kcal through the day)
having a normal foraging day and sleeping out a seventh
extra night for want of wood — not a robot farming, not
a person working their way out. No line in the day
reaches for wood: no walk toward the tile's 8 bigtrees,
no fell, no brush clear, no mention of timber at all.
Day 22 reads the same, plus knowledge-deepening beats
that belong to the game, not the arm (muscadine deeper
knowledge, Green Thumb straining toward an evolution
choice) and the perishability effect pressb documented
(press E 990, eaten line 594 kcal, realized net +584 —
the eat takes most-perishable-first, and the villager
was already at 780 kcal). Day 24, the return, reads as
a homecoming ("You walk back into Haven. 19 Codex
entries. The village is glad to see you."), with the
villager sowing the muscadine it lived on — the exile
ends in a return, not a rescue, and the food it ate on
the strand becomes a planted crop at home.

## Villager-behavior sample (out of the sims)

Haven days read as people: Tao teaches with the
self-correcting lesson ("Hold on — I already showed you
this one. Hickory Nuts. You remember."), Nolwazi
teaches the Highbeam counter in her own voice ("MOVE,
don't stare... the freeze means it is already
aiming"), the village reports its own fights ("Nolwazi
killed the Extended Warranty alone — 4 rounds, 61
taken. Word travels fast. The village cheers."), and
Fatima teaches the counter the same evening. One
recurring wrinkle, already in pressb's backlog and now
seen a third time (pressb 15601, here day 24): Tao's
self-correcting lesson fires with the same joke shape
across days — it reads as a catchphrase, not a bug,
but it is the one repeated line in an otherwise
varied sample. No static or repeated villager routines
beyond that; nothing here changes the arm's verdict.

## Reachability

No new content reached by a game change (no game change
landed — policy variant only, default off). Wave reach
on the 10-seed ON legs (maxWaveUnlocked per seed):
wave ≥ 1 on 10/10 control and variant; wave ≥ 2 on 8/10
control and 9/10 variant (15215 variant reaches wave 2
where its control reaches wave 1 — the fed exile
fights more); wave 3 on 1/10 both (15439); waves 4–5
not reached in this 30-day window (same window as
pressb/wakeforage/woodday). The variant moves wave
reach on exactly the seed it feeds, nowhere else.

## Wall numbers

NOT OBSERVABLE on 30-day evening legs (pre-seat, no
field) — reported as the window's structural value, not
a game verdict: national 0/10, table 0/10, wins 0/10
(the legs contain no national/table/win content).
Median survival: 30 days (all 10 seeds survived 30 days
on both ON legs — ceiling effect of the window +
banking selection, not a survival claim).

## Verdict against the prereg

- (a) PAIRED TABLE COMPLETE: 27/27 strand mornings in
  the table (10 control + 17 variant, variant-only
  flagged), every row carrying wake tile/cell, morning
  kcal/wood, press fired?/E, evening outcome + binding,
  wood-seeking verdict + matched lines, daytime wood
  delta — PASS.
- (b) DELTA QUANTIFIED: median +7 (n = 1 paired strand,
  stated), per-seed table above; death-delay +6 days on
  15215, 0 on four seeds, CENSORED on five; endReason +
  bearer-death pairing per seed above — PASS.
- (c) CONVERSION COUNTED: 0/4 fed mornings
  wood-seeking (0.000), with skipped split 0/13,
  next-day 0/4, positive-delta 0/4, disagreements 0,
  every matched line quoted (there are none) — PASS.
  The bar judges the measurement, and the measurement
  is complete; the 0 is the finding, not a failure.
- (d) DETERMINISM + PROOF: 15215 variant ON leg re-run
  byte-identical; proof test 42/42 (27 pure + 15 corpus
  checks, incl. src/ + scripts/policies/ byte-identical
  to pinned base) — PASS.
- DIAG-GO (measurement verdict only). This certifies
  the fed-exile numbers; it does NOT land any behavior,
  flip any default, or rule the design question. The
  "fed but still stuck — acceptable, or convert to
  wood-seeking?" decision stays with the coordinator /
  Steve, now with counts in hand: fed exile is +7
  wood-short nights, death delayed 6 days, wave reach
  +1 seed, and wood-seeking conversion 0/4 — because
  the routine has no wood move on this tile at all.

## Proof

scripts/test-fedexile-b.js: 42/42 checks pass on the
judged corpora, including: pure strand extraction
(rescued breaks, non-creek breaks, gap days, run-end
strands); pairing + median; wood-seeking scan positives
(all three gain lines + the attempt line) and negatives
(refusal, fire, fuel-prompt, travel, forage lines);
bearer-day extraction + censoring; corpus checks (10/10
seeds both ON legs, errs 0, stalls 0, table 27/27
complete, fed rows carry press E, guard legs present,
determinism byte-identical, src/ + policies/ diff
empty vs pinned base 359a384cc).

## Metric review

- Strand length in still evenings (vs days-to-return
  incl. the rescue day) is the right "exile days" unit
  here: the rescue day is a travel day, not a stuck
  night, and the table reports strand day-ranges so the
  reader can re-judge under either unit (control
  7–16 + return day 17; variant 7–23 + return day 24).
  The delta is +7 under both units (the return day
  shifts with the strand).
- Pairing strands by order of appearance is safe on
  this bank: exactly one strand per leg per seed on the
  judged legs (and on guard legs), so no pairing
  ambiguity arises. Had any seed shown two strands per
  leg, the pairing rule would have needed revisiting —
  it did not.
- Same-day vs next-day wood-seeking: the primary
  same-day rate (0/4) does not hinge on the window —
  next-day seeking is also 0/4 where lines are recorded
  (all 4 fed mornings have next-day lines). A
  wood-seeking move landing two days later would still
  be invisible to both windows, but no fed morning's
  following two days show any pack-wood gain either
  (daytime deltas 0 throughout the strand), so the
  conclusion does not rest on the window edge.
- Line-scan invisibility, stated as a limitation: a
  walk toward a tree that never acts leaves no say line
  and no pack gain, so it is invisible to both the scan
  and the numeric delta. The adjacent-source counts bound
  it: every fed morning wakes beside zero adjacent wood
  sources, so a walk-to-tree day would have to cross the
  tile first — and the day lines show travel only to
  wetland and back to creek, never a within-tile walk
  toward the bigtrees. The "no wood move" claim rests
  on scan + delta + travel lines together, not on the
  scan alone.
- The 2200-kcal day-need has no bearing on this arm
  (the question is the fed morning's consequence, not
  the day's food) and is cited only to refuse
  overclaiming: the presses total 3240 kcal across the
  strand (pressb's number, reproduced: 540 + 900 + 810
  + 990), and that food buys longer exile, not exit.
- No metric revision is proposed for strand length,
  death-delay, or the wood-seeking scan: they separated
  the gates cleanly (wood-short extension vs kcal-short
  stasis vs tick artifact on guard; seeking vs gain vs
  travel), which is exactly why the verdict can say the
  fed villager survives longer without ever reaching
  for wood — instead of just "0/4."

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-30 — food-economy/fed-exile — FED
  EXILE ANSWERED WITH COUNTS (this arm): fed exile is
  +7 wood-short nights, death delayed 6 days, wave reach
  +1 seed, wood-seeking conversion 0/4 — because the
  routine has no wood move on the wake tile at all (0
  adjacent sources, 8 whole-tile bigtrees, no walk, no
  verb, no gain). The pressb open finding ("fed but
  still stuck — acceptable, or convert to
  wood-seeking?") is now measured; the design decision
  is the coordinator's / Steve's. (evidence: this file;
  pressb's open item is answered, not re-opened.)
- [open] 2026-10-30 — food-economy/guard-leg — PRESS
  TICK COST CREATES A TICKS-SHORT STILL EVENING
  (this arm, guard variant): on warmth-off legs the
  day-10 press (17 ticks) leaves the villager 3 ticks
  short of a bridge (93 < 96) and adds a still evening
  the control leg does not have. A morning behavior
  with a tick cost can strand by time, not just by
  food or wood — a future morning-behavior design must
  budget ticks, not just kcal. (evidence: guard-variant
  corpus, 15215 day 10.)
- [open] 2026-10-30 — village-behavior/dialogue —
  RESCUE-DAY STARVATION SPAM (this arm, guard variant):
  the day-11 rescue day prints "Need N kcal, have 0. Eat
  first." a dozen times in a row (one per attempted
  action) while the villager walks home starving. It
  reads as a stuck loop, not a person — a narration
  dedup or a single hunger line would fix it, but it is
  cosmetic and out of this arm's scope. (evidence:
  guard-variant corpus, 15215 day 11 tail.)

## Files

- Prereg: evidence/2026-10-30/sim-fedexile-b-prereg.md
  (commit f011cfeab)
- Evidence (this file): evidence/2026-10-30/sim-fedexile-b.md
- Analyzer: scripts/analyze-fedexile-b.js; proof:
  scripts/test-fedexile-b.js (driver + variant policy
  reused unmodified: scripts/pressb-trace-b.js,
  scripts/policies/pressb-diag.js)
- Corpora: evidence/2026-10-30/
  sim-fedexile-b-corpus-on-control, -on-variant,
  -guard-control, -guard-variant (10 seeds each);
  sim-fedexile-b-corpus-determinism (15215 variant
  re-run, byte-identical)
- Census + morning table + compare:
  sim-fedexile-b-census.json,
  sim-fedexile-b-morning-table.json,
  sim-fedexile-b-compare.md
