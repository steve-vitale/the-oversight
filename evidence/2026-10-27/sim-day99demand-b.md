# sim-day99demand-b — screen for a day-99 raid demand seed

Run: oversight-flesh-out-loop-b, axis food-economy. Arm: sim-day99demand-b.
DIAG/measurement only: ZERO src/js changes, no default flips, no game-code
lever. This arm does NOT re-judge the raiddor GO, the raidday100
DIAG-NO-GO, or the day100raid-code REACHABLE verdict — their verdicts
stand in their own evidence. Its verdict is ONLY whether a fresh screen
supplies a seed with a day-99 raid demand whose day-100 take exercises
the raiddor post-snapshot raid adjustment. Judged ONLY against
evidence/2026-10-27/sim-day99demand-b-prereg.md (committed as ec59cc195
BEFORE any screen sweep — the pilot and every extension ran after that
commit, in that order).

## Verdict against the pre-registered GO: GO

GO required at least one HIT seed in the screened band (20100-20163,
cap 64), judged by scripts/test-day99demand-b.js on the full screen
corpus, with the day-100 take itself present (a demand-99 seed without
a day-100 take would be PARTIAL, not GO).

- HIT FOUND in the third chunk (20116-20123): seed 20118.
  Surviving seed (daysAlive 100, lastSnapDay 100), demand dated 99,
  take dated 100. Proof on the full 24-seed screen corpus: exit 0,
  "PROOF PASS: day-99 demand + day-100 take seed found", hygiene
  clean (log: evidence/2026-10-27/sim-day99demand-b-proof.log).
- Per the prereg stopping rule, screening STOPPED after the chunk
  containing the hit: 24 seeds screened (20100-20123), 40 of the
  64-seed cap unspent and never touched. No PARTIAL seeds (0
  demand-99 seeds without a day-100 take).
- What this GO does and does not claim: it supplies the missing
  seed. It does NOT claim the post-snapshot adjustment is now
  exercised — that claim belongs to the NEXT arm's judged analyzer
  run on seed 20118 (which must close the touched focal rows WITH
  the adjustment and be off by exactly the raid amount WITHOUT it,
  per the raidday100 GO clauses (b)-(f)). The raidday100 DIAG-NO-GO
  stands for its own band; this run's GO is the seed supply its
  evidence pointed at, nothing more.

## Prereg header (MEASUREMENT.md §§11, 14)

- Primary metric: count of seeds with a day-99 demand, with the
  day-100 take required for GO (demand-only = PARTIAL).
- GO threshold: verbatim from the prereg (see "Verdict" above).
- Horizon + why: 100 days, death-aware — the horizon the boundary
  question lives on. Two screened seeds died early (20100 day 29,
  20104 day 94) and end honestly; neither could be a HIT.
- Seeds: 20100-20123 screened in chunks of 8 (pilot 20100-20107,
  then 20108-20115, then 20116-20123 with the hit; stop). Cap 64
  honored by stopping, not by reaching it. Collision check before
  screening: no corpus filenames or word-boundary seed mentions
  for 20100-20163 in dated evidence; distinct from all spent bands
  (10100-10139, 9820-9827, 9870-9881, 9768-9779, 9850-9861).
- Policies: competent-nofeast (COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off).
- Base: NO pin. Worktree HEAD at prereg time
  4728c2cdd2ca044ab16134d51362a608bf0b693, unchanged through the
  run except this arm's own prereg commit ec59cc195 (git log
  verified at evidence time: ec59cc195 on top of 4728c2cdd, no
  sibling commit between). Zero src/js files modified.

## The HIT seed — 20118 (the supply, in full)

- Survived 100 days, endReason survived, rank village, wave reach
  [1, 2] (wave 3 not reached), national/table/win all false.
  2 deaths: ambush day 7 (chloe_dubois), "the night" day 81.
- Demand, day 99 (raidSayLines + Codex, same day):
  "🌙 Night. Shouts from the treeline — Andre of Thornfield with 4
  others, and they're not here to talk. \"Your pantry or your blood.
  Choose.\" (They want ~2,000 kcal.)"
  "📓 Codex: Andre of Thornfield raids Haven's treeline — demands
  ~2,000 kcal."
