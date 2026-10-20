# sim-indispensable-road — the indispensable road (flesh-out loop, 2026-10-20, ARM sim-indispensable)

Run: fleshout-20261020T0215Z, arm sim-indispensable. Axis: scale-onramp (the blocking axis).
POLICY-SIDE — zero src/js changes. File scope:
scripts/policies/indispensable-diag.js (new, the gate-recorder layer — READ-ONLY instrument),
scripts/probe-indispensable-diag-20261020.js (new, the DIAG sweep),
scripts/test-indispensable-diag-20261020.js (new, proof),
scripts/analyze-indispensable-diag-20261020.js (new, rarity verdict + decision),
scripts/indispensable-transcripts-20261020.js (new, sense-testing sample),
evidence/2026-10-20/sim-indispensable-road.md + evidence/2026-10-20/perseed-indispensablediag/
(and, IF the road builds, scripts/policies/indispensable.js + its sweep/evidence).
READ-ONLY: scripts/policies/tablepathdriver.js, scripts/policies/relaydark.js, and ALL landed
20261020 tablepathdriver instruments — COMPOSED UPON, NEVER edited.

Canon: docs/CANON.md + docs/TABLE.md (indispensable: FULL seat only — "the galaxy must actually
need you"; earned by FULL seat + brokerage+might+foodShared high + foodShared > foodHoarded; the
table prices the run, never gates on godhood; light/dark earned through play). The full seat is
deedGateReady() (src/js/progression.js): waves 5/5/4/3/2 distinct fought, 3+ contests survived,
3+ crises, integration stage >= 2, food-thesis deeds (sentimentTaught + feastSurgeUsed).
The indispensable prereq (src/js/table-indispensable.js): seat full + foodShared > 0 +
brokerage+might+foodShared >= 10.

Named next this arm answers (sim-tablepathdriver named next #3, 2026-10-20): "The indispensable
road (different arm or accept-as-gated). The engine's why-string is a real gate: 'the galaxy
must actually need you.' The feast road never earns it. Either a substrate that manufactures
real inter-village need (full seat + dependence), or an honest documented acceptance that the
door is earned-rare by design."

Backlog checked before designing: WIN-PATH CONCENTRATION 30/30 FEARED (steve-call); ledger-dark
road (named next #2, belongs to another arm); BUILD THE WITNESS EXPOSURE SOURCE (decided,
landed). This arm is the named-next #3 answer only.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE any sims)

**Substrate** (the pilot's substrate, unchanged): withTablePathDriver(withSeatDrive(withWinDefer(
withRelayDark(TF base)))) on {leadfeast, belongfeast} tribfloor bases. SEATDRIVE=1 (seatdrive
drives the seat), TABLEPATHDRIVER=1 (door='feared', trial OFF — the substrate's default track;
pre-table the driver is a pure no-op, DET-pinned), RELAYDARK=1 (road active on relay-assigned
runs only — none here). Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 TABLEPATHDRIVER=1 RELAYDARK=1. No VETREL, no
REPOSITION.

**PRIMARY (the DIAG question, GO bar):** measure, on identical seeds, what earns the
indispensable why-string and how rare it is:
- per run: best seat ever ('none'<'lesser'<'full'), full gate components at best-seat day
  (live Game.deedGateReady(): w1..w5, contestsN, crisesN, stage, foodDeeds, ok; Game.tableSeat();
  live Game.tableEarnedPaths() indispensable entry {earned, strength, why}; ledger vector
  {brokerage, might, foodShared, foodHoarded}), whether the indispensable door was ever earned.
- verdict statistic: RARITY — # runs (of 16) ever earning a full seat; # ever earning the
  indispensable door; per-component rarity across seated runs (share with w5>=2, w4>=3,
  w1/w2>=5, w3>=4, contests>=3, crises>=3, stage>=2, foodDeeds, score>=10, foodShared>0).

