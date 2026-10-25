# sim-scale-onramp-round-0535 — coordinator evidence (axis scale-onramp — 3 arms KILLED at pilot, nothing landed)

Run: fleshout-20261025T0535Z (Sun 2026-10-25 00:35–~01:50 CDT). Axis: scale-onramp
(converging). Loop B live on food-economy at run start (claim
fleshout-loop-b-20261025T0335Z, arms sim-casecount-adopt-b +
sim-rotdecide-govern-b, heartbeats fresh) — NOT touched. This run
worked the topmost non-converged axis not named in any live claim:
scale-onramp. No sibling claim, tree, branch, or file was touched at
any point; sibling landings below are master-tip moves only. At
closeout B had started a fresh run (claim fleshout-loop-b-20261025T0630Z) —
also NOT touched.

## PRE-REGISTRATION (coordinator level, binding)

- Substrate (all arms, shared): tableseat-nowait — leanlinkrescue
  courtship (LEANLINKRESCUE=1) + seat legs only (TABLESEATNOWAIT=1),
  no wait leg. Seeds 73671–73678, 180d death-aware — the SAME band
  as standing99 / vetkill / vetshape / encounter-a / arenadeath /
  wave2enc / fieldfinish / 0337Z, reuse intentional: these are
  re-measurements of those seeds with new behavior, not fresh bands.
- The 0337Z run's named next blank (1): remedy design choice (toll
  floor vs break-line exception vs defender finish), each with its
  own pre-registration. This round works all three as separate
  game-code arms in separate worktrees. Blank (2) (survivability
  companion) was NOT bundled with any remedy, per the 0337Z order.
- Shared COST BAR (all arms, must also pass): band median survival
  >= 120d (control 150d); starvation totals <= control+2 AND
  arm-only starvation <= control arm-only+2; wave-3+ field vDie
  <= 12 (control 6); national-ever >= 6/8. A miss is NO-GO, never
  re-scored.
- LANDING RULE (stated to all three workers up front): at most ONE
  remedy lands. A gate-progress GO (tollfloor/breakexcept) takes
  precedence over a cleanup GO (defendfinish); between gate GO arms,
  fewest added villager deaths, then most focus conversions, then
  smallest diff. A killed variant leaves no trace on master — its
  branch evidence is dropped with the branch, and this coordinator
  file is the surviving record.
- Balanced panel (§15): attempted by all three arms; all three hit
  the known error (balance-panel.js compare requires panel pairs;
  these corpora are per-seed recorder rows). Sweep-compare tables on
  identical seeds are the comparison for this run. Panel-contract
  lane not touched.
- Pilot only: 8 seeds per arm. No confirm spend in this run.
  Back-to-back second round NOT taken: elapsed run time exceeded
  the ~30m fallback window.

## Arm 1 — sim-tollfloor-a (TOLL FLOOR, game-code) — KILLED at pilot, NOT merged

Worker commit 0563ba89 (branch sim-tollfloor-a, now deleted).
Change, exactly as pre-registered: in havenGrowth.js havenRaidTick
ONLY, the palisade toll floors at the field break line — if pre-toll
HP is above the floor (ceil(0.15*maxHp) wave>=2, ceil(0.25*maxHp)
wave 1, wave via existing crisisWaveOf), post-toll HP =
max(pre − toll, floor); if already at/below the floor, no toll at
all (never heal, never raise). No field-fight, arena, deed, or
volley change. No haven/raid canon doc exists — noted in the arm
evidence; the design lives in havenGrowth.js comments, which the
change preserves.

- Own control replicates the historic baseline exactly on every
  headline number (won 4/8, median 150d, national-ever 8/8,
  national-final 7/8, table 5/entered 4, wave-4 5/8, wave-5 0/8,
  starvation 3, deaths 261, field wave-3+ fights 87, vKill 0,
  vDie 6, strict wounded-repeats 14, rounds-0 mFlee 19, raid rows 77).
  Reconciliation: 0337Z's "50 hit-1 events" = raids containing a
  hit-1 (50/77); the diff-row count is 100.
