# The +1 gap deciding test — evidence (arm sim-gap-candidates-a)

Run fleshout-20261113T0515Z, Loop A, axis scale-onramp.
Prereg: `evidence/2026-11-13/sim-gap-candidates-a-prereg.md` (read
it first — it governs everything below: seeds, horizon, policy, GO
bar, run mechanics). Base: the collapse window's far end
`203a32775`. Healthy pole: pre-reconcile master `5157782a4`
(vetphantom fix leg: 6/8 survived). Instrument-only arm — ZERO
`src/js` changes committed.

## Verdict

**GAP-NOT-DICE — by the pre-registered run rule.** No RNG-only leg
saved a gap seed:

| Leg | Candidate | Survived | Gap saved | Lost baseline | Verdict |
|---|---|---|---|---|---|
| L1 `r180` | `28875b1b1` draw-removal | 4/8 | none | none | **NO_GO** |
| L2 `joint` | r125 + r129/r130 together | 4/8 | none | none | **NO_GO** |
| L3 `reseed` | no code change; 997-draw burn | 3/8 | none | 190393 | **NO_GO** |
| L4 `r172` | `bd0bf10e2` confession guard | 4/8 | none | none | **NO_GO** |
| firstparent | far end `203a32775` | 4/8 | — | — | INCONCLUSIVE (prior) |
| vetphantom | healthy pole `5157782a4` | 6/8 | 190392 + 190394 | — | GO (prior) |

The +1 gap question is therefore NOT closed as dice. The
arm-1 diagnosis (the pole's save runs through the stream) is NOT
confirmed by this test — but it is NOT refuted either, and the
honest reading matters more than the one-word verdict:

- **L1/L2/L4 are inert, not weak.** All three legs are
  DEEP-IDENTICAL to the far end on all 8 seeds — not one daily
  snapshot differs. Their draw sites never fire differentially
  in sim play (no reframed recap, no secret-answer/teach-plant/
  favour display, no second confession lands differently in
  8×150 days of competent play). They cannot carry the gap, and
  they also cannot test the stream: a candidate that never moves
  a snapshot never shifts the stream. Kill taxonomy (§14a):
  **CONCEPT-DEAD on this band** for all three as survival
  carriers — do not retry them without new evidence that their
  lines actually fire in sim play.
- **L3 proves the band is strongly stream-sensitive — but saves
  nothing.** One 997-draw burn moved 4 of 8 fates substantially:
  190391 d86→d93, 190392 d144→d72, 190393 survived→lost d122,
  190394 d43→d130 (the Eater never even appears on the shifted
  stream). The stream decides fates on this band; the tested
  shift just didn't save a gap seed. Only ONE burn offset was
  sampled (the prereg fixes 997) — the pole's stream differs from
  the far end's by the cumulative effect of ~200 commits, and a
  different offset might still save a gap seed. The GAP-NOT-DICE
  verdict is the pre-registered rule's verdict (no tested
  RNG-only leg saved a gap seed), not a proof that no stream
  shift could.
- **The remaining candidates, named:** (1) **tendexact ×
  stream-shift interaction** — the pole carries BOTH the pantry
  fix AND the shifted stream; no leg tested them together, and
  tendexact alone saves 190391 while the stream alone moves
  190394 d43→d130. A tendexact + reseed leg is the first item
  for the next run. (2) **More burn offsets** — the reseed
  sampled one; a small sweep (e.g. 3–5 offsets) would say
  whether ANY nearby stream saves a gap seed. (3) No further
  single-commit candidate remains in the range: the prereg's
  diff analysis stands (everything else is dialogue-only,
  telemetry-only, or env-gated off), and L1/L2/L4 now join
  that list as tested-inert.

Wall numbers (all legs): national 0/8, table 0/8, wins 0/8 —
the tendexact fix moves survival, not scale, and nothing here
moves scale either. The scale-onramp axis stays converging,
not converged.

## Per-seed table (days / outcome / standing / maxWave)

