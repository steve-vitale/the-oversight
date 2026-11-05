# Loop A run fleshout-20261105T0415Z — food-economy (strandnarr + spoilname, both DIAG, no game change)

Run: oversight-flesh-out-loop, run_id fleshout-20261105T0415Z (scheduled 22:15 CST
2026-11-04). Axis: food-economy — the topmost non-converged axis not named in any
live claim. Sibling Loop B live on scale-onramp throughout (claim
fleshout-loop-b-20261105T0330Z, arms sim-killerdeath-b + sim-encounterprod-b,
heartbeat 3 min fresh at run start; killerdeath merged mid-run as 923eb112c +
170750f18, verdict NO-GO) — NOT touched. Rotation file reads 3 (villager agency)
but the convergence rule overrides rotation; the rotation file is left unchanged.

Claim written before any sims
(`hidden_files/lever-claims/fleshout-20261105T0415Z.json`, retired to .DEAD at
closeout); lock created at run start, deleted at closeout. Pre-flight: main tree
clean at c0e08a1bc, disk 29%, reaper removed nothing sibling-owned (11/16 active).
The git-write flap that blocked the 0015Z run's registrations is CLEAR: a probe
branch create+delete succeeded before any registration.

These arms are the 0015Z pre-registered arms that NEVER STARTED (flap-blocked).
Both ran to verdict this run. Neither changes any gate, price, deed, or win rule.
Zero src/js in either arm.

## Arm 1 — sim-strandnarr-a: DIAG capture-artifact (both claims, no fix)

Worker branch sim-strandnarr-a, commits c87a2005b (prereg) + 82bddc68e (evidence +
instrument + corpus) after rebase onto the moving tip; proof re-run 20/20 on the
rebased tip by the coordinator (full substrate gates
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1 POLICY=nighttravel
WOODCARRY=1 WOODWARM=0 BANKFOOD=1; unit leg alone is 10 checks, integration leg
adds 10 — a bare run prints SKIP, not failure).

What was wrong was the capture, not the game. The prior bankfood arm sliced
narration only from inside one `policy.daily` call, but the harness order per
loop-day is upkeep, wait, upkeep, wait, upkeep, wait, daily, sleep — so meal beats
spoken in upkeep and bedding-down/wake lines spoken in sleep fell between daily
slices and were never attached to any row. `Game.log` keeps only the last 40
lines, so a post-hoc log read cannot recover a full day either. The new
full-transcript instrument (scripts/policies/strandnarr-diag.js +
scripts/strandnarr-trace-b.js + scripts/analyze-strandnarr-b.js) wraps
`Game.say`/`Game.sysSay`, keeps every attempted line tagged with phase, loop-day,
and upkeep part, with markers at upkeep/daily/sleep entry/exit. It draws no RNG
and edits no state — the det-gate proves it (seed 17021, 60 loop-days,
instrument ON vs OFF: identical bankfood evenings, mornings, and first-upkeep
kcal series).

Anchor adjudication (seed 17021, loop-days 51–53, WOODWARM=0 leg; reproduced
exactly — thicket out-of-reach strandings, bankfood mode `flip`, skip
`no-gather-target`, 0 actions):

- Stranded nights: NARRATED. All three sleep windows open with "Sleeping rough
  means the cold ground — heal ~16." and "You settle into the cold ground. Sleep
  takes you." Nights 51 and 53 end with the night-out dawn line; night 52's dawn
  line is correctly replaced by a contest-grab "You wake with a start."
- Upkeep breakfast: CAPTURE ARTIFACT. The prior numbers reproduce to the unit on
  the morning after evening 52 (first-upkeep kcal 128 → daily-entry kcalBefore
  2310), and the upkeep window's first meal beat (part 1) is "You eat Muscadine
  Grapes (270 kcal)." Full window: 2,194 kcal of beats (270 grapes + 1,924
  blackberry) against a 2,182 kcal bar rise. This second instance matches the
  2115Z upkeepbreakfast closure exactly — the meal was narrated all along, in
  the upkeep window the old instrument did not record.

