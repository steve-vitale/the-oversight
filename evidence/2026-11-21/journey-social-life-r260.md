# Journey social life r260 — RUN NOTE (Lane B, 2026-11-21)

Run ID `2026-11-21T00:55:17Z-loop2-leg5-r260`. Lane B occurrence 19:00 CST
Nov 20, 2026. Rotation-b 5 (social life); this run plays 5, adoption
writes 6 at closeout. Base at run start: master `faa5d65a9` (Loop B
lever round fleshout-loop-b-20261120T2130Z). Prereg:
`evidence/2026-11-21/journey-social-life-r260-prereg.md`.

## Headline

- **Arm A (M4-SPLIT metric review, owed from r256) — APPLIED and GO:**
  the discourse-opener strip is in the analyzer (shared helpers), the
  r238 corpus re-baselines EXACTLY at 181 / 174 / 7 (all 7 conversational
  flags survive), and the fresh panel reads conversational **12 vs bar
  ≤12 — GO, at the bar**. Zero margin — the next run's strip addition
  (below) is what buys headroom, not a bar change.
- **F6 WILD HOLD — GO: dryLines=0 panel-wide.** The r256 Arm C fix
  holds on fresh seeds.
- **TRAIL WILD HOLD — GO: presses=18, distinct=10 (bar ≥6),
  maxRecurrencePerSeed=3 (bar ≤4).**
- **M12-native — NO-GO (one sitting):** maxPerSitting=3, sittings2plus=1.
  Mechanism pinned: the repeat-prefix escalator CYCLES past its cap —
  after "We're going in circles" it serves "I've told you three times
  now" again (twice more). Filed as the next run's fix arm; NOT fixed
  here (game-code change, no panel re-run fits this occurrence).
- **Outing conversion still missed: 12.9%** (4 kept / 31 attempts;
  watch ≥25%). Fourth panel in a row under the watch (r239 16%,
  r256 13.0%). The re-tune question stays open.
- **Panel verdict: MIXED** — headline arms GO, M12-native NO-GO by one
  sitting. The metric-review arm lands; the escalator fix does not
  ride with it (unproven in-run).

## Arm A: the M4 metric review — what was done

The r256 13 conversational flags contained 5 same-opening artifacts
on discourse openers. The revision strips leading discourse openers
in the M4 scan's comparison cores (scan only, never game text):
`I don't know`, `You say nothing`, the `You want to know about
that? Okay.` ack-question stem, and `We're going in circles`
(generalizing the existing "a bit" variant). The strip lives in
`stripM4RepeatPrefix` / `stripM4DiscourseOpener` in
`scripts/journey-social-r226-helpers.js`, shared by the analyzer and
the proof test so the two cannot drift.

- Proof test extended (`test-journey-social-life-r250-m4-split-...`):
  **44/44 GREEN**, including 4 strip families + scan-level unflag/flag
  cases. RED→GREEN path: the pre-pattern run read corpus 181 / 172 / 9
  — the 2 extra conversational flags were ONE instructional family,
  "Finish the fight before helping." + recap-suffixed twin, appearing
  twice, surfaced by the circles-strip. A narrow instructional
  pattern (`/finish the fight/`) routes it correctly; the corpus
  returns to exactly **181 / 174 / 7**. No re-baseline was needed.
- Panel re-analysis of the r256 13 under the revised scan: 8 remain
  (belonging 2, murder/ambush 2, plant-teaching 2, favor re-ask 1,
  hunger plea 1) — matches the prereg's prediction.
- The r260 panel's 12 conversational flags: hunger plea 2 (amina,
  devon), belonging mirror 2 (tashi/ines — the same two lines served
  to two villagers), "You asked me that before. It's a different
  question now." prefix trio 3 (aroha — a NEW repeat-prefix family
  not in the strip list), favor re-ask 1, "Nothing came of that
  press" recap pair 1, "I just want..." pair 1, misc 2. The aroha
  trio is the next strip addition (metric review, below): stripped,
  this panel would read 9.
- discourseStrippedCores panel-wide: 93.

## Panel (seeds 45785–45788, DAYCAP 140)

