# sim-needwave-a — needWave copy in the companion plan sync

**Verdict: NO-GO — det-gate (prereg bar 2).** The lever's intended effect works
where it fires, and the primary, trio, beat, starvation and survival bars all
pass — but the determinism gate fails on 2 of 8 seeds, and the failure is not
harness noise: it is a real side-effect of the lever as written. A leader
whose own plan has no wave target wipes a companion's good wave number when
they set out together, turning a later four-person launch into a silent pair.
The game-code change is reverted zero-trace per kill protocol (instrument +
evidence kept). The fix for the fix — copy only when the leader's wave number
is set — is a follow-up arm, not a re-score of this one.

- **Run:** fleshout-20261122T0615Z, axis scale-onramp, arm sim-needwave-a
- **Prereg:** `evidence/2026-11-22/sim-needwave-a-prereg.md`, commit `57f19d1b9`
  (frozen before any judged run)
- **Instrument:** `scripts/needwave-driver-a.js`, `scripts/analyze-needwave-a.js`,
  `scripts/test-needwave-a.js`, `scripts/build-needwave-panels-a.js`, commit `7696e4398`
- **Fix commit (reverted):** `587ce525d` — "copy needWave in the companion plan
  sync [needs-eyes]"
- **Band:** 107375–107382 (8 seeds, verified fresh in the prereg)
- **Horizon:** 150 days, death-aware. **Policy:** competent verbatim.
  **Substrate:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; LEND/PRESENCE/
  KILLBUNDLE/HPGATE/PINQUAD/HYPOFLOOR unset.
- **Leg order (frozen):** ctl on old code first (anchor `7696e4398`), fix
  committed, arm on new code second (anchor `587ce525d`). Analyzer verified
  both anchors and both file shas (ctl win-plan `51b190c6c4ee`, brain
  `f5da2607c26b`; arm win-plan `a4a03e41452a`, brain `c09a0d8760c2`).
- **Analysis:** `evidence/2026-11-22/needwave-a-analysis.json` (analyzer exit 0)
- **Corpus:** `evidence/2026-11-22/perseed-needwave-a-ctl/` and
  `perseed-needwave-a-arm/` (8 files each, 0 instrument errors on all 16)
- **Panel:** `evidence/2026-11-22/needwave-a-panel-before.json.gz` /
  `-after.json.gz`, compare `evidence/2026-11-22/needwave-a-panel.md`
  (decision: review_required)

## 1. The lever played

Leadgate (sim-leadgate-a, band 107359–107366) found there is no lead-selection
rule — the leader IS whoever holds the win-plan — and the companion plan sync
copies the target but NOT the wave number (`needWave`). Consequence measured
there: 22 of 33 launches were led by a holder whose plan had no wave number,
and ALL of them went out as pairs (mean party 1.95, 0 trios) versus 11 of 11
trio-or-bigger for holders with a wave number (mean 3.82), and the departure
announcement stayed silent on the null half.

This arm copies `needWave` in that sync — one line per companion, three syncs
per site, at BOTH sites, because the site named in the brief is not the live
one (see §2):

- `src/js/win-plan.js`, `launchParty`: `cplan.needWave = plan.needWave;`
  (and `cplan2` / `cplan3`). This path is DEAD in sims — the brain owns dawn
  and `agencyTick` never reaches it — but the copy belongs there too, so the
  two paths cannot drift apart again.
- `src/js/villager-brain.js`, `vbrainExecuteDepart`: `cplan.needWave =
  plan2 ? plan2.needWave : null;` (and `cplan2` / `cplan3`). This is the live
  path: all 18 launches on this band came through it (source `brain` on every
  `v4departs` row).

Nothing else in game code was touched. The first companion's sync still copies
no target/node on the brain path — that gap is a separate finding, not this
lever (see §7).

## 2. Before / after on identical seeds

Zero-launch rule cleared: ctl 11 launches, arm 7 (bar needs ≥ 5 per leg).

| Bar (prereg §6) | Control | Armed | Threshold | Result |
|---|---|---|---|---|
| 1. Instrument validity | proof 23/23, analyzer selftest 19/19, 0 errors on 16 files | same | all must hold | PASS |
| 2. Det-gate | — | 2 of 8 seeds diverge before the first recorded copy | all must hold | **FAIL** |
| 3. PRIMARY — launches with no wave number | 4/11 = 0.36 | 1/7 = 0.14 | armed ≤ 0.25 | PASS |
| 4. Trio+ launch rate | 4/11 = 0.36 | 3/7 = 0.43 | armed > control | PASS |
| 5. Departure-beat rate | 7/11 = 0.64 | 6/7 = 0.86 | armed ≥ control | PASS |
| 6. Starvation guardrail | 5 total | 5 total, max per-seed excess +1 | ≤ ctl+2 total, ≤ +2 per seed | PASS |
| 7. Survival guardrail | median 149.5d | median 139.5d | ≥ 0.8 × control | PASS |
| 8. NO-GO rule | bar 2 missed | — | any miss → NO-GO | **NO-GO** |

