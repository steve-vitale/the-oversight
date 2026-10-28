# sim-homebirth-b — is the home-birth blank a gap or the design? ANSWERED (measurement only)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261028T1030Z (dead,
stale-lock recovery) adopted by run fleshout-loop-b-20261028T1230Z, axis
food-economy, arm sim-homebirth-b. MEASUREMENT ONLY: zero src/js changes,
zero default flips, no lever, no game behavior changed by this arm.
Prereg: evidence/2026-10-28/sim-homebirth-b-prereg.md, committed BEFORE
any judged sweep (branch sim-homebirth-b: prereg b1601e7fb, instruments
63e5ba0a0, warmoff fix 6423a1e64). Instruments:
scripts/sweep-homebirth-b.js (adapted from sweep-childbirth-b.js) +
scripts/analyze-homebirth-b.js (judges the prereg bar, exit 0/1/2).
Harness: loadGame/setupGame/runDays per seed, seed before eval, full
src/js list minus DOM-only files, Game.save never stubbed.

## VERDICT: QUESTION-ANSWERED — the home-birth blank is the design, not a gap

Analyzer on the completed 16-file corpus: Q1 corpus complete TRUE, Q2
homeChild exact TRUE, Q3 joiners classified TRUE, Q4 gate classified
TRUE, exit 0. Confirm NOT SPENT per the prereg's own confirm rule
(all-zero structural result; the 0444Z 300d band already covers the
longer window — there is nothing whose recurrence is worth confirming).

The prereg hypothesis is confirmed on the game's intended 5–6 month span,
under BOTH policies (so the structural claim is policy-independent, not
a policy artifact):

- Home children: 0 at setup AND 0 at end on all 16 seeds (0/0 everywhere).
- Home births / child joiners: 0. Every joiner is an adult: 37/37
  (primary 21/21, warmoff 16/16), 0 child, 0 unknown. No null age was
  defaulted to adult — the analyzer fails Q3 on any unclassified joiner.
- The 270-day birth gate: NEVER reached. Max day over scholar + distant
  villages is 139–182 per seed; gateReached 0/16. No village, home or
  distant, can reach day 270 inside the intended span.
- Birth news lines: 0 in the entire corpus. Distant births (birthDay
  members): 0. Distant villages DO hold children (primary 46 across 22
  villages, warmoff 44 across 24) — those are roster-generated children
  (genVillageRoster 30%), not births in play. The in-sim birth code
  fired zero times in 16 villages × ~180 days.
- Home growth, where it happens, is arrivals only: primary 21 joiners
  (0–6 per seed), warmoff 16 (0–7 per seed). Arrival cross-check:
  arrivedDay joiners 4/21 primary, 5/16 warmoff — the minority came
  through the application path; the rest carry visjoin_ ids (the
  visitor-invite path, which sets no arrivedDay). Either way, every
  arrival is an adult by construction (genCharacter ageMin 19).

## Per-policy band (analyzer output, seeds 10510–10517, 180d death-aware)

Primary — competent-nofeast (COMPETENT_WARM=1, FEAST=0, SEATDRIVE=0):
all 8 survived to 180d. homeCh 0/0 on every seed. Joiners 21, all adult.
Leavers per seed: 12, 8, 6, 2, 10, 0, 10, 5. Distant villages 22,
distant children 46, distant births 0, birthLines 0, gateReached 0/8.
National/table/wins 0/8 (no seat instruments — expected, not judged).
Wave reach: max 3 on 7 seeds, 2 on 10512; wave 4 0/8, wave 5 0/8. Arc 3
on all 8. Median survival 180d, max 182d (maxDay, not daysAlive).
Deaths: arena 18, sickness 9, wound-that-wouldn't-close 7, contest 9,
monster 7, starvation 2, ambush 2, dehydration 1, gavel 1, night 1,
combat 1, lockjaw 1.

