# Long-run sim — lever 3 (villager agency) r2: the teach chore is real (2026-10-11)

**Lever played:** the HAVEN_CHORE `teach` chore made real + the knowledge
bridge that feeds it. Three small, documented changes, all in the
teach/learn lane:

1. **`agencyTeachVillager(teacherVid, learnerVid)`** (new, `src/js/villager-agency.js`):
   a villager who knows plants (the identity system — `plantsKnownBy`)
   teaches a fellow villager one plant they don't know yet, via
   `villagerLearnsPlant(…, 'taught')` — the same real teaching the
   duty-system `teach` task does, but ambient, not assigned. The learner
   gains +1 tracking xp (fieldcraft, the way discoveries earn it); a real
   lesson record lands in `a.lessons`; the teacher gets the honest
   `'taught'` deed (mag 1). Spoken line and deed name the plant through
   `plantDisplayName` — knowledge-gated, so the player reads a name or an
   honest descriptor, never a leak. Monster lore stays the player channel.
2. **Chore honesty** (`src/js/villager-objectives.js`): `objPick` only
   offers the `teach` chore to villagers who actually know a plant (the old
   pool let anyone claim teaching — theater); `objTick`'s teach branch now
   calls `agencyTeachVillager` on a villager actually at Haven (trust
   bumps both ways, honest deed, specific line). No learner in earshot →
   "going over their finds, re-tying the bundle" — never claims a lesson
   was given. The old branch bumped trust + seeded a `generous` deed gossip
   while transferring nothing.
3. **Agency bridge** (`src/js/game.js`, forage-duty return): the
   "X also learned to recognize [plant]" line now makes the claim true —
   the discoverer gets `villagerLearnsPlant(vid, p.id, 'fieldwork')`.
   Before, only the village `sharedKnowledge` store grew while the
   discoverer's own `plantsKnownBy` stayed empty.

**Why this lever:** the prior agency run (sim-agency.md) documented the
teach chore as theater and queued it. A probe then found the deeper
starvation: the teach/learn channel only ever saw expedition discoveries
(rare, deadly) — 0–1 villagers per 20 runs × 200d ever reached 3 plant
discoveries — while the village's daily foraging (its main plant
interaction) fed a parallel store the agency system couldn't see. Two
knowledge tracks, never meeting. The bridge connects them; the chore
spends the resulting knowledge honestly.

**Method:** `scripts/sweep-agency-teachv.js` (extends the prior run's
sweep: + villager-lesson/learner/teacher telemetry) — 20 fixed seeds 1–20
× 200 days, competent policy + askRound hook, identical seeds before/after.
Raw JSONs: `hidden_files/agencyteachv-before.json` /
`agencyteachv-after.json` (goal workspace, not the repo).

**Unit proof:** `scripts/test-agency-teachv-20261011.js` — 20/20 × 3 seeds
(V1 real plant identity taught; V2 +1 tracking xp; V3 lesson record;
V4/V6/V9 red cases — no plants / bad learner / nothing new → taught:false
with nothing spent or recorded; V5 honest deed; V7 player codex untouched;
V8 chore gating 300 picks each way; V10 objTick end-to-end; T3
transcript/view agreement). **Sense tooling:**
`scripts/test-agency-teachv-sense-20261011.js` — stages a teacher at Haven,
captures exactly what the player reads + ledger consequences, for human
reading.

## Before → after (identical seeds 1–20 × 200d)

| measure | before | after |
|---|---|---|
| **villager→villager lessons** | **0** | **273** |
| learners / teachers | 0 / 0 | 143 / 133 |
| 'taught' deeds (ledger) | 31 | 301 |
| tracking xp sum | 976 | 1246 (+270 ≈ 1/lesson) |
| agency tiers t0/t1/t2/t3 | 180 / 12 / 15 / 1 | 183 / 22 / 6 / 4 |
| median survival | 55d | 58d (max 85→105d) |
| survived / village-lost | 0 / 20 | 0 / 20 |
| player deaths (per 100d) | 113 (10.2) | 145 (12.3) |
| — combat / starvation share | 57.5% / 38.1% | 51.0% / 48.3% |
| villager deaths (per 100d) | 91 (8.2) | 68 (5.8, −30%) |
| — combat share | 65.9% | 76.5% |
| wave unlock (w1/w2/w3 runs) | 3 / 14 / 3 | 1 / 15 / 4 |
| arc reach | 2 arc2 / 18 arc3 | 20/20 arc3 |
| won / tableWaiting | 0 / 0 | 0 / 0 |
| scale | 20/20 village; national 0 | 20/20 village; national 0 |
| teachable entries created / left | 21 / 3 | 19 / 5 |
| plants taught to player | 18 | 14 |
| monsters taught to player | 25 | 22 |
| expeditions | 52 | 54 |
| counters discovered | 118 | 147 |
| mean breadth / stage / tier | 42.5 / 2.8 / 0.9 | 44.1 / 2.9 / 1.0 |

