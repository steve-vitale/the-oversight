# Diplomacy / village links + ally-join — first numbers — Loop A verdict
(run fleshout-20261110T1815Z, arm sim-diplo-a; Coverage Program Tier 1 #2,
Steve order 2026-11-10 11:11 CST "Measure all so we can improve on all gaps")

Axis: coverage — diplomacy / village links + ally-join had no panel metric
and no first numbers; the base driver never proposes a link and link play
existed only in specialist policies. MEASUREMENT ONLY, zero src/js.
Gates, prices, deeds, and readyDemand untouched.

## Pre-registration (committed before any judged computation)

Full text: `evidence/2026-11-10/sim-diplo-a-prereg.md` (commits 70955b0ac,
a321397b0, 940c45b23 — two same-day amendments, both before any judged sim:
peer links are born in `_formPeerLink`, not `_formLink`, so formation paths
are six, not four; person-bond tele kind is `'person'`, not `'bond'`).
In short: competent policy verbatim, fresh band 170201–170208, 150d
death-aware horizon, TWO legs (default competent AND COMPETENT_TALK=1) plus
a no-instrument neutrality leg, all on identical seeds. GO iff: (1) every
link classified by formation path, none unclassified; (2) every
bond_proposed tele event reconciled, 0 irreconcilable; (3) neutrality —
no-instrument control matches instrumented control exactly on per-seed
days AND standing (8/8 each); (4) instrument errors 0; (5) complete
first-numbers capture. A GO verdict makes NO landing claim and spends NO
confirm band — there is no lever here to land.

## Grounding verified in code before the judged pilot (not assumed)

- docs/CANON.md read first; docs/SCALE.md (the scale-ladder canon) read for
  the ladder: polity = one primary with ≥3 SEASONED subordinates (seasoned
  = 30+ days old AND trust 40+; links form at trust 30); six national roads;
  national needs regional ≥ 30 days old; one rung per season (national
  ~day 61–90). docs/CONVERSATIONS.md covers dialogue/talk generally.
- NO canon doc covers diplomacy / link-raising as a system. Mechanics are
  grounded in code (src/js/bond-initiation.js, src/js/hierarchy.js,
  scripts/policies/competent.js) and stated as code facts, not canon.
- Formation has TWO birthplaces and SIX paths (grep, all of src/js):
  `_formLink` ← proposeLink (score ≥ 55 forms, 35–54 counters, < 35
  declines) / answerCounter (accept / sweeten) / answerRaid (terms /
  strike) / `_ladderRewardLink` (meta-progression stage-3 reward);
  `_formPeerLink` ← `_proposePeer` (via proposeCovenant / proposeTrade,
  score ≥ 55) / answerCounter (peer-counter accept / sweeten). No other
  path forms a link.
- Link raises: `stageLinkRaise` gates (raiser alive, person-trust ≥ 20,
  `build_standing` ≥ 1, raiser personally knows the village, village
  unlinked, no pending raise, 14-day re-raise cooldown, no undelivered
  talk request); `npcLinkRaiseTick` daily, ≤1 staging/day, hash-roll
  lottery 0.5, pendings expire after 2 days; `acceptLinkRaise` tells the
  lore then calls `proposeLink`.
- Person bonds: `proposeBond` decides through `npcInviteDecision` kind
  'bond' — temperament, goal, mood, fear, pair relationship, social need;
  chance clamped 5–95, never always/never. Tele kind is `'person'`, in two
  flavors: NPC→scholar staged proposals (outcomes staged/accepted/refused/
  expired, target = whoever is scholar at the time, chance null — answered
  in conversation like link raises) and NPC↔NPC immediate character
  decisions (outcome accepted/refused or a gate outcome, chance = the
  decision chance). There is NO counter outcome for person bonds.
- Plain `competent` contains ZERO diplomacy verbs — grep count 0 for
  proposeLink / proposeCovenant / proposeTrade / raidVillage /
  answerCounter / answerAccord / bidForPrimacy. It talks, but `talkRound`
  opens one conversation a day and walks straight out (zero exchanges);
  held conversations (`deepTalk`) run only under `COMPETENT_TALK=1`, OFF
  by default.
