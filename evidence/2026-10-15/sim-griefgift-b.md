# ARM "sim-griefgift-b" — tribute arrears on gift-receiving bonds (flesh-out loop B, food-economy)

Worktree: `~/workspace/worktrees/sim-griefgift-b`. Run: fleshout-b-20261015T010800Z, ARM 3 (game-code region: src/js/hierarchy.js answerRenegotiation gift verb only).

## Task-premise correction (verified, not assumed)

The brief asked to "re-apply the proven game-code credit." Verification FIRST:
- `git log` shows commit `dbb71251` ("sim-griefcredit (scale-onramp, GO at 16-seed confirm)") is an ANCESTOR of this tree's HEAD.
- `git diff dbb71251 HEAD -- src/js/hierarchy.js` is EMPTY — the credit is in-tree, byte-identical to the landed commit.
- sim-findings #166 is marked `[fixed]`.

The credit was landed by loop A's r33 run (2026-10-14): GO on post-gift young-link seasoning 32 vs 29 (16-seed confirm), proof 17/17 RED→GREEN. Re-applying it is a no-op — there is nothing to apply. What remains unmeasured from the kill-notes' named-next is the OTHER primary: **tribute arrears on gift-receiving bonds**. This arm measures exactly that: the landed credit, armed (credit in-tree) vs control (credit neutralized), identical seeds.

## Arm independence check (documented before building)

- My live game-code region: `src/js/hierarchy.js` `answerRenegotiation` 'gift' verb ONLY. No game-code edits were made this run — the armed side IS the current tip; the control side is a byte-copy at `~/workspace/griefgift-control-tree` with ONLY the credit block neutralized (single diff hunk, proof-verified).
- Sibling loop A's live claim (`hidden_files/lever-claims/fleshout-a-20261015T001539Z.json`): sim-feastexposure (policy-side) + sim-siegeroster (policy-side-preferred). Both policy-side; neither touches `hierarchy.js` `answerRenegotiation` or the gift verb. NO file/system overlap.
- Loop A's claim names prior-run B regions `[hungerdepth2c]` (game.js prodthrottle hook) and `[spoilsibs]` (hierarchy.js tribute payments + game.js cooking paths) as expected-B regions: NEITHER is live this run (hungerdepth superseded, spoilsibs diagnostic-close evidence-only). This run's only tribute-adjacent system is the read-only arrears instrument on gift-receiving bonds.

## The lever (already landed; measured, not built)

GRIEFGRAIN-AID-CREDIT (2026-10-14, in-tree): the 'gift' verb removes 1,500 kcal from Haven's pantry and grants +8 trust; the credit lands the ACTUAL paid amount into `_otherVillage(link.subordinate).pantryKcal`. Same pattern as the landed SUBAID-AID-CREDIT on tendLink. Trust math and verb beats untouched. Copy stays honest: the narration reports the actual paid amount (whole-unit `_removePantryKcal` can over-draw — the r33 s33 case "Haven sends 4,000 kcal"; #240 steve-call on capping the ask stands — not this run's question).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — header written BEFORE any sims

