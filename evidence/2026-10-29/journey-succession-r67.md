# Journey succession r67 — SIBLING SEAM TRACE (lane B, leg 7)

Base master a6fa0710c. Rotation-b 7 → 4 (endgame next).
Instrument: r64 driver verbatim → r67 + SAYTRACE (sayLine fellBack/null
wrappers + deflection-pool-draw wrappers with caller stack sites) and the
analyzer TRACE JOIN. Zero src/js changes. Pre-registration:
evidence/2026-10-29/journey-succession-r67-prereg.md. Pilot seeds 26131,
26132 (chain-forced, SECOND_KILL_DPLUS=20), 26134, 26135 (controls);
competent policy, POST_DAYS=45, EARLY_KILL_DAY=40. No expansion needed:
the pilot produced 5 sibling deflections and 25 invite outcomes.

## Binding verdicts (§14)

- TRACE-CLASS: SAME-CLASS. All 5 joined sibling deflections are sayLine
  RUN-BLOCKS with no exemption flag (preRun=true, preSelf=false,
  diegeticAct=false, structural=false), drawn through the sayLine fallback
  (SAYLINE-INTERNAL pool draws, conversation.js:974). This is the invite
  pre-fix shape exactly: a content line that legitimately repeats across
  villagers is dry-replaced because another villager said the same line
  inside the 48-entry run-ledger window. 0 SELF-BLOCK, 0 DLG-DIRECT,
  0 UNJOINED. The mechanism r64 reported as "consistent-with" is now
  PROVEN for the teach/favor classes in full-run play.
- CARRIED-INVITE: GO — seam stays closed. 25 invite outcomes: 24 spoken
  on the analyzer tables, 0 deflected, 1 OTHER judged by hand as a spoken
  accept (see below). No regression.
- CHAIN SPOT: GO — 2/2 chain-forced seeds carry a full second handoff
  (lin + mo + relPre2 + relPost2); second-successor bonds survived 19/19
  (26131: 9/9, 26132: 10/10), affinity diff 0 on both — identical to r64.
- PEOPLE CHECK: GO — all 45 transcripts read in full (5 deflection
  transcripts + 22 new/drifted transcripts read here; 23 transcripts
  byte-identical to r64's same-seed files, carrying r64's full read).
  0 fabrication flags.

## The trace, deflection by deflection

All five are the first dry line ("...Sorry, lost my train of thought."),
all run-blocked, all with a SAYLINE-INTERNAL pool draw on the same day,
villager, and tag/pick:

1. 26131 d+14 Patricia, teach (pick agency:ask_field), convo day 24.
   Blocked key: "Saw things with too many joints. Give them room. That's
   the whole lesson." — a generic lesson closer shared across teachers.
2. 26132 d+30 Maya, teach (agency:ask_field), day 46. Blocked key:
   "There's more, but that's for another fire." — the same closer Somchai
   speaks unblocked at d+15 and Carlos speaks unblocked at d+30: it speaks
   when fresh, dissolves when repeated inside the window.
3. 26134 d+14 Liam, teach (agency:ask_field), day 34. Blocked key: the
   same "another fire" closer.
4. 26134 d+45 Liam, teach (agency:ask_field), day 65. Same closer again —
   the same villager re-teaching the same closer 31 days later still
   dissolves, because the window is recency-based, not per-villager.
5. 26135 d+14 Imani, favor-ask (pick alive:want:ask_favor), day 27.
   Blocked key: "No, really — it's handled. Thanks for asking, though."
   — a generic favor brush-off. Leroy speaks this exact line unblocked
   in his own d+14 convo: one line, two villagers, one speaks, one
   dissolves, depending on window position.

Supporting evidence outside driven transcripts: on 26135, Katarina's
trader intro ("...I trade in what I know. My knowledge for yours...")
run-blocked twice in policy play (days 15, 25, conversation.js:5344 via
journal.js) — same class, same dry line, outside the driven set. The
ledger's anti-parrot job is working as designed; it is the SHARED
GENERIC LINES (lesson closers, favor brush-offs, trader intros) that
make legitimate repeats look like parroting.

## The carried invite check, including the OTHER

