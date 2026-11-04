# sim-envelope-b — OFFLINE ENVELOPE TRADE TABLE (no variant judged, nothing changes in the game)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T2330Z,
axis food-economy, arm sim-envelope-b. Worktree sim-envelope-b,
branch sim-envelope-b. OFFLINE ONLY: no new sims, no game-code
change, no policy-default flip, no gate/price change, no deploy.
This arm judges NOTHING as a variant verdict. It is an offline
selection table over trajectories that already exist, plus a
DRAFT preregistration for a future fresh-band run
(evidence/2026-11-03/sim-envelope-next-prereg-DRAFT.md).
Nothing in this file changes the game, and no deploy claim may
cite it.

## Corpus (existing only, read-only)

The EXISTING 28-leg tracer corpus from run
fleshout-loop-b-20261103T2130Z, landed to master as e483747cc:
evidence/2026-11-03/sim-streakfree-cost-b-tracer.jsonl, with
evidence/2026-11-03/sim-streakfree-cost-b-summary.json and
evidence/2026-11-03/sim-streakfree-cost-b.md. The corpus is
read, never edited. The streakfree-cost run's verdict on that
corpus was INSUFFICIENT-DATA (tracer verification failure on
2 legs); this arm does not re-litigate or re-judge that
verdict. The 28 legs are: 12 screened collapsing candidates
plus the first 16 screened survivors in seed order (83201–
83216), all competent 30d on one base.

## Method (one parameter varied, everything else verbatim)

Tool: scripts/analyze-envelope-b.js (new). It reuses
scripts/analyze-streakfree-cost-b.js VERBATIM, read-only,
never edited — its fallback (F) is imported, not copied, and
its (c) plumbing is reused through the gatediseng analyzer.
The E1 rule is re-implemented in the new file ONLY to
parameterize the envelope fraction: fireEnvelope(seedJson,
fraction) is fireEstar85 with the 0.85 constant replaced by
the parameter — same stretch scan, same eligible day (>= 8),
same hungryStreak (>= 1), same E2 cliff (0.65) checked first,
same peak/falls bookkeeping, same first-firing-wins
semantics. Variant (v_f) = earliest of (e_f) and (F); a tie
on one day goes to (e_f), matching the cost analyzer.
Fractions tabled: 0.85 (current v**), 0.87, 0.88, 0.90 (old
e*). Lead = first-starvation day − first-firing day, exactly
as in the streakfree-cost prereg.

## REPRODUCTION CHECK FIRST (step 2 — passed, no adjustment)

The 0.85 column must reproduce the streakfree evidence's
descriptive numbers for the verified legs, or this arm stops.
It reproduces them exactly, per-seed as well as in aggregate
(proved in scripts/test-envelope-b.js, 52/52, including the
per-seed variant and (c) days):

| check | evidence (streakfree-cost) | this table, 0.85 |
|---|---|---|
| fire coverage, verified collapsing | 10/10 | 10/10 |
| tie vs (c) | 9/10 | 9/10 |
| strictly earlier than (c) | 8/10 | 8/10 |
| lead-one (>= 1 day) | 9/10 | 9/10 |
| mean lead (v**) vs (c) | 3.1 vs 1.9 | 3.1 vs 1.9 |
| survivor firing | 1/16 (83201) | 1/16 (83201) |

Per-seed variant days at 0.85 match the evidence table on all
10 verified collapsing legs (83230: 13, 83248: 18, 83263: 19,
83272: 20, 83281: 28, 83284: 21, 83286: 16, 83336: 21, 83341:
14, 83379: 23). No mismatch, so no corpus or analyzer
adjustment was made or needed.

## Main table — 10 verified collapsing legs

Verified = rows == daysAlive. (c) day/lead is the old rule,
unchanged across all columns. Only the variant column moves.

