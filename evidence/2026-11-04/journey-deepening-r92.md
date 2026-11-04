# journey-deepening r92 — run note (lane A, leg 2 DEEPENING)

**Run id:** laneA-deepening-2026-11-04T0019CST (lock 2026-11-04T05:12:02Z;
no prior lock existed, so no stale-lock recovery; main tree clean,
disk 32%). Base master@a5ade6579 at worktree creation; worktree
`journey-deepening`. Rotation read 2 → deepening; 2→3 written at
closeout and verified by read-back. Prereg:
evidence/2026-11-04/journey-deepening-r92-prereg.md (written BEFORE
any seed ran). Seeds fresh 93501–93504, competent policy (r91 driver
lineage + r92 beast-ask decomposition instrument), DAYCAP=100,
death-aware stop. Smoke seed 93500 × DAYCAP=45 proved the harness
(survived day 47, wave 3, 5 asks: 4 taught + 1 none-no-counter on
spool, 0 mislabels) and was deleted per the prereg. Main panel ran
~3.5 min for 4 seeds. Heartbeat loop ran every 10 min with a log
file (verified landed 05:20:13Z, active) — no stale-heartbeat
window this run.

## Panel verdicts (pre-registered, no re-scoring)

- **B-ASK (primary): asked 37, taught 6, none-no-counter 31,
  none-other 0.** Repeat-futile asks (same counterless set re-asked
  on a later 5-day tick): 23 of the 31. Per seed: 93501 14 asks /
  2 taught / 12 none-no-counter (all buffering, 11 repeats);
  93502 9 / 1 / 8 (ad_break, spool, callback, chorus_line, strike);
  93503 3 / 2 / 1 (spool); 93504 11 / 1 / 10 (spool, chorus_line,
  redactor, focus_group, callback).
- **The mechanism, confirmed by data, not just code-read:** every
  wave-3+ monster in the data lacks a `counter` field — 9/9 wave 3,
  10/10 wave 4, 10/10 wave 5, 3/3 wave 6 (72 monsters checked).
  counterTeachable() requires `mdef.counter`, so a wave-3+ trick
  can NEVER be taught through askAbout, no matter how many of
  that beast the village slays. All 6 taught tricks this panel
  are wave 1/2 (sunback, drumbelly_tanuki, giant_mosquito,
  anaconda_empress, murkcap, sanjun). Class B (teachable-but-
  refused) is exactly zero — the ask code is faithful; the
  content/wiring is what is missing.
- **B-USE: the observation channel works, the ask channel does
  not — for the same tricks.** End-of-run villagerTricks (learned
  by surviving two encounters): 93501 [reunion], 93502 [redactor,
  terms_of_service, callback], 93503 [focus_group, spool], 93504
  [spool, terms_of_service, redactor, focus_group]. Field AI uses
  these (villageKnowsTrick in fieldFights.js). Yet on 93504 the
  village KNOWS the redactor/focus_group tricks for fights while
  askAbout about those same types returns none — because
  counterTeachable() consults only mdef.counter + monsterCounters,
  never villagerTricks. And when any wave-1/2 counter is known,
  that none answer speaks the "We've told you every trick we've
  figured out" line (game.js askAbout, read in code) — untrue in
  the villagerTricks sense. Player-facing summary: wave-3+
  counterplay is learnable only by surviving encounters twice,
  never by asking at the fire, and nothing in the ask path says
  so. This is the r91 thinness (asked 34 / taught 4) explained:
  most deepening-window asks are about counterless wave-3+ kills.
- **No game change made.** Filling 32 counter fields (trick +
  reveal text already exists in villagerTrickDefs) is a content
  decision for Steve / the winnability arms, not a silent
  playtest-loop edit; the counterwire arm's "deliberate NO" was
  about ledger scoring, not about teaching, so this seam reads
  as unwired rather than intended — but the call is theirs.
  Proposal, not edit: copy trick/reveal from villagerTrickDefs
  into mdef.counter for wave-3/4 types, or teach
  counterTeachable() to consult villagerTricks, and re-run this
  panel's B-ASK metric to confirm taught > 0 for wave-3 types.
- **K-CONTEXT (carried, not re-judged):** lessons 150/177 ok
  (93501 30/30, 93502 38/48, 93503 32/32, 93504 50/67).
  knowCounts experiment 5/4/2/4, traderDeep 1/2/1/0, moot
  8/17/10/7. Every seed proposed once and linked once, link
  still active at the last-living snapshot; standing there 105
  (93501, day 85), 199 (93502, day 70), 0 (93503, day 50 —
  measured snapshot, see metric review), 175 (93504, day 100).
  Scale regional on all four. Readiness met on 93502 and 93504
  at their last non-collapsed snapshots.
- **P-DIST (r91 metric review item):** final-census plants
  distribution is measurable only on the surviving seed — the
  three lost villages end with an empty final census (0/0), so
  their distribution is unrecorded, not zero. 93504 alive:
  [8, 12, 13, 14, 38, 38, 38], median 14. Knowledge concentration
  confirmed on a survivor: three villagers know 38 plants each,
  four know 8–14. The mean (23) hides the split; the
  distribution is the finding.
