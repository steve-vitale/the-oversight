# Tendexact fresh-seed confirm — evidence (arm sim-tendexact-confirm-a)

Run fleshout-20261113T0515Z (Loop A), axis scale-onramp /
winnability chain. Prereg:
`evidence/2026-11-13/sim-tendexact-confirm-a-prereg.md` (read it
first — it governs everything below: fresh band, GO bar, run
mechanics). Base: the collapse window's far end `203a32775`.
Candidate: `tendexact` `e6911eb80` (hierarchy.js exact-split
`_removePantryKcal`), which re-derived the healthy pole BY COUNT
on the matched band 190391–190398 (5/8 vs far end 4/8).
Instrument-only arm — ZERO `src/js` changes committed.

## Verdict

**NO-GO — the tendexact +1 does NOT generalize off the matched
band.** On fresh seeds 190401–190408 the tendexact leg survives
**0/8**, against the far-end baseline's **1/8** on the same seeds.
It fails the GO bar's first two conditions outright (0 ≥
baseline+1 = 2, and 0 ≥ 5/8); the median and starvation
conditions pass but cannot rescue a count of zero.

| Leg | Configuration | Survived | Rank | Median | Wave 5 | Verdict |
|---|---|---|---|---|---|---|
| `baseline` | far end `203a32775` + fix swap, no candidate | **1/8** | 8/8 REGIONAL_INTACT | 81d | 2/8 | **BASELINE** |
| `tendexact` | far end + fix swap + `e6911eb80` | **0/8** | 8/8 REGIONAL_INTACT | 81d | **0/8** | **NO-GO** |
| (matched band, for reference) | far end | 4/8 | — | 150d | 2/8 | INCONCLUSIVE (prior) |
| (matched band, for reference) | far end + tendexact | 5/8 | 7/8 REGIONAL_INTACT | 150d | 4/8 | HEALTHY_POLE_REDERIVED by count (prior) |

GO bar check (prereg, all conjunctive): survived 0 vs
baseline+1 = 2 and ≥5 — **FAIL**; median 81d vs 0.8× baseline
64.8d — pass; starvation 2 vs baseline+2 = 3 — pass. Verdict
follows the count: NO-GO.

Wall numbers (tendexact leg): survived 0/8, regional 8/8,
national 0/8, table 0/8, wins 0/8, wave-4 unlocks 8/8, wave-5
unlocks 0/8, median survival 81d, deaths 667, standing range
125–199, blooded 2/8, tribute delivered 0/8 (ready on none).
Death causes (667): villager combat 272, expedition 159,
combat 119, the wild 74, monster 18, sickness 4, the arena 5,
starvation 2, thirst 1, a wound that wouldn't close 2, ambush
2, contest 2, a stranger 2, Big Ugly 1, Ugly-Eyes 1, The Focus
Group 1, Gavel 1, lockjaw 1 — combat-dominated, as on both
poles and on the matched band. Starvation 2 (baseline 1) is
within the bar and is not the story.

## Per-seed table (days / outcome / standing / maxWave / end pantry)

| Seed | Baseline (far end) | Tendexact |
|---|---|---|
| 190401 | lost d108 / 199 / w4 / 0 | lost d108 / 199 / w4 / 0 — **identical** |
| 190402 | lost d81 / 175 / w4 / 0 | lost d81 / 175 / w4 / 0 — **identical** |
| 190403 | lost d80 / 199 / w4 / 0 | lost d81 / 199 / w4 / 0 — +1 day |
| 190404 | lost d144 / 425 / w5 / 18,801 | lost d118 / 199 / w4 / 4,358 — **negative** (−26d, loses wave 5) |
| 190405 | lost d81 / 199 / w4 / 0 | lost d80 / 199 / w4 / 4,750 — −1 day |
| 190406 | **survived 150d / 400 / w5 / 1,600** | lost d131 / 199 / w4 / 0 — **negative (kills the survivor)** |
| 190407 | lost d78 / 160 / w4 / 30,830 | lost d78 / 160 / w4 / 30,830 — **identical** |
| 190408 | lost d70 / 125 / w4 / 0 | lost d70 / 125 / w4 / 0 — **identical** |