Driver `scripts/journey-social-life-r260-20261121.js`, exit 0, ~402s
(box load + a VM restart mid-run at ~01:23Z killed the first driver
attempt before it wrote anything; re-ran clean). JSONs in
`evidence/2026-11-21/journey-social-life-r260-4578{5,6,7,8}.json`.

- 45785: village-lost day 81 (hungryDays 5, aliveEnd 2, 7 successions)
- 45786: survived day 140 (alive 7, 7 successions)
- 45787: village-lost day 79 (hungryDays 3, aliveEnd 7, 4 successions)
- 45788: village-lost day 122 (hungryDays 3, aliveEnd 1, 7 successions)

Determinism: SEEDS=45785 re-run to `/tmp/r260-determinism` — JSON
identical except wall-clock `ms`. Determinism confirmed.

Analyzer `scripts/analyze-journey-social-r260-20261121.js`, exit 0.
Full output: `evidence/2026-11-21/journey-social-life-r260-analysis.log`.

### Binding bars

- **F6 WILD HOLD — GO: dryLines=0 panel-wide (bar 0).**
- **TRAIL WILD HOLD — GO: presses=18, distinct=10 (bar ≥6),
  maxRecurrencePerSeed=3 (bar ≤4).** Note: 3 of the 10 distinct are
  "Between us we are carrying X kcal" template variants (150/240/480)
  — same template, different slots; even without them distinct is 7.
- **M4-SPLIT — GO: instructional=169, conversational=12 (bar ≤12).**
- **F5 WILD CHECK (report-only): V1=1, V2=0, V3=0, total=1.**
  **V3 still never served.**
- **M12-native — NO-GO: threeTimes total=73, maxPerSitting=3,
  sittings2plus=1, exits=114** (bar: max≤1, 0 sittings 2+, exits≥1).
  The failing sitting: seed 45787, Ines Duarte, D-talk-request,
  day 27, 22 turns — the driver pressed "Forage this patch
  together" 7× in one outing sitting; the escalator served
  As I said → Like I said → Still the same thing → "I've told you
  three times now" → "We're going in circles" → "three times now"
  AGAIN → "circles" AGAIN → "three times now" a THIRD time. The
  count in the line is a lie by the second serving, and the
  "circles" admission repeats too. Every other sitting caps at 1.
  The defect is the escalator cycling, not the driver pressing:
  a real player can hammer one action the same way. Next run's
  fix arm: cap the escalator at "circles" (keep serving it or
  exit) instead of cycling.

### M1–M12, B5, B6

- **M1 GO:** plots 1, arms 1, grievance-linked 1/1 by the reasons
  bar (binding judge); springs 1 (killed); expired plots 0;
  vendetta maxUnordered 1 (Karl↔Norman).
- **M2 rate 0.256** (109 proposals / 426 lived days; watch only).
- **M3 GO (sometimes-taken):** lure 331 accept / 211 decline;
  party 26 accept / 15 decline; bond 7 accept / 8 decline.
- **M4:** 427 transcripts, 181 nearDupFlags (r256: 410 / 140) —
  total flags up, conversational down (13 → 12) under the revised
  scan. Dominant instructional cluster still Haven-door positioning.
- **M5 report-only:** 2/4 past d100. **Moots 6** (r256: 3).
- **M6 GO** (re-aligned gate definition): away-gate 0 on all four
  kinds; debates kicked/settled 134/134. Strict-definition away
  total 105 (r256: 76) = known metric/gate discrepancy.
- **M7 HOLDS:** NARR-DUP verbatimRepeats 0 (conversations 438).
  **M9 HOLDS:** recap 317 presses, 0 after cap. **M10 HOLDS / FACE
  HOLDS:** coach/face verbatim 0.
- **M11 GO:** recap-empty flags 0/181.
- **M12:** door-req flags 132/181 (30.91%); worst sitting 7 serves
  (45785). **M12-native NO-GO** (above).
- **M8 SETTLED:** 1 settle, 1 link-formed, 0 BLOCKED re-raises.
- **B5:** 11 funerals — 7 full / 4 partial / **0 none** (r256 had
  1 none on an empty pantry).
