# sim-heraldcontact-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-10-31)

Run: Loop A worker, axis scale-onramp, run fleshout-20261031T0915Z.
Arm type: DIAG ONLY — zero src/js, zero policy-default flips, zero
edits to existing policy files, no routing/call design built.
Backlog #1538 (route on refused face?) still pending a ruling; this
arm sizes contact, it does not build the route. The perception law
(Steve 2026-10-28) binds any brief channel the same way it bound
mustercall-b/2: a call-sounding channel must be perceivable by a
person present — never a magic roster scan.

## Question (from sim-mustercall-b + sim-mustercall2-a)

Mustercall-b (evidence/2026-10-31/sim-mustercall-b.md) censused the
herald-b band (85101–85116) and found its whole census on ONE seed
(85106): all 35 refusals, omen stage 2, call button OFFERED,
sounded call yields 5 blades (days 95–97) then 9 (days 112–130),
Haven commit reaches/passes the 10-gate on five of nine refusal
days. Mustercall2-a (evidence/2026-10-31/sim-mustercall2-a.md) ran
the same census on a fresh band (86101–86116) and found 0/16 Herald
contacts of any kind, with 8/16 seeds won on exactly day 90,
censoring the Herald window outright, plus 5 located-but-unfaced
seeds (2 of them with 13 and 43 days between location and run end
and still zero contact — genuine scarcity, not censoring). This arm
is the SECOND-CLUSTER hunt with the censoring mechanism designed
out: screen for longevity FIRST, then census only seeds that
survive past day 120 un-won where possible, so the Herald window
is open long enough for a meeting to happen.

## Candidate pool + freshness (verified BEFORE any sims)

- Candidate pool: 87101–87140 (40 seeds). Judged band = the
  longevity-selected subset (see selection rule); it is NOT a
  contiguous range by design — the task orders selection on
  survival, and the selection rule below is fixed before screening
  so selection cannot chase refusals.
