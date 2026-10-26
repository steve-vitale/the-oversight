# sim-wave3bar-a — measure the wave-3 bar as second blocker (axis scale-onramp)

Run: flesh-out loop A, 2026-10-26, arm sim-wave3bar-a.
DIAG ONLY — zero src/js changes, zero default flips, no edits to
any existing policy, sweep, summary, or check file. New files only:
a new recorder (scripts/policies/wave3bar-diag.js), a new sweep
(scripts/test-wave3bar-sweep.js), a new proof test
(scripts/test-wave3bar-a.js), this evidence file, and the new
per-seed corpus. scripts/test-hunttable-sweep.js and every
existing policy are read, never edited. The hunttable corpus is
NOT re-judged here; it is used only for the control comparison,
reported plainly, never reconciled silently.

## PRE-REGISTRATION (binding, fixed by the arm brief BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md (manifest), docs/TABLE.md
  (lesser seat = waves faced 4/4/3 distinct, 2+ contests, 2+
  crises, scale >= regional, stage >= 2, food-thesis deeds
  sentimentTaught + feastSurgeUsed), docs/MONSTER-WAVES.md
  (wave law; deed feed = real blow-by-blow fights, fled or
  won; villager field fights count exactly like the player's).
- Context read first and VERIFIED from the file, not trusted
  blindly: evidence/2026-10-26/sim-hunttable-a.md. Its
  hunt-band collapse (seeds 73901–73908, anchor vs
  driveoff-clean hunt columns) leaves a second, independent
  blocker on 73903/73904: the wave-3 bar never lands (final
  hunt w3 = 2 of 3 on both seeds, vs 5 and 3 on the anchors),
  and anchor 73905's own stall misses ONLY the wave-3 bar
  (final w3 = 1 of 3, surge met day 27). This arm measures
  that bar precisely; it does not re-derive the surge
  collapse.
- COMPOSITION (new file only): scripts/test-wave3bar-sweep.js,
  two columns on the same band 73901–73908, 180d death-aware
  horizon (dead villages stop; 180 is the cap, not a fixed
  horizon), one seed per exec call, current base (worktree
  HEAD, recorded below):
  - anchor: plain tableseat-nowait (substrate LEANLINKRESCUE=1,
    TABLESEATNOWAIT=1, scripts/policies/tableseat-nowait.js)
    + the new wave-3 recorder.
  - hunt: driveoff-clean shape EXACTLY as hunttable
    (FEASTDRAWCLEAN=1, tableseat-nowait substrate,
    COMPETENT_SEEK_FIGHTS left at default ON, feastdraw +
    nonworldkill recorders installed as the freshtransient
    sweep does) + the same wave-3 recorder.
  Substrate digests (md5): competent.js
  e310bf2fb8f71bd571ed0956ccc7f51f, feastdraw-driveoff-clean.js
  219873acc996e2c85c42556e5917d548, tableseat-nowait.js
  ab7c9814a2988c2f89fd7c317f8d7a45.
  The wave-3 recorder is PURE READS: a pure observer around
  Game.recordDeedFight (calls the original exactly once, in
  the same position, records only day / monster id / wave /
  stack-derived route class / current feast-draw id) plus
  pure-read daily snapshots of
  state.scholar.prog.deeds.wavesFaced (never deedState(),
  which would CREATE pg.deeds) and the live tableSeat()
  pricing. No game call is added, removed, or reordered; no
  RNG is consumed; no game state is written.
  Route classes: 'fieldFight' (villager blow-by-blow fight),
  'startCombat' (player TB fight, not the draw),
  'startCombat-draw' (player TB fight against the current
  feast draw), 'recordWaveKill' (kill feed as first record),
  'other' (reported, never smoothed). First call per monster
  id wins — the deed feed is keyed by id, so the first face
  is the route that earned the count.
- DIAG-GO BAR (binding): (i) bar definition quoted from
  code; (ii) w3 state tabulated for all 5 collapsed seeds x
  both columns, plus the 73905 control; (iii) independence
  shown explicitly on BOTH 73903 and 73904 (counterfactual
  table, not assertion); (iv) recorder-neutrality det-gates
  PASS on pilot seed 73901 before the band is spent
  (reproduce the hunttable anchor row on 73901 exactly
  before judging anything). Pilot gate: det-gates + 1 seed
  first, then the full 8-seed band on both columns.
  Horizon: death-aware, same as hunttable; never a fixed
  200d without the death-tail rule. If any bar fails,
  DIAG-NO-GO with the failing leg named — do not re-judge
  the hunttable corpus.
- SENSE plan: read the transcript around one blocked seed's
  stall and judge in plain words whether the stall reads as
  an earned wall (the village knows what it lacks) or an
  invisible one. Report, don't decide.
- Balanced-panel note: scripts/balance-panel.js cannot
  ingest per-seed recorder corpora (known limitation,
  carried from hunttable) — do NOT fabricate panel inputs.
  The sweep-compare table is the comparison of record. Do
  NOT run telemetry-check on recorder rows and do NOT roll
  any baseline.
- METRIC REVIEW section below is mandatory
  (docs/MEASUREMENT.md §14): pre-registered metrics bind
  the run — a miss is NO-GO, never re-scored against a
  friendlier metric mid-run.

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-NO-GO — leg (iii) fails on 73904, leg (iv)'s cross-base leg fails on base drift

The measurement itself is complete and clean: the bar is
defined from code, tabulated on all 16 rows, the
counterfactual is shown explicitly on 73903, and both
recorder det-gates pass exactly. But the pre-registered
bar as written is NOT met, and the misses are reported
as misses, not reinterpreted away:

- Leg (iii) FAILS on 73904: on the current base, hunt
  73904 MEETS the wave-3 bar (final w3 = 4 of 3, bar day
  82, the same four monsters on the same days as the
  anchor). There is no wave-3 block on 73904 to prove
  independent — the seat is blocked there by the surge
  alone. Independence is shown explicitly on 73903 only.
- Leg (iv) SPLIT: the operative clause PASSES — both
  det-gates MATCH exactly (plain vs wrapped, 29/29 days,
  11/11 deaths, on both columns). But the parenthetical's
  cross-base check does NOT reproduce the hunttable
  anchor row on 73901: this base gives 29 days / 11
  deaths where hunttable's base gave 23 days / 8 deaths.
  The drift is proven instrument-independent: hunttable's
  OWN det-gate, run on this HEAD, also gives 29/11 (see
  the control section). The cause class is identified:
  the only src/js changes between hunttable's base
  (be8541647) and this HEAD are conversation.js (the
  social-r55 main-menu 'others' exemption) and corpses.js
  (the journey-deepening r51 falsy-0 range fix) — small
  behavior changes that shift trajectories. The drift is
  a property of the base, not of this arm's instrument.
- The 73905 control case FLIPPED on the current base:
  anchor 73905 now SEATS (day 171, w3 bar day 171, surge
  day 27) — it no longer demonstrates surge-met /
  w3-missing / seat-none. The control as briefed does not
  exist on this base (no row in the band has surge met +
  w3 missing + seat none). This is a control casualty of
  the same base drift, reported here, not smoothed.

The NO-GO is about the pre-registered bar as written on
the current base — NOT about the measurement quality.
Every number below is measured on this arm's own corpus
and stands on its own: the bar is exact, 73903's
independence is proven, and the driveoff-causation
question is answered. The coordinator's next run should
re-derive its collapsed seeds and its control case on
its own base before fixing seed numbers into a bar
(see Metric review).

## DETGATES — BOTH RECORDERS MOVE NO PLAY (pilot seed 73901)

- Anchor: plain tableseat-nowait vs tableseat-nowait +
  wave-3 recorder: days 29/29, gameDays 29/29, won 0/0,
  deaths 11/11, tsNationalDay null/null — MATCH.
- Hunt: plain driveoff-clean (+recorders) vs driveoff-clean
  + wave-3 recorder: days 29/29, gameDays 29/29, won 0/0,
  deaths 11/11, tsNationalDay null/null — MATCH.
Artifacts: perseed-sim-wave3bar-a/detgate-anchor-73901.json
(+ detgate-anchor.json copy) and detgate-hunt-73901.json
(+ detgate-hunt.json copy). Both columns' bands were spent
only after their own det-gate passed, per the
pre-registration. The anchor/hunt trajectory differences
below are the POLICY difference plus base drift, not
instrument perturbation.

## (a) THE BAR, QUOTED FROM CODE

src/js/table.js `tableSeat()` (the lesser seat; the full
seat's `deedGateReady()` in src/js/progression.js uses the
same count with bars 5/5/4/3/2):

> "const faced = (d && d.wavesFaced) || {}; ... for (const
> mid of Object.keys(faced)) { const w = faced[mid] | 0;
> if (w === 1) w1++; else if (w === 2) w2++; else if
> (w === 3) w3++; ... } ... const lesser = w1 >= 4 &&
> w2 >= 4 && w3 >= 3 && contestsN >= 2 && crisesN >= 2 &&
> scaleOk && stage >= 2 && foodDeeds;"

