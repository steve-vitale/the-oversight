# sim-succdeath-b — successor fast-death attribution census (loop B, 2026-10-16)

Food-economy axis. Classifies sim-findings #390: of 119 successions in the
sim-rearmlat-b census, 17 bearers died or left office within 2 days of
taking the mantle — before the bowls could re-arm the trust bar. The
question: are these combat deaths the ledger never gets to punish?

## Pre-registered header (binding, MEASUREMENT §§9–12, 14)

- PRIMARY metric: share of fast successions (bearer death/office-exit
  within ≤2 days of mantle) with death cause ATTRIBUTED — GO: ≥95%
  attributed. Attributed = (1) exit record with a day, (2) cause maps to
  one of the 8 classes (combat / villager-combat / monster / starvation /
  wound / disease / exile / other — a death with a raw cause string always
  maps; unmapped strings are 'other'), (3) ledger state present at death
  (dawn row inside [mantleDay, exitDay], or the analytic fresh book —
  mantleBecome zeroes the book, so a bearer dead before the next dawn has
  an empty book by construction, recorded as stateSource 'fresh-book').
- Horizon: 180d death-aware (dead villages stop simulating, +10d tail max).
- Seeds: 16 fresh runs — 8 fresh seeds x {leadfeast, belongfeast}:
  [307, 418, 529, 640, 751, 862, 973, 84].
  (Not a published seed set; rearmlat used [103,214,325,436,547,658,769,880],
  winwall [1701–1708], belonghunt [204,315,426,537,648,759,870,981].)
