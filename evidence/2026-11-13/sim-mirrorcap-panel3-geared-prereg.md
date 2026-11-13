# sim-mirrorcap-panel3-geared-prereg — mirror-cap panel 3: geared scholar + party

**Arm:** sim-mirrorcap-geared-b (Loop B, axis: winnability chain) ·
**Base:** master tip **4c4df500e** (verified in the main tree before
starting; the worktree was branched from it, no rebase onto a moving
`master`) · **Worktree:**
`~/workspace/worktrees/sim-mirrorcap-geared-b` (branch
sim-mirrorcap-geared-b) · **Cap:** cherry-picked `61af85f26` (branch
sim-mirrorcap-panel-b) onto sim-mirrorcap-geared-b as `96e97ef54`,
clean, no conflicts; the cap is unchanged as pinned
(`REUNION_ARENA_MIRROR_CAP = 1`, arena-only,
`tbPackSpawnCount` choke point) · **Proof:** re-run on the new base
BEFORE this prereg: `scripts/test-mirror-cap-20261107.js` **29/29
green**; `scripts/test-arena-20261107.js` **57/57 green** after the
same one-assertion update panel 2 made (expect 1 arena Reunion
mirror, not 3 — the pre-cap behavior) · **Steve's call (2026-11-07,
lean):** "Probably cap mirror for arenas." · **Steve's call
(2026-11-13 06:20 CST, answering the panel-2 scaling question):**
"Test a geared scholar first." · **Standing rule (Steve
2026-11-13, non-negotiable):** every test must reflect the average
gear a player would actually have when they reach that content — a
geared scholar fighting with a party, never a fresh un-geared
scholar alone.

**Status:** preregistered BEFORE any panel run. The fixture, the
seed band and the GO bar below are frozen; do not change them after
seeing results. (The loadout below was derived from the geared
census and written here BEFORE the panel ran.)

## Why panel 3 (panels 1–2, in brief)

Panel 1 (build-mirror-cap, commit e3f1ed4ce; prereg
`evidence/2026-11-07/sim-mirrorcap-prereg.md`, evidence
`evidence/2026-11-07/sim-mirrorcap.md`): cap 1 in arena fights
only; proof 29/29; matched 16-chain panel (seeds 91002–91017)
**NO-GO on M2 — 0 Reunion-wave wins, n=2 reached** (13/16 chains
died on wave 1). Panel 2 (branch sim-mirrorcap-panel-b, base
4d79e6056; prereg `evidence/2026-11-13/sim-mirrorcap-panel2-prereg.md`,
evidence `evidence/2026-11-13/sim-mirrorcap-panel2.md`): forced
ONLY wave 3 to Reunion, waves 1–2 drawn naturally; matched 16-chain
panel (seeds 91202–91217), 13 valid chains, 7 reached the Reunion
wave; **NO-GO on M2 — armed won 0 Reunion waves (bar ≥ 1)**. M1
PASS (mirror ≤ 1 on 7/7), M3 PASS (proof 29/29; field Reunion
still 3, solo still 1). The deaths were base Reunion lethality, not
mirror count: one Reunion hits 52–60/swing vs 100 HP no gear, the
armed party dealt at most ~4% of one Reunion's HP. BOTH panels
staged a fresh un-geared solo scholar — a contestant no real player
is. Steve chose to measure the real contestant (geared scholar +
party) BEFORE any Reunion scaling decision. This panel is that
measurement; it does not re-litigate M1/M3 and it does not move the
bar or recalibrate the cap number (1 is already the floor).

## The geared fixture (derived from measured play, NOT invented)

**Census:** `scripts/geared-census-20261113.js` — real
competent-policy legs, seeds 53001–53008, 150d, with daily gear
snapshots of the scholar + formal party and Gauntlet-day capture
(`cap.t.tbEnds`, activeContestId 'gauntlet'). Corpus:
`evidence/2026-11-13/perseed-mirrorcap-geared-census/`. The
loadout below is the census median/typical Gauntlet-day loadout
(pre-fight snapshot, the day before the Gauntlet day, so no
mid-arena loot contaminates it). Sources and the per-seed table
are in the evidence file; the loadout derivation is reproduced
there.

**LOADOUT (derived from the census, frozen before the panel runs):**

- Scholar: **machete** (melee, weapon bonus 35) + **wardens_cloak**
  (torso, armor protection 25). Scholar HP 100 (median 100 at
  Gauntlet). Readback target: weaponBonus 35, armorProtection 25.
