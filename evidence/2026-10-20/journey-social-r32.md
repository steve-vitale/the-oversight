# Journey social r32 — citizen moots + r31-hold (lane B, 2026-10-20)

Run id: oversight-playtest-loop-2-20261020T090000Z. Lock: fresh (no prior
lock). Worktree slug journey2-social, registered with
WT_RUN_ID=2026-10-20T09:00:00+00:00 (lock + registry agree). Base 3254eebdd.

## Pre-registration (written before the pilot ran)

**Leg question:** two parts.
1. **r31-hold:** r31's count-aware recap + silence-exhaustion fixes were
   proved on pinned seeds (2010-2012). Do they hold under adversarial stress
   in the wild — 6+ recap picks and 6+ consecutive silences in real
   conversations, not just repros?
2. **Citizen moots:** r27's M1 MISS (1/4: NPC-NPC cases don't form under
   law-abiding play) stands, and Steve has since ruled moots aren't
   crime-gated — "villagers can be victims or falsely accused." The r30
   pilot's 37 moots on one seed were a DRIVER artifact: the favoritism
   wrapper stole from outsiders every 5 days (`Game.stealFrom`), so the
   PLAYER's crimes fueled the plots. This run is genuinely law-abiding —
   no theft, no hostile picks, no player-initiated violence. Do NPC-NPC
   cases form on their own? (Design math says the path is: 1-2 seeded
   NPC-NPC conflicts at tension 55-75 → motive = tension*0.64, needs ≥45,
   so tension ≥70 qualifies alone, or a 'lead'-goal ringleader at +25 —
   then 40%/day × beloved-gate 90%-skip ≈ 4%/day in a beloved village.)
3. **Multi-accused naming:** r30's case_11 (seed 2005): accused =
   Miguel+Aroha+Ursula, but the broadcast said "TONIGHT: MIGUEL stands
   accused" — accomplices judged silently. The verdict line ("Guilty.")
   also names nobody. A villager convicted as accomplice without ever being
   named is a presentation gap (Steve: justice covers the misjudged).

