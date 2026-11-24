# sim-spearopen-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-spearopen-a · **Loop A run:** fleshout-20261124T2115Z
**Type:** DIAG (instruments + evidence only — no game-code fix lands)
**Frozen:** 2026-11-24 ~21:30 UTC, before any judged sim.
**Branch:** `sim-spearopen-a` (worktree
`~/workspace/worktrees/sim-spearopen-a`). **Base:** worktree HEAD
4c1bb482e (sim-ammosupply-a evidence-only landing).
**Builds on:** `evidence/2026-11-24/sim-ammosupply-a.md` (§§3, 9, 13)
+ prereg, `evidence/2026-11-24/sim-bowopen-recheck-a.md` (§6, §9
instrument gap) + prereg. Finding #2544 (fight capability: damage
output — the ranged-opening half).

## §0. The question, in plain words

Spears are 15 of 38 ranged-at-entry fighters on the ammosupply arm
leg — the single biggest ranged weapon class at the fight — and they
carry 0 ammo, because a spear takes no ammunition at all. Does the
spear opening volley ever fire, what does it contribute, and is the
volley path wrongly demanding ammo for a thrown weapon?

## §1. Design from code (frozen, not a sim)

Read before designing: `docs/CANON.md`, `docs/MONSTER-WAVES.md`,
`docs/BALANCING.md`. **No canon doc covers spears as thrown
weapons** — said here rather than inventing one. The volley canon
(BALANCING.md) is written for ammo-bearing weapons only: shots =
min(ammo, clamp(1 + floor(range / monster speed), 1, 4)), each shot
spends 1 real ammo; empty quiver → narrated "no arrows". The spear
ladder in `src/js/encounters.js` (bow > spear > hands) is a hunting
method, not a volley rule.

**What already exists (the ground this diagnostic stands on):**

- Volley engine (`src/js/fieldFights.js`, ~989–1145): the whole
  opening block runs only under `if (_w && _ammoId)` — the weapon
  def must carry `weapon.ammo`. All five live spears/lance
  (`hunting_spear`, `fire_hardened_spear`, `shard_spear`,
  `starfall_lance`, `godslayer_spear`) are `type: 'melee'`,
  `range: 2`, no `ammo` — so for a spear carrier the block is
  skipped entirely: `rec.volley` stays `null`, no shots, no damage,
  and no "no arrows"-style narration. The skip is SILENT.
- `volleyWeaponOf` (`src/js/equipment.js`): the equipped ranged-slot
  weapon, but ONLY when its def carries `weapon.ammo` — returns
  null for a spear. `rangedWeaponOf` returns the slot as-is, so a
  spear DOES sit in the ranged slot when its carrier holds no real
  ranged weapon (melee-first fallback in `autoEquip`).
- The spear's only entry contribution is the contact finish
  (`fieldFights.js` contactfinish block, wave ≥ 3): a beast already
  below its break line, met at contact with no volley damage, can be
  finished by one plain strike — a spear in the ranged slot counts
  as kind `'spear'`. Plus the melee fold-in (ranged bonus folds into
  melee strikes).
- Gate telemetry (`villagerStageBow`, `src/js/game.js`, SPEARGATE):
  `spearSeen` counts every departure whose equipped ranged entry is
  a spear (pure observation, either leg); `spearPassed` counts the
  ones the gate passes over to the sources (SPEARGATE on only).
  Both live in `village.bowOpen`, but only when BOWOPEN=1 (staging
  runs) — when staging never ran they are unobserved (null), never 0.
- The bowopen-recheck §6 instrument gap — driver/analyzer emitting
  no `spearSeen`/`spearPassed` — is CLOSED by sim-instrument-a in
  the current driver (the counters are read per seed from live
  state). This arm verifies the closure live: the analysis reports
  the counters, and a missing key is a loud instrument failure.

**Desk diagnosis from the ammosupply corpora (frozen numbers,
recomputed from `evidence/2026-11-24/perseed-ammosupply-a-{ctl,arm}/`,
all wave-4+ `v4encounters` rows, lead fighter only):**

| Class (arm leg) | Entries | Volleys fired | Volley dmg | Null volley |
|---|---|---|---|---|
| Spear | 15 | 0 | 0 | 15/15 |
| Bow | 10 | 6 | 168 | 4 (all evades) |
| Crossbow | 10 | 6 | 181 | 0 |
| Sling | 2 | 2 | 41 | 0 |
| Searcaster | 1 | 0 | 0 | 1 (evade) |

