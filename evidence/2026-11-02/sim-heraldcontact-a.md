# Loop A 0725Z round — scale-onramp: herald-CONTACT diagnosis DIAG-GO

Run: fleshout-loop-a-20261102T0725Z, arm sim-heraldcontact-a, axis scale-onramp.
Worktree branch: sim-heraldcontact-a. POLICY/INSTRUMENT SIDE ONLY — zero
`src/js` changes (git diff on src/ empty at report time). This arm sounded
nothing, deferred nothing, and mutated nothing: it is a pure diagnosis of
the 0605Z finding (12/16 villages never attempted the herald at all).
Prereg committed BEFORE any judged sim (commit 03f47a736, below).
Sibling Loop B trees/branches NOT touched. No titan canon doc exists in
docs/ — stated, none invented (same finding as 0445Z and 0605Z).

## Verdict: DIAG-GO (all bars pass)

- (a) COVERAGE: 8/8 seeds classified with a named reason, 0 UNCLASSIFIED.
- (b) SPLIT: no dominant reason — max 2/7 non-attempters (29%) — so the
  full split table below IS the deliverable, per the prereg.
- (c) PROOF: classifier unit proof 19/19 green
  (`scripts/test-heraldcontact-classify.js`); corpus validator green,
  exit 0, reproducing the verdict from the corpus alone
  (`scripts/test-heraldcontact-a.js`).
- (d) PURITY: zero `src/js` changes.
- (e) WALLS: per-seed table below; band: national 5/8, table 6/8,
  won 6/8, wave-4 5/8, wave-5 0/8, median 90.5d, max 152d.

## What was built (stays — the reusable contact instrument)

- `scripts/heraldcontact-replay-20261102.js` — adapts the arrears
  replay with the intervention removed: daily pipeline sampling
  (unlockedWave, scaleRank, omen stage/day, herald-monster presence,
  pendingEncounter) before the base policy's daily; a startCombat
  interceptor computing a readiness row with the DEPLOYED
  `Game.titanCallReadiness('herald')` at every REFUSED herald
  attempt; a say wrapper capturing herald-related lines.
- `scripts/heraldcontact-classify.js` — pure classifier implementing
  the prereg's decision order (see Classifier fix below).
- `scripts/heraldcontact-split-20261102.js`, `scripts/test-heraldcontact-a.js`
  (corpus validator), `scripts/test-heraldcontact-classify.js` (unit).
- Frozen stack (arrears prereg): tribfloor leadfeast + windefer +
  seatdrive + fullseat-diag, herald-v1 instrument. DAYS=180
  death-aware cap. Anchor at pilot: b848d5026.

## Definition used (prereg, grounded in the prior replay code)

A herald attempt is one row of the deployed herald instrument
(`t.attempts`, `mid === 'herald'`) — the game/policy actually called
`Game.startCombat` on the herald (FOUGHT / REFUSED / THROW). NOT the
readiness check (exists only at refusals; would misclassify FOUGHT
attempts as no contact) and NOT the sound (a later policy act this
arm never performs). First-readiness-check day = day of the readiness
row at the seed's first REFUSED attempt, if any.

## Pilot — fresh band 97301–97308 (verified unspent before prereg)

Band check (arrears method): no `*9730*` filename under evidence/ or
scripts/; no 97301–97308 token (word boundary) in any `*.md` evidence
file, any script, or any `SEEDS=` list; no live claim names the band;
971xx/972xx bands NOT reused. (One substring hit — `3a97301eb` inside
a commit hash — is a hash fragment, not a seed assignment.)

Per-seed (code = prereg decision order; gate/omen days from daily samples):

- 97301: ATTEMPTED — 4 attempts, all REFUSED/MUSTER-GATE, caller
  wild-contact (days 78, 78, 78, 89). First readiness check day 78,
  total 11, ready TRUE at all 4 refusals. Pipeline: wave4 day 48,
  regional day 47, omen start 50, stage 2 day 59, monster present
  days 59–91. End: 91d, over-other, nat 1, table 1, won 1.
- 97302: OMEN_STUCK — omen stage 0 at end (started day 86, run ended
  day 90: stage 0→1 needs ≥4 days + 35% roll, so the run ended at the
  boundary). Wave4 day 84, regional day 67. End: 90d, over-other,
  nat 0, table 1, won 1.
- 97303: NO_OMEN — wave4 day 62 + regional day 47, omen never started,
  village lost day 84. That is 22 days of the 10%/day omen start
  never firing (P ≈ 0.9^22 ≈ 9.8%): an unlucky tail, not a broken
  gate. End: 84d, village-lost, nat 1, table 0, won 0.
- 97304: LOST_BEFORE_WAVE4 — wave4 never reached (regional day 55),
  village lost day 89. End: 89d, village-lost, nat 1, table 0, won 0.
