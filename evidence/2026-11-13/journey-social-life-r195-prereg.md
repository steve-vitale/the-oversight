# Journey social life r195 — PRE-REGISTRATION (Lane B, 2026-11-13)

Leg 5 (social life). Rotation-b read 5 at run start; this run plays 5
and writes 6 (crisis next) at closeout. Run number r195 follows r194
(endgame, 2026-11-13). Base: master 340c6679a (culpritbisect-b round-12
merge on top of e2e35630c; r194's endgame merge 88df218eb is an
ancestor). Seeds 44101–44104 (fresh band, checked below), DAY CAP 140,
policy journey (socialite base + real conversations). Driver
scripts/journey-social-life-r195-20261113.js, analyzer
scripts/analyze-journey-social-r195-20261113.js, helpers
scripts/journey-social-r195-helpers.js — all r189 verbatim except
seeds, OUTDIR evidence/2026-11-13, filenames r195, PLUS the M12
door-requirement tally + max-door-serves instrument (job B1 below,
analyzer-only; proven by scripts/test-journey-social-r195-doorreq.js
against the r189 corpus anchors: 86 door flags of 143, max serves
7/6/6/6, totals 66/102/84/80).

## Standing state at run start (read before judging anything)

- Lock playtest-loop-2.lock did NOT exist at run start (r193/r194
  adoptions closed cleanly; rotation-b reads 5, verified). Own lock
  written 2026-11-13T19:55:43Z, run_id
  journey2-social-r195-20261113T195543Z.
- `git pull --ff-only` in main tree: "Already up to date" at 19:55Z;
  master then moved by a sibling's ff-only merge of
  sim-culpritbisect-b (reflog: merge on top of e2e35630c — legitimate,
  evidence-only bisect corpora, no src/js behavior change for this
  leg). Worktree journey2-social registered on the moved master
  340c6679a; heartbeat landed 20:09:25Z, hbloop
  journey2-social-hbloop-r195.sh every 10 min (PID 182166).
- Main tree CLEAN at pre-flight, disk 36%. Reaper ran (log
  /tmp/reap-r195.log): removed nothing, active 11/16; LOUD dirty
  trees are other owners' — not touched. Registration took ~7 min
  and the first heartbeat ~4.5 min, both queued behind the reaper's
  REGISTRY.lock hold (known reaper lock self-contention, 2026-11-12).
- Lane A journey-scale r195 is active today (evidence files in
  2026-11-13/) — different lane, different rotation/lock/tree; no
  coordination needed beyond shared-repo discipline. Gate
  staggering applies at closeout: never run check.js --quick while
  another loop's gate is running; check pids first.

## Base movement since r189's panel base (dc95859a8 → 340c6679a)

111 commits. Conversation/social-relevant src/js changes:
- 27ce36ecd crisis r192: ledger-aware dialogue pools (F1–F5) —
  deflect_q, refusal, dlg:doubt dry lines; monsterNoun clause-verb
  gap; question-shaped thread labels. FIRST social panel with these
  native — the DRY CENSUS question is live: do the r192 fixes hold
  in the wild on leg 5 (r193's wild check already passed for
  deflect_q/dlg:doubt on leg 7)?
- 1f257d01f succession r193: agency closer dry-line pool-picker
  (convoWouldBlock pre-check). FIRST social panel with it native.
- 6daaafae4 sim-steeple-a: rage + steeple narration dedup once per
  (fight, monster). c0fc52cfd sim-applystatus-a: applyStatus freeze
  line once per monster per fight. 873a8b7a7 sim-combatdedup-b:
  strike/falls once per fight, SNAPS once per monster. 12d263736
  sim-strikefall-a: defer death narration past the player strike
  line. 4a2cc89de sim-freezeline-a: freeze line once per monster
  per fight (44→21 lines). 6c4a95602 sim-namelessadm-b: nameless
  admission line fix. All narration-dedup; may move transcript
  line counts, reported not re-scored.
- 9893267d9 establishment r85: favor menu admits live forage runs.
  a717031ce r135: field ask gated on teachable-now. 1decd5bee
  r134: spoken raise keeps its answer window. Minor conversation
  surface changes; reported, not re-scored.
- No dawn-scorer movement since r189. No src/js change from this
  run yet.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 44101–44104. Full-scope check on main tree:
- `git grep -l -E "44101|44102|44103|44104" --
  'evidence/*/*prereg.md'` (all dated preregs): NO hits.
- `git grep -l -E "44201|44202|44203|44204" --
  'evidence/*/*prereg.md'`: NO hits (backup band).
