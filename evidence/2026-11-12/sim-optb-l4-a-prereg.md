# L4 `grants` leg — pre-registration (arm sim-optb-l4-a)

Run fleshout-20261113T0215Z (Loop A), axis scale-onramp / winnability
chain. Written and committed BEFORE any judged sim. Parent arm:
`evidence/2026-11-12/sim-optb-rederive-a-prereg.md` and
`evidence/2026-11-12/sim-optb-rederive-a.md` (read them first — they
govern the mechanics; this prereg governs only the L4 decision rule).
Base: the collapse window's far end `203a32775` (firstparent leg 4/8,
INCONCLUSIVE). Healthy pole: pre-reconcile master `5157782a4`
(vetphantom fix leg 6/8, 8/8 regional, median 150d).

**Instrument-only arm — ZERO src/js changes committed.** This arm
re-runs the 8-seed matched band on the far end plus the one remaining
candidate change, cherry-picked uncommitted. It changes no game code
and builds nothing.

## Worktree recovery (before this prereg was written)

The worktree as handed over was NOT on the far-end base: HEAD was
`c20d6d895` (the parent arm's evidence commit as rebased onto master
lineage — `standing.js` sha `1eec2c9235a8…`, `competent.js` sha
`74a890f0844e…`, grants markers already present in `game.js`). The
driver guards refuse that tree outright (wrong standing sha, wrong
policy sha), and the L4 cherry-pick cannot apply onto code that
already contains it. The parent arm's ORIGINAL tooling commit
`205ab6eae` (parent `203a32775`, verified byte-identical tooling to
the rebased `a34329f61` by `git diff --stat`, empty) still exists in
the repo as a dangling commit. Before writing this prereg, the branch
`sim-optb-l4-a` was reset `--hard` to `205ab6eae` — after verifying
`c20d6d895` is an ancestor of main-tree `master` (nothing landed is
lost; the L1–L3 corpora and evidence remain readable there via
`git show`). The tree is now the exact far-end checkout + parent
tooling the parent arm ran from: `standing.js` pre-fix
`75762cb2259d…`, `competent.js` `a7ff5c516440…`, zero grants markers
in `game.js`. The L4 commits below are parented on `205ab6eae`; the
coordinator adopts by SHA, as for the parent arm.

## The question

The parent arm re-derived the healthy pole by L3 `tendexact`
(`e6911eb80`): **5/8 survive**, vs the vetphantom fix leg's 6/8 and
the firstparent leg's 4/8. The search stopped at the first leg to
reach ≥5/8, per its prereg — **L4 `grants` was not run**. This arm
runs the one untested candidate leg. The question is narrower than
the parent's: L3 already reached 5/8, so a 5/8 for L4 adds nothing
beyond L3 — only a 6/8 matches the pole itself. A 6/8 via grants
would NOT prove grants is THE carrier (L3 already re-derived the
pole by count); it would show a second route to the same count, and
the evidence will say so plainly.

| Leg | Candidate | Survived | Rank | Median | Wave 5 | Verdict |
|---|---|---|---|---|---|---|
| L1 `r125` | `10fe7ee52` | 4/8 | 7/8 REGIONAL_INTACT | 150d | 2/8 | NO_GO (deep-identical) |
| L2 `favor` | `ed33b42b8` + `b09cf584e` | 4/8 | 7/8 REGIONAL_INTACT | 150d | 2/8 | NO_GO (deep-identical) |
| L3 `tendexact` | `e6911eb80` | **5/8** | 7/8 REGIONAL_INTACT | 150d | **4/8** | HEALTHY_POLE_REDERIVED |
| firstparent | far end `203a32775` | 4/8 | — | 150d | 2/8 | INCONCLUSIVE |
| vetphantom | healthy pole `5157782a4` | 6/8 | 8/8 | 150d | 1/8 | GO (prior) |

## The candidate — L4 `grants` (`b6cf13684` + `a16ce1cc8`, game.js)

Read from the commits' own diffs before any sim (not assumed):

