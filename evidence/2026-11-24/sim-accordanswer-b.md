# Accord answering — Loop B, run fleshout-loop-b-20261124T0840Z, arm sim-accordanswer-b

Axis: winnability chain. POLICY PROBE: zero src/js changes —
the arm flips the existing env gate only (`ANSWERMAIL_DRIVE=1`,
landed sim-answermail-drive-a); the instrument is a neutral
recorder layered over the havenlink instrument, reused verbatim.
Anchor: instruments commit `fd1ab09e3`; corpus anchor
`fd1ab09e3` (single anchor on all 16 per-seed JSONs).
Policy `scripts/policies/competent.js` `{competent}` VERBATIM
on both legs, default env vs `ANSWERMAIL_DRIVE=1`. Seeds
109301–109308 (the havenlink band, replay for comparability).
Horizon 150 days, death-aware.
Balanced panel (§15): built from the per-seed corpus
(pseudo-policy pattern, paired seeds); compare attached below.

Prereg: `evidence/2026-11-24/sim-accordanswer-b-prereg.md`
(commit `b9e0dd65e`, before any judged sim).

## Verdict — DIAG-GO

All prereg legs pass: proof 15/15 green before the judged
legs, 0 instrument errors on every seed, control reproduces
the havenlink corpus 8/8 on every frozen field, every staged
accord classified with its answer (actor + day + lag + price)
or its unanswered span, 0 unclassified on either leg.

The answer to the havenlink blank, in one sentence: **the
accord is load-bearing as the opener, not as the wall — the
gesture puts +10 trust on the link the same day it is made
(30 → 40, crossing the trust-40 season bar at once) and the
drive's tend stream then holds it there, so 7/7 links season
on the arm against 2/7 on the control; but nothing structural
moves — the Dawn fires on the same day, no new link forms, no
offer or counter is ever staged, no village reaches national,
no one wins, and survival and standing swing both ways per
seed.** The fiction fix (a voiced gesture) is now a build
question, not a measurement question.

## Answer-rate table (primary metric)

Control 0/7, arm 7/7. Every answer is the engine drive, on
the staging day itself (lag 0), always the `gift`, always the
full 2,000 kcal, always trust +10 — and always a different
villager answering, never the player.

| seed | staged (day, target) | control: unanswered span | arm: answered (day, lag, actor, how, kcal, trust) |
|------|----------------------|---------------------------|---------------------------------------------------|
| 109301 | d27, Ashford | d27 → d126 (99 days) | d27, lag 0, Emma, gift, 2,000, +10 |
| 109302 | d27, Emberhold | d27 → d119 (92 days) | d27, lag 0, Priya, gift, 2,000, +10 |
| 109303 | d36, Emberhold | d36 → d104 (68 days) | d36, lag 0, Gloria, gift, 2,000, +10 |
| 109304 | d59, Stonebridge | d59 → d74 (15 days) | d59, lag 0, Nyarko, gift, 2,000, +10 |
| 109305 | none (died d36) | — | — (no accord ever staged) |
| 109306 | d20, Emberhold | d20 → d150 (130 days) | d20, lag 0, Fatima, gift, 2,000, +10 |
| 109307 | d25, Emberhold | d25 → d150 (125 days) | d25, lag 0, Wanjiru, gift, 2,000, +10 |
| 109308 | d39, Stonebridge | d39 → d150 (111 days) | d39, lag 0, Benoit, gift, 2,000, +10 |

Pooled: staged 7/7 both legs, answered 0/7 control, 7/7 arm.
The control reproduces the havenlink finding exactly
(unanswered to run end on 7/7 linked seeds, longest 130 days
on 109306). The arm answers before the day is out on every
seed — the drive ticks daily and a living representative is
always available on the staging day (0 blocked-no-answerer
days fall on a staging day; the 10 blocked days across the
band all fall later, on tend days).

## The drive's ride-along (the confound, measured)

The env gate answers more than the accord. Per seed (arm leg):

