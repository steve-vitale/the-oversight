# sim-speardmg-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-speardmg-a · **Loop A run:** fleshout-20261127T2033Z
**Type:** DIAG (instruments + evidence only — no game-code fix lands)
**Frozen:** 2026-11-27 ~15:00 UTC, before any judged sim.
**Branch:** `sim-speardmg-a` (worktree
`~/workspace/worktrees/sim-speardmg-a`).
**Builds on:** `evidence/2026-11-24/sim-spearlead-a.md` (§§0, 5, 8) +
prereg. Finding #2544 (fight capability: damage output — the
spear-fight half). The spearlead arm answered the lead question
(5 spear departures led wave-4 expedition fights, 3 real fights,
0 kills, all fled); this arm answers the damage question. The
thrown-spear opening itself is Steve's design call; this arm is
diagnosis only and builds NO volley branch and NO thrown-weapon
lever.

## §0. The question, in plain words

Spear carriers DO lead wave-4 fights — and lose them all. What
damage does the spear actually contribute inside those fights?
How hard does a spear strike hit, compared with a bow, an axe, a
sword in the same fights? How much of a party's damage is the
spear, and can it ever move the kill line against an 850–1500 HP
wave-4 monster?

## §1. Design from code (frozen, not a sim)

Read before designing: `docs/CANON.md`, `docs/MONSTER-WAVES.md`,
`docs/BALANCING.md`. **No canon doc covers spears as thrown
weapons** — said here rather than inventing one, as spearlead-a
already records. **No canon doc covers spear melee damage
either** — the rule lives in code comments, not canon: the
2026-10-09 RANGED COUNTS rule in `fieldFight`
(`src/js/fieldFights.js:623-644`), kept through the 2026-10-13
volley rework: off-screen fights have no grid, so a spear is a
spear — melee + ranged bonuses fold in halved
(`wb = round((meleeBonus + rangedBonus) / 2)`), and every strike
rolls the tactical formula `lroll([4+wb, 8+wb])`. A spear is a
human weapon (CANON.md human-skills lane), never an alien ability.

**What already exists (the ground this diagnostic stands on):**

- Live spear defs (`src/data/items.json`): hunting_spear bonus
  30 (melee, range 2), fire_hardened_spear 15, shard_spear 25,
  godslayer_spear 85. Comparison weapons: machete 35 (melee,
  range 1), bow 22 / crude_bow 18 (arrow), crossbow 28 (bolt),
  sling 8 (stone), searcaster 120 (fusion_cell), apex_bow 95.
- The lead strike (`fieldFights.js:2651`): `vd =
  lroll([4+wb, 8+wb])`, then Rage / audit / blooded / pinned
  multipliers, then `lead.hp -= vd; rec.mDealt += vd`. Allies
  strike on the same formula with their OWN wb (allyWb /
  ally2Wb / ally3Wb, lines 2664/2709/2732) — "helpers, not
  heroes" is gone; the party is real.
- The record carries per-fighter dealt tallies: `rec.mDealt`
  (total), `rec.allyDealt` (all allies), `rec.ally2Dealt`,
  `rec.ally3Dealt`. So leadDealt = mDealt − allyDealt; ally1 =
  allyDealt − ally2Dealt − ally3Dealt. The volley is lead-only
  (`rec.volley = { shots, hits, dmg }`); the contact finish is
  lead-only (`rec.contactFinishDmg`,
  `rec.contactFinishInstrument` ∈ melee / spear / ranged,
  `rec.contactFinishWeapon` — the spear counts as a finish
  instrument when it sits in the ranged slot, kind `'spear'`,
  `fieldFights.js:1227-1229`); the ambush opening is lead-only
  (one `[4+wb, 8+wb]` roll, line 949). Ability damage
  (`gpOut.dealt`, line 2196) is the one non-strike lead source
  that is NOT always logged as a damage line — the analyzer
  carries it as an open residual, never a silent zero (see §2).
- The fight log narrates every strike as `R{n}: {Name} strikes
  for {dmg} ...` (lead + allies), the Live Broadcast echo as
  `R{n}: {Name} strikes again, louder — {dmg} ...`, the
  extra-ally ability strike as `R{n}: {Name} strikes again for
  {dmg} ...`, the ambush as `{Name} was already waiting —
  ambush! Opening strike for {dmg}.`, the contact finish as
  `{Name} closes in and strikes with the {weapon} for {dmg}`,
  and volley hits as `loosed — ... takes {monster} for {dmg}`
  (bow / bolt / stone variants; searcaster `fires — it takes
  ... for {dmg}`). Names are the engine's own `refName`
  (firstRef for villagers, first word of displayName for the
  player) — the driver records entry names with the same rule,
  so log parsing is exact by construction. Two fighters sharing
  a first name in one fight is flagged `nameCollision` and its
  strike rows are counted unattributed, never guessed.
