# sim-lend-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-lend-a · **Loop A run:** fleshout-20261120T1705Z
**Type:** BUILD + measure — the LEND lever for finding #2599
(finding #2625, the topmost named scale-onramp blank)
**Frozen:** 2026-11-20 ~17:26 UTC, before any judged sim.
**Branch:** `sim-lend-a` (worktree
`~/workspace/worktrees/sim-lend-a`). **Base:** master
f43abed42 (verified with `git rev-parse HEAD` before any work).
**Builds on:** `evidence/2026-11-20/sim-presence-a.md` (NO-GO kind
PARTICIPATION + GUARDRAIL) and
`evidence/2026-11-20/sim-presence-a-prereg.md`, plus
`evidence/2026-11-20/sim-cellgate-a.md` (NO-GO kind
PARTICIPATION) and `evidence/2026-11-19/sim-gunrate-a.md`
(NO-GO kind PARTICIPATION).

## The question (finding #2599's named next shape)

The presence verdict, verbatim: "The draft DID fire — once, on the
adjacent branch, in exactly the fight the cellgate arm named as the
gap — and produced the second armed wave-4+ volley in this finding's
history. But one draft fire in 8 seeds does not move the entry pool,
and the single-seed RNG cascade it set off trips the strict
guardrail. The binding constraint has moved again — from holder
presence at the fight (the draft fires when the holder is there) to
holder CONTACT with wave-4+ tick fights at all." And: "The next
lever (prereg shape (b), the lend — the gun to the fighters already
going) should be weighed against diagnosing the 21 distinct
draft-miss pairs first."

This arm builds shape (b), the lend, WITHOUT first diagnosing the
draft-miss pairs — a deliberate call, Steve can overrule. The
diagnosis question (sheltered / post-flee holders, stale pre-tick
reads, duplicate-row inflation) is about why the DRAFT could not
take fights it was pooled for; the lend answers a different question
than the misses ask. The presence evidence's own mechanism section
proves the lend's opportunity exists independent of the miss
diagnosis: the naran/yara fight (seed 107057, day 87) is a wave-4+
fight whose picked lead (yara, unarmed) died in round 1 while an
armed holder (naran, searcaster + 2 cells) stood adjacent in
earshot — a fight the village was already having, with the gun
already there, where the only missing step was the handoff. The
lend's pool is every such launch: a wave-4+ fight whose lead is
unarmed-or-empty while an armed holder stands in earshot. The
presence pool counters put that pool at ~22 distinct world-tick
fights with a holder pooled in 8 seeds — the lend's question is how
many of those launches convert into a lent volley, not whether the
holder was there.

Presence control corpus (the armed leg, GUNRATE=1 + CELLGATE=1,
band 107051–107058, 150d, competent): holder-days **194**,
cell-days **182**, armed-holder entries **2**, armed volleys **2**,
median survival **146d**. The two armed entries: Lautaro LEADS a
wave-4 fight (expedition-holder lead) and fires the volley; naran
enters as an ALLY while the lead dies in round 1, then LEADS the
same fight on the draft leg and fires the second volley. Victor and
yuki carry loaded guns 51 and 39 days to their villages' losses
without ever entering a wave-4+ fight armed.

## The mechanism (frozen, from code read — not a sim)

- `resolveWildMonsterEncounter(vid, m, opts)` (`src/js/game.js`
  ~21114) is the choke point for world-tick fights AND aid-routed
  lingering-raider fights: the tick picks a lead from the
  monster's tile (`villagerMonsterTick` ~21090), then this method
  routes through `aidFight` (which calls `fieldFight` internally,
  `src/js/comms.js` ~657) or straight to `fieldFight`. The volley
  is lead-only (`fieldFights.js` volley block reads the LEAD
  fighter's equipped ranged weapon + their own ammo). A lend
  inside this method, before the fight call, puts the gun in the
  lead's hands in time for the opening volley; a return right
  after the fight call puts it back before any downstream scoring.
- Expedition fights do NOT route through this method:
  `expeditionMonster` (`src/js/villager-agency.js` ~619) calls
  `fieldFight` directly, and the expedition holder leads their own
  fight. Patrol/sortie/raid fights route elsewhere (`resolvePatrol`,
  `opts.raid`). So a lend hooked in `resolveWildMonsterEncounter`
  is tick + aid-routed ONLY, by construction — see Scope below.
- Earshot is already a game rule: `villagerFightAllies`
  (`src/js/party-wiring.js`) answers from the fighter's node and
  ADJACENT nodes (Chebyshev distance ≤ 1). The lend uses the same
  earshot distance as the presence draft — a holder a tile away can
  already hear the fight and answer it as an ally.
- Transfer mechanics are entry-object moves, not conjuring:
  villager `items` entries are `{itemId, units}` (or string ids);
  `villagerGearUp(vid, false)` runs deterministic `autoEquip` and
  returns immediately (`wb > 0 || !acquire`); `equipment.js`
  carries zero `Math.random` calls. The searcaster (bonus 120)
  out-scores any bow in `autoEquip`, so gearing up after the
  transfer seats the lent gun in the ranged slot, and gearing up
  after the return re-seats the borrower's own best weapon.
  `npcNode(vid)` returns `{nx, ny}`; `npcsOnNode(tx, ty)` lists
  a tile's villagers.

## The design (frozen; my call, Steve can overrule)

**LEND=1** (default OFF). One mechanism, two shapes, one helper
pair in `game.js` next to `resolveWildMonsterEncounter`:

- **`Game._lendSearcaster(vid, m, mdef, opts)`** — called inside
  `resolveWildMonsterEncounter` AFTER the WILDAVOID avoid-check
  (a fight that never happens lends nothing) and BEFORE the
  `aidFight` / `fieldFight` call. It returns a lend record or
  null. It fires ONLY when ALL of these hold:
  - the monster's wave is **≥ 4** (wave read from `data.monsters`
    by `m.id`, same read as the draft);
  - NOT a raid (`opts.raid` — defence at the haven door is not a
    wild launch);
  - the picked lead is **unarmed-or-empty**: shape (a) GUN LEND —
    the lead's equipped ranged weapon (`S.equipment.rangedWeaponOf`,
    the same read the volley block uses) is NOT a searcaster;
    shape (b) CELL LEND — the lead's equipped ranged weapon IS a
    searcaster carrying **0** fusion cells;
  - a living **armed holder** is in earshot of the monster's tile
    (same tile, or an adjacent tile, Chebyshev ≤ 1) and is NOT the
    lead: a roster villager (never the scholar, `villagerId`
    excluded) whose equipped ranged weapon is a `searcaster`,
    carrying **≥ 1** `fusion_cell` in `items`, with village
    health **> 20**, not sheltered, not post-flee resting. Lender
    pick: roster order, on-tile holders first, then adjacent
    holders. One lend per fight (one lender, one borrower). The
    lender MAY also be an ally in the fight (earshot holders
    answer the shout) — ally status does not block the lend; they
    fight with their other weapon while the gun is out.
  - the lend fires for a fight that was already going to happen,
    on a lead that was already picked. The 0.5 coin flip, the
    table-sanctity return, the player's-tile skip, and the
    sheltered / post-flee filters are untouched.
