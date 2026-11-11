# Journey social life r179 — PRE-REGISTRATION (Lane B, 2026-11-11)

Leg 5 (social life). Rotation-b read 5 at run start (r178 adoption wrote
4→5 at ~10:04Z); this run plays 5 and writes 6 (crisis next) at closeout.
Run number r179 follows r178 (endgame). Base: master c3d89858f
(journey-endgame r178 landed). Seeds 43501–43504 (fresh band, verified
in r172 prereg as the clean backup band), DAY CAP 140, policy journey
(socialite base + real conversations). Driver
scripts/journey-social-life-r179-20261111.js, analyzer
scripts/analyze-journey-social-r179-20261111.js, helpers
scripts/journey-social-r179-helpers.js — all r172 verbatim except seeds,
OUTDIR evidence/2026-11-11, filenames r179.

## Standing state at run start (read before judging anything)

- Stale-lock recovery on r178's adoption lock (2026-11-11T07:57:15Z;
  registry heartbeat 76 min stale at 09:55Z, no live procs found) —
  but the adoption coordinator was in fact ALIVE behind a host EPERM
  write flap (its heartbeat writes were refused, so it looked dead;
  the classic flap hazard). It committed c3d89858f (gate 1 288/12 GO +
  gate 2 292/8 GO on rebased tip) at 09:58:42Z, merged, wrote rotation
  5, and removed its tree at ~10:06Z. This run stood down on the
  adoption, killed its own redundant gate, stopped heartbeating the
  removed tree, and did NOT touch the adoption's branch (fully merged,
  tip = master HEAD). Lesson re-learned: during an active flap, a stale
  heartbeat is NOT proof of death — check for live processes before
  retiring a run, and never merge/release another run's tree.
- EPERM write flap active intermittently this morning (O_EXCL creates
  refused 09:57–09:58, window 09:59–10:01, refused again ~10:08;
  registry atomic writes failing, one fleet register
  sim-dutyfirst-b2 produced no entry after ~9 min). Long jobs run
  nohup-detached with log polling; registry writes retried on
  windows only (single-success trigger). No git writes attempted
  until a probe succeeds.
- `git pull --ff-only` FAILED (diverging — local master ahead 547 /
  behind 156 of origin; ship loop owns reconciliation; same standing
  state as r159/r163/r167/r172/r178). No origin merge attempted;
  landing is local-master only.
- Main tree CLEAN at pre-flight, disk 38%. Reaper run at 09:57
  crashed on the flap (PermissionError in atomic_write_json);
  registry reads OK (46 trees).

## Base movement since r172's panel (4717ed481 → c3d89858f)

104 commits, 8 touching src/js. Conversation-relevant:
- bd0bf10e2 r172: one-confession-per-sitting guard (truth.js +
  conversation.js) — IN the base now; this panel re-confirms it
  (0 doubles expected; any double = guard failure, see B2).
- 6769471ca r125: personal-bridge pool 2→6 (verbatim dlg:subject
  repeats fix). 586ef734a r124: want-bridge pool 2→6 (same class).
- ed33b42b8 r129: favour-line variety (1890 block, partner block,
  away line) + cistern pluralization.
- 82450a883 r176 crisis: party-role death release (F1), settled-debt
  deflect (F2), already-held role line (F3), resume-quote
  silence/bridge filter (F4).
- fc0ffb37c r130: name the trust amount in succession + aid-beg says
  and book notes.
- a16ce1cc8 r131: cook/mend routine-work grants fill ladder rungs
  (ladder, not conversation). b6cf13684 r128: grant-rate dial.
- r178 endgame: evidence + scripts only, zero src/js.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 43501–43504. `git grep -l -E "43501|43502|43503|43504" --
'evidence/*/*prereg.md'`: exactly ONE hit — the r172 prereg itself,
naming 43501–43504 as the verified-clean backup band. No prereg has
USED this band as seeds. (The full-count grep was killed for time;
the prereg-name check is the binding one and r172 already verified
the band clean.) Previous social bands: 41801–41804 (r141),
41901–41904 (r144), 42001–42004 (r145), 42201–42204 (r149),
42301–42304 (r153), 42601–42604 (r154), 42701–42704 (r159),
42801–42804 (r163), 43301–43304 (r167), 43401–43404 (r172).
Standacc forbidden band is 99201–99208 — a different band.

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics
as r172 (M1–M10 below). Eighth datapoint on Q1 (villager-initiated
bonds) with the build live, first panel on the r172-guard +
r124/r125 bridge-pool + r129 favour-variety + r176 crisis-line base.