Variant — competent-nofeast-warmoff (COMPETENT_WARM=0):
6 survived to 180d, 2 village-lost (10514 day 163, 10517 day 139).
homeCh 0/0 on every seed. Joiners 16, all adult. Leavers per seed:
7, 9, 4, 4, 12, 3, 12, 12. Distant villages 24, distant children 44,
distant births 0, birthLines 0, gateReached 0/8. National/table/wins
0/8. Wave reach: wave 4 on 3 seeds (10510, 10511, 10514), wave 3 on the
rest; wave 5 0/8. Arc 3 on all 8. Median survival 180d, max 182d.
Deaths: arena 33, monster 15, sickness 10, wound 7, starvation 2,
ambush 2, night 2, choir toad 1, cliffhanger 1, combat 1, lockjaw 1.

The variant changes survival and wave reach (warmoff loses 2 villages
and reaches wave 4 three times where primary reaches it never) but
changes NOTHING about the birth structure: both policies agree exactly
on children, births, and the gate. Warmoff is not a birth lever.

## What this closes, and the ruling specification (NOT a build)

This measurement supports the coordinator design-first note
(hidden_files/coord-homebirth-design.md, 2026-10-28) and turns it from
a leaning into a measured answer on the intended span:

- CLOSED as verified-by-design: the "home villages never have children"
  blank. The adult-only home roster is correct as-is. Population growth
  comes from arrivals from other villages, not births. Pregnancy is not
  modeled (source scan: zero `pregnan` matches in src/js) and, per
  Steve's stated leaning, should stay unmodeled.
- RULING SPECIFICATION for Steve to confirm or overrule (he has the
  final call; this arm builds nothing): do NOT build a home-birth path;
  do NOT build pregnancy, birth, or child systems for the home village;
  at most, a villager who arrives already pregnant is a rare arrival
  story — a new, separately-ruled piece of work, not something this
  measurement authorizes. The distant-village birth code stays as-is
  (abstract distant villages; it never fires inside the span anyway).
- DOES NOT CLOSE: anything about distant-village children reaching the
  pantry door — 0444Z already measured that (child pantry eats 0) and
  this band re-confirms the mechanism (no home child exists to eat).

## Village assessment (plain words)

Across sixteen villages living out their first six months, nobody was
born at home, nobody arrived as a child, and nobody's village ever got
old enough for the birth rule to even wake up. Villages grew the only
way they can: strangers walked in off the road and stayed — six adults
here, none there, seven on a lucky seed — and villages shrank the only
way they do: the arena, sickness, and wounds took people away. The
distant villages over the hills do have children in them, but those
children were there from the start of the story, not born during it.
A village in this game is a group of adults who found each other, not a
family that grows. That is the design working, not a system missing.

## Sense note (what the transcripts do and do not show)

Narration is SILENCED in this instrument by design (harness default, as
in childbirth): the judged claims are state-based (roster diff,
arrivedDay, village days), not say-lines. So there are no arrival lines
to quote verbatim — none were captured, and none are claimed. What the
state shows reads as people joining a village, not numbers: joiners
arrive as named adults through the visitor path (visjoin_ ids) or the
application path (arrivedDay keys), in ones and handfuls, while leavers
are named villagers and generated strangers alike. No transcript beat
in this corpus mentions a child at the fire, a pregnancy, or a birth —
because the birthLines field is empty on all 16 seeds, not because the
probe looked away. The separate narration sense probe the prereg names
was not run: with narration silenced, it would add voice, not evidence,
and the judged question is already answered by state.

## Metric review (section 14 — filled at report time)

- The bar worked as written: Q1–Q4 are exact, checkable, and all true;
  the confirm rule fired in its NOT-SPENT branch, correctly — spending
  12–16 fresh seeds to re-confirm zeros would have measured nothing.
- No metric was re-scored mid-run. The verdict is judged ONLY on the
  prereg bar; wave/national/table numbers above are wall reporting,
  never pooled across policies for judgment.
- Analyzer display bug (does NOT touch the verdict): the POOLED leavers
  line concatenates the per-seed leaver id arrays into one unreadable
  string (tot() sums arrays). Per-seed leaver counts in the table are
  correct and are the authoritative numbers (quoted above). A future
  analyzer pass should sum lengths, not arrays. Same class as the
  previously recorded analyzer display bugs — tooling, not data.
