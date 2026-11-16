# Journey social life r226 — PRE-REGISTRATION (Lane B, 2026-11-16)

## Adoption addendum (09:00 occurrence, run_id loop2-20261116T145748Z)

This run ADOPTS the r226 draft prereg written by the 08:00 occurrence
(run_id loop2-20261116T135600Z), which timed out at worktree registration
— no r226 evidence existed, no worktree, no branch. The draft's seeds,
metrics, jobs, and bars stand unchanged; this addendum records only what
moved between the draft and this run's start.

- STALE-LOCK RECOVERY: the 08:00 lock (loop2-20261116T135600Z, created
  2026-11-16T13:59:35Z) was still on disk at this run's start with NO
  registered tree and NO heartbeat for that run_id in REGISTRY.json —
  the previous run is DEAD no matter how fresh the lock looked. Lock
  deleted, own lock written 2026-11-16T14:57:48Z, run_id
  loop2-20261116T145748Z.
- REGISTRATION INTERRUPTED: the first registration attempt (~15:00Z)
  was killed by a runtime/VM restart mid-checkout (partial
  journey2-5 dir held only evidence/, no .git metadata, no registry
  entry). Partial dir removed; re-registered 15:12Z; heartbeat landed
  15:18:50Z. /tmp was wiped by the restart, so the draft prereg file
  (/tmp/r226-prereg-DRAFT.md) is GONE — this file is a faithful
  reconstruction of the draft as read at 14:57Z, plus this addendum.
- BASE MOVEMENT SINCE THE DRAFT: Lane A establishment r225 LANDED
  (ef8bd7177) between the draft and this registration. src/js changes:
  conversation.js + convo-dialogue.js (83c7dc3c7, [needs-eyes]):
  STAGE-0 WANT IS NOT LIVE — a want whose opener never ran (stage 0)
  is no longer resolved 'deflected' by a deflect_q pick or by the
  "I can't right now" resume handler; only a surfaced, undecided want
  (stage 1–2) is refused. First social panel with it native.
  NEW WATCH (B6): stage-3 'deflected' closes should no longer come
  from stage-0 wants; a want that stays stage 0 across sittings is now
  CORRECT (the need persists for a proper ask), not a dropped thread —
  the dropped-thread/resurface read must not count stage-0 persistence
  as a drop.
- BASE FOR THIS RUN: ef8bd7177 (not 5eedd695b as drafted).
- SEED-BAND FRESHNESS RE-VERIFIED on the new base: `git grep -l -E
  "45701|45702|45703|45704" -- 'evidence/*/*prereg.md'` — NO hits;
  the r225 prereg uses other seeds. Band 45701–45704 FRESH.
- REAPER: SKIP at pre-flight (registry lock held by Lane A's
  journey-establishment release); retry at closeout.
- FLAP: probes ALL-OK at run start (the O_EXCL E=FAIL lines are a
  stale probe file, "File exists", not a refusal). Flap treated as
  CLEAR.

Leg 5 (social life). Rotation-b read 5 at run start; this run plays 5
and writes 6 (crisis next) at closeout. Run number r226 follows r225
(Lane B endgame adoption, landed 2026-11-16; Lane A scale also r219 —
run-number collision convention stands: files differ by leg prefix).
No journey-social-r226 evidence exists. Base: master ef8bd7177
(post r225 endgame adoption + r224 succession + r223 crisis +
r221 establishment + Lane A establishment r225). Seeds 45701–45704
(fresh band, checked below), DAY CAP 140, policy journey (socialite
base + real conversations). Driver
scripts/journey-social-life-r226-20261116.js, analyzer
scripts/analyze-journey-social-r226-20261116.js, helpers
scripts/journey-social-r226-helpers.js — all r220 verbatim except
seeds/OUTDIR/filenames/mode label, PLUS the two r220-metric-review
analyzer revisions and the B5 funeral instrument below (both
driver-side, read-only; determinism proof required before judging).

