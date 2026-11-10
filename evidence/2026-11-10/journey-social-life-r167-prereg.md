# Journey social life r167 — PRE-REGISTRATION (Lane B, 2026-11-10)

Leg 5 (social life). Rotation-b read 5 at run start; this run plays 5
and writes 6 (crisis next) at closeout. Run number r167 follows r166
(succession). Base: master 632ed6e23 (journey-deepening r124 landed
04:01Z). Lock: playtest-loop-2.lock run_id 2026-11-10T03:55:44Z.
Worktree slug: journey2-social (branch journey2-social).

## Standing state at run start (read before judging anything)

- Rotation-b reads 5 because the leg-4 doorwalk-pilot adoption wrote
  4→5 at 02:59Z (its gate adjudication 344d7b8d7 is in master); r166
  succession landed before that (rotation 7→4). The file, not the
  run history, is the authority for this run's leg.
- `git pull --ff-only` FAILED (diverging — local master ahead of
  origin, ship loop owns reconciliation; same standing state as r159
  and r163). No origin merge attempted; landing is local-master only.
- Main tree was DIRTY at 03:55Z (untracked sim-wave5face-b adoption
  leftovers) and CLEAN by 04:01Z after the adoption round landed
  (f403eaa7c) and r124 landed (632ed6e23). Per the body, the run
  waited for the sibling landing before registering. Pre-flight now:
  status empty, disk 29%.
- No live Lane B run: no playtest-loop-2.lock existed at run start,
  no journey2 entry in the registry, no journey2 worktree.
- The 17:00 CST occurrence's r166 closeout handoff (rotation 7→4)
  is complete: r166 commits are on master, journey2-succession tree
  released.

## Base movement since r163's panel

- r163's coach fix is IN the base (5e190b6ef, coachPriorDeflect pool
  in truth.js) — M10 is a re-confirmation, not a first proof.
- r124's want-after-secret fix is IN the base (facc9d60c): the
  post-answer menu now offers the open want; WANT_Q gains
  seek_taken/seek_comfort/pocketed/warn_you. This is a CONVERSATION
  change landing since r163 — the panel re-measures want threads and
  the goal-thread react shape on the new base. Any change in the
  react shape or 'more'-press runs is investigated, not assumed.
- r166's askfavor fix is IN the base (f9ef1c0dd): engageBeat returns
  null when whyLine + all need phrasings are blocked; dlg:comfort
  falls back to its pool. Dropped-thread / dry-line tallies are
  re-measured on the new base.
- No other src/js conversation landings since r163.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 43301–43304. Full-scope check:
- `git grep -l -E "43301|43302|43303|43304" -- 'evidence/*/*prereg.md'`:
  ZERO hits (every dated prereg).
- `git grep -c -E "\b43301\b|\b43302\b|\b43303\b|\b43304\b" -- evidence/`:
  hits are single occurrences in per-seed census/beat JSONs, all
  pantry-kcal digit noise (`"pantryFreshAfter":43301`,
  `"pantry": 43301`) — the same class r159 accepted for 42703.
  Word-boundary grep confirms no seed-field naming; the files that
  hold them are named for other seeds (s65004, s63801, s64005,
  s8837). No file is named with 43301–43304.
- 43101–43104 is COLLIDED (named in 2026-11-02/03 sensor screen and
  tracer JSONLs: sim-sensorconfirm-b, sim-sensorresupply-b-screen,
  screen-tmp-freshband-b) — do not reuse; first choice rejected.
- 42101–42104 stays COLLIDED (sim-snarecatch-b 2026-10-19).
- Previous social bands: 41801–41804 (r141), 41901–41904 (r144),
  42001–42004 (r145), 42201–42204 (r149), 42301–42304 (r153),
  42601–42604 (r154), 42701–42704 (r159), 42801–42804 (r163).
  Standacc forbidden band is 99201–99208 — a different band.

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics
as r163 (M1–M10 below). Sixth datapoint on Q1 (villager-initiated
bonds) with the bond-initiate build live, second panel on the
coach-fixed base, first panel on the r124 want-after-secret base.

