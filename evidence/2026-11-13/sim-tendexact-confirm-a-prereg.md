# Tendexact fresh-seed confirm — pre-registration (arm sim-tendexact-confirm-a)

Run fleshout-20261113T0515Z, Loop A, axis scale-onramp / winnability
chain. Written and committed BEFORE any judged sim. Base: the
collapse window's far end `203a32775` (firstparent leg 4/8 on the
matched band 190391–190398, INCONCLUSIVE). Candidate:
`tendexact` `e6911eb80` (hierarchy.js exact-split
`_removePantryKcal`, re-derived the healthy pole by count on the
matched band: 5/8 survived vs far end 4/8, regional 7/8, wave-5
4/8, median 150d — evidence
`evidence/2026-11-12/sim-optb-rederive-a.md`).

**Instrument-only arm — ZERO `src/js` changes committed.** This arm
re-runs the far end plus the tendexact candidate on a FRESH 8-seed
band, against the far-end baseline on the SAME fresh seeds.

## The question

The tendexact re-derivation was by count on the matched band, and
the +1 gap to the pole's 6/8 turned out (arm 1 diagnostic,
`gap-diag-draft-20261113T0455Z.md`) to be RNG-carried, not
design-carried. The remaining question for tendexact itself: does
the +1 generalize OFF the matched band, or was it also a dice
artifact of seeds 190391–190398? This arm answers it on fresh
seeds the re-derivation never touched.

## Band freshness (per the local_seed_band_freshness skill — full check done before any sim)

Chosen band: **190401–190408** (8 seeds).

- Searched all dated preregs: `grep -rn "19040[1-8]"` over
  `evidence/*/sim-*-prereg.md` (799 files) — **0 hits**.
- Searched all committed markdown under evidence:
  `git grep -l "19040[1-8]" -- 'evidence/**/*.md'` — **0 hits**.
- Searched script seed lists: `git grep -l "19040[1-8]" --
  'scripts/*.js'` — **0 hits**.
- Searched canon docs: `git grep -l "19040" -- 'docs/*.md'` —
  **0 hits**.
- Searched goal hidden_files for forbidden/contaminated lists
  naming the band — no forbidden or contaminated band list
  exists there; the only hits name 190401–190408 as THIS run's
  own preliminary band (coordinator draft
  `gap-diag-draft-20261113T0455Z.md`, round draft
  `sim-gap-round-0455-DRAFT.md`, convergence-tracker.md line
  30716) — the coordinator's preliminary grep, not a prior
  reservation.
- Known-used band deliberately avoided: **190419–190434** is the
  mcconfirm control band (named in
  `evidence/2026-11-11/sim-mcconfirm-ctrl-b-prereg.md`,
  `sim-mcconfirm-merge-b-prereg.md`, and
  `evidence/2026-11-12/sim-mcconfirm-refresh-b-prereg.md`).

**Verdict: band 190401–190408 is FRESH.** No earlier prereg,
forbidden list, contaminated list, screen, or extension band
names it.

## Legs (two, sequential, same seeds, same base)

| Leg | Configuration (far end + fix-swap, mode `fix` only) | Why |
|---|---|---|
| **`baseline`** | `203a32775` + roster-check fix swap, NO candidate | The far-end baseline on fresh seeds — the comparison the GO bar is judged against. No cherry-pick. |
| **`tendexact`** | `203a32775` + fix swap + `e6911eb80` cherry-picked `-n`, uncommitted | The re-derived mechanism: every tend/tribute/demand payment takes exactly what was asked (old whole-unit take over-paid 1500→1500–1901 per call). Canon grounding: docs/PRESERVATION.md — "No nonsensical calorie loss. Cooking or combining foods must never destroy calories that don't make sense." The over-payment destroyed pantry calories no rule asked for; the exact split pays exactly what's asked. |

