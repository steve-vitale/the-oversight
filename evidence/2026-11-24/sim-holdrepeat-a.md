# sim-holdrepeat-a — firmer measurement of holdspeak repetition (blank #4)

Run fleshout-20261124T1115Z, Loop A, axis scale-onramp. Coordinator-run
measurement. No game-code change, no new sims. Prereg:
`evidence/2026-11-24/sim-holdrepeat-a-prereg.md` (frozen 11:33Z, before
the census ran; freeze copy in goal hidden_files).

## 1. Question
The holdspeak arm voices each held departure once per holder-day with the
real hold reason. Eamon's hurt line repeats 31x over 79 days (109430),
Elif's 21x over 47 days (109419) — is that a stuck record a player would
notice, or a designed daily cadence? The holdspeak evidence names the
metric to beat: max repeats of one line per (seed, holder).

## 2. Corpus (deliberate REUSE)
All holdspeak AFTER-leg corpora (the hold voice exists only there),
24 seeds: `evidence/2026-11-22/perseed-holdspeak-a-after/` (pilot, 8) +
`evidence/2026-11-22/perseed-holdspeak-a-confirm-after/` (confirm, 16).
Declared a replay in the prereg. holdLines rows are {day, name, text}
(first name only; the holdspeak analyzer joins by (day, first-name)).

## 3. Instrument
`scripts/analyze-holdrepeat-a.js` (new, committed with this arm): groups
holdLines by (seed, name, text) — count, day span, max consecutive-day
run, distinct texts per holder. Bars: R1 100% attribution; R2 selftest
green + determinism + Eamon 31x / Elif 21x reproduce exactly; R3 frozen
decision rule — DEFECT iff some (seed, holder) has one line >= 25x AND
<= 2 distinct texts AND a >= 10 consecutive-day run.
Proof: selftest 9/9 (`node scripts/analyze-holdrepeat-a.js --selftest`).
Analysis: `evidence/2026-11-24/holdrepeat-a-analysis.json`.

## 4. Result — DEFECT, narrow: one holder is a stuck record
233 holdLines rows across 24 seeds (36 pilot + 197 confirm — matches the
holdspeak counts exactly), 0 unparsed, 40 (seed, holder) pairs.
Max repeats of one line per (seed, holder): median 2, max 31.
Distribution: >= 10x: 7 holders; >= 20x: 3; >= 25x: 1; >= 30x: 1.

| Holder (seed) | Line | Count | Span | Max consecutive days | Distinct texts |
|---|---|---|---|---|---|
| Eamon (109430) | "Eamon is still hurt, and no one who can walk will take the plan — the party waits." | 31 | 36d | 13 | 1 |
| Elif (109419) | "Elif is still hurt, and no one who can walk will take the plan — the party waits." | 21 | 33d | 8 | 1 |
| Linh (109419) | "Linh is still hurt, ..." | 21 | 31d | 8 | 1 |
| Safae (109424) | "Safae has no one to walk out with — the party waits." | 18 | 58d | 4 | 1 |
| Ananya (109419) | "Ananya is still hurt, ..." | 15 | 16d | 9 | 1 |

R3 verdict: **DEFECT** — Eamon trips all three conditions (31x, 1 text,
13 consecutive days). One holder, one line, thirteen days in a row, 31
times in 36 days: that is a stuck record, not a cadence. The other
holders stay cadence (Elif/Linh 21x but 8 consecutive days and under the
25x line; Safae 18x spread over 58 days with 4-day runs).

The defect is NARROW: 1 of 40 holders. The fix is a wording-variation
pass, not a redesign — vary the hold line's wording by how long the hold
has lasted (the day-count-varied wording the holdspeak evidence §6
already proposed), keeping the reason identical. Filed as finding #2743
(next arm: build the variation, pilot on the same 24-seed corpora,
bar = max-repeats-per-(seed,holder) falls and no line repeats on >= 10
consecutive days).

## 5. Sense-test
Eamon's line is honest — he IS still hurt, and the party IS waiting —
but a player reading the same sentence for the thirteenth day running
stops hearing a person waiting and starts hearing a loop. Elif and Linh
at 21x over a month read the same way in miniature; Safae's 18x over 58
days, broken into 4-day runs, reads as a long wait rather than a stuck
one. The difference is the consecutive run, which is why R3 weights it.

## 6. Metric review
- The first-name join could merge two holders sharing a name; the
  holdspeak analyzer found 0 ambiguous groups in the pilot, and Eamon's
  13-consecutive-day run makes a two-holder merge implausible here —
  but a future arm should join on vid where the recorder carries it.
- Max-repeats alone understates the defect: Safae's 18x over 58 days is
  less stuck than Ananya's 15x over 16 days. The consecutive-run length
  is the better player-facing metric; R3's three-part rule caught that.
- No metric proved wrong. The "metric to beat" (max repeats per
  (seed, holder)) is now 31 (Eamon); the fix arm's bar is to bring the
  worst holder under 25x with no >= 10-day run.

## 7. Closeout
- Game code: UNTOUCHED (measurement only, zero src/js).
- New files: `scripts/analyze-holdrepeat-a.js` (+ selftest),
  `evidence/2026-11-24/sim-holdrepeat-a-prereg.md`,
  `evidence/2026-11-24/holdrepeat-a-analysis.json`, this evidence file.
- Finding #2743 filed (open, BUILD next: day-count-varied hold wording).
