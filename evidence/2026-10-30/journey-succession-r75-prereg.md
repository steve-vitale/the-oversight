# Journey succession r75 — FOURTH HANDOFF INTEGRITY (lane B, pre-registration 2026-10-30, written before any play)

Leg 7 (succession). Rotation-b read 7 at run start (file mtime
2026-10-30 10:23 UTC — the crisis r71 closeout verified it at 7,
succession next) → write 4 at closeout (endgame next), and VERIFY
the file reads 4 afterwards (rotation writes have repeatedly failed
to stick in recent Lane B runs; the file is the authority, not this
note's claim).
Run number basis: last numbered Lane B run is r74 (social,
2026-10-30); no r75 evidence or memory entry exists at run start.
Base: local master 56b4cbe74 (crisis r71). origin/master e7e6f4c56
(batch ship bump) is an ancestor of local HEAD — local merges are
pending ship, as usual; no rebase needed at branch point, rebase at
landing if a sibling lands first.

Instrument only, zero src/js changes. Same no-compete decision as
r54/r55/r56/r64/r67/r70/r72: tackle-succession owns the succession
inheritance build; this run measures master for it and documents
blanks, never fixes them here. Gating freeze (2026-10-27) stands;
no gate, deed-bar, standing, wave, or table-price change is in
scope. Perception law untouched: invites here are player-chosen;
no partner-selection change is in scope.

## The question

r55 proved the FIRST handoff keeps the web intact (45/45 bonds,
affinity byte-identical), r56 the SECOND (28/28), r72 the THIRD
(31/31) — and that phantoms compound (54 successor-web bonds after
three passes, original bearer usually contributing 0 because the
player character holds no ledger bonds at death). Nobody has scored
a FOURTH handoff. Does the fourth handoff keep the web intact the
same way — and how many dead webs does the book hold after four
passes?

1. FOURTH HANDOFF: on chain-forced seeds, the fourth successor's
   bonds present before the fourth kill (relPreDeath4) — are the
   same keys present at the fourth handoff (relPost4), with the same
   v/depth? Is pairAffinity for the fourth successor byte-identical
   pre4 vs post4, as the first, second, and third handoffs were?
2. PHANTOM4: bonds involving each dead bearer (original bearer,
   first, second, and third successors) still in the ledger at window
   end — the compounding count after four passes, per dead bearer,
   never pooled across them.
3. FOURTH-SUCCESSOR INHERITANCE (INH4): the fourth successor's own
   pre-death NPC record (pack/worn, plant knowledge, skills) vs
   their scholar state at the fourth handoff, and the third
   successor's pre-death scholar items dispositioned the r54 way
   (presence counts per location, never piece identity). Does the
   fourth takeover feel like the same person's continuation, or a
   reset?
4. VOICE: a driven convo at d+53 runs as the FINAL bearer on
   chain-forced seeds (the top-2-by-trust machinery follows the
   living bearer; the fourth kill lands ~d+50). Sense-read: does the
   fourth successor's talk grieve the third successor by name the
   way earlier partners grieved earlier bearers?

## Instrument (r72 driver + FOURTH additions)

- FOURTH_KILL_DPLUS env (0 = off, control seeds). When > 0, at the
  first post-death iteration with (dayOf − thirdDeath.day) >=
  FOURTH_KILL_DPLUS, the driver calls the REAL playerDeath
  ('scripted fourth handoff (r75 chain probe)') synchronously
  BEFORE that day's remaining play, and records: relPreDeath4
  (same-day REL before the fourth kill), inhPreScholar4 (the third
  successor's scholar state as player), relPost4 (REL after the
  fourth handoff), fourthDeath {day, dplus (since third death),
  dplusSecond (since second death), dplusFirst (since first death),
  oldFirst, newFirst, scripted, linOk, moOk}, and inh4 (fourth
  successor's pre-death NPC record vs post-handoff scholar state +
  disposition of the third successor's pre-death items). The
  iteration's chain detection tags that chainDeath entry
  scriptedFourth=true (scriptedSecond/scriptedThird kept as their
  own flags; kills fire in different iterations by construction).
- relEnd is read four ways by the analyzer from the same snapshot:
  original-successor bonds at end, second-successor bonds at end,
  third-successor bonds at end, final-bearer <redacted> at end — plus
  per-dead-bearer phantom counts (original bearer, first, second,
  third successors). r72's triple-keying extended, never pooled.
- CONVO_DAYS adds 53: the fourth-bearer voice checkpoint, firing on
  the first day with daysSince >= 53 (fourth kill lands ~d+50 on
  forced seeds, so this convo runs as the fourth successor).
- SAYTRACE (r70) kept verbatim: sayLine fellBack/null wrappers +
  deflection-pool-draw wrappers with caller stack sites, so any
  sibling deflection in a driven transcript is attributable to
  RUN-BLOCK / SELF-BLOCK / DLG-DIRECT draw / UNJOINED.
- No game change. No gating, deedGate, scale, stage, readiness, or
  table-price code is touched.

## Seeds, regime, policy

Fresh band 26151–26156 (no succession filename or succession stdout
JSON carries these seeds — verified by targeted grep before play;
the numbers also occur as unrelated counters inside older non-
succession corpora, which is not a seed collision), competent
policy, POST_DAYS=55, mature regime for all (EARLY_KILL_DAY=40 —
r55 finding 5: close friends exist only on mature seeds, so young
villages cannot show a web worth keeping; the day-40 scripted kill
itself is an aspiration, not a promise — r56/r64/r67/r70/r72 all
ran organic first deaths):
26151–26153 CHAIN-FORCED (SECOND_KILL_DPLUS=20,
THIRD_KILL_DPLUS=20 measured from the second death day,
FOURTH_KILL_DPLUS=10 measured from the third death day),
26154–26156 CONTROLS (no forced kills; organic chains, if any,
still recorded and tagged scriptedSecond=false /
scriptedThird=false / scriptedFourth=false).
Spacing note: the fourth gap is 10, not 20, so the fourth handoff
lands ~d+50 inside a 55-day window and leaves ~5 days of
fourth-bearer life — symmetric with r72's third handoff (d+40 in a
45-day window). The bond/affinity metrics are spacing-independent
in principle; the shorter fourth gap is an instrument choice, and
end-window bonds for the fourth successor reflect the handoff, not
a long lived fourth life — reported, not overclaimed.

## Binding metrics (§14 — a miss is NO-GO, never re-scored)

- CHAIN4-READABLE (binds): on ≥2/3 chain-forced seeds, a full fourth
  handoff record (relPreDeath4 + relPost4 + fourthDeath with linOk +
  moOk + inh4 readable). A forced seed with no fourthDeath is a
  NO-GO on the instrument, not on the game.
- CHAIN4-BONDS (reported, NOT scored): per forced seed, fourth
  successor bonds pre4 / post4 (count, survived keys, top partner +
  v/depth), affinity pre4 vs post4 identical-or-not, per-dead-bearer
  phantom bonds at end.
- PHANTOM4 (reported, NOT scored): per forced seed, relEnd bond
  counts involving the original bearer, the first, second, and
  third successors separately.
- INH4 (reported, NOT scored): fourth successor kept/inherited
  plants, skills, items (r54 classes: own-life / inherited / mixed
  / blank-reset), vanished ids with the sentimental-class caveat.
- CARRIED REGRESSION (binds, r72 bars unchanged): SCRIPT first kill
  staged-or-organic honored on all seeds; C1v3 0 missing;
  W1d-tightened pooled: M3v2b ≥ 2 on ≥ 4/6 seeds; S1 0 missing
  bearerDeltaExact; MG2v2 0 violations; M1/M4 hold; chain mantles
  all cause-known (forced chains carry scriptedSecond /
  scriptedThird / scriptedFourth = true, organic chains
  cause-known).
- INVITE SEAM (reported, r72 bars): invite outcomes spoken /
  deflected / other across driven transcripts; any sibling
  deflection joined to its SAYTRACE pool draw (RUN-BLOCK /
  SELF-BLOCK / DLG-DIRECT / UNJOINED).

## What would count as an interesting finding

- A fourth-handoff bond drop or affinity drift after three perfect
  passes (the machinery finally showing a depth limit).
- A fourth phantom load that changes the prune-vs-dodge question
  (e.g. the third successor's web dwarfing earlier webs, or the
  original bearer finally contributing).
- A fourth takeover reading as a reset (blank/reset class) where
  the first three read mixed — the continuation story breaking at
  depth four.
- Fourth-bearer grief that names the wrong bearer, or no grief at
  all for the third successor (voice machinery not following the
  fourth bearer).

## Canon note

No dedicated succession/mantle canon doc exists in docs/ (r54
prereg, unchanged). Bond rules are betrayal.js header; close-read
definition is convoTopics.js (depth >= 2 = close). No canon is
invented here.
Gating freeze (2026-10-27) untouched: no gate, deed-bar, standing,
wave, or table-price change is in scope. Perception law untouched:
invites here are player-chosen; no partner-selection change is in
scope.

## Metric review (carried)

- r72: third handoff keeps the web intact (31/31); phantoms are
  successor webs (54 across three forced seeds); the original
  bearer's web is usually empty at death (0 on 5/6 seeds), so
  orig-phantom 0 is a thin-web artifact, not decay — future phantom
  reporting must quote pre alongside end.
- r72: headline chain lines compress organic middle links — the
  per-seed chain line reads death/second/third bearers only; the
  r75 analyzer's chains line (with scriptedFourth) is the full
  record; any "bearer <redacted>" must count chainDeaths + 1, not
  headline bearers.
- FOURTH-KILL DPLUS HAS THREE HONEST BASES. fourthDeath carries
  dplus (since third death), dplusSecond (since second death),
  and dplusFirst (since first death). No metric in this run reads
  "d+10" or "d+50" without naming its base.
- POLICY FALLBACKS ARE NOT DRIVEN DEFLECTIONS. r72's 26145 showed
  22 policySayTrace fallbacks with 0 driven-transcript deflections;
  the SEAM metric counts driven transcripts only. Pooling the two
  would inflate the seam; it is not done here.
