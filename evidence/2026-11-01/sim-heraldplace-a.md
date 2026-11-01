# sim-heraldplace-a — Herald placement vs wandering: why a located Herald is never met

- Run: fleshout-loop-a (scale-onramp), worker branch sim-muster-a
  (worktree slug unchanged; file prefixes pivoted per the
  coordinator's correction — this arm supersedes the
  muster-formation census as the primary question; that census
  was already completed on this branch before the correction
  arrived, see sim-muster-a.md, and is NOT re-run as a primary
  here).
- Arm: DIAG ONLY. Zero `src/js` changes, no gate threshold moved,
  no existing policy file edited, no routing built (#1538 still
  pending — this arm sizes the meeting, it does not build the
  route).
- Verdict: **DIAG-GO.** All ten preregistered bar items pass
  (see Proof and legs). The contact gate PASSES (1 contacted
  pilot seed), so this is a finding, not INSUFFICIENT-DATA.
- Stack (named exactly; numbers are NEVER compared across
  stacks/bases): substrate `scripts/policies/tableseat-nowait.js`
  (`LEANLINKRESCUE=1`, `TABLESEATNOWAIT=1`) + recorders reused
  UNMODIFIED: `fullseat-diag`, `wavegate-diag`, `vet2-diag`,
  `vet2mfg-diag`, `muster-diag` (`MUSTER=1`, SECONDARY CHECK
  ONLY). New instrument: `scripts/sim-heraldplace-a-sweep.js`
  (lair spawns, wander steps, villager-tick NPC coincidences,
  worldTick opportunities, dawn positions, scholar + villager
  contacts), `scripts/sim-heraldplace-a-lib.js`,
  `scripts/sim-heraldplace-a-analyze.js`,
  `scripts/test-sim-heraldplace-a.js`.
- Band: pilot 8 seeds 95301–95308 — the FIRST HALF of the
  vet2mfg/titangate band, FIXED in the prereg before sims
  (chosen because prior arms on this stack measured BOTH a
  contacted seed and located-but-unfaced seeds on it).
- Horizon: `DAYS=180`, death-aware.
- Corpus: `evidence/2026-11-01/sim-heraldplace-a/` (8 files).
- Analysis: `evidence/2026-11-01/sim-heraldplace-a-analysis.json`.
- Preregistration: `evidence/2026-11-01/sim-heraldplace-a-prereg.md`
  (commit `f937c3f08`, BEFORE any judged replay).

## The answer in one paragraph

The Herald is placed where nobody walks, wanders randomly
without ever steering toward anyone, and is met only when the
scholar happens to share its tile — which, on this band,
happened on exactly one seed, by the Herald following the
scholar home. Every lair lands 3–4 tiles east of Haven
((7,4), (7,3), (8,4) — the `+3 east` placement rule, with the
scholar standing at Haven at every placement). Once placed,
the Herald's tile movement is a symmetric random walk: on
located-but-unfaced seeds, 320 of 390 wander steps sit still
and approach (35) exactly equals retreat (35) — no steering
toward the scholar, Haven, or any villager, on any seed.
It does NOT sit on its lair either: over long windows it
roams up to 9 tiles from the lair (95301 drifts to the south
edge and spends 19 dawns at (6,8)), yet never once comes
within 3 tiles of Haven on an unfaced seed, and never once
shares a tile with a villager at any of 390 villager-ticks.
The villager channel is doubly closed: NPC nodes cluster
around Haven (1–6 distinct tiles at dawn, scholar at Haven
at dawn on every located dawn) while the Herald roams the
east and south edges, so NPC-on-Herald-tile is 0 at every
dawn and every tick. The single contacted seed (95304) is
the exception that proves the mechanism: the Herald
random-walked near the scholar, then FOLLOWED the scholar
across tile boundaries onto the Haven tile itself — zero
wander steps into (4,4) exist, so the arrival was a
non-wander move — and once scholar and Herald shared a
tile, monsterTurn contacts fired 29 refusals over days
161–165. Placement is not contact, wandering is not
seeking, and the meeting is a coincidence of shared tiles.

