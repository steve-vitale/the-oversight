# sim-wavegate-a — wave-unlock gating census on the win-pursuit stack (DIAG ONLY)

Run: Loop A worker, axis scale-onramp, run fleshout-20261031T1415Z
(resume of stranded fleshout-20261031T1107Z arm — see Resume note).
Worktree branch: sim-wavegate-a.
Base anchor: worktree HEAD at sweep time 4c92bbb04 (journey-deepening
r75 invite-accept arm, measurement only) — the prereg's base pin, and
every judged JSON carries `anchorCommit: 4c92bbb042d4`. This base is
NEWER than the heraldcontact sweep anchor (7c3295767); trajectories
on the same seeds may therefore differ from the heraldcontact census.
This arm judges ONLY its own corpus on THIS base; heraldcontact
numbers are quoted as prior-base context, never as current data.
Pre-registration: evidence/2026-10-31/sim-wavegate-a-prereg.md
(written BEFORE any judged sims; judged against it below).
Instrument: scripts/policies/wavegate-diag.js (WAVEGATE=1, NEW) +
scripts/wavegate-sweep-20261031.js + scripts/wavegate-analyze-20261031.js.
Proof: scripts/test-wavegate-20261031.js — 27 checks green (26
synthetic + 1 corpus leg that re-derives the band verdict gates
from the judged corpus: 19 usable, national 15, table 7, won 6,
wave4 11, wave5 0, road 10, stall 5, medianSurvival 137,
decomp 15/15, derived 19/19).
Corpus: evidence/2026-10-31/perseed-wavegate/leadfeast/
s<seed>.json (19 seeds, all non-empty) + evidence/2026-10-31/
wavegate-analysis.json (analyzer output).
No game code changed. No policy file edited. No gate threshold
moved. No [needs-eyes] (measurement only, nothing player-facing).
Panel (§15): NOT APPLICABLE — single-base DIAG measurement, no
before/after comparison exists in this arm; none fabricated (same
declaration as heraldcontact-a). The det leg compares recorder-on
vs recorder-off trajectories of the SAME stack; it is a neutrality
proof, not a panel comparison, and its numbers never enter the
census tables.

## Verdict: DIAG-GO

Judged exactly against the prereg's band verdict:

- Usable judged seeds: 19/19 (pilot 8 + confirm 11, the prereg's
  fixed band — no band-shopping, no substitutions).
- Completeness: 15/15 national seeds fully decomposed (blocker at
  nationalDay AND at run end, road/stall classification, milestone
  ordering row). Every national seed has an unbroken row series in
  the prereg's operational sense: rows == harness daily calls on
  all 19 seeds (rows.length == hashes.length everywhere, verified
  seed by seed), rows sorted, recorder errors 0. See the row-series
  disclosure below — it is stated here, not buried, because the
  prereg's clause (a) says "from day 1" and the recorded series
  starts at scholar day 2.
- Cross-check (i): derived final unlockedWave == post-run engine
  unlockedWave() on 19/19 seeds.
- Cross-check (ii): det-gate byte-identical hashes + identical end
  fields on both det seeds (87104, 87127) — PASSED, see Det-gate.
- Cross-check (iii): recorder errors 0 on all 19 seeds.
- Usable judged seeds 19 >= 8. Verdict sections (a)–(d) all present
  below.
- Pilot gate: 8/8 pilot seeds fired with zero recorder errors,
  per-seed JSONs valid, decomposition complete on every national
  seed in the pilot (all 8 pilot seeds reached national) — pilot
  GO, confirm spend justified. The pilot was NOT vacuous and NOT
  instrument-failed.

### Row-series disclosure (read this before reusing clause (a))

On every one of the 19 seeds the row series starts 2, 2, 4, 4, 5,
6, … — scholar day 1 is never observed at a daily call, day 3 is
never observed (the engine day clock jumps 2→4 at run start), and
days 2 and 4 are each recorded twice. This is NOT a recorder drop:
rows == hashes on all 19 seeds, i.e. the recorder captured every
single harness daily call exactly once; the day numbers are the
engine clock as observed at daily-call moments, and the clock
itself jumps. Two consequences, both verified, not assumed:

1. No judged value can move on this pattern. Milestones use
   first-occurrence on scholar.day, and the earliest milestone on
   the whole band is wave-4 day 43 (87123); the earliest national
   day is 77. Days 1–4 contain no milestone, no blocker change,
   and no ordering pair on any seed. Duplicate same-day rows do
   not move first-occurrence days.
2. The pattern is deterministic: the 87104 re-run to a scratch dir
   is byte-identical to its judged JSON (see Determinism leg), so
   the pattern reproduces exactly rather than varying by run.

