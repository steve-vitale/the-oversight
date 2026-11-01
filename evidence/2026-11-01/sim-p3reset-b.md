# sim-p3reset-b — DIAG: what resets P3's hunger streak on seed 17549

Run: oversight-flesh-out-loop-b, arm sim-p3reset-b, run
fleshout-loop-b-20261101T0630Z, axis food-economy (P3 reset
mechanism). Worktree sim-p3reset-b, branch sim-p3reset-b.
Base of the analyzed corpora: 6409c1312 (the awayeve
base); this worktree's base at leg time: a1edd18ea
(the prereg commit). DIAG ONLY (measurement): zero
src/js changes, zero policy-default flips, zero edits
to any existing policy file or existing script. New
files only: prereg, p3reset analyzer + proof test,
sleep-flow driver, evidence, flow tables, instrumented
leg. The absencehunt driver and death17549 analyzer
are REUSED VERBATIM from the base. This worker does
NOT push, bump, verify live, or merge into master;
the coordinator merges. Status to coordinator:
committed on branch, pending coordinator merge.

## Verdict: GO — judged exactly against the prereg bars

The binding prereg (evidence/2026-11-01/
sim-p3reset-b-prereg.md, commit a1edd18ea, written
BEFORE any judged table) set three bars, ALL of
which must hold:

(a) ITEMIZATION ≥ 90% OF RESET NIGHTS — PASSED
  2/2 (100%): both reset nights (19, 26) are FULL
  under the prereg's strict definition — every
  pre-check deposit named by source + kcal, the
  pantry-at-check value stated, and the post-check
  + waits remainder of the bridge closed exactly.
  The itemization comes from instrumented legs that
  met the prereg's reproduction rule (see Proof),
  never from re-scoring the corpus.
(b) COMPLETE TABLES — PASSED: the per-night
  pantry-flow table for 17549 P3 nights 18–30 and
  the P1 nights 22–24 contrast table are committed
  (sim-p3reset-b-tables-p3.json, -p1.json) and
  re-readable from the committed awayeve corpora;
  every night's opening/closing/bridge/marker/reset
  is present, and every corpus-named flow is cited
  by seq. Rows whose inflow the corpus cannot name
  are marked UNITEMIZED-by-corpus, never invented.
(c) PROOF TEST GREEN — PASSED: scripts/
  test-p3reset-b.js, 172/172, re-deriving the
  headline counts from the committed corpus files
  AND the committed instrumented leg file (not from
  the verdict text).

GO is therefore the verdict. GO here is still DIAG:
it authorizes NO src/js fix and NO default change.
What the arm delivers is the dated, kcal-exact
answer to the question the death17549 arm left
open: what food breaks P3's hunger streak, on
which nights, from whom.

## The answer in one paragraph

P3's streak breaks twice, by two different
mechanisms, and neither one is visible in the
transcript — because the scholar is away both
nights, and away nights silence the deposit paths.
On night 19 the pantry already holds 914 kcal at
evening; three foragers walk home during the
night's part-transitions and bank 254 + 338 + 379
= 971 kcal without a word (the scholar is out on
forest_floor, so the return lines never fire);
the village's own meal loop then nets −494, and
the endDay check finds 1,391 kcal and says
"Haven eats again." On night 26 the pantry is
truly empty at evening (0 kcal) and no forager
comes home at all — the streak breaks inside the
village's own meal loop, where two villagers bank
hauls of 600 and 200 kcal while two others draw
200 and 400, leaving exactly 200 kcal when the
check runs. By morning the pantry reads 613,
because two more foragers (Zoe +308, Rosa +305) come home in the morning's
part-transitions and the scholar remotely eats
200 of it. The reset inflows are small, nightly,
and silent — not expedition lumps, not scholar
unloads, not joiner gifts (joiners deposit
nothing), and never the scholar's pack bundles
(342/243 kcal "Nothing traceable" lines are pack
food, not pantry food).

## Definitions (prereg, exact — the night convention)