- **B6 GO:** 421 want-resolutions, deflected-from-stage-0 = 0.
- **CONFESS:** 15 total, 8 confessed, 0 double-confession sittings.
- **BOND ANSWERED:** 109 villager-initiated proposals (109 villager +
  0 scholar; 62 link, 47 person; 36 accepted, 8 refused, 48 staged,
  17 expired). Person accepted 17.
- **RE-OFFER max 12** (same watch level as r256).
  **DROPPED-THREAD: 0 drops.**
- **SCATTERING: 3/4** (45785 d81, 45787 d79, 45788 d122; r256: 1/4)
  — villages dying of hunger/thirst pressure, not social failure;
  26 mantle successions panel-wide (7, 7, 4, 7).

### Outing chain (watch)

31 attempts, 4 kept, deliveredKcal 2760, **conversion 12.9%**
(watch ≥25% — missed; r256: 13.0%). Attempts fell (46 → 31)
while kept barely moved (6 → 4). The re-tune question stays open.

## Village assessment (plain words)

Four villages, one survivor. 45786 is the one that held together —
140 days, 7 people alive at the end, 20 feasts, 7 bearers of the
mantle passing it along without the village breaking. The other
three scattered between day 79 and 122, all hungry (3–5 hungry
days each), all still talking to each other while they fell apart:
438 conversations, 67–119 natural endings per village, bonds
proposed and answered by character (36 accepted, 8 refused), 6
moots convened, 11 funerals held and mended. Nobody died
unmourned. The social life is real — what kills these villages is
food and water, not each other. The scholar changed hands 26 times
and the village kept going each time, which is the succession
system doing its job.

## People check (SENSE-TESTING LAW — read full transcripts)

