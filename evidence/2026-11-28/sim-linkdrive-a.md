# sim-linkdrive-a — LEAD-first linkdrive (scalerank §7 arm 2)

**Run:** fleshout-20261128T0815Z, Loop A, axis scale-onramp
**Verdict: GO** (prereg bar (b) met: LEAD realm on 6/8 armed seeds vs 0/8 baseline)
**Prereg:** `evidence/2026-11-28/sim-linkdrive-a-prereg.md` (commit `42bdf6987`)
**Band:** 113501–113508, 150d, death-aware, paired before/after on identical seeds
**Policies:** BASE = `competent` verbatim; ARMED = `scripts/policies/competent-linkdrive-a.js` (543 lines, composes onto competent verbatim, zero `src/js` changes)
**Commits:** prereg `42bdf6987`, tooling `0adb2402b`, proof fix `9a48eb4e1`, evidence/corpus/panel — this commit (see bottom)
**Proof:** `scripts/test-linkdrive-a.js` 52/52 green (incl. analyzer selftest 24/24, 15 policy fixtures, live both-legs 100d seed 113501, 100d determinism byte-identical)

No canon doc covers the scale-rank inputs — scalerank measured them from code; this file does the same and invents no canon.

## §1 The lever played

The competent policy never proposes a link and, on the plain road, never answers a staged counter (`COUNTER_ANSWER` defaults off). Scalerank showed the consequence: every village forms exactly one link in 150 days — a villager raises the idea, the bot accepts — then never another, so no polity ever qualifies and national stays 0/8. The linkdrive policy, once daily after `competent.daily`, does seven things:

1. Answer a pending counter: 'sweeten' if pantry ≥12,000 kcal, else 'walk'. Never 'accept' (accepting bows Haven under another fire — the wrong road).
2. Answer a pending first accord with the gift (2,000 kcal → +10 trust).
3. Answer pending link raises **in conversation** (real `talkTo` turns, `link:accept` only when the raised village is courtship-ready as-primary, deterministic judge prim ≥55; never bare `acceptLinkRaise`, never `link:decline`; at most one raise/day).
4. Propose directly as-primary once/day, **only once the first link has seasoned** (≥1 active link 30+ days at trust 40+), while active Haven-primary subs <3, no counter/accord/national pending, pantry >12,000 kcal, best-known unlinked village with detJudge prim ≥55; 7-day re-ask cooldown after a decline.
5. Tend LEAD links below the seasoned bar weekly, pantry >20,000 kcal (1,500 kcal each).
6. Hold BELONG links (pay tribute in full, honor demands) as a safety net.
7. **Never** answer `pendingNational` / `pendingGlobal`. This arm builds the realm; answering the court is the next arm's job.

What actually fired on the band: direct proposes were rare (4 calls, 4 accepted, 0 countered, 0 declined) — the raises did the work (23 answered, 23 linked). No counter ever staged on either leg, so the counter step never engaged. 16 accords answered, 67 tends paid (100,500 kcal), 0 policy errors.

## §2 Before / after on identical seeds

### Wall numbers

| | BASE (competent) | ARMED (linkdrive) |
|---|---|---|
| Seeds | 8 | 8 |
| Wins | 0 | 0 |
| National reached | 0 | 0 |
| Regional reached | 7 | 8 |
| Table (lesser seat offered) | 7 | 8 |
| Seated | 0 | 0 |
| Median survival | 150d | 150d |
| Max stage reached | 0 on all 8 | 2 on 6/8, 0 on 2/8 |
| Wave-5 bar seeds | 2 | 4 |
| Wave-4 bar seeds | 6 | 7 |
| Total deaths | 85 | 119 |
| Death classification completeness | 1.000 | 1.000 |

### Paired table (per seed)

