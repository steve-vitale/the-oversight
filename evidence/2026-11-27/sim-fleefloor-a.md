# sim-fleefloor-a — EVIDENCE (adoption / completion)

**Arm:** sim-fleefloor-a · **Loop run:** fleshout-20261128T0015Z, adopted and
completed by Loop A run fleshout-20261128T0315Z · **Axis:** scale-onramp
**Branch:** `sim-fleefloor-a` · **Worktree:** `~/workspace/worktrees/sim-fleefloor-a`
**Type:** BUILD — default-OFF lever, pilot (8 seeds, before/after on identical seeds)
**Finding:** #2602, "WINNABLE FIGHTS END ON THE FLEE CALL, NOT ON DAMAGE"
**Prereg:** `evidence/2026-11-27/sim-fleefloor-a-prereg.md` (committed f631b54a4,
frozen 01:07Z, BEFORE any judged sims)
**Base at freeze:** worktree HEAD `4504aa4d4`. Adopted at master tip `fb6c383fb`
(Loop B reunionwild2-b evidence); rebased onto it before commit (see §7).
**Verdict: NO-GO (primary + vDie) — kill taxonomy METRIC-BROKEN.**
The override mechanism is proven (proof test 51/51) but the pilot population
it was built to convert does not exist on this band: 0 floor-branch flees
with the monster within one round of death, on either leg, in 37 fought
expedition wave-4+ meetings — and 0 holds fired in any of the 177 recorded
wave-4+ fights. The bar assumed a floor population the brief misattributed
to the floor (prereg §0a/§0b). Per kill protocol the game-code change is
REVERTED; the proof test and instruments are kept as the mechanism record.

## §1. Prereg header (frozen)

