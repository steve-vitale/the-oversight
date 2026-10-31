# Journey succession r83 — FIFTH HANDOFF INTEGRITY (lane B, pre-registration 2026-10-31, written before any play)

Leg 7 (succession). Rotation-b read 7 at run start (file mtime
2026-10-31 04:31 UTC — the crisis r82 closeout verified it at 7,
succession next) → write 4 at closeout (endgame next), and VERIFY
the file reads 4 afterwards (rotation writes have repeatedly failed
to stick in recent Lane B runs; the file is the authority, not this
note's claim).
Run number basis: last numbered Lane B run is r82 (crisis,
2026-10-31); no r83 evidence or memory entry exists at run start.
Base: local master 98aec3d59 (includes crisis r82 + sim-sighit-b
landings). No push, no bump, no live check — ship loop owns those.
Slug deviation: body slug journey2-succession is unusable — the
registry still holds a done-merged journey2-succession entry (r79
closeout) and the register script refuses any already-registered
slug, plus the orphan journey2-succession/ directory (4.5 GB,
r79 worker tree, verified not a git worktree, left in place per
standing disposition) still sits on disk. Same class as crisis
r82's journey2-crisis-r81 deviation: this run uses
journey2-succession-r83. Orphan dir untouched.

Instrument only, zero src/js changes. Same no-compete decision as
r54/r55/r56/r64/r67/r70/r72/r75/r79: tackle-succession owns the
succession inheritance build; this run measures master for it and
documents blanks, never fixes them here. Gating freeze (2026-10-27)
stands; no gate, deed-bar, standing, wave, or table-price change is
in scope. Perception law untouched: invites here are player-chosen;
no partner-selection change is in scope. No canon doc covers
succession/mantle (r54 prereg, unchanged) — none invented here.

## The question

r75 proved the FOURTH handoff keeps the web intact on master
56b4cbe74, and r79 re-proved it on the post-contestdeath master
(29/29 fourth-successor bonds survived on 3/3 forced seeds;
phantoms at end: origBearer 2, succ1 28, succ2 29, succ3 28).
Nobody has scored a FIFTH handoff. Does the fifth handoff keep the
web intact the same way — and how many dead webs does the book hold
after five passes?

1. FIFTH HANDOFF: on chain-forced seeds, the fifth successor's
   bonds present before the fifth kill (relPreDeath5) — are the
   same keys present at the fifth handoff (relPost5), with the same
   v/depth? Is pairAffinity for the fifth successor byte-identical
   pre5 vs post5, as the first four handoffs were?
2. PHANTOM5: bonds involving each dead bearer (original bearer,
   first, second, third, and fourth successors) still in the ledger
   at window end — the compounding count after five passes, per
   dead bearer, never pooled across them.
3. FIFTH-SUCCESSOR INHERITANCE (INH5): the fifth successor's own
   pre-death NPC record (pack/worn, plant knowledge, skills) vs
   their scholar state at the fifth handoff, and the fourth
   successor's pre-death scholar items dispositioned the r54 way
   (presence counts per location, never piece identity). Does the
   fifth takeover feel like the same person's continuation, or a
   reset?
4. VOICE: a driven convo at d+64 runs as the FINAL bearer on
   chain-forced seeds (the top-2-by-trust machinery follows the
   living bearer; the fifth kill lands ~d+61 since first death).
   Sense-read: does the fifth successor's talk grieve the fourth
   successor by name the way earlier partners grieved earlier
   bearers?

## Instrument (r79 driver + FIFTH additions)

- FIFTH_KILL_DPLUS env (0 = off, control seeds). When > 0, at the
  first post-death iteration with (dayOf − fourthDeath.day) >=
  FIFTH_KILL_DPLUS, the driver calls the REAL playerDeath
  ('scripted fifth handoff (r83 chain probe)') synchronously
  BEFORE that day's remaining play, and records: relPreDeath5
  (same-day REL before the fifth kill), inhPreScholar5 (the fourth
  successor's scholar state as player), relPost5 (REL after the
  fifth handoff), fifthDeath {day, dplus (since fourth death),
  dplusThird (since third death), dplusSecond (since second death),
  dplusFirst (since first death), oldFirst, newFirst, scripted,
  linOk, moOk}, and inh5 (fifth successor's pre-death NPC record vs
  post-handoff scholar state + disposition of the fourth
  successor's pre-death items). The iteration's chain detection tags
  that chainDeath entry scriptedFifth=true (scriptedSecond/Third/
  Fourth kept as their own flags; kills fire in different iterations
  by construction).
- relEnd is read five ways by the analyzer from the same snapshot:
  original-successor bonds at end, second-, third-, and
  fourth-successor bonds at end, final-bearer <redacted> at end — plus
  per-dead-bearer phantom counts (original bearer, first, second,
  third, fourth successors). r79's quadruple-keying extended, never
  pooled.
- CONVO_DAYS adds 64: the fifth-bearer voice checkpoint, firing on
  the first day with daysSince >= 64 (fifth kill lands ~d+61 since
  first death on forced seeds, so this convo runs as the fifth
  successor).
- SAYTRACE (r70) kept verbatim. DEATH-LEDGER (r79) kept verbatim:
  it is generic over chainDeaths, so fifth deaths appear with no
  analyzer change.
- No game change. No gating, deedGate, scale, stage, readiness, or
  table-price code is touched.

## Seeds, regime, policy

Matched to r75/r79: band 26151–26156 (third use — intentional, so
the first four handoffs are directly comparable seed by seed),
competent policy, POST_DAYS=70 (extended from 55: the fifth kill at
fourth + 10 lands ~d+61 since first death, leaving ~9 days of
fifth-bearer life — symmetric with r75's fourth handoff, d+50 in a
55-day window), mature regime (EARLY_KILL_DAY=40):
26151–26153 CHAIN-FORCED (SECOND_KILL_DPLUS=20,
THIRD_KILL_DPLUS=20 measured from the second death day,
FOURTH_KILL_DPLUS=10 measured from the third death day,
FIFTH_KILL_DPLUS=10 measured from the fourth death day),
26154–26156 CONTROLS (no forced kills; organic chains, if any,
still recorded and tagged scriptedSecond=false /
scriptedThird=false / scriptedFourth=false /
scriptedFifth=false).
Pilot first: 26151 (forced) + 26154 (control) at full config; if the
pilot shows nothing but instrument failure, stop and report — don't
burn the panel.

## Binding metrics (§14 — a miss is NO-GO, never re-scored)

- CHAIN5-READABLE (binds): on ≥2/3 chain-forced seeds, a full fifth
  handoff record (relPreDeath5 + relPost5 + fifthDeath with linOk +
  moOk + inh5 readable). A forced seed with no fifthDeath is a
  NO-GO on the instrument, not on the game.
- CHAIN5-BONDS (reported, NOT scored): per forced seed, fifth
  successor bonds pre5 / post5 (count, survived keys, top partner +
  v/depth), affinity pre5 vs post5 identical-or-not, per-dead-bearer
  phantom bonds at end.
- PHANTOM5 (reported, NOT scored): per forced seed, relEnd bond
  counts involving the original bearer, the first, second, third,
  and fourth successors separately.
- INH5 (reported, NOT scored): fifth successor kept/inherited
  plants, skills, items (r54 classes: own-life / inherited / mixed
  / blank-reset), vanished ids with the sentimental-class caveat.
- CARRIED REGRESSION (binds, r79 bars unchanged): SCRIPT first kill
  staged-or-organic honored on all seeds; C1v3 0 missing;
  W1d-tightened pooled: M3v2b ≥ 2 on ≥ 4/6 seeds; S1 0 missing
  bearerDeltaExact; MG2v2 0 violations; M1/M4 hold; chain mantles
  all cause-known (forced chains carry scriptedSecond /
  scriptedThird / scriptedFourth / scriptedFifth = true, organic
  chains cause-known).
- INVITE SEAM (reported, r79 bars): invite outcomes spoken /
  deflected / other across driven transcripts; any sibling
  deflection joined to its SAYTRACE pool draw (RUN-BLOCK /
  SELF-BLOCK / DLG-DIRECT / UNJOINED).

## What would count as an interesting finding

- A fifth-handoff bond drop or affinity drift after four perfect
  passes (the machinery finally showing a depth limit).
- A fifth phantom load that changes the prune-vs-dodge question
  (e.g. the fourth successor's web dwarfing earlier webs, or the
  original bearer finally contributing).
- A fifth takeover reading as a reset (blank/reset class) where
  the first four read mixed — the continuation story breaking at
  depth five.
- Fifth-bearer grief that names the wrong bearer, or no grief at
  all for the fourth successor (voice machinery not following the
  fifth bearer).

## Metric review (carried)

- r79: fourth handoff keeps the web intact (29/29); phantoms are
  successor webs; the original bearer's web is usually empty at
  death, so orig-phantom 0 is a thin-web artifact, not decay —
  phantom reporting must quote pre alongside end.
- r79: headline chain lines compress organic middle links — the
  per-seed chain line reads death/second/third bearers only; the
  analyzer's chains line (with scriptedFifth) is the full record;
  any "bearer <redacted>" must count chainDeaths + 1, not headline bearers.
- FIFTH-KILL DPLUS HAS FOUR HONEST BASES. fifthDeath carries
  dplus (since fourth death), dplusThird (since third death),
  dplusSecond (since second death), and dplusFirst (since first
  death). No metric in this run reads "d+10" or "d+61" without
  naming its base.
- POLICY FALLBACKS ARE NOT DRIVEN DEFLECTIONS. The SEAM metric
  counts driven transcripts only.
- POST_DAYS 55 → 70 is an instrument change, not a game change:
  carried bars that count window-length-sensitive quantities
  (trust moves, deed calls, bump calls) are compared to r79 only
  qualitatively, never as regressions on raw counts.
