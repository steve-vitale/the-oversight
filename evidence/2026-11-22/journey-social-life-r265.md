# Journey social life r265 — RUN NOTE (Lane B, 2026-11-22)

Run ID `playtest-loop-2-20261122T0055Z`. Lane B occurrence 19:00 CST
Nov 21, 2026. Rotation-b 5 (social life); this run plays 5, closeout
writes 6. Base at run start: master `a8c2c201c` (endgame r264 adoption
merge). Prereg:
`evidence/2026-11-22/journey-social-life-r265-prereg.md`. Panel +
analysis + determinism complete in-occurrence; gate goes to adoption
(r261 precedent).

## Headline

- **Arm A (OUTING drop-reason diagnosis) — WATCH PASSES, re-tune
  CLOSED as a chain problem:** conversion **38.1%** (8 kept / 21
  attempts; watch ≥25%) — the first pass in six panels. The
  diagnosis: drops concentrate in **blocked-forage (8 of 13
  non-kept)**, all 8 on one struggling seed (45804, days 50–52),
  where the pair pressed together repeatedly on bare ground and
  the patch gave nothing (one ended pack-full). When the forage
  step yields, the chain completes — 8/8 kept. The pass is driven
  by attempt volume falling (56 → 21) while kept held flat (8 vs
  7), and attempt volume is seed-volatile (0–15 per seed; 45802
  had zero attempts in 135 days). No chain re-tune is owed on this
  evidence; the live question is foraging yield on bare ground,
  which belongs to the food side, not the outing chain.
- **Arm B (F5 V3) — ZERO, now proven honest on both pools:**
  F5 V1=0 V2=0 V3=0 AND F5W (widened cores, both pools) V1=0 V2=0
  V3=0. Seventh panel with V3 unserved. The settled-favor re-ask
  path itself never fired in 556 conversations — the beat is
  rare/absent in the wild, not just miscounted. Separate
  instrument finding (see below): the legacy F5 cores match only
  the generic pool; the r152 named-favor pool was invisible to
  them. The widened cores are now in the r265 analyzer; they read
  0 too, so the zero stands.
