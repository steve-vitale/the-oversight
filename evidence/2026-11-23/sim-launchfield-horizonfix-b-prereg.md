# sim-launchfield-horizonfix-b — DIAG PREREG, re-judgment of the horizon-exclusion clause on the frozen confirm band (frozen before any judged run)

**Arm:** sim-launchfield-horizonfix-b, DIAG instrument · **Loop B run:**
fleshout-loop-b-20261123T0230Z · **Axis:** winnability chain
**Type:** DIAG, instrument-only (analyzer + proof-test amendment, NO
driver change, NO game-code change, NO new sims, NO legs re-run).
**Branch:** `sim-launchfield-horizonfix-b` · **Worktree:**
`~/workspace/worktrees/sim-launchfield-horizonfix-b`
**Worktree base:** master `80e7da0bc` (worktree HEAD; `git merge-base
HEAD master` identical). **Frozen corpus base (unchanged):**
`4e805681a050f22672d479cf5e02b0d5700eb2c7` (`4e805681a050`) — the
base the pilot/confirm legs ran on in sim-launchfield-horizon-b.
**Frozen:** 2026-11-23 ~09:00 UTC, BEFORE any judged run (no
amended-analyzer run on any judged corpus has happened yet; the
corpus inspections before this freeze were read-only).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 first 12 `1884c8852d38` — identical to the horizon-b corpora.
**Horizon:** 150d, death-aware. **Bands (DELIBERATE REUSE — the
fix must turn this exact band's 1 unexplained part): pilot
107439–107446 (regression: must re-judge unchanged), confirm
107447–107454 (judged).**

## The question (fix the horizon-exclusion clause, then re-judge)

sim-launchfield-horizon-b (`evidence/2026-11-23/sim-launchfield-horizon-b.md`,
DIAG-NO-GO on completeness) re-judged the horizon-exclusion clause:
pilot DIAG-GO on 107439–107446; confirm DIAG-NO-GO by exactly one
instance-day — seed 107447, visjoin_134/editor, day 150, parts 0–3,
all `no-rows`: the holder-state sampler writes zero rows
village-wide on the final day, so the frozen horizon clause (which
needs >= 1 row that day) cannot fire. Mechanism DENIED on both
bands. The round record
(`evidence/2026-11-23/sim-winnability-round-0030.md`) names the
next question: extend the clause to the zero-row final day, or fix
the sampler to sample the final day. Also read
`evidence/2026-11-22/sim-launchfield-rejudge-b.md`: the frozen
completeness bar cannot pass on a 150d horizon whenever an open
not-bid window touches d150 p3 — every unexplained part on a
re-judge band is d150 p3. That is this arm.

## THE JUDGMENT FIX (frozen — ONE option, choice (a))

**Chosen: (a) CLAUSE EXTENSION — a final-day instance-day with
zero holder-state rows village-wide counts as horizon-truncated
(not unexplained), with the firing recorded per instance-day.**

**Rejected: (b) SAMPLER FIX.** The sampler writes the final day's
rows only if the legs are re-run, and the legs cannot be re-run
here: the driver records the frozen base literal
`4e805681a050f22672d479cf5e02b0d5700eb2c7` and refuses (exit 2)
unless the run-time merge-base IS the frozen base — this
worktree's merge-base is `80e7da0bc`, so the driver refuses legs
on this base by design. Re-running legs would need a fresh
worktree at the frozen base, which this task did not set up, and
the task's own tripwire note says the instrument merges as-is
with the literal anchor and legs are NOT re-run after a rebase.
(b) is also the wider change: it alters what every future corpus
contains. (a) re-judges the EXISTING frozen corpora with the
amended clause — zero new sim cost, no comparability break, and
it answers the directed question exactly: does this exact band
now pass. (b) is not revisited in this arm.

## The extended clause, frozen precisely

New shared predicate `zeroRowFinalDayInfo(j, vid, day, hsCtx)` —
true (returns `{ finalDay, vidRowsPrevDay }`) iff ALL of:

1. `day === finalDay` where `finalDay = j.gameDays || j.days`
   (the run's final day, NOT the literal 150 — same definition
   the original clause uses).
2. **Zero holder-state rows village-wide that day** — no row for
   ANY vid, any part/target/when (new `hsRowsByDay` map in
   `buildHsCtx`).
3. **>= 1 holder-state row for the vid on `day - 1`** — the
   sampler was actively sampling this holder the day before the
   halt.
4. **No death record for the vid with `day <= finalDay`** — a
   dead holder's missing rows are death, not truncation.

**Day level.** In `classifyUnknownDayH`, in the `hs-no-rows`
branch (no dayRows and no gates), BEFORE returning
`hs-no-rows`: if `zeroRowFinalDayInfo(...)` holds, return
`hs-horizon-truncated` with trace `{ parts: [], otherTargetRows,
finalDay, villageRowsThatDay: 0, vidRowsPrevDay }`. In
`applyHolderState`, `hs-horizon-truncated` is NOT in the
stay-unknown set (`hs-unexplained`, `hs-no-rows`), so the day
counts as explained (hE++, `enriched.unknown--`). The firing is
counted per instance-day: new band counters
`hHorizonTruncated` + `horizonTruncatedDays` list
(seed/vid/target/day), surfaced in `bars.completeness` and the
band log.

**Part level.** In `applyPerPartLedger`, AFTER `perPartWhyNot`
(as the original clause does, so a scored / field-encounter /
otherwise explained part is never reclassified): if the part is
`no-rows` at `d === finalDay` (ANY part 0–3, not just p3) and
`zeroRowFinalDayInfo(...)` holds, reclassify
`horizon-truncated`. The original p3-only rule (vid rows that
day) is UNCHANGED and still fires first for the sampled-day
shape; the two rules cannot double-fire (the new one requires
village-wide zero rows that day).

**Scope, frozen.** The clause applies to the Leg S per-part
ledger AND the Taxonomy H day-level classification, for the same
instance-day. A `refresh-unexplained` at the final part stays
UNEXPLAINED (a row exists — the part was observed, the commit
was stale). A `field-encounter` at the final part still fires
first: the fallback runs BEFORE the `no-rows` return in
`perPartWhyNot`, so the exclusion never masks a fireable
encounter. A final-day `no-rows` part/day where OTHER vids have
rows that day stays `no-rows` (the village WAS sampled; this
vid's absence is a genuine gap). A non-final-day zero-row day
stays unexplained. Every horizon-truncated part AND day is
listed in the evidence ledger (seed/vid/target/day/part) and
counted in the frozen-bar table; the count is reported, never
hidden.

**Rationale.** The part/day is unobserved, not mis-recorded.
The sampler halts with the sim: on the failing seed the last
holder-state row for ANY villager is d149 while the holder was
alive through d150 (census rows d144–d150, no death record) and
scored every dawn d142–d149 — the instrument simply stops
seeing the village on the final day. The village-wide-zero
guard is what keeps the clause honest: it distinguishes "the
sampler never ran that day" (truncation) from "the sampler ran
and this holder has no row" (genuine gap), and the day-minus-1
+ alive guards tie it to a holder who was live and sampled up
to the halt. All four guards are checkable from the corpus by
any reader.

**Corpus facts verified read-only before this freeze** (from
`perseed-launchfield-horizon-b-107447-107454/...-s107447-...json`):
seed 107447, days 150, gameDays 150, survived, standing 585;
holder-state rows span d69–d149 (3637 rows), d148: 12, d149: 12,
**d150: 0 village-wide**; visjoin_134: 111 rows, last d149 (12
rows), target `editor` only, no death record, census rows
d144–d150, dawnbidScores d142p0–d149p0, v4seed d140
(`editor`, wave 5, stageAfter `party`), zero v4encounters on
d150. The old confirm analysis
(`launchfield-horizon-b-analysis-107447-107454.json`): verdict
DIAG-NO-GO, unknown 1, sUnexplained 4 (the four d150 parts),
sHorizonTruncated 0, hTally `{hs-gate-pick: 8, hs-no-rows: 1}`,
hU 9, hE 8. The old pilot analysis: DIAG-GO, unknown 0,
sUnexplained 0, sHorizonTruncated 0, hTally
`{hs-gate-pick: 3}`.

**Predicted re-judge (frozen prediction, not a re-score):**
confirm unknown 1 → 0, sUnexplained 4 → 0, sHorizonTruncated
0 → 4, hHorizonTruncated 1 (107447 visjoin_134/editor d150),
hTally `hs-no-rows` 1 → 0, `hs-horizon-truncated` 1; pilot
unchanged (unknown 0, sUnexplained 0, sHorizonTruncated 0).
If the re-judge shows any OTHER firing, it is reported as a
finding, not hidden — the verdict follows the frozen bars.

## What was read first (do not re-measure what they answered)

- `docs/CANON.md` — read first. No canon doc covers the
  villager companion-pool filter, the launch engine, or the
  holder-state recorder (CANON GAP, inherited): all three are
  grounded only in code, read before freezing.
- `evidence/2026-11-23/sim-launchfield-horizon-b.md` + prereg
  (this worktree) — the DIAG-NO-GO, the 1-instance-day failure,
  the frozen clause, the anchor pin, the pilot/confirm design.
- `evidence/2026-11-23/sim-winnability-round-0030.md` — the
  adoption record, the tripwire behavior on rebased tips
  (proof 51/53 with exactly the 2 §1 freeze-time failures),
  the named next question.
- `evidence/2026-11-22/sim-launchfield-rejudge-b.md` + prereg
  — the DIAG-NO-GO on completeness, the d150 p3 shape on every
  re-judge band, the §6 anchor pin, AMENDMENT 2 (null target).
- `docs/MEASUREMENT.md` §§9–12, 14–15 — staged seeds,
  death-aware horizons, pre-registration, metric binding,
  balanced panels.

## Instrument (analyzer + proof test only; driver UNCHANGED)

- `scripts/analyze-launchfield-horizon-b.js` — ONLY these
  changes: header comment (extension), `hsRowsByDay` in
  `buildHsCtx`, new `zeroRowFinalDayInfo` predicate,
  `hs-horizon-truncated` branch in `classifyUnknownDayH`,
  extension in the `applyPerPartLedger` post-pass,
  `hHorizonTruncated` + `horizonTruncatedDays` band
  aggregation + `bars.completeness` + band log line, PLUS
  §H5 + §H6 selftest fixtures (see below). Taxonomy A + B'
  and the launch accounting are reused VERBATIM. The driver
  is byte-identical (option (a) needs no driver change); the
  anchor literal `4e805681a050` is untouched. Leg P stays
  REMOVED; Leg R stays (reproduction of the 10 launcheng
  unknown days on the existing corpora).
- `scripts/test-launchfield-horizon-b.js` — ONLY these
  changes: §1 +2 checks (this prereg exists + freezes option
  (a); analyzer carries the zero-row predicate), §7 re-judge
  of the real corpora (new analyzer), §7b old-code-fails
  control (the 86e5bd38e analyzer on the same confirm corpus
  must still report unknown 1 / sUnexplained 4). No §4/§5
  change: the live runs call `oneRun` (module), which does
  NOT trip the CLI-only merge-base refusal — that is why the
  adoption's proof test on rebased tips passed §4/§5 and
  failed only the 2 §1 checks.
- **§H5 gap found (recorded, not hidden):** the horizon-b
  prereg claims "PLUS §H5 selftest fixtures (positive,
  no-rows-that-day negative, non-final-day negative,
  refresh-unexplained negative, field-encounter-order
  positive)" — verified by grep before this freeze: NO §H5
  horizon fixture exists in the analyzer selftest. The
  original p3 clause was never directly fixture-tested; it
  never fired on either band (horizonTruncated 0/0), so the
  gap never bit. This arm adds §H5 (the original clause) AND
  §H6 (the extension).

## Selftest fixtures (frozen — §H5 original clause, §H6 extension)

§H5 (5 checks): (a) positive — final day, rows at p0–2, p3
no-row, vid rows that day → p3 horizon-truncated,
sHorizonTruncated 1, sUnexplained 0; (b) negative — final
day, no rows for the vid that day BUT other vids have rows
that day → p3 stays no-rows, sUnexplained 1; (c) negative —
non-final-day no-rows part with rows that day → stays
no-rows; (d) negative — final-part refresh-unexplained stays
refresh-unexplained (sUnexplained 1); (e) order — final part
with encounter + Haven rows elsewhere classifies
field-encounter, not horizon-truncated.
§H6 (10 checks): (a) positive, the 107447 shape — final day
12, zero holder-state rows village-wide that day, vid rows
day 11, no death, census row day 12 → Leg S 4 parts
horizon-truncated (sUnexplained 0, sHorizonTruncated 4),
day-level `hs-horizon-truncated`, applyHolderState explains
the day (unknown 0 after H); (b) negative — vid has no rows
on day 11 (last row day 10) → part stays no-rows AND
day-level stays hs-no-rows; (c) negative — other vids have
rows that day → day-level hs-no-rows; (d) negative —
zero-row village-wide on a NON-final day → part stays
no-rows AND day-level stays hs-no-rows; (e) negative — vid
died on the final day → part classifies dead (never
reaches the clause) AND day-level stays hs-no-rows (death
guard).

## Primary metric (frozen)

Classification completeness over the judged bands: 0 unknown
across all candidate-not-bid + churned instance-days (B' +
H-extended, incl. the new `hs-horizon-truncated` day-level
reason), AND 0 unexplained parts in the Leg S per-part ledger
(with `horizon-truncated` parts excluded per the frozen
clause, counted separately) — plus Leg R reproducing the 10
launcheng unknown days exactly on the old corpora.

## DIAG-GO BAR (frozen — a miss is NO-GO, never re-scored)

The diag is **DIAG-GO** only if ALL of these hold on BOTH the
pilot band AND the confirm band (the confirm is the judged
band; the pilot is the regression — it must re-judge unchanged):

(a) **Completeness:** 0 unknown across all instance-days on
    the band (B' reasons + H reasons incl.
    `hs-horizon-truncated`, counted per instance-day) AND 0
    unexplained parts in the Leg S per-part ledger
    (`horizon-truncated` parts excluded per the frozen clause
    and counted separately in the bar table).
(b) **Leg R reproduction:** the analyzer run over the EXISTING
    strikeband4 corpora reproduces the 10 launcheng
    unknown-no-signal days exactly (same seed/vid/target/day
    list) — the copy is faithful.
(c) **Instrument validity:** proof test
    `scripts/test-launchfield-horizon-b.js` green on the
    frozen base; analyzer selftest green; analyzer run on
    each band dir parses 8/8 files, 0 instrument errors,
    substrate assertions pass (policy sha `1884c8852d38`,
    all 7 flags `1`, `allyslot3InSrc: true`, anchor base
    `4e805681a050`).
(d) **Field-encounter fire count — REPORTED, not gating:** the
    field-encounter fallback's fire count on each band (Leg S
    whyNot tally `field-encounter`, each with its `enc` trace)
    is reported in the evidence with its traces. It does NOT
    gate the verdict: supply was established on the re-judge
    B3 band, and this arm re-judges completeness under the
    fixed bar, not supply.

