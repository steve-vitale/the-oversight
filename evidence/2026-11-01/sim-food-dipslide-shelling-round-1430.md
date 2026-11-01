# Loop B round 1430Z — food-economy: dipslide fresh-seed confirm (NO-GO) + shelling-habit real run (GO/GO), merged locally pending ship

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1430Z, axis
food-economy (second axis). Sibling Loop A live on scale-onramp for the
whole run (1415Z claim: muster + wave4leth, NOT touched; A landed wave4leth
mid-run as 280b6a89c and its muster arm was still active at this run's
closeout). This run took the 1346Z closeout's next blanks (2) dipslide
fresh-seed confirm and (3) shelling-habit real run, in order. Blank (1)
HUNGER WINTER relief passivity skipped again as a steve-call candidate
needing a ruling first. No B lock at run start; claim written before any
sims (lever-claims/fleshout-loop-b-20261101T1430Z.json, deleted at closeout).

Pre-flight: main tree clean, disk 21%. The reaper step blocked on the
registry flock held by Loop A's slow second-tree checkout (see
Infrastructure) and was skipped after a kill of the coordinator's own hung
reaper invocation; no dead tree of this run's needed removal, and both
trees were registered cleanly afterwards, so nothing was left unreaped
by this run.

## Arm 1 — sim-dipslide-confirm-b: fresh-seed confirm NO-GO, DIAG only

Worker commits rebased onto 230bc154e clean, proof re-run green
post-rebase, merged --ff-only as 3d2fafa1f (prereg 558e7e97a, closeout
3d2fafa1f after rebase; original branch commits 05699b993 / 5c36b4140).
Proof re-run by coordinator on the rebased branch: scripts/
test-dipslide-confirm-b.js 24/24 (17 pure + 7 live with the corpus path;
the coordinator's first bare `--live` invocation errored on the missing
corpus-path argument and was corrected — same class as the 1346Z
coordinator error, not a worker defect).

Rule tested EXACTLY as specified in sim-dipslide-b.md (trend unchanged +
D>=8 exclusion + 5-evening recovery confirm, final-run counting only).
Fresh seeds 51201–51212, competent, 30d, depositgate-armed substrate.
Prereg committed BEFORE any judged sweep.

- Bar (c) FALSE-FIRE RATE: FAIL. 4/12 surviving seeds with a confirmed
  fire in the final engaged run (51204, 51207, 51210, 51211) = 33.3%
  vs the 25% cap (max 3/12). Missed by exactly one seed.
- Bar (d) COLLAPSE EARLINESS: UNJUDGED. 0/12 collapsed (12/12 survived
  30d), so no collapsed seed exists to judge. Reported as UNJUDGED,
  not passed.
- Verdict: NO-GO, judged exactly against the prereg header, no
  re-scoring. Honest caveat disclosed, not acted on: 51204 is a
  window-edge fire confirmed on day 30, the window's last evening;
  striking it post hoc would give 3/12 = 25%, exactly at cap. It was
  not struck; a future prereg could pre-register a window-edge rule.

The four false fires, plainly: 51210 reproduces the pilot's residual
risk on a fresh seed (day-8 candidate confirming day 13 — the settling
slide crosses day 8, so the exclusion cannot filter it); 51211 is a
step-down, not a slide (pantry drops to ~24k then flatlines, confirming
by only 339 kcal); 51207 is a slow survivable drift (the band's only
wave-3 seed); 51204 is a genuine late slide confirmed on the final
evening. Counted-anywhere false count (descriptive only): 7 (adds
51202, 51203, 51208) — the final-run rule is still load-bearing but
no longer saves the bar. Earliness across the whole program remains
n=1 (pilot 51101 only); the sensor's collapse-earliness claim is
still unreplicated. The pilot GO does not survive fresh seeds. The
sensor is NOT landed as a gate instrument; any next design belongs in
a new prereg (window-edge rule, step-down discrimination, or a
recovery-to-candidate-level test), not in a re-score of this band.

Panel §15: inapplicability declared with the pilot's reasoning
(within-trajectory instrument comparison, no game-code change, no
lever); no compare fabricated. Zero src/js, zero policy-default flips,
zero edits to existing scripts/policies. New files only, all
*-dipslide-confirm-b.*.

## Arm 2 — sim-shelling-b: real shelling habit, pilot GO + confirm GO

Worker commits rebased onto 280b6a89c clean (after the premature-release
recovery below), proofs re-run green post-rebase, merged --ff-only as
fcbbf77a6 (prereg e82a45276, closeout fcbbf77a6 after rebase; original
branch commits 2e669747c / 7b02405cf). Proof re-run by coordinator on
the rebased branch: scripts/test-shelling-b.js 16/16 pure,
18/18 --live-control (51107: 29 live returns, 17 firings, unload
4,152, 8 shelling-attributed unloads — reproducing the worker's
numbers exactly), 17/17 --live-det.