- **Lever:** `FLOORFINISH=1` (env flag, default OFF). In `src/js/fieldFights.js`,
  inside the bravery-floor branch (`if ((vHp / vHpMax) < fleeAt)`, the "past
  holding" flee), non-sealed path only, before the flee decision: when the
  lead monster is within one round of the party's live damage rate
  (lead-monster HP <= `rec.mDealt / round`, dpr > 0), the floor does not fire
  — the party holds for the killing strike(s). Logs "(Finish the kill)" once
  per fight, counts `rec.floorFinishHold`. No RNG drawn. Committed-finish 40%
  floor, hopeless branch, learn-first withdrawal, death, signature exits,
  sealed arenas untouched. Wave-agnostic by spec.
- **Primary metric:** armed wave-4 vKills across the 8-seed band (expedition-
  origin wave-4+ fieldFight outcomes, `vKill`).
- **GO threshold (ALL must hold):**
  1. Armed wave-4 vKills >= 2 across the band (baseline 0 expected).
  2. Floor-flees with the monster within one round of death drop to 0
     (baseline -> armed 0; if baseline is 0, vacuous — reported as such,
     never as a pass earned).
  3. Cost bar clean: extra villager combat deaths (vDie on expedition wave-4+
     fights) <= control + 1, starvation deaths <= control + 2, median survival
     >= 0.8x control.
- **Secondaries:** finish-override fires (`floorFinishHold` total), damage in
  held rounds, hopeless/floor variant split, within-one-round share, wave-5
  unlocks, national / table / wins, community lost.
- **Horizon:** 150d, death-aware (stop on village-lost + 10d tail max).
- **Seeds:** 112301–112308 (exact literals, fresh band per prereg §2).
- **Policy:** competent verbatim (`scripts/policies/competent.js`), both legs.
- **Substrate (both legs):** `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1
  FLEEREPAIR2=1 FIGHTALLY2=1`. Carriers `FIELDCAPDMG` / `RAGEFREE` /
  `FREESTRIKE` OFF; `FLEEGUARD` / `DOORFLEE2` / `HYPOFLOOR` / `SPEARGATE` /
  `BOWOPEN` OFF. Arm leg adds `FLOORFINISH=1` only.
- **Staging:** smoke (2 seeds) then pilot (8 seeds both legs). No confirm
  spend without a pilot GO.
- **Canon:** no canon doc covers the flee call or the floor rule (verified
  this run: `docs/MONSTER-WAVES.md` has no flee/floor section — its only
  "floor" hits are day/scale floors in the unlock gates, a different
  meaning). Flee mechanics live in `fieldFights.js` comments and the
  fleecall-b evidence; this arm invents no canon.

## §2. Verdict table (judged ONLY against the frozen bars)

| Bar (frozen, prereg §2) | Control | Armed | Result |
|---|---|---|---|
| Pool floor: >= 10 fought expedition w4+ meetings per leg | 17 | 20 | PASS |
| (1) Armed wave-4 vKills >= 2 | 0 | **0** | **FAIL** |
| (2) Floor-flees within one round -> 0 | 0 | 0 | PASS — VACUOUS (baseline pool is 0) |
| (3a) vDie (expedition w4+ meetings) <= ctl + 1 | 2 | **4** | **FAIL** |
| (3b) Starvation deaths <= ctl + 2 | 0 | 2 | PASS |
| (3c) Median survival >= 0.8x ctl | 150d | 150d | PASS |
| Instrument health | — | — | PASS (0 parse errors, 0 leg errors, fieldSha same across legs; selftest 20/20, determinism 8/8 byte-identical, proof 51/51) |

**Verdict: NO-GO (primary + vDie).** Kill taxonomy METRIC-BROKEN (prereg
§0b, anticipated): the bar assumed a floor-within-one-round population the
record does not show — 0/14 in the pre-pilot probe corpora, 0/37 meetings on
this fresh band. The override mechanism itself is proven by the proof test;
it simply has no wave-4 fights to act on here.

## §3. Before / after numbers (identical seeds 112301–112308, 150d, competent)

Analyzer: `scripts/analyze-fleefloor-a.js` →
`evidence/2026-11-27/fleefloor-a-analysis.json`.
Corpus: `evidence/2026-11-27/perseed-fleefloor-a-ctl/` and
`perseed-fleefloor-a-arm/` (8 files each); determinism re-run corpus
`perseed-fleefloor-a-ctl-rerun/` (8 files, byte-identical — see §6).

| | Control | Armed |
|---|---|---|
| Fought expedition w4+ meetings | 17 | 20 |
| Wave-4 vKills (primary) | 0 | 0 |
| vFlee (meetings) | 11 | 13 |
| vDie (meetings) | 2 | 4 |
| Variants: hopeless / floor / learn / committed-floor | 8 / 3 / 0 / 0 | 9 / 4 / 0 / 0 |
| Floor flees within one round of death | 0 | 0 |
| Any flee within one round of death | 0 | 0 |
| `floorFinishHold` fires (all 177 recorded w4+ fights) | 0 | **0** |
| Starvation deaths (total / villager) | 0 / 0 | 2 / 1 |
| Median survival | 150d | 150d |
| Wave 4 reached | 8/8 | 8/8 |
| Wave 5 reached | 3/8 | 3/8 |
| National / table / wins | 0 / 0 / 0 | 0 / 0 / 0 |
| Community lost | 2/8 | 2/8 |
| Total deaths (all causes, all seeds) | 765 | 730 |

Per-seed wall numbers (days / end / standing / scale / maxWave):

| Seed | Ctl | Arm |
|---|---|---|
| 112301 | 150d survived, 195, regional, w4 | 150d survived, 195, regional, w4 |
| 112302 | 150d survived, 485, regional, w5 | 150d survived, 485, regional, w5 |
| 112303 | 103d village-lost, 175, regional, w4 | **84d village-lost, 125, regional, w4** |
| 112304 | 150d survived, 515, regional, w5 | 150d survived, 515, regional, w5 |
| 112305 | 150d survived, 199, regional, w4 | 150d survived, 199, regional, w4 |
| 112306 | 150d survived, 199, regional, w4 | 150d survived, 199, regional, w4 |
| 112307 | 150d survived, 425, regional, w5 | 150d survived, 425, regional, w5 |
| 112308 | 147d village-lost, 199, regional, w4 | **79d village-lost, 199, regional, w4** |

Six of eight seeds are identical between legs (same days, standing, wave,
death counts). Two diverge — 112303 and 112308 — and the divergence is
explained in §4. It is NOT wave-4 lever effect: the override never fired in
a recorded wave-4+ fight on either diverged seed.

### Wall numbers (scale-onramp axis)

National 0/8, table 0/8, wins 0/8, wave-4 unlocks 8/8, wave-5 unlocks 3/8,
median survival 150d, community lost 2/8. The scale wall stands: villages
reach wave 5 and survive to day 150 at regional standing (best 515) and never
touch national. Four of eight villages sit at exactly standing 199 for the
back half of the run (112301, 112305, 112306, 112308, both legs) — the same
standing-199 stall Loop B's fleerepair-b reports on this same band
(`evidence/2026-11-28/sim-fleerepair-b.md`); corroboration, not a new
finding.

## §4. Why the two seeds diverged (diagnostic, not a re-score)

A flag that never fires in wave-4+ fights cannot change a wave-4 fight — so
the 112303/112308 divergence had to come from somewhere the corpus does not
record: wave 1–3 fights, where the override is also live (wave-agnostic by
spec). A diagnostic probe (`/tmp/fleefloor-diag.js`, same harness/policy/
substrate, FLOORFINISH=1, fieldFight wrapped for ALL waves) confirms it:

- **112303:** exactly 1 hold — day 17, wave-1 nightcourt. The party held,
  fought one more round, and still fled (vFlee, 2 rounds). One extra round
  of RNG consumption was enough to send the village down a different path:
  arm 32 recorded w4+ fights vs ctl 1, village lost day 84 vs 103.
- **112308:** 4 holds, all waves 2–3 — day 22 bright_idea (vKill), day 42
  landlord (**vDie — the hold itself got a villager killed**), day 66
  focus_group (vKill), day 67 giant_mosquito (vKill). The day-42 death
  cascades: the arm leg's 3 extra vDie meetings (reunion day 53, reunion
  day 72, audit day 76) all sit on the diverged trajectory, and the village
  dies day 79 vs ctl 147.
