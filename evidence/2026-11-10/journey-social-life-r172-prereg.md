# Journey social life r172 — PRE-REGISTRATION (Lane B, 2026-11-10)

Leg 5 (social life). Rotation-b read 5 at run start; this run plays 5
and writes 6 (crisis next) at closeout. Run number r172 follows r171
(endgame). Base: master 4717ed481 (journey-endgame r171 landed).
Lock: playtest-loop-2.lock run_id 2026-11-10T18:59:07Z.
Worktree slug: journey2-social (branch journey2-social).

## Standing state at run start (read before judging anything)

- Rotation-b reads 5 because the r171 endgame adoption wrote 4->5 at
  ~18:58Z (merge 4717ed481 landed, tree released, lock deleted by the
  adoption closeout itself). The file, not the run history, is the
  authority for this run's leg.
- The 10:00 occurrence's lock (run_id 2026-11-10T16:13:48Z) had NO
  registry match, but the adoption coordinator was provably alive on
  journey2-endgame (registry heartbeat 18:54:02Z, 2 min old) — the
  11:00 and 12:00 occurrences both stood down on the same pattern.
  This 13:00 occurrence found the closeout FINISHED (tree removed,
  branch deleted, rotation 5, lock gone) and created its own lock
  only after verifying the tree was gone and the main tree clean.
- `git pull --ff-only` FAILED (diverging — local master ahead of
  origin; ship loop owns reconciliation; same standing state as
  r159/r163/r167). No origin merge attempted; landing is
  local-master only.
- Main tree CLEAN at pre-flight, disk 34%. Reaper removed nothing;
  10/16 active, all other owners' dirty trees, never auto-removed.
- No live Lane B run at registration: journey2-social registered
  fresh (run_id 2026-11-10T19:05:16Z), heartbeat loop running
  (pid 11325, every 10 min).

## Base movement since r167's panel

- r167's fixes are IN the base (79274c749): coach-repeat suppression
  in truth.js confrontWindup + foreignSpeech.json agree pools 4->8.
  M10/M7 are re-confirmations on the fixed base, not first proofs.
- r125 secret-line variety is IN (10fe7ee52): 4 variants per
  secret-answer kind via convoPick + 4 teach-plant frames via
  frame-index rotation. CONVERSATION change since r167 — the panel
  re-measures secret variety and teach frames on the new base. The
  r125 TEACHFRAME analyzer scan is NOT in the r172 social analyzer;
  teach-frame repeats surface, if at all, as M7 near-dup flags.
- r169/r170 succession conversation fixes are IN (e04480c9f,
  72a598bf8, 2147af8a4): dlg:more blocked beats fall through
  honestly, ask:lately answers are shared village news. The panel
  re-measures the react shape and dropped-thread tallies on the new
  base; any change is investigated, not assumed.
- r123 observe-react pool fix is IN (57e0eb67b): the 'I just said'
  misfire is fixed; watch for its return in M4 flags.
- sim-roleform-b is IN (e5c19e54e): role formation — competence and
  skill now move from lived experience. Could change villager
  behavior subtly (differentiated roles, party formation). Watch
  M2/M4 for shape changes; investigate, don't assume.
- sim-scholarcount-a is IN (3995d21d6): scholar kills count in the
  veteran bar (Steve RULED 2026-11-10). Ladder logic, not
  conversation; M5 sequence unaffected in definition.
- r171's M2b fix is IN (fc556edec): probe-side only, zero src/js.
  No conversation change.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 43401–43404. Full-scope check:
- `git grep -l -E "43401|43402|43403|43404" -- 'evidence/*/*prereg.md'`:
  ZERO hits (every dated prereg).
- `git grep -c -E "\b43401\b|\b43402\b|\b43403\b|\b43404\b" -- evidence/`:
  hits are single occurrences in per-seed census/beat JSONs, all
  pantry-kcal digit noise (`"pantryFreshBefore":43404` — the same
  class r167 accepted for 42703). Word-boundary grep confirms no
  seed-field naming; the files that hold them are named for other
  seeds (s44, s11, s3101, s3106, s6207, s63803). No file is named
  with 43401–43404.
- 43101–43104 stays COLLIDED (named in 2026-11-02/03 sensor screen
  and tracer JSONLs). 42101–42104 stays COLLIDED (sim-snarecatch-b
  2026-10-19). 43501–43504 verified clean as the backup band.
- Previous social bands: 41801–41804 (r141), 41901–41904 (r144),
  42001–42004 (r145), 42201–42204 (r149), 42301–42304 (r153),
  42601–42604 (r154), 42701–42704 (r159), 42801–42804 (r163),
  43301–43304 (r167). Standacc forbidden band is 99201–99208 — a
  different band.

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics
as r167 (M1–M10 below, M8 wording aligned — see job B2). Seventh
datapoint on Q1 (villager-initiated bonds) with the build live,
second panel on the coach-fixed base, first panel on the r125
secret-variety + r169/r170 menu-fix base.

