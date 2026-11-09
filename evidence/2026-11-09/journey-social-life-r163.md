# Journey social life r163 — RUN NOTE (Lane B, 2026-11-09)

Leg 5 (social life). Rotation-b read 5 at run start; this run plays 5 and
writes 6 (crisis next) at closeout. Run number r163 follows r162.
Base: master a3ba1d22c. Seeds 42801–42804 (fresh band, verified in prereg),
DAY CAP 140, policy journey (socialite base + real conversations).

## ADOPTION — the first r163 died mid-panel (stale-lock recovery)

This run ADOPTS the dead 2026-11-09T12:55:30Z run (r163), it does not
re-run it. The lock was 2h old, the journey2-social tree heartbeat 77 min
stale, no live process in the tree. Per the overlap guard the previous run
is DEAD; the lock was deleted and re-created under run_id
2026-11-09T15:00:40Z, and the existing registered tree was heartbeated in
place (register refuses the slug while it is active; the tree still
existed with uncommitted work, so a fresh slug would have stranded it —
the 2026-11-07 finishersize recovery used a fresh slug only because that
tree had been REMOVED).

Adopted state, verified before continuing: seed 42801 complete (103d,
373KB), seed 42802 a 0-byte file (died mid-write), seeds 42803–42804
unrun; truth.js coach-pool fix + driver/analyzer/helpers + 3 proof tests
present but uncommitted. All three proof tests re-run GREEN by the
adopting run before the panel resumed (coach 9/9, main PASS, narr ALL
PASSED). Seeds 42802–42804 then ran on the same prereg base (master moved
6 commits since a3ba1d22c, zero of them touching src/js — the panel is a
single-base panel). Prereg:
evidence/2026-11-09/journey-social-life-r163-prereg.md (binding).

Infrastructure notes, loud:
- The dead run's prereg records a ~25 min registration delay from an EPERM
  flap (O_EXCL creation refused filesystem-wide, 2026-11-05 flare
  signature). No flap observed during this adoption run; git and file
  writes were normal throughout.
- `git pull` in the main tree FAILED to fast-forward: local master is 246
  commits ahead of origin/master and origin is 156 ahead; last common ship
  2026-11-08 11:29Z (version bump 2294ef815). Origin's new work is Cursor
  PRs #118–#121 (OVE-152..161, merged 2026-11-09 ~05:15Z). This is the
  ship loop's reconciliation, NOT this run's: no origin merge attempted,
  landing is local-master only per the loop contract. Flagged loudly here
  so the ship loop sees it.

## PRE-REGISTERED VERDICTS (binding, §14)

- **M1 arming motive — GO.** 9 plots, all 9 grievance-linked at arming
  (grievanceTargetToLeader > 0), 8 grievance-holder→later-leader cases.
  All 9 plots are seed 42803, one feud: Somchai↔Stan, Amelia inviting
  with ambition-only motive (score 25, grievance 0) while the leader is
  grievance-hot — the cold-accomplice pattern HOLDS (not broken).
  **DROUGHT BOUND RETIRED AS A CLAIM:** 4 plots armed after d30 (d30,
  d34, d37, d39). r141 broke the d9–d19 bound once; this second break
  RETIRES it per the prereg — the bound is no longer a claim, it is a
  retired hypothesis. Do not re-open it.
- **M2 villager-initiated bonds — ANSWERED (fifth datapoint).** 99
  villager-initiated proposals panel-wide, all 99 by villagers, 0 by the
  scholar: 63 person-kind (29 accepted, 4 refused, 4 expired, 26 staged),
  36 link-kind (15 accepted). Per-initiator person max 5 (Sylvie,
  Somchai) — inside the amendment-5 cap of 8/90d. Engine records the
  proposer: YES (bond samples carry proposer). Villagers propose bonds
  on their own, in the wild, and get accepted — the Q1 answer is now
  five panels deep.
- **M3 invite refusal — REPORT.** Party (player-invited): 17 accept /
  8 decline. Lure (NPC-invited): 9 accept / 6 decline. Bond (NPC):
  7 accept / 4 decline. Invitations are sometimes taken, sometimes
  refused, by both sides — the ruled behavior is live.
