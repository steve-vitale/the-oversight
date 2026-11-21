# sim-m2step2-a — LEVER PREREG (frozen before any judged sim)

**Arm:** sim-m2step2-a · **Loop A run:** fleshout-20261121T0715Z · **Axis:** scale-onramp
**Finding:** #2590 (serve half) — **evade-on-a-quivered-bow, Step 2: the M2 lever**.
**Type:** LEVER (Step 2 of the evadebow brief). The diag (sim-evadebow-a,
DIAG-GO) named M2 — the hopeless-trajectory math prices the volley only as a
diluted lump in `mDealt` — as the dominant mechanism (hopeless-after-help
2/3, mean rounds-to-kill shift +1.0 round). This arm builds the smallest
change addressing M2 and judges it on attributable served-bow fights.
**Base:** master `9070aaf70` (Loop A lever round fleshout-20261121T0437Z:
leadside NO-GO PARTICIPATION + evadebow DIAG-GO, both merged).
**Substrate:** DEPMAT + ROLL35 + AMMO re-landed from the evadebow re-land
commit `85e68ebad` (rollwall anchor `63dc9fb59`; FIBERFETCH NOT re-landed —
CONCEPT-DEAD). `src/js/game.js` at this base is byte-identical to the
evadebow base `b5514461c` (`git diff b5514461c HEAD -- src/js/game.js`
empty), so the substrate hunks apply exactly. `src/js/fieldFights.js`
differs from `b5514461c` only by the PLANRESEED hunks (sim-reseed-b,
lines ~931 and ~3134) — the volley code and the morale block are untouched.
Verified by proof re-runs (§4) before any judged sim.
**Branch:** sim-m2step2-a (worktree `~/workspace/worktrees/sim-m2step2-a`).
**Coordinator claim:** `hidden_files/lever-claims/fleshout-20261121T0715Z.json`
(names this arm + sim-shape2-a; Loop B's live arms — dmgpin-reprereg-b,
poolfirstfail-b, downedtwice-b — NOT touched).

## §0. Background (what is settled, what this lever asks)

Settled by sim-evadebow-a (band 107151–107158, 8 seeds × 2 legs, 150d,
competent policy): 3 served quivered-bow leads on the diag leg, 3 evades,
0 engaged. Two fought first — loosed their arrows, called help, then fled
hopeless with the monster at 50–79% HP and help beside them:
- 107152, day 59, theo_lindqvist, reunion w4: volley 1 shot / 1 hit /
  13 dmg; 4 rounds, 187 dealt vs 900 HP, 63 taken; fled hopeless at 37% HP.
- 107155, day 60, gen_34oi09c, influencer w4: volley 2 shots / 2 hits /
  26 dmg; 6 rounds, 522 dealt vs 1050 HP, 68 taken; fled hopeless at 31% HP.
- 107155, day 65, same holder, spoiler w5: awareness-evade, evadeP 0.67,
  7 arrows, never fired (M1, 1/3 — NOT dominant, NOT built here).

The analyzer's volley-hopeless formula on the two fought meetings: the
volley moves the rounds-to-kill read from 16.7 → 15.3 (+1.4 rounds) and
6.7 → 6.1 (+0.6 rounds); **mean shift +1.0 rounds**.

### §0.1 The honest prior (stated BEFORE freezing — this shapes the bar)

The engine's morale read (`fieldFights.js`, round ≥ 2) is:

```
vDpr = rec.mDealt / round        // melee + ally damage AND the one-time volley lump
rtk  = mlead.hp / vDpr           // mlead.hp is CURRENT lead HP — already reduced by the volley
rtd  = vHpHypo / mDpr            // party survival (hypothetical protection-4 HP pool)
hopeless = rtd < rtk * 0.85
```

