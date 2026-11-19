# sim-ragepreempt-b — PREREG (frozen BEFORE any judging)

**Arm:** sim-ragepreempt-b · **Loop B run:** fleshout-loop-b-20261119T0530Z
**Axis:** winnability chain · **Finding:** #2584 (free-action Rage
pre-empted by a higher-priority turn verb)
**Frozen:** 2026-11-19 ~23:50 CST, before any judging. **Branch:**
`sim-ragepreempt-b` (worktree `~/workspace/worktrees/sim-ragepreempt-b`).
**Builds on:** `evidence/2026-11-18/sim-rage-setup-a.md` +
`evidence/2026-11-18/sim-rage-setup-a-prereg.md` (Loop A arm, pilot
NO-GO on kill-share bars; paired damage rate 2/2) and
`evidence/2026-11-19/sim-scale-onramp-round-0115.md` (round closeout).
**Numbering note:** the round file calls this case finding #2572;
the sim-findings.md entry is line 2584 and the task brief names it
#2584 — #2584 is used here, #2572 is the same case under the round
file's numbering.

## The question (finding #2584)

Heinrich d53 (seed 106006, arm leg of sim-rage-setup-a, RAGEFREE —
Rage as a free action striking the same round, godpath.js only)
raged on R1 and the peacemaker turn-verb fired INSTEAD of the free
strike — "walks in open-handed — and it goes wrong. It doesn't want
peace. They're exposed, off-balance. (Walk In — failed)" — then he
struck once doubled (35) while exposed and died R2. The RAGEFREE
free strike is conditional on no higher-priority turn verb firing
that round; the benefit the arm measured (paired damage rate 2/2)
does not hold when a verb pre-empts it.

**Measure HOW OFTEN a turn verb pre-empts the Rage round** — first
from the existing rage-setup-a corpora (band 106001–106008, 150d,
competent) with a recorder; only if the corpora cannot answer it
(no verb rows) run a fresh 8-seed pilot on a FRESH band instead.
Do not force a verdict from inadequate rows.

## Mechanism model (read from code, frozen — fieldFights.js + godpath.js)

Round order in the villager phase (`fieldFights.js`, per round):

1. `trickAct` is computed first. If non-null, `fieldAct` is SKIPPED
   entirely (`if (!trickAct && gpF)`) — a trick displaces the
   god-path verb, so Rage cannot fire on a trick round. Tricks are
   therefore NOT in the pre-emption taxonomy: a pre-empting verb can
   only fire on a round where Rage already fired.
2. `fieldAct` (godpath.js) runs the free verbs (Foresight, Coin
   Guard, Stoke — no turn), then the turn actions in order; the Rage
   branch sets `nextMult = 2; nextN = 3`, pays 60 kcal, logs
   `R<n>: <Name>'s eyes go red. Next 3 strikes hit twice as hard.
   (Rage)` and returns `consumed`. Under `RAGEFREE=1` the Rage
   branch returns `consumed = false` (rage-setup-a branch only —
   this worktree is master, where the branch still returns
   `consumed = true`; this arm changes no game code and needs no
   RAGEFREE build: the corpora already carry the arm leg).
3. If `consumed` is false and no trick, the field verb chain runs
   (else-if, exactly one branch per round, in this order):
   `field_medicine` → `patient_aim` → `freeze_tag` → `hogtie` →
   `shoulder_check` → `come_get_some` → `intimidating_presence` →
   `peacemaker` → `brawler_instinct` → else STRIKE.
4. On the control leg (`RAGEFREE` unset) Rage returns
   `consumed = true`, so the verb chain never runs on the Rage round:
   the ctl leg is the negative control — 0 pre-emptions expected.

**Frozen verb taxonomy** (exact log signatures, from fieldFights.js):

