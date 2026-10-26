# sim-fishfallback-b — fish staffing fallback (LEVER arm)

Loop B, run fleshout-loop-b-20261026T0630Z, axis food-economy. Worktree
branch sim-fishfallback-b. Base: master at run start (see corpus meta
for the exact HEAD recorded per run).

## Canon read first

- docs/CANON.md (manifest) and docs/PRESERVATION.md (the food ladder:
  cleaned < cooked < smoked < rendered < pemmican; blind penalties teach).
  Fish staffing itself has no dedicated canon doc — the code is the source
  of truth. Prior diagnostic evidence/2026-10-26/sim-fishstaff-b.md (read
  first) established the mechanism this arm fixes; nothing in it is
  re-judged here.
- docs/MEASUREMENT.md §§9–12, 14–15 apply as staged below.

## The lever (policy-side only)

Mirror the LANDED cook staffing fallback (commit 908ad0f12,
scripts/policies/competent.js cook loop: walk down the scored candidate
list until someone accepts) into counterPlay's fish loop
(competent.js ~lines 1592-1597, assignAnother('fish')). Today the loop
re-reads free villagers and always re-asks the top scorer, so one refuser
(e.g. Rosa Mendez on the trust gate, trust <10) absorbs every iteration —
19 refusals on 9754 pd0 in the fixed fishstaff instrument (192-239 on the
older base), while the creek stays thin.

Change shape (scripts/policies/competent.js only, zero src/js expected):
assignAnother walks its sorted candidate list until a call returns
ok; a refusal (or null/exception) moves to the next candidate; if nobody
accepts it returns false and the fish loop breaks for that slot — no
fisher staffed, honest, not forced. A ctx.fishStaffFallback counter
(mirroring ctx.cookStaffFallback) records slots staffed by a non-top
candidate. assignAnother's only caller is the fish loop, so no other
staffing path changes behavior.

OUT OF SCOPE — not touched, not decided: (1) the trust-0 checkObedience
quirk (stored 0 read as 10) — pending Steve's 0-vs-unknown design call;
(2) sheltered-holder crew counting (whether sheltered fishers should
count toward wantFishers) — open design question; observations only.

## PRE-REGISTRATION (written BEFORE any sim runs; judged ONLY against this)

- Substrate (identical on both arms): policy leadfeast
  (scripts/policies/feastscale.js leadfeast + competent counterPlay),
  DEPOSITGATE=1, FEASTSCALE_R13=1, SEATDRIVE=0, PLENTYDEPRI=0 (pd0),
  100d death-aware horizon (dead villages stop, +10d tail max).
- Seeds: PILOT GATE first — band 9750-9757 pd0 (the fishstaff-b band,
  9754 focus) for comparability. Confirm ONLY if pilot GOes: fresh band
  9760-9775 pd0 (16 seeds), same legs.
- Primary metric (per seed, identical seeds both arms): fish ok calls,
  refused calls by villager (max single-villager refusals), post-daily
  snapshot fish-days, FRESH-OK holders, ctx fishStaffFallback total.
- GO threshold (ALL legs must hold on the pilot; a miss on any leg is
  NO-GO, never re-scored against a friendlier metric mid-run):
  - G1 RESCUE: every pilot seed with baseline snapFishDays == 0 has
    armed snapFishDays >= 5 AND armed ok >= 5 (creek staffed where the
    baseline staffed none).
  - G2 NO EMPTY BURN: no pilot seed has armed ok == 0 while armed
    refused >= 10 (never again a seed that burns >=10 refusals and
    staffs nobody).
  - G3 FALLBACK FIRES: armed ctx fishStaffFallback total across the
    pilot >= 1 (at least one slot staffed by a non-top candidate).
  - G4 COST BARS: on every pilot seed, armed starvation deaths <=
    baseline starvation deaths + 2; AND armed median daysAlive >=
    0.8 x baseline median daysAlive.
- Guards (reported, never verdict-flipping post-hoc): daysAlive, deaths
  and death-cause shares, wave reach, national reach per seed; if the
  instrument moves any numeric field vs a recorder-free neutral run,
  say so and the arm is NO-GO on neutrality.
- Instrument: scripts/sweep-fishfallback-b.js — the fishstaff-b recorder
  (assignTask caller stacks + returns, offerDeal/appealToGoal, resolve
  fish maps, pre/post-daily snapshots with full assignment objects,
  death counting that delegates) plus a read-only Game.say tap for fish
  dialogue and a ctx-counter capture (fishStaffed / fishStaffFallback).
  FISHFALLBACK_NEUTRAL=1 runs with all wrappers off.
- Panel (§15): attempted per the panel section below; the recorder
  corpus is not panel input (see there), so the analyzer table is the
  fallback comparison — no panel inputs are fabricated.

