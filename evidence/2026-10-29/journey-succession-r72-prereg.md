# Journey succession r72 — THIRD HANDOFF INTEGRITY (lane B, pre-registration 2026-10-29, written before any play)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4,
endgame). Run number basis: last numbered Lane B run in evidence is
r71 (endgame); no r72 evidence or memory entry exists at run start.
Rotation provenance note: r71's note claims 4→5, yet the rotation file
read 7 at this run's start (mtime 2026-10-29 21:54 CDT) — a social
finisher (5→6, in today's memory log) plus a crisis run (6→7) must
have advanced it after r71. The file is the authority per the loop
body; this run plays the leg it names (7, succession).

Instrument only, zero src/js changes. Same no-compete decision as
r54/r55/r56/r64/r67/r70: tackle-succession owns the succession
inheritance build; this run measures master for it and documents
blanks, never fixes them here. Gating freeze (Steve 2026-10-27 16:53)
stands; gate-sequencing note (Steve 2026-10-29 22:02 CDT) is
consistent with measurement-only work: no gate or price is touched.

## The question

r56 proved the SECOND handoff keeps the web intact (28/28 bonds,
affinity byte-identical) and that phantoms compound (one dead web per
handoff: 22 first-successor phantoms in one band). r64/r67/r70
re-proved the second handoff on fresh corpora and closed the
invite-seam and analyzer gaps. Nobody has scored a THIRD handoff.
Does the third handoff keep the web intact the same way — and how
many dead webs does the book hold after three passes?

1. THIRD HANDOFF: on chain-forced seeds, the third successor's bonds
   present before the third kill (relPreDeath3) — are the same keys
   present at the third handoff (relPost3), with the same v/depth?
   Is pairAffinity for the third successor byte-identical pre3 vs
   post3, as the first (r55) and second (r56) handoffs were?
2. PHANTOM3: bonds involving each dead bearer (original bearer,
   first successor, second successor) still in the ledger at window
   end — the compounding count after three passes, per dead bearer,
   never pooled across them.
3. THIRD-SUCCESSOR INHERITANCE (INH3): the third successor's own
   pre-death NPC record (pack/worn, plant knowledge, skills) vs
   their scholar state at the third handoff, and the second
   successor's pre-death scholar items dispositioned the r54 way
   (presence counts per location, never piece identity). Does the
   third takeover feel like the same person's continuation, or a
   reset?
4. VOICE: driven convos at d+30/d+45 run as the FINAL bearer on
   chain-forced seeds (the top-2-by-trust machinery follows the
   living bearer). Sense-read: does the third successor's talk
   grieve the second successor by name the way earlier partners
   grieved earlier bearers?

## Instrument (r70 driver + THIRD additions)

- THIRD_KILL_DPLUS env (0 = off, control seeds). When > 0, at the
  first post-death iteration with (dayOf − secondDeath.day) >=
  THIRD_KILL_DPLUS, the driver calls the REAL playerDeath
  ('scripted third handoff (r72 chain probe)') synchronously BEFORE
  that day's remaining play, and records: relPreDeath3 (same-day REL
  before the third kill), inhPreScholar3 (the second successor's
  scholar state as player), relPost3 (REL after the third handoff),
  thirdDeath {day, dplus, oldFirst, newFirst, scripted, linOk,
  moOk}, and inh3 (third successor's pre-death NPC record vs
  post-handoff scholar state + disposition of the second
  successor's pre-death items). The iteration's chain detection
  tags that chainDeath entry scriptedThird=true (scriptedSecond
  kept as its own flag; a chain entry may carry both only if a
  single iteration somehow combined them, which the driver order
  forbids — second and third kills fire in different iterations).
- relEnd is read three ways by the analyzer from the same snapshot:
  original-successor bonds at end, second-successor (first-chain)
  bonds at end, final-bearer bonds at end — plus per-dead-bearer
  phantom counts (original bearer, first successor, second
  successor). r56's dual-keying extended, never pooled.
- SAYTRACE (r70) kept verbatim: sayLine fellBack/null wrappers +
  deflection-pool-draw wrappers with caller stack sites, so any
  sibling deflection in a driven transcript is attributable to
  RUN-BLOCK / SELF-BLOCK / DLG-DIRECT draw / UNJOINED.
- No game change. No gating, deedGate, scale, stage, readiness, or
  table-price code is touched.

## Seeds, regime, policy

Fresh band 26141–26146 (no prior evidence file carries these seeds —
verified by grep over evidence/ before play), competent policy,
POST_DAYS=45, mature regime for all (EARLY_KILL_DAY=40 — r55
finding 5: close friends exist only on mature seeds, so young
villages cannot show a web worth keeping; the day-40 scripted kill
itself is an aspiration, not a promise — r56/r64/r67/r70 all ran
organic first deaths):
26141–26143 CHAIN-FORCED (SECOND_KILL_DPLUS=20,
THIRD_KILL_DPLUS=20 measured from the second death day),
26144–26146 CONTROLS (no forced kills; organic chains, if any,
still recorded and tagged scriptedSecond=false /
scriptedThird=false).

## Binding metrics (§14 — a miss is NO-GO, never re-scored)

- CHAIN3-READABLE (binds): on ≥2/3 chain-forced seeds, a full third
  handoff record (relPreDeath3 + relPost3 + thirdDeath with linOk +
  moOk + inh3 readable). A forced seed with no thirdDeath is a
  NO-GO on the instrument, not on the game.
- CHAIN3-BONDS (reported, NOT scored): per forced seed, third
  successor bonds pre3 / post3 (count, survived keys, top partner +
  v/depth), affinity pre3 vs post3 identical-or-not, per-dead-bearer
  phantom bonds at end.
- PHANTOM3 (reported, NOT scored): per forced seed, relEnd bond
  counts involving the original bearer, the first successor, and
  the second successor separately.
- INH3 (reported, NOT scored): third successor kept/inherited
  plants, skills, items (r54 classes: own-life / inherited / mixed
  / blank-reset), vanished ids with the sentimental-class caveat.
- CARRIED REGRESSION (binds, r70 bars unchanged): SCRIPT first kill
  staged-or-organic honored on all seeds; C1v3 0 missing;
  W1d-tightened pooled ≥ 1/2; S1 0 missing bearerDeltaExact;
  MG2v2 0 violations; M3v2b ≥ 2 on ≥ 4/6 seeds; M1/M4 hold; chain
  mantles all cause-known (forced chains carry scriptedSecond /
  scriptedThird = true, organic chains cause-known).
- INVITE SEAM (reported, r70 bars): invite outcomes spoken /
  deflected / other across driven transcripts; any sibling
  deflection joined to its SAYTRACE pool draw (RUN-BLOCK /
  SELF-BLOCK / DLG-DIRECT / UNJOINED).

## What would count as an interesting finding

- A third-successor bond present before the third kill and absent
  at the third handoff (the first handoff kept 45/45, the second
  28/28; a third-handoff wipe would be new).
- Third-successor affinity moving at the third handoff while the
  bond ledger still shows the bond (ledger/affinity split, third
  order).
- A third successor whose person entry is empty or closed at the
  third handoff despite a lived NPC life (r55's young-seed zero
  case was honest; a mature-seed wipe would not be).
- Phantom growth: a grievance recorded against the second successor
  AFTER their third-kill death (day > thirdDeath.day only — the
  r56 metric-review boundary), i.e. the book not just keeping but
  growing a dead web.
- A d+30/d+45 convo where the third successor's partner does not
  grieve the second successor by name, or misaddresses the dead.

## Canon note

No dedicated succession/mantle canon doc exists in docs/ (r54
prereg, still true). Bond rules are betrayal.js header (bonds form
in run, +6/pair/day cap, no bonds with the dead/gone); the
close-read definition is convoTopics.js (ledger depth >= 2 =
close, depth >= 1 = live). No canon is invented here: the run
reports what the machinery does.