**Interesting-finding bar:** any verbatim content-line repeat in one
conversation (L2'); any citizen-run case with an NPC accused; any moot whose
broadcast names only accused[0] while judging all.

**Binding (pilot):**
- M1 r31-hold: recap-hammer (6+ recap picks/convo, 3+ NPCs) → ZERO verbatim
  beat repeats; escalation lines ("I've told you three times now", "We're
  going in circles a bit") fire; recap choice spends out. Silence-heavy
  (6+ consecutive silences, 3+ NPCs) → ZERO verbatim pool-line repeats
  (the intentional bare "..." is exempt by design); escalation fires once;
  budget drains to winddown. Any verbatim repeat = GO (r31 class alive).
- M2 citizen formation: ≥2 of 4 seeds show ≥1 case with an NPC accused
  (player not accused). GO = ≥2/4. NO-GO = ≤1/4 (r27 stands — Steve's call).
- M3 moot naming: every convened moot's broadcast names ALL accused. Any
  multi-accused case naming only accused[0] = GO finding → fix.
- M4 settle-speak (r30 continuity): silent settle count = 0.
- L3 social arc (informational): bonds/deepBonds/betrayalCases/mootsConvened,
  gossipConvos, avgTrust. The r27-rolled telemetry baseline was seeded under
  the THEFT driver — expect case/moots counts far below it; that's driver,
  not regression (metric review).

**Metric review:** mandatory section below. Note up front: L3 baseline
(`telemetry-baselines/social.json`, rolled r27) carries theft-driver
values (betrayalCases 53, mootsConvened 53); this run's citizen driver makes
those numbers non-binding. Propose: re-seed the baseline for the citizen arm
in r33 if M2 goes.

**Seeds:** smoke 3008 (10d), then 3004, 3005, 3006, 3007 (fresh).
**Horizon:** DAYCAP=140, death-aware (+10d tail).
**Policy:** 'citizen' — deep conversations, comfort duty (repeat sittings),
gossip forcing, moot duty (convene open cases + vote with the room), NO
theft, NO cruel/hostile picks, NO player-initiated violence.
**Stress probes:** separate pinned-convo probes (recap/silence) on 3 seeds,
run before the wild pilot so a HOLD failure stops the expensive run.

## Results

**M1 (r31-hold): HOLD.** Stress probes on 3 fresh seeds (3101-3103): recap
6x/sitting dup=0, escalation 2/2; silence 7x/sitting dup=0, escalation fired.
Wild pilot: 767 conversations, 0 L2' verbatim repeats, 0 comfort-repeats. The
r31 class is dead.

**M2 (citizen NPC-NPC cases): 1/4 seeds — NO-GO (r27 stands).** Seeds 3004,
3005, 3007: ZERO cases in 142 days each. Seed 3006: 2 cases (day 10 murder,
day 18 ambush), both NPC-accused, playerRole=bystander, both acquitted.
Under genuinely law-abiding play the moot system fires ~0.5 cases/run — and
only early. The beloved-village gate (avg trust >55 → 90% plot skip) +
motive≥45 (needs tension≥70 conflict pair or a 'lead'-goal ringleader) +
40%/day means a kind player's village almost never sees a moot. Steve's
"moots aren't crime-gated" ruling is not yet reachable in practice — this is
his call (tune the gate, or accept that peaceful villages don't do moots).

**M3 (moot naming): GO → FIXED.** Both 3006 moots confirmed the r30 case_11
class: case_2 (Carmela, Regina, Howard accused) broadcast "TONIGHT: CARMELA
stands accused"; case_4 (Luis, Wei, Carmela) broadcast "TONIGHT: LUIS stands
accused". Accomplices judged unnamed. Fix in src/js/betrayal.js callMoot:
broadcast names ALL accused ("CARMELA, REGINA, AND HOWARD stand accused"),
plural verb, player as "YOU". Proof test
scripts/test-moot-names-all-accused-20261020.js: RED (6 failures on pristine,
exactly the bug) → GREEN. Updated test-moot-broadcast-grammar-20261012.js
case 2 for the intentional behavior change (r8 player grammar preserved).
Regression: test-moot (38/1), test-player-trial (78/2), test-betrayal crash —
all identical on pristine master (pre-existing, not this change).

**M4 (settle-speak): HOLD.** 34 favor settles across 4 seeds, all with spoken
gratitude, 0 silent.

**Comfort-repeat: MISS** (0 hits — the r29 class stays dead).

## Village assessment (census, plain words)

- **3004** (142d, 7 alive): a working village. Seven deaths spread across the
  run — attrition, not catastrophe. 75 bonds, 39 deep. Trust 63.4. Nobody
  plotted against anybody; the fire stayed a fire.
- **3005** (142d, 8 alive): the beloved village. Three deaths in 142 days,
  trust 85.6, 65 bonds. Nothing bad ever happened — and nothing was ever
  judged. Peaceful to the point of uneventful.
- **3006** (134d, 3 alive): the village that suffered. Thirteen dead — eight
  in the last 35 days, a collapse. 95 bonds (highest — grief bonds people),
  38 deep. The only seed where anyone plotted: a murder case and an ambush
  case in the first three weeks, both acquitted. Carmela stood accused twice
  (once as ringleader, once as accomplice) and walked free twice.
- **3007** (142d, 9 alive): the friendly village. Five deaths, 76 bonds, 48
  deep bonds (highest), trust 69.6, 27 gossip conversations (highest). People
  talked; nobody fought.

Across all four: villagers act like people. They grieve, ask for help
hauling, remember the player's contest appearances ("They took you — The
Oath, on the screens"), teach and learn plant knowledge, gossip about who's
walking away from Haven.

## People check (sense-reads)

4 full transcripts read: Devon (gossip, s3006), Lena (comfort sitting, s3006),
Boris (day-100 deep, s3004), Sari (favor+gossip, s3007). All read like
people: the NPC wants something (Devon's question, Lena's need to be heard,
Sari's haul help), options engage or deflect it, endings resolve ("Thanks
for... you know. Just listening."). Boris's day-100 opener resumes a
4-day-old thread AND references the player's real contest appearance — earned
continuity, not fabricated history. No filler loops, no static menus, no
verbatim repeats anywhere in 767 conversations.

## Telemetry deviation check

4 LOUD lines, all explained, none rolled forward:
- l3.deepBonds 70→163 (+133%): citizen driver builds deeper bonds than the
  theft driver. Driver-caused, good direction.
- l3.betrayalCases 53→2 (−96%), l3.mootsConvened 53→2 (−96%): the baseline
  was rolled under the theft driver; the citizen driver generates no plots.
  Expected, pre-registered. NOT rolled — the baseline is theft-driver; the
  citizen arm needs its own baseline (r33 if M2 goes).
- l2prime.count 5→0 (disappeared): the r30 L2' finding is gone — the r31 fix
  working. Expected, good.

## Metric review

1. The L3 telemetry baseline (`telemetry-baselines/social.json`) is now
   driver-bound to the theft era. Any future citizen-arm run must either
   re-seed the baseline for the citizen driver or keep treating case/moots
   counts as informational. Propose: r33 seeds a citizen baseline if M2
   changes; until then, no roll-forward.
2. M2's bar (≥2/4 seeds with an NPC-accused case) may be too strict for a
   system designed to be rare — but r27 set the question as "do they form at
   all," and 1/4 with both cases in the first 3 weeks suggests the gate, not
   the metric, is the story. Keep the bar; the question is now Steve's.
3. M3's instrument (broadcast-line capture + whoTag comparison) worked
   first-try and is reusable for future broadcast audits.

## Reachable / fun / winnable

- **Reachable:** conversations, gossip, comfort, favors — all reachable and
  fire constantly under normal play (767 convos/4 runs). Moots: reachable
  only when plots form; under citizen play that's ~1 run in 4. The moot
  *system* (convene, vote, verdict, sentence) works end-to-end when it fires.
- **Fun:** the social layer reads genuinely well — grief sittings, thread
  resumes across days, contest memories, favor plans with place and time.
  The moot drama (broadcast, count, verdict) is strong theater. What's
  missing is *stakes variety*: both citizen-run moots acquitted, and the
  village never feels the moot as a threat — only as a show.
- **Winnable:** n/a for the social leg in isolation; no run was blocked by
  social systems. The 3006 collapse was mortality, not social failure.

## Design notes for Steve (not landed)

1. **M2 NO-GO is the headline.** A law-abiding player's village sees ~0.5
   moots per 140-day run, all early. If moots should be a living institution
   in peaceful villages (your "villagers can be victims or falsely accused"
   ruling), the formation gate needs tuning: the beloved-village 90% skip,
   the motive≥45 bar, or the 40%/day roll. If peaceful villages simply
   shouldn't do moots, that's a ruling — say so and I'll close the question.
2. The 3006 pattern (most deaths → most bonds → only cases) suggests
   suffering is currently the main plot fuel. Worth knowing, not necessarily
   wrong.
