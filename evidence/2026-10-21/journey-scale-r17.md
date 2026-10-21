# journey-scale r17 — the table approach (2026-10-21)

**Run id:** 2026-10-21T02:43:39Z (oversight-playtest-loop, LANE A, leg 3 scale).
**Base:** master 67f1dfbed (worktree `journey-scale`, verified).
**Rotation note:** journey-rotation-a.txt read "3" at run start. This run plays
leg 3 and writes back "0".

## PRE-REGISTER (MEASUREMENT.md §§9–12, 14 — written before any play or code change)

**Leg question:** after the table is announced on the national belong road,
what does the table approach really play — "THE TABLE IS SET" (announce) →
seat-take from Haven → tableScene's pricing audit → the 7-door offer: does
every beat stage aloud, is the audit honest about the seat and the run, are
the earned/unearned doors shown and priced (never hidden), and is any part
a trap, a silent flip, or unfireable?

**The open gap (why this, not a re-run):** r16 reached a lesser seat +
announce on 5/10 seeds — and in every one, tableWaiting stayed true and
nobody ever sat. The journey-scale harness never takes the seat, so the
announce → audit → door-offer sequence is entirely unplayed in journey sims.
A competent player who hears "Nothing is final until you sit" sits. Path
play (door entry) is lane B's domain — this run covers the approach and
stops at the doors.

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 staging — the table is announced (tableAnnounced) on ≥2/4 pilot seeds
  (substrate established: r16 reached announce on 5/10 with this policy).
  A seed that never announces is replaced, never a miss.
- M2 the approach fires aloud — on every seed with tableAnnounced and alive
  at/after d90: a competent seat-take (tableTakeSeat, same day as or the day
  after the announce lands ready) commits (tableDone=true), the scene's
  spoken text is captured (set + audit + 7-door offer), and every audit
  number is state-verified against the seat detail (copy ≠ trusted). NO-GO
  if the seat takes silently (no scene text) or any audit number ≠ the
  state. The door offer must show unearned doors priced (never hidden).
- M3 people — ≥4 full transcripts sense-read (announce day, sitting day,
  two ordinary scale days), 0 senseless flags.
- M4 survival — ≥2/4 reach d120 (death-aware; dead/scattered stops).
- M5 instrument-honesty — tablePreview() is a pure read: two consecutive
  calls return deep-equal results with no progState mutation between them
  (r1 instrument-honesty, the havenViewership() lesson).

**Interesting-finding bar:** the real table-approach ledger — what the
scene stages and when; which doors a lesser-seat run earns and what the
unearned ones cost; whether the overtime clock's announce-origin changes
the price by waiting; any silent flip (a seat that takes with no text, a
withdrawal without the beat, an unearned door hidden); any unfireable
beat in the approach.

**Policy:** belongfeast-watchfeast (r16's instrument: The Binding answered
'swear', the Watchers answered 'feast'; FEASTSCALE_R13=1 via R15_FEAST=1).
Nothing changes from r16 except the added table-approach driver (the seat
take) and its captures — the same tip, the same road, continuity.

**Seeds:** 17001–17004 (fresh, disjoint from r9–r16: 83xx–84xx, 95xx–98xx,
14003, 15001–15004, 16001–16010). Replacements 17005–17010 per M1's rule.

**Horizon:** DAYCAP=185, death-aware (+10d tail max; never tick a dead village).

**Substrate checklist (§14b):**
1. Contact: the table announced on 5/10 r16 seeds with this exact policy —
   the mechanism is live on this tip. PASS.
2. Pool sizing: engine-path exercise with state verification, not a lever
   measure — the pilot + replacements suffice. PASS.
3. Verb existence: tablePreview/tableTakeSeat/tableScene/tableEarnedPaths
   are the established idiom (Haven-panel action in the live game; driven
   directly in node, which has no app.js). PASS.
4. Horizon fit: announce fires at d90+ (NO SPOILERS); DAYCAP=185 covers
   announce → sit → verify on staged seeds. PASS.

**Kill verdict taxonomy:** an M2 miss is METRIC-BROKEN unless the autopsy
finds the approach can't reach the mechanism from a Haven-panel take (then
CONCEPT-DEAD). A silent seat-take is NO-GO for the leg's "played, never a
silent flip" canon.

## HARNESS

`scripts/journey-scale-r17-20261021.js` (r16 instrument + R17
table-approach driver: `stampTableAnnounce` + `driveTableApproach` — when
`tableAnnounced && !tableDone`, the harness calls `tablePreview()` daily
(M5 pure-read check), and when ready calls `tableTakeSeat()`, capturing the
scene text, the audit line, the seat detail, and the 7-door offer from
`scholar.tableChoices`; doors are NOT entered — lane B's domain; zero
game-code change). `node --check` clean.