- **Ally-join, defined (prereg):** LINK-JOIN = a village becomes linked to
  Haven (any `_formLink` / `_formPeerLink` event, by path). PERSON-BOND =
  a villager↔villager bond proposed by an NPC, decided by character.
  **Wild ally-join: RULED OUT as a distinct engine path** — grep of src/js
  finds no code by which a wild villager or village spontaneously joins
  Haven outside (a) link formation via the six paths, (b) person-bond
  proposals, (c) the scholar joining ANOTHER village (`joinVillageReal`,
  betrayal.js — probation, the scholar leaves Haven), and (d) the finale
  march call (finale-campaign.js — linked allies answering, not a wild
  join). The winnability-chain phrase "wild ally-join" therefore maps onto
  LINK-JOIN in this measurement.

## Verdict — GO (judged strictly against the prereg)

1. Every link classified by formation path, none unclassified, none forced:
   control 8/8 ladder; armed 31 propose + 7 ladder = 38/38; 0 'other' on
   either leg. Zero peer-link formations on either leg (0 covenant, 0 trade).
2. Every bond_proposed tele event reconciled, 0 irreconcilable: link
   156/156 control + 90/90 armed; person 79/79 control + 83/83 armed.
   (One analyzer rule was CORRECTED live, before the verdict — see Metric
   review: person-bond reconciliation must match by initiator + scholar-
   at-the-time, not by target equality, because succession changes the
   scholar's id between staging and decision. The bar — 0 irreconcilable —
   did not move; the rule was fixed to what the code actually does.)
3. Neutrality holds exactly: no-instrument control matches instrumented
   control on per-seed days 8/8 AND standing 8/8 (135/199, 150/455,
   104/190, 139/250, 150/199, 62/135, 150/370, 79/199).
4. Instrument errors 0 on all 8 seeds, all three legs.
5. Complete first-numbers capture: per-seed tables for both legs below,
   plus the sense-test scenes.
Proof: `scripts/test-diplo-a.js` — 17/17 PASS (classification units,
analyzer fixtures incl. the scholar-succession regression, neutrality
checks, live install/shape/tele/wrap legs, a 30d armed miniature with
real formations, a determinism leg, and a 12d neutrality miniature).
RED->GREEN recorded: the suite failed on MODULE_NOT_FOUND before the
instrument/analyzer existed, then passed 16/16; the 17th test (succession
regression) was added with the analyzer fix and passes. The `_formLink`
wrap classified live propose paths in the miniature (propose@d15, d24).
`_formPeerLink` wrap is installed and proven to intercept (fixture-game
invocation), with no live formation observed in the pilot — its zero is
meaningful because every peer formation must pass through the wrapped
Game method. Balanced panel (§15): no before/after LEVER comparison
exists for a measurement arm, so none is fabricated and none is attached.

## THE DIPLOMACY ANSWER (plain words)

Sitting down to talk is the whole difference, and it is also where the road
stops. When the scholar holds conversations, villages grow friendships the
way people do: someone asks, the scholar answers, and by day 7–27 the first
friendship is asked for and granted by a villager's own voice — 31 of the
38 links on the armed leg came from a villager's raise being answered, and
seven of eight villages grew into a polity, fires under one head. When the
scholar walks out of every conversation, each village holds exactly one
friendship, granted from above by the System when their standing crossed a
line, and 153 of 156 asks expire unanswered.

But the road stops at the court door. On seven of eight talking villages
the First Court — the played moment where the realm becomes a nation — has
been sitting on the table for 40 to 86 days, unanswered, because nobody in
the game answers it: not the scholar, not the engine. The court is a
button on a screen, and the bot never presses it. So national, the table,
and the win are still 0/8 on both legs, even while the polity layer is now
7/8. The same silence holds the first gesture: the Regional Dawn's opening
gift has sat unanswered for 26 to 140 days on every seed, because the only
code that would answer it is switched off by default. And the villages
themselves keep their own counsel: villagers decide each other's bonds by
character all day long — 35 accepted, 42 refused across the band, at
honest mid-range chances — while the scholar's own bond proposals expire
unanswered 41 times out of 42 on the control leg.

## Per-seed table

