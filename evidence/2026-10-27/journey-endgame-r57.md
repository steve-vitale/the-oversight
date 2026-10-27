# Journey endgame r57 — THE HOLD TRIPLES, THE EDGE SPREADS (lane B, 2026-10-27)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next).
Pre-registration: evidence/2026-10-27/journey-endgame-r57-prereg.md
(written BEFORE any play). Instrument + evidence only, zero src/js
changes. Merged locally, pending ship.

Rotation note (verified before play, see prereg): the two
13:00/13:56 CDT "endgame r57" aborts in today's memory log were
cap aborts, not plays — no evidence, no commit, no rotation write.
This run is the first actual r57 play.

## Leg question (r56's carried items, in order) — answered

1. 199-HOLD RELEASE CHASE — NOT RELEASED, BUT THE HOLD TRIPLED
   AND ITS SHAPE SPLIT. No village peaked at 200 or above; no
   wave-5 unlock; no full seat. But three waves seeds peaked at
   exactly 199 (88305, 88306, 88307) plus the control (88304) —
   the largest 199 crop in one block yet (r55–r56 gave one or
   two per block). The hold is no longer one shape:
   - Veterans-only: 88305 (1/2 living veterans, armor/weapons
     met) and control 88304 (1/2, w4:3/3 met — its full-seat gap
     is w5-only).
   - Armor + veterans: 88306 (1/2 vets, armor short; w4:3/3 met,
     gap w5-only).
   - Three bars: 88307 (0 vets, armor + weapons short — and its
     full-seat gap is [w3:3/4, w5:0/2], not w4: its w4 bar reads
     4, OVER the 3 bar, while w3 sits one short).
   The chase narrows to a sentence: bank one more LIVING veteran
   on a 88305-class village (veterans-only) and the hold
   releases; 88306-class needs armor too; 88307-class needs all
   three. Below the hold, two more villages sit genuinely short,
   not held (88302 peak 172, veterans-only; 88303 peak 167,
   three bars) and one never approached it (88301 peak 90).
2. DECLINE-BOILERPLATE WART — NO NEW DATA, STAYS CARRIED. Zero
   withdrawal seeds for the second straight run (r56 also zero),
   so the mismatch rate stays undefined, not zero. The wart
   remains DOCUMENTED for Steve's call (r56's code read: the
   boilerplate is a single hardcoded string + state-specific
   want-list; generic by design, not an unused template).
3. M3 CONVERSION, SPREAD WATCH — THE EDGE RETURNS, ON TWO
   SEEDS. Arm B 2 kills vs Arm A 0 kills, and this time the
   kills spread: 88305 (eulogy, committed, d59 — Maya put down
   The Ugly Beast, voiced in the finale audit) and 88306 (1
   kill). r55's one-seed edge and r56's zero-kill block now
   read as variance around a real but thin effect: NOWALKIN
   produces kills when fights happen, and fights happened on
   2/3 Arm B seeds this block vs 2/3 Arm A seeds with only
   talk-downs. The flights are still there too (88305: 2 mFlee;
   88306: 2 mFlee) — NOWALKIN converts some fights, not all.
4. M3b LIVING VETERAN — SPREAD BREAKS ZERO, BAR STILL
   UNREACHED. 2/6 waves seeds bank >= 1 living veteran (88305
   Maya, 88306 one veteran) vs r56's 0/6; 0/6 bank >= 2, so the
   replication bar stays NO-GO. The direction is right and the
   bar is still one veteran short on two villages at once.
5. M2 OPPORTUNITY — RECOVERED. 2/3 Arm A seeds recorded a fight
   (88302, 88303, both talkDown) vs r56's 1/3. The miss was
   opportunity, and opportunity came back on fresh seeds.
6. CONTROL SURVIVAL WATCH — STREAK STAYS BROKEN. 88304
   announced d90, sat d90, won relay/dark with 9 alive, voiced
   (noticed 1, bandCrossings 1). M5 GO, second run in a row.
7. TELEMETRY BASELINE PROPOSAL — CARRIED, NOT ROLLED (see
   Telemetry below).

