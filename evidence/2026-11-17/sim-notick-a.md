# sim-notick-a — EVIDENCE (DIAG GO)

**Arm:** sim-notick-a · **Loop A run:** fleshout-20261118T0112Z · **Axis:** scale-onramp
**Type:** DIAG (classification only; fix judged against the frozen bar and NOT built — see Fix verdict).
**Branch:** `sim-notick-a` · **Worktree:** `~/workspace/worktrees/sim-notick-a`
**Base at arm start:** `3d0f5770c` · **Prereg:** `evidence/2026-11-17/sim-notick-a-prereg.md` (frozen, Corrections 1–2).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
**Bands:** frozen 103411–103418 (8 seeds) + fresh 103441–103448 (8 seeds) · **Horizon:** 150d death-aware.
**Verdict: DIAG GO** — classification complete (17/17 named, 0 unknown across both legs),
instrument D-checks green, proof test 29/29.

## The question (finding #2498 follow-up — the no-tick edge)

sim-selblock-a classified all 12 selected-blocked instances on the frozen
profilegate-b ON corpus. Three of the 12 first-block `no-tick-after-commit`
(part-3 commits with no tick left to execute), and a fourth no-tick selection
hid inside instance #9's tally. This arm traces what happens to those plans
AFTER the no-tick commit: do they stall, die, re-bid next dawn, depart the
next day, or silently drop? Correction 2 (pre-evidence, instrument fact):
the true population on the frozen corpus is **12** no-tick selections, not
4 — launched instances also carry no-tick commit days in their history.
The fresh band adds 5 more. Total traced: **17**.

## Before / after (identical seeds, quoted from the frozen profilegate-b analysis)

| Metric | OFF (control) | ON (PROFILEGATE=1) |
| --- | --- | --- |
| Scored dawns / empty | 87 / 81 (0.931) | 99 / 3 (0.0303) |
| Mean eligible / dawn | 0.08 | 2.98 |
| Launched instances (any-commit) | 3 | 7 |
| **Selected-blocked instances** | **0** | **12** |
| Wave-4+ launch events (secondary) | 8 | 38 |
| Median survival (gameDays) | 147.5 | 116.5 |
| National standing / rank / table / wins | 1 / 0 / 0 / 0 | 1 / 0 / 0 / 0 |

Not re-measured here: this is a DIAG over the profilegate-b corpus plus a
fresh ON band (below). The before/after stands as quoted; the ON
re-analysis in the proof test (C6–C7) reproduces it exactly.

## Classification — the answer in one paragraph

A part-3 commit with no tick left **evaporates overnight and the plan
carries on as if it never happened**. Of the 17 no-tick selections, 10
re-bid or depart within two days (depart-next-day 6, depart-later 1,
re-bid-next-day 2, re-bid-later 4 — counting re-bids whose departure
followed a day later under their re-bid fate), and the remaining 7 are
the plan's own later story, not the commit's doing: 3 holders died the
next day or days later to a monster or in the wild, 1 plan closed at
the run's horizon after already launching, and 3 are re-bids inside
long-lived launched plans. **Zero plans stall. Zero plans silently
drop. Zero are unknown.** The mechanism says why: `vbrainExecuteDepart`
returns `'normal'` for a commit whose day has passed, dawn
force-refreshes, and the plan record is untouched by the commit — so
the only same-day cost of a no-tick commit is the holder's part-3
action becoming an indoor chore hold instead of the core pick. The
fix candidate (do not commit a part-3 pick) would recover one chore
per no-tick commit and nothing else — it is documented as a candidate,
not built, because no traced plan was harmed by the commit (see Fix
verdict).

## Per-instance fate tables

Fate = the earliest post-commit event for the same plan within 7 days
(frozen buckets; Correction 2: departures qualified full-party vs
holder-only, deaths read from the deaths array). "Eventual" is the
instance's overall funnel outcome.

### Frozen corpus (profilegate-b ON, band 103411–103418) — 12 selections

