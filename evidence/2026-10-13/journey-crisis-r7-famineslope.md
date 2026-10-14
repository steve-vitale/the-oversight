# Journey: crisis leg (6) r7 — the famine→corruption slope (2026-10-13)

## Pre-registration (MEASUREMENT.md §§9–12)

- **Leg:** 6 — crisis. Fresh angle: the **famine→corruption slope**.
  r2 (2026-10-11) covered famine rationing mechanics; r6 (2026-10-13) covered
  raid defense memory; succession/outbreak had their own diags. The
  cannibalism slope (docs/CORRUPTION.md) has never been sense-tested in sims.
- **Leg question:** When a famine kills villagers, does the village bend or
  break in a sensical, human way — and does the cannibalism slope fire as
  canon promises (contextual norms: exile/horror/power; NPCs crossing the
  line on their own; temptation; prions; moots)?
- **Interesting finding criteria:**
  - npcCannibalTick fires (or the ≥35 gate makes it unreachable);
  - cannibal petitions (Red Table) arrive in the starving village;
  - moots about desecration/cannibalism, verdicts matching cannibalNorm();
  - starving-villager conversations read as desperate people, not theater;
  - the player butcher option at a person-corpse is honest (gated, narrated).
- **Seeds:** pilot 101, 202, 303 (exact literals). Policy: oracleV2 (competent).
- **Primary metric:** slope engagement — did the cannibalism slope fire at
  all this seed? (npcCannibalTick fire, temptTick fire, cannibal petition
  arrival, or player butcher/eat.) Binary per seed.
- **GO threshold:** ≥1 of 3 pilot seeds shows a slope event. 0/3 = the slope
  is unreachable in a staged famine → document, don't expand (kill rule).
- **Horizon:** 65d (20 establish + 45 famine). Famine bites within days of
  the blight (12 villagers × ~2k kcal/d vs finite stores); 45 famine-days
  gives the slope's 12%/dawn roll ~45 chances per seed. Death-aware: stop on
  collapse +10d tail.
- **Method:** establish 20d → stage CONTROLLED REAL famine (all food inflows
  intercepted from d20 — the blight story; every downstream machine —
  starvation, hunger-winter, corpses, funerals, moots, slope — fully real)
  → run to d60 or collapse (+10d tail max, death-aware).
- **Deliverables:** census in plain words, people check (transcripts),
  blanks filled/documented, reachable/fun/winnable verdict.

## Run log

### Pilot (seeds 101, 202, 303 — pre-fix code)

Controlled REAL famine: `pantryAdd`+`stockPantry` refused from d20 (the blight;
409k/287k/74k kcal blocked). All downstream machinery real.

- **Seed 101:** famine bit hard — pantry 110k→9.4k, 4 starvation deaths
  (d14/d43/d60/d62), pop 11→8. norm flipped exile↔horror correctly with
  starvingVillage(). hunger-winter fired. Slope: **0 events**.
