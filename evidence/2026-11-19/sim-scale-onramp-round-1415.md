# sim-scale-onramp-round-1415 — bow supply chain round evidence

Run fleshout-20261119T1415Z, Loop A (axis scale-onramp). Adoption closeout
by the coordinator's adoption worker (run timed out at closeout; the host
write flap ~15:47–16:13Z blocked git refs, so all three arms were complete
but uncommitted — each arm was finalized and re-verified by a dedicated
worker before landing; nothing below is taken from the timed-out run's word).

Master at adoption: `1927a245e` (Loop B 1230Z adoption closeout). Master
moved during the adoption (journey-scale r245 landed `0aa413222`); all
three branches were rebased onto `0aa413222` before merging. Final master
tip after the three merges: `1404e2e9a` (bowcraft evidence). Round evidence
commit: this file + gate log (see §7).

## Arms

### 1. sim-bowcraft-a — BUILD-GO (finding #2597 FIXED on the pilot band)

Fix: `src/js/villager-build.js` (commit `ef1c81094`, rebased from
`cb8dec615`), env-gated `BOWCRAFT` — serve ranged-less villagers for
the bow rungs + seed bow knowledge from seeing an equipped bow at home.
Off path is byte-identical old duty (verified by the finalize worker).
Evidence: `evidence/2026-11-19/sim-bowcraft-a.md` (master `1404e2e9a`).
Proof test 58/58, analyzer selftest 30/30 (re-run green on the rebased
tip).

Frozen bars, identical seeds 107001–107008 (bowsource band), 8 seeds/leg:

| Bar | Result |
|---|---|
| Craft attempts (bow rungs) arm ≥ 3 | Arm **47** (ok 13, fail 34) vs ctl 0 — PASS |
| Bows crafted arm ≥ 3 | Arm **13** vs ctl 0 (crude_bow 10, bow 3, 13 distinct crafters) — PASS |
| Bowless departure share, arm < ctl by ≥ 0.05 | Ctl 0.795 (128/161) → arm 0.732 (120/164), delta **0.063** — PASS (thin) |
| No-regression | Median survival 143 → 150d; starvation 2 → 0; deaths/seed 72.0 → 74.9 (bar ≤ 79.2) — PASS |

Wall movement (observed, NOT a causal claim — n=8, the arm was not
designed to attribute wave-5 unlocks): wave-5 unlocks 0/8 ctl → **4/8
arm**; community loss 6/8 → 2/8; standing breaks past 199 on four arm
seeds (max 445); national 0/8, table 0/8, wins 0/8 both legs.

**Lever lands env-gated OFF.** The BOWCRAFT turn-on decision is owed
separately — it is NOT made here.

**Confirm leg OWED.** The prereg gates a confirm on the pilot passing,
and it did — fresh band **107011–107018**, 8 seeds/leg. The band is
still fresh (re-grepped by the finalize worker: only the prereg names
it). The confirm is the replication test for the thin bar-3 delta
(0.063) and the wave-5 wall movement. It must run (or be waived in
writing) before any BOWCRAFT turn-on decision.

Secondary attribution bar missed as measured (arm 0.719 < 0.90) on a
proven analyzer window artifact — 12 of 18 unexplained are ok crafts
first seen in the D+1 census row; diagnostic recomputation with the
window fixed gives 0.9375. Frozen analyzer NOT re-scored; the fix is
finding #2609, for the next run. Craft narration unverified in live
play (fires only when the scholar is home; sim scholar usually away)
— needs a live playtest with the scholar home, not this arm.

### 2. sim-fusioncell-a — DIAG-GO (finding #2599 ANSWERED)

Evidence: `evidence/2026-11-19/sim-fusioncell-a.md` (master
`338d3fe6f`). Proof test 40/40, analyzer selftest 27/27 (re-run green
on the rebased tip; re-aggregation from the raw corpus by an
independent script confirms every number). Evidence-only: zero `src/`
changes.

- chen_wei carried a searcaster 97 days with zero fusion cells on
  every one. 3 fusion cells band-wide, ALL contest prizes (max 1 per
  holder), 0 from kill loot / show gifts / trade / corpse takes /
  crafts / recipes / ruin salvage / pile stock.
