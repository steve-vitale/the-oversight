# journey-endgame r47 (lane B) — THE DEFERRAL WINDOW, PRICED (2026-10-24)

Leg 4 (endgame). Rotation-b 4 -> 5. Worktree journey2-endgame, branch
journey2-endgame, base bf9b15ffa. No src/js changes (probe/analyzer only);
merged locally, pending ship.

## Pre-registration (bound before the sweep)

Leg question: r46 named r47's question verbatim — VETCOMMIT + DEFERRAL
(wait at the table while hunting wave-4s). Every seed in r45 AND r46 sat
within a day of announcing, so no village ever got a veteran window. This
run asks the deferral question with the tool already built for it:
capable's CAPABLE_GREEDY deferral (greedyWaits — waits while the run looks
strong: 5+ roster, <3 losses while waiting, bearer above 40% HP, tier
under MAXTIER, day under LASTDAY; sits at once with the key, when the run
weakens, or near the horizon). Defaults as-shipped, MAXTIER 4 / LASTDAY
145 — NOT tuned for this run; the run measures the tool, it does not tune
it. Single-variable vs r46: only the sit timing changes.

Hypothesis, two-sided: deferring lets the village bank veterans, armor,
and standing together and reach the full seat — OR the deferral diverges,
because overtime is priced (canon docs/TABLE.md, src/js/overtime.js: every
7 unseated days = +1 tier, cap 6; wave-4/5 fights become RERUNS, HP
x(1+0.25t), damage x(1+0.12t); seat price −4 standing/tier). Either
outcome is a finding: convergence names the road, divergence prices it.

Bindings (a miss is NO-GO, never re-scored mid-run):
- M1 GUARD (r46 restatement): >=3/4 seeds reach the window (announceDay !=
  null) OR resolve via a voiced non-table path.
- M2 DEFERRAL HAPPENS (r47's gate): >=2/3 waves seeds wait >=7 days past
  announce (satDay - announceDay >= 7). If greedy never holds, the run
  measures nothing and says so.
- M3 VETERAN KILLS (r46 M2 restated): >=1/3 waves seeds ends with >=1
  LIVING veteran.
- M4 WAVE-5 OPEN / FULL-SEAT REACH (r46 M3 restated): >=1/3 waves seeds
  unlocks wave 5 OR earns the FULL seat.
- M5 VOICING CANONICAL (carried): 88024 (forcedrift, capable substrate,
  sit-promptly, greedy OFF) — bandCrossings >= 1 AND noticedCount >= 1.
- M6 DEFERRAL PRICE VOICED: >=2/3 deferred waves seeds show >=1 OVERTIME
  tier line in the transcript (each tier is a System line on air).
- M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
- REG (binding, inherited): r35 auditNamed on sat seeds with nonzero
  w4/w5; r37 satPenalty present + voiced-line match on sat seeds.

Substrate (PILOT, 4 seeds): r46's substrate exactly — capable base +
deed-seeking's deedPatrol + surgeUpkeep + fullseat-diag outside everything
+ vetcommit on waves seeds only — PLUS CAPABLE_GREEDY=1 on waves seeds
only (forcedrift control: greedy OFF, exactly r46). FULLSEAT=1,
VETCOMMIT=1, CAPABLE_GREEDY=1 (waves only), RELAYGREY=1 (forcedrift seed
only), TELEMETRY_FULL=1. 180d, death-aware. Seeds fresh 88021-88024.
Baseline: r46's waves seeds (0/3 living veterans, 0/3 wave-5 unlocks,
0/3 full seats, sat same day as announce, tier 0, penalty 0).
Interesting-finding bar: a living wave-4 veteran banked across the
deferral; a wave-5 unlock; a full seat; OR honest deferral deaths (the
price, counted); OR divergence (tiers eat the standing bar faster than
patrols fill it) — any of these moves the question.

