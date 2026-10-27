# sim-raidtrace-a — the palisade raid wall, band-wide: named, but never quantified

Run `fleshout-20261027T0321Z`, arm `sim-raidtrace-a`, axis scale-onramp.
DIAG / MEASUREMENT ONLY: zero `src/js` changes, no default flips, no
game lever proposed, no narration/game change proposed. The
specification at the end states what a future fix would need to
SHOW — it is a measurement specification, not a proposal.

## Question

From `evidence/2026-10-26/sim-seq51gap-a.md`: seed 73672 seq51
(influencer, maxHp 850) fought at 799 HP on day 143, met at 586 HP
on day 148 — the 213 HP went to the day-144 palisade raid wall,
mechanically accounted but narratively silent per-monster. This
arm measures that blank BAND-WIDE: for every tier-2/3 palisade
raid wall affecting a tracked world monster on the band, does
the raid-window transcript name the monster or its wound, or is
the weakening silent?

## Headline answer

**Every wall is named, none is quantified.** All 16 tier-2/3
palisade raid walls on the band are classified TRACED under
the pre-registered rule (the raid-window transcript names the
monster or its wound), with ZERO unclassified and ZERO
untraced — but the trace is a name in a list plus one generic
toll sentence, never a wound with a number. Toll-quantified
walls: **0/16**. No window states any monster's wall amount,
its post-wall HP, or that it was weakened at all. A player who
fought a monster at its pre-wall HP and met it later at its
post-wall HP would know, at best, that "the stakes took their
toll" on a night that monster was listed as a raider — they
could not know how much it lost, that it is now weaker, or
(for the 175→1 floor case below) that it is one hit from dead.
The prior arm's "narratively silent" finding survives this
band-wide check in its quantified form: the wall is announced
as a raid, not as a wound on a named monster.

## Verdict: DIAG-GO

- (a) Every tier-2/3 palisade raid wall affecting a tracked
  world monster on the band is classified traced vs untraced,
  with ZERO unclassified: 16 walls, 16 traced, 0 untraced,
  0 unclassified. (All 16 are havenTier 3; tier-2 walls on
  the band: 0 — the villages held tier 3 by the time these
  raids fired, so there were no tier-2 walls to classify,
  and none was dropped.)
- (b) Three raid-day transcript sense samples read and
  quoted below, each judging whether a player would know
  WHY the monster weakened.
- (c) Recorder neutrality: both det-gates PASS on seed
  73671 (transcript recorder wrap-off == plain, and census
  recorders unset == unwrapped — days/gameDays/ts/
  starvation identical, no wrap, zero lines). The census
  baseline band replicates the 1920Z table EXACTLY on
  every field. The transcript-vs-census wall-count delta
  (16 vs 14) is a corpus difference, not a base move, and
  is explained in full below (seed 73677 narration
  divergence); the prereg's rule for it — transcript
  denominator, divergence explained — is what the verdict
  judges, and the census baseline itself replicates
  exactly. Cost bar: armed starvation 1 <= baseline 1 + 2;
  armed median 152 >= 0.8 x baseline 152. PASS.

## Pre-registration (binding; written before sweeping)

File: `evidence/2026-10-27/sim-raidtrace-a-prereg.md`
(verbatim DIAG-GO bar, wall denominator, raid-window union
definition, traced/untraced rule, cost bar).

- Substrate: `scripts/policies/tableseat-nowait.js` (wraps
  `leanlinkrescue`; composed upon, never edited), seeds
  73671–73678, 180-day death-aware horizon.
- Base commit pinned: `c8770e7f4412aa6430d6daa3ce86e28484f0de20`.
  Game code (`src/js`) is unchanged since the seq51gap-a
  base commit `841ce5c31` (empty `git log` for `src/js`
  across that range; only scripts/evidence moved) — exact
  replication was expected AND verified, never assumed.
- Census corpus: the seq51gap-a sweep reused VERBATIM
  (five w4dmg-a recorders + seq51gap-diag daily tick),
  EVID redirected to `evidence/2026-10-27/perseed-raidtrace-a/`.
- Transcript corpus (new): narration-on replay per seed,
  armed recorders PLUS `scripts/policies/raidtrace-diag.js`
  (RAIDTRACE=1, emit-only recorder — `Game.emit` pushes to
  `Game.log` and draws no RNG, verified by reading
  `game.js` emit before sweeping). The transcript corpus
  derives its OWN wall list from its OWN ticks, so its
  classification is self-consistent even where narration
  trajectories diverge from the census (see 73677 below).

