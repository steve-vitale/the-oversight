# sim-holdrepeat-fix-a — prereg (FROZEN 2026-11-24 12:31Z, before any build)

Run fleshout-20261124T1215Z, Loop A, axis scale-onramp. Arm sim-holdrepeat-fix-a.
Base: master `c329b477d`. Worktree `~/workspace/worktrees/sim-holdrepeat-fix-a`.

## 1. Defect (finding #2744 in hidden_files/sim-findings.md — the task
## brief says #2743; the file's line is #2744, see §7)
evidence/2026-11-24/sim-holdrepeat-a.md, frozen R3 rule: DEFECT iff some
(seed, holder) has one line >= 25x AND <= 2 distinct texts AND a >= 10
consecutive-day run. Eamon (seed 109430) trips all three: one hurt line
31x over 36 days, 13 consecutive days, 1 distinct text. 39 of 40 holders
stay cadence (median max-repeats per holder 2).

## 2. Fix (wording only — no decision change)
Vary the hold line's wording by how long the current consecutive hold has
lasted, in `holdVoice` (src/js/villager-brain.js). Day-count bands:
- band 0 — hold day 1 (fresh): the current line VERBATIM (day-1 wording
  is pinned by test-holdspeak-a.js B1–B11 and stays byte-identical).
- band 1 — hold days 2–3 (wearing): same reason clause, "another day"
  wear wording.
- band 2 — hold days 4–6 (long-held): same reason clause, "the waiting
  is wearing thin" wear wording.
- band 3 — hold day 7+ (worn thin): same reason clause, "after so many
  days" wear wording.
