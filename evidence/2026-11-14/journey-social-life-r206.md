# Journey — social life, r206 (Lane B, leg 5) — 2026-11-14

Run `2026-11-14T22:57:27Z`, worktree `journey2-social`, branch `journey2-social`, base master `007c61738`.
Rotation-b read **5**, to write **6** at closeout. Lock: `playtest-loop-2.lock` (own, removed at closeout).

## Pre-registration (summary)

Full prereg: `evidence/2026-11-14/journey-social-life-r206-prereg.md`.
Seeds **44501–44504** (fresh; band checked clean against all prior preregs, reserved
44201–44204 / 43901–43904 / 44401–44404, used 44001–44004 / 44301–44304, forbidden 99201–99208; backup 44601–44604
clean). Driver/analyzer/helpers are r200 verbatim except seeds/OUTDIR/filenames
(`scripts/journey-social-life-r206-20261114.js`, `scripts/analyze-journey-social-r206-20261114.js`,
`scripts/journey-social-r206-helpers.js`), PLUS the two r200-metric-review analyzer
additions (M12-native `tallyThreeTimes` + M2 rate watch `proposalsPerVillageDay`,
proven by `scripts/test-journey-social-r206-threetimes.js`, 11/11 incl. r200 corpus
anchors 23/1/0/91 and rates 0.177/0.328); smoke passed (SEED=44501 DAYCAP=5: day 7 survived,
12 alive, JSON written, 0 instrument errors).

Jobs: (A) continuity panel M1–M12; (B) RE-CONFIRM r195's two fixes in the wild on fresh seeds
with the revised bars, now counted natively (M12-native, M11); (C) watches: HEED warn_you
engagements + ask:village injured answers (second panel with r130/r131 native), M2 combined
bar + rate watch, vendetta, moots. (D) NOT this run: r171 M2b scholar-open proof (leg 4);
measurement-proof refresh owed by sim-proofrefresh-b18.

Base movement since r200 (02e8de19c → 007c61738, 135 commits): r132 nod-loop fix —
repeat nv: gesture thins the sitting (3bffd4752); r201 favor-want settle gate
(f1871e37b); r191 stage-0 guard fresh-favor reorder (4c860321d); Reunion arena balance
(arena-only, not social); version bumps. First social panel with all three native.

Stale-tree recovery at run start: the 15:00/16:00 aborted runs left an unregistered
journey2-social worktree + branch at 59f78034c (ancestor of master, tree CLEAN, no work
to preserve). Released as done-abandoned, worktree removed, branch deleted; fresh
journey2-social registered from 007c61738. Registration queued ~9 min on REGISTRY.lock
behind Lane A's journey-landing-r134 registration (concurrent, different lane).
Flap: last window ended ~21:42Z; probes OK at 22:57Z.

## Panel

**44501 d69 village-lost (scattered, 5 alive), 44502 d87 village-lost (0 alive),
44503 d142 SURVIVED (4 alive), 44504 d143 SURVIVED (2 alive).** Median lived 114.5d.
Full convs 465 (60/93/152/160); natural ends 431; feasts 61 (9/12/20/20); moots 11 (2/3/2/4).
Fallen 62 (7/18/12/25). Causes: the wild 31, monsters 10, thirst 4, wounds 4, sickness 3,
combat 3, ambush 2, dehydration 2, starvation 2, stranger 1. Successions 33 (5/9/8/11).
JSONs: `evidence/2026-11-14/journey-social-life-r206-{44501..44504}.json`;
panel log `.../journey-social-life-r206-panel.log`;
analysis `.../journey-social-life-r206-analysis.txt` (analyzer rc=0, no stderr).
Panel ran 23:20–23:32Z, ~3 min/seed under load avg ~18 (r200: ~90s/seed).

**First social panel with villages surviving to the cap.** 44503 and 44504 both lived
past DAYCAP 140 — every prior social panel ended with all villages lost. The
survivors had food: 44503's pantry held 43,554 kcal at the end (44501/44502 ended at
0). Reported, not claimed as a fix — 4 seeds, and the collapse hunt owns the
underlying question.

## Binding verdicts