| Seed | Firstparent (far end) | Vetphantom (pole) | L1 r180 | L2 joint | L3 reseed | L4 r172 |
|---|---|---|---|---|---|---|
| 190391 | lost d86 / 199 / w4 | survived / 199 / w4 | lost d86 / 199 / w4 | lost d86 / 199 / w4 | lost d93 / 199 / w4 | lost d86 / 199 / w4 |
| 190392 | lost d144 / 199 / w4 | survived / 199 / w4 | lost d144 / 199 / w4 | lost d144 / 199 / w4 | lost d72 / 199 / w4 | lost d144 / 199 / w4 |
| 190393 | survived / 325 / w5 | survived / 325 / w5 | survived / 325 / w5 | survived / 325 / w5 | **lost d122 / 560 / w5** | survived / 325 / w5 |
| 190394 | lost d43 / 150 / w4 | survived / 199 / w4 | lost d43 / 150 / w4 | lost d43 / 150 / w4 | lost d130 / 199 / w4 | lost d43 / 150 / w4 |
| 190395 | survived / 199 / w4 | lost d109 / 199 / w4 | survived / 199 / w4 | survived / 199 / w4 | survived / 525 / w5 | survived / 199 / w4 |
| 190396 | lost d87 / 199 / w4 | lost d85 / 199 / w4 | lost d87 / 199 / w4 | lost d87 / 199 / w4 | lost d119 / 199 / w4 | lost d87 / 199 / w4 |
| 190397 | survived / 275 / w5 | survived / 325 / w5 | survived / 275 / w5 | survived / 275 / w5 | survived / 215 / w5 | survived / 275 / w5 |
| 190398 | survived / 199 / w4 | survived / 375 / w5 | survived / 199 / w4 | survived / 199 / w4 | survived / 505 / w5 | survived / 199 / w4 |

Read the table honestly: L1/L2/L4 reproduce the far end
seed-for-seed (every day, standing, and wave identical). L3 is
the only leg that moves anything — and it moves in both
directions: 190394 improves enormously (d43→d130) without
surviving, 190392 gets much worse (d144→d72), 190393 regresses
from a survivor to a d122 loss at standing 560 (the highest
standing on any leg this run — it reached wave 5, banked
standing, and still bled out to "the wild" and a stranger).
A stream shift is not a lever with a direction; it is a new
roll of the same dice.

## Deep-identity comparison (pre-registered method)

Per-day 4-field signature (vetsW3, vetsW4, waveKillLog length,
roster length) + full daily-snapshot deep-diff, each leg vs the
firstparent corpus
(`evidence/2026-11-11/perseed-bisect-firstparent-a/`) and the
vetphantom fix corpus
(`evidence/2026-11-11/perseed-vetphantom-b/`), snapshots paired
INDEX-ALIGNED (never day-keyed — the duplicate loss-day stamps
make day-keyed pairing pair the wrong snapshots; see the prereg
§0). Comparison script (scratch, in /tmp, NOT committed):
`/tmp/gap-deepdiff-a.js`.

- **L1 r180 vs firstparent: DEEP-IDENTICAL on all 8 seeds.**
  **L2 joint vs firstparent: DEEP-IDENTICAL on all 8 seeds.**
  **L4 r172 vs firstparent: DEEP-IDENTICAL on all 8 seeds.**
  The NO_GOs are mechanical, not statistical.
- **L3 reseed vs firstparent: diverges on all 8 seeds, from
  day 2.** First deep-diff day 2 on 190393/190394/190395/
  190396/190397/190398 (d4–6 first signature divergence — a
  kill happening or not). The burn's effect is visible in the
  snapshots from the first days of play, as designed (world
  generation is untouched — the divergence starts in play, not
  in the roster).
- **L3 vs vetphantom:** diverges everywhere from day 2–6; no
  seed approaches the pole's trajectory. The reseed's 190394
  (d130) and the pole's 190394 (survived) share nothing but the
  seed number.
- The `waveKills` COUNTER diverges from the LOG on the far-end
  base exactly as the prereg predicted (the vetcount-reconcile
  footprint): firstparent 190394 counter 42 vs log 40.
  Telemetry-only, behaviorally inert.

