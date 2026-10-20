# Journey social r31 — recap + silence exhaustion fixes (lane B, 2026-10-20)

Run id: oversight-playtest-loop-2-2026-10-20T01:58:31Z.
STALE-LOCK RECOVERY: the 2026-10-19 23:55Z run (journey2-social r30) died
~1 min after its last heartbeat (61 min stale at pickup, no live process,
branch had zero commits, 13 untracked files). Per the overlap guard it was
DEAD. Its untracked evidence/scripts (94 files) were backed up to
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/dead-run-recovery-20261019-journey2-social/`,
the tree released as abandoned and removed, the branch deleted, and this run
re-registered the slug fresh. r30's pilot + analysis were adopted, not
re-done: r31 re-ran the pilot on the current tip with fresh seeds.

## Pre-registration (written before the pilot ran)

- **Leg question**: r30's pilot found two REAL gaps on the old tip — (a) the
  r27 recap-reframe pool WRAPS on the 4th pick (Olivia s2006: the reframe
  became the repeat, L2' violation), (b) a silent favor settle in the smoke
  seed (Ursula s2007). Do both reproduce on the current tip, and can they be
  fixed with RED->GREEN proof? Plus the standing question: do comfort/grief
  beats read like people across multi-turn exchanges (sense-read)?
- **Interesting-finding bar**: any verbatim content-line repeat in one
  conversation (L2'); comfort-pool verbatim cycling; gossip naming false
  state or fabricated shared history; a silent favor settle; an unfireable
  comfort/mourning beat.
- **Binding (pilot)**:
  - M1 L2' verbatim-repeat: GO = any verbatim content-line repeat in one
    conversation -> fix with RED->GREEN proof.
  - M2 comfort-repeat: GO = verbatim re-serve of comfort engage/opener in
    one comfort conversation -> fix.
  - M3 gossip-truth: informational — sense-read transcripts for false state
    or fabricated shared history.
  - M4 settle-speak: silent settle count > 0 -> BUG, fix.
  - L3 social arc: bonds/deepBonds/betrayalCases/mootsConvened/gossipConvos/avgTrust.
- **Seeds**: smoke 2013 (10d self-test), then 2010, 2011, 2012 (fresh).
  Horizon DAYCAP=140, death-aware (+10d tail). Policy: 'deep' driver +
  favoritism wrapper + moot duty + gossip forcing + comfort forcing
  (r24–r30 continuity).
- **Per-leg telemetry baseline**: `telemetry-baselines/social.json`
  (seeded r26, rolled r27). Checked AFTER the pilot, BEFORE any fix.

## Pilot verdicts (current tip, seeds 2010/2011/2012 + smoke 2013)

- M1 L2': **GO** — two findings, both the same bug class (tiny pool +
  convoPickCycle wrap):
  - GO-1 (r30 carryover): recap-reframe 3-template pool wraps on the 4th
    recap pick. Confirmed on tip via the r31 RED test (pick #6 re-served
    pick #3's reframe verbatim).
  - GO-2 (new): mood-silence pools are 2 lines (warm/cool/tense) and
    alternate A,B,A,B,A on 3+ consecutive silences in one sitting
    (transcript: seed 2012, Dale, day 16, turns 3–7).
- M2 comfort-repeat: MISS (0 hits, 29 comfort convos scanned).
- M3 gossip-truth: no false-state/fabricated-history beats found in the
  sense-read sample (25 transcripts + 8 moot files).
- M4 settle-speak: MISS on all seeds (settles 5/5, 4/4, 5/5 spoken; smoke
  1/1). The r28 settle-on-speak fix holds on tip — r30's silent settle
  does not reproduce.
- L3: bonds 43–92, deepBonds 15–39, betrayalCases 4–38, moots 4–33
  convened end-to-end, avgTrust 55–84. Social institutions fire at full-run
  scale.
- dryRate 1.65–2.52 per 12 NPC turns (informational).

## Fixes (both RED->GREEN, proof tests in scripts/)

1. **Recap-reframe pool wrap** (`src/js/conversation.js`): the reframe is now
   count-aware per sitting — the 3 templates serve once each, then the NPC
   escalates honestly ("I've told you three times now — …", "We're going in
   circles a bit — …", each said exactly once), then the recap choice spends
   out of the menu for the sitting via the existing `convoSpendChoice`
   ledger (a fresh sitting re-offers it). No verbatim cycle is possible by
   construction. Proof: `scripts/test-social-r31-recap-wrap-20261020.js`
   (RED pre-fix: pick #6 == pick #3; GREEN post-fix). r27 regression test
   still GREEN.
2. **Mood-silence pool wrap** (`src/js/convo-mood.js` + `src/js/conversation.js`):
   count-aware per sitting per band — pool lines serve once each, then one
   honest escalation per band ("This is nice, but — …Did you come to tell me
   something?" / cool / tense / fill variants), then the moment is spent:
   the turn drains the energy budget so the EXISTING convoMaybeWinddown
   machinery closes it naturally (r18 dry-streak precedent — no new system,
   per Steve's root-cause-first rule). Silence stays available (canon); it
   just stops narrating itself in circles. Proof:
   `scripts/test-social-r31-silence-wrap-20261020.js` (RED pre-fix:
   A,B,A,B,A verbatim; GREEN post-fix). Regression: test-silence-grammar,
   test-mood-honesty, test-moodbeat-pools all GREEN. `test-convo-mood.js`
   errors on the `agree` branch (`this.resolveConsequence is not a function`)
   — PRE-EXISTING: the ancient test's hand-rolled eval list predates the
   module providing resolveConsequence; untouched by this run's diff.

## Village assessment (census, plain words)

- **Seed 2010** (41 days, brutal): 10 of 13 dead by day 28 — Somchai and an
  unnamed elder in the first week, then a mid-month cascade (Mia, Wei, Jana,
  Jorge, Silas, Peyton, Esmeralda). Three left standing at day 41. The
  village barely cohered — 41 conversations, but 12 of them were comfort
  sittings: the living spent the month grieving, not building.
- **Seed 2011** (110 days, thriving): only 4 deaths (two early, two to age/
  attrition at 61/64). Seven alive at the horizon. The social graph is dense:
  189 conversations, 77 deep, 36 deep bonds, 31 betrayal cases argued through
  31 moots, avgTrust 81. This is a village with a functioning justice
  system and long memories.
- **Seed 2012** (142 days, full run): 7 deaths spread across the run (Dale
  and two others in the first three weeks, then Ines at 48, Aki at 63,
  Mason at 66, Willie at 91). Seven alive at day 142. Quieter socially
  (77 convos) but the comfort layer carried weight — 11 comfort sittings,
  59 comfort picks, zero verbatim cycling.

## People check (SENSE-TESTING LAW — transcripts read, not counted)

- Ines (s2012, grieving): opens with real grief, deflects the moot question
  honestly ("I keep my head down"), holds a boundary when asked what
  happened ("Someday I'll tell it right. Not tonight."), and closes warm.
  A person with an interior, not a vending machine.
- Moot s2010 case_1 (theft, Silas v. Peyton): the System's unhinged broadcast
  voice, gossip fragments by the fire, a verdict beat with gravity ("A pause
  long enough to live in… 'Guilty.' Nobody looks at anybody."), and social
  aftermath ("Silas doesn't gloat… the nods they get by the fire, later —
  those are real."). Public consequences, as designed.
- The two fixed filler loops were the only robotic behavior found; comfort
  beats across 29 sittings read like people.

## Metric review

- The L2' detector flags `<silence>`-kind lines. The r25 code comment
  ("mood-silence is grammar, not content") exempts CROSS-VILLAGER same-day
  repetition (defect 7's target), not within-conversation cycling — the Dale
  A,B,A,B,A alternation is the same filler-loop class r27 fixed for recap,
  so the GO verdict stands and the fix is in. No metric revision needed;
  the detector's kind labeling is correct as-is.
- M4 settle-speak: r30's smoke-seed silent settle does not reproduce on tip
  (r28's settle-on-speak fix covers it). The metric stays; the bug is gone.
- Telemetry check vs `telemetry-baselines/social.json`: QUIET (3 files,
  7 metrics, no large deviations) — the fixes are behavior-neutral at the
  panel level, as intended.

## Reachable / fun / winnable (leg 5)

- **Reachable**: yes — 25 transcripts across 3 full runs; comfort/moot/
  gossip systems fire without driver heroics.
- **Fun**: yes — the sense-read sample is the strongest social writing the
  loop has seen (boundary-holding grief, menacing gossip, weighty moots).
  The two filler loops are fixed.
- **Winnable**: n/a for the social leg in isolation — but the social layer
  no longer leaks: no silent settles, no verbatim loops, trust arcs intact
  (avgTrust 55–84 across runs).

## Follow-ups for later runs

- `test-convo-mood.js` pre-existing breakage (ancient eval list missing the
  resolveConsequence provider) — out of scope for r31, noted for a tooling
  pass.
- Next leg per rotation: 6 (crisis).