- **r128 grant-rate dial (`b6cf13684`)**: new `grantFoodXpCredit`
  — the first 5 XP of a task credit 1:1; above 5 XP, 1 XP per 2
  units, the odd unit carried on the person record
  (`foodXpRemainder`) so no work is lost to rounding. Applied at
  exactly two routine-work sites: hunt kills (`foodXp['butcher']`,
  1 rep per kill) and smoke-rack batches (`foodXp['preserver']`,
  1 rep per batch). Against the far end (which granted 1:1 always)
  this SLOWS butcher/preserver XP above 5 XP. The rung (5/15/30)
  and `askSpecialist` are unchanged.
- **r131 cook/mend grants (`a16ce1cc8`)**: NEW grant sites — a
  cook's meal resolution grants `foodXp['cook']` (first cook
  resolution per day only, `foodXpDay.cook` cap; a daily cook
  reaches skill 1 in ~5 days, skill 2 in ~25) and a mend
  resolution grants `foodXp['builder']` (first mend per day only).
  Both through the same dial. Before r131, `foodXp['cook']` sat at
  0 on every panel while cooks resolved ~2–3x/day — cooking never
  taught cooking. **Caveat, from the commit itself**: mend resolved
  0 times on the r128 panel because the competent policy never
  assigns it — the builder grant is likely INERT on this band; the
  cook grant is the live addition.
- **Net direction genuinely ambiguous** (parent prereg): the dial
  slows two tracks, the grants add two (one likely inert). No new
  `Math.random` draw sites in either commit — unlike L1/L2, no
  RNG-stream shift is expected; any divergence from the far end
  must come through XP/skill levels changing duty outcomes, and
  the deep-identity comparison will show whether it does.

Cherry-pick applicability re-verified at this prereg (not assumed):
grants hunks sit at `game.js` @6686–7520 (`b6cf13684`: @6686, @6805,
@7358; `a16ce1cc8`: @7477, @7520); the vetcount-reconcile hunks sit
@34456+; no overlap with each other or with any later range commit
in the same file. Neither commit touches `standing.js`, `ladder.js`,
or `hierarchy.js`. If a cherry-pick conflicts at apply time, record
the conflict, abandon the leg, report INCOMPLETE — never
hand-resolve a behavioral hunk. (The two commits also carry their
own r128/r131 evidence/scripts files, which do not exist at the far
end; only the `src/js/game.js` hunks are kept — the rest are
discarded at apply time, exactly as the parent's L1 DU files were
handled, and never loaded by the driver.)

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190391–190398 on the
far end `203a32775` plus the L4 configuration (with the fix swapped
in)**, vs the vetphantom fix leg's 6/8, the tendexact leg's 5/8, and
the firstparent leg's 4/8. This bar is STRICTER than the parent
arm's (≥5/8), because L3 already holds 5/8 — a tie is no progress:

| Outcome | Verdict for this leg |
|---|---|
| **≥6/8 survive** | **HEALTHY_POLE_MATCH** — the grants leg matches the vetphantom pole's 6/8 exactly (a second route to the same count; it does NOT displace L3 as the re-derivation) |
| **5/8 survive** | **NO_GO (tie with tendexact)** — matches L3's count, no progress beyond L3 |
| **≤4/8 survive** | **NO_GO** — the candidate does not carry the health |

**Rank read (pre-registered alongside survival):** regional reach
on the same band, vs the vetphantom fix leg's 8/8 regional:

| Outcome | Rank verdict |
|---|---|
| **≥5/8 regional** | **REGIONAL_INTACT** |
| **≤2/8 regional** | **RANK_STALL** |
| **3–4/8 regional** | **RANK_INCONCLUSIVE** |

**Secondary (reported, not judged):** median survival vs 150d
(vetphantom / firstparent / tendexact); death-cause shares vs the
combat-heavy profile; wave-5 unlocks; national / table / wins;
standing range; tribute-ready (ladder read); phantom days
(CORRECTED expectation, from the parent evidence's metric review:
shadow-exceeds-live days during a village's death spiral are
EXPECTED — they prove the swap works — only live-exceeds-shadow
would be a real phantom); blooded count (report field only);
peak living wave-4+ veterans per seed vs the bar of 2.
**Wave-5 choke:** report peak living wave-4+ veterans per seed vs
the bar of 2. **ARC IV firing per seed is a REPORTED field only**
— it is not judged and no threshold is set on it (the instrument
does not capture ARC IV; same standing as r9/r10 and the parent
arm).