The volley therefore enters the read TWICE: once as banked HP reduction
(mlead.hp is lower by the volley — honest, and permanent), and once as a
rate inflation (the lump divided by rounds — dishonest: a one-time 13–26
dmg keeps counting as damage-per-round for the whole fight). Decomposing
the diag's +1.0-round shift with the analyzer's own formula: the volley's
HONEST value is `volleyDmg / sustainedDpr` — 13/43.5 ≈ 0.3 rounds (107152)
and 26/82.7 ≈ 0.3 rounds (107155) — while the remaining ~0.7 rounds of the
shift is rate inflation. The engine OVER-credits the volley ~3×.

Consequences, frozen into this prereg:

1. **Honest pricing RAISES rtk by the inflation amount — mean ~0.7
   rounds on the diag's two fought meetings (1.1 and 0.3)** — because
   it removes the rate inflation while keeping the banked HP
   reduction. The volley's honest value stays ~0.3 rounds each
   (volleyDmg/sustainedDpr); the engine's +1.0-round mean shift =
   ~0.3 honest value + ~0.7 inflation, and the lever removes the
   0.7. The hopeless read gets slightly STRICTER, not looser. The
   lever cannot by itself flip a hopeless meeting: the diag meetings
   were hopeless by 4–5× (rtk 6–15 rounds vs rtd ~3 rounds). A 13–26
   dmg volley is 1.5–3% of a 850–1500 HP wave-4 monster
   (MONSTER-WAVES.md bands) — no honest accounting of it moves
   the verdict.
   *(Correction 2026-11-21 ~03:10 UTC, before any judged sim: the
   frozen prereg first wrote "raises rtk by ~0.3 rounds", conflating
   the volley's honest value (0.3) with the inflation removed (0.7
   mean). The decomposition in the paragraph above was correct; only
   this sentence and the §1 mechanism-check expectation were wrong.
   The frozen bars are untouched; the conclusion — the lever makes
   the read slightly stricter and cannot flip a meeting — is
   unchanged, and the corrected magnitude strengthens it.)*
2. **There is one genuine second-order effect the sim can reveal** that
   hand arithmetic cannot: earlier hopeless → earlier shout → earlier
   help → more party damage a round sooner → rtk falls → possible
   commit. The pilot measures it; the prereg does not assume it.
3. **A NO-GO here is a real result, not a wasted run.** If honest pricing
   moves nothing (or moves the wrong way), the chain learns the volley
   accounting is NOT the wall — the wall is the damage race itself
   (party ~45–87 dpr vs ~1000 HP monsters, ~3 rounds of survival) — and
   the next arm must attack the race, not the accounting. The GO bar
   below is set at exactly what "the lever works" would look like; it is
   NOT softened to match the prior.

### §0.2 Lever shape (frozen) — M2STEP2, M2 only

**M2STEP2** (`src/js/fieldFights.js`, morale block, round ≥ 2, env-gated,
off by default): the sustained damage rate excludes the opening volley's
damage — `vDpr = (rec.mDealt - volleyDmg) / round` when `M2STEP2=1`.
The volley's HP reduction stays in `mlead.hp`: the volley is banked once
as damage already dealt at zero incoming cost, and read as a rate never.
This is the brief's "count the volley as its own damage stream rather
than a lump in mDealt" shape: the volley is its own banked stream, not a
smear across rounds. `mDpr`, `rtd`, the shout branch, `winning`, the
trick holds, and the committed-finish hold are untouched; with the flag
unset the line is byte-identical behavior to base.

**M1-adjacent awareness term: NOT built in this arm.** The brief allows
it as optional; this prereg declines it, for the record: (a) attribution
purity — the arm tests M2 alone, so any movement in the hopeless-flee
count is M2's; (b) no canon basis for the size of an awareness discount
(no canon doc prescribes how much a bow should reduce evadeP — see Canon
below); (c) it cannot move the primary metric anyway — an awareness term
can only reclassify awareness-evades into fights that then flee
hopeless. It stays a follow-up option for the coordinator, not a
second lever smuggled into this prereg.

