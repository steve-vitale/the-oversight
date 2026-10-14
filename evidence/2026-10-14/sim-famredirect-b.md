# FAMINEREDIRECT pilot — sim-famredirect-b (2026-10-14)

Loop B lever-loop run. Axis: food economy (second axis per tracker + claims).

## PRE-REGISTRATION (written BEFORE any sweep spend; §§9–12, 14 binding)

- PRIMARY: starvation deaths per 100 villager-days (sp100vd), summed over the
  16-run suite. GO = armed <= control − 0.144 (one-sided; 0.144 = p90
  |Δsp100vd| from the throttle-aa A/A calibration).
- GUARDRAILS: median survival >= control − 3d; national >= control − 2;
  exiled <= control; rot per villager-day <= 1.2× control (report-only if it
  binds — a famine lever legitimately raises production).
- KILL: primary misses, or any guardrail binds other than rot.
- HORIZON: 180d death-aware (dead villages stop, +10d tail max).
- SEEDS: 11/22/33/44/55/66/77/88 × leadcourt/belongseek, 16 runs/side,
  IDENTICAL seeds both sides. CONTROL = FAMINEREDIRECT unset (mechanism
  provably inert); ARMED = FAMINEREDIRECT=1.
- INSTRUMENT HONESTY: SMOKE=1 gate before sweep spend (fail loudly if
  policy-less); named-export policy unwrap (#69); per-side shape assertion
  (control: env unset + famineRedirects === 0 all runs; armed: env set +
  redirect fires in >=1 run).
- A miss is NO-GO — never re-scored mid-run. Metric doubts under "metric
  review"; revisions apply to the NEXT run.

## THE LEVER

The landed PRODTHROTTLE (src/js/game.js, 2026-10-13) redirects FOOD duties
(forage/garden/fish) to alt work (wood/water/stone) when the pantry holds
>4 fresh days. The empty-pantry half of the food economy has no such
instrument: sharcensus (2026-10-13) measured 61% of starved villager-days
are empty-pantry (genuine production shortfall), and person-to-person
sharing can't reach acute production collapse.

FAMINEREDIRECT is the symmetric famine-side instrument, same pattern-class
(one game-code block): in resolveOneAssignment, right after the PRODTHROTTLE
block, when the duty is wood/water/stone AND the pantry holds <2 fresh days
(thin but not empty — famine relief before the bare-pantry famine block)
AND the FAMINEREDIRECT env gate is on, the duty redirects to food work
(forage/garden/fish, round-robin via famineFoodTask(), mirroring
prodThrottleAltTask()). The env gate short-circuits FIRST (before
pantryFreshDays is read); in the browser (process undefined) it can never
fire; the gate-off path is the existing code verbatim (the diff is 40
insertions, 0 deletions — verified).

Hysteresis: engage <2 fresh days; the landed >4 throttle covers the other
end; 2–4 days is neutral. The bands never overlap — no oscillation possible.
Honest villager initiative (they check the pantry and choose hunger first),
NOT a System intervention — same register as the landed beat.

## SCHOLAR EXCLUSION (verified)

resolveOneAssignment is villager-only by construction:
1. assignTask() hard-refuses the scholar: `if (vid === this.villagerId)
   { this.say("You're the leader. Lead."); return null; }` — the scholar
   delegates duties, never receives them.
2. The task-lead resolution loop skips the scholar explicitly:
   `if (leadVid === this.villagerId) continue;`
Those are the only two callers of resolveOneAssignment. The scholar never
gets duties, so the famine redirect (like the landed throttle) can only ever
touch villager duties.

## PROOF (scripts/test-famredirect-20261014.js)

RED (pristine tree, restored via patch file — no git stash on the hot tree):
gate-integrity section passed (pre-lever behavior intact); every [RED]
lever assertion FAILED as designed (mechanism absent —
`Game.famineFoodTask is not a function` FATAL at the rotation check).

GREEN (lever applied): 26/26 ALL GREEN —
- gate off = byte-identical behavior: wood duty into a 0.5-day pantry routes
  to wood, no ledger count, no beat.
- fresh-days 1.0 → wood redirects to forage, ledger counted, honest beat
  fires (names the pantry state "shelves are nearly bare, ~1 day of fresh",
  the decision "leaves the wood run … heads for the forage instead", the
  consequence "Hunger first; the wood run can wait").
- fresh-days 3.0 → no redirect (neutral band).
- empty pantry → redirects (famine is when it's needed).
- garden/fish duties NOT famine-redirected (food tasks route normally);
  wood/stone duties redirect; rotation advances forage→garden→fish→forage
  (no stuck task).
- scholar-exclusion guards confirmed in code text.

## PILOT RESULTS

Both sides: 16 runs (seeds 11/22/33/44/55/66/77/88 × leadcourt/belongseek),
identical seeds, 180d death-aware horizon, real policies (SMOKE gate green:
policy.daily called 15/15 days, 4.5 calls/day, 2132 policy acts in smoke).

### Control (FAMINEREDIRECT unset), 16 runs

| policy | n | sp100vd | starve | thirst | hungryDays | medD | maxD | national | wins |
|---|---|---|---|---|---|---|---|---|---|
| leadcourt | 8 | 0.174 | 9 | 0 | 16 | 123 | 158 | 5 | 0 |
| belongseek | 8 | 0.110 | 6 | 1 | 14 | 115 | 180 | 4 | 0 |
| **total** | **16** | **0.141** | **15** | **1** | **30** | **115** | — | **9** | **0** |

villagerDays=10659, table=0, exiled=0, rot/vday=199.2.
Shape: FAMINEREDIRECT unset, famineRedirects=0 in all 16 runs → provably INERT. Good.

### Armed (FAMINEREDIRECT=1), 16 runs

| policy | n | sp100vd | starve | thirst | hungryDays | redir | medD | maxD | national | wins |
|---|---|---|---|---|---|---|---|---|---|---|
| leadcourt | 8 | 0.115 | 6 | 7 | 12 | 154 | 115 | 168 | 5 | 0 |
| belongseek | 8 | 0.211 | 10 | 9 | 18 | 220 | 89 | 180 | 2 | 0 |
| **total** | **16** | **0.161** | **16** | **16** | **30** | **374** | **89** | — | **7** | **0** |

villagerDays=9958, table=0, exiled=0, rot/vday=233.1.
Shape: FAMINEREDIRECT=1, redirect fired in 15/16 runs (374 total) → FIRES. Good.

Notable runs: leadcourt seed 77 armed — 71 redirects, village-lost d76
(control d65); belongseek seed 66 armed — 15 redirects, village-lost d25
with 5 starve deaths (control d137, 0 starve); belongseek seed 77 armed —
90 redirects, village-lost d89 (control d47, 2 starve).

### Verdict against pre-registration

- PRIMARY: armed sp100vd 0.161 vs GO ≤ control − 0.144 = −0.003 → **MISS**
  (and the direction is wrong, +0.020). A miss is NO-GO.
- GUARDRAILS: median survival 89 ≥ 112? **NO — binds (−26d)**.
  national 7 ≥ 7: pass (borderline). exiled 0 ≤ 0: pass.
  rot/vday 233.1 ≤ 239.0 (1.2× control): pass (report-only anyway).
- **VERDICT: KILLED AT PILOT.** The pre-registered bar binds — no re-score.

Policy split matters for the record: leadcourt armed improved sp100vd
(−0.059) and held survival (115 vs 123); belongseek armed collapsed
(+0.101 sp100vd, −26d median). The lever's benefit is policy-shape-dependent,
but the aggregate misses and the guardrail binds, so the arm dies.

## REACHABILITY (wall numbers)

| side | national | table | wins | wave≥4 | wave-5 | median survival |
|---|---|---|---|---|---|---|
| control | 9/16 | 0 | 0 | 3 runs (max wave 4, leadcourt) | 0 | 115d |
| armed | 7/16 | 0 | 0 | 7 runs (max wave 4, leadcourt) | 0 | 89d |

Wave 4 unlocks but nothing crosses wave 5 on either side; no table on
either side (0 wins). The lever moved wave-4 reach upward (3→7 runs) but
that's inside policy noise on this cohort — it did not move the wall.
Telemetry check vs the scale-wall baseline: quiet on both sides (16 files,
4 metrics, no large deviations) — no LOUD lines to investigate.

## VILLAGE ASSESSMENT

What the villages looked like: the control cohort split cleanly by policy.
leadcourt villages ran longer (medD 123) and died of combat attrition
(combat 88 + monster 21 + villager combat 14 deaths across the suite);
starvation deaths were real but rare (15). belongseek villages collapsed
earlier when they collapsed (seeds 33/77/88 lost by d32–47), mostly to
famine spirals.

Who thrived/died and why: in armed runs the redirect fired hardest in the
villages that were already collapsing — belongseek seed 77 (90 redirects,
lost d89), seed 33 (25 redirects, lost d49 with 3 starve), leadcourt seed 77
(71 redirects, lost d76). The mechanism engages in exactly the runs where
the labor economy has cratered: duties keep re-assigning the same 1–2
villagers (Enzo, Nino) to food work every day-part, but there's nobody
left to do the remaining duties. **The redirect moves labor; it can't make
labor.** In belongseek seed 66 armed (lost d25, 5 starve deaths, 15
redirects) the village was already below the viable labor floor by the time
the pantry thinned — famine relief arrived, but the hands were gone.

Mechanism cost, honestly measured: thirst deaths 1→16 on the armed side.
Redirecting water duties to food during famine trades one failure mode for
another — leadcourt 77's run had Enzo's water run redirected 71 times. In
a collapse that's arguably the right call (thirst vs starvation), but the
trade is real and wasn't pre-registered. Hunger-day totals were flat
(30/30) — the lever moved WHO died of what, not whether the village was
hungry.

What knowledge was missing: the collapse runs show villagers still
foraging stripped ground in late collapse (vigor yield pressure visible in
the proof harness pattern, unchanged). No knowledge gap the lever itself
needed — this was a labor-availability wall, not an information wall.

## SENSE-TEST (redirect beats from armed runs)

Read 100+ beats across 3 armed runs (leadcourt 77: 72 beats, belongseek 33:
26, belongseek 77: 79). Sample:

> ⚠️ Enzo checks the pantry before heading out — the shelves are nearly bare,
> ~1 day of fresh on hand… leaves the water run and heads for the harvest
> instead. Hunger first; the water run can wait.

Judgment, per the SENSE-TESTING LAW (read for meaning, not counts):
- HONEST: every redirect narrates — pantry state named ("~2 days of fresh
  on hand"), the decision named ("leaves the water run and heads for the
  forage instead"), the consequence named ("Hunger first; the water run can
  wait"). No silent branches anywhere; the ledger counts each one.
- The register matches the landed throttle beat (same sentence shape,
  mirrored content). Consistent, not jarring.
- QUALITY FINDING (documented, not fixed — arm is killed): in collapse runs
  the beat fires 70–90 times and reads as wall-of-identical-text — the same
  two villagers, the same water run, every day-part for weeks. A transcript
  reader sees ~90 copies of one sentence differing only in "forage/harvest/
  fish nets". The landed throttle never got this repetition density because
  it fires in surplus, not collapse. Any future revival should use a
  condensed repeat form ("still bare — forage again") after the first beat
  per villager per famine episode, or a per-episode cooldown. Minor: "~0 days
  of fresh on hand" reads awkwardly when the pantry is truly empty.

## BLANKS FILLED OR DOCUMENTED

- KILLED at pilot: src/js/game.js reverted byte-clean (lever leaves no
  trace). Proof, measure, sense scripts + this evidence commit as the
  record.
- DOCUMENTED (new finding, not in sim-findings.md yet): duty-redirect levers
  trade across the labor budget — redirecting water duties in famine raises
  thirst deaths (1→16). Future famine levers must name the abandoned duty's
  cost explicitly (pre-register thirst as a guardrail metric).
- DOCUMENTED: the <2-day engage band only fires meaningfully in villages
  already below the viable labor floor on this cohort — a thin-pantry
  redirect can't create labor, only move it. The lever class needs the
  labor floor as context (when does famine strike while hands remain?).

## METRIC REVIEW

1. The absolute GO bar (control − 0.144) was STRUCTURALLY UNREACHABLE: the
   observed control rate was 0.141, so the bar demanded armed ≤ −0.003 on a
   non-negative rate. The 0.144 A/A calibration delta was computed on a
   different rate regime and doesn't transfer as an absolute improvement
   when control sits below it. Proposal for the next run: a relative bar
   (e.g. ≥40% reduction on identical seeds) or a win-share metric, and
   re-calibrate the A/A delta on the current cohort before registering.
2. hungryDays was flat (30/30) while death causes shifted starvation↔thirst —
   hungry-days doesn't see duty-trade deaths. Proposal: pre-register
   thirst deaths as a guardrail alongside exiled for any labor-redirect arm.
3. sp100vd was the right shape of metric (rate, not count) — keep it.

## TELEMETRY CHECK

telemetry-check.js vs scale-wall baseline, per-seed globs
(famredirect-{control,armed}-perseed/*.json, 16 files each):
- control: quiet (no large deviations in national/table/wins/exiled).
- armed: quiet (no large deviations).
No LOUD lines — same-run investigation items: none.