**Lever verdict:** the channel went from decoration to a living system —
273 real plant-transfers in 20 runs (was 0), ~1.4 per village per 200
days per capita: a rare, special event, not a faucet. The player-ask
channel is unharmed (entries/asks flat). Two honest caveats: (1) villager
deaths/day fell 30% while player deaths/day rose 20% — the per-seed
pattern is consistent (17/20 seeds) but the sim is chaotic-coupled (the
prior run documented 5/20 seeds diverging on a no-RNG change), so the
mechanism is not proven. Best hypotheses: more villagers surviving →
more mouths → food pressure shifts onto the player (starvation share
38→48%); and/or trajectory noise. (2) the 'taught' deed ledger is now
teaching-heavy (301 vs 31) — each deed is a distinct real transfer
(a teacher can only teach a given learner each plant once), and the
50-deed ring cap handles recency, but the book's texture changed.

## Design notes and judgment calls (Steve can overrule)

- Teachable entries stay the PLAYER's ask currency — villager lessons
  don't spend them (first design did; the sweep showed the player's
  askRound out-competes the chore 19–0, starving the channel). Villagers
  teach from the identity system; lessons write no codex, so the
  declining player faucet is untouched.
- The player-ask path (agencyTurn) is unchanged and unharmed.
- `firstRef` instead of `displayName().split(' ')[0]` everywhere a
  villager name enters a deed or spoken line — the old pattern rendered
  "A taught A" / "A shows you" for stranger descriptors. Also fixed the
  two pre-existing instances in `agencyTeachPlant`/`agencyTeachMonster`
  ("A shows you …") and `agencyTurn` ("A taught you …") — same honesty
  family, two lines each.
- Transcript/view split fixed (sense-caught): `agencyTurn`'s exhausted
  fallback returned a no-repeat-ledger-blocked line, so the view showed
  "There's more, but that's for another fire." while the transcript
  denied it. Now: three honest closers tried through the ledger, then the
  exchange ends (noop) — the canon exhausted-thread behavior.

## Reachability (lever-3 area)

- Villager→villager teaching: was unreachable theater (0 lessons in the
  baseline 20×200d); now reachable and real — sense scene: 14 lessons in
  30 day-parts, multi-generational (a learner re-taught the same plant
  onward), deeds and xp landing.
- The duty-system `teach` assignment already taught real plants when
  assigned; the objective chore is the ambient counterpart. No conflict.

## Village assessment (plain words)

The village teaches itself now. Before, the only teaching was the player
interrogating returners; villagers with a lifetime of plant knowledge
never passed on a single leaf. Now the botanist shows the new kid the
Goldenrod, the learner shows someone else the orange-fruit tree a week
later, and the ledger remembers who taught whom. Per capita it's rare —
about one lesson per villager per lifetime — which is exactly the
texture: teaching is a small, real event, not a system humming.

Who thrived: background experts (botanists, herbalists, foragers) became
the village's teachers — their occupation knowledge finally does
something visible. Learners climbed: tier-1 villagers nearly doubled
(12→22), four reached tier 3. Who died: fewer villagers overall (−30%/day),
but the player died more often (+20%/day, starvation-weighted) — the
likely price of more mouths surviving. Nobody reached national, the
table, or a win on either side; wave-3 unlocks ticked 3→4 runs, arc 3
went 18/20→20/20.

Missing capabilities: the knowledge is still plant-only — monster lore
has no villager-side store (by design, documented). The water-fetch
theater still dominates the ambient feed (below).

## Blanks FILLED

1. HAVEN_CHORE 'teach' theater (queued by the prior run).
2. Forage-duty discoverer didn't personally learn the plant the line
   claimed they learned (identity bridge).
3. "A taught A" naming collapse in teach deeds/lines (firstRef).
4. Transcript/view split on exhausted agency asks (closers + noop end).

## Blanks DOCUMENTED (not fixed)

- Water-fetch to a full cistern: still the loudest theater in the ambient
  feed ("returns with 10L, but the cistern only holds 0L more" ×6+ for one
  villager in 12 days). Water/objective area, out of this lane.
- Pre-existing: `test-villager-agency.js` "monster: kill reachable" still
  fails (verified pre-existing, not mine); `test-villager-agency-20261007.js`
  still crashes on stale API (`Game.daylifeOf is not a function`).

## Sense findings (transcripts read, seed 7)

- Teach scene: "the man in his 40s, with thick glasses is showing the man
  in his 40s, with tattooed arms the Goldenrod — leaf, stem, smell."
  Specific, sensical, knowledge-gated (unknown plants render as honest
  descriptors: "a tree with orange fruit, soft when ripe").
- Deeds: "the person in their 30s, with a limp taught the woman in her
  30s, with a slouched posture a cluster of waxy white pipe-shaped
  flowers…" — real people, real consequences, in the ledger.
- Ordinary conversation and ambient lines read human (departures,
  returns, visits, guards, deeds). The cistern waste is the one
  repeated robotic note.
