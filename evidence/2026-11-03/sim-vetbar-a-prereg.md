# Veterans-bar autopsy — prereg (Loop A, run fleshout-loop-a-20261103T1415Z, arm sim-vetbar-a)

Committed BEFORE any judged sim. Anchor: current branch HEAD at prereg
commit (sibling winnability arms arm-1 ally-join + arm-2 field-dmg are
already on this branch; they are part of the baseline, NOT this arm's
change — this arm touches neither the wild-router ally-join code nor
field-fight damage/staying code).

## Grounding (read, not assumed)

- `evidence/2026-11-03/sim-w5faced-competent-a.md` (commit e534dc00f,
  20-seed competent corpus): 1/20 wave-5 unlock, 1/20 faced, 0/20 killed.
  Readiness-5 release is the wall: 4 seeds pin at standing 199 with zero
  readiness-5-ready days; veterans short at end on 20/20 seeds, met
  transiently only on the one releasing seed (98903: veterans 0 → 1 on
  d92 → 2 on d95, release d95).
- Gate code: `src/js/standing.js` `waveCombatReadiness(w)` — veterans =
  distinct `by` ids in `state.waveKillLog` with `w >= w-1`, filtered by
  `isLiving(by)`: current scholar always living; otherwise
  `vpOf(by)` not dead. Demand (NOT changed by this arm): wave 5 needs 2.
- Kill choke point: `src/js/game.js` `recordWaveKill` (+ `recordPyrrhicKill`
  for lost fights, which also writes a `waveKillLog` entry but scores no
  deeds). Killers: scholar = `this.villagerId` at kill time (TB default),
  companion = `_tbKilledBy` villager, field = patrolling/wild villager vid,
  contest/sortie = participant vid.
- Code fact found in pre-read (to be confirmed or refuted seed-exact by
  the instrument, not assumed as the verdict): `vpOf` in
  `src/js/conversation.js` NEVER returns null — unknown ids fall back to
  `{}` (not dead), so an unresolvable killer id would count as LIVING
  under the gate, not vanish. A "kill logged under a non-killer id"
  loss therefore cannot explain a veterans shortfall through the
  liveness filter alone; the instrument must still record `by`
  resolvability per kill to prove this on real kills.
- Canon: `docs/CANON.md` + `docs/MONSTER-WAVES.md` readiness section
  (veterans = living roster members with a wave-(w-1)+ kill; demand
  table wave 5: armored 4 / armorP 15 / armed 6 / tricks 3 / veterans 2).
  Canon text says "roster members"; code counts any living `by` id
  whether or not on the roster — noted as a code-vs-canon wording gap
  in the inflation direction, NOT a candidate explanation for a
  shortfall, and NOT changed by this arm.

## Phase 1 — diagnostic pilot (this prereg judges Phase 1 completeness, not a fix)

- Policy: `scripts/policies/competent.js` `{competent}` VERBATIM, default env.
- Seeds: 8 FRESH seeds 99101–99108 (no overlap with the w5faced 989xx band).
- Horizon: 140 days, death-aware (`runDays` ends on village death / win;
  dead villages stop simulating, +10d tail max is inherent to the harness
  end, never a fixed 200d). Why 140: the w5faced corpus median survival
  was 110.5d and its one release day was d95 — 140 covers the release
  window with headroom while keeping pilot compute near ~12 min.
- Instrument: wrap `recordWaveKill` + `recordPyrrhicKill` (every wave-4+
  kill: day, monster, wave, by, via, pyrrhic or not, log length after);
  daily snapshot of `waveKillLog` wave-4+ entries, per-killer kill count
  / first / last day / vias, per-killer liveness (scholar-now? on
  roster? `vpOf` found in `data.villagers` or `rosterChars`? dead?),
  `waveCombatReadiness(5)` bars, scholar id (succession tracking), and
  killer alive→dead transitions with the day first observed.
- Primary metric (Phase 1, descriptive): per seed, the veteran conversion
  chain — (a) wave-4+ kills, (b) distinct killers, (c) distinct LIVING
  killers at end, (d) readiness-5 veterans value at end, (e) count of
  readiness-5-ready days. Phase 1 succeeds as a diagnostic iff the
  instrument is clean (0 instrument errors, every wrapped kill row
  reconcilable to a log entry or a named dedupe/cap drop) on all 8
  seeds AND every wave-4+ kill is classified into exactly one loss
  class (below) with no unclassified remainder.
