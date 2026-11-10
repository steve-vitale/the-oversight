# sim-roleform-b — role formation FIRST NUMBERS at 150d (coverage program Tier 1 #1)

- Run: `fleshout-loop-b-20261110T1730Z`, Loop B, arm `sim-roleform-b`,
  worktree `~/workspace/worktrees/sim-roleform-b`, branch `sim-roleform-b`.
- Prereg: `evidence/2026-11-10/sim-roleform-b-prereg.md`
- Band: **160201–160208** (8 seeds, pilot), horizon 150d death-aware,
  competent policy verbatim. MEASUREMENT ONLY — no game-code change.
- Verdict: **GO** per the prereg rule (instrument validity + complete
  capture on every pilot seed). The numbers themselves are the finding
  and are NOT judged by the GO bar — see "First numbers" and "Metric
  review".
- Commit: driver + analyzer + proof test + prereg + this file + per-seed
  corpora + analyzer output (see below). Ready to merge, pending ship
  (coordinator merges; no push, no bump, no live check by this arm).

## What the village looked like

Eight competent-policy villages, up to 150 days. Two lived to the
horizon (160202, 160204, endDay 151); six ended in game over between
days 117 and 148. Villages start with 12 people and end with 1–8
alive (1, 3, 5, 8, 1, 2, 1, 2). The work that gets done is still haven
labor: wood 1,407 resolutions, stone 1,403, water 865, cook 841,
deadfall 781, fish 284, garden 232, forage 24 — 5,837 resolved
assignments in the NPC window. NOBODY hunts, patrols, scouts, teaches,
or tends in these runs either — zero resolutions in hunt/scout/patrol/
teach/tend/mend on all 8 seeds, exactly as roleform-a found at 80d.
Villagers still fight (619 wave kills in the log) and teach (207
lessons taught, 188 learned) — through events and fights the policy
drives, not through assigned work. Deaths are combat deaths: of 769
death rows, villager combat 286 (37%), expedition 186 (24%), combat
169 (22%), the wild 89 (12%); starvation 2, sickness 2, a wound that
wouldn't close 2. Eight villagers were killed by named monsters
(Buffering, Gavel, Spool, The Reunion, Big-Eyes ×2, Choir Toad, The
Moderator).

## First numbers (qual ≥60 NPC days, 65 villagers)

| | 2026-11-05 baseline (120d) | roleform-a (80d) | this census (150d) |
|---|---|---|---|
| competence cells moved | 0 | 33 changed cells / 50 rung steps | **68 changed cells / 135 rung steps** |
| competence by track (rung steps) | 0 | field 14, craft 36 | **field 46, craft 89; combat/social/strange 0** |
| specialist 0→positive | 0 villagers | 0 villagers | **6 villagers — all preserver** |
| practice reps by track | n/m | n/m | **field 1,169; craft 2,319; combat/social/strange 0 (total 3,488, mean 53.7/villager)** |
| track level ≥1 (any track) | n/m | 28/45 | **45/65** |
| skills gained (npcSkills) | n/m | 224 | **361** |
| abilities gained | n/m | 41 | **103** |
| dominant tracks (distinct) | n/m | 4 | **4 (field 7, social 5, craft 2, combat 2)** |
| strong task ≥1 | 28/30 | 42/45 | **53/65** |
| hybrids (≥2 strong tasks) | 16/30 | 23/45 | **30/65** |
| top task matches occupation | 0/28 | 2/45 | **13/54 with a top task** |
| mean top-task share | n/m | 0.58 | **0.49** |
| switched top task half-to-half | n/m | 15/45 | **25/65** |
| mean stickiness | n/m | 0.49 | **0.49** |
| rung-gain lines | n/m | 195 | **249** |

Per-track table (qual60, 65 villagers):

| track | competence cells moved | villagers moved ≥1 cell | practice reps | track level ≥1 | skill 0→positive (specialist) | dominant track |
|---|---|---|---|---|---|---|
| combat | 0 | 0 | 0 | 26 | 0 | 2 |
| field | 46 steps / 17 villagers | 17 | 1,169 | 23 | 6 | 7 |
| social | 0 | 0 | 0 | 17 | 0 | 5 |
| craft | 89 steps / 21 villagers | 21 | 2,319 | 21 | 0 | 2 |
| strange | 0 | 0 | 0 | 1 | 0 | 0 |