Strict-reading note, stated plainly so the coordinator can
overrule: if clause (a) is read as requiring calendar-day 1..N
coverage of the row series, this arm would be DIAG-NO-GO on that
clause alone — and every classified value in sections (a)–(d)
would be unchanged either way. The verdict above follows the
arm's own analyzer operationalization (sorted, complete per daily
call) plus this verified read-only explanation, which is exactly
the exception the prereg's NO-GO clause names ("completeness <
100% with no read-only explanation" — here an explanation exists
and is verified). Metric-review item 1 carries the rewording for
the next arm.

## Answer in one paragraph

(a) What gates wave unlock on this stack is, in order: first the
wave-2 ledger rung (4 wave-2 kill points, day 25+), then the
veterans bar of the readiness gate (1 living roster member with a
wave-3+ kill). Standing itself never binds at national: every one
of the 15 national seeds sits at raw standing >= 122 on its
national day, because 3 seasoned regional links alone pay 102
against a t4 of 100 — bonds clear the bar before blood or bread
are ever needed. At nationalDay the binding component is
W3-RUNG-BAR on 7/15, DEFER4 on 4/15 (all four short on veterans
only — armor, weapons, and tricks all pass), and already-UNLOCKED
on 4/15. (b) National-without-wave-4 is the NORMAL road at the
moment of reaching national (11/15 pre-wave-4 at nationalDay) but
it is usually a road, not a stall: 10 of the 15 national seeds
later unlock wave 4, and the 5 that never do are EXACTLY the 5
seeds that never, on any day of their run, hold a living veteran
— no veteran, no wave 4, ever, on this stack. The 5 stalls end as
2 cap-survivors, 2 lesser wins (won at national without wave 4 —
a completed road of a different kind, labeled WIN-LESSER, not a
failure), and 1 village lost. (c) Ordering is clean: national
before wave 4 on 6/10 seeds where both exist, wave 4 before
national on 3, same-day on 1; national before table on 6/6 and
before win on 6/6; wave 4 before table on 5/5 and before win on
4/4; wave 5 never (0/19). Pre-wave-4 fractions among national
seeds: 73.3% (11/15) at nationalDay, 33.3% (2/6) at tableDay,
33.3% (2/6) at winDay, 33.3% (5/15) at run end.

## (a) Seed-by-seed gate decomposition

Milestones are first days in the daily rows; null = never.
Blocker taxonomy per prereg (W3-RUNG-BAR = day >= 25 but wave-2
ledger points < 4; DEFER4 = raw >= 100, gated held at 99, readiness
short; UNLOCKED = wave 4 already open). At-national detail gives
standing split (war/dip/plenty), earned counts (warPts/links/
feasts), wave-2 points vs bar, and the wave-4 readiness bars
(counts vs demand armored 3 @ P>=10 / armed 5 / tricks 3 /
veterans 1).

| Seed | Nat | W4 | Table | Win | End (days, rank) | Blocker@nat | Blocker@end | Road/stall |
|---|---|---|---|---|---|---|---|---|
| 87104 | 78 | — | — | — | survived (201, national) | W3-RUNG-BAR | DEFER4 | STALL-SURVIVED |
| 87109 | 112 | — | 120 | 121 | over-other (121, global) | DEFER4 | DEFER4 | STALL-WIN-LESSER |
| 87115 | 148 | 148 | — | — | survived (201, national) | UNLOCKED | UNLOCKED | ROAD |
| 87119 | 87 | — | — | — | village-lost (167, national) | W3-RUNG-BAR | W3-RUNG-BAR | STALL-VILLAGE-LOST |
| 87120 | 77 | 144 | 145 | 146 | over-other (146, global) | W3-RUNG-BAR | UNLOCKED | ROAD |
| 87121 | 77 | 139 | 143 | 143 | over-other (143, national) | W3-RUNG-BAR | UNLOCKED | ROAD |
| 87123 | 77 | 43 | — | — | village-lost (96, global) | UNLOCKED | UNLOCKED | ROAD |
| 87124 | 77 | — | 164 | 164 | over-other (164, global) | W3-RUNG-BAR | DEFER4 | STALL-WIN-LESSER |
| 87126 | 116 | 143 | 144 | 144 | over-other (144, national) | DEFER4 | UNLOCKED | ROAD |
| 87127 | 77 | 152 | — | — | survived (201, national) | DEFER4 | UNLOCKED | ROAD |
| 87132 | 87 | 60 | — | — | village-lost (102, global) | UNLOCKED | UNLOCKED | ROAD |
| 87134 | 77 | 95 | 137 | 137 | over-other (137, global) | W3-RUNG-BAR | UNLOCKED | ROAD |
| 87135 | 77 | 90 | — | — | village-lost (110, national) | DEFER4 | UNLOCKED | ROAD |
| 87137 | 91 | 82 | — | — | village-lost (136, global) | UNLOCKED | UNLOCKED | ROAD |
| 87140 | 77 | — | — | — | survived (201, global) | W3-RUNG-BAR | W3-RUNG-BAR | STALL-SURVIVED |