Cherry-pick applicability was verified by the rederive arm (single
file, `src/js/hierarchy.js`, clean; added/removed lines identical
to the commit's diff) and is re-verified here at apply time. If
the cherry-pick conflicts at apply time, record the conflict,
abandon the leg, and judge on the baseline alone — never
hand-resolve a behavioral hunk.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190401–190408, tendexact
leg vs baseline leg, identical seeds, 150d death-aware, competent
verbatim, mode `fix` only.**

| Condition | Verdict |
|---|---|
| tendexact survives ≥ baseline+1 **AND** ≥5/8, **AND** median ≥ 0.8× baseline median, **AND** starvation ≤ baseline+2 | **GENERALIZES** — the tendexact +1 holds off the matched band |
| Any condition fails | **NO-GO** — the re-derivation does not generalize (the +1 was a matched-band artifact) |

All four conditions are conjunctive — the GO bar is the exact bar
in the arm brief. Starvation is counted from the per-seed death
records (`cause === 'starvation'`; the far-end-like r125 leg
showed exactly this string, 1 starvation death, in
`evidence/2026-11-12/optb-rederive-a-r125-summary.json`, while
the tendexact leg showed 0). Median is the analyzer's
`wall.medianDays` (median of per-seed `days`).

**Rank read (pre-registered alongside survival):** regional reach
on the same band, per leg:

| Outcome | Rank verdict |
|---|---|
| **≥5/8 regional** | **REGIONAL_INTACT** |
| **≤2/8 regional** | **RANK_STALL** |
| **3–4/8 regional** | **RANK_INCONCLUSIVE** |

The analyzer
(`scripts/tendexact-confirm-analyze-20261113.js`) judges the
tendexact leg against the baseline corpus and exits 0 only when
it can classify the outcome under the GO bar (any verdict +
any rank verdict is a classified outcome; exit 1 only on
instrument failure, corpus incompleteness, or an unclassifiable
read). The baseline leg alone is reported, not judged
(verdict `BASELINE`).

**Secondary (reported, not judged):** death-cause shares vs the
combat-heavy profile; wave-4/5 unlocks; national / table / wins;
standing range; tribute-ready (ladder read); phantom days (see
correction note below — shadow-exceeds-live during a collapse is
expected, not a failure); blooded count; peak living wave-4+
veterans per seed vs the bar of 2; end-pantry kcal per seed (the
tendexact mechanism's visible footprint on the matched band was
21,975 / 9,893 kcal end pantries — check whether the same
footprint appears on fresh seeds). **ARC IV firing per seed is a
REPORTED field only** — it is not judged and no threshold is set
on it (the instrument does not capture ARC IV; same standing as
r9/r10 §7 and the rederive prereg).

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  the matched band, so the survival counts are comparable.
- **Seeds: 190401–190408 (8 seeds) — FRESH** (see the freshness
  section above). Deliberately NOT the matched band: this arm
  tests generalization, and re-running 190391–190398 would
  answer nothing about it.
- **Policy: competent verbatim, mode `fix` only** (with the
  swap — see below). The driver enforces the leg guards
  (swap-aware standing guard + own-policy guard + candidate
  guard on the tendexact leg, all exact-match) and refuses to
  run otherwise. Policy confound notes (all verified by diff
  before any sim, not assumed — same as the rederive prereg):
  - `scripts/policies/competent.js` on `203a32775` vs
    `5157782a4` differs ONLY by the COUNTER_ANSWER block
    (env-gated OFF by default — inert; this run does not set
    it). The driver runs the far end's OWN policy (sha256
    `a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a`)
    and refuses any other sha.
  - `scripts/sim-harness.js` is byte-identical between the two
    poles — the comparison differs only in game code (plus the
    controlled standing.js swap, identical on both legs, plus
    the candidate cherry-pick on the tendexact leg).
- **Instrument:** `scripts/vetfirst-instrument-20261111.js`
  copied from the worktree base `dc95859a8` as UNTRACKED scratch
  (never committed — it already exists on master and committing
  a duplicate would break the later rebase; byte-identical to
  master, sha256
  `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`;
  deleted before finishing) + the driver's live shadow old-rule
  count per snapshot, exactly as vetphantom-driver and the
  bisect drivers. Driver:
  `scripts/tendexact-confirm-driver-20261113.js` — a clone of
  the rederive driver with the corpus dir parameterized by leg
  (`evidence/2026-11-13/perseed-tendexact-confirm-a-<leg>/`),
  RUN = `tendexact-confirm-pilot`, arm = `tendexact-confirm`,
  mode fixed to `fix` only, plus the swap-aware leg guard
  (exported `legGuard`, exact-sha), the own-policy guard
  (exported `legGuardPolicy`, exact-sha), and a per-leg
  candidate guard (exported `candidateGuard`, marker strings
  verified present at `5157782a4` and absent at `203a32775`
  before any sim; the baseline leg carries NO candidate and
  its guard is a no-candidate pass, recorded as
  `candidateApplied: null`). **`\belder\b` filter:** the driver
  carries the tightened veteran-say regex `\\belder\\b`
  (vetsays fix, landed `9a32925b3`), same as r9/r10 and the
  rederive driver.
- **Corpora:** `evidence/2026-11-13/perseed-tendexact-confirm-a-<leg>/`
  — 8 per-seed JSONs per leg; one summary JSON per leg
  (`evidence/2026-11-13/tendexact-confirm-a-<leg>-summary.json`).
- **Deep-identity comparison (pre-registered method):** the
  per-day signature is the 4-field tuple (vetsW3, vetsW4,
  waveKillLog length, roster length) — NOT deaths-so-far.
  Compare the tendexact corpus against the baseline corpus on
  the same fresh seeds (full daily-snapshot deep-diff). Veteran
  killers in the instrument are keyed `by`, not `vid` — a
  phantom check reading `k.vid` silently checks nothing.

## The fix-swap (read carefully — this base predates the roster-check fix)

