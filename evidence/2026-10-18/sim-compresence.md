# sim-compresence — companion presence in wave-3 killing fights: the ABSENCE diagnostic (2026-10-18)

Run: flesh-out loop arm sim-compresence (loop A), axis scale-onramp (the blocking axis).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (veteran vocabulary; design call #4 readiness gate; wave-3 bands).

LINEAGE: sim-killdisc (2026-10-18, DIAG complete, lever KILLED-AT-GATE): companion damage-share 1.5% vs kill-share 0.0% across 44 wave-3 kills; 39/44 fights zero companion damage. The veteran-production line is stuck at PRESENCE, not kill-securing. This arm executes killdisc's named next: diagnose WHY companions deal 0 damage in wave-3 killing fights — the six presence channels.

## Substrate (EXACT, pre-seat — the killdisc/compchan/vetstaff-a substrate)

- policy: tribfloor leadfeast/belongfeast (TF base ONLY — NO vetstaff, NO vetblood, NO vetrel)
- env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0, NODEWITNESS=1
- seeds: 8 fresh (63301–63308 — verified filename-unused in evidence/2026-10-18/perseed-*/ before the sweep) x {leadfeast, belongfeast} = 16 runs
- horizon: 180d death-aware
- instruments: COMPRESENCE=1 (read-only; fight-start presence census + kill-time channel attribution + per-source tbDamage + fieldFight raid-engagement capture). ZERO src/js changes, zero default behavior change.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep)

**DIAG-GO:** >=15/16 runs' wave-3 killing fights FULLY ATTRIBUTED by presence channel (each attributed fight names the channel plus the mechanism evidence), AND the dominant absence channel gets a NAMED MECHANISM (e.g. "AI never summons companions to haven TB fights", "companions lag 3+ tiles behind on the grid", "they die in the first 2 rounds"). A miss is NO-GO, never re-scored. Metric doubts go under "metric review" for the NEXT run.

Presence channels:
- (a) present-in-range — companion IN the fight, grid Chebyshev <=1 of the killed monster (fight-start or kill-time)
- (b) present-far — companion in the fight, never within strike range
- (c) party-not-in-fight — scholar's party has living non-scholar members not in the fight (WHERE recorded)
- (d) all-dead — no living non-scholar roster
- (e) elsewhere — living roster all on other world nodes
- (f) solo-by-rule — living roster on the scholar's node but beyond the <=4 join radius or behind the haven door

## Proof

- `scripts/test-compresence-20261018.js` — instrument proof: (a) 14 presence-channel fixtures (all six channels + anomaly probes); (b) DET-GATE: instrument-on vs instrument-off byte-identical 60d trajectories, both policies, zero instrument errors; (c) SMOKE: both policies record presence on live wave-3 fights (joiners, AI modes, where-data, channel attribution, damage table); (d) attribution completeness on the real sweep. **42/42 GREEN.**
- `scripts/compresence-sweep-20261018.js` — standalone 16-run sweep driver (sweep-compare.js untouched per the sibling-edit constraint).
- `scripts/compresence-analyze-20261018.js` — attribution table + channel totals + join-rate context + mechanism breakdown + anomaly probes + DIAG-GO check.
- `scripts/compresence-transcripts-20261018.js` — sense-testing transcript probe.

## Results — DIAG-GO MET (16/16)

16-run census (seeds 63301–63308 x {leadfeast, belongfeast}, 180d death-aware, COMPRESENCE instrument, zero instrument errors on 16/16):

| channel | kills | share |
|---|---|---|
| (f) solo-by-rule | 32 | 82% |
| (a) present-in-range | 4 | 10% |
| (b) present-far | 2 | 5% |
| (e) elsewhere | 1 | 3% |
| (c) party-not-in-fight | 0 | 0% |
| (d) all-dead | 0 | 0% |

39/39 wave-3+ kills attributed with channel + mechanism evidence; 13/13 runs-with-kills fully attributed, 3 runs zero-kill (vacuous); **16/16 runs attributed — DIAG-GO.** Companion kills: 1/39 (Naran, channel a). Companion damage-share: 0.4% overall.

