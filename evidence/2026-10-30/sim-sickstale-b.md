# sim-sickstale-b — STALE SICK RECORDS NO LONGER TAKE TICK HITS (Loop B, 2026-10-30)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1730Z, arm sim-sickstale-b.
Parent: loop-B arm sim-sicktele-b (run fleshout-loop-b-20261030T1332Z),
evidence/2026-10-30/sim-sicktele-b.md, sim-findings #1542.
Related, NOT re-litigated: the contest-death recording fix (commit 06b502d53,
registerDeath + fallen in _cxKillContestant) — this arm touches only the
stale-sick tick that the parent trace exposed.

Base pin: 7074478fb. Branch: sim-sickstale-b (worktree
~/workspace/worktrees/sim-sickstale-b).
Prereg (committed BEFORE any judged sweep): evidence/2026-10-30/sim-sickstale-b-prereg.md
(commit 1dcdc5af9). Fix commit: 3590d8e25 (no [needs-eyes] — see sense test).

## Verdict: NO-GO on the letter of prereg clause (b) — GO on every substantive bar

Read this carefully, because the two halves point different ways and the
distinction matters for the landing decision:

- SUBSTANCE GO: the deterministic reproduction, the pilot band, and the
  9983 leg all pass with perfect neutrality — stale hits 5 -> 0 across
  the judged seeds, live-villager sickness hits bit-identical (564 -> 564
  pilot, 56 -> 56 on 9983), days and endings identical, narration
  bit-identical, and the balanced-panel compare shows zero delta on
  every paired metric.
- LETTER NO-GO: prereg clause (b) required the pre-fix trace on seed
  9983 to show the elif_demir day-32 post-mortem row (52 -> 49). That
  row does not exist at this base. Between the parent arm's base and
  this run's base, ~20 commits landed — including the contest-death
  fix itself — and 9983's trajectory moved: on this base elif stays
  on the roster all 38 days and never dies, so there is no elif stale
  row to eliminate. The clause's precondition (same seed reproduces
  the same event across bases) is false, through no fault of the fix.
  Per §14 this run does NOT re-score the clause into a pass: clause
  (b) is reported MISSED as written, and the metric-review section
  proposes the corrected bar for the next run. The landing decision
  is the coordinator's: the fix is fully proven on the same mechanism
  with different victims at this base (3 stale rows on 9983, 2 on
  pilot seed 10303, all eliminated), and the branch is ready either
  to land under that metric-review revision or to be re-barred.
- Clauses (a), (c), (d), (e) all pass as written. Clause (b)'s intent
  — a known stale event, present before and gone after, on a fixed
  seed — is satisfied by 9983's three real stale rows (below), but
  intent is not the bar, so the verdict stays NO-GO on the letter.

## Plain-words answer first

When a villager left the village — died, was exiled, fled, or
splintered off — the game kept their illness on the books. The next
morning the sickness round still walked that list and dealt them a
hit: damage written against a corpse's health entry (or a departed
villager's), and in the wound/starvation cases it even resurrected
a deleted health entry at 95 for someone already dead. The village's
story never lied about these — no narration fired for the phantom
hits — but any count built on damage rows (or on the afflictions
panel, which lists every illness on the books with no roster filter)
would read the dead as still sick, and a dead villager could briefly
show up as "sick, tend them" between leaving and the next tick.

The fix is two small hygiene changes, both in the "when someone
leaves, their village bookkeeping leaves with them" family that
removeVillager already keeps (positions, mentored status, heat,
alliances, doubts, cases, quests, promises):
1. `removeVillager` (src/js/betrayal.js) now deletes `v.sick[vid]`
   when anyone leaves, for every removal kind — killed, ambushed,
   exiled, fled, splinter. It sits after the phoenix early-return,
   so a villager saved by a phoenix link (who never actually left)
   keeps their illness.
2. `villageSicknessTick` (src/js/game.js) now skips — and deletes —
   any illness record for someone not on the roster or already
   marked dead, BEFORE dealing damage. This half covers old saves
   written before the fix, where no removal will ever fire again.
   A villager alive when the tick starts who dies FROM the tick
   still gets the full grief line exactly as today (that branch
   reads a flag captured before the damage, untouched by this change).