Per seed (launches / null launches / trio+ / beats spoke / starvation deaths /
total deaths / days / end):

| Seed | Control | Armed |
|---|---|---|
| 107375 | 0 / 0 / 0 / 0 / 1 / 128 / 149d survived | 0 / 0 / 0 / 0 / 1 / 128 / 149d survived |
| 107376 | 0 / 0 / 0 / 0 / 0 / 81 / 121d lost | 0 / 0 / 0 / 0 / 0 / 81 / 121d lost |
| 107377 | 3 / 1 / 1 / 2 / 1 / 101 / 151d survived | 1 / 1 / 0 / 0 / 0 / 113 / 118d lost |
| 107378 | 1 / 0 / 1 / 1 / 0 / 126 / 150d survived | 1 / 0 / 1 / 1 / 0 / 126 / 150d survived |
| 107379 | 0 / 0 / 0 / 0 / 2 / 73 / 100d lost | 0 / 0 / 0 / 0 / 2 / 73 / 100d lost |
| 107380 | 0 / 0 / 0 / 0 / 0 / 118 / 151d survived | 0 / 0 / 0 / 0 / 0 / 118 / 151d survived |
| 107381 | 7 / 3 / 2 / 4 / 1 / 75 / 121d lost | 5 / 0 / 2 / 5 / 2 / 77 / 130d lost |
| 107382 | 0 / 0 / 0 / 0 / 0 / 66 / 152d survived | 0 / 0 / 0 / 0 / 0 / 66 / 152d survived |

Wall numbers (scale wall — the axis question): wins 0 → 0, national 0 → 0,
wave-5 reached 3 → 3 villages, wave-4 reached 8 → 8, median survival
149.5d → 139.5d, villages lost 3 → 4. No movement toward the table on either
leg. Table entry is not instrumented by this driver — recorded as not
instrumented, never faked.

## 3. Village assessment, in plain words

The lever does what it was built to do, on the seeds where it gets a chance.
On seed 107381 the three silent pair launches from the control leg — Brian
setting out alone, Quinn setting out twice as a pair — all speak on the armed
leg, and none of the five armed launches lacks a wave number. On seed 107378
the launch is the same four-person party with the same announcement on both
legs, and the copy quietly fills in the three companions' wave numbers
underneath. That is the intended effect, measured, not assumed.

But the lever also does the exact opposite on seed 107377, and that is why it
does not ship. Jason had a proper plan — hunt The Congregation, wave 4 — and
on the control leg he sets out day 63 with Maya, Mia and June, and the
village hears about it. On the armed leg he sets out the same day with Maya
only, in silence, because the day before, Mia — whose own plan had no wave
number — led a departure with Jason as her companion, and the sync copied
Mia's blank wave number over Jason's 4. The copy is symmetric: it copies a
blank just as faithfully as a 4. One seed's trio became a solo, its village
lost 33 days sooner (118 days vs 151), and the band's launch total fell from
11 to 7. The guardrails still pass — starvation is flat at 5 and 5, survival
is inside the bar — but the launch funnel, the thing this lever exists to
fix, got worse on that seed.

The right shape of this lever is a guarded copy: fill in a companion's wave
number only when the leader actually has one, and never erase one that is
already there. That is a follow-up arm (sim-needwave-b), not a patch to this
run — this run's verdict is frozen at NO-GO.

## 4. Why the det-gate failed (root cause, with rows)

The gate compares every recorded event stream between the legs up to the
armed leg's first recorded copy. It fails on two seeds:

- **Seed 107377** — no copy is ever recorded (bound: none), yet the legs
  diverge from day 58. **Seed 107378** — first recorded copy day 127, yet
  the legs diverge from day 67.

Both divergences are the same event, and both are caused by the lever:

**107377, day 57 → 58.** Jason (gen_s6l9b3t) is seeded a plan on day 57 on
BOTH legs, identically: hunt The Congregation, wave 4. On day 58 Mia
(mia_andersson) departs with Jason as her companion — identical departure
rows on both legs (`launched=['gen_s6l9b3t']`, target None, wave None). Mia's
plan has no wave number, so the armed sync writes `needWave = null` into
Jason's plan, erasing his 4. The old code writes stage and party but leaves
the wave number alone, so Jason keeps his 4. Day 63: control launches Jason
with Maya, Mia and June (party of 4, announcement speaks); armed launches
Jason with Maya only (party of 2, silent).

