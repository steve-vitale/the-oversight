# sim-scale-onramp-round-1515 — coordinator evidence

Run fleshout-20261118T1515Z, Loop A, axis scale-onramp. Loop B live at run
start on winnability chain (fleshout-loop-b-20261118T1430Z: partyquads-b +
aidleave-b, NOT touched); B closed mid-run (fd2a55fd5, aidleave DIAG-GO
landed + partyquads HELD). This run took the 1415Z next blanks (1)
seedplan and (2) damage-multiplier carrier, on one shared fresh pilot band
104601–104608 (verified fresh by both workers against all preregs; the
band is shared so baselines stay comparable across arms). Master at run
start 8bfd1874d; at closeout 7866afaa9 + this file.

## Arm 1 — sim-wildavoid-seedplan-a: METRIC-BROKEN (pilot), HELD

Branch `sim-wildavoid-seedplan-a`, tip f33c7215f (prereg e09f3bc32, fix
4f5feae78, driver validation 646f661b1, evidence bf89df6c2, corpora
f33c7215f). Worktree clean, NOT on master. The fix: a wild avoid seeds a
re-engagement plan the way a flee does — `src/js/game.js` only, both wild
routers call `winPlanSeedFromFight(vid, mdef, 'avoided')`, gated on
WILDSEEDPLAN=1 + VETREENGAGE=1, excluding raids and aid-crisis door
fights. Also built: the raid-aware B4 instrument (driver records
`opts.raid` on encounter rows; analyzer re-scopes B4 to non-raid
meetings). No fight-gate scoring or damage code touched (sibling arm's
area untouched; no overlap encountered).

Pilot (8 seeds 104601–104608, 150d, identical seeds; ctl = avoid on, no
seed; arm = avoid + seed): launches 5 → 5 (B2 PASS, thin — 5 launches
band-wide); wild deaths 18 → 18, flee damage 2,528 → 2,528 (B3 PASS);
outmatched non-raid Suburb deaths 0, fought 0 (B4 PASS); median survival
136 → 136, starvation 0 → 0, community loss 5 → 5 (C1–C3 PASS); D3 1.0
both legs; panel `review_required`, no `regression_signal`, all paired
deltas 0.

**Why METRIC-BROKEN, not GO/NO-GO:** the frozen B1/B5 bars are
unmeasurable under this arm's legs, by construction. Both legs run the
avoid, so outmatched meetings are avoids on both legs (4 vs 4, identical)
and never become encounters for the classifier to count — ctl would-avoid
= 1 (bar needs ≥ 8), and the single case is a raid-exempt herald death
(104607 d130, Kartono, 3 rounds, 149 taken, died to a 91-damage hit), a
case the lever is scoped not to touch. B5 fails only on its say-line
check (requires ctl say lines/avoids == 0 — a stale assumption from the
avoid-off control design). No confirm spend was run. The pilot stays
METRIC-BROKEN under its frozen prereg — do not re-judge it.

**The mechanism works where it could run:** Yuki Mori (104607) avoided
the same Influencer 4× (days 106–107); each avoid seeded/retargeted her
plan (v4seeds 5 → 9, dawnbidCensus 0 → 35, stage 'party'), fled seeds
byte-identical (58/29/45). But her party stayed empty for 35 days and no
launch followed — party formation, not seeding, is now the binding step.
Finding #2547 (open).

**Proof (verified by the coordinator on the branch tip):**
`scripts/test-wildavoid-seedplan-a.js` runs 104/105 — the 1 failure is §3
("src changes are exactly game.js (got [])"), an instrument artifact: §3
reads `git diff --name-only` (uncommitted changes) on a clean tree, so it
can only pass while the change is uncommitted. Verified directly instead:
`git diff --name-only 8bfd1874d sim-wildavoid-seedplan-a -- src/js/` =
exactly `src/js/game.js`. `scripts/test-wildavoid-a.js` 90/91 (§5, the
known stale-base artifact). Analyzer selftest ALL PASS; D1 repeatability
IDENTICAL; D2 wrap neutrality 59/59; smoke 150d clean, 0 errors, `raid`
on all 59 encounter rows.

**Next arm:** sim-wildavoid-seedplan-b — re-registered confirm of the same
fix with corrected bars frozen in its own prereg (B1 as arm-avoids vs
ctl-avoids with a contact floor; B5 say-lines per leg; B2 with a
launch-population floor; 'avoided' taught to the seed-path classifier).
Finding #2556 (open) records the metric-construction miss.

## Arm 2 — sim-fightcap-dmg-a: NO-GO (carrier never fired; wrong engine)

Branch `sim-fightcap-dmg-a`, tip 8ae363d52. Cherry-picked to master:
prereg 7aef4eb2d → 91b91b356, driver/analyzer 499a34522 → 8b7882862,
evidence+corpora 8ae363d52 → 7866afaa9. HELD on the branch, never landed:
carrier b9a2a295 (game.js TB carrier + proof) and substrate 480168a58
(the held launchparty-sense fix — NEVER land). Verified on master:
`git branch --contains` for both commits lists only
sim-fightcap-dmg-a; `FIGHTCAPDMG` occurs 0 times in master game.js;
analyzer selftest 10/10 on master. Proof test
`scripts/test-fightcap-dmg-a.js` 13/13 green on the branch tip (re-run
by the coordinator).

