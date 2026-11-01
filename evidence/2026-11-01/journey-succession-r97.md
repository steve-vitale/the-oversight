# Journey succession r97 — WEEK-1 SECOND DEATH FOUND, ANY-RECENT PROVEN INFORMATIVE, TWO VILLAGES SCATTER HUNGRY (lane B, 2026-11-01)

Leg 7 (succession). Prereg: evidence/2026-11-01/journey-succession-r97-prereg.md
(written before any driver run). Instrument only, zero src/js.
Base: master f752cb662 at worktree registration (later than r96's
merge; sibling landings continued during startup).
Seeds 29161–29166, competent policy, POST_DAYS=70, EARLY_KILL_DAY=40.
29161, 29162, 29165 chain-forced (20/20/10/10 dplus); 29163, 29164,
29166 controls. Pilot 29161–29164 EXPANDED to 6 per the pre-declared
trigger: 29161 suffered a second death inside its week-1 window
(see Q3). No other trigger fired.

Slug deviation, documented: the body slug journey2-succession is
unusable (done-merged registry entry + orphan directory on disk,
same class as r83/r87/r89/r91/r94). This run uses
journey2-succession-r97.

## Run-start collision record (the leg choice, explained)

This run first read rotation-b as 6 (crisis) and found a Lane B lock
(2026-11-01T18:57:00Z) whose worktree heartbeat (journey2-crisis-r96,
19:41:08Z) was 20+ minutes stale with no live process and a stable
note file — the body's guard rule calls that DEAD, so the lock was
deleted and a fresh lock written. That judgment was WRONG in outcome:
the r96 run was alive in closeout, not dead. It landed on master at
20:08:12Z (rebased hashes 5f205a98a + 791a1e503), advanced rotation-b
6→7, and deleted the lock file at closeout — including this run's
fresh 20:04Z lock, since closeout deletes the lane lock without
checking run_id. No work was lost and no r96 tree or branch was
touched by this run; the misjudgment cost only the lock confusion.
Adaptation, documented: this run plays leg 7 (succession, the
rotation file's current value) instead of duplicating r96's crisis
panel from one hour earlier, and its first worktree
(journey2-crisis-r97, empty, clean) was released and removed before
any play. Lesson carried: heartbeat staleness DURING closeout is
not death — re-check liveness immediately before closeout actions,
per the 2026-10-30 lesson, not just at run start. A fresh lock was
re-written at 20:14:36Z for this run.
Worktree-reap at pre-flight stalled on lock contention under
sibling load and was not waited on (7 trees listed, well under the
16 cap); non-blocking, noted, not retried into contention.

## Infrastructure

- Registration slow but clean (sibling load: Lane A scale run +
  flesh-out panels running). Heartbeat read back after
  registration (20:16:18Z) and re-beaten after every panel seed.
  No EPERM flap this run; all six seeds landed on attempt 1 with
  parse verification and zero 0-byte files.
- Proof test (r97 naming): (a)–(d) and (f) ALL PASS. (e)
  CHAIN-DETECTOR REPLAY fails 6/6 checks — STALE BASELINE, not a
  recorder failure, proven by a control run (see below). The panel
  proceeded because the detector bars are judged fresh-seed
  against game records, independent of r91's names; the (e)
  failure is carried as proof debt for the owning lane, not
  re-scored and not silently rewritten.

## PROOF (e) — stale baseline, control-proven

The replay re-runs seed 28152 expecting r91's trajectory
(Ava→Petra organic + Petra→Catalina scriptedFifth, chain 7→8,
tele deaths.bearer 8→9). On current master it produces a wholly
different trajectory (Petra→Violet→Ava→Latifa→Ivy→Dmitri,
chain 5, fifth Ivy→Dmitri, tele 6). The ORIGINAL r94 driver run on
the same seed with the same env on current master produces the
IDENTICAL divergent trajectory — so the rename is exonerated and
the cause is game drift since r94's proof (13:35Z): two
conversation-flow landings after it, journey-establishment r72
(13:45Z, favor-menu goon continuer) and journey-scale r67
(15:57Z, convoPick quote-normalized dedupe). Both shift driven
RNG consumption from the first days, so no replay of a fixed old
trajectory can pass. The recorder itself is healthy on current
master: the replay's own chain carries 5/5 entries via
playerDeath, each handoff distinct, fifth scripted+passed+lin+mo.
The same drift class is the prime suspect for r96's capable-bot
food-deed failure (see Regression suite). What the owning lane
owes: re-baseline the replay against a current-master reference
run (a measurement decision, not a mid-run assertion edit).

## Headline

The panel answers r94's open questions with fresh observations,
not fixtures. A second death inside the week-1 window HAPPENED
(29161: Asher d10, Carmine d12), and it makes any-recent
informative exactly as predicted: first-bearer naming 0/5 while
any-recent naming is 2/5, both hits mourning Carmine, the fresher
dead. No seed is silent under BOTH metrics, so there is still no
genuine silence to decompose — but the silence-explaining
machinery is no longer only a fixture result: 29161 is
first-silent and any-voiced, and the reason is visible in the
transcripts. The recorder splits nothing new this panel (no
same-iteration double handoff occurred), but every fresh handoff
routes through playerDeath with counts matching game records.
CHAIN5 carries 3/3 with 28/28 bonds and 0 affinity drift. Two
villages scatter hungry — succession does not save a starving
village, and that is the leg's plainest finding.

## DETECTOR (binding bars, all MET)

- chainDeaths count == true post-first-death transitions on 6/6
  seeds: 29161 5, 29162 5, 29163 0, 29164 0, 29165 4, 29166 0.
  Every chain entry on the fresh panel carries via=playerDeath
  (19/19). The bypass sweep fired 0 times: no bearer change
  bypassed playerDeath on this panel.
- DEATH-LEDGER: chainKnown == chainN on all six seeds
  (5/5, 5/5, 0/0, 0/0, 4/4, 0/0). Every recorded chain death
  cause-known.
- No same-iteration double handoff on any seed (all chain days
  distinct; closest pair is 29162's fifth d93 and post-fifth
  organic d95, two days apart). Q1 therefore has NO fresh split
  case this panel either — the split capability stands proven by
  mechanism (r94 replay on its own master) and by the recorder's
  clean distinct entries here, not by a fresh observation.

## WEEK1-NAMING + NAMING-ANY + MIX (Q2/Q3 answered)

| seed | dead first bearer | first-bearer | any-recent | lately+ mourning draws | mix grief/debate/other/unclass | non-verbal |
|------|-------------------|--------------|------------|------------------------|-------------------------------|------------|
| 29161 | Asher | 0/5 | 2/5 | 2 | 2/0/0/0 | 1 |
| 29162 | Gertrude | 4/5 | 4/5 | 3 | 3/0/0/0 | 0 |
| 29163 | Theo | 4/4 | 4/4 | 3 | 3/0/0/0 | 0 |
| 29164 | Sam | 3/5 | 3/5 | 2 | 2/0/0/0 | 0 |
| 29165 | Manuel | 3/5 | 3/5 | 3 | 3/0/0/0 | 0 |
| 29166 | Giuseppe | 4/4 | 4/4 | 4 | 4/0/0/0 | 0 |
| pooled | | 18/28 (64%) | 20/28 (71%) | 17 | 17/0/0/0 | 1 |

- Q3 ANSWERED: 29161's second death (Carmine d12, two days after
  Asher d10) falls inside the week-1 window, and any-recent
  exceeds first-bearer by exactly that death: both any-hits name
  Carmine ("Since Carmine died... I keep expecting to see
  Carmine at the fire"; "Carmine always took the burnt piece").
  Any-recent is informative on this panel, not equal by
  construction. r91/r94's equality reading is now bounded: it
  holds only when no week-1 second death occurs.
- Q2: no seed is silent under BOTH metrics (minimum namedAny
  2/5), so MIX-EXPLAINS again has no both-silence to decompose —
  but 29161 is the nearest thing to it (first-silent 0/5), and
  its explanation is on the record: the village grieves the
  fresher dead, and one transcript is non-verbal (Nina, Ukrainian,
  gestures only — an honest exchange, not a failed convo).
- MIX RE-DERIVATION (r94 proposal, done here): every one of the
  17 draws is grief-topic (burnt piece, fire smaller, expecting
  at the fire, favor owed, last thing said, name right yet,
  share of the work, world continues, dreamed still here,
  messes quietly, portions out loud). A phrase family re-derived
  from r97's own transcripts is the same grief set, and
  unclassified stays 0 under both families. Caveat, stated
  plainly: debate/other classes drew 0 times this panel, so the
  family is grief-complete, not class-complete — it was not
  stress-tested on debate topics it never saw.

## CHAIN5-CARRY (binding bars, all MET)

- CHAIN5-READABLE: 3/3 forced seeds with a full fifth handoff
  (relPreDeath5 + relPost5 + fifthDeath lin+mo true).
- CHAIN5-BONDS: fifth-successor bonds survived 28/28 (29161
  10/10, Yuki depth 3 v 100; 29162 8/8, Donna depth 3 v 100;
  29165 10/10, Eli depth 3 v 100), affinityDiff5 = 0 on all three.
- Fifth deaths: 29161 Liam→Yuki (d+10 since 4th, d+62 since 1st),
  29162 Donna→Onni (d+11, d+62 — the same one-day-late probe
  firing shape as r94), 29165 Kunal→Quinn (d+10, d+60, exact).
  All lin+mo true.
- INH5: 29161 Yuki: kept 28 plants + inherited 15, kept 6 skills
  + inherited 20, vanished [trail_compass, tasting_spoon].
  29162 Onni: kept 46 + inherited 1, kept 6 + inherited 21,
  vanished [knife_roll, trail_compass]. 29165 Quinn: kept 47 +
  inherited 2, kept 8 + inherited 21, vanished [home_key,
  field_suture_kit]. All class=mixed (continuation, never reset).
- Post-fifth organic interleave: 29162's Onni→Vera d95 ("a
  stranger"), two days after the scripted fifth — the chain
  keeps living past the probe, recorded distinctly, no collapse.

## SENT-VANISH (descriptive)

- Fifth handoffs vanish again, but not universally: 29161
  (trail_compass, tasting_spoon), 29162 (knife_roll,
  trail_compass), 29165 (home_key, field_suture_kit).
  trail_compass vanishes at TWO fifth handoffs — a repeat member
  of the class, not a new class.
- First-handoff scripted seed 29165: vanished contract_quill —
  the SAME item r94's scripted seed 29154 lost. The vanish is
  intermittent and item-recurring, mechanism still open.
- Earlier handoffs vanish too (2nd: reading_glasses, whetstone;
  3rd: dog_tags, mixtape, carpenters_square, mothers_ring,
  home_key, spare_socks, hard_candy, boot_stone; 4th:
  photo_album, dispatchers_headset, seed_packet,
  carpenters_square, wedding_ring, buskers_harmonica). The class
  keeps growing members; the mechanism question is unchanged.

## Carried regression bars (all PASS)

- C1v3: ok=true, missing=[] on 6/6.
- S1: missingExact=0 on 6/6.
- MG2v2: true on 6/6 (violMeal=0). Old MG2 is false on 29163
  (viol 1) and 29165 (viol 2) — the old metric, not the bar; both
  are the scattered villages, whose windows truncate (auditDays
  30 and 69), and the meal-line bar holds regardless.
- M1/M4: true on 6/6. M3v2b: 5/6 seeds ≥2 (29161 1, 29162 7,
  29163 7, 29164 6, 29165 4, 29166 6) — the expanded-panel bar
  ≥4/6 MET with margin. 29161's 1 is M3v2=2 minus excludedLoot=1,
  not a miss of the pooled bar.
- INVITE SEAM: 43/43 invite outcomes spoken (accepts and
  declines, both with reasons), 0 deflected, 0 other.
  Sibling deflection lines in transcripts: 15, all joined to
  their mechanism (TRACE-JOIN 15/15), none invite-deflected.

## VILLAGE ASSESSMENT (plain words)

Six villages, four that stand and two that scatter hungry — and
the mantle passing bends none of them to breaking; hunger does:

- 29161 (Asher→Carmine→Marta→Bruno→Ernesto→Liam→Yuki): the
  chain village that grieves the fresher dead. Six bearers in 62
  days, ends 8 alive, pantry 29,373. Its people mourn Carmine,
  dead two days after Asher, not Asher — grief follows the
  freshest loss. Yuki inherits a full life, not a blank.
- 29162 (Gertrude→Orla→Sal→Otto→Donna→Onni→Vera): the grieving
  village that keeps going past the probe. Six bearers plus a
  post-fifth organic handoff, ends 6 alive, pantry 8,340.
  Gertrude is named in 4/5 week-1 transcripts — the dream, the
  favor, the burnt piece, the portions counted out loud.
- 29163 (Theo→Aki): the village that scatters. One organic
  handoff, then the pantry empties and a raid comes in the night
  carrying off ~0 kcal — the message, not the loot, is the blow.
  Scattered d69 with 6 people alive and an empty pantry. Theo is
  named in 4/4 week-1 transcripts before the loss.
- 29164 (Sam→Karl): the steady village. One organic handoff,
  ends 9 alive, pantry 25,567. Sam is named in 3/5 week-1
  transcripts; the loudest thread is not grief but Jerome's
  dentist confession and Harold's age lie.
- 29165 (Manuel→Catalina→Tiana→Eli→Kunal→Quinn): the chain
  village that scatters on the last day. Five handoffs recorded
  fully, then the pantry empties and the village scatters d110
  with 7 alive — one day short of the window's end. Manuel is
  named in 3/5 week-1 transcripts; the hushwolf that took him
  at d41 is the scripted-first-death class, same as r94's 29154.
- 29166 (Giuseppe→Aaron): the comfortable village. One organic
  handoff, ends 11 alive, pantry 42,896. Giuseppe is named in
  4/4 week-1 transcripts, and Wanjiru's buried cache adds 1,780
  kcal to the pantry — a real state effect from a conversation.

What is missing, panel-wide: no village reaches beyond survival
in this window (no wave-5, no table — the endgame leg's window,
not this one), and the succession mechanics themselves do not
block winning: bonds 28/28, affinity 0 drift, knowledge and
skills carry across five handoffs intact, and every village that
lived ends fed. The two scattered villages sharpen r96's crisis
finding: pantry-zero alone does not kill a village that can
still eat outside it — but these two could not, and the mantle
passing did not feed them.

## PEOPLE CHECK: all 28 week-1 transcripts read in full — PASS

Every transcript satisfies the bar: the NPC wants something (a
wound cleaned, a forage outing, a trap-line walk, a sickness
seen, a confession heard, a party formed, news of taken kin, a
hauling hand); options engage or deflect it (invites accepted
with reasons or declined with reasons — Siobhan holds her "I
work alone" line twice, consistently, as character, not loop);
endings resolve, plant, or owe (wound threads resolved at d+7
with thanks; lessons recalled at d+7; taken-kin threads resumed;
parties formed with roles and names). No fabricated shared
history: callbacks reference real driven history (d+3 closes
quoted at d+7, wound threads resumed by name, "still on..."
recaps). No filler loops: repeat confrontations push back (Donna:
"I confessed that already. I'm not confessing it twice for
dramatic effect."; Eli and Scarlett: "I told you the truth. You
can keep poking it, but it's told.").

Observations (not bar failures):
- Scout duplication, 5th panel running, now with a MUTUAL case:
  Sal d+7 takes scout marked "(held by Otto)" and Otto d+7
  takes scout marked "(held by Sal)"; Eli d+7 takes scout marked
  "(held by Kunal)"; Alex d+7 re-picks scout marked "← you have
  this". The menu warns but does not gate — most plausibly a
  driver artifact (the driver always picks scout), since a human
  could pick another role. Flagged for the party system, not
  claimed as a defect; human-play evidence would settle it, and
  the mutual case is the sharpest form yet.
- The driver always picks "The Company" (party_namepick:2), so
  NPC-suggested party names (The Thornbacks ×2, The Second Try,
  The Kept Promise ×3) never stick in driven play — a driver
  artifact, not a game finding.
- Double invite lines persist ("Want to come with us?" /
  "Want to come with me?" in every invite) — the party-vs-solo
  offer, slightly robotic in transcript form. Known edge.
- Verbatim self-quotes persist as thread continuity (Sal, Harold,
  Wanjiru d+7 quoting their own d+3 closes) — real continuity,
  slightly robotic wording. Noted, not a bar failure.
- NEW: two NPCs confess the same secret template in one panel —
  Eli and Scarlett both "I'm not from Denver. I'm from Columbus,
  Ohio" (different shame clauses: "ashamed of the truth" vs
  "embarrassed. Everyone here was someone"). A shared secret
  class firing twice, not fabricated history — but noticeable,
  and worth one line for the conversation system: secrets that
  repeat verbatim across villagers in one week read templated.
- The driver's fixed origin answer ("I'm from Columbus, Ohio"
  to Jerome's origin question) is a direct answer, not an echo
  flag — Jerome remembers it plainly and moves on. Not counted
  as an echo defect.
- Real state effects from conversation: Wanjiru's buried cache
  (+1,780 kcal to the pantry), Otto's gift tool ("Here. I made
  an extra."), Tom-class stockpile gifts absent here but the
  cache/gift pattern holds.

## REACHABLE / FUN / WINNABLE

- REACHABLE: yes. Week-1 grief naming fires on 6/6 fresh seeds
  without forcing (0/5 to 4/5 first-bearer, 2/5 to 4/5 any-recent);
  the fifth handoff records fully on 3/3 forced seeds; the
  week-1 second death — the case that makes any-recent
  informative — fires on a fresh seed without forcing. The
  detector counts what actually happened, on every seed.
- FUN: yes, on the conversation evidence. Grief lines are
  specific and day-accurate (including the fresher-dead grief on
  29161); confessions push back instead of looping; parties form
  with names and roles; a buried cache and a gift tool move real
  state; a non-verbal Ukrainian exchange is warm and works. The
  robotic edges are the known ones (double invite lines,
  driver-picked party name, scout re-picks, self-quotes) plus
  the repeated Columbus secret.
- WINNABLE: not this leg's window to judge — no panel seed
  approaches the table. The succession mechanics themselves do
  not block winning: bonds 28/28, affinity 0 drift, knowledge
  and skills carry across five handoffs intact, and all four
  villages that reach the horizon end alive and fed. The two
  scattered villages scattered hungry, not mantle-broken.

## Blanks filled or documented

- FILLED (measurement): r94's week-1-second-death question is
  answered on a fresh seed — any-recent IS informative when a
  second death falls in the window, and equals first-bearer by
  construction only when it does not. MIX re-derivation from
  this panel's own transcripts confirms 0 unclassified (with
  the grief-complete caveat above).
- DOCUMENTED, not fixed (tackle-succession / party system /
  conversation owners): sentimental items still vanish at some
  handoffs but not others (contract_quill again; trail_compass
  twice at fifth handoffs; home_key, field_suture_kit,
  knife_roll, tasting_spoon new at fifth) — intermittent,
  mechanism still open; the scout-duplication question (menu
  warns, driver assigns anyway — now mutual); the double invite
  lines; the small party-name funnel (driver artifact); the
  verbatim self-quotes; the repeated Columbus secret template.
- No src/js change was in scope or made. The bypass sweep never
  fired: no evidence any bearer change bypasses playerDeath.

## Telemetry deviation check

node scripts/telemetry-check.js --baseline
.../telemetry-baselines/succession.json
--current 'evidence/2026-11-01/journey-succession-r97-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
LOUD lines (2), both VERDICT: EXPLAINED, baseline NOT rolled:
- deaths.bearer 300%: baseline 5 -> current 20 (n=6 files) — the
  forced-chain panel deliberately kills bearers up to 5 times on
  3 seeds, plus organic interleaves (29161's Carmine→Marta,
  29162's Onni→Vera) and first deaths on 3 controls; regime, not
  drift (r89/r91/r94 precedent, prereg rule: forced panel must
  not roll the unforced baseline).
- census.fallen swung 210%: baseline 10 -> current 31 — same
  cause (forced chains + organic deaths + village losses across
  6 seeds).
Quiet: census.alive, census.integrationStage,
week2.deadBearerMentions (no LOUD line). Baseline left untouched.

## Metric review (§14)

- DETECTOR / MIX-EXPLAINS / CHAIN5-READABLE / CHAIN5-BONDS /
  M3v2b / C1v3 / S1 / MG2v2 / M1 / M4 / INVITE SEAM judged as
  pre-registered. No metric was re-scored mid-run. The expansion
  trigger fired exactly as pre-declared (week-1 second death on
  29161) and the panel expanded before any verdict was drawn.
- Proof (e) is NOT re-scored: its fixed r91-trajectory
  expectation is stale after r67/r72 game drift, proven by the
  r94-driver control run. It is carried as proof debt (re-baseline
  against a current-master reference), not treated as a recorder
  failure and not edited to fit. The panel's detector bars do not
  depend on it.
- Interpretation refinements, not bar changes: (1) any-recent ==
  first-bearer holds only absent a week-1 second death — 29161
  bounds the r91/r94 reading. (2) MIX re-derivation confirms the
  grief family on this panel but leaves debate/other classes
  untested (0 draws) — future panels should say which classes
  their draws actually exercised. (3) Old MG2 (not the MG2v2 bar)
  goes false on scattered villages whose windows truncate —
  report auditDays alongside it, as here.
- Carried (unchanged): F1 favor 'no longer available' blank
  (crisis leg, stays OPEN); dead discoverer's orphaned fireside
  entry (r51, Steve's call); unfed marches proceed (r50, Steve's
  call); stare-down cost as a class (Steve's call); phoenix
  per-event cascade (Steve-call); armor causation (needs a
  control arm); telemetry mapping proposal defenderFights ->
  defendedFights (crisis leg); gating freeze (2026-10-27)
  untouched.
- NEW for the next run / for Steve: (1) the proof-(e) replay
  needs a current-master re-baseline before it can pass again —
  until then every succession run will report it red for a
  drift reason, which dulls the signal; (2) the scout-duplication
  question now has a mutual case — a human-play check (pick
  scout twice, see whether the game gates) would settle it
  better than another driven panel; (3) the repeated Columbus
  secret deserves one look from the conversation system — not
  as a defect, as a template-frequency question.

## Regression suite

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree (log: evidence/2026-11-01/journey-succession-r97-
checkquick.log): 283 passed, 7 failed in 658s — the SAME counts
as r96's checkquick (283/7, 690s). The seven failures are exactly
r96's seven, no NEW failure:

- 6 standing families: measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20-fixes.
- 1 carried NEW-vs-r93 failure, re-verified SOLO (not contention):
  scripts/test-capable-bot-20261014.js fails the same subtest
  "real capable player combat earns the food deed at first use"
  (39 passed, 1 failed standalone in 38s, identical subtest).
  Same prime suspects as r96 (journey-establishment r72 favor-menu
  goon continuer, journey-scale r67 convoPick dedupe — both
  conversation-flow landings after r94's proof passed). This run
  does NOT bisect or fix it — it is outside the succession leg,
  and a fix belongs to the owning lane with its own proof.
  Flagged LOUDLY for the main session, second run running: the
  capable-bot food-deed proof is red on current master, and the
  same drift class already broke this run's proof-(e) replay.
- Zero failures attributable to r97: instrument-only, zero src/js
  diff, and none of the failing tests touches r97's scripts
  (check script count unchanged, so the new scripts never ran
  inside check). r97's own proof test was run standalone: (a)–(d)
  and (f) pass; (e) fails on the stale-baseline drift documented
  above.

## Closeout

- Commit (driver + analyzers + proof test + prereg + panel
  evidence + this note; instrument only, zero src/js).
  Safe-commit index clobber check + `git read-tree HEAD` resync
  before any rebase or merge, per standing lessons; verified
  clean (status empty, diff empty, hashes match).
- Rebased onto current master if it moved during the run;
  post-rebase panel-JSON diff check (panel stands only if the
  re-run diffs byte-identical — otherwise the panel is re-run,
  not claimed).
- Merged locally via --ff-only, pending ship — no version bump, no
  push (the ship loop owns those).
- Rotation-b advanced 7 -> 4, verified by re-read. Next Lane B leg
  is 4 (endgame).
- Lane B lock deleted at closeout. Worktree
  journey2-succession-r97 released and removed; branch deleted.