So the wave-3 bar is: **w3 >= 3, where w3 = the count of
DISTINCT monster ids in `deeds.wavesFaced` whose stored
wave is 3.** Facing counts; killing does NOT matter.
The feed is src/js/progression.js `recordDeedFight()`:

> "recordDeedFight: a real blow-by-blow fight happened
> against this monster. Keyed by monster id (distinct
> monsters), value = wave."

fed by three wraps: `startCombat` (the player's fight —
fleeing still counts, "you stood on the grid with it";
a refused fight records nothing), `recordWaveKill` (any
real kill, player or villager), and `fieldFight` with
outcome vKill / mFlee / vFlee (villager patrol / wild /
expedition fights; 'evade' and 'vDie' record nothing).
Canon agrees: docs/TABLE.md — "waves faced: 4/4/3
distinct (w1/w2/w3) — blow-by-blow, from deeds.wavesFaced
(recordDeedFight feed)"; docs/MONSTER-WAVES.md — deed-feed
dedupe is by monster type, "villager + player facing the
same type = one count."

The wave-3 roster (src/data/monsters.json, wave = 3, 9
types): redactor (The Redactor), gavel (Gavel),
focus_group (The Focus Group), spool (Spool), chorus_line
(Chorus Line), terms_of_service (The Terms of Service),
callback (The Callback), buffering (Buffering), ad_break
(Ad Break). Any 3 of these 9, faced blow-by-blow, meet
the bar. The threshold is 3, not a specific trio.

