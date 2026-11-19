# sim-freestrike-b — PREREG (frozen BEFORE any judging sim)

**Arm:** sim-freestrike-b · **Loop B run:** fleshout-loop-b-20261119T0830Z
**Axis:** winnability chain · **Finding:** #2584 (free-action Rage
pre-empted by a higher-priority turn verb; the round file calls the
same case #2572)
**Frozen:** 2026-11-19 ~03:18 CST, before any judging sim. **Branch:**
`sim-freestrike-b` (worktree `~/workspace/worktrees/sim-freestrike-b`,
base master `eccc08af2` — journey-endgame r246).
**Builds on:** `evidence/2026-11-19/sim-ragepreempt-b.md` +
`evidence/2026-11-19/sim-ragepreempt-b-prereg.md` (DIAG-GO: harmful
pre-emption 3/10, raw 4/10, band 106001–106008, 150d, competent;
named next step: order the free strike ahead of the verbs) and
`evidence/2026-11-18/sim-rage-setup-a.md` (pilot NO-GO; paired
damage rate 2/2, kill share 0/13 vs 0/22).

## The question (finding #2584)

Heinrich d53 (seed 106006, arm leg of sim-rage-setup-a, RAGEFREE)
raged on R1 and the peacemaker turn-verb fired INSTEAD of the free
strike, then he struck once doubled while exposed and died R2. The
ragepreempt DIAG measured it: a turn verb pre-empts the free-action
Rage round in 4 of 10 observable carrier fires (3/10 harmful —
peacemaker_failed ×2, field_medicine ×1; peacemaker_success ×1 is
benign). **This arm builds the named next step and measures whether
ordering the free strike ahead of the verbs removes the pre-emption.**

## The build (frozen mechanism — proven BEFORE this prereg)

**Carrier cherry-pick (game code only, from HELD branch
`sim-rage-setup-a` tip `489bf0e88` — no pilot evidence):**
`9f8f108a4` (FIELDCAPDMG carrier: `fieldBegin` wave injection +
`carrierRage`/`carrierRageFired`, `fieldFights.js` wave pass-through
+ record flags) + `6198f7ea3` (RAGEFREE: the Rage branch returns
`consumed = false` under `RAGEFREE=1`). Applied cleanly onto
`eccc08af2` (`git apply --3way`, no conflicts). The LAUNCHPARTY
sense substrate (`d0c2ed7e4`) is NOT cherry-picked — it is HELD
do-not-land, and this arm's task authorizes only the carrier change
(see "Substrate" below). The proof test re-verifies the carrier on
current master (§1 below).

**FREESTRIKE (this arm, env-gated `FREESTRIKE=1`, default OFF):**
in the field-fight turn chain (`fieldFights.js` villager phase),
when the Rage branch fired this round, the free strike executes
BEFORE the verb chain is consulted — "the Rage round strikes
before the verb chain is consulted".
- Signal: `godpath.js` fieldAct's Rage branch sets
  `out.rageFiredRound = true` (a return field only; no behavior
  change there). The field engine orders the strike first only when
  `FREESTRIKE=1` AND `gpOut.rageFiredRound` AND
  `gpOut.consumed === false` (i.e. RAGEFREE is on — without the free
  action there is no free strike to order first) AND no trick
  displaced fieldAct.
- The strike itself is the chain's own strike code, extracted
  verbatim into a `fieldVillagerStrike` arrow closure (same code,
  same order of effects); the chain's fallback calls the same
  function. Off-mode behavior is unchanged: the strike still runs
  exactly once when no verb fires.
- **Verbs are preserved, not suppressed:** after the free strike
  lands, the verb chain is still consulted for the remainder of the
  round — a verb may still fire (peacemaker can still end the fight
  peacefully when the strike does not; field_medicine can still
  bind the wound). When no verb fires, the chain's own strike falls
  through as the turn's strike — so on a no-verb Rage round the
  fighter strikes TWICE (free strike + turn strike, both doubled,
  consuming 2 of the 3 Rage strikes). That is the direct consequence
  of "reorder only" (the chain is untouched); it is a frozen
  mechanism fact, and the secondary damage metric watches it.
