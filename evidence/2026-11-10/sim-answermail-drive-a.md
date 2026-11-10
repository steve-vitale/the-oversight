# sim-answermail-drive-a — the village answers its own mail

**Run:** fleshout-20261110T1215Z, Loop A, axis scale-onramp / winnability chain.
**Worktree:** `sim-answermail-drive-a`, base SHA `75f37618573fcf155afa92d72330c147d33a1fdc`.
**Verdict: NO-GO** — primary goal met (seasoned links 7/8 armed vs 0/8 control) but the
cost bar fails on its arm-only starvation leg: 2 armed starvation deaths against a cap
of 0 (control starved nobody). See § Metric review — the bar as written collapses to
zero-tolerance whenever the control leg starves nobody, and the sibling arm
sim-talkturn-a hit the same class of failure the same morning (see sim-findings.md).
**No confirm band.** The pilot is NO-GO, so band 150209–150216 was never run.

## Pre-registration

Pre-registered before any judged seed: `evidence/2026-11-10/sim-answermail-drive-a-prereg.md`
(commit `93075d553`).

- **Primary metric:** seasoned links per 8 seeds.
- **GO candidate:** armed ≥3/8 AND control ≤1/8. **NO-GO:** armed ≤ control, or a primary
  pass with a failed cost bar. Anything else INCONCLUSIVE. No mid-run re-scoring (§14).
- **Cost bar (scalemetric):** starvation armed ≤ control+2 AND arm-only starvation
  ≤ control total AND median survival armed ≥ 0.8× control median (standard median).
- **Secondary:** accord-pending days (formation → answer), trust at season, polity
  (expected 0), wall numbers.
- **Seeds:** pilot band 150201–150208, verified FRESH before the prereg (no prior corpus,
  evidence, or dated prereg carried those seeds; only coincidental substrings, e.g. a
  float tail `592.060315150201`). Confirm band 150209–150216 also clean — reserved for a
  GO candidate, never used.
- **Substrate:** competent policy, 150-day death-aware horizon. Baseline = competent,
  drive off. Armed = competent + `ANSWERMAIL_DRIVE=1`.
- **Question:** does a villager-side auto-answer — the village leader / lead court
  answering pending accords and tend offers on the village's behalf, a direct engine
  answer with no conversation turns — raise seasoned links without the player sitting
  down to answer the mail herself?

## ⚠️ A game-code hook WAS needed — read this first

Policy-only **cannot** answer an accord from the engine side: the four verbs
(`answerAccord`, `tendLink`, `answerRenegotiation`, `answerDemand`) live inside
`src/js/hierarchy.js` and are only reachable through conversation turns or the
player's own action menu. So this arm builds the smallest additive-only,
default-OFF engine hook in `src/js/hierarchy.js` (commit `a3a1082c3`):

- New method `_answermailDriveDaily()`, called first inside `hierarchyDaily()` (before
  `_renegotiationTick`, so a beat on its last day is answered before it expires).
- Fires **only** when `ANSWERMAIL_DRIVE === '1'` in node (with a `typeof process !==
  'undefined'` guard — in the browser `process` is undefined, so shipped play never
  runs it; the player still answers her own mail).
- **The villager-side distinction:** `_availableRepresentative()` picks a *living
  villager who can walk out* — never the player. If no villager is available, nothing
  is answered that day (counted as `blockedDays.noAnswerer`).
- Same four verbs and gates as answermail-a, different actor, gate, and timing:
  pending accord → `answerAccord('gift')` (only if its link is still active); weekly
  tend on LEAD links when the pantry holds > 20,000 kcal; `pendingRenegotiation` →
  gift; `pendingDemand` → honor. Never proposes a link, never answers counters,
  national, or global mail, no new say lines, no win price, deed gate, or readiness
  change.
- Stats live on `state.answermailDrive`, created only when the flag is on:
  accordAnswers, tends, tendsBlockedPantry, renegotiationAnswers, demandAnswers/kinds,
  blockedDays, answerers + answererNames, errors, firstAnswerDay.

Proof: `scripts/test-answermail-drive-a.js`, **15/15 PASS, exit 0**, with RED demonstrated
by stashing `src/js/hierarchy.js` (the hook-dependent checks failed "not a function").
Live smoke legs: 99104 drive 60d — accord answered, errors 0; 99104 control 60d —
`driveStats` null (the drive-off proof).