## RESULTS

### The table approach — 4/4 seats taken, all aloud

| seed | seat staged | announce | sat | audit spoken vs state | doors earned/priced |
|------|-------------|----------|-----|----------------------|---------------------|
| 17001 | d43 | d90 | d90 | 12/10/7, 7 contests, 3 crises, national — EXACT | 6 offered / indispensable priced |
| 17002 | d70 | d90 | d90 | 17/8/3, 7 contests, 3 crises, regional — EXACT | 6 offered / indispensable priced |
| 17003 | d53 | d90 | d90 | 16/8/7, 14 contests, 3 crises, regional — EXACT | 6 offered / indispensable priced |
| 17004 | d102 | d102 | d102 | 15/8/3, 12 contests, 3 crises, regional — EXACT | 6 offered / indispensable priced |

Every seat-take staged the full scene aloud:
- "◈ THE TABLE — it is not a table. It's a ring of pale light, and around
  it, things with too many angles to be faces. Above it all — the
  audience. Trillions of eyes, and every one of them knows your name."
- "◈ THE AUDIT — the System reads your run back to you, and the galaxy
  listens. A lesser seat — [rank] standing, waves 1–3 faced (w1/w2/w3),
  N contests survived, N crises weathered." — every number == the seat
  detail, state-verified, never copy-trusted. The rank is honest too:
  17002/17003/17004 say "regional standing" (national came later or never).
- The sanctity line: "EVERYONE. SIT. WATCH. The teeth and the weather can
  WAIT — nothing out there matters until this is done. ...Did I stutter? SIT."
- The 7-door offer: 6 earned doors as clickable options (Feared, Beloved,
  Witness, Assimilated, Defiant, Relay), each with a real standing and a
  state-grounded reason — "31 distinct monsters faced blow-by-blow",
  "Viewership 31, fan favor 33 — the galaxy's favorite, by the numbers",
  "6 exposures on the record", "Defiance 6 on the record. The 'no' is
  earned." The Indispensable shows priced-away, never hidden: "The
  Indispensable needs a full seat — the galaxy must actually need you,
  not just notice you." The modal was left OPEN (a player reading the
  offer); no door was entered — lane B plays the paths.