Join-rate context (all 624 wave-3 TB fight-starts, kills or not): companions joined 11 (1.8%). The scholar was at haven in 127/624 fight-starts but inside the hall in only 19/624 — the scholar fights OUTSIDE.

### The named mechanism: THE HALL DOOR

Of the 32 channel-(f) kills, the scholar was outside the hall in 30. Same-node companion dispositions (nearest-4 per fight, 90 total): **door-blocked 75, no-grid-position 14, beyond-4-radius 1, in-radius 0.**

The mechanism, end to end (code-verified, game.js):
1. The TB join rule (`startCombat`, "party: villagers within 4 squares join the fight (nearest 4 — no zerg)") reads `state.village.positions[rid]`.
2. `ensureVillagerPositions()` populates positions ONLY for NPCs on the scholar's world node AND — at haven — on the scholar's side of the door. NPCs on the other side get their positions DELETED.
3. Villagers' default sub-state is inside the hall (`npcInside` defaults true — "they live in the hall").
4. Wave-3 monsters arrive at the haven grounds / treeline; the scholar walks OUT to face them (grid corners like (0,0), (8,0) — the node's edge).
5. The moment the scholar crosses the door, every inside villager becomes invisible to the join rule. Nobody follows.

The 14 no-grid-position cases: companions outside on the scholar's node and side, but with no `positions[rid]` — stale/absent grid assignment (positions are assigned on player movement; a villager who arrived via `npcNodeTravel` or a door transition that didn't re-run assignment is blind to the join rule). Secondary mechanism, same family: the join rule only sees positioned NPCs.

Anomaly probes: party-in-radius-not-joined = 0, in-radius-not-joined = 0 — the join rule itself is consistent; nothing that should have joined didn't.