Blocker counts at nationalDay (denominator 15): W3-RUNG-BAR 7,
DEFER4 4, UNLOCKED 4, STANDING-BELOW 0, W3-RUNG-DAY 0.
Blocker counts at run end (denominator 15): UNLOCKED 10, DEFER4 3,
W3-RUNG-BAR 2, STANDING-BELOW 0.

### At-nationalDay detail (the binding component, with counts)

- 87104 (nat 78): uw 2, raw 222, gated 99, hold defer4;
  war 0 / dip 102 / plenty 120; warPts 0, links 3, feasts 6;
  p2 3/4 (one short); rd4 armored 8, armed 11, tricks 19,
  veterans 0 — short [veterans] only, but the rung binds first
  (blocker W3-RUNG-BAR: rung checked before readiness).
- 87109 (nat 112): uw 3, raw 242, gated 99, hold defer4;
  war 0 / dip 102 / plenty 140; warPts 0, links 3, feasts 7;
  p2 6/4 (rung met); rd4 7 / 8 / 26 / veterans 0 — short
  [veterans] only. Blocker DEFER4.
- 87115 (nat 148 = w4Day, same day): uw 4, raw 152, gated 152,
  hold released4; war 50 / dip 102 / plenty 0; warPts 2, links 3,
  feasts 0; p2 11/4; rd4 10 / 10 / 27 / veterans 2 — all bars
  pass. The only national seed that unlocks wave 4 on its
  national day while currently ready (see ratchet note below).
- 87119 (nat 87): uw 2, raw 202, gated 99, hold defer4;
  war 0 / dip 102 / plenty 100; warPts 0, links 3, feasts 5;
  p2 1/4; rd4 2 / 3 / 14 / veterans 0 — short [armor, weapons,
  veterans]. Blocker W3-RUNG-BAR (rung first).
- 87120 (nat 77): uw 2, raw 142, gated 99, hold defer4;
  war 0 / dip 102 / plenty 40; warPts 0, links 3, feasts 2;
  p2 0/4; rd4 9 / 10 / 13 / veterans 0 — short [veterans] only.
  Blocker W3-RUNG-BAR.
- 87121 (nat 77): uw 2, raw 282, gated 99, hold defer4;
  war 0 / dip 102 / plenty 180; warPts 0, links 3, feasts 9;
  p2 2/4; rd4 3 / 8 / 12 / veterans 0 — short [veterans] only.
  Blocker W3-RUNG-BAR.
- 87123 (nat 77; w4Day 43, already open): uw 4, raw 352,
  gated 199, hold defer5; war 50 / dip 102 / plenty 200;
  warPts 2, links 3, feasts 10; p2 4/4; rd4 3 / 8 / 21 /
  veterans 0 at nationalDay — but the village HAD a veteran on
  day 43 (first ready day = first uw4 day = 43, vet 1 on the
  unlock row); the veteran died before day 77 and the peak
  ratchet holds wave 4 open. Blocker UNLOCKED (ratchet-held).
- 87124 (nat 77): uw 2, raw 262, gated 99, hold defer4;
  war 0 / dip 102 / plenty 160; warPts 0, links 3, feasts 8;
  p2 2/4; rd4 6 / 10 / 14 / veterans 0 — short [veterans] only.
  Blocker W3-RUNG-BAR.
- 87126 (nat 116): uw 3, raw 182, gated 99, hold defer4;
  war 0 / dip 102 / plenty 80; warPts 0, links 3, feasts 4;
  p2 5/4 (rung met); rd4 4 / 8 / 21 / veterans 0 — short
  [veterans] only. Blocker DEFER4.
- 87127 (nat 77): uw 3, raw 122, gated 99, hold defer4;
  war 0 / dip 102 / plenty 20; warPts 0, links 3, feasts 1;
  p2 4/4 (rung met); rd4 9 / 9 / 16 / veterans 0 — short
  [veterans] only. Blocker DEFER4. (Lowest national-day raw on
  the band, 122 — still above t4 on bonds alone.)
- 87132 (nat 87; w4Day 60, already open): uw 4, raw 457,
  gated 199, hold defer5; war 75 / dip 102 / plenty 280;
  warPts 3, links 3, feasts 14; p2 8/4; rd4 6 / 8 / 22 /
  veterans 0 at nationalDay — unlock row day 60 had vet 1;
  ratchet-held like 87123. Blocker UNLOCKED.
- 87134 (nat 77): uw 2, raw 202, gated 99, hold defer4;
  war 0 / dip 102 / plenty 100; warPts 0, links 3, feasts 5;
  p2 2/4; rd4 7 / 11 / 21 / veterans 0 — short [veterans] only.
  Blocker W3-RUNG-BAR.
