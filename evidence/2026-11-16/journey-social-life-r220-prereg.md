# Journey social life r220 — PRE-REGISTRATION (Lane B, 2026-11-16)

Leg 5 (social life). Rotation-b read 5 at run start; this run plays 5
and writes 6 (crisis next) at closeout. Run number r220 follows r219
(Lane B endgame adoption, landed 2026-11-16; Lane A scale also r219 —
run-number collision #6, same convention as the r213 note: files differ
by leg prefix). No journey-social-r220 evidence exists. Base: master
d39ce6e8c (sim-scale-onramp-round-0315). Seeds 44901–44904 (fresh band,
checked below), DAYCAP 140, policy journey (socialite base + real
conversations). Driver scripts/journey-social-life-r220-20261116.js,
analyzer scripts/analyze-journey-social-r220-20261116.js, helpers
scripts/journey-social-r220-helpers.js — all r215 verbatim except
seeds/OUTDIR/filenames/mode label (r215 helpers already carry the
M12-native tallyThreeTimes + M2 rate watch).

## Standing state at run start (read before judging anything)

- Lock playtest-loop-2.lock did NOT exist at run start. Own lock written
  2026-11-16T04:55:52Z, run_id loop2-20261116T045552Z.
- `git pull --ff-only` in main tree: "Already up to date" at 04:55Z;
  master HEAD d39ce6e8c. Main tree CLEAN at pre-flight, disk 39%.
- Worktree journey2-5: registration was INTERRUPTED by a runtime
  restart mid-`git worktree add` (register ran 04:57–~05:07Z, killed
  with no confirmed result). Recovery, verified step by step:
  worktree dir + branch existed at d39ce6e8c but NO registry entry,
  the index was purged (every file staged-deleted / untracked), and
  the checkout was incomplete (src/js/ absent, 39,404 files missing,
  32 partially written). A stale index.lock from the killed git diff
  was removed only after confirming its pid dead. Registry entry
  appended under the registry lock with the script's exact entry shape
  + atomic write (cap 16, active 11 → 12; run_id = lock run_id).
  Index rebuilt via `git ls-tree -r HEAD | git update-index --add
  --index-info`, then `git checkout HEAD -- .` restored the tree;
  `git status --short` 0 lines, spot hashes match HEAD (game.js
  440ef1b40). Heartbeat landed 05:21:28Z; hbloop every 10 min
  (pid 6089, log ~/workspace/worktrees/journey2-5-heartbeat.log).
  No work was done in the tree before the restore, so nothing was
  lost and no sibling work was touched.
- Lane B r219 endgame adoption LANDED 2026-11-16 ~04:30Z (master
  2a7d3c857, rotation-b 4→5); this run is the social leg that
  rotation step queued. The 01:30Z Loop B occurrence stood down on
  a live sim-aidgate-b worker (see daily log 2026-11-15).
- Host write flap: treated as ongoing per the alignment synthesis —
  gate adjudication must check for EPERM before attributing failures.
  The runtime restart this run hit is NOT a flap window (a restart,
  not a write refusal); the recovery above is documented, not blamed
  on the flap.

## Base movement since r215 (e6f239a8c → d39ce6e8c)

Conversation/social-relevant src/js changes (4 files, 124 lines):
- conversation.js — THREE fixes, first social panel with all native:
  1. CURIOUS-RESUME STUTTER (journey-scale r215, abc52dce1): a
     curious resume asks the question bare when the seed re-hangs
     THE SAME question (seedQid set); the "About X —" prefix stays
     for fresh questions. Watch: no "About your plan here — So
     what's your plan here?" stutter in transcripts (M4 + corpus
     grep for the stutter shape).
  2. GOON ASK-TAG (journey-scale r219, 25373172b [needs-eyes]): a
     substituted thread beat no longer carries the held ask's tag
     (linkraise/bondproposal) — the Felipe d130 blind-accept shape
     (link:accept offered for a proposal never heard). Watch: no
     sitting offers link:accept / bond:accept after a substituted
     beat without the proposal line spoken (M4 candidates + corpus
     grep on offered choices vs proposal lines).
  3. WANT-QUESTION RE-POSE (journey-landing r137, ce0f28a46): a
     deflected question-want resume re-poses THE SAME question
     (convoQuestionDef + convoAcceptWantQuestion, bare, stage 3→1)
     instead of dying at the generic acknowledgment. Watch:
     dropped-thread resurfaces now ENGAGE the question (not just
     name the favor) — read in the dropped-thread watch.
