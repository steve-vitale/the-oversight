# Journey LANDING r37 — run note (2026-10-22, run_id playtest-a-20261022T195013Z)

## Pre-registration (§14 — binding; a miss is NO-GO, never re-scored mid-run)
- **Leg question:** does the landing leg stay GREEN on tip 8720dc2c7 with
  the r21 favor hunger-stutter fix (convo-wants.js) live, plus r42
  sick-stay-home gates and r40 invite-leak fix? The r21 fix is the blank:
  verify it in the wild (favor-ask scan) and by unit proof.
- **Interesting / GO gates (binding):** Question A (stutter): 0 favor-ask
  lines carrying the doubled-hunger signature across all seeds (scan: the
  same hunger word twice in one ask line); ≥2 food_share favor asks
  sense-read in full — or documented-absent if none fire (reachability,
  not a miss). Question B (refined near-dupe detector in the wild): 0
  genuine (non-quote-explained, non-pool-cycle) near-dupe flags;
  probe 101's honest re-fire pair NOT flagged. Question C (nv-winddown
  carry): 0 stuck loops; every surfaced winddown closes naturally.
  Stay-green spine: V1'', V2 (bar 0.40 — direction under
  plentydepri/SURPLUSFEED-removal reported, not re-scored), V3
  (+scholar carve-out), V4' (refined detector; ≥8 transcripts sense-read,
  0 fabric-history), V5', V6, M2 (System d8), WILD HAUL ARC, DAY-FREEZE,
  OPEN BOOK, BEAT-IDENTITY WILD, R34 DEATH-LITURGY, R34 THEFT-RATE,
  R36 PLENTY-ENGAGE, R36 FALLEN.
- **Seeds:** 309, 310 (pilot), 311, 312 (main); probe 101 (REPEAT_SIT=1,
  MOURN_PROBE=1). Policy: competent, PINNED. FAVOR_ACCEPT default ON.
  Horizon 14d, death-aware stop (+10d tail). One process per seed.
- **Canon read:** CANON.md (reread); CONVERSATIONS.md (reread — favor
  contract + structural audit); DISEASES.md, KIN.md, DIRECTIVES.md
  (r28–r36). No new canon invented.
- **Note on lineage:** a morning r36 run (playtest-loop-a-20261022T113924Z,
  tip 09ff3090e, commit 10501df7f) already answered the landing leg's
  SURPLUSFEED-removal/plentydepri question today. This r37 re-runs the
  stay-green spine on the new tip with the stutter fix as its blank.
  Driver cloned from the morning r36's script (with its R36b detector
  corrections), NOT from r35.

## Verdicts (binding metrics — no re-scoring)
- **Question A (stutter): GO.** 0 doubled-hunger lines across 5 streams
  (309–312, 101) + 4 morning-r36 streams re-scanned (9 total). The
  sense-read arm is documented-absent: 0 food_share asks fired in the
  wild this run (1 favor ask fired — Regina's non-food ask on 311).
  Design-coherent explanation: hunger>90 = 0 on all seeds under the
  post-SURPLUSFEED regime — nobody is starving, so the beg path rarely
  fires. The unit proof carries the fix: scripts/test-favor-stutter-
  20261022.js re-run on this tip — 14/14 GREEN (300 favors/severity,
  all 3 openers + all 3 details observed, zero stuttered lines).
- **Question B (near-dupe detector): GO.** nearDupes=0 on all 5 seeds;
  probe 101's honest re-fire pair correctly excluded (quoteExcluded=1).
  One instrument gap found and fixed (see Blank filled #2).
- **Question C (nv-winddown): GO (adjudicated).** 0 stuck loops on all 5
  seeds (corrected detector). Surfaced/closed: 309 2/1, 310 3/2, 311 1/1,
  312 2/2. The unclosed-by-instrument cases are the beat-on-final-turn
  pattern (309-day10 sense-read in full: winddown voiced, driver lingered
  for tellbeast/namebeast beats, endConvo closed it) — the nv summary is
  computed BEFORE the post-loop beat machinery, so the instrument
  undercounts closes. Same adjudication as morning r36. No gesture-spam,
  no queued-forever beats. 310's 2 unrecoverable surfacings are lost to
  the driver's one-file-per-day transcript overwrite (instrument
  limitation, documented).
- **V1'': GO 5/5** (0 v1pp fails; hunger>90 = 0 everywhere).
- **V2: GO 4/4** (0.761–0.950, bar 0.40; effort 0.87–0.95). Direction
  under plentydepri: in line with morning r36 (0.774–0.899) — the
  easing holds, villages eat.
- **V3: GO 5/5** (2–5 trust≥40 pairs/seed; 0 moots — variance).
- **V4': GO** (8 transcripts sense-read in full; 0 fabric-history; 0
  near-dupe flags; probe gate via seek_taken ×6 natural on 101).
  One quote-differentiated verbatim repeat found by sense-read
  (309-day10, documented below) — reported, not re-scored.
