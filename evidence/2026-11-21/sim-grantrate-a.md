# sim-grantrate-a — searcaster contest-prize GRANT RATE (finding #2635 follow-up)

- Arm: sim-grantrate-a (DIAG), Loop A run fleshout-20261121T1615Z.
- Base master: `abfc8f466`. Branch: `sim-grantrate-a`.
- Prereg: `evidence/2026-11-21/sim-grantrate-a-prereg.md` (committed `01f5eb5be`,
  frozen ~16:40 UTC 2026-11-21, before any judged sim; Amendment A committed
  `2f8ed2dcf`, also before any judged sim — see §7).
- Instrument commits: `e069daba0` (driver + analyzer + proof test + panel
  builder), `2f8ed2dcf` (tbKillRewards taxonomy fix + prereg amendment A +
  smoke corpus).
- Horizon: 150d death-aware. Seeds: 107237–107244 (fresh band, verified unused).
  Policy: competent (verbatim). Substrate: `GUNRATE=1 CELLGATE=1`; `LEND` off,
  `PRESENCE` off. Env (both legs identical): `VETREENGAGE=1 PARTYSIZE4=1
  FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1
  CELLGATE=1`.
- Two legs, leg1 + leg2, identical env — the second leg is the
  instrument-neutrality proof (a diag with no lever; the honest panel result
  is no material signal everywhere).

## Verdict: DIAG-GO

**The grant stream is thin, and it is thin at the tier-4 gate — not at the
pool weight.** In 150 days across 8 villages: 120 contests fired, 164 prize
rolls, 26 tier-4 rolls, **5 searcaster grants**. That is **1 gun per 24
contests entered (4.2%)** and **1 gun per 33 prize rolls (3.0%)**. Three of
eight villages never see a gun at all, no village ever gets a second grant,
and the one village that loses its gun never gets it back. The static
funnel math predicted this rate almost exactly (see §1), so the scarcity is
the design working as built — the question for any supply fix is which
stage of the funnel it opens, not whether the gun is being lost somewhere
(it is not: vanishcause-a proved that, and this band loses exactly one gun,
to a named mechanism, §5).

## Frozen-bar table (prereg §6)

| Bar | Frozen threshold | Result | Pass |
| --- | --- | --- | --- |
| Instrument validity (proof test + selftest + 0 errors + every roll carries a tier) | all must hold | proof test 39/39 green; analyzer selftest 20/20 green; instrumentErrors 0; rolls without tier 0 | ✅ |
| Coverage (100% prize↔roll joins; 100% searcaster grants attributed; 0 unclassified sources) | all must hold | 164/164 prize calls joined to exactly one contest roll; 0 unjoined, 0 orphan rolls, 0 unattributed grants, 0 ungranted searcaster rolls; searOtherGrants 0 | ✅ |
| Answer quantified (per-seed table + funnel + S1–S5) | all must hold | §1–§5 below: every second-chance answer named with numbers | ✅ |
| Guardrail neutrality (leg1 vs leg2 identical; panel no material signal; 0 src delta) | all must hold | --compare NEUTRAL, 0 mismatches, all 8 seeds identical sim fields + event counts; panel compare: every observed metric delta 0, no_material_signal; `git diff abfc8f466 -- src/` empty | ✅ |

## Wall numbers (leg1, 8 seeds)

| Metric | Value |
| --- | --- |
| Wins | 0/8 |
| National scale access | 0/8 |
| Table | not instrumented (null) |
| Wave 5 reached | 5/8 (107237, 107238, 107240, 107241, 107243) |
| Wave 4 reached | 8/8 |
| Median survival | 150 days |
| Community lost | 3/8 (107240 d146, 107243 d144, 107244 d53) |
| Standing at end | 505, 765, 199, 650, 610, 199, 405, 100 |

The scale wall still binds: no village reaches national, none wins. This arm
was a diag on the grant rate, not a scale lever — the wall numbers are
recorded, not moved.

## Per-seed table (leg1)

