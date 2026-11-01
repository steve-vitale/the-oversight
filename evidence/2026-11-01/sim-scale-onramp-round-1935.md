# Loop A round 1935Z — scale-onramp: free-face deployment + late wave-4/fast lesser win (coordinator evidence)

Run: fleshout-loop-a-20261101T1935Z, axis scale-onramp (converging, NOT
converged). Sibling Loop B live on food-economy throughout (1930Z claim:
sim-gatecover-b + sim-routeblock-b) — NOT touched. No game-code change:
both arms DIAG only, zero src/js, no lever flipped, no version bump,
no push. Merged locally, pending ship.

This run took the 1742Z next blanks in order: (1) free-face deployment
instrument — why allied villages show zero free faces at refusal time;
(4) #1619 late wave-4 + fast lesser win. Blank (2) sounded-but-short
muster meaning is steve-call #1538 — skipped (needs a ruling first).
Blank (3) field-death narration is observation only. Blank (5) #1595
Herald HP drop remainder (350) and blank (6) heraldarr2 instrument
follow-ups stay open for a later run; Loop B's unmerged
sim-heraldhp-b branch (Herald HP drop attribution) was NOT touched —
never merge another agent's unfinished branch.

## Pre-registration (coordinator header, judged below)

- Primary metric: two DIAG verdicts against their own pre-registered
  bars (each arm's prereg, written before its judged sims).
- GO thresholds: freeface — exact arithmetic reconciliation AND a named
  counted cause of zero-free for BOTH Stonebridge and Thornfield on
  90111 (DIAG-GO-SINGLE-CLUSTER if only on 90111); latewin — complete
  timelines on >= 8 seeds AND the wins-before-titan-road-possible
  fraction stated with counts AND the 87120 pattern reproduced or
  bounded.
- Horizon: 200d death-aware cap, census policy stack
  withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
  FULLSEAT=1 (same stack as muster3/heraldcontact, for comparability).
- Seeds: freeface — muster3-selected 20 (pilot 8, confirm 12);
  latewin — heraldcontact pool, longevity-selected 19 (pilot 8,
  confirm 11; prereg-fixed deviation from the brief's 12–16 — the
  pool yielded only 19 selected seeds).
- Panel (§15): NOT APPLICABLE — both arms are single-base DIAG
  measurements; no before/after comparison exists in either arm and
  none was fabricated.

## Arm sim-freeface-a — DIAG-GO-SINGLE-CLUSTER

Evidence: evidence/2026-11-01/sim-freeface-a.md (+ prereg), commits
f766c897a + d82a0dc9a (after clean rebase; proof re-run on rebased tip).

Answer: Stonebridge and Thornfield show zero free faces on 90111 not
because their people are dead, young, hurt, or marched — they have NO
roster field at all. A village only gets a roster when catch-up-simmed
on approach (game.js catchUpSim → genVillageRoster), but a hierarchy
link can be born without any approach (_formLink never calls
catchUpSim). So Haven holds fully trusted links (trust 84/88, opinion
46/42, arrears 0, quota 6) to villages the sim never visited, and
titanAlliedFaces reads an absent roster as zero faces. The committed
map is empty at every refusal (no muster of any titan ever existed),
so no face is excluded by any bucket — roster absence is a fifth
cause the partition shows as all-zero counts. Chronic, not a window:
flat across all 22 refusal snapshots AND all 16 daily records days
80–95. Seed-specific, not village-specific: on other pilot seeds the
same villages DO have rosters (Stonebridge up to 12 total / 9 free on
90113; Thornfield 12/8 on 90139).

Per-village counts, 90111 refusal window (all 22 snapshots identical):
Emberhold 12 total / 6 dead / 3 underage / 0 unhealthy / 0 committed /
3 free (speaker Kenji Ford IS among the free); Stonebridge 0 total
(no roster field) / 0 free; Thornfield 0 total (no roster field) /
0 free. A direct probe dumping raw state.otherVillages (days 80, 87)
proves field-absence, not an empty array: Emberhold carries roster +
generated + knowledgeProfile keys; Stonebridge/Thornfield carry none
of the three, while still carrying opinion, population, pantryKcal,
and coordinates.

Verification: pilot GO (8/8 fired, errs 0, refused state reproduced
on 90111: 22 attempts, all REFUSED, 0 muster verbs); same-base leg
exact on all 8 pilot seeds vs muster3; determinism leg byte-identical
(90111 re-run); reconciliation 66/66 refusal cross-checks (free count
vs muster-diag facesFree), 0 arithmetic violations on all 20 judged
seeds; confirm ran clean but found 0 refusals on all 12 — hence
SINGLE-CLUSTER. Contrast-only 85106 (never judged): 17 refusals,
rosterless Emberhold/Ashford yield 0, rostered Stonebridge yields 3 —
same mechanism. 90101 shows all four links rosterless: roster absence
is common; it only bites when a muster is attempted.

Sense-testing: the refusal line ("sound the call, muster 10 allied
blades (you have 0)") is honest about the count but misleading about
the remedy — sounding the call yields only 3 (ceiling 6 with full
Haven commit), and nothing says two trusted allies have no fighters
to send at all. Against ABILITY-REFUSALS.md's honesty standard it
prescribes an action the game already knows will fall short. No
narration changed (DIAG only).

Canon gap stated, not filled: no dedicated titan/muster canon doc
exists (only an ontology mention); behavior grounded in titans.js /
hierarchy.js / game.js code.

## Arm sim-latewin-a — DIAG-GO

Evidence: evidence/2026-11-01/sim-latewin-a.md (+ prereg), commits
a1939580a + f752cb662 (after clean rebase; proof 8/8 on rebased tip).

Answer: on this base the lesser win routinely closes before the titan
road could possibly be ready — it is the normal shape of a win, not
87120's freak accident. Of 11 wins, 6 closed with omen stage 2 never
reached before the win; only 3/11 fit even the literal brief-13 clock
(87121, 87123, 87128); road reached but brief-13 missed on 87107
(11d) and 87119 (3d). Minimum winDay–placeDay gap: 3 days (87119);
minimum winDay–wave4Day gap among wins: 6 days (87126, 87134).
Omen-clock correction (verified on this base before judging): the
brief's 13-day figure double-counts — titanAdvanceOmen gates stage 2
on day − omenDay ≥ 9 against the ORIGINAL omen day, so earliest
stage 2 is omen-start + 9 days, not +13. Both clocks were judged;
the verdict holds under either.

87120 reproduce/bound call: exact 144→146 does NOT reproduce on this
base — 87120 never reaches wave 4 (maxWave 3) and wins the lesser seat
on day 163, omen never started. Do not quote 144/146 as a current-base
fact; it is a prior-base (7c3295767) record. But the shape it
exemplified is GENERALIZED: wins-before-the-road at majority rate.
Whether the lesser win is SUPPOSED to close before the titan road
opens is a Steve ruling (by design or drift), not a measurement gap —
filed as a backlog candidate in the arm evidence (coordinator files
it to sim-findings.md with this round; the worker abstained from the
shared file to avoid a write race).

Wall numbers on this band (19 judged seeds): national 15/19, table
13/19, wins 11/19 (ALL lesser, 0 full), wave-4 reach 14/19, wave-5
reach 1/19, median survival 90d (day-90 win cluster persists).
Full seat still 0 everywhere.

Base movement, proven not assumed: this sweep disagrees with
heraldcontact-a's screen (e.g. 87127: screen un-won d201/wave 4 vs
this sweep won d127/wave 3). Control: the UNMODIFIED heraldcontact
sweep on this base reproduces this arm's 87127 exactly — so the
divergence is base movement between 7c3295767 and be352e2cb3, not
instrument perturbation. Consequence: heraldcontact and latewin
numbers are not comparable seed-by-seed; future replication arms
must re-screen on their own base. Timeline-vs-census wave-4 days
agree on all 19 seeds.

Sense-testing: 87120's win (d163, no road at all) reads earned — a
village at its peak (32,769 kcal on racks, teaching, gossip, raids)
with "a lesser seat, priced for what you built"; the titan road
feels ABSENT, not late. 87119 (place d87, win d90): the table scene
names the Herald ("Named and located") as a retrospective line
beside real deeds; the road reads late-by-construction — placed 3
days before the table closed the run, it could only appear as a
name, never a road traveled. Neither win feels like skipped content
the village was pursuing.

## Village assessment (plain words)

The village's coalition looks strong on paper and is hollow in
practice for a mundane reason: Haven can be trusted friends with
villages it has never actually visited, and unvisited villages have
no people in the game's eyes — so when the Herald comes, two of
three allies send nobody, and the muster ceiling stops at 6 of the
10 blades the gate demands. Meanwhile the village's own road to the
table runs faster than the titan road: most lesser wins close before
the Herald's road could even open, so the titan is usually a name in
the win speech, not a fight the village lived through. Nobody died
for either finding — both are measurement, not a balance change —
but together they reframe the scale wall: the gate is not only hard,
it is partly unreachable (rosterless allies) and partly beside the
point (the win closes first).

## Blanks filled or documented

- FILLED (measured, DIAG): free-face deployment cause — roster
  absence via link-without-approach; filed to sim-findings.md as a
  #1538-adjacent design question (links require approach? call
  generates rosters? line says so?), NOT built.