- **Arm C (continuity holds) — ALL BINDING BARS GO:**
  M12-native GO, M4-SPLIT GO (conversational 7 ≤ 12), F6 GO (0
  dry), TRAIL GO (distinct 15, maxRecurrence 3; de-templated 12 —
  the pool IS deepening, r261's 6 → 12).
- **NEW FINDING — r152 named-favor landing broke 3 standing
  proofs:** F5 harness 46/4, F6 dry-opener 48/1, repay-fallback
  35/1 on this base. The game is behaving correctly in every
  failure line (fresh named variants served, 0 dry); the
  harnesses' matchers only know the generic-pool strings, so a
  named V3 reads as `variant=null`. Test-side fix owed (see
  Open items); no game change.

## Panel (seeds 45801–45804, DAYCAP 140)

Driver `scripts/journey-social-life-r265-20261122.js`, exit 0 (~3
min). JSONs in `evidence/2026-11-22/journey-social-life-r265-4580{1,2,3,4}.json`.

- 45801: survived day 140 (aliveEnd 7, 5 successions, 154 fullConvs,
  19 feasts, 2 moots)
- 45802: survived day 135 (aliveEnd 13, 0 successions, 178 fullConvs,
  20 feasts, 2 moots)
- 45803: survived day 141 (aliveEnd 1, 8 successions, 128 fullConvs,
  19 feasts, 1 moot)
- 45804: village-lost day 109, scattered (aliveEnd 2, 11 successions,
  114 fullConvs, 15 feasts, 1 moot)

Determinism: SEEDS=45801 re-run to `/tmp/r265-determinism` — JSON
identical except wall-clock `ms` (diff empty). Determinism confirmed.

Analyzer `scripts/analyze-journey-social-r265-20261122.js`, exit 0.
Full output: `evidence/2026-11-22/journey-social-life-r265-analysis.log`.

### Binding bars

- **M12-native — GO: threeTimes total=103, maxPerSitting=1,
  sittings2plus=0, exits=143** (bar: max≤1, 0 sittings 2+, exits≥1).
  Worst sitting 7 door serves (45802, Katarina Novak, C-friendship,
  10 turns) — serves, never cycles. The r262 cap holds on its
  third fresh panel.
- **M4-SPLIT — GO: instructional=223, conversational=7 (bar ≤12).**
  The 7, by family: belonging pair 1 (45804, "I just want a place
  where people notice when I'm gone" / "I just want someone to
  need me here"), plant-teaching template 1 (Jujube/Tea Bush —
  same template, different slots), "Something eases in their
  shoulders" 3, illness-plea pair 1 (45801, "I'm achy and wrung
  out… Will you help me?"), Aroha "Huh. Let me think about that"
  pair 1. The r261 food-handoff misroute is gone.
- **TRAIL — GO: presses=24, distinct=15, maxRecurrencePerSeed=3.**
  De-templated distinct 12 (9 non-template lines + 3 kcal-slot
  families) — up from r261's 6. New non-template lines this
  panel: "Ruby grins. Good ground…", "Another patch, another
  haul…", "Slow. The patch gives more…", "Keep together out
  here…", "Check behind you as you pick…", "This is the part I
  like…", "It is quiet out here in the good way…".
- **F6 — GO: dryLines=0 panel-wide (bar 0).**
- **F5 — report-only: V1=0, V2=0, V3=0, total=0 (legacy cores) and
  F5W V1=0, V2=0, V3=0 (widened cores, both pools).**

### M1–M12, B5, B6

- **M1 GO:** plots 7, arms 7, grievance-linked 7/7 by the reasons
  bar (binding judge); springs 6 (escaped 5, hurt 1); expired
  plots 1; vendetta maxUnordered 4 (Liam↔Willow, 4 arms d7–d12).
- **M2 rate 0.343** (180 proposals / 525 lived days; r261 0.302,
  r195 0.328; watch only).
- **M3 GO (sometimes-taken):** lure 490 accept / 522 decline
  (48.4% taken); party 26 accept / 7 decline; bond 9 accept /
  12 decline.
- **M4:** 556 transcripts, 230 nearDupFlags (r261: 483 / 223) —
  total flags up on more conversations, conversational down
  (8 → 7). Dominant instructional cluster still Haven-door
  positioning.
- **M5 report-only:** 4/4 past d100. **Moots 6** (r261: 4).
- **M6 GO (re-aligned gate definition):** away-gate 0 on all four
  kinds; debates kicked/settled 141/140. Strict-definition away
  total 34 (r261: 62) = known metric/gate discrepancy.
- **M7 HOLDS:** NARR-DUP verbatimRepeats 0 (574 conversations).
  **M9 HOLDS:** recap 387 presses, 0 after cap. **M10 HOLDS /
  FACE HOLDS:** coach/face verbatim 0.
- **M11:** recap-empty flags 0/230.
- **M12:** door-req flags 178/230 (32.01%); worst sitting 7 serves
  (45802). **M12-native GO** (above).
- **M8 SETTLED:** 1 settle, 1 link-formed, 0 BLOCKED re-raises.
- **B5:** 11 funerals — 8 full / 3 partial / **0 none**.
- **B6 GO:** 590 want-resolutions, deflected-from-stage-0 = 0.
- **CONFESS:** 19 total, 5 confessed, 0 double-confession sittings.
- **BOND ANSWERED:** 180 villager-initiated proposals (180 villager +
  0 scholar; 102 link, 78 person; 37 accepted, 12 refused, 80 staged,
  51 expired). Person accepted 21.
- **RE-OFFER max 12** (same watch level as r256/r260/r261).
  **DROPPED-THREAD: 0 drops.**
- **SCATTERING: 1/4** (45804, village-lost d109; r261: 0/4) — 24
  mantle successions panel-wide (5, 0, 8, 11).

### Outing chain (Arm A — the diagnosis)

21 attempts, 8 kept, deliveredKcal 4975, **conversion 38.1%**
(watch ≥25% — PASSES; r261: 12.5% on 56 attempts). Outcome
breakdown: kept 8, blocked-forage 8, blocked-depart 3,
blocked-readiness 1, unexpected-action 1. Per seed: 45801 2/2,
45802 0 attempts, 45803 4 attempts / 3 kept / 1 blocked-depart,
45804 15 attempts / 3 kept / 2 blocked-depart / 8 blocked-forage /
1 blocked-readiness / 1 unexpected-action. The 8 blocked-forage
entries cluster on 45804 days 50–52: the pair pressed
`forage-together` repeatedly and the patch gave nothing (one
entry ended pack-full); the solo-probe diagnostic never fired
because the "Nothing came of that press" line never appeared —
the presses consumed without yielding. Read plainly: the chain
works when there is anything to pick; the drops are bare ground,
not chain mechanics. Attempts fell 56 → 21 while kept held flat
(8 vs 7), so the conversion pass rides the denominator, not a
kept-count improvement — the watch passes, but no re-tune is owed
on this evidence.

## Village assessment (plain words)

Four villages, three survivors. 45801, 45802, and 45803 all held
together to day 135–141 — 556 conversations between them, 73
feasts, 6 moots, 11 funerals held and mended, 180 bonds proposed
by villagers themselves and answered by character (37 accepted,
12 refused). The one that fell apart, 45804, still talked its way
to day 109 through 11 changes of scholar: 114 conversations, 15
feasts, bonds proposed and answered, two people left alive at the
end. 45803 nearly joined it — down to one living person by day
141 after a brutal five-day stretch (Terrence→Willow→Ruby→Nina→
Devon, days 76–80) — but the village held. What kills villages
here is still the wild and monsters at the edges, not each other —
and this run, even that mostly didn't kill them. The scholar
changed hands 24 times across the panel and the villages kept
going each time, which is the succession system doing its job.

## People check (SENSE-TESTING LAW — read full transcripts)

All four M4 candidates read in full (11 turns each, all natural
ends). Verdict: **PASS.**

- **Abigail, seed 45801 (D-talk-request):** a trap-line walk —
  "You told me your trade. I've been watching your hands since —
  they know things." — then first memories: "Mine's Columbus,
  Ohio, I think — heat on pavement, someone's hand huge around
  mine. Or I invented it. First memories are half real and half
  the story you needed." Want → engagement → a small scare →
  leaving together. People-shaped.
- **Ingrid, seed 45802 (D-talk-request):** "Strangers are just
  people you haven't disappointed yet. That's what my mother said.
  Terrible advice, but it got me through parties." / "I don't need
  to understand it fully. I need to understand it enough. Enough
  is achievable." A shy person warming up in real time.
- **Willow, seed 45803 (C-friendship):** a confession arc — "We
  went over this. I already told you the truth about that." →
  the narration weighing the evidence ("One thread isn't a rope")
  → "I'm scared of forgetting the small things. The way they
  laughed. That's what goes first." / "I say their names out loud
  every morning. All of them. So I don't lose a single one."
  A person telling you who they are, in order.
- **gen_7cd080s, seed 45804 (D-talk-request):** "About that
  question — Did you leave someone behind? ...Sorry. You don't
  have to answer that." — "Yes." — "Yeah. A long quiet. Me too."
  / "I don't talk about that. Not because it's secret — because
  saying it out loud makes it real in a way I can't afford yet.
  Someday. Not today." The want survives across sittings ("Still
  on who you left behind. Don't waste it."), and the ending
  resolves: "Good talk. I feel like I know you a little better
  now."
- Recurring wrinkle (not a defect): the driver presses "go on"
  repeatedly, and the NPC says "We're going in circles" in 3 of
  4 candidates — then recovers and pivots honestly. That is the
  exhaustion machinery working as designed; a real player
  hammering "go on" would see the same honest pushback.
- No fabricated shared history spotted; no filler loops; the one
  repeat family left is instructional (Haven-door positioning),
  not conversational.

## Reachable / fun / winnable

- **Reachable:** yes — 556 conversations across 4 villages, bonds,
  moots, funerals, outings, confessions, plots all fire in ordinary
  play. The one beat that never fires is the settled-favor re-ask
  (F5 V3, seven panels) — see Arm B.
- **Fun:** yes — the Willow/Ingrid/left-behind sittings are the game
  at its best, people with wants and memory. The escalator cycle
  that poisoned r260 is gone; nothing in this panel reads as a
  machine repeating itself.
- **Winnable:** social life is not the wall — 3/4 villages survived
  to day 135+ while their social life held, and the one that
  scattered died to the wild, not to itself. The winnability
  chain's binding links stay elsewhere (deed gate, wave-4 kills).

## Arm B detail — F5 V3 and the counting blind spot

The analyzer's legacy cores match ONLY the generic pool
(`conversation.js` 7390–7392). The r152 named-favor pool
(7386–7388, landed `de0cb73c8`) interpolates the favor short
between the core words: V1 "it's handled: <short>. Thanks for
asking", V2 "<Short> — it's taken care of, I swear" (lowercase
"it's"), V3 "It's done — <short>. Finished. Thank you for
checking". None of the three legacy cores can match a named-pool
line. The r265 analyzer adds widened cores (F5W): V1 = line
contains "it's handled" AND "Thanks for asking" (the bare
"Thanks for asking" also rides a personal line at
conversation.js:374; the bare "It's handled." rides a medic
reassurance at game.js:34042); V2 = case-insensitive "taken care
of, i swear"; V3 = "Finished. Thank you for checking". Validated
against the r261 panel: F5W and legacy both read 0/0/0 there
(no settled-favor lines served at all on r261, either pool).
On r265 both read 0/0/0 as well — so the seven-panel V3 zero is
a real zero for the re-ask path, and the blind spot is now
closed for future panels. The path needs a settled favor AND a
later sitting where the player re-asks "Is there something you
need?" — in 556 driven conversations it never lined up.

