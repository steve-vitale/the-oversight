# SIM-TRIBUTERHYTHM — the tribute-rhythm gate (loop B, food-economy)

Date: 2026-10-19 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-tributerhythm-b
Axis: food-economy (scale-wall lens) — the DIAG-GO's pre-registered ALTERNATIVE
(evidence/2026-10-19/sim-belonghunger-b.md: "the one inflow the r13 rule feeds that no gate ever gated").
Master tip: e7bfc346c07b8e183760ac3919c20ac85ac9f380 (control re-measured on this tip — never reuse old corpus numbers).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14-15 — binding, written BEFORE the pilot sims)

- **Question**: the belonghunger DIAG (8e3feba7f/2bc022073) proved belong-road hunger = INFLOW COLLAPSE and exonerated feast/tribute/tend OUTFLOWS (all at/below baseline in hunger windows) — BUT the r13 contribution rule arms feasts off tribute/tend PAID, and no gate has ever gated that rhythm. This arm tests the one inflow the r13 rule feeds that no gate ever gated.
- **Lever**: TRIBUTE-RHYTHM GATE (policy-side, scripts/policies/tributerhythm.js, TRIBUTERHYTHM=1, default OFF, zero src/js changes). While FRAGILE — pantry fresh-days < 3 OR village hungry-streak >= 2 — the contribution-armed feast must not fire off tribute/tend contributions unless pantry fresh-days >= BAR. BAR pre-registered at 3d. Implemented as a Game.feastPlan wrapper during the parent's upkeep: the plan is refused iff fragile && freshDays < 3 && recentGives(7) < 1500 && recentGives(7)+recentTribute(7) >= 1500 (i.e. armed ONLY by the tribute/tend portion). Donation-armed feasts always pass; the food-r7 eveningFeast path (donation-only gate) is untouched by construction.
- **Honest weak prior** (documented): the DIAG exonerated this channel, so the expected result is NO-GO on hungry days; the arm exists to close the one ungated inflow rhythm with a fair, pre-registered test.
- **PRIMARY**: hungry-days armed <= 0.5x control. GO bar: armed <= 0.5 × control (paired identical seeds, pooled over lead+belong).
- **Horizon**: 180d death-aware (dead villages stop +10d tail — the harness's deadTail).
- **Seeds**: 11/22/33/44 × {leadfeast,belongfeast} = 8 paired configs (16 runs total), FEASTSCALE_R13=1, SEATDRIVE=0 (the fragilityfeast control substrate). CONTROL RE-MEASURED ON CURRENT TIP — the DIAG's R2 corpus pin broke after a sibling rebase (substrate drift), so the exact master SHA is recorded above and no old corpus numbers are reused.
- **Guardrails**: median survival >= control-10d; starvation <= control+1; national >= control-2; table >= control-2; no new death mode; laundering 0 (every fired feast has a matching pantry draw — no free feasts).
- **Det-gate**: OFF side bit-identical (RED R1); ON side deterministic 8/8 pairs (RED R2); ON diverges from OFF only through blocked feasts (GREEN G2).
- **Panel (§15)**: balanced panel compare via scripts/build-tributerhythm-panels.js (synthetic panels from the arm's own paired rows through the real scorecard + contract — the established pilot-arm pattern, cf. analyze-armorup-20261019.js). The panel is the instrument, the pre-registered threshold is the judge (§14 metric binding: a miss is NO-GO, never re-scored).

## Proof results (run BEFORE any pilot sims, 2026-10-19)

26/26 checks passed (FEASTSCALE_R13=1, SEATDRIVE=0), log preserved at evidence/2026-10-19/tributerhythm-proof.log:
- RED R1 (4/4): TRIBUTERHYTHM unset — leadrhythm/belongrhythm delegate byte-identical to leadfeast/belongfeast (outcome vectors + pantry series identical, 40d, seeds 11/22).
- RED R2 (8/8): TRIBUTERHYTHM=1 — 8 configs × 2 runs bit-identical (days/endReason/hungryDays/starveDeaths/death-multiset/feasts/wave + pantry series).
- GREEN G1 (6/6, staged): fragile pantry + tribute-armed contribution → plan refused, trBlocked=1; donation-armed + fragile → passes; freshDays ≥ 3 → passes; env unset → wrapper delegates (no refusal, no throw).
- GREEN G2 (8/8): ON diverges from OFF only through blocked feasts — all 8 configs at 40d had trBlocked=0 and were bit-identical control-vs-armed.
- RNG hygiene (wirebootstrap lesson): the wrapper draws no RNG (feastPlan is pure pantry/roster math — verified no Math.random; recentGives/recentTribute are pure ctx reads; no lazy-RNG rollers enumerated). ON-side divergence comes only through held-vs-fired feasts (the mechanism).

## Pilot results

16 runs, control re-measured on tip e7bfc346c (paired identical seeds). Full table:

| run | side | days | end | hungryDays | starve | feasts | trBlocked | wave | national | table |
|---|---|---|---|---|---|---|---|---|---|---|
| lead s11 | ctrl | 93 | village-lost | 3 | 1 | 7 | 0 | 4 | 1 | 1 |
| lead s11 | armed | 93 | village-lost | 3 | 1 | 7 | 0 | 4 | 1 | 1 |
| lead s22 | ctrl | 131 | village-lost | 5 | 0 | 9 | 0 | 4 | 1 | 1 |
| lead s22 | armed | 131 | village-lost | 5 | 0 | 9 | 0 | 4 | 1 | 1 |
| lead s33 | ctrl | 117 | village-lost | 4 | 1 | 8 | 0 | 4 | 1 | 1 |
| lead s33 | armed | 117 | village-lost | 4 | 1 | 8 | 0 | 4 | 1 | 1 |
| lead s44 | ctrl | 103 | village-lost | 7 | 0 | 7 | 0 | 4 | 1 | 1 |
| lead s44 | armed | 103 | village-lost | 7 | 0 | 7 | 0 | 4 | 1 | 1 |
| belong s11 | ctrl | 153 | village-lost | 0 | 1 | 9 | 0 | 4 | 0 | 1 |
| belong s11 | armed | 122 | village-lost | 1 | 0 | 8 | 5 | 4 | 0 | 1 |
| belong s22 | ctrl | 180 | survived | 0 | 1 | 11 | 0 | 4 | 1 | 1 |
| belong s22 | armed | 178 | village-lost | 3 | 1 | 9 | 11 | 4 | 1 | 0 |
| belong s33 | ctrl | 117 | village-lost | 13 | 1 | 9 | 0 | 4 | 1 | 1 |
| belong s33 | armed | 116 | village-lost | 12 | 3 | 8 | 5 | 4 | 1 | 1 |
| belong s44 | ctrl | 139 | village-lost | 8 | 0 | 4 | 0 | 4 | 0 | 1 |
| belong s44 | armed | 180 | survived | 14 | 1 | 4 | 6 | 4 | 0 | 1 |

Pooled verdict:
- PRIMARY hungry-days: control 40, armed 49 (1.225×). GO was ≤ 20. **MISS** — wrong direction.
- Contact: the gate DID engage — trBlocked=27, all on the belong road (s11: 5, s22: 11, s33: 5, s44: 6); trArmedFragile=27. Zero contact on lead (tend-armed feasts never coincide with fragility there).
- Guardrails: median survival 131 → 122 (≥ 121 ✓, barely); starvation 5 → 7 (**BREACH**: > control+1 = 6); national 6 → 6 ✓; table 8 → 7 ✓; no new death mode ✓ (armed causes ⊆ control causes); laundering 0 ✓ (every fired feast has a feast-channel draw).
- Feast channel: feasts 64 → 60, feastKcal 127,247 → 120,857 (−6.4k held). Tribute paid 360k → 335k (the armed side paid less tribute — downstream of earlier deaths/divergence, not gated; the layer never touches payments).
- Wall numbers (both sides): national 6/8, table 8/8→7/8, wins 0/8, wave-4 8/8, wave-5 0/8, median survival 131→122d.

§15 panel: control→armed compare decision=**review_required** (mechanical at 4 pairs — all mapped metrics `insufficient`, no material signals, no regression signals). Panel triple attached (tributerhythm-panel-before.json.gz, tributerhythm-panel-after.json.gz, tributerhythm-panel-compare.{json,md}). The panel is the instrument; the pre-registered GO bar is the judge: NO-GO.

## Verdict: KILLED AT PILOT — CONCEPT-DEAD

Per §14a: the mechanism was staged (27 tribute-armed feasts held on the belong road — contact confirmed, not a zero-contact kill), the metric was fair (hungry-days is the phenomenon under study; pool 40 days vs bar 20 — within an order of magnitude per the §14b pool check), and the concept failed on its merits. Holding 27 tribute-armed feasts while fragile did not reduce hunger — hungry-days rose 40 → 49 and starvation 5 → 7 (guardrail breach). The DIAG's exoneration stands: the feast rhythm is not the hunger channel, and the blocked feasts' feeding/buff value looks mildly protective (3 of 4 belong configs hungrier or deadlier on the armed side). Do not retry without a new mechanism.

Kill protocol: layer deleted zero-trace (scripts/policies/tributerhythm.js removed); instruments kept (scripts/measure-tributerhythm-b.js, scripts/build-tributerhythm-panels.js, scripts/test-tributerhythm-b.js as the pre-kill audit trail — 26/26 green, log preserved); evidence kept (this file + tributerhythm-b.json + perseed-tributerhythm-b/ + panel triple + tributerhythm-proof.log).

## Metric review (§14)

1. **Metrics held — no re-score.** The primary (hungry-days ≤ 0.5× control) was the phenomenon itself, not a proxy; the miss is a miss. The starvation guardrail breach (7 > 6) independently forces NO-GO. Nothing was re-scored against a friendlier metric.
2. **The weak prior was honest and confirmed.** The DIAG exonerated this channel; the arm was designed to close the one ungated inflow rhythm fairly, and it confirmed the exoneration instead of overturning it. A NO-GO here is information: the r13 contribution rule's tribute rhythm is not a hunger lever.
3. **RNG-divergence note (for the coordinator):** armed vs control diverge in game RNG after the first held-vs-fired feast (hostFeast draws game RNG — the DIAG's standing note). The worsening is consistent across the 4 belong configs with contact (s11 −31d survival, s22 +3 hungry-days, s33 +2 starvation, s44 +6 hungry-days), which argues against pure noise — the blocked feasts were feeding/buffing, not just draining.
4. **Lead-road zero contact is a finding, not a failure.** On leadfeast the tend-armed feast never coincides with fragility (trBlocked=0, trArmedFragile=0, all 4 configs bit-identical armed-vs-control). The gate is belong-road-only in practice on this substrate.
5. **Control re-measurement justified:** the re-measured control on tip e7bfc346c shows 40 hungry-days across 8 runs vs 8 hunger events on the DIAG's corpus tip — the substrate drift the DIAG flagged at landing is real and the phenomenon got stronger, exactly as its addendum predicted.

## Village assessment (plain words)

Sixteen villages on the standard feast substrate, eight of them with a new house rule: no feast bought with tribute money while the pantry is thin. The rule fired 27 times, all on the belong road — and the villages hungered anyway, a little worse than without the rule. The belong villages that the gate "protected" lost the feasts' food and their fire-night buffs and kept the same quiet fields the diagnostic found: the hunters gone or bringing nothing, the fish traps giving 245 kcal, the scholar eating full pantry meals while the reserves warning blinked. Blocking the feast didn't refill the fields. What starves a village here isn't the big night out — it's the slow quiet after the producers are gone, and a feast held back is just one less meal the village shared.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

**Armed belong s33, d102–107 (hunger days):** "Swathi came back with 404 kcal of something edible. The pantry breathes." … "📖 The Codex turns a page on its own. Swathi is dead. You didn't ask. It knew." … "💀 Swathi starved. Slowly. The village is 2 now." … "⚠ Haven's pantry is empty. Day 1 of hunger." Coherent, consequential, sad. The "Too heavy. Carrying 28.3/28 kg." spam on d106–107 is the known findings-backlog weight-spam item — reported, not hidden. "Village meal: +400 kcal from the communal pantry. (Half ration — they don't trust you yet.)" — the scholar still draws meals while the village starves; that is the sister arm's (pantry-guard) territory, not this gate's. PASS on coherence.

**Gate silence:** when the gate holds a feast, scaleFeast declines silently — the same silence as the existing r13 contribution gate (`if (contrib < 1500) return;`). No narration claims a feast that didn't happen; no villager reacts to a non-event. Consistent with the existing gate pattern — documented, not a blank.

## Named-nexts

1. **Payment-gating (tribute/tend deferral while fragile)** — named in the brief as the optional second mechanism; untested by this arm. The DIAG ranked tribute "buffer-thinner, not trigger," so the prior is weak, but it is the one rhythm this arm never touched.
2. **The feast's feeding value** — the armed side's worsening suggests the r13 feast is mildly protective while fragile (feeds the village + feastSurge buffs for the night's fights). If a future arm gates feasts, it must account for the lost meal, not just the saved kcal.
3. **Lead-road tend rhythm** — zero contact here; if the tend rhythm ever matters it needs a hungrier lead substrate than this one.

## Convergence

food-economy: **killed-at-pilot** (tributerhythm, CONCEPT-DEAD). The belong-road hunger channel the DIAG left open — the r13 rule's tribute/tend-armed feast rhythm — is now closed with teeth: 27 held feasts, hunger unmoved (40 → 49, starvation 5 → 7). The inflow-collapse attribution stands unchallenged; the lever budget for feast-side gates on this axis is spent (overdraw4, overdrawfloor, fragilityfeast, diphold, tributerhythm — five gates, zero hunger movement). The next food-economy work belongs on the inflow side (the sister pantry-guard arm) or not at all.