Proof of the definition on the corpus: on all 16 rows,
the seatDetail w3 recomputed from the row's own
finalFaced map equals the engine's stated w3 exactly,
and the daily trajectory's final w3 set equals the
first-face-day keys (proof test leg (i) PASS).

## (b) THE TABLE — w3 state, all collapsed seeds x both columns, + 73905 control

Face day = the deed-call day (exact); bar day = the first
daily snapshot showing w3 >= 3 (the following dawn; it
can lag the face day by the daily boundary). FF =
fieldFight (villager patrol/wild fight), SC = player
startCombat (world/patrol encounter), DRAW = player
startCombat against the current feast draw. X = never.

### Anchor column (plain tableseat-nowait)

| seed | days | won | seat | w3 bar | surge | w3 faces (day:route) | final w3 |
|---|---|---|---|---|---|---|---|
| 73901 | 29 | 0 | none | X | X | — | 0/3 |
| 73902 | 101 | 1 | 99:lesser | 99 | 44 | chorus_line 83:FF, buffering 89:FF, callback 98:FF | 3/3 |
| 73903 | 90 | 1 | 85:lesser | 85 | 28 | callback 73:FF, buffering 83:FF, ad_break 85:FF, redactor 87:FF | 4/3 |
| 73904 | 94 | 1 | 93:lesser | 82 | 93 | ad_break 55:FF, spool 56:SC, gavel 82:SC, redactor 91:FF | 4/3 |
| 73905 | 172 | 1 | 171:lesser | 171 | 27 | terms_of_service 139:DRAW, ad_break 150:DRAW, focus_group 171:DRAW | 3/3 |
| 73906 | 138 | 0 | none | 50 | X | callback 30:FF, buffering 42:FF, redactor 49:FF, spool 65:FF, terms_of_service 98:FF, chorus_line 111:SC | 6/3 |
| 73907 | 165 | 1 | 164:lesser | 164 | 109 | focus_group 149:DRAW, redactor 163:FF, spool 164:SC | 3/3 |
| 73908 | 176 | 1 | 171:lesser | 171 | 107 | buffering 131:DRAW, ad_break 140:SC, focus_group 171:FF | 3/3 |

