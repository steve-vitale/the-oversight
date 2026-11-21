# sim-m1range-a — LEVER PREREG (frozen before any judged sim)

**Arm:** sim-m1range-a · **Loop A run:** fleshout-20261121T1415Z (adoption of the
timed-out 1215Z run — same plan, same briefs) · **Axis:** scale-onramp
**Finding:** #2590 (serve half), question 0715Z blank 2 — **M1 in miniature:
the awareness check takes no bow/ammo input**.
**Type:** LEVER (Step 2 of the evadebow brief — the M1 term; M2 was addressed
by sim-m2step2-a, NO-GO on participation).
**Base:** master `b6aad8942` (NOT the 27a650645 in the briefs file — master
moved twice since; verified `git log --oneline -1` equals b6aad8942, worktree
clean, zero unique commits before starting).
**Branch:** sim-m1range-a (worktree `~/workspace/worktrees/sim-m1range-a`).
**Substrate:** NONE re-landed in game code. The brief's supply stack is env
flags only — `GUNRATE=1 CELLGATE=1 BOWOPEN=1 SPEARGATE=1` — and all four are
already present in this base (`GUNRATE`/`BOWOPEN`/`SPEARGATE` in
`src/js/game.js`; `CELLGATE` in `src/js/fieldFights.js`, verified by grep).
No `DEPMAT`/`ROLL35`/`AMMO` re-land: this arm's population is ranged-holder
leads, not substrate-served holders (see §1). `BOWKNOW`, `DEPARTSEE`,
`EVADEOBS`, `FIBERFETCH`, `LEND` unset on both legs.

## §0. Background (what is settled, what this lever asks)

Settled by sim-evadebow-a (band 107151–107158, 8 seeds × 2 legs, 150d,
competent policy): 3 served quivered-bow leads on the diag leg, 3 evades,
0 engaged. One of the three never fired — the awareness-evade:

- 107155, day 65, gen_34oi09c, spoiler w5, expedition: evadeP **0.67**,
  crude bow, **7 arrows**, intent engage with a party. The awareness check
  slipped them away before contact (0 rounds, 0 damage). "The awareness
  formula takes no ranged input."

Settled by sim-m2step2-a (band 107171–107178): pool 2 on both legs, both
awareness-evades (evadeP 0.55 with 1 arrow, 0.57 with 5 arrows), 0 volleys
fired, mechanism unmeasured — "M1 (awareness takes no bow/ammo input) is
the wall for served holders. 2/2 pool meetings evaded before contact,
both with arrows and a party. Any arm that wants holders to fight must
address the awareness gate first."

Settled by sim-shape2-a (band 107161–107168): bow leads exist without any
serving substrate (23 ctl / 28 arm bow leads, 18/22 bow volleys) — a
ranged-holder population is measurable on the bare supply stack. The gun
tier never fires because no living gun holder passes the filters at launch
time on ~85% of unarmed launches; holder-days are healthy only because a
handful of holders sit on the gun for weeks without fighting.

This arm builds the smallest change addressing M1 and judges it on
attributable ranged-holder meetings: give the awareness check a ranged
term.

### §0.1 The honest prior (stated BEFORE freezing — this shapes the bar)

The awareness check (`src/js/fieldFights.js`, `if (opts.awareness)`,
~line 905–940) is:

```
evade = 0.35 + min(0.30, tracking*0.01) + behaviorMod
      - 0.02*mSpeed - 0.03*mNotice + 0.05*mSize + (potential?0.05:0)
      + ability terms (game_sense +0.10, tracker +0.05,
        echo_location +0.10 night)
      + godpath fieldEvade term when held
clamped 0.05–0.90; RR() < evade → outcome 'evade', no fight at all.
```

The evadebow measured distribution the term sizes are justified from:

- Served holders' mean evadeP **0.613** against an all-leads mean of
  **0.364** — served holders slip away MORE often than the average lead,
  because their evadeP is driven by tracking/behavior/abilities, never
  by the kit.