- **112304 (control seed, identical legs):** 0 holds — and the legs match
  exactly. Consistent: no hold, no divergence.

So the vDie bar failure (arm 4 vs ctl 2) is real under the frozen bars — the
lever, as specified wave-agnostic, costs lives on low waves — but it is NOT
wave-4 cost. The cost is butterfly divergence from low-wave holds, one of
which directly killed. The primary failure is cleaner: at wave 4 the monster
is never within one round. Look at the flee table: fleeing parties leave the
monster with 489–1,449 HP standing while dealing 11–107 damage a round. The
damage regime at wave 4 is so far from one-round kills that the floor
override has nothing to convert — the flees that do happen end with the
monster at 5–15 rounds of health, not one.

## §5. Metric review

The metric was wrong in the way the prereg anticipated (§0b), and the pilot
confirms it on a fresh band:

1. **The primary bar assumed a population that does not exist.** Armed
   wave-4 vKills >= 2 requires floor-branch flees with the monster within
   one round — 0 in the 16-seed probe, 0 in 37 fresh meetings, 0 holds in
   177 recorded wave-4+ fights. The bar cannot pass on any band where the
   damage regime holds, because wave-4 monsters carry 500–1,400 HP against
   parties dealing ~40–100/round. The telling fight's geometry (monster at
   58 HP) was a hopeless-branch end, not a floor end (§0a) — the brief's
   premise was misattributed from the start.
2. **The cost bar conflates lever cost with butterfly divergence.** vDie is
   counted on expedition wave-4+ meetings, but the arm's extra deaths sit
   downstream of low-wave holds on diverged trajectories (see §4). A cost
   bar that cannot tell "the hold killed someone" from "a hold three weeks
   ago changed which fights happened" will fail arms for the wrong reason.
3. **Proposed revision for the NEXT run (not re-scored here):** if the floor
   idea is ever revisited, (a) gate the override to wave >= 4 — the
   measured population — so low-wave holds stop paying butterfly costs;
   (b) judge cost only on fights where the hold actually fired (held-fight
   outcomes vs their same-seed control), not on band totals; (c) set the
   primary bar on the hold population itself (holds -> kills conversion),
   which is measurable even when the population is small. None of this
   changes this run's verdict.

## §6. Instrument health

- **Proof test** `scripts/test-fleefloor-a.js`: **51 passed, 0 failed** (run
  2026-11-28 ~03:40Z, pre-revert). §1: 6/6 staged floor-within-one-round
  flees convert to vKill when armed, round-1 strikes identical, hold line
  exactly once; floor-far seed armed == control. §2: off-mode byte-identical
  on all 30 staged fights vs frozen pre-change records. §3: hopeless flees
  armed == control on 8/8 seeds. §4: driver smoke clean (seed 112301, 30d,
  0 errors, `floorFinishHold` numeric on every v4 row). §5: base gates
  `test-fleeguard-b.js` and `test-fleecall-b.js` green.
- **Analyzer selftest:** 20/20.
- **Determinism:** control leg re-run (8 seeds, flag unset) byte-identical
  to the judged control corpus on all 8 seeds (`cmp` clean). The harness is
  deterministic; the arm-leg divergence is lever-caused (§4), not noise.
- **Balanced panel (§15):** `scripts/balance-panel.js` compare attached —
  `evidence/2026-11-27/fleefloor-a-panel.md` (+ `.json`, before/after
  `.json.gz`). Decision **review_required**, driven by one line only:
  village deaths per 100 calendar days, paired delta +8.72 (CI 0 to 21.56),
  `regression_watch` — the two diverged seeds dying earlier (§4). Every
  other metric: no_material_signal. Wins / national / table: 0 both legs.