- **Kill skip:** if the free strike drops the lead, the verb chain
  is skipped (`_fsKilled` branch — no verb runs on a fallen
  monster; the round-end lead-fell check records the kill). Without
  it a peacemaker/stare-down success could overwrite a kill with a
  peaceful flee.
- **Editor interaction (frozen note):** after the free strike,
  `actionKinds` ends in 'strike', so a fallback strike on the same
  round is cuttable by the Editor (repeated strikes get cut). The
  Editor working as designed; noted, not a blocker.

**Proof (run BEFORE this prereg, not a judging sim):**
`scripts/test-freestrike-b.js` **42/42** — §1 carrier still works
on current master (fires, 60-kcal pay, RAGEFREE consumed=false /
doubled same-round strike, flag-OFF control); §2 ordering
(peacemaker + field_medicine: doubled strike lands BEFORE the verb
on the Rage round, verb preserved; peacemaker_success regression:
strike first, fight still ends peacefully mFlee + peaceful; kill
skip: free strike kills R1 → no verb, outcome vKill; no-Rage
no-op: FREESTRIKE changes nothing when Rage never fires;
FREESTRIKE without RAGEFREE: the setup turn still consumes;
determinism under FREESTRIKE=1).

## Legs (both run the carrier — differ ONLY by FREESTRIKE)

- **before (ctl):** substrate + `FIELDCAPDMG=1` + `RAGEFREE=1`,
  `FREESTRIKE` unset — the free-action carrier as ragepreempt
  measured it (verb chain first, strike only as fallback).
- **after (arm):** substrate + `FIELDCAPDMG=1` + `RAGEFREE=1` +
  `FREESTRIKE=1` — the ordered carrier.
- **Substrate, both legs:** `VETREENGAGE=1 + PARTYSIZE4=1 +
  FLEEREPAIR2=1 + FIGHTALLY2=1 + WILDAVOID=1` (competent policy,
  150d death-aware). All five flags are read by LANDED code on
  current master (verified live by grep: game.js, villager-brain.js,
  win-plan.js, fieldFights.js). **No LAUNCHPARTY:** the sense
  substrate is HELD do-not-land and is not in this worktree, so the
  before leg re-measures the RAGEFREE carrier on master substrate
  rather than reproducing the ragepreempt corpora exactly. The
  before leg is therefore the honest baseline for THIS arm
  (identical seeds, same substrate, legs differ only by FREESTRIKE);
  the 3/10 ragepreempt rate is context, not the comparison. If the
  before-leg rate differs from 3/10, that difference is recorded
  as a substrate difference in the metric review, never a re-score.
  The driver asserts MODE↔FREESTRIKE and `RAGEFREE=1` +
  `FIELDCAPDMG=1` on both legs, and each corpus file records
  `freestrikeOn` / `rageFreeOn` / `carrierPresent` + the
  `godpathSha` / `fieldSha` of the code it ran under.

## Primary metric (BINDING, §14)

**Harmful pre-emption rate = harmful pre-empted Rage rounds /
observable carrier-fired Rage rounds** on each leg, classified by
the freestrike instrument (`scripts/analyze-freestrike-b.js`,
adapted from the ragepreempt analyzer — same frozen verb taxonomy,
same log signatures). Classification rule, ORDER-AWARE (this is
the change from the ragepreempt classifier, frozen here):
- The Rage round is the round of the first `(Rage)` log line.
- A fighter strike line on the Rage round that appears BEFORE any
  verb line on that round → `not_preempted` (the free strike
  landed first; a verb firing after it is preserved behavior, not
  a pre-emption). `strike_zero` (vd = 0) is reported separately,
  as before.
