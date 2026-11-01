# sim-heraldhp2-a — Herald HP frequency census (DIAG ONLY, zero src/js)

Base: a76c90dcc (Loop A round 1935Z). Recovery note: the Loop A
coordinator timed out before closeout; this evidence file was written
in the main-session recovery from the worker's completed corpus
(perseed JSONs + heraldhp2-analysis.json + prereg), not by the worker.
No new sims were run for this file and no number below is re-scored.

Question (from heraldhp-b, NOT re-proved here): heraldhp-b closed
backlog #1595 on its base (seed-85106 refusal-window drop 525 -> 105
= RAID wall 350 + FIELD 70). Its next-step 3 stays open: FREQUENCY —
only 1 of 4 located-Herald seeds took any draft damage, so is
wall-chipping a normal titan tax or a one-seed story? This arm answers
that on current master in two parts: (1) CONTROL — reproduce the
85106 refusal window on current master with the landed instrument
(verbatim reuse, copied into new heraldhp2-dated files); (2) CENSUS —
a wider band of located-Herald seeds.

Prereg: evidence/2026-11-01/sim-heraldhp2-a-prereg.md (written BEFORE
any judged sims). Definitions, frequency bands, and verdict rules are
exactly as pre-registered there; nothing below re-scores them.

## Verdict: DIAG-GO with a non-reproduction finding

- Instrument errors: 0 on all 64 screened seeds (ledger + herald +
  muster instruments fired throughout).
- Located seeds: 28 (>= 8 required).
- Per-seed census table: complete for every located seed (section b).
- Sections (a)-(e) below: all present.
- Control: DOES-NOT-REPRODUCE (a finding, not a failure of the arm —
  per the prereg's clause, the census is still judged on its own
  terms, and the verdict is DIAG-GO with the non-reproduction
  finding, NOT DIAG-GO on the old window).

## Pilot gate (seeds 85101-85108): GO

Zero instrument errors on all 8 pilot seeds (part of the band-wide
zero), and activity signal present: pilot seeds 85104 and 85106 both
located a Herald, and 85106 produced refusals plus a Herald field
fight. The full 64-seed band ran.

## (a) Control comparison — seed 85106, current vs heraldhp-b

Current master (this arm, anchor a76c90dcc):

- 17 refusals, days 162-166. First HP 525, last HP 501.
- Window drop: 24, ALL FIELD (1 field fight, 24 dealt, vid
  visjoin_150, outcome vF...). Pre-window drop: 175 (one palisade
  draft before the window).
- Attributed 24/24 (100%), other damage 0. Village lost day 174.
  Wave 4 reached day 135, wave 5 never, no national/table/win.

heraldhp-b (2026-10-31 corpus):

- Window drop 525 -> 105 = 420 (RAID wall 350 = two palisade
  drafts of 175 on days 106/123, plus FIELD 70 across 3 fights).

Comparison: the window does NOT reproduce. The 350 wall component
is absent in-window on current master; the only in-window damage is
a single 24-point field hit. The 175 wall damage this seed DOES
carry sits pre-window and counts toward the census wall total, but
it is not the heraldhp-b window shape.

Trajectory identity vs the heraldhp-b corpus: 0/64 seeds identical
(maxWave, national, table, won, gameDays, endReason). Trajectories
are base-pinned and master moved since the Oct 31 corpus, so this
divergence is flagged, not treated as a defect claim — and no
friendlier control seed was substituted for 85106.

## (b) Census table — all 28 located seeds

Columns: wall HP lost (DEEPEST havenRaidTick rows, herald tags),
raid drafts, Herald field fights, field damage dealt, total Herald
HP lost (first-seen minus last-seen), Herald refusals, Herald
fought flag, end omen stage.