**Canon:** no canon doc covers the hopeless-math volley pricing. The
volley itself is specified in `fieldFights.js` comments (blitz-combatstats
2026-10-13: "softening at range is the bow's identity") and the wave-4/5
HP bands in `docs/MONSTER-WAVES.md` (850–1500 / 1000–2200). Nothing is
invented from a standing start: the lever changes only how an existing
engine number is read, and the prereg says so instead of inventing canon.

### §0.3 Band freshness (verified before freezing, per the seed-band rule)

Band **107171–107178** (pilot, 8 seeds) — FRESH. Checked 2026-11-21
~02:30 UTC:
- Each seed: 0 hits in `evidence/*/sim-*.md`, `evidence/*/sim-*-prereg.md`,
  and `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`.
- Seed-context grep (`"seed": 10717[1-8][^0-9]`, ripgrep over all of
  `evidence/`): 0 files. (The plain recursive `grep -r` over `evidence/`
  was killed after ~5 min without finishing — the tree's giant panel
  corpora make it unusable; ripgrep completed the same search.)
- Corpus filenames: `find evidence -name "*10717[1-8]*"` returns one hit
  only — `evidence/2026-10-23/storageshed-b5-panel-before/cases/625107172f87394f757b27e80fd3c34f23a7c9652e521051b0df9c660835d0f7.json`
  — a SHA-256 hex panel-case filename that happens to contain the
  substring "107172", not a seed use (same class as the evadebow 107155
  case).
- Convergence tracker + lever-claims: 0 hits for any seed in the band.
- Confirm-extension band **107179–107186** (12–16 seeds, §5): checked the
  same way at the same time — 0 hits in preregs, sim evidence,
  sim-findings, tracker, and 0 `"seed": 1071(79|8[0-6])` rows in any
  corpus. Pre-cleared; no re-check needed at confirm time unless the
  confirm design changes.

## §1. Design (frozen)

- **Legs (2):** ctl = substrate only (`DEPMAT=1 ROLL35=1 AMMO=1`,
  `M2STEP2` unset); arm = substrate + `M2STEP2=1`. Legs differ ONLY by
  the one env flag. The JUDGED population is the arm leg vs the ctl leg
  on identical seeds — both legs carry served holders by construction
  (the substrate serves on both), so the comparison isolates the lever.
