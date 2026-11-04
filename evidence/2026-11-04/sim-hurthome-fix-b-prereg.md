# sim-hurthome-fix-b — PREREG (binding, MEASUREMENT.md §14)

Run: oversight-flesh-out-loop, run fleshout-20261104T1120Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-hurthome-fix-b. Axis: food-economy.
Arm: HURT-AWARE TURN-HOME RULE FOR TRIPS, re-judged with an EVENT-based
instrument — the NAMED NEXT ARM from Loop A sim-hurthome-fix-a
(evidence/2026-11-04/sim-hurthome-fix-a.md, verdict INSUFFICIENT-DATA).

## CONTEXT (not re-litigated)

- Fix-a verdict: the dawn census collapsed (baseline trips 15, armed
  trips 6, bar >= 16 each) because the rule fires at the next TRAVEL
  TICK after any hurt, so most hurt travelers are home before the next
  dawn and never open a dawn episode. Armed hurt-return lines: 39
  across 16 seeds vs 6 armed dawn episodes. Baseline come-home was
  already 0.933 on band 97501–97516, so the +0.15 lift bar was
  unreachable before the armed cell ran.
- This arm does NOT reuse the dawn-episode metric or the +0.15
  come-home bar. It does NOT reuse the 1015Z corpus as a baseline leg:
  master has moved since (journey-landing r96 etc.) — BOTH legs run
  fresh on current master.
- Fix re-applied exactly: `git cherry-pick 299d94403` (new hash
  5cf217912 on this branch; same message, same game.js +29 and test
  97 lines; the revert 93823af9f is an ancestor). No redesign: hp
  gate stays <= 7, purpose 'leave' stays excluded, no expedHurt
  write-back added mid-run. Proof test scripts/test-hurthome-fix-a.js
  verified 10/10 green BEFORE this prereg and before any judged sim.
- Canon read first: docs/CANON.md, docs/MAP.md (way home). No canon
  doc covers away-return timing or hurt-traveler behavior — the
  mechanism is code-read, not invented canon.
- Mechanism (code-read, re-verified this run): npcNodeTravel (game.js)
  returns a ledger-away villager when partsAway >= away.duration, OR
  (armed only) when shouldHurtReturn holds (trip, hp 1..7). Hurt
  paths route overwhelmingly through Game.hurtVillager (monster,
  contest, sickness, starvation, hunting, experiment); two direct
  health writes exist (game.js field-damage write, nomad-wild
  wild-fight write-back) and hurts-before-departure can still be
  hurt while away — so the instrument ALSO runs a per-part scan
  net (see below). Both cells use the identical instrument.

## INSTRUMENT (event-based — pinned)

- New scripts/hurthome-b-lib.js (pure case logic, proof-tested by
  scripts/test-hurthome-b.js, green before judged sims) and
  scripts/sweep-hurthome-fix-b.js + scripts/analyze-hurthome-fix-b.js.
  scripts/hurthome-a-lib.js is NOT reused for judging (dawn census);
  only the fix-a transcript-capture pattern is carried over.
- CASE (the unit): one hurt episode of one ledger-away villager.
  A case OPENS when a villager who is ledger-away (v.away present)
  is observed alive-and-hurt (hp 1..7):
  (a) in the Game.hurtVillager post-wrapper (source 'hurtVillager',
  with cause, dmg, hpAfter), or
  (b) in the per-part scan net after npcNodeTravel (source 'scan',
  cause 'scan-crossing') — this catches direct-write hurts,
  hurts-before-departure still hurt while away, and any hurt path
  that bypasses hurtVillager.
  One case per villager at a time; a second hurt while a case is
  open does NOT open another (hurtCount++ on the open case).
  A healed interval breaks continuity: a case closes 'healed-away'
  when a part scan finds its villager still away with hp > 7, so a
  later re-hurt opens a NEW case. Trip identity = away tripKey
  (sinceDay|sincePart|purpose); a tripKey change under an open
  case closes it 'censored-tripKeyChanged' (not expected).
