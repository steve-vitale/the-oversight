# sim-finalloss-adopt-a — adoption evidence (run fleshout-20261027T0615Z)

## Verdict: DIAG-NO-GO

The instrument works and every final-loss case in this corpus is classified, but
the pre-registration's condition (2) fails honestly: **neither known instance
re-derives from this corpus**. On current master, seed 73672 ends on day 118
with a win (before the known day 148), and seed 73673 ends on day 32 with the
village lost (before the known day 112). The known instances are unreachable
on this base, not unmeasured. Per MEASUREMENT.md §14 a miss is NO-GO, never
re-scored — this report does not re-score, does not drop condition (2), and
does not substitute near-miss cases for the known ones. What the next run
should do about it is a coordinator call, recorded under "metric review"
below, not a mid-run revision.

## Adoption

This arm ADOPTS the dead arm sim-finalloss-a (run fleshout-20261027T0105Z)
and runs its pre-registration verbatim. Run-id adaptation is the only
deviation: run fleshout-20261027T0615Z, arm sim-finalloss-adopt-a, worktree
`~/workspace/worktrees/sim-finalloss-adopt`, branch `sim-finalloss-adopt`.
Adoption pre-registration:
`evidence/2026-10-27/sim-finalloss-adopt-a-prereg.md`. The dead prereg was
verified byte-identical against the preserved copy before any sweep ran.

## Lever played: none — measurement only

DIAG / MEASUREMENT ONLY. Zero `src/js` changes, no default flips, no
combat/tb/channel code changes, no lever proposal. The TB CHANNEL RESET
(whether a turn-based fight should inherit wounds from the open-field fight)
is a STEVE-CALL design question: traced only in this report, never proposed
as a lever, never smuggled into a recommendation. A cause outside F1–F13 was
never claimed from rows alone: every one of the 16 final-loss cases in this
corpus classified inside F1–F13, so no UNEXPLAINED or UNOBSERVABLE bucket was
needed.

## Before / after on identical seeds (baseline vs armed)

Seeds 73671–73678, 180-day death-aware runs, tableseat-nowait substrate.
Baseline = plain snapshot; armed = tableseat-nowait + the five w4dmg-a
recorders verbatim + seq51gap-diag verbatim + the new finalloss-diag
recorder. The recorders did not move the game at all:

| field | baseline | armed |
|---|---|---|
| wins | 4/8 | 4/8 |
| national-ever | 7/8 | 7/8 |
| national-final | 5/8 | 5/8 |
| table invited | 5/8 | 5/8 |
| table entered | 4/8 | 4/8 |
| wave-4 reached | 5/8 | 5/8 |
| wave-5 reached | 0/8 | 0/8 |
| median survival | 130d | 130d |
| deaths | 284 | 284 |
| starvation deaths | 2 | 2 |

Per-seed (both arms identical): 73671 180d survived wave-4 regional;
73672 118d won wave-4 global; 73673 32d village-lost wave-3 village;
73674 118d won wave-3 national; 73675 169d village-lost wave-4 global;
73676 144d won wave-4 national; 73677 130d won wave-4 global;
73678 122d village-lost wave-3 regional.

### Base movement against the prereg's bands (reported, never absorbed)

Against the prereg's 1920 band (wins 2/8, national-ever 6/8,
national-final 5/8, table 4/8, entered 2/8, wave-4 6/8, wave-5 0/8,
median 152d, deaths 307, starvation 1), this arm's own baseline differs on
every moving field: wins +2, national-ever +1, national-final 0,
table +1, entered +2, wave-4 −1, wave-5 0, median −22d, deaths −23,
starvation +1. Against the 0525Z current-base band (national-ever 7/8,
national-final 5/8, table invited 5/8, entered 4/8, wins 4/8, wave-4 5/8,
wave-5 0/8, median 130d, deaths 284, starvation 2) the baseline is EXACT.
The base moved between the dead prereg's 1920 band and today, and the
movement is exactly what strands the known instances: on the old base the
73672 run lived past day 148 and the 73673 run lived past day 112; on
current master they end at days 118 and 32.

### Wall numbers

| | baseline | armed |
|---|---|---|
| national-ever / final | 7/8 / 5/8 | 7/8 / 5/8 |
| table invited / entered | 5/8 / 4/8 | 5/8 / 4/8 |
| wins | 4/8 | 4/8 |
| wave-4 / wave-5 | 5/8 / 0/8 | 5/8 / 0/8 |
| wave-4 kills (nonworldkill, wave 4) | — (snapshot) | 2 total (73671: 1, 73677: 1, rest 0) |
| median survival | 130d | 130d |
| deaths | 284 | 284 |