**Judging instrument:** the parent analyzer's counting code is
reused (`scripts/optb-rederive-analyze-20261112.js` required as a
module: `loadCorpus` / `analyzeRows`), but its survival verdict is
the PARENT arm's rule (≥5/8) and does NOT judge this leg. The L4
analyzer wrapper (`scripts/optb-l4-analyze-20261112.js`) applies
this prereg's rule and writes
`evidence/2026-11-12/optb-l4-a-grants-summary.json`. The parent
analyzer's `main()` is NOT run for this leg — a summary carrying
the parent's verdict label would contradict this prereg at 5/8.
The wrapper exits 0 only on a classified outcome with a complete
corpus and 0 instrument errors; exit 1 otherwise.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  all prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band
  as vetphantom, firstparent, r5–r10 cuts, and the parent L1–L3
  legs.** A control/bisect re-derivation re-runs the same seeds on
  old code plus a transplant; that is the point, not a freshness
  violation. The band is reserved by the parent prereg (same
  justification as every one of the 23+ prior preregs naming seed
  190391); no new band is needed.
- **Policy: competent verbatim, SINGLE leg, mode `fix` only**
  (with the swap — see below). The driver enforces the leg guards
  (swap-aware standing guard + own-policy guard + candidate guard,
  all exact-match) and refuses to run otherwise. Policy confound
  notes (all verified by diff before any sim, not assumed):
  - `scripts/policies/competent.js` on `203a32775` vs
    `5157782a4` differs ONLY by the counter-answer block
    (env-gated OFF by default — inert unless
    `COUNTER_ANSWER=1`, which this run does not set). The
    driver runs the far end's OWN policy (sha256
    `a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a`)
    and refuses any other sha.
  - `scripts/sim-harness.js` is byte-identical between the two
    poles — the comparison differs only in game code (plus the
    controlled standing.js swap, identical on both legs, plus
    the candidate cherry-pick under test).
- **Instrument:** `scripts/vetfirst-instrument-20261111.js`
  copied from main master as UNTRACKED scratch (never committed
  — it already exists on master and committing a duplicate would
  break the later rebase; byte-identical to master, sha256
  `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`,
  verified before use; deleted before finishing) + the driver's
  live shadow old-rule count per snapshot, exactly as
  vetphantom-driver and the bisect drivers. Driver:
  `scripts/optb-rederive-driver-20261112.js` — already carries
  the `grants` leg in its `CANDIDATES`/`LEGS` tables (corpus dir
  `evidence/2026-11-12/perseed-optb-rederive-a-grants/`, RUN =
  `optb-rederive-pilot`, mode fixed to `fix` only). No driver
  change is needed for this leg.
  **`\belder\b` filter:** the driver carries the tightened
  veteran-say regex `\\belder\\b` (vetsays fix, landed
  `9a32925b3`), same as r9/r10 and the parent arm.
- **Corpora:** `evidence/2026-11-12/perseed-optb-rederive-a-grants/`
  — 8 per-seed JSONs; one summary JSON
  (`evidence/2026-11-12/optb-l4-a-grants-summary.json`).
- **Deep-identity comparison (pre-registered method):** the
  per-day signature is the 4-field tuple (vetsW3, vetsW4,
  waveKillLog length, roster length) — NOT deaths-so-far.
  Compare the grants corpus against the firstparent corpus
  (`evidence/2026-11-11/perseed-bisect-firstparent-a/`, read from
  main master via `git show` — it is not in this checkout's
  history), the vetphantom fix corpus, and the tendexact corpus
  (read from `c20d6d895` via `git show`), plus a full
  daily-snapshot deep-diff, using the parent's comparison script
  (goal hidden_files `optb-rederive-compare-20261112.js`).
  Veteran killers in the instrument are keyed `by`, not `vid`
  — a phantom check reading `k.vid` silently checks nothing.

## The fix-swap (read carefully — this base predates the roster-check fix)

