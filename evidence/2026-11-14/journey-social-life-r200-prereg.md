# Journey social life r200 — PRE-REGISTRATION (Lane B, 2026-11-14)

Leg 5 (social life). Rotation-b read 5 at run start; this run plays 5
and writes 6 (crisis next) at closeout. Run number r200 follows r199
(endgame, 2026-11-14, merged ef7430f2f). Base: master 02e8de19c
(sim-transplant15c-a evidence on top of the r199 merge). Seeds
44301–44304 (fresh band, checked below), DAYCAP 140, policy journey
(socialite base + real conversations). Driver
scripts/journey-social-life-r200-20261114.js, analyzer
scripts/analyze-journey-social-r200-20261114.js, helpers
scripts/journey-social-r200-helpers.js — all r195 verbatim except
seeds, OUTDIR evidence/2026-11-14, filenames r200, PLUS nothing:
no new instrument. The r195 M12 door tally + max-door-serves
instrument is carried as-is; its verdict bar is REVISED below per
the r195 metric review.

## Standing state at run start (read before judging anything)

- Lock playtest-loop-2.lock did NOT exist at run start (r199 landed
  cleanly; rotation-b reads 5, verified). Own lock written
  2026-11-14T09:56:30Z, run_id 2026-11-14T09:56:30Z.
- `git pull --ff-only` in main tree: "Already up to date" at 09:56Z;
  master HEAD 02e8de19c. Main tree CLEAN at pre-flight, disk 40%.
  Reaper ran at pre-flight: SKIP (registry lock held by another
  reaper run); removed nothing.
- Host write flap: window 09:44–09:53Z cleared before the run; a
  NEW window ~10:06–10:10Z (~4 min) hit mid-registration — the
  register's heartbeat and my first manual heartbeat both failed
  EPERM; writes cleared ~10:10:26Z (probe OK), heartbeat landed
  10:10:31Z, hbloop journey2-social-hbloop-r200.sh every 10 min
  (PID 36036). Registration itself was slow: `git worktree add`
  took ~9 min (checkout of 108k files under box load 8–11; the
  reset --hard child ran R/D-state the whole time, never stuck).
- Lane A journey-deepening worktree is active today (evidence files
  in 2026-11-14/) — different lane, different rotation/lock/tree;
  no coordination needed beyond shared-repo discipline. Gate
  staggering applies at closeout: never run check.js --quick while
  another loop's gate is running; check pids first.

## Base movement since r195's panel base (340c6679a → 02e8de19c)

130 commits. Conversation/social-relevant src/js changes:
- 56655e81e journey-social r195 [needs-eyes]: favor-requirements
  spend-out fires under the door-block cycle + empty-recap
  4-variant pool. FIRST social panel with these native — the r195
  panel ran on the PRE-fix base and confirmed only on one seed;
  this run confirms both fixes in the wild on fresh seeds (job B1).
- 63c051206 journey-landing r131 [needs-eyes]: HEED fix — warn_you
  warning now engages the want. FIRST social panel with it native.
  Watch item: do warn_you engagements appear in transcripts?
- 6ccdc325e journey-landing r130 [needs-eyes]: ask:village injured
  question gets an injured answer. FIRST social panel with it
  native. Watch item: do injured answers appear?
- 855764c3b sim-retribution-b: defer retribution death lines until
  after the RETRIBUTION summary (narration ordering; may move
  transcript line counts, reported not re-scored).
- e73ee835d sim-rageprecheck-b: refuse Unleash Rage re-press while
  rageActive live (combat; not social, reported not re-scored).
- No dawn-scorer movement since r195. No src/js change from this
  run yet.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 44301–44304. Full-scope check on main tree:
- `git grep -l -E "44301|44302|44303|44304" --
  'evidence/*/*prereg.md'` (all dated preregs): NO hits.
- `git grep -l -E "4430[1234]" --
  'evidence/*/sim-*-prereg.md'`: NO hits.
- Backup band 44401–44404: `git grep -l -E "44401|44402|44403|44404"
  -- 'evidence/*/*prereg.md'`: NO hits.
- COLLISIONS FOUND AND AVOIDED: 44201–44204 is RESERVED — the r195
  prereg names it as its backup band ("NO hits (backup band)"), and
  per the skill a naming reserves the band even with no judged
  corpus. 43901–43904 is RESERVED — the r189 prereg names it as its
  backup band. 44001–44004 is USED — named as seeds by
  journey-deepening preregs r124, r125, r129, r130, r183, r184,
  r187, r188. Recorded so the next worker does not repeat any pick.
- Forbidden band is 99201–99208 — a different band.
- Previous social bands: 41801–41804 (r141), 41901–41904 (r144),
  42001–42004 (r145), 42201–42204 (r149), 42301–42304 (r153),
  42601–42604 (r154), 42701–42704 (r159), 42801–42804 (r163),
  43301–43304 (r167), 43401–43404 (r172), 43501–43504 (r179),
  43601–43604 (r180), 43701–43704 (r181), 43801–43804 (r189),
  44101–44104 (r195).

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics
as r195 (M1–M12). Fourteenth datapoint on Q1 (villager-initiated
bonds) with the build live, FIRST panel with the r195 fixes + the
r130/r131 conversation fixes native in the base.

