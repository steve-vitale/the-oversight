# Journey crisis r230 — run note (Lane B, leg 6)

Leg 6 (crisis), run r230, seeds 14501–14505 (fresh band, verified per
`local_seed_band_freshness`). Base master `39eaa043e` (journey-social-life
r234). Prereg: `evidence/2026-11-17/journey-crisis-r230-prereg.md`.
Panel: 5/5 seeds exit 0. Driver
`scripts/journey-crisis-r230-delayed-20261117.js`, analyzer
`scripts/analyze-crisis-r230-delayed-20261117.js` (validated: reproduces
r229's full analysis byte-identically on r229's data).

## Panel

| seed | end | days | raids | gorge nights | sorties | convos | alive | pantry |
|------|-----|------|-------|--------------|---------|--------|-------|--------|
| 14501 | game-over | 138 | 11 | 68 | 8 | 8 | 1 | 0 |
| 14502 | game-over | 123 | 8 | 45 | 8 | 8 | 1 | 0 |
| 14503 | game-over | 141 | 7 | 4 | 4 | 8 | 1 | 0 |
| 14504 | horizon | 150 | — | 78 | 6 | 8 | 2 | 2000 |
| 14505 | game-over | 145 | — | 56 | 6 | 8 | 2 | 0 |

4/5 game-over, median 138d (r229: 4/5, median 122d). 14504 is the only
seed that held to the horizon — and the only one with food left in the
pantry (2,000 kcal).

## Verdicts (pre-registered metrics bind)

- **D1 GO**: snapshots 32/32, missing 0, delayed ≥3 attempts 32/32.
- **DRY2 CONFIRM GO** (binding): 0 dry lines on 40 transcripts,
  deflect_q 0 — no dry line on any surface, including the three r234
  fixed surfaces (composed topic line, probe stonewall repeat,
  confront line).
- **C1 GO**: every game-over is attrition with a named cause, no
  softlock seed (R181 SOFTLOCK 0).
- **C2 GO**: raids fire on all seeds; fought resolutions present (all 5
  D2 clears `fought(sortie-call)`); D1 snapshots all delayed ≥3;
  deltaBad empty; D3 drift unknown 0.
- **C2b GO**: every boundary-firable case fired or was refused with a
  recorded reason.
- **C3 GO**: all 40 transcripts read in full; fabricHits 0; no double
  confession (Kennedy d20 second confront correctly refuses to
  re-confess); no voiceLine prefix stacking ≥3; no stale-favor resume.
- **C3b GO**: "settled" lines 183, spot-checks pass — every settled
  close names a sitting that shared a real beat with the favor. One
  soft case: 14505 d43's close names the general thread ("what's been
  happening") rather than the sickness favor just tended; the sitting
  genuinely did the tending, so it is not a false settlement.
- **C3c holds**: no resume opener names a changed favor.
- **C3d GO**: recaps served while a favor/want is live name that want;
  "Nothing important" 0 in sayLines. The recap-empty pool fires honest
  distinct variants while a fulfilled favor is closed (14505 d53).
- **WRAP GO**: 40/40 marked, unmarked 0.
- **C7b GO**: buried per seed — 14501 Lucia Khan, Grace Moreau; 14502
  Fatima Nair; 14503 Tomas Popov, Priya Nair, Ray Bautista, Alejandro
  Zhang, Somchai Prasert; 14504 Ursula Ochoa, Felicia Du; 14505 Anh
  Diaz, Siva. Corpse causes: famine 2 (Karim d96, Quinn d79), disease 1
  (Papy d130 wound_fever), wound 2 (Papy d130, Avni d137 "a wound that
  wouldn't close"), thirst 4 (Liam d101, Dike d105, Sara d82, Sigrun
  d88). The wild dominates deaths; scholar deaths 0.
- **FUNERAL-MEND CONFIRM GO**: 35 funeral lines — 33 feast lines all
  honest about amounts and links (full feasts 1,500–3,000 kcal; partial
  feasts 296/400/600/1,314 kcal each state the shortfall aloud, "the
  feast could not buy back the full -8"; empty-pantry feasts say the
  links go unmended and trust -8 stands). The other 2 lines are the
  Callback wearing the dead — a different mechanic, not a feast.
  0 silent mends, 0 over-claims.
