# Journey social life r206 — PRE-REGISTRATION (Lane B, 2026-11-14)

Leg 5 (social life). Rotation-b read 5 at run start; this run plays 5
and writes 6 (crisis next) at closeout. Run number r206 follows r203
(endgame, 2026-11-14, merged f0b64c672); r204/r205 were Lane A. No r206
evidence exists. Base: master 007c61738 (sim-transplant16-a evidence).
Seeds 44501–44504 (fresh band, checked below), DAYCAP 140, policy
journey (socialite base + real conversations). Driver
scripts/journey-social-life-r206-20261114.js, analyzer
scripts/analyze-journey-social-r206-20261114.js, helpers
scripts/journey-social-r206-helpers.js — all r200 verbatim except
seeds/OUTDIR/filenames, PLUS the two r200-metric-review analyzer
additions (M12-native tallyThreeTimes + M2 rate watch, proven by
scripts/test-journey-social-r206-threetimes.js, 11/11 incl. r200
corpus anchors 23/1/0/91 and rates 0.177/0.328).

## Standing state at run start (read before judging anything)

- Lock playtest-loop-2.lock did NOT exist at run start (the 16:00 run's
  stale lock was deleted by the 16:02 follow-up). Own lock written
  2026-11-14T22:57:27Z, run_id oversight-playtest-loop-2-2026-11-14T22:57:27Z.
- `git pull --ff-only` in main tree: "Already up to date" at 22:57Z;
  master HEAD 007c61738. Main tree CLEAN at pre-flight, disk 39%.
- Stale journey2-social tree from the 15:00/16:00 aborted runs: worktree
  dir existed, branch at 59f78034c (ancestor of master), tree CLEAN, no
  work to preserve. Released as done-abandoned, worktree removed, branch
  deleted; fresh journey2-social registered from 007c61738. Heartbeat
  landed immediately; hbloop every 10 min.
- Registration queue: Lane A journey-landing-r134 registered concurrently
  (22:50Z, ~15 min checkout); my release waited on REGISTRY.lock ~9 min,
  then my register ran ~4 min. No interference — different lane, different
  rotation/lock/tree. Gate staggering applies at closeout: never run
  check.js --quick while another loop's gate is running; check pids first.
