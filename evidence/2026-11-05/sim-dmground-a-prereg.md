# Damage-per-round probe/build — PRE-REGISTRATION (arm sim-dmground-a)

Run: fleshout-20261105T0915Z. Axis: winnability chain (wild
ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Tracker's next blank: damage-per-round (the
finishhold prereg's diagnostic-intermediates rule: "damage-per-round
or survival, not the flee decision"). Committed BEFORE any judged
sim. ONE game-code lever (GEARFULL, below). NO gate, price,
deed-gate, readyDemand, VETSHAPE, flee/retreat, or food change, ever.
The arm-2 damage+staying toggle is NOT touched (reserved for its own
run, different lever).

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5 and
  "Combat readiness gates the standing unlock": wave-4 bands (anchored):
  damage 35–95, HP 850–1500, pierce 0.2–0.5 — a 4–6 round fight for a
  godhood build (~220 dmg/round). Wave 5 demands 2 LIVING villagers
  with wave-4+ kills. No canon invented here.
- Steve 2026-10-06 (worktree AGENTS.md, design guardrails): "Gear
  changing abilities should be one of our least frequent levers. Gear
  is more likely to grant another type of action in certain scenarios."
  This lever is NOT a new gear tier and NOT a new action type: it is
  the existing weapon's own printed bonus applied in full where the
  engine currently halves it. The gear itself is unchanged.
- Steve 2026-10-08 (MONSTER-WAVES.md / CANON.md): "Monster
  encounters are fought, not rolled" — blow-by-blow with real stats.
  GEARFULL changes a real stat (the strike roll's weapon term), never
  an outcome table.

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-05/sim-finishhold-b.md` (band 99161–99168,
  150d, 8 seeds): focus fire KILLED. Armed 3/86 = 3.5% vs 11/132 =
  8.3% baseline; median survival 73d vs 121d — more swings/allies
  converts flees into deaths, not kills. Field damage fraction armed
  median 9.9% (baseline 2.1%) in median 2 rounds; armed field
  endings flee 34 / death 6 / kill 0. The flee decision is NOT the
  binding constraint — parties already stay long enough to die.
- `evidence/2026-11-05/sim-finishhold-b-prereg.md` (DIAG corpus
  re-read): field fights max 4 rounds, max damage fraction 0.287
  (seed 99152 day 87, 349 damage, ally weapon bonus 60); median
  2.7%. Monster entry HP below 85% of def max in 25 of 27 field
  fights, minimum 25% — world monsters persist wounded, so parties
  do meet already-hurt beasts. No field fight met a monster below
  15% of max HP.
- Baseline wave-4 kill rate ~8% (finishhold band: 11/132 = 8.3%);
  wave-5 kills 0 in normal play; full seat still unwon.

## The damage math that picks the lever (computed from the code, before any sim)

- Field leader strike: `lroll([4+wb, 8+wb])`
  (fieldFights.js ~line 1937); ally strike: same formula with
  `allyWb` (~line 2011).
- `wb = round((meleeBonus + rangedBonus) / 2)` — the "helpers, not
  heroes" halving (fieldFights.js:585–591, leader; :1193–1195,
  ally). The TB villager strike uses the same halving
  (game.js:39642, "Half bonus — they're helpers, not heroes").
- Weapon bonuses in `src/data/items.json`: common steel 5–35
  (machete 35, hunting spear 30), top gear 80–120
  (worldbreaker_maul 120, apex_bow 95). A machete fighter: wb = 18,
  strike mean ~24/round. Two fighters ~48/round against 850–1500 HP
  = 18–31 rounds to kill; the beast deals 35–95/round against
  ~100 HP villagers = the party dies in ~2 rounds. The
  damage×survival product is ~2.7% of the beast's HP per fight.
- The sim-dps-anchor (MONSTER-WAVES.md): a godhood brawler with the
  maul (bonus 120) deals ~220 dmg/round — the player's strike uses
  the FULL bonus. The villager in a field fight has no scholar on
  the grid: they ARE the fighter, and the halving charges them a
  "helper" tax for a hero's job.

## Step 1 verdict — policy-side: NOT expressible

Same determination as finishhold (not re-proved): the competent
policy (`scripts/policies/competent.js`) drives the SCHOLAR only and
never calls `fieldFight`; the strike formula and the wb fold-in are
computed INSIDE `fieldFight` with no opts knob. Game-code lever
required. No policy probe is run.

## Lever picked — GEARFULL (ONE mechanism)

**GEARFULL: in wild wave-3+ field fights, the leader's and the
joining ally's strikes use the FULL equipped-weapon bonus of the
best weapon in hand — `wbFull = max(meleeBonus, rangedBonus)`,
unhalved — instead of the halved melee+ranged average.**

- Where: `Game.fieldFight` (fieldFights.js only). Leader wb
  computed at :589–591; ally wb at :1193–1195; strike rolls at
  :1937 and :2011. `wbFull` is computed beside each `wb` and used
  in the two strike rolls when the gate holds; otherwise the
  existing `wb` is used byte-identically.
- Gate (the finishing-mechanic family, same shape as twoblow /
  focus fire): `wave >= 3 AND !opts.noFlee AND !opts.cornered`.
  Sealed arenas, raids, and waves 1–2 keep the halved rule —
  early-game balance untouched.
- Why `max()`, not the full fold-in (`melee + ranged`): one swing,
  one weapon. The full fold-in would let a spear AND a bow both
  count in a single melee swing (double-counting); `max()` is the
  weapon actually in hand hitting with its full printed edge. The
  volley already gives the bow its own opening identity and is
  untouched.
- Foreign allies (no gear record, `allyWb` null) keep the flat
  [3,6] strike — unchanged.
- Record-only flag `rec.gearFull = true` + one honest log line at
  fight start ("Their weapons are in hand and they mean it — every
  swing lands with the full weight of the steel. (Gear full)").
  Nothing else changes: no damage multiplier, no flee line, no HP,
  no round cap, no volley change, no ability numbers.

Why GEARFULL, and why not the alternatives — decided from the
measured corpus and the code:

- (a) An invented damage multiplier (×2, ×3 on field strikes):
  rejected. It is a number pulled from nowhere, not gear honestly
  applied; if it worked, the next question would still be "which
  number, and why" with no anchor in any item. GEARFULL's ceiling
  is the weapon's own printed bonus — the maximum honest
  application of gear. If full gear application does not move
  kills, no gear-damage lever ever will: a decisive kill, not a
  tunable maybe.
- (b) Volley boost (more shots / bigger volley): rejected. The
  volley is a ranged-only opening, ammo-limited, and fires before
  round 1 — it is not per-swing / per-round damage in the fight,
  and most wild fighters carry no bow.
- (c) Survival-side (armor/HP/rounds-held): NOT this arm. That is
  the other half of the damage×survival product and the next
  blank's candidate; this arm isolates the damage half. The
  arm-2 damage+staying toggle is likewise out of scope.
- (d) TB-channel (scholar-led fights): rejected. TB already kills
  (10 of 11 baseline kills); the field channel is the one at
  1 kill in 77 fights. The lever goes where the kills are not.

Honest expectation, stated now (not a hedge on the verdict): a
machete party goes from ~48/round to ~82/round (~1.7×; bow-only
fighters up to 2×, spear+bow fighters ~1.2×). Damage fraction
median 2.7% → plausibly ~6–9% with longer holds (rtk falls, so
'hopeless' triggers later — more rounds at the higher rate). Kills
likely stay near zero: 15% needs ~13 kills on a ~86-fight band,
and the field channel would have to carry ~10 of them. The GO
below is set at the brief's bar anyway and judged strictly; if it
NO-GOs, the diagnostic intermediates decide the NEXT blank (if
damage fraction moves materially but kills stay ~0, the binding
constraint is survival/rounds-held — the HP pool — not per-swing
damage, and the next lever must be survival-side or TB-channel),
and the game-code change is reverted, leaving no trace.

## Design (staged per docs/MEASUREMENT.md §§9–12, 14–15)

- Fresh band 99201–99208: verified free — no `99201`…`99208`
  token in `evidence/2026-11-05/sim-*.md` or any `perseed-*`
  filename in `evidence/2026-11-05/` at prereg time.
- Competent policy verbatim (`scripts/policies/competent.js`,
  `competent` export), 150d death-aware horizon (dead villages stop
  simulating, +10d tail max via runDays).
- 8 seeds pilot, baseline FIRST on current code
  (`RUN=dmground-baseline`), then armed on IDENTICAL seeds
  (`RUN=dmground-armed`) after the lever lands. Same instrument,
  same driver, same analyzer for both legs.
- Stage 0 smoke (1 seed, 99201, to /tmp, NOT judged): instrument
  fires — per-fight records present, 0 instrument errors, field +
  TB wrappers restore cleanly (off/on neutrality leg, see Proof).
- Corpus to `evidence/2026-11-05/perseed-dmground-a/` (one file per
  seed per leg, `instrumentErrors` 0 required; any instrument error
  is a loud failure to fix, not to paper over).
- Confirm 12–16 seeds on a FRESH band ONLY on pilot GO. Pilot
  NO-GO ends the arm: revert the game-code change, keep instruments
  + evidence + proof as the killed-verdict record.

## Per-fight record (instrument: finishhold base + gearFull field)

For EVERY wave-4+ fight (field + player TB), as in finishhold, PLUS:
`gearFull` (rec.gearFull, false on baseline). Field fights are split
by `allyVid` presence (a real joiner), NOT by mustered partySize.
TB damage is judged by HP fraction (`damageFrac`), NOT by player
strikes. Armor is read from torso/legs/shoes slots via the engine's
`armorOf`, never an `armor` slot (finishhold rule, kept). Kill
matching is STRICT (killer must be among the fight's fighters; TB
"won" is never counted as a kill without a kill-log row).

## Primary metric (binding — judge only against this)

Wave-4 kill rate per wild wave-4 fight (matched kill-log rows only,
STRICT matching), baseline vs armed on identical seeds 99201–99208.

- **GO: armed kill rate >= 15% AND >= 3 kills on the pilot band.**
- **Guardrails (both must hold, else NO-GO even on a kill GO):**
  median survival (armed) not worse than baseline by > 10 days;
  field-fight party deaths (vDie endings, count) not up by > 25%
  relative to baseline.
- Pilot-gate rule: 8 seeds before/after before ANY confirm spend.
  Confirm 12–16 seeds on a FRESH band only on pilot GO.

## Secondary (reported, never re-scored)

- Field channel: median damage fraction, median rounds, flee/death
  shares, gearFull fire rate (armed: fights with `gearFull` true /
  wild wave-3+ field fights), ally-joined share by `allyVid`,
  committedFinish rate (twoblow gate reads bigger strikes — a
  same-family interaction, reported not judged).
- Per-swing diagnostic: damage fraction per round held, and the
  entry-HP distribution of any field kill (wounded-entry
  conversion is the only plausible kill path at this magnitude).
- TB channel: kill rate, median damage fraction, death share (the
  lever does not touch TB; any TB movement is a spillover read, not
  a verdict input).
- Wall numbers every run: wins, national, table, wave 4–5 unlocks,
  wave 4–5 faced, median survival days (both legs).
- Per-seed table per leg: days, end reason, wave-4 fights, wave-4
  kills, killers ever, living killers at end.
- Village assessment in plain words and the named next blank.
- Sense-testing law: read at least one fight's transcript/log end to
  end (death-day say lines + one field-fight log), judged for
  meaning, not just counts.
- Telemetry deviation check per loop-body step 10 (attempted; if the
  tool refuses recorder corpora, say so and report wall numbers
  directly, never fabricate a compare).
- Balanced panel (§15): before/after runs through
  `scripts/balance-panel.js`; the compare `.md` is attached to the
  evidence file. If the panel tool cannot run on this corpus, say so
  instead of fabricating it (finishhold recorded the same limit).

## Metric review (per §14; filled at verdict time, not now)

- Whether the kill-rate GO was reachable at all given the
  damage×survival product (best field fight 28.7% in 4 rounds at
  halved bonus; full bonus lifts per-swing ~1.2–2×), and whether a
  damage-fraction threshold would have been the honest primary for
  a damage lever.
- Whether the gearFull fire rate matched the wild wave-3+ field
  fight share (any fight where the lever should have fired but did
  not, and why).
- Whether 8 seeds / 150d gave enough wild wave-4 fights to judge
  the GO, or the band was too thin.
- Whether TB spillover (if any) was real or seed noise.
- Whether the committedFinish (twoblow) rate moved with bigger
  strikes, and whether that interaction helped or hurt.

## Proof (committed with this prereg, before judged sims)

`scripts/test-dmground-20261105.js` — fixture tests (instrument
field capture incl. gearFull, analyzer allyVid + gearFull splits,
TB-damage-by-HP-fraction rule, strict kill matching,
determinism) + a live harness smoke (5d) + an off/on neutrality leg
(10d, seed 99201: identical days, endReason, kill-log length, 0
instrument errors). Lever fixtures (gate conditions: fires wave 3+,
wild, mustered; does not fire wave 1–2, sealed, cornered, or solo;
leader + ally strikes use wbFull) are added with the lever commit,
in the same file, before the armed pilot. Instrument:
`scripts/dmground-instrument-20261105.js` (finishhold base +
gearFull field). Driver:
`scripts/dmground-driver-20261105.js`. Analyzer:
`scripts/dmground-analyze-20261105.js`.
