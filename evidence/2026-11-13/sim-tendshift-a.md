# Tendexact × stream-shift interaction — evidence (arm sim-tendshift-a)

Run fleshout-20261113T0715Z, Loop A, axis scale-onramp.
Prereg: `evidence/2026-11-13/sim-tendshift-a-prereg.md` (read it
first — it governs everything below: seeds, horizon, policy, GO
bar, run mechanics). Base: current master tip `f7352f946`.
Healthy pole: pre-reconcile master `5157782a4` (vetphantom fix
leg: 6/8 survived). Instrument-only arm — ZERO `src/js` changes
committed. The interaction leg is current master + a 997-draw
reseed burn (no code change); the baseline leg is current master,
no burn.

## Verdict

**NO-GO — the tendexact × stream-shift interaction does NOT save a
gap seed on current master.** The interaction leg survives 1/8,
the same count as the current-master baseline but a different seed,
and it fails three of the four conjunctive GO conditions:

| Condition (prereg, all conjunctive) | Result |
|---|---|
| Interaction saves ≥1 of {190392, 190394} that the baseline LOSES | **FAIL — neither gap seed saved** (190392 d143→d81, 190394 d128→d127) |
| No regression on any baseline survivor | **FAIL — baseline's only survivor lost** (190395 survived → lost d80) |
| Median ≥ 0.8× baseline median (≥111.2d) | **FAIL — 102d vs 139d** |
| Starvation ≤ baseline+2 (≤2) | pass — 1 vs 0 |

| Leg | Configuration | Survived | Median | Wave 5 | Verdict |
|---|---|---|---|---|---|
| `baseline` | current master `f7352f946`, no burn | **1/8** | 139d | 1/8 | **BASELINE** |
| `interaction` | current master + 997-draw burn | **1/8** | 102d | 1/8 | **NO-GO** |
| (healthy pole, for reference) | `5157782a4` (tendexact + shifted stream) | 6/8 | 150d | 1/8 | GO (prior) |
| (far-end firstparent, for reference) | `203a32775` | 4/8 | 150d | 2/8 | INCONCLUSIVE (prior) |

The interaction is not inert — it moves every seed's fate (all 8
diverge from day 2–10 in the deep-identity comparison) and it
saves a non-gap seed (190393: baseline lost d126 → interaction
survived 150d). But a stream shift is not a lever with a
direction: on the same burn it takes 190392 from d143 to d81,
takes the baseline's only survivor from 150d to d80, and leaves
190394 essentially untouched (d128→d127). The +1 gap to the pole
is not carried by tendexact × this stream shift.

## The loud finding: current master is harsher than the far end on this band

The baseline was measured fresh, not assumed — and it matters.
On the matched band 190391–190398, the far end survived 4/8 and
the healthy pole 6/8. **Current master survives 1/8.** Master
loses three seeds the far end survived (190393 d126, 190397 d135,
190398 d139 — all survived on the far end) and loses 190391 much
earlier (d65 vs d86). The only seed master saves, 190395, is one
the far end also saved; the pole LOST 190395. Master is strictly
harsher than the far end on this band (−3 survivors), and 5 seeds
below the pole. ~200 commits separate the far end from master, so
this is not a statement about any one change — but the pole
comparison the option-B search has been running (pole 6/8 vs
far-end 4/8) no longer describes the live game: against current
master the gap to the pole is 1/8 → 6/8, and it is not a
tendexact × stream-shift gap. The cause of master's regression on
this band is NOT chased here (out of scope — this arm tests the
interaction, not the regression); it is the next run's diagnostic
question, and it reframes the scale wall: the wall on current
master is lower than the collapse-window numbers said.

## Per-seed table (days / outcome / standing / maxWave / end pantry)

| Seed | Baseline (master) | Interaction (master + 997 burn) |
|---|---|---|
| 190391 | lost d65 / 145 / w4 / 69,383 | lost d90 / 199 / w4 / 10,359 — +25d |
| 190392 | lost d143 / 199 / w4 / 17,745 | lost d81 / 100 / w4 / 0 — **−62d, loses regional** |
| 190393 | lost d126 / 199 / w4 / 0 | **survived 150d / 199 / w4 / 3,541** — saved, not a gap seed |
| 190394 | lost d128 / 199 / w4 / 0 | lost d127 / 199 / w4 / 0 — −1d, essentially identical |
| 190395 | **survived 150d / 199 / w4 / 5,683** | lost d80 / 199 / w4 / 750 — **regression: baseline's only survivor lost** |
| 190396 | lost d140 / 199 / w4 / 0 | lost d126 / 199 / w4 / 0 — −14d |
| 190397 | lost d135 / 199 / w4 / 0 | lost d75 / 125 / w4 / 0 — −60d |
| 190398 | lost d139 / 370 / w5 / 0 | lost d102 / 335 / w5 / 0 — −37d, keeps wave 5 |

