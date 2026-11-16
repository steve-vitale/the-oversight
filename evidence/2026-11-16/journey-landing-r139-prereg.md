# journey-landing r139 — PREREG (Lane A, leg 0 LANDING)

**Run id:** journey-landing-20261116T0847Z (scheduled Mon 2026-11-16 02:45 CST).
**Base:** local master at run start (`2fd2dad1f`, journey-scale r223).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg: establishment.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch `journey-landing`).
Heartbeat at registration; heartbeat re-armed every <15 min for the whole run.
Lock: no stale lock (none present at run start); fresh lock created 2026-11-16T08:48Z.

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1162–1171**. Searched `evidence/` for exact band namings
("1162–1171", "1162-1171", "seeds 1162", "band 1162", "1162, 1163") —
**zero hits**. Landing preregs name bands 1142–1151 (r121–r138, deliberate
reuse), 1122–1131 (r119), 1083–1092, 1073–1082, 1063–1072, 1053–1062,
1043–1052, 897–906 (contaminated), 887–896, 867–876, 857–866, 847–856,
837–846, 817–826, 797–806, 777–786. Band 1162–1171 is fresh; no prereg,
forbidden list, or contaminated list names it. The r138 band (1142–1151)
is NOT reused this run: r139 is a fresh-band regression watch, not a
within-run before/after, so a new RNG stream is the honest comparator
against r137/r138's identical panels.

## Q1 (PRIMARY) — regression watch on the post-r138 master, fresh band

Since r138's base (`2a7d3c857`), `src/js/` changed in exactly three files
(`git diff 2a7d3c857..HEAD -- src/js/`, 29 insertions, 2 deletions):