| Seed | Base days / rank / stage | Armed days / rank / stage | Realm (max seasoned LEAD subs) | National beat staged | Survival Δ |
|---|---|---|---|---|---|
| 113501 | 50d / village / 0 | 70d / regional / 2 | 3 (held 9d) | d64 | +20 |
| 113502 | 150d / regional / 0 | 150d / regional / 2 | 3 (held 77d) | d75 | 0 |
| 113503 | 72d / regional / 0 | 150d / regional / 2 | 3 (held 18d) | d85 | +78 |
| 113504 | 150d / regional / 0 | 150d / regional / 0 | 2 (never 3) | — | 0 |
| 113505 | 150d / regional / 0 | 150d / regional / 0 | 2 (never 3) | — | 0 |
| 113506 | 150d / regional / 0 | 150d / regional / 2 | **4** (held 92d) | d68 | 0 |
| 113507 | 150d / regional / 0 | 147d / regional / 2 | 3 (held 82d) | d71 | −3 |
| 113508 | 150d / regional / 0 | 150d / regional / 2 | 3 (held 25d) | d74 | 0 |

**Primary bar (b):** max simultaneous seasoned LEAD subs ≥3 on **6/8** armed seeds vs **0/8** baseline — bar (≥4/8) met. **Bar (a):** national on ≥2/8 — 0/8, not met (expected: the policy never answers the beat by design). **Guards:** (c) median survival 150 vs 150, ratio 1.0 ≥ 0.8 ✓; (d) starvation deaths 6 armed vs 4 base, ≤ 4+2 = 6 ✓ — **passed by zero margin**. No per-seed regression worse than −30d (worst −3, seed 113507). Pool floor: 6/8 baseline seeds alive day 80 (floor exactly) / 7/8 armed. Snapshot coverage 1.000 both legs (1,030/1,030 base; 1,123/1,123 armed). Reconciliation 0 mismatches per leg. Instrument errors 0. Determinism: armed seed 113502 re-run at full 150d after the pilot, **byte-identical**.

### Death-cause shares

| Cause | Base (85) | Armed (119) |
|---|---|---|
| the wild | 31 | 45 |
| monster | 22 | 24 |
| a stranger | 3 | 9 |
| the arena | 8→5 | 8 |
| sickness | 4 | 6 |
| starvation | 4 | 6 |
| a wound that wouldn't close | 5 | 5 |
| ambush | 2 | 2 |
| contest | 2 | 2 |
| thirst | 1 | 3 |
| dehydration | 0 | 2 |
| other named (Gavel, Ugly-Eyes, Ad Break, The Strike, The Callback, the night, Old Big, Loud-Eyes, Buffering, The Paparazzo) | 8 | 7 |

Deaths per 100 game-days rose: panel 9.54 → 11.20 (see §8). The armed leg's extra deaths are field deaths — the wild, monsters, strangers — not starvation. The villages live longer in the dangerous late game and die in it.

## §3 Mechanism — what moved, and how

The mechanism is the **raise pipeline**, not the direct propose. On the plain road a villager raises a link idea about once a week and the competent bot accepts it when the conversation offers it; scalerank's one link came that way and then the well ran dry because nobody raises a second idea. The drive answers raises *every* time one is pending, and keeps answering: 23 raises answered and linked across the band (2, 4, 1, 4, 2, 3, 5, 2 per seed). The direct propose step almost never fires — by the time the gate opens (first link seasoned, day 40–62), the raises have usually already filled the 3 LEAD slots (propose-blocked-by-full-lead: 24, 30, 30, 89, 0, 22, 22, 30 days per seed). The 4 proposes that did fire all accepted. Seed 113501 in the proof run showed the same shape: raises filled all 3 slots before the gate opened, proposes 0.

The chain per realm seed is regular: first link forms (raise, day ~17–32) → seasons at 30+ days / trust 40+ → gate opens (day 40–53) → second and third links form through raises → three seasoned subs hold → the polity qualifies (first polity day 60–84) → the rung gate (regional + 30d) opens → the national beat stages the next day (first beat day 64–85) → the court rides in and waits. Diplomacy, which linkdrive-b could never hold, now holds: 102 standing for 9–92 days per realm seed, and 136 on 113506 (four counting links). The full-seat shortfall on the four cleanest realm seeds (113502, 113503, 113506, 113507) is now **national alone**: waves 5/5/4/3/2 met, contests ≥10, crises ≥3, stage 3, food deeds true. The beat is staged and waiting on those seeds. That is the next arm's job (answercourt), and this arm hands it a live target.

The counter half of the lever never engaged: zero counters staged on either leg in 150 days. Raise-accepts at detPrim ≥55 accept outright; the 35–54 counter band was never hit. The lever's effect is entirely raises + proposes + tends.