| seed | accord | tends paid | tends blocked (pantry ≤ 20k) | renegotiations | demands | answerers (distinct villagers) | drive errors |
|------|-------:|-----------:|-----------------------------:|---------------:|--------:|-------------------------------:|-------------:|
| 109301 | 1 | 7 | 9 | 0 | 0 | 5 | 0 |
| 109302 | 1 | 5 | 12 | 0 | 0 | 3 | 0 |
| 109303 | 1 | 9 | 54 | 0 | 0 | 5 | 0 |
| 109304 | 1 | 2 | 75 | 0 | 0 | 1 | 0 |
| 109305 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 109306 | 1 | 14 | 46 | 0 | 0 | 5 | 0 |
| 109307 | 1 | 6 | 88 | 0 | 0 | 4 | 0 |
| 109308 | 1 | 10 | 45 | 0 | 0 | 4 | 0 |

Pooled: 7 accord answers, 53 tends paid, 329 tend-weeks
blocked by the pantry gate, 0 renegotiations, 0 demands —
no renegotiation or demand was ever staged on this band, so
those two drive verbs never fire here. The tend gate binds
hard: only 53 of 382 tend-weeks pay (the pantry holds >
20,000 kcal on roughly one week in seven). The accord gift
has no such gate — it pays what's there, and on this band
the pantry always held the full 2,000 on the staging day.

Attribution, stated plainly (prereg confound): the downstream
deltas below are the DRIVE's total effect (answer + tends),
not the accord's alone. The accord is isolated only at the
answer event itself — its price (2,000 kcal), its trust gain
(+10, measured before/after around the call), its lag (0).
The seasoning result (7/7 vs 2/7) belongs to the drive as a
whole: the answer crosses the trust bar on day one, and the
tends keep trust up while the link ages into its 30-day
season. Neither half can be credited alone from this design.

## Downstream deltas, paired per seed (secondary metrics)

| seed | days ctl → arm | standing final | standing peak | Dawn day | seasoned at end | links | wave-4 kills | wave-5 kills | deaths (starv.) |
|------|---------------:|---------------:|--------------:|---------:|----------------:|------:|-------------:|-------------:|----------------:|
| 109301 | 126 → 80 | 345 → 325 | 5 → 4 | 48 → 48 | 1 → 1 | 1 → 1 | 4 → 3 | 0 → 0 | 111 → 92 (0 → 0) |
| 109302 | 119 → 69 | 435 → 190 | 4 → 4 | 48 → 48 | 1 → 1 | 1 → 1 | 6 → 0 | 0 → 0 | 108 → 79 (0 → 1) |
| 109303 | 104 → 150 | 280 → 400 | 4 → 4 | 57 → 57 | 0 → 1 | 1 → 1 | 2 → 2 | 0 → 0 | 59 → 99 (2 → 0) |
| 109304 | 74 → 150 | 100 → 250 | 4 → 5 | — → 80 | 0 → 1 | 1 → 1 | 0 → 3 | 0 → 0 | 51 → 75 (1 → 0) |
| 109305 | 36 → 36 | 50 → 50 | 0 → 0 | — → — | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 | 56 → 56 (1 → 1) |
| 109306 | 150 → 150 | 615 → 505 | 5 → 5 | 41 → 41 | 0 → 1 | 1 → 1 | 5 → 5 | 1 → 0 | 198 → 192 (1 → 0) |
| 109307 | 150 → 150 | 385 → 225 | 4 → 5 | 46 → 46 | 1 → 1 | 1 → 1 | 3 → 2 | 0 → 0 | 139 → 100 (0 → 0) |
| 109308 | 150 → 150 | 265 → 340 | 4 → 4 | 60 → 60 | 0 → 1 | 1 → 1 | 3 → 3 | 0 → 0 | 60 → 60 (0 → 0) |