- T1 — TWO READINGS, both reported: LITERAL (net raid-tick diff
  rows): toll-created below-line 44, hit-1 5 — FAIL. TOLL-ATTRIBUTABLE
  (the quantity T1 names): created 0, hit-1 0 — PASS. The diff-row
  instrument conflates the toll with defender fights inside the same
  tick; decomposition (test-tollfloor-decompose.js) shows all 44
  armed net below-line rows and all 5 net hit-1 rows are
  fight-wounded (60/64 cross-checked against the defender fights'
  own field rows), and the unit test proves the toll code directly.
  This instrument error does NOT change the verdict, because T2
  fails outright.
- T2 — FAIL: band villager wave-3+ field kills 0 (bar >= 3);
  focus conversions 0/3 (control strict types 73675 chorus_line,
  73677 chorus_line, 73678 spool; armed kill types on those seeds:
  empty). Per the pre-registered rule, T1-pass + T2-fail is NO-GO.
- COST — PASS on all legs: median 134d (>= 120); starvation 2 vs
  control 3; villager-only starvation 2 vs 3; per-seed excess 0;
  wave-3+ field vDie 5 (<= 12); national-ever 7/8 (>= 6/8).
- Overall: NO-GO. Armed band: won 4/8, median 134d,
  national-ever 7/8, wave-4 7/8, wave-5 0/8, deaths 270 (+9), field
  wave-3+ fights 60, strict repeats 8 (vs 14).
- Mechanism, honestly stated: the toll was one manufacturer of
  below-line entities, not the manufacturer. The toll's real
  manufacture was toll-written 1s (96 attributable hit-1 rows in
  control → 0 armed) — the famous 43→1 arrivals were
  already-below-line raiders dropped to 1, not above-line raiders
  pushed below (only 4 attributable crossings in control). Every
  fight ending in mFlee below the line manufactures the same stuck
  state, above all the raid's own defender fights. The floor removes
  the toll's 1s but leaves the fight-wounded population, and the
  break line still makes all of them flee at round 0.
- Sense read: no converted kill exists, so the worker read a toll
  event's aftermath — armed 73671 drumbelly_tanuki: defenders beat
  two tanukis to 5 HP and 1 HP on day 8, then the village meets
  those same animals on days 9–77 (1 HP on 9/30/53/65/77, 5 HP on
  10/12/14/26/28/45/53/56), every meeting rounds-0 mFlee. The floor
  changes not one line of that story — the defender fights wrote
  the 5 and the 1, not the stakes.
- Proofs: unit test 11/11 (RED with 5 failures before the edit,
  GREEN after); check.js --only fieldfight 2 passed, 0 failed.
  check.js --quick was started but killed at ~16 min with no
  observable output (buffered through tail) — stated, not hidden.

## Arm 2 — sim-breakexcept-a (BREAK-LINE EXCEPTION, toll-marked only) — KILLED at pilot, NOT merged

Worker commit e8b0b7278 (tip; main work commit 9d7526ad0; branch
sim-breakexcept-a, now deleted; rebased cleanly onto master
acc3d6030, unit proof re-run green post-rebase).
Change, exactly as pre-registered and NOT a HOLD clone: (1)
havenRaidTick tags a drafted raider tollMarked only when the toll
itself pushes post-toll HP below the break line (0.15 wave>=2 via
crisisWaveOf, 0.25 wave 1, verified from code); otherwise any stale
flag is cleared. (2) In FIELD fights only, the flag is captured and
cleared when the fight engages (after the awareness/evade return),
and the round-0 post-volley break-flee is skipped once for that
entity. Untouched: in-round break check after round 1, volley
drive-offs, signature/trick mFlee, vFlee/evade, deed credit, tb
path, and the arena (opts.noFlee never excepts).

- Own control replicates the historic baseline exactly on every
  headline number (won 4/8, median 150d, national-ever 8/8, final
  7/8, wave-4 5/8, wave-5 0/8, starvation 3, deaths 261, field
  wave-3+ fights 87, vKill 0, strict repeats 14, rounds-0 mFlee 19).
- B0 (narrowness proof) — PASS: unit proof 9/9 — unmarked
  below-line meeting still ends rounds-0 mFlee; toll-marked meeting
  reaches round >= 1; toll-marked arena meeting still ends
  rounds-0 mFlee. On pristine code the marked/tagging legs failed
  by design, proving test sensitivity.
- B1 (directed probe) — PASS: named toll-marked chorus_line
  meeting reaches round 1 and kills (35 damage, 0 taken).