Night N = the sleep(N) line-prefix of the
analyzer's slice(N): from evenings[N-1].
saySeqAtEvening up to (excluding) the "— DAY N+1
DAWN —" line. Opening = evenings[N].pantry
(after the scholar's day actions, before sleep).
Closing = decisions[N+1].pantry (the morning
snap, after sleep AND the next day's wait-phase).
Overnight bridge = closing − opening = sleep(N)
net + waits(N+1) net. Pantry-at-check = the
item-list pantry at the moment villageEats'
famine block runs during sleep(N) — observable
only on instrumented legs. A reset night is FULL
only with named pre-check deposits + kcal AND
the pantry-at-check value AND the post-check +
waits remainder closed. Naming the mechanism
class ("silent away forage returns") from code
alone never counts as itemization.

## Code ledger (read off this worktree's base, cited)

- sleep() (game.js): ticks the night in 32-tick
  chunks; endDay fires mid-sleep at the tick
  boundary and rolls the day.
- endDay order (game.js, ~32113): villageMeal
  (the scholar's meal; skipped when away) →
  villageLives → villageEats → extinction check →
  day roll.
- villageEats() (game.js, ~31137): the roster
  meal loop (villagerMealDay: each living
  villager eats AND may bank a haul), then the
  pantryKcal sync re-derived from the item list,
  then the famine block: `v.pantryKcal <= 0` →
  hungryDays += 1 + "Haven's pantry is empty.
  Day N of hunger."; else if hungryDays > 0 →
  "Haven eats again." + hungryDays = 0. The
  check reads the item-list pantry AFTER that
  night's meal loop, not the evening snapshot.
- villageLives() (game.js, ~27934, in endDay
  BEFORE villageEats): ambient foragers deposit
  via stockPantry (routine haul ~400–800 × bold ×
  share; big day ~1500–2500 × mults), but the
  say line is gated on `present =
  playerAtHaven()`. Scholar away → SILENT.
- npcNodeTravel() (game.js, ~16790, on every
  day-part transition, including sleep tick
  chunks and harness wait cycles): an away NPC
  returning from forage deposits 200–600 ×
  cornucopia via stockPantry, and the say line
  fires ONLY if the scholar stands at Haven.
  Scholar away → SILENT.
- membership arrivalTick (membership.js, ~600):
  joiners add roster + trust + a line. They
  deposit NO pantry food. A joiner arrival is
  never a pantry inflow.
- takeFromPantry (game.js, ~16364) is gated on
  havenStoresAccess: 'none' when away — EXCEPT
  at integration stage ≥ 3, where access is
  'remote' and the away scholar CAN take pantry
  food (the day-27 waits "Took Foraged food"
  lines are remote takes, see night 26's
  post-check remainder).
- Scholar-pack lines are NOT pantry inflows:
  the "🎁 small bundle … (N kcal of dried meat
  and clean water. Nothing traceable.)" lines
  and the "🪤 TRAP … About 350 kcal on the
  bone" lines go to the scholar's pack.

## Corpus stage (before any new leg): the gap, honestly

Built from the committed awayeve corpora first,
per the prereg staging. Corpus-stage verdict for
BOTH reset nights: UNITEMIZED — zero named
pre-check deposits on either night, zero named
wait-phase inflows, and no pantry-at-check value
anywhere in the corpus (the snaps bracket sleep
+ wait-phase together). The corpus proves the
bridges (night 19: 914 → 1,391, +477; night 26:
0 → 613, +613) and the marker/reset lines, but
not one kcal of the deposits. That gap is what
triggered the instrumented legs (prereg staging:
legs run ONLY for nights the corpus leaves
UNITEMIZED). The corpus tables also establish
the control that makes the silence meaningful:
on nights the scholar is HOME, narrated returns
account for the bridge EXACTLY (night 28: waits
returns 599 + 562 = bridge +1,161; night 27:
returns 262 + 204, eaten by the scholar 262 +
204, bridge 0). When the scholar is away, the
same paths deposit with no lines at all. The
silence is the presence gate working as coded,
not missing data.

## Instrumented legs (new-base, reproduction rule MET)

Three legs ran on this worktree's base (seed
17549, P3 deed-seeking stack, 30d, log-only
wrappers: stockPantry call log with phase +
caller path + pantry before/after + say-seq;
pantry-at-say for every marker/reset line;
villageEats / villagerMealDay / villageLives /
sleep entry-exit pantry logs; npcNodeTravel
away-diff attribution). All three produced
BYTE-IDENTICAL transcripts to the committed
corpus: all 2,870 say lines identical, all
morning/evening pantry snaps identical, same
marker nights (18, 25), same reset nights (19,
26), same deaths, same endReason (survived).
The prereg's reproduction rule (same evening/
morning snaps + same marker/reset lines) is
therefore MET — exceeded, in fact — and the
instrumented sub-step values attach to the
corpus nights. The legs are reported as new-base
legs (their file says so); the attachment rests
on the byte-identity, stated here, not assumed.
The first leg file (without attribution logging)
was superseded by the attribution leg (same
transcript, richer logging) and removed
uncommitted; the committed leg is the
attribution leg. Determinism note: three runs,
three identical transcripts — the wrappers draw
no RNG and change no behavior, as designed.

## Reset night 19 — FULL itemization (seq 1962)

Evening(19): 914 kcal (3 items). Check value:
1,391 kcal (4 items). Morning(20): 1,391 kcal.
Walk, every step logged:

1. Sleep-tick deposits (npcNodeTravel, sleep
   part-transitions, silent — scholar away):
   three forage returners walk home in a single
   part-transition, in roster order (the loop
   iterates v.roster in order and deposits
   immediately per returner — the pairing below
   follows that loop order; the set of returners
   and the three kcal are logged facts):
   - gen_5zrmrq3 (forage return) +254
   - james_okonkwo (forage return) +338
   - devon_okafor (forage return) +379
   Total +971. (nathan_lee returned in the same
   transition from water — no deposit.)
   Pantry at villageEats entry: 914 + 971 =
   1,885 (6 items). villageLives deposited
   nothing this night (no villageLives-phase
   stock call).