## Method

- Census sweep: 16 seed-runs (baseline 8 + armed 8), exit 0.
  Re-baseline vs 1920Z: EXACT. G2 neutrality: PASS 8/8
  (faced 8/8, kills 8/8). Band unaccounted drops/rises: 0.
  The 73672 seq51 window reproduced exactly (799 → 586,
  day-144 wall, havenTier 3).
- Transcript sweep: 8 narration-on seed-runs, exit 0.
  Total emit lines captured: 13,056–16,975 per seed;
  raid-window lines retained per the pre-registered union
  (sequence interval + scholar days R/R+1): 2,447–3,672
  per seed; every other line discarded by that rule and
  the discard counted in each transcript row.
- Classification: the seq51gap analyzer (traceSeq /
  classifyStep, seven disclosed fixes) reused verbatim
  for wall detection; `classifyWall` applies the
  pre-registered name/wound rule to each wall's retained
  window lines. C2? wall-candidates: 0 on this band —
  all 16 walls are full C2 with the lingering signature.
- Det-gates (seed 73671, both PASS, logs saved):
  transcript wrap-off == narration-on plain
  (180d/181 gameDays, tsNationalDay 107, starvation 0,
  wrapped=false, installed=false, lines=0); census
  recorders unset == unwrapped (same days/ts, no diag
  surface, no wraps, gapTicks=0).

## Wall table (transcript corpus; the verdict denominator)

All walls havenTier 3 (The Granary — the wall applies at
tier >= 2, and tier 3 keeps the palisade). `from→to` is the
trace step; `delta` is the wall amount (negative = lost).

| Seed | Seq | Monster | Raid day | From → To | Delta | Class | Window lines |
|------|-----|---------|----------|-----------|-------|-------|--------------|
| 73671 | 38 | suburb | 171 | 1300 → 975 | -325 | traced | 173 |
| 73671 | 40 | influencer | 171 | 850 → 637 | -213 | traced | 173 |
| 73672 | 43 | herald | 136 | 700 → 525 | -175 | traced | 149 |
| 73672 | 44 | reunion | 112 | 1200 → 900 | -300 | traced | 84 |
| 73672 | 51 | influencer | 144 | 799 → 586 | -213 | traced | 167 |
| 73673 | 45 | algorithm | 106 | 1000 → 750 | -250 | traced | 151 |
| 73675 | 26 | herald | 111 | 700 → 525 | -175 | traced | 224 |
| 73675 | 26 | herald | 118 | 525 → 350 | -175 | traced | 161 |
| 73675 | 26 | herald | 148 | 350 → 175 | -175 | traced | 146 |
| 73675 | 26 | herald | 162 | 175 → 1 | -174 | traced | 125 |
| 73675 | 28 | eater | 139 | 950 → 712 | -238 | traced | 159 |
| 73675 | 31 | eulogy | 139 | 900 → 675 | -225 | traced | 159 |
| 73675 | 32 | algorithm | 139 | 1000 → 750 | -250 | traced | 159 |
| 73676 | 41 | suburb | 141 | 1300 → 975 | -325 | traced | 276 |
| 73677 | 35 | influencer | 155 | 850 → 637 | -213 | traced | 364 |
| 73677 | 39 | reunion | 168 | 1200 → 900 | -300 | traced | 79 |

