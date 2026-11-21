# sim-evadebow-a — DIAG PREREG (frozen before any judged sim)

**Arm:** sim-evadebow-a · **Loop A run:** fleshout-20261121T0437Z · **Axis:** scale-onramp
**Finding:** #2590 (serve half) — **evade-on-a-quivered-bow**.
**Type:** DIAG (Step 1 of the brief). No lever is built in this leg. A lever
follows ONLY if the diag names one mechanism, under a SECOND frozen prereg
(§5).
**Base:** master `b5514461c` (Loop A lever round fleshout-20261121T0315Z:
rollwall DIAG-GO + holdersupply NO-GO PARTICIPATION).
**Substrate:** DEPMAT + ROLL35 + AMMO re-landed from the rollwall substrate
re-land commit `63dc9fb59` (anchor `2ab27333f`; FIBERFETCH NOT re-landed —
CONCEPT-DEAD). `src/js/game.js` at this base is byte-identical to the
rollwall base `b7c8eff2c` (`git diff b7c8eff2c HEAD -- src/js/game.js` empty),
so the substrate hunks apply exactly. Verified by proof re-runs (§4) before
any judged sim.
**Branch:** sim-evadebow-a (worktree `~/workspace/worktrees/sim-evadebow-a`).

## §0. Background (what is settled, what this diag asks)

