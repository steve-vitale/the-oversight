# sim-winplandepart-b — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-winplandepart-b · **Loop B run:** fleshout-loop-b-20261118T1030Z
**Type:** DIAGNOSTIC — exercise the win-plan depart path, which has NEVER
been measured firing. **Frozen:** 2026-11-18 ~10:45 UTC (before the pilot
sweep; the proof test runs after this freeze but before the pilot — it
proves the mechanism, it is not a judged sim).
**Branch tip:** `sim-winplandepart-b` (`27eec991b`, this arm's work below
that tip).
**Base:** master `27eec991b` (worktree HEAD; includes the triodrought
carry fix, which is the live brain-path code this diag is measured
against).
**Builds on:** `evidence/2026-11-18/sim-triodrought-b.md` (finding:
"The win-plan depart path fired 0 times again (all launches via the
brain path, as on the LP band). Its launch-time re-pick of the second
companion is live code with no measured exercise on either band —
recorded, not judged.") and its prereg
`evidence/2026-11-18/sim-triodrought-b-prereg.md` (§Diagnosis 7:
`partyTrios` reads 0 on both legs "because only the win-plan depart
path bumps it and that path fired 0 times on this band").

## Diagnosis (from the code — decided BEFORE any sim)

**The trigger is a gate, not a seed or a plan shape. In live play the
depart path is unreachable.**

1. **The only game-code caller** of `winPlanDepart` is
   `src/js/villager-agency.js:446` (agencyTick). It sits in the branch
   taken only when `vbrainOwnsDawn()` is FALSE:
   ```js
   if (typeof this.vbrainOwnsDawn === 'function' && this.vbrainOwnsDawn()) {
     // honor today's dawn commitment only ... vbrainExecuteDepart ...
     continue;
   }
   // (falls through to winPlanDepart)
   ```
2. **`vbrainOwnsDawn()` returns `true` unconditionally**
   (`src/js/villager-brain.js:738`: `vbrainOwnsDawn: function () { return true; }`).
   It has been unconditional since the phase-1 brain landed
   (commit `1671d28b8`, 2026-11-08: "stop agency chance-rolls from
   re-deciding the day"). There is no env flag, no plan shape, no
   seed, and no override anywhere in `src/js` that flips it. The
   0/17 (LP band) and 0/43 (triodrought band) depart-path launches
   are therefore EXPECTED on every live-mode band, not a sampling
   accident: no staging of seeds or plans can fire the path while
   the brain owns dawn.
3. **The staging (the trigger, found not guessed):** a harness-level
   override in the driver, applied after `loadGame` and before
   `setupGame`:
   ```js
   Game.vbrainOwnsDawn = function () { return false; };
   ```
   This routes agencyTick through the legacy branch for every
   villager: `winPlanDepart` is called each tick instead of
   `vbrainExecuteDepart`. The driver ASSERTS the override
   (`Game.vbrainOwnsDawn() === false`) before the run starts and
   records `brainOff: true` in every corpus file; a run where the
   override did not take is a loud stop, never a silent mislabel.
   The override touches no game file — it is diag staging only,
   exactly as the triodrought ctl leg reverted code in the worktree
   file to stage its contrast.
4. **What the depart path does, in plain words:** when a plan-holder
   is standing at Haven with a plan in stage party / hunt / standing
   / table (a table-stage veteran with a wave-4+ kill is guarded:
   launch with a party or hold), `winPlanDepart` tries to send them
   out: it picks a first companion, gears them up and checks they
   can actually go, then starts one shared-target trip for the holder
   and that companion. Then — only when `VETREENGAGE=1` and the plan
   targets wave 4 or higher — it picks a SECOND companion right
   there at launch time, from the villagers idle at Haven, and sends
   them on the same trip if they can go. If nobody is free or able
   to go, the pair still goes out; there is no extra waiting. When
   three walk out together, the village counter `partyTrios` goes up
   by one. The brain path does the same launch from the dawn
   commitment instead, reading the second companion out of the
   stored commit (the triodrought fix); the depart path re-picks
   live at launch time, so it can pick a different second companion
   than dawn picked, or pick one where dawn picked none.
5. **Why the re-pick classification needs a caller frame.**
   `winPlanSecondCompanion` is also called from the dawn candidate
   pass (`winPlanCands` in villager-brain.js, a pure read). With the
   brain off, the dawn pass may still score — so the recorder
   classifies every second-companion pick by its caller frame
   (stack read, pure): only picks called from `winPlanDepart` count
   as launch-time re-picks. A pick whose caller is anything else is
   recorded separately and never joined to a depart row.
6. **Loop A overlap:** Loop A is live on sibling arm
   sim-launchparty-sense-a in the launch area. This diag touches no
   Loop A worktree, branch, or file; if the diag's findings overlap
   their in-flight fix, the overlap is documented in the evidence
   and no build is made on it.

## Primary metric (BINDING, §14)

**Depart-path wave-4+ launches** = rows in `v4departs` with
`source === 'winPlanDepart'`, `result === 'launch'`,
`targetWave >= 4`, on the staged BRAINOFF band.

**GO threshold:** ≥ 3 such launches **AND** the launch-time re-pick
classified for EVERY one (picked+carried / picked+dropped / null)
**AND** `partyTrios` delta = 1 on every launch where the second
companion departed (`partySize >= 3`).
**Pool floor:** ≥ 3 wave-4+ depart launches. Below the floor the
pilot is under-powered and the verdict is DIAG-NO-GO
(METRIC-BROKEN), never a pass on a thin pool.

Sizing: on the triodrought band the same substrate produced 43
wave-4+ launches in 8 seeds via the brain path; the depart path
reads the same plans and the same Haven pool, so 3+ launches in 8
seeds is a modest bar for a path that is now the only departure
route. The ≥3 floor (not ≥1) is deliberate: one launch cannot
classify the re-pick (picked / carried / dropped) with any
confidence.

**If 0 depart launches occur despite the override verified active,**
that is a DIAG-NO-GO with the trigger conditions documented — it
would mean the depart path is not reached even in legacy mode
(e.g. plans never reach a launch stage without the brain), which is
itself the finding. It is NOT re-scored as a pass.

## Secondary metrics (supporting, not binding)

- **Re-pick outcome per launch:** picked (second companion named
  by the launch-time call) → carried (named villager in the
  departed party) / dropped (named but not in the party) / null
  (launch-time call returned null). Reported launch by launch.
- **Brain-path calls on the staged leg:** `vbrainExecuteDepart`
  invocations (agencyTick never calls it when the brain is off;
  expect 0 — any call is a finding, recorded not judged).
- **Companion-slot fill at depart-path launch:** launched wave-4
  companions per launch (partySize − 1). Reported, not judged.
- **`partyTrios` end value** per seed vs the counted trio departs
  (the counter must equal the number of trio departs on the leg;
  a mismatch is a defect, named in evidence).
- **Instrument:** 0 instrument errors on all per-seed files.
- **Scale-wall numbers** (national / table / wins, wave 4–5
  unlocks, median survival): REPORTED DESCRIPTIVELY ONLY on this
  leg. The BRAINOFF override reverts ALL dawn decisions to legacy
  (chance rolls + winPlanDepart for every villager, not just
  win-plan holders), so this leg's survival/standing numbers
  describe staged legacy mode, not live mode. They are NEVER
  compared to a live-mode band as a lever effect, and no verdict
  in this arm rests on them.

## What this pilot does NOT judge

- Whether the depart path SHOULD fire in live play. That is a
  design question for the coordinator / Steve (the brain owns dawn
  by design since phase 1; the depart path is its legacy shadow).
  This diag only measures what the path does when it fires.
- The LP subset metric (launched-meeting arrival rate) — not
  re-judged here. The launchparty sense fix is NOT on master and
  NOT in this arm.
- Any game-code fix. This is a DIAGNOSTIC arm: no game-code change
  unless the diag finds a concrete defect AND the fix is scoped to
  the depart path alone — if one is found, it is named in evidence
  and built only under a fresh pre-registered GO bar, never bundled
  into the diag verdict.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (§10: reachability lever, waves
  4–5 / national / table). Dead villages stop simulating (+10d
  tail max).
- **Seeds (fresh 8-seed pilot band): 104021, 104022, 104023,
  104024, 104025, 104026, 104027, 104028.** Freshness check
  (skill local_seed_band_freshness): `git grep -l -E
  "10402[1-8]"` over `evidence/**/*.md` — 0 hits; `grep -rl -E
  "10402[1-8]" evidence/*/sim-*-prereg.md` — 0 hits; `grep -rl -E
  "10402[1-8]" --include="*.md"` over the goal `hidden_files/`
  — 0 hits. (A full-text sweep of hidden_files JSON corpora
  matches only kcal floats such as 104021.x inside measurement
  JSON — numeric values, not seed namings; no prereg, forbidden
  list, or screen names any 104021–104028 seed.)
- **Policies:** competent verbatim. **Substrate:** `VETREENGAGE=1
  + PARTYSIZE4=1 + FLEEREPAIR2=1`, `FIGHTALLY2` unset (same as
  the triodrought arm leg, so the depart path's re-pick gate
  `VETREENGAGE=1` is on). **Single leg: BRAINOFF only.**
- **Control:** the frozen triodrought corpora (band 104011–
  104018, brain-on) are the brain-on control: 43 wave-4+
  launches, 0 via the depart path, `partyTrios` 0 on both legs.
  No second sim leg runs in this arm.
- **Instrument:** `scripts/winplandepart-driver-b.js` (new,
  focused: wraps `winPlanDepart` — return, stage, needWave,
  party after, `partyTrios` before/after — plus
  `winPlanSecondCompanion` with caller-frame classification, plus
  `vbrainExecuteDepart` call counting; per-seed JSONs under
  `evidence/2026-11-18/perseed-winplandepart-b-brainoff/`);
  analyzer `scripts/analyze-winplandepart-b.js` (with
  `--selftest`); proof test `scripts/test-winplandepart-b.js`
  (staged direct `winPlanDepart` call: wave-4 plan + Haven-idle
  second companion → trio launch + `partyTrios` bump; plus a
  harness check that the BRAINOFF override routes agencyTick
  through `winPlanDepart`).
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the pilot verdict.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** on the triodrought band the same substrate yields
   43 wave-4+ launches per 8 seeds via the brain path. The depart
   path reads the same plans and the same Haven pool, so the pool
   (~40 launches/band) is well above the 3-launch floor — the
   floor guards the case where legacy mode never forms a launchable
   plan, not a thin pool.
2. **Pool sizing:** see (1).
3. **Mechanism pre-check (frozen, not a sim):** the analyzer's
   join (depart row → launch-time re-pick by caller frame →
   party after → `partyTrios` delta) is verified against the
   FROZEN triodrought corpora BEFORE the pilot runs (analyzer
   `--selftest` + a frozen-corpus dry run): it must reproduce the
   triodrought numbers — 43 launches, 0 depart-path, `partyTrios`
   0, 0 unjoined — and report 0 launch-time re-picks (no
   `winPlanDepart` caller frames) on that corpus.