Canon: docs/SCALE.md covers polity shapes, the 30-day season, the trust-40 bar, and
the first gesture at formation. **No canon doc covers a villager-side answering drive**
— stated in the prereg, not invented as canon.

## Before / after, identical seeds (150201–150208)

| Seed | Days base → armed | Seasoned base → armed | Accord answers | Tends | Reneg answers | Blocked (no answerer) | Starvation base → armed |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 150201 | 78 → 146 | 0 → 1 | 1 | 8 | 1 | 7 | 0 → 0 |
| 150202 | 107 → 86 | 0 → 0 | 1 | 0 | 2 | 0 | 0 → 0 |
| 150203 | 75 → 102 | 0 → 1 | 1 | 7 | 1 | 3 | 0 → 0 |
| 150204 | 96 → 116 | 0 → 1 | 1 | 5 | 1 | 0 | 0 → 0 |
| 150205 | 76 → 105 | 0 → 1 | 1 | 7 | 1 | 5 | 0 → 0 |
| 150206 | 129 → 150 | 0 → 1 | 1 | 10 | 2 | 1 | 0 → 2 |
| 150207 | 150 → 111 | 0 → 1 | 1 | 9 | 0 | 1 | 0 → 0 |
| 150208 | 140 → 129 | 0 → 1 | 1 | 6 | 1 | 0 | 0 → 0 |
| **Total** | **median 101.5 → 113.5** | **0/8 → 7/8** | **8** | **52** | **8** | **17 days** | **0 → 2** |

Per-link trust (born → peak → end), same village on both legs of each seed:

| Seed | Other village | Base class (born→peak→end) | Armed class (born→peak→end) |
| --- | --- | --- | --- |
| 150201 | village_3 | holds (30→37→23) | **seasoned (30→100→66)** |
| 150202 | village_1 | holds (30→37→33) | rises (30→41→38) |
| 150203 | village_0 | holds (30→39→35) | **seasoned (30→100→81)** |
| 150204 | village_2 | decays (22→22→8) | **seasoned (22→90→68)** |
| 150205 | village_0 | decays (30→31→15) | **seasoned (30→100→93)** |
| 150206 | village_1 | decays (30→34→0) | **seasoned (30→100→48)** |
| 150207 | village_2 | decays (30→35→4) | **seasoned (30→100→84)** |
| 150208 | village_1 | decays (30→32→20) | **seasoned (30→84→58)** |

Classes band-wide: base 3 holds / 5 decays / 0 seasoned; armed 7 seasoned / 1 rises.
The drive did not just add trust — it moved every link out of decay and into the
seasoned class (or, on 150202, into rises).

### Accord-pending days: 0 on all 8 armed links

The drive answers the accord **the same game day the link forms** on every armed
seed — the prereg's dawn-timing handicap never materialized. (The hook runs inside
`hierarchyDaily`, which evidently processes after the link forms.) Control leg:
accords sat unanswered 35–116 days, from formation to death or horizon — the same
unread-mail shape trustgrowth-b found, now with a same-day answer on the armed leg.

### Where the trust came from

**Gains, base leg (+132 total):** tribute-weekly +36, aid-beg-give +24,
aid-offer-accept +72.

**Gains, armed leg (+735 total):** accord-gift +80, **tend +357** (52 tends, trust
capped at 100), aid-beg-give +60, tribute-weekly +42, aid-offer-accept +132,
renegotiation-answer +64.

**Downs, base leg (−234 total):** succession-haircut −149, aid-beg-refuse −23,
renegotiation-silence −30, tribute-nothing −12, titan-event −20.

**Downs, armed leg (−431 total):** succession-haircut −288, titan-event −125,
tribute-thin −5, tribute-nothing −8, aid-beg-refuse −5.

### The cutters

Two forces eat the trust the drive earns, and both are bigger on the armed leg:

1. **Succession haircuts (−288 armed vs −149 base).** A link loses trust every time
   its speaker dies. The armed villages live longer (median 113.5 vs 101.5 days) and
   their links reach higher trust, so there is more to lose and more days to lose it
   in. The drive earns +735 and the funerals take −288 — the drive still wins by a
   wide margin, but the haircut is now the single biggest trust tax in the system.
   On 150206 the armed link peaked at 100 and ended at 48 after a funeral cluster.

