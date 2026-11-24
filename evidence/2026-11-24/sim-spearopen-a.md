# sim-spearopen-a — EVIDENCE (DIAG, Loop A run fleshout-20261124T2115Z)

**Arm:** sim-spearopen-a · **Loop A run:** fleshout-20261124T2115Z
**Verdict: DIAG-GO — the spear opening is answered with a complete
ledger: the volley never fires for a spear, and the ledger proves the
ammo gate is the blocker (23/23 not-fired spear carriers).**
**Prereg:** `evidence/2026-11-24/sim-spearopen-a-prereg.md` (frozen
2026-11-24 ~21:30 UTC, before any judged sim). **Bars in prereg §2
bind; §14 metric binding holds.**
**Analysis:** `evidence/2026-11-24/spearopen-a-analysis.json`
(reproduced §10). **Pilot log:** `evidence/2026-11-24/spearopen-a-pilot.log`.
**Branch:** `sim-spearopen-a` (worktree
`~/workspace/worktrees/sim-spearopen-a`). **Base:** 4c1bb482e.
**Finding #2544 stays OPEN** (fight capability: damage output —
the spear-opening half is now DIAGNOSED, not fixed; no game code
lands on this arm).

## §0. The question, in plain words

Spears are the biggest ranged weapon class at the fight — 15 of 38
ranged-at-entry fighters on the ammosupply arm leg — and they carry
0 ammo, because a spear takes no ammunition at all. This arm asked:
does the spear opening volley ever fire, what does it contribute,
and is the volley path wrongly demanding ammo for a thrown weapon?
The answer, measured live on a fresh band: it never fires. The
volley code demands `weapon.ammo` on the def, and no spear has one
— so the opening is silently skipped, 23 times out of 23, and the
spear's entire entry contribution on the band is two contact-finish
strikes worth 40 damage and one kill.

## §1. Verdict and bars (frozen prereg §2, judged as written)

| Bar | Threshold | Measured | Result |
|---|---|---|---|
| Pool floor (engaged spear carriers) | ≥ 10 | 23 | **PASS** |
| Attribution completeness | ≥ 0.90 | 65/65 = 1.000 | **PASS** |
| Opening — fire rate ≥ 0.50 OR ammo-gate ≥ 0.80 | either branch | 0/23 fired; gate 23/23 = 1.000 | **PASS** (gate branch) |
| Instrument errors | 0 | 0 across 8/8 valid files | **PASS** |

**GO threshold** (all four bars) is met. **Verdict DIAG-GO.** The
question is answered with a complete ledger — not by the volley
firing (it fires 0/23), but by the gate branch: every single
not-fired spear carrier is attributable to the ammo gate, read from
the weapon def, not from the classification. No re-scoring: the
bars judged as written, and the gate branch was frozen in the
prereg before the pilot.

## §2. The ledger — volleys by weapon type (engaged rows only)

Population: ALL wave-4+ `v4encounters` rows, every origin, lead
fighter; 133 encounters, 99 ranged-at-entry, 65 engaged (34 evaded
— the meeting never became a fight, so no opening was possible;
evades are counted separately, never as unattributed).

| Class | Entries | Volleys fired | Volley dmg | Blocked (0 ammo) | No-volley-path | Dry lines | Evaded |
|---|---|---|---|---|---|---|---|
| Spear | 23 | **0** | **0** | 0 | **23** | 0 | 4 |
| Bow | 27 | 11 | 280 (mean 25.5) | 16 | 0 | 16 | 17 |
| Crossbow | 7 | 4 | 129 (mean 32.3) | 3 | 0 | 3 | 5 |
| Sling | 8 | 6 | 114 (mean 19.0) | 2 | 0 | 2 | 8 |
| Searcaster | 0 | 0 | 0 | 0 | 0 | 0 | 1 |

Total volley damage on the band: **523** — bow 280, crossbow 129,
sling 114, **spear 0**. By weapon id: `hunting_spear` 11 entries,
`fire_hardened_spear` 12, both 0 fired / 0 dmg / all no-volley-path.
No `shard_spear`, `starfall_lance`, or `godslayer_spear` carrier
entered a wave-4+ fight on this band.

The contrast is the finding: every blocked bow/crossbow/sling is
narrated honestly — 21 blocked openings, 21 dry lines ("no arrows",
"no crossbow bolts", "no stones", each counted). The spear's 23
skips are SILENT: 0 dry lines, no "sees the monster coming", no
thrown spear — the opening simply isn't there (see §4).