- The single awareness-evade case: evadeP **0.67** with 7 arrows.
- The m2step2 pool: evadeP **0.55** (1 arrow) and **0.57** (5 arrows).

Term sizes (frozen): **−0.15** for a ranged weapon with ammo (bow,
crossbow, sling — the quivered-bow case), **−0.25** for an armed
searcaster (fusion cells on hand). Justification:

- The ability terms in the same formula run +0.05 to +0.10. The ranged
  term is the same order of magnitude, opposite in sign: −0.15 is 1.5×
  the largest ability term; −0.25 is 2.5×. The searcaster earns the
  bigger term because it is the gun tier (shape2: "the gun tier beats
  the bow tier") — a weapon that can kill at range should change the
  call more than a bow does.
- On the 0.67 case: a bow moves it to **0.52** — still evading more
  often than not (a nudge, not a flip); a searcaster moves it to
  **0.42** — contact becomes the likelier outcome. On the served mean
  (0.613): bow → **0.463**, searcaster → **0.363** — the searcaster
  term brings a served holder down to the all-leads mean (0.364).
- The term applies BEFORE the 0.05–0.90 clamp, so a holder at the 0.90
  ceiling drops to 0.75 (bow) / 0.65 (gun) — still high — and a holder
  at the 0.05 floor stays floored. No evadeP can go negative or above
  the ceiling because of the term.

What the term CANNOT do (frozen expectation): it moves each ranged
holder's contact probability by roughly the term size (~+0.15 bow,
~+0.25 gun) — it does not manufacture holders, arrows, or parties.
Prior pools were 3 (evadebow) and 2 (m2step2) served leads per 8 seeds;
shape2's wider bow-lead population (23–28) suggests this band's
ranged-holder pool will be larger than the served-only pools, but the
GO bar below (§2c) still demands ≥ 3 CONTACT meetings on the arm leg —
with a pool of ~3 and contact rates moving 0.33 → 0.48 (bow) or 0.58
(gun), three contacts needs both a decent pool and good luck. **A
NO-GO here is a real result, not a wasted run**: if the term is live
(mechanism check, §1) but contacts do not reach 3, the chain learns
the awareness term alone cannot populate fights on this band — the
wall is the thin holder pool itself (shape2's ~85% no-living-holder
finding), and the next arm must attack supply/presence, not the
awareness math. The GO bar is set at exactly what "the lever works"
would look like; it is NOT softened to match the prior.