2. Meal loop (villagerMealDay walk, pantry
   before → after per villager):
   - gen_5zrmrq3: 1,885 → 1,673 (−212)
   - gen_tujg3m3: 1,673 → 1,873 (+200)
   - nikos_papadopoulos: 1,873 → 2,273 (+400)
   - ivy_wang: 2,273 → 1,191 (−1,082)
   - nathan_lee: 1,191 → 1,591 (+400)
   - james_okonkwo: 1,591 → 1,791 (+200)
   - devon_okafor: 1,791 → 1,391 (−400)
   Net −494. Pantry-at-check: 1,391.
   "Haven eats again. The hollow look fades."
   (hungryDays 1 → 0).
3. Post-check + waits(20): ZERO pantry
   movement (no stock call, no take) →
   morning(20) 1,391 = check value. Closed:
   914 + 971 − 494 + 0 = 1,391. ✓

Causal note, stated plainly: night 19's check
does not pass BECAUSE of one inflow. The pantry
was already 914 at evening; the sleep-tick
returns (+971) and the meal loop (−494) leave
1,391. The reset is the whole walk, not a
single deposit — and the walk's largest single
fact is that the evening pantry was already
non-empty, banked the night before (see night
18). The pre-check deposits are still itemized
above because the prereg requires every one
named, not just the decisive one.

## Reset night 26 — FULL itemization (seq 2507)

Evening(26): 0 kcal (0 items). Check value:
200 kcal (1 item). Morning(27): 613 kcal
(2 items). Walk, every step logged:

1. Sleep-tick returns: james_okonkwo (water)
   and zoe_adams (water) come home — no food
   deposits (water returns deposit nothing).
   villageLives deposited nothing this night
   (no villageLives-phase stock call).
2. Meal loop (villagerMealDay walk):
   - gen_tujg3m3: 0 → 0 (drawn 0)
   - nikos_papadopoulos: 0 → 0 (drawn 0)
   - nathan_lee: 0 → 0 (drawn 0)
   - james_okonkwo: 0 → 600 (banked haul;
     meal 'gave' field 589.9 — see micro-note)
   - devon_okafor: 600 → 400 (drawn 200)
   - app_mgpsphhv932: 400 → 0 (drawn 400)
   - zoe_adams: 0 → 0 (drawn 0)
   - rosa_mendez: 0 → 0 (drawn 0)
   - app_mgpsphpi668: 0 → 200 (banked haul;
     meal 'gave' field 176.7 — see micro-note)
   Net +200. Pantry-at-check: 200.
   "Haven eats again." (hungryDays 1 → 0).
   (rosa_mendez is the joiner who walked in
   during this same sleep prefix, seq 2500 —
   she eats in the loop but banks nothing; the
   other joiner from that prefix, "a tired
   farmer," is one of the app_ vessels. Joiners
   deposit nothing on arrival; what banks here
   is james's and the app vessel's meal-loop
   hauls, not their arrival.)
3. Post-check + waits(27): npcNodeTravel
   returns +308 (zoe_adams, forage) and +305
   (rosa_mendez, forage) = +613; scholar
   remote take/eat −200 ("Took Foraged food.
   You eat Foraged food (200 kcal)." during
   waits(27), integration ≥ 3 remote access).
   Morning(27): 200 + 613 − 200 = 613. Closed. ✓

Causal note: night 26 is the pure case the
question asked about. The pantry is empty at
evening, nobody comes home with food, and the
streak still breaks — because the meal loop
itself banks more than it draws that night
(+800 banked, −600 drawn, net +200). The
"reset inflow" is not an arrival at all: it is
villagers bringing their day's hauls into the
shared pot during their own meals, in the same
loop that feeds them. A transcript-only read
cannot see it (no line names a meal-loop bank),
which is exactly why the corpus left this night
UNITEMIZED and why the instrumented ledger was
needed.

## The setup: night 18's marker (seq 1873)

Evening(18): 2,950 kcal (2 items). Check value:
0 kcal (0 items) → "Day 1 of hunger."
- villageLives haul +100 (villager unnamed in
  the log — villageLives has no per-villager
  hook; the call is logged, the villager is
  not) → 3,050 at villageEats entry.
- Meal loop walk: 3,050 → 2,250 → 1,250 → 500
  → 0 → 400 → 800 → 0 (seven villagers; the
  last draw, devon_okafor, takes the final
  800 to zero). Net −3,050. The village eats
  its whole pantry in one night's meals.
- Post-check + waits(19): npcNodeTravel
  returns +474 (gen_tujg3m3, forage) + 228
  (nikos_papadopoulos, forage) + 212
  (james_okonkwo, forage), in roster order =
  +914 → morning(19) 914. Closed:
  2,950 + 100 − 3,050 + 914 = 914. ✓
The morning-19 pantry — the food night 19's
check passes on — is entirely the night-18
post-check returns. The chain links: night 18
empties the pantry AND refills it, in that
order, across the check.

## Marker night 25 (seq 2454) — the second fuse, for contrast