**The binding decision rule (pre-registered):**
- If ≥1 run earns the indispensable door: the road is concrete. Build
  scripts/policies/indispensable.js (a policy-side road that manufactures the missing
  dependence components pre-table — foodShared/brokerage/crisis/contest seeking), then run
  the 8-seed pilot (seeds 64201–64208 × {leadfeast, belongfeast} × control/armed, 180d
  death-aware, identical seeds), then the §15 balanced panel. Road-pilot GO: indispensable
  earned on ≥2/8 armed runs with 0/8 control on matched seeds, guardrails green.
- If full seat is never earned AND the binding blocker is a component no policy can
  manufacture (wave-4/5 fights the engine never offers on this substrate — the scale-wall
  wave-5 window the confirm documented), the verdict is DIAG-GO: an honest documented
  acceptance that the door is earned-rare by design on the current substrate. No new
  layer; commit instruments + evidence only. A clean documented acceptance is a result.
- A policy road is buildable ONLY if the binding blocker is policy-playable state
  (brokerage/foodShared/crises/contests/stage). Wave bars require real wave-N fights the
  engine offers — if w5=0 on every run (no encounters in the world), policy cannot force
  the bar; the why-string stays gated and acceptance is the honest verdict.

**GUARDRAILS (all binding):**
- zero src/js changes (policy-side only); landed 20261020 instruments never edited
- no crashes, no softlocks; 0 engine errors on all 16 runs
- DET: diag-layers-ON twice byte-identical (the recorder draws no RNG, writes no game state)
- §15: only if a road is built (no treatment → no panel; the DIAG itself is the measurement)

**Horizon:** 180d death-aware (dead villages stop simulating — the same surface as the pilot).

**Seeds:** 64201–64208 × {leadfeast, belongfeast} = 16 runs (the pilot's seed set; reuse keeps
comparability with the pilot evidence). The DIAG has no control side (it measures engine-gate
rarity on the substrate, not a treatment effect); the road pilot, if built, adds the control.

**Instrument:** scripts/policies/indispensable-diag.js (INDISPDIAG=1; pure-read recorder —
no writes to game state, no RNG draws), scripts/probe-indispensable-diag-20261020.js
(sweep + SMOKE/DET modes), scripts/test-indispensable-diag-20261020.js (proof:
read-only-ness + gate-field correctness + SMOKE + DET), scripts/analyze-indispensable-diag-20261020.js
(rarity verdict + the binding decision), scripts/indispensable-transcripts-20261020.js
(seated-window SAY capture, one run, SENSE-TESTING LAW).

**Sense-testing (SENSE-TESTING LAW):** re-run one seated diag run with Game.say/sysSay wrapped,
capture the pre-table window (sitting-10d..sitting), read it whole: do villagers act like
people — goals, routines, dialogue, reactions — around the run's closest approach to the gate?

**No [needs-eyes]:** instruments + policy layer only, no player-facing change (unless a road
builds UI-adjacent behavior, which it will not — policy-side only).

---
*(results below — filled after the DIAG sweep; pre-registration above is unchanged)*

## Results

DIAG sweep complete 2026-10-20: 16/16 runs (seeds 64201–64208 × {leadfeast, belongfeast},
180d death-aware, zero engine errors, base current master at run time). Armed substrate only —
the DIAG measures engine-gate rarity, not a treatment effect. One host service restart
interrupted the sweep mid-run (/tmp wiped, the documented 2026-10-14 hazard); the probe's
resume logic (skip completed JSONs) recovered with zero re-burned seeds and zero lost runs
(13 completed + 3 resumed = 16/16).

**The verdict statistic (PRIMARY):**
- full-seat-ever: **0/16** — no run ever held the full seat (bestSeat: 14 lesser, 2 none).
- indispensable-door-ever: **0/16** — the door was never earned on any run.
- Proof T4 captured the engine's live why-string on real state: "The Indispensable needs a
  full seat — the galaxy must actually need you, not just notice you."

**Per-component rarity among the 14 seated runs (engine's own deedGateReady() breakdown
at best-seat moment):**

