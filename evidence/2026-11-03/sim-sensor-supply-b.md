# sim-sensor-supply-b — PILOT-GO: THE ENVELOPE RULE SURVIVES A SECOND, COMBINED KNOWN-COLLAPSING SUPPLY (7/7, ALL LEGS PASS) — AND ADDS NO NEW COLLAPSING VILLAGE, BY CONSTRUCTION

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T080700Z,
arm sim-sensor-supply-b, axis food-economy. Worktree
sim-sensor-supply-b, branch sim-sensor-supply-b.
MEASUREMENT ONLY: zero src/js changes, zero policy-default flips, zero
edits to any existing script or policy file. New files only, all named
*-sensor-supply-b.*. The gatecover tracer, the gatediseng analyzer, and
the competent policy are REUSED VERBATIM, never edited. This worker
does NOT push, bump, verify live, merge, or rebase — the coordinator
lands the branch. This pilot does NOT deploy (e*).
Status to coordinator: committed in worktree, pending coordinator merge.

## Verdict: PILOT-GO — judged exactly against the prereg bars

Prereg: evidence/2026-11-03/sim-sensor-supply-b-prereg.md, commit
0204751317f6c5f6b0d0c61fc3de099e0f769e80, written and committed BEFORE
any judged leg (tools commit 60150d3c40514f18a847aaa4aefaded10de3e4f6
after the prereg commit and before any judged application; proof test
20/20, pure synthetic series, no judged seeds, changes no prereg word;
the reused proof tests were also re-run green on current base before
the pilot: gatediseng 21/21, gatediseng-confirm 11/11).

| leg | result | bar | outcome |
|---|---|---|---|
| Count gate: still-collapsing seeds | 7 (of 7 candidates) | >= 4 | PASS |
| Excluded candidates (fresh non-collapsing) | 0 | reported, never a failure | — |
| Fire: (e*) fires on still-collapsing seeds | 7/7 | ALL | PASS |
| Tie: lead_e >= lead_c | 7/7 | ALL | PASS |
| Strict: lead_e > lead_c | 7/7 | >= 50% | PASS |
| Lead-one: lead_e >= 1 | 6/7 = 85.7% | >= 75% | PASS |
| Cost (pilot screen): (e*) fires on cost survivors | 0/4 | <= 1/4 | PASS |
| Cross-check: independent (c) vs reused (c), first firing | 0 mismatches on 12/12 legs | Any mismatch = INSUFFICIENT-DATA | PASS |
| Tracer verification | rows == daysAlive on 12/12, first try | Failure = INSUFFICIENT-DATA | PASS |
| Determinism spot-check | 3/3 byte-identical re-runs (79006, 79064, 81053) | Report match/mismatch | PASS |
| Base-equality control | 12/12 fresh lines BYTE-IDENTICAL to archived lines | Drift with membership preserved = report, judge on fresh | HELD — zero drift |
| Membership change on cost seeds | 0 newly collapsing | Any = INSUFFICIENT-DATA | PASS |

PILOT-GO means, per the prereg: the shape survives a second, different
known-collapsing supply (the combined judged collapsers of the three
prior runs); it earns a fresh-band confirm whose collapsing supply is
fixed in THAT run's prereg. It does NOT deploy (e*), and no deploy
claim may cite this pilot alone — the supply is known-collapsing by
construction, so this pilot is shape-survival evidence, not fresh
evidence. Read the honesty paragraph below before citing any number
from this file: the 7 still-collapsing seeds are the SAME villages as
the prior runs, re-run fresh, not 7 new villages.

## Q — THE PILOT, SEED BY SEED (12 legs, 30d competent, fresh)

Reference day = first starvation death day. Lead = reference day -
firing day. No-fire counts as worse than any firing for lead-vs-(c).

Still-collapsing seeds (7):