- **Cells travel with the gun.** Shape (a): the lender's
  searcaster entry object AND all of the lender's fusion-cell
  entry objects move into the borrower's `items`; the borrower
  gear-ups (acquire=false) so the lent gun is equipped. Shape
  (b): all of the lender's fusion-cell entry objects move (the
  gun stays with the lender — the borrower already holds one);
  the borrower gear-ups (a no-op for the slot, kept for symmetry
  and so the return path is identical). The borrower's OWN cells
  are never moved — return accounting is by entry-object identity
  (see below), so a borrower's own cells stay theirs even if the
  volley spends lent cells first.
- **`Game._returnLentSearcaster(lend)`** — called in a
  `try/finally` immediately after the fight call returns (before
  the summary and all downstream scoring, so the vKill branch's
  `villagerKillLoot` + `villagerGearUp` re-seat the borrower's own
  weapon). The return:
  - if the **lender is alive** at return time: the lent gun entry
    object (shape (a)) moves back into the lender's `items`, and
    whatever units remain in the moved cell entry objects move
    back with it (the volley may have spent some; an entry spent
    to 0 units was already spliced out by the volley and returns
    nothing). The borrower gear-ups back to their own best weapon;
    the lender gear-ups to re-seat the returned gun.
  - if the **lender died** in the fight (e.g. as an ally): the
    borrower KEEPS the gun + remaining cells — the village does
    not strip a dead person's weapon mid-grief; the gun is in the
    borrower's hands and the existing death/corpse machinery owns
    it from there.
  - if the **borrower died** mid-fight: the gun + remaining cells
    return to the lender if the lender is alive; if the lender is
    also dead, the gun stays in the borrower's items (existing
    death handling — the same sink the gunrate vanish already
    records as unexplained, not this arm's problem to solve).
  - the return is deterministic (entry identity + roster reads);
    it never consults a draw.
