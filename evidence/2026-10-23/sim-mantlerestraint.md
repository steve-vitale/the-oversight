# sim-mantlerestraint — GAME-SIDE MANTLE-RESTRAINT (axis scale-onramp)

Worker tree sim-mantlerestraint, branch sim-mantlerestraint, run
fleshout-20261023T1730Z arm (A). The vetretention-restage's named next #4:
a candidacy hook in ledger.js playerDeath — skip in-window (14d
post-first-wave-4+-kill) blooded vids as succession candidates, voiced as
the village holding its blooded back from the office while they recover.
Game-side, MANTLERESTRAINT=1, default-off. [needs-eyes] (feel change).

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md (wave 4 = The
Mirror Draft; the defer5 VETERANS bar = 2 living roster members with
wave-4+ kills in state.waveKillLog, src/js/standing.js). Then the
re-stage evidence (evidence/2026-10-23/sim-vetretention-restage.md), the
vetkill autopsy (evidence/2026-10-23/sim-vetkill-autopsy.md), and the
mantlechain DIAG (evidence/2026-10-22/sim-mantlechain.md). No canon doc
covers village protection rites — stated, not invented.

## The surface

sim-vetkill-autopsy: the killers EXIST then DIE — 8/10 wave-4+ killer
vids died 1–8d AFTER their kills in later attritional combat, 0 in the
wave-4 fight itself. sim-vetretention-restage (revised bars): the
retention layer's addressable population is scope-starved — THE CHAIR
DOMINATES blooded-vid mortality: 7 control + 6 armed chair-censored
deaths inside the 14d window vs ZERO fighter window-deaths on either
arm. The restraint attacks the chair channel directly: a blooded vid
inside the 14d post-kill window cannot take the mantle — they stay a
fighter through the attrition window, and the village says so out loud.

## The lever (game-side, MANTLERESTRAINT=1 default-off)

src/js/ledger.js — Game.mantleRestraint(cands, trust), hooked into
playerDeath between the trust sort and the pick:

1. Blooded-in-window test: vid has a wave-4+ kill in state.waveKillLog
   with kill day in [firstKillDay, firstKillDay+14] of the current day
   (first-kill index, the re-stage analyzer's convention). waveKillLog is
   DEDUPED on (d, mid, by, via, trick) first — backlog #844, the engine
   double-writes on lost fights.
2. Fallback: if ALL succession candidates are in-window blooded, the one
   whose window expires soonest takes it (earliest firstKill+14) — the
   village is never left scholar-less.
3. Candidacy only — trust values are NEVER touched (the restraint cannot
   feed the succession rule; the game's own mantle trust inheritance
   still runs on the pick as before).
4. Voiced + traced: every filter writes state.mantleRestraintTrace
   ({d, skipped, picked, fallback, outcomeChanged}); the voice fires only
   when the restraint changed who takes the Codex (voicing a skip that
   changed nothing would be a fiction lie).

@ontology provides updated; scripts/validate-ontology.js green (128/128).

## Design calls (Steve 2026-10-07: make the call, document it)

1. Window = 14d post-FIRST-kill (the re-stage's window, first-kill index).
   A later kill does not extend the window — the village holds them back
   for the fortnight after they first bleed, not after every fight.
2. Fallback picks soonest-expiring, not highest-trust: the fiction is
   "closest to recovered," and it keeps the trust sort honest among the
   blooded (no trust surgery to justify the pick).
3. Voice fires on outcome-change only. The trace is the complete honesty
   record; the transcript never claims a hold that changed nothing.

## PRE-REGISTRATION (§14 binding — written BEFORE any sims)

- PRIMARY: blooded-vid 14d-window survival share (first-kill index,
  chair-censored, incomplete-window excluded — scripts/
  mantlerestraint-analyze.js, join conventions verbatim from the
  re-stage's scripts/vetrestage-analyze.js): armed − control ≥ +25pp AND
  ≥6 evaluable blooded vids per arm. GO requires both. A miss is NO-GO,
  never re-scored.
- ENGAGEMENT: ≥6/8 seeds have ≥1 blooded vid whose succession candidacy
  was actually skipped (state.mantleRestraintTrace on the armed arm).
- GUARDRAILS: median survival paired diff ≥ −10d; starvation ≤
  control+2; no new death kinds (≥2-event rule); report wall
  (national/table/wins, wave4/5, median survival) both arms.
- SECONDARY: defer5 veterans-bar co-satisfaction (max simultaneous
  living wave-4+ killers per config, offline join); chair diagnostic
  (censored counts per arm — the restraint should shrink the censored
  set, converting chair deaths into fighter-window outcomes).
- SEEDS: 65511–65518 × {lead,belong} × {control,armed} = 32 configs,
  180d death-aware, paired identical seeds. Never a fixed 200d; dead
  villages stop (+10d tail max).
- SUBSTRATE (pinned BOTH arms): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
  WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1. Control = restraint
  off; armed = restraint on. ONE DELTA ONLY.
- §15: before/after through scripts/balance-panel.js
  (scripts/build-mantlerestraint-panels.js) — the panel is the
  instrument, the bars above are the judge.
- METRIC REVIEW section mandatory (below).

## Convergence state

KILLED-AT-SWEEP (CONCEPT-DEAD) — 2026-10-23. The lever is the wrong
lever, confirmed by root cause (see Metric review §3). Game code
reverted (src/js/ledger.js, docs/ONTOLOGY.md); proof test removed
(was 25/25 GREEN pre-kill — the mechanism was correct, the substrate
doesn't need it). Instruments + evidence kept as the kill record.

## Proof

scripts/test-mantlerestraint.js — **25 PASS, 0 FAIL**:
- E1 shape (2/2): ledger.js carries mantleRestraint(); @ontology
  provides names it.
- E2 env-gate (2/2): MANTLERESTRAINT unset → returns null even with
  blooded candidates (off = pure delegation).
- E3 synthetic RED→GREEN on a real Game (14/14): in-window blooded top
  pick skipped → next-highest takes the candidacy, outcomeChanged;
  window-expiry re-admits (d110 > 95+14); fallback when all candidates
  blooded → soonest-expiring window picked, never scholar-less;
  #844 dedupe (dupes don't move the window — anchored at first kill);
  trust map byte-identical after the filter; voice silent when the skip
  changed nothing (trace still recorded).
- E4 real playerDeath end-to-end (5/5): injected wave-4 kill for a real
  roster vid set top-trust → the scholar's death routes around them to
  the second-highest; the restraint voice line fired; trace written
  ({d, skipped, picked, day}); no non-picked trust entry touched (the
  picked vid's rewrite is the game's own pre-existing mantle trust
  inheritance — office*0.4 + own*0.4 + vouch, ledger.js — not the lever).
  Gate-off control: the same death picks the blooded top with no voice.
- E5 det-gate (1/1): MANTLERESTRAINT unset → 30d run twice,
  byte-identical digests.
- Cross-tree det-gate: the sweep's control arm (gate OFF) vs the
  committed re-stage control corpus — 3/5 configs byte-identical so far;
  2 diverge. See "base drift" in Metric review.

## Sweep

32/32 configs (seeds 65511–65518 × {lead,belong} × {control,armed}),
180d death-aware, pinned substrate. Corpus:
evidence/2026-10-23/perseed-mantlerestraint/. Analyzer:
scripts/mantlerestraint-analyze.js. Det-check:
scripts/mantlerestraint-detcheck.js. §15 panel: (TBD).

## Results

**VERDICT: NO-GO on both binding bars. KILLED (CONCEPT-DEAD).**

Analyzer (scripts/mantlerestraint-analyze.js, 32/32 configs):

- **PRIMARY: NO-GO.** Control 3/3 evaluable blooded vids survived the
  14d window (100.0%) | Armed 3/3 (100.0%) | delta **0.0pp** (bar:
  ≥+25pp AND ≥6 evaluable/arm). thin=true.
- **ENGAGEMENT: NO-GO.** 2/8 seeds had ≥1 blooded vid whose succession
  candidacy was skipped (bar: ≥6/8). Seeds: 65514, 65515.
- **CHAIR:** control censored=6 windowDeaths=0 | armed censored=5
  windowDeaths=0. The restraint moved the chair channel by 1 death;
  fighter-window deaths were 0 on both arms.
- **VETS co-satisfaction (≥2):** control 2/16 | armed 2/16 (no move).
- **GUARDRAILS:** all GO — median survival diff 0d; starvation 24/24
  tied; no new death kinds.
- **WALL (identical both arms):** national 7/16, table 14/16, wins
  0/16, wave4 13/16, wave5 2/16, median survival 121d.

The lever fires rarely, moves nothing it was built to move, and the
window it protects is already safe. Root cause in Metric review §3.

## Sense verdict (SENSE-TESTING LAW)

scripts/sense-mantlerestraint.js replayed s65515-belong
(MANTLERESTRAINT=1). The restraint fired 5 times: d100 (Tashi Sherpa
held back, Divya Miller picked), then a d102 succession cascade —
Divya → Aria → Yara → Tariq die in one day, the village holding Tashi
back each time, until the fallback engages ("There's no un-blooded
hand to take the Codex — everyone the village trusts most is still
shaking off a kill. Tashi has the shortest road back, so they take
it. 'We don't get to rest,' somebody mutters. 'We get to hold it for
each other.'"). Tashi dies the same day; the village dies out.

The beats read as people protecting people — PASS:
- d100: "Victor would have wanted Tashi to carry it — the village
  almost did. But Tashi needs their hands back first." Divya takes the
  Codex instead. (Names the actual dead bearer, not a canned line.)
- The cascade repeats the shape four times, but each instance names
  the new dead bearer — the repetition IS the story (a village in
  crisis refusing to hand the office to its blooded), not a robotic
  loop.
- The fallback beat is honest about the fiction: no un-blooded hand,
  shortest road back, "we get to hold it for each other."

No silent overrides (every filter traced; the voice fires exactly when
the pick changed), no fiction lies (no voice when the skip changed
nothing). VERDICT: PASS.

## Village assessment

The villages in this sweep look like the 1115Z/1215Z wall substrate:
national 7/16, table 14/16, wave4 13/16, wave5 2/16 — the scale wall
stands, and the restraint doesn't touch it (wall identical both arms).
Blooded vids (wave-4+ killers) are rare (3 evaluable per arm across 16
configs) and, when they exist, they survive the 14d post-kill window
at 100% whether held back or not. The mortality the re-stage named
(chair-censored deaths inside the window) is real but the restraint's
access to it is a keyhole: succession must coincide with an in-window
blooded vid, which happened on 2/8 seeds.

The sense replay (s65515-belong) remains the best thing about this arm:
a village in crisis holding its blooded back, naming each dead bearer,
the fallback beat honest about having no un-blooded hand. Good fiction,
inert system.

## Named nexts

1. The chair channel (blooded vids dying as mantle-holders) is real
   (6/5 censored here; 13/18 in the re-stage). If it's ever attacked,
   the intervention must be broader than a 14d candidacy skip — the
   sparsity is structural, not a measurement artifact.
2. The 14d post-kill window is not a mortality window on current
   master (100%/100% fighter survival). Any future "rest the blooded"
   design must first establish that rest prevents something.
3. The vetretention-restage named nexts #1–3, #5 remain open; #4
   (this arm) is closed as CONCEPT-DEAD.

## Metric review (§14 — the bars bind the run; honest caveats)

1. BASE DRIFT on the cross-tree det-gate: the re-stage control corpus
   was committed at anchor e9bce3b685e9; this tree is at 30b6ad6e306f,
   3 src/js commits later — including c8d7c787d ("succession meal:
   trust half-ration gate now only for new bodies", Steve 2026-10-23),
   a game-code change in the succession/trust area. 2/5 control configs
   diverge from the committed corpus with the restraint gate OFF; 3/5
   reproduce byte-identically. The divergence is base drift, not lever
   leakage: with MANTLERESTRAINT unset the only executed new code is
   the env read + `return null` (no state, no RNG — provably inert),
   and the proof's E5 det-gate (30d ×2 byte-identical on this tree)
   holds. The within-tree armed-vs-control hash-prefix check (hashes
   identical up to the first trace day) is the binding det-gate for
   this run.
2. KILL JUSTIFICATION (Steve 2026-10-21 kill discipline — root cause,
   not just a missed bar): the lever is CONCEPT-DEAD, confirmed on
   three independent grounds. (a) The prevented outcome has base rate
   zero: fighter-window mortality is 0% on BOTH arms (100%/100%
   survival) — there is nothing for the restraint to prevent. This is
   not a thin measurement; it is an empty channel. (b) The intervention
   point is structurally sparse: succession coinciding with an
   in-window blooded vid fired on 2/8 seeds — not a pilot artifact but
   the lever's real-world rate, because blooded vids are rare (3
   evaluable per 16 configs) and successions are rare. (c) The chair
   channel the lever was built to attack moved 6→5, a negligible nudge
   consistent with noise at 2/8 engagement. The re-stage's
   chair-dominance finding is real, but a 14d candidacy skip is the
   wrong instrument for it — the window is safe, the keyhole is tiny,
   and the effect is zero. Killed with teeth: game code reverted, no
   trace left in src/.
3. §15 panel: not built — the analyzer's paired identical-seed
   comparison is the binding judge and the verdict is a clean NO-GO
   on both bars with zero primary delta. A panel would confirm the
   wall's identicality, which the analyzer already reports.

## Instruments committed (namespace mantlerestraint) — KILL RECORD

KILLED-AT-SWEEP (CONCEPT-DEAD) 2026-10-23. Game code REVERTED
(src/js/ledger.js Game.mantleRestraint + playerDeath hook, docs/
ONTOLOGY.md provides line) — no trace in src/. Proof test REMOVED
(scripts/test-mantlerestraint.js was 25/25 GREEN pre-kill; the
mechanism was correct, the substrate doesn't need it — recorded here).

Kept as the kill record:
- scripts/mantlerestraint-sweep.js — the 32-config census (pinned
  substrate env guard, direct waveKillLog + windowstay death capture +
  mantleRestraintTrace)
- scripts/mantlerestraint-analyze.js — the judge (re-stage join
  conventions verbatim; trace engagement; chair diagnostic; vets
  co-satisfaction; guardrails; wall)
- scripts/mantlerestraint-detcheck.js — cross-tree det-gate
- scripts/sense-mantlerestraint.js — narration replay (sense PASS)
- evidence/2026-10-23/perseed-mantlerestraint/ — the corpus (32 files)
- evidence/2026-10-23/sim-mantlerestraint.md — this file

Anchor: 30b6ad6e306f. Zero policy files (game-side arm). Merged: YES —
coordinator merge of the kill record (evidence + instruments only,
zero src/js).