Evening(25): 0. villageLives haul +100 (before
the check, villager unnamed) → villageEats
entry 100 → meal loop nets −100 → check 0 →
"Day 1 of hunger." Post-check raids take ~0
(Stonebridge/Thornfield lines read "~0 kcal").
Morning(26): 0. Night 25 is the control for
night 26: a +100 haul arrives and the fuse
still ticks, because the meal loop draws it
all. The difference on night 26 is not "more
arrivals" — it is the meal loop's net sign
(−100 on night 25, +200 on night 26).

## P3 per-night pantry-flow table, nights 18–30

Opening = evening snap; closing = next morning
snap; bridge = closing − opening. "Corpus-named"
means a transcript line in the night window;
"instrumented" means the leg log. Full machine-
readable tables: sim-p3reset-b-tables-p3.json
(corpus) + sim-p3reset-b-leg-newbase-p3-30d-
attrib.json (leg). Pantry-at-check is shown
where the leg logged it (focus nights + marker
nights); for other nights the EATS exit is the
post-meal pantry (the check is silent when
hungryDays is already 0).

| night | open → close (bridge) | marker/reset | flows (named) |
|---|---|---|---|
| 18 | 2,950 → 914 (−2,036) | Day 1 | Instr: villageLives +100; meal loop −3,050 → check 0; post-check returns +474/+228/+212. Corpus: trap squirrel 350 (PACK, excluded); Ashford raid, no take. |
| 19 | 914 → 1,391 (+477) | RESET | Instr: returns +254/+338/+379; meal net −494 → check 1,391; post-check 0. Corpus: pack bundle 342 (excluded); NO deposit line. |
| 20 | 1,391 → 1,709 (+318) | — | Corpus: none named (silent). Note: vessel-death day — endDay fires twice (see footnote); bridge closes across both endDays. |
| 21 | 1,709 → 200 (−1,509) | — | Corpus: pack trap 350 (excluded). No named pantry flow. |
| 22 | 200 → 3,205 (+3,005) | — | Corpus: pack bundle 462 (excluded). No named pantry flow — the month's largest silent inflow (sleep-tick + villageLives + waits returns, per leg). |
| 23 | 3,205 → 3,000 (−205) | — | Corpus: pack trap 350 (excluded). No named pantry flow. |
| 24 | 3,000 → 0 (−3,000) | — | Corpus: monster raid (unquantified — leg shows it took 0: EATS entry still 3,000); Stonebridge raid −400. Instr: meal loop −2,600 → 400 at check (passes, no marker); raid −400 → morning 0. Closed: 3,000 − 2,600 − 400 = 0. |
| 25 | 0 → 0 (0) | Day 1 | Instr: villageLives +100; meal loop −100 → check 0. Corpus: pack bundle 243 (excluded); raids ~0. |
| 26 | 0 → 613 (+613) | RESET | Instr: meal loop net +200 → check 200; post-check returns +308/+305; scholar remote eat −200. Corpus: joiners Rosa + farmer (NO deposit); NO deposit line. |
| 27 | 0 → 0 (0) | — | Corpus: waits returns +262/+204, eaten by scholar −262/−204 (scholar home, new vessel); post-check raids ~200 each (only 200 available — see note). Bridge 0 exactly. |
| 28 | 0 → 1,161 (+1,161) | — | Corpus: waits returns +599/+562 = bridge exactly (scholar home; no eats). |
| 29 | 1,161 → 0 (−1,161) | — | Corpus: pack bundle 257 (excluded). No named pantry flow in the night window — bridge-only row; the sink of the 1,161 is not named in the corpus (daily lines, not sleep). |
| 30 | 0 → — (leg ends) | — | Corpus: pack trap 350 (excluded). No closing snap (30d window ends). |

Footnote — double endDays: on vessel-death days
(10, 16, 20, 27) endDay fires twice (two
villageEats calls share one scholarDay). The
mechanism is not established in this arm —
stated as an observed pattern, not a causal
claim — but the pattern is consistent across
all four vessel-death days in the leg, and
focus nights (18, 19, 25, 26) each have
exactly one, so the reset walks above are
unaffected. Night 27's
post-check raid lines read "~200 kcal" twice
while only 200 kcal remained after the check;
the morning snap (0) plus the waits deposits
(+466) minus the scholar's waits eats (−466)
closes only if total post-check raid outflow is
200 (the first raid takes the 200; the second
line overstates what was left). Stated as a
line-vs-ledger mismatch, not resolved — it is a
non-focus night and does not touch bar (a).

## P1 contrast — nights 22–24 (why no reset inflow arrived)

P1's scholar is AT home these nights, so the
presence gate is OPEN: any npcNodeTravel or
villageLives deposit WOULD narrate. None does.
That absence is visible evidence, not a gap —
the contrast to P3's silent away nights is the
point. (Source: committed P1 corpus +
census; no new P1 leg was run — the contrast
needs no instrumentation because the narration
is ungated at home.)

