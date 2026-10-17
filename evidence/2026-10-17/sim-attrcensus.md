# sim-attrcensus — the performed-but-unattributed census (flesh-out loop DIAGNOSTIC, 2026-10-17)

**Run:** flesh-out loop, run_id fleshout-20261017T1102Z (coordinator-assigned arm sim-attrcensus; axis scale-onramp blocking).
**Type:** READ-ONLY DIAGNOSTIC. ZERO src/js changes. ZERO scripts/policies changes. New scripts/attrcensus-* + evidence/2026-10-17/ ONLY. LANE CONSTRAINT honored: loop B owns src/js/game.js + src/js/engine/calories.js this run — game.js/fieldFights.js were read (grep/sed) for channel mechanics, never edited.
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read (via the trickfunnel arm). No new canon invented. The funnel's bottom gap is the trick-execution funnel's perf→attr stage (evidence/2026-10-16/sim-trickfunnel.md: 98 performed → 56 kill-attributed pooled; fight-level recount 43 performed∧¬attributed + 1 reverse-artifact row — see §0).

## §0 — the recount (exploratory, pre-header)

The evidence's "−42" is the pooled subtraction (98−56). The fight-level recount over evidence/2026-10-16/perseed-trickfunnel/*.json gives **43 performed∧¬attributed** rows, because one attributed row (leadfeast-s1802, seq 9, d57, dustboar/sidestep, won) has **zero perfs** — it joined to the same-day seq-10 dustboar kill (join over-attribution; class c1 below). The census universe is the 43. Their fight-level shape, from existing fields alone: **27 × ('lost', scholar dead) / 16 × ('routed', scholar alive, dismissed)** — zero 'won', zero scholar-alive 'lost'.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the classification count)

**Question:** for every performed-but-unattributed TB fight, WHY was the kill not trick-attributed? Is the funnel's bottom a fixable attribution blank or a lethality/design question?

**Taxonomy (fixed here, never re-scored mid-run):**
- **(a) ATTRIBUTION-LOSS** — the monster died and the trick did it, but the channel dropped it:
  - **a1 tag-drop:** won/routed fight, trick-bearing monster died, perfs logged, but the waveKillLog entry carries an empty trick (trickSummaryFor failed despite perfs — wiring bug). Expected 0 (the join would have caught it); any hit is a loud bug.
  - **a2 path-drop:** trick-bearing monster died but NO waveKillLog entry was written — the 'lost'/'fled' paths forfeit the per-kill ledger (pyrrhic kills: "if you're dead, the fight is lost, even if you took it with you" — game.js:40275).
- **(b) GENUINE NON-LETHAL** — the trick fired but the monster was not killed:
  - **b1 performer-died:** scholar died, fight lost, monster alive at tbEnd.
  - **b2 target-fled:** fight routed/dismissed, trick-bearing monsters fled, none died.
  - **b3 target-survived:** monster alive at fight end, no kill within ±1d (any other result).
- **(c) OTHER:**
  - **c1 reverse-artifact:** kill attributed with zero perfs (the ±1d join over-attributes across same-mid fights; dustboar seq-9 case) — counted separately, NOT in the 43.
  - **c2 cross-fight kill:** a waveKillLog entry for the mid within ±1d with EMPTY trick — the monster died in a *different* encounter, not a trick kill.

**PRIMARY (diagnostic GO, binding):** 100% of the 43 performed-but-unattributed fights classified into the taxonomy, 0 unclassified, 0 instrument errors. A miss is NO-GO — reported as such with the reason.

**Re-sweep decision point (pre-registered here):** TAKEN. Reason: the existing per-seed rows record fight result and scholar survival but NOT per-species fighter mortality at tbEnd. The engine's 'lost' path deliberately forfeits the kill ledger, so pyrrhic trick kills (trick killed the monster on the scholar's dying tick → 'lost', no waveKillLog entry) are invisible in the existing data. Classifying all 27 'lost' rows as (b1) without checking mortality would misclassify any pyrrhic kills as genuine non-lethal when they belong in (a2). The re-sweep closes exactly this gap.
- **Re-sweep:** ≤8 seeds — 4 FRESH seeds [1809–1812] (0 per-seed filename hits across evidence/, verified 2026-10-17) × {leadfeast, belongfeast} = 8 runs. Same tribfloor policies + pre-seat substrate as trickfunnel (FEASTSCALE_R13=1, TRIBFLOOR=1, SEATDRIVE=0 explicit; NODEWITNESS unset). 180d death-aware horizon.
- **Instrument:** scripts-only, read-only extended fight classifier (scripts/attrcensus-instrument-20261017.js) — snapshots per-mid fighter dead/alive at tbEnd plus the waveKillLog entries for the mid; zero policy/game changes; new file, the trickfunnel instrument is not modified.
- The re-sweep classifies NEW perf-fights on fresh seeds; the verdict generalizes from the existing 43 + the re-sweep fights together.