## §3. Gate replication — the gate passes every spear, and the ledger proves it

- `spearSeen` 42, `spearPassed` 42, ratio **1.000** (pooled over
  7 observed seeds; seed 110606 is null — staging never ran there,
  unobserved, never zero). The SPEARGATE gate passes every spear
  departure on to the sources, exactly as designed.
- Per-seed: 110601: 0/0, 110602: 0/0, 110603: 8/8, 110604: 23/23,
  110605: 3/3, 110606: null, 110607: 8/8, 110608: 0/0. The gate
  works where departures happen; three seeds saw no spear departure
  at all.
- `bowOpen` pooled: alreadyHad 180, fromStash 0, fromArmory 0,
  crafted 4, craftedFail 5, noSource 155, spearSeen 42,
  spearPassed 42. `alreadyHadSpear` 0 — expected under SPEARGATE=1:
  a spear never reads as "already has a ranged weapon" anymore; it
  passes on to the sources instead. (The bowopen-recheck §6
  instrument gap is closed: the counters are emitted per seed from
  live state and they replicate 1.0.)
- **Origin split (engaged ranged / spear):** aid 34/15, world-tick
  21/8, expedition 10/0. Spear carriers concentrate in aid fights
  (15 of 23) — villagers answering a call for help with the weapon
  in their hand. **No spear carrier led an expedition wave-4 fight
  on this band** (0/10 expedition leads), although the gate passed
  42 spear departures: the departing spear-holders never became an
  expedition lead at a wave-4 meeting. Reported as measured; the
  corpus does not say whether they fought lower-wave monsters, met
  nothing, or arrived as companions.

## §4. What the spear contributes — the contact finish, twice

The spear's only entry contribution is the contact finish (wave ≥ 3,
beast already below its break line, no volley damage): **2 attempts,
40 damage, 1 kill** across 133 encounters (6 contact finishes total;
the other 4 are other instruments).

- **110603 d97, Aysun vs The Herald (world-tick, vKill, 0 rounds):**
  beast at 1 HP, spear finishes it for 19. Two lines, clean and
  honest — the spear's one kill on the band.
- **110608 d149, James vs The Herald (world-tick, vKill, 2 rounds):**
  spear finishes for 21 (beast at 13 left), committed finish, then
  a melee strike for 22 kills it. Reads sensibly.
- One more spear-carrier finish used a different weapon: 110603 d74,
  Ruth vs The Eulogy — the fighter carried a spear in the ranged
  slot AND a sharpened stick as melee, and the finish struck with
  the stick (kind `melee`, 17 dmg). The spear wasn't even the finish
  instrument there; the classification order (melee first) is honest
  about it.

## §5. Sense-test — three spear transcripts, one bow contrast, read in full

**Ruth vs The Herald, 110603 d68 (12 rounds, vFlee, fire-hardened
spear).** The fight opens with NOTHING — no volley line, no thrown
spear, no "sees the Herald coming". The first line is "Ruth's gear
absorbs 40", then twelve rounds of melee strikes (15–17 a round,
514 total), a shout that brings Owen in, and a flee. It reads as a
coherent melee fight — but a reader who didn't know the loadout
would never guess Ruth carried a ranged weapon at all. The spear's
range-2 reach is invisible; the opening is absent, not wrong.

**James vs The Herald, 110608 d149 (vKill, hunting spear).** The
spear appears exactly once — as a finisher against a broken beast
("James closes in and strikes with the hunting spear for 21").
Field medicine mid-fight, a committed finish, a melee kill. Honest
and sensible: the spear is a finishing weapon here, never an opener.

**Aysun vs The Herald, 110603 d97 (vKill, 0 rounds).** Two lines:
the contact finish kills the 1-HP beast, then a tripwire beat. The
whole "fight" is the spear finishing what something else broke.
Clean.

**Contrast — Jorge vs The Suburb, 110608 d103 (crude_bow, 4/4
volley, 64 dmg, vKill in 14 rounds).** "Jorge sees The Suburb coming
and nocks an arrow — the fight opens at range (4 shots)": 15/16/16/17,
then Rage, a Haymaker for 177, allies charging in by name. The bow
ANNOUNCES itself; the spear never does. Nothing in any transcript
read robotic: shouts bring allies in by name, fleeing is voiced as
a judgment, field medicine happens mid-fight. The blank is material,
not cosmetic: the spear has no opening, and nothing in the fiction
says so.

