# Journey social life r189 — PRE-REGISTRATION (Lane B, 2026-11-12)

Leg 5 (social life). Rotation-b read 5 at run start; this run plays 5
and writes 6 (crisis next) at closeout. Run number r189 follows r188
(endgame, 2026-11-12). Base: master dc95859a8 (Version bump
f06c8e4e7-20261113-052450, batch ship — master moved from f06c8e4e7
during registration; the bump stamps build.js/index.html/version.json
only, no behavior change). Seeds 43801–43804 (fresh band, checked below),
DAY CAP 140, policy journey (socialite base + real conversations).
Driver scripts/journey-social-life-r189-20261112.js, analyzer
scripts/analyze-journey-social-r189-20261112.js, helpers
scripts/journey-social-r189-helpers.js — all r181 verbatim except
seeds, OUTDIR evidence/2026-11-12, filenames r189, PLUS the M11
recap-empty tally in the analyzer (job B1 below, analyzer-only;
proven by scripts/test-journey-social-r189-recapempty.js against
the r181 corpus anchor: 19 recap-empty flags).

## Rotation anomaly (read before adopting)

The file reads 5 NOW, so this run plays leg 5 per the file and writes
6 at closeout. History: r180 wrote 6; r181's prereg already diagnosed
the r182 endgame adoption clobbering 6→5; r185 (endgame) wrote 5
again; the r188 adoption closeout (1d532e903) wrote 5. Leg 5 was
last played r181 (2026-11-12, full panel) — this is the eleventh
datapoint on Q1 and the first panel with the r187/r186 pool-picker
fixes + the r133 gesture accept/decline native in the base (see base
movement).

## Standing state at run start (read before judging anything)

- **EPERM write flap active intermittently this morning.**
  Pre-flight reap failed twice on the flap (REGISTRY.json atomic
  write EPERM, 04:59Z and 05:01Z); removed nothing, no trees
  harmed. First `worktree-register.sh` attempt failed on a git ref
  write (05:01Z). Retry loop v1: attempt 2 (05:05:54Z, flap-clear
  window) failed mid-checkout — thousands of "unable to write file"
  errors, "fatal: Could not reset index file to revision 'HEAD'";
  git cleaned the partial tree but left orphan branch
  journey2-social == master f06c8e4e7 (verified byte-identical,
  zero unique commits, deleted). Retry loop v2 is probe-gated
  (direct atomic-write probe + orphan-branch cleanup before each
  attempt, tail-only logging). Attempt 1 (05:12:08Z) failed behind
  a sibling registration's registry-lock hold; attempt 2
  (05:24:58Z) succeeded via the register script's internal fallback
  add (first add failed at the index reset, second add attached to
  the existing branch and completed) — registered 05:48:38Z on
  the moved master dc95859a8, heartbeat landed 05:51:09Z, hbloop
  journey2-social-hbloop-r189.sh running every 10 min. Long jobs
  run nohup-detached with log polling; no git writes attempted
  until a probe succeeds (r181 precedent).
- **Stale-lock recovery:** lock playtest-loop-2.lock read
  journey2-5-20261113T035601Z (created 03:56:01Z, the 22:00 CST
  scheduled run) — NO registry match, no journey2-social tree,
  no journey2-social branch. Previous run dead; lock deleted,
  own lock written 2026-11-13T04:59:10Z, run_id
  journey2-5-20261113T045910Z.
- `git pull --ff-only` in main tree: "Already up to date" — no
  divergence this run.
- Main tree CLEAN at pre-flight, disk 35%. Reaper could not
  complete (flap, above); active ~13/16 per registry at run
  start; LOUD dirty trees are other owners' — not touched.
  journey2-endgame tree still holds uncommitted r188-adoption
  work (havenGrowth.js fix + evidence) per the main session —
  NOT this run's tree, do not touch.
- sim-proofrefresh-b10 (another arm) heartbeat 03:47Z — the
  measurement-proof refresh is still owed by that arm; this run
  reports the gate result only (job B4).

## Base movement since r181's panel base (d98aae0f0 → dc95859a8)

~60 commits, 13 touch src/js. Conversation/social-relevant changes:
- 70f6035ea succession r187: drawTruthLineUnblocked pool-picker
  fixes confront dry-replacement [needs-eyes] — confront lines.
  May reduce M7 near-dup flags; reported, not re-scored.
- b2a795948 crisis r186: warn-details pool-picker fix [needs-eyes]
  — warning-detail lines. Same expectation as above.
- 88a3a8db7 establishment r134: guard-beat pool 2→6 observational
  lines [needs-eyes] — pool breadth. May reduce M7 flags.
- 3cf9a4644 scale r133: gesture accept/decline for mimed
  invitations — conversation (nonverbal). May shift M3
  lure/party counts slightly; reported, not re-scored.
- a5b75cab8 sim-eldergrammar-a: veteran say line 'A Elder' ->
  'An Elder' (one-word grammar fix; proof 7/7) — dialogue line.