- **M4 sense — GO.** 323 transcripts, 4 candidates printed, all read as
  real people (see People check). React shape holds: agree=0, joke=0,
  silence=2088 offered, dlg:react present; longest continuer run 3 (<5),
  so the 3-label 'more' pool suffices. 99 near-dup flags — see M7.
- **M5 survival guardrail — MET (2/4 past d100).** d103, d83, d53, d139.
  Sequence now: 1/4, 1/4, 0/4, 1/4, 0/4, 0/4, 0/4, 2/4, 3/4, 0/4, 2/4.
  Dark-channel verdicts this run are full-window, not within-window-only.
- **M6 gossip-position — GO (re-aligned gate definition).** 0 naming-beat
  lines beyond radius-1 of Haven across the panel; 166 debates kicked,
  163 settled. Strict on-tile away total 88 — the known metric/gate
  definition discrepancy, reported, NOT a failure per prereg.
- **M7 dedupe — HOLDS for the fix, with a pool-depth observation.**
  99 near-dup flags, all within-sitting, all distinct cores, ZERO
  verbatim repeats. Families: no-words foreign phrase 33, topic-
  continuation reframe 20, herb/place template slot 17, want restatement
  16, answer-opener + new content 7, small-talk reframe 3, misc 3.
  The 66 non-foreign flags are legitimate variety by design (same frame,
  different content: different herbs, different places, different
  topics, 2–3 line want pools). The 33 no-words flags read against the
  r156 nv-foreign fix as the prereg requires — mechanism check done:
  `foreignLine` draws through `convoPickCycle`; agree pools hold FOUR
  phrases per language, so a long no-words sitting exhausts the pool
  and cycles, re-serving the same phrase with a freshly drawn nod
  suffix (3-variant nod pool). The r156 defect itself — the "They
  answer at length." fallback repeating 12x because phrase objects
  deduped as "[object Object]" — does NOT reproduce: zero fallback
  lines in 323 transcripts, zero verbatim repeats anywhere. The fix
  holds; what the flags expose is pool DEPTH (4 phrases), a content
  job, not a dedupe-mechanism failure. Not a reopen. See metric review
  for the wording question this leaves for the next run.
- **M8 counter-settle — SETTLED (confirmed).** 15 proposeLink calls, 1
  counter, 1 driver settle → link formed (seed 42801, d6, tribute 5000,
  pantry 27410), 0 re-raises after it, 0 blocked.
- **M9 recap cap — HOLDS.** Panel max presses 5, total 205, 0 cap
  failures, 'recap' never offered after the 5th press.
- **M10 coach variation (new, job B) — HOLDS.** NARR scan: 325
  conversations, 0 verbatim repeats, panelMaxSameNarr 1. The fix is
  proven LIVE, not just in the proof test: Leo's 42804 sitting shows
  all three coachPriorDeflect variants in one sitting, each once, in
  the order the doubt probe was pressed.

## Q10 SCATTERING — ANSWERED (job C1)

Seed 42803 ended **scattered=true, hungryDays=3, aliveEnd=6** —
confirmed from the new record, not by elimination. This answers the
r159 42703 question: yes, a village can end scattered with people
alive. The pantry sat empty for 3 hungry days and people walked away
while 6 were still living. The other seeds: 42801 scattered=false /
hungryDays=0 / aliveEnd=0; 42802 scattered=false / hungryDays=3 /
aliveEnd=0 (starved to zero, not scattered); 42804 scattered=false /
hungryDays=0 / aliveEnd=0.

## VILLAGE ASSESSMENT (plain words)

Four villages, all lost, none past the table — but the social fabric
held to the end in every one.

- **42801 (Nathan, d103):** 18 fallen. Seven died "in the wild", seven
  to "the phoenix link (ash)" — a fire that took a third of the village
  — one each to the Gavel, betrayal, a monster, the arena. The last day
  killed 8 at once. The scholar's mantle passed 8 times
  (Jose→Elena→Sierra→Duc→Sylvie→Aroha→Diana→Amina→Nathan): nobody held
  it long. Still, 82 full conversations, 67 ending naturally, 14
  feasts, 107 bonds standing at the end. People kept talking, bonding,
  and feasting while the village burned down around them.