- **Question**: does the landed grief-grain credit reduce tribute arrears accrued AFTER a gift answer on the receiving bond (identical seeds, 180d death-aware, fifthlink-r26 both sides)?
- **Mechanism link**: tribute is debited from the SUBORDINATE's pantry (their_fields_pay canon, hierarchy.js); the credit puts real kcal there. Gifted bonds are young succession bonds (<21d at staging) whose thin pantries are the binding constraint (r33 finding: the lever is null where subs are solvent).
- **Primary metric (ONE)**: total tribute arrears kcal accrued post-gift across gift-receiving bonds (keyed by subordinate village; pay-downs — arrears→0 on a full week — never subtract). Summed across pilot seeds, armed vs control.
- **GO**: armed <= control x 0.7.
- **GUARDRAILS** (harm-specific): starvation deaths <= control+2; national >= control-1/8 (pilot scale of the brief's -2/16); no new death mode (cause-key present on armed side absent on control side = LOUD, n>=3 per #216). Median survival report-only.
- **MEASURABILITY**: gift-receiving bonds < 3 per side across the pilot → UNMEASURABLE = NO-GO (KILL), no confirm spend.
- **Policy stack**: FOURTHLINK=1 FIFTHLINK=1 (fifthlink-r26 — named export, SMOKE id check in both proof and sweep). Substrate code-verified: only fifthlink-r26 and winseek call answerRenegotiation; leadcourt/belongseek never do (r33 verification, re-checked this run: `grep` — leadcourt/belongseek have no answerRenegotiation calls).
- **Seeds**: 11/22/33/44/55/66/77/88 (r32/r33 core set); spares 101/202/303/404 for any seed the det-gate drops.
- **Horizon**: 180d death-aware (runDays ends at Game.over). Why 180: arrears accrue on the weekly tribute tick; a gift at day ~100–140 needs 5–10 weeks to show divergence; 150d would censor late gifts. Dead villages stop simulating (+10d tail max).
- **Baseline**: OWN control in the same sweep (CONTROL BASELINE DRIFT #247: never inherit r33's numbers, even on identical seeds). Control = credit-neutralized engine.
- **Instruments**: scripts/test-griefgift-arrears-20261015.js (proof: 5/5 GREEN with REAL RED phases — patch-file cycle --red exit 2 RED OBSERVED, --break exit 2 RED OBSERVED; INFO-SKIP on killed trees), scripts/det-gate-griefgift-b-20261015.js (in-process twice-run identical on BOTH engines), scripts/sweep-griefgift-b-20261015.js (per-bond arrears accrual tracking + wall table + guardrails + say-line capture for sense-testing).
- **Mechanism secondaries (report-only)**: gift-answer counts/seed, paid kcal per gift, arrears per bond, gift→seasoning cross-check, sense-test transcript lines (gift beats must read as village decisions; arrears notices must read as the primary noticing missing tribute).

Metric binding (§14): a miss is NO-GO, never re-scored against a friendlier metric mid-run. Doubts go under "metric review" for the NEXT run.

## Metric review
(pre-filled at pre-registration — to revisit after results)

- The r33 metric (post-gift seasoning) measured the RIGHT bond and landed. This run measures the other named-next (arrears on gift-receiving bonds) — the two together complete #166's kill-notes.
- Risk: gift events perturb formation, so denominators may differ side-to-side; the primary is a total, reported alongside per-bond means and gift counts — a denominator shift is a real effect of the lever, reported honestly either way.
- Risk: arrears on a bond can pre-date the gift (arrearsAtGift snapshot per bond); the accumulator starts at gift time — pre-gift debt is excluded by construction. Debt inherited across a break/re-form (debts_survive_the_break) is tracked by subordinate-village key, not link id, so re-formed links stay in the same bond's ledger.
- Risk: the 0.7 bar was the brief's suggestion; if the mechanism is real but smaller (r33's seasoning moved 32 vs 29, ~10%), the bar may be structurally unreachable for an arrears channel. If it misses narrowly, the metric review names a per-bond arrears-rate bar for the next run rather than re-scoring this one.

---

## Results — KILLED AT PILOT (primary missed; NO-GO per §14)

Det-gate: **8/8 IDENTICAL twice-run on BOTH engines** (armed + control-neutralized). No seeds dropped. Before/after comparisons trustworthy.
Proof: `scripts/test-griefgift-arrears-20261015.js` **5/5 GREEN** on the armed tip; REAL RED phases — patch-file cycle `--red` → RED OBSERVED (exit 2), `--break` (wrong arrears field) → RED OBSERVED (exit 2); INFO-SKIP on killed trees.
SMOKE: policy id `fifthlink-r26` ✓; armed credit line present ✓; control copy neutralized, single diff hunk ✓.

### Primary

| metric | armed | control | GO bar | verdict |
|---|---|---|---|---|
| **tribute arrears accrued post-gift (kcal, 22 gift bonds/side)** | **65,267** | **54,183** | armed ≤ 37,928 | **NO-GO** |

Per-seed (g = gift bonds, a = arrears kcal, d = days):

| seed | armed (g/a/d) | control (g/a/d) |
|---|---|---|
| 11 | 2 / 11,245 / 130 | 2 / 26,091 / 161 |
| 22 | 4 / 8,732 / 121 | 3 / 9,856 / 86 |
| 33 | 4 / 8,480 / 117 | 7 / 3,710 / 73 |
| 44 | 6 / 36,810 / 102 | 4 / 14,526 / 69 |
| 55 | 0 / 0 / 85 | 0 / 0 / 85 |
| 66 | 3 / 0 / 87 | 3 / 0 / 88 |
| 77 | 3 / 0 / 123 | 3 / 0 / 123 |
| 88 | 0 / 0 / 75 | 0 / 0 / 75 |

Gift denominators are equal (22/22) — no denominator trick. The miss is mechanistic, not noise:

**The cumulative-arrears primary is directionally confounded by the lever's own survival effect.** The gift is a one-time ~1-week-of-tribute injection (1,500–4,000 kcal vs 4,000 kcal/week tribute); it cannot fix the weekly structural shortfall. What it does — per r33's seasoning win and this run's +24d median survival — is keep thin bonds ALIVE longer. Longer-lived bonds accrue more lifetime arrears: armed bonds lived **1,397 bond-days vs 1,023** (+37%). The time-normalized rate (report-only secondary) actually favors armed: **46.7 vs 53.0 kcal/bond-day (~0.88x)** — the credit slightly reduces the arrears *rate*, but the survival extension dominates the cumulative total. The primary as pre-registered measures lifetime shortfall, which scales with the very life the lever extends.

### Guardrails

- starvation deaths: **3 vs 4** (≤ control+2 ✓)
- national: **6/8 vs 4/8** (≥ control−1 ✓)
- new death mode: none — every armed-side cause key exists on the control side ('expedition' fires once on control only) ✓
- median survival (report-only): **109.5d vs 85.5d** (+24d armed — the r33 survival-up direction, again)

### Wall numbers (this suite)

national 6/8 vs 4/8 | table 0/8 vs 0/8 | wins 0/8 vs 0/8 | wave-4 unlocks 7/8 vs 7/8 | wave-5 unlocks 1/8 vs 1/8 | median survival 109.5d vs 85.5d.

### Sense-testing (SENSE-TESTING LAW)

Gift beats read as village decisions (control s33, identical copy both sides): "🕊️ Haven sends 1,600 kcal to Emberhold's fire — grief met with grain. The new speaker eats with Haven's people and the tribute stays where it was. (Trust +8.)" — staged by a real death on a named young bond, answered with a real pantry cost, honest amounts (1,500–1,600; the whole-unit over-draw case from r33 remains Steve's #240 call, copy stays honest).

Arrears narration reads as the primary noticing, with the cause named (armed s33): "🌾 The Hungry Road's tribute comes up thin — 1,544 of 4,000 kcal. They sent everything the wagons could carry, and it wasn't enough. The shortfall rides as arrears (+2,456 kcal). (Trust -1.)" / "🌾 Nothing comes from The Hungry Road this week — their fields are as empty as the wagons look. Hunger isn't defiance, but the ledger doesn't know the difference. (Arrears +4,000 kcal, trust -2.)" SENSE-TESTING PASS — the ledger is legible, the shortfall is attributed to empty fields not defiance, trust costs are proportionate.

Instrument note (tooling blank, fixed this run): the sweep's first version capped say-capture at 400 lines head-fill — it kept only days 1–5 chatter and silently missed every gift/arrears beat (day 40+). Replaced with a 2,000-line ring buffer (keeps the tail). Any prior sweep using a head-fill cap measured transcripts it never saw.

### Village assessment

The fifthlink-r26 villages are 4+-bond courts that keep answering their young links' grief. s33 names the pattern: Emberhold, Stonebridge, Thornfield, The Red Table, The Hungry Road — succession beats staged by real deaths, answered with grain. **The Hungry Road is the emblematic thin subordinate**: its fields are empty, it sends everything the wagons can carry, and it still falls 2,456 kcal short — week after week. The gift bought it weeks; it did not buy it solvency.

Who thrived: the gifted bonds that seasoned (r33's read stands — seasoning 0.89 on gifted links). Who died: s55/s88 — no succession beats fire at all (villages died at village rank, wave 3; the lever is inert where the beat never stages). s33-control died at day 73 at regional while armed s33 lived to 117 — the aid's channel is bond life, and the arrears ledger is where that life is invoiced.

What's missing: the tribute math itself. A young bond owes 4,000 kcal/week from fields that yield nothing; the gift covers one week. Nothing in the engine renegotiates the tribute DOWN for a grieving young bond — the shortfall is narrated honestly and the trust cost is small (-1/-2), but the arrears ratchet has no relief valve except the table burning the books. That is a design question (Steve's call), not a bug — documented, not chased.

### Blanks filled / documented

FILLED: #166's kill-notes are now fully measured — r33 measured post-gift seasoning (GO, landed); this run measured the other named-next, tribute arrears on gift-receiving bonds (NO-GO, killed). The arrears channel is answered: the credit does not reduce cumulative tribute arrears; it extends bond life, and lifetime arrears scale with that life.

DOCUMENTED (not chased, per protocol):
- Say-capture head-fill bug (fixed in the sweep script; ring buffer now).
- The tribute-relief-valve design question above (candidate sim-findings entry for Steve's call — left for the coordinator; it needs a design ruling before any arm).
- s33's denominator wobble (4 vs 7 gift bonds) — gift events perturb formation; the primary used equal totals (22/22) so it didn't bite, but per-seed denominators will keep wobbling.

### Metric review (post-run)

- The miss is owned by the metric, not the lever: cumulative arrears scale with bond lifetime, and the lever extends lifetime. Pre-registered correctly, judged as pre-registered: NO-GO. Not re-scored.
- The right next primary (for a FUTURE run, not this one): **arrears rate per bond-week alive** (time-normalized), or arrears at a fixed post-gift horizon (e.g., gift+30d) — both measure the tribute-discipline channel without the survival confound. This pilot's rate read 46.7 vs 53.0 kcal/bond-day (~0.88x): below a 0.7 bar on its own, so the next run should pre-register a rate bar calibrated to that read (e.g., ≤0.8x), not inherit 0.7.
- The r33 seasoning primary and this run's survival guardrail both point the same way: the credit's real channel is bond LIFE. Future grief-grain work should measure life-adjacent outcomes (seasoning, succession survival), not ledger totals.

## Verdict

**KILLED AT PILOT** — primary missed (65,267 vs 54,183; GO needed ≤37,928). Per kill protocol: NO game-code change was made this run (the credit is r33's landed commit, not mine to revert — `git status` clean of game-code throughout); instruments (proof 5/5, det-gate 8/8, sweep) + this evidence file are kept and committed; the disposable control copy is deleted. #166 stays `fixed` (r33's seasoning GO stands; this run answered the second named-next in the negative).

TELEMETRY: `telemetry-check.js` vs scale-wall.json — quiet on both sides (armed {national 6, table 0, wins 0, exiled 1}, control {national 4, table 0, wins 0, exiled 1}; no large deviations). One LOUD fired on the first invocation and was investigated same-run: the tool resolves flat metric paths, and the row-structured pilot JSON has no top-level `national` — "missing paths count as 0." Schema artifact, not a deviation; re-ran with proper flat aggregates, quiet both sides.