Pilot census (8 seeds × 60 loop-days, pre-registered; primary metric bedding-down
coverage, GO threshold met): stranded nights 11 (17021: 3 thicket; 15003: 8
creek; other 6 seeds stranded 0 times). Slept-through denominator 9 nights,
bedding-down lines 9/9 = 100%. Bedding presence on all stranded nights including
non-slept-through ones: 11/11. Night-out dawn note 7/7 uninterrupted dawns; the
4 non-clean nights are accounted for (3 wake-with-a-start interruptions, 1
overnight village death), not silent. A third stranded line, "You camp wild
tonight — no pantry meal," fires on 10/11 nights (missing only a mid-sleep wake).

Context questions (sense-tested, NOT arms): stranded pantry draws are legal
remote requisitions only — 8 mornings, 13,771 kcal, all
`havenStoresAccess='remote'`, 0 under `'none'`. Haven-gossip lines carry no
position gate in code and do appear in non-stranded sleep windows, but fired 0
times inside stranded windows this pilot — left as a question for a
gossip-targeted census, along with the "no pantry meal" vs remote-requisition
wording tension. WOODWARM=1 leg not run — the anchor reproduced exactly on
WOODWARM=0, so the prereg's leg rule stopped there.

Evidence: evidence/2026-11-04/sim-strandnarr-a.md (+ prereg); corpus
evidence/2026-11-04/sim-strandnarr-a-corpus/ (8 seed files; 17021 keeps the full
transcript verbatim).

## Arm 2 — sim-spoilname-a: DIAG-NO (no game-text silence to fix, no src change)

Worker branch sim-spoilname-a, commits 2c78747c1 (prereg) + 9c1f98529 (evidence +
instrument + 18-file corpus) after rebase onto the moving tip; coordinator
spot-re-proof on the rebased tip reproduced the verdict exactly (15376 stages A
and B: form named, sweep line verbatim; 15383 stage A: no removal at day 10,
bonus +2 — matches committed corpus).

Canon read first (docs/CANON.md + docs/PRESERVATION.md): spoilage honesty is
canon, but no sweep wording is prescribed; the sweep voice lives in
src/js/food.js `sweepSpoiled`. Full-transcript instrument (scripts/
test-spoilname-a.js): global `Game.say` wrap across the entire dawn window, both
the direct sweep call (Stage A) and the real `endDay()` dawn path (Stage B, with
a `sweepSpoiled` wrap pinning the exact pre-sweep pack), plus the morning record
in bankfood-diag `packSnap` shape.

Pilot (8 seeds 15376–15383, anchor first): fixture exact on all 8 via the real
`addUnknownToLump` path at day 8 (berries ×12 @ spoilDay 10, shoots ×5 @ 15,
roots ×4 @ 38; `anchorOk` 8/8). The dawn line on every removal, verbatim:
"Overnight, unknown berries went bad — beyond saving. You leave it for the
flies." (plus the preserve-teaching line only until the player knows preserving
— a designed voice gate, absent e.g. on 15379). Primary metric (prereg): form
named in Stage-A sweeps = 6/8 → NO-GO band (≥6/8) for a game-text fix.
Conditional read is stronger: 6/6 removal events at day 10 named the form, both
stages (12/12 stage-runs). The 2 non-naming seeds (15380, 15383) had NO removal
at all at day 10 — `spoilBonusDays()` (+6, +2; preservation_instinct, the one
bonus-aware spoilage boundary) legitimately extends the clock, and their morning
records correctly show no drop. Follow-up (post-prereg, not re-scored): at their
true spoil days (15380 @ day 16, 15383 @ day 12) the same sweep removes the
berries lump and names it, 2/2. Every actual removal across all 8 seeds is
named: 8/8. Stage B integrity: `endDayOk` 8/8, dayAfter 10 on 8/8, player alive
8/8, DAY 10 DAWN header in transcript 8/8.

