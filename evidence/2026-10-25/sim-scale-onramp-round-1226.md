# sim-scale-onramp-round-1226 — coordinator evidence (axis scale-onramp)

Run: fleshout-20261025T1226Z, loop A (oversight-flesh-out-loop).
Axis: scale-onramp (converging, NOT converged). Loop B live on
food-economy at run start (1029Z claim, arms sim-packtail-b +
sim-awayvoice-b) — NOT touched; no loop-B tree, claim, tracker,
or lock touched by this run. Rotation left at 3 (convergence work
does not cycle it).

Pre-flight: main tree clean (0 lines), disk 25%, reap clean
(8/16 active, all flagged trees other owners' uncommitted work —
left alone). No lock file existed at run start, so no stale-lock
recovery was needed; lock + claim written before any sims.

## Arms (multi-arm round, one shared substrate)

Substrate (shared, identical both configs unless noted):
scripts/policies/tableseat-nowait.js — leanlinkrescue courtship +
seat legs only, no wait leg; recorder DEATHCENSUS=1 on both
configs; 180d death-aware horizon (dead villages stop, +10d tail
max). Fresh band seeds 73679–73690 (12 seeds, never 73671–73678).

### Arm 1 — sim-postflee-retest-a: GO, LANDED as game code

The 1146Z post-flee rest arm (villager fleeing a FIELD fight below
25% max HP hides for the rest of that calendar day: skipped by
villagerMonsterTick + expedition-monster legs, no relocation, no
HP restored, narrated) re-tested on fresh seeds with a NEW
pre-registered cost metric. The worker re-applied the saved patch
(evidence/2026-10-25/perseed-sim-postflee-a/postflee-arm-reverted.patch;
`git apply --check` clean), ran the 12-seed control BEFORE applying
the arm, wrote the pre-registration into its evidence header BEFORE
the armed sweep, then ran probe + armed sweep.

Coordinator-set pre-registration (binding, judged only against this):
- PRIMARY: routed same-day post-flee field deaths (w123death
  definition: resolveFights-stream vDie where an earlier same-day,
  same-villager row is a vFlee with vHpLeft/vHpMax < 0.25). Bar set
  from this run's control count before the armed run: armed ≤ 2 AND
  armed ≤ control count.
- COST (exposure-aware, the point of the re-test): kind-filtered
  starvation+sickness deaths per 100 village-days (village-days =
  sum over 12 seeds of days simulated). Bar: armed rate ≤ control
  rate × 1.25. Raw totals diagnostic only, NOT binding.
- GUARDS (all binding): wins-excluded median ≥ 0.8× control median
  (≥4 non-winners both sides, else the postflee mean rule);
  national-ever ≥ control−2; wave-4-or-win ≥ control−2; raid
  deaths ≤ control+1. Directed probe must pass.
- GO = primary + cost rate + ALL guards + probe. Any leg fails =
  KILLED, game code reverted.