2. **Titan events (−125 armed vs −20 base; 25 strikes vs 4).** `titanEscalate`
   (`src/js/titans.js` ~305) strikes every 5 days an unanswered stage-2+ titan
   stands — 45% a pantry raid, 55% a −5 trust hit on a random allied link. The drive
   never touches titans, so the 6× jump cannot be a drive effect. Most plausible is
   divergent titan spawns: the armed leg's random stream diverges after the first
   drive action, so different titans spawn and stand unanswered. A titan census
   (spawns, stages, days-unanswered per leg) would be needed to say more; until then
   the gap is divergence noise, not a drive effect — but it means the drive's gains
   fought a much heavier titan tax on this band than the control leg faced. Logged as
   an open finding in `sim-findings.md` (scale-onramp/titans).

### Fidelity checks — all pass

- Accord answers (8) == links (8). Tends > 0 on 7/8 seeds (0 on 150202, which lived
  only 13 days after formation). Renegotiation silence 0 on the armed leg (8
  answered). Instrument errors 0, unattributed trust moves 0, drive errors 0.
- Drive-off proof: `driveStats` present on 0/8 control legs.
- Answerers are real named villagers, never the player: 150201 Smita / Phudit /
  Yara; 150206 Chloe (8 answers) / Devon / Wilhelm / Ursula; 150203 one villager
  answered 7 times; 150208 Raj answered 5. The lead court is not one person — the
  work spreads across whoever can walk out that day.

## The 150206 starvation deaths — what actually happened

The cost bar fails on two starvation deaths, both on seed 150206, both villagers
(Diana Osei d111, Ella Johnson d114), both while the pantry sat at 0–1,000 kcal.
The village survived to day 150; the control leg lost the village at day 129.

What the pantry shows: it slid from 42,920 kcal (d100) to 0 (d109) — about 4,800
kcal a day of burn against no production, a late-run famine slide. The drive sent
roughly 20,000 kcal out over the whole 150-day run (10 tends + accord + 2
renegotiations), but tends only fire when the dawn pantry is above 20,000 kcal,
and at most 2 tends could have fired inside the d100–109 collapse window (weekly
cadence) — about 3,000 kcal against a 43,000 kcal slide. The village was starving
anyway; the drive's grain is a small share of the famine, not its cause.

That said: the cost bar counts deaths, not attribution, and it counts them at 2
against a cap of 0. The verdict is NO-GO under the bar as pre-registered. Whether
the drive's grain *contributed* to the two deaths is the open question — the
pantry-slide numbers say the contribution, if any, is small, and the longer life
(150 vs 129 days) is exposure the drive also bought. See § Metric review.

## The 150202 exception

The only unseasoned armed link. The link formed late (day 73) and the village died
13 days later (day 86) — before the 21-day Regional Dawn and before the 30-day
season. The mail was answered (accord day 73, 2 renegotiations), the trust rose
30→41→38, and the village died anyway. Same shape as answermail-a's confirm misses:
late-formed links in short-lived villages cannot season, whatever answers the mail.

## Village assessment (plain words)

The village can answer its own mail, and when it does, the bond with the neighbouring
village almost always becomes a seasoned one — the kind that lasts through funerals
and bad years. On seven of eight villages the link went from a polite 30 to the full
100, and even after the funerals took their cut it ended in the 50s to 90s, where the
unanswered version ended in the single digits or at zero. The answers come from real
people in the village — Chloe, Raj, Smita, whoever can walk out that day — and the
gift goes out the same day the link is made, not weeks later.

The price is real but small on this band: two people starved on one village in a
famine that was already coming — the village's food stores slid from plenty to
nothing in nine days, and the two who died were caught at the bottom of it. The
drive's grain going out the door is a small part of that slide, not the cause of it.
But the rule we wrote says two starvation deaths against a cap of zero is a fail,
and the rule is the rule: this run is a NO-GO.

Nothing else moved. No village reached the national table, no one won, no one took
a seat — the bond is stronger, but the climb past it is untouched. The drive is a
bond-maker, not a win-maker.

## Reachability verdict

| Wall | Base | Armed |
| --- | --- | --- |
| Wins | 0/8 | 0/8 |
| National scale | 0/8 | 0/8 |
| Table / seat | 0/8 | 0/8 |
| Wave 4 reached | 7/8 | 8/8 |
| Wave 5 reached | 2/8 | 3/8 |
| Median survival | 101.5 days | 113.5 days |
| Polities formed | 0 | 0 |
| Survived to horizon | 1/8 (150207) | 1/8 (150206) |

