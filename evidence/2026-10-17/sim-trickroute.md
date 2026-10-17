# sim-trickroute — routed-via-trick as a distinct outcome class (flesh-out loop DIAGNOSTIC, 2026-10-17)

**Run:** flesh-out loop DIAGNOSTIC arm sim-trickroute, run_id fleshout-20261017-061313, axis scale-onramp (blocking).
**Type:** TELEMETRY-ONLY DIAGNOSTIC CLASSIFIER. ZERO src/js changes. ZERO scripts/policies changes. No new sims — the classifier reads the committed trickshape 16-seed census (`evidence/2026-10-17/perseed-trickshape/`, the same 8 fresh seeds [1901–1908] × {leadfeast,belongfeast}, 180d death-aware, pre-seat SEATDRIVE=0 substrate) and classifies every performed-trick (fight,mid) row from EXISTING telemetry. New files: scripts/trickroute-20261017.js + scripts/test-trickroute-20261017.js + this evidence file ONLY.
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read (§"Monster counters"); evidence/2026-10-17/sim-trickshape.md read (the naming parent); evidence/2026-10-16/sim-counterwire.md read (the trick-game context + the w3+ resolution-metric revision that this arm parallels). No new canon invented.
**Lane:** game.js is loop-B's file this run (sim-phantomfood-b claim live) — NOT touched, not even read for edits. Read-only code inspection only.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the formal classification run)

**Question:** sim-trickshape's verdict was "(c) nothing — tricks convert losses into flights; perf→attr gap = kill-attribution blindness to trick-driven disengagement" and named as next: "routed-via-trick as distinct outcome class, telemetry-only." Can the existing telemetry distinguish a trick-driven disengagement from a generic flight, so the funnel's kill-attribution channel gets its complement class — or is the substrate blind to it?

**The resolution-window definition (honest):** "routed-via-trick" = the fight ended in monster disengagement where a trick fired in the resolution window and no killing blow landed. The window is defined as **the whole fight**: `trickLogByMid` entries are bare kind strings (`src/js/game.js:30608`: `.push(ctr.kind)` — no round stamps), so a terminal sub-interval of the fight is NOT expressible on this telemetry. Concretely, per (fight,mid) row with perfs non-empty:

1. **killed** — `species_killed=1` (the trick-bearing species died; whether or not kill-attributed).
2. **routed-via-trick** — `species_killed=0`, `kill_attributed=0`, `result='routed'`.
3. **fled** — `result='fled'` (player flight; the scholar fled).
4. **other** — everything else (e.g. `result='lost'`).

Precedence is in that order. `result='routed'` is engine-native: `tbEnd(monstersAlive ? 'routed' : 'won')` (game.js:40202) — no monster still fighting, but at least one alive (fled/driven off). Every `result` value in the census is one of won/routed/fled/lost, so the four classes are exhaustive by construction.

**Substrate honesty (written before classification, testable):** this classifies routed-on-this-substrate, a PROXY. Two conflations live inside `result='routed'` and the classifier cannot see through them:
(a) the engine's DISENGAGE rule (break-it turtle 2026-10-08: monsters beyond striking distance, non-chasers — player walks away) also ends fights as 'routed' — monster-driven disengagement vs player-walk-away are indistinguishable at the row level;
(b) within the fight, the trick firing vs the disengagement cannot be time-ordered (no round stamps) — a trick performed in a fight that then routed on attrition/morale classifies as routed-via-trick even if the trick was incidental.
The sense-reads (2–3 routed fight transcripts) sample-check causality in the fiction; where they read as noise, that's reported as a substrate finding, not smoothed over. If `result='routed'` never co-occurs with performed tricks, or the fields above are absent, that is a MISS with the missing field named.

**Universe:** every (fight,mid) row with perfs non-empty in the 16 per-seed trickshape JSONs = the 106 performed rows from sim-trickshape (the TB path; the funnel's perf→attr gap was the TB funnel's 98→56). The field-AI path (656 villagerTrickAction fires) has no per-fight outcome telemetry in the committed JSONs (no per-mid field-fight rows) — routed-via-trick is NOT classifiable there on this substrate; reported as a substrate finding below, not hand-classified.

**Lineage note:** an exploratory partition check of the committed per-seed JSONs (result × species_killed × kill_attributed on performed rows) was done to verify the substrate fields exist before writing the classifier. The published numbers come from the formal classifier run below, not the exploratory check.