| seed | leg | days | end | wave | standing | links (paths) | first link | seasoned max | polity | person staged acc/exp |
|------|-----|------|-----|------|----------|---------------|------------|--------------|--------|-----------------------|
| 170201 | ctrl | 135 | lost | 4 | 199 | 1 (ladder) | ladder d25 | 0 | no | 0/9 |
| 170201 | armed | 146 | lost | 5 | 400 | 4 (3 propose + 1 ladder) | propose d15 | 4 | yes d73 lead | 0/3 |
| 170202 | ctrl | 150 | surv | 5 | 455 | 1 (ladder) | ladder d32 | 1 | no | 0/2 |
| 170202 | armed | 106 | lost | 5 | 320 | 5 (4 propose + 1 ladder) | propose d7 | 4 | yes d48 lead | 0/3 |
| 170203 | ctrl | 104 | lost | 4 | 190 | 1 (ladder) | ladder d23 | 0 | no | 0/3 |
| 170203 | armed | 150 | lost* | 5 | 525 | 4 (3 propose + 1 ladder) | ladder d22 | 3 | yes d95 lead | 3/4 |
| 170204 | ctrl | 139 | lost | 5 | 250 | 1 (ladder) | ladder d34 | 1 | no | 0/10 |
| 170204 | armed | 141 | lost | 5 | 375 | 5 (4 propose + 1 ladder) | ladder d24 | 2 | no | 1/4 |
| 170205 | ctrl | 150 | surv | 4 | 199 | 1 (ladder) | ladder d32 | 0 | no | 0/4 |
| 170205 | armed | 150 | surv | 5 | 775 | 6 (5 propose + 1 ladder) | ladder d24 | 3 | yes d67 lead | 0/10 |
| 170206 | ctrl | 62 | lost | 4 | 135 | 1 (ladder) | ladder d37 | 0 | no | 0/2 |
| 170206 | armed | 150 | surv | 5 | 675 | 4 (3 propose + 1 ladder) | propose d15 | 4 | yes d58 lead | 0/4 |
| 170207 | ctrl | 150 | surv | 5 | 370 | 1 (ladder) | ladder d29 | 1 | no | 0/8 |
| 170207 | armed | 150 | surv | 5 | 645 | 7 (6 propose + 1 ladder) | propose d27 | 5 | yes d60 lead | 2/8 |
| 170208 | ctrl | 79 | lost | 4 | 199 | 1 (ladder) | ladder d28 | 0 | no | 0/4 |
| 170208 | armed | 150 | surv | 5 | 880 | 3 (3 propose, NO ladder) | propose d12 | 3 | yes d113 lead | 0/1 |

\* 170203 armed reached day 150 and was lost on the horizon day.
Band: control links 8 (ladder 8/8); armed links 38 (propose 31, ladder 7).
Polities: armed 7/8 (all LEAD), control 0/8. Seasoned links at end:
armed 13 total, control 1. Median survival: armed 150d (5 seeds censored
at 150), control 137d (3 censored). Wave-5 unlocks: armed 8/8, control 3/8.

## First numbers, by metric (prereg §primary metrics)

1. **Diplomacy verb calls, by caller path.** Only ONE verb is ever called
   on either leg: `tendLink`, 108 times, armed only — every call 1,500 kcal
   (162,000 kcal total; per-seed 3–27). Zero calls on the control leg.
   Everything else is 0 on both legs: proposeCovenant 0, proposeTrade 0,
   raidVillage 0, answerCounter 0, answerAccord 0, answerNationalChoice 0,
   answerGlobalChoice 0, bidForPrimacy 0. The tend calls come from the
   engine's own win-plan tick (win-plan.js: tends Haven-primary links with
   trust < 50, weekly, when ≥2 primary links exist and the pantry holds
   ≥3 days — which is why control, with exactly 1 link, gets 0). The
   zeros are real: every wrapped verb was proven to intercept on a
   fixture game (test-diplo-a), so a zero is a zero, not a dead wrap.
2. **Link-raise lifecycle.** Control: 156 stagings (144 second), 153
   expired + 3 pending-at-end, 0 accepted, 0 refused. Armed: 90 stagings
   (80 second), 57 expired + 31 accepted→formed + 2 accepted→
   propose-declined, 0 refused. The armed leg stages FEWER raises (90 vs
   156) because raises that get answered stop re-staging — the control
   band re-stages the same asks again and again after each expiry.
3. **Ally-join (LINK-JOIN).** Formation paths: control ladder 8/8, first
   link d23–d37; armed propose 31 + ladder 7, first link propose on 5/8
   (d7–d27), ladder on 3/8. 170208 is the only seed with NO ladder link
   (3 propose). Zero counter formations, zero raid formations, zero peer
   formations. The counter band NEVER fired on the band: 33 answered
   raises produced 31 formations and 2 outright declines, 0 counters.
   The two declines: 170202 d18 village_0 (raiser gen_hsnyruu), 170206 d25
   village_0 (raiser gen_gdo3pha) — both early, both the first village,
   both answered yes by the scholar and declined by the village (score
   < 35). Their decline SAY lines are not in the corpus (see Metric
   review — filter gap); the declines are proven by the proposeCalls
   outcome, not by a quoted line.