- Take, day 100 (raidRecord + take line, same day):
  "🌙 You weren't at the treeline. Andre of Thornfield didn't wait
  — they hit the stores and melted back into the dark with 1,000
  kcal. The village will talk about this for a long time."
  Ledger: asked 800, Canned soup 4u x 250 = 1,000, retMismatch
  false, stack trace via villageAgencyDaily (villageAgency.js:203)
  through hierarchyDaily (villageAgency.js:1356) — the take branch,
  exactly as day100raid-code proved.
- Position vs the closing snapshot: last spoilDays snapshot is day
  100 (freshKcal 110,054), taken during the day-100 policy.daily
  before that day's sleep/endDay; the take is dated 100 ==
  lastSnapDay, so for the analyzer raid100 = 1,000 (total; dried
  portion 0 — the take is all Canned soup, foodState null). This is
  precisely the adjustment's case: snapshot taken, then take, then
  the boundary closing must subtract it or overstate the residual
  by exactly 1,000.
- Corpus file:
  evidence/2026-10-27/sim-day99demand-b-screen-corpus/day99demand-b-competent-nofeast-s20118.json
  (the next arm's judged sweep re-runs this seed post-prereg with
  the same instrument; it does not need to trust this file alone —
  the TRACE_FULL replication below already reproduces it).

## Instrument + recorder fidelity (the 1130Z warning, answered)

- Instrument: scripts/sweep-day99demand-b.js + scripts/stockdoors-
  capture-day99demand.js, vendored from the raidday100 sweep/capture
  under new names (sweep logic unchanged, sibling files untouched).
  The sweep's death wrapper SUPPRESSES the original
  Game.registerDeath — disclosed in the prereg, not hidden.
- Screened trajectories are therefore SWEEP-INSTRUMENT trajectories,
  NOT plain-game trajectories, and are never cited as such.
- Verification leg 1 — PLAIN recorder (reported, NOT GO-gating):
  scripts/trace-day100raid-code-b.js without TRACE_FULL on seed
  20118 gives demandDays [], takeDays [], day-100 VAD call with
  pendingBefore null / pendingAfter null / takeFired false
  (log: evidence/2026-10-27/sim-day99demand-b-plain-trace-20118.json).
  The plain trajectory diverges completely — stronger divergence
  than day100raid-code's 10133 plain run (which at least staged
  some raids). Expected: the suppression shifts the RNG stream from
  the first death onward, and 20118's first death is day 7. The
  plain run does NOT override the GO: the deliverable is a
  sweep-corpus seed for the sweep-based analyzer, and a plain-game
  seed might not reproduce under that analyzer's instrument.
- Verification leg 2 — FAITHFUL replication (the reproducibility
  proof): TRACE_FULL=1 on seed 20118 gives demandDays [99],
  takeDays [100], day-100 VAD call pendingBefore 99 /
  pendingAfter null / takeFired true, takeFiredCalls [{day 100,
  pendingBefore 99}]
  (log: evidence/2026-10-27/sim-day99demand-b-tracefull-20118.json).
  The hit reproduces exactly under faithful sweep replication, so
  the next arm's judged sweep (same instrument, same policy, same
  horizon) will see the same day-100 take. That is the neutrality
  that matters for this deliverable: same instrument in, same
  demand/take out.

## Screen census (all 24 seeds — the run's result)

Per seed: daysAlive / end / lastSnapDay / wave / deaths / demands /
takes. All takes are raid-unanswered, caller villageAgencyDaily,
asked 800 unless the take differs; the standard take is Canned soup
4u x 250 = 1,000.

- 20100: 29 / village-lost / 29 / wave 2 / 4 deaths / dem [28] /
  tak [29]
- 20101: 100 / survived / 100 / wave 3 / 6 / dem [14, 16, 30, 53, 90]
  / tak [15, 17, 31, 54, 91]
- 20102: 100 / survived / 100 / wave 2 / 9 / dem [25, 34, 40, 89] /
  tak [26, 35, 41, 90]
- 20103: 100 / survived / 100 / wave 3 / 5 / dem [59, 95] /
  tak [60, 96]
- 20104: 94 / village-lost / 94 / wave 3 / 13 / dem [19, 27, 48] /
  tak [20, 28, 49]
- 20105: 100 / survived / 100 / wave 3 / 1 / dem [38, 72] /
  tak [39, 73]
