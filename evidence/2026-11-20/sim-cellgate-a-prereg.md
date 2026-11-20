# sim-cellgate-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-cellgate-a · **Loop A run:** fleshout-20261120T1015Z
**Type:** BUILD + measure — the CELL SUPPLY PER GUN lever for finding #2599
**Frozen:** 2026-11-20 ~11:15 UTC, before any judged sim.
**Branch:** `sim-cellgate-a` (worktree
`~/workspace/worktrees/sim-cellgate-a`). **Base:** master
ec0a42913 (verified with `git rev-parse HEAD` before any work).
**Builds on:** `evidence/2026-11-20/sim-gunrate-a.md` (NO-GO kind
PARTICIPATION) and `evidence/2026-11-20/sim-gunrate-a-prereg.md`,
plus `evidence/2026-11-19/sim-searsupply-a.md` (NO-GO kind SUPPLY).

## The question (finding #2599's named next lever)

The gunrate verdict, verbatim: "the lever fixed the gun rate and
the gun still never fired in a wave-4+ fight. Searcaster grants
rose 1 → 6 (all contest-prize; ... 6/31 = 19.4% ... the frozen
prediction was 4/18 ≈ 22%, ~7 grants). Five villagers held the gun
for 177 holder-days (ctl: 1 holder, 23 days). But **zero
armed-holder entries**: no holder ever carried cells INTO a
wave-4+ fight, so no armed volley could fire." Its named next
lever: "CELL SUPPLY PER GUN — a bigger bundle, a cell resupply
route, or a volley that reserves cells for the hard fights."

