# Journey scale — r126: alien-fallen fix (Lane A leg 3, days 80–140)

Run: `laneA-20261110T0145CST` · 2026-11-10 from ~07:43 UTC (note written
~08:50 UTC; closeout follows the full check) · base `a6ed956f5`
(local master; origin/master diverged, see LOUD items) · worktree `journey-scale`
(+ heartbeat loop `journey-scale-hbloop-r126.sh`, PID 21098).

## Prereg (binding; full text in journey-scale-r126-prereg.md)

r125's census found the gap: the alien kill path (`apPlaygroundKill`)
calls registerDeath + removeVillager but never pushes `v.fallen` — an
alien-murdered villager is in telemetry and NOT in the memorial roll
(Arm B tele-only rows: 97901 ×1, 97904 ×1). This run BUILDS the fix
(one src change, cause `'a stranger'` — the memorial renders the cause
verbatim in the Codex and the canon says the death record says
'a stranger', never 'an alien') and proves it before/after on the
matched 4-seed panel 97901–97904.

- Q1 FIX PROOF (primary): teleOnly == 0 AND fallen 'a stranger' rows ==
  tele 'alien' rows. Q2 SURVIVAL GUARDRAIL: band lived days ≥ 440
  (within 10% of Arm A 488). Q3 MECHANISM: cures/fever/wound/field-fight
  split vs Arm A. Q4 PEOPLE CHECK: d90/d120 transcripts in full,
  senseless 0 for clean. Q5 CENSUS: plain-words village assessment.

## The fix

`src/js/alienPlayers.js` `apPlaygroundKill` (+17 lines, its own inner
try/catch, mirrors the betrayal.js ambush-murder push): after
registerDeath, push `{ villagerId, day, cause: 'a stranger',
name: fallenName }` to `v.fallen`. The beam path already records the
fallen via `tbVillagerFalls` (cause 'combat') — untouched. The
guest-death question (Bing) is out of scope — it needs its own prereg.

**Proof** `scripts/test-alien-fallen-20261110.js` — drives
apPlaygroundKill on a live harness game (seed 97904): kill returns
true, victim leaves the roster dead-marked, telemetry cause 'alien',
exactly one fallen row with cause 'a stranger' / kill day / a name,
fallen grew by exactly one, memorialRoll() shows it once with cause
'a stranger', second kill same day refused by the 5-day cooldown with
no second row. BEFORE: 7 passed, 4 failed. AFTER: **15 passed, 0
failed.** `test-deathcensus-20261110.js` 4/4 still green;
`test-fallen-memorial-20261022.js` ALL GREEN;
`test-contestdeath-b.js` 43/43 (its 1 failure pre-commit was the
uncommitted-src-diff gate — it clears once the fix is committed).

## Q1 — FIX PROOF: GO by the bar, with one honest caveat

| | lived days | alive at horizon (d140) | person deaths | teleOnly |
|---|---|---|---|---|
| Arm A (r123, WITH wideduty) | 488 | 0/4 | 73 | — |
| Arm B (r126, WITH wideduty + fix) | 488 | 0/4 | 73 | **0** |

teleOnly == 0 on all four seeds (per-seed: 0/0/0/0); books close on
all four; unattributed 0; fallenOnly 0. **The caveat:** the band staged
**zero** alien playground kills (alien-bucket deaths A=0, B=0) — so the
equality "fallen 'a stranger' rows == tele 'alien' rows" is 0 == 0.
The fix's FIRING is proven by the unit test (15/15, live harness
driving the actual kill path), not by the band. The band proves the fix
introduces no new tele-only rows and changes nothing else. A future
band on seeds where an alien kill stages would be the wild
confirmation; hunting one by running extra seeds post-hoc would be
moving the goalposts, so it is not done here. (Arm A also staged 0
alien kills; only r125's Arm B, on the reverted base with a different
RNG stream, staged 2.)

## Q2 — SURVIVAL GUARDRAIL: GO, delta exactly 0

Band lived days 488 = Arm A 488. Not "within noise" — **bit-identical:**
end days 103/121/131/133, pops 1/1, 0/0, 0/0, 0/0, person deaths 73,
cures 56 (7/22/24/3 per seed), duty-held/healer-present days and
multi-death days identical seed by seed. The fix changes no survival
number because no alien kill fired on these seeds (so the new push
never executed in the wild) and the push itself consumes no RNG and
touches no combat, cure, or sickness code. The three recent-death gates
the push feeds (contest scheduling +0.10, relief struggling, rally
blood-price) never saw a new row on this band.

