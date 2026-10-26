# journey-social r57 — PRE-REGISTRATION (lane B, leg 5; written before any r57 seed ran)

Rotation-b file read 5 at run start. This run plays leg 5 again by the
queue-jump rule: the last three landed commits (r54, r55, r56) all touched
the conversation/'others' system, and r56 left a named open question for
r57 — so leg 5 is the system most recently touched, not a rotation leg.
Rotation-b is NOT advanced by this run (it still reads 5; the r56 closeout
write to 6 never landed, same as r55's — the file is left for a run that
actually plays a different leg, not rewritten mid-investigation).

## Leg question (r57 = THE RESIDUAL-DEEP-DIVE RUN)

r56's headline, not re-litigated: linger converts 56.5% vs control 1.7% —
the offer/pick gap is policy, not menus. r56's R1 FAILED on content:
same-pick probes with inBuilt=false split 493 total into question-owned
0, thread-guard 66 (13.4%), gated 26 (5.3%), unexplained 401 (81.3%).
r56 named two r57 candidates, both taken here — NO new menu exemption
is applied in this run unless the unit test below fails:

1. BUILD-TIME CLASSIFICATION TEST (unit, r56's named candidate): a
   discussed-and-unchanged 'others' state must appear in the SUBJECT
   menu's built list under clean constructed state (no owns-filters,
   thread null, normal cap). If it does, the wild residual is
   classification drift / pager-owns / capping, not the r54 re-list.
   If it does not, the re-list itself is refuted and a fix is in scope
   (see U1 below).
2. DEEPER PROBE FLAGS (driver, code-grounded candidates r56's split
   could not see — read the menu builder + pager before believing
   these; each is a real code path, not a guess):
   - PAGER-OWNS (convoMenuPage, applied AFTER the subject menu builds):
     pendingQ-alone (pendingQ true, reactiveQ null, genericQ null) —
     r56's questionOwned checked reactiveQ/genericQ only, so
     pendingQ-alone probes fell into unexplained; windingDown or a
     'closing' spokenBeat (leave/silence only); thread 'ambush'
     (betrayal ids only); pendingTrade / pendingHawk (yes/no only);
     'invitation' spokenBeat with a pending invite.
   - FRESH-CAPPED (subject-menu fresh loop): 'others' fresh (never
     said, or changed since served) but sitting at or past
     topicCapMood in t2list order — the r53 exemption lifts freshCap
     only, NOT topicCapMood, so a 3rd+ fresh topic on a
     prickly/withdrawn/restless villager (cap 2) or a tense mood
     (cap-1) is capped out, and the discussed loop cannot rescue it
     because it is fresh, not discussed.
   - CACHE-SUSPECT (buildMenu replyMenu cache): the menu key does
     NOT include said topics, t2otherServed, bonds, or conflicts, so
     a subject menu built under an earlier state can be re-served
     stale. Flagged when a probe turn's built set equals the previous
     subject-menu turn's built set in the same convo (suspect, not
     proof — the key itself is not readable from the driver).
   - SPENT (finalizeMenu spent filter): recorded for completeness;
     'ask:others' is not a spent id in current code (spent ids are
     alive: ids), so a non-zero count here would itself be news.

## Arms / seeds / policy / instrument

Seeds: fresh block 5301-5304. Smoke 5305, 30d. Horizon DAYCAP=140,
death-aware. Policy: r56 LINGER on ALL four seeds (no control arm —
control was reproduced three times: r55 1.9%, r56 1.7%; repeating it
buys nothing for the residual question). All seeds keep seeded-speaker
steering ON (constant, excluded from the natural funnel, as r56).
Driver: fork of r56 with (a) ARM_OF all linger, (b) the new probe
flags below on every subject-no-offer probe, (c) verdicts rewritten
after every seed (r56 pattern), (d) per-seed JSON persists the full
t2picks list (carried).

NEW PROBE FIELDS (reads only; no game state changed):
othersFresh (t2topicFresh 'others'), othersFreshIndex (index of
'ask:others' among the fresh subset of topic2Asks, -1 if discussed or
absent), freshBeforeOthers (fresh topics before 'others' in t2list
order), topicCapMood (driver-computed: temper via npcTemper, mood via
convoMoodBand, cap 2 if withdrawn/prickly/restless else 5, tense -1
min 1 — labeled driver-computed, not game-read), pendingQAlone,
windingDown, closingBeat, ambushThread, pendingTrade, pendingHawk,
invitationBeat, pagerOwns (first matching owns rule in pager order:
ambush / windingDown-or-closing / invitation / pendingQ / reactiveQ /
genericQ / pendingTrade / pendingHawk / none), spentOthers,
prevMenuSame (built set equals previous subject-menu turn's built set
in this convo). r56 flags carried unchanged (thread, reactiveQ,
genericQ, pendingQ, inT2list, convoSawOthers, menuMore, freshTopics).