## Metric review (§14)

The pre-registered legs judged the run as written; none was re-scored.
Three metric lessons for the NEXT run, recorded not applied here:
(1) G1's rescue leg needs a dead-creek seed to bite — on a band with
no baseline-zero-snap seed it passes vacuously, so a confirm band
should either include a known dead-creek seed or the leg should be
reported as vacuous (as done above). (2) The starvation + median-days
cost bars passed while 3 confirm seeds flipped to lost via arena
deaths — a survived-count or arena-death guard would catch what these
bars miss. (3) "Refusal pileup" as a raw count is the wrong shape for
this fix: armed 9754 refuses MORE (137 vs 19) because the village
lives longer and Rosa is still asked first every slot. The honest
pileup metric is the one pre-registered as G2 — refusals WITH zero
staffing — not the raw refusal count. No metric was changed mid-run.

## Balanced panel (§15)

Attempted and NOT attached, honestly: scripts/balance-panel.js builds
its own panels from its own sim inputs (policies capable, risk-aware,
socialite, winseek — not the leadfeast substrate used here) and its
`compare` command needs before/after panel.json.gz files, not recorder
corpora. It cannot ingest this arm's corpus, and no panel inputs were
fabricated. The analyzer tables above (per-seed before/after on
identical seeds, corpus test green, neutrality exact) are the
fallback comparison, as the arm brief sanctions for this known
recorder-corpus failure class.

## Results — PILOT VERDICT: GO (all 4 pre-registered legs pass)

Pilot band 9750-9757 pd0, identical seeds both arms. Baseline corpus
reproduced fishstaff-b's fixed-instrument numbers EXACTLY on all 8
seeds (e.g. 9754: 19 calls, 0 ok, 19 refused, 0 snap days) — the new
instrument (say tap + ctx capture added) did not move trajectories, and
neutrality matches exactly on 9754 both arms (baseline 34d; armed 100d).

| seed | days B->A | ok B->A | refused B->A | snapDays B->A | FRESH B->A | starv B->A | deaths B->A | wave B->A | nat B->A | fallbackCtx A |
|---|---|---|---|---|---|---|---|---|---|---|
| 9750 | 100->100 | 173->173 | 0->0 | 100->100 | 173->173 | 0->0 | 4->4 | 4->4 | Y->Y | 0 |
| 9751 | 100->100 | 271->171 | 8->10 | 96->90 | 271->171 | 2->1 | 12->18 | 3->4 | N->N | 10 |
| 9752 | 100->100 | 92->92 | 0->0 | 99->99 | 92->92 | 0->0 | 15->15 | 4->4 | Y->Y | 0 |
| 9753 | 93->100 | 74->59 | 2->2 | 91->100 | 74->59 | 0->0 | 14->8 | 4->4 | Y->N | 2 |
| 9754 | 34->100 | 0->142 | 19->137 | 0->80 | 0->141 | 3->1 | 8->9 | 2->4 | N->Y | 137 |
| 9755 | 78->100 | 107->169 | 13->31 | 71->100 | 107->169 | 0->0 | 9->6 | 4->4 | Y->Y | 14 |
| 9756 | 100->100 | 122->174 | 82->4 | 87->96 | 122->174 | 0->0 | 11->3 | 4->3 | Y->Y | 4 |
| 9757 | 100->100 | 181->171 | 4->2 | 97->100 | 179->171 | 0->0 | 10->6 | 4->4 | Y->Y | 2 |

Legs: G1 RESCUE pass (9754, the only baseline-zero-snap seed: snap
0->80, ok 0->142); G2 NO EMPTY BURN pass (no seed with armed ok==0 and
refused>=10); G3 FALLBACK FIRES pass (armed ctx fishStaffFallback total
169); G4 COST BARS pass (starvation never above baseline+2 on any seed;
median days 100->100, bar >=80). Analyzer exit 0; corpus test green
(call accounting closes, classification complete, 0 GAP holders on all
pilot runs, neutrality exact both arms).

Plain reading: the fix does NOT make Rosa stop refusing — on 9754 she
refuses 137 times armed (vs 19 baseline) because the village now lives
100 days and the leader still asks her first every slot. What ends is
the BLOCK: each refusal now moves to the next candidate, so Stan
Kowalski (45 ok) and Victor Lopez (43 ok) staff the creek instead, and
the village survives to day 100, reaches wave 4 and national, where the
baseline died day 34 with 3 starvation deaths. On seeds where the creek
already staffed (9750, 9752), trajectories are byte-identical — the
fallback only changes runs that needed it. Two trajectory-divergence
watch items, not leg failures: 9751 armed ends village-lost at day 100
(baseline survived) with more arena deaths (9 vs 6) though starvation
fell (2->1); 9753 armed survives longer (93->100) but loses national
(baseline Y, armed N). Staffing fish changes who lives and dies
downstream; it does not make every seed better.