- 87135 (nat 77): uw 3, raw 182, gated 99, hold defer4;
  war 0 / dip 102 / plenty 80; warPts 0, links 3, feasts 4;
  p2 4/4 (rung met); rd4 7 / 12 / 15 / veterans 0 — short
  [veterans] only. Blocker DEFER4.
- 87137 (nat 91; w4Day 82, already open): uw 4, raw 272,
  gated 199, hold defer5; war 50 / dip 102 / plenty 120;
  warPts 2, links 3, feasts 6; p2 8/4; rd4 5 / 7 / 17 /
  veterans 1 — all bars pass. Blocker UNLOCKED (genuinely ready).
- 87140 (nat 77): uw 2, raw 142, gated 99, hold defer4;
  war 0 / dip 102 / plenty 40; warPts 0, links 3, feasts 2;
  p2 1/4; rd4 6 / 11 / 12 / veterans 0 — short [veterans] only.
  Blocker W3-RUNG-BAR.

Two structural facts fall out of that table. First, dip is
exactly 102 (3 seasoned links x 34) on ALL 15 national seeds at
nationalDay, and raw is >= 122 on all 15 — so the t4 bar is
cleared by bonds before the village ever kills anything at
wave-3+. STANDING-BELOW is not just unobserved at nationalDay;
on this stack it is nearly unreachable there, because national
rank and 3 seasoned links arrive together. Second, war is 0 on
11/15 national seeds at nationalDay: blood (wave-3+ kills) is
the rare standing component, and veterans — which require a
wave-3+ kill by a LIVING roster member — are the scarce
consequence. At nationalDay, veterans = 0 on 13/15 seeds; the
two exceptions (87115 vet 2, 87137 vet 1) are the only two
currently-ready unlocks.

### The veterans law (the band's sharpest finding)

Across the full run history (every daily row, not just
nationalDay): the 5 STALL seeds (87104, 87109, 87119, 87124,
87140) NEVER hold a living veteran on ANY day (maxVet 0,
maxWarPts 0 — they never kill a wave-3+ monster at all, even
though 87104/87109/87124 unlock wave 3 and live with it for
101, 40, and 46 days respectively; 87119/87140 never even
unlock wave 3). The 10 ROAD seeds all hold a veteran at some
point, and 9/10 hold one on the unlock row itself. First-ready
day == first wave-4 day on 8/10; the two exceptions are 87115
(ready from day 136, but standing only cleared t4 on day 148
when its links seasoned — standing, not readiness, was last)
and 87126 (below). The correspondence is exact: 5/5
never-veteran seeds stall, 10/10 ever-veteran seeds road. That
is a census pattern, not a causal proof — the readiness gate
makes it causal by construction for the release itself (no
veteran, no release while raw >= 100), but WHY villages never
kill a wave-3 monster is a separate question this arm does not
answer: wave-3 monsters are in the pool (uw 3) on the stall
seeds, villagers fight and die against other things (see death
causes), and warPts stays 0. The next arm on this axis should
ask whether wave-3 fights are avoided, fled, or lost — the
recorder here counts kills, not encounters.

Same-day artifact (87126): the day-143 row shows peak 4,
gated 199, uw 4, but rd4 veterans 0 and ready false; day 144
shows veterans 1, ready true, warPts 2 (day 143 warPts 1). The
release and the releasing veteran's loss fall on the same day,
so the daily snapshot cannot order them; the peak ratchet holds
wave 4 open thereafter regardless. No derivation mismatch: the
final derived uw == engine uw on this seed like all others.

### Wave-5 blocker at run end (on the 10 national wave-4 seeds)

Demand wave 5: armored 4 @ P>=15, armed 6, tricks 3, veterans 2
(wave-4+ kills), plus t5 200 and wave-4 faced. Counts sum to 10
(the 11th wave-4 seed, 87103, is not national, so no blocker5
row is computed for it — see Non-national seeds).

- DEFER5 6: 87115, 87123, 87132, 87134, 87135, 87137 — raw >=
  200 (or capped >= 200) but readiness short. In every case
  veterans are short (0 or 1 vs demand 2); on 87115 and 87134
  veterans are the ONLY short bar (armor/weapons/tricks all
  pass at run end), while on 87123, 87132, 87135, and 87137
  armor and weapons have also fallen short as fighters died.
- W4-FACED 3: 87120, 87121, 87126 — wave 4 unlocked 1–4 days
  before the win (w4Day 144/win 146; 139/143; 143/144), so the
  village won before ever facing a wave-4 monster. The lesser
  win closes the wave-5 road before it opens — the same
  censoring flavor heraldcontact-a found for the omen clock.
- BELOW 1: 87127 — raw 147 < 200, w4faced true, rd5 short on
  veterans 0/2. The only wave-4 seed below the t5 bar; it is
  also the only wave-4 seed that survived to the cap un-won.