| seed | end | ref | (c) firing | lead_c | (e*) firing | clause | lead_e | beats (c)? |
|---|---|---|---|---|---|---|---|---|
| 79006 | lost day 24 | 23 | — (never) | — | 22 | E2-cliff | 1 | YES (never -> 1) |
| 79019 | lost day 25 | 20 | 19 | 1 | 18 | E1-envelope | 2 | YES (+1) |
| 79031 | lost day 22 | 20 | — (never) | — | 20 | E2-cliff | 0 | YES (never -> 0) |
| 79064 | lost day 26 | 25 | 20 | 5 | 19 | E1-envelope | 6 | YES (+1) |
| 80008 | lost day 20 | 18 | 17 | 1 | 16 | E2-cliff | 2 | YES (+1) |
| 80016 | lost day 29 | 28 | 26 | 2 | 25 | E1-envelope | 3 | YES (+1) |
| 81053 | lost day 30 | 26 | 26 | 0 | 24 | E1-envelope | 2 | YES (+2) |

How the shape earns each seed, in one line each (all firing patterns
identical to their archived runs — the fresh lines are byte-identical,
so no pattern changed):
- 79006 (cliff): stand-down day 21 at 7,560, one fall to 4,585 day 22
  — E2 fires on the 35%-below-peak drop where (c) could never get its
  third fall. Lead 1.
- 79019 (bounce): stand-down day 15 at 9,850, day-16 rise to 9,910
  raises the peak instead of restarting the count; E1 fires day 18.
  Lead 2.
- 79031 (cliff, death-knell): stand-down day 19 at 6,950, one fall to
  2,500 day 20 — E2 fires the same evening people start starving
  (lead 0). It beats (c)'s silence but is not "in time" in any
  playable sense; it is the single lead-one miss (6/7 at lead >= 1),
  named here, not hidden. The shape covers the seed; it does not
  save it.
- 79064 (bounce): stand-down day 15 at 8,853, two-evening recovery to
  10,284 raises the peak; E1 fires day 19. Lead 6, the best margin
  in the family.
- 80008 (cliff): stand-down day 14 at 9,900, falls to 8,878 day 15 and
  4,980 day 16 — E2 fires day 16, one evening earlier than (c)'s
  day 17. Lead 2.
- 80016 (envelope): stand-down day 22 at 9,100, rise to a 9,700 peak
  day 23, falls days 24-25 to 7,100 — E1 fires day 25, one evening
  earlier than (c)'s day 26. Lead 3.
- 81053 (envelope, day-30 boundary): stand-down day 21 at 7,300,
  falls days 22 and 24 around a day-23 bounce to 7,050 — E1 fires day
  24, two evenings before the first starvation death, while (c)
  waits for its third consecutive fall and fires day 26 itself, the
  death-knell evening (lead_c 0). Lead 2.

Cost survivors (4, fresh): 79001, 79002, 79003, 79004 — all survived
30d, none newly collapsing. (e*) fires on 0/4; (c) fires on 1/4
(79001, day 22 — the same reading as the sensorredesign pilot's fresh
line, preserved byte-identically). The (c)-vs-(e*) survivor overlap on
the cost seeds is therefore empty on the (e*) side: no seed fires
under (e*), so there is no overlap to report beyond (c)'s single
79001 firing. This is a screen (n = 4), not a rate — the full
survivor-cost leg (>= 12 survivors) stays deferred to the confirm,
per the prereg.

Context seed (1, NOT judged): 81042 — fresh line byte-identical to
archived: village-lost day 26, ZERO starvation deaths, both rules
fire ((c) day 24, (e*) day 26 E2-cliff, pantry 521). It remains an
"other" outcome under the judged definition, exactly as the prereg's
flag-discrepancy resolution derived from the archived corpus. Its
firings are context only and touch no leg.

Secondary (reported, NOT judged): still-collapsing seeds with
lead_e == 0: 1/7 (79031, named above). Mean lead_e on
still-collapsing seeds: 2.29 (n = 7). Mean lead_c over its FIRING
seeds only: 1.8 (n = 5) — this secondary mean favors (c) less than
the pilot's did, but the pilot's warning still applies: (c)'s mean
excludes its two silences, so the pairwise legs, not the means, are
the comparison. Fresh-vs-archived firing comparison: identical on
7/7 candidates, 4/4 cost seeds, and the context seed (byte-identical
lines entail identical firings).

## Base-equality control + substrate drift (loud, as prereg required)

