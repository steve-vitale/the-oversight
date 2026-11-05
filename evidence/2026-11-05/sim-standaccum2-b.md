# STANDACCUM2 — standing accumulation, part 2 (Loop B verdict, run fleshout-loop-b-20261105T0139Z, arm sim-standaccum2-b)

Axis: winnability chain, 2330Z next blank #2. DIAGNOSTIC ONLY, zero
src/js. No readyDemand move, no VETSHAPE flip, no gate/price/deed
change. The 99101–99108 corpus is CONTEXT ONLY; the verdict below
comes from the fresh band 99111–99126.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-05/sim-standaccum2-b-prereg.md`
(commit e6e4df47c). In short: 16 fresh seeds 99111–99126,
competent policy verbatim, default env, 150d death-aware horizon,
vetprod instrument reused verbatim. PRIMARY metric: count of
error-free seeds with >= 1 RELEASE DAY — a snapshot day with
derived living wave-4 killers >= 2 AND gated standing >= 200 AND
engine readiness5.ready true. Verdict DIAG-GO iff >= 1 such seed
with its full trajectory quoted; DIAG-NO iff zero on 16 (a bound,
not a failure to report); INSUFFICIENT-DATA only if > 2 seeds
carry instrument errors. Closest seed by fixed ranking (among
seeds ever banking >= 2 killers: highest gated peak, tie-break
most days with living >= 2, then lowest seed; if none banks 2,
highest gated peak). Balanced panel (§15): INAPPLICABLE for a
pure diagnostic on a fresh band with no before/after comparison
— stated, not fabricated.

## Verdict — DIAG-NO (judged strictly against the prereg)

- Release days: ZERO on all 16 error-free seeds. No seed ever
  satisfies living >= 2 AND gated >= 200 AND ready on any
  snapshot day. Ready days: ZERO on all 16 (engine ready never
  true on any snapshot day of any seed).
- Stronger than the prereg's question assumed: two living
  killers NEVER COEXIST on any seed of this band either.
  living2Days is empty on all 16 seeds; maxLiving is 1 on every
  seed that banks a killer at all. The release question cannot
  even be observed here — the binding shortfall is killer
  SIMULTANEITY, upstream of standing: villages bank killers
  one at a time and each dies (or the village dies) before the
  next is blooded.
- Instrument errors 0 on all 16 seeds. Cross-check: derived
  living vs engine veterans agree on every snapshot day except
  ONE (99122 d101, see below); that mismatch does not affect
  the verdict (derived 1 vs engine 0 on a banking day — the
  direction is derived-higher, and maxLiving is 1 under either
  count).
- Proof: `scripts/test-standaccum2-20261105.js` — fixtures
  10/10 PASS on the final code; live determinism double-run
  identical (seed 99111 at 30d, in-process path: same days,
  endReason, maxWave, snapshots, sayCount, 0 errors). The
  file-mode live legs (14/14 on the pre-edit driver) were not
  re-run post-edit because the host write flap blocked their
  corpus writes (see Infrastructure); determinism is instead
  proven on the path that produced the verdict, plus two
  judged-run cross-checks (99117 in-process analysis matches
  its earlier stdout-mode summary exactly; 99122 re-run
  matches its confirm summary exactly).

## Per-seed table (all 16, error-free)

days = run days; end = village-lost except 99118 (survived to
the 150d horizon, censored); un = unlockedWave at finalize;
w4f = wave-4 fights; w4k = wave-4 kills; kev = killers ever;
maxL = max living killers on any snapshot day; L2d = days with
living >= 2; gPeak = gated peak; rPeak = raw peak; rdy = ready
days; rel = release days. (99114's peaks read null in the
analyzer when the peak is 0 — all its snapshots are 0/0.)

| seed | days | end | un | w4f | w4k | kev | maxL | L2d | gPeak | rPeak | rdy | rel |
|------|------|-----|----|-----|-----|-----|------|-----|-------|-------|-----|-----|
| 99111 | 78 | lost | 3 | 0 | 0 | 0 | 0 | 0 | 25 | 25 | 0 | — |
| 99112 | 85 | lost | 4 | 6 | 1 | 1 | 1 | 0 | 190 | 190 | 0 | — |
| 99113 | 109 | lost | 4 | 11 | 1 | 1 | 1 | 0 | 199 | 200 | 0 | — |
| 99114 | 26 | lost | 3 | 0 | 0 | 0 | 0 | 0 | 0* | 0* | 0 | — |
| 99115 | 57 | lost | 3 | 0 | 0 | 0 | 0 | 0 | 25 | 25 | 0 | — |
| 99116 | 116 | lost | 4 | 15 | 5 | 3 | 1 | 0 | 199 | 345 | 0 | — |
| 99117 | 97 | lost | 3 | 0 | 0 | 0 | 0 | 0 | 99 | 165 | 0 | — |
| 99118 | 150 | surv | 4 | 15 | 2 | 2 | 1 | 0 | 199 | 265 | 0 | — |
| 99119 | 83 | lost | 4 | 9 | 0 | 0 | 0 | 0 | 199 | 215 | 0 | — |
| 99120 | 97 | lost | 4 | 5 | 0 | 0 | 0 | 0 | 190 | 190 | 0 | — |
| 99121 | 87 | lost | 4 | 12 | 0 | 0 | 0 | 0 | 100 | 100 | 0 | — |
| 99122 | 148 | lost | 4 | 36 | 3 | 3 | 1 | 0 | 199 | 270 | 0 | — |
| 99123 | 124 | lost | 3 | 0 | 0 | 0 | 0 | 0 | 99 | 210 | 0 | — |
| 99124 | 94 | lost | 4 | 10 | 0 | 0 | 0 | 0 | 150 | 150 | 0 | — |
| 99125 | 84 | lost | 4 | 8 | 0 | 0 | 0 | 0 | 100 | 100 | 0 | — |
| 99126 | 73 | lost | 4 | 4 | 1 | 1 | 1 | 0 | 175 | 175 | 0 | — |

Totals: 131 wave-4 fights, 13 wave-4 kills, 11 killers ever
across 6 seeds. Kill-to-death intervals (7 deaths, sorted):
[5, 6, 8, 11, 15, 34, 40] days, median 11 days. Death causes:
the wild x7. Four killers have no fallen entry at end of run
(99116 visjoin_83, 99118 meera_reddy, 99122 adaeze_nwosu,
99126 nadia_khoury) — "alive at end" here means no death
recorded before the run ended or the village was lost, not a
confirmed living veteran.

## Closest seed — 99116 (per the fixed ranking)

99116, 99118, 99122 tie at gated peak 199 with zero L>=2 days;
lowest seed wins: 99116. Full trajectory:

- Gated peak 199 on d56 (raw 220 that day; living 1; armored 3
  of 4; armed 8 of 6; tricks 25 of 3; engine short
  [armor, veterans]). Raw peak 345. Ready days 0.
- Killers: gen_46r6bqy banked d52, died d60 (the wild, 8d);
  catalina_reyes banked d65, died d99 (the wild, 34d);
  visjoin_83 banked d108, no death recorded (village lost
  d116). The three windows never overlap: the first dies 5
  days before the second is blooded; the second dies 9 days
  before the third is blooded.
- Binding leg on raw >= 200 days (62 snapshot days):
  armor+veterans 47, armor+weapons+veterans 15. Tricks is
  never the blocker (25 vs demand 3). Standing climbs to 345
  raw while gated sits at 199 — the door stays shut on armor
  (3 of 4 worn at P >= 15) plus veterans, not on standing.
- Runners-up, same shape: 99118 (gated 199 d100, raw 265;
  killers d91→d131, d145→alive; gear collapses at the end:
  armored 4→3, armed 5→3 by d149–150; binding on raw >= 200
  days: veterans 43, weapons+veterans 6,
  armor+weapons+veterans 4) and 99122 (gated 199 d102, raw
  270; killers d101→d107, d127→d142, d144→alive; armored
  3→1, armed 5→1 by the end; binding: veterans 15,
  weapons+veterans 1, armor+weapons+veterans 30,
  armor+veterans 2).
- Sharpest non-killer case: 99123 never unlocks wave 4 yet
  reaches raw 210 while gated peaks at 99 — the wave-4
  deferral holds it at t4-1 because readiness-4 is unmet.
  Raw standing alone opens nothing.

## Wall numbers (this band, baseline observations)

Wins 0/16. National 0/16, table 0/16 (scaleRank "village" on
all 16; no seed leaves village scale). Wave-4 unlocks 11/16,
wave-4 faced 11/16 (same seeds), wave-4 kills 13 total,
wave-5 unlocks 0/16, faced 0/16, kills 0. Readiness-5-ready
days 0/16. Median run-days 90.5 (sorted: 26 / 57 / 73 / 78 /
83 / 84 / 85 / 87 / 94 / 97 / 97 / 109 / 116 / 124 / 148 /
150; 1 seed censored at the horizon). Village death-cause
shares: not instrumented by this arm — not reported, not
guessed (killer death causes above are the only death-cause
numbers this arm owns).

## Reachability verdict

Waves 1–4 are reached and faced; wave 5 is unlocked on no
seed, faced on no seed, killed on no seed. Regional →
national, the table, and the win flag are unreached on all
16 seeds. The wall has not moved on this band — and this arm
tightens the diagnosis: the release is not merely
uncoincided, it is unapproached, because the veterans leg
never even reaches 2 living on any seed.

## Village assessment (plain words)

Picture sixteen villages playing competently. Eleven of them
meet the fourth wave; six of them blood a fighter against it;
three of them blood a second or third fighter over the run —
and in every single case, the new fighter arrives after the
old one is already dead. The closest village climbs to 345
standing — far past the 200 the door asks for — and still
sits at 199 gated, because it is short one suit of armor and
short one living veteran, for sixty-two straight days. Its
fighters die 8 days, 34 days after their kills; the next
fighter is blooded days after the funeral. Nothing in this
band suggests the villages are one good day away from the
door. They are one living fighter away, and then another
living fighter at the same time, and then the armor to go
with them — and on this band, that simultaneity never
happens even once. The standing is not the wall. The wall is
keeping two blooded fighters alive at the same time.

What knowledge/capabilities were missing: killer
simultaneity first (two wave-4 killers alive together —
never observed here or on 99101–99108), then gear-leg
stability through the banking window (armor is the binding
gear leg on the closest seed; weapons collapse late on the
runners-up). No villager behavior was flagged as robotic by
this arm's corpus.

## Sense-test (this arm's own corpus, judged for meaning)

- The veteran-word collision REPRODUCES for the fourth time
  in this arm's own corpus, verbatim: the System celebrates
  wave-3 kills as "veteran kills" ("Olivia just put down
  Spool... on CAMERA. That's a veteran kill, folks. REMEMBER
  the name." — d56, 99116; same line for The Ugly Beast,
  The Ugly Thing, The Terms of Service across seeds), while
  the readiness bar wants villager veterans ("blood your
  fighters (0 of 2 veterans)"). A player told to blood two
  veterans while hearing "veteran kill" for a Spool is being
  given a riddle, not an instruction. This arm sharpens the
  cost: even the villages that correctly bank real wave-4
  killers never hold two at once, so the confused player
  cannot even stumble into the door.
- Village voice reads as people deliberating, not robots:
  "Half rations for three days, voted and held — or a hard
  hunt now, hungry, to fill the bins before it's choosing-
  who-eats." (d113, 99116; d145, 99122 — the same dilemma,
  voted on, in two villages). Mourning lines are specific,
  not templated grief ("The Eulogy killed Dieudonne in 1
  round. The village mourns." d126, 99122).
- 99116's standing story, as the village hears it: from d56
  it sits at 199 gated with raw climbing past 300, told it
  lacks armor and veterans. That story is coherent — a
  village that is famous but not yet a fighting force — and
  it stays coherent for 60 days, which is itself the
  finding: the story never changes because the fighters
  keep dying one at a time.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- PRIMARY metric held up and refused cleanly: zero release
  days, zero ready days, zero L>=2 days on 16 seeds. The
  verdict does not depend on any secondary definition.
- The prereg's question ("does a village WITH two living
  killers reach 200 gated + ready") turned out to have an
  unmet premise on this band: no village ever HAS two living
  killers. DIAG-NO stands as pre-registered (zero release
  seeds), but the next arm should pre-register the premise
  separately: count seeds with L>=2 at all, and only then
  ask about release among them — otherwise a future band
  that banks simultaneous killers but never releases them
  would look identical to this one in the headline count.
- Snapshot-day granularity note: the post-run snapshot lands
  past the horizon (d151–152); it adds snapshot days but no
  release days here (99118's d151–152 rows are still
  short). Same caveat as survgear's metric review; a future
  arm should state its horizon rule in the prereg.
- Analyzer edge quirk (no verdict effect): gatedPeak/rawPeak
  report null when the peak is exactly 0 (99114, 99111's
  30d determinism leg) because the reducer compares against
  a null initial. Report as 0 in tables, as this evidence
  does for 99114.
- Mismatch note (no verdict effect): 99122's single
  mismatch day (d101: derived living 1, engine veterans 0)
  is snapshot ordering on the banking day — the snapshot
  fires before that day's kill is recorded. The derived
  count is the right one for L(d) (the killer IS banked on
  d101); the engine count catches up the next day. A future
  arm should state the ordering rule in the prereg.
- Method note (not a re-score): the pilot's last two seeds
  and the confirm band were analyzed IN PROCESS (same
  vetprod instrument, same analyzeSeed) instead of from
  corpus files, because the host write flap blocked file
  writes from sim processes mid-run (see Infrastructure).
  The judged numbers are comparable: same recorder, same
  analyzer, determinism cross-checked (99117 exact match
  across two methods; 99122 re-run match). What changed is
  persistence (memory instead of disk), not measurement.

## Infrastructure (read before judging the run's cost)

- EPERM flap, third evening in a row (see AGENTS.md flare-2
  note): the pilot's seed-99117 corpus write failed and left
  a 0-byte stub, stopping the driver before 99118. A retry
  loop in the driver then spun ~50 attempts without success
  while fresh-process probe writes to the same directory
  succeeded; a diagnostic script isolated "pre-sim writes
  OK, post-sim writes EPERM" in one process, but later
  probes showed the same pattern tracking flap windows
  rather than process state — the honest record is that the
  flap, not a proven mechanism, best explains the full
  pattern, and its root cause is NOT established by this arm.
  Durable workaround that worked: analyze in process and
  print small summaries to tool capture (pipes), never
  writing corpus files from a sim process
  (`scripts/standaccum2-run-analyze-20261105.js`). The
  99117 full corpus JSON never landed as a file; its
  in-process summary (identical across two methods) plus the
  compact band summary JSON are the record.
- Safe-commit index clobber hit worker commits again and was
  repaired the same way each time (HEAD-blob cacheinfo,
  status + diff HEAD verified empty); commits always correct.
- One exec session was lost mid-run (confirm tail delivery);
  the missing three seeds were re-run deterministically
  (99124–99126 summaries, same method) rather than assumed.
- No push, no bump, no live verification (ship loop owns
  deploys). Coordinator evidence committed on a branch and
  ff-merged per repo push discipline — never directly on
  master. (Coordinator merges; this worker reports its branch
  tip below.)

## Next blanks, in order (proposals only — this arm builds nothing)

1. Killer simultaneity (the binding gap this arm isolated):
   why two blooded fighters never stand together — kill
   production is sequential (trigger build, the 2330Z next
   blank #1, is the named next work: a stopped moment on
   spawn tiles so encounters become fights) and killer
   survival after banking (median 11 days here, 3.5 days on
   99101–99108). A lever that keeps the FIRST killer alive
   until the second is blooded is the precondition for any
   release test.
2. Standing accumulation, part 3 (strict question, still
   open): among villages that DO hold two living killers,
   does any reach 200 gated + ready? Pre-register the
   premise (L>=2 count) separately from the release count,
   per the metric review above. Do NOT move readyDemand or
   flip VETSHAPE on this evidence.
3. Veteran-word collision (sense-test finding, naming pass,
   not mechanics): the game calls hardened monsters, wave-3
   kills, and blooded villagers all "veterans" on screen.
   Needs a design eye, not a sim.

## Proof and landing

- Proof: `scripts/test-standaccum2-20261105.js` — fixtures
  10/10 PASS on the final code (release-day rule, same-day
  kill-and-die, gated-199 boundary, mismatch counting,
  closest-seed ranking incl. tie-breaks, analyzer
  determinism, release-window-closes-on-death); live
  determinism double-run identical on the in-process path
  (seed 99111 at 30d); judged-run cross-checks exact
  (99117 across methods, 99122 re-run). File-mode live legs
  (14/14 on the pre-edit driver) were not re-run post-edit:
  the flap blocked their corpus writes; recorded honestly,
  not claimed.
- Commits (this worktree branch sim-standaccum2-b;
  coordinator merges via --ff-only; merged locally, pending
  ship — no push, no bump, no live verification by this
  worker): e6e4df47c prereg, 5da2e7fd2 instruments + proof
  14/14, plus the pilot + evidence commit below (driver
  stdout/write-retry hardening, in-process run-analyzer,
  EPERM diagnostic script, pilot corpus 6 files, band
  summary JSON, this evidence).
- Files: prereg + evidence in `evidence/2026-11-05/
  sim-standaccum2-b*.md`; per-seed JSON in
  `evidence/2026-11-05/perseed-standaccum2-b/` (6 files,
  pilot seeds 99111–99116; 99117–99126 exist as in-process
  summaries in the band summary JSON, not as corpus files,
  per the Infrastructure note); scripts
  `standaccum2-driver-20261105.js`,
  `standaccum2-analyze-20261105.js`,
  `standaccum2-run-analyze-20261105.js`,
  `test-standaccum2-20261105.js`,
  `diag-gameload-write-20261105.js` (EPERM isolation
  diagnostic; zero src/js anywhere in this arm).
- Worktree state at handoff: only committed work; no
  uncommitted leftovers beyond the pilot + evidence commit
  below (verified before reporting).