| component | met |
|---|---|
| w1≥5 distinct fought | 14/14 |
| w2≥5 distinct fought | 14/14 |
| w3≥4 distinct fought | 2/14 |
| **w4≥3 distinct fought** | **0/14** |
| **w5≥2 distinct fought** | **0/14** |
| contests≥3 survived | 14/14 |
| crises≥3 | 14/14 |
| stage≥2 | 14/14 |
| foodDeeds (sentimentTaught + feastSurgeUsed) | 14/14 |
| indispensable prereq score≥10 | 14/14 |
| indispensable prereq foodShared>0 | 4/14 |
| wave-5 unlocked in the world | 0/14 |
| standing≥200 (wave-5 unlock leg) | 6/14 |

**Binding-blocker failures among the 14 seated-but-not-full runs:** w4≥3 fails 14/14,
w5≥2 fails 14/14, w3≥4 fails 12/14. The world unlocked wave 4 on 6/14 runs (bestUnlockedWave
distribution: 3→8, 4→6, none→2) — but no run ever FOUGHT a wave-4 monster (w4=0 everywhere),
so "wave-4 faced" never held and wave 5 never unlocked on any run. Max standing 322 (one
run); standing is reachable, the fights are not the bottleneck — the ENGAGEMENTS are.

**The binding decision (pre-registered rule): ACCEPT-AS-GATED — DIAG-GO.**
The full seat never earned, and the binding blocker is wave-4/5 deed fights the engine never
put on the board in a fightable way on this substrate: wave 5 never unlocked in the world
(0/14 — its gate, standing≥200 AND wave-4 faced, is game-code; no policy can will encounters
into existence), and the w5≥2 bar needs two distinct 1000–2200 HP wave-5 kills against
monsters whose fights are 7–10 rounds for a godhood build. A policy that hunts wave-4
monsters could in principle fill w4≥3 on the 6/14 runs where wave 4 unlocked — but that is a
combat-bot experiment, not "a substrate that manufactures real inter-village need," and it
still leaves the wave-5 window standing (the playtest loop's documented domain — the
confirm's scale-wall report: "The wall is now the wave-5 window, not the national on-ramp").

**The DIAG's sharper finding — the gate is combat deeds, not need.** The indispensable's
own dependence components are NOT what's binding: brokerage+might+foodShared ≥ 10 was met
14/14 (scores 55–229); foodShared>0 was met 4/14. So on the rare run that DOES earn the
full seat, the next blocker is foodShared>0 (10/14 of seated runs never shared the food
truth — note: this run's village DID ship 1,683+1,683+1,584 kcal of grain to
Emberhold/Stonebridge/Thornfield ("not tribute, the other way around") — generosity moves
trust, but foodShared counts the food TRUTH, teaching the trick, per canon). The measured
gate is "fight 5/5/4/3/2 wave monsters blow-by-blow"; the need-flavor is a second, smaller,
policy-playable gate BEHIND it. The why-string says "the galaxy must actually need you" —
the engine measures that as wave deeds. Earned-rare by design, and honestly priced.

**Wall numbers (standing directive):** national 11/16, sat (lesser) 14/16, wins 12/16,
full 0/16, indispensable 0/16, median survival 90d, max 154d, endReasons village-lost 4 /
over-other 12. Wave 5 remains the wall; the full seat — and the indispensable door with
it — sits behind it.

**Guardrails:** zero src/js (policy-side only); no crashes/softlocks; 0 engine errors on all
16 (recorder errs=0 on every run); DET 2/2 green; T5 proved the recorder read-only
(INDISPDIAG=1 vs unset byte-identical trajectories); landed 20261020 instruments never
edited. §15 panel not run — no treatment, per the pre-registration (the DIAG itself is
the measurement).

## Village assessment

The village on this substrate is a machine for surviving to the lesser table: national on
11/16 runs, lesser seats day 42–153, wins 12/16. What it never does is go hunting for the
show's immune system. Wave-3 deed bars filled only 2/14; wave-4 monsters were fought zero
times across 16 runs even when the world unlocked wave 4. The village's fight posture is
defensive — hold the walls, answer the call, take the televised wave events when they
come — and the engine's full-seat gate asks for the offensive posture: go face the
Producers. The gap is not food or people; it's that nothing in the village's life gives it
a reason to seek wave-4/5 fights, and the fights at that tier are built for godhood
builds the feast road doesn't produce.

## Sense-testing (SENSE-TESTING LAW)

One seated window re-run and read in full: evidence/2026-10-20/indispensablediag-transcripts/
leadfeast-s64202.txt (FIDELITY-OK, 1564 SAY lines, days 63–75, best seat day 73).
The village reads as people, not bots:
- Hannah teaches papaya and brazil nuts to the village ("I know this one now. Look — see the
  leaves?"); "📚 Village knowledge: Hannah taught everyone about Papaya. The Codex grows
  without you lifting a finger." Tamika shows Ramon the Brazil Nuts — "remember it."
  Word gets around. Ines asks about strange leaves all week until Owen draws Fish Mint in
  the dirt — "It'll wash away. The knowledge won't."
- Keepsakes carry real memories: the Carpenter's square (first solo frame, checked and
  found true), the Lucky Coin (Hayato flipped it before every hard thing), Patricia's Ring
  (the winter the factory closed — "fix what you can reach"), the Trail compass (lost above
  the fog line, walked out). The village names its monsters: "Big Big", "The Ugly Beast" —
  "◈ The System files the name away with visible satisfaction. It has so few words for
  things that bleed."
- Inter-village life runs without the bearer: riders from Emberhold ("something's at THEIR
  door now. They can't spare anyone — and they wanted Haven to know first"), a trader
  arrives because "Haven has food, and where there's food there's trade", grain shipments
  out to three villages ("Someone's grandmother over there will remember who fed her.
  (Trust +8.)").
- The show lands on the village: "The village is rattled. Everyone's jumpy — eyes on the
  treeline." "You came back bloody. Nobody asks. Someone saves you the good seat by the
  fire." A feast where "the laughter stays low — somebody's seat is empty, and everybody
  sees it."
- A FEAST day-66 shows the food-thesis deed in its natural habitat: Hannah opens the
  pantry wide, FEAST SURGE ×3 armed — the run that earned the seat.

Relevant to the DIAG: the villagers ship food to other villages as generosity (trust +8),
but the engine's indispensable prereq counts the food TRUTH (foodShared — teaching the
trick), which the feast road never does (foodShared>0 only 4/14). The village is generous;
it is not yet a teacher. That is the policy-playable half of the dependence gate, sitting
behind the wave-5 wall.

## Metric review

(§14: every evidence file carries this. The verdict above is judged as pre-registered;
these are doubts for the NEXT run, not re-scores of this one.)

1. **The probe serializes bestGate/bestLedger/bestStanding/bestUnlockedWave but not
   best.indisp** (the live why-string at best-seat time) — `D.best.indisp` exists in the
   recorder but the probe's rec copies only gate/ledger/standing/unlockedWave. No
   information was lost: the prereq-level why-strings only fire when the seat IS full
   (never happened), and the seat-level why-string is engine-constant ("The Indispensable
   needs a full seat — the galaxy must actually need you, not just notice you." —
   captured live in T4 and verbatim on the pilot's seated run). Next DIAG that needs it:
   add `bestIndisp: D.best ? D.best.indisp : null` to the probe rec.
2. **The analyzer's `walked`/`sat` vocabulary** inherits the pilot's seat semantics;
   bestSeatDay is the first day the seat STATE held, not the sitting day — fine for a gate
   rarity DIAG, not for sitting-cadence questions.
3. **The road GO bar ("indispensable earned on ≥2/8 armed runs") was never reached** —
   correctly, since no road was built. If a future arm attempts the w4/w5-hunting policy,
   the bar should be two-legged: (a) w4≥3+w5≥2 bars filled, (b) the door earned —
   because filling the deed bars is the scale-wall question and the door is the
   indispensable question, and conflating them repeats the pilot's leg-3 confusion.
4. **foodShared>0 (4/14) is the named future road's dependence lever.** When the wave-5
   window opens (playtest loop's domain), a policy that teaches the food truth across
   villages (inter-village teaching, lever 8) is the concrete "manufactures real
   inter-village need" experiment — pre-register foodShared>0 as its primary metric.

## Named nexts

1. **The indispensable door is ACCEPTED AS GATED on current evidence** — DIAG-GO.
   Earned-rare by design: the engine's why-string is honest and the measured gate is the
   wave-4/5 deed bars. Revisit when the wave-5 window opens (playtest loop's domain).
2. **Future road (different arm, post-wave-5-window):** inter-village food-truth teaching
   (lever 8) → foodShared>0 as the dependence lever, with the w4/w5-hunting combat policy
   as a separate experiment. Pre-register per metric-review #3/#4.
3. **Probe hygiene (pilot's named next #5, still open):** fix the `walked` derivation and
   the done-before-invitation ordering before the next table-path sweep reuses that
   instrument. This arm's instrument has its own open item (metric review #1).

## Out-of-arm findings

(To be appended to
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`
by the coordinator; not chased mid-run.)

- **The indispensable gate's binding component is wave deeds, not need** (sim-indispensable
  DIAG, 2026-10-20): full seat 0/16, w4≥3 fails 14/14, w5≥2 fails 14/14, wave-5 unlocked
  0/14 in the world. The prereq score≥10 met 14/14; foodShared>0 met 4/14. The why-string
  ("the galaxy must actually need you") measures as combat deeds — earned-rare by design.
- **Inter-village grain shipments ≠ foodShared**: the village shipped ~5,000 kcal of grain
  to Emberhold/Stonebridge/Thornfield (trust +8 each) without moving foodShared (it counts
  teaching the food TRUTH, per TABLE.md). A future dependence road must teach, not feed.
- **Wave-4 unlocked but never fought (6/14 runs)**: the world offered wave 4; the policies
  never engaged (w4=0 everywhere). The w3≥4 bar filled only 2/14. The village's fight
  posture is defensive — the full seat asks for the offensive posture.
- **Host service restart mid-sweep** (again): the probe's resume logic recovered 13+3
  with zero lost runs. The pattern is proven; recommend it for all long sweeps.

## Convergence

The pilot's named next #3 is answered: the indispensable road is NOT buildable policy-side
on the current substrate, and the DIAG documents why in the engine's own numbers — full
seat 0/16, the wave-4/5 deed bars the binding blocker, wave-5 never unlocked in the world,
the dependence prereq a smaller policy-playable gate (foodShared>0, 4/14) sitting behind
the wave-5 wall. Verdict: DIAG-GO — a clean documented acceptance, which the task names
as a result, not a failure. The instrument (gate recorder + sweep + analyzer) is committed
and reusable for the post-wave-5-window revisit.

## Files

- scripts/policies/indispensable-diag.js — the gate-recorder layer (INDISPDIAG=1; pure reads, no RNG, no game-state writes)
- scripts/probe-indispensable-diag-20261020.js — the DIAG sweep (SMOKE/DET/sweep + resume)
- scripts/test-indispensable-diag-20261020.js — proof (guard/DET/smoke/snapGate-fields/read-only: 5/5)
- scripts/analyze-indispensable-diag-20261020.js — rarity verdict + binding decision
- scripts/indispensable-transcripts-20261020.js — seated-window SAY capture (sense-testing)
- evidence/2026-10-20/sim-indispensable-road.md — this file (pre-registration + results)
- evidence/2026-10-20/perseed-indispensablediag/{leadfeast,belongfeast}/s64201–s64208.json — 16 per-seed JSONs
- evidence/2026-10-20/indispensablediag-corpus-summary.json — the corpus summary
- evidence/2026-10-20/indispensablediag-transcripts/leadfeast-s64202.txt — sense-testing transcript (FIDELITY-OK)

## Telemetry deviation check (Steve 2026-10-13)

Not run as a treatment comparison (DIAG-only, no armed/control sides — pre-registered).
For the record, against the scale-wall baseline the regime pattern matches the sibling
arms: national 11/16 here (substrate's own level; pilot measured 12/16 armed, 12/16
control — consistent), wins 12/16. The baseline was NOT rolled.
