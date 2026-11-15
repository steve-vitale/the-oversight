# sim-producergate-b — PREREG (binding)

Loop B run `fleshout-loop-b-20261115T~1400Z`, axis winnability chain, arm
sim-producergate-b (Producer gate/expedition-meeting link). Branch
`sim-producergate-b`. Binding prereg: this file — frozen here,
judged in `evidence/2026-11-15/sim-producergate-b.md` without
alteration. This arm takes tracker blank (2) from the 1810Z Loop B
run: the gate/expedition-meeting link.

## The question, in plain words

The producerparty pilot (`evidence/2026-11-15/sim-producerparty-b.md`,
PILOT NO-GO) proved the re-engagement seed fires (wave-5 plan seeds
2 vs 0, plans 24 → 51, brain win-plan commits 56 → 556, departs
101 → 164) but the SEEK never does — 0 gate SEEKs for wave 5 in
either leg. All three armed wave-5 gate rows are
`avoid:outmatched`: the launch forms a party of 2 (fighter + one
companion — `findCompanion` returns one), and at the expedition
meeting the sensed party is still 2, while the gate
(`winPlanFightGate`, `src/js/win-plan.js`) demands a party of 3,
armed + armored, for wave 4+. The world-tick fights reach party 3
only because `villagerFightAllies` adds up to 2 allies at the fight
itself. The seeded plan gets the villager TO the Producer's ground
with one companion; the gate still turns them away.

This arm builds the missing link: a launched party arrives at the
wave-5 gate as 3, with the trick known.

## The lever (frozen) — two halves, one arm

**Half A — the seed, re-landed (enabling half).** The producerparty
seed (`resolveWildMonsterEncounter` vFlee → `winPlanSeedFromFight`,
commit `a02156ca`) was reverted on its pilot NO-GO, so current
master carries no wave-5 plan source at all: the scout proved 0
wave-5 plan seeds without it. A gate link with nothing to gate is
untestable — zero wave-5 plans, zero gate rows, a vacuous NO-GO.
Half A re-lands that seed byte-for-byte (same call, same vFlee gate,
same raid/aid exclusions). It is the enabling half, not the tested
half: the pilot judged the seed alone NO-GO, and this arm judges
the COMBINATION. The mechanism decomposition below separates the
halves (wave-5 seeds = half A firing; gate SEEKs = half B firing),
so the evidence can attribute.

**Half B — the two-companion launch (tested half).** When a
win-plan targets wave 4+ (plan.needWave ≥ 4, or the target species'
wave ≥ 4, or the wave-5 readiness hold names veterans as the
missing kill), the launch takes TWO companions, not one:

- `src/js/villager-brain.js` `winPlanCands`: a wave-4+ plan bids
  `party_launch` only when two companions are available at Haven;
  with one or none it bids `party_wait` (the wait the gate's
  outmatched branch already intends — go back for help — now
  applied at departure instead of at the beast). The commit carries
  `companion` + `companion2` (+ `companionsAvailable` on waits, for
  the recorder).
- `src/js/villager-brain.js` `vbrainExecuteDepart`: launches both
  companions on the same shared target, verifies each actually
  departed (a companion taken by another dawn commit is skipped,
  not double-booked), and records the actually-launched party in
  `plan.party`.
- `src/js/win-plan.js` `winPlanDepart.launchParty` (the non-brain
  fallback path): the same two-companion rule; a wave-4+ plan with
  fewer than two launchable companions does not launch, and the
  existing party-wait logic applies.
- `findCompanion` in both files gains an exclusion list so the
  second pick never repeats the first.

