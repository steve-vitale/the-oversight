# Journey social life r180 — PRE-REGISTRATION (Lane B, 2026-11-11)

Leg 5 (social life). Rotation-b read 5 at run start; this run plays 5
and writes 6 (crisis next) at closeout. Run number r180 follows r179
(social, this morning). Base: master 3eec28a81 (sim-siegedesign-a).
Seeds 43601–43604 (fresh band), DAY CAP 140, policy journey
(socialite base + real conversations). Driver
scripts/journey-social-life-r180-20261111.js, analyzer
scripts/analyze-journey-social-r180-20261111.js, helpers
scripts/journey-social-r180-helpers.js — all r179 verbatim except
seeds, OUTDIR evidence/2026-11-11, filenames r180, PLUS the M10
coach/face split in helpers + analyzer (job B1 below, proven by
scripts/test-journey-social-r180-narrsplit.js 17/17).

## Rotation anomaly (read before adopting)

r179's run note claims it wrote rotation 6 at closeout. The file read
5 at this run's start (mtime 2026-11-11 19:28:19Z). The r182 adoption
closeout (13:37 CST) records writing rotation 4→5 at ~13:28 CST —
its leg was endgame (4), so it wrote leg+1 = 5 regardless of the
file's content, clobbering r179's 6 (or r179's write never landed in
the flap). Either way the file says 5 NOW, so this run plays leg 5
per the file and writes 6 at closeout. Leg 5 was played this morning
(r179, full panel) — this run is the first full panel ON the guarded
base (see base movement), not a re-play of the same question.

## Standing state at run start (read before judging anything)

- **EPERM write flap active intermittently all day** (see today's
  memory log: reaper failures 12:48–13:48 CST, r182 adoption fought
  two flap episodes). This run: first `worktree-register.sh`
  attempt failed mid-checkout (20:00–20:10Z: `unable to write file
  tools/mobile-sim.html`, `unable to write file version.json`,
  `fatal: Could not reset index file to revision 'HEAD'`; git
  cleaned up the partial tree, no registry entry, no leftover
  .git/worktrees entry — verified clean). Probe failed 20:11–20:14Z,
  succeeded 20:16:17Z; retry on that window succeeded (exit 0,
  20:21Z). Heartbeat 20:21:35Z, hbloop every 10 min (PID 20936).
  Long jobs run nohup-detached with log polling; registry/git writes
  retried on probe windows only (single-success trigger, per the
  flap skill). No git writes attempted until a probe succeeds.
- `git pull --ff-only` in main tree: "Already up to date" — no
  divergence this run (contrast r179's 547-ahead/156-behind state;
  the ship loop's reconciliation has landed since).
- Main tree CLEAN at pre-flight, disk 35%. Reaper run at ~20:00Z:
  exit 0, removed nothing, active 10/16; LOUD dirty trees are other
  owners' (build-ladder-leg4-baseline, sim-wideduty-a,
  sim-sametick-a, journey-scale-attr, sim-secondlink-a,
  sim-siegefirst-a, journey-establishment, sim-proofrefresh-b4,
  sim-tributedeliv-b, sim-mournblooded-b) — not touched.

## Base movement since r179's panel base (c3d89858f → 3eec28a81)

The r179 panel ran on the PRE-reconciliation game. This panel is the
FIRST social panel on the reconciled master. Conversation/social-
relevant changes in between:
- Reconcile merge (e4dbe581b + merges): Cursor's villager-brain /
  dawn scorer is IN — villagers fetch water all day and eat at dusk
  (feeder probe: cistern under 2 days' water most mornings, water
  job wins the morning, 60/291 picks overridden). The day's SHAPE
  changed: when villagers are free to talk, and when they eat, moved.
  Any conversation-volume/timing shift vs r179 is expected substrate
  movement, not a defect — reported, not re-scored.
- 4b89a8c73 r179: one face line per sitting (truth.js face guard) —
  IN the base now; this panel is its first full-panel
  re-confirmation (M10b below). The r179 confirm re-run was seed
  43503 only.