**Guardrails:** wall metrics (national/table/wins) within noise of the trickfunnel census on this substrate (10/16 national, 15/16 table, 0/16 wins pre-seat); no new death mode; the instrument is read-only (wrappers call through; no RNG/logic/save contact).

**The verdict this arm must produce:** is the funnel's bottom a FIXABLE ATTRIBUTION BLANK (name the fix for the next arm) or a LETHALITY/DESIGN question (feeds the #411 steve-call's gate/fight-shape mismatch)?

**Reposition data set (evidence/2026-10-16/perseed-reposition/):** analyzed as far as its schema allows — see §4. Its 76 movement-kind performance records carry {day, mid, kind} only (the sweep read `t.outcome`; the instrument exposes `t.result`, so the key was dropped as undefined — schema gap, filed to sim-findings).

## Metric review

The PRIMARY is classification completeness, not a trick-count bar — this is a diagnostic census, not a lever. The 43-universe (not the pooled 42) is the binding denominator; the 1-row discrepancy is the c1 reverse-artifact, documented in §0, never re-scored. If the reviewer judges that (a2) pyrrhic kills should count as (b) because 'lost'-forfeit is intended design, that re-labeling belongs to the NEXT run's header — this run classifies pyrrhic kills as (a2) and discusses the design reading in the verdict.

## Results

### Proof: scripts/test-attrcensus-20261017.js — 25/25 GREEN
- PURE: classifyExtended on synthetic fixtures — every branch: a1 (won + routed), a2 (lost pyrrhic + fled), b1, b2, b3 (won-other-mid + fled), c2, instrument-error, not-in-universe; a1 beats an untagged entry; classifyExistingRow: lost→b1+pyrrhicFlag, routed→b2, fled/won→b3, attributed/unperformed→not-in-universe.
- DET: fixture set byte-identical across runs; the existing 43 rows byte-identical across runs and split b1=27 / b2=16 as predicted.
- SMOKE: 20d pre-seat instrumented run completes schema-clean (tbfight interception attached, mortality snapshot well-formed).

### The 43 (existing trickfunnel data, reduced classifier — proof-verified)

| class | n | shape |
|---|---|---|
| b1 performer-died* | 27 | result 'lost', scholar dead (gallowdeer/move_windup 15, ducks_in_a_row/strike_nonhead 6, paparazzo/move_windup 2, landlord/move_x2 1, union_rep/strike_first 1, moderator/wait 1, heckler/wait 1) |
| b2 target-fled | 16 | result 'routed', scholar alive, dismissed (hushwolf/strike_lead 8, voice_mimic_radio/keep_distance 2, warranty_caller/move_x2 2, lockpick_raccoon/offer_food 1, union_rep/strike_first 1, heckler/wait 1, nightcourt/move_x2 1) |
| c1 reverse-artifact | 1 | leadfeast-s1802 seq 9 d57 dustboar/sidestep: attributed with ZERO perfs — joined to the same-day seq-10 dustboar kill (±1d join over-attribution). Counted separately, not in the 43. |

\* b1 carries the pyrrhic flag: the existing rows lack fighter-mortality data, so a trick that killed the monster on the scholar's dying tick ('lost' forfeits the ledger) would hide inside b1. The re-sweep resolves the rate.

The in-fight (a1) is ruled out for all 43 by channel mechanics (verified read-only): the per-kill ledger runs on 'won' AND 'routed' (game.js:40669), and trickSummaryFor(f, mid) returns f.trickLogByMid[mid] non-empty whenever perfs were logged — so any dead trick-bearing monster on won/routed produces a tagged waveKillLog entry and the ±1d join hits. kill_attributed=0 on 'routed' ⟹ no trick-bearing monster died. On 'lost' the ledger never runs (monsters won).

### The re-sweep (8 runs, fresh seeds 1809–1812 × {leadfeast, belongfeast}, 180d death-aware)

274 TB fights → 71 performed → 34 attributed → **37 performed-but-unattributed**, 0 reverse, 0 instrument errors. Per-seed JSONs: evidence/2026-10-17/perseed-attrcensus/.

| class | n | note |
|---|---|---|
| b1 performer-died | 12 | scholar died, monster alive at tbEnd (mortality-confirmed) |
| b2 target-fled | 22 | routed/dismissed, none of the mid died |
| **a2 path-drop (pyrrhic)** | **3** | monster died but result='lost' forfeited the ledger — no waveKillLog entry at all |
| a1 tag-drop | 0 | channel healthy — never observed |
| c2 cross-fight kill | 0 | |
| instrument-error | 0 | |