At `203a32775`, `src/js/standing.js` is the PRE-FIX version
(sha256
`75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`,
verified by hand from `git show 203a32775:src/js/standing.js` in
this tree). Following the vetphantom-b swap pattern and the parent
prereg: the FIX `standing.js` is extracted with `git show
5157782a4:src/js/standing.js`, its sha256 verified to be exactly
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
swapped in UNCOMMITTED, run, then the far end's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`75762cb2259d…`) plus `cmp` clean plus `git status`
showing no `src/js` modification. The `standingSha` in use is
recorded per seed in the corpus. The swap keeps the comparison
apples-to-apples: every leg in this bisect runs WITH the roster
check. **The swapped file itself is never committed.** The
driver refuses to run unless the on-disk `standing.js` carries
the "ROSTER CHECK" marker AND its sha256 is exactly the fix sha
— an unswapped run is refused loudly, never mislabeled.

Two whole-file-swap notes, both verified before any sim by the
parent arm (not assumed):

- **BLOODED rider, LIVE on this base (unlike r9).** The fix
  file differs from the far-end base's `standing.js` in exactly
  one hunk: the ROSTER CHECK — the BLOODED block is present in
  BOTH, because the wave5kill lever landed in `203a32775` itself.
  On this base the block HAS callers, so the swap introduces NO
  blooded delta at all: the only live behavioral delta the swap
  introduces is the roster check. The driver's end-of-run
  `blooded` read is a report field.
- **Ladder scholar rule — LEG 3, same as round 5–10.** This
  base's `ladder.js _ladderLivingVeterans` is the old inline rule
  (`vp && !vp.dead`, no roster check) with the LEG 3 tribute
  scholar-readiness fix layered on: the scholar is NEVER counted
  (`if (!vid || vid === this.villagerId) return false;`). There
  is no `countLivingVeterans` on this base. The proof test
  detects which scholar rule the LOADED game carries from
  `_ladderLivingVeterans` source and asserts the matching count;
  the survival read comes from the harness end state, not the
  ladder. (The L4 cherry-picks do not touch `ladder.js`, so this
  rule is the same on every leg.)

## Balanced panel (§15) — N/A

Instrument-only leg, no code change, no before/after pair to
compare on one base. The before/after comparison IS the
vetphantom fix leg vs this candidate leg on identical seeds,
judged by the L4 analyzer's decision rule. Same standing as
survivalcontrol-b §7, anchor-a §7, merge-a §7, origin-a §7,
mergebase-a §7, r5-cut1-a §7, r5-cut2-a §7, r6-cut-a §7,
r7-cut-a §7, r8-cut-a §7, r9-cut-a §7, r10-cut-a §7, and the
parent arm §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the leg is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- The swap + the cherry-pick are the ONLY permitted uncommitted
  changes during the leg (plus the untracked instrument scratch).
  After the leg, the original `standing.js` is restored
  byte-identical (sha256 `75762cb2259d…`) AND the cherry-picked
  `src/js/game.js` is restored byte-identical (`git checkout --
  src/js/game.js` + `git status` clean of `src/js` modification)
  before any evidence commit. If a restore fails, FAIL LOUDLY and
  do not commit evidence.
- This arm does NOT re-judge any prior verdict (vetphantom GO,
  firstparent INCONCLUSIVE, r9-cut INCONCLUSIVE, r10-cut
  INCONCLUSIVE, parent L1/L2 NO_GO, parent L3
  HEALTHY_POLE_REDERIVED) — it runs the one untested candidate
  only. A 6/8 here does not displace L3.
- Do NOT cut at commits 390–393 (the r10 remainder) and do not
  touch the stall window (commits 58–65) — not this arm's.
- The sibling Loop B arms run in their own worktrees; this arm
  does not touch them, and their verdicts do not change this
  leg's decision rules. Never touch sim-voiceless-a,
  sim-proofrefresh-b10, or sim-scholarschurn-b.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (loop body step 10): attempted;
  prior bisect arms were REFUSED by the tool (recorder-corpus
  class). If refused again, recorded, not waived, baseline NOT
  rolled.
- Ancestry note: `203a32775` is an ANCESTOR of `5157782a4`
  (their merge-base is `203a32775` itself), not the reverse.
- Flap note: probe before every commit (`git update-ref
  refs/heads/probe HEAD` must succeed); if the host write flap
  returns mid-run, wait for it to clear rather than bypassing
  safe-commit; never route around a denial.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the leg: did the metric set hold, or does a
  metric need revision for the NEXT run?)