| # | Seed | Holder → target | No-tick day/part (companion) | Fate (day) | Backing row | Eventual instance outcome |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 103411 | yara_haddad → suburb | d44 p3 (gen_fwzkbi1) | **depart-later** d46 | launch brain d46, full party, commitKind dawn | launched-fought-no-kill |
| 2 | 103413 | devon_okafor → eulogy | d77 p3 (petra_novak) | **depart-next-day** d78 | launch brain d78, full party, commit mid-day p1 | launched-fought-no-kill |
| 3 | 103413 | gen_4hoo6rr → reunion | d144 p3 (david_kim) | **holder-died-after** d147 | died d147 cause `the wild` | launched-no-meeting (window 134–148) |
| 4 | 103414 | visjoin_134 → eater | d137 p3 (visjoin_131) | **depart-next-day** d138 | launch brain d138, HOLDER-ONLY (companion range-0), commit mid-day p1 | selected-blocked:no-tick-after-commit |
| 5 | 103416 | sofia_chen → eulogy | d41 p3 (gen_bwi0gf8) | **re-bid-next-day** d42 | re-bid d42 p3, same companion | launched-no-meeting (window 45–48) |
| 6 | 103416 | sofia_chen → eulogy | d42 p3 (gen_bwi0gf8) | **re-bid-later** d44 | re-bid d44 p0 (gen_dl9blws); launched d45 | launched-no-meeting (window 45–48) |
| 7 | 103416 | david_kim → congregation | d85 p3 (ethan_hunt) | **holder-died-after** d86 | died d86 cause `monster` | selected-blocked:no-tick-after-commit |
| 8 | 103417 | tariq_mahmood → strike | d94 p3 (elena_petrova) | **re-bid-next-day** d95 | re-bid d95 p2 (aria_thompson) | launched-no-meeting (window 96–146) |
| 9 | 103417 | tariq_mahmood → strike | d117 p3 (elena_petrova) | **re-bid-later** d122 | re-bid d122 p3, same companion; launched d126 | launched-no-meeting (window 96–146) |
| 10 | 103417 | tariq_mahmood → strike | d122 p3 (elena_petrova) | **re-bid-later** d124 | re-bid d124 p0 (visjoin_113); launched d126 | launched-no-meeting (window 96–146) |
| 11 | 103417 | sofia_chen → eater | d145 p3 (visjoin_113) | **depart-next-day** d146 | launch brain d146, HOLDER-ONLY (companion range-0), commit mid-day p2 | selected-blocked:no-tick-after-commit |
| 12 | 103418 | visjoin_58 → influencer | d77 p3 (visjoin_59) | **depart-next-day** d78 | launch brain d78, HOLDER-ONLY (companion range-0), commit mid-day p1 | selected-blocked:inviter-hurt |

**Frozen fate tally:** depart-next-day 4 (1 full party, 3 holder-only),
depart-later 1 (full party), re-bid-next-day 2, re-bid-later 3,
holder-died-after 2, plan-deleted-after 0, village-ended 0, stall 0,
unknown 0. **12/12 named.**

### Fresh band (notick-a ON, band 103441–103448) — 5 selections

| # | Seed | Holder → target | No-tick day/part (companion) | Fate (day) | Backing row | Eventual instance outcome |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 103441 | app_mgpspl5e343 → strike | d128 p3 (fatima_hassan) | **depart-next-day** d129 | launch brain d129, HOLDER-ONLY (companion range-0), commit mid-day p2 | selected-blocked:no-tick-after-commit |
| 2 | 103441 | luis_fernandez → editor | d149 p3 (chantal_mukendi) | **plan-deleted-after** d151 | close plan-deleted d151 (see note) | launched-no-meeting (window 145–151) |
| 3 | 103446 | aki_tanaka → algorithm | d72 p3 (aria_thompson) | **depart-next-day** d73 | launch brain d73, full party, commit mid-day p1 | launched-fought-no-kill |
| 4 | 103446 | aki_tanaka → algorithm | d83 p3 (ines_duarte) | **re-bid-later** d87 | re-bid d87 p1 (app_mgpspjtu814); launched d88 | launched-fought-no-kill |
| 5 | 103446 | tom_baker → reunion | d98 p3 (gen_oe3tjaz) | **holder-died-after** d99 | died d99 cause `monster` | selected-blocked:no-tick-after-commit |