Anchor band: won 6/8, median 138d, natEver 7/8, table
6/8, entered 6/8, Arc IV 6/8, wave-4 4/8, wave-5 0/8,
deaths 223, starvation 5. Route census (first faces):
fieldFight dominates early (73902 3/3 FF, 73903 4/4 FF),
draws become a w3 source late (73905 3/3 DRAW — every
one of its w3 faces is a faced feast draw).

### Hunt column (driveoff-clean)

| seed | days | won | seat | w3 bar | surge | w3 faces (day:route) | final w3 |
|---|---|---|---|---|---|---|---|
| 73901 | 29 | 0 | none | X | X | — | 0/3 |
| 73902 | 180 | 0 | none | 85 | X | redactor 61:FF, buffering 67:FF, callback 85:FF, chorus_line 100:FF, focus_group 120:SC, spool 121:SC, ad_break 136:FF | 7/3 |
| 73903 | 180 | 0 | none | X | X | spool 134:FF, buffering 150:FF | 2/3 |
| 73904 | 180 | 0 | none | 82 | X | ad_break 55:FF, spool 56:SC, gavel 82:SC, redactor 91:FF | 4/3 |
| 73905 | 133 | 1 | 133:lesser | 133 | 97 | chorus_line 74:FF, terms_of_service 84:SC, spool 133:FF | 3/3 |
| 73906 | 138 | 0 | none | 50 | X | callback 30:FF, buffering 42:FF, redactor 49:FF, spool 65:FF, terms_of_service 98:FF, chorus_line 111:SC | 6/3 |
| 73907 | 180 | 0 | none | 135 | X | redactor 124:FF, callback 134:FF, chorus_line 134:FF, spool 176:FF | 4/3 |
| 73908 | 180 | 0 | none | 175 | X | redactor 173:FF, ad_break 173:FF, spool 175:SC | 3/3 |

Hunt band: won 1/8, median 180d, natEver 7/8, table 1/8,
entered 1/8, Arc IV 1/8, wave-4 5/8, wave-5 0/8, deaths
240, starvation 5. The hunt column's ONLY winner, 73905,
is a current-base surprise: it marks its surge on day
97 WITHOUT facing a draw (all 8 of its draws are driven
off) — the surge was spent by a non-draw feasted fight
inside the day-96 feast window, the exception path
hunttable proved on hunt 73902's old base. The surge
CAN be earned without the draw fight; on 73903 it never
is, in any of 11 feast windows.

### The missing third face on hunt 73903

Faced: spool (day 134, fieldFight), buffering (day 150,
fieldFight). Missing: ANY third distinct wave-3 type —
the 7 unfaced are redactor, gavel, focus_group,
chorus_line, terms_of_service, callback, ad_break. There
is no single "the missing monster"; the bar wants
variety, and this village met only two kinds in 180
days. Its w3 trajectory: 0 until day 134, 1 at 134, 2 at
150, then flat to the 180 cap — 30 days of nothing after
the second face.

