# sim-holdrepeat-fix-a — day-count-varied hold wording

**Run:** Loop A fleshout-20261124T1215Z, axis scale-onramp · **Arm:** sim-holdrepeat-fix-a ·
**Base:** `c329b477d` (master tip at worktree creation) · **Band:** 109409–109416 pilot (8 seeds) + 109417–109432 confirm (16 seeds), replay of the holdspeak after-leg corpora ·
**Branch:** `sim-holdrepeat-fix-a`, worktree `~/workspace/worktrees/sim-holdrepeat-fix-a` ·
**Prereg:** `evidence/2026-11-24/sim-holdrepeat-fix-a-prereg.md` (frozen 12:31Z before any build; Amendment 1 base drift, Amendment 2 confirm-B2 scope)

## 1. The defect — finding #2744

evidence/2026-11-24/sim-holdrepeat-a.md, frozen R3 rule: DEFECT iff some
(seed, holder) has one line >= 25x AND <= 2 distinct texts AND a >= 10
consecutive-day run. Eamon (seed 109430) trips all three: one hurt line
31x over 36 days, 13 consecutive days, 1 distinct text. 39 of 40
holders stay cadence (median max-repeats per holder 2). The task brief
calls this finding #2743; the file's line is #2744 — the #2744 line is
the one updated on landing (see §9).

## 2. The fix

`src/js/villager-brain.js` — `holdVoice` now varies the hold line's
wording by how long the CURRENT consecutive hold has lasted:

- **band 0 — hold day 1 (fresh):** the original line, verbatim.
- **band 1 — hold days 2–3:** same reason clause + "— another day gone".
- **band 2 — hold days 4–6:** same reason clause + "— the wait wearing thin".
- **band 3 — hold day 7+:** same reason clause + "— so many days now".

The wear is a short aside before the shared closer "— the party waits."
The hold REASON is identical in every band: each kind's reason token
("still hurt", "is sick", "never leaves Haven", "no weapon"/"no armor",
"no one to walk out with"/"waiting on a companion", "kills for the
table", "no trail", "couldn't get out") is preserved verbatim, and the
closer is unchanged — so the dawnchoke driver's HOLD_BEAT_RE and the
holdspeak analyzer's `lineFamily` reason tokens keep classifying with
no analyzer change for reason matching.

The streak is a consecutive-hold-day count per holder, kept beside the
existing `br.holdSaid` dedup map (`br.holdStreak[vid] = {last, n}`: n
increments when a line is actually spoken on day last+1, else resets
to 1). It is derived only from voiced hold days — no RNG, no new state
read by any decision. A broken hold (launch day, or a day with no hold)
resets the streak, so the next hold speaks fresh again. Who holds and
why is untouched: `holdVoice` is fiction only, called at the same three
`return 'hold'` sites.

Canon: no canon doc covers hold lines specifically; the wording follows
docs/CONVERSATIONS.md's "No repeats, ever" spirit for spoken lines and
the holdspeak evidence §6/§7 proposal (day-count-varied wording). The
fix invents no system — it varies narration only.

## 3. Proof test — `scripts/test-holdrepeat-fix-a.js`

**21/21 PASS** (first run). §A code pins (6: streak beside holdSaid,
consecutive-day advance/reset, four bands, three wear asides + shared
closer, no Math.random, reason cores are the holdspeak originals), §B
staged fixtures through the REAL `vbrainExecuteDepart` (B1 13-day hurt
hold: 13 lines, 4 distinct wordings, bands in order 1/2–3/4–6/7+, worst
same-line consecutive run 7; B2 13-day runs per other exercised kind —
companion / sick / range0 / kit — 4 distinct wordings with the reason
token intact every day; B3 launch day breaks the hold and the next hold
speaks band 0; B4 a skipped day resets the streak; B5 day-1 lines are
the holdspeak originals), §C old-code control (child mode,
`git show c329b477d:src/js/villager-brain.js`: same 'hold' verdicts on
the same days, new lines equal old lines once the wear asides are
stripped — wording only; old code repeats one line 3x per 3-day run).

**`scripts/test-holdspeak-a.js` 30/30 PASS** on the fixed code. Two
assertions changed BY DESIGN in the same commit (cited in the prereg):
A5 (the closer is now assembled once, not once per template — checks
the shared assembly + all three wear asides) and B12b (the day-2 line
is now band-1 wording), plus A8 (state writes are the dedup map + the
hold streak map). B1–B11 day-1 lines are unchanged.

**`scripts/analyze-holdrepeat-a.js --selftest` 9/9 PASS.** The analyzer
gained a `--dirs` override (sim-holdrepeat-fix-a) so it can judge the
re-measured corpora; default behavior and the selftest are unchanged
(still reproduces Eamon 31x / Elif 21x on the frozen corpora).

## 4. Before/after — pilot band 109409–109416 (same base)

Legs: 8 seeds × 2, 150d death-aware, competent policy verbatim, substrate
env identical to the holdspeak legs (GUNRATE=1 CELLGATE=1 SENSEEXPED=1
BOWOPEN=1 SPEARGATE=1 VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1
FIGHTALLY2=1, MODE=ctl). Before = base code
(`RUN=holdrepeat-fix-a-before`, brainSha f9cf9be25ede — the holdspeak
voice as landed on this base); after = fixed code
(`RUN=holdrepeat-fix-a-after`, brainSha fb0d37ee6abe); gameSha unchanged
950901f3fdcc; anchor c329b477dbba. Corpora under
`evidence/2026-11-22/perseed-holdrepeat-fix-a-before/after`.

**Base drift (prereg Amendment 1):** the after-leg does NOT reproduce
the holdspeak legs' per-seed outcomes (deaths differ on 6/8 seeds, e.g.
109409: 95 vs 100; 109415: 111 vs 78; winplanSha 040d95c8a92a vs
cbe644ec1dfe). Master moved from the holdspeak base 60f6e7436 to
c329b477d between the arms. The frozen holdspeak before-legs are
therefore NOT a valid B2 reference on this base — the fresh same-base
before-leg below is the reference, and the drift is base drift, not
arm drift (the fix is wording-only per §3 §C).