**Fresh fate tally:** depart-next-day 2 (1 full, 1 holder-only),
re-bid-later 1, plan-deleted-after 1, holder-died-after 1, unknown 0.
**5/5 named.**

**Combined tally (17):** depart-next-day 6, depart-later 1, re-bid-next-day 2,
re-bid-later 4, holder-died-after 3, plan-deleted-after 1, stall 0,
village-ended 0, unknown 0.

## What each fate means, in plain words (with attribution)

- **depart-next-day (6) / depart-later (1).** The morning after the
  wasted commit, the holder bids again and walks out — two of them with
  a full party (devon_okafor d78, aki_tanaka d73), three of them alone
  because the picked companion is a homebody who cannot start
  (visjoin_134, sofia_chen on 103417, visjoin_58, app_mgpspl5e343 —
  companionBlock `range-0` in every case). The holder-only departures
  are the companion-range-0 block selblock-a already classified, not
  the no-tick commit: the plan still advances to hunt, short-handed.
  yara_haddad's depart-later is the same story with a one-day gap (no
  d45 commit; d46 dawn commit launches).
- **re-bid-next-day (2) / re-bid-later (4).** The plan is re-bid the
  next morning, or a few mornings later — sofia_chen bids twice at
  part 3 in a row (d41, d42) and launches d45; tariq_mahmood collects
  three no-tick commits across 32 days (d94, d117, d122) inside one
  long-lived plan and launches d126. The no-tick commit is recurring
  scheduling noise inside plans that keep going, not a plan-killer.
  Three of the four re-bid-later cases are re-bids of a plan that had
  ALREADY launched once (aki_tanaka's scores sit at stage `hunt`
  throughout; the brain keeps re-bidding party_launch while the plan
  is hunting, and each re-bid can launch a fresh expedition — d73
  and d88 are re-departures of the same plan).
- **holder-died-after (3).** David Kim (d86, monster), gen_4hoo6rr
  (d147, the wild), Tom Baker (d99, monster). None is attributable
  to the no-tick commit, on the backing rows:
  - gen_4hoo6rr launched d134, ten days BEFORE the d144 commit; he
    died in the wild d147 on that launched expedition, with the plan
    in stage `hunt` the whole time. The commit is downstream of the
    launch; it cannot have caused the death.
  - David Kim's plan seeded d85 from a fled Congregation fight and
    committed at part 3 the same day; he died d86 to a monster while
    his plan was still live and attempting departure that day (a
    directed startExpedition call, expedition never stood). The
    commit neither summoned the monster nor prevented the departure.
  - Tom Baker's plan seeded d98 from a fled Reunion fight and
    committed at part 3 the same day; no d99 score, depart, or start
    row exists — he died d99 before any re-bid could happen, a
    monster kill at Haven (node 4,4). The commit did not kill him;
    and the fix (skip the part-3 commit, do the core pick instead)
    would still have left him at Haven that night, so it would not
    have saved him either.
- **plan-deleted-after (1).** Luis Fernandez (d149 → close d151) is a
  horizon artifact, not a deletion: his wave-5 plan launched d145
  with a full party, he hunted (health 20→18), returned to Haven
  alive d150 (stage `party`, party empty, health 19), and the run
  ended d150 survived. The classifier's closeDay 151 is
  lastCensusDay+1 — the census stops because the run ends. The plan
  was alive at the horizon. Not attributable to the commit (which
  came four days AFTER the launch, while he was out hunting).
- **stall (0) / village-ended (0) / unknown (0).** No plan ever sat
  unscored-but-alive for a week after a no-tick commit, no village
  ended inside the 7-day window after one, and nothing was left
  unexplained.

## Secondary metric — do late commits EVER execute?

Across both legs, **38 party_launch commits at part ≥ 2, and 0 launched
the same day.** Frozen: 29 late commits (no-tick 12, night 10,
inviter-range-0 4, engaged 1, not-at-haven 1,
companion-not-started:range-0 1). Fresh: 9 late commits (no-tick 5,
companion-not-started:range-0 1, night 3). The 10 frozen `night`
resolutions prove agency ticks DO run after some part-≥2 commits (the
tick fires and finds it night) — so a late commit is not always
tick-less; it is just never a launch on this evidence. A blanket
"never commit at part ≥ 2" would therefore remove only blocked or
wasted attempts, never a live launch — but 38 is a small sample, and
the mechanism allows a launch in principle (a tick after a part-2
score, holder eligible, companion walking). The fix stays a candidate
on this evidence, not a proven-safe change.

