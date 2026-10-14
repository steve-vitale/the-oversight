# ARM "sim-griefcredit" — grief-grain aid credit RE-ARMED with a mechanism-matched primary (flesh-out loop A r33, axis scale-onramp via the diplomacy road)

Worktree: `~/workspace/worktrees/sim-griefcredit`. Run: fleshout-a-2026-10-14-2315, ARM 3. Claims sim-findings #166 ("GRIEF-GRAIN AID SIBLING"), re-opened after r32's KILL AT PILOT on a mechanism-mismatched metric.

## The lever (game-code, src/js/hierarchy.js, answerRenegotiation 'gift')

Identical to r32's layer: the 'gift' verb removes 1,500 kcal from Haven's pantry and grants +8 trust, but the grain NEVER reached the subordinate's pantry — it vanished while the beat said "Haven sends 1,500 kcal to Emberhold's fire — grief met with grain." The patch (`~/workspace/griefgrain.patch`, applies cleanly on this tip) applies the SUBAID-AID-CREDIT pattern verbatim after the unchanged trust-gain block:

```js
// GRIEFGRAIN-AID-CREDIT (2026-10-14): ...
try {
  var _gsov = this._otherVillage(link.subordinate);
  if (_gsov && paid > 0) _gsov.pantryKcal = Math.max(0, (_gsov.pantryKcal || 0)) + paid;
} catch (e) {}
```

Credited at the ACTUAL paid amount (proportional pantries aid proportionally); trust math and the verb's beats untouched; 'visit'/'wait' untouched. Proof `scripts/test-griefgrain-20261014.js`: **17/17 RED on pristine → 17/17 GREEN armed, re-verified on the current tip this run** (r32 proved it; the tip moved, so the proof was re-run, not inherited).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — header written BEFORE any sims

- **Question**: conditional on a young link's succession beat being answered with the 'gift', does real grief-grain aid (kcal credited to the subordinate's pantry) convert that link to seasoned (30+d, trust 40+) — measured identical seeds, baseline-engine vs armed-engine (same policy stack both sides)?
- **Primary metric (ONE, picked)**: post-gift young-link seasoning = count of links that (a) received a 'gift' answer on their staged succession beat AND (b) subsequently reached (age ≥30d, trust ≥40). Summed across the 8 pilot seeds. Pending renegotiation stages ONLY on links <21d old (hierarchy.js ~1506: `if (day0 - (link.day || 0) < 21)`), so gifted links are young by construction; seasoning is the SCALE.md definition.
- **GO**: armed seasoned-count ≥ control seasoned-count + 1.
- **GUARDRAILS**: median survival ≥ control − 10d; national reach ≥ control − 2; no new death mode (cause-FAMILY level — armed-side key absent on control side = LOUD); exiled ≤ control + 1.
- **KILL-AT-PILOT**: GO miss = NO-GO per §14, layer reverted byte-clean, instruments land with a KILLED evidence file.
- **Policy stack**: FOURTHLINK=1 FIFTHLINK=1 (`fifthlink-r26` — smoke gate `fifthlink.id === 'fifthlink-r26'`). Substrate code-verified again this run: `grep` over `scripts/policies/*.js` — only `fifthlink-r26.js` and `winseek.js` call `answerRenegotiation`; `leadcourt`/`belongseek` never do (a comparison on those stacks would be vacuous). fifthlink-r26 keeps r32's substrate continuity.
- **Seeds**: 11/22/33/44/55/66/77/88 (r32's core set) — pilot gate 8 seeds first; confirm 12–16 only on GO.
- **Horizon**: 150d death-aware (runDays ends villages at Game.over; dead villages stop).
- **Instruments**: `scripts/test-griefgrain-20261014.js` (proof, reused from r32 — re-verified), `scripts/det-gate-griefgrain-20261014.js` (reused), `scripts/sweep-griefgrain-arm3-20261014.js` (NEW — per-link gift→seasoning tracking: wraps `Game.answerRenegotiation` to log {linkId, day, ageAtGift, trustAtGift, paid}; daily scan records first seasoning day; policy ctx cross-checks gift counts; standard wall table + guardrails).
- **Mechanism secondaries (report-only)**: gift-answer counts/seed, paid kcal per gift, post-gift link-days (survival read), trust at gift vs at seasoning, sense-test transcript lines.

Metric binding (§14): a miss is NO-GO, never re-scored against a friendlier metric mid-run. Doubts go under "metric review" for the NEXT run.

## Metric review
(pre-filled at pre-registration — to revisit after results)

- The r32 metric (6th-link seasoning) was mechanism-mismatched: the gift fires on succession beats of young links, not on the 6th link's tend race. The new primary measures exactly the link the verb touches.
- Risk: gift events perturb formation (r32 saw it), so armed/control gift denominators will differ — the primary is a count, not a rate; a larger denominator on one side is a real effect of the lever, reported honestly either way.
- Risk: late-gift links (gift at day ~140) cannot season within 150d — unmeasurable on both sides, symmetric under identical seeds, noted not chased.
- If the primary fires but seasoning is rare on both sides (<2 gifted links seasoning on control), the GO threshold (control+1) is weak — the next run should pre-register on the gifted-denominator instead of the seed set.

## Results — GO (16-seed confirm, fifthlink-r26, 150d death-aware)

Det-gate: 8/8 bit-identical on the ARMED tip (bit-for-bit across two runs per seed) — before/after comparisons trustworthy. Control engine re-run on s33 bit-identical too. The pilot's diverging seeds (11/22/33/44) diverge downstream of the credit; the confirm's 8 seeds run bit-identical armed-vs-control (the aid perturbs nothing there).

| metric | armed (16) | control (16) | verdict |
|---|---|---|---|
| **PRIMARY: post-gift young-link seasoning** | **32** | **29** | **GO** (needs ≥30) |
| gift-answer events (links) | 36 | 35 | — |
| gift→seasoned rate | 32/36 = 0.89 | 29/35 = 0.83 | — |
| median survival | 112.0d | 94.5d | guard ≥ 84.5 ✓ |
| national reach | 13/16 | 13/16 | guard ≥ 11 ✓ |
| exiled | 2 | 2 | guard ≤ 3 ✓ |
| new death mode (cause-FAMILY) | none | — | 'The Eulogy' is a wave-4 monster's named kill cause (combat family) — fired once on the armed side because armed s33 reached wave 5 (control s33 stopped at wave 4). Not a new mode. ✓ |

Pilot (8 seeds): primary 20 vs 17 (GO ≥18); all guardrails passed. Confirm (16 seeds = pilot 8 + new 8): the new 8 run bit-identical armed-vs-control; the effect concentrates in the pilot seeds where succession beats fire on young links with thin sub pantries.

Seed detail (armed vs control, g=gifted links, s=seasoned post-gift, d=days):
- s11: g1 s1 d150 | g1 s0 d150 — the armed gift's link seasons; control's doesn't.
- s22: g4 s3 d114 | g3 s3 d86 — armed keeps the village alive 28d longer.
- s33: g6 s6 d110 | g8 s5 d94 — armed seasons all six gifted; control seasons 5 of 8.
- s44: g6 s5 d128 | g4 s4 d102 — armed +26d survival.
- s55/66/77/88/101/202/303/404/505/606/707/808: identical trajectories both sides (aid perturbs nothing where sub pantries are solvent).

Sense-testing (live transcript, armed s33): day 42 stages four named succession beats ("Emberhold watches to see if Haven holds without its dead. The bond is young — they're still deciding what Haven is, and grief delays the verdict..."); day 43 answers one live: "🕊️ Haven sends 4,000 kcal to Emberhold's fire — grief met with grain. The new speaker eats with Haven's people and the tribute stays where it was. (Trust +8.)" The beat reads as a real gesture: staged by a real death on a named young bond, answered with a real Haven-pantry cost, and — with this arm — real food in Emberhold's pantry (verified consumed by `_linkedVillageWeek`'s need equation, game.js ~8583). Note the copy is honest about the actual paid amount (4,000 — whole-unit over-removal from a coarse pantry, `_removePantryKcal` takes indivisible units whole). SENSE-TESTING PASS.