## §6. Wall numbers (scale-onramp axis)

| Metric | This band (8 seeds) |
|---|---|
| National reached | 0/8 |
| Table (win flag) | 0/8 (not instrumented — null, never faked) |
| Wins | 0/8 |
| Wave 4 unlocked | 8/8 |
| Wave 5 unlocked | 4/8 |
| Median survival | 147d |
| Community loss | 5/8 |
| Scale ranks | regional 8/8 |
| Deaths | 701 (monster 617, villager 80, person 4); starvation 2 |

Per-seed:

| Seed | Days | End | Max wave | Standing | Deaths | Encounters |
|---|---|---|---|---|---|---|
| 110601 | 93 | village-lost | 4 | 150 | 43 | 6 |
| 110602 | 149 | village-lost | 4 | 199 | 89 | 24 |
| 110603 | 134 | village-lost | 5 | 445 | 113 | 36 |
| 110604 | 150 | survived | 5 | 400 | 108 | 26 |
| 110605 | 99 | village-lost | 4 | 100 | 76 | 7 |
| 110606 | 150 | survived | 4 | 150 | 48 | 0 |
| 110607 | 145 | village-lost | 5 | 300 | 101 | 5 |
| 110608 | 150 | survived | 5 | 450 | 123 | 29 |

The scale wall stands: no village past regional on any seed. Four
villages stall at standing 199 or below; the four wave-5 villages
reach standing 300–450 and still win nothing. Seed 110606 met zero
wave-4+ encounters in 150 days and survived — a village the System
never tested. Spear concentration: 19 of the 23 spear meetings are
on seed 110603 alone (one village's spear carriers fighting
repeatedly, mostly in aid).

## §7. Village assessment — what the villages looked like

Eight villages, one band, and they read as the same hard shape the
program keeps measuring: villages that can reach wave 4 and even
wave 5 but cannot kill what they meet there. 20 of the 23 spear
meetings end in flight, 1 in death, 2 in kills (one of them the
1-HP contact finish). The spear carriers are not cowards — Ruth
fights twelve rounds, deals 514 damage, and leaves on her feet —
but they fight every wave-4 monster in melee with a weapon the game
never lets them throw. The aid origin dominates the spear story:
villagers answering a call for help arrive with the spear in hand
and no opening to throw it. The bow carriers beside them open every
fight they have arrows for (11/11 engaged bows with ammo fired) and
stand empty the rest (16 blocked, all narrated). The blank this arm
fills is the diagnosis, not a fix: the spear opening does not exist,
and the code, the ledger, and the transcripts all say the same thing.

## §8. Metric review (§14)

- Bars judged as written; no re-scoring. The gate branch of the
  opening bar was frozen before the pilot (prereg §2) — the verdict
  does not depend on it being the branch the run took, only on the
  ledger proving it. Fire rate 0.000 and gate share 1.000 are both
  far from their bars' edges, not near misses.
- The pool floor (≥ 10) passed at 23, but 19 of the 23 meetings sit
  on one seed (110603). A confirm on a fresh band would test whether
  the spear density is a band property or a single-village property;
  the verdict does not need it — the gate attribution is 23/23
  either way, and the code-level cause is seed-independent.
- Attribution completeness 1.000 (65/65): the evade split earned
  its keep — 34 evaded rows, all attributed as evaded, zero
  unattributed. The ammosupply corpora predicted exactly this shape
  (all 5 null-volley ammo-capable rows there are evades), and the
  pilot confirms it.
- The expedition-origin zero (0 spear leads in 10 expedition
  meetings, §3) is the one number the prereg did not anticipate.
  It does not change the verdict — the question is about the opening
  at entry, and aid/world-tick entries answer it — but a future arm
  that wants the departure story should ask why 42 passed spear
  departures produce zero expedition wave-4 leads.
- Allies at entry (secondary): 262 present, 217 ranged, 13 spear
  (share 0.060) — allies almost never hold a spear in the ranged
  slot, against 0.354 for leads. The corpus does not explain the
  asymmetry (a carrier with both spear and bow seats the bow ranged
  + spear melee; leads are more often spear-only); reported, not
  explained.
- **§15 panel:** not applicable — single-leg diagnostic, no
  before/after pair (prereg §4). No compare file is fabricated.
