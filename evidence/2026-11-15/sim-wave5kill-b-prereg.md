# sim-wave5kill-b — PREREG (binding)

Loop B run `fleshout-loop-b-20261115T1630Z`, axis winnability chain, arm
sim-wave5kill-b (DIAG on wave-5 killing). Branch `sim-wave5kill-b`.
Binding prereg: this file — frozen here, judged in
`evidence/2026-11-15/sim-wave5kill-b.md` without alteration.

## The question, in plain words

The just-landed gorgeprice2 CONFIRM GO
(`evidence/2026-11-15/sim-gorgeprice2-b.md`, commit `740838f3c`)
proved the lever gets villages TO wave 5 (armed unlock 10/16 vs
control 4/16) but NOT killing there: 11 wave-5 kills total across
16 armed villages, 14 across 16 control villages. The chain's next
binding link is wave-5 KILLING, not wave-5 unlocking. This arm is
a DIAG, not a lever: decompose the 11 armed-leg kills per seed
into faced vs killed vs died, name the binding blocker with
counts, and name the next lever. No game code changes; no re-run
of the gorgeprice2 legs.

## Data source (frozen — no new sims in this arm)

The gorgeprice2 CONFIRM corpora already on master (commit
`740838f3c`, verified present in this worktree):

- Armed leg: `evidence/2026-11-15/perseed-gorgeprice2-b-confirm-on/`
  (16 files, seeds 100521–100536, policy
  `competent-answercourt-b`, 150d, lever ON).
- Control leg: `evidence/2026-11-15/perseed-gorgeprice2-b-confirm-control/`
  (16 files, same seeds/policy/horizon, lever OFF) — contrast read
  only: wave-5 unlocks 4/16, 14 kills there.
- Horizon 150d, death-aware (dead villages stop simulating).
- No re-run of either leg. A fresh instrumented rerun is a NEXT
  arm, not this one.

## Corpus-shape scoping (done BEFORE this prereg, field inventory only)

Before writing this prereg the corpus schema was inspected to
learn which fields exist — no judged number below is taken from
that inspection; every judged number comes from the analyzer run
AFTER this prereg is committed. What the corpus carries:

- `events`: `unlockedWave` (wave, day) and `standingGated` only.
  No per-encounter records.
- `waveKills`: total kills per wave (`'5'` = wave-5 kills).
- `series` rows (per day): `w1`–`w5` = cumulative DISTINCT monster
  types faced per wave (the deed-feed counts — deedGateReady needs
  2 distinct wave-5 types faced); `vet4`/`vet5` = living veterans
  (wave-(w-1)+ killers); `rd4ready`/`rd5ready` and `rd4short`/
  `rd5short` = the readiness bars short that day, from
  `Game.waveCombatReadiness(w)` (armor / weapons / tricks /
  veterans).
- `deaths`: `{day, kind, who, cause, player}` — `who` is the
  monster id for monster kills, so deaths TO a wave-5 monster are
  countable (split scholar `player:true` vs villager).
- `linkLines`: `{day, line}` — voiced lines. Wave-5 monster names
  appear in 0 armed-leg linkLines (1 in control): fight lines are
  effectively absent from the corpus.
- `instrumentErrors`: present per file (must be empty).

## What the corpus does NOT carry (stated plainly, frozen)

- Per-encounter party composition: ABSENT. No party-size-at-fight
  field exists anywhere in the per-seed files. The prereg's
  "party that fought" is therefore measured only by proxies:
  end-state `vet5` (living wave-4+ killers) and series `pop`.
- Per-encounter flee outcomes: ABSENT. Fled wave-5 encounters
  leave no record — a seed can only be classed FACED-NOT-KILLED
  (distinct types faced > 0, kills = 0), never "fled N times".
- Per-encounter gear tier: ABSENT. No per-fight armor/weapon
  field; only the readiness shorts (`rd5short`) and the aggregate
  `ctxCounters.geared` / `dryWeaponDays` proxies.
- Fight lines for wave-5 fights: ABSENT (see above). Sense-testing
  reads what fight-adjacent lines exist (deaths, gorge/sortie
  lines) and names the recorder gap as a finding.
- Consequence: the task brief's per-encounter classification
  (killed / fled / died / faced-not-killed per encounter) is NOT
  measurable from this corpus. The classification below is
  PER SEED, which the corpus supports exactly. The per-encounter
  instrument is a named NEXT arm (fresh recorder + rerun), not
  this one.

## Frozen definitions

- **Wave-5 monster ids** (from `src/data/monsters.json`, wave 5):
  `cancellation`, `editor`, `rerun`, `spoiler`, `timeslot`,
  `nielsen`, `finale`, `finale_crew`, `finale_opening`,
  `network_note`.
- **UNLOCKED (per seed):** an `unlockedWave` event with wave 5
  exists (equivalently `maxWave >= 5`). Unlock day = that event's
  day.
- **FACED-DISTINCT (per seed):** final series `w5` value —
  distinct wave-5 types faced by run end. First-faced day = first
  series day with `w5 > 0`.