- **Narration (one line each, in the fight record).** The lend
  line is unshifted onto `rec.log` after the fight call returns
  (it happened before the fight); the return line is pushed onto
  `rec.log` after the return. Gun lend: "`<Lender>` presses the
  Searcaster into `<Borrower>`'s hands — 'Take it. You go
  first.'" / "`<Borrower>` hands the Searcaster back to
  `<Lender>`." Cell lend: "`<Lender>` presses `<n>` fusion
  cells into `<Borrower>`'s hands — 'For the Searcaster. Make
  them count.'" / "`<Borrower>` hands the spare cells back to
  `<Lender>`." Borrower-dead return: "`<Borrower>` falls —
  `<Lender>` takes the Searcaster back." Lender-dead (borrower
  keeps): "`<Lender>` is gone — `<Borrower>` keeps the
  Searcaster." First names only, from the persons' own records.
  No other narration: the volley's own lines and the fight record
  carry the rest.

**Scope — tick-only, and why.** The lend fires in
`resolveWildMonsterEncounter` only: world-tick fights and
aid-routed lingering-raider fights. Expedition fights are
EXCLUDED: the expedition holder leads their own fight, so the
borrower shape (a picked lead with an armed holder in earshot)
does not arise there, and earshot holders on an expedition are
fellow expedition members — a party-internal lend is a different
mechanism to prove separately, not a free extension of this one.
Raids are EXCLUDED (`opts.raid`): defence at the haven door, not
a wild launch. Patrol/sortie fights that do not route through
`resolveWildMonsterEncounter` are EXCLUDED by construction. The
measured gap this arm answers is the tick/aid launch (naran
standing by while yara dies); the scope is the gap, not every
fight in the game.

**NOT built here:** a permanent transfer (the gun always comes
home — a lend, not a gift); a lend to the scholar (the scholar's
fights route elsewhere, and the scholar's pack is the dead end
the gunrate redirect already routes around); any cell resupply,
bundle change, or village craft for cells — cells are alien tech.

**Draw-neutrality (stated honestly, not waved through):**
- The SUBSTRATE adds ZERO `Math.random()` calls on either leg
  (gunrate proof test's draw-count assertions re-run against the
  rebuild and must still pass). The gate's skipped volley draws
  are the mechanism, disclosed in the cellgate prereg.
- The LEND adds zero `Math.random()` calls: the lender pick is
  deterministic roster-order reads (`npcsOnNode` / `npcNode` /
  `rangedWeaponOf` / health / sheltered / post-flee); the
  transfer is entry-object moves; both gear-ups are
  deterministic `autoEquip`. Unlike the presence draft, the lend
  does NOT skip the pick's draw — the pick still happens exactly
  as before, and the lend acts after it. The ONLY stream
  divergence the lend can cause is the volley itself firing where
  it would not have (its RR()/lroll draws) — that is the lever's
  mechanism, disclosed here, not a silent shift. The proof test
  asserts zero draws around lend + return on every fixture.
- The guardrail is exposure-normalized AND separated (see below),
  so downstream divergence is judged on deaths per engaged
  meeting, not raw counts.

## Control substrate (rebuilt, not re-argued)

The gunrate + cellgate code is reverted on master (0 GUNRATE /
CELLGATE refs in `src/`), so this arm rebuilds BOTH as its control
substrate, recovered from the gunrate + cellgate preregs, the proof
tests (`scripts/test-gunrate-a.js`, 39 assertions;
`scripts/test-cellgate-a.js`, 12 assertions), and the searsupply
lever commit (`6c4b75925`, the `_searSupplyFighter` / bundle /
cell-weight template):

