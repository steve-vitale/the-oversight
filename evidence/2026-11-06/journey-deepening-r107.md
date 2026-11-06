# journey-deepening r107 — run note (lane A, leg 2 DEEPENING)

**Run id:** laneA-deepening-2026-11-06T0545Z (lock 2026-11-06T05:44:55Z).
No prior lock existed, so no stale-lock recovery; main tree clean,
disk 25%. Base master@792ab8814 at worktree creation. Rotation read 2
-> deepening; 2->3 written at closeout with verified write + retry.
Prereg: evidence/2026-11-06/journey-deepening-r107-prereg.md (written
BEFORE any seed ran; freshness section completed BEFORE the panel ran).
Seeds fresh **92601–92604**, competent policy (r105 driver lineage
VERBATIM — CONVO_DAYS [45, 60, 80], DAYCAP=100, death-aware stop).
Smoke seed 92600 x DAYCAP=45 proved the harness with the fix in place
(survived day 46, wave 3, pop 8/8, 0 mislabels); smoke outputs deleted
per the prereg. Heartbeats: registration ~05:50Z, 600s loop throughout.

## Panel verdicts (pre-registered, no re-scoring)

- **SURV-CONTROL (primary): 2/4 survived — r106's 0/4 was SEED
  VARIANCE. The funnel did not move.** 92601 and 92603 survived to
  day 101, wave 4 (exactly r105's 2/4, same driver shape, same
  outcome). 92602 lost day 24 (wave 2, before the deepening window),
  92604 lost day 54 (wave 3). The 0/4 scare is closed; no bisect is
  owed. Cause split (descriptive): deaths are fight-heavy on every
  seed — combat + villager-combat dominate (92601: 54/65, 92603:
  48/61, 92604: 26/38; 92602 lost mostly to expeditions, 9/23).
  Starvation only 1 death in the whole panel (92602). Fights total
  52 (r106: 64, r105: 63) — the load is somewhat lower, same shape.
  Standing max 95/0/175/0. All seeds reached at least wave 2; the
  two survivors reached wave 4; none reached wave 5. Meat channel
  alive on all seeds (kills 33/12/28/15, tests 6/5/8/1, reveals
  6/5/8/1, dinners 6/12/18/0 — 92604 ate no monster dinner in 54
  days).
- **D-THING-FIX (secondary): the pocketed thing COMES BACK — the fix
  fired in the wild on the first panel.** D-THING PANEL: pocketed=3,
  testable=2, mentioned=1 (of testable: 1). The new denominator works:
  the untestable case is now visible instead of hidden.
  - Brianna (92603 day 45 -> 60): day-45 trap-line invitation
    declined ("Another time, then." A small thing, pocketed.); the
    day-60 sitting opens on the new `pocketed` want — "That small
    thing I pocketed — I still have it. Some other fire, maybe." —
    the player says "No rush.", she pats the pocket anyway. The
    r95 blank is filled, in the wild, 15 days after the decline.
  - Olivia (92601 day 60 -> 80): pocketed day 60, later sitting day
    80 exists but the pocketed want did NOT fire — the sitting
    opened on a live ask_favor seed ("Can we talk?"), which outranks
    pocketed by design. The flag stays unmentioned for a still-later
    sitting (none — no convo days after 80). Priority working as
    specified, not a miss.
  - Raj (92603 day 80): pocketed at the last sitting — not testable,
    reported as unmeasurable, not as a zero.
  - Proof test 17/17 (12 live-game + 5 analyzer) green, re-run green
    after the post-panel rewording below.
