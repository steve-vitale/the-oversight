# sim-lackingline-a — lacking-line gate census: what the refusal line names vs what actually fails

Run: oversight-flesh-out-loop, Loop A run fleshout-20261031T0537Z,
arm sim-lackingline-a, axis food-economy, backlog #1561/#1580/
#1583 class. Worktree sim-lackingline-a. DIAG ONLY: measurement
and a wording PROPOSAL, zero src/js changes, zero policy-default
flips, zero edits to any existing policy file or existing script.
New files only: prereg, analyzer + proof, this evidence file,
censuses, corpora, leg logs. Sibling trees never touched; main
tree never touched.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-31/sim-lackingline-a-prereg.md (commit
03f89d187). Pinned base f44ec6957 (branch sim-lackingline-a;
the prereg commit adds only the prereg file, so all legs run on
pinned-base game/policy code verbatim). Primary metric: the
lacking-line census — for EVERY stranded evening in the
re-derived strand set, (gates failing, gate named, narration
verbatim), gates failing computed from RAW refusal-time gates
(woodPlayer < 4, kcalLive-or-kcal < 60, ticksToDayEnd < 96),
never from the bridge skip, which IS the first-failure line
under census. Warmth connection, separately: for each still
evening directly following a strand evening whose warmth fire
spent >= 1 bridge log, whether that evening's refusal line
mentions the spend (strict test: the lacking-line text itself;
a looser any-line-in-the-day check is sense-read only).
GO threshold, judged exactly as written: GO iff a complete
census table covers every stranded evening in the re-derived
strand set, with per-evening gates-failing vs gates-named,
plus the warmth-connection count. Otherwise NO-GO.

## Canon

docs/CANON.md read. No canon doc covers the bridge/lacking
line itself: docs/ABILITY-REFUSALS.md covers ability-action
refusals and pantry ledger accounting, not the woodcarry
bridge refusal — stated here instead of inventing canon. The
standing rule that bears on it is CANON.md's "no silent
actions — every action narrates honestly, including
failures." The line's code is scripts/policies/woodcarry.js
`lackingLine()` + `bridgeDecision()` (first-failure order
wood, then kcal, then ticks; gates 4 logs / 60 kcal /
96 ticks).

## Prior evidence read in full before designing anything

sim-kcalshort-b.md, sim-tickbudget-b.md, sim-warmfuel-b.md,
sim-strandbank-b.md (all evidence/2026-10-30).

## Instruments (reused verbatim, OUTDIR override only)

- scripts/kcalshort-trace-b.js (control legs guard + ON;
  records woodcarry classification + bridge skip + narration
  verbatim + warmth record + fullDaySay on still evenings).
- scripts/tickbudget-trace-b.js (PRESSB=1 variant legs
  guard-variant + ON-variant; same records plus tick probes).
- New, this arm: scripts/analyze-lackingline-a.js (pure reads:
  strand extraction as maximal runs of still creek evenings
  on consecutive loop-days, raw-gate classification,
  named-gate cross-check, gate-combination counts,
  warmth-connection count) and scripts/test-lackingline-a.js
  (proof).
- Env gates asserted FATAL by the drivers: POLICY=nighttravel,
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
  DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0 (guard) / 1 (ON),
  DAYS=30; variant legs add PRESSB=1. Bank:
  15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337,
  15376, 15439.
