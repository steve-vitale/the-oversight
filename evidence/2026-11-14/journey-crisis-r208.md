# Journey crisis r208 — RUN NOTE (Lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start; this closeout writes 7
(succession next). Base: master 0054751ad. Lock:
playtest-loop-2.lock run_id 2026-11-15T02:55:40Z (own). Worktree slug:
journey2-crisis. Prereg: evidence/2026-11-14/journey-crisis-r208-prereg.md
(committed with this note). Panel evidence (per-seed JSONs, logs,
analyses): goal hidden_files/evidence/2026-11-14/journey-crisis-r208-*.
Proof tests: scripts/test-journey-crisis-r208-lapse-label-20261114.js
(9/9, seeds 4242/7/42) + r201 settled-favor regression 9/9 same seeds.

## Pre-flight / infrastructure (LOUD)

- Main tree clean (0 dirty), disk 37%.
- `git pull --ff-only`: "Already up to date" (master 0054751ad — a
  sibling landed sim-holdbuild-b's pilot verdict mid-preflight).
- `worktree-reap.sh`: exit 0, 11/16 active, removed nothing. 8 LOUD
  lines, all other owners' uncommitted trees (sim-wideduty-a,
  sim-sametick-a, journey-scale-attr, sim-secondlink-a, sim-redactor-a,
  sim-saycap-a, sim-siegedialog-a, sim-inffight-ab): never
  auto-removing, not mine to touch.
- DEAD-REGISTRATION RECOVERY: a prior `journey2-crisis` registration
  (run_id 2026-11-15T01:56:50Z, owner oversight-playtest-loop-2)
  was found with heartbeat 01:56:50Z — ~59 min stale, no live
  journey/crisis processes, tree CLEAN (0 dirty), branch tip
  3321c6546 fully merged into master (verified
  `merge-base --is-ancestor`), no prereg, no evidence file, no commit
  of its own. Dead by the overlap-guard rule. Released as abandoned,
  worktree removed, branch deleted. NOTHING RECOVERED: no report,
  commit, or evidence survived it, so per the loop-closeout skill
  this run is a clean re-run, not an adoption. The registration was
  created ~1 min after the r207 adoption finished (01:55Z) — likely
  the 20:00 CST occurrence registering then dying immediately (same
  shape as the 2026-10-11 coordinator death ~1 min after creating
  its lock). No lock file from that occurrence survived.
- REGISTRATION QUEUE: this run's own `worktree-release.sh` blocked
  ~3 min on REGISTRY.lock while Lane A registered `journey-deepening`
  (its `git worktree add` grinding under heavy concurrent git load);
  the lock is held for the whole registration. Queue, not wedge —
  the release proceeded once Lane A finished. Noted, not chased.
  Own registration took ~3.5 min for the same reason (lock queue +
  `git worktree add` under load). Heartbeat confirmed landed
  03:05:24Z; hbloop every 7 min (journey2-crisis-hbloop-r208.sh).

## Panel (binding, prereg)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14451–14455,
  sequential. Pilot 14451–14453 first, expanded to 14454–14455 (the
  instrument held: smoke green, no instrumentErrors, stranger
  counters populating). Whole panel ran in ~2 min (seeds 10–19s each
  — villages die early; the 2h budget was never the panel, it is
  the gate).
- Driver: r201 driver verbatim except r208 filenames/paths/seeds,
  ORIGINS map keys (all five seeds keyed — Seattle/Boston/Austin/
  Chicago/Phoenix), EVID path 2026-11-14, DAYS 150. RUINROAD env OFF
  (arm parked — cumulative 0/301 is a proven constraint; the supply
  question lives with the medicine build brief).
- Analyzer: r201 analyzer verbatim except r208 filenames/paths.
  Validated on r201's JSONs before the panel: carried numbers
  reproduce exactly (gorge 80, convos 39, fab 0, sorties 17,
  deltaBad [], drift unknown 0, D1 delayed 19/19, Q6 id-matched 0).
- Driver diff vs r201: 64 lines, renames only (seed numbers, r201->
  r208, EVID path). One mechanical-rename artifact in comments: a
  probe note now reads "seed 14451 d16" (was 14441) — comment only,
  no behavior.

## Village assessment (plain words)