Pilot (8 seeds 104601–104608, 150d, identical seeds): kill share
pair-inclusive 0.000 (0/13) both legs (bar ≥ 0.25 — FAIL); trio-only
0/1 both; kill-share ratio 0 kills (bar ≥ 2× — FAIL); community loss
3/8 both, starvation 0/0 both, median survival 150d both (cost bars
PASS); instrument errors 0; panel `review_required` on zero deltas
(screen default, not a signal). No 12-seed confirm — gated off by the
NO-GO. The two legs are bit-identical on every measured number.

**The finding:** the carrier was built in the wrong engine. Launched-party
meetings resolve in the off-screen field-fight engine (fieldFights.js +
godpath field sim), never in the turn-based board fight where the carrier
lives (`tbVillagerAbility` in game.js). An instrumented probe showed a
launched holder was never evaluated against a wave-4+ monster in the TB
engine on two seeds (0 plan-holder calls). The pilot measures a null, not
the multiplier. The carrier itself is exactly real Rage (3 rounds, double
damage, same voice line, once per fight, gated FIGHTCAPDMG=1) — the
mechanism is proven, the placement is wrong.

**Secondary observation:** the two meetings where real Rage did fire still
fled at ~24% / ~13% of monster HP — a doubled weak base (~15/strike) adds
~30–45 damage vs ~1,200 HP. If the field-engine carrier also fails to move
kill share, the next question is the base strike (weapon/gear) or the full
winning shape, not a bigger multiplier. Finding #2554 (open).

**Next arm:** port the carrier to `fieldBegin` (godpath.js, called from
fieldFights.js:658 lead / ~1329 ally) — a launched holder vs wave-4+
counts as holding rage, firing through the existing `fieldAct` Rage branch
and paying the honest 60 kcal via `fieldPay`. Re-measure on the same frozen
bars. Finding #2552 (open, refines #2544). The carrier-fire proxy is
retired: the analyzer counted 2 "carrier" fires on BOTH legs — real Rage,
invisible to the 30-day snapshot; future detection must come from the
fight engine. Finding #2553 (open).

**Pre-existing, not this arm:** `scripts/test-abilityuse-twins-20261103.js`
25 passed / 6 failed, identical on pristine master — CONSUME failures
(fear accumulates across fights in one process). Finding #2555 (open).

## Wall (this run's judged corpora, 16 configs)

- Seedplan pilot: national standing 2/8, rank 0/8, table 0, wins 0,
  wave-4 8/8, wave-5 2/8, median 136d.
- Dmg pilot: national 0/8, rank 0, table 0, wins 0, wave-4 8/8 (13
  pair-inclusive launched meetings), wave-5 4/8, median 150d.
- Pooled: national standing 2/16, rank 0/16, table 0, wins 0, wave-5
  6/16. The wall is unchanged: villages reach 200+ standing on a quarter
  of one band and none convert to national rank. Standing-199 stall
  persists on prior bands (not re-measured here).

## Village assessment, in plain words

The seed works but the party doesn't come. Yuki Mori does everything
right — she spots the beast, steps aside four times, and her plan to go
back for it bids at dawn for 35 straight days — and nobody ever joins
her. She gets weaker while she waits (health 54 down to 37) and the
beast is still out there. The plan is no longer the missing piece; a
willing, geared holder who cannot find one companion in five weeks is.
On the damage side, the fix was built in the wrong room: the extra
strength was wired into the turn-by-turn fight view, but launched
parties fight off-screen, where that wiring never runs — so both sides
of the test came out byte-identical and nobody got stronger. The two
real Rage moments on the band still ended in flight with the monster
barely scratched, which says doubling a weak hit is not the answer by
itself. Nothing got cheaper or dearer anywhere else: deaths, starvation,
and survival are identical on both sides of both tests.

## Telemetry deviation check

`telemetry-check.js` against the scale-wall baseline on the dmg arm
corpus: REFUSED recorder-corpus input (all 8 rows carry top-level
anchorCommit; exit 2 — same documented refusal as prior runs). Baseline
NOT rolled. (Two invocation shapes failed first: a `*` in a directory
component is not expanded, and a directory path is read as a file; the
working form is `--current 'evidence/2026-11-18/perseed-fightcap-dmg-a-arm/*.json'`,
`*` in the basename only.)

## Metric review

