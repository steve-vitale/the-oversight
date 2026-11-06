# journey-deepening r108 — run note (lane A, leg 2 DEEPENING)

**Run id:** laneA-deepening-2026-11-06T1104Z (lock 2026-11-06T11:04:04Z).
No prior lock existed, so no stale-lock recovery; main tree clean,
disk 21%. Base master@cc4345e1e at worktree creation (master moved
8ee4aed6e -> cc4345e1e, journey endgame r144 closeout, during this run's
pre-flight). Rotation read 2 -> deepening; 2->3 written at closeout with
verified write + retry. Prereg:
evidence/2026-11-06/journey-deepening-r108-prereg.md (committed
2a00891df BEFORE any scored seed ran; proof test 13/13 — 11 pre-panel
+ 2 post-panel evidence-preference checks, see below). Seeds fresh
**92901–92904**, competent policy (r105 driver lineage VERBATIM —
CONVO_DAYS [45, 60, 80], DAYCAP=100, death-aware stop). Smoke seed
92900 x DAYCAP=45 proved the harness (survived day 45, wave 3, pop 9/9,
0 mislabels); smoke outputs deleted per the prereg. Heartbeats:
registration ~11:15Z, 600s loop throughout. Safe-commit index clobber
hit once (4 files staged-as-deleted after the private-index commit);
repaired per the 2026-10-23 lesson (update-index --add --cacheinfo from
HEAD blobs; status clean, diff HEAD empty, all hashes match).

## Panel verdicts (pre-registered, no re-scoring)

- **SURV-CONTROL-2 (primary): 3/4 survived — the funnel did not move
  on the new base.** 92901, 92902, 92904 survived to day 101, wave 4;
  92903 lost day 77, wave 4. r107 was 2/4 on the old base; 3/4 vs 2/4
  on n=4 is variance, not movement — no claim either way. The
  pocket_sand flee-order fix, raid-cooldown, staged-ally, and linkseek
  landings did not move the funnel. Cause split (descriptive): deaths
  are fight-heavy on every seed — villager combat + combat dominate
  (92901: 22+8/38, 92902: 33+10/58, 92903: 27+22/71, 92904: 33+13/69).
  Starvation 0 deaths in the whole panel (r107: 1). Fights total 56
  (r107: 52, r106: 64, r105: 63). Standing max 155/100/140/150. All
  seeds reached wave 4; none reached wave 5. Meat channel alive on all
  seeds (kills 19/25/28/33, tests 3/3/13/11, reveals 3/3/13/11,
  dinners 2/4/14/9).