- Determinism note: the fresh warmoff band reproduced the dead run's
  three surviving warmoff rows on every comparable number — joiner
  counts 3/5/1, days 180/180/180, homeCh 0/0 — and on exact file sizes
  (2544/2927/2211 bytes). That is a count-and-size match, NOT a claimed
  byte-identity (the originals were superseded, see Infrastructure).
  The judged band is the fresh 8-row band, self-consistent from one
  process; nothing was cherry-picked cell by cell.
- Panel statement (section 15): standing panel exception, stated not
  faked (same as childbirth/outflowzero) — corpus is census rows with
  no panel-ingest mode; no before/after leg exists for a measurement
  arm, so no panel comparison is fabricated.

## Telemetry deviation check (loop-B body step 10)

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/
scale-wall.json --current '<homebirth corpus glob>' --metrics
national,table,wins,exiled`: 3 LOUD lines (national 12 -> 0, table
16 -> 0, wins 16 -> 0, n=16 files). All INVESTIGATED same-run and all
REGIME artifacts: the scale-wall baseline is a WINSEAT regime (seat
instruments on) while this corpus is a competent-only pre-seat
substrate (SEATDRIVE=0, no seat instruments), so national/table/wins
are structurally 0. Baseline NOT rolled. No exiled line (no exiled
field in either side's rows for this comparison).

## Infrastructure (adoption honesty)

- Dead-run state found: primary 8/8 valid (11:04–11:12Z); warmoff v2 3/8
  valid (11:20–11:24Z, warm=0, after the 11:17 fix — the v1 bug that
  silently re-ran primary under a warmoff label was already fixed and
  its rows deleted by the dead worker); warmoff s10513–s10517 all
  0 bytes, written 12:30–12:31Z in REVERSE seed order at ~8s spacing —
  the signature of the dead worker's pending-flush loop failing under
  the container EPERM flap and dying with the data in memory (the
  sweep's tryWrite verifies readback and never reports a 0-byte file
  as written; no live worker process remained — ps clean).
- Adoption decision: the FULL warmoff band (8 seeds, one process) was
  re-run rather than filling 5 cells, because the prereg's own panel
  note says multi-seed single-process sweeps do not reproduce
  seed-by-seed — a 5-cell refill from a different process position
  would not be comparable to the stored 3 rows. The fresh band is the
  judged band; the 3 superseded rows are reported above (counts +
  sizes), not hidden.
- Backup failure, disclosed: the cp of the 3 original warmoff rows to
  hidden_files/run-1230/ FAILED under the same flap (EPERM on write,
  0-byte dests created, cleaned up immediately). The originals were
  therefore superseded without a byte copy — the count-and-size match
  above is the surviving fidelity evidence. Nothing else was lost: the
  primary 8 rows were never touched.
- Fresh sweep: 8/8 written, exit 0, no pending files, ~10.5 min
  (12:37–12:48Z). Writes succeeded throughout the re-run — the flap
  is intermittent across seconds (it hit the cp at 12:37 and the
  .git probe at 12:35, while corpus writes at 12:37–12:48 succeeded).
- NOT done here (blocked by the flap, see run notes): committing this
  evidence file + the corpus + the analyzer run into the repo, and
  merging. This evidence file + corpus live UNCOMMITTED in worktree
  sim-homebirth-b (branch sim-homebirth-b, tip 6423a1e64 + untracked
  corpus). Next run, when .git writes clear: safe-commit the corpus +
  instruments + prereg + this evidence (no src/js, no [needs-eyes] —
  measurement only), then merge --ff-only (rebase onto current master
  first; zero overlap expected with sibling landings — arm files are
  evidence/2026-10-28/sim-homebirth-b* + scripts/sweep-homebirth-b.js
  + scripts/analyze-homebirth-b.js + the corpus dir). Do NOT delete
  the tree or branch; the reaper protects dirty trees.
- No main-tree touch, no push, no bump, no live verification
  (ship-loop line). No jest/check.js run for this arm: zero src/js
  changed, and the arm's attributable verification is the analyzer
  (exit 0) on the frozen corpus — stated, not claimed.