| Seed | Days | End | Wave | Standing | Contests | Wins | Prize rolls | Tier-4 rolls | Searcaster grants | Grant day(s) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107237 | 151 | survived | 5 | 505 | 18 | 13 | 25 | 5 | 0 | — |
| 107238 | 150 | survived | 5 | 765 | 16 | 13 | 20 | 5 | 1 | 111 |
| 107239 | 151 | survived | 4 | 199 | 16 | 13 | 23 | 1 | 0 | — |
| 107240 | 146 | village-lost | 5 | 650 | 15 | 12 | 17 | 3 | 1 | 144 |
| 107241 | 150 | survived | 5 | 610 | 16 | 13 | 24 | 3 | 1 | 121 |
| 107242 | 150 | survived | 4 | 199 | 16 | 12 | 24 | 3 | 1 | 58 |
| 107243 | 144 | village-lost | 5 | 405 | 19 | 14 | 26 | 6 | 1 | 114 |
| 107244 | 53 | village-lost | 4 | 100 | 4 | 3 | 5 | 0 | 0 | — |
| **Band** | | **3 lost / 5 survived** | | | **120** | **93** | **164** | **26** | **5** | |

Totals: 5 contest-prize searcaster grants in 8 runs (0.625 per seed); 139
of 164 prize rolls granted an item (84.8% — the rest are "shy vault" nulls);
1 lone fusion_cell prize (107238 day 119, tier 4); 0 show-gift or trade
searcasters (the taxonomy shows 0 for both, as the code read predicted).

## 1. The funnel — where the gun is lost, stage by stage

The funnel, measured (120 contests → 5 guns):

| Stage | n | Rate | What it means |
| --- | --- | --- | --- |
| Contests fired (entered) | 120 | — | the denominator: every fired contest takes ≥ 1 person |
| Contest resolutions | 114 | — | 93 won, 21 lost (no deaths/refusals recorded on this band) |
| Prize rolls (`_cxItemPrize` calls) | 164 | 1.37 per contest | winners only: 88 player, 76 villager; 123 extreme-risk, 23 high, 7 medium, 11 low |
| Rolls that granted an item | 139 | 84.8% of rolls | 25 shy-vault nulls (the chance roll failed) |
| Tier-4 rolls | 26 | 15.9% of rolls; 21.1% of extreme-risk rolls | the tier-4 gate: extreme + apex + the 25% roll |
| Searcaster results | 5 | 19.2% of tier-4 rolls; 22.7% of tier-4 items | the pool weight, working as built |
| **Searcaster grants** | **5** | **4.2% per contest; 3.0% per prize roll** | the answer |

**Static prior vs measured (prereg §2):** P(gun | one prize roll) =
P(extreme 123/164 = 75%) × P(apex 25%) × P(chance ~0.9) × P(pool 4/18 =
22.2%) ≈ **3.7%**. Measured **3.0%** (5/164) — within noise of the prior
on 5 events. The pool weight is NOT the choke: 5 of 22 tier-4 items were
searcasters (22.7%, vs 22.2% expected with GUNRATE=1), and the live proof
test independently proved the weight (300 rolls: 1/15 unweighted,
4/18 weighted). The choke is upstream: only 26 of 164 rolls ever reach
tier 4, and tier-4 access needs an extreme-risk contest at wave 4+
(apex is near-automatic once wave 4 unlocks — 21.1% of extreme rolls hit
tier 4, vs the 25% apex roll) plus the 25% roll itself. Two of the three
zero-grant seeds never got a fair shot at the gate at all (§2).

The 26 tier-4 rolls, by outcome: 5 searcaster, 1 fusion_cell, 16 other
tier-4 items (farstrider_boots ×3, second_skin_suit ×2, starfall_lance ×2,
conquerors_plate ×2, worldroot_plate ×2, bloodplate, apex_bow,
genesis_seed, lifebound_vestments, worldbreaker_maul), 4 shy-vault nulls.
No grant arrived before day 58 on the band (grant days 58, 111, 114, 121,
144 — median 114): the gun is a late-game arrival even when it comes.

## 2. S1 — the three villages that never win a gun

| Seed | Contests | Prize rolls | Tier-4 rolls | Tier-4 outcomes | Why no gun |
| --- | --- | --- | --- | --- | --- |
| 107237 | 18 | 25 | 5 | 2 null, bloodplate, farstrider_boots ×2 | **Rolled and lost** — reached the gate 5 times, the pool gave other items twice and the vault stayed shy twice |
| 107239 | 16 | 23 | 1 | worldroot_plate | **Thin gate** — one tier-4 roll in 150 days, and it paid an armor piece |
| 107244 | 4 | 5 | 0 | — | **Never reached the gate** — village lost day 53, before wave 4 matured into extreme contests |