The habit (policy-side, zero src/js changes): on every returnToVillage
in the armed leg, before the haul block runs, the scholar shells each
in-shell nut lot in the pack individually via Game.shellNuts(idx) —
one engine call per lot, so 4 ticks are charged per lot, never one
flat call. Baseline leg: identical driver, wrapper off. Substrate:
competent, DEPOSITGATE=0 (keep 2,000), 30d, same as depositkeep/
packcomp. Prereg committed BEFORE any judged sim. Design note fixed
in the prereg: the haul block is the only path by which a return
unloads, so a habit judged on unload must shell the pack before the
haul split; counter-shell + putAway is a pantry deposit, not an
unload (the killed shellcounter shape, not reused here).

Pilot (fresh seeds 51401–51408, identical seeds, baseline vs armed):
firing 24/24 armed eligible returns (100%, bar >=80%); band unload
armed 140,955 kcal vs baseline 48,045 kcal; flip seeds (baseline 0
→ armed >0, shelling-attributed) 51401, 51402, 51404, 51408. Pilot GO.

Confirm (fresh seeds 51411–51422, 12 seeds):
- (a) Shelling-shaped unload rate: armed 35/35 = 100% vs baseline 0%
  (>=80% and >=30pp required). PASS.
- (b) Guardrail: median survival 30 vs 30 days (>=0.8x required);
  scholar starvation deaths 0 vs 0 (<= baseline+2 required); all 20
  seeds in both bands survived 30 days. PASS.
- (c) Tick accounting: 100 lots, 400 ticks, 4x lots exactly;
  per-event verification on all 69 confirm + 54 pilot fired events:
  every dayTicks delta = 4x lots and every per-lot delta = exactly
  4. Zero bad-tick events. The late-day guard never fired (0 skips);
  the only skip reason anywhere was 'no-in-shell-lots'.
  Pantry-cap-blocked eligible returns: 0. Gate-engaged reads: false
  on every judged return. PASS.
- Flip seeds: 51412, 51416, 51418, 51419, 51421, 51422 (6).
  Combined across bands: 59/59 eligible returns fired and unloaded,
  10 flip seeds. Confirm GO.

Honest limits (do not overclaim): armed unloads LESS on two confirm
seeds, 51415 (24,180 → 1,375) and 51420 (14,950 → 2,090) — both had
~zero armed eligible returns; their baseline unload came from
finished-food returns that do not recur identically once trajectories
diverge. The landing case must read "shelling-shaped returns unload,"
not "villages unload more food in general." Haul-size seeds persist
(pilot 51403/51406; confirm 51411/51413/51417) — forage volume is the
separate next blank, not this arm's job. Gate-off ≠ keep-only caveat
inherited from depositkeep; gate-on (6,000 keep) play is unmeasured
by this arm.

Sense test (read, not counted): confirm seed 51421, day 19 — forage
(15x Hickory Nuts, 12x White Oak Acorns), travel home, then two shell
lines, one per lot at 4 ticks each, then the census-exact split ("You
keep a day's food (1980 kcal) and unload 3456 kcal into Haven's
pantry"; entry pack finished 1,830 + shelled 3,606 = 5,436; pantry
26,893 → 30,349), then the welcome. Reads as a person shelling on
the way home.

Panel §15: no compare fabricated — prereg inapplicability declaration
stands (custom return-level census, not a panel metric); the paired
identical-seed tables are the comparison.

STATUS NOTE (important): the habit is proven as a policy instrument
and its files are landed, but NO default has flipped — default play
still does not shell on return. Backlog line 1713 (shelling habit
missing) is therefore NOT marked fixed by this run; the worker's
backlog lines are appended verbatim (see tracker note) and the
default-flip decision is a next call, not made here.

## Telemetry deviation check (coordinator, post-merge)

- Dipslide summary: 3 LOUD lines (national 12 -> 0, table 16 -> 0,
  wins 16 -> 0), the known missing-field artifact class (30d pre-seat
  census carries none of those fields; the window cannot reach them)
  — baseline NOT rolled, no investigation item.
- Shelling confirm-armed jsonl: refused by the tool itself (parses
  each file as a single JSON document; multi-line jsonl fails at
  line 2) — the same input-format limitation precedent as packcomp
  1346Z, not a deviation; same artifact reasoning, no baseline
  change.

## Wall numbers (this run's judged corpora only)

Wall UNCHANGED (not measured by these 30d pre-seat windows): full seat
0 / wave 5 reached 0 stand as last measured (Loop A lane). In-window:
dipslide-confirm 12/12 survived 30d, wave max 3 (51207 only), collapses
0; shelling pilot + confirm 20/20 survived 30d (both legs), wave max
2 (confirm armed 9/12 vs baseline 7/12), collapses 0. National / table
/ wins 0 in-window on both arms — a window limit, not a wall movement
claim.