## Screen counts (reported whatever the gate does, per #1611/#1612)

| Measure | Pilot (8 seeds) |
|---|---|
| Pool size | 8 (95301–95308, fixed in prereg) |
| Won | 1/8 (95308, day 99 — NOT day 90) |
| Won exactly day 90 | 0/8 |
| Survived un-won past day 120 | 3/8 (95302 d181, 95304 d181, 95306 d181) |
| Located (herald lair placed) | 6/8 |
| Located-but-unfaced (+ windows) | 5/8: 95301 (50d), 95303 (16d), 95305 (5d), 95306 (9d), 95307 (28d) |
| Contacted (+ per-channel contacts) | 1/8: 95304 (30 = 29 scholar + 1 villager) |
| Never-located | 2/8: 95302 (wave 3 only, no omen), 95308 (omen stage 1 only, won d99) |

The contact gate PASSES: 95304 records Herald contacts on
this instrument (not borrowed from titangate — the new
instrument's own startCombat + resolve wrappers count them).
No confirm band was run (none pre-authorized by the prereg).

## Q1 — LAIR: where does titanPlace put the Herald?

| seed | lair day | lair tile | tile type | scholar at placement | dist Haven (Manhattan) |
|---|---|---|---|---|---|
| 95301 | 120 | (7,4) | forest_floor | (4,4) Haven | 3 |
| 95303 | 164 | (7,3) | creek | (4,4) Haven | 4 |
| 95304 | 135 | (7,4) | forest_floor | (4,4) Haven | 3 |
| 95305 | 79 | (8,4) | forest_floor | (4,4) Haven | 4 |
| 95306 | 172 | (8,4) | creek | (4,4) Haven | 4 |
| 95307 | 97 | (8,4) | forest_floor | (4,4) Haven | 4 |
| 95302, 95308 | — | no lair | — | — | — |

Every placement happens with the scholar standing at Haven
(4,4) at dawn, so the `+3 east` target is (7,4) and the
nearest free tile is (7,4), (7,3), or (8,4) — the east edge,
3–4 Manhattan from Haven, never on Haven, never on a safe
tile, never on the scholar's tile. The creek lairs (95303,
95306) are the nearest-free-tile rule working as written:
(7,4) was unavailable (occupied) on those mornings, so the
placement fell one tile over. No seed places a second herald
lair (lair count 1 on all 6 located seeds; no re-placement,
no removal recorded). Lair position is recorded on 100% of
seeds where a herald spawns (6/6, with tile + both
distances + tile type).

## Q2 — MOVEMENT: sit, wander, or approach?

Step classification vs the scholar's tile at that moment
(wanderWorldMonsters before/after diffs; sit includes
p=0.35 skips and blocked steps, so sit is measured):

| set | sit | approach | retreat | total steps |
|---|---|---|---|---|
| Located-but-unfaced (5 seeds) | 320 (82%) | 35 | 35 | 390 |
| Contacted (95304) | 120 (84%) | 10 | 13 | 143 |
| Pooled | 440 | 45 | 48 | 533 |

Approach exactly equals retreat on unfaced seeds (35/35)
and near-equals it on the contacted seed (10/13): the walk
is symmetric, which is what a random walk looks like and
what a seeking walk does not. There is no steering toward
the scholar, Haven, or villagers anywhere in the band — the
code agrees (wanderWorldMonsters picks a uniform random
adjacent step; no target is ever read).

Day classification (dawn-to-dawn, located days only):

| set | PLACEMENT | SIT | APPROACH | WANDER | CONTACT |
|---|---|---|---|---|---|
| Unfaced (5 seeds) | 5 | 60 | 20 | 28 | 0 |
| Contacted (95304) | 1 | 24 | 8 | 9 | 5 |