By task (rung steps, qual60): wood 32, stone 34, water 25, cook 23,
deadfall 15, garden 3, fish 3; hunt/scout/patrol/teach/tend/mend 0.
Practice reps by task: wood 796, stone 813, deadfall 601, water 498,
cook 710, garden 23, fish 47, forage 0; hunt/scout/patrol/teach/tend/
mend 0.

Sensitivity sets show the same shape at other bars: qual30 (98
villagers) — 97 changed cells / 182 rung steps, specialist 0→positive
8, practice 4,316 reps, 64 at any track level; qual90 (36 villagers)
— 38 changed cells / 69 rung steps, specialist 0→positive 2, practice
1,605 reps, 23 at any track level. The qual90 set is small because
most villagers die before 90 NPC days — the denominator is honest,
not padded.

## What the first numbers actually say

1. **Practice scales with horizon — in field + craft only.** 150 days
   roughly doubles the 80d competence movement (68 cells / 135 steps
   vs 33 / 50) and the rung-gain lines (249 vs 195). Nothing new
   appears in combat, social, or strange practice: still 0 reps, 0
   cells, because the work is still never assigned. The shape did not
   change; it got bigger.
2. **The specialist ladder moved for the first time — through
   preserver only.** Six qualifying villagers went 0→positive, every
   one of them in preserver (food preservation: 0→1 twice, 0→3 four
   times), plus three more who moved preserver 2→3. A seventh
   preserver gain in the raw corpus (Farid Ahmed, seed 160204) sits
   outside the NPC window — he gained it after taking the mantle on
   day 105, so the judged set correctly excludes it. No other spec
   (butcher, cook, spotter, builder) moved 0→positive for anyone.
   The "skill half" of the 2026-11-05 baseline is no longer 0 — but
   only through the one specialist skill the haven-labor loop actually
   exercises. The food.js zero-gate is still intact for every other
   spec.
3. **Track levels still reach all five tracks, carried by deeds.**
   Combat level ≥1 for 26 villagers (428+ fight deeds in roleform-a's
   shape; here 619 wave kills in the log), social 17, craft 21, field
   23, strange 1. The single strange level-1 villager (the gentle
   electrician on 160204, 150 NPC days) got there the same way as in
   roleform-a: 849 death_in_family deeds across the 8 seeds — strange
   XP is still bereavement, not work.
4. **People are generalists, and the village still forgets some.**
   30/65 are hybrids, 25 switched their top task between halves,
   stickiness 0.49 — the same as at 80d. 11/65 qualifying villagers
   did NO resolved work in 60+ NPC days (among them a blacksmith and
   a mortician on 160205 with 120+ NPC days and 5–6 skills each, and
   a trail crew lead on 160207 with 0 tasks but 13 killer tales and
   field/combat level 2). They still gain skills and levels through
   lessons and fights — the track system reaches people the assignment
   system never touches. Top-task-vs-occupation moved to 13/54, up
   from 2/45 at 80d — villagers increasingly do what they are good
   at, or get good at what they do; the rows cannot separate the two.
5. **Personality still does not bend roles.** 49/65 villagers have no
   dominant track at all, and the 16 who do spread across temperaments
   with no pattern (dry→social 3, restless→field 3, cautious→social 2,
   steady→cook 2…). What differentiates villagers is still assignment
   history: whoever the policy puts on wood/stone/water gets better at
   wood/stone/water.

## Sense test (read the lines, not just the counts)

Rung-gain lines read as people getting better, with the name and the
work varying: "DeShawn is getting the hang of woodcutting", then
stonework, then the water run, across days 12–17 — one person visibly
rounding out. The template repeats (same sentence every time); the
person + task is what varies. No line ever fired for hunt/patrol/
scout/teach/tend/mend, because the work never happened. The bus
driver on 160201 (384 resolved tasks, stone/wood lead, 7 kills, all
four track levels ≥1) reads as the village's working lifer; the
160202 Social worker (150 NPC days, 0 tasks, 7 skills, social level
1, 3 kills) reads as a person the village never put to work who still
lived a full social life through lessons and fights. Verdict: reads
as people improving and living, not numbers ticking — within the
haven-labor half the policy exercises. The other half is silent, and
the silence is the finding.

