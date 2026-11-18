# Journey crisis r240 — run note (Lane B, leg 6)

Adoption closeout. Base: master `29b36f16b` (journey-landing r144 adoption
closeout). Panel: oracleV2, 150d death-aware +10d tail, 5 fresh seeds
14521–14525 (band verified fresh in the prereg). The timed-out run's
evidence was adopted as found; every number below was re-verified from the
analysis log and the per-seed JSONs, and every driven transcript was read
in full by the adoption worker.

## Leg question

Do r238's verdicts hold on the new base — and does the r235 DRY3 fix hold
in the wild on the crisis leg, with notickexact, triodrought, REL-MOURN,
holdervoice, muster-growth, and the pocket repair behaving clean under
crisis deaths?

**Answer: yes, except one thing.** DRY3 holds (0 dry lines), the
r201 settled-favor gate holds everywhere except one sitting, and the
instruments all behaved. The exception is a real C3b regression — a false
settlement on seed 14525 day 38 — reproduced from the panel data, fixed
in this adoption, proof-tested before/after (17/17 after, 9 fail before).

## Panel numbers (verified)

- Survival: 14521 140d game-over, 14522 113d game-over, 14523 133d
  game-over, 14524 133d game-over, 14525 150d horizon. **4/5 game-over,
  median 133d** (r238: 3/5, median 135d; r230: 4/5, median 138d).
- Sorties: attempts 41, ok 26, refused 15, cleared-with-nothing-left 5,
  deltaBad []. D1 snapshots 41/41 delayed ≥ 3 attempts. D3 drift
  unknown [].
- FIGHT-1: okSorties 26, cleared 15, brokeAfterFight1 11,
  multiMonsterCleared 13/22. No cleared fight-1 with vTaken ≥ 70 (max
  54) — the standing Q4 live-play confirmation trigger did NOT fire.
- Conversations: 39 driven, fabricHits 0. DRY census 0 dry lines — GO.
- Raids fired on all seeds (13/7/9/10/12). Gorge nights 275, 319,585
  kcal gorged. Sortie fights 44.
- Supply: ruin searches 1 total (14524, 0 med items), med acquisitions
  0, pharmacy 0 days on every seed. RUINROAD stays parked; cumulative
  now 0 acquisitions in 315 ruin searches. Medic-duty blocked 48–109
  per seed; cures by ability 9–25 per seed, by medicine 0.
- Stranger: 0 kills on all seeds — VACUOUS (the "a stranger" channel
  never fired on this band).
- NODEAWAY: 19 total exclusions across refusals, 10 alive-bench
  refusals, worst single bench snapshot 4 (14525 d64) — vs r238
  16/9/worst-5.
- TITAN: 4 slain in the field (14521 d90 Gulmira; 14523 d87 Victor;
  14524 d92 Nina; 14525 d114 Victoria). 14522: 15 refused outcomes, 5
  gate refusal lines on distinct days (83, 92, 99, 100, 101), 0
  repeats — **TITAN-REFUSAL CONFIRM GO**.
- HOMEBODY: 30 picks, 0 qualifying, 0 voice lines — vacuous (no
  companion ever stood at range 0 on a qualifying pick).
- NOTICKDEFER: 0 deferred, 0 leaks — the deferral never fired on this
  band.
- Deathcleanup: 9 deathCleanups, 0 removalCleanups, 8 planSeeds, 0
  dead-holder entries, no unseeded plans, no ignition-after-death.
  Seeds 14522/14524/14525 have null winPlan stats — no plan was ever
  seeded there. TRIODROUGHT: partyTrios 0 on every seed.
- POCKET: 936 "No path there." lines (travel noise, no bar).
- R57 D3 death mismatch, 14525 d79 Neema: say-only death lines with
  deathsDuring [] — the corpse list confirms Neema died d79 of a
  monster. Descriptive, not a finding.

## Villages, in plain words

