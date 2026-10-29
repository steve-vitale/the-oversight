# Journey social r65 — RESIDUAL DRY9 BURDEN RUN (lane B, 2026-10-29)

Leg 5 (social life). Prereg: `evidence/2026-10-29/r65/prereg.md` (written
before any r65 seed ran). Rotation-b read 5 at run start; this run
advances it to 6 at closeout. (Rotation note: r64's closeout stated
5 -> 6, but the file read 5 again at this run's start — the same
clobber class as r59–r64. The file is the authority; leg 5 carried
the named-next question, so this run played social again.)

Base: master 4dd347e4b. Driver: r64 driver verbatim (policy, DAYCAP=140,
death-aware, all linger, seeded-speaker steering ON, outing wedge
verbatim, invite recording verbatim) + ONE driver-only recording
addition: per-turn records feeding a new `dry9Detail` aggregation
(turn, pick, follow kind, retry outcome, position). Fresh seeds
6001–6004 + smoke 6005 (30d, self-test PASS twice). Zero src/js.
Zero game changes. This run is measurement.

## Pre-flight / infrastructure (loud)

- Overlap guard: no lock file existed at run start; new lock written
  (run 2026-10-29T08:55:48Z). Worktree `journey2-social` registered
  fresh (the r64 tree had been released) and heartbeated immediately;
  a detached heartbeat loop (10-min cadence) ran for the whole run
  and was verified in the registry after starting. One self-inflicted
  incident, documented: a `pkill -f` pattern matched my own shell's
  command line and killed the first heartbeat loop before the
  replacement loop started — the registry heartbeat never went stale
  (fresh manual beat 09:01:40Z covered the gap), and the replacement
  loop was verified alive before seeds ran.
- Main tree pre-flight: `git status` clean (0 files), disk 19%,
  `git pull` already up to date (4dd347e4b). Lane A had an active
  `journey-landing` tree during this run; it did not touch this
  lane's work, and the merge below was verified against the master
  it actually landed on.
- Wedge proof re-run before seeds: 14/14 green
  (scripts/test-journey-social-r65-outing-wedge.js).
- Pilot (prereg §9–12): smoke + seed 6001 ran first. The instrument
  recorded 197/197 dry9 turns with an exact engine-counter
  cross-check (197 = 197), so the full band ran. The pilot also
  raised the run's one investigation item (below): seed 6001 alone
  read dry9/convo 0.444, outside the prereg replication band.

## VERDICTS (pre-registered bars bind; see Metric review)

- RECOVERY: HESITATION — pooled substantive-or-close follows
  463/509 (91.0%, bar >= 85%); convos ending on a dry9 line 2/1703
  (0.1%, bar < 5%). Every seed passes the end bar alone (1/0/0/0
  end-on-dry9 convos); seed 6004 alone misses the recovery bar
  (74.3%) — the wart pocket below, not a pooled failure.
- REPLICATION: IN-BAND — pooled dry9/convo 0.300 (band [0.20, 0.40];
  r64 pooled 0.290). The pilot seed's 0.444 is seed variance, not a
  master change: the only conversation-code commit since r64's base
  is the invite exemption (c0b0540c4), which REMOVES dry
  replacements rather than adding them, and the pooled rate
  reproduces r64 within 0.010. Per-seed spread is wide (0.189–
  0.444) — single-seed dry claims are not reliable; quote pooled.
- CONTENT-LOSS (reported): of 511 dry9 turns, only 44 (8.6%) are
  retried with the same pick later in the same conversation — the
  driver prefers fresh picks, so "never retried" is mostly policy,
  not player behavior. Of the 44 retries (all on continuation /
  gesture picks: dlg:more 20, goon 12, nv:nod 12), 27 (61.4%)
  return substantive content, 17 (38.6%) collide again (nv:nod 9,
  dlg:more 7, goon 1). Content is deferred more often than
  destroyed, but a re-collision on retry means that villager cannot
  deliver that thread line that day.
- LOCUS (reported): no single pickId clears the >50% bar —
  dlg:more ("Tell me more") holds 248/511 (48.5%). But the
  continuation family clears it easily: dlg:more + dlg:react +
  goon = 354/511 (69.3%). The locus is generic continuation, not
  topical content: asking a villager to go on collides when the
  thread's next line was already spoken by someone else. Next
  ask:gossip 68 (13.3%), nv:nod 31, ask:others 20.
- POSITION: dry9 is a late-conversation phenomenon — turn 0–1:
  32 (6.3%), turns 2–4: 236 (46.2%), turn 5+: 243 (47.6%). Not a
  cold ledger: the ledger fills as the conversation goes on, and
  deep (10–14 turn) conversations carry most of it.
