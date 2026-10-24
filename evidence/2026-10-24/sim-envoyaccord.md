# sim-envoyaccord — ENVOY→ACCORD census on CURRENT master

**Run:** flesh-out loop, arm sim-envoyaccord, parent run fleshout-20261024T1347Z · **Arm:** sim-envoyaccord · **Axis:** scale-onramp (standing directive)
**Type:** DIAG (instrument-only, zero src/js changes, zero policy changes) · **Verdict: GO** (DIAG-GO: the failing condition is named and proven dominant per the pre-registered bar — this names the next lever; it does not itself fix the wall)
**Anchor:** 00de00d12899 (worktree HEAD at run start; unchanged through the run — origin/master checked at run end: 0 commits ahead of this base, no rebase needed) · **Prior census:** sim-rerunclock (731xx, 0/16 national/regional, envoys arrive with no accord following)
**Backlog:** #892 ENVOY-TO-ACCORD GAP (claimed by this arm at run start; disposition decided only at the end — see Disposition)
**Evidence:** `evidence/2026-10-24/sim-envoyaccord.md` · **Corpus:** `evidence/2026-10-24/perseed-envoyaccord/` (pilot 73301–73308, extension 73309–73316 only if the extension rule fires)
**Instruments:** `scripts/sim-envoyaccord-{sweep,analyze,instrument}.js` (new, this arm) + `scripts/postunlock-instrument.js` (read-only reuse) + `scripts/sim-postunlock2-b-writer.js` (read-only reuse for EPERM-proof writes)
**Proof:** `scripts/test-sim-envoyaccord.js` (E1–E5)

## Canon note (read first, per brief)

- `docs/CANON.md` read: its manifest lists NO canon doc covering the envoy→accord mechanism specifically (no envoy, accord, hierarchy, or diplomacy doc is registered). `docs/DESIGN.md` § regional covers the link→accord shape in general ("the first Haven link triggers a played transition… the player makes a real first-gesture choice (gift 2,000 pantry kcal, send a representative away 3 days, or cold ink)") but not an envoy→accord mechanism. Confirmed: no canon doc covers envoy→accord specifically, so none is invented here — every condition named below is read from engine code (`src/js/hierarchy.js`, `src/js/ledger.js`), cited by function.
- The mechanism as the engine states it: the "envoys arrive" line is a ledger narration beat (`ledger.js` `ledgerBeat()`, ~every 12 days once the village has a non-Unknown leadership epithet; the `indispensable` flavor reads "Other villages send envoys now. They need what you know."). An accord is NOT triggered by that beat. An accord stages ONLY at link formation (`hierarchy.js` `_formLink()` → `stageFirstAccord()` when `!networkLive || accordUnanswered`; `answerAccord('gift'|'visit'|'cold')` resolves it). Links form ONLY through player/policy verbs (`proposeLink`, `proposeCovenant`/`proposeTrade`, `answerCounter` accept, raid resolution). No daily driver forms links autonomously. `judgeLink()` draws RNG (`score += R()*20-10`); this instrument never calls it — it records judgeLink's deterministic inputs at each envoy beat and replicates the deterministic part (see instrument header), with the R-term shown as ±10.

## Pre-registration (binding, MEASUREMENT.md §14 — written BEFORE sweeping, judged as written, never re-scored mid-run)

