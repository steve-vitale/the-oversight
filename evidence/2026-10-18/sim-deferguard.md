# sim-deferguard — veteran expedition guard (2026-10-18)

Run: flesh-out loop arm sim-deferguard (run_id sim-deferguard pilot), axis scale-onramp (the blocking axis).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (read first; design call #4 — the four readiness bars; VETERANS = living roster with wave-3+ kills). POLICY-SIDE ONLY — zero src/js changes. Composes outside vetrel (read-only, never modified).

LINEAGE: defercensus2b's named next — "veteran SURVIVAL through the release window." The census: veterans in the binding set on 98.5-100% of deferral days (old bar). Four levers died at the wave-4 gate on the veteran line: vetdemand, armorbreak's mortality finding (34/47 armored died in the draft they unlocked — 72%), vetsurvive (KILLED-AT-PILOT: shelter-muster fired on 4/15 runs, unlocks +1 vs +3 bar — "keep them alive presumes they exist"), compvet (KILLED-AT-PILOT: doctrine engaged but didn't convert; report-only signal vetDeaths armed 5 vs control 15 — protection works, manufacturing doesn't). The bar has since been recalibrated (readinessfix, landed b4906574d): w4 {3@P10,5,3,1}, w5 {4@P15,6,3,2} — veterans 1 for w4 (median village already sits at 1), 2 for w5. Field-death channels per fieldfightsrc: FIELD-EXPOSURE-DOMINANT — expeditions 68.9%, raids 28.4%, wild 2.7% of post-invite monster-verb deaths.

## The lever

`scripts/policies/deferguard.js` (DEFERGUARD=1, default OFF), composed as withDeferguard(withVetrel(withReposition(TF.leadfeast/belongfeast))). Guard-classified like SEATDRIVE=1: zero game-code changes by default.

While `Game.standingDeferral(4).deferred` is true (Standing door open, readiness alone holding, peak<4), qualifying veterans (living, roster, not the scholar, wave-3+ kill in `state.waveKillLog` — waveCombatReadiness's own VETERANS reading via vetrel's isVeteran marker, read-only) are held out of the scholar's EXPEDITION party — the 68.9% channel — and kept on haven duty/patrol (the 2.7% wild residual):

(a) INVITE GUARD — Game.inviteToParty wrapped during the layer's daily/upkeep (the feastscale trackTribute pattern, restored in finally); invites to qualifying veterans return a deferguard refusal. The scholar doesn't ask: no trust hit, no gossip. vetrel's companionProtocol reads the refusal and moves on.
(b) STAND-DOWN — veterans already in the party when the window opens are dismissed via the real dismissFromParty verb: real trust -8, 35% dismissal gossip, said aloud with the reason. One layer, one mechanism: proven fighters hold Haven; expeditions run without them.

Design calls (mine — Steve corrects what needs it):
1. NOT vetsurvive: no shelter. Sheltering strips duties and eats with no work (vetsurvive's honest cost); deferguard keeps veterans productive at home. Different verb, different scope (all expedition travel, not just vetrel hunts; no fire requirement).
2. The reactive haven-raid defense draft (28.4%) is engine roster-wide (havenGrowth.js: healthy villagers at home, sheltered only excluded). The only policy-side exclusion is the shelter verb = vetsurvive's dead mechanism, so the raid draft is NOT touched — documented blank, not a hook I don't have.
3. Lingerer sorties are never sent in sims (no sim policy answers the lingerer beat; only app.js calls answerLingerer), so no sortie discipline is built.
4. The scholar is never a qualifying veteran (the scholar is the player; the guard doesn't leash the player).
5. The dismiss cost (-8 trust, gossip) is the lever's honest price, said aloud. Post-window re-invites may refuse — real social consequence.

## Substrate (pilot and confirm)

defercensus2b (b) readiness, exact composition + env:
- policy: withDeferguard(withVetrel(withReposition(TF.leadfeast / TF.belongfeast)))
- env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 SEATDRIVE=0 VETREL=1 REPOSITION=1 NODEWITNESS=1; WINPURSUIT=1 WINDEFER=1 set in-process (wrappers not composed — inert, matches the 2b corpus composition exactly)
- armed: + DEFERGUARD=1. control: DEFERGUARD unset. The vetrel pipeline runs identically on both arms.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — BINDING, written BEFORE the sweep)

**ENGAGEMENT GATE (binding, STEP 1):** the layer must fire (≥1 veteran held off a field channel: dgDismissals≥1 OR dgInviteBlocks≥1 during the window) in ≥ 4/16 armed runs. Miss → KILL at pilot — delete scripts/policies/deferguard.js zero-trace, land instruments + evidence. Do NOT spend confirm seeds on a lever that never fires.

**PRIMARY (binding, STEP 2 confirm — pending coordinator relay):** wave-4 unlocks (maxWave ≥ 4), armed − control, GO ≥ +3/16.

**Guardrails:** median survival armed ≥ control −10d (per policy pair); national armed ≥ control −2; starvation deaths armed ≤ control +1; no new death mode (n ≥ 3, kind-filtered person deaths only — the DEATH-TELE KIND POLLUTION finding).

**Secondary:** deferral-day binding census; veteran survival days; full wall numbers (national/table/wins/median survival/death-cause shares).

**Seeds:** 8 fresh (54101, 54102, 54103, 54104, 54105, 54106, 54107, 54108 — verified filename-unused in evidence/ before the sweep). Horizon: 180d death-aware (dead villages stop simulating; runDays handles this). The deferral window opens at Standing ≥ 100 (typically day 50–80) and the gate resolves over the following ~100 days; 180d covers the full deferral arc on surviving villages.

**Why this primary:** the lever's job is veteran survival through the release window — the gate's binding bar. +3 wave-4 unlocks is the downstream gate effect on the new 1-veteran bar.

**Why this horizon:** see above.

## Proof

`scripts/test-deferguard-20261018.js` — (a) 19 mechanism fixtures on a real harness game (invite-block refusal with no trust hit + beat said aloud, non-veteran pass-through to the real verb, wrap restored, stand-down via the real dismiss verb with trust -8 + reason said aloud, window-closed purity, scholar exclusion, gate-off delegation purity), (b) det-gate (DEFERGUARD unset → byte-identical to vetrel-lead on 2 fixed seeds, 60d), (c) smoke (45d gate-on run). Result: **23/23 GREEN**.

## Pilot results

**ENGAGEMENT GATE: KILLED — 0/16 armed runs engaged (bar ≥ 4/16). Kill protocol applies.**

32 runs (8 seeds × {lead, belong} × {armed, control}), 180d death-aware, 16 complete pairs. The layer NEVER fired on any armed run: dgDismissals=0 and dgInviteBlocks=0 across all 16. The paired corpora are literally identical:

| metric | armed | control | bar | verdict |
|---|---|---|---|---|
| engagement (veteran held off) | 0/16 | — | ≥ 4/16 | **KILL** |
| w4 unlocks | 6/16 | 6/16 | STEP 2 ≥ +3 | n/a (never reached) |
| national | 13/13 | 13/13 | ≥ control−2 | PASS (identical) |
| table | — | — | report | armed 11/16, control 11/16 (identical) |
| median survival | 106d | 106d | ≥ control−10d | PASS (identical) |
| veteran deaths | 9 | 9 | report-only | identical |
| starvation deaths | 9 | 9 | ≤ control+1 | PASS (identical) |
| new death mode (n≥3) | none | — | none | PASS |

Per-pair: 0/16 pairs differ on ANY collected metric (days, end, national, table, maxWave, w4unlock, deaths, starveDeaths, vetDeaths). The det-gate purity held in the wild: when the guard never fires, armed ≡ control exactly.

**Why it never fired.** 15/16 armed runs had a live deferral window (the guard's window detection worked — dgWindowDays>0 on 15/16). But on every deferral day of every run, the scholar's party contained ZERO qualifying veterans (dgDismissals=0), and vetrel never once attempted a veteran invite during a window (dgInviteBlocks=0). The mechanism's premise — "veterans ride out on scholar expeditions during the release window" — is false on this substrate: vetrel's companionProtocol prefers non-veterans and the deferral window opens onto villages where the few living veterans simply never enter the party. Where veterans existed (belong 54103: vet=1 for ~75d of window; belong 54108: vet=1 for ~10 snaps; lead 54108: transient), they stayed home and died through OTHER channels ('monster', 'combat', 'ambush', 'alien', 'contest' — the 9 armed veteran deaths), never the expedition-party channel the guard covers.

This is the third independent confirmation of vetsurvive's verdict: **preservation-during-deferral is not the lever — the bottleneck is veteran manufacturing rate and pre-window mortality.** deferguard changed the verb (invite-guard + dismiss instead of shelter) but guarded the same empty door: on the new 1-veteran bar, the deferral window is usually a 0-veteran window (trace veterans = 0 on the modal run), and when a veteran exists they don't ride expeditions.

Note on the new bar: w4 unlocks are 6/16 on BOTH arms (identical seeds unlock identically) — the recalibrated gate clears without any guard. The modal deferral on this corpus binds on veterans=0 (the bar is 1; the village has none) or armor, and the guard's channel is not where veterans die.

## Village assessment (plain words)

The modal village on these seeds: opens the Standing door around day 50–80, grinds wave-3 overtime, and the readiness gate binds on veterans=0 — the demand is 1 and the village has no living wave-3 killer (trace veterans 0 on most runs). Where the pipeline manufactured one (belong 54103, 54108), the veteran stayed home and died in the general field churn, not on an expedition. The 6/16 unlocks (all belong-side except lead 54108) came from the plain vetrel pipeline manufacturing a veteran while armor held. Who died: the killers, as always — 9 veteran deaths across armed runs, none of them on a scholar expedition. What's missing: veterans at all, not veteran protection.

## Sense-testing (SENSE-TESTING LAW)

N/A — the layer never fired, so no deferguard beats exist in any transcript. The proof test verified the beats say aloud correctly in fixtures (the stand-down reason line, the once-per-day guard line), but no in-context read was possible. Nothing robotic was introduced: armed ≡ control byte-for-byte on all 16 pairs.

## Metric review (§14 — binding, never re-scored)

1. **Engagement miss is KILL, not re-scored.** 0/16 < 4/16. The mechanism is proven (23/23) but the premise is false on this substrate. Not re-scored against unlocks or vet-deaths.
2. **Balanced panel (§15) not run.** The pre-registered STEP 1 instrument is the engagement gate; the panel is the STEP 2 before/after instrument. Armed ≡ control on every collected metric across 16 pairs, so a panel re-sweep would restate identity at ~1h compute. Documented, not skipped silently.
3. **dgWindowDays telemetry counts per hook call** (~4x/day: 3 upkeeps + 1 daily), not days — approximate, not load-bearing for the verdict.
4. **w4 unlocks 6/16 both arms** — the new-bar gate clears without the guard; the lever's theory of change (guard the expedition channel) doesn't touch the binding constraint (veterans=0, manufacturing).

## Out-of-arm findings (not chased)

1. `scripts/test-sprites-valid-20261014.js` fails on the green list (dustboar/sunback/sweeps_week/cliffhanger calm + aggro sprite validations) — pre-existing, unrelated to this arm (zero src/js changes). Steve's monster-visual canon area; flagged, not fixed here.
2. Veteran deaths in the armed corpus came through 'monster', 'combat', 'ambush', 'alien', 'contest' — none through the scholar's expedition party. If a future protection arm is attempted, the raid-defense draft and wild channels are where veterans actually die; the only policy-side hook for the raid draft is the shelter verb (vetsurvive's dead mechanism) — a game-code draft-exclusion hook does not exist policy-side.

## Convergence

**killed-at-pilot.** The deferguard layer is KILLED per the binding engagement gate. Kill protocol: layer deleted zero-trace (scripts/policies/deferguard.js); proof + sweep instruments kept as historical record (they require the deleted policy — same convention as vetsurvive); evidence + per-seed JSONs landed. The axis stays scale-onramp; the veteran bar remains the binding constraint, but preservation-during-deferral is now dead three times over (vetsurvive, compvet's protection-without-manufacturing, deferguard). The open question is veteran MANUFACTURING, not protection — or the demand shape (Steve's #427, now recalibrated by readinessfix).
