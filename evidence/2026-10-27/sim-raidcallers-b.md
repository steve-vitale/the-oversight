# sim-raidcallers-b — exercise the OTHER _removePantryKcal callers, re-judge the ledger

Run: oversight-flesh-out-loop-b, axis food-economy. Arm: sim-raidcallers-b.
DIAG/measurement only: ZERO src/js changes, no default flips, no game-code
lever. This arm does NOT re-judge the raiddor GO, the stockdoors NO-GO,
the residualhunt GO, the residual2b phase-1 NO-GO, or the ledgerbound
PILOT GO / CONFIRM-GO — their verdicts stand in their own evidence. Its
verdict is ONLY whether the family ledgers close under the boundary
definition WITH ALL _removePantryKcal callers counted, and whether every
fired non-raid caller record is named to its caller frame. Judged ONLY
against evidence/2026-10-27/sim-raidcallers-b-prereg.md (committed as
b2fabea68 BEFORE any judged sweep).

## Verdict against the pre-registered GO: GO

GO iff ALL of (a) pilot band seeds 9951-9958 fires at least one non-raid
_removePantryKcal record AND every fired non-raid caller record is named
to its caller frame (unknown-caller records == 0, band total); AND (b)
the pilot band closes under the caller-complete boundary definition:
named rate >=80% AND pooled within 1%, generic rate >=80% AND pooled
within 1%, dried pooled within 2% (rate bars judged only with >=8
counted rows, else pooled-only per the prereg's named-row rule); AND
(c) a fresh confirm band of 12 seeds (9962-9973) on the same base,
policy, and horizon meets the same naming bar and the same three
channel bars.

- (a) PILOT NAMING — PASS. 115 non-raid records, 0 unknown callers,
  across 6 caller frames: payTribute 79, answerDemand 9, answerAccord
  7, answerAidBeg 7, answerNationalChoice 8, answerGlobalChoice 5.
  Plus 11 raid-unanswered records (caller villageAgencyDaily).
- (b) PILOT LEGS — PASS. Leg 2 coverage PASS (stockdoor 8/8,
  dried-events 8/8, linked 100%). Caller-complete named: counted 2
  rows (below the 8-row rule, so the rate bar is NOT judged —
  reported 2/2 at 100%), pooled residual 0 / 232,860 = 0.000% (bar
  <=1%). Caller-complete generic: counted 8, passed 7, rate 87.5%
  (bar >=80%), pooled 1,764 / 2,292,482 = 0.077% (bar <=1%).
  Caller-complete dried: pooled -2,320 / 796,789 = 0.29% (bar <=2%).
  Det-gate (leg 1) PASS, proof GREEN (39 checks).
- (c) CONFIRM — PASS, all bars judged. Leg 2 PASS (stockdoor 12/12,
  dried-events 10/12 — the 2 short seeds are the early deaths 9962
  d33 and 9970 d16 — linked 100%). Caller-complete named: counted
  8, passed 8, rate 100.0%, pooled 0 / 1,295,460 = 0.000%.
  Caller-complete generic: counted 12, passed 11, rate 91.7%,
  pooled -586 / 3,705,103 = 0.016%. Caller-complete dried: pooled
  -2,880 / 1,447,164 = 0.20%. Naming: 182 non-raid records, 0
  unknown callers, same 6 frames. Det-gate PASS, proof GREEN (39
  checks, after the proof fix in "Metric review").
- Convergence: converged — for the other-callers ledger blank this
  run was assigned. The _removePantryKcal door is now exercised
  across 7 caller frames (6 non-raid + raid) on two independent
  bands, and the books balance with all of them counted. The
  reachability wall (the table, the win) is a separate open blank
  and is NOT closed by this run: no seed on either band reached it,
  though national standing moved sharply (see "Wall numbers").

## Prereg header (MEASUREMENT.md §§11, 14)

- Primary metric: caller-complete boundary ledger closure + non-raid
  caller naming (see "Verdict" above for the verbatim GO).
- GO threshold: verbatim from the prereg (see "Verdict" above).
- Horizon + why: 100 days, death-aware (a seed that dies ends
  early) — the raiddor horizon, and the horizon the boundary
  question lives on. Seeds 9951 (d26), 9953 (d90), 9962 (d33), 9970
  (d16) died early and end their bands' horizons honestly; their
  last snapshot days are 26, 90, 33, 16.
- Seeds: pilot 9951-9958 (belongseek-nofeast); confirm 9962-9973
  (fresh band, collision-checked before the prereg commit — no
  corpus JSON filenames, no seed mentions in dated evidence .md
  files; bands 9900-9911 and 9930-9941 rejected as contaminated
  per the ledgerbound prereg; 9950 and 10000 rejected as range
  endpoints mentioned in that prereg; not on the ledgerbound or
  raiddor branches; distinct from census seeds 9500-9503 and from
  spent-but-unjudged 9768-9779).
- Policies: belongseek-nofeast (COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off; belongseek
  default, BELONG_V3 unset; no treeline/warcourt layers).
- Base: current master HEAD at prereg time,
  6ae5049d88d6c22192489dca51a5160d90606daf, NO pin. All sweeps +
  proofs ran on this HEAD; no base move occurred between prereg
  and sweep (verified: worktree HEAD unchanged through the run).

## Instrument (vendored under NEW raidcallers names, zero sibling modifications)

- scripts/sweep-raidcallers-b.js (vendored from raiddor's sweep;
  output dir/file prefix, mode string, staging dir, capture require
  adapted; PLUS a POLICY env selecting the policy object:
  competent | belongseek | scalecourt | treeline (withTreeline over
  competent) | warcourt | kind — every candidate wraps the
  competent substrate, so the nofeast gates still apply).
- scripts/analyze-raidcallers-b.js (vendored from raiddor's analyzer;
  old-boundary, ledgerbound-boundary, and raiddor legs reported
  alongside as controls; the NEW legs are the caller-complete legs
  leg3c/leg4c/leg5c + the non-raid naming census).
- scripts/test-raidcallers-b.js (proof; see "Proof" below).
- scripts/trace-raidcallers-b.js (vendored from raiddor's trace; ALL
  _removePantryKcal caller records counted in the transition flows).
- scripts/stockdoors-capture-raidcallers.js (vendored from raiddor's
  capture, header adapted; the _removePantryKcal snapshot-diff
  recorder is unchanged — it already records every caller under its
  own caller frame, raid-unanswered iff caller is
  villageAgencyDaily, else removepantry-<callerFn>, with the caller
  read from the live Error().stack before delegating).
- NEVER modified: any sibling capture file (inflow/mealdraw/spoilvol/
  driedpath/stockdoor-capture, ledgerbound files, raiddor files) or
  any src/js file.

## Census basis (SCREEN, not judged — run before the prereg commit)

Short census sweeps (seeds 9500-9502, 100d, same nofeast gates;
competent ran 4 seeds, 9500-9503), counting non-raid
_removePantryKcal records per caller:

- competent (4 seeds): 8 raid-unanswered records, 0 non-raid —
  reproduces the raiddor finding on the current base: competent
  play never exercises the other callers. Ranks: village x4.
- belongseek (3 seeds): 54 non-raid records, 4 raid-unanswered —
  payTribute 39, answerDemand 8, answerAccord 3,
  answerNationalChoice 3, answerGlobalChoice 1; zero unknown
  callers. Ranks: national, national, global. THE PICK.
- scalecourt (3 seeds): 5 non-raid records (all answerAccord),
  2 raid-unanswered. Ranks: regional x3. Fires, but sparsely.
- treeline (TREELINE=1; 3 seeds): 0 _removePantryKcal records on
  all 3 seeds — no raids occurred on these trajectories, so no
  answered-raid give/hold-overrun could fire. Say lines DO show
  treeline hold standoffs on 9502 (days 36/66 — holds that ended
  in a count-back, not a pantry take). A future band hunting
  give/overrun specifically would need seeds where holds fail.
- warcourt (WARCOURT_RAID=1; 3 seeds): 8 non-raid records
  (answerAccord 5, answerAidBeg 3 — the aid-beg answer channel
  does fire here), 2 raid-unanswered. Ranks: regional x3.

Caller frames are real Game methods, read from the live stack:
payTribute (hierarchy.js:899), answerAidBeg (safetynets.js:1124),
villageAgencyDaily (villageAgency.js:203, the unanswered-raid
branch), and the hierarchy/comms answer-methods (answerDemand,
answerAccord, answerNationalChoice, answerGlobalChoice). The
instrument names every record from its stack frame; no record's
caller was assigned from a lookup table.

## Pilot legs (seeds 9951-9958, belongseek-nofeast, current base)

Controls (all FAIL — as expected, since they exclude the ~502k kcal
of non-raid takes): old-boundary named pooled -20,436 / 232,860 =
8.776%, generic pooled -261,176 / 2,292,482 = 11.393%, dried
-267,290 / 796,789 = 33.55%; ledgerbound-boundary named 9.407%,
generic 11.252%, dried 33.55%; raiddor legs named 9.407%, generic
10.869%, dried 32.57%. The controls behave as before; the instrument
change did not move them.

Caller-complete legs (judged): leg 2 PASS (see "Verdict"); leg 3c
named counted 2, passed 2, pooled 0 / 232,860 = 0.000% — the rate bar
is NOT judged (2 rows < 8-row rule), the pooled bar passes; leg 4c
generic counted 8, passed 7, rate 87.5%, pooled 1,764 / 2,292,482 =
0.077%; leg 5c dried pooled -2,320 / 796,789 = 0.29%.

Named family-seed rows, caller-complete: 9954 Purslane 0 (in
11,640); 9956 Burdock 0 (in 221,220). Only 2 named rows clear the
10,000-inflow focal filter on this band — belongseek villages pay
out so much through tributes that most named families sit under
the filter. That is the filter working, not missing data, but it
makes the pilot's named evidence thin (pooled-only); the confirm
band yields 8 rows and judges the rate (see below).

Generic family-seed rows, caller-complete: 9951 Foraged food +427
(0.88%) PASS; 9952 0 PASS; 9953 0 PASS; 9954 +3,700 (1.16%) FAIL;
9955 -319 (0.09%) PASS; 9956 -100 (0.03%) PASS; 9957 -1,944 (0.70%)
PASS; 9958 0 PASS. The single failing row (9954, +3,700) is
documented, not explained: a trace of the NEW-definition ledger for
9954 Foraged food shows noisy step divergences that mostly cancel
(snapshot/flow day-lag, which the trace header itself warns
about) and does not isolate a single missing door. The band still
passes rate (7/8) and pooled (0.077%); the remainder is a small
open item for a future boundary-definition trace, not a verdict
input.

Non-raid census, pilot (115 records, 501,662 kcal, 0 unknown):
9951: 0 (died day 26); 9952: 19 (accord 1, tribute 13, demand 1,
aidBeg 2, national 1, global 1) + 4 raid; 9953: 6 (accord 1,
tribute 5) + 0 raid (died day 90); 9954: 13 (accord 1, tribute 10,
aidBeg 1, national 1) + 3 raid; 9955: 19 (accord 1, tribute 13,
demand 3, national 1, global 1) + 0 raid; 9956: 20 (accord 1,
tribute 13, demand 2, aidBeg 2, national 1, global 1) + 0 raid;
9957: 18 (accord 1, tribute 11, national 3, global 2, demand 1) +
2 raid; 9958: 20 (accord 1, tribute 14, demand 2, aidBeg 2,
national 1) + 2 raid.

Post-snapshot exercise (new in this arm): pilot seed 9957 has a
non-raid record dated == the closing-snapshot day (day 100):
answerNationalChoice, asked 3,000, took 3,339 (6u x 160 Foraged
food (dried), Fish catch items, 1u x 499 Foraged food). The
caller-complete legs subtract it from the boundary closing, and
the pilot still passes (9957 generic row -1,944, 0.70% PASS). The
post-snapshot adjustment for non-raid callers is exercised code,
not defense-in-depth — unlike raiddor's raid adjustment, which
never fired.

## Confirm legs (seeds 9962-9973, fresh band, belongseek-nofeast)

Controls (FAIL, as expected): ledgerbound-boundary named 8.963%,
generic 11.006%, dried 34.91%; raiddor legs named 8.763%, generic
10.776%, dried 34.20%; old-boundary pooled 145.484% (the generic
family's stockdoor inflow dominates the old definition on this
band — reported as observation, not verdict input).

Caller-complete legs (judged): leg 2 PASS (stockdoor 12/12,
dried-events 10/12, linked 100%); leg 3c named counted 8, passed
8, rate 100.0% (judged — meets the 8-row rule), pooled 0 /
1,295,460 = 0.000%; leg 4c generic counted 12, passed 11, rate
91.7%, pooled -586 / 3,705,103 = 0.016%; leg 5c dried pooled
-2,880 / 1,447,164 = 0.20%.

Named family-seed rows, caller-complete (all 0): 9963 Burdock
(28,620), 9963 Muscadine Grapes (294,750), 9965 Burdock (233,010),
9966 Burdock (155,790), 9968 Muscadine Grapes (243,270), 9969
Muscadine Grapes (190,260), 9969 Burdock (46,980), 9971 Burdock
(102,780).

Generic family-seed rows, caller-complete: 9962 0 PASS; 9963 0
PASS; 9964 0 PASS; 9965 0 PASS; 9966 0 PASS; 9967 -114 (0.03%)
PASS; 9968 -1,087 (0.27%) PASS; 9969 -240 (0.07%) PASS; 9970 +416
(2.72%) FAIL — a 16-day village (died day 16) with small inflow
(15,285); the absolute remainder is 416 kcal on a village that
lived 16 days, same small-remainder class as pilot 9954; 9971
-281 (0.05%) PASS; 9972 +720 (0.16%) PASS; 9973 0 PASS.

Non-raid census, confirm (182 records, 805,493 kcal, 0 unknown):
9962: 0 (died day 33); 9963: 15; 9964: 16 + 1 raid; 9965: 18 + 1
raid; 9966: 21 + 2 raid; 9967: 21 + 4 raid; 9968: 21 + 2 raid;
9969: 18 + 2 raid; 9970: 0 (died day 16); 9971: 20 + 3 raid; 9972:
16 + 2 raid; 9973: 16 + 1 raid. Band totals: 182 non-raid + 18
raid = 200 _removePantryKcal records.

## Proof (scripts/test-raidcallers-b.js)

Pilot corpus proof: GREEN, 39 checks — corpus validity (8 files,
policy belongseek-nofeast, stockdoorsOn + raiddorOn true, no
truncation, all 7 direct methods wrapped); det-gate leg 1 PASS
(RAIDCALLERS on vs off byte-identical on non-raid fields, and the
on-run reproduces corpus 9951 counts 44/462/5/2 — 9951 died day 26,
so the det-gate ran on the dead seed; both runs identical and
reproducing is still the valid check); independent recomputation
matches the analyzer on all twelve pooled figures (old, boundary,
raiddor, and caller-complete named/generic/dried); raid/non-raid
integrity (item sums equal returned kcal, 0 retMismatches, no
unknown paths, raid-unanswered caller is villageAgencyDaily);
raid/non-raid disjointness (same-event rule — see "Metric
review"); hygiene (zero src/js modified, zero sibling files
modified — including raiddor files — no modified tracked file
outside this run's own files).

Confirm corpus proof: GREEN, 39 checks — corpus validity (12
files); det-gate leg 1 PASS (on vs off byte-identical, on-run
reproduces corpus 9962 counts 38/441/7/0); independent
recomputation matches the analyzer on all twelve pooled figures;
integrity + disjointness PASS (after the proof fix below);
hygiene PASS.

Proof fix (instrument fix, documented here, not a verdict change):
the first confirm proof run showed 1 FAIL — the old tuple
heuristic (same day + name + spoilDay + units on one item line)
flagged 6 line-level coincidences as disjointness failures. All 6
were verified by hand to be separate takes, not double-counts:
player-takes of 1u and tribute takes sharing a day, an item name,
a spoilDay, and a unit count — usually with different kcalEach
(different stacks), and in the 9971 case the same stack taken
separately by the player (5x 1u) and by a tribute (14u + 1u).
The ledger itself rules out double-counting: had any kcal been
counted twice, the caller-complete pooled residuals (named 0,
generic 0.016%) could not close. The check was replaced with the
correct same-event test (same day AND same totalKcal AND
identical item multisets); line-level overlaps are now INFO (6 on
confirm, 0 on pilot). The fix changes no verdict input — the
verdict legs never used the tuple check — and the proof was fully
re-run GREEN on BOTH corpora after the fix. No verdict was
shopped: the corrected check is stricter about the actual design
(full-event identity, not line coincidence).

## Reachability verdict (both bands, belongseek-nofeast, 100d)

Pilot: waves 1-3 reached on 7/8 seeds, wave 4 on 9954 (1/8);
wave 5 on 0/8. Regional 1/8 (9953), national 6/8 (9952 global,
9954 national, 9955 global, 9956 global, 9957 national, 9958
national — national-or-better counts global), table 0/8, wins
0/8. Median survival 100d (6 survived to day 100; 9951 lost day
26, 9953 lost day 90). Deaths 51 (arena 22, sickness 6,
dehydration 5, starvation 4, wound 3, ambush 3, contest 3, alien
4, toad-war-drum 1 — cause strings as recorded, truncated at 32
chars by the recorder).

Confirm: waves 1-3 reached on 10/12 seeds, wave 4-5 on 0/12.
Regional 1/12 (9963), national-or-better 9/12 (9964 national,
9965/9966/9967/9968/9969 global, 9971 national, 9972/9973
global), table 0/12, wins 0/12. Median survival 100d (10 survived
to day 100; 9962 lost day 33, 9970 lost day 16). Deaths 45 (arena
16, sickness 10, wound 5, contest 4, ambush 3, dehydration 2,
starvation 2, monster 1, night 1, wound_fever 1).

The scale wall moved on standing but not on the table: 15/20
villages reached national-or-better (vs 0/20 on raiddor's
competent bands), 1/20 reached wave 4, 0/20 reached the table or
a win. Belongseek play climbs the hierarchy; it does not seat
the table in 100 days. Arc II/III/IV, four-realm formation, trap
acquisition by source, counter discovery/counter-kill rate, and
young-link succession survival are not recorded in this corpus
and are not estimated here.

## Wall numbers (both bands, belongseek-nofeast)

National-or-better / table / wins: pilot 6/8 / 0/8 / 0/8,
confirm 9/12 / 0/12 / 0/12. Wave-4/5 unlocks: pilot 1/8, confirm
0/12. Wave reach, pilot: 9951: 1, 9952: 3, 9953: 3, 9954: 4,
9955: 3, 9956: 3, 9957: 3, 9958: 2. Wave reach, confirm: 9962: 1,
9963: 3, 9964: 2, 9965: 3, 9966: 2, 9967: 3, 9968: 2, 9969: 2,
9970: 1, 9971: 2, 9972: 3, 9973: 3.

## Village assessment (plain words)

Twenty villages, sixteen surviving the full 100 days — and the
four that didn't (9951 at day 26, 9953 at day 90, 9962 at day 33,
9970 at day 16) are the honest deaths that prove the horizon is
death-aware, not padded. The food story on these bands was never
hunger: nobody's ledger fails on food, and the villages that lost
the most people lost them to arenas and sickness, not to empty
shelves. What the villages looked like, up close: working pantry
economies where named villagers cook for the haven and work the
smoke racks — and, on top of that, villages that BOW. Where
competent villages sat in their haven and took the occasional
night raid, belongseek villages went out and joined things: they
bowed to a primary, paid a weekly tribute out of the pantry in
full view, answered demands and accords, took aid when a
neighbor walked in with pack-mules, and climbed — regional, then
national, then global standing on 15 of the 20 villages. The
tribute is not a tax the game hides: it is a named weekly payment
(usually 5,000 asked, 5,000–5,199 taken — the whole-unit overshoot
of the pantry's unit arithmetic), recorded with its caller, its
items, and its week. Who thrived and who died and why: the
surviving villages thrived on the same pantry competence plus
the hierarchy climb; the dead ones died young (days 16–33) before
any link could form, or late (day 90) after a long regional run —
death came from arenas, sickness, and violence, not from the
tributes, which cost about 5,000 kcal a week against pantries
holding hundreds of thousands. What knowledge/capabilities were
missing: nothing the ledger can see — every pantry flow on these
bands is now named, including all six non-raid caller frames.
Blanks filled: (1) the other _removePantryKcal callers are now
exercised and named (115 pilot + 182 confirm non-raid records,
zero unknown); (2) the ledger closes with all callers counted on
two bands (named 0, generic 0.077%/0.016%, dried 0.29%/0.20%);
(3) the post-snapshot adjustment for non-raid callers is exercised
(9957 day-100 national-choice take). Documented, not fixed: no
game-code change was made (DIAG only); the one failing generic
row per band (pilot 9954 +3,700, confirm 9970 +416) is a small
open remainder, not a verdict input; the treeline give/overrun
path still never fired (holds succeeded cleanly on the census
band — a future band hunting give/overrun needs seeds where
holds fail).

## Sense transcript (SENSE-TESTING LAW — meaning, not just counts)

The judged corpus's say recorders capture smoke-rack and treeline
lines only, so tribute/demand/accord payment narration is NOT in
the captured transcript — that is a recorder-scope fact, not a
claim that the game is silent. A same-seed, same-policy sense
probe (raw belongseek policy, no capture instruments — its days
differ from the corpus by a couple of days, so these lines are
mechanism evidence, not corpus quotes) shows the game DOES
narrate these payments, with names, amounts, and consequences:

Seed 9952 probe, day 20: "⛓️ Earl brings it home: Haven bows to
Emberhold — one organization, them primary. Tribute: 5,000
kcal/week. The relationship starts at trust 30. Everything from
here is earned." / "Tribute paid: 5,000 kcal walks out of the
pantry toward Emberhold. The relationship holds." Day 21:
"Tribute paid: 5,100 kcal walks out of the pantry toward
Emberhold. The relationship holds." Day 21, aid: "🏃 Ruth of
Emberhold walks into Haven unannounced, pack-mules behind.
'Heard your bins are echoing. Emberhold has grain to spare —
2,745 kcal, no tribute, no ceremony. Say the word.'" / "(Aid
offer — accept or refuse from the beats row. Refusing costs
pride: trust -3.)" Day 29: "Tribute paid: 5,040 kcal walks out
of the pantry toward Emberhold." Day 30: "Took Aid from
Emberhold (dried)."

These lines are coherent with the ledger on the same mechanism:
the 5,000 ask with 5,040–5,100 takes IS the ledger's whole-unit
overshoot; the trust-30 start and the "relationship holds" tail
are social consequences, not flavor; the aid arrival is a person
with a name and pack-mules, not a menu. The villagers acted like
people around the payments: they bowed, paid, offered, and
accepted, and the game said so out loud. Nothing robotic, static,
or repeated was found in the sampled dialogue; the one repetition
(the 5,000-ask/5,0xx-take shape) is the mechanism's honest
whole-unit arithmetic, not a dialogue loop. The corpus's own
captured lines corroborate the world around the payments: the
Codex raid-demand lines ("📓 Codex: Jesse of The Hungry Road
raids Haven's treeline — demands ~2,000 kcal.", seed 9952 day
32) and the treeline hold standoffs on the census band ("You walk
out to the treeline with everyone who can hold a spear.
'Ellis,' you call. 'Count them.' They count. You count them
back.", treeline 9502 day 36) are generated from the situation,
not a static menu.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered metric worked as written and the verdict
  follows from it: pilot naming, pilot legs, and confirm legs all
  meet their bars with no re-scoring, no dropped families, no
  threshold changes. The named-row rule did its job in both
  directions: on the pilot it correctly withheld the rate
  judgment (2 rows < 8 — pooled-only, passing at 0.000%), and on
  the confirm it judged the rate (8 rows, 8/8 at 100%).
- Bar lesson, new in this arm: the named focal filter yields few
  rows on tribute-heavy bands (2 pilot rows) because belongseek
  villages pay out so much that most named families sit under
  the 10,000-inflow filter. The pooled named bar still passed at
  exactly 0 on both bands, and the confirm band's 8 rows all pass
  — but a future prereg on a tribute-heavy band should consider
  whether the 10,000 filter still measures what it claims, or
  whether it filters out exactly the families the band moves.
  Proposed for the NEXT run, not this one: report the sub-filter
  named rows (inflow 1,000–10,000) as an observation alongside
  the focal rows.
- Instrument lesson 1 (proof fix, see "Proof"): the tuple
  heuristic for disjointness misfires on busy bands. The
  same-event test replaces it; line-level overlaps are INFO.
  Any vendor copying this proof forward should copy the
  same-event version, not the tuple version.
- Instrument lesson 2: the post-snapshot adjustment for non-raid
  callers is now exercised (9957 day-100 national-choice take),
  closing the "unexercised adjustment" note that raiddor left for
  the raid door. The raid door's own post-snapshot adjustment
  remains unexercised (no raid dated == a closing-snapshot day
  on either band) — the sibling raidday100 arm is hunting exactly
  that, and this arm does not claim it.
- Instrument lesson 3 (observation, not a verdict input): a
  same-seed, same-policy run WITHOUT the capture instruments
  produced tribute days differing by a couple of days from the
  instrumented corpus (probe day-20 tribute vs corpus day-22
  accord/day-23 tribute on seed 9952). All judged comparisons
  in this arm are within-instrument (on vs off det-gate, legs on
  one corpus), so this does not touch the verdict — but it means
  instrumented trajectories are not raw-policy replays, and a
  future arm that needs exact replay should find which
  instrument step shifts the days (candidates: the daily snapshot
  call, the say wrappers, the death wrapper — all read-only by
  design, so the shift mechanism itself is worth a look).
- Infrastructure notes (loud): (1) the first pilot sweep's two
  background sessions died mid-run with only 2/8 seeds written
  (no crash output; the 2 files were intact) — the remaining 6
  seeds were re-run deterministically on the same base, and the
  pilot corpus is complete. A later background session also went
  "unknown" in the session list while its OS processes kept
  running to completion — session-list loss does not imply
  process death; check the OS processes before assuming a run
  died. (2) After the prereg commit, the safe-commit
  index-clobber variant hit again (prereg staged-deleted in the
  main index) — repaired per the documented recipe
  (update-index --add --cacheinfo from the HEAD blob), verified
  git status clean of the clobber + git diff HEAD empty +
  hash-object match, before proceeding. (3) Box load ran 9–13
  on 2 CPUs through the run (sibling loops) — per-seed wall time
  stretched to ~4–10 min; no sweep output was ever written to
  /tmp; all corpora live under
  evidence/2026-10-27/sim-raidcallers-b-corpus/,
  sim-raidcallers-b-confirm-corpus/, and the census subdirs in
  this worktree. (4) No EPERM flap blocked this run's writes
  after the prereg; the sweep's in-memory pending-flush path was
  never needed.
- Balanced panel (MEASUREMENT.md §15): NO comparison exists —
  this arm changes no lever and no game code, so there is no
  before/after to panel. scripts/balance-panel.js is a
  before/after observer instrument (baseline vs candidate runs);
  it does not apply to a measurement corpus. The det-gate is the
  instrument before/after (raidcallers on vs off, byte-identical
  on non-raid fields). Not forced, not faked.

## Reproduction check (this run)

- Prereg committed BEFORE any judged sweep (b2fabea68); judged
  sweeps ran only after that commit. Census sweeps ran before
  the prereg commit (screening, not judged — stated in the
  prereg's "Census basis" section).
- Proof scripts/test-raidcallers-b.js GREEN on the pilot corpus
  (39 checks) and GREEN on the confirm corpus (39 checks, after
  the proof fix; the pre-fix confirm run's single FAIL is
  documented above, not hidden).
- No jest was run (nothing to test in jest — the proof is node,
  not jest). No [needs-eyes]: this lands a measurement, not a
  player-visible change.
- No game-code change: zero src/js files committed. Files in this
  arm's commits: prereg commit b2fabea68 (prereg only) and the
  evidence commit (evidence file + pilot corpus + confirm corpus
  + census corpora + 5 scripts: sweep, analyze, test, trace,
  stockdoors-capture-raidcallers).

## Convergence line

converged — the other-callers ledger blank is closed: 297
non-raid records across 6 caller frames on two independent bands,
zero unknown callers, both bands' ledgers closing under the
caller-complete boundary definition (named 0, generic 0.077% /
0.016%, dried 0.29% / 0.20%), with the post-snapshot adjustment
exercised. Remaining ledger work is remainder-hunting (the one
failing generic row per band) and the treeline give/overrun path
(which never fired), not investigation of the caller set.

## Verdict (judged against the pre-registered bar, not re-scored): GO

Pilot names every fired non-raid caller (115 records, 0 unknown)
and closes with all callers counted (named pooled 0, generic
87.5% / 0.077%, dried 0.29%); the fresh confirm band meets the
same bars with all rates judged (named 8/8, generic 11/12 at
91.7% / 0.016%, dried 0.20%) and 182 more named non-raid records.
The _removePantryKcal door is no longer a raid-only story: on a
regional-politics band it is mostly tributes, demands, accords,
choices, and aid — and the books balance with all of them counted.
