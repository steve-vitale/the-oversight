# sim-gavelconfess-a — gavel confess once-per-trial gate (axis scale-onramp)

Run: fleshout-20261025T1615Z, worker sim-gavelconfess, blank #4 from
sim-scale-onramp-round-1531 (belltoad-cand3-b side audit).
Worktree: ~/workspace/worktrees/sim-gavelconfess. Main tree untouched.

## CANON READ FIRST

- docs/CANON.md (manifest) read. docs/CONTESTS.md does NOT cover the
  Gavel trial motions — grep finds no gavel/confess procedure there — so
  the mechanic's own header is the source, not an invented rule:
  src/js/sigW3a.js, sigGavel header (wave-3 batch A, Steve 2026-10-10):
  "CONFESS FIRST (smaller hit, but witnesses remember)" and the
  counterwire note (2026-10-16): "a villager who confessed first takes
  the lighter verdict. The flag persists until a verdict consumes it
  (the record outlives the trial)."
- Player path already gated: tbPlayerGavelConfess (sigW3a.js) refuses a
  second confess with "You already confessed. (It's on the record.)"
  and returns false without consuming the turn. That path is NOT the
  bug and is NOT touched.

## STEP 0 — BUG STILL OPEN (verified before any fix)

The open bug is the VILLAGER field-fight path, not the player path:

- Gate: src/js/fieldFights.js, villagerTrickAction, gavel branch:
  `if (mid === 'gavel' && msig.sigG && msig.sigG.trial)` — it checks
  only that a trial is active. It never reads the fired flag
  `rec.trickConfess`, unlike its neighbours (callback gates on
  `!rec.trickMourned`, ad_break on `!rec.trickUnwatched`).
- Effect: every round the trial stays active, the gate returns
  `{type:'confess'}`, and the field loop (fieldFights.js confess
  branch) sets `rec.trickConfess = 1` again, increments
  `state.gavelConfessions` again, and logs another "confesses first"
  line. A trial stretched by a stunned/skipped monster verdict round
  therefore confesses twice (or more) for one trial.
- Failing proof (before fix): scripts/test-gavelconfess-once-20261025.js
  scenario S1 — gate with trial active AND rec.trickConfess = 1 still
  returns confess. Run pre-fix below; it goes RED on S1 exactly.

So the bug is NOT already fixed. Proceeding with the one-gate fix.

## PRE-REGISTRATION (binding — written before any after-sweep)

- Fix: in villagerTrickAction, gate the gavel branch on the fired flag:
  confess only when `!rec.trickConfess`. First-confess behaviour,
  verdict halving, flag consumption at the verdict, and the player
  path are otherwise unchanged. A new trial after a consumed verdict
  may confess again (flag is cleared by the verdict) — the gate is
  per-trial, not per-fight.
- GO requires ALL of:
  (a) proof green: first confess succeeds, second confess in the same
      trial refused, across at least 3 distinct trial scenarios
      (S1 fired-flag refusal, S2 first confess, S3 new trial after a
      consumed verdict, plus player-gate isolation P);
  (b) no new death class and no trial-completion regression on the
      targeted trial-scenario band below (identical seeds pre/post);
  (c) check.js --quick shows no new failures vs the standing profile
      (numbers reported; a pre-existing failure list is not green).
- If any GO leg fails: NO-GO, game-code change reverted before commit.

### Targeted band for leg (b) — NOT a full sweep, stated explicitly

A full 8-seed sim sweep is infeasible/disproportionate for a one-gate
selector fix, and is NOT claimed here. The band is targeted:

- scripts/test-gavelconfess-once-20261025.js, seeds 1, 2, 3, identical
  pre/post: gate scenarios S1/S2/S3/P + verdict halving + trial clear.
- scripts/test-sig-gavel-20261010.js (existing gavel proof), seeds 1, 2, 3,
  identical pre/post: trial opens, object/recess/confess verdicts,
  fights terminate.
- Metric: trial-completion regression = 0 — every scenario's verdict
  falls and trial clears pre and post, first-confess verdict damage
  identical pre/post (deterministic lroll anchor), and no new outcome
  or log class appears in the proof outputs. Death-class guard: the
  band contains no deaths by construction (vHp 500 vs verdict <= 60)
  and verdict damage is unchanged, so no death class can be introduced
  by this gate; this is a targeted-band guard, not a full death
  census, and is reported as such.

## FIX

- src/js/fieldFights.js, villagerTrickAction gavel branch: added
  `&& !rec.trickConfess` to the gate (one condition, no other code).
- No change to: the confess resolution branch, sigFieldGavel (verdict
  halving + flag consumption), tbPlayerGavelConfess, the combat button
  strip, or any spawn/pool/maintain code (out of area, untouched).

## RESULTS (after-sweep)

Targeted trial-scenario band, identical seeds pre/post (NOT a full
sweep — see pre-registration):

