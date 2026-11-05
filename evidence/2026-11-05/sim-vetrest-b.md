# Evidence — arm sim-vetrest-b (Loop B run fleshout-loop-b-20261105T1611Z, adoption of 1423Z)

BUILD arm. Axis: scale-onramp / winnability chain. First-killer survival.
Lever: VETREST mantle-skip (ledger.js playerDeath, default OFF via
`VETREST_MANTLE_SKIP=1`) — at succession the village does not hand the
Codex to a fresh wave-4 killer (kill within 45d); the next-most-trusted
leads while the killer rests. Fallback: the mantle always passes.
Prereg: `evidence/2026-11-05/sim-vetrest-b-prereg.md` (committed 1fa31cafa,
adopted verbatim; its metrics are binding).

Anchor: lever commit `5f32408b0` on master `4309d42a0` (rebased from
`1ae895a35`; rebase hit the documented stop-at-pick quirk at the 2nd pick,
tree clean + pick unapplied, `git rebase --continue` sailed through).
Proof `scripts/test-vetrest-20261105.js`: 30/30 green BEFORE the pilot and
30/30 green again AFTER the rebase. Lever review vs prereg: flag, 45d
window, trust-sort skip with fallback, narration line, `vetrestSkips`
trace at `state.village.vetrestSkips` — all present as specified, no
redesign. No win-price / deed-gate / readiness-demand change. No XP/gear
files.

## Verdict: UNDERPOWERED (not GO, not NO-GO)

