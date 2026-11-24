# sim-titanmuster-b — prereg (frozen 2026-11-24 ~19:15Z, coordinator-run DIAG)

## Question
Can any village assemble 10 allied blades — the titan muster? (Tracker
winnability-chain blank #2; tbrefuse follow-up metric.)

## Background (why this is a corpus DIAG, not a fresh band)
- sim-tbrefuse-b (evidence/2026-11-24/sim-tbrefuse-b.md, DIAG-GO, merged
  095bd33c3) measured 91 non-building startCombat calls on band 109310–109325
  (16 seeds, 150d, competent verbatim): 76 titan-refusals, all herald, all
  on "muster 10 allied blades (you have 0)"; 3 heralds killed later in the
  field, 3 still waiting at day 150.
- The muster count is computed by `titanMusterBladeCount` (src/js/titans.js):
  unique living allies in the titan's muster record + committed Haven blades.
  The muster record exists only after `soundTitanCall` (a player/UI verb;
  the competent policy never sounds it; only scripts/policies/commitrefresh.js
  calls the commit verb, and it was NOT the tbrefuse substrate).
- Two worktree registrations for a fresh-band version of this arm failed on
  the container write flap (18:52Z, 19:00Z). This DIAG answers the question
  from the existing corpus instead. No new sims. No game-code change.

## Corpus (frozen)
- `evidence/2026-11-24/perseed-tbrefuse-b/tbrefuse-b-s10931{0..5}-tbrefuse-b-v2.json`
  — the 16 -v2 files ONLY (the non-v2 files are the pre-Amendment-#1
  instrument; using both would double-count). 150d, competent verbatim.
- Anchor commit: whatever the tbrefuse corpus records (reported, not re-run).

## Primary metric
Max muster count `have` ever read at a titan refusal, across the whole
corpus — plus the count of real call soundings (`📯 THE CALL GOES OUT`)
in the corpus. The question is whether 10 is reachable, not whether the
gate fires: the gate is already known to fire.

## Frozen bars (DIAG-GO requires all five)
- B1 — classification complete: all 76 titan refusals classified with
  have/need extracted (have from the recorded outcome or the spoken line;
  need = 10 for heralds). Zero unclassified.
  AMENDMENT #1 (recorded 2026-11-24 ~19:18Z, BEFORE judging the verdict,
  after the first analyzer run): the refusal line is said ONCE per titan
  per day by design (titans.js REFUSAL-SPAM dedup), so 21 repeat refusals
  carry no line of their own. A refusal classifies by inheritance from the
  same (titan, day) group's firing refusal — same titan, same day, same
  gate count by code — and the analyzer reports the inherited count
  separately (21). The bar's intent (every refusal gets the exact gate
  count) is unchanged; the mechanism is inheritance, not per-row extraction.
- B2 — muster-line census complete: every "you have N" occurrence in the
  corpus counted, N distribution reported. (Prior grep: 83 occurrences, all
  N = 0 — the analyzer must reproduce this from the parsed JSON, not the
  grep, and report any nonzero N if one exists.)
  AMENDMENT #2 (recorded with #1): the prompt-line classifier must exclude
  strings matching the muster-line regex — the refusal line itself contains
  "sound the call", so counting it as a prompt inflated promptLines to 91.
  Genuine prompt lines (dawn/growth text) number 8.
- B3 — call-sounding census complete: every real sounding of the call
  (`📯 THE CALL GOES OUT`) counted with seed/day. Prompt lines
  ("Sound the call" in dawn/growth text) are classified separately and do
  NOT count as soundings.
- B4 — counterfactual stated: for each titan-refusal day, the village's
  living count (daily row `livingCount`) and armed strength are reported,
  so the verdict can say whether a muster COULD have existed (villagers
  present but never called) or the village genuinely had no blades.
  Mechanism named from code with file/line cites.
- B5 — instrument health: 0 parse errors, 0 unclassified refusals, analyzer
  selftest green, determinism check green (two runs, byte-identical output).

## Verdict rule
DIAG-GO if B1–B5 pass and the answer is stated with numbers (max `have`,
call soundings, blocker named). The bars judge completeness, not direction:
if `have` ever exceeds 0, the answer changes (10 may be reachable) but the
verdict is still DIAG-GO. DIAG-NO-GO only if a bar fails (incomplete
classification, unparseable corpus, or the mechanism cannot be named).

## Horizon / seeds / policies
- Horizon: the corpus's own 150d (death-aware, as recorded). No new horizon.
- Seeds: the 16 tbrefuse seeds, 109310–109325. No new seeds.
- Policy: competent verbatim (as recorded in the corpus).

## Metric review (to be filled in the evidence file, NOT re-scored here)
- Whether the "you have N" line is the right read of the gate count
  (F2 r243 unified the spoken count with the gate count — cite titans.js).
- Whether a corpus-only DIAG can settle reachability, or whether a
  call-sounding policy / staged probe is still needed to measure the count
  when a muster IS assembled.

## Next step (for the round record, not this arm)
If the verdict is "never sounded, count structurally 0", the next arm is a
call-sounding instrument (a policy that sounds the call, or a staged probe
that builds a muster and reads the count) — NOT another corpus re-read.
