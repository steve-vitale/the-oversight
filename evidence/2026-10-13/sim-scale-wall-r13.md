# Long-run sim — scale-wall r13: the FEAST lever (2026-10-13)

Lever 0 as a lens on the wall. Standing context: scale-onramp is the blocking
axis (national 0/8 on the last honest 8-run baseline; median survival ~48–82d;
wave 4–5 organic unlocks 0).

## Pre-registration (docs/MEASUREMENT.md §11 — written BEFORE any run)

- **Primary metric:** national reach per seed (`nationalHeldDays > 0`), over
  8 runs: seeds 11/22/33/44 × policies belongseek/leadcourt.
- **GO threshold (pilot):** national ≥ 2/8 AND median survival ≥ 1.2× the
  baseline median. Below either → KILL AT PILOT, no confirm spend. Judge the
  run against this header.
- **Horizon:** 150d, death-aware (dead villages stop; ≤10d tail). Reachability
  lever (national/table/wave-4 deed gate) per MEASUREMENT §10 — national needs
  the day-76+ staging window (r6: `lead sz4` live d70, gate clears d76).
- **Seeds:** 11, 22, 33, 44 (the wall suite). **Policies:** belongseek,
  leadcourt — the scale-push policies whose food-deed gap r8 found.
- **Baseline:** re-run on this tree's tip FIRST (gates off — the tip moved
  since r11/r12: playtest social commit a8bea26b). Verify stable, don't assume.
- **Lever:** ONE policy-side feast layer (scripts/policies/feastscale.js),
  opt-in via `FEASTSCALE_R13=1` (default OFF → parent-identical). No game-code
  changes this run.

## The find (diagnosis, this run)

The food-r7 feast machinery (competent.js `eveningFeast`, wired into
`competent.upkeep` — inherited by belongseek/leadcourt) NEVER FIRES on the
scale-push path. Instrumented diag (seed 11, belongseek, 60d):

- Devotion lane arms fine: `sentimentTaught: true`, `prog.feastSurge: true`
  (channelDevotion works through the inherited daily).
- At dusk: `atHaven: true`, `feastPlan().ok: true` (affordable, legal).
- **Blocker: `gives7: 0` on every dusk, all 60 days.** The food-r7 rule —
  "the scholar must have given ≥1500 kcal in the last 7 days" — reads only
  `v.gives[vid]` (pantry donations). A courtship scholar's own foraging barely
  covers their pack buffer (donateHaul keeps a full day's buffer; the scholar
  eats ~1,000 kcal/day from the pantry, gives ≈ 0) — their real contribution
  is TRIBUTE/TEND paid weekly from the same pantry, which the rule doesn't see.