**PRIMARY (diagnostic GO, binding):** 100% of trick resolutions classified into the four classes across the 16-seed sample (every performed row carries one of killed / routed-via-trick / fled / other; zero unclassifiable rows). A row left unclassified = instrument miss = NO-GO, never re-scored.
**SECONDARY (report-only):** routed-via-trick share of performed rows; how much of the trickshape perf→attr gap the new class closes; wave distribution of routed outcomes; kind distribution of routed rows.
**GO:** primary met → report the routed share, the gap-closure, and name the next honestly. **MISS:** substrate gap → report exactly which telemetry field is missing.
**Gates before spend:** proof RED→GREEN on fixtures (all four classes + precedence edges) · det-gate: classification is read-only — input deep-equal before/after, two runs byte-identical output (post-hoc, so the gate is trivially verifiable and is verified) · SMOKE: classifier runs on the real 16 files without error.
**Guardrails:** none (telemetry-only; nothing fires, nothing changes, wall metrics untouched by construction).

**Deliverable:** the classification verdict (does routed-via-trick exist as a telemetry-distinguishable class), the routed share, the gap-closure number, 2–3 sense-reads, village assessment, blanks filled or documented.

## Metric review

- **PRIMARY (100% classification of all performed-trick rows) was met: 106/106, 0 unclassified, GO.** It bound the run: it forced the precedence-ordered classifier and the fuzz-matrix coverage proof (all result × species_killed × kill_attributed combinations map to a class). Zero rows left without a class.
- **No re-scoring.** The classifier's four classes and precedence order were fixed in the header before the formal run; the published numbers are the classifier's output, not an exploratory re-partition. The exploratory check (done to verify substrate fields existed) is disclosed in the header, not used as the measurement.
- **The SECONDARY reads exactly as pre-registered** (routed share, gap closure, wave/kind distributions). The field-AI path routed-via-trick was declared unclassifiable in the pre-reg; it stayed unclassifiable — reported as a substrate finding, not hand-filled.
- **Post-hoc det-gate nuance:** with no new sims, "read-only — no trajectory change" reduces to input-immutability + double-run byte-identity. Both were asserted (16/16 proof): inputs deep-equal after classification; two runs byte-identical. The committed per-seed JSONs on disk carry no `_file` contamination (verified: `"input rows still have no _file contamination on disk: true"`).
- **Metric honesty on causality:** the routed-via-trick class on this substrate is a PROXY (trick fired + rout followed + no kill), not a proven causal link. The pre-registered conflations (a) DISENGAGE-rule walk-aways and (b) non-time-orderable attrition routs both hold: the sense-reads show 2 of 3 reads as cleanly trick-driven (offer_food, keep_distance) and 1 as ambiguous (sidestep/rut_king — 10 rounds of brawling, rout reads as attrition). Proposed revision for the NEXT run (not this one): round-stamped trickLog entries (game.js:30608 `push(ctr.kind)` would need `{kind, round}`) would let a strict "trick fired in the last 2 rounds" window distinguish incidental tricks from drivers. That edit lives in game.js — loop-B's lane this run — so it is named, not built.

## Results

Classifier run 2026-10-17 on the committed trickshape census (16 files, same 16-seed sample, zero new compute): `node scripts/trickroute-20261017.js evidence/2026-10-17/perseed-trickshape`.

### PRIMARY: GO — 100% classified (106/106)

| class | n | share of performed |
|---|---|---|
| killed | 63 | 59.4% |
| **routed-via-trick** | 24 | 22.6% |
| fled | 0 | 0.0% |
| other (all `lost`) | 19 | 17.9% |

The telemetry partition is CLEAN — no overlaps, no ambiguities, no missing fields:
- every `result='routed'` performed row has `species_killed=0`, `kill_attributed=0`, `p_survived=1` (24/24);
- every `result='won'` performed row has `species_killed=1` AND `kill_attributed=1` (63/63 — the kill-attribution channel never sees a won-but-unattributed performed fight in this sample);
- every `result='lost'` performed row has `p_survived=0` (19/19);
- no performed row ended `result='fled'` — on this substrate a scholar who performs a trick never flees; they win, rout, or die.

### SECONDARY: the numbers

