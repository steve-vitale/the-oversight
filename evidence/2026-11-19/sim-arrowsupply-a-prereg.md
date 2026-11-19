# sim-arrowsupply-a — PREREG (frozen BEFORE any new sim)

**Arm:** sim-arrowsupply-a · **Loop A run:** fleshout-20261119T1215Z
**Type:** DIAG — quantify ammo supply for departing archers (finding
#2594). **Frozen:** 2026-11-19 ~07:05 UTC, before any new sim.
**Branch:** `sim-arrowsupply-a` (worktree
`~/workspace/worktrees/sim-arrowsupply-a`). **Base:** master
ebea87dfb (includes the landed speargate + bowopen arms, both
default-OFF; BOWOPEN is UNSET on this run, so the staging never
fires and the measured behavior is master's default behavior).
**Builds on:** `evidence/2026-11-19/sim-bowopen-a.md` (§§5, 9, 10)
and `evidence/2026-11-19/sim-bowopen-a-prereg.md`.

## AMENDMENT (2026-11-19 ~07:35 UTC, BEFORE any judged sim — the
smoke run stopped at the substrate assert with no corpus written)

The substrate line as first frozen (`VETREENGAGE=1 + PARTYSIZE4=1 +
FLEEREPAIR2=1 + FIGHTALLY2=1`, `LAUNCHPARTY=1`) is WRONG for this
base: the old LAUNCHPARTY sense fix is NOT on master ebea87dfb —
it was superseded by SENSEEXPED, landed as 97e78670d
(sim-senseexped-b, finding #2583, GO), and `LAUNCHPARTY` appears
nowhere in `src/js/` on this base. The run therefore uses the live
master substrate **`SENSEEXPED=1 + PARTYSIZE4=1 + VETREENGAGE=1 +
FLEEREPAIR2=1 + FIGHTALLY2=1`**, the same substrate the sibling
fightcap-b arm runs on. The driver asserts SENSEEXPED presence in
`src/js/party-wiring.js` + the flag, and records
`senseexpedOn` / `senseexpedPresent` per corpus file. Nothing else
in this prereg changes: the question, the frozen bars, the band,
and the horizon are untouched, and no judged data existed when
this amendment was made.

## The question

Finding #2594: Lena (105703 d109) carries a bonus-50 starfall bow
and meets a wave-4 monster with ZERO arrows; pocketAmmo's single
blind departure craft (35%) evidently failed or never ran with
materials. She still strikes 36–37 (the fold-in) and flees at 241
damage dealt. The arrow-supply side of the ranged opening is a
separate, live gap from the bow-staging side. This DIAG quantifies
it: how often departing archers leave with zero matching ammo, why,
where ammo comes from, and what the lost opening volley costs in
the fight. Related finding #2593 (the "no arrows" narration line
misnames non-arrow ammo) is a one-line narration fix in
fieldFights.js, NOT a lever — noted in the evidence, not folded
into this verdict. Related: #2591 (spear in the ranged slot blinds
ranged gates), #2592 (villages hold no spare bows).

## The mechanism (frozen, from code read — not a sim)

**Ammo taxonomy** (src/data/items.json, src/data/recipes.json —
data, not canon; no canon doc covers ammo supply):

| Ranged weapon | Ammo | Supply route |
|---|---|---|
| sling (8), phase_sling (35) | stone | communal pile, taken directly (cap 6) |
| crude_bow (18), bow (22), starfall_bow (50), apex_bow (95) | arrow | 1 craft attempt / departure (recipe: stick 2 + stone 1 + fiber 1, makes 5); pile materials only |
| crossbow (28) | bolt | 1 craft attempt / departure (recipe: stick 2 + stone 1, makes 5); pile materials only |
| searcaster (120) | fusion_cell | NO recipe, NO pile source — loot / starting only |
| hunting_spear, fire_hardened_spear | (none) | no `weapon.ammo` — the volley never fires; pocketAmmo returns immediately |

**Two craft beats exist** (both write the SHARED `v.ammoCraft`
record; blind 35%, learned 85%; a blind success teaches —
the PRACTICE rule; a failed craft spends the materials):

1. **Departure — `villagerPocketAmmo`** (game.js:8025, called from
   `startExpedition` villager-agency.js:527 and `resolvePatrol`
   game.js:8335): (1) own stashed ammo first; (2) communal pile
   (stones taken directly; arrows/bolts NOT taken from the pile —
   there is no pile arrow stock, only a craft); (3) ONE craft
   attempt per departure for arrow/bolt from PILE materials only
   (own carried materials are never used here). Cap: stones top
   up to 6, crafted ammo to one batch (5); the cap gates the
   ATTEMPT (carried < cap), not the batch. Fusion cells and any
   other ammo kind return before the craft (no recipe).
2. **Home — `villagerAmmoCraftDay`** (villager-build.js, build-arrow-make
   2026-11-01 Arm 5): a bow/crossbow carrier AT HOME with <5 ammo
   crafts one batch from own carried materials first, then the pile;
   at most 1 attempt per villager per 3 days (cooldown
   `v.arrowCraftCd`). Spears fall out (no ammo id); slings and
   searcasters fall out (arrow/bolt only).