- A verb line on the Rage round with NO strike, or a verb line
  BEFORE the strike line → `preempted` (harmful unless
  `peacemaker_success`, which ends the fight peacefully).
- No strike and no verb on the Rage round → `consumed`. FORBIDDEN
  on both legs (RAGEFREE is on for both, so the chain always ends
  in a strike or a verb) — counts against classification
  completeness.
- Both a verb AND a strike with the verb first → anomaly (the
  ordering did not work); two verbs → anomaly_multi_verb.

**Pool floor (finding #2566 — derived from the measured pool):**
the ragepreempt corpus counted **11 arm-leg carrier-fired rows**
(10 observable). Floor: **denominator (observable Rage rounds)
≥ 8 on the AFTER leg** — ~73% of the measured pool. If the
after-leg denominator lands below 8, the verdict is **NO-GO
thin-pool**; no re-score.

**Phenomenon guard (frozen):** the before leg must show the
phenomenon is still present on this substrate — **before-leg
harmful rate > 0**. If the before leg shows 0 harmful
pre-emptions, an after-leg 0 proves nothing (the phenomenon
vanished for other reasons) and the verdict is **NO-GO
phenomenon-absent** (a design finding, not a pass).

## GO criteria (all must hold)

1. Pool floor met: after-leg denominator ≥ 8 observable
   carrier-fired Rage rounds (and before-leg denominator ≥ 8, so
   the guard is judged on a real pool).
2. Classification complete on BOTH legs: 0 unclassified, 0
   anomalies, 0 consumed.
3. Phenomenon guard: before-leg harmful rate > 0.
4. **Primary: after-leg harmful pre-emption rate == 0** (was
   3/10 on the ragepreempt corpora).
5. Cost bars (frozen, same bars as rage-setup-a): community loss
   after ≤ before + 0.125; starvation after ≤ before + 2 (totals +
   villager); median survival after ≥ 0.80 × before.
6. Instrument: analyzer `--selftest` green and the proof test
   `scripts/test-freestrike-b.js` green (42/42, run before the
   prereg — see above); instrument errors 0 on both legs.

## Verdict ladder (frozen)

- All GO criteria hold → **GO** (the ordering removes the
  pre-emption within its cost bars; confirm on the fresh band).
- After-leg harmful rate > 0 → **NO-GO** (the ordering does not
  remove the pre-emption; report the residual rate + per-verb
  table). No confirm spent.
- Pool floor missed (after-leg denominator < 8) → **NO-GO
  thin-pool**, no re-score.
- Before-leg harmful rate == 0 → **NO-GO phenomenon-absent**,
  no re-score (the fix is unproven on this substrate).
- Unclassified > 0 or anomaly > 0 or consumed > 0 on either leg →
  **NO-GO instrument** — fix the classifier, do not judge.
- Cost bar missed → **NO-GO costs** (the ordering buys the
  zero rate too dearly; report which bar).

## Secondary metrics (supporting, not binding)

- Per-verb pre-emption table, both legs (counts + shares).
- Carrier-fight kill share (vKill / observable carrier rows) and
  damage: mean mDealt per carrier fight + damage/round, before vs
  after — the 2-strike no-verb consequence is measured here, not
  assumed. A kill-share rise is supporting evidence for the arm;
  a kill-share of 0 on both legs does not overturn a GO on the
  primary (rage-setup-a already showed the flee, not the setup
  turn, is the wall) — but it must be reported, not hidden.
- Wall numbers recomputed from the corpora, both legs (national /
  table / wins, wave-4 and wave-5 unlocks, median survival).
- §15 balanced panel (`scripts/balance-panel.js` compare, built by
  `scripts/build-freestrike-panels-b.js`): the panel is the
  instrument, the frozen bars above are the judge.
- Sense-testing: the transcripts of the pilot's pre-empted (before)
  and ordered (after) carrier fights read in full
  (SENSE-TESTING LAW) — judge meaning, not just counts. The
  ragepreempt transcripts (Heinrich d53, Kavira d132, Xavier
  d98/d114) are the before-shapes to compare against; the pilot
  re-runs the same band but on master substrate, so the same
  seed/day fights may not recur — sense-testing reads whatever the
  pilot's rows hold.

## What this arm does NOT judge

- No bigger multiplier, no HP/armor floor on firing (the other
  #2568 shape — a future arm, judged against this result).
- No change to the verb chain order beyond the strike's position
  (the chain itself is untouched — reorder only).
- No kill-share re-judgement of rage-setup-a (its NO-GO stands).
- No fresh sims beyond the pilot + the frozen confirm band below.

## Horizon, seeds, policies

- **Pilot:** band **106001–106008** (the rage-setup-a /
  ragepreempt band — re-run, not re-analyzed: new legs, same
  seeds, so before/after is paired), 8 seeds, 150d, competent
  policy, death-aware. Pilot first; **12–16 seed confirm ONLY if
  the pilot goes GO**.
- **Confirm band (frozen, FRESH — checked before this prereg):
  106031–106046** (16 seeds; the confirm runs the first 12–16 of
  the band, named in the evidence file at confirm time). Freshness
  check (local_seed_band_freshness): grepped every
  `evidence/*/sim-*-prereg.md` for each seed 106031–106046 — **0
  hits**; grepped `evidence/2026-11-1*/*.md|*.json` filenames —
  no file is named for those seeds; no Nov-19 use. Reservations
  respected and NOT spent: rage-setup-a confirm band
  106011–106026 (named in
  `evidence/2026-11-18/sim-rage-setup-a-prereg.md`); carrier-arm
  confirm bands 104911–104926 and 104941–104956 (named by the
  carrier arms; do not spend them). One false-positive class
  found and cleared: `evidence/2026-11-10/journey-establishment-r128-before-seed2204.json`
  contains `106044` 12× — all are `"pantry": 106044` (pantry kcal
  measurements), not a seed-band naming.
- **Instrument:** `scripts/freestrike-driver-b.js` (adapted from
  the fieldcarrier driver — same recorder: v4encounters with
  `carrierRage` / log / foodgate fields; MODE↔FREESTRIKE
  assertion) + `scripts/analyze-freestrike-b.js` (order-aware
  classifier above; `--selftest` for the classifier) +
  `scripts/build-freestrike-panels-b.js` (§15 panel builder) +
  `scripts/balance-panel.js` compare. Analysis output:
  `evidence/2026-11-19/freestrike-b-analysis.json`. Corpora:
  `evidence/2026-11-19/perseed-freestrike-b-{before,after}/`
  (pilot); confirm corpora under
  `perseed-freestrike-b-confirm-{before,after}/`.

## Encounter-gear fixture (Steve 2026-11-13)

Not applicable as a staged fixture — these are full sims the
competent policy already plays with encounter gear (geared scholar
+ party). The corpora record what was played; no fixture is
staged here. The proof test stages fights with a launched holder
and a companion, not a solo un-geared scholar.

## Canon note

`docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` read. No
canon doc covers the Rage / turn-verb ordering or the field
engine — verified by the ragepreempt prereg's grep
(`docs/*.md` for Rage / turn verb: only
`docs/ENDGAME-BUILDS.md:68`, which names Rage as a fantasy —
"Rage as a renewable resource" — not a rule for the field
engine). Said here rather than inventing canon; the mechanism is
cited from code (`godpath.js` fieldAct, `fieldFights.js`
villager phase + verb chain), as the rage-setup-a prereg already
recorded for the field engine. The card text in
`src/data/abilities.json` ("Your next three strikes deal double
damage") promises doubled strikes, not a lost turn — the free
strike landing first is engine behavior honoring the card, not
canon.

## Metric review

(To be filled at closeout.)
