# Journey social life r181 — PRE-REGISTRATION (Lane B, 2026-11-12)

Leg 5 (social life). Rotation-b read 5 at run start; this run plays 5
and writes 6 (crisis next) at closeout. Run number r181 follows r180
(social, 2026-11-11). Base: master d98aae0f0 (journey-endgame r185).
Seeds 43701–43704 (fresh band), DAY CAP 140, policy journey
(socialite base + real conversations). Driver
scripts/journey-social-life-r181-20261112.js, analyzer
scripts/analyze-journey-social-r181-20261112.js, helpers
scripts/journey-social-r181-helpers.js — all r180 verbatim except
seeds, OUTDIR evidence/2026-11-12, filenames r181, PLUS the M1
vendetta-cadence tally in helpers + analyzer (job B1 below, proven by
scripts/test-journey-social-r181-vendetta.js 30/30).

## Rotation anomaly (read before adopting)

None this run. r180's run note claims it wrote rotation 6 at closeout;
the file read 5 at this run's start — the same clobber r180 already
diagnosed (r182's endgame adoption wrote 4→5 at ~13:28 CST Nov 11,
overwriting r179's 6). r185 (endgame, leg 4) then wrote 5 again at its
closeout. The file says 5 NOW, so this run plays leg 5 per the file and
writes 6 at closeout. Leg 5 was played yesterday (r180, full panel) —
this run is the tenth datapoint on Q1 and the first panel with the
r180 favorreq-exit fix NATIVE in the base (r180's panel ran with it
in-tree) plus the r183 conversation changes below.

## Standing state at run start (read before judging anything)

- **EPERM write flap active intermittently this morning.** First
  `worktree-register.sh` attempt failed mid-checkout (08:00–08:09Z:
  `unable to write file tools/mobile-sim.html`, `unable to write
  file version.json`, `fatal: Could not reset index file to revision
  'HEAD'`; git cleaned up the partial tree — no registry entry, no
  leftover .git/worktrees entry, verified clean). Second attempt
  (08:10–08:18Z) exited 120 with an EMPTY log while `git reset
  --hard` was still running — killed, not failed; cause undetermined
  (no FAIL line, no git error captured). Third attempt (08:20Z,
  nohup-detached per the r180 long-job pattern, on a PROBE-OK
  window at 08:20:29Z) SUCCEEDED: worktree journey2-social at
  d98aae0f0, registry active, heartbeat 08:21:22Z. Heartbeat loop
  journey2-social-hbloop-r181.sh running every 10 min (PID 20324);
  heartbeat re-landed 08:31:08Z. Long jobs run nohup-detached with
  log polling; writes retried on probe windows only (single-success
  trigger, per the flap skill). No git writes attempted until a probe
  succeeds.
- `git pull --ff-only` in main tree: "Already up to date" — no
  divergence this run.
- Main tree CLEAN at pre-flight, disk 40%. Reaper run at ~07:56Z:
  exit 0, removed nothing, active 14/16; LOUD dirty trees are other
  owners' — not touched. (The 15th worktree slot is this run's;
  sim-ctraj-b is locked.)
- Lock file playtest-loop-2.lock: ABSENT at run start (no previous
  run to check) — own lock written 2026-11-12T07:55:52Z,
  run_id loop2-20261112T075552Z.

## Base movement since r180's panel base (3eec28a81 → d98aae0f0)