The anchor observation, explained (record silence, not game silence): the
morning record's headline fields alone don't name the form — `lumpUnits` is a
cross-form total (21 → 9 on event seeds) and `lumpSpoilDays` a dateless list
([10,15,38] → [15,38]). But the full record and the transcript both name it:
stacks[] diff shows gone = `unknown berries|12` on all 6 event seeds. This is
the upkeepbreakfast capture artifact repeating: the silence was in the
headline-only reading, not the game. Remedy is at the reading (join stacks[]
diff or the sweep line to the headline). scripts/policies/bankfood-diag.js was
deliberately left untouched — shared sibling instrument tooling; the join is
demonstrated here, not imposed on other runs.

Left unjudged: the sweep line never states the unit count (×12 unnamed: 0/8 at
day 10, 0/2 delayed). A transcript reader knows WHICH form was lost, not HOW
MANY. Kept separate from the form verdict by the prereg and NOT built — a new,
un-preregistered narration change needing its own GO threshold and a
Steve-eyes decision. Suggested metric revision (in arm evidence): condition
form-naming on "removal actually happened" (raw 6/8 understates the honest 6/6,
8/8 eventual). No confirm spend (pilot judged, NO-GO, run ends here).

Evidence: evidence/2026-11-04/sim-spoilname-a.md (+ prereg); corpus
evidence/2026-11-04/sim-spoilname-a-corpus/ (18 files).

## Village assessment (plain words)

What the village looked like in these runs: scholars out alone on nighttravel
legs who get stranded — sleeping rough in a thicket or at a creek, eating their
morning meal out of the pack in the upkeep hour — are SPOKEN FOR. The game
already says they bed down rough, says when they spend the night out, and says
what they eat for breakfast. Nobody in these censuses starved unheard: the
nights that looked silent in earlier reports were silent only in the measuring
tool, which was listening to the wrong hour of the day. The one genuine gap the
tools still leave is quantity: when food goes bad overnight, the game names the
food but never says how much of it was lost — a reader knows berries went bad,
not that twelve of them did. The stranded scholar's other loose thread is
wording, not silence: the game says "no pantry meal" on a night when the pantry
can still reach them remotely in the morning. Both are small, honest narration
questions now, not missing systems.

Who thrived and who died and why: no death-share verdict belongs to this run —
both corpora are narration diagnostics (60 loop-days bankfood substrate;
10-day sweep fixtures), not survival panels, and no village in either corpus is
judged on living or dying. The strandnarr pilot's 4 non-clean nights (3
contest-grabs, 1 overnight village death) are accounted for as interruptions,
not as narration failures.

What knowledge/capabilities were missing: nothing in the GAME was missing for
these two blanks. What was missing was instrument coverage: daily-slice capture
misses upkeep and sleep windows, and headline-only record reads miss the
stacks that name the form. Both arms now leave reusable full-transcript
instruments behind (strandnarr-diag + trace-b; spoilname Stage A/B driver).

Which blank was filled vs documented: no game blank was filled (nothing to fix);
three backlog blanks are CLOSED as capture artifacts (see findings backlog):
stranded-night silence, second-instance upkeep-breakfast silence, per-form
spoil-sweep silence. Two new narrow blanks are DOCUMENTED (not chased mid-run):
sweep unit-count unnamed; "no pantry meal" wording vs remote requisition.

## Reachability verdict

Not a reachability run — no waves, arcs, regional/national, table, or win
content was exercised, and no wall numbers are claimed from these corpora.
Standing wall state is carried, not re-measured: last measured scale panel
(standaccum2, 99111–99126, 150d) showed national/table/wins 0/16, wave-5 unlocks
0/16, median survival 90.5d; sibling Loop B's killerdeath arm this cycle
returned NO-GO (0/8 pairs, retention applied but no second killer). The
winnability chain (killer simultaneity, wave-4 encounter production) remains
sibling Loop B's live work — untouched here.