Read the table honestly: the burn moves 7 of 8 fates, and 5 of
the 7 moves are against survival. The one save (190393) is a
seed the pole also saved and the far end also saved — it is not
evidence about the gap. The gap seeds are the worst news:
190392 gets much worse, 190394 doesn't move at all.

## Deep-identity comparison (pre-registered method)

Per-day 4-field signature (vetsW3, vetsW4, waveKillLog length,
roster length) + full daily-snapshot deep-diff, interaction corpus
vs baseline corpus on the same seeds, snapshots paired
INDEX-ALIGNED (never day-keyed). Comparison script (committed):
`scripts/tendshift-deepdiff-20261113.js`. Full output:
`tendshift-a-deepdiff.log`.

- **All 8 seeds DIVERGE.** First signature divergence d4–10
  (a kill happening or not); first full-diff d2–5 (readiness
  armed/armored/tricks on the day-2 snapshot). The burn's effect
  is visible in the snapshots from the first days of play, as
  designed (world generation is untouched — the divergence starts
  in play, not in the roster: roster 12 on both legs at index 0).
- **190391:** first sig-diff idx 2 (day 5: waveKillLog 1 vs 0);
  61 sig-diff days. **190392:** idx 2 (day 5: 0 vs 1); 78
  sig-diff days. **190393:** idx 2 (day 5: 0 vs 2); 121 sig-diff
  days. **190394:** idx 1 (day 4: 0 vs 1); 124 sig-diff days.
  **190395:** idx 3 (day 6: 0 vs 2); 74 sig-diff days.
  **190396:** idx 7 (day 10: 4 vs 3); 116 sig-diff days.
  **190397:** idx 2 (day 5: 0 vs 2); 70 sig-diff days.
  **190398:** idx 1 (day 4: 0 vs 1); 96 sig-diff days.
- The interaction is the opposite of the inert legs (r180/joint/
  r172 were DEEP-IDENTICAL on all 8 seeds): it moves everything,
  early, and in both directions. The NO-GO is statistical, not
  mechanical — the shift is real and it doesn't save the gap.

## What the mechanism did (per gap seed)

- **190394 — the Eater is not the story on current master.**
  The far-end diagnosis (9 Eater fights d40–43, the re-engagement
  cascade) does not reproduce here. On the master baseline the
  Eater fights twice, late (d79 hp 671, d119 hp 890), and the
  village dies d128; on the interaction it fights twice, early
  (d60 hp 881, d68 hp 991), and the village dies d127. The
  interaction's early collapse is different: seven "the wild"
  deaths d42–44 (Maya Singh, Ursula Weber, Tashi Sherpa, Luis
  Fernandez and three generated villagers) — an early wipe the
  village survives as a remnant, then bleeds out slowly to d127.
  The baseline's late deaths are thin (one contest death d125 in
  the samples window) — the village was already a remnant by
  then. Same seed number, different death: the gap seed's fate on
  master is not the far-end Eater cascade.
- **190392 — the join lottery does not reproduce either.** On the
  master baseline there are NO joins d75–85: the roster sits flat
  at 8, then bleeds (7 on d82, 6 on d84). The pole's four joins
  (Daniyar d78, Akai + Nina d80, Mia d81) happen on neither leg.
  On the interaction the roster is 6 at d75, gains two at d77
  (Aline Coutinho, Samir Al-Rumaih — joins DO happen), loses one
  d81, and the village dies d81. A join lottery that never pays
  out on the baseline and pays two days before the wipe on the
  interaction cannot carry the gap.
- **190395 — the regression, in miniature.** Baseline survives
  150d (standing 199, pantry 5,683). Interaction loses it d80
  (standing 199, pantry 750). First signature divergence d6
  (waveKillLog 0 vs 2) — the shifted stream kills earlier and the
  village never recovers. The same burn that saves 190393 kills
  190395.