Instrument: scripts/probe-endgame-r47-20261024.js (r46 probe + greedy
ownership per seed + deferral record + fallen-ledger census),
scripts/analyze-endgame-r47-20261024.js (M1–M6 + REG).
Gates: PILOT (88021, 180d, full sweep mode on one seed) then sweep;
SMOKE-equivalent covered by the pilot (stronger than 120d); DET
(instrument-on twice, 2x120d, seed 88021) GREEN byte-identical; FID
(env unset: wrapped == pure capable+deedhunt, mini gameDays/won/alive/
pantry) GREEN byte-identical.

## RESULTS (4/4 seeds)

- **M1 GUARD: GO 4/4** — 88021 announced d90, 88022 d90, 88023 d93,
  88024 d103. All four won lesser seats (88021 feared/light, 88022
  beloved/light, 88023 beloved/light, 88024 relay/dark). Final choices
  resolved 4/4.
- **M2 DEFERRAL HAPPENS: GO 2/3** — 88022 waited 9 days (6 greedy waits,
  tier 1), 88023 waited 21 days (10 greedy waits, tier 3). 88021 waited
  only 4 days (3 waits) — its window ended on a death, below (see
  mechanisms). Greedy engages; it does not hold indefinitely, by design.
- **M3 VETERAN KILLS: NO-GO (binding) 0/3** — no waves seed ends with a
  living veteran. w4+ kills: 88021 0, 88022 0, 88023 0. Committed vet
  turns: 13/13/7, DPS-race bails 0 on all three. The deferral bought
  patrol days, not kills.
- **M4 WAVE-5 OPEN / FULL-SEAT: NO-GO (binding) 0/3** — 0/3 wave-5
  unlocks, 0/3 full seats. At win, the full-seat binding is ONLY w5 on
  88021 and 88022 (every other bar met: w1/w2/w3/w4, contests, crises,
  stage, foodDeeds) — the full seat is one bar away, and that bar is
  wave-5 itself, gated behind the rd5 readiness bars (armor/weapons/
  veterans). 88023 binds w2/w4/w5 (its deferral patrols faced fewer
  wave-4s: w4 max 1).
- **M5 VOICING CANONICAL: GO 1/1** — 88024: bandCrossings=1,
  noticed=1. The control still fires on the capable substrate,
  sit-promptly, greedy OFF.
- **M6 DEFERRAL PRICE VOICED: GO 2/2 deferred** — 88022 shows 2
  OVERTIME lines, 88023 shows 6 (full-capture counts). The cost is
  announced on air AND priced aloud at the audit (below).
- **M7 PEOPLE: GO** — 3 beats sense-read in full (below), 0 senseless
  flags.
- **REG r35: GO 4/4** — audit names w4/w5 aloud on all sat seeds with
  nonzero w4/w5. **REG r37: GO 4/4** — satPenalty records present, no
  voiced-line mismatch.
- **PRIMARY: NO-GO** (M3/M4 binding). **ALL: NO-GO.**

## THE DEFERRAL, PRICED — THREE WINDOWS, THREE ENDINGS

The sweep's headline (0 living veterans, 0 wave-5) hides three different
deferral endings. Greedy's own guards, not the tier cap, ended every
window:

1. **THE WINDOW THAT ENDED ON A DEATH (88021, 4 days).** Announced d90
   after a bloodbath week (Fasil d84 monster, Ella d85 monster, Hannah
   d87 night, Esmeralda d90 arena, Masahiro d90 monster). Greedy held
   d91–93 (3 waits); Petra died to a monster d94 and the village sat
   that day with 4 alive, tier 0, penalty 6 (2 losses x3). The deferral
   bought 4 days and 0 kills. At win the binding is ONLY w5, standing
   max 199 — one point under the t5 200 line — and rd5short reads
   armor/weapons/veterans.
