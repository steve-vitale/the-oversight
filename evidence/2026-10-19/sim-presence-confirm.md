# sim-presence-confirm — the presence confirm (2026-10-19)

Run: flesh-out loop arm sim-presence-confirm (loop oversight-flesh-out-loop), axis scale-onramp (the blocking axis).
Worktree: ~/workspace/worktrees/sim-presence-confirm.
Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, villager XP law, combat-readiness bar, design call #4).
Pilot: evidence/2026-10-19/sim-presence.md — PILOT GO (join rate 45.5% vs 6.5% = 7.05x, bar 1.5x; 5 companion kills vs 0; all guardrails PASS). The layer under test is scripts/policies/presence.js (PRESENCE=1; policy-side only, zero src/js), landed on master as 7de3bbede.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — BINDING, written BEFORE the sweep)

**CONFIRM PRIMARY (outcome):** living-veterans at end of run =
`Game.waveCombatReadiness(4).veterans` — living roster members with a
wave-3+ kill in `state.waveKillLog` (the engine's own VETERANS bar, design
call #4; pinned on the engine by scripts/test-presence-confirm.js T1).
Summed over the 32-run corpus per arm, paired on identical seeds × policies.
**presence total ≥ control total + 4 → GO** (+2 per 16 runs, the
pre-registered bar scaled to this corpus). Miss → NO-GO (kill protocol:
layer deleted zero-trace, instruments + evidence land). A miss is NO-GO,
never re-scored mid-run (§14).

**HORIZON:** 180d death-aware (dead villages stop simulating; runDays
handles). Why: matches the pilot corpus; veterans need wave-3+ exposure
(day 25+ gates) plus a survival tail for kills to convert into LIVING
veterans.

**SEEDS:** 16 fresh (63541–63556 — verified filename-unused in
evidence/2026-10-19/perseed-*/ and scripts/ before the sweep; families in
use on 2026-10-19: presence pilot 63521–63528, diagnostic/armory 63511–63518,
winsupport 64001+, vetrel1 63901+, loop-B doomrevive 7401–7408,
cookbulk-b3 94101–94108, cookbulk-confirm-b 95101–95116).

**POLICIES:** tribfloor leadfeast/belongfeast (control) vs
leadpresence/belongpresence (PRESENCE=1; presence layer on the armed side
only).

**SUBSTRATE:** FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 (the pilot
substrate).

**GUARDRAILS (all must hold):**
- median survival (gameDays) ≥ control − 5d
- no new death modes; esp. ZERO fighter-movement deaths (the mechanism never
  assigns/moves/risks villagers — proof A9 in test-presence.js + T3 in
  test-presence-confirm.js; villager-combat death share reported)
- national/table reach not degraded (noise band ±2; panel regression_watch
  with 95% CI crossing 0 = pass)

**METRIC DOUBT carried (pilot #7):** the beat fires often (up to 40/run on
s63524). If the confirm shows survival costs, note a cooldown as named next
— do NOT re-score.

[SWEEP RESULTS — appended after the sweep]

## Results — CONFIRM

**CONFIRM VERDICT: NO-GO (kill protocol executed). The layer is deleted.**

64 runs (32+32), 0 instrument errors, anchor ad23720f3 (current master).

| metric | control | presence | bar |
|---|---|---|---|
| **PRIMARY: living-veterans at end of run** | **3** | **4** | **≥ +4 → NO-GO (delta +1)** |
| veterans5 (living wave-4+ killers) | 1 | 1 | — |
| join rate (mechanism continuity) | 1.4% (1/69) | 41.2% (28/68) | — |
| w3 companion kills | 0 | 15 | — |
| companion damage (total) | 39 | 6,792 | — |
| beat engagement (goInside fires) | 0 | 468 | — |
| runs with beat firing | 0/32 | 32/32 | — |
| median survival (gameDays) | 118 | 125 | ≥ control−5d → PASS |
| starvation deaths | 11 | 16 | (reported) |
| death modes | 24 | 21 | no new → JUDGED PASS (category review below) |
| national reach | 17/32 | 15/32 | not degraded → PASS |
| table reach | 22/32 | 24/32 | not degraded → PASS |
| wave-4 reach | 24/32 | 21/32 | — |
| wave-5 reach | 0/32 | 1/32 | — |
| wins | 0/32 | 0/32 | — |

The primary MISSED (+1 vs the +4 bar). Per the pre-registered kill protocol
and §14 (a miss is NO-GO, never re-scored mid-run), the verdict is NO-GO and
the layer `scripts/policies/presence.js` is DELETED zero-trace. Instruments
+ evidence land.

### Balanced panel (§15)

`evidence/2026-10-19/presence-confirm-panel-primary.md` — control→presence
compare: decision `review_required`. All deltas except one are
`regression_watch` with 95% CI crossing 0 (survival60 −0.0625 both policies;
communityLost +0.125 lead; national −0.125 belong) — no material signal. One
`regression_signal`: **npcHungry on belongfeast, delta +0.25, CI
[0.0625, 0.4375]** — presence raised the share of runs with any starvation
death. Consistent with the raw starvation counts (16 vs 11). A real cost
signal; named as a watch-item for any recombination. The panel is the
instrument; the pre-registered +4 threshold was the judge.

### Veteran identity (the metric-review probe)

The pre-registered primary counted ALL living veterans (the engine's
VETERANS bar includes the scholar — `isLiving(scholarId)` is always true).
A deterministic re-run probe (scripts/probe-veteran-identity-20261019.js,
one-off, since deleted) identified every veteran on both arms:

**Presence's 4 veterans are all living VILLAGERS:**
- Aroha (lead s63547) — living, killed a wave-4 Influencer. Diana (w3+w4
  kills) and Kjell (w3×2) also killed on that run — both dead.
- Marcelo (lead s63554) — living, killed a wave-3 Spool. Chen (w3×2) and
  Nino (w3) — both dead.
- Nora (belong s63547) — living, killed a wave-3 Spool. Kjell (w3) — dead.
- Hassan (belong s63551) — living, killed a wave-3 Spool. Ethan (w3×2) and
  Tom (THREE wave-4 Strike kills + w3 Spool) — both dead.

**Control's 3 veterans are all SCHOLAR-veterans:**
- Chloe (lead s63545) — the scholar, living, w3 kill. Adaeze (villager,
  w3×2) — dead.
- Jovan (lead s63547) — the scholar, living, w3×4 + w4 kills.
- Vasyl-line (lead s63551) — the scholar vid (counted via the scholar
  short-circuit), village lost.

So on the layer's actual target — living VILLAGER veterans — the score is
**4 vs 0**. The primary as defined missed because it conflated
scholar-veterans (which the control produces on its own) with
villager-veterans (which only presence produced). This is a metric-design
finding, not a re-score: the verdict stands as NO-GO.

The deeper finding: **presence manufactures killers; the window kills them.**
13 distinct villagers scored companion kills on the presence arm; 7 died
(Diana, Kjell, Chen, Nino, Ethan, Tom, Emma) and 4 survived as veterans.
Tom's run is the emblem: three wave-4 Strike kills and a wave-3 Spool —
then dead. This is the window-survival surface (sim-windowsurvive,
sim-vetrel1), not a presence failure. The named next is presence +
window-survival, not presence alone.

### Wall numbers (this run, 64 runs)

national 32/64, table 46/64, wins 0/64, wave-4 45/64, wave-5 1/64, median
survival 118/125d, max 182d. The scale wall stands (no wins). Wave-5 was
reached once (presence, 1/32) vs zero on control.

## Village assessment (plain words)

The modal presence village fights wave-3 monsters with company and buries
the company. The scholar's "stand with the village" beat fired 468 times
across 32 runs — every run had the scholar door-aligning when wave-3+
threats were at Haven. The result: 28 of 68 wave-3 killing fights had
companion damage (vs 1 of 69 on control), and 15 wave-3+ monsters were
killed BY companions (vs 0 on control).

Who thrived: Aroha (s63547) — killed a wave-4 Influencer alongside the
scholar and LIVED, the only villager on either arm to blood a wave-4
monster and survive the run. Nora (s63547-belong), Hassan (s63551-belong),
Marcelo (s63554) — each killed a wave-3 Spool and lived. Who died: Tom
(s63551-belong) — three wave-4 Strikes and a Spool, then dead in the
window; Diana, Kjell, Chen, Nino, Ethan, Emma — all killers, all dead.
What was missing before: a reason for the scholar to be on the same side
of the door as the villagers. What is missing now: a reason for the
killers to survive the window. The blank this run fills is the
measurement: presence-routing produces villager killers (4 living vs 0);
it does not produce them faster than the window kills them.

## Sense-testing (SENSE-TESTING LAW)

Read: evidence/2026-10-19/presence-confirm-transcripts/leadpresence-s63544.txt
(d67 GAVEL — Huda, Earl, Aisha, Ingrid join; d81 SPOOL — Maya, Theo, Aisha join).

The d67 Gavel fight: "⚔ GAVEL! Huda, Earl, Aisha, Ingrid join you!" Four
companions with distinct voices — Ingrid "squares up to watch. 'Give it
hell.'" (the witness), Earl fights in a rage and patches the player mid-
fight ("Hold still!"), Huda strikes steadily, Aisha's scream stuns the
Gavel. Aisha winces "You're bleeding!" when the verdict lands on the
player. The Gavel's trial mechanic (accusation, verdict, object/recess/
confess) plays out around them.