## Standing state at run start (read before judging anything)

- Lock playtest-loop-2.lock did NOT exist at run start. Own lock written
  2026-11-16T13:59:35Z, run_id loop2-20261116T135600Z.
- `git pull --ff-only` in main tree: "Already up to date" at 13:55Z;
  master HEAD 5eedd695b. Main tree CLEAN at pre-flight, disk 44%.
- Host write flap: the 05:45 CST window (longest on record, ~82 min)
  closed ~13:07Z; VM replaced ~13:19Z (boot 7f7ddc90); probes ALL-OK
  since. This run's own probes at 13:55Z: atomic write OK (workspace
  + /tmp), git update-ref OK. Flap treated as CLEAR, not ongoing.
- worktree-reap.sh: SKIP, registry lock held by another reaper run
  (consecutive skips: 6), ALERT fired. Known lock self-contention
  (reaper holds lock 9–14 min vs 10-min cron cadence); fix still owed,
  needs Steve nod. Nothing removed by this run's reap attempt.
- Worktree registration QUEUED on the same lock: sim-haventick-b
  register (13:46Z) holds the lock mid `git worktree add` (slow
  checkout, 14+ min, alive), sim-trickteach-b register (13:59Z) waits
  on flock, this run's register (14:00Z) waits behind it. Each
  register also runs its own inner reaper first, so the queue drains
  in ~10–15 min steps. Registration is pending at prereg time; the
  run proceeds only after the worktree exists + heartbeat lands.
- Lane A r221 establishment LANDED (3322fb0df + bd4434428) and Lane B
  r225 endgame LANDED (5eedd695b) since r220; both are in this base.
  Lane A journey-establishment is ACTIVE with a fresh heartbeat
  (13:24Z) — different slug/rotation/lock, no coordination needed
  beyond shared-repo discipline; if it lands first, rebase before
  merging (body step 8).
- r220's run note records rotation-b 5 → 6 at its adoption and r225's
  records 4 → 5 at its adoption; the file as read at THIS run's start
  (13:55Z) is 5, so this run plays 5 and writes 6. The file's current
  value is what binds this run; the earlier writes are on record in
  their own run notes.

## Base movement since r220 (d39ce6e8c → 5eedd695b)

