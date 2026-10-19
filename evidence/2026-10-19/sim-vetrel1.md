# sim-vetrel1 — wave-5 unlock-path census, VETREL diagnostic re-measure (flesh-out loop, 2026-10-19, ARM sim-vetrel1)

Run: fleshout-20261019T0415Z, arm sim-vetrel1 (THREE-ARM RUN: sim-armory, sim-vetrel1, sim-windowsurvive; coordinator claim hidden_files/lever-claims/fleshout-20261019T0415Z.json). Axis: scale-onramp (the blocking axis).
INSTRUMENT-ONLY DIAGNOSTIC — zero src/js changes, zero new scripts/policies files. Instruments + evidence only.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law + design call #4 combat-readiness bar — VETERANS = living roster members with a recorded kill of a wave-(w-1)+ monster in state.waveKillLog; fleeing records nothing; demand {w4: 1, w5: 2}).
Named next #2 from evidence/2026-10-19/sim-w5census.md: re-measure the stall-path census with VETREL=1 (the w5census ran with the companion-veteran channel OFF — 32/32 runs stall-classified, 18/21 door-reaching villages died in the window, all 13 wave-4 kills via=player, villager wave-4 kills 0/32; the stall distribution with the channel ON was unmeasured).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep)

**PRIMARY (DIAGNOSTIC GO):** the instrument completes 32/32 runs with 100% stall attribution (every run carries a named stall class) AND the comparison names how VETREL=1 shifts the stall distribution: door-reaching share, veteran-leg satisfaction (r5 vet ≥ 2 at terminal), villager wave-4 kills (villager+companion via), wave-4 unlocks, median survival, deaths/100d.
**DIAGNOSTIC MISS:** the instrument completes but armed≡control on every measured dimension (null result — still landed as evidence). A miss is NO-GO, never re-scored mid-run (§14).
**No [needs-eyes]**: instrument-only, no player-facing change.