- CAP 0: the plenty cap never binds as the wave-5 blocker on
  this band (capped >= 200 wherever raw >= 200 except where
  defer5 already binds tighter — the cap hold needs capped <
  200 with raw >= 200, which no end row shows).
- Wave 5 unlocked: 0/19. No seed on this band reaches the
  Producers, by any route.

## (b) Road vs stall, with end states

- ROAD 10/15 national seeds: 87115, 87120, 87121, 87123, 87126,
  87127, 87132, 87134, 87135, 87137. Of these, 4 won (87120,
  87121, 87126, 87134 — all through the table, all after wave 4),
  2 survived to the cap (87115, 87127), 4 died (87123, 87132,
  87135, 87137 — all village-lost, all at wave 4).
- STALL 5/15: 87104 (survived, cap, wave 3), 87109 (WIN-LESSER,
  day 121, wave 3), 87119 (village-lost, day 167, wave 2),
  87124 (WIN-LESSER, day 164, wave 3), 87140 (survived, cap,
  wave 2). End states named, per prereg: stall is not a
  pejorative — the two lesser wins are completed roads.
- The stall set == the never-veteran set, exactly (see veterans
  law above). No stall seed is stalled on standing (stall-seed
  raw at nationalDay: 142–262; at run end: 202–402 — all far
  above t4); all five are stalled on the veteran bar (87119/
  87140 also still short the wave-2 rung at run end, p2 3/4
  both — the rung AND the veteran bar both unmet, with the
  rung binding first in the taxonomy).

So: national-without-wave-4 is the normal road AT nationalDay
but a minority outcome AT RUN END (5/15 still pre-wave-4 at end,
all 5 never-veteran). The scale wall on this stack is not
"villages can't reach national" (15/19 do) and not "standing is
too high" (bonds clear it) — it is "villages that never blood a
fighter against a wave-3+ monster never unlock wave 4, and
therefore never start the Herald omen, never face wave 5, and
either win lesser, endure, or die pre-Herald."

## (c) Milestone ordering + pre-wave-4 fractions

Ordering pairs (seeds where BOTH milestones exist; n stated):

| Pair | Before | After | Same day | n |
|---|---|---|---|---|
| national vs wave4 | national-first 6 | wave4-first 3 | 1 | 10 |
| national vs wave5 | 0 | 0 | 0 | 0 (wave5 never) |
| national vs table | national-first 6 | table-first 0 | 0 | 6 |
| national vs win | national-first 6 | win-first 0 | 0 | 6 |
| wave4 vs table | wave4-first 5 | table-first 0 | 0 | 5 |
| wave4 vs win | wave4-first 4 | win-first 0 | 0 | 4 |
| table vs win | table-first 2 | win-first 0 | same-day 4 | 6 |

Notes: the 1 same-day national/wave4 seed is 87115 (nat 148 =
w4 148). The 4 same-day table/win seeds won on their table day
(87121 table 143/win 143; 87126 144/144; 87134 137/137; plus one
more of the six — 87120 table 145/win 146 and 87124 table
164/win 164 are the table-first/same-day split: table-first 2
are 87109 (120/121) and 87120 (145/146); same-day 4 are 87121,
87124, 87126, 87134). Wave-4 days span 43–152; national days
span 77–148; national-seed table days span 120–164 (87103's
table day 71 is excluded here — it is not a national seed);
win days 121–164.

Pre-wave-4 fractions among national seeds (denominators stated;
0/0 would be n/a, never 100% — no 0/0 occurs here):

- At nationalDay: 11/15 = 73.3% (pre-wave-4: all except 87115,
  87123, 87132, 87137).
- At tableDay: 2/6 = 33.3% (pre-wave-4 at table: 87109, 87124 —
  exactly the two lesser wins; the other four table seeds had
  wave 4 by table day).
- At winDay: 2/6 = 33.3% (same two seeds).
- At run end: 5/15 = 33.3% (exactly the stall set).

## (d) Wall numbers on the judged band (19 seeds)

| Measure | Judged band |
|---|---|
| National reached | 15/19 (78.9%) |
| Table reached | 7/19 (36.8%; 6 national + 87103 regional) |
| Won | 6/19 (31.6%; all 6 national, all through the table) |
| Wave 4 reached | 11/19 (57.9%) |
| Wave 5 reached | 0/19 |
| Median survival | 137 days; max 201 |
| Herald omen stage 2 at end | 8 seeds (87103, 87115, 87123, 87127, 87132, 87134, 87135, 87137 — endOmenStage 2; see note) |
| Deaths (all seeds) | 622 total; combat 42.3%, villager combat 24.0%, the wild 14.3%, expedition 6.1%, starvation 2.4%, monster 2.3%, sickness 1.6%, rest < 1.5% each |

