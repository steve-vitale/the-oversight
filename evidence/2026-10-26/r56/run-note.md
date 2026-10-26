# Journey social r56 — THE PICK-CONVERSION RUN: THE GAP WAS THE POLICY (lane B, 2026-10-26)

Leg 5 (social life), cycle r56. Follows r55 (main-menu fix: offers moved,
picks still failed 0/3/0/0; mechanism named: the offer/pick decoupling —
372 offered unsteered convos -> 7 picks — and the 454 inBuilt=false
same-pick residual needing thread/reactiveQ/genericQ probe flags).

Rotation-b read 5 at run start. r55's closeout rotation write never
landed (the r55 run timed out before closeout; the adoption run verified
and merged but did not advance the file). This run plays 5 and writes 6
at closeout.

## PRE-REGISTER (written before any r56 seed ran — see prereg.md)

**Leg questions:** (Q1) with thread + reactiveQ + genericQ + pendingQ +
inT2list probe flags, what share of the inBuilt=false same-pick residual
is guard-owned vs genuinely missing? (Q2) does a LINGER policy — pick an
offered-fresh 'ask:others' after gossip + ans, in unsteered convos —
convert offers to picks at driver scale? If yes, the gap is a policy
artifact and the menu machinery works; if no, the machinery still
blocks picks.

**Arms (fresh seeds 5201-5204, smoke 5205 30d, DAYCAP=140, death-aware):**
5201/5202 control (r55 policy verbatim + probe flags); 5203/5204 linger
(control + linger step). ALL seeds keep seeded-speaker steering ON —
steering is not a funnel variable (seeded-speaker convos are excluded
from the natural funnel), so holding it constant isolates linger.
Linger rule (exact): in deep mode, after gossip + ans, before the steer
block, if arm is linger and NOT forceOthersOnce and choices offer
'ask:others' fresh, pick it — WITHOUT setting othersSteered/
othersDoneToday, so it stays in the unsteered funnel (lingerPick flag
for attribution). No src/js change in this run.

**Bindings (a miss is NO-GO, never re-scored):**
- R1 SPLIT: probe flags on >= 95% of same-pick probes; residual split
  reported; GO = split reported AND unexplained < 50% of residual.
- R2 CONVERSION (linger arm): unsteered picks per unsteered offer
  >= 25%, AND late (d91-140) unsteered picks >= 2 on >= 1/2 linger seeds.