Exiled and fled villagers lose their illness record too, and that
is safe, not a behavior change for the living: under the old code
their record also died within a day (the tick's own cleanup deleted
it after dealing exactly one post-departure hit), and nothing living
depends on it — no return path reuses the id (membership blocks
exiles outright; arrivals mint new ids), and the readers in the
removal-to-tick window (afflictions panel, sick-help favors, the
invite sick penalty) were reading a ghost's sickness, which is the
bug, not a feature. Disease definitions, pools, vectors, and cures
are untouched (DISEASES.md canon honored — this is record hygiene,
not disease design).

## The mechanism, with the firing records

Pre-fix, the tick hurt first and cleaned up after
(game.js villageSicknessTick: `hurtVillager` call, then the
`_wasDead` check that deletes the record silently). Three shapes,
all reproduced deterministically (scripts/test-sickstale-b.js
--repro-only, seed 4242, before fix):
- Killed: removeVillager leaves the record (sickAfterRemoval true),
  next tick deals 1 stale hit, then deletes it.
- Exiled: identical — record survives removal, 1 stale hit, deleted.
- Old-save ghost: a sick record for a never-rostered id takes 1
  stale hit, then is deleted.
- Live control: a roster villager takes the normal hit (80 -> 77,
  severity 1, no healer: 1 + 2 = 3 damage). Post-fix the control is
  bit-identical (80 -> 77) and all three stale shapes are 0 hits
  with no record remaining.

Pre-fix stale rows in the sims (all caller villageSicknessTick,
all off-roster + vpOf.dead true BEFORE the hurt — so none of these
is a tick hit that itself killed):
- Seed 9983 (38 days, village-lost): 3 rows — gen_mr1pr0r day 27
  (wound death; health entry deleted by the death path, tick wrote
  it back at 95), henry_zhang day 28 (same shape, 95), gen_925shtf
  day 36 (starvation death; health deleted, tick wrote 95).
- Pilot seed 10303 (169 days, village-lost): 2 rows — gen_uvn5bng
  day 81 (5 damage, health null -> 95), hassan_ali day 124
  (98 -> 95, 3 damage).
- The other 7 pilot seeds: 0 stale rows pre-fix (stale hits need a
  villager to die while sick, which is uncommon in a single band).

## Leg 1 — REPRODUCTION (deterministic, seed 4242)

Before fix: killed 1 stale hit, exiled 1, old-save ghost 1, live
control 80 -> 77. After fix: 0 / 0 / 0, live control still 80 -> 77.
Record cleared on removal in both the killed and exiled cases
(sickAfterRemoval false post-fix, true pre-fix). Same villager ids
both runs (gen_b36nqjb / gen_i8p7j0q / gen_b9xwhnu) — the repro is
deterministic, not a fresh draw each time.

## Leg 2 — KNOWN-EVENT (seed 9983, competent, 180d death-aware)

Before: 38 days, village-lost, 3 stale hits, 56 live sickness hits.
After: 38 days, village-lost, 0 stale hits, 56 live sickness hits.
Days, ending, death sequence, and say lines all bit-identical.
The elif_demir day-32 row from the parent arm does NOT reproduce
at this base (see verdict + metric review): elif is on the roster
for all 38 daily snapshots and takes 11 hurts but never dies here.
The three stale rows that do occur are the same mechanism with
different victims, and all three are eliminated.

## Leg 3 — PILOT (seeds 10301-10308, competent, 180d death-aware)

| seed | days | end | stale before -> after | live sick hits before -> after |
|------|------|-----|------------------------|----------------------------------|
| 10301 | 180 | survived | 0 -> 0 | 116 -> 116 |
| 10302 | 141 | village-lost | 0 -> 0 | 42 -> 42 |
| 10303 | 169 | village-lost | 2 -> 0 | 94 -> 94 |
| 10304 | 180 | survived | 0 -> 0 | 84 -> 84 |
| 10305 | 180 | survived | 0 -> 0 | 43 -> 43 |
| 10306 | 180 | survived | 0 -> 0 | 71 -> 71 |
| 10307 | 138 | village-lost | 0 -> 0 | 73 -> 73 |
| 10308 | 95 | village-lost | 0 -> 0 | 41 -> 41 |
| POOLED | | | 2 -> 0 | 564 -> 564 |

4 of 8 survived to the 180d cap; 4 were village-lost (141, 169,
138, 95 days). No confirm was spent: the effect is deterministic
(legs 1-2) and the pilot is a neutrality + no-regression band, as
pre-registered. The pilot proves the fix changes nothing for the
living — every seed's days, ending, death sequence, say lines, and
live sickness-hit count are identical before and after.

## Leg 4 — BALANCED PANEL (§15; instrument, not judge)