## Standing proofs (re-run on the worktree, base a8c2c201c)

- M4-split 49/49 GREEN; escalator-cap GREEN; DRY2 27/27; DRY3
  37/37; TRAILTALK 30/30; gossip-dry 9/9; C3d recap-live 35/35.
- **F5 harness 46/4 FAIL; F6 dry-opener 48/1 FAIL;
  repay-fallback 35/1 FAIL — all the same cause:** the r152
  named-favor landing (`de0cb73c8`, in this base but after r261's
  base `b6aad8942`). Failure text proves the game right: F5 case
  2 served `"Honestly? It's done — spare food for the little
  ones. Finished. Thank you for checking…"`, F6 "the turn speaks
  variant 3" got the same named V3 line, repay-fallback's
  all-blocked case served the named V3 — in each case the harness
  matcher returned `variant=null` because it only knows the
  generic strings. Deeper: poisoning the generic strings cannot
  block the named variants (different text = different ledger
  entry), so the all-blocked expectations need poisoning by
  variant slot, not by text. Game behavior correct (fresh variants
  served, 0 dry in every case); the harnesses need their matchers
  widened to the named pool. Test-side fix owed — see Open items.
  These 3 failures are pre-existing on master (this branch has no
  src/js changes) and must be attributed to r152, not to r265.