Tends are the holding cost: 67 tends, 100,500 kcal, but the tend gate (pantry >20,000 kcal) blocked 806 link-days across the band — on 113504, 239 days. When the pantry never clears 20k, nothing tends the links and they rot from birth (see §7).

## §4 Reachability verdict

- **National:** 0/8 both legs. The polity qualifies on 6/8 armed seeds and the beat stages on 6/8, but the beat is never answered (by prereg design). National is now one answered beat away on 4 seeds — reachable, not reached.
- **Table / lesser seat:** 8/8 armed (7/8 base). The lesser seat is not the wall; it never was on this road.
- **Full seat:** 0/8. Blocked on SCALE (national) on all 8 armed seeds; on waves too on 113501/113504/113505/113508 (wave-5 kills 0/0/1/0 vs 2 needed).
- **Wave reach:** wave-5 bar 2→4 seeds; wave-4 bar 6→7. The armed leg kills more of the late waves, on the same seeds.
- **Median survival:** 150d both legs. But the end state differs: baseline lost 2/8 villages (113501 d50, 113503 d72); armed lost 4/8 (113501 d70, 113502 d150, 113503 d150, 113507 d147). Two armed villages lived the full 150 days and died on the boundary (113502 pop 0, 113503 pop 0). The drive does not save villages; it makes them climb while they live.

## §5 Village assessment, in plain words (per seed, armed leg)

- **113501 — the climb that came too late.** Died on both legs; armed lived 20 days longer and climbed (regional d32, realm d63, beat d64) before dying d70. The village was already dying when the realm formed. Two raises linked; tends 6, pantry never recovered.
- **113502 — the realm that ate its village.** Base survived with 7 people and no climb past regional. Armed built the realm (77 diplomacy days, 4 subs, beat d75), then the Herald and then the FINALE fed on the stores night after night while Red Table II raided it again and again, and the village died on day 150 with nobody left (pop 0). The sharpest caution in the band: the climb cost the village its life at the wire.
- **113503 — rescued to the last day, then lost.** Base died d72. Armed lived to d150 — lost on the last day — with a realm (d84) and a beat (d85). A rescue that ends in the same grave, one day short of the horizon's mercy.
- **113504 — the quiet failure.** Survived both legs (pop 9→7). Five LEAD links formed and only one ever seasoned (village_1, trust 99, 90 seasoned days); the rest were splinter fragments whose trust rotted from birth (25, 10, 12, 2 at end). Tends blocked by the pantry 239 days. The village binds and binds and nothing deepens.
- **113505 — the empty pool.** Survived both legs; the bloodiest base seed (32 deaths) became 17 armed. Two seasoned links (trust 64/66) and no third ever courtship-ready: on 54 days after the gate opened, no known unlinked village scored detPrim ≥55. The wall here is the pool of willing neighbours, not the drive.
- **113506 — the showcase.** Survived, pop 8→6. Four seasoned subs, diplomacy 136 at the end (held 92 days), realm d60, beat d68, first court d67. The only seed where the realm looks like a government: "GOVERNANCE LAYER: online — polity tribute routing, the court calendar, famine reserves. You built a realm."
- **113507 — the second wire-death.** Base survived pop 7. Armed built the realm (82 diplomacy days), beat d71, died d147 with one person left. Same shape as 113502: climb, then collapse at the wire.
- **113508 — the quiet success.** Survived both legs, pop 5→7. Realm d73, beat d74, diplomacy held 25 days. Climbs and lives. Nothing dramatic — which is the point.

## §6 Sense-testing (transcripts read in full)

Read in full: armed 113502 (20 fireside / 18 scale / 66 table lines), armed 113506 (18 / 40 / 76), armed 113503 (16 / 20 / 13), base 113501 (8 / 9 / 22).

**The System narrates the climb; the villagers never do.** On all three armed seeds the climb is legible in the System and trader lines — "Three fires bow to Haven. But a realm isn't leverage — it's seasons" (d30/d44/d54); the trader: "FOUR fires under one head. They call it a REALM. Tribute flows uphill like a river; I saw the grain carts with my own eyes" (d36/d46/d53); the System: "FINALES need a NATION. You've got a region; now make it a REALM" (d55); "Four fires. One head. GOVERNANCE LAYER: online" (d67/d74/d84); and the court itself rides in with a real choice — "FEAST them from a shared granary (5,000 kcal, no strings), HOST the court at Haven's fire, or write the law in COLD ink... Or REFUSE the scale itself" (d67/d74/d84), Codex: "National beat staged: lead (4 villages)."