- **TITAN-REFUSAL WATCH**: 13 refusal lines panel-wide, each on a
  distinct (titan, day), 0 repeats — the r233 once-per-day dedupe holds
  in the wild.
- **DEFERRED-ASK WATCH**: "already handled" 0 — no r231 regression.
- **DEATHCLEANUP WATCH**: UNMEASURABLE BY INSTRUMENT this run. The
  driver records no deathCleanups stat and no winPlan census, so the
  watch cannot be scored from the panel. Reported as a driver gap, not
  a pass: sim-deathcleanup-b's 42/42 proof stands as the evidence.
- **STAGE-0 WATCH**: dlg:help offered where wants live (e.g. 14504 d75
  water haul; 14502 d17 forage_help). No sitting sat a full sitting
  with help never offered; nothing graduates.
- **NODEAWAY PANEL** (tracked, no bar): total 4, aliveBenchNodeAway 4,
  aliveBenchRefusals 3, worst bench 2 (14501 d128) — vs r229 0/0/0 and
  r228 38/9/worst-7. The muster-vs-travel surface engaged: 10 refusals
  (gateOneShort 6, supplyEmpty 3, availabilityDrain 1); all 3
  alive-bench rows are 14501, where both living villagers were out on
  node-travel business at d128. Descriptive only, no lever attribution
  with n=5.
- **Q6 RETIRED** (descriptive): gorge-after-clear id-matched 0; the 55
  name-matched cases are same-display-name collisions (two monsters
  called "Big Ugly", "The Eulogy", "The Callback" on different nights),
  not a cleared monster returning.
- **R88 missed-window**: 8, all moved-on-valve (14504 ×6, 14505 ×2),
  0 drawn-off. Descriptive Q1.
- **R82 defender steering**: latelySteered fired 5×, all early
  (d10–d27); latelyOffered/latelyFired 6×. F1 favor no-longer entries
  empty on all seeds.
- **R126 cross-check**: all ok:true — every boundary sortie had prior
  samples (waited-ge3 or sampled-lt3).
- **R122 gorge attribution**: attributedFields true on all seeds;
  single-attribution dominates (62/39/3/66/34), ambiguous only where
  two monsters share a name on the same night.
- **ARENA WATCH** (descriptive): 10 arena deaths in say lines (2/1/2/
  1/4 per seed) vs r229's 5. No win/loss instrument exists in the
  driver — say lines only narrate arena deaths — so this is a death
  count, not a win rate.
- **CASCADE WATCH**: scholar deaths 0 — no cascade.
- **STRANGER** (descriptive): 0 kills on all 5 seeds, VACUOUS.
  Eligibility: encounterEligible 0 days on every seed.
- **MEDIC-DUTY**: ability cures 13/18/13/18/11; medicine cures 0
  everywhere; pharmacy 0 days everywhere. Blocked need-days
  54/84/102/115/2. Supply: 2 ruin searches panel-wide (14501, 14504),
  0 acquisitions, 0 medicine items (14504's one scavenge item was not
  medicine). Cumulative 0/308 (prereg carried 0/306).
- **FIGHT-1**: okSorties 22, brokeAfterFight1 1 (14504 d58 Reunion,
  vFlee, vTaken 18 — the only break), cleared 21,
  multiMonsterCleared 18/19. D2 full-clear rate 5/22 (r229: 3/19).
  Compositional: this band's lingerer sets skew small (many low-HP
  monsters; cleared vTaken 0–48), so the clear rate barely moved while
  multi-monster clears jumped. Descriptive only, no lever attribution
  with n=5. No cleared fight-1 reached vTaken ≥70 (Q4 trigger not hit).

## Village assessment (plain words)

