# sim-presencetend — presence + tend-only recombination (flesh-out loop, 2026-10-19)

Run: flesh-out loop arm sim-presencetend (loop oversight-flesh-out-loop), axis scale-onramp (the blocking axis).
Worktree: ~/workspace/worktrees/sim-presencetend.
Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law; wave-4 bands 35–95 dmg / 850–1500 HP; readiness bar design call #4; the def5 window is where this layer lives).
Layer: scripts/policies/presencetend.js (PRESTEND=1; policy-side only, zero src/js) — the presence join mechanism recombined with tend-only window support. Built from git history git show 7de3bbede:scripts/policies/presence.js as reference (NOT resurrected as-is — fresh layer).

## Why this arm exists (landed results that converge)

1. sim-presence (landed 7de3bbede): presence-routing join mechanism went 7.05x on join rate (45.5% vs 6.5%) — the MECHANISM is proven. Killed on confirm primary +1/32 vs +4 bar (evidence/2026-10-19/sim-presence-confirm.md).
2. sim-presence-confirm (landed 993d58d13/94cf9552d): NO-GO on living-veterans +4/32 (4 vs 3) — "the window kills killers faster than presence makes them"; its named next: "presence + window-survival recombined with living-villager-veterans primary". Its metric-review probe: the layer's actual target — living VILLAGER veterans — scored 4 vs 0 (control's 3 veterans were all scholar-veterans).
3. sim-winsupport-decomp (landed 549a640cd + finish a68416cee): the window-support concept as built is KILLED concept-dead (4/4 variants NO-GO on 160 runs; parked +15d did not replicate; window deaths rose on every armed arm; the triage EXTRACT travelTo flow is indicted, the posture rest verb is unhelpful). The one unindicted half is TEND (tending wounded companions at haven, no movement). Full evidence: evidence/2026-10-19/sim-winsupport-decomp.md.