- 28875b1b1 journey crisis r180: Q3 voice-line stacking fix +
  r27 recap regex (conversation.js, convo-wants.js).
- b09cf584e journey-deepening r130: stateful rotation for
  favour-block lines (convo-dialogue.js, convo-wants.js,
  favor-forage.js, favor-water.js).
- 5d16916f4 journey-scale r131: readiness reads only living
  veterans (standing.js — endgame, not conversation).
- sim-proofrefresh-b5: fresh real neutral panel on 49ca310fa + proof
  re-point (the r179-owed measurement-proof refresh may be covered
  by this; the gate will show whether
  test-measurement-proof-update.js still fails on manifest
  staleness — if it passes, the refresh is DONE by b5).
- 3eec28a81 siege design note: docs only.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 43601–43604. `git grep -l -E "43601|43602|43603|43604"
-- 'evidence/*/*prereg.md'`: NO hits (exit 1) — no prereg has
named this band. Full-evidence hits for 43601/43603/43604 exist
only as kcal values in October JSONs (r8-confirm.json rotKcal
43601; journey-scale-r12-scalecourt-12004.json 43603; census JSON
43604) — NOT seeds, NOT prereg namings. Same check for the next
band 43701–43704: also no prereg hits; its evidence hits are also
kcal values (pantryKcal 43704, preservedKcal 43702). Per the
r179 precedent the prereg-name check is binding; the kcal
coincidences are recorded here so the next worker does not repeat
the check. Previous social bands: 41801–41804 (r141),
41901–41904 (r144), 42001–42004 (r145), 42201–42204 (r149),
42301–42304 (r153), 42601–42604 (r154), 42701–42704 (r159),
42801–42804 (r163), 43301–43304 (r167), 43401–43404 (r172),
43501–43504 (r179). Standacc forbidden band is 99201–99208 — a
different band.

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics
as r179 (M1–M10 below) PLUS M10b (face-guard re-confirmation).
Ninth datapoint on Q1 (villager-initiated bonds) with the build
live, FIRST panel on the reconciled dawn-scorer base + the r179
face guard + the r180 voice fix + the r130 favour rotation.