- Staged method, as preregistered: PILOT on seed 15215 only
  (guard + ON) — PASSED (guard strand 7-9, ON strand 7-16,
  every still evening classifiable with narration present,
  warmth records present ON) — then CONFIRM on the full
  bank (control legs), then the SECONDARY variant extension
  (variant legs, reported separately, never pooled into the
  primary counts). Pilot corpora were smoke runs only and
  were removed before commit; no judged number comes from
  them (their numbers equal the judged legs' anyway).
- §15 panel: not applicable, as declared in the prereg —
  zero game-root changes, so there is no before/after game
  delta for scripts/balance-panel.js to compare. The census
  compares narration against raw gates within one root, and
  is never labeled a panel comparison.

## Verdict: GO

| bar | result |
|-----|--------|
| (a) strand set re-derived on THIS base, full bank, both control legs | PASS — 15215 only, guard 7-9, ON 7-16; 15009 has 0 creek evenings on both legs |
| (b) zero unclassified still evenings | PASS — 0 on all 4 legs (13 primary + 21 variant) |
| (c) every censused evening carries narration verbatim + skip, skip agrees with first failing raw gate | PASS — agreement on all 34 evenings; every narration equals its lackingLine template (proof-checked) |
| (d) warmth records present on every ON-leg strand evening, spend nights identified | PASS — ON spends 9, 11, 12, 13; ON-variant spends 9, 10, 14, 15; ledger cross-checks 0 mismatches |
| (e) determinism re-run byte-identical on at least one leg | PASS — 15215 ON re-run byte-identical |
| (f) proof suite green | PASS — scripts/test-lackingline-a.js 140/140 |

## 1. THE STRAND SET ON THIS BASE (re-derived, not inherited)

Zero drift from strandbank/kcalshort/warmfuel. Creek /
still / rescued, recomputed independently from the judged
corpora (not from driver summaries):

| leg | creek | still | rescued | strand |
|-----|-------|-------|---------|--------|
| guard (control) | 12 | 3 | 9 | 15215 nights 7-9 |
| ON (control) | 18 | 10 | 8 | 15215 nights 7-16 |
| guard-variant (PRESSB=1) | 13 | 4 | 9 | 15215 nights 7-10 |
| ON-variant (PRESSB=1) | 25 | 17 | 8 | 15215 nights 7-23 |

15009 has 0 creek evenings on all four legs — the strand
loss stands on a fifth consecutive base (wakeforage, pressb,
kcalshort, warmfuel, now this pin). No other seed strands on
any leg; no still evening sits outside a strand run on any
leg (non-strand still: 0 everywhere).

## 2. THE PRIMARY CENSUS (control legs — the judged set)

### Guard leg (warmth off): 15215 nights 7-9

| evening | failing | named | narration verbatim |
|---------|---------|-------|--------------------|
| day 7 | ticks-only (4 logs, 2254 kcal, 47 ticks) | ticks | No bridge tonight — 47 ticks left in the day, and a bridge takes 96 ticks. |
| day 8 | kcal-only (4 logs, 0 kcal, 239 ticks) | kcal | No bridge tonight — 0 kcal in hand, and the lashing takes 60. |
| day 9 | kcal-only (4 logs, 0 kcal, 109 ticks) | kcal | No bridge tonight — 0 kcal in hand, and the lashing takes 60. |

### ON leg (warmth live): 15215 nights 7-16

| evening | failing | named | hidden | narration verbatim |
|---------|---------|-------|--------|--------------------|
| day 7 | ticks-only (4, 2254, 47) | ticks | — | No bridge tonight — 47 ticks left in the day, and a bridge takes 96 ticks. |
| day 8 | kcal-only (4, 0, 239) | kcal | — | No bridge tonight — 0 kcal in hand, and the lashing takes 60. |
| day 9 | kcal-only (4, 0, 109) | kcal | — | No bridge tonight — 0 kcal in hand, and the lashing takes 60. |
| day 10 | wood-only (3, 240, 238) | wood | — | No bridge tonight — the pack holds 3 logs, and a bridge needs 4. |
| day 11 | wood+kcal (3, 0, 111) | wood | kcal | No bridge tonight — the pack holds 3 logs, and a bridge needs 4. |
| day 12 | wood+kcal (2, 0, 239) | wood | kcal | No bridge tonight — the pack holds 2 logs, and a bridge needs 4. |
| day 13 | wood+kcal (1, 0, 111) | wood | kcal | No bridge tonight — the pack holds 1 log, and a bridge needs 4. |
| day 14 | wood-only (0, 240, 238) | wood | — | No bridge tonight — the pack holds 0 logs, and a bridge needs 4. |
| day 15 | wood+kcal (0, 0, 111) | wood | kcal | No bridge tonight — the pack holds 0 logs, and a bridge needs 4. |
| day 16 | wood+kcal (0, 0, 111) | wood | kcal | No bridge tonight — the pack holds 0 logs, and a bridge needs 4. |

Columns are (logs, kcal, ticks). Every line above is the
recorded narration verbatim, not a paraphrase.

### Gate-combination counts (primary)

| combination | guard | ON | pooled primary |
|-------------|-------|----|----------------|
| ticks-only | 1 | 1 | 2 |
| kcal-only | 2 | 2 | 4 |
| wood-only | 0 | 2 | 2 |
| wood+kcal | 0 | 5 | 5 |
| wood+ticks | 0 | 0 | 0 |
| kcal+ticks | 0 | 0 | 0 |
| all three | 0 | 0 | 0 |
| TOTAL | 3 | 10 | 13 |

Read the pooled column with its overlap stated, not hidden:
guard days 7-9 duplicate ON days 7-9 (identical numbers —
the warmth-off opening of the same trajectory), so the
pooled 13 contains 10 distinct ON-trajectory evenings plus
the 3-evening warmth-off contrast. The multi-gate share is
5/10 (0.50) on the warmth-live trajectory itself and 5/13
(0.38) pooled. Either way, the hidden gate on every
multi-gate primary evening is kcal, and the named gate is
always wood. On single-gate evenings the line is complete:
it names the only failing gate, on all 8 pooled
single-gate evenings. No primary evening hides ticks, and
no primary evening fails all three gates — the control
substrate cannot produce those classes, which is exactly
why the variant extension below exists.

What the incompleteness costs a reader, concretely: on
nights 11, 12, 13, 15, 16 the line says, in effect, "one
more log and you cross." That is false as a fix: with the
log supplied, all five evenings still strand on 0 kcal.
A reader who trusts the line budgets wood and is wrong
five nights running.

## 3. THE VARIANT CENSUS (PRESSB=1 legs — reported separately, never pooled)

Guard-variant (15215 nights 7-10): ticks-only 2 (day 7:
47 ticks; day 10: 93 ticks — the press-decisive evening,
named ticks honestly), kcal-only 2. No multi-gate evenings,
no warmth (guard), so no warmth-connection cases.

ON-variant (15215 nights 7-23, 17 evenings):

| evening | failing | named | hidden |
|---------|---------|-------|--------|
| day 7 | ticks-only (4, 2254, 47) | ticks | — |
| day 8 | kcal-only (4, 0, 239) | kcal | — |
| day 9 | kcal-only (4, 0, 109) | kcal | — |
| day 10 | wood-only (3, 590, 221) | wood | — |
| day 11 | wood+kcal (2, 31, 111) | wood | kcal |
| day 12 | wood+kcal (2, 0, 231) | wood | kcal |
| day 13 | wood+kcal+ticks (2, 0, 95) | wood | kcal, ticks |
| day 14 | wood-only (2, 950, 221) | wood | — |
| day 15 | wood-only (1, 703, 111) | wood | — |
| day 16 | wood-only (0, 448, 239) | wood | — |
| day 17 | wood-only (0, 308, 365) | wood | — |
| day 18 | wood+ticks (0, 1246, 93) | wood | ticks |
| day 19 | wood-only (0, 1124, 111) | wood | — |
| day 20 | wood-only (0, 992, 111) | wood | — |
| day 21 | wood-only (0, 852, 239) | wood | — |
| day 22 | wood+ticks (0, 1420, 93) | wood | ticks |
| day 23 | wood-only (0, 1240, 239) | wood | — |

Variant combination counts (ON-variant): ticks-only 1,
kcal-only 2, wood-only 9, wood+kcal 2, wood+kcal+ticks 1,
wood+ticks 2; kcal+ticks 0. Multi-gate 5/17 (0.29). The
ticks-plus class the task brief names is fully present
here and nowhere else: days 13, 18, 22 — on all three the
line names wood and never mentions ticks (95 / 93 / 93
against a 96 need). Day 13 is the only all-three evening
in the entire census (34 evenings, both roots): its line
hides TWO gates. Day 11 is the variant's one partial kcal
gap (31 kcal, gap 29, not the full 60 seen everywhere
else) — the press feeds, but the line's incompleteness
does not depend on the gap being full. Across both roots,
multi-gate evenings total 10 (5 primary + 5 variant), and
on all 10 the line names wood and hides at least one
further binding gate.

## 4. THE WARMTH-SPEND CONNECTION (separate count)

Spend nights are identified by the warmth record
(logSpent >= 1, woodBefore − woodAfter cross-checked,
0 mismatches on every leg).

Primary ON leg: spends on nights 9 (4→3), 11 (3→2),
12 (2→1), 13 (1→0). Following evenings: 10, 12, 13, 14.
Refusal lines mentioning the spend: 0/4 (strict test).
Any line in the following day's full text mentioning the
prior spend: 0/4 (loose test, sense-read below).

Variant ON leg: spends on nights 9, 10, 14, 15 (a
different spend pattern — the press-fed trajectory warms
on different nights). Following evenings: 10, 11, 15, 16.
Refusal lines mentioning the spend: 0/4 (strict).
Any-line loose test: 0/4 (sense-read below).

Pooled warmth-live legs: 0/8 connected on either test.
Guard legs: no spends, no cases (vacuous, reported as
such, never as 0/0 evidence).

Why the strict test cannot false-positive: every recorded
narration equals its lackingLine template for its skip
(proof-checked on all 34 evenings), and no template
contains fire/warmth/burn/spend language — the refusal
line is incapable, as written, of mentioning a spend.
The count is therefore structural, not a sampling result:
no following evening in either trajectory could have
scored "connected" without a wording change.

## 5. SENSE-TEST (law — read end to end, judged for meaning)

Primary ON, nights 9-10 (the pivotal pair, read on THIS
arm's judged corpus): night 9 refuses on kcal ("0 kcal in
hand"), then the fire catches — "The tinder catches. A
real flame, breathing. You feed it twigs — fire. Yours.
(-0 kcal, 48 ticks.) (It will burn down. Feed it branches
or a log to keep it alive.)" The record says the fire
spent a log (4→3), but the line says "feed it twigs" and
offers the log only as future advice ("feed it ... a log
to keep it alive") — it never states a log left the pack.
Night 10 works a patch ("8× Purslane (240 kcal)"), eats
it, and is refused on 3 logs with no line recalling night
9. The day's two "fragments by the fire" lines are
ambient gossip (fires as a social setting), and they run
even though night 10's own warmth attempt FAILS
(fireLit false) — so "by the fire" cannot be read as the
warmth fire, and it certainly does not connect the spend.

Following evenings 12, 13, 14 read the same way: each
refusal judges the post-spend pack (2, 1, 0 logs) with no
line about the previous night; night 14's warmth misses
'no-wood' with no line saying why the pack is empty —
that the fires ate the logs is nowhere in the story. The
loose test therefore agrees with the strict test (0/4),
not by luck but because the narration has no vocabulary
for "last night's fire cost the bridge."

Variant ON, following evenings 10, 11, 15, 16: same shape.
Night 11's day contains no fire line at all despite
following night 10's spend; night 16's day carries one
ambient "fragments by the fire" gossip line while its
warmth misses 'no-wood' — gossip again, not a connection.
PASS on coherence (every line is true, every number
matches its record) and FAIL on connection (the story
never joins the spend to the refusal) — both halves of
that sentence are the finding, and neither cancels the
other.

## 6. RANKED WORDING PROPOSAL (proposes; implements nothing)

Ranked by the counts above, under the preregistered rule
(an option outranks keep-as-is only to the extent the
census shows multi-gate evenings are common AND the
hidden gate changes what a reader would do or conclude).
All three options keep the current first gate first — the
line's lead names the decision order (wood, kcal, ticks),
and renaming the lead would misdescribe the decision.

### 1. Name-first-plus-count (RECOMMENDED)

Keep the current line verbatim as the lead, and append
the count — and, where room allows, the names — of the
further failing gates. Sketch (wording to be settled by
the design owner, not landed here): "No bridge tonight —
the pack holds 3 logs, and a bridge needs 4. (Also
short: 60 kcal.)" On the all-three evening the appendage
carries two gates. Why first: it repairs 100% of the
censused incompleteness (all 10 multi-gate evenings hide
at least one gate; the appendage names them), it changes
nothing on single-gate evenings (24/34 evenings keep
their exact current line), and it preserves the lead the
reader already parses. Its cost is length on 10/34
evenings only — the evenings where the reader most needs
the extra words.

### 2. Name-all-gates

One line per failing gate, or one line naming all failing
gates with their numbers. Why second: fullest honesty —
the all-three evening (day 13 variant) is fully spoken,
and no reader must infer a count from an appendage. Why
not first: on multi-gate evenings the line roughly
doubles or triples in length on a one-screen mobile
surface, and the first gate already carries the decision
order — the extra gates are context, not the headline,
so promoting them to equal billing spends screen on
nights where the reader's action (get a log AND food
AND time) is already implied by option 1's appendage.
Strictly better than keep-as-is; longer than option 1
for the same repair.

### 3. Keep-as-is (NOT RECOMMENDED)

Why it is defensible: every line is true, every number
is exact, and single-gate evenings (24/34) are already
complete. Why it ranks last: on the warmth-live
trajectory half the strand evenings (5/10) hide a
binding gate, and the hidden gate changes the conclusion
— "one more log and you cross" is wrong on all five
both-evenings, and "a wood failure" is wrong on the
three ticks-plus evenings, where the villager also ran
out of day (93-95 vs 96). Brevity bought by hiding a
binding failure is not honesty under CANON.md's
no-silent-actions rule as this arm reads it — the
action narrates, but it narrates half the refusal.

### Adjunct: warmth-spend clause (attach to option 1 or 2, not standalone)

On evenings directly following a spend night, append a
spend clause, e.g. "(Last night's fire took a log.)"
Supported by 0/8 connected on either test, on two
independent trajectories. It is an adjunct, not a fourth
option, because it repairs a different gap (causal
history, not concurrent gates) and it needs the game to
remember last night's spend — a small state note whose
design belongs to the owner, not to this DIAG arm. Note
also that the spend line itself ("Feed it branches or a
log to keep it alive") should not be mistaken for this
clause: as written it advises a future feed, it does not
report a spent log.

### What is NOT proposed

- No change to gate order, gate numbers, or the bridge
  decision itself. The decision is honest; only its
  narration is incomplete.
- No change to single-gate lines. They are complete as
  they stand.
- No wording is landed by this arm. The proposal goes to
  the coordinator / Steve as a design call, per the
  task brief.

## Village assessment (plain words)

The banked villages are the same working villages the
strand arms have always seen: all 10 survived 30 days on
all four legs (ceiling effect of the window + banking
selection, not a survival claim). One village's scholar
sleeps out by the creek while the other nine cross or
come home. On the warmth-live road, the story is now
fully priced in narration terms: the villager opens
short of time, then short of food, then short of wood
because its own fires ate the bridge — and on half
those nights the game tells it only the wood half. On
the press-fed road the same villager eats better (590,
950, 1246 kcal in hand on wood evenings) and still
strands, now on wood plus a 3-tick shortage of day —
and the line still says only wood. The village at home
is not poor through any of this (pantry 21,968-30,581
kcal across the primary strand in the prior census);
the field villager is disconnected from it, and the one
sentence that could tell it what it actually lacks tells
it only the first thing it lacks. That is the blank this
arm fills: not a new failure, but the exact shape of a
known sentence's incompleteness — 10 multi-gate
evenings out of 34, 8 unconnected warmth follow-ups out
of 8, every one of them true and incomplete at once.

## Reachability

No new content reached; no game change landed, so no
reachability change is claimed. Creek/bridge content
reached on all four legs (control: guard 12 creek / 9
rescued, ON 18 / 8; variant: guard 13 / 9, ON 25 / 8).
Wave reach (maxWaveUnlocked per seed, reached = at least
that wave): wave 1 in 10/10 on all legs; wave 2 in 8/10
control legs, 9/10 on both variant legs; wave 3 in 1/10
control legs, 2/10 guard-variant, 1/10 ON-variant;
waves 4-5 in 0/10 on every leg in this 30-day window
(same window as the prior strand arms).

## Wall numbers

NOT OBSERVABLE as reachability on 30-day evening legs
(pre-seat, no field) — reported, never claimed. Observed
counts on all four legs, all 10 seeds alive at day 30:
national 0, table 0, wins 0 (structurally unreachable in
this band, not a wall measurement); median survival 30
days (ceiling — all seeds survived the window).

## Proof

scripts/test-lackingline-a.js: 140/140 checks pass,
including: classifier unit cases for all eight gate
combinations + kcalLive fallback + null handling;
lackingLine templates contain no spend language;
census totals recomputed independently from the corpora;
per-leg strand sets, combo counts, skip agreement, and
narration==template on every censused evening (34/34);
warmth ledger cross-checks (woodBefore − woodAfter ==
logSpent on every spend night); variant ticks-plus
evenings exist (>= 1) and never name ticks; determinism
15215 ON byte-identical; tracked-diff guard: src/ and
scripts/policies/ between pinned base f44ec6957 and the
final tree are EMPTY — the analyzer and proof scripts are
measurement only (new files, not edits).

## Metric review

- Raw-gate classification (never the bridge skip) is the
  right instrument, and this run re-proves why on a new
  class: a skip-built census would report zero ticks-plus
  evenings on the primary legs (true, vacuously) and would
  also report zero on the variant legs (false — three
  exist, all hidden behind wood-short). Any future
  prereg must never accept skip reasons as failure modes.
- The pooled-primary column needs its overlap note
  (guard 7-9 duplicates ON 7-9). The next prereg should
  require the overlap sentence alongside any pooled
  strand table, or report distinct-trajectory counts only.
  No verdict here hinges on the pooled share: the ON
  trajectory alone (5/10 multi-gate) carries the same
  conclusion as the pooled figure (5/13).
- The strict warmth-connection test (refusal-line text)
  and the loose test (any line in the following day)
  agreed on both trajectories (0/4 and 0/4). The strict
  test alone would have sufficed for the count, but the
  loose test is what rules out the "mentioned elsewhere
  in the day" rescue of keep-as-is — keep both tests in
  the next prereg for any narration-connection claim.
- The combo vocabulary ('wood+kcal', 'wood+kcal+ticks',
  'wood+ticks', single-gate '-only') separated cleanly:
  all eight theoretical combinations except kcal+ticks
  were observed across the two roots (kcal+ticks 0/34 —
  the one unobserved class; a future substrate with a
  kcal+ticks evening would test whether kcal-first
  naming hides ticks the same way wood-first does).
- No metric revision is proposed for the GO bar itself:
  completeness over the re-derived set behaved well, and
  the variant extension's never-pool rule is what kept
  the primary counts honest. The one refinement for the
  NEXT run is the pooled-overlap sentence above, which
  tightens reporting without changing the bar.

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-31 — food-economy/narration — LACKING
  LINE HIDES CONCURRENT GATES, CENSUSED (this arm):
  10 multi-gate evenings in 34 (primary 5/13 pooled,
  5/10 ON trajectory; variant 5/17), every one named
  wood while hiding kcal and/or ticks; the only
  all-three evening (ON-variant day 13) hides two gates.
  Ranked wording proposal in §6 above; implementation
  is a design call, not landed here. (evidence: this
  file; judged corpora, 15215.)
- [open] 2026-10-31 — food-economy/narration — WARMTH
  SPEND NEVER CONNECTED TO THE NEXT REFUSAL (this
  arm): 0/8 following evenings mention the prior
  night's bridge-log spend, on either the strict
  refusal-line test or the loose any-line test, across
  two independent trajectories (primary spends 9, 11,
  12, 13; variant spends 9, 10, 14, 15). Adjunct clause
  proposed in §6; implementation is a design call.
  (evidence: this file; judged ON + ON-variant corpora,
  15215.)
- [open] 2026-10-31 — food-economy/drift — 15009 STRAND
  LOSS STANDS, FIFTH BASE (this arm): 15009 has 0 creek
  evenings on all four legs on base f44ec6957, exactly
  as on the wakeforage, pressb, kcalshort, and warmfuel
  bases. Strand-built banks must re-derive membership
  per base. (evidence: this file's fresh baselines.)

## Instrument notes (disclosed)

- EPERM write flap (known container class): the pilot
  guard leg's per-seed write failed into the driver's
  in-memory pending queue and flushed clean on retry;
  the pilot ON leg then wrote first-try. No judged
  number comes from a pending or partial write — both
  judged control legs and both variant legs wrote
  first-try, exit 0, and the determinism leg confirms
  byte-identity. The flap also blocked git object writes
  for a stretch mid-run (safe-commit and hash-object
  both EPERM); it cleared before the prereg commit, which
  landed as 03f89d187, and the prereg commit precedes all
  judged legs in branch order (pilot legs ran as smoke
  tests before the commit landed and were removed, never
  judged).
- safe-commit index clobber (known class, second sighting
  pattern): after the prereg commit, the worktree's main
  index showed the committed prereg file as a staged
  deletion while the file itself was present. Repaired
  with `git update-index --add --cacheinfo` from the
  HEAD blob (hash verified equal to the worktree file);
  `git status` after repair shows only genuine untracked
  files, and `git show --stat HEAD` confirms the commit
  holds exactly the prereg file (156 lines). The same
  check will be run after the final commit.

## Files

- Prereg: evidence/2026-10-31/sim-lackingline-a-prereg.md
  (commit 03f89d187; pinned base f44ec6957)
- Evidence (this file): evidence/2026-10-31/sim-lackingline-a.md
- Analyzer: scripts/analyze-lackingline-a.js; proof:
  scripts/test-lackingline-a.js (140/140)
- Judged control corpora: evidence/2026-10-31/
  sim-lackingline-a-corpus-guard, -corpus-on;
  censuses: sim-lackingline-a-census-{guard,on}.json
- Judged variant corpora: evidence/2026-10-31/
  sim-lackingline-a-corpus-guard-variant,
  -corpus-on-variant; censuses:
  sim-lackingline-a-census-{guard-variant,on-variant}.json
- Determinism: evidence/2026-10-31/
  sim-lackingline-a-corpus-determinism (15215 ON re-run,
  byte-identical to the judged ON 15215 file)
- Leg logs: evidence/2026-10-31/
  sim-lackingline-a-confirm-{guard,on}.log,
  sim-lackingline-a-variant-{guard,on}.log