Per the prereg power rule: 1 banking seed per leg (99713 only), 1 observed
first-killer exit on the armed leg (need >= 3 for the median). The pilot
claims no GO/NO-GO. It reports the mechanism measures and proposes the
32-seed screen as the next run (prereg: "An underpowered pilot reports the
mechanism measures and proposes the 32-seed screen as the next run").

Analyzer: `node scripts/vetrest-analyze-20261105.js
evidence/2026-11-05/perseed-vetrest-b/` — full JSON summary saved as
`evidence/2026-11-05/perseed-vetrest-b/analysis.json`.

## Pilot design (as pre-registered)

- Band 99711–99718 (8 seeds, freshness verified in the prereg), competent
  policy VERBATIM on both legs, 150d death-aware horizon.
- Baseline leg: flag unset. Armed leg: `VETREST_MANTLE_SKIP=1`, identical
  seeds. Instrument errors 0 on all 16 legs.
- Corpus: `evidence/2026-11-05/perseed-vetrest-b/` (16 per-seed JSONs).

## Before / after (paired, identical seeds)

| measure | baseline | armed (flag on) |
|---|---|---|
| banking seeds | 1 (99713) | 1 (99713) |
| first-killer median survival (observed exits) | 2d (n=1, no median) | 2d (n=1, no median) |
| banking seeds with >= 1 day of 2 living killers | 0 | 0 |
| skips fired | 0 | 0 |
| paired first-killer survival (99713) | Farid 2d | Farid 2d (unchanged) |
| L>=2 days (total) | 0 | 0 |
| L>=1 days (total) | 2 | 2 |
| post-first-blood fights / kills | 5 / 0 | 5 / 0 |
| readiness-5-ready days | 0 | 0 |
| median village survival | 74d | 74d |
| starvation deaths (band total) | 6 | 6 |
| village losses | 8/8 | 8/8 |
| median non-scholar fallen (roster co-primary) | 8.5 | 8.5 |
| death channel, dead killers | wild 1 | wild 1 |

Cost bars: all four hold — trivially, because the two legs are
byte-identical trajectories. The flag changed nothing anywhere in the
band: same days, same fights, same kills, same deaths on every seed.
That is flag-on neutrality proven in the wild (the proof's 30d neutrality
leg said the same; the 150d pilot confirms it at full horizon).

## Why the mechanism never fired (the honest mechanism report)

Skips 0 is not a code failure — the proof shows the skip firing, traced,
and narrated on fixtures. The pilot's substrate never staged the
situation the skip addresses:

- The band produced exactly ONE wave-4 kill in 16 legs: Farid Ahmed
  killing the Influencer on d108, seed 99713 — as the scholar
  (scholarAtKill, player TB channel), not as an NPC.
- Farid died d110 as scholar in combat at haven, 2 days after the kill
  — the scholar-at-kill pattern killersim2 documented (5 of 7 banked
  killers), which this lever cannot touch. Its addressable pool is the
  NPC-at-kill minority (~29% in killersim2).
- At Farid's death the succession candidates held no other living fresh
  killer — there was no other wave-4 kill in the band — so no succession
  ever had a fresh killer as top-trust candidate. Zero skip
  opportunities existed, on either leg.
- The armed leg's identical trajectory is therefore expected, not
  suspicious: with no skip opportunity, flag-on and flag-off must agree,
  and they do on all 8 seeds.

## The scale wall (every run)

| number | baseline | armed |
|---|---|---|
| wins | 0 | 0 |
| national / global | 0 | 0 |
| table | 0 (unobserved, never inferred) | 0 |
| wave-4 unlocks | 6/8 | 6/8 |
| wave-4 faced | 6/8 | 6/8 |
| wave-4 kills | 1 | 1 |
| wave-5 unlocks | 0 | 0 |
| wave-5 faced | 0 | 0 |
| median survival | 74d | 74d |

All 16 legs end village-lost (43–140d). Six of eight seeds unlock wave 4
and face it (30 wave-4 fights across the band) but convert only 1 kill.
Wave 5 is never unlocked, never faced; readiness-5-ready days are 0 on
both legs. The wall is unchanged: kills, not gear or standing, bind.
(One seed, 99712, sits at standing 95 at death — 5 short of the wave-4
unlock — but the binding failure is the 1-in-30 kill conversion, not
standing.)

## The village, in plain words

Eight villages, all dead by day 140, most much sooner. They do not starve
first — they are fought to death. Of 120 fallen across the baseline band:
43 "the wild", 31 monster, 9 wounds that wouldn't close, 7 arena, 6
starvation, 4 contest. The median village loses 8–9 people who were never
scholars. Seed 99714 is the grimmest: 11 roster fallen, 5 of them
starvation — the only seed where hunger, not fighting, shares the blame.

Seed 99713 is the one that got far enough to matter, and it reads like the
whole winnability problem in miniature. The village reaches standing 160,
unlocks wave 4, and on day 108 Farid — the scholar himself, fighting at
haven — kills the Influencer. For one day the readiness board shows
veterans 1 of 2, short only weapons and veterans. Two days later Farid is
dead in combat at haven, and the same day Ilayda dies too; the board falls
back to veterans 0, armor 5→3, armed 5→3. The village had its first
veteran for a single day. It never gets a second. The other five seeds
that face wave 4 fight 4–8 wave-4 fights each and kill nothing.

Meanwhile the villages are bled every night by raids — Emberhold,
Ashford, Stonebridge, the Red Table stripping 800–1500 kcal a night,
several villages a night, night after night. That is the background the
wave-4 fights happen against, and it is why the pantry never recovers
enough to matter. (Raids are existing game behavior, not this arm's
finding; noted here because they shape every village in the band.)

## Sense-testing (transcript read, seed 99713 baseline)

The d110 death chain is told well and reads like a village, not a log:

> "📖 The Codex turns a page on its own. Farid Ahmed is dead. You didn't
> ask. It knew."
> "🕯️ Farid Ahmed is dead — the wild. The village stops. Somebody screams.
> Somebody else starts digging."
> "What Farid kept close goes into the ground with them — keepsakes are
> buried, never taken from the body."
> "At the grave, James, Long, Brian speak for Ilayda — 'Farid trusted them.
> We saw it. Give them the fire's hearing.' The village listens."

Then Ilayda dies the same day and gets the same rite, and the next night:
"That night, they bring Farid home. Nobody asks you to help carry; nobody
has to." The succession, the grave vouchers, the keepsake burial, the
quarrel sentence not crossing the grave — the story coheres, and the
double death on one day lands as a bad day for a real village rather than
two rows in a table.

Two honest gaps in the telling. First, the d108 Influencer kill — the
band's only wave-4 kill — leaves no cheer line in the captured say
transcript: no "the village cheers its veteran" beat on camera, only the
kill landing in the ledger and the readiness board ticking veterans 0→1
the next day. (The capture is regex-filtered and capped, so this is a
check, not a verdict — appended to sim-findings.md.) Second, the skip
line itself never fires in this pilot (no skip opportunity), so its
on-camera wording is proven only by the proof fixtures, not by a live
succession. The readiness hold beats are legible throughout: "short
[weapons, veterans]" day after day, then the board collapsing the day the
veteran dies.

## Metric review (§14)

- The power rule worked as designed: it stopped the run from claiming a
  verdict on 1 banking seed. But the pilot was underpowered by a
  predictable margin the prereg's §14b already named: killersim2 banked
  6/32 seeds (~19%), so an 8-seed band expects ~1.5 banking seeds per
  leg — below the 3 observed exits the median needs. The 8-seed pilot
  gate is the wrong instrument for a ~19%-banking-rate mechanism; the
  screen that sizes the pool (32 seeds) is the right one. No metric
  re-scoring: the primary stands as written for the screen.
- The median bar (≥19d) remains unachievable for this mechanism alone
  even at 32 seeds, for the reason §14b stated: the skip addresses only
  the NPC-at-kill minority (~29% of banked killers), while the bar needs
  the scholar-at-kill majority to move. The screen's real questions are
  the mechanism measures — does the skip fire, do skipped killers
  outlive their baseline counterparts (paired, identical seeds), do
  pairs form — not the median. If the screen NO-GOs on the median while
  the mechanism fires, the prereg's METRIC-BROKEN classification applies
  as written, and the corrected metric (paired survival on NPC-at-kill
  first killers, not the pooled median) goes to the next run.
- No balanced panel is owed: the prereg runs the panel only on pilot GO.
  The per-seed paired comparison stands as the evidence.

## What happens to the lever

NOT reverted. The prereg ties the revert to NO-GO ("On NO-GO the
instrument is reverted so no src/js trace remains"); this pilot is
UNDERPOWERED, and the 32-seed screen the prereg proposes needs the lever
in place to run. The lever stays committed, default OFF, with off-mode
byte-identical (proof) and on-mode neutral in the wild (identical
trajectories on all 8 seeds). If the screen later NO-GOs, the revert
applies then. Coordinator decides the screen.

## Named next blank

1. **32-seed screen, fresh band, same verification** (prereg-directed):
   new band, competent verbatim, 150d, baseline then armed. The question
   is the mechanism, not the median: skips fired, paired survival of
   skipped killers, pairs formed.
2. **Scholar-at-kill survival** — the majority the skip cannot reach
   (Farid again: scholar kills, scholar dies 2 days later in a haven TB
   fight). That is Loop A's sim-tbretreat-b territory (TB fight flow /
   flee-from-haven), not this arm's; reported to the coordinator, not
   chased here.
3. **Wave-4 kill cheer check** (appended to sim-findings.md): the band's
   only wave-4 kill leaves no cheer line in the captured transcript —
   verify whether the kill is narrated on camera at all.

## Run notes (adoption)

- Adopted from the cancelled 1423Z run at 1611Z: prereg committed,
  lever + proof + driver/analyzer uncommitted, no corpus. All adoption
  steps completed: lever reviewed, proof 30/30 pre- and post-rebase,
  committed `5f32408b0`, rebased onto master `4309d42a0`, pilot run and
  judged strictly against the prereg.
- Infrastructure notes: safe-commit.sh hit the known index-clobber class
  after the lever commit (committed files shown staged-deleted);
  repaired per AGENTS.md (`update-index --cacheinfo` from HEAD blobs),
  verified status empty + diff HEAD empty + hashes match. The rebase
  hit the documented stop-at-pick quirk (2nd pick in both done and todo,
  tree clean, pick unapplied); `git rebase --continue` sailed through.
  The worktree heartbeat script hung twice on registry-lock contention
  (heartbeat_at stuck at 14:49:37Z); non-fatal, reported to the
  coordinator — the tree remains registered active and the run's lock
  file is the coordinator's.
- No telemetry deviation check run: no baseline file exists for a
  deviation comparison on this arm, and the legs are identical, so
  there is nothing to deviate. Stated, not skipped silently.