ZERO drift. All 12 fresh lines are byte-identical to their archived
corpus lines (candidates vs their source runs' corpora, cost seeds
vs the sensorredesign pilot corpus, 81042 vs the sensorconfirm2
corpus). This is the cleanest base-equality result in the sensor
line: the sensorredesign pilot found 1 drifted seed in 8 (79001 vs
the older collapseband screen line); this pilot finds 0 in 12
against the more recent archived lines. No membership changed, no
exclusion was triggered, no leg was judged on a diverged trajectory.
The full-policy chain was also verified as the prereg required: the
reused tracer builds its policy as Object.assign({}, competent,
{daily wrapper}) (trace-gatecover-b.js lines 71-72) and passes it to
runDays (line 106), and sim-harness.js calls policy.setup (line 418),
policy.upkeep (line 557), and policy.daily (line 574) — the FULL
policy object (setup + upkeep + daily), never a bare {daily}. The
proof test asserts competent.setup/upkeep/daily are functions
(20/20, including that check).

## Flag-discrepancy resolution (closed)

The prereg's resolution stands on fresh evidence too: 81042's fresh
line is byte-identical to archived, still village-lost day 26 with
no starvation death, still `collapsed: true` / `collapsing: false`
in the analyzer's terms. The summary flag that "flags 81042 as
collapsing" is the `collapsed` flag (village-lost, any cause); the
judged `collapsing` flag was false all along, and the judged
sensorconfirm2 verdict counted only 81053. There is no discrepancy
left once the two flags are distinguished — and this pilot's prereg
definition (village-lost + starvation death, window-inclusive)
makes the distinction definitional for the next run as well. The
day-30 boundary sensitivity is also closed for this supply: under a
strict daysAlive < 30 reading the supply would be 6 candidates, not
7 (81053 drops); under the prereg's inclusive definition it is 7.
All legs pass under the inclusive definition; the reader who prefers
the strict reading can recompute from the table above (drop the
81053 row: fire 6/6, tie 6/6, strict 6/6, lead >= 1 5/6 = 83.3% —
still above the 75% bar, cost unchanged). The verdict does not turn
on the boundary here, but the definition is now fixed either way.

## Reachability + wall numbers (measured in-window; 30d limit stated)

A 30d pre-seat window CANNOT measure national / table / wins — those
are late-game states, and this pilot carries no such fields. NO wall
movement is claimed. In-window, pilot supply: 4/12 survived 30 days
(median daysAlive 27.5, max 30); still-collapsing 7/12 (by supply
design, not a rate); wave reach max 3 (3/12 reach wave 3, 12/12 reach wave 2, 9/12
peaking at wave 2); waves 4-5 not reached in 30 days (expected —
early window).
Arc II/III/IV, regional -> national, table, win flag: NOT REACHED IN
WINDOW (0, as expected — not a rate claim). National / table / wins:
0 in-window (stated, not a comparison).
Deaths across the 12 legs: 246 total — villager combat 146, combat
18, sickness 12, expedition 11, the wild 10, monster 9, a wound that
wouldn't close 6, ambush 4, starvation 26, and 4 singletons (the Union
Rep, mosquito, a dog-shaped silence at the treeline, dehydration).
The 26 starvation deaths split across the 7 still-collapsing seeds
plus 1 on cost survivor 79003 — the recurring shape of a village
that starves people and lives.

## Sense test (SENSE-TESTING LAW: (e*) firing evenings, fresh lines, judged)

