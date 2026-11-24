# sim-titanmuster-b — DIAG: can any village assemble 10 allied blades?

## 1. Verdict — DIAG-GO

**No. On the competent substrate the muster count is structurally 0: the
call is never sounded, so no muster record ever exists for the gate to count.**
Across the whole 16-seed tbrefuse band, the muster reads `have = 0` on all
76 titan refusals (need 10), the spoken line fires on 28 distinct
(herald, day) groups, and the call itself (`📯 THE CALL GOES OUT`) is
sounded **0 times**. Villages had 5–10 living people on refusal days, so
the zero is not "no people" — it is "no call, no muster, no count."

The next arm is a call-sounding instrument (a policy that sounds the call,
or a staged probe that builds a muster and reads the count) — NOT another
corpus re-read. The tbrefuse follow-up metric is now answered on this
substrate; reachability of 10 under a sounding policy is still unmeasured.

## 2. Prereg (frozen, with two recorded amendments)

Prereg: `evidence/2026-11-24/sim-titanmuster-b-prereg.md` (frozen ~19:15Z).
Corpus: the tbrefuse band, 16 seeds 109310–109325, `-v2` files only, 150d,
competent verbatim. No new sims, no game-code change.

Amendments (both recorded in the prereg before judging, with reasons):
- **#1 (B1):** the refusal line is said ONCE per titan per day by design
  (titans.js REFUSAL-SPAM dedup), so 21 repeat refusals carry no line of
  their own. They classify by inheritance from the same (titan, day)
  group's firing refusal — same titan, same day, same gate count by code —
  reported separately (21 inherited). The bar's intent (every refusal gets
  the exact gate count) is unchanged.
- **#2 (B2):** the prompt-line classifier must exclude strings matching the
  muster-line regex — the refusal line itself contains "sound the call", so
  the first run inflated promptLines to 91. Genuine prompt lines: 8.

## 3. Method

Analyzer: `scripts/analyze-titanmuster-b.js` (frozen instrument).
Proof: `scripts/test-titanmuster-b.js` — 6/6 PASS (synthetic have/need
extraction, same-day inheritance, sounding-vs-prompt classification,
non-titan exclusion, real-corpus determinism, real-corpus census numbers).
Analysis JSON: `evidence/2026-11-24/titanmuster-b-analysis.json`.

Mechanism (code, read before judging):
- `titanMusterBladeCount` (src/js/titans.js ~1519): unique living allies in
  the titan's muster record + committed Haven blades. The muster record is
  created only by `soundTitanCall` (~862), a player/UI verb (`Game.soundTitanCall`,
  invoked from the `call` message). `titanCommitOwn` (~1029, Haven blades,
  two-tap, player-only) feeds the Haven leg.
- `titanMusterReady` (~1527): count >= `def.minAllies` (10 for heralds).
- The refusal (titanWrapCombat, ~1588) speaks the line once per titan per
  day and records `{gate: 'muster', have, need}` on EVERY refusal.
- The competent policy never calls `soundTitanCall` or `titanCommitOwn`
  (only scripts/policies/commitrefresh.js calls the commit verb, and it was
  not the tbrefuse substrate). F2 (journey-deepening r243) unified the
  spoken count with the gate count, so the line IS the gate count.

## 4. Results (judged only against the frozen bars)

| Bar | Result |
|---|---|
| B1 classification complete (76/76) | PASS — 55 direct from the row's line, 21 by same-day inheritance, 0 unclassified, 0 parse errors |
| B2 muster-line census | PASS — 83 occurrences, N distribution {0: 83}; zero nonzero |
| B3 call-sounding census | PASS — 0 real soundings (`📯 THE CALL GOES OUT`), 0 cooled lines, 8 genuine prompt lines |
| B4 counterfactual stated | PASS — refusal-day livingCount n=76, min 5, median 8, max 10; mechanism named from code (§3) |
| B5 instrument health | PASS — 0 parse errors, analyzer selftest 6/6, determinism byte-identical across two runs |

Headline numbers:
- Titan refusals: 76 (of 91 total refusals) across 6 seeds with herald
  meetings (109317: 19, 109318: 1, 109319: 13, 109320: 31, 109321: 8,
  109325: 4); the other 10 seeds never met a herald. Fates: 28
  killed-in-field, 48 still-waiting-at-end — identical to tbrefuse.
- have/need: have 0 on 76/76, need 10 on 76/76. Max have ever read: **0**.
- The line fired on 28 distinct (herald, day) groups; the line text occurs
  83 times in the corpus (copies across linesDuringCall/contextLines).
- The call was sounded 0 times. No muster record ever existed on this band,
  so `titanMusterBladeCount` reads an absent record as 0 allies + 0 Haven.

## 5. Sense-test

The refusals read coherently: the herald is refused, the line speaks the
arithmetic once per day, repeats are recorded silently, and the herald is
later killed in the field or still walks the world at day 150. Nothing
about the refusals reads as broken — the gate works as written. What is
missing is the other half of the ritual: nobody ever sounds the call, so
there is no muster for the gate to count. A villager reading "you have 0"
while eight living villagers stand in camp is telling the truth about the
muster and saying nothing about the village's strength.

## 6. Wall numbers (this corpus — as recorded by tbrefuse, not re-judged)

Wins 0/16, national 0/16, wave-5 unlocked 6/16, faced 5/16, 7 wave-5 kills,
median survival 150d. The scale wall stands: villages reach wave 5,
survive, and never reach national or win. The muster answer does not move
the wall — it names one more door that only opens when the player acts.

## 7. Blanks filled / documented, and metric review

**Filled:** the titan muster question (tracker blank #2; tbrefuse §10
follow-up metric). On competent substrate the answer is structural: the
muster is a player-sounded ritual the policy never performs, so the count
is 0 by construction — not by village weakness (5–10 living on refusal
days) and not by a broken counter (the counter reads the muster record
correctly; there is simply no record).

**Documented (not fixed here):**
- Whether 10 is reachable WHEN the call is sounded is still unmeasured.
  The count then depends on allied links answering (trust ≥ 25, opinion ≥
  −10, no arrears) plus up to 3 Haven blades — a call-sounding policy or a
  staged probe is the next instrument.
- The 10 seeds with no herald meeting at all: the muster question is moot
  where no herald appears. A muster census on a herald-rich band would
  strengthen the answer; this corpus's 6 herald seeds already settle the
  structural point.

**Metric review (frozen bars NOT re-scored):** the bars held. The B1
amendment (same-day inheritance) was forced by the recorder's dedup
behavior, which the prereg did not know about — a corpus DIAG's bars
should name the dedup rule up front next time. The B2 prompt-line fix was
a classifier bug, not a bar problem. The "you have N" line proved to be
exactly the gate count (F2 r243), so the corpus read is authoritative for
the count, and the zero is a fact about the substrate, not the instrument.

## 8. Closeout state

- Coordinator-run DIAG on the existing tbrefuse corpus (worktree
  registrations for a fresh-band version failed twice on the container
  write flap; see round record). Precedent: Loop A 1115Z coordinator-run
  DIAGs.
- Files: prereg + analyzer + proof test + analysis JSON + this evidence.
  Zero src/js. Proof 6/6.
- **Ready to merge, pending ship.** Do NOT push, do NOT bump versions.
  The ship loop owns deploys.
- Verdict for the coordinator: **DIAG-GO** — the muster question is
  answered on this substrate; the next arm is a call-sounding instrument.