- B2 — FAIL: band villager wave-3+ field kills 2 (bar >= 3);
  focus conversions 0/3 (73675 chorus_line, 73677 chorus_line,
  73678 spool all 0 kills). The 2 kills were 73671 chorus_line and
  73676 focus_group, neither a focus conversion.
- COST — FAIL: median survival 116d (bar >= 120d). Other legs pass:
  starvation band 2 (bar <= control+2 = 5); per-seed starvation max
  excess +1 (bar <= 2); wave-3+ field vDie 8 (bar <= 12);
  national-ever 7/8 (bar >= 6). The median miss is corroborated,
  not a lone artifact: deaths 261 → 390, wins 4 → 3, national
  final 7 → 5.
- Overall: NO-GO. GO requires all four legs.
- Mechanism: the exception fires exactly as scoped (119/119
  toll-marked fights excepted; strict wounded-repeats 14 → 1;
  rounds-0 mFlee 19 → 2; per-mFlee break-arrival reasons 19 → 2) —
  but it mostly operates where the bar doesn't look. 114 of 119
  toll-marked fights arrived at exactly 1 HP and 111 ended in
  kills, yet only 7 meetings were wave-3+, and 5 of those broke
  in-round after one strike (one round finishes a 1-HP beast, not
  a 30-HP one). Wave-5 stayed 0/8 both arms; wins stayed
  lesser-seat only. Same village-cost pattern as HOLD/NOFLEE in
  miniature, despite the far narrower scope.
- Next question this arm names: why wave-3+ toll-marked meetings
  are only 7/119 — raids draft mostly wave-1/2 monsters.