- **routed-via-trick share: 22.6% (24/106).** Routed rows: mean 4.2 rounds, mean HP cost 21.3 (min 0, max 73), all p survived.
- **Wave distribution: w1 18, w2 6.** All routed tricks are waves 1–2 — the counter system is canonically waves 1–2 only (waves 3–5 deliberately counter-less); no routed row involves a wave the trick system doesn't cover. Consistent.
- **Kind distribution:** strike_lead 14, keep_distance 5, wait 2, sidestep 2, offer_food 1. The disengagement-shaped kinds dominate (strike_lead's fiction is literally pack-breaking; keep_distance's is lure-refusal).
- **Gap closure: 24/43 = 55.8%.** Trickshape's perf→attr gap (43 unattributed performances: 24 routed + 19 lost) is now fully CLOSED as a measurement gap: kill-attributed (63) + routed-via-trick (24) + other-lost (19) = 106/106 = 100% of performed rows. No "unexplained" bucket remains. The 19 losses were already mechanized by trickshape (wait attrition pockets, the lethal ducks fight); the 24 routs are this arm's contribution.

### The verdict

**routed-via-trick EXISTS as a telemetry-distinguishable outcome class.** It is not a guess laid over the data: the engine already ends these fights as `result='routed'` (`tbEnd(monstersAlive ? 'routed' : 'won')`, game.js:40202), and the four classes partition the performed rows without remainder. The kill-attribution channel's blindness (trickshape verdict (c)) now has its complement: a kill ledger row + a rout ledger row, and together they see every trick-shaped fight outcome.

Two honest boundaries travel with the verdict:
1. **TB path only.** The field-AI path's 656 trick fires have no per-fight outcome telemetry in the committed JSONs — no per-mid field-fight rows, no field `result` values. Routed-via-trick on the villager path is not classifiable on this substrate. That's the substrate gap named (not a failure — the classifier refuses to hand-fill).
2. **Proxy, not proven causality.** Within 'routed', monster-driven disengagement and the engine's DISENGAGE walk-away rule are indistinguishable, and trick-vs-attrition cannot be time-ordered (trickLog entries carry no round). The sense-reads show the proxy is usually right (2/3 cleanly trick-driven) and sometimes generous (1/3 reads as attrition).

## Sense-testing (transcript reads)

**Read 1 — the buy-off (belongfeast-s1908 seq21, d158, lockpick_raccoon, offer_food, routed, 1 round, 0 HP cost):** "🖐️ Its hands blur — and suddenly it's holding your Phase blade! It's already running." The scholar tosses Maypop: "You toss Maypop. It CANNOT resist — drops your Phase blade mid-scamper and stuffs its cheeks instead." / "📺 +10 style — bought off the thief". One round, no HP lost, stolen blade recovered. The disengagement IS the trick's mechanism — there is no other causal candidate. Routed-via-trick reads as cleanly as it gets.

**Read 2 — the lure refused (belongfeast-s1901 seq39, d142, voice_mimic_radio, keep_distance, routed, 7 rounds, 73 HP cost):** the radio baits with mimicked voices ("PLEASE. Don't leave me out here.") and the fiction teaches the counter: "Don't walk toward the crying — that feeds it. Stand still, resist, and the act breaks." The scholar performs it: "You don't move. The crying stutters... fragments... stops. Silence — then a small, furious crackle of static." Then: "The Big Big breaks and runs!" Damage was done (bleeding, 55 damage dealt) so attrition contributes, but the trick-beat → rout sequence is explicit and the fiction names the mechanism. Reads as trick-driven.

**Read 3 — the attrition rout (belongfeast-s1908 seq2, d15, rut_king, sidestep, routed, 10 rounds, 55 HP cost):** 10 rounds of brawling — strikes for 8–13, the king bleeding and bellowing, Gilberto's companion dialogue, the scholar slipping aside once ("You slip aside — it misses clean. (footwork)"). Then: "The Rut King breaks and runs!" The single sidestep performance is one action among ~20; the rout reads as cumulative attrition/morale — the king bled out its willingness to fight. The classifier labels it routed-via-trick (trick fired + rout followed), and on the row telemetry that's all we can say — but the transcript does NOT show the trick driving the outcome. This is the proxy's generosity made flesh, and it stays in the record as the honest counterweight to reads 1–2.

