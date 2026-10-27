# sim-raidtrace-a — PRE-REGISTRATION (binding, written BEFORE sweeping)

Run: fleshout-20261027T0321Z, arm sim-raidtrace-a, axis scale-onramp.
DIAG / MEASUREMENT ONLY: zero src/js changes, no default flips, no
game lever proposed, no narration/game change proposed from this
arm. At most, the evidence file specifies what a future fix would
need to show (marked as specification, not a proposal).

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md
(wave 4 = The Mirror Draft, standing >= 100; bands damage 35-95,
HP 850-1500, pierce 0.2-0.5) and the palisade raid wall in
src/js/havenGrowth.js (havenRaidTick: raid fires with 3+ living
world monsters, pantry >= 3000 kcal, 7-day cooldown, 18% roll,
table not active; every drafted raider is moved to the Haven
tile and, if havenTier >= 2, takes max(1, hp - round(maxHp *
0.25)); unmet raiders linger). Haven tiers: 2 = The Palisade,
3 = The Granary — the wall applies at tier >= 2, so "tier-2/3
palisade raid wall" means a C2 wall step at havenTier 2 or 3
(and any C2 step at another tier, if one occurs, is classified
too and grouped by its tier — nothing is dropped).

## Question (from sim-seq51gap-a.md, DOCUMENTED BLANK — not re-litigated)

Seed 73672 seq51 (influencer, maxHp 850): fought at 799 HP on
day 143, met at 586 HP on day 148. The 213 HP went to the
day-144 palisade raid wall (round(850 x 0.25)), mechanically
accounted — but the prior arm found NO per-monster transcript
trace: a player who fought seq51 at 799 on day 143 and met it
at 586 on day 148 would experience weakening with no
in-fiction reason. This arm measures that blank BAND-WIDE:
for every tier-2/3 palisade raid wall affecting a tracked
world monster on the band, does the raid-window transcript
name the monster or its wound, or is the weakening silent?

## Substrate

- tableseat-nowait (scripts/policies/tableseat-nowait.js, wraps
  leanlinkrescue; compose upon it, never edit it), seeds
  73671-73678, 180d death-aware horizon (runDays stops on
  Game.over).
- Base commit (pin): c8770e7f4412aa6430d6daa3ce86e28484f0de20
  (worktree HEAD at arm start). Game code (src/js) is
  unchanged since the seq51gap-a base commit 841ce5c31
  (git log 841ce5c31..HEAD -- src/js/ is empty; only
  scripts/evidence moved), so the 1920Z band table is
  expected to replicate exactly — but it is VERIFIED, not
  assumed: this arm's own census baseline is compared
  field-by-field against the 1920Z table (wins 2/8,
  national-ever 6/8, national-final 5/8, table 4/8, entered
  2/8, wave-4 6/8, wave-5 0/8, median 152d, deaths 307,
  starvation 1). Any delta is reported field-by-field and
  explained as a base move before any verdict is judged;
  never judged against a stale baseline.
- Census corpus: the seq51gap-a sweep reused VERBATIM
  (scripts/test-seq51gap-diag-sweep.js, five w4dmg-a
  recorders + seq51gap-diag daily tick, no edits), with
  EVID redirected to evidence/2026-10-27/perseed-raidtrace-a/
  (never /tmp, never another run's live filenames). The
  seq51gap analyzer (traceSeq / classifyStep, with its
  seven disclosed fixes) is reused verbatim for wall
  detection; no cause, no bar, no corpus row is touched.
- Transcript corpus (NEW, this arm): narration-on replay
  per seed, armed recorders PLUS ONE new observational
  recorder, scripts/policies/raidtrace-diag.js
  (RAIDTRACE=1, distinct name, existing recorders never
  edited): it wraps Game.emit ONLY (the single narration
  write path; emit pushes to Game.log and draws no RNG,
  touches no game state — verified by reading game.js
  emit before sweeping), records every emitted line with
  a running sequence index, scholar day, surface, and
  text, and records the emit-index at each policy.daily
  tick (tickEmitIndex[scholarDay]). At end of run it
  retains, per raid day, only the raid-window lines (see
  below) plus every line containing 'RAID', plus per-day
  line counts and the tickEmitIndex map; all other lines
  are discarded by that rule and the discard is counted,
  never hidden. The transcript corpus derives its OWN
  wall list from its OWN ticks (self-consistent even if
  narration trajectories diverge from the census); the
  census wall count is reported alongside for comparison.
  Transcript rows are written as s<seed>-transcript.json
  and s<seed>-transcript-armed.json, distinct from the
  census s<seed>-baseline.json / s<seed>-armed.json.

## Tracked monsters and wall denominator

- Tracked = every wave-4 entity in the tick corpus
  (wave field 4, by spawn seq), all 8 seeds, census and
  transcript corpora separately.
- A wall = a trace step whose cause is C2-palisade-wall
  OR C2?-wall-amount-only (wall-sized drop on a raid day
  without the full lingering signature). C2? steps are
  wall CANDIDATES, classified the same way and flagged
  as signature-incomplete — they are never silently
  dropped, and a C2? step classified traced is reported
  as traced-candidate, not as a full C2.
- The denominator for verdict (a) is the TRANSCRIPT
  corpus's wall count (the corpus that has transcripts
  to check). The census wall count is reported in the
  same table. If the two counts differ, the difference
  is explained (narration divergence, if any) and the
  verdict still judges the transcript denominator —
  never re-based mid-run onto the friendlier count.

## Raid window (pre-registered, sequence + day union)

