# Journey social life r261 — RUN NOTE (Lane B, 2026-11-21)

Run ID `2026-11-21T13:55:17Z-loop2-leg5-r261`. Lane B occurrence 08:00 CST
Nov 21, 2026. Rotation-b 5 (social life); this run plays 5, adoption
writes 6 at closeout. Base at run start: master `b6aad8942`
(r263 endgame adoption merge). Prereg:
`evidence/2026-11-21/journey-social-life-r261-prereg.md`. This run
TIMED OUT at ~14:55Z before closeout; the adoption finished the
determinism re-run, telemetry, gate, and merge (see Infra).

## Headline

- **Arm A (M12-native WILD CONFIRM) — GO:** threeTimes total=75,
  maxPerSitting=1, sittings2plus=0, exits=118. The r262 escalator
  cap HOLDS on fresh seeds. The r260 NO-GO (one sitting, escalator
  cycling past its cap) is closed.
- **Arm B (M4-SPLIT with the r262 strip) — GO:** conversational **8
  vs bar ≤12**, with headroom (r260 predicted 9 with the strip;
  actual 8). The aroha trio ("You asked me that before…") is gone
  from the flags entirely.
- **F6 WILD HOLD — GO: dryLines=0 panel-wide.** The r256 Arm C fix
  holds on fresh seeds.
- **TRAIL WILD HOLD — GO: presses=27, distinct=13 (bar ≥6),
  maxRecurrencePerSeed=4 (bar ≤4).** Without template variants the
  distinct count is 6 — exactly at the bar (see Metric review).
- **F5 WILD CHECK (report-only): V1=0, V2=0, V3=0, total=0.** V3
  still never served in the wild — six panels running.
- **Outing conversion still missed: 12.5%** (7 kept / 56 attempts;
  watch ≥25%). Fifth panel in a row under the watch (r239 16%,
  r256 13.0%, r260 12.9%). The re-tune question stays open.
- **Panel verdict: GO** — every binding bar passes.

## Panel (seeds 45793–45796, DAYCAP 140)

Driver `scripts/journey-social-life-r261-20261121.js`, exit 0. JSONs in
`evidence/2026-11-21/journey-social-life-r261-4579{3,4,5,6}.json`.

- 45793: survived day 140 (aliveEnd 6, 10 successions, 122 fullConvs,
  20 feasts, 3 moots)
- 45794: village-lost day 100 (aliveEnd 0, 9 successions, 96 fullConvs,
  14 feasts, 0 moots)
- 45795: survived day 140 (aliveEnd 8, 3 successions, 152 fullConvs,
  19 feasts, 1 moot)
- 45796: survived day 136 (aliveEnd 2, 15 successions, 122 fullConvs,
  20 feasts, 0 moots)

Determinism: SEEDS=45793 re-run to `/tmp/r261-determinism` (adoption)
— JSON identical except wall-clock `ms`. Determinism confirmed.

Analyzer `scripts/analyze-journey-social-r261-20261121.js`, exit 0.
Full output: `evidence/2026-11-21/journey-social-life-r261-analysis.log`.

### Binding bars

- **M12-native — GO: threeTimes total=75, maxPerSitting=1,
  sittings2plus=0, exits=118** (bar: max≤1, 0 sittings 2+, exits≥1).
  Worst sitting 7 door serves (45793, Olivia Bennett, C-friendship,
  10 turns) — serves, never cycles.