- **Env, both legs:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1` + `DEPMAT=1 ROLL35=1 AMMO=1`;
  arm adds `M2STEP2=1`. `BOWKNOW`, `DEPARTSEE`, `EVADEOBS`,
  `FIBERFETCH` unset both legs.
- **Band:** 107171–107178 (8 seeds × 2 legs). **Horizon:** 150d,
  death-aware. **Policy:** competent verbatim
  (`scripts/policies/competent.js`).
- **Instrument** (`scripts/m2step2-driver-a.js`, clone of the evadebow
  driver, recorders UNCHANGED): wraps `villagerStageBow` (stageRows),
  `villagerPocketAmmo` (ammoRows), `villagerAmmoCraftDay`
  (homeCraftRows), and `Game.fieldFight` (v4encounters, wave ≥ 4,
  SEEDLAND semantics). Per meeting it records ranged weapon id + ammo
  at entry, the awareness inputs replicated from the engine formula,
  and post-call outcome, rounds, vTaken, mDealt, volley
  (shots/hits/dmg/ammoLeft), calledHelp, allyVid, ally2Vid,
  fleeHpFrac, fleeWise, fleeLearn, fleeHopeless, everHopeless,
  everWinning, intent, intentWhy, shoutRound, minHpFrac,
  committedFinish, trickLog length, mHpStart (recovered post-call),
  origin. Wraps are pure reads; zero extra `Math.random` draws. The
  corpus files additionally self-describe `m2step2Present` /
  `m2step2On` (the lever's presence in fieldFights.js + the flag),
  beside the substrate's existing self-description fields.
- **Population (judged):** wave-4+ fieldFight meetings on EITHER leg
  whose lead is a SERVED QUIVERED-BOW HOLDER (same definition as
  evadebow prereg §1: staged bow, source in {crafted, fromStash,
  fromArmory}, itemId in {bow, crude_bow}, day ≤ meeting day,
  `itemId == rangedId` at entry; ammoAtEntry ≥ 1).
- **Classifier** (`scripts/analyze-m2step2-a.js`,
  `classifyMeeting` — the evadebow classifier, unchanged in classes
  and priority): awareness-evade / hopeless-after-help /
  hopeless-alone / floor-hp / wise-leave / learn-withdraw /
  vFlee-other / engaged-vKill / engaged-vDie / engaged-mFlee /
  engaged-vWin / engaged-other / alreadyDead / unclassified. Any
  judged meeting with a missing/unknown outcome, or a vFlee matching
  no named exit, is **UNCLASSIFIED**.
- **Metric-review fixes (instrument, NOT lever changes — separate
  commits, recorded here because the evadebow evidence named them):**
  1. Count volleys over EVERY fought meeting (rounds ≥ 1), not
     engaged-outcome only — the volley rollup and the volley-hopeless
     read now cover vFlee outcomes too (the diag's read reported n=0
     because both fought meetings fled). The timed-out run's
     half-finished draft of this fix is NOT reused: its fixture values
     were not derivable from its fixture numbers (see evadebow
     evidence, Infrastructure). This fix carries its own hand-computed
     fixtures, verified against the analyzer's formula before commit.
  2. Pass awareness through the classifier — the classified meeting
     now carries `awareness` (from `row.evade.awareness`), so the
     served aware-gated rollup reads a real rate instead of null.
  3. `volleyHopelessRead` gains `rtkHonest` = remaining HP over the
     sustained (volley-free) rate — the arm leg's mechanism read: on
     the arm leg the engine's rtk IS rtkHonest by construction, so
     mean (`rtkHonest` − `rtkAll`) across fought served meetings is
     the lever's actual rtk movement.
- **Mechanism check (not a GO bar):** mean (`rtkHonest` − `rtkAll`)
  across fought served meetings on the arm leg ≈ +0.7 rounds (the
  inflation the lever removes; the diag's two fought meetings read
  1.1 and 0.3), vs the diag's +1.0-round inflated shift. The volley's
  honest value is ~0.3 rounds — the check measures the inflation
  removed, not the value. This proves the lever is wired and moves
  the read by the inflation it removes. If it reads ~0, the lever is
  not live and the run stops before judging. *(Corrected with §0.1
  point 1, same correction commit — first wrote +0.3.)*
- **Primary metric:** served-holder wave-4+ engaged-vs-hopeless-flee
  on served leads, arm vs ctl on identical seeds.
  - Engaged-finishes = engaged-vKill + engaged-mFlee + engaged-vWin.
    engaged-vDie is EXCLUDED from the GO count (a lever that gets
    holders killed is not a win) and reported separately.
  - Hopeless-flee = hopeless-after-help + hopeless-alone.

## §2. Frozen bars (a miss is NO-GO, never re-scored)

| # | Bar | Threshold |
|---|-----|-----------|
| (a) | **Completeness** — every served quivered-bow lead wave-4+ meeting on BOTH legs classified, 0 UNCLASSIFIED, 0 instrument errors on all 16 per-seed files | 100% classified, 0 unclassified, 0 errors |
| (b) | **Pool floor** — served quivered-bow leads on the arm leg | ≥ 3 (if < 3, NO-GO on participation, not re-scored; ctl pool reported beside it) |
| (c) | **GO rule** — the lever works iff engaged-finishes_arm ≥ 1 AND engaged-finishes_arm > engaged-finishes_ctl AND hopeless-flee_arm < hopeless-flee_ctl | all three hold |
| (d) | **Guardrails** (scalemetric cost bar) — starvation_arm ≤ starvation_ctl + 2 (totals) AND median-survival_arm ≥ 0.8 × median-survival_ctl | both hold |
| (e) | **Panel** — §15 balanced-panel compare attached (decision recorded; `review_required` is the standard screen-only outcome for an 8-seed panel, not a verdict input — the frozen bars judge) | compare .md attached |

**Verdict rule: GO** iff (a) + (b) + (c) + (d) all pass. **NO-GO**
otherwise — including NO-GO PARTICIPATION when (b) fails. A NO-GO
reverts the lever in its own commit and lands instrument + evidence
only (0 src/js delta vs base). A GO lands lever + proof + evidence
with the substrate reverted (the substrate itself does not land).

## §3. Metric binding (§14)

Pre-registered metrics bind the run. The completeness bar judges the
classifier, the pool bar judges the population, the GO rule judges the
lever, the guardrails judge the cost — no re-scoring against a
friendlier metric mid-run. If a metric proves wrong, it goes under
"metric review" in the evidence file and is proposed for the NEXT run.
Every evidence file carries a "metric review" section. The two-leg
design is frozen here: ctl (substrate only) vs arm (substrate + M2),
judged population on both legs (§1).

## §4. Proofs (green before any judged sim)

- `scripts/test-m2step2-a.js` — substrate static legs (DEPMAT/ROLL35/
  AMMO present, FIBERFETCH absent); M2 static legs (the morale block
  computes vDpr excluding volley damage when M2STEP2=1; the volley
  still lands in rec.mDealt; the change sits inside the round ≥ 2
  morale block; flag unset = base behavior); classifier fixtures (one
  per class + priority order, 0 UNCLASSIFIED on fixture corpora);
  fought-meeting volley rollup (vFlee-with-volley counted, with
  hand-computed volleyHopelessRead values incl. rtkHonest); awareness
  pass-through (classified meeting carries awareness; served
  aware-gated rate non-null on the fixture corpus); analyzer
  `--selftest` green.
- Substrate proofs re-run green on the re-landed base before the pilot:
  `test-depmat-a.js` 43/43, `test-roll35-a.js` 41/41, `test-ammo-a.js`
  52/52, analyzer `--selftest` green.
- Determinism: one arm-leg seed re-run into a `-rep` corpus after the
  pilot; stageRows, ammoRows, v4encounters, deaths byte-identical
  (rollwall/evadebow precedent).

## §5. After the pilot (staged)

- **Pilot GO** (bars (a)–(d) pass on 8 seeds): confirm on 12–16 seeds
  (band 107171–107186, pre-cleared §0.3) before landing. The confirm
  re-judges the same frozen bars; a confirm miss is NO-GO.
- **Pilot NO-GO:** stop. Revert the lever in its own commit; land
  instrument + evidence only. Do NOT re-test the roll, knowledge
  seeding, or the fiber fetch (all settled). Do NOT build a bigger
  bundle / higher gun rate / wider gate (different chain).
- **If the pilot shows the second-order shout effect** (earlier shouts
  on the arm leg, with or without a finish): name it in the evidence
  with counts — it is the next arm's question, not this run's rescue.

## §6. Closeout

- Per the depmat/roll35/ammo/evade/fiberfetch/rollwall/evadebow
  precedent: the DEPMAT+ROLL35+AMMO substrate is REVERTED from
  `src/js/game.js` before the final commit, in its own commit,
  hash-verified (`git diff <base> -- src/js/game.js` empty). If the
  lever is NO-GO its game code is reverted the same way (own commit)
  before the evidence commit — the branch's final tree differs from
  base `9070aaf70` in no `src/` file. If GO, the lever lands with the
  substrate reverted — the lever commit holds fieldFights.js only.
- Evidence: `evidence/2026-11-21/sim-m2step2-a.md` (+ prereg,
  analysis, panel compare, per-seed corpora
  `perseed-m2step2-a-{ctl,arm}/`).
- Wall numbers every run: national / table / wins, wave 4–5 unlocks,
  median survival.
- Telemetry check (loop step 10): run against
  `telemetry-baselines/scale-wall.json`; report LOUD lines. (Note the
  evadebow precedent: the checker refuses recorder corpora as "not
  runs" — if it refuses, that refusal is recorded, not worked around.)
- Do NOT push, bump, or verify live. Coordinator merges `--ff-only`.