- COLLISIONS FOUND AND AVOIDED: 43901–43904 is RESERVED — the r189
  prereg names it as its backup band ("Backup band 43901–43904 also
  clean"), and per the skill a naming reserves the band even with no
  judged corpus. 44001–44004 is USED — named as seeds by
  journey-deepening preregs r124, r125, r129, r130, r183, r184,
  r187, r188. Recorded so the next worker does not repeat either
  pick.
- Forbidden band is 99201–99208 — a different band.
- Previous social bands: 41801–41804 (r141), 41901–41904 (r144),
  42001–42004 (r145), 42201–42204 (r149), 42301–42304 (r153),
  42601–42604 (r154), 42701–42704 (r159), 42801–42804 (r163),
  43301–43304 (r167), 43401–43404 (r172), 43501–43504 (r179),
  43601–43604 (r180), 43701–43704 (r181), 43801–43804 (r189).

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics
as r189 (M1–M11) PLUS M12 (door-requirement tally + max serves).
Thirteenth datapoint on Q1 (villager-initiated bonds) with the
build live, FIRST panel with the r192 F1–F5 + r193 closer dialogue
fixes native in the base.

(B) FILL A BLANK — chosen from r189's open items, in this priority
order (fix only what the fresh panel shows reproduces; document
the rest):
  1. M12 DOOR-REQUIREMENT CLUSTER + r35 SPEND-OUT (r189 "Interesting"
     watch item, now the job). r189's near-dup flags: 86 of 143
     (60%) carry a Haven-door requirement core — the densest repeat
     cluster, taking over from recap-empty (19 on r181, 1 on r189).
     The pool itself was already widened 1→4 variants (r129/r130)
     and cycles correctly; the defect is underneath. Worst sitting
     (r189, 43801, D-talk-request grace_obi, 10 turns): the driver
     asks "Why can't I do this now?" 7 times and the NPC serves the
     door instruction 7 times, the reframe stuck at "I've told you
     three times now —" for asks 4, 5, 6, 7 — the line LIES about
     the count and repeats. Mechanism (read in code): the r35
     spend-out keys its escalation counter on the RAW line
     (_favorReqLastRaw === rawReq), but the r130 cycle rotates the
     raw line every ask, so the counter resets every press and the
     spend-out can NEVER fire for the cycling favorblock /
     favorpartner pools (only stable-raw blocks like the food
     blocker can trigger it — which is why the r180 proof test,
     staged on the food blocker, is green while the wild door case
     still repeats). The r180 test's own comment acknowledges the
     gap ("a non-adjacent scholar never sees a stable raw line and
     the escalation never accumulates").
     BAR: if the fresh panel shows any sitting with >= 5 door
     serves AND the "three times" reframe serving 2+ times in that
     sitting, the fix lands: key the spend-out escalation on the
     block reason (status.reasonKey, stable per pool — 'favorblock'
     / 'favorpartner') with fallback to the raw line when reasonKey
     is absent (food and other stable blocks, preserving r180
     behavior exactly), proven by a NEW proof test driving the
     REAL turn dispatch on the cycling door block (RED first: the
     "three times" line serves 4 times and the choice never spends
     out; GREEN after: it serves at most once and the choice spends
     out by the 6th press, transcript lines never repeat the
     escalation) + a confirmation re-run on the worst seed (max
     door serves <= 4 in the worst sitting, no "three times"
     repeat). If the panel does NOT reproduce it, document and move
     on — no fix. The fix changes no pool wording and no canon:
     the door requirement ("same side of the Haven door") is
     company-favor/water-run canon (docs/CONVERSATIONS.md).
  2. M2 COMBINED-PROPOSAL BAR (r189 job B2, carried): if any
     villager's person+link total reaches >= 20, the combined-cap
     question becomes a design-look job for the NEXT run (reported,
     not re-scored here). Prior max 16 (Rosa, r189).
  3. VENDETTA WATCH (r189 Q2, carried): report maxUnordered; if
     >= 8, the grievance-loop cooling-off becomes a design-look job
     for the NEXT run (reported, not re-scored here). r189 max 4.
  4. MOOTS (r163 open item 2 — watch): r189 saw 7 moots (1/3/2/1).
     Watch tally only; investigate the trigger only if 0 moots
     fire across the 4 fresh villages.
  5. MEASUREMENT-PROOF REFRESH (r179-owed, r189 B5): owned by
     sim-proofrefresh-b10 (another arm). This run reports the gate
     result only — if test-measurement-proof-update.js still fails
     on manifest staleness, the refresh is still owed by that arm
     (rounds 11 + 12 now owed: r192 + r193 changed src/js since
     b10's panel), not this run.
(C) WATCH TALLIES (carried, analyzer additions already in r189
tooling, read-only): re-offer (furniture-free max; r189's was 12 —
party_name in one Aroha sitting), dropped threads (next-sitting
resurface check), NARR scan (verbatim repeats + panelMaxSameNarr),
react shape, scattering capture, player-side greeting repetition
(r180 watch item — driver-side only unless the NPC echoes it).
(D) NOT THIS RUN: the r171 M2b scholar-open proof test (r178
finding, still open) is an ENDGAME-leg instrument — it belongs to
leg 4, not leg 5. Recorded here so the next social run does not
re-inherit it.

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run (r189 canon
section stands). The M12 tally is analyzer tooling only — no src/js
change, no canon change. Any job-B1 fix is a behavior change inside
an existing system (the r35 spend-out's escalation key) — no new
system, no canon change, no pool wording change.

## Driver

scripts/journey-social-life-r195-20261113.js = r189 driver verbatim
EXCEPT: fresh seeds 44101–44104, OUTDIR evidence/2026-11-13,
filenames r195. Analyzer:
scripts/analyze-journey-social-r195-20261113.js = r189 analyzer
verbatim except filenames/outdir + the M12 door tally and
max-door-serves printouts. Helpers:
scripts/journey-social-r195-helpers.js = r189 helpers verbatim +
tallyDoorReq + maxDoorServes. Proof tests: the 14 carried tests
(r172 ×8, r179 faceguard, r180 narrsplit + favorreq-exit, r181
proposelabel + vendetta, r189 recapempty — the proposelabel and
vendetta tests repointed to the r195 filenames per the r190
precedent) + r195 doorreq, all green in-tree before the panel
(15/15); new proof tests only if a job-B fix lands.
Smoke first: SEED=44101 DAYS=5 into a scratch subdir, driver wrap
runs, no instrumentErrors.

## Leg questions
1. Q1 (continuity): do villagers initiate bonds in wild social play,
   thirteenth datapoint with the build live? (M2 count question.)
2. Q2 (continuity): arming motive — every plot grievance-linked;
   cold-accomplice pattern holds? r189 armed 11 plots, all early
   d6–d25; the second-zero trigger investigation is NOT triggered
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
   in r179, re-confirmed clean in r180, r181, r189; re-confirm as
   watch)? Does the recap-empty line still cycle (M11)? Does the
   door cluster still dominate (M12 — new tally)? Does the r35
   spend-out fire under the cycle (M12 fix bar)?
5. Q5 (guardrail, REVISED per r189 metric review — ADOPTED this
   run): M5 is now REPORT-ONLY. Report median lived-days + past-d100
   count judged against the survival-control median (126d);
   the "within-window only" guardrail reading triggers only if 0/4
   villages pass d75 (a floor that still catches a panel where
   villages die before social systems can fire). The hard 2/4
   past-d100 bar is RETIRED. Sequence for the record: 2/4 (r172),
   2/4 (r179), 1/4 (r180), 1/4 (r181), 1/4 (r189).
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
13. Q12 (M11, watch): does the recap-empty line still cycle within
    sittings — how many M4 flags carry the recap-empty core?
14. Q13 (M12, NEW): how many M4 flags carry a door-requirement core,
    and what is the worst sitting's door-serve count? Does the r35
    spend-out fire under the cycle (fix bar, job B1)?

## Panel (binding)
- Policy journey (socialite base + real conversations), DAYCAP 140,
  PILOT seeds 44101–44104, sequential.
- Smoke first: SEED=44101 DAYS=5 into a scratch subdir, driver wrap
  runs, no instrumentErrors.
- The panel runs AFTER the job-B1 tooling (the M12 tally is
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
  investigation, not a re-score. (r189 armed 11 — the trigger
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
  the NEXT run (reported, not re-scored here). Prior max 16
  (Rosa, r189).
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
- M5 census guardrail (REVISED, adopted this run per the r189 metric
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
  r179 on a second clean panel, re-confirmed clean in r180, r181
  and r189; this is a sixth re-confirmation.
- M11 recap-empty tally (watch): report the count of M4 flags
  carrying the recap-empty core ("we were just talking. nothing
  important", prefix-stripped) per seed and panel-wide. Anchors:
  r181 = 19 flags of 126, r189 = 1 of 143. Bar >= 10 (job-B1 pool
  fix) stands but the cluster has collapsed — if this panel shows
  >= 10 again, the pool fix lands (proven + confirm re-run on the
  worst seed, never by re-scoring the panel). If < 10, document
  and move on — no fix.
- M12 door-requirement tally (NEW, watch + fix bar): report the
  count of M4 flags carrying a door-requirement core (tallyDoorReq)
  per seed and panel-wide, plus the worst sitting's door-serve
  count (maxDoorServes). Anchors: r189 = 86 flags of 143 (60%),
  max serves 7 in one sitting. FIX BAR: if any sitting shows >= 5
  door serves AND the "I've told you three times now" reframe
  serves 2+ times in that sitting, the job-B1 spend-out fix lands
  (escalation keyed on the block reason with raw-line fallback;
  proven by a new proof test driving the real turn dispatch on the
  cycling door block, RED first, + a confirmation re-run on the
  worst seed showing max door serves <= 4 and no "three times"
  repeat — never by re-scoring the panel). If the bar is not met,
  document and move on — no fix.

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
  or bond-proposal counts moving markedly vs r189 (488 convs,
  143 proposals) — expected substrate movement from the r192/r193
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
- M11 >= 10 again (recap-empty pool fix lands — job B1).
- M12 fix bar met (door serves >= 5 in a sitting with the "three
  times" reframe 2+ times — the r35 spend-out fix lands, job B1).
- DRY CENSUS movement: deflect_q / dlg:doubt / refusal dry hits on
  the first panel with r192 F1–F5 + r193 closer native (r193's leg-7
  wild check passed 0/0; leg 5 is the second wild check).

## Telemetry
- Metrics: same l3.* keys as r189 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed panel.
