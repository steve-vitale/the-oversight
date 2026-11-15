# Journey — social life, r215 (Lane B, leg 5) — 2026-11-15

Run `2026-11-15T19:55:35Z`, worktree `journey2-5`, branch `journey2-5`, base master `e6f239a8c`.
Rotation-b read **5**, to write **6** at closeout. Lock: `playtest-loop-2.lock` (own, removed at closeout).

## Pre-registration (summary)

Full prereg: `evidence/2026-11-15/journey-social-life-r215-prereg.md`.
Seeds **44701–44704** (fresh; band checked clean against all prior preregs, reserved
44201–44204 / 43901–43904 / 44401–44404 / 44601–44604, used 44001–44004 / 44301–44304 /
44501–44504, forbidden 99201–99208; backup 44801–44804 clean). Driver/analyzer/helpers are
r206 verbatim except seeds/OUTDIR/filenames
(`scripts/journey-social-life-r215-20261115.js`, `scripts/analyze-journey-social-r215-20261115.js`,
`scripts/journey-social-r215-helpers.js`); smoke passed (SEED=44701 DAYCAP=5: day 5 survived,
12 alive, JSON written, 0 instrument errors). Carried proof tests green in-tree before the
panel (threetimes 11/11, invite-small 2/2).

Jobs: (A) continuity panel M1–M12; (B) RE-CONFIRM r195's two fixes in the wild on fresh seeds
with the revised bars, now counted natively (fourth panel); (C) watches: VENDETTA DECISION
POINT (r206 max 7, bar 8), M1 hot-accomplice re-read, ask:village injured (third panel),
HEED warn_you recurrence, M2 combined bar + rate watch, re-offer max, dropped threads,
moots. (D) NOT this run: r171 M2b scholar-open proof (leg 4); measurement-proof refresh
(sim-proofrefresh-b18); courtship-rework-b BFS pathfinding fix (courtship follow-up arm;
confirm band 100621–100636 stays fresh).

Base movement since r206 (007c61738 → e6f239a8c): r214 plain parting pool for
neutral/friendly sittings (convo-mood.js); r211 sysSay doubled-quote fix + quoteWrap
follow-up (7 sites); r208 lapsed-want thread names the live favor; r209 deferred-ask
ledger guard + favor-block noBeat; FUNERALMEND default ON; lingerer guard recovered
(gorgeprice2-b); r129 terrain-pocket fix. First social panel with all of them native.

## Panel

**44701 d142 SURVIVED (6 alive), 44702 d68 village-lost (scattered, 2 alive),
44703 d140 SURVIVED (10 alive), 44704 d140 SURVIVED (6 alive).** Median lived 140d.
Full convs 517 (107/89/162/159); natural ends 430; feasts 69 (20/9/20/20); moots 7 (1/3/1/2).
Fallen 46 (8/16/9/13). Causes: the wild 11, monster 9, a stranger 9, starvation 7,
sickness 5, contest 4, wound 2, betrayal 1, ambush 1, The Reunion 1, the night 1.
Successions 19 (2/5/4/8).
JSONs: `evidence/2026-11-15/journey-social-life-r215-{44701..44704}.json`;
panel log `.../journey-social-life-r215-panel.log`;
analysis `.../journey-social-life-r215-analysis.txt` (analyzer rc=0, no stderr).
Panel ran 20:08–20:10Z, ~30s/seed (light load; r206: ~3 min/seed under load avg ~18).

**Best social panel yet on survival: 3/4 past d100, median 140d — above the 126d
survival control for the first time this leg.** The survival floor held three times;
the one village that died (44702) starved with an empty pantry after sickness took
four. Reported, not claimed as a fix — 4 seeds, and the collapse hunt owns the
underlying question.

## Binding verdicts

- **M1 arming motive — GO.** 6 plots armed, all 6 grievance-linked at arming
  (every ARM event carries "grievance" in its motive reasons; the Luis→Samuel
  arms carry gT→L up to 100). Grievance-holder → later leader: 3 cases (all
  Luis on 44704, from the d9 ambush grievance). ACCOMPLICES COLD AGAIN:
  every accomplice motive is 0 or 25 ambition with grievance 0 — the r206
  hot-accomplice datapoint (Adaeze 66/88) did NOT recur. Pattern stands as
  "accomplices usually cold" with r206 as the single hot exception; see
  metric review.