Four villages died out between day 113 and 140 — not to one disaster
but to the slow grind: wounds that wouldn't close, a couple of
starvations, monsters picking people off one by one. The fifth (14525)
was still standing at day 150 with two people left. Nobody reached the
table, nobody reached national standing, nobody took a full seat. The
crisis itself all fired the way it should — raids came, monsters
lingered and gorged at the treeline, sorties went out, favors were
asked, people mourned their dead out loud. The villages bend the same
way they did on r238 and r230. The wall hasn't moved.

## People check (C3 — all 39 transcripts read in full)

- **C3b REGRESSION — Amanda false settlement, seed 14525 day 38 —
  REPRODUCED AND FIXED IN THIS ADOPTION.** See the regression section
  below.
- The other four sittings carrying a "settled" line are clean. Two
  (14521 d21, 14523 d14) say "Nobody's settled it" about an unsolved
  murder/ambush case — the cases genuinely are unsettled. Two (14525
  d68, d75) close with "Good — what's been happening, settled" about
  the conversation's topic, which the sitting genuinely talked
  through; the favor is never named, and on d75 the water favor's
  unsettled state ("We still need to get home and unload what we
  have") is spoken plainly in the same sitting. That is the r201
  gate working as designed.
- **REL-MOURN: PASS.** Five mourning lines, every name a genuinely
  dead villager: Lesiba (died d87 starvation, mourned d90); Brayden
  (d31) and Salvador (d33) ("We lost Brayden and Salvador this
  week," d33); Tyrone (died d33 sickness, mourned by Amanda d38);
  Nurbol (died d73, killed by the Reunion d74, mourned d74–d75).
- **Recaps: clean.** 35 recap picks; every label names its topic
  ("Still on that personal stuff," "Still on that warning," "Still
  on that question," and the one "Still on that debt" — Amanda's
  repay want, consistent). Zero "Nothing important" recaps (C3d GO).
- **DRY: 0 lines.** DRY3 and DRY2 confirms hold.
- **Doubt (14523 d26, 4× in one sitting):** the count meets the
  r238 blemish bar's trigger, but the substance is honest — four
  distinct, escalating replies ("What's that supposed to mean?" →
  "What are you getting at?" → "I've told you what I've told you."
  → "I've said what I've said. That's all there is."), the warmth
  visibly cools, and the conversation ends naturally. A person
  closing down after four challenges, not a wall. No fix.
- **Mime-walking (14524 d92, 1×):** Nina speaks only Ukrainian — no
  shared words — so the sitting is conducted in mime, and the mime
  ("pointing at themselves, then at you, then toward the trap
  line") is the correct way to communicate with her. One day only;
  the r238 bar (3 days running) does not reproduce. No fix.
- **Wren cache note:** zero "Wren" mentions in the whole corpus.
  Does not reproduce. No fix.
- **Voted ambush case re-appearing under a new number:** case_4
  (Deborah's ambush) appears only in 14523 d14; case_6 (Ellis's
  murder) only in 14521 d21. Different victims, different cases, no
  re-appearance. Does not reproduce. No fix.
- **Resume-opener quote SPLIT:** one resume opener quotes a stored
  line (14524 d24) — a single coherent entry with a complete quoted
  sentence inside it, not split across two entries. Does not
  reproduce. No fix.
- **Funeral-mend / stage-0 / deferred-ask / holder-voice /
  muster-growth:** zero hits in the driven transcripts — vacuous on
  this band. (The four funeral feasts in the day-by-day record —
  Lesiba, Brayden, Salvador, Tyrone — are honest mourning: names and
  causes match the death record.)
- **Trail-talk:** no verbatim repeat 3×+ in one outing. The "On the
  way, X stops and actually teaches you something" line appears once
  per seed with different teachers. Clean.
- **Polish note, not a defect:** "Another time. The village needs
  me here." is served identically twice in one sitting in two files
  (14521 d58, 14524 d33) — the player asked the same invite twice
  and got the same true answer twice. A re-ask variant would be
  nicer; the answer is honest both times.

## Regression: Amanda false settlement (C3b, r201)

**What the player saw (seed 14525, day 38, Amanda Ji).** Amanda asked
the scholar to help with her wound on d18 ("My cut needs a second
pair of hands"). The scholar promised ("I'll come back to help"). The
promise rotted the next dawn — one day later — while the scholar was
blocked from tending her (wrong side of the Haven door, and her wound
sat at 73 HP, above the 70 threshold for care). On d38 she was mauled
again by The Redactor (-39 health) and the repay sitting declared the
wound business over three times in one conversation: "You said you'd
help with this wound. ...It's done now. Forget it." / "Good. Then
we're square." / "No — that one's settled." Then the recap said
"Still on that debt." She died d47 of a monster, never helped.

**Root cause.** A broken promise is not a settled debt — the deadline
passed, but the need itself can still be live. The repay want's
settled language was never gated on the need being gone: the opener's
'broken' branch served "It's done now" for any broken favor and
recorded the settle (broken → acknowledged), the engageBeat's
'broken' pool and its "we're square" fall-through claimed the account
even, the deflectBeat's settled pool claimed "that one's settled," and
the follow-up path (`convoFavorFollowup`) carried the same line. The
r201 close-line gate already states the house rule — "a broken or
lapsed favor is not a settlement" — but it only guarded the
close-line; the repay want's own lines bypassed it. The favor's own
need check (`convoFavorNeedLive`, the shared threshold the ask and
liveness paths already agree on) was sitting unused at these sites.

**Fix (src/js/convo-wants.js, 6 sites, one gate).** Wherever the repay
want or the favor follow-up would claim a broken favor is done, it
first asks whether the favor's need is still live. When it is, the
lines say so plainly — "You said you'd help with this wound. It's
still open — but that promise is dead." / "About this wound — still
open. The promise died, not the need." — and no settle is recorded,
so the favor stays broken and the need can be re-asked or tended.
When the need really is gone, the old lines are untouched ("It's done
now," "we're square," the settled pool). The deflectBeat falls through
to the unpaid pool for a live need. The same guard covers a favor
that was legitimately settled and then re-wounded ('acknowledged' +
live need) and the stale opener.

**Proof test:** `scripts/godpath/test-repay-broken-live-need.js`
(Amanda's shape: broken heal_help favor + wound at 40 HP; control:
broken favor + wound healed at 90 HP; re-wounded after a legitimate
settle). **17/17 pass after the fix; 9 fail before it** (all seven
Case A assertions — opener, engageBeat, staleOpener, deflectBeat,
follow-up, favor stays broken — plus both Case C assertions), which
is the transcript defect reproduced in the harness. The control case
passes before and after: a broken favor whose need really is gone
still settles exactly as before.

## C3 graduation items — disposition

- Wren cache note: not reproduced (no Wren in the corpus). Left out;
  remains an owed follow-up only if it re-appears.
- Mime-walking: not reproduced as a blemish (1 day, correct mode).
  Left out.
- Doubt-stonewall: count trigger met, substance honest (escalating
  replies + warmth cost). Left out; no fix.
- Voted ambush re-appearance: not reproduced. Left out.
- Resume-opener quote SPLIT: not reproduced. Left out.

None of the five graduation items is fixed in this merge; only the
Amanda regression (reproduced, root-caused, proof-tested) lands.

## Verdicts

- C1 (bend, not break) GO — every game-over has a named cause
  (wounds, starvation, monsters, the wild); no siege-mechanic
  failure, no softlock; 14525 reached the horizon.
- C2 (episodes fire + gates hold) GO — raids on all seeds, fought
  resolutions present, D1 41/41, deltaBad [], D3 drift unknown [].
- C2b (linger-conditional gorge/sortie) GO — lingerer sets formed
  on all seeds; gorge nights 65/56/30/45/79; sorties 8/8/7/7/11.
- C3 (people check) GO with the C3b regression fixed in-run — 39/39
  transcripts read, fabricHits 0, DRY 0, mourning true, recaps true.
- C3b SETTLED-FAVOR CONFIRM: one false settlement found, fixed
  in-run with proof test (see above). All other settled lines clean.
- C3c CLOSED holds — no resume opener names a changed favor.
- C3d CONFIRM GO — zero "Nothing important" recaps.
- DRY3 / DRY2 CONFIRM GO — 0 dry lines.
- FUNERAL-MEND CONFIRM: vacuous on the driven transcripts (no
  funeral-mend line fired); the four funeral feasts in the record
  are honest.
- TITAN-REFUSAL CONFIRM GO — 5 gate lines on distinct days, 0
  repeats; 4 titans slain in the field.
- WRAP-CHECK GO — wrapMissing false on all seeds.
- C7b GO — buried list and corpse-cause counts reported per seed.
- Q4 live-play trigger NOT fired — no cleared fight-1 with vTaken
  ≥ 70 (max 54).
- Reachable / fun / winnable: the crisis content is reachable and
  fires; the people are alive in it (mourning true, doubt escalates,
  mime works where words don't). Winnable is not measured by this
  leg — no plan was ever seeded on three seeds, no trio ever formed,
  no village reached national or the table. The wall stands where
  r238 left it.

## Gate adjudication (check.js, run's own gate log: 335 passed, 6 failed)

All 6 failures are the standing set — **0 attributable to this leg**:

1. measurement-proof-update — proof inputs not current (standing).
2. measurement-workflow — retained neutrality proof (standing;
   the staleness pair).
3. living-garden-deed-attainment — 120s timeout under load
   (standing).
4. phone-frame-proof — stale receipt (standing).
5. one-person-army-deed-attainment — 120s timeout under load
   (standing).
6. ladder-bundle-20261108 control — ambient raid fires 0 without
   delivery (standing control).

Post-fix re-run (after rebase onto current local master): the new
proof test 17/17 + `check.js --quick` — result recorded in the
adoption closeout below.

## Telemetry

Baseline `telemetry-baselines/crisis.json` (goal hidden_files):
defendedFights 95, playerFights 0, latelyDefenseCount 0. This panel:
defendedFights per seed 27/11/13/19/24, **sum 94, mean 18.8**; the
driver records no playerFights or latelyDefenseCount key. The
baseline's units are the open question the prereg flagged (metric
review 4): its note says the 95 sits inside a historical 3-seed
range of 43–143, which reads as a panel sum, while this panel is 5
seeds on a much newer base — a 5-seed sum of 94 against a 3-seed
baseline is not a comparison. Per-seed defended fights (11–27) sit
inside the implied historical per-seed range, and per-day rates
(0.10–0.19) are consistent across seeds. **No LOUD anomaly. Baseline
NOT rolled** — per the prereg, a single panel's variance never rolls
a baseline, and the units question stays open for the next run.

## Metric review (carried to the next run)

- (r240-1) The r201 gate guards the close-line but not the repay
  want's own lines — a broken favor's settled language bypassed it
  for five months of runs. Fixed here; the next crisis panel
  re-checks every settled line the same way.
- (r240-2) The "We're square." / "Don't mention it." player lines
  in the repay menu are offered whenever no obligation is open — for
  a broken favor with a live need, the player can still claim
  "we're square" even though the NPC now speaks honestly. The NPC
  side is fixed; the player-side option is a design question, not a
  false claim by the game. Carried.
- (r240-3) Telemetry baseline units (crisis.json): sum or mean?
  Verify before any roll (carried from r238-4; still open).
- (r240-4) The invite-decline "Another time. The village needs me
  here." has no re-ask variant — identical twice in one sitting.
  Polish, not a defect.
- (r240-5) HOMEBODY and NOTICKDEFER were both vacuous again (0
  qualifying picks; deferral never fired). If the next crisis panel
  is vacuous a third time, the watches should be retired to
  descriptive-only or re-instrumented.
- (r240-6) No trio formed on any seed (partyTrios 0) despite 41
  sorties launched — the trio drought persists as a descriptive
  watch; the triodrought pilot's carry (0.00→0.88 in its own panel)
  is not visible on the crisis band.

## Adoption closeout

- Fix + proof test + run note committed via the worktree's own
  `scripts/safe-commit.sh`; rebased onto local master; proofs
  re-run; merged --ff-only; tree released; worktree removed;
  rotation-b advanced 6→7; lock deleted (run_id
  `2026-11-18T12:56:29Z` verified first); main tree verified clean.
  (Commit hashes recorded in the adoption report to the parent.)
