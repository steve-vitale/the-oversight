# sim-seasoning-g1-b — PREREG (RE-JUDGMENT: seasoning gate G1 under the phase-corrected classifier)

Run: fleshout-loop-b-20261116T2030Z (Loop B), arm sim-seasoning-g1-b
Axis: winnability chain. Tracker blank #5 (seasoning gate G1 ruling), held
by Loop B.
Branch: sim-seasoning-g1-b — worktree ~/workspace/worktrees/sim-seasoning-g1-b
Base: master at worktree creation (tip 7bb50f3dc — the 1730Z coordinator
evidence commit)
Date: 2026-11-16 (run starts 2026-11-16T20:30Z)
Type: RE-JUDGMENT — no new sims, no game change, no default flipped, no
lever. The existing committed corpora are re-read under the corrected
instrument. No balanced panel (DIAG re-judgment, no game change — as in
sim-seasoning-b, the neutrality proof D1/D2/D3 is the panel's substitute).

## Canon note (read first)

docs/CANON.md was read in full. **No canon doc covers the seasoning gate
itself** — the CANON.md manifest lists no diplomacy / covenant / link
seasoning doc (the nearest are docs/MAP.md for the road and the SCALE.md
cited by hierarchy.js comments). The seasoning rule is defined in code
only, quoted in the frozen prereg (sim-seasoning-b-prereg.md); nothing is
invented here. This re-judgment changes no canon claim.

## What is being re-judged

The frozen arm (sim-seasoning-b) ruled G1 GO on day-level evidence while
its own frozen analyzer computed band unknown=4 and 9 unclassified days,
failing the frozen proof's --corpus "unknown 0" check (65/66). Its §Metric
review proposed a phase-corrected classifier (items 1–3, plus item 5) and
explicitly deferred the G1 ruling under the corrected instrument to the
NEXT run: "the next run should re-judge G1 under the corrected instrument
rather than taking this ruling as precedent for the numbers." This run is
that next run. The question: does G1 pass under the corrected instrument,
and do the frozen numbers survive the correction?

## Seed-band freshness (verified BEFORE any judged analysis, 2026-11-16)

Per ~/workspace/custom-skills/local_seed_band_freshness/SKILL.md — exact
seed grep over all dated preregs (evidence/*/sim-*-prereg.md), the
convergence tracker, scripts/, and evidence filenames, on the current
tree:

- CORPUS BAND 102201–102208 (8 seeds): **REUSED, NOT FRESH** — it is the
  corpus under re-judgment (spent by sim-seasoning-b, evidence/2026-11-16/
  sim-seasoning-b-prereg.md). This run re-reads the committed corpora
  (perseed-seasoning-b-control/ and perseed-seasoning-b-on/, 16 files) and
  runs NO new sims, so no fresh band is spent. Saying so explicitly: the
  re-judgment inherits the corpus band's freshness status; it does not
  claim a fresh band.
- FRESH CONFIRM BAND (reserved, NOT spent by this run): 102701–102708 —
  **0 hits anywhere** (no prereg, no tracker line, no script, no evidence
  filename names any of these seeds). If a fresh confirm is ever needed,
  this band is the one to spend.
- SPENT BANDS (never reuse): 102201–102208 (seasoning corpus),
  100621–100636 (courtship re-confirm), 100601–100608, 100641–100648,
  100761–100768, 102001–102008, 102011–102018, 102131–102138.

## The corrected classifier (metric-review items 1–3, plus item 5)

Mechanism (pinned in sim-seasoning-b.md, §G1 investigation): the driver
snapshots AFTER each policy daily() call, while _checkNational runs
inside sleep()'s endDay, before the day increments. The day-D snapshot
therefore shows the state BEFORE the end-of-day boundary check, while the
staging is recorded the same day in the Codex channel ("National beat
staged: covenant" linkLine, dated the qualification day on 8/8 staged
seeds) and answered the next day (answerNationalChoice verbEvent). The
frozen classifier expects the staging to be visible in the same day's
snapshot and calls the qualification day 'unclassified'.

CORRECTED RULES (these bind this run; the frozen definitions stay frozen
in analyze-seasoning-b.js's existing exports and are reported alongside):

1. **Staged-precursor (item 1).** A should-stage day — the covenant
   candidate present, rung met, nothing pending/live/refused/exiled, no
   higher shape (frozen gate 'qualified-unstaged'), or 3+ seasoned with
   the candidate null (frozen gate 'seas-count-mismatch') — is a
   **staged-precursor** when staging follows within one boundary: an
   answerNationalChoice event with shape covenant on day d or d+1, a
   pendingNational covenant snapshot on day d or d+1, nationalLive true
   on the d+1 snapshot, or a "National beat staged: covenant" linkLine
   dated day d. The linkLine is supporting evidence only (capped
   channel — see item 4); the verbEvents answer is the authoritative
   channel (uncapped). A precursor day is a classified staging
   decision, not an unknown.
2. **Unknown (item 1, second half).** A should-stage day counts as
   **unknown** only when the qualified candidate survives a boundary
   unstaged: two consecutive should-stage snapshots with no staging
   between them. Operationally: in a run of consecutive should-stage
   days with no staging following, the first day is recorded as
   qualified-first (not counted) and each subsequent day is an unknown
   day. A should-stage day whose qualification lapses the next day
   (candidate gone — link unseasoned, shadow, refusal) is neither a
   precursor nor unknown.
3. **daysLost (item 2).** daysLost is measured to the **qualification
   day** (first precursor day), not the answer day: staged seeds,
   qualificationDay − firstOpportunityDay; never-staged, endDay −
   firstOpportunityDay + 1 (unchanged, censored). The frozen figure
   (stagedDay − firstOpportunityDay) is reported alongside every
   corrected figure. firstOpportunityDay is the first day all
   non-seasoning gates pass, where a precursor day counts as an
   opportunity day (the gates passed that morning).
4. **Decisive blocker (item 3).** The flip window compares the
   **qualification day against the day before it** (se flip on the
   qualification day), not the answer day against the day before it.
   When seasoning was already met before staging (rung-gated seeds),
   decisive is null by design.
5. **Raw standing (item 5).** The wall carries the **raw-standing**
   read (standingRaw ≥ 200) alongside the gated read (standing ≥ 200)
   and the final scaleRank — all three, never one alone.
6. **Item 4 (LINK_LINES_CAP).** The 900-line cap is **left as-is** —
   no cap is raised on the shared harness. Staging/council lines are
   read from linkLines where present, and the staging answers from the
   uncapped verbEvents channel, which is authoritative. The cap's bite
   (102207 d142 re-stage council line cut) is recorded, not repaired.

## Primary metric + GO bars (binding, §14)

COMBINATION RULE: **GO requires G1 AND G2 AND G3; any FAIL = NO-GO,
never re-scored mid-run.** If the re-judgment changes the verdict, say
so plainly — do not re-score to preserve GO. A miss is written under
"metric review" with a revision proposed for the NEXT run. There is NO
cost bar — this is a DIAG re-judgment with no lever and no game change;
the wall numbers are reported for the record, not judged.

- G1 INSTRUMENT VALIDITY (corrected) — GO iff, under the corrected
  classifier on the existing 16-file corpus: unknown is 0 band-wide
  (0 corrected unclassified days, 0 unknown verdicts), EVERY staging
  decision is classified (staged / seasoning-blocked / other-blocked /
  staged-precursor), and the corrected proof's --corpus "unknown 0"
  check passes (the check the frozen proof failed, 65/66). The frozen
  analyzer's numbers (unknown=4, unclassifiedDays=9) are reported
  alongside and must be reproduced exactly by the untouched frozen
  exports (frozen output byte-identical to
  evidence/2026-11-16/seasoning-b-analysis.json).
- G2 THE MEASUREMENT (corrected) — GO iff corrected per-seed verdicts
  + corrected daysLost (with frozen alongside) + corrected decisive
  blockers are computed for all 16 configs, the seasoning-blocked
  share of non-stages is reported per leg and band-wide under the
  corrected verdicts, and the wall carries all three national reads
  (gated standing, raw standing, scaleRank). Predictions from the
  frozen evidence's hand analysis (to be confirmed or refuted, not
  assumed): corrected daysLost on the courtship leg [0, 11, 1, 0, 0, 0,
  17, 30] (median 0.5d, frozen [0, 12, 2, 0, 0, 0, 18, 31] median 1d);
  corrected firstOpportunityDay 102201 d61 (frozen d62), all other
  seeds unchanged; decisive non-null exactly on the four seeds where a
  link seasons on the qualification day (102202 village_spl_26_60773
  age 29→30; 102203 village_1 trust 38→46; 102207
  village_spl_38_6557 age 29→30; 102208 village_spl_31_32776 age
  29→30) and null-by-design on the four rung-gated seeds (102201,
  102204, 102205, 102206); seasoning-blocked share unchanged at 1/8
  (12.5%) band-wide. A prediction miss is reported and investigated,
  not silently adjusted — but G2 fails only if the corrected numbers
  cannot be computed or are not reported.
- G3 LEVER-ONLY — GO iff zero `src/js` changes in the branch diff and
  the proofs are green at their recorded baselines: the NEW proof
  scripts/test-seasoning-g1-b.js green with **0 failures** (check count
  fixed at write time and recorded in the evidence file), the FROZEN
  proof scripts/test-seasoning-b.js stays **59/59** (non-corpus mode —
  its --corpus "unknown 0" check still fails under the frozen
  instrument by design; that failure is the artifact this run
  supersedes, and is recorded, not hidden), and the frozen analyzer's
  default output re-run from the corpora is BYTE-IDENTICAL to
  evidence/2026-11-16/seasoning-b-analysis.json. Any src/js change =
  NO-GO. No test is edited to go green: the frozen test file is
  untouched; the corrected classifier is additive (new exports + a
  --corrected CLI mode) and the frozen exports keep frozen semantics.

## Definitions (corrected; frozen in parentheses)

Per-day corrected classification, from the record's own daily roll
(series + verbEvents + linkLines) — see
scripts/analyze-seasoning-b.js (corrected exports):

- staged-precursor day: a should-stage day (frozen 'unclassified')
  with staging following within one boundary (see rule 1 above).
- staged day: as frozen (pendingNational covenant snapshot, or a
  covenant answer event that day). The first staging's qualification
  day is the first precursor day; the answer day is the frozen
  stagedDay.
- seasoning-blocked / other-blocked day: as frozen.
- unknown day: a should-stage day surviving a boundary unstaged (see
  rule 2 above).
- qualificationDay (per staged seed): the first precursor day.
  answerDay: the frozen stagedDay (first answer/pending day).
- daysLost (corrected): qualificationDay − firstOpportunityDay when
  staged; endDay − firstOpportunityDay + 1 when never staged
  (censored). Frozen daysLost reported alongside.
- decisive (corrected): the link whose `se` flips 0 → 1 on the
  qualification day vs the day before; null by design when seasoning
  was met before staging.
- re-stage precursors: precursor days after the first staging (e.g.
  102207 d142, answer d143 — its council line cut by the cap, its
  answer event uncapped), listed separately; they do not change the
  first-staging numbers.
- verdict (corrected): staged | seasoning-blocked | other-blocked |
  unknown, as frozen, but with precursor days classified (never
  unknown) and unknown only per rule 2.

## Method (staged, §§9–12, 14–15)

- RE-JUDGMENT (16 configs: 8 seeds × 2 policies, 150d, identical
  seeds — the committed corpora, NOT re-run). Horizon 150d is the
  corpus horizon; the re-judgment states the 150d read as a 150d
  read, as the frozen arm did. Seeds (exact literals): 102201,
  102202, 102203, 102204, 102205, 102206, 102207, 102208. Policies:
  competent-covenant-b (control) vs competent-courtship-b (armed).
- ANALYZER: scripts/analyze-seasoning-b.js, extended additively —
  new exports (classifySeasoningDayCorrected / analyzeSeasoningCorrected
  / analyzeCorrected) plus a --corrected CLI mode writing
  evidence/2026-11-16/seasoning-g1-b-analysis.json. The frozen
  exports and default CLI output are untouched.
- PROOF: scripts/test-seasoning-g1-b.js (new; synthetic fixtures for
  qualification-day precursor, two-snapshot unknown, daysLost phase,
  decisive flip window, raw-standing wall read + a determinism leg:
  corrected analysis re-run byte-identical on the existing corpora).
  The D1 live determinism leg of the frozen test is NOT re-run (no
  new sims in this arm); determinism here is the byte-identical
  re-run of the corrected analysis on the committed corpora.
- ENV: none (no sims run). No src/js change expected; if a game-code
  fix is found necessary, document it as a finding and stop at the
  instrument.
- ENCOUNTER-GEAR RULE (Steve 2026-11-13): no staged fixtures — the
  analyzer re-reads the policies' own play; synthetic proof fixtures
  stage the average gear + party a player actually has at the content
  where they touch gear at all (the classifier fixtures carry no gear
  claim; they prove day-classification logic only).

## Wall numbers (every run)

National THREE ways (gated standing ≥ 200, raw standing ≥ 200,
final scaleRank) + nationalEver, table / wins, wave 4–5 unlocks,
median survival — reported per leg in the evidence file.

## Sense-testing (SENSE-TESTING LAW)

Quote the staging lines that decide the qualification days: the
"National beat staged: covenant" Codex line and the founding-council
line dated the qualification day on each staged seed, from linkLines
where present; where the cap cut them (102207 d142 re-stage), say so
and quote the uncapped answer event instead. Judge whether the wait
reads as a relationship maturing or as an invisible timer.

## Evidence

- Prereg: this file.
- Instrument: scripts/analyze-seasoning-b.js (additive corrected
  exports + --corrected mode; frozen exports untouched).
- Proof: scripts/test-seasoning-g1-b.js (new; 0 failures required).
- Corpora (unchanged, committed): evidence/2026-11-16/
  perseed-seasoning-b-control/ (8 files) and perseed-seasoning-b-on/
  (8 files).
- Frozen analysis (unchanged): evidence/2026-11-16/
  seasoning-b-analysis.json (re-run must be byte-identical).
- Corrected analysis: evidence/2026-11-16/seasoning-g1-b-analysis.json.
- Evidence: evidence/2026-11-16/sim-seasoning-g1-b.md (verdict,
  corrected numbers vs frozen numbers, metric review, wall numbers
  three ways, sense-testing quotes, G1 ruling in one plain sentence).

## Convergence state

Seasoning-gate G1 re-judgment on the 150d shared band. The verdict is
GO / NO-GO against G1/G2/G3 above. If GO under the corrected
instrument, the G1 ruling stands on numbers, not on day-level
argument alone, and tracker blank #5 closes. If NO-GO, evidence-only
record; no game change. Killed arms leave no trace. Zero src/js in
either case.
