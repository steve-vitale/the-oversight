# sim-trustbleed-a — PREREGISTRATION (committed BEFORE any judged sim)

Run: fleshout-loop-a-20261102T0045Z, arm sim-trustbleed-a, axis scale-onramp.
Worktree branch: sim-trustbleed-a. DIAG/instrument only — zero src/js changes,
no gates, stages, deed bars, or win prices touched, nothing from the #1538
steve-call queue built. No [needs-eyes] (measurement only).

## Question (from the 2315Z round, arm sim-musterroster-adopt-a)

On seed 90111 (intervened run: the muster call was sounded at the first
refused Herald attempt), link trust bled across the refusal window —
Emberhold 69→4, Stonebridge 48→0, Thornfield 57→0 by day ~102, no active
links left by day 103 — while refused Herald attempts kept coming (92 on
90111). Is that a doom loop (refusals erode the trust needed for
trusted-tier quota, with no way back), or does anything recover trust
after a refusal? And what actually causes each delta — the refusal
itself, or something else riding along (e.g. a sounded muster's hunger
upkeep, tribute, succession, neglect)?

## Two refusal kinds — kept distinct throughout

- HERALD-FACE refusal: the player (scholar) tries to face the Herald and
  the gate refuses because the muster is short (muster-diag snapshot,
  "muster N allied blades (you have M)"). This says nothing about trust
  in the game code — it only reads the muster count.
- MUSTER-CALL refusal: soundTitanCall answers a linked village with
  "REFUSES ... (trust −8)" when trust < 25 / opinion < −10 / arrears > 0
  (src/js/titans.js soundTitanCall). This costs exactly −8, once per
  call per refusing village, and only fires when the call is sounded.

The 92 refusals on 90111 are Herald-face refusals (gate), not call
refusals — the call was sounded once. Any "refusals erode trust" claim
must survive that distinction.

## Instrument (new, DIAG only)