| Check | Pre-fix | Post-fix |
|---|---|---|
| proof test-gavelconfess-once, seed 1 | 14 pass / 1 fail (S1 only) | 15 pass / 0 fail |
| proof, seed 2 | 14 pass / 1 fail (S1 only) | 15 pass / 0 fail |
| proof, seed 3 | 14 pass / 1 fail (S1 only) | 15 pass / 0 fail |
| existing test-sig-gavel, seeds 1/2/3 | 24 pass / 0 fail each | 24 pass / 0 fail each |
| check.js --quick | 279 passed / 8 failed (see below) | 279 passed / 8 failed, identical failure set (runtimes only differ) |

- Pre-fix seeds 2/3 were measured by temporarily restoring the HEAD
  version of fieldFights.js (fixed copy backed up first, restored with
  `cp` — never checkout-as-restore), then re-applying the fix; the
  restored diff was verified identical (7 lines: 1 condition + comment).
- Verdict math unchanged by the fix (deterministic lroll anchor):
  plain verdict 40, confessed verdict 20, flag consumed (0) and trial
  cleared in both pre and post runs. No new outcome or log class in
  any proof output; no deaths in the band by construction (vHp 500 vs
  verdict <= 60), so no new death class is possible from this gate —
  reported as a targeted-band guard, not a full death census.
- GO leg (a): PASS — S1/S2/S3/P green on all 3 seeds.
- GO leg (b): PASS on the targeted band — trial completion unchanged
  (verdict falls, trial clears, first-confess damage identical).
- GO leg (c): PASS — post-fix check.js --quick is 279 passed / 8 failed
  with the identical 8-script failure set as pre-fix (only per-script
  runtimes differ). No new failures.

### check.js --quick, pre-fix standing profile (NOT green — named)

279 passed, 8 failed in 755s. The 8 failures are pre-existing and
unrelated to the gavel gate (no fieldFights/gavel test among them):

- scripts/godpath/test-hide-discovery.js
- scripts/godpath/test-measurement-comparison.js
- scripts/godpath/test-measurement-proof-update.js
- scripts/godpath/test-measurement-workflow.js
- scripts/godpath/test-mobile-combat-cadence.js
- scripts/godpath/test-occupation-panels.js
- scripts/godpath/test-phone-frame-proof.js
- scripts/test-parity-20261014.js

Post-fix check showed exactly this same set (279/8, runtimes only
differ) — leg (c) passes.

## VERDICT

GO — all three pre-registered legs pass. Fix committed in this
worktree only (no push, no bump, no live verification); coordinator
merges. Change affects contest feel, so the commit carries
[needs-eyes].

## TRANSCRIPT / SENSE

Real lines, read from the proof runs (seed 1, post-fix):

- Field plain verdict: `R5: 🔨 THE VERDICT FALLS: "COUNT ONE" — GUILTY.
  Yara takes 40.`
- Field confessed verdict: `R5: the verdict falls LIGHTER — Yara
  confessed first. But witnesses remember the confession. (20) |
  R5: 🔨 THE VERDICT FALLS: "COUNT ONE" — GUILTY. Yara takes 20.`
- Gate on one trial record: first call `{"type":"confess",
  "why":"gavel-confess"}`, repeat call with the flag set `null`.
- Player first confess: `You confess first — out loud, where everyone
  can hear. The gavel pauses. It will fall lighter. But witnesses
  remember. (The confession is on the record.)`
- Player refusal: `You already confessed. (It's on the record.)`

Judgement: the player refusal reads as a court ruling, not a system
error — it names the record, the in-world reason a second confession
is impossible. The field refusal has no spoken line by design: the
gate returns null, so the loop logs no second "confesses first" line
and counts no second confession, and the villager's round proceeds to
the ordinary (narrated) strike instead. That is a refused confess,
not a silent no-op and not a fake success — but it is a quiet refusal,
and if Steve wants the villager to SAY the refusal off-screen, that
spoken line is a follow-up narration addition, not part of this gate.
No second confess line can now appear for one trial in either path.

## VILLAGE ASSESSMENT (plain words)

Nothing about village life changes for the normal case: a villager
who knows the Gavel's trick still confesses once, takes the lighter
verdict, and carries the confession on the record — exactly as before.
What stops is the absurd case: a trial dragged out by a stunned
verdict round no longer lets the same villager confess over and over,
stacking "on the record" counts for a single crime. One crime, one
confession, one lighter verdict. The court keeps its dignity, and the
village's confession count now means what it says.

## METRIC REVIEW

No metric re-scored mid-run. Judged exactly against the header above.
The targeted band is reported as targeted, never as a full sweep.

## REACHABILITY

Gavel trial content (accuse / object / recess / confess / verdict) was
already reachable; this fix changes only repeat-confess behaviour
inside an active trial. No new content unlocked, none removed.