- **GUNRATE=1:** searcaster weight 4/18 in the tier-4 contest
  pool + expedition-holder redirect (`_gunRateFighter`: current
  expedition +8, launches +2 each capped +8, wave3Kill +4,
  wave2Kill +2, contestWin +1 each, roster-order tie-break; own
  eligibility, NOT contestEligible) + 2-cell bundle with the gun.
- **CELLGATE=1:** wave-gated volley — a searcaster lead holds fire
  below wave 4 (0 shots, cells kept, hold line), fires wave 4+ as
  before; other weapons untouched; a cell-less searcaster still
  says "no fusion cells".

The control leg runs GUNRATE=1 + CELLGATE=1; the arm leg runs
GUNRATE=1 + CELLGATE=1 + LEND=1. The two legs differ ONLY by
LEND. The control must reproduce the cellgate ARMED-leg corpus
exactly (holder-days 194, cell-days 182, armed entries 2, armed
volleys 1, median 146d) or STOP and diagnose — do not judge
against a drifting control. (The presence arm's control leg
reproduced it: holder-days 194, armed entries 2, armed volleys
1, median 146d — the presence evidence §2 gate (a).)

## Primary metric (BINDING, §14)

**GO iff ALL FIVE hold on the band (8 seeds, two legs, identical
seeds, panel §15):**

1. **Searcaster-holder-days floor:** villager searcaster-holder-days
   (arm) ≥ 40. (Presence arm: 194. The substrate rebuild must
   reproduce the gun rate; a miss here is a SUPPLY finding about
   the rebuild, not the lend.)
2. **Armed-holder entries floor:** wave-4+ fight entries with a
   searcaster holder carrying ≥ 1 cell (any participant, arm) ≥ 3.
   (Presence arm: 2 — the bar this arm must clear by one. A lent
   fight counts: the borrower holds the gun + cells at fight time,
   so the driver's pre-call `partyCells` read shows them armed;
   the borrower is the lead, so it is also an armed lead.)
3. **Armed volleys FIRED ≥ 2:** volleys FROM a searcaster in a
   wave-4+ fight (lead `rangedId === 'searcaster'` AND
   `volley.shots > 0`, arm). (Presence arm: 2. The lend must
   produce a lent volley on top of the substrate's own — a lent
   fight whose volley fires is the proof bar #2599 names for this
   shape.)
4. **No-regression guardrail, SEPARATED (CHOSEN — see below):**
   - (i) **Lent-fight safety:** in lent fights, the borrower is
     alive at fight end in ≥ 50% of lent fights. Borrower
     survival is read from the lent fight itself: the joined
     encounter's outcome is not `vDie` AND the borrower has no
     death row on the lend day in that seed. Applies only if ≥ 1
     lend fired; with 0 lends this part is skipped (not failed) —
     bars 2–3 already fail as participation then. The same-day
     death-row read can catch a borrower who died later the same
     day in a different fight; that confound is disclosed here
     and the encounter-outcome read is the primary signal.
   - (ii) **Downstream:** deaths per engaged wave-4+ meeting
     (arm) ≤ **1.10 ×** control; AND median survival (arm) ≥
     0.80 × control. Deaths per engaged meeting is the binding
     downstream number.
   Both (i) and (ii) must hold.
5. **Starvation guardrail:** villager starvation deaths (death
   rows with cause `starvation`, arm) ≤ control + 2. (Presence
   §10: 4 arm vs 4 ctl starved. The lend must not starve the
   village by pulling its fighters into the wild.)

**Guardrail form — the choice, made before judging.** Presence
§9 proposed either keeping the strict 1.00× deaths/engaged bar or
pre-registering a separated guardrail that judges the lent fights'
own outcome apart from downstream cascade. THIS ARM CHOOSES THE
SEPARATED FORM, for a stated reason: the presence arm proved the
strict 1.00× bar cannot tell a harmful lever from an unlucky
cascade — its whole bar-4 failure was one seed's RNG cascade
after a single skipped pick draw, while the drafted fight itself
saved lives. The lend's divergence source is the same class
(a volley firing where none fired before shifts the stream), so
a strict bar would trip on cascade noise again. The separated
form judges the mechanism's own harm directly (part (i): did the
borrowers live through the fights they were lent into?) and keeps
a downstream check with the gunrate arm's 1.10× allowance (part
(ii)) so a real downstream harm still fails the run. This choice
is frozen here, before any judged sim, and is never re-scored
after. If the separated guardrail passes while the panel still
flags a death regression, the panel flag is recorded as a watch
item, not a re-score.

