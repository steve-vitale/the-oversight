# sim-launchfield-horizon-b — DIAG PREREG, re-judgment of the launchfield recorder with the horizon fix (frozen before any judged sim)

**Arm:** sim-launchfield-horizon-b, DIAG instrument · **Loop B run:**
fleshout-loop-b-20261123T0030Z · **Axis:** winnability chain
**Type:** DIAG, instrument-only (port of the re-judge instrument +
analyzer horizon-exclusion + proof test). No game-code change, no
default flipped, no lever built in this stage.
**Branch:** `sim-launchfield-hz-b` · **Worktree:**
`~/workspace/worktrees/sim-launchfield-hz-b`
**Frozen base:** master `4e805681a050f22672d479cf5e02b0d5700eb2c7`
(`4e805681a050`), the current master tip at freeze time (verified at
arm start: worktree HEAD `4e805681a050f22672d479cf5e02b0d5700eb2c7`,
`git merge-base HEAD master` identical, `git status --short` shows
only the 3 new instrument files of this arm).
**Frozen:** 2026-11-23 ~02:25 UTC, BEFORE any judged sim.
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 first 12 `1884c8852d38` — IDENTICAL to the
holderstate-b / launcheng-b / poolfirstfail-b / launchstate-b /
launchfield-b / launchfield-refreeze-b / launchfield-rejudge-b
corpora; verified live on this base (see below).
**Horizon:** 150d, death-aware. **Pilot:** 8 seeds 107439–107446.
**Confirm:** 8 fresh seeds 107447–107454, ONLY if the pilot GOes
on every bar.

## The question (re-judgment with the horizon fix)

sim-launchfield-rejudge-b (`evidence/2026-11-22/sim-launchfield-rejudge-b.md`,
DIAG-NO-GO on completeness) judged the launchfield recorder on
fresh bands and found the supply question answered — the
field-encounter fallback fired twice on fresh data (band B3,
107415–107422, both parts seed 107419 day 150 part 3) — but
completeness failed by exactly one part: seed 107420,
`thabo_maseko` / `reunion`, day 150 part 3, `no-rows`. The
150d run ends before the final part is sampled; all four
field-encounter fires ever observed are d150 p3, and every
unexplained part on a re-judge band is d150 p3. The frozen
completeness bar (0 unexplained parts) cannot pass on a 150d
horizon whenever an open not-bid window touches d150 p3. The
1630Z round record states the next judgment needs a
horizon-exclusion clause for the final part, or a horizon that
lets p3 complete — do NOT re-run the same judgment expecting a
different result.

This arm fixes the judgment, then re-judges. ONE choice is
pre-registered below (clause (a)); the other is considered and
rejected with its reason, frozen here, not revisited mid-run.

## THE JUDGMENT FIX (frozen — choice (a): horizon-exclusion clause for the final part)

**Chosen: (a) a horizon-exclusion clause for the final part (d150 p3)
in the completeness bar.**