Five villages went into the long dark and four came out the other side
as one person standing in an empty camp. They did not die because the
game broke — they died the slow way, a little at a time: a hunter who
never came back, a wound that would not close, the pantry hitting zero
around day 70 and never coming back, thirst taking people who had
water yesterday. The one village that held (14504) is the one that
still had food on the shelf at day 150. That is the whole story of the
difference.

While they were dying, they behaved like people. They remembered their
dead by name — Gianna still carrying Quinn's words three days after he
died, Amara taking the burnt piece because Jesse always did, a
grandmother of 81 remembered for being "boring" to the things that
took her. They formed parties with names ("The Company", "THE NIGHT
SHIFT", "FINAL GIRLS CLUB"), proposed bonds and were accepted, argued
about a murder and then let it lie because nobody could prove it, and
kept their promises to the sick even when there was no cure to give.
The scholar never died on any seed. The conversations held up: not one
dry line in forty sittings, and the one place the game still stuttered
— a remembered quote breaking in half across two lines — is fixed
below.

## Blanks filled / findings

- **FIXED IN-RUN — resume-opener quote split (r229 blemish 1
  REPRODUCED).** Seed 14503 d85 (Gianna): the resume opener's quoted
  memory — 'Quinn is gone and the world just... continues. That's the
  part I can't stand.' — rendered as two transcript entries, the second
  starting mid-quote. Same shape as r229's 14494 d28. Root cause:
  `convoSplitBeats` paginated long lines at sentence boundaries with no
  awareness of the single-quoted memory span, so it split inside the
  quote. (The r229 metric-review diagnosis — "cap at a sentence
  boundary, not a character count" — misidentified the mechanism;
  `clipSnippet` was not the culprit.) Fix: `convoSplitBeats` is now
  quote-aware — a sentence boundary inside a single-quoted span is
  never a split point (apostrophes don't count as delimiters); a chunk
  runs over MAX rather than break a quote. Proof test
  `scripts/test-journey-crisis-r230-quote-split-20261117.js`: 6/6
  green on the fix, 3/6 red on base (the three quote cases), green
  again after restore. Neighbour proofs stay green: r234 DRY2 27/27,
  r228 C3c 9/9.
- **r229 blemish 2 did NOT reproduce.** Tautological recap ("We started
  on X, then got onto X"): 0 "We started on" lines in sayLines; the one
  recap that fired (14504 d19, "We started on grief, then got onto that
  question") has A≠B — honest. No fix this run.
- **Ben's buried-cache beat repeats verbatim** (14502 d39 +1442 kcal,
  d46 +872 kcal) — same text, different amount; reads as the same
  memory twice. Minor finding, logged, no fix this run.
- **Door-position instruction repeats** across sittings (known r234 M4
  instructional cluster) — instructional, not conversational parroting.
- **D3 death mismatches, both explained** (Dina class, closed): David
  d67 "lived to tell" is not a death at all; Hassan d88's death is
  narrated in say lines and recorded via the sortie path. Leader-aware
  mismatches 0, unattributed death lines 0.
- **Infra note**: the first expansion attempt was SIGTERM'd ~15:17Z
  mid-seed-14504 (exitSignal 15 after 114s; 0-byte JSON, 8 partial
  transcript files). Cause unknown. Partials removed; re-run clean
  (14504 exit 0 15:18:36–15:19:20Z; 14505 exit 0 15:19:20–15:20:33Z).
  The heartbeat loop died at compaction; the registry lock was then
  held ~9 min by a sibling's worktree-register, so the heartbeat went
  24 min stale before landing 15:46:42Z. No reaper action taken against
  the tree; heartbeat loop restarted and fresh at closeout.
- **R57 early-resolution**: TRUE early count 0 (legacy corpse-counting
  method says 1 — the r57/r58 corpse exclusion stands).

## Reachable / fun / winnable

- **Reachable**: yes — raids fired on every seed, sorties were fought,
  conversations, moots, funerals, betrayals and bonds all fired in the
  wild. Nothing on this leg is gated behind content the panel never
  reached.
- **Fun**: the leg reads as people under pressure, not numbers — grief
  carried across days, a murder case argued and let lie, parties named,
  promises kept. The one presentation stutter found (the split quote)
  is fixed. Ben's repeated cache memory is the only flat note.
- **Winnable**: this leg does not judge the win — it judges bending
  and breaking. Villages bent and mostly broke by slow attrition, which
  is the leg working as designed; one held to the horizon with food to
  spare. The binding wall stays upstream (wave-4 kills and the veteran
  bar), unchanged by this run.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/crisis.json
--current '.../journey-crisis-r230-delayed-seed1450*.json'
--metrics defendedFights,playerFights,latelyDefenseCount`:
**quiet** (5 files, 3 metrics, no large deviations). Baseline NOT rolled
(single-panel variance is never a roll; the r201 units question stands
answered for this baseline — the check sums per-panel totals and the
baseline's 95 sits inside the historical 3-seed range, so no
re-interpretation was needed this run).

## Metric review

1. Supply cumulative corrected: the panel had **2** ruin searches, not 1
   (14501 and 14504) — cumulative 0/308 from the prereg's 0/306.
2. C7b wound count corrected: **2**, not 1 — Avni d137 ("a wound that
   wouldn't close") is a second wound death alongside Papy.
3. The r229 metric-review diagnosis of the truncation misidentified the
   mechanism (clipSnippet vs convoSplitBeats) — the fix addresses the
   real one; the review note stands corrected here.
4. Arena watch needs a win/loss instrument: say lines only narrate arena
   deaths, so the watch can only count deaths, not judge the Reunion
   re-tune.
5. Deathcleanup watch needs the driver to record a deathCleanups stat
   and a winPlan census, or it stays unmeasurable — file as a driver gap
   for the next run, not a game defect.
6. Dialogue-only fixes are NOT trajectory-neutral (voiceLine draws RNG)
   — pre/post trajectory comparisons stay descriptive. Carried.

## Gate

`node scripts/check.js --quick` in the worktree: **325 passed, 15
failed in 1799s** (log `evidence/2026-11-17/journey-crisis-r230-gate.log`).
**0 attributable to this run's fix:**

- Measurement-proof staleness pair (`test-measurement-proof-update.js`,
  `test-measurement-workflow.js`): "Proof source inputs are not
  current". `balance-panel.js` `manifest()` digests ALL of `src/`, so
  the fix's own `conversation.js` change re-stales the retained
  balance proof — the same class as r231, which landed with the pair
  red. Refreshing the proof is the gateproof arm's job (a real neutral
  panel re-run), not this run's.
- 9 exact-120s timeouts (living-garden, occupation-panels,
  one-person-army, solo-campaign-endings, time-save-crashes,
  synergy-stall, throttlefeast, capable-bot, table-endings): load
  artifacts. Standalone re-runs: capable-bot 40/40, trust-observer
  exit 0, living-garden exit 0.
- `test-measurement-cache-flags.js` 0/4: FLAP artifact, not a test
  failure — the standalone re-run died inside the test with EPERM on
  a write (`balance-panel.js:328`) during the 17:02Z write-flap
  window; r232's quiet-box A/B (4/4) stands as the discriminator.
- `test-phone-frame-proof.js` (stale receipt) +
  `test-ladder-bundle-20261108.js` (ambient-raid control): standing
  fails.
- Gate GO for adoption.

## Closeout

- Fix committed [needs-eyes] (`convoSplitBeats` quote-aware
  pagination, `src/js/conversation.js` +59/−29); proof test
  `scripts/test-journey-crisis-r230-quote-split-20261117.js` 6/6
  green on the fix (verified by the adopter), 3/6 red on base.
- Adopted by the main session: the 09:00 coordinator timed out
  (heartbeat 15:46:42Z, no live processes, no orphan hbloop — the
  run was dead); the adopter heartbeated the tree, ran the gate,
  and finished the closeout. Master moved during the run; rebased
  clean onto the current tip, proof re-run green on the rebased tip,
  merged ff-only into local master.
- **Merged locally, pending ship** — no bump, no push, no live
  verification (ship loop owns those).
- Rotation 6→7 written with read-back; lock deleted at closeout
  after run_id verification.