The drive lifts the bond and slightly lifts survival and wave reach, and moves
nothing on the scale wall. National, table, and win stay at zero on both legs.

## Sense-test — do the answered exchanges read like people?

Read from the armed `trustSays` transcripts (150201, 150206), accord / tend /
renegotiation lines.

**Yes, on the day the bond is born.** Day 38, seed 150201: "Blanca brings it home:
Ashford bows to Haven — one organization, us primary." Then the same day: "Haven's
first gesture: 2,000 kcal walks to Ashford's fire — a gift, no strings. They count
it, and they remember who sent it." Then the same day again: the first tend, grain
going the other way. Three lines, one day — the bond is born, greeted, and fed.
Seed 150206 reads the same way (Monica brings Stonebridge home on day 32, gift the
same day). The renegotiation gift reads like people too: "Haven sends 1,618 kcal to
Stonebridge's fire — grief met with grain. The new speaker eats with Haven's people
and the tribute stays where it was."

**Two things still read wrong.**

1. **The answerer is invisible.** The stats say Chloe answered the mail 8 times on
   150206 and Raj 5 times on 150208 — but no say line ever names them. Every line
   says "Haven sends…" while the fiction's own records say a person did it. The
   village acts, but no villager is ever seen acting. This is the fiction gap the
   prereg named, confirmed in the transcript: if the drive is meant to be a
   *villager-side* answer, the answer should be voiced as a villager's act.

2. **The tend line repeats verbatim, weekly.** 52 tends, one sentence each time:
   "Someone's grandmother over there will remember who fed her." Same as
   answermail-a's finding (a), unchanged. The tend also still overpays the pantry:
   33 captured tend lines paid 53,659 kcal against a 49,500 kcal sticker (+8.4%;
   up to 1,972 kcal on one tend) because `tendLink` removes whole pantry items.
   Same shape as answermail-a's ~5% overpay, slightly larger on this band. (Logged
   in sim-findings.md under answermail-a; the 8.4% sample is this arm's number.)

## Balanced panel (§15)

`scripts/build-answermail-drive-panels-20261110.js` (adapted from the answermail-a
builder, same paired-seed pattern, pseudo-policy `answermail-drive`).
Files: `evidence/2026-11-10/answermail-drive-panel{,-before.json.gz,-after.json.gz,.json,.md}`.

- **Decision: review_required** — sole driver: village deaths per run +4.125
  (95% interval −5.25 to +13.75, straddles zero).
- Village deaths **per 100 days: −7.317** (interval −19.02 to +3.24, no material
  signal) — the armed villages live longer, so they accumulate more deaths in
  total while dying more slowly per day. Same live-longer artifact answermail-a's
  panel showed; the per-100-days row is the honest one (see sim-findings.md,
  WHOLE-RUN DEATH COUNTS).
- Community loss 0.875 → 0.875 (no change). National 0 → 0, table win 0 → 0.

## Telemetry deviation check

Loop body step 10 — run twice, investigated, **no real deviation**:

1. Naive invocation (`--metrics national,table,wins,exiled`, no `--sweep-rows`)
   printed LOUD: `national disappeared: baseline 12 -> current 0 (n=17 files)`,
   `table 16 -> 0`, `wins 16 -> 0`. Investigated, and all three are artifacts:
   - **Cross-regime.** The baseline `scale-wall.json` is the "winseat — full
     win-side win stack, ~100%-win suite" regime (national 12/16, table 16/16,
     wins 16/16, FEASTSCALE/WINPURSUIT/SEATDRIVE flags). This arm is a
     courtship/standing substrate where wins are structurally ~0 — and the
     baseline's own note says: "DO NOT compare pre-seat / courtship / readiness
     substrates against this baseline — wins are structurally ~0 there and
     telemetry-check will fire a spurious LOUD 'wins disappeared'."
   - **Wrong mode.** Without `--sweep-rows` the checker counted 17 files (16
     per-seed + the verdict summary) and read bare metric names that do not
     exist in these files (missing paths count as 0).
2. Correct invocation (`--sweep-rows`) **refuses, exit 2**: "all 16 --current
   rows carry top-level anchorCommit, so they are sweep recorder rows, not
   runs. Recorder corpora are compared with sweep-compare tables, never against
   a run baseline here." That is the tool's own recorder-corpus exclusion rule
   (the known 1937Z false-LOUD class).