- 20106: 100 / survived / 100 / wave 3 / 3 / dem [74, 98] /
  tak [75, 99] — nearest miss in the pilot (demand 98, take 99)
- 20107: 100 / survived / 100 / wave 3 / 4 / dem [44, 71] /
  tak [45, 72]
- 20108: 100 / survived / 100 / wave 3 / 5 / dem [27, 32, 39] /
  tak [28, 33, 40]
- 20109: 100 / survived / 100 / wave 3 / 7 / dem [] / tak [] —
  zero-raid seed
- 20110: 100 / survived / 100 / wave 3 / 4 / dem [19, 82, 87] /
  tak [20, 83, 88]
- 20111: 100 / survived / 100 / wave 2 / 4 / dem [15, 31] /
  tak [16, 32]
- 20112: 100 / survived / 100 / wave 3 / 4 / dem [60] / tak [61]
- 20113: 100 / survived / 100 / wave 3 / 1 / dem [93] / tak [94]
- 20114: 100 / survived / 100 / wave 3 / 10 / dem [38, 57, 95] /
  tak [39, 58, 96]
- 20115: 100 / survived / 100 / wave 3 / 4 / dem [36, 82, 100] /
  tak [37, 83] — hanging day-100 demand (10133 class)
- 20116: 100 / survived / 100 / wave 3 / 10 / dem [68, 77, 94, 96] /
  tak [69, 78, 95, 97]
- 20117: 100 / survived / 100 / wave 2 / 7 / dem [41, 47, 66, 84, 100]
  / tak [42, 48, 67, 85] — hanging day-100 demand
- 20118: 100 / survived / 100 / wave 2 / 2 / dem [99] /
  tak [100] — HIT
- 20119: 100 / survived / 100 / wave 2 / 4 / dem [] / tak [] —
  zero-raid seed
- 20120: 100 / survived / 100 / wave 3 / 5 / dem [53, 98] /
  tak [54, 99]
- 20121: 100 / survived / 100 / wave 3 / 1 / dem [34, 50, 93, 98] /
  tak [35, 51, 94, 99]
- 20122: 100 / survived / 100 / wave 3 / 1 / dem [90] / tak [91]
- 20123: 100 / survived / 100 / wave 3 / 2 / dem [81] / tak [82]

Totals: 55 demands, 53 takes, 51,194 take kcal. Take == demand + 1
on every matched pair (verified per seed above); the only
unmatched demands are the two hanging day-100 demands (20115,
20117), whose takes would need a day-101 endDay outside the run.
No demand dated 99 other than 20118's; no take dated > 100.
Full census JSON:
evidence/2026-10-27/sim-day99demand-b-screen-census.json.
Screen corpus:
evidence/2026-10-27/sim-day99demand-b-screen-corpus/ (24 files).

Updated base rate (raidday100 band + this band): day-99 demands
1/108 demands (0/53 + 1/55); seeds carrying a day-99 demand 1/64
(0/40 + 1/24). The naive uniform estimate (1.5% per seed) is
consistent with 1 hit in 24 seeds; the late-window sparsity caveat
in the prereg stands but is no longer the binding question — the
seed exists.

## Reachability verdict (screen band, competent-nofeast, 100d)

Wave reach: wave 3 on 18/24 seeds, wave 2 on 6 (no seed stopped
at wave 1 as its max; the two early deaths reached waves 2 and 3
respectively); waves 4-5 on 0/24 seeds. Regional, national, table, wins:
0/24. Rank stayed village on all 24 seeds. Median survival 100d
(22 seeds at daysAlive 100; 20100 lost at day 29, 20104 at day 94).
Deaths 116 (arena 41, sickness 15, ambush 10, starvation 9, monster
8, wound-that-wouldn't-close 8, contest 7, combat 6, dehydration 4,
alien 2, the night 2, and singletons highbeam deer, lockjaw, big
big, rut king at 1 each).

The scale wall stands on this band; this arm measures a ledger
leg, it does not move the wall numbers. Arc II/III/IV, four-realm
formation, trap acquisition by source, counter discovery/
counter-kill rate, and young-link succession survival are not
recorded in this corpus and are not estimated here.

## Wall numbers (screen band, competent-nofeast)