- 97305: OMEN_STUCK — omen stage 1 at end (started day 85, run ended
  day 92: stage 1→2 needs ≥9 days + 40% roll, i.e. day 94 — ended 2
  days short). Wave4 day 81, regional day 60. End: 92d, over-other,
  nat 0, table 1, won 1.
- 97306: DIED_BEFORE_WAVE4 — wave4 never reached (regional day 47),
  run ended day 90, over-other. End: 90d, over-other, nat 0,
  table 1, won 1.
- 97307: LOCATED_NO_ENGAGE — omen stage 2 day 129, monster present
  days 129–152 (through the end), ZERO attempts, no pending encounter
  at end. Wave4 day 116, regional day 57. End: 152d, over-other,
  nat 1, table 1, won 1.
- 97308: DIED_BEFORE_WAVE4 — wave4 never reached (regional day 49),
  run ended day 109, over-other. End: 109d, over-other, nat 1,
  table 1, won 1.

## Reason split (7 non-attempters; no dominant reason)

- OMEN_STUCK: 2 (97302, 97305) — both runway truncations, not stuck
  gates (see per-seed notes).
- DIED_BEFORE_WAVE4: 2 (97306, 97308).
- NO_OMEN: 1 (97303).
- LOST_BEFORE_WAVE4: 1 (97304).
- LOCATED_NO_ENGAGE: 1 (97307).
- NEVER_REGIONAL: 0 — every seed reached regional (days 47–67).
- NEVER_WAVE4 (survived): 0 — the three wave-4-less seeds all ended
  early (89–109d), none survived to cap.

## The finding, stated plainly

There is no single contact wall — the 7 non-attempters split across
five reasons — but the shape is clear: the pipeline leaks at EVERY
stage, and the leaks are mostly time, not gates. Three seeds never
unlocked wave 4 in 89–109 days despite reaching regional at days
47–55 (the wave-4 deed bar, not the scale gate, held them). Two
seeds started omens so late (days 85–86) that the run ended before
the omen could locate. One seed sat in the 10%/day omen-start lottery
for 22 days and lost. And one seed — the sharpest single case —
located the herald, was told to sound the call, and never engaged
it in 23 days (see Sense below). The 0605Z "12/16 never attempted"
is therefore NOT one bug: it is a pipeline with a slow stage at
every step, plus one genuine engagement failure (97307) whose
mechanism is still unknown.

Two qualifications on the one ATTEMPTED seed (97301): (1) all four
attempts came via wild-contact — the scholar stumbling on the
herald — never via a deliberate march or a sounded muster, and the
first attempt came 19 days after placement (day 59 → day 78);
(2) readiness said READY (total 11) at every refusal, yet the fight
gate still refused MUSTER-GATE — correctly, by the no-solo-titans
rule: readiness measures the CALL (a sounded call would muster
11), while startCombat gates the FIGHT on an existing muster, and
no muster existed because neither this diag arm nor the base policy
sounds the call. "Ready but refused" is therefore not a
contradiction; it is the call-vs-fight distinction, and any future
arm that sounds must re-prove the sound path in sim (as the
arrears evidence warned).

## Sense-testing (real lines only, judged for meaning)

Quoted lines are anchored to the lair/escalation/war-path patterns
(see Metric review for why the broad herald-line capture is NOT
quoted). Two lines bearing directly on attempts/non-attempts:

1. s97307, day 129 — the lair line, the moment contact became
   possible: "🗺️ Scouts found its lair — tile 7,4. THE HERALD — the
   sky, getting bigger. It is WAITING. You cannot face it alone.
   Sound the call." Judgment: this reads humanly and urgently, and
   it names the exact next act. What follows is the finding: 23
   days, five escalation strikes/feeds, and zero engagements. The
   village was TOLD, in plain words, and never went. The failure is
   not knowledge or signaling — it is engagement behavior (the
   policy never routes to a located titan, or never acts on the
   pending knowledge). That mechanism is the next arm's question,
   not this one's answer.
2. s97307, day 149 — the cost of deliberation, still unanswered:
   "🌪️ THE HERALD fed in the night — 1,950 kcal gone from your
   stores. It is eating the realm while you deliberate." Judgment:
   the game narrates the price of waiting in plain words, and the
   village keeps paying it without acting. The line is honest and
   legible; the response is absent. (Small honesty wrinkle on the
   same seed, day 139: the same fed line fired with "0 kcal gone"
   — "It is eating the realm" when nothing was eaten. Not chased;
   noted for the coordinator.)

s97307, day 152 (end): "THE HERALD came. Named and located — the
war council knew its face." — the run's own epitaph for a located,
never-faced titan. s97305, day 92: "THE HERALD came. Named, not yet
located." — the stage-1 epitaph, confirming OMEN_STUCK from the
game's own mouth.

## Wall numbers (this band only, never pooled)

- national(end) 5/8, table 6/8, won (any-win; seat kind NOT recorded,
  so no full-seat claim) 6/8, wave-4 5/8, wave-5 0/8, attempted 1/8.