Why two companions actually arrive as 3, not just leave as 3:
`startExpedition` sets both companions on the same shared target,
and `expeditionLeg` moves each member one node per leg straight
toward that target — members starting together stay on the same
node, so `villagerFightAllies` (outdoor crew + earshot ≤ 1 node)
senses both at the meeting. The gate's party read is untouched:
the gate still counts only sensed allies (perception-only rule),
never the stored `plan.party` list. If sensing fails in practice
(companion dies, leaves, or desyncs mid-expedition), the gate
rows will show party 2 and the evidence will say so — the
alternative named in the findings item ("count the plan's party
in the gate") is deliberately NOT taken, because it would count
villagers who may not be there.

**The trick half — no departure-time trick wait.** The task names
"arrives as 3 with the trick known". The trick wait is NOT built
at departure, by design, and this prereg says why: the gate
already implements the wait. When the party is 3, armed + armored,
on target, but the trick is unknown, `winPlanFightGate` returns
null (`trickHolds`) — the ordinary encounter proceeds, and
surviving it teaches the trick (two observations →
`villageKnowsTrick`), so the seek opens on its own. A departure
wait would strand plans whose trick can only be learned by
meeting the beast — and the seed's whole point is to go back
after a beast you fled, trick unknown by construction. The
recorder measures `trickKnown` at every wave-5 gate row and the
`trickHolds` count, so if the trick turns out to be the binding
constraint (party 3 arrives, trick never known, SEEK still 0),
the evidence will say so and the next arm can add the wait.

What this arm does NOT change: the gate's bars (3 / armed /
armored / trick-known), any standing / readiness / deed-gate
number, the table, the seed's wave gate, or any other launch path.
Game-code diff is `src/js/game.js` (half A), `src/js/win-plan.js`
and `src/js/villager-brain.js` (half B) only.

## Seed bands (verified fresh per the seed-band-freshness skill)

- Pilot: **100781–100788** (8 seeds), control leg first (lever
  absent, current tip), then armed leg (lever on), identical
  seeds, same policy/horizon. Pilot gate: 8 seeds before/after
  before any confirm spend.
- Confirm (ONLY on a pilot GO): **100801–100816** (16 seeds),
  same two legs, identical seeds.
- NEVER 100701–100708 (producerparty scout), 100721–100728
  (producerparty pilot), 100621–100636 (confirm band, still
  fresh for the courtship confirm), 100521–100536 (gorgeprice2
  CONFIRM bands).
- Freshness check (2026-11-15): zero hits for 100781–100788 and
  100801–100816 in `evidence/**/*.md`, goal `hidden_files/`
  (convergence-tracker count 0), `~/memory/2026-11-1*.md`, and no
  `perseed-*10078*` / `perseed-*10080*` / `perseed-*10081*` dirs.

## Horizon, policy, death-awareness

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy `competent-answercourt-b` (same as the diag and the
  producerparty pilot).
- Driver: `scripts/producergate-driver-20261115.js` (RUN
  `producergate-b`; control OUTDIR
  `perseed-producergate-b-control`, armed OUTDIR
  `perseed-producergate-b-on`, confirm OUTDIRs
  `perseed-producergate-b-confirm-control` /
  `perseed-producergate-b-confirm-on`).
- Analyzer: `scripts/analyze-producergate-b.js` (pooled classes,
  kills per unlocked split field/TB, kill:death, FACED-NOT-KILLED
  share, starvation, median survival, wall numbers, encounter/
  gate/plan/launch decompositions; `judge(control, armed)`
  implements the bars below). Panel builder:
  `scripts/build-producergate-panels-20261115.js` (§15 balanced
  panels, pilot seeds 100781–100788).

## Frozen definitions (reused from sim-producerparty-b-prereg.md)

- **Wave-5 monster ids** (from `src/data/monsters.json`, wave 5):
  `cancellation`, `editor`, `rerun`, `spoiler`, `timeslot`,
  `nielsen`, `finale`, `finale_crew`, `finale_opening`,
  `network_note`.
- **UNLOCKED (per seed):** an `unlockedWave` event with wave 5
  exists (equivalently `maxWave >= 5`). Unlock day = that
  event's day.
- **FACED-DISTINCT (per seed):** final series `w5` value —
  distinct wave-5 types faced by run end.
- **KILLED (per seed):** `waveKills['5']` (0 if absent).
- **DIED-TO-W5 (per seed):** deaths with `who` in the wave-5 id
  set; split scholar vs villager by `player`.
- **KILL:DEATH ratio:** pooled wave-5 kills / pooled deaths-to-W5
  per leg.
- **VETERAN ATTRITION (per unlocked seed):** `vet5` at unlock
  day, at first-faced day, at run end; days `rd5ready` true
  after unlock; dominant `rd5short` bar.
- **NEVER-FACED:** unlocked, final `w5` = 0.
- **FACED-NOT-KILLED:** unlocked, final `w5` > 0, kills = 0.
- **KILLED (class):** unlocked, kills > 0.
- **Instrument error:** any non-empty `instrumentErrors`, any
  per-seed file failing to parse, or any seed whose unlock/faced/
  kill fields disagree (kills > 0 with `maxWave < 5`, or `w5` >
  0 before the unlock day).