Read the verdict honestly: tendexact does not merely fail to
save seeds on this band — it takes two away. 190406 is the
baseline's only survivor (150d, standing 400, wave 5) and
tendexact loses it d131; 190404 loses 26 days and its wave-5
unlock. The other five seeds move by a day or not at all.
The matched-band pantry footprint does NOT reproduce: on the
matched band tendexact ended holding 21,975 / 9,893 kcal on
its two saved seeds; here it ends with LESS pantry than the
baseline on both meaningfully diverged seeds (190404: 4,358
vs 18,801; 190406: 0 vs 1,600) and identical on the rest.
The savings are real in the code (the exact split pays what
was asked) but on this band they do not compound into
survival — the villages die in the d70–d131 fight cluster
before a pantry edge can matter, and where the trajectories
do split, the split runs against tendexact.

## What the mechanism did (deep-identity comparison)

Per-day 4-field signature (vetsW3, vetsW4, waveKillLog length,
roster length) + full daily-snapshot deep-diff, tendexact corpus
vs baseline corpus on the same fresh seeds. Full output:
`evidence/2026-11-13/tendexact-confirm-a-deepdiff.log`.

- **190401, 190402, 190407, 190408: DEEP-IDENTICAL on every day**
  — not one daily snapshot differs on any of the four seeds.
  Tendexact is behaviorally inert on half the band: no
  tend/tribute/demand payment lands differently enough to move
  a single snapshot. The NO-GO on these seeds is mechanical,
  not statistical — the same class of finding as the rederive
  arm's L1/L2 deep-identity NO-GOs.
- **190403:** first divergence d76 (roster 7 vs 6 — a death
  moves a day); 6/80 sig-diff days. Small, late, no survival
  change.
- **190404:** first divergence d68 (full-diff) / d69
  (signature: vetsW4 1 vs 0, waveKillLog 50 vs 49); 50/142
  sig-diff days. The tendexact trajectory loses the village
  26 days earlier and never reaches wave 5.
- **190405:** first divergence d79 (roster 3 vs 2, the
  last-day death moves); 2/79 sig-diff days. Trivial.
- **190406:** first divergence d37 — an extra wave-3 kill on
  tendexact (Somchai Prasert puts down The Callback; the
  baseline never gets that kill, Pongsak's Chorus Line kill
  lands d40 instead); 94/149 sig-diff days. The extra early
  veteran does not save the village — tendexact loses d131
  while the baseline survives. Same signature as the matched
  band: every first divergence is a fight outcome or a roster
  move — never pantry, knowledge, or party first.
- **Phantom days: 0 real phantoms on every seed** (live count
  never exceeds the shadow old-rule count on the tendexact
  leg; shadow exceeds live 0 days too — this band's villages
  die fast without the collapse-spiral pattern the rederive
  arm saw on 190394). The swap did its job; the prereg's
  corrected phantom definition held.
- The `waveKills` COUNTER diverges from the LOG on 7/8 seeds
  (first divergence d16–d108, counter 1–3 above the log) —
  the vetcount-reconcile footprint, telemetry-only, as the
  prereg predicted. 190408 never diverges.

## Secondary fields (reported, not judged)

- **Peak living wave-4+ veterans vs the bar of 2:** baseline
  reaches the bar on 190404 (2) and 190406 (3); tendexact
  reaches it only on 190404 (2). 190406's collapse from peak
  3 to peak 1 is the wave-5 choke in miniature: the tendexact
  trajectory never holds 2 living wave-4 veterans, so the
  wave-5 door never opens on that seed. The other six seeds
  peak at 0–1 on both legs.
- **Tribute:** never ready on any leg, either seed. Ready
  0/8 on both legs (veterans-short everywhere). The ladder's
  LEG 3 scholar-never-counts rule still governs this base, as
  the prereg predicted.
- **Blooded:** 2/8 on the tendexact leg (190404, 190406) vs
  2/8 on the baseline (190403, 190406) — same count,
  different seeds. The swap introduced no blooded delta, as
  predicted.