2. **THE WINDOW THAT ENDED ON THE TIER (88022, 9 days).** Announced d90,
   sat d99, tier 1, penalty 4 (no losses). The audit prices it exactly:
   "1 week kept waiting. Every door's standing −4." The overtime lines
   are voiced twice over: the show line ("OVERTIME! The season was
   supposed to END. You didn't sit. So we kept the cameras rolling.
   RERUNS, folks — the hits, but HUNGRIER.") and the mechanics line
   ("wave 4–5 monsters return as RERUNS (+25% HP, +12% damage)... The
   table docks your standing −4."). At win the binding is ONLY w5 again;
   rd5short weapons/veterans.
3. **THE WINDOW THAT ENDED ON THE LOSSES GUARD (88023, 21 days).** The
   longest deferral in the leg's history on this road. Announced d93,
   sat d114, tier 3, penalty 21 (3 tiers x4 + 3 losses x3). Weekly
   snapshots tell the price week by week: d100 tier 1, 8 alive, pantry
   17,949; d107 tier 2, 8 alive, pantry 15,506; d114 tier 3, 6 alive,
   pantry 8,785 — Henry fell in the arena d105, A-rin to a monster d110,
   Catalina in the arena d111, and the losses>=3 guard sat the village.
   The audit prices it exactly: "3 weeks kept waiting, 3 of Haven lost
   meanwhile. Every door's standing −21." And the deferral did NOT
   fill the wave bars: w4 max 1 (vs 88021's 4), vet turns only 7, first
   vet fight d111 — three weeks into the window. Overtime's RERUN
   scaling and the losses may have suppressed patrol success, or it may
   be seed variance; the run cannot separate those, and says so.
   Binding at win: w2/w4/w5; rd5short: veterans only — the closest rd5
   read of the sweep (armor and weapons met), still 0 veterans.

And the control's fourth mechanism, carried forward:

4. **THE KILL THAT EVAPORATED, AGAIN (88024, control).** Aria put down
   Big Loud (wave 4) d96 — the audit names it — then died in a contest
   d100, three days before the d103 sit. Veterans 0 at sit, rd5short
   armor/veterans. This is the second evaporation in two runs (r46's
   Camila d76->d90); it is now a recurring mechanism, not a one-off:
   the veterans bar demands LIVING veterans, and the endgame's own
   contest/combat mortality eats them before the sit.

## VILLAGE ASSESSMENT (plain words)

- **88021 — Nuri Guven's village, 4 alive, pantry 7,446, global.**
  Nuri, Tejaswi Kelkar, Ivy Wang, Vasyl Shevchenko. A village that bled
  five people in eleven days around the announce and sat four days later
  on a death. Comfortable pantry, unblooded, one bar from the full seat.
- **88022 — Rosa Mendez's village, 4 alive, pantry 6,195, global.**
  Rosa, Chae-won Soh, Greta Hansen, Nursulu Asanova. Ten fallen behind
  them (three to dehydration alone — Katarina d61, Abdul d72, Vanessa
  d86 — the quiet killer on this seed). Waited a week, paid 4 standing,
  won beloved anyway.
- **88023 — Jovan Milic's village, 6 alive, pantry 9,268, global.**
  Ji Yuan, Dmitri Sokolov, Petra Novak, Jovan, Chantal Mukendi, Togzhan
  Bekmukhametova. The long waiters: 21 days, tier 3, three Haven lost
  during the wait, pantry halved across the window — and still the
  wave-4 well stayed dry. Petra Novak ascended through doors the village
  built (the architect beat), and the village won beloved for it.
- **88024 — Maya Silva's village, 9 alive, pantry 10,780, global.**
  Maya, Scarlett Holmes, Mara Vasquez, Elijah Scott, Sanne Bakker,
  Olivia Bennett, Victor Lopez, Ava Garcia, Raj Patel. The dark relay
  road: the pods opened like a barracks, the village went quiet, and
  Maya merged anyway — the food conversions fading as the machine took
  her. Aria's kill evaporated three days before the sit.
- (Census lists survivors; the fallen ledger now prints alongside the
  living — the r46 census-tool gap, filled this run. Note: census
  `people` is the current roster; the fallen are ex-roster, not counted
  in `people.dead`.)

## PEOPLE CHECK (SENSE-TESTING LAW — full reads)

1. **The priced week + beloved win (88022, full 1,119-line window).**
   The table wants its price; the village wants to wait; overtime wants
   its RERUNS. The audit prices the wait ("1 week kept waiting.
   Every door's standing −4"), the war path names the gap ("put weapons
   in hands (4 of 5 armed); blood your fighters (0 of 1 veterans)"), and
   the beloved finale resolves (the constitution beat) and owes (the
   architect beat credits Greta Hansen's relay ascension; the Oversight
   coda stings: "You did it on purpose, because you were busy."). A
   quiet NPC beat lands mid-window ("Nursulu shows you where they go
   to think. 'Don't tell the others.'"). 0 senseless flags.
2. **The long wait + beloved win (88023, full 30-line audit window).**
   The audit is the whole story here: "3 weeks kept waiting, 3 of Haven
   lost meanwhile. Every door's standing −21." The war path names the
   single binding veteran gap; the beloved finale resolves with the
   same constitution beat and the same Oversight coda; Togzhan tells
   "the unproduced kind" of truth. The deferral's cost is not a number
   in telemetry — it is a line at the table. 0 senseless flags.
3. **The dark merge (88024, full 26-line audit window).** The relay
   wants integration; the System offers the pods ("children adapt SO
   fast... Don't look at us like that. You were already thinking it.");
   the village answers with silence ("The village has never been this
   quiet. Somewhere, someone starts packing — not for a journey. Just...
   away."); the merge completes ("The food conversions fade (you don't
   eat anymore; the thought is quaint)") and Maya Silva's ascension
   closes it. Dark lean on the office, dark road at the table — one axis
   this time, both voiced. 0 senseless flags.

Probe limitation (not a game bug): the saved window transcript starts at
THE AUDIT when the TABLE IS SET line isn't captured (88023/88024: 30/26
lines vs 88022's 1,119-line announce-to-end window). The deferral days'
daily SAY lines — including the OVERTIME tier lines — are therefore
counted (full-capture overtimeLines) and audit-priced, but not saved in
the window slice. M6 rests on the full-capture counts plus the audit
pricing lines, both present.

## BLANKS

- Filled (census-tool gap, r46): censusOf now prints the fallen ledger
  (name, day, cause) alongside the living — the run's best story (the
  d84–94 bloodbath, the d105–111 wait deaths, Aria's evaporation) is no
  longer readable only via repro forensics.
- Documented, not filled (Steve-call territory): whether the full seat
  is MEANT to require banking living veterans through a mortality-heavy
  endgame — the bar demands living killers, the endgame kills bearers,
  and greedy's own guards (roster<5, losses>=3) sit the village before
  the window can bank them. The deferral road converges on everything
  EXCEPT veterans; the veterans bar is now the leg's single named
  blocker across r45, r46, and r47. A future run could test a
  veteran-first road (armor+weapons banked BEFORE the announce, so the
  window is spent only on kills) — or Steve could call the bar itself.
- No src/js changes (kill discipline: the finding is about roads, bars,
  and guards, not broken code — greedy, overtime, and the audit all work
  exactly as canon describes, and the table voices all of it).

## Metric review (§14)

1. **M1's restatement held again** — 4/4 announced, 0 non-table
   resolutions needed. Keep the restated form.
2. **M2 is the run's hinge, and it held** — greedy engages (3/6/10 waits)
   and its guards end every window (death / tier / losses). A future M2
   should record WHICH guard ended the window, not just the wait length
   — this run had to read it off weekly snapshots and fallen dates.
3. **M3/M4's 0/3 is the finding, not a metric failure** — the deferral
   moved every other bar and still converted zero kills. The metric
   measured exactly what it should. Do not re-score: 88021/88022 binding
   ONLY on w5 is not "almost full" — w5 is the wave-5 gate, and the gate
   is shut.
4. **M5's substrate rule held** — control fired on capable, sit-promptly,
   greedy OFF (1/1). Keep the greedy-OFF control.
5. **M6's count-vs-slice gap** — overtimeLines counts full-capture lines
   while the saved transcript slices from the audit; a future probe
   should save the full capture (or slice from the announce day, not
   the set line) so the deferral itself is readable, not just counted.
6. **Telemetry deviation check:** run below.
7. **Balanced panel (§15):** no panel comparison applies — zero src/js
   changes, no lever moved. The comparison is r46→r47 via identical
   substrate and the leg's own analyzer (the leg's instrument, per
   r44–r46 precedent), not a panel re-run.

## Regressions / checks

- PILOT (88021, 180d, sweep mode): pipeline end-to-end; deferral engaged
  (3 waits) and ended on a death.
- SMOKE-equivalent: covered by the pilot (stronger than 120d).
- DET (instrument-on twice, 2x120d, seed 88021): GREEN byte-identical.
- FID (env unset: wrapped == pure capable+deedhunt, mini gameDays/won/
  alive/pantry): GREEN byte-identical (90d, won, alive 5, pantry 7685).
- Existing suites: check.js --quick — 280 passed, 7 failed, run twice
  (532s and 1161s — same failing set both times, deterministic). The 5
  are r46's known pre-existing baseline (test-measurement-comparison,
  test-measurement-proof-update, test-measurement-workflow,
  test-occupation-panels, test-phone-frame-proof). The other 2 are new
  at THIS master tip, not regressions from this run: test-mobile-
  combat-cadence ("enemy is announced before its action runs | Continue
  does not wrap the announced round a second time") and test-parity-
  20261014 ("gear: they still wear their spear and jacket"). Proof of
  non-attribution: this run changed zero src/js files and added zero
  test files, and no script in the repo imports the r47 probe or
  analyzer (grep-verified) — the worktree equals master tip plus 4
  untracked instrument/evidence files check.js never executes. The 2
  are pre-existing at tip bf9b15ffa (sibling work since r46's a44478652
  baseline), flagged here for the owning lanes, not fixed here — out of
  this leg's scope and untouched by its files.
- No src/js behavior changes. Tooling: probe-endgame-r47-20261024.js,
  analyze-endgame-r47-20261024.js (new).

## Evidence

- evidence/2026-10-24/journey-endgame-r47.md (this note)
- evidence/2026-10-24/perseed-endgame-r47/endgame-r47-{88021..88024}.json
- evidence/2026-10-24/perseed-endgame-r47/endgame-r47-{88021..88024}-transcript.txt
- scripts/probe-endgame-r47-20261024.js
- scripts/analyze-endgame-r47-20261024.js

**Game-code changes this run:** none (zero src/js).
**Tooling:** r47 probe/analyzer (new).

## Telemetry deviation check (2026-10-24)

- LOUD: maxTier swung -75% (baseline 16 -> current 4, n=4 files).
  LOUD: satPenalty.penalty swung -66% (baseline 91 -> current 31, n=4).
- VERDICT: EXPLAINED, not a behavior change. The baseline was seeded on
  long-deferral sits (r37: 38 days, tier 6, penalty 91) — a different
  population from both r46's quick sits (tier 0, penalty 0) and r47's
  greedy-capped deferrals (max tier 3, 21 days, penalty 21). Direction
  matters: r47 moved TOWARD the baseline population (aggregate tier 4
  vs r46's 0, penalty 31 vs 0) but greedy's guards (tier cap 4,
  losses>=3, roster<5) stop every window short of the r37 population.
  Baseline NOT rolled — it still describes sitting runs that wait out
  the clock, and rolling it would erase that reference.