Conversation/social-relevant src/js changes (4 files, 91 lines):
- conversation.js — TWO fixes, first social panel with both native:
  1. SETTLED-FAVOR VARIANTS (journey-endgame r225, F5, 3ba7f0516):
     the settled-favor "it's handled" singleton now cycles 3 honest
     variants (convoPickCycle 'settledfavor:handled'). Watch: the
     handled line varies in the wild (B1 below); the wild check in
     r225 was vacuous (branch never fired in the endgame panel).
  2. DRIFT-NOTE QUOTE GUARD (journey-crisis r223, F1, ae9b4b6f7):
     `convoSnippetIsStageDirection` now matches the five
     `convoDriftNote` template tails verbatim, so a resume opener
     can no longer quote a stage direction ("Tamika has an edge
     today — something curdled.") as the favor's memory. Watch: 0
     resume openers quoting a drift note (B3 below).
- convo-dialogue.js — DRY-LINE GUARD (journey-succession r224, F4c,
  2e3142e74): a want's line already spoken recently (run ledger)
  falls to the nowant pool instead of going dry ("...Sorry, lost my
  train of thought."). Watch: 0 dlg:help dry hits (B2 below).
- convo-wants.js — LEDGER-AWARE QUESTION PICK (r224, F4a) + TAKEN
  REPEAT-ACK VARIANTS (r224, F4c): `convoPickUnaskedQuestion` skips
  ledger-blocked questions; the seek_taken repeat-ack is now 3
  variants cycled via convoPickCycle ('taken:repeatack'). Watch: 0
  curious-singleton dry hits; repeat-ack lines vary (B2 below).
- villager-agency.js — PROFILEGATE (sim-profilegate-a, re-landed
  verbatim 1b28ad555 after the pilot NO-GO revert): a bid-and-selected
  party_launch plan bypasses the non-ranger profile gate in
  agencyTick. Launch-side only; affects who is around to talk to,
  not conversation text. Read as context, not a job.
- build.js — version bump only.
Instrument/policy-only arms (zero net src/js): sim-awayhaven-b,
sim-seedpaths-b, sim-profilegate-a (seed call reverted; gate fix
re-landed as above), sim-gatelever-b (lever reverted), sim-killfail-a,
sim-seedattach-a, sim-scale-onramp rounds, journey endgame r225
(scripts + evidence only), journey-deepening r222, journey-crisis
r223 (F1 is the conversation.js change above).

## Seed-band freshness (local_seed_band_freshness)

Chosen band 45701–45704. Backup band 45901–45904.
- `git grep -l -E "45701|45702|45703|45704" -- 'evidence/*/*prereg.md'`:
  NO hits. Same for 45901–45904: NO hits.
- `git grep -l -E "45301|45302|45303|45304" -- 'evidence/*/*prereg.md'`:
  HIT (evidence/2026-11-11/sim-proofrefresh-b5-prereg.md) — 45301–
  45304 REJECTED as used (named band = used, even without a judged
  corpus). Backup 45501–45504 also HIT (sim-grindfinish-b +
  sim-tbretreat-b preregs, 2026-11-05) — REJECTED.
- Full-evidence standalone-token grep
  `(^|[^0-9])(45701|45702|45703|45704|45901|45902|45903|45904)([^0-9]|$)`
  COMPLETED (26 min): 89 files, ALL corpus JSONs/TXTs (Oct 15–Nov 14:
  belongfeast/crumbdefault sweeps, gossipcensus s17016/s17021,
  journey-scale hungerwatch/trust, perseed corpora) where the digits
  occur as measurement values inside longer records — NONE is a
  prereg and NONE names 45701–45704 or 45901–45904 as a seed band,
  so per the skill and the r220 ruling these are not reservations.
  Prereg-only standalone grep: NO hits. Band FRESH.
- COLLISIONS FOUND AND AVOIDED: 45301–45304 USED (proofrefresh-b5
  prereg), 45501–45504 USED (grindfinish-b + tbretreat-b preregs),
  45101–45104 RESERVED (r220 prereg backup, unused), 44901–44904 USED
  (r220 seeds), 45001–45004 USED (journey-deepening r125/r129
  preregs), 44801–44804 RESERVED (r215 prereg backup), 44701–44704
  USED (r215 seeds), 44601–44604 RESERVED (r206 prereg backup),
  44501–44504 USED (r206 seeds), 44401–44404 RESERVED (r200 prereg
  backup), 44301–44304 USED (r200 seeds), 44201–44204 RESERVED (r195
  prereg backup), 44101–44104 USED (r195 seeds). Forbidden band
  99201–99208 — a different band.
- Previous social bands: 41801–41804 (r141), 41901–41904 (r144),
  42001–42004 (r145), 42201–42204 (r149), 42301–42304 (r153),
  42601–42604 (r154), 42701–42704 (r159), 42801–42804 (r163),
  43301–43304 (r167), 43401–43404 (r172), 43501–43504 (r179),
  43601–43604 (r180), 43701–43704 (r181), 43801–43804 (r189),
  44101–44104 (r195), 44301–44304 (r200), 44501–44504 (r206),
  44701–44704 (r215), 44901–44904 (r220).

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics
as r195/r200/r206/r215/r220 (M1–M12). Eighteenth datapoint on Q1
(villager-initiated bonds) with the build live, FIRST panel with the
r225 F5 settled-favor variants, the r223 F1 drift-note guard, and the
r224 F4a/F4c dry-line fixes native in the base. M11/M12
confirmations are now routine — folded into the continuity read
without a separate job-B section (r215 metric review); the bars
stay (M12-native: max "I've told you three times now" serves per
sitting <= 1, 0 sittings with 2+, >= 1 exit line served; M11:
recap-empty flags < 10 panel-wide).

(B) NEW-BASE READS (watches, first panel with the fixes native):
  1. SETTLED-FAVOR VARIANTS (F5): the "it's handled" line varies in
     the wild — count distinct variants of the settled-favor handled
     line across the panel's transcripts; a single sitting must not
     re-serve the same variant (cycle). Corpus grep on the r226
     transcripts + M4 candidates. (r225's wild check was vacuous.)
  2. DRY LINES (F4a/F4c): 0 curious-singleton dry hits and 0
     dlg:help dry hits in the panel (transcript grep for "lost my
     train of thought" — the tallyDroppedThreads count should be 0,
     or every drop must be adjudicated as a non-dry shape); the
     taken:repeatack line shows >1 variant where it re-fires.
  3. DRIFT-NOTE QUOTE (F1): 0 resume openers quoting a drift-note
     stage direction ("has an edge today", "hollowed-out",
     "glancing wariness", "lighter warmth", "weathered hardness"
     tails). Corpus grep on openers.
  4. F3 (commit-refusal as memory): r220 left this UNPROVEN IN THE
     WILD (0 spoken lines containing "refus", no resurface of a
     refused bond). Same check again: count person-proposal
     refusals, grep the corpus for "refus", read any resurface of a
     refused bond. Watch, not a fail — the mechanism is covered by
     carried proof tests.
  5. PARTIAL MEND (funeral-mend voice): FIRST panel that can judge
     it — the B5 instrument below serializes funeral lines +
     funeralMendStats into the evidence JSON. Read: any funeral-mend
     line states the true gain; a partial mend never claims the full
     -8. (r220: instrument gap; r223 crisis: GO with 30 lines via
     its own MOURN_RE capture — the pattern copied here.)
  6. STAGE-0 IS NOT LIVE (Lane A r225, 83c7dc3c7 — added at adoption):
     first social panel with the fix native. Watch: no stage-3
     'deflected' close comes from a stage-0 want (the defect was
     19/19 favorless sits in the r225 panel, 3 of 4 stage-3 closes
     through the resume handler); a want that stays stage 0 across
     sittings is now CORRECT persistence, not a dropped thread.
(C) WATCH TALLIES (carried, read-only): re-offer (furniture-free max;
  r220's was 11), dropped threads (next-sitting resurface check +
  whether resurfaces name the LIVE favor per r208 AND engage the
  re-posed question per r137), NARR scan (verbatim repeats +
  panelMaxSameNarr), react shape, scattering capture, player-side
  greeting repetition. NEW/REPEATED watches:
  - VENDETTA TREND ONLY (bar RETIRED in r220 metric review after the
    third panel ≤7; trend 7, 4, 2). This panel reports maxUnordered
    as the fourth trend point. No bar, no retirement decision left.
  - M1 HOT-ACCOMPLICE PATTERN (r206/r215/r220 metric review): r206
    hot (Adaeze 66/88), r215 cold, r220 cold again (all accomplices
    grievance 0). Re-read: if hot accomplices recur, the pattern
    description updates to "accomplices usually cold, sometimes
    carrying their own grievance" (narrative update, not a bar
    change).
  - HEED warn_you engagements (r131 fix): CONFIRMED r206 (5 lines),
    r215 (4 lines), r220 (1 line). Watch for a fourth-panel
    recurrence.
  - M2 COMBINED-PROPOSAL BAR (carried): if any villager's
    person+link total reaches >= 20, the combined-cap question
    becomes a design-look job for the NEXT run (reported, not
    re-scored here). Prior max 16 (Nadia, r215); r220 max 10 (Lena);
    person-kind max 8 (Rafael, r215 — exactly at the amendment-5
    cap 8); r220 person-kind max 6.
  - MOOTS (watch): r220 saw 5 moots (1/2/0/2). Investigate the
    trigger only if 0 moots fire across the 4 fresh villages.
  - FUNERALMEND (watch): r220 unobserved in the social harness;
    now readable via the B5 instrument — see job B5.
(D) NOT THIS RUN: the r171 M2b scholar-open proof (leg 4
instrument); the measurement-proof refresh (sim-proofrefresh-b5,
another arm); the courtship-rework-b BFS pathfinding fix (the
pilgrimage stall narrowed to one seed's creek/rubble pocket,
100646 — the fix is a policy-side BFS in the courtship pilot,
owned by the courtship follow-up arm; the confirm band
100621–100636 stays fresh and unspent). Recorded here so the next
social run does not re-inherit them.
(E) STRETCH (only after the panel + gate are green): telemetry
baseline re-seed with a metric mapping for the current social
schema (r206/r215/r220 deferred job — the social.json baseline
carries only stale-era l3.* keys the driver never emits). NOT a
same-run roll-forward of the stale keys; a re-seed needs the
mapping (current-schema paths → baseline keys) and its own
verification. If time does not permit, it stays deferred with the
LOUD lines re-explained, not rolled.

## R226 changes vs r220 (all driver/analyzer-side, no src/js)

1. ANALYZER, M1 either-direction panel line (r220 metric review):
   the panel line now counts plots grievance-linked in EITHER
   direction (grievanceTargetToLeader > 0 OR the leader holds a
   prior grievance against the target — the holderLeads set), and
   the arms line adds the REASONS count (arms whose motiveAtArming
   reasons include "grievance"). The reasons bar stays the binding
   judge; the panel line is informational. Proof: the analyzer must
   reproduce r220's numbers on the r220 corpus (8/8 reasons,
   6/8 arms gT→L, 2 holder-leads) before the r226 panel is judged.
2. ANALYZER, M12 flag rate as share of conversations (r220 metric
   review): the M11/M12 panel lines now report the flag count over
   the panel's conversation count as well as over near-dup flags,
   so the rate stays comparable across panel sizes. Legacy
   of-flags denominator kept alongside for continuity.
3. DRIVER + ANALYZER, B5 FUNERAL INSTRUMENT (fills the r220 blank):
   the driver serializes `funeralLines` (captured emit-stream lines
   matching /funeral/i, with day) + `funeralMendStats`
   (state.village.funeralMendStats at village end, read-only) into
   the evidence JSON. `say() = emit(text,'narration')` (game.js:65),
   so the funeral-mend `this.say()` voice already flows through the
   driver's wrapped emit — this adds NO Game call, NO RNG, NO new
   wrap; it serializes a filtered subset of the already-captured
   stream (same pattern as r223 crisis MOURN_RE). The analyzer
   prints a B5 section: funeral line count, per-line gain claims,
   stats counters. Determinism proof (below) covers it.
4. Filenames/mode/seeds/OUTDIR only, otherwise verbatim.

## Determinism proof (BEFORE judging the panel)

- Smoke first: SEED=45701 DAYS=5 into a scratch subdir, driver wrap
  runs, no instrumentErrors.
- Re-run seed 45701 with the r226 driver and require the panel JSON
  identical to its first run EXCEPT the `ms` wall-clock field
  (normalized out before compare — the driver records wall time in
  seconds; all Game state must be byte-identical). If any other field
  differs, the driver change is NOT trajectory-neutral: stop,
  diagnose, do not judge the panel. (r136 precedent, ms-normalized
  this run because the r136 proof predates the ms field's rounding.)
- Analyzer-proof: run the r226 analyzer over the r220 corpus (copy
  the 4 r220 JSONs to a scratch dir, point the analyzer at them) and
  require: M1 reasons 8/8, arms gT→L 6/8, holder-leads 2, M12-native
  62/1/0/93, M11 0/167 — the r220 published numbers. If the revised
  analyzer disagrees, the revision is wrong, not the corpus.

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run (r195/r200/r206/
r215/r220 canon sections stand). No src/js change is planned; any fix
this run lands is a behavior change inside an existing system — no
new system, no canon change, no pool wording change unless a proof
test pins it first.

## Driver

scripts/journey-social-life-r226-20261116.js = r220 driver verbatim
EXCEPT: fresh seeds 45701–45704, OUTDIR evidence/2026-11-16,
filenames r226, mode label journey-social-life-r226, PLUS the B5
funeral serialization (change 3 above). Analyzer:
scripts/analyze-journey-social-r226-20261116.js = r220 analyzer
verbatim except filenames/outdir + changes 1–2 above + B5 section.
Helpers: scripts/journey-social-r226-helpers.js = r220 helpers
verbatim. Proof tests: the 19 carried tests (r172 ×8, r179
faceguard, r180 narrsplit + favorreq-exit, r181 proposelabel +
vendetta, r189 recapempty, r195 doorreq + favorreq-cycle +
recapempty-pool, r206 threetimes + invite-small), all green in-tree
before the panel; new proof tests only if a fix lands.
Smoke first: SEED=45701 DAYS=5 into a scratch subdir, driver wrap
runs, no instrumentErrors.

## Leg questions

1. Q1 (continuity): do villagers initiate bonds in wild social play,
   eighteenth datapoint with the build live? (M2 count question.)
   Watch: proposals per village-day vs r195 0.328 / r200 0.177 /
   r206 0.268 / r215 0.235 / r220 0.294.
2. Q2 (continuity): arming motive — every plot grievance-linked
   (reasons bar, either-direction panel line); cold-accomplice
   pattern holds, or hot accomplices recur (M1)? Vendetta trend
   point 4 (bar retired — watch only)?
3. Q3 (continuity): invite refusal — party/lure accept/decline, split
   by inviter (succession-proof, inviterWasBearer).
4. Q4 (sense): do full transcripts still read as real people? (M4
   judged from the analyzer's M4 section, in-run.) Does the
   goal-thread react shape hold on the new base (agree/joke 0,
   dlg:react present)? Does the 3-label 'more' pool suffice (longest
   continuer run <5)? Does the r214 parting pool show in endings
   (plain partings on neutral/friendly sittings)? Do NARR coach lines
   vary (M10, coach only)? Do doubt-probe re-offers / dropped
   threads persist (job C — and do resurfaces name the live favor
   per r208 AND engage the re-posed question per r137)? Does a double
   confession reproduce on the guarded base (B2 — closed in r179,
   re-confirmed clean in r180, r181, r189, r195, r200, r206, r215,
   r220; re-confirm as watch)? Does the recap-empty line still cycle
   (M11 — fix confirmation, sixth panel)? Does the door cluster still
   dominate (M12 — fix confirmation, sixth panel, revised bar,
   native counts)? Do the r130/r131 conversation fixes show in
   the wild (warn_you engagements — fourth panel; injured answers —
   RETIRED as unhittable in r215)? Do the F5 settled-favor variants,
   F4a/F4c dry-line fixes, and F1 drift-note guard show in the wild
   (job B)?
5. Q5 (guardrail, REPORT-ONLY): report median lived-days +
   past-d100 count judged against the survival-control median (126d);
   the "within-window only" guardrail reading triggers only if 0/4
   villages pass d75. Sequence for the record: 2/4 (r172), 2/4
   (r179), 1/4 (r180), 1/4 (r181), 1/4 (r189), 3/4 (r195), 2/4
   (r200), 2/4 (r206), 3/4 (r215), 1/4 (r220).
6. Q6 (gossip-position, re-aligned): 0 naming-beat lines emitted
   while the scholar is beyond radius-1 of Haven (gate definition),
   debates still kicking and settling. Strict on-tile counts reported
   alongside as the metric-review discrepancy, not a failure.
7. Q7 (dedupe): does the wild panel show any VERBATIM same-beat
   repeat or fallback repeat in a fixed pool (fix not holding), or
   only pool-cycle flags? M7 wording stands (r163): "fixed pool"
   means the verbatim/fallback repeats the dedupe mechanism was
   built to stop; pool-cycle exhaustion flags are counted separately
   and do NOT fail M7. The r206 invite-small fix is now in the base
   — watch for any new double-serve of a scene line in one sitting
   (the M7 scan's blind spot, r206 metric review).
8. Q8 (counter-settle, ALIGNED definition r172): driver still
   settles counters; report fresh vs blocked split + links formed.
   Watch: does the r201 favor-want settle gate move the counts
   (r220: 2 settles)?
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

- M1 NO-GO (a plot armed with no grievance link by the reasons bar)
  or a hot-accomplice arm (cold-accomplice pattern broken a second
  panel running — r206 hot, r215/r220 cold).
- M2: a villager-initiated proposal ACCEPTED (bond formed by NPC action);
  any villager's person+link total >= 20 (combined-cap design look);
  the per-village-day rate moving markedly vs r195/r200/r206/r215/r220
  (0.328/0.177/0.268/0.235/0.294).
- M3: invitations always taken or always refused (the ruling is
  "sometimes taken").
- M4 NO-GO (a senseless transcript, with quote) or the react shape
  changing on the new base (agree/joke offered on goal threads).
- M5: a fourth d100+ village, or 0/4 past d75 (guardrail floor).
- M6 gate-away NO-GO (r141 fix fails under its own definition) or a
  stranded scholar who never hears a settled name on return (relay gap).
- M7: a VERBATIM same-beat flag in a fixed pool (fix not holding), or
  a new double-served scene line in one sitting (r206 class).
- M8 PARTIAL on the ALIGNED definition (a real blocked re-raise loop).
- M9 FAILS again (fix shape wrong — the defect lives elsewhere).
- A 'more'-press run >= 5 reproducing on the new base (reopens pool
  widening, r153 job E).
- A dropped secret that resurfaces next sitting (open-thread ledger
  working) or a dropped PROMISE (canon violation — defect).
- Moots firing 0 times across 4 villages (r163 open item 2 — the
  trigger rarity hardens from watch to defect candidate).
- M11 >= 10 again (recap-empty pool fix did NOT hold — job B
  reopens).
- M12 confirmation bar missed (spend-out fix did NOT hold — job A
  reopens).
- HEED warn_you engagements in the wild (r131 fix showing, fourth
  panel).
- The r214 parting pool showing in the wild (plain partings on
  neutral/friendly sittings) or NOT showing (Marta-class bare
  endings persisting on the new base).
- The r208 lapsed-want naming showing in resurfaces (live favor
  named) or the stale favor still named (fix not holding).
- A vendetta pair reaching 8+ unordered arms (bar retired — reported
  as a trend break, not a decision point) or staying ≤7 a fourth
  panel running (trend 7, 4, 2, …).
- Job-B findings: a settled-favor line that does NOT vary (F5 not
  showing), a dry line on a fixed surface (F4a/F4c not holding), a
  resume opener quoting a drift note (F1 not holding), a resurface
  that names but never engages the question, a resume opener quoting
  a refusal reason, or a partial mend claiming the full -8 — each
  reopens its fix as this run's job (proven on its own proof test +
  a confirmation re-run on the worst seed, never by re-scoring the
  panel).

## Telemetry

- Metrics: same l3.* keys as r195/r200/r206/r215/r220 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed panel;
  a re-seed with a metric mapping for the current social schema is a
  stretch job this run (job E) — not a same-run roll-forward.

## Metric review (carried from r220 — applied this run)

- Vendetta bar RETIRED (r220): trend watch only.
- M1 panel line counts both directions + reasons count (change 1).
- M12 flag rate as share of conversations (change 2).
- M2 rate watch anchors updated: r220 0.294.
- M5 sequence updated: ..., 3/4 (r215), 1/4 (r220).