Note on the omen count: endOmenStage is a post-run snapshot
field, not a milestone; it is reported here as wall context
only, not as a judged census field (Herald contact is not this
arm's question — the omen-2 seeds above are the ones whose
stage-2 line has fired by run end; whether the Herald was ever
met is heraldcontact's question and is not re-judged here).

Scope note (not a gap to hide): the wavegate recorder measures
gate decomposition only. Arc reach (Arc II/III/IV), four-realm
formation, trap acquisition by source, counter discovery rates,
and young-link succession survival are NOT in this corpus — the
recorder does not read them, so this evidence reports them as
unmeasured, not as zero. Death-cause shares, wave reach,
national/table/win reach, and survival are measured above from
the corpus's own fields.

## Non-national seeds (4/19 — the band's other stories)

- 87103 (88d, village-lost, regional, wave 4 day 57, table
  day 71, never national, never won): the exception that
  sharpens the ordering table — wave 4 and the TABLE both
  reached without national rank. Scale rank and wave progress
  are decoupled in both directions: a village can be national
  at wave 2 and regional at wave 4. 39 deaths, combat-dominated
  (20 combat, 6 villager combat). Its tableDay is excluded
  from the national-seed fractions in (c) by definition.
- 87107 (111d, village-lost, village rank, wave 3, never
  national/table/win): 26 deaths (14 villager combat). A
  village that fought, reached wave 3, and died small.
- 87128 (22d, village-lost, village rank, wave 1): the
  shortest run on the band — 7 deaths (thirst 2, starvation 1,
  sickness 1, ambush 1, villager combat 1, the wild 1). Died
  before any gate question could arise; no beats at all.
- 87138 (24d, village-lost, village rank, wave 2): 11 deaths,
  6 of them starvation. The band's only starvation-dominated
  run — the early game still kills by hunger on some seeds,
  while the late game kills by combat (starvation is 2.4% of
  all deaths but 6/11 here).

## Village assessment — what the villages looked like

The band splits into three kinds of village. The enduring
nationals (87104, 87115, 87127, 87140 — all 201-day cap
survivors): quiet or war-worn, national, and — except 87115/
87127, which eventually unlocked wave 4 — permanently
pre-Herald. 87140 is the quietest (11 deaths, national,
global rank at end, wave 2, no omen): longevity and scale with
no titan chapter at all. 87104 is its louder twin (17 deaths,
national, wave 3, gated at 99 at run end on the veteran bar
while plenty piled to 300). The winners (87109, 87120, 87121, 87124,
87126, 87134): all national, all through the table, but split
by the wave-4 line — two won lesser without it (87109 day 121,
87124 day 164, both gated at 99 on veterans at the win), four
won after it (87120, 87121, 87126, 87134, each unlocking wave 4
within days of the win — 87126 winning the day after its
day-143 release). The fighters who died at wave 4 (87123,
87132, 87135, 87137): the band's bloodiest villages (53, 36,
27, 39 deaths), all unlocked wave 4 early (days 43, 60, 90, 82)
and all died village-lost with the fifth draft still held
(defer5 at end on all four). Who thrived: villages that
blooded a fighter early (87123's veteran on day 43, 87132's on
day 60) opened the whole wave-4 road — and still died of it.
Who died and why: combat dominates everywhere late (66%+ of
all deaths are combat/villager-combat/monster/arena/ambush);
starvation is a footnote except on the two 22–24-day runs.
What knowledge/capabilities were missing: not gear (armor/
weapons/tricks pass on nearly every national seed), not
standing (bonds clear t4), not feasts (plenty runs to 300) —
a single living veteran. The blank this arm fills is the
measurement of exactly which bar binds, seed by seed: the
veterans bar, downstream of wave-3+ kills that 5/15 national
villages never record once.

## Sense-testing read (SENSE-TESTING LAW)

The recorder captures hold/release beat lines (sysSay wrap).
Judged on the 19 seeds' beat lines (234 total across the band;
counts per seed in the JSONs' `beats` arrays):

- The hold beats ARE honest and actionable — they name the
  short bars with counts vs demand in the village's own terms:
  "blood your fighters (0 of 1 veterans)", "armor the village
  (2 of 3 fighters armored); put weapons in hands (3 of 5
  armed); blood your fighters (0 of 1 veterans)". A village
  hearing them knows exactly what is short. On 87119 the beat
  tracks the bars moving (armed 3→4→3→2→3 across reminders)
  as fighters live and die — the narration follows the
  village, it does not freeze.
- But the beats are RUNG-BLIND, and that is a genuine sense
  gap: on W3-RUNG-BAR seeds the beat names veterans while the
  binding blocker is one more wave-2 kill point. A village
  short on wave-2 kills (87104: p2 3/4 at nationalDay) hears
  "blood your fighters" — but a veteran requires a wave-3+
  kill, and wave 3 is not unlocked yet. The beat points at a
  bar the village cannot work on until it clears the rung the
  beat never mentions. The hold beat is honest about readiness
  and silent about the ledger rung; a village following it
  literally would chase an impossible kill.