SIT days dominate (60/108 unfaced located days), but
APPROACH days exist (20) — net dawn-to-dawn approach
happens, yet never converts to contact on unfaced seeds,
because the scholar's dawn tile also moves and the
approach is measured against a moving target. The day
classes are consistent with the step classes: the Herald
drifts, sometimes closer at dawn, never purposefully.

It does NOT sit on its lair. Maximum displacement from the
lair (Manhattan, dawn tiles): 95301: 7, 95307: 9, 95304: 3,
95306: 2, 95303: 1, 95305: 1. The long-window seeds roam
far — 95301 spends 19 dawns at (6,8) on the south edge,
95307's dawn tiles cluster at (4,8)/(3,8)/(5,8) — yet their
minimum distance to Haven stays 3 (95301, 95303, 95307) or
4 (95305, 95306). Roaming widely and never coming near
Haven are both true: the walk is unbiased, the board is
9×9, and Haven is one tile the walk can never step onto
(safe-tile exclusion) that nobody walks out to meet it from.

Wander opportunities are NOT the constraint. WorldTicks
(tile-entry steps, the only wander chances) total
137–675 per seed (561 on 95304, 634 on 95301) — the scholar
enters tiles several times a day, so the Herald gets
hundreds of wander chances on long seeds and still never
coincides with anyone. Short-window seeds (95305: 17
wander calls, 95306: 34) have few chances, but their
non-meeting is over-determined: few chances AND no
coincidence in any of them.

## Q3 — CONTACT MECHANISM: what has to coincide?

Three coincidences are possible; the band measures all three:

1. **Scholar shares the Herald's tile (the only scholar
   channel that fired).** All 29 scholar contacts on 95304
   happen with scholar tile == herald tile — 25 at (4,4),
   4 at (3,3) — and every one is a refusal (titan gate,
   have 0). No scholar contact ever happens at a distance:
   the scholar does not "meet" the Herald from afar, the
   scholar stands on its tile while monsterTurn contacts
   fire tick after tick (days 161, 162, 164, 165).
2. **Herald follows the scholar across a boundary (the
   arrival mechanism on 95304).** The Herald is at (4,4) —
   the Haven tile — at dawn on days 160–168, with 1–5 NPCs
   on its tile at dawn, yet ZERO wander steps into (4,4)
   exist in the whole corpus. Wander cannot step onto a
   safe tile (isSafeTile exclusion), so the arrival was a
   non-wander move. The only code path that moves a monster
   onto the scholar's new tile without a safe-tile check is
   follow re-entry (game.js:12651: when the scholar crosses
   a boundary, the monster on the old tile follows into the
   new tile). This instrument did NOT wrap the follow
   function, so follow is the named candidate mechanism,
   not a wrapped proof — but wander is excluded by the
   zero-steps-into-(4,4) count, and the shared-tile episode
   (scholar moves (4,4)→(3,3) on day 165, Herald contacts
   follow at (3,3) the same day) matches follow exactly.
   Once the Herald is on the Haven tile, it stays for 9
   dawns even after the scholar leaves (days 166–168,
   scholar at (3,3)/(2,2), Herald still (4,4)) — it does
   not chase the scholar back out.
3. **An NPC shares the Herald's tile at a villagerTick
   (the villager channel).** On unfaced seeds this NEVER
   happens: 0 NPC-on-Herald-tile ticks out of 390
   villagerMonsterTicks while the Herald is present, and
   0 NPCs on the Herald's tile at any located dawn
   (NPC-near-Herald, Chebyshev ≤ 1, max 1 on two seeds, 0
   on the rest). NPC nodes at dawn occupy only 1–6 distinct
   tiles — the Haven cluster — while the Herald roams the
   east/south edges. On 95304, 5 ticks have NPCs on the
   Herald's tile and exactly 1 villager contact results
   (day 180, chen_wei, vFlee, at (5,5)) — the channel works
   when the coincidence occurs; on unfaced seeds the
   coincidence never occurs.

