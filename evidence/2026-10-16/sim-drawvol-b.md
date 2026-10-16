# SIM-DRAWVOL — daily drawdown-outflow cap when fresh-days < 6 (loop B, food-economy)

Date: 2026-10-16 · Loop: oversight-flesh-out-loop-b (ARM sim-drawvol-b) · Worker tree: sim-drawvol-b
Axis: food-economy (scale-wall lens) — the sim-floorday3-b named next ("cap total daily drawdown outflow when fd < 6, or lift the trigger to fd > 6" — this arm takes the CAP option).
Substrate: pre-seat courtship (SEATDRIVE=0 explicit), FEASTSCALE_R13=1, policies leadcourt/belongseek via feastscale's belongfeast/leadfeast.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: sim-floorday3-b closed the floor hypothesis with a structural argument (the 2-day/3-day drawdown floor is provably vacuous given the fd>4 trigger — 174 feast events, zero floor contacts) and redirected #200 to the uncapped COMBINED daily drawdown outflow on thin-overstock pantries: the aid give (1,500) + the feasts (~2–4k) + the parent's weekly tribute/tend discipline all firing while fresh-days hovers just above 4. On a replenished marginal pantry the village eats ~pop×2000/day anyway; discretionary drawdown is the marginal drain that tips a balanced pantry into decline. Does capping total daily drawdown outflow when fd<6 — holding DISCRETIONARY candidacies past the cap, never the obligated tribute/tend — reduce starvation exposure?
- **Lever**: scripts/policies/drawvol.js — NEW FILE ONLY (zero src/js, zero edits to existing policy files — wrap, don't edit). DRAWDVOL=1 gate, default OFF (unset = byte-identical delegation to the parent, pinned by the proof's RED phase). Composition follows seatdrive.js (withSeatDrive: same objects both sides, env var is the only switch) and overdrawfloor.js (the drawdown instrument's trackTribute pattern, attribution conventions).
  - OBLIGATED (observed, never held): Game.payTribute / Game.tendLink — the courtship bargain + demand answers. Engine return values = actual pantry kcal paid. Consumes the day's budget before discretionary.
  - DISCRETIONARY (held past the cap): aid gives (Game.answerAidBeg — competent's answerAidBeats verb) and feasts (Game.hostFeast — competent's eveningFeast + feastscale's scaleFeast verbs). Hold = counted (drawvolHeld, _dvHoldEvents) + narrated as prudence (voice-only, deterministic, no RNG — the tableWaitTalk precedent). A held aid is refused aloud through the engine's honest path (trust moves, the ledger remembers); a held feast retries another dusk. Volume dial, not a kill switch.
- **PRIMARY**: absolute starvedDays armed ≤ control. starvedDays = cumulative engine-days the village spent hungry (v.hungryDays > 0 sampled post-daily, summed over the run — the engine's own hunger signal). Starvation deaths reported alongside.
- **MECHANISM ENGAGEMENT** (the sim-floorday3-b metric-review lesson — an outcome primary on an unengaged mechanism is uninformative): armed must HOLD ≥ 8 drawdown candidacies when fd<6 across the sweep; else verdict = no-coverage diagnostic → KILL as invisible (a non-binding cap is dead code — do not land it).
- **GUARDRAILS**: national ≥ control−2/16; median survival ≥ control−10d; no new death mode; social verbs alive: armed aid+feast count ≥ 50% of control.
- **Verdict**: GO only if primary + engagement + all guardrails pass. Any miss = KILL (delete the layer zero-trace per kill protocol; keep proof + sweep + evidence as instruments).
- **Horizon**: 180d death-aware (pacing-law max); dead villages stop (+10d tail).
- **Seeds**: 8 FRESH seeds [982–989] (verified unused: absent from all evidence/ per-seed filenames 2026-10-13→16; the brief's suggested [131,242,353,464,575,686,797,908] were all used) × {belongfeast, leadfeast} × {control, armed} = 32 runs. IDENTICAL seeds both sides. Control RE-MEASURED in the same sweep (#247).
- **Det-gate**: bit-identical reruns both sides before trusting comparisons (r27 rule); SMOKE=1 honesty gate proving the layer actually ran on each side.

## Cap-choice derivation (measured, not tasted)

scripts/measure-drawvol-20261016.js — 8 runs (seeds 982–985 × {belongfeast, leadfeast}, 180d, control substrate), read-only per-day outflow instrument:

- Daily TOTAL drawdown outflow on fd<6 days: n=265, p50=p60=p75=p90=0, max=16,567. Only 22/265 thin days (8.3%) had ANY drawdown outflow. Stream shares on thin days: obligated 94k, aid 2k, feast 26k.
- Simulated holds in harness order (feast@upkeep → tribute → aid@daily):
  - cap=2500 → 3 feast + 1 aid holds per 8 runs (~16/32, 2× the engagement bar)
  - cap=3000 → 2 + 1 per 8 runs (~12/32, 1.5× the bar)
  - cap≥4000 → 0 holds (invisible — would be killed as dead code)
- **Cap = 2500.** It binds on the margin of actual discretionary events (~31% of thin-day discretionary firings held in simulation, ~69% of verbs alive — the volume dial, not a kill switch). Per-seed day records: evidence/2026-10-16/perseed-drawvol-measure/.

## Proof results (run BEFORE any sims)

scripts/test-drawvol-20261016.js — RED (DRAWDVOL unset) + GREEN (DRAWDVOL=1), one process with live env toggles. PROOF GREEN, 31/31 (independently re-runnable):

- R1: gate-off delegation byte-identical — wrapped vs bare belongfeast, 2 seeds × 40d, identical per-day hashes (40/40 both).
- R2: gate off + fd 4.5 fixture → aid + feast BOTH fire (drawn 3500), no hold counters exist.
- G1: DRAWDVOL=1, fd 4.5, DRAWDVOL_CAP=3000 → aid FIRES in daily (0+1500≤3000), feast HELD in upkeep (1500+2000>3000). drawvolHeld=1, kind=feast, cost=2000, feast drew nothing; bucket: disc=1500, obl=0.
- G2: obligated consumes budget first (belong road, cap 3000) → weekly tribute fires (obligated=4000), then the aid is HELD (4000+1500>3000), refused aloud (aidRefused=1 — engine consequences, not silent). Control (tribute already paid): aid FIRES, zero holds.
- G3: fd 7 + DRAWDVOL_CAP=100 (tiny) → aid + feast BOTH fire, zero holds — the fd band dominates the budget.
- G4: prudence narration — voice-only, no Math.random/R() in the layer (static), beat carries the fresh-day number, reads as people deciding.
- DET-GATE: 2 seeds × 2 sides (unset/=1), 40d reruns byte-identical (40/40 all four).
- SMOKE: ids honest ('belongfeast'/'leadfeast'), capKcal() defaults to the measured 2500, DRAWDVOL_CAP overrides, hold-event log exists iff layer on.
- Fixture bug caught by the proof (documented): the engine recomputes feast cost = max(1500, 400×(invited+1)) inside hostFeast — a patched plan with cost≠recomputed cost is refused "Not today". The fixture trims the guest list so the engine agrees with the fixture cost. Real-sweep impact: none (no patched plans there).

## Sweep results

32 runs, identical seeds, det-gate green both sides before trusting comparisons, SMOKE=1 green. 9/16 armed/control pairs byte-identical per-day hashes — exactly the 9 pairs where the cap never engaged (the layer perturbs trajectories ONLY through holds; the non-engaged pairs prove the delegation is clean).

| metric | control | armed | pre-reg |
|---|---|---|---|
| starvedDays (**PRIMARY**, absolute) | 50 | 48 | **PASS** (≤ 50) |
| starvation deaths | 1 | 1 | — (pair-identical: belongfeast s985 both sides) |
| holds when fd<6 (**ENGAGEMENT**) | — | 13 (12 feast + 1 aid) | **PASS** (≥ 8) |
| national | 14/16 | 14/16 | ✓ (≥ 12) |
| median survival | 132.0d | 135.5d | ✓ (≥ 122.0d) |
| max survival | 182d | 182d | — |
| fresh-rot kcal | 8994k (476/vday) | 8987k (468/vday) | — (1.00×) |
| table | 14/16 | 14/16 | — |
| wave-4 / wave-5 | 15/16 / 8/16 | 15/16 / 7/16 | — |
| Arc 2 / 3 / 4 | 16/16 / 16/16 / 14/16 | 16/16 / 16/16 / 14/16 | — |
| four-realm | 0/16 | 0/16 | — |
| wins | 0/16 | 0/16 | — (pre-seat by design) |
| exiled | 0/16 | 0/16 | — |
| drawdown outflow | obl 1645k / aid 54k (35 gives) / feast 396k (172) | obl 1786k / aid 41k (27 gives) / feast 398k (176) | — |
| social verbs (aid+feast count) | 207 | 203 | **PASS** (≥ 103.5) |

Paired starvedDays deltas (armed−control): belongfeast +2/+3/−4/0/+1/−7/0/+3; leadfeast all +0 (the lead road barely engaged — 2 holds on s982 only, zero starvedDays movement). The movement lives on the belong road, where all 11 belong-side holds happened.

Death modes: no new death mode. Both sides share the mode set {combat, villager combat, monster, expedition, sickness, contest, wound, ambush, starvation, dehydration, lockjaw}; the differing singletons ("the phoenix link" 6 control / "Choir Toad" 1 armed) are specific-monster attributions on diverged trajectories, not modes.

**Verdict: GO** — primary + engagement + all guardrails pass. The layer lands as a default-off policy layer (DRAWDVOL=1 opt-in; unset = byte-identical delegation).

### What actually engaged (mechanism autopsy — read this before citing the lever)

The 13 holds: **12 feast holds + 1 aid hold**. All 12 feast holds fired with `dayTotalBefore=0` — the feast's OWN cost (2,800–3,200) exceeded the 2,500 cap on a thin pantry (fd 1.0–5.4). Only ONE hold (belongfeast s983 d118: tribute 2,400 + aid ask 1,913) exercised the combined-volume channel the hypothesis named. The cap as built is predominantly a **big-feast brake on thin pantries**, not the obligated+discretionary stacking ratchet — the stacking rarely co-occurs on this substrate (the measurement pre-pass: only 22/265 thin days had any outflow at all; feasts fire at dusk upkeep before the day's tribute lands in daily, and aid begs are event-driven and rare).

The aid stream did move: 54k→41k (−24%, 35→27 gives) — the one aid hold plus trajectory effects. Feast volume was flat (396k→398k); obligated rose (1645k→1786k, divergence noise — tribute is never held).

Effect size honesty: starvedDays −4% (50→48) on noisy paired deltas. The bar was absolute (armed ≤ control) and it passed — but this is a marginal-drain trim, not a starvation fix. Most starvation harm on this substrate comes through other channels (the paired starvation death was pair-identical and lever-irrelevant).

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 14/16 | 14/16 | 0/16 | 15/16 | 8/16 | 132.0d | 182d |
| armed | 14/16 | 14/16 | 0/16 | 15/16 | 7/16 | 135.5d | 182d |

Exiled 0 everywhere. Arc 4 reached 14/16 both sides; four-realm 0/16 both sides — the scale wall is untouched by this arm (as expected: a food-economy volume dial, not a scale lever). The wall stands where the pre-seat substrate puts it: national reachable, table reachable-but-unsat (0 sittings, pre-seat by design), wave-5 7–8/16, four-realm unreached.

## Death-cause shares

control: combat 378, villager combat 132, monster 111, expedition 11, sickness 10, wound 7, the phoenix link 6, contest 5, ambush 2, starvation 1, the night 1, Spool 1, dehydration 1, lockjaw 1, The Algorithm 1.
armed: combat 392, villager combat 133, monster 114, expedition 12, sickness 8, contest 7, wound 7, lockjaw 2, ambush 2, starvation 1, Choir Toad 1, Spool 1, dehydration 1, The Algorithm 1.
Violence-dominated collapses both sides; no starvation signal for the lever to move beyond the −2 starvedDays.

## Village assessment (plain words)

Thirty-two villages, nine of them the same village twice — where the cap never engaged, the trajectories are byte-identical, which is the cleanest proof the layer touches nothing it shouldn't. Where it engaged, the villages read as villages under real pressure making hard calls. Belongfeast s983 (armed) is the clearest: d117 the STARVING warning, d118 a televised feast fires at dusk ("Mainul opens the pantry wide… eat until the fire burns low"), the scholar Mainul Kar dies in combat the same day, grief-leverage spikes the tribute to 16,875/week, a raid carries off ~1,268 kcal — and on that same day the layer holds Rafael's aid beg (tribute 2,400 already out + ask 1,913 > 2,500): "🙏 Rafael begs at the treeline — but the shelves hold only ~1 day of fresh, and 2,400 kcal has already left the pantry today. The village turns them away gently: 'Come back when the bins are full.'" The next dawn Rafael walks back into the firelight, thinner — the beg wasn't deleted, the relationship continues. The hold didn't save the village (d134, village-lost, combat-dominated like its pair), but the decision reads as triage, not a policy executing.

The s982 belongfeast village held three straight dusk feasts (d60–62) as its pantry slid from ~2 days to ~1 — "Not tonight," the elders decide, three nights running, the numbers declining honestly. That's not a loop; that's a siege mentality, and the beats earn it.

Villagers act like people throughout: the aid/hold/refusal chain has real social consequences (the engine's refusal beat follows the hold — trust moves, the ledger remembers), feasts are televised with named villagers eating, grief reshapes tribute math. Nothing robotic in the sampled beats.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

**PASS.** The prudence beats read as people deciding:

- Feast hold (armed belongfeast s982 d60): "🍖 The feast fire is laid — but the shelves hold only ~2 days of fresh, and 0 kcal has already left the pantry today. 'Not tonight,' the elders decide. 'The fire waits for a fatter day.'"
- Aid hold (armed belongfeast s983 d118): "🙏 Rafael begs at the treeline — but the shelves hold only ~1 day of fresh, and 2,400 kcal has already left the pantry today. The village turns them away gently: 'Come back when the bins are full.'" (The engine's honest refusal follows with the trust/ledger consequences — the hold is a decision with a price, not a free veto.)
- Fixed on landing review: "~1 days" → "~1 day" pluralization (cosmetic, voice-only).

The aid/feast beats around the holds (televised feasts, named eaters, the Eater circling the feast-smell) are the substrate's own and read fine. The one caveat: three consecutive identical-structure hold beats (s982 d60–62) — judged acceptable: the numbers decline honestly and the situation (a 1–2-day pantry with a standing feast candidacy) genuinely recurs.

## Blanks filled / documented

- **FILLED (lever)**: the drawdown-volume cap — measured cap (2,500), proof (31/31 RED→GREEN + det-gate + SMOKE), 32-run sweep, GO verdict. Lands as scripts/policies/drawvol.js (default-off).
- **FILLED (finding)**: the cap's actual engagement mode — a big-feast brake on thin pantries (12/13 holds), not the combined-volume ratchet the hypothesis named (1/13). The #200 volume hypothesis is now measured: the stacking channel exists (s983 d118) but is rare; the binding channel is single large feasts on 1–5-day pantries. Filed to sim-findings.md.
- **DOCUMENTED (no chase)**: the lead road barely engages the cap (2 holds, zero starvedDays movement) — the belong road's weekly tribute rhythm is what creates the thin-day outflow the cap trims. A lead-road variant would need a different trigger.
- **DOCUMENTED (no chase)**: four-realm 0/16 both sides — the scale wall's four-fires formation remains unreached on the pre-seat courtship substrate; not this arm's axis.

## Metric review (§14)

- The engagement pre-registration held: 13 holds ≥ 8, so the primary is judged (not a no-coverage diagnostic). The primary passed as pre-registered (48 ≤ 50, absolute).
- No re-scoring was done: the −4% effect size is small and the paired deltas are noisy, but the bar was absolute by design (written before sims). The small effect is documented, not re-litigated.
- starvedDays (cumulative village hungry-days) and starvation deaths (1=1, pair-identical) agree: no divergence to name. The hungry-days definition is the engine's own hunger signal; the lineage's death-based primary is reported alongside.
- The verbs-alive guardrail (≥50%) passed at 98% (203/207) — the dial held discretionary volume without killing the social verbs. The aid stream's −24% is the intended trim, not verb death (27 gives still fired).
- Lesson for future volume-type arms: pre-register the hold-composition expectation (which verb, which stacking) alongside the count bar — this run's 12:1 feast:aid split recharacterized the mechanism after the fact.

## Convergence state

**GO — landed** (default-off policy layer). The food-economy axis stays converging: the drawdown-verb line now has a measured, landed volume dial (big-feast brake on thin pantries, −4% starvedDays, all guardrails green). The remaining #200-adjacent question is the lead road's non-engagement (different trigger needed) and the trust-ledger bind (steve-call #340 — the axis's binding constraint on the scholar-hunger half).