Judged numbers (coordinator-verified by independent
`--summarize` reproduction on the merged corpus — every number
below matches the worker's evidence exactly):

| Leg | Bar | Control | Armed | Verdict |
|---|---|---|---|---|
| PRIMARY (routed <25% post-flee deaths) | ≤2 | 5 | 0 | PASS |
| COST rate (starv+sick / 100 village-days) | ≤0.660 | 0.528 (8/1516d) | 0.488 (7/1434d) | PASS |
| Wins-excluded median | ≥144d | 180d | 180d | PASS |
| National-ever | ≥7/12 | 9/12 | 10/12 | PASS |
| Wave-4-or-win | ≥6/12 | 8/12 | 9/12 | PASS |
| Raid villager deaths | ≤2 | 1 | 0 | PASS |
| Directed probe | PASS | — | 8/8 | PASS |

Full band: control national-final 6/12, invited 3 / entered 2,
wins 2/12, wave-4 7/12, wave-5 0/12, full seat 0/12, median all
180d, villager deaths 41, field deaths 20. Armed national-final
8/12, invited 7 / entered 7, wins 7/12, wave-4 4/12, wave-5 0/12,
full seat 0/12, median all 119d (win-shortened), villager deaths
29, field deaths 10. Raw starvation+sickness 8 → 7 (diagnostic
only). `node scripts/check.js --only fieldfight` on merged master:
2 passed, 0 failed.

What the arm does in plain words: a villager who barely escapes a
fight, badly hurt, now hides instead of walking straight back
into the same monster the same day. Villages still lose people,
but they stop losing them to that one repeated mistake — and
because fewer people die pointlessly, more villages live long
enough to reach the wider world and take a seat at the table.

Sense-testing (armed narration, quoted from the probe): "The
street that wasn't there yesterday mauled Brian (-28 health) over
1 round. They're lucky to be breathing. — staying out of sight
for the rest of the day — too hurt to meet it again." Reads as a
hurt person hiding, not a mechanic.

Caveats, stated not hidden:
- Wave-4 alone fell 7 → 4, but the pre-registered guard is the
  union wave-4-or-win, which rose 8 → 9: five armed villages win
  at wave 3 before wave 4 is reached. The two earliest collapses
  (73682 at 18d, 73684 at 31d) are identical in both configs.
- Field-death class table (w123death priority): control post-flee
  (broad) 9, nearly-dead 3, grind 5, other 3 (total 20); armed
  broad 3, nearly-dead 4, grind 1, other 2 (total 10). The 3
  remaining broad post-flee deaths are NOT primary failures: each
  fled at ≥25% (carlos_diaz at exactly 25%, gen_c8oedup at 26%,
  yara_haddad at 27%), so no flag was set by design. The
  exactly-25% case is the next threshold question (see Next
  blanks), not a re-score.
- Full seat is 0/12 on both sides because it requires the wave-5
  deed bar; wave-5 is 0 throughout. The scale wall above
  national/table is untouched — wins and table entry move, the
  full seat does not.

Commit: dbe8dd189 (rebased tip; worker commit 82d11221a) —
"sim-postflee-retest-a GO ... [needs-eyes]" (28 files: src/js/
game.js + villager-agency.js, sweep script, evidence, 24 corpus
rows). The [needs-eyes] flag is included because the change
alters visible fight outcomes and narration.

### Arm 2 — sim-belltoad-a: DIAG, MECHANISM CONFIRMED, no game change

Row-level trace of the 73677 d67/d68 pair (two healthy villagers,
0 damage dealt over 2–3 rounds, 105/76 taken, dead, vs the same
40%-HP belltoad on consecutive days). Verdict: the villagers never
struck at all. Once the village learned the belltoad counter, the
field-fight AI spent every villager action SHOUTING the counter
instead of striking; the shout halves only the FIRST pack
member's next attack while the other three hit full (belltoad
pack = 4); trick-aware morale then held the shouter in the fight
("working the trick, not the damage race" at 36 HP) until death
arrived mid-monster-phase, jumping past the flee line. Wounds
persist on the world entity, so with 0 dealt the toad stayed at
18/45 across d65→d68 and killed two villagers on consecutive days.

Discriminating evidence: no strike lines exist in either death
log (not misses, not a damage floor, not immunity — belltoad has
no armor/evasion/immunity in monsters.json); james's pre-learning
single strike dealt 27; the counter was learned at the end of
the d65 fight after exactly 2 flee observations; corpus-wide,
0-dealt multi-round rows number 14 across 8 monsters, but
belltoad's 2 are the only deaths (other tricks terminate the
fight or negate damage). Deterministic replay census-matched the
corpus exactly. Sense: reads as a bug — Nora bellows twice,
watches one note die while three more throats keep croaking,
and dies without ever striking.

Proposed fix arms (ranked in sim-belltoad-a.md, reported not
fixed per the DIAG assignment): (1) make the shout disrupt the
whole chorus, matching the counter text; (2) don't let
trick-aware morale hold a non-progressing trick; (3) fall back
to strike-or-flee after the 2-shout cap. A fix arm should re-run
seeds 73671–73678 and show the belltoad engage-intent death class
going to zero. Side findings (not chased): the HP-floor flee
branch logs nothing, and pre-wounded leads below the break line
log "drove off with the bow" even for arrowless villagers.
Canon note: docs/MONSTER-WAVES.md has no belltoad entry; the
toad's data lives in monsters.json/monsterBehaviors.json.

Commit: cda7a2e10 (rebased tip; worker commit 264243eac) — exactly
2 files (evidence + test-belltoad-trace.js), zero src/js.
Coordinator check: `test-belltoad-trace.js --corpus` exit 0,
fail=0, reproduces both death rows (d67 105, d68 76, engage intent).

## Wall numbers (this run's judged band, armed)

National-ever 10/12, national-final 8/12, entered 7/12, wins
7/12 (lesser seat only, Feared path), wave-4 4/12, wave-5 0/12,
full seat 0/12, median survival all 119d / wins-excluded 180d.
scale-onramp stays converging (NOT converged): a real death
class is now fixed in game code and wins/table entry move
sharply, but wins still come only through default-OFF courtship
+ seat instruments on the lesser seat, the full seat is still
unreached, and wave 5 is still 0. The directive stands until the
tracker records this axis converged on measured evidence.

## Metric review (required, §14 — no re-scoring in this run)

- The 1146Z pilot NO-GO (raw starvation+sickness 9 vs bar 8)
  stands as judged. This run is a NEW band with a NEW
  pre-registered cost metric (rate per 100 village-days, chosen
  up front because raw counts penalize longer-lived villages);
  it does not re-score 1146Z, and 1146Z's raw-count bar is not
  re-applied here. Future post-flee arms must pre-register
  which cost metric binds before seeing armed data — the two
  bars must not be shopped between runs.