**Verdict ladder (frozen):**
- **GO** = all five bars hold → the lever lands (substrate +
  gate + lend, one commit, `[needs-eyes]` — the prize redirect
  is a feel change and the lend changes who carries the gun into
  a fight).
- **NO-GO** = any bar misses → the game code is REVERTED before
  commit (substrate AND gate AND lend leave no trace);
  instrument + evidence commit only. The kind is recorded
  (supply miss vs participation miss vs guardrail miss) and the
  coordinator decides the next lever.
- A NO-GO on bar 1 is a SUPPLY finding (the rebuild did not
  reproduce the gun rate — investigate the pool, do not just
  raise the weight blind). A NO-GO on bars 2–3 with bar 1
  passing is a PARTICIPATION finding (holders arrive armed but
  the gun never reaches a fighter going — the next lever is a
  contact/diagnosis question, not a wider lend). A NO-GO on bar
  4 or 5 alone is a GUARDRAIL finding.

**Direct lend telemetry (frozen, presence §12 finding).** The
lend is counted from its OWN fired-row, never inferred from
corpus diffs: the driver wraps `Game._lendSearcaster` and
`Game._returnLentSearcaster` (pure-read wraps — call through,
record the returned record) into `v4lends` rows: day / seed /
monster / lender / borrower / kind (`gun` | `cells`) / cells
moved / gun returned / lender alive at return / borrower alive
at return. The analyzer's `lendStats` joins `v4lends` to
`v4encounters` on (day, mid, borrower vid) for lent-fight
outcomes (volley, outcome, rounds, damage). If `v4lends` is
empty on the arm leg, bars 2–3 fail honestly as a no-lend
finding — the lend never had a chance to fire.

## Secondary metrics (supporting, never re-scored)

- (a) Lend pool (`v4tickPresence` rows, arm vs ctl, kept from
  presence): wave-4+ world-tick fights where an armed holder was
  on the monster's tile / on an adjacent tile / nowhere near;
  lends by kind (gun vs cells) and by source (tile vs adjacent);
  lent fights' outcomes (vKill / vFlee / vDie) vs undrafted armed
  entries. If the pool is empty, bars 2–3 fail honestly as a
  no-contact finding.