- A case CLOSES as exactly one of:
  returned-hurt (away record gone at a travel tick, pre-travel hp
  1..7), returned-healed (away record gone, pre-travel hp > 7),
  returned-unknown (away record gone, pre-travel hp missing —
  excluded from the latency population, counted),
  died (registerDeath pre-wrapper, or heal-scan dead find),
  healed-away (still away, hp > 7 at a part scan),
  censored (still away-and-hurt at run end),
  censored-tripKeyChanged (see above).
  Every case lands in exactly one outcome; unclassified > 0 or
  instrument errors > 0 voids the instrument (fix, re-run affected
  seeds only, state the fix — never re-score).
- RETURN LATENCY (parts) = (closeDay − eventDay) * 4 +
  (closePart − eventPart), for returned-hurt cases only. Parts are
  day-parts (0 dawn, 1 midday, 2 dusk, 3 night); the formula is
  monotonic across day rolls. Negative latency, if any, is an
  instrument error (counted, investigated, never silently clamped).
  Final-scan returns (away record gone after the last travel tick)
  close returned-hurt/healed by last observed hp with censorNote
  'finalScanReturn' and ARE included in the latency population;
  their count is reported separately.
- TRIPS vs WALK-OUTS always split by purpose ('leave' = walk-out,
  everything else = trip). Never pooled. Lethal one-shot hurts with
  no prior alive-hurt observation open NO case (the villager never
  entered the hurt population alive); they appear only in the
  per-seed death counts, not in any case rate.
- Transcript capture (bounded, same pattern as fix-a): away-voice
  hurt lines, return lines, lines naming a case villager. The
  armed hurt-return line matches the "returns from" pattern.

## DESIGN (cells, policy, horizon, seeds — pinned)

- Policy: competent (scripts/policies/competent.js), unchanged.
- Horizon: 100d death-aware cap (dead villages stop; never a
  fixed 200d). Why 100d: comparability with fix-a, which posed
  this question on the same horizon/policy.
- Env: PLENTYDEPRI=1, DEPOSITGATE=1 (shipped defaults, explicit,
  same as fix-a).
- Seeds: PILOT 97601–97608, CONFIRM 97609–97616 (fresh band:
  zero s976* per-seed files and zero 976* files existed in
  evidence/2026-11-04/ before adoption, verified 2026-11-04).
  Corpus dir evidence/2026-11-04/perseed-hurthome-fix-b/
  (filenames suffixed -baseline / -armed).
- BASELINE cell runs FIRST: worktree game.js temporarily replaced
  with HEAD~1 (pre-fix) game.js — the ONLY difference between
  cells is the fix commit; verified by git diff showing exactly
  the fix hunk reversed. ARMED cell runs after restoring HEAD
  game.js (tree clean at the fix commit). The proof test file
  stays in the tree during the baseline leg but is never run
  against baseline code (it asserts a function baseline lacks).
- Cells differ by EXACTLY one commit: the hurt-check + hurt-line
  change in src/js/game.js (+ its proof test). No gate, price,
  deed, readyDemand, policy-default, or other-lane change.

## PRE-REGISTERED GO (judged against this header, §14)

- PILOT GATE (8 seeds per cell): instrument errors 0, every case
  classified (unclassified 0), trip event cases >= 8 in EACH
  cell. If EITHER cell's pilot trip cases < 8, STOP and report
  INSUFFICIENT-DATA with the counts — do not extend the horizon,
  widen the hp gate, or manufacture events. (The confirm band is
  pre-budgeted but is NOT run past a failed pilot gate in this
  arm: the brief's stop rule overrides fix-a's run-anyway rule,
  because the pilot question here is event yield itself.)
- JUDGED CENSUS (pooled 16 seeds per cell): INSUFFICIENT-DATA if
  pooled trip cases < 16 in either cell, OR pooled returned-hurt
  trip cases < 8 in either cell (the latency median needs a
  population, not a handful). Counts shown descriptively only.