- 19ff055d8 sim-voiceless-a: voice the wave-5 armed shortfall at
  the morning briefing [needs-eyes] — briefing voice, not
  conversation; may add briefing lines to transcripts.
- 1d532e903 endgame r188: raid-defense fallen wording fix —
  endgame wording, not conversation.
- ce653cdab sim-synergydisc-b: dawn resonance for double-passive
  synergy discovery — not conversation. 6f7ab7b2b preserver unit
  cap N=2/day — not conversation.
- Two ship version bumps only (9b3373853, 247ee1c9a) plus the final
  bump dc95859a8 (build.js/index.html/version.json stamp only —
  behavior-neutral for this panel, but a src manifest input, so
  the measurement-proof staleness note in job B5 still applies).
- No dawn-scorer movement since r181 (reconciled scorer already in
  the r181 base). No src/js change from this run yet.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 43801–43804. Full-scope check on main tree:
- `git grep -l -E "43801|43802|43803|43804" --
  'evidence/*/*prereg.md'` (all dated preregs): NO hits.
- `git grep -l -E "43801|43802|43803|43804" -- 'evidence/'`:
  10 JSON hits only — sim-succession-armed/base.json,
  crumbguard-pilot census JSONs, leadfeast JSONs — where the
  numbers appear as metric values (kcal counts), NOT as seed
  assignments. Same class as r181's pre-check finding
  (pantryKcal 43704, preservedKcal 43702): not a use.
- Forbidden band is 99201–99208 — a different band.
- Backup band 43901–43904 also clean (no prereg hits).
Per the skill (naming reserves), the band is fresh: no prereg
names it as seeds. Previous social bands: 41801–41804 (r141),
41901–41904 (r144), 42001–42004 (r145), 42201–42204 (r149),
42301–42304 (r153), 42601–42604 (r154), 42701–42704 (r159),
42801–42804 (r163), 43301–43304 (r167), 43401–43404 (r172),
43501–43504 (r179), 43601–43604 (r180), 43701–43704 (r181).

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics
as r181 (M1–M10 below) PLUS M10b (face-guard re-confirmation),
M11 (recap-empty tally, new), and the M2 combined bar
(pre-registered below). Eleventh datapoint on Q1
(villager-initiated bonds) with the build live, FIRST panel with
the r187/r186 pool-picker fixes + r133 gesture accept/decline
native in the base.