- **190397 — the Eater cascade, moved.** Interaction fights the
  Eater NINE times d64–68 (hp 712→313, wounding it down across
  five days) and still dies d75. The cascade shape the far-end
  diagnosis described for 190394 now appears on 190397 — and it
  does not save the village either.

## Secondary fields (reported, not judged)

- **Peak living wave-4+ veterans vs the bar of 2:** baseline
  reaches the bar only on 190398 (2); interaction reaches it on
  190396 (2) and 190398 (2) — yet both still lose. 190393
  survives with peak 1. The veteran bar is not the survival gate;
  it is the wave-5 gate, and the wave-5 door opens on 190398 on
  both legs (standing 370 / 335) without a win behind it.
- **Tribute:** never delivered on either leg. Ready 0/8 on both
  legs (veterans-short everywhere). The ladder's LEG 3
  scholar-never-counts rule still governs this base's tribute
  read, as on the far end.
- **Blooded:** 3/8 on the baseline (190392, 190395, 190398),
  1/8 on the interaction (190393) — the burn moves which seeds
  blood, not whether the village survives.
- **Phantom days (corrected definition — live exceeds shadow is
  a real phantom; shadow exceeds live during a collapse is
  expected):** real phantoms 0 on every seed and leg — the
  roster-check swap works (and on this base the fix is IN master,
  not swapped). Shadow-over-live 0 days too: on current master
  the collapse-spiral pattern the rederive arm saw on 190394
  (shadow over live d40–43) is gone — the shadow never exceeds
  the live count on any seed of either leg.
- **ARC IV:** report-only per the prereg. It fires on both legs
  (8 lines on the baseline leg, 7 on the interaction leg; the d66
  ARC IV inefficiency broadcast appears on 190397). Not judged,
  no threshold set.
- **Death causes:** baseline (632): villager combat 272, combat
  144, the wild 96, expedition 79, monster 15, contest 4, the
  arena 4, the night 2, Buffering 2, dehydration 2, a wound
  that wouldn't close 5, a stranger 2, ambush 1, The Strike 1,
  sickness 1, the expedition 1. Interaction (520): villager
  combat 259, combat 96, the wild 81, expedition 49, monster 19,
  a stranger 6, ambush 3, contest 3, the arena 2, thirst 1,
  starvation 1. Combat-dominated on both legs, as on both poles
  and on the matched band. Starvation 1 (interaction — the one
  starvation death is 190394 d122, Boris Kowalski) vs 0 baseline
  — within the bar.
- **End pantries:** baseline 190391 dies holding 69,383 kcal
  (d65, the classic "dies fighting with a full pantry" profile);
  interaction 190391 dies holding 10,359. The tendexact
  footprint (exact-split savings reaching the end state) does not
  separate the legs: both end with 0 on most lost seeds.
- **The `waveKills` COUNTER vs the LOG:** agree within 0–4 on
  every seed of both legs (counter at or just below the log:
  worst 190398 baseline −4). No systematic over-count on master
  — the far-end footprint (counter 1–3 ABOVE the log) has flipped
  sign and shrunk. Telemetry-only, behaviorally inert.

## Sense-testing (transcripts)

- **Interaction 190394, d115–130: ZERO vetSays lines while the
  village dies.** The final collapse passes in total silence —
  same family as the filed VOICELESS EATER finding (sim-findings.md
  2026-11-13). Nobody names the threat, warns about it, or marks
  the deaths. Confirmed on current master, not just the pole.