- `conversation.js` +10: crisis r223 F1 — the five convoDriftNote
  stage-direction tails ("{Name} has an edge today — something
  curdled." + four siblings) are now matched by
  convoSnippetIsStageDirection, so a resume opener can no longer quote
  a drift note as the grief thread's memory. Directly in the landing
  leg's conversation domain: the r139 panel is the live watch for this
  fix. Any resume opener quoting a drift-note tail is a Q1 failure on
  live data (the proof test covers the predicate; the panel proves it
  in the wild).
- `villager-agency.js` +19/−1: sim-launchdef-a profile-gate bypass —
  a bid-and-selected `party_launch` commit now bypasses the dawn
  profile gate (wanderer/explorer only); all other launch conditions
  still apply. Landing window is wave 1 and launches are wave-4+, so
  expect NO landing-window movement — but any dawn-behavior drift
  (departures, node presence, sortie counts) in d1–28 is a Q1 finding
  to report, not a silent pass.
- `build.js`: version stamp only.

**Interesting if:** any r138 bar moves on the fresh band; any drift-note
tail quoted as memory in a resume opener; any launch/departure behavior
change in d1–28; scholar deaths recur (see watch below).

**Bars (bind, identical to r138, judged against r132/r134/r135/r136/r137/r138):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG invariant PASS.
- Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10.
- Pocket watch: 0 pocket fights, 0 stuck turns.
- D1 watch: 0 garbled-label renders.
- HEED: legacy count reported; **HEED-V = 0 BINDS**.
- M-PR1: max per-seed never-offered ≤ 1 (r129 bar).
- Personal bridge: 0 repeats in a sitting. Small bridge: 0 repeats.
- Presshop farUnreached REPORTED only (r137 proposal adopted).
- R66 HUNGRY: starvation deaths 0, starvingWarnings 0.
- 1130-d6 amnesia shape: 0 recurrences. Miriam line: 0 "That's settled".
  Deflect-fallback: 0 `fellBack`.
- Nodloop: LOOP=0.
- Q1 panel watch: resume-takes of deflected question-wants re-pose the
  question — report the count; a take that still ends in the generic
  acknowledgment is a Q1 failure on live data. verbatimRepeats 0,
  verbatimRepeatsExempted = re-poses observed; spot-check each exempted
  line against its transcript (a non-re-pose exemption is a Q1 failure).
- Pilot first: seeds 1162–1165; expand to all 10 unless the pilot is
  broken (a broken pilot is a loud failure, not a quiet skip).

## Scholar-deaths watch — METRIC CANDIDATE (r138 metric review)

r136: 0 scholar deaths, r137: 2, r138: 2 (same two deaths, same days,
same causes, succession latency 0 and 1). **If ≥1 scholar death occurs
on the r139 panel, the scholar-death metric is EARNED** (third panel
running): from r140 it binds as a reported metric, with the bar proposed
in r139's metric review (candidate: ≤1 scholar death per 10-seed panel).
No bar binds in r139. Report count, day, cause, and succession latency
per death either way.

## Q2 — People check (M5, sense-read)

Read 5 full transcripts from the Q1 panel. Bar: each sitting shows the
NPC wanting something, options engaging or deflecting it, endings
resolving / planting / owing. No fabricated shared history, no filler
loops, no static menus. Include at least one resume-take sitting if the
panel produces one (Q1 watch) and read it for the re-pose AND for any
drift-note tail quoted as memory.

## Q3 — Telemetry

`telemetry-check.js` on the Q1 panel vs
`telemetry-baselines/landing-split.json` (re-pinned r136: 81/9/217/15/0).
LOUD lines are same-run investigation items. Baseline is NOT rolled
unless the panel carries new information.

## Q4 — Gate

`node scripts/check.js --quick` in the worktree
(`--cacheDirectory=/tmp/jest-cache-playtest`); adjudicate every failure
against pristine HEAD. 0 attributable is the bar.

## Policies / seeds

- Landing panel: seeds 1162–1171, 28d, r139 driver (r138 driver verbatim
  except OUTDIR `landing-r139-after`, header, default seeds).
- No threshold, bar, price, or gate changes in this run except the
  scholar-death metric earning rule above (which binds from r140, not
  r139). If the panel surfaces a further game defect, fix in the
  worktree with a proof test, or document and carry.

## ADDENDUM (pilot finding, 2026-11-16T09:2xZ — instrument fix before the full panel)

Pilot (seeds 1162–1165, DAYS=28, fixed driver pending) read
`verbatimRepeats: 2, verbatimRepeatsExempted: 1` against the bound bar
of 0. Both repeats were read in full from the saved transcripts:

1. **Henry shape (1164 d6, Henry) — BY-DESIGN re-pose, instrument gap.**
   The sitting opens with a greeting ("Can we talk?..." — openerCount 1)
   and the curious question ("Is there someone here you don't trust?
   Be honest.") is spoken on the next turn (first occurrence THEM index
   1, NOT < openerCount), so the R138 opener rule misses the deliberate
   re-pose after the want-thread resume ("We never finished — who you
   don't trust."). Same false flag as r137's, in a new opener shape.
   FIX (driver-only instrument, zero src/js): the driver records, at
   each want-thread resume take, the THEM index the re-posed line will
   occupy (current THEM count — the engine speaks the re-posed question
   as the very next THEM line after the take). `splitVerbatimDupes`
   gains an optional 5th argument `reposeIndices`: a duplicate
   occurrence is exempt when its occurrence index is a recorded repose
   index ('repose' rule), alongside the unchanged R138 opener rule; at
   most one exemption per distinct line and one per recorded index.
   Proof test `scripts/test-landing-r139-verbatim-repose-greeting-20261116.js`
   **23/23** on a REAL Henry-shape sitting (staged talk request +
   react/more walk to surface the question): the re-pose is exempted via
   'repose', the no-index control counts it real (RED control), the
   opener rule still exempts a Liam shape (case 6), inputs never mutated.
   R138 proof test still **19/19** (no regression). Pilot re-run with the
   fixed driver: `verbatimRepeats: 1, verbatimRepeatsExempted: 2` — the
   Henry line now logs `RE-POSE EXEMPT (resume x1, repose)`.
2. **Olivia shape (1165 d9, Olivia) — REAL repeat, carried as a finding.**
   "Sure — what's on your mind?" spoken twice in one 28-turn sitting
   (turns 5 and 26), both times as the reply to the player picking
   `[dlg:subject]`. It is one of six lines in the `small` bridge pool
   (`convo-beats.js` BRIDGES.small), picked via `convoPickCycle` with a
   keep-3 window that is global-recency-based (r153 cross-key reset):
   the sitting used the small pool 6 times (5 distinct lines), the pool
   exhausted, the reset freed the line (three other-pool servings had
   pushed it out of the keep window), and the reshuffle re-served it.
   The r127 comment's "seven small-bridges before any repeat" does not
   hold when other pools' servings dilute the keep window. This repeat
   is REAL under the bound bar and is NOT re-scored away: the full panel
   runs with the fixed instrument and Olivia-shape repeats read as real
   repeats. Metric review will carry the fix owed (per-sitting bridge
   memory or a bar revision) — no game change in this run; the fix
   touches shared pick-cycle machinery used by every pool and is not a
   safe mid-panel change.

The full panel below runs with the fixed instrument. The pilot-prefix
log is preserved at `evidence/2026-11-16/journey-landing-r139-pilot-prefix.log`.

## Carried (unchanged)

- Teaching the shared chooser to take nv:accept (r197 lane decision owed).
- Hunt assignments still never resolve in the landing window (H1-ESTABLISHED).
- NV sittings share one closing template (palms-pressed goodbye) — middles
  are their own; observation only.
- Analyzer vs transcript streak count (r134 carry — analyzer maxSameStreak=1
  on nv sittings vs transcript summary maxStreak=4–5; no bar depends on it).
- `test-convo-engine-trust.js` verbatim closeLine (6 pass / 1 fail on
  r137/r138, pre-existing on pristine) — carried as an observation.
- Measurement-proof + phone-frame-proof staleness pair (standing; refresh
  owed via the update scripts — maintenance, not this run, unless this
  run's gate shows them moved).
- Hungry-at-horizon watch: r137/r138 both 4/10 (same four seeds). Report
  the r139 count; a move in either direction is a Q1 finding.