**Canon:** no canon doc prescribes how much a bow should reduce
evadeP. The volley itself is specified in `fieldFights.js` comments
(blitz-combatstats 2026-10-13: "a bow is not a bigger club — it's
distance", "softening at range is the bow's identity") and the wave-4/5
HP bands in `docs/MONSTER-WAVES.md` (850–1500 / 1000–2200). The
awareness check's fiction ("saw it in time and gave it room") supports
the term's plain-words reading: a fighter who can strike first stands
their ground. Nothing is invented from a standing start: the lever
changes one term in an existing engine formula, and the prereg says so
instead of inventing canon. `docs/MONSTER-WAVES.md` and `docs/CANON.md`
read before building; the wave-4 gate (standing ≥ 100) and wave-5 gate
(standing ≥ 200 AND wave-4 faced) are unchanged by this arm.

### §0.2 Band freshness (verified before freezing, per the seed-band rule)

Band **107211–107218** (pilot, 8 seeds) — FRESH. Checked 2026-11-21
~14:29 UTC:
- Each seed: 0 hits in `evidence/*/sim-*.md`, `evidence/*/sim-*-prereg.md`,
  and `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`
  (ripgrep over the prereg/evidence/finding files).
- Seed-context grep (`"seed": 10721[1-8][^0-9]`, ripgrep over all of
  `evidence/`): 0 files.
- The only other `10721x` hits in the tree are substring coincidences:
  the 1115Z briefs file assigning this very band to this arm (and
  107221–107228 to sibling sim-vanishcause-a); SHA-256 hex panel-case
  filenames; and a float (`777022.8471072135` kcal) containing "107213".
  None is a seed use.
- Confirm-extension band **107229–107236** (12–16 seeds, §5): checked the
  same way at the same time — 0 hits in preregs, sim evidence,
  sim-findings, tracker, and 0 `"seed": 107229|10723[0-6]` rows in any
  corpus. (Deliberately skips 107221–107228: the sibling vanishcause
  arm's band.) Pre-cleared; no re-check needed at confirm time unless
  the confirm design changes.

## §1. Design (frozen)

- **Legs (2):** ctl = substrate only; arm = substrate + `M1RANGE=1`.
  Legs differ ONLY by the one env flag. The JUDGED population is the
  arm leg vs the ctl leg on identical seeds.
- **Env, both legs:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1` (the standing
  loop baseline of landed fixes + the brief's gun/bow supply stack).
  Arm adds `M1RANGE=1`. `BOWKNOW`, `DEPARTSEE`, `EVADEOBS`, `FIBERFETCH`,
  `LEND`, `DEPMAT`, `ROLL35`, `AMMO` unset both legs.
- **Band:** 107211–107218 (8 seeds × 2 legs). **Horizon:** 150d,
  death-aware. **Policy:** competent verbatim
  (`scripts/policies/competent.js`).
- **Instrument** (`scripts/m1range-driver-a.js`, clone of the m2step2
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
  corpus files additionally self-describe `m1rangePresent` /
  `m1rangeOn` (the lever's presence in fieldFights.js + the flag),
  beside the substrate's existing self-description fields.
  - **Driver changes vs the m2step2 clone (the only ones):** (1) the
    evadeP replication applies the M1RANGE term when the flag is on
    (`m1rangeTerm` recorded on the evade row: 0 / −0.15 / −0.25), so the
    recorded evadeP is what the engine actually used; (2) the driver's
    ammo count matches the engine's volley predicate exactly
    (entry id **or** material equals the ammo id — the m2step2 driver
    counted id only, via first-of itemId/id/material); (3) the driver
    records the engine's own term off the fight record
    (`rec.m1rangeTerm` → row `m1rangeTermEngine`) so the analyzer can
    count engine-vs-driver term mismatches; (4) MODE validation
    requires the four supply flags on both legs and `M1RANGE=1` only
    on the arm leg.
- **Population (judged):** wave-4+ fieldFight meetings on EITHER leg
  whose lead is a RANGED HOLDER: `rangedId != null` AND
  `ammoAtEntry >= 1` at entry. A ranged weapon is the equipped ranged
  slot whose def carries `weapon.ammo` (the volley's own predicate —
  a spear in the ranged slot is NOT ranged; a searcaster with 0 fusion
  cells is NOT armed). No staging/served-substrate requirement: the
  bow leads in shape2 (23–28 per 8 seeds) were never substrate-served.
- **"Served" (the brief's word, defined here):** a judged meeting that
  REACHES CONTACT — outcome not in {evade, alreadyDead}. The brief's
  parenthetical defines it: "served meetings (fights reaching contact
  instead of 'evade')".
- **"Fought served" (defined here):** a served meeting that entered the
  fight phase — `rounds >= 1` OR a volley fired (`volley.shots >= 1`,
  which covers a volley-kill at rounds 0).
- **"Armed volley" (defined here):** `rec.volley` with `shots >= 1` on a
  judged meeting (any ranged holder's opening volley; CELLGATE holds
  searcaster fire below wave 4, so at wave 4+ a searcaster volley can
  fire).
- **Classifier** (`scripts/analyze-m1range-a.js`,
  `classifyMeeting` — the m2step2 classifier, unchanged in classes
  and priority, population predicate swapped to the ranged-holder
  rule above): awareness-evade / hopeless-after-help /
  hopeless-alone / floor-hp / wise-leave / learn-withdraw /
  vFlee-other / engaged-vKill / engaged-vDie / engaged-mFlee /
  engaged-vWin / engaged-other / alreadyDead / unclassified. Any
  judged meeting with a missing/unknown outcome, or a vFlee matching
  no named exit, is **UNCLASSIFIED**.
- **Mechanism check (not a GO bar):** (i) on the arm leg, every ranged
  holder meeting's recorded evadeP equals the base-formula evadeP
  plus the term, exactly (term −0.15 bow / −0.25 searcaster; 0 for
  unarmed or 0-ammo leads); (ii) engine-vs-driver term mismatches
  (`m1rangeTermEngine` vs the driver's `m1rangeTerm`) = 0; (iii)
  contact rate among ranged-holder leads, arm vs ctl (directional —
  the term should raise it by roughly the term size). (i) + (ii)
  prove the lever is wired and moves the read by the term it claims;
  if they read ~0, the lever is not live and the run stops before
  judging.
- **Primary metric:** served (contact) meetings among ranged-holder
  leads at wave-4+, arm vs ctl on identical seeds.

## §2. Frozen bars (a miss is NO-GO, never re-scored)

| # | Bar | Threshold |
|---|-----|-----------|
| (a) | **Completeness** — every ranged-holder lead wave-4+ meeting on BOTH legs classified, 0 UNCLASSIFIED, 0 instrument errors on all 16 per-seed files, 0 evadeP-replication mismatches, 0 engine-vs-driver term mismatches | 100% classified, 0 unclassified, 0 errors, 0 mismatches |
| (b) | **Pool floor** — ranged-holder lead wave-4+ meetings on the arm leg | ≥ 3 (if < 3, NO-GO on participation, not re-scored; ctl pool reported beside it) |
| (c) | **GO rule** — the lever works iff served_arm ≥ 3 AND served_arm > served_ctl AND fought-served_arm ≥ 1 AND armed-volleys_arm ≥ 1 | all four hold |
| (d) | **Guardrails** (scalemetric cost bar) — starvation_arm ≤ starvation_ctl + 2 (totals) AND median-survival_arm ≥ 0.8 × median-survival_ctl; total deaths reported diagnostic | both hold |
| (e) | **Panel** — §15 balanced-panel compare attached (decision recorded; `review_required` is the standard screen-only outcome for an 8-seed panel, not a verdict input — the frozen bars judge) | compare .md attached |

**Reading note on (c) vs the brief's "vs ctl 0".** The brief writes
"served ranged-lead wave-4+ meetings ≥ 3 vs ctl 0". The "ctl 0" is the
prior-arms baseline: served-holder contacts were 0/3 (evadebow) and 0/2
(m2step2). But ctl contacts are NOT structurally zero on this band —
evadeP ~0.6 ⇒ ~40% contact per meeting — so the frozen rule compares
against THIS band's ctl count (`served_arm > served_ctl`). When this
band's ctl served count is 0, the frozen rule reduces exactly to the
briefed form. The literal "ctl served = 0" is reported as a secondary
line in the evidence; if the GO rule passes while ctl served > 0, the
verdict is still GO under the frozen rule and the difference is named
in metric review. No re-scoring either way: the frozen rule above
judges.

**Verdict rule: GO** iff (a) + (b) + (c) + (d) all pass. **NO-GO**
otherwise — including NO-GO PARTICIPATION when (b) fails. A NO-GO
reverts the lever in its own commit and lands instrument + evidence
only (0 src/js delta vs base). A GO keeps the lever env-gated
default-OFF (a default flip is a separate Steve-level call — NOT
flipped here) and lands lever + instrument + evidence. Either way the
commit message carries `[needs-eyes]` (combat feel change).

## §3. Metric binding (§14)

Pre-registered metrics bind the run. The completeness bar judges the
classifier, the pool bar judges the population, the GO rule judges the
lever, the guardrails judge the cost — no re-scoring against a
friendlier metric mid-run. If a metric proves wrong, it goes under
"metric review" in the evidence file and is proposed for the NEXT run.
Every evidence file carries a "metric review" section. The two-leg
design is frozen here: ctl (substrate only) vs arm (substrate +
M1RANGE), judged population on both legs (§1).

## §4. Proofs (green before any judged sim)

- `scripts/test-m1range-a.js` — lever static legs (the term sits in the
  awareness block after the ability terms and before the clamp; term
  values −0.15 / −0.25 by weapon id; env-gate `M1RANGE=1`; flag unset =
  base behavior); LIVE legs via the sim harness with `opts.rng`
  fixed-draw: a bow-holder fixture with base evadeP known from the
  formula — a draw between (evadeP−term) and evadeP evades with the
  flag unset and reaches contact with it set; a draw below both evades
  either way; a draw above both contacts either way; unarmed and
  0-ammo fixtures are identical with the flag set or unset; the clamp
  holds at the 0.05 floor; a searcaster fixture takes the −0.25 term.
  Classifier fixtures (one per class + priority order, 0 UNCLASSIFIED
  on fixture corpora); evadeP replication fixtures incl. the term
  (bow −0.15, searcaster −0.25, unarmed 0, 0-ammo 0); analyzer
  `--selftest` green.
- No substrate proofs to re-run: no game code is re-landed this arm
  (the four supply flags are already in base — presence verified by
  grep in the prereg header, re-verified by the driver's
  self-description fields on every corpus file).
- Determinism: one arm-leg seed re-run into a `-rep` corpus after the
  pilot; stageRows, ammoRows, v4encounters, deaths byte-identical
  (rollwall/evadebow/m2step2 precedent).

## §5. After the pilot (staged)

- **Pilot GO** (bars (a)–(d) pass on 8 seeds): confirm on 12–16 seeds
  (band 107211–107236, pre-cleared §0.2) before landing. The confirm
  re-judges the same frozen bars; a confirm miss is NO-GO.
- **Pilot NO-GO:** stop. Revert the lever in its own commit; land
  instrument + evidence only. Do NOT re-test the roll, knowledge
  seeding, or the fiber fetch (all settled). Do NOT build a bigger
  term / wider gate (different chain — the term sizes are frozen
  starting points, and a bigger term is a new prereg).
- **If the pilot shows the lever live but the pool thin** (mechanism
  check passes, bar (b) fails): name it in the evidence with counts —
  it is the next arm's question (supply/presence), not this run's
  rescue.

## §6. Closeout

- Per the depmat/roll35/ammo/evade/fiberfetch/rollwall/evadebow/m2step2
  precedent: if the lever is NO-GO its game code is reverted in its own
  commit before the evidence commit — the branch's final tree differs
  from base `b6aad8942` in no `src/` file. If GO, the lever lands
  (fieldFights.js only, env-gated default-OFF) with no substrate to
  revert. Commit message carries `[needs-eyes]`.
- Evidence: `evidence/2026-11-21/sim-m1range-a.md` (+ prereg,
  analysis, panel compare, per-seed corpora
  `perseed-m1range-a-{ctl,arm}/`).
- Wall numbers every run: national / table / wins, wave 4–5 unlocks,
  median survival.
- Telemetry check (loop step 10): run against
  `telemetry-baselines/scale-wall.json`; report LOUD lines. (Note the
  evadebow/m2step2 precedent: the baseline file does not exist anywhere
  reachable and the checker refuses recorder corpora — if it refuses
  or the baseline is absent, that is recorded, not worked around.)
- Do NOT push, bump, or verify live. Coordinator merges `--ff-only`.
  Report 'ready to merge' with branch name + tip commit.