(B) FILL A BLANK — chosen AFTER the panel, from r163's open items,
in this priority order (fix only what the fresh panel shows
reproduces; document the rest):
  1. No-words agree pools are 4 phrases deep (r163 open item 1):
     long no-words sittings cycle the same foreign phrase with a
     freshly drawn nod suffix. Content job: widen the `agree` pools
     in src/data/foreignSpeech.json (all 25 languages, 4→8) — data
     only, no code. Proof: pool-size + no-dupe test; panel
     re-measurement counts cycle flags before/after on the same
     seeds only if the fix lands before the panel (it does not —
     the panel runs FIRST, the fix is judged on a confirmation
     re-run of the worst seed, not by re-scoring the panel).
  2. Moots barely fire (r163 open item 2): 1 moot in 4 villages.
     Investigate the moot trigger (read the trigger code, tally
     moot opportunities vs firings on the fresh panel). Fix only
     if the trigger is a clear threshold defect; if the rarity is
     a design choice, document and leave for Steve.
  3. Double confession in one sitting (r163 open item 3): watch
     for a villager confessing two different secrets in one
     sitting. Observe only this run; a one-secret-per-sitting fix
     is a behavior change and is NOT landed without a second
     datapoint.
(C) WATCH TALLIES (carried, analyzer additions already in r163
tooling, read-only): re-offer (furniture-filtered), dropped
threads (next-sitting resurface check), NARR scan (verbatim
repeats + panelMaxSameNarr), react shape, scattering capture
(scattered / hungryDays / aliveEnd at village end).

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run (r163 canon
section stands). The agree-pool widening is data content in the
existing foreign-speech pools — no new system, no canon change.
The moot investigation reads the trigger as built before judging
it. The double-confession watch changes nothing this run.

## Driver

scripts/journey-social-life-r167-20261110.js = r163 driver verbatim
EXCEPT: fresh seeds 43301–43304, OUTDIR evidence/2026-11-10,
filenames r167. Analyzer:
scripts/analyze-journey-social-r167-20261110.js = r163 analyzer
verbatim except filenames/outdir. Helpers:
scripts/journey-social-r167-helpers.js = r163 helpers verbatim.
Proof tests scripts/test-journey-social-r167.js (r163 fixtures
verbatim) + scripts/test-journey-social-r167-narr.js (r159 narr
fix, carried) + scripts/test-journey-social-r167-coach.js (r163
coach fix, carried). Smoke first: SEED=43301 DAYS=5 into a scratch
subdir, driver wrap runs, no instrumentErrors.

## Leg questions
1. Q1 (continuity): do villagers initiate bonds in wild social play,
   sixth datapoint with the build live? (M2 count question.)
2. Q2 (continuity): arming motive — every plot grievance-linked;
   cold-accomplice pattern holds? (Drought bound RETIRED in r163 —
   do NOT re-open it; plots after d30 are reported, not judged.)
3. Q3 (continuity): invite refusal — party/lure accept/decline, split
   by inviter (succession-proof, inviterWasBearer).