Totals: walls 16, traced 16, untraced 0, unclassified 0,
toll-quantified 0. By tier: tier 3 = 16/16 traced;
tier 2 = 0 walls present. Every wall's window contains
exactly one toll sentence (the RAID line's "The
palisade's stakes take their toll as they come over the
wall.") — that sentence is the entire wound evidence on
all 16 walls. No window names a wall amount, a post-wall
HP, or a weakened state for any monster.

## Transcript vs census: the 73677 divergence (disclosed, not hidden)

Census walls total 14; transcript walls total 16. The
whole difference is seed 73677:

| Seed 73677 | Days | Deaths | Walls |
|------------|------|--------|-------|
| Census armed | 152 | 41 | 0 |
| Transcript | 168 | 44 | 2 (seq35 d155, seq39 d168) |

Every other seed matches the census exactly (days, deaths,
walls). Narration-on therefore diverges from narration-off
on exactly one seed in eight — the transcript corpus is its
own trajectory there, and its two walls are real inside
that trajectory (both full C2, both classified from their
own windows). The likely mechanism is that live `say` /
`sysSay` fill `Game.log` (capped at 40) and System-voice
paths that are no-ops in census mode, and some
log-dependent read downstream amplifies the difference —
stated as a hypothesis, not a finding: no attribution
test (narration-on plain 73677 vs census) was run, and
the emit wrapper itself is proven neutral within
narration-on by the det-gate. Future trace arms should
pre-register which corpus is the verdict denominator
(this arm did: the transcript corpus) and should not
silently substitute the friendlier count.

## Sense section (transcripts read as a player, not just counts)

Window lines are quoted verbatim. Judgment question for
each sample: would a player who last fought this monster
at its pre-wall HP know, from these lines alone, WHY it
is weaker when next met?

### SENSE SAMPLE 1 — 73672 seq51, day-144 wall (the original blank)

The monster: influencer, 799 → 586 (-213). The player
fought it at 799 on day 143 (field fight, vFlee) and met
it at 586 on day 148.

QUOTE: 🐗 RAID — 3 raiders (The Influencer, The Understudy, Loud-Eyes) hit Haven in the night, drawn by the smell of the pantry! The palisade's stakes take their toll as they come over the wall.
QUOTE: 🐗⚠️ One of them is bigger than the usual teeth at the door — The Influencer came with this raid, and the wall was not built for its kind.
QUOTE: Nobody met The Influencer — it's still out there at the treeline. It'll gorge every night until it's driven off.

Judgment: the player knows the Influencer came in the
raid, and — unusually, because it is the raid's biggest
raider — gets a singled-out hint that the wall "was not
built for its kind." What they do NOT get is any number,
any HP, or any word like "weakened" or "wounded." The
toll sentence is generic across all three raiders; the
nobody-met line talks about the pantry (gorge), not the
monster's body. A player meeting it at 586 would have to
guess that the wall did it and guess by how much — and
the guess would be wrong in the specific: nothing says
213, nothing says 586, nothing says "it came over the
wall hurt." Named, not explained. This is the best case
on the band (singled-out biggest raider) and it still
does not quantify the wound.

### SENSE SAMPLE 2 — 73671, day-171 raid (two walls, one raid)

The monsters: suburb 1300 → 975 (-325) and influencer
850 → 637 (-213), same night, five raiders, nobody met
any of them.

QUOTE: 🐗 RAID — 5 raiders (The Suburb, The Influencer, Ugly-Eyes, The Mountain Lord, Big Ugly) hit Haven in the night, drawn by the smell of the pantry! The palisade's stakes take their toll as they come over the wall.
QUOTE: 🐗⚠️ One of them is bigger than the usual teeth at the door — The Suburb came with this raid, and the wall was not built for its kind.
QUOTE: Nobody met The Influencer — it's still out there at the treeline. It'll gorge every night until it's driven off.

Judgment: this sample shows the list-membership problem.
The Suburb gets the singled-out line; the Influencer —
which lost exactly as much as seq51 did in sample 1 —
appears only as the second name in a five-name list.
A player tracking the Influencer specifically gets no
wound line of its own, only the shared toll sentence.
Both monsters' walls are "traced" by the binary rule,
but only one of the two is even singled out, and neither
is quantified. If you did not already know the wall
formula (a quarter of max HP), nothing here teaches it:
325 and 213 are both invisible. The raid reads as a
pantry event with a list of names, not as five separate
wounds.

### SENSE SAMPLE 3 — 73675 seq26, day-162 wall (the 1-HP floor)

The monster: herald, 175 → 1 (-174; the wall formula
floors at 1 HP). This is the same herald's fourth wall
in the run (700 → 525 → 350 → 175 → 1 across days 111,
118, 148, 162) — the wall has eaten it alive, one quarter
at a time, and the transcript never says so.

QUOTE: 🐗 RAID — 3 raiders (The Herald, Ugly-Eyes, The Living Wire) hit Haven in the night, drawn by the smell of the pantry! The palisade's stakes take their toll as they come over the wall.
QUOTE: 🐗⚠️ One of them is bigger than the usual teeth at the door — The Herald came with this raid, and the wall was not built for its kind.
QUOTE: Nobody met The Herald — it's still out there at the treeline. It'll gorge every night until it's driven off.

Judgment: the worst case on the band, and the clearest
"would NOT know." The monster is at 1 HP — one hit from
dead — and the transcript frames it as an undiminished
lingering threat ("it'll gorge every night until it's
driven off"). A player meeting it next would expect a
700-HP herald (or at least a healthy one) and find a
corpse-in-waiting, with no line anywhere suggesting it
was nearly killed by the wall. The nobody-met line does
not merely omit the wound; its threat framing actively
misleads about the monster's state. If any wall deserved
a per-monster wound line, this one did.

### Villagers acting like people (brief)

The sampled raid windows contain no defender dialogue
because, in all three samples, nobody met the raiders —
the "Nobody met X" line repeats once per raider (3–5
times a night) in identical template form. That repetition
reads as a list, not as broken dialogue, and the
following nights' gorge lines keep the lingerers present
as a cost ("540 kcal gone") rather than forgetting them.
Nothing robotic, static, or repeated beyond the
template itself was flagged in these samples; the blank
here is informational (no wound amounts), not vocal.
The separate "wave-4 defeats mourned, never taught"
blank was not chased; the sampled transcripts do not
touch it.

## Wall numbers (census corpus; baseline and armed identical)

| Field | Value |
|---|---|
| Seeds | 8 (73671–73678) |
| Wins | 2/8 |
| National-ever / national-final | 6/8 / 5/8 |
| Table / entered | 4/8 / 2/8 |
| Wave-4 / wave-5 | 6/8 / 0/8 |
| Median survival / max | 152d / 180d |
| Deaths total | 307 |
| Starvation deaths | 1 |
| Max Arc | 4 |
| Wave-4 kills | 0 on every seed |

Per-seed census days/deaths: 73671 180d/48, 73672 180d/51,
73673 124d/32, 73674 142d/won/28, 73675 180d/26,
73676 144d/won/43, 73677 152d/41, 73678 104d/38/starved 1.

Death-cause shares (307 deaths, census armed rows):
villager combat 126 (41.0%), villager-vs-villager combat
85 (27.7%), player arena 43 (14.0%), expedition 13 (4.2%),
villager monster 8 (2.6%), player dehydration 7 (2.3%),
sickness 6 (2.0%), wound that wouldn't close 6 (2.0%),
ambush 3 (1.0%), player contest 2 (0.7%), thirst 2 (0.7%),
single deaths: The Moderator, lockjaw, The Redactor,
starvation, alien, The Loud Beast (1 each, 0.3%).
Pre-existing quirk, identical in both arms, NOT a delta:
seed 73672 baseline shows table=1 with nationalEver=0
(tableWaiting true at regional-final) in both this run's
and the seq51gap arm's baseline files.

## Village assessment (plain words)

The villages in this band mostly survive and mostly reach
national standing (6 of 8), but they do not finish the
game: only 2 of 8 win, only 2 of 8 ever enter the table,
and no village ever reaches wave 5. Nobody kills a wave-4
monster on any seed — the wave-4 monsters in this band are
weakened by the palisade wall, lingered past, or fought to
a flee, never put down. Deaths come from fights — villagers
fighting each other and the arena account for more than
two-thirds of all deaths — not from hunger (one starvation
death in 307). In plain terms: the wall is doing quiet work
the villagers are not credited for, the monsters it wounds
are never finished, and the top of the game (wave 5, the
table, the win) stays out of reach on this band. The
measurement blank this arm filled is narrow but real: the
wall's wounds are announced as a raid and a list of names,
never as wounds with sizes — so a player cannot learn the
wall's effect from playing, only from the formula.

## Specification (NOT a proposal — what a future fix would need to show)

A future narration change addressing this blank would
need to show, under this same measurement (same seeds,
same classifier, same window definition): for every wall,
a raid-window line naming THAT monster AND stating its
wound as a number (wall amount or post-wall HP) or as a
legible weakened state tied to that monster — i.e.
toll-quantified > 0 for every wall and name-explicit for
every wall, with zero unclassified. Anything less (a
generic toll sentence, a biggest-raider hint, a
lingering-threat line) is already measured here and does
not close the blank. No change is proposed or landed by
this arm.

## Analyzer fix (measurement-instrument correction, disclosed in full)

The first `classifyWall` toll-quantified proxy counted any
window line containing a digit plus a toll word — which
fires on the RAID line itself ("3 raiders ... stakes take
their toll"), where the digit is the RAIDER COUNT, not a
wound amount. That version reported tollQuantified=16/16.
It was replaced, before the evidence was written and with
the primary traced/untraced rule untouched, by the strict
form the prereg's secondary grading actually defines: a
line must name the monster AND carry a number equal to
the wall amount or the post-wall HP. Re-running
`--classify` after the fix gives tollQuantified=0/16 and
identical primary counts (16 traced, 0 untraced,
0 unclassified). The first (wrong) number is disclosed
here rather than buried; the fix changed the analyzer
only, no corpus row, no window, no prereg bar.

## Metric review (for the NEXT run; pre-registration is never re-scored)

- The toll-quantified proxy above is the one instrument
  error this run caught: a digit + toll word is not a
  wound amount. The strict form (name + amount/HP) is
  the honest form and should be the pre-registered form
  next time.
- The raid window (full scholar days R and R+1) is
  generous: 79–364 lines per window, mostly unrelated
  narration. The sequence-interval sub-window alone
  would be tighter; the union was pre-registered and is
  kept, but a future arm should consider narrowing to
  the sequence interval once the raid's emit-day
  attribution is confirmed on more seeds.
- Narration-on diverges from narration-off on 1 seed in
  8 (73677). Future trace arms must pre-register the
  verdict corpus (done here) and must not substitute
  counts across corpora; an attribution test for the
  divergence (which log-dependent read amplifies it)
  is an open instrument question.
- The balanced panel (`scripts/balance-panel.js` +
  `scripts/balance-metrics.json` contract) has no
  corpus-ingest mode; the paired identical-seed tables
  (census baseline vs armed, transcript vs census) are
  the comparison of record. No panel file was faked.
- `telemetry-check.js` was NOT run on recorder rows
  (recorder rows are not game telemetry; the proof
  validator re-derives every number from the corpus
  files instead).

## Gates and checks

- G1 det-gate (transcript recorder): PASS (seed 73671,
  narration-on plain == wrap-off; days/gameDays/ts/
  starvation identical; wrapped=false; lines=0).
- G1 det-gate (census recorders): PASS (seed 73671,
  recorders unset == unwrapped; no diag surface, no
  wraps, gapTicks=0).
- G2 recorder neutrality (census): PASS 8/8 (days/
  gameDays/ts/starvation identical; faced 8/8; kills 8/8).
- Re-baseline vs 1920Z: EXACT, all fields, census
  baseline and census armed identical.
- Cost bar: armed starvation 1 <= baseline 1 + 2; armed
  median 152 >= 0.8 x baseline 152. PASS.
- Classification completeness: 16/16 walls classified,
  0 unclassified; every wall's raidDay has a retained
  window entry; every retained window line satisfies
  the pre-registered union condition (proof-verified).
- Census wall recount: 14 (2+3+1+0+7+1+0+0); transcript
  wall recount: 16 (same plus 73677's 2). Both recounts
  recomputed from raw rows by the proof validator.
- Proof: `scripts/test-raidtrace-a.js`: **157 PASS, 0 FAIL**
  (run after this file was written so its sense-quote
  checks read the final text; the count above was then
  written into this bullet and the proof re-run clean —
  see commit report).

## Files

- `evidence/2026-10-27/sim-raidtrace-a-prereg.md` (pre-registration)
- `evidence/2026-10-27/sim-raidtrace-a.md` (this file)
- `evidence/2026-10-27/sim-raidtrace-a-census.log` (census sweep console output)
- `evidence/2026-10-27/sim-raidtrace-a-transcript.log` (transcript sweep console output)
- `evidence/2026-10-27/sim-raidtrace-a-detgate.log` (transcript det-gate)
- `evidence/2026-10-27/sim-raidtrace-a-census-detgate.log` (census det-gate)
- `evidence/2026-10-27/perseed-raidtrace-a/` (16 census rows + summary.json + 8 transcript rows + 8 transcript docs + raidtrace-classification.json)
- `scripts/policies/raidtrace-diag.js` (new observational recorder)
- `scripts/test-raidtrace-a-sweep.js` (transcript sweep + classifier)
- `scripts/test-raidtrace-a.js` (proof validator)

## Needs-eyes

No. Measurement-only arm; nothing changed that Steve should playtest.
The sense finding (walls named but never quantified) is a
writing observation, not a feel change.

## Status

Committed in the worktree (see commit report); ready for
the coordinator to merge locally, pending ship. No push,
no version bump, no live verification by this arm.
