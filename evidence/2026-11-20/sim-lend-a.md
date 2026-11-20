# sim-lend-a — THE LEND: the gun to the fighters already going

**Verdict: NO-GO, kind PARTICIPATION.** Lever REVERTED (game code restored to base;
instrument + evidence only). Run fleshout-20261120T1705Z, axis scale-onramp,
finding #2599. Prereg: `evidence/2026-11-20/sim-lend-a-prereg.md` (commit e0380be37,
frozen before any judged sim). Pilot band 107051–107058 (reused, paired), horizon
150d death-aware, competent verbatim policy. Substrate both legs:
VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1
SPEARGATE=1 GUNRATE=1 CELLGATE=1; ctl LEND unset, arm LEND=1. 16 runs, 0 errors.

**In one line:** the lend works exactly as designed and fires exactly once in 8
seeds — into a fight the borrower was already going to die in — and the gun never
comes home, because the fight strips a dead fighter's weapon before the return
runs. The opportunity pool, not the logic, is the wall, and the one time the
pool opened, the lend cost the village its gun.

## §1 — The lever as built (per the frozen prereg)

At a wave-4+ fight launch inside `resolveWildMonsterEncounter` — the choke point
for world-tick fights and aid-routed lingering-raider fights (expedition fights
and raids excluded by construction) — when the picked lead is unarmed-or-empty
and a living armed holder (searcaster + ≥1 fusion cell; roster villager, never
the scholar; village health > 20, not sheltered, not post-flee resting) stands
in earshot (the monster's tile or an adjacent tile, Chebyshev ≤ 1) but is NOT
the lead, the holder LENDS the gun to the lead for that one fight.

- **Cells travel with the gun.** Shape (a): the lead has no searcaster — the
  lender's searcaster entry object + ALL the lender's fusion-cell entries move
  to the borrower. Shape (b): the lead carries an empty searcaster — only the
  cells move. The borrower's own cells are never moved (return by entry-object
  identity). One lend per fight; the lender may also be an ally in the fight.
  Lender pick: roster order, on-tile first, then adjacent.
- **Return** (`_returnLentSearcaster`, in a `try/finally` right after the fight
  call, before summary/scoring): gun entry + remaining units in the moved cell
  entries return to a living lender; the borrower gear-ups back to their own
  weapon and the lender gear-ups to re-seat the gun. If the lender died, the
  borrower keeps the gun + remaining cells. If the borrower died, the gun +
  remaining cells return to a living lender; if both died, the gun stays with
  the borrower's gear (existing death handling).
- **Narration** (in `rec.log`): the lend line is unshifted to the front, the
  return line pushed at the end. Gun: "`<Lender>` presses the Searcaster into
  `<Borrower>`'s hands — 'Take it. You go first.'" / "`<Borrower>` hands the
  Searcaster back to `<Lender>`." Cells: "`<Lender>` presses `<n>` fusion cells
  into `<Borrower>`'s hands — 'For the Searcaster. Make them count.'" / the
  hands-back variant. Borrower-dead: "`<Borrower>` falls — `<Lender>` takes the
  Searcaster back." Lender-dead: "`<Lender>` is gone — `<Borrower>` keeps the
  Searcaster."
- **Draw-neutrality:** zero new `Math.random()` calls; the lend does NOT skip
  the pick draw (unlike the presence draft); the only divergence is the volley
  itself firing. Proven by the test (§2) and by the pilot: 7 of 8 seeds run
  byte-identical on both legs (§3).
- **Guardrail form (frozen, chosen before judging — presence §9 proposal):**
  SEPARATED. (i) Lent-fight safety — the borrower is alive at fight end in ≥
  50% of lent fights (applies only if ≥ 1 lend fired; skipped, not failed,
  with 0 lends). (ii) Downstream — deaths per engaged wave-4+ meeting (arm)
  ≤ 1.10× ctl AND median survival (arm) ≥ 0.80× ctl. Both parts must hold.