- Sense-testing: both transcripts read as village life — Owen
  finishes a 1-HP chorus line that stands, counts its beat, and
  deals 0 damage; Sigrid wounds a 30-HP chorus line for 17 and it
  breaks in-round (no closing line, pre-existing in-round-break
  behavior). The exception line itself ("came over the palisade
  wounded and does not turn") is legible.
- Checks: fieldfight suite 2 passed, 0 failed; armed seed 73671
  re-run reproduced days/gameDays/ts/field rows exactly.

## Arm 3 — sim-defendfinish-a (DEFENDER FINISH, game-code) — KILLED at pilot, NOT merged

Worker commit 89a59645d (rebased from ebf8adce4; branch
sim-defendfinish-a, now deleted; final base d02d91234, journey
scale r32 — master moved under the worker from 384c89dda, rebased
inside its worktree only, no conflicts, unit re-run GREEN
post-rebase; the sweep corpus itself was measured on 384c89dda,
stated in the arm evidence).
Change, exactly as pre-registered: in havenGrowth.js havenRaidTick
ONLY (+41/−3), when the toll would leave a drafted raider strictly
below the field-fight break line (post-toll HP < 0.15×maxHp
wave>=2, < 0.25×maxHp wave 1, verified from code; exactly at the
line still stands), the raid finishes it: removed from the world,
said aloud, skipped by defenders/linger/player-pending, and excluded
from the aid-crisis wave tier. No field-fight, arena, or volley
change. No deed or wave-ledger credit invented — there is no
raid-kill ledger in the game, and the change deliberately never
calls recordWaveKill.

- Own control reproduces the historic band exactly (won 4/8,
  national-ever 8/8, final 7/8, wave-4 5/8, median 150d, deaths 261,
  W3 fights 87, W3 vKill 0, vDie 6, strict 14).
- D1 — PASS: toll below-line survivors 0 — 130/130 below-line toll
  raiders finished, toll hit-1 survivors 0 (control: 220 drafted,
  all 220 survived, 216 hit-1 survived).
- D2 — PASS: strict wounded-repeats 5 vs control 14, threshold
  <= 7.
- COST + SCALE GUARD — FAIL (two legs): median survival 117d
  (< 120d); wave-4 reach 4/8 (< control 5/8). All other guard legs
  pass: starvation 3 = control 3, villager-only starvation 3 =
  control 3, wave-3+ field vDie 2 <= 12, national-ever 8/8 >= 6/8.
- KILLS LEG (reported, not GO): field wave-3+ villager kills 0
  (unchanged — cleanup, not conversion); raid finishes 130; raid
  finishes in the wave ledger 0 by construction. The one same-day
  same-type log match (73676 d48 hushwolf) is an agency kill by a
  third entity, resolved in evidence — the raid that day drafted
  two hushwolves, one finished, one fled.
- Other band movement (reported, not scored): wins 6/8 vs 4/8,
  table invited 7/8 vs 5/8, entered 6/8 vs 4/8, national final 7/8
  = control, total deaths 233 vs 261, wave-5 0/8 both, full seat
  unreached both.
- Overall: NO-GO. GO-CLEANUP requires D1 + D2 + COST + SCALE GUARD.
- Recorder correction (carried, mechanism unaffected): the 0337Z
  recorder undercounted raids (77 vs true 90, 50 vs 216 hit-1)
  because its same-index diff gate dropped raids when kills
  shifted the world list.
- Infrastructure notes: a mid-loop control contamination was caught
  and repaired (later V2 control seeds would have loaded armed
  code; only 73671/73672 had completed and prove control by their
  own numbers; 73673–73678 were re-run pristine via a stash of only
  the worker's havenGrowth.js, popped explicitly, sibling stashes
  untouched). check.js --only raid: 6 passed, 1 failed —
  test-util-raid-crisis-20261010.js (aidCrisis not a function)
  proven pre-existing by failing identically on pristine HEAD code.
- Sense-testing: finish beats read sensibly as village life (RAID
  announcement → stakes finish → "the watch drags the bodies
  clear", knowledge-gated nouns throughout). Noted wrinkles:
  duplicate-noun listing inherited from the RAID line itself, and
  one sense raid where all five raiders died on the wall with no
  defender fight.

## Cross-arm verdict

All three remedies are KILLED at pilot; nothing merges. The wall's
mechanism is now decomposed one level deeper, and the toll is
demoted from prime suspect to one manufacturer among several:

1. The toll is NOT the main manufacturer of stuck monsters.
   Defender fights write most below-line wounds (tollfloor sense
   read: the 5-HP and 1-HP tanukis the village kept meeting were
   defender-fight wounds, not stake wounds). A toll-only fix cannot
   convert kills.
2. Toll-scoped remedies cannot move the wave-3 gate because raids
   draft mostly wave-1/2 monsters: only 7 of 119 toll-marked
   meetings were wave-3+ (breakexcept). Even a perfectly firing
   exception converts wave-1/2 kills, not veterans.
3. Raid finishes clear toll entities and even lift wins (defendfinish
   6/8 vs 4/8) but do not convert field kills, and they trip the
   guards on median and wave-4 reach. Cleanup without conversion is
   not a scale remedy on this band.
4. The break line remains load-bearing villager protection in every
   variant tried (HOLD, NOFLEE, breakexcept): each trades stalemate
   for blood in proportion to its scope. Any future finish lever
   still needs its survivability companion, measured separately.

## Village assessment (plain words)

The villages on this band look the same as they have for a week:
they reach the region, they get invited to the table, and a few
sit down and win the lesser seat — but nobody climbs to the full
seat, nobody reaches wave 5, and nobody kills a wave-4 monster.
What changed this run is the explanation for WHY the villages
cannot grow veterans: the wounded monsters that should become
veteran-making kills are not mostly made by the palisade stakes.
They are made by the village's own defenders in raid fights, and
then the same wounded animals come back, turn away before anyone
can strike, and come back again. Fixing the stakes alone changes
nothing the villagers can see. Clearing the stakes' victims from
the field makes the village win slightly more often at the table
but does not teach anyone to finish a real fight. The missing
capability is still the same: a way for villagers to finish a
wounded monster in the field without dying for it — and a reason
for the bigger monsters to show up at the palisade in the first
place.

## Wall numbers (this run's judged corpora, 48 configs: 3 arms x 16)

- Controls (all three replicate exactly): national ever 8/8,
  final 7/8, table invited 5/8, entered 4/8, wins 4/8 (lesser seat
  only), wave-4 5/8, wave-5 0/8, median survival 150d.
- Armed pooled: wins 13/24 (tollfloor 4/8, breakexcept 3/8,
  defendfinish 6/8); national-ever 22/24; wave-5 0/24; full seat
  0/24; entered-full 0/24.
- Wave-3+ field kills armed: tollfloor 0, breakexcept 2,
  defendfinish 0 — against a control 0 that no remedy converted
  into a focus-seed kill (focus conversions 0/3 on all three arms).

## TELEMETRY DEVIATION CHECK

Run on each arm's per-seed corpus before branch deletion (baseline
scale-wall.json, metrics national,table,wins,exiled): 2 LOUD lines
per corpus, identical all three — "national disappeared: baseline
12 -> current 0 (n=17 files)", "wins disappeared: baseline 16 ->
current 0 (n=17 files)". Both are the known path/regime artifact
class (per-seed rows carry nationalEver/entered/won, not top-level
national/wins paths; WINSEAT baseline regime differs from this
pre-seat substrate). Actuals: national ever 8/8 controls, wins
4/8 controls. Baseline NOT rolled. No new investigation.

## Infrastructure

- Master moved 4 times under the run from sibling lanes
  (journey deepening r44, casecount-adopt-b, journey crisis r51,
  journey scale r32, sim-c1scope-b) — zero file overlap with any
  arm; breakexcept rebased once, defendfinish rebased once, both
  clean; tollfloor's branch base stayed 384c89dda (its worktree
  master ref was stale — noted, moot, branch deleted unmerged).