- (b) Armed leads (armed holder IS the lead — counter FIXED in
  the presence analyzer, finding #2622) and armed volleys with
  damage; "no fusion cells" log lines; gate-held counts (arm)
  vs low-wave burns (ctl); searcaster departures with/without
  cells; lend returns (gun returned vs borrower-kept vs
  lender-dead).
- (c) Gun transfers + vanishes (`v4transfers` rows, finding
  #2624): every inter-villager gun move the daily census can
  see, and every gun that leaves all known hands with no recorded
  sink. The lend IS a transfer — but a same-fight, returned one:
  the daily census diff should NOT count a lend as a transfer
  (the gun is back with the lender by the next census), while a
  borrower-kept gun (lender died) SHOULD appear as one. The
  transfer detector's verdict on lends is a secondary check on
  the return path, not a bar.
- (d) Wall numbers every run: national / table / wins, wave-4
  and wave-5 unlocks, median survival, per seed. Table: not
  instrumented by this driver — reported as null, never faked.
- (e) Sense-test notes from transcripts (SENSE-TESTING LAW —
  read the fight logs; does the lend read like a villager handing
  over the village's best weapon, or like a bookkeeping shuffle?
  does the lent volley read as the payoff? does the return read
  as the gun coming home?).

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the diag, fix,
  participation, searsupply, gunrate, cellgate, and presence
  bands, for comparability). Dead villages stop simulating (+10d
  tail max).
- **Seeds: 107051, 107052, 107053, 107054, 107055, 107056, 107057,
  107058 — REUSED band, per the task** (paired before/after on
  identical seeds, one flag apart). The control leg is a FRESH
  run on this band with the rebuilt substrate (GUNRATE=1 +
  CELLGATE=1); the presence/cellgate legs are historical context
  only, never the paired control — the two legs of THIS arm
  differ ONLY by LEND.
- **Policies:** competent verbatim. **Substrate:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 +
  SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1` (same band as gunrate,
  cellgate, and presence). **Two legs differing ONLY by LEND**
  (ctl GUNRATE=1 CELLGATE=1, arm GUNRATE=1 CELLGATE=1 LEND=1).
  SEARSUPPLY, BOWCRAFT, FUSIONCELL, PRESENCE unset on both legs.
- **Instrument:** `scripts/lend-driver-a.js` (clone of
  `scripts/presence-driver-a.js` — all cell / searcaster census
  + grant wraps + lead-rule + flee-cause instrumentation kept
  verbatim — with `GUNRATE=1` and `CELLGATE=1` REQUIRED on both
  legs, `LEND` in the summary row, the `v4tickPresence` recorder
  and `v4transfers` detector kept, PLUS a `v4lends` recorder:
  pure-read wraps on `Game._lendSearcaster` and
  `Game._returnLentSearcaster`); analyzer
  `scripts/analyze-lend-a.js` (clone of
  `scripts/analyze-presence-a.js`, same frozen bars with the
  SEPARATED guardrail at 1.10× + lent-fight safety, PLUS
  `lendStats`); proof test `scripts/test-lend-a.js` (the lend
  fixtures + a live lent-lead volley on the encounter-gear
  fixture, failing on old code); substrate proofs re-run
  unmodified: `scripts/test-gunrate-a.js` (39/39) and
  `scripts/test-cellgate-a.js` (12/12) against the rebuild.
  **§15 panel:**
  `scripts/build-lend-panels-a.js` (clone of the presence panel
  builder, two legs) + `node scripts/balance-panel.js compare`;
  the compare .md is attached to the evidence file. The panel is
  the instrument, the pre-registered threshold is the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the verdict. If the pilot
  GOes, the evidence file says explicitly whether a confirm is
  warranted and why (or why not).

## Pre-pilot substrate checklist (§14b)

1. **Contact:** the presence band saw 172–231 wave-4+ meetings
   (engaged 123–191) on 8 seeds, and ~22 distinct world-tick
   fights with a holder pooled. The armed-entry floor (≥ 3) and
   the volley bar (≥ 2) are sized well below either pool — IF
   the new band behaves like it. The lend's own contact pool
   (a wave-4+ launch whose lead is unarmed-or-empty while an
   armed holder is in earshot) is UNKNOWN until the pilot
   measures it — the `v4lends` rows are the measurement, and an
   empty `v4lends` is a finding, not a metric error (see the
   telemetry freeze above).
2. **Pool sizing:** bars 1–3 are counts, so they are powered by
   whatever pool arrives; bar 4 is a ratio + a lent-fight share,
   powered by the engaged meetings and the lends; bar 5 is a
   count with a +2 allowance. Expected gun grants ~6–7 per band
   at 4/18 (gunrate arm observed 6, cellgate arm 6, presence
   arm 6); if the arm leg still grants ~1, bar 1 fails as a
   SUPPLY finding about the rebuild (see the ladder). If the
   band is quiet (few wave-4+ meetings), bars 2–3 fail honestly
   as a supply/participation finding, not as a metric error —
   the floors are the power guard.
3. **Mechanism pre-check (frozen, not a sim):** the proof tests
   (`scripts/test-gunrate-a.js` 39/39 + `scripts/test-cellgate-a.js`
   12/12, GREEN before the pilot) prove the rebuilt substrate,
   PLUS `scripts/test-lend-a.js` (GREEN before the pilot) proves
   the lend on fixtures (gun lend on-tile, gun lend adjacent,
   cell lend to an empty-gun lead, no-holder old fight, unarmed
   holder not a lender, wounded holder not a lender, wave-3
   monster no lend, raid no lend, LEND-off identity, borrower
   re-equips their own bow on return, lender re-seats the gun on
   return, borrower-dead return, lender-dead borrower-keeps, and
   a live lent lead firing an armed wave-4+ volley) and the
   analyzer `--selftest` covers the judge shapes (GO, NO-GO per
   bar, incl. the separated guardrail and the starvation bar).
4. **Draw-neutrality check (frozen):** the substrate adds ZERO
  `Math.random()` calls on either leg — verified by grep over
  the diff (`git diff -U0 | grep -c "Math.random"` on added
  lines must be 0, discounting the comment-only mention) before
  the pilot, and by the proof tests' draw-count assertions. The
  lend adds zero `Math.random()` calls (it only moves entries
  and gear-ups; the volley's own draws are the mechanism,
  disclosed above, not a silent shift).
5. **Fidelity check (frozen):** control-leg seed 107053 corpus
  matches the cellgate-a ARM corpus for seed 107053 on every
  SIMULATION field (days, gameDays, endReason, deaths, samples,
  v4seeds, v4departs, v4gates, v4encounters, ammo rows, census
  rows, grant rows, win-plan stats) — excluding only the
  self-describing metadata that differs by construction
  (`arm`/`run`/`mode`/`leg`, `gameSha` — the rebuilt file carries
  a different comment header — `anchorCommit`, and the new
  `lendOn`/`lendPresent`/`v4lends` keys, which the cellgate corpus
  has no counterpart for; the `v4tickPresence` / `v4transfers`
  keys are ALSO excluded — the cellgate corpus has no counterpart
  for them either, as the presence fidelity check already
  established), the per-process `seq` counters, and worktree
  paths inside string values (`frame`, `caller` — normalized to
  `<WT>`). If any simulation field differs, the rebuild is not
  faithful — stop and investigate before judging anything. (Seed
  107053 had holder-days 0 on the cellgate arm leg, so the lend
  cannot touch it — the fidelity seed is lend-proof by
  construction.)

## Seed-band freshness check (frozen, before any judged sim)

Band 107051–107058 is REUSED deliberately as a paired
before/after on identical seeds — the same reuse the gunrate,
cellgate, depmat, searsupply, bowsee, bowknow, and presence
preregs record. Searched: every `evidence/*/sim-*-prereg.md`
(grep `107051`): named in
`evidence/2026-11-19/sim-searsupply-a-prereg.md`,
`evidence/2026-11-19/sim-bowsee-a-prereg.md`,
`evidence/2026-11-19/sim-bowknow-a-prereg.md`,
`evidence/2026-11-20/sim-gunrate-a-prereg.md`,
`evidence/2026-11-20/sim-depmat-a-prereg.md`,
`evidence/2026-11-20/sim-cellgate-a-prereg.md`, and
`evidence/2026-11-20/sim-presence-a-prereg.md`. No dedicated
forbidden/contaminated band list names this band (no such list
file exists in the goal `hidden_files/`; the only
"forbidden/contaminated" hits there are generic mentions in
unrelated notes). The band is NOT fresh — it is a paired
comparison, not a fresh band, by design: the control leg is a
fresh run that must reproduce the cellgate armed-leg corpus
exactly (§Fidelity), and the two legs of THIS arm differ only by
LEND.

## Canon note

`docs/CANON.md` (manifest) and `docs/CONTESTS.md` (§Prizes —
"Prizes feed EVERY progression lane"; "Loot tie-in: contest prizes
and monster loot share the alien-item pool"; "Extreme contests have
an earned apex opportunity; ordinary wins cap at tier3") were
consulted for this arm. **No canon doc covers the searcaster, the
contest-prize area specifically, or holder presence at fights** —
said here rather than inventing canon (same as the diag, fix,
participation, searsupply, gunrate, cellgate, and presence arms).
The prize, grant, equip, volley, lead, expedition-holder, and
world-tick rules are cited from code (`contests.js`
`_cxItemPrize`, `game.js` `rollAlienLoot` / `alienLootGrant` /
`villagerMonsterTick` / `resolveWildMonsterEncounter`,
`equipment.js` `rangedWeaponOf` / `autoEquip`,
`fieldFights.js` volley ~975–1060, `party-wiring.js`
`villagerFightAllies`, `villager-agency.js` `startExpedition` /
`expeditionMonster` / `agencyState`, `comms.js` `aidFight`), not
from canon. The lend is a design call (this arm's, Steve can
overrule): when the village's best weapon is standing in earshot
of the hardest beast and the fighter going in has no gun, the
carrier hands it over for the fight and takes it back after —
the village does not watch its best weapon sit out a fight it
could have won.