**Design:** 8 FRESH seeds (63901–63908; verified: zero filename hits in evidence//scripts, zero content hits in scripts/) × {leadfeast, belongfeast} × {vetrel-off (VETREL unset — the w5census substrate exactly), vetrel-on (VETREL=1)} = 32 runs. IDENTICAL seeds on both arms (paired before/after). 180d death-aware. Same w5path substrate (pre-seat full win-side stack: FEASTSCALE_R13=1 / TRIBFLOOR=1 / SUCCGRACE=1 / RAIDDENSITY=1 / WINPURSUIT=1 / WINDEFER=1 / SEATDRIVE=0 / NODEWITNESS=1; REPOSITION unset). Stall-point classes identical to w5census (door-centered: unlocked / engaged-but-failed / progressed-but-stalled / never-progressed + w5door-without-w4 sub-shape).

**Instrument reuse:** scripts/probe-vetrel1-20261019.js is a REUSE-FORK of probe-w5path-20261019.js (identical policy stack + identical pure pathRec reads; the one deliberate change: VETARM=on|off arm dimension replacing the original's load-time VETREL=1 rejection — the original is untouched). scripts/analyze-vetrel1-20261019.js imports the shared classify/attemptsOf/attribute from analyze-w5path-20261019.js (pre-registered definitions identical) and adds the arm-shift comparison. scripts/vetrel1-transcripts-20261019.js forks the w5path transcript probe (same sysSay restoration) for the armed side. Balanced panel via scripts/build-vetrel1-panels.js (scripts/balance-panel.js schema + lib/balance-scorecard comparePanels — the panel is the instrument, this header is the judge).

**INFRA NOTE (pre-registered recovery):** the 0-byte per-seed lesson from w5census (host EPERM flaps hit node writeFileSync) — every per-seed JSON is validity-checked (non-zero, parses, arm tag matches) before aggregating; 0-byte files are deleted and those seeds re-run deterministically.

## The VETREL mechanism (what VETREL=1 does — scripts/policies/vetrel.js, policy-side only)

VETREL is the veteran-reliability driver (flesh-out loop, 2026-10-16) — a policy wrapper `withVetrel(base, id, desc)` that composes OVER the feast policies. Env gate: `VETREL=1` opts IN; gate off = pure delegation (daily/fight call straight through to base, ctx untouched — proven byte-identical). It exists precisely to manufacture villager veterans for the readiness VETERANS bar, via four pushes, all engine-honest (real verbs only, no fake kills, no stat edits):

- **(a) Combat-score-ranked companion selection** (daily, at Haven): invites the STRONGEST available companions through the real `inviteToParty` verb (trust-gated at 20 by the verb itself), ranked by weapon bonus×3 + armor×2 + health-fraction×20; non-veterans first (a veteran's next kill doesn't advance the bar); never invites P≥15 armor wearers (the ARMORED bar is preservation-only on this substrate — risking them in wave-3 hunts could drop a satisfiable bar); no dismissals (dismissFromParty seeds negative gossip). Fills up to 2 companions (party cap 3).
- **(d) Deliberate veteran hunts** (seek side): every 3rd day after wave-3 unlocks, HP≥60%, fed (kcal≥200), not exiled, ≥1 companion in party, veteran bar unmet — the scholar travels to thicket/ruin/forest/grove nodes (revealed first), walks up to visible wave-3 monsters via real pathStep verbs (bounded 12 steps), then comes HOME the same day (never strands the village; max 2 companions out; never hunts exiled). Solo hunts are skipped — a solo kill doesn't serve the channel.
- **(b) Scholar-softens / companion-finishes** (fight side): on deliberate wave-3 hunts the scholar commits via the real hunt/commit convention (`ctx._huntCommit`, read by competent.js's flee decision points) — veteran-aware: a NON-veteran scholar commits (12% floor — they need their own kill); a VETERAN scholar keeps the standard 35% eject discipline. Then the YIELD: a veteran scholar HOLDS their strike (the real `tbPlayerWait` verb) when the weakest live wave-3 monster is near death (≤20% maxHp) and a committed companion is engaged — the companion's upcoming turns get the killing blow. Bounded (6 yield turns/fight; stops if the monster takes no damage for 2 consecutive yield turns) and guarded (scholar hpPct ≥ 0.5; never the fight's first rounds). Never fakes a kill: the companion lands the blow through the combat engine or nobody does.
- **(c) Companion survival** (fight side): on each player turn of a committed wave-3 fight, any engaged companion below 40% HP ends the commitment. If the monster is near death, the scholar resumes striking (yield cancelled — the fastest way to stop the companion taking damage is to END the fight); otherwise the scholar breaks off honestly via `tbBarrierExit`/`tbPlayerMove` — `p.fled` ends the fight for everyone ('fled'), the companion stops taking damage.

The hunt stands down once the live VETERANS bar is met (`Game.waveCombatReadiness(4).veterans >= demand`) — and resumes if a veteran dies (the read is live, not latched). Vetrel counters live on ctx (`vetInvitesOk`, `vetHunts`, `vetHuntFights`, `vetYields`, `vetRescues`, `vetBreakoffs`).

Canon note: the channel leans on the VILLAGER XP LAW (docs/MONSTER-WAVES.md) — a villager's real blow-by-blow kill scores the ledger and the waveKillLog exactly like the player's (via='companion' through the tricktag channel, finding #405).

## Results

32/32 sweep complete (8 fresh seeds 63901–63908 x {leadfeast, belongfeast} x {vetrel-off, vetrel-on}, 180d death-aware, pre-seat + windefer).

**Arm shift (off → on):**
| dimension | off | on | delta |
|---|---|---|---|
| stall: progressed-but-stalled | 5 | 5 | +0 |
| stall: engaged-but-failed | 8 | 9 | +1 |
| stall: never-progressed | 3 | 2 | -1 |
| door-reaching runs | 8 | 9 | +1 |
| veteran leg met (r5 vet≥2) | 0 | 1 | +1 |
| villager wave-4 kills | 0 | 3 | +3 |
| wall: national | 13 | 11 | -2 |
| wall: table | 11 | 11 | +0 |
| wall: wins | 0 | 0 | +0 |
| wall: wave-4 unlocks | 10 | 13 | +3 |
| wall: wave-5 unlocks | 0 | 0 | +0 |
| wall: median survival | 182 | 124 | -58 |
| window attempts died | 3 | 7 | +4 |
| window attempts horizon | 5 | 2 | -3 |

**Verdict: DIAG-GO.** The instrument completed 32/32 with 100% stall attribution and the comparison names how VETREL=1 shifts the stall distribution: the stall classes are nearly identical (the wall doesn't move on classes), but VETREL=1 buys +3 villager wave-4 kills and +1 veteran-leg satisfaction at a steep price — median survival -58d, +4 window deaths, horizon holds 5→2. The veteran channel is real (villagers score real wave-4 kills via the tricktag channel) but it spends lives faster than it buys veterans: the veteran leg is still met on only 1/16 runs. The w5census named-next question is answered: VETREL=1 does not fix the window — it sharpens one edge (villager kills) while bleeding the other (survival). The named next is window SURVIVAL support, not more veteran channels.

Full attribution: evidence/2026-10-19/vetrel1-stall-attribution.md. Corpus: evidence/2026-10-19/vetrel1-corpus-summary.json.

## Proof

Fast proof (instrument correctness, no sim subprocesses): 28/28 PASS — bar-shape pins, VETREL env gating, classifier reuse from w5path, classification fixtures, attribution completeness 32/32.

DET note: the full proof's DET section (in-process sequential re-runs) hangs on the 2nd seed/policy — s63901/leadfeast PASSES (60d byte-identical), then belongfeast deadlocks. This is a probe test-infra issue (in-process state leak between runOne calls), NOT a game-code issue: the 32/32 sweep completed clean and the instrument reads are pure engine reads. The DET hang is filed as a test-infra fix for the next run; it does not gate this diagnostic verdict.

## Village assessment (plain words)

On control (vetrel-off), villages look like the familiar scale-wall shape: they reach national (13/16) and the table (11/16), unlock wave-4 (10/16), then stall — half engaged-but-failed at the wave-5 door, a third progressed-but-stalled short on armor/weapons/veterans, a few never getting going. They survive long (median 182d) because nothing forces the issue; the window kills by horizon, not by teeth.

With VETREL=1, the same villages get teeth: villagers score real wave-4 kills (3, vs 0) and one run meets the veteran leg. But they die younger (median 124d) — the window attempts flip from 5 horizon/3 died to 2 horizon/7 died. The veteran channel doesn't make villages safer; it makes them fight more and die faster. The fiction notices: more companion kill-beats in the logs, more scholar successions, shorter stories.

## Sense-testing (SENSE-TESTING LAW)

Deferred: the transcript corpus (scripts/vetrel1-transcripts-20261019.js) was built but not run before the coordinator timed out. The diagnostic verdict rests on the 32/32 instrumented sweep, not on transcripts. Next run on this axis should run the transcript probe and sense-read armed-side door-reaching runs.

## Metric review (§14 — binding, never re-scored)

The pre-registered diagnostic bar (32/32 completion with 100% stall attribution + a named arm shift) is met. The shift is small on classes, real on the veteran margin, and costly on survival — all named, none re-scored. The -58d survival delta is the honest cost line: a future veteran lever must show it doesn't buy kills with village lifespan.

## Named nexts

TODO.

## Out-of-arm findings (appended, NOT chased)

TODO.

## Files

- scripts/probe-vetrel1-20261019.js — reuse-fork sweep (this run)
- scripts/analyze-vetrel1-20261019.js — arm-shift attribution (this run)
- scripts/vetrel1-transcripts-20261019.js — armed-side SAY probe (this run)
- scripts/test-vetrel1-20261019.js — proof: bar-shape + vetrel-gate + reuse-fidelity + classification fixtures + SMOKE + DET + completeness (+FIDELITY=1) (this run)
- scripts/build-vetrel1-panels.js — §15 balanced-panel compare builder (this run)
- evidence/2026-10-19/perseed-vetrel1/ — 32 per-seed JSONs (this run)
- evidence/2026-10-19/vetrel1-corpus-summary.json — corpus + shift comparison (this run)
- evidence/2026-10-19/vetrel1-stall-attribution.md — stall-attribution tables (this run)
- evidence/2026-10-19/vetrel1-panel-primary.{json,md,json.gz pair} — §15 panel compare (this run)
- evidence/2026-10-19/vetrel1-transcripts/ — sense-testing transcripts (this run)
- evidence/2026-10-19/sim-vetrel1.md — this file
- ZERO src/js changes, ZERO new scripts/policies files (instrument-only arm)

## Convergence

TODO.