- **W3-BASE (comparison only):** 23 fights, 13 kills (93501 2f/1k,
  93502 7f/3k, 93503 3f/0k, 93504 11f/9k; fought damage medians
  0.5 / 0.345 / 0 / 1). **W4 (descriptive only — NOT re-judged;
  r90 judged it):** 18 fights / 1 kill (93501 8f/0k, 93502
  8f/1k, 93504 2f/0k, 93503 none).
- **M4 people: 11 transcripts sense-read, 0 senseless.** Count
  bar (>=10) MET on sittings actually produced — no
  pre-registered extra sitting needed (93503 died day 67, so
  it produced no day-80 sitting; the panel still yielded 11).
  Rotation held: max consecutive more/details picks 2 in every
  transcript. See people check below.
- **M5 winnable (descriptive, by endReason): 1/4 survived**
  (93504, day 101); 93501 lost day 90, 93502 lost day 82, 93503
  lost day 67 — all three reached regional scale first.
- **STAY-GREEN: 0 mislabels** on all seeds.

## Village assessment, in plain words

One village made it through, three did not — but all four climbed
to regional standing and formed a lasting link before they fell
or finished. The knowledge economy still moves (150 good lessons,
moots everywhere), and the new finding is about what knowledge
cannot move: the tricks for the bigger beasts.

- **93501 (lost, day 90, wave 4, regional):** last living snapshot
  day 85, 4 people, standing 105, link active, 30/30 lessons.
  Luke the librarian asked twice for help — food, then a wound —
  and kept his word in the record. Its beast-ask story is one
  beast: buffering, asked about 12 times, taught never.
- **93502 (lost, day 82, wave 4, regional):** last living snapshot
  day 70, 7 people, standing 199, readiness fully met, link
  active. The strongest village on paper, gone twelve days
  later. Its villagers knew three wave-3 tricks by observation
  (redactor, terms_of_service, callback) that no fire-side ask
  could ever teach.
- **93503 (lost, day 67, wave 3, regional):** last living snapshot
  day 50, 6 people, link active, 32/32 lessons. Aroha the comic-
  shop owner asked for help with a wound; Lola the journalist
  asked for food and a haul. Died before the wave-4 window.
- **93504 (survived, day 101, wave 4, regional):** 7 alive —
  Sofia the locksmith, Thabo the taxi driver, Dmitri the
  appliance repair tech, Suchart and Seo-yeon the mechanics,
  Victor the mason, Amina the midwife. Standing 175, readiness
  met, link active, 50/67 lessons. Sofia's arc is the panel's
  human face: day 45 she needs food hands, day 80 she reports
  the food handled and asks for water help instead — honestly
  deferred because she is out on the road. One person across
  three months, keeping her own books.

What they knew: every village reached regional with an active
link; villagers learn wave-3 tricks by surviving encounters, not
by asking. What was missing: any fire-side way to learn a
wave-3+ trick — 31 of 37 asks hit that wall, 23 of them repeats
of the same dead end.

## People check (all 11 transcripts read)

- Luke (93501, librarian, days 45 + 60): food favor → promised,
  then wound favor → promised, then gossip (returns, foraging).
  The "X is back, walked in like they'd never left" template
  repeats across four returnees — a news ticker, not a loop
  (maxRepeat 1, rotation more,more,react,more,more).
- Oliver (93501, veterinarian, grieving, day 80): "I keep
  expecting to see them by the fire" → comfort → "we're the
  control group... watched" theory. Grief spoken, engaged.
- Barbara (93502, programmer, day 45): favor with a dead
  intermediary — "I asked Erich about the pantry run — Erich's
  gone." Coherent, promised, dawn at the creek bend.
- Gedion (93502, vintner, day 60): food favor → promised, then
  "Teach me something from the wild" → "There's more, but
  that's for another fire." A plant, not a dodge.
- Zoe (93502, journalist, day 80): NOTED, not flagged. The
  sitting never engages its favor want (final resolution
  unestablished) — the picker chose gossip throughout (Valeria
  back, Yaroslav's garden, Boris's story). The gossip itself is
  coherent and plants threads; it is a gossip sitting, not a
  senseless one. Same noted-not-flagged treatment as r91's Luis.
- Aroha (93503, comic-shop owner, day 45): wound favor →
  promised, short and complete.
- Lola (93503, journalist, day 60): food favor → promised →
  haul invite → left. "Talking helps. Then it hurts. Then it
  helps again."
- Sofia (93504, locksmith, days 45 + 80): food favor → promised;
  day 80 she closes that book herself ("we got it handled") and
  opens a water need, honestly deferred while she is on the
  road → stated. The continuity the sense bar asks for.
- Ofelia (93504, cook, day 60): wound favor → promised →
  "Come see what I found."
- No verbatim repeats anywhere (maxRepeat 1 on all 11); no
  fabricated shared history; every sitting ends promised,
  stated, or engaged except Zoe's gossip sitting (above).

## The blanks this run fills