- Safe-commit index clobber hit all three worker commits —
  repaired via cacheinfo each time, commits verified correct.
  Coordinator commit below guarded the same way (see closeout
  verification).
- No EPERM flap blocked this run. Worktree registration took
  ~4.5 min total (slow, not failed).
- check.js --quick NOT re-run on master: nothing merges, so there
  is no master change to gate; targeted suites are reported per
  arm above. The standing 280/7 profile from 0337Z is unchanged by
  this run.

## Metric review (required, §14)

- T1 literal-vs-attributable (tollfloor): the net raid-tick diff
  instrument conflates toll wounds with defender-fight wounds in
  the same tick. Future toll arms must record the toll step itself
  (pre/post per drafted raider), not tick diffs. The verdict
  stands regardless (T2 fails outright), so this is a review note,
  not a re-score.
- Median is win-shortened (defendfinish): six armed wins end runs
  at days 90–135, pulling the median down even as wins rise. The
  median cost bar as written punishes winning early. Next run's
  pre-registration must decide whether the median bar uses
  all-runs median or a wins-excluded / win-day-adjusted median —
  this run's verdicts are NOT re-scored under either revision.
- Wave-4 reach vs wins (defendfinish): two armed wins skip wave-4,
  so the wave-4 guard leg fires on runs that won. Next run must
  decide whether wave-4 reach gates on wins-at-wave-3 or reach
  alone, before reusing the guard.
- Focus-conversion brittleness under cascade (carried from 0337Z):
  all three arms scored 0/3 on focus conversions while converting
  real kills elsewhere (breakexcept) or none at all. The directed
  probe (breakexcept B1, PASS) is the cascade-resistant leg; band
  kill bars alone keep missing the mechanism. Future finish arms
  should keep both legs.
- No metric was re-scored mid-run. All three verdicts stand on
  their pre-registered bars.

## Next blanks, in order

1. Survivability companion for any finish lever, own
   pre-registration, never bundled with a finish lever (carried
   from 0337Z — still the blocking companion).
2. Field-kill narration/gossip beat (carried from 0337Z — a finish
   nobody remarks on is a finish the village never learns from).
3. Raid draft composition diag: why wave-3+ toll-marked meetings
   are only 7/119 — do raids draft mostly wave-1/2 by design, and
   what would bring wave-3+ monsters to the palisade?
4. Defender-fight wound manufacture: defender fights write most
   below-line wounds — do defender fights need their own
   finish/retreat rule, or is the wound population the price of
   the palisade working as designed?
5. Metric revisions for the NEXT run (not this one): median
   win-shortening, wave-4 reach vs wins, toll-step (not tick-diff)
   recording. Each needs its own pre-registration before reuse.

scale-onramp stays converging (NOT converged): no remedy converted
a focus-seed kill, the full seat is still unreached, wave 5 is
still 0, and wins still come only through default-OFF courtship +
seat instruments on the lesser seat. The directive stands until
the tracker records this axis converged on measured evidence.
food-economy stays converging (untouched; sibling B loop).
Rotation left at 3 (convergence work does not cycle it).
Claim deleted; lock deleted.
Evidence (this file): coordinator only — all three arm branches
deleted unmerged per the killed-arm rule; arm evidence and corpora
were branch-only and dropped with the branches.