- PEOPLE: PASS — 5 sense reads, 4 dry9-heavy, 0 fabricated-history
  flags, 0 weak endings (bar <= 1).
- GUARDRAILS (carried): F1 dry 0.300/convo (< 1.0 ✓); F2
  end-on-dry 1/1703 = 0.1% (< 20% ✓); cold-open dry 8/1676 = 0.5%
  (< 10% ✓); outing deliveries 19 by the deliver log (>= 1 ✓);
  invite lure 9 decisions / 3 takes (33.3%), party census 57/29
  (50.9%) — character-decides holds in direction. noOffer 12.2%
  (r63 9.8%, r64 10.6%) and latePicks 320 (r63 413) are report-only
  guardrail drift, not verdicts.

## The wart pocket: dry chains on the extinct-village seed

Pooled another-dry follows are 46/509 (9.0%), but they concentrate
on seed 6004: 18 of the 46 (39%) from 14% of dry9 turns, 13 of them
on dlg:more. Seed 6004 is the village that went extinct (alive 0
at day 133, death-aware stop at 133d, not 140). In a thinning
village the last survivors keep colliding with each other — dry
followed by dry, twice in the pocket's worst conversations. Pooled
bars pass, so this is not a verdict failure; it is the named
follow-up: dry chains cluster where the village is thinnest, and
the next dry run should ask whether chain rate tracks living
roster size. Do NOT call the pooled game warted on this pocket.

## Village assessment (plain words)

- Seed 6001: 9 alive at day 141, deep2 29 pairs, trust 64%. The
  dry-heavy village (0.444/convo) — and still the most socially
  intact read of the run: conversations hesitate and recover.
