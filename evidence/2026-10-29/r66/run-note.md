# Journey social r66 — DRY-CHAIN vs ROSTER-SIZE RUN (lane B, 2026-10-29)

Leg 5 (social life). Prereg: `evidence/2026-10-29/r66/prereg.md` (written
before any r66 seed ran) + Amendment A (pilot-caught, before the judged
band ran). Rotation-b read 5 at run start; this run advances it to 6
at closeout. (Rotation note: r65's closeout stated 5 -> 6, but the
file read 5 again at this run's start — the same clobber class as
r59–r65. The file is the authority; leg 5 carried the named-next
question, so this run played social again.)

Base: master 4f349fed1. Driver: r65 driver verbatim (policy, DAYCAP=140,
death-aware, all linger, seeded-speaker steering ON, outing wedge r65
verbatim, invite recording verbatim, dry9Detail verbatim) + TWO
recording-only additions: per-loop-day roster snapshots (prereg) and
Amendment A fields (turnRecs.added, dry9Detail.followNextAdded /
followNextLastLine) + one env-gated post-band diagnostic projection
(perConvoDiag, DIAG_PERCONVO=1, used only for the 6102 counter
investigation; never in the verdict series). Zero src/js. Zero game
changes. This run is measurement.

## Pre-flight / infrastructure (loud)

- Overlap guard: no lock file existed at run start; new lock written
  (run 2026-10-29T14:56:15Z). Worktree `journey2-social` registered
  fresh (the r65 tree had been released) and heartbeated immediately
  (registry 15:02:58Z); a detached heartbeat loop (10-min cadence,
  setsid/nohup, logged) ran for the whole run and was verified alive
  in the registry at every check. One self-inflicted note: the first
  loop attempt died with its timed-out exec session before the
  replacement loop started — the registry heartbeat never went stale
  (manual beat covered the gap), and the replacement was verified
  alive before seeds ran.
- Main tree pre-flight: `git status` clean (0 files), disk 22%,
  `git pull` already up to date (4f349fed1). Lane A had an active
  `journey-establishment` tree during this run; it did not touch
  this lane's work.
- Wedge proof re-run before seeds: 14/14 green
  (scripts/test-journey-social-r65-outing-wedge.js, r65 wedge verbatim).
- No conversation-code commit on master between r65's base
  (4dd347e4b) and this base — the mechanism is unchanged.
- Pilot (prereg §9–12): smoke 6105 PASS + seed 6101 EXIT 0 first.
  The pilot caught the followKind ambiguity (Amendment A) and the
  instrument was fixed before the judged band ran; seed 6101 was
  re-run under the amended driver and reproduced byte-identically
  except for the new fields (checked by diff; pre-amend JSON kept
  as `journey-social-r66-s6101-preamend.json`).

## VERDICTS (pre-registered bars bind; see Metric review)

- CHAIN-TRACKS: INSUFFICIENT-DATA — the thin band (<= 4 living
  NPCs) NEVER OCCURRED on any seed: roster ranges were 8–11,
  5–11, 6–11, 6–11; thin days = 0, thin dry9 = 0. The comparison
  r65's pocket suggested could not be tested, because no fresh
  village thinned to <= 4 in 140 days under competent policy.
  This is reported, never rescued by moving the band edges
  mid-run.
- TRUE CHAINS (the finding inside the non-verdict): pooled true
  back-to-back dry9 substitutions = 1 of 514 dry9-with-next
  (0.2%) — a single run of length 2 on seed 6104 (thinned band).
  Everywhere else maxRun = 1. Of the 49 r65-definition
  "chains" (another-dry follows), 48 are PHANTOM (next turn added
  zero transcript entries; its lastLine is just the dry line
  echoed) and 0 are ANOMALY. r65's "dry chains cluster on the
  thinnest village" premise DISSOLVES: villagers essentially
  never lose the thread twice running. The ledger does not make
  them talk in circles.
- PHANTOM GRADIENT (reported, not a verdict): r65-definition
  chain rate is 8.1% on FULL days vs 17.5% on THINNED days —
  but both are phantoms. What rises as the roster thins is the
  rate of EMPTY turns following a dry line (a turn that adds no
  transcript entries), not dry repetition. The mechanism question
  — which pick produces a zero-entry turn after a dry line —
  is the named follow-up; the current instrument does not export
  the following turn's pickId.