- **P-KEEP (carried): analyzer says PRESENT 2/3 — ON READING, NEITHER
  SITTING NAMES THE PROMISE. Honest count is 0 genuine namings.**
  - gen_2qeq7fg (92603 day 45 -> 60): scored NAMED by the old regex
    on the pocketed deflectBeat "Right. Forget it." — my own new line
    collided with the P-KEEP regex. The promise was never named; the
    sitting was about the pocketed thing. FALSE POSITIVE, fixed
    post-panel (see below).
  - gen_imz2ipr (92603 day 45 -> 60): scored NAMED-STRUCTURAL because
    the want line is `repay` — but the sitting never names the
    promise either: it opens on a gossip line ("I know who took the
    extra rations but won't say."), walks to the thinking place,
    teaches three plants, and ends "unestablished". The repay want
    was selected but never surfaced. STRUCTURAL OVER-COUNT — see
    metric review for the proposed revision.
  - The third revisited-alive thread (Olivia 92601 day 60 -> 80) is
    SILENT: the day-80 sitting opens on a live seed and never names
    the day-60 food promise. The question-first/seed-priority halves
    of the coverage bound, again.
  - No verdict is taken on P-KEEP here (carried, question closed in
    r106) — but the panel's PRESENT must not be cited: it is 0/3 on
    the content.
- **V-INIT-BOND (carried): 0 across the whole panel — blank stands.**
  0 of 17 sittings contain an NPC-initiated bond proposal.
  Player-side invite options offered in 9/17, betrayal invitations
  in 7/17. build-bond-initiate is still NOT merged (branch exists,
  no merge commit). The blank still needs a system.
- **G-SENSE (carried): 0 senseless sittings.** All 17 transcripts
  read in full — see people check.
- **B-SIT (carried): 7 betrayal sittings** (4 accept / 3 decline /
  0 unanswered). **B-FOLLOW: 3 follow-up sittings**, 1 with a new
  betrayal. **B-LEAD (descriptive): 0 lead-ins** — the three
  lead-in phrases ("Walk with me?", "Come get air with me", "Come
  see what I found") fired not once in 17 sittings (r106: 6);
  invitations still arrived via the "Can we talk?" opener and the
  goon → invite path. The lead-in regex is narrow; descriptive only.
  Blocked-agreement clean (badBlocked=0, badRevisit=0 on all seeds).
- **S-TRACE (carried): EXPLAINED 3/4, NO-REGIONAL-DAYS 1/4**
  (92602 lost day 24, before the deepening window). G-mismatch 0
  on every seed and day (the r102 fix holds). G-STICK: 92601 stuck
  3/5, 92603 stuck 4/4 (same shape as prior runs), 92602/92604 n/a
  (0/1 snaps). G-LINES: food_security dominates (131/197, 49/57,
  254/327, 63/76); party_up strong (65, 6, 72, 13); bonds 0,
  knowledge 0, build_standing 0, gear_up 1/2/1/0. G-STALE: 6 items
  (idle/done carrying safety/party_up) — reported, not counted as
  defects per the analyzer's framing. K-CONTEXT lessons 54/65,
  15/17, 21/65, 31/38; bot proposed a link on 3 of 4 seeds
  (propose=1 linked, 2 linked+counter); diplomacy 0 everywhere, as
  in r102–r106; mislabels 0.

## Village assessment, in plain words

The funnel is where r105 left it: half the villages make it through
the deepening window, half don't, and the ones that die die fighting.
The talking is still the bright half. One villager, Brianna, looked
the player in the eye fifteen days after being turned down and named
the small thing she pocketed — the first time that thread has ever
come back. The villages still barely link — one link each, none
seasoned — and their people still mostly ask for the same things
(food, water, hands) rather than each other.

- **92601 (survived, day 101, wave 4, regional, standing max 95):**
  the steady village — pop 9/9 at the end, one link (village_0, age
  61, trust 34, unseasoned). Olivia's buried bundle (+1073 kcal) and
  her "we got it handled" line are the panel's warmest beat; her
  pocketed thing waits behind a live seed and never gets its turn.
  Lessons 54/65 — the best-taught village of the panel.
- **92602 (lost, day 24, wave 2):** gone before the window opened —
  23 death records in 24 days, mostly expeditions (9) and villager
  combat (8), one starvation. No sittings at all. Same shape as
  r105's 92203 and r106's 92404: the early grind eats a village
  before deepening can start.
- **92603 (survived, day 101, wave 4, regional, standing max 175):**
  the richest village — 18 monster-meat dinners, two links (one
  broken, one active age 8). Brianna's pocketed-thing return and
  Maeve's repay sitting that never names the promise both live here.
  Lessons 21/65 — it knew the least of the survivors and lasted
  the longest.
- **92604 (lost, day 54, wave 3):** pop 0 at the end — the village
  ground down to nobody, with a standing max of 0 and one link
  (age 25, trust 42). One monster-meat test, no dinners. Its two
  day-45 sittings (Elena's unsent letters, Sanne's German-only
  silence) are among the panel's best writing.

## People check (all 17 transcripts read)

G-SENSE 0 senseless. Notes, not defects:

- **Elena (92601, baker, warm):** day 45 betrayal accept to her
  thinking place ("Don't tell the others. Everyone needs one
  place."), then the five-pick "Tell me more" aphorism chain —
  driver repetition, not a game defect (same pattern as r106).
  Day 60 a food re-ask, promised. SENSE.
- **Farid (92601, locksmith, cautious):** day-45 curiosity — the
  Dhaka dream ("I'm walking home and the street keeps getting
  longer. I wake up tired, like I actually walked it."). SENSE.
- **Ursula (92601, mortician, gentle):** day 45 a wound she can't
  clean one-handed, promised, with the need resolving off-screen
  later ("Never mind the creek water run — we got it handled.").
  SENSE.
- **Olivia (92601, social worker, warm):** day 60 a food ask at
  trust 23 ("do you have anything to eat? Anything at all?"),
  promised, betrayal decline, pocketed thing; day 80 a live-seed
  sitting that opens "Can we talk? ... Like people used to." and
  digs up a buried bundle (+1073 kcal). The pocketed thing waits
  behind the seed — priority working as designed. SENSE.
- **Sofia (92601, community gardener, cautious):** day 60 a
  fromSeed ask ("I've been running the numbers in my head. I
  don't love the numbers. But I see a path."), promised. SENSE.
- **Brianna (92603, pharmacist, anxious):** day 45 a food promise
  ("My hands shake when I try to work.") + trap-line invitation
  declined, pocketed; day 60 THE pocketed sitting ("That small
  thing I pocketed — I still have it. Some other fire, maybe.").
  SENSE — the fix firing, and a person grieving after.
- **Maeve (92603, vintner, cautious):** day 45 a food promise;
  day 60 a repay sitting that never names the promise — gossip
  opener, thinking-place walk, three plants taught (Wild
  Strawberry, Sassafras, Wild Onion), ends "unestablished". The
  sitting is readable; the repay want just never surfaces. SENSE
  as a conversation, a structural false positive as a P-KEEP hit.
- **Omar (92603, piano tuner, dry):** day 60 "Can we talk? ...
  Like people used to." then a food ask, promised; closing "Do
  try to stay alive. The paperwork otherwise is murder." SENSE.
- **Dmitri (92603, appliance repair, dry):** day 80 a food ask,
  promised; closing "Well. That was almost a conversation. We're
  improving." SENSE.
- **Taisia (92603, veterinarian, dry):** day 80 seek_taken —
  "You talk to it — the System. Have you ever asked? About the
  taken — about Gavriil?" — promised, "Even asking is more than
  the silence." SENSE.
- **Raj (92603, pharmacist, cautious):** day 80 a curious opening
  — "I'm keeping a photo of someone I left behind. I haven't told
  anyone." — then a decline, pocketed, and the sitting goes flat:
  "...Sorry, lost my train of thought." The photo thread is
  planted and never owed: the decline kills the curious thread and
  nothing comes back to the photo. Not senseless — the beats are
  readable — but the plant is abandoned. Noted for the next run,
  not fixed here.
- **Elena (92604, baker, warm):** day 45 "I've been writing
  letters I'll never send. I'm ashamed and I can't stop." + a
  quiet ridge walk + four plants taught. The ask_favor want never
  surfaces an ask (resolution "stated") — the sitting is all
  teaching. SENSE.
- **Sanne (92604, vintner, dry):** speaks only German — "No
  shared words at all — just eyes, hands, and patience." The
  language barrier beat, handled honestly. SENSE.
- Flat notes, stated not hidden: the stock promise-accept line
  ("Thank you. I won't forget who fed me when it mattered.")
  fires after nearly every food promise in the panel (Brianna,
  Maeve, Omar, Dmitri, Olivia, Sofia) — third panel running; the
  same class as r106's "goon" mood lines. The "You won The Box /
  The Moot" gossip did not fire this panel; the near-duplicate
  watch item (r105 Donna) is not reproduced.

## The blanks this run fills

1. **SURV-CONTROL answers r106's open flag: 2/4 survived — the
   funnel did not move.** The r105 driver on the current base gives
   r105's exact result (2/4, both to day 101, wave 4). No bisect
   is owed; the 0/4 scare is closed as seed variance.
2. **D-THING is CLOSED as a blank.** The pocketed thing comes back:
   recorded on decline, named 15 days later in a real sitting,
   mentioned exactly once, outranked by live seeds and by repay
   exactly as pre-registered. The new denominator (testable only
   with a later sitting) makes the one untestable case visible
   instead of hidden.
3. **Harness fix (driver-only, no sim change): the r107 driver now
   `mkdir -p`s EVIDIR.** The smoke run died ENOENT on the first
   write because 2026-11-06 did not exist yet (r105/r106 inherited
   a live dir). One line, disclosed; the control comparison is
   unaffected.
4. **P-KEEP collision found and fixed post-panel:** the new
   pocketed deflectBeat ("Right. Forget it.") and staleOpener
   ("I keep turning it over") both carried P-KEEP regex words and
   would score false NAMEDs in later panels. Reworded ("Right.
   Never mind." / "it stays with me"), all seven pocketed lines
   re-checked against both regexes (0 collisions), proof test
   re-run green 17/17. Disclosed as post-panel, not pre-registered.
5. **V-INIT-BOND blank re-confirmed on fresh seeds:** 0/17, same
   mechanism (UI-only propose functions). Still needs a system.
6. **r102 fix confirmation (carried):** goal mismatch 0 on all
   fresh seeds/days — the stale-goal-line reset holds on the live
   code.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
hidden_files/telemetry-baselines/deepening.json, metrics w3fights,
engaged.w3, fightsTotal, fightsByWave.3, current = fresh 926xx
4-seed panel: **quiet (4 files, 4 metrics, no large deviations).**
Sums: fightsTotal 52 (baseline 60), w3fights 17 (baseline 18),
engagedW3 17 (baseline 23). No LOUD lines, no investigation, no
baseline roll.

## Metric review

- **P-KEEP's structural rule over-counts — proposed revision for
  the NEXT run (not this one).** NAMED-STRUCTURAL currently counts
  any later sitting whose `want: ` line is `repay`. Maeve's day-60
  sitting proves the want can be selected without the promise ever
  surfacing (gossip opener, thinking-place walk, teaching). The
  revision: NAMED-STRUCTURAL requires a repay-opener line in the
  THEM lines (one of "You came through on", "You said you'd help
  with", "About {short} — have you had a chance", or the legacy
  "I've been thinking about what you promised"), not just the want
  line. Same class as the r104 Ruth finding that motivated the
  revised metric. This panel is NOT re-scored: it reports 2/3
  analyzer-PRESENT and 0/3 on the content, side by side.
- **The pocketed lines are now P-KEEP-clean by rule.** The
  deflect/stale collision is fixed and all seven lines re-checked
  (0 collisions). The rule is written in the code comment so the
  next want that names a thread checks itself against the regexes.
- **D-THING's new denominator worked.** 3 pocketed, 2 testable, 1
  mentioned; the 1 untestable case is reported as unmeasurable,
  not as a zero. The denominator-qualified count is the one to
  carry forward.
- **No pre-registered metric was re-scored mid-run.** SURV-CONTROL
  is judged exactly as pre-registered (2/4 → variance). The P-KEEP
  correction is a reading correction disclosed here, not a
  re-score: the analyzer's numbers stand in the analysis log, and
  the run note records what the content actually shows.
- **Raj's photo thread is a watch item, not a metric:** a curious
  opener plants a real thread (a photo of someone left behind)
  and a decline kills it without a trace. If a later panel
  reproduces an abandoned curious plant, the question is whether
  a declined invitation should preserve the sitting's want thread
  — a design question, not a tweak.

## Harness

scripts/journey-deepening-r107-20261106.js (r105 lineage: only
output filenames, header, seed band 92601–92604, EVIDIR date, and
the EVIDIR mkdir — CONVO_DAYS [45, 60, 80] verbatim, same policy
wraps, same sitting mechanics), scripts/analyze-journey-deepening-r107-20261106.js
(r106 lineage + classifyPocketedThreads with the testable
denominator), scripts/test-journey-deepening-r107-pocketed-20261106.js
(17 checks: 12 live-game + 5 analyzer).

## Closeout (filled after the check gate)
- check.js --quick: 283 passed, 7 failed in 691s (log goal
  hidden_files/journey-deepening-r107-checkquick-20261106.log). All 7
  adjudicated, none new: 6 standing pre-existing (same as r106's 8 —
  proof-update, workflow freshness, mobile-combat-cadence,
  occupation-panels, phone-frame-proof stale receipt,
  establishment-r20-fixes racks-full; r106's 8th,
  trust-observer-neutrality 120s timeout, PASSED this run) + 1 flaky
  capable-bot (passed r106, failed the 278/12 run before — load
  roulette, not code; this run touches no combat code). No failure
  touches betrayal.js / convo-wants.js / conversation code. The
  measurement-proof staleness predates this run (r106 failed the
  same two tests with zero game changes) and its refresh needs a
  fresh real neutral panel — a separate balance-maintenance job,
  flagged for the main session, not this run. The first gate
  attempt died mid-run with no summary (process reaped ~1000s in,
  log ended mid-progress); re-ran detached with nohup to completion.
  Proof test re-run green after the rebase (17/17).
- Rebased onto master abc4df164 (sim-spandraw-census-a landed while
  the gate ran); proof test re-run green after the rebase (17/17).
- Merged locally, pending ship (no bump/push/live-verify — ship loop
  owns those).
- Rotation 2 -> 3 written at closeout, verified by read-back.