- **Instrument fix after the prereg commit (before the pilot):**
  the dry-line regex missed crossbow lines ("but no crossbow bolts"
  — the weapon word sits between "no" and the ammo noun). Fixed in
  `scripts/analyze-spearopen-a.js` (regex now allows one optional
  word) + a crossbow dry-line fixture row; selftest 28/28 after the
  fix. The fix changes no frozen bar or taxonomy — it makes the
  dry-line count correct (crossbow 3/3 on the pilot, verified
  against the raw logs). Committed with this evidence; the prereg
  text is untouched.
- **Smoke run (not judged):** seed 999999, same substrate, driver
  exit 0, 150d survived, 12 encounters, 0 errors — validated the
  driver's `allyKit`/`contactFinish` additions end to end before
  the pilot. Its corpus was deleted, not committed. The smoke seed
  launched no expeditions (all 7 plan departs held), so its
  `spearSeen`/`spearPassed` were correctly null (unobserved).

## §9. Canon

`docs/CANON.md` (manifest), `docs/MONSTER-WAVES.md` (wave 4: The
Mirror Draft, standing ≥ 100; damage 35–95, HP 850–1500, pierce
0.2–0.5; wave 5: standing ≥ 200 AND wave-4 faced), and
`docs/BALANCING.md` (ranged opening volleys: shots = min(ammo,
clamp(1 + floor(range / monster speed), 1, 4)), each shot spends 1
real ammo; empty quiver → narrated "no arrows") read before the run.
**No canon doc covers spears as thrown weapons** — said here rather
than inventing one, as the prereg already records. A spear is a
human weapon (CANON.md human-skills lane), never an alien ability.

## §10. Next arm — named from the diagnosis, and the proof

**Next arm (named, not built): a thrown-spear opening is a design
question for Steve, not a silent code tweak.** The ledger proves the
volley path demands ammo a spear can never carry; giving the spear
an opening means deciding what a thrown spear IS — does it spend
the spear (one throw, then melee with fists?), return to the hand,
need a stack of spears, deal range-2 damage at a different rate?
That is a canon decision (no doc covers it — §9), and it changes
feel and combat, so it needs Steve's eyes before any build. Do NOT
land a quiet `weapon.ammo`-less volley branch: the silence of the
skip is itself a fiction question (a fighter who never throws the
spear they carry should say so, or throw it). Finding #2544 stays
**OPEN** with the spear half diagnosed: volley fire rate 0/23,
gate attribution 23/23, spear volley damage 0 of 523, contact
finish the only entry contribution (2 attempts, 40 dmg, 1 kill).

**Proof:**
- `scripts/test-spearopen-a.js`: **27/27 PASS** (live fights: spear
  volley null + silent; bow volley fires + ammo spent; dry bow
  blocked + "no arrows"; gate telemetry seen/passed both branches;
  analyzer classifies the live records).
- `scripts/analyze-spearopen-a.js --selftest`: **28/28 PASS**
  (taxonomy all five classes + evade split + crossbow dry line +
  gate aggregation + contact finish + all judge shapes).
- Analyzer reproduction over the committed corpus: verdict
  DIAG-GO, all 4 bars, and every summary number identical to
  `spearopen-a-analysis.json` — verified twice, once via the stdout
  summary and once by an independent recount from the raw per-seed
  files (encounters 133, engaged 65, evaded 34, spear 23/4, by-class
  fired/dmg/blocked/noPath, seen/passed 42/42, contact-finish spear
  2/40/1, allies 262/217/13 — all match).
- Smoke run (seed 999999, §8): driver exit 0, 0 errors.
- **No `src/` change on this branch.** DIAG arm: instruments +
  evidence only. No push, no version bump, no live verification —
  the coordinator merges to local master via --ff-only; report
  'ready to merge, pending ship'.

## §11. Commits (branch sim-spearopen-a)

- 2cc1b0e78 — frozen prereg + instruments (driver, analyzer,
  proof test). safe-commit clobber struck on the commit (committed
  files shown staged-deleted in the main index); repaired with
  `git ls-tree HEAD -r -- <paths> | git update-index --add
  --index-info`, verified `git status --short` empty +
  `git diff HEAD` empty. Probe passed before the commit.
- (Closeout commit: this evidence file + analysis JSON + pilot
  log/err + per-seed corpora + analyzer dry-line fix.)

**Ready to merge, pending ship.**