4. **Person-bond proposals.** Scholar-targeted (staged): control 42
   staged, 41 expired + 1 pending-at-end, 0 accepted; armed 43 staged,
   37 expired + 6 accepted. The 6 scholar-answered accepts land on only
   3 seeds (170203: 3, 170204: 1, 170207: 2) — the other 5 armed seeds
   answer none, same 150206-class failure as the link road (the raiser
   never gets a seat). NPC↔NPC immediate character decisions: control
   accepted 14 / refused 23; armed accepted 21 / refused 19; chances
   spread 5–95 (control bands 5–24:5, 25–49:19, 50–74:10, 75–95:3;
   armed 5–24:2, 25–49:18, 50–74:19, 75–95:1). No orphan scholar
   decisions (0) — every scholar-targeted decision traces to a staging.
5. **Foreign polities.** A foreign 4+-realm forms on 4/8 seeds on BOTH
   legs (control first d78/d92/d99/d141; armed d50/d64/d71/d85; max size
   6). Foreign max count is 1 — at most one foreign polity exists at a
   time on this band. But Haven NEVER hears about one: 0 foreign-polity
   rumor lines in the say corpus on either leg (144 trader-mention lines
   exist, none carries polity news). The BELONG road's precondition
   (a foreign 4-realm) is forming off-screen while the rumor channel stays
   silent about it.
6. **Wall numbers.** Wins 0/8 both legs; national 0/8 both; table 0/8
   both; wave-4 unlocks 8/8 both; wave-5 unlocks armed 8/8 vs control
   3/8; median survival armed 150d vs control 137d; standing armed
   320–880 vs control 135–455. Deaths: armed 881 (0.771/village-day),
   control 654 (0.675/village-day); starvation 0 both legs. The armed
   excess is combat (304 vs 115) and villager combat (270 vs 227);
   expedition is flat (215 vs 217). This arm carries NO cost bar (prereg:
   measurement only) — the rates are reported, not judged.

## The two unanswered beats (the wall finding of this arm)

**The First Court sits unanswered.** On 7/8 armed seeds a pendingNational
beat (LEAD shape) stages — first d59–d113 — and sits for 40–86 days until
the run ends, never answered. Verified by grep: `answerNationalChoice` /
`answerGlobalChoice` are called ONLY from app.js UI buttons (plus debug
scenarios). No engine code answers a national/global beat, and the
`_answermailDriveDaily` drive (which answers accords/tends/renegotiations/
demands) does not cover national beats at all. The polity forms; the court
never sits; nationalLive never fires. The 170204 exception is the other
half of the same picture: 5 links, but at most 2 seasoned at once, so no
polity ever forms and no beat ever stages — the seasoning bar, not the
answering bar, blocks that seed.

**The first gesture sits unanswered.** `pendingAccord` is true for 26–140
days per seed on both legs and `answerAccord` is called 0 times in all 24
runs. Proven by a scratch probe (not judged; /tmp/accord-probe.js, seed
170201 armed, 40 days): hierarchyDaily runs 40/40 days, the accord sits
pending on an ACTIVE link for 26 days, answerAccord called 0 times. The
reason is in the code: `_answermailDriveDaily` — the only engine caller
of `answerAccord` — fires ONLY when `ANSWERMAIL_DRIVE=1` in the
environment, and that flag is unset in these runs (the answermail-drive-a
sibling arm measures the drive armed; this arm measures the default). In
the default game the first gesture is a UI verb the bot never presses,
so the Regional Dawn's opening gift waits the whole run.

## Village assessment (plain words)