So #1617's 30- and 36-day windows are explained, not
mysterious: a located Herald is a single random-walking
instance placed 3–4 tiles from Haven, on a board where
villagers live on the Haven node and the scholar sleeps at
Haven at dawn on every located dawn. Wild wave-4 monsters
contact repeatedly on the same seeds because they are
spawned across the whole map at cap (pickWorldTile,
maintainWorldMonsters) and wander into people — the Herald
is one instance, placed once, east, walking randomly. The
meeting requires a shared tile, and shared tiles require
either the scholar walking 3–4 tiles east to the Herald's
ground (the policy never does — scholar dawn tile is Haven
on every located dawn except 95304's travel days) or the
Herald's random walk landing on an inhabited tile (0/390
villager-ticks, 0 dawn coincidences on unfaced seeds) or
the follow arriving with the scholar (1 seed).

## Secondary muster check (contacted seed only)

On 95304 (the only contacted seed): muster verbs 0 (no call
sounded, no commit, no council — same as sim-muster-a on
this stack), muster-diag refusal snapshots 29, hypothetical
yield at contact days 0 (days 161–165 at Haven), 2 (day 165
at (3,3)), 4 (day 180 villager contact). **The
mustercall-b headline does NOT generalize to this seed:**
no sounded call exists to compare 5/9 against, and the
hypothetical yield never reaches 5, let alone 9 or the
ceiling 10, at any contact. This is a second-seed
non-generalization, NOT a contradiction of 85106: 85106
was measured on the leadfeast stack with a different
coalition (yields 5 then 9 there), this seed is on
tableseat-nowait with yields 0–4 here. Stack/band
differences are the confound until a sounded call is
measured on a second seed — and on this stack no policy
sounds one at all, so that measurement cannot come from
this stack without a policy change (a design call, not
this arm). #1538 remains pending and NO routing is built.

## Per-seed end fields (this band, this stack — not wall numbers)

| seed | class | days | end | rank | wave | table | won |
|---|---|---|---|---|---|---|---|
| 95301 | LOCATED-UNFACED (50d) | 170 | village-lost | regional | 4 | 0 | 0 |
| 95302 | NEVER-LOCATED | 181 | survived | national | 3 | 0 | 0 |
| 95303 | LOCATED-UNFACED (16d) | 180 | village-lost | regional | 4 | 0 | 0 |
| 95304 | CONTACTED | 181 | survived | global | 4 | 0 | 0 |
| 95305 | LOCATED-UNFACED (5d) | 84 | village-lost | global | 4 | 1 | 0 |
| 95306 | LOCATED-UNFACED (9d) | 181 | survived | regional | 4 | 0 | 0 |
| 95307 | LOCATED-UNFACED (28d) | 125 | village-lost | regional | 4 | 1 | 0 |
| 95308 | NEVER-LOCATED | 99 | over-other | global | 4 | 1 | 1 |

Pooled, for orientation only: end-national 4/8, table 3/8,
won 1/8, wave 4 7/8, wave 5 0/8. End fields match
titangate/sim-muster-a per-seed tables on all 8 seeds.

## SENSE-TESTING: what the transcripts actually say

First-contact beat, 95304 day 161 (ring buffer, complete):

> "You wait. The light changes. Nothing asks anything of
> you." → "Its posture changes. Curiosity is over." →
> "Omar heads out for water." → "— DUSK — Animals stir
> again." → "You wait. The light changes. Nothing asks
> anything of you." → "⛔ THE HERALD does not notice you
> the way prey notices a hunter. ... You cannot face this
> alone — sound the call, muster 10 allied blades (you
> have 0)."