For a wall with raidDay R (lastRaidDay change in the
tick rows) and nextTickDay N (smallest tick day > R,
or end-of-run if none), the raid window is the UNION of:
  (i) emit lines with sequence index in
      (tickEmitIndex[R], tickEmitIndex[N]] — the lines
      emitted between the raidDay tick and the next tick
      (the raid fires in the sleep after the raidDay
      tick, before the next tick); and
  (ii) emit lines with scholar day == R or R+1.
The union is used because the raid's scholar-day stamp
at emit time depends on whether sleep has rolled the
day before progDaily runs; either sub-window alone
could miss the burst. Per wall, the evidence records
which sub-window(s) matched. A window with zero lines
is classified untraced with reason 'no window lines'
(a capture failure if it occurs, reported loudly) —
never left unclassified, never silently widened.

## Classification (primary, binary — task definition)

For each wall, let W = its raid-window lines.
- NAME match: W contains the monster's true name
  (src/data/monsters.json def.name, case-insensitive
  substring, with or without a leading 'The ') OR its
  unknown descriptor (def.unknown, case-insensitive).
  (After System arrival the display name IS the true
  name; a village-agreed name would appear in the RAID
  line but cannot be resolved to a seq from the corpus
  alone, so a village-name-only match is NOT claimed
  as a name match — it falls through to the wound test
  below, and is noted as name-unverified.)
- WOUND match: W contains a wall-specific wound word
  in a raid-window line: 'palisade', 'stakes', 'toll',
  or 'wall'. (The RAID line's toll sentence —
  "The palisade's stakes take their toll as they come
  over the wall." — is the canonical wound text. The
  defense beat's 'hurt' refers to DEFENDERS, not the
  monster, and does NOT count as a wound match. A
  per-monster amount or HP number is NOT required for
  the primary binary — it is the secondary grading.)
- TRACED iff NAME match OR WOUND match. Otherwise
  UNTRACED (with reason: 'no name, no wound word' or
  'no window lines'). Every wall gets exactly one of
  TRACED / UNTRACED. ZERO unclassified is the bar;
  a wall that cannot be decided is DIAG-NO-GO, not a
  footnote.

## Secondary sense grading (does NOT re-score DIAG-GO)

Per sampled wall (see Sense), grade separately:
  - toll-quantified: the window states a number
    attached to THAT monster's wound (amount, HP, or
    'weakened by' figure). Expected: none — the RAID
    line states a generic toll, never a per-monster
    figure. This grading, not the primary binary,
    carries the "would a player know WHY it weakened"
    judgment: name-only + generic toll != understanding
    a -213 wound on a monster last fought at 799.
  - name-explicit: NAME match as above, with the
    matching line quoted.
  - would-player-know-WHY: a plain-words judgment per
    sample, quoted from the window lines.

## DIAG-GO threshold (binding — judge against this header)

DIAG-GO iff (a) every tier-2/3 palisade raid wall affecting a tracked world monster on the band is classified traced (transcript in the raid window names the monster or its wound) vs untraced, with ZERO unclassified; (b) at least 3 raid-day transcript sense samples read and quoted, judging whether a player would know WHY the monster weakened; (c) recorder neutrality: det-gate seed identical on days/gameDays/ts/starvation recorder on/off, and band wall numbers replicate the baseline table or any delta is explained as a base move. Cost bar: armed starvation <= baseline starvation + 2 AND armed median days >= 0.8 x baseline median. A miss is DIAG-NO-GO, never re-scored mid-run; metric doubts go under "metric review" in the evidence file for the NEXT run. Every evidence file carries a "metric review" section.

Notes on (c) as applied here:
- Det-gate seed 73671, transcript recorder: narration-on
  plain tableseat vs narration-on tableseat + raidtrace
  wrap with RAIDTRACE unset (no wrap installed, no
  surface, zero lines) — days/gameDays/ts/starvation
  identical. The seq51gap census det-gate (recorders
  unset == unwrapped) is re-run by the reused sweep's
  --detgate mode and must also pass.
- "Band wall numbers replicate the baseline table":
  the census baseline band table vs 1920Z (above);
  plus the transcript corpus wall count vs the census
  armed wall count, reported with any divergence
  explained. A census baseline delta vs 1920Z that is
  NOT explained as a base move is DIAG-NO-GO.
- Cost bar uses census armed vs census baseline
  (starvation, median days) exactly as written.

## Sense section

At least 3 raid-day transcript samples, from at least
2 seeds, each quoted verbatim (window lines) with a
plain-words judgment: would a player who last fought
this monster at its pre-wall HP know, from these lines
alone, WHY it is weaker when next met? Prefer the
73672 seq51 day-144 wall if it appears in the
transcript corpus; otherwise take the earliest three
walls and say so. Sense samples come from the
transcript corpus (narration-on), never from census
rows. Do NOT chase the separate "wave-4 defeats
mourned, never taught" blank — note it only if the
sampled transcripts touch it.

## Wall numbers (report for the coordinator's band compare)

National-ever/final, table, entered, wins, wave-4,
wave-5, wave-4 kills, median survival, death-cause
shares — census baseline and census armed, plus
transcript-corpus days/median for comparison. Also:
wall count by havenTier, by seed, by monster type;
traced/untraced split; toll-quantified count (secondary).

## Metric review

Every evidence file carries a "metric review" section
(§14). Metric doubts go there for the NEXT run, never
a mid-run re-score. BALANCED PANEL (§15):
balance-panel.js has no corpus-ingest mode (standing
limitation from prior arms) — the paired identical-seed
tables are the comparison of record. No panel file is
produced or faked. scripts/telemetry-check.js is NOT
run on recorder rows (its counts are wrong on recorder
rows); the proof validator re-derives every number
from the corpus files instead.