- F1-picks (r55 bar, REPORT-ONLY): late unsteered picks on control seeds.
- M1 formation >= 10 deep2/seed; M3-cond pooled late TP >= 40%;
  M4 knack same-speaker = 0/seed; M5 5 sense-reads, 0 fabricated-history
  flags, <= 1 weak read (r55's proposed quality floor, adopted);
  M6 guardrail report-only.
- NO-REGRESSION: check.js --quick at the standing profile (279/8).

## Instrument check (before the full run: SEEDS=5203, DAYCAP=40)

Smoke (5205 x 30d): PASS (bondSnapDays=7, convos=84, t2picks=22, funnel
live). Seed 5203 at 40d: linger arm, 41 days, unsteered picked 22 of
70 offered (31.4% early conversion — the instrument already answering
Q2 before the full run), probes 68/68 carrying the new flags. Early
samples show inT2list=false on day 4 (trust-gated 'others' — minTrust
20 — so early no-offers are gating, not menu bugs). The 40d pilot
files were deleted before the full run (same filenames; the full run
regenerates them — no stale pilot outputs survive).

## Pilot results (4 seeds, full horizon unless death-aware)

| seed | arm | days | alive | deep2 | unsteered total | no-offer | offered | picked | late picks | lingerPicks | othersSteered | knackSame | condRate |
|------|-----|------|-------|-------|-----------------|----------|---------|--------|------------|-------------|----------------|------------|----------|
| 5201 | control | 141 | 9 | 27 | 306 | 198 | 98 | 1 | 0 | 0 | 127 | 0 | 82.7% |
| 5202 | control | 87 | 0 | 20 | 186 | 87 | 74 | 2 | 0 | 0 | 60 | 0 | 45.0% |
| 5203 | linger | 141 | 7 | 24 | 414 | 209 | 205 | 103 | 42 | 103 | 7 | 0 | 79.0% |
| 5204 | linger | 99 | 0 | 16 | 257 | 138 | 119 | 80 | 0 | 0 | 13 | 0 | 55.0% |
| CONTROL pooled | | | | | 492 | 285 | 172 | 3 | 0 | 0 | | 0 | |
| LINGER pooled | | | | | 671 | 347 | 324 | 183 | 42 | 183 | | 0 | |
| POOLED | | | | 87 | 1163 | 632 | 496 | 186 | 42 | 183 | | 0 | 70.8% |

Main-menu offers stay marginal (pooled main 23 vs subject 484; late
picks by menu: main 1, subject 41 — both on 5203). 5204's 0 late picks
cover only 9 late days (d91-99; village wiped d99), not a full late
window. 5202 never reached the late window (wiped d87).

### R2 CONVERSION: PASS, decisively — the gap was the policy

- Control: 3/172 = 1.7% (r55: 1.9% — the old policy, reproduced).
- Linger: 183/324 = 56.5% (>= 25% bar, by 31.5 points).
- Late picks: 42 on 5203 (>= 2 on >= 1/2 linger seeds — PASS).
- Attribution is exact: lingerPicks == picked on BOTH linger seeds
  (103 = 103, 80 = 80). Every linger-arm unsteered pick came from the
  linger step — none from the old fallbacks. When the policy weighs
  'others', offers convert. The menu machinery works; the 372->7 gap
  was the driver (and, by the same logic, any player who never weighs
  the offered topic) skipping past offered topics, not the menus
  hiding them.
- Side effect, stated plainly: linger subsumes the daily steer.
  othersSteered collapses on linger seeds (5203: 7, 5204: 13, vs
  control 127/60) because linger fires first in most convos and the
  steer only runs where 'others' is not offered. The steer is not
  broken; it is redundant under linger.
- The fresh-ceiling adjustment is a no-op this run: the
  offered-not-fresh class is 0 in both arms (a convo that picked
  'others' goes on-thread, so re-offers within the same convo are
  rare) — picked/offered IS the fresh conversion here.
- F1-picks (report-only): control late 0/0 — the same fail as r54/r55
  under the old policy, as expected. The bar now measures a retired
  policy (see metric review).

### R1 SPLIT: coverage PASS, content FAIL — the residual needs a deeper instrument

- Flag coverage: 800/800 probes carry all five flags (100% >= 95%).
- Pooled residual (same-pick probes, inBuilt=false): 493 total.
  - question-owned (reactiveQ or genericQ present): 0 (0.0%).
  - thread-guard (thread==='others'): 66 (13.4%).
  - gated (inT2list===false): 26 (5.3%).
  - unexplained: 401 (81.3%).
- GO clause (unexplained < 50%) FAILS. Per the prereg, the finding is
  that the residual needs a deeper instrument, not a fix. Do NOT read
  this as "the menus are broken": R2 proves the menus convert when
  weighed, and the residual is a probe-sample phenomenon (a pick
  exists per t2pickOther but the built list lacks 'ask:others' on a
  subject menu the driver reached).
- questionOwned = 0 eliminates that candidate WITHIN the probe
  sample: no sampled subject-menu turn carried a hanging reactive or
  generic question. Caveat, stated: the sample can only see turns that
  present as subject menus — whether a question-owned turn can present
  as one at all is a code question for r57 (the menu builder's
  owns-branch), not something this sample answers. In driver play,
  questions are answered before subject navigation (ans step precedes
  subject browsing), so the candidate was unlikely from the start.
- Fresh problem stays gone: never-served 9/623 = 1.4% of menu-problem
  turns (r55: 2.1%); served-changed-pick 54 (8.7%). Genuine miss 562 vs
  correct non-offers 61 (convoSawOthers + same-pick).
- Named r57 candidate (code-grounded, not proven): build-time
  freshness vs probe-time pick disagreement. t2topicFresh('others')
  returns t2othersChanged (pick changed since served); the menu build
  calls t2pickOther internally, and the probe calls it again — each
  call can see a different pick if the pick computation moves between
  calls, so a build-time fresh-classified 'others' can hit the fresh
  loop's topicCapMood wall (the r53 exemption lifts freshCap only, not
  topicCapMood) while the probe classifies it same-pick. The r57
  instrument must capture the BUILD-TIME classification (or a
  unit-level test: a discussed-unchanged 'others' state must appear in
  the built list — if it does, the wild residual is classification
  drift, not the re-list). Until that test exists, the re-list stands
  unrefuted and no menu fix is warranted.