The d81 Spool fight: "⚔ SPOOL! Maya, Theo, Aisha join you!" Maya: "About
time someone fought back." The System itself reacts to the team —
"OHHHH, MULTIPLE THREATS! The audience is FERAL! ... A TEAM! A NAMED
TEAM!" The Spool's record/replay (REC 1/3 → LOADED: WAIT/WAIT/WAIT)
is legible mid-fight; Theo strikes hard (19/16/20), Maya harries, Aisha
stuns.

The sense-test CONFIRMS: door-aligned villagers join and read as PEOPLE —
distinct courage, distinct roles, reactions to the player's pain, and the
fiction matches the ledger. Nobody is a damage number.

## Metric review (§14 — binding, never re-scored)

1. **CONFIRM PRIMARY (+4 living veterans) MISSED: +1 (4 vs 3).** Not
   re-scored, not re-framed. The bar was written before the sweep; the miss
   is NO-GO per the pre-registered kill protocol. The layer is deleted.
2. **Metric-design finding (for the NEXT run, not this one):** the primary
   conflated scholar-veterans with villager-veterans. Control's 3 were all
   scholar-veterans; presence's 4 were all villager-veterans (4 vs 0 on the
   layer's actual target). The next presence-family run should pre-register
   living VILLAGER veterans (excluding the scholar vid) as the primary.