But the **fireside pool — the villagers talking to each other — never mentions the realm, the court, or any neighbour by name**. Across 54 armed fireside lines the pool is four or five lines on rotation: stone for the palisade, the pantry, "It waits. We wait", "Why them?", "The table's set", "Did you see their faces?", "It eats while we deliberate." The scalerank blank — *nobody at the fire ever talks about the climb* — is **not filled** by this lever. The drive changed the numbers; the villagers' mouths didn't follow.

What the villagers *do* live is the Red Table thread, narrated in the table lines: a cannibal split births a new fire, its runners dispute the shared ground ("Back off — or we'll talk with teeth"), it raids the pantry night after night, its hungry people beg at the fire and walk back with nothing ("They'll remember the silence"), and when it bows, the tribute is a human moment — "You give The Red Table 1,390 kcal from Haven's bins — real food, honestly counted. Darius weeps, openly. 'The fire network. That's what it's FOR.'" (113502 d112). The link system is narrated through events; the fireside pool is the voiceless part.

**The cost of the unanswered beat is visible and named.** "THE HERALD fed in the night — 1,420 kcal gone from your stores. It is eating the realm while you deliberate" (113502 d70/d75/d80; 113506 d81/d106), later "THE FINALE fed in the night — 630 kcal" (113502 d114). The wait has a price and the game says so. One incoherence: on 113503 the Herald "fed" **0 kcal** twice while the line still says it is eating the realm (d84, d104) — the number contradicts the sentence.

**113502's end is a coherent tragedy**, and it is the transcript that most needs reading: the realm built, the court staged, the stores eaten, the raids, the tribute ledger running, and on day 150 Zoltan's funeral feast with the links left shaken. The village lived the link story and died inside it.

## §7 The two realm misses, and the raise that never offers

- **113504 (trust drift):** five LEAD links, one seasons. The second link (a splinter fragment) seasoned for 2 days (max trust 48) then fell; the other three never broke trust 31. Splinter links start at birth trust 30 and rot when nothing tends them; tends were blocked by the pantry 239 days. This is the scalerank §7 arm-5 question (what tends a link) answered in miniature: on a pantry-poor village, nothing does.
- **113505 (empty pool):** two seasoned links, no third ever courtship-ready (propose-not-ready 54 days, pantry-blocked proposes 50 days). The drive cannot propose to a village that won't say yes.
- **113503 (the raise that never offers):** 15 raises seen, 1 answered, 14 not-offered — the drive tried to answer a splinter village's raise in conversation for 14 days running and `link:accept` was never offered. The raise is visible to the policy but the conversation never surfaces the accept. (113501: same shape, 3 not-offered days.) Filed in the findings backlog for the conversation arm.

## §8 Metric review (§14) — a miss is NO-GO, never re-scored

The prereg verdict is **GO** on bar (b) (realm ≥3 seasoned subs on 6/8, bar ≥4/8), with bar (a) national 0/8 unmet. This section records the review honestly; it does not re-score the miss.

- **Panel (§15):** `scripts/build-linkdrive-panels-20261128.js` → `linkdrive-panel-a-before/after.json.gz`, `.json`, `.md`. Decision **review_required** (8 paired cases). The panel is the instrument; the prereg threshold is the judge and the panel does not override it. But the panel's flags are real and must be named:
  - Village deaths per run 10.625 → 14.875, paired delta +4.25, 95% interval [−2, 8.75] — **regression_watch**.
  - Village deaths per 100 calendar days 9.5438 → 11.2, delta +1.6562, interval [−2.3011, 5.209] — **regression_watch**.
  - Community loss 0.25 → 0.5, delta +0.25, interval [0, 0.625] — **regression_watch**.
  - National scale access 0 → 0 — no_material_signal. Table win rate 0 → 0 — descriptive. Survival <redacted> day 60: 0.875 → 1.0 — no_material_signal.
  - The intervals all cross zero; the signal is weak but the direction is consistent across all three survival metrics, and the per-seed story (§5: 113502, 113507) matches it. The drive buys the climb with lives. The confirm must watch deaths/100d and the starvation guard, which passed by **zero margin** (6 ≤ 6).