So the feast chain is unreachable BY CONSTRUCTION for the scale-push
policies: 0 feasts → 0 grants → 0 combat uses → `prog.feastSurgeUsed` never
marks → the table's lesser-seat food-deed rung (`sentimentTaught &&
feastSurgeUsed`, table.js:84) and the Arc IV wave-4 deed gate (progression.js
deedGateReady) can never fill. r8 measured the gap ("0 feasts on all 4
belongseek seeds"); this run found the gate that manufactures it.

## The lever (exact, policy-side only)

`scripts/policies/feastscale.js` — one shared layer, two wrappers:

- `belongfeast` = belongseek + the r13 feast layer
- `leadfeast` = leadcourt + the r13 feast layer
- `FEASTSCALE_R13=1` enables the layer; unset (default) → pure delegation,
  parent-identical behavior (proven in the proof test's RED phase).

The layer:

1. **Tribute/tend tracking** (daily): wraps `Game.payTribute`/`Game.tendLink`
   for the duration of the parent's daily, records `{day, kcal}` from the
   engines' real return values (actual pantry kcal paid, 0 on refusal).
   Policy-side, exact, restored in `finally`.
2. **Evening feast** (upkeep, dusk): all food-r7 gates kept (dusk, at haven,
   not exiled via `feastPlan`, one feast/day, armed cadence 7d / unarmed 14d,
   affordability `have >= cost × 1.5`, fusion-reactor ceiling) PLUS the r13
   contribution rule: `recentGives(7) + tributePaid(7) + tendPaid(7) ≥ 1500`.
   The food-r7 `eveningFeast` keeps its own gate (untouched — it still
   no-ops here), so the layer hosts its own feast through the same
   `hostFeast` engine path (real pantry cost, broadcast beats, grantFeastBuff).
3. **Devotion + draw-facing inherited**: `channelDevotion` (competent.daily)
   arms the surge; `feastFightRoad` (competent.upkeep) faces the feast's
   scavenger draw while feasted — the fight that marks `feastSurgeUsed`.

Design call (documented, Steve can overrule): on the courtship road the
scholar's contribution to the commons IS the tribute/tend — real pantry
outflow the scholar authorizes for the village's standing (payTribute:
`_removePantryKcal`, recorded in link notes; tendLink: 1,500 kcal). The
food-r7 rule's intent ("don't spend the commons' food as a parasite") is
preserved: a scholar who neither donates nor pays tribute/tends still never
feasts. What changes is only WHAT COUNTS as contributing. No free food:
every kcal is really spent (tribute was really paid; the feast really
draws from the pantry; the 1.5× buffer holds).

Honesty notes: the layer does NOT touch the takes/gives ledger (the r7
fair-share-rate blank stays open — lever-5 design question, Steve's call);
it does NOT change fight logic, wave math, or any game balance.

## Mechanism proof

`scripts/test-feast-r13.js` — the RED phase is real: with the gate OFF the
wrapper delegates byte-identically (zero feast-layer calls); flipping the
gate ON with identical state hosts the feast. Groups: gate parity,
contribution rule (tribute counts, gifts of air don't), affordability,
feast→buff→tbDamage uplift in a REAL tb fight (seeded), honest refusal paths.
(Run: `node scripts/test-feast-r13.js`.)

## Baseline (tip a8bea26b, gates off — re-run, don't assume)

`scripts/sweep-feastscale-20261013.js`, seeds 11/22/33/44 × belongseek/leadcourt,
150d death-aware, 39s. `evidence/2026-10-13/feastscale-r13-baseline.json`.

| seed | belongseek | leadcourt |
|---|---|---|
| 11 | d71 village-lost, regional | d65 village-lost, regional |
| 22 | d74 village-lost, regional | d76 village-lost, regional |
| 33 | d77 village-lost, regional | d75 village-lost, regional |
| 44 | d97 village-lost, regional | d45 village-lost, village |

Wall: **national 0/8, table 0/8, won 0/8, wave4 0/8, median 75d, max 97d,
vests 0, exiled 0/8.** Feast chain: **0 feasts, 0 grants, feastSurgeUsed 0/8,
sentimentTaught 8/8.** The devotion lane is live on every seed (taught 8/8)
but the feast never fires — the diagnosis holds on the current tip.
Belongseek paid 15–31k kcal/seeds in tribute (real contribution, invisible to
the old feast rule). GO bar for the pilot: **national ≥ 2/8 AND median ≥ 90d**
(1.2 × 75).

## Pilot (after — identical seeds, FEASTSCALE_R13=1, belongfeast/leadfeast)

`evidence/2026-10-13/feastscale-r13-pilot.json`, 45s.

| seed | belongfeast | leadfeast |
|---|---|---|
| 11 | d57, reg, 4 feasts (3 armed, 3 grants, used) | d61, reg, 4 (3/3, used) |
| 22 | **d125, regional, natHeld=5, table=1**, 7/7/7, used | d38, village, 1/1/1, used |
| 33 | d122, reg, table=1, 8 (7/7, used) | d88, reg, 5 (5/2, used) |
| 44 | d74, reg, 3 (3 armed, 0 grants — reactor refusals), unused | d56, reg, 3 (3/3, used) |

Wall: **national 1/8, table 3/8, won 0/8, wave4 0/8, median 74d, max 125d,
vests 0, exiled 0/8.** Feast chain: **35 feasts (32 armed), 26 grants,
feastSurgeUsed 7/8, sentimentTaught 8/8.**

**Judged against the header: KILLED AT PILOT.** GO needed national ≥ 2/8
AND median ≥ 90d. Measured: national 1/8, median 74d (baseline 75d — flat).
No confirm spend, per MEASUREMENT §9.

What DID move (documented, not goalpost-moving): the mechanism is real and
the reachability gap is genuinely closing —
- feastSurgeUsed 0/8 → 7/8: the table's lesser-seat food-deed rung now fills.
- tableWaiting 0/8 → 3/8 (belongfeast s22/s33, leadfeast s11).
- First belongseek-road national hold in this suite: s22 held national 5d
  (d~120–125), died d125 village-lost. (r6: 0/16; r8: 0/4.)
- The 1/8 national and the 3/8 table approaches all came from seeds where
  the feast chain fired end to end.

Honest diagnosis: the feast layer is a REACHABILITY instrument, not a
survival instrument. It fills the food-deed rung and walks villages to the
table's door, but the wall — combat deaths ending villages at a flat median
— is untouched. Median survival didn't move (74 vs 75); every run still
ended village-lost in combat. leadfeast s22 even died earlier (d38 vs d76
baseline) — the lever adds feast fights (the draw) without adding survival.
The binding constraint stays fight selection + monster math (r1–r3), not the
deed rung. The layer is kept as an opt-in instrument (default OFF) because
it makes the deed chain measurable; it does not break the wall.

## Reachability verdict

- The feast chain: REACHABLE end to end on the courtship road once the
  contribution rule counts tribute/tend (35 feasts, 26 grants, 7/8 deeds).
- The table's lesser seat: CLOSER — foodDeeds fills on 7/8 seeds; 3 seeds
  reached tableWaiting (0/8 baseline). No seat taken yet.
- Wave 4 unlock: still 0 organic — wave4 0/8 both sides (the deed gate is
  only one of the wave-4 bars; wave reach is maxWave 3).
- National: 1/8 held (5 days) — the road is real, the wall is survival.

## Village assessment (plain words)

The villages live ~75 days and die in combat — every run ended
village-lost, same as the baseline. The courtship machinery works: tribute
paid in full most weeks (belongseek 36–77k/season, leadfeast tends 8–18),
links season, realms consolidate. What changed is the evenings: on 7 of 8
seeds the scholar now holds a keepsake at dusk and opens the pantry —
2.5–3k kcal a feast, real guests, real laughter — and the buff rides into
the night's fights. The villages that feasted didn't live longer; they
lived RICHER, and three of them got far enough for the table to notice.
Nobody starved (starveDays ≈ 0). The scholar who thrives is the one whose
tribute bought standing AND whose feast bought the deed — s22's Casey held
a national seat for five days before the monsters took the village. The
missing capability is still the same one: surviving the fights.

## Sense-testing (transcript read, not counts)

belongfeast s22, day 36 (see `scripts/sense-feast-r13.js`):
- d35: "Tribute paid: 5,308 kcal walks out of the pantry toward Thornfield.
  The relationship holds." — the contribution, real and costly.
- "You hold Carpenter's square... The feast was the weapon. (The next feast
  grants FEASTED until tomorrow's dawn...)" — the devotion lane armed on a
  keepsake with a name and a history.
- d36 dusk: "🍖 FEAST 📺 — Casey opens the pantry wide: 5× Foraged food, 2×
  Fish catch (smoked), 1× Fish catch. Zuri, Walt, Caitriona, Chloe and 2 more
  eat until the fire burns low. Somebody laughs so hard they cry. For one
  evening, nobody is surviving — they're just together. (−3,096 kcal from the
  pantry) The channeled keepsake feeds the feast — the feast was the weapon,
  and the surge rides the fire until tomorrow's dawn, spent only when the
  blades are warmed. (FEAST SURGE ×1.5 armed)"
- "🍖 FEASTED ×2.03 until tomorrow's dawn (6 parts left): a proper feast." —
  the true window, honestly stated.
- "🌙 The cookfire's smell carried further than the laughter did — smoke and
  grease on the night wind. Buffering is circling the edge of the light. It
  followed the feast here. (A scavenger, drawn by the feast. Face it while
  the feast is in you — or let the watch drive it off.)" — the draw, a real
  fight with a real choice.
- "FEASTED ×2.03: the feast was the weapon." — the strike lines, uplifted
  and stated.

Sensical. The evening reads as one coherent story: tribute paid, keepsake
channeled, feast held, buff granted, beast drawn, beast faced. The costs are
real (5.3k tribute, 3.1k feast), the window is honest, the fight is a
choice. No robotic repetition, no contradictory lines.

## Blanks filled / open

FILLED (this run): the food-r7 eveningFeast's recent-gives gate is the
mechanism behind r8's "0 feasts on all belongseek seeds" — measured at the
gate level (gives7=0 on 60/60 dusks while plan.ok=true and the surge armed).
FILLED: the table's food-deed rung is now reachable on the courtship road
(feastSurgeUsed 7/8) — the r8 policy gap is closed by construction.
OPEN: fair-share rate accounting in the takes/gives ledger (r7, lever-5,
Steve's call); wave-1/2 damage numbers vs "slow and risky" (r3); whether
trust-from-feasts moves moot-exile rates (exile was 0/8 on both sides this
run — no signal either way).

## Convergence

**killed-at-pilot** — the lever fills the deed rung (reachability converging)
but does not move the wall (national 1/8 < 2/8, median flat). No confirm
spend. The layer is kept behind FEASTSCALE_R13 (default OFF) as a
proof-tested instrument: future scale runs can measure the deed chain.