## Results — CONFIRM VERDICT: GO (pre-registered legs pass; read the flips below)

Fresh band 9760-9775 pd0, 16 seeds, identical seeds both arms. True
baseline digest 926f87f93359e131, armed digest b0adaacc0ba86ae9 (see
infrastructure note on the first, contaminated confirm-baseline attempt
— its files were deleted and the band re-run clean).

| seed | days B->A | ok B->A | refused B->A | snapDays B->A | starv B->A | deaths B->A | wave B->A | nat B->A | fallbackCtx A |
|---|---|---|---|---|---|---|---|---|---|
| 9760 | 100->100 | 100->100 | 0->0 | 100->100 | 0->0 | 7->7 | 4->4 | Y->Y | 0 |
| 9761 | 100->100 | 173->214 | 6->14 | 100->100 | 0->0 | 5->8 | 2->4 | Y->Y | 11 |
| 9762 | 100->100 | 105->105 | 0->0 | 100->100 | 0->0 | 4->4 | 3->3 | Y->Y | 0 |
| 9763 | 100->100 | 180->180 | 0->0 | 100->100 | 0->0 | 4->4 | 3->3 | Y->Y | 0 |
| 9764 | 100->94 | 81->86 | 5->4 | 75->92 | 1->0 | 6->12 | 3->4 | Y->Y | 4 |
| 9765 | 100->100 | 179->179 | 0->0 | 100->100 | 0->0 | 3->3 | 4->4 | Y->Y | 0 |
| 9766 | 100->100 | 251->251 | 0->0 | 100->100 | 0->0 | 13->13 | 3->3 | N->N | 0 |
| 9767 | 100->100 | 72->72 | 0->0 | 100->100 | 0->0 | 9->9 | 4->4 | Y->Y | 0 |
| 9768 | 100->68 | 164->85 | 1->2 | 95->59 | 0->0 | 11->13 | 4->4 | Y->N | 2 |
| 9769 | 95->95 | 158->158 | 0->0 | 94->94 | 0->0 | 13->13 | 4->4 | Y->Y | 0 |
| 9770 | 100->100 | 166->166 | 0->0 | 100->100 | 0->0 | 2->2 | 2->2 | Y->Y | 0 |
| 9771 | 100->69 | 129->127 | 2->8 | 85->60 | 0->1 | 13->16 | 3->4 | Y->N | 6 |
| 9772 | 100->100 | 105->122 | 11->14 | 94->100 | 0->0 | 11->3 | 4->3 | Y->Y | 8 |
| 9773 | 100->100 | 104->104 | 0->0 | 100->100 | 0->0 | 11->11 | 4->4 | Y->Y | 0 |
| 9774 | 94->91 | 144->125 | 5->7 | 86->89 | 0->0 | 13->14 | 4->4 | Y->Y | 5 |
| 9775 | 100->100 | 160->140 | 12->14 | 86->99 | 0->0 | 7->6 | 4->4 | Y->Y | 12 |

Legs: G1 RESCUE vacuous-pass — NO confirm seed had baseline
snapFishDays==0, so there was no dead creek to rescue on this band
(the dead-creek shape is 1/8 pilot seeds, 0/16 confirm seeds; the
rescue demonstration stands on pilot 9754 only, stated plainly, not
inflated). G2 pass (no armed ok==0 seed at all). G3 pass (armed ctx
fishStaffFallback total 48). G4 pass (starvation never above
baseline+2 — worst is 9771, 0->1; median days 100->100, bar >=80).
Analyzer exit 0; confirm corpus test green (all 32 per-seed files +
both 9754 neutrals).

THE FLIPS, REPORTED LOUDLY (not leg failures, but the real story of
this band): 3 confirm seeds flip survived->lost under the armed code
(9768: 100->68, 9771: 100->69, 9764: 100->94), and 2 lose national
(9768, 9771). Their armed deaths are arena-dominated (9768: 12/13
arena; 9771: 13/16 arena; 9764: 11/12 arena) with starvation at 0/1/0 —
the lever does not starve villages, it reshuffles who faces the arena
downstream (different early staffing -> different contest/arena
participation -> different deaths). Survival counts across all 24
seeds: baseline 18 survived, armed 17 survived — the lever is
survival-neutral overall, with its win concentrated exactly on its
design target (the dead-creek seed: 34->100 days, wave 2->4, national
reached). A future run's metric review should consider an arena-death
or survived-count guard alongside the starvation bar; that is a
proposal for the NEXT run, not a re-score of this one.

