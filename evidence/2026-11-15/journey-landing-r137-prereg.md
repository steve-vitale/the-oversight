# journey-landing r137 — PREREG (Lane A, leg 0 LANDING)

**Run id:** journey-landing-20261115T2059Z (scheduled Sun 2026-11-15 14:45 CST).
**Base:** local master at run start (`abc52dce1`, journey-scale r215).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg: establishment.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch `journey-landing`).
Heartbeat at registration; heartbeat re-armed every <15 min for the whole run.
(Registration note: the register script was killed by a runtime restart
mid-`git worktree add`; the worktree+branch existed but the registry entry
did not and the checkout was left 98,971 files short. Recovered by
completing the registry entry in the script's exact schema under flock +
atomic replace, removing the stale `index.lock` left by the killed
`git reset --hard`, and re-running the reset to 100% — worktree clean at
`abc52dce1`, STATUS_LINES 0. No work was lost; nothing was hand-merged.)

## Q1 (PRIMARY) — the want-thread resume re-pose fix (r136 carried Q1)

r136 confirmed with two takes (Liam 1144-d6, Yara 1142-d5, r136 corpus):
picking "We never finished — <question>" on a deflected curious question
speaks only the generic acknowledgment ("About needing to be alone — yeah,
we never did get back to that.") — the question is never re-posed and the
thread dies there.

### Mechanism (verified by reading the code, not inferred)

- The resume-take handler is `alive:thread:want` in conversation.js: it
  sets `c.thread='want'` and calls `convoThreadBeat(vid)`, which for a want
  calls the def's `engageBeat`.
- For curious, `engageBeat` returns null by the r121 first-reveal guard —
  it only fires after the player answered the question IN THIS SITTING
  (convo-wants.js). The guard is CORRECT and must not break: the NPC must
  not react to a revelation that never happened.
- With a null beat the handler falls through to the generic resume line.
  Both confirmed takes are INTRA-sitting: the question was asked at the
  opener, deflected, the thread planted by the subject change
  (convoNoteBeat), then resumed in the same sitting. The question id lives
  on `c.want.qid` (same want object, same sitting).

### Fix (this run, in `src/js/conversation.js`, `alive:thread:want` handler)

When beat is null and the live want is a question-want
(`def.answerEngages` — today only curious) with a known, unanswered qid
(`c.want.qid || c.want.seedQid`, not in `c.answered` as a real answer),
re-hang THE SAME question: `convoQuestionDef(qid)` +
`convoAcceptWantQuestion(vid, {question:{id, answers}})` — the machinery
the 'request' branch already uses — speak the question itself as the
resume line (bare, per the r215 stutter ruling: a resume asks the
question, it never prefixes "About X —"), and REOPEN the want
(stage 3 → 1, resolution cleared) so a subsequent answer can engage it
(the turn tail only engages answers while stage < 3).

Deviation from the r136 note's sketch, recorded: the note said "via
convoWantOpener" — but the curious opener hangs a FRESH question unless
fromSeed (`convoHangWantQuestion` picks an unasked one), which would
re-ask a DIFFERENT question (the r14 defect). The qid lives on
`c.want.qid` in the intra-sitting shape, so the fix builds the re-hang
from that qid directly. Same machinery (`convoAcceptWantQuestion`), same
outcome (the same question, its answers offered).

Guards preserved:
- r121 first-reveal guard untouched (`engageBeat` still null pre-answer).
- HEED-ENGAGE path untouched (beat non-null short-circuits first — the
  warn_you resume still speaks its warning).
- Generic line stays the fallback when no qid resolves or the def is not
  a question-want (ledger-blocked favor beats, non-question threads).
- The re-pose can only fire when no pendingQ hangs: the menu offers only
  answers/deflect/leave/silence while a question hangs, so the resume
  choice is unreachable mid-question.
- The spoken line rides the existing structural exemption (beat null →
  `structuralTurn` true), the same exemption the generic fallback it
  replaces already uses — a deliberate re-ask at the player's explicit
  request ("We never finished"), not a ledger slip.

### Proof (binds)

New `scripts/test-convo-want-resume-repose-20261115.js` (modelled on the
r215 seed-resume proof: seeded PRNG before eval, full production script
list, scripted sittings via startConvo/convoTurn):
1. **Liam shape:** curious opener → `deflect_q` → change subject until
   the menu offers `alive:thread:want` → take it. Assert: the THEM line
   IS the same question; `pendingQ.id` is the same qid; the next menu
   offers `ans:<qid>:*`; `want.stage === 1`, resolution cleared. FAILS
   pre-fix (generic line, `pendingQ` null, no `ans:` choices).
2. **Answer arc:** answer the re-posed question → stage 2;
   `endConvo('left')` → resolution `engaged`. (The reopened want
   completes honestly; a re-posed question that cannot engage would be
   a new defect.)
3. **honest_pass shape:** curious → `honest_pass` → resume-take →
   question re-posed (the player re-opened it; the opt-out stands only
   until they pick the thread back up).
4. **Control (non-question thread):** resume a `village` thread → its
   beat / generic line, `pendingQ` stays null, no `ans:` choices.
5. **Control (HEED path):** the r131 warn_you resume is covered by the
   existing suite — run `test-convo-curious-seed-resume-20261115.js`,
   `test-convo-engine-trust.js`, `test-person-trust-20261108.js`, and
   `test-analyze-landing-q1-dialogue-heedv.js` as regression after the fix.

## Q2 — Fresh landing panel (regression watch)

Driver: the r136 driver verbatim except OUTDIR `landing-r137-after` and
header. Seeds 1142–1151, DAYS=28. Corpus in goal hidden_files
`evidence/2026-11-15/landing-r137-after/`. Master has moved since r136
(scale r215: curious-resume stutter fix + trust-test harness fix) — this
panel is the regression watch on the new master AND the before/after for
the Q1 fix (the panel must show resume-takes re-posing, not acknowledging).

**Bars (bind, judged against r132/r134/r135/r136):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG invariant PASS.
- Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10.
- Pocket watch: 0 pocket fights, 0 stuck turns.
- D1 watch: 0 garbled-label renders.
- HEED: legacy count reported; **HEED-V = 0 BINDS from this run** (r136
  proposal: a real verbatim repeat is a defect; the r136 panel read
  HEED 1 / HEED-V 0 on a sitting that reads clean).
- M-PR1: max per-seed never-offered ≤ 1 (r129 bar).
- Personal bridge: 0 repeats in a sitting. Small bridge: 0 repeats.
- Presshop farUnreached reported (carried shape, r131→r136 = 1 each).
- R66 HUNGRY: starvation deaths 0, starvingWarnings 0.
- 1130-d6 amnesia shape: 0 recurrences. Miriam line: 0 "That's settled".
  Deflect-fallback: 0 `fellBack`.
- Nodloop: LOOP=0.
- Q1 panel watch: resume-takes of deflected question-wants re-pose the
  question (answers offered next menu) — report the count; a take that
  still ends in the generic acknowledgment is a Q1 failure on live data.
- Pilot first: seeds 1142–1145; expand to all 10 unless the pilot is
  broken (a broken pilot is a loud failure, not a quiet skip).

## Q3 — People check (M5, sense-read)

Read 5 full transcripts from the Q2 panel. Bar: each sitting shows the
NPC wanting something, options engaging or deflecting it, endings
resolving / planting / owing. No fabricated shared history, no filler
loops, no static menus. Include at least one resume-take sitting if the
panel produces one (Q1 watch) and read it for the re-pose.

## Q4 — Telemetry

`telemetry-check.js` on the Q2 panel vs
`telemetry-baselines/landing-split.json` (re-pinned r136: 81/9/217/15/0).
LOUD lines are same-run investigation items. Baseline is NOT rolled
unless the panel carries new information.

## Policies / seeds

- Landing panel: seeds 1142–1151, 28d, r136 driver verbatim except
  OUTDIR/header.
- Person-trust panel: seed 84101, 30d, `scripts/policies/competent`.
- No threshold, bar, price, or gate changes in this run except the Q1
  fix above (src/js, with proof) and HEED-V binding (instrument
  decision made in r136, applied here as pre-registered). If the panel
  surfaces a further game defect, fix in the worktree with a proof
  test, or document and carry.

## Carried (unchanged)

- Teaching the shared chooser to take nv:accept (r197 lane decision owed).
- Hunt assignments still never resolve in the landing window (H1-ESTABLISHED).
- NV sittings share one closing template (palms-pressed goodbye) — middles
  are their own; observation only.
- HEED filler-loop shape (Dauletkhan warn_you, 1150 d6) — legacy watch
  item; the sitting itself resolves engaged, and HEED-V now scores it 0.
- Analyzer vs transcript streak count (r134 carry — analyzer maxSameStreak=1
  on nv sittings vs transcript summary maxStreak=4–5; the analyzer counts
  same-pick runs, the summary counts the sitting length). No bar depends
  on the difference.