| Verb | Log signature on the Rage round |
|---|---|
| field_medicine | `binds the wound — field medicine, +` |
| patient_aim | `(Take Aim — next shot 2.5x)` |
| freeze_tag | `(Freeze Tag: rooted 2 rounds)` |
| hogtie | `(Hogtie)` |
| shoulder_check | `(Shoulder Check)` |
| come_get_some | `(Come Get Some)` |
| intimidating_presence | `(Stare Down —` |
| peacemaker_failed | `(Walk In — failed)` |
| peacemaker_success | `(Peacemaker: Walk In)` |
| brawler_instinct | `(Brawler's Instinct: +2 speed)` |

The fighter's own strike on the Rage round is the line
`R<n>: <Name> strikes for <vd> (...)` with `<Name>` taken from the
`(Rage)` line itself. Ally strike lines (`<ally> strikes for …`,
`<ally> strikes again, louder …`) are NOT the fighter's strike.
A strike line with `vd = 0` (editor CUT, mirage miss) means the
strike branch was reached but dealt nothing: class `strike_zero`,
NOT a verb pre-emption, reported separately.

## Primary metric (BINDING, §14)

**Pre-emption rate = pre-empted Rage rounds / carrier-fired rounds**
on the ARM leg of the rage-setup-a corpora. A carrier-fired round
is PRE-EMPTED iff a verb from the frozen taxonomy fired on the Rage
round AND no fighter strike line appears on that round. The Rage
round is the round of the first `(Rage)` log line in that meeting
(no assumption it is R1); the verb line must come after the Rage
line in log order.

**Pool floor (finding #2566 — derived from the measured pool, never
set blind):** pre-prereg census of the frozen corpora counts **11
arm-leg carrier-fired rows** (`carrierRage: true`, all 8 seeds).
Floor: **denominator (observable Rage rounds) ≥ 8** — ~73% of the
measured pool, allowing up to 3 rows with an unobservable Rage
round. If the denominator lands below 8, the verdict is
**DIAG-NO-GO thin-pool** and the fresh-band fallback below triggers;
no re-score.

**Classification completeness (binding):** 0 unclassified rows
(a row with no strike and no taxonomy verb on its Rage round) and
0 rows where both a verb AND a strike appear (a code-model
violation — investigate, do not judge).

**Harmful vs benign (frozen split):** `peacemaker_success` ends the
fight peacefully (`mFlee`) — the strike was not needed, so it counts
in the RAW rate but NOT in the HARMFUL rate. Every other verb is
harmful: the turn is spent, the fight continues, no strike lands.
Both rates are reported; the interpretation rule below reads the
HARMFUL rate.

## DIAG-GO criteria (all must hold)

1. Pool floor met: denominator ≥ 8 observable carrier-fired Rage
   rounds on the arm leg.
2. Classification complete: 0 unclassified, 0 verb+strike
   anomalies, every pre-emption classified by verb.
3. Test cases reproduced (analyzer proof test on the real corpus
   rows): Heinrich d53 (seed 106006, arm) → pre-empted /
   peacemaker_failed; Sergio d95 (seed 106004, arm) → not
   pre-empted (free strike landed); Ruby d139 (seed 106005, arm) →
   not pre-empted; gen_arcfvpg d47 (seed 106008, arm) → not
   pre-empted; Kavira d132 (seed 106001, arm) → pre-empted /
   field_medicine (found in the pre-prereg census — the corpus
   already holds a second pre-emption, of a different verb); ctl
   negative control → 0 pre-emptions across all 21 ctl
   carrier-fired rows, every observable ctl Rage round showing the
   consumed signature. (Correction 1: Ruby d139 is unobservable —
   see below — and is asserted as `rage_round_unobserved`, not as
   not-pre-empted.)
4. Instrument: analyzer `--selftest` green and the proof test
   `scripts/test-ragepreempt-b.js` green (selftest on synthetic
   rows + proof on the real corpus rows above).

## Interpretation rule (frozen — what the rate means for rage-setup-a)

