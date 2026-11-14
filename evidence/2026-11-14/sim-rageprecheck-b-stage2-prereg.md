# sim-rageprecheck-b — Stage 2 confirm prereg (coordinator addendum)

Run: fleshout-loop-b-20261114T0330Z (Loop B), arm sim-rageprecheck-b
Axis: winnability chain. Coordinator-run confirm; the worker's pilot
(Stage 1) went GO and left Stage 2 as the coordinator's call.
Worker prereg: evidence/2026-11-14/sim-rageprecheck-b-prereg.md (binds
the pilot; this addendum binds the confirm and changes nothing in it).
Branch: sim-rageprecheck-b — worktree ~/workspace/worktrees/sim-rageprecheck-b
Date: 2026-11-14

## Stage 2 — confirm band

- Seeds: 98801–98816 (the pilot 8 + 98809–98816), the band the
  worker's prereg pinned BEFORE the pilot ran ("Confirm band, if the
  pilot goes: 98801–98816"). The band is kept exactly as pinned —
  changing it after a pilot GO would break prereg binding.
- Freshness correction (coordinator check, 2026-11-14): 98809 and
  98810 are fresh (0 prior uses as seeds). 98811–98816 are NOT
  fresh: sim-bankkiller-b ran them on 2026-11-05 (seeds 98811–
  98818, 150d death-aware, evidence/2026-11-05/sim-bankkiller-b.md,
  per-seed files evidence/2026-11-05/perseed-bankkiller-b/). That
  arm played a different lever; the rageprecheck lever was never
  tuned on these seeds, and the band was fixed before the pilot
  verdict — so the before/after delta on them is still an unbiased
  estimate of THIS lever's effect. To make the overlap auditable,
  the confirm reports the primary BOTH pooled (16 seeds, the
  pre-registered GO bar) AND on the fresh-only subset (98801–
  98810, 10 seeds). If both read 0, the overlap is moot.
- Policies: competent + capable, both legs on identical seeds.
- Horizon: 150d death-aware, same as the pilot.
- Instrument: scripts/rageprecheck-driver-20261114.js, unchanged.
  Before leg runs with src/js/abilityActions.js temporarily restored
  to the prereg commit's bytes (sha256
  fabd5737483fe0ad6fe8fc2cc2a1a87f04c61b9430f9d90285af34870373dc6a,
  = 7b03f1aaa:src/js/abilityActions.js, verified before the run);
  after the before leg the fix commit's bytes are restored (sha256
  29515be979140de07028bb2eb013aeb22899c5d0cb9be986dee6c544ace1330b,
  = 82cfe281e:src/js/abilityActions.js) and `git diff HEAD` is
  verified empty before the after leg starts.
- Outdirs: evidence/2026-11-14/perseed-rageprecheck-b-confirm-before/
  and evidence/2026-11-14/perseed-rageprecheck-b-confirm-after/
  (RUN=rageprecheck-b-confirm-before / -after).

## Pre-registered verdict (judged on the confirm band ALONE)

- Primary: SUCCESSFUL wholly-unspent refresh presses, summed over
  competent + capable on identical seeds. GO = 0. Per-presser split
  reported separately (competent-run; capable-run capable-path;
  capable-run competent-fallback-path). Fresh-only subset
  (98801–98810) reported separately alongside the pooled primary.
- Secondaries (must also read 0): partly-spent refreshes (successful
  presses at rounds 1–2). Reported, not GO legs: wave-4/5 kills,
  strikes landed, rage kcal, wins, maxWave.
- Guardrails: starvation ≤ control+2 on totals (confirm before leg
  is the control); median survival ≥ 0.8× control median, per
  policy. A GO met with a guardrail breached is NO-GO.
- Balanced panels (32 cases/leg) + compare are attempted AFTER the
  driver verdict as corroboration; the driver primary + guardrails
  decide GO/NO-GO. A compare decision of review_required with no
  material signal on judged metrics does not block a driver GO
  (pilot precedent).
- If the confirm goes GO, the arm lands (rebase onto master, proof
  re-run, ff-only merge). If it fails the GO bar, the lever is
  KILLED per §14a taxonomy and the branch stays unmerged as the
  record (pilot GO stands as the pilot verdict, not as a landing).