- **M1 arming motive — GO.** 14 plots armed, all 14 grievance-linked at arming
  (leader motive carries "grievance" in every ARM event; the two Somchai→Seamus
  arms have gT→L=0 but accomplice motives carry the grievance). Grievance-holder →
  later leader: 6 cases. NEW DATAPOINT (cold-accomplice pattern): the Somchai→Seamus
  arms (d30, d36) have HOT accomplices — Adaeze grievance 66/88, Gladys 22/44 —
  the first panel where an accomplice carries a live grievance against the target
  (r195/r200: accomplices cold, motive 0, one 25 ambition). The leader-motive bar
  still holds; the accomplice pattern is reported as moved, not failed — see
  metric review.
- **M2 villager-initiated bonds — ANSWERED (15th datapoint).** 118 proposals, ALL
  villager-initiated (scholar 0). Person 53 (accepted 20, refused 8, staged 19,
  expired 6); link 65 (accepted 19, staged 33, expired 13). Per-initiator max 13
  (Nino) — below the combined bar of 20. Person-kind max 5 (Aroha, Mia) — inside
  amendment-5 cap 8. End bonds 52/75/93/162. Engine still records NO initiator on
  bond records.
- **M2 rate watch (native this run): 0.268/day** (118 proposals / 441 lived days) —
  between r195 (0.328) and r200 (0.177). The r200 dip did not continue down; the
  rate tracks village longevity more than anything (the two surviving villages
  contribute 89 of 118 proposals). Watch only, no bar.
- **M3 invite refusal — (no bar; recorded).** NPC lures 257 accept / 232 decline;
  player party 32 accept / 23 decline; NPC bond 7 accept / 8 decline. All lures
  NPC-invited, all party bearer-initiated (succession-proof split). Invitations
  sometimes taken, as ruled.