- Allies (each of 2): **hunting_spear** (ranged, weapon bonus 30 —
  no ammo field, so no quiver staging is needed) + **bark_armor**
  (torso, armor protection 15). Readback target per ally:
  weaponBonus 30, armorProtection 15.
- Party: 3 total (scholar + 2 allies) — the fight-play census:
  84% of fights start with three people; solo wave-3/4 kills 0/11.
- Abilities: NOT staged — the driver plays strike-only exactly as
  panels 1–2 did, so the two arms stay comparable and the panel
  measures the cap + gear, not ability play. The census records
  what abilities a contestant holds (see evidence); if the geared
  party still wins 0, the ability gap is the named next question,
  not a reason to re-run this panel with abilities staged.

**Derivation (sources — all measured, nothing invented):**
Census `scripts/geared-census-20261113.js`, real competent-policy
legs, seeds 53001–53008, 150d, daily gear snapshots; corpus
`evidence/2026-11-13/perseed-mirrorcap-geared-census/` (8 valid
JSONs, 0 instrument errors; 5 seeds village-lost, 2 survived to
150d; Gauntlets are rare — 3 Gauntlet days on 2 seeds, so the
Gauntlet-day sample is thin and the day≥50 corpus is the primary
derivation, cross-checked against the Gauntlet days).
- Scholar, day≥50 (586 scholar-days): median weaponBonus **35**,
  median armorProtection **28**, median HP 100. Top single weapon
  machete (61 days, bonus 35); mode torso wardens_cloak (141 days,
  protection 25); mode two-weapon combo phase_blade+hunting_spear
  (89 days, bonus 90) is the lucky/high loadout, NOT the average —
  staging it would over-gear the fixture. Staged scholar (35/25)
  sits at the day≥50 medians.
- Gauntlet-day pre-fight snapshots (n=3 days): 53001 d71
  crude_bow (18) + hide_armor (30) + between_boots (8), armor 38,
  HP 100; 53005 d116 stone_knife (12) + investigators_coat (12),
  armor 12, HP 100; 53007 d124 hunting_spear (30) + phase_blade
  (60) + wardens_cloak (25), wBonus 90, armor 28, HP 100, party 2
  — and that scholar WON all 3 Gauntlet waves (waves drawn
  naturally, not forced Reunion). Gauntlet-day wBonus median 18,
  mean 40 — the staged 35 sits between the median and the mean, so
  the fixture is at-or-above the Gauntlet-day average on damage and
  at the day≥50 median on protection. Abilities held at Gauntlet:
  forager/crafter kits (green_whisper, beard_moss, green_thumb,
  cornucopia; beast_calm, war_cry, lucky_rock) — no combat
  abilities on 53001/53005; 53007 held translator/rally_aura/
  cornered_rat/night_eyes.
- Allies, day≥50 formal-party members (362 snapshots): median
  weaponBonus **30**, median armorProtection **20**, median HP 95.
  Top weapon pairs: stone_knife+crude_bow (102), crossbow alone
  (102), stone_knife+hunting_spear (94); mode torso bark_armor
  (146). The staged ally (hunting_spear 30 + bark_armor 15) hits
  the median weaponBonus exactly; armor 15 vs median 20 because
  the remaining ~5 comes from minor slots (legs/hands) the driver
  does not stage — documented, not hidden. The Gauntlet-day party
  (53007 d124) carries exactly this shape: Stan stone_knife +
  crude_bow + bark_armor (wBonus 30, armor 20), Elena crossbow +
  hide_armor (wBonus 28, armor 33). The hunting_spear route was
  chosen over stone_knife+crude_bow because a bow needs real ammo
  (fieldFights volley spends 1 ammo/shot from the carrier's own
  items; the census does not record ammo counts, so staging a
  quiver would invent a number) — the spear has no ammo field and
  reaches the same median 30 ammo-free.
- Formal party is empty on 379/586 day≥50 scholar-days (65%) — the
  panel stages its 2 allies as roster villagers placed adjacent
  (the panel-2 pattern), NOT via the formal party system, which
  matches how the fight-play census counts fights starting with
  three people (allies joining from the village).