This arm: (a) presence-routing of companions to fights WITHOUT movement cost (the piloted mechanism — presence.js's "stand with the village" beat: scholar self-movement only, never moves/assigns/risks villagers), recombined with (b) tend wounded companions AT HAVEN (cap 2/day) when the def5 window is live (wsWindowLive from scripts/policies/winsupport.js — NOT modified). NOTHING else: no travelTo extract, no rest verb, no fight recording.

## Design calls (documented — mine)

**Layer composition (mine):** PRESTEND=1 gates a wrapper `withPresencetend(base, id, desc)` that composes OUTSIDE the full seatdrive substrate stack — additive, never preempting (the winsupport pattern). daily: presenceBeat, then base.daily, then tendAtHaven (window-gated internally). upkeep: base.upkeep, then presenceBeat (mirrors the reference's daily+upkeep beat cadence). fight: pure base delegation (no fight half). Gate off: daily/upkeep/fight call the base exactly, ctx untouched — proof-pinned.

**Presence beat (mine):** fresh file, same proven predicate (NOT a copy of the deleted file): when a wave-3+ threat is at the Haven node (a wave-3+ world monster at the haven tile, or an aid crisis active) and the scholar is at Haven but OUTSIDE, the scholar goes INSIDE (enterBuilding; goInside fallback) and takes a step (microMove 4,6) — the step triggers ensureVillagerPositions so inside villagers get grid positions the join rule (Chebyshev 4) can see. Never calls Game.assignTask / Game.takeWeapon / any verb that moves or risks a villager (proof-pinned). Counts into ctx.presencetendGoInside / .presencetendStep.

**Tend beat (mine):** window-gated ONLY on wsWindowLive (imported read from scripts/policies/winsupport.js): def5 window live AND scholar at Haven AND one tend pass per day — wounded party companions (living, h<70 on the village health map — the verb's own wound floor from the killed winsupport.js) get the real Game.tendVillager verb (+25 wound heal, 32 ticks), cap 2/day. No travelTo extract, no rest verb, no fight recording, no triage flag. Counts into ctx.presencetendTends.

**Window read (mine):** reuse wsWindowLive from winsupport.js verbatim (import, not modification).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**Arms (2, paired on identical seeds):** control (substrate only) vs presencetend (PRESTEND=1).

**PRIMARY:** living-villager-veterans = DISTINCT living roster vids EXCLUDING the scholar vid (scholar counts; dead killers excluded) with a wave-3+ kill in state.waveKillLog, armed vs re-swept control (pooled: 16 seeds × {leadfeast, belongfeast} = 32 runs/arm). The revised definition per the presence-confirm metric-review probe: control's veterans were all scholar-veterans; the layer's actual target is villager veterans (was 4 vs 0). Pinned on the same engine read as the VETERANS bar (scripts/test-presencetend-20261019.js T1); implementation: countLivingVillagerVeterans(Game) in scripts/presencetend-analyze-20261019.js.

**GO:** living-villager-veterans +4/32 armed vs control (the presence-confirm bar on the revised primary).

**GUARDRAILS:**
- table ≥ control − 2
- no new death modes (REVISED per the decomp metric review: a new cause counts only at ≥2 events; named-monster-lottery causes exempt — monster display names from src/data/monsters.json)
- survival floor: armed median ≥ control median − 10d
- national not degraded (armed ≥ control)
- wave-4 not degraded (armed ≥ control)

**Horizon:** 180d death-aware (dead villages stop simulating; runDays handles).

**Seeds:** 16 FRESH 65201–65216 (verified zero SEED-name hits in evidence/2026-10-19/perseed-*/ and scripts/ at 2026-10-19 ~11:20Z — an evidence-wide grep for the 6520X family hit ONLY pantry kcal values (e.g. pantryFreshAfter: 65204) in 2026-10-16 census files: false positives, not seeds). IDENTICAL seeds on both arms.

**Substrate:** withSeatDrive(withWinDefer(withVetrel(withReposition(TF base)))) on {leadfeast, belongfeast}, SEATDRIVE=0, env FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 VETREL=1, PRESTEND=1 on the armed arm only, KILLDISC=1 (mechanism-continuity instrument).

**PILOT GATE:** 8 seeds (65201–65208) before/after before ANY confirm spend. Pilot primary bar: +1/8 (the +4/32 bar scaled). Kill fast on a clear miss — a lever killed cleanly in 20m beats a 90m maybe.

**§15:** before/after through scripts/balance-panel.js (the panel is the instrument, the pre-registered threshold is the judge); attach the compare .md to the evidence file.

**LANDING:** GO → land as its own commit (layer + proof + instruments + evidence). NO-GO → KILL PROTOCOL: delete scripts/policies/presencetend.js zero-trace, land instruments + evidence only (proof stays green via the PRESTEND_KILLED=1 INFO-SKIP).

## Metric review (§14 — binding, never re-scored)

1. **The no-new-death-modes guardrail is frequency-qualified** (the decomp metric-review revision, applied to THIS run per that note): a new cause counts only at ≥2 events; named-monster-lottery causes (monster display names) are exempt.
2. **Primary revised to living VILLAGER veterans** (the presence-confirm metric-review #2, applied to THIS run): the scholar vid is excluded; control produces scholar-veterans on its own. This is the layer's actual target.
3. **Median survival may under-read a window lever** (parked doubt #1, carried): if the layer converts window deaths into later non-window deaths, the taxonomy per arm is the secondary read — the GO bar stays living-villager-veterans.
4. **The +4/32 bar vs the window kill-rate** (new): the presence arm made 4 living villager veterans while the window killed 7 killers on 32 runs. The bar asks the recombination to net +4 more living villagers than the control — presence + tend must both make killers AND keep them alive.
5. **Beat over-triggering (pilot doubt #7, carried):** the presence beat fired up to ~15/run on the confirm. No survival cost was observed there; the tend half adds a second daily action. If costs appear, a cooldown is the named next — not a re-score.
6. **Seeds:** 65201–65216; verified fresh as above. 64 runs planned (32+32); 0 instrument errors expected.
7. **Contract cosmetic:** scripts/balance-metrics.json on master contains "First bearer <redacted> through day 30/60" — a pre-existing bearer-redaction artifact in the contract label (noted in the presence-confirm evidence; not caused by this run; panel verdicts unaffected). Contract changes are Steve's call.

[SWEEP RESULTS — appended after the sweep]

## Results — PILOT (8 seeds × 2 policies = 16 runs/arm, seeds 65201–65208)

**PILOT VERDICT: NO-GO (kill protocol executed). The layer is deleted.**

32 runs (16+16), 0 instrument errors, anchor a68416cee (current master at pilot).

| metric | control | presencetend | bar |
|---|---|---|---|
| **PRIMARY: living-villager-veterans** | **7** | **5** | **≥ +1/8 → NO-GO (delta −2)** |
| engine veterans (incl scholar, info) | — | — | — |
| vets5 (living wave-4+ killers) | — | — | — |
| goInside beats (presence half) | 0 | 160 | mechanism fires |
| tend verb calls (tend half) | 0 | 20 | mechanism fires |
| w3 companion kills | 15 | 13 | — |
| median survival (gameDays) | 117 | 105 | ≥ control−10d → **FAIL** (−12d) |
| table | 13/16 | 12/16 | ≥ control−2 → PASS |
| national | 5/16 | 8/16 | not degraded → PASS |
| wave-4 | 14/16 | 13/16 | not degraded → **FAIL** |
| wave-5 | 0/16 | 0/16 | — |
| wins | 0/16 | 0/16 | — |
| new death modes (revised rule) | — | **lockjaw ×2** | → **FAIL** |
| starvation deaths | 8 | 0 | (reported) |

The primary MISSED (−2 vs the +1/8 pilot bar) and three guardrails FAILED
(survival floor, new-death-mode, wave-4). Per the pre-registered pilot gate
("kill fast on a clear miss"), the verdict is NO-GO and
`scripts/policies/presencetend.js` is DELETED zero-trace. Instruments +
evidence land; the proof test stays green via the PRESTEND_KILLED=1
INFO-SKIP (17/17 post-kill).

### What the pilot actually showed

1. **The substrate saturates the primary.** Control made 7 living-villager
   veterans on 16 runs WITHOUT the layer — the w5path substrate's VETREL=1
   companion-veteran channel produces villager killers on its own (15
   companion wave-3+ kills on control). The paired-seed check is decisive:
   s65202-belong produced the SAME villager veteran (gen_x22yq4v) on BOTH
   arms. The presence mechanism was proven on the pre-seat substrate
   (pilot/confirm); on the VETREL substrate its marginal join value is nil —
   control's companions already fight (see the control transcript: Jun-woo
   joins vs the Congregation with no presence beat).
2. **Both halves engaged.** 160 presence beats and 20 tend calls on the
   armed arm — this is not an invisible-effect kill. The layer ran and
   changed nothing that matters: w3 companion kills 13 vs 15, vvets 5 vs 7.
3. **lockjaw ×2 on armed, ×0 on control** qualifies as a new death mode
   under the revised rule (≥2 events, non-monster-name). At n=16 this is
   likely disease-pool noise, but the pre-registered rule binds.
4. **Starvation did NOT replicate** the presence-confirm signal: 0 vs 8
   (control higher). The npcHungry regression_signal from the confirm run
   was substrate- or policy-specific, not a presence property.

### Wall numbers (pilot, 32 runs)

national 13/32, table 25/32, wins 0/32, wave-4 27/32, wave-5 0/32, median
survival 117/105d, max 182d. The scale wall stands (no wins on either arm).

## Village assessment (plain words)

The pilot villages look like every other window village on this substrate:
they push toward wave-4 on blood (standing earned the hard way), reach
national on ~40% of runs, and die in the window — village-lost ends on 30/32
runs. The presence+tend villages are indistinguishable from the controls in
the ways that matter: same feast rhythm, same wave-3 fights with companions
in the line, same raid deaths.

Who thrived: gen_x22yq4v (s65202-belong, BOTH arms) — killed a wave-3 Spool
and a wave-4 Congregation and lived; tom_baker (armed s65205-belong) — 4
companion wave-3 kills, lived; marcus_webb (armed s65207-lead) — the one
armed vvet on a run where the tend beat fired 3 times on Ivy. Who died:
everyone else who bloodied a wave-3 monster — the window took them in
raids and expeditions, tend or no tend. What was missing before this run: a
measurement of whether tend keeps killers alive. What the run showed: the
substrate's VETREL channel already makes killers (7/16 on control), and
tending them at the fire doesn't move their survival — the 5 armed vvets
died or lived on the same terms as the 7 control vvets. The blank this run
fills is the recombination verdict: presence + tend is a dead avenue on
this substrate — not because the halves are broken (both engaged: 160
beats, 20 tends), but because the substrate already does the job.

## Sense-testing (SENSE-TESTING LAW)

Read 4 staged transcripts (2 armed + 2 control, staged BEFORE the tree is
released — the decomp run's probe was lost uncommitted; this one is
committed in scripts/presencetend-transcripts-20261019.js):

**Joined companion fights (presence half) — armed s65202-lead, d55 THE FOCUS
GROUP.** The feast draws the scavenger; Boris, Jun-woo, Manaia, Ava, Marco
all fight beside the scholar. The fiction is coherent throughout:
"Boris's blow carries the feast", mouth-heads pop like soap bubbles as the
murmur weakens, the System reacts to the team. The companions read as
PEOPLE — distinct turns, the murmur rating their strikes, the fight
legible. SENSE-TESTING CONFIRMS the mechanism still reads as people
fighting together. (Note: the combat intro says "You're on your own."
while companions then join — a pre-existing intro-text quirk, not layer
pathology.)

**Tend firing (tend half) — armed s65207-lead, d62/d66/d67.** "You clean
Ivy's wound properly -- boiled water, a steady hand, wrapped tight. It'll
have a chance now." The tend beat fires at the fire after the day's work
and before sleep — sensible placement, sensible text, the wounded
companion is Ivy (tended 3 times). Nothing senseless.

**Control comparison — s65202-belong, d71 THE CONGREGATION.** Jun-woo joins
vs the Congregation with NO presence beat and NO tend layer: "Jun-woo
freezes. 'What IS that?'" then fights (41 damage, "the party sees the
opening and piles on"). This is the substrate saturation in narrative form:
companions join and read as people on control too. The armed half's
marginal fiction value is zero on this substrate — the sense-test
corroborates the NO-GO, it doesn't just count it.

## Named nexts

1. **The presence + tend recombination is KILLED (pilot NO-GO).** Do not
   revive: the substrate's VETREL=1 channel already produces villager
   veterans (7/16 control), and both halves engaged without moving the
   outcome.
2. **The veteran-production problem is now a veteran-SURVIVAL problem on
   the w5path substrate** (carried from the presence-confirm metric review):
   control makes killers; the window takes them. The tend half was the
   window-survival answer and it did nothing — the window deaths are raids
   and expeditions, not wounds-at-haven. The next window arm must stop
   window deaths, not heal them after.
3. **lockjaw ×2 on the armed arm** is filed as noise pending replication —
   the revised guardrail fired on it per protocol, but 2 disease-pool
   events at n=16 is not a layer pathology signal.
4. **The "You're on your own." combat-intro quirk** (companions then join)
   is out-of-arm but worth a look by the combat-UI lane.

## Metric review (§14 — binding, never re-scored)

1. **PILOT PRIMARY (+1/8) MISSED: −2 (5 vs 7).** Not re-scored. The bar
   was written before the sweep; the miss is NO-GO per the pre-registered
   pilot gate. The layer is deleted.
2. **Substrate saturation (new):** the revised primary (living-villager-
   veterans) is produced by the substrate itself on VETREL=1 (7/16
   control). On the pre-seat substrate the same metric was 0/32 on
   control. Any future presence-family arm on this substrate must expect a
   high-control baseline and size its bar accordingly — or test on the
   pre-seat substrate where the mechanism's marginal value was proven.
3. **Guardrails:** survival floor FAIL (105 vs 117, floor 107); new-death-
   mode FAIL (lockjaw ×2 qualifies under the revised ≥2-event rule);
   wave-4 FAIL (13 vs 14, one short of "not degraded"); table PASS
   (12 ≥ 11); national PASS (8 ≥ 5). Starvation 0 vs 8 — the
   presence-confirm npcHungry signal did not replicate.
4. **Pilot killed the confirm spend:** the pilot gate did its job — the
   clear miss was visible at 16 runs/arm, saving ~30 min of confirm compute.
5. **Seeds:** 65201–65208 pilot; 65209–65216 unused. Fresh as verified in
   the pre-registration header.
6. **Contract cosmetic:** unchanged (the "First bearer <redacted>" label
   artifact, pre-existing, Steve's call).

## Convergence

**NO-GO (killed at pilot).** The presence+tend recombination is dead on
measured evidence: the mechanism engaged (160 presence beats, 20 tend
calls) but the substrate's VETREL channel already makes villager veterans
(7/16 on control), so the marginal outcome is nil and three guardrails
failed. The axis stays scale-onramp: the window-survival surface (raids,
scholars dying rich-not-starving) is still the target, but tend-at-haven
is not the answer — the window deaths are violent, not wound-shaped. No
game change: zero src/js; policy-side only; the layer deleted zero-trace.

## Files

- ~~scripts/policies/presencetend.js~~ — the layer (PRESTEND=1; DELETED per kill protocol — pilot NO-GO; never committed)
- scripts/test-presencetend-20261019.js — proof (42/42 GREEN with layer; 17/17 GREEN post-kill via PRESTEND_KILLED=1 INFO-SKIP; T1/T2 + KILLED-VERDICT still run)
- scripts/presencetend-sweep-20261019.js — 2-arm sweep (control vs presencetend, 16 seeds × 2 policies; pilot ran seeds 65201–65208)
- scripts/presencetend-analyze-20261019.js — analyzer with require-able judge predicates (countLivingVillagerVeterans, judgePrimary/judgeSurvival/judgeReach/newDeathModes with the revised ≥2-event + monster-name-exempt rule)
- scripts/presencetend-transcripts-20261019.js — SAY-line probe for sense-testing (COMMITTED this run — the decomp probe's loss is not repeated)
- scripts/build-presencetend-panels.js — §15 balanced-panel compare builder (not run — no confirm corpus)
- evidence/2026-10-19/perseed-presencetend/ — 32 per-seed JSONs (pilot: control-{leadfeast,belongfeast}-s65201–s65208, presencetend-{leadpresencetend,belongpresencetend}-s65201–s65208) + _summary-{control,presencetend}.json
- evidence/2026-10-19/presencetend-transcripts/ — 4 staged SAY transcripts (2 armed: presencetend-leadpresencetend-s65202/s65207; 2 control: control-belongfeast-s65202/s65208)
- evidence/2026-10-19/sim-presencetend.md — this file
- ZERO src/js changes; no game-code changes of any kind
