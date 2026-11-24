# sim-aidammo-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-aidammo-a · **Loop A run:** fleshout-20261124T2115Z
**Type:** DIAG (instrument + evidence only — no game-code fix lands).
**Frozen:** 2026-11-24 ~22:20 UTC, before any judged sim.
**Branch:** `sim-aidammo-a` (worktree `~/workspace/worktrees/sim-aidammo-a`).
**Base:** worktree HEAD 4c1bb482e (sim-ammosupply-a evidence-only landing).
**Builds on:** `evidence/2026-11-24/sim-ammosupply-a.md` (§§2, 3, 5, 8, 9, 11, 13)
+ prereg, `evidence/2026-11-24/sim-bowopen-recheck-a.md` (§2), finding #2602
(the departure craft is vestigial — home duty out-produces it 44 batches to 1;
3 departure-craft attempts in 8 seeds).

## §0. The question, in plain words

The departure ammo-supply lever was just KILLED: it supplied 0 batches in
8 seeds, and the empty quivers sit in aid (4/12 with ammo) and world-tick
(8/19) fights, where the fighter never departs. So the supply question moves
off departure and into the world: where does ammunition actually come from
during play, and does it reach fighters before wave-4+ meetings? This arm
traces every ammo batch — which production path made it, who holds it, and
whether it is in a fighter's hands at a wave-4+ meeting entry.

## §1. Design from code (frozen, not a sim)

Read before designing: `docs/CANON.md`, `docs/MONSTER-WAVES.md`,
`docs/BALANCING.md`. **No canon doc covers ammunition supply specifically**
— said here rather than inventing one. Arrow-crafting is a human skill
(CANON.md), never an alien ability.

**Ammo ids (live from `src/data/items.json`):** `arrow`, `bolt`, `stone`,
`fusion_cell`. Ranged weapons and their ammo: sling/phase_sling → stone,
crude_bow/bow/starfall_bow/apex_bow → arrow, crossbow → bolt, searcaster →
fusion_cell.

**Where ammo can come from (frozen ground, read from code + data):**