Five villages, all hit hard, none held to the horizon. They died
young — d77, d80, d84, d112, d114 (median 84d; r201's median was
109d with one horizon survivor). Raids fired on every seed (5–8
each, 36 total); gorge nights totaled 100 (r201: 80). Sorties
fought 22 times. Villages bent the way r201's did — fought, moved
on, starved, died in the wild — only sooner. Deaths were the wild
above all (roughly half of every village's dead), then monsters,
then the arena, then wounds that wouldn't close, thirst and
starvation. Two villagers on seed 14453 died to their own village's
pit trap. No siege-mechanic failure, no softlock (0 softlock
seeds). The medicine picture is unchanged and stark: 0 ruin
searches across the panel, 0 medicine found, 0 pharmacy days; the
healer's ability did all the curing (49 ability cures, 0 medicine
cures). No alien kills on any seed (stranger channel VACUOUS again).

The median-death-day shift (109 -> 84) is DESCRIPTIVE, not a
fix-effect claim: n=5 each, distributions overlap (r201's low end
was d81), and no single cause dominates the shift — the wild leads
both panels. The base changes since r201 (Reunion arena re-tune,
r206 invite-small, r132 nod-loop, r139 spotter wiring) are all
plausible contributors and none is isolated by this panel. Do not
cite this panel as proof any of them moved survival.

## Verdicts (against the prereg)

- D1 DRY CENSUS — GO: 38 transcripts, 0 dry lines, deflect_q 0.
  r192's five ledger-aware pool fixes hold in the wild on fresh
  seeds; the r206 invite-small + r132 nod-loop fixes introduced no
  new dry surface.
- Q6 — DESCRIPTIVE ONLY (retired r201): gorge-after-clear
  (id-matched) 0/5, the seventh consecutive zero panel. Reported,
  never judged.
- C1 (bend, not break) — GO: every game-over has a named cause that
  is NOT a siege-mechanic failure; 0 softlock seeds. No horizon
  seed this time (descriptive, not a bar).
- C2 (episodes fire + gates hold) — GO: raids on all seeds; fought
  resolutions present; D1 snapshots 20/20, delayed >= 3 attempts
  20/20; D5 deltaBad empty; D3 drift unknown 0.
- C2b (linger-conditional gorge/sortie) — GO: every
  boundary-firable case judged on gorge+sorties, all 5 seeds.
  Refused sorties (5) all carry a reason: gateOneShort 2,
  supplyEmpty 2, availabilityDrain 1.
- C3 (people check) — GO: all 38 driven transcripts read in full;
  fabricHits 0; conversations meet the meaning bar. No voiceLine
  prefix stacking >= 3, no double confession, no naming-stance
  wobble sighting. Non-verbal conversations (Mia, Daniyar, Petra)
  thin gracefully — the r132 nod-loop fix holds, no loop.
