# sim-expignite-b — expedition-ignition DIAG (#2463) — ADOPTION CLOSEOUT

**Verdict: DIAG GO.** All four prereg GO bars pass. The zero-attempt mechanism
is classified, not unknown.

## Prereg header (frozen 2026-11-17, `evidence/2026-11-16/sim-expignite-b-prereg.md`)

- Question: findings backlog #2463 — on the medicduty band (102801–102808),
  seeds 102803 and 102806 recorded 0 `startExpedition` calls in 150 days.
  Classify: no-EXPEDITION-commit vs commit-but-no-depart vs agency-chance.
- Band **103001–103008** (fresh; 0 hits in prior preregs/evidence/goal
  hidden_files), competent verbatim (sha256
  `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`),
  horizon **150d death-aware**, two legs, zero src/js change:
  OFF = master as-is, recorder off; ON = master as-is + recorder wraps only.
- Instrument: `scripts/expignite-driver-20261116.js`;
  analyzer: `scripts/analyze-expignite-b.js`;
  proof: `scripts/test-expignite-b.js`.
- Adoption: the previous run's worker died after 1 of 8 OFF seeds
  (s103001, verified intact: days=150, mode=off, recorderOn=false, anchor
  6eff33f3d, survived, regional, wave 4, standing 199). This run finished
  the remaining 7 OFF seeds + all 8 ON seeds; nothing was restarted.
- Canon: `docs/CANON.md` + `docs/PARTY.md` read. **Canon gap (as
  preregistered, not invented): no canon doc covers expedition candidate
  picking** — the chain below is grounded only in `src/js/villager-brain.js`,
  `src/js/villager-agency.js`, `src/js/villager-objectives.js`,
  `src/js/npc-triggers.js`.

## GO bars (bind the run — a miss is NO-GO, never re-scored)

1. **PASS** — 8/8 ON + 8/8 OFF valid corpora, 0 instrument errors,
   **unknown 0**, mismatches 0, D2 divergences 0
   (`evidence/2026-11-16/expignite-b-analysis.json`).
2. **PASS** — proof green: `node scripts/test-expignite-b.js` →
   **78 passed, 0 failed** (static + D1 determinism + D2 neutrality + D3
   re-derivation), re-run on the final tip.
3. **PASS** — zero-attempt mechanism classified (see below). Exactly one
   zero-attempt seed occurred (103004); it is classified with dominant class
   + full per-day counts. The three zero-launch-but-attempted seeds are
   classified too.
4. **PASS** — wall numbers on both legs (identical; see below).

## The answer to #2463

There are **two different zero phenomena**, and the medicduty recorder could
not tell them apart. This band shows both:

**A. True zero-attempt (1 seed: 103004). Mechanism: never committed.**
103004 survived 150d, wave 5, standing 300 — a live, healthy village that
simply never once committed to an expedition. 579 villager-days at home:
B 485 (83.8%), C 77 (13.3%), A 16, D 1, E 0, F 0. The village had
5 wanderer/explorer villagers (404 wanderer/explorer days) but **0 plan
holders** — so the win-plan launch path did not exist there at all, and the
soft path lost every time it was offered: C/assign 46 (ASSIGN overrode the
candidate), C/core-outdoor 20 (core pick was outdoor, hash never consulted),
C/duty 7, C/hash 4. The dominant bar was B/profile 256 (no candidate offered
— not a wanderer/explorer, no plan) and B/gate-hunger 198 (hunger gate fired
before candidacy). No D/E involvement: nothing was committed-and-blocked;
the dawn scorer simply never produced a surviving EXPEDITION commit in
150 days. **Classification: no-EXPEDITION-commit (B/C-dominated).**

**B. Attempted-but-never-landed (3 seeds: 103002, 103005, 103007).
Mechanism: medic-duty block, one holder each.**
- 103002: 5 attempts, 0 landed — Sean (`gen_j1warjv`) blocked 5× (d27, d33).
- 103005: 6 attempts, 0 landed — Enzo (`gen_8wg7dlp`) blocked 6× (d9, d32);
  village lost d87.
- 103007: 14 attempts, 0 landed — Erin (`gen_bu3ql6h`) blocked 14×
  (d11–d39). The village's only expedition aspirant spent a month
  re-picking the same commit and being refused at the door every time.
All 31 medic-duty blocks band-wide had a non-empty companion pool at block
time (median pool 3, max 7; pool empty once) — the holder was not alone, the
duty simply never let them go. **Classification: depart-blocked (E),
medic-duty holder starvation.** (This is the medic-duty finding from the
earlier arm, now with the per-holder, per-day receipts.)

**Band-wide ignition picture (4,761 villager-days at home; 4,874 away-days
excluded, 29 already-out):**