- **Weapon attribution rule (frozen):** the engine folds weapons
  — a strike has no single weapon, it has a wb. A fighter's
  strike damage is attributed across their weapons by bonus
  share of wb: spearShare = (spearBonus/2)/wb when the ranged
  weapon is a spear (live def: melee type, range > 1, no ammo);
  meleeShare = (meleeBonus/2)/wb; bowShare =
  (rangedBonus/2)/wb for ammo weapons. When wb = 0 the strikes
  are unarmed ([4,8]) and attributed to none. The analyzer ALSO
  reports the clean sub-population with no attribution at all:
  fighters whose ONLY weapon is a spear (spear-only per-strike
  mean) vs melee-only vs bow-only fighters — the direct
  "damage per spear strike vs other weapons" comparison.
- **The kill line (frozen reference numbers, leadworst-a
  `evidence/2026-11-24/sim-leadworst-a.md`):** a wave-4 fight
  needs ~111 damage/round to kill inside the morale window; the
  best-armed lead in EVERY meeting reaches only ~70.5 dpr, and
  the measured median was 53.8 dpr. Wave-4 HP 850–1500
  (MONSTER-WAVES.md). The diagnostic verdict is the spear's
  attributed dpr against that ~111 line and the monster HP —
  reported, not a GO bar (see §2).

**Desk diagnosis from the spearlead corpus (frozen numbers,
recomputed from `evidence/2026-11-24/perseed-spearlead-a-arm/`):
** 3 real spear-led wave-4 fights (Nina vs Reunion, 3 rounds;
Catalina vs Audit, 5 rounds; Rebecca vs Algorithm, 2 rounds),
~35–65 damage a round from the whole party against 1000–1330
HP monsters, all fled at single-digit HP. Spear strikes visible
in the transcripts: 50, 46 (Nina, Rage x2.0); 55, 63, 33, 14
(Catalina, Rage x2.5, audited half from round 4); 34 (Rebecca,
Rage x2.0). The spear is visibly the party's biggest hit in
those fights — but the biggest hit of a losing party is still a
losing party. **Pre-registered expectation:** the spear's
attributed share of party damage will be large (spear carriers
are the best-armed fighters in these parties) while its
attributed dpr stays far below the ~111/round kill line — the
spear is not a joke weapon, it is an insufficient one. A
spear-attributed dpr ≥ 111, or any spear-led vKill, would
overturn the expectation and is the falsifier.

## §2. Primary metric (BINDING, §14)

Single leg (DIAG — no ctl/arm pair; there is no lever to
compare). Population: ALL expedition-origin wave-4+ fieldFights
with rounds > 0 on this band. Each fight row carries: entry kit
per fighter (vid, name, melee id + bonus + class, ranged id +
bonus + class, wb replicated from the live defs, armor), the
record's per-fighter dealt tallies, volley, contact finish,
ambush damage, the full fight log, and `mHpStart` (recovered by
the spearlead `recoverMHpStart` rule: mHpLeft + mDealt for
fought non-kills; null for vKill / no-contact).

- **Pool floor:** expedition-origin wave-4+ fights with rounds
  > 0 ≥ 8. (Spearlead band: 37 expedition-origin wave-4+
  encounters, 6 lead meetings, 3 real fights + 4 companion
  meetings — the floor is sized to that known density.)
- **Spear-fight floor:** fights with ≥ 1 spear-carrying fighter
  (rounds > 0) ≥ 5.
- **Primary metric:** the spear's damage share — spear-attributed
  damage / total party damage across the population, with the
  per-strike means by fighter weapon-mix class (spear-only,
  spear+melee, bow-only, crossbow, other-melee-only, unarmed)
  and the spear-attributed dpr per spear fight vs the ~111/round
  kill line.
- **Strike-parse coverage (binding):** fights where every strike
  line in the log parses to a known fighter / total fights with
  rounds > 0 ≥ 0.95.
- **Reconciliation (binding):** pooled |parsed damage + volley
  + contactFinish + ambush − mDealt| / pooled mDealt ≤ 0.05.
  The residual is ability damage the log does not itemize
  (gpOut.dealt); it is reported per fight as `unparsedDmg`,
  never folded into any weapon's share.
- **GO threshold:** pool floor met AND spear-fight floor met AND
  coverage ≥ 0.95 AND reconciliation ≤ 0.05 AND instrument
  errors 0.
- **Instrument errors:** 0 on all per-seed files.