- C3b SETTLED-FAVOR CONFIRM — GO: no "settled" close line fired on
  a sitting whose favor was undone (no settled close line fired at
  all this panel; the only "settled" lines are "Nobody's settled
  it" — honest unsettled-matter lines — and monster-naming lines).
  The r201 gate confirms on fresh seeds.
- F1 LAPSE-LABEL STALENESS — REGRESSION FOUND, FIXED IN-RUN
  (sibling surface to C3b, same root cause): one "circled back"
  line fired naming the WRONG favor — seed 14452 d34, Hank: the
  sitting was entirely about wound care (heal_help, declined) but
  the goodbye nod said "Glad we circled back to that foraging
  help." Root cause: the `want` thread is labeled by the favor it
  names, and the favor changed between planting (d10 forage) and
  circling back (d34 wound care); convoNoteTopic recorded
  lastLapsed with the STORED lapsed label (was.label) even though
  the caller passes the live label (convoTopicLabel). The same
  staleness sat in lastClosed, where a stale label bypasses the
  r201 favor-want gate (the gate matches the thread label against
  the current favor's label — a stale label never matches, so the
  gate never withholds and a false settlement can name the old
  favor). Fix (this landing): for `want`/`request` threads,
  convoNoteTopic records the live label the caller passes; every
  other thread keeps its stored label. Proof test
  scripts/test-journey-crisis-r208-lapse-label-20261114.js 9/9
  (seeds 4242, 7, 42; RED verified on unfixed code — the test
  reproduces the exact wild line — then GREEN after the fix; cases
  cover the Hank shape, the matching non-favor shape, the latent
  settled-line bypass, fulfilled-favor settlement under the
  current name, unchanged-favor lapse, and non-favor want lapse).
  r201 settled-favor regression test re-run 9/9 on all three
  seeds. Postfix verification on seed 14452: exactly one
  transcript difference (the d34 line now reads "that wound
  care"), per-seed JSON byte-identical, days 84 and end identical
  — the fix spends no RNG and moves no trajectory.
- WRAP-CHECK — GO: 38 transcripts, 38 marked, 0 unmarked.
- C7b — reported: buried list + corpse-cause counts per seed in
  the analysis (famine 1, disease 0, wound 3, thirst 2 across the
  panel; the wild dominates everywhere).
- A1–A6 stranger counters — DESCRIPTIVE: 0 kills, 0 silent, 0
  cooldown violations on all 5 seeds; panel verdict VACUOUS.
- S1–S5 SUPPLY — NOT RUN (RUINROAD parked). Cumulative stays 0/301
  for the arm; this panel adds 0 searches, 0 medicine. The supply
  question is owned by the medicine build brief.
- R181 fight-1: okSorties 15, brokeAfterFight1 7, cleared 8;
  multiMonsterCleared 5/9 (r201: 12/5/7, 5/9 — identical
  multi-monster rate). R186 eligibility: encounter-eligible
  days 0 on all seeds (the channel never opens under home-based
  play — carried).
- ARENA WATCH — reported: 5 arena deaths on 2/5 seeds (14452: 1,
  14454: 4), 0 on the other three. No Reunion-arena fight record
  in the driver data, so no Reunion attribution for the arena
  deaths. Wild Reunion raid-fights (defense list, not arena): 4
  total — Olivia d52 vFlee (vTaken 80), Daniyar d95 vFlee (vTaken
  108), Xavier d104 vFlee (vTaken 92) on 14454, Jenny d90 vDie
  (vTaken 71) on 14455. Villagers flee the wild Reunion after
  taking heavy damage; one died to it. Wild Reunion is untouched
  by the arena re-tune (arena-only by design); the wild balance
  question is Steve's standing holistic-Reunion call, not this
  leg's.

## Reachable / fun / winnable

- Reachable YES: raids, gorge nights, sorties, favors, mourning,
  betrayal investigations, party namings all fire on ordinary
  seeds; the crisis leg's content is all reachable.
- Fun YES: villages fight, move on, talk like people (38
  transcripts, 0 fabrications, 1 fixable mislabel caught and
  fixed); confessions land, mourning names the dead, parties get
  named and take roles. The leg bends — it just breaks sooner this
  panel.
- Winnable NO (this leg): 5/5 game-over, 0/5 national — the crisis
  leg is not a win path on its own, and was never meant to be.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree: 329 passed, 11 failed in 1774s
(evidence/2026-11-14/journey-crisis-r208-gate-quick.log). The box was
heavily loaded throughout (Lane A gate + proofrefresh balance panel +
ove48 driver concurrently; load avg ~11).
Adjudication — 0 attributable. Standalone re-runs below were finished by the adoption run on the same tree (logs evidence/2026-11-14/journey-crisis-r208-standalone-*.log):
- scripts/godpath/test-measurement-proof-update.js — proof staleness
  (standing set; any src/js change stales the neutrality proof inputs;
  round 16 refresh owed, not a defect of this fix).
- scripts/godpath/test-measurement-workflow.js — proof staleness
  (standing set; same cause).
- scripts/godpath/test-phone-frame-proof.js — receipt staleness
  (standing set; receipt predates the rageprecheck + r191 + fusionoffer
  landings; refresh needs a browser run, out of scope here).
- scripts/godpath/test-measurement-cache-flags.js — STANDALONE PASS 4/4 (load artifact confirmed; AGENTS.md 2026-11-12 lesson).
- scripts/godpath/test-trust-observer-neutrality.js — STANDALONE PASS 6/6 (r208's attempt truncated at 166 bytes when the coordinator died; adoption re-run completed it).
- scripts/godpath/test-living-garden-deed-attainment.js — 120s load
  timeout in the gate; STANDALONE PASS 8/8.
- scripts/godpath/test-one-person-army-deed-attainment.js — 120s load
  timeout in the gate; STANDALONE PASS 7/7.
- scripts/godpath/test-occupation-panels.js — 120s load timeout in the
  gate; STANDALONE PASS 25/25.
- scripts/godpath/test-time-save-crashes.js — 120s load timeout in the
  gate (recovery lines printed, then killed at the cap); STANDALONE
  PASS 5/5.
- scripts/test-synergy-stall.js — 120s load timeout in the gate;
  STANDALONE PASS (exit 0, 0 failure markers; diagnostic-style output, no pass-count line).
- scripts/test-capable-bot-20261014.js — 120s load timeout in the gate;
  STANDALONE PASS 42/42.
No failure names a conversation.js behavior: none of the 11 is a
conversation, thread, close-line, or lapse-line test, and the r208
proof test + r201 settled-favor regression both pass 9/9 on three
seeds (re-run by the adoption run: 9/9 + 9/9). Gate GO after adjudication.

## Landing (adoption run, 2026-11-15 ~05:00Z)

r208 died after the gate, before landing: lock (run_id 2026-11-15T02:55:40Z) and registration left stale (heartbeat 03:51:04Z, ~66 min stale at adoption, no live processes), rotation still 6, fix + tests + note uncommitted. Adopted per the loop-closeout skill: stale-lock recovery, tree re-heartbeated (hbloop every 7 min), r208's work verified independently rather than taken on trust — proof tests re-run 9/9 + 9/9, postfix single-seed re-run of seed 14452 to /tmp confirms exactly one transcript line changed (d34 "foraging help" -> "wound care") with the per-seed JSON deeply identical (days 84), standalones finished (8 green above), telemetry re-check QUIET. Closeout after this note: safe-commit, rebase onto master 7ba58d326, proof-test re-run, ff-merge, release, rotation-b 6->7, lock deletion. Merge hash recorded in ~/memory/2026-11-15.md.

## Telemetry

- `node scripts/telemetry-check.js --baseline .../crisis.json
  --current '.../journey-crisis-r208-delayed-seed*.json' --metrics
  defendedFights,playerFights,latelyDefenseCount`: QUIET (5 files,
  3 metrics, no large deviations). Panel sums: defendedFights 93
  (baseline 95), playerFights 0 (baseline 0),
  latelyDefenseCount 0 (baseline 0). Baseline NOT rolled
  (single-panel variance; units check still owed per r201 metric
  review — verify crisis.json units before any roll).

## Metric review

- Dialogue-only fixes are NOT trajectory-neutral while voiceLine
  draws RNG (carried from r192): the r201 fixes spend no RNG on
  the common path; pre/post trajectory comparisons stay
  descriptive, never fix-effect claims. The r208 fix likewise
  spends no RNG — its postfix check (seed 14452, one line changed,
  JSON byte-identical, days/end identical) is a regression check,
  not a fix-effect claim.
- For supply-gated fixes, the unit test is the proof and the panel
  is a regression check only (carried).
- Telemetry baseline units — verify crisis.json units before any
  roll (carried from r201; this run does not roll).
- NEW from this run: the `want`-thread label is a function of the
  CURRENT favor, but the topic ledger stores it as a snapshot —
  every consumer that trusts the stored label can misname the
  favor after a change (lapse line fired here; settled-line gate
  bypass was latent; resume openers read L.open[].label directly
  and were NOT fixed here — no transcript evidence of a stale
  resume opener this panel, but the site shares the root cause
  and is owed a check on a panel where a favor changes within 14
  days of planting). Any future thread-label fix should re-derive
  want labels live at the use site or at record time, never trust
  the stored snapshot.
- Median-death-day movement (109 -> 84) is a panel-level
  descriptive, not a per-change claim: with n=5 and overlapping
  distributions, no lever is isolated by this panel. A future
  crisis run that wants to attribute a survival shift needs a
  matched-seed A/B on one change, not a fresh-seed panel.

## Remaining gaps

- Proof refresh round 16 owed (carried from r201; more keys stale
  after this landing — conversation.js changed).
- Telemetry baseline re-base owed (carried).
- Lane decision owed on daily-play accept handling (carried).
- Held scale-attr tree remains unlanded (carried, 4+ runs).
- Follow-up: resume-opener want-label staleness (see Metric
  review) — check on a future panel; no fix without transcript
  evidence.
- Open loop question (carried from r201): what copied 5.6 GB of
  evidence into ~/workspace/worktrees/journey2-crisis at ~11:55Z
  on 2026-11-14 — recorded, not chased further this run.