25 outcomes: 24 table-spoken (accepts and declines, invitations sometimes
taken as ruled), 0 deflected. The 1 OTHER is Carlos (26135 d+3): "Finally.
I was wondering when you'd see my value." — a spoken accept, not a
deflection. It is outside the analyzer's YES table because it is one of
the 3 BACKSTABBER eager-accept lines (party.js:187, betrayalIntent path:
backstabbers always accept for proximity). The analyzer's YES table
covers only the 4 standard accepts; the eager lines are a table gap,
not a game bug. Carlos's later confession ("I'm not from Denver. I'm
from Veracruz... Please don't tell the others") keeps the trap texture
intact. Metric-review note: a future analyzer should add the 3 eager
lines to YES so this case counts as SPOKEN-accept automatically.

## Village assessment (plain words)

- 26131: Aurora died in the wild on day 10; Ava took the mantle, then
  Jorge on day 30 (scripted second handoff). Ends with 10 alive and a
  fat pantry (27,999 kcal). Office trust 19 → 54, village mean to 70.9.
- 26132: Robin died day 16; Enzo, then Dante on day 30. Ends with 9 alive
  and 26,872 kcal — this seed DIED OUT in r64 (day 31, pantry 0) and
  survives here; the armor-seeding drift changed its fate, not any
  succession mechanic. Village mean to 85.1, the strongest climb.
- 26134: George died day 20; Khaled, then Leonor took over organically
  (chain cause known). Ends with 8 alive and 24,738 kcal — byte-identical
  transcripts to r64 on this seed's top-2 convos.
- 26135: Tanisha died day 13; Rosa carried the village, then Leroy took
  over organically (a second handoff r64 did not see on this seed). Ends
  with 9 alive and 32,189 kcal, the fattest pantry.

First deaths were organic on 4/4 pilot seeds (days 10, 16, 20, 13) — the
day-40 scripted mature kill staged on 0/4, the same aspiration r64
found. The leg is carried by organic deaths, which is why the pilot
still exercises real handoffs.

## People check (45/45 transcripts read)