The cell-burn mechanism, PROVEN holder by holder (gunrate §6):
the bundle's 2 cells are exactly ONE opening volley, and the
volley is wave-agnostic — `fieldFights.js` ~975–1060 fires the
opening volley in ANY `fieldFight` where the lead has an equipped
ranged weapon with ammo. A searcaster (range 8) fires 2 shots
against any ordinary-speed monster. The first fight a holder
LEADS eats both cells, and the first fight a holder leads is
almost always a low-wave fight. 4/4 cell-loss days coincide with
a led kill (wave-1 mirrormoth, wave-2 union rep, wave-3 spool).
Lautaro led five wave-4/5 fights with the empty gun ("the string
stays drawn, useless"). Raising the gun rate further would only
hand out more empty guns.

## The design (frozen; my call, Steve can overrule)

**CELLGATE=1** (default OFF; the turn-on decision is the
coordinator's, not this arm's). **One shape only: the WAVE-GATED
volley.** A bigger bundle is the named alternative and is NOT
built here — the gate is the targeted mechanism (it attacks the
proven burn directly: cells die in low-wave fights, so stop the
gun firing there), and building both shapes in one arm would make
a GO uninterpretable. If the gate fails, the bundle is the next
arm's shape.

The gate, in `src/js/fieldFights.js` `fieldFight`'s volley block
(~975–1060): when CELLGATE=1 and the lead's equipped ranged
weapon is a **searcaster** and the monster's wave is **< 4**, the
volley is HELD — zero shots, zero cells spent, `rec.volley =
{shots: 0, hits: 0, dmg: 0, ammoLeft: <unchanged>}`, and an honest
log line naming the hold ("holds the Searcaster — saves the cells
for a worthier beast"). Wave 4+ searcaster volleys fire exactly
as before. Every other weapon (bow, spear, crossbow, sling) is
untouched at every wave — the gate keys on the searcaster alone,
never on ammo id, so no other weapon's volley can be caught by
it. `_cfAmmoBefore` is set before the gate, so the contact-finish
universe still sees the held ammo at contact.

**Control substrate (rebuilt, not re-argued):** the gun rate on
master is reverted (0 GUNRATE refs in `src/`), so this arm
rebuilds the gunrate mechanism as its control substrate:
searcaster-weighted tier-4 contest prize (4/18) + expedition-holder
redirect + 2-cell bundle, env-gated **GUNRATE=1**. The rebuild is
recovered from the gunrate prereg + proof test
(`scripts/test-gunrate-a.js`, 39 assertions) and the searsupply
lever commit (`6c4b75925`, whose `_searSupplyFighter` /
bundle / cell-weight code is the direct template). The control
leg runs GUNRATE=1 only; the arm leg runs GUNRATE=1 + CELLGATE=1.
The two legs differ ONLY by CELLGATE. The rebuild's fidelity is
proven two ways before the pilot: (a) `scripts/test-gunrate-a.js`
passes 39/39 again against the rebuilt substrate; (b) the control
leg's corpus for seed 107053 must be byte-identical to the
gunrate-a arm corpus for seed 107053 (the gunrate legs were
byte-identical on that seed, so a faithful rebuild + a no-op gate
reproduces it exactly).

**NOT built here:** a bigger bundle; a cell resupply route
(ruin salvage — villagers almost never search ruins,
unmeasurable on an 8-seed pilot; searsupply prereg); any village
craft for cells, ever — cells are alien tech, the source stays
alien-side.

## Draw-neutrality (stated honestly, not waved through)

- The SUBSTRATE (gun weight / redirect / bundle) adds ZERO
  `Math.random()` draws on either leg — the gunrate proof test's
  draw-count assertions (2 draws `rollAlienLoot`, 3 draws
  `_cxItemPrize`, identical on both legs) are re-run against the
  rebuild and must still pass. The gate adds zero draws to the
  prize path.
- The GATE itself is NOT draw-neutral in the strict sense, and
  this prereg says so rather than hiding it: a held volley skips
  the volley's own RR()/lroll draws (hit rolls, damage rolls),
  so the arm leg's seeded stream diverges from control exactly
  where the lever acts — the first held volley. That is the
  lever's mechanism (holding fire IS skipping those shots), not
  a silent shift: when CELLGATE is unset the gate is a no-op and
  the control leg must reproduce gunrate-arm behavior (the
  107053 byte-identity check above). The guardrail stays
  exposure-normalized, so any downstream divergence is judged
  on deaths per engaged meeting, not on raw counts.
- The proof test asserts the control-leg identity directly:
  CELLGATE unset, a low-wave searcaster volley fires with the
  same shots/cell spend as gunrate proved, and a wave-4+
  volley fires identically on both legs.

## Primary metric (BINDING, §14)

**GO iff ALL FOUR hold on the band (8 seeds, two legs, identical
seeds, panel §15):**

1. **Searcaster-holder-days floor:** villager searcaster-holder-days
   (arm) ≥ 40. (Gunrate arm: 177. The substrate rebuild must
   reproduce the gun rate; a miss here is a SUPPLY finding about
   the rebuild, not the gate.)
2. **Armed-holder entries floor:** wave-4+ fight entries with a
   searcaster holder carrying ≥ 1 cell (any participant, arm) ≥ 3.
   (Gunrate arm: 0. The gate's whole job is to move this number:
   cells must survive to the wave-4+ fights.)
3. **Armed volley FIRED ≥ 1:** a volley FROM a searcaster in a
   wave-4+ fight (lead `rangedId === 'searcaster'` AND
   `volley.shots > 0`, arm). This is the proof bar #2599 names.
4. **No-regression guardrail, EXPOSURE-NORMALIZED** (inherited
   from gunrate/searsupply — the raw deaths/run bar is retired
   for this arm because it punishes exposure, not game effects):
   deaths per engaged wave-4+ meeting (arm) ≤ 1.10 × control;
   AND median survival (arm) ≥ 0.80 × control. Deaths per
   engaged meeting is the binding guardrail number.

**Verdict ladder (frozen):**
- **GO** = all four bars hold → the lever lands (substrate +
  gate, one commit, `[needs-eyes]` — the prize redirect is a
  feel change and the hold-fire narration changes combat feel).
- **NO-GO** = any bar misses → the game code is REVERTED before
  commit (substrate AND gate leave no trace); instrument +
  evidence commit only. The kind is recorded (supply miss vs
  participation miss vs guardrail miss) and the coordinator
  decides the next lever.
- A NO-GO on bar 1 is a SUPPLY finding (the rebuild did not
  reproduce the gun rate — investigate the pool, do not just
  raise the weight blind). A NO-GO on bars 2–3 with bar 1
  passing is a PARTICIPATION finding (holders arrive armed but
  the volley still never fires — the next lever is lead-side or
  the bundle, not the gate). A NO-GO on bar 4 alone is a
  GUARDRAIL finding.

## Secondary metrics (supporting, never re-scored)

- (a) Gate-held count (arm): low-wave fights where a searcaster
  holder led and the gate held fire (shots 0, cells > 0 kept);
  vs low-wave searcaster burns (ctl): low-wave fights where a
  searcaster volley fired. The gate must show holds on the arm
  leg AND burns on the control leg, or the mechanism never
  engaged and bars 2–3 fail honestly as a no-contact finding.
- (b) Cells preserved into wave-4+ entries; armed leads (armed
  holder IS the lead); armed volleys with damage; "no fusion
  cells" log lines; searcaster departures with/without cells.
- (c) Wall numbers every run: national / table / wins, wave-4
  and wave-5 unlocks, median survival, per seed. Table: not
  instrumented by this driver — reported as null, never faked.
- (d) Sense-test notes from transcripts (SENSE-TESTING LAW —
  read the fight logs; does the hold-fire line read as a
  fighter saving the alien gun for the real monster, or as the
  gun jamming? does the first wave-4+ volley read as the payoff?).

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the diag, fix,
  participation, searsupply, and gunrate bands, for
  comparability). Dead villages stop simulating (+10d tail max).
- **Seeds: 107051, 107052, 107053, 107054, 107055, 107056, 107057,
  107058 — REUSED band, per the task** (paired before/after on
  identical seeds, one flag apart). The control leg is a FRESH
  run on this band with the rebuilt substrate (GUNRATE=1); the
  gunrate legs are historical context only, never the paired
  control — the two legs of THIS arm differ ONLY by CELLGATE.
- **Policies:** competent verbatim. **Substrate:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 +
  SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1` (same band as gunrate).
  **Two legs differing ONLY by CELLGATE** (ctl GUNRATE=1,
  arm GUNRATE=1 CELLGATE=1). SEARSUPPLY, BOWCRAFT, FUSIONCELL
  unset on both legs.
- **Instrument:** `scripts/cellgate-driver-a.js` (clone of
  `scripts/gunrate-driver-a.js` — all cell / searcaster census
  + grant wraps + lead-rule + flee-cause instrumentation kept
  verbatim — with `GUNRATE=1` REQUIRED on both legs,
  `CELLGATE` in the summary row, plus a `v4cellgate` recorder:
  every fight whose lead carries a searcaster (any wave) logs
  day / vid / monster / wave / shots / ammoLeft / gateHeld, so
  the gate's holds and the control leg's low-wave burns are
  counted from the same rows);
  analyzer `scripts/analyze-cellgate-a.js` (clone of
  `scripts/analyze-gunrate-a.js`, same four frozen bars + the
  gate-held / low-wave-burn secondary counts);
  proof test `scripts/test-cellgate-a.js` (clone of
  `scripts/test-gunrate-a.js`: the substrate assertions kept
  verbatim — 39/39 must pass against the rebuild — PLUS the
  gate assertions: low-wave searcaster volley held on-leg
  (0 shots, cells kept, hold-fire line) and fired off-leg;
  wave-4+ searcaster volley fires identically on both legs;
  bow/spear volleys unaffected by the gate at any wave;
  control-leg identity for the prize path).
  **§15 panel:**
  `scripts/build-cellgate-panels-a.js` (clone of the gunrate
  panel builder, two legs) + `node scripts/balance-panel.js
  compare`; the compare .md is attached to the evidence file.
  The panel is the instrument, the pre-registered threshold is
  the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the verdict.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** the gunrate band saw 172–231 wave-4+ meetings
   (engaged 123–191) on 8 seeds. The armed-entry floor (≥ 3)
   and the volley bar (≥ 1) are sized well below either pool —
   IF the new band behaves like it.
2. **Pool sizing:** bars 1–3 are counts, so they are powered by
   whatever pool arrives; bar 4 is a ratio, powered by the
   engaged meetings. Expected gun grants ~6–7 per band at 4/18
   (gunrate arm observed 6); if the arm leg still grants ~1,
   bar 1 fails as a SUPPLY finding about the rebuild (see the
   ladder). If the band is quiet (few wave-4+ meetings), bars
   2–3 fail honestly as a supply/participation finding, not as
   a metric error — the floors are the power guard.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-cellgate-a.js`, GREEN before the pilot) proves
   the rebuilt substrate on the gunrate fixtures (redirect
   recipient rule, bundle, tier-4 gun reweight on a fixed-draw
   stub, live grant → gear-up → equip → lead-volley chain,
   control-leg identity), PLUS the gate on fixtures (low-wave
   hold on-leg / fire off-leg, wave-4+ fire both legs, other
   weapons unaffected). The analyzer `--selftest` covers the
   judge shapes (GO, NO-GO per bar).