Regressions: proof 17/17 RED→GREEN re-verified on the current tip; subaid twin 17/17 GREEN; test-renegans 1 pre-existing FAIL (beat-expiry copy drifted with the tip, fails identically on pristine); test-hierarchy.js 2 pre-existing FAILs (tribute arrears/trust, fail identically on pristine). The arm introduces no regressions.

## Village assessment

The fifthlink-r26 villages are 4-bond courts that keep answering their young links' grief — on s33, four succession beats stage on the SAME day (d42) and the village meets all of them with grain. The blank r32 found was real: that grain vanished. With the credit, the gifted links season at 0.89 (32/36) vs 0.83 (29/35) — the aid isn't a revolution, it's a margin: the succession moment stops being a pure trust tax and becomes a real food transfer that keeps thin young bonds alive long enough to season. Median survival moves +17.5d on the armed side (112 vs 94.5) — the direction is survival-up, and no guardrail moved the wrong way.

Who thrived: s11's gifted link (armed seasons, control doesn't — the one clean causal read). Who died: s55/s88 — no succession beats fire at all there (the lever is inert where the beat never stages; exiled 1 each side, symmetric). What's missing: the aid only matters where the subordinate's pantry is the binding constraint — on 8/16 seeds the credit perturbs nothing, because those subs were solvent. That's honest scope, not a hole.

## Blanks filled / documented

FILLED: the grief-grain blank from #166 — the 'gift' verb's grain now lands in the subordinate's pantry at the actual paid amount (proof 17/17, confirm GO 32≥30). Mark #166 `fixed` on landing.

DOCUMENTED (not chased, per protocol):
- Whole-unit over-removal on the gift verb: a 1,500 kcal ask can drain up to 4,000 kcal from a coarse-unit pantry (s33: "Haven sends 4,000 kcal"). The copy stays honest (reports actuals), but the price varies with pantry composition. Candidate sim-findings entry if Steve wants the gift verb's ask capped.
- The renegans beat-expiry test's expected copy drifted with the tip (1 FAIL, pre-existing) — the tip moved under a test, not under my arm.
- Unanswered-beat expiry (-6 trust) plus the succession haircut (-8) is the race-loser on seeds where gifted links DON'T season — the policy already answers every beat it can afford; the residue is pantry poverty, not policy neglect.

## Metric review (post-run)

- The mechanism-matched primary behaved: gifts fire only on young links (engine-gated <21d), seasoning is the SCALE.md definition, and the count moved +3 on 16 seeds. The GO threshold (control+1) was met with margin.
- The confirm's 8 new seeds ran bit-identical armed-vs-control — the lever is null where subs are solvent. A future run could pre-register on "gifted links on thin-pantry subs" to raise the event rate, but the current metric is honest.
- No metric revision proposed for the next run; the primary stands.