- convo-dialogue.js — COMMIT-REFUSAL noBeat (journey-succession
  r218, 50c86b0b9): refusal reasons (gate verdicts, unsupported
  favor reasons, refused-commit beats) pass noBeat, so they never
  become thread content a resume opener could quote as the favor's
  memory (F3). Watch: 0 resume openers quoting a refusal reason.
- hierarchy.js — FUNERAL-MEND PARTIAL VOICE (journey-crisis r216,
  edd53a489): a thin pantry buys back only part of the -8, so the
  public line states the true total gain, not the full -8 claim.
  Watch: funeral-mend lines in the corpus (r215: none observed);
  any partial mend must NOT claim the full -8.
- build.js — version bump only.
Instrument/policy-only arms (zero net src/js): sim-dawnbid-a (seed
call reverted after measurement), sim-ammocensus-a, sim-vetparty-a
(lever reverted, tree byte-identical to pre-lever), sim-aidgate-b
(lever reverted), sim-gatereach-b, sim-covenantsmoke-b, journey
endgame r219 (scripts + evidence only), journey-scale r219 (goon
ask-tag fix is the conversation.js change above), journey-deepening
r218 (wave-4 guard denominator — survival/M5 context only),
journey-succession r218 (F3 is the convo-dialogue.js change above).

## Seed-band freshness (local_seed_band_freshness)

Chosen band 44901–44904. Full-scope check in the worktree:
- `git grep -l -E "44901|44902|44903|44904" --
  'evidence/*/*prereg.md'`: NO hits.
- `git grep -l -E "44901|44902|44903|44904" -- 'evidence/'` hits
  only October census/feastvoice corpus JSONs where the digits occur
  inside longer numbers (fd values, census payloads) — none names
  44901–44904 as a seed band, so per the skill these are not
  reservations (same ruling as r215).
- Backup band 45101–45104: `git grep -l -E "45101|45102|45103|45104"
  -- 'evidence/*/*prereg.md'`: NO hits.
- COLLISIONS FOUND AND AVOIDED: 44801–44804 RESERVED (r215 prereg
  backup), 45001–45004 USED (journey-deepening r125/r129 preregs),
  44701–44704 USED (r215 seeds), 44601–44604 RESERVED (r206 prereg
  backup), 44501–44504 USED (r206 seeds), 44401–44404 RESERVED
  (r200 prereg backup), 44301–44304 USED (r200 seeds), 44201–44204
  RESERVED (r195 prereg backup), 44101–44104 USED (r195 seeds).
  Forbidden band 99201–99208 — a different band.
- Previous social bands: 41801–41804 (r141), 41901–41904 (r144),
  42001–42004 (r145), 42201–42204 (r149), 42301–42304 (r153),
  42601–42604 (r154), 42701–42704 (r159), 42801–42804 (r163),
  43301–43304 (r167), 43401–43404 (r172), 43501–43504 (r179),
  43601–43604 (r180), 43701–43704 (r181), 43801–43804 (r189),
  44101–44104 (r195), 44301–44304 (r200), 44501–44504 (r206),
  44701–44704 (r215).

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics
as r195/r200/r206/r215 (M1–M12). Seventeenth datapoint on Q1
(villager-initiated bonds) with the build live, FIRST panel with the
r215 stutter fix, the r219 goon ask-tag fix, the r137 want-question
re-pose, the r218 F3 noBeat, and the r216 funeral-mend partial voice
native in the base. M11/M12 confirmations are now routine — folded
into the continuity read without a separate job-B section (r215
metric review); the bars stay (M12-native: max "I've told you three
times now" serves per sitting <= 1, 0 sittings with 2+, >= 1 exit
line served panel-wide; M11: recap-empty flags < 10 panel-wide).