**Verdict:** DIAG-GO when all five bars pass (the question is
answered: the spear's damage share is quantified, the per-strike
comparison is measured, and the kill-line verdict is stated).
DIAG-NO-GO kind THIN-POOL when a pool floor misses; DIAG-NO-GO
kind ATTRIBUTION when coverage or reconciliation misses;
DIAG-NO-GO kind INSTRUMENT when errors > 0. A miss is NO-GO,
never re-scored against a friendlier metric mid-run. The
kill-line verdict (spear dpr vs ~111, any spear-led vKill) is
the FINDING, reported under the verdict — it does not flip GO
to NO-GO either way, because the diagnostic's job is to measure
it, not to pass it.

**Staging sniff test (pilot gate):** the analyzer must show the
fight population is real on this band (wave-4+ expedition fights
> 0 with at least one spear fighter, and the ledger count
reconciles with the game-maintained `spearSeen` counter per seed
via the kept spearlead ledger — a mismatch is reported as a
diagnostic, not silently pooled) before the verdict is read. If
the band carries no spear fight at all, the verdict is DIAG-NO-GO
THIN-POOL with the empty pool as the finding.

## §3. Secondary metrics (supporting, not binding)

- Damage per strike by fighter weapon-mix class (mean, median,
  n strikes); spear-only vs melee-only vs bow-only, same fights
  and pooled.
- Spear-led vs companion-led fights: fight count, mean party
  dpr, mean rounds, outcomes (vKill / vFlee / vDie / mFlee /
  evade) split by whether the LEAD carries the spear vs a
  companion does.
- Spear carriers' kill contribution: in vKill fights, the spear
  fighters' attributed share of mDealt; spear-led vKills (count
  — expect 0).
- Contact-finish spear attempts / kills; volley check (spear
  leads: rec.volley null — the spearopen silence, re-verified).
- Spear strikes per fight (mean, by spear tier:
  hunting/fire-hardened/shard/godslayer).
- Wall numbers: national / table / wins, wave-4 and wave-5
  unlocks, median survival, death-cause shares. Table not
  instrumented by this driver — reported as null, never faked.
- Sense-testing: 2–3 full transcripts of spear fights (a spear
  lead and a spear companion if both exist), read in full — does
  the fight read sensibly (a spear carrier fighting with the
  spear as a melee weapon, allies answering shouts, a flee at
  low HP)? SENSE-TESTING LAW: judge meaning, not counts.

## §4. Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as spearlead / spearopen
  bands, for comparability). Dead villages stop simulating (+10d
  tail max).
- **Seeds (fresh 8-seed pilot band): 111801, 111802, 111803,
  111804, 111805, 111806, 111807, 111808.** Freshness check
  (skill local_seed_band_freshness, run 2026-11-27 before this
  freeze): word-boundary ripgrep over all 1184
  `evidence/*/sim-*-prereg.md` files names 111801–111808 in NO
  prereg, and names the fallback 112001–112008 in NO prereg.
  No dedicated forbidden/contaminated band list exists in the
  goal hidden_files (checked; November preregs record the same
  "no such list" state). Neighbouring used bands avoided:
  110501–110508 (aidammo), 110601–110608 (spearopen),
  110711–110718 (spearlead), 110801–110808 (craftgate),
  109501–109508 (basedmg-b).
- **Policies:** competent verbatim. **Substrate (single leg):**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `SENSEEXPED=1`, `SPEARGATE=1`, `BOWOPEN=1` — the spearlead
  pilot's substrate, so numbers compare. No BOWOPEN-off leg: the
  question is about fights under the fixed gate ground, not
  about the gate itself.
- **Instrument:** `scripts/speardmg-driver-a.js` (clone of
  `scripts/spearlead-driver-a.js` + the damage addition below;
  RUN=speardmg-a, OUTDIR
  `evidence/2026-11-27/perseed-speardmg-a-arm`). Analyzer
  `scripts/analyze-speardmg-a.js` (new; reuses the spearopen
  analyzer's `weaponClass` / `ammoCapable` / `loadDefs` via
  require — one definition of the weapon taxonomy; `parseStrikes`
  + `spearDmgStats` + `judgeSpearDmg` + `--selftest` green
  before the pilot). Per-seed JSONs under
  `evidence/2026-11-27/perseed-speardmg-a-arm/`.
  - Damage addition (this driver only): `w4dmgFights` — every
    expedition-origin wave-4+ fieldFight gets a rich row: day,
    vid, mid, wave, outcome, rounds, mHpStart (recovered),
    entry kit per fighter (lead + up to 3 allies: vid, name by
    the engine's refName rule, melee id/bonus/class, ranged
    id/bonus/class, wb replicated from live defs, armor),
    per-fighter dealt tallies (leadDealt, allyDealt,
    ally2Dealt, ally3Dealt), volley, contactFinish
    (attempted/kill/instrument/weapon/dmg), ambush damage, the
    full fight log, roundsDetail, nameCollision flag. Pure
    reads + driver-local writes; the original runs exactly
    once, untouched. The spearlead recorders (spearDeparts,
    allStarts, expFights, spearTrack, v4departs,
    dawnbidDeparts) are kept verbatim — the fight rows join
    to the departure ledger, and the wall numbers come from
    the same substrate.
  - Strike parsing lives in the ANALYZER (`parseStrikes`, pure,
    exported for the proof test): strike / echo / extra /
    ambush / contact-finish / volley-hit line patterns from §1,
    attributed to fighters by the entry names; unparsed damage
    lines are counted as `unparsedDmg`, never guessed.