Pooled: standing final −190 total (mean −24/seed, sign
flips per seed: −20, −245, +120, +150, 0, −110, −160, +75);
standing peak +1 on two seeds, −1 on one; Dawn day
UNCHANGED on all 6 seeds where it fires on both legs
(109304 is the exception: the control dies day 74 with its
bond only 15 days old, so the Dawn never fires; the arm
survives and the Dawn fires day 80); seasoned links at end
2/7 → 7/7; links formed 1 → 1 on every linked seed, 0 → 0
on 109305 — answering the accord forms NO new link;
wave-4 kills 23 → 18; wave-5 kills 1 → 0 (109306 loses the
band's only wave-5 kill on the arm); scale rank moves on one
seed only (109304 village → regional); wins 0 → 0, national
0 → 0. Proposals, counters, national beats: 0 on BOTH legs
— answering the accord stages no new offer; the BELONG road
stays unoffered exactly as havenlink found it.

Survival swings both ways: two villages die ~7 weeks
earlier on the arm (109301: −46 days; 109302: −50 days),
two live much longer (109303: +46; 109304: +76), four
unchanged. Median survival 122.5 → 150. With n=8 and no
confirm band (this is a diagnostic probe), the swing is
reported as observed, not as a lever effect — the mechanism
is unproven, but the shape is suggestive: the drive spends
food (2,000 gift + 1,500/tend-week) and on food-tight seeds
that spend may hasten collapse, while the seasoned link
pays back in standing and survival on others. The kill
delta is survival-mediated, not seasoning-mediated:
109302's wave-4 kills fall 6 → 0 because the village dies
day 69 instead of day 119, and 109304's rise 0 → 3 because
it survives to the horizon.

Cost guardrail (prereg, reported not re-scored — the
verdict is diagnostic): starvation deaths 5 → 2 (pass: 2 ≤
5+2); median survival 122.5 → 150 (pass: ≥ 0.8×). Unlike
the drive arm's band (2 armed starvation deaths vs 0
control, NO-GO), this band shows NO starvation cost — the
drive's food spend did not starve anyone extra in pooled
terms (one seed, 109302, has 1 armed starvation death
against 0 control).

## Sense-test: 109301, the accord story end to end

**Control — the gesture that never goes out.** Day 27:
"⛓️ Emma brings it home: Ashford bows to Haven — one
organization, us primary. Tribute: 4,000 kcal/week. The
relationship starts at trust 30. Everything from here is
earned." Day 28 Haven gives Ashford 1,443 kcal ("Rosa
weeps, openly. 'The fire network. That's what it's FOR.'")
and Ashford's tribute wagons arrive the same day. Then the
bond is tended by tribute alone for ninety-nine days —
wagons every week, the same line each time — and the village
dies day 126 with the accord still pending, trust 53,
seasoned only because ninety-nine days is long enough for
tribute +1s to crawl past 40. The fiction said "the gesture
goes out now" on day 27. Nothing ever went out.