## (c) INDEPENDENCE — the counterfactual table

The lesser seat is a conjunction. Hold the surge
hypothetically met and ask whether the seat still
fails, and on what alone. "Other bars" = w1>=4, w2>=4,
contests>=2, crises>=2, rank>=regional, stage>=2,
sentimentTaught met. Final detail is the hunt column's
final tableSeat() pricing.

| seed (hunt) | surge | other bars | final w3 | seat | verdict with surge held met |
|---|---|---|---|---|---|
| 73903 | unmet (X) | ALL MET (w1 18, w2 10, contests 20, crises 3, rank regional, stage 3, sentiment day 13) | 2/3 | none | STILL NONE — w3 alone blocks. INDEPENDENCE SHOWN. |
| 73904 | unmet (X) | ALL MET (w1 17, w2 6, contests 20, crises 3, rank global, stage 3, sentiment day 19) | 4/3 | none | Seat fails on the surge ALONE — w3 is met (bar day 82). NO second blocker here. INDEPENDENCE NOT SHOWN (nothing to be independent of). |

What play would earn hunt 73903's missing third face?
Any one of three routes, all of which the game offers
and all of which produced w3 faces elsewhere in this
very band: (1) a villager fieldFight patrol encounter
with a third wave-3 type — the route that produced
BOTH of its faces and 73902-anchor's whole bar; (2) a
player startCombat world encounter with a third type —
the route behind 73904's spool/gavel faces; (3) a faced
feast draw of a wave-appropriate (wave-3) scavenger —
the route behind ALL of anchor 73905's bar. Was each
route available in these runs? (1) YES, all run long:
201 fieldFight deed calls on hunt 73903, but they kept
serving the same two types (spool, buffering) plus
w1/w2/w4 types — variety, not volume, is what failed.
(2) YES: 12 player startCombat deed calls on hunt
73903, none of them a new wave-3 type. (3) PARTLY: the
draw route was on offer only through day 79 — hunt
73903's 8 recorded draws (days 28–79) are all wave-1/2
monsters (paparazzo, memory_projector, warranty_caller,
sweeps_week, statickite, hummice x2, review_drone),
all driven off; its later feasts (grants days 123, 137,
153) record NO draw at all, so no late draw-fought w3
face was ever on offer. (That late-feast-no-draw pattern
is itself an unexplained blank — see below — not a
claim about the draw rule.)

## (d) IS THE HUNT w3 STALL CAUSED BY DRIVEOFF? NO — variety, not volume, and no driven draw was wave-3

Compare faced-monster counts, anchor vs hunt, same
seed (distinct ids in finalFaced; deed calls = all
recordDeedFight calls, repeats included):

| seed | distinct total A/H | distinct w3 A/H | deed calls A/H | w3 deed calls A/H |
|---|---|---|---|---|
| 73902 | 28 / 36 | 3 / 7 | 184 / 286 | 6 / 44 |
| 73903 | 29 / 32 | 4 / 2 | 144 / 237 | 10 / 6 |
| 73904 | 24 / 32 | 4 / 4 | 139 / 201 | 12 / 16 |
| 73905 | 30 / 25 | 3 / 3 | 191 / 140 | 8 / 15 |
| 73906 | 32 / 32 | 6 / 6 | 196 / 196 | 57 / 57 |
| 73907 | 24 / 25 | 3 / 4 | 208 / 233 | 4 / 15 |
| 73908 | 34 / 27 | 3 / 3 | 262 / 265 | 12 / 5 |

The hunt column fights MORE, not fewer, on the seeds
that matter: hunt 73903 logs 237 deed calls vs the
anchor's 144, faces MORE distinct monsters overall (32
vs 29), more distinct w1 (18 vs 17), w2 (10 vs 8), and
w4 (2 vs 0) — and fewer distinct w3 (2 vs 4). A
"fewer fights → fewer faces" account is falsified on
the numbers. The deficit is w3-specific variety: the
hunt village's encounters kept repeating types it had
already counted.

