# sim-mustercall2-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-10-31)

Run: Loop A worker, axis scale-onramp, run fleshout-20261031T0726Z.
Arm type: DIAG ONLY — zero src/js, zero policy-default flips, zero
edits to existing files (existing policy files untouched; new
scripts carry mustercall2-* names). No muster-routing build:
backlog #1538 (route on refused face? re-sound after a lost
muster-fight?) is still pending a ruling. This is a census, not
a build. The perception law (Steve 2026-10-28) binds any brief
channel the same way it bound mustercall-b: a call-sounding
channel must be perceivable by a person present — never a magic
roster scan.

## Question (from sim-mustercall-b)

Mustercall-b (evidence/2026-10-31/sim-mustercall-b.md) censused
the herald-b band (85101–85116) and found its whole census on
ONE seed (85106): all 35 refusals, omen stage 2, call button
OFFERED, sounded call yields 5 blades (days 95–97) then 9
(days 112–130), Haven commit reaches/passes the 10-gate on five
of nine refusal days. Muster-b's own metric review (item 4)
calls the next work a second cluster seed before generalizing
the "offered and reachable" headline beyond that band. This arm
is that second cluster: the same census, on a fresh band, asking
whether the pattern generalizes or whether 85106 is special.

## Band freshness (verified BEFORE any judged sims)

- Chosen band: 86101–86116 (pilot 86101–86108, confirm
  86109–86116). Never reuse 85101–85116 or any band already in
  a corpus for this question.