- **42802 (Ruth, d83):** 13 fallen, mostly the wild (6) and monsters
  (3), one starvation, one to "a stranger", one to the Big Beast. 6
  successions. 61 conversations, 53 natural ends, 11 feasts. Hungry
  for 3 days at the end but the village starved to zero rather than
  scattering — the scattering path needs people with somewhere to walk
  to, and by then there was no one left to walk.
- **42803 (Somchai, d53):** the feud village. 8 fallen; one of them
  Stan, murdered d39 in Somchai's ninth plot against him — the village
  tried the case and acquitted. Nine plots in 53 days, all Somchai
  against Stan, all grievance-driven, springing hurt/escaped/killed.
  The village scattered at d53 with 6 alive after 3 hungry days. 46
  conversations, every one ending naturally — the shortest-lived
  village talked the most cleanly.
- **42804 (Theo, d139):** the long one. 18 fallen, 13 in the wild. The
  mantle passed ELEVEN times in 139 days — the scholar died and died
  and the village kept going. 136 conversations, 115 natural ends, 19
  feasts, the panel's only moot. Two death clusters (d114, d139).

What they knew: bonds everywhere (52–107 standing per village at end),
debates kicking and settling (163/166), rumors moving. What was
missing: moots almost never fire (1 in 4 villages / 378 village-days);
the table never appears — no village lived long enough or strong
enough; nobody's social life saved their village, which is honest:
talk doesn't stop the wild killing people.

## PEOPLE CHECK (M4 — full transcripts read)

- **Sylvie (42801, talk request, 9 turns, natural end):** wants help
  with the pantry run, deflects the doubt probe twice, then confesses
  TWICE with two different secrets — first that she's from Kisangani,
  not Denver, then that she was a veterinarian, not a mason. The
  coach lines vary correctly across the three presses. The double
  confession in one sitting is slightly odd (two different "truths"
  back to back) but each lands as its own beat, and she ends by
  pivoting to a real offer: a creek-bend food run before dark. PASSES.
