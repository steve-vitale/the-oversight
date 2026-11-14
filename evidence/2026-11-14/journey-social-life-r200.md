# Journey — social life, r200 (Lane B, leg 5) — 2026-11-14

Run `2026-11-14T09:56:30Z`, worktree `journey2-social`, branch `journey2-social`, base master `02e8de19c`.
Rotation-b read **5**, to write **6** at closeout. Lock: `playtest-loop-2.lock` (own, removed at closeout).

## Pre-registration (summary)

Full prereg: `evidence/2026-11-14/journey-social-life-r200-prereg.md`.
Seeds **44301–44304** (fresh; band checked clean against all prior preregs, reserved
44201–44204 and 43901–43904, used 44001–44004, forbidden 99201–99208; backup 44401–44404
clean). Driver/analyzer/helpers are r195 verbatim except seeds/OUTDIR/filenames
(`scripts/journey-social-life-r200-20261114.js`, `scripts/analyze-journey-social-r200-20261114.js`,
`scripts/journey-social-r200-helpers.js`); smoke passed (SEED=44301 DAYCAP=5: day 6 survived,
12 alive, 6 full convs / 6 natural ends, 1 bond proposal, no instrument errors).

Jobs: (A) continuity panel M1–M12; (B) CONFIRM r195's two fixes in the wild on fresh seeds
with the **revised bars from r195's metric review** (recap-empty <10 flags; door-requirement:
max "I've told you three times now" serves per sitting ≤1, 0 sittings with 2+, ≥1 exit line
served); (C) watches: HEED warn_you engagements + ask:village injured answers (first panel
with r130/r131 native), M2 combined bar, vendetta, moots. (D) NOT this run: r171 M2b
scholar-open proof (leg 4); measurement-proof refresh owed by sim-proofrefresh-b15.

Base movement since r195 (340c6679a → 02e8de19c, 130 commits): r195's own fixes now native
(favorreq spend-out + recap-empty 4-variant pool, 56655e81e); r131 HEED fix — warn_you engages
the want (63c051206); r130 ask:village injured answer (6ccdc325e); retribution narration
defer (855764c3b); rage re-press refusal (e73ee835d, combat only).

## Panel

All 4 seeds village-lost. **44301 d54, 44302 d139, 44303 d116, 44304 d64.** Median lived 90d.
Full convs 322 (35/102/114/71); natural ends 284; feasts 51 (7/19/16/9); moots 4 (2/1/0/1).
Fallen 54 (10/19/18/7). Causes: the wild 25, monsters 12, arena 3, strangers 3, sickness 3,
contests 2, thirst 2, wound_fever 1, betrayal 1, starvation 1. Death clusters: d49x3 (44301),
d116x3 (44303, final day). Successions 28 (4/9/10/5).
JSONs: `evidence/2026-11-14/journey-social-life-r200-{44301..44304}.json`;
panel log `.../journey-social-life-r200-panel.log`;
analysis `.../journey-social-life-r200-analysis.txt` (analyzer rc=0, no stderr).

Determinism: seed 44301 re-run with the r200 driver to a scratch dir is **byte-identical to
the panel JSON with the wall-clock `ms` field stripped** (r136 lesson applied).

## Binding verdicts

- **M1 arming motive — GO.** 5 plots armed, all 5 grievance-linked at arming (gT→L 44, 40,
  40.8, 51.2, 50.4). Grievance-holder → later leader: 2 (Kurt via voted_guilty→Patricia d10;
  Marcus via ambushed→Kurt d13). 0 plots after d30. Accomplices cold (motive 0, one 25
  ambition) while leaders hot. Note (instrument reading): 44302 plot_5's darkSnap shows
  gT→L=0 while its ARM event shows 40.8 — darkSnap grievance is snapshot-time, the grievance
  decayed after the plot expired d20; M1 correctly uses ARM (arming-time) values.
