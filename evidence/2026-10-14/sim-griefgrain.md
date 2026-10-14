# ARM "griefgrain" — answerRenegotiation 'gift' grain becomes real aid (subaid's sibling aid verb) — KILLED AT PILOT (NO-GO)

Worktree: `~/workspace/worktrees/sim-griefgrain`. Run: oversight-flesh-out-loop A r32, axis scale-onramp via the diplomacy road (claimed backlog item sim-findings.md #166, "GRIEF-GRAIN AID SIBLING").

## The lever (game-code, src/js/hierarchy.js, answerRenegotiation 'gift') — REVERTED

The 'gift' verb removes 1,500 kcal from Haven's pantry and grants +8 trust — but the grain NEVER reaches the subordinate's pantry; it vanishes into narrative while the beat says "Haven sends 1,500 kcal to Emberhold's fire — grief met with grain." The lever applied the SUBAID-AID-CREDIT pattern verbatim: after the unchanged trust-gain block in the 'gift' branch,

```js
// GRIEFGRAIN-AID-CREDIT (2026-10-14): ...
try {
  var _gsov = this._otherVillage(link.subordinate);
  if (_gsov && paid > 0) _gsov.pantryKcal = Math.max(0, (_gsov.pantryKcal || 0)) + paid;
} catch (e) {}
```

credited at the ACTUAL paid amount (partial pantries aid partially). No new beats, no trust-math change, 'visit'/'wait' untouched. Proof `scripts/test-griefgrain-20261014.js`: **17/17 GREEN** on the armed tip (was 17/17 RED on pristine — the grain demonstrably vanished). Reverted byte-clean per kill protocol (`git diff --stat` empty after `git checkout HEAD -- src/js/hierarchy.js`); the proof script degrades to RED-documentation with exit 0 on marker absence (never MODULE_NOT_FOUND). Patch backup at `~/workspace/griefgrain.patch`.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — header written BEFORE sims

- **Question**: conditional on a 6th lead link FORMING, does real grief grain aid (gift kcal credited to the subordinate's pantry) convert it to seasoned (30+d, trust 40+) — measured on forming seeds only?
- **Primary metric**: seasoned conversion = (forming seeds where the 6th lead link seasons) / (forming seeds), identical seeds, baseline-engine vs armed-engine (same policy stack both sides).
- **Policy-stack deviation (documented, not silent)**: the task brief prescribed `leadcourt`/`belongseek`, but code-verified (`grep` over `scripts/policies/*.js`) those stacks never call `answerRenegotiation` — only `fifthlink-r26` (and `winseek`) answer renegotiation beats. The gift verb would fire 0 times under the prescribed stacks and before/after would be vacuous. Both sides instead used the `fifthlink-r26` stack (FOURTHLINK=1 FIFTHLINK=1 — the stack on which subaid's pilot bar was measured and on which the verb actually fires: 2–14 gifts/run in the data below). Smoke gate: `fifthlink.id === 'fifthlink-r26'`.
- **GO**: armed conversion ≥ 3/5 on forming seeds (subaid's pilot bar — baseline+1 anchored).
- **KILL-AT-SCREENING**: <4 forming seeds on the 16-seed baseline screen → under-powered.
- **Guardrails** (r32b #186 lesson — medians are report-only): starvation deaths ≤ control+2, hungryDays ≤ control × 1.1, no new death mode, national ≥ control−2, exiled = 0. Median survival report-only.
- **Horizon**: 180d death-aware (runDays ends villages at Game.over; dead villages stop).
- **Seeds**: screening 11/22/33/44/55/66/77/88 + 101/202/303/404/505/606/707/808 × fifthlink-r26 baseline; conversion on the forming subset × (baseline vs armed-engine).
- **Proof**: `scripts/test-griefgrain-20261014.js` — REAL RED phase on pristine (grain vanishes: sub pantryKcal byte-identical after a 1500 gift) → GREEN after (exact credit, trust byte-identical, partial proportional, visit/wait/null-guards untouched).
- **Mechanism secondaries**: renegotiation gift-answer counts (ctx counters), 6th-link tend weeks, tribute-reliability read from the armed seeds.

Metric binding (§14): a miss is NO-GO, never re-scored against a friendlier metric mid-run. Doubts go under "metric review" for the NEXT run.

## Determinism gate

`scripts/det-gate-griefgrain-20261014.js` on the ARMED tip (same policy stack): **8/8 IDENTICAL — 16/16 runs bit-identical** (s11 d93, s22 d162, s33 d31, s44 d109, s55 d114, s66 d75, s77 d131, s88 d94/95). Before/after comparisons trustworthy.

## Screening (baseline, pristine engine, fifthlink-r26 — 16 seeds)

6th lead link formed on **4/16** seeds — no kill at screening (≥4):

| seed | days | 6th formed | 6th seasoned | gift answers | wave | rank |
|---|---|---|---|---|---|---|
| 11 | 132 | d83 | — (no season) | 6 | 4 | national |
| 44 | 128 | d61 | **s91** | 8 | 5 | global |
| 101 | 82 | d56 | — (no season) | 11 | 4 | global |
| 303 | 122 | d50 | **s80** | 7 | 3 | global |

**Baseline conversion: 2/4** (s44, s303). Note: trajectories moved since subaid's screen — subaid's forming set (11/44/55/606/808, conversion 2/5) is not reproduced; s55/s606/s808 no longer form 6ths on the current tip. The re-screened forming set is {11, 44, 101, 303}.

Screening wall numbers: national 12/16, wave4 16/16, wave5 2/16 (s44, s55), table 0, won 0, exiled 0, median survival 113d (REPORT-ONLY).

## Conversion (forming subset × baseline-engine vs armed-engine, identical seeds)

| seed | baseline 6th | armed 6th | Δ |
|---|---|---|---|
| 11 | d83→x (no season) | — (no 6th formed) | formation lost |
| 44 | d61→**s91** | — (no 6th formed) | converter lost |
| 101 | d56→x | d64→x | forms later, still no season |
| 303 | d50→**s80** | d45→**s75** | seasons earlier |

- **PRIMARY: baseline 2/4, armed 1/4.** **GO (≥3/5, re-screened analogue ≥3/4) MISSED — NO-GO.** The lever's trajectory perturbation closed the candidate window on s11/s44 (no 6th forms); s55 formed a NEW 6th under armed (d67→**s97**, seasoned) and s606 a new 6th (d129, no season), but those are outside the fixed baseline denominator — the honest read is the fixed-denominator conversion, which regressed 2/4 → 1/4. Forming rate: 4/16 → 4/16 (set shifted: {11,44,101,303} → {55,101,303,606}).

Guardrails (identical seeds, 16 seeds):
- starvation deaths: 19 → 13 (≤ control+2 = 21) ✓
- hungryDays: 47 → 42 (≤ control × 1.1 = 51.7) ✓
- death modes: baseline {combat 100, contest 6, starvation 19, wound_fever 1, monster 39, ambush 1, villager combat 11, sickness 8, "a wound that wouldn't close" 8, thirst 2, dehydration 1, "The Algorithm" 1}; armed {combat 85, monster 58, "the expedition" 1, lockjaw 1, ambush 1, villager combat 10, sickness 7, starvation 13, "a wound that wouldn't close" 9, thirst 2, contest 6, "Buffering" 1}. The armed-only labels ("the expedition", "lockjaw", "Buffering") are rare flavor/disease causes already in the engine — lockjaw is tetanus in the mundane pool; a pantry-credit code path cannot produce them. Read as rare-label noise, not a new death mode. ✓ (naming the ambiguity rather than averaging it away)
- national: 12/16 → 13/16 (≥ control−2 = 10) ✓ — per-seed: s22 rose regional→national; no seed lost national.
- exiled: 0 → 0 ✓
- wave-5: 2/16 → 2/16 (s55 stays w5 armed; s44's w5→w4 is the formation-loss above; s303's w3→w5 is a same-run improvement on a baseline converter). Median survival 113→106d (REPORT-ONLY).

## Mechanism secondaries (armed)

- **Gift fires 0–14×/run** (counts: s55 12, s303 11, s101 12 gifts) — the verb is live; the lever was exercised on every seed except s88 (0 gifts) and s202 (2).
- **The credit reaches pantry but not the 6th's tend race**: the gift answers succession beats on YOUNG links (leader-death renegotiation) — most gifts land on links 1–5's succession moments, not on the 6th link's 30-day seasoning window. The mechanism's honest beneficiary is the renegotiated young link (trust +8 plus a food floor), whose effect would show in young-link survival/tribute — not in 6th-link conversion. This arm copied subaid's bar; subaid's tendLink fires weekly on ALL lead links (thin-first, lower gate), so its aid was 6-bond-economy-bound. Grief-grain aid is succession-bound. Wrong metric for the mechanism.
- Per-seed s303 armed: 6th forms d45, seasons s75, wave-5 reached (baseline d50→s80, wave-3) — the one seed where the aid and the 6th link's window overlapped shows improvement; s55 armed forms a new converting 6th the baseline never formed. The lever is not null — it is mis-measured.

## SENSE-TESTING

The renegotiation beats are byte-identical on both tips (the arm changed no text): "🕊️ Haven sends 1,500 kcal to Emberhold's fire — grief met with grain. The new speaker eats with Haven's people and the tribute stays where it was. (Trust +8.)" The beat reads as feeding — and now (had the arm landed) it would BE feeding. **PASS** (beats unchanged; the read is on the pristine text).

The visit-fallback beat keeps its honesty: "There's no one to send — Haven's bench is empty. Word and promises ride out instead. They note the difference, and the trying. (Trust +2.)" **PASS.**

## Village assessment

The baseline villages on this stack are the 4-bond courts: s44 (global, wave-5) and s303 (global, wave-3) carry converting 6ths while their arrears stay quiet; s11 and s101 form 6ths they cannot feed through the window — the bond exists but the season never comes. Gift-answering is frequent on the succession-heavy seeds (s55: 14, s303: 11, s101: 11) — young links' leaders die often in this regime, and the village keeps meeting grief with grain that vanishes. The blank was real (the grain vanished — 17/17 RED proof) but the conversion bar measured the wrong bond: grief grain aids the succession moment, not the 6th link's tend race. Documented, not chased: the arm is killed per protocol; the game code is reverted byte-clean.

## Blanks filled / documented

- **DOCUMENTED** (metric review): the pre-registered primary (6th-link conversion) was mechanism-mismatched. The gift fires on young-link succession beats, not on the 6th link's seasoning window; its honest beneficiaries are the renegotiated links themselves. A next run on this road should pre-register: seasoning/survival of gift-answered young links, or their tribute arrears trajectory post-gift — measured on the armed engine where the credit is live (proof 17/17 GREEN, reverted now; patch at ~/workspace/griefgrain.patch).
- **DOCUMENTED**: the forming denominator is treatment-affected (s11/s44 lost their 6ths under armed; s55/s606 gained new ones). Reported on the fixed baseline denominator {11,44,101,303}: 2/4 → 1/4. On the armed forming set {55,101,303,606}: 2/4 seasoned (s55, s303).
- **DOCUMENTED**: the pre-registered "≥3/5" bar no longer matched the re-screened forming set (4, not 5) — trajectories moved since subaid's screen (s55/s606/s808 stopped forming 6ths). Judged against the ≥3/4 analogue; the miss holds under either reading.
- **DOCUMENTED** (sim-findings.md): policy-stack lesson — `leadcourt`/`belongseek` never answer renegotiation beats; any future arm on an answered-beat verb must verify the policy stack fires the verb (code-grep before prescribing).

## Metric review (§14)

GO missed: armed 1/4 vs baseline 2/4 on the fixed forming denominator (GO needed ≥3/4). No re-scoring — the primary stands as pre-registered and the arm is killed. The metric-review case for the NEXT run: the primary should measure the mechanism's actual channel (young-link seasoning/survival post-gift, or tribute arrears of aided links), not 6th-link conversion. Also: the "new death mode" guardrail's rare-label noise ("the expedition"/"Buffering"/lockjaw) should be classified by cause-system (disease pool vs flavor label) rather than raw label novelty — lockjaw is tetanus in the mundane pool.

## Wall numbers (every run)

| | national | table | wins | wave-4 | wave-5 | exiled | medianSurv* |
|---|---|---|---|---|---|---|---|
| baseline screen (16) | 12/16 | 0/16 | 0/16 | 16/16 | 2/16 | 0 | 113d |
| armed (16) | 13/16 | 0/16 | 0/16 | 16/16 | 2/16 | 0 | 106d |

\* median REPORT-ONLY per pre-registration.

Raw per-seed data: `~/workspace/griefgrain-baseline8.json`, `~/workspace/griefgrain-baseline16b.json`, `~/workspace/griefgrain-armed8.json`, `~/workspace/griefgrain-armed16b.json`.

## Verdict: NO-GO — arm killed at pilot, game code reverted byte-clean

Grief-grain aid credit (17/17 RED→GREEN proof) does not convert 6th-link seasoning 2/4 → ≥3/4 on identical seeds; fixed-denominator conversion regressed 2/4 → 1/4 via formation perturbation. Guardrails all held (starvation 19→13, hungryDays 47→42, national 12→13, exiled 0→0). Killed per protocol: hierarchy.js reverted byte-clean, scripts + evidence-only commit. sim-findings #166: reverted to [open] — the grain-vanishing blank is real but needs a mechanism-matched metric next time (young-link seasoning post-gift, not 6th-link conversion).