Control leg matches the shape (spear 12/30, 0 fired, 0 dmg, 12/12
null volley). Contact-finish spear kind: 0 on both legs. The 4 bow
null-volley rows are all evades (outcome `evade`, rounds 0 — the
fighter saw the monster in time and gave it room, so the fight never
started and the volley block never ran). The analyzer therefore
counts evades separately and excludes them from the opening
denominators — a null volley on an evade is not a missing volley.
**Pre-registered expectation:** the live ledger will show spear
volley fire rate 0 and the ammo gate (no `weapon.ammo` on the def)
as the blocker for ~all not-fired spear carriers. The pilot measures
whether live play matches that desk reading — a spear that somehow
volleys, or a spear carrier who never reaches a fight, would
overturn it.

## §2. Primary metric (BINDING, §14)

Single leg (DIAG — no ctl/arm pair; there is no lever to compare).
Population: ALL wave-4+ `v4encounters` rows, every origin, lead
fighter; evades counted separately and excluded from the opening
denominators (see §1 — no opening was possible).

- **Pool floor:** ENGAGED spear carriers at entry ≥ 10.
- **Primary metric:** spear-volley fire rate among engaged spear
  carriers at entry (volleys fired / spear carriers).
- **Attribution completeness (instrument check, binding):**
  attributed openings / engaged ranged rows ≥ 0.90, where the
  opening taxonomy is: `fired` (volley.shots > 0),
  `blocked-empty-ammo` (ammo-capable, shots 0, 0 ammo),
  `no-volley-path` (def carries no `weapon.ammo` — the spear case),
  `held` (shots 0 with ammo on hand — CELLGATE hold). Anything else
  is `unattributed` and counted openly.
- **GO threshold:** attribution completeness ≥ 0.90 AND (spear
  volley fire rate ≥ 0.50 OR the ledger proves the ammo gate is the
  blocker: ≥ 0.80 of not-fired spear carriers are attributable to
  the ammo gate — weapon def carries no `weapon.ammo` AND
  ammoAtEntry is 0, read from the def, not from the classification).
- **Instrument errors:** 0 on all per-seed files.

**Verdict:** DIAG-GO when the bars pass (the question is answered
with a complete ledger — either the volley fires for spears, or the
ledger proves the ammo gate blocks it). DIAG-NO-GO kind THIN-POOL
when the pool floor misses (verdict is thin-pool, not a re-score);
DIAG-NO-GO kind ATTRIBUTION when completeness misses; DIAG-NO-GO
kind OPENING-UNEXPLAINED when neither opening branch clears. A miss
is NO-GO, never re-scored against a friendlier metric mid-run.

**Staging sniff test (pilot gate):** the analyzer must show the
spear population is real on this band (spear carriers > 0 and the
gate counters present, not null) before the verdict is read. If the
band carries no spear at all, the verdict is DIAG-NO-GO THIN-POOL
with the empty pool as the finding.

## §3. Secondary metrics (supporting, not binding)

- Spear carriers at entry: count + share of ranged-at-entry (lead,
  engaged; the ammosupply number was 15/38 = 0.39 all-encounters).
  Allies at entry (secondary): spear share among every fighter
  present (`allyKit`), not just the lead.
- Volleys fired by weapon type (bow / crossbow / spear / starfall /
  other): shots, hits, damage — total and mean; spear volley damage
  vs bow volley damage.
- Volleys blocked by empty ammo, by weapon type; narrated "no
  arrows" cases by weapon (dry-line count from `row.log`).