| class | days | share | meaning |
|---|---|---|---|
| B no-candidate | 3,918 | 82.3% | scored, no EXPEDITION candidate offered |
| C candidate-lost | 594 | 12.5% | candidate offered, not picked |
| F launched | 92 | 1.9% | departed on an expedition |
| A no-dawn-score | 130 | 2.7% | mid-errand, no re-pick at dawn |
| D commit-no-depart | 10 | 0.2% | commit held, depart never called |
| E depart-blocked | 17 | 0.4% | depart called, startExpedition refused |
| unknown | 0 | — | — |

Biggest single bars: B/profile 2,053 (43.1% of all home days — the profile
gate is the dominant reason no candidate is ever offered), B/gate-hunger
1,724 (36.2%), C/assign 252 (ASSIGN overrode the candidate),
C/core-outdoor 185, C/duty 99, C/hash 40, C/winplan-hold 18.

**The sharpest finding: every launch in the band came through the win plan.
All 92 F-days are `vbrain-party_launch`; the soft wanderer/explorer path
produced ZERO launches in 8 seeds / 4,761 villager-days.** Villages with
0 plan holders (103002, 103004, 103005, 103007) managed 25 attempts and
0 landed trips; villages with plan holders (103001, 103003, 103006, 103008)
managed 167 attempts and 146 landed trips. The random-agency origin is
confirmed dead: 0 legacy launches (the prereg code-read — `vbrainOwnsDawn`
always true, chance roll unreachable — holds on live data). The 18
C/winplan-hold rows are NOT party_launch candidates losing (that would be a
mismatch; mismatches 0): they are soft candidates beaten by a win-plan
*hold* override (`win_plan:...`), i.e. the plan system actively holding the
villager back. D is negligible (10 days, mostly D-trigger 5 / D-node 3 /
late-commit 2) — the stale-commit rule is real but rare.

## Attempts / landings (ON leg; OFF leg records 0 by construction — recorder off)

192 attempts, 146 landed trips, 46 blocked (medic-duty 31, sick 14,
hurt-no-care 1). Per seed: 103001 20/20, 103002 5/0, 103003 74/57,
103004 0/0, 103005 6/0, 103006 36/32, 103007 14/0, 103008 37/37.
21 companion-consumption rows (party_launch pulling companions along).
1 expedition death on each of 103003 and 103008; returns 17/0/48/0/0/29/0/34.

## Per-seed class table (ON leg)

| seed | days / end | denom | B | C | F | A | D | E | launches | landed | plans | w/e days |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 103001 | 150 survived | 558 | 516 | 6 | 13 | 22 | 1 | 0 | 20 | 20 | 4 | 123 |
| 103002 | 150 survived | 682 | 553 | 118 | 0 | 9 | 0 | 2 | 5 | 0 | 0 | 346 |
| 103003 | 150 survived | 603 | 429 | 98 | 38 | 30 | 3 | 5 | 74 | 57 | 9 | 579 |
| 103004 | 150 survived | 579 | 485 | 77 | 0 | 16 | 1 | 0 | 0 | 0 | 0 | 404 |
| 103005 | 87 village-lost | 357 | 256 | 85 | 0 | 14 | 0 | 2 | 6 | 0 | 0 | 290 |
| 103006 | 138 village-lost | 591 | 538 | 19 | 22 | 10 | 0 | 2 | 36 | 32 | 5 | 180 |
| 103007 | 150 survived | 722 | 542 | 154 | 0 | 20 | 0 | 6 | 14 | 0 | 0 | 499 |
| 103008 | 150 survived | 669 | 599 | 37 | 19 | 9 | 5 | 0 | 37 | 37 | 3 | 323 |

103003 is the band's workhorse (9 plan holders, 57 landed trips, wave-4
kills 3); 103008 is the cleanest launcher (37/37 landed, 0 blocks).
103002 is the paradox seed: standing 510 (highest in the band), wave 5,
8 wave-4 kills — the strongest village — and 0 landed expeditions, because
its only aspirant was the medic-duty holder.

## Wall numbers (both legs — IDENTICAL; D2 divergences 0, recorder neutral)

| | OFF | ON |
|---|---|---|
| national by standing (≥200) | 3/8 (300, 390, 510) | 3/8 |
| national by scaleRank | 0/8 | 0/8 |
| table | 0/8 | 0/8 |
| wins | 0/8 | 0/8 |
| wave 4 unlocked | 8/8 | 8/8 |
| wave 5 unlocked | 3/8 | 3/8 |
| median survival | 150d | 150d |
| deaths total | 604 (66, 68, 109, 57, 70, 75, 77, 82) | 604, identical |
| wave-4 kills total | 25 (2, 8, 3, 5, 1, 2, 4, 0) | 25, identical |