(B) CONFIRM r195's TWO FIXES IN THE WILD (r195 metric-review
revised bars — the panel judges the base as landed, with the
corrected instrument; a fix that does not hold is REOPENED, proven
+ fixed, never by re-scoring the panel):
  1. FAVORREQ SPEND-OUT (convo-dialogue.js + conversation.js):
     REVISED confirmation bar (r195 metric review — the prereg's
     "max door serves <= 4" bar was miscalibrated: the reframe
     ladder is 4 deep before the exit can fire, so a fresh sitting
     legitimately serves up to 9): max "I've told you three times
     now" serves per sitting <= 1, 0 sittings with 2+, AND >= 1
     exit line ("We're going in circles — ...") served in the
     panel. The door-req FLAG count is NOT the verdict (r195's
     confirm re-run showed flags rising 41 → 49 because the
     4-variant door pool still cycles by design — the fix targets
     the escalation repeat, not pool width).
  2. RECAP-EMPTY POOL (conversation.js, 4 variants via
     convoPickCycle): confirmation bar — recap-empty flags < 10
     panel-wide (r195's confirm seed: 8 → 0; the M11 fix bar was
     >= 10). If >= 10, the pool fix did NOT hold in the wild and
     the item reopens.
  If either confirmation fails, the fix is reopened as this run's
  job (proven on its own proof test + a confirmation re-run on the
  worst seed, never by re-scoring the panel).

(C) WATCH TALLIES (carried, analyzer additions already in r195
tooling, read-only): re-offer (furniture-free max; r195's was 11),
dropped threads (next-sitting resurface check), NARR scan (verbatim
repeats + panelMaxSameNarr), react shape, scattering capture,
player-side greeting repetition. NEW watches this run: HEED
warn_you engagements in transcripts (r131 fix first panel);
ask:village injured answers (r130 fix first panel).
  - M2 COMBINED-PROPOSAL BAR (carried): if any villager's
    person+link total reaches >= 20, the combined-cap question
    becomes a design-look job for the NEXT run (reported, not
    re-scored here). Prior max 14 (Lea, r195).
  - VENDETTA WATCH (carried): report maxUnordered; if >= 8, the
    grievance-loop cooling-off becomes a design-look job for the
    NEXT run (reported, not re-scored here). r195 max 3.
  - MOOTS (watch): r195 saw 8 moots (3/1/1/3). Watch tally only;
    investigate the trigger only if 0 moots fire across the 4
    fresh villages.
(D) NOT THIS RUN: the r171 M2b scholar-open proof test (r178
finding, still open) is an ENDGAME-leg instrument — it belongs to
leg 4, not leg 5. Recorded here so the next social run does not
re-inherit it. The measurement-proof refresh (rounds 12+ owed) is
owned by sim-proofrefresh-b15 (another arm); this run reports the
gate result only.

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run (r195 canon
section stands). The M12 tally is analyzer tooling only — no src/js
change, no canon change. Any job-B fix is a behavior change inside
an existing system — no new system, no canon change, no pool
wording change.

## Driver

scripts/journey-social-life-r200-20261114.js = r195 driver verbatim
EXCEPT: fresh seeds 44301–44304, OUTDIR evidence/2026-11-14,
filenames r200. Analyzer:
scripts/analyze-journey-social-r200-20261114.js = r195 analyzer
verbatim except filenames/outdir + helpers require.
Helpers: scripts/journey-social-r200-helpers.js = r195 helpers
verbatim. Proof tests: the 17 carried tests (r172 ×8, r179
faceguard, r180 narrsplit + favorreq-exit, r181 proposelabel +
vendetta, r189 recapempty, r195 doorreq + favorreq-cycle +
recapempty-pool), all green in-tree before the panel; new proof
tests only if a job-B fix lands.
Smoke first: SEED=44301 DAYS=5 into a scratch subdir, driver wrap
runs, no instrumentErrors.

## Leg questions
1. Q1 (continuity): do villagers initiate bonds in wild social play,
   fourteenth datapoint with the build live? (M2 count question.)
2. Q2 (continuity): arming motive — every plot grievance-linked;
   cold-accomplice pattern holds? NEW: does any pair re-arm to 8+
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
   in r179, re-confirmed clean in r180, r181, r189, r195; re-confirm
   as watch)? Does the recap-empty line still cycle (M11 — fix
   confirmation, job B1)? Does the door cluster still dominate
   (M12 — fix confirmation, job B1, revised bar)? Do the r130/r131
   conversation fixes show in the wild (warn_you engagements,
   injured answers)?