- 4 searcaster grants band-wide, all contest prizes (1 to chen_wei,
  3 to the scholar's pack). Volley-opportunity pool 0: the searcaster
  holder never met a wave-4+ monster; the only cell holder who did
  has no cell-weapon. Expected armed volley ≈ 98 damage (7–12% of a
  wave-4 monster).
- Attribution 3/3 (1.000), coverage 8/8. The instrument was repaired
  mid-run (v1 → v2: grant wraps on `alienLootGrant`, contest-prize
  and corpse-take context) under a prereg amendment before any judged
  verdict — the v1 attribution miss (0/2) was an instrument defect,
  not a metric defect.
- Panel compare regenerated after the flap (was 0 bytes): 31 metrics,
  0 non-zero deltas, decision `review_required` (8-case pilot
  screen). Note: the frozen evidence text still says in §10/§13 that
  the panel compare is "pending flap" — the panel is in fact
  regenerated and committed alongside it.
- Next arm (fix, NOT built here): put cells in searcaster holders'
  hands — a design call between raising the contest-prize tier-4 cell
  weight (or a dedicated cell prize) vs alien-side ruin salvage for
  cells. Cells are alien tech, so the source must be alien-side,
  never a village craft. The fix arm must prove, on a panel, a
  searcaster holder with cells actually firing a volley in a wave-4+
  fight. Do not fold into bow/arrow work — different supply chain.

### 3. sim-slingstone-a — DIAG-NO-GO (finding #2600 ANSWERED, narrowed)

Evidence: `evidence/2026-11-19/sim-slingstone-a.md` (master
`ac764b16c`). Proof test 41/41, analyzer selftest 27/27 (re-run green
on the rebased tip; fresh analyzer run reproduces the analysis JSON
byte-for-byte). Evidence-only: zero `src/` changes.

- The drain is the volley: 47 of 60 drained stones (78.3%, majority
  cause). Craft takes exactly 0 in 1,029 duty-days per duty
  (weapon/ammo/armor/gear) — the weapon-craft candidate is dead twice
  over (code-excluded AND instrument-proven). Gear 0, loot 0.
- Frozen verdict DIAG-NO-GO: completeness 0.783 < 0.90 (13 residual
  stones: 9 same-day ordering artifact + 4 same-day-death analyzer
  edge — an instrument story, not a game drain; sensitivity note shows
  the corrected books close exactly, volley 95.9%) and drain pool 18
  < 25. The NO-GO is carried by the thin pool, not by the residual.
- The deeper shape: only 2/8 seeds' carriers ever depart (22
  departures, 55 stones); the other six seeds' carriers fight at home
  with empty pouches because the top-up happens ONLY at departure.
  One villager departs 16× in 104 days; a second 6×; the rest 0×.
- 16 sealed-arena sling fights, all with ammoAtEntry 0 — contestants
  are never pocketed for; whether the arena should arm its fighters
  is a design question for the contest line, named not built.
- Next arm (named precisely): **sim-slingstone-b** — DIAG re-run on
  the same band with the census-epoch instrument (stamp every
  fight/departure/duty row with the last census day seen; death
  lookup `>=` the last census day) and judge on the same frozen bars.

## Scale-onramp wall numbers (all three bands)

| | bowcraft ctl | bowcraft arm | fusioncell | slingstone |
|---|---|---|---|---|
| National | 0/8 | 0/8 | 0/8 | 0/8 |
| Table / wins | 0/8 | 0/8 | 0/8 (table null) | 0/8 (table null) |
| Wave 4 | 8/8 | 8/8 | 8/8 | 8/8 |
| Wave 5 | 0/8 | **4/8** | 2/8 | 2/8 |
| Median survival | 143d | 150d | 143.5d | 143.5d |
| Community lost | 6/8 | 2/8 | 4/8 | 4/8 |

The bowcraft arm is the first lever in this program to move the wall
numbers downstream of the wave-4 link on identical seeds — but the
seat is still nowhere in sight on either leg, and the movement is
observed, not attributed. The confirm leg decides whether it
replicates. Scale-onramp stays converging (NOT converged).

## Findings filed / updated

- **#2597 FIXED** (bowcraft-a, BUILD-GO, pilot band 107001–107008):
  BOWCRAFT fix — serve ranged-less villagers for the bow rungs + seed
  bow knowledge from seeing an equipped bow at home. Attempts 0 → 47,
  bows 0 → 13, bowless share 0.795 → 0.732 (delta 0.063, bar ≥ 0.05).
  No regression (median survival 143 → 150d, starvation 2 → 0).
  Confirm leg (fresh band 107011–107018) NOT run — owed before any
  turn-on decision.