(B) FILL A BLANK — chosen from r179's open items, in this priority
order (fix only what the fresh panel shows reproduces; document
the rest):
  1. M10 ANALYZER SPLIT (r179 metric review) — DONE pre-panel:
     tallyNarrDup now reports coach-verbatim and face-verbatim
     separately (emission-shape split: asterisk-wrapped = coach,
     bare = face; src/js/truth.js confrontWindup; verified 0
     unclassified on the r179 4-seed corpus — 15/15 asterisk are
     coach-pool, 52/52 bare are accuseFace-pool). M10 judges coach
     only; FACE is M10b. Proof:
     scripts/test-journey-social-r180-narrsplit.js 17/17 (RED
     first: 6/11 on the unsplit copy, then GREEN).
  2. M4 EMMA PREFIX REPEAT (r179 metric review, watch item): the
     "I've told you three times now" prefix repeats identically
     on presses 4–5 of the "Why can't I do this now?" deflection.
     If it reproduces on the new base, read the sitting and judge
     whether the repeat-prefix pool needs widening; fix only if
     the sitting reads as broken, with a proof test + confirm
     re-run. If it does not reproduce, the item closes as
     unreproduced-on-the-new-base.
  3. MOOTS (r163 open item 2 — watch): r179 saw 2 moots (0/0/1/1).
     Watch tally only; investigate the trigger only if 0 moots
     fire across the 4 fresh villages.
  4. MEASUREMENT-PROOF REFRESH (r179-owed): if the gate shows
     test-measurement-proof-update.js still failing on manifest
     staleness, the refresh is still owed (balance-proof-update.js
     on a fresh neutral panel — a 30+ min job; for the next
     occurrence if this run's budget is spent). If it passes, b5
     covered it — record that and close the item.
(C) WATCH TALLIES (carried, analyzer additions already in r179
tooling, read-only): re-offer (furniture-filtered), dropped
threads (next-sitting resurface check), NARR scan (verbatim
repeats + panelMaxSameNarr), react shape, scattering capture
(scattered / hungryDays / aliveEnd at village end).

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run (r179 canon
section stands). The M10 split is analyzer tooling only — no
src/js change, no canon change. Any job-B fix is a behavior change
inside an existing system — no new system, no canon change.

## Driver

scripts/journey-social-life-r180-20261111.js = r179 driver verbatim
EXCEPT: fresh seeds 43601–43604, OUTDIR evidence/2026-11-11,
filenames r180. Analyzer:
scripts/analyze-journey-social-r180-20261111.js = r179 analyzer
verbatim except filenames/outdir + the M10 split printout.
Helpers: scripts/journey-social-r180-helpers.js = r179 helpers
verbatim + the tallyNarrDup split. Proof tests: the r172 carried
tests (r172, narr, coach, coachrepeat, agree, confess,
confessguard, confesswrap) + r179 faceguard + r180 narrsplit,
re-run green in-tree before the panel; new proof tests only if a
job-B fix lands.
Smoke first: SEED=43601 DAYS=5 into a scratch subdir, driver wrap
runs, no instrumentErrors.

## Leg questions
1. Q1 (continuity): do villagers initiate bonds in wild social play,
   ninth datapoint with the build live? (M2 count question.)
2. Q2 (continuity): arming motive — every plot grievance-linked;
   cold-accomplice pattern holds? r179 armed 7 plots, all early
   d7–d16; the second-zero trigger investigation is NOT triggered
   unless this panel arms 0.
3. Q3 (continuity): invite refusal — party/lure accept/decline, split
   by inviter (succession-proof, inviterWasBearer).
4. Q4 (sense): do full transcripts still read as real people? (M4
   judged from the analyzer's M4 section, in-run.) Does the
   goal-thread react shape hold on the new base (agree/joke 0,
   dlg:react present)? Does the 3-label 'more' pool suffice (longest
   continuer run <5)? Do NARR coach lines vary (M10, coach only)?
   Do doubt-probe re-offers / dropped threads persist (job C)? Does
   a double confession reproduce on the guarded base (B2 — closed
   in r179 on a second clean panel; re-confirm as watch)?
5. Q5 (guardrail): survival — how many villages past d100? Sequence
   now …, 2/4 (r172), 2/4 (r179). A standing survival fact, do not
   re-score it.
6. Q6 (gossip-position, re-aligned): 0 naming-beat lines emitted
   while the scholar is beyond radius-1 of Haven (gate definition),
   debates still kicking and settling. Strict on-tile counts reported
   alongside as the metric-review discrepancy, not a failure.
7. Q7 (dedupe): does the wild panel show any VERBATIM same-beat
   repeat or fallback repeat in a fixed pool (fix not holding), or
   only pool-cycle flags (same phrase, different nod suffix, never
   verbatim — pool depth, reported not failed)? M7 wording clarified
   in r163 and standing: "fixed pool" means the verbatim/fallback
   repeats the dedupe mechanism was built to stop; pool-cycle
   exhaustion flags are counted separately and do NOT fail M7.
8. Q8 (counter-settle, ALIGNED definition r172): driver still
   settles counters; report fresh vs blocked split + links formed.
   A re-raise is a BLOCKED proposeLink to the same target after a
   link-forming settle; fresh re-links are reported separately
   and do NOT fail M8. No new bar beyond the aligned wording.
9. Q9 (recap cap, re-confirmation): does the cap still fire in the
   wild on the fixed code — no conversation presses 'recap' 6+
   times?
10. Q10 (coach variation, re-confirmation, SPLIT definition): does
    the coach pool vary in the wild — no NARR *coach* line repeats
    verbatim within one sitting? (Face lines are M10b, not M10.)
11. Q10b (face-guard re-confirmation, NEW): does the r179 one-face-
    line-per-sitting guard hold in the wild — no accuseFace line
    repeats verbatim within one sitting on the guarded base?
12. Q11 (scattering, re-confirmation): does the scattering capture
    still record scattered / hungryDays / aliveEnd at village end?

## Panel (binding)
- Policy journey (socialite base + real conversations), DAYCAP 140,
  PILOT seeds 43601–43604, sequential.
- Smoke first: SEED=43601 DAYS=5 into a scratch subdir, driver wrap
  runs, no instrumentErrors.
- The panel runs AFTER the job-B1 tooling fix (the M10 split is
  analyzer-only; it cannot change game outcomes, only verdict
  computation — the panel judges the base as landed, with the
  corrected instrument). A game fix, if any job-B item lands one,
  is proven on its own proof test + a confirmation re-run, never
  by re-scoring the panel.

## Pre-registered verdicts (BINDING, §14)
- M1 arming motive GO: >=1 plot arms grievance-linked
  (grievanceTargetToLeader > 0 at arming, or an accomplice motive
  with grievance) OR >=1 grievance-holder later leads a plot. NO-GO
  if every plot arms with grievance links 0 and reasons
  ambition-only or empty. NO DATA if 0 plots arm (r172 precedent);
  a SECOND consecutive 0-plot panel triggers the job-B1 trigger
  investigation, not a re-score. (r179 armed 7 — the trigger
  investigation is NOT live this run unless this panel arms 0.)
  Plots after d30 are reported only.
- M2 villager-initiated bonds: COUNT question, no GO/NO-GO bar.
  Report bond_proposed events by initiatorKind (scholar/villager),
  kind (person/link), outcome (staged/accepted/refused/expired),
  per-initiator counts for PERSON kind only (amendment-5 cap:
  per-initiator <=8/90d — scored on person-kind; link raises reported
  separately with their 14-day per-pair cooldown), and end bonds +
  whether the engine records a proposer. ANSWERED if >=1
  villager-initiated person-bond proposal occurs in the wild panel;
  still open if 0. Person-kind per-initiator max printed separately.
- M3 invite refusal, wrapper only: REPORT party/lure
  accept/decline counts (split by inviter). No threshold.
- M4 sense GO: >=1 full transcript read (friendship, talk request,
  or ambush-recall) passes the bar: NPC wants something real,
  options engage or deflect it, ending resolves/plants/owes.
  Otherwise NO-GO with the failing transcript quoted. Judged from
  the analyzer's M4 section this run. Also report: react shape on
  goal threads (agree/joke/dlg:react/silence counts) and longest
  'more'-press run in any candidate.
- M5 census guardrail: >=2/4 villages past d100, else all
  dark-channel verdicts are within-window only and must be
  reported that way. Fifteenth panel in the sequence — report the
  sequence, do not re-score it mid-run.
- M6 gossip-position GO (RE-ALIGNED): 0 burst/settle/witness/
  tale lines emitted while the scholar is beyond radius-1 of Haven
  (gate-away counts, playerAtHaven definition) across the 4-seed
  panel, AND >=1 debate kicks and settles somewhere in the panel
  (mechanics alive, not silenced). NO-GO if any gate-away line
  appears, or if no debate kicks at all (fix overshot into silence).
  Strict on-tile *Away counts are reported alongside as the known
  metric/gate definition discrepancy — they do NOT fail M6 this run.
- M7 dedupe fix holds (CLARIFIED wording, r163 metric review):
  FAILS only on a VERBATIM same-beat repeat or a fallback repeat
  ("They answer at length."-class) in a fixed pool in the wild
  panel. Pool-cycle flags — same core phrase re-served after pool
  exhaustion with a different nod suffix, never verbatim — are
  counted and listed separately as POOL DEPTH, and do NOT fail M7.
  A flag in a pool left as legitimate variety is reported, not a
  failure.
- M8 counter-settle (ALIGNED definition, r172): CONFIRM — >=1 link
  forms via a driver settle AND no BLOCKED re-raise (a proposeLink
  call with pendingBefore === true and result 'counter' to the
  same target after a link-forming settle); report fresh vs blocked
  proposeLink split regardless. Fresh re-links after a settle are
  reported separately and do NOT fail M8.
- M9 recap cap (re-confirmation): HOLDS if no conversation presses
  'recap' 6+ times and 'recap' is never offered after the 5th press
  on the fresh 4-seed panel; FAILS if any conversation reaches 6
  recap presses (fix did not hold in the wild).
- M10 coach variation (re-confirmation, SPLIT definition): HOLDS if
  no NARR *coach* line repeats verbatim within one sitting in the
  panel corpora; FAILS if the same coach text appears 2+ times in
  one transcript. Face lines do NOT count toward M10 (they are
  M10b). The r179 FAILS reading (15 face repeats counted as M10)
  is superseded by this split definition — judged here on coach
  only, per the r179 metric review proposal.
- M10b face-guard re-confirmation (NEW, binding): HOLDS if no
  accuseFace line repeats verbatim within one sitting on the
  guarded base; FAILS if any face line repeats 2+ times in one
  transcript (the r179 guard did not hold in the wild — the
  bypass becomes the job, fixed and proven on the worst seed,
  never by re-scoring the panel).
- Q11 scattering capture: CONFIRMED if every seed's JSON records
  scattered / hungryDays / aliveEnd at village end (values may be
  any honest combination, including scattered=false).
- B2 guard re-confirmation (watch): HOLDS if 0 double-confession
  sittings on the fresh panel; a double sitting reopens the item
  (guard bypass — the bypass becomes the job, fixed and proven
  on the worst seed, never by re-scoring the panel). Closed in
  r179 on a second clean panel; this is a third re-confirmation.

## What would count as interesting
- A 0-plot panel (B1 trigger investigation reopens — the trigger
  itself becomes the job).
- A double-confession sitting on the guarded base (B2 reopens).
- A face line repeating verbatim in one sitting (M10b FAIL — the
  r179 guard did not hold in the wild).
- A NARR coach line repeating verbatim in one sitting (M10 FAIL —
  the pool fix did not hold in the wild).
- The Emma "I've told you three times now" prefix repeating
  identically on presses 4–5 again (job B2 — the prefix pool).
- A dawn-scorer conversation shift: conversation volume, timing,
  or bond-proposal counts moving markedly vs r179 (313 convs,
  108 proposals) — expected substrate movement, reported with
  the direction, not judged as a defect.
- M8 PARTIAL on the ALIGNED definition (a real blocked re-raise
  loop — the counter actually looping, not a fresh re-link).
- M9 FAILS again (fix shape wrong — the defect lives elsewhere).
- A 'more'-press run >=5 reproducing on the new base (reopens pool
  widening, r153 job E).
- A villager-initiated proposal ACCEPTED (bond formed by NPC action).
- A grievance-holder accomplice (cold-friends pattern broken).
- A third d100+ village (M5 threshold met again), or a new death shape.
- A senseless transcript (M4 NO-GO with quote).
- The react shape changing on the new base (agree/joke offered on
  goal threads — would mean a menu-path change since r153,
  investigate; the r124/r125 bridge-pool fixes touched these menus).
- M6 gate-away NO-GO (r141 fix fails under its own definition) or a
  stranded scholar who never hears a settled name on return (relay gap).
- A VERBATIM same-beat flag in a fixed pool (M7 — fix not holding).
- A dropped secret that resurfaces next sitting (open-thread ledger
  working) or a dropped PROMISE (canon violation — defect).
- Moots firing 0 times across 4 villages (r163 open item 2 — the
  trigger rarity hardens from watch to defect candidate).
- No-words cycle flags reproducing at r163 levels (agree-pool
  widening would NOT have held — investigate, do not re-fix blind).

## Telemetry
- Metrics: same l3.* keys as r179 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed panel.