Picture sixteen villages in eight pairs — the same eight villages lived
twice, once with a scholar who walks out of every conversation and once
with one who stays. The ones who walk out each hold exactly one
friendship, handed down by the System in the third or fourth week, and
spend the rest of their lives watching their own people ask for more:
a hundred and fifty-six times someone says "we should link with them,"
and a hundred and fifty-three times the ask dies unanswered. The ones who
stay grow three to seven friendships, most of them asked for by name in
the first month, and seven of the eight grow into something with a shape —
a realm, fires under one head, seasoned over weeks. They live longer, stand
taller, and fight more. And then they stop, all eight of them, at the same
closed door: the court has been sitting for two months, the invitation on
the table, and nobody in the whole village — scholar, representative,
engine — ever answers it. The first gift, too, sits unopened from the
second week to the end. The diplomacy road isn't missing its beginning
anymore. It's missing its answers — the played moments at the top of the
ladder, which only a hand on a button can give, and no hand ever comes.

## Sense-test

- The answered raise reads like people. 170201, day 15: "⛓️ Emma brings
  it home: Stonebridge bows to Haven — one organization, us primary.
  Tribute: 4,000 kcal/week. The relationship starts at trust 30.
  Everything from here is earned." + Codex: "First link formed with
  Stonebridge. The gesture goes out now; the Dawn waits for seasons."
  A named villager carries the news; the System narrates the season it
  will take. The same day, the link is already lived in: the fire
  settles, kills are told, counters are learned ("MOVE, don't stare").
- The milestone line reads like people, once: "Three fires bow to Haven.
  But a realm isn't leverage — it's seasons. These bonds are young; tend
  them, keep the trust, and the court will come." (hierarchy.js:823,
  fires at the third link's formation.) It is honest about the wait —
  and the wait is the finding: the court it promises never comes, because
  nobody answers the beat.
- The ask itself still wears the thin template secondlink-a and talkturn-a
  flagged, and on this band it is total: EVERY raise line in the armed
  corpus is the rumor variant — "I've heard good things about
  Thornfield. We should link with them — we'd be stronger together." —
  63x Thornfield, 61x Stonebridge, 27x Emberhold, 11x Ashford, 10x The
  Red Table, zero 'visit' / 'seen-nearby' / 'told' variants. The line is
  honest about being secondhand, and the lore these villagers hold is
  still all rumor. With 31 raises now answered, the repetition is louder
  than it was when they all expired: the same sentence, accepted 31
  times. A voice-pool note for later, not a defect in the ask.
- The unanswered bond ask has a face on 170205 armed: nikolai_volkov
  stages a bond proposal to emma_larsen SEVEN times (d98, d107, d111,
  d114, d119, d134, d138, d148 — every one expiring), while on the same
  day as one staging (d107) his proposal to hassan_ali is ACCEPTED
  by character. He can bond. He is heard by his peers. The scholar just
  never sits with him. The same 150206-class seating failure talkturn-a
  named for link raises is alive for person-bonds too.
- The two village declines (170202 d18, 170206 d25) are numbers without
  a scene: their say lines never entered the corpus (filter gap, see
  Metric review). A decline the player never hears is a real honesty
  gap for the next instrument, not a verdict about the decline itself.