REPORTED BUT NOT GATING the verdict: the binding gate over
assessed days, launch sanity, the wall numbers, and how many
judged-band parts the field-encounter fallback attributes
(with their traces). The DIAG bar is (a)+(b)+(c) only. The old
band (107301–107308) is NOT re-judged: the §3b regression in
the proof test is a check on the instrument, not fresh
evidence. The re-judge bands (107399–107430) are NOT
re-judged either: their verdicts stand on their own bases;
this arm's verdict is fresh. No new sims, no new panel: there
is no before/after lever pair and no new corpus, so the prior
arm's panel compare
(`evidence/2026-11-23/launchfield-horizon-b-panel.md`) stands
and is not rebuilt.

## Proof counts (frozen)

- Proof test: 53 baseline checks + 2 (§1) + 7 (§7 re-judge)
  + 4 (§7b old-code control) = **66 checks; 66/66 on the
  frozen base**. On THIS worktree (base 80e7da0bc) the
  expected result is **64/66**: the 2 §1 freeze-time checks
  (merge-base == frozen base; src/js identical to the frozen
  base) fail BY DESIGN after the rebase — the adoption
  record shows exactly this 51/53 shape on every rebased
  tip. Record the 2 failures, do NOT "fix" them. (Count
  corrected from 65/63 in the first write of this prereg:
  §7b is 4 checks — setup + unknown-1 + 4-unexplained +
  temp-file-removed — not 3. Corrected before the judged
  analysis files are written; the judgment — clause, bands,
  bars — is unchanged.)