ANALYZER (fork of r56): residual split v2, first-match order:
pendingQAlone / pagerOwns-other / threadGuard / gated / freshCapped /
cacheSuspect / unexplained. Co-occurrence counts reported alongside
the first-match split (a probe can be both fresh-capped and
cache-suspect; the split must not hide that).

## Pre-registered bindings (a miss is NO-GO, never re-scored)

- R1 SPLIT (instrument + content): new flags present on >= 95% of
  same-pick probes; analyzer reports the v2 split. GO = split reported
  AND unexplained < 50% of the residual. If unexplained still
  dominates, the finding is that the residual needs an even deeper
  instrument (e.g. a game-side build trace), not a fix.
- U1 UNIT (diagnostic, separate from R1): the new proof test
  scripts/test-journey-social-r57-subject-relist.js — discussed-and-
  unchanged 'others' in the SUBJECT menu's built list under clean
  constructed state, plus the fresh-capped characterization (a
  fresh 'others' past topicCapMood on a cap-2 villager is absent
  from the built list — recorded as behavior, not asserted as a
  bug). EXPECTED: U1 part 1 GREEN (re-list works; residual is
  elsewhere). IF part 1 is RED, a minimal fix is in scope for this
  run and must be demonstrated RED pre-fix -> GREEN post-fix in that
  order; the fix verdict is reported separately and does not re-score
  R1.
- R2 CONVERSION (guard, linger reproduction): pooled linger-arm
  unsteered picks per unsteered offer >= 25% (r56: 56.5%). A collapse
  below 25% is a regression signal, investigated before closeout.
- M1 FORMATION (guard): deep2 pairs >= 10 per seed.
- M3-COND (guard): pooled late close-read TP rate >= 40%.
- M4 (guard): same-speaker knack repeats = 0 per seed.
- M5 PEOPLE (guard): 5 transcripts sense-read in full, 0
  fabricated-shared-history flags, <= 1 weak read (r56 quality floor,
  kept).
- M6 GUARDRAIL (report-only): alive-at-horizon + scattered reported
  honestly; arena-death load carried, not re-litigated.
- NO-REGRESSION: scripts/check.js --quick at the standing profile
  (r56: 278 passed, 9 failed, same pre-existing set) in the worktree.
  No src/js change is planned, so no proof test is owed unless U1
  goes RED — then the U1 test is the proof test.

## Metric review (carried, not re-scored)

- F1-picks as written measures the retired old policy (r56 metric
  review, adopted): retired. Conversion is judged by R2's weighing
  form; the residual is judged by R1's v2 split.
- F1m menu-occurrence bars retired (r55/r56).
- Carried blanks, not this run's fix unless a read lands on them:
  stall/leave-loop wart (r56: 2/5 reads not-strong — stall lines +
  post-leave continuation, part driver artifact); Nino double-invite
  echo (r56: Zeliha recurrence); Omar unanchored favor callback;
  Carlos loop wart; Stan gossip treadmill.
- Design note (carried): re-serving discussed-'others' is not a
  repeat — the pick recomputes at serve time and lines come through
  the said-ledger (CONVERSATIONS.md "No repeats, ever").

## Pre-seed correction (written after the U1 unit test, before any seed ran)

- U1 part 1 GREEN on first run (subject-menu discussed-unchanged 'others'
  in the built list, Alejandra/gentle, pages 3, page 1 also carries it):
  the r54 re-list works at unit level, as expected. No fix is triggered.
- U1 part 2 REFUTES the prereg's fresh-capped mechanism as written:
  a withdrawn (cap-2) villager with freshBeforeOthers=2 STILL built
  'ask:others'. Reason, read from the loop: n counts only PUSHED topics,
  and freshCap (1 at cap<=2, 2 otherwise) throttles non-exempt pushes
  before 'others' — so at most freshCap topics push before it, always
  below topicCapMood, except the tense+deflector corner where
  topicCapMood=1 (one pushed topic already fills the budget). The
  analyzer's freshCapped class is therefore REFINED before the run to:
  othersFresh && topicCapMood===1 && freshBeforeOthers>=1. The raw
  freshBeforeOthers/topicCapMood fields are still recorded per probe so
  the refinement is auditable, not hidden. The broader fresh-capped
  class (freshBeforeOthers >= topicCapMood) is reported as a memo
  count only, not as a residual category.
