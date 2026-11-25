# sim-homecraft-gate-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-homecraft-gate-a · **Loop A run:** fleshout-20261124T2315Z
**Type:** DIAG (instrument + evidence only — no game-code fix lands).
**Frozen:** 2026-11-25 ~00:10 UTC, before any judged sim.
**Branch:** `sim-homecraft-gate-a` (worktree `~/workspace/worktrees/sim-homecraft-gate-a`).
**Base:** worktree HEAD `ebc163fe8` (sim-winnability-round-2130 adoption closeout).
**Builds on:** `evidence/2026-11-24/sim-aidammo-a.md` (§§0–§4, esp. §3b + §4 + §13)
+ prereg, finding #2544 (ammo-at-entry bar, still open).

## §0. The question, in plain words

The aidammo ledger proved home-duty craft supplies 0.849 of the ammunition
fighters hold at wave-4+ entry, and that delivery works (75% of batches
reach a fight) — but 131 of the 149 fighters who walked into a wave-4 fight
with an empty quiver had NEVER received a single batch in their whole life.
This arm asks WHY those 131 never receive a batch. The named instrument is
daily pile-material + at-home-carrier snapshots, to separate "carriers rarely
home" from "pile never holds materials".

## §1. Design from code (frozen, not a sim)

Read before designing: `docs/CANON.md`, `docs/PRESERVATION.md`,
`docs/MONSTER-WAVES.md`, `docs/BALANCING.md`. **No canon doc covers
ammunition supply specifically** — said here rather than inventing one
(same gap as aidammo). Arrow-crafting is a human skill (CANON.md), never an
alien ability. PRESERVATION.md covers the food ladder only; the arrow/bolt
recipes live in `src/data/recipes.json`, not in any canon doc.

**The home-duty craft gate, read from `villagerAmmoCraftDay`
(`src/js/villager-build.js:1584`) — frozen ground.** The duty runs once a
day (`villagerBuildDay`, same file ~1091). For each roster villager it
applies these gates IN ORDER; a villager crafts only if every gate passes:

| # | Gate (code) | What blocks |
|---|---|---|
| 1 | Home: roster minus scholar, minus `v.away`, minus dead | Carrier is away (expedition/companion) or dead — never considered |
| 2 | Cooldown: `v.arrowCraftCd[vid] > day - 3` | Attempted within the last 3 days — ≤1 attempt / 3d |
| 3 | Ranged weapon: `eq.rangedWeaponOf` (after `autoEquip`) | No bow/crossbow carried — weaponless, melee-only, or spear-only |
| 4 | Ammo id: `rdef.weapon.ammo` must be `arrow` or `bolt` | Sling (`stone`) and searcaster (`fusion_cell`) have NO home-duty recipe — the duty can never serve them |
| 5 | Already stocked: carried ammo ≥ 5 (`CAP`, one batch) | Already holds a full batch — needs nothing |
| 6 | Recipe exists (`recipes.json`, id = ammoId) | No recipe — data-level failure, not a villager failure |
| 7 | Materials: own carried + camp pile ≥ recipe need, every material | Not enough materials in hand + pile — NO attempt, NO cooldown spent |
| 8 | The roll: blind 35% / learned 85% (`v.ammoCraft[vid][ammoId] >= 2`); blind success teaches (PRACTICE rule) | Attempt fails — materials already consumed, cooldown set |

**Recipes (live from `src/data/recipes.json`):** arrow = 2 stick + 1 stone +
1 fiber, makes 5. Bolt = 2 stick + 1 stone, makes 5.

**What the gate does NOT do (frozen, so the classification never blames
it):** it never serves the scholar (`id !== this.villagerId`); it never
serves a fighter away from home; it never re-arms anyone at fight entry
("a fighter doesn't whittle a spear mid-fight"); a batch lands in the
crafter's OWN carried items — never handed to another villager by the duty.

**§1b. The instrument (driver-side, no game-code change).** Extend
`scripts/aidammo-driver-a.js` (clone, do not rewrite): keep the full ledger
+ encounter recorder verbatim, and add a daily craft-gate snapshot taken
inside the `villagerAmmoCraftDay` wrap, BEFORE the original call (the
decision-time state), plus an after-call attempted/made diff:

- Per day, per roster bow/bolt carrier (any villager whose equipped ranged
  weapon has ammoId `arrow` or `bolt`): `home` (not away, alive, not
  scholar — the duty's own home definition), `rangedId`, `ammoId`,
  `carriedAmmo`, `cooldownActive` (`arrowCraftCd[vid] > day - 3`),
  `level` (learned iff `ammoCraft[vid][ammoId] >= 2`),
  `ownSufficient` (own carried materials alone cover the recipe),
  `pileSufficient` (camp pile alone covers it),
  `combinedSufficient` (own + pile cover it),
  `attempted` (cooldown newly set by this call — the TRUE attempt flag,
  read from the `arrowCraftCd` before/after diff, never inferred),
  `madeBatch` (a home-duty batch landed for this villager this call —
  read from the ledger diff the wrap already performs).
- Per day, the pile levels of the recipe materials (`stick`, `stone`,
  `fiber` from `stashState().materials`) — the "pile never holds materials"
  story in raw numbers.
- Per seed: recipe presence (`arrow`/`bolt` recipes exist in data),
  `homeDutyCalls` (already in the ledger counters).

All snapshot reads are pure (no RNG, no game-state writes); the wrap calls
the original exactly once, as in aidammo.

**§1c. Classification (analyzer-side, frozen taxonomy).** Population:
fighters at a wave-4+ meeting with an ammo-capable ranged weapon
(`weapon.ammo` present — spears excluded, as in aidammo) and
`ammoAtEntry == 0`. For each, the window is first-carrier-day ..
first-empty-meeting-day (days they carried a bow/bolt before that meeting).
"Received a batch" = ≥1 non-starting-kit production event for that vid in
the ledger (home-duty / departure-craft / departure-pile-stones / loot /
other). Starting-kit is day-0 endowment, not a batch received during life;
both variants are reported (see §2).

A fighter who DID receive a batch and spent it before the fight is cause
**(d) spent-before-fight** — reported as its own row, not classified into
(a)–(c)/(e). For a never-received fighter, the primary cause is the FIRST
matching rule, in this order:

| Cause | Rule (frozen) |
|---|---|
| (c1) no-craftable-weapon | Entry weapon is sling (`stone`) or searcaster (`fusion_cell`) — no home-duty recipe exists for that ammo |
| (c-scholar) scholar-excluded | The fighter is the scholar — the duty explicitly skips the player (`id !== villagerId`); the player crafts directly, never via the duty |
| (c0) never-home-carrier | `carrierDays == 0` — never carried a bow/bolt at home before the meeting (the bow arrived via departure staging, so the duty never saw them as a carrier) |
| (e) village-never-crafts | Village `homeDutyBatches == 0` over the run AND fighter had ≥1 home+short day (110501-class) |
| (b) rarely-home | `awayDays / carrierDays >= 0.75` AND `carrierDays >= 5` — the carrier is almost never home when they could be served |
| (a) no-materials | `noMatsDays / homeShortDays >= 0.50` AND `homeShortDays >= 1` — on home days short of ammo, own+pile together could not cover the recipe |
| (c2) never-attempted | `eligibleDays >= 1` AND `attempts == 0` — eligible (home, short, no cooldown, materials sufficient) yet no attempt fired: duty/recipe failure |
| (c3) attempted-all-failed | `attempts >= 1` AND `successes == 0` — attempts fired and every roll failed (blind 35%); attempt counts reported |
| residual | unclassified — bucket counts printed in full so the reader can see why |

Bucket definitions (per carrier-day in the window): `carrierDays` = days
the fighter carried a bow/bolt; `awayDays` = of those, not home;
`homeShortDays` = home AND carried < 5; `noMatsDays` = of home-short days,
combined materials insufficient; `cooldownDays` = of home-short days,
cooldown active; `eligibleDays` = home, short, no cooldown, materials
sufficient (an attempt fires that day by construction); `stockedDays` =
home AND carried ≥ 5 (only reachable via starting-kit for a never-received
fighter — reported, never counted as served); `attempts` = days with the
driver-recorded `attempted` flag; `successes` = home-duty production events
for the vid (0 for every never-received fighter by definition — reported
as a consistency check).

**Desk expectation (frozen, not a verdict):** the 110501-class (e) will be
rare on a fresh band (1 of 8 villages in aidammo); the bulk of the 131 will
split between (b) rarely-home (fighters are away when the duty runs) and
(a) no-materials (the pile chronically lacks stick/stone/fiber), with (c0)
never-home-carrier taking a real share (departure-staged bows). (c2)
never-attempted should be ~0 — if it is not, the duty itself is failing to
fire, which is a code finding, not a balance finding. If the ledger shows
otherwise, the ledger wins.

## §2. Primary metric (BINDING, §14)

Single leg (DIAG — no ctl/arm; there is no lever to compare).

- **Primary metric: the per-cause classification of never-received empty
  fighters.** Population = empty fighters at wave-4+ entry (ammo-capable
  ranged weapon, `ammoAtEntry == 0`, lead + allies, all origins, evades
  included — same population as aidammo §3b). Split = received-a-batch
  (cause (d)) vs never-received; the never-received are classified into
  causes (a)/(b)/(c0)/(c1)/(c-scholar)/(c2)/(c3)/(e) by the frozen §1c
  rules. Reported as a table: count + share per cause, plus the residual
  unclassified count + share.
- **Pool floor:** never-received empty fighters ≥ 10 (aidammo measured 131
  on its band; the floor is the same order of magnitude as the aidammo
  pair floor, sized to that population — if the fresh band somehow yields
  < 10, the verdict is DIAG-NO-GO thin-pool, not a re-score).
- **Classification completeness:** ≥ 0.90 of never-received empty fighters
  carry a named cause (residual ≤ 0.10).
- **Instrument bars:** analyzer `--selftest` green AND proof test
  (`scripts/test-homecraft-gate-a.js`) green, 0 instrument errors across
  the band.
- **Consistency checks (reported, never verdict bars):** every eligible day
  carries the `attempted` flag (eligible ⇒ attempt by construction); every
  never-received fighter has 0 home-duty successes; the re-measured
  ammo-at-entry rate (report-only, vs the 0.70 bar) and the never-received
  share under the alternative definition (starting-kit counts as
  "received") are both printed beside the primary table.

**GO threshold (DIAG-GO):** pool floor met AND classification completeness
≥ 0.90 AND instrument bars green. **A miss on any bar is DIAG-NO-GO, never
re-scored.**

**Determinism check (not a verdict bar):** after the pilot, re-run seed
110701 with identical env and compare the craft-gate snapshot hash
(gate rows + ledger events + encounter ammo fields). The snapshot draws no
RNG and calls each original exactly once, so the re-run must match. A
mismatch is reported as an instrument artifact in the evidence, never
claimed as a lever effect.

## §3. Secondary metrics (supporting, not binding)

- Batches and units by production source (aidammo ledger, re-measured on
  this band); home-duty attempts vs successes per seed (from the gate
  snapshots: eligible days vs batches made); departure pocket outcomes.
- Pile-material story: daily pile levels of stick/stone/fiber per seed
  (median, days-at-zero, days-below-arrow-recipe-need); pile-sufficiency
  rate on home+short carrier-days.
- Carrier home-share: home days / carrier days, pooled and per seed;
  bow-carrier counts (how many villagers ever carry a bow/bolt).
- Ammo-at-entry rate, capable-only rate, spear share at entry (aidammo
  re-measure on the fresh band, report-only).
- Wall numbers: national / table / wins, wave-4 and wave-5 unlocks,
  median survival, death-cause shares. Table not instrumented by this
  driver — reported as null, never faked.
- Sense-testing: ≥ 2 meeting transcripts read in full + ≥ 1 home-duty
  craft narration line (`say` lines from `vetSays`) read for meaning —
  does the supply story read sensibly (who had arrows, who did not, and
  whether any villager's gate state contradicts what the ledger says).

## §4. Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the aidammo / ammosupply bands,
  for comparability). Dead villages stop simulating (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 110701, 110702, 110703, 110704,
  110705, 110706, 110707, 110708.** Freshness check (skill
  local_seed_band_freshness): `grep -rl "11070" evidence/*/sim-*-prereg.md`
  — **0 hits**; per-seed `grep -rl "11070[1-8]" evidence/*/sim-*-prereg.md`
  — **0 hits**; `grep -r --include="*.md" -l "11070[1-8]" evidence/` — one
  hit, `evidence/2026-10-30/sim-scale-onramp-round-1107.md`, which is the
  RUN ID `fleshout-20261030T110704Z` (a timestamp, not a seed band — no
  collision); no `perseed-*11070*` corpus dir exists (checked 2026-11-25
  ~00:05 UTC, before this prereg was frozen). Neighbouring used bands
  avoided: 110101–110108, 110201–110208, 110401–110408, 110501–110508.
- **Policies:** competent verbatim. **Substrate:** `VETREENGAGE=1 +
  PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`, `SENSEEXPED=1`,
  `SPEARGATE=1`, `BOWOPEN=1` (same as the aidammo pilot, so numbers
  compare). The driver asserts all seven flags and stops otherwise.
  The corpus files record `bowopenOn` + `speargateOn` + `senseexpedOn`
  + `wiringSha` + `gameSha`.
- **Instrument:** `scripts/homecraft-gate-driver-a.js` (clone of
  `scripts/aidammo-driver-a.js` + the §1b gate snapshot; RUN=
  homecraft-gate-a, OUTDIR `evidence/2026-11-24/perseed-homecraft-gate-a`).
  Analyzer `scripts/analyze-homecraft-gate-a.js` (clone of
  `scripts/analyze-aidammo-a.js`, single-leg + §1c classification;
  `--selftest` green before the pilot). Per-seed JSONs under
  `evidence/2026-11-24/perseed-homecraft-gate-a/`.
  **§15 panel:** single-leg DIAG — no before/after panel exists to
  compare (no lever, no control leg). The panel step is NOT APPLICABLE;
  said here rather than faked. The analyzer JSON is the instrument
  output.
- **PILOT ONLY (8 seeds).** No confirm: a DIAG arm measures once on
  the pilot band; a second band is a new prereg, never a silent
  extension.

## §5. Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a fighter is SERVED, so the fixture is the
departure / meeting itself, staged by the competent policy: a geared
scholar fighting with a party, never a fresh un-geared solo scholar. The
proof test (`scripts/test-homecraft-gate-a.js`, GREEN before the pilot)
runs on a LIVE loaded village with real roster/gear and proves the gate
snapshot (each bucket forced in turn: away / stocked / cooldown /
no-materials / eligible, pile vs own sufficiency split, attempted flag
from the cooldown diff, recipe presence) plus the classifier on fixture
populations. The pilot's per-seed corpora carry the encounter averages
(party size, gear, abilities, ranged-at-entry) beside the verdict in the
evidence file.

## §6. Pre-pilot substrate checklist (§14b)

1. **Contact:** wave-4 meetings occur on the substrate — aidammo band:
   21 pair-inclusive engaged meetings per 8 seeds, 149 empty-quiver
   fighters; the empty-fighter population is the contact, and it is large.
2. **Pool sizing:** see (1). The floor (≥ 10 never-received) is sized to
   the aidammo population (131); a miss would mean the fresh band's
   villages behave nothing like aidammo's, which is itself a finding.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-homecraft-gate-a.js`, GREEN before the pilot) proves
   the gate snapshot + classifier on a live village (see §5). The
   analyzer `--selftest` covers the judge shapes (DIAG-GO / DIAG-NO-GO
   thin-pool / DIAG-NO-GO classification / DIAG-NO-GO instrument) plus
   the bucket-aggregation shapes.
4. **Horizon fit:** the phenomenon (a fighter's whole life without a
   batch) needs the full 150d window — the window is the fighter's life
   to their first empty meeting, which the 150d death-aware horizon
   contains.

## §7. Canon

`docs/CANON.md` (manifest), `docs/PRESERVATION.md`, `docs/MONSTER-WAVES.md`,
and `docs/BALANCING.md` read. Wave-4 canon: the Mirror Draft, standing
≥ 100; damage 35–95, HP 850–1500, pierce 0.2–0.5. Wave 5: standing
≥ 200 AND wave-4 faced. **No canon doc covers ammunition supply
specifically** — said here rather than inventing canon. Arrow-crafting is
a human skill (CANON.md), never an alien ability. PRESERVATION.md covers
the food ladder only and says nothing about arrow/bolt craft.

## §8. Metric review (to be written after the pilot — frozen bars judge as written)

- Finding #2544 stays OPEN (the ammunition-supply half): this DIAG does
  not close it — it names WHY the 131 never receive a batch, and the next
  lever is named from the classification, not from a departure tweak. On
  DIAG-GO the classification names the next lever (the dominant cause's
  fix). On DIAG-NO-GO the finding stays open with the failing bar named.
- Write-flap: probe (`git update-ref refs/heads/probe HEAD`) FAILED at
  prereg time (~00:05 UTC) — O_EXCL creation refused machine-wide
  (EPERM, errno 1, in /tmp, the worktree, and the main .git alike) while
  plain file writes succeed in all three places. Commits worked as
  recently as 23:22 UTC, so this is a NEW transient window, inside the
  flap's known post-restart shape (machine uptime 37 min at probe time).
  Per the flap skill: plain file writes proceed with readback verification;
  git writes (commit via safe-commit.sh) are retried only after the probe
  passes. If the probe is still failing at run end, the prereg,
  instruments, corpora, and evidence stay written-but-uncommitted in the
  worktree and the block is reported loudly with exact recovery commands
  — the freeze is the file on disk with its pre-pilot timestamp, and the
  commit follows when the flap clears. Probe before every material write.

## §9. Correction (pre-pilot, 2026-11-25 ~00:45 UTC — before any judged sim)

- Bucket order clarification (§1c): the per-carrier-day bucket follows the
  code's gate order in `villagerAmmoCraftDay` — cooldown is gate 2,
  already-stocked is gate 5 — so a day where a carrier is BOTH stocked
  (≥5 carried) AND in cooldown counts as `cooldown`, not `stocked`.
  `stockedDays` in the detail rows therefore means home + carried ≥ 5 +
  not in cooldown. This changes no verdict bar and no cause rule
  (stockedDays feeds no rule; home-short days are unaffected — a stocked
  day is never home-short under either order). Found by the proof test
  (a freshly crafted carrier reads stocked + cooldown the same day).