(B) FILL A BLANK — chosen from r172's open items, in this priority
order (fix only what the fresh panel shows reproduces; document
the rest):
  1. M1 ARMING MOTIVE — SECOND ZERO (r172 metric review): r172
     armed 0 plots on all 4 villages, so M1 was NO DATA. If this
     panel also arms 0 plots, the plot-arming trigger itself is
     the investigation (rarity hardens from watch to defect
     candidate): read the arming trigger as built, check whether
     grievances ever reach its threshold in wild play, and report
     whether the trigger is too rare to measure or genuinely
     broken. No src change on a single second zero unless the
     trigger reads as broken; a fix, if landed, follows the
     proof-test + confirm re-run pattern.
  2. DOUBLE-CONFESSION GUARD RE-CONFIRMATION (r172 job B1,
     landed): the one-confession-per-sitting guard is in the base.
     The panel should show 0 double-confession sittings. Any
     double on the fresh panel = the guard did NOT hold in the
     wild: reproduce on the worst seed, read the transcript, fix
     the bypass. If 0, the guard is confirmed on a second panel
     and the item closes.
  3. MOOTS (r163 open item 2 — watch): r172 saw 4 moots (1/2/1/0).
     Watch tally only; investigate the trigger only if 0 moots
     fire across the 4 fresh villages.
  4. FACE-BEAT RECYCLE (r167 watch item, unobserved): accuseFace
     holds 3 variants and drawTruthLine recycles on exhaustion;
     no verbatim face repeat appeared in r167/r172. Watch via the
     NARR scan; if a face line repeats verbatim in one sitting,
     apply the r167 coach-guard pattern to accuseFace.
(C) WATCH TALLIES (carried, analyzer additions already in r172
tooling, read-only): re-offer (furniture-filtered), dropped
threads (next-sitting resurface check), NARR scan (verbatim
repeats + panelMaxSameNarr), react shape, scattering capture
(scattered / hungryDays / aliveEnd at village end).

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run (r167 canon
section stands). Any guard/trigger fix is a behavior change inside
an existing system — no new system, no canon change.

## Driver

scripts/journey-social-life-r179-20261111.js = r172 driver verbatim
EXCEPT: fresh seeds 43501–43504, OUTDIR evidence/2026-11-11,
filenames r179. Analyzer:
scripts/analyze-journey-social-r179-20261111.js = r172 analyzer
verbatim except filenames/outdir. Helpers:
scripts/journey-social-r179-helpers.js = r172 helpers verbatim.
Proof tests: the r172 carried tests (r172, narr, coach,
coachrepeat, agree, confess, confessguard, confesswrap) re-run
green in-tree before the panel; new proof tests only if a job-B
fix lands.
Smoke first: SEED=43501 DAYS=5 into a scratch subdir, driver wrap
runs, no instrumentErrors.

## Leg questions
1. Q1 (continuity): do villagers initiate bonds in wild social play,
   eighth datapoint with the build live? (M2 count question.)
2. Q2 (continuity): arming motive — every plot grievance-linked;
   cold-accomplice pattern holds? Second consecutive 0-plot panel
   moves the question to the trigger itself (job B1). Plots after
   d30 are reported, not judged (drought bound RETIRED in r163).
3. Q3 (continuity): invite refusal — party/lure accept/decline, split
   by inviter (succession-proof, inviterWasBearer).
4. Q4 (sense): do full transcripts still read as real people? (M4
   judged from the analyzer's M4 section, in-run.) Does the
   goal-thread react shape hold on the new base (agree/joke 0,
   dlg:react present)? Does the 3-label 'more' pool suffice (longest
   continuer run <5)? Do NARR coach lines vary (M10)? Do doubt-probe
   re-offers / dropped threads persist (job C)? Does a double
   confession reproduce on the guarded base (B2 — the guard
   re-confirmation)?
5. Q5 (guardrail): survival — how many villages past d100? Sequence
   now 1/4, 1/4, 0/4, 1/4, 0/4, 0/4, 0/4, 2/4, 3/4, 0/4, 2/4, 0/4,
   2/4 (r172) — a standing survival fact, do not re-score it.
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
10. Q10 (coach variation, re-confirmation): does the coach pool vary
    in the wild — no NARR coach line repeats verbatim within one
    sitting?
11. Q11 (scattering, re-confirmation): does the scattering capture
    still record scattered / hungryDays / aliveEnd at village end?

## Panel (binding)
- Policy journey (socialite base + real conversations), DAYCAP 140,
  PILOT seeds 43501–43504, sequential.
- Smoke first: SEED=43501 DAYS=5 into a scratch subdir, driver wrap
  runs, no instrumentErrors.
- The panel runs BEFORE any job-B fix: the panel judges the base as
  landed. A fix is proven on its own proof test + a confirmation
  re-run, never by re-scoring the panel.

## Pre-registered verdicts (BINDING, §14)
- M1 arming motive GO: >=1 plot arms grievance-linked
  (grievanceTargetToLeader > 0 at arming, or an accomplice motive
  with grievance) OR >=1 grievance-holder later leads a plot. NO-GO
  if every plot arms with grievance links 0 and reasons
  ambition-only or empty. NO DATA if 0 plots arm (r172 precedent);
  a SECOND consecutive 0-plot panel triggers the job-B1 trigger
  investigation, not a re-score. Plots after d30 are reported only.
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
  reported that way. Fourteenth panel in the sequence — report the
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
- B2 guard re-confirmation: HOLDS if 0 double-confession sittings
  on the fresh panel; FAILS (guard bypass) if >=1 double sitting
  appears — the bypass becomes the job, fixed and proven on the
  worst seed, never by re-scoring the panel.

## What would count as interesting
- A second consecutive 0-plot panel (B1 — the trigger investigation
  becomes the job).
- A double-confession sitting on the guarded base (B2 — the guard
  did not hold; a bypass exists).
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
- Metrics: same l3.* keys as r172 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed panel.