Direct-driveoff causation is also falsified on both
named seeds: NO driven draw was a wave-3 monster.
Hunt 73903's 8 driven draws are all wave 1–2; hunt
73904's 7 driven draws are wave 1 (nightcourt), wave 2
(mirror_stag, review_drone), and wave 4 (herald x2,
reunion, strike) — none wave-3. Driving off a draw
cannot remove a w3 face that was never drawn. (Contrast
anchor 73905, where draws ARE the w3 source — on that
seed, driveoff WOULD directly remove w3 faces; but
73905 seats in both columns on this base, so that
channel is not what blocks this band.)

The honest causal statement: on 73903, the w3 stall is
independent of driveoff in both senses — the missing
face was never among the driven draws, and the village
had MORE total fight volume than its anchor yet met
fewer distinct wave-3 types. What differs is the
encounter lottery: the anchor met callback/buffering/
ad_break/redactor via patrols in days 73–87, while the
hunt's patrols served spool at day 134 and buffering
at day 150 and then nothing new for 30 days. Why the
pool serves narrow variety on this trajectory is a
question for a future arm (encounter-pool variety),
not answered here.

## CONTROL COMPARISON vs hunttable corpus (current base vs hunttable base — reported, not smoothed)

Every row differs except hunt 73904's headline match
(days 180/180, won 0/0, final global/global, table 0/0
— though its w3 detail still differs, 4 vs 2). The
pattern: anchor days shift (73901 29 vs 23, 73902 101
vs 97, 73903 90 vs 94, 73904 94 vs 109, 73905 172 vs
127, 73906 138 vs 95, 73907 165 vs 137, 73908 176 vs
136); the collapsed set itself reshuffles. On the
current base the anchor-seated + hunt-unseated set is
73902, 73903, 73904, 73907, 73908 (73905 seats in both
columns, 73906 in neither, 73901 in neither) — and of
those five, the w3 bar diverges on ONE (73903), not
two as on hunttable's base. Headlines: anchor won 6/8
(same count, different seeds), median 138d (was 109d);
hunt won 1/8 (same count, different seed — 73905 now,
was 73902), median 180d (was 170d). The table gap IS
still the story (6/8 vs 1/8), but its seed composition
moved with the base. No hunttable number was
re-judged: the hunttable corpus stands as measured on
its base; this corpus stands as measured on this one.

## SENSE-TESTING READ (hunt 73903: the blocked village)

The village is alive and fighting — 237 deed calls, 31
deaths, regional standing held to the 180 cap — and the
stall is HALF-voiced, which is better than invisible
and still not actionable. Day 90 the table speaks for
itself: "the ring of pale light flickers... and does
not come. Not yet. The table is being set for those
whose deeds are done, and yours are not done. The
ledger still wants: wave-2 monsters faced; wave-3
monsters faced; the food-thesis deeds. The climb is
not over." Day 96, with wave-2 met the day before, it
narrows to "wave-3 monsters faced; the food-thesis
deeds" — but the same beat adds a pellet line that
muddies the message: "WE PRICED THE RUN. NO HUNGER ON
THE RECORD — THE PELLET HUMS WHERE THE FIRE SHOULD BE.
NO FEAST, NO SURGE, NOTHING HERE WE CAN PRICE." The
village HAS feasted (11 grants) — a player reading
"NO FEAST" hears a contradiction, not a direction. And
neither beat ever says the act: face ONE more distinct
wave-3 monster; spend ONE feast in a real fight. The
village knows the category of what it lacks, not the
move that would earn it. Judgment in plain words: a
half-earned wall — the fiction names the missing bars
but not the play, and the pellet line argues with the
feast record instead of clarifying it.

Robotic-repetition flag (sense, not counts): the
driveoff narration repeats VERBATIM eight times on
hunt 73903 — the same two actors, Elijah and Kayden,
taking up the same brands, "The Paparazzo was never
brave. It melts back into the dark." for every
scavenger regardless of kind. The beat is honest about
the buff ("the devotion stays armed"), but eight
identical performances read as a template, not eight
nights. No other robotic, static, or repeated dialogue
was found in the sampled lines (hunt 73903 days 28–96,
73904 grant windows).