- The beats are also REPETITIVE to a robotic degree: the same
  7-day reminder line fires up to 21 times on one seed (87140:
  21 hold lines, all "blood your fighters (0 of 1 veterans)"
  with no change for 140+ days). Honest, but a villager would
  not say the same sentence 21 times without variation,
  escalation, or resignation. The cadence (initial + 7-day
  reminder) is doing its job as a signal; as dialogue it is a
  loop, not a voice.
- The bread-cap line ("not bought with bread") NEVER fired on
  this band — legitimately, not as an instrument gap: the
  plenty cap never binds as the wave-5 blocker on any end row
  (CAP 0/10), so there was no cap hold to narrate. Had it
  fired without a cap hold, that would have been the finding;
  its absence matches the data.
- Release beats ("RATINGS ARE UP! … Wave N talent has been
  released") fire on unlock days and match the derived unlock
  days — the narration and the gate agree wherever both exist.
  The omen-stage-2 "Sound the call" promise is NOT judged
  here: the recorder's needle list does not capture omen
  lines, and Herald contact is heraldcontact's question. The
  carried note stands (a promised arrival that never arrives
  on located-but-unfaced seeds) but this arm adds no new omen
  transcript evidence for it.

## Det-gate (trajectory neutrality, prereg requirement)

- ON vs OFF on 87104 and 87127 (same stack, same seeds, scratch
  dirs, never the judged corpus): hashes IDENTICAL (200 vs 200
  on both seeds), end fields IDENTICAL (gameDays, won, national,
  table, maxWave, endScaleRank, endReason) on both seeds.
  DET-GATE PASSED. The recorder does not move trajectories.
- ON-87104 for the det pair was reused from the determinism
  scratch run (byte-identical to the judged JSON — see below),
  not re-run: same script, same env, same base, verified
  identical file. ON-87127 and both OFF legs were run fresh
  for the det.
- Deviation from the prereg letter, documented: the prereg
  names scratch dirs under /tmp and a script
  `scripts/wavegate-det-20261031.js`; the arm's det script is
  `scripts/wavegate-det-20261031.sh` (shell + node compare, same
  logic), and the det legs ran to worktree scratch dirs
  (`scratch-wavegate-det/`, deleted before commit) instead of
  /tmp — because the handoff's /tmp recovery files had already
  been sibling-cleaned and /tmp proved no safer than the
  worktree during this run's flap (see below). The requirement
  (scratch, never the judged corpus; byte-identity + end-field
  comparison) is preserved exactly; only the scratch location
  differs.

## Determinism leg (corpus trust, prereg requirement)

- Pilot seed 87104 re-run to a scratch dir is BYTE-IDENTICAL
  to its judged JSON (241,631 bytes both, `cmp` clean).
  The judged corpus is reproducible on this base.

## Resume note (stranded arm, not a restart)

This arm was stranded by the Loop A 1107Z timeout with 10 real
JSONs and 9 zero-byte confirm JSONs in the judged corpus. The
handoff's /tmp recovery files were verified GONE (sibling
cleanup wiped /tmp/wavegate-retry, /tmp/wavegate-det,
/tmp/wavegate-pilot-analysis.json, /tmp/wavegate-copy.js) and
were NOT hunted further. The resume re-verified the corpus
from the prereg (recount: pilot 8 real + confirm 87121/87124
real = 10; zero-byte confirm 9 = 87103, 87107, 87123, 87126,
87128, 87132, 87134, 87135, 87138), proved determinism on
87104, ran the det-gate, and ran the 9 missing confirm seeds
fresh with the existing scripts. No judged JSON was edited,
smoothed, or backfilled from any other base or band: every
corpus file carries anchorCommit 4c92bbb042d4 and instrument
wavegate-v1.

### The EPERM flap during this resume (infrastructure, loud)

The container EPERM flap hit this run hard, in three places:
(1) the det OFF-87104 write failed 4x in a row (worktree AND
/tmp staging — a 0-byte file each time), then held for 18+
minutes across all direct retries; (2) registry heartbeat
writes EPERM'd twice before landing on the third attempt
(heartbeat_at now current at commit time — re-check at merge);
(3) worktree probe writes EPERM'd during the bad stretch.
Recovery that worked: a resilient writer added to
scripts/wavegate-sweep-20261031.js (post-run write ONLY — the
sim is already computed, so retrying the write cannot move any
trajectory): up to 180 attempts x 10s, full-size verification,
0-byte file deleted on final failure so no 0-byte file ever
stands as data. With that writer, OFF-87104 landed on the next
run and all 9 confirm seeds wrote first try. The writer change
is tooling-only, committed with this arm, and does not alter
the JSON content (same stringify output — the determinism leg
and the corpus leg both verify content, not write mechanics).
No ref surgery was performed; no lock was forced. If the flap
returns during the coordinator's merge, the recovery is: wait
for a clear window, re-run the affected sweep leg, verify file
sizes > 0 before trusting anything.