(B) FILL A BLANK — chosen from r167's open items, in this priority
order (fix only what the fresh panel shows reproduces; document
the rest):
  1. DOUBLE CONFESSION (r163 open item 3 — now THREE datapoints:
     Sylvie r163, Jesse + Arlo r167). Judge as a pattern on the
     fresh panel. INSTRUMENT (new this run): driver wraps
     Game.confrontDoubt / Game.confrontTheft (read-only) recording
     {sitting, vid, day, method, outcome} into confrontEvents;
     analyzer tallies sittings with >=2 'confessed' outcomes
     (confrontation confessions: identity-lie + theft; the
     volunteered "Can I tell you something?" path is once-per-life
     per villager and cannot repeat in a sitting — the manual M4
     read covers a volunteered+confront double). If the fresh
     panel shows >=1 double-confession sitting, land the
     one-confession-per-sitting guard: a second confess-candidate
     in the same sitting deflects instead of confessing (same
     sitting-scoped pattern as the r167 coach fix — the sitting
     has heard one secret; the villager says so). Proof test
     RED->GREEN + confirmation re-run on the worst seed. If 0,
     document as not-reproduced and leave the behavior alone.
  2. M8 ANALYZER ALIGNMENT (r167 metric review — tooling, no src
     change): the r167 analyzer counts ANY link-kind bond_proposed
     record after a link-forming settle as a "re-raise". That
     conflates fresh villager re-proposals to a formerly-linked
     village (Sofia 43304 d70/d72: the d13 link had dissolved;
     proposeLink's own guard proves it — it returned 'counter'
     for a NEW counter, not the already-linked refusal) with a
     counter looping. ALIGNED definition: a re-raise is a BLOCKED
     proposeLink call (pendingBefore === true, result 'counter')
     to the same target after a link-forming settle — the same
     counter looping. A FRESH proposeLink call (pendingBefore ===
     false) after a settle is a fresh re-link, reported
     separately. Proof: the fixed r172 analyzer re-run against
     the r167 JSONs must read M8 SETTLED on 43304 (not PARTIAL)
     — the RED case is already in evidence.
  3. MOOTS (r163 open item 2 — better, still thin): 6 moots
     across 4 villages in r167 (2/2/2/0) vs r163's 1. Watch tally
     only this run; investigate the trigger only if 0 moots fire
     across the 4 fresh villages.
  4. FACE-BEAT RECYCLE (r167 watch item, unobserved): accuseFace
     holds 3 variants and drawTruthLine recycles on exhaustion;
     no verbatim face repeat appeared in r167. Watch via the NARR
     scan; if a face line repeats verbatim in one sitting, apply
     the r167 coach-guard pattern to accuseFace.