**Holdspeak analyzer** (`evidence/2026-11-24/holdrepeat-fix-a-pilot-analysis.json`,
exit 1 — see adjudication): **B1_voicedShare 1.0 (38/38 hold-days
voiced), reasonMismatches 0, badLines 0.** Per-seed deaths, launches,
beat lines, depart beats, days, and end reason IDENTICAL on all 8
seeds (e.g. 109409: 95 deaths both legs, 4 hold lines after; 109413:
84 deaths both legs, 17 hold lines after). `holdDaysIdentical` true on
every seed. The analyzer's verdict reads NO-GO only because its B2
bundles a silence-baseline check ("before leg has N holdLines") written
for the holdspeak arm, when the before leg was pre-voice code. On this
base the before leg legitimately HAS hold lines (the holdspeak voice
already landed) — that check is inapplicable here. **B2 adjudicated
PASS on the substantive fields** (identical outcomes + 0 mismatches),
the same adjudication shape the holdspeak arm used for its panel label.

**Balanced panel (§15):** `scripts/build-holdspeak-a-panels.js` gained
`--after-mode` (both legs ran MODE=ctl, so the after files end `-ctl`,
not `-arm`) + `--policy`/`--origin` flags (defaults unchanged);
`evidence/2026-11-24/holdrepeat-fix-a-panel.{json,md}` (+ before/after
`.json.gz`). Decision **`review_required`**, compare exit 2 —
adjudicated PASS under B2 exactly as in the holdspeak arm: every
observed contract metric is exactly 0 delta (village deaths 92 → 92,
national 0 → 0, won 0 → 0, survival30/60 1 → 1, community loss 0.75 →
0.75). Same label artifact (descriptive 0→0 table-win row), no signal.

**Holdrepeat analyzer, pilot after-leg**
(`evidence/2026-11-24/holdrepeat-fix-a-pilot-analysis.json`):
**verdict CADENCE** — 38 hold lines, 14 holders, worst single line 4x
(Nikolai hurt, 109413), median max-repeats 1, 0 holders ≥10x, 0
defects. The holdspeak pilot after-leg on the old base had worst 13x
(Hannah) — the same band now tops out at 4x.

## 5. Confirm — 16 fresh seeds (prereg-frozen replay)