## VILLAGER-BEHAVIOR SPOT CHECK (sense, not counts)

Nothing new is introduced by this arm (zero src/js,
zero policy behavior change — the recorder only reads),
so no new behavior is claimed. What the fresh rows'
say-lines show is coherent, people-shaped texture
throughout: named villagers taking up brands (Elijah,
Kayden), the System staging national beats, the realm
dissolving with spoken reasons. The failure mode is
not robotic villagers — it is the repeated driveoff
template above and the table beats that name bars
without naming acts.

## WALL NUMBERS (anchor = comparison base; hunt alongside)

Anchor: national-ever 7/8, national-final 6/8, table
invited 6/8, entered 6/8, wins 6/8 (lesser seat only),
wave-4 4/8, wave-5 0/8, Arc IV 6/8, median survival
138d, max 176d, deaths 223, starvation 5.
Hunt: national-ever 7/8, national-final 5/8, table
invited 1/8, entered 1/8, wins 1/8, wave-4 5/8, wave-5
0/8, Arc IV 1/8, median survival 180d, max 180d, deaths
240, starvation 5. Guardrails (diagnostic only, never
verdict-flipping): starvation 5 vs 5, median 138d vs
180d, national-ever 7/8 vs 7/8, wins 6/8 vs 1/8 — the
win gap IS the table gap (every win on both arms goes
through the table; no win bypasses it). Median survival
is death-aware (dead villages stop; 180 is the cap,
not a fixed horizon).

## BLANKS FILLED OR DOCUMENTED

