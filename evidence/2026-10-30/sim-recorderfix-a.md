# sim-recorderfix-a — recorder loss-day snapshot gap (INSTRUMENT FIX, NO-GO on prereg as written)

Run: fleshout-20261030T1747Z, arm sim-recorderfix-a, axis scale-onramp.
Backlog item: the RECORDER LOSS-DAY SNAPSHOT GAP from arm
sim-tributecost-a (evidence/2026-10-30/sim-tributecost-a.md, run
fleshout-20261030T1427Z, DIAG-NO-GO on bar 2 in round 1639).
Prereg: evidence/2026-10-30/sim-recorderfix-a-prereg.md (binding,
written before any re-run).

DIAG/INSTRUMENT ONLY. Zero src/js changes, zero policy changes, zero
default flips. One recorder script changed, one proof test added.
No [needs-eyes]: no feel, combat, or UI change.

## Verdict: NO-GO (on the prereg as written — see the split below)

The fix itself works and is proven non-perturbative on the current
substrate (control experiment below). The NO-GO comes from two
prereg clauses that the current substrate / harness bookkeeping
does not satisfy, neither of which is a defect in the fix:

| Leg | Bar | Result |
|---|---|---|
| (a) Proof test green | scripts/test-recorderfix-a.js proves the end-of-run snapshot on village-lost runs; test-tributecost-a stays green | PASS — recorderfix 13/13, tributecost 18/18 |
| (b) Byte-identical reproduction except the added snapshot | Three loss-day seeds (9911/9913/9918, leanlink, same substrate) reproduce every previously recorded number except endSnapshot | FAIL — 0/3. Every seed differs on 38–53 keys (see below). Cause is substrate drift since the tributecost corpus, NOT the fix (control experiment). |
| (c) Bar 2 under the new wording, all 8 pilot seeds | Series length days or (village-lost and days-1), tele == log, aggregate == log, endSnapshot present with scholarDay == days | FAIL AS WRITTEN — series/tele/aggregate pass 8/8, endSnapshot present 8/8, but scholarDay == days holds only 4/8. The scholarDay clause conflates two day counters (see below). |

A miss is NO-GO under MEASUREMENT §14, and it is not re-scored
here: the strict (b) and (c) readings fail, so no GO is claimed
even though the snapshot mechanism itself is proven on all 8
pilot seeds. The fix is HELD for coordinator adjudication, not
because it is broken, but because the prereg's two clauses need
the rewording named under "Metric review" before any GO can be
honest. The branch is left fully committed for the coordinator
to merge or hold; no merge is done by this worker.

## The fix (scripts/sweep-tributecost-a.js only)

One new top-level row field, `endSnapshot: { scholarDay,
pantryKcal, pop }`, computed by a new pure-read helper
`endRunSnapshot(Game)` (existing pantryKcal + rosterIds helpers)
immediately after runDays returns, alongside the existing
end-of-run link snapshot, and exported for the proof test.
Existing series (pantryDaily, popDaily, linkDays, pantryEOD,
endLinks) are NOT extended, renamed, or reordered. Diff vs HEAD:
21 insertions, 2 deletions, one file. No other instrument touched
(analyze-tributecost-a.js, test-tributecost-zero.js, panel driver
all untouched); no game code, no policy file touched.

## Leg (a) — proof test green (PASS)

- scripts/test-recorderfix-a.js, 13/13: F1 fixture checks of
  endRunSnapshot (day 129, pantry 2000, pop 3, missing-state
  tolerance); F2 live full-horizon leanlink seed 9913 (180d)
  ends village-lost at day 76 with endSnapshot present,
  scholarDay == days, pantry finite non-negative, pop a
  non-negative integer, endSnapshot day >= last series day,
  tele == harness death count (26 == 26).
- Regression: scripts/test-tributecost-a.js re-run green, 18/18
  (unchanged file, unaffected by the additive field).

## Leg (b) — byte-identical reproduction (FAIL, substrate drift)

Field-by-field deep comparison of the 8 new per-seed files
against the committed tributecost corpus files, ignoring only
the new top-level `endSnapshot` key (new files carry 34 top-level
keys vs 33 old, exactly the one added field):