## Infrastructure (loud)

- REGISTRY-FLOCK SERIALIZATION: Loop A's second-tree checkout held
  the registry lock for ~15+ minutes (its git worktree add + reset
  ran 14:30–14:41); the coordinator's reaper invocation blocked on
  that flock (killed by the coordinator — its own process only) and
  both of this run's registrations queued behind it (~5–7 min each:
  dipslide-confirm 14:41, shelling 14:46). No registration failed;
  the cost was wall time only.
- MASTER MOVED THREE TIMES under this run from sibling lanes
  (journey-deepening r80 35449dd92, journey-endgame r95 230bc154e,
  Loop A wave4leth 280b6a89c), all instrument-only, zero file overlap
  with either arm; both branches rebased clean, proofs re-run green
  after every rebase.
- PREMATURE RELEASE (coordinator error, recovered, read this):
  the shelling closeout chained `merge --ff-only && release &&
  remove && branch -d` in one command. Loop A had landed wave4leth
  between the rebase and the merge, so the ff-merge FAILED
  ("Not possible to fast-forward") — but the chain kept running:
  worktree-release.sh marked sim-shelling-b done-merged (it does
  not verify the merge), `worktree remove --force` deleted the
  tree, and only `branch -d` refused (not fully merged), which
  saved the branch. Recovery, all verified: (1) atomic registry
  repair — removed the stale done-merged sim-shelling-b entry via
  tmp-file + os.replace (the script's own atomic pattern), branch
  verified intact at 294b8936a; (2) re-registered sim-shelling-b,
  which attached to the existing branch; (3) rebased onto
  280b6a89c clean; (4) proofs re-run green (16/16, 18/18, 17/17);
  (5) merged --ff-only ALONE and verified (fcbbf77a6, 12 files,
  tree clean) BEFORE any release step; (6) then released, removed,
  and deleted the branch as separate verified steps. Lesson for
  the next coordinator: NEVER chain release/remove after a merge —
  verify the merge alone first. The dipslide closeout, done the
  same chained way, happened to merge cleanly and is unaffected.
- SAFE-COMMIT INDEX CLOBBER hit both workers' commits and both
  coordinator-adjacent commits (same known class) — repaired via
  --add --cacheinfo from HEAD blobs each time, commits verified
  correct. No EPERM flap blocked this run's git writes.
- check.js --quick NOT re-run: zero src/js, zero green-list files
  on both arms; the standing 280/7 pre-existing profile was last
  recorded by Loop A runs and nothing here touches it.

## Village assessment (plain words)

The sensor that looked clever on eight villages cries wolf on fresh
ones: on four of twelve new villages it stands down while the village
survives anyway — one because the first week's settling slides past
day 8, one because the pantry steps down to a lower level and stays
there, one because it drifts slowly downward for a month without
dying. The pilot's one-in-seven false-fire rate was the optimistic
number; the fresh-seed rate is one in three, and that kills it as a
gate instrument for now. The shelling habit is the opposite story:
the scholar who used to carry acorns home and leave them unshelled on
the counter now shells them on the way in, pays four ticks a lot,
and the food lands in the pantry — on every single shelling-shaped
return, twenty villages' worth, with ten villages going from nothing
unloaded to thousands of calories. What it cannot do is make a small
haul big: villages carrying eight nuts still carry eight nuts, and
that is the next blank, not a failure of the shell step.

food-economy stays converging (NOT converged): the dip/slide sensor
is now killed on fresh seeds, the shelling habit is proven as an
instrument but no default has flipped, and the haul-size question
stands. scale-onramp untouched (sibling Loop A lane).
Next blanks, in order: (1) HUNGER WINTER relief passivity
(steve-call candidate — still needs a ruling before any work);
(2) dipslide next design (window-edge rule, step-down discrimination,
or recovery-to-candidate-level test — new prereg, never a re-score
of the 51201–51212 band); (3) shelling default-flip call (is the
proven habit to become default play, and on which trigger?);
(4) haul-size question for 51103/51104/51108-shaped seeds (forage
targets/volume — why 8 nuts is the ceiling); (5) P3 reset follow-ups
— night-22 +3,005 silent inflow bridge (still undocumented), double
endDays on vessel-death days; (6) patrol-departure narration;
(7) garden/fish/traps early path (marginal 2.8% combined — ripening /
assignment path, not yield numbers); (8) creek clearance wood-bound
— evening wood-carrying before any creek-clearing lever; (9) rubble
daytime-clearing habit unmeasured; (10) washed_out scramble
narration; (11) 96-tick bridge edge unobserved; (12) a 120d window
only if a new horizon-cut episode appears.
Claim deleted; lock deleted. Merged locally, pending ship.