## Pre-registered bindings (§14 — a miss is NO-GO, never re-scored)

- M1 GUARD: GO 7/7 — all seven announced (d90 ×5, d91, d124).
- M2 CENSUS: GO — coverage 100% (every census fight carries a
  primary outcome), and 2/3 Arm A seeds recorded a fight.
- M2b ATTRIBUTION: GO — 8 dieFlag fights, all on 88307, all
  classified, all NAMED fight-causal deaths (the arena: Henry
  Cisse, Valeria Quispe, Salwa Al-Otaibi, Guadalupe Marino,
  Ezra Singh, Iolanda + Ines Duarte, Tashi Sherpa, Luis
  Fernandez).
- M2c ENGINE COVERAGE: GO 6/6 — fights == opens on every waves
  seed, censusErrors 0, policy-only opens 0.
- M2d COMMIT-GATE NAMED: GO 4/4 — never-observed ×4 (88302
  reunion ×2, 88303 reunion, 88305 eulogy ×2 — all with
  vetsShort true, hp high, live); retired class 0, branch kept.
- M3 CONVERSION: GO 2 vs 0 — Arm B kills on 88305 + 88306, Arm
  A zero.
- M3b LIVING VETERAN: NO-GO — replicated (>= 2): 0/6; spread
  (>= 1): 2/6.
- M4 WAVE-5/FULL: NO-GO 0/6 — no unlock, no full seat. Closest:
  three 199-hold villages + control (see item 1).
- M5 VOICING CANONICAL: GO 1/1 — 88304 crossed + voiced.
- M6 GUARD NAMED: GO 2/2 — 88301 deferred 16 days, guard hp;
  88307 deferred 1 day, guard not-ready (finish the encounter).
  (88306's prompt sit carries the 'veteran-banked' guard — the
  vetguard lever's own decision label when vets >= 1, not a
  deferral.)
- M7 PEOPLE: GO — 2 finals sense-read in full (below), 0
  senseless flags.
- M8 EXIT CANON: GO 5/5 — all mFlee fights matched to codex
  counter text (eulogy ×2, suburb, influencer, strike).