At `203a32775`, `src/js/standing.js` is the PRE-FIX version
(sha256
`75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`,
hashed by this arm from `git show 203a32775:src/js/standing.js`
— same as the rederive prereg). Following the vetphantom-b swap
pattern (evidence/2026-11-11/sim-vetphantom-b.md §9–§10) and
the rederive prereg: the FIX `standing.js` is extracted with
`git show 5157782a4:src/js/standing.js`, its sha256 verified to
be exactly
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
swapped in UNCOMMITTED, run, then the far end's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`75762cb2259d…`) plus `cmp` clean plus `git status`
showing no `src/js` modification. The `standingSha` in use is
recorded per seed in the corpus. The swap keeps the comparison
apples-to-apples: both legs run WITH the roster check. **The
swapped file itself is never committed.** The driver refuses to
run unless the on-disk `standing.js` carries the "ROSTER CHECK"
marker AND its sha256 is exactly the fix sha — an unswapped run
is refused loudly, never mislabeled.

Two whole-file-swap notes, both verified before any sim by the
rederive arm (not assumed):

- **BLOODED rider, LIVE on this base.** The fix file differs
  from the far-end base's `standing.js` in exactly one hunk:
  the ROSTER CHECK — the BLOODED block is present in BOTH,
  because the wave5kill lever landed in `203a32775` itself.
  The swap introduces NO blooded delta at all: the only live
  behavioral delta the swap introduces is the roster check.
- **Ladder scholar rule — LEG 3, same as the rederive arm.**
  This base's `ladder.js _ladderLivingVeterans` is the old
  inline rule (`vp && !vp.dead`, no roster check) with the LEG 3
  tribute scholar-readiness fix layered on: the scholar is NEVER
  counted. The proof test detects which scholar rule the LOADED
  game carries from `_ladderLivingVeterans` source and asserts
  the matching count; the survival read comes from the harness
  end state, not the ladder. (The tendexact cherry-pick does
  not touch `ladder.js`, so this rule is the same on both legs.)

## Balanced panel (§15) — N/A

Instrument-only legs, no code change, no before/after pair to
compare on one base. The before/after comparison IS the
baseline leg vs the tendexact leg on identical fresh seeds,
judged by the analyzer's decision rule. Same standing as
survivalcontrol-b §7, anchor-a §7, merge-a §7, origin-a §7,
mergebase-a §7, r5-cut1-a §7, r5-cut2-a §7, r6-cut-a §7,
r7-cut-a §7, r8-cut-a §7, r9-cut-a §7, r10-cut-a §7, and the
rederive arm's §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the leg is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- The swap + the cherry-pick are the ONLY permitted uncommitted
  changes during a leg (plus the untracked instrument scratch).
  After the tendexact leg, the cherry-picked files are restored
  byte-identical (`git checkout -- src/js/hierarchy.js` +
  `git status` clean of `src/js` modification) AND the original
  `standing.js` is restored byte-identical (sha256
  `75762cb2259d…`) before any evidence commit. If a restore
  fails, FAIL LOUDLY and do not commit evidence.
- This arm does NOT re-judge any prior verdict (vetphantom GO,
  firstparent INCONCLUSIVE, r9-cut INCONCLUSIVE, r10-cut
  INCONCLUSIVE, rederive HEALTHY_POLE_REDERIVED by count) — it
  tests generalization of the tendexact +1 on fresh seeds only.
- Do NOT cut at commits 390–393 (the r10 remainder) or touch
  the stall window (commits 58–65) — other arms own those.
- The sibling Loop B arms and the sibling arm-2
  (sim-gap-candidates-a) run in their own worktrees; this arm
  does not touch them, and their verdicts do not change this
  leg's decision rules.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop A body step 10): attempted;
  prior bisect arms were REFUSED by the tool (recorder-corpus
  class). If refused again, recorded, not waived, baseline NOT
  rolled.
- Ancestry note: `203a32775` is an ANCESTOR of `5157782a4`
  (their merge-base is `203a32775` itself) and of the worktree
  base `dc95859a8` (verified by this arm before any sim) — do
  not assume a linear order between the healthy base and the
  local merge-tip. `ee30f22a2` (385th) is an ancestor of
  `203a32775`; `c67a17564` (389th) is an ancestor of
  `203a32775`; all verified by the rederive arm.
- Flap note: a host write flap (EPERM on git ref writes and
  some file writes) was ACTIVE earlier in this run (episodes
  from ~04:47Z, clear windows ~1–3 min) and was ALL-OK
  06:23–06:37Z at this arm's start (watcher log; probe `git
  update-ref refs/heads/probe HEAD` succeeded before every
  git write so far). If the flap returns mid-run, wait for it
  to clear rather than bypassing safe-commit; never route
  around a denial. safe-commit.sh on a DETACHED HEAD does not
  move HEAD (rederive precedent) — note the SHA the script
  prints and recover with `git reset --mixed <sha>`; the
  coordinator adopts by SHA.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the legs: did the metric set hold, or does
  a metric need revision for the NEXT run?)
- Correction carried from the rederive arm: phantom days are
  NOT "0 expected" — a collapsing village legitimately shows
  shadow-over-live days while its roster falls apart, and those
  days prove the swap works rather than failing it. This
  prereg defines phantom days as "live count exceeds shadow"
  (a real phantom) vs "shadow exceeds live during a collapse"
  (expected), and the field is report-only.