(i) 79019, day 18 (E1, pantry 7,060, streak 6, lead 2): the evening
speaks the thin-pack voice — "You keep a day's food (270 kcal) —
nothing extra for the pantry this time." A warning here lands on
the thinnest pack line yet, two evenings before anyone starves, in
words matching the evenings around it. Noticing in time.
(ii) 79064, day 19 (E1, pantry 8,140, streak 1, lead 6): "You keep a
day's food (90 kcal) — nothing extra for the pantry this time."
plus "The pantry is in the hall. Your hands are not." — the
thinnest pack line on the seed to that point, six days before
starvation. Noticing early, in its own thin-pack words.
(iii) 80008, day 16 (E2, pantry 4,980, streak 5, lead 2): the same
voice, "You keep a day's food (360 kcal) — nothing extra for the
pantry this time." beside "1 unprocessed haul onto the counter —
the clock is ticking." The store halved in one evening and the
village's own words already say it kept only a day's food.
Noticing in time.
(iv) 79006, day 22 (E2, pantry 4,585, streak 4, lead 1): ZERO
pantry/hunger lines across all 20 evening lines — the cliff evenings
are silent, exactly as the sensorredesign pilot found. A warning on
day 22 would NOT match surrounding words, because there are none;
it would be the only pantry voice in the cliff, breaking a silence
rather than echoing a voice. The number is true (store halved,
streak 4); the voice fit is absent. One evening before starvation
is thin rescue either way.
(v) 79031, day 20 (E2, pantry 2,500, streak 2, lead 0): the hunger
voice IS speaking — "Hunger gnaws. The pack is thin — work the
green, haul it back, get it named at camp. That's the whole game."
beside the 1,350-kcal thin-pack line — but it speaks on the very
evening two people starve. A warning here lands alongside the hunger
voice, not ahead of it: noticing at the moment of death. The sense
judgment matches the number (lead 0): real, but tardy.
(vi) 81053, day 24 (E1, pantry 5,199, streak 5, lead 2): NO
pantry-specific line in any of the 14 evening lines; the evening's
voice is leadership strain — "Enough," Katarina says. "I want a say
in how this village runs. A real say." and "Why are YOU giving
orders?" Katarina doesn't raise their voice. That's worse. A
warning here reads as noticing in time by the numbers (two evenings
early), but only if framed as the village store's fall — never as
personal hunger, since no line that evening names the store. The
sensorconfirm2 framing constraint stands.
(vii) Villagers act like people in the surrounding transcripts
(sampled, not just counted): gossip by the fire that mutates across
retellings ("It's barely the same story now. That's what fires
do."), counter-learning told at the fire (Nightlight, Flashbulb
Moth), leadership challenges, task assignments (fish, cook). The
collapse evenings are not robotic — they are quiet, hungry, or
fractious in ways that match the pantry numbers. What was missing
on the cliffs was a warning voice, and (e*) supplies one (late on
79031, one evening early on 79006, two evenings early on 81053).

## Balanced panel (section 15)

No panel compare is fabricated, per the prereg's inapplicability
declaration (same reasoning as the pilot and both confirms): this
arm changes NO game code, runs NO lever, and its primary metrics are
within-trajectory instrument diagnostics (would-fire overlays on
identical evening series), not panel metrics. The tables above are
reported directly in the evidence file instead, on identical seeds
and identical trajectories.

## Metric review

(1) THIS PILOT ADDS NO NEW COLLAPSING VILLAGE, AND MUST NOT BE
    POOLED AS IF IT DID. The 7 still-collapsing seeds are the same
    villages as the pilot (4), first confirm (2), and second confirm
    (1), re-run fresh and byte-identical. Pooling them with the
    prior runs (e.g. "14/14 collapsing seeds fire") would
    double-count the same trajectories. The honest sentence is:
    "(e*) survives every known-collapsing supply it has been run
    against (pilot 4/4, confirms 2/2 and 1/1 on fresh bands, supply
    7/7 combined) and has never failed a collapsing leg — but the
    only FRESH collapsing villages ever observed are the 3 from the
    two confirms, and 3 seeds cannot carry a confirm." The next run
    must still be a confirm with a collapsing supply fixed in ITS
    prereg — this pilot does not substitute for one.
(2) THE LEAD-ONE LEG HELD WITH ONE DEATH-KNELL TO SPARE (6/7 vs a
    75% bar = 5.25, i.e. 6 needed at n = 7 under the ceil rule).
    Had one more seed fired at lead 0, the leg would have failed
    (5/7 = 71.4%). The lead-0 gap is not closed: 79031 still fires
    at lead 0 on every re-run, because its cliff empties the store
    on the starvation evening itself. No rule that reads evening
    pantry can warn earlier on that shape without an intraday read
    or a morning signal — that is a stated limit of the evening
    instrument, not a reason to relax the leg.