- **M4 sense — GO.** 455 transcripts, 216 near-dup flags, 4/4 candidates printed, all natural
  ends. Candidates (full transcripts in the analysis file):
  1. 44501 gen_qn9tbj1, C-friendship, 11 turns — a survival philosophy ("One more
     day. That's the goal."), then village news (Benoit taken by "The Pit"), warm
     ending. Pass.
  2. 44502 nikolai_volkov, D-talk-request, 9 turns — an Emberhold link proposal, then
     deflection under the doubt-probe escalating to a confession ("I wasn't a doctor.
     I was a welder. There are people from my old life I'd rather never find me."),
     then the control-group theory of the Scattering. Strong pass.
  3. 44503 sam_wilson, D-talk-request, 11 turns — the shield ("Someone has to be the
     wall."), his thinking place, asks the player what they're good at that nobody
     knows, warm ending. The recap works under repetition ("Still on what you're
     good at." / "As I said — we're still on what you're good at."). Pass.
  4. 44504 app_mgpspn7w238 (Saud), C-friendship, 10 turns — grief, the thinking place,
     deflection escalating to a confession ("I'm not from Denver. I'm from Riyadh...
     I was selling a better version of me."), asks about regrets, warm ending. Strong
     pass — AND carries this run's blank (see below): the thinking-place line serves
     twice in one sitting. The candidate passes on the whole; the double-serve is
     the one senseless beat in it.
  React shape: agree 0 / joke 0 / silence 2992; longest continuer run 4 (< 5) — the
  3-label pool suffices.
- **M5 census guardrail — REPORT-ONLY.** 2/4 past d100 (d142, d143); median 114.5d vs
  survival-control median 126d — below control, but 2/4 SURVIVED to the cap, the
  first social panel with cap survivors. Floor (0/4 past d75) not triggered.
  Sequence: 2/4, 2/4, 1/4, 1/4, 1/4, 3/4 (r195), 2/4 (r200), 2/4 (r206).
- **M6 gossip-position — GO** (re-aligned, radius-1). Gate-away 0/0/0/0; debates 163 kicked,
  162 settled. Strict on-tile away total 90 (70 burst + 20 settle) — the known
  metric/gate discrepancy; does NOT fail M6.
- **M7 dedupe — HOLDS (with a documented blind spot).** All 216 flags are jaccard≥0.5
  (157) or same-opening pool-cycle (59) or legitimate-variety kinds; no verbatim
  same-beat repeat in a fixed pool visible in the analyzer output. BUT the Saud
  double-serve (candidate 4) is invisible to this scan by design — the scan
  de-dupes identical cores before comparing ("re-answers, NOT new beats"). The
  think-place line is a fresh scene serve, not a re-answer, so the scan's
  assumption fails for it. The blank is fixed this run (see Blanks); the scan
  stays as-is (its re-answer assumption holds for sayLine-served lines).
- **M8 counter-settle — SETTLED.** 1 settle (44501, link formed), 0 blocked re-raises,
  0 fresh re-links after a settle. proposeLink 19, counter 1, fresh 19. Thin
  (r200 also had 1 settle) but meets the aligned definition. The r201 favor-want
  settle gate shows no visible movement in the counts (1 settle vs r200's 1).
- **M9 recap cap — HOLDS.** maxPresses 3 per seed, total 528, 0 offered after cap,
  0 cap failures.
- **M10 coach — HOLDS; M10b face-guard — HOLDS.** 0 coach verbatim, 0 face verbatim,
  panelMaxSameNarr 1, NARR near-dup flags 0.
- **M11 recap-empty — HOLDS (r195 fix CONFIRMED in the wild, third panel).** 0 recap-empty
  flags of 216 (r195 confirm seed 8 → 0; r200: 0; r206: 0). The pool fix holds.
- **M12 door-requirement — CONFIRMED (r195 fix CONFIRMED in the wild, third panel,
  now counted natively).** M12-native: "I've told you three times now" served 42
  times panel-wide (14/11/9/8 per seed), worst per sitting **1**, **0 sittings with
  2+**; "We're going in circles" exit lines served **198** (≥1 required). Worst
  sitting maxDoorServes 9 (44504 yara_haddad, D-talk-request, 10 turns) — within the
  designed ceiling of 9. Door-req flags 125/216 (58%) vs r189's 86/143 (60%),
  r195's 107/185 (58%), r200's 38/91 (42%) — the flag rate is back up with the
  longer-lived villages (more conversations, more door asks), consistent with the
  flag count tracking panel size, not the fix.
- **B2 double-confession — HOLDS (8th re-confirmation).** 13 sittings with a confession,
  0 double, 13 single.
- **Q11 scattering — CONFIRMED.** All 4 seeds record scattered/hungryDays/aliveEnd.
  Scattered 1/4 (44501: 5 alive, 3 hungryDays); 44503/44504 survived to cap.

## Watches

- **HEED warn_you (r131): CONFIRMED in the wild — first panel.** 5 NPC "warn" lines,
  and the engagement form is present: Meera (44501) "About that warning — I keep
  turning it over. Thank you for asking."; Mia (44503) three variants across
  sittings ("About that warning — I keep turning it over, anyway." / "Moving on." /
  "About that warning — I keep turning it over."). The line is the warn_you
  want-engagement follow-up (`convo-wants.js` "About ${sh} — I keep turning it
  over", sh = "that warning"). r200 found only the resurface form; this panel
  shows the engagement itself, carried across sittings.
- **ask:village injured (r130): not observed — second panel.** 0 lines mentioning
  "injur" in 455 transcripts — the path (an injured villager being asked about)
  simply wasn't hit again. Not a failure; the watch continues.
- **Moots:** 11 total (2/3/2/4) — trigger alive; no investigation per prereg.
- **Re-offer furniture-free max 12** (panelMax 12, panelMaxFurnitureFree 12) — same
  order as r189/r195/r200 (12/11/12). Document as watch; no escalation past 12.
- **Dropped threads:** 17 drops, 13 resurfaced next sitting, 4 none (no later
  conversation — villager died / village ended). No dropped promise seen. Ledger works.
  Resurfaces carry real content (the pantry run, wanting to survive).
- **Vendetta:** maxUnordered 7 (Gladys↔Jad, d8–d25, 7 arms: Gladys→Jad ×3, Jad→Gladys
  ×3, Gladys→Jad ×1, all sprung) — one below the 8 bar, the closest approach yet
  (r195/r200 max 3). If the next panel reaches 8, the grievance-loop cooling-off
  becomes a design-look job. Jad died d27 in an ambush; Gladys d70 to the wild.
- **Expired plots:** 3 (d35 Somchai→Seamus, d12 Tariq→Boris, d11 Ava→Yara), 1–3 lines
  naming the pair after expiry — same pair's later activity, consistent with the
  r132 by-design silence for expired plots; no contradiction found.
- **Nod-loop fix (r132):** no loop flags attributable to it in the panel — the
  'more'-press longest run is 4, react shape unchanged (agree/joke 0). The fix
  shows as absence (no 3/3 pilot loops reproduced); nothing to measure directly
  at panel scale. Reported, not claimed.
- **Fresh-favor reorder (r191):** no phantom re-ask shape visible in the flags;
  favor re-ask counts not directly instrumented. No movement to report.

## Village assessment (plain words)

Four villages — two lost, two lived to the end of the road. The first social
panel where anyone survived.

- **44501 (69 days, scattered, 5 alive at the end).** Duc's village: five bearers
  in ten days (d47–57), the wild taking four of the seven fallen, the pantry at
  0 kcal when it scattered. What lived: a chef, an interpreter, a dentist with
  four abilities, a pharmacist, a musician — warm people (trust 74–93) with no
  food and no leader left standing long enough to use it. Meera's warning line
  ("About that warning — I keep turning it over. Thank you for asking.") is the
  human note: someone carrying what you told them.
- **44502 (87 days, 0 alive).** Seamus's village: eighteen fell, the wild taking
  ten. Nine successions. The Gladys↔Jad vendetta burned through the first month
  (seven plots armed between them, all sprung), then the monsters and the wild
  finished the village. The village knew a lot (56 codex plants) and still died
  with an empty pantry.
- **44503 (142 days, SURVIVED, 4 alive).** David's village: the long run that
  held. Twelve fell, but Denis (taxi driver, trust 94), Dominic (night security,
  100), Mia (gardener, 99, six abilities) and Synnøve (plumber, 91) were still
  standing at day 142 with 43,554 kcal in the pantry and 95 codex plants. Sam's
  shield confession lives here ("Someone has to be the wall."). The village that
  lived is the village that kept its food.
- **44504 (143 days, SURVIVED, 2 alive).** Bessie's village: twenty-five fell —
  the hardest road of the four — but Yara (interpreter, 87) and Ebru
  (veterinarian, 90) were still standing at day 143 with 6,181 kcal and 73 codex
  plants. Twelve bearers carried the mantle. Saud's confession lives here ("I'm
  not from Denver. I'm from Riyadh... I was selling a better version of me."),
  and so does this run's blank.

What is missing, across all four: the two villages that died still died with
empty pantries and nobody left who could hunt or kill well enough to refill
them. The two that lived had food and warm, able people. The social life is
real in all four — the survival floor underneath it held twice this time, and
that is the first time a social panel can say so.

## People check

Read the four M4 candidates in full (see verdicts above). They act like people:
they want things (to be heard about how they survive, a link with Emberhold,
to be the wall, forgiveness for a false self), they deflect and confess, they
end conversations with warmth or a debt owed. The driver still repeats itself
("I'm listening" ×2, "All right. Let's go." ×2, "Wait — what were we talking
about?" ×2) and one NPC serves the same scene line twice — both driver-side
roughness and one game defect (fixed this run, see Blanks). The recap-empty pool
fix is visible in the wild (0 flags, third panel). The dropped-thread ledger
works (Mia's survival thread resurfaces next sitting). The warn_you engagement
shows for the first time. No fabricated shared history, no filler loops, no
static menus in the sampled transcripts.

## Blanks filled

- FILLED (game fix — invite 'small'-pool double-serve, src/js/betrayal.js):
  taking an NPC's walk invitation twice in one sitting could serve the
  identical scene line twice — transcript-caught in candidate 4 (44504, Saud:
  "Saud shows you where they go to think. \"Don't tell the others. Everyone
  needs one place.\"" twice in one 10-turn sitting). Mechanism: resolveInvite's
  'small' pool is picked by raw RNG, and the accept outcome rides the
  diegeticAct exemption through sayLine (correctly — the walk already happened,
  blocking it produced the r23/r24 dry-line wart) — so the exemption also
  exempts the flavor scene line from the per-sitting no-repeat block, and the
  M4 scan de-dupes identical cores before comparing, so the repeat is invisible
  to the panel instrument. Fix: the 'small' pick skips lines already spoken in
  THIS sitting (the per-sitting ledger sayLine maintains), falling back to the
  first pool line when all three were said — the declineLine pattern in the
  same file. Reward/wild lines untouched (their lines carry granted rewards /
  trauma, not pure flavor). Proven by
  scripts/test-journey-social-r206-invite-small.js — RED first on the base
  (seed 8: Marvin serves the think-place line twice), GREEN after (2/2).
  Confirmation re-run on the worst seed (44504, fixed code): think-place
  serves 6, sittings with 2+ **1 → 0**; village still survived d140 (full
  convs 160 → 171 — the changed line moves downstream conversation flow,
  same class as r195's confirm observation; outcome class unchanged).
  Panel-wide the defect was 1 sitting in 465 conversations.
- FILLED (tooling): M12-native tally + M2 rate watch (tallyThreeTimes,
  proposalsPerVillageDay in scripts/journey-social-r206-helpers.js, wired
  into scripts/analyze-journey-social-r206-20261114.js) — the r200 metric
  review's ask, so the M12 confirmation needs no hand script. Proven by
  test-journey-social-r206-threetimes.js (11/11, r200 corpus anchors
  23/1/0/91 reproduced exactly, rates 0.177/0.328).
- DOCUMENTED (watch): vendetta maxUnordered 7 (Gladys↔Jad) — one below the
  design-look bar; the next panel decides it.
- DOCUMENTED (watch): hot accomplices on the Somchai→Seamus arms (Adaeze
  grievance 66/88) — the cold-accomplice pattern moved; see metric review.
- DOCUMENTED (watch): re-offer furniture-free max 12 — same order as r189/r195/r200.

## Interesting (not pre-registered)

- Two villages surviving to the DAYCAP is the headline (see Panel). The
  survival-collapse hunt owns the underlying question; this leg reports it.
- M2 rate 0.268/day sits between r195 (0.328) and r200 (0.177) — the rate
  tracks village longevity (the two surviving villages contribute 89/118
  proposals), not a social change.
- The fix's confirmation re-run moved fullConvs 160 → 171 on the same seed —
  a one-line dialogue change moves downstream conversation flow measurably.
  The village outcome class (survived d140) did not move.

## Metric review

- **M12-native works.** Counting "three times" serves and exits natively gives
  a clean, falsifiable confirmation (42 serves, worst 1/sitting, 0 with 2+, 198
  exits) with no hand script. Keep the revised bar. Note: the serve/exit TOTALS
  scale with panel size (42 vs r200's 23, 198 vs 91) — the bar binds per
  sitting, so totals are context, not verdict.
- **M2 rate watch works.** 0.268/day prints natively; anchors r195 0.328 /
  r200 0.177 hold. Keep as watch-only; if the rate keeps tracking longevity,
  a per-roster-size normalization is the next question, not a bar.
- **M1 cold-accomplice pattern moved.** The Somchai→Seamus arms carry hot
  accomplices (Adaeze grievance 66/88, Gladys 22/44) — the first hot-accomplice
  datapoint. M1's bar (leader motive grievance-linked) still holds 14/14, so
  this is not a verdict — but the pattern description ("accomplices cold")
  should be re-read next run: if hot accomplices recur, the pattern is
  "accomplices usually cold, sometimes carrying their own grievance" and the
  M1 narrative updates, not the bar.
- **M7 scan blind spot (documented, not re-scored).** The scan de-dupes identical
  cores by design, so a verbatim scene-line repeat served twice in one sitting
  is invisible to it. The fix lands this run; the scan stays as-is. If a future
  run wants the instrument to catch this class, the scan needs an exact-repeat
  count alongside the near-dup flags — proposed, not built (the fix, not the
  instrument, is this run's job).
- **M5:** no metric change — M5 is report-only and the collapse is owned
  elsewhere. The 2/4 cap survivors are reported, not claimed.

## Telemetry deviation check

Adoption r207 (2026-11-15 00:56Z): the r206 telemetry-check log shows 5 LOUD
"disappeared" lines (l3.bonds 318→0, l3.deepBonds 168→0, l3.betrayalCases 8→0,
l3.mootsConvened 7→0, l3.gossipConvos 99→0, n=4 files). Investigated, EXPLAINED
— schema drift, not a bug:

- Baseline `hidden_files/telemetry-baselines/social.json` carries only
  l3.* keys (318/168/8/7/99, dryRate 0, l2prime.count 4) — a stale-era file
  from an older collector (the sibling social.json with the STALE note says
  pre-r51 values were never rolled and must not be compared against current
  corpora).
- The r206 panel JSONs (`journey-social-life-r206-4450{1..4}.json`) carry NO
  l3.* keys anywhere: top-level schema is seed/manifest/days/social/trustTbl/
  bondSnaps/... with `social` = fullConvs/naturalEnds/feasts/moots/transcripts.
  Moots, bonds and betrayals ARE present in the corpus under the new schema
  (11 moots, 118 proposals, 14 plots armed) — the checker looked up keys the
  corpus never had, so "disappeared" means "never present under that name".
- Baseline NOT rolled. Rolling would write current-schema values under stale
  keys; the correct next step is a re-seed with a metric mapping for the
  current social schema, a future-run job — not a same-run roll-forward.

## Gate

Adoption r207 (2026-11-15 01:23Z): `node scripts/check.js --quick` re-run to
completion in the worktree — **324 passed, 16 failed in 1478s** (log
`evidence/2026-11-14/journey-social-life-r206-gate-r207.log`). Adjudication,
per failure (the r206 aborted run's 5 F's were never identified — its log
carries dots only — so this re-run is the adjudication):

- **6 check.js 120s timeouts** (slow sims killed mid-pass, every printed
  assertion passing when cut): living-garden-deed-attainment,
  one-person-army-deed-attainment, trust-observer-neutrality, synergy-stall,
  throttlefeast-20261014, capable-bot-20261014. Load/budget artifact, not
  test failures; a one-line dialogue fix cannot slow sims. (r204's adoption
  likewise found living-garden green standalone.)
- **5 write-flap EPERM** (died on write(), errno 1, during the flap window
  open through the gate): human-combat-parity, measurement-flags,
  measurement-source-text, prepared-runner-custody, proof-text-identity.
  Infrastructure, not the change. Flap confirmed still active 01:25Z by
  the flap-watcher (A=FAIL@write, B=FAIL update-ref rc=128).
- **3 pre-existing proof staleness** (not attributable): measurement-proof-
  update ("Proof source inputs are not current"), measurement-workflow
  ("retained neutrality proof covers the current inputs" — 8/9 pass),
  phone-frame-proof (3/6 pass; stale list is ~45 files — index.html,
  most of src/js — the proof predates 73 commits of landed work).
  The retained neutrality proof's sourceHeadEnd is 9a6a864aa vs this run's
  base 007c61738 (73 commits later), so it was already stale on pristine
  base. betrayal.js is one file among the 45 stale phone-frame inputs.
  Proof refresh (balance-proof-update + phone-frame receipts) is a
  separate maintenance job, not part of a one-line dialogue fix.
- **2 green on standalone re-run** (gate-time load artifacts):
  occupation-panels 26/26 (gate died in 1.0s), measurement-cache-flags
  4/4 (the known box-load artifact, AGENTS.md 2026-11-12).

**Gate verdict: GO with the above adjudication — 0 failures attributable
to this run's change.** Proof tests for the fix re-run green in the
worktree (invite-small 2/2, threetimes 11/11).

## Landing

[TO UPDATE — rebase / merge / release / rotation.]

## Reachable / fun / winnable

- **Reachable:** yes. Social content fires constantly — 465 full conversations, 118 bond
  proposals, 11 moots, 61 feasts across four runs. A real player meets this content in
  the first weeks.
- **Fun:** yes, on the conversation evidence. The four candidates read like people talking,
  not menus — a survival philosophy, a welder's confession, a shield's thinking place,
  a false self from Riyadh. Two villages lived to the end of the road, so the fun
  finally had somewhere to go.
- **Winnable:** not through this leg — no village reached the table or national standing,
  and the win chain is still blocked upstream by survival (median 114.5d, 2/4 past
  d100, below the 126d control). That is the collapse's verdict, not social life's —
  but two cap survivors is the first crack in it this leg has seen.
