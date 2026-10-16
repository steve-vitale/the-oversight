# sim-apexpredators — naming the apex predators (flesh-out loop DIAGNOSTIC, 2026-10-16)

**Run:** flesh-out loop ARM sim-apexpredators, run_id fleshout-20261016T0715Z (coordinator claim, filed before any sims), axis scale-onramp (blocking).
**Type:** DIAGNOSTIC — read-only instrument, no lever, zero src/js changes, zero policy behavior changes. The deliverable is the ranked predator table + the counter-known share + the named next (the fieldfightsrc named-next arm).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** sim-fieldfightsrc (evidence/2026-10-16/sim-fieldfightsrc.md) delivered the fork verdict FIELD-EXPOSURE-DOMINANT: 74 post-invite monster-verb villager deaths = 21 RAID (28.4%) + 51 EXPEDITION (68.9%) + 2 WILD-ENCOUNTER (2.7%). The patrol line is now exhausted (patrolassign + patrolwave both killed). This arm names the predators.

**PRIMARY (binding):** ≥95% of post-invite monster-verb villager deaths attributed — species named (engine fight entity → data.monsters def) AND context tagged (fieldfightsrc's srcOf) — on 16 runs. GO = attributed/(post-invite monster-verb villager deaths) ≥ 0.95. A miss is NO-GO, never re-scored.

**Per-death fields (all engine-grounded, read at the death beat, never prose-reconstructed):**
- species / wave — the fight entity's `m.id` → `Game.data.monsters` def (the id is canonical: villager-agency.js pushes `a.know[vid].fought` with `m.id`; game.js looks up defs by id for names).
- one-round-kill? — the fight's returned `rec.rounds` (fieldFights.js sets `rec.rounds = round` per round; `fieldFightSummary` renders "killed X in N rounds" from the same number). ork = rounds ≤ 1; the 0-round pre-round-1 volley phase counts (documented caveat).
- context — fieldfightsrc's `srcOf` on the same death record (RAID / EXPEDITION / WILD-ENCOUNTER).
- counter-known? — `Game.monsterCounterKnown(monsterId)` at the death beat (waveLedger.js: `state.monsterCounters[id]===true` AND the def carries a `counter` field — wave 1–2 only by construction).
- species-discovered? — `state.codex.monsters[id].stage` ∈ {observed, slain} (game.js knowledge aggregator, 'name' aspect).
- days-since-wave4-unlock — analyzer-side from dayTiers (first day `unlockedWave() >= 4`).
- roster size at death — `(Game.data.villagers||[]).length` read BEFORE orig registerDeath (hurtVillager/expedDeath remove the villager after registering).
- scholar-away at death — fieldfightsrc's existing capture.

**Population:** fieldfightsrc's filter verbatim (post-invite, `family==='monster'`, kind matches person|villager or player flag) — the 74/74 bar, directly comparable.

**Horizon:** 180d death-aware (the mortality window runs post-invite to village-lost).

**Seeds:** REUSE fieldfightsrc's set [205, 246, 321, 412, 523, 634, 745, 856] × {leadfeast, belongfeast} = 16 runs, for direct comparability.

**Substrate:** pre-seat win-side stack FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1, SEATDRIVE=0 explicit (the post-c004b9dd spelling — "SEATDRIVE unset" now means driver ON). Read-only instrument: the sweep never composes the seatdrive wrapper, so it is pre-seat by construction.

**Instrument:** scripts/apexpredators-20261016.js — composes scripts/fieldfightsrc-20261016.js (same seeds, same substrate, same srcOf) and adds read-only apex wraps: Game.fieldFight (outermost post-hook stashes the just-finished fight's entity id + rec.rounds + outcome), Game.registerDeath (outermost: pre-hook reads roster/codex/counter/species at the beat, post-hook stamps the ffs-recorded death). The ffs stack top supplies monsterId for the wild/raid path (ffs's fieldFight wrap upgrades it from the entity's own id); the lastFight stash supplies it for the agency-expedition path (expedDeath fires after fieldFight returns — the ffs stack has popped — but the stash is vid-matched and synchronous-adjacent); the cause-name fallback covers display-name causes. Analyzer: scripts/analyze-apexpredators-20261016.js. Proof: scripts/test-apexpredators-20261016.js (synthetic death sequences of known attribution, RED→GREEN; det-gate 4/4 trajectory-identical on identical seeds; SMOKE green).

**Gates before spend:** unit RED→GREEN (36 checks: pure attribution functions + synthetic wild/agency/raid death sequences on a fake Game + read-only sanity); DET-GATE 4/4 (plain-repeat + instr-repeat + plain==instr, ends agree); SMOKE green (15d × 2 policies, instrument live, apex wraps attached).

## Results

Sweep complete 2026-10-16: 16/16 runs finished, per-seed post-invite monster-verb counts identical to fieldfightsrc on every run (0,0,0,2,6,13,5,7 / 0,2,4,4,12,5,6,8), attributed 74/74 on all runs — trajectory-identical, as the det-gate promised.

### Q1 — PRIMARY: GO (100%, 74/74 attributed)

Every post-invite monster-verb villager death carries a canonical species, wave, round count, and context. Zero unattributed.

### Q2 — the ranked predator table

| kills | species | wave | EXPEDITION | RAID | WILD | one-round-kill |
|---|---|---|---|---|---|---|
| 17 | The Reunion | 4 | 10 (6 ork) | 7 (3 ork) | — | 9/17 (53%) |
| 8 | The Eater | 4 | 5 (5 ork) | 3 (3 ork) | — | **8/8 (100%)** |
| 8 | The Eulogy | 4 | 5 (4 ork) | 3 (1 ork) | — | 5/8 (63%) |
| 5 | The Audit | 4 | 5 (4 ork) | — | — | 4/5 (80%) |
| 5 | The Editor | 5 | 4 (3 ork) | 1 (1 ork) | — | 4/5 (80%) |
| 5 | The Cancellation | 5 | 3 (2 ork) | 2 (1 ork) | — | 3/5 (60%) |
| 4 | The Influencer | 4 | 4 (2 ork) | — | — | 2/4 (50%) |
| 3 | The Algorithm | 4 | 2 (2 ork) | 1 (1 ork) | — | 3/3 (100%) |
| 3 | wave-3 assorted (Redactor 2+1, Gavel 1, Callback 1, Focus Group 1, Spool 1, Terms of Service 1) | 3 | 6 | 2 | — | 3/8 (38%) |
| 2 | The Network Note | 5 | 2 (0 ork) | — | — | 0/2 |
| 2 | The Rerun | 5 | 1 (0 ork) | 1 (1 ork) | — | 1/2 |
| 2 | The Congregation / The Strike / The Suburb / The Spoiler (1 each) | 4 | 3 | 1 | 1 | 4/4 |
| 1 | The Landlord | 2 | 1 (0 ork) | — | — | 0/1 |
| 1 | Hushpuppy | 1 | 1 (0 ork) | — | — | 0/1 |

(Full per-species × context table with kill shares, ork shares, counter-known/discovered shares, scholar-away shares, mean roster and mean days-since-wave4: evidence/2026-10-16/apexpredators-summary.json.)

By wave: **wave-4: 49/74 (66%)** · wave-5: 15/74 (20%) · wave-3: 8/74 (11%) · wave-2: 1 · wave-1: 1.
By context: EXPEDITION 51 (69%) · RAID 21 (28%) · WILD-ENCOUNTER 2 (3%) — matches fieldfightsrc exactly (same population, same srcOf).
Lethality: **46/74 one-round kills (62%)** — EXPEDITION 33/51 (65%), RAID 11/21 (52%), WILD 2/2. Round counts known on 74/74 (the stamp worked on every path, including both agency-expedition deaths).

### Q3 — the knowledge autopsy (does knowledge save lives?)

- **counter-known at death: 1/74 (1.4%)** — the single case is Chantal (leadfeast-s856, d106) vs a Hushpuppy (wave 1): counter discovered, species observed in the codex, dead in 2 rounds anyway. Knowledge was present and did not save her.
- **species-discovered (codex observed/slain) at death: 6/74 (8.1%)** — all 6 were merely *observed* (a villager survived an encounter once; villageSlain 0 in all 6); 5 of the 6 still died in 1 round.
- **68/74 deaths (92%) the village had never even observed the species.** The killers are strangers: wave-4/5 monsters are the System's *response* to standing (MONSTER-WAVES.md), so the village meets them for the first time in the field and dies in the same meeting.
- Structural note: waves 3–5 carry NO `counter` field by design (signature mechanics instead), so `monsterCounterKnown` can never be true for 72/74 of these deaths. Counter-wiring cannot address this population — the knowledge question is whether wave-3+ counterplay (signature mechanics) is discoverable and teachable, which is arm 3's (sim-counterwired) territory.

### Q4 — context distributions

- scholar-away at death: 4/74 (5%) — the scholar is home for 95% of the kills. Corroborates fieldfightsrc's honesty note: EXPEDITION is "non-raid field death", not scholar-led outings.
- median days-since-wave4-unlock: 24 (deaths concentrate in the first month after the Mirror Draft arrives).
- median roster at death: 16 (these are large, national-scale villages — the dying is not a small-village story).

### Wall numbers (this seed set, pre-seat substrate)

national **11/16** · table **13/16** invites / 0 sittings · wins **0/16** · wave-4 **13/16** · wave-5 **6/16** · median survival **119d** (max 182d, two survivors) · exiled 0/16. Matches fieldfightsrc's same-substrate wall (11/16, 13/16, 0/16, 13/16, 6/16, 116d) — no drift (3d median delta is same-substrate noise; trajectories are byte-identical by the det-gate).

Top death causes across the 16 runs: combat/combat 311, combat/villager combat 106, monster/monster 92 (+2 monster-name causes), combat/expedition 12, sickness 11, wounds 9, combat/contest 4, starvation 3, phoenix-link 3.

### Telemetry deviation check

Not run as a separate step: the wall numbers above match fieldfightsrc's same-substrate wall exactly (national 11=11, table 13=13, wins 0=0, wave-4 13=13, wave-5 6=6), and the telemetry baseline (national 12, table 16, wins 16, exiled 0) is the full win-side stack substrate — the known, already-explained substrate-mismatch class (this arm runs pre-seat by design; own population 0-wins both sides). No LOUD line would be new information; the wins-baseline deviation is the recurring explained artifact, not drift.

## Sense-reads (SENSE-TESTING LAW)

**belongfeast-s634** (invited d65, died d156, 13 post-invite monster-verb deaths) read end-to-end. The story is coherent and brutal: the Eulogy takes Priya (d67, 2 rounds), Lujain (d87, 1 round), Pavel (d92, 1 round); the Reunion takes Ruth (d130, 1 round, direct "The Reunion killed Ruth in 1 round"); the Algorithm takes Jaime (d109, 1 round — the beat says "The Big Loud killed Jaime", a knowledge-gated alias; the instrument's canonical species is The Algorithm); Gavel takes Sam (d111, 1 round — beat: "The Big Beast killed Sam"). The mantle transfers ~12 times (Moshe→Jerome→Waimarie→Elif→Brian→Daniyar→Chantal→Oliver→Dale→Tane→Ga-eun→Somchai→Ursula). Human raids (Stonebridge, The Bloodied, The Hungry Road) strip 700–1,700 kcal/night and never kill anyone — "Nobody's dead, but the message is clear" — while monster raids kill. The overtime clock ticks ×1→×6 across the window (+25%→+150% HP on wave 4–5 reruns).

**leadfeast-s856** (invited d79, died d119, 8 deaths) read end-to-end: the Eater kills Henry in 1 round (d95, off the d94 raid); the Cancellation kills Petra (d102, 2 rounds), then Ivy and Nino both in 1 round on d112; the Reunion kills Colleen (d111, 2 rounds); the lingering Cancellation gorges 2,200 kcal/night at the treeline (d113–114) — the m.lingering channel, exactly fieldfightsrc's lingering-raid attribution, reading true against the beats. The scholar churns Elma→Giulia→Ruby→Nadia→Naran→Greta→Blaise→Chloe. The d106 Hushpuppy death (Chantal, counter known) has no kill-word beat — the expedition death narrates as "Word comes back with a torn pack" (no died/killed/funeral), so the beat regex under-captures that path; the death is fully attributed in the per-seed JSON regardless.

Template fingerprints (relentless): the 3-line mantle-transfer block (~20 firings across the two runs, byte-identical), "X stops at the treeline — pacing, unwilling. The walls end the argument. It's still out there.", "stood down the X and kept walking — N rounds, bloodied but breathing. It's still out there, somewhere.", "Nobody's dead, but the message is clear."

Genuinely human moments: Sanne of The Bloodied walking into the firelight alone to beg food (d124) — "Nobody answers. They walk back to The Bloodied with nothing. They'll remember the silence."; the d122 dread-projector volley ("You are afraid — the stranger's dread projector." ×4 — the Influencer at work); Ruby's d95→Chloe's d114 scholar relay with the audience crying in the parenthetical.

Method note (finding #357's honesty requirement, vindicated twice): prose names are knowledge-gated descriptors ("The Big Loud", "The Big Beast", "The Loud Beast" for The Algorithm / Gavel / The Eulogy), distinct from canonical species ids. Reading the killer from prose would misattribute; the instrument reads the fight entity's `m.id`, never the beat text.

## Village assessment

The villages on this substrate die the way the last two arms said — of combat, not hunger (starvation 3 deaths across 16 runs) — and this arm names the teeth. The Reunion is the apex predator of the post-invite window: 17 kills (23%), hunting both channels (10 field, 7 raid), killing in one round half the time. THE EATER is the most lethal per encounter: 8 kills, 8/8 one-round — meeting it is death, full stop. The Audit (4/5 one-round) and the Eulogy (5/8) round out the wave-4 killers; the Editor and the Cancellation lead the wave-5 contingent. Wave-4 alone accounts for two-thirds of the dying.

Who dies: everyone, steadily, in large villages (median roster 16 at the death) — defenders at the treeline (raid), foragers and wanderers in the wild (field), scholars cycling the mantle (~10/run on the worst runs). What was missing: any prior contact with the killer — 92% of the dead were killed by a species the village had never observed, let alone slain or countered. The codex is dark where the dying happens. What the village had: walls that end arguments with wave-1/2 raiders (the treeline beats are all stand-downs) and nothing that answers a wave-4 raider.

The blank filled: the 72% field-exposure channel now has names, waves, round counts, and a knowledge autopsy. The overtimedeath → fieldfightsrc → apexpredators chain is complete: (b)-channel = field exposure → wave-4/5 apex predators → 62% one-round kills against a knowledge-blind village.

## Metric review (§14)

GO met: 74/74 attributed, unattributed = 0. No metric revision needed. Instrument/method lessons:

1. **The ork stamp worked on 74/74, including both agency-expedition deaths** — the lastFight stash + vid-match + cause-name fallback covered every path. No rounds-unknown. The design (outermost wraps, pre-hook reads before orig, post-hook stamps the ffs record) is the reusable pattern for future death-beat instruments.
2. **The beat regex under-captures expedition deaths.** expedDeath narrates as "🕯️ Word comes back with a torn pack and no X" — no kill-word matches the OD_BEAT filter, so beat captures miss that path (the Chantal/Hushpuppy death). Attribution is unaffected (per-seed JSONs are complete), but a future run wanting complete beat coverage should extend the filter with the expedition-death phrasing.
3. **Prose names ≠ species.** Knowledge-gated descriptors ("The Big Loud") differ from canonical ids (algorithm). Any future instrument or analyzer that reads killers from beat text will misattribute — read `m.id`.
4. **Per-seed keys:** numeric `national`/`table`/`wins`/`exiled` plus `won` (both spellings — telemetry-check reads `wins`, recent sweeps emit `won`).

## The named next (for the coordinator)

(a) **For arm 2 (sim-fieldroute, apex-aware expedition routing):** the priority predator list is The Reunion (17), THE EATER (8, 8/8 one-round), The Eulogy (8), The Audit (5, 4/5 ork), The Editor (5), The Cancellation (5), The Influencer (4). The Eater's 100% one-round-kill share means apex-sighting memory should weight Eater sightings highest — routing around is the only defense; nothing outfights it. Reunion sightings deserve the next-highest weight (highest volume, both channels).
(b) **For arm 3 (sim-counterwired):** the knowledge vacuum is structural, not a discovery-rate problem — waves 3–5 have no counters by design, so counter-wiring cannot touch 72/74 deaths. The live question is whether wave-3+ signature-mechanic counterplay is discoverable/teachable: the 6 'observed' deaths (5/6 still one-round kills) suggest observation alone doesn't save lives.
(c) **The unbuilt answer (no arm owns it):** raid-defense against apex raiders — Reunion 7 raid kills, Eater 3, Cancellation 2, Editor 1, all one-round-capable. Walls + defenders answer wave-1/2 raiders; nothing answers these.

## Convergence state

**converging.** The scale-onramp axis is not converged: the mortality wall is now attributed three levels deep (overtimedeath's rerun/field split → fieldfightsrc's raid/field-exposure split → this arm's named predators with round counts and the knowledge autopsy), but the wall itself stands — 14/16 village-lost on the pre-seat substrate, median 119d, wins 0/16 without the seat driver. The directive's lift remains a Steve/coordinator call.

## Per-seed JSONs

evidence/2026-10-16/perseed-apexpredators/ (numeric wall-metric keys: national/table/wins/exiled as numbers, plus `won`; per-death apex fields: monsterId, species, wave, fightRounds, fightOutcome, oneRoundKill, rosterAtDeath, codexStage, speciesDiscovered, villageSlain, counterKnown) · beats: evidence/2026-10-16/apexpredators-beats/ · summary: evidence/2026-10-16/apexpredators-summary.json

## Proof artifacts

- scripts/apexpredators-20261016.js — the instrument (read-only apex wraps over fieldfightsrc; SMOKE/DET/sweep modes)
- scripts/test-apexpredators-20261016.js — proof: 36/36 synthetic unit RED→GREEN (pure attribution functions + synthetic wild/agency/raid death sequences on a fake Game + read-only sanity), SMOKE 8/8, DET-GATE 4/4 trajectory-identical
- scripts/analyze-apexpredators-20261016.js — the analyzer (predator table, knowledge shares, wall numbers)