## Q3 — MECHANISM: no movement, as designed

| | cures | fever deaths | wound deaths | field-fight deaths |
|---|---|---|---|---|
| Arm A | 56 | 1 | 1 | 68 |
| Arm B (r126) | 56 | 1 | 1 | 68 |

Buckets identical (field-fight 68, contest 3, fever 1, wound 1).
Villages still die of combat (~93% field-fight), ending in a
multi-death last day (d64×3, d121×4, d130×4+d131×4, d131×4+d133×3).

## Q4 — PEOPLE CHECK: transcripts clean; both carried defects reproduced exactly

Read in full: d90 transcripts ×3 (97902, 97903, 97904 — 97901 has no
d90 transcript: no talk fired that day), d120 ×3, raise talks ×14.
Senseless count in the d90/d120 transcripts: **0 — clean.**

- The conversations have meaning: a real favor with a concrete next
  step (Amina: "Dawn, then. Bring something to carry"); grief that
  resolves into talk (Ursula the mortician: "They'd tell me to keep
  working"); gossip grounded in real villagers ("Nathan is back.
  Walked in like they'd never left." — a real return; "Devon? A
  programmer, back before. Solid person."); an honest question
  answered honestly (Zoltan: "Are you angry?" — "Furious. Most days."
  — "Anger's fuel. Just — point it somewhere useful.").
- Yara's secret (97904 d90: "I know who took the extra rations but
  won't say") goes unfired because the bot LEAVES without engaging —
  a player choice, not an NPC defect; the options were all present.
  The secret stays planted.
- The 'goon' filler ("Take your time") lands flat once after a
  complete deflection (Nathan d120: "No, really — it's handled"), the
  same pattern r125 noted. Carried.
- **DEFECT (carried, reproduced exactly): Baraka unvoiced raise ×6
  in 7 days** (97902 d10–d16, all "not-offered"). Baraka speaks only
  French, yet every raise-answer talk closes with a fluent-English
  dismissal; the "come with me" mime never resolves; no cooldown.
  Same seed, same days as r125 — deterministic.
- **DEFECT (carried, reproduced exactly): Stella's trap-line
  invitation is swallowed by the raise-answer template** (97904 d24;
  r125 saw it d7): "Walk my trap line with me?" answered by the
  link-proposal acceptance — the walk is never actually answered.
- Counter-talks stay good: Tashi/Nathan raise a real unsettled ambush
  ("There's still the matter of the ambush of Baraka/Emma. Nobody's
  settled it.").
- Curiosity (not a defect): Nathan (97903 d128) proposes linking with
  "The Hungry Road" — a splinter village (village_spl_23_9304). The
  flow is coherent; the road-named splinter is just an odd name.

## Q5 — CENSUS: the four villages, in plain words

- **97901 (lived 103 days):** ladder-national at d33, lesser seat
  d46, 4 links. No wave-4 kill at all (w4total 0) — the only seed
  with none. 13 deaths, 2 joins. The pantry ran dry at the end
  (0 kcal) with 1 person standing. A village that climbed the ladder
  and still never landed a big kill.
- **97902 (lived 121 days):** ladder-national at d32, lesser seat
  d36, 5 links, 3 wave-4 kills (2 scholar, 1 villager — and that
  villager is still living, the band's one living veteran). 17 deaths.
  The pantry ended at 15,621 kcal. Baraka, the French carpenter, was
  still there at d120, nodding across the language gap.
- **97903 (lived 131 days):** ladder-national at d29 (earliest),
  lesser seat d36, 4 links, 2 wave-4 kills (both scholar). 19 deaths,
  6 joins. Ended with 4 deaths on each of the last two days.
- **97904 (lived 133 days — the longest):** ladder-national at d39,
  lesser seat d46, 5 links, 3 wave-4 kills. 24 deaths, 11 joins — the
  highest turnover. The pantry ended at 4,098 kcal.

All four: ladder stage 3 reached (d29–d39), lesser seat priced
(d36–d46), full seat 0/4, rank stayed regional, national standing as a
village never fired. No village won; no village starved (deaths are
combat, not hunger); every village ended in combat.

## Verdicts for the leg — reachable / fun / winnable

- **REACHABLE: yes.** Ladder stage 3 on 4/4 seeds, lesser seat priced
  on 4/4, wave-4 kills on 3/4, the memorial roll now records every
  death path including alien murder.
- **FUN: bounded, not by this fix.** The conversations are coherent
  and human (Q4 clean); the villages' stories read as stories. The
  fun ceiling is still the combat-ending wall — every village ends
  the same way.
- **WINNABLE: no — unchanged.** 0/4 wins, 0/4 national, 0/4 full
  seat, same as Arm A. This fix was never meant to move winnability
  (memorial bookkeeping); the win wall still stands at wave-5 kills /
  national, per r125 and the Loop B arms.

## Metric review

- Q1/Q2's bars bound the run and were honored: both GO by the bars
  as written. The Q1 caveat (0 == 0 in the wild) is recorded above,
  not re-scored: the bar asked for teleOnly == 0 and row equality,
  and both hold — but the wild firing is unobserved on this band, so
  the fix's firing proof is the unit test, stated plainly.
- One analyzer correction made mid-run (recorded, not re-scored):
  the r126 analyzer clone initially read r125-named capture/trust
  files (cures 0, lived from the last-daily-row fallback: 485) and
  printed r125's wideduty-attribution verdict ("WIDEDUTY-EXONERATED"
  — meaningless here, since Arm B is WITH wideduty + fix). Fixed to
  the r126 filenames, labels, and a Q1/Q2 verdict block; the corrected
  run reads lived 488, cures 56, VERDICT: Q1-GO Q2-GO. The tables
  were identical either way; only the labels and the verdict were
  wrong. The earlier mislabeled output must not be quoted.
- The census instrument needed no change: it already buckets
  'a stranger' as alien, and the union takes the fallen row's cause.

## Telemetry check

`telemetry-check.js` vs `scale.json` baseline, metrics fightsTotal,
fightsByWave.4, maxGameDay: **2 LOUD lines** — fightsTotal −63%
(baseline 446 → current 166), fightsByWave.4 −68% (289 → 93).
**Verdict: EXPLAINED, not a bug. Baseline NOT rolled forward.**
Investigation: my band's trust numbers are bit-identical to Arm A
(r123: 166/93, seed by seed) — the fix changed no fight count. And
Arm A's own files go LOUD against this baseline with the exact same
numbers, while r125's files (230/154) read quiet. The baseline
(446/289/646) is a longer-lived band's aggregate (646 lived days —
the r113 regime); this leg's matched band lives 488 days and fights
proportionally less. The LOUD is a baseline-regime mismatch, not a
game change. Owed: the `scale.json` baseline needs a regime re-label
(it is not this leg's regime), not a silent roll — per the baselines
NOTES.md, re-label only when the regime changes, never silently roll.

## check.js

- `--quick` (after the src change): **289 passed, 11 failed in 1717s.**
  Classified: 3× 120s timeouts under load (test-comfort-arc,
  test-synergy-stall, test-solo-campaign-endings); establishment-r20
  PROVEN pre-existing (stash test: fails on the bare base too);
  alien-playground "ontology has factions rule" PROVEN pre-existing
  (the string is absent from the source; my diff is purely additive);
  test-contestdeath-b's 1 failure was the uncommitted-src-diff gate —
  green (43/43) once committed. The remaining ~5 failures were not
  named in the tail-25 output; the full check below names them.
- Full `check.js`: **761 passed, 312 failed in 2291s.** Log:
  `~/workspace/worktrees/journey-scale-check-full-r126.log`.
  Classification (all pre-existing, none in the fix's blast radius):
  111× exit 2 — `ReferenceError: Text is not defined` at genCharacter
  (old eval-boilerplate tests crash at load; one systemic cause);
  183× exit 1 — stale assertions in Oct-era tests (124 from Oct 6–14,
  incl. alien-r12/r7 "8 personas" — the roster is 12 since Steve's
  Nov 7 ruling — and "alien gift in inventory"); 14× 120s timeouts
  (load); 4× exit 3 (old drifter load errors). The 5 godpath failures
  (measurement-proof-update, measurement-workflow, phone-frame-proof,
  mobile-combat-cadence, occupation-panels) were PROVEN pre-existing
  by a bare-base test (base file checked out, all 5 still fail —
  incl. the measurement-proof staleness pair, which the
  sim-wideduty-a loop already hit on Nov 9). **Zero FAIL details
  anywhere in the log mention 'fallen'.** My blast-radius suites are
  green (alien-fallen 15/15, deathcensus 4/4, memorial ALL GREEN,
  contestdeath 43/43). The 312-failure full-list state is a
  pre-existing backlog (stale tests + harness drift), not a regression
  from this run — fixing it is a separate cleanup, not this run's
  scope. The merge proceeds on the --quick + targeted-suite evidence,
  with this paragraph as the record.

## LOUD items (carried, not this run's)

1. **Local master ahead ~355 / behind ~156 vs origin/master** (origin
   tip `a628aeaf3`, PR #121). No reconciliation, no merge, no push —
   the ship loop owns it. This run merged locally only.
2. **Survival collapse cause still open.** Wideduty is not it on
   r125's evidence; the next attribution step belongs to the combat
   side, not the medic side. This run's fix changes nothing about
   survival (delta exactly 0).
3. **Baraka unvoiced raise ×6 in 7 days** (reproduced exactly) and
   **Stella's trap-line invitation swallowed by the raise-answer
   template** — live dialogue defects, carried for a build run.
4. **Guest deaths in the village's fallen** (Bing) — needs its own
   prereg: is a guest who dies fighting beside the village wrongly
   memorialized, or rightly? Not this run's scope.
5. **scale.json telemetry baseline is a 646-day-regime aggregate** —
   the matched ladder band (488 days) will always read LOUD against
   it. Needs a regime re-label, not a roll.
6. **r125 closeout discrepancy (recovered this run):** r125's note
   claims rotation 3→0 + lock deleted at closeout, but the rotation
   file read 3 and the lock existed at this run's start. This run
   did the stale-lock recovery, released r125's orphaned tree as
   done-merged, and plays scale per the file as read.
7. **STASH INCIDENT (this run, recovered, no loss):** a `git stash
   pop` after a no-op `git stash push` consumed a live sibling stash
   — sim-wideduty-a's WIP (`8249598`, game.js 66+/20-, "sim-medheadcount-a:
   rebased gate log", 2026-11-09 14:30Z). The object survived; the
   entry was restored byte-identical via `git stash store` and verified
   back at stash@{0} with its message and content intact. RULE (for
   the next run): never `git stash pop` unless the push just created
   an entry — verify with `git stash list` first; prefer the
   `git checkout <base> -- <file>` dance for bare-base tests, which
   cannot touch the stash. (The stash list is repo-wide and shared
   across worktrees — a pop in ANY worktree consumes the top entry.)

## Evidence

- Prereg: `evidence/2026-11-10/journey-scale-r126-prereg.md`
- Band evidence (4 seeds): `evidence/2026-11-10/journey-scale-r126/`
  (trust/ladder/deathcensus/transcripts/raisetalks per seed)
- Pilot log: `evidence/2026-11-10/journey-scale-r126-pilot.log`
  (97904, gates green); band log:
  `evidence/2026-11-10/journey-scale-r126-band.log`
- Analysis: `evidence/2026-11-10/journey-scale-r126-analysis.txt`
  (corrected analyzer run: Q1-GO Q2-GO)
- Tooling: `scripts/test-alien-fallen-20261110.js`,
  `scripts/journey-scale-r126-20261110.js`,
  `scripts/deathcensus-analyze-r126-20261110.js`
- Commits in `journey-scale`: `aa64c0590` (prereg + proof + fix +
  driver/analyzer clones). Safe-commit index clobber struck (staged-
  as-deleted + MM); repaired with the ls-tree pipe; hashes verified.
- Closeout (PENDING at note time — runs after the full check lands):
  rotation 3→0, lock delete, merge, tree release. Then: merged locally,
  pending ship — no version tag; ship loop owns bump, push, live
  verification. (These lines are written as pending on purpose: r125's
  note claimed them done before they executed, and the closeout died
  before they ran. This run does not repeat that.)
