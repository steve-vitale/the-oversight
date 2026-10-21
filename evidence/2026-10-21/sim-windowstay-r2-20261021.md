# sim-windowstay-r2 — post-unlock-window survival census (run fleshout-20261021T1215Z, axis scale-onramp)

Arm: sim-windowstay-r2 (DIAG-GO candidate). The parent diagnostic
(sim-windowreach-r2, landed 3cfb5f4ef, DIAG-insufficient-data) closed the
wave-5 door as a LAGGING INDICATOR of a village about to win (2/3 measured
unlocks won through the window, 1 died in it). This arm is its named next:
pre-screen on known-unlocking seeds s64406/s64703/s64858 and measure what
happens IN the window on the VGEAR winning substrate — what kills villages
in the post-unlock window, whether wave-5 is ever actually FOUGHT, and
whether the unlock changed the village's fate. Instrument-only: ZERO src/js
changes, ZERO scripts/policies changes.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written before the sims)

**PRIMARY (DIAG-GO):** 100% attribution of (a) post-unlock-window
villager/scholar deaths by mechanism, (b) wave-5 engagements (day + mid +
resolvable wave + participants + outcome), on every unlocking run; 0
unexplained, 0 instrumentErrors. Definitions (from windowreach-r2):
attributed = known mid + resolvable wave + taxonomy shape + (captured
fight-id joined to a kill record OR explicit unresolved reason:
fled/aborted/unrecorded); unexplained = unresolvable wave OR engagement
without fight-id AND without day+mid fallback kill match; instrumentErrors =
any entry in the instrument's error sink. Death attribution: known who +
known cause + named taxonomy channel (the windowsurvive channel set,
identical-by-construction) + for combat/monster channels a resolved killer
wave (tele wave | field-fight vDie join | monster-name lookup |
fight-start join); unexplained = no-who | no-cause | cause-unmapped |
combat-channel death with no resolvable killer wave. Phantom teles
(real=false) are excluded from the census, counted.
**GO:** every unlocking run 100% attributed, 0 unexplained, 0 instrumentErrors.
**Minimum:** ≥2 unlocking runs REPRODUCED on current master. Below 2 =
insufficient-data: report-only, NOT a failure (diagnostic, no lever killed).
**Unit:** the run. No control arm (diagnostic). §15 note: no before/after
comparison — diagnostic with no intervention (§15 panel is for lever
before/after).
**Seeds:** {64406, 64703, 64858} × {leadfeast, belongfeast} = 6 runs on the
pinned substrate (VCE.armedFor policy from scripts/policies/vgearconfirm.js).
FIRST verify unlock reproduction on current master (E0 gate: each of the 3
seeds reproduces a wave-5 unlock; if a seed fails, substitute from the
windowreach-r2 landed corpus — document which seed was swapped and why; if
no substitute unlocks, report insufficient-data honestly).
**Substrate env:** FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=1 VGEAR=1 KILLDISC=1 (asserted up front;
SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT unset). Sweep FAILS LOUD unless
env matches exactly. The sweep additionally requires POSTWIN=1 (the
continuation hook).
**SECONDARY (report, don't judge):** window deaths by mechanism (taxonomy —
compare with the windowsurvive DIAG taxonomy: raids 40/72, scholars die
more than villagers, they die rich not starving); wave-5 fights (by whom,
outcomes); window survival days; did the unlock change the village's fate;
wall numbers (national/table/wins, wave-4/5 unlocks, median/max survival,
exiled).
**Horizon:** 180d death-aware (+10d tail max), WITH post-win continuation:
runs that win keep simulating past the win flag to 180d or death.

## Instrument design

`scripts/instr-windowstay-20261021.js` — composes three proven layers:
killdisc v2 (`scripts/killdisc-instrument-20261021.js`) → the windowreach
window layer (`scripts/windowreach-instrument-20261021.js`, only the
sleep-wrap part) → a death-capture layer (the windowsurvive tele-death
pattern: Game.tele death capture with death-time ctx + router wraps
resolvePatrol/resolveWildMonsterEncounter + aidFight + combat_start
fight-starts; the death-channel taxonomy copied VERBATIM from
`scripts/probe-windowsurvive-20261019.js`, identical-by-construction so
shares compare with the windowsurvive DIAG taxonomy). Pure reads, zero
game-state writes, zero RNG draws — pinned by the E3 static scan.