- **PRIMARY:** census complete AND every envoy-arrival event attributed to an accord outcome (accord formed, or the exact failing condition, via `classifyEnvoyEvent` in engine-gate order: pending-accord → accord-answered → link-exists-no-pending-accord → pending-counter-blocks-proposal → no-known-village → no-proposal-made → proposal-made-no-link).
- **ENVOY-ARRIVAL EVENT (operational definition, decided now):** a `ledgerBeat()` firing whose computed epithet is `the Indispensable` — the only flavor whose text says envoys arrive. All ledgerBeat firings (any epithet) are also recorded as secondary context; they are NOT the primary population and are never substituted for it mid-run.
- **GO iff** the census is complete AND envoy events ≥ 1 AND envoy-no-accord events ≥ 1 AND one failing condition accounts for ≥ 50% of envoy-no-accord events (a named lever for a future arm). The ≥1 floors are the backlog #894 fix (the rerunclock analyzer's `diagGo` was vacuously true on an empty population).
- **NO-GO cases (decided now):** envoys = 0 → NO-GO with 'no population' (never a vacuous GO); all events accord outcomes → NO-GO on this bar ('no failing condition to name' — the gap would be closed, reported as its own finding, not a lever GO); dominant share < 50% → NO-GO ('diffuse'); incomplete census → NO-GO.
- **POLICY (shared baseline):** pure competent (`scripts/policies/competent.js`, no env-gated levers, no wallseg/trustbuffer/vetformation stack). Same substrate as sim-rerunclock.
- **HORIZON:** 180d death-aware (dead villages stop; +10d tail max — §10 reachability lever).
- **SEEDS:** FRESH band 73301–73308 × competent = 8 configs (pilot). Verified unused at run start: no `*7330*` filename at evidence depth ≤ 3 and none among tracked evidence files (checked before sweeping).
- **EXTENSION RULE (decided now):** if envoy-arrival events number < 4 after the pilot, extend to 73309–73316 (8 more). If still < 4, verdict is NO-GO (population too thin — do NOT re-score, do NOT import wallseg-stack envoys as the primary population).
- **§14c (co-primary):** villager (non-scholar) combat deaths are co-primary alongside scholar metrics (postunlock death rows: `person && !player && combatCause`).
- **BALANCED PANEL (§15):** N/A by construction for a DIAG census (no before/after) — stated explicitly; panel ingestion is not forced.
- **Also reported:** national/regional/table/wins, wave reach, median/max survival, death-cause shares, envoy counts by type (ledgerBeat epithet), accord attempts by outcome, per-event counterfactual judgeLink bands (central band + R-range) across known villages.

## §14b pre-pilot substrate checklist (run BEFORE the pilot sweep; probe seed 73399, outside the band, non-census)

(Filled after the probe run — a failed check blocks the pilot until the pre-registration is fixed, which is not re-scoring.)

- **Contact: CONDITIONAL PASS (pilot proceeds; extension rule governs thinness).** Probe seed 73399 (180d, competent, non-census): 13 ledgerBeats fired, all epithet `the Feared` — envoy events (indispensable flavor) 0 on this seed. But the phenomenon DOES occur on this substrate: the E3 smoke run (seed 73301, 60d) captured 5 beats, 3 of them envoy (indispensable). The envoy flavor is epithet-dependent (ledger scores pick the frame per run), not absent from the substrate. The pre-registered extension rule (<4 envoy events → +8 seeds; still <4 → NO-GO population-thin) is exactly the instrument for this thinness, so the pilot runs as pre-registered rather than redefining the event.
- **Pool sizing: PASS.** Probe final: 4 other villages, 4 known (all `rumored` or `generated`, so `knowsVillage` true for every candidate). The addressable pool is 4 candidates per run, not zero.
- **Verb existence: PASS (and the gap is visible in it).** `Game.proposeLink`, `answerAccord`, `answerCounter`, `ledgerBeat` are all functions (E3a). Call counts on the probe: propose 0, accord answers 0, link formations 0. The verbs exist; competent never invokes them — that is the candidate mechanism, not a missing verb.
- **Horizon fit: PASS.** Probe village lost d160 (159 daily rows) inside the 180d cap; death-aware stop works. Counterfactual at probe end: known villages' judgeLink deterministic bases (primary form) 53–60 — 3 accept, 1 counter, 0 decline, 0 shut-door; subordinate form all accept. A proposal made at probe end would most likely form a link (and stage an accord) — the missing step is the proposal, not the courtship score. (Bases are central bands; the live score adds R ±10.)
- **Probe artifact note:** the probe's summary row printed `proposeCalls: null` — a logging artifact (the row computed calls only when a verb-log key existed; with zero calls no key exists). The underlying measurement (0 calls) is correct. Fixed in the sweep before the pilot (summary print only; no measurement changed, no census numbers observed yet).