Chain (finding #2590, serve half): speargate gate fixed; bowknow / bowsee /
depmat / ammo NO-GO; fibersupply DIAG; fiberfetch NO-GO concept-dead;
rollwall DIAG-GO (roll calibrated at every rate: 0.35 → 0.351, 0.60 → 0.619,
0.85 → 0.814 pooled on 176 attempts; the 6/6 was selection, not a defect).
Remaining wall: a served villager with a bow AND arrows still evades every
wave-4+ meeting they lead (depmat: 5 served leads, 5 evades; ammo:
gen_iq204w4 evaded carrying 4 arrows; evade-a arm leg: 5 served leads, 2
evades / 3 engaged; fiberfetch: 3 served-bow engaged meetings, 1 volley —
Sam Wilson, 2 shots / 2 hits / 34 dmg, died round 2).

Code reads (hypotheses to be MEASURED, not verdicts — read before freezing):

- **Awareness evade** (`src/js/fieldFights.js`, the `opts.awareness` block):
  `evade = 0.35 + min(0.30, tracking*0.01) + behaviorMod − 0.02*mSpeed −
  0.03*mNotice + 0.05*mSize + (potential ? 0.05 : 0)` plus abilities
  (game_sense +0.10, tracker +0.05, echo_location +0.10 at night) plus the
  godpath `fieldEvade` detection term, clamped [0.05, 0.90]. **No bow, ammo,
  ranged-weapon, or quiver term exists in the formula.** A served quivered
  bow holder evades at exactly the same rate as an unarmed villager, as far
  as this formula reads. The awareness check runs BEFORE the volley code, so
  an evade never sees the bow at all.
- **Hopeless calc** (fieldFights.js morale, round ≥ 2): `vDpr = rec.mDealt /
  round`, `rtk = mlead.hp / vDpr`, `rtd = vHpHypo / mDpr`, `hopeless = rtd <
  rtk * 0.85`. `rec.mDealt` INCLUDES the opening volley damage — so ranged
  damage enters the hopeless read only as a one-time lump diluted across
  rounds (a 27–34 dmg volley against a ~1000 HP wave-4 monster moves rtk by
  ~2–3%). The volley never enters the pre-contact decision.
- **fighterShouldFlee** (`src/js/villager-agency.js`): f(hpFrac, hopeless,
  winning, fleeLine) where fleeLine = f(temperament, fear, confidence,
  fought-this-species). **No ranged term.** The flee line is a personality
  read, not a kit read.
- **Flee-repair, settled** (sim-fleerepair3-b, `d4d1eae52`, FIXED): the
  'leave' trick branch ends the fight (no parting hit). The wise-leave class
  below is that branch (`rec.fleeWise`), Suburb only — not re-litigated here.
- **Volley** (fieldFights.js): fires only after contact is made (awareness
  check passed), shots = min(arrows, clamp(1 + floor(range / mSpeed), 1, 4)).

The diag question, measured: for EVERY wave-4+ meeting led by a served
quivered-bow holder, evade or engage — and for each evade, the reason AS
THE FLEE BRAIN SEES IT. The three candidate mechanisms above (M1 awareness
blind to the bow; M2 volley diluted in the hopeless math; M3 flee line blind
to the kit) are distinguished by WHICH class dominates: awareness-evades
name M1; hopeless-after-help names M2; floor-hp / wise-leave name the
mid-fight brain, not the bow.

### §0.1 Band freshness (verified before freezing, per the seed-band rule)

Band **107151–107158** — FRESH. Checked 2026-11-21 ~05:30 UTC:
- Each seed: 0 hits in `evidence/*/sim-*.md`, `evidence/*/sim-*-prereg.md`,
  and `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`.
- Corpus filenames: `find evidence -name "*10715[1-8]*"` returns one hit only
  — `evidence/2026-11-09/ove-130-sim-rematch-after-all-seeing-council/panel/cases/31e93eafb5c693e107155b1a60d37e2cf4f162c7ac37adba23663bbe8005d449.json`
  — a SHA-256 hex panel-case filename that happens to contain the substring
  "107155", not a seed use.
- Seed-context grep (`"seed": 10715[1-8]`) across all of `evidence/`: 0 hits.
- Raw-substring noise (recorded, not hidden): `git grep 107158` hits two
  Oct 28 awayvoice corpora — both are the float `1597.9678107158281`
  ("9678**107158**281"), not a seed. The same float-substring class explains
  the other raw `10715[1-8]` hits in old corpora; none is a seed use.
- Convergence tracker + lever-claims: 0 hits for any seed in the band.

## §1. Design (frozen)

- **Legs (2):** ctl = live game + `SPEARGATE=1` only (substrate OFF);
  diag = substrate ON. Legs differ ONLY by env. The JUDGED population is
  the diag leg only — the ctl leg carries no served leads by construction
  (the substrate is what serves; ctl served-leads are reported as a sanity
  check, expected ≈ 0, not a bar) and exists for the §15 panel compare and
  the band evade-rate baseline.
- **Env, both legs:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1`; diag adds `DEPMAT=1 ROLL35=1 AMMO=1`.
  `BOWKNOW`, `DEPARTSEE`, `EVADEOBS`, `FIBERFETCH` unset both legs.
- **Band:** 107151–107158 (8 seeds × 2 legs). **Horizon:** 150d, death-aware.
  **Policy:** competent verbatim (`scripts/policies/competent.js`).
- **Instrument** (`scripts/evadebow-driver-a.js`, clone of the evade-a driver
  + the rollwall stage/ammo/home-craft recorders): wraps `villagerStageBow`
  (stageRows), `villagerPocketAmmo` (ammoRows), `villagerAmmoCraftDay`
  (homeCraftRows), and `Game.fieldFight` (v4encounters, wave ≥ 4, SEEDLAND
  semantics). Per meeting it records, pre-call: lead's ranged weapon id +
  ammo at entry (the volley spends ammo, so the post-call pack no longer
  shows what the fighter opened with), the awareness inputs replicated from
  the same formula the engine reads (tracking, behavior, mSpeed, mNotice,
  mSize, potential, abilities incl. the godpath detection flag — evadeP
  reads as a floor where a detection modifier is held, per the evade-a
  note), trick-known state + trick observations before/after. Post-call:
  outcome, rounds, vTaken, mDealt, volley (shots/hits/dmg/ammoLeft),
  calledHelp, allyVid, ally2Vid, fleeHpFrac, fleeWise, fleeLearn,
  fleeHopeless, everHopeless, everWinning, intent, intentWhy, shoutRound,
  minHpFrac, committedFinish, trickLog length, mHpStart (recovered
  post-call), origin (expedition / world-tick / patrol / aid / other).
  Wraps are pure reads; zero extra `Math.random` draws.
- **Population (judged):** wave-4+ fieldFight meetings on the diag leg whose
  lead is a SERVED QUIVERED-BOW HOLDER:
  - SERVED: the lead has a stage row with `staged=true`, `source` in
    {crafted, fromStash, fromArmory}, `itemId` in {bow, crude_bow}, day ≤
    meeting day, and `itemId == rangedId` at entry. (The ammo arm's
    definition — bow staged this departure, any carrier — not the
    depmat-attributable spear-only subset. The depmat-attributable subset
    — site-supplied spear rows — is reported beside it so the numbers tie
    to prior arms.)
  - QUIVERED: `ammoAtEntry ≥ 1`.
- **Classifier** (`scripts/analyze-evadebow-a.js`, `judgeEvadebow`): exactly
  one class per judged meeting. Evade classes (the meeting never engages):
  - `awareness-evade` — outcome `evade`, rounds 0. Carries evadeP +
    components + gpTerm + rangedId + ammoAtEntry.
  - `hopeless-after-help` — outcome `vFlee`, fleeHopeless, calledHelp.
  - `hopeless-alone` — outcome `vFlee`, fleeHopeless, no help called.
  - `floor-hp` — outcome `vFlee`, not fleeHopeless, not fleeWise, not
    fleeLearn.
  - `wise-leave` — outcome `vFlee`, fleeWise (the Suburb leave trick).
  - `learn-withdraw` — outcome `vFlee`, fleeLearn (and not fleeWise).
  - `vFlee-other` — outcome `vFlee` matching none of the above; counts as
    classified ONLY if the rec fields name the exit (recorded in the detail
    line); otherwise the meeting is UNCLASSIFIED.
  - Engaged meetings (rounds ≥ 1) are classified by outcome: `vKill`,
    `vDie`, `mFlee`, `vWin`, or `engaged-other` (outcome named), each with
    volley (shots/hits/dmg) + whether the holder died and on which round.
  - `alreadyDead` — outcome `alreadyDead` (corpse, not a fight); classified,
    not an evade, not engaged.
  - Any judged meeting with a missing/unknown outcome, or a vFlee matching
    no named exit, is **UNCLASSIFIED** — the completeness bar fails.
  - Priority inside vFlee: fleeWise → learn-withdraw → hopeless-after-help
    → hopeless-alone → floor-hp → vFlee-other.
- **Volley-in-hopeless read (descriptive, analyzer-side estimate, labeled
  as such):** for each engaged quivered meeting, `vDpr_all = mDealt/rounds`,
  `vDpr_noVolley = (mDealt − volleyDmg)/rounds`, and the rtk shift in rounds
  from the volley (`rtk` from mHpStart − mDealt over each vDpr). This prices
  M2: how much the volley moves the trajectory the hopeless calc reads.
- **EvadeP-independence read (descriptive):** mean evadeP + observed
  awareness-evade rate among served-quivered leads vs all wave-4+ leads on
  the diag leg (and the ctl leg beside it). The analyzer asserts by
  construction that the replicated evadeP takes no ranged input — proven in
  the proof test by a pair of synthetic rows differing ONLY in ammoAtEntry
  that replicate to identical evadeP.

## §2. Frozen bars (a miss is DIAG-NO-GO, never re-scored)

| # | Bar | Threshold |
|---|-----|-----------|
| (a) | **Completeness** — every served quivered-bow lead wave-4+ meeting on the diag leg classified, 0 UNCLASSIFIED, 0 instrument errors on all 16 per-seed files | 100% classified, 0 unclassified, 0 errors |
| (b) | **Pool floor** — served quivered-bow leads on the diag leg | ≥ 3 |
| (c) | **Dominant reason named** — the largest evade class (or, if evades = 0, the engaged-outcome split) named with its count and share; every evade carries its evadeP + components; the bow/ammo-in-assessment question answered with the measured evadeP comparison (§1) | named with counts |
| (d) | **Panel** — §15 balanced-panel compare attached (decision recorded; `review_required` is the standard screen-only outcome for an 8-seed panel, not a verdict input — the frozen bars judge) | compare .md attached |

**Verdict rule: DIAG-GO** iff (a) + (b) + (c) all pass. **DIAG-NO-GO** if the
pool is < 3, or any meeting is UNCLASSIFIED, or any instrument error fires.
A DIAG-GO names the wall (dominant class + mechanism letter M1/M2/M3 from
§0); it does NOT by itself authorize a lever.

## §3. Metric binding (§14)

Pre-registered metrics bind the run. The completeness bar judges the
classifier, the pool bar judges the population, the dominant-reason bar
judges the naming — no re-scoring against a friendlier metric mid-run. If a
metric proves wrong, it goes under "metric review" in the evidence file and
is proposed for the NEXT run. Every evidence file carries a "metric review"
section. The single-leg-vs-two-leg choice is frozen here: two legs, judged
population diag-only (§1) — the ctl leg is a panel/baseline leg, not a
second judged population.

## §4. Proofs (green before any judged sim)

- `scripts/test-evadebow-a.js` — classifier unit cases (one synthetic corpus
  per class incl. the priority order, 0 UNCLASSIFIED on fixture corpora),
  judge cases (pool floor pass/fail, completeness pass/fail), evadeP
  independence case (ammo-only difference → identical evadeP), static
  formula checks (no ranged term in the awareness block; no ranged term in
  `fighterShouldFlee`; volley damage lands in `rec.mDealt`).
- Substrate proofs re-run green on the re-landed base before the pilot:
  `test-depmat-a.js` 43/43, `test-roll35-a.js` 41/41, `test-ammo-a.js` 52/52,
  analyzer `--selftest` green.
- Determinism: one diag-leg seed re-run into a `-rep` corpus after the pilot;
  stageRows, ammoRows, v4encounters, deaths byte-identical (rollwall
  precedent).

## §5. After the diag (Step 2 — second prereg, not this one)

- If the diag names ONE mechanism (dominant class → M1/M2/M3), freeze a
  SECOND prereg in the same evidence file (new section, committed before
  any lever sim) and build the smallest change addressing that mechanism,
  judged on attributable served-bow volleys / engaged fights.
- If the diag names NO mechanism (evades are all genuinely-hopeless by the
  brain's own honest math, or the split names no single wall), report
  DIAG-GO/NO-GO and STOP — do not build a blind lever. A clean DIAG that
  names the wall is a finished arm.
- Do NOT re-test the roll, knowledge seeding, or the fiber fetch (all
  settled). Do NOT build a bigger bundle / higher gun rate / wider gate
  (different chain).

## §6. Closeout

- Per the depmat/roll35/ammo/evade/fiberfetch/rollwall precedent
  (instrument + evidence only): the DEPMAT+ROLL35+AMMO substrate is
  REVERTED from `src/js/game.js` before the final commit — the branch's
  final tree differs from base `b5514461c` in no `src/` file. Revert verified
  by hash (`git diff b5514461c -- src/js/game.js` empty). If a lever is built
  and NO-GO, its game code is reverted the same way before commit.
- Evidence: `evidence/2026-11-21/sim-evadebow-a.md` (+ prereg, analysis,
  panel compare, per-seed corpora `perseed-evadebow-a-{ctl,diag}/`).
- Wall numbers every run: national / table / wins, wave 4–5 unlocks, median
  survival.
- Telemetry check (loop step 10): run against
  `telemetry-baselines/scale-wall.json`; report LOUD lines. (Note: the
  rollwall precedent — a single-leg diag recorder corpus is refused by the
  checker as "recorder rows, not runs". This run has a paired ctl/diag
  design, so the checker is run on the paired panel corpora; if it refuses,
  that refusal is recorded, not worked around.)
- Do NOT push, bump, or verify live. Coordinator merges `--ff-only`.