- Checks run at prereg time: (a) no `s861*.json` exists anywhere
  under evidence/ (find over evidence/ returned none); (b) the
  literals 86101/86102/86116 appear in NO evidence/*/sim-*.md
  file (grep over all dated sim files returned nothing); (c)
  the literals 86101, 86201, …, 91001 appear in no
  evidence/2026-10-30 or 2026-10-31 sim-*.md file; (d) the
  convergence tracker names the herald band (85101–85116) for
  this question and no 861xx band. The standing99 precedent
  (a band that only looks fresh is not fresh) is why all four
  checks were run, not just a filename scan.
- If the pilot shows this band is dry (see pilot gate), the
  verdict is INSUFFICIENT-DATA — no band-shopping mid-run to
  chase a refusal. A second band would be a new arm with its
  own prereg, not a quiet substitution.

## Base pin

- Worktree HEAD at prereg time: 70407e9f4 (sim-heraldhp-b
  evidence + instrument). It contains Loop A arm
  sim-titanexcl-a 72512906f (backlog #1550: titans excluded
  from castMonster pool); the exclusion code is present in
  src/js/game.js castMonster in this worktree (verified by
  reading the function, TITAN EXCLUSION comment block).
- Consequence, stated BEFORE sims: as in mustercall-b, any
  refused Herald state on this band must arrive by the
  remaining channels (world-contact via monsterTurn hungry
  contact, or a contest/feast-draw of a non-cast source, if
  any). A feast-draw Herald attempt on this band is counted
  separately and labeled REGRESSION-#1550, not merged into
  the world-contact census.
- Every per-seed JSON carries its own anchorCommit; the
  verdict judges the sweep on THIS base only. Muster-b
  numbers are quoted as prior-base comparisons only, never as
  current — base movement is reported, never smoothed.

## Ground facts (inherited from mustercall-b, re-verified spot-wise on THIS base)

- Gate (src/js/titans.js, titanWrapCombat): titan id refused
  before core startCombat when titanMusterReady false; says
  the muster line ("sound the call, muster <need> allied
  blades (you have <have>)"); printed have = RAW muster
  allies length; ready = unique-alive allies + valid Haven
  blades >= minAllies (10 for herald, src/data/titans.json).
- Writers: soundTitanCall creates musters[tid], per ACTIVE
  hierarchy link quota 6 if trust >= 70 AND opinion >= 10
  else 2 (titans.json _coalition: baseBlades 2, trustedBlades
  6, trustedAt 70, trustedOpinion 10), refusing aloud if
  trust < 25 OR opinion < -10 OR arrears > 0; takes up to
  quota-minus-already FREE faces. It NEVER auto-commits
  Haven blades (2026-10-13 rule). soundTitanCall itself has
  NO omen-stage gate.
- titanCommitOwn: up to 3 Haven blades total, two-tap;
  requires omen stage >= 2 and free volunteers.
- Offer gate (titanSelfActions, camp self-bar): actions for a
  titan exist ONLY when omen stage >= 2; the call button
  shows when alliedN == 0 OR the muster is not ready; the
  commit button shows when havenN < 3. In headless sims
  nothing presses buttons unless a policy does, and no policy
  in the stack does.
- Omen staging: stage 0 -> stage 1 after >= 4 days ->
  stage 2 after >= 9 more days (titanPlace, "You cannot face
  it alone. Sound the call."). Stage 2 is the ONLY stage at
  which the call/commit buttons exist.
- Field channel: fieldFight (src/js/fieldFights.js) is NOT
  wrapped by the titan gate.
- Refusal routing: NONE. No code outside titans.js reads
  state.titans.outcomes.

## Instrument (verbatim reuse + new mustercall2-* wrappers)

- scripts/herald-instrument-20261030.js (HERALD=1, verbatim
  reuse, NOT edited): wraps startCombat, tbEnd, fieldFight
  (wave >= 4), recordWaveKill (wave >= 4), muster verbs, say
  ring (last 400), sleep census.
- scripts/policies/muster-diag.js (MUSTER=1, verbatim reuse,
  NOT edited): per-refusal C0-C9 snapshots. Pure reads only;
  never sounds a call in a judged sweep.
- NEW scripts/mustercall2-sweep-20261031.js: the
  mustercall-sweep-20261031.js stack with the output dir
  changed to evidence/2026-10-31/perseed-mustercall2/
  leadfeast/ (so the mustercall-b corpus is never
  overwritten) and the seed list defaulting to this band.
  No other behavioral change; the sweep's env-var guards
  (FEASTSCALE_R13, TRIBFLOOR, WINPURSUIT, WINDEFER,
  SEATDRIVE, FULLSEAT, HERALD, MUSTER all =1) are kept.
- NEW scripts/mustercall2-analyze-20261031.js: the
  mustercall-analyze-20261031.js logic with the default
  input dir changed to perseed-mustercall2/leadfeast and the
  output to mustercall2-analysis.json. Classification rules
  below are identical to mustercall-b's (including the
  detail.gate shape fix and the even-n median rule from its
  metric review).
- NEW scripts/test-mustercall2-20261031.js: proof test on
  SYNTHETIC fixture rows only (no band seeds): refusal/
  snapshot join, commit-block taxonomy, call-yield
  arithmetic, per-day re-face counting, field-vs-TB
  asymmetry table, cluster collapse across seeds (new:
  clusters must NOT collapse across seeds — a regression
  this arm's analyzer must not introduce). Band seeds never
  appear in the proof test, so proof runs are not judged
  sims.
- Post-block counterfactual (NOT judged, clearly separated,
  OPTIONAL): only if the judged census finds >= 1 refused
  state, a replay of ONE refused state (first cluster day,
  full sweep stack) may sound the call once and re-face, in
  the mustercall-b style, to validate the hypothetical
  callYield against a real soundTitanCall result. Its
  numbers are reported under a "post-block, not judged"
  heading and never enter the census tables. If the census
  is empty, no replay is run and none is claimed.

## Classification rules (binding — identical to mustercall-b)

- REFUSED STATE: one startCombat attempt mid 'herald', cls
  REFUSED, reason MUSTER-GATE, joined to a muster-diag
  snapshot on the same seed and day with the same printed
  have/need. An attempt without a joinable snapshot is
  UNJOINED (reported, never silently dropped; completeness
  counts it as missing).
- DISTINCT STATE CLUSTER: (seed, day, omenStage, callYield,
  commitBlock) — refusals sharing all five collapse to one
  cluster row, with reFaceCount and first/last day noted.
  Clusters are per-seed by construction (seed is in the
  key); a cluster carried by a single seed is labeled
  single-seed, never presented as band-wide. The
  generalization question is judged on: how many DISTINCT
  refusal seeds exist, and whether their cluster rows match
  mustercall-b's pattern (omen 2, offered, yield 5–9,
  ceilings reaching 10 on some days) or differ.
- BLADE COUNT IF A CALL WERE SOUNDED: snapshot callYield
  (sum of wouldYield) + already-committed allies raw.
  "call would bring X (yield Y new + Z already) vs need 10;
  with commit unblocked, ceiling = X + min(3 - havenValid,
  volunteers)". Arithmetic on snapshot fields, never a
  simulated commit (except the optional post-block replay).
- COMMIT-BLOCK REASON (exactly one, in this order):
  NO-OMEN if omenStage null; OMEN-STAGE-LT-2 if < 2;
  HAVEN-CAP if havenValid >= 3; NO-VOLUNTEERS if
  volunteers == 0; UNBLOCKED otherwise.
- CALL OFFERED: omenStage >= 2 (self-bar gate). A call can
  be SOUNDED by the verb at any omen stage, but it is
  OFFERED as a button only at stage >= 2. Both columns
  reported; conflating them is an error.
- RE-FACE COUNT PER DAY: REFUSED herald attempts on that
  (seed, day). Also: days with refusals, max/day, median
  gap between consecutive refusal days, muster events
  between first and last refusal (expected 0; any nonzero
  is a finding).
- CHANNEL: TB-scholar = startCombat attempts mid 'herald'
  (caller from stack top); FIELD = fieldFight records mid
  'herald'. Per seed: TB refusals, TB fought + TB ends,
  field fights + outcomes, field kills (vKill) and TB kills
  (recordWaveKill mid herald). "Asymmetry changes a kill
  outcome" is judged as in mustercall-b: would excluding
  refused TB attempts, or gating field fights the way TB is
  gated, change any kill count on the band?
- FEAST-DRAW REGRESSION CHECK: any startCombat attempt mid
  'herald' with caller feast-draw, or any cast-sourced Herald
  face, counted separately and labeled REGRESSION-#1550.
- TRANSCRIPT SAMPLES (sense-testing): first-refusal say-ring
  slice and a late-repeat slice (last refusal day if one
  exists) on the cluster seed(s), plus one Herald
  field-fight record from this band's own capture if one
  exists. Judged: does the refusal line read honestly after
  the first telling; does anything change between first and
  twentieth refusal; does the refusal story repeat
  identically while the village state moves (the
  mustercall-b sense note) — and is that repetition the
  same on the new cluster, or does the new cluster read
  differently?

## Primary metric

Census completeness over the band: (a) every wave >= 4
startCombat attempt classified FOUGHT/REFUSED/THROW; (b)
every REFUSED herald attempt joined to a complete muster
snapshot (all of C1-C9 present, have/need matching the
refusal line). Completeness = joined-complete refused herald
attempts / all refused herald attempts. Cross-checks: (i)
verb counters on every seed; (ii) game-side refused
outcomes records join to REFUSED attempts on the same
titan and day; (iii) ready-manual vs ready-game agreement
on every snapshot.

## Band verdict (stated now, judged later, never re-scored)

- DIAG-GO: completeness >= 95% on the full band,
  cross-check match rates >= 95%, instrumentErrors = 0 on
  all seeds, >= 8 usable seeds, >= 1 distinct refused state
  cluster measured, AND the evidence states (a) the full Q1
  census (per-cluster blades/quota/omen/commit-block/
  re-face, with the refusal-seed count and the
  generalize-or-bound judgment vs mustercall-b), (b) the Q2
  channel asymmetry table with the kill-outcome judgment,
  (c) the Q3 ranked decision brief ONLY as far as the new
  census supports it (no new routing proposed — #1538
  still pending), and (d) wall numbers on the band. A
  single-seed cluster set still passes DIAG-GO if the
  evidence says so plainly (single-seed caveat carried in
  the headline) — the verdict is about census
  completeness, not about how many seeds refused. But a
  single-seed result on this band does NOT generalize
  mustercall-b: the headline must then say the pattern is
  bounded to two single-seed clusters, not band-wide.
- DIAG-NO-GO: completeness < 95%, or either cross-check
  < 95%, or instrumentErrors > 0 with no read-only
  explanation, or a required verdict section (a)-(d)
  missing.
- INSUFFICIENT-DATA: fewer than 8 usable seeds, or ZERO
  refused Herald states on the full band (the census
  question is then unanswerable on this band — Q2/Q3 are
  still reported as far as measurable, and the verdict says
  which questions died with the empty set, not that the
  gate is fixed). A dry band is a finding about contact
  scarcity (cf. mustercall-b's located-but-unfaced seeds),
  not a failure to run.

## Generalization bars (binding, judged in the evidence)

- G-GENERALIZES: refusals on >= 2 distinct seeds, and on
  each refusal seed the cluster rows show omen stage 2
  with the call offered, call yields in the 5–9 range (or
  explained outside it by link state), and ceilings
  reaching 10 on at least one refusal day per seed.
- G-BOUNDED: refusals on exactly 1 seed, or cluster rows
  that differ from mustercall-b's pattern in omen stage,
  offered-ness, or yield range — with the difference
  named, not smoothed. A bounded result still passes
  DIAG-GO if the completeness bars hold; it bounds the
  headline instead of generalizing it.
- G-CONTRADICTS: refusals on >= 2 seeds whose cluster rows
  systematically contradict mustercall-b (e.g. omen null
  or stage < 2 throughout, call never offered, yields
  stuck at 2) — reported as a contradiction of the
  mustercall-b headline, with mustercall-b's numbers
  re-checked for base movement before any claim that
  mustercall-b was wrong.

## Pilot gate (8 seeds before any confirm spend, §9)

Pilot GO requires: instrument fires on all 8 pilot seeds
with zero instrument errors; per-seed JSONs valid (days >
0, census sorted); AND an activity signal on >= 1 pilot
seed (a Herald TB attempt of any class, a Herald field
fight, or omen stage >= 2 reached) — otherwise the band is
dry and the run stops at pilot as INSUFFICIENT-DATA (no
confirm spend on an empty band). Pilot size is NOT the
verdict: the confirm carries it. If the pilot fails on
instrument grounds, the verdict is DIAG-NO-GO.

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over
(village lost or won). Identical to mustercall-b: the
herald-b cluster ran to day 130 and wave-4 doors opened as
late as day ~165 in prior bands, so a shorter cap would
censor the refusal tail; the death-aware stop keeps cost
at the survival distribution.

## Seeds (exact literals — the fresh band)

- Pilot: 86101, 86102, 86103, 86104, 86105, 86106, 86107,
  86108.
- Confirm (pilot GO only): 86109, 86110, 86111, 86112,
  86113, 86114, 86115, 86116 (16 seeds total).

## Policies (single-base measurement; no control leg by design)

Identical to mustercall-b, every seed:
`withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))`
with FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=1 FULLSEAT=1 + HERALD=1 + MUSTER=1 instruments.
Policy-side only, no game change. A same-base control is
NOT re-run as a judged leg; any seed whose trajectory
diverges from a prior corpus is reported as a base-movement
flag, not silently dropped.

## Wall numbers reported every run

national / table / wins, wave 4-5 unlocks, median survival
(game days), plus: Herald TB attempts by class and reason,
Herald field fights by outcome, wave-4 kills by channel
(TB vs field).

## Panel (§15)

Single-base DIAG measurement: no before/after comparison
exists in this arm (mustercall-b is a cross-base historical
corpus, not a panel before/after on this base), so
`scripts/balance-panel.js` does not apply. No panel compare
is attached and none is fabricated. A later lever arm
reusing this corpus as its baseline runs the panel then.
Same declaration as mustercall-b.

## Sense-testing (SENSE-TESTING LAW)

Read the first-refusal and late-repeat transcript slices on
the cluster seed(s) plus one Herald field-fight record from
this band's own capture if one exists. Judge: does the
refusal line land as an explanation a person would
understand the first time AND the twentieth time; does
anything change between first and twentieth refusal; does
the villager's subsequent behavior read as a person
reacting or a driver looping; does the refusal line
acknowledge the field fights happening elsewhere or the
remedy it prescribes? Counts alone do not pass this arm.

## Metric review

(To be filled at end of run. Doubts about the metric go
here and apply to the NEXT run, never to re-score this
one.)

## Convergence state

(One line at end of run: converging | converged | parked |
killed-at-pilot — for the scale-onramp axis measurement,
not a lever.)