- **M2 villager-initiated bonds — ANSWERED (14th datapoint).** 66 proposals, ALL
  villager-initiated (scholar 0). Person 36 (accepted 15, refused 7, staged 12, expired 2);
  link 30 (accepted 13, staged 15, expired 2). Per-initiator max 9 (Samat, Omar) — below the
  combined bar of 20. Person-kind max 6 (Luis) — inside amendment-5 cap 8. End bonds
  40/65/66/72. Engine still records NO initiator on bond records (sample `{v,depth,day,dayGain}`
  + combat). Rate note: 66 vs r195's 160 — villages died earlier (median 90d vs 133d) AND the
  per-day rate fell (0.18/day vs 0.33/day). Direction reported, not judged a defect: M2 has no
  rate bar, and the panel's villages were smaller and shorter-lived. Consider a per-village-day
  rate metric for a future run (see metric review).
- **M3 invite refusal — (no bar; recorded).** NPC lures 130 accept / 108 decline; player party
  22 accept / 22 decline; NPC bond 6 accept / 7 decline. All lures NPC-invited, all party
  bearer-initiated (succession-proof split). Invitations sometimes taken, as ruled.
- **M4 sense — GO.** 316 transcripts, 91 near-dup flags, 4/4 candidates printed, all natural
  ends. Candidates (full transcripts in the analysis file):
  1. 44301 miguel_santos, D-talk-request, 9 turns — dockworker hands, theft confession
     ("I took 2× Stone"), ends "Go. But sit with what I said." / "Good talk." Weakest of the
     four: player side repeats "Yeah?" ×3 and the driver repeats a prompt twice; the NPC
     deflects honestly and the confession lands. Pass.
  2. 44302 ines_duarte, D-talk-request, 10 turns — dropped warning resurfaces ("We never
     finished talking about that warning"), deflection escalates to a confession of a different
     kind ("I don't actually want to belong somewhere. I want to leave and find somewhere
     better."), warm ending. Strong pass.
  3. 44303 sam_wilson, C-friendship, 10 turns — theft confession ("I took 2× Stone. I won't do
     it again."), the recap-empty 4-variant pool visible in the wild (3 distinct variants in one
     sitting), party invite, warm ending ("This was good."). Strong pass.
  4. 44304 brian_otieno, D-talk-request, 11 turns — dreams, stew-bowl grief ("Someone saved me
     the last of the stew once... I think about that bowl more than I think about the monsters"),
     the System text personalizing. Strong pass.
  React shape: agree 0 / joke 0 / silence 2191; longest continuer run 4 (< 5) — the 3-label
  pool suffices.
- **M5 census guardrail — REPORT-ONLY.** 2/4 past d100 (d139, d116); median 90d vs
  survival-control median 126d — **below control** this panel (r195 was above at 3/4, median
  133d). Floor (0/4 past d75) not triggered. Sequence: 2/4, 2/4, 1/4, 1/4, 1/4, 3/4 (r195),
  2/4 (r200). The r195 flicker up did not hold; the survival collapse remains the standing
  wall (owned by the bisect/transplant hunt, not this leg).
- **M6 gossip-position — GO** (re-aligned, radius-1). Gate-away 0/0/0/0; debates 145 kicked,
  144 settled. Strict on-tile away total 54 (46 burst + 8 settle) — the known metric/gate
  discrepancy; does NOT fail M6.
- **M7 dedupe — HOLDS.** 91 flags are all jaccard≥0.5 / same-opening pool-cycle or
  legitimate-variety kinds; no verbatim same-beat repeat in a fixed pool visible in the
  analyzer output. Door variants ("Move next to them…" / "You need to be right next to
  them…" / "Stand beside them first…" / "Get to their side…") are the 4-variant pool cycling
  by design; "We're going in circles — …" lines are the designed spend-out exit, counted
  under M12, not an M7 failure.
- **M8 counter-settle — SETTLED.** 1 settle (44304 d7, tribute 5000, pantry 17700, link formed),
  0 blocked re-raises, 0 fresh re-links after settle. proposeLink 13, counter 1, fresh 13.
  Thin (r195 had 4 settles) but meets the aligned definition: ≥1 link formed via settle +
  no blocked re-raise.
- **M9 recap cap — HOLDS.** maxPresses 3, total 297, 0 offered after cap, 0 cap failures.
- **M10 coach — HOLDS; M10b face-guard — HOLDS.** 0 coach verbatim, 0 face verbatim,
  panelMaxSameNarr 1, NARR near-dup flags 0.
- **M11 recap-empty — HOLDS (r195 fix CONFIRMED in the wild).** 0 recap-empty flags of 91
  (r195 confirm seed was 8 → 0; bar <10). The pool fix holds on fresh seeds, and candidate 3
  above shows three distinct empty-recap variants cycling in one sitting.
- **M12 door-requirement — CONFIRMED (r195 fix CONFIRMED in the wild).** Counted directly
  from the per-seed JSON transcripts (the analyzer does not print "three times" counts):
  "I've told you three times now" served 23 times panel-wide, worst per sitting **1**, **0
  sittings with 2+**; "We're going in circles" exit lines served **91** (≥1 required). Worst
  sitting maxDoorServes 9 (44303 amina_diallo, D-talk-request, 10 turns) — within the designed
  ceiling of 9 (4 bare + 3 reframes + escalation + exit) per r195's metric review. Door-req
  flags 38/91 (42%) vs r189's 86/143 (60%) and r195's 107/185 (58%) — direction down,
  consistent with the spend-out freeing the driver to ask other things.
- **B2 double-confession — HOLDS (7th re-confirmation).** 10 sittings with a confession,
  0 double, 10 single.
- **Q11 scattering — CONFIRMED.** All 4 seeds record scattered/hungryDays/aliveEnd. Scattered
  2/4 (44301: 5 alive, 5 hungryDays; 44304: 8 alive, 3 hungryDays).

## Watches

- **HEED warn_you (r131): not confirmed by text grep.** The warning thread resurfaces (2
  lines, Ines d+2: "We never finished talking about that warning"), which is the open-thread
  ledger working, but no direct warn_you engagement line was identified in 316 transcripts.
  Inconclusive, not a failure — watch for a future panel with a dedicated instrument.
- **ask:village injured (r130): not observed.** 0 lines mentioning "injur" in 316 transcripts —
  the path (an injured villager being asked about) simply wasn't hit this panel. Not a failure.
- **Moots:** 4 total (2/1/0/1) — trigger alive; 44303 had 0 moots but the panel total is 4,
  so no investigation per prereg.
- **Re-offer furniture-free max 12** (worst C-friendship gen_tmpdcqe: recap 10, dlg:subject 10,
  leave 12) — same order as r189/r195 (12/11). Document as watch; no escalation past 12.
- **Dropped threads:** 9 drops, 8 resurfaced next sitting (1 none: gen_k3rqq1u — no later
  conversation, villager died / village ended). No dropped promise seen. Ledger works.
- **Vendetta:** maxUnordered 3 (Kurt↔Marcus), below the 8 bar.
- **Expired plots:** 2 (44302 plot_5 d20, 1 line naming the pair after; 44303 plot_1 d11, 4 lines
  after — the 44303 lines are plot_2's spring lines, same pair, not the expired plot; the
  44302 line is the same pair's later activity. Consistent with the r132 by-design silence for
  expired plots; no contradiction found.

## Village assessment (plain words)

Four villages, four losses — none reached the table, none reached national standing. The
pattern is the same one the survival collapse names: villages die fighting, not hungry.

- **44301 (54 days, scattered, 5 alive at the end).** Chen held the mantle first, then Roman,
  Evelyn, Catalina, Sari — four successions in eight days (d43–d50), three people dead on day
  49 alone, the village scattering with five left and no food in the pantry. What lived: a
  pharmacist (Raj), a mason, a bus driver, a programmer — people with real jobs and some
  trust (Raj 58, Bala 55), but no food and no leader left standing long enough to use it.
  Miguel's theft confession (candidate 1) is the human note: a man admitting he stole stone
  and being forgiven for it, days before the village fell apart.
- **44302 (139 days, 0 alive).** The long run. Patricia's village lasted nearly five months:
  19 feasts, 102 full conversations, 9 successions, the mantle passing Patricia→Samat→Mia→
  Yara→Marcus→Enzo→Ines→Dieter→Haibo→Mariángel. Kurt and Marcus armed plots against each
  other in the first fortnight (the M1 story), Ines wanted to leave and find somewhere better
  (candidate 2). Then the monsters came in waves — 7 monster deaths — and the last bearer died
  on day 138 with the pantry at 1000 kcal. The village knew a lot (74 codex plants) and still
  died.
- **44303 (116 days, 0 alive).** Carmine's village: 114 full conversations, 16 feasts, 26 cries
  (the most distressed of the four), 10 successions. Abdulmajeed and Luis armed against each
  other twice. Ethan was killed by betrayal on day 100; Amina died in a contest on day 101;
  three people died on the final day. Sam's theft confession (candidate 3) and the party that
  formed around him show the social life working — the village talked, bonded, feasted, and
  still lost everyone.
- **44304 (64 days, scattered, 8 alive at the end).** Karen's village, the warmest: at the end
  five people sit at trust 90, friendly — Mebrahtu the hunting guide, Luis the mason, Sari,
  Lena the ER nurse, Devon. Brian's stew-bowl grief (candidate 4) is the clearest single
  moment in the panel: a man who remembers who saved him the last of the stew. But the wild
  took Karen, Otto, Hayden, Omar, Brian — five of seven deaths — and Sam starved on day 64
  with the pantry empty. Trust 90 and an empty pantry is still a dead village.

What is missing, across all four: food that lasts, and killers who live long enough to bank a
second wave-4 kill. The villages talk, bond, feast, forgive theft, grieve over stew — the
social life is real. The survival chain underneath it is not yet holding. That is the
standing collapse, not a social-life defect, and this leg does not own the fix.

## People check

Read the four M4 candidates in full (see verdicts above). They act like people: they want
things (a trade, a way out, forgiveness, a remembered kindness), they deflect and confess,
they end conversations with warmth or a debt owed. The driver still repeats itself
("Yeah?" ×3, a prompt twice) and one NPC loses his train of thought mid-conversation — both
driver-side roughness, not game defects. The recap-empty pool fix is visible in the wild
(candidate 3: three distinct variants). The dropped-thread ledger works (Ines's warning
resurfaces two days later). No fabricated shared history, no filler loops, no static menus in
the sampled transcripts.

## Blanks filled

**None — measurement only.** Both r195 fixes are confirmed in the wild on fresh seeds
(M11, M12), every other metric holds or is answered, and no new defect surfaced that names a
fix. No src/js change this run; the commit is tooling + evidence only.

## Reachable / fun / winnable

- **Reachable:** yes. Social content fires constantly — 322 full conversations, 66 bond
  proposals, 4 moots, 51 feasts across four short runs. A real player meets this content in
  the first weeks.
- **Fun:** yes, on the conversation evidence. The four candidates read like people talking,
  not menus — confessions, grief, a woman who wants to leave, a man who remembers stew.
- **Winnable:** not through this leg — no village reached the table or national standing, and
  the win chain is still blocked upstream by survival (median 90d, 2/4 past d100, below the
  126d control). That is the collapse's verdict, not social life's.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`, started 10:17Z:
**331 passed, 9 failed in 655s.** Adjudication (all 9 pre-existing / flap / load — **0
attributable**; this run changes no src/js):

- measurement-flags, measurement-source-text — crashed at startup on host write EPERM
  (`errno: -1, code: 'EPERM', syscall: 'write'`, 0.3s/3.4s). Flap-watch shows 3 FAIL cycles
  during the gate window. **Standalone re-runs now: 5/5 and 4/4 PASS.**
- test-occupation-panels — 0.8s in-gate fail ("real CLI workflow completed"). **Standalone:
  25/25 PASS.**
- test-measurement-cache-flags — 15.8s in-gate fail. Per the 2026-11-12 lesson, cache-flags
  scores track box load, not the change under test. **Standalone: 4/4 PASS.**
- test-living-garden-deed-attainment, test-one-person-army-deed-attainment — exact-120s load
  timeouts in-gate (same class as r195's four). Standalone re-runs with 400s budgets were
  started in parallel during closeout; results: [TO UPDATE — see landing section].
- test-measurement-proof-update ("Proof source inputs are not current") + test-measurement-
  workflow ("retained neutrality proof covers the current Game/controller/harness inputs") —
  pre-existing measurement staleness, owned by sim-proofrefresh-b15 (proof refresh rounds 12+
  owed; r195's changes also unrefreshed). Report only.
- test-phone-frame-proof — stale phone receipt (index.html), pre-existing. Report only.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/social.json --current
'evidence/2026-11-14/journey-social-life-r200-*.json' --metrics l3.bonds,l3.deepBonds,
l3.betrayalCases,l3.mootsConvened,l3.gossipConvos` — exactly the 5 expected LOUD
"disappeared" lines (baseline 318/168/8/7/99 → 0, n=4 files): the known explained schema
drift (the social driver never emits l3.* fields; the leg's real bond/moot/gossip numbers
live in the per-seed JSONs, e.g. 66 bond proposals, 4 moots, 322 full convs). Baseline NOT
rolled on a single 4-seed panel.

## Metric review

- **M12 revised bar works.** Counting "three times" serves and exits directly from transcripts
  (not maxDoorServes) gives a clean, falsifiable confirmation: 23 serves, worst 1/sitting,
  0 with 2+, 91 exits. Keep the revised bar; the analyzer should print these counts natively
  next run so the confirmation doesn't need a hand script.
- **M2 bond rate:** proposals fell from 160 (r195) to 66, and the per-day rate from 0.33 to
  0.18. M2 has no rate bar, so this is not a verdict — but if the rate keeps falling while
  villages live as long, it becomes a question. Propose for r201: record proposals per
  village-day as a watch metric (no bar) and check whether it tracks roster size or warmth
  windows.
- **M5:** the r195 flicker above control did not hold (2/4, median 90d vs control 126d). No
  metric change — M5 is report-only and the collapse is owned elsewhere.
- **Door-req flag rate** fell 60% → 58% → 42% across r189/r195/r200. The spend-out fix is
  doing what it was meant to do (freeing the driver from the door). No bar change.

## Landing (adoption, Loop B r201, 2026-11-14)

- **Branch rebased onto master b2b50c2cd** (sim-proofrefresh-b15 adoption landed
  mid-adoption; first rebase target 2042cb96c superseded). The live `git rebase`
  crawled >14 min under box load (load avg ~19) and was killed after a runtime
  restart left a stale index.lock; the rebase was completed via plumbing
  (private-index `read-tree` + `commit-tree`, verified: diff vs master =
  exactly the 13 r200 files, diff vs old tip = exactly the 19 master-move
  files, all 13 blobs byte-identical). Rebased commit **26bcf8802** (parent
  b2b50c2cd, same message, author date preserved).
- **Deed-test re-runs** (standalone, main tree, master = tip's src/js exactly):
  test-one-person-army-deed-attainment **7 passed, 0 failed** (exit 0, 316s);
  test-living-garden-deed-attainment **rc=124 at 500s** (13/16 seeds printed,
  assertions never reached) — inconclusive, same load class as the r195/r200
  in-gate 120s timeouts, not an assertion failure. The r200 gate's other 7
  failures were already adjudicated 0-attributable in the gate section above.
- **Merge:** [TO UPDATE — ff-merge result, HEAD after merge.]
- **Release:** [TO UPDATE — worktree-release result.]
- Rotation-b: 5 → 6 written by r200; this adoption does not move it (crisis
  r201 writes 6 → 7 at its closeout).