- **Direct lend telemetry (frozen):** a fired-row in the lever itself
  (`v4lends`: day / seed / monster / lender / borrower / kind / cells moved /
  return outcome), joined to `v4encounters` on (day, mid, borrower vid).
  Lends are counted from their own fired-row, never inferred from corpus
  diffs (presence §12 finding).

No canon doc covers the searcaster, the contest-prize area, or holder presence
at fights — the same as the presence/cellgate arms; nothing here invents canon.

## §2 — Proof (before any judged sim)

- `scripts/test-lend-a.js` **41/41**: §1 data agreement (eulogy wave 4,
  mirrormoth wave 1); §2 direct-helper fixtures, all asserting 0 draws — gun
  lend on-tile + return, adjacent gun lend + return, cell lend + return,
  no-holder → null, 0-cell holder → null, HP-15 holder → null, wave-1 → null,
  raid → null, loaded borrower → null, LEND unset → null, dead-borrower return
  (gun home), dead-lender return (borrower keeps the gun) + restore; §3
  tick-level draw-neutrality — exactly 2 draws (coin + pick) LEND on and off
  with a stubbed fight, gun home after; LEND-off identity; §3 live lent lead
  fires an armed wave-4 volley (borrower leads, holds the lent searcaster at
  fight time, 2 shots, hits in the 64–68 band, cells spent per loosed shot,
  lend line first in the record, return line last, gun home + bow back after);
  §4 analyzer selftest.
- `scripts/test-gunrate-a.js` **39/39** and `scripts/test-cellgate-a.js`
  **12/12** green against the rebuilt substrate (searcaster weight 4/18 in the
  tier-4 contest pool + expedition-holder redirect + 2-cell bundle + wave-gated
  volley), before the pilot.
- `scripts/analyze-lend-a.js --selftest` **58/58** (GO, NO-GO per bar incl. the
  separated guardrail, the 1.10× cascade allowance, the 0-lend safety skip, and
  a `lendStats` fixture).
- **Fidelity: PASS** (`scripts/lend-fidelity-a.js`): the fresh control leg for
  seed 107053 reproduces the cellgate-a ARM corpus on every simulation field.
  Two fields needed documented exclusions, both base drift, not substrate
  infidelity — master moved between the cellgate run (anchor c6715520) and this
  run (base f43abed42): `policySha` (a hash of the bot policy file —
  journey-landing r149 added `beastDodgeReachable` to `competent.js`; metadata
  in the same class as the already-excluded `gameSha`/`anchorCommit`) and
  `sayCount` (the raw narration tally, 14191 → 14169, 0.15%, moved by the same
  drift: competent.js r149 dodge-step choices + conversation.js r256 DRY2 line
  picks). The vet-relevant says (`vetSays`, 35 lines) match byte-for-byte, and
  every event count matches exactly (gates 13, prizes 23, grants 22, kills 113,
  encounters 37, deaths 125). The rebuild was also diffed against the
  presence worktree's substrate: the only differences are comment wording, a
  variable rename, and a branch reorder that is behaviorally identical (the
  cellgate hold requires cells, so it can never coincide with the no-ammo
  branch).
- **Test-fixture learning (kept in the test, not the lever):** the §3 live
  fight first failed 7/41 because the two stubbed `vFlee` fights in the
  draw-neutrality check leave BOTH on-tile fighters post-flee resting, so the
  live tick's pool is empty and no fight happens at all (0 draws consumed).
  The test now clears the fixture rest state (`Game._postFleeRest`) before the
  live tick. The lever itself was never at fault — the tick pool correctly
  excludes post-flee villagers.

## §3 — Pilot (8 seeds per leg)