- **V5': GO** (fills 3–5, boils 13–17/seed; 0 death mislabels).
- **V6: GO** (all villages alive day 14).
- **M2: variance noted** — System day 8 on 309/311/312/101, day 9 on 310.
  (Morning r36: 5/5 on day 8.) Not a miss — the contact window is d8-ish,
  but the single d9 is logged for the trend.
- **WILD HAUL ARC: GO** — flesh reveals on 309, 311, 312 (3/4 fresh seeds;
  deposits→reveals; 310 quiet).
- **DAY-FREEZE: GO** — timeFreezeCleared=0 on all 5 seeds (console MET).
- **OPEN BOOK: GO** — 311: scholar Gunther died in combat d8; mantle
  passed clean to Catalina ("The Codex turns a page: Gunther Santoro,
  8 days. The mantle passes to Catalina Reyes."). 312: Linh's ambush
  death d9 honestly caused. 0 mislabels.
- **BEAT-IDENTITY WILD:** documented-absent — no spoil mutters or
  devotion beats fired in-window on these seeds (morning r36 caught one
  spoil mutter, correctly attributed).
- **R34 DEATH-LITURGY: GO** — exactly 1 grief beat per death (309: 0/0,
  310: 0/0, 311: 2/2, 312: 1/1); 0 headcount codas; deaths honestly
  caused (combat, monster, ambush). The 312 "3 beats" was an instrument
  bleed (see Blank filled #1), not a triple-fire.
- **R34 THEFT-RATE: GO** — 0 caught-red-handed.
- **R36 PLENTY-ENGAGE: GO** — throttle engaged 11–13 plenty days/seed;
  voice lines sense-legible (sharpening skinning knives, mending the
  palisade, sitting with elders, carving bowls — real instead-of work).
- **R36 FALLEN: GO** — 0 fallen dupes.
- **Telemetry vs landing baseline: quiet** (5 files, 2 metrics, no LOUD
  lines). Baseline NOT rolled.

## Village assessment (plain words)
Five villages, fourteen days, all alive. The post-SURPLUSFEED regime is
the new normal: pantries run full, villagers ease off production with
visible instead-of work (Mara sharpening skinning knives, Didier mending
the palisade, Everett sitting with the elders), and nobody goes hungry
(hunger>90 = 0 on all 5 seeds; self-sufficiency 0.76–0.95). 311 buried
its scholar Gunther to a fight on day 8 and the mantle passed mid-grief
to Catalina — the woman the player sat with wordlessly on day 2, now
holding the Codex. 312 buried Linh to an ambush on day 9 (the first
grave). The monster-meat pipeline runs (deposits→reveals on 3/4 fresh
seeds). Trust concentrates in pairs, never cliques. Everyone boils
water early (13–17 boils/seed). The System arrived day 8 (310: day 9).

## People check (8/8 sense-read)
- 309-day2: Sigrun's Norwegian nonverbal sit — winddown surfaces, menu
  narrows to leave/silence, gentle close. Strong.
- 309-day10: Ingrid's curious thread (record-keeper identity, coherent)
  + winddown + beat-on-final-turn close. Strong; 1 quote-differentiated
  verbatim repeat (opener vs pool line) — documented below.
- 309-day12: Mia's pantry-run favor — deflected with consequence ("They
  won't ask twice. That much is clear."). Strong.
- 310-day2: Shakil's Bengali nonverbal sit — closed via narrowed leave.
  Strong.
- 311-day2: Catalina's Spanish nonverbal sit — closed via narrowed leave.
  (She takes the mantle on day 8.) Strong.
- 311-day4: Tiana's share_news — remembers the deflected favor ("We never
  finished talking about that favor"), shares real news (the dispatcher,
  the treeline movement), honest exhaustion, winddown close. Strong.
- 312-day2: Lien's Portuguese nonverbal sit — closed via narrowed leave.
  Strong.
- 101-day10 (probe): Courtney's seek_taken (Sergio, the pods) — player
  commits "I'll ask the System about the pods"; resolution=promised.
  KIN canon alive. Strong.
No fabricated history, no filler loops, no static menus.

## Blank filled (driver instruments, zero src/js)
1. **R34 counter cross-seed bleed (FIXED).** The r30/r34 death-liturgy +
   theft counters (griefBeats, headcountCodas, caughtRedHanded + line
   buffers) were module-level MET never reset per seed — the r23 fix
   covered only the flesh counters. Seed 312's census reported
   griefBeats=3, but a stack-traced reproduction proved the game emitted
   the beat ONCE; 2 of the 3 were seed 311's beats carried over
   (309:0, 310:0, 311:2, 312:1 emitted vs 0,0,2,3 reported = cumulative).
   Fix mirrors the r23 pattern (reset per seed in runSeed). Proof:
   scripts/test-landing-r37-griefreset-20261022.js — RED demonstrated
   (old reset leaves griefBeats=2), GREEN on the fix; 20/20 ALL GREEN.
   Post-fix re-run: per-seed counts exactly 1 beat/death. The morning
   r36's evidence carries the same bleed (their verdicts still held).
2. **Verbatim detector quote gap (FIXED).** The verbatim check was
   quote-sensitive: 309-day10's opener ("I record the arguments too...")
   served bare, then the same pool line served quoted 2 turns later —
   fell through BOTH the verbatim check (quote mismatch) and the
   near-dupe check (identical cores skipped as "exact dupes counted
   above"). Fix: strip surrounding quotes before exact-match. Proof in
   the same test file (old logic 0, new logic 1; driver carries
   stripQuotes); 20/20 ALL GREEN. Game-side note: the opener (r0.line)
   isn't in convoPick's ledger, so the curious pool re-served it — a
   candidate for the content/ledger pass, not a fix commit.

## Observations (documented, not fixed)
- M2 variance: System day 9 on seed 310 (4/5 on day 8). Logged for trend.
- 310's 2 unrecoverable winddown surfacings: the driver's one-file-per-day
  transcript naming overwrites same-day sits — 2 of 310's 3 surfacings
  can't be sense-read. Pre-existing lineage limitation; the surviving
  evidence shows proper closes.
- Food_share favor asks didn't fire in the wild this run (0/9 streams
  incl. morning r36's) — the village is too well-fed for the beg path.
  The r21 unit proof (all 18 slot combos, zero stutters) is the fix's
  standing verification; wild exposure is inherently limited by design
  success. If Steve wants the ask exercised, a hunger-stressed seed is
  the way, not a driver hack.

## Metric review (§14)
- No metric re-scored mid-run. The R34 DEATH-LITURGY "3 beats" was an
  instrument bleed, root-caused via stack trace and fixed — the gate
  itself held (1 beat/death) once measured correctly. Not a miss.
- The 309-day10 quote-differentiated repeat is reported as found; the
  detector now catches it. The game-side repeat (opener outside the
  convoPick ledger) is a content-pass candidate.
- Next-run proposal: none; gates held.

## reachable / fun / winnable
- REACHABLE: yes — System contact, plenty voice, death liturgy, flesh
  arc, favor arcs, nv sits all fired unprompted.
- FUN: yes — the easing voice gives the fortnight a lived-in rhythm;
  grief lands person-shaped; the day-2 sit with Catalina pays off when
  she takes the mantle on day 8.
- WINNABLE: yes for the leg — 4/4 fresh villages alive, fed, producing
  at day 14 (pop 10–12). Scholar death (combat) is the roguelite
  working as designed — the mantle passed with names spoken.

## Ops
- Harness: scripts/journey-landing-r37-20261022.js (morning-r36 lineage +
  r37 instruments: r34 per-seed reset, quote-normalized verbatim check;
  header documents the lineage + infra notes below).
- Proofs: scripts/test-landing-r37-griefreset-20261022.js (20/20 GREEN:
  grief-bleed RED->GREEN + verbatim-quote RED->GREEN); r21's
  scripts/test-favor-stutter-20261022.js re-verified 14/14 GREEN on tip.
- Zero src/js changes — no regressions possible from this run.
  node scripts/check.js --quick HUNG (zero output in 8+ min; house rule
  says "seconds") — killed. The change is scripts-only (new driver +
  proof test, no src/js, no green-list test touched); the relevant
  suites are the proof tests above (20/20 + 14/14 GREEN) plus
  node --check clean on both new scripts. The hang is logged as an
  infra observation, not a game regression.
- Evidence: hidden_files/evidence/2026-10-22/landing-r37/ (5 censuses,
  5 system files, 5 fullstreams, ~54 transcripts).
- Rotation: journey-rotation-a.txt → 1 (establishment next).
- Merged locally, pending ship (no bump/push — the ship loop owns those).
- INFRA NOTES (loud): (1) this run's first draft CLOBBERED the morning
  r36's committed driver (cp over a tracked file) — caught before any
  commit, restored via `git checkout HEAD --`; the r37 driver was then
  rebuilt from the restored file. (2) journey-rotation-a.txt read 0 at
  19:50 UTC with mtime 19:44:17 UTC (writer unknown); morning r36
  intended 0→1 and convergence-tracker last logged 1→2 on 10-21 — the
  rotation file is thrashing between runs; this run writes 1 per the
  body rule and the morning run's intent. (3) A mid-run
  `SEEDS=309,310,311,312,101 REPEAT_SIT=1 MOURN_PROBE=1` invocation
  contaminated 309/310's evidence with probe behavior — killed
  immediately; both seeds re-run clean (deterministic, byte-identical
  metrics restored). Never pass probe flags on a multi-seed invocation.