## Metric review

Both arms judged strictly against their pre-registered headers; no mid-run
re-scoring. Strandnarr: primary metric bedding-down coverage met (9/9); the
upkeep-breakfast adjudication was a binary capture question, answered
ARTIFACT. Spoilname: primary metric 6/8 landed in the NO-GO band for a fix, and
the conditional 6/6 + 8/8 eventual read is reported alongside, not substituted
— the raw metric understates the honest rate because 2/8 seeds had no removal
to name. Recommended revision for the NEXT spoil-sweep run (not applied here):
condition form-naming on "removal actually happened." No metric proved wrong
enough to revise mid-run; both preregs held.

## Telemetry deviation check

Ran per the loop body (baseline
hidden_files/telemetry-baselines/scale-wall.json, metrics
national,table,wins,exiled) against both corpora: LOUD national/table/wins 0 vs
baseline on both (spoilname n=18 files, strandnarr n=8 files). Verdict:
EXPLAINED, not a regression — these are narration-diagnostic corpora (10-day
sweep fixtures; 60-loop-day bankfood substrate), not scale panels, and neither
corpus records scale outcomes at all. Same class as the 1445Z explained LOUD.
Baseline NOT rolled; no compare fabricated. No LOUD line for exiled.

## Infrastructure notes (for the next coordinator)

- Orphan-branch reuse: worktree-register REUSED the 0015Z orphan branch
  sim-strandnarr-a (base 7d3b628bf, the wildbucket tip) instead of creating a
  fresh branch at c0e08a1bc — the 0015Z round file's "delete it once git writes
  work again" cleanup never happened. The worker's 2 commits landed on the stale
  base; the coordinator rebased them onto the moving tip clean (zero file
  overlap with all intervening master commits, proofs re-run green). Next run:
  delete known orphan branches before registering, or verify each new
  worktree's branch point equals master tip at registration.
- Master moved under this run at least twice (Loop B killerdeath merge;
  journey establishment r102 commits). Every merge was ff-only after a clean
  rebase with zero file overlap; proofs green after every rebase and on merged
  master. Safe-commit index clobber hit worker commits (repaired via HEAD-blob
  cacheinfo, commits verified correct) — same known class, no data lost.
- Strandnarr worker note, reported as incomplete not failure: `check.js
  --quick` timed out at ~9.5 min with no output (piped through tail). This run
  adds new scripts only and edits no src/js, existing policy file, or
  green-list test; the arm proof tests (20/20 strandnarr, spoilname instrument
  re-proof) are the green evidence. The quick-check timeout is carried as an
  infrastructure question, not a verdict on either arm.
- Context, NOT chased (different lane): a Steve ruling landed in MEMORY.md
  during this run (2026-11-04 22:32 CST, villager-initiated bonds — villagers
  initiate bonds on their own, perception-gated), answering the linkseek
  "who should ask" question that was HOLDING. Recorded in the findings backlog
  as an UPDATE; building villager-initiated asking belongs to the
  scale-onramp/diplomacy lane, not this food-economy run.

## Closeout

Merged locally, pending ship: strandnarr c87a2005b + 82bddc68e, spoilname
2c78747c1 + 9c1f98529, plus this coordinator evidence (branched + ff-merged,
never direct on master). No push, no bump, no live verification — the ship loop
owns deploys. Main tree clean after every merge. Both worker trees released as
done-merged, worktrees removed, branches deleted. Claim retired to .DEAD; lock
deleted. food-economy stays converging (NOT converged): two narration blanks
closed as artifacts, no food-economy game change landed, sweep unit-count and
stranded-wording questions open. scale-onramp untouched (sibling Loop B).