**What the volley is worth** (bowopen prereg mechanism math): a
3-shot bow volley at ~55% hit chance ≈ 25–35 damage expected;
the winning shape's opening was 51–63. The fold-in
(`wb = round((melee + ranged)/2)`) is the bigger half and does NOT
need ammo — Lena's 36–37 strikes prove it. So the volley-loss cost
is bounded at roughly one opening volley (~30 damage, ~2.5% of a
~1200-HP monster) PLUS nothing on later rounds — unless the
zero-ammo archer is ALSO the fold-in carrier, which the encounter
split below separates.

**Telemetry (from the field engine + departure wraps, never from
30-day snapshots):** the driver wraps `villagerPocketAmmo` (every
call site) and `villagerAmmoCraftDay` with pre/post reads
(ranged weapon, ammo id, carried/stash/pile counts, the `out`
return), wraps `villagerKillLoot` for ammo/ranged drops, wraps
`Game.craft` for player arrow/bolt crafts, and takes a daily ammo
census (every living roster villager: ranged weapon + ammo count +
stash ammo; communal pile recipe materials) plus a day-0 baseline.
Failure reasons are classified from the pre/post reads, never
guessed: `craft-failed` (attempt ran, roll lost), `no-materials`
(no attempt: pile short of the recipe), `craft-never-ran`
(materials sufficient, no attempt — instrument error if seen),
`no-source-kind` (fusion_cell: no recipe, no pile), plus
`stash` / `pile-stone` / `craft-ok` successes. The encounter rows
carry `rangedId` / `ammoAtEntry` / `volley` exactly as the bowopen
driver does, so the volley-loss cost is read from the fight engine.

## Primary metric (BINDING, §14)