**Strike_lead note (the dominant routed kind, 14/24):** trickshape's sense-read 4 (leadfeast-s1902 d19 hushwolf) already established this fiction as clean — "The lead staggers — and the pack's silence shatters into yips and snarls. Coordination broken. (WOUND THE LEAD: it worked.)" → "The Hushpuppy breaks and runs!" Not re-read; referenced.

Verdict from the reads: 3 of 4 reads (offer_food, keep_distance, strike_lead) show the trick as the legible driver of the disengagement — the rout is the trick's designed outcome, narrated as such. The 4th (sidestep) shows the proxy over-attributing. The class is real; its row-level causality is a proxy.

## Findings / named nexts

1. **The named next is DONE:** routed-via-trick exists as a telemetry class (63/24/0/19 partition, 100% coverage). The funnel's kill-attribution channel now has its complement; the perf→attr gap is closed as a measurement gap (55.8% of it was the rout class; the rest were mechanized losses).
2. **NEXT (telemetry, named not built):** round-stamped trickLog entries (`{kind, round}` instead of bare kind strings at game.js:30608) so a strict "trick fired in the last 2 rounds" resolution window can separate incidental tricks (read 3) from drivers (reads 1–2). game.js is loop-B's lane this run (sim-phantomfood-b claim live) — NOT touched. Coordinator call.
3. **NEXT (telemetry, named not built):** the field-AI path needs per-fight outcome rows (a fieldfight beat with mid, trick actions, and mFlee/vFlee outcome) before routed-via-trick is classifiable for villager fights. The counterwire metric-revision already proposed "mFlee/vFlee with ≥2 trick actions in the fight's trickLog" — this arm's class slots into that definition once the field telemetry exists.
4. **Filed to sim-findings (not chased):** the moderator verb-variation policy gap (#451, trickshape's finding) — the `wait` kind's 11/19 loss concentration is substantially that policy blank, not trick lethality. Sibling lane.

## Blank-fill record

- FILLED (instrument): the routed-via-trick classifier — scripts/trickroute-20261017.js (precedence-ordered, exhaustive by construction) + proof scripts/test-trickroute-20261017.js (16/16 GREEN: all four classes, precedence edges, read-only det-gate, 100% coverage fuzz matrix).
- FILLED (measurement): formal classification of the full trickshape 16-seed census — 106/106 performed rows classified (63 killed / 24 routed-via-trick / 0 fled / 19 other), routed share 22.6%, gap closure 55.8%, wave/kind distributions.
- FILLED (sense): 3 routed-via-trick transcript reads (offer_food clean, keep_distance strong, sidestep ambiguous) + the strike_lead cross-reference.
- DOCUMENTED (substrate, not fixed): the proxy limitation (DISENGAGE walk-away conflation, no round stamps), the field-AI path gap, the game.js round-stamp edit named for a future lane.
- BACKLOG: marking the trickshape "attribution for disengagements" named next claimed→fixed (line added below; it had no backlog entry — the blank was documented in the trickshape evidence, not the backlog).

## Village assessment

The villages that play the trick game look like villages that have learned how to END fights, not just survive them. On the trickshape substrate (pre-seat, competent courtship policies), 106 trick performances across 16 runs split three ways: 63 kills (59%), 24 walk-aways (23%), 19 deaths (18%). The scholar who performs a trick never flees — that reads like a person who committed to the move and saw it through, for better or worse.

Who thrives: the strike_lead pack-breakers (14/16 of their performances end with the monster running and the scholar alive — the hushwolf's fiction is a weapon), the keep_distance lure-refusers (the radio's crying breaks on a scholar who stands still), the offer_food bargainers (a raccoon bought off with a Maypop, the stolen blade dropped mid-scamper). Who dies: the wait-attritionists — 11 of the 19 losses are `wait`, the moderator's disciples who know the answer ("hold still, watching") and then strike into the mute anyway. That's a person who knows the right thing and can't stop doing the wrong thing under pressure — the most human-shaped death in the census.

What's missing: not trick lethality, not conditions, not even attribution anymore — the ledger now sees every outcome class. What's missing is discipline under the mute (policy lane, #451) and the field path's outcome telemetry (measurement lane). The 656 villager trick-fires tell us the village fights like it knows things constantly; this arm can't yet say how many of those ended in a trick-driven rout versus a brawl — that's the next substrate to build.

Convergence: scale-onramp stays converging. This arm moved no wall numbers (telemetry-only by design; none could) — it closed a measurement gap, which is infrastructure for the lever work, not a lever itself.