- No robotic villager behavior was flagged by this arm's corpus beyond
  the template repetition above. The refusals that DO happen (42 NPC↔NPC
  bond refusals) are character decisions with reasons attached ("lonely
  for company (+10); bold temperament (+15)..."), not dice.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The GO bars held up: classification separated the band cleanly
  (propose 31 / ladder 7 / other 0), reconciliation went 246/246 link
  + 162/162 person with zero residue, neutrality reproduced exactly on
  all four checks, instrument errors 0. No bar needs lowering or raising.
- **Analyzer rule corrected live (reconciliation, person bonds).** The
  first analysis run returned NO-GO on 11 irreconcilable 'person' staged
  events. All 11 were one mechanism, proven in code and in the corpus:
  a staged bond proposal names whoever is scholar AT STAGING time, and
  its decision/expiry names whoever is scholar AT DECISION time — and
  succession between the two changes the id (170202: elif_demir stages
  to diana_osei d134, expires to gen_pk2a6y3 d137; the scholar changed
  in between). The rule was fixed to match by initiator + scholar-at-
  the-time (from daily scholarId snapshots, piecewise-constant), with a
  regression test added (test-diplo-a, 17/17). The bar (0 irreconcilable)
  did not move; the verdict after the fix is GO. Future instruments
  must never match person-bond events by target equality.
- **Say-filter gap: the decline line.** The two propose-declined outcomes
  have no say lines in the corpus. The filter
  /link|bond|raise|polity|realm|season|tribute|trust|standing|covenant|
  trade|raid|primacy|court|oath/i missed them — the decline line's
  reasons evidently carried none of those words on these two occasions.
  Add "decline" to the filter next run (and check the reasons text).
- **Foreign-polity rumor silence is a filter caveat, not a proof of
  silence.** 0 foreign-polity lines in a corpus filtered on polity/realm/
  bound-adjacent words is strong, but the rumor text could in principle
  use words outside the filter. The next instrument should grep the raw
  say stream for foreign primary names before claiming the channel is
  silent. (The state-side fact — foreign 4-realms form on 4/8 seeds —
  is not in doubt; it is read from foreignPolities(), not from say.)
- **The tendLink zero on control is a gate fact, not a policy fact.**
  Control gets 0 tends because the win-plan tick requires ≥2 primary
  links; armed gets 108 because it has 3–7. A future arm that wants a
  tending measurement on a one-link village needs a different instrument
  (or the ANSWERMAIL_DRIVE=1 leg, which tends weekly at pantry > 20k).
- **Deaths are reported, not judged.** This arm carries no cost bar by
  design (prereg: measurement only). The armed daily death rate is
  higher (0.771 vs 0.675), driven by combat — the same direction
  talkturn-a reported, with the same "more living, more exposure"
  shape. Whether that is a cost of talking or of the links themselves
  (more fires = more fights?) is NOT separated by this design; a build
  arm that lands a talk-adjacent change should carry the revised
  deaths-per-village-day bar talkturn-a proposed.
- **A day-151 event exists in the corpus** (170205 armed: a person-bond
  expiry at day 151 on a 150-day run). The run counts 150 days from day
  1, so the horizon day is day 151 in game-day numbering. Days are
  reported as the driver reports them; the analyzer's lastDay comes from
  the daily snapshots, so the pending-at-end rule is unaffected.

## Next blanks, in order

1. **Answer the court (the national-beat build, NAMED not built).** The
   First Court sits unanswered 40–86 days on 7/8 armed seeds; national
   is 0/8 because the beat is never answered, not because the polity
   fails. A build arm should measure, on this band: does answering the
   national beat (by policy, by the answermail drive extended to national
   beats, or by a representative auto-answer) turn the 7/8 polities into
   national — and what does the court cost when answered? Do NOT move
   readyDemand numbers or any win price/deed gate on this evidence.
2. **Answer the first gesture.** The accord sits 26–140 days per seed
   because the only engine answer is behind ANSWERMAIL_DRIVE=1 (off by
   default). The answermail-drive-a sibling arm already measures the
   drive armed; the open question is whether the drive (or the default
   policy) should answer the accord at all — the gesture is the Regional
   Dawn's opening moment, and in default play it never happens.
3. **Seat the raiser — for person-bonds too.** The 150206-class failure
   talkturn-a named for link raises (raiser never gets a conversation
   seat) is alive for person-bonds on this band (nikolai_volkov, 7
   stagings, 0 answers on 170205 armed; 5/8 armed seeds answer no bond
   ask at all). The pending-raise signal in the target picker should
   cover bond asks as well as link asks, or the two ask types need
   separate seating.
4. **The counter band never fired.** 33 answered raises: 31 formed, 2
   declined, 0 counters. Either the 35–54 band is unreachable once
   standing/opinion/knowledge are high enough to get an answer at all,
   or it fires in a narrower climb window than this band reaches. A
   future measurement should check judgeLink score distribution on
   answered raises before anyone tunes the band.
5. **The foreign-polity rumor channel.** Foreign 4-realms form on 4/8
   seeds and Haven hears nothing about them in the captured say lines.
   Verify against the raw say stream, then decide whether the BELONG
   road's precondition is learnable at all in play.

## Findings for the coordinator

- **DIPLOMACY FIRST NUMBERS — GO (instrument validity).** Control:
  1 ladder link/seed, 0 second links, 0 polities, 153/156 raises expired.
  Armed: 38 links (31 propose + 7 ladder), 7/8 polities, 31 raises
  accepted→formed, 2 accepted→declined, 0 counters, 0 peer links.
  Reconciliation 246/246 link + 162/162 person; neutrality 8/8 + 8/8;
  instrument errors 0. (This arm.)
- **THE FIRST COURT SITS UNANSWERED 40–86 DAYS — NATIONAL 0/8 BECAUSE
  THE BEAT IS NEVER ANSWERED.** pendingNational (LEAD) stages on 7/8
  armed seeds and is still pending at run end. answerNationalChoice is
  called only from UI buttons; no engine code answers it; the
  answermail drive does not cover national beats. (This arm; probe
  /tmp/accord-probe.js for the accord half.)
- **THE FIRST GESTURE SITS UNANSWERED 26–140 DAYS.** answerAccord called
  0 times in 24 runs; the only engine caller is behind ANSWERMAIL_DRIVE=1
  (off by default). Proven by probe: drive runs 40/40 days, accord sits
  on an active link 26 days, 0 calls. (This arm.)
- **WILD ALLY-JOIN RULED OUT AS A DISTINCT ENGINE PATH.** No code path
  by which a wild villager/village spontaneously joins Haven outside
  link formation, person bonds, the scholar joining another village, and
  the finale march call. The phrase maps onto LINK-JOIN. (This arm;
  prereg definition.)
- **TENDLINK IS THE ONLY DIPLOMACY VERB EVER CALLED — 108 TIMES, ARMED
  ONLY.** Engine win-plan tick (trust < 50, weekly, ≥2 primary links,
  pantry ≥ 3 days), 1,500 kcal each; control gets 0 because it holds
  exactly 1 link. All other verbs 0 on both legs. (This arm.)
- **PERSON-BONDS DECIDE BY CHARACTER WITHOUT CONVERSATION; THE SCHOLAR
  NEVER ANSWERS THEM WITHOUT ONE.** NPC↔NPC: accepted 35 / refused 42
  band-wide at chances 5–95. Scholar-targeted: control 0/42 accepted,
  armed 6/43 (on 3 seeds only). (This arm.)
- **FOREIGN 4-REALMS FORM ON 4/8 SEEDS; HAVEN HEARS NOTHING.** No
  foreign-polity rumor line in the say corpus on either leg. BELONG
  precondition exists off-screen; learnability unverified. (This arm.)
- **WALL: POLITY 7/8, NATIONAL/TABLE/WINS STILL 0.** Armed wins 0/8,
  national 0/8, table 0/8; wave-5 8/8 vs 3/8; polities 7/8 vs 0/8;
  median survival 150 vs 137. (This arm.)
- **METHOD FINDING: PERSON-BOND RECONCILIATION MUST NOT MATCH BY
  TARGET.** Staging names the scholar-then; decision names the
  scholar-now; succession changes the id. Match by initiator +
  scholar-at-the-time. (This arm; analyzer fixed + regression test.)

## Proof and landing

- Prereg: `evidence/2026-11-10/sim-diplo-a-prereg.md` (commits 70955b0ac,
  a321397b0, 940c45b23).
- Instrument + driver + analyzer + proof:
  `scripts/diplo-instrument-20261110.js`,
  `scripts/diplo-driver-20261110.js`,
  `scripts/diplo-analyze-20261110.js`,
  `scripts/test-diplo-a.js` — proof 17/17 PASS (commit 9929690a1, plus
  the analyzer fix + regression test, to be committed with this evidence).
  Reuses `scripts/secondlink-instrument-20261110.js`,
  `scripts/secondlink-analyze-20261110.js`, and the talkturn talk
  recorder (`scripts/talkturn-driver-20261110.js` `createTalkRecorder`)
  unchanged.
- Corpus: `evidence/2026-11-10/perseed-diplo-a/` (24 files: 8 control +
  8 armed + 8 neutral), summary
  `evidence/2026-11-10/diplo-summary-diplo-pilot.json`.
- Logs: `/tmp/diplo-pilot-control.log`, `/tmp/diplo-pilot-armed.log`,
  `/tmp/diplo-pilot-neutral.log`, `/tmp/diplo-analyze2.log`
  (worktree-external scratch — not committed).
- Probe script (`/tmp/accord-probe.js`) is a scratch diagnostic, not
  committed: the accord finding is quoted in this evidence, and the
  judged corpus carries the numbers.
- Zero src/js changed. Base at spawn e5c19e54e. Master moved during the run
  (sibling arm sim-spawncensus-a landed 00cc52780 on the SAME band
  170201–170208 in the same run window — the band was verified fresh at
  prereg time; the sibling's concurrent reuse does not contaminate this
  measurement, which reads its own corpus from its own driver runs, but
  the band is no longer uniquely fresh). Branch rebased onto explicit
  master 00cc52780 before the final commit; proof re-run green 17/17
  after the rebase. Commits to be merged locally by the coordinator;
  report 'committed in worktree, pending coordinator merge'.