- Seedplan: the frozen bars judged a design the pilot did not run. B1/B5
  were written for an avoid-off control (the confirm's design); this
  arm's legs both run the avoid, so the bars are unmeasurable by
  construction. The miss is in the prereg, not the lever — the next arm
  re-registers with corrected bars and does not re-judge this pilot.
- Dmg: the bars judged as written. The pool floor passed (13 ≥ 10), the
  kill-share bars failed at exactly 0 — the bars worked; the carrier
  never reached the fight. The carrier-fire proxy (2 fires both legs) is
  retired as an instrument: it counts real Rage through a 30-day
  snapshot, not carrier fires. No metric is re-scored here; the NO-GO
  stands.

## Infrastructure

- Registration slow (~7 min for two trees, registry lock contention —
  same as prior runs). Reaper ran clean at start (13/16 active).
- Safe-commit index clobber struck all 5 commits on each worker branch
  plus the coordinator cherry-picks were clean; worker-side repairs via
  the documented `ls-tree -r | update-index --add --index-info` pipe,
  commits verified correct. One worker note: safe-commit.sh silently
  drops directory paths (the first seedplan evidence commit missed the
  corpora — caught by verifying `git ls-tree`, recommitted with an
  explicit file list).
- Master moved under the run (journey crisis r241 ×3, Loop B 1430Z
  evidence fd2a55fd5); cherry-picks applied clean onto the moved tip.
- **Write flap (active this run):** the scratch-tree registration for
  the ladder-bundle base-pinned check failed twice — first the checkout
  errored "unable to write file" across thousands of files
  ("Could not reset index file to revision 'HEAD'"), then `git branch -D`
  failed EPERM writing `.git/packed-refs.new`. An orphan branch
  `ladderbase-check` remains (points at master tip, no commits of its
  own) and could not be deleted during the flap; the next run should
  delete it when writes clear and redo the check. Goal-file writes (this
  evidence's findings append) went through in the same window — the flap
  hit worktree-checkout and .git ref writes.
- **Ladder-bundle gap (1415Z, still open):** test-ladder-bundle-20261108
  still fails on current master (78 passed, 1 failed — control: 200
  monster turns WITHOUT delivery fire the ambient raid, fires 0).
  Whether it predates the wildavoid game-code landing is UNESTABLISHED:
  the base-pinned check was blocked by the flap above. Note for the next
  run: 95ba293f2 (the re-judge commit) changed NO game code, so it cannot
  be the cause — the question is against 5402d4cc3 (game.js + win-plan.js,
  the outmatched-avoid on the wild routers). The test's control drives
  `G.monsterTurn()` 200 times; the wildavoid diff touches
  `winPlanOutmatched`/`winPlanFightGate`/`winPlanBumpWildAvoid`, so a
  static exclusion is not available — run the test at 5402d4cc3^ and at
  5402d4cc3 in a scratch tree when writes clear.
- check.js --quick NOT re-run: zero src/js, zero green-list files landed
  (tooling + evidence only); the standing profile is the 1415Z addendum's
  336 passed / 6 failed, with the ladder-bundle failure now re-confirmed
  above rather than green.

## Sense-testing notes

- Seedplan: the "going back for help" line is now half-true — the plan
  exists and bids, but no help ever comes. Yuki's 35 days of empty-party
  bidding read as a village that cannot find a second person, not a
  villager who forgot. Her health sliding 54 → 37 while she keeps meeting
  the beast alone is coherent and bleak.
- Dmg: no transcript change to read — the carrier never fired, so the
  arm's fiction is identical on both legs by construction. The two real
  Rage meetings read as they should (a fighter burning bright, then the
  party leaving while the monster still stands at ~80% HP).

## Next blanks, in order

1. sim-wildavoid-seedplan-b — re-registered confirm of the held seedplan
   fix with corrected bars (#2556; do not re-judge the METRIC-BROKEN
   pilot).
2. Field-engine carrier port (#2552) — `fieldBegin` Rage carrier,
   re-measured on the frozen dmg bars; the TB carrier + proof test on the
   held branch is the mechanism reference.
3. #2547 party-formation diag — why no companion joins a bidding plan
   (bid-time pool on the stalled days, or stage the shape deliberately).
4. #2515 4th seat — 3rd-ally-slot arm in fieldFights.js, only after a
   capability arm shows what a winning party looks like (gate-4 question
   #2550 attached).
5. Repeat-avoid memory/cooldown (#2545) — Zoltan/Siya repeats persist;
   the seedplan arm did not touch them.
6. #2510 steering call — accept the 4 unknowns as closed-by-instrument
   or stage them deliberately (#2541).
7. #2542 scholar plan machinery — Steve-call whether intended or a gap.
8. Ladder-bundle base-pinned check — delete orphan branch
   `ladderbase-check` when writes clear, run the control at 5402d4cc3^
   and 5402d4cc3.
9. Twins-test CONSUME harness fix (#2555).
10. #2546 sling fiction bug (one-line fix, unclaimed).

Findings appended: #2552, #2553, #2554, #2555, #2556 (seedplan worker
appended #2547). Claim deleted; lock deleted. Dmg tooling+evidence merged
locally pending ship (91b91b356, 8b7882862, 7866afaa9); seedplan HELD on
branch sim-wildavoid-seedplan-a (tip f33c7215f, tree registered with a
fresh heartbeat); dmg carrier + substrate HELD on branch sim-fightcap-dmg-a
(tip 8ae363d52, tree registered with a fresh heartbeat).