- Loss classes (mutually exclusive, applied in order per killer):
  1. `never-killed` — no wave-4+ kill exists at all (shortfall is
     production, not attrition or counting).
  2. `pyrrhic` — the killer's only wave-4+ kill(s) came via
     `recordPyrrhicKill` in a lost fight where the killer died.
  3. `died-same-fight` — killer's kill was a normal kill but the killer
     died the same day (field-fight wounds / TB death).
  4. `died-later` — killer alive on kill day, dead by end (incl. scholar
     deaths: killer was scholar at kill time, mantle passed, killer dead).
  5. `alive-but-uncounted` — killer alive at end per instrument recount
     yet `waveCombatReadiness(5).veterans` excludes them (MECHANISM BUG
     candidate: counting, not production/attrition).
  6. `counted` — killer alive at end and inside the readiness count.
  A kill with `by` null/unknown is reported separately as
  `unattributed` with its via; per the `vpOf` fallback fact it is
  expected to count as living, so an unattributed kill that does NOT
  count is class 5 evidence, not a separate excuse.
- No-regression bars (Phase 1, descriptive): deaths/wins per seed,
  end standing, unlocked wave — reported, not judged (no game change).

## Phase 2 — fix + identical-seed rerun (ONLY if Phase 1 finds class 5, or
## another MECHANISM bug — a counting/attribution/routing defect in game
## code, not a numbers shortfall)

- A numbers shortfall (classes 1–4 dominating, gate counting correctly)
  is a CLEAN KILL of this arm: no fix is forced, the blank is documented
  precisely (which class dominates, seed-exact), and the run ends.
- If a mechanism bug is found: fix it small and exact in game code with
  a proof test, then rerun the IDENTICAL 8 pilot seeds with the fix.
- Primary metric (Phase 2): distinct living wave-4+ killers per seed at
  end of horizon, instrument recount AND `waveCombatReadiness(5).veterans`
  (both reported; disagreement is a failure, not a choice).
- GO threshold (fixed now, judged later): fixed arm beats baseline by
  >= 1 distinct living veteran on >= 2/8 pilot seeds AND no pilot seed
  loses a veteran vs baseline. No-regression bars: no seed's end
  standing falls vs baseline, no new win loss (wins are 0 at baseline
  expectation; any win change is reported, not hidden), instrument
  errors stay 0.
- A miss is NO-GO per MEASUREMENT §14: never re-scored against a
  friendlier metric mid-run; doubts go under "metric review".
- Confirm (12–16 seeds) ONLY on pilot GO.

## Hard limits (binding)

- Do NOT change `readyDemand`, t4/t5 thresholds, `plentyCapT5`, or any
  win price / deed gate. Do NOT touch wild-router ally-join code
  (win-allyjoin lane), field-fight damage/staying (win-fielddmg lane),
  national-standing code (win-national lane), or equipment/armor/weapon
  wearing code (sibling gearbar worker). If a fix needs another lane's
  file, report HELD with the exact shape instead of editing it.

## Balanced panel (§15)

`scripts/balance-panel.js` compares sweep-compare outputs; this arm's
corpus is a custom kill-attribution instrument, not a sweep output, so
the panel has nothing to compare here. The binding comparison is the
paired identical-seed diff (same seeds, same policy, same anchor except
the fix) in the analyzer — that pairing, not the panel, is the §15
instrument for this arm. Stated here, before judged sims, not invented
after.

## Metric review (pre-run doubts, for the NEXT run)

- 140d may truncate late releases on long-lived seeds; if Phase 1 shows
  seeds alive at cap with veterans still accumulating, the confirm
  horizon (if any) should extend, and this is recorded as a horizon
  doubt, not a silent change.
- The instrument recounts liveness from daily snapshots; a killer who
  dies and whose record leaves `rosterChars` between snapshots could be
  mis-dated by a day — death DAY is approximate to snapshot cadence,
  death CLASS is not (dead flag is terminal).