NPCs want concrete things: a haul, a forage partner, wound help, a trap
line walked together. They grieve actual dead by name — Robin (Dante,
Dineo, Maya), Tanisha (Leroy, Imani), Rosa (Wanjiru). Teach turns that
land teach real items (Flashbulb Moth, Sunbasker, Pedunculate Oak
Acorn). Endings resolve, plant, or owe: a stockpile gift (+4 wood,
+4 fiber), a buried-truth confession (Carlos), a repeated-question
escalation that refuses to loop (Gladys: "I confessed that already. I'm
not confessing it twice for dramatic effect"). Foreign-language villagers
(Vasyl, Yuki) stay coherent through gesture and the few caught words.
Checked, not a flag: Imani d+14 opens "Never mind the sickness I'm
fighting — we got it handled" after begging for fever help at d+7 — a
recovery claim, not a contradiction; Leroy's matching "it's handled"
line is the same brush-off spoken fresh.
No deflection strands a conversation: every deflected convo closes
warmly afterward. The loss is one beat, never the thread.

## The Steve-call input (no fix made here)

Fix-all C left widening the diegetic-act exemption to teach/tell-me as
Steve's call. The trace now says what that call decides between:
(a) EXTEND the exemption to teach/favor outcome lines, as invite got —
kills this deflection class outright, at the cost of letting shared
closers repeat verbatim across villagers (the ledger's anti-parrot job
for those lines goes away, same trade invite already made); or
(b) VARY the shared lines per villager (lesson closers, favor
brush-offs, trader intros get per-speaker variants) — keeps the ledger
working, costs content breadth. What the trace rules OUT: a handler fix
(the dlg handlers are not drawing the pool directly — 0 DLG-DIRECT) and
a missing-content fix (every deflected turn composed a real line that
the ledger then blocked). The want-detail class did not deflect in this
pilot (Liam d+45 and Imani d+7 detail answers land in full) — r64's
want-detail cluster was the same mechanism on different lines/days, not
a separate broken handler. No exemption was widened here.

## Drift vs r64 (same seeds, new master)

Transcript diff: 23 byte-identical, 8 differs, 14 new (different
villagers at checkpoints on 26132/26135 — Dante, Somchai, Vasyl, Yuki,
Carlos, Wanjiru, Gladys, Leroy-d+7). Cause is the armor-only src delta
since r64 (bark-wearer seeding changes village composition and talk
paths); no conversation.js change. Sibling count moved 10 → 5 and the
class mix moved (want-detail 6 → 0, teach 3 → 4, favor-ask 0 → 1) —
counts move with which villagers talk, the mechanism does not.
Second-successor bonds held exactly (19/19 both runs); first-successor
phantom bonds at end on forced seeds 15 (r64: 14 = 5 + 9; the +1 sits on
26132, whose second successor differs this run — same compounding
pattern, one more phantom, not a new class).

## Reachable / fun / winnable (leg 7)

- REACHABLE: yes — handoffs fire organically on 4/4 pilot seeds plus
  both forced second handoffs, and the trace evidence comes from
  ordinary driven play, not scripted sittings.
- FUN: yes — driven convos carry wants, grief, favors, and real
  accept/decline variety (including a backstabber eager-accept with its
  confession payoff); the 5 dry beats are single lost lines inside
  conversations that still close well.
- WINNABLE: yes — 4/4 villages alive at window end with fat pantries;
  the leg does not protect a village from starving, and should not.

## Metric review (§14)

- TRACE-CLASS judged on joined turn shapes (sayLine fellBack + pool-draw
  site), not on counts: a deflection with no trace candidate would have
  been UNJOINED, never assumed RUN-BLOCK. Join rate 5/5.
- The invite OTHER case was judged by hand from party.js (backstabber
  eager line), never auto-passed; the analyzer-table gap is recorded
  above rather than silently widening YES mid-run.
- Opportunity-0 rule worked as designed: 5 sibling deflections in the
  pilot, no expansion needed. Had the pilot shown 0, the verdict would
  have been INSUFFICIENT-DATA, not TRACED.
- Carried: r64's mature-staging aspiration (0/4 scripted) recurs
  unchanged; future preregs should keep calling it "mature window"
  rather than "staged", per r64's metric review.

## Telemetry deviation check (Steve 2026-10-13)

- Command: node scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/succession.json --current
  'evidence/2026-10-29/journey-succession-r67-*.stdout.json'
  --metrics deaths.bearer,pantryEnd,ledgerAlive
- LOUD lines (2), both EXPLAINED, baseline NOT rolled — identical to
  r64's two artifacts:
  1. "deaths.bearer: baseline 5 -> current 0" — metric-shape artifact:
     the r67 stdout JSON carries a singular `death` record per seed, not
     a `deaths.bearer` aggregate, so the tool sums a missing path as 0.
  2. "pantryEnd newly appeared: baseline 0 -> current 111798" — pantryEnd
     is not a baseline metric; 111,798 is the 4-seed sum
     (27,999 + 26,872 + 24,738 + 32,189), not a deviation.
- The succession baseline stays stale against the r55+ instrument;
  re-seeding needs a regime note by its owner, not a silent roll.

## Regression

- node scripts/check.js --only succession
  --cacheDirectory=/tmp/jest-cache-playtest2: 11 passed, 0 failed in 73s
  (same succession set as r64).
- Proof test scripts/test-journey-succession-r67-instruments-20261029.js
  run directly, ALL PASS (twice: before and after the SAYTRACE
  empty-line noise filter; the filter drops silence-beat nulls with an
  empty key from the trace, keeping only blocked non-empty lines).
  Proof-seed scratch (24999 transcripts/tele) deleted after the runs.

## Files (this commit)

- scripts/journey-succession-r67-20261029.js (r64 driver verbatim +
  SAYTRACE wrappers)
- scripts/analyze-journey-succession-r67-20261029.js (r64 analyzer +
  TRACE JOIN)
- scripts/test-journey-succession-r67-instruments-20261029.js
  (proof: driver parity + seam tables equal game code + classifier +
  SAYTRACE presence/shape)
- evidence/2026-10-29/journey-succession-r67-prereg.md
- evidence/2026-10-29/journey-succession-r67.md (this note)
- evidence/2026-10-29/journey-succession-r67-analyzer.txt
- evidence/2026-10-29/journey-succession-r67-{26131,26132,26134,26135}.stdout.json
  + .stderr.log + -tele-*.json + 45 transcripts