## Telemetry

No canonical baseline exists for the current metric set
(`telemetry-baselines/social.json` is an October snapshot on stale
l3.* keys — same as r238/r239/r256/r260/r261). Ad-hoc comparison:
baseline built from the r261 panel JSONs in /tmp
(`/tmp/r265-social-baseline.json`), r265 checked against it with
`telemetry-check.js` on the real-signal metrics (`social.moots`,
`social.fullConvs`, `social.transcripts`, `bondProposed`,
`confrontEvents`, `outingArm`, `mootNotes`,
`funeralMendStats.funerals`). **LOUD ×1, explained, baseline NOT
rolled** (ad-hoc /tmp artifact, not committed):

- `outingArm` 56 → 21 (-62%): attempt volume fell while kept held
  flat (8 vs 7); per-seed attempts 2/0/4/15 — seed-volatile
  outing-seek triggers, not a regime change. The chain keeps
  ~7–8 per panel; the watch's denominator is the volatile part.
- Quiet on the rest: moots 4 → 6, fullConvs 492 → 556,
  transcripts 492 → 556, bondProposed 156 → 180, confrontEvents
  22 → 19, funerals 21 → 11 (-48%, under the 60% swing bar).

## Gate (`check.js --quick`)

**DONE by the adoption (r261 precedent):** `node scripts/check.js
--quick --cacheDirectory=/tmp/jest-cache-r265-gate` on the rebased
tip `0ea9789d7` (Loop A 2315Z adoption record): **339 passed, 5
failed in 1078s — 0 attributable.** The 5 are exactly the standing
families, identical to r152/r153 (339/5):
measurement-proof staleness pair (2), phone-frame stale receipt (1),
120s deed-attainment timeouts (2). This run touches no src/, data,
or index.html — only scripts (driver + analyzer) + evidence — so
none of the 5 can be caused by this branch. Log:
`evidence/2026-11-22/journey-social-life-r265-gate.log`.
The 3 named-favor proof failures (F5 harness 46/4, F6 dry-opener
48/1, repay-fallback 35/1) are NOT on the quick/green list, so they
do not appear in the gate; they stand as pre-existing on master,
verified directly by the adoption (game serves fresh named variants,
0 dry in every failure line).