3. **Baseline NOT rolled forward** — reseeding the winseat baseline from a
   courtship corpus would corrupt it. A regime-segregated courtship baseline
   would be a separate maintenance job, not this arm's call.

The real deviation check is the wall table above: national 0/8, table 0/8, wins
0/8 on **both** legs — nothing moved, so nothing deviated.

## Metric review (for the NEXT run — not a re-score)

The verdict stands as NO-GO under the bar as pre-registered. These are problems
with the bar and the instrument, for the next arm to fix:

1. **The arm-only starvation leg collapses to zero-tolerance.** The cap is the
   control total, so whenever the control leg starves nobody the cap is 0 and any
   single armed starvation death fails the whole run. Answermail-a's form of the
   same leg (arm-only ≤ 2) would have PASSED this run (2 ≤ 2). The sibling arm
   sim-talkturn-a hit the same class of failure the same morning on the same band:
   its raw-total cost bar failed on 696 vs 603 deaths while the per-day rates were
   identical (0.707 vs 0.708) and starvation was 0 vs 0. Proposed revision, carried
   forward from sim-findings.md: judge survival levers on deaths per 100
   village-days (armed ≤ control + 10%), keep the starvation and median clauses,
   and give the arm-only starvation leg a floor of 2 (arm-only ≤ max(control, 2)).

2. **Dawn-pantry tend timing.** The tend gate reads the pantry at `hierarchyDaily`
   time (dawn), which is thinner than at policy time: on the 99104 smoke leg the
   drive tended 0 times with 18 pantry-blocked days, while on the pilot band it
   tended 52 times. On 150206 the armed leg recorded 10 tends and 53 pantry-blocked
   days. The gate is a real timing difference, not a blocker — but a tend that can
   only fire on a fat dawn pantry will under-answer on thin villages, which is
   where the mail matters most.

3. **Titan jump (4 vs 25 strikes).** See § The cutters. The drive never touches
   titans; the gap is most plausibly divergent titan spawns after the RNG stream
   splits. Needs a titan census before anyone claims a drive effect — and the
   analyzer's trust accounting should probably separate titan tax from link
   behaviour, since a 25-strike band punishes the armed leg for weather it did
   not make.

4. **150204 born at 22, not 30.** The link's first snapshot reads trust 22 on
   both legs (the base leg's link is also born 22). The events show the accord
   (+10) landing on a link already at 22 on day 37, then a tend (+8) to 40 — so a
   −8 (a same-day succession haircut) landed between formation and the first
   snapshot. Same formation-day instrument gap class as trustgrowth-b: the setter
   logs only from the first snapshot, so formation-day moves before it are inside
   "born trust". The analyzer reconciles 100% from the first snapshot onward, so
   nothing is missing — but the born number is not the formation number.

5. **Analyzer fixes made before the final verdict (analysis-only, corpus
   untouched).** (a) The trustgrowth `classifyLink` objects carry no `id` field,
   so accord-pending days first read NA for all 16 links — fixed by threading the
   link id via `linkIdsByOther` (matched by `other` from snapshots). (b) The
   verdict logic first printed INCONCLUSIVE for a primary pass with a failed cost
   bar — fixed to NO-GO per the prereg (NO-GO iff armed ≤ control OR (GO-candidate
   AND NOT costPass)). Both fixes are in the committed analyzer;
   `answermail-drive-verdict.json` is the final, correct verdict.

6. **Band note.** The sibling Loop A arm sim-talkturn-a ran its pilot on the same
   band 150201–150208 in the same run window (its evidence cites seed 150206-armed
   and the same confirm band 150209–150216). The bands are shared across arms
   measuring different levers on the same seeds — the 99101–99108 band was reused
   the same way — and this arm's control leg is plain competent with no talkturn
   policy, so the measurements are independent. Recorded here for the coordinator's
   band accounting, not as contamination.

7. **`check.js --quick`: 291 passed, 9 failed in 1050s, exit 1.** The 2
   measurement failures (test-measurement-workflow.js "retained neutrality proof
   covers the current Game/controller/harness inputs";
   test-measurement-proof-update.js) are **pre-existing at base 75f376185** —
   proven by running both tests with the TRUE base hierarchy.js (HEAD~1, 0 drive
   references): identical failures, exit 1 both ways. The other 7 match
   answermail-a's pre-existing list (phone-frame receipt staleness,
   observer-neutrality 120s timeout, mobile-combat-cadence, occupation panels,
   establishment-r20 racks-voice); synergy-stall + capable-bot were 120s timeouts,
   likely CPU contention with the pilot sims running concurrently. The
   neutrality-proof refresh is owed as separate maintenance — not done inside this
   arm; flagged for the coordinator.