- 85104: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85106: wall 175, drafts 1, field 1, dealt 24, total 199, refusals 17, fought 0, omen 2
- 85109: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85110: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85113: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85117: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85122: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85123: wall 350, drafts 2, field 4, dealt 81, total 431, refusals 19, fought 0, omen 2
- 85125: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85128: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85129: wall 0, drafts 0, field 2, dealt 23, total 23, refusals 0, fought 0, omen 2
- 85130: wall 175, drafts 1, field 0, dealt 0, total 175, refusals 22, fought 0, omen 2
- 85134: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85135: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85139: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85143: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85145: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85148: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85150: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85151: wall 175, drafts 1, field 0, dealt 0, total 175, refusals 70, fought 0, omen 2
- 85152: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85154: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85155: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85156: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85157: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85161: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85162: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2
- 85163: wall 0, drafts 0, field 0, dealt 0, total 0, refusals 0, fought 0, omen 2

## (c) Frequency verdict: OCCASIONAL

- Draft-damage frequency: 4/28 = 14.3% (seeds 85106, 85123, 85130,
  85151). Per the pre-registered bands (2+ seeds but < 50%),
  wall-chipping reads as OCCASIONAL — not a normal titan tax
  (>= 50%), not a one-seed story (exactly 1).
- Draft frequency (any raid draft): 4/28 = 14.3% (same 4 seeds).
- Field-fight frequency: 3/28 = 10.7% (seeds 85106, 85123, 85129).
- Totals: wall HP lost 875 (700 on DEEPEST rows); field damage
  dealt 128.

So: the Herald is drafted by raids sometimes and fought rarely.
heraldhp-b's one-seed story does not stand — four seeds chip —
but neither does a routine wall tax.

## (d) Wall numbers — full screened band (64 seeds)

national 40, table 47, wins 43, wave-4 48, wave-5 0, median
survival 93.5 days. (Wins/table/national here are the band's
background rates under the measurement policy stack, not a
verdict on the arm.)

## (e) Ranked next step

1. #1595 remainder: heraldhp-b's 420-drop closure does NOT carry
   to current master. The wall-chipping mechanism needs
   re-characterization on current master — is the 350 wall
   component gone, moved earlier/later than the refusal window,
   or gated by something the new base changed? Do not re-cite
   the heraldhp-b window as current.
2. The titan-in-raid-draft design question (is drafting a placed
   titan as an ordinary raider intended?) stays open and out of
   scope — it needs a design ruling, not a build.
3. Herald field fights stay rare (3/28, 128 damage total across
   the band). The Herald is still mostly un-fought; that is the
   same gap the facings work is chasing, measured here, not
   solved here.

## Proof test

scripts/test-heraldhp2-20261101.js (synthetic fixtures only: located
detection, raid-draft counting, wall-loss summation, field-fight
counting, frequency arithmetic, deepest-row/attribution helpers):
30/30 green, run by the arm worker in the worktree. Not re-run in
recovery (concurrent jest with live build arms is forbidden by
standing discipline); the file is committed here unchanged from
the worker's run.

## Metric review (§14)

- No metric was re-scored mid-run. Frequency bands, located
  definition, draft/wall/field definitions, and the DIAG-GO /
  DOES-NOT-REPRODUCE rules are exactly as pre-registered.
- Trajectory-identity divergence (0/64) is reported as a
  base-pinning artifact, not a defect: the corpus predates the
  current base, and the prereg requires flagging divergences
  with their seed, which the analysis does.
- The control non-reproduction is handled per the prereg's
  clause: numbers reported, no substitution, no friendlier
  control hunted. The census verdict stands on its own terms.
- Telemetry deviation check: not part of this arm's prereg and
  not run in recovery; the scale-wall numbers in (d) are the
  arm's reported band rates.

## Closeout (recovery)

- Commit: this note + prereg + perseed corpus + 4 scripts
  (instrument, sweep, analyzer, proof test); instrument only,
  zero src/js. Safe-commit index clobber check performed
  before any rebase or merge (see commit step).
- Rebased onto current master; post-rebase proof re-run (see
  commit step for the re-run result).
- Merged locally via --ff-only, pending ship — no version bump,
  no push (the ship loop owns those).
- Fleshout lock + Loop A claim deleted at closeout. Worktree
  released and removed; branch deleted.