- **Interaction 190392, d60–81: 1 line in 21 days** — a System
  ratings line ("That was... a lot. The producers say the ratings
  were historic."). The four-day wipe (roster 7→0) passes nearly
  silent.
- **Baseline 190392, d135–143: 1 line** — a foraging note about
  european elder. Seven Eater fights d97–143, the village dies,
  and the only voice is a foraging reminder. Voiceless Eater,
  again.
- **Interaction 190397, d60–75: 3 lines, all System broadcast**
  (the finale-needs-a-nation beat, ARC IV inefficiency, the Mirror
  Draft call). Coherent, consequential — but no villager names
  the nine-fight Eater cascade d64–68. The lines are System
  commentary, not villagers reacting to the threat in front of
  them.
- **Interaction 190393, d140–150 (the survivor): coherent and
  consequential.** Veteran kills announced on camera with names
  ("Thomas just put down Big-Eyes... on CAMERA. That's a veteran
  kill, folks. REMEMBER the name." — three times, three different
  monsters); door-defense beats name the fighters and the hurt
  ("Thomas, Aime and Wolfgang met them at the door — 1 put down,
  2 barely walked away. Aime, Wolfgang are hurt."); the Nielsen
  is named as a monster. Names, consequences, no repetition.
  This is the dialogue working — it is the collapses that go
  silent, not the fights.
- **Combat-line repetition (NEW filing):** identical combat lines
  repeat 5–14× within a single day on both legs — interaction
  190398 d27 "Catalina strikes the Scarred The Moderator." ×14,
  d63 "Catalina strikes the Elder Loud-Eyes." ×11; baseline
  190396 d26 "The Scarred ducks in a row (head) falls." ×7;
  baseline 190395 d53 "The Elder Buffering SNAPS!" ×6. Same
  family as the filed pack-leader freeze repetition
  (per-fighter/per-tick re-announcement instead of once). The
  freeze line itself fires 0× on current master (both legs) — the
  current-master check that finding asked for is now done — but
  the pattern persists in strike/kill narration. Filed in
  sim-findings.md 2026-11-13 as COMBAT LINES REPEAT.
- No robotic, static, or repeated dialogue surfaced in the
  sampled lines beyond the voiceless gaps (already filed) and the
  repetition above (newly filed).

## Proof + tooling (what was built this run)

Tooling commit `05924b87f` (parent `f7352f946`; prereg + driver +
analyzer + deepdiff + proof, **124/0 green**):

- The **driver** (`scripts/tendshift-driver-20261113.js`) is a
  clone of the gap-candidates driver with legs `baseline` /
  `interaction`, corpus dir
  `evidence/2026-11-13/perseed-tendshift-a-<leg>/`, RUN
  `tendshift-pilot`, arm `tendshift`, mode fixed to `master`
  only, plus the guards adapted to this base: standing guard
  (marker + exact master sha `f935997640a0`, NOT the vetphantom
  fix sha — no swap on this base), own-policy guard (master
  competent.js sha `74a890f0844e`), tendexact guard (exact-split
  marker in hierarchy.js, both legs — tendexact is an ancestor,
  not a cherry-pick), and the no-code-change guard (`git diff
  --name-only -- src/js` must list NOTHING on both legs). The
  burn-vs-reassign design was re-verified in code on THIS base:
  five modules capture the mulberry32 function object into a
  module-scope alias at load (`betrayal.js:87`, `comms.js:116`,
  `corruption.js:47`, `fieldFights.js:71`,
  `finale-campaign.js:28` — comms drifted by one line since the
  L3 prereg), so a re-assignment would leave the fight engine on
  the old stream while a burn advances the one shared instance
  every call site reads. The only in-game `Math.random =` is the
  `_worldRng` save/restore pair (`game.js:11009` set, `11011`
  restore in `finally`) — a scoped temporary swap, not a per-day
  reseed; verified by grep that nothing re-seeds per day. The
  policy RNG (`__policyRandom`) is untouched by the burn.
- The **analyzer** (`scripts/tendshift-analyze-20261113.js`)
  judges the interaction leg against the baseline corpus under
  the full conjunctive GO bar (gap save + no regression + median
  + starvation, with the prereg addendum: a baseline-saved gap
  seed must be HELD), with the rank read alongside; the baseline
  leg alone is reported as `BASELINE`, not judged. Starvation is
  counted from the per-seed death records (`cause ===
  'starvation'`).
- The **deep-diff script**
  (`scripts/tendshift-deepdiff-20261113.js`) is COMMITTED this
  time (not /tmp scratch): per-day 4-field signature + full
  daily-snapshot deep-diff, index-aligned pairing, with the
  day-keyed mis-pairing kept as a demonstrable wrong method for
  the proof.
- The **proof test** (`scripts/test-tendshift-a.js`) ran **124/0
  green** (exit 0) on current master — instrument validity
  (engine vs ladder vs instrument, alive + fallen + scholar rule,
  with the ladder rule detected from the LOADED source: master
  uses the shared countLivingVeterans, scholar counts), seed-band
  identity (190391–190398, deliberate reuse recorded), leg guard
  (master accepted, pre-fix AND vetphantom refused, wrong-sha
  refusal by real subprocess, unknown-LEG refusal), policy guard
  (master accepted, far-end and vetphantom refused), corpus
  completeness, the GO bar case-by-case (10 cases incl. both
  prereg-addendum cases and the starvation boundary at
  baseline+2 exactly), the burn design (the game's own
  mulberry32: a 997-draw burn lands on exactly the 998th draw of
  the same stream — the observable effect, not an assertion
  about a function existing), the tendexact guard (marker present
  at `f7352f946`, absent at `203a32775`, ancestry by git), the
  no-code-change guard (accepts exactly `[]`, refuses a swap),
  and the deep-diff pairing (duplicate loss-day stamps: day-keyed
  pairing FALSELY flags the daily snapshot, index-aligned flags
  only the final one). Two proof bugs were caught and fixed by
  the proof itself before any judged sim (a synthetic assertion
  about the `_worldRng` pair counting the restore line, and a
  firstDiffPath expectation that missed the array-index suffix).
- The **fix-swap and own-policy shas** were verified by hand
  before any sim: standing.js master `f935997640a0…`;
  competent.js master `74a890f0844e…`; sim-harness.js
  byte-identical to the poles (`d0447d02939b…`); instrument
  byte-identical to master (`311f105bc15f…`).

## Run incidents (recorded, not hidden)

- **safe-commit.sh index clobber (known pattern, repaired):**
  the tooling commit `05924b87f` was created correctly, but the
  worktree's main index then showed all 5 committed files as
  staged-as-deleted (the clobber class from the 2026-10-22
  register lesson). Repaired the same way: `git ls-tree -r HEAD
  -- <5 files> | git update-index --add --index-info`, then
  verified `git status --short` empty + `git diff HEAD` empty.
  The commit itself was always correct. This worktree is on
  branch `sim-tendshift-a` (not detached), so HEAD moved
  normally — no reset recovery was needed, unlike the 0515Z
  arms.
- **Host write flap:** the flap-watch log read ALL-OK
  throughout this run (07:40–08:57Z; probe `git update-ref
  refs/heads/probe HEAD` succeeded before every commit). No flap
  episode touched this run.
- **Sim cost:** ~2–4 min per seed (full-instrument per-seed
  game load dominates, not the 150 days). Baseline leg ~26 min,
  interaction leg ~31 min. The loop body's "~3–4s per seed-run"
  figure does not hold for the full-instrument drivers; the
  pilot still fits the run, but a confirm at 12–16 seeds on this
  instrument would cost ~45–60 min per leg.
- **Telemetry deviation check:** attempted per loop body step
  10 — REFUSED by the tool ("refusing recorder-corpus input:
  all 8 --current rows carry top-level anchorCommit, so they
  are sweep recorder rows, not runs"), exactly as the prereg
  predicted and as prior bisect arms were refused. Recorded,
  not waived; the baseline was NOT rolled. No LOUD lines exist
  to investigate (the tool refused the input class entirely).
- **Instrument scratch:** none needed — the vetfirst instrument
  is committed on master and required directly, no copy.
- **No runtime restarts, no incomplete corpora, no instrument
  errors** on either leg (0 errors on all 16 seeds).

## Metric review (§14 — metrics held, one scoping correction)

- The primary metric (gap seeds saved + no baseline regression +
  median + starvation, judged against a MEASURED baseline on
  identical seeds) held: it separated the legs cleanly (the
  interaction fails three of four conditions) and the
  deep-identity comparison gave the NO-GO a mechanical
  explanation (the shift is real, early, and bidirectional — it
  moves fates without saving the gap). No re-scoring happened:
  the starvation condition passed and was reported as passing,
  not substituted as the verdict; the 190393 save was reported
  as a non-gap save, not counted toward GO.
- The prereg addendum (baseline saves a gap seed → the burn must
  HOLD it) did NOT trigger: the master baseline loses BOTH gap
  seeds, so the plain bar applied. The addendum cases were still
  proven in the proof test (10 GO-bar cases) and stand for the
  next run.
- The rank read (survived count vs 6/8 pole / 4/8 far end) held
  but now MISLEADS if read naively: both legs read 1/8 against a
  pole measured on a different base. The count is comparable
  only within this run (baseline vs interaction, same base). The
  cross-base comparison is the loud finding above, not a rank.
- **Scoping correction owed:** this arm tested the interaction
  ON CURRENT MASTER, as briefed. The exact far-end-base cell
  (203a32775 + tendexact + 997 burn) remains untested — the
  option-B search on the far-end base is complete except for
  that one cell. Against the live game the question is settled
  (NO-GO); against the historical pole the cell is still open,
  and it is worth exactly one arm if the coordinator wants the
  pole re-derivation closed rather than the live-game answer.
  The other remaining item from gap-candidates — more burn
  offsets — is likewise still open (one offset sampled).
- Kill taxonomy (§14a) for the NO-GO: **CONCEPT-DEAD for the
  tendexact × 997-burn interaction as the carrier of the +1 gap
  on current master** — the mechanism was staged (tendexact in
  master, burn verified to move the stream from day 2 on all 8
  seeds), the metric was fair, and the concept failed on its
  merits: neither gap seed saved, the baseline's only survivor
  lost, median down. Do not retry tendexact × 997 as a gap
  carrier. The broader stream-offset question is NOT dead (one
  offset sampled); it returns with a different offset, not the
  same one.

## Convergence state

**NO-GO — the tendexact × stream-shift interaction does not carry
the +1 gap on current master.** Together with the 0515Z arms,
the option-B search now reads: tendexact alone 5/8 on the
matched band (far end, doesn't generalize), reseed alone 3/8,
interaction 1/8 on current master — and no RNG-only or
interaction leg saves a gap seed. The healthy pole's 6/8 is not
re-derived by any tested combination. The scale-onramp axis stays
**converging, not converged**: national 0/8, table 0/8, wins 0/8
on both legs, and the wall on current master is LOWER than the
collapse-window numbers said (baseline 1/8, median 139d). The
next run's work, narrowed by this arm: (1) **more burn offsets**
(one sampled — the stream question stays open); (2) **the master
regression on the matched band** (1/8 vs the far end's 4/8 — what
moved between 203a32775 and f7352f946); (3) the far-end-base
interaction cell (203a32775 + tendexact + 997 burn) if the
coordinator wants the historical pole closed. **No
`[needs-eyes]`** — this arm is instrument-only; no game code is
committed, no feel/combat/UI change exists to playtest.

## Corpora + summaries

- `evidence/2026-11-13/perseed-tendshift-a-baseline/` (8 JSONs)
- `evidence/2026-11-13/perseed-tendshift-a-interaction/` (8 JSONs)
- `evidence/2026-11-13/tendshift-a-baseline-summary.json` (BASELINE)
- `evidence/2026-11-13/tendshift-a-interaction-summary.json` (NO_GO)
- `evidence/2026-11-13/tendshift-a-deepdiff.log` (deep-identity comparison; the log file lives in the worktree root as `tendshift-a-deepdiff.log` — see §9)
- Driver logs: `tendshift-a-{baseline,interaction}-driver.log` (worktree root)
- Tooling commit: `05924b87f` (parent `f7352f946`; prereg + driver
  + analyzer + deepdiff + proof, 124/0 green). Evidence commit:
  see §9.
- Deep-identity comparison script COMMITTED:
  `scripts/tendshift-deepdiff-20261113.js`. Secondary analysis
  script kept in /tmp (`/tmp/tendshift-secondary-a.js`).

## §9 — adoption note for the coordinator

This worktree is on branch `sim-tendshift-a` at current master
`f7352f946` + tooling commit `05924b87f`. The evidence text,
summaries, and logs are in commit `77fa22f35`; the per-seed
corpora (16 JSONs) follow in a second evidence commit on the same
branch — safe-commit.sh does not accept directory paths (the two
`perseed-*` dirs failed to add in the first evidence commit), so
the corpora were committed by explicit file list. Merge to local
master via --ff-only from the branch, then release the tree per
the loop body. Nothing here was merged, pushed, or version-bumped. The
worktree contains only committed work plus the evidence corpora
in the evidence commit — EXCEPT the driver logs and the deepdiff
log, which live in the worktree root as untracked files
(`tendshift-a-baseline-driver.log`,
`tendshift-a-interaction-driver.log`, `tendshift-a-deepdiff.log`):
they are small text logs, include them in the evidence commit if
the coordinator wants them kept, or delete them at release. The
evidence file's §"Corpora + summaries" names their location
either way.