83 commits, 13 touch src/js. Conversation/social-relevant changes:
- ac9a34cc4 r180: favor-requirements exits honestly instead of
  repeating the escalation (convo-dialogue.js) + M10 coach/face split
  (analyzer only) — IN the base now; r180's panel ran with the fix
  in-tree, this is the first panel with it native. No outcome change
  expected (trajectory-neutral on r180's confirm re-run).
- e965b66f5 succession r183: Rafael resume-opener fix (attribution,
  presence, settled gate) — conversation openings. May shift
  opener/continuation shapes slightly; reported, not re-scored.
- 7dea8790e scale r132: raise-answer template — link:/bond: answers
  only once the ask is heard. May shift bond-proposal outcomes
  (M2/M8 counts); reported, not re-scored.
- 2062747e6 deepening r183: convoTeachPlaceLine 4-frame rotation —
  conversation teaching-line variety. May reduce M7 near-dup flags;
  reported, not re-scored.
- 7f676033d sim-finalvoice-b: finale voice cap + full-seat bar
  suppression (endgame, not conversation). 20da580d7 / 9b98a0efc /
  4bfa06573: medicine narration + warpath verb guards (not
  conversation). 13e6f40ae mournblooded hold beat (not conversation).
- Two ship version bumps only (25d9a7c85, aedf7f699).
- No dawn-scorer movement since r180 (reconciled scorer already in
  the r180 base). No src/js change from this run yet.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 43701–43704. `git grep -l -E "43701|43702|43703|43704"
-- 'evidence/*/*prereg.md'` (all dated preregs, main tree): ONE hit —
evidence/2026-11-11/journey-social-life-r180-prereg.md, which names
the band ONLY as the pre-checked next band ("Same check for the next
band 43701–43704: also no prereg hits") and records its evidence hits
as kcal values (pantryKcal 43704, preservedKcal 43702), NOT seeds.
No prereg has USED this band as seeds. Per the r179→r180 precedent
(r180 used 43601–43604 after r179's prereg pre-checked them the same
way), the band is fresh; the pre-check naming is not a use. Previous
social bands: 41801–41804 (r141), 41901–41904 (r144), 42001–42004
(r145), 42201–42204 (r149), 42301–42304 (r153), 42601–42604 (r154),
42701–42704 (r159), 42801–42804 (r163), 43301–43304 (r167),
43401–43404 (r172), 43501–43504 (r179), 43601–43604 (r180).
Standacc forbidden band is 99201–99208 — a different band.

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics
as r180 (M1–M10 below) PLUS M10b (face-guard re-confirmation) and
the new M1-vendetta watch tally. Tenth datapoint on Q1
(villager-initiated bonds) with the build live, FIRST panel with the
r180 favorreq-exit fix native in the base + the r183 conversation
changes above.

(B) FILL A BLANK — chosen from r180's open items, in this priority
order (fix only what the fresh panel shows reproduces; document
the rest):
  1. M1 VENDETTA CADENCE (r180 metric review, watch item) — DONE
     pre-panel as an instrument: tallyVendetta in helpers +
     analyzer printout (directed + unordered per-pair counts,
     pairs >= 4 with day spans). Hayden<->Emma armed 6 plots in
     16 days on r180; the watch bar is maxUnordered >= 8 — if
     this panel shows a pair at >= 8, the grievance loop's
     cooling-off becomes a DESIGN-LOOK job for the NEXT run (not
     a knob, not fixed here). Proof:
     scripts/test-journey-social-r181-vendetta.js 30/30 (synthetic
     pairs + r180 corpus anchor: 10 arms, maxUnordered 6,
     maxDirected 5, span d7-d22).
  2. M2 COMBINED-PROPOSAL COUNT (r180 metric review, watch item):
     Sam proposed 8 times total (person + link) on r180. The
     amendment-5 cap is person-kind only and holds (max 4). Watch
     only: if a villager proposes 8+ PERSON bonds this panel, the
     cap itself needs re-reading.
  3. MOOTS (r163 open item 2 — watch): r180 saw 5 moots (1/0/1/3).
     Watch tally only; investigate the trigger only if 0 moots
     fire across the 4 fresh villages.
  4. MEASUREMENT-PROOF REFRESH (r179-owed, r180 B4): owned by
     sim-proofrefresh-b7 (running now, another arm). This run
     reports the gate result only — if
     test-measurement-proof-update.js still fails on manifest
     staleness, the refresh is still owed by that arm, not this run.
(C) WATCH TALLIES (carried, analyzer additions already in r180
tooling, read-only): re-offer (furniture-filtered), dropped
threads (next-sitting resurface check), NARR scan (verbatim
repeats + panelMaxSameNarr), react shape, scattering capture
(scattered / hungryDays / aliveEnd at village end), player-side
greeting repetition (r180 watch item — the driver's own greeting
lines repeat in long sittings; NPC side varies each time. Not an
NPC defect; if a future run shows the NPC echoing the player's
repetition, it becomes a job).

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run (r180 canon
section stands). The vendetta tally is analyzer tooling only — no
src/js change, no canon change. Any job-B fix is a behavior change
inside an existing system — no new system, no canon change.

## Driver

scripts/journey-social-life-r181-20261112.js = r180 driver verbatim
EXCEPT: fresh seeds 43701–43704, OUTDIR evidence/2026-11-12,
filenames r181. Analyzer:
scripts/analyze-journey-social-r181-20261112.js = r180 analyzer
verbatim except filenames/outdir + the vendetta tally printout.
Helpers: scripts/journey-social-r181-helpers.js = r180 helpers
verbatim + tallyVendetta. Proof tests: the r172 carried tests
(r172, narr, coach, coachrepeat, agree, confess, confessguard,
confesswrap) + r179 faceguard + r180 narrsplit + r181 vendetta,
re-run green in-tree before the panel; new proof tests only if a
job-B fix lands.
Smoke first: SEED=43701 DAYS=5 into a scratch subdir, driver wrap
runs, no instrumentErrors.

## Leg questions
1. Q1 (continuity): do villagers initiate bonds in wild social play,
   tenth datapoint with the build live? (M2 count question.)
2. Q2 (continuity): arming motive — every plot grievance-linked;
   cold-accomplice pattern holds? r180 armed 10 plots, all early
   d7–d22; the second-zero trigger investigation is NOT triggered
   unless this panel arms 0. NEW: does any pair re-arm to 8+
   (vendetta watch bar)?
3. Q3 (continuity): invite refusal — party/lure accept/decline, split
   by inviter (succession-proof, inviterWasBearer).
4. Q4 (sense): do full transcripts still read as real people? (M4
   judged from the analyzer's M4 section, in-run.) Does the
   goal-thread react shape hold on the new base (agree/joke 0,
   dlg:react present)? Does the 3-label 'more' pool suffice (longest
   continuer run <5)? Do NARR coach lines vary (M10, coach only)?
   Do doubt-probe re-offers / dropped threads persist (job C)? Does
   a double confession reproduce on the guarded base (B2 — closed
   in r179 on a second clean panel, re-confirmed clean in r180;
   re-confirm as watch)?
5. Q5 (guardrail): survival — how many villages past d100? Sequence
   now …, 2/4 (r172), 2/4 (r179), 1/4 (r180). A standing survival
   fact, do not re-score it.
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
11. Q10b (face-guard re-confirmation): does the r179 one-face-
    line-per-sitting guard hold in the wild — no accuseFace line
    repeats verbatim within one sitting on the guarded base?
12. Q11 (scattering, re-confirmation): does the scattering capture
    still record scattered / hungryDays / aliveEnd at village end?

## Panel (binding)
- Policy journey (socialite base + real conversations), DAYCAP 140,
  PILOT seeds 43701–43704, sequential.
- Smoke first: SEED=43701 DAYS=5 into a scratch subdir, driver wrap
  runs, no instrumentErrors.
- The panel runs AFTER the job-B1 tooling fix (the vendetta tally is
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
  investigation, not a re-score. (r180 armed 10 — the trigger
  investigation is NOT live this run unless this panel arms 0.)
  Plots after d30 are reported only. VENDETTA WATCH (new): report
  maxUnordered; if >= 8, the grievance-loop cooling-off becomes a
  design-look job for the NEXT run (reported, not re-scored here).
- M2 villager-initiated bonds: COUNT question, no GO/NO-GO bar.
  Report bond_proposed events by initiatorKind (scholar/villager),
  kind (person/link), outcome (staged/accepted/refused/expired),
  per-initiator counts for PERSON kind only (amendment-5 cap:
  per-initiator <=8/90d — scored on person-kind; link raises reported
  separately with their 14-day per-pair cooldown), and end bonds +
  whether the engine records a proposer. ANSWERED if >=1
  villager-initiated person-bond proposal occurs in the wild panel;
  still open if 0. Person-kind per-initiator max printed separately.
  COMBINED WATCH: if any villager's person+link total reaches 8+,
  the cap re-reading is owed (r180: Sam 8 total, max person 4).
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
  reported that way. Sixteenth panel in the sequence — report the
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
- M10b face-guard re-confirmation: HOLDS if no accuseFace line
  repeats verbatim within one sitting on the guarded base; FAILS if
  any face line repeats 2+ times in one transcript (the r179 guard
  did not hold in the wild — the bypass becomes the job, fixed and
  proven on the worst seed, never by re-scoring the panel).
- Q11 scattering capture: CONFIRMED if every seed's JSON records
  scattered / hungryDays / aliveEnd at village end (values may be
  any honest combination, including scattered=false).
- B2 guard re-confirmation (watch): HOLDS if 0 double-confession
  sittings on the fresh panel; a double sitting reopens the item
  (guard bypass — the bypass becomes the job, fixed and proven
  on the worst seed, never by re-scoring the panel). Closed in
  r179 on a second clean panel, re-confirmed clean in r180; this
  is a fourth re-confirmation.

## What would count as interesting
- A 0-plot panel (B1 trigger investigation reopens — the trigger
  itself becomes the job).
- A pair re-arming to 8+ (vendetta watch bar — cooling-off design
  look becomes the next run's job).
- A double-confession sitting on the guarded base (B2 reopens).
- A face line repeating verbatim in one sitting (M10b FAIL — the
  r179 guard did not hold in the wild).
- A NARR coach line repeating verbatim in one sitting (M10 FAIL —
  the pool fix did not hold in the wild).
- A dawn-scorer conversation shift: conversation volume, timing,
  or bond-proposal counts moving markedly vs r180 (316 convs,
  89 proposals) — expected substrate movement from the r183
  conversation changes, reported with the direction, not judged
  as a defect.
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
- A villager proposing 8+ PERSON bonds (M2 cap re-reading owed).

## Telemetry
- Metrics: same l3.* keys as r180 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed panel.