4. Q4 (sense): do full transcripts still read as real people? (M4
   judged from the analyzer's M4 section, in-run.) Does the
   goal-thread react shape hold on the r124 base (agree/joke 0,
   dlg:react present)? Does the 3-label 'more' pool suffice
   (longest continuer run <5)? Do NARR coach lines vary (M10)?
   Do doubt-probe re-offers / dropped threads persist (job C)?
5. Q5 (guardrail): survival — how many villages past d100? Sequence
   now 1/4, 1/4, 0/4, 1/4, 0/4, 0/4, 0/4, 2/4, 3/4, 0/4, 2/4
   (r163) — a standing survival fact, do not re-score it.
6. Q6 (gossip-position, re-aligned): 0 naming-beat lines emitted
   while the scholar is beyond radius-1 of Haven (gate definition),
   debates still kicking and settling. Strict on-tile counts reported
   alongside as the metric-review discrepancy, not a failure.
7. Q7 (dedupe): does the wild panel show any VERBATIM same-beat
   repeat or fallback repeat in a fixed pool (fix not holding), or
   only pool-cycle flags (same phrase, different nod suffix, never
   verbatim — pool depth, reported not failed)? M7 wording clarified
   this run per r163's metric review: "fixed pool" means the
   verbatim/fallback repeats the dedupe mechanism was built to
   stop; pool-cycle exhaustion flags are counted separately and do
   NOT fail M7.
8. Q8 (counter-settle, settled r153): driver still settles counters;
   report fresh vs blocked split + links formed. No new bar.
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
  PILOT seeds 43301–43304, sequential.
- Smoke first: SEED=43301 DAYS=5 into a scratch subdir, driver wrap
  runs, no instrumentErrors.
- The panel runs BEFORE any job-B fix: the panel judges the base as
  landed. A fix is proven on its own proof test + a confirmation
  re-run, never by re-scoring the panel.

## Pre-registered verdicts (BINDING, §14)
- M1 arming motive GO: ≥1 plot arms grievance-linked
  (grievanceTargetToLeader > 0 at arming, or an accomplice motive
  with grievance) OR ≥1 grievance-holder later leads a plot. NO-GO
  if every plot arms with grievance links 0 and reasons
  ambition-only or empty. Plots after d30 are reported only — the
  drought bound is RETIRED (r163), not re-judged.
- M2 villager-initiated bonds: COUNT question, no GO/NO-GO bar.
  Report bond_proposed events by initiatorKind (scholar/villager),
  kind (person/link), outcome (staged/accepted/refused/expired),
  per-initiator counts for PERSON kind only (amendment-5 cap:
  per-initiator ≤8/90d — scored on person-kind; link raises reported
  separately with their 14-day per-pair cooldown), and end bonds +
  whether the engine records a proposer. ANSWERED if ≥1
  villager-initiated person-bond proposal occurs in the wild panel;
  still open if 0. Person-kind per-initiator max printed separately.
- M3 invite refusal, wrapper only: REPORT party/lure
  accept/decline counts (split by inviter). No threshold.
- M4 sense GO: ≥1 full transcript read (friendship, talk request,
  or ambush-recall) passes the bar: NPC wants something real,
  options engage or deflect it, ending resolves/plants/owes.
  Otherwise NO-GO with the failing transcript quoted. Judged from
  the analyzer's M4 section this run. Also report: react shape on
  goal threads (agree/joke/dlg:react/silence counts) and longest
  'more'-press run in any candidate.
- M5 census guardrail: ≥2/4 villages past d100, else all
  dark-channel verdicts are within-window only and must be
  reported that way. Twelfth panel in the sequence — report the
  sequence, do not re-score it mid-run.
- M6 gossip-position GO (RE-ALIGNED): 0 burst/settle/witness/
  tale lines emitted while the scholar is beyond radius-1 of Haven
  (gate-away counts, playerAtHaven definition) across the 4-seed
  panel, AND ≥1 debate kicks and settles somewhere in the panel
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
- M8 counter-settle (settled r153): CONFIRM — ≥1 link forms
  via a driver settle AND no re-raise loop; report fresh vs blocked
  proposeLink split regardless.
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
- M9 FAILS again (fix shape wrong — the defect lives elsewhere).
- A 'more'-press run ≥5 reproducing on the r124 base (reopens
  pool widening, r153 job E).
- A villager-initiated proposal ACCEPTED (bond formed by NPC action).
- A grievance-holder accomplice (cold-friends pattern broken).
- A third d100+ village (M5 threshold met again), or a new death shape.
- A senseless transcript (M4 NO-GO with quote).
- The react shape changing on the r124 base (agree/joke offered on
  goal threads — would mean a menu-path change since r153,
  investigate; the r124 want fix touched these menus).
- M6 gate-away NO-GO (r141 fix fails under its own definition) or a
  stranded scholar who never hears a settled name on return (relay gap).
- A VERBATIM same-beat flag in a fixed pool (M7 — fix not holding).
- A NARR coach line repeating verbatim in one sitting (M10 FAIL —
  the pool fix did not hold in the wild).
- A dropped secret that resurfaces next sitting (open-thread ledger
  working) or a dropped PROMISE (canon violation — defect).
- A double confession in one sitting (r163 open item 3 — second
  datapoint for the one-secret-per-sitting question).
- Moots firing 0 times across 4 villages (r163 open item 2 — the
  trigger rarity hardens from watch to defect candidate).
- No-words cycle flags reproducing at r163 levels (agree-pool
  widening becomes the job-B fill, with a confirmation re-run).

## Telemetry
- Metrics: same l3.* keys as r163 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed
  panel.