**The clause, frozen precisely.** In Leg S, a part at (day == the
run's final day, part == 3) whose `perPartWhyNot` is `no-rows` is
reclassified `horizon-truncated` — counted separately, excluded
from the unexplained tally — IFF at least one holder-state row for
the vid exists that day (any part, any target). The day was
sampled; only its final part was cut off by the halt. If NO
holder-state row for the vid exists that day, the part stays
`no-rows` (UNEXPLAINED): a day never sampled is a genuine gap,
not truncation.

**Scope, frozen.** The clause applies to the Leg S per-part ledger
ONLY. The day-level bar (0 unknown instance-days, B' + H) is
UNCHANGED: a day-150 unknown would mean the day-level taxonomy
failed on an observed day. A `refresh-unexplained` at the final
part stays UNEXPLAINED (a row exists — the part was observed, the
commit was stale). A `field-encounter` at the final part still
fires first: the fallback runs BEFORE the `no-rows` return in
`perPartWhyNot`, so the exclusion never masks a fireable
encounter. The clause keys on the run's final day
(`j.gameDays || j.days`), NOT the literal 150 — it is
structural, so it also covers died-early seeds whose final day
truncates the same way. Every horizon-truncated part is listed
in the evidence ledger (seed/vid/target/day/part) and counted in
the frozen-bar table; the count is reported, never hidden.

**Rationale.** The part is unobserved, not mis-recorded.
Classification requires observation: the sim halts at the
horizon before the sampler fires for the final part, so there is
nothing for the analyzer to read — no Haven row, no encounter
row, no scholar row. Charging an unobserved part against the
recorder's completeness is a category error: it judges the
recorder for the sim's halt, not for a live event it missed.
The "rows exist that day" guard is what keeps the clause honest:
it distinguishes "day sampled, final part cut off" (truncation)
from "day never sampled" (genuine gap), and the guard is
checkable from the corpus by any reader.

**Rejected: (b) a horizon that lets p3 complete (e.g. 151d).**
A longer horizon does not remove the truncation — it relocates
it. The sim always halts before the final part's sample, so a
151d run would leave a (possibly unexplained) d151 p3 part in
the ledger, and the 0-unexplained bar would fail the same way
on the new edge. The only way (b) works is to run 151d but judge
only through d150 — an exclusion of the final day dressed as a
horizon change, with extra sim cost and wall numbers no longer
comparable to every prior 150d band (held, refreeze, re-judge).
(a) names the edge structurally and keeps the horizon,
substrate, and wall numbers comparable. (b) is not revisited
in this arm; if a future arm wants it, it pre-registers the
151d-run / judge-through-150d shape explicitly and owns the
comparability break.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-22/sim-launchfield-rejudge-b.md` + prereg
  (read from this worktree) — the DIAG-NO-GO on completeness,
  the 1-unexplained-part verdict, the 2 live field-encounter
  fires (both d150 p3), the B2 shape (1 unexplained part,
  107411 d150 p3), the §6 anchor pin, AMENDMENT 2 (null target).
- `evidence/2026-11-22/sim-launchfield-refreeze-b.md` + prereg
  — the DIAG-NO-GO on supply, the 0/16 ledger, the two churn
  holders whose encounters fell outside the trigger shape.
- `evidence/2026-11-21/sim-launchstate-b.md` + prereg — the
  2-part failure the fallback was built to close (107305 d150
  p3, `devon_okafor`/`reunion` + `benoit_lambert`/`eulogy`,
  both `suburb`/`vFlee` field encounters).
- `docs/CANON.md`, `docs/PARTY.md` — read first. PARTY.md covers
  the SCHOLAR's party, not the villager companion pool. No canon
  doc covers the villager companion-pool filter or the launch
  engine (CANON GAP, inherited): both are grounded only in code,
  read before freezing.
- `docs/MEASUREMENT.md` §§9–12, 14–15 — staged seeds,
  death-aware horizons, pre-registration, metric binding,
  balanced panels.

## The per-part field-encounter fallback (frozen, inherited verbatim from the re-judge arm)

In `perPartWhyNot`, in the no-tick-entry-row branch, AFTER the
AMENDMENT 1 fallbacks (seed-day / retargeted / dead /
plan-deleted) and BEFORE `no-rows`, a part classifies
`field-encounter` (EXPLAINED) iff ALL of these hold:

1. No tick-entry holder-state row for (vid, target) at (day, part).
2. No other-target holder-state row for the vid at (day, part),
   and no `v4seeds` retarget row for the vid that day (else
   `retargeted` — checked earlier, unchanged).
3. Holder alive on/before that day (death check earlier).
4. Not the instance's seed day (checked earlier).
5. A `dawnbidCensus` row exists for the vid that day (the plan is
   live — else `plan-deleted`).
6. A `v4encounters` row exists with `vid` == the holder AND `day`
   == the part's day (vid+day match). The vid match uses the same
   `encountersByVidDay` map as the day-level `field-encounter-day`
   reason (vid as primary fighter OR ally), so the two levels
   agree on what counts as an encounter for a vid.
7. Haven-rows-absent for THIS part but Haven-present elsewhere
   that day: at least one holder-state row for the vid on that day
   at a different part with `haven === true`. The holder was at
   Haven that day; the recorder samples inside `objTick` at Haven,
   so a missing part with a same-day encounter is the consumed
   part.

Attribution is **day-match + Haven-rows-absent**: the encounter
rows carry NO part field, so the part is attributed by
elimination, never by a recorded part. The encountered monster
(`mid`) need NOT be the plan target. The first encounter row is
attached to the ledger part as `enc: {mid, outcome, origin}` for
the trace.

If EITHER condition 6 or 7 fails, the part stays `no-rows`
(UNEXPLAINED) — do not force-attribute — and the horizon clause
above then applies only at the final part. The horizon clause
runs AFTER `perPartWhyNot` returns, in `applyPerPartLedger`,
so it can never reclassify a part the fallback already
explained, and never fires on a scored part.

AMENDMENT 1 (inherited from sim-launchstate-b): Leg S part-level fallback rules — the frozen order is now seed-day /
retargeted / dead / plan-deleted / field-encounter / no-rows
(+ horizon-truncated as a post-pass reclassification of
final-part no-rows only, this arm). Nothing else in Leg S
changes.

AMENDMENT 2 (inherited from sim-launchfield-rejudge-b): a
holder-state row's `target` field may be null (a holder between
targets). The field must still be PRESENT (string or null);
every other frozen field is unchanged. The proof test §4
predicate is `!('target' in r)`, not `!r.target`.

## ANCHOR PIN (frozen, ported verbatim from the re-judge arm — the §6 fix)

The launchstate §6 proof compared the recorded anchor against
the same run-time `git merge-base HEAD master` computation that
produced it — a tautology: the anchor silently followed the
landing rebase and the proof could not catch the move. The fix:

- The driver records `anchorCommit` as the FROZEN BASE literal
  `4e805681a050f22672d479cf5e02b0d5700eb2c7` (`FROZEN_BASE12`
  `4e805681a050`) — NEVER a run-time merge-base. `anchorHead`
  still records run-time HEAD for transparency.
- The driver still REFUSES to run (exit 2) unless the run-time
  merge-base IS the frozen base (stale-base tripwire, never a
  silent label) — but the recorded anchor no longer depends on
  that computation. Re-freeze deliberately, never amend silently.
- The proof test §6 asserts the live run's `anchorCommit`
  EQUALS the frozen literal (and `anchorHead` equals run-time
  HEAD), and §6b fires the tripwire live: the driver CLI run
  against a git shim that answers `merge-base` as `4266e6ccef2a`
  (a real base that differs from the frozen base) must STOP exit
  2 with the merge-base message.

## Pilot + confirm design (frozen — the instrument question this time)

- **Pilot: 8 seeds 107439–107446**, full 150d death-aware
  horizon under the frozen substrate, judged under the frozen
  bars below. The pilot is the gate: GO on every bar, or stop.
- **Confirm: 8 fresh seeds 107447–107454**, same substrate,
  same base, same bars — runs ONLY if the pilot GOes on every
  bar. A pilot miss is NO-GO with no confirm spend (the
  §9 kill rule: no 12–16-seed spend on an invisible effect).
- **Verdict: DIAG-GO only if BOTH bands pass (a)+(b)+(c).**
  The two bands are the 16-seed confirm sizing of §9 stage 2,
  split as pilot + confirm so a failing judgment costs 8 seeds,
  not 16.
- **No screen.** The supply question is answered (B3 fired
  twice); this arm re-judges completeness under the fixed bar,
  so no band-screening is needed. The pilot band is pre-chosen,
  not selected by outcome.
- **No re-run of the re-judge bands.** B1/B2/B3 keep their
  verdicts on their own bases; this arm's verdict is fresh.

## Band freshness (verified 2026-11-23, before this prereg)

Pilot 107439–107446 + confirm 107447–107454. Search scope per
the `local_seed_band_freshness` skill AND the task brief:
`git grep` over ALL `evidence/*/sim-*-prereg.md` AND all
`evidence/**/sim-*.md`, per seed, on the frozen base.

- Pilot seeds 107439–107446: **ZERO hits each**, verified
  per-seed in the required scope (16-seed loop over the
  prereg+sim-md pathspec; each seed 0 files).
- Confirm seeds 107447–107454: **ZERO hits**, verified by one
  combined alternation grep (`10744[7-9]|10745[0-4]`) over the
  same scope (exit 1, no matches), and zero hits in
  `evidence/*/sim-*.md` alone for the full 107439–107454 range.
- All-evidence scope (extra diligence, beyond the required
  scope): the only hits for 107439–107454 are old October JSON
  numeric values, inspected by hand — `"takesSum": 107444`
  (`evidence/2026-10-15/perseed-thirstbank/summary.json`) and
  a pipe-delimited trajectory field containing `107452`
  (`evidence/2026-10-17/perseed-spiralgate/armed-leadfeast-s1103.json`).
  Neither is a seed, a band naming, or a reservation. The
  three near-miss seeds 107433/107435/107438 were NOT used:
  each has exactly 1 hit in the required scope, both in
  `evidence/2026-11-22/sim-launchfield-rejudge-b-prereg.md`
  lines 223/227, quoting non-seed pantry/fd values already
  inspected and dismissed in that prereg — quoted numbers, not
  band namings — but the pilot starts at 107439 so the frozen
  bands carry literally zero hits in the required scope.
- Already-used bands NOT reused: 106181–106188 (dmgshape-b);
  106211–106218, 106221–106228, 106231–106238 (strikeband-b);
  106241–106248 (strikeband4-b / launcheng-b); 106251–106258
  (sense3-b); 106501–106516 (pinquaddoor-wide-b);
  106601–106616 (reseedexpiry); 106701–106716
  (pinquaddoor-reprereg-b); 106721–106728 (holderstate-b);
  106729–106736 (dmgpin-reprereg-b); 106731–106738
  (poolfirstfail-b); 106751–106766 (profilegate-confirm-b);
  107051–107058 (cellgate-a); 107091–107098 (fibersupply-a);
  107111–107118 (lendpool-a); 107237–107244 (grantrate-a);
  107241–107248 (shelterdraft-a); 107261–107268
  (killlootbundle-a); 107271–107282 (tier4pool-a);
  107281–107296 (killlootfixture-a); 107301–107308
  (launchstate-b); 107313–107320 (killrate-a);
  107321–107328 (launchfield-b AND gunlife-a); 107329–107336
  (journey endgame r267); 107359–107366 (leadgate-a);
  107367–107374 (cellcheck-a); 107383–107390
  (launchfield-refreeze-b); 107399–107430 (launchfield-rejudge-b
  screen B1–B4); **107423–107430 ALSO named by sim-dawnchoke-a
  AND sim-homebody-a** (both 2026-11-22; a collision between
  those two arms, noted here so no later worker re-uses it —
  not this arm's to fix).

- **107439–107446 (pilot) + 107447–107454 (confirm) FRESH.**
  Zero namings in the required scope for every seed.

## Base-identity check (verified before freezing)

- Worktree HEAD = master tip `4e805681a050f22672d479cf5e02b0d5700eb2c7`
  (`git rev-parse HEAD`, `git merge-base HEAD master` identical,
  `git status --short` shows only this arm's 3 new instrument
  files, untracked).
- Policy sha verified live on this base: `sha256sum
  scripts/policies/competent.js` first 12 = `1884c8852d38`
  (identical to holderstate / launcheng / poolfirstfail /
  launchstate / launchfield / launchfield-refreeze /
  launchfield-rejudge).
- ALLYSLOT3 IS in `src/js` on this base (`fieldFights.js`,
  `game.js`, `party-wiring.js`, `villager-agency.js`). The
  driver records `allyslot3InSrc: true` on every corpus and
  refuses to run if the flag is absent from src/js.
- `src/` HAS moved since the re-judge judgment's base
  (`1c11dbb14` → `4e805681a`: `src/js/build.js` 1 line (version
  stamp), `src/js/convo-dialogue.js` +18, `src/js/convo-wants.js`
  +46, `src/js/convoTopics.js` +41, `src/js/villager-agency.js`
  +45, `src/js/villager-brain.js` +6/−6, `src/js/win-plan.js`
  +5/−2; 152 insertions, 11 deletions — journey succession
  r267). The win-plan.js / villager-brain.js change propagates
  `needWave` to companion plans on launch (companion-plan
  bookkeeping, launch mechanics untouched); the convo changes
  are narration. That move is WHY this is a fresh judgment,
  not a re-freeze: the recorder is ported behavior-identical
  and the substrate (same 7 flags, same policy sha) is
  identical, but the game code under it is not byte-identical,
  so the numbers are judged fresh and never compared as a
  re-run of the re-judge bands.

## Substrate (env flags — identical to holderstate-b / poolfirstfail-b / launchstate-b / launchfield-b / launchfield-refreeze-b / launchfield-rejudge-b)

`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`,
competent verbatim, 150d death-aware, one leg (recorder ON),
MODE=vre. **ZERO `src/js` changes in this arm.**

## Encounter-gear fixture note (Steve 2026-11-13)

This is a DIAG instrument arm: the judgment observes LIVE sims
under the competent verbatim policy — the scholar plays with the
gear and party the policy assembles as it reaches wave-4
content, never a fresh un-geared solo scholar staged for the
verdict. No synthetic solo-scholar fixture is used for the
judgment. The §H4 staged fixture in the proof test is
instrument evidence only (it proves the fallback fires on a
`v4encounters` row), never fresh evidence. The sense-test reads
real holder-days from the judged bands' corpora.

## Instrument (recorder copy + extended analyzer; driver wraps only)

- `scripts/launchfield-horizon-driver-b.js` — a port of
  `scripts/launchfield-rejudge-driver-b.js` with ONLY these
  changes: header comment, arm/run `launchfield-horizon-b`
  (out object + file names
  `launchfield-horizon-b-s<seed>`), stop-message prefix
  `LAUNCHFIELD` (kept), driver-filename strings in
  `firstCallerFrame`/`fightOrigin`, the usage line re-seeded to
  107439–107446, `EVIDENCE_DATE` default `2026-11-23`,
  OUTDIR `perseed-launchfield-horizon-b-107439-107446`, PLUS
  the ANCHOR PIN re-pointed at the new frozen base literal
  `4e805681a050f22672d479cf5e02b0d5700eb2c7`. All recorder logic
  — wraps, pool replica, `rangeScoreOf`, `poolCensus`,
  holder-state sampler, launch tracker — byte-identical in
  behavior to the re-judge instrument. The confirm band runs
  through the same driver with `SEEDS` + `OUTDIR` env
  overrides (`perseed-launchfield-horizon-b-107447-107454`);
  the driver refuses to overwrite an existing corpus (exit 3).
  - Corpora: `evidence/2026-11-23/perseed-launchfield-horizon-b-107439-107446/`
    (pilot), `…-107447-107454/` (confirm, only if the pilot GOes).
- `scripts/analyze-launchfield-horizon-b.js` — a port of
  `scripts/analyze-launchfield-rejudge-b.js` with ONLY these
  changes: header, arm/run `launchfield-horizon-b`, EXPECTED
  seeds 107439–107446 + anchor12 `4e805681a050` +
  `allyslot3InSrc: true`, output
  `evidence/2026-11-23/launchfield-horizon-b-analysis.json`
  (default; the confirm band writes
  `launchfield-horizon-b-analysis-107447-107454.json` via the
  `ANALYSIS_OUT` env override), PLUS the horizon-exclusion
  clause (frozen above: `horizon-truncated` reclassification
  in `applyPerPartLedger`, `sHorizonTruncated` counter,
  `horizonTruncatedParts` list, reported in the completeness
  bar), PLUS §H5 selftest fixtures (positive, no-rows-that-day
  negative, non-final-day negative, refresh-unexplained
  negative, field-encounter-order positive). Taxonomy A + B'
  and the launch accounting are reused VERBATIM — their
  definitions are not re-decided here. Leg P stays REMOVED;
  Leg R stays (reproduction of the 10 launcheng unknown days
  on the existing corpora).
- `scripts/test-launchfield-horizon-b.js` — proof (mirrors
  `scripts/test-launchfield-rejudge-b.js`): §1 static (files
  exist, no `src/js` diff vs the FROZEN BASE literal, anchor pin
  present in the driver) + §2 analyzer selftest green (71
  checks incl. §H4 + the new §H5 horizon fixtures) + §3 fixture
  end-to-end (Leg S + H classes on a synthetic corpus) + §3b
  old-band regression (the new analyzer re-reads the EXISTING
  launchstate corpora and must close exactly the 2
  previously-unexplained parts as field-encounter with the
  suburb/vFlee trace — substrate flags on the old band are
  expected to fail there and are NOT asserted) + §4 live 150d
  shape run on pilot seed 107439 (holder-state rows, pool rows,
  census rows, per-part ledger non-empty) + §5 D1/D2 at 30d on
  107439 under the full substrate (repeatability + recorder
  neutrality) + §6 anchor (the live run's `anchorCommit`
  EQUALS the frozen literal) + §6b anchor tripwire (live
  refusal on a non-frozen base).

## Leg S — per-part scored-ness ledger (frozen, inherited + horizon clause)

Run over the judged bands' corpora, for every instance-day in
the window of every candidate-not-bid and churned instance. For
each day-part p in 0–3:

- `scored` = a `dawnbidScores` row exists for (vid, target)
  that day+part (the wrap proves scoring happened).
- If not scored, `whyNot` from the tick-entry holder-state
  row for that part, first match in `objTick` code order:
  `scholar` / `dead` / `engaged` / `away` / `on-expedition` /
  `off-haven` / `chore-live` (indoor objective, partsLeft > 0,
  no refresh opportunity — the holder is living the chore) /
  `refresh-blocked` (objective done/idle at a part the holder
  REACHED, commit from today — `vbrainShouldRefresh` refused)
  / `gate-pick` (a `holderGatePicks` row that part — the pick
  bypassed scoring) / `no-rows` (no holder-state row that part
  — a coverage gap, counts UNEXPLAINED).
- Fallbacks, applied in this order BEFORE `no-rows`, each named
  by the same mechanism the day-level taxonomy already uses for
  that day: `seed-day` / `retargeted` / `dead` /
  `plan-deleted` / `field-encounter` (frozen above).
- Post-pass (this arm): a `no-rows` part at (final day, part 3)
  with a holder-state row for the vid that day reclassifies
  `horizon-truncated` (EXCLUDED from unexplained, counted
  separately). A `no-rows` part at (final day, part 3) with NO
  row for the vid that day stays `no-rows` (UNEXPLAINED).
- A part is EXPLAINED iff scored or `whyNot` is a named
  mechanism (incl. `horizon-truncated`); the ledger reports
  per-part coverage (parts total / scored / explained-not-scored
  / unexplained / horizon-truncated) and the per-part `whyNot`
  tally, beside the day-level B' + H table.

## Primary metric (frozen)

Classification completeness over the judged bands: 0 unknown
across all candidate-not-bid + churned instance-days (B' +
H-extended), AND 0 unexplained parts in the Leg S per-part
ledger (with final-part `horizon-truncated` parts excluded per
the frozen clause, counted separately) — plus Leg R reproducing
the 10 launcheng unknown days exactly on the old corpora.

## DIAG-GO BAR (frozen — a miss is NO-GO, never re-scored)

The diag is **DIAG-GO** only if ALL of these hold on BOTH the
pilot band AND the confirm band (the confirm runs only if the
pilot GOes):

(a) **Completeness:** 0 unknown across all instance-days on
    the band (B' reasons + H reasons incl. the two
    launchstate classes; churn closings present) AND 0
    unexplained parts in the Leg S per-part ledger (final-part
    `horizon-truncated` parts excluded per the frozen clause
    and counted separately in the bar table).
(b) **Leg R reproduction:** the analyzer run over the EXISTING
    strikeband4 corpora reproduces the 10 launcheng
    unknown-no-signal days exactly (same seed/vid/target/day
    list) — the copy is faithful.
(c) **Instrument validity:** proof test
    `scripts/test-launchfield-horizon-b.js` green; analyzer selftest
    green; analyzer run on the band dir parses 8/8 files,
    0 instrument errors, substrate assertions pass (policy sha
    `1884c8852d38`, all 7 flags `1`, `allyslot3InSrc: true`,
    anchor base `4e805681a050`).
(d) **Fresh-band supply — REPORTED, NOT GATING:** the
    field-encounter fallback's fire count on each band (Leg S
    whyNot tally `field-encounter`, each with its `enc` trace)
    is reported in the evidence with its traces. It does NOT
    gate the verdict: supply was established on the re-judge
    B3 band (2 live fires, the first on fresh data), and this
    arm re-judges completeness under the fixed bar, not supply.
    Re-gating on supply would re-ask an answered question and
    could mask the completeness answer with a supply failure
    on a thin band. The metric review asks whether the
    fallback ever fires mid-run (all 4 observed fires are
    d150 p3).

REPORTED BUT NOT GATING the verdict: the binding gate over
assessed days (holderstate bar-3 shape), launch sanity (all
wave-4-target launches accounted, 0 no-start-call, 0
no-copy-link), the wall numbers, and how many judged-band parts
the field-encounter fallback attributes (with their traces).
The DIAG bar is (a)+(b)+(c) only — this arm judges the
RECORDER's completeness under the horizon fix, not a
re-judgment of the pool or the gate. The old band
(107301–107308) is NOT re-judged: the §3b regression in the
proof test is a check on the instrument, not fresh evidence.
The re-judge bands (107399–107430) are NOT re-judged either:
their verdicts stand on their own bases; this arm's verdict is
fresh.

## Balanced panel (frozen — comparability check, never the judge)

Per MEASUREMENT §15, the panel is the instrument, the
pre-registered threshold is the judge. This is a DIAG arm with
no game change, so there is no before/after lever pair; the
panel's frozen role here is a band-to-band comparability check
on the frozen base: build one panel per band (pilot seeds,
confirm seeds) with the registry policies and compare them.

- Build: `node scripts/balance-panel.js --out evidence/2026-11-23/launchfield-horizon-b-panel-pilot --seeds 107439,107440,107441,107442,107443,107444,107445,107446 --policies capable,maker,merchant,caregiver --days 150` and the same for the confirm seeds into `...-panel-confirm` (only if the confirm runs).
- Compare: `node scripts/balance-panel.js compare --before <pilot panel.json.gz> --after <confirm panel.json.gz> --out evidence/2026-11-23/launchfield-horizon-b-panel`; attach the resulting `.md` to the evidence file.
- Commit the panel summary only: `panel.json.gz` + the compare `.md`/`.json`. NEVER commit the `cases/` cache.
- A `review_required` or `regression_signal` on a secondary
  metric is an investigation note for the evidence file, never
  a license to re-score the run. The DIAG verdict is decided by
  (a)+(b)+(c) alone.

## Build gate (frozen) + overlap guard

**NO BUILD in this stage.** This is an instrument/DIAG arm.
The named next lever (let a trusted villager actually at
Haven stand as a wave-4+ companion) lives in
`villager-brain.js` / `win-plan.js`, held by the sibling arms
(`sim-pinquaddoor-b`, `sim-reseedexpiry-b`), and the lever
itself is BLOCKED on the held `sim-pinquaddoor-b` branch. Do
NOT touch `villager-brain.js`, `win-plan.js`,
`villager-objectives.js`, or `villager-agency.js`. Do NOT
touch Loop A's trees/branches. Do NOT touch the held
`sim-holderstate-b` / `sim-poolfirstfail-b` /
`sim-launchstate-b` / `sim-pinquaddoor-b` /
`sim-launchfield-b` / `sim-launchfield-refreeze-b` /
`sim-launchfield-rejudge-b` branches (read-only copy of the
approach only).

## Wall numbers (reported every run, both national definitions)

Wins, national by scaleRank ≥ 2, national by standing ≥ 200,
table seats, wave-4 unlocked, wave-5 unlocked, median survival,
total deaths, starvation deaths — recomputed by the analyzer
from each judged band's corpora (not copied). Also the
standing-199 stall count.

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote real `vetSays` lines and read at
least two holder-days end to end from the per-part ledger —
one scored day and one skipped day — saying in plain words
what the holder did at each part and whether the recorder's
story matches what the sim actually did. If a judged band has
zero scored parts, say so plainly and read the firing
field-encounter part(s) and one churn holder's days from the
raw corpora instead — and read every horizon-truncated part's
day end to end, quoting its rows, to show the truncation
attribution is the data pattern and not an assumption. Judge
meaning, coherence, consequences — never just counts. The
evidence carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. **No retroactive classification:** the 10 launcheng unknown
   days cannot be re-classified from their own corpora — the
   strikeband4 recorder never sampled per-part holder state.
   Only the judged bands are classified at per-part depth; the
   old 10 are reproduced (Leg R), never re-derived. Likewise
   the launchstate 2 parts are closed by the proof test's §3b
   re-read, not by a re-judgment of the old band.
2. **Perception flag unrecorded** (inherited): a reached
   refresh with a stale commit and no score/gate row stays
   `hs-unexplained`.
3. **Target matching is by TYPE, not instance** (inherited): a
   first fight against "the target" may be against a
   different individual of the target species. The fallback
   extends this honestly: the encountered monster need not be
   the plan target at all.
4. **Day granularity:** a same-day fight may precede the
   launch within the day (the family's convention, kept). The
   fallback attributes by day-match + elimination, so a part
   consumed by a NON-encounter cause on an encounter day could
   be mis-attributed if the holder also has a same-day
   encounter — the Haven-rows-absent condition (Haven rows at
   other parts, none at this part) bounds this, and the `enc`
   trace names the encounter so a reader can audit each
   attribution.
5. **The analyzer reuses frozen classifiers** (`classifySeed`,
   `funnelForSeed`, `launchesOf`/`firstFight`) — their
   definitions are not re-decided here except for the frozen
   §7.3 launch-counting decision (inherited), the two H
   extensions (inherited), the field-encounter fallback, and
   the horizon-exclusion clause above, each explicitly flagged
   wherever it changes a count vs the frozen taxonomy.
6. **Write flap:** intermittent EPERM on fresh-file writes has
   struck this program repeatedly — including during the held
   arm's build (the analyzer rename's temp-file write failed
   120/120 attempts over 10 minutes; a single-attempt direct
   write truncated the test file to 0 bytes, recovered
   byte-identical from the launchstate original via the file
   tools). Legs tee to a legs log (fallback recovery); writes
   are probed before they matter and verified by size/readback;
   a blocked final commit leaves files on disk intact for
   coordinator adoption, never forced. Single-attempt
   truncating writes are not used on irreplaceable files.
7. **Anchor scope:** the FROZEN BASE literal is the frozen base
   only while this branch forks from `4e805681a` with no
   merges; a rebase onto a newer master trips the driver's
   refuse check by design (re-freeze then, don't amend
   silently). The recorded anchor is a literal, so a rebase
   can no longer silently move it — the driver refuses instead.
8. **Taxonomy H** is inherited verbatim (B' + H-extended
   day-level reasons, incl. `hs-scholar-idle` and the
   churn-closing fallback `retarget-observed-holderstate`).
9. **Pilot + confirm cost:** each band is a full 8-seed 150d
   instrument run (~20 min/band on this box); the full 16-seed
   budget is ~40 min plus the two panel builds. Bands run
   sequentially in one process each, pilot first, confirm only
   on a pilot GO.

## Files

- Prereg: `evidence/2026-11-23/sim-launchfield-horizon-b-prereg.md` (this file)
- Instrument: `scripts/launchfield-horizon-driver-b.js`,
  `scripts/analyze-launchfield-horizon-b.js`,
  `scripts/test-launchfield-horizon-b.js`
- Corpora (pilot): `evidence/2026-11-23/perseed-launchfield-horizon-b-107439-107446/`
- Corpora (confirm): `evidence/2026-11-23/perseed-launchfield-horizon-b-107447-107454/`
- Analysis (pilot): `evidence/2026-11-23/launchfield-horizon-b-analysis.json`
- Analysis (confirm): `evidence/2026-11-23/launchfield-horizon-b-analysis-107447-107454.json`
- Panel (pilot): `evidence/2026-11-23/launchfield-horizon-b-panel-pilot/` (summary only)
- Panel (confirm): `evidence/2026-11-23/launchfield-horizon-b-panel-confirm/` (summary only)
- Panel compare: `evidence/2026-11-23/launchfield-horizon-b-panel.md`
- Reproduction corpora (existing, read-only):
  `evidence/2026-11-20/perseed-strikeband4-b-106241-106248/` (8 files)
- Old-band regression corpora (existing, read-only):
  `evidence/2026-11-21/perseed-launchstate-b-107301-107308/` (8 files)