- **KILLED (per seed):** `waveKills['5']` (0 if absent).
- **DIED-TO-W5 (per seed):** deaths with `who` in the wave-5 id
  set; split scholar vs villager by `player`.
- **KILL:DEATH ratio:** pooled wave-5 kills / pooled deaths-to-W5
  per leg (armed and control).
- **VETERAN ATTRITION (per unlocked seed):** `vet5` at unlock day,
  at first-faced day, at run end; days `rd5ready` true after
  unlock; dominant `rd5short` bar (most frequent short list after
  unlock). Readiness is NOT monotonic — `vet5` can fall after
  unlock when veterans die; the diag reports whether the door
  re-shorts after opening.
- **NEVER-FACED:** unlocked, final `w5` = 0.
- **FACED-NOT-KILLED:** unlocked, final `w5` > 0, kills = 0.
- **KILLED (class):** unlocked, kills > 0.
- **Instrument error:** any non-empty `instrumentErrors`, any
  per-seed file failing to parse, or any seed whose unlock/faced/
  kill fields disagree (e.g. kills > 0 with `maxWave < 5`, or
  `w5 > 0` before the unlock day).

## Primary metric + GO bar (instrument validity — this is a DIAG)

Primary metric: **wave-5 kills per wave-5-unlocked village**
(armed leg), decomposed per seed as above.

GO bar (all must hold; a DIAG GO means the instrument answered
the question, not that a lever works):

1. Every unlocked seed in the 16 armed-leg corpora classified
   into exactly one class — NEVER-FACED / FACED-NOT-KILLED /
   KILLED — **0 UNCLASSIFIED**.
2. **0 instrument errors** across all 32 corpora (both legs).
3. The diag names the binding blocker with counts (e.g.
   never-faced vs faced-not-killed vs killed-but-killer-died,
   with the kill:death ratio and the veteran-attrition read) AND
   names a next lever (a concrete lever, not "more measurement").
4. Control contrast reported on the same decomposition (4
   unlocked, 14 kills): same classes, same ratios.

NO-GO if any unlocked seed is unclassifiable, any instrument
error appears, or the counts cannot separate the blockers (e.g.
all unlocked seeds in one class with no discriminating signal).

## Per-seed table (evidence file)

Per unlocked seed, both legs: seed, unlocked day, first-faced
day, faced-distinct (final w5), wave-5 kills, deaths-to-W5
(scholar / villager), vet5 at unlock / at end, days rd5ready
after unlock, dominant rd5short bar, median survival (days),
endReason. Plus pooled rows: kills per unlocked village, kills
per faced village, kill:death ratio, class counts.

## Proof test

`scripts/test-wave5kill-b.js` proves, on synthetic per-seed
fixtures built by hand (no corpus numbers): each outcome class
(NEVER-FACED, FACED-NOT-KILLED, KILLED) classifies correctly;
the unclassified guard fires (kills > 0 with maxWave < 5; w5 > 0
before unlock day); instrument-error detection fires; the
kill:death ratio and veteran-attrition summaries compute
correctly; the wave-5 id set matches `src/data/monsters.json`
wave 5 exactly. GREEN before the analyzer runs on the real
corpora. Analyzer: `scripts/analyze-wave5kill-b.js` (read-only;
prints JSON + the per-seed table).

## Sense-testing

Read the fight-adjacent lines for 2–3 wave-5 fights: the deaths
rows (who died to what, on which day, scholar or villager) and
any linkLines within ±2 days of a wave-5 death. Judge whether
villagers act like people — do they party up, flee sensibly, use
abilities — or walk in solo and die? The corpus carries no fight
lines and no party records, so the honest answer may be "the
corpus cannot show this" — say so plainly, with the counts of
what was searched (linkLines scanned, hits found), and log the
recorder gap as a finding. Do not invent fight narrative from
kill counts.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — wave 5 "The Producers" (standing
  >= 200 AND wave-4 faced; bread counts at most 100 toward the
  t5 bar); bands damage 50–130, HP 1000–2200, pierce 0.25–0.75;
  apex (Cancellation, Editor, Finale) a 7–10 round fight for a
  godhood build. Readiness bars for wave 5: 4 armored (P >= 15),
  6 armed, 3 tricks, 2 veterans (killed wave-4+). Waves 3–5 are
  deliberately counter-less — the signature-mechanics counterplay
  is the learning channel, not a `counter` field.
- Prior evidence: `evidence/2026-11-15/sim-gorgeprice2-b.md`
  (the finding this arm diagnoses) and
  `evidence/2026-11-15/sim-gorgeprice2-b-prereg.md` (corpus
  definitions reused: deaths, series, linkLines).

## Metric review (to be filled in the evidence file)

Pre-registered here: the per-seed (not per-encounter)
classification is a deliberate narrowing forced by the corpus —
if the classes fail to separate the blockers, the review will
say so and the per-encounter recorder becomes the next arm's
first deliverable, not a mid-run rescue. If `w5` (distinct types
faced) proves to be a weak proxy for encounters (repeat fights
against one type are invisible), the review will name that bias
explicitly: faced counts UNDERSTATE encounters, so
FACED-NOT-KILLED is a lower bound on exposure.