- Host write flap: last window ended ~21:42Z (flickering tail of the
  15:04–15:39 CST window); probes at 22:57Z OK in /tmp and the repo.
  Flap-watch cycles 22:55–22:56Z show A–D/F–H OK (E/I EEXIST is the
  probe's own lock file, not a refusal).

## Base movement since r200 (02e8de19c → 007c61738, 135 commits)

Conversation/social-relevant src/js changes:
- 3bffd4752 journey-landing r132: nod-loop fix — repeat nv: gesture
  thins the sitting (proof 13/13; pilot 3/3 loops -> 0/3) [needs-eyes].
  FIRST social panel with it native. Could move conversation counts
  (thinner sittings, fewer loop flags) — reported with direction, not
  judged as a defect.
- f1871e37b journey-crisis r201: favor-want settle gate [needs-eyes].
  FIRST social panel with it native. Could move counter-settle counts
  (M8) — reported, not re-scored.
- 4c860321d journey-deepening r191 Q1: stage-0 guard fresh-favor
  reorder — H1 phantom re-ask fix [needs-eyes]. FIRST social panel
  with it native. Could move favor re-ask counts — reported, not
  re-scored.
- Reunion arena balance (ee8292e0b, e17c08d78, 0d8d3650a): arena-only,
  not social. Version bumps only otherwise.
- No dawn-scorer movement since r200. No src/js change from this run yet.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 44501–44504. Full-scope check on main tree:
- `git grep -l -E "44501|44502|44503|44504" --
  'evidence/*/*prereg.md'`: NO hits.
- `git grep -l -E "4450[1234]" --
  'evidence/*/sim-*-prereg.md'`: NO hits.
- Backup band 44601–44604: `git grep -l -E "44601|44602|44603|44604"
  -- 'evidence/*/*prereg.md'`: NO hits.
- COLLISIONS FOUND AND AVOIDED: 44201–44204 is RESERVED — the r195
  prereg names it as its backup band, and per the skill a naming
  reserves the band even with no judged corpus. 43901–43904 is RESERVED
  — the r189 prereg names it as its backup band. 44401–44404 is RESERVED
  — the r200 prereg names it as its backup band. 44001–44004 is USED —
  named as seeds by journey-deepening preregs r124, r125, r129, r130,
  r183, r184, r187, r188. 44301–44304 is USED — r200's seeds. Forbidden
  band is 99201–99208 — a different band.
- Previous social bands: 41801–41804 (r141), 41901–41904 (r144),
  42001–42004 (r145), 42201–42204 (r149), 42301–42304 (r153),
  42601–42604 (r154), 42701–42704 (r159), 42801–42804 (r163),
  43301–43304 (r167), 43401–43404 (r172), 43501–43504 (r179),
  43601–43604 (r180), 43701–43704 (r181), 43801–43804 (r189),
  44101–44104 (r195), 44301–44304 (r200).

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics
as r195/r200 (M1–M12). Fifteenth datapoint on Q1 (villager-initiated
bonds) with the build live, FIRST panel with the r132 nod-loop fix,
the r201 favor-want settle gate, and the r191 fresh-favor reorder
native in the base.

(B) RE-CONFIRM r195's TWO FIXES IN THE WILD on fresh seeds, with the
REVISED bars from r195's metric review, now counted NATIVELY by the
analyzer (r200 metric review — no hand script this run):
  1. FAVORREQ SPEND-OUT (convo-dialogue.js + conversation.js):
     max "I've told you three times now" serves per sitting <= 1,
     0 sittings with 2+, AND >= 1 exit line ("We're going in
     circles — ...") served in the panel. The door-req FLAG count is
     NOT the verdict.
  2. RECAP-EMPTY POOL (conversation.js, 4 variants via convoPickCycle):
     recap-empty flags < 10 panel-wide (r195's confirm seed: 8 → 0;
     r200: 0). If >= 10, the pool fix did NOT hold in the wild and
     the item reopens.
  If either confirmation fails, the fix is reopened as this run's
  job (proven on its own proof test + a confirmation re-run on the
  worst seed, never by re-scoring the panel).

(C) WATCH TALLIES (carried, read-only): re-offer (furniture-free max;
  r200's was 12), dropped threads (next-sitting resurface check), NARR
  scan (verbatim repeats + panelMaxSameNarr), react shape, scattering
  capture, player-side greeting repetition. NEW/REPEATED watches this
  run: HEED warn_you engagements in transcripts (r131 fix; r200 found
  none by text grep — second panel); ask:village injured answers
  (r130 fix; r200 found none — second panel). M2 rate watch is now
  printed natively (proposals per village-day; r195 0.328, r200 0.177;
  watch only, no bar).
  - M2 COMBINED-PROPOSAL BAR (carried): if any villager's
    person+link total reaches >= 20, the combined-cap question
    becomes a design-look job for the NEXT run (reported, not
    re-scored here). Prior max 14 (Lea, r195); r200 max 9.
  - VENDETTA WATCH (carried): report maxUnordered; if >= 8, the
    grievance-loop cooling-off becomes a design-look job for the
    NEXT run (reported, not re-scored here). r195/r200 max 3.
  - MOOTS (watch): r200 saw 4 moots (2/1/0/1). Watch tally only;
    investigate the trigger only if 0 moots fire across the 4
    fresh villages.
(D) NOT THIS RUN: the r171 M2b scholar-open proof test (r178
finding, still open) is an ENDGAME-leg instrument — it belongs to
leg 4, not leg 5. Recorded here so the next social run does not
re-inherit it. The measurement-proof refresh (rounds 12+ owed) is
owned by sim-proofrefresh-b18 (another arm, in flight); this run
reports the gate result only.

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run (r195/r200 canon
sections stand). The M12-native tally + M2 rate watch are analyzer
tooling only — no src/js change, no canon change. Any job-B fix is a
behavior change inside an existing system — no new system, no canon
change, no pool wording change.

## Driver

scripts/journey-social-life-r206-20261114.js = r200 driver verbatim
EXCEPT: fresh seeds 44501–44504, OUTDIR evidence/2026-11-14,
filenames r206. Analyzer:
scripts/analyze-journey-social-r206-20261114.js = r200 analyzer
verbatim except filenames/outdir + helpers require + the two r200
metric-review additions (tallyThreeTimes per-seed + panel M12-native
lines; proposalsPerVillageDay panel M2 rate-watch line). Helpers:
scripts/journey-social-r206-helpers.js = r200 helpers verbatim PLUS
tallyThreeTimes + proposalsPerVillageDay. Proof tests: the 17 carried
tests (r172 ×8, r179 faceguard, r180 narrsplit + favorreq-exit, r181
proposelabel + vendetta, r189 recapempty, r195 doorreq +
favorreq-cycle + recapempty-pool) + the new r206 threetimes test
(11/11, corpus-anchored), all green in-tree before the panel; new
proof tests only if a job-B fix lands.
Smoke first: SEED=44501 DAYS=5 into a scratch subdir, driver wrap
runs, no instrumentErrors.

## Leg questions

1. Q1 (continuity): do villagers initiate bonds in wild social play,
   fifteenth datapoint with the build live? (M2 count question.)
   Watch: proposals per village-day vs r195 0.328 / r200 0.177.
2. Q2 (continuity): arming motive — every plot grievance-linked;
   cold-accomplice pattern holds? Does any pair re-arm to 8+
   (vendetta watch bar)?
3. Q3 (continuity): invite refusal — party/lure accept/decline, split
   by inviter (succession-proof, inviterWasBearer).
4. Q4 (sense): do full transcripts still read as real people? (M4
   judged from the analyzer's M4 section, in-run.) Does the
   goal-thread react shape hold on the new base (agree/joke 0,
   dlg:react present)? Does the 3-label 'more' pool suffice (longest
   continuer run <5)? Does the nod-loop fix show (fewer loop flags)?
   Do NARR coach lines vary (M10, coach only)? Do doubt-probe
   re-offers / dropped threads persist (job C)? Does a double
   confession reproduce on the guarded base (B2 — closed in r179,
   re-confirmed clean in r180, r181, r189, r195, r200; re-confirm
   as watch)? Does the recap-empty line still cycle (M11 — fix
   confirmation, job B2)? Does the door cluster still dominate
   (M12 — fix confirmation, job B1, revised bar, native counts)?
   Do the r130/r131 conversation fixes show in the wild (warn_you
   engagements, injured answers — second panel)?
5. Q5 (guardrail, REVISED per r189 metric review — ADOPTED r195):
   M5 is REPORT-ONLY. Report median lived-days + past-d100 count
   judged against the survival-control median (126d); the
   "within-window only" guardrail reading triggers only if 0/4
   villages pass d75 (a floor that still catches a panel where
   villages die before social systems can fire). The hard 2/4
   past-d100 bar is RETIRED. Sequence for the record: 2/4 (r172),
   2/4 (r179), 1/4 (r180), 1/4 (r181), 1/4 (r189), 3/4 (r195),
   2/4 (r200).
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
   Watch: does the r201 favor-want settle gate move the counts?
9. Q9 (recap cap, re-confirmation): does the cap still fire in the
   wild on the fixed code — no conversation presses 'recap' 6+
   times?
10. Q10 (coach variation, re-confirmation, SPLIT definition): does
    the coach pool vary in the wild — no NARR *coach* line repeats
    verbatim within one sitting? (Face lines are M10b, not M10.)
11. Q10b (face-guard re-confirmation): does the r179 one-face-
    line-per-sitting guard hold in the wild — no accuseFace line
    repeats verbatim within one sitting on the guarded base?
12. Q11 (scattering, re-confirmation): does every seed's JSON record
    scattered / hungryDays / aliveEnd at village end?
13. B2 (double-confession, re-confirmation): 0 sittings with 2+
    'confessed' confrontation outcomes.

## What would count as interesting (pre-registered)

- M1 NO-GO (a plot armed with no grievance link) or a grievance-holder
  accomplice (cold-friends pattern broken).
- M2: a villager-initiated proposal ACCEPTED (bond formed by NPC action);
  any villager's person+link total >= 20 (combined-cap design look);
  the per-village-day rate moving markedly vs r195/r200 (0.328/0.177).
- M3: invitations always taken or always refused (the ruling is
  "sometimes taken").
- M4 NO-GO (a senseless transcript, with quote) or the react shape
  changing on the new base (agree/joke offered on goal threads).
- M5: a third d100+ village, or 0/4 past d75 (guardrail floor).
- M6 gate-away NO-GO (r141 fix fails under its own definition) or a
  stranded scholar who never hears a settled name on return (relay gap).
- M7: a VERBATIM same-beat flag in a fixed pool (fix not holding).
- M8 PARTIAL on the ALIGNED definition (a real blocked re-raise loop).
- M9 FAILS again (fix shape wrong — the defect lives elsewhere).
- A 'more'-press run >= 5 reproducing on the new base (reopens pool
  widening, r153 job E).
- A dropped secret that resurfaces next sitting (open-thread ledger
  working) or a dropped PROMISE (canon violation — defect).
- Moots firing 0 times across 4 villages (r163 open item 2 — the
  trigger rarity hardens from watch to defect candidate).
- M11 >= 10 again (recap-empty pool fix did NOT hold — job B2
  reopens).
- M12 confirmation bar missed (spend-out fix did NOT hold — job B1
  reopens).
- HEED warn_you engagements or ask:village injured answers in the
  wild (r130/r131 fixes showing, first or second panel).
- The r132 nod-loop fix showing in the wild (loop flags down, thinner
  sittings) or NOT showing (3/3 pilot loops reproduced on the new base).
- The r201 favor-want settle gate or r191 fresh-favor reorder moving
  M8/favor counts markedly vs r200.

## Telemetry

- Metrics: same l3.* keys as r195/r200 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed panel.