National / table / wins: 0/24. Wave-4/5 unlocks: 0/24. Wave reach:
wave 3 on 18 seeds, wave 2 on 6. Median survival 100d. Death-cause
shares: arena 35.3% (41/116), sickness 12.9% (15/116), ambush 8.6%
(10/116), starvation 7.8% (9/116), monster 6.9% (8/116), wound 6.9%
(8/116), contest 6.0% (7/116), combat 5.2% (6/116), dehydration 3.4%
(4/116), alien 1.7% (2/116), the night 1.7% (2/116), and 4
singletons at 1 death each (3.4% combined).

## Village assessment (plain words)

Twenty-four villages, twenty-two surviving the full 100 days
around pantries holding over a hundred thousand kcal at the close
(20118's day-100 snapshot: 110,054 kcal fresh, zero spoiled) — and
the two that didn't are the honest exceptions that prove the
horizon is death-aware, not padded. The food story on this band was
never hunger: villages eat from deep, named stores and the raid
that matters here costs about 1,000 kcal against a six-figure
pantry, a tax, not a famine — but arenas (41 deaths, over a third
of all deaths), sickness, and ambushes are what actually kill
people. Who thrived and who died and why: the surviving villages
thrived on the same pantry competence; the dead (20100, lost at
day 29; 20104, lost at day 94 with 13 deaths) lost people to
violence and sickness, not to raids — and 20118, the village that
matters to this run, lost just two people in 100 days (an ambush
on day 7, "the night" on day 81) and was still standing, pantry
full, when Andre of Thornfield came to the treeline on day 99.
What was missing is now found: a demand on the one night that lets
the ledger's last untested subtraction prove itself. Blanks filled:
(1) the supplied HIT seed 20118, with its demand/take days, kcal,
and snapshot position recorded above and in the census; (2) the
updated day-99 base rate (1/108 demands, 1/64 seeds across the two
sweep bands); (3) the fidelity picture completed — the hit is a
sweep-instrument seed that reproduces under faithful replication
and diverges under a plain recorder, exactly as the suppression
finding predicts. Documented, not fixed: no game-code change was
made (measurement only); the judged analyzer run on 20118, and
any verdict on the adjustment itself, belong to the next arm.

## Sense transcript (SENSE-TESTING LAW — meaning, not just counts)

The demand/take pair on 20118 reads exactly like raiddor's and
raidday100's, with numbers that ARE the ledger's numbers. Day 99,
demand: "🌙 Night. Shouts from the treeline — Andre of Thornfield
with 4 others, and they're not here to talk. \"Your pantry or your
blood. Choose.\" (They want ~2,000 kcal.)" — a named champion of a
named village, an honest demand size, plus a same-day Codex entry
recording the demand ("Andre of Thornfield raids Haven's treeline
— demands ~2,000 kcal"). Day 100, take: "🌙 You weren't at the
treeline. Andre of Thornfield didn't wait — they hit the stores
and melted back into the dark with 1,000 kcal. The village will
talk about this for a long time." Ledger: day 100, Canned soup 4u
x 250 = 1,000, asked 800 — the numbers match the narration exactly,
as they did on the earlier bands. The "talk about this for a long
time" tail is a social consequence (opinion -5, journal entry),
not flavor. Nothing robotic, static, or repeated was found beyond
the mechanism's own honest whole-unit arithmetic (the 800-ask /
1,000-take shape on Canned soup). The one sense note that matters
for the next arm: the demand line's "~2,000 kcal" is the ASK as
spoken, not the take — the take is the 800-ask/1,000-take ledger
shape, and the next arm must not mistake the spoken ~2,000 for the
adjustment amount (raid100 = 1,000, the recorded take).

## Metric review (MEASUREMENT.md section 14)

- The pre-registered metric worked as written and the verdict
  follows from it: a HIT seed was found in the third chunk, the
  proof exits 0 on the full corpus, and screening stopped per the
  stopping rule (40 cap seeds unspent). No clause was re-scored;
  the take-itself-required rule was honored (no PARTIAL seed was
  promoted to GO — and none occurred).
- Sizing lesson: the naive uniform model (≈1.5% per seed, ≈63%
  power at 64) proved adequate — 1 hit in 24 seeds — but the
  late-window caveat was real: only this band's demand-99 fell in
  the ≥90 window at all (plus hanging day-100 demands on 20115 and
  20117, the 10133 class). A future rare-event screen should keep
  the chunk + hard-cap + stop-at-hit structure: it found the hit
  for 24 seeds of spend instead of 64.
- Instrument lesson: the proof's designed failure mode behaved
  correctly (exit 1 on the 8- and 16-seed partial corpora, exit 0
  on the 24-seed corpus with the hit), and the selftest's negative
  control (raidday100 corpus: 0 hits, 0 partials) stayed negative.
  The plain-vs-faithful divergence is now a two-seed finding
  (10133, 20118), not a one-off: any future arm that screens with
  one instrument and judges with another must re-derive the seed
  under the judging instrument, or say plainly that it did not.
- Balanced panel (MEASUREMENT.md §15): NO comparison exists — this
  arm changes no lever and no game code, so there is no before/
  after to panel, exactly as raidday100 and day100raid-code stated.
  The instrument before/after is sweep corpus (suppression on) vs
  plain recorder (suppression off), reported above as the fidelity
  section, not forced into a panel.
- Infrastructure notes (loud): (1) After the prereg commit
  ec59cc195, the safe-commit index-clobber variant hit again
  (committed files staged-as-deleted in the main index) — repaired
  per the documented recipe (update-index --add --cacheinfo from
  HEAD blobs), verified git status clean + git diff HEAD empty +
  hash-object matches HEAD blobs, before any sweep. The commit
  itself was correct. (2) No EPERM write flap blocked this run's
  writes; the sweep's in-memory pending-flush path was never
  needed. (3) Per-seed sim compute ~1.5-2.1s; wall time per 8-seed
  chunk ~5-9 min under sibling load (load ~6 on 2 cores) — load,
  not compute, dominates. (4) Chunk outputs were consumed through
  a tail pipe, so per-chunk stdout is not saved as a log file; the
  corpus files + census + proof log are the run's record, and
  every per-seed demand/take pair was re-derived from the corpus
  files (not from console output) for this evidence file.

## Reproduction check (this run)

- Prereg committed BEFORE any screen sweep (ec59cc195); pilot and
  both extensions ran after that commit, in chunk order, with the
  stop-at-hit rule honored.
- Proof scripts/test-day99demand-b.js: selftest PASS before the
  prereg commit (PASS-on-positive, FAIL-on-negative, FAIL-on-
  control); re-run on the full 24-seed screen corpus: PROOF PASS,
  exit 0, hygiene clean. No jest was run (nothing to test in jest
  — the proof is node, not jest). No [needs-eyes]: this lands a
  measurement, not a player-visible change.
- No game-code change: zero src/js files committed. Files in this
  arm's commits: prereg commit ec59cc195 (prereg + vendored sweep/
  capture + proof) and the evidence commit (this file + census +
  screen corpus + proof log + plain/tracefull recorder logs).
