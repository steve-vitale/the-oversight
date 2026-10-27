# TACKLE-TEACH AFTER measurement (2026-10-27, fix applied)

Fix (only game-code change): src/js/villager-build.js npcLearnFromTalk
now ledgers conversation ability-teaches — tele 'villager_talk_teach'
{vid, teacher, ability, level} plus a codex journal note naming teacher,
learner, and ability. The lesson itself is unchanged (teacher-held-only
pool, L2, systemArrived gate, L2+ skip). No gate thresholds changed.
A second candidate fix (stamp lastSeek only on a successful seek) was
tried and REVERTED after mechanism review: a wanting villager who finds
no teacher still learns via the System-broadcast fallback, so the only
seek that returns null is a saturated learner (every kit ability and
every teacher ability already known at cap) — and a saturated learner's
want is already null via plan-full, not via throttle. The change would
have been a no-op, so it was not shipped.

## Band totals, AFTER (same band, seeds 71001–71006, 30 days)

- WANTS: sheet 0, build 466, null 1514 (plan-full 1283, throttled 231)
- SEEK attempts 166, SEEK successes 136
- NEW-ABILITY total 124: teacher-seek 118, broadcast 0, sheet 6, other 0
- RETEACH 18, SKILL-NEW 353
- CONVO-TEACH: taught 6/6, ledgered 6/6 (was 0/6)
- Day-loop numbers are byte-identical to BEFORE, as expected: the fix
  changes only the ledgering of conversation teaches, which the day
  loop does not drive, and changes nothing about who learns what.

## Pre-registered bars vs measured (tackle-teach-prereg.md)

1. SEEK-ATTEMPTS >= 6 band total and SEEK-SUCCESS > 0: PASS
   (166 attempts, 136 successes; before identical).
2. NEW-ABILITY >= 6, teacher-majority, and EXCEEDS before: MIXED.
   >= 6 PASS (124). Teacher share PASS (118/124 = 95%).
   EXCEED before: TIE (124 = 124) — the fix changes ledgering, not
   day-loop occurrence, and the ideal-conditions band saturates
   identically (plans fill to 3, then build-seeking stops by design).
   This is a bar-calibration miss on the exceed clause, not a fix
   failure and not a regression: nothing decreased anywhere.
   Ledgered new teaches overall rise 124 -> 130 (the 6 conversation
   teaches are now counted; before they happened but were invisible).
3. NO-FREE-GRANT: PASS. Every after-run new gain traces to a teacher
   (118), a sheet show (6), or a ledgered conversation teach (6 in
   the convo probe); zero sourceless gains. Proof test check 6
   (teacher holding nothing teaches nothing) passes.
4. NO-REGRESSION on re-teaches / no npcKnow wipe / no gate change:
   PASS. Reteach 18 = before; buildScore/buildDecide untouched; no
   gate threshold touched.
5. CONVO-TEACH LEDGERED: PASS (0/6 -> 6/6, tele + journal note).
6. SENSE: PASS. Ledger line: "Anh picked up Iron Stomach from talking
   with you — what it does, and what it might go with." No teach line
   narrates a lesson that taught nothing (re-teach guard: second held
   conversation adds no teach and no ledger entry — proof check 5).

## Proof test

scripts/test-teach-new-proof.js: ALL PROOF CHECKS PASSED (7 checks:
setup, new teach via held conversation know 0->2, tele event with
vid/teacher/ability/level, journal note, readable sense line,
re-teach guard, no-free-grant guard).

## Regression

scripts/test-parity-20261014.js: 59 passed, 1 failed — the single
failure ("gear: they still wear their spear and jacket", a
mantleBecome equipment check) reproduces identically on unmodified
HEAD code, so it is pre-existing and unrelated to this change
(no conversation, gear, or mantle code touched).

check.js subsets (run after the fix; a full --quick run was killed
mid-list by an external SIGTERM with only a partial dot-line, so no
full-quick verdict is claimed): --only teach: 9 passed, 1 failed
(test-break-knowledge-sibling-teach-20261008.js, `Text is not
defined` at roster generation — an old-harness environment failure
before any teach code runs); --only convo: 7 passed, 6 failed, all
6 failing at setup (`Text is not defined` in genCharacter, or a
null state in a 2026-10-06 test) before reaching conversation
logic. None of these failures touch npcLearnFromTalk, seek, or
ledger code, and all fail in setup, not in teach behavior.

## Verdict reasoning (for the parent)

Per the task's rule a bar miss means HELD/NO-GO: bar 2's exceed clause
tied rather than exceeding, so the formal verdict is HELD on that
clause. The hold is about the bar's calibration (it demanded growth
in day-loop occurrence from a ledgering fix on a saturating ideal
band), not about the fix: the fix does exactly what it claims, is
proven by direct test, and regresses nothing. The feature is NOT
killed — the branch stands for the parent to overrule the hold or
to re-bar on a wild-conditions band where teacher absence actually
occurs. Two reported-not-fixed items for other lanes: (a) the
competent policy's teachRound teacher filter is inverted
(non-knowing villagers chosen as teachers — competent.js teachRound);
(b) the r53 driver records teachPlant calls regardless of return
value and measures novelty on the teacher's side, so its TEACH-NEW
cannot show student-side learning.