- **Seed 202:** village collapsed to 4 (monster/sickness/contest deaths);
  hunger-winter fired. **Cannibal petition arrived d27 (3 petitioners, Red
  Table)** — turned away after 3 days ("They waited three days at the edge
  of your fire. Nobody called the moot."), narrated, not silent. Canon-correct:
  healthy village (norm=exile) declines self-declared cannibals. Slope: 0.
- **Seed 303:** collapsed to 3; 2 starvation deaths. Cannibal petition d27
  (1 petitioner), same turn-away. Slope: 0.
- **GO threshold met (2/3 seeds showed slope engagement via petitions)** →
  proceeded to root-cause the 0 NPC/player slope fires.

### The blank: the slope was unreachable for villager deaths

`corruption.js` used bare `c.kind === 'person'` gates in three places, but
EVERY villager death (starvation, thirst, wounds) registers kind `'villager'`
(corpses.js:110 `corpseIsPerson()`; the 2026-10-09 fix covered witness/glyph/
funeral gates but missed corruption.js):

1. `corpseButcher` refused villager corpses — the player's dark path on
   famine dead was gated off entirely.
2. `nearButcherableCorpse()` never found them.
3. `npcCannibalTick`'s corpse filter found nothing — the NPC half could never
   fire on famine deaths.

Worse, my own first-pass instrument had the same blind spot
(`c.kind === 'person'` filters) and reported "unburied=0" — the 4 starvation
corpses were sitting there unburied the whole famine. Instrument fixed to
`corpseIsPerson`; re-run confirmed 4 unburied person-corpses persisting.

### Fix (worktree, proof-tested)

`src/js/corruption.js`: all three gates now use `this.corpseIsPerson(c)`
(same class as the 2026-10-09 corpseIsPerson fix). Animal/monster corpses stay
refused with a corrected honest message (the old message — "Field-dressing
handles animals. This is different. This is a person." — was backwards for a
villager corpse).

- Proof: `scripts/test-crisis-slope-kind-20261013.js` — **13/13 GREEN**
  (was 5 pass / 8 fail RED). Covers: nearButcherableCorpse finds adjacent
  villager corpses; corpseButcher → human meat (+4 corruption); eatCannibal
  first meal +14 corruption; monster corpses still refused; npcCannibalTick
  fires on villager corpses (normShift moved, corpse marked npcFed);
  cannibalNorm=horror in the starving village.
- Regressions: `test-corruption-20261009.js` 40/40, `test-corpses.js` 37/37,
  `validate-ontology.js` 94/94 systems green.

### Post-fix verification

- Seed 202 re-run: petition still declined (healthy village, correct);
  slope preconditions (starving + corrupt villager + bodies) never co-occurred.
- Seed 101, 100-day famine: village collapsed 11→2 (game over d118),
  9 fallen (5 starvation), **10 unburied corpses**, maxCorr reached only 25 —
  **npcCannibalTick fired 0 times**. The hunger-erosion fuse (+1 corruption/
  starving dawn, needs ~35 to reach the ≥35 gate) is LONGER than the village's
  lifespan: starvation comes in waves, drift stalls between them, the village
  dies first. The NPC half of the slope is nearly unreachable in practice.
  → Design question for Steve (backlog): is the fuse meant to be this long,
  or should hunger erode faster / the gate sit lower? The numbers (35/55/60/85)
  are his canon — not retuned silently.

### People check (SENSE-TESTING LAW)

Starving-villager transcripts read as desperate people, not theater:
- Miguel: "I'm past hungry — do you have anything to eat? Anything at all?
  My hands shake when I try to work. Don't look away from this." /
  "I haven't eaten right in days. I can't pull my weight like this."
- Gerald/Chadi/Piyamas (seed 101): grief for Alma that lands — "Alma is gone
  and the world just... continues. That's the part I can't stand." /
  "Nobody says Alma's name right yet." / "We bury, we grieve, we keep going.
  There's no step four."
- Petition turn-away narrated; cannibalNorm answers horror/exile correctly
  from real state throughout.

### Verdicts

- **Reachable:** the slope's player half is now reachable (was hard-gated);
  the NPC half needs the fuse question answered. Petitions, turn-aways,
  hunger-winter, relief, sieges-during-famine all fire.
- **Fun:** the famine arc plays — desperation dialogue, grief, moots. The
  dark path is now a real choice with real costs (trauma/corruption/prions).
- **Winnable:** the competent village survived seed 101's famine at 8/11;
  seeds 202/303 collapsed to monsters/sickness more than hunger. Famine alone
  doesn't doom a competent village — the blight had to be total.
- **Convergence:** bug fixed + proven; fuse tuning parked as a Steve design
  call. killed-at-pilot does not apply — GO was met, fix landed.

### Metric review (§14)

Pre-registered primary metric was slope engagement per seed (binary). GO met
via petition arrivals (2/3). Post-fix, the unit proof (13/13) is the slope's
verification; live-sim NPC fires remain 0 — not re-scored as GO, recorded as
the fuse finding above. No goalposts moved.

### Telemetry deviation check

`telemetry-check.js` vs `hidden_files/telemetry-baselines/crisis.json`:
quiet — but the baseline covers the r6 raid-defense angle
(defenderFights/playerFights/defendedCount), zero metric overlap with this
run's slope angle (npcCannibalFires/temptFires). Not rolled forward: seeding
a baseline of zeros would cement "0 fires" as expected while the fuse tuning
is an open design question. The r7 angle needs its own baseline once the fuse
question is resolved.

## Files

- Fix: `src/js/corruption.js` (3 gates → corpseIsPerson)
- Proof: `scripts/test-crisis-slope-kind-20261013.js` (13/13)
- Diag: `scripts/journey-crisis-r7-famineslope-20261013.js`
  (controlled REAL famine harness; instrument bug fixed mid-run)
- Evidence: `evidence/2026-10-13/journey-crisis-r7-*` (3 pilot seeds pre-fix,
  s101/s202 post-fix, s101 100-day long famine)