Three different scarcities, one number: "zero grants" hides them. 107237 is
the sharpest: it entered the most contests on the band and still lost every
roll — but it did hold a gun anyway, by the other door (§5): amina_diallo
killed something on day 71 and the searcaster dropped straight into her
pack. That gun came with **0 cells** and sat on her corpse for 62 days after
she died (see §5) — a gun with no ammunition, never fired, never recovered.

## 3. S2 — second grants: none, anywhere

**0 second grants on the band.** Every granting seed got exactly one
contest-prize grant (grant days 58, 111, 114, 121, 144; grants-after-first
empty on all 8 seeds). The stream does not repeat within 150 days: a village
that wins a gun does not win another one, and a village that misses its rolls
does not get a make-up prize. The 5 grants are 5 first-and-only grants.

## 4. S3 — re-grant after loss: the one loss, never re-granted

One loss on the band: **seed 107237, day 149**. The gun's story: amina_diallo
wins it by kill loot on day 71 (see §5), carries it equipped with 0 cells,
dies "the wild" on day 87, and the gun sits on her corpse
(`corpse_87_b1n8dn`, unburied, unlooted) for **62 days** — through day 148.
On day 149 the gun total falls to 0 with no corpse-take ever recorded. The
mechanism, read from code: the corpse list is capped at 40 — when it
overflows, the oldest fully-decayed (stage-4) corpse is spliced out of the
list, items and all (`corpses.js:248-253`, the ONLY corpse-list removal in
the code; burial only sets `buried=true` and keeps the items, and
`recoverBearer` only moves the corpse's node). 107237 had 106 deaths by day
149 — the list was overflowing constantly. **An unrecovered corpse gun has a
~62-day window before the cap can delete it with the body.** No re-grant
followed (no grant after day 149; the village survived to day 151).

So the second-chance answer is no on both counts: no second grant after a
first, and no re-grant after the only loss. One missed prize — or one
unrecovered corpse — is the end of the line on this band.

## 5. S4 + S5 — cells per gun, and the other door

**S4 — cells per gun at grant: exactly 2, every time.** All 5 contest-prize
grants bundled exactly 2 fusion cells to the recipient (`cellsGained` 2,
`cellsAfter` 2, no separate cell prize within ±1 day on any seed). The
GUNRATE bundle works exactly as built, and the redirect works exactly as
built: 4 of the 5 grants were player-won and redirected to the predicted
`_gunRateFighter` pick (gen_r7vo07z, yara_haddad, ingrid_vik, gen_t3ht7kh —
predicted == recipient in all 4); the 5th was won directly by a villager
(caleb_jones, day 114). Every grant is a gun with 2 shots.

**S5 — kill-loot entry: one gun, dry, never fired.** The band's only
kill-loot searcaster is 107237 day 71: amina_diallo's kill drops the gun
straight into her pack (`villagerKillLoot` — no grant row, by design). It
arrives with **0 cells** and the census shows cells 0 for its whole life
(days 71–87 equipped, then on the corpse) — under CELLGATE it could never
have fired. No player-kill corpse drops occurred on the band (the smoke
seed 107222 had one, day 105, never taken); 0 scholar corpse-takes of a
searcaster anywhere on the band.

## 6. Sense-test — the gun arrives as a human moment

Read the full telemetry for seed 107242 around the band's earliest grant
(`scripts/sense-grantrate-a.js`, same env, TELEMETRY_FULL=1; the driver
wraps consume no RNG, so the trajectory reproduces the pilot corpus
exactly). It reads as people, not bookkeeping:

- Day 56: the `beastmaster` contest fires. Day 58 dawn: `contest_end`
  beastmaster **won**; `loot_dropped` searcaster tier 4;
  `broadcast_item_prize` who=player, searcaster, tier 4, beastmaster — the
  gun is won on camera and redirected to gen_t3ht7kh.
- gen_t3ht7kh is a real fighter, not a name on a roster: day 55 night he
  evades a field fight on game_sense + tracker; day 57 dusk he kills
  (vKill) on the same skills; day 58 dusk — the evening he receives the
  gun — he levels combat to 1 and is granted **war_cry**. The redirect
  picked the expedition-active fighter, and the story lands the same day.
- The village around him is alive in the same window: lingering meals
  trading +2 trust both ways with half the village (hassan_ali, carlos_diaz,
  chen_wei, nina_petrova, luis_fernandez), "bled together" trust after the
  day-57 fight. Day 55 hassan_ali won `whoate` and took a tier-3
  harvest_scythe — the prize stream is visibly flowing for other items
  while the gun stays rare.

Sense-test passes. One telemetry-label gap carried to the findings section
(not this arm's scope): `loot_dropped` logs `to: "corpse"` for a contest
prize granted to a villager — `alienLootGrant` labels any recipient with an
`.items` array as a corpse, including a living villager's pack.

## 7. Instrument notes and deviations

- **Smoke catch (Amendment A, before any judged sim):** the first smoke run
  classified the day-105 corpse grant on seed 107222 as caller `other`.
  The player-kill-loot caller is `tbKillRewards`, not `corpseForKill` —
  `corpseForKill` is a sibling call, not an ancestor of the roll/grant, so
  the stack names `tbKillRewards`. Both classifiers gained the branch;
  analyzer S5 counts player-kill corpse grants as kill-loot drops; proof
  test + selftest gained tbKillRewards cases (selftest 20/20, proof test
  39/39). The smoke re-run reproduced the trajectory exactly and resolved
  the cross-check exactly: contest-prize grant day 72 to gen_gmy38x3 (2
  cells bundled) + tbKillRewards corpse drop day 105, never taken —
  matching the vanishcause record.
- **Panel `review_required`:** driven by unobserved metrics, not by any
  observed signal (every observed metric delta 0, no_material_signal).
  Do not read it as a failed guardrail; the guardrail bar is the
  --compare NEUTRAL plus the per-metric no_material_signal verdicts.
  (Compare exit code 2 is the tool's exit for review_required.)
- **Write flap (host):** no write-denial window hit this run's file writes.
  The safe-commit index clobber struck on all three instrument commits
  (staged-as-deleted / MM forms) and was repaired each time with the
  `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`
  pipe, verified by empty status + empty diff HEAD + hash-object match.
- **What was NOT measured:** whether a granted gun is ever FIRED in a fight
  after receipt (the gun's combat value is the gunrate arm's question, not
  this one); table entry/sitting (not instrumented — left null, never
  faked); player deaths per run (not instrumented).

## Metric review (MEASUREMENT.md §14)

- **Bars frozen before any judged sim** (prereg, committed 01f5eb5be ~16:40
  UTC; Amendment A committed 2f8ed2dcf before the pilot): instrument
  validity, coverage, answer quantified, guardrail neutrality. All four
  pass on the judged pilot; no re-scoring, no bar moved after the fact.
- **The static prior held.** The prereg's funnel math (≈3.7% per prize
  roll) predicted the measured 3.0% within noise on 5 events. The metric
  that deserves watching in any follow-up is **tier-4 rolls per prize
  roll (26/164 = 15.9%)** — that is the gate a supply lever must open;
  the pool weight (22.7% measured vs 22.2% expected) is already working
  as built and is not the lever.
- **"Grants per seed" understates gun arrivals by one on this band.**
  The frozen primary counts contest-prize grants (5); a sixth gun entered
  via villager kill loot (107237, amina_diallo, day 71) with 0 cells and
  never fired. A future supply measurement should report gun ARRIVALS
  (contest + kill-loot) alongside contest grants — the kill-loot door is
  real but dry.
- **The loss definition worked, and found a real mechanism.** The
  day-149 loss is a corpse-cap deletion, not a re-grant failure — the gun
  was unrecoverable for 62 days first. The next arm should treat
  corpse-recovery (62 days unlooted) as part of the supply question, not
  just the grant rate.

## Findings (for the coordinator to append to sim-findings.md)

- [open] 2026-11-21 — corpse-cap gun sink — a searcaster on an unrecovered
  corpse is deleted with the body when the 40-corpse list overflows
  (corpses.js:248-253, the only corpse-list removal; 107237: amina_diallo's
  kill-loot gun sat 62 days, deleted day 149, never taken, never re-granted).
- [open] 2026-11-21 — kill-loot guns arrive dry — a villagerKillLoot
  searcaster lands with 0 cells and no bundle (107237: 0 cells for its whole
  life, never fired under CELLGATE); only contest-prize guns get the 2-cell
  bundle.
- [open] 2026-11-21 — `loot_dropped` telemetry mislabels villager prizes —
  `alienLootGrant` logs `to: "corpse"` for any recipient with an `.items`
  array, including a living villager's pack (107242 day 58 grant reads as
  a corpse drop in telemetry while the grant itself is correct).

## Named next lever (NOT built here — separate arm)

**Tier-4 access, not pool weight.** The funnel says the gun is lost at the
tier-4 gate: 26 of 164 rolls reach tier 4, and the pool then pays the gun
at its designed 22%. A supply lever should be judged on tier-4 rolls per
prize roll (15.9% now) and on grants per contest (4.2% now) — not on the
pool weight, which is already at its designed value. Two sub-questions for
that arm: (a) the zero-grant villages split three ways (rolled-and-lost,
thin gate, died-before-the-gate — §2), so a single supply number will hide
which villages it helps; (b) the corpse-recovery window (§4) is a second
supply leak — a gun that arrives and is never recovered is supply that
never reaches a fight. No game fix is owed by this arm: the redirect,
the bundle, the tier-4 gate, and the pool weight all work exactly as built;
the only defects found are in telemetry labeling and in the corpse cap's
interaction with unrecovered guns, both documented above.

## Files

- Prereg: `evidence/2026-11-21/sim-grantrate-a-prereg.md` (01f5eb5be; Amendment A in 2f8ed2dcf)
- Instrument: `scripts/grantrate-driver-a.js`, `scripts/analyze-grantrate-a.js` (selftest 20/20), `scripts/test-grantrate-a.js` (39/39 green), `scripts/build-grantrate-panels-a.js`, `scripts/sense-grantrate-a.js`
- Smoke: `evidence/2026-11-21/perseed-grantrate-a-smoke/` (seed 107222, cross-check exact), `evidence/2026-11-21/grantrate-a-smoke-analysis.json`, `evidence/2026-11-21/grantrate-a-smoke.log/.err`, `grantrate-a-smoke2.log/.err`
- Pilot: `evidence/2026-11-21/perseed-grantrate-a-leg1/` (8 corpora), `evidence/2026-11-21/perseed-grantrate-a-leg2/` (8 corpora), `evidence/2026-11-21/grantrate-a-leg1-analysis.json`, `evidence/2026-11-21/grantrate-a-neutrality.json`
- Panel: `evidence/2026-11-21/grantrate-a-panel.md` (+ `.json`, `-before.json.gz`, `-after.json.gz`)
- Sense: `evidence/2026-11-21/grantrate-a-sense.log` (seed 107242, days 55–60)
- Logs: `evidence/2026-11-21/grantrate-a-leg1.log/.err`, `grantrate-a-leg2.log/.err`

## Run identity

- **Base:** master `abfc8f466`; branch `sim-grantrate-a`; prereg commit `01f5eb5be`.
- **Instrument:** `scripts/grantrate-driver-a.js`, `scripts/analyze-grantrate-a.js`, `scripts/test-grantrate-a.js`, `scripts/build-grantrate-panels-a.js`, `scripts/sense-grantrate-a.js`.
- **Pilot command:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=leg1 OUTDIR=perseed-grantrate-a-leg1 SEEDS=107237,107238,107239,107240,107241,107242,107243,107244 RUN=grantrate-a node scripts/grantrate-driver-a.js` (leg2 identical with MODE=leg2; ~4.2 min leg1, ~3.3 min leg2).
- **Analyze command:** `node scripts/analyze-grantrate-a.js --dir evidence/2026-11-21/perseed-grantrate-a-leg1 --out evidence/2026-11-21/grantrate-a-leg1-analysis.json` → verdict DIAG-GO, exit 0.
- **Compare command:** `node scripts/analyze-grantrate-a.js --compare evidence/2026-11-21/perseed-grantrate-a-leg1 evidence/2026-11-21/perseed-grantrate-a-leg2 --out evidence/2026-11-21/grantrate-a-neutrality.json` → NEUTRAL, 0 mismatches, exit 0.
- **Panel command:** `node scripts/build-grantrate-panels-a.js && node scripts/balance-panel.js compare --before evidence/2026-11-21/grantrate-a-panel-before.json.gz --after evidence/2026-11-21/grantrate-a-panel-after.json.gz --out evidence/2026-11-21/grantrate-a-panel` → review_required (unobserved metrics), all observed deltas 0.
- **Proof test:** `node scripts/test-grantrate-a.js` → 39/39 green, exit 0. **Selftest:** `node scripts/analyze-grantrate-a.js --selftest` → 20/20 green, exit 0.
