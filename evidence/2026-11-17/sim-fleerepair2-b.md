# sim-fleerepair2-b — flee-repair BUILD on finding #2500

**Arm:** sim-fleerepair2-b (Loop B) · **Branch tip at panel time:** `26075585f`
(sim-fleerepair2-b: FLEEREPAIR2 seed gate (finding #2500) + instruments + proof)
· **Prereg:** `evidence/2026-11-17/sim-fleerepair2-b-prereg.md` (commit `adb03c4c2`,
frozen before any sims) · **Band:** diagnosis 103601–103608, panel 104001–104008
(fresh) · **Horizon:** 150d death-aware · **Policy:** competent verbatim ·
**Substrate both legs:** `VETREENGAGE=1 PARTYSIZE4=1` · **Armed leg adds:**
`FLEEREPAIR2=1`.

## Verdict: NO-GO per the frozen prereg — B1 UNJUDGEABLE on the fresh panel

The fix works exactly as designed and every guardrail passes, but the fresh
panel band never produces the phenomenon the primary bar judges: the control
leg launches **zero** suburb hunts, so per the prereg's frozen PANEL
calibration ("fresh-band ctl leg must show ≥1 suburb-hunt launch; if 0, B1 is
UNJUDGEABLE (not a GO)") the primary bar cannot be judged. The analyzer's
`judgeB1` passes vacuously at 0 launched suburb meetings on both legs — the
calibration gate is what stops that from reading as a GO. This is not a fix
failure: the gate fired on all 3 suburb-seed events on the armed leg, the
diagnosis band reproduces the defect, and the proof test is 29/29. What is
missing is a judging band: a band where suburb hunts actually launch.

| Bar | Result | Numbers |
| --- | --- | --- |
| B1 (PRIMARY): launched meetings vs a leave-counter species (suburb) | **UNJUDGEABLE** (analyzer: PASS 0→0, vacuous) | ctl suburb launches 0, armed 0; launched suburb meetings 0→0 |
| B2 (no-kill-loss): wave-4 kills armed ≥ control | **PASS** | 6 → 7 |
| B3 (guardrail): expedition deaths armed ≤ control ×1.10 AND total deaths armed ≤ control ×1.10 | **PASS** | exped 239 → 239; total 738 → 743 (×1.10 cap 811.8) |
| B4: proof green on final tip | **PASS** | `scripts/test-fleerepair2-b.js` 29/29, 0 fail |
| Instrument | **CLEAN** | 8/8 files both legs, 0 instrument errors, missingHp 0, recMismatch 0/0 |
| B5: balanced panel, no uninvestigated regression | **INVESTIGATED** | `review_required`; one `regression_watch` (village deaths/run 92.25 → 92.875) traced to the single diverging seed 104001; expedition deaths flat — see §Metric review |

## The lever, in plain words

Finding #2500: a launched party meets The Suburb — a wave-4 monster whose
counter is to LEAVE, not fight — and walks out in round 1 without landing a
blow, again and again. The fight itself is correct: villagers who know the
trick do the right thing. The defect is upstream: whenever a villager flees,
evades, or avoids any wave-3+ monster, the village's plan system seeds a
kill-hunt plan naming that monster — including The Suburb, which cannot be
killed by fighting. So the village keeps sending parties at a street it can
only walk away from, and each party correctly walks away, and the plan
re-seeds, forever.

The fix is one gate in `winPlanSeedFromFight` (`src/js/win-plan.js`):
under the default-OFF env flag `FLEEREPAIR2=1`, a seed call naming The Suburb
returns null and creates or retargets no plan. The existing plan, if any, is
left untouched (mid-expedition safety — a stated limitation). The 'leave'
trick, the turn-based flee repair, monster stats, and launch gates are all
untouched. The gate covers all four seed call sites because they all funnel
through `winPlanSeedFromFight`. The Suburb carries no `counter` field in
`monsters.json` — the leave-counter fact lives only in the hardcoded
`mid === 'suburb'` branch in `fieldFights.js` — so the gate names the id with
a citation, matching the codebase convention.

## What changed

- `src/js/win-plan.js`: `fleerepair2On()` helper (same pattern as
  `vetreengageOn`/`planfixOn`; off in the browser, on only when
  `process.env.FLEEREPAIR2 === '1'`) + the seed gate inside
  `winPlanSeedFromFight`, after the wave≥3 check, before any plan is created
  or retargeted.
- `scripts/fleerepair2-driver-b.js`, `scripts/analyze-fleerepair2-b.js`,
  `scripts/build-fleerepair2-b-panels.js`: own instruments (partysize-arm
  copies, adapted; v4seed rows carry `blocked`; analyzer counts
  `suburbSeeds` / `blockedSuburbSeeds` / `suburbLaunches` /
  `suburbLaunchedMeetings` / `suburbLaunchedRound1Zero` /
  `suburbLaunchedWiseLeaves` and judges B1/B2; drift check fires when the
  lever never fires).
- `scripts/test-fleerepair2-b.js`: proof test, 29 checks (§1 live
  reproduction of the round-1 wise leave; §2 live seed gate on/off +
  non-leave control + existing-plan untouched; §3 analyzer on synthetic legs;
  §4 driver exports).

## Diagnosis — the defect reproduces on the frozen band (ctl env only)

Band 103601–103608, 8 seeds, `VETREENGAGE=1 PARTYSIZE4=1`, anchor
`26075585f`. 8/8 files, 0 instrument errors. Calibration gate **passes**:
suburb-hunt launches 9, launched suburb meetings 3, of which round-1-zero 2,
wise leaves 3.

Seed 103602 is the whole story, and it is the same seed as the held corpus:

- Six suburb seed rows: day 89 two at party stage (dmitri_sokolov,
  app_mgpspjz6533), then hunt-stage re-seeds days 102, 105, 125, 127.
- Six suburb meetings. Before the trick is known the villagers fight it:
  day 88 (3 rounds, 129 dealt, fled) and day 89 dmitri (4 rounds, 265 dealt,
  fled) — they learn the trick by surviving a mauling. After that, every
  meeting is the round-1 leave: day 89 app_mgpspjz6533 (a world-tick
  meeting the same day the plan was seeded, before the launch), day 90
  ruby_callaghan (the launched trio), day 126 emma_larsen — all rounds 1,
  dealt 0, `fleeWise`. Day 125 dmitri is the same leave with 44 dealt: the
  opening ranged volley lands before the lead reads the streets and walks
  out, so round-1-zero is a subset of the wise-leave shape, not the whole
  of it. The launched subset is three meetings (d90, d125, d126), two of
  them round-1-zero.
- Launched-meeting mean share on the leg 0.0107 (n=3); the three suburb
  meetings are the 0-share bulk of it. Wave-4 kills 6, deaths 744
  (expedition 237, starvation 2).
- Wall: national standing 2 villages, national rank 0, table 0, wins 0,
  wave 4 unlocked 7/8, wave 5 unlocked 2/8, median survival 151 days.

The diagnosis rerun is weaker than the held corpus (6 launched meetings
there, 3 here) — trajectories drift with the moved anchor — but the shape,
the seed, and the mechanism are the same.

## Before / after — fresh panel band 104001–104008

| Metric (8 seeds) | Control | Armed (`FLEEREPAIR2=1`) |
| --- | --- | --- |
| Launches (all size 2; no trios/quads on this band) | 7 | 8 |
| Suburb seed events (`mid='suburb'`) | 3 | 3 |
| Gate blocked (`blocked=true`) | 0 | 3 |
| Suburb-hunt launches | 0 | 0 |
| Launched suburb meetings | 0 | 0 |
| Wave-4 kills | 6 | 7 |
| Deaths (total / expedition / starvation) | 738 / 239 / 2 | 743 / 239 / 2 |
| Villages survived | 5/8 (lost 104001 d125, 104002 d145, 104008 d89) | 6/8 (lost 104002 d145, 104008 d89) |
| Launched meetings (any target), mean damage share | 3, 0.3728 | 3, 0.3728 |
| Companion pool: dawns scored / empty | 67 / 48 | 72 / 48 |
| Wall: national standing / rank / table / wins / wave 4 / wave 5 | 2 / 0 / 0 / 0 / 8 / 2 | 2 / 0 / 0 / 0 / 8 / 2 |
| Median survival (days) | 150 | 151 |

The three suburb seed events, per seed (trajectories identical except where
the gate fires):

- **104001, day 118, boris_kowalski, world-tick fled.** Control seeds a
  party-stage plan targeting the suburb; armed blocks it (`blocked=true`,
  no plan). This is the only firing that changes behavior — and the only
  seed where the legs diverge (see below).
- **104004, day 60, henry_zhang, agency-flee.** Control leaves the plan
  targeting `spool`; armed blocks the call; target stays `spool` either way.
  No behavioral difference.
- **104007, day 122, catalina_reyes, agency-flee.** Control leaves the plan
  target null; armed blocks the call; target null either way. No behavioral
  difference.

No suburb-targeted plan ever departed on either leg — the one control plan
(104001) sat at party stage for the 7 days the village had left. The launch
funnel is the binding stage on this band (pool empty on 48 of 67 control
dawns), so the defect's downstream shape (launch → meet → leave) never
occurs here. That is why B1 is unjudgeable rather than passed.

### The one diverging seed: 104001

Launches are identical through day 98 (25 launches). After the gate fires on
day 118, control loses Boris to a monster on day 123 and the village on day
125; armed keeps Boris, who launches day 147 against a Reunion, and the
village survives to 150. The suburb plan never launched on control, so this
is **not** "the fix saved the village from a suburb launch" — it is
downstream plan-state divergence (a suburb-targeted plan changes what its
holder bids and does at dawn even without launching). The armed leg's extra
wave-4 kill and its +5 total deaths both sit on this seed: a village that
lives 25 days longer kills more monsters, and the death count counts monster
kills too. Expedition deaths are flat (239 → 239), so there is no villager
harm signal in the divergence.

## Sense-testing

Read the 'leave' lines and `vetSays` on the diagnosis seed (103602, days
88–93) and the panel seed (104001, days 115–130, both legs).

- The wise leave reads as people making a decision, not routing: *"Miles
  reads the sterile streets — you can't kill a suburb. They walk out.
  (Navigation is victory.)"* — the same line for Ruby, Dmitri, and Emma.
  The fiction is coherent: the correct counter is voiced as reading the
  place, not as fear.
- Before the trick is known, the same villagers stand and fight the Suburb
  for 3–4 rounds and flee wounded (129 and 265 damage dealt). The learning
  path works as designed: survive a mauling, then know to leave.
- On the panel seed the day-118 Boris fight is **identical on both legs**
  (10 rounds, 317 dealt, fled at 0.37 HP — a hard fight, trick unknown).
  The fix changes nothing about the fight; only what the village does with
  the flee afterwards.
- Silence, twice over. No `vetSays` line on either leg ever voices a suburb
  hunt plan being made, a launch against the Suburb, or the gate's refusal —
  the gate returns null silently. The plan-making is never spoken, the same
  silence family as the empty morning (finding #2493) and the picked
  homebody (finding #2495). If suburb hunts are ever meant to be a thing
  villagers talk about, the plan needs a voice line; the gate, being a
  refusal, arguably needs one too ("we're not going after that street").
  Out of scope for this arm; noted, not built.

## Metric review

- **B1's calibration gate did its job.** The analyzer's `judgeB1` passes
  vacuously at 0 launched suburb meetings on both legs. Without the frozen
  calibration rule (control must show ≥1 suburb-hunt launch) this panel
  would have read GO on an empty phenomenon. The gate exists for exactly
  this band: launch-poor (7–8 launches across 8 seeds, pool empty ~72% of
  dawns), so the suburb plan never becomes a suburb launch. The metric
  (count of launched meetings vs a leave-counter species) is the right one;
  the band is the wrong population for it.
- **B3's guardrail is not noise.** Total deaths +5 with expedition deaths
  flat looks contradictory until the death count's contents are checked:
  it counts monster kills as well as villager deaths. The +5 is the
  longer-lived armed 104001 killing more monsters. The guardrail compares
  leg totals as frozen, and it passes either way (743 ≤ 811.8).
- **Drift check:** did not fire, correctly — the lever fired (blocked 3),
  so the legs are not expected to be identical. On the 7 non-diverging
  seeds the per-seed deaths and kills are identical between legs, which is
  the determinism the single-seed recovery relied on (see §Infrastructure).
- **recMismatch 0/0 on the panel.** The Pack Hunt / Bird Strike recovery
  hole (findings #2497/#2501) did not bite here. On the diagnosis
  self-comparison (same leg vs itself) it reads 1/1 — the known hole,
  diagnostic only per the prereg, no verdict moves.
- **Balanced panel (B5):** `review_required`. The single `regression_watch`
  is village deaths per run, 92.25 → 92.875 (+0.625, 95% exploratory
  interval 0 to 1.875) — the 104001 divergence above, investigated, with
  expedition deaths flat. Everything else is `no_material_signal` (table
  win 0 → 0, national scale access 0 → 0, community loss 0.375 → 0.25,
  village deaths per 100 days 66.33 → 64.92). No uninvestigated regression.
- **What B2 does not show:** wave-4 kills 6 → 7 is one kill on the
  longer-lived armed 104001. That is a survival artifact, not the gate
  improving killing — the gate only ever *removes* suburb hunts, which
  could not have killed anything. The no-kill-loss bar passes, and that is
  all it claims.

## Infrastructure notes (for the record, not the verdict)

- **Write flap, twice.** The first panel attempt failed instantly (both
  legs rc=1 in ~2s, empty logs) — same window, recovered by re-running.
  The control leg then lost seed 104001's file: the driver's atomic write
  left a 0-byte `.tmp-42776` and the driver still exited rc=0. Recovered
  with a single-seed re-run of 104001 under the control env (deterministic
  per seed — the other 7 seeds are trajectory-identical between legs);
  the recovered file parses, mode `ctl`, days=125 (village-lost, vs 150 on
  the armed leg), 0 instrument errors. The panel numbers above use the
  recovered file.
- **`check.js --quick`: completed on the third attempt — 334 passed, 6 failed
  in 597s** (`fleerepair2-b-check-quick-2.log`). Attempts 1 and 2 never
  finished (hung 9+ minutes with zero output, killed; killed at ~5.6
  minutes before its summary). The 6 failures:
  - `test-measurement-proof-update.js` + `test-measurement-workflow.js`:
    the retained neutrality proof is stale — `B.manifest()` walks `src/`,
    so the `win-plan.js` change moves its digest by construction. Any
    source change does this; regenerating `balance-proof.json` is a
    landing-time step and is not fabricated here (the update script warns
    never to fabricate a proof; my panel is not a neutrality-proof panel).
  - `test-living-garden-deed-attainment.js` +
    `test-one-person-army-deed-attainment.js`: 120s timeouts (exit null)
    under box load.
  - `test-phone-frame-proof.js`: stale phone evidence (`index.html`) and
    boot-input coverage.
  - `test-ladder-bundle-20261108.js`: ambient-raid control (200 monster
    turns without delivery fire 0 raids).
  - None of the 6 failing tests references `win-plan.js`, and none sets
    `FLEEREPAIR2`. With the flag unset — as in every check run — the gate
    is dead code, so the change cannot affect their behavior. These are
    proof-staleness, load, and unrelated pre-existing failures, not
    regressions from this arm. B4 (proof test 29/29) is the arm's own green
    gate; full green-list completion is the ship loop's gate at landing.

## Limitations and next arms

1. **B1 needs a judging band.** The next arm on this axis should pick a
   band where suburb hunts launch (the diagnosis band 103601–103608 does;
   a launch-rich band, or a longer horizon) and re-run the same frozen
   bars. Do not re-score this panel and do not band-shop: the fresh band
   was frozen, it did not calibrate, the verdict stands.
2. **The SEEK clause is not covered.** `winPlanFightGate`'s SEEK clause
   still walks a standing-stage party into any wave-3+ beast once the
   trick is known, including a suburb. Appended to
   `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`.
3. **The cousin evade and #2292 are not covered.** 2 of 3 size-4 launched
   meetings never engage (pre-fight awareness evades, rounds 0) — a
   different mechanism, unmeasured here. Finding #2292 (arena party member
   flees before turn 1) is TB/arena; this seed gate does nothing for it.
   Both appended to sim-findings.md.
4. **Pre-existing suburb plans** (seeded while the flag is off, or before
   the flag flips) keep targeting the suburb; the gate only blocks new
   seeding/retargeting. A follow-up that retires live suburb plans needs
   its own prereg.
5. **The gate is silent.** No voice line marks a refused suburb hunt
   (see §Sense-testing).

## Files

- Prereg: `evidence/2026-11-17/sim-fleerepair2-b-prereg.md`
- Evidence (this file): `evidence/2026-11-17/sim-fleerepair2-b.md`
- Fix + instruments + proof: `src/js/win-plan.js`,
  `scripts/fleerepair2-driver-b.js`, `scripts/analyze-fleerepair2-b.js`,
  `scripts/build-fleerepair2-b-panels.js`, `scripts/test-fleerepair2-b.js`
  (commit `26075585f`)
- Diagnosis corpus: `evidence/2026-11-17/perseed-fleerepair2-b-diag/`
  (8 files) + `evidence/2026-11-17/fleerepair2-b-diag-analysis.json`
- Panel corpora: `evidence/2026-11-17/perseed-fleerepair2-b-ctl/` (8 files,
  incl. recovered 104001) and `evidence/2026-11-17/perseed-fleerepair2-b-arm/`
  (8 files)
- Panel analysis: `evidence/2026-11-17/fleerepair2-b-analysis.json`;
  balanced panel: `evidence/2026-11-17/fleerepair2-b-panel-before.json.gz`,
  `evidence/2026-11-17/fleerepair2-b-panel-after.json.gz`,
  `evidence/2026-11-17/fleerepair2-b-panel.json`,
  `evidence/2026-11-17/fleerepair2-b-panel.md`
- Run logs: `evidence/2026-11-17/fleerepair2-b-diag.log`,
  `fleerepair2-b-ctl.log`, `fleerepair2-b-arm.log`,
  `fleerepair2-b-ctl-104001.log`, `fleerepair2-b-check-quick.log`,
  `fleerepair2-b-check-quick-2.log`