- Backlog: the sim-findings.md line for the post-snapshot
  adjustment item is left for the coordinator to mark — this arm
  SUPPLIES the seed (GO on the seed-supply metric) but does NOT
  exercise the adjustment itself; the item should be recorded as
  "seed supplied (20118), judged analyzer run pending", not as
  fixed, until the next arm closes the ledger with it.

## Convergence line

The day-99-demand blank is filled, not yet converged: seed 20118
supplies a day-99 demand with a day-100 take (1,000 kcal, Canned
soup 4u x 250, dated == lastSnapDay 100) that reproduces under
faithful sweep replication. What remains is the judged analyzer
run on 20118 (raidday100 GO clauses (b)-(f): touched focal rows
close WITH the adjustment, off by exactly the raid amount WITHOUT
it). Until that run, the post-snapshot raid adjustment remains
implemented but unexercised as a judged leg — with its exercising
seed now in hand.

## Verdict (judged against the pre-registered bar, not re-scored): GO

Seed 20118 (demand day 99, take day 100, 1,000 kcal, surviving,
lastSnapDay 100) was found in the third screen chunk (24 seeds
screened of the 64 cap), the proof passes on the full corpus, and
the hit reproduces under faithful sweep replication. The next arm
runs the judged analyzer on 20118; this arm's deliverable — the
seed — is supplied.
