# sim-seq51gap-a — the 213-HP SEQ51 gap, traced to the day

Run `fleshout-20261026T2317Z`, arm `sim-seq51gap-a`, axis scale-onramp.
DIAG / MEASUREMENT ONLY: zero `src/js` changes, no default flips, no lever proposal.
TB CHANNEL RESET (whether tb should inherit field wounds) is a Steve-call design
question: traced only, never proposed here.

## Question

From `evidence/2026-10-26/sim-w4dmg-a.md` (2026-10-26): seed 73672, the
wave-4 monster called the influencer (seq51) — its last recorded field fight
ended at 799 HP on day 143, but when the player met it in turn-based combat
(tb) on day 148, the world entity read 586 HP. A 213-HP gap with no recorded
fight in between. This arm's prescription, executed here: record the world
entity's HP on a daily tick to find where that 213 went.

## Headline answer

**The 213 HP went to the night raid's palisade toll on day 144.** The entity
was drafted in that night's palisade raid (it was the closest monster to the
Haven — day-144 tick tile 4,5, right next to Haven 4,4), took the tier-3
palisade toll of exactly 213 HP (a quarter of its 850 max HP), was not met by
any defender, and so stayed behind as a lingering monster from day 144
(`lingerSince` 144) until the player bumped into it in tb on day 148. No field
fight happened for seq51 on days 144–148 — verified: no seq51 field row in
that span. The tb-start tile read on day 148 (586) agrees with the daily
ticks on days 145–147 (586), so the old alternative — that the tile read and
the entity read measure different things — is ruled out for this window.

## Verdict: DIAG-GO (fully-accounted)

- Target window days 143–148 all present in the trace: complete.
- Window changes: exactly 2, both accounted — one field fight (C1), one
  palisade raid wall (C2). Nothing unaccounted, nothing dropped.
- Band-wide: **0 unaccounted drops, 0 unaccounted rises** across every
  wave-4 entity on all 8 seeds after the analyzer fixes below.
- G2 recorder neutrality: PASS 8/8. Re-baseline vs the 1920Z band table:
  EXACT on every field. Recorder errors 0, overflow 0.
- Proof validator `scripts/test-seq51gap-a.js`: **182 PASS, 0 FAIL**.

## Pre-registration (binding; written before sweeping)

File: `evidence/2026-10-26/sim-seq51gap-a-prereg.md`.

- Substrate: `scripts/policies/tableseat-nowait.js` (wraps `leanlinkrescue`;
  composed upon, never edited), seeds 73671–73678, 180-day death-aware
  horizon (`runDays` stops on `Game.over`).
- Re-baseline first: plain tableseat-nowait, 8 seeds, compared field-by-field
  against the 1920Z band table. Baseline is this arm's own replication, not
  another arm's corpus.
- Armed: tableseat-nowait wrapped with ONE new observational recorder,
  `scripts/policies/seq51gap-diag.js` (distinct name; existing recorders
  never edited): a daily world-entity HP tick for every wave-4 entity
  (day, spawn seq, monster type, entity hp, maxHp, tile, lingering flag,
  `lingerSince`, presence/absence) plus tick-day village context
  (`lastRaidDay`, `havenTier`, Haven tile), outermost so its snapshot runs
  after the inner policy's daily work, still before sleep. The five w4dmg-a
  recorders were reused verbatim for field fights and tb-start tile reads.
