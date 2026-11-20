# sim-dmgcheck-b — PREREG (frozen before any judged sim)

**Arm:** sim-dmgcheck-b · **Loop B run:** fleshout-loop-b-20261120T1830Z · **Axis:** winnability chain
**Type:** DIAG check, instrument-only. No game-code change, no default flipped, no lever built.
**Branch:** `sim-dmgcheck-b` · **Worktree:** `~/workspace/worktrees/sim-dmgcheck-b`
**Base at arm start:** master `e103a64cc` (journey-crisis r257 adoption closeout).
**Frozen:** 2026-11-20 ~18:47 UTC, BEFORE any judged sim.
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
(first 12: `1884c8852d38`; git blob `aaf5e31ac`).
**Band:** 106181–106188 (8 seeds) · **Horizon:** 150d death-aware.

## The question (finding #2627 — the launch drought)

sim-dmgsurvey-b (base `c75503d6f`) designated band 106181–106188:
**16 launches, 9 launched first-fights (6 distinct), 6 fled**, on the
seven-flag substrate under policy `150229eda010`. sim-strikeband-b
(base `057bfa60f`) then screened three FRESH bands and found a launch
collapse: **9 launches / 24 seeds (0.375/seed), best band 2
first-fights**, against the survey's 40 launches / 32 seeds
(1.25/seed). The strikeband evidence reads the collapse as band
variance on a lumpy launch engine — the only `src/` change between
the survey base and the strikeband base was a conversation.js
gossip-ask fix, which touches no launch code — but it is a reading,
not a proof: the two surveys ran on different seed sets, and the
launch engine's band-to-band variance is itself unmeasured
(dmgsurvey's bands ranged 6–16 launches; strikeband's ranged 1–6).
This arm is the cheap decisive check the strikeband metric review
(§7.3) calls for: re-run the dmgsurvey instrument VERBATIM on ITS
designated band (106181–106188) on THIS base and compare launch
counts. If the band still launches ~16 times, the 1530Z collapse
was band variance. If it drops, something in the base moved the
launch engine and the diff is the story.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-20/sim-dmgsurvey-b.md` + prereg — the survey
  instrument and its designation on this band (16 launches, 9
  first-fights, 6 fled on the survey substrate).
- `evidence/2026-11-20/sim-strikeband-b.md` +
  `sim-strikeband-b-survey-prereg.md` — the 1530Z collapse (3 fresh
  bands, 9 launches / 24 seeds, best band 2 first-fights) and the
  survey protocol.
- `docs/CANON.md`, `docs/MONSTER-WAVES.md` — read first; wave-4
  bands (damage 35–95, HP 850–1500) and the readiness bars are
  canon, not re-invented. No canon doc covers expedition
  destination picking (haventarget CANON GAP, inherited).

## The policy changed — and what the diff does (launch relevance)

competent.js changed (+48/-2) between the strikeband base
`057bfa60f` and this base `e103a64cc`, in a single commit
`0d38a74d1` (journey-landing r149). The diff is three changes, all
inside the SCHOLAR's in-fight step helpers:

1. `beastDodgeReachable` (new helper) + its use in
   `beastDodgeMove`: skip a dodge candidate the scholar cannot
   reach (no path, or path cost over `moveLeft`), and stop the
   scan at once when the move budget is spent. The panel's
   seed-1277 d21 fight had burned 33 refused moves in one turn.
2. `closeStep`: skip a candidate with NO path at all (previously
   only over-budget paths were stepped along); the seed-1277 d25
   fight had burned 14 refused approach steps from the walled-in
   corner (8,8).
3. `beastStrikeTarget`: same no-path skip for strike-approach
   candidates (no panel evidence yet — same code shape, same
   corner).

Launch relevance, recorded before freezing: **none of the three
changes touches launch formation.** Launch decisions live in
`win-plan.js` / `villager-brain.js` (dawn bids, party formation,
target picking) — and the `src/` diff `057bfa60f..e103a64cc`
contains NO change to any launch file at all: only `build.js`
(a version-stamp line) and `convo-beats.js` (four extra
goal-bridge dialogue lines). The policy changes can only reach
the launch question INDIRECTLY, through fight outcomes: the
scholar wastes fewer refused turns inside a fight, so a launched
party that includes the scholar may deal more damage / flee less
often. Launch COUNTS and first-fight EXISTENCE — the judged
metrics here — should be unaffected by a fight-step helper. That
is exactly what this check tests: if launches hold at ~16 on
this band under the new policy, the collapse was band variance
and the fight-step change is launch-neutral as expected. If
launches drop anyway, the diff above is NOT the story (it cannot
move launch formation) and the call is a bisect of
`057bfa60f..e103a64cc` — which this arm does NOT perform.

## Substrate (env flags — same as the dmgsurvey prereg; verify, don't guess)

`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`,
competent verbatim (sha `1884c8852d38`), 150d death-aware, one leg
(recorder ON). Five of the seven flags are env-gated on master on
this tip (verified by the proof test): SENSEEXPED
(`party-wiring.js`), PARTYSIZE4 (`villager-brain.js`,
`win-plan.js`), VETREENGAGE (`game.js`, `villager-brain.js`,
`win-plan.js`), FLEEREPAIR2 (`win-plan.js`), FIGHTALLY2
(`fieldFights.js`, `party-wiring.js`). LAUNCHSURVIVE is
driver-local (the launch tracker rows; no game-code read — same
as the dmgsurvey and strikeband drivers).

**ALLYSLOT3 DISCREPANCY (verified, not assumed): ALLYSLOT3 is
STILL NOT landed on master `e103a64cc`.** The port commit
`f4d1100ee` is NOT an ancestor of HEAD
(`git merge-base --is-ancestor f4d1100ee HEAD` = no), and
`src/js/` contains ZERO occurrences of `ALLYSLOT3` or
`ally3Vid` (`grep -rn` over `src/js/`). Same situation as the
survey and the strikeband screen. The leg command still sets
`ALLYSLOT3=1` (frozen substrate), but the flag is unread by game
code on this tip — the driver asserts the ENV var is set and
records `allyslot3InSrc: false` on every corpus
(self-describing, never silent). **ZERO `src/js` changes in this
arm** (instrument-only, per the brief). The check's metrics are
launch counts and first-fight EXISTENCE, which the slot cannot
change (it gates only ally3's in-fight damage, never launch
formation or whether a fight is fought). The designation under
test was measured on this same set-but-unread substrate, so the
comparison is apples-to-apples.

## Leg (one leg, recorder ON)

One leg on band 106181–106188, differing from the dmgsurvey leg
on that band ONLY by base + policy (see above). No OFF leg
(launchfunnel-a already established the master-default funnel is
dry) and no REC leg (D1/D2 neutrality proven for this instrument
family by launchfunnel-a/b, dmgsurvey-b, and strikeband-b,
re-proven for this copy at 30d by the proof test). The leg's
stdout is tee'd to `evidence/2026-11-20/dmgcheck-b-legs.log` so a
`@@FALLBACK` corpus dump (write-flap fallback) is recoverable
from the log, per the rageholder-survey-b precedent.

## Instrument (reused, not rebuilt)

- `scripts/dmgcheck-driver-b.js` — a copy of
  `scripts/dmgsurvey-driver-b.js` with ONLY these changes:
  header comment, arm/run `dmgcheck-b` (out object + file names
  `dmgcheck-b-s<seed>-dmgcheck-b-vre.json`), stop-message prefix
  `DMGCHECK`, driver-filename strings in
  `firstCallerFrame`/`fightOrigin` updated to this file, and the
  `ALLYSLOT3 unexpectedly present` stop kept verbatim. The MODE
  guard stays `MODE=vre`; all substrate assertions stay; all
  recorder logic is byte-identical in behavior.
- `scripts/analyze-dmgcheck-b.js` — a copy of
  `scripts/analyze-dmgsurvey-b.js` with ONLY these changes:
  arm/run `dmgcheck-b`, output
  `evidence/2026-11-20/dmgcheck-b-survey.json`, and the judge
  extended to the three-way dmgcheck verdict (see Decision bars):
  `dmgcheckVerdict` computes BAND VARIANCE / BASE REGRESSION /
  INCONCLUSIVE from the band's launches + first-fights, with
  selftest §D fixtures; the survey counting (`firstFightStats`,
  `bandOf`, `rankBands`, the survey `judge`) is verbatim. The
  analyzer exits 0 iff the verdict is BAND VARIANCE, 1 otherwise
  (regression and inconclusive both need coordinator action),
  and always writes the JSON.
- `scripts/test-dmgcheck-b.js` — proof (mirrors
  `scripts/test-dmgsurvey-b.js`): §1 static (frozen base
  resolves to `e103a64cc`, src diff 0, substrate gates present,
  ALLYSLOT3 absent from src, instrument = the 3 new files only,
  driver arm/filename strings, analyzer exports incl. the new
  `dmgcheckVerdict`, selftest green) + §2 first-fight counting
  fixtures + §3 funnel taxonomy fixture + §4 live 5d shape run
  on check seed 106181 + §5 D1/D2 at 30d on 106181 under the
  full substrate. The live run's policy sha check expects
  `1884c8852d38`.

## Counting (frozen definitions — dmgsurvey prereg verbatim)

- **Wave-4+ launch (event):** a `v4departs` row with `result:
  'launch'` and `(targetWave | 0) >= 4`. One row per launch
  (paths exclusive — brain-owns-dawn → `vbrainExecuteDepart`
  only, else `winPlanDepart`). A holder re-launching on a later
  dawn counts again.
- **Quad launch:** a wave-4+ launch with `partySize >= 4`
  (holder + 3 companions).
- **Launched first-fight (primary metric):** for each launch, the
  earliest `v4encounters` row with `mid === launch.target`
  (the monster TYPE id — the recorder carries no instance id),
  `day` in `[launch.day, launch.day+21]` (the family's 21-day
  window), fought (`rounds > 0` or `mDealt > 0`), ANY origin
  (expedition, world-tick, aid, patrol, other), ANY fighter
  (the launched party or any other party that meets the target
  first). Earliest day wins; file order breaks a same-day tie
  (the recorder appends chronologically). Two launches against
  the same target type may share one first fight — each launch
  maps to its own first fight; the count of distinct fights is
  reported beside the count of launches. A launch with no such
  row in its window has no first fight and does not enter the
  population. This is the dmgshape-rerun-b definition verbatim
  (the 0030Z decision: "first fight against the launch target,
  any origin").

## Primary metric (frozen)

Launches + first-fights + fled first-fights on band
106181–106188, judged against the dmgsurvey designation on the
same band: **16 launches, 9 first-fights, 6 fled**.

## Decision bars (frozen — a miss is never re-scored)

- **BAND VARIANCE:** launches >= 12 AND first-fights >= 6 →
  the 1530Z collapse was band variance; the launch engine did
  not move with the base. Next step is the 4th-band screen
  106241–106248 (coordinator-authorized, fresh prereg).
- **BASE REGRESSION:** launches <= 8 OR first-fights <= 3 →
  the base moved the launch engine. Report the call for a bisect
  of `057bfa60f..e103a64cc` — do NOT bisect in this arm.
- **INCONCLUSIVE:** between the bars (e.g. 9–11 launches with
  4–5 first-fights, or launches >= 12 with first-fights 4–5) →
  report as INCONCLUSIVE, never re-score against a friendlier
  metric. The bar question goes in "metric review".

Instrument-validity bars (same as the survey): funnel taxonomy
complete (**0 `unknown`**); all files parse (8/8); 0 instrument
errors; proof test green; analyzer selftest green; D1
repeatability + D2 wrap neutrality green (30d, check seed
106181, full substrate). A failure on any of these is an
instrument failure, not a verdict — report it as such and do
not judge the band.

## Wall numbers (reported every run, both national definitions)

Wins, national by scaleRank ≥ 2, national by standing ≥ 200,
table seats, wave-4 unlocked, wave-5 unlocked, median survival,
total deaths, starvation deaths — for the 8 seeds. Also the
standing-199 stall count (the visible ceiling on the prior
bands: 15/32 at exactly 199 in the dmgsurvey survey).

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote real `vetSays` lines and at least one
launched first-fight end to end (or, if the band launches
nowhere, the nearest launch-adjacent fight lines the corpora
carry). Judge meaning, coherence, consequences — never just
counts. The evidence carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. **ALLYSLOT3 set-but-unread** (see above): the check judges
   launch counts and first-fight existence, which the slot
   cannot change. The comparison is apples-to-apples with the
   designation, measured on the same set-but-unread substrate.
2. **Target matching is by TYPE, not instance** (dmgshape-rerun-b
   metric review): a first fight against "the target" may be
   against a different individual of the target species than
   the one the plan tracked. The evidence names the target type
   beside every first fight so this stays auditable.
3. **Day granularity:** a same-day fight may precede the launch
   within the day (the analyzer sees days, not parts). The
   family's convention (day >= launch.day) is kept; same-day
   first fights are flagged in the per-launch table.
4. **Survey corpora carry no decomposition fields** (no
   `roundsDetail` on encounter rows — the launchfunnel recorder
   shape). The check judges COUNTS only; no damage
   decomposition is judged here.
5. **Launch rate is substrate-sensitive** (finding #2616): the
   verdict holds under the check substrate (seven flags as run,
   policy `1884c8852d38`, base `e103a64cc`). A re-run under a
   different flag set or policy must re-verify, not assume.
6. **One band, one comparison.** The check decides variance vs
   regression for THIS band on THIS base. It does not measure
   the launch engine's band-to-band variance — that remains
   unmeasured (dmgsurvey bands 6–16 launches, strikeband bands
   1–6). A BAND VARIANCE verdict does not prove the engine is
   healthy; it proves this band still launches on this base.
7. **Write flap:** intermittent EPERM on fresh-file writes has
   struck this program repeatedly (quiet on the strikeband run,
   active earlier on 2026-11-20). The leg tees to
   `dmgcheck-b-legs.log` (fallback recovery); writes are probed
   before they matter and verified by size/readback; a blocked
   final commit leaves files on disk intact for coordinator
   adoption, never forced.

## Files

- Prereg: `evidence/2026-11-20/sim-dmgcheck-b-prereg.md` (this file)
- Instrument: `scripts/dmgcheck-driver-b.js`,
  `scripts/analyze-dmgcheck-b.js`, `scripts/test-dmgcheck-b.js`
- Corpora: `evidence/2026-11-20/perseed-dmgcheck-b-106181-106188/`
  (8 files)
- Survey: `evidence/2026-11-20/dmgcheck-b-survey.json`
- Evidence: `evidence/2026-11-20/sim-dmgcheck-b.md`
- Leg log: `evidence/2026-11-20/dmgcheck-b-legs.log`
- `src/` diff: 0 lines (DIAG, recorder wraps only).