The rage-setup-a paired damage rate (2/2) was measured on two
paired fired meetings, neither pre-empted. It generalises only if
pre-emption is rare.

- **Harmful rate ≥ 0.25** (≥ 3 of ~11 fires lose the free strike
  to a verb): the 2/2 does NOT generalise — the free strike is
  lost often enough to change the expected value of RAGEFREE.
  Named next step: **order the free strike ahead of the verbs**
  (the Rage round strikes before the verb chain is consulted).
- **Harmful rate < 0.25:** the 2/2 stands as the paired result
  with a known tax. Named next step: **accept the rate and
  document it as a tax** on the free-action Rage (do not reorder).

Either way the rate is reported with its denominator and the
per-verb table; the rate is a measurement, not a GO/NO-GO on the
lever itself (this is a DIAG arm — no game-code change).

## Verdict ladder (frozen)

- Pool floor met + classification complete + test cases pass →
  **DIAG-GO** (the question is answered; report the rate).
- Pool floor missed (denominator < 8) → **DIAG-NO-GO thin-pool**,
  fresh-band fallback triggers (below), no re-score.
- Unclassified > 0 or verb+strike anomaly > 0 → **DIAG-NO-GO
  instrument** — fix the classifier, do not judge from partial
  rows.
- Ctl negative control > 0 pre-emptions → **STOP, investigate**
  (the mechanism model or the classifier is wrong); no verdict.

## Secondary metrics (supporting, not binding)

- Per-verb pre-emption table (counts + shares of the denominator).
- Judged-population cut: the rage-setup-a pair-inclusive engaged
  population (8 arm carrier rows) — rate reported beside the
  primary 11-row rate.
- Ctl negative control: same classifier on all 21 ctl
  carrier-fired rows (expect 0).
- Real-Rage holders: the corpora do NOT persist `rageFired` on the
  encounter row (census: 0 rows carry it), so a real-Rage-holder
  cut cannot be built from these corpora — recorded as a gap, not
  faked. (The RAGEFREE change applies branch-wide, so holder
  pre-emptions are the same mechanism; a future arm with a
  `rageFired`-persisting recorder can measure them.)
- Wall numbers recomputed from the corpora, both legs (national /
  table / wins, wave-4 and wave-5 unlocks, median survival).
- Sense-testing: the transcripts of every pre-empted fight read in
  full (SENSE-TESTING LAW) — judge meaning, not just counts.

## What this arm does NOT judge