(B) NEW-BASE READS (watches, first panel with the fixes native):
  1. STUTTER: no curious-resume "About X — <same question>" shape
     in transcripts (M4 candidates + corpus grep).
  2. BLIND-ACCEPT: no link:accept / bond:accept offered after a
     substituted beat without the proposal spoken (M4 + corpus grep
     on offered choices vs proposal lines).
  3. RE-POSE: dropped-thread resurfaces ENGAGE the re-posed
     question (not just name the favor) — read in the dropped-thread
     tally + M4 candidates.
  4. F3: 0 resume openers quoting a refusal reason as thread memory.
  5. PARTIAL MEND: any funeral-mend line states the true gain; a
     partial mend never claims the full -8 (corpus grep; r215 saw
     no funeral lines at all).

(C) WATCH TALLIES (carried, read-only): re-offer (furniture-free max;
  r215's was 11), dropped threads (next-sitting resurface check +
  whether resurfaces name the LIVE favor per r208 + now engage the
  question per r137), NARR scan (verbatim repeats + panelMaxSameNarr),
  react shape, scattering capture, player-side greeting repetition.
  NEW/REPEATED watches:
  - VENDETTA DECISION POINT (r215 metric review, PRE-REGISTERED
    RETIREMENT): r206 maxUnordered was 7, r215 was 4 — two panels
    below the 8 bar. This panel is the "one more panel" the review
    allowed. If this panel ALSO stays <= 7, the 8 bar is RETIRED
    in this run's metric review as unhittable-in-practice and
    replaced with a watch on the maxUnordered trend (7, 4, …).
    If it reaches >= 8, the grievance-loop cooling-off becomes a
    design-look job for the NEXT run (reported, not re-scored here).
  - M1 HOT-ACCOMPLICE PATTERN (r206/r215 metric review): r206 hot
    (Adaeze 66/88), r215 cold again (all accomplices grievance 0).
    Re-read: if hot accomplices recur, the pattern description
    updates to "accomplices usually cold, sometimes carrying their
    own grievance" (narrative update, not a bar change).
  - HEED warn_you engagements (r131 fix): CONFIRMED r206 (5 lines)
    and r215 (4 lines). Watch for a third-panel recurrence.
  - M2 COMBINED-PROPOSAL BAR (carried): if any villager's
    person+link total reaches >= 20, the combined-cap question
    becomes a design-look job for the NEXT run (reported, not
    re-scored here). Prior max 16 (Nadia, r215); person-kind max 8
    (Rafael, r215 — exactly at the amendment-5 cap 8).
  - MOOTS (watch): r215 saw 7 moots (1/3/1/2). Investigate the
    trigger only if 0 moots fire across the 4 fresh villages.
  - FUNERALMEND (watch): r215 unobserved; r216 partial voice now
    native — see job B5.
(D) NOT THIS RUN: the r171 M2b scholar-open proof (leg 4
instrument); the measurement-proof refresh (sim-proofrefresh-b3,
another arm); the courtship-rework-b BFS pathfinding fix (the
pilgrimage stall narrowed to one seed's creek/rubble pocket,
100646 — the fix is a policy-side BFS in the courtship pilot,
owned by the courtship follow-up arm; the confirm band
100621–100636 stays fresh and unspent). Recorded here so the next
social run does not re-inherit them.
(E) STRETCH (only after the panel + gate are green): telemetry
baseline re-seed with a metric mapping for the current social
schema (r206/r215 deferred job — the social.json baseline carries
only stale-era l3.* keys the driver never emits). NOT a same-run
roll-forward of the stale keys; a re-seed needs the mapping
(current-schema paths → baseline keys) and its own verification.
If time does not permit, it stays deferred with the LOUD lines
re-explained, not rolled.

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run (r195/r200/r206/
r215 canon sections stand). No src/js change is planned; any fix
this run lands is a behavior change inside an existing system — no
new system, no canon change, no pool wording change unless a proof
test pins it first.

## Driver