| night | open → close (bridge) | marker/reset | what happened |
|---|---|---|---|
| 21 | 3,270 → 2,193 (−1,077) | — | Narrated waits return +393 (Nikos forage, day-22 waits — scholar home, so it narrates); scholar meal draw −1,200 in the sleep prefix; NPC meal net −270. The last narrated deposit of the month. |
| 22 | 2,193 → 0 (−2,193) | Day 1 | Scholar village meal −1,293 (sleep prefix line, the scholar's own draw at home) + NPC meals → 0 at check. NO deposit line anywhere in the window (sleep, waits, daily). No expedition return, no forage return, no unload. The fuse lights. |
| 23 | 430 → 0 (−430) | Day 2 | The 430 is the scholar's OWN daytime unload during day 23 (daily line "unload 430 kcal into Haven's pantry" — the only inflow, and it comes from the scholar's pack, not the village). Sleep: scholar village meal −430 takes the whole 430 (villageMeal runs before villageEats, so the scholar eats first and the NPC loop finds nothing). Check 0 → Day 2. |
| 24 | 0 → — (game over) | Day 3 + SCATTERING | Opening 0, no deposit line anywhere, check 0 → Day 3 → "Haven couldn't hold. On the third hungry day, people started walking — in different directions. The scattering, again." The scholar is alive at the evening snap (kcal 1,224, per death17549). |

Why P3 resets and P1 doesn't, night by night:
(1) The P3 scholar draws NO pantry meal on
patrol nights ("You camp wild tonight — no
pantry meal. Eat from your pack." on both
reset nights), while the P1 scholar draws
1,293 (night 22) and 430 (night 23) at home —
the home scholar is one more mouth on an empty
pantry, and on night 23 the scholar's meal IS
the whole pantry. (2) P3's village still
produces at night — sleep-tick forage returns
and meal-loop banked hauls — while P1's
production has stopped: the creek is fished
out, the garden unripe, eight villagers resting
wounded, and no expedition has returned since
night 17 (death17549). P1's last deposit is
the +393 on night 21's waits; after that,
nothing comes in for three nights, and the
fuse completes. (3) P3's resets are small
(971 gross on night 19 against a 914 bank;
200 net on night 26) — P1 would have needed
no more than that, but its village had stopped
producing entirely.

## SENSE TEST (law) — P3 days 24–27, read end to end

PASS, with the invisibility stated as the
finding rather than a flaw.

Days 24–27 read as one village's hard week
through one scholar's eyes — and the scholar's
eyes are NOT on the village. On day 24 the
scholar works forest patches, learns the
White Oak Acorns parts, and carries the same
three mementos (Dog tags, Grandma's Tin Cup,
Contract Quill — the "lived-in" lines repeat
nightly, a ritual, not a bug). Night 24's
sleep brings a monster raid "drawn by the
smell of the pantry" and a Stonebridge raid
carrying off ~400 kcal, and the pantry empties
without a hunger marker — because the meals
still found 400 kcal at the check, and the
raid took the rest after. Day 25 the scholar
forages again ("This patch is worked out —
step to another green patch"), the pantry
reads 0 at evening, the sleep prefix carries
the Day-1 marker with no deposit line before
or after it, and dawn brings the scholar's
own pack bundle ("(243 kcal of dried meat and
clean water. Nothing traceable.)") — food for
the scholar, nothing for the village. Night 26
is the densest sleep in the month: joiners
walk in ("🚶 Rosa Mendez walks in — pack
light, eyes wide. Haven grows by one. (9
souls.)" / "🚶 a tired farmer walks in …
(10 souls.)"), a beggar asks for food
("🥣 Andre of Thornfield walks into your
firelight alone, thinner than you remember.
'Our jars are empty,' they say."), the
HUNGER WINTER crisis fires ("Three days now
the village has gone to sleep hungry. The
pantry is an echo."), Nathan dies ("📖 The
Codex turns a page on its own. Nathan is
dead. You didn't ask. It knew."), and then —
with no deposit line anywhere in the prefix —
"Haven eats again. The hollow look fades."
Day 27 the scholar wakes wrung out, eats
200 kcal of 'Foraged food' by remote take
(the integration-≥3 privilege, invisible in
the transcript as a pantry draw), forages,
and dies of dehydration that night
(gen_5zrmrq3, day 27) while the pantry sits
at 0 again.

The sense judgment: the reset lines do NOT
read as earned in the transcript alone — on
both reset nights, "Haven eats again" arrives
with no food line before it, which reads as
unexplained luck to anyone reading only the
say stream. The instrumented ledger shows it
is NOT luck: foragers coming home in the
night and villagers banking hauls in their
own meals. But the scholar, sleeping rough
miles away, would not hear any of that — the
presence gate that silences the deposits is
the same law that keeps the scholar from
knowing things they weren't there for. So the
transcript's silence is honest, and the
measurement gap was ours, not the game's:
a reader who only reads say lines cannot
audit an away village's pantry, and this arm
is the instrument that can. The robotic
texture flagged in death17549 recurs here
("You wait. The light changes." across idle
day-parts; "still hurting — rest today"
per wounded villager; the memento lines
nightly) — templates, not decisions, and not
new in this arm.

Quoted sleep lines that FAIL to show each
reset inflow (the gap, verbatim):
- Night 19, full sleep prefix (seq 1955–1962):
  "Sleeping rough means the cold ground …" /
  "You settle into the cold ground. Sleep
  takes you." / "⚠ STARVING: health and
  energy falling." / "You camp wild tonight —
  no pantry meal. Eat from your pack." /
  "Haven eats again. The hollow look fades."
  No deposit line. The three +254/+338/+379
  returns happened in the sleep tick chunks
  before the check and narrated nothing.
- Night 26, sleep prefix (seq 2494–2507):
  "You camp wild tonight — no pantry meal."
  / "◈ CRISIS — THE HUNGER WINTER. Three days
  now the village has gone to sleep hungry."
  / "Haven eats again." No deposit line. The
  +600/+200 meal-loop banks happened inside
  villagerMealDay, which narrates nothing.

## Villager behavior sample (beyond the sense stretch)

Out of the same corpora, villagers show goals
(forage returns with real kcal; garden work;
water runs; teaching: "Nathan taught Hayden
Old World Caches" in the wider month), routines
(daily forage loops, wounded-rest days,
fishing the same fished-out banks), dialogue
with consequences (the fire-gossip chains; the
Stonebridge/Emberhold/Thornfield/Ashford raids
with Trust −10; the "choosing who eats" crisis
speeches), and reactions to events (the FIRST
GRAVE crisis on deaths; "The fire feels
smaller tonight."). New in this arm's read:
villagers bank food during their own meals
(the meal-loop gives) — a villager's haul
becomes village food in the same beat they
eat, which is the mechanism behind night 26.
Robotic / repeated texture, flagged (same as
death17549, not new): the fished-out fishing
line repeated identically; the wounded-rest
line per villager per day-part; "You wait.
The light changes." as the competent/deed
policies' default day-part. Decisions read as
person-like; the repetition lives in templates
and in the policies' idleness, not in the
villagers' choices.

## Reachability verdict

Waves 1–5, Arc II/III/IV, regional → national,
the table, and the win flag are not in scope
of this trace and none is claimed either way.
What IS reached, on current master via the
awayeve corpora + the instrumented legs: the
scattering game-over (P1, death17549), the
HUNGER WINTER crisis with relief offers, the
"Haven eats again" reset beat (P3, twice, now
itemized), expedition returns, the
PRODTHROTTLE shelves-full behavior, wound-
fever sickness deaths, succession under
starvation, and remote pantry takes at
integration ≥ 3. The village-death content is
reachable and, on this seed, common; the reset
content is reachable and, on this seed, silent
without instrumentation.

## Village assessment, in plain words

Picture the same village run two ways for a
month, and then look only at the nights that
decide whether it lives. Left at home with
the evening step, the village eats its pantry
down, gets one big lift from two neighbors'
expeditions, then eats the last of it while
nobody brings anything home for three nights
— the scholar eats from the same pot every
night, the creek gives nothing, the garden
never ripens, the hurt rest instead of
ranging — and on the third empty night
everyone walks away. Sent out hunting deeds,
the same village still nearly dies twice —
the pantry hits zero just the same — but the
scholar sleeps rough and eats from his pack
instead of the pot, foragers slip home in the
night with a few hundred kcal each and bank
it without a word, and on the two nights the
streak would complete, the village's own
meals bank just enough — 971 gross against a
914 bank on one night, 200 net from nothing
on the other — for the check to find food.
The village survives by a one-night margin,
twice, while its scholars die and are
replaced. So the answer to what resets P3 is
plain: not a big delivery, not the scholar,
not the newcomers. Small food, arriving
quietly, on exactly the nights that matter —
foragers coming home in the dark, and
villagers putting part of their day into the
shared pot while they eat. The transcript
never says so, because the scholar wasn't
there to hear it. The ledger says so, kcal
by kcal.

## Named seeds (unchanged + new, no substitution)

- 17549: village-lost on P1 (day 24,
  scattering), creekseek (day 24, scattering,
  corpus-identical to P1), BARE (day 18,
  scattering via scholar starvation +
  succession); survives on P3 (two Day-1
  hunger markers, two resets, no game-over).
  Unchanged from awayeve/death17549; now the
  resets are ITEMIZED, not just observed. The
  death17549 "reset mechanism unnamed" note is
  closed by this arm.
- Retired: none.

## Wall numbers (observed on these legs, report-only)

NOT measured by this pre-seat census: national /
table / wins are not reported as wall numbers
here — no values are invented for them.
Observed leg maxima from the prior census
(death17549, report-only, not re-measured
here): P3 maxWaveUnlocked 2, waveKills
{1: 8, 2: 1}; P1 maxWaveUnlocked 1, waveKills
{1: 2}. Survived window: P3 only (30d);
village-lost: P1 day 24 (death17549).

## Blanks filled or documented

- Filled (this arm, measured): the P3 reset
  mechanism on both reset nights, kcal-exact —
  night 19: sleep-tick forage returns +254
  (gen_5zrmrq3) +338 (james_okonkwo) +379
  (devon_okafor) = +971, meal net −494,
  check 1,391; night 26: meal-loop net +200
  (james +600, devon −200, app −400, app
  +200), check 200, post-check returns +308
  (zoe_adams) +305 (rosa_mendez) minus scholar
  remote eat 200 = morning 613.
- Filled (this arm, measured): the night-18
  setup — the meal loop eats the whole 2,950
  (+100 villageLives haul) to zero, and the
  post-check returns (+474/+228/+212) are the
  914 that night 19's check passes on.
- Filled (this arm, measured): the night-25
  control — a +100 villageLives haul arrives
  and the fuse still ticks (meal loop −100),
  proving the reset is the meal loop's net
  sign, not the arrival count.
- Filled (this arm, measured): the P1 contrast
  — three nights with no inflow at all, in a
  leg where the scholar is home and every
  deposit would narrate; the scholar's own
  home meals (1,293; 430) are part of the
  fatal drain.
- Filled (this arm, measured): the presence-
  gate silence is systematic, not incidental —
  narrated returns account for bridges exactly
  on home nights (night 28: 599 + 562 =
  1,161) and vanish on away nights while the
  ledger shows deposits continuing.
- Documented (this arm, NOT a fix): the
  meal-loop 'gave' field is not the deposited
  amount (james: gave 589.9 vs pantry walk
  +600; app vessel: gave 176.7 vs walk +200;
  night 19: gave sums differ from walk deltas
  likewise). The pantry walk governs every
  number in this evidence; what 'gave' counts
  (credit vs banked kcal) is a code-reading
  question for a future arm, not a verdict
  here. It does not touch bar (a): the walks
  close exactly on every focus night.
- Documented (this arm, NOT resolved): the
  villageLives haul villager is unlogged (the
  +100 on nights 18 and 25 has no villager
  name — villageLives has no per-villager
  hook for a wrapper to read). It touches no
  reset night's verdict (neither reset's
  pre-check window contains a villageLives
  deposit), but a future arm that wants
  villageLives attribution needs a finer hook.
- Documented (this arm, recurring observation,
  NOT a verdict): the night-27 post-check raid
  lines read "~200 kcal" twice while only 200
  kcal remained — the second line overstates
  what was left. The morning snap closes only
  if total raid outflow is 200. Line-vs-ledger
  mismatch on a non-focus night; filed here
  for the coordinator backlog, not chased.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg GO bars (itemization 2/2 + tables +
  proof green): THREE OF THREE MET. No metric
  was re-scored mid-run. The corpus stage
  honestly failed bar (a) (FULL 0/2) before the
  legs ran — that failure is what triggered
  the legs under the prereg's staging, and the
  legs' reproduction-identity is what lets the
  final verdict be GO without moving the bar:
  the bar always required pantry-at-check
  evidence, and the legs supplied it for the
  same nights, on a byte-identical transcript.
- Whether the verified-zero pre-check case
  occurred: NO — neither reset passed on
  banked food alone. Night 19 had +971 of new
  deposits before the check; night 26 had a
  +200 meal-loop net. The prereg's
  verified-zero rule was therefore never
  invoked, and no night was passed on a
  "probably no inflow was needed" argument.
- Whether the overnight bridge may be reported
  as the reset inflow: NO under this prereg,
  and it was not — night 19's bridge (+477)
  is not its reset inflow (the pre-check
  deposits were +971 with a −494 meal net);
  night 26's bridge (+613) is not its reset
  inflow either (the check passed at 200, and
  the +613 arrived after the check minus the
  scholar's 200 eat). Any future arm that
  reports a bridge as an inflow repeats the
  exact error this prereg was written to
  prevent.
- Whether deposit→villager pairing by roster
  order is sound: the pairing rests on code,
  not on the log alone — npcNodeTravel
  iterates v.roster in order and deposits
  immediately per forage returner (game.js).
  The sets (which villagers returned, which
  kcal landed) are logged facts; the pairing
  follows the loop order. If a future code
  read shows the loop reordering returns, the
  pairings (not the totals) would need
  revision — the totals and the verdict do
  not depend on the pairing.
- Whether the mechanism class may substitute
  for per-night kcal: NO — see the prereg.
  This run did not need the substitution: both
  nights are kcal-exact. The next run's
  question is the size distribution of silent
  away deposits on fresh seeds (routine haul
  vs big day vs node-return) — a band
  measurement, not a single-seed trace.
- Carried doubt for the NEXT run: the
  meal-loop 'gave' vs walk discrepancy (above)
  should be read before anyone uses 'gave' as
  a contribution metric; and the double-endDay
  structure on vessel-death days (10, 16, 20,
  27) should be understood before anyone
  tables a succession day's flows from snaps
  alone — the two endDays share one
  scholarDay, so snap-to-snap bridges on those
  days span two day-ends.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare
POLICY_REGISTRY policies on 150-day horizons
with its own scorecard and observer contract.
It cannot express a single-seed sleep-flow
trace, pantry-at-check values, hungry-day
streaks, or policies that are not in the
registry (deed-seeking as a census stack) —
the same declaration every prior strand arm
made, stated in the prereg before judging.
There is no before/after comparison in this
arm (DIAG trace, no lever), so no panel
comparison is attached and none is fabricated;
the panel tool was not invoked on this corpus.
The deliverable is itemized flow tables,
stated explicitly, not silently skipped.

## Infrastructure findings (for the coordinator — NOT game findings)

1. Safe-commit index clobber hit the prereg
   commit (committed file showing staged-as-
   deleted while byte-identical in the
   worktree). Repaired via `git update-index
   --add --cacheinfo` from the HEAD blob;
   `git status --short` empty + `git diff
   HEAD` empty verified after repair. The
   commit itself was never in doubt (blob
   hash matches). The coordinator should
   verify the same way after the final commit
   below.
2. Diff guard at evidence time: `git diff
   --name-only <base> -- src/ scripts/policies/`
   must show NOTHING (no game code, no
   existing policy file moved under
   measurement; the only new scripts are
   scripts/analyze-p3reset-b.js,
   scripts/test-p3reset-b.js, and
   scripts/drive-p3reset-b.js, none under
   scripts/policies/). Verified before the
   final commit below.
3. EPERM flap: NOT observed on file writes in
   this window (all analyzer runs, leg runs,
   and commits landed first-try).
4. Determinism: three instrumented legs on
   this worktree's base produced byte-identical
   transcripts (2,870 say lines) and identical
   pantry snaps to the committed awayeve
   corpus — the base move from 6409c1312 did
   not re-roll this seed's trajectory. Stated
   as an observation about this seed, not a
   general claim about base moves.
5. No new sim leg beyond the three
   instrumented P3 legs above; no .jsonl
   leftovers exist for this arm at evidence
   time. The first leg file (no attribution
   logging) was superseded by the attribution
   leg (same transcript) and removed
   uncommitted.

## Proof

scripts/test-p3reset-b.js: 172/172 (synthetic
slicing/classification rules; committed-corpus
headline counts: denominator 2, corpus-stage
FULL 0/2 → UNITEMIZED 2/2; trajectory cross-
checks vs the death17549 censuses on every
day, both policies; instrumented-leg FINAL
counts: reproduction byte-identity, check
values 0/1391/0/200, pre-check sums 971/0,
meal-walk closures, post-check closures).
Corpus checks: P3 markers nights 18/25, resets
19/26, game-over none; P1 markers 22/23/24,
resets none, game-over scattering 24. Leg
checks: three legs, identical transcripts;
check-line pantry values match the walks;
every focus-night walk closes exactly
(914+971−494=1,391; 0+200=200;
200+613−200=613; 2,950+100−3,050=0;
0+914=914). Diff guard: see infrastructure
note 2.

## Files

- Prereg (binding, before judged tables):
  evidence/2026-11-01/sim-p3reset-b-prereg.md
  (commit a1edd18ea)
- Evidence (this file): evidence/2026-11-01/
  sim-p3reset-b.md
- Instruments: scripts/analyze-p3reset-b.js,
  scripts/test-p3reset-b.js,
  scripts/drive-p3reset-b.js (new files only)
- Flow tables (analyzer output, one per
  policy): evidence/2026-11-01/
  sim-p3reset-b-tables-p3.json,
  sim-p3reset-b-tables-p1.json
- Instrumented leg (new-base, attribution):
  evidence/2026-11-01/
  sim-p3reset-b-leg-newbase-p3-30d-attrib.json
  (byte-identical transcript to the corpus;
  see Proof)
- Source corpora (prior arm, reused not
  re-run): evidence/2026-11-01/
  sim-awayeve-b-corpus-pilot-p3-30d/
  absencehunt-b-deed-seeking-30d-s17549.json,
  sim-awayeve-b-corpus-pilot-p1-30d/
  absencehunt-b-nighttravel-stack-30d-s17549.json
- No sim-findings.md append by this worker
  (coordinator owns the backlog): out-of-scope
  gaps are noted in the "Blanks" section above
  and in the coordinator notes below for the
  coordinator to file.

## Coordinator notes (out-of-scope gaps, for the backlog — NOT filed by this worker)

- Meal-loop 'gave' vs pantry-walk discrepancy:
  'gave' (589.9 / 176.7) is not the banked
  amount (walk +600 / +200). Anyone using
  'gave' as a contribution metric will
  undercount. Needs a code read of
  villagerMealDay's give accounting before
  'gave' is quoted as kcal anywhere.
- Night-27 raid-line overstatement: two
  "~200 kcal" raid lines while only 200 kcal
  remained after the check. Line-vs-ledger
  mismatch (see table footnote).
- Silent away deposits are a measurement gap,
  NOT a game bug to file as "narrate more":
  the presence gate is Steve's perception law
  working as coded (an away scholar cannot
  hear home returns). The instrumented ledger
  is the right tool for this class of
  question, not new narration.
- Next-blank candidate from this trace: the
  size distribution of silent away deposits on
  fresh seeds (routine haul vs big day vs
  node-return) — the reset mechanism is now
  itemized on one seed and needs a band
  before anyone levers on it.
- Double-endDay structure on vessel-death days
  (10, 16, 20, 27): two villageEats calls share
  one scholarDay. Any future arm tabling a
  succession day's flows from snaps alone will
  misattribute unless it accounts for both
  day-ends.