## Census (pilot stands — extension rule did NOT fire)

Pilot 73301–73308 × competent, 180d death-aware, all 8 configs present (census complete). Envoy-arrival events total 50, far above the extension rule's <4 trigger, so no extension ran — the pilot IS the census.

| seed | days | end | w4 | w5 | national | table | beats (all epithets) | envoy events | accord events | dominant condition |
|---|---|---|---|---|---|---|---|---|---|---|
| 73301 | 180 | survived | — | — | 0 | 0 | 15 | 13 | 0 | no-proposal-made (13/13) |
| 73302 | 180 | survived | 134 | — | 0 | 0 | 15 | 12 | 0 | no-proposal-made (12/12) |
| 73303 | 123 | lost | — | — | 0 | 0 | 10 | 0 | 0 | — (no envoy events) |
| 73304 | 62 | lost | — | — | 0 | 0 | 5 | 0 | 0 | — (no envoy events) |
| 73305 | 180 | survived | 159 | — | 0 | 0 | 15 | 7 | 0 | no-proposal-made (7/7) |
| 73306 | 28 | lost | — | — | 0 | 0 | 2 | 0 | 0 | — (no envoy events) |
| 73307 | 180 | survived | — | — | 0 | 0 | 15 | 13 | 0 | no-proposal-made (13/13) |
| 73308 | 103 | lost | 46 | — | 0 | 0 | 8 | 5 | 0 | no-proposal-made (5/5) |

Envoy events are bimodal per run: runs whose ledger frame lands on `indispensable` produce 5–13 envoy beats; runs on other frames (Feared, Beloved) produce 0. The 50 events come from 5 of 8 configs; the other 3 contribute 0 events, not counter-evidence — the bar counts events, and every event attributes the same way. Instrument errors: 0 across all 8 configs. Verb calls across the whole census: proposeLink 0, proposeCovenant 0, proposeTrade 0, answerCounter 0, answerAccord 0, stageFirstAccord 0, _formLink 0, _formPeerLink 0, raidVillage 0. Links at end: 0 in all 8 configs. Pending accords at end: none.

## Wall numbers (pilot, n=8)

| metric | value |
|---|---|
| national | 0 |
| regional (rank at end) | 0 |
| table | 0 |
| wins | 0 |
| exiled | 0 |
| wave 4 unlocks | 3 (d46, d134, d159) |
| wave 5 unlocks (doors) | 0 |
| village-lost | 4 |
| survived to cap | 4 |
| median survival | 151.5d |
| max survival | 180d |
| total fights | 155 |
| person deaths | 69 (scholar 40, non-scholar 29) |
| non-scholar combat deaths (§14c co-primary) | 2 of 69 person deaths (scholar combat deaths: 35) |

Death-cause shares (person deaths, n=69): combat 52.2% (36), starvation 11.6% (8), monster 10.1% (7), sickness 8.7% (6), contest 4.3% (3), ambush 4.3% (3), wound-that-wouldn't-close 2.9% (2), mosquito / the night / bad belly / lockjaw 1.4% each (1). The §14c split is stark and is reported, not smoothed over: combat deaths are overwhelmingly the scholar's (35 vs 2) — the roster barely fights in competent play, so the village's combat exposure runs through one body. That is a roster-shape observation for a future arm, not this DIAG's question; it does not change the accord verdict.

## Attribution: the failing condition

**Dominant failing condition: `no-proposal-made` — 50/50 envoy-no-accord events (100%, bar ≥ 50%). Verdict: GO.**

The causal chain, in engine order, at every one of the 50 events:

1. An envoy beat fires (`ledgerBeat`, epithet `the Indispensable`): "Other villages send envoys now. They need what you know."
2. At that moment: 0 active links, no pending accord, no pending counter, no accord ever staged or answered in the run.
3. No proposal is ever made — competent calls no link verb in any config (0 calls, all verbs, all configs). `proposeLink` never runs, so `judgeLink` never runs, so `_formLink` never runs, so `stageFirstAccord` never runs, so `pendingAccord` never exists, so `answerAccord` has nothing to answer. The accord mechanism is intact and unreachable, not broken.
4. The counterfactual is nearly airtight, not a shrug: across the 50 events, all 214 known-village observations score central-band `accept` on the primary proposal form (base 60–91; 213/214 are accept-certain even at the worst RNG draw, R = −10; the single base-60 case accepts unless the draw is below −5). Subordinate-form bases are 61–95. Zero known villages are shut-door (no opinion ≤ −20), zero are decline, zero are counter on the central band. Courtship is NOT the blocker anywhere in this corpus — a proposal made at any envoy event would almost certainly have formed a link and staged an accord. The missing step is the proposal itself, full stop.

**Named lever for a future arm:** a link-proposal drive in competent play (a policy that proposes to a known village when the envoy beat lands, or when the counterfactual clears the bar), OR an envoy-initiated proposal path in game code (the envoy beat itself offering the proposal as a played choice). The first is policy-side and cheap to test; the second is the design question (do envoys knock, or does Haven?). Either way, the next arm does not need to fix courtship, opinion, tribute, or trust first — those gates already clear.

## Reachability verdict