**107378, day 66 → 67.** A villager (gen_6d9jp15) holds hunt The Buffering,
wave 3, on both legs through day 66. On day 67 his wave number becomes null
on the armed leg only — same wipe, as a companion of a leader with no wave
number. The first *recorded* copy on this seed is day 127 (Dmitri copying 4
to three companions), so the gate's bound is 60 days late.

The gate's bound was wrong because the instrument that feeds it is blind to
this change in two ways (`scripts/needwave-driver-a.js`, `diffNeedWaves`):

1. It drops every change whose new value is null (`a != null` filter) — a
   wipe to null is never a "copy" row.
2. It skips the leader's own plan (`k === holderVid`) — a change to the
   departing leader's plan is never recorded either.

So the det-gate failure is a genuine catch, not harness noise: the legs
really do diverge before the lever's first *helpful* copy, because the lever
also copies blanks. The instrument needs the same fix as the lever: record
every wave-number change including wipes to null, and include the holder.
Six of eight seeds pass the gate cleanly (including 107381 with bound day 81
— identical streams before it), which is why this reads as a lever defect
with a sharp onset, not a flaky harness.

## 5. Sense-test: the departure announcements

Verbatim lines from the corpus (`beatLines`):

**Seed 107381 — the lever working.** Control, day 95: Brian sets out alone,
silently. Day 96 and 101: Quinn sets out as a pair, silently. Armed, those
same departures speak:

- 📺 SYSTEM: "Brian sets out with Quinn after Big Loud — the fire marks the
  trail." (day 95)
- 📺 SYSTEM: "Quinn sets out with Liam after Big Loud — the fire marks the
  trail." (day 113)

Vasyl's three announcements are byte-identical on both legs. A party setting
out reads as a party; the silent pairs read as people slipping away alone.
This is the difference the lever was built to make, and on this seed it
makes it.

**Seed 107377 — the lever hurting.** Control, day 63:

- 📺 SYSTEM: "Jason sets out with Maya, Mia and June after The Congregation
  — the fire marks the trail."

Armed, day 63: nothing. Jason sets out with Maya only, and no one says so.
The same departure, the same day, a trio with a voice versus a pair without
one — decided the day before, when Mia's blank wave number overwrote Jason's.

**Seed 107378 — the lever invisible.** Both legs, day 127, identical:

- 📺 SYSTEM: "Dmitri sets out with Thabo, Connor and Meera after The
  Congregation — the fire marks the trail."

Dmitri already held wave 4; the copy filled his companions in underneath,
and nothing about the launch itself changed.

## 6. Launch-funnel findings (carried from the control leg)

These were found on the control leg and are unchanged by the lever; they are
the reason launches are rare on this band at all (11 launches in 8 villages
over 150 days, while wave-4 fights number 7–46 per village):

- **The homebody holder.** Seed 107380: Dale Hoffman held a wave-4 strike
  plan (wave 4) from day 86 to day 150, got 41 dawn commits to launch with
  companions picked, and held all 41 — he is a homebody, and `startExpedition`
  refuses him at the range check. Armed, armed and armored, healthy, at Haven
  — and never leaves.
- **The forager choke.** Seed 107375: holders are foragers. The dawn tick
  only reaches the depart call for non-rangers when they hold a launch commit
  today; otherwise it moves on with no depart call at all. Plans sit in
  `party` for weeks (1–35 days) with no departure ever attempted.
- **The dominant plan shape is (`hunt`, no target, no wave).** Hundreds of
  census rows. That is the brain-path first-companion sync shape: stage hunt,
  no target, no wave number — the companion sync's first slot copies stage
  and party only. Villagers fight wave-4 monsters constantly without ever
  launching a plan at them.

## 7. New findings for the backlog

- **Null-holder wipe (this run, root-caused).** The companion sync copies
  the leader's wave number unconditionally, so a leader with no wave number
  erases a companion's set wave number. Measured: seed 107377 (Jason's 4
  wiped day 58, trio → solo, silent) and seed 107378 (wave 3 wiped day 67).
  The fix is a guarded copy — copy only when the leader's wave number is
  set. Follow-up arm: sim-needwave-b.
- **Instrument blind spot (this run).** `diffNeedWaves` drops changes to
  null and skips the holder's own plan, so the det-gate's first-copy bound
  can be days late or absent. Any future arm using this driver must record
  every wave-number change, including wipes.