(C) WATCH TALLIES (carried, analyzer additions already in r163
tooling, read-only): re-offer (furniture-filtered), dropped
threads (next-sitting resurface check), NARR scan (verbatim
repeats + panelMaxSameNarr), react shape, scattering capture
(scattered / hungryDays / aliveEnd at village end).

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run (r167 canon
section stands). The one-confession-per-sitting guard, if landed,
is a behavior change inside the existing confrontation system —
no new system, no canon change; the stale-doubt rule ("they don't
confess the same thing twice") already establishes the
one-secret-per-doubt shape, and the guard extends it across
fields within one sitting. The M8 alignment is analyzer wording
only. The moot investigation reads the trigger as built before
judging it.

## Driver

scripts/journey-social-life-r172-20261110.js = r167 driver verbatim
EXCEPT: fresh seeds 43401–43404, OUTDIR evidence/2026-11-10,
filenames r172, PLUS (B1) the confrontDoubt/confrontTheft wraps
with sitting stamps into confrontEvents. Analyzer:
scripts/analyze-journey-social-r172-20261110.js = r167 analyzer
verbatim except filenames/outdir, PLUS (B2) the aligned M8
re-raise definition (blocked proposeLink after a settle; fresh
re-links reported separately) and (B1) the CONFESS tally
(sittings with >=2 'confessed' confrontation outcomes).
Helpers: scripts/journey-social-r172-helpers.js = r167 helpers
verbatim PLUS tallyConfessions. Proof tests
scripts/test-journey-social-r172.js (r167 fixtures verbatim) +
scripts/test-journey-social-r172-narr.js (r159 narr fix, carried)
+ scripts/test-journey-social-r172-coach.js (r163 coach fix,
carried) + scripts/test-journey-social-r172-coachrepeat.js
(r167 job 1, carried) + scripts/test-journey-social-r172-agree.js
(r167 job 2, carried) + scripts/test-journey-social-r172-confess.js
(B1 tally, fixture-driven) — written only if the panel reproduces
the double confession; the tally itself is proven by the fixture
test regardless.
Smoke first: SEED=43401 DAYS=5 into a scratch subdir, driver wrap
runs, no instrumentErrors.

## Leg questions
1. Q1 (continuity): do villagers initiate bonds in wild social play,
   seventh datapoint with the build live? (M2 count question.)
2. Q2 (continuity): arming motive — every plot grievance-linked;
   cold-accomplice pattern holds? (Drought bound RETIRED in r163 —
   do NOT re-open it; plots after d30 are reported, not judged.)
3. Q3 (continuity): invite refusal — party/lure accept/decline, split
   by inviter (succession-proof, inviterWasBearer).
4. Q4 (sense): do full transcripts still read as real people? (M4
   judged from the analyzer's M4 section, in-run.) Does the
   goal-thread react shape hold on the r125/r169/r170 base
   (agree/joke 0, dlg:react present)? Does the 3-label 'more' pool
   suffice (longest continuer run <5)? Do NARR coach lines vary
   (M10)? Do doubt-probe re-offers / dropped threads persist
   (job C)? Does a double confession reproduce (B1 — the
   fourth-datapoint question)?
5. Q5 (guardrail): survival — how many villages past d100? Sequence
   now 1/4, 1/4, 0/4, 1/4, 0/4, 0/4, 0/4, 2/4, 3/4, 0/4, 2/4, 0/4
   (r167) — a standing survival fact, do not re-score it.
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
8. Q8 (counter-settle, ALIGNED definition this run): driver still
   settles counters; report fresh vs blocked split + links formed.
   A re-raise is a BLOCKED proposeLink to the same target after a
   link-forming settle; fresh re-links are reported separately
   and do NOT fail M8. No new bar beyond the aligned wording.
9. Q9 (recap cap, re-confirmation): does the cap still fire in the
   wild on the fixed code — no conversation presses 'recap' 6+
   times?
10. Q10 (coach variation, re-confirmation): does the coach pool vary
    in the wild — no NARR coach line repeats verbatim within one
    sitting?
11. Q11 (scattering, re-confirmation): does the scattering capture
    still record scattered / hungryDays / aliveEnd at village end?

## Panel (binding)
- Policy journey (socialite base + real conversations), DAYCAP 140,
  PILOT seeds 43401–43404, sequential.
- Smoke first: SEED=43401 DAYS=5 into a scratch subdir, driver wrap
  runs, no instrumentErrors.
- The panel runs BEFORE any job-B fix: the panel judges the base as
  landed. A fix is proven on its own proof test + a confirmation
  re-run, never by re-scoring the panel.

## Pre-registered verdicts (BINDING, §14)
- M1 arming motive GO: >=1 plot arms grievance-linked
  (grievanceTargetToLeader > 0 at arming, or an accomplice motive
  with grievance) OR >=1 grievance-holder later leads a plot. NO-GO
  if every plot arms with grievance links 0 and reasons
  ambition-only or empty. Plots after d30 are reported only — the
  drought bound is RETIRED (r163), not re-judged.
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
  reported that way. Thirteenth panel in the sequence — report the
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
- M10 coach variation (re-confirmation): HOLDS if no NARR coach
  line repeats verbatim within one sitting in the panel corpora;
  FAILS if the same coach text appears 2+ times in one transcript.
- Q11 scattering capture: CONFIRMED if every seed's JSON records
  scattered / hungryDays / aliveEnd at village end (values may be
  any honest combination, including scattered=false).

## What would count as interesting
- A double-confession sitting on the fresh panel (B1 — fourth
  datapoint; the one-secret-per-sitting guard becomes the job).
- M8 PARTIAL on the ALIGNED definition (a real blocked re-raise
  loop — the counter actually looping, not a fresh re-link).
- M9 FAILS again (fix shape wrong — the defect lives elsewhere).
- A 'more'-press run >=5 reproducing on the r125/r169/r170 base
  (reopens pool widening, r153 job E).
- A villager-initiated proposal ACCEPTED (bond formed by NPC action).
- A grievance-holder accomplice (cold-friends pattern broken).
- A third d100+ village (M5 threshold met again), or a new death shape.
- A senseless transcript (M4 NO-GO with quote).
- The react shape changing on the new base (agree/joke offered on
  goal threads — would mean a menu-path change since r153,
  investigate; the r125 secret-variety fix touched these menus).
- M6 gate-away NO-GO (r141 fix fails under its own definition) or a
  stranded scholar who never hears a settled name on return (relay gap).
- A VERBATIM same-beat flag in a fixed pool (M7 — fix not holding).
- A NARR coach line repeating verbatim in one sitting (M10 FAIL —
  the pool fix did not hold in the wild).
- A NARR face line repeating verbatim in one sitting (B4 — the
  accuseFace guard becomes the job).
- A dropped secret that resurfaces next sitting (open-thread ledger
  working) or a dropped PROMISE (canon violation — defect).
- Moots firing 0 times across 4 villages (r163 open item 2 — the
  trigger rarity hardens from watch to defect candidate).
- No-words cycle flags reproducing at r163 levels (agree-pool
  widening would NOT have held — investigate, do not re-fix blind).

## Telemetry
- Metrics: same l3.* keys as r167 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed
  panel.