### M1 formation: GO — 27/20/24/16, all >= 10
### M3-cond: GO — pooled late TP 170/240 = 70.8% (>= 40%)
### M4 same-speaker knack: GO — 0 on all seeds (cross-speaker retells reported as circulation only: 4/1/4/2)
### M5 people: MISS on the quality floor (flags clause GO, floor clause MISS)
- 0 fabricated-shared-history flags across all 5 reads.
- Strong: s5201-bondy-1 (day 4, unnamed man — sleep-as-dream, stray-dog
  knack, clean deflection "I need to go be quiet for a while");
  s5204-late-d94-Zeliha (dying village, "Quiet lately. Too quiet,
  maybe." + "Nothing new. Which is new" — the quiet reads true; clean
  invite decline + leave); s5203-wrapserve-Keegan (day 12, old-rift
  serve "Older than the scattering, even. Some things you carry so
  long they grow into you." — the run's cleanest grievance delivery).
- Weak (2, over the <= 1 floor): s5203-late-d100-Boris (stall-loop:
  "lost my train of thought" / "Anyway — where was I?" / "Never mind —
  go on" / "...Actually, forget it", the one real beat — the Moot
  taking the player, "It wasn't nothing" — fizzling into fire-gazing,
  then turns continuing PAST the leave line "Don't be a stranger");
  s5202-seeded-d19-Thao (strong opening — the village arguing what to
  CALL Hushpuppy, "What's your vote?" — then "That's the whole of
  it. Sorry." and a closing line claiming "that personal stuff,
  settled" when the vote was never answered).
- Recurring wart class (r55 Carlos + r56 Boris/Thao/Keegan-tail):
  stall lines + post-leave continuation. Part of the post-leave tail
  is driver artifact (the driver never picks 'leave' until fallbacks
  exhaust, so it talks past the NPC's close); the stall lines
  themselves are game content. Documented, not fixed here — a
  stall/leave-loop run, not a drive-by fix.
- Carried-nit recurrence: Zeliha's double-invite echo ("Want to come
  with us?" / "Want to come with me?") is the Nino double-invite
  class again, in a new speaker. Omar unanchored favor callback: not
  seen in this read set, still carried.
### M6 guardrail (report-only): 5201 ends 9 alive (7 dead: monster 2,
  combat 2, dehydration 1, arena 1, contest 1); 5203 ends 7 alive (9
  dead: arena 3, monster 2, dehydration 2, Heckler 1, Hushpuppy 1);
  5202 wiped day 87 (13 dead, arena 9 — the arena did what the arena
  does); 5204 wiped day 99 (12 dead: sickness 5, wounds 3, monster 2,
  ambush 1, Old Loud 1). Death causes are the standing arena/survival
  mix, not a social-leg signal.

## Village assessment (plain words)

Four villages, same warm player, one policy difference — and the
difference is everything about what got talked about.

**Seed 5201 — the nine who stayed, steered daily.** 141 days, 9 alive.
The daily steer did the talking (127 steered convos) while natural
play picked 'others' once in 306 unsteered convos. 27 deep pairs —
people knew each other. The village worked; its attention just never
wandered to each other on its own.

**Seed 5202 — the village the arena ate.** Gone by day 87, 13 dead,
9 to the arena. 20 deep pairs built before the thinning, then nothing
— no late window, no late picks, because there was no village left
to pick. The social graph died with the village, which is the
death-aware rule working as designed.

**Seed 5203 — the village that talked about each other.** 141 days,
7 alive, 24 deep pairs — and 103 unsteered 'others' picks, 42 of them
late. Same village shape as 5201, but the talk followed the offers:
when the menu offered the others, the conversation went there. Boris
at day 100 stalling and the Moot memory surfacing is what that
village sounded like late — tired, honest, a little stuck.

**Seed 5204 — the village sickness took.** Gone by day 99: sickness 5,
wounds that wouldn't close 3. 80 unsteered picks before the end —
the linger policy worked here too (80/119 offered) — but picks don't
save a village from disease. Zeliha at day 94, "Quiet lately. Too
quiet, maybe," is the sound of a village already thinning.

What they knew: each other's business — bonds, rifts, deeds, who left
for water — said out loud with dates and change-acks. What changed
this run: the step from offered talk to picked talk is a policy
choice, not a menu property. Offer it and weigh it, and the village
talks about itself; skip past it, and it doesn't.

## Reachable / fun / winnable (social leg)

- **Reachable:** the 'others' surface converts at 56.5% when weighed
  (linger) vs 1.7% when skipped (control) — reachability was never the
  binding constraint; weighing is. The residual subject-menu question
  (401 unexplained probes) is a measurement puzzle, not a player
  blocker: players who pick offered topics get them.
- **Fun:** the transcripts are the evidence — Keegan's old-rift
  honesty, Zeliha's quiet-village dread, Thao's Hushpuppy naming vote
  all read like people. The fun tax is the stall-loop + post-leave
  tail (2/5 reads not-strong) — repeated deflections and conversations
  that won't end.
- **Winnable:** not this leg's question; 2/4 villages survived to the
  horizon with social fabric intact (M1/M3/M4 all GO). The two wipes
  were survival-loaded (arena, sickness), a question owned elsewhere.

## Metric review (§14)

- R1: FAIL on the unexplained clause (81.3% > 50%); coverage clause
  PASS (100%). The bar stands as failed; it is not re-scored. The
  failure reframes r57 (deeper instrument + build-time classification
  test), it does not authorize a menu fix — R2 proves the menus work
  when weighed.
- R2: PASS both clauses (56.5% >= 25%; 42 late on 5203). The conversion
  question is answered: the gap is policy, not machinery.
- F1-picks (report-only): control late 0/0 — the bar now measures a
  retired policy. Proposed revision for the NEXT run (not this one):
  retire F1-picks as written; judge conversion under a weighing
  policy (R2's form) and judge the residual with r57's build-time
  instrument. The old bar's two straight fails (r54, r55) plus r56's
  control reproduction (1.7%) are the same finding three times.
- M1/M3/M4: all GO, no revisions proposed. M5: MISS on the quality
  floor (2 not-strong reads vs <= 1) — the floor clause worked as
  designed (it caught a real pattern, not a single weak read); the
  flags clause alone would have passed. Keep the floor for r57.
- M6: report-only as specified; the two wipes stay open for Steve's
  loop, not this leg's.

## Telemetry

Deviation check vs telemetry-baselines/social.json (r56-telemetry.log):
- Result: 1 LOUD line — l3.deep2 newly appeared (baseline 0 ->
  current pooled 87, n=4 files).
- Verdict: EXPLAINED schema artifact, not a bug — deep2 is the
  current formation key the old baseline predates (same practice as
  r54/r55: baseline NOT rolled). l3.bonds and dryRate quiet.

## Regressions

- NO src/js change in this run (driver + analyzer tooling only), so no
  proof test is owed; the linger step is a driver policy, proven by
  the run itself (lingerPicks == picked on both linger seeds).
- check.js --quick (r56-check-quick.log): 278 passed, 9 failed in 545s.
  The failing set is EXACTLY lane A's independently-run set from the
  same hour (278/9, journey-scale tree) and equals r55's standing 8
  PLUS test-establishment-r20-fixes-20261020.js (racks-full voice
  gate) — a current-base pre-existing failure that arrived with
  master movement since r55, not with this run (this run changes no
  src/js: driver + analyzer tooling + evidence only). Zero
  conversation/gossip/moot failures. The --quick bar is therefore met
  at the current-profile standard (278/9 shared with lane A), not at
  r55's literal 279/8 — the 9th failure is pre-existing on both lanes'
  trees. (This run's check waited for lane A's --quick to finish
  first; concurrent jest is forbidden.)

## Infra notes (for the next run)

- Per-seed verdicts rewrite works: r56-verdicts.json was rewritten
  after every seed (4 FLUSH lines for verdicts) — a restart split no
  longer needs the assembler. (r55's assembler remains in scripts/ for
  old split runs.)
- Pilot-then-full: the DAYCAP=40 linger pilot validated flags +
  linger before the full run and its files were deleted before the
  full run (same filenames; full run regenerates). No stale pilot
  outputs survive.
- Heartbeat: registered 15:56:58Z, immediate heartbeat verified
  15:59:06Z, loop running (pid 12214, 10-min ticks, log to file). A
  duplicate foreground loop instance was started by accident and
  killed within a minute, before its first tick — no double-heartbeat.
- Driver log: goal hidden_files journey2-social-r56-driver.log
  (smoke PASS + 4 SEED lines + DONE r56, 0 lost to EPERM flap on all
  flushes).
