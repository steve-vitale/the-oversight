# sim-m1range-a — M1RANGE: the awareness check takes a ranged term (finding #2590)

**Verdict: NO-GO.** The term works exactly as built — it applies on every
aware-gated ranged-holder meeting, the evadeP replication is exact, the
engine-vs-driver term mismatch is 0 — but the served count fell: arm served
12 ranged-holder wave-4+ meetings against ctl served 34 (37 once the
classifier gap below is corrected). The frozen GO rule needs
served_arm > served_ctl. The wall is the thin holder pool itself (48 ctl
meetings collapsed to 16 arm meetings), not the awareness math. The next arm
must attack supply/presence, not the awareness check.

## The arm

- **Question** (0715Z blank 2, #2590): give the awareness check a ranged
  term. The check is `src/js/fieldFights.js` ~line 905–940, `if
  (opts.awareness)`: evade = 0.35 + min(0.30, tracking\*0.01) + behaviorMod
  − 0.02\*mSpeed − 0.03\*mNotice + 0.05\*mSize + (potential?0.05:0) +
  ability terms, clamped 0.05–0.90; `RR() < evade` → outcome 'evade', no
  fight at all.
- **Lever** (env-gated, default OFF): when the lead carries a ranged weapon
  WITH ammo — the volley's own predicate, equipped ranged weapon whose def
  carries `weapon.ammo`, ≥1 ammo by item id OR material — reduce evade by
  a fixed term: **−0.15 quivered bow, −0.25 armed searcaster**. The term
  applies after the ability terms and the godpath detection term, before
  the clamp; it is recorded on the fight record as `rec.m1rangeTerm`.
- **Prior evidence**: evadebow (DIAG-GO): 3 served quivered-bow leads, 3
  evades, 0 engaged; the 0.67-evadeP case (seed 107155 day 65, crude bow,
  7 arrows, never fired). m2step2 (NO-GO): 0 fought served meetings, both
  pool meetings awareness-evaded (0.55 with 1 arrow, 0.57 with 5).
  shape2 (NO-GO on participation): the gun tier never fires because no
  living gun holder passes filters at ~85% of unarmed launches.
- **Base**: master `b6aad8942`. **Band**: 107211–107218 (8 seeds × 2 legs),
  horizon 150d death-aware, competent policy. **Legs differ ONLY by
  M1RANGE**: ctl = substrate only, arm = substrate + M1RANGE=1. Substrate
  both legs: `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`. `BOWKNOW`,
  `DEPARTSEE`, `EVADEOBS`, `FIBERFETCH`, `LEND`, `DEPMAT`, `ROLL35`,
  `AMMO` unset both legs. No game.js substrate was re-landed — all four
  supply flags were already present in base `b6aad8942`.
- **Commits**: prereg `1de1b3512` (frozen before any judged sim); lever +
  instrument `2929cd62a` [needs-eyes]; proof test
  `scripts/test-m1range-a.js` 84/84 green (incl. analyzer selftest 72/72
  and live fixed-draw legs A–H: decisive bow draw evades OFF / contacts
  ON, searcaster −0.25, unarmed and 0-ammo identical ON/OFF, clamp holds
  at the 0.05 floor).
- **Corpora**: `evidence/2026-11-21/perseed-m1range-a-ctl/` (8 files) and
  `perseed-m1range-a-arm/` (8 files), plus a determinism re-run corpus
  `perseed-m1range-a-arm-rep/` (seed 107211, whole-file identical —
  see below). Analysis: `evidence/2026-11-21/m1range-a-analysis.json`.

## Frozen bars (prereg §2) — the judgement

| Bar | Frozen rule | Measured | Pass? |
| --- | --- | --- | --- |
| (a) Completeness | 0 UNCLASSIFIED, 0 instrument errors, 0 evadeP-replication mismatches, 0 engine-vs-driver term mismatches, on BOTH legs | Arm: 0 / 0 / 0 / 0. **Ctl: 3 UNCLASSIFIED** (see gap note), 0 / 0 / 0 | **FAIL under the literal frozen reading** (analyzer as-run: PASS — see note) |
| (b) Pool floor | ranged-holder lead wave-4+ meetings on the arm leg ≥ 3 | Arm pool **16** | PASS |
| (c) GO rule | served_arm ≥ 3 AND served_arm > served_ctl AND fought-served_arm ≥ 1 AND armed-volleys_arm ≥ 1 | Arm served **12** (fought-served 12, served volleys 12) vs ctl served **34** (37 corrected) | **FAIL** — 12 < 34 |
| (d) Guardrails | starvation_arm ≤ starvation_ctl + 2 (totals); median-survival_arm ≥ 0.8 × median-survival_ctl | Starvation 0 vs 0; median survival 150d vs 150d (ratio 1.0) | PASS |
| Panel | §15 balanced-panel compare attached | `review_required` (screen only) | attached, not a verdict input |

**Verdict: NO-GO.** Bar (c) fails decisively (12 vs 34), and bar (a)
fails under the literal frozen reading. The verdict is NO-GO under
either reading of (a) — the (c) gap alone decides it.

### Bar (a) gap note — the 3 ctl unclassified meetings (classifier gap, not an instrument error)

The analyzer's judge takes bar (a) from the **arm leg only**
(`analyze-m1range-a.js` line 464: `barA = arm.bars.aCompleteness`),
which is why it reported `a=true`. The frozen prereg text covers BOTH
legs. The ctl leg carries 3 unclassified meetings, all the same shape:

- seed 107211 day 118, Boris Kowalski vs herald, crude bow, 5 arrows:
  outcome `vKill`, rounds 0, mDealt 16, volley 2 shots / 1 hit / 16 dmg.
- seed 107211 day 133, vs influencer, sling, 4 arrows: `vKill`, rounds
  0, mDealt 12, volley 2 shots / 1 hit / 12 dmg.
- seed 107213 day 143, Tom Baker vs eulogy, crossbow, 7 arrows: `vKill`,
  rounds 0, mDealt 22, volley 4 shots / 1 hit / 22 dmg.

All three are **volley-only kills**: the opening volley killed the
monster before round 1, so `rounds` is 0 and the classifier's
engaged-vKill branch (which requires rounds ≥ 1) never fires. These are
unambiguously served meetings under the frozen definition (reached
contact, outcome not in {evade, alreadyDead}) and fought-served
(volley shots ≥ 1) with armed volleys. Correctly classed, ctl served
is **37**, not 34 — the (c) gap widens from 22 to 25. The classifier
was NOT patched and re-run after seeing the results; the judged numbers
stand as run, and the correction is reported here because it only
strengthens the verdict. The gap is filed for the next arm's analyzer:
class a `vKill` with rounds 0 and volley shots ≥ 1 as engaged-vKill.

## What happened, per leg

| | ctl | arm |
| --- | --- | --- |
| Ranged-holder wave-4+ meetings (pool) | 48 | **16** |
| Served (reached contact) | 34 (37 corrected) | 12 |
| Fought-served | 34 | 12 |
| Served volleys | 34 | 12 |
| Awareness-evades | 11 | 4 |
| Volley fired | 103 shots / 68 hits / 1191 dmg | 40 shots / 22 hits / 554 dmg |
| Total wave-4 encounters (all leads) | 185 | 137 |
| Classes | hopeless-after-help 20, engaged-vKill 3, engaged-vDie 4, engaged-mFlee 2, floor-hp 3, learn-withdraw 2, awareness-evade 11, unclassified 3 | hopeless-after-help 7, engaged-vKill 2, engaged-vDie 2, floor-hp 1, awareness-evade 4, unclassified 0 |
| Dominant evade class | hopeless-after-help (20/34 served) | hopeless-after-help (7/12 served, 58%) |
| Deaths (total) | 717 | 708 |
| Starvation (total) | 0 | 0 |

Per-seed served / pool:

| Seed | ctl served / pool | arm served / pool | ctl days / end / maxWave / standing | arm days / end / maxWave / standing |
| --- | --- | --- | --- | --- |
| 107211 | 11 / 17 | 3 / 3 | 150 survived / 5 / 295 | 150 survived / 4 / 199 |
| 107212 | 1 / 1 | 1 / 1 | 150 survived / 4 / 199 | 150 survived / 4 / 199 (identical run) |
| 107213 | 11 / 17 | 2 / 4 | 149 lost / 5 / 335 | 127 lost / 5 / 360 |
| 107214 | 0 / 0 | 4 / 4 | 141 lost / 5 / 485 | 126 lost / 4 / 199 |
| 107215 | 1 / 1 | 1 / 1 | 150 survived / 4 / 199 | 150 survived / 4 / 199 (identical run) |
| 107216 | 0 / 0 | 0 / 0 | 120 lost / 4 / 199 | 120 lost / 4 / 199 (identical run) |
| 107217 | 6 / 6 | 1 / 3 | 116 lost / 4 / 199 | 129 lost / 4 / 199 |
| 107218 | 4 / 6 | 0 / 0 | 150 survived / 5 / 475 | 150 survived / 4 / 199 |

Three seeds (107212, 107215, 107216) are byte-identical between legs —
no ranged-holder meeting fell in the term's decisive band there, so the
lever changed nothing and the runs coincide. Where the lever did bite,
it bit both ways: 107214 gained meetings the ctl leg never had (arm
pool 4 vs ctl 0), while 107211 lost 14 of 17 pool meetings and 107218
lost all 6.

## Mechanism check (not a GO bar) — the term works; the pool is the wall

- **Engine term recorded on all 9 aware-gated arm meetings**: −0.15 ×5
  (bow/crossbow/sling), −0.25 ×4 (searcaster). Ctl aware-gated meetings
  record 0 ×20. Term mismatch 0, evadeP-replication mismatch 0.
- **Recorded evadeP moved**: ranged-holder mean evadeP 0.324 arm vs
  0.494 ctl (−0.17, the term's size given the −0.15/−0.25 mix).
- **Aware-gated evade rate**: 44% arm (4/9) vs 55% ctl (11/20) —
  directional, n=9, within noise.
- **Contact rate** (served / pool): 75% arm (12/16) vs 71% ctl
  (34/48) — or 77% (37/48) once the volley-kills are classed. Within
  noise either way. The term moves the check; it does not move the
  count, because the count is set by how many ranged-holder leads exist
  at all — and that collapsed from 48 to 16.
- **Why the pool collapsed**: the lever changes early fight outcomes
  and the whole run diverges. Total wave-4 encounters fell 185 → 137;
  wave-5 unlocks fell 4/8 → 1/8; standing fell on every diverged seed
  (107211: 295 → 199; 107214: 485 → 199; 107218: 475 → 199). Holders
  who now stand and fight mostly do not come back: of the 12 served
  arm meetings, 7 end in a hopeless flee after help arrives and 2 in
  the holder's death; only 2 end in a kill. The volley itself does not
  make the fight winnable — the volley-hopeless read puts the
  rounds-to-kill shift at +116.7 honest rounds on average (n=10), i.e.
  the volley's damage is priced as a diluted lump in the hopeless math
  (M2 territory, unchanged by this arm). The arm leg ran ~4× slower
  than ctl (14.4 min vs 3.7 min for 7 seeds) because the extra contacts
  are extra fights.
- **The wall, restated**: shape2's finding holds — the binding
  constraint is whether a living ranged holder is present at a wave-4+
  meeting at all. Awareness math cannot serve meetings that never
  happen. The next arm must attack supply/presence (holders alive,
  armed, and at the meeting), not the check.

## Wall numbers

| | ctl | arm |
| --- | --- | --- |
| National | 0/8 | 0/8 |
| Table / wins | 0/8 | 0/8 |
| Wave 4 reached | 8/8 | 8/8 |
| Wave 5 reached | 4/8 | **1/8** |
| Median survival | 150d | 150d |

## Transcripts (SENSE-TESTING LAW — read, not just counted)

All 16 arm ranged-holder meetings read. The narration is coherent
fight prose — the holder sees the monster, opens at range, lowers the
bow, fights — and the cost of contact is legible:

- **Ruby, seed 107213 day 98, searcaster vs The Audit** (term −0.25):
  "Ruby walks straight into The Audit. No avoiding it." / "Ruby sees
  The Audit coming and nocks an arrow — the fight opens at range (2
  shots)." / "loosed — it takes The Audit for 64 (1217 left)." / "R1:
  Ruby's eyes go red. Next 3 strikes hit twice as hard. (Rage)" — 13
  rounds, vKill. The intended shape, once.
- **Hady, seed 107211 day 134, crossbow (1 arrow) vs Reunion**:
  "Hady sees Big Ugly coming and nocks an arrow — the fight opens at
  range (1 shot)." / "loosed — it takes Big Ugly for 18 (582 left)."
  / "R1: Your Move hits Hady for 34 (5 left)" — stood their ground
  with one arrow, nearly died in round 1, fled on the floor (5 HP).
  The cost of contact, in one line.
- **Sari, seed 107214 day 114, crossbow vs Eulogy**: four arrows
  loosed wide, 0 damage, then a hopeless flee after help. A bad volley
  and a lost fight, told straight.
- **Tom, seed 107217 day 52, crude bow vs The Strike**: 4/4 hits, 63
  damage, 10 rounds, vKill — the other kill.
- **Evades still read right**: "Ruby saw Big Loud in time and gave it
  room." (term −0.25 recorded, draw still above it). "Tom saw The
  Audit in time and gave it room." The term lowers the slip-away
  chance; it does not abolish it.

**Sense defect observed (pre-existing, NOT introduced by this arm)**:
the volley narration is weapon-agnostic — a searcaster holder "nocks
an arrow" and "looses" it (Ruby day 98, James day 121). A searcaster
fires fusion cells, not arrows. The volley log lines predate M1RANGE;
filed, not fixed here (out of this arm's scope — fieldFights.js volley
block only).

## Determinism

One arm-leg seed re-run into a `-rep` corpus after the pilot (seed
107211, same env, same anchor `2929cd62a`): **whole-file identical**
— depmatRows (94), ammoRows (94), v4encounters (32), deaths (151) all
byte-identical, and the full JSON identical. The pilot is reproducible.

## Balanced panel (§15)

`evidence/2026-11-21/m1range-a-panel.{json,md}` (+
`m1range-a-panel-before.json.gz` / `-after.json.gz`). Decision:
**review_required** (screen only, 8 paired cases). No material signal:
table win rate 0 vs 0, national access 0 vs 0, village deaths/run
89.6 vs 88.5 (paired delta −1.125, 95% exploratory interval −9.25 to
6.75), deaths/100d 63.2 vs 64.2 (regression_watch — interval crosses
0), community loss 0.5 vs 0.5. Most panel metrics not_observed (the
recorder corpora do not carry those fields). Not a verdict input.

## Telemetry check

**Not run — baseline absent.** `telemetry-baselines/scale-wall.json`
does not exist in this worktree, in the main tree, or in git history
(`git log --all -- telemetry-baselines/scale-wall.json` returns
nothing). `node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall.json ...` prints usage and refuses
(recorder corpora need `--allow-recorder-corpus`, and there is no
baseline to check against). Same as the evadebow/m2step2 precedent.
Recorded as absent; NOT worked around — no baseline was fabricated and
none was rolled forward. The wall numbers above are the telemetry
substitute for this arm.

## Closeout (NO-GO)

Per the prereg: the lever is reverted from `src/js/fieldFights.js` in
its own commit, hash-verified (`git diff b6aad8942 -- src/` empty at
the final tip); instrument + evidence land only. The lever stays
env-gated default-OFF in its commit history (reverted at tip) — no
default flip was made and none is proposed. The `[needs-eyes]` flag
rode on the lever commit (`2929cd62a`) as a combat-feel change; the
revert carries it too.

## Next arm

Attack supply/presence, not awareness math: get living ranged holders
to wave-4+ meetings (more holders alive, armed, and present), and the
M2 hopeless-trajectory math that makes 7 of 12 served meetings end in
a flee after help arrives. Also fix the analyzer's volley-only-kill
class (rounds 0 + vKill + volley shots ≥ 1 → engaged-vKill) and its
bar (a) to cover both legs, before the next arm judges.

## Metric review

- **Primary metric** (served ranged-holder wave-4+ meetings): arm 12
  vs ctl 34 (37 corrected) — GO rule needs served_arm > served_ctl.
  **FAIL.**
- **Completeness**: arm 0 unclassified / 0 errors / 0 rep mismatches /
  0 term mismatches; ctl 3 unclassified (volley-only kills), 0 / 0 / 0.
  **FAIL under the literal frozen reading.**
- **Pool floor**: arm pool 16 ≥ 3. **PASS.**
- **Guardrails**: starvation 0 vs 0; median survival 150d vs 150d.
  **PASS.** Deaths diagnostic: arm 708 vs ctl 717.
- **Mechanism**: term recorded on 9/9 aware-gated arm meetings
  (−0.15 ×5, −0.25 ×4); termMismatch 0; evadePRepMismatch 0; recorded
  mean evadeP −0.17 vs ctl. **The lever works; the pool is the wall.**
- **Panel**: review_required, no material signal. **Attached.**
- **Determinism**: arm seed 107211 re-run whole-file identical. **PASS.**
- **Telemetry**: baseline absent, not run, not fabricated. **Recorded.**
- **Transcripts**: 16/16 arm meetings read; narration coherent; one
  pre-existing sense defect noted (searcaster "nocks an arrow").
- **Verdict: NO-GO.** Lever reverted hash-verified; instrument +
  evidence landed only.
