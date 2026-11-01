# sim-muster3-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-11-01)

Run: Loop A worker, axis scale-onramp, run fleshout-loop-a-20261101T1742Z,
arm sim-muster3-a. Arm type: DIAG ONLY — zero src/js, zero policy-default
flips, zero edits to existing policy files, no routing/call design built,
no gate threshold moved. Backlog #1538 (steve-call: route on refused
face? re-sound after a lost muster-fight?) still pending a ruling; this
arm sizes a third cluster, it does not build the route. The perception
law (Steve 2026-10-28) binds any brief channel the same way it bound
mustercall-b/2 and heraldcontact-a: a call-sounding channel must be
perceivable by a person present — never a magic roster scan.

## Question (from sim-mustercall-b + sim-mustercall2-a + sim-heraldcontact-a)

Mustercall-b (evidence/2026-10-31/sim-mustercall-b.md) censused the
herald-b band (85101–85116) and found its whole census on ONE seed
(85106): all 35 refusals, omen stage 2, call button OFFERED, sounded
call yields 5 blades (days 95–97) then 9 (days 112–130), Haven commit
reaches/passes the 10-gate on five of nine refusal days, and a
post-block replay proved sounding at the first day-112 refusal brings
exactly the predicted 9 allies, reaches ready 10/10 with one commit,
and leads to a fought-and-lost Herald the same day. Mustercall2-a
(evidence/2026-10-31/sim-mustercall2-a.md) ran the same census on a
fresh band (86101–86116) and found 0/16 Herald contacts of any kind,
with 8/16 seeds won on exactly day 90 censoring the window.
Heraldcontact-a (evidence/2026-10-31/sim-heraldcontact-a.md) removed
the day-90 excuse with a longevity screen (pool 87101–87140) and still
found 0/8 pilot contacts, stopping at pilot under its contact gate.
The mustercall-b headline is therefore still a single-seed census —
neither generalized nor contradicted. This arm is the THIRD hunt: a
fresh pool, longevity-screened, contact-gated pilot, preferring seeds
lasting past day 120 un-won.

## Candidate pool + freshness (verified BEFORE any judged sims)

- Candidate pool: 90101–90140 (40 seeds). Judged band = the
  longevity-selected subset (see selection rule); it is NOT a
  contiguous range by design — selection on survival is fixed
  before screening so selection cannot chase refusals.
- NEVER reuse 85101–85116, 86101–86116, or 87101–87140 as the judged
  band. 88101–88140 was REJECTED at prereg time: 88101–88108 +
  88111 were judged seeds in sim-eggdriver-a (2026-10-26), so that
  pool fails the freshness rule even though the question differed.
- Freshness checks run at prereg time, all clean for 90101–90140:
  (a) no `s901*.json` exists anywhere under evidence/ (find
  returned none); (b) the literals 90101/90140 appear in NO
  evidence .md file (grep returned none); (c) no 90xxx band
  literal appears in any 2026-10-31 sim-*.md file. The standing
  precedent (a band that only looks fresh is not fresh) is why
  all three checks were run, not just a filename scan.
- If the pilot fails its contact gate, the verdict is
  INSUFFICIENT-DATA — no band-shopping mid-run to chase a
  contact. A further band would be a new arm with its own prereg,
  not a quiet substitution.

## Base pin + same-base discipline

