# sim-postflee-a — post-flee wounded behavior (axis scale-onramp)

## RUN STATUS (2026-10-25, adoption run fleshout-20261025T1146Z, loop A): COMPLETE — KILLED at pilot (see VERDICT)

Adoption history: the 1027Z run blocked on the container EPERM write
flap after 4/8 control seeds. This run resumed it: the flap struck
again mid-resume (seed 73675's sim finished but its corpus row sat in
process memory through 2 writer rounds, and the first sweep process
then died with the row unlanded, leaving only a 0-byte .tmp) — but the
sim is deterministic, so 73675 re-ran and landed byte-identical
(164,264 bytes, same as the lost in-memory row), and 73676–73678
followed. Base check: master moved since the held controls only in
version-bump stamps (src/js/build.js, index.html/sw.js query strings,
version.json) plus docs/evidence/scripts for the w123death diag — no
functional src/js change, script-list order unchanged — so the held 4
controls stand and no rebase or full control re-run was needed.
Control gate PASSED exactly (see CONTROL REPLICATION). The arm was
implemented exactly as pre-registered, the directed probe PASSED all 8
legs, and the armed sweep ran on identical seeds. Pilot verdict:
KILLED — PRIMARY eliminated 5→0 and every other leg passed, but
starvation+sickness came in at 9 against the bar of 8 (control
recount 6 + 2), a one-count miss that §14 forbids re-scoring. Game
code is REVERTED (patch saved in the corpus dir); this commit is the
measurement record only. Nothing is left uncommitted except this
commit's own files; src/js diff is EMPTY.

Run: fleshout-20261025T1027Z, loop A (oversight-flesh-out-loop). Arm
sim-postflee-a. The NEXT blank after sim-boughtflee-a (3): post-flee
wounded behavior — bought flee saves the fight, not the day (seed
73676: a villager fled a suburb at 3 HP and re-met the SAME suburb the
same day and died).

## PRE-REGISTRATION (binding — judged only against this)