Legs: seeds 109417–109432, same driver/env as the pilot, after-leg on
the fixed code (`RUN=holdrepeat-fix-a-confirm-after`,
brainSha fb0d37ee6abe, gameSha unchanged 950901f3fdcc, errors 0 on all
16 seeds). Corpus under
`evidence/2026-11-22/perseed-holdrepeat-fix-a-confirm-after/`. No
confirm before-leg was run (prereg Amendment 2: B2 is judged on the
pilot same-base before/after + proof-test C1/C2, not re-proven on 16
more seeds).

**Holdrepeat analyzer, BOTH after-legs combined**
(`evidence/2026-11-24/holdrepeat-fix-a-analysis.json`):
**verdict CADENCE** — 227 hold lines over 24 seeds, 43 holders, 0
defects. Worst single line 12x (Eamon band-3, 109430 — was 31x),
worst same-line consecutive run 7 days (Eamon band-3 — was 13),
median max-repeats per holder 2 (not risen vs the baseline 2), 0
holders ≥20x (was 3), 3 holders ≥10x (Nora 11x range0 over 36 days
with 1-day runs; Safae 11x companion over 58 days with 1-day runs —
both spread thin, not stuck). Eamon's own 31 lines on 109430 now
split across 4 distinct wordings: band 3 ×12, band 2 ×9, band 1 ×6,
band 0 ×4 (distinct texts 4, was 1).

**Holdspeak analyzer on the confirm after-leg** (before leg = the
frozen holdspeak confirm-before, old base — B2 not judged here, see
Amendment 2): **B1_voicedShare 1.0 (189/189 hold-days voiced),
reasonMismatches 0, badLines 0**, audit sample 35. The 21 B2_fails are
all cross-base outcome drift vs the old-base before-leg (deaths /
launches / beatLines / hold-day sets differ, e.g. 109420: deaths 122 →
119, 109421: 104 → 127) — the same base drift as §4, not arm drift.

**GO bar (frozen): (a) worst holder 12x < 25x — PASS. (b) no line on
>= 10 consecutive days (worst 7) — PASS. (c) median 2, not risen vs
baseline 2 — PASS. (d) B2 no-regression — PASS on the pilot band
(adjudicated, §4). Verdict: GO.**

## 6. Sense test — read aloud

Pilot after-leg lines, read from the analyzer audit sample
(`holdrepeat-fix-a-pilot-analysis.json`):

- Hannah (109412) d37–49, the holdspeak arm's worst pilot case: d37
  "Hannah is still hurt, and no one who can walk will take the plan —
  the party waits." → d44–45 "… — another day gone — the party waits."
  → d46–47 "… — the wait wearing thin — the party waits." → d49, after
  a break, fresh band 0 again. The wait now visibly wears on her in
  different words instead of repeating one sentence for thirteen days.
- Nikolai (109413) d46–64: the same arc across hurt and range0 (d51
  "Nikolai never leaves Haven…" band 0, d62–63 hurt band 1, d64 hurt
  band 2) — the reason stays true while the tail marks the passing days.
- Dylan (109411) d108/110/123: three separate single days, band 0 each
  time — a hold that comes and goes speaks fresh, as it should.
- Eamon (109430) d42–77, the defect holder, re-measured: d42 band 0;
  d44 band 0 again (a gap day reset the streak, exactly as designed);
  d45–46 "— another day gone"; d47–49 "— the wait wearing thin";
  d50–56+ "— so many days now" (7 days running, the longest same-line
  run on either band — inside the frozen <10 bar). The same 31 hold
  days, the same hurt reason every day, but the village now hears the
  wait lengthen: fresh, then another day gone, then wearing thin, then
  so many days now. It reads as a wait wearing on, not a stuck record.
  The band-3 line still repeats 7x in a row — the one place the fix
  stops short of full variety (see §7).

## 7. Village assessment, blanks, follow-ups

- **Wall numbers (pilot band, identical on both legs):** wins 0,
  national 0, wave 5 reached on 4/8 (109409/109410/109415/109416),
  median survival 134 days (gameDays 85/90/125/132/136/147/151/151),
  scaleRank regional on all 8, deaths 736 total.
