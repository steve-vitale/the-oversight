# journey-scale r43 — THE FIX HOLDS, THE LEG MOVES (2026-10-27, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261027T0643Z. Rotation read 3 → leg 3 SCALE
(days 80–140 + tail); write 3→0 on completion.
**Base:** master@d9ff6f22a (journey-deepening r55) at run start. Master moved
mid-run (5 evidence-only flesh-out commits, latest 211b1b110) — rebased onto
the new master, proof test re-run, then merged (see LANDING).
**Pre-register:** `evidence/2026-10-27/journey-scale-r43-prereg.md` (written
before any sim; no src/js change planned — measurement first, r42's discipline).
**Arms (two, zero src/js):**
1. **REMOVAL (r42 item a)** — post-fix band re-run. Driver
   `scripts/test-removalsite-r42.js` UNCHANGED (EVID env →
   `evidence/2026-10-27/journey-scale-r43-removal`), analyzer
   `scripts/analyze-removal-r42-20261026.js` UNCHANGED (EVIDIR arg),
   seeds 73671–73678, DAYCAP 180, death-aware stop.
2. **JOURNEY** — the leg itself. Driver
   `scripts/journey-scale-r43-20261027.js` (r42 driver, labels/EVIDIR only),
   analyzer `scripts/analyze-scale-r43-20261027.js` (r42 analyzer, labels
   only), policy `scripts/policies/scalecourt-nogate.js` UNCHANGED,
   seeds 85001–85004, DAYCAP 180, death-aware stop,
   EVIDIR `evidence/2026-10-27/journey-scale-r43`.
**Pilots:** removal 73677 first (installed, 31 rows, fully partitioned, 0
bystander rows — gate passed), journey 85001 first (day 181, global, lesser
seat — gate passed). Both batches then ran to completion. One batch
footgun, caught: the removal `--summary` call without EVID rebuilt the
summary from the DEFAULT (r42) dir — git status proved the r42 dir
unmodified (rebuild byte-identical), and the r43 summary was then rebuilt
properly with EVID set. Never run the summary without EVID.

## Infrastructure (read first — the run nearly didn't happen)
Container-wide write(2) EPERM flap from ~06:44 UTC: new-file writes failed
in /tmp, .git/refs/heads, worktrees, evidence, and goal hidden_files alike
(same class as the 2026-10-23 .git flap and the 2026-10-24 evidence flap,
now wider). Registration failed 3×, a 2.7 GB checkout failed at index-reset
(two files unwriteable), and a service restart hit ~06:51 UTC. The flap
cleared ~07:17 UTC and registration succeeded — the branch journey-scale
had been created by the failed attempt, and the register script's
existing-branch fallback attached to it (base verified d9ff6f22a, worktree
clean). Standing heartbeat loop verified landing in the registry (fresh
heartbeat_at at every check). Rule re-confirmed: never force a commit or
ref past the flap; wait, retry, report. My probe leftovers (0-byte
flap-test files, created when write() failed after create()) were removed
and the main tree verified clean before registration.

## Verdicts (binding — none re-scored)
- **REMOVAL-BYSTANDER-ZERO: GO.** 0 tb-bystander-lift rows band-wide
  (176 removal rows: 78 ambient-or-other, 98 tb-fight-lift). r42 had 17
  bystander rows across all 8 seeds, including 3 on 73675's gauntlet day
  and 3 on 73677. The class is gone band-wide, not just on 73675.
- **REMOVAL-PARTITION: GO.** 8/8 seeds fully partitioned.
- **REMOVAL-UNCLASSIFIED: clean.** Vanished-near-player = 0 band-wide
  (r42: 3 — 73675×2, 73677×1). Band fates: fought-tb 9, alive-at-end 20,
  fought-field 2. Dominant never-fought fate is alive-at-end (20) — spawns
  persist or get fought; nothing evaporates.
- **JOURNEY-PARITY: REPORT (per prereg, not GO/NO-GO).** 85004 byte-identical
  to r42 (capture 16,909 lines, zero diff). 85001 identical except pantry
  (see below). 85002 and 85003 moved a lot (see below) — each traced, none
  unexplained, none re-scored.
- **JOURNEY-TABLE: REPORT.** Lesser seat in-window on 3/4 seeds (85001,
  85003, 85004) — same count as r42, different membership: 85002 no longer
  reaches a seat (it dies out first — see its story), 85003 keeps its seat.
  Full seat still unreached (w5 0 everywhere).
- **PEOPLE-SENSE: GO.** All 8 transcripts read in full (below). No fabricated
  shared history, no NEW filler loop. The known Dorothy-d120 circling
  control reproduces identically (picker artifact, not a new finding).
  One minor label wart named below (betrayal:accept on a friendly walk).

## Attribution (why the leg moved — checked, not assumed)
Between r42's base (8ecaac395) and this base (d9ff6f22a), the ONLY src/js
changes are c04d4e0cb (the bystander fix itself), c509ec15a (social r59
party-menu trim protection — conversation trim only), and a version bump.
Everything else in range is evidence/scripts-only. So the journey
divergences are attributable to the fix (it touches EVERY tb fight, not
just wave-4 — surviving bystanders change encounter chains from early on),
plus possibly the trim change for transcript picks. This is NOT uncontrolled
base drift: the control is the git range, and it is clean. First-capture-diff
lines: 85001 line 7129, 85002 line 2376, 85003 line 3424, 85004 none.

## Village assessment (plain words)
- **85001 — the village of two, living on the network.** Ends day 181 with
  2 living people, global rank, a lesser seat waiting, arc 4 — identical to
  r42 except the pantry: 9,361 → 0. The home pantry hits 0 on day 170 and
  stays empty, while the league pool (~45k) carries the village and nobody
  goes hungry (hungryDays 0 all run; 17 zero-pantry policy days vs r42's
  3). Same village, thinner cupboard, same seat. Not starvation — a
  village living on its network's granary.
- **85002 — the village that reached the world and priced itself out.**
  Ends day 159 with NOBODY left: global rank (national day 137, global day
  152), arc 3, no seat. The story, played out in order: the village climbs
  to global; the player takes a FUSION REACTOR pellet ("you will never be
  hungry again"); the table answers and REFUSES — "WE PRICED THE RUN. NO
  HUNGER ON THE RECORD — THE PELLET HUMS WHERE THE FIRE SHOULD BE. NO
  FEAST, NO SURGE, NOTHING HERE WE CAN PRICE" (the food-thesis deeds
  unmet while the pellet hums); then the arena takes the roster one
  incarnation at a time (player deaths days 143–159) until Aroha Ngata
  falls and "no one is left to pick up the Codex. The village dies out."
  In r42 this seed was the fat, stuck village (10 alive, regional, blocked
  on opinion). In r43 it is the leg's great tragedy: the table's price is
  real, and a village that stops needing food stops being priceable.
  This is a designed price biting, not a bug — and it is the strongest
  evidence in this run that the table prices the run rather than gating it.
- **85003 — the thin village that kept its people.** Ends day 181 with 8
  living people (r42: 3), pantry 9,596 (r42: 1,055), regional rank, a lesser
  seat waiting, arc 4 — but national/global voicing lost (r42 voiced both;
  r43 blocker: seasoned-trust-bar, 0 seasoned covenants of 3). The roster
  did NOT grow by arrival (no arrival lines; the arrivals-0 blank stands) —
  it kept people alive where r42's version lost them. Same seat, fatter
  village, slower climb.
- **85004 — the comfortable village, untouched.** Ends day 181 with 9 living
  people, pantry 61,320, regional rank, a lesser seat waiting, arc 4 —
  byte-identical to r42. The fix is inert where no bystander lift would
  have fired. The control seed did its job.
- **Removal band side note:** the tableseat-nowait policy band still shows
  table wins (73672, 73674, 73676 entered+won; 73677 pilot entered+won) —
  policy-band observations, not journey-leg win claims. Four removal seeds
  end with 0 wave-4 spawns (early village loss or table win before wave 4),
  which is why the band's spawn counts moved vs r42 even as the bystander
  class went to zero: trajectories, not the recorder, changed.

## People check (all 8 transcripts read in full)
- 85001-d90 Irving (anxious baker, curious): solitude as a resource —
  "Scarcer than food, some days." Real.
- 85001-d120 Irving (curious): belief talk — "That's not naive. That's
  load-bearing... the small ones held." Resolves.
- 85002-d90 Jian (warm trail lead, curious stage 0): player leaves at once
  ("...Thanks for being here. That's all.") — thin but honest; leaving is
  a valid ending, not filler.
- 85002-d120 Tebogo (warm mechanic, ask_favor): a wound to tend → commit →
  "Careful with it. And — thank you." Want named, engaged, resolved.
- 85003-d90 Joshua (earnest arborist, seek_taken): THE talk again — the
  pods promise ("Even asking is more than the silence") plus a trap-line
  walk where Joshua TEACHES slope-water reading ("Knowledge, freely
  given. The Codex notes it."). Want, engagement, promise, gift.
- 85003-d120 Joshua (seek_taken): the talk continues — and it knows the
  world: "I asked Theo about what happened to my taken kin — Theo's gone."
  Theo died in the arena the day before (d119). That is continuity, not
  fabrication. The walk this time ends in retreat from fresh tracks.
- 85004-d90 Dorothy (anxious mechanic, curious): the Columbus dream, street
  getting longer, waking tired "like I actually walked it" — the leg's
  best talk, unchanged (identical seed → identical transcript).
- 85004-d120 Dorothy (curious stage 0): THE wart, reproduced exactly —
  more/react ×4 circling the restless thread ("I'd rather be moving
  toward maybe than sitting in certainly-not"), never taking the offered
  dlg:subject / dlg:doubt / dlg:invite. Circling, not senseless; the
  control picker's artifact, exactly as r40 diagnosed. Unchanged = not new.
- **Minor label wart (new shape, named not fixed):** Joshua's trap-line
  walk accept is recorded as a `betrayal:accept` pick (betray file shows
  one accept, d90, Joshua at trust 90, thriving to his d167 arena death).
  Nothing bad happens on the walk — teaching or retreat — so the label
  over-claims: a friendly walk is not a betrayal. Label-honesty blank for
  a future run; no src change made here (measurement run, and the walk's
  content is good).

## Reachable / fun / winnable (leg 3)
- **Reachable:** YES for the approach — 3/4 seeds price a lesser seat
  in-window, voiced. The full seat is NOT reached (w5 0 everywhere), but
  85002 now shows the approach's teeth: reaching global is not the same as
  being priceable, and the price can refuse you.
- **Fun:** YES, more so than r42 — the leg now produces a genuine tragedy
  (85002) alongside its best talks (Joshua, Dorothy). The circling wart
  persists but is contained to one known talk.
- **Winnable:** YES for the approach, NOT YET for the full seat on this
  band — same standing gap as r42, now with a sharper diagnosis: the
  binding constraint moved from "monsters evaporate" (fixed) to "the price
  itself" (85002) and "seasoned trust" (85003). The bystander fix did its
  job; the remaining walls are design walls, not evaporation bugs.

## Lingerer downstream (r42 item b, band level)
Answered at band level: survivors now get fought (fought-tb 9, fought-field
2) or persist to end (alive 20) instead of evaporating (0 vanished). The
73675 cascade shape changed completely: 13 wave-4 spawns d101–d161, 4
fought-tb, 9 alive-at-end, village lost d169 at global rank — the gauntlet
day that used to delete bystanders now leaves them standing to be fought
or left alone. A full siege/crisis-outcome comparison (does a surviving
lingerer change a specific siege's outcome?) remains open — the fate
partition proves the mechanism, not every downstream battle.

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current 'evidence/2026-10-27/journey-scale-r43/journey-scale-r43-trust-*.json'
--metrics markerCounts.firstCourt,markerCounts.watchers,tableTele,fightsTotal,fightsByWave.4,maxGameDay`
→ 5 LOUD lines, all "disappeared: baseline N → current 0 (n=4 files)".
Verdict: NOT a real deviation. The journey trust JSONs do not carry those
fields at all — the baseline is not journey-shaped (same diagnosis as r42,
in reverse: r42 reported vacuous quiet, r43 reports vacuous LOUD). Rolling
this baseline forward would launder a shape mismatch into a number. NOT
rolled. See metric review.

## Tests
- `node scripts/test-journey-scale-r42-bystander.js` (on the rebased base):
  ALL CHECKS PASS — day-145 bystander lifts 0 (was 3 pre-fix), seq28/seq31
  fought-tb, fight-lift still works (21 rows), fully partitioned. The
  proof independently re-ran 73675 under the fix and reproduced this run's
  band result (alive 9 / fought-tb 4) exactly.
- `node scripts/check.js --quick`: 278 passed, 9 failed in 622s. The 9 are
  PRE-EXISTING on base, not caused by this run: this run modifies zero
  tracked files (git status: only new untracked files), and none of the new
  files are in the check list (not in scripts/godpath/, not in
  green-list.txt). Visible example: a godpath racks-full voice-gate test
  (next-day gate expectation). Out of this run's scope; not fixed here,
  not hidden either — named here.

## Metric review
- REMOVAL-BYSTANDER-ZERO, REMOVAL-PARTITION, PEOPLE-SENSE all GO on their
  pre-registered bars; JOURNEY-PARITY/JOURNEY-TABLE reported, not re-scored
  — the report-only design worked: it let real trajectory movement be
  reported and traced instead of forcing a GO/NO-GO onto a fix that
  legitimately moves outcomes.
- The telemetry-check shape gap (r42 + r43) belongs under metric review
  for the NEXT run, same as r42 concluded: either a journey-shaped
  baseline gets an owner and is seeded deliberately (contract area — not
  a silent roll), or the step is dropped for journey runs and that is said
  plainly. This run did neither silently: it ran the check, reported the
  LOUD lines, and did not roll.
- Proposed for the NEXT run's prereg (not applied here): formalize the
  first-capture-diff instrument used ad hoc here (line + surrounding lines
  for each seed vs the prior run) as a JOURNEY-DIVERGENCE report field, so
  trajectory movement is located, not just asserted. Also: the
  betrayal:accept label on friendly walks deserves a label-honesty check
  (is "betrayal" the picker's name for leaving Haven, or a mislabel?) —
  a question for the conversation owner, not a fix from this loop.

## LANDING STATUS
MERGED LOCALLY, PENDING SHIP. Commit a33fe3c74 (journey-scale r43, 69
files) merged --ff-only to master (rebased onto 5c3c80013 mid-run after
two sibling evidence-only landings; proof test re-run green on the
rebased tree). This note's landing edit is a second commit on the same
branch, merged the same way. No version bump, no push — the batch ship
loop owns bumps, pushes, and live verification (Vercel build-cost control).
Rotation 3→0 written on completion; playtest lock deleted.