- The exactly-25% threshold (flag at <25% vs ≤25%) is a new
  question for the next arm, not a correction to this verdict:
  this arm's bar was <25% as pre-registered, and the 25% case
  was counted as out-of-scope by that same rule.
- BALANCED PANEL (§15): no panel compare .md is attached, for a
  stated instrument reason, not an oversight. scripts/
  balance-panel.js is a live-sim observer instrument (it runs
  sims itself with observer hooks); it takes no corpus input and
  cannot compare recorder corpora. Re-running the band through
  the panel would be a new experiment, not a comparison of the
  judged corpus. The before/after comparison for this run is the
  arm's pre-registered analyzer, independently reproduced by the
  coordinator's `--summarize` run on the merged corpus (all
  binding legs exact). Panel-native runs still use the panel.
- TELEMETRY DEVIATION CHECK: SKIPPED on purpose per the 1027Z
  and 1146Z standing instruction — telemetry-check reads 0
  wins/national on recorder rows whose analyzer-proven counts
  are wins 7/12 and national-ever 10/12, and the scale-wall
  baseline warns against comparing courtship substrates to its
  winseat regime. Baseline NOT rolled; do not re-run
  telemetry-check on recorder rows without a counting fix or a
  regime-segregated baseline.

## Infrastructure notes

- Orphan-branch cleanup (1146Z blank 2, first step): branch
  sim-belltoad-a verified equal to its base c737198d7
  (identical rev-parse, empty diff) and deleted before the
  fresh tree was registered. No ref surgery was needed.
- Coordinator accident, caught and repaired: the coordinator
  ran `test-postflee-retest-sweep.js --help` expecting usage
  text, but the script's default mode RUNS a sweep (different
  config: its s73679-control row came out days 119 / won 1 vs
  the committed days 180 / survived). The process was killed
  mid-run; the one touched corpus file was restored from the
  worker's commit (`git checkout --`), and the worktree was
  re-verified clean (status empty, diff empty) before any
  rebase. Lesson for future coordinators: never probe a sweep
  script with --help — read its argv handling first, and use
  only its documented read-only mode (--summarize here).
- Safe-commit index clobber struck both worker commits (bogus
  staged deletions, worktree bytes byte-identical to HEAD);
  repaired via cacheinfo in both worktrees and re-verified
  before merge. Commits were correct throughout.
- Master moved twice under the run (journey-crisis r50
  061b71823 + landing-note db1bc1082), zero src/js, zero file
  overlap. Both branches rebased clean in their own worktrees
  (belltoad once, postflee twice — the second after the
  belltoad merge moved master); every rebase verified as
  exactly the intervening commits by blob/file diff, then
  merged --ff-only in order. No EPERM flap blocked this run's
  ref writes; registrations ran slow (~2.5 min each) under
  sibling load and all succeeded.
- Post-flee tree removal quirk: after both merges, the
  postflee worktree directory had already vanished when the
  manual removal ran (".git does not exist"), and its branch
  was already gone on re-check. Both commits were already on
  master and verified there, so nothing was lost; the tree,
  branch, and registry entry are all confirmed absent at
  closeout. Main tree clean at closeout (0 lines).

## Village assessment (plain words)

The village learned to stop sending badly hurt people straight
back into the monster that just mauled them — and that one piece
of sense changed the whole run. Where the old band won twice and
sat at the table twice, the new band wins seven times and sits
seven times, with fewer pointless deaths along the way. What
hasn't changed: nobody has earned the full seat yet, and the
fifth wave of monsters still hasn't shown up at all. The
belltoad deaths turned out to be a different kind of lesson: the
villagers knew the monster's trick, used it exactly as taught,
and died for it — because the trick only quiets one voice in a
chorus of four, and the village's own courage talked them into
staying. Knowing the counter made that fight more dangerous, not
less, and that is the next thing to fix.

## Next blanks, in order

1. Belltoad shout fix arm (chorus-wide disrupt first, per the
   ranked list in sim-belltoad-a.md; re-run 73671–73678).
2. Post-flee exactly-25% threshold question (flag at ≤25% vs
   <25% — carlos_diaz case from this band).
3. Pool-presence lever for raid draft (0644Z blank 2, still
   untested).
4. Defender-fight wound manufacture (0644Z blank 3, still
   undecided).
5. Field-kill / field-save narration beat + bought-flee awayNews
   tap gap (carried).

Claim deleted; lock deleted. Evidence: this file (coordinator)
+ sim-postflee-retest-a.md + sim-belltoad-a.md (commits
dbe8dd189, cda7a2e10). Merged locally, pending ship — the ship
loop owns version bumps, pushes, and live verification.