- Policies: the standard courtship substrate (FEASTSCALE_R13=1,
  TRIBFLOOR=1, SUCCGRACE=1, RAIDDENSITY=1, WINPURSUIT=1, WINDEFER=1,
  SEATDRIVE=0 explicit — the pre-seat spelling per sim-findings #389).
  Policy objects: SD.leadseat / SD.belongseat (scripts/policies/seatdrive.js
  = tribfloor base → withWinDefer → withSeatDrive; SEATDRIVE=0 gate-offs
  the seat layer to pure delegation).
- Instrument: scripts/succdeath-20261016.js (SUCCDEATH=1), proof
  scripts/test-succdeath-20261016.js, sweep scripts/run-succdeath-20261016.js.
  Proof: PART A 25/25 fixtures GREEN (classifyCause class boundaries +
  attribFast rules + gate-off byte-identical); PART B 4/4 det-gate
  trajectory-identical (leadseat/belongseat × s307/s418, instrument
  on==off); SMOKE=1 8/8 GREEN (armed, 0 errors, player deaths with
  causes, mantle log, uninstall restores wraps).
- Reported (not scored): median days-in-mantle; fast-death cause shares
  (combat vs hunger vs other + the full 8-class table); share of fast
  deaths whose trust bar re-armed before death; sense-read of 1–2
  succession sequences in transcript context.

## Before/after

N/A — diagnostic census, no lever played. One shared baseline sweep
(16 runs, sweep wall 771s).

## Measured numbers

143 successions (incl. initial bearers), 131 exits, 12 censored (in office
at run end: village-lost / 180d / win).

- PRIMARY: 37 fast successions (exitDay − mantleDay ≤ 2), 37 attributed —
  rate 1.000 ≥ 0.95 → **GO**. 0 initial-bearer fast deaths (all 37 are
  successors); 0 instrument errors; 0 office-exits (non-death).
- Cause classes (8-class, pre-registered): combat 32, other 5,
  villager-combat 0, monster 0, starvation 0, wound 0, disease 0, exile 0.
- Fast-death 3-way (pre-registered): combat 32/37 = 0.865, hunger 0/37 = 0,
  other 5/37 = 0.135. All 5 'other' are cause "contest" — arena show
  deaths (see sense-read 1): combat-adjacent, 37/37 combat-family on a
  fiction reading.
- Bar re-armed before death: 0/37. Closest approach: cumNet −3967
  (bar is −5000 strict). 19/37 died before the next dawn (fresh-book
  stateSource); 18/37 had 1–2 dawn rows, none armed. 14/18 row-state
  deaths had voluntaryNet7 < 0 (min −2002) — the dated ledger never armed
  either. mealShare at death (n=14): mean 0.348.
- Median days-in-mantle (exited bearers): 8 (min 0, max 102, n=131).
  37/131 exits (28%) are fast — more than a quarter of bearers don't
  survive 2 days.
- Cross-check: harness tele player-death count vs instrument death exits:
  15/16 seeds agree exactly; belongfeast-s529 has 8 harness player deaths
  vs 9 instrument exits — the 9th (Olivia Bennett, d138) was registered
  twice (a villager-death path registered her first as kind 'person' with
  no player flag → harness keyed 'person:combat'; playerDeath's call
  no-op'd on the double-death guard so no player-flagged tele fired, but
  the instrument hook recorded the player:true opts). Same death, same
  cause — attribution unaffected. Method note filed (below).

Wall (report-only): national 13/16, table 15/16, wins 0/16, exiled 0/16,
wave4 15/16, wave5 9/16, medianSurvival 141d, maxSurvival 178d.

Per-seed JSONs: evidence/2026-10-16/perseed-succdeath/ (fast events in
each file's `_fast` array; full succession records under
`succdeath.successions`). Beat captures:
evidence/2026-10-16/succdeath-beats/.

## The mechanism

#390's hypothesis is CONFIRMED: the fast-death population is combat
deaths the ledger never gets to punish — 32/37 combat-class, 5/37
contest (arena show-combat), 0 hunger, and 0/37 had the cumulative −5000
bar re-arm before death.

Why the ledger can't touch them, in three steps:
1. mantleBecome (ledger.js:835-844) zeroes the book — every bearer starts
   with an empty ledger.
2. The re-arm latency (sim-rearmlat-b census: median 2d, min 1d) EXCEEDS
   the fast-death window: 19/37 died before the next dawn; the other 18
   died with 1–2 dawn rows, deepest cumNet −3967 (still above −5000).
3. The deaths are combat/show deaths, not pantry theft — the trust bar
   measures takes vs gives; a bearer grabbed by the arena (contest
   interruption principle: unavoidable, played) dies to a monster, and
   the bar's question ("did you take too much from the pantry?") is
   irrelevant to the corpse.

The fiction is coherent about it (see sense-reads): the village buries
each bearer the same night ("That night, they bring X home..."), speaks
for the successor at the grave ("Kwame trusted them. We saw it. Give
them the fire's hearing."), and the mantle-transfer beats fire every
time. The meat grinder's fastest turn is a played, mourned sequence —
not a silent stat.

## Named next (food-economy axis)

#390 is CLOSED as a census: combat deaths the ledger never punishes,
confirmed 37/37 attributed, 0/37 re-armed. The residual axis question is
a steve-call, not a lever: the trust bar's re-arm latency (median 2d)
vs the bearer mortality window (median 8d in-mantle, 28% dead ≤2d).
Neither the cumulative bar NOR the dated-voluntary ledger (#340's
candidate) can ever touch a bearer who dies before either arms — if the
bars move to the dated ledger, the fast-death population is untouched
either way. No lever is proposed from this census; the next trust-ledger
work stays with #340/#385/#386.

## Villager personhood sense-sample

Sequence 1 — leadfeast-s418, d139–143 (two contest fast deaths + the
bookends). d139: Giulia Bianchi dies in combat; the mantle passes to
Osmar Buarque — who dies THE SAME DAY in the arena ("COMBAT! THE UGLY
BEAST! The gamblers lean in."). The mantle passes to Jianhua Cao. d140:
both funerals ("That night, they bring Giulia home... That night, they
bring Osmar home. Nobody asks you to help carry; nobody has to.").
d142: Jianhua Cao dies in combat; the mantle passes to Hnat Moroz.
d142–143: "COMBAT! THE CANCELLATION!" — Hnat Moroz dies in the arena the
next day. Four bearers in five days. The ledger states: Osmar fresh-book
(cumNet 0), Hnat cumNet −211 (one day of bowls). The show grabs the
bearer; the monster does the rest. It reads as the fiction intends —
unavoidable, public, mourned — and the instrument's numbers (cause
"contest", reArmed false) match the beats exactly.

Sequence 2 — belongfeast-s529, d111–114 (three combat fast deaths).
d112: Kwame Bianchi dies in combat ("COMBAT! BIG BIG!"); at the grave,
"Hassan, Grace, Emma and 2 more speak for Desmond — 'Kwame trusted
them. We saw it. Give them the fire's hearing.'" The SAME DAY:
"COMBAT! THE EULOGY!" — Desmond Clarke dies in combat; the grave-side
speech repeats for Emma Larsen with different speakers (Hassan, Grace,
Olivia). d113: "COMBAT! THE EATER!" — Emma Larsen dies in combat; the
mantle passes to Zoe Adams: "🪞 You wake up somebody else. Zoe Adams,
21 — a journalist." d113–114: three funerals in two nights ("That
night, they bring Kwame/Desmond/Emma home"). The succession fiction is
doing real work: named villagers vouch for each successor, the funerals
happen, the new bearer's identity lands ("a journalist"). Nothing
robotic — the repetition is in the death triptych template (filed
separately), not in the succession handling.

Caveat (honest): all 32 combat-class deaths carry the raw cause string
"combat" — the standing open finding (2026-10-15: field-fight/raid-defense
deaths carry generic 'combat') means the instrument cannot distinguish
arena-monster kills from field combat from raids on the cause string
alone; the contest-class 5 are distinguishable only because the engine
labels show deaths "contest". Beat context (sequences above) is what
separates "COMBAT! THE EULOGY!" (arena) from a raid.

## Metric review

1. The 8 cause classes predate the observation: 5/37 fast deaths are
   cause "contest" (arena show deaths — played combat vs monsters) and
   land in 'other'. Proposed revision for the NEXT census: a 'contest'
   class (or fold into combat-family explicitly). The 3-way secondary
   (combat/hunger/other) is reported as pre-registered; the fiction
   reading is 37/37 combat-family.
2. Harness tele player-flag gap (method): on belongfeast-s529, a
   villager-death path registered the scholar's death before playerDeath
   did; the double-death guard no-op'd playerDeath's registerDeath call,
   so the tele never carried player:true (harness keyed 'person:combat').
   The instrument's registerDeath hook (recording opts before/after the
   guard) caught the player:true call. Same death, same cause — census
   attribution unaffected — but harness `player:` death counts can
   undercount by this mechanism. Filed as a sim/method finding.
3. fresh-book attribution: 19/37 fast deaths have no post-mantle dawn row;
   their ledger state is the analytic empty book (mantleBecome zeroes it).
   Same-day voluntary takes between reset and death are unobservable —
   recorded as stateSource 'fresh-book', counted attributed. A
   same-day-take would only make the bar arm FASTER, never slower, so the
   0/37 re-armed result is conservative.