- M9 SUPPLY: GO by code rule — 99 boundary blocks across 7
  seeds, every one the same contention line ("The <monster>
  stops at the boundary — pacing, unwilling. Something else
  is already here. It's still out there."). Same rule as
  r51–r56 (ONE MONSTER PER TILE + Haven safe law).
- M10 FULL-SEAT GAP: GO 6/6 — 88301 [w4:0/3, w5:0/2], 88302
  [w4:1/3, w5:0/2], 88303 [w4:1/3, w5:0/2], 88305 [w4:2/3,
  w5:0/2], 88306 [w5:0/2], 88307 [w3:3/4, w5:0/2].
- M11 STANDING PEAK: GO — peaks 6/6 waves seeds: 90, 172, 167,
  199, 199, 199. At-199: 3 (waves) + control 199. At-200+: 0.
- REG: r35 auditNamed GO 7/7; r37 satPenalty GO 7/7.
- PRIMARY: NO-GO | ALL: NO-GO (M3b + M4 only; every other
  binding GO).

## RESULTS (7/7 seeds — all announced, all won, all lesser seat)

| seed | plan | ann | sat | seat | path/branch | won | census fights | kills | living vets | uw | peak |
|------|------|-----|-----|------|-------------|-----|---------------|-------|-------------|----|------|
| 88301 | waves | d90 | d106 | lesser | witness/light | yes (7 alive) | 0 | 0 | 0 | 3 | 90 |
| 88302 | waves | d124 | d124 | lesser | beloved/light | yes (7 alive) | 1 talkDown | 0 | 0 | 4 | 172 |
| 88303 | waves | d90 | d90 | lesser | assimilated/light | yes (4 alive) | 1 talkDown | 0 | 0 | 4 | 167 |
| 88304 | forcedrift (control) | d90 | d90 | lesser | relay/dark | yes (9 alive) | 4 (vKill, mFlee, talkDown ×2) | 1 | 1 | 4 | 199 |
| 88305 | wavesnw | d90 | d90 | lesser | feared/light | yes (7 alive) | 4 (vKill, mFlee ×2, vFlee) | 1 | 1 | 4 | 199 |
| 88306 | wavesnw | d90 | d90 | lesser | beloved/light | yes (6 alive) | 3 (vKill, mFlee ×2) | 1 | 1 | 4 | 199 |
| 88307 | wavesnw | d91 | d92 | lesser | beloved/light | yes (3 alive) | 9 (8 vDie, 1 mFlee) | 0 | 0 | 4 | 199 |

Notes on the table (units, stated plainly so nobody re-discovers
a discrepancy): the finale audit counts DISTINCT wave-4
monsters faced (88305: 2 — eulogy + reunion; 88307: 4), while
the census counts fight INSTANCES (88305: 4; 88307: 9). Both
are honest; they are different units. 88307's audit line
"waves 1–3 faced (10/8/3), with 4 wave-4 fought" is the
distinct count, not a census undercount.

## The villages, in plain words

- 88301 (witness/light, 7 alive): the quiet one. Announced
  d90 but sat only d106 after 16 deferred days on the hp guard
  (greedy tier 2, the run's only sat penalty: 8). Never met a
  wave-4 monster at all — no fights, no veterans, standing 90.
  A village that reached the table without ever being tested
  by it, and still won its lesser seat. The table priced it
  honestly (w4:0) and it still walked away a winner.
- 88302 (beloved/light, 7 alive): the late announcer (d124).
  One talk-down, no kills, standing 172, genuinely short on
  veterans rather than held. A healthy, unblooded village.
- 88303 (assimilated/light, 4 alive): one talk-down, no kills,
  standing 167, short on three readiness bars. Won with 4 left
  standing — thinner than it looks.
- 88304 (control, relay/dark, 9 alive): the streak-breaker
  holds. Announced and sat d90, won with the fullest roster,
  one living veteran, w4 bar met (3/3), held at 199 on
  veterans alone. The control is now the clearest picture of
  the chase: one more living veteran and the hold releases.
- 88305 (feared/light, 7 alive): the kill village. Maya put
  down The Ugly Beast on d59 and lived to sit — the census
  kill is spoken aloud in the finale audit ("On day 59, Maya
  put down The Ugly Beast"), not just counted. Held at 199 on
  veterans alone. Seamus Vogel ascended through doors the
  village built (relay) — the architect beat lands beside a
  real kill, not instead of one.
- 88306 (beloved/light, 6 alive): the second kill village.
  One kill, one living veteran, sat promptly d90 on the
  'veteran-banked' guard — the vetguard lever doing its named
  job. Held at 199 on armor + veterans. Its w4 bar is met
  (3/3); its gap is w5-only.
- 88307 (beloved/light, 3 alive): the bloodbath village. Nine
  wave-4 fights, eight villagers dead in them (every death
  named, every one in the arena), one monster fled, zero
  kills, zero veterans — and it still sat d92 and won, with
  three people left. Its finale spends everything "on people
  the cameras never found. You name the unfilmed villages.
  You name the dead." That line lands because the dead are
  real and counted, not decorative. Held at 199 on three bars
  despite a w4 bar that reads 4 — the w3 bar (3/4) is what
  actually binds it besides w5. The most expensive win of the
  block, and the clearest proof that the table prices rather
  than gates: it lost nearly everything and still got its
  lesser seat.

## PEOPLE CHECK (M7 — sense-read in full, SENSE-TESTING LAW)

Two finals read end to end, 0 senseless flags:

1. 88305 feared/light (PASS): the restraint theme coheres
   with the run — one kill, the rest fled or talked down.
   "The time you stayed your hand. The table doesn't know
   what to do with it — which is its own kind of fear. Your
   people breathe." The pledge ("humanity's fear is a standing
   shield, never a sword") follows from a village that
   demonstrably held fire. The audit naming Maya's kill by
   day and monster is the opposite of a filler beat: the
   finale remembers what the census counted. Minor ledger
   wrinkle, not a flag: "More promises broken than kept" yet
   the light road open — the light call rests on protection
   outnumbering killing plus the shared food truth, which the
   audit states outright.
2. 88307 beloved/light (PASS, the stronger of the two): the
   beloved finale's eulogy lands because the village paid for
   it in the census — eight named arena deaths, three alive
   at the sit. "You name the dead" is not a generic line
   here; the run note can name them too (M2b does). The
   audit's war-path readout is brutally honest at the
   moment of triumph ("armor the village (0 of 3 fighters
   armored)... blood your fighters (0 of 1 veterans)"), and
   the oversight coda's sting ("You did it on purpose,
   because you were busy") follows a village that spent
   lives to get here. A third supporting beat, same seed:
   Onni's relay appointment names its cost aloud ("Onni was
   the weakest forager, and everyone knows it") — the
   village resents a real appointment, not a menu choice.

## Blanks filled or documented

- FILLED (measurement): the 199 hold now has a three-shape
  taxonomy (veterans-only / armor+veterans / three-bar) with
  a per-village bar table, replacing r56's single-shape
  picture. The next run's question writes itself: does any
  88305-class (veterans-only) village bank the second living
  veteran?
- FILLED (measurement): NOWALKIN's kill edge spreads to two
  seeds (r55 one seed, r56 zero, r57 two) — the effect is
  real but thin, and the flights persist beside it.
- DOCUMENTED (carried): decline-boilerplate wart — second
  straight run with zero withdrawals, rate still undefined.
- DOCUMENTED (carried, not this run's to land): gap-route
  (villagers routed to known monsters) is still an unmerged
  branch at run start, not on master. If the next block again
  shows kills only where the player-adjacent policy forces
  them, gap-route is the pending mechanism — its landing is
  its coordinator's job, not a port by this run.
- NOT A BLANK (units note): finale-audit "wave-4 fought"
  counts distinct monsters; the census counts instances.
  Recorded above so the next reader doesn't file it as a bug.

## JUDGEMENT — reachable / fun / winnable (leg 4)

- REACHABLE: yes, emphatically this block — 7/7 villages
  reached the window and sat, including one that never met a
  wave-4 monster and one that lost eight people getting
  there. The window is not the problem; the FULL seat and
  wave 5 are.
- FUN: yes, with a cost caveat. The finals read as real
  payoffs for real runs (Maya's kill spoken aloud; 88307's
  eulogy for its own dead), and the bloodbath village is the
  most memorable win of the recent blocks. The caveat is the
  one the chase names: the full seat is still a wall, and a
  player who climbs to 199 three times in a row without a
  release will feel the hold as a ceiling, not a challenge —
  unless the game tells them WHICH bar binds, the way the
  audit does. (Whether the live game surfaces the readiness
  bars outside the audit is a question for Steve, not a
  finding of this sim.)
- WINNABLE: the lesser seat is winnable 7/7 this block; the
  FULL seat and wave 5 remain unwon across r55–r57 (0/19
  waves seeds). The wall is now precisely located: one
  living veteran (88305/88304-class) or armor + veteran
  (88306-class). That is a reachable wall, not a distant
  one — but it has not fallen yet.

## Gates + checks

- PILOT (88301 + 88305 + 88304, 180d): signal fired on every
  clause (census fights on 88305/88304; standing 199 ×2) —
  expanded to the full 7 seeds per the prereg gate.
- SMOKE: not run separately (pilot IS the 180d sweep mode on
  3 seeds; the full sweep re-ran them deterministically).
- DET (instrument-on twice, 2x120d, seed 88301): GREEN
  byte-identical.
- FID (env unset: wrapped == pure capable+deedhunt, mini
  gameDays/won/alive/pantry): GREEN byte-identical (90d, won
  true, alive 6, pantry 14427 both sides).
- ANALYZER: exit 1 = verdicts (PRIMARY NO-GO | ALL NO-GO),
  not a crash; verdicts identical on re-run.
- CHECK-QUICK (adoption completion, post-commit, 2026-10-27):
  pre-rebase 278 passed, 9 failed in 367s; post-rebase 278 passed,
  9 failed in 584s — IDENTICAL script list both times and identical
  to r56's standing profile (hide-discovery, measurement
  comparison/proof-update/workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, parity-20261014 gear
  spear+jacket, establishment-r20-fixes racks-full next-day
  voice). This run changed zero src/js, so the 9 are
  pre-existing on current master, not a regression from this
  commit; check.js does not execute this run's probe/analyzer
  scripts. (Two sibling landings forced two rebases between
  the pre- and post-rebase runs; the post-rebase run is the
  final profile on the merged base, and the analyzer verdicts
  stayed identical across both rebases.)

## Telemetry deviation check (2026-10-27)

- Tool verdict: LOUD on maxTier and satPenalty.penalty
  (7 files, 2 metrics).
  - maxTier: baseline 16 -> current 2 (88301's greedy tier
    2 is the block max; every other seed 0).
  - satPenalty.penalty: baseline 91 -> current 8 (88301
    alone carries 8; prompt sits and the 1-day hp-guard
    deferral on 88307 carry no penalty by construction).
- VERDICT: EXPLAINED — the same guard-ended population as
  r48–r56, taken further (this block's only penalty is one
  16-day hp-guard deferral). The baseline file itself says
  its regime is unrecorded and not to compare pre-seat
  corpora against it. Baseline NOT rolled. The re-seed
  proposal stands for a next run: re-seed from a same-regime
  guard-ended corpus and record the regime in the file.

## Metric review

- M4's GO stays narrow and labeled: it counts the UNLOCK
  (uw=5) or the FULL seat, not the veterans bar. This run
  reports bars + peaks beside every 199, per r54–r56's rule.
- Gate-passed-uncommitted: RETIRED (r55). 0 hits again; the
  branch stays in the analyzer.
- Daily-slice withdrawal detector: RETIRED (r55). The
  end-rescan IS the detector; zero withdrawals this run.
- Telemetry baseline: still describes long-deferral sits
  (r37), not guard-ended windows — r48–r57 all reported it
  EXPLAINED and did not roll it. Re-seeding proposal stands.
- Balanced panel (§15): no panel comparison applies — zero
  src/js changes, no lever moved on the default path
  (NOWALKIN default off, census + gate snapshot are
  read-only instrumentation). The comparison is r56→r57 via
  identical substrate, and Arm A→Arm B on one variable.
- New proposal (for the NEXT run, not a mid-run re-score):
  M11 should carry the readiness-bar table, not just peaks —
  this run's finding is that the peak alone hides which bar
  binds. A 199 with rd5short=[veterans] and a 199 with
  rd5short=[armor, weapons, veterans] are different chases.
  The prereg for r58 should bind the bar table as part of
  M11 (or a new M12), so the chase is judged on bars, not
  just on peaks.

## Evidence

- evidence/2026-10-27/journey-endgame-r57.md (this note)
- evidence/2026-10-27/journey-endgame-r57-prereg.md
- evidence/2026-10-27/perseed-endgame-r57/endgame-r57-{88301..88307}.json
- evidence/2026-10-27/perseed-endgame-r57/endgame-r57-{88301..88307}-transcript.txt
- journey-endgame-r57-pilot.log (in goal hidden_files; NOT
  committed to the repo: sweep stdout is per-run bookkeeping)
- journey-endgame-r57-sweep.log (in goal hidden_files; NOT
  committed: sweep stdout is per-run bookkeeping)
- journey-endgame-r57-analyzer.txt (in goal hidden_files; NOT
  committed: analyzer stdout is per-run bookkeeping)
- journey-endgame-r57-checkquick.log (in goal hidden_files;
  NOT committed: check logs are per-run bookkeeping)
- scripts/probe-endgame-r57-20261027.js
- scripts/analyze-endgame-r57-20261027.js
- scripts/policies/capable.js (unchanged — NOWALKIN_W4 rule from r50,
  env-gated, default off; no src/js changes this run)