- DRY DENSITY (reported): dry9 per band-day FULL 0.90 vs
  THINNED 1.04 (77 thinned days) — slightly higher thinned,
  small-n and seed-mixed; quoted as description, not a verdict.
- REPLICATION: IN-BAND — pooled dry9/convo 0.291 (band
  [0.20, 0.40]; r65 0.300). Per-seed 0.324 / 0.214 / 0.323 /
  0.304. With engine counts (520 incl. 3 opening lines, below)
  it is 0.293 — band unchanged either way.
- RECOVERY: HESITATION — pooled substantive-or-close follows
  465/514 (90.5%, bar >= 85%); convos ending on a dry9 line 3
  (0.2%, bar < 5%). Secondary figure (not the verdict series):
  excluding the 48 phantom follows from the denominator,
  recovery is 465/466 (99.8%) — the residual non-recovery is
  essentially the single true chain.
- PEOPLE: PASS — 5 sense reads, 4 dry9-heavy, 1 from a thinned
  band day (Omar, roster 7), 0 fabricated-history flags,
  0 weak endings (bar <= 1). No THIN-band read was possible:
  no thin-band dry9 exists this run.
- GUARDRAILS (carried): F1 dry 0.291/convo (< 1.0 ✓); F2
  end-on-dry 0.2% (< 20% ✓); cold-open dry 1/1775 = 0.1%
  (scan-based; see opening-line gap — true cold-open dry is
  >= reported); outing deliveries 18 by the deliver log
  (>= 1 ✓); invite lure 21 decisions / 8 takes (38.1%),
  party census 56/26 (46.4%) — character-decides holds in
  direction. noOffer 10.0% (r63 9.8%, r64 10.6%) and latePicks
  414 (r63 413) are report-only guardrail stability, not
  verdicts.
- INSTRUMENT: roster lookup covers 100% of dry9 turns
  (UNBANDED 0/517 ✓, bar >= 95%). Engine-counter cross-check
  MISSED on one seed (see investigation below) — investigated
  in-run, not re-scored.

## The 6102 counter delta — investigated, root-caused (instrument gap)

Pooled engine counter 520 vs transcript dry 517: all 3 lines sit
on seed 6102 (counter 98 vs scanned 95); seeds 6101/6103/6104 are
exact. A post-band diagnostic re-run (env-gated per-convo
projection, separate OUTROOT, reproduction verified IDENTICAL
minus the diag field) localized all 3 lines: three Sigrun
sittings (days 100, 107, 108, bond-daily-2/3), each counter
exactly 1 above scan, all other 441 convos exact.

Root cause (read in src/js/conversation.js): `startConvo`
resets `dryLines = 0` per sitting and EMITS the opening line
during open — before the driver's first turn sets `beforeLen`.
A run-ledger-blocked opener is honestly dry-substituted at
open (convoDryLine), counted by the engine, and invisible to
the turn-scan. Sigrun's three sittings each opened on one such
line. Verdict: INSTRUMENT GAP, not a game bug — the game
counted honestly; the driver's census starts one beat late.

Consequences, all bounded: transcript dry totals undercount by
opening dry lines (pooled true dry >= 520, not 517); the
cold-open guardrail understates by the same class; dry9Detail
lacks opening dry turns (no preceding turn, so chain/recovery
definitions are unaffected in shape). Named fix for the next
social run (NOT done here — prereg authorized measurement):
scan the opening segment too (transcript length right after
startConvo, scan from 0), so opening dry lines join the census.

## Village assessment (plain words)

- Seed 6101: 7 alive at day 141, deep2 32 pairs, trust 85%.
  The steady village (roster 11 → 8, 3 deaths: wild, stranger).
  5 outings delivered. Dry-heaviest of the surviving three
  (0.324/convo) and still socially intact.