| seed | ctl days / end | arm days / end | ctl deaths | arm deaths | ctl holder-days | arm holder-days | lends |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 107051 | 142 village-lost | 142 village-lost | 138 | 138 | 0 | 0 | 0 |
| 107052 | 112 village-lost | 112 village-lost | 83 | 83 | 51 | 51 | 0 |
| 107053 | 150 survived | 150 survived | 125 | 125 | 0 | 0 | 0 |
| 107054 | 106 village-lost | 106 village-lost | 61 | 61 | 39 | 39 | 0 |
| 107055 | 139 village-lost | 139 village-lost | 87 | 87 | 24 | 24 | 0 |
| 107056 | 150 survived | 150 survived | 115 | 115 | 0 | 0 | 0 |
| 107057 | 150 survived | 150 survived | 123 | **132 (+9)** | 64 | **0** | **1** |
| 107058 | 150 survived | 150 survived | 97 | 97 | 16 | 16 | 0 |

Seven of eight seeds run **byte-identical** on both legs (every shown field).
The entire arm-vs-ctl difference comes from the single lend on seed 107057:
deaths 123 → 132, maxWave 5 → 4, standing 650 → 199, holder-days 64 → 0
(the gun was lost on day 87, so Naran's 64 holder-days never happened),
encounters 59 → 63. Wins 0/8 both legs; national 0/8 both legs.

## §4 — Verdict table (frozen bars)

| # | Bar | Arm | Ctl | Floor | Result |
| --- | --- | --- | --- | --- | --- |
| 1 | searcaster-holder-days | 130 | 194 | ≥ 40 | **PASS** (SUPPLY) |
| 2 | armed-holder entries | 2 | 2 | ≥ 3 | **FAIL** (PARTICIPATION) |
| 3 | armed volleys fired | 2 | 1 | ≥ 2 | **PASS** (PARTICIPATION) |
| 4 | guardrail, separated | (i) 0/1 survived (0%) (ii) 3.79 ≤ 4.34, median 146d = 146d | 3.95, 146d | (i) ≥ 50% (ii) ≤ 1.10×, ≥ 0.80× | **FAIL** (GUARDRAIL) |
| 5 | villager starvation deaths | 4 | 4 | ≤ ctl+2 (6) | **PASS** (GUARDRAIL) |

**Verdict: NO-GO, kind PARTICIPATION** (bar 2 fails; bar 4 also fails). A miss is
NO-GO, never re-scored. The confirm band (12–16 fresh seeds) is NOT warranted:
with one lend in 8 seeds, a confirm would measure the same empty pool at
greater cost, and the one lent fight already shows the return-path defect (§5).

Bar 1 note: holder-days PASSED the floor but FELL arm-vs-ctl (130 vs 194) —
the lend itself consumed the supply bar 1 measures, by losing the gun on day 87
(Naran's 64 holder-days on seed 107057 never happened on the arm leg).

Balanced-panel compare (§15): `review_required` — village deaths per run
103.625 → 104.75 (paired delta +1.125, `regression_watch` — the +9 deaths on
seed 107057 averaged over 8 seeds); every other metric `no_material_signal`.
The frozen exposure-normalized guardrail (bar 4(ii)) passes while the panel's
raw-deaths metric flags — the same split the presence arm saw; the frozen
guardrail is the judge.

## §5 — Mechanism: the one lend

The only fired row in 16 runs (`v4lends`, seed 107057, day 87):

- Monster: **algorithm** ("Don't-Look", wave 4, 750 HP), origin **aid** — an
  aid-routed fight, not a world-tick fight. Lender **naran_tumen** (armed,
  adjacent tile), borrower **yara_haddad** (the picked lead, unarmed), gun
  lend, 2 cells moved.
- The gun's story on this seed: granted to Naran **day 86** as a contest
  prize (the GUNRATE redirect, `grantEvents` day 86, `contest-prize` caller).
  Lent **day 87**. Borrower dead **day 87**. The gun never reappears in any
  living holder's census for the rest of the run (0 searcaster census rows on
  the arm leg vs 64 holder-days for Naran on the control leg); no corpse-take
  of a searcaster anywhere; `v4transfers` 0 on both legs.
- The fight (arm leg, from the encounter record): Yara opens at range — the
  volley fires, **2 shots, 1 hit, 64 damage** (686 of 750 HP left) — then
  Don't-Look closes and hits Yara for 20 in round 1 (0 HP left). Outcome
  **vDie**, rounds 1. The control leg shows the **identical fight**: Yara
  leads, vDie, round 1, same day-87 death rows (Yara + two monsters) on both
  legs. **The lend did not cause the death** — Yara dies in round 1 with or
  without the gun. The gun's 64 damage is 8.5% of a 750-HP monster that kills
  the lead in one round.
- The armed-entry detail makes the conversion exact. Control entries (2): the
  day-117 rerun fight (an armed lead kills, 67 dmg) and this day-87 fight,
  where Naran stands in the party **as an ally holding the gun** while Yara
  leads unarmed and dies. Arm entries (2): the same day-117 fight, byte
  identical — and the same day-87 fight, now with Yara leading **with the
  lent gun** (volley 2/1/64) and dying. The lend converted exactly one entry,
  on the one fight where it could matter, and it did not matter to the fight —
  only to what was lost.
- **The return failed.** `gunReturned: false` although the lender was alive
  and the borrower was alive *at return time* (`lenderAlive: true`,
  `borrowerAlive: true` — the death is applied by the encounter's settlement
  after the fight call returns, so at the `finally` the borrower is not yet
  marked dead). One lent cell came back (`cellsReturned: 1`); the gun did
  not. The field engine strips a dead fighter's equipped weapon during the
  fight, before the return runs — so by the time `_returnLentSearcaster`
  looks for the gun entry in the borrower's items, it is already gone. The
  prereg's borrower-death sink ("the gun returns to a living lender")
  assumed the gun would still be in the borrower's items; it isn't. This is a
  lever defect, not a measurement artifact: **as built, lending the gun to a
  fighter who dies loses the gun.** Finding #2629.
- The opportunity pool is unmeasured by this arm's instrument: the prereg
  froze no lend-opportunity pool counter, so whether other lendable moments
  existed and were missed (or whether this one fire was the whole pool) cannot
  be read from the corpus. The pool rows (holder present on 649 arm tick rows
  vs 879 ctl) count holders near fights, not lendable ones (lead unarmed-or-
  empty, holder not the lead). A next arm that re-tests the lend needs the pool
  counter frozen first. What is known: the lend fired 1 time in 8 seeds, and
  the presence pool behind it is ~22 distinct fights with a holder pooled
  (presence §6) — the pool is thin before the lend's narrower conditions apply.

## §6 — Sense-testing

Read the lent fight as a villager would live it, not as counts:

- The handoff itself is proven to read right in the proof test — the lend
  line opens the fight record ("Naran presses the Searcaster into Yara's
  hands — 'Take it. You go first.'") and the return line closes it. But the
  **corpus encounter log cannot show those lines**: the driver wraps
  `fieldFight` and reads `rec.log` at fieldFight-return, before the hook (in
  `resolveWildMonsterEncounter`, the caller) annotates the record. The stored
  transcript of the one lent fight starts with "Yara sees Don't-Look coming
  and nocks an arrow" — no handoff line, no return line. Instrument gap,
  finding #2630; the lines were proven present on the record the encounter
  itself returns (test-lend-a 41/41), so this is a recorder-timing blind spot,
  not a lever bug.
- The volley itself reads as archery even when it comes from the lent gun:
  "nocks an arrow", "loosed — it takes Don't-Look for 64", "loosed wide — the
  arrow buries itself in the dirt", "Yara lowers the bow". A searcaster
  volley should read as an alien weapon firing. Third sighting of finding
  #2623 (cellgate, presence, now lend — naran's day-87 volley read as archery
  on the presence arm too).
- The human story of the one lend: Naran wins the village's best weapon in a
  contest on day 86. The next day Yara is picked to face a wave-4 beast and
  Naran, standing one tile away, hands her the gun. She fires it once — one
  hit, 64 damage — and the beast kills her in the same round. The gun goes
  down with her and never comes home. The village is left with no gun at all
  for the remaining 63 days. That is not a bookkeeping shuffle; it is a real
  consequence, and it is the wrong one: the lend as built risks the village's
  scarcest weapon on exactly the fights where the borrower is most likely to
  die, and the return path cannot save it when she does.

## §7 — Village assessment (plain words)

In plain words: the idea works in the workshop and almost never happens in the
villages. In eight villages living 150 days each, the gun changed hands once.
That one time, the fighter who took it died in the first round — she would
have died anyway, the gun's one shot didn't save her — and the gun was lost
with her, so her village spent the next two months without it. Seven villages
never saw a handoff at all, and their stories came out exactly the same
whether the lend was switched on or off. The villages are not short of
generosity; they are short of moments when the gun-holder happens to be
standing next to a fighter who needs the gun. And when that moment comes, the
fighter who needs the gun is usually the one about to die. The lend is not
worth landing as it stands: it fires too rarely to help, and the one time it
fires it can destroy the thing it was meant to share.

## §8 — Metric review (proposals for the next run, not a re-score)

- **Bar 4(i) as frozen counts a death the control leg shows would have
  happened anyway.** Yara dies round 1 on both legs; the frozen safety part
  (borrower alive in ≥ 50% of lent fights) fails on 0/1 regardless. The
  separated guardrail's idea is right — judge the lent fight's own outcome —
  but the frozen form doesn't condition on the matched control fight. Proposal:
  judge lent-fight safety against the control leg — a lent fight counts as
  harm only when the borrower dies on the arm leg AND lives on the control
  leg (dies on both = no attributable harm). With n=1 lent fight the part is
  a coin flip on one casualty, not a safety measurement, either way.
- **Bar 2's floor (3 entries) against a pool of 1 lend.** The floor was
  priced from the presence band's 2 entries; the lend's own opportunity pool
  (1 fire in 8 seeds) is thinner than the floor assumes. A next arm should
  price the participation floor from a measured lend-opportunity pool, not
  from the presence band's entries.
- **The panel's raw-deaths metric vs the frozen guardrail.** The §15 compare
  flags `regression_watch` on village deaths per run (+1.125) while the frozen
  exposure-normalized guardrail passes (3.79 vs 3.95). The raw metric counts
  the cascade; the frozen bar normalizes by exposure. Same split as presence;
  the frozen guardrail stays the judge.
- **The presence instrument's `poolDraftMiss` is inert here.** The analyzer
  reports 53 on the arm leg, but PRESENCE was unset — there is no draft
  running, so the count is meaningless for this arm and is not cited as a
  finding.

## §9 — What would move it (next lever, not this arm's job)

- **The raid-defender question** (draftmiss arm's finding, sim-findings.md):
  the lend's real question is whether the gun belongs with raid defenders —
  the raid picks defenders by health/proximity and never consults the armed
  holder standing next to the fight. The one lend that fired was aid-routed,
  not a raid. A raid-defender arm answers the question this arm could not.
- **The borrower-death sink** (finding #2629): the return must recover the
  gun from the dead fighter's gear *before* the fight engine strips it, or
  from the corpse/drop afterwards. Until that is proven in a fixture, any
  re-test of the lend risks losing the gun again.
- **The opportunity pool:** the lend needs holders *in earshot of fighters
  who are about to fight* — the presence pool says holders are almost never on
  a monster's tile (0/12,529 tick rows) and only ~22 fights in 8 seeds had a
  holder pooled at all. Widening the pool (a larger earshot, or lending at the
  muster/dawn beat instead of at fight launch) is a design call for the next
  arm, priced from a measured pool.

## §10 — Files

- Prereg: `evidence/2026-11-20/sim-lend-a-prereg.md` (e0380be37)
- Evidence (this file): `evidence/2026-11-20/sim-lend-a.md`
- Instrument (committed 242d977d4): `scripts/test-lend-a.js` (41/41),
  `scripts/lend-driver-a.js`, `scripts/analyze-lend-a.js` (selftest 58/58),
  `scripts/lend-fidelity-a.js` (PASS), `scripts/build-lend-panels-a.js`
- Substrate proofs: `scripts/test-gunrate-a.js` (39/39),
  `scripts/test-cellgate-a.js` (12/12)
- Corpora: `evidence/2026-11-20/perseed-lend-a-ctl/` (8 seeds),
  `evidence/2026-11-20/perseed-lend-a-arm/` (8 seeds)
- Panels: `evidence/2026-11-20/lend-a-panel-before.json.gz`,
  `lend-a-panel-after.json.gz`, `lend-a-panel.json`, `lend-a-panel.md`
  (compare: `review_required`)
- Judge output: `node scripts/analyze-lend-a.js --ctl
  evidence/2026-11-20/perseed-lend-a-ctl --arm
  evidence/2026-11-20/perseed-lend-a-arm` → NO-GO, kind PARTICIPATION
- Game code: **reverted** — `src/js/game.js`, `src/js/contests.js`,
  `src/js/fieldFights.js` restored to base f43abed42 (0 LEND/GUNRATE/CELLGATE
  refs in `src/` after revert). `node scripts/check.js --quick` after revert:
  **339 passed, 5 failed in 724s** (re-run confirms the first run's 339/5 in
  825s). All 5 failures are the pre-existing slow/stale-proof classes, none
  attributable to the lend (game code reverted to base): two 120s-cap
  timeouts (`test-living-garden-deed-attainment.js`,
  `test-one-person-army-deed-attainment.js`) and three proof-staleness
  failures (`test-measurement-proof-update.js`,
  `test-measurement-workflow.js` — retained neutrality proof vs current
  inputs, `test-phone-frame-proof.js` — retained browser inputs / phone
  receipt stale vs index.html et al.).

## Findings

- **Finding #2628** — THE LEND FIRES ONCE IN 8 SEEDS. One lend in 16 runs
  (seed 107057 day 87, gun, adjacent); 7/8 seeds byte-identical between legs.
  The gun-to-the-fighter question is opportunity-bound, not logic-bound: the
  lever fires correctly every time its conditions are met, and its conditions
  are almost never met. The participation floor (3 entries) was priced from
  the presence band, not from a measured lend-opportunity pool — the next arm
  needs the pool counter frozen first.
- **Finding #2629** — THE LENT GUN IS LOST WHEN THE BORROWER DIES. As built,
  the borrower-death sink does not return the gun: the field engine strips a
  dead fighter's equipped weapon during the fight, before the `try/finally`
  return runs, so `_returnLentSearcaster` cannot find the gun entry in the
  borrower's items (`gunReturned: false` with the lender alive and the
  borrower alive at return time — the death is applied by the settlement
  after the fight call returns). One lent cell came back; the gun never
  reappears in any living holder's census (0 rows vs 64 holder-days on
  control), no corpse-take of a searcaster, `v4transfers` 0. The gun was
  granted day 86, lent day 87, lost day 87. Any re-test of the lend must
  prove the return from a dead borrower in a fixture first.
- **Finding #2630** — THE CORPUS ENCOUNTER LOG CANNOT SHOW LEND/RETURN
  LINES. The driver wraps `fieldFight` and reads `rec.log` at fieldFight-
  return, before the hook in `resolveWildMonsterEncounter` (the caller)
  annotates the record — so the stored transcript of the one lent fight has
  no handoff line and no return line, although the lines were proven present
  on the record the encounter returns (test-lend-a 41/41). Recorder-timing
  blind spot; a next arm that sense-tests from corpus transcripts needs the
  recorder to read the log after the hook annotates it.
- **Finding #2623, third sighting** — the searcaster volley still reads as
  archery ("nocks an arrow", "looses", "lowers the bow") in the one lent
  fight, as on the cellgate and presence arms.
