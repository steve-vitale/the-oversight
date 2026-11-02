# Loop B food-economy round 1233Z — 2026-11-02

Run fleshout-loop-b-20261102T1233Z, axis food-economy (second non-converged
axis; scale-onramp claimed live by Loop A 1155Z: musterclose + creekwood,
NOT touched). Loop A landed mid-run (creekwide 2a1cf6575, closedecay
3f8d5568f, journey endgame r109 0050dda78, and its 1155Z closeout
b82b298ca); both arms rebased onto the moving master, proofs re-run,
merged --ff-only. Merged locally, pending ship. No push, no version bump.

## Pre-flight
Main tree clean at run start (95ca9266d), disk 25%, reaper removed nothing
(all live trees sibling-owned or dirty, correctly refused). Claim written
before any sims; deleted at closeout. Lock deleted at closeout.

## Arm 1 — sim-vetobudget-b: PILOT GO (landed 425089625)
Blank: 1135Z next blank (5), veto-budget expedition abort; backlog silent-veto
repetition item (62808: same step silently refused 3x/day 20+ days, 68 vetoes,
66 silent, scholar home and fed daily).

Pre-registered (committed before any judged sim, c56862a16/9fa3f394a): ONE
definition, N = 3 silent vetoes per expedition — an expedition is the
run-scoped pursuit of one step (ordered tile pair); the budget does NOT reset
at dawn, because the pathology is multi-day. On the Nth silent veto the step
is abandoned permanently for the run; later attempts are suppressed before
the guard (no veto counted, no narration). Force/combatExit/self/in-combat
calls never suppressed. Policy-only: zero src/js changes.

Pilot (band 62801–62808, 30d, guard-only vs guard+budget, identical seeds).
Primary, all three bind, all pass:
- P1 max same-step silent vetoes/seed-day on repetition seeds <= 3:
  62807: 3 -> 2, 62808: 3 -> 2.
- P2 no step vetoed on > 3 days: baseline spans 6 and 22 days -> armed max 2.
- P3 no step over 3 total silent vetoes: baseline 17 and 65 -> armed max 3.