## Wall numbers (the wall moved in one place, not the one that matters)

| | this census |
|---|---|
| national reached | 0/8 |
| table (offer waiting) | **8/8** |
| table entered | 0/8 |
| wins | 0/8 |
| wave-4 kills | **39** |
| wave-5 kills | **7** |
| wave kills by wave | W1 303, W2 187, W3 83, W4 39, W5 7 (619 total) |
| median survival | 147d (endDays 117–151; 6/8 game-over, 2 alive at horizon) |

Two things changed against roleform-a (80d: national 0/8, table 0/8,
wins 0/8, wave-4 kills 0, median survival 81d). First, the table
offer now arrives on every seed — all 8 villages reached the
table-waiting state (the standing offer, Steve 2026-11-06: once
offered it never withdraws), but none entered and none won. The offer
arrives; the entry doesn't. Second, wave-4 kills (39) and wave-5
kills (7) do happen on this band — but no village reaches national
and no village banks the kills into a release. The winnability chain
still stalls after the kills: kills exist, veterans and the release
do not follow under the competent policy. (Median survival 147d vs
81d is mostly the longer horizon — the 80d cap cut the earlier census
short — not a survival improvement; 6 of 8 villages still end in
game over.)

## Proof

`scripts/test-roleform-b.js` — ALL GREEN (**16/16**): T1 complete
corpus exits 0 with GO; T2 temperament normalization (bold hunter no
phantom movement, cautious teacher real rung); T3 NPC-window
exclusion; T4a competence decrease exits 1, T4b incomplete corpus
exits 1, T4c practice-rep decrease exits 1, T4d field-only corpus is
GO under the new rule (movement not judged); T5 rung-line parsing +
practice reps by track counted (craft 40, field 25); T5b wave kills
counted from the `w` field (W4 1, W5 1); T6 driver determinism — same
seed run twice at 5 days produces byte-identical corpora.

**Analyzer bug found and fixed by the proof before the evidence was
written:** the first analyzer run reported wave-4 kills 0 and wave-5
kills 0. The kill-log rows carry the wave in `w` and the kind in
`mid`; the analyzer read `k.wave`/`k.monster`, which do not exist, so
every W4/W5 kill was silently dropped. Fixed to read `k.w`, proof leg
T5b added pinning it, analyzer re-run: wave-4 kills 39, wave-5 kills
7. The first (wrong) WALL line was never published; the corrected
numbers are the ones in this file.

`node scripts/godpath/test-measurement-proof-update.js` at base —
GREEN, 9/9, before any judged sim ran (precondition).

## Method notes

- Single-leg census on current master (28a3952fd). No baseline leg
  was run: the comparison is against the recorded roleform-a (80d)
  and 2026-11-05 census numbers, per the prereg. Nothing was edited
  while the census ran.
- Balanced panel (§15): inapplicable — the panel runs its own full
  panel and takes no corpus input, so it cannot compare this census
  corpus on identical seeds (same limitation recorded by
  killersurvive-a, drive-practice-a, roleform-a and other census
  arms). The identical-seed census comparison against the recorded
  numbers is the before/after instrument, with per-seed JSON corpora
  attached: `roleform-b-seed16020{1..8}.json` (analyzer output in
  `roleform-b-analysis.txt`).
- Telemetry deviation check: ran per the body; three LOUD lines
  (national 12→0, table 16→0, wins 16→0). EXPLAINED, not a bug, and
  the baseline was NOT rolled forward. The scale-wall baseline's own
  `_regime` note says it is the "winseat — full win-side win stack"
  regime and "DO NOT compare pre-seat / courtship / readiness
  substrates against this baseline — wins are structurally ~0 there
  and telemetry-check will fire a spurious LOUD 'wins disappeared'".
  This census is a pre-seat substrate (competent policy, no winseat
  policies, 150d); 0/8 national/wins matches the standing wall state
  in every recent run. Note the sweep-rows ingest reads no top-level
  table field from these corpora, so its "table 0" disagrees with the
  analyzer's table 8/8 — the analyzer reads `wall.everTable`
  directly from the same corpora and is the authority here.
