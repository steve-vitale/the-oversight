# Journey social r58 — PRE-REGISTER (lane B, 2026-10-26)

Written before any r58 seed ran. Leg 5 (social life), cycle r58.
Rotation-b read 5 at run start and is NOT advanced by this run: r57
named r58's question (game-side build trace for the residual), and
leg 5 is the queue-jump system, not a rotation leg — same standing
as r57 (its closeout write to 6 never landed, same as r55's). Left
for a run that actually plays a different leg.

## Follows

r57 (lane B, 2026-10-26): residual split v2 on 4 linger seeds —
same-pick + inBuilt=false residual 508 total, unexplained 396
(78.0%). Classes that came back EMPTY in driver play: pager-owns
(0), freshCapped refined corner (0), cacheSuspect by set-equality
proxy (0), spent-others (0), pendingQAlone (0). Non-empty:
thread-guard 72 (14.2%), gated 40 (7.9%). r57's named instrument
for r58: a game-side build trace — per subject-menu build, whether
'others' sat in t2fresh / t2discussed / the re-list / sub /
finalize output, plus the menuKey cache decision — and whether the
subject branch is even the path taken on residual turns.

## Leg questions

- (Q1) With an EXACT build trace (cache-hit by replyMenu identity,
  not set equality; early-return path from observable state;
  finalize in/out for 'ask:others'; t2fresh/t2discussed membership
  of 'others'), what share of r57's unexplained residual is
  (a) thread-narrowed early returns the r57 flags never covered
  (spread_rumor thread, nonverbal thread — both fire even when
  choosingSubject is true, and the dlg:subject wrappers set
  choosingSubject WITHOUT clearing thread, unlike the base
  'subject' handler which sets thread=null),
  (b) replyMenu cache hits returning a menu built under older
  said/mood/bond state (the cache key omits said, askedTopics,
  t2otherServed, bonds, moodBand, temper),
  (c) finalizeMenu drops,
  (d) the fresh-loop topicCapMood bound,
  (e) still unexplained?
- (Q2) Does the linger conversion reproduce (r57: 53.1%)?

## Arms (fresh seeds 5401-5404, smoke 5405 30d, DAYCAP=140, death-aware)

ALL linger (no control arm — control reproduced three times:
r55 1.9%, r56 1.7%; repeating it buys nothing for the trace
question). All seeds keep seeded-speaker steering ON (constant,
excluded from the natural funnel, as r56-r57). Driver = r57 fork
+ build-trace wraps (driver-side reads only: buildMenu /
finalizeMenu / convoChoices wraps recording entry state,
replyMenu identity, finalize in/out; NO src/js change, NO extra
RNG-consuming game calls inside the wraps — othersChanged is
derived from already-recorded served/pick values, never recomputed
via t2pickOther inside a wrap).

## Bindings (a miss is NO-GO, never re-scored)

- T1 trace coverage: 100% of subject-no-offer probes carry a build
  trace (cacheHit + path fields + t2 sets). A probe without a
  trace is a coverage FAIL, not an unexplained case.
- T2 unexplained-after-trace < 50% of the same-pick +
  inBuilt=false residual (same bar R1 failed in r57 at 78.0%,
  now judged with trace classes available).
- R2 linger conversion >= 25% (r57: 53.1%).
- M1 deep2 >= 10/seed; M3 pooled late TP >= 40%; M4 same-speaker
  knack = 0/seed; M5 5 sense-reads, 0 fabricated-history flags,
  <= 1 weak; M6 report-only (villages alive at horizon).
- NO-REGRESSION: check.js --quick at the standing profile
  (r57: 278 passed / 9 failed, all pre-existing, none touching
  conversation/gossip/moot). No src/js change in this run, so no
  game regression is possible from this run's files.
- Smoke gate (before full seeds): smoke PASS (bond census +
  t2pickOther wrap + funnel live) AND trace census live
  (builds > 0, every smoke probe trace-attached).

## Changes vs r57 (instrument only, no policy change)

- Per-seed JSON persists the FULL probe list (r57 sliced probes
  to 200/seed); shares stay comparable, counts are now a census
  of probe turns, not a sample.
- Probe gains: trace (build record for the convoChoices call
  that built the probed menu), reactiveDef, gqActive, rumorDone,
  inFresh, inDiscussed, saidCount(t2:others), t2otherServed,
  othersChanged (derived).
- Analyzer gains: residual split v3 (cache / nonverbal / rumor /
  tradeHawk / closing / answers / finalize / threadGuard /
  gated / freshCap / spent / unexplained) + unexplained-by-thread
  counts. If a trace class explains the residual, the NEXT run
  (r59) carries the fix or the follow-up question; this run
  judges the trace, it does not ship a menu fix on trace-free
  evidence.

## Mid-run instrument correction (analysis only, seed data unaffected)

Seed 5401's early read refuted the prereg's cache-as-path framing:
every probed turn is served from the replyMenu cache, because the
driver's top-of-loop build always re-serves the previous pick's
handler menu — that is the normal observation path, not staleness.
A cache hit is therefore NOT a residual mechanism by itself; the
staleness test is whether the origin build's entry differs from
the probed turn's entry on recorded fields (key fields are
identical by cache-key construction). Analyzer corrected before
the full run finished: cache moved from v3 path to memo
(memoCacheHits / memoOriginDiffers), finalize evidence on cache
hits taken from the origin build, and paths judged from entry
state. Bindings T1/T2 stand unchanged. The seed probes already
carry the full trace records, so no seed re-run is needed.

## Mid-run instrument correction #2 (base vs delivered; full re-run)

The first full run (smoke 5405 + seeds 5401-5404) completed, but its
trace records the BASE build only — and seed 5401's analysis proved
that is the wrong menu: 339/446 probes show the base build WITH
'ask:others' while the probed (delivered) menu lacks it. The
delivered menu passes through four convoChoices wrappers
(party-formal, truth, betrayal, villager-agency outermost, which
always ends in convoMenuPage) after the base build, and
convoMenuPage then records the post-wrapper list as offeredReplies
— so inBuilt=false means the post-wrapper list lacks 'others', not
that the base build did. The first run's probe data cannot name
the displacer (no delivered/full ids, no inParty flag), so its
per-seed JSONs are backed up (goal hidden_files r58-first-run/)
and the run is REPEATED with the fixed instrument: build records
carry offeredIds; probes carry fullIds (offeredReplies keys at
probe time), deliveredIds (the returned page), and inParty. The
re-run uses identical seeds/policy and RNG-neutral reads, so the
villages reproduce turn-for-turn; only the new fields differ.
Bindings T1/T2 stand, judged on the re-run: T1 now also requires
delivered/full ids on every residual probe.