Death-cause shares (baseline corpus, 284 deaths; armed total identical):
villager combat 43.3%, villager-vs-villager combat 24.6%, player arena
12.0%, villager expedition 7.0%, villager sickness 3.5%, wound that
wouldn't close 2.5%, ambush 2.1%, villager monster 1.8%, starvation 0.7%
(2 deaths: one villager, one player), dehydration 0.7%, and six single
deaths (lockjaw, The Redactor, The Congregation, player contest, alien)
at 0.4% each. Two seeds reached global rank without a table invitation
(73675) or without entering after invitation (73678) — rank alone does
not seat a village.

## Reachability verdict: the known instances do not exist on this base

- KNOWN seq51 (influencer, maxHp 850), seed 73672, day 148: **found 0**.
  Seed 73672's measured run ends day 118 with a win (table entered, won).
  Its armed corpus holds 17 finalloss tbEnd rows and 6 chains, all won,
  and no influencer rows at all. The day-148 siege never happens because
  the run is already over.
- KNOWN seq45 (algorithm, maxHp 1000), seed 73673, day 112: **found 0**.
  Seed 73673's measured run ends day 32 with the village lost
  (village-lost, wave 3, 19 deaths). Its armed corpus holds 5 finalloss
  tbEnd rows, 0 chains, 0 finals. Day 112 never arrives.

Corroboration from the non-measured narration-on replays (sense section):
both replays end on the same days (73672 day 118 won, 73673 day 32
village-lost), so the early endings are not an artifact of the recorder
arm. The known instances cannot be re-derived by any analyzer fix; they
need a base on which those runs live long enough, or new known instances
chosen from a current-base corpus (see metric review).

## Village assessment, in plain words