Built before (fix commit's parent tree) and after (fix commit) on
the pilot seeds, policy competent, days 180:
- Before: evidence/2026-10-30/panel-sickstale-b-before/panel.json.gz
  (8 cases, 0 cached; cases/ cache deleted before commit, per §15).
- After: evidence/2026-10-30/panel-sickstale-b-after/panel.json.gz
  (same shape; cases/ cache deleted before commit).
- Compare: evidence/2026-10-30/panel-sickstale-b-compare.md/.json,
  decision review_required (compare exit 2).
- Investigation of the review flag (required by the prereg):
  EVERY paired metric delta is exactly 0 — table win 0 -> 0,
  national 0 -> 0, village deaths 37 -> 37, community loss
  0.5 -> 0.5, all survival/HP/food/gear/ability metrics identical
  across all 8 pairs. The review_required decision is driven
  solely by the luck-instrument metrics reporting insufficient /
  not_observed (trap 5/8 pairs, snare 7/8, pit 1/8, hunt and
  fishing 0/8 — small-sample instrumentation, identical values
  before and after). Nothing traces to the fix changing a live
  outcome, so clause (e) holds with the flag explained, not waived.

## Reachability verdict (band limits stated honestly)

This is a sickness-hygiene pilot, not a scale band, and it claims
no scale reach: across the panel's 8 competent cases, table win
rate 0, table entry 0, national access 0, community loss 0.5 —
the villages either survive to the cap or scatter, and none
reaches national or the table in 180 days. Waves, Arc II/III/IV,
regional -> national, and the win flag are NOT evaluated here;
the band's job was stale-hit elimination with live neutrality,
and that job is done. Do not cite this run for scale reach.

## Village assessment (what the villages looked like)

The pilot villages are ordinary struggling villages, not
showcases: half scatter (95–169 days), half hold to the cap.
Sickness is a constant background pressure — 41 to 116 live
sickness hits per village over the run — and it is overwhelmingly
a living-villager story: the stale rows are rare (5 across 9
seed-runs) precisely because they need the unlucky coincidence of
dying while sick. When that coincidence happens, the old code's
bookkeeping wrote one more line of damage against someone already
gone and, in the wound/starvation cases, quietly put a health
number back on a corpse whose death path had deleted it. The fix
removes exactly those lines and nothing else: the same villages,
the same deaths, the same words, minus the phantom hits.

## Sense test (SENSE-TESTING LAW — read the transcripts)

Say lines and death sequences are bit-identical before vs after
on all 9 seeds (9983 + pilot). The fix removes only silent damage
rows and a ghost afflictions-panel row in the removal-to-tick
window; no grief line, no "on the mend" line, no death tele, no
gossip line changes anywhere. That is why the fix commit carries
no [needs-eyes]: there is nothing new for Steve's eyes to judge
in feel — the game reads exactly as before, with cleaner books.
A player watching any of these villages would notice no difference
at all, which is the point of a hygiene fix.

## Blanks filled / documented (builder, not critic)

FILLED (fix, commit 3590d8e25): the stale-sick tick itself —
removeVillager clears the record, the tick skips dead/off-roster
records before hurting. Proof: scripts/test-sickstale-b.js (17/17
GREEN: live repro assertions + pilot summary assertions + 9983
before/after assertions).
FILLED (instrument): scripts/trace-sickstale-b.js (pre-hurt roster +
dead state per hurt row — the distinction the sicktele wrapper
lacked) + scripts/analyze-sickstale-b.js (per-seed stale/live
aggregation).
DOCUMENTED, NOT CHASED: the wound/starvation death paths delete
v.health[vid] while other readers default a missing entry to 100 —
the stale tick was one writer that resurrected such entries, but
any future writer that defaults missing health to 100 for a dead
villager would do the same. Worth a look only if another phantom
health write appears; not a lever for this arm.
DOCUMENTED (metric-review proposal, next run): see below.

## Convergence state

converging (fix proven, landing decision pending). Sim-findings
#1542 can move from open to fixed-on-branch on this evidence —
the mechanism is eliminated on every seed that exhibits it — with
the landing note that the prereg's clause (b) missed as written
(base move, not fix failure). If the coordinator lands the branch,
#1542 closes; if it holds for a re-barred follow-up, the follow-up
needs only the corrected known-event bar, not new proof.

## Proof

scripts/test-sickstale-b.js: 17/17 GREEN — repro cases (a)-(d)
post-fix expectations; pilot 8 seeds before/after present, 0 stale
after, 0 stale every seed, live+days identical per seed; 9983
before 3 named stale rows (all off-roster + vpDead pre-hurt),
after 0 stale, live + days + endReason identical.
node scripts/check.js --quick: 284 passed, 6 failed in 615s (first
run) and 284 passed, 6 failed in 451s (re-run with full output).
The 6, all reproduced on the PRE-FIX base versions of game.js /
betrayal.js (temporarily checked out from HEAD~1, fix restored
afterwards, proof re-greened 17/17) — i.e. pre-existing at this
base, none caused by this arm, none touching sickness or removal:
(1) test-measurement-proof-update.js — "Proof source inputs are
not current" (hash freshness); (2) test-measurement-workflow.js —
"retained neutrality proof covers the current Game/controller/
harness inputs" (same freshness class); (3)
test-mobile-combat-cadence.js — Continue/announcement cadence;
(4) test-occupation-panels.js — real CLI workflow; (5)
test-phone-frame-proof.js — retained browser inputs vs current
source (the whole src tree is an input; any recent landing
stales it — it was already stale before this fix, and refreshing
it needs real browser receipts per MOBILE-PLAYTEST.md, which this
node-only arm cannot produce — a landing note, not a block on
the fix's behavior); (6) test-establishment-r20-fixes — racks-full
voice next-day gate (cooking/racks code). No failure touches
sickness, the tick, or removal. Separately, the check runs
regenerated one line of docs/ONTOLOGY.md (villager-build Provides
gaining vesselArmorFetch, from the landed armorfetch work); that
side effect was reverted, not committed — it is not this arm's
work.

## Files

- Prereg: evidence/2026-10-30/sim-sickstale-b-prereg.md
- Fix: src/js/betrayal.js (removeVillager sick clear), src/js/game.js
  (tick pre-hurt skip) — commit 3590d8e25
- Trace instrument: scripts/trace-sickstale-b.js
- Analyzer: scripts/analyze-sickstale-b.js
- Proof: scripts/test-sickstale-b.js
- Repro records: evidence/2026-10-30/sim-sickstale-b-repro-before.json,
  sim-sickstale-b-repro-after.json
- Traces: evidence/2026-10-30/sim-sickstale-b-trace-{9983,10301..10308}-{before,after}.json (18 files)
- Pilot summaries: evidence/2026-10-30/sim-sickstale-b-pilot-{before,after}-summary.json
- Panels: evidence/2026-10-30/panel-sickstale-b-{before,after}/panel.json.gz
  (cases/ caches deleted, per §15)
- Panel compare: evidence/2026-10-30/panel-sickstale-b-compare.md/.json
- Evidence: evidence/2026-10-30/sim-sickstale-b.md (this file)

## Metric review (§14 — required section)

- Pre-registered metrics bind this run; no re-scoring occurred.
  Clause (b) is reported as MISSED as written, not reinterpreted:
  the elif_demir day-32 row does not exist at this base, and the
  run does not claim the clause passed via the three other stale
  rows. The verdict's substance-GO half rests on clauses (a), (c),
  (d), (e) plus the 9983 stale-elimination evidence, stated
  separately from the clause, so a reader can disagree with the
  landing recommendation without doubting any number.
- Metric issue 1 (known-event legs must be re-validated on the
  run's actual base): a seed's trajectory is not stable across
  bases in a fast-moving tree — the parent arm's base (0794a8846)
  and this run's base (7074478fb) differ by ~20 commits including
  the contest-death fix, which changes grief/gossip/trust flows
  enough to move 9983 from "elif dies day 32 in a contest" to
  "elif survives all 38 days". Proposed revision for the NEXT run:
  before committing a known-event bar, run the pre-fix trace on
  the run's actual base and confirm the event is present; if it
  is absent, the bar is void and must be re-written (different
  seed or different event) BEFORE any judged sweep, not after.
  Do not apply retroactively to this run's verdict.
- Metric issue 2 (stale-hit definition needs pre-hurt state):
  the sicktele wrapper's post-hit-only state cannot separate a
  stale hit from a tick hit that itself kills. This arm's
  pre-hurt roster + vpDead capture is the correct definition and
  should be the standard for any future sickness/death recorder.
  No numbers in this run use the old definition.
- Metric issue 3 (panel review_required is not a regression):
  with 8 cases the luck instrument reports insufficient /
  not_observed and forces review_required even when every paired
  delta is exactly 0. Future readers should read the delta column,
  not just the decision word, on small panels.
- No metric revision is applied to this run's numbers. All
  revisions above are proposals for the NEXT run.