- **M4-SPLIT — GO: instructional=215, conversational=8 (bar ≤12).**
  The 8, by family: belonging 2 ("I just want someone to need me
  here" / "I just want a place where people notice when I'm gone";
  Aki Tanaka "Back home I was invisible" / "Back home nobody
  noticed me"), Quinn medic-vote pair 1 ("Every person I patch up
  is a vote for the world continuing" / "Every person I help is a
  vote for the world making sense again"), food-handoff twin 1
  ("Give up to three edible portions from your pack…" — arguably
  instructional; the splitter's one misroute this panel), Arabic
  translate pair 1, "Something eases in their shoulders" pair 1,
  veterinarian/laugh pair 1, "Nothing came of that press" twin 1.
  No aroha trio, no hunger-plea flags this panel.
- **TRAIL — GO: presses=27, distinct=13, maxRecurrencePerSeed=4.**
  The 13 distinct strings collapse to 6 without template variants:
  4 non-template lines ("Two pairs of eyes…", "The pantry is
  counting on us…", "This is the part I like…", "It is quiet out
  here…") + 2 template families ("Between us we are carrying X
  kcal" ×7 values, "I have got N kcal in my pack" ×2 values).
  The bar passes either way, but the de-templated count sits
  exactly on it.
- **F6 — GO: dryLines=0 panel-wide (bar 0).**
- **F5 — report-only: V1=0, V2=0, V3=0, total=0.**

### M1–M12, B5, B6

- **M1 GO:** plots 2, arms 2, grievance-linked 2/2 by the reasons
  bar (binding judge); springs 2 (hurt 1, killed 1); expired plots 0;
  vendetta maxUnordered 2 (Brian↔David).
- **M2 rate 0.302** (156 proposals / 516 lived days; r260 0.256,
  r195 0.328; watch only).
- **M3 GO (sometimes-taken):** lure 378 accept / 398 decline
  (48.7% taken); party 35 accept / 20 decline; bond 7 accept /
  11 decline.
- **M4:** 483 transcripts, 223 nearDupFlags (r260: 427 / 181) —
  total flags up on more conversations, conversational down
  (12 → 8) under the revised scan. Dominant instructional cluster
  still Haven-door positioning.
- **M5 report-only:** 4/4 past d100. **Moots 4** (r260: 6).
- **M6 GO** (re-aligned gate definition): away-gate 0 on all four
  kinds; debates kicked/settled 155/154. Strict-definition away
  total 62 (r260: 105) = known metric/gate discrepancy.
- **M7 HOLDS:** NARR-DUP verbatimRepeats 0 (492 conversations).
  **M9 HOLDS:** recap 329 presses, 0 after cap. **M10 HOLDS / FACE
  HOLDS:** coach/face verbatim 0.
- **M11:** recap-empty flags 0/223.
- **M12:** door-req flags 172/223 (35.61%); worst sitting 7 serves
  (45793). **M12-native GO** (above).
- **M8 SETTLED:** 5 settles, 5 link-formed, 0 BLOCKED re-raises.
- **B5:** 21 funerals — 13 full / 8 partial / **0 none**.
- **B6 GO:** 459 want-resolutions, deflected-from-stage-0 = 0.
- **CONFESS:** 22 total, 9 confessed, 0 double-confession sittings.
- **BOND ANSWERED:** 156 villager-initiated proposals (156 villager +
  0 scholar; 78 link, 78 person; 44 accepted, 11 refused, 69 staged,
  32 expired). Person accepted 24.
- **RE-OFFER max 12** (same watch level as r256/r260).
  **DROPPED-THREAD: 0 drops.**
- **SCATTERING: 0/4** (r260: 3/4) — villages living longer, not
  dying socially; 37 mantle successions panel-wide (10, 9, 3, 15).

### Outing chain (watch)

56 attempts, 7 kept, deliveredKcal 4020, **conversion 12.5%**
(watch ≥25% — missed; r260: 12.9% on 31 attempts). Attempts rose
(31 → 56) because the villages lived longer (516 vs 426 lived
days); kept rose 4 → 7; conversion is flat. The re-tune question
stays open.

## Village assessment (plain words)

Four villages, three survivors. 45793, 45795, and 45796 all held
together to day 136–140 — 492 conversations between them, 73
feasts, 4 moots, 21 funerals held and mended, 156 bonds proposed
by villagers themselves and answered by character (44 accepted,
11 refused). The one that fell apart, 45794, still talked its way
to day 100: 96 conversations, 14 feasts, bonds proposed and
answered, nobody left alive at the end but nobody unmourned either.
The scholar changed hands 37 times across the panel and the
villages kept going each time, which is the succession system
doing its job. What kills villages here is still food and water
pressure at the edges, not each other — and this run, even that
mostly didn't kill them.

## People check (SENSE-TESTING LAW — read full transcripts)

- **Olivia Bennett, seed 45793 (D-talk-request):** a bond ask with
  a spine — "I've been thinking. You and me — we should be bonded.
  Not just neighbors. Will you stick with me?" — then a pantry
  ask, then a ridge walk where something was recently there and
  "Olivia's hand finds your sleeve." Want → engagement → a small
  scare → leaving together, faster than they came. People-shaped.
- **Quinn Murphy, seed 45794 (C-friendship):** the medic, with a
  philosophy: "Every wound I close is a small argument against
  despair." / "I'm not a miracle worker. I'm a witness who brings
  bandages." Eleven turns, every line a different facet of the
  same person — no repeats, no menu.
- **Valeria Quispe, seed 45795 (D-talk-request):** "What got you
  through the first week? The very first days." — "Shock's
  underrated. It's the body's way of buying you time." / "Spite,
  mostly. Pure, clean spite at the sky. Then someone shared food
  with me and the spite turned into something else." A person
  telling you who they are, in order.
- **The taken-kin sitting (visjoin_99):** "It's my brother,
  Marcelo. Went up in the Taking with the boring half. He was the
  funniest person I knew. Their metrics are broken. The pods get
  into my sleep some nights." The want — ask the System about the
  taken — survives across sittings ("Still nothing on Marcelo. I
  told you about the pods…"), and the ending resolves: "This was
  good." They mean it.
- **Verdict: PASS.** Conversations have want, engagement, and
  endings that resolve or plant. No fabricated shared history
  spotted; no filler loops. The one repeat family left is
  instructional (Haven-door positioning), not conversational.

## Reachable / fun / winnable

- **Reachable:** yes — 483 conversations across 4 villages, bonds,
  moots, funerals, outings, confessions all fire in ordinary play.
  F5 V3 is the one beat never served in the wild (6 panels running).
- **Fun:** yes — the Quinn/Valeria/Marcelo sittings are the game at
  its best, people with wants and memory. The escalator cycle that
  poisoned r260 is gone; nothing in this panel reads as a machine
  repeating itself.
- **Winnable:** social life is not the wall — 0/4 villages scattered
  this run while their social life held. The winnability chain's
  binding links stay elsewhere (deed gate, wave-4 kills).

## Telemetry

No canonical baseline exists for the current metric set
(`telemetry-baselines/social.json` is an October snapshot on stale
l3.* keys the driver never emits — same as r238/r239/r256/r260).
Ad-hoc comparison (adoption): baseline built from the r260 panel
JSONs in /tmp, r261 checked against it with `telemetry-check.js`
on the real-signal metrics (`social.moots`, `social.fullConvs`,
`social.transcripts`, `bondProposed`, `confrontEvents`, `outingArm`,
`mootNotes`, `funeralMendStats.funerals`). **LOUD ×2, both
explained, baseline NOT rolled** (ad-hoc /tmp artifact, not
committed):

- `outingArm` 31 → 56 (+81%): attempts up because the villages
  lived longer (516 vs 426 lived days; 3/4 survived vs 1/4).
  Kept rose with it (4 → 7); conversion is flat (12.9% →
  12.5%). Volume, not a regime change.
- `funeralMendStats.funerals` 11 → 21 (+91%): more lived days
  and more mantle turnover (37 vs 26 successions). The mend
  system itself is healthy (13 full / 8 partial / 0 none).
- Quiet on the rest: moots 6 → 4, fullConvs 438 → 492,
  transcripts 438 → 483, bondProposed 109 → 156, confrontEvents
  15 → 22.

## Gate (`check.js --quick`)

**Adoption gate in the journey2-social worktree on branch tip
`b6aad8942`: 335 passed, 9 failed in 1242s, 0 attributable**
(log: `hidden_files/evidence/2026-11-21/journey-social-life-r261-gate.log`,
launched 15:06:32Z after verifying no sibling gate was running).
All 9 failures are standing-set members, identical in kind to the
r262/r263 adoption gates:

- Measurement-proof staleness pair (`test-measurement-proof-update.js`,
  `test-measurement-workflow.js`) — proof re-sign round 22 still owed.
- Phone-frame stale receipt (`test-phone-frame-proof.js`).
- 120s deed-attainment timeouts (`test-living-garden-deed-attainment.js`,
  `test-one-person-army-deed-attainment.js`).
- 120s load-flake timeouts (`test-occupation-panels.js`,
  `test-trust-observer-neutrality.js`, `test-synergy-stall.js`,
  `test-capable-bot-20261014.js`) — all four passed on the r263
  adoption gate (338/6); they flaked here because the deepening
  r248 gate started at 15:14Z mid-way through this gate, doubling
  load for its second half. (The slot was free when this gate
  launched; the overlap is the other run's start, not this gate's.)
- Notably `test-measurement-cache-flags.js` PASSED this run (it
  failed on r263's gate), as did `test-table-endings.js` and
  `test-succession-grief.js`.

**0 attributable to this branch** — evidence + scripts only, no
src/js change. No second gate: the branch content is unaffected by
the base (tip already equals master), and no green-list test reads
this branch's evidence files.

## Metric review (for the NEXT run, r262-social)

- TRAIL de-templated distinct is exactly 6 — the pool is NOT
  deepening; the distinct count is carried by kcal-slot variants.
  The next TRAIL question is new lines, not counting.
- Outing-chain re-tune stays open (conversion 12.5%, fifth panel
  under the watch).
- F5 V3 still never served in the wild (6 panels).
- M4: 1 of the 8 conversational flags is arguably instructional
  (the food-handoff twin) — the splitter's next narrow pattern if
  it recurs.
- Hunger-plea pool: 0 of 8 this panel (was 2 of 12 on r260) — the
  thin-pool watch clears for now.
- M12-native: CLOSED. The r262 cap holds on fresh seeds; the
  next social run judges new arms, not this one.

## Files committed

- Driver: `scripts/journey-social-life-r261-20261121.js`
- Analyzer: `scripts/analyze-journey-social-r261-20261121.js`
- Prereg, run note, analysis log, panel JSONs ×4:
  `evidence/2026-11-21/journey-social-life-r261-{prereg.md,.md,
  -analysis.log,-45793.json,-45794.json,-45795.json,-45796.json}`
- No src/js changes in this run (scripts/evidence only). The r260
  arms it confirms — the M12 escalator cap and the "You asked me
  that before" strip — were landed by r262, not here.

## Open items (carried forward)

- Outing-chain re-tune question (conversion 12.5%).
- F5 V3 never served.
- TRAIL pool depth (de-templated distinct exactly 6).
- Gate owed to adoption (this adoption runs it — see Gate above).

## Infra (this occurrence + adoption)

- The occurrence timed out at ~14:55Z before closeout (cron
  timeout): panel + analysis complete, run note / telemetry /
  gate / commit / merge / rotation / lock all unfinished.
- Write flap window 13:46:06Z–~14:37Z overlapped the run (last
  real EPERM cycle 14:37:22Z); writes clear from 14:38:23Z.
  Adoption verified clear (probe ALL-OK 14:48Z–15:06Z) before
  writing, and re-ran the determinism proof itself.
- Heartbeat loop pid 77709 (per the timeout handoff) was already
  gone at adoption — died with the timed-out coordinator. No
  heartbeat to kill.