The beat reads as a meeting the fiction did not stage: an
ordinary waiting evening, a posture change, and then the
arithmetic refusal — because the scholar and the Herald
have been sharing the Haven tile since dawn, unannounced
(no arrival line names the Herald on this seed — see the
pads trap below). The omen-2 line itself ("Scouts found
its lair — tile 7,4. ... It is WAITING. You cannot face
it alone. Sound the call.") is spoken once, on day 135,
and then nothing arrives for 25 days: the Herald random-
walks (7,4)→(7,3)→(8,3)→(6,4) while the village lives at
Haven, and the fiction never says where it went. On
unfaced seeds the story is thinner: the lair line, then
silence for 5–50 days while the beast drifts to the south
edge (95301: 19 dawns at (6,8)) and nobody goes to look.
The sense failure is not a wrong line — it is a promised
arrival with no arrival mechanism: the game says "it is
WAITING" as if waiting were a meeting, and the meeting
requires a shared tile that no system steers anyone toward.

## Proof and legs (evidence, not assertion)

- Proof test `scripts/test-sim-heraldplace-a.js`: **228
  passed, 0 failed, 0 skipped** on the judged corpus (19
  synthetic cases: distances, step classes incl. the
  lateral case, day classes; 209 corpus legs incl. per-dawn
  in-bounds checks, lair completeness, step classification,
  contact completeness, verb maps).
- Contact gate: PASS (1 contacted pilot seed, 95304, 30
  contacts on this instrument's own counters).
- Recorder-neutrality leg: OFF vs ON end fields on 95304
  identical — 181d, survived, global, national 1, table 0,
  won 0, wave 4. PASS. (OFF lairs/contacts/steps read 0 by
  construction — the capture is off — so the leg compares
  end fields only, as preregistered.)
- Determinism leg: ON re-run of 95304 reproduces the judged
  per-seed JSON BYTE-IDENTICALLY (including `anchorCommit`
  — no commit landed between the judged sweep and the
  re-run). PASS, stronger than the prereg's allowance.
- Capture errors: 0 on all 8 judged seeds (sweep +
  muster-diag both).
- Smoke discipline: a single-seed smoke run (95304, to
  scratch only, never judged) confirmed the instrument end
  to end before the judged sweep (lair (7,4) d135, contacts
  30, steps 120 sit / 10 approach / 13 retreat) and was NOT
  counted as judged data. The judged 95304 run then
  reproduced the smoke's done line exactly.

## Measurement traps found (do not repeat them)

- **The "pads" needle is monster-agnostic — and it lies if
  read as herald arrivals.** The wander announcement
  ("Something pads into the clearing — <name>. It's here.")
  fires for EVERY world monster. Pads counts in the corpus
  (29 on 95301, 21 on 95303, 29 on 95306, 15 on 95307) name
  zero Heralds — they are wild monsters (Loud-Eyes, Eater,
  Algorithm, etc.). Herald-specific signals are ONLY the
  spawn events, wander-step diffs, dawn snapshots, and
  contact wrappers. No pads count is cited as a herald
  arrival anywhere in this evidence, and the analyzer never
  uses pads. A future arm that needles "pads" without the
  monster name will fabricate herald arrivals.
- **The beatOmen2 ring is pre-line, not post-line.** The
  spawn wrapper records the ring BEFORE titanPlace speaks
  the lair line (spawn precedes the say call inside
  titanPlace), so the stored omen-2 beat ends at the line
  before the lair line, not with it. The lair line itself
  is in sayLines (kind omen2) and is quoted from there.
  This affects only the beat quotation, never any count.
- **Follow is a candidate, not a wrapped proof.** The
  (4,4) arrival is proven non-wander (zero wander steps
  into (4,4) in the corpus) and follow re-entry is the only
  code path that moves a monster onto the scholar's new
  tile without a safe-tile check — but this instrument did
  not wrap the follow function. A future arm that wants
  follow proven (not just named) must wrap the boundary-
  crossing path and record follow events directly.

## Blanks filled or documented

- Filled: #1617's measurement question — lair position
  (east edge, 3–4 from Haven, scholar at Haven at every
  placement), movement classification (symmetric random
  walk, 82% sit, approach == retreat, no steering),
  roaming-not-sitting (max displacement 9), contact
  mechanism (shared tile + follow arrival + monsterTurn
  refusals; villager channel 0/390 ticks on unfaced seeds),
  screen counts per #1611/#1612, and the mustercall-b
  second-seed check (not generalized on this seed/stack).
- Documented, not filled (for later arms, NOT this one):
  (a) follow re-entry as the (4,4) arrival mechanism needs
  a wrapping proof, not just the exclusion argument above;
  (b) the nielsen lair on 95307 (omen stage 2 per
  sim-muster-a, overtime third titan) is OUTSIDE this
  instrument's herald-only scope and is unmeasured here —
  nielsen placement vs wandering is a separate census;
  (c) whether the scholar policy SHOULD walk east to a
  known lair (a policy-design question — the policy never
  walks to (7,4)/(8,4) on any seed) and whether the call
  button should be pressable from afar are design calls,
  not measurements; (d) #1538 (refused-face routing,
  re-sound after a lost muster-fight) remains pending and
  untouched by this arm.

## Metric review (mandatory)

- **Pre-registration bound the run.** Judged exactly
  against the prereg bar: 8 complete pilot seeds, contact
  gate passed on this instrument's own counts (1 seed, 30
  contacts — omen alone was never used as the gate),
  lair recorded 6/6 spawned, daily positions on 100% of
  located days (dawn snapshots present from first-lair day
  to run end; the analyzer's located-dawn counts are
  51/17/47/6/10/29 per located seed), movement classified
  on 100% of tracked days (day classes sum to located
  dawns) and 100% of wander events (533/533 steps carry a
  scholar class and a haven class), screen counts reported
  in full, neutrality on 95304, determinism on 95304
  (byte-identical), proof green, sense beats read. No
  re-scoring, no bar moved after seeing results.