## Field vs TB kills (the 1810Z prereg correction, binding here)

The producerparty metric mixed scholar turn-based (TB) kills with
villager field kills: of the armed leg's 2 kills, 1 was a villager
field kill and 1 a scholar TB kill; the control kill was a scholar
TB kill. Field-only, the legs read armed 1, control 0. This
prereg judges them separately, with separate bars:

- **FIELD KILL (per seed):** a `w5encounters` row with wave 5
  and outcome `vKill` — a villager field fight (world-tick or
  expedition path) that ends with the beast dead. Counted from
  the recorder, not from `waveKills`.
- **TB KILL (per seed):** `waveKills['5']` MINUS field kills —
  wave-5 kills not attributable to a recorded field fight, i.e.
  the scholar's turn-based combat (and arena) kills. The
  analyzer asserts TB kills ≥ 0 per seed; a negative value is
  an instrument error (a field kill the recorder missed).
- **FIELD kills per unlocked** and **TB kills per unlocked** are
  pooled separately and judged on separate bars below. The
  TOTAL kills per unlocked (field + TB) is reported for
  continuity with the diag and producerparty bars but is NOT a
  GO bar in this prereg.

## Per-encounter definitions (carried from producerparty, plus launches)

The recorder (`scripts/producergate-driver-20261115.js`) wraps
`winPlanFightGate`, `winPlanSeedFromFight`, `winPlanDepart`,
`vbrainExecuteDepart`, and `fieldFight` (wave 4+ only) and
stores, per seed: `w5encounters`, `w5gates`, `w5seeds`,
`w5departs`, `w5ids` — same shapes as producerparty, plus:

- **DEPART row (new fields):** `companions` (launched party
  size incl. the fighter: 2 or 3), `companionsAvailable`
  (companions found at dawn for a wave-4+ plan: 0/1/2), `needsFull`
  (the plan targeted wave 4+ at launch), `source` (`brain` /
  `winPlanDepart`).
- **LAUNCH (wave-4+ target):** a depart row with `result`
  `launch` and `targetWave` ≥ 4 (or a wave-4+ target species).
  Launches split by `companions` (2 vs 3).
- **SECOND-COMPANION WAIT:** a brain `party_wait` depart row
  with `winPlanAction` `party_wait` and `companionsAvailable`
  1 on a wave-4+ plan — the plan waited for its second ranger.
- **ENCOUNTER / GATE ROW / SEED / DEPART:** as in the
  producerparty prereg.

## Primary metric + GO bars

Primary metric: **wave-5 FIELD kills per wave-5-unlocked village**
(armed leg). The lever's mechanism is villagers killing Producers
in the field, on purpose, as a party of 3 — TB kills are the
scholar's separate channel and are judged only not to collapse.

GO iff ALL hold (pilot, then confirm on the same bars):

1. **Field kills per unlocked (armed) ≥ 1.00.**
2. **TB kills per unlocked (armed) ≥ 0.5 × control** (no-collapse
   bar; if control TB kills per unlocked is 0, the bar is 0 and
   passes vacuously — noted, not hidden).
3. **Kill:death (total, armed) ≥ 0.92** (the diag's armed-leg
   ratio; the lever must not buy kills with deaths).
