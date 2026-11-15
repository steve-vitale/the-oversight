# Journey social life r215 — PRE-REGISTRATION (Lane B, 2026-11-15)

Leg 5 (social life). Rotation-b read 5 at run start; this run plays 5
and writes 6 (crisis next) at closeout. Run number r215 follows r214
(Lane A establishment, landed 2026-11-15); r212 is deepening, r213 is
deepening + establishment (shared-counter collision, files differ by
leg prefix, no overwrite — same convention as the r213 note). No
journey-social-r215 evidence exists. Base: master e6f239a8c
(sim-courtship-rework-b pilot corpora). Seeds 44701–44704 (fresh band,
checked below), DAYCAP 140, policy journey (socialite base + real
conversations). Driver scripts/journey-social-life-r215-20261115.js,
analyzer scripts/analyze-journey-social-r215-20261115.js, helpers
scripts/journey-social-r215-helpers.js — all r206 verbatim except
seeds/OUTDIR/filenames (r206 helpers already carry the M12-native
tallyThreeTimes + M2 rate watch).

## Standing state at run start (read before judging anything)

- Lock playtest-loop-2.lock did NOT exist at run start. Own lock written
  2026-11-15T19:55:35Z, run_id journey2-5-20261115T195535Z.
- `git pull --ff-only` in main tree: "Already up to date" at 19:55Z;
  master HEAD e6f239a8c. Main tree CLEAN at pre-flight, disk 42%.
- Worktree journey2-5 registered fresh from e6f239a8c; heartbeat
  landed immediately; hbloop every 10 min (pid 23790).
- Lane B r211 endgame adoption LANDED 13:00 CST today (master
  7ab6e2546, rotation-b 4→5); the 13:00/14:00 Lane B occurrences were
  the r211 adoption, not social runs. The 12:00 occurrence deferred
  on the r211 heartbeat (predicted in the daily log).
- Host write flap: last window #11 ended ~11:52 CST (brief, cleared
  on its own, nothing lost); probes at run start OK. Flap still
  treated as ongoing per the alignment synthesis — gate adjudication
  must check for EPERM before attributing failures.

## Base movement since r206 (007c61738 → e6f239a8c, ~40 commits)

Conversation/social-relevant src/js changes:
- c89ac24b3 journey-establishment r214 [needs-eyes]: plain parting pool
  for neutral/friendly sittings (convoMoodGoodbye). FIRST social panel
  with it native. Could move conversation endings (M4 candidates,
  natural ends) and shift the RNG stream ~1 draw per sitting close
  (guardablate note) — reported with direction, not judged as a defect.
- c09a9f732 + 676430c3a journey-endgame r211: sysSay doubled-quote fix
  + quoteWrap follow-up (7 sites: game.js, sigW3c.js). FIRST social
  panel with it native. Display-only; transcript text loses redundant
  edge quotes. M4/M7 scans read the same words minus quote chars.
- 783487438 journey-crisis r208 [needs-eyes]: lapsed want thread names
  the current favor, not the stale one. FIRST social panel with it
  native. Could move the dropped-thread watch (resurfaces should name
  the live favor).
- af56c7b4f journey-succession r209: deferred-ask ledger guard +
  favor-block noBeat (r202 fixes). Social-adjacent (favor threads).
- 52a84cd46 sim-funeral-mend-b: FUNERALMEND default ON in hierarchy.js.
  Social-adjacent (funerals, bonds); watch for funeral-adjacent
  conversation lines in the corpus.
- dc8cbd3f3 sim-gorgeprice2-b: lingerer guard recovered (+16 lines).
  Combat/territorial, not social — but it touches wave-4 kills and
  survival (M5 context); the guardablate ablation (5453f710e) says
  guard removal drops survival 4/8 → 1/8, so the guard is load-bearing
  for the survival floor under this panel.
- 413252eb4 journey-landing r129: terrain-pocket fix. Not social.
- 93f88819c journey-establishment r139: spotter wiring. Not social.
- No dawn-scorer movement since r206. Courtship/producerparty sim
  arms are policy-only (zero src/js) — no game change.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 44701–44704. Full-scope check in the worktree:
- `git grep -l -E "44701|44702|44703|44704" --
  'evidence/*/*prereg.md'`: NO hits.