(3) COST ON THIS SUPPLY IS A SCREEN, AND THE SCREEN AGREES WITH
    THE FRESH-BAND COST PICTURE IN DIRECTION ONLY. 0/4 fresh cost
    survivors firing is consistent with the fresh confirms' cost
    (18.2% then 11.1%, pooled 13.2% over 76 survivors) but proves no
    rate. The confirm's full cost leg (>= 12 survivors) remains
    owed and is not approximated by this pilot.
(4) ZERO DRIFT IS A FINDING, NOT JUST A CONTROL PASS. The
    sensorredesign pilot's 79001 drift (day-8 divergence across a
    base move) raised the worry that archived trajectories go stale
    across bases. This pilot's 12/12 byte-identical result bounds
    that worry: across the base moves since the three prior runs,
    none of these 12 trajectories moved at all. Drift remains
    possible (it happened once), but it is not the norm — and the
    base-equality control step is what lets a future arm tell the
    difference.
(5) THE CROSS-CHECK IS NOW A REAL TWO-IMPLEMENTATION CHECK, NOT
    JUST A PLUMBING PASS. Prior arms compared the thin analyzer's
    (c) — imported from the reused analyzer — against the reused
    analyzer, which can only catch wiring slips. This arm's thin
    analyzer additionally reimplements (c) independently from the
    prereg definition and reports agreement: 12/12 legs agree. A
    future arm may keep either form, but should not describe the
    import-only form as an independent check.
(6) No metric, threshold, seed, leg, collapse definition, or rule
    definition was changed mid-run. Prereg committed (02047513)
    before any judged leg; the proof test (20/20) ran after the
    prereg commit and before any judged application, uses no judged
    seeds, and changes no prereg word (one test expectation was
    corrected before the tools commit — a day-12 (c) expectation
    that the stretch rule excludes, day 13 being the correct first
    eligible evening — with both (c) implementations agreeing at
    day 13; no prereg word changed); the pilot verified rows ==
    daysAlive on all 12 legs first try; the independent (c) agrees
    with the reused (c) on all 12 legs; determinism re-runs matched
    byte-identically on 3/3 legs. The verdict is judged only
    against the prereg header.

## Village assessment (plain words)

Twelve villages, seven of them dying of hunger — but these are
villages we already knew: the four from the first dying band, the
two from the first fresh band, the one from the second. Re-run on
today's game they die on exactly the same evenings, in exactly the
same ways, down to the last line of dialogue — nothing in the game
has moved under them since they were last measured. On all seven,
the new rule speaks before or on the evening people starve, and on
six of the seven it speaks at least a day early — a day earlier than
the old rule on every single one, including the village where the
old rule waited until the death evening itself. On the seventh, it
speaks on the death evening: late, but no longer silent, where the
old rule said nothing at all. The four villages that live hear
nothing from the new rule. Nothing here reaches national, the
table, or a win — that wall was never this run's question, and it
did not move. The blank filled: the rule's shape holds together
across every dying village ever found for it, combined into one
supply, with no drift, no exclusion, and no failed leg. What it
still owes is the thing no re-run of old villages can give it — a
fresh band's dying villages, found by a supply rule fixed before
judging, before anyone claims this rule is safe to deploy.

## Findings for the coordinator (to append to the backlog)

- (e*) FIXED-SUPPLY PILOT-GO (combined known-collapser supply, 30d
  competent, fresh re-run, current base): 7/7 still-collapsing
  (no exclusions), fire 7/7, tie 7/7, strict 7/7, lead >= 1 6/7
  (only 79031 at lead 0, the known death-knell), cost screen 0/4,
  cross-check 0/12 mismatches, tracer 12/12 first try, determinism
  3/3 byte-identical. Earns a fresh-band confirm with a supply fixed
  in ITS prereg; does NOT deploy (e*); no deploy claim may cite
  this pilot alone.
- ZERO SUBSTRATE DRIFT ON THIS SUPPLY: 12/12 fresh lines
  byte-identical to archived lines (candidates, cost seeds, and
  81042). Bounds the sensorredesign pilot's drift worry: drift
  happened once (79001 vs the older screen line) but is not the
  norm across recent base moves.