(B) FILL A BLANK — chosen from r181's open items, in this priority
order (fix only what the fresh panel shows reproduces; document
the rest):
  1. M11 RECAP-EMPTY POOL (r181 metric review, watch item — the
     densest single-line cluster in the r181 near-dup flags).
     The recap line "We were just talking. Nothing important."
     (convoRecapLine, empty thread log) is a ONE-line pool:
     pressing recap twice in one sitting re-serves the same core
     with a reframe prefix ("As I said — ..."), and the M4 scan
     flags it (19 of r181's 126 flags, 15%, all this one line).
     Instrument first: analyzer tallies recap-empty flags
     (either core, after prefix-strip, starts with "we were just
     talking. nothing important"), proven against the r181
     corpus anchor (19). BAR: if the fresh panel shows >= 10
     recap-empty flags, the pool fix becomes the job — widen the
     empty-log recap to 4 honest variants via convoPickCycle
     ('recapempty' key; cycle serves distinct lines, M9's
     3-press cap bounds a sitting, so all serves in one sitting
     stay distinct), proven by a proof test (RED first: two
     recap presses, empty thread log, different core lines) +
     a confirmation re-run on the worst seed (0 recap-empty
     flags). If the panel shows < 10, document and move on —
     no fix.
  2. M2 COMBINED-PROPOSAL BAR (r181 metric review, owed
     pre-registration): Hussein proposed 16 times total
     (person 2 + link 14) on r181; Vivian 13; r180's Sam 8.
     The amendment-5 cap is person-kind only. NEW BAR: if any
     villager's person+link total reaches >= 20 in this panel,
     the combined-cap question becomes a design-look job for
     the NEXT run (reported, not re-scored here). Bar 20 sits
     above the observed max (16), so it fires only on genuinely
     new excess.
  3. M5 THIRD-MISS QUESTION (r181 metric review, owed): r180
     and r181 both missed the >=2/4 past-d100 threshold (1/4
     each). If this panel also misses, the metric review MUST
     answer the r181 question with data — does the threshold
     still measure village longevity under current survival
     tuning, or has survival tuning moved under it? Evidence
     to weigh: panel survival days across r172/r179/r180/r181/
     r189 + the survival-collapse control
     (sim-survivalcontrol-b, 2026-11-11: 1/8 survive on current
     master vs 6/8 pre-reconcile; median 126d vs 150d). The
     review proposes the revision for the NEXT run; this panel
     is NOT re-scored.
  4. MOOTS (r163 open item 2 — watch): r181 saw 7 moots
     (2/1/1/3). Watch tally only; investigate the trigger only
     if 0 moots fire across the 4 fresh villages.
  5. MEASUREMENT-PROOF REFRESH (r179-owed, r181 B4): owned by
     sim-proofrefresh-b10 (running, another arm). This run
     reports the gate result only — if
     test-measurement-proof-update.js still fails on manifest
     staleness, the refresh is still owed by that arm, not this
     run.
(C) WATCH TALLIES (carried, analyzer additions already in r181
tooling, read-only): re-offer (furniture-free max is the headline
this run — see M4), dropped threads (next-sitting resurface
check), NARR scan (verbatim repeats + panelMaxSameNarr), react
shape, scattering capture (scattered / hungryDays / aliveEnd at
village end), player-side greeting repetition (r180 watch item —
the driver's own greeting lines repeat in long sittings; NPC side
varies each time. Not an NPC defect; if a future run shows the
NPC echoing the player's repetition, it becomes a job).
(D) NOT THIS RUN: the r171 M2b scholar-open proof test (r178
finding, still open) is an ENDGAME-leg instrument (reunion death
attribution, r171 prereg §M2b) — it belongs to leg 4, not leg 5.
Recorded here so the next social run does not re-inherit it.

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run (r181 canon
section stands). The M11 tally is analyzer tooling only — no
src/js change, no canon change. Any job-B1 fix is a behavior
change inside an existing system (a 1-line pool becomes 4 lines)
— no new system, no canon change. The recap-empty variants must
stay honest: nothing to recap means nothing to recap; no variant
may invent a topic, a shared event, or a promise.

## Driver

scripts/journey-social-life-r189-20261112.js = r181 driver verbatim
EXCEPT: fresh seeds 43801–43804, OUTDIR evidence/2026-11-12,
filenames r189. Analyzer:
scripts/analyze-journey-social-r189-20261112.js = r181 analyzer
verbatim except filenames/outdir + the M11 recap-empty tally
printout. Helpers: scripts/journey-social-r189-helpers.js = r181
helpers verbatim. Proof tests: the r172 carried tests (r172,
narr, coach, coachrepeat, agree, confess, confessguard,
confesswrap) + r179 faceguard + r180 narrsplit + r181 vendetta +
r189 recapempty, re-run green in-tree before the panel; new proof
tests only if a job-B fix lands.
Smoke first: SEED=43801 DAYS=5 into a scratch subdir, driver wrap
runs, no instrumentErrors.

## Leg questions
1. Q1 (continuity): do villagers initiate bonds in wild social play,
   eleventh datapoint with the build live? (M2 count question.)
2. Q2 (continuity): arming motive — every plot grievance-linked;
   cold-accomplice pattern holds? r181 armed 11 plots, all early
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
   in r179 on a second clean panel, re-confirmed clean in r180 and
   r181; re-confirm as watch)? Does the recap-empty line still
   cycle (M11 — new tally)?
5. Q5 (guardrail): survival — how many villages past d100? Sequence
   now 2/4 (r172), 2/4 (r179), 1/4 (r180), 1/4 (r181). A third
   consecutive miss triggers the metric-review question (job B3),
   not a re-score.
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
13. Q12 (M11, NEW): does the recap-empty line still cycle within
    sittings — how many M4 flags carry the recap-empty core?

## Panel (binding)
- Policy journey (socialite base + real conversations), DAYCAP 140,
  PILOT seeds 43801–43804, sequential.
- Smoke first: SEED=43801 DAYS=5 into a scratch subdir, driver wrap
  runs, no instrumentErrors.
- The panel runs AFTER the job-B1 tooling fix (the M11 tally is
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
  investigation, not a re-score. (r181 armed 11 — the trigger
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
  COMBINED BAR (new): if any villager's person+link total reaches
  >= 20, the combined-cap question becomes a design-look job for
  the NEXT run (reported, not re-scored here). Prior max 16
  (Hussein, r181).
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
- M5 census guardrail: >=2/4 villages past d100, else all
  dark-channel verdicts are within-window only and must be
  reported that way. Seventeenth panel in the sequence — report the
  sequence, do not re-score it mid-run. A third consecutive miss
  triggers the job-B3 metric-review question (below), not a
  re-score.
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
  r179 on a second clean panel, re-confirmed clean in r180 and
  r181; this is a fifth re-confirmation.
- M11 recap-empty tally (NEW, watch + fix bar): report the count of
  M4 flags carrying the recap-empty core ("we were just talking.
  nothing important", prefix-stripped) per seed and panel-wide.
  Anchor: r181 = 19 flags of 126. If this panel shows >= 10,
  the job-B1 pool fix lands (proven + confirm re-run on the worst
  seed, never by re-scoring the panel). If < 10, document and move
  on — no fix.

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
  or bond-proposal counts moving markedly vs r181 (344 convs,
  115 proposals) — expected substrate movement from the r187/r186
  pool-picker fixes + r133 gesture accept/decline, reported with
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
- A villager proposing 8+ PERSON bonds (M2 cap re-reading owed).
- M11 >= 10 (recap-empty pool fix lands — job B1).

## Telemetry
- Metrics: same l3.* keys as r181 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed panel.