- `git grep -l -E "44701|44702|44703|44704" --
  'evidence/*/sim-*-prereg.md' 'evidence/*/journey-*-prereg.md'`:
  NO hits.
- `git grep -l -E '44701|44702|44703|44704' -- 'evidence/'` hits
  only October census/feastvoice corpus JSONs where the digits occur
  inside longer numbers (fd values, census payloads) — none names
  44701–44704 as a seed band, so per the skill these are not
  reservations (a naming reserves a band; a digit substring inside a
  corpus payload does not).
- Backup band 44801–44804: `git grep -l -E "44801|44802|44803|44804"
  -- 'evidence/*/*prereg.md'`: NO hits.
- COLLISIONS FOUND AND AVOIDED: 44201–44204 RESERVED (r195 prereg
  backup), 43901–43904 RESERVED (r189 prereg backup), 44401–44404
  RESERVED (r200 prereg backup), 44601–44604 RESERVED (r206 prereg
  backup). 44001–44004 USED (journey-deepening r124–r130, r183–r188).
  44301–44304 USED (r200 seeds). 44501–44504 USED (r206 seeds).
  Forbidden band 99201–99208 — a different band.
- Previous social bands: 41801–41804 (r141), 41901–41904 (r144),
  42001–42004 (r145), 42201–42204 (r149), 42301–42304 (r153),
  42601–42604 (r154), 42701–42704 (r159), 42801–42804 (r163),
  43301–43304 (r167), 43401–43404 (r172), 43501–43504 (r179),
  43601–43604 (r180), 43701–43704 (r181), 43801–43804 (r189),
  44101–44104 (r195), 44301–44304 (r200), 44501–44504 (r206).

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics
as r195/r200/r206 (M1–M12). Sixteenth datapoint on Q1
(villager-initiated bonds) with the build live, FIRST panel with the
r214 parting pool, the r211 quote fixes, the r208 lapsed-want naming,
the r209 deferred-ask guard, and FUNERALMEND native in the base.

(B) RE-CONFIRM r195's TWO FIXES IN THE WILD on fresh seeds, with the
REVISED bars, counted NATIVELY (fourth panel):
  1. FAVORREQ SPEND-OUT (M12-native): max "I've told you three times
     now" serves per sitting <= 1, 0 sittings with 2+, AND >= 1 exit
     line ("We're going in circles — ...") served in the panel.
  2. RECAP-EMPTY POOL (M11): recap-empty flags < 10 panel-wide
     (r195 confirm 8 → 0; r200: 0; r206: 0). If >= 10, the pool fix
     did NOT hold and the item reopens.
  If either confirmation fails, the fix is reopened as this run's
  job (proven on its own proof test + a confirmation re-run on the
  worst seed, never by re-scoring the panel).

(C) WATCH TALLIES (carried, read-only): re-offer (furniture-free max;
  r206's was 12), dropped threads (next-sitting resurface check — now
  also whether resurfaces name the LIVE favor per r208), NARR scan
  (verbatim repeats + panelMaxSameNarr), react shape, scattering
  capture, player-side greeting repetition. NEW/REPEATED watches:
  - VENDETTA DECISION POINT (r206 metric review): r206 maxUnordered
    was 7 (Gladys↔Jad), one below the 8 bar. If this panel reaches
    >= 8, the grievance-loop cooling-off becomes a design-look job
    for the NEXT run (reported, not re-scored here). If it stays
    below 8 a second panel running, the bar itself is reviewed.
  - M1 HOT-ACCOMPLICE PATTERN (r206 metric review): r206 found the
    first hot accomplices (Adaeze grievance 66/88 on Somchai→Seamus
    arms). Re-read this run: if hot accomplices recur, the pattern
    description updates to "accomplices usually cold, sometimes
    carrying their own grievance" (narrative update, not a bar
    change).
  - ask:village injured answers (r130 fix): 0 lines in r200 and r206
    — third panel. If still 0, the watch is retired as unhittable
    in this driver's path (recorded, not failed).
  - HEED warn_you engagements (r131 fix): CONFIRMED in r206 (first
    panel, 5 NPC warn lines + engagement form). Watch for recurrence.
  - M2 COMBINED-PROPOSAL BAR (carried): if any villager's
    person+link total reaches >= 20, the combined-cap question
    becomes a design-look job for the NEXT run (reported, not
    re-scored here). Prior max 14 (Lea, r195); r206 max 13 (Nino).
  - MOOTS (watch): r206 saw 11 moots (2/3/2/4). Investigate the
    trigger only if 0 moots fire across the 4 fresh villages.