## Instrument verification (what was checked, and what could have fooled it)

- **Population correction (Correction 2).** The prereg first said 4
  frozen no-tick selections, following selblock-a's all-selections
  tally — which counted only selections inside the 12
  selected-blocked instances. The tracer reads every instance's
  resolved list and finds 12: launched instances carry no-tick commit
  days in their history too. The GO bar was corrected to 12/12 before
  any evidence was written.
- **Classifier mislabels deaths as plan-deleted (instrument finding).**
  `classifySeed` detects holder death only from census
  `holderAlive=false` and daily-roster `dead:true` — but dead
  villagers DROP OUT of the daily roster, and census rows stop when
  the plan is deleted on death. Both david_kim (died d86) and
  gen_4hoo6rr (died d147) close as `plan-deleted` in the frozen
  analysis while the deaths array records their deaths. The tracer
  reads holder death from `deaths` (kind villager) first; this changes
  two frozen fates from plan-deleted-after to holder-died-after. The
  finding is filed for the coordinator (see Finding claim): any arm
  that judges a plan's end by closeKind alone inherits the mislabel.
- **D1 GREEN (repeatability).** Seed 103441, 60d, VETREENGAGE=1,
  PROFILEGATE=1, recorder ON, run twice
  (`perseed-notick-a-d1a` / `-d1b`, scratch, deleted after
  comparison): the two per-seed files are byte-identical.
- **D2 GREEN (wrap neutrality).** Same seed/days, recorder ON vs
  recorder OFF (`perseed-notick-a-d2`, MODE rec0-shape): fingerprint
  (days/gameDays/standing/maxWave/death-count/endReason/pantry)
  identical, daily snapshots deep-equal, deaths deep-equal (0
  divergences). vetSays is 5 vs 0 by design — the recorder-off leg
  records no says stream. (Note: at 60d on seed 103441 the funnel has
  not started yet — `dawnbidCensus` 0, `companionPool` 0 — so D1/D2
  prove trajectory identity, not depart-recorder exercise. That is the
  frozen profilegate-b D2 shape, kept as specified in the prereg.)
- **OFF/ON replication EXACT.** Re-running the analyzer over the
  existing corpora reproduces the frozen profilegate-b analysis on
  every compared field (funnel buckets, funnel subs, pool shape, wall
  incl. deaths 517 / starvation 5, median 147.5 OFF; deaths 786 /
  starvation 3, median 116.5 ON). Proof test C6–C7.
- **Fresh band ran clean.** 8/8 files, 0 instrument errors, every file
  carries run `notick-a`, mode `on`, recorder on. Funnel over the
  fresh band: 11 instances, classified share 1.0, unknown 0
  (launched-killed 0, launched-fought-no-kill 2, launched-no-meeting
  2, selected-blocked 5, plan-churned-before-dawn 1,
  candidate-not-bid 1).