- 81042 FLAG DISCREPANCY CLOSED: `collapsed: true` (village-lost,
  any cause) vs `collapsing: false` (no starvation death) — the
  judged definition counts only 81053 from the second-confirm band.
  Fresh re-run byte-identical, still "other", both rules firing
  (context only). Day-30 boundary now fixed as window-inclusive;
  verdict does not turn on it here (strict reading: 6/6 fire,
  5/6 lead >= 1, still above bar).
- NO-NEW-VILLAGE HONESTY NOTE: the 7 supply seeds are the same
  villages as the prior runs (pilot 4 + confirm 2 + confirm2 1),
  re-run fresh — do NOT pool them with prior runs as independent
  evidence. Fresh collapsing villages ever observed remain the 3
  from the two confirms.
- LEAD-0 GAP UNCHANGED: 79031 still fires at lead 0 on every re-run;
  an evening-pantry instrument cannot warn earlier on a cliff that
  empties on the starvation evening itself. The lead >= 1 leg held
  with one seed to spare (6/7 vs 75% bar).
- SENSE FIT, CARRIED: thin-pack voices on the in-time firings
  (79019/79064/80008), silent cliff on 79006 (0 pantry/hunger lines
  in 20), death-knell on 79031, store-framing constraint on 81053
  (no pantry line in 14 lines; leadership strain instead).

## Infrastructure notes (for the coordinator)

- PREREG-COMMIT + TOOLS-COMMIT INDEX CLOBBER (same known class):
  after commits 02047513 and 60150d3c the main index showed the
  committed files as staged deletions alongside the worktree copies.
  Repaired both times via git update-index --add --cacheinfo from
  the HEAD blobs, then verified tracked status clean and worktree
  hashes match HEAD. The commits themselves were correct
  throughout.
- FULL `git status` (with untracked scan) STALLS on this worktree (as
  in prior gatediseng arms); the tracked-only `git status --porcelain
  --untracked-files=no` returns in ~1s and was used for all
  verification.
- PILOT CLEAN, FIRST TRY EVERY LEG: all 12 legs verified on first
  try (rows == daysAlive each); no EPERM-flap retry was needed, no
  leg was re-run for judging. Per-seed tracer cost ran slow under
  sibling load (~7 min wall for the 12-leg sweep; determinism
  re-runs ~2.3 min for 3 legs). Determinism re-runs (79006, 79064,
  81053) matched byte-identically.
- check.js --quick NOT re-run: zero src/js, zero green-list files on
  this arm; nothing here touches the runtime.

## Files

- Prereg: evidence/2026-11-03/sim-sensor-supply-b-prereg.md
  (commit 02047513, before any judged leg)
- Proof test: scripts/test-sensor-supply-b.js (20 pure checks, no
  judged seeds; commit 60150d3c)
- Thin analyzer: scripts/analyze-sensor-supply-b.js (imports the
  reused analyzer for judged (c); adds an independent (c) for the
  cross-check, the (e*) rule, the still-collapsing exclusion, and
  the pilot verdict; commit 60150d3c)
- Evidence: evidence/2026-11-03/sim-sensor-supply-b.md (this file)
- Corpora: evidence/2026-11-03/sim-sensor-supply-b.jsonl (12 lines,
  seeds 79006/79019/79031/79064 + 80008/80016 + 81053 + 79001/79002/
  79003/79004 + 81042, fresh on current base),
  evidence/2026-11-03/sim-sensor-supply-b-summary.json (thin-analyzer
  pilot summary + verdict),
  evidence/2026-11-03/sim-sensor-supply-b-sweep.log (per-seed tracer
  stderr),
  evidence/2026-11-03/sim-sensor-supply-b-detcheck.log (3/3
  byte-identical determinism re-runs)
- Reused verbatim, never edited: scripts/trace-gatecover-b.js,
  scripts/analyze-gatediseng-b.js, scripts/policies/competent.js
- Consumed by this run (no longer fresh): none — the pilot re-runs
  already-consumed seeds by design (identical-seed before/after);
  no fresh band was screened.