**Arm — the same day, the same Emma, a different story.**
Day 27, the same link line, and then Emma — the villager
who brought the link home — walks the gift out herself the
same day: 2,000 kcal, trust 30 → 40, and the drive's weekly
tends follow ("Haven sends 1,500 kcal of grain to Ashford's
fire — not tribute, the other way around. Someone's
grandmother over there will remember who fed her. (Trust
+8.)") on days 27, 28, 35, and weekly after, until the
pantry gate starts blocking them. Trust ends at 94, the
link seasons, the Dawn still fires day 48 — the same day as
the control. The gesture changes the relationship, not the
calendar. And then the village still dies, day 80, forty-six
days earlier than the control — the food went out and the
village went with it, on this seed. The gift is real, and
so is its price.

Stream gap (instrument note, not a verdict change): the
accord's own say lines — the staging line ("the other fire
is watching what Haven does FIRST") and the gift line
("Haven's first gesture: 2,000 kcal walks to Ashford's
fire — a gift, no strings") — appear NOWHERE in either
per-seed JSON. Neither say stream matches them: the
havenlink LINK_RE has no 'gesture' or 'gift', and the
standing SAY_RE has neither either. The answer is recorded
precisely by the event wrap (actor, day, lag, kcal, trust),
so classification is complete, but the verbatim lines above
are quoted from the code branch that fired (gift, full
2,000 paid), not from a captured stream. Next instrument
should add 'gesture|gift' to the link regex.

## Village assessment (plain words)

Picture eight villages playing competently for one to five
months. Each one earns exactly one bond with another village
— a prize from the standing ladder, not a courtship — and on
seven of them someone has to make the first gesture. Left
alone, nobody ever does: the gesture sits in a drawer for
three or four months while the tribute wagons roll, and the
bond seasons or doesn't on the slow drip of +1s. Give the
village a hand — a living villager who can walk out, Emma or
Priya or Gloria, each seed a different face — and the gift
goes out the same day, the bond warms at once, and by the
end of the run every link is seasoned, the trust numbers
nearly double. But the village doesn't climb any higher for
it. The Dawn comes on the same day it would have anyway.
Nobody new knocks. Nobody offers the nation. And the food
the gesture costs is real food: two villages burn out weeks
early with their pantries spent on generosity, two live
longer on the strength of the seasoned bond, and the rest
can't tell the difference. The first gesture is worth making
— it is a real relationship, not a decoration — but it is
not the road to the nation. That road still has no inviter
and no asker.

## Wall numbers

Control: wins 0/8, national 0/8, table 0/8. Wave-5 unlocks
2/8, wave-5 faced 2/8, wave-4 faced 7/8, wave-4 kills 23,
wave-5 kills 1. Median survival 122.5 days (36, 74, 104,
119, 126, 150, 150, 150; max 150, censored). Seasoned
links at end 2/7 linked seeds. Starvation deaths 5.

Arm: wins 0/8, national 0/8, table 0/8. Wave-5 unlocks
3/8, wave-5 faced 2/8, wave-4 faced 7/8, wave-4 kills 18,
wave-5 kills 0. Median survival 150 days (36, 69, 80, 150,
150, 150, 150, 150; max 150, censored). Seasoned links at
end 7/7 linked seeds. Starvation deaths 2.

## Balanced panel (§15)

Built from the per-seed corpus
(`scripts/build-accordanswer-b-panels-20261124.js`,
pseudo-policy pattern, paired seeds). Files:
`evidence/2026-11-24/accordanswer-b-panel{,-before.json.gz,-after.json.gz,.json,.md}`.
Decision: **review_required** (8 paired cases, screen only).
The one non-descriptive flag is villageDeaths100Days:
regression_watch, delta +1.34, 95% exploratory interval
[−9.45, +14.24] — the interval crosses zero, so it is a
watch, not a signal, and it is an artifact of the shorter
armed runs on 109301/109302 (the same deaths compressed
into fewer days): village deaths per run actually FELL
(97.75 → 94.13, no_material_signal), community loss
improved (0.625 → 0.375), national and wins 0 → 0. The
panel is the instrument; the pre-registered bars are the
judge, and the panel moves no verdict here.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- REPRODUCTION HELD 8/8 on all eight frozen fields
  (days, endReason, scaleRank, maxWave, endUnlockedWave,
  bestCapped, doorOpenDay, daysAt199). The control leg IS the
  havenlink corpus replayed on the current anchor
  (`fd1ab09e3`, which includes Loop A's retarget-a merged
  NO-GO with its lever reverted) — nothing moved with it.
- ANSWER-RATE METRIC HELD: the rate is 0/7 vs 7/7 with lag
  0 on every answer — the instrument's lag field proved
  unnecessary on this band (the drive answers the same day)
  but stays for bands where the bench is dead on staging day.
- SEASONING ATTRIBUTION: the prereg's confound note proved
  necessary — the 7/7 seasoning is the drive's total effect
  (answer + tends), not the accord's alone. A future arm that
  wants the accord's share needs a drive variant that
  answers accords but never tends (an env split, not a new
  measurement of this gate).
- SAY-STREAM GAP: the accord's own lines never enter either
  say stream (LINK_RE and SAY_RE both miss 'gesture'/'gift').
  Classification is complete via the event wraps, but the
  next instrument should add 'gesture|gift' to the link
  regex so the sense-test quotes captured lines.
- TEND-GATE BINDING: tends paid 53 of 382 tend-weeks; the
  pantry > 20,000 gate blocks the rest. The drive's tend
  stream is far more pantry-gated than the accord gift (which
  has no gate beyond paying what's there). Any future
  tend-tuning must reckon with that gate first.
- SURVIVAL SWING UNRESOLVED: days deltas −46, −50, +46,
  +76, 0, 0, 0, 0. No mechanism is proven for the split;
  the food-spend hypothesis is stated as a hypothesis, not
  a finding. A confirm band (12–16 seeds) would be needed
  to call the survival effect at all — and this arm is a
  diagnostic probe, so no confirm is run.
- PANEL WATCH READ: villageDeaths100Days regression_watch
  with a zero-crossing interval is recorded as a watch, not
  re-scored as a regression. The per-run deaths row (which
  fell) is the honest companion read.

## Next blanks, in order

1. The fiction fix — a voiced gesture (the next blank, not
   another measurement): the accord is load-bearing as the
   opener, so the gesture should be MADE in live play, not
   only under an env-gated drive. The build/design question
   is the channel: a player-facing choice at link formation
   (gift / visit / cold, with the costs already in code), a
   villager-side answer like the drive's (the engine hook
   exists, default-OFF, and answers 7/7 here), or both. The
   drive hook is env-gated for sims; shipping any of it to
   players is a Steve/design call, and the survival swing
   (−46/−50 on two seeds) says the food price needs a look
   before the gift is made automatic.
2. The tend gate binds (329 of 382 tend-weeks blocked by
   the pantry > 20,000 rule): if tending is meant to be the
   weekly heartbeat of a link, the gate as written makes it
   a rare event, not a routine. Is 20,000 the right bar, or
   should a tend scale to what the pantry holds? A design
   question; the measurement is that the gate, not the
   will, is what stops the tending.
3. The BELONG road is still unoffered on both legs (0
   proposals, 0 counters, 0 national beats): answering the
   accord does not invite anyone. Havenlink blank #1 stands
   — the road needs an inviter and an asker, and this arm
   proves the gesture is not the asker.
4. The survival split (−46/−50 vs +46/+76) is unjudged on
   n=8. If the drive ever ships, a 12–16-seed confirm on a
   fresh band is owed before calling the food-spend effect.

## Proof and landing

- Proof: `scripts/test-accordanswer-b-20261124.js` — 15/15
  PASS (12 fixture tests: answer-rate classification, gate
  leak/off detection, answer-without-stage, channel/actor
  requirements, paired comparison + cost guardrail,
  reproduction-field comparison on the real havenlink corpus,
  wall summary, panel metric mapping, channel classifier;
  plus the live harness smoke on seed 109301: control stages
  and leaves unanswered with driveStats null, arm answers
  the same day via the engine with actor + price recorded,
  staged day identical across legs). Re-run post-commit below.
- Commits (this worktree branch sim-accordanswer-b;
  coordinator merges via --ff-only; ready to merge, pending
  ship — no push, no bump, no live verification by this
  worker):
  - `b9e0dd65e` sim-accordanswer-b prereg (before any judged sim)
  - `fd1ab09e3` sim-accordanswer-b instruments: accord recorder
    + driver + analyzer + panel builder + proof 15/15 (zero src/js)
  - `3f0f79302` sim-accordanswer-b corpus: 16 per-seed JSONs
    (8 ctl + 8 arm) + balanced panel compare (review_required)
  - `615229755` sim-accordanswer-b evidence: DIAG-GO
  - `0b377a865` sim-accordanswer-b fix: panel builder read must
    not decode gzip as utf8 (gunzipSync got mangled text)
  - Branch head: `0b377a865` (this commit records the head).
- Files: prereg + evidence in
  `evidence/2026-11-24/sim-accordanswer-b*.md`; per-seed JSON
  in `evidence/2026-11-24/perseed-accordanswer-b/` (16 files,
  anchor `fd1ab09e3`).
- Telemetry deviation check (body step 10): the per-seed
  JSONs are recorder rows (top-level `anchorCommit`), the
  same shape the standing arm established
  `telemetry-check.js` refuses; the scale-wall baseline
  carries a DO NOT compare note for pre-seat substrates. No
  LOUD line fired; no deviation is claimed. The wall numbers
  above are the report.
