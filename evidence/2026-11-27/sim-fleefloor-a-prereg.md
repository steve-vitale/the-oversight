# sim-fleefloor-a — PREREG (frozen before any judged sim)

**Arm:** sim-fleefloor-a · **Loop run:** fleshout-20261128T0015Z · **Axis:** scale-onramp
**Branch:** `sim-fleefloor-a` · **Worktree:** `~/workspace/worktrees/sim-fleefloor-a`
**Type:** BUILD — default-OFF lever, pilot (8 seeds, before/after on identical seeds)
**Finding:** #2602, "WINNABLE FIGHTS END ON THE FLEE CALL, NOT ON DAMAGE"
**Base at freeze:** worktree HEAD `4504aa4d4` (master tip at run start; verify at commit time)

## §0. Question

The floor flee ends fights when the leader is low HP even when the monster
is nearly dead. Design a "finish the kill" override: when the monster is
within one round of live party damage (monster HP <= one round of live
party dpr), the floor does not fire — the party gets its killing strike(s)
instead of fleeing. Locate the floor rule in `src/js/fieldFights.js` (the
"past holding" / low-HP branch cited in fleecall-b) and implement as a
default-OFF env flag (`FLOORFINISH=1`), off-mode byte-identical. Keep the
change minimal, adjacent to the floor branch only, flag-gated, no other
behavior change.

**Prior art read first:** `evidence/2026-11-24/sim-fleecall-b.md` (DIAG-GO:
20 fled launched fights, 11 hopeless / 9 floor, 1/20 within one round),
`evidence/2026-11-24/sim-fleeguard-b.md` (the hopeless guard is ALREADY
BUILT AND LANDED, default OFF — it NEVER touches the floor; this arm does
NOT rebuild it), `evidence/2026-11-27/sim-partydmg-a.md` (the telling
fight: 15 rounds vs a Suburb, 1,387 damage dealt, fled at 58 monster HP
with the leader at 23 HP).

## §0a. CORRECTION — the telling fight ended on the HOPELESS branch, not the floor

Verified 2026-11-27 in the partydmg-a corpus
(`evidence/2026-11-27/perseed-partydmg-a-arm/partydmg-a-s112103-partydmg-a-arm.json`,
seed 112103 day 99, Suburb, 15 rounds, vFlee): the last log line is
"Mateo sees how this ends — and runs while running still works." That is
the hopeless-and-alone branch, NOT the floor branch ("past holding").
The brief's "a winnable fight ended by the floor" is corrected: the fight
ended on the low-HP flee rule's hopeless branch. With FLEEGUARD OFF in
this arm's substrate (see §1), the floor override does NOT change that
fight's outcome. This arm measures floor-branch ends only ("past
holding"), per its brief. The hopeless branch is the fleeguard's
territory, already built and landed.

## §0b. Pre-pilot pool probe (§14b pool sizing — run BEFORE freezing the bar)

The convertible pool for this arm is baseline floor-branch flees with the
monster within one round of live party damage. Probed on the two existing
corpora (variant from the log line, monster-HP-left = mHpStart − mDealt,
dpr = mDealt / rounds, within-one-round = HP-left <= dpr at the flee
round — the flee round IS the floor moment, so this is exact, not an
approximation):