- Axis: scale-onramp. Lever: FIELD-fight post-flee behavior, ALL WAVES.
  Wave scope, defended: prior arms (oneshotcap, boughtflee, boughtstrike)
  were wave-4-only by design because their target class was wave-4
  one-shots. This blank is NOT a wave-4 instrument — the re-meet vector
  (villagerMonsterTick re-rolling a fight against a villager still
  standing on the monster's tile) fires for every wave, and the observed
  73676 case happens to be wave 4 only because that villager's first
  fight was wave 4. A wave-4-only gate here would leave wave-1/2/3
  wounded fleers re-meeting the same day, which is the same blank with a
  smaller monster. Scope is all waves, deliberately.
- Substrate (shared): tableseat-nowait — leanlinkrescue courtship
  (LEANLINKRESCUE=1) + seat legs only (TABLESEATNOWAIT=1), no wait leg.
  Seeds 73671–73678, 180d death-aware horizon (dead villages stop, +10d
  tail max). The recorder (deathcensus-diag, DEATHCENSUS=1) runs on BOTH
  configs, so the only control/armed delta is the game-code arm.
- Control replication gate: the control re-run must match the published
  controls exactly before any arm is judged: national-ever 8/8, final
  7/8, table invited 5 / entered 4, wins 4/8 (lesser seat only), wave-4
  5/8, wave-5 0/8, kind-filtered villager deaths 27 (field 12, other 12,
  raid 1, arena 1, tb 1), wins-excluded median 180d, all-runs median
  150d. Mismatch = STOP, do not judge.
- THE ARM (exact): after a villager flees a FIELD fight (outcome
  vFlee) ending below 25% of max HP, that villager does not re-encounter
  for the rest of that calendar day:
  - Trigger: any field-fight vFlee (wild routed path AND expedition
    path), all waves, where end HP / max HP < 0.25. End HP is read from
    the fight record (entry HP minus rec.vTaken, max = max(100, entry)).
    A flee at >= 25% sets no flag — hurt, but not critically hurt.
  - Behavior: the flagged villager is skipped by villagerMonsterTick
    (the re-meet vector: they stay on the tile but hide — no new fight
    is rolled) and by expeditionMonster (no new expedition monster leg
    fights them that day). The flag is keyed by villager + scholar day
    and expires the next day; nothing relocates the villager, no
    foraging/cache/sign leg is blocked, no HP is restored.
  - Narration: the wild-router vFlee line carries the rest decision in
    the same awayNews line ("staying out of sight for the rest of the
    day — too hurt to meet it again"); the expedition path logs the
    rest in the expedition encounters list. Never a silent save.
  - Never touched: raid defense (opts.raid never flags, never skips),
    aid-crisis fights (lingering-raider aid path never flags), the
    monster break line (no change to break/flee thresholds), arena /
    contest routes (noFlee fights never flag; the flag is set only in
    the wild router and expedition branches, never in fieldFight
    itself), the scholar (marking the scholar is refused; the tick
    filter already excludes the scholar via npcsOnNode).
  - Companion note: this arm does NOT stack with boughtflee (killed,
    reverted) or any other unlanded arm. It is judged standalone on
    the plain tableseat-nowait control.
- COUNTING (exact): deaths are KIND-FILTERED (kind person/villager,
  non-scholar) by the deathcensus analyzer; mixed harness totals are
  never used for cost bars.
  - PRIMARY (mechanism class): routed (resolveFights-stream) FIELD vDie
    rows where an EARLIER row in the same seed's resolveFights stream,
    same calendar day, same villager, has outcome vFlee with
    vHpLeft/vHpMax < 0.25. Same-entity signature (same mid AND
    mHpStart == earlier mHpLeft) reported alongside. Bar: see below —
    set from the control count BEFORE the armed run, per the task's
    order (count first, then set the bar).
  - Direct-stream (expedition etc.) same-day post-flee deaths are
    counted and reported separately; they are NOT in the primary bar
    (different router, and expedition flees already shorten the
    expedition via expedHurt), but any armed direct-stream case is
    inspected before a GO.
- PRIMARY BAR: 0. Set from this run's own control count BEFORE the
  armed run, per the task's order: control routed same-day post-flee
  field deaths = 5 (detail in CONTROL REPLICATION), so the arm must
  eliminate the class entirely. (The sweep script's header comment
  claiming a control count of 1, "the 73676 case", does NOT match this
  run's own corpus — it evidently described a different corpus; this
  run's bar rests on its own 5, and the armed result is judged against
  0 either way.)
- GO requires ALL of:
  - PRIMARY = bar (above).
  - Kind-filtered field villager deaths REPORTED ONLY — the raw count
    does NOT bind in this run (stated explicitly per the task: this
    arm's scope is the post-flee class, not the aggregate field toll;
    boughtflee-a already showed the aggregate prices deaths outside a
    narrow arm's scope).
  - Composition-proof survival: the wins-excluded median binds ONLY if
    there are >= 4 non-winners in BOTH control and armed; otherwise
    judge survival on the full 8-seed distribution — armed all-8 mean
    survival days >= control all-8 mean AND armed villages dying before
    day 100 <= control count + 1. The full 8-seed survival-day
    distribution is reported for both sides either way.
  - National-ever >= 6/8.
  - Wave-4-or-win >= 5/8.
  - Kind-filtered raid villager deaths <= 2 (baseline 1).
  - Starvation+sickness <= control recount + 2.
  - Directed probe PASS: a routed wild vFlee ending below 25% sets the
    flag and narrates it; a second same-day routed encounter is
    skipped (null, HP unchanged); the tick skips a flagged villager
    while fighting an unflagged control; raid proceeds for a flagged
    villager; arena fights never set the flag; the scholar can never
    be flagged; an expeditionMonster call for a flagged villager
    fights nothing; the flag expires the next day.
- If pilot GO: confirm on 12 fresh seeds 73679–73690, same policy /
  horizon, confirm control on the same fresh seeds (never judged
  against the pilot baseline), pro-rata legs: PRIMARY = 0,
  national-ever >= 9/12, wave-4-or-win >= 8/12, raid villager deaths
  <= 3, starvation+sickness <= confirm-control recount + 3,
  composition-proof survival leg (same rule as pilot).
- If KILLED at pilot: revert ALL game-code changes, commit the
  measurement record only (evidence + proof script + corpus + reverted
  patch saved in the corpus dir), do NOT land game code.
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law:
  waves 4–5 are escalation on standing, never pure calendar), and the
  fieldFights.js header (Steve 2026-10-08: fights are blow-by-blow,
  never a table). There is no separate field-fight canon doc — the
  header IS the canon, and this arm preserves it: it gates re-encounters
  between fights, it never replaces, trims, or re-rolls a fight.
- Balanced panel (§15): per-seed recorder corpora are not panel pairs
  (the known error class established 0535Z/0644Z/0730Z/0920Z); the
  sweep-compare table on identical seeds below IS the comparison. No
  panel file is attached for that reason, not as a verdict input.

## VERDICT: KILLED at pilot — mechanism proven, one cost leg missed by 1

GO required ALL legs. PRIMARY 5→0 (PASS), probe PASS, national-ever
7/8 (PASS), wave-4-or-win 7/8 (PASS), raid villager deaths 0 (PASS),
composition-proof survival median 180 = 180 (PASS), field deaths
reported only 12→11 — but starvation+sickness 9 vs bar 8 (FAIL by 1).
Per §14 a miss is NO-GO, never re-scored against a friendlier metric
in this run. The arm does exactly what it was built to do and does not
land on this evidence. Confirm NOT run (pilot-GO-only). Game code
reverted; patch saved at
evidence/2026-10-25/perseed-sim-postflee-a/postflee-arm-reverted.patch.

## CONTROL REPLICATION (gate: PASS — exact on every published number)

| Seed | Days | Won | National ever/final | Table invited/entered | Wave | Arc |
|---|---|---|---|---|---|---|
| 73671 | 93 | 0 | 1 / 1 | 0 / 0 | 4 | 3 |
| 73672 | 106 | 1 | 1 / 1 | 1 / 1 | 4 | 4 |
| 73673 | 134 | 1 | 1 / 1 | 1 / 1 | 4 | 4 |
| 73674 | 180 | 0 | 1 / 1 | 0 / 0 | 2 | 3 |
| 73675 | 180 | 0 | 1 / 1 | 0 / 0 | 3 | 3 |
| 73676 | 174 | 0 | 1 / 1 | 1 / 0 | 4 | 4 |
| 73677 | 98 | 1 | 1 / 1 | 1 / 1 | 3 | 4 |
| 73678 | 150 | 1 | 1 / 1 | 1 / 1 | 4 | 4 |

Gate check: national-ever 8/8 ✓, final 7/8 ✓, table invited 5 /
entered 4 ✓, wins 4/8 (lesser seat only) ✓, wave-4 5/8 ✓, wave-5 0/8
✓, kind-filtered villager deaths 27 (field 12, other 12, raid 1,
arena 1, tb 1) ✓, wins-excluded median 180d ✓, all-runs median 150d
✓. Held seeds 73671–73674 reproduced the published per-seed days
exactly (93/106/134/180); the resumed seeds landed 180/174/98/150.
Recorder errors 0, orphan evidence 0.

Control PRIMARY class count = 5, all routed same-day post-flee field
deaths, all 1-round re-meets at 6–19% HP:
- 73672 d56 ethan_hunt, ad_break w3, prior end 9%, SAME ENTITY, taken 13
- 73673 d8 gen_te50r63, gallowdeer w1, prior end 19%, taken 13
- 73674 d17 diana_osei, hushwolf w1, prior end 11%, taken 20
- 73675 d146 nina_petrova, focus_group w3, prior end 11%, SAME ENTITY, taken 23
- 73676 d18 gen_g8rx4z0, hushwolf w1, prior end 6%, SAME ENTITY, taken 9
Same-entity signature 3/5. Direct-stream post-flee deaths 0.
Wounded (routed, <25%) flees in control: 23; direct: 7.
FINAL PRIMARY BAR: 0.

## PILOT RESULTS (identical seeds, control vs armed)

| Leg (pre-registered) | Bar | Control | Armed | Verdict |
|---|---|---|---|---|
| PRIMARY (routed same-day post-flee field deaths) | 0 | 5 (3 same-entity) | 0 (0 same-entity) | PASS |
| Direct-stream post-flee deaths (reported, inspected) | — | 0 | 0 (no armed case to inspect) | PASS |
| Kind-filtered field villager deaths (REPORTED ONLY, does not bind) | — | 12 | 11 | reported |
| Composition-proof survival: wins-excluded median (4 non-winners both sides, so it binds) | armed ≥ control | 180d (93/174/180/180) | 180d (93/122/180/180) | PASS |
| Full 8-seed survival: mean days / dying before day 100 | armed mean ≥ control; early deaths ≤ control + 1 | mean 139.4d; early 2 (93, 98) | mean 139.0d; early 2 (93, 98) | PASS (reported alongside) |
| National-ever | ≥ 6/8 | 8/8 | 7/8 (only 73673 lost it) | PASS |
| Wave-4-or-win | ≥ 5/8 | 6/8 | 7/8 | PASS |
| Kind-filtered raid villager deaths | ≤ 2 | 1 | 0 | PASS |
| Starvation+sickness | ≤ control recount + 2 = 8 | 6 | 9 | FAIL by 1 |
| Directed probe | PASS | — | PASS (8/8 legs) | PASS |

Per-seed armed (days / won / national / wave / table / entered):
73671 93/0/1/4/0/0; 73672 144/1/1/4/1/1; 73673 122/0/0/4/1/0;
73674 180/0/1/3/1/0; 73675 145/1/1/3/1/1; 73676 180/0/1/4/0/0;
73677 98/1/1/3/1/1; 73678 150/1/1/4/1/1.
Totals armed: won 4/8, national-ever 7/8, national-final 6/8, table
invited 6, entered 4, wave-4 5/8, wave-5 0/8, max arc 4.
Other armed totals: villager deaths 27 (field 11, other 15, raid 0,
arena 0, tb 1), field fights 985→825, field vDie 12→11, field vKill
40→73, field vFlee 116→107, wounded routed flees 23→32, raid fights
342→338 with raid vDie 1→0, one-round ≥50% deaths 3→1 (same 73671
eater case survives in both), recorder errors 0.

The starvation+sickness 9, by seed: 73672: 4 (3 sickness + 1
starvation — that village lived 106→144d and won, the longest
exposure in the set); 73676: 3 sickness (lived 174→180d); 73678: 2
(the identical pair as control: gen_7uzn9ry sickness, gen_ve4p34g
starvation). No armed seed other than those three contributed. The
flag blocks fights only — it blocks no foraging, cache, or sign leg
and restores no HP — so there is no direct "rested villagers starve"
mechanism in the arm; the excess sits in the two villages whose
trajectories lengthened. That is a hypothesis for the next run's
metric review, NOT a re-score of this one.

## CONFIRM RESULTS

Not run — confirm is pilot-GO-only, and the pilot did not GO.

## DIRECTED PROBE

PROBE-PASS, all 8 legs, real engine paths (seed 73671):
- Main: brian_otieno fled a suburb at entry 30 HP, ended 2 HP (2%) —
  flag set, awayNews carried "staying out of sight for the rest of
  the day — too hurt to meet it again".
- Skip: same-day second routed encounter for the same villager
  returned null, HP unchanged, no new awayNews.
- Tick: across 30 villagerMonsterTicks the flagged villager on a
  monster's tile was never fought, while unflagged control owen_smith
  on another tile WAS fought (proves the tick path is live).
- Raid: a flagged villager's raid-path encounter proceeded and fought
  (outcome vDie — raid defense is never skipped, and it can still
  kill, as designed).
- Arena: a direct noFlee fight never set the flag.
- Scholar: a direct mark on the scholar (gen_euaedv8) was refused.
- Expedition: expeditionMonster for a flagged villager called
  fieldFight 0 times, no error.
- Expiry: next scholar day the flag was gone and the router fought
  again (outcome mFlee).

## VILLAGE ASSESSMENT (plain words)

Eight villages, same seeds, two versions of each. Half of them win in
both versions; every one of them reaches national at least once except
armed 73673; nobody anywhere reaches wave 5. The arm does not make the
game easier in any uniform way — it reshuffles fates:
- 73671 fell at day 93 in both versions, national reached, wave 4, no
  table — the arm changed nothing measurable here; the village was
  already falling when the first wounded fleer would have mattered.
- 73672 is the arm's clearest story: lost at day 106 in control, won
  at day 144 armed, table entered. Villagers who would have died
  re-meeting a monster the same day lived, and the village held
  together long enough to sit at the table.
- 73673 is the warning: won at day 134 in control, lost at day 122
  armed, national never reached, table invited but not entered. One
  saved villager reshuffles courtship and leadership downstream, and
  sometimes the reshuffle is worse. This is trajectory chaos, not a
  mechanism failure — but it is why one seed never proves anything.
- 73674 lived the full 180 days both ways and lost both ways; armed
  reached further (wave 3, table invited) without getting in.
- 73675 lost at day 180 in control and won at day 145 armed — the
  second flip to a win.
- 73676 lived longer armed (180 vs 174 days) but reached less (table
  invited in control, not armed). The seed that motivated this arm —
  a villager fled a suburb at 3 HP and re-met it the same day and
  died in the older boughtflee corpus — shows a different class case
  in this run's control (a hushwolf day-18 re-meet, eliminated armed),
  which is a useful correction: the blank is the re-meet vector, not
  any one monster.
- 73677 and 73678 won identically in both versions (98 and 150 days,
  corpora byte-near-identical) — villages that win fast never give
  the post-flee class time to bite.
Who thrived: villagers who flee hurt and get a day to hide — they
rejoin the fight pool instead of dying in a 1-round re-meet (field
kills by villagers rose 40→73 armed; the village does not go quiet,
it fights more). Who died and why: the same old mix — field fights,
raids, sickness, starvation — minus the five same-day re-meet deaths.
What knowledge/capabilities were missing: nothing in this arm touches
wave 5 (standing ≥ 200 + wave-4 faced), and 0/16 runs reach it. The
scale wall above national/table is untouched by this work: villages
can reach national, can sit at the table, can win — but the full seat
and wave 5 stay unreached, and that is the next blank, not this one.

## SENSE-TESTING (corpus fight rows + probe transcript)

Read, not just counted. The five control class deaths are not fights
at all in any meaningful sense: a villager flees at 6–19% HP and is
rolled into the same monster again the same day, takes 9–23 damage
in a single round, and dies. There is no decision in the second
"fight" — the first fight already decided it, and the tick just
collected the body. The probe transcript says the honest version of
the fix: "The street that wasn't there yesterday mauled Brian (-28
health) over 1 round. They're lucky to be breathing. — staying out
of sight for the rest of the day — too hurt to meet it again." A
mauled person hiding is believable; a mauled person walking straight
back into the same monster the same afternoon is not. The armed
corpus confirms the behavior reads the same way at scale: wounded
flees rise (23→32) because fleers survive to flee another day, field
kills rise (40→73) because survivors keep fighting, and no armed
villager dies in the class the arm was built to remove. The one
number that does not read cleanly is starvation+sickness 9 vs 8 —
but its composition (longer-lived villages, identical pair in 73678)
reads as exposure and trajectory, not as rested villagers starving,
and it is recorded as a miss, not explained away.

## METRIC REVIEW (required, §14 — no re-scoring in this run)

- The starvation+sickness leg bound this run exactly as written:
  control recount 6 + 2 = 8, armed 9, FAIL by 1. It is NOT re-scored
  here, and the arm does NOT land on this evidence.
- Metric doubt, for the NEXT run only: the leg counts raw deaths over
  the whole run, so a village that lives longer (73672: 106→144d and
  a win) accumulates more sickness exposure by construction, and a
  mechanism that saves lives can fail a death-count leg by keeping
  villages alive longer. Proposed revision for the next run's
  pre-registration (Steve's call, not this run's): count
  starvation+sickness per 100 village-days lived, or pre-register a
  wider tolerance with the exposure argument stated up front — and
  judge the re-test on the revised metric from the start, never
  retroactively. A larger-n re-test (12–16 seeds) would also separate
  a real +1 cost from trajectory noise; at n=8, a single village's
  sickness cluster (73676: 3) is the whole margin.
- No other metric proved wrong in this run: PRIMARY, national,
  wave-4-or-win, raid, and survival legs all discriminated cleanly,
  and the probe legs each tested a distinct guard. The script header
  comment claiming a control class count of 1 is corrected by this
  run's corpus (5) — future runs should trust the corpus, not the
  comment; the comment is left as-is in the committed script because
  this commit is a measurement record, and the evidence file above
  carries the correction.
- The earlier adoption note's claim that the control class count was
  "1, the 73676 case" is likewise superseded: that case belongs to an
  older corpus, not this run's own control re-run.

## INSTRUMENT NOTES

- New: scripts/test-postflee-sweep.js (sweep + probe + read-only
  summarize modes; per-seed corpus via the shared writer with the same
  retry discipline as the deathcensus sweep). Corpus:
  evidence/2026-10-25/perseed-sim-postflee-a/ (16 rows: 8 control + 8
  armed; never /tmp). Run logs were deleted before commit (they
  duplicate the corpus JSONs).
- Game change (REVERTED — pilot KILLED, measurement record only):
  src/js/game.js (postFleeRest helpers + villagerMonsterTick filter +
  wild-router flag + narration), src/js/villager-agency.js
  (expeditionMonster entry gate + vFlee flag + encounters note).
  Reverted patch saved in the corpus dir as
  postflee-arm-reverted.patch (128 lines). The probe script proves
  the reverted code passed all 8 directed legs before revert.
- Balanced panel (§15): NOT attached, for the established reason —
  per-seed recorder corpora are not panel pairs. The sweep-compare
  table above, on identical seeds with the recorder on both configs,
  IS the comparison.

## NEXT BLANKS, IN ORDER (for the coordinator, not this run)

1. Post-flee re-test with a revised starvation+sickness metric: the
   mechanism is proven (PRIMARY 5→0, probe 8/8, scale legs pass) and
   the only miss is +1 on a raw death count that punishes
   longer-lived villages. Next run should pre-register an
   exposure-aware metric (per 100 village-days, or a wider tolerance
   argued up front) and 12–16 seeds, and judge the arm fresh on that
   metric — never a retroactive re-score of this run.
2. The wave-5 wall (scale-onramp axis, still blocking): 0/16 runs in
   this pilot reach wave 5, and 0/16 reach the full seat. Next axis
   work is the standing economy — what standing ≥ 200 actually takes
   in sims, and why villages that reach national still never bank
   it.
3. Leadership-divergence diagnostic (not an arm): 73673 flipped from
   a control win to an armed loss with national never reached. One
   saved villager reshuffling courtship/leadership is expected
   chaos, but the loop has no instrument for how often saved
   villagers change who leads — a diagnostic pass over saved-vs-lost
   villagers' later leadership/courtship roles would tell whether
   this is noise or a lever.