- **Guards:** (c) median survival ratio 1.0 ✓; (d) starvation 6 vs 4, at the bar exactly — flagged above, not hidden.
- **Instruments:** coverage 1.000 both legs, reconciliation 0 mismatches, instrument errors 0, pool floor met exactly on the baseline leg (6/8 alive day 80). Determinism re-run (armed 113502, 150d) byte-identical.
- **Telemetry deviation check:** `node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-11-28/perseed-linkdrive-a-arm/s*-armed.json' --metrics national,table,wins,exiled` fired two LOUD lines (national 12→0, wins 16→0). Both are **explained regime artifacts, not bugs**: the baseline's own `_regime` note says "DO NOT compare pre-seat / courtship / readiness substrates against this baseline — wins are structurally ~0 there and telemetry-check will fire a spurious LOUD 'wins disappeared'." This run is the plain road, no substrate flags. The base-leg glob fires the identical two LOUD lines, confirming the regime, not the lever. Baseline NOT rolled forward (coordinator's call only).

## §9 Blanks filled / documented

**Filled:**
- scalerank §7 arm 2 (the first lever that can move the binding input): **the binding input moves.** Links 1/village → 2–6/village; seasoned LEAD subs 0–1 → 2–4; diplomacy 0 → held at 102 (136 on 113506); polity qualifies 0/8 → 6/8; national beat stages 0/8 → 6/8. Linkdrive-b's blank #2 ("Form the LEAD realm") is filled: the realm forms on 6/8 seeds and holds.
- Diplomacy holding (linkdrive-b's failed metric): held 9–92 days per realm seed at 102, 136 on 113506.
- The rung gate is not the wall once the polity qualifies: the beat stages the day after (polity qualifies AND regional+30d open).

**Documented, still open:**
- **National (the beat):** staged on 6/8, answered on 0/8 — by design here. The next arm is answercourt: the beat is a real choice with named options and costs, and on 4 seeds it is the *only* missing full-seat item.
- **Fireside climb talk:** nobody at the fire talks about the realm or the court. The System and traders narrate it; the villagers don't. (Findings backlog.)
- **Tend gate:** the pantry >20,000 kcal gate blocked 806 link-days; on pantry-poor villages links rot from birth. 113504 is the exhibit.
- **Splinter-link drift:** links to splinter fragments rarely season (113504: 1 of 4 seasoned, briefly). Whether splinter villages should count toward the realm is a design question, not a bug claim.
- **The raise that never offers:** a splinter raise can sit pending 14 days with `link:accept` never offered in conversation (113503). Conversation-arm question.
- **Death cost:** the armed leg dies more (deaths/run +4.25, community loss +0.25, panel regression_watch on all three). Watch in the confirm; if it holds at 12–16 seeds, the drive needs a survival cost lever beside it.
- **Counter step:** never engaged (0 counters staged in 150 days on either leg). The lever's counter half is untested by this band.

## §10 Panel compare

Full compare: `evidence/2026-11-28/linkdrive-panel-a.md` (with `linkdrive-panel-a-before.json.gz`, `linkdrive-panel-a-after.json.gz`, `linkdrive-panel-a.json`). Decision `review_required`; key rows quoted in §8. The panel is a screen on 8 paired cases; its intervals are exploratory and unadjusted for multiple metrics.

## §11 Files

- Prereg: `evidence/2026-11-28/sim-linkdrive-a-prereg.md`
- Policy: `scripts/policies/competent-linkdrive-a.js`
- Driver: `scripts/linkdrive-driver-a.js`; analyzer: `scripts/analyze-linkdrive-a.js`; panel builder: `scripts/build-linkdrive-panels-20261128.js`; proof: `scripts/test-linkdrive-a.js` (52/52)
- Corpus: `evidence/2026-11-28/perseed-linkdrive-a-arm/` (16 per-seed JSONs + `summary.json`)
- Panel: `evidence/2026-11-28/linkdrive-panel-a.{json,md,json.gz ×2}`
- Pilot log: `/tmp/linkdrive-a-pilot.log` (analyzer JSON: `VERDICT: GO`); determinism log: `/tmp/linkdrive-a-determinism.log` (byte-identical)