- **Doubts filed, not resolved by re-scoring.** (a) Dawn
  snapshots miss intra-day position changes — the wander-
  event log is the guard (every intra-day move is a step
  event; the (4,4) arrival analysis uses steps, not dawns,
  to exclude wander). (b) "Villager paths" has no game
  object; the operational definition (NPC nodes + tiles +
  tick opportunities) is the whole claim — gossip, memory,
  and intent are not paths and are not counted. (c) Day
  APPROACH classes are measured against the scholar's
  dawn tile, which moves; the step-level approach/retreat
  symmetry (measured against the scholar tile at each
  wander call) is the steering test, and it is symmetric.
  (d) Yield values on contacted seeds reuse the
  sim-muster-a replication; no sounded call exists on this
  band to check the replication against a real call, so
  yields are counterfactuals, stated as such. (e) The
  pads needle's monster-agnosticism (above) means pads
  counts must never be quoted as herald data — this
  evidence does not quote them that way.
- **Revisions for the NEXT run, not this one.** A follow-
  proof arm should wrap the boundary-crossing path and
  record follow events (origin tile, destination tile,
  scholar move) directly. A nielsen-placement arm should
  generalize this instrument to all titans (spawn + steps
  per titan id) rather than herald-only. A policy arm
  (design call first) should decide whether any policy
  walks to a known lair before measuring "contact if the
  scholar goes looking" — without that call, a
  scholar-seeks-herald census measures a policy that does
  not exist.

## Convergence state

converging (measurement, not a lever): the scale-onramp
axis now has the placement decomposition for #1617 — the
located-but-unfaced phenomenon is a random walk from an
east-edge lair past a Haven-clustered village, not a
sitting beast and not a broken wander rule. No game change
landed and no wave-5 or full-seat reachability is shown;
the next work on this channel is the design calls in
blanks (a)/(c)/(d) above, not another census of the same
positions.

## Readiness

Merged locally, pending ship — NOT pushed, NOT version-
bumped, NOT live-verified (the coordinator merges; the
ship loop owns pushes). No `[needs-eyes]` (DIAG
instrumentation only; nothing player-facing changed).