| seed | ref (1st starv.) | (c) day/lead | 0.85 day/clause/lead | 0.87 day/clause/lead | 0.88 day/clause/lead | 0.90 day/clause/lead |
|---|---|---|---|---|---|---|
| 83230 | 16 | 15 / 1 | 13 E2 / 3 | 13 E2 / 3 | 13 E2 / 3 | 13 E2 / 3 |
| 83248 | 20 | 17 / 3 | 18 E1 / 2 | 18 E1 / 2 | 18 E1 / 2 | 16 E1 / 4 |
| 83263 | 20 | 20 / 0 | 19 E2 / 1 | 19 E2 / 1 | 19 E2 / 1 | 19 E2 / 1 |
| 83272 | 25 | 21 / 4 | 20 E1 / 5 | 20 E1 / 5 | 20 E1 / 5 | 19 E1 / 6 |
| 83281 | 28 | 28 / 0 | 28 E2 / 0 | 28 E2 / 0 | 28 E2 / 0 | 28 E2 / 0 |
| 83284 | 22 | 23 / -1 | 21 E2 / 1 | 21 E2 / 1 | 21 E2 / 1 | 21 E2 / 1 |
| 83286 | 17 | 17 / 0 | 16 E2 / 1 | 16 E2 / 1 | 16 E2 / 1 | 16 E2 / 1 |
| 83336 | 27 | 25 / 2 | 21 E1 / 6 | 21 E1 / 6 | 21 E1 / 6 | 21 E1 / 6 |
| 83341 | 21 | 15 / 6 | 14 E2 / 7 | 14 E2 / 7 | 14 E2 / 7 | 14 E2 / 7 |
| 83379 | 28 | 24 / 4 | 23 E1 / 5 | 23 E1 / 5 | 23 E1 / 5 | 23 E1 / 5 |

Aggregate, verified collapsing legs (n = 10):

| fraction | fire | tie vs (c) | strict | lead-one | mean lead variant | mean lead (c) |
|---|---|---|---|---|---|---|
| 0.85 (current v**) | 10/10 | 9/10 | 8/10 | 9/10 | 3.1 | 1.9 |
| 0.87 | 10/10 | 9/10 | 8/10 | 9/10 | 3.1 | 1.9 |
| 0.88 | 10/10 | 9/10 | 8/10 | 9/10 | 3.1 | 1.9 |
| 0.90 (old e*) | 10/10 | 10/10 | 9/10 | 9/10 | 3.4 | 1.9 |

Survivors — firing count and rate (verified survivors, n = 16):

| fraction | firing survivors | rate | detail |
|---|---|---|---|
| 0.85 | 1 (83201) | 1/16 = 6.25% | fires day 15, E1, pantry 18,489 at 0.785 of peak 23,550 |
| 0.87 | 1 (83201) | 1/16 = 6.25% | fires day 14, E1, pantry 20,300 at 0.862 of peak 23,550 |
| 0.88 | 1 (83201) | 1/16 = 6.25% | fires day 14, E1, pantry 20,300 at 0.862 of peak 23,550 |
| 0.90 | 1 (83201) | 1/16 = 6.25% | fires day 14, E1, pantry 20,300 at 0.862 of peak 23,550 |

The other 15 survivors are silent under every fraction. The
survivor firing COUNT does not discriminate between fractions
on this band — only its DAY does (day 15 at 0.85, day 14 at
0.87 and above).

## What moves, leg by leg (why the table looks this way)

Only three legs move at all across the four fractions, and
two of them move only at 0.90:

- 83248 (the tie leg): at 0.90 the envelope fires day 16,
  pantry 15,650 at 0.898 of its stretch peak 17,430 — just
  under the old 0.90 bar, two falls in. At 0.85, 0.87, and
  0.88 that evening does not qualify, and the next
  qualifying evening is day 18 (pantry 13,400 at 0.769 of
  peak), where (F) also fires. So the tightening costs two
  days here and loses the tie leg (lead 2 vs (c)'s 3). The
  intermediate fractions do not help at all: there is no
  qualifying evening between 0.88 and 0.90 on this leg — the
  store jumps from hovering at 0.898 straight to 0.769.
- 83272: at 0.90 the envelope fires day 19, pantry 23,477 at
  0.887 of peak 26,467. At 0.85–0.88 the day-19 fraction
  (0.887) is above every intermediate bar, so firing waits
  until day 20, pantry 22,486 at 0.8496 of peak — a hair
  under the 0.85 bar (0.0004 of margin). That day-20 firing
  is knife-edge at 0.85: a future band's near-identical leg
  could fall the other side of the bar on pantry noise.
- 83201 (the sole survivor firing): at 0.85 the envelope
  fires day 15 at 0.785 of peak; at 0.87 and above it fires a
  day earlier, day 14, at 0.862 of peak — a healthy village
  whose store merely dipped to 86% of its recent high. The
  count stays 1/16, but the warning lands a day sooner on a
  village that survives.

The other eight collapsing legs are identical across all
four fractions (six fire via the fraction-invariant E2 cliff,
two via E1 at fractions well below 0.85). In short: on this
corpus, 0.87 and 0.88 are DOMINATED options — they buy
nothing on any collapsing leg and they fire a day earlier
on the one surviving village. The real choice is 0.85 vs
0.90, and it is a two-leg trade, not a general slope.

## SEPARATELY LABELED DESCRIPTIVE SECTION — 2 unverified loss-day legs (never in any judged or verified denominator)

Seeds 83373 and 83377 fail rows == daysAlive in the 2130Z
corpus (rows 19 vs daysAlive 20, and rows 25 vs daysAlive 26;
rows == gameDays == daysAlive − 1 in both). Their analyzer
values below are descriptive only, computed on their recorded
evening series, and enter NO count, rate, or mean above.

| seed | ref (1st starv.) | (c) day/lead | 0.85 day/clause/lead | 0.87 | 0.88 | 0.90 |
|---|---|---|---|---|---|---|
| 83373 | 16 | 17 / -1 | 16 E2 / 0 | 16 E2 / 0 | 16 E2 / 0 | 16 E2 / 0 |
| 83377 | 25 | 15 / 10 | 14 E1 / 11 | 14 E1 / 11 | 14 E1 / 11 | 14 E1 / 11 |

Neither unverified leg moves across fractions (83373 fires
via the fraction-invariant E2 cliff; 83377's E1 firing sits
well below 0.85). Including them descriptively would not
change the shape of the trade: at 0.85 the descriptive
12-leg tie count would be 11/12 (both unverified legs tie
or beat (c)), at 0.90 it would be 12/12 — but those counts
are NOT reported as results, because the legs are
unverified by the prereg's own rule.

## RECOMMENDATION (a recommendation, not a verdict, not a deploy)

Carry E1@0.85 — the current (v**) — as the PRIMARY variant
into the next fresh-band run. Reasons, in order:

1. The cost leg is why this variant exists. On the old
   adopt corpus, 0.90 fired on 4/15 survivors (cost leg
   failed) and 0.85 fired on 3/15 (passed); 0.85 was chosen
   as the MINIMAL tightening that fixed that leg. Nothing
   in this table overturns that: on this band the survivor
   count is 1/16 at every fraction, so this band cannot
   re-discriminate cost by count — and the one survivor
   firing that does exist still shows the shallow shape
   (0.862) that only 0.85 refuses a day longer.
2. The intermediate fractions (0.87, 0.88) earn nothing
   here: identical collapsing days to 0.85 on all 10
   verified legs, and an earlier firing on the surviving
   village. There is no evidence in this corpus for
   carrying an intermediate as primary.
3. The 0.90 column's gains are real but narrow: two legs
   fire one and two days earlier (83272, 83248), restoring
   the tie leg descriptively (10/10 vs 9/10) and lifting
   mean lead from 3.1 to 3.4. That is the price of the
   tightening, stated honestly — not hidden. But buying it
   back means re-opening the old-corpus cost failure, which
   is the leg the whole cost arm was built to fix.

Carry, alongside the primary, a PROPOSAL (not a decision)
for the future run's prereg: report the 0.87/0.88/0.90
columns descriptively on the fresh band, so the future run
can see whether the intermediate dead zone and the 0.90
two-leg gain replicate, without judging the variant on
them. If the fresh band again shows a 0.898-style hover
costing the tie leg while cost stays low, the NEXT decision
after that run is between accepting tie misses and
re-opening cost — that decision is not made here.

## Plain-words read (what the trade means for villages)

Think of the envelope as how far the village store must
have fallen from its recent high before the warning speaks.
A looser warning (0.90: "speak when the store has fallen a
tenth") speaks earlier on villages whose store hovers just
under its high for days — it warned one such village two
days sooner, in time to beat the old rule. But it also
speaks a day sooner on a healthy village whose store merely
dipped to about six-sevenths of its high and then
recovered; that village survives, and the warning was a
false alarm in timing if not in count. A tighter warning
(0.85: "wait until the store has fallen a seventh and a
half") holds its tongue on the healthy dip, but on the
hovering village it waits until the store has fallen much
further — two days later, after the old rule already spoke.
The middle settings (0.87, 0.88) do neither job better on
these villages: they wait just as long on the hovering
village and speak just as soon on the healthy one. So the
choice is genuinely between waiting for a deeper fall and
speaking at a shallower one, and these 26 villages say the
deeper wait costs one village its early warning while the
shallower speak costs one healthy village an earlier false
alarm. The villages themselves do not change either way
today: this is a warning rule on paper, not a behavior in
the game.

## Reachability / wall numbers (corpus properties, not new measurement)

No new sims were run, so no new reachability measurement
exists. For context only, the underlying 2130Z corpus is a
30d early window: screen wave reach was wave 1 (1 seed),
wave 2 (48), wave 3 (151); traced legs reach wave 2 and
wave 3 only. Waves 4–5, Arc II/III/IV, regional → national,
the table, and the win flag are NOT REACHED IN WINDOW
(expected 0 — late-game states with no fields in a 30d
window, reported as such, not as a rate claim). Vests: not
measured by this instrument. Villagers acting like people:
not re-sampled here — this arm reads pantry trajectories,
not transcripts; the streakfree-cost sense test (silent
firing evenings) stands as the last transcript reading and
is not re-claimed.

## Balanced panel (§15) — inapplicability declared

No balanced-panel compare is fabricated, with the same
reasoning as the streakfree-cost prereg: this arm changes
NO game code, runs NO lever, and its metrics are
within-trajectory instrument diagnostics (would-fire
overlays on identical evening series), not panel metrics.
The tables above are reported directly, on identical seeds
and identical trajectories. A panel compare would measure
nothing — there is no before/after game behavior to panel.

## Canon note

docs/CANON.md read in full. NO canon doc covers the
gatediseng sensor (e*) itself — it is a policy-side sim
instrument, not a game system; no canon is invented for it.
docs/PRESERVATION.md (food ladder: cleaned → cooked →
smoked → rendered → pemmican) is adjacent only — it
governs how food lasts, not how a collapse warning is
computed — and this arm invents no game system.

## Metric review (doubts about this header go here; any revision applies to the NEXT run, never to this one)

1. Offline tables are selection aids, not verdicts. This
   table was computed on a corpus whose own run was
   INSUFFICIENT-DATA; its verified-leg numbers are
   descriptive, and the future run must judge its variant
   on a fresh band, never by pooling this table with fresh
   legs. The draft prereg enforces that.
2. The 0.85 column's 83272 firing (0.8496 vs a 0.85 bar)
   shows the envelope fraction is a knife-edge parameter
   on real trajectories: a future prereg should not treat
   a one-leg, sub-0.001-margin firing as robust evidence
   for a fraction, in either direction.
3. Survivor-firing DAY is informative even when the COUNT
   is flat: on this band every fraction fires on the same
   single survivor, but 0.85 fires a day later. A future
   cost leg that counts only firings would miss that
   timing difference; reporting firing days (as this table
   does) should stay in the future prereg's secondary
   reporting, flagged as a proposal there.
4. Verification field (carried from streakfree-cost metric
   review item 1, NOT settled here): the next run's prereg
   must settle, BEFORE judging, whether verification
   compares rows to daysAlive or to gameDays (or exempts
   the loss-day row explicitly). This arm does not settle
   it — the sibling arm sim-verifyfield-b is the settling
   run, and the draft prereg adopts whatever field that
   arm settles, without assuming its outcome.

## Proofs

- scripts/analyze-envelope-b.js (new; parameterized E1,
  verbatim (F) import, verbatim cost-analyzer reuse)
- scripts/test-envelope-b.js: 52/52 green — synthetic
  fraction logic (hover 0.898, deep 0.84, mid 0.862, E2
  cliff invariance, (F) verbatim, variant first-firing
  and tie-to-E, 0.85-vs-fireEstar85 agreement) plus the
  corpus reproduction check in full (28 legs, 10 verified
  collapsing, 16 survivors, 2 unverified reported
  separately; 0.85 aggregates and all per-seed days match
  the streakfree-cost evidence).
- No existing script, policy, or game file edited. No
  push, bump, or live verification. Ready for coordinator
  landing, pending ship.

## Blanks filled or documented

- Filled: streakfree-cost metric review item 2 — the
  E1@0.85 tie/cost trade is now tabled across 0.85/0.87/
  0.88/0.90 on the existing corpus, with a recommendation
  for the next run's primary fraction and the dead-zone
  finding (intermediates buy nothing here) recorded.
- Documented (not fixed): (a) the 83272 knife-edge firing
  at 0.8496 under a 0.85 bar; (b) the survivor-timing
  difference (day 14 vs 15 on 83201) hidden by a flat
  count; (c) the verification-field question, left to the
  sibling settling run and the draft prereg.
- No new findings-backlog item: nothing outside this arm
  surfaced.