- What the fixture does NOT stage (documented limits): no shoes
  (none on 79% of day≥50 scholar-days), no head/hands/accessory
  slots, no abilities, no ammo. The scholar's day-70 53001 snapshot
  had between_boots (+8 armor) — the staged armor 25 is 3 below the
  day≥50 median 28 for exactly this reason; the fixture is, if
  anything, a touch UNDER the measured average on protection.

**Fixture (frozen) — panel 2's fixture EXCEPT the geared party:**

- unlockedWave → 4 (gate bypassed in-test only; live pool asserted
  58 incl. Reunion, excl. Herald — the driver FAILS LOUDLY
  otherwise).
- Staged scholar at Haven centre with the census loadout equipped
  via the real equip path (`Game.equip` for the scholar; the person
  record for allies, the same shape `Game.equip` writes); the
  driver read-backs weaponBonus/armorProtection per person and
  FAILS LOUDLY if any equip refuses or does not stick. No HP is
  nerfed anywhere.
- PartyN 3 (scholar + 2 allies, roster trimmed to those 2). The
  driver FAILS LOUDLY if partyN ≠ 3 at the wave-1 start.
- Gauntlet spec `{waves: 3}`; fights played to win with the arena-b
  driver (strike the first live monster each player turn,
  `tbAdvance` otherwise); no HP nerfed anywhere.
- **Force ONLY wave 3 to Reunion, waves 1–2 drawn naturally** (the
  panel-2 fix, unchanged): the driver replicates `_contestArena`
  exactly (contests.js): pool = `monsterWavePool()`, wave =
  `unlockedWave()` = 4, hot = 0 for wave 1 and 1 for wave 2, one
  `Math.random` pick per wave. Both arms draw the same waves 1–2
  on identical seeds. A wave-1/2 draw that happens to BE a Reunion
  is kept — drawn naturally, NOT redrawn — and recorded in the
  chain's `waves` list; the M2 sample is the wave-3 Reunion.
- **Fixture-failure allowance (panel-2 lesson, pre-registered):**
  a staged ally can flee the arena at the sight of the wave-1
  beast before the first player turn (panel 2 lost 3/16 chains
  this way). Such a chain is recorded as a fixture failure, NOT
  replaced — the band is frozen, replacing failed seeds post-hoc
  would be cherry-picking. The panel is judged on the valid
  chains, with the shortfall stated, not hidden.

## Panel design (frozen)

- **Matched seeds:** 16 chains, one process per seed per arm,
  seeds **92302–92317**. Same seed + same fixture + same drawn
  waves on both arms; the ONLY difference is the cap. Armed =
  sim-mirrorcap-geared-b (`capConstant: 1`). Baseline = pristine
  master at 4c4df500e (`capConstant: null` — the arm fingerprint),
  run read-only from the main tree with outputs redirected into
  this tree (no second baseline worktree: registration took ~30
  min under REGISTRY.lock contention and the cap was 15/16; the
  main-tree run writes nothing to the main tree — verified by
  `git status` before and after — and reads the same tip the
  armed tree was branched from).
- **Per chain recorded:** waves, partyN at each wave's spawn,
  Reunion count at spawn, per-wave outcome (won/chained/died/
  routed), scholar HP frac after each wave, deaths, instrument
  errors, the staged loadout + gear readback, plus a sense-testing
  transcript (`logTail`: last 40 narration lines).
- **Corpus:** `evidence/2026-11-13/perseed-mirrorcap-panel3-geared/`
  (one JSON row per seed per arm; driver refuses to overwrite).