**Zero-ammo departure rate among departures by holders of
ammo-bearing ranged weapons** — a departure (one
`villagerPocketAmmo` call) counts when the villager holds a ranged
weapon whose def carries `weapon.ammo` (bow/crossbow/sling/
phase_sling/starfall_bow/apex_bow/searcaster); it is a zero-ammo
departure when carried matching ammo after the call is 0.
(Spear-holders are counted separately, never in this denominator —
#2591.)

**Verdict ladder (frozen):**
- **DIAG-GO** iff ALL THREE hold: (1) powered departure pool —
  ≥50 ammo-bearing-archer departures across the band; (2) the
  question is answered decisively — EITHER one failure reason
  accounts for ≥50% of zero-ammo departures (dominant cause
  named), OR the zero-ammo rate is ≤0.10 (supply is not the gap —
  the answer is "rare"); (3) the encounter read is powered —
  ≥8 pair-inclusive engaged meetings with an ammo-bearing fighter
  at entry (for the volley-loss cost).
- **DIAG-NO-GO** otherwise: thin departure pool, fragmented
  reasons with a substantial zero-ammo rate (no dominant cause),
  or an under-powered encounter read. A NO-GO names what is
  missing, not a fix.

**If the diag finds a fixable lever** (e.g. pocketAmmo craft rate /
materials, home-duty cooldown, fusion-cell source), it is named
precisely and filed as the next arm — NO game-code fix lands in
this DIAG arm.

## Secondary metrics (supporting, never re-scored)

- (a) Zero-ammo departures by weapon type (bow / crossbow / sling /
  phase_sling / starfall_bow / apex_bow / searcaster), with the
  spear-holder departure count beside it.
- (b) pocketAmmo attempts / successes / failures by source
  (stash / pile-stone / craft-ok / craft-failed / no-materials /
  no-source-kind / craft-never-ran) + home-duty attempts /
  successes / failures (same reason taxonomy where it applies).
- (c) Ammo acquisition by source (departure craft / home-duty
  craft / kill loot / player craft / starting stock from the day-0
  baseline) and ammo stock over time (daily census: mean carried
  ammo per archer, share of archers at 0, pile recipe-material
  levels by day bucket).
- (d) Volley-loss cost: pair-inclusive engaged meetings (the
  bowopen population) split by fighter `ammoAtEntry` 0 vs >0
  among ammo-bearing ranged weapons — mDealt, damage/round,
  rounds, outcome shares; plus how many zero-ammo meetings lost
  the volley outright (volley null / 0 shots) and the mean volley
  damage on the armed side. Matched read: count seeds holding
  both a zero-ammo and an armed meeting, reported honestly when
  the pairing is thin.
- Wall numbers (reported every run): national / table / wins,
  wave-4 and wave-5 unlocks, median survival, per seed.
- Table: not instrumented by this driver — reported as null,
  never faked.

## What this DIAG does NOT judge

- The bow-staging side (bowopen-a NO-GO stands; the staging never
  staged — a separate arm's question).
- The Rage/carrier half (Loop B's work).
- The 4th seat (engine-blocked: fieldFights.js slices allyVids
  to 2) — out of scope.
- The rounds=0 "vKill" rows with mHpStart null and mDealt ~12–27
  are excluded by the engaged filter (rounds > 0), as in bowopen-a.
- No 12–16 seed confirm in this run — pilot only; the
  coordinator decides the confirm from the verdict.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the bowopen/fightcap
  bands, for comparability). Dead villages stop simulating
  (+10d tail max).
- **Seeds (fresh 8-seed band): 107021, 107022, 107023, 107024,
  107025, 107026, 107027, 107028.** Freshness check (skill
  local_seed_band_freshness): `grep -rl "10702[1-8]" evidence/
  --include="*.md"` — **0 hits**; same pattern over
  `evidence/ --include="*-prereg.md"` — **0 hits**. The goal
  `hidden_files/` grep hit only OLD .json corpora, and every hit
  is a false positive on inspection: `107028` is a pantryFresh
  kcal value (107,028 kcal) in an Oct-16 census, `107022592297802`
  is the tail of the float 1.107022592297802 in an Oct-17 beats
  file — neither is a sim seed. No prereg, dated .md, or
  convergence-tracker line names this band. The sibling arm's
  band 107001–107008 is NOT reused. Neighbouring used bands
  avoided: 105701–105708 (bowopen-a), 104501–104508 (fightcap-a),
  104601–104608 (fightcap-dmg-a). Band 107021–107028 is fresh.
- **Policies:** competent verbatim. **Substrate:**
  `SENSEEXPED=1 + PARTYSIZE4=1 + VETREENGAGE=1 + FLEEREPAIR2=1 +
  FIGHTALLY2=1` (live master substrate — see the AMENDMENT above;
  the bowopen LAUNCHPARTY substrate is not on this base).
  **Single leg (DIAG, no lever): MODE=diag,
  BOWOPEN unset** — the driver asserts the flag is unset, so the
  measured behavior is master's default. No ctl/arm split: there
  is no code change to compare.
- **Instrument:** `scripts/arrowsupply-driver-a.js` (clone of
  `scripts/bowopen-driver-a.js` — the full launch-funnel recorder
  is unchanged — plus the ammo wraps + daily census above);
  analyzer `scripts/analyze-arrowsupply-a.js` (reuses
  `analyze-bowopen-a.js` legStats for the encounter population +
  its own ammo aggregation, `--selftest` incl. the DIAG-GO /
  DIAG-NO-GO judge shapes); per-seed JSONs under
  `evidence/2026-11-19/perseed-arrowsupply-a-diag/`.
  **§15 panel:** `scripts/build-arrowsupply-panels-a.js` (adapted
  copy of the bowopen panel builder) + `node
  scripts/balance-panel.js compare`; single leg, so before==after
  is the same corpus — a zero-delta screen, stated as such in the
  evidence (the panel is the instrument, the frozen bars above
  are the judge; a DIAG carries no lever to compare).
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a launched party FIGHTS as launched,
so the fixture is the encounter itself, staged by the competent
policy: a geared scholar fighting with a party, never a fresh
un-geared solo scholar. The pilot's per-seed corpora carry the
encounter averages (party size, gear, abilities, ranged-at-entry)
beside the verdict in the evidence file. The nearest measured point
is the bowopen band (launched parties geared by the launch
gear-up, min armorP 17.7–28.3); the pilot does not re-derive gear.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate —
   bowopen-a fresh band: 82 launched expedition meetings per 8
   seeds; 27 pair-inclusive engaged. The ranged-at-entry subset
   was 14/27 — the encounter-read floor (≥8) is sized to that.
2. **Pool sizing:** bowopen-a saw 400 departures on 8 seeds; the
   ammo-bearing-archer departure pool is a subset of that — the
   ≥50 floor is sized to the bowopen departure volume (if archers
   are ~1/4 of departures, expect ~100).
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-arrowsupply-a.js`, GREEN before the pilot)
   proves the wraps classify each pocketAmmo outcome on fixtures
   (stash top-up, pile stone, craft success, craft failure,
   no-materials, fusion-cell no-source, spear no-ammo, already
   full), the home-duty wrap attributes attempts/successes, the
   census reads ranged kit + ammo + pile, and the analyzer's
   judge shapes (DIAG-GO dominant-cause, DIAG-GO rare-rate,
   DIAG-NO-GO thin pool, DIAG-NO-GO fragmented) decide as
   written. The analyzer `--selftest` covers the departure
   aggregation, the reason taxonomy, the encounter split, and all
   judge shapes.

## Canon note

`docs/CANON.md` (manifest) and `docs/MONSTER-WAVES.md` were read
for this arm. MONSTER-WAVES.md: wave-4 bands are damage 35–95, HP
850–1500 — "a 4–6 round fight for a godhood build (~220
dmg/round)". **No canon doc covers ammo supply, arrow crafting,
or the departure/home ammo duties** — said here rather than
inventing canon. The ammo taxonomy is cited from data
(`src/data/items.json` weapon.ammo, `src/data/recipes.json`
arrow/bolt recipes) and the supply mechanics from code
(`game.js` `villagerPocketAmmo`, `villager-build.js`
`villagerAmmoCraftDay`, `fieldFights.js` volley + strike
fold-in), not from canon.