Before/after: vetoes 95 -> 19; silent vetoes 85 -> 9; suppressions 76
(62808: 62, 62807: 14); abandonments 2. Mechanism accounting closes exactly:
85 baseline silent = 9 armed silent + 76 suppressed; spoken vetoes unchanged
10 -> 10. 62808 step (4,4)->(4,1): day 9 identical, day 10 first attempt is
the 3rd silent -> abandoned, days 11–30 suppressed; guard vetoes for the step
66 -> 4. No-harm bars all pass at ~1.00x: haul 258.9 -> 258.9 (every seed
1.00x), away day-ends 3 -> 3, failed-trip share 0.508 -> 0.508 (own tolerance
baseline+0.05, not stepwalk's), forageTrips 520 -> 520, deaths 75 -> 75 with
identical cause composition, median survival 30d -> 30d, pocket episodes
0 -> 0, veto-created pockets 0. Trajectories day-identical on all 8 seeds;
sayLines byte-identical — the budget adds no narration, as preregged.

Proof: scripts/test-vetobudget-b.js 27/27, re-run on the rebased tip and on
merged master. Panel (§15, context never verdict): combined 16-case campaign,
sourcesStable, neutrality matched; per-policy rows identical every seed
(won/national/table 0, maxArc 3, vests 0). Split-panel compare INVALID
("Unmatched policies / Unmatched cases") — structural, same as predecessors,
attached as-is, not overridden.

Wall (30d pre-seat window, expected 0s): national / table / wins 0 both
legs; median 30d both; maxWave per seed 2,2,2,3,2,1,1,1 both legs; wave 4–5
unlocks 0, full seat 0, wave 5 reached 0. No wall movement shown or claimed.

Village assessment (plain words): on the two seeds where trouble showed, the
baseline scholar hammered a shut door three times a day for weeks while the
village carried on — pantry holding 17–26 days of fresh food, villagers
hauling, cooking, teaching, fighting off a breach, holding a moot, burying
dead from fighting, not hunger. With the budget, the scholar still tries the
shut door — three times in all, across two days — and then stops asking: the
rest of the month it works near-home ground and comes home fed, while village
life goes on exactly as before. Nobody eats less, nobody dies differently,
nobody strands. What the budget did not do is teach the scholar anything new
— it stopped the asking, not the wanting. Post-abort days read sensibly
because they ARE the post-veto days, minus the veto bookkeeping.

Confirm owed, not spent: 12–16 seeds, ideally with a longer horizon where a
budgeted route could reopen (permanent-abandonment risk did not materialize
on this band). Transcript repetition never existed (later vetoes were
already silent) — documented, not solved.

## Arm 2 — sim-homeveto-band-b: DIAG-NO-BAND (landed 5b7b923dc)
Blank: 1135Z next blank (1), homeward-extension test on a band screened for
armed-policy homeward vetoes (or a constructed 61807-shape trip).

Pre-registered (committed before any judged sim, 02f7a3931/c5f096200):
qualifier = >= 2 baseline homeward-hop pocket episodes AND >= 1 armed
homeward veto; primary = extension-only preventions, GO >= 1; 8-band
screening budget; DIAG-NO-BAND fallback if no band qualifies. Pilot gate
never reached because the qualifier never was.

Screening ledger (all 8 bands disclosed; baseline shadow + full armed legs,
30d, identical substrate; 64 seeds):
- 64001–64008: base away 0, armed away 0, armed vetoes 0, homeV 0, episodes 0.
- 64101–64108: 7 / 6 / 12 (9 silent) / 0 / 0.
- 64201–64208: 15 / 10 / 25 (23) / 0 / 1 baseline episode, 0 homeward
  (64203 days 4–8, (4,2)).
- 64301–64308: 19 / 19 / 43 (39) / 0 / 2 baseline episodes, 0 homeward
  (64307 x2).
- 64401–64408: 10 / 9 / 19 (12) / 0 / 1, 0 homeward (64406 days 4–12, (3,3),
  death-linked).
- 64501–64508: 0 / 0 / 7 (5) / 0 / 0.
- 64601–64608: 6 / 0 / 30 (27) / 0 / 2 baseline episodes, 1 homeward
  (64601 days 17–20, (3,0)).
- 64701–64708: 1 / 1 / 30 (29) / 0 / 0.
Totals: base away 58, armed away 45, armed vetoes 166 (144 silent), armed
homeward vetoes 0, baseline homeward episodes 1. Best band on episodes
(band 4, 2) had 0 homeward episodes; best on homeward episodes (band 7, 1)
fell short of 2 and also had 0 armed vetoes. Counting predecessors, armed
homeward vetoes are now 0 in 80 armed seeds (64 here + 8 pilot + 8 ablation).

Verdict: DIAG-NO-BAND. No GO or NO-GO for the extension is claimed. The
prereg GO was never reached because the qualifier never was.

DIAG leg (diagnostic only — WARNING: the diagnostic analyzer file prints a
mechanical "VERDICT: GO" on seed 61807. That is NOT this run's verdict and
must not be cited as one — 61807 is a single pre-used seed chosen precisely
because it fires; selection bias. The run verdict is DIAG-NO-BAND.)

61807 reconstruction, fresh 3-leg run, hop-level: baseline walks out
(4,4)->...->(2,0), then the homeward hop (2,0)->(3,0) E-fails and anchors a
days 4–9 camp at (3,0). Outward-only passes that hop twice, ends day 4 on
failing ground (episode counted), then an outward veto day 5 pulls it to
(3,1), home day 8 at kcal 90. Full vetoes (2,0)->(3,0) spoken (stays on
escapable (2,0)), vetoes (1,0) spoken, repeat (3,0) silent; home day 5 at
1430, 0 episodes. Diagnostic arithmetic: baseline 6 away/1 episode, outward
4/1, full 4/0, full homeV 2, haul 215.1 / 237.2 / 280.7 (full 1.18x outward),
failed-trip 0.233 = 0.233, median 30d all legs, veto-created pockets 0.
Reconciliation: the latescape note's "fences days 5–7, home day 8, prevented
= 0" describes the outward-only shape, not the full leg — under the full
guard the day-4 entry step itself is vetoed, so no day-4 failing day-end
exists under full. Sharpest new finding: 64601's baseline scholar walks the
exact 61807 route to the same (3,0) tile, but under guard it is vetoed at the
approach hop (1,4)->(1,2) day 17 and then daily at (4,4)->(4,1) — the outward
guard eats the approach before the homeward step is ever attempted. Open
instrument question (in evidence metric review): on 61807 day 4, approach
hops E-fail in the shadow log but E-pass under the full guard with identical
history, while on 64601 shadow and armed agree — shadow-log screening for
"approach-clean" trips must be validated before it is trusted.

Proofs: scripts/test-homeveto-screen-b.js ALL PASS (10 checks);
scripts/test-homext-abl-b.js PASS 21 checks, census agreement 100%. Both
re-run on the rebased tip. No panel compare attached: no judged pilot exists,
so no compare was owed (stated in the evidence, not hidden). Panel context
only (band 7 combined campaign, 16 cases, sourcesStable, neutrality
matched): both legs identical — survived 8/8, won/national/table/entered/
vests 0, wave reach 2 on 6/8, maxArc 3 on 7/8.

Wall (in-window only): median survival 30d every screening leg; survived
126/128 seed-legs; maxWaveUnlocked never above 3; wave 4–5 unlocks 0 on all
64 seeds, both legs. No wall movement shown or claimed.

Village assessment (plain words): across 64 fresh villages, most scholars
simply sleep home every night — three whole bands end almost no day away
from haven. Where trouble shows up, it is the same story: a scholar walks a
plausible route to good ground, the ground turns out to be a trap it cannot
walk home from, and it sits there while its food runs down (4 days at 64601,
9 days at 64406, 5 days at 64203). Under guard none of those camps forms as
a pocket: the scholar is turned back at the approach and comes home fed, or
— at 64406 — camps one tile over on ground it can leave from. The one
village with a true homeward trap, 64601, walks the exact 61807 route step
for step to the same tile, but is stopped two steps earlier, so the homeward
eyes never open. The fence around the far ground works; whether the eyes on
the way back would work, on a trip that actually gets that far, is still
unproven after 80 armed seeds without a firing. The village is not suffering
for the extension's absence — it is protected by the outward guard before
the extension could matter. Sense-testing: the veto line reads true where it
speaks; the silent-repetition pattern recurs (64601: 29 vetoes, 2 spoken
lines, then silent daily refusals; 64307: 36 vetoes, 2 spoken lines) —
carried as the same outward-guard narration question, not a bar failure.
64406's armed camp is escapable (sims passing), not a guard failure, and its
day-12 death changes cause (starvation -> sickness) under armed, so no life
saved is claimed.

## Telemetry deviation check
Both corpora globs return the known PARSE REFUSAL class (telemetry-check
parses whole-file JSON; drivers write one-object-per-line JSONL) — same
refusal class as the 1030Z/1135Z homeward corpora, NOT a metric deviation.
Baseline NOT rolled. No LOUD metric lines beyond the parse refusals.

## Infrastructure notes (loud, as required)
- Runtime restart killed the first worktree-register command mid-checkout,
  leaving a partial dir (evidence/ only) + a branch with no registry entry.
  Recovered by deleting the branch, removing the partial dir, re-registering.
- Rebase stop-at-pick quirk (AGENTS.md) hit the vetobudget rebase: pick
  appeared in both done and todo, tree clean, pick unapplied. Recovery per
  the book: verified clean + unapplied, `git rebase --continue` sailed
  through 3/3.
- Coordinator error, repaired, no content lost: after the first vetobudget
  rebase, a sibling landing (closedecay 3f8d5568f) made the --ff-only merge
  fail — but the coordinator then ran release/remove BEFORE verifying the
  merge, wrongly marking the tree done-merged. The branch was intact at
  2b33d3141; the registry entry was removed and the tree re-registered
  (register script attaches to the existing branch), rebased onto the new
  master, proof re-run 27/27, and merged only after verification
  (MERGE-OK, tip 425089625). Lesson for the next coordinator: never release
  until `git branch --merged master` names the branch.
- Safe-commit index clobber hit the homeveto worker's three commits; each
  repaired from HEAD blobs, commits verified correct. No clobber on the
  vetobudget commits or the coordinator commit this round.
- No EPERM flap on evidence writes this round. `node scripts/check.js
  --quick` produced zero output in ~7 minutes on the vetobudget tree and was
  killed by the worker; not a verdict input.

## Metric review
- Vetobudget: prereg bars held as written; the "no new deaths" bar passed
  with identical cause composition. The permanent-abandonment risk needs a
  longer-horizon confirm metric (route-reopen rate), proposed for the NEXT
  run's prereg, not scored here.
- Homeveto: the qualifier (>= 2 baseline homeward episodes AND >= 1 armed
  homeward veto) proved to be two independent zeros — episodes and vetoes
  do not co-occur on screened bands. The metric is not wrong, but the
  substrate is: the next prereg should screen for approach-clean trips
  (approach hops E-pass under guard, homeward entry E-fails) or use a
  constructed trip. Raising the band budget would most likely buy more of
  the same two zeros. The shadow-vs-armed E divergence must be resolved
  before shadow-log screening is trusted.

## Next blanks, in order
(1) Vetobudget confirm: 12–16 seeds, longer horizon, route-reopen rate as a
metric (permanent-abandonment risk). (2) Homeward-extension substrate call:
approach-clean trip screen (with shadow-vs-armed E validation first) or a
constructed 61807-shape trip — a substrate call, not a seed-count call.
(3) Haven-breach intent (steve-call candidate) + place-in-record design
question. (4) 60501-shape roadwork-credit band (still owed). (5) Guard +
return-capability pairing (vetobudget now exists as the pairing half to key
off) OR a second veto-budget shape, decided up front. (6) Sensor non-pantry
collapse signal. (7) Gatediseng confirm band 76701-76712. (8) Pantry-cap-as-
garden-bottleneck (74007). (9) Standing-load remainder. (10) Pack-full
refusal narration. (11) HUNGER WINTER relief passivity (steve-call
candidate). (12) Shelling default-flip call. (13) P3 reset follow-ups.
(14) Patrol-departure narration. (15) Garden/fish/traps early path.
(16) Creek clearance wood-bound (evening wood-carrying first; Loop A
creekwood arm landed this cycle — read it before re-screening).
(17) Rubble daytime-clearing habit. (18) Washed_out scramble narration.
(19) 96-tick bridge edge. (20) 120d window only on a new horizon-cut episode.

## Convergence state
food-economy stays converging (NOT converged): the veto-budget instrument
is landed at pilot GO with a confirm owed, and the homeward extension is now
0-for-80 armed seeds on firing — but no guard default has flipped, no game
change has landed as game code (both arms are policy-side instruments), and
the extension question is now a substrate question, not a verdict. Scale-
onramp untouched (sibling Loop A lane).

Evidence: evidence/2026-11-02/sim-vetobudget-b.md (arm, commit 425089625),
evidence/2026-11-02/sim-homeveto-band-b.md (arm, commit 5b7b923dc), this
file (coordinator round evidence).
