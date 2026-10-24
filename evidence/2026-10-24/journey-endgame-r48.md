# journey-endgame r48 (lane B) — THE ARMORY WINDOW (2026-10-24)

Leg 4 (endgame). Rotation-b 4 -> 5. Worktree journey2-endgame, branch
journey2-endgame, base 02f6b32ef (fast-forwarded from dbea76c6c after a
sibling landing; zero commits of mine before the ff).

## Pre-registration (bound before the sweep)

Leg question: r47 named r48's question verbatim — a VETERAN-FIRST road
(armor+weapons banked BEFORE the announce, so the window is spent only on
kills). This run asks it with the tool already built for it: the
armorydrive pilot (commit 783783e9e, scale-onramp) MANUFACTURED villager
wave-4 kills on its substrate — "weapons in hands" (donate best spare /
craft-and-donate, plus consent-based fighter staging into wave-4 fights).
Layered onto r47's substrate (capable + deedhunt + vetcommit + greedy
deferral), the armory drive is the single variable vs r47: only the
armory layer is added, on waves seeds only. The forcedrift control keeps
greedy OFF and armory OFF, exactly r47, so M5 stays comparable.

Hypothesis, two-sided: weapons in fighters' hands convert the deferral
window's committed wave-4 facings into LIVING veterans and open wave 5 /
the full seat — OR the armory engages and kills still land at 0, which
names the next lever (companion damage output vs wave-4 HP pools, the
armorydrive bind's own terms) instead of opportunity. Either outcome is
a finding.

Canon read first: docs/CANON.md, docs/TABLE.md (the table prices the
run, never gates on godhood; full seat = deed gate; overtime prices the
wait), docs/MONSTER-WAVES.md § readiness (standing opens the wave door,
combat readiness — armor/weapons/veterans — decides whether the village
walks through). Nothing invented; the armory layer and its game-side
structure (donateWeapon, armor pile) are already on master.

Bindings (a miss is NO-GO, never re-scored mid-run):
- M1 GUARD (r47 restatement): >=3/4 seeds reach the window
  (announceDay != null) OR resolve via a voiced non-table path.
- M2 ARMORY ENGAGES (r48's gate): >=2/3 waves seeds show >=1 armory
  donation (armory.adDonations >= 1). If the layer never arms a
  fighter, the run measures nothing and says so.
- M3 VETERAN KILLS (r47 M3 restated): >=1/3 waves seeds ends with
  >=1 LIVING veteran.
- M4 WAVE-5 OPEN / FULL-SEAT REACH (r47 M4 restated): >=1/3 waves seeds
  unlocks wave 5 OR earns the FULL seat.
- M5 VOICING CANONICAL (carried): 88034 (forcedrift, capable substrate,
  sit-promptly, greedy OFF, armory OFF) — bandCrossings >= 1 AND
  noticedCount >= 1.
- M6 GUARD NAMED (r47 metric-review item 2, now a binding): every sat
  waves seed records a window-end guard reason (key / tier-cap /
  horizon / losses / roster / hp-or-other), not 'unknown'. The
  instrument must name which guard ended the window.
- M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
- REG (binding, inherited): r35 auditNamed on sat seeds with nonzero
  w4/w5; r37 satPenalty present + voiced-line match on sat seeds.

Instrument fixes carried from r47 metric review (not new metrics):
- Item 5: the saved transcript now slices from the ANNOUNCE day (the
  wrapper records the capture index at the start of the announce day),
  not from the TABLE IS SET line — so the deferral itself is readable,
  not just counted. Fallback to the audit slice if announce capture is
  missing.
- Item 2: the guard trace above (pre-sit tablePreview snapshot each
  window day, decision computed from the same fields greedyWaits reads:
  key, overtime tier vs MAXTIER 4, day vs LASTDAY 145, losses vs 3,
  roster vs 5, remainder hp-or-other).

Substrate (PILOT, 4 seeds): r47's substrate exactly — capable base +
deed-seeking's deedPatrol + surgeUpkeep + fullseat-diag outside
everything + vetcommit on waves seeds only + CAPABLE_GREEDY=1 on waves
seeds only (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) — PLUS
ARMORYDRIVE=1 on waves seeds only (withArmoryDrive outside vetcommit,
inside the diag). FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1,
ARMORYDRIVE=1 (waves only), RELAYGREY=1 (forcedrift seed only),
TELEMETRY_FULL=1. 180d, death-aware. Seeds fresh 88031-88034 (verified
unused: no 88031-88034 in prior endgame notes). Baseline: r47's waves
seeds (0/3 living veterans, 0/3 wave-5 unlocks, 0/3 full seats, armory
layer absent). Interesting-finding bar: a living wave-4 veteran banked
across the deferral; a wave-5 unlock; a full seat; OR armory engaged
with kills still 0 and a damage census attached — any of these moves
the question.

Instrument: scripts/probe-endgame-r48-20261024.js (r47 probe + armory
ownership per seed + guard trace + announce-slice transcript),
scripts/analyze-endgame-r48-20261024.js (M1–M6 + REG).
Gates: PILOT (88031, 180d, full sweep mode on one seed) then sweep;
SMOKE-equivalent covered by the pilot (stronger than 120d); DET
(instrument-on twice, 2x120d, seed 88031) GREEN byte-identical; FID
(env unset: wrapped == pure capable+deedhunt, mini gameDays/won/alive/
pantry) GREEN byte-identical.

## RESULTS (4/4 seeds)

- **M1 GUARD: GO 4/4** — 88031 announced d90, 88032 d90, 88033 d90,
  88034 d171. All four won lesser seats (88031 beloved/light, 88032
  feared/light, 88033 feared/light, 88034 relay/dark). Final choices
  resolved 4/4.
- **M2 ARMORY ENGAGES: GO 3/3** — waves donations 7/7/5 (craft-donations
  2/0/1, donated bonus +137/+243/+84). The layer arms fighters on every
  waves seed; the control correctly shows 0 (armory OFF).
- **M3 VETERAN KILLS: NO-GO (binding) 0/3** — no waves seed ends with a
  living veteran. w4+ kills: 88031 0, 88032 1, 88033 0. Committed vet
  turns: 0/21/7, DPS-race bails 0 on all three. The armory bought
  weapons, not kills.
- **M4 WAVE-5 OPEN / FULL-SEAT: NO-GO (binding) 0/3** — 0/3 wave-5
  unlocks, 0/3 full seats. Binding at win: 88031 w4/w5, 88032 w4/w5,
  88033 w4/w5 (full-seat component reach: standing met on 88032/88033
  at 192/199, wave bars short).
- **M5 VOICING CANONICAL: GO 1/1** — 88034: bandCrossings=1,
  noticed=1. The control still fires on the capable substrate,
  sit-promptly, greedy OFF, armory OFF.
- **M6 GUARD NAMED: NO-GO (binding) 2/3** — 88031 hp, 88032 losses,
  88033 unknown. The unknown is a same-day sit (see below), not a
  silent guard — but the binding as written counts sat waves seeds,
  and it is not re-scored (see metric review).
- **M7 PEOPLE: GO** — 3 beats sense-read in full (below), 0 senseless
  flags.
- **REG r35: GO 4/4** — audit names w4/w5 aloud on all sat seeds with
  nonzero w4/w5. **REG r37: GO 4/4** — satPenalty records present, no
  voiced-line mismatch.
- **PRIMARY: NO-GO** (M3/M4 binding). **ALL: NO-GO.**

## THE ARMORY WINDOW — THREE WINDOWS, THREE ENDINGS

The sweep's headline (0 living veterans, 0 wave-5) hides three
different armory endings. The armory moved the gear bars and still
converted zero kills:

1. **THE WINDOW THAT ENDED ON BEARER HP (88031, 3 days).** Announced
   d90, sat d93, 3 greedy waits, tier 0, penalty 0. Guard trace:
   wait d91, wait d92, hp d93 — a NEW named guard for the leg (r47's
   windows ended on death, tier, and losses). The village never faced
   a wave-4 at all (vetFights 0, w4 max 0, standing max 99): the
   armory's 7 donations (+137 bonus) armed a village with no wave-4
   well to draw from. At win the wave-5 bar reads armor 3/4,
   veterans 0/2 — weapons met, armor one short, veterans empty.
2. **THE WINDOW THAT ENDED ON LOSSES (88032, 14 days).** Announced d90,
   sat d104, 9 greedy waits, tier 2, penalty 20 (tier 2x4 + losses 4x3).
   The guard trace is the whole story: waits d91–101, not-ready
   d102–103 ("Finish the current encounter before taking your seat" —
   the table cannot be taken mid-encounter, two days the window
   physically could not close), then losses d104 (Anna to combat and
   Adel to the arena, both d103, pushed losses 2→4 and roster 6→4).
   The audit prices it exactly: "2 weeks kept waiting, 4 of Haven lost
   meanwhile. Every door's standing −20." The armory's 7 donations
   (+243 bonus) moved the audit's weapons line to 4/5 armed — and the
   window DID produce the leg's kill: on day 98, Adel put down Big
   Big (21 committed vet fights, first vet fight d94). Adel died in
   the arena d103, the day before the sit, so the kill evaporated:
   the audit names it ("On day 98, Adel put down Big Big") and in the
   same breath counts veterans 0/1 (wave-4 bar) and 0/2 (wave-5 bar).
   Third evaporation in the series (r46 Camila, r47 Aria, r48 Adel) —
   now a law of the leg, not a coincidence: the veterans bar demands
   LIVING killers, and the endgame's own arena/combat mortality eats
   them before the sit. Armory units at end: 0 — the donated weapons
   left with the dead.
3. **THE WINDOW THAT NEVER OPENED (88033, 0 days).** Announced d90,
   sat d90, 0 greedy waits, guard unknown. The village held 4 people
   at the announce (final roster 4, last death d73, no deaths after):
   greedy's roster guard (5+) never let the window open, so the
   village sat at once. The unknown is the instrument's scope gap
   (the guard trace only snapshots days AFTER the announce day), not
   a silent sit — the roster deduction is in the census, but the
   probe did not record it. 7 committed vet fights, 0 kills, first
   vet fight d75: commitment without conversion, on top of a
   4-person village. Armory 5 donations (+84) anyway.

And the control's fourth mechanism, carried forward:

4. **THE DARK MERGE, LATE (88034, control).** Announced d171 — the
   forcedrift road reaches the table 80 days later than the waves
   road — sat the same day, relay/dark, 9 alive, pantry 35,934. The
   pods opened like a barracks, the village went quiet, Amina Diallo
   ascended through the relay (the architect beat), and Maya's
   successor merged anyway. The control's lateness is itself a datum:
   the voicing road is not the fast road.

## VILLAGE ASSESSMENT (plain words)

- **88031 — Fatima Hassan's village, 7 alive, pantry 10,144, national.**
  Fatima, and six others. A village that armed itself for a wave-4
  fight that never came, then sat on its bearer's health. Won beloved
  anyway — the show, not the hunt, carried it.
- **88032 — Nina Petrova's village, 4 alive, pantry 7,400, global.**
  Nina, Wanjiru Kamau, Tuyet Mang, Dhruv Banerjee. The window village:
  two weeks of waiting, a kill on day 98, two deaths on day 103, a
  priced sit on day 104. The armory's weapons are gone with the dead.
  Won feared anyway — restraint as shield, mercy as the last choice.
- **88033 — Alma Lara's village, 4 alive, pantry 5,400, global.**
  Alma, Victor Lopez, Adaeze Nwosu, Dmitri Sokolov. The four-person
  village: too small to wait, so it sat at once and won feared on
  the spot. Seven committed wave-4 fights bought nothing.
- **88034 — Amina Diallo's village, 9 alive, pantry 35,934, global.**
  The fat, late village: nine people, a huge pantry, a dark relay
  road that took until day 171 to reach the table. The merge cost the
  village its quiet, not its people.
- (Census lists survivors; the fallen ledger prints alongside the
  living. Census-tool gap, not a game bug: fallen entries carry no
  villager id, so the d98 killer could only be named via the audit
  line ("Adel put down Big Big") — the ledger alone cannot name its
  own dead.)

## PEOPLE CHECK (SENSE-TESTING LAW — full reads)

1. **The priced wait + feared win (88032, full 2,499-line window).**
   The table wants its price; the village wants to wait; overtime
   wants its RERUNS (tier lines voiced twice over, −7 then −20, each
   matching the live penalty math). The audit prices the wait ("2
   weeks kept waiting, 4 of Haven lost meanwhile"), names the kill
   and its evaporation in the same breath, and the feared finale
   resolves (mercy as the last choice: "the most frightening thing
   you ever did") and owes (the Oversight coda stings: "You did it
   on purpose, because you were busy."). 0 senseless flags.
2. **The dark merge (88034, full 48-line announce-to-end window).**
   The relay wants integration; the System offers the pods ("children
   adapt SO fast... You were already thinking it."); the village
   answers with silence ("The village has never been this quiet.");
   the merge completes ("Power immense. Self eroded.") and Amina
   Diallo's ascension closes it. Dark lean on the office, dark road
   at the table — one axis this time, both voiced. 0 senseless flags.
3. **The beloved win without a wave-4 (88031, full 755-line window).**
   The audit is honest about the gap (wave-4 bar: veterans 0/1;
   wave-5 bar: armor 3/4, veterans 0/2) and the finale still resolves
   (speak for the quiet ones: "You name the unfilmed villages. You
   name the dead.") and owes (the same Oversight coda). A village
   can win beloved without ever meeting the wave-4 bar — the lesser
   seat does not ask for it. 0 senseless flags.
- Announce-slice transcript fix (r47 metric-review item 5) DELIVERED:
  88032's window reads 2,499 lines from the announce day through the
  finale — the deferral days' daily lines are in the file, not just
  counted. Same-day seeds correctly slice short (88034: 48 lines,
  announce day = sit day = finale).

## BLANKS

- Filled (instrument, r47 metric-review items 2 and 5): the guard trace
  names the window-end guard per window day (wait/wait/hp on 88031,
  the full d91–104 trace on 88032 including the not-ready encounter
  days), and transcripts slice from the announce day.
- Documented, not filled (Steve-call territory): whether the full seat
  is MEANT to require banking living veterans through a mortality-heavy
  endgame — the bar demands living killers, the endgame kills bearers
  (third evaporation in three runs), and greedy's own guards
  (roster<5, losses>=3, bearer HP) sit the village before the window
  can bank them. The armory road converges on everything EXCEPT
  veterans: weapons met (88031) or 4/5 (88032), armor 3/4, standing
  192–199 — and still 0 living veterans. A future run could test a
  veteran-first road that banks the kill BEFORE the announce (so the
  window is spent defending a living killer, not making one) — or
  Steve could call the bar itself.
- Documented, not filled (instrument scope): the guard trace misses
  same-day sits (88033) because it only snapshots days after the
  announce day. Next run's probe should snapshot the preview on
  EVERY day (announce day included), so the announce-day decision is
  recorded too.
- No src/js changes (kill discipline: the finding is about roads,
  bars, and guards, not broken code — greedy, overtime, the armory,
  and the audit all work exactly as canon describes, and the table
  voices all of it).

## Metric review (§14)

1. **M1's restatement held again** — 4/4 announced, 0 non-table
   resolutions needed. Keep the restated form.
2. **M2 is now the armory gate, and it held** — donations 7/7/5, so
   the run measured an armed road, not an absent layer. Keep.
3. **M3/M4's 0/3 is the finding, not a metric failure** — the armory
   moved weapons (met on 88031, 4/5 on 88032) and still converted
   zero living veterans: the one kill evaporated. The metric
   measured exactly what it should. Do not re-score: 88032's audit
   naming a kill that counts as 0 veterans is not "almost" — the bar
   counts LIVING killers, and Adel died d103.
4. **M5's substrate rule held** — control fired on capable,
   sit-promptly, greedy OFF, armory OFF (1/1). Keep the control clean.
5. **M6's 2/3 is an instrument-scope miss, not a game miss** — the
   unknown is a same-day sit with no window day to snapshot. For the
   NEXT run, scope M6 to deferred seeds (deferDays >= 1) AND fix the
   probe to snapshot the announce day itself; do NOT re-score this
   run's 2/3 as 3/3 — the binding as written counts sat waves seeds.
6. **Telemetry deviation check:** run below.
7. **Balanced panel (§15):** no panel comparison applies — zero src/js
   changes, no lever moved. The comparison is r47→r48 via identical
   substrate plus the armory layer, and the leg's own analyzer (the
   leg's instrument, per r44–r48 precedent), not a panel re-run.

## Regressions / checks

- PILOT (88031, 180d, sweep mode): pipeline end-to-end; armory
  engaged (7 donations), window ended on the hp guard, transcript
  sliced from the announce day.
- SMOKE-equivalent: covered by the pilot (stronger than 120d).
- DET (instrument-on twice, 2x120d, seed 88031): GREEN byte-identical.
- FID (env unset: wrapped == pure capable+deedhunt, mini gameDays/won/
  alive/pantry): GREEN byte-identical (121d, won false, alive 2,
  pantry 9683 both sides).
- Existing suites: check.js --quick — 280 passed, 7 failed, run twice
  (341s and 414s — same failing set both times, deterministic). The
  set is EXACTLY r47's 7 at this tip: the 5 known pre-existing
  (test-measurement-comparison, test-measurement-proof-update,
  test-measurement-workflow, test-occupation-panels,
  test-phone-frame-proof) plus the 2 r47 flagged as new-at-tip
  (test-mobile-combat-cadence, test-parity-20261014 "gear: they still
  wear their spear and jacket"). Proof of non-attribution: this run
  changed zero src/js files and added zero test files, and no script
  in the repo imports the r48 probe or analyzer (same argument as
  r47) — the 7 are pre-existing at tip 02f6b32ef, flagged here for
  the owning lanes, not fixed here: out of this leg's scope and
  untouched by its files.
- No src/js behavior changes. Tooling: probe-endgame-r48-20261024.js,
  analyze-endgame-r48-20261024.js (new).

## Telemetry deviation check (2026-10-24)

- LOUD: maxTier swung -87% (baseline 16 -> current 2, n=4 files).
  LOUD: satPenalty.penalty swung -78% (baseline 91 -> current 20, n=4).
- VERDICT: EXPLAINED, not a behavior change. The baseline was seeded on
  long-deferral sits (r37: 38 days, tier 6, penalty 91) — a different
  population from both r47's greedy-capped deferrals (tier 4, penalty
  31) and r48's guard-ended windows (max tier 2, penalty 20: windows
  ended on hp, losses, and roster guards before tiers could
  accumulate). Baseline NOT rolled — it still describes sitting runs
  that wait out the clock, and rolling it would erase that reference.

## Evidence

- evidence/2026-10-24/journey-endgame-r48.md (this note)
- evidence/2026-10-24/perseed-endgame-r48/endgame-r48-{88031..88034}.json
- evidence/2026-10-24/perseed-endgame-r48/endgame-r48-{88031..88034}-transcript.txt
- scripts/probe-endgame-r48-20261024.js
- scripts/analyze-endgame-r48-20261024.js