- FILLED (definition, the task's core): the wave-3 bar
  is now a quoted code definition (distinct wave-3 ids
  in deeds.wavesFaced, threshold 3, facing counts,
  killing irrelevant), proven on all 16 rows by
  recomputation, with the full 9-type roster and the
  per-seed/per-column face table (monster, day, route)
  above, so no future arm has to re-derive which
  monsters count or how they are earned.
- FILLED (route census): w3 faces come through all
  three routes — fieldFight patrols dominate early
  (73902 3/3, 73903-anchor 4/4), player startCombat
  world encounters contribute (73904 spool/gavel),
  and faced feast draws become a w3 source late
  (73905-anchor 3/3 DRAW). The bar is not route-gated;
  it is variety-gated.
- FILLED (independence, on 73903): the counterfactual
  table shows hunt 73903 seatless on w3 alone with the
  surge held met — every other lesser bar met, w3 at
  2/3, seat none. The second-blocker finding from
  hunttable SURVIVES on current base for 73903.
- FILLED (causation, negative): the hunt w3 stall is
  NOT driveoff-caused on the named seeds — no driven
  draw was wave-3 on 73903 or 73904, and hunt 73903
  fights MORE overall yet meets fewer distinct w3
  types. Variety, not volume; lottery, not removal.
- DOCUMENTED, NOT FIXED (named next blanks): (1) leg
  (iii)'s 73904 half — on current base hunt 73904
  meets w3 (4/3, bar day 82), so the two-seed
  independence claim no longer holds; a future arm
  must re-derive its seeds on its own base; (2) the
  73905 control flip — anchor 73905 now seats via
  draw-fought w3 faces, so the surge-met/w3-missing
  control does not exist in this band; (3) late feasts
  drawing no scavenger — hunt 73903's grants at days
  123/137/153 record no draw, unexplained here, worth
  a follow-up arm (does the draw rule gate on something
  beyond fresh-armed grants?); (4) the day-96 pellet
  beat contradicting the feast record ("NO FEAST" after
  11 grants) — a voicing blank, not a pricing claim;
  (5) the verbatim driveoff template (same actors,
  same sentences, 8x) — a narration-variety blank;
  (6) wave-5 remains 0/8 on both arms — the wall's next
  step after the table.
- CARRIED (not chased here): encounter-pool variety —
  why 201 field fights serve only 2 distinct w3 types
  on hunt 73903; the hunt-73905 surge-via-non-draw-fight
  mechanism (day 97) as the general exception path; the
  table-entry step on seeds like anchor 73906.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No pre-registered leg, step, or definition was re-scored
mid-run. The run was judged exactly against its header:
DIAG-GO required (i) bar definition quoted from code,
(ii) w3 state tabulated for all 5 collapsed seeds x both
columns plus the 73905 control, (iii) independence shown
explicitly on BOTH 73903 and 73904, (iv) det-gates PASS
on pilot seed 73901. MET: (i) fully (quoted + recomputed
on 16/16 rows); (ii) fully (all rows tabulated, including
the control's flipped state); (iv) on its operative
clause (both det-gates MATCH exactly). NOT MET: (iii)
on 73904 (hunt w3 = 4/3, not 2/3 — the counterfactual
cannot be shown where the bar is met); (iv)'s
parenthetical cross-base check (hunttable 73901 row not
reproduced: 29/11 vs 23/8, base drift proven
instrument-independent); the 73905 control as briefed
(anchor seats on this base). The verdict is therefore
DIAG-NO-GO, not a softened partial — the proof test
honestly reports 20 passed / 4 failed (node exit 1),
with the 4 failures exactly the legs above. One method
note, not a revision: the anchor and hunt bands are
different trajectories by design (different base
policies), so the per-seed tables compare REACHABILITY
of the bar per seed, never day-gaps as a score. PROPOSED
REVISION FOR THE NEXT RUN (not applied here): pre-register
leg (iii) against seeds re-derived on the run's own base
("anchor-seated + hunt-unseated + w3-divergent on this
base") instead of fixed seed numbers, and pre-register
the control case as "a row with surge met + w3 missing
on this base, if one exists; otherwise report its
absence" — fixed seed numbers do not survive base drift,
and the bar should test the phenomenon, not the seed.

## Infrastructure notes

- Sweep: scripts/test-wave3bar-sweep.js (new file only:
  anchor = tableseat-nowait + wave-3 recorder; hunt =
  driveoff-clean + recorders + wave-3 recorder; modes
  --one wave3bar-anchor|wave3bar-hunt / --summary /
  --detgate-anchor / --detgate-hunt; per-day seatTrace +
  w3 trajectory + first-face route census per row).
  Recorder: scripts/policies/wave3bar-diag.js (new file
  only: pure observer around recordDeedFight + pure-read
  wavesFaced snapshots). Corpus:
  evidence/2026-10-26/perseed-sim-wave3bar-a/ (16 rows +
  summary.json + 4 detgate artifacts). Proof:
  scripts/test-wave3bar-a.js (20 passed / 4 failed —
  detgates, corpus, definition recomputation, tabulation,
  73903 counterfactual PASS; 73904 counterfactual and
  73905 control FAIL on current-base facts; control
  comparison printed, not verdict-flipping).
- Det-gates: PASS on both columns (73901: 29/29 days,
  11/11 deaths, ts null/null).
- Base: worktree HEAD 2ae24d410 (coordinator merge
  including sim-hunttable-a, sim-raidpool-a, journey-scale
  r39). Hunttable's base was be8541647; the only src/js
  changes in range are conversation.js (social-r55
  'others' exemption) and corpses.js (journey-deepening
  r51 falsy-0 range fix). The control disagreement is
  therefore evidence about the base, not a reason to
  re-run hunttable.
- Commit: sim-wave3bar-a, DIAG-NO-GO (leg iii 73904 +
  leg iv cross-base + control flip; zero src/js diff).
  Ready for coordinator merge; NOT pushed, NOT bumped,
  live NOT verified (coordinator/ship-loop line, not
  this arm's). No [needs-eyes] flag applies (DIAG only,
  no narration, feel, combat, or UI change).