- Analyzer selftest: 71 baseline checks + 5 (§H5) + 10 (§H6)
  = **86 checks; 86/86**. (Count corrected from 85 in the first
  write of this prereg: §H6 is 10 checks — 3 + 2 + 1 + 2 + 2 —
  not 9. The fixtures implement exactly what the §H6 prose
  above describes; only the arithmetic was wrong. Corrected
  before any judged run; the judgment — clause, bands, bars —
  is unchanged.)
- §7b old-code-fails control: the analyzer extracted from
  commit `86e5bd38e` (the merged horizon-b tip) via
  `git show 86e5bd38e:scripts/analyze-launchfield-horizon-b.js`
  to a temp file under `scripts/` (its requires resolve
  relative to the worktree), `bandOf` on the confirm corpus
  must report unknown 1 / sUnexplained 4 / sHorizonTruncated
  0 — i.e. the new §7 assertions FAIL against old code. The
  temp file is deleted in a finally; its absence is asserted
  and the worktree is verified clean at the end.

## Anchor tripwire (frozen, unchanged from horizon-b)

The driver records `anchorCommit` as the FROZEN BASE literal
`4e805681a050f22672d479cf5e02b0d5700eb2c7` and refuses (exit 2)
unless the run-time merge-base IS the frozen base. This
worktree's merge-base is `80e7da0bc`, so the driver CLI
refuses legs here by design — NO legs are run in this arm,
and the proof test's §4/§5 live runs use module `oneRun`
(which does not refuse). The proof test will show the 2 §1
failures after the rebase BY DESIGN — record them, do NOT
"fix" them, do NOT re-run legs after any rebase.

