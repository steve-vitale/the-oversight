# sim-seasoning-b — PREREG (DIAG: the seasoning gate)

Run: fleshout-loop-b-20261116T1130Z (Loop B), arm sim-seasoning-b
Axis: winnability chain. Tracker blank 6 (0430Z blank #3; 0446Z review's
blank #6): the seasoning gate — how often does 2-of-3-seasoned block
covenant staging / national reach?
Branch: sim-seasoning-b — worktree ~/workspace/worktrees/sim-seasoning-b
Base: master at worktree creation (tip df768b9b3 — the 0915Z coordinator
evidence commit: seedpaths DIAG-GO + awayhaven DIAG-GO, both landed)
Date: 2026-11-16 (run starts 2026-11-16T11:30Z)
Type: DIAG — instrument + measured gate distribution. No game change,
no default flipped, no lever. No balanced panel (DIAG, no game change
— the panel measures a lever's effect; the neutrality proof D1/D2/D3
is the panel's substitute here, as in seedpaths / poolmarginals).

## Canon note (read first)

docs/CANON.md was read, then the re-confirm evidence
(sim-courtship-reconfirm-b.md) and its prereg in full. **No canon doc
covers diplomacy / covenant / link seasoning** — the CANON.md manifest
lists no diplomacy doc (the nearest are docs/MAP.md for the road and
the SCALE.md cited by hierarchy.js comments). The seasoning rule is
defined in code only, quoted verbatim below; nothing is invented here.
If a diplomacy canon doc is ever written, it should record this rule
from hierarchy.js, not from this prereg.

## The seasoning rule, from code (frozen anchors)

- Seasoned (src/js/hierarchy.js `_linkSeasoned`): a link counts toward
  a polity only when the relationship is real — **age 30+ days** (ONE
  SEASON: 1 season = 30 days, Steve 2026-10-11) **AND trust 40+**
  (peer links form at trust 30; tending required). Conquered links
  need the season, not the trust. Mercy-grace and the SUCCPOLITY /
  SUCCGRACE gates are env-gated, default OFF here.
- Covenant polity (hierarchy.js `_covenantPolity`): **>=3 seasoned
  covenant peer links**; four fires under no head is a polity.
- Staging (hierarchy.js `_checkNational`, daily): no nationalLive /
  globalLive, no pendingNational, not scaleRefused, not exiled, then
  the rung (**networkLive AND day − networkLiveDay >= 30** — one rung
  per season), then the FIRST qualifying candidate in priority order
  [polityOf(HOME) lead/conquest, _belongPolity, _covenantPolity,
  _tradePolity] stages; a walked/refused shape is deferred.
- NOTE (observation, not a claim): the `_covenantPolity` comment says
  "28+ days old with trust 40+" but `_linkSeasoned` enforces 30+
  (`(day - link.day) < 30` returns false). Comment/code mismatch,
  recorded here; the CODE is what the measurement uses.

## What is being measured

The re-confirm (band 100621–100636, 200d) found its two armed
non-stages (100630, 100636) both 2-of-3 seasoned at run end: the walk
works, the deeds work, the links form — the third link does not season
before the run ends. The control leg's 10 non-stages were 8×
seasoned-short. This arm counts, per seed on a fresh shared band,
on BOTH legs of the courtship road (covenant control + courtship
armed): staging opportunities, staged vs seasoning-blocked, WHICH of
the links the blocker was (named village + age-short vs trust-short),
the seasoning-blocked share of non-stages, and days lost to seasoning.

## Seed-band freshness (verified BEFORE any judged sim, 2026-11-16)

Per ~/workspace/custom-skills/local_seed_band_freshness/SKILL.md —
exact-seed grep over all dated preregs (evidence/*/sim-*-prereg.md),
the convergence tracker, scripts/, and evidence filenames, on the
current tree (base df768b9b3):

- SHARED BAND 102201–102208 (8 seeds): **0 hits anywhere** — no
  prereg, no tracker line, no script, no evidence filename names any
  of these seeds. FRESH. This prereg spends it (16 configs: 8 seeds
  × 2 policies). The coordinator verified the same band fresh for the
  other arms this run; each arm spends it on its own leg, no corpus
  is shared or overwritten.
- SPENT BANDS (never reuse): 100621–100636 (courtship re-confirm),
  100601–100608, 100641–100648, 100761–100768, 102001–102008,
  102011–102018, 102131–102138.

## Primary metric + GO bars (binding, §14)

COMBINATION RULE: **GO requires G1 AND G2 AND G3; any FAIL = NO-GO,
never re-scored mid-run.** A miss is written under "metric review"
with a revision proposed for the NEXT run. There is NO cost bar —
this is a DIAG with no lever and no game change; the wall numbers
are reported for the record, not judged.

- G1 INSTRUMENT VALIDITY — GO iff 16/16 per-seed JSONs are complete
  (full series with shapeCands + linksRoll + road roll on every day;
  0 instrument errors), EVERY staging decision is classified
  (staged / seasoning-blocked / other-blocked), and unknown is 0
  (no unclassified days, no unknown verdicts).
- G2 THE MEASUREMENT — GO iff per-seed verdicts + blocked-day
  counts + blocker-link identities + days-lost are computed for all
  16 configs, and the seasoning-blocked share of non-stages is
  reported per leg and band-wide. The question is answered with a
  number, not an "unknown". (A band where everything stages still
  passes G2 — the share is then 0/0 with the blocked-day and
  days-lost counts carrying the answer — but the per-leg shares must
  still be stated explicitly, never left blank.)
- G3 LEVER-ONLY — GO iff zero `src/js` changes in the branch diff
  and the proof tests are green at the recorded baselines:
  test-seasoning-b.js **59/59** (this arm; fixtures + D1 + D2, run
  before the sweep — its D1 live runs are in-memory determinism
  checks on seed 102201, no corpus file written), and the six
  substrate tests re-verified on THIS tip before the sweep:
  test-courtship-rework2-b.js 59/59, test-courtship-rework-b.js 58/58,
  test-courtship-b.js 57/57, test-covenant-b.js 40/40,
  test-onlylead-b.js 29/29, test-onlylead2-b.js 26/26. A CHANGE from
  any recorded number is a failure — no test is edited to go green.
  Any src/js change = NO-GO.

## Definitions (frozen)

Per-day classification for the covenant shape, from the record's own
daily roll (series + verbEvents) — see scripts/analyze-seasoning-b.js:

- staged day: pendingNational.shape === 'covenant' in the snapshot,
  OR an answerNationalChoice event with shape covenant that day.
- seasoning-blocked day: not staged AND rung met AND no
  pendingNational AND !nationalLive AND !scaleRefused AND !exiled
  AND no higher-priority candidate (lead/conquest/belong all null)
  AND the covenant candidate null AND >=3 covenant links formed AND
  <3 seasoned. The ONLY failing gate is seasoning.
- other-blocked day: not staged and some other gate failing (rung not
  met; a higher-priority candidate present; <3 formed; a beat of
  another shape pending; national already live; scale refused;
  exiled).
- unclassified day: the covenant candidate present, rung met, nothing
  pending/live/refused/exiled, no higher shape — yet no beat staged;
  or 3+ seasoned with the candidate null (count mismatch). Counts
  toward unknown.

Per seed: firstOpportunityDay (first day all non-seasoning gates
pass); seasoningBlockedDays; stagedDay; daysLost = window days
([firstOpp, stagedDay) when staged; [firstOpp, endDay] inclusive
when never staged — i.e. seasoningBlockedDays +
otherBlockedWindowDays; censored when never staged); blocker links =
the unseasoned covenant link(s) on blocked days, each decomposed
into age-short (age < 30) vs trust-short (trust < 40), with days
until age-met and trust points owed; decisive blocker = the link
seasoning last (its `se` flip on the staging day for staged seeds;
the still-unseasoned link(s) at end for non-stages); verdict =
staged | seasoning-blocked | other-blocked | unknown. The onlylead
classifyShape covenant blocker is carried as a CROSS-CHECK
(maxima-based summary); the per-day read is authoritative where they
differ — it cannot distinguish rung-blocked from seasoned-short (a
seed with 3 seasoned links and no rung reads 'seasoned-short:3-of-3'
there), and any disagreement is reported, not hidden.

Seasoning-blocked share of non-stages (per leg and band-wide) =
seasoning-blocked verdicts / non-staged seeds. ALSO reported: the
seasoningBound share (non-staged seeds with ANY seasoning-blocked
day, even when the final day's binding gate was another one) — the
two readings bound the same question from both sides.

## Method (staged, §§9–12, 14–15)

- DIAG (16 configs: 8 seeds × 2 policies, 150d death-aware,
  identical seeds). Horizon 150d because it is the shared band
  horizon for this run: links form from day 10, seasoning needs 30d,
  the rung needs 30d of regional, earliest staging ~day 40–70, so
  150d gives an 80–110d window. CENSORING NOTE: seeds that would
  stage at 151–200d read as non-staged here; days-lost is
  right-censored at 150d/death, and the 150d non-stage count is an
  UPPER BOUND on the 200d count (the re-confirm's two non-stages ran
  to 200d). The evidence states the 150d read as a 150d read.
  Seeds (exact literals): 102201, 102202, 102203, 102204, 102205,
  102206, 102207, 102208. Policies: competent-covenant-b (control —
  the road walked, no deeds) vs competent-courtship-b (armed — road +
  courtship deeds), identical seeds.
- DRIVER: scripts/onlylead-driver-20261115.js (extended — see
  instrument changes below; same recorder, same shape-candidate roll).
  Per-seed JSON to evidence/2026-11-16/perseed-seasoning-b-control/
  (covenant) and evidence/2026-11-16/perseed-seasoning-b-on/
  (courtship). Zero src/js. RUN=seasoning-b. The driver refuses to
  overwrite an existing per-seed file (exit 3), so an interrupted
  sweep resumes from verified checkpoints: validate each completed
  file as complete JSON with 0 instrument errors, never re-run a
  completed config, never overwrite a valid per-seed file.
- ANALYZER: scripts/analyze-seasoning-b.js (new; requires
  scripts/analyze-onlylead-b.js for classifyShape, does not copy it).
  Writes evidence/2026-11-16/seasoning-b-analysis.json.
- ENV: defaults, matching the courtship re-confirm legs —
  COUNTER_ANSWER unset, COMPETENT_FLEE_REPAIR unset, ANSWERMAIL_DRIVE
  unset. No other env. Copied exactly from
  sim-courtship-reconfirm-b-prereg.md.
- ENCOUNTER-GEAR RULE (Steve 2026-11-13): no staged fixtures — the
  driver observes the policies' own play; nothing is staged.

## Instrument changes (frozen BEFORE the sweep)

1. DRIVER — scripts/onlylead-driver-20261115.js: `dirFor` maps
   RUN=seasoning-b to perseed-seasoning-b-control / -on under
   evidence/2026-11-16 (covenant → control, courtship → on). No other
   driver change. The re-confirm mapping is NOT overwritten.
2. ANALYZER — scripts/analyze-seasoning-b.js (new; per-day
   classification + per-seed verdicts + wall numbers + D3
   engine-agreement, as defined above).
3. PROOF — scripts/test-seasoning-b.js (new; 59 checks: static
   anchors + classifier fixtures + analyzer fixtures + D1 live +
   D2 purity + --corpus completeness/D3). Recorded baseline 59/59.

## Wall numbers (every run)

National BOTH ways (findings #2422: end standing >= 200 AND the
final scaleRank field — they diverge), table / wins, wave 4–5
unlocks, median survival — reported per leg in the evidence file.

## Sense-testing (SENSE-TESTING LAW)

Where seasoning bites, read what villagers say — do they voice the
unseasoned bond, or is it a silent wall? Quote the staged Founding
Council lines for staged seeds, and for blocked seeds the
trust-drift / cooling lines (hierarchy.js trust_drift_is_voiced: a
seasoned-age link crossing below trust 40 says the bond is cooling),
the tend lines, and the link notes. Judge whether the wait reads as
a relationship maturing or as an invisible timer. Note the 900-line
cap (LINK_LINES_CAP=900) binds on 150d legs — council lines may be
cut on late-staging seeds; the BEATS are still fully classified
(verbEvents are uncapped).

## Evidence

- Prereg: this file.
- Instrument substrate (on master, unchanged):
  scripts/policies/competent-covenant-b.js (the covenant road) and
  scripts/policies/competent-courtship-b.js (road + deeds).
- Driver: scripts/onlylead-driver-20261115.js (extended: dirFor for
  RUN=seasoning-b).
- Analyzer: scripts/analyze-seasoning-b.js (new).
- Proof: scripts/test-seasoning-b.js (new; 59/59 on this tip).
- Per-seed JSON: evidence/2026-11-16/perseed-seasoning-b-control/
  (8 files) and evidence/2026-11-16/perseed-seasoning-b-on/
  (8 files).
- Analysis: evidence/2026-11-16/seasoning-b-analysis.json.
- Evidence: evidence/2026-11-16/sim-seasoning-b.md (per-seed
  verdict table with blocker-link identities + age/trust split,
  days-lost table, seasoning-blocked share per leg, wall table with
  national both ways, sense-testing, metric review).
- No balanced panel (DIAG — see header).

## Convergence state

Seasoning-gate DIAG on the 150d shared band. The verdict is GO /
NO-GO against G1/G2/G3 above. If GO, the measurement stands as the
answer to tracker blank 6 (0430Z blank #3): how often 2-of-3-seasoned
blocks covenant staging, which link blocks, and how many days it
costs. If NO-GO, evidence-only record; no game change. Killed arms
leave no trace. Zero src/js in either case.