- Worktree HEAD at prereg time: b33a9a9a4 (Loop A round 1706Z
  coordinator evidence; includes Loop A arm sim-titanexcl-a
  72512906f, backlog #1550: titans excluded from castMonster pool).
- Consequence, stated BEFORE sims: as in mustercall-b/2 and
  heraldcontact-a, any refused Herald state on this band must
  arrive by the remaining channels (world-contact via monsterTurn
  hungry contact, or a contest/feast-draw of a non-cast source,
  if any). A feast-draw Herald attempt on this band is counted
  separately and labeled REGRESSION-#1550, not merged into the
  world-contact census.
- #1550 status (checked at prereg time, NOT duplicated): LANDED
  in this base — commit 72512906f, and its exclusion code is
  present in src/js/game.js castMonster in this worktree
  (TITAN EXCLUSION comment + titanIds filter at the pool build).
  This arm does NOT re-build it and does NOT claim it. Whether
  it holds on the band (0 cast-sourced Herald faces) is a
  measured check, not a re-claim.
- Every per-seed JSON carries its own anchorCommit; the verdict
  judges the sweep on THIS base only. Mustercall-b/2 and
  heraldcontact-a numbers are quoted as prior-base comparisons
  only, never as current. No number is compared across moved
  bases as if it were the same substrate.
- Same-base control/substrate leg (new this arm, task-directed):
  (1) screen-vs-sweep agreement is CHECKED on every judged seed
  (screen gameDays/won/national/table/maxWave vs sweep values —
  recorders are read-only, so exact agreement is expected; any
  mismatch is reported, not smoothed); (2) a corpus determinism
  leg: one judged seed re-run through the stdout runner must
  reproduce its judged stdout line byte-identically.
- If master moves under this run (sibling Loop B is live on
  food-economy), rebase cleanly, re-run proofs on the rebased
  tip, and re-pin the anchor BEFORE reporting. Do not report
  numbers from a superseded base as current.

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

## Step 1 — longevity screen (NOT judged sims; selection probe only)

- NEW scripts/muster3-screen-20261101.js: runs the census policy
  stack (below) with NO herald/muster recorders installed and
  records ONLY longevity fields per seed: seed, days, gameDays,
  won, endReason, maxWave, national, table, endOmenStage (end
  pure read), endScaleRank. It prints one JSON line per seed to
  STDOUT and writes nothing itself; a separate idle splitter
  (scripts/muster3-split-20261101.js) writes the screen file.
  This is the stdout-runner pattern from the task's
  infrastructure lessons: a game-loaded process must not be
  trusted to write files (frozen clock makes retry sleeps
  no-op), so game processes print and an idle process writes.
  The screen records no attempts, no field fights, no
  snapshots, no muster verbs, so selection on its output
  cannot peek at Herald content.
- Screen policy = the census policy stack exactly:
  `withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))`,
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
  FULLSEAT=1, 200d death-aware cap.
- Selection rule (fixed now, applied mechanically after the
  screen, in this order; within a tier, ascending seed order,
  except tier C which is gameDays-desc then seed-asc):
  - Tier A: un-won AND gameDays >= 120 (survived past day 120
    un-won — the window the task orders).
  - Tier B: won AND gameDays > 120 (late win: the window was
    long even though it closed by winning).
  - Tier C: un-won, longest gameDays first (only if tiers A+B
    cannot fill pilot+confirm).
  - Pilot = first 8 selected; confirm = ALL remaining selected
    seeds (this fixes heraldcontact-a's metric-review item 4:
    a fixed "confirm = 12" did not survive a pool yielding 19
    selectable seeds; pre-registering "all remaining" removes
    the deviation instead of repeating it).
  - The fill composition (how many from each tier) is reported
    in the evidence; a tier-C-filled confirm is labeled as such.
- The screen NEVER selects on Herald content (see above).

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
- NEW scripts/muster3-sweep-20261101.js: the mustercall2-sweep
  stack with (a) output changed to STDOUT (one JSON line per
  seed: `{"seed": N, "out": {...}}`, same per-seed object shape
  as mustercall2), (b) no file writes from the game process,
  (c) seed list passed via SEEDS env. A separate idle splitter
  (scripts/muster3-split-20261101.js, run in a foreground exec
  with stdout→file + stderr→file, never a backgrounded pipe)
  reads the sweep stdout file and writes per-seed JSONs to
  evidence/2026-11-01/perseed-muster3/leadfeast/s<seed>.json.
  Judged corpora are NEVER staged in /tmp (sibling-cleanup wipe
  killed a leg mid-run in a prior arm); the stdout file lives
  in the worktree's evidence dir, which is the corpus dir.
- NEW scripts/muster3-analyze-20261101.js: the mustercall2
  analyzer logic with the default input dir changed to
  perseed-muster3/leadfeast and the output to
  muster3-analysis.json. Classification rules below are
  identical to mustercall-b/2's (including the detail.gate
  shape fix and the even-n median rule from mustercall-b's
  metric review). It additionally prints: contact seeds,
  located-but-unfaced seeds with location-to-end windows, and
  the screen-vs-sweep agreement table.