1. **Beast-trick thinness (r91 blank) — DECOMPOSED, not just
   re-measured.** Asked 37 / taught 6 / none-no-counter 31 /
   none-other 0; 23 repeat-futile; all wave-3+ monsters
   counterless in data; observation channel (villagerTricks)
   proven working on all four seeds while the ask channel
   returns none for those same types. The fix shape is a
   proposal (counter fields from villagerTrickDefs, or
   counterTeachable consulting villagerTricks), not a silent
   edit.
2. **Plants distribution (r91 metric review) — REPORTED.**
   Survivor distribution [8,12,13,14,38,38,38], median 14:
   knowledge concentrates in a few heads. Lost villages'
   final censuses are empty, so their distributions are
   unrecorded — next run should snapshot the census at the
   last-living deed checkpoint, not only at seed end.
3. **No game change.** No bug found in ask code (class B = 0);
   the seam is content/wiring and is left for a design call.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
hidden_files/telemetry-baselines/deepening.json (r90 4-seed sums,
reseeded in r91), metrics w3fights, engaged.w3, fightsTotal,
fightsByWave.3, current = r92 4-seed panel: **QUIET (4 files,
4 metrics, no large deviations).** Baseline NOT rolled forward:
a quiet panel is not a reason to churn the reference, and this
panel's composition (3 lost villages) differs from r90's
all-full-window panel.

## Metric review

- **93503 standing 0 at its last-living snapshot (day 50, pop 6,
  scale regional):** regional scale with zero standing looks
  inconsistent on its face. It is reported exactly as the
  instrument read it; whether deed snapshots stop early or
  standing resets on some path is an open instrument question
  for the next run, not a claim about the game.
- **P-DIST needs a last-living census snapshot:** final-census-
  only distribution is unmeasurable on lost villages. Next
  run: record the census at the last deed checkpoint with a
  living roster.
- **Driver asks bypass UI gating (disclosed):** the real UI
  offers the beast-tricks topic only when counterTeachable()
  is non-null, so a live player cannot repeat-futile-ask the
  way the driver does — the live symptom is the topic
  vanishing (or teaching an unrelated wave-1/2 trick) for
  wave-3+ beasts, not 12 identical asks. The decomposition
  stands: wave-3+ tricks are unteachable via askAbout in any
  UI state. Repeat-futile counts measure the driver's
  persistence, not a player's experience, and are labeled so.
- No pre-registered metric was re-scored mid-run. B-ASK, B-USE,
  K-CONTEXT, P-DIST, M4, M5, STAY-GREEN are reported exactly as
  pre-registered.

## Harness

scripts/journey-deepening-r92-20261104.js (r91 lineage + beastAsk
decomposition: per-ask trigger / slainUnknown / noCounter /
teachableBefore / taught / class). Analyzer:
scripts/analyze-journey-deepening-r92-20261104.js (B-ASK class
totals + counterless-type table + repeat-futile detection +
P-DIST). Proof:
scripts/test-journey-deepening-r92-instruments-20261104.js —
55/55 (classifier six classes incl. none-other cases, rotation,
analyzer K fixture + B-ASK fixture + plants distribution).
Per-seed JSONs and 11 transcripts: goal hidden_files evidence
2026-11-04 (journey-deepening-r92-seed9350*.json,
journey-deepening-r92-transcript-*.txt). Prereg + this note
mirrored in repo evidence/2026-11-04/.

## Regression gate

`node scripts/check.js --quick` with
--cacheDirectory=/tmp/jest-cache-playtest: 284 passed, 6 failed
in 502s (this run, unlike r91's hung gate, ran to completion).
The 6 failures are all pre-existing master-state failures in
areas this run did not touch, and none names an r92 file:
test-measurement-proof-update, test-measurement-workflow,
test-mobile-combat-cadence (2 assertions), test-occupation-
panels, test-phone-frame-proof (stale receipt), and
test-establishment-r20-fixes-20261020 (racks-full voice gate).
This run changes zero game code (three new scripts files +
evidence notes) and its own proof test is 55/55, so these
failures are reported, not owned, and do not block the
tooling-only landing. The tree stayed clean through the gate
(no stray gate writes).

## Verdicts

- **Reachable: yes, with a named hole.** Regional links, standing,
  readiness, wave-4 fights, moots, and lessons all occur under
  ordinary competent play. The hole: wave-3+ beast tricks are
  not reachable through conversation at all — only through
  surviving two encounters, which the game never tells the
  player.
- **Fun: yes.** Villages feel alive — favors kept across months,
  grief spoken, gossip with continuity, Sofia closing her own
  food favor and opening a water one. The sharp edge is the
  ask wall: a player who slays a wave-3 beast and asks about
  it at the fire gets nothing teachable, ever, for that beast.
- **Winnable: progressing through this window, not through it.**
  The deepening window delivers links, standing, and readiness,
  and villagers do learn wave-3 tricks by observation — but
  the conversation path to that knowledge is unwired, and the
  wave-4 kill step itself remains r90's open problem (descriptive
  1 kill in 18 wild W4 fights here, not re-judged).