- The analyzer's "competence cells moved" total (68) counts changed
  (villager, task) cells; the by-track totals (135 rung steps) count
  rung steps. A cell moving 1.0→1.3 is 1 changed cell, 2 rung steps.
  Both are printed; neither is hidden.
- The qual60 denominator (65 villagers) is bigger than roleform-a's
  45 because the horizon is 150d instead of 80d. Horizon and
  denominator differences are noted wherever the two are compared.

## Metric review

- The GO bar worked as designed: it judged the recorder, not the
  movement, and the recorder held — 8/8 complete corpora, 0
  competence decreases, 0 practice-rep decreases, 0 unparsed rung
  lines, determinism proven byte-identical. First numbers are captured
  for every metric on every seed. No confirm spend is needed: the
  pilot's verdict does not need more power, because the verdict is
  about the instrument, and the instrument is proven.
- The movement numbers carry the roleform-a metric-review proposal
  forward unchanged: judge practice-movement per track AND track-level
  per track SEPARATELY in the next lever arm, so a verdict cannot be
  carried by bereavement deeds in strange while the work itself never
  happens. The split is now visible in the tables themselves (practice
  reps by track vs track levels by track) — the next arm should use
  them as two separate bars.
- The one structural change at 150d — preserver as the first
  specialist spec to move 0→positive — sharpens the question for the
  one-brain program: is the specialist ladder gated by the work
  actually assigned (preserver moves because preservation is haven
  labor), or by the food.js zero-gate (everything else stays 0
  because nothing else is ever practiced)? The census cannot separate
  the two; a policy/task-coverage arm that actually assigns
  hunt/patrol/scout/teach/tend would.
- The table-offer finding (8/8 waiting, 0/8 entered) is outside this
  arm's metrics but inside the wall numbers every run reports. It is
  recorded here, not chased: entry under the competent policy is a
  separate arm's question.
- Strange's single level-1 villager got there through grief again
  (849 death_in_family deeds). The verdict rule's bar does not depend
  on strange, and the gap is named, not closed.

## Blanks filled / documented

- FILLED (measured): role-formation FIRST NUMBERS at 150d on a fresh
  band — competence now moves 68 cells / 135 rung steps (field +
  craft), practice reps by track captured for the first time (field
  1,169; craft 2,319; combat/social/strange 0), specialist 0→positive
  for the first time (6 villagers, all preserver), track levels reach
  all five tracks (45/65 any level), teaching spreads skills
  villager-to-villager (207 taught / 188 learned, 54 teachers),
  wave-4 kills 39 and wave-5 kills 7 happen on this band, the table
  offer arrives on 8/8 seeds.
- DOCUMENTED (not chased): combat/social/strange practice still
  unmeasured (policy never assigns hunt/patrol/scout/teach/tend — a
  policy/task-coverage arm or the one-brain scorer's duties); strange
  has no feeding work (bereavement is its only XP source);
  personality does not yet bend roles (49/65 no dominant track, no
  temperament pattern); specialist ladder moves only via preserver
  (food.js zero-gate vs assignment coverage still unseparated);
  table offer arrives but nobody enters (competent policy never takes
  the seat); kills happen but no village reaches national or banks
  veterans into a release.
- No build proposed here beyond framing: any role-formation build
  lands INSIDE the one-brain program (Steve 2026-11-06 17:12 CST,
  item 5: duties judge by lived experience) as scorer weights and
  candidates — never a new standalone system.

## Convergence state

Axis scale-onramp / winnability chain: NOT converged — wall numbers
are national 0/8, wins 0/8, entered 0/8, though the table offer now
arrives 8/8 and wave-4/5 kills happen (39/7). Coverage program Tier
1 #1 (role formation / teaching & practice) now has FIRST NUMBERS at
150d on a fresh band; the next step is a lever arm (policy/task
coverage or one-brain duties), not another census.