- **P-KEEP-REVISED (secondary): NAMED 2/4 revisited-alive — PRESENT
  under the revised rule, and both NAMEDs are genuine on content.**
  - Colin (92901 day 45 -> 60): the day-60 repay sitting names the
    promise twice over — "You came through on the sickness I'm
    fighting. I won't forget it." Genuine.
  - Aubrey (92904 day 45 -> 60): "You said you'd help with the
    sickness I'm fighting. ...It's done now. Forget it." Genuine.
  - The two SILENT threads are genuinely silent on content: Oliver
    (92902 day 60 -> 80) sits down to grieve ("We gave them a good
    burial...") and never touches the day-60 food promise; Chloe
    (92903 day 45 -> 60) re-asks the same food favor ("the need
    hasn't gone anywhere. I'm still asking.") without naming the
    promise as a debt — see metric review for the re-ask proposal.
  - **Old-rule continuity: 0 Maeve-class over-counts this panel.** No
    want-only structural hit scored SILENT under the revised rule, so
    the revision changed no verdict — the Maeve case that motivated
    it was not reproduced on fresh seeds. The revision stands as
    adopted.
- **D-THING (carried): pocketed=4, testable=1, mentioned=1 (of
  testable: 1) — the fix fires in the wild a second time.** Colin
  (92901 day 60 -> 80): day-60 trap-line invitation declined ("Another
  time, then." A small thing, pocketed.); the day-80 sitting opens on
  the `pocketed` want — "Come here — Still carrying that small thing
  from last time." — the player says "No rush.", he pats the pocket
  anyway. The other three pocketed threads are last-sitting cases
  (untestable, reported as unmeasurable, not as zeros).
- **RAJ-PHOTO (watch): plants=1, testable=0 — the pattern reproduces
  but is again untestable.** Pavel (92902 day 45): "Can I tell you
  something? I stole medicine from the stash once and never confessed."
  — decline, pocketed, teaching follows, the confession never returns
  in the sitting, and no later sitting with Pavel exists (his day-60
  revisit was blocked). Same shape as Raj's photo: a real thread
  planted and abandoned. The watch question (should a declined
  invitation preserve the sitting's want thread?) stays open — still
  no testable case.
- **V-INIT-BOND (carried): 0 across the whole panel — blank stands.**
  0 of 22 sittings contain an NPC-initiated bond proposal.
  Player-side invite options offered in 10/22, betrayal invitations
  in 9/22. build-bond-initiate is still NOT merged (branch exists,
  no merge commit). The blank still needs a system.
- **G-SENSE (carried): 0 senseless sittings.** All 22 transcripts
  read in full — see people check.
- **B-SIT (carried): 9 betrayal sittings** (5 accept / 4 decline /
  0 unanswered). **B-FOLLOW: 3 follow-up sittings**, 1 with a new
  betrayal. **B-LEAD (descriptive): 3 lead-ins** (back after r107's
  0) — "Come get air with me" twice, "Come see what I found" once.
  Blocked-agreement clean (badBlocked=0, badRevisit=0 on all seeds).
- **S-TRACE (carried): EXPLAINED 4/4.** G-mismatch 1 (92904 day 80
  Ella party_up/HAVEN_CHORE — descriptive, goal question closed).
  G-STICK: 92901 stuck 5/7, 92902 stuck 2/2, 92904 stuck 2/2.
  G-LINES: food_security dominates (254/293, 197/236, 209/283,
  205/270); party_up strong (39, 39, 73, 65); bonds 0, knowledge 0,
  build_standing 0, gear_up 0/0/1/0. G-STALE: 6 items (idle/done
  carrying safety/party_up) — reported, not counted as defects per
  the analyzer's framing. K-CONTEXT lessons 30/30, 43/60, 21/44,
  35/51; bot proposed a link on all 4 seeds (propose=1 linked, 1
  linked, 1 linked, 2 linked); diplomacy 0 everywhere, as in
  r102–r107; mislabels 0.

## Village assessment, in plain words

Three villages out of four made it through the deepening window this
time, and the fourth died fighting at wave 4 — same funnel as the last
two runs, a little luckier on the dice. The talking stays the bright
half: Colin looked the player in the eye twenty days after being turned
down and named the small thing he pocketed, and Aubrey pressed an
oiled tool into the player's hand to repay a sickness the player had
promised to help with — then filed the unpaid debt away when the player
waved it off. The villages still barely link — one seasoned link each,
one broken — and their people still mostly ask for the same things
(food, water, hands) rather than each other. One village's dead got a
good burial and the living sat with it; another's paramedic confessed
to stealing medicine and was never asked about it again.

- **92901 (survived, day 101, wave 4, regional, standing max 155):**
  the steady village — pop 6/6 at the end, one seasoned link
  (village_0, age 75, trust 46). Colin's pocketed-thing return and
  Hattie's gossip ("DeShawn's been polishing that story... from
  Vancouver, Canada. Keep my name out of it.") are the panel's
  warmest beats. Lessons 30/30 — the best-taught village of the
  panel.
- **92902 (survived, day 101, wave 4, regional, standing max 100):**
  pop 6/6, one seasoned link (age 71, trust 44). Pavel's stolen-
  medicine confession, Daniyar's "Have you ever hurt someone?" and
  Oliver's stockpile gift (+4 wood, +4 fiber) live here. Lessons
  43/60.
- **92903 (lost, day 77, wave 4):** 71 death records in 77 days,
  mostly villager combat (27) and combat (22), expeditions 11, wild 9.
  Standing max 140 with a seasoned link (age 45, trust 47) — the
  village was regionally connected and still ground down. Chloe's
  ridge-walk scare (fresh tracks — big — "We go back now. Quietly.")
  is the panel's sharpest beat. Lessons 21/44.
- **92904 (survived, day 101, wave 4, regional, standing max 150):**
  pop 7/7, two links (one broken age 75, one active age 21). Aubrey's
  repay sitting (the tool pressed into the hand, filed away unpaid)
  and Oliver's "would you stay close tonight? I don't want to be
  alone when it gets dark" live here. Lessons 35/51. One fight ran
  127 rounds (Buffering, day 71, won, player at 12 HP) — see watch
  items.

## People check (all 22 transcripts read)

G-SENSE 0 senseless. Notes, not defects:

- **Hattie (92901, ESL teacher, warm):** day 45 betrayal accept to
  the hollow, food promise, gossip about Victor and DeShawn's
  polished story from Vancouver. SENSE.
- **Colin (92901, emergency dispatcher, warm):** day 45 a food ask
  ("achy and wrung out, barely keeping food down"), promised; day 60
  the repay sitting — "I think we're an experiment someone forgot to
  label" (a musing, not a promise-naming) AND the genuine "You came
  through on the sickness I'm fighting"; trap-line invitation
  declined, pocketed; day 80 THE pocketed sitting ("Still carrying
  that small thing from last time"). SENSE — the fix firing, and the
  evidence-pointer fix below exists because this sitting proved the
  first regex hit can be the wrong line.
- **Meera (92901, zookeeper, withdrawn):** day 45 seek_taken — "About
  what happened to my taken kin — Have you heard anything? About the
  taken. The pods. Anything at all." — promised to ask. "Even asking
  is more than the silence." SENSE.
- **Ilya (92901, librarian, anxious):** day 80 a water ask (8 liters,
  first light, the creek), betrayal accept to the ridge, gossip
  ("Victor won Pantry Raid on the cameras"). SENSE.
- **Pavel (92902, bush pilot, dry):** day 45 the stolen-medicine
  confession, declined, pocketed, then four plants taught (Ghost Pipe,
  Ginseng, Mayapple, Elderberry). The confession is planted and never
  owed. SENSE as a conversation; the plant is abandoned (watch item).
- **Daniyar (92902, paramedic, gentle):** day 60 "Have you ever hurt
  someone? Since all this started." — player answers yes, thanked
  for it; day 80 opens "You told me yes, once. No details. I haven't
  forgotten. I just don't ask." — a real thread return, not a promise
  thread. SENSE.
- **Oliver (92902, veterinarian, dry):** day 60 a stockpile gift
  ("Take half. You've got the hands for it." +4 wood, +4 fiber) and a
  forage ask, promised; day 80 a burial mourning sitting ("We gave
  them a good burial. Doesn't feel like enough, does it?") — "I used
  to be a veterinarian who worried about being on time. Now I worry
  about being alive. Same worry, bigger font." The day-60 promise is
  never named here — genuinely SILENT, and the sitting is better for
  being about grief. SENSE.
- **Chloe (92903, truck driver, fidgety):** day 45 a cut-cleaning ask,
  promised, betrayal accept, ridge walk cut short by fresh tracks;
  day 60 the same food favor re-asked ("the need hasn't gone
  anywhere. I'm still asking."), promised again, trap-line invitation
  declined, pocketed. SENSE — the re-ask pattern, see metric review.
- **Monique (92904, night security guard, bold):** day 45 a pantry-run
  re-ask, committed, then the honest deferral — "Wait — I'm out on
  the road. I can't ask you to meet me at dawn when I'm miles away."
  SENSE.
- **Aubrey (92904, comic shop owner, earnest):** day 45 a feverish cut,
  promised; day 60 THE repay sitting — "You said you'd help with the
  sickness I'm fighting. ...It's done now. Forget it." — then "Come
  see what I found", betrayal accept, a tool pressed into the hand
  ("Here. I made an extra."), player waves it off, "Okay. Your call."
  They file it away — unpaid, and counted. SENSE.
- **Ella (92904, ESL teacher, dry):** day 60 a food ask at trust 10,
  promised. "Talking helps. Then it hurts. Then it helps again. It's
  a cycle." SENSE.
- **Nina (92904, mechanic, dry):** day 60 a food ask, promised.
  SENSE.
- **Oliver (92904, veterinarian, dry):** day 80 "It's quiet today.
  Wrong kind of quiet." — mourning, "would you stay close tonight? I
  don't want to be alone when it gets dark" — then the same honest
  road deferral as Monique's. SENSE.
- **Sanne (92904, vintner, dry):** day 80 a food ask, promised.
  SENSE.
- **Arthur (92904, army medic, bold) / Tashi (92904, arborist,
  steady):** language-barrier sittings (Portuguese / Hindi only) —
  "No shared words at all — just eyes, hands, and patience." SENSE,
  handled honestly.
- Flat notes, stated not hidden: the stock promise-accept line
  ("Thank you. I won't forget who fed me when it mattered.") fires
  after nearly every food promise in the panel (Hattie, Colin, Chloe,
  Aubrey, Ella, Nina, Sanne) — fourth panel running; same class as
  r106/r107's "goon" mood lines. The "I trade in what I know" goon
  line fires twice (Hattie, Ella).

## The blanks this run fills

1. **SURV-CONTROL-2 answers the new-base question: 3/4 survived —
   the funnel did not move.** The r105 driver on the current base
   (flee-order fix, raid-cooldown, staged-ally, linkseek) gives the
   same shape as r105/r107. No bisect is owed.
2. **P-KEEP-REVISED adopted and proven on fresh seeds.** The revised
   rule (repay-opener line required) holds: both NAMEDs are genuine,
   both SILENTs are genuinely silent, 0 old-rule over-counts. The
   revision is now the standing rule.
3. **P-KEEP evidence-pointer defect found and fixed post-panel:** the
   analyzer cited the first regex hit as the NAMED evidence, and
   Colin's day-60 sitting proved that can be the wrong line ("an
   experiment someone forgot to label" contains "forgot" but names no
   promise; the sitting genuinely names it later). The analyzer now
   prefers a repay-opener line as the NAMED evidence, falling back to
   the first regex hit. Proof test 13/13 (11 pre-panel + 2 new).
   Classification unchanged; only the cited line moves. Disclosed as
   post-panel, not pre-registered.
4. **D-THING second wild confirmation.** The pocketed thing comes
   back again (Colin d60 -> 80), 15 days after the decline, named
   exactly once.
5. **RAJ-PHOTO pattern reproduces (Pavel's confession) but stays
   untestable** — the watch question remains open with still no
   testable case.
6. **V-INIT-BOND blank re-confirmed on fresh seeds:** 0/22, same
   mechanism (UI-only propose functions). Still needs a system.

## Watch items (not metrics, not fixes)

- **"routed" fight result when the monster is dead (92903, Ad Break,
  day 44):** monster HP -1, result 'routed', two villagers fled. The
  result vocabulary seems to describe the party routing (leaving the
  field) regardless of the monster's fate — if so, win counts
  undercount kills. One fight, one seed: a labeling question for the
  fight telemetry, not a gameplay defect, not a fix.
- **127-round Buffering fight (92904, day 71, won, player at 12
  HP):** the afterimage mechanic makes most strikes miss, so the
  fight drags past two hours of game time. Feel note, not a defect —
  the fight was won and the mechanic worked as designed.
- **Stock promise-accept line, fourth panel running** (see people
  check). Same class as r106/r107 — a fix follows only if it is a
  clear ledger defect with a proof test.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
hidden_files/telemetry-baselines/deepening.json, metrics w3fights,
engaged.w3, fightsTotal, fightsByWave.3, current = fresh 929xx
4-seed panel: **quiet (4 files, 4 metrics, no large deviations).**
Fights total 56 (baseline 60). No LOUD lines, no investigation, no
baseline roll.

## Metric review

- **P-KEEP's revised rule held on fresh seeds, and the evidence
  pointer is now honest.** The revision (r107 proposal, adopted this
  run) changed no verdict this panel (0 old-rule over-counts), and
  the post-panel evidence-preference fix makes the cited line the
  line that names the promise. The revision is the standing rule.
- **RE-ASK proposal for the NEXT run (not this one).** Chloe's day-60
  sitting re-opens the same favor ("About the food I needed — the
  need hasn't gone anywhere. I'm still asking.") without naming the
  promise as a debt. The current metric scores that SILENT, but the
  thread is neither named nor forgotten — it is re-opened. Proposed:
  a RE-ASK class for a later sitting whose opener re-states the same
  favor's need (the favor short re-appears in a THEM line while the
  favor is still open), reported as thread continuity alongside
  NAMED/SILENT. This panel is NOT re-scored: Chloe stays SILENT.
- **RAJ-PHOTO still has no testable case.** Two panels, two plants,
  both last-sitting cases. The watch needs a panel where a curious
  plant is followed by a later sitting with the same villager; until
  then the design question stays open.
- **No pre-registered metric was re-scored mid-run.** SURV-CONTROL-2
  is judged exactly as pre-registered (3/4 → funnel unchanged). The
  P-KEEP evidence fix is an instrument correction disclosed here,
  not a re-score: the analyzer's numbers stand in the analysis log,
  and the run note records what the content actually shows.

## Harness

scripts/journey-deepening-r108-20261106.js (r105 lineage: only
output filenames, header, seed band 92901–92904, EVIDIR date, and
the policy id — CONVO_DAYS [45, 60, 80] verbatim, same policy
wraps, same sitting mechanics), scripts/analyze-journey-deepening-r108-20261106.js
(r107 lineage + P-KEEP revised rule + RAJ-PHOTO scan + post-panel
NAMED-evidence preference), scripts/test-journey-deepening-r108-pkeep-20261106.js
(13 checks: 7 P-KEEP classification + REPAY_OPENER grounding + 4
RAJ-PHOTO + 2 evidence-preference).

## Closeout (filled after the check gate)
- check.js --quick: 281 passed, 9 failed in 1286s (log goal
  hidden_files/journey-deepening-r108-checkquick-20261106.log). All 9
  adjudicated, none new: 6 standing pre-existing (same as r107's 6 —
  proof-update, workflow freshness, mobile-combat-cadence,
  occupation-panels, phone-frame-proof stale receipt,
  establishment-r20-fixes racks-full) + 3 load-flaky (capable-bot 120s
  timeout — passed r107, failed the 278/12 run before; trust-observer-
  neutrality 120s timeout — failed r106, passed r107, fails again;
  measurement-cache-flags failed in-gate but passes standalone 4/4 in
  47s). No failure touches betrayal.js / convo-wants.js / conversation
  code or the r108 tooling. The measurement-proof staleness predates
  this run (r107 failed the same two tests with zero game changes) and
  its refresh needs a fresh real neutral panel — a separate
  balance-maintenance job, flagged for the main session, not this run.
- Proof test re-run green after the rebase (13/13).
- Merged locally, pending ship (no bump/push/live-verify — ship loop
  owns those).
- Rotation 2 -> 3 written at closeout, verified by read-back.