- NEW scripts/test-muster3-20261101.js: proof test on SYNTHETIC
  fixture rows only (no band seeds): refusal/snapshot join,
  commit-block taxonomy, call-yield arithmetic, per-day
  re-face counting, field-vs-TB asymmetry table, cluster
  collapse across seeds (must NOT collapse across seeds),
  screen selection rule (tier ordering, pilot/confirm split
  with confirm = all remaining selected, tier-C fallback),
  and the 0/0 completeness rule (prints n/a, never 100%).
  Band seeds never appear in the proof test, so proof runs
  are not judged sims. Plus the corpus determinism leg (see
  same-base leg above).
- Post-block counterfactual (NOT judged, clearly separated,
  OPTIONAL, and ONLY if the judged census finds >= 1 refused
  state): NEW scripts/muster3-replay-20261101.js replays ONE
  refused state (first cluster day, full sweep stack) and, in
  the replay only, wraps Game.startCombat post-return so that
  at the first refused Herald attempt on the first cluster day
  it calls Game.soundTitanCall('herald') once and then
  Game.titanCommitOwn('herald') twice, records predicted
  callYield vs actual allies, haven blades after commit, and
  ready-after, then lets the run continue and records whether
  a later Herald startCombat attempt is FOUGHT. The replay
  prints its result JSON to STDOUT; the splitter writes it to
  evidence/2026-11-01/perseed-muster3/replay-<seed>-postblock.json.
  Its numbers are reported under a "post-block, not judged"
  heading and never enter the census tables. The judged sweep
  never calls a muster verb: the sounded-call measurement is
  this instrumented probe of the refused state, in the same
  manner as mustercall-b's post-block probe, and the evidence
  says exactly how it was done. If the census is empty, no
  replay is run and none is claimed. This probe is NOT a
  routing build and does NOT change game behavior in any
  judged run; backlog #1538 still needs its ruling before any
  routing is built, and no policy in this arm sounds calls.

## Classification rules (binding — identical to mustercall-b/2 + heraldcontact-a)

- HERALD CONTACT (unit of the pilot gate and the GO count): any
  one of, on one seed: a startCombat attempt with mid 'herald'
  (any class: FOUGHT, REFUSED, THROW); a fieldFight record with
  mid 'herald'; a muster-diag snapshot for tid 'herald'; a
  muster verb counter > 0 for a herald muster (soundTitanCall /
  titanCommitOwn / titanWarCouncil / titanSelfDo touching
  herald). OMEN STAGE ALONE IS NOT CONTACT: a seed that ends at
  omen stage 2 with zero attempts, zero field fights, zero
  snapshots, and zero verbs has NOT made contact.
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
  can be told apart, as in mustercall2-a and heraldcontact-a.

## Primary metric

Census completeness over the judged band: (a) every wave >= 4
startCombat attempt classified FOUGHT/REFUSED/THROW; (b) every
REFUSED herald attempt joined to a complete muster snapshot (all
of C1-C9 present, have/need matching the refusal line).
Completeness = joined-complete refused herald attempts / all
refused herald attempts; on an empty set completeness is n/a
(undefined, never 100%). Cross-checks: (i) verb counters
(soundTitanCall/titanCommitOwn/titanWarCouncil/titanSelfDo) on
every seed; (ii) game-side refused outcomes records join to
REFUSED attempts on the same titan and day; (iii) ready-manual
vs ready-game agreement on every snapshot (any mismatch is a
finding, not a dropped row).

## Band verdict (stated now, judged later, never re-scored)