5. Q5 (guardrail, REVISED per r189 metric review — ADOPTED r195):
   M5 is REPORT-ONLY. Report median lived-days + past-d100 count
   judged against the survival-control median (126d); the
   "within-window only" guardrail reading triggers only if 0/4
   villages pass d75 (a floor that still catches a panel where
   villages die before social systems can fire). The hard 2/4
   past-d100 bar is RETIRED. Sequence for the record: 2/4 (r172),
   2/4 (r179), 1/4 (r180), 1/4 (r181), 1/4 (r189), 3/4 (r195).
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
   A flag in a pool left as legitimate variety is reported, not a
   failure.
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
13. Q12 (M11, fix confirmation): does the recap-empty line still
    cycle within sittings — how many M4 flags carry the recap-empty
    core? (r195 confirm seed: 8 → 0.)
14. Q13 (M12, fix confirmation, REVISED bar): max "three times"
    serves per sitting <= 1, 0 sittings with 2+, >= 1 exit line
    served. (The prereg's old "max door serves <= 4" bar is
    superseded by the r195 metric review.)

## Panel (binding)
- Policy journey (socialite base + real conversations), DAYCAP 140,
  PILOT seeds 44301–44304, sequential.
- Smoke first: SEED=44301 DAYS=5 into a scratch subdir, driver wrap
  runs, no instrumentErrors.
- The panel runs AFTER the job-B tooling (the M12 tally is
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
  investigation, not a re-score. (r195 armed 6 — the trigger
  investigation is NOT live this run unless this panel arms 0.)
  Plots after d30 are reported only. VENDETTA WATCH: report
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
  COMBINED BAR (carried): if any villager's person+link total reaches
  >= 20, the combined-cap question becomes a design-look job for
  the NEXT run (reported, not re-scored here). Prior max 14
  (Lea, r195).
- M3 invite refusal, wrapper only: REPORT party/lure
  accept/decline counts (split by inviter). No threshold.
- M4 sense GO: >=1 full transcript read (friendship, talk request,
  or ambush-recall) passes the bar: NPC wants something real,
  options engage or deflect it, ending resolves/plants/owes.
  Otherwise NO-GO with the failing transcript quoted. Judged from
  the analyzer's M4 section this run. Also report: react shape on
  goal threads (agree/joke/dlg:react/silence counts) and longest
  'more'-press run in any candidate. Re-offer headline is the
  FURNITURE-FREE max (leave/silence furniture excluded); the raw
  panelMax is reported alongside.
- M5 census guardrail (REVISED, adopted r195 per the r189 metric
  review): REPORT-ONLY — median lived-days + past-d100 count vs the
  survival-control median (126d). The "within-window only" reading
  triggers only if 0/4 villages pass d75. The hard 2/4-past-d100 bar
  is retired; if the survival collapse is fixed and villages live
  longer, a future run may reinstate an absolute bar at the
  then-current control median. This panel is NOT re-scored.
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
  r179 on a second clean panel, re-confirmed clean in r180, r181,
  r189 and r195; this is a seventh re-confirmation.
- M11 recap-empty tally (FIX CONFIRMATION, revised): the r195 pool
  fix HOLDS if recap-empty flags < 10 panel-wide (r195 confirm
  seed: 8 → 0). If >= 10, the fix did NOT hold in the wild and
  the item reopens (proven + fixed, never by re-scoring the panel).
- M12 door-requirement tally (FIX CONFIRMATION, REVISED bar per
  r195 metric review): the r195 spend-out fix HOLDS if max
  "I've told you three times now" serves per sitting <= 1, 0
  sittings with 2+, AND >= 1 exit line ("We're going in circles
  — ...") served in the panel. The old "max door serves <= 4" bar
  is superseded (the reframe ladder is 4 deep before the exit can
  fire; a fresh sitting legitimately serves up to 9). The
  door-req FLAG count is reported, not judged. If the bar is not
  met, the fix reopens (proven + fixed, never by re-scoring the
  panel).

## What would count as interesting
- A 0-plot panel (B1 trigger investigation reopens — the trigger
  itself becomes the job).
- A pair re-arming to 8+ (vendetta watch bar — cooling-off design
  look becomes the next run's job).
- A villager proposing 20+ combined bonds (M2 combined bar —
  combined-cap design look becomes the next run's job).
- A double-confession sitting on the guarded base (B2 reopens).
- A face line repeating verbatim in one sitting (M10b FAIL — the
  r179 guard did not hold in the wild).
- A NARR coach line repeating verbatim in one sitting (M10 FAIL —
  the pool fix did not hold in the wild).
- A dawn-scorer conversation shift: conversation volume, timing,
  or bond-proposal counts moving markedly vs r195 (474 convs,
  160 proposals) — expected substrate movement from the r130/r131
  dialogue fixes, reported with the direction, not judged as a
  defect.
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
- M11 >= 10 again (recap-empty pool fix did NOT hold — job B1
  reopens).
- M12 confirmation bar missed (spend-out fix did NOT hold — job B1
  reopens).
- HEED warn_you engagements or ask:village injured answers in the
  wild (r130/r131 fixes showing, first panel).
- DRY CENSUS movement: deflect_q / dlg:doubt / refusal dry hits on
  the first panel with r130/r131 native.

## Telemetry
- Metrics: same l3.* keys as r195 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed panel.