**The post-win continuation hook (documented — the discovery is itself a
finding):** the stock harness (`scripts/sim-harness.js` runDays) loops
`for (day = 1; day <= days && !Game.over; day++)`, and EVERY win path in
`src/js/table.js` sets `this.over = true; this.won = true;`
(table.js:858/963/1046/1075), with `this.wipe()` removing only the save
key — never the in-memory state. **So the stock harness STOPS at the win
flag on a village that is fully alive in memory.** That truncation killed
the s64703 and s64858 window measurements (wins ~d90, the door opens
d75–97). The sweep's hook (`scripts/windowstay-sweep-20261021.js`,
POSTWIN-ALLOW): after runDays returns with Game.won, record winDay +
winPath (tableState().path), flip `Game.over = false` (the ONE documented
engine mutation in this arm's tooling), and call runDays AGAIN for
(180 − winDay) loop-days. `T.phase='done'` + `tableWaiting=false` prevent
a second win; a post-win village-lost sets Game.over WITHOUT Game.won and
the hook never fires — the death-aware end is preserved. Post-win days are
an explicit counterfactual census ("what would the window have done if the
win hadn't ended the game"), not a claim about played experience.

Proof: `scripts/test-windowstay-20261021.js` — E0 shape + unlock
reproduction; E1 det-gate (instrument-on vs off byte-identical, armed, 2
seeds × 60d, noinstr stability pre-check); E2 RED→GREEN on synthetic
fixtures (unlock-day detection, window-death attribution incl. the RED
unexplained classes, engagement/kill join); E3 read-only static scan; E4
armed+instrument determinism (180d × 2 byte-identical); D2 post-win
continuation completes + deterministic re-run. All GREEN before the sweep.

## Results

### PRIMARY — insufficient-data (report-only)

**0/6 known-unlocking seeds reproduce a wave-5 unlock on current master
(7554f2c6)** — below the pre-registered minimum of ≥2. Per the
pre-registration: report-only, NOT a failure, no lever judged. The
instrument is healthy: 6/6 runs completed, 0 instrumentErrors, the window
trace detected wave-4 unlocks correctly (3/6 runs).

| run | w4Day | w5Day | won | end | days | national | table |
|---|---|---|---|---|---|---|---|
| leadfeast s64406 | — | — | 1 | over-other | 90 | 1 | 1 |
| belongfeast s64406 | 75 | — | 1 | over-other | 90 | 1 | 1 |
| leadfeast s64703 | 100 | — | 1 | over-other | 141 | 1 | 1 |
| belongfeast s64703 | 163 | — | 1 | over-other | 175 | 1 | 1 |
| leadfeast s64858 | — | — | 1 | over-other | 93 | 1 | 1 |
| belongfeast s64858 | 85 | — | 1 | over-other | 95 | 0 | 1 |

(E0 gate output: `evidence/2026-10-21/e0-repro-windowstay.json`.)

No substitutes were available: the windowreach-r2 landed corpus contains
exactly one unlocking run (belongfeast s64858) — already in the seed set
and itself non-reproducing. Per the pre-registration, the census sweep did
not run.

### Why the seeds don't unlock: drift anatomy (s64858/belongfeast)

Same seed + same policy (VCE.armedFor) + same env + E1-proven
non-perturbing instrument — only the master moved (windowreach-r2's
9c634ebac-era → 7554f2c6, 32 commits). The trajectory changed completely:

| | old master (windowreach-r2) | current master (7554f2c6) |
|---|---|---|
| wave-5 unlock | d81 | never (win d95) |
| standing at/near unlock | raw 260 / capped 200 | raw 185 / capped 125 (d85–94) |
| living wave-4+ veterans | 2 | 0 |
| wave-4+ kills (whole run) | ≥2 (implied by veterans) | **0** |
| wave-3 kills (whole run) | n/a | **1** |
| wave-3+ spawns (whole run) | n/a | **6** (4 w3 + 2 w4, all 'world' src, 0 'cast') |
| scholar TB engagements w3+ | n/a | **0** (15 TB fights, all wave 1–2) |
| villager field fights w3+ | n/a | 12 (6 vFlee, 4 mFlee, 1 vKill, 1 w4 vFlee) |

Two independent gate components bind now, both downstream of "the village
stopped fighting":
1. **Plenty cap**: bread is identical across masters (plenty ≈ 160 both),
   but war+bonds collapsed ≈100 → ≈25. The village feasts; it doesn't earn
   blood or bonds. Capped stalls at 125 vs the 200 threshold.
2. **Veterans**: the r5 readiness bar needs 2 living wave-4+ killers;
   there are 0 wave-4+ kills at all. (Kill *recording* is unchanged —
   `git log -S waveKillLog/recordWaveKill` shows no src/js changes in the
   range; neither do the spawn functions `spawnWorldMonster` /
   `monsterWavePool` / `maintainWorldMonsters`.)

The spawn census is the sharpest lead: 6 wave-3+ spawns in 95 days, zero
from the cast path, zero scholar TB engagements above wave 2. Whether the
32-commit range throttled spawning, throttled the policy's
expedition/patrol behavior, or changed what the policy sees is
un-bisected — that bisect is the named next (see Findings).

### The s64406 pre-reg seed error (documented)

s64406's d97 unlock was measured by sim-w5gates on `VGEAR=1
FEASTSCALE_R13=1, SEATDRIVE unset` — a substrate WITHOUT the win-side
layers (that arm had 0/16 wins; the village lived to d170). It was never a
winning-substrate unlocker. Including it in this arm's "known-unlocking"
set was a pre-reg selection error (metric review below). s64703 IS a
same-policy unlock (vgearconfirm, won d90) that no longer unlocks (now wins
d141/d175, no unlock) — consistent with the drift.

### SECONDARY (report, don't judge — from the E0 runs)

Wall numbers (6 runs): national 5/6 · table 6/6 · wins 6/6 · wave-4 unlocks
3/6 · wave-5 unlocks 0/6 · median survival 94d · max 175d · exiled 0.
Deaths-by-mechanism, wave-5 fights, and window survival days are unmeasured
— there is no post-unlock window on any run. The wave-5 door is not merely
a lagging indicator of a win on current master: **wins now arrive with the
door shut** (6/6 wins, 0/6 unlocks), where the parent arm measured 1/32
unlocks with the door opening on winners.

### Proof gates

`scripts/test-windowstay-20261021.js`:
- E0 shape GREEN (3/3); reproduction sub-gate: 6/6 runs clean, 0
  instrumentErrors, **0 unlocking pairs → INSUFFICIENT-DATA** (gate result,
  report-only per the pre-reg — not a crash, not a lever kill).
- E1 det-gate GREEN (4/4): noinstr stability + instrument-on vs
  instrument-off byte-identical on the armed substrate, 2 seeds × 60d.
- E2 fixtures GREEN (16/16): unlock-day detection, death attribution
  (incl. all four RED unexplained classes: no-cause, cause-unmapped,
  no-who, unjoined-no-killer-wave), engagement/kill join contract.
- E3 static scan GREEN (5/5): zero Math.random, zero Date.now, zero
  Game.state writes, Game.<x> writes only on wrap-install lines, no
  postwin flip in the instrument.
- E4 determinism GREEN: two 180d instrument runs byte-identical.
- D2 post-win continuation GREEN (5/5): win observed and resumed (d95),
  winPath captured from tableState(), window trace extends past the win
  (94→179 days), 0 instrumentErrors, deterministic re-run byte-identical.
  (First D2 attempt caught a test bug — runArmed() uninstalled the
  instrument before the continuation, so the trace never grew; fixed by
  inlining the run so continuation precedes uninstall. The sweep's oneRun
  was already ordered correctly.)

NOTE: the sweep (`windowstay-sweep-20261021.js`) and analyzer
(`windowstay-analyze-20261021.js`) have not executed on real data — there
were no unlocking runs to census. Both are committed as the proven-ready
tooling for the re-run (the sweep's oneRun mirrors the D2-proven
continuation pattern; the analyzer's attribution is proven on E2
fixtures).

## Metric review

1. **The pre-registered seed set was wrong.** s64406's unlock came from a
   substrate without the win-side layers (sim-w5gates: 0/16 wins) — it was
   never a *winning-substrate* unlocker, so "each of the 3 seeds reproduces"
   was unachievable by construction for that seed. Revision for the next
   run: the known-unlocker set must be qualified by substrate (winning vs
   non-winning); only s64703 and s64858 were winning-substrate unlockers,
   and both have now drifted.
2. **The minimum (≥2 unlocking runs) assumed unlock-rate stationarity
   across masters.** 32 commits moved the w5 unlock from "rare but
   measured" (1/32) to "unreproduced on known seeds" (0/6). On a hot tree,
   a diagnostic that pre-screens on old-master unlocks needs a same-master
   re-verification step *before* pre-registering the seed set — which is
   what E0 did, and it correctly tripped insufficient-data instead of
   burning the census.
3. **No metric was re-scored mid-run.** The PRIMARY GO (100% attribution,
   0 unexplained, 0 instrumentErrors) was never evaluated — there were no
   unlocking runs to judge. The instrument's attribution machinery is
   proven on fixtures (E2) and the E4/D2 runs; it awaits unlocking runs.

## Village assessment

The villages in the E0 runs are rich, feasting, table-winning villages
that do not fight. belongfeast s64858: 11 living villagers at d94, pantry
bread standing at 160, zero wave-4+ kills, one wave-3 kill, six wave-3+
spawns in 95 days — and a d95 table win (national 0, table 1). The win
path works; the war path atrophied. Villagers meet wave-3 monsters in the
field and flee (6 vFlee of 12 field fights); the scholar's 15 TB fights
were all wave 1–2. This is the scale wall wearing a new mask: previously
villages starved short of national; now they feast to the table while the
wave-5 door — the endgame's escalation promise — never opens. A village
that wins without ever fighting wave-5 has not been *tested* by the thing
the fiction says is fighting back.

## Sense-testing

Not run: there are no unlocking runs and therefore no post-unlock window
to voice. (Running narration on a non-unlocking run's pre-win window
would not answer the pre-registered sense question — the village's
reaction to the unlock — so it was skipped rather than faked.)

## Findings to file

(For sim-findings.md — the coordinator files these; I do not edit that file.)
- [open] 2026-10-21 — wave-5 unlock — the wave-5 unlock drifted between masters: s64858/belongfeast (same seed/policy/env) unlocked d81 with 2 veterans on the windowreach-r2 master, now 0 wave-4+ kills / 1 wave-3 kill / 6 wave-3+ spawns in 95d and wins d95 with the door shut; s64703 likewise stopped unlocking. Kill recording and spawn functions show no src/js changes in the 32-commit range (3cfb5f4ef..7554f2c6) — the collapse is in spawn callers/policy-visible state. Bisect needed (evidence: sim-windowstay-r2-20261021.md).
- [open] 2026-10-21 — wave-5 unlock — pre-reg seed-selection trap: s64406's "known unlock" was measured on a non-winning substrate (sim-w5gates, 0/16 wins) and was never a winning-substrate unlocker. Future pre-screen sets must qualify unlocks by substrate. (steve-call: none — methodology note.)
- [open] 2026-10-21 — harness — POST-WIN CONTINUATION HOOK PROVEN: the stock harness stops at the win flag (runDays loops on !Game.over; table.js sets over=true on all 4 win paths; wipe() clears only the save key). Flipping Game.over=false post-win and re-calling runDays resumes the village deterministically (D2: win d95 → 85 more days, trace 94→179, 0 errors, byte-identical re-run). Available to future arms that need the untruncated window.
- [open] 2026-10-21 — scale wall — wins now arrive with the wave-5 door SHUT (6/6 wins, 0/6 unlocks on the E0 set; 3/6 wave-4 unlocks). The "lagging indicator" pattern from windowreach-r2 no longer holds on current master — the door isn't lagging the win, it's absent from it.

## Convergence

**Insufficient-data** (0/6 unlocking runs, minimum 2 — report-only, no
lever judged, nothing killed). The instrument stack is proven and parked
ready: E1/E2/E3/E4 GREEN, D2 GREEN (post-win continuation works), the
analyzer implements the full attribution contract on fixtures. The arm's
census re-runs the moment ≥2 unlocking seeds are re-verified on current
master. The blocking question for the axis is now the drift bisect, not
the window census.