| Seed | Old days/end | New days/end | Differing keys (excl. endSnapshot) |
|---|---|---|---|
| 9911 | 166 / village-lost | 180 / village-lost | 53 |
| 9912 | 139 / village-lost | 162 / village-lost | 43 |
| 9913 | 129 / village-lost | 76 / village-lost | 50 |
| 9914 | 180 / survived | 180 / survived | 39 |
| 9915 | 180 / survived | 147 / village-lost | 42 |
| 9916 | 180 / survived | 180 / survived | 48 |
| 9917 | 180 / survived | 180 / survived | 38 |
| 9918 | 159 / village-lost | 119 / village-lost | 42 |

Even the two seeds with identical days/end (9914, 9916, 9917
survived at 180d) differ on death logs, pantry/pop series, and
link state — the game and leanlink policy have moved since the
tributecost corpus (e.g. the leanlink cap-3 no-tend landing and
later game changes on this branch). The task's "same substrate"
premise does not hold on current master, so (b) cannot pass by
re-running against the old corpus, whatever the recorder does.

### Control experiment — the fix itself does NOT perturb (this run)

To separate fix-perturbation from substrate drift, seed 9913 was
re-run on the CURRENT substrate with the PRE-FIX recorder
(committed HEAD version, restored temporarily, fix preserved in
/tmp and restored byte-identical afterwards — verified with
diff): control row vs fixed pilot row, ignoring endSnapshot,
are DEEP-EQUAL (days 76, village-lost, deaths 26, identical
series), and the control row carries no endSnapshot. The fix is
therefore non-perturbative on current substrate; (b)'s failure
is entirely the old-corpus-vs-current-substrate gap. This control
does not retroactively satisfy (b) as written — it explains it.

## Leg (c) — bar 2 under the new wording (FAIL AS WRITTEN, mechanism PASS)

New pilot band (leanlink 9911–9918, 180d, death-aware):

| Seed | Days | End | Pantry/pop/link len | Gap | endSnap day | endSnap pantry/pop | Last series pantry/pop |
|---|---|---|---|---|---|---|---|
| 9911 | 180 | village-lost | 179 | 1 | 180 | 5662 / 0 | 9451 / 4 |
| 9912 | 162 | village-lost | 161 | 1 | 162 | 2083 / 0 | 3346 / 1 |
| 9913 | 76 | village-lost | 76 | 0 | 76 | 0 / 5 | 0 / 4 |
| 9914 | 180 | survived | 180 | 0 | 181 | 10321 / 9 | 9682 / 9 |
| 9915 | 147 | village-lost | 146 | 1 | 147 | 4187 / 0 | 8187 / 4 |
| 9916 | 180 | survived | 180 | 0 | 181 | 15031 / 8 | 18307 / 8 |
| 9917 | 180 | survived | 180 | 0 | 181 | 68229 / 8 | 67221 / 8 |
| 9918 | 119 | village-lost | 118 | 1 | 118 | 0 / 4 | 250 / 3 |

What passes 8/8: series length days or (village-lost and
days-1); teleDeathCount == deathLogCount on every seed;
aggregate deaths sum == deathLogCount on every seed; all pantry
values finite and non-negative; endSnapshot present on every
seed. The loss-day pattern itself reproduces on the current
substrate: 4 gap seeds (9911, 9912, 9915, 9918), and on all 4 the
endSnapshot captures final state BEYOND the last series entry
(pantry falls to 5662/2083/4187/0, pop falls to 0/0/0 or rises
3→4 on 9918 as the loss day resolves).

What fails as written: `endSnapshot.scholarDay == result.days`
holds only 4/8 (9911, 9912, 9913, 9915). The other 4 are harness
day-counter bookkeeping, not recorder failure: on survived runs
the engine's scholar day has advanced to 181 after the 180-day
horizon closes, and on 9918 the scholar day (118) lags the loop
count (119) because the loss precedes that day's increment.
`result.days` (runDays loop count) and `Game.state.scholar.day`
(engine day counter) are two different counters that agree only
sometimes; the prereg wrongly equated them. The snapshot is the
honest post-run read in all 8 cases — relabeling it with
result.days would fabricate a day. This clause belongs in metric
review, not in a re-scored verdict.

## Wall numbers (new pilot band, leanlink, for the record — NOT a balance claim)