- Seed 6102: 5 alive at day 142, deep2 39 (the deepest bonds of
  the run), trust 83%. The thinnest village — 11 deaths
  (wild, monster, arena, combat, contest, alien) against 5
  joiners — and the most deeply bonded: thinning did not thin
  the friendships. Lowest dry rate (0.214). 4 outings delivered.
- Seed 6103: 9 alive at day 141, deep2 29, trust 91% (the
  warmest village). The barren village: 29 favors accepted,
  0 outings delivered (124 barren forage attempts) — people kept
  asking and kept promising while the ground gave nothing.
  1 villager-crack, 2 friend grievances.
- Seed 6104: 8 alive at day 140, deep2 28, trust 81%. The
  delivering village: 9 outings delivered from 22 accepts, and
  the run's only true dry chain. 1 friend grievance.
- Across all four: 128 deep (depth-2+) pairs, 319 bonds, 0
  cracks, 2 villager-cracks, 3 friend grievances. Moots: 0 on
  all seeds under this all-linger policy (policy note, as
  r64/r65, not a moot-system finding). 18 outings delivered
  (5/4/0/9 by seed); the dawn-adjacency bottleneck is unchanged
  (110 start-blocked attempts pooled).

## People check (M5, full transcripts read)

1. s6103-dry-1-Omar (day 66, THINNED roster 7, 3 dry9 in 12
   turns): the thinned-band read. All three dry lines recover;
   the conversation lands a real memory ("When I was bleeding,
   Grace stayed and did the work") and closes warm ("Come back
   anytime"). End-on-dry false.
2. s6102-dry-1-Caleb (day 89, FULL, 3 dry9 in 14 turns): dry
   lines read as hesitation; recovers to a striking substantive
   line (Carolina, "senses gone strange"). End-on-dry false.
3. s6104-dry-1-Nadia (day 39, FULL, 3 dry9, ALL on dlg:more):
   the continuation locus in miniature — asking her to go on
   collides three times, and the conversation still works,
   ends warm ("I wish we had longer. Soon, yeah?").
   Her contest boast ("I won Who Ate It?. On camera.") is
   in-character boasting, not a shared-history claim — noted,
   not flagged.
4. s6102-dry-2-Rowan (day 97, FULL, 3 dry9 in 10 turns):
   "Let's file that under 'discussed'" reads as character, not
   filler; closes warm ("You're a good listener, you know
   that?"). End-on-dry false.
5. s6103-favoraccept-1-Kurt (day 4): crisp accept ("The meadow
   edge, west of the creek, at sunup. Pack and knife."), a
   genuinely moving dream exchange ("Before. Every night."),
   close "First light. The pantry's counting on us."

M5: 5 reads, 4 dry9-heavy, 1 thinned-band, 0 fabricated-history
flags, 0 weak endings. PASS.

## Blanks filled / documented

- FILLED (measured): r65's chain pocket is a phantom artifact —
  true chains are 1 in 514, not 46 in 509. The followKind
  'another-dry' series must never be quoted as chains again;
  the amended TRUE/PHANTOM/ANOMALY split is the series now.
- FILLED (root-caused): the 6102 counter delta is the
  opening-line scan gap (Sigrun x3), not a game miscount.
- DOCUMENTED (unreachable this band): the THIN (<= 4) band.
  No competent-policy village thinned that far in 140 days.
  The next thin test needs a thinner village first — longer
  horizon, harsher policy, or seeded deaths — decided by the
  next prereg, not by moving band edges after the fact.
- DOCUMENTED (instrument gaps, carried): favorEndStates
  remains lossy (only a subset of accepted favors appear);
  outing counts use the deliver log, never end-state matching.
  NEW: (a) opening dry lines escape the census (fix named
  above); (b) phantom follows lack the following turn's
  pickId, so the zero-entry-turn mechanism is unidentified.
- DOCUMENTED (seed variance, carried): dry9/convo varies
  0.214–0.324 across fresh seeds on identical policy. Quote
  pooled, never single-seed.

## Metric review (§14 — binds the NEXT run, not this one)

1. The CHAIN-TRACKS verdict is INSUFFICIENT-DATA by the
   pre-registered rule (thin n=0). It is not a NO-TRACK
   finding and not a failure: the run could not manufacture
   the condition it was asked to compare. The next dry run
   must first establish a thin village, or the question stays
   unanswerable by this instrument.
2. The r65-definition chain rate is retired as a verdict
   series (Amendment A). It is still printed per band for
   comparability, labeled NOT the verdict series.
3. Recovery's bound definition (substantive-or-close /
   withNext) still includes phantoms. The phantom-excluded
   figure (99.8%) is the cleaner hesitation read; the next
   prereg may bind recovery on true-chain-excluded follows
   with the same 85% bar — but that change belongs to the
   next prereg, not to this run's verdicts.
4. Counter cross-check is no longer a pass/fail gate in its
   r65 form: opening dry lines make small counter excesses
   EXPECTED until the scan fix lands. Until then, report the
   delta and localize it per convo (the diag projection is
   the tool), rather than treating any delta as a failure.
5. Telemetry baseline: NOT rolled (see Telemetry section).

## Telemetry

Deviation check vs telemetry-baselines/social.json (metrics
l3.bonds, l3.deep2, dryRate). Exactly one LOUD line: l3.deep2
baseline 0 -> current 160 (n=5 files) — the same
baseline-predates-key artifact r63/r64/r65 already classified
(the baseline carries deepBonds 168, not deep2; the tool reads
the missing key as 0). Note: n=5 because the check's glob also
matched the kept pre-amend pilot JSON; excluding it by hand,
pooled deep2 is 128 (not 160) — still LOUD only for the
missing-key reason. Pooled l3.bonds 319 vs baseline 318 is
essentially identical and quiet. Verdict: EXPLAINED, not a bug;
baseline NOT rolled.

## CHECK-QUICK

- Final run (worktree journey2-social):
  `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
  — 284 passed, 6 failed in 603s, 290 scripts.
  Log: evidence/2026-10-29/r66/check-quick-r66.log.
- Failures (6, all in the documented standing-failure families
  from r65; none references any r66 file; zero src/js diff, so
  all fail identically on base code): godpath/test-measurement-proof-update.js,
  godpath/test-measurement-workflow.js,
  godpath/test-mobile-combat-cadence.js,
  godpath/test-occupation-panels.js, godpath/test-phone-frame-proof.js,
  test-establishment-r20-fixes-20261020.js (racks-full voice gate:
  next-day voices once more, expected 2 got 1 — same as r65).
- No timeouts this run (r65 had 3 contention timeouts):
  trust-observer-neutrality (57s), capable-bot (49s) and
  synergy-stall (47s) all completed — check-quick ran alone,
  no concurrent jest. test-measurement-cache-flags.js, failed
  in r65, passed this run.
- Wedge proof re-run: scripts/test-journey-social-r65-outing-wedge.js
  14/14 green (before seeds).
- Verdict: GO — no failure is caused by r66 files; all 6 are
  pre-existing base-code failures. Measurement only, zero src/js.

## Run inventory

- Driver: scripts/journey-social-r66-20261029.js (r65 fork +
  rosterByDay + Amendment A fields + env-gated perConvoDiag).
- Wedge: scripts/journey-social-r65-outing-wedge.js verbatim;
  proof scripts/test-journey-social-r65-outing-wedge.js 14/14.
- Analyzers: scripts/analyze-journey-social-r66-chain-20261029.js
  (new, TRUE/PHANTOM/ANOMALY split) +
  scripts/analyze-journey-social-r66-funnel-20261029.js (r65
  funnel fork, guardrails).
- Evidence: evidence/2026-10-29/r66/ (prereg + amendment,
  run-note, 4 per-seed JSONs + pre-amend pilot JSON +
  r66-verdicts.json, run logs, chain + funnel analyses,
  summaries/, transcripts/). Smoke 6105 (30d) is NOT in pooled
  bars; it passed its self-test (pilot + amended re-run).
- Diagnostic (not a verdict input):
  evidence/2026-10-29/r66/diag-6102-perconvo.json
  (perConvoDiag projection only; reproduction IDENTICAL minus
  the diag field; the full diag JSON was deleted to avoid
  duplicating the verdict JSON).
- Zero src/js changes. Zero game changes. This run is measurement.