- **Ines Duarte, seed 45787, days 15–17 (D-talk-request):** a real
  person, not a menu. Day 15 she asks to talk "like people used
  to", then keeps asking for help with the pantry run and is told
  why she can't have it yet. Days 16–17 she opens up: "I just want
  a place where people notice when I'm gone. Is that too much?"
  / "I've never really fit anywhere. Maybe here." / "I just want
  someone to need me here." The wanting is specific, the arc
  across three days is coherent, the endings resolve ("This was
  good." They mean it.). The belonging pool is thin — the same two
  lines are mirrored to Tashi Sherpa on another seed — but each
  sitting reads true.
- **Grace Obi, seed 45787, day 58:** hungry ("It's been days since
  a real meal"), asks for food, is told the door rule five times
  with escalating prefixes, accepts "I'll come back to help", then
  pivots to the table: "They say the table's coming. For us. I keep
  thinking about what we'd even bring to it." Want → blocker →
  acceptance → new subject. People-shaped.
- **Devon Okafor, seed 45787, day 72:** asks about the creek run
  after Ines is gone ("I asked Ines about the creek water run —
  Ines's gone."), gets the door rule, accepts dawn, then offers the
  scholar a tool he made — "Here. I made an extra." A villager who
  remembers the dead, keeps the promise, and gives. The best
  sitting in the panel.
- **The day-27 Ines sitting (M12-native):** the only false note —
  the same "Nothing came of that press" line 7 times with a
  cycling escalator. The words are honest; the repetition is the
  engine's, not the person's. See M12-native above.
- **Verdict: PASS.** Conversations have want, engagement, and
  endings that resolve or plant. No fabricated shared history
  spotted; no filler loops outside the escalator cycle.

## Reachable / fun / winnable

- **Reachable:** yes — 438 conversations across 4 villages, bonds,
  moots, funerals, outings all fire in ordinary play. F5 V3 is the
  one beat never served in the wild (5 panels running).
- **Fun:** yes, with the escalator caveat — the Ines/Devon/Grace
  sittings are the game at its best, people with wants and memory.
  The 7× repeat sitting is the fun-killer in miniature.
- **Winnable:** social life is not the wall — 3/4 villages scatter
  on food/water while their social life holds. The winnability
  chain's binding links stay elsewhere (deed gate, wave-4 kills).

## Telemetry

No canonical baseline exists for the current metric set
(`telemetry-baselines/social.json` is an October snapshot on stale
l3.* keys the driver never emits — same as r238/r239/r256). Ad-hoc
comparison: baseline built from the r256 panel JSONs in /tmp,
r260 checked against it with `telemetry-check.js` on the
real-signal metrics (`social.moots`, `social.fullConvs`,
`social.transcripts`, `bondProposed`, `confrontEvents`, `outingArm`,
`mootNotes`, `funeralMendStats.funerals`). **Quiet: no large
deviations** (moots 3→6, fullConvs 424→438, transcripts 424→427,
bondProposed 109→109, confrontEvents 25→15, outingArm 46→31,
funerals 13→11). **Baseline NOT rolled** (ad-hoc /tmp artifact,
not committed).

## Gate (`check.js --quick`)

NOT RUN this occurrence — the VM restart (~01:23Z) + the slow
panel (~402s) consumed the budget; the gate goes to adoption
(r239/r256 precedent). Standing proofs all GREEN in the worktree
before the panel: M4-split (extended) 44/44, F6 dry-opener 49/49,
DRY2 27/27, DRY3 37/37, TRAILTALK 30/30, F5 harness 50/50,
repay-fallback 36/36, gossip-dry (r256) 9/9, C3d recap-live 35/35.

## Adjudication

Panel verdict is **MIXED**: M4-SPLIT GO (at the bar), F6 GO, TRAIL
GO, every M1–M12/B5/B6 bar holds or is report-only — except
M12-native, which misses on ONE sitting (escalator cycle).
The metric-review arm lands: (1) the revision is proven by the
44/44 test with the corpus pins holding exactly; (2) the panel
confirms it in the wild (12 ≤ 12 with the aroha trio still
counted — the revision is conservative, it does not hide repeats);
(3) the M12-native miss is not a regression from the revision —
the escalator cycling predates it and no flag is attributable to
the strip. The escalator fix is filed, not landed (unproven
without a panel re-run).

## Metric review (for the NEXT run, r261)

- Add "You asked me that before. It's a different question now."
  to the repeat-prefix strip (3 flags on this panel; stripped,
  conversational would read 9). It is a question-stem prefix like
  "As I said —", not content.
- Hunger-plea pool is still the thinnest content pool (2 of 12;
  was 3/7 on r238, 1/13 on r256). If it dominates again, it is the
  next content arm.
- TRAIL distinct counts template variants ("Between us we are
  carrying X kcal") as distinct — watch whether the pool is
  really 10 deep or 7.
- Outing-chain re-tune stays open (conversion 12.9%).
- F5 V3 still never served in the wild.
- M12-native fix arm (escalator cap) is the next run's first job:
  probe the escalator, fix the cycle, proof test RED→GREEN,
  panel-confirm.

## Files committed

- Metric revision: `scripts/journey-social-r226-helpers.js`
  (stripM4RepeatPrefix + stripM4DiscourseOpener, shared exports;
  `/finish the fight/` instructional pattern)
- Analyzer: `scripts/analyze-journey-social-r260-20261121.js`
  (discourse strip + m4discourseStripped watch count)
- Driver: `scripts/journey-social-life-r260-20261121.js`
- Proof test (extended):
  `scripts/test-journey-social-life-r250-m4-split-20261119.js`
- Prereg, run note, analysis log, panel JSONs ×4:
  `evidence/2026-11-21/journey-social-life-r260-{prereg.md,.md,
  -analysis.log,-45785.json,-45786.json,-45787.json,-45788.json}`

## Open items (carried forward)

- M12-native escalator-cycle fix (next run's first arm).
- "You asked me that before" strip addition (next run, with the
  escalator arm — same file family).
- Outing-chain re-tune question (conversion 12.9%).
- F5 V3 never served.
- Gate owed to adoption (`check.js --quick` on the merged tip).

## Infra (this occurrence)

- VM restart ~01:23Z (uptime 1 min at 01:24Z) killed the first
  driver attempt before any write; re-ran clean. No flap window
  observed (writes all succeeded first try). Heartbeat stamped
  01:22:05Z (pre-restart) — re-heartbeat at closeout.