- NEVER reuse 85101–85116 or 86101–86116 as the judged band.
- Freshness checks run at prereg time, all clean:
  (a) no `s871*.json` exists anywhere under evidence/ (find
  returned none); (b) the literals 87101/87116/87140 appear in NO
  evidence/*/sim-*.md file (grep returned nothing); (c) the
  literals 87101 and 87140 appear nowhere in the convergence
  tracker (grep returned nothing); (d) no 87xxx band literal
  appears in any 2026-10-31 sim-*.md file. The standing99
  precedent (a band that only looks fresh is not fresh) is why
  all four checks were run, not just a filename scan.
- If the pilot fails its contact gate, the verdict is
  INSUFFICIENT-DATA — no band-shopping mid-run to chase a
  contact. A further band would be a new arm with its own prereg,
  not a quiet substitution.

## Base pin

- Worktree HEAD at prereg time: 4f6474f1d (journey-social r76
  evidence; includes Loop A arm sim-titanexcl-a 72512906f,
  backlog #1550: titans excluded from castMonster pool).
- Consequence, stated BEFORE sims: as in mustercall-b/2, any
  refused Herald state on this band must arrive by the remaining
  channels (world-contact via monsterTurn hungry contact, or a
  contest/feast-draw of a non-cast source, if any). A feast-draw
  Herald attempt on this band is counted separately and labeled
  REGRESSION-#1550, not merged into the world-contact census.
- Every per-seed JSON carries its own anchorCommit; the verdict
  judges the sweep on THIS base only. Mustercall-b/2 numbers are
  quoted as prior-base comparisons only, never as current.

## Ground facts (inherited from mustercall-b/2, re-verified spot-wise on THIS base)

- Gate (src/js/titans.js, titanWrapCombat): titan id refused
  before core startCombat when titanMusterReady false; says the
  muster line ("sound the call, muster <need> allied blades (you
  have <have>)"); printed have = RAW muster allies length;
  ready = unique-alive allies + valid Haven blades >= minAllies
  (10 for herald, src/data/titans.json).
- Writers: soundTitanCall creates musters[tid], per ACTIVE
  hierarchy link quota 6 if trust >= 70 AND opinion >= 10 else 2
  (titans.json _coalition: baseBlades 2, trustedBlades 6,
  trustedAt 70, trustedOpinion 10), refusing aloud if trust < 25
  OR opinion < -10 OR arrears > 0; takes up to quota-minus-already
  FREE faces. It NEVER auto-commits Haven blades (2026-10-13
  rule). soundTitanCall itself has NO omen-stage gate.
- titanCommitOwn: up to 3 Haven blades total, two-tap; requires
  omen stage >= 2 and free volunteers.
- Offer gate (titanSelfActions, camp self-bar): actions for a
  titan exist ONLY when omen stage >= 2; the call button shows
  when alliedN == 0 OR the muster is not ready; the commit
  button shows when havenN < 3. In headless sims nothing presses
  buttons unless a policy does, and no policy in the stack does.
- Omen staging: stage 0 -> stage 1 after >= 4 days -> stage 2
  after >= 9 more days (titanPlace, "You cannot face it alone.
  Sound the call."). Stage 2 is the ONLY stage at which the
  call/commit buttons exist.
- Field channel: fieldFight (src/js/fieldFights.js) is NOT
  wrapped by the titan gate.
- Refusal routing: NONE. No code outside titans.js reads
  state.titans.outcomes.

## Step 1 — longevity screen (NOT judged sims; task-directed, new this arm)

- NEW scripts/heraldcontact-screen-20261031.js: runs the census
  policy stack (below) with NO herald/muster recorders installed
  and records ONLY longevity fields per seed: seed, days,
  gameDays, won, endReason, maxWave, national, table,
  endOmenStage (end-of-run pure read), endScaleRank. Output:
  evidence/2026-10-31/perseed-heraldcontact/screen-87101-87140.json
  (one file, clearly labeled screening, never a judged corpus).
- Screen policy = the census policy stack exactly:
  `withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))`,
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
  FULLSEAT=1, 200d death-aware cap. The screen is a competent-
  policy longevity probe: win day / survival under the same
  stack the census runs, so screen win-day predicts census
  censoring. Recorders are read-only, so screen-vs-sweep
  trajectories are expected to agree; agreement is CHECKED
  (screen gameDays/won vs sweep gameDays/won per judged seed)
  and any mismatch is reported, not smoothed.
- Selection rule (fixed now, applied mechanically after the
  screen, in this order; within a tier, ascending seed order):
  - Tier A: un-won AND gameDays >= 120 (survived past day 120
    un-won — the window the task orders).
  - Tier B: won AND win day (gameDays) > 120 (late win: the
    window was long even though it closed by winning).
  - Tier C: un-won, longest gameDays first (only if tiers A+B
    cannot fill pilot+confirm).
  - Pilot = first 8 selected; confirm = next 12 (up to 16 if
    tier A alone supplies 24+; confirm is 12–16 by the task,
    fixed at 12 unless tier A supplies >= 24, in which case 16).
  - The fill composition (how many from each tier) is reported
    in the evidence; a tier-C-filled confirm is labeled as such.
- The screen NEVER selects on Herald content: the screen records
  no attempts, no field fights, no snapshots, no muster verbs.
  Selecting on longevity only keeps the contact question
  un-peeked until the judged census.

## Step 2 — judged census instrument (verbatim reuse + new wrappers)

- scripts/herald-instrument-20261030.js (HERALD=1, verbatim
  reuse, NOT edited): wraps startCombat (classification
  FOUGHT/REFUSED/THROW + reason, caller from stack top,
  scholar/entity tiles), tbEnd, fieldFight (wave >= 4),
  recordWaveKill (wave >= 4), muster verbs (counters), say ring
  (last 400), sleep census.
- scripts/policies/muster-diag.js (MUSTER=1, verbatim reuse, NOT
  edited): per-refusal C0-C9 snapshots. Pure reads only; never
  sounds a call in a judged sweep.
- NEW scripts/heraldcontact-sweep-20261031.js: the
  mustercall2-sweep-20261031.js stack with the output dir changed
  to evidence/2026-10-31/perseed-heraldcontact/leadfeast/ and the
  seed list defaulting to the selected judged band (passed via
  SEEDS env in practice). No other behavioral change; the sweep's
  env-var guards (FEASTSCALE_R13, TRIBFLOOR, WINPURSUIT,
  WINDEFER, SEATDRIVE, FULLSEAT, HERALD, MUSTER all =1) are kept.
  Diff vs mustercall2 sweep verified as exactly those changes.
- NEW scripts/heraldcontact-analyze-20261031.js: the
  mustercall2-analyze-20261031.js logic with the default input
  dir changed to perseed-heraldcontact/leadfeast and the output
  to heraldcontact-analysis.json. Classification rules below
  are identical to mustercall-b/2's (including the detail.gate
  shape fix and the even-n median rule from mustercall-b's
  metric review).
- NEW scripts/test-heraldcontact-20261031.js: proof test on
  SYNTHETIC fixture rows only (no band seeds): refusal/snapshot
  join, commit-block taxonomy, call-yield arithmetic, per-day
  re-face counting, field-vs-TB asymmetry table, cluster
  collapse across seeds (must NOT collapse across seeds), AND
  the screen selection rule (tier ordering, pilot/confirm
  split, tier-C fallback). Band seeds never appear in the proof
  test, so proof runs are not judged sims. Plus a corpus
  determinism leg: one judged seed re-run to a scratch dir is
  byte-identical to the judged JSON.
- Post-block counterfactual (NOT judged, clearly separated,
  OPTIONAL): only if the judged census finds >= 1 refused
  state, a replay of ONE refused state (first cluster day, full
  sweep stack) may sound the call once and re-face, in the
  mustercall-b style, to validate the hypothetical callYield
  against a real soundTitanCall result. Its numbers are reported
  under a "post-block, not judged" heading and never enter the
  census tables. If the census is empty, no replay is run and
  none is claimed.

## Classification rules (binding — identical to mustercall-b/2)

- HERALD CONTACT (unit of the pilot gate and the GO count): any
  one of, on one seed: a startCombat attempt with mid 'herald'
  (any class: FOUGHT, REFUSED, THROW); a fieldFight record with
  mid 'herald'; a muster-diag snapshot for tid 'herald'; a
  muster verb counter > 0 for a herald muster (soundTitanCall /
  titanCommitOwn / titanWarCouncil / titanSelfDo touching
  herald). OMEN STAGE ALONE IS NOT CONTACT: a seed that ends at
  omen stage 2 with zero attempts, zero field fights, zero
  snapshots, and zero verbs has NOT made contact. This is the
  task-directed tightening vs mustercall2's pilot gate (which
  accepted omen stage >= 2 as an activity signal); it is stated
  here so the gate cannot drift back to omen-only mid-run.
- REFUSED STATE (unit of Q1): one startCombat attempt with mid
  'herald', cls REFUSED, reason MUSTER-GATE, joined to a
  muster-diag snapshot on the same seed and day with the same
  printed have/need. An attempt without a joinable snapshot is
  UNJOINED (reported, never silently dropped; completeness
  counts it as missing).
- DISTINCT STATE CLUSTER: (seed, day, omenStage, callYield,
  commitBlock) — refusals sharing all five collapse to one
  cluster row, with reFaceCount and first/last day noted.
  Clusters are per-seed by construction (seed is in the key).
- BLADE COUNT IF A CALL WERE SOUNDED: snapshot callYield (sum
  of wouldYield) + already-committed allies raw. Reported as
  "call would bring X (yield Y new + Z already) vs need 10;
  with commit unblocked, ceiling = X + min(3 - havenValid,
  volunteers)". Arithmetic on snapshot fields, never a simulated
  commit (except the optional post-block replay).
- COMMIT-BLOCK REASON (exactly one, in this order): NO-OMEN if
  omenStage is null; OMEN-STAGE-LT-2 if omenStage < 2; HAVEN-CAP
  if havenValid >= 3; NO-VOLUNTEERS if volunteers == 0;
  UNBLOCKED otherwise.
- CALL OFFERED: omenStage >= 2 (the self-bar gate). A call can be
  SOUNDED by the verb at any omen stage (soundTitanCall has no
  omen gate), but it is OFFERED as a button only at stage >= 2.
  Both columns are reported; conflating them is an error.
- RE-FACE COUNT PER DAY: REFUSED herald attempts on that
  (seed, day). Also reported: days with refusals, max/day,
  median gap between consecutive refusal days, and muster events
  between first and last refusal (from verb counters: always
  expected 0; any nonzero is a finding, not a correction).
- CHANNEL (Q2): TB-scholar = startCombat attempts mid 'herald'
  (caller wild-contact / contest / feast-draw / policy-hunt /
  other, from stack top); FIELD = fieldFight records mid
  'herald'. Same-titan comparison is per seed: TB refusals, TB
  fought + TB ends, field fights + field outcomes, field kills
  (vKill) and TB kills (recordWaveKill mid herald).
  "Asymmetry changes a kill outcome" is judged as: would
  excluding refused TB attempts, or gating field fights the way
  TB is gated, change any kill count on the band?
- FEAST-DRAW REGRESSION CHECK: any startCombat attempt mid
  'herald' with caller feast-draw, or any cast-sourced Herald
  face, is counted separately and labeled REGRESSION-#1550, not
  merged into the world-contact census.
- TRANSCRIPT SAMPLES (sense-testing): first-refusal say-ring
  slice and a late-repeat slice (last refusal day if one exists)
  on the cluster seed(s), plus one Herald field-fight record
  from this band's own capture if one exists. Judged: does the
  refusal line read honestly after the first telling (same line?
  same numbers? any acknowledgment of repetition, of the field
  fights elsewhere, of a remedy attempted)?
- LOCATED-BUT-UNFACED: seeds ending at omen stage 2 with zero
  Herald contacts (per the contact definition above). Reported
  with days between location (endOmenDay) and run end, so
  censoring (short window) vs genuine scarcity (long window)
  can be told apart, as in mustercall2-a.

## Primary metric

Census completeness over the judged band: (a) every wave >= 4
startCombat attempt classified FOUGHT/REFUSED/THROW; (b) every
REFUSED herald attempt joined to a complete muster snapshot (all
of C1-C9 present, have/need matching the refusal line).
Completeness = joined-complete refused herald attempts / all
refused herald attempts. Cross-checks: (i) verb counters
(soundTitanCall/titanCommitOwn/titanWarCouncil/titanSelfDo) on
every seed; (ii) game-side refused outcomes records join to
REFUSED attempts on the same titan and day; (iii) ready-manual
vs ready-game agreement on every snapshot (any mismatch is a
finding, not a dropped row).

## Band verdict (stated now, judged later, never re-scored)

- DIAG-GO: completeness >= 95% on the full judged band,
  cross-check match rates >= 95%, instrumentErrors = 0 on all
  seeds, >= 8 usable judged seeds, >= 2 CONFIRM seeds each with
  >= 1 joined refused Herald state (call yield recorded on each),
  AND the evidence states (a) the full Q1 census (per-cluster
  blades/quota/omen/commit-block/re-face, with the refusal-seed
  count and the generalize-or-bound judgment vs mustercall-b),
  (b) the Q2 channel asymmetry table with the kill-outcome
  judgment, (c) the Q3 ranked decision brief ONLY as far as the
  new census supports it (no new routing proposed — #1538 still
  pending), and (d) wall numbers on the judged band. GO here
  means the second cluster exists on >= 2 confirm seeds — the
  shape the task's suggested GO names.
- DIAG-GO-SINGLE-CLUSTER (caveated GO, not full GO): completeness
  >= 95%, cross-checks >= 95%, instrumentErrors = 0, >= 8 usable
  judged seeds, refused states on exactly 1 seed (pilot or
  confirm), sections (a)–(d) present with the single-seed caveat
  carried in the headline. The census is complete but the
  generalization question stays unanswered; the headline must
  then say the pattern is bounded to single-seed clusters, not
  band-wide.
- DIAG-NO-GO: completeness < 95%, or either cross-check < 95%,
  or instrumentErrors > 0 with no read-only explanation, or a
  required verdict section (a)–(d) missing, or the pilot fails
  on instrument grounds.
- INSUFFICIENT-DATA: fewer than 8 usable judged seeds, or ZERO
  refused Herald states on the full judged band, or the pilot
  contact gate fails (0 pilot seeds with a real Herald contact).
  The census question is then unanswerable on this band — Q2/Q3
  are still reported as far as measurable, the censoring
  mechanism is named (day-90-style win censoring, short
  located window, genuine no-meeting scarcity, or other as
  measured), and the verdict says which questions died with the
  empty set, not that the gate is fixed. A dry band is a finding
  about contact scarcity, not a failure to run.

## Generalization bars (binding, judged in the evidence)

- G-GENERALIZES: refusals on >= 2 distinct seeds, and on each
  refusal seed the cluster rows show omen stage 2 with the call
  offered, call yields in the 5–9 range (or explained outside it
  by link state), and ceilings reaching 10 on at least one
  refusal day per seed.
- G-BOUNDED: refusals on exactly 1 seed, or cluster rows that
  differ from mustercall-b's pattern in omen stage, offered-ness,
  or yield range — with the difference named, not smoothed. A
  bounded result still passes DIAG-GO-SINGLE-CLUSTER if the
  completeness bars hold; it bounds the headline instead of
  generalizing it.
- G-CONTRADICTS: refusals on >= 2 seeds whose cluster rows
  systematically contradict mustercall-b (e.g. omen null or
  stage < 2 throughout, call never offered, yields stuck at 2) —
  reported as a contradiction of the mustercall-b headline, with
  mustercall-b's numbers re-checked for base movement before any
  claim that mustercall-b was wrong.
- NEITHER (empty set): no refusal seed exists, so no bar
  resolves — the headline is neither confirmed nor overturned,
  and this arm says so plainly instead of borrowing
  mustercall-b's numbers.

## Pilot gate (8 seeds before any confirm spend, §9) — CONTACT-gated

Pilot GO requires: instrument fires on all 8 pilot seeds with
zero instrument errors; per-seed JSONs valid (days > 0, census
sorted); AND a Herald CONTACT signal on >= 1 pilot seed (per the
contact definition above: a TB attempt of any class, a field
fight, a muster snapshot, or a muster verb). Omen stage >= 2
alone does NOT pass the gate — this is the deliberate tightening
vs mustercall2-a, ordered by the task, because omen-only seeds
are exactly the located-but-unfaced set that cannot answer the
census. If the pilot fails on contact grounds, the run stops at
pilot as INSUFFICIENT-DATA (no confirm spend on a contactless
band). Pilot size is NOT the verdict: the confirm carries it. If
the pilot fails on instrument grounds, the verdict is DIAG-NO-GO.

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over
(village lost or won). Identical to mustercall-b/2: the herald-b
cluster ran to day 130 and wave-4 doors opened as late as day
~165 in prior bands, so a shorter cap would censor the refusal
tail; the death-aware stop keeps cost at the survival
distribution. The longevity screen exists precisely because the
cap alone does not guarantee an open window — a day-90 win
closes the window inside the cap.

## Panel (§15)

NOT APPLICABLE — single-base DIAG measurement, no before/after
comparison exists in this arm; none fabricated (same declaration
as mustercall-b/2 and herald-b).

## Metric review (carried, filled at evidence time)

- (To be filled from the run: did the contact-gated pilot gate
  behave, did the longevity screen predict the census window,
  did any classification rule misfire.)

## Seeds (selection rule, not literals — fixed above)

- Candidate pool: 87101–87140. Pilot = first 8 selected;
  confirm = next 12 (16 if tier A alone supplies >= 24).
  Selected seed lists are written into the evidence file after
  the screen, before the pilot runs, and the pilot/confirm split
  is never revised after seeing census content.