## The reseed leg in detail (what the stream shift actually did)

- **190394 — the Eater never appears.** Zero Eater fights on
  the reseed leg (vs 9 on the far end, 3 on the pole). The
  shifted stream never spawns or engages it; the village
  survives to d130 and dies to a late collapse (paparazzo
  fights d126/d129; "the wild" deaths d128–129: Daniel Medina,
  Tashi Sherpa, Luis Fernandez, Hannah Kim). The Eater cascade
  that kills the far end is one stream outcome among many — a
  different stream dodges the Eater entirely and still dies.
- **190392 — a fast wipe, not a slow bleed.** Roster collapses
  d69–72 (live 9→8→6→1→0); deaths "the wild" d69–72 (Olivia
  Bennett, Nino Kapanadze, Ruth Goldstein, Sigrun Eiriksdottir,
  Boris Kowalski, Sari Wulandari). The far end's slow bleed to
  d144 becomes a four-day wipe.
- **190393 — the regression.** Reached wave 5, standing 560,
  then bled out d115–122 ("the wild" + a stranger + a wound
  that wouldn't close). The highest standing on any leg this
  run, and still a loss — standing is not survival.
- **190395/190398 — the stream giveth.** Both reach wave 5 on
  the reseed leg (standing 525 and 505; end pantries 13,408 and
  6,220 kcal) where the far end never did. Same code, same
  world, different dice — wave-5 unlocks move with the stream.

## Secondary fields (reported, not judged)

- **Peak living wave-4+ veterans vs the bar of 2:** L1/L2/L4
  reach the bar on 190393 (2), 190397 (2), 190398 (2) only —
  identical to the rederive L1/L2 legs. Reseed reaches it on
  190393 (4), 190395 (2), 190396 (3), 190397 (2), 190398 (2)
  — yet 190393 still loses d122 despite peaking at FOUR living
  wave-4 veterans. The veteran bar is not the survival gate;
  it is the wave-5 gate, and the reseed opens wave 5 on
  190395/190398 where the far end never did (and on 190393,
  which then loses anyway).
- **Tribute:** never delivered on any leg. Ready only on
  190397 (all four legs, same as the far end). 190393 reads
  veterans=1/need=2 on L1/L2/L4 — the ladder's LEG 3
  scholar-never-counts rule still governs this base, as the
  prereg predicted.
- **Blooded:** 4/8 on L1/L2/L4 (190391/190393/190397/190398),
  3/8 on reseed (190395/190397/190398) — the BLOODED block has
  live callers on this base (the wave5kill lever) and the swap
  introduced no blooded delta, as predicted.
- **Phantom days (corrected definition — live exceeds shadow
  is a real phantom; shadow exceeds live during a collapse is
  expected):** real phantoms 0 on every leg and seed — the
  roster-check swap works. Shadow-over-live on 190394 d40–43
  (w3, by exactly 1) on L1/L2/L4, identical to the tendexact
  and far-end legs: a killer whose vp record is alive but who
  is no longer on the roster while the village falls apart.
  One new observation on the reseed leg: 190395 carries a
  persistent shadow-over-live gap (w3, by 1–2) from d122 to
  d151 while SURVIVING — 1–2 wave-3 killers alive somewhere
  but not on the roster for a month (six ex-roster names hold
  wave-3 kills in the log at d130; the vp-dead filter leaves
  1–2 alive-but-departed). The old rule would over-count them
  on a surviving village too, not just a collapsing one. The
  live rule is the correct one; the observation is filed here,
  not judged.
- **ARC IV:** report-only per the prereg; the instrument does
  not capture ARC IV. Not judged, no threshold set.
- **Death causes:** L1/L2/L4 identical to each other (629):
  villager combat 267, combat 130, expedition 126, the wild
  74, monster 13, Spool 2, a stranger 2, arena 2, ambush 3,
  contest 3, wound 3, the night 1, Big-Eyes 1, alien 1,
  starvation 1. Reseed (714): villager combat 250, combat 136,
  expedition 211, the wild 76, monster 18, a stranger 6,
  wound 4, arena 3, ambush 2, contest 2, Grief Counselor 1,
  Focus Group 1, Buffering 1, Gavel 1, starvation 1, the
  night 1. Combat-dominated on every leg, as on both poles.

## Sense-testing (transcripts)

- **Reseed 190394, d115–130: ZERO vetSays lines while the
  village dies.** The final collapse (paparazzo fights,
  four "the wild" deaths) passes in total silence — same
  family as the draft's VOICELESS EATER finding (filed in
  sim-findings.md 2026-11-13). Nobody names the threat, warns
  about it, or marks the deaths.