- **Driver:** `scripts/mirrorcap-panel3-geared-20261113.js` (panel
  2's driver with the fixture changed to the geared party — panel
  2's driver is NOT edited, so panel 2 stays reproducible).
  Usage: `SEED=… ARM=baseline|armed REPO=… OUT=… node
  scripts/mirrorcap-panel3-geared-20261113.js`.
- **Analyzer:** `scripts/analyze-mirrorcap-panel3-geared-20261113.js`
  (read-only; M1/M2/M3 table + damage dealt + paired comparison).
- **Proof test:** `scripts/test-mirror-cap-20261107.js` (29/29 on
  the new base before the panel; covers M3).

## GO bar (frozen — mirrors panels 1–2)

On the matched 16-chain panel, armed vs baseline on identical seeds:

- **M1 — the cap fires:** arena Reunion mirror count ≤ 1 on EVERY
  chain reaching the Reunion wave, armed arm.
- **M2 — the draw stops being auto-fatal for a real contestant:**
  armed arm wins ≥ 1 Reunion wave across the 16 chains (panel 2
  armed won 0/7 reached with a fresh scholar). Also reported:
  full-chain wins per arm, damage dealt to the Reunion wave, rounds
  lasted.
- **M3 — no regression, non-arena control:** a field (non-arena)
  Reunion fight with partyN 4 still spawns 3 mirrors, solo still 1
  (proof test, not panel).

**GO** iff M1 and M2 and M3 all pass. **NO-GO** if any chain spawns
> 1 arena mirror, or the armed arm wins 0 Reunion waves, or the
non-arena mirror stops firing. If the armed arm wins 0 Reunion
waves the verdict is NO-GO as preregged — the report will say
whether the deaths look like mirror-count or like base Reunion
lethality at the geared loadout, but the bar does not move. The
scaling decision waits on this panel's result + Steve; the cap is
NOT landed and NOT killed on this panel alone.

## Seed-band freshness check (recorded)

Candidate band **92302–92317**. The first attempt's band
**92102–92117 is CONTAMINATED and was abandoned before any panel
run**: 92104 appears in journey-deepening-r104-prereg (Nov 5) and
sim-doomrevive-b2 (Oct 19); 92108 appears in
journey-deepening-r124/r125 preregs (Nov 9–10); 92100/92101 appear
in r104/r124/r125 preregs. (The first worker's "freshness-verified"
claim was wrong — record it here so the next worker does not
repeat band 92102–92117.)

Fresh check for 92302–92317 (this worker, before the panel):
searched `evidence/*/sim-*-prereg.md` + `evidence/*/journey-*-prereg.md`
(all dates, word-boundary exact seeds) — **clean, 0 hits**; searched
ALL dated `evidence/**/*.md` for the exact five-digit seeds —
**0 hits**; checked the forbidden/contaminated band lists named in
recent preregs (collapseband3-b: 99201–99208, 99009–99024,
99001–99008, 99041–99052; tendexact-confirm: no standalone list
exists) — **no collision**. The only 923xx mention anywhere is the
r105 prereg's loose "922xx/923xx scan" note, whose single 923xx hit
is a commit-hash fragment (4923106a1), not a seed reservation.
Nearby bands checked and avoided: 92202–92217 (r105/r107 preregs),
92402–92417 (r106), 93102–93117 (journey-scale-r104, r89/r90),
94102–94117 (medchannel-seed-a, r103/r104), 95102–95117 (r110/r124/
r125), 96102–96117 (vfrac, hurttraveler, medheadcount-confirm),
97102–97117 (hurthome-fix, heraldcontact, mirrorcap panel 1's
prereg names 97101–97109). 92302–92317 is the panel band.

## Wall context (what this panel does and does not measure)

This Gauntlet fixture does not reach national/table/wins — it is a
3-wave arena chain for one scholar + party, not a village sim. The
evidence reports the fixture's own numbers (Reunion-wave wins,
chain wins, deaths, damage dealt) and does NOT present fixture
numbers as scale-wall numbers.

## CORRECTION — base moved before any panel chain ran (recorded, not a quiet edit)

After this prereg was committed (888329ccc, base 4c4df500e) and
BEFORE any panel chain ran on the frozen band 92302–92317, master
moved to **42024a8de** (10 commits: sim-combatdedup-b landed,
changing `src/js/game.js` by 63 lines — combat-line dedup — plus
sim-inffight-a evidence/tooling). A baseline run from the moved
master would no longer be a matched comparison against an armed
tree branched at 4c4df500e, so the armed branch was rebased onto
42024a8de (clean, 4/4, no conflicts; new tips: cap 417f5ef5a,
arena fix 9c1c0709e, census 2fce47b47, prereg 48234add2). BOTH arms
now run on base 42024a8de: armed = this branch, baseline =
pristine master at 42024a8de (read-only run from the main tree,
outputs redirected here). Re-verified on the new base before the
panel: cap proof 29/29, arena test 57/57, smoke chain 92301
reproduces the pre-rebase smoke exactly (died, Reunion 1 mirror,
entry HP 0.9, end −0.07, 7 rounds). The census corpus was run on
the old base (4c4df500e + cap); the combatdedup change is narration
dedup and does not move gear distributions, so the loadout
derivation stands unchanged. Fixture, seed band and GO bar are
unchanged by this correction.