## Band freshness (deliberate reuse — no fresh-band search)

Pilot 107439–107446 + confirm 107447–107454 are REUSED from
sim-launchfield-horizon-b BY DESIGN: the question is whether
this exact band now passes. No fresh-band search applies; the
reuse is the experiment. (Prior arm's freshness note stands:
the bands were fresh at the horizon-b freeze; the Loop A
homebody re-judge's overlap on 107439–107446 postdates that
freeze and is a different lever/substrate/question.)

## Wall numbers (reported every run, both national definitions)

Wins, national by scaleRank ≥ 2, national by standing ≥ 200,
table seats, wave-4 unlocked, wave-5 unlocked, median survival,
total deaths, starvation deaths — recomputed by the analyzer
from each judged band's corpora (not copied). Also the
standing-199 stall count. No new sims, so the wall numbers
are the horizon-b numbers re-reported from the re-judged
analysis JSONs.

## Sense-testing (SENSE-TESTING LAW)

Read the 107447 instance-day end to end from the corpus —
every holder-state row for visjoin_134 on d149 and the
absence on d150, the census rows, the scored dawns — quoting
its rows, to show the truncation attribution is the data
pattern and not an assumption. Read at least one scored day
and one skipped day from the per-part ledger in plain words.
Judge meaning, coherence, consequences — never just counts.
The evidence carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. **No retroactive classification:** the 10 launcheng unknown
   days cannot be re-classified from their own corpora. Only
   the judged bands are classified at per-part depth.