3. **Guardrails:** all PASS. Median survival +7d (bar −5d). No new death
   modes on category judgment — the 5 raw-new strings are instances, not
   modes: 'the expedition'='expedition' (string variant), 'The Anaconda
   Empress'/'White Noise'/'The Union Rep' are monster names (monster
   category, like control's 'Choir Toad'/'Highbeam Deer'), 'thirst'=
   'dehydration' (water category). ZERO fighter-movement deaths — the
   mechanism never assigns/moves/risks villagers (proof T3 + pilot A9), and
   no death cause implicates the beat. National/table not degraded (panel
   regression_watch, CIs cross 0).
4. **Starvation signal:** 16 vs 11 starvation deaths; panel npcHungry
   regression_signal on belongfeast (+0.25, CI not crossing 0). Not a
   pre-registered guardrail, but a real cost — the beat may pull the scholar
   from food work or the fighting raises consumption. Watch-item for any
   recombination.
5. **Beat over-triggering (pilot doubt #7):** 468 beats over 32 runs
   (~15/run, max unknown). No survival cost observed (median +7d), so no
   cooldown is mandated — but if a recombined run shows costs, the cooldown
   is the named next.
6. **Seeds.** 63541–63556, verified filename-unused in
   evidence/2026-10-19/perseed-*/ and scripts/ before the sweep. 64/64 runs,
   0 instrument errors, deterministic re-runs (probe reproduced sweep
   veterans exactly).
7. **Infrastructure:** no EPERM flap encountered during this run's git
   operations (the 5th incident cleared ~09:27Z per the brief; this run's
   writes 10:30–12:00Z were clean). The sweep's writeFileFlap hardening was
   not triggered. Heartbeats registered throughout.
8. **Contract cosmetic:** scripts/balance-metrics.json on master contains
   "First bearer <redacted> through day 30/60" — a pre-existing
   bearer-redaction artifact in the contract label (not caused by this run;
   metric IDs intact; panel verdicts unaffected). Noted, not fixed (contract
   changes are Steve's call).

## Kill protocol (executed)

Per the pre-registered protocol: `scripts/policies/presence.js` DELETED
zero-trace. Landing: the confirm instruments
(scripts/presence-confirm-sweep-20261019.js,
scripts/presence-confirm-analyze-20261019.js,
scripts/build-presence-confirm-panels.js,
scripts/presence-confirm-transcripts-20261019.js,
scripts/test-presence-confirm.js — T3 INFO-SKIPs with PRESENCE_KILLED=1,
T1/T2 still prove the metric definition and judge logic),
the panel artifacts, the per-seed JSONs (evidence/2026-10-19/
perseed-presence-confirm/), the transcripts, and this evidence file.
The one-off veteran-identity probe was deleted after its findings were
recorded above. Zero src/js changes; no game-code changes of any kind.

## Out-of-arm findings (not chased)

Filed to hidden_files/sim-findings.md by the coordinator as appropriate:
1. **Presence manufactures killers; the window kills them** (13 companion
   killers, 7 dead, 4 living veterans). The veteran-production problem is
   now a veteran-SURVIVAL problem — the window-survival surface
   (sim-windowsurvive/sim-winsupport) owns the next move.
2. **Starvation cost of presence** (16 vs 11; panel npcHungry
   regression_signal on belongfeast). Mechanism unknown — beat pulling the
   scholar from food work vs fight-driven consumption.
3. **Wave-5 reached once on presence** (1/32 vs 0/32) — first wave-5 reach
   on the pre-seat substrate in this family.
4. **Contract label redaction** ("First bearer <redacted>") — pre-existing
   on master; Steve's call whether to restore.

## Convergence

**NO-GO (kill protocol).** The 11th veteran-production attempt's mechanism
is proven (join rate 41.2% vs 1.4%, 15 companion kills vs 0, 4 living
villager veterans vs 0) but the pre-registered outcome bar (+4 total living
veterans) missed (+1) — the window kills killers faster than presence makes
them. The layer is deleted per protocol; the knowledge lands. The axis
stays scale-onramp: the named next is presence + window-survival
recombined (the winsupport-decomp sibling arm is decomposing the survival
half right now), with living VILLAGER veterans as the revised primary. No
game change: zero src/js; policy-side only.

## Files

- scripts/presence-confirm-sweep-20261019.js — confirm sweep (64 runs; INFO-SKIP if layer deleted)
- scripts/presence-confirm-analyze-20261019.js — confirm analyzer (judge predicates require-able)
- scripts/build-presence-confirm-panels.js — §15 panel compare (control→presence)
- scripts/presence-confirm-transcripts-20261019.js — sense-testing probe
- scripts/test-presence-confirm.js — proof (18/18 GREEN with layer; T1/T2 GREEN + T3 INFO-SKIP after kill)
- scripts/policies/presence.js — DELETED per kill protocol (was: PRESENCE=1 layer, landed 7de3bbede)
- evidence/2026-10-19/perseed-presence-confirm/ — 64 per-seed JSONs + _summary-{control,presence}.json + _analysis.json
- evidence/2026-10-19/presence-confirm-panel-primary-{before,after}.json.gz + presence-confirm-panel-primary.json + presence-confirm-panel-primary.md — the panel compare
- evidence/2026-10-19/presence-confirm-transcripts/ — leadpresence-s63544.txt (Gavel+Spool), belongpresence-s63546.txt
- evidence/2026-10-19/sim-presence-confirm.md — this file
- ZERO src/js changes; no game-code changes of any kind