- No bigger multiplier, no HP/armor floor on firing (the other
  #2568 shape — a future arm, judged against this result).
- No change to the verb chain order (that is the NAMED NEXT STEP,
  not this arm's change — this arm measures only).
- No kill-share re-judgement of rage-setup-a (its NO-GO stands).
- No fresh sims unless the fallback triggers.

## Horizon, seeds, policies (corpus re-analysis — no new sims)

- **Corpora:** `evidence/2026-11-18/perseed-rage-setup-a-{ctl,arm}/`
  (8 files each), band **106001–106008**, 150d, competent policy,
  substrate both legs (`VETREENGAGE=1 + PARTYSIZE4=1 +
  FLEEREPAIR2=1 + FIGHTALLY2=1 + WILDAVOID=1 + LAUNCHPARTY=1`,
  `FIELDCAPDMG=1`; arm leg `RAGEFREE=1`, ctl leg unset). The
  corpora are frozen evidence from Loop A; this arm reads them only.
- **Verb rows verified present pre-prereg** (census, not judging):
  "Walk In" appears in 4 arm corpus files; the Kavira d132 arm row
  carries a field-medicine line on its Rage round. The corpora CAN
  answer the question — the fresh-band fallback is NOT triggered
  on this ground.
- **Fallback (only if the corpus fails the floor or the
  classification):** fresh 8-seed pilot on a FRESH band, assigned
  ONLY after the mandatory seed-band freshness check — grep EVERY
  dated prereg under `evidence/` (`evidence/*/sim-*-prereg.md`)
  plus any forbidden/contaminated band list those name; a band
  named anywhere is used. **Confirm bands 104911–104926 and
  104941–104956 stay fresh** (named by the carrier arms; do not
  spend them). No band is spent by this arm as frozen.
- **Instrument:** `scripts/analyze-ragepreempt-b.js` (recorder /
  analyzer over the frozen corpora; `--selftest` for the
  classifier) + `scripts/test-ragepreempt-b.js` (proof test:
  selftest shapes + the real corpus rows named above). Analysis
  output: `evidence/2026-11-19/ragepreempt-b-analysis.json`.

## Encounter-gear fixture (Steve 2026-11-13)

Not applicable as a staged fixture — this is a corpus re-analysis
of fights the competent policy already played with encounter gear
(geared scholar + party). The corpora record what was played; no
fixture is staged here.

## Canon note

`docs/CANON.md` (manifest) read. No canon doc covers the Rage /
turn-verb ordering or the field engine — verified by grep
(`docs/*.md` for Rage / turn verb: only `docs/ENDGAME-BUILDS.md:68`,
which names Rage as a fantasy — "Rage as a renewable resource" —
not a rule for the field engine). Said here rather than inventing
canon; the mechanism is cited from code (`godpath.js` fieldAct,
`fieldFights.js` villager phase + verb chain), as the rage-setup-a
prereg already recorded for the field engine. The card text in
`src/data/abilities.json` ("Your next three strikes deal double
damage") promises doubled strikes, not a lost turn — the free-action
change is engine behavior, not canon.

## Correction 1 — 2026-11-19 ~00:10 CST, BEFORE the judged run completes

The instrument's first (shakedown) run on the frozen corpora exposed
two errors in the frozen model — both in how the classifier labels
rows, neither in the frozen metric, pool floor, or interpretation
rule. The arm-leg classifications are IDENTICAL before and after
this correction (4 pre-empted / 10 observable, harmful 3/10); only
labels and one unsatisfiable test case change.

(a) **The ctl Rage round is a `consumed` signature, not
"unclassified".** The frozen text said the verb chain never runs on
the ctl Rage round — true — but did not state the corollary: the
ctl Rage round therefore shows NEITHER a strike NOR a verb (Rage
returns `consumed = true`; the Maya d93 ctl transcript confirms:
Rage line, then only the monster phase). The classifier labelled
all 20 observable ctl rows "unclassified". Corrected: a
no-strike-no-verb Rage round is status `consumed`. The ctl control
bar is now "every observable ctl Rage round shows the consumed
signature AND 0 are pre-empted" (previously "0 unclassified",
which mislabelled the expected signature). The classification
completeness bar still applies to the ARM leg, where a consumed
round is forbidden by the mechanism model (the chain always ends
in a strike) and counts as incomplete.

(b) **Ruby d139 (seed 106005, arm) is UNOBSERVABLE, not "not
pre-empted".** The frozen test-case list asserted Ruby d139 → not
pre-empted (from the rage-setup-a paired-damage table, 216→238).
The corpus row carries `carrierRage: true` (the engine-side flag —
the Rage branch ran and set `carrierRageFired`) but its persisted
log is capped at 20 lines and contains no `(Rage)` line and no
doubled strike in R1–R4; the identical ctl-leg log confirms the
same truncation. The Rage round sits in the cut tail (R5/R6),
beyond the persisted log — the WHY (all Rage-branch conditions
read true from R1) is not established from the corpus and is
recorded as an open observation in the evidence file, not a
verdict item. Ruby d139 is therefore removed from the
not-pre-empted test cases and counted as `rage_round_unobserved`
(1 of 11 arm rows; the pool floor already allows up to 3).
The denominator is the 10 observable rows. The paired-damage
claim for Ruby stands on the rage-setup-a analysis numbers, not
on this classifier.

## Metric review

(To be filled at closeout.)