2. **Perception flag unrecorded** (inherited): a reached
   refresh with a stale commit and no score/gate row stays
   `hs-unexplained`.
3. **Target matching is by TYPE, not instance** (inherited).
4. **Day granularity:** a same-day fight may precede the
   launch within the day (the family's convention, kept).
5. **The analyzer reuses frozen classifiers** — their
   definitions are not re-decided here except for the frozen
   extension above, explicitly flagged wherever it changes a
   count vs the frozen taxonomy.
6. **Write flap:** intermittent EPERM on fresh-file writes has
   struck this program repeatedly. Legs are NOT re-run in
   this arm (no driver CLI use); writes are probed before
   they matter and verified by size/readback; a blocked final
   commit leaves files on disk intact for coordinator
   adoption, never forced. Single-attempt truncating writes
   are not used on irreplaceable files.
7. **Anchor scope:** the FROZEN BASE literal is the frozen
   base only while the branch forks from `4e805681a` with no
   merges; a rebase onto a newer master trips the driver's
   refuse check by design (re-freeze then, don't amend
   silently). The recorded anchor is a literal, so a rebase
   can no longer silently move it — the driver refuses
   instead. This worktree forks from `80e7da0bc`; the driver
   CLI refuses here by design and is never invoked.
8. **Taxonomy H** is inherited verbatim except for the frozen
   extension above.

## Files

- Prereg: `evidence/2026-11-23/sim-launchfield-horizonfix-b-prereg.md` (this file)
- Instrument: `scripts/analyze-launchfield-horizon-b.js` (amended),
  `scripts/test-launchfield-horizon-b.js` (amended),
  `scripts/launchfield-horizon-driver-b.js` (UNCHANGED)
- Corpora (existing, read-only):
  `evidence/2026-11-23/perseed-launchfield-horizon-b-107439-107446/`
  (pilot), `…-107447-107454/` (confirm)
- Analysis (re-judged, new files — the horizon-b analyses are
  NOT overwritten):
  `evidence/2026-11-23/launchfield-horizonfix-b-analysis.json`
  (pilot) +
  `launchfield-horizonfix-b-analysis-107447-107454.json`
  (confirm)
- Evidence: `evidence/2026-11-23/sim-launchfield-horizonfix-b.md`
- Reproduction corpora (existing, read-only):
  `evidence/2026-11-20/perseed-strikeband4-b-106241-106248/` (8 files)
- Old-band regression corpora (existing, read-only):
  `evidence/2026-11-21/perseed-launchstate-b-107301-107308/` (8 files)