What did NOT cause the absence: not death (d=0 — the roster is alive), not distance in the world (e=1 — companions are overwhelmingly ON the scholar's node), not party mechanics (c=0 — the policy runs no travel party; nothing to fail), not AI refusal (the join is automatic, not AI-gated).

### The 6 fights with companions (the entire presence pool)

| fight | channel | companion | AI | dmg | outcome |
|---|---|---|---|---|---|
| lead s63303 d107 buffering (raid) | a | Greta | brave | 49 (14.5%) | Greta DIED in the fight |
| lead s63304 d162 buffering | a | Naran | helpful | 85 | Naran SECURED THE KILL, survived |
| belo s63308 d83 ad_break | a | Yousef | helpful | 55 | scholar killed |
| lead s63305 d97 terms_of_service | a | Lucas | helpful | 85 | scholar killed |
| belo s63303 d102 ad_break | b | Greta | brave | 41 | scholar killed (Phase blade 98-158) |
| belo s63304 d76 chorus_line | b | Wei | helpful | 0 | present, never in range, dealt nothing |

The positive control: Naran fought beside the scholar (healed +12, struck 25/25/35 FEASTED), landed the killing blow on a wave-3 monster, and lived — teaching, discovering the Farsight synergy, and staring down a Night Court the next day. **The production line works when a companion is present and in range. It is broken only at the presence step.**

The negative control: Greta (d107) fought just as bravely (49 damage, 14.5% share — the corpus's highest) and died: "☠ Greta falls. You carry the weight of it." This is the transient-veteran mechanism made visible — the rare companion who reaches a wave-3 fight bleeds out in it.

### Raid-shape verdict: NOT CONFIRMED as a presence effect

killdisc's open hypothesis (companion damage-share 5.0% raid vs 0.7% haven-TB, small-n). This corpus, presence-attributed:

| shape | kills | fights with joiners | companion damage-share |
|---|---|---|---|
| haven-TB | 27 | 5 (18.5%) | 0.5% |
| raid | 12 | 1 (8.3%) | 0.2% |

Raid-shape fights do NOT systematically bring more companions into scholar TB fights. Both shapes are dominated by the door (raid f=11/12, haven-TB f=21/27). The damage-share gaps in both corpora are driven by 1–2 individual brave joiners (Nora's 142, Greta's 49), not a shape effect. **Hypothesis refuted as a presence effect; the damage-share gap is small-n noise.**

Related: 302 wave-3+ villager field engagements (patrol/wild/raid) produced ZERO villager kills — villagers engage wave-3 monsters in the field (presence!) but never finish them (capability). All 12 raid-shape kills in this corpus were scholar TB fights during aid crises (via='player', ctx.aid) — zero via='aid-crisis'.

## Village assessment (plain words)

The modal village fights wave-3 monsters with the scholar alone at the haven door. The village itself is alive and busy — cooking, teaching, foraging, arguing about the watch rotation — inside the hall, while the scholar walks out to the treeline to face the Redactor, the Spool, the Buffering. "⚔ BIG-EYES! You're on your own." The fiction even lampshades it. In 624 wave-3 fight-starts, companions joined 11 times (1.8%). When they do join, they fight honestly — Naran's 85 with the killing blow, Greta's 49 before she fell — but the scholar's Phase blade (98–323 a strike, up to 11,332 in one godhood multi-fight) ends nearly everything first.

Who thrived: scholars with big weapons; Naran, the one companion who both fought and lived. Who died: Greta, and everyone the door kept inside. What was missing: companions OUTSIDE the hall when the fight starts — not their damage, not their kills, their presence. The blank this run fills is the presence map; the blank it names is the door.

## Sense-testing (SENSE-TESTING LAW)

Read: evidence/2026-10-18/compresence-transcripts/belongfeast-s63303.txt (7 kills: f/b/e/f), leadfeast-s63303.txt (the (a) Greta fight), leadfeast-s63304.txt (the (a) Naran kill).

- **(f) d90 chorus_line** — coherent and damning. The feast draws the Big-Eyes to the edge of the light; the beat offers "Face it while the feast is in you — or let the watch drive it off." The scholar faces it; "You're on your own." Ines is "down by the firepit, nudging coals" — inside. The village watches ("Adaeze, at the fire: 'It wears our faces?'") but nobody walks out. The fiction supports the mechanism exactly — and names the blank: the watch is mentioned as an alternative and never materializes.
- **(b) d102 ad_break** — coherent. Greta had been sitting with the scholar the previous day ("Can't sleep. Tell me something from before."), so she was outside and near when the fight started; she joined, struck 8–10s, took a 23, and the scholar's 98–158 Phase blade ended it. Presence had a reason; the kill had a reason.
- **(e) d126 spool** — coherent. "Greta heads out for water", "Zoltan heads out for water", "Matilda walks out with Zoltan. 'Nobody walks alone today.'" — the companions are on neighboring nodes when the spool arrives. "You're on your own" is the living world working as designed.
- **(a) d107 buffering (Greta dies)** — coherent and brutal. "Greta squares up to watch. 'Give it hell.'" She fights, she dies, the scholar kills it alone. This is why there are no living veterans.
- **(a) d162 buffering (Naran kills)** — coherent and hopeful. "Naran patches you up (+12 HP). 'Hold still!'" The helpful-AI companion heals, fights, kills, lives. The very next day: "Naran stared down the Night Court and it backed off." Veterans are producible — the door is the only thing stopping them.

No robotic behavior found in the presence/absence itself; every channel read as people doing sensible things. The one incoherence is the d90 watch that never comes — a design blank, filed below.

## Metric review (§14 — binding, never re-scored)

1. **DIAG-GO met: 16/16.** 13 runs with wave-3 killing fights, all 39 kills attributed with channel + mechanism evidence; 3 runs had zero wave-3 kills (vacuous — reported, not hidden). The dominant absence channel (f, 82%) got its named mechanism (the hall door). Not re-scored.
2. **Multi-monster fights share one damage table.** The 4 d150 "strike" kills (leadfeast-s63305) are one 4-monster fight: 1 fight-start, 104 hits, 11,332 scholar damage, the same fight-level table attached to all 4 kill rows (same as killdisc's convention). Channel attribution is per-fight-consistent, so the census is unaffected — but per-kill damage reads on multi-monster fights double-count the fight. Proposed for the NEXT run: attach per-monster damage (key the tbDamage wrap by target monster key as well as fight id).
3. **No balanced panel (§15).** The panel is the before/after instrument and this arm is a diagnostic census — there is no "after." Documented here, not skipped silently.
4. **Seeds.** 63301–63308, verified filename-unused in evidence/2026-10-18/perseed-*/ before the sweep. 16/16 runs, 0 errors, 0 instrument errors, 39/39 kills attributed, 0.0% unattributed.
5. **Determinism.** The instrument proof's DET gate pins install-vs-not byte-identical; the transcript probes re-ran deterministically (d107 Greta's death reproduced exactly).
6. **Raid-shape hypothesis.** Pre-registered as open; verdict: not confirmed as a presence effect (refuted directionally on this corpus). The damage-share gap is small-n noise from individual joiners.

## Out-of-arm findings (not chased)

Filed to hidden_files/sim-findings.md:
1. THE HALL DOOR as the veteran-production blocker (32/39 wave-3 kills channel f; 75/90 same-node dispositions door-blocked) — the 7th production attempt's lever: get companions outside when wave-3 fights start (follow-the-scholar-out? the watch materializing? door-side-aware join rule?). steve-call: is the door working as designed (Steve 2026-10-04: "Havens are the ONLY unbreakable structures" — the hall as shelter is canon) or is the scholar-meets-it-alone shape the intended fiction?
2. Stale grid positions blind the join rule (14/90 dispositions: outside, same side, no positions[rid]) — ensureVillagerPositions staleness after npcNodeTravel/door transitions. Possible small fix, needs a worker.
3. The d90 "let the watch drive it off" beat promises a watch that never materializes as fighters — design blank (fiction-beat vs systems gap).
4. 302 wave-3+ villager field engagements, 0 villager kills — presence without capability in the field; the field-fight capability gap is a separate lever.
5. Naran (helpful AI) is the veteran-production positive control: present + in range → kills → survives → keeps contributing. Any presence lever should be measured on Naran-shaped outcomes (living veterans at end of run), not just join counts.

## Convergence

**DIAG-GO 16/16.** The diagnostic is complete on current master: companions are absent from wave-3 killing fights because the hall door excludes them from the join rule (82% channel f; 75/90 door-blocked dispositions; scholar outside in 30/32). The veteran question has its mechanism. No game change: zero src/js; instrument + sweep + analysis + transcripts only. The axis stays scale-onramp: the named next is a presence lever against the door (7th production attempt), pending Steve's call on whether the door is working as designed.

## Wall numbers (coordinator)

16 runs: national 8/16, table 13/16, won 0/16, wave4 11/16, wave5 0/16, median survival 169d (max 180; 11 village-lost, 5 survived).

## Files

- scripts/compresence-instrument-20261018.js — the COMPRESENCE read-only instrument (fight-start presence census, kill-time channel attribution, per-source tbDamage, fieldFight raid capture; proof 42/42)
- scripts/compresence-sweep-20261018.js — standalone 16-run sweep driver (sweep-compare.js untouched)
- scripts/compresence-analyze-20261018.js — attribution table, channel totals, join-rate context, mechanism breakdown, anomaly probes, DIAG-GO check
- scripts/compresence-transcripts-20261018.js — sense-testing transcript probe
- scripts/test-compresence-20261018.js — instrument proof (42/42 GREEN)
- evidence/2026-10-18/perseed-compresence/ — 16 per-seed JSONs + _summary.json
- evidence/2026-10-18/compresence-transcripts/ — belongfeast-s63303.txt (7 kills), leadfeast-s63303.txt (Greta's fight), leadfeast-s63304.txt (Naran's kill)
- evidence/2026-10-18/sim-compresence.md — this file
- ZERO src/js changes