- **Wall numbers (confirm band, after-leg):** wins 0, national 0,
  wave 5 reached on 8/16, median survival 122 days, deaths 1585
  total. The wall stands on both bands: no village reaches national
  or the table, with or without the wording fix — as expected for a
  narration-only change.
- **Blank families still unexercised in live sims:** kit (gear_hold 0),
  veteran (veteran_guard 0), no-trail (expired:no-trail 0), unknown (0)
  — same as the holdspeak bands. Their banded templates stand on staged
  fixtures alone (proof test B2 kit + holdspeak B1–B11 day-1 pins).
- **Band 3 still repeats within a long run:** a 13-day run speaks the
  band-3 line 7 days running (proof B1e). That is inside the frozen bar
  (< 10 consecutive days) and the measured worst is 4x total on the
  pilot band — but a future arm could split band 3 (e.g. an 11+ band)
  if a longer run ever shows up. Not a defect on the measured corpora.

## 8. Judgment vs frozen bars

- **(a) worst holder under 25x:** **PASS** — worst 12x on the combined
  24-seed corpora (Eamon band-3), down from 31x.
- **(b) no line repeats on >= 10 consecutive days:** **PASS** — worst
  same-line consecutive run is 7 days (Eamon band-3, 109430); pilot
  worst was 2 days.
- **(c) median max-repeats must not rise vs baseline median 2:**
  **PASS** — median 2, equal to baseline (not risen); pilot median 1.
- **(d) B2 no-regression:** **PASS** (adjudicated, §4).

**Verdict: GO.** The stuck record is fixed on measured evidence: the
defect holder's one line falls 31x → 12x with 4 distinct wordings and
no >= 10-day run, the median does not rise, and no sim outcome moves.

## 9. Closeout

- Game code: `src/js/villager-brain.js` only (holdVoice + comment).
- New files: `scripts/test-holdrepeat-fix-a.js` (21/21),
  `evidence/2026-11-24/sim-holdrepeat-fix-a-prereg.md`,
  `evidence/2026-11-24/sim-holdrepeat-fix-a.md` (this file),
  `evidence/2026-11-24/holdrepeat-fix-a-pilot-analysis.json`,
  `evidence/2026-11-24/holdrepeat-fix-a-panel.{json,md}` (+
  before/after `.json.gz`), corpora
  `evidence/2026-11-22/perseed-holdrepeat-fix-a-{before,after}/`
  (pilot) + `perseed-holdrepeat-fix-a-confirm-after/` (confirm).
- Modified: `scripts/test-holdspeak-a.js` (A5/B12b/A8, by design —
  §3), `scripts/analyze-holdrepeat-a.js` (`--dirs`),
  `scripts/build-holdspeak-a-panels.js` (`--after-mode`/`--policy`/`--origin`).
- Analyses: `holdrepeat-fix-a-pilot-analysis.json` (holdspeak
  analyzer, pilot before/after),
  `holdrepeat-fix-a-confirm-analysis.json` (holdspeak analyzer,
  confirm after-leg vs frozen holdspeak confirm-before — B2
  adjudicated N/A per Amendment 2).
- Finding #2744 updated in hidden_files/sim-findings.md with the fix
  (append "[FIXED 2026-11-24 (Loop A arm sim-holdrepeat-fix-a, verdict
  ..., evidence/2026-11-24/sim-holdrepeat-fix-a.md, branch
  sim-holdrepeat-fix-a @ <hash>)]").

## 10. Metric review

- **Analyzer reuse adjudication:** the holdspeak analyzer's B2
  silence-baseline check is inapplicable on a base where the voice
  already exists (Amendment 1's fresh before-leg). The substantive B2
  fields (identical outcomes + 0 mismatches) are the judgment, as
  recorded in §4. A future reusing arm should note the same in its
  prereg rather than re-adjudicating.
- **Panel decision label:** `review_required` with all-zero deltas is
  a label artifact, not a signal (holdspeak precedent, §4).
- **Base drift vs arm drift:** the pilot after-leg's divergence from
  the holdspeak legs is fully explained by the base move (winplanSha /
  brainSha changed, gameSha unchanged) and the same-base before/after
  legs are identical — the wording change moves nothing. No metric
  proved wrong; no re-score proposed.