- National 5/8, table 4/8, wins 0/8, village-lost 5/8, global 5/8.
- Median survival 180d (sorted days 76/119/147/162/180/180/180/180),
  max 180d. Wave reach: wave1 8, wave2 8, wave3 8, wave4 6, wave5 0.
- Deaths 285 total; monster-combat share 209/285 = 73.3%
  (monster:combat 124, monster:villager combat 60, villager:monster
  11, monster:expedition 14). Haven-paid tribute 0 kcal on all 8
  (consistent with the tributecost finding; arrivals 42 events
  this band, down from 74 in the old corpus — substrate drift,
  not a claim).
- These numbers describe the CURRENT substrate's leanlink band,
  not the tributecost band, and must not be compared to the old
  corpus as a before/after.

## Sense (brief — instrument arm)

EndSnapshot final states read coherently against the recorded
declines: gap seeds end with pantry spent down (9918: 250 → 0)
and roster emptied (9911/9912/9915: pop 4/1/4 → 0) — a village
that dies with its pantry still holding grain on 9911/9912/9915
(5662/2083/4187 kcal) is a population collapse, not a starvation
to zero, matching the tributecost 9912 story shape. One
observation, not a finding: seed 9918 ends village-lost with pop
4 in the endSnapshot — village-lost here is not roster-empty, so
whatever ends such runs (scholar-line loss, not headcount) is
worth one line in a future arm's sense read, not a recorder
question. No transcripts were read: no re-run surfaced a sense
issue beyond that note.

## Metric review (for the NEXT run, not this verdict)

- (b) re-baseline: on a moved substrate, "byte-identical vs the
  old corpus" is unpassable and uninformative. The next run's (b)
  should be: on the CURRENT substrate, a pre-fix vs fixed
  recorder pair on the same seeds is deep-equal except
  endSnapshot — exactly the control experiment run here (seed
  9913; extend to all loss-day seeds for a full pass). That
  control, not the stale corpus, is the non-perturbation proof.
- (c) scholarDay clause: replace `endSnapshot.scholarDay ==
  result.days` with `endSnapshot present, finite/non-negative,
  and scholarDay >= last series scholarDay` (not stale, not
  fabricated). All 8 pilot seeds satisfy that corrected clause;
  the gap seeds additionally satisfy "endSnapshot state differs
  from or extends the last series entry" (pantry/pop movement
  after the last post-daily).
- The endSnapshot on survived runs is post-loop state labeled by
  the engine's next day (181 after a 180d horizon). Evidence and
  analyzers must describe it as "end-of-run state", never as a
  day-181 daily snapshot, and must not count it as a series entry.
- The analyzer (analyze-tributecost-a.js) was deliberately NOT
  updated: its completeness() reports series lengths, which the
  reworded bar interprets. A future arm may add an endSnapshot
  check there, but that is a separate instrument change with its
  own prereg, not a silent part of this fix.

## Ranked next

1. Coordinator adjudication: accept the control experiment as the
   (b) substitute and the corrected scholarDay clause for (c),
   then merge — or re-prereg the two clauses and re-judge this
   same branch (no new sims needed: the pilot corpus + control
   already supply both corrected checks on all 8 seeds).
2. If adjudication requires a fresh full control pair: pre-fix vs
   fixed recorder on all 8 pilot seeds on current substrate
   (seed 9913 already done; 7 seeds remain, ~7 min of sim time).
3. No game change is proposed by this arm. No confirm band: the
   pilot already covers the loss-day pattern on 4 current-
   substrate gap seeds plus the full 8-seed band.

## Outputs

- scripts/sweep-tributecost-a.js (endSnapshot only, +21/−2 vs HEAD)
- scripts/test-recorderfix-a.js (13/13 green)
- evidence/2026-10-30/sim-recorderfix-a-prereg.md
- evidence/2026-10-30/sim-recorderfix-a-corpus-leanlink/ (8 new
  per-seed files) + sim-recorderfix-a-leanlink.json (aggregate)
  + sim-recorderfix-a-leanlink.log (sweep stdout)
- evidence/2026-10-30/sim-recorderfix-a.md (this file)
- Control row (pre-fix recorder, seed 9913, current substrate)
  held at /tmp/recorderfix-control/seed-9913.json — ephemeral;
  its verdict (deep-equal ignoring endSnapshot) is recorded
  above, and it can be regenerated with the HEAD recorder in
  one seed-run if the coordinator wants the artifact.