- **Reseed 190392, d60–72: 5 lines, all coherent and
  consequential.** A Pack-leader warning ("This one is
  different — bigger, and it didn't come alone"), the
  outnumbered call ("Your party: just you. You are outnumbered
  — fight like it."), the kill, the +20 style drop, and the
  veteran-kill announcement on camera ("Sigrun just put down
  Big Big... on CAMERA. That's a veteran kill, folks. REMEMBER
  the name."). Names, consequences, no repetition.
- **Joint 190392, d76–83: 1 line** (a Scarred veteran
  warning). The joins d78–81 pass in total silence — the
  VOICELESS JOINS finding (filed in sim-findings.md
  2026-11-13) confirmed on this leg too.
- No robotic, static, or repeated dialogue surfaced in the
  sampled lines beyond the two voiceless gaps above (both
  already filed).

## Proof + tooling (what was built this run)

Tooling commit `ab18298c3` (parent `203a32775`; prereg +
driver + analyzer + proof, **82/0 green**):

- The **driver** (`scripts/gap-candidates-driver-20261113.js`)
  is a clone of the optb-rederive driver with legs r180 /
  joint / reseed / r172, corpus dir
  `evidence/2026-11-13/perseed-gap-candidates-a-<LEG>/`, RUN
  `gap-candidates-pilot`, arm `gap-candidates`, plus the
  reseed burn (exported `RESEED_BURN = 997`, applied after
  `setupGame`) and the L3 no-code-change guard (exported
  `noCodeChangeGuard`: `git diff --name-only -- src/js` must
  list exactly `src/js/standing.js`). The burn-vs-reassign
  design was verified in code before any sim: five modules
  capture the mulberry32 function object into a module-scope
  alias at load (`betrayal.js:87`, `comms.js:115`,
  `corruption.js:47`, `fieldFights.js:71`,
  `finale-campaign.js:28`), so a re-assignment would leave the
  fight engine on the old stream while a burn advances the one
  shared instance every call site reads. The only in-game
  `Math.random =` is the `_worldRng` save/restore pair
  (`game.js:10900–10902`, restores in `finally`) — a scoped
  temporary swap, not a per-day reseed; verified by grep that
  nothing re-seeds per day. The policy RNG (`__policyRandom`)
  is untouched by the burn.
- The **analyzer** (`scripts/gap-candidates-analyze-20261113.js`)
  judges the prereg's gap rule (≥1 gap seed saved AND no
  baseline survivor lost → GO, else NO_GO) and reports the
  wall numbers.
- The **proof test** (`scripts/test-gap-candidates-a.js`)
  re-proves instrument validity, seed-band identity, the
  swap-aware leg guard (including a real subprocess refusal),
  corpus completeness, the gap decision rule (7 synthetic
  cases, including both regression cases), and the candidate
  guards — markers present at `5157782a4` and absent at
  `203a32775` for r180/joint/r172, plus the reseed
  no-code-change checker (accepts exactly
  `[src/js/standing.js]`, refuses empty/stray/non-list/bare
  paths). One proof bug fixed during the run (a synthetic
  death-count assertion: `fakeRow` carries one death per row,
  so 8 rows = 8 deaths, not 2 — the assertion was wrong, the
  code was right).
- The **fix-swap and own-policy shas** were verified by hand
  before any sim: standing.js pre-fix `75762cb2259d…` → fix
  `f8fda4295a99…`; competent.js `a7ff5c516440…`; sim-harness.js
  byte-identical between the poles (`d0447d02939b…`); instrument
  scratch byte-identical to master (`311f105bc15f…`).

## Run incidents (recorded, not hidden)

- **L1 r180 cherry-pick clean** (no conflicts); `src/js`
  hunks verified line-identical to the commit's `src/js` diff
  (27 insertions + 1 deletion).
- **L2 joint cherry-picks:** r125 hit the same three DU
  conflicts as the rederive L1 leg (its own evidence/test
  files, absent at the far end) — resolved by taking the
  incoming versions, per precedent; `src/js` hunks verified
  line-identical. The favor picks were clean; the resulting
  files were verified against `b09cf584e`'s text (favor-*.js
  byte-identical; convo-wants.js differs only by the r176
  settled-state branch and convo-dialogue.js only by the r169
  pre-check — both non-picked range commits in the prereg's
  excluded list).
- **L4 r172 cherry-pick clean** (no conflicts); `src/js`
  hunks verified line-identical (45 insertions + 2 deletions).
- **safe-commit.sh on detached HEAD:** the tooling commit
  `ab18298c3` was created but HEAD did not move — the script
  failed `update_ref` for `refs/heads/` (empty branch name on
  a detached HEAD) and reported the commit while leaving HEAD
  at `203a32775`. Recovered with `git reset --mixed
  ab18298c3` (index-only move; worktree untouched; standing.js
  swap and instrument scratch verified intact afterwards). The
  same quirk will strike the evidence commit below; the
  coordinator should adopt by SHA (see §9).
- **Host write flap:** the flap-watch log read ALL-OK
  throughout this run (probe `git update-ref refs/heads/probe
  HEAD` succeeded before every commit and every leg). No flap
  episode touched this run. (163 historical FAIL lines in the
  log predate this run.)
- **Telemetry deviation check:** attempted per loop body step
  10 — REFUSED by the tool ("refusing recorder-corpus input:
  all 8 --current rows carry top-level anchorCommit, so they
  are sweep recorder rows, not runs"), exactly as the prereg
  predicted and as prior bisect arms were refused. Recorded,
  not waived; the baseline was NOT rolled. No LOUD lines exist
  to investigate (the tool refused the input class entirely).
- **Instrument scratch:**
  `scripts/vetfirst-instrument-20261111.js` was copied from
  master as untracked scratch per the prereg and deleted
  before finishing (it already exists on master; committing a
  duplicate would break the later rebase).
- **Deep-diff method correction (carried):** the prereg §0
  records that day-keyed snapshot pairing mis-pairs the
  duplicate loss-day snapshots; all comparisons in this arm
  pair index-aligned. The rederive "deep-identical" claims for
  L1/L2 were re-verified under the corrected pairing and stand.

## Metric review (§14 — metrics held, one correction applied)

- The primary metric (gap seeds saved + no baseline regression,
  GO per leg) held: it separated the legs cleanly (the three
  inert legs by deep-identity, the reseed by count + regression)
  and the deep-identity comparison gave the NO_GOs a mechanical
  explanation rather than a statistical shrug. No re-scoring
  happened: the reseed was judged NO_GO on the count (neither
  gap seed saved, baseline survivor lost), and the
  stream-sensitivity finding was reported as the mechanism, not
  substituted as the verdict. The prereg's leg-3 row and its
  decision table disagree in wording (diagnostic "flip" bar vs
  uniform "save + no regression" bar) — on THIS outcome they
  agree (no gap seed was saved under either reading), so no
  re-scoring question arises; the next prereg should state one
  bar for a diagnostic leg.
- The phantom-days correction from the rederive evidence was
  APPLIED in this prereg and held: real phantoms 0 everywhere;
  shadow-over-live appears only where a village is collapsing
  (190394 d40–43) or carrying departed killers (reseed 190395
  d122–151). The field is now report-only with that note, and
  it behaved.
- The rank read (survived count vs 6/8 pole / 4/8 far end)
  held but did not discriminate the inert legs (all 4/8, the
  far end exactly); the reseed read 3/8, below the far end —
  a stream shift can cost a seed as easily as save one.
- Kill taxonomy (§14a): L1/L2/L4 **CONCEPT-DEAD on this band**
  (mechanism staged, metric fair, concept failed in the
  strongest sense: the candidates never moved a single daily
  snapshot). L3 reseed: the concept (stream-sensitivity)
  PROVED — the band's fates move with the stream — but the
  leg's GO bar (save a gap seed) was missed. Do not retry
  r180/joint/r172 as survival carriers without new evidence
  their lines fire in sim play; do retry the stream question
  with more burn offsets and with tendexact combined.

## Convergence state

**GAP-NOT-DICE, per the pre-registered rule — the +1 gap
question is NOT closed.** The healthy pole is NOT re-derived
by any RNG-only leg, and the tendexact re-derivation by count
(5/8) still stands as the only mechanism carried. The
scale-onramp axis stays **converging (NOT converged)**:
national 0/8, table 0/8, wins 0/8 on every leg. The next
run's work, narrowed by this arm: (1) **tendexact ×
stream-shift interaction** (the pole carries both; untested
together); (2) **more burn offsets** (one sampled); (3) the
option-B search is otherwise complete — every residual item
from the rederive prereg is now tested (r180, joint, reseed,
r172), and three of the four are proven inert in sim play.
**No `[needs-eyes]`** — this arm is instrument-only; no game
code is committed, no feel/combat/UI change exists to
playtest.

## Corpora + summaries

- `evidence/2026-11-13/perseed-gap-candidates-a-r180/` (8 JSONs)
- `evidence/2026-11-13/perseed-gap-candidates-a-joint/` (8 JSONs)
- `evidence/2026-11-13/perseed-gap-candidates-a-reseed/` (8 JSONs)
- `evidence/2026-11-13/perseed-gap-candidates-a-r172/` (8 JSONs)
- `evidence/2026-11-13/gap-candidates-a-r180-summary.json` (NO_GO)
- `evidence/2026-11-13/gap-candidates-a-joint-summary.json` (NO_GO)
- `evidence/2026-11-13/gap-candidates-a-reseed-summary.json` (NO_GO)
- `evidence/2026-11-13/gap-candidates-a-r172-summary.json` (NO_GO)
- Driver logs: `gap-candidates-a-{r180,joint,reseed,r172}-driver.log`
- Tooling commit: `ab18298c3` (parent `203a32775`; prereg + driver
  + analyzer + proof, 82/0 green). Evidence commit: see §9.
- Deep-identity comparison script kept in /tmp
  (`/tmp/gap-deepdiff-a.js`); verification script
  `/tmp/gap-verify-a.js`; secondary script
  `/tmp/gap-secondary-a.js`. The comparison script should be
  kept in the goal hidden_files by the coordinator if the next
  run wants it (`hidden_files/optb-rederive-compare-20261112.js`
  is the rederive equivalent).

## §9 — adoption note for the coordinator

This worktree is on a **detached HEAD**. The tooling commit is
`ab18298c3` (parent `203a32775`); the evidence commit is a second
commit on the same detached HEAD (created by safe-commit.sh,
which does not move HEAD when detached — recover it the same
way: note the SHA it prints, then `git reset --mixed <sha>`).
Rebase/merge is the coordinator's job — nothing here was merged,
pushed, or version-bumped, and the tooling/proof only make sense
on the far-end base (do NOT rebase onto master; it would break
the experiment substrate). The instrument scratch
(`scripts/vetfirst-instrument-20261111.js`) was deleted before
finishing; the worktree contains only committed work plus the
evidence corpora in the evidence commit. The draft evidence
`hidden_files/sim-gap-round-0455-DRAFT.md` can now be adopted
into `evidence/2026-11-13/sim-gap-round-0455.md` — the arm-1
diagnosis it records was re-verified under this arm's prereg
(§0) and its deciding test has now run: the diagnosis is NOT
confirmed (no RNG-only leg saved a gap seed), and the draft's
"GAP-IS-DICE" verdict line must NOT be adopted as written.