- Seed 6002: 8 alive, deep2 34, trust 94%. The nonverbal village
  (Giulia's Italian partial-language beat) and the cold-open
  outlier (5 cold-open dry of the pooled 8).
- Seed 6003: 7 alive, deep2 34, trust 93%. The quiet village —
  lowest dry rate of the surviving three (0.216), 0 cold-open dry.
- Seed 6004: 0 alive — the village died out by day 133 (the run
  stops simulating a dead village; 371 convos, not 444). Deep2 23,
  the thinnest social fabric, and the dry-chain pocket. Even here,
  9 outings delivered before the end — people kept their promises
  while the village died around them.
- Across all four: 120 deep (depth-2+) pairs, 0 cracks, 0
  villager-cracks, 0 friend grievances everywhere. Moots: 0 on all
  seeds under this all-linger policy (policy note, as r64, not a
  moot-system finding). 19 outings delivered (7/1/2/9 by seed),
  23 starts from 59 accepts — the dawn-adjacency bottleneck r64
  named is unchanged (75 start-blocked attempts pooled).

## People check (M5, full transcripts read)

1. s6001-dry-1-Henry (day 109, 4 dry9 in 14 turns): dry lines read
   as hesitation inside a working conversation — gossip deflects,
   a walk beat lands ("You walk to the ridge with Henry"), and it
   closes warm ("This was good. They mean it."). End-on-dry false.
2. s6001-dry-2-Henry (day 28, 3 dry9 in 13 turns): same pattern;
   after the last dry, "I should go. Before I overthink this
   conversation too." — self-aware, in character, warm close.
3. s6002-dry-1-Giulia (day 99, 4 dry9, all on nonverbal picks):
   even silent gestures get dry-replaced lines, and the
   conversation still works — a partial-language beat ("Dove...
   dove si dorme, qui?") lands mid-conversation. Weakest read:
   the conversation OPENS on a dry line (turn-0 dry on a nod) —
   noted, not flagged; cold-open dry pooled is 0.5%.
4. s6004-dry-1-Petra (day 45, 2 dry9): "Do you still sing? ...I
   just realized I haven't heard anyone sing." — characterful,
   real. Both dry lines recover; close is warm.
5. s6001-favoraccept-1-Olivia (day 4): crisp accept ("Where the
   wild onion grows thick, at sunup. Pack and knife."), a teaching
   beat ("I never knew that." on Wild Ramps), close "First light.
   The pantry's counting on us." — and the outing started day 5.

M5: 5 reads, 4 dry9-heavy, 0 fabricated-history flags, 0 weak
endings. PASS.

## Blanks filled / documented

- FILLED (measured): the residual dry9 burden is characterized —
  hesitation, not dissolution, at pooled level; continuation
  picks are the locus; late-conversation saturation is the shape;
  retry usually recovers content; dry chains pocket on the
  thinnest village.
- DOCUMENTED (instrument gap, carried from r64): favorEndStates
  remains lossy (only a subset of accepted favors appear); outing
  counts use the deliver log, never end-state matching.
- DOCUMENTED (seed variance): dry9/convo varies 0.189–0.444 across
  fresh seeds on identical policy. Any future single-seed dry
  claim needs a pooled band behind it.

## Metric review (§14 — binds the NEXT run, not this one)

1. The replication band [0.20, 0.40] held pooled (0.300) but a
   single seed (6001, 0.444) broke it alone. Keep the band for
   pooled rates; report per-seed spread alongside, never alone.
2. followKind 'close' never fired (0/511) — recovery is entirely
   substantive next lines. The bar's "substantive-or-close" wording
   is harmless but the close half is dead weight; next run may
   simplify to substantive-only with the same 85% bar.
3. Retry rate is driver-shaped (fresh-pick preference), so the
   8.6% retry figure must never be quoted as a player retry rate.
   The conditional figure (61.4% of retries recover) is the
   quotable one.
4. Counter cross-check exact on all 4 seeds (transcript dry =
   engine counter: 197/148/96/70). r64's one-line delta did not
   recur.
5. Telemetry baseline: NOT rolled (see Telemetry section).

## Telemetry

Deviation check vs telemetry-baselines/social.json (metrics
l3.bonds, l3.deep2, dryRate). Exactly one LOUD line: l3.deep2
baseline 0 -> current 120 (n=4 files) — the same
baseline-predates-key artifact r63/r64 already classified (the
baseline carries deepBonds 168, not deep2; the tool reads the
missing key as 0). Verdict: EXPLAINED, not a bug; baseline NOT
rolled. Pooled l3.bonds 271 vs baseline 318 (-15%) did not trip
the tool's threshold — quiet, reported not chased.

## CHECK-QUICK

Recovery note: the 04:00 CDT coordinator timed out before closeout, leaving
only a partial mid-run log (check-quick-r65.log: 8 unnamed F's, killed
mid-suite). The recovery run captured a FULL final log instead, and this
section is filled from it — the partial log is superseded, not adjudicated.

- Final run (recovery agent, worktree journey2-social):
  `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-recovery-r65`
  — 280 passed, 10 failed in 2874s, 290 scripts.
  Log: evidence/2026-10-29/r65/check-quick-final-r65.log.
- Assertion failures (7, all in the documented standing-failure families;
  none references any r65 file; zero src/js diff, so all fail identically
  on base code): godpath/test-measurement-proof-update.js,
  godpath/test-measurement-workflow.js,
  godpath/test-measurement-cache-flags.js,
  godpath/test-mobile-combat-cadence.js,
  godpath/test-occupation-panels.js, godpath/test-phone-frame-proof.js,
  test-establishment-r20-fixes-20261020.js (racks-full voice gate:
  next-day voices once more, expected 2 got 1).
- Timeouts (3, exit null at exactly the 120s check.js kill):
  godpath/test-trust-observer-neutrality.js, test-synergy-stall.js,
  test-capable-bot-20261014.js. This run overlapped two other check-quick
  suites (journey-establishment from ~10:24 UTC, build-geartier from
  ~10:36 UTC) — triple-concurrent-jest contention. All three PASS
  standalone on this worktree's code (direct node, after the concurrent
  suites ended): trust-observer-neutrality 6/6, synergy-stall exit 0,
  capable-bot 42/42. Verdict: contention artifacts, not real failures.
- Wedge proof re-run: scripts/test-journey-social-r65-outing-wedge.js
  14/14 green (before seeds and again at recovery closeout).
- Verdict: GO — no failure is caused by r65 files; all 10 are
  pre-existing base-code failures or contention timeouts. Measurement
  only, zero src/js.

## Run inventory

- Driver: scripts/journey-social-r65-20261029.js (r64 fork +
  turnRecs/dry9Detail recording) + wedge
  scripts/journey-social-r65-outing-wedge.js + proof
  scripts/test-journey-social-r65-outing-wedge.js (14/14).
- Analyzers: scripts/analyze-journey-social-r65-dry9-20261029.js
  (new, Q1–Q4) + scripts/analyze-journey-social-r65-funnel-20261029.js
  (r64 funnel fork, guardrails).
- Evidence: evidence/2026-10-29/r65/ (prereg, run-note, 4
  per-seed JSONs + r65-verdicts.json, run logs, check-quick log,
  summaries/, transcripts/). Smoke 6005 (30d) is NOT in pooled
  bars; it passed its self-test twice (pilot + seeds runs).
- Zero src/js changes. Zero game changes. This run is measurement.