- **#2599 ANSWERED** (fusioncell-a, DIAG-GO): cells reach holders
  only as rare, random contest prizes; the prize system never puts a
  cell in the same hands as the gun before a fight that matters.
  Fix arm named (alien-side cell supply, design call) — NOT built.
- **#2600 ANSWERED, narrowed** (slingstone-a, DIAG-NO-GO): drain is
  the volley (78.3%); craft takes 0 in 1,029 duty-days; carriers
  almost never depart — top-up only at the door. Next arm
  sim-slingstone-b (census-epoch instrument) named.
- **#2608 NEW — census-boundary attribution artifact (instrument,
  sim-slingstone-a).** The daily census fires mid-day
  (`policy.daily`'s finally block) while fights stamped the same game
  day can fire after the snapshot, so a fight's spend lands in the
  wrong ledger interval. Signature: exact ± pairs on adjacent
  intervals (9 stones here, net 0). Any ledger that joins
  day-stamped events to day-stamped censuses needs a census epoch on
  the event rows, not just the day. Next arm: sim-slingstone-b.
  Affects any future per-villager ledger built on this census
  (arrows, bows, medicine).
- **#2609 NEW — analyzer gap-window off-by-one (sim-bowcraft-a).**
  The attribution gap window `(prevRowDay, rowDay]` excludes events
  dated prevRowDay, but the live census row for day D is taken before
  the day-D duty runs, so a craft or loot event on day D first
  appears in the D+1 row and can never be attributed. Misattributes
  12 crafts + 2 loot drops on the arm leg (2 loot on ctl).
  Proposed fix for the next run: window `[prevRowDay, rowDay]` —
  verified by diagnostic recomputation (arm completeness 0.719 →
  0.9375, ctl 0.930 → 0.977, verdict unchanged). Same underlying
  cause as #2608 (day-stamped events vs day-stamped census);
  different instrument, different fix.
- **#2610 NEW — wave-5 door opened on the arm leg
  (sim-bowcraft-a, observed not attributed).** Wave-5 unlocks 0/8 ctl
  → 4/8 arm on identical seeds; community loss 6/8 → 2/8; standing
  breaks past 199 on four arm seeds (max 445). The arm was not
  designed to attribute wave-5 unlocks and n=8, so this is wall
  movement to be tested by the confirm leg, not a causal claim. Do
  not cite it as "bows unlock wave 5" until the confirm replicates
  it.
- **#2611 NEW — sling departures concentrate on expedition regulars
  (sim-slingstone-a).** One villager departs 16× in 104 days; a
  second 6×; the other six seeds' sling carriers depart 0× in 150
  days. Stone supply is not village-wide — it is two restless
  people. A fix arm that arms slings at home (not only at departure)
  would change the other six seeds, not these two.
- **#2612 NEW — contest blood fights enter with empty pouches
  (sim-slingstone-a).** 16 sealed-arena sling fights, all with
  ammoAtEntry 0 (0 shots, honest). Contestants are never pocketed
  for — the departure top-up serves expeditions, not the arena.
  Whether the arena should arm its fighters is a design question
  for the contest line, named here not built here.

## Telemetry

All three arms' telemetry checks refused recorder corpora verbatim
(same documented refusal as bowopen/arrowsupply/bowsource). No LOUD
lines; baseline NOT rolled (same anchorCommit mismatch as the 1215Z
round — still uninvestigated).

## Gate

`node scripts/check.js --quick` solo on the merged tip `1404e2e9a`
(log `evidence/2026-11-19/check-quick-round-1415.log`): **339 passed,
5 failed in 796s, 0 attributable.**

- `test-measurement-proof-update.js` + `test-measurement-workflow.js`
  (retained neutrality proof) — the standing measurement-proof
  staleness pair: `src/js/villager-build.js` changed, so the retained
  proof is stale until re-baselined. Pre-existing class, not caused by
  the arms' content.
- `test-living-garden-deed-attainment.js` + `test-one-person-army-deed-attainment.js`
  — 120s timeouts under load; both solo-verified green this run
  (living-garden 8/8, one-person-army 7/7).
- `test-phone-frame-proof.js` — stale receipt (pre-existing).

This run changed one `src/` file (villager-build.js, env-gated
BOWCRAFT, off path byte-identical). Proof refresh for the
measurement-proof pair is still owed (same follow-up as r147 / r238).