- Median survival 90.5d, max 152d. EndReason mix: over-other 6,
  village-lost 2, survived 0 (table/win with end over-other is a
  won-then-ended run, as in prior bands).
- Death causes, 270 total: combat 128 (47%), villager combat 66
  (24%), the wild 30 (11%), expedition 7, the phoenix link 9,
  sickness 6, a wound that wouldn't close 5, ambush 4, starvation 3,
  lockjaw 2, monster 2, the arena 2, singletons (The Anaconda
  Empress, Glasswing Darter, a stranger, a heron that isn't quite
  there when you look at it, alien, the night) 1 each. No new death
  shape vs prior bands.
- Instrument errors 0, interceptor errors 0, on all 8 seeds.

## Classifier fix (prereg is the authority — not a re-score)

The first validator run returned NO-GO with 3 UNCLASSIFIED
(97304/97306/97308): the classifier had required regionalDay ==
null on the wave-4 legs, but the prereg defines those legs as
"wave 4 never reached, endReason X" with NO regional condition —
and regional is routinely reached before wave 4 (days 47–55 here).
The code was fixed to the prereg text (wave-4 legs key on wave4Day
== null only; the regional legs above already claim the
wave4-reached/regional-never case, so the legs stay disjoint), the
unit proof gained 3 regression cases (regional-reached wave-4
legs, 19/19 green), and the validator then returned DIAG-GO. No
bar, threshold, or code definition changed: the metric binding
(§14) is intact because the prereg text never changed — only the
implementation was corrected to it.

## Metric review (for the NEXT run, never this verdict)

- The broad herald-line capture regex (/herald|titan|omen|lair/i)
  is POLLUTED and must not be quoted: /omen/ matches "moment",
  which appears in routine villager lines ("studying it a moment",
  "The relief moment passes"), so most captured "herald lines" are
  routine lines, not herald lines. The lair/escalation/war-path
  lines quoted above were filtered by specific patterns and are
  genuine. Next contact instrument must anchor to "THE HERALD" /
  "Scouts found its lair" / "fed in the night" / "struck .* in the
  night" / "THE HERALD came", never to bare /omen/.
- The herald instrument's first/late refusal transcript snapshots
  came back EMPTY for s97301's four refusals (t.transcripts []),
  though the attempt rows themselves are present — the snapshot
  path needs investigation before any future arm quotes refusal
  sayDuring lines. Attempt rows + readiness rows are unaffected.
- Bar (b)'s dominant-share branch (≥50%) will rarely fire on a
  genuinely split pipeline: on this band the split table IS the
  result. Future diagnosis preregs should pre-register "split
  table" as a co-equal pass, not a fallback, when the question is
  classification rather than conversion.
- "Attempted via wild-contact only" deserves its own sub-code in
  the next contact prereg: a stumble-into refusal and a deliberate
  sounded muster are different contact shapes, and this band shows
  only the former.

## Findings (for the coordinator, not chased mid-run)

1. LOCATED_NO_ENGAGE (s97307) is the sharpest next question: a
   located titan, a lair line naming the act, 23 days of presence
   and escalation, zero engagements, no pending encounter at end.
   Next arm should instrument WHY the policy never routes to a
   located titan (scholar pathing? encounter generation? policy
   avoidance?) — it needs position/pending-encounter traces, not
   another band.
2. WAVE-4 UNLOCK is a co-equal wall: 3/8 seeds reached regional
   but never wave 4 in 89–109 days. The contact question and the
   wave-4 deed-bar question are separable; the next wave-4 arm
   should say which deed bar holds these seeds.
3. OMEN TIMING is a runway problem, not a gate problem: omens
   starting days 85–86 cannot locate before runs end days 90–92.
   Any intervention that opens the gate earlier (wave-4 unlock,
   regional timing) mechanically buys omen runway; no omen-rate
   change is indicated by this band.
4. The 0-kcal fed line (s97307 day 139) is a small narration
   honesty wrinkle, not a lever.

## Convergence state

scale-onramp stays converging (NOT converged): the contact gap is
now CLASSIFIED (8/8) with a full split, but no reason dominates
and the located-no-engage mechanism is unanswered. The next move
on this axis is a located-titan engagement instrument (finding 1)
and/or a wave-4 deed-bar arm (finding 2), not another unselected
contact band.

## Commits (this branch, coordinator merges —ff-only or not at all)

- 03f47a736 prereg (pilot 97301–97308, before any judged sim).
- b848d5026 contact replay + split + classifier + tests (pilot not
  yet run at that commit).
- CLOSING COMMIT (this evidence + corpus + classifier fix +
  regression tests; DIAG-GO, scripts stay). Corpus:
  evidence/2026-11-02/perseed-heraldcontact-a/ (pilot-s97301..97308
  .json, plus pilot.stdout/.stderr runner logs).

Ready for coordinator merge, pending ship. Nothing pushed, no
version bump, no live verification (ship loop owns deploys).