scripts/journey-social-life-r220-20261116.js = r215 driver verbatim
EXCEPT: fresh seeds 44901–44904, OUTDIR evidence/2026-11-16,
filenames r220, mode label journey-social-life-r220. Analyzer:
scripts/analyze-journey-social-r220-20261116.js = r215 analyzer
verbatim except filenames/outdir. Helpers:
scripts/journey-social-r220-helpers.js = r215 helpers verbatim.
Proof tests: the 18 carried tests (r172 ×8, r179 faceguard, r180
narrsplit + favorreq-exit, r181 proposelabel + vendetta, r189
recapempty, r195 doorreq + favorreq-cycle + recapempty-pool, r206
threetimes + invite-small), all green in-tree before the panel; new
proof tests only if a fix lands.
Smoke first: SEED=44901 DAYS=5 into a scratch subdir, driver wrap
runs, no instrumentErrors.

## Leg questions

1. Q1 (continuity): do villagers initiate bonds in wild social play,
   seventeenth datapoint with the build live? (M2 count question.)
   Watch: proposals per village-day vs r195 0.328 / r200 0.177 /
   r206 0.268 / r215 0.235.
2. Q2 (continuity): arming motive — every plot grievance-linked;
   cold-accomplice pattern holds, or hot accomplices recur (M1)?
   Does any pair re-arm to 8+ (vendetta decision point / retirement)?
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
   re-confirmed clean in r180, r181, r189, r195, r200, r206, r215;
   re-confirm as watch)? Does the recap-empty line still cycle (M11
   — fix confirmation, fifth panel)? Does the door cluster still
   dominate (M12 — fix confirmation, fifth panel, revised bar,
   native counts)? Do the r130/r131 conversation fixes show in
   the wild (warn_you engagements — third panel; injured answers —
   RETIRED as unhittable in r215)? Do the r215-stutter, r219
   goon-tag, r137 re-pose, r218 F3, r216 partial-mend fixes show in
   the wild (job B)?
5. Q5 (guardrail, REPORT-ONLY): report median lived-days +
   past-d100 count judged against the survival-control median (126d);
   the "within-window only" guardrail reading triggers only if 0/4
   villages pass d75. Sequence for the record: 2/4 (r172), 2/4
   (r179), 1/4 (r180), 1/4 (r181), 1/4 (r189), 3/4 (r195), 2/4
   (r200), 2/4 (r206), 3/4 (r215).
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
   (r215: 3 settles)?
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

- M1 NO-GO (a plot armed with no grievance link) or a hot-accomplice
  arm (cold-accomplice pattern broken a second panel running).
- M2: a villager-initiated proposal ACCEPTED (bond formed by NPC action);
  any villager's person+link total >= 20 (combined-cap design look);
  the per-village-day rate moving markedly vs r195/r200/r206/r215
  (0.328/0.177/0.268/0.235).
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
- M11 >= 10 again (recap-empty pool fix did NOT hold — job A
  reopens).
- M12 confirmation bar missed (spend-out fix did NOT hold — job A
  reopens).
- HEED warn_you engagements in the wild (r131 fix showing, third
  panel).
- The r214 parting pool showing in the wild (plain partings on
  neutral/friendly sittings) or NOT showing (Marta-class bare
  endings persisting on the new base).
- The r208 lapsed-want naming showing in resurfaces (live favor
  named) or the stale favor still named (fix not holding).
- A vendetta pair reaching 8+ unordered arms (decision point fires)
  or staying <= 7 a third panel running (8 bar RETIRED per the
  pre-registered retirement above).
- Job-B findings: a stutter recurrence, a blind-accept offer, a
  resurface that names but never engages the question, a resume
  opener quoting a refusal reason, or a partial mend claiming the
  full -8 — each reopens its fix as this run's job (proven on its
  own proof test + a confirmation re-run on the worst seed, never
  by re-scoring the panel).

## Telemetry

- Metrics: same l3.* keys as r195/r200/r206/r215 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed panel;
  a re-seed with a metric mapping for the current social schema is a
  stretch job this run (job E) — not a same-run roll-forward.