- Candidate-cause set (from a `src/js` grep before sweeping; a cause not in
  this list may not be claimed from rows alone):
  - C1 recorded field fight (`fieldFights.js` writeback).
  - C2 palisade raid wall (`havenGrowth.js` `havenRaidTick`: raid fires with
    3+ living world monsters, pantry ≥ 3000 kcal, 7-day cooldown, 18% roll,
    table not active; every drafted raider is moved to the Haven tile and,
    if `havenTier >= 2`, takes `max(1, hp - round(maxHp * 0.25))`; unmet
    raiders linger and gorge nightly on the pantry only).
  - C3 tb-end lingerer/titan restore (`game.js` `tbEnd` aftermath: a
    still-standing lingerer the scholar fled from or lost to is pushed back
    at `min(maxHp, standing HP)`; a titan at full maxHp). Applies only
    after a tb fight of that entity.
  - C4 spawn/replacement (new object, new seq; same-seq jump to base HP
    with no continuity break is NOT C4).
  - C5 removal/vanish (off the world list; the tick shows ABSENT, not a
    changed HP).
  - C6 tile-read vs entity-read measurement difference (test: the daily
    tick's entity HP around day 148 must agree with the tb-start tile HP).
  - C7 other enumerated writers (checked, no world-entity HP effect on this
    path: lingering re-pin, drift valve, wandering, spawns, and all
    villager-side fights route through C1; tb-only writers never touch the
    world object except via C3).
- DIAG-GO bar: every HP change for seq51 between days 143 and 148 accounted
  to a named cause from C1–C6, or explicitly reported as UNACCOUNTED with
  its HP amount and candidates (an honest remainder counts only if no
  change is silently dropped — every day in the window must appear); plus a
  band-wide count of unexplained HP drops; plus G2 neutrality and zero
  recorder errors. A trace with missing days or dropped changes is
  DIAG-NO-GO.

## Method

- Det-gate first: seed 73671, recorders unset == unwrapped — baseline days
  180, gameDays 181, `tsNationalDay` 107 on both sides, no diag surface, no
  wraps, 0 gap ticks. PASS.
- Full sweep: 16 seed-runs (baseline 8 + armed 8), exit 0, each ~3 minutes.
- Detail reproduction: fresh armed re-run of seed 73672 — `censusMatch=true`,
  same seq51 steps (3 total: two field fights, one raid wall), 0 unaccounted
  drops. A mismatch here would have been a loud failure, not a proceed.
- The tick recorder runs once per scholar day (duplicate same-day calls
  collapse to one row); a post-run pure-read snapshot closes the tail.
- Intra-interval anchors: a tick-to-tick interval also contains that day's
  field rows and tb-start tile reads, so the trace is a chronological event
  chain per seq (tick, field fight, tb-start tile read, tb-end) — NOT tick
  deltas alone. A night event plus a same-day tb fight plus its restore can
  all fall inside one tick interval, and only the tb-start anchor splits it.

## Day-by-day trace: seed 73672, seq51 (influencer, maxHp 850)

Spawn: day 131, tile-entry, tile 3,4, hp 850 / maxHp 850, wave 4.

| Day | Observation | HP | Tile | Lingering | `lastRaidDay` |
|-----|-------------|----|------|-----------|---------------|
| 131–138 | ticks | 850 | wandering 3,4 → 2,4 → 3,4 → 5,5 → 7,4 → 6,4 → 5,4 | false | 120, then 133 (d134), then 136 (d137) |
| 139 | field fight, fighter `visjoin_122`, outcome vFlee | 850 → 823 (−27) | — | — | — |
| 139 | tick | 823 | 5,3 | false | 136 |
| 140–142 | ticks | 823 | 5,4 → 5,5 → 5,5 | false | 136 |
| 143 | field fight, fighter `visjoin_119`, outcome vFlee | 823 → 799 (−24) | — | — | — |
| 143 | tick | 799 | 5,5 | false | 136 |
| 144 | tick | 799 | 4,5 (next to Haven 4,4) | false | 136 |
| 145 | tick | 586 | 3,2 | **true, `lingerSince` 144** | **144** |
| 146 | tick | 586 | 3,3 | true, 144 | 144 |
| 147 | tick | 586 | 5,5 | true, 144 | 144 |
| 148 | tb-start tile read, door world-bump, fightId `fmgpspj2a_8cpgkp` (same as the prior arm) | 586 | player tile 4,4 | true | — |
| 148 | tbEnd: result `lost`, round 8; player dead (−26); monster fighters standing (influencer 2395/2395, crew 2443/2443, 2310/2310, 1881/2133) | — | — | — | — |
| 148 onward | ticks | **ABSENT** | — | — | — |

The only later influencer spawn is a different entity: day 176, seq62,
tile-entry, tile 5,4 (C4 replacement, not a restore).

## The window table: days 143–148 (the verdict's core)

Exactly 2 steps, both accounted:

1. Field-start day 143 (823) → field-end day 143 (799), −24 = **C1 field
   fight** (field end day 143, influencer, `visjoin_119`, damage 24,
   outcome vFlee).
2. Tick day 144 (799) → tick day 145 (586), −213 = **C2 palisade wall**
   (`lastRaidDay` 136 → 144, raid day 144; drop 213 ==
   `round(850 × 0.25)`; havenTier 3; lingering false → true,
   `lingerSince` 144; tick-day-145 tile 3,2 is post-wander drift, not the
   dawn pin — see the analyzer fixes below).

Window days present: [143, 144, 145, 146, 147, 148] — complete. No field
fight for seq51 on days 144–148. C6 ruled out: the day-145–147 ticks (586)
agree with the day-148 tb-start tile read (586).

## The other band-wide steps (all accounted after the fixes)

Before the final analyzer fixes, the band showed 4 unaccounted drops and 3
unaccounted rises. Each was inspected, not force-classified, and each
resolved to a named cause or a documented instrument artifact:

- **73673 seq45 (algorithm, maxHp 1000), day 112** — six same-day tb
  contacts, all world-origin, lingering true. Tile reads 750 → 920 → 937 →
  1000 → 937 → 1000. Each read equals `min(1000, the prior fight's standing
  HP)` exactly (920, 937, 1000, 937, 1000): five chained **C3 restores**
  between fights. The earlier classifier took the latest same-day end for
  every step, misattributing them all; the fightId-aware fix (below) turns
  all five into C3. Background: ticks day 107–111 at 750, lingering true
  (`lastRaidDay` 106; wall 250 on maxHp 1000 explains 1000 → 750); one field
  row day 105 (1000 → 1000, damage 0, vFlee).
- **73675 seq26, day 162 → 163** — tick 175 → tick 1 (−174),
  `lastRaidDay` 148 → 162, wall 175 (maxHp 700). The wall formula floors at
  1 HP (`max(1, 175 − 175) = 1`), so the drop is 174, not 175: **C2 with the
  floor**, not a mystery.
- **73676 seq41, day 141 → 142** — tick 1300 → tb-start tile 975 (−325),
  wall 325 (maxHp 1300). The earlier classifier reported no raid only
  because the entity never reappears in later ticks, so no entity-present
  tick followed to compare `lastRaidDay`. Raid detection from tick rows
  (below) finds the raid in the interval; the tb-start tile's lingering
  flag corroborates. **C2.**
- **73672 seq43 (herald, maxHp 700), day 144** — looked like field-end 448
  → tb-start-tile 479 (+31) → tick 448 (−31). Those "tb starts" are all
  fightId-null, mid-null: `monsterTurn` calls to `startCombat` for a
  scripted-titan entity that built no fight (no fighters, no tbEnd join).
  Their tile reads merely duplicate the tick HP before that day's field
  fight (479 → 448, damage 31, vFlee). Excluding no-fight starts from
  observations (counted: 11 on day 144, 14 across days 143–144) leaves the
  clean chain tick 479 → field 479 → 448 → tick 448. Documented as an
  instrument artifact, not a real HP change; the band total counts it as
  resolved, not unaccounted.

After all fixes: **band unaccounted drops 0, rises 0** — every wave-4 HP
change in the corpus is accounted.

## Analyzer fixes (measurement-instrument corrections, disclosed in full)

These changed the analyzer only — no corpus row, no recorder, no cause set,
no DIAG-GO bar was touched. The sweep had already finished (exit 0) before
any edit, so no mid-sweep child could load a partially written file.

1. **Observation sort falsy-zero bug.** The original rank sort used
   `RANK[kind] || 9`, so `field-start` rank 0 sorted last, creating phantom
   +damage/−damage pairs around every field fight (e.g. tick 823 →
   field-start 850 (+27), field-start 850 → tick 823 (−27)).
2. **Day-grouped observation chain** (supersedes fix 1). Observations are
   grouped by scholar day — field fights (start/end pairs kept together, in
   row order) before tb-start tile reads, all of the day's events before
   that day's policy.daily tick; the last tick recorded for a day wins
   (post-run duplicate overwrites the regular tick). Days with fights but
   no tick (day-jumps, see below) still appear via event rows between
   surrounding ticks. Cross-source same-day ordering (field vs tb for one
   seq on one day) remains a day-granularity limitation; the seq43 case
   above is the one place it bit, and it is resolved by fix 6, not hidden.
3. **C2 tile condition replaced by the lingerSince stamp.** The raid pins
   raiders to Haven at dawn, but `wanderWorldMonsters` moves them off again
   before the policy.daily tick, so tick-time tile is post-wander drift,
   not the dawn pin. C2 now requires: `lastRaidDay` changed across the
   step, the post-wall value exact, `havenTier >= 2`, AND (lingering flipped
   false → true with `lingerSince == raidDay`, OR already-lingering
   re-draft, noted as such, OR — when the entity never reappears in ticks
   — the tb-start tile read itself shows it lingering, noted as such).
   A wall-sized drop on a raid day without that signature is
   `C2?-wall-amount-only` (NOT claimed as C2). The cause claimed is still
   the pre-registered C2; the cause set is unchanged.
4. **Wall-floor value check.** C2 now checks `b.hp == max(1, a.hp - wall)`
   instead of `drop == wall` (the 1-HP floor; seq51 still 586, seq26
   becomes C2 at 1).
5. **FightId-aware C3.** If observation `a` is a tb-start tile with a
   fightId, the relevant tb end is the end with that fightId (predicted
   `min(maxHp, standing HP)` from that end); otherwise the day-filter
   latest-end rule applies. Eligibility mirrors the restore code: titan +
   non-won, or lingerer + fled/lost. This turns the five seq45 day-112
   steps into C3.
6. **Raid detection from tick rows.** `raidChanged`/`raidDay`/`havenTier`
   are computed from ALL tick rows (all days), not just entity-present
   tick observations, so a raid in the interval is still detected when
   the entity is absent from later ticks (seq41 case).
7. **Null-start exclusion.** A tb start with fightId null AND mid null
   built no fight; its tile read is not a tb-start observation (counted
   per trace as `nullStarts`, never hidden). This resolves the seq43
   phantom pair.

## Tick limitation (harness day-jumps) and the restated coverage check

The scholar day can advance twice between daily phases (wait + sleep each
advance the day), so some scholar days have no tick — a harness day-jump,
not a recorder drop. Example: seed 73671 ticks 179, first day 2, last day
181 (post-run), only internal gap day 3 (2 → 4); arithmetic closes (180
expected − 1 gap = 179). Per-trace tick gaps: day 3 on every traced seed
(73671, 73672, 73673, 73675, 73676, 73677); seeds 73674 and 73678 have no
wave-4 traces. **The target window on 73672 has no tick gap day.** The
coverage check is therefore restated as: gaps listed per seed, no gap day
inside the 73672 target window — the original "every scholar day has a
tick" wording cannot hold under harness day-jumps and is disclosed as such
here (metric review), not silently rewritten in the prereg.

## Open blank (NOT part of the gap verdict; it does not dilute it)

**The final-loss non-restore.** The tbEnd lingerer restore is observed
between chained same-day fights (seq45 day 112: five successive restores
match predictions exactly), but the entity NEVER reappears in daily ticks
after the chain's final loss. Instances:

- seq51 (73672) after the day-148 `lost` fight. The C3 post-tb prediction
  for seq51 is stated as **failed**: predicted 850
  (`min(850, 2395)`), observed absent from tick day 148 onward. Conditions
  apparently met (lingering true, result `lost`, all monster fighters
  standing; tick day 148 shows no monster at 4,4, and tick day 147 likewise
  — tile occupancy at tbEnd time is not proven to block it).
- seq45 (73673) after its sixth day-112 `lost` fight (restores 1–5
  observed, final restore not observed in ticks day 113+).

No other lingerer tb end in seed 73672 restores either, but all others
there are `won`/`routed` (not restore-eligible), so seq51 is the only
`lost` lingerer case in that seed. Whether the final restore is blocked
(e.g. `monsterAt` tile occupancy at tbEnd time), thrown (the restore
block's catch only warns, and sweep output shows no titan/restore
warnings), or removed again afterwards is NOT determined by this trace.
Documented as a future trace arm's blank. The gap window ends at the
day-148 tb start, so this does not affect the DIAG-GO verdict. Note the
blank is specifically about the final loss in a chain, not about C3 in
general — the C3 mechanism itself works for intermediate restores.

## Sense section (transcripts read as a player, not just counts)

Read: the non-measured narration-on replay for seed 73672
(`evidence/2026-10-26/sim-seq51gap-a-sense.txt`, 243 lines; the replay
prints the run's tail, days 178–179, not the day 139–148 window — the
window's own narrations are field/tb rows, not prose).

- The tail's Callback (influencer) fight reads coherently: the monster
  wears a dead villager's face ("The face is too symmetrical. The eyes
  don't track you"), the telegraph is voiced ("The wrongness is the
  telegraph… Speak the funeral — or name it as NOT them"), the ally
  Ingrid has real lines ("Give it hell", "Thirst doesn't negotiate.
  Going."), and the kill lands with style ("The Callback falls", "+20
  style — dropped the Callback!"). Nothing robotic, static, or repeated
  in this sample.
- The lingering state itself is legible to the player: the night line
  "The lingering The Callback gorges at the treeline — 540 kcal gone from
  the stores. Endure it (they drift off within ~6 nights — the gorge is
  the price), or send a sortie: fighters, rations, real risk." A player
  meeting a lingerer understands what it is and what it costs.
- **Narrative gap (not a mechanical one): the day-144 wall itself leaves
  no per-monster trace.** Nothing in the transcript names the 213-HP toll
  on seq51. A player who fought seq51 at 799 on day 143 and met it again
  at 586 on day 148 would experience it as "this thing is weaker than
  when we last fought it" with no in-fiction reason offered — the raid, if
  announced at all, is announced as a raid, not as a toll on a named
  monster. The weakening is mechanically accounted and narratively
  silent. Flagged here as a writing/voicing observation, not a lever: no
  game change is proposed in this measurement-only arm.
- The separate "wave-4 defeats mourned, never taught" blank was not chased;
  the sampled transcripts do not touch it.

## Metric review (for the NEXT run; pre-registration is never re-scored)

- The tick-coverage wording ("every scholar day has a tick") does not
  survive harness day-jumps; the restated check (gaps listed per seed, no
  gap inside the target window) is the honest form and should be the
  pre-registered form next time.
- The analyzer's same-day ordering is day-granular: field fights sort
  before tb-starts within a day. It held everywhere in this corpus except
  the seq43 no-fight-start case, which the null-start exclusion now
  handles. A future analyzer should carry intra-day sequence numbers if
  same-day field-vs-tb ordering ever becomes load-bearing.
- The balanced panel (`scripts/balance-panel.js` + `scripts/balance-metrics.json`
  contract) has no corpus-ingest mode; the paired identical-seed tables
  (baseline vs armed, 8 seeds) are the comparison of record. No panel file
  was faked.
- `telemetry-check.js` was NOT run on recorder rows (recorder rows are not
  game telemetry; the proof validator re-derives every number from the
  corpus files instead).
- The C3 final-loss blank above is the one open measurement question for a
  future trace arm: instrument the tbEnd restore path itself (tile
  occupancy at restore time, whether the push-back ran, whether a later
  step removed the entity again).

## Wall numbers (this arm's corpus; baseline and armed identical)

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
| Wave-4 kills | 0 on every seed (kill-log wave-4 count 0) |

Per-seed baseline days/deaths (identical to the w4dmg arm's per-seed
days/deaths): 73671 180d/48, 73672 180d/51, 73673 124d/32, 73674 142d/won/28,
73675 180d/26, 73676 144d/won/43, 73677 152d/41, 73678 104d/38/starved 1.

Death-cause shares (307 deaths, baseline rows): villager combat 126
(41.0%), villager-vs-villager combat 85 (27.7%), player arena 43 (14.0%),
expedition 13 (4.2%), villager monster 8 (2.6%), player dehydration 7
(2.3%), sickness 6 (2.0%), wound that wouldn't close 6 (2.0%), ambush 3
(1.0%), player contest 2 (0.7%), thirst 2 (0.7%), single deaths: The
Moderator, lockjaw, The Redactor, starvation, alien, The Loud Beast (1
each, 0.3%). The wall is unwinnable fights plus unmet monsters, not
hunger — same shape as the prior arm.

Pre-existing quirk, identical in both arms, NOT a delta: seed 73672
baseline shows table=1 with nationalEver=0 (tableWaiting true at
regional-final) in both this run's and the w4dmg arm's baseline files.

## Gates and checks

- G1 det-gate: PASS (seed 73671, recorders unset == unwrapped).
- G2 recorder neutrality: PASS 8/8 (days/gameDays/ts/starvation identical;
  faced-map agreement 8/8; kill-log agreement 8/8).
- Re-baseline vs 1920Z: EXACT, all fields, both corpora.
- Cross-checks: (a) w4dmg field rows (wave 4) == wave4enc field rows
  (wave 4) per seed; (b) tb joins unjoined 0 on all seeds; (c) source-sum
  failures 0; (d) recorder errors 0, overflow 0; (e) tick coverage as
  restated above.
- Cost bar: armed starvation 1 <= baseline 1 + 2; armed median 152 >=
  0.8 × baseline 152. PASS.
- Detail reproduction: `censusMatch=true`, seq51 steps 3, unaccounted
  drops 0.
- Proof: `scripts/test-seq51gap-a.js`, 182 PASS, 0 FAIL (re-derives every
  summary number from the per-seed corpus rows, checks re-baseline, G2,
  per-seed traces, tick-gap listing, target window, C6/wall arithmetic,
  verdict, and the four classifier-fix pins).

## Files

- `evidence/2026-10-26/sim-seq51gap-a-prereg.md` (pre-registration)
- `evidence/2026-10-26/sim-seq51gap-a.md` (this file)
- `evidence/2026-10-26/sim-seq51gap-a-sense.txt` (sense replay)
- `evidence/2026-10-26/sim-seq51gap-a-sweep.log` (sweep console output)
- `evidence/2026-10-26/perseed-seq51gap-a/` (16 per-seed JSONs + summary.json)
- `scripts/policies/seq51gap-diag.js` (new observational recorder)
- `scripts/test-seq51gap-diag-sweep.js` (sweep + analyzer)
- `scripts/test-seq51gap-a.js` (proof validator)

## Needs-eyes

No. Measurement-only arm; nothing changed that Steve should playtest.
The sense finding (the raid wall is narratively silent per-monster) is a
writing observation, not a feel change.

## Status

Merged locally, pending ship (the coordinator merges; the batch ship job
owns all pushes). No push, no version bump, no live verification by this
arm.