## Metric review (for the NEXT run — mandatory section)

1. The derived gated total matched the engine on 19/19 seeds
   (cross-check (i)), and the det-gate held on both seeds
   (cross-check (ii)) — the derivation mirror (holds, cap,
   defer4/defer5, ratchet, w3 rung, w4-faced) is validated on
   real census data, not just synthetic fixtures. No
   derivation mismatch on any seed, including the 87126
   same-day artifact (which is a snapshot-ordering limit, not
   a mirror error).
2. Clause (a) needs rewording for the next arm: "unbroken daily
   row series from day 1" should read "one row per harness
   daily call, sorted, no recorder drops (rows == daily calls),
   first-occurrence milestones well-defined." The current
   wording invites a false NO-GO on the engine day clock's
   2→4 jump, which no recorder can fix (the clock jumps
   before any daily call observes day 3). The analyzer's
   `daysOk` (sorted only) already implements the corrected
   reading; the prereg prose should catch up. The proof test's
   corpus leg now machine-checks the observed pattern
   (first row day 2, first five days 2,2,4,4,5) so a future
   change to the pattern fails loudly instead of silently.
3. Classification rules exercised vs unexercised: exercised —
   W3-RUNG-BAR, DEFER4, UNLOCKED (wave 4); DEFER5, W4-FACED,
   BELOW (wave 5). Unexercised on real data — STANDING-BELOW
   (wave 4, at nationalDay AND at end: 0/15 both), W3-RUNG-DAY
   (all nationalDays >= 77, so the day floor never binds
   here), CAP (wave 5: 0/10). A future arm that wants those
   branches needs a different band (earlier national days for
   W3-RUNG-DAY; a low-bond village for STANDING-BELOW; a
   high-bread low-readiness village for CAP) — or it should
   say those branches are structurally rare on this stack
   rather than untested.
4. The pilot gate behaved: 8/8 fired, 0 errors, all 8 national,
   decomposition complete — and the confirm added real
   information (4 non-national seeds, 2 early deaths, the
   regional-table exception 87103) that the pilot alone would
   have missed. The "confirm = all remaining selected seeds"
   rule (heraldcontact's metric-review lesson) worked as
   written: 11 confirm, no fixed-12 forcing.
5. Analyzer gap, noted not hidden: `decompComplete` checks
   sortedness, not the calendar-day pattern — that is why the
   row-series disclosure lives in prose + the proof test
   instead of the analyzer. If a future arm wants the analyzer
   to enforce a series shape, it must define the shape around
   the harness's actual daily-call behavior (item 2), not
   around calendar days.
6. Det-script naming: the prereg names a `.js` det script that
   does not exist; the arm's `.sh` script implements the
   prereg's det logic exactly. A future prereg should name the
   `.sh` (or the script should be renamed) to avoid a
   phantom-file hunt.

## Backlog items (for the coordinator — NOT chased mid-run)

1. Why wave-3+ kills never happen on stall seeds: 3 of the 5
   stall seeds unlock wave 3 and live with it for 40–101 days
   with warPts 0, and the other 2 never unlock wave 3 at all —
   wave-3 monsters are in the pool (or one rung away) but never
   killed.
   Measurement question: are wave-3 fights avoided, fled, or
   lost? Needs an encounter (not kill) instrument on the wave-3
   pool; this arm's recorder counts kills only.
2. Hold-beat rung blindness: the readiness hold beat names
   veterans while the binding blocker is the wave-2 ledger rung
   (see Sense-testing). Design question: should the hold beat
   name the rung when the rung binds, or is readiness-only
   narration intended? Steve-call if it changes narration.
3. Wave-5 wall, measured: 0/19 unlock; the binding components
   at end are DEFER5 (6/10, veterans 0–1 vs 2) and W4-FACED
   (3/10, wins within days of wave-4 unlock). The wave-5
   question for the next arm is whether veterans-2 is
   reachable at all on this stack (max veterans observed on any
   seed: 3 on 87115, 2 nowhere else at end) or whether the
   w4-faced + defer5 combination makes wave 5 a post-win
   curiosity.
4. The regional-table exception (87103): table reached at
   regional rank without national. If the table is supposed to
   require national standing (deedGateReady scale clause),
   this seed is a counterexample worth a targeted check — or
   the table's scale requirement is looser than the national
   framing suggests. Flagged, not judged, here (scale-gate
   adjudication is outside this arm's wave-unlock question).
