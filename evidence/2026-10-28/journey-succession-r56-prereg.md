# Journey succession r56 — SECOND HANDOFF INTEGRITY (lane B, pre-registration 2026-10-28, written before any run)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
This run takes r55's two documented leftovers and measures them on master
BEFORE tackle-succession lands its build. Instrument only, zero src/js
changes. If blanks are found, they are documented for tackle-succession,
not fixed here: a competing Lane B succession change would collide with
the workstream that owns item 5 (same no-compete decision as r54/r55).

## The question

r55 proved the FIRST handoff keeps the web intact: 45/45 successor bonds
survived to handoff, affinity byte-identical. But r55's metric review #1
showed its END columns are final-bearer-keyed on chained seeds, so the
second handoff itself was never scored. Does the SECOND handoff keep the
web intact the same way — and does the first successor's ledger row
become a phantom exactly like the first dead bearer's?

1. SECOND HANDOFF: on chain-forced seeds, the second successor's bonds
   present before the second kill (relPreDeath2) — are the same keys
   present at the second handoff (relPost2), with the same v/depth?
   Is pairAffinity for the second successor byte-identical pre2 vs
   post2, as r55's first handoff was?
2. DUAL-KEYED END (r55 metric review #1 fix): relEnd read twice — once
   keyed to the ORIGINAL successor (relPost.selfId) and once keyed to
   the FINAL bearer (relEnd.selfId). On chained seeds these differ;
   r55's pooled survived-to-end counts mixed live + phantom rows.
   This run reports both, and never pools them.
3. FIRST-SUCCESSOR PHANTOMS: bonds involving the first successor (dead
   by the second kill) still in the ledger at window end — the same
   phantom class r55 found for the original dead bearer (4 lingering
   bonds). Do they persist to end, and do grievances keep being
   recorded against the first successor after their death (r55
   finding 7, grievances against the dead)?
4. SECOND-SUCCESSOR INHERITANCE (INH2): the second successor's own
   pre-death NPC record (pack/worn, plant knowledge, skills) vs their
   scholar state at the second handoff, and the first successor's
   pre-death scholar items dispositioned the r54 way (presence counts
   per location, never piece identity). Does the second takeover feel
   like the same person's continuation, or a reset?
5. VOICE: driven convos at d+30/d+45 run as the FINAL bearer on
   chain-forced seeds (the top-2-by-trust machinery follows the living
   bearer). Sense-read: does the second successor's talk grieve the
   first successor by name the way r55's partners grieved the original
   bearer?

## Instrument (r55 driver + CHAIN additions)

- SECOND_KILL_DPLUS env (0 = off, control seeds). When > 0, at the
  first post-death iteration with daysSince >= SECOND_KILL_DPLUS, the
  driver calls the REAL playerDeath ('scripted second handoff (r56
  chain probe)') synchronously BEFORE that day's runDays, and records:
  relPreDeath2 (same-day REL before the second kill), inhPreScholar2
  (the first successor's scholar state as player), relPost2 (REL
  after the second handoff), secondDeath {day, dplus, oldFirst,
  newFirst, scripted, linOk, moOk}, and inh2 (second successor's
  pre-death NPC record vs post-handoff scholar state + disposition
  of the first successor's pre-death items). The iteration's chain
  detection tags that chainDeath entry scriptedSecond=true so the
  forced chain is never mistaken for an organic one.
- origSuccId recorded at the first handoff; relEndOrigId /
  relEndFinalId recorded at window end (and in finish() on early
  exits), so the analyzer keys end columns both ways from the same
  snapshot.
- No game change. No gating, deedGate, scale, stage, readiness, or
  table-price code is touched (gating freeze, Steve 2026-10-27 16:53).

## Seeds, regime, policy

Fresh band 26131–26136 (no prior evidence file carries these seeds),
competent policy, POST_DAYS=45, mature regime for all
(EARLY_KILL_DAY=40 — r55 finding 5: close friends exist only on
mature seeds, so young villages cannot show a web worth keeping):
26131–26133 CHAIN-FORCED (SECOND_KILL_DPLUS=20), 26134–26136
CONTROLS (no second kill; organic chains, if any, still recorded
and tagged scriptedSecond=false).

## Binding metrics (§14 — a miss is NO-GO, never re-scored)

- CHAIN-READABLE (binds): on ≥2/3 chain-forced seeds, a full second
  handoff record (relPreDeath2 + relPost2 + secondDeath with linOk +
  moOk + inh2 readable). A forced seed with no secondDeath is a
  NO-GO on the instrument, not on the game.
- CHAIN-BONDS (reported, NOT scored): per forced seed, second
  successor bonds pre2 / post2 (count, survived keys, top partner +
  v/depth), affinity pre2 vs post2 identical-or-not, first-successor
  phantom bonds at end, original-bearer phantom bonds at end.
- DUAL-END (reported, NOT scored): per seed, original-successor bonds
  at end vs final-bearer bonds at end (counts + top partner), so the
  r55 mixed-column caveat is retired by construction.
- INH2 (reported, NOT scored): second successor kept/inherited
  plants, skills, items (r54 classes: own-life / inherited / mixed /
  blank-reset), vanished ids with the sentimental-class caveat.
- CARRIED REGRESSION (binds, r55 bars unchanged): SCRIPT first kill
  staged-or-organic honored on all seeds; V1 snapshot PASS-fired on
  snapshot seeds; C1v3 0 missing; W1d-tightened pooled ≥ 1/2; S1 0
  missing bearerDeltaExact; MG2v2 0 violations; M3v2b ≥ 2 on ≥ 4/6
  seeds; M1/M4 hold; chain mantles all cause-known (forced chains
  carry scriptedSecond=true, organic chains cause-known).

## What would count as an interesting finding

- A second successor bond present before the second kill and absent
  at the second handoff (the first handoff kept 45/45; a second-handoff
  wipe would be new).
- Second-successor affinity moving at the second handoff while the
  bond ledger still shows the bond (ledger/affinity split, second
  order).
- First-successor bonds still in the ledger at end AND a grievance
  recorded against the first successor after their death (phantom
  growth, not just persistence).
- A second successor whose person entry is empty or closed at the
  second handoff despite a lived NPC life (r55's young-seed zero case
  was honest; a mature-seed wipe would not be).
- A d+30/d+45 convo where the second successor's partner does not
  grieve the first successor by name, or misaddresses the dead.

## Canon note

No dedicated succession/mantle canon doc exists in docs/ (r54 prereg).
Bond rules are betrayal.js header (bonds form in run, +6/pair/day cap,
no bonds with the dead/gone); the close-read definition is
convoTopics.js (ledger depth >= 2 = close, depth >= 1 = live). No canon
is invented here: the run reports what the machinery does.