- FILLED (measured, DIAG): #1619 late wave-4 + fast lesser win —
  shape generalized at majority rate, exact seed bounded as a
  prior-base record; the by-design-or-drift question filed to
  sim-findings.md for Steve.
- DOCUMENTED, still open: #1538 steve-call (route on refused face?
  re-sound after a lost muster-fight? sounded-but-short muster
  meaning); #1595 Herald HP drop remainder (350; Loop B's
  sim-heraldhp-b branch untouched); heraldarr2 instrument follow-ups
  (unattributed step 95404 day 120, twin-id draftedPost lookup);
  field-death narration blank (observation only).
- Metric review: freeface's partition cannot distinguish "roster
  field absent" from "roster present but everyone excluded" — the
  next instrument should record roster-field presence as its own
  counted column. Latewin's brief-13 clock is corrected to omen+9
  (see above); future preregs must use the corrected clock.

## Landing record

- Latewin merged first (master had moved: Loop B gatecover merge +
  journey closeout): rebase clean, proof 8/8 on rebased tip,
  --ff-only merge a1939580a + f752cb662, tree released + removed.
- Freeface merged second: rebase clean, proof ALL PASS on rebased
  tip, --ff-only merge f766c897a + d82a0dc9a, tree released +
  removed.
- Safe-commit index clobber struck both workers' commits (repaired
  by the workers from HEAD blobs; commits verified correct) — no
  clobber on the coordinator's own merge path; main tree verified
  clean after every merge and at closeout.