[To be filled after the runs.]

## Village assessment (plain words)

On the focus seed the story flips completely. Before the fix, the
village's leader asked Rosa Mendez for the creek job, she said no —
she doesn't trust the leader enough yet, and she says so in her own
words ("Ask someone who trusts you," "You haven't earned that yet") —
and the leader asked her again the next day, and the next, while
nobody fished and the village starved out by day 34. After the fix,
Rosa still says no every time — she is consistent, not broken — but
the leader moves on and asks the next person, and Stan and Victor take
the creek. Fish-duty lines appear in the village's talk ("Fish. They'll
report back by next part"), the pantry holds, and the village is still
standing at day 100, fishing, reaching wave 4 and the national stage.
On villages where the creek already staffed, nothing visible changes —
the same people fish the same days. The villagers were never the
robotic part; the leader's loop was, asking one refuser forever
instead of asking the next villager. That is what this fix changes.

## Sense-testing note

Sense evidence comes from the new Game.say tap (the fishstaff-b emit
tap caught 0 fish lines; the say tap caught 40 samples per run, of
which the fish-duty lines are the "🎣 Fish. They'll report back"
assignments). Baseline 9754: 0 fish-duty lines, 19 refusals, all Rosa,
all trust-gate reasons in her voice. Armed 9754: 8 sampled fish-duty
lines (including one for Rosa herself — the trust-0 quirk day, out of
scope, no change made), 137 Rosa refusals in the same voice, and the
creek staffed by Stan (45) and Victor (43). The refusal is legible and
consistent; the staffing is now legible too. One honest limit: the say
tap also catches creek-water and creek-stone lines (any "creek|fish"
mention), so fish-duty lines were filtered by the 🎣 marker, not
counted raw.

## Blanks filled or documented

FILLED (this arm): the fish staffing fallback — counterPlay's fish
loop now walks candidates like the landed cook fallback. DOCUMENTED
(not changed, out of scope): (1) trust-0 checkObedience quirk — visible
in armed 9754 as a Rosa fish-duty line (stored 0 reads as 10); still
pending Steve's 0-vs-unknown call. (2) Sheltered-holder crew counting
— visible in armed 9753 (150 STALE holder-days: a long muster holds
fishers who catch nothing while counting as staffed); still an open
design question, observations only. (3) Trajectory divergence watch:
9751 armed loses a village the baseline kept (arena deaths, not
starvation); 9753 armed loses national while surviving longer.
Neither breaks a pre-registered bar, but both say the creek lever moves
more than calories.

## Infrastructure notes

- CONTAMINATED FIRST CONFIRM-BASELINE — CAUGHT AND REPAIRED. The first
  confirm "baseline" run was launched AFTER the lever was implemented,
  so it ran armed code (its files carried the armed digest
  b0adaacc0ba86ae9 and armed ctx counters, and its numbers matched the
  armed run exactly). The corpus test's digest-difference check is what
  would have caught it at commit time; it was caught earlier by
  inspecting file digests before writing any confirm numbers. Recovery:
  the armed policy file was first copied to the corpus as
  competent-armed-20261026.js (digest-verified), the live file was
  restored to HEAD (true baseline digest 926f87f93359e131), the 16
  mislabeled files were deleted (note: the first delete glob `s976*`
  missed 9770-9775, which the clean re-run then overwrote — verified
  by digest after the run), the band was re-run clean, and the armed
  file was restored from the corpus copy (digest re-verified
  b0adaacc0ba86ae9, unit test re-green). NO contaminated number
  appears in this evidence file; the contaminated summary was also
  deleted. The pilot was never affected (baseline ran pre-edit,
  armed post-edit, digests verified in the analyzer output).
- Wall time, not sim time: each seed-run costs ~2s of sim but
  ~45-60s wall (harness load + world setup), so the 16-seed confirm
  arms took ~19 min each. The frozen-clock harness makes per-seed sim
  ms deterministic, which is why two armed-code runs printed identical
  ms values — that was a clue in the contamination catch, not a bug.
- No EPERM flap hit this arm's writes (unlike fishstaff-b); no
  @@FALLBACK recovery was needed. No jest runs were made (no jest
  suites cover this policy change; the node proofs above are the
  tests). The `check.js --quick` green-list run is left to the
  coordinator's landing step to avoid a concurrent-jest clash with
  the live sibling loop.
- Reachability verdict: waves 1-5 were NOT reached here (max wave 4
  on these seeds; no wins, no table) — this arm's scope is creek
  staffing, not the scale wall. What it does move: the dead-creek
  village (9754) reaches wave 4 and national where it previously
  died at wave 2. Regional->national movement on other seeds is
  mixed (9768, 9771 lose national under armed code — see flips).