- DIAG-GO: completeness >= 95% on the full judged band,
  cross-check match rates >= 95%, instrumentErrors = 0 on all
  seeds, >= 8 usable judged seeds, refused states on >= 2
  distinct seeds (pilot+confirm combined, each with >= 1 joined
  refused Herald state and call yield recorded), AND the
  evidence states (a) the full Q1 census (per-cluster
  blades/quota/omen/commit-block/re-face, with the refusal-seed
  count and the generalize-or-bound judgment vs mustercall-b),
  (b) the Q2 channel asymmetry table with the kill-outcome
  judgment, (c) the Q3 ranked decision brief ONLY as far as the
  new census supports it (no new routing proposed — #1538 still
  pending), and (d) wall numbers on the judged band. GO here
  means a second cluster seed exists inside this band, not just
  across arms.
- DIAG-GO-SINGLE-CLUSTER (caveated GO, not full GO): completeness
  >= 95%, cross-checks >= 95%, instrumentErrors = 0, >= 8 usable
  judged seeds, refused states on exactly 1 seed (pilot or
  confirm), sections (a)–(d) present with the single-seed caveat
  carried in the headline. The census is complete but band-
  internal generalization stays unanswered; the cross-arm tally
  (distinct refusal seeds across mustercall-b + this arm) is
  still reported, because a second cluster seed anywhere is the
  hunt's underlying question.
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

- G-GENERALIZES: refusals on >= 2 distinct seeds in this band,
  and on each refusal seed the cluster rows show omen stage 2
  with the call offered, call yields in the 5–9 range (or
  explained outside it by link state), and ceilings reaching 10
  on at least one refusal day per seed.
- G-BOUNDED: refusals on exactly 1 seed in this band, or cluster
  rows that differ from mustercall-b's pattern in omen stage,
  offered-ness, or yield range — with the difference named, not
  smoothed. A bounded result still passes DIAG-GO-SINGLE-CLUSTER
  if the completeness bars hold; it bounds the headline instead
  of generalizing it.
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
- Cross-arm tally (reported alongside, never substituted for
  the band bars): distinct refusal seeds across mustercall-b
  (85106) + mustercall2-a (none) + heraldcontact-a (none) +
  this arm.

## Pilot gate (8 seeds before any confirm spend, §9) — CONTACT-gated

Pilot GO requires: instrument fires on all 8 pilot seeds with
zero instrument errors; per-seed JSONs valid (days > 0, census
sorted); AND a Herald CONTACT signal on >= 1 pilot seed (per
the contact definition above: a TB attempt of any class, a field
fight, a muster snapshot, or a muster verb). Omen stage >= 2
alone does NOT pass the gate — the deliberate tightening from
heraldcontact-a, kept because omen-only seeds are exactly the
located-but-unfaced set that cannot answer the census. If the
pilot fails on contact grounds, the run stops at pilot as
INSUFFICIENT-DATA (no confirm spend on a contactless band).
Pilot size is NOT the verdict: the confirm carries it. If the
pilot fails on instrument grounds, the verdict is DIAG-NO-GO.

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
  did the confirm = all-remaining-selected rule remove the
  heraldcontact-a confirm-size deviation, did any classification
  rule misfire.)

## Seeds (selection rule, not literals — fixed above)

- Candidate pool: 90101–90140. Pilot = first 8 selected;
  confirm = all remaining selected seeds. Selected seed lists
  are written into the evidence file after the screen, before
  the pilot runs, and the pilot/confirm split is never revised
  after seeing census content.

## Policies (single-base measurement; no control leg by design except the screen leg)

Identical to mustercall-b/2 and heraldcontact-a, every seed:
`withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))` with
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 + HERALD=1 + MUSTER=1 instruments (screen: same stack
minus instruments). Policy-side only, no game change.

## Wall numbers reported every run

national / table / wins, wave 4-5 unlocks, median survival (game
days), plus: Herald TB attempts by class and reason, Herald field
fights by outcome, wave-4 kills by channel (TB vs field).