| Production path | Code | What it makes | Notes |
|---|---|---|---|
| Home-duty craft | `villagerAmmoCraftDay` (`src/js/villager-build.js:1584`) | arrow/bolt, 1 batch of 5, ≤1 attempt / 3d per villager, blind 35% / learned 85%, own carried materials then the pile; lands in the crafter's carried items | Finding #2602: out-produces departure craft 44 batches to 1 |
| Departure craft | `villagerPocketAmmo` step 3 (`src/js/game.js:8054`) | arrow/bolt, 1 batch of 5, one attempt per departure, same odds/materials from the pile | 3 attempts in 8 seeds (finding #2602); 5 failed crafts in the ammosupply pilot |
| Departure pile stones | `villagerPocketAmmo` step 2 | stone, top-up to 6, from communal pile materials | No craft, no odds |
| Departure own stash | `villagerPocketAmmo` step 1 | moves the villager's OWN stashed ammo to carried | A TRANSFER, not production — the stash batch keeps its production source |
| Kill loot | `villagerKillLoot` → `rollAlienLoot` (`src/js/game.js:47575`) | fusion_cell only, tier-4 rare (alien origin, lootTier 4); arrow/bolt/stone are NOT in `killItems` (any tier) and NOT alien-origin, so they can never drop from a kill | KILLBUNDLE cells (2 with a searcaster drop) are env-gated `KILLBUNDLE=1`, OFF in this run |
| Starting kit | village creation | whatever ammo a villager starts carrying / stashed | Recorded as `starting-kit` at setup snapshot |
| Other | — | any production the wraps do not name (care packages, contest prizes, trades/gifts, any unlisted path) | Caught by the daily snapshot diff (see §1b) — never silently zero |

`villagerGearUp` moves weapons/armor only — never ammo (read
`src/js/game.js:7702`). `aidFight` grants no ammo: aid is an ENCOUNTER
ORIGIN (a fighter who arrives as aid), not an ammo source — an aid
fighter's ammo is attributed to its production source, and the encounter
row records the origin separately. No code path grants ammo at aid;
said here so the ledger's `aid` origin rows are never misread as an
aid production source.

**§1b. The ledger (driver-side instrumentation, no game-code change).**
The driver wraps, after load, `villagerAmmoCraftDay`, `villagerPocketAmmo`,
`villagerKillLoot`, and `fieldFight` (extending the bowopen wrap), plus a
daily snapshot in the policy-daily finally block. All wraps are pure reads
plus snapshot diffs — they call the original exactly once and draw no RNG.
Per villager (roster + scholar) the driver keeps, per ammo id, a FIFO
provenance queue per location (carried / stashed): `[{source, day, units}]`.
- Setup snapshot seeds both queues as source `starting-kit`.
- Production wraps diff carried+stash before/after and push batches with
  their production source (`home-duty`, `departure-craft`,
  `departure-pile-stones`, `loot`).
- Transfers move provenance FIFO between locations preserving the
  production source (stash→carried at departure is a transfer, never
  re-labelled as production; the daily snapshot reconciles any other
  carried↔stash move the same way).
- `fieldFight` diffs lead + ally carried ammo before/after and consumes
  FIFO (volley spend); the encounter row records each present fighter's
  ammo-at-entry attributed to production sources by FIFO.
- Daily snapshot: any total (carried+stash) gain not explained by a
  wrapped production event is logged as source `other` with day/vid/
  ammoId/units; any total loss not explained by a wrapped spend is logged
  as `spend-unattributed`. The ledger is complete by construction; the
  `other` share is the honest residual.
- Attribution completeness = units-at-entry with a known production
  source / total units-at-entry, over all wave-4+ encounters (lead +
  allies). `starting-kit` counts as known (it is a real, named source).

**Desk expectation (frozen, not a verdict):** home-duty craft dominates
production (finding #2602's 44:1), departure craft is ~nil, loot is ~nil
(fusion cells only, rare), and most ammo-at-entry is `starting-kit` +
`home-duty` held by fighters who never leave Haven — i.e. the world-tick /
aid empty quivers are a DELIVERY failure (ammo exists at home, fighters
away from home cannot re-arm), not a production failure. The pilot
measures this; if the ledger shows otherwise, the ledger wins.

## §2. Primary metric (BINDING, §14)

Single leg (DIAG — no ctl/arm; there is no lever to compare).

- **Primary metric: ammo-at-entry by origin across ALL wave-4+
  encounters** (every origin, evades included — the row records kit at
  entry before any fight), re-measuring the ammosupply mechanism bar
  (arm 17/38 = 0.447 vs bar 0.70) on this fresh band WITH origin
  attribution (lead + allies, each fighter's held units attributed to
  production source by FIFO).
  Denominator = fighters with a ranged weapon at entry; numerator =
  fighters with `ammoAtEntry > 0`. Reported overall, by encounter origin
  (expedition / aid / world-tick / patrol / other), and by production
  source share of units-at-entry.
- **Pool floor:** pair-inclusive engaged wave-4+ meetings ≥ 10 (same
  population as the bowopen judge: origin expedition, joined to a gate
  row, planParty ≥ 1, party present, engaged). If the pool misses, the
  verdict is DIAG-NO-GO thin-pool, not a re-score.
- **Attribution completeness:** ≥ 0.90 (known-source units / total
  units at wave-4+ entries, lead + allies).
- **Dominant source:** a single production source holds share ≥ 0.50 of
  units-at-entry — OR the ledger proves no source delivers to fighters
  (total units-at-entry from all non-starting-kit production sources
  < 10 units across the band AND ammo-at-entry rate < 0.70), naming the
  missing delivery as the next lever.

**GO threshold (DIAG-GO):** pool floor met AND attribution completeness
≥ 0.90 AND (dominant source identified OR no-source-delivers proven as
defined above). **A miss on any bar is DIAG-NO-GO, never re-scored.**

**Determinism check (not a verdict bar):** after the pilot, re-run seed
110501 with identical env and compare the ammo-ledger hash (batch
events + units-at-entry). The wraps draw no RNG and call each original
exactly once, so the re-run must match. A mismatch is reported as an
instrument artifact in the evidence (the ammosupply 110407 caveat: one
seed diverging on craft-attempt RNG draws — check for the same artifact
and explain it, never claim a lever effect from it). This run has a
single leg, so no inter-leg divergence can arise; the check guards the
instrument itself.

## §3. Secondary metrics (supporting, not binding)

- Batches and units by production source (counts + units, per seed and
  pooled); batches by recipient; home-duty attempts vs successes
  (crafted batches / attempts, from the wrap return + diffs); departure
  pocket outcomes (stash moved / stones taken / craft attempts + ok).
- Delivery: units-at-entry by production source, split by encounter
  origin; batches whose recipient later appears as a fighter (lead or
  ally) in a wave-4+ meeting with ammo attributed to that batch's source.
- Ammo-at-entry rate, ammo-capable-only rate (weapons whose def carries
  `weapon.ammo`), spear share at entry (spears take no ammo — reported,
  never counted as empty quivers).
- Volley-fire share among engaged pair-inclusive meetings; mean volley
  damage (mechanism context, not a verdict bar).
- Wall numbers: national / table / wins, wave-4 and wave-5 unlocks,
  median survival, death-cause shares. Table not instrumented by this
  driver — reported as null, never faked.
- Sense-testing: ≥ 2 meeting transcripts read in full, judging whether
  the supply story reads sensibly (who had arrows, who did not, and
  whether any villager's ammo state contradicts what the ledger says
  they should hold).

## §4. Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the ammosupply / bowopen bands,
  for comparability). Dead villages stop simulating (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 110501, 110502, 110503, 110504,
  110505, 110506, 110507, 110508.** Freshness check (skill
  local_seed_band_freshness): `grep -rl "11050" evidence/*/sim-*-prereg.md`
  — **0 hits**; `grep -rl "110501" evidence/2026-11-24/*.md` — **0 hits**;
  no `perseed-*1105*` corpus dir exists (checked 2026-11-24 ~22:15 UTC,
  before this prereg was frozen). Neighbouring used bands avoided:
  110101–110108, 110201–110208, 110401–110408.
- **Policies:** competent verbatim. **Substrate:** `VETREENGAGE=1 +
  PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`, `SENSEEXPED=1`,
  `SPEARGATE=1`, `BOWOPEN=1` (same as the ammosupply pilot, so numbers
  compare). The driver asserts all seven flags and stops otherwise.
  The corpus files record `bowopenOn` + `speargateOn` + `senseexpedOn`
  + `wiringSha` + `gameSha`.
- **Instrument:** `scripts/aidammo-driver-a.js` (clone of
  `scripts/bowopen-driver-recheck-a.js` + the §1b ledger wraps; RUN=
  aidammo-a, OUTDIR `evidence/2026-11-24/perseed-aidammo-a`).
  Analyzer `scripts/analyze-aidammo-a.js` (clone of
  `scripts/analyze-bowopen-a.js`, single-leg + ledger tables; `--selftest`
  green before the pilot). Per-seed JSONs under
  `evidence/2026-11-24/perseed-aidammo-a/`.
  **§15 panel:** single-leg DIAG — no before/after panel exists to
  compare (no lever, no control leg). The panel step is NOT APPLICABLE;
  said here rather than faked. The analyzer JSON is the instrument
  output.
- **PILOT ONLY (8 seeds).** No confirm: a DIAG arm measures once on
  the pilot band; a second band is a new prereg, never a silent
  extension.

## §5. Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a fighter is SERVED, so the fixture is
the departure / meeting itself, staged by the competent policy: a
geared scholar fighting with a party, never a fresh un-geared solo
scholar. The proof test (`scripts/test-aidammo-a.js`, GREEN before the
pilot) runs on a LIVE loaded village with real roster/gear and proves
the ledger (home-duty batch attributed, departure stash transfer
preserves source, departure craft attributed, loot cell attributed,
volley spend consumes FIFO, daily-diff `other` catches an unexplained
gain, FIFO attribution at a staged wave-4 entry). The pilot's per-seed
corpora carry the encounter averages (party size, gear, abilities,
ranged-at-entry) beside the verdict in the evidence file.

## §6. Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate —
   bowopen-recheck band: 41 ctl / 25 arm launched expedition meetings,
   21 / 11 pair-inclusive engaged per 8 seeds; ammosupply band: 3 / 3
   pair-inclusive engaged (thin — the pool floor is the risk, sized to
   the bowopen density, and a miss is DIAG-NO-GO thin-pool, judged as
   written).
2. **Pool sizing:** see (1). The floor (≥ 10) is sized to the bowopen
   density; the ammosupply band's 3-meeting pool is the known downside.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-aidammo-a.js`, GREEN before the pilot) proves the
   ledger on a live village (see §5). The analyzer `--selftest` covers
   the judge shapes (DIAG-GO dominant-source / DIAG-GO no-source /
   DIAG-NO-GO thin-pool / DIAG-NO-GO attribution) plus the mechanism-bar
   re-measure shapes.

## §7. Canon

`docs/CANON.md` (manifest), `docs/MONSTER-WAVES.md`, and
`docs/BALANCING.md` read. Wave-4 canon: the Mirror Draft, standing
≥ 100; damage 35–95, HP 850–1500, pierce 0.2–0.5. Wave 5: standing
≥ 200 AND wave-4 faced. Volley canon (BALANCING.md): the fight opens
at range, shots = min(ammo, clamp(1 + floor(range / monster speed),
1, 4)), each shot spends 1 real ammo. **No canon doc covers
ammunition supply specifically** — said here rather than inventing
canon. Arrow-crafting is a human skill (CANON.md), never an alien
ability.

## §8. Metric review (to be written after the pilot — frozen bars judge as written)

- Finding #2602: claimed by this arm as the DIAG follow-up; on
  DIAG-GO the ledger names the dominant source (or the missing
  delivery) and the next lever is named from the ledger, not from a
  departure tweak. On DIAG-NO-GO the finding stays open with the
  failing bar named.
- Finding #2544 stays OPEN (the ammunition-supply half): this DIAG
  does not close it — it names where the next lever must live.
- Write-flap: probe (`git update-ref refs/heads/probe HEAD`) passed
  at prereg time (~22:18 UTC); machine uptime 46 min (restart ~21:33
  UTC — inside the flap's known post-restart shape). Probe before
  every material write; if it fails, stop writing and wait for the
  clear.