- **Adoption state verified at start:** prereg committed f631b54a4; the
  uncommitted `fieldFights.js` diff (+48 lines) matched prereg §1 exactly
  (verified line by line; one stale comment fixed — it framed the telling
  fight as a floor case, corrected to the §0a hopeless-branch reading);
  no judged corpus existed (fresh pilot run). Smoke (2 seeds, both legs)
  clean, 0 errors; one operator slip on the first smoke invocation
  (OUTDIR passed as a relative path, so files landed one directory too
  deep) — corrected by moving the four files, no data lost, pilot run with
  the correct bare dir name.

## §7. Kill protocol and landing

- **Game code reverted:** `src/js/fieldFights.js` restored to the prereg
  state (uncommitted change discarded; `git diff` empty against HEAD after
  the revert). No trace of the lever remains in game code.
- **Proof test kept** (`scripts/test-fleefloor-a.js`) as the mechanism
  record: it passed 51/51 while the lever was in place. It is NOT wired
  into `check.js` / `green-list.txt`, so it cannot break the build — but
  note it will fail §0 if re-run now, by design: the gate it asserts is
  gone with the lever. The driver (`scripts/fleefloor-driver-a.js`) likewise
  refuses to run without the lever present; the corpus is frozen evidence.
- **Committed (this commit):** evidence file + analysis JSON + panel files +
  three per-seed corpora (ctl, arm, ctl-rerun) + driver + analyzer + panel
  builder + proof test. No game-code change. No `[needs-eyes]` (killed arm,
  nothing for Steve to playtest).
- **Rebase:** NOT DONE — the coordinator ordered wrap-up before the rebase
  (master tip `fb6c383fb` at adoption; branch base remains `4504aa4d4` with
  prereg `f631b54a4` on top). The coordinator merges; it must rebase or
  verify the base first.
- **check.js --quick:** NOT OBTAINED — started after the revert but still
  running under heavy load (load avg ~9, Loop B live) when the coordinator
  ordered wrap-up; the process was stopped and no green result was
  recorded. The reverted tree is byte-identical to the prereg state in
  `src/js/` and adds only new `scripts/` + `evidence/` files, none of which
  are wired into `check.js` / `green-list.txt`.
- **Proof-test re-run post-rebase is N/A** — the lever is reverted by design
  (see above).
- **Convergence state:** killed-at-pilot (metric-broken). The floor branch
  is not a live lever on this band; the hopeless branch remains the flee
  problem, and it is fleeguard territory, already built and landed.

## §8. Village assessment (plain words)

Eight villages, all competent, all fed well enough to reach the wave-4
fights — and none of them can kill a wave-4 monster in the open. The
fights read like a mismatch the villagers cannot see: a party walks up to
a Reunion with 1,300 health, lands honest hits for thirty-odd damage, calls
for help, watches a friend charge in and die in three rounds, and runs.
They are not cowards and they are not stupid — the numbers simply do not
add up, and the flee call is the only honest move left. The villages that
survive do it by enduring, not by winning: six of eight are still standing
at day 150, at regional rank, with standing stuck at 199 or 425 or 515 —
strong enough to live, nowhere near strong enough to matter. The two that
die, die the same way they always do: a bad stretch of fights in their
seventh and twelfth weeks, and then the roster thins past recovery. What is
missing is not courage at the flee — it is damage. Until a wave-4 hunting
party can take a real chunk out of a monster's health in a single fight,
no flee-rule tweak will convert anything, because there is nothing within
one round of death to convert. The blank this run fills is a negative one,
and it is worth having: the floor is exonerated. The fights end on the
hopeless read and on damage, not on the floor — stop tuning the floor.

## §9. Sense-test read (transcripts)

Read from the pilot corpus (arm 112308 reunion deaths; ctl 112306 hopeless
flee). The narration is coherent and human: help is shouted for and arrives,
a war cry buys a breath, field medicine binds a wound mid-fight, the
hopeless line lands after five losing rounds. Two observations:

- The Reunion fights are honest about the mismatch: "walks straight into
  The Reunion. No avoiding it." — then three rounds and a death. The
  narration never pretends the fight was close.
- One oddity, filed to `sim-findings.md`: the Reunion's attack is logged as
  "Your Move hits Ashley for 32" — a move name that reads like a UI label
  leaking into the story. In a villager's fight log it looks like the game
  is talking to the wrong person. Minor; the hopeless-flee log's "Ratio
  hits Carlos" reads fine by comparison.
- No robotic repetition, no static dialogue, no villager standing still
  while the world burns. The transcripts read like people losing fights
  they should not have taken.