4. **FACED-NOT-KILLED share among unlocked armed ≤ 2/10**
   (≤ 0.20; the diag's armed leg was 5/10).
5. **Cost bar:** starvation (armed) ≤ control + 2, AND median
   survival (armed) ≥ 0.8× control.

NO-GO otherwise. A pilot NO-GO is evidence-only: the instrument,
analyzer, prereg, and evidence merge; the LEVER does not merge
(killed arms leave no trace). A pilot GO spends the confirm band;
a confirm NO-GO is evidence-only the same way.

## Per-seed table (evidence file)

Per unlocked seed, both legs: seed, unlocked day, first-faced
day, faced-distinct (final w5), wave-5 kills split field / TB,
deaths-to-W5 (scholar / villager), vet5 at unlock / at end, days
rd5ready after unlock, dominant rd5short bar, median survival
(days), endReason. Plus pooled rows: field and TB kills per
unlocked, total kills per unlocked, kills per faced village,
kill:death ratio, class counts; plus the encounter decomposition
(wave-5 fights by outcome / party size / gate), the gate
decomposition (by result / reason / party size / trickKnown /
plan stage), plan seeds, departures split by launched party size
and second-companion waits, and the win-plan sums.

## Mechanism decomposition (what the evidence must show)

Whether the verdict is GO or NO-GO, the evidence names which
link held or failed, in order: (a) wave-5 plan seeds (half A
fired?); (b) launches with a wave-4+ target, split by launched
party size 2 vs 3, and second-companion waits (half B fired?);
(c) wave-5 gate rows by result/reason/party size/trickKnown
(SEEKs? outmatched on party 2? trick-hold nulls?); (d) field
kills per gate-SEEK fight vs per ordinary fight. If SEEKs fire
but field kills do not move, the review says the fight itself
— not the meeting — is the next link. If launches stay at 2,
the review says whether the second companion was unavailable
(waits) or unlaunched (depart rows).

## Proof test

`scripts/test-producergate-b.js` proves, on synthetic fixtures
and a live in-memory run (no corpus numbers): the recorder wraps
are present and record party size + launched companions + flee/
fight on a pilot seed; the wave-5 id set matches
`src/data/monsters.json` wave 5 exactly; the judge implements
the bars (GO shape + one NO-GO per bar + boundary GO); the
analyzer classifies synthetic per-seed fixtures and splits
field vs TB kills (including the negative-TB instrument error);
the driver is deterministic (same seed twice → same deaths/days/
endReason/series + identical recorder arrays); and the LEVER
static checks (the `winPlanSeedFromFight` call exists in
`resolveWildMonsterEncounter` in `src/js/game.js`; the
two-companion launch exists in `winPlanCands` /
`vbrainExecuteDepart` / `winPlanDepart`; the game-code diff
touches only `src/js/game.js`, `src/js/win-plan.js`,
`src/js/villager-brain.js` and no standing/gate/table numbers)
pass once the lever commit exists and record "not-built-yet"
before it. GREEN before the armed leg runs; re-run green on
the rebased tip before landing.

## Sense-testing

Quote the wave-5 fight lines the recorder captures
(`w5encounters[].lines` / `log`) for 2–3 wave-5 fights per leg
and judge whether the fights read like fights: do villagers
party up as three, flee sensibly, hold the line on a known
trick, go back after the same Producer — or walk in as two and
get turned away? Name the fight lines' source (seed, day,
fighter, monster) and the counts searched (wave-5 encounters
scanned, fight lines found). Do not invent fight narrative from
kill counts.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — wave 5 "The Producers" (standing
  ≥ 200 AND wave-4 faced; bands damage 50–130, HP 1000–2200,
  pierce 0.25–0.75; readiness wave 5: 4 armored P≥15, 6 armed,
  3 tricks, 2 veterans; waves 3–5 deliberately counter-less,
  signature-mechanics counterplay instead; trick learning via
  `noteVillagerTrickObservation` — two survived observations
  teach the village).
- `docs/PARTY.md` — the party concept this lever test-cases
  (cap 3 at unlock, 4 at day 14, 5 at day 30 — the scholar's
  party; the villager party of 3 here is fighter + 2 sensed
  allies through `villagerFightAllies`, the same cap the fight
  engine takes).
- Prior evidence: `evidence/2026-11-15/sim-wave5kill-b.md`
  (the finding) and `evidence/2026-11-15/sim-wave5kill-b-prereg.md`
  (definitions reused); `evidence/2026-11-15/sim-producerparty-b.md`
  and `evidence/2026-11-15/sim-producerparty-b-prereg.md`
  (the failed link this arm builds).

## Metric review (to be filled in the evidence file)

Pre-registered here: the pilot control leg is the judged
baseline. The RNG re-roll caveat carries from producerparty:
identical seeds diverge once the lever changes a draw, so
unlock counts may differ between legs; the judge normalizes by
unlocked villages, so the re-roll is carried in the metric, not
hidden. If field kills rise but TB kills collapse, the review
will say whether the scholar stopped fighting wave 5 (fewer TB
sessions) or the split misattributes (negative-TB instrument
error would have fired first). If SEEKs fire and field kills
stay below 1.00, the review will say the fight — damage race,
trick timing, wounds — is the next link, not the meeting. If
launches stay at party 2, the review will say whether the
second companion was unavailable (party_wait rows) or the
launch rule never engaged (depart rows without `needsFull`).
