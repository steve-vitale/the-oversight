# sim-ammosupply-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-ammosupply-a · **Loop A run:** fleshout-20261124T1815Z
**Type:** LEVER BUILD + MEASURE — finding #2544 (fight capability:
damage output), the ammunition-supply half of the ranged opening.
**Frozen:** 2026-11-24 ~19:10 UTC, before any judged sim.
**Branch:** `sim-ammosupply-a` (worktree
`~/workspace/worktrees/sim-ammosupply-a`). **Base:** worktree HEAD
04918a1e2 (Version bump 36a420d16-20261124-182835, batch ship).
**Builds on:** `evidence/2026-11-24/sim-bowopen-recheck-a.md` (§§2, 9)
+ prereg, `evidence/2026-11-24/sim-scale-onramp-round-1715.md`
(named #2 next blank), `evidence/2026-11-19/sim-arrowsupply-a.md`
(DIAG, finding #2594) + prereg, `evidence/2026-11-19/sim-bowcraft-a.md`,
`evidence/2026-11-19/sim-speargate-a.md`.

## §0. The question, in plain words

Departing villagers carry bows but walk into wave-4 fights with empty
quivers: only 29 of 88 ranged-at-entry fighters had ammunition on the
bowopen-recheck arm leg. The volleys that do fire hit well (a 46-damage
opening in the Stephen transcript), but two-thirds of bow-carriers
arrive with nothing to loose. This arm builds the ammunition-supply
lever — arrows/stones put in departing hands at departure, at a real
material cost — and measures whether supplied ammo turns into volleys,
damage, and kills.

## §1. Design from code (frozen, not a sim)

Read before designing: `docs/CANON.md`, `docs/MONSTER-WAVES.md`,
`docs/BALANCING.md`. **No canon doc covers ammunition supply
specifically** — said here rather than inventing one. Crafting arrows
is a human skill, not an alien ability (CANON.md human-skills lane);
the lever uses the existing arrow/bolt recipes and the shared
`v.ammoCraft` knowledge record, never a System grant.

**What already exists (the ground this lever stands on):**

- `villagerPocketAmmo` (`src/js/game.js`): at departure (expedition
  via `startExpedition`, patrol via `resolvePatrol`) a ranged holder
  pockets own stashed ammo, then sling stones from the communal pile,
  then ONE craft attempt for arrow/bolt from PILE materials only
  (blind 35% / learned 85%, shared `v.ammoCraft`, materials spent on
  failure). Silent — never narrates.
- `villagerAmmoCraftDay` (`src/js/villager-build.js`, home duty):
  a bow/crossbow carrier AT HOME with <5 ammo crafts one batch from
  own carried materials first, then the pile; ≤1 attempt / 3 days.
- Volley engine (`src/js/fieldFights.js`, `_ammoName` ~1059–1076):
  fires when the fighter carries a ranged weapon + matching ammo;
  shots = min(ammo, clamp(1 + floor(range / monster speed), 1, 4));
  each shot spends 1 real ammo; empty quiver → honest named line
  ("no arrows" / "no stones" / "no bolts" / "no fusion cells").
- Arrow recipe (`src/data/recipes.json`): 2 stick + 1 stone + 1 fiber
  → 5 arrows. Bolt: 2 stick + 1 stone → 5 bolts. Sling stones come
  straight from the pile. Fusion cells have NO recipe and NO pile
  source — the searcaster can never be pocketed for (arrowsupply-a
  §10: do NOT fold cells into bow/arrow work; this arm does not).

**Desk diagnosis from the bowopen-recheck corpora (frozen numbers,
recomputed from `evidence/2026-11-24/perseed-bowopen-recheck-a-{ctl,arm}/`,
all wave-4+ `v4encounters` rows):**

| Population (arm leg) | Ranged at entry | With ammo | Rate |
|---|---|---|---|
| All wave-4+ encounters | 88 | 29 | 0.33 |
| Expedition origin | 11 | 10 | 0.91 |
| Aid origin | 27 | 14 | 0.52 |
| World-tick origin | 27 | 5 | 0.19 |
| Spears (no ammo id — can never be supplied) | 21 of 88 | 0 | — |
| Ammo-capable weapons only | 65 | 29 | 0.45 |

Expedition fighters — the only ones who pass a departure — are
ALREADY stocked 10/11 (pocketAmmo + home duty work where they run).
The empty quivers concentrate in aid and world-tick fights, where
the fighter never departs, and in spears (24% of ranged-at-entry),
which take no ammunition at all. **Pre-registered headwind:** even a
perfect departure lever can add at most ~1 expedition fighter per
band to the all-encounters rate, so the 0.70 mechanism bar (§3) is
out of reach of any departure-only lever as designed. The pilot is
run anyway — the frozen bars judge as written, and the pilot measures
the lever's real movement and confirms the origin diagnosis on a
fresh band. The next arm is named from that diagnosis, not from
another departure tweak.

**The lever — `Game.villagerAmmoSupply(vid)` (`src/js/game.js`),
env-gated `AMMOSUPPLY=1`, default OFF (off = byte-identical old
behavior: no state writes, no say lines, no telemetry):**

Runs at the SAME two departure sites as `villagerPocketAmmo`, AFTER
it — `startExpedition` (`src/js/villager-agency.js`) and
`resolvePatrol` (`src/js/game.js`). Never for the player, never
mid-fight, never touches the rage/carrier path (Loop B owns it) or
the BOWOPEN staging mechanism itself. Only for a departing villager
carrying an ammo-bearing ranged weapon with ZERO matching ammo left
after pocketAmmo ran. In plain words: if you are leaving with a bow
and no arrows, the village makes you arrows before you go — if it
can — and tells you honestly when it cannot.

1. **Craft one batch** from the EXISTING arrow/bolt recipe, using
   the villager's OWN carried materials first, then the communal
   pile (pocketAmmo's blind spot: it checks the pile only — a
   villager carrying sticks in their own pack could not use them).
   Same PRACTICE odds as every other ammo craft (blind 35% /
   learned 85%, shared `v.ammoCraft` record — a blind success
   teaches). Materials are spent whether the craft succeeds or
   fails. This is the REAL cost: 2 stick + 1 stone + 1 fiber per
   arrow batch (2 stick + 1 stone per bolt batch), drawn from the
   village's stores. No time cost beyond the departure itself —
   departures are instant in code and no day-part hook exists to
   charge honestly; said here, not faked.
2. **Stones:** a sling holder still empty after pocketAmmo gets a
   second look at the pile (pocketAmmo already takes
   min(needed, have), so this is a no-op unless the pile moved —
   kept for symmetry, never a second take).
3. **No recipe, no source** (fusion cells; any future ammo kind
   without a recipe): no attempt, no fake success — recorded
   `noRecipe`.
4. **Voiced honestly, witnessed only:** success, failed craft, and
   no-materials each get a `say` line, but only when the player is
   at Haven (`playerAtHaven()` — the home-duty precedent: a
   departure the player cannot witness is not narrated to them).
   Exact lines (verified by the proof test):
   - success: `"<First> pockets 5 arrows before heading out — their own work, from the village stores."`
     (count and ammo plural from the item def: arrows / bolts / stones).
   - failed craft: `"<First> tried to knap arrows before heading out, and they came apart in their hands. The materials are wasted."`
   - no materials: `"<First> has a bow but no arrows — no sticks and fiber for more."` (names the
     missing material(s); weapon and ammo named from the real defs).
   - no recipe: `"<First> carries a Searcaster but no fusion cells — nothing in the village makes them."`
5. **Telemetry:** `village.ammoSupply` counters +
   `ammoSupplyByVid[vid]` (last supply: day, source, itemId,
   ammoId, units) — the driver reads them; the encounter row
   carries the volley itself, so carrier-fire detection comes from
   the fight engine, never from snapshots. Sources: `supplied`
   (craft ok / stones pocketed), `craftFail`, `noMats`,
   `noRecipe`, `alreadyArmed` (pocketAmmo already armed them —
   counted, never re-supplied).

**What this lever is NOT:** not another staging tweak (bowopen-a §10
forbids that route); not a home-duty change; not an odds change
(35%/85% untouched); not a cell source; not a fight-entry top-up
(the ammoCraftDay comment rejects that: a fighter far from home
cannot honestly spend pile materials).

## §2. Primary metric (BINDING, §14) — the bowopen-a frozen bars, reused verbatim, plus the mechanism bar

Wave-4+ engaged meetings, pair-inclusive (size ≥ 2, present,
engaged), from the live corpora (never snapshots). Legs differ ONLY
by AMMOSUPPLY.

- **Pool floor:** arm pair-inclusive engaged ≥ 10.
- **Kill share (pair-inclusive):** arm ≥ 0.25.
- **Damage/round (pair-inclusive):** arm ≥ 70.
- **Mechanism check — volley fired:** ≥ 0.50 of engaged meetings.
- **MECHANISM BAR (new, binding): ammo-at-entry rate among
  ranged-at-entry fighters in wave-4+ encounters ≥ 0.70**
  (baseline ~0.33: bowopen-recheck arm 29/88). Computed over ALL
  `v4encounters` rows in the corpus (every origin, evades included —
  the row records kit at entry before any fight): denominator =
  rows with `rangedId != null`; numerator = rows with
  `ammoAtEntry > 0`. Secondary (reported, never substituted):
  ammo-capable-only rate (weapons whose def carries `weapon.ammo`),
  by-origin split (expedition / aid / world-tick), and the
  expedition-only rate (the lever's reachable population).
- **Staging sniff test (pilot gate):** arm `ammoSupply.supplied > 0`
  AND volleys fire on the arm leg. If the pilot supplies 0 batches,
  the verdict is NO-GO on the pilot with the mechanism diagnosis as
  the finding — NO 12–16 seed confirm is run on a null.

**GO threshold:** pool floor met AND mechanism bar met AND kill
share ≥ 0.25 AND damage/round ≥ 70 AND volley fired ≥ 0.50 AND all
cost bars pass (below). **A miss on any bar is NO-GO, never
re-scored.**

**Cost bars (binding guardrails):** community loss arm ≤ ctl +
0.125; villager starvation arm ≤ ctl + 2 (totals AND villager-only);
median survival arm ≥ 0.8 × ctl; instrument errors 0 on all
per-seed files.

## §3. Secondary metrics (supporting, not binding)

- Supply by source per leg (`alreadyArmed` / `supplied` /
  `craftFail` / `noMats` / `noRecipe` + `ammoSupplyByVid` count).
- Volley-capable share at wave-4+ meeting entry per leg; spear
  share at the fight per leg; mean volley damage; ranged-at-entry
  share; ammo-at-entry by origin and by weapon id.
- Trio+ population (size ≥ 3, present, engaged) beside the primary,
  never substituted. Zero-damage fights classified explicitly,
  never silently pooled. Gate question among losses. Monster mix by
  outcome. Wall numbers every run: national / table / wins, wave-4
  and wave-5 unlocks, median survival, death-cause shares, per leg.
  Table not instrumented by this driver — reported as null, never
  faked.
- Sense-testing: one fight transcript where the volley fired with
  supplied ammo and one where ammo was still missing, read in full.
  Note the exact voiced lines for supplied / failed supply (from the
  proof test + pilot `vetSays` where witnessed).

## §4. Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as bowopen/speargate/
  bowopen-recheck bands, for comparability). Dead villages stop
  simulating (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 110401, 110402, 110403,
  110404, 110405, 110406, 110407, 110408.** Freshness check
  (skill local_seed_band_freshness): `grep -rl "11040[1-8]"`
  over `evidence/*/sim-*-prereg.md` — **0 hits**; over
  `evidence/2026-11-24/*.md` — **0 hits**; over
  `evidence/2026-11-2*/*.md` — **0 hits** (checked 2026-11-24
  ~19:05 UTC, before this prereg was frozen). Neighbouring used
  bands avoided: 104401–104608, 106181–106188, 107301–107648,
  109201–109432, 110101–110108, 110201–110208. Note: band
  110301–110308 was considered first and REJECTED — the strings
  appear as data values inside old Oct 24 / Nov 7 sweep JSONs
  (e.g. `evidence/2026-10-24/fullpantry-casecount-b-corpus/
  sweep-competent.json`), not as a reserved band, but the
  collision risk is not worth it; 110401–110408 is unambiguous.
  No 1104xx band is named anywhere in evidence.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `SENSEEXPED=1`, `SPEARGATE=1`, `BOWOPEN=1` (the re-measured
  staging ground). BOWCRAFT is always-on in code on both legs
  (live ground, not a flag). **Ctl = same code, AMMOSUPPLY unset;
  arm = same code, AMMOSUPPLY=1.** The legs differ ONLY by env —
  no code change between legs. The driver asserts the flag matches
  the MODE label and each corpus file records `ammosupplyOn` +
  `ammosupplyPresent` + `bowopenOn` + `speargateOn` +
  `senseexpedOn` + `wiringSha` + `gameSha`.
- **Instrument:** `scripts/ammosupply-driver-a.js` (clone of
  `scripts/bowopen-driver-recheck-a.js`, leg variable AMMOSUPPLY;
  RUN=ammosupply-a, OUTDIR
  `evidence/2026-11-24/perseed-ammosupply-a-{ctl,arm}`).
  Analyzer `scripts/analyze-ammosupply-a.js` (clone of
  `scripts/analyze-bowopen-a.js`, reuses `legStats` + `judge`
  verbatim for the outcome bars; adds `ammoAtEntryAll` +
  mechanism-bar judge + `ammoSupply` aggregation; `--selftest`
  green before the pilot). Per-seed JSONs under
  `evidence/2026-11-24/perseed-ammosupply-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-ammosupply-panels-a.js`
  (clone of the bowopen panel builder, new prefix/defaults) +
  `node scripts/balance-panel.js compare`; the compare `.md` is
  attached to the evidence file. The panel is the instrument,
  the frozen bars above are the judge.
- **PILOT ONLY.** Confirm 12–16 seeds ONLY if the pilot is GO;
  the coordinator decides the confirm from the pilot verdict.

## §5. Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a departing villager is SERVED, so
the fixture is the departure itself, staged by the competent
policy: a geared scholar fighting with a party, never a fresh
un-geared solo scholar. The proof test
(`scripts/test-ammosupply-a.js`, GREEN before the pilot) runs on a
LIVE loaded village with real roster/gear and proves the supply
mechanism (supplied-with-materials + voiced, no-materials honest
line + no crash, flag-off byte-identical, carrier/rage untouched,
a real wave-4 volley off supplied arrows, the startExpedition
end-to-end wiring, the player skip). The pilot's per-seed corpora
carry the encounter averages (party size, gear, abilities,
ranged-at-entry) beside the verdict in the evidence file.

## §6. Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate —
   bowopen-recheck band: 41 ctl / 25 arm launched expedition
   meetings, 21 / 11 pair-inclusive engaged per 8 seeds. The pool
   floor (≥ 10) is sized to that known density.
2. **Pool sizing:** see (1). The kill-share (≥ 0.25) and
   damage/round (≥ 70) bars are the bowopen-a frozen bars — the
   winning shape needs ~111/round; 70 is the halfway bar the
   opening must clear to be worth a confirm. The mechanism bar
   (≥ 0.70) is set against the 0.33 baseline; the §1 headwind says
   the departure lever alone is unlikely to reach it — recorded
   here so the pilot's miss, if it comes, is a measured
   confirmation, not a surprise re-score.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-ammosupply-a.js`, GREEN before the pilot) proves
   the supply mechanism on a live village (see §5). The analyzer
   `--selftest` covers the judge shapes (GO / NO-GO / thin-pool)
   plus the new mechanism-bar shapes.

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

- Finding #2544: claimed by this arm; on GO the ammunition-supply
  half is confirmed under gate+source+staging ground — departing
  archers are supplied, volleys fire, kill share rises. On NO-GO
  the finding stays open with the failing bar + mechanism diagnosis
  named, and the next arm is named from the diagnosis (the §1
  headwind points at aid/world-tick supply — a home/away question,
  not another departure tweak).
- Write-flap: the pre-write probe (`git update-ref refs/heads/probe
  HEAD`) FAILED twice ~19:00 UTC (could not write
  `refs/heads/probe.lock` in the main repo .git) and passed at
  19:09 UTC — a flap window was in progress at run start and
  cleared before this prereg was written. Plain file writes
  (/tmp, worktree) passed throughout. Probe before every material
  write; if it fails, stop writing and wait for the clear.