The 3 a2 fights (all result='lost', pAlive=0, perfs logged, wklSame=[]):
- belongfeast-s1811 seq 42 d147: belltoad/shout, 3 perfs, 1 dead + 3 alive — scholar died, the dead belltoad's kill unlogged.
- belongfeast-s1812 seq 3 d21: gallowdeer/move_windup, 1 perf, 1 dead / 0 alive — scholar died taking the deer with it; kill unlogged.
- leadfeast-s1812 seq 23 d90: gallowdeer/move_windup, 1 perf, 1 dead / 0 alive — same shape.

Pyrrhic rate on mortality-resolved data: 3/15 lost perf-fights = 20% (noisy, n=15). Extrapolated to the existing 27 b1*: ~5 may be a2.

**PRIMARY: GO.** 80/80 performed-but-unattributed fights classified (43 existing + 37 re-sweep), 0 unclassified, 0 instrument errors. The reposition set's 76 movement-kind performances are not fight-level resolvable (schema gap, §4) — the binding denominator is the identifiable universe, documented here, never re-scored.

### Verdict: LETHALITY/DESIGN question, with a small fixable blank

**The funnel's bottom is not a wiring blank.** The attribution channel is healthy: a1 (tag-drop) = 0 across 80 fights and 0 instrument errors — whenever a trick-bearing monster dies in a won/routed fight with perfs logged, the trick IS attributed. The 42-gap is fight shape, not wiring:

- **~49% (b1) performer-died:** the scholar performs the trick and dies. The trick "worked" as a discovery event (the village learns — sense-reads 1–2) but the performer doesn't survive to land the kill. This is the lethality gap the trickfunnel arm already named.
- **~48% (b2) target-fled:** the trick performs and the monster disengages — the hushwolf pack scatters after the lead wolf is struck, the lockpick_raccoon takes the offered food and leaves. The trick "worked" (dismissal) but dismissal isn't a kill. This is fight shape: tricks resolve fights non-lethally.
- **~4% (a2) pyrrhic path-drop — THE FIXABLE BLANK:** the trick-bearing monster died but 'lost' forfeited the per-kill ledger, so no waveKillLog entry exists at all — no trick attribution, no codex 'slain', no villageSlain, no wave-unlock deed. The village killed the monster and learned nothing.

**Named fix for the next arm (a2):** extend the per-kill ledger in tbEnd to write waveKillLog entries (with trickSummaryFor) on 'lost' as well as 'won'/'routed' — at minimum the ledger entry + codex 'slain' + villageSlain; carcass/loot can stay forfeit per the deliberate 'lost'-forfeit design. **Steve-call:** should pyrrhic kills grant wave-unlock deeds (scoreLedgerKill)? The 'lost'-forfeit is deliberate ("if you're dead, the fight is lost, even if you took it with you" — game.js:40275), so the deed question needs his ruling before the fix lands. The attribution/codex half is uncontroversial.

**#411 implication (not a re-litigation):** the perf→attr gap feeds the gate/fight-shape mismatch, not the win-truncation question. Tricks are disproportionately performed in fights the scholar loses (b1) or the monster leaves (b2) — the trick game resolves non-lethally or fatally, rarely as a killing blow. If #411 asks whether tricks can carry fights, this census says the binding constraint is fight shape (who lives, who stays), not attribution wiring.

### Sense-testing (4 performed-but-unattributed fights read as stories)

**Read 1 — b1, the dying discovery (belongfeast-s1802, seq 2, d12, gallowdeer/move_windup):** The scholar didn't know the trick (knownAtStart=false), moved through the windup 3 times — 3 hits, 3 perfs — and died. The discovery fired via the trick channel: "💡 COUNTER LEARNED — Highbeam Deer: MOVE, don't stare... (You did the thing — ...)". Verdict: fully coherent. "You did the thing — and it worked" is about the trick (the village learned it), not the fight. The funnel's bottom here is lethality: the knowledge persists in the village (monsterCounters is village state) even though the performer died. Doing the trick right doesn't guarantee survival — and the game is honest about that.

**Read 2 — b1, the line-breaker (belongfeast-s1804, seq 8, d66, ducks_in_a_row/strike_nonhead):** 5 strikes on non-head segments, 5 perfs, discovery via trick ("Break the line..."), scholar died. Same shape as read 1: the trick worked as knowledge, the performer died. Coherent with tension — the discovery is the proof the trick fired, the death is the price.