- No push, no version bump, no live verification — the batch ship
  job owns deploys. Merged locally, pending ship.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-01/perseed-latewin/leadfeast/*.json' --metrics
national,table,wins,exiled` → REFUSED by design: all 19 rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs
("Recorder corpora are compared with sweep-compare tables, never
against a run baseline here"). No LOUD lines; baseline NOT rolled.
Freeface corpus is the same recorder class and was not fed, same
precedent as 1742Z (heraldarr2/muster3 corpora not fed). The
scale-wall baseline is additionally a winseat-regime (~100%-win)
baseline, so any forced comparison against these leadfeast bands
would be the cross-regime comparison its note forbids.

## Convergence state

scale-onramp stays converging (NOT converged): the muster ceiling's
binding constraint is now mechanistically explained (rosterless
trusted allies) and the lesser-win/titan-road ordering is now
measured at majority rate — but no game change landed, no wave-5
fight chain completes, and the full seat stays unshown.
food-economy untouched (sibling Loop B lane).

Next blanks, in order: (1) #1538 steve-call queue (route on refused
face? re-sound after a lost muster-fight? sounded-but-short muster
meaning; now plus: links-require-approach vs call-generates-rosters
vs honest line) — still steve-call, not a build; (2) #1595 Herald HP
drop remainder (350); (3) heraldarr2 instrument follow-ups
(unattributed step 95404 day 120, twin-id draftedPost lookup);
(4) field-death narration blank (observation only); (5) the
by-design-or-drift ruling on lesser-wins-before-the-titan-road
(steve-call, filed this round).