- **Leo (42804, friendship, 11 turns, natural end):** the coach-pool
  proof in the wild — three distinct deflect-coach lines across three
  presses, then a confession ("I don't actually want to survive,
  whatever it takes. I want to belong somewhere."), then a second
  secret (trail crew lead, people from his old life he'd rather never
  find him). Ends with an honest deferral: he's away from Haven and
  can't promise a dawn meet. PASSES — this is the M10 live check.
- **First-memory talk (42803, 11 turns, natural end):** a stranger
  asks about the player's first memory, admits first memories are
  "half real and half the story you needed", gets awkward, recovers
  with their mother's terrible advice about strangers, then spots the
  wrong deer. Warm, specific, ends with a real goodbye. PASSES.
- **Desmond (42802, talk request, 10 turns, natural end):** the
  weakest of the four. The driver pressed "Hold on, back up. Then
  what?" five times; Desmond mostly deflects ("They let that thread
  drop — for now", "Teach me something"). It reads as a real person
  who doesn't want to talk, not as a broken one — but the continuer
  loop is the thin edge of the conversation system. Not a NO-GO; the
  bar needs one passing transcript and three pass cleanly.

Dropped threads (14 across 325 conversations): the open-thread ledger
mostly works — dropped pantry/creek asks resurface next sitting ("I
hate to ask twice, but it's still open"). Two notes: one Mara thread
has NO next sitting (village ended first — thread dies with the
village, honest); one Chantal sitting explicitly says "we got cut off,
6 days back" — the ledger naming the gap out loud, which is the
system working as designed.

## BLANKS FILLED THIS RUN

- **(B) Coach-line repeat — FIXED + PROVEN.** truth.js
  `confrontWindup` priorDeflect branch now draws from a 3-variant
  `coachPriorDeflect` pool via `drawTruthLine` (per-game no-repeat).
  Proof test scripts/test-journey-social-r163-coach.js 9/9; panel
  NARR scan 0 verbatim repeats; Leo's sitting shows all 3 variants.
  Same meaning in all three lines; no gate change.
- **(C1) Scattering capture — DONE.** Driver records scattered /
  hungryDays / aliveEnd at village end; Q10 answered (42803).
- **(C2) Re-offer furniture filter — DONE.** Panel: 315/325
  conversations with a re-offer, raw panelMax 12, furniture-free 11.
  The headline is still menu furniture (leave/silence offered 7–11
  times in long conversations), but the filtered number now exists:
  real ids top out at 7 (dlg:more, recap, dlg:commit) in the printed
  top-12. No fix owed — the re-offer is the menu persisting while the
  player keeps choosing continuers, not a loop defect.
- **(C3) NARR near-dup scan — DONE.** Reported separately from M7:
  0 verbatim repeats, panelMaxSameNarr 1, nearDupFlags 0 on NARR lines.

## NEW OPEN ITEMS (not fixed this run)

1. **No-words agree pools are 4 phrases deep.** Long no-words
   sittings cycle the same foreign phrase with a different nod.
   Content job: widen the agree pools (or add a second agreement
   beat) — not a dedupe fix.
2. **Moots barely fire.** 1 moot in 4 villages. If moots are meant to
   be the village's social heartbeat, the trigger is too rare to
   matter in most runs.
3. **Sylvie's double confession.** Two different "truths" in one
   sitting (origin, then occupation) reads slightly off — worth a
   look at whether a confessed villager should have one secret per
   sitting, but the transcript still passes.
4. **"The phoenix link (ash)"** killed 7 on 42801 — a striking death
   cause; no action, just named for the record.

## METRIC REVIEW (§14)

- M7's wording needs a next-run clarification: is a same-beat flag
  from POOL CYCLE EXHAUSTION (4-phrase pool, long sitting, suffix
  differs, never verbatim) a "flag in a fixed pool", or does "fixed
  pool" mean only verbatim/fallback repeats the dedupe mechanism was
  built to stop? This run judges the r156 fix as holding on the
  mechanism (zero fallback, zero verbatim) and files the 33 flags as
  pool depth. If the next run reads the prereg strictly, M7 is a
  miss on those 33 — the counts are all here to re-judge.
- M5's threshold is met for the first time in the recent sequence
  (2/4) — the guardrail now passes; the sequence is recorded, not
  re-scored.
- M6's strict-vs-gate discrepancy persists (88 strict-away vs 0
  gate-away). The re-aligned gate definition stands; the strict
  count is the known discrepancy, not a failure.
- No metric was re-scored mid-run. The drought bound is RETIRED per
  the prereg's own terms (second break), not by re-scoring.

## REACHABLE / FUN / WINNABLE (leg 5)

- **Reachable: YES.** 323 real conversations across 4 villages;
  feasts, bonds, debates, confessions, plots all fire in wild play.
  Only moots are rare (1/4 villages).
- **Fun: YES.** The transcripts read as people — confessions land,
  deflections sting, the feud village is genuinely dramatic, and
  villagers initiate bonds on their own and get accepted. The thin
  edge is the continuer loop (Desmond) and the cycling foreign
  phrases in long no-words sittings.
- **Winnable: UNCHANGED.** Social life is alive and working, but no
  village survived — 0/4 alive at end, 2/4 past d100. The social
  layer doesn't move survival; the win still runs through the
  winnability chain (wild ally-join → wave-4 kills → veterans), which
  this leg doesn't touch. The leg's content is reachable and fun;
  the win is a different leg's problem.

## TELEMETRY

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/social.json
--current 'evidence/2026-11-09/journey-social-life-r163-*.json'`: one LOUD
line — `l3.bonds disappeared: baseline 318 -> current 0`. EXPLAINED, not
a bug: the social driver never emits l3.* fields (prereg-known schema
drift); end bonds are 107/77/52/100 in the JSONs. Baseline NOT rolled.

## FILES (worktree journey2-social, branch journey2-social)

- src/js/truth.js — coachPriorDeflect pool + drawTruthLine wiring (job B)
- scripts/journey-social-life-r163-20261109.js — driver (r159 verbatim +
  fresh seeds + scattering capture)
- scripts/analyze-journey-social-r163-20261109.js — analyzer (+ NARR pass,
  + furniture-filtered re-offers)
- scripts/journey-social-r163-helpers.js — helpers (+ tallyNarrDup,
  furniture filter)
- scripts/test-journey-social-r163.js — proof (fixtures + C2/C3)
- scripts/test-journey-social-r163-coach.js — proof (job B, 9/9)
- scripts/test-journey-social-r163-narr.js — proof (r159 narr fix, carried)
- evidence/2026-11-09/journey-social-life-r163-prereg.md
- evidence/2026-11-09/journey-social-life-r163-{42801,42802,42803,42804}.json
- evidence/2026-11-09/journey-social-life-r163-analysis.txt
- evidence/2026-11-09/journey-social-life-r163-panel-remaining.log
- evidence/2026-11-09/journey-social-life-r163.md (this note)

Live-browser 390×844 check: not repeated this run — the change is a
text-pool swap in the existing NARR coach slot (no UI/layout change);
the live check per the prereg is the panel corpora (Leo's sitting
shows all three variants rendering). Ship loop verifies live on ship.

## ADOPTION VERIFICATION (main session, 2026-11-09 ~16:10Z)

- Run DEAD by the liveness rule: heartbeat frozen at 15:50:46Z across
  re-checks (17m+ stale), zero processes in the tree, lock still the
  15:00:40Z run's (no successor). Adopted in place.
- Coach fix recovered from stash@{0} (src/js/truth.js +17/−1, the
  coachPriorDeflect pool) — the worker's attribution rerun had stashed
  it and died before popping. Popped explicitly, diff verified.
- Proof tests re-run by the adopter: coach ALL PASS (3 distinct beats),
  main RESULT: PASS, narr ALL NARR CHECKS PASSED.
- Telemetry re-run by the adopter (all 7 baseline metrics): SIX LOUD
  lines, not one — l3.bonds, l3.deepBonds, l3.betrayalCases,
  l3.mootsConvened, l3.gossipConvos, l2prime.count all disappeared
  (baseline → 0). Same explained cause as the run note's single line:
  the social driver never emits l3.* / l2prime fields (prereg-known
  schema drift); end bonds 107/77/52/100 in the JSONs. Baseline NOT
  rolled. (The run note's "one LOUD line" was a one-metric check; the
  fuller check shows the same drift across all six.)
- Remaining: attribution rerun of the 8 exit-1 check failures (fixed
  vs base gate), rebase onto current master, commit [needs-eyes],
  ff-only merge, release, rotation-b 5→6, lock delete (re-read first),
  timeline entry.

## GATE ATTRIBUTION (main-session adoption, 2026-11-09 ~16:31Z)

Worker's gate (base a3ba1d22c): 284 passed, 16 failed (8 timeouts,
8 assertion failures). Attribution finished by the adopter, fixed vs
base, standalone:
- `test-measurement-proof-update` + `test-measurement-workflow`:
  FAIL on the fixed tree AND on the base tree (fix stashed) — the
  retained-proof staleness pair is PRE-EXISTING (r122's policy
  staleness; truth.js is a manifest input, so the pair fails either
  way). NOT lever-attributable; the measurement-proof refresh owed
  after the last src/ landing covers it.
- `test-trust-observer-neutrality`: 6/6 PASS standalone on the fixed
  tree — the worker's gate exit-1 (63s) was a load artifact.
- The other gate failures (mobile-combat-cadence, occupation-panels,
  phone-frame-proof, measurement-cache-flags + the 7 timeouts) are
  all in the standing / intermittent-load set and failed identically
  in the sametick + wideduty adopt gates on different trees.
**No lever-attributable failure. Gate adjudicated GO.** (A full
check.js --quick is still owed on the rebased tree before landing,
per the rebase discipline for src/js changes.)