- **Proof test green: 29/29** (`scripts/test-notick-a.js`): 8 static
  (src/ diff empty, lever reverted, prereg + evidence + analyses
  exist, instrument files exist, corpora 8/8), 13 tracer fixtures
  (one synthetic instance per fate bucket + precedence + post-launch
  shape + secondary-metric visibility), 8 corpus checks (frozen 12 /
  tally / late 29 + 0 launched / fresh clean + classified / ON + OFF
  replication / D1+D2 recorded). One service restart mid-run killed
  the first tracer run (no output file, no partial write); re-run
  clean — no write-flap EPERM struck this run. `check.js --quick`
  was not run: this box cannot finish it in ~20 minutes (same shape
  as profilegate-b's note); the arm's verification is the proof test
  plus the D-checks, and the change set is scripts + evidence only.

## Village assessment (plain words)

Seventeen mornings where a villager picked a companion at the last
hour of the day and the day simply ran out — and in every case the
next morning did the ordinary thing: the same villager bid again, or
walked out, or kept hunting a plan already launched. Sofia Chen bids
at part 3 two days running and is out hunting by day 45; Tariq
Mahmood's plan survives three last-hour bids across a month and
launches on day 126; Yara Haddad waits a day and walks out with a
full party. The three deaths are the world being the world, not the
scheduling: two men die to monsters the day after they bid, one dies
in the wild on an expedition he launched ten days before the bid in
question. The villages are not losing plans to the clock. They are
losing, at most, one evening's chore per late bid — the holder sits
on an indoor hold instead of foraging while the day ends. That is a
small, real cost, and it is the whole cost: nothing in either band
shows a plan dying because its commit came too late.

## Sense-testing (SENSE-TESTING LAW)

Read the transcripts. The fiction is silent exactly where this stage
acts — the same silence selblock-a found around blocked departures,
now covering the wait itself. Across the no-tick days and the days
either side (visjoin_134 d136–139, david_kim d84–87, sofia_chen
d144–147, tom_baker d97–100, luis_fernandez d148–151): **zero lines**
say a picked party waited overnight, re-bid at dawn, walked out a
companion short, or that the holder died. The two lines that exist on
those windows are empty-text rows (d139, d151) — markers with no
words. Nobody says "we'll go at dawn", nobody says "Fatima couldn't
walk that far", nobody says David or Tom is dead. The bid evaporates
overnight and the morning re-bids, and the fiction never marks either
moment. Finding #2499 (picked homebody gets no fiction line) extends
to the whole no-tick sequence: the overnight wait and the dawn re-bid
are both unvoiced.

## Metric review

- **The frozen bar was met with margin, not scraped — after the
  population correction.** 17/17 named against a bar of all
  classified, unknown 0 against a bar of ≤ 1 on each leg. The
  correction (4 → 12 frozen) was an instrument fix made before
  evidence, not a re-score: the tracer reads every instance, and the
  brief says "classify EVERY no-tick-after-commit instance".
- **The fate buckets held, with two qualifications the evidence
  carries.** First, depart-next-day/depart-later needed the
  companionStarted qualifier — a launch row alone does not say
  whether the companion walked (3 of the 7 departures are
  holder-only). Second, plan-deleted-after needed the attribution
  check — the one fresh case is a horizon artifact (the plan was
  alive at the run's end), and the two frozen cases the classifier
  called plan-deleted are deaths. A future arm that judges a fix by
  fate labels alone, without the backing rows, will over-count harm.
- **D1/D2 at 60d do not exercise the depart recorder** (no wave-4
  census rows by day 60 on seed 103441). Same caveat as selblock-a;
  the instrument's depart-side validity rests on the corpus checks
  (38 late commits, 0 unknown vidBlock on holds, the fixture suite)
  and on the hand-verified backing rows in the tables above.
- **The fresh band is a new population, not a re-roll.** Two of its
  five no-tick selections sit in post-launch plans (luis d149,
  aki d83), which the frozen band also shows (gen_4hoo6rr d144,
  aki's own d72) — the post-launch re-bid is a recurring shape, not
  a one-off: the brain re-bids party_launch while a plan is hunting,
  and a part-3 re-bid can no-tick. Any fix that touches part-3
  commits must reckon with re-bids, not just first bids.
- **No panel — by design.** The fix bar's part (a) failed (no
  attributable harm), so part (b) never ran. The before/after
  numbers in this evidence are the profilegate-b OFF vs ON numbers
  quoted from its frozen analysis, not re-measured here.

## Fix verdict (frozen rule, applied with attribution)

**Fix rule (a) FAILS — no fix built; the fix is a candidate.**
Across 17 no-tick selections on two bands, the harm fates are 3
holder-died-after and 1 plan-deleted-after — and on the backing rows
none is attributable to the no-tick commit: two deaths predate the
commit's possible effect (gen_4hoo6rr launched ten days before his
commit; luis_fernandez launched four days before his) or strike by
an independent cause the next day (david_kim, tom_baker — monster
kills while the plan was live and attempting, or about to attempt,
departure), and the one plan-deleted-after is the run ending with
the holder alive at Haven. The commit's demonstrated cost is one
lost part-3 action (an indoor hold instead of the core pick) per
late bid. A fix that skips part-3 party_launch commits would recover
that chore and change nothing else on this evidence — and it would
not have saved any of the three dead men, since none of them died
because the commit evaporated. **Candidate, for the coordinator:**
defer a part-≥2 `party_launch` commit to the next tick (do not write
the commit when no depart tick can follow it). It needs its own arm
with a fresh prereg, a proof test, and a balanced panel before any
landing — the secondary metric (0/38 late commits launched
same-day) suggests it would break no live launch, but 38 is a small
sample and the mechanism allows one in principle.

## Wall numbers (scale-onramp axis)

Frozen band (quoted from profilegate-b): national standing 1/8,
national rank 0/8, table 0, wins 0, wave 4 unlocked 8/8, wave 5
unlocked 1/8, median survival 147.5d OFF vs 116.5d ON.

Fresh band (notick-a ON, 103441–103448): national standing 2/8
(seeds 103441 at 430, 103444 at 665), national rank 0/8, table 0,
wins 0, wave 4 unlocked 7/8, wave 5 unlocked 2/8, median survival
94d, villages surviving to 150d 1/8, total deaths 753, starvation 4.
The wall did not move — and this arm says why one small piece of it
does not move: the no-tick edge strands no plan. The launches the
widened gate buys still depend on holders who can walk and companions
who can start, and on damage once they get there.

## Finding claim for the coordinator

**#2498 no-tick edge CLASSIFIED (DIAG GO, no fix in this arm).** 17
no-tick selections across two bands, 0 unknown: the commit evaporates
overnight and the plan re-bids or departs (10/17 within two days);
3 holders die to independent causes; 1 plan "deletes" at the horizon
after launching; 0 stall, 0 silently drop. Fix is a CANDIDATE (defer
part-≥2 party_launch commits), needing its own arm + panel.

**Instrument finding (new, for the backlog): the classifier's
closeKind mislabels holder deaths as plan-deleted.** `classifySeed`
detects death only from census `holderAlive=false` and daily-roster
`dead:true`; dead villagers drop out of the daily roster, so the
backup never fires (david_kim d86, gen_4hoo6rr d147 both closed
plan-deleted while the deaths array records them). Any arm judging a
plan's end by closeKind alone inherits the mislabel — read `deaths`
(kind villager) first. The tracer in this arm does.

**Sense finding (extends #2499): the overnight wait and the dawn
re-bid are unvoiced.** No line ever says a picked party waited
overnight, re-bid at dawn, walked out companion-short, or that the
holder died on the days around a no-tick commit. If late bids are to
stay visible to the player, the game owes a line when a bid is
re-made at dawn — otherwise the morning's promise breaks and
re-forms in silence.

## Disposition: DIAG GO — nothing to revert

The PROFILEGATE lever was re-applied in-tree only for the fresh band
and REVERTED before this evidence was written (verified: `git diff`
vs base empty for src/, no `profilegateOn` in either twin). No fix
was built, so no src/ change lands from this arm at all. Commits are
instrument + evidence + fresh corpus only: prereg (`0d0664cd1`,
Corrections 1–2 `b7b367573` / `e7ea86aac`), tracer + proof test,
analyses, this evidence, and the fresh corpus (to be committed by
this run's closeout). Net src/ diff vs base: zero.

## Files

- Prereg: `evidence/2026-11-17/sim-notick-a-prereg.md`
- Evidence: `evidence/2026-11-17/sim-notick-a.md` (this file)
- Proof test: `scripts/test-notick-a.js` (29/29 green)
- Tracer: `scripts/analyze-notick-a.js`
- Analyses: `evidence/2026-11-17/notick-a-analysis.json` (frozen),
  `evidence/2026-11-17/notick-a-fresh-analysis.json` (fresh)
- Corpora read: `evidence/2026-11-17/perseed-profilegate-b-on/`
  (8 files), `perseed-profilegate-b-off/` (8 files),
  `evidence/2026-11-17/profilegate-b-analysis.json`
- Fresh corpus: `evidence/2026-11-17/perseed-notick-a-on/` (8 files)
- D-check scratch legs (`perseed-notick-a-d1a/d1b/d2`, 60d seed
  103441): compared and deleted, not committed.