## Blanks filled / documented

- **Villager-side answering works as a mechanism.** 8/8 accords answered same-day,
  52 tends, 8 renegotiations, 0 silences, 0 drive errors, 17 no-answerer days
  (the gate does its job — when nobody can walk out, nobody answers).
- **Seasoned links follow.** 7/8 vs 0/8, with the single miss explained by village
  death, not mail failure.
- **Cost is two starvation deaths on one seed, inside a famine slide the drive
  did not cause** (see § The 150206 starvation deaths). The bar still fails; the
  mechanism is documented, not excused.
- **Documented, not fixed:** the invisible answerer (sense-test #1), the verbatim
  tend line and ~8% pantry overpay (sense-test #2), the titan tax asymmetry, the
  dawn-pantry tend timing, the born-22 formation-day gap, the neutrality-proof
  staleness (maintenance, not this arm).
- **Out-of-scope finding** logged to sim-findings.md: titan strikes 4 vs 25
  (scale-onramp/titans).

## Incidents (for the coordinator)

- **Stash incident.** While attributing the `check.js` failures, `git stash push --
  src/js/hierarchy.js` found nothing to stash (the hook was already committed),
  and the following `git stash pop` popped a **sibling's** stash — sim-wideduty-a,
  commit `8249598b803e3a65a87463c56d58fac38fd5f8c7` (an 86-line game.js change).
  My tracked tree showed no diff afterward (that change is already contained in
  HEAD), and the stash was restored exactly via `git stash store -m "WIP on
  sim-wideduty-a: 8cee6a8d2 sim-medheadcount-a: rebased gate log — check.js
  --quick 294/6, standing profile (4 standing + measurement-proof staleness
  pair); no new attributable failure; proof test 4/7 by design on reverted
  tree" 8249598b803e3a65a87463c56d58fac38fd5f8c7`. The stash list is back to its
  prior order: @{0} wideduty, @{1} journey2-social, @{2}/{3} gap-route, @{4}
  region-wave1-southasia, @{5} master visitorHtml WIP. Lesson recorded: never
  `git stash pop` blindly — the stash is shared across worktrees of this repo.
- **EPERM write flap.** Hit once during the RED-run smoke leg (a 0-byte file left
  in /tmp); transient, per the local_write_flap_response skill. No evidence lost.
- **Index clobber.** `safe-commit.sh`'s known index-clobber struck after both the
  prereg and the build commits (bogus staged deletions, once MM on hierarchy.js);
  repaired each time via `git ls-tree HEAD -- <paths> | git update-index --add
  --index-info`, verified `git status --short` empty + `git diff HEAD` empty. The
  commits themselves were always correct.

## Proof / landing

- Proof test `scripts/test-answermail-drive-a.js`: **15/15 PASS, exit 0** (RED
  demonstrated by stashing `src/js/hierarchy.js`).
- Prereg commit `93075d553`; build commit `a3a1082c3` (hook + policy + driver +
  analyzer + proof test); evidence commit TBD at closeout.
- **Committed in worktree, pending coordinator merge.** No push, no version bump,
  no live verification (ship loop owns deploys).

## Corpus

- `evidence/2026-11-10/perseed-answermail-drive-a/` — 16 per-seed JSONs
  (`answermail-drive-s15020X-answermail-drive-{base,armed}.json`) +
  `answermail-drive-verdict.json` (verdict NO-GO, GO-candidate yes, cost bar fail
  on the arm-only starvation leg only).
- `evidence/2026-11-10/answermail-drive-panel{,-before.json.gz,-after.json.gz,.json,.md}`
  — §15 balanced panel (review_required).
- `scripts/answermail-drive-driver-20261110.js`, `scripts/answermail-drive-analyze-20261110.js`,
  `scripts/policies/competent-answermail-drive-a.js`,
  `scripts/build-answermail-drive-panels-20261110.js`, `scripts/test-answermail-drive-a.js`.