- **ARC IV:** report-only per the prereg. It DOES fire on
  this base: 8 lines on each leg, including 190406 d55 ("ARC
  IV — THE INEFFICIENCY... ROUNDING ERROR RECLASSIFIED:
  ANOMALY"). Same count on both legs; not judged, no
  threshold set.
- **End pantries** are in the per-seed table above. 190407
  dies d78 holding 30,830 kcal on BOTH legs — the classic
  "dies fighting with a full pantry" profile, identical to
  the digit.

## Sense-testing (transcripts)

Veteran lines on the tendexact leg read coherent and
consequential (sampled 190406, 20 vetSays; 190404, 29):
door-defense beats name the fighters and the hurt ("Robin,
Sami, Mia and James met them at the door — 4 put down.
Robin, Sami, Mia, James are hurt."); veteran kills are
announced on camera with names ("Somchai just put down The
Callback... on CAMERA. That's a veteran kill, folks. REMEMBER
the name."); wave-5 monsters are named in the fiction ("Say
hello to the MIRROR DRAFT."). Early-day lines use
description-first naming ("A man, maybe 60s, with a scarred
cheek heads out to forage...") — knowledge-gating, the
scholar not yet knowing his name; coherent, not robotic.

Two base artifacts, both present identically on the baseline
leg (not tendexact findings, not new):

- **Pack-leader freeze line repeats ~60 times:** "The
  Pack-leader The Focus Group is still frozen from your sc…"
  fires 63 times on the baseline leg (63 on tendexact) — same
  day, same line, repeated — dwarfing every other repeated
  line (next: the Blooded line ×2, one double veteran-kill
  announcement). The freeze is re-announced per fighter/tick
  instead of once. Appended to the findings backlog as
  `[open] 2026-11-13` (old base only — needs a current-master
  check before any fix).
- **Double veteran-kill announcement:** the baseline 190406
  corpus announces Pongsak's Chorus Line kill twice on d40
  (identical line, twice). One instance; same family as the
  freeze repetition.

No robotic, static, or repeated dialogue surfaced in the
sampled lines beyond those two artifacts.

## Proof + tooling (what was built this run)

Tooling is a clone of the rederive arm's, adapted for the
fresh band and the two-leg (baseline + tendexact) design
(tooling commit `e79509a7`, parent `203a32775`):

- The **driver** (`scripts/tendexact-confirm-driver-20261113.js`)
  is the rederive driver with legs `baseline` /
  `tendexact`, corpus dir
  `evidence/2026-11-13/perseed-tendexact-confirm-a-<leg>/`,
  RUN `tendexact-confirm-pilot`, and a no-candidate pass for
  the baseline leg (`candidateApplied: null`). Same
  swap-aware leg guard, own-policy guard, candidate guard on
  the tendexact leg, writeRobust flap-proof writes,
  `\belder\b` veteran-say filter.
- The **analyzer**
  (`scripts/tendexact-confirm-analyze-20261113.js`) judges
  the tendexact leg against the baseline corpus under the
  full conjunctive GO bar (survived ≥ baseline+1 AND ≥5/8,
  median ≥ 0.8× baseline median, starvation ≤ baseline+2),
  with the rank read alongside; the baseline leg alone is
  reported as `BASELINE`, not judged. Starvation is counted
  from the per-seed death records (`cause === 'starvation'`).
- The **proof test** (`scripts/test-tendexact-confirm-a.js`)
  ran **87/0 green** (exit 0) on the far-end checkout with
  the fix swapped in — instrument validity (engine vs ladder
  vs instrument, alive + fallen + scholar rule), fresh-band
  identity (190401–190408), leg guard (fix accepted, pre-fix
  refused, wrong-sha refusal by real subprocess), corpus
  completeness, the GO bar case-by-case (3 GENERALIZES cases
  incl. the starvation boundary at baseline+2 exactly, 6
  NO-GO cases incl. the median and starvation bars, 2
  UNCLASSIFIABLE cases), the rank read, and the candidate
  guard (tendexact marker present at `5157782a4`, absent at
  `203a32775`; baseline is a no-candidate pass). Two
  adaptation bugs were caught and fixed by the proof itself
  before any judged sim: a mangled quote in the §2
  corpus-path checks (runtime `LEG is not defined`), and
  `judge()` dereferencing a null leg analysis (missing-leg
  UNCLASSIFIABLE now guards the rank read too).
- The **fix-swap and own-policy shas** were verified by hand
  before any sim: standing.js pre-fix `75762cb2259d…` → fix
  `f8fda4295a99…`; competent.js `a7ff5c516440…`; instrument
  scratch byte-identical to the worktree base (`311f105bc15f…`).
- The **cherry-pick** `e6911eb80 -n` applied cleanly (auto-merge
  on `src/js/hierarchy.js`); the staged `src/js` diff was
  verified line-identical to the commit's `src/js` diff before
  the leg ran. The pick also staged the commit's own tooling
  scripts (`scripts/tendexact-{analyze,driver}-20261110.js`,
  `scripts/test-tendexact-a.js`) — inert, never loaded by the
  driver; deleted after the leg, never committed. After the
  tendexact leg the pick was reverted (`git reset --mixed HEAD`
  + `git checkout -- src/js/hierarchy.js src/js/standing.js`
  + `rm` of the three scripts) and both files were verified
  byte-identical to HEAD (standing.js `75762cb2259d…`,
  hierarchy.js `bf01918c451a…`).

## Run incidents (recorded, not hidden)

- **Host write flap:** the flap-watch log read ALL-OK
  throughout this arm (06:23–06:37Z at start, probe `git
  update-ref refs/heads/probe HEAD` succeeded before every
  git write). No flap episode touched this run. The earlier
  04:47Z episodes had cleared before the arm started.
- **safe-commit.sh on detached HEAD:** the tooling commit
  `e79509a7` was created but HEAD did not move — the script
  failed `update_ref` for `refs/heads/` (empty branch name on
  a detached HEAD) and reported the commit while leaving HEAD
  at `203a32775`. Recovered with `git reset --mixed e79509a7`
  (index-only move; worktree untouched; standing.js swap and
  instrument scratch verified intact afterwards). The same
  quirk will strike the evidence commit below; the coordinator
  should adopt by SHA (see §9).
- **Telemetry deviation check:** attempted per loop body step
  10 — REFUSED by the tool ("refusing recorder-corpus input:
  all 8 --current rows carry top-level anchorCommit, so they
  are sweep recorder rows, not runs"), exactly as the prereg
  predicted and as prior bisect arms were refused. Recorded,
  not waived; the baseline was NOT rolled. No LOUD lines exist
  to investigate (the tool refused the input class entirely).
- **Instrument scratch:** `scripts/vetfirst-instrument-20261111.js`
  was copied from the worktree base as untracked scratch per
  the prereg and deleted before finishing (it already exists
  on master; committing a duplicate would break the later
  rebase).
- **No runtime restarts, no incomplete corpora, no instrument
  errors** on either leg (0 errors on all 16 seeds).

## Metric review (§14 — metrics held, one correction owed)

- The primary metric (survived count on the fresh band,
  judged against the baseline on identical seeds) held: it
  separated the legs cleanly (1/8 vs 0/8) and the
  deep-identity comparison gave the NO-GO a mechanical
  explanation (4/8 seeds deep-identical — the candidate never
  moved a single daily snapshot there — and the two diverged
  seeds moved against tendexact). No re-scoring happened:
  the median and starvation conditions passed and were
  reported as passing, not substituted as the verdict.
- The rank read (regional ≥5/8) held but did not
  discriminate: both legs read 8/8 REGIONAL_INTACT while
  survival moved. Regional reach is not the binding
  constraint on this band — survival is. (Same non-discrimination
  as the rederive arm.)
- **Correction owed for the NEXT run:** the fresh band
  190401–190408 is much harsher than the matched band (far-end
  baseline 1/8 here vs 4/8 there; median 81d vs 150d). The
  GO bar's absolute ≥5/8 condition is the binding one on a
  harsh band — a candidate that saves 2 seeds over a 1/8
  baseline still fails it. The next confirm arm should
  either pre-register the absolute bar against a band whose
  baseline is known to be near the matched band's difficulty,
  or judge the +1 relative to baseline with the absolute bar
  as a secondary read. This run's bar was set before the
  baseline was known (correctly — the baseline is measured,
  not assumed), and the NO-GO stands under the bar as written.
- The pre-pilot substrate checks (§14b) were satisfied by the
  prereg's own divergence analysis (contact: the tendexact
  code path fires on every tend; pool: the over-payment is
  measured 1500→1500–1901; verb: `_removePantryKcal` exists;
  horizon: 150d contains the d37/d68 divergences).
- Kill taxonomy (§14a) for the NO-GO: **CONCEPT-DEAD on
  fresh seeds** — the mechanism was staged (markers present,
  guards green), the metric was fair, and the concept failed
  on its merits: on half the band it never moved a snapshot,
  and where it moved trajectories it moved them against
  survival. Do not retry tendexact as a survival carrier on
  fresh bands without a new mechanism (e.g. evidence that the
  pantry savings actually reach the fight cluster on the
  seeds that die). The matched-band +1 stands as measured
  there; it does not generalize.

## Convergence state

**NO-GO — the tendexact re-derivation does not generalize.**
The healthy pole's +1 (by count, 4/8 → 5/8 on the matched
band) is a matched-band result: on fresh seeds the same
transplant goes 1/8 → 0/8, kills the baseline's only survivor,
and is inert on half the band. Together with arm 1's finding
that the remaining +1 gap to the pole's 6/8 is RNG-carried,
the option-B re-derivation now reads: tendexact carries +1 on
the seeds it was measured on and nothing off them. The
scale-onramp axis itself is **converging, not converged**:
national 0/8, table 0/8, wins 0/8 on both legs — tendexact
moves neither survival nor scale on fresh seeds. The next
run's work, narrowed by this arm: the option-B search is
complete (L4 `grants` remains the only untested candidate
from the rederive list, and it was already the weakest
design mechanism with a genuinely ambiguous net direction);
the scale wall needs a lever whose effect is visible on
fresh bands, not a matched-band recount. **No
`[needs-eyes]`** — this arm is instrument-only; no game
code is committed, no feel/combat/UI change exists to
playtest.

## Corpora + summaries

- `evidence/2026-11-13/perseed-tendexact-confirm-a-baseline/` (8 JSONs)
- `evidence/2026-11-13/perseed-tendexact-confirm-a-tendexact/` (8 JSONs)
- `evidence/2026-11-13/tendexact-confirm-a-baseline-summary.json` (BASELINE)
- `evidence/2026-11-13/tendexact-confirm-a-tendexact-summary.json` (NO_GO)
- `evidence/2026-11-13/tendexact-confirm-a-deepdiff.log` (deep-identity comparison)
- Driver logs: `tendexact-confirm-a-{baseline,tendexact}-driver.log`
- Tooling commit: `e79509a7` (parent `203a32775`; prereg + driver
  + analyzer + proof, 87/0 green). Evidence commit: see §9.

## §9 — adoption note for the coordinator

This worktree is on a **detached HEAD**. The tooling commit is
`e79509a7` (parent `203a32775`); the evidence commit is a second
commit on the same detached HEAD (created by safe-commit.sh,
which does not move HEAD when detached — recover it the same
way: note the SHA it prints, then `git reset --mixed <sha>`).
**Do NOT merge this work to local master via --ff-only from
this arm:** the commits descend from `203a32775`, an ancestor
of master, not a descendant — a fast-forward merge is not
possible. Adopt by cherry-picking the two SHAs onto master
(the rederive arm's precedent: tooling `205ab6eae`,
evidence commit likewise dangling). Nothing here was merged,
pushed, or version-bumped. The instrument scratch
(`scripts/vetfirst-instrument-20261111.js`) was deleted before
finishing; the worktree contains only committed work plus the
evidence corpora in the evidence commit.