4. **Draw-neutrality check (frozen):** the substrate adds ZERO
  `Math.random()` calls on either leg — verified by grep over
  the diff (`git diff -U0 | grep -c "Math.random"` on added
  lines must be 0) before the pilot, and by the proof test's
  draw-count assertions. The gate adds zero `Math.random()`
  calls (it only skips a volley); its RR()/lroll divergence is
  the mechanism, disclosed above, not a silent shift.
5. **Fidelity check (frozen):** control-leg seed 107053 corpus
  matches the gunrate-a arm corpus for seed 107053 on every
  SIMULATION field (days, gameDays, endReason, deaths, samples,
  v4seeds, v4departs, v4gates, v4encounters, ammo rows, census
  rows, grant rows, win-plan stats) — excluding only the
  self-describing metadata that differs by construction
  (`arm`/`run`/`mode`/`leg`, `gameSha` — the rebuilt file carries
  a different comment header — `anchorCommit`, and the new
  `cellgateOn`/`cellgatePresent`/`v4cellgate` keys, which the
  gunrate corpus has no counterpart for). If any simulation field
  differs, the rebuild is not faithful — stop and investigate
  before judging anything. (Amended 2026-11-20 ~11:17 UTC,
  before the prereg commit and before any judged sim: the
  as-drafted "byte-identical" wording is unachievable because
  the metadata above differs by construction, not by behavior.)

## Canon note

`docs/CANON.md` (manifest), `docs/CONTESTS.md` (§Prizes: "Prizes
feed EVERY progression lane"; "Loot tie-in: contest prizes and
monster loot share the alien-item pool"; "Extreme contests have an
earned apex opportunity; ordinary wins cap at tier3"), and
`docs/MONSTER-WAVES.md` (wave-4 bands, read by the prior arms)
were consulted for this arm. **No canon doc covers fusion-cell
supply, the searcaster, or cell-weapon volleys** — said here
rather than inventing canon (same as the diag, fix, participation,
searsupply, and gunrate arms). The prize, grant, equip, volley,
lead, and expedition-holder rules are cited from code
(`contests.js` `_cxItemPrize`, `game.js` `rollAlienLoot` /
`alienLootGrant` / `villagerGearUp`, `equipment.js` `autoEquip` /
`volleyWeaponOf`, `fieldFights.js` volley ~975–1060,
`villager-agency.js` `startExpedition` / `expeditionMonster` /
`agencyState`), not from canon. The gate is a design call (this
arm's, Steve can overrule): a fighter who knows the alien gun
holds one volley saves it for the monster that matters — the
village's best weapon stops being spent on the first moth that
crosses its path.