The villages in this corpus are not dying to a mysterious vanishing
monster. They die the way villages die: in fights (two-thirds of all
deaths are combat of one kind or another), on expeditions, and — on the
two short runs — by falling apart when the pantry runs dry (73673's
village scatters after three hungry days; 73678's after a longer grind).
Four of eight villages win outright, and a fifth reaches the top rank
without ever being invited to the table, which is a story in itself:
being the strongest village in the world does not guarantee a seat.

The final-loss question itself — "a monster that lost its last fight
vanishes instead of coming back" — turns out, in this corpus, to have
ordinary answers every time. Six of the sixteen cases are monsters that
were never actually restored because another monster was already standing
on the spot they would return to (the Haven tile, where lingering
monsters all pile up — see below). Six are monsters that did come back
exactly as the rules say they should, and were still there at the next
day's count. Three are monsters that came back, were fought again, and
were killed in that re-fight — gone, but for a reason you can watch.
One is a bookkeeping edge where the re-fight's ending landed just after
the day's snapshot, so the snapshot caught it mid-lift (see the F9 note).
Nothing in this corpus is a monster that simply blinks out with no
trace. The mystery the dead arm was chasing is, on current master, a
set of known mechanisms — and the one mechanism doing the most work
is the Haven pile-up, not any exotic bug.

## Classified final-loss table (16 cases, all classified)

Verdict counts: RESTORED (F6) 6, BLOCKED (F1) 6, REMOVED-AFTERWARDS (F8) 3,
LIFTED-WITHOUT-TBEND (F9) 1, THROWN (F7) 0, FINAL-ROW-EXPECTED (F10) 0,
UNEXPLAINED (F11) 0, UNOBSERVABLE (F12) 0, MISMATCH (F13) 0.
Every RESTORED case matched its predicted HP and tile exactly; no
post-present mismatch occurred anywhere.

### Seed 73671 (7 finals; run survived 180d, wave 4, regional)

| monster | day | final fight | verdict | what happened |
|---|---|---|---|---|
| buffering (seq23) | 74 | lost | RESTORED (F6) | Restored at 32 HP to the Haven tile; present at the day-74 count. |
| eulogy (seq43) | 138 | lost | RESTORED (F6) | Restored at 612 HP; present at the day-138 count. |
| eulogy (seq43) | 139 | lost | RESTORED (F6) | Restored at 900 HP; present at the day-139 count. |
| eulogy (seq43) | 140 | lost | REMOVED-AFTERWARDS (F8) | Restored at 663 HP to the Haven tile, then removed by the monster-turn lost-trail despawn (src/js/game.js:22561, "sounds fade", lostSight > 6). Gone, but the game said why. |
| moderator (seq27) | 167 | lost | BLOCKED (F1) | Origin tile (4,4) — the Haven tile — occupied by reunion (seq47, 900 HP) at the moment of restore. No restore written; absent at the count, as expected for a blocked restore. |
| reunion (seq47) | 167 | lost | BLOCKED (F1) | Same Haven pile-up: origin tile occupied by chorus_line (seq51, 225 HP). |
| chorus_line (seq51) | 167 | lost | REMOVED-AFTERWARDS (F8) | Restored at 243 HP to the Haven tile, then lifted for a new fight the same day (rowIdx 58, fight fmgpspj28_d0t199); day-168 fight ends won (rowIdx 59) — killed in the re-fight, so absence is expected. This is F8, not F9, because a following fight-end row exists. |

Note on the day-167 pile-up: for dawn-pinned lingerers the origin tile IS
the Haven tile, so Haven stacking DOES block through the origin-tile
check. The prereg's "Haven occupancy does not block" holds only when the
origin tile is not the Haven tile. All three day-167 cases sit on (4,4).

### Seed 73675 (6 finals; run village-lost 169d, wave 4, global)

| monster | day | final fight | verdict | what happened |
|---|---|---|---|---|
| eater (seq28) | 145 | lost | BLOCKED (F1) | Origin tile (4,4) occupied at restore time; absent at the count. |
| eulogy (seq31) | 145 | lost | BLOCKED (F1) | Same Haven pile-up on (4,4). |
| suburb (seq36) | 167 | lost | BLOCKED (F1) | Same Haven pile-up on (4,4). |
| reunion (seq38) | 167 | lost | RESTORED (F6) | Restored at 1184 HP; present at the day-167 count (at tile (4,3), having wandered off the Haven tile after restore). |
| reunion (seq38) | 168 | lost | LIFTED-WITHOUT-TBEND (F9) | See the F9 note below — the one genuinely subtle case in the corpus. |
| reunion (seq38) | 169 | lost | RESTORED (F6) | Third day running: restored at 1200 HP; present at the post-run count. The two earlier fights that day were also lost and also restored exactly. |

### Seed 73677 (2 finals; run won 130d, wave 4, global)

| monster | day | final fight | verdict | what happened |
|---|---|---|---|---|
| influencer (seq39) | 112 | lost | REMOVED-AFTERWARDS (F8) | Restored at 388 HP to the Haven tile, then lifted for a new fight the same day; that fight ends won (fmgpspijk_flgohj) before the count — killed in the re-fight. Not the known seq51 instance (different seed, different monster). |
| suburb (seq42) | 123 | lost | BLOCKED (F1) | Origin tile (4,4) occupied by redactor (seq43, 195 HP). |

### Seed 73678 (1 final; run village-lost 122d, wave 3, regional)

| monster | day | final fight | verdict | what happened |
|---|---|---|---|---|
| terms_of_service (seq45) | 121 | lost | RESTORED (F6) | Restored at 267 HP; present at the day-121 count. Not the known seq45 instance (different seed, different monster, different day). |

### Seeds with no finals

73672 (6 chains, all won), 73673 (0 chains), 73674 (2 chains, none
final-lost), 73676 (1 chain, none final-lost). A chain that ends won is
not a final loss and is not counted here.

### The F9 note (seed 73675, reunion seq38, day 168) — read this before citing F9

This is the only F9 in the corpus, and its plain-words story is subtler
than "lifted and never ended." The monster lost twice on day 168; the
second loss restored it at 1200 HP. But that restore happened in a second
phase of day 168, AFTER the day-168 count had already been recorded
(the count and the restore share tick-epoch 166 — the frozen-day
mechanism the analyzer's stale-tick rule exists for). The next count is
the day-169 count, by which time the monster had already been lifted for
its day-169 fight — so the day-169 count shows it absent, and the
re-fight's ending lands just after that count, in day 169's second phase.
Under the pre-registration's definition (no fight-end row for that
monster between the lift and the count), this IS F9: removal rowIdx 52,
startCombat lift, day 169, with no fight-end row afterwards before the
count. But the fight DID end — fight fmgpspj04_6rwvac, lost, restored
at 1200 HP, visible in the post-run count. So F9 here means "lifted for
a fight whose ending fell after the day's snapshot," not "lifted and
never ended." Any future citation of F9 should carry that qualification,
and the metric review below proposes tightening the definition.

### What did not fire

No restore ever threw (F7: 0 — the `[titan] piece restore` warn path
never triggered in this corpus). No final row was a "should never have
restored" case (F10: 0 — no F3/F4 finals). No case was left unexplained
(F11: 0) or unobservable (F12: 0). No restored monster came back at the
wrong HP or tile (F13: 0 — all six RESTORED cases matched prediction
exactly, which independently validates the restore prediction model:
lingerers return at min(maxHp, standing HP) to the Haven tile;
non-lingerers at full maxHp to their origin tile).

## Gates and cross-checks

- G1 det-gate: PASS (seed 73671: baseline 180d/181 gameDays, wrapped
  180d/181 gameDays, tsNationalDay 91 both, diagSurface false,
  wrapsInstalled false, gapTicks 0, finRows 0). Fresh record from this
  sweep, not a stale file.
- G2 recorder neutrality: PASS 8/8 (days, gameDays, tsNationalDay,
  faced-map, and kill-log identical baseline vs armed on every seed).
- Cost bar: PASS (armed starvation 2 <= baseline 2 + 2; armed median
  130d >= 0.8 x baseline 130d).
- (a) w4dmg wave-4 field rows == wave4enc wave-4 field rows per seed:
  PASS on all 8 seeds (73671: 4=4, 73672: 2=2, 73673: 0=0, 73674: 0=0,
  73675: 1=1, 73676: 0=0, 73677: 1=1, 73678: 0=0).
- (b) w4dmg tb rows join to nonworldkill starts (wave 4) minus named
  unjoined: PASS, unjoined 0 on all seeds.
- (c) source-sum identity on every w4dmg field row: PASS, sumFail 0.
- (d) recorder errors zero and overflow zero (all recorders including
  finalloss): PASS, diagErrs 0, overflow 0 on all seeds.
- (e) every finalloss tbEnd row with a fightId joins to a nonworldkill
  start or w4dmg tbEnd: PASS, finUnjoined 0 on all seeds.
- (f) seq51gap tick gaps per seed: no gap inside any known-instance day
  (there are no known-instance days in this corpus — the runs end
  before them; gaps elsewhere do not touch a known instance because
  there is none to touch). Tick gaps are listed per seed in the corpus
  rows; the stale-tick mechanism (same-day ticks skipped when the
  fight-end's tick-epoch equals that day's epoch-after) fired on the
  73675 reunion saga and on the 73677 influencer case, and skipping
  them is what keeps those verdicts correct.

Proof: `scripts/test-finalloss-adopt-a.js` — 120 PASS, 0 FAIL over the
corpus files (bands, G2, cross-checks, finals, known-instance absence,
verdict rule). Detail reproduction: `--detail 73672` re-runs armed
73672 and reproduces the corpus classification exactly (days 118,
gameDays 118, census match, 0 finals).

## Sense section (opportunistic, NON-MEASURED, never census)

From narration-on replays of seeds 73672 and 73673
(`evidence/2026-10-27/sim-finalloss-adopt-a-sense-<seed>.txt`). These
replays are not measurements and nothing here enters the census; they
exist to answer "what would a player watching see?" and "do villagers
act like people?"

- What a player watching a final-loss vanish would see: the game does
  not narrate disappearances as vanishings. On seed 73672, day 115, two
  lingering wave-4 monsters at the treeline get the explicit siege line:
  "The lingering Captain Bright-Eyes gorges at the treeline — 816 kcal
  gone from the stores. Endure it (they drift off within ~6 nights —
  the gorge is the price), or send a sortie: fighters, rations, real
  risk." The drift promise IS voiced; the departure itself falls past
  this run's end (day 118 win), so the player hears the warning, not
  the goodbye. A blocked restore (F1) has no line at all — the monster
  simply never comes back, which is the one genuinely silent case.
  A re-fight kill (F8) plays out as a fight the player can watch.
  Nothing in either replay reads as an unexplained blink-out.
- Villagers act like people: yes, in these samples. Olivia, facing an
  empty pantry on day 32 of seed 73673, stands up by the fire and lays
  out real options with real costs ("tighten our belts together, three
  days, no exceptions — or the hunters go out on empty stomachs and
  earn it back… or we rally, second shift, everybody"). Enrique chooses
  Pack Hunt and the game marks it "Earned, chosen." Aroha and Enrique,
  James and Desmond, linger over the fire together — small social
  beats, not just stat blocks. Seed 73673 ends in the scattering:
  "Haven couldn't hold. On the third hungry day, people started
  walking — in different directions." That is a coherent human ending,
  not a mechanical fizzle. Seed 73672 ends with the Feared path's
  mercy beat at the table — also coherent, and the win the census
  records.
- The sense replays corroborate the trajectory finding: both end on
  the same days as the measured runs (118 won, 32 village-lost), so the
  known instances are absent with narration on too.

## Metric review (MEASUREMENT.md §14)

The pre-registered metrics bound this run, and this run reports against
them without revision. Two doubts are recorded here for the NEXT run;
neither changes this run's verdict.

1. **The re-derivation requirement assumes trajectory stability across
   bases, and the base moved.** Condition (2) — both known instances
   must re-derive from this arm's corpus — fails not because the
   instrument is broken (all 16 corpus finals classify, all gates pass)
   but because the runs that carried the known instances no longer
   reach their known days. For the next run, either (i) re-baseline the
   known instances from a current-base corpus first (pick new known
   instances that actually occur on current master, e.g. from this
   corpus's own 16 cases), or (ii) pin the arm to the base the known
   instances were observed on. That choice is the coordinator's, and
   it must be made BEFORE the next run's pre-registration, not during
   it. What must not happen: quietly dropping condition (2) or
   substituting a near-miss (same monster, different seed/day) and
   calling it re-derived.
2. **F9 as defined can fire on a snapshot-boundary artifact.** The
   73675 day-168 case is F9 by the letter (no fight-end row before the
   verdict count) but the fight did end, just after the count, in a
   frozen second phase. A tighter next-run definition would treat a
   fight-end row in the same day's second phase (or visible in the
   post-run count) as ending the lift, and reserve F9 for lifts with
   no fight-end row at all before the NEXT count. Under that tighter
   definition this corpus would hold 0 F9 cases and the day-168 case
   would read as a delayed RESTORED. This run keeps the pre-registered
   definition and reports F9: 1 with the qualification attached.
3. **The Haven pile-up deserves a name in the next prereg's cause set
   discussion.** Six of sixteen finals are F1, and every one is the
   same shape: lingering monsters all pinned to the single Haven tile,
   so the first one restored blocks the rest. That is the dominant
   final-loss mechanism in this corpus, and it is a consequence of the
   havenGrowth nightly re-pin (all lingering raiders to one tile) plus
   the origin-tile occupancy check — both existing systems, neither
   touched here. Whether that pile-up is intended behavior is a
   design question (Steve-call territory if it touches the restore
   rule), not a measurement finding.

## Comparison-of-record note

The balanced panel has no corpus-ingest mode, so paired identical-seed
tables (baseline vs armed, same seeds, same policy) are the comparison
of record for this arm. No panel file was faked, and telemetry-check
was not run on recorder rows.

## What could not be measured, and why

- The two known instances (seq51/73672 day 148, seq45/73673 day 112):
  unmeasurable on current master because the runs end at days 118 and
  32. Not an analyzer gap — there are no rows to classify.
- F3/F4/F7/F10/F11/F12/F13 mechanisms: zero occurrences in this corpus,
  so their behavior on current master is unobserved here, not
  disproven. In particular the restore-throw path (F7) never fired;
  whether it can fire at all remains untested by this corpus.
- Death-cause shares for the armed corpus beyond totals: the armed
  rows carry the same death maps and the same totals (284), so the
  shares above are reported from the baseline corpus with the armed
  total identical; per-cause armed shares were not separately
  tabulated because G2 neutrality (faced-map, kill-log, days,
  gameDays, ts) already establishes the armed runs are the same runs.
- The TB CHANNEL RESET question: traced only, per the DIAG-only bound.
  This report takes no position on whether turn-based fights should
  inherit field wounds, and proposes no lever. That question belongs
  to Steve.

## Files

- Evidence (this file):
  `evidence/2026-10-27/sim-finalloss-adopt-a.md`
- Adoption pre-registration:
  `evidence/2026-10-27/sim-finalloss-adopt-a-prereg.md`
- Corpus (16 rows + det-gate + summary):
  `evidence/2026-10-27/perseed-finalloss-adopt-a/`
- New recorder (FINALLOSS=1, no existing recorder edited):
  `scripts/policies/finalloss-diag.js`
- Sweep + analyzer: `scripts/test-finalloss-adopt-a-sweep.js`
- Proof script (120 PASS, 0 FAIL): `scripts/test-finalloss-adopt-a.js`
- Sense replays (non-measured):
  `evidence/2026-10-27/sim-finalloss-adopt-a-sense-73672.txt`,
  `evidence/2026-10-27/sim-finalloss-adopt-a-sense-73673.txt`
- Branch: `sim-finalloss-adopt` (commit to follow; no push, no bump,
  no live verification — coordinator merges via --ff-only).