The scale wall stands: 0/8 national by rank, 0/8 table, 0/8 wins on both
legs. Standing ≥200 in 3/8 but no village converts it to rank.

## Sense-testing (read the say lines, judge meaning not counts)

**A launch is never voiced.** Across all 8 ON corpora (540 say lines),
not one line announces a departure — no "we're heading out", no farewell,
no "we go at dawn". The 146 landed trips are visible only afterwards, as
pantry lines ("The village threw out spoiled stores: 12 Expedition haul")
and eating lines ("You eat Expedition haul (500 kcal)"). Expeditions are
the village's biggest collective act and nobody ever says they are doing
one. The zero-attempt village (103004) never voices expedition intent
either — its 27 lines are healer announcements, cures, and returns:

> d2 "Priya is staying at Haven as the camp healer now — tending the sick
> instead of ranging out."
> d39 "🧭 Oliver is back from the north. "It's... different out there. I'll
> tell you about it." (Ask them what they saw.)"
> d17 "Field medicine on Aroha: clean the wound, poultice it, bind it
> right — the sickness has nowhere left to stand. Aroha is going to make
> it. (Priya cured them — and the camp saw it.)"

**Robotic repetition (flagged, not fixed):** the treeline line — "[Name]
came back from the treeline white-faced. Saw it too. Whatever it is, it's
still out there." — repeats **64 times band-wide**, word-identical, for
different people on different days; on 103004 it is 12 of the village's 27
lines (44%). A villager who saw something terrifying says the exact same
sentence as the last six people who saw it. The return-from-travel line
("It's... different out there. I'll tell you about it.") is also verbatim
across returnees. Both read as one canned line, not people reacting.

**People do act like people elsewhere:** the healer announcements name a
real choice (Priya staying to tend instead of ranging out — and on 103004
that choice is load-bearing, since the healer is also the expedition
blocker class), the cures are witnessed ("and the camp saw it"), and the
succession line lands ("🪞 You wake up somebody else. Fatima Hassan, 48 —
a paramedic. Her hands know different work now: The Touch, Green
Whisper.").

## Metric review (not a re-score)

- Bar 3 as written covers "≥2 zero-attempt seeds" and "0 zero-attempt
  seeds"; exactly 1 occurred. It was classified anyway under the same
  rule (dominant class + per-day counts), and the three zero-launch
  seeds got the same treatment. No threshold was re-scored; the bar's
  intent — the question is answered, not unknown — is met.
- OFF-leg "launches 0" is a recorder artifact (recorder off → no launch
  rows), not a game fact. The OFF leg's value is the D2 trajectory check:
  daily signatures, wall fields, deaths, and wave-4 kills are identical
  between legs, so the recorder is neutral and the ON classification
  describes master as-is.
- F-days (92) vs landed trips (146): F counts launching *villager-days*;
  trips count expedition parties, which carry companions (21
  companion-consumption rows). Both numbers are correct under their own
  unit; do not compare them directly.
- The prereg's metric-review note holds: if the zero-attempt seeds had
  been D-dominated, the fix space would be the agency-tick gates or the
  stale-commit rule. They are B/C-dominated instead, so the fix space is
  the dawn scorer (candidate offer / hash gate / core-pick mix) — and, for
  the three blocked seeds, the medic-duty hold.

## Blanks filled / documented

- **Documented (evidence, this file + analysis JSON):** the #2463
  classification; the win-plan-only ignition finding; the medic-duty
  holder-starvation receipts (Sean / Enzo / Erin); the silent-launch and
  treeline-repetition sense findings.
- **Fix space for the next build arm (not built here — DIAG only):**
  (1) the soft path never fires — a village with wanderers but no plan
  holders cannot launch at all; (2) medic-duty holds a single holder
  indefinitely with no relief valve (Erin: 14 blocks over 28 days);
  (3) launches are never voiced; (4) the treeline return line is one
  canned sentence for everyone.
- Findings-backlog note: #2463 is answered by this arm; the fix-space
  items above are new backlog candidates for the coordinator, not claimed
  here.

## Files

- Prereg: `evidence/2026-11-16/sim-expignite-b-prereg.md`
- Analysis: `evidence/2026-11-16/expignite-b-analysis.json`
- Corpora: `evidence/2026-11-16/perseed-expignite-b-off/` (8),
  `evidence/2026-11-16/perseed-expignite-b-on/` (8)
- Instrument: `scripts/expignite-driver-20261116.js`,
  `scripts/analyze-expignite-b.js`, `scripts/test-expignite-b.js`
- Anchor: 6eff33f3d (no src/js change). Proof 78/78 on the final tip.