- Contact finish: attempts by instrument kind, spear-kind damage
  and kills (the spear's only entry contribution).
- Gate replication: `spearSeen` / `spearPassed` per seed and pooled,
  plus the `bowOpenByVid` alreadyHad-with-spear cross-check.
- By-origin split (expedition / aid / world-tick / patrol) for
  spear carriers.
- Wall numbers: national / table / wins, wave-4 and wave-5 unlocks,
  median survival, death-cause shares. Table not instrumented by
  this driver — reported as null, never faked.
- Sense-testing: 2–3 full meeting transcripts where a spear carrier
  enters, read in full — does the opening read sensibly (a thrown
  spear that never leaves the hand, a silent skip, a contact
  finish)? SENSE-TESTING LAW: judge meaning, not counts.

## §4. Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as bowopen / speargate /
  bowopen-recheck / ammosupply bands, for comparability). Dead
  villages stop simulating (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 110601, 110602, 110603,
  110604, 110605, 110606, 110607, 110608.** Freshness check
  (skill local_seed_band_freshness): `grep -rl "11060[1-8]"`
  over `evidence/*/sim-*-prereg.md` — **0 hits** (checked
  2026-11-24 ~21:20 UTC, before this prereg was frozen); over
  `evidence/2026-11-24/*.md` — **0 hits**; `grep -rn '110601'`
  over all of `evidence/` (`*.md`) — **0 hits**. Neighbouring used
  bands avoided: 110101–110108, 110201–110208, 110401–110408.
  Transparency note: the strings `110601`, `110607`, `110609`
  appear as PANTRY-KCAL data values (`pantryKcal` /
  `pantryFreshAfter`) inside old Oct 15–16 sweep JSONs
  (`evidence/2026-10-15/perseed-{bearercombat,holdloss2}/
  leadfeast-s22-full.json`,
  `evidence/2026-10-16/crumbdefault-sweep/census-*/...-census.json`)
  — a kcal number, not a seed-band reservation; no prereg, screen,
  extension band, forbidden or contaminated list names 110601–110608
  as seeds, and no sim ever ran seed 110601. The band stands.
- **Policies:** competent verbatim. **Substrate (single leg):**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `SENSEEXPED=1`, `SPEARGATE=1`, `BOWOPEN=1` — the ammosupply
  pilot's substrate, so numbers compare. No BOWOPEN-off leg: the
  gate counters only exist when staging runs, and the question is
  about the spear opening under the fixed gate ground, not about
  the gate itself.
- **Instrument:** `scripts/spearopen-driver-a.js` (clone of
  `scripts/bowopen-driver-recheck-a.js` + spear additions: `allyKit`
  per encounter row, `contactFinish` from the fight record;
  RUN=spearopen-a, OUTDIR
  `evidence/2026-11-24/perseed-spearopen-a-arm`). Analyzer
  `scripts/analyze-spearopen-a.js` (single-leg; `spearStats` +
  `judgeSpear` + opening taxonomy + `--selftest` green before the
  pilot). Per-seed JSONs under
  `evidence/2026-11-24/perseed-spearopen-a-arm/`.
- **§15 panel:** NOT APPLICABLE — single-leg diagnostic, no
  before/after pair to compare. The balanced panel compares two
  legs; there is no second leg here. Said here rather than
  fabricating a compare. The frozen bars (§2) are the judge.
- **PILOT ONLY.** Confirm 12–16 seeds ONLY if the pilot earns one;
  a DIAG arm earns a confirm only if the pool is thin but the
  ledger is decisive — the coordinator decides from the pilot
  verdict.

## §5. Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on what a departing villager carries into the
fight, so the fixture is the departure itself, staged by the
competent policy: a geared scholar fighting with a party, never a
fresh un-geared solo scholar. The proof test
(`scripts/test-spearopen-a.js`, GREEN before the pilot) runs live
fights on a loaded village — spear-only carrier (volley null,
silent), bow + arrows (volley fires, ammo spent), bow + 0 arrows
(blocked, "no arrows" narrated) — plus the gate telemetry and the
analyzer's classification of the live records. The pilot's per-seed
corpora carry the encounter averages beside the verdict in the
evidence file.

## §6. Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate —
   ammosupply band: 58 ctl / 66 arm wave-4+ encounters per 8 seeds,
   30 / 38 ranged-at-entry. The pool floor (≥ 10 spear carriers)
   is sized to that known density (15 spear carriers on the arm leg).
2. **Pool sizing:** see (1). The attribution bar (≥ 0.90) is set
   against the ammosupply corpora, where every null-volley
   ammo-capable row is an evade — with evades excluded, the
   residual unattributed rate should be ~0. If live play shows a
   new unattributed class, the bar fails honestly and the class is
   the finding.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-spearopen-a.js`, GREEN before the pilot) proves
   the measurement chain on live fights (see §5). The analyzer
   `--selftest` covers the taxonomy (all five classes + evade split
   + gate aggregation + contact finish) and the judge shapes
   (DIAG-GO via fire rate, DIAG-GO via ammo-gate, THIN-POOL,
   ATTRIBUTION, OPENING-UNEXPLAINED, INSTRUMENT).

## §7. Canon

`docs/CANON.md` (manifest), `docs/MONSTER-WAVES.md`, and
`docs/BALANCING.md` read. Wave-4 canon: the Mirror Draft, standing
≥ 100; damage 35–95, HP 850–1500, pierce 0.2–0.5. Wave 5: standing
≥ 200 AND wave-4 faced. Volley canon (BALANCING.md): the fight opens
at range, shots = min(ammo, clamp(1 + floor(range / monster speed),
1, 4)), each shot spends 1 real ammo. **No canon doc covers spears
as thrown weapons** — said here rather than inventing canon. A
spear is a human weapon (CANON.md human-skills lane), never an
alien ability.

## §8. Metric review (to be written after the pilot — frozen bars judge as written)

- Finding #2544: claimed by this arm for its spear half; on
  DIAG-GO the spear opening is answered with a complete ledger —
  either it fires, or the ledger proves the ammo gate blocks it and
  the next arm is named from that proof (a thrown-weapon opening is
  a design question for Steve, not a silent code tweak). On
  DIAG-NO-GO the finding stays open with the failing bar + mechanism
  diagnosis named.
- Write-flap: probe `git update-ref refs/heads/probe HEAD` before
  every material write; if it fails, stop writing and wait for the
  clear. The ammosupply adoption ran 11 consecutive probe failures
  (~48 min) the same morning — the flap is active in this window.