- PRIMARY (trips only, returned-hurt cases, pooled 16 seeds):
  median return latency (parts). GO requires BOTH:
  (a) armed median <= 2 parts — the mechanism claim (return at
  the next travel tick: 0 parts if the hurt precedes travel in
  the same part, 1 part if it follows travel, 2 parts of scan
  slop at most); AND
  (b) armed median < baseline median — strictly faster than the
  clock, so a saturated baseline cannot pass the absolute bar
  on clock returns alone.
- SECONDARY (reported, must not contradict GO): armed trip
  died-while-away share (died cases / all trip cases) <= baseline
  trip died share; hurt-return line count and returned-hurt
  cases per seed reported in both cells; source split
  (hurtVillager vs scan) reported; walk-out cases reported
  separately (expected: long latencies, ~0 returns in both
  cells).
- WALK-OUT EXCLUSION (hard): an exclusion FAILURE voids GO
  outright. Failure = any armed walk-out case closed
  returned-hurt with latency <= 2 parts, OR any armed hurt-return
  line naming a walk-out villager (checked as in fix-a). Any
  armed walk-out return at all is investigated and reported even
  if it does not meet the failure definition.
- GUARDRAILS (hard; a breach voids GO even if primary passes):
  median daysAlive armed >= baseline median − 10 days;
  survived-seed count armed >= baseline count − 2 seeds.
  Died-while-away share overall (all cases) reported, not hidden.
- NARRATION AUDIT (required for GO): >= 1 armed hurt-return line
  found in armed transcripts, quoted and judged TRUE (names the
  returned villager, hp matches the return snapshot, line says
  hurt/cut-short). If 0 lines fire, the narration leg is
  INSUFFICIENT-DATA and no GO is claimed.
- GO = judged census met AND primary met AND secondary
  non-contradiction AND exclusion holds AND guardrails hold AND
  narration audit passed AND instrument clean. GO lands the fix
  commit (game.js + proof test + prereg + evidence + both
  corpora + instrument) on this branch, with [needs-eyes] (a
  behavior change to when hurt villagers come home qualifies).
  The coordinator merges; this worker does NOT push, bump, or
  verify live.
- NO-GO = judged census met but primary missed, or any guardrail
  breached, or an exclusion failure. A NO-GO leaves NO src
  change: the fix commit is reverted before reporting, and the
  evidence reports the miss as the finding. INSUFFICIENT-DATA
  likewise reverts the game-code change (as fix-a did).
- §15 BALANCED PANEL — DECLARED INAPPLICABLE (before the pilot,
  not after the fact): scripts/balance-panel.js measures no
  hurt-event latency metric — its per-seed rows cannot express a
  return-latency median, a died-while-away share among
  event-defined cases, or a hurt-triggered return. Fabricating a
  panel compare from case JSONs would be dishonest. The
  comparison instrument is the pre-registered per-seed matched
  table (identical seeds, identical policy/horizon/env, both
  cells from the same instrument), with guardrail medians from
  the same per-seed JSONs.

## SENSE TEST (after the judged run, before verdict)

Read armed transcripts: every hurt-return line found, plus the
return lines of at least 2 hurt-return cases, judged against each
case's own record (purpose, event hp/cause, latency, return hp).
Quote, don't just count: at least two quoted hurt returns in the
evidence, judged as a person making a choice (hurt → coming home)
vs the clock merely running out. SENSE-TESTING LAW: judge meaning,
coherence, and consequences — never just counts.

## VERDICT RULES (§14 — a miss is NO-GO, never re-scored)

- A miss is never re-scored against a friendlier metric mid-run
  (no swapping latency for come-home rate, no pooling trips with
  walk-outs, no dropping same-day deaths from the denominator,
  no switching to a per-seed median of medians if the pooled
  median misses). Doubt about a metric goes under "metric review"
  in the evidence, for the NEXT run.
- An instrument failure (unclassified > 0, errors > 0) is fixed
  in the instrument, the affected seeds re-run only, and the fix
  is stated — never hidden by re-scoring.

## METRIC REVIEW (to be filled in the evidence file, not here)

Reserved: whether median latency in parts, the hp <= 7 gate, the
trip/walk-out split, the scan-net source split, and the
player-at-haven narration gate were the right instruments, judged
AFTER the run — never revised mid-run.