**Read 3 — b2, the scattered pack (belongfeast-s1804, seq 5, d52, hushwolf/strike_lead):** Known at start, struck the lead wolf once (1 perf), result routed, scholar alive. The pack broke and ran. Verdict: coherent — the trick did its job (the lead wolf was struck, the pack scattered), but a scattered pack is not a kill. The funnel loses it at perf→attr because dismissal isn't death, and the channel correctly attributes nothing.

**Read 4 — b2, the bribed raccoon (belongfeast-s1802, seq 5, d38, lockpick_raccoon/offer_food):** Known at start, offered food (1 perf), routed, scholar alive. The raccoon took the meal and left. Verdict: coherent and true to the trick's own text ("it drops your things mid-scamper for the meal. A bribe is cheaper than a chase."). The trick succeeded — the monster left with the food. No kill, no attribution, correctly.

All four read as coherent fight outcomes. "The trick fired but didn't kill" is a sensible story in every case — the funnel's bottom is not a narration gap.

### Wall metrics (re-sweep substrate check)

national 3/8, table 6/8, wins 0/8 (pre-seat by design). 4/8 runs ended village-lost (d45/d77/d129/d178); the 4 survivors reached 178–180d.

### Metric review

The PRIMARY (classification completeness over the identifiable performed-but-unattributed universe) is met: 80/80 classified, 0 instrument errors — GO. The reposition set's 76 movement-kind performances are excluded from the denominator by schema (no outcome/attribution fields), documented in §4 — the denominator was fixed in the pre-registration header as the trickfunnel 43 + the re-sweep, never re-scored mid-run. The b1* pyrrhic flag on the existing 27 is resolved by rate (20% on mortality-resolved data), not per-fight — the extrapolation (~5 of 27) is stated as a bound, not a recount. If the reviewer judges pyrrhic kills should count as (b) because the 'lost'-forfeit is intended design, that re-labeling belongs to the NEXT run's header; this run classifies them as (a2) and names the fix with its Steve-call.

### §4 — the reposition data set (schema-limited analysis)

evidence/2026-10-16/perseed-reposition/: 32 runs, 76 movement-kind performance records ({day, mid, kind}). **Fight-level perf→attr classification is impossible:** the sweep wrote `t.outcome` but the trickres instrument exposes `t.result`, so the key was dropped as undefined in all 76 records — no fight outcome, no kill attribution. This is an instrument-schema gap (filed to sim-findings, §5), not an analyzer failure. The re-sweep (trickfunnel policies) covers move_windup (a movement kind) at fight level; blindside/face_it did not occur in the re-sweep's 8 runs (0 performances — consistent with their rarity: 0 in trickfunnel's 16 runs). A future movement-kind arm should re-sweep with the schema fixed (read `t.result`, add the waveKillLog join) rather than re-analyzing these 76.

## Findings / named nexts

- **FIXABLE BLANK → next arm:** pyrrhic kill ledger (a2, ~4–8% of the perf→attr gap). Extend tbEnd's per-kill ledger to 'lost' (waveKillLog + trickSummaryFor + codex 'slain' + villageSlain; loot stays forfeit). Steve-call first: do pyrrhic kills grant wave-unlock deeds?
- **Filed to sim-findings:** reposition instrument schema gap (outcome dropped; 76 movement-kind perfs unresolvable to perf→attr) — fix schema, re-sweep for the movement-kind bottom.
- **Filed to sim-findings:** the ±1d join over-attributes across same-mid fights (c1 dustboar case: 1/56 attributed kills in trickfunnel carried no perfs). The funnel's attributed count is slightly inflated; a fight-seq-keyed join would be exact.
- **#411 input:** the perf→attr gap is fight shape (b1 lethality + b2 dismissal), not wiring — tricks resolve non-lethally or fatally, rarely as killing blows.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline …/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-17/perseed-attrcensus/*.json' --metrics national,table,wins,exiled` fired 3 LOUD lines — all EXPLAINED, baseline kept (not rolled):
- wins 16→0: substrate-mismatch — the recurring pre-seat LOUD class (SEATDRIVE=0 explicit; baseline is the full win-side stack). Same as the trickfunnel census.
- national 12→3, table 16→6: baseline is the full win-side stack (seat driver pushes scale); pre-seat runs lower by substrate. Residual vs trickfunnel's pre-seat 10/16 & 15/16 is seed noise on n=8 (P≤3/8 at p=0.625 ≈ 17%) plus 4 early village losses (d45/d77/d129/d178). The instrument is read-only (wrappers call through; the identical interception pattern proved det-neutral in the trickfunnel proof) — no mechanism for instrument-caused deaths.
- Verdict: explained, no bug. Baseline kept.