(D) NOT THIS RUN: the r171 M2b scholar-open proof (leg 4
instrument); the measurement-proof refresh (sim-proofrefresh-b18,
another arm); the courtship-rework-b BFS pathfinding fix (the
pilgrimage stall narrowed to one seed's creek/rubble pocket,
100646 — the fix is a policy-side BFS in the courtship pilot,
owned by the courtship follow-up arm; the confirm band
100621–100636 stays fresh and unspent). Recorded here so the next
social run does not re-inherit them.

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run (r195/r200/r206
canon sections stand). No src/js change is planned; any job-B fix is
a behavior change inside an existing system — no new system, no canon
change, no pool wording change.

## Driver

scripts/journey-social-life-r215-20261115.js = r206 driver verbatim
EXCEPT: fresh seeds 44701–44704, OUTDIR evidence/2026-11-15,
filenames r215. Analyzer:
scripts/analyze-journey-social-r215-20261115.js = r206 analyzer
verbatim except filenames/outdir. Helpers:
scripts/journey-social-r215-helpers.js = r206 helpers verbatim.
Proof tests: the 18 carried tests (r172 ×8, r179 faceguard, r180
narrsplit + favorreq-exit, r181 proposelabel + vendetta, r189
recapempty, r195 doorreq + favorreq-cycle + recapempty-pool, r206
threetimes + invite-small), all green in-tree before the panel; new
proof tests only if a job-B fix lands.
Smoke first: SEED=44701 DAYS=5 into a scratch subdir, driver wrap
runs, no instrumentErrors.

## Leg questions

1. Q1 (continuity): do villagers initiate bonds in wild social play,
   sixteenth datapoint with the build live? (M2 count question.)
   Watch: proposals per village-day vs r195 0.328 / r200 0.177 /
   r206 0.268.
2. Q2 (continuity): arming motive — every plot grievance-linked;
   cold-accomplice pattern holds, or hot accomplices recur (M1)?
   Does any pair re-arm to 8+ (vendetta decision point)?
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
   per r208)? Does a double confession reproduce on the guarded base
   (B2 — closed in r179, re-confirmed clean in r180, r181, r189,
   r195, r200, r206; re-confirm as watch)? Does the recap-empty line
   still cycle (M11 — fix confirmation, job B2)? Does the door
   cluster still dominate (M12 — fix confirmation, job B1, revised
   bar, native counts)? Do the r130/r131 conversation fixes show in
   the wild (warn_you engagements, injured answers — third panel)?
5. Q5 (guardrail, REPORT-ONLY): report median lived-days +
   past-d100 count judged against the survival-control median (126d);
   the "within-window only" guardrail reading triggers only if 0/4
   villages pass d75. Sequence for the record: 2/4 (r172), 2/4
   (r179), 1/4 (r180), 1/4 (r181), 1/4 (r189), 3/4 (r195), 2/4
   (r200), 2/4 (r206).
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
   (r206: 1 settle, same as r200)?
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
  the per-village-day rate moving markedly vs r195/r200/r206
  (0.328/0.177/0.268).
- M3: invitations always taken or always refused (the ruling is
  "sometimes taken").
- M4 NO-GO (a senseless transcript, with quote) or the react shape
  changing on the new base (agree/joke offered on goal threads).
- M5: a third d100+ village, or 0/4 past d75 (guardrail floor).
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
- M11 >= 10 again (recap-empty pool fix did NOT hold — job B2
  reopens).
- M12 confirmation bar missed (spend-out fix did NOT hold — job B1
  reopens).
- HEED warn_you engagements or ask:village injured answers in the
  wild (r130/r131 fixes showing, third panel).
- The r214 parting pool showing in the wild (plain partings on
  neutral/friendly sittings) or NOT showing (Marta-class bare
  endings persisting on the new base).
- The r208 lapsed-want naming showing in resurfaces (live favor
  named) or the stale favor still named (fix not holding).
- A vendetta pair reaching 8+ unordered arms (decision point fires).

## Telemetry

- Metrics: same l3.* keys as r195/r200/r206 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed panel;
  a re-seed with a metric mapping for the current social schema is a
  future-run job (r206 telemetry section).