### M1 staging — GO (4/4 announced)
17001/17002/17003 announced d90; 17004's seat staged d101 and announced
d102 (NO SPOILERS honored — the table is never named before day 90, and
here the seat didn't even exist until d101). Replacements unneeded.

### M2 the approach fires aloud — GO (4/4)
Every announced seed committed the seat-take (tableDone=true) on the
announce day or the day the seat staged. Scene text captured on all four:
set + audit + sanctity + door offer. Audit numbers == state on all four
(zero mismatches). Earned doors == offered options (6/6); the one unearned
door (Indispensable, full-seat-only per TABLE.md) shown priced, never
hidden. No silent flips, no traps, nothing unfireable in the approach.

### M3 people — GO (4 transcripts sense-read, 0 senseless)
- **Milton d80 (17001, ask_favor):** "Pantry's thin and getting thinner.
  Forage with me tomorrow?" — concrete want, engage (details) → deflect
  ("I can't right now") → honest close ("They won't ask twice. That much
  is clear."). A person with a pantry problem. PASS.
- **Sofia d100 (17002, ask_favor, want unengaged):** the conversation
  opened on her "prove" value ("Watch what I do, not what I say") and the
  driver deepened the value thread 8× — she stayed in voice throughout,
  varied every answer ("Give me the hard job. Please. I need the hard
  job." … "Every useful thing I do is a brick. I'm building something
  with my name on it."), then closed it herself. The favor want sat at
  stage 0 because the want menu returns [] on the value thread and the
  driver never picked dlg:subject (the thread-switcher). Coherent on its
  own thread; the favor machinery is a driver blind spot, not a game
  stall — a real player sees "Can I ask you something else?" and the
  favor need persists for a later sitting. Documented, not flagged.
- **Yada d100 (17004, curious):** "Teach me something. Anything you know
  that I don't." — the q_teach_me answer ids pair correctly with their
  labels (a_tell = "show you while we're working"), she reacts in kind,
  closes warmly ("we're nine people, it's hard"). Slightly repetitive via
  goon, but human. PASS.
- **Onni d140 (17003, ask_favor fromSeed):** a stated favor (stage 2)
  coexisted with a pending invite and a value opener; turn-0 offered only
  betrayal:accept/decline/leave — the favor-commit menu and dlg:subject
  were both absent, so the favor stayed 'stated' for another sitting.
  Honest (the ask persists via fromSeed), but the menu-precedence
  (invite-extra prepended, want menu suppressed on the value thread)
  means a stated favor can be unanswerable in an invite-bearing
  conversation. Documented as a candidate blank for a social-loop run —
  no game-code change here.

### M4 survival — GO (4/4 ≥ d120)
17001 d172, 17002 d171, 17003 d186, 17004 d178, all survived. Caveat for
metric review: the sitting happened at d90/d102 and the 7-door modal was
left open, so post-sitting days ran under the game's own table sanctity
(ambient monster pressure suspended while phase='paths'). The pre-sitting
on-ramp is the honest survival evidence here; post-sitting survival is
weaker. The fights that did continue (10/5/—/— post-sitting fights, combat
deaths on every seed) show the runs still bled — sanctity suspends ambient
spawns, not driven encounters.

### M5 instrument-honesty — GO
tablePreview() called twice per sitting seed: deep-equal results, zero
progState mutations between calls. No havenViewership()-style lazy-init
trap in the preview path.

## FINDINGS

1. **The approach's real ledger.** Announce → sit → audit → doors costs
   nothing when taken promptly: overtime tier 0 on all four (the clock
   starts at announce; sitting same-day or near pays no standing
   penalty). The price of the approach is the decision, not a resource —
   which matches the canon (the table prices the run, and the audit
   prices it aloud). A player who dithers for weeks after the announce
   would pay overtime standing — the mechanism exists but no seed
   exercised it (named next for a future run: does the overtime line
   speak honestly at tier ≥ 1?).
2. **The Watchers is not on the critical path.** 17003/17004 sat the
   table with the Watchers never staged (viewers 29/27 < 32). The lesser
   seat's scale bar is regional+ — a regional road can walk the whole
   approach without ever going global. On 17001 the Watchers staged at
   d105, AFTER the sitting — the global beat is a parallel track, not a
   gate. This is the designed reachable bar working (TABLE.md: "reachable
   by competent non-god play"), not a bypass: the seat bar is what it is.
3. **The audit never lies (4/4).** Waves-faced counts, contest/crisis
   counts, and the rank string all matched state exactly. The rank is
   the honest edge: 17002's audit said "regional standing" though the
   village went national at d148 — the audit reads the run as it is at
   the sitting, never flatters.
4. **Door-offer honesty (4/4).** Earned doors == offered options;
   standing numbers and reasons are state-grounded (feared's "31 distinct
   monsters" at sitting grew to 36 by d172 — the door read the run at
   the sitting, correctly). The Indispensable priced-away line names the
   full-seat requirement aloud. Nothing hidden, nothing unfireable in the
   offer.
5. **Instrument gap (fixed).** The announce-text stamp used capture[-12];
   the dawn announce fires before daily and dawn news exceeded 12 lines —
   the text was missed on all 4 pilot seeds (markers confirmed the line
   staged). Widened to -40 in the harness (R17b note in the script).
6. **The Binding still fires after the sitting.** 17001 answered The
   Binding at d72/d111/d120 (re-bindings after dissolves), 17002 at d148,
   17004 at d122 — the national road keeps living after the table sits.
   The 'the binding' marker LOUD line is content-draw variance (the hits
   came from "The Oath" contest text in 5/10 r16 seeds; 0/4 drew it here),
   not a beat regression — investigated and explained (see TELEMETRY).

## VILLAGE ASSESSMENTS — in plain words

- **17001 (national road, sat d90, survived d172):** 9 alive at the end —
  Kadek the farmer, Georg the nurse, Omar the piano tuner leading at
  trust ~91. 13 villager deaths, mostly combat through the wave-4 window
  (Olivia d26, Xavier d31, Owen d93, Chen Wei d101), plus two late
  dehydrations (Nadia d132, Milton-the-fishing-guide d148 — the same
  Milton whose d80 favor I sense-read). National from d72, held 93 days;
  the Watchers staged d105 (after the sitting). 200 plants known across
  the village. What they knew: deep counter knowledge (30 observed / 23
  discovered). What was missing: people — 13 graves.
- **17002 (regional→national, sat d90, survived d171):** 8 alive — Dmitri
  the appliance repair tech at trust 100, Ivan the exterminator, Sofia the
  community gardener (whose d100 value-conversation I sense-read). Only 7
  villager deaths (Dustboar, combat, one dehydration) — a cautious village
  that bled little. National came late (d148) but the table came on the
  regional bar. 385 plants known — the most learned village of the four.
- **17003 (regional road, national never, sat d90, survived d186):**
  7 alive — Ella the ESL teacher (94), Xavier the lawyer, Sanne the
  vintner. 10 deaths including Ethan d57 (monster) and Zoe d166
  (sickness). Never went national, never staged the Watchers — and still
  walked the full table approach on the regional bar. 514 plants known —
  scholars to the bone. What was missing: a polity — the belong road's
  courtship never consolidated here, but the table came anyway.
- **17004 (national road, sat d102, survived d178):** 7 alive — Caleb the
  firefighter, Sanne the vintner, Rafael the roofer (all trust 90). 8
  deaths: a wound that wouldn't close (d62), a contest death (d85),
  dehydration (d92). The seat staged late (d101) on the w3 bar; announced
  and sat d102. Yada's d100 teach-me conversation happened two days
  before the sitting — the village was still asking to learn.

## REACHABLE / FUN / WINNABLE (scale leg, the table approach)

- **REACHABLE:** YES — 4/4 pilot seeds announced and sat, two of them on
  the regional bar without national or the Watchers. The approach is one
  Haven-panel action after the announce; the audit speaks the run back;
  the doors are all playable choices.
- **FUN:** the audit is the payoff — the galaxy reads your specific run
  back to you, numbers and all, and it never flatters. The 7-door offer
  names what you earned and prices what you didn't, on the record.
- **WINNABLE:** the approach commits nothing — "Nothing is final until
  you sit" is honored in reverse too: sitting opens the doors but the
  player chooses the risk. No trap in the approach: no resource is taken,
  no door is hidden, the overtime clock only taxes delay.

## METRIC REVIEW (§14)

- M4's d120 window includes sanctity days (modal left open). The honest
  survival evidence is pre-sitting; post-sitting survival under an
  undeliberated modal is not natural play. Proposed revision for a future
  run: score M4 at the sitting day, or (lane B's call) close the approach
  by choosing a door so the run plays the path. No revision applied now —
  the pilot-4 rule surfaced the caveat honestly, which is its job.
- M2's announce capture (the -12 slice) missed the spoken announce text
  on all four seeds; the marker counts confirmed it staged. Fixed in the
  harness (R17b: slice -40). The fix is instrument-only, no game code.
- No metric was re-scored mid-run. The r16 "replace, never a miss" rule
  was inherited; no replacements were needed.

## TELEMETRY

`telemetry-check.js` vs `scale-belong.json` (4 seeds, 10 metrics):
3 LOUD lines, all investigated same-run:
- `markerCounts.theBinding disappeared (14 → 0)`: EXPLAINED — content-draw
  variance. The baseline's hits come from "The Oath" contest text ("the
  binding hears the difference"), drawn in 5/10 r16 seeds; 0/4 r17 seeds
  drew that contest. The actual Binding national beat fired and was
  answered on 3/4 r17 seeds (bindingLog d72/111/120, d148, d122). No beat
  regression.
- `markerCounts.demand disappeared (251 → 0)`: EXPLAINED — instrument
  gap, same as r16. The r14–r17 instrument family defines no demand marker
  (the 251 comes from an older baseline corpus); the belong road generates
  none.
- `tableTele newly appeared (0 → 4)`: EXPLAINED — `table_entered`
  telemetry fires at each sitting day (d90/d90/d90/d102). r17 sits the
  table; r16 never did. This is the run's own signal, not a regression.
Baseline NOT rolled forward (deviations explained; 4-seed corpus).

## BLANKS

1. **FILLED — the table approach** (r16's named open gap: the announce →
   audit → door-offer sequence was entirely unplayed in journey sims).
   4/4 seats taken aloud, audits state-verified exact, doors offered
   honestly, nothing unfireable. The two sub-findings (Watchers not on the
   critical path; overtime untaxed on prompt sittings) are the new
   mechanical texture.
2. **Documented (no game-code change):** the favor-menu precedence in
   invite-bearing conversations (Onni d140: stated favor unanswerable at
   turn 0 with no dlg:subject offered) — candidate blank for a social-loop
   run; the favor persists via fromSeed, so nothing is lost. The announce
   instrument slice (-12 → -40) — fixed in-harness.

## FILES

- Harness: `scripts/journey-scale-r17-20261021.js` (r16 instrument + R17
  table-approach driver + R17b announce-capture widen; builder: transform
  script, auditable; `node --check` clean)
- Evidence: `evidence/2026-10-21/journey-scale-r17-belongfeast-watchfeast-1700{1,2,3,4}.json`
  (4 seeds) + `-transcript-1700{1..4}-day{80,100,120,140}.txt` (16
  transcripts; 4 sense-read for M3)
- Analyzer (outside repo, not committed): `~/workspace/journey-scale-r17-analyze.js`
- Pilot log: `~/workspace/journey-scale-r17-pilot.log`
- No src/js changes. No proof test (no game-code fix shipped).