- **Wave 5 / the door:** NOT REACHED — 0/8 (same as rerunclock's 0/16 on this substrate).
- **National / regional / table / win:** NOT REACHED — 0/8 each. Rank `village` at end in all 8 configs.
- **Wave 4:** reached, late — 3/8 (d46, d134, d159).
- **First link / first accord / Regional Dawn:** NOT REACHED — 0 links, 0 accords, 0 dawns in 8 configs and 50 envoy events. This is the before-regional wall, confirmed from the envoy side: the content exists (the accord UI, the gesture choices, the Dawn beat are all in code) and is never staged.
- **Arc II/III/IV, vests:** NOT measured by this DIAG — not claimed either way.

## Village assessment (plain words)

These villages are the rerunclock villages from the other side of the mirror: they survive or die on ordinary attrition (combat, starvation, sickness in ones and twos), they teach each other, they gossip, they keep full pantries ("~139 days of fresh on hand" in the sense transcript), and every so often the wider world knocks — riders arrive with talk of Haven, other villages send envoys, "they need what you know" — and nothing happens. Not a refusal, not a decline, not a counter-offer: nothing. The village does not know the knock is a door. The strongest villages by standing are exactly as village-bound as the weakest, because the scale drive is not a resource the village accumulates — it is a verb nobody invokes. What is missing is one decision: propose a link to a village that would say yes.

## Sense-testing (SENSE-TESTING LAW)

Sense source: narration:true replay of seed 73301, `perseed-envoyaccord/sense-73301.txt` (MARKED NON-MEASURED — narration replays diverge from measured runs in general; this replay matches the measured 73301 run on headline numbers: survived 180d, 15 beats, 13 envoy events, 0 links, so the sequence is representative, not a different village). A second replay, seed 73399 (`sense-73399.txt`), matches its measured probe the same way (lost d160, 13 beats, 0 envoy events — a Feared-frame run).

- **The envoy-arrival sequence, judged:** 13 envoy beats (e.g. line 3627: "riders from The Hungry Road bring talk of Haven. Out there they call you the Indispensable. Other villages send envoys now. They need what you know."). What follows each beat is ordinary village life — weather readings, water fetching, wood hauling, pantry checks, gossip mutating by the fire. There is NO player response beat, NO proposal, NO accord, NO link, NO network line anywhere in the 17,000+ line transcript (grep for accord/propose/link/Network/Regional Dawn returns only unrelated lines, e.g. "Codex: Alexei proposed relief (raid)"). The beat offers no verb, no button, no follow-up: the accord UI only renders when a link already exists, and the envoy beat does not create one.
- **Sense verdict: SILENT FAILURE (a missing drive, not a designed outcome, not a missing verb).** The accord verbs exist (gift/visit/cold) and the gesture is designed — but nothing converts "envoys arrive" into "propose a link," so the village's non-response reads as the game forgetting its own knock, not as Haven choosing silence. (A designed cold shoulder would say so — the accord `cold` option says it aloud. This says nothing.)
- **Villagers act like people — PASS (within the village).** Teaching by the fire, gossip mutating as it travels, pantry-full behavior that is behavioral ("the shelves are full… leaves the harvest standing"), chores with names attached. The robotic note is the same as rerunclock's: generic lines repeat verbatim across days — legible, not a failure. The people-feel failure is only at the village boundary: the wider world knocks and the village has no hands for it.

## Metric review (§14)

The pre-registered bar is judged as written and it passes on every leg: census complete (8/8) ✓; every envoy event attributed (50/50, all `no-proposal-made`) ✓; dominant share 100% ≥ 50% ✓; envoy events ≥ 1 ✓; no-accord events ≥ 1 ✓. No re-scoring happened: the extension rule was not needed (50 ≥ 4) and was not bent; the epithet-based event definition was not widened to all beats (the 35 non-envoy beats are reported as context, never substituted); the probe's epithet-dependence was handled by the pre-written rule, not by redefinition.
**What the metric got right:** the ≥1 floors (the #894 fix) mattered in design even though they did not bind here — the corpus is rich, not thin, and the flag would have caught a thin one. **What to carry to the next run:** the next arm (proposal drive) should pre-register a different bar — accord-staged rate per envoy event, not attribution share — because this DIAG consumed the attribution question. Also: the sense file's first write failed 10/10 on hash mismatch (see below) — the shared chunked writer slices bodies by UTF-16 code units, so a chunk boundary inside an astral-plane character (emoji) corrupts its hash check; the fix (astral-escape to `<U+XXXX>` before writing, in the sweep's SENSE path only) is documented in the sweep file. Census JSONs (mostly ASCII) never hit this. A future arm writing prose transcripts through that writer should escape astral characters first.
**Balanced panel (§15):** N/A by construction for this DIAG census — no intervention, no before/after. Stated explicitly, not forced.

## Proof tests (scripts/test-sim-envoyaccord.js) — 22 passed, 0 failed

- E1 judgeBase fixtures: PASS — primary accept 57, primary decline 28, subordinate accept 81, primary counter 38, band thresholds (hand-computed from `hierarchy.js` `judgeLink()`; the sample event in the corpus re-derives exactly: repS 49 → 38+20+0+14 = 72).
- E2 classify branches: PASS — all seven engine-grounded conditions (pending-accord, answered, link-exists, pending-counter, no-known, no-proposal, proposal-no-link).
- E3 live instrument smoke: PASS — 60d pinned run, daily rows monotonic, zero instrument errors, verb functions exist, competent calls no link verbs (grep + live log agree).
- E4 determinism: PASS — pinned 180d config (seed 73301) byte-identical across two separate processes.
- E5 diagGo floors (#894 fix): PASS — empty population NO-GO (not vacuous GO), all-accord population NO-GO on this bar, dominant 3/4 GO, diffuse 2/5 NO-GO.

## Convergence

**GO (DIAG)** | the #892 envoy→accord question IS answered on measured evidence: the failing condition is `no-proposal-made`, dominant at 50/50. The scale-onramp axis itself is NOT converged — national/regional/table/wins are still 0 — but the wall moved from "unknown gap" to "named lever": the next arm is a proposal drive, and it starts from a counterfactual that already clears (214/214 accept). Convergence state: **converging** (question answered, wall standing, next lever named).

## Disposition (backlog #892)

**ANSWERED.** The DIAG names the failing condition and proves it dominant per the pre-registered bar (50/50 = 100% ≥ 50%, census complete, ≥1 event, ≥1 no-accord event). The backlog line for #892 is flipped from `claimed` to `answered` with this evidence path. This is NOT `fixed` — no game or policy change lands here (instrument + evidence only); the fix is the next arm's proposal drive.