- **§15 panel:** NOT APPLICABLE — single-leg diagnostic, no
  before/after pair to compare. The balanced panel compares two
  legs; there is no second leg here. Said here rather than
  fabricating a compare. The frozen bars (§2) are the judge.
- **PILOT ONLY.** Confirm 12–16 seeds ONLY if the pilot earns
  one; a DIAG arm earns a confirm only if the pool is thin but
  the ledger is decisive — the coordinator decides from the
  pilot verdict.

## §5. Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on what a departing villager carries into a
fight, so the fixture is the fight itself, staged by the
competent policy: a geared scholar fighting with a party, never
a fresh un-geared solo scholar. The proof test
(`scripts/test-speardmg-a.js`, GREEN before the pilot) runs live
on a loaded village — a staged wave-4 expedition fight with a
spear lead records a rich row (entry kits with wb, per-fighter
tallies, volley null for the spear, contact-finish instrument
`spear` where it fires), the analyzer parses the fixture log's
strike lines to the right fighters with zero residual on the
tally check, and a bow-lead fixture fight parses its volley
hits to the lead — plus the spearlead proof chain it extends
(spear volley null + silent; bow volley fires + ammo spent; dry
bow blocked + "no arrows"). The pilot's per-seed corpora carry
the encounter averages beside the verdict in the evidence file.

## §6. Pre-pilot substrate checklist (§14b)

1. **Contact:** wave-4 meetings occur on the substrate —
   spearlead band: 146 wave-4+ encounters per 8 seeds, 37 of
   them expedition-origin; 63 spear departures. The pool floor
   (≥ 8 fought expedition wave-4 fights) is sized to that known
   density.
2. **Pool sizing:** see (1). The coverage bar (≥ 0.95) is set
   against the spearlead transcripts, where every strike line
   carries the engine's `refName` and the parser patterns are
   read off the live code (§1); a new log-line shape live is a
   coverage miss and the finding. The reconciliation bar (≤
   0.05) is set against the known non-strike sources (volley,
   contact finish, ambush — all recorded on the row) with only
   godpath ability damage as the open residual.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-speardmg-a.js`, GREEN before the pilot) proves
   the measurement chain on live fights (see §5). The analyzer
   `--selftest` covers the strike parser (all six line kinds +
   name-collision + unparsed residual), the wb-share
   attribution (spear-only = 1.0, spear+melee split, bow split,
   unarmed = none), the per-fighter tally split, and the judge
   shapes (DIAG-GO, THIN-POOL, ATTRIBUTION, INSTRUMENT).

## §7. Canon

`docs/CANON.md` (manifest), `docs/MONSTER-WAVES.md` (wave 4: The
Mirror Draft, standing ≥ 100; damage 35–95, HP 850–1500, pierce
0.2–0.5; wave 5: standing ≥ 200 AND wave-4 faced), and
`docs/BALANCING.md` (ranged opening volleys: shots = min(ammo,
clamp(1 + floor(range / monster speed), 1, 4)), each shot spends
1 real ammo; empty quiver → narrated "no arrows") read before
the run. **No canon doc covers spears as thrown weapons** — said
here rather than inventing canon, as the prereg already records.
**No canon doc covers spear melee damage** — the fold-in rule
lives in `fieldFights.js` comments (§1), not canon; the
attribution rule in §1 is this arm's measurement convention,
frozen here, not a canon claim. A spear is a human weapon
(CANON.md human-skills lane), never an alien ability.

## §8. Metric review (to be written after the pilot — frozen bars judge as written)

- Finding #2544: claimed by this arm for its spear-fight half;
  on DIAG-GO the spear-fight question is answered with a
  quantified damage share + the kill-line verdict, and the next
  arm is named from that proof (a thrown-weapon opening remains
  a design question for Steve, not a silent code tweak). On
  DIAG-NO-GO the finding stays open with the failing bar +
  mechanism diagnosis named.
- Write-flap: probe `git update-ref refs/heads/probe HEAD` before
  every material write; if it fails, stop writing and wait for
  the clear.