- **Brain-path first-companion target/node gap (carried, still open).** The
  first companion's sync copies no target and no node on the brain path
  (win-plan.js path does copy them for companions 2 and 3). Recorded in the
  prereg as a separate finding, not fixed by this lever.

## 8. Panel comparison (§15)

`node scripts/balance-panel.js compare` on the paired 8-seed panels:
decision **review_required**. Table win rate 0 → 0, national access 0 → 0,
first-bearer survival through day 30/60 unchanged (1 → 1). Village deaths
per run 96 → 97.75 (+1.75, regression_watch), deaths per 100 days 70.0 →
73.3 (+3.27, regression_watch), community loss 0.375 → 0.5 (+0.125,
regression_watch). The panel is the instrument; the frozen bars in §2 are
the judge. No scale movement; the death uptick stays inside the frozen
guardrails.

## 9. Proof and check status

- **Proof test** `scripts/test-needwave-a.js`: 23/23 on the new code; fails on
  old code as designed (8 fail: companion wave number stays null, beat hook
  silent). Fixture: holder Amina with a live Herald plan (wave 4),
  companions Diana (pre-existing plan, null), Emmett, Femi (planless) — all
  armed and armored, per the encounter-gear rule (a geared scholar with a
  party, never a fresh un-geared scholar alone).
- **Pre-flight green before any judged run:** killlootbundle proof 12/12,
  analyzer selftest 17/17, leadgate proof 33/33, leadgate analyzer selftest
  21/21, needwave analyzer selftest 19/19.
- **Directly-affected tests on the new code:** departbeat 34/34, leadgate
  33/33, villager-brain-dawn passes. partysize4-b 41/1 and companionguard-b
  fail only on frozen-base diff/policy-sha checks that compare the worktree
  against preregs from older bases (21 files changed on master since, none
  by this arm — `git status` confirms this arm touched only win-plan.js and
  villager-brain.js); those failures are pre-existing on this worktree.
- **`node scripts/check.js --quick`:** 337 passed, 7 failed, twice in a row
  (1258s and 1111s; full log `evidence/2026-11-22/needwave-a-check-rerun.log`).
  The 7: 3 × 120s timeouts under load (living-garden, occupation-panels,
  one-person-army deed-attainment suites) and 4 stale-proof failures
  (measurement-workflow, measurement-proof-update, measurement-cache-flags,
  phone-frame-proof). The measurement-workflow failure was reproduced on a
  clean checkout of the base commit `bda6ff495` — the neutrality proof was
  already stale before this arm's change (other arms' landings moved the
  game inputs after the last proof refresh). None of the 7 is caused by this
  lever.

## 10. Instrument note

The panel builder shipped with a wrong default output date (2026-11-20,
copied from the evade builder); the default is corrected to 2026-11-22 in
this run and the panels were rebuilt at the right path. The misplaced files
were deleted, not committed.

## 14. Metric review

Per prereg §6 bar 8 and §8: no bar is re-scored. The verdict is NO-GO on bar
2 (det-gate). Bars 3–7 all pass, so the lever's intended effect is real and
measured — but the det-gate failure is not a paperwork miss: it caught a
real, lever-caused divergence (the null-holder wipe, §4) that the instrument's
copy record was blind to, and that divergence turned a trio launch into a
silent solo on one seed while the band's launch total fell 11 → 7. A NO-GO
that passed its primary bar is still a NO-GO; the evidence says which bar
and why, and the game-code change is reverted. What would change the verdict
is not a friendlier metric but a different lever: a guarded copy (fill only,
never erase), judged on a fresh band with a copy record that sees wipes.
The panel's regression_watch flags (deaths +1.75/run, community loss +0.125)
agree with the guardrail direction but stay inside the frozen bars; they are
not the verdict and are not re-scored either.

## Blanks

- **Table entry:** not instrumented by this driver; 0 wins / 0 national on
  both legs, so nothing to report either way.
- **Win-plan.js launchParty path:** confirmed dead in sims (all 18 launches
  via the brain path). The copy was still applied there for parity; the
  reverted commit removes it from both sites.
- **Seed 107377's village-lost on the armed leg (118d vs 151d survived):**
  downstream of the day-58 wipe and the lost trio launch; the village lost
  its wave-4 killers' momentum, not its food (starvation 0 on the armed leg
  vs 1 on control).
- **Why launches are rare at all:** §6 — homebody holders, the forager
  dawn choke, and targetless plans. The needWave copy cannot fix a launch
  that is never attempted; that is the next wall after the guarded copy.
