# Journey social r73 — PRE-REGISTER (lane B, 2026-10-30)

Leg 5 (social life), cycle r73. Rotation-b read 5 at run start; this run
advances rotation-b to 6 at closeout. Base: master 43ea03a02.
Instrument + recording-only diagnostics. Zero src/js unless a finding
below earns a fix under the staged rules — a fix needs its own proof
test and is NOT pre-authorized by this prereg.

## Canon note

docs/CANON.md manifest read. No canon doc covers joint-foraging
outings (forage_help) specifically — docs/CONVERSATIONS.md covers
dialogue generally, docs/PARTY.md covers party dynamics. The outing
mechanism below is read from src/js/favor-forage.js (adjacent(),
forageFavorAction), not invented: a start requires the partner NOT
away, partner node == player map tile, a micro position for the
partner, and micro-adjacency (Chebyshev <= 1) on the same side of the
Haven door, at Haven, at dawn (dayPart 0), on/after meetDay and by
the deadline. This run measures that mechanism in the wild; it does
not re-derive it.

## Follows

- r67 (lane B, 2026-10-29, landed via r68 recovery): the dry census
  is exact (gap 0, recovery 100% with phantoms retired) — dry-line
  work is DONE for this leg and is guardrail-only here. Outing
  funnel on fresh seeds 6201-6204: offers 110, forage offers 28,
  accepts 28, starts 4, completes 0. Start-blocked 46, of which 40
  carry reason "Move next to your partner, on the same side of the
  Haven door.", 5 "Finish your current outing before starting
  another.", 1 "Meet at Haven at dawn on day 71." The started
  outing's forage leg then went barren day after day (forageBarren
  100 pooled across the band's started outings in the r67 note's
  counting; per-seed funnels show the same shape: starts rare,
  barren dominant after start).
- r67 metric review (adopted): the thin-roster chain question is
  DROPPED from this leg — it returned INSUFFICIENT-DATA twice
  (r66, r67) on the 140d regime and must not be run a third time
  on the same regime. No chain verdict is pre-registered here.
- Crisis r70 blank (carried, not this run's question): DEFENDER
  conversation branch structurally dead; favor "no longer
  available" conflates states. Noted for a later run; r73 does not
  chase it.

## Leg questions

- (Q1) DAWN-BLOCK DECOMPOSITION: of every start-blocked dawn
  attempt, what fails inside adjacent()? Classify each attempt by
  the FIRST failing condition in source order: door-side (partner
  at Haven node but opposite side of the door), away, node-elsewhere
  (partner node != player map tile), no-micro-pos, inside-mismatch,
  nonfinite-pos, micro-far (Chebyshev > 1). A start-blocked attempt
  whose status reason is not adjacency (deadline, other outing,
  meet-day) classifies as non-adjacency, not forced into the table.
- (Q2) DAWN POSITIONS: on every dawn attempt (blocked AND started),
  where is the player (map tile, inside/outside) and where is the
  partner (node, away flag, micro position, inside/outside)?
  Interesting iff one position fact dominates the blocks — e.g.
  the player usually wakes away from Haven, or partners usually sit
  on a non-Haven node at dawn.
- (Q3) BARREN AFTER START: for every started outing, why does the
  forage leg go barren? Classify each forage-node-barren by
  target-tile canForage at arrival (patch genuinely ungatherable)
  vs anchor-adjacency loss (cells tried, all presses empty despite
  a gatherable tile) vs cell-blocked statuses. Interesting iff one
  class dominates.
- (Q4) KEPT-WITHOUT-START: r67 seed 6201 ended with Henry's favor
  promiseKept=true, startedDay=null, state acknowledged. For every
  favor ending kept with zero starts, identify the flip: the first
  dawn attempt (or deliver) at which promiseKept reads true, and
  what outing step (if any) happened that day. A flip with no
  outing step that day is reported as UNEXPLAINED-by-outing, with
  the flip day named — not hand-waved as "kept by pantry".
- (Q5) PEOPLE: do outing-related transcripts read like people?
  5 sense reads, >= 2 outing-related (a start line, a barren-day
  or deliver beat, or a favor ask), 0 fabricated-history flags,
  weak endings <= 1.

## Instrument (r67 driver verbatim + recording-only diagnostics)

Driver: scripts/journey-social-r73-20261030.js (r67 fork; policy,
DAYCap=140, death-aware, all linger, seeded-speaker steering ON,
outing wedge, invite recording, dry census + opening scan verbatim).
Seeds fresh: 6301-6304, smoke 6305 (30d, self-test gate as r67).
Wedge: scripts/journey-social-r73-outing-wedge.js (r65 wedge fork;
game behavior identical — the ONLY changes are extra read-only
fields on log entries, all pure state reads, no new game calls
that consume RNG, move the player, or alter state):

- startWedge: every wait / start-blocked / start entry gains
  `diag` = { playerMap, home, playerInside, partnerInside,
  partnerNode (+defaulted flag), partnerAway, partnerPos,
  scholarPos, dayPart, meetDay, deadline, promiseKept,
  favorState, adjFail } where adjFail mirrors adjacent()'s
  failure order (door-side / away / node-elsewhere /
  no-micro-pos / inside-mismatch / nonfinite-pos / micro-far /
  adjacent-ok / non-adjacency).
- dayWedge forage leg: every forage-cell-blocked entry gains
  targetCanForage + playerMap; every forage-node-barren entry
  gains targetCanForage + cellsTried + anchor (already logged)
  + playerMap. No change to which cells/nodes are tried.

## Bindings (a miss is NO-GO, never re-scored)

- B1: 100% of start-blocked attempts carry a diag and classify
  to exactly one adjFail class (or non-adjacency).
- B2: dawn-position census reported for ALL dawn attempts
  (blocked + started): player-at-Haven rate, partner-node-at-Haven
  rate, inside-match rate.
- B3: 100% of forage-node-barren entries classify as
  tile-barren (canForage false) vs anchor-empty (canForage true,
  presses empty) vs cell-blocked-other.
- B4: every kept-without-start favor has a named flip day (or is
  explicitly UNEXPLAINED-by-outing with the flip day named).
- B5: people 5 reads, >= 2 outing-related, 0 fabricated-history,
  <= 1 weak ending.
- Guardrails (report-only): pooled dry9/convo in [0.20, 0.40];
  recovery quoted WITH phantom count (r67 metric-review rule).
- NO-REGRESSION: check.js --quick at the standing profile in
  the worktree; the r73 wedge proof test green on SEED=42 and
  SEED=7 BEFORE seeds run; r65 wedge file untouched.

## Named next (not pre-judged)

If Q1 shows a single dominant block (e.g. node-elsewhere because
partners never sleep at Haven, or micro-far because partners do
not shadow the player to the door), the next run owns the fix
candidate — this run measures, it does not fix on a hunch.