scripts/trustbleed-replay-20261101.js — same policy stack and recorders
as scripts/musterroster-adopt-replay-20261101.js (below), plus a daily
per-link trust census: after each simulated day, for every link in
Game.hierarchyState(), record villageId, name, status, trust, opinion
(via _otherVillage), arrears, lastKeptDay, mourningUntil,
tributePaidWeek, pendingRenegotiation, plus the day's new link.history
entries (kind + note, the game's own attribution channel) and every
Game.say line mentioning trust (plus muster-call lines). MODE=observe
sounds no call; MODE=intervene sounds the call at the first refused
Herald attempt exactly as the musterroster replay did (same two
titanCommitOwn taps), so the 90111 bleed timeline is reproducible.
Validator: scripts/test-trustbleed-a.js — recomputes the verdict from
the per-seed corpus files only (no re-running sims).

## Policy stack (exact — reproduces the 90111 bleed timeline)

Policy: tribfloor leadfeast → windefer withWinDefer → seatdrive
withSeatDrive → fullseat-diag withFullseatDiag; recorders herald
instrument (HERALD=1) + muster-diag (MUSTER=1).
Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1 MUSTER=1.
CORRECTION to the task shorthand, stated before any sim: the task named
"tableseat-nowait + fullseat-diag + wavegate-diag" as the musterroster
stack, but the musterroster replay's code (and its prereg) uses
leadfeast + windefer + seatdrive + fullseat-diag; tableseat-nowait is
the heraldsteer substrate and wavegate-diag is its wave recorder. The
bleed was observed under the leadfeast stack, so the leadfeast stack is
what this arm uses — using the other substrate would NOT reproduce the
reported timeline. Wave reach is taken from the runDays census, as in
the musterroster replay.

## Seeds — screen defined here, run after this commit

- Anchor: 90111 (the reported bleed seed), both MODEs.
- Pilot band: 90111 + 7 fresh refused-Herald seeds screened on current
  master from base 90201 upward (scan cap 60 seeds, MODE=observe,
  DAYS=180): a seed qualifies iff it has ≥1 REFUSED Herald attempt AND
  ≥1 active link on the day of its first refused attempt. The first 7
  qualifiers, in scan order, join 90111 as the 8-seed pilot band.
  85106 is NOT carried forward (stale as a control per the 2315Z round).
- Confirm (12–16 seeds): ONLY if the pilot meets the instrument GO
  below. Confirm seeds = the next qualifiers from the same screen
  (continuing scan order past the pilot 7), judged by the same rule.

## Horizon (death-aware, never fixed 200d)

DAYS=180 cap (same as the heraldsteer band: a reachability lever's
150–200d guide, MEASUREMENT §10). Dead villages stop simulating; the
trust series runs from first Herald contact through the cap or death,
and the verdict window is first-refusal day through day ~130 and to
horizon where the village lives that long. 180 is a cap, not a target.

## PRIMARY METRIC

Per link, per seed, on the MODE=observe band: trust-recovery events
after the first refused Herald attempt — specifically, whether any link
that dips below the trusted tier (trust < 70, the titans.json
trustedAt; trusted tier also needs opinion ≥ 10) after its first
refusal later re-reaches the trusted tier (trust ≥ 70 AND opinion ≥ 10)
at any daily snapshot before horizon/death. Pre-refusal trust = the
last daily snapshot before the first-refusal day (day-of snapshot if
no earlier snapshot exists). A link already at trusted tier at first
refusal counts as a recovery ONLY if it first dips below trusted tier
and then re-reaches it; merely staying trusted is not a recovery.

Secondary (reported, never substituted for the primary): re-reach of
pre-refusal trust (any link returning to ≥ its pre-refusal trust after
dropping below it); net trust change first-refusal → day 130 / horizon;
links dissolved by day 130; per-cause trust movement census (sum of
positive and negative deltas by attributed cause class).

## VERDICT RULE (binding — do not move after seeing results)

- Recovery EXISTS iff ≥1 link on ≥2 pilot seeds re-reaches the trusted
  tier after dipping below it post-first-refusal (primary metric).
  The mechanism is then named from the attributed causes on those
  links (the cause class(es) whose positive deltas carried the link
  back over the tier).
- Doom loop CONFIRMED iff recovery does NOT exist AND at least one of:
  (a) the observe-only band shows net trust decline to 0/dissolution
  on a majority of its links by day ~130, or (b) the MODE=intervene
  90111 twin reproduces the 2315Z bleed pattern (all three links at 0
  or dissolved by ~day 130). The delivery spec (what a future recovery
  mechanism must do, with numbers) is then written instead of building
  it.
- NEITHER (a complete, non-re-scored outcome) iff recovery does not
  exist AND neither (a) nor (b) holds — i.e. refusals alone do not
  bleed trust and the reported bleed is an intervention artifact,
  named as such from the intervened twin's causal census.
- Instrument GO for confirm spend: the decision rule fires cleanly
  either way AND the causal census is complete: unattributed absolute
  trust movement ≤ 10% of total absolute trust movement across the
  pilot band, and instrumentErrors = 0 and musterErrs = 0 on judged
  seeds. If the census is incomplete or unattributable, that is NO-GO
  on the instrument, NOT a finding about trust — no confirm spend,
  and the evidence says so.

## Guardrails

- Zero src/js changes in this arm (verified by git status/diff before
  commit); any accidental game-code change aborts the run.
- Wall numbers (national/table/wins, wave reach, median survival)
  reported for this arm's band only, never pooled with other arms.
- Panel (§15): NOT APPLICABLE — single-arm DIAG census on identical
  seeds against recorded reference behavior, same declaration class as
  muster3/musterroster-adopt (no panel fabricated).

## OUT OF SCOPE (task bounds)

No trust-recovery mechanism is built in this run (new design — the
delivery spec is the deliverable if the doom loop confirms). No #1538
steve-call queue work. No gate/stage/deed-bar/win-price retunes.