The hold REASON is identical in every band: each kind's reason token
("still hurt", "is sick", "never leaves Haven", "no weapon"/"no armor",
"no one to walk out with"/"waiting on a companion", "kills for the
table", "no trail", "couldn't get out") is preserved verbatim, and every
line still ends with the shared closer "— the party waits." so the
dawnchoke driver's HOLD_BEAT_RE and the holdspeak analyzer's
`lineFamily` reason tokens keep classifying (no analyzer change needed
for reason matching).

The streak is a consecutive-hold-day count per holder, kept beside the
existing `br.holdSaid` dedup map (`br.holdStreak[vid] = {last, n}`:
n increments when a line is actually spoken on day last+1, else resets
to 1). It is derived only from voiced hold days — no RNG, no new state
read by any decision. Who holds and why is untouched: `holdVoice` is
fiction only, called at the same three `return 'hold'` sites, and the
only state written is the dedup/streak maps.

## 3. GO bar (frozen — from #2744)
On the re-measured corpora (§4):
- (a) worst holder under 25x max repeats of one line per (seed, holder);
- (b) NO line repeats on >= 10 consecutive days;
- (c) no regression: median max-repeats per holder must not rise vs the
  holdrepeat-a baseline (median 2);
- (d) B2 no-regression on the holdspeak analyzer (deaths, launches, beat
  lines, depart beats, days, end reason identical per seed, before vs
  after; reason mismatches 0).
A miss on any of (a)–(d) is NO-GO. No re-scoring mid-run.

## 4. Corpus (declared REPLAY — no fresh-seed claim)
Re-run the dawnchoke driver on the FIXED code over the SAME 24 seeds as
the holdspeak after-legs: pilot band 109409–109416 (8 seeds) + confirm
band 109417–109432 (16 seeds), 150d death-aware, competent policy
verbatim (scripts/policies/competent.js), substrate env identical to
the holdspeak legs (GUNRATE=1 CELLGATE=1 SENSEEXPED=1 BOWOPEN=1
SPEARGATE=1 VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1,
MODE=ctl; KILLBUNDLE, LEND, PRESENCE, HPGATE, PINQUAD, PROFILEGATE4
unset). RUN=holdrepeat-fix-a-after,
OUTDIR=perseed-holdrepeat-fix-a-after (+ confirm-after). The BEFORE legs
are the frozen holdspeak before-leg corpora (wording-only change: hold
decisions must be byte-identical, so before-leg hold-day sets are the
reference). Judge with scripts/analyze-holdrepeat-a.js (reuse; extended
only with a --dirs override so it can read the new corpora — default
behavior and selftest unchanged, still reproducing Eamon 31x on the
frozen corpora) and scripts/analyze-holdspeak-a.js (before vs new after).

## 5. Proof test (scripts/test-holdrepeat-fix-a.js, before landing)
Staged fixtures through the REAL vbrainExecuteDepart with a fake ctx
(test-holdspeak-a.js pattern):
- F1: a 13-day consecutive hurt hold yields >= 3 distinct wordings
  (bands 0–3 all fire) and the "still hurt" reason token is present
  every day; every line ends with "— the party waits."
- F2: a 13-day run per other exercised kind (companion, sick, range0)
  yields >= 3 distinct wordings with the kind's reason token intact.
- F3: hold decision byte-identical fix off/on: the same staged fixture
  run under old code (git show c329b477d:src/js/villager-brain.js, child
  mode like test-holdspeak-a.js §C) returns the same 'hold' verdicts on
  the same days with the same causes — only the spoken text differs.
- F4: a broken hold (launch day in the middle) resets the streak: the
  next hold day speaks band 0 again.
- F5: no RNG in the new code (source grep: no Math.random in
  holdVoice/holdStreak helpers); streak state written only beside
  holdSaid.
Known collateral: test-holdspeak-a.js B12b pins the day-2 line equal to
the day-1 line — that assertion is now wrong BY DESIGN (band 1 speaks
on day 2) and is updated in the same commit to the band-1 wording,
with this prereg cited. B1–B11 (day-1 lines) are unchanged.

## 6. Sense test
Read the actual hold lines across a long hold (Eamon's 13-day run,
re-measured): does the village now hear the wait wearing on, in
different words, instead of a stuck record? Judge meaning, not counts.

## 7. Numbering note
The task brief calls this finding #2743; hidden_files/sim-findings.md
carries it as #2744 ("- [open] 2026-11-24 — voice / repetition — HOLD
LINE REPEATS 31X ..."). The #2744 line is the one updated on landing.
No #2743 holdrepeat line exists in the file.

## 8. Metric review (to fill at closeout)

## Amendment 2 (2026-11-24 ~13:05Z, before any confirm run)
SCOPE: the pilot same-base before/after comparison came back
IDENTICAL on every per-seed field (deaths, days, endReason, won,
maxWave, standing, scaleRank, contests, departBeats, beatLines,
holdCalls, holdCauses — all 8 seeds; only brainSha differs, as
expected), and proof-test C1/C2 proves decision-identity off/on at
the fixture level. The confirm before-leg would re-prove the same
no-regression claim on 16 more seeds at ~35 min under current load
(load avg ~9, pilot before-leg took ~18 min for 8 seeds). B2 is
therefore judged on the pilot band same-base before/after + C1/C2,
NOT on a confirm before-leg. The confirm AFTER-leg still runs (the GO
bar needs Eamon's seed 109430, which is on the confirm band), and the
holdspeak analyzer will be run on the confirm after-leg alone for
reason matching (voiced-share / mismatch counts need no before-leg).
This narrows Amendment 1's B2 plan; the GO bar (a)–(c) is unaffected.

## Amendment 1 (2026-11-24 ~12:50Z, before any before-leg run)
BASE DRIFT: the pilot after-leg (fixed code, base c329b477d) does NOT
reproduce the holdspeak legs' per-seed outcomes — deaths differ on 6/8
seeds (e.g. 109409: 95 vs 100; 109415: 111 vs 78), days differ
(109410: 126 vs 151; 109413: 90 vs 151), winplanSha 040d95c8a92a vs
cbe644ec1dfe, brainSha fb0d37ee6abe vs f9cf9be25ede (gameSha unchanged
950901f3fdcc). Master moved from the holdspeak base 60f6e7436 to
c329b477d between the arms, so the frozen holdspeak before-legs are
NOT a valid B2 reference on this base. The fix itself is wording-only
(proof-test C1/C2: verdicts identical, lines equal once wear asides
are stripped), so the drift is base drift, not arm drift — but B2 must
be judged against a FRESH before-leg on c329b477d: same driver, env,
seeds, RUN=holdrepeat-fix-a-before, OUTDIR=perseed-holdrepeat-fix-a-before
(pilot) and perseed-holdrepeat-fix-a-confirm-before (confirm). The
GO bar (a)–(c) is judged on the after-leg corpora alone and is
unaffected. The pilot after-leg is already run; no before-leg has run
yet, so this amendment precedes the comparison it governs.