| Corpus (substrate) | Fled exp. w4 | Floor | Floor within 1 rd | Any within 1 rd |
|---|---|---|---|---|
| fleeguard-b ctl (this arm's exact baseline substrate) | 24 | 11 | **0** | 1 (hopeless) |
| partydmg-a arm (SPEARGATE+BOWOPEN substrate) | 16 | 3 | **0** | 1 (hopeless, the telling fight) |
| **Pooled** | **40** | **14** | **0** | **2 (both hopeless)** |

The pool is ZERO on 16 seeds of measured evidence. The GO bar below
(§2) therefore assumes a population the record does not show, on a
fresh band. The pilot tests whether the fresh band differs. If the
pilot pool is ~0, the verdict is NO-GO and the kill taxonomy is
METRIC-BROKEN (the bar assumed a floor population the brief
misattributed to the floor — see §0a), not CONCEPT-DEAD: the override
mechanism itself is proven by the proof test (§4), it simply has no
fights to act on in this band. This probe is recorded before any judged
sim runs, so a ~0 pilot result is a finding, not a surprise.

## §1. Lever

`FLOORFINISH=1` (env flag, default OFF — off-mode byte-identical).
In `src/js/fieldFights.js`, inside the bravery-floor branch
(`if ((vHp / vHpMax) < fleeAt)`, the "past holding" flee), in the
non-sealed path only, before the flee decision: when the lead monster
is within one round of the party's live damage rate (lead-monster HP
<= `rec.mDealt / round`, with `rec.mDealt / round > 0`), the floor
does not fire — the party holds for the killing strike(s). Logs
"(Finish the kill)" once per fight, counts `rec.floorFinishHold`.
The hold draws no RNG. The committed-finish 40% floor above it (line
~2783, "past holding even a finished fight") is a separate branch and
is NOT touched. The hopeless branch, learn-first withdrawal, death,
signature exits, and sealed arenas are untouched. A party whose
monster is more than one round away flees exactly as before.
No wave gate: the rule as specified is wave-agnostic (unlike the
fleeguard's wave>=4 gate, which was specific to its measured band);
the pilot population is expedition wave-4+ fights, and any wave 1–3
effect is out of the pilot's scope and reported as such if observed.

**Canon:** no canon doc covers the flee call or the floor rule
(CANON.md manifest lists no flee doc; `docs/MONSTER-WAVES.md` has no
flee/floor section — the only "floor" hits are day/scale floors in the
unlock gates, a different meaning). The flee mechanics live in
`fieldFights.js` comments and the fleecall-b evidence; this arm
invents no canon.

## §2. Pre-registration (frozen)

- **Primary metric:** armed wave-4 vKills across the 8-seed band
  (expedition-origin wave-4+ fieldFight outcomes, `vKill`).
- **GO threshold (ALL must hold):**
  1. Armed wave-4 vKills >= 2 across the band (baseline 0 expected).
  2. Floor-flees with the monster within one round of death drop to 0
     (baseline count -> armed count 0; if the baseline count is 0, this
     bar is vacuous and is reported as such, never as a pass earned).
  3. Cost bar clean: extra villager combat deaths (vDie on expedition
     wave-4+ fights) <= control + 1, starvation deaths <= control + 2,
     median survival >= 0.8x control.
- **Secondaries (reported, never re-scored into the verdict):** count
  of finish-override fires (`floorFinishHold` total), damage dealt in
  held rounds (mDealt on fights where the override fired, vs the
  control leg's same-seed fights where it would have fired),
  hopeless/floor variant split, within-one-round share, wave-5
  unlocks, national / table / wins, community lost.
- **Horizon:** 150d, death-aware (stop on village-lost + 10d tail
  max). Why: reachability lever (waves 4–5); the partydmg band showed
  wave-4 fights across the full 150d, and the fleecall/fleeguard bands
  had median survival ~142–146d. Never a fixed 200d.
- **Seeds:** 112301–112308 (exact literals). Freshness: the shared
  band 112201–112208 is NAMED as a range in
  `evidence/2026-11-27/sim-partydmg-a-prereg.md:217` and
  `evidence/2026-11-27/sim-partydmg-a.md:404` (as the unused fallback
  band), so per the task's freshness rule the next fresh 8-seed block
  is used instead. Word-boundary ripgrep over all `evidence/**/*.md`
  names 112301–112308 in NO file, and no evidence filename contains
  them (`s11230.json` is seed 11230, not this block). Recorded change:
  112201–112208 -> 112301–112308.
- **Policy:** competent verbatim (`scripts/policies/competent.js`),
  both legs.
- **Substrate (both legs):** `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1
  FLEEREPAIR2=1 FIGHTALLY2=1` (the fleeguard-b standard substrate).
  Carriers `FIELDCAPDMG` / `RAGEFREE` / `FREESTRIKE` asserted OFF on
  both legs. `FLEEGUARD`, `DOORFLEE2`, `HYPOFLOOR`, `SPEARGATE`,
  `BOWOPEN` OFF on both legs. Arm leg adds `FLOORFINISH=1` only.
  Reason for FLEEGUARD OFF: it is another arm's lever, and it sets
  `fleeAt = 0.05` on held fights, which would mask the floor
  population this arm measures. One variable between the legs.
- **Staging:** smoke (2 seeds, driver/analyzer end-to-end + flag-fire
  check) then pilot (8 seeds both legs). No confirm spend without a
  pilot GO.
- **Convergence state:** converging (first build arm on the floor
  branch; the hopeless branch converged under fleeguard-b).

## §3. Instruments

- Sweep driver `scripts/fleefloor-driver-a.js` (lean clone of the
  fleeguard-b fieldFight wrap: expedition-origin wave-4+ fights only,
  rich rows with entry kits, per-fighter tallies, full log,
  `floorFinishHold` / `fleeguardHold` / `doorHold` counts,
  `fleeHopeless` / `fleeLearn` flags, `fleeHpFrac`, `mHpStart`
  recovered post-call; per-seed wall numbers: days, end reason,
  standing, scale rank, unlocked wave, deaths incl. starvation).
  `rowSeq` is reset at the start of each seed's run (partydmg-a §6
  lesson: process-position-dependent `seq` broke byte-identical
  reruns).
- Analyzer `scripts/analyze-fleefloor-a.js` (frozen definitions:
  variant from the log line — "past holding" = floor, "sees how this
  ends" = hopeless, "Committed-finish floor" = committed-floor,
  "has seen enough" = learn — with the fleeguard-b one-directional
  cross-check: a hopeless variant requires `fleeHopeless == true`; a
  floor variant carries no constraint. Within-one-round =
  (mHpStart − mDealt) <= mDealt / rounds at the flee round, dpr > 0.
  Bars judged exactly as §2; instrument health: 0 parse errors,
  selftest green, determinism byte-identical on re-run).
- Proof test `scripts/test-fleefloor-a.js` (staged fights proving the
  change and the measurement; MUST assert off-mode byte-identical
  outcomes on the baseline corpus — see §4).
- Balanced panel (§15): `scripts/balance-panel.js` before/after on
  the pilot seeds, compare `.md` attached to the evidence file. The
  panel is the instrument; the frozen bars above are the judge.

## §4. Proof test (what it must prove)

- §1 STAYING, ARMED: a staged geared party vs a wave-4 monster where
  the control (FLOORFINISH unset) flees on the floor branch with the
  monster within one round of live party damage — armed
  (FLOORFINISH=1) holds (`floorFinishHold >= 1`, "(Finish the kill)"
  line once), fights on, and kills or deals strictly more damage.
  Round-1 strikes identical (no RNG drawn by the lever).
- §2 OFF-MODE BYTE-IDENTICAL: the same staged fight with FLOORFINISH
  unset reproduces the pre-change record exactly (outcome, rounds,
  mDealt, vTaken, fleeHpFrac, full log) — frozen expected values
  captured from unmodified code before the edit — AND the pilot
  baseline corpus re-run is byte-identical with the flag unset.
- §3 FLOOR-ONLY: the override never fires when the monster is more
  than one round away (armed == control on a far-from-death floor
  case), never fires on a hopeless-branch flee (armed == control
  there — the fleecall staged hopeless case), and never fires when
  the party dealt nothing (dpr 0).
- §4 DRIVER SMOKE: the fleefloor driver runs one 30d armed seed,
  exit 0, 0 instrument errors, `floorFinishOn` true +
  `floorFinishPresent` true on the corpus file, every v4 row carries
  a numeric `floorFinishHold`.
- §5 BASE GATES: `test-fleeguard-b.js` re-runs green (the guard this
  arm does not touch) and `test-fleecall-b.js` re-runs green (the
  DIAG this arm answers).

## §5. Metric review (to be filled after the pilot — do not pre-fill)

- (filled in the evidence file after judging; if the metric proves
  wrong it is written up here and proposed for the NEXT run, never
  re-scored in this run.)

## §6. Evidence file

`evidence/2026-11-27/sim-fleefloor-a.md` with prereg header, metric
review section, and before/after numbers; per-seed corpus under
`evidence/2026-11-27/perseed-fleefloor-a/` (both legs).