- **M2 villager-initiated bonds — ANSWERED (16th datapoint).** 115 proposals, ALL
  villager-initiated (scholar 0). Person 57 (accepted 17, refused 10, staged 20,
  expired 10); link 58 (accepted 17, staged 29, expired 12). Per-initiator max 16
  (Nadia, 44704) — below the combined bar of 20. Person-kind max 8 (Rafael) —
  exactly AT the amendment-5 cap 8, not over. End bonds 60/71/95/136. Engine still
  records NO initiator on bond records.
- **M2 rate watch (native): 0.235/day** (115 proposals / 490 lived days) —
  between r200 (0.177) and r206 (0.268). The rate keeps tracking village
  longevity (the three surviving villages contribute 97 of 115 proposals).
  Watch only, no bar.
- **M3 invite refusal — (no bar; recorded).** NPC lures 425 accept / 419 decline;
  player party 21 accept / 28 decline; NPC bond 7 accept / 10 decline. All lures
  NPC-invited, all party bearer-initiated (succession-proof split). Invitations
  sometimes taken, as ruled.
- **M4 sense — GO.** 501 transcripts, 202 near-dup flags, 4/4 candidates printed, all natural
  ends. Candidates (full transcripts in the analysis file):
  1. 44701 gen_kcmtkh8, C-friendship, 11 turns — a food favor ("I haven't eaten
     right in days") that spends 8 turns on the Haven-door requirement: the player
     asks "Why can't I do this now?" 8 times and the NPC cycles 4 door variants
     with "As I said / Like I said / Still the same thing" prefixes until the
     spend-out fires ("I've told you three times now"), then the conversation ends
     warmly ("This was good." They mean it.). Pass on the whole — the want is real,
     the requirement is real, the spend-out works — but the 8-turn requirement loop
     is the M12 cluster's cost, driver-amplified (a real player stops asking after
     2–3). See metric review; not a new defect.
  2. 44702 gen_e2x7z70, D-talk-request — a dropped-thread resurface ("We never
     finished talking about that personal stuff — we wandered off it, 2 days back"),
     then grief ("We lost Nina, Theo and Omar. I do the headcount without thinking.
     Then I think."), then hope for a missing person ("I hope they're somewhere warm.
     That's all I've got."). Strong pass. One blemish: the resurface line carries a
     narration fragment inside its quotes ("'Their voice loosens. The guardedness
     thins.'") — a voice-boundary wart, polish only.
  3. 44703 pavel_dubinin, C-friendship, 11 turns — "Do you still count the days?
     I lost track days ago." / "I count meals, not days. Three meals since the rain."
     / "Have you felt it? Like the air before a storm, but — bigger. Something's on
     its way." Strong pass. One oddity: "And... scene. Good talk." — "scene" reads
     like a stage direction leaking into speech; polish only.
  4. 44704 nadia_khoury, C-friendship, 11 turns — opens with two NPC lines stacked
     (a personal question, then "Come see what I found"), a mid-conversation
     ⚖️ VOTE: GUILTY (moot residue surfacing inside a friendship sitting), ends
     warmly ("Good talk. I feel like I know you a little better now."). Pass.
     The double-opener is a minor stacking oddity; the vote inside a normal talk
     is the moot system reaching into conversation, not a defect.
  React shape: agree 0 / joke 0 / silence 3624; longest continuer run 4 (< 5) — the
  3-label pool suffices. moreOffered 0 on goal threads this panel.
- **M5 census guardrail — REPORT-ONLY.** 3/4 past d100 (d142, d140, d140); median
  140d vs survival-control median 126d — ABOVE control, the first social panel to
  beat it. Floor (0/4 past d75) not triggered. Sequence: 2/4, 2/4, 1/4, 1/4, 1/4,
  3/4 (r195), 2/4 (r200), 2/4 (r206), 3/4 (r215).
- **M6 gossip-position — GO** (re-aligned, radius-1). Gate-away 0/0/0/0; debates 168 kicked,
  166 settled. Strict on-tile away total 57 — the known metric/gate discrepancy; does
  NOT fail M6.
- **M7 dedupe — HOLDS.** All 202 flags are jaccard≥0.5 or same-opening pool-cycle
  or legitimate-variety kinds; no verbatim same-beat repeat in a fixed pool visible
  in the analyzer output, and no new double-served scene line in one sitting (the
  r206 class — the 44701 candidate's 8 door lines are 4 variants + prefixes, i.e.
  pool-cycle, not verbatim). The M7 scan's blind spot is unchanged (documented
  r206); nothing new tripped it.
- **M8 counter-settle — SETTLED.** 3 settles (44701 ×2, 44703 ×1), all link-formed,
  0 blocked re-raises, 0 fresh re-links after a settle. proposeLink 17, counter 3,
  fresh 17. The r201 favor-want settle gate shows no adverse movement (3 settles
  vs r206's 1 — panel variance, same direction as r200's 1).
- **M9 recap cap — HOLDS.** maxPresses 3 per seed, total 662, 0 offered after cap,
  0 cap failures.
- **M10 coach — HOLDS; M10b face-guard — HOLDS.** 0 coach verbatim, 0 face verbatim,
  panelMaxSameNarr 1, NARR near-dup flags 0.
- **M11 recap-empty — HOLDS (r195 fix CONFIRMED in the wild, fourth panel).** 0 recap-empty
  flags of 202 (r195: 0; r200: 0; r206: 0; r215: 0).
- **M12 door-requirement — CONFIRMED (r195 fix CONFIRMED in the wild, fourth panel,
  counted natively).** M12-native: "I've told you three times now" served 58
  times panel-wide (9/15/22/12 per seed), worst per sitting **1**, **0 sittings with
  2+**; "We're going in circles" exit lines served **251** (≥1 required). Worst
  sitting maxDoorServes 8 (44701 gen_kcmtkh8, 11 turns) — within the designed
  ceiling of 9. Door-req flags 96/202 (47.5%) vs r206's 58%, r200's 42%, r195's
  58% — the flag rate tracks panel size, not the fix.
- **B2 double-confession — HOLDS (9th re-confirmation).** 6 sittings with a confession,
  0 double, 6 single.
- **Q11 scattering — CONFIRMED.** All 4 seeds record scattered/hungryDays/aliveEnd.
  Scattered 1/4 (44702: 2 alive, 5 hungryDays).

## Watches

- **HEED warn_you (r131): CONFIRMED in the wild — second panel.** 4 NPC warn lines:
  44702 ×2 ("About that warning — I keep turning it over. Not that it matters." +
  a resurface "We never finished talking about that warning — we got cut off."),
  44703 ×1 (resurface), 44704 ×1 ("About that warning — I keep turning it over.").
  The engagement form recurs (r206: 5 lines; r215: 4 lines).
- **ask:village injured (r130): not observed — third panel.** 0 lines mentioning
  "injur" in 501 transcripts. Per the prereg, the watch is RETIRED as unhittable
  in this driver's path — the path (an injured villager being asked about) never
  fires through the journey-social driver. Recorded, not failed.
- **r214 plain parting pool: CONFIRMED in the wild — first panel.** 123 serves
  panel-wide (26/27/43/27 per seed), all three variants present ("See you around."
  43, "Take care out there." 37, "Same time tomorrow, maybe." 43). The ending-line
  distribution shows no bare endings: the top closers are all spoken ("They're
  smiling as you go. 'Come back anytime.'" 179, "'This was good.' They mean it."
  152, the three partings 123). The Marta-class bare ending does not reproduce.
- **r208 lapsed-want naming: HOLDS in resurfaces.** The 17 dropped threads all
  resurface next sitting, and the resurfaces name the live favor/topic ("We never
  finished talking about that food share", "wanting to be remembered", "that
  personal stuff", the creek water run, the pantry run). One garbled resurface:
  "We never finished talking about that visit — we got cut off. 'Between us — We
  started on that visit, then got onto that visit.'" (44702, gen_e2x7z70) — the
  quoted fragment repeats "that visit" twice; polish only.
- **Moots:** 7 total (1/3/1/2) — trigger alive; no investigation per prereg.
- **Re-offer furniture-free max 11** (panelMax 12, panelMaxFurnitureFree 11) — same
  order as r189/r195/r200/r206 (12/11/12/12). Document as watch; no escalation.
- **Dropped threads:** 17 drops, ALL 17 resurfaced next sitting, 0 none (r206 had
  4 with no later conversation). No dropped promise seen. Ledger works. Every
  drop this panel follows the same shape — the player asks an open question
  ("I owe you. Let me make it right — what do you need?" / "What do you want to
  know? Ask me anything.") and the NPC loses the thread — the resurface is the
  mechanism working, not a failure.
- **Vendetta:** maxUnordered 4 (Luis↔Samuel, d8–d38, 4 arms: Luis→Samuel ×3,
  Samuel→Luis ×1; plot_3 sprung hurt, plot_6 sprung escaped, plot_5/plot_8
  expired). Below the 8 bar for the second panel running (r206: 7, r215: 4) —
  the DECISION POINT does NOT fire; the grievance-loop cooling-off stays a
  watch, not a design-look job. See metric review (the bar itself is now the
  question).
- **Expired plots:** 2 (44704 plot_5 d15, plot_8 d43), 43/42 lines naming the
  pair after expiry — the same pair's later activity (new plots plot_6 d33,
  plot_8 d38), consistent with the r132 by-design silence for expired plots;
  no contradiction found.
- **FUNERALMEND:** no funeral-adjacent conversation lines surfaced in the
  sampled transcripts or the M4 flags; no funeral signal in the corpus greps.
  Reported as unobserved, not as absent — the driver does not instrument it.

## Village assessment (plain words)

Four villages — three lived to the end of the road, one starved. The first
social panel where three survived, and the first to beat the survival control.

- **44701 (142 days, SURVIVED, 6 alive).** Nathan's village, carried by two
  bearers after him (Jorge, then Naran). Eight fell — monsters took four, a
  stranger two, and Nathan himself fell to betrayal on day 66 (Joseph's plot,
  sprung day 9 as an escaped ambush, still cost the bearer two months later).
  What lived: Leah (interpreter, trust 92), Danna (rail conductor, 90), Hannah
  (chef, 91, six abilities), Dale (rail conductor, 90) — warm, able people with
  11,726 kcal in the pantry and 37 codex plants. Zuri proposed 9 bonds here,
  more than anyone on the panel except Nadia.
- **44702 (68 days, scattered, 2 alive).** Heidi's village: five bearers in
  thirty-two days (Heidi → Scarlett → Nina → Yara → Sari → Zoltan), sickness
  taking four, then six starved in five days (d60–65) and the village scattered
  with the pantry at 0. What lived: Zoltan (mushroom grower, 62) and Francesca
  (interpreter, 20) — two people and no food. The social life was real here
  too (89 conversations, the grief transcript lives here), but the floor fell
  out from under it.
- **44703 (140 days, SURVIVED, 10 alive).** Marvin's village: the long run that
  held with the most people standing. Nine fell, but Karlygash (line cook, 79),
  Wakene (dentist, 97, six abilities), Pavel (pilot, 99, six abilities), Raj
  (pharmacist, 91) and six more were still standing at day 140 with 5,408 kcal
  and 77 codex plants. Pavel counts meals, not days ("Three meals since the
  rain"), and Raj keeps proposing bonds. The village that lived is the village
  that kept its food and its pharmacist.
- **44704 (140 days, SURVIVED, 6 alive).** Ashley's village: the hardest road of
  the four — thirteen fell, seven bearers carried the mantle, Wei died to an
  ambush on day 6 and Aki to the Reunion on day 47. The Luis↔Samuel vendetta
  burned through the first month (four plots armed between them). What lived:
  Samuel (dispatcher, 46 — the vendetta's target, still standing), Lucas (40),
  Darius (49), Rafael (fisher, 40 — 8 person-bond proposals), Andre (70, the
  final bearer) and Farid (50), with 5,150 kcal and 71 codex plants. Nadia
  proposed 16 bonds here, the closest anyone has come to the 20 combined bar.

What is missing, across all four: the village that died still died with an
empty pantry and nobody left who could hunt or kill well enough to refill it
— sickness first, then hunger. The three that lived had food, warm able
people, and a pharmacist or a healer's hands nearby. The social life is real
in all four — and this time the survival floor underneath it held three times,
not twice.

## People check

Read the four M4 candidates in full (see verdicts above). They act like people:
they want things (food when hungry, to be heard about how they survive, to be
remembered, to count the days for someone), they deflect and confess, they end
conversations with warmth or a debt owed. The r214 parting pool is audible in
the wild (123 plain partings). The dropped-thread ledger works (17/17
resurfaced, naming the live favor). The warn_you engagement shows for the
second panel. The driver still repeats itself ("I'm listening", "All right.
Let's go.", "Wait — what were we talking about?" — the 44701 candidate asks
the same question 8 times) and two transcripts carry small voice-boundary
warts (a narration fragment inside quotes; "And... scene."). No fabricated
shared history, no filler loops, no static menus in the sampled transcripts.

## Blanks filled

- FILLED (tooling): none new this run — the r206 instruments (M12-native,
  M2 rate watch) carried verbatim and printed natively; no new instrument
  was needed.
- DOCUMENTED (watch): vendetta maxUnordered 4 — second panel below the 8 bar;
  the bar itself is now the question (see metric review).
- DOCUMENTED (watch): Nadia 16 combined proposals / Rafael 8 person proposals —
  closest approach yet to the M2 combined bar (20) and exactly at the
  amendment-5 person-kind cap (8); the next panel decides whether either
  becomes a design-look job.
- DOCUMENTED (polish): two voice-boundary warts (narration fragment inside a
  resurface quote; "And... scene.") + one garbled resurface fragment ("started
  on that visit, then got onto that visit") — recorded for a future
  conversation-polish pass, not fixed here (no proof test, no game change
  this run; the warts are single-line text, not a behavior defect).
- DOCUMENTED (watch): the 44701 8-turn door-requirement loop — the M12 cluster's
  cost when the player keeps asking; driver-amplified, spend-out works.

## Interesting (not pre-registered)

- 3/4 cap survivors and a 140d median ABOVE the 126d control is the headline
  (see Panel). The survival-collapse hunt owns the underlying question; this
  leg reports it.
- M2 rate 0.235/day sits between r200 (0.177) and r206 (0.268) — the rate
  keeps tracking village longevity (the three surviving villages contribute
  97/115 proposals), not a social change.
- All 17 dropped threads resurfaced (r206: 13/17) — the ledger's best panel.
- 44702's d64 death cluster (3 in one day: Ava, Priya, Jean — all starvation)
  is the collapse in miniature: sickness thins the village, hunger finishes it.
- The r214 parting pool (123 serves) and the r208 lapsed-want naming both show
  in the wild on their first social panel — two recent conversation fixes
  confirmed by the same corpus.

## Metric review

- **M12-native + M11 keep confirming.** Fourth panel, same bars, same result
  (58 serves, worst 1/sitting, 0 with 2+, 251 exits; 0 recap-empty flags).
  The confirmations are now routine — the next run may fold them into the
  continuity read without a separate job-B section, but the bars stay.
- **M2 rate watch keeps tracking longevity, not social change.** 0.235/day
  between r200 and r206. Keep as watch-only; the per-roster-size
  normalization question from r206 stands (longer-lived villages propose
  more because more villagers live longer — the rate is a survival proxy
  as much as a social one).
- **M1 cold-accomplice pattern: r206 was the exception, not the turn.**
  r200 cold, r206 hot (Adaeze 66/88), r215 cold again (all accomplices
  grievance 0). The pattern description stays "accomplices usually cold"
  and the r206 datapoint stays recorded as the single hot case. No bar
  change; the watch continues.
- **Vendetta bar review (pre-registered).** Two panels below 8 (7, then 4)
  with the pair dynamics otherwise healthy (plots arm, springs fire,
  grievances carry across plots — Luis held his d9 ambush grievance
  through three later plots). The 8 bar has never fired in any social
  panel. Proposal for the NEXT run: keep the bar at 8 for one more panel
  as the design-look trigger, but add a secondary read — if the next
  panel also stays ≤7, retire the 8 bar as unhittable-in-practice and
  replace it with a watch on maxUnordered trend (7, 4, …) rather than a
  threshold. Not re-scored here; the decision point did not fire.
- **M7 scan blind spot unchanged.** No new double-served scene line in
  one sitting this panel, so the r206 proposal (an exact-repeat count
  alongside the near-dup flags) stays proposed, not built. The fix, not
  the instrument, remains this run's job — and there was no fix to make.
- **Injured-ask watch RETIRED.** 0 lines in r200, r206, and r215 (501
  transcripts this panel). The path never fires through the journey-social
  driver. If a future driver walks an injured villager into a talk, the
  watch can be revived; until then it is closed, not failed.
- **M5:** no metric change — M5 is report-only and the collapse is owned
  elsewhere. The 3/4 cap survivors and 140d median are reported, not
  claimed. This is the first social panel with a median above the 126d
  control — worth naming in the next executive update as a crack in the
  collapse, not a verdict.

## Telemetry deviation check

The r215 telemetry-check log shows the same 5 LOUD "disappeared" lines as
r206 (l3.bonds 318→0, l3.deepBonds 168→0, l3.betrayalCases 8→0,
l3.mootsConvened 7→0, l3.gossipConvos 99→0, n=4 files). Investigated in
r206 and EXPLAINED — schema drift, not a bug: the baseline
`hidden_files/telemetry-baselines/social.json` carries only l3.* keys
from a stale-era collector, while the r215 panel JSONs carry NO l3.* keys
(top-level schema is seed/manifest/days/social/trustTbl/bondSnaps/... with
`social` = fullConvs/naturalEnds/feasts/moots/transcripts). Moots, bonds
and betrayals ARE present in the corpus under the new schema (7 moots, 115
proposals, 6 plots armed) — the checker looked up keys the corpus never
had. Baseline NOT rolled. Rolling would write current-schema values under
stale keys; the correct next step remains a re-seed with a metric mapping
for the current social schema, a future-run job — not a same-run
roll-forward.

## Gate

`node scripts/check.js --quick --timeout 300 --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree — **334 passed, 6 failed in 928s** (log
`evidence/2026-11-15/journey-social-life-r215-gate.log`). Adjudication,
per failure:

- **1 gate-time timeout, GREEN standalone** (load/budget artifact):
  living-garden-deed-attainment (killed at the 300s cap in the 4-parallel
  gate; re-ran standalone in 155s, RC 0). One-person-army passed in-gate
  at 246s; trust-observer-neutrality passed at 109s. This run changed no
  src/js, so nothing in the run can slow sims.
- **3 pre-existing proof staleness** (not attributable — identical
  failures adjudicated on the same base lineage in r206/r211a3/r213/r214):
  measurement-proof-update ("Proof source inputs are not current"),
  measurement-workflow (8/9 pass; "retained neutrality proof covers the
  current inputs"), phone-frame-proof (3/6 pass; stale receipt list —
  index.html and most of src/js among the inputs). Proof refresh is a
  separate maintenance job, not part of a scripts+evidence-only run.
- **2 known substrate failures** (identical in r211a3/r213 gates):
  ladder-bundle ambient-raid control (200 monster turns fire 0 raids —
  the lingerer-guard suppression r213 adjudicated as substrate), and
  person-trust HAUL:3 vs 0 (the r214 parting-pool RNG-shift drift
  r213 named). Both pre-date this run; this run touches neither
  mechanism and no src/js at all.

**Gate verdict: GO — 0 failures attributable to this run's change.**
Proof tests for the carried instruments re-run green in the worktree
(threetimes 11/11, invite-small 2/2).

## Landing

[LANDING]

## Reachable / fun / winnable

- **Reachable:** yes. Social content fires constantly — 517 full conversations, 115 bond
  proposals, 7 moots, 69 feasts across four runs. A real player meets this content in
  the first weeks.
- **Fun:** yes, on the conversation evidence. The four candidates read like people talking,
  not menus — a hungry villager asking for food, grief over the lost counted by headcount,
  a pilot who counts meals not days, a woman asking whether the player found another way
  to say what needed saying. Three villages lived to the end of the road, so the fun
  finally had somewhere to go — and the partings sound like people leaving, not menus
  closing.
- **Winnable:** not through this leg — no village reached the table or national standing,
  and the win chain is still blocked upstream by survival (median 140d, 3/4 past
  d100, above the 126d control for the first time). That is the collapse's verdict,
  not social life's — but three cap survivors and a median above control is the
  first crack in it this leg has seen.