## Metric review (for the NEXT run, r266-social)

- Outing watch PASSES — no re-tune. The next outing question is
  bare-ground foraging yield (food side) and attempt-volume
  volatility across seed bands, not the chain.
- F5 V3: seventh panel at zero, now with honest counting on both
  pools. The next arm is a serve-path question: stage a settled
  favor + re-ask deliberately and confirm the path fires at all
  in the wild; if it fires, the panel rate is the story; if the
  driver cannot stage it, the driver (not the game) is the gap.
- TRAIL pool: de-templated distinct 12 (was 6) — the pool IS
  deepening; the content arm closes. Next TRAIL question is
  recurrence on the thin seeds (45804: 4 distinct, maxRecurrence
  3), not pool size.
- M4: the remaining conversational families are templates with
  different slots (plant-teaching, "Something eases", belonging)
  — the next strip question is template-slot variety, not the
  classifier.
- M12-native: CLOSED for the third fresh panel. The next social
  run judges new arms, not this one.

## Files committed

- Driver: `scripts/journey-social-life-r265-20261122.js`
- Analyzer: `scripts/analyze-journey-social-r265-20261122.js`
  (Arm A OUTING OUTCOMES tally + Arm B F5W widened cores, both
  pools, alongside the legacy F5 cores)
- Prereg, run note, analysis log, panel log, panel JSONs ×4:
  `evidence/2026-11-22/journey-social-life-r265-{prereg.md,.md,
  -analysis.log,-panel.log,-45801.json,-45802.json,-45803.json,
  -45804.json}`
- No src/js changes in this run (scripts/evidence only).

## Open items (carried forward)

- Harness matcher fix (r152 fallout): widen the F5 harness, F6
  dry-opener, and repay-fallback matchers to the named-favor pool
  (shape-based variant detection as in the r265 analyzer's F5W);
  re-think the all-blocked poisoning by variant slot, not by
  generic text. 3 standing proofs currently red on master.
- F5 V3 serve-path staging (see Metric review).
- Gate owed to adoption (see Gate above).

## Infra (this occurrence)

- Pre-flight `git status --short` clean (0 files) at tip
  `a8c2c201c`; disk 47%.
- Registration SLOW: `worktree-register.sh journey2-social` ran
  00:57–~01:29Z (~32 min). Lane A's `journey-establishment`
  registration held the registry flock 00:58–~01:12Z; each `git
  worktree add` took ~13 min on this loaded box (load avg 7–9 on
  1.5 shared CPUs; machine restarted ~00:25Z, up 1:02 at 01:27Z).
  Registration completed cleanly; worktree at `a8c2c201c`.
  Heartbeats landed at registration, before panel launch, and
  before closeout.
- Write flap: /tmp fresh-file probe OK 01:08Z; no flap window
  observed this occurrence. The /tmp stage built as a fallback
  (`/tmp/r265-stage`, symlink farm) was not needed — registration
  completed before panel launch; the panel ran in the worktree.
- Panel fast once running: 4 seeds × 140 days in ~3 min
  (35–58 s/seed), exit 0. Analyzer exit 0. Determinism re-run
  exit 0, diff empty.
- Lock: `playtest-loop-2.lock` run_id
  `playtest-loop-2-20261122T0055Z`.
