# Journey endgame r275 — PRE-REGISTRATION (lane B, 2026-11-23 12:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This is a LEGITIMATE
leg-4 run: the succession r268 finisher closed out ~17:45Z and advanced
rotation-b 7→4; this run plays leg 4 and writes 5, social life, at
closeout ONLY after a verified landing — a failed or partial run does
not advance the leg, per r135/r138/r140/r194 precedent.

Run number basis: the highest journey run number on disk is r274
(crisis r274 + establishment r274, both 2026-11-22/23); no r275 run
note, prereg, probe, or analyzer exists on master, so r275 is free.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-23T17:59:21Z (run_id playtest-loop-2-20261123T1800Z).
- Main tree: `git status --short` at 17:55Z showed 1 untracked file
  (`evidence/2026-11-23/sim-scale-onramp-round-1415.md`, the orphaned
  round record of the dead fleshout 1415Z run — its adoption's gate
  check was killed by the ~17:27Z VM replacement). Per the
  wait-and-recheck rule the run waited; the owning loop committed the
  note as `b24528ae7` at 17:58:36Z; re-check 17:58:51Z CLEAN (0 files).
  Disk 51% (fail line 85%).
- `git pull --ff-only`: "Already up to date." HEAD b24528ae7.
- `bash scripts/worktree-reap.sh`: SKIP — registry lock held by
  another reaper run (consecutive skips: 2, ALERT threshold 3); the
  holder was a live reaper run. No cleanup this run, nothing reaped,
  lock NOT touched.
- Registration: `worktree-register.sh journey2-endgame` completed
  ~18:05Z (started ~18:00Z, ~10.5 min under registry-lock + disk
  contention from sibling loops). Worktree HEAD == master b24528ae7,
  clean. Heartbeat landed at registration (18:05:27Z).
- Heartbeat loop: hbloop (setsid nohup, every 5 min, r275 script)
  started 18:10:39Z (pid 20627), log at
  `evidence/2026-11-23/journey-endgame-r275-heartbeat.log` in the
  worktree. Readbacks 18:10:57Z and 18:20:58Z landed, status active.
- Machine restart: NONE during this run so far. The host was replaced
  ~17:27Z, before run start (uptime 29 min at 17:56Z).
- Write flap: no hits so far this run (lock write + registry reads
  went through). Writes are verified per commit, not assumed.

SUBSTRATE: master b24528ae7 EXACTLY (worktree HEAD). No fix arm
pre-filed this run. A defect the panel surfaces is filed as an
F-item and fixed only under the r147 rule (planned before scored
seeds, own proof test, judged on the post-fix panel); a mid-run fix
otherwise gets its own proof + a re-run of affected passes, recorded
in the run note.

## What this run does NOT do (anti re-proof)

r263 ran the full 24-seed four-pass panel with ALL GO verdicts, and
r264/r267/r270 ran tribute-first pilots (r264/r267 VOID, r270
ENGAGED with the first wild tribute delivery converting 1/1) plus
the charter census, stall-fates runs, and the W5-FACING census.
Re-running passes A/C/C-wide/D would re-prove proven constraints
(Steve 2026-11-01). This run does NOT re-run them. It runs ONE
new-policy pilot on a FRESH band plus diagnostics that ride the
same sims: the chain as it now plays with the homebody handoff
live (Q1), the third W5-FACING census (Q2), the fourth STALL-FATES
run (Q3), M25d (Q4), and the dialogue holds (Q5).

## Head deltas since r270 substrate (ff17699c7 -> b24528ae7)

`git log ff17699c7..b24528ae7 -- src/js`: 6 commits with src/js
changes; `git diff --stat`: 9 files, 403 insertions, 14 deletions.
Classified by reading the diff and the commit messages:

LIVE (behavior changes under the default panel):
(a) HOMEBODY-HANDOFF (f99f9c0c6, win-plan.js +145,
    villager-brain.js +15): a range-0 holder's wave-4+ plan moves to
    a walkable companion at depart time; default-ON, [needs-eyes].
    Certified on band 107455–107470 (pool 3, converted 3/3 = 100%,
    0 solo; guardrails pass). Open thread from its own evidence:
    a converted departure is NOT a kill — 0/3 converted parties
    killed its target, and 2/3 villages were lost within days of
    the departure. This run's Q1 watches the handoff on the
    endgame chain.
(b) WORNSTACK-EQUIP (46370f4d2, game.js +19): scholar equip/unequip
    carries worn stack units (finding #2707); proof 21/21.
    "No player-visible behavior change" per commit. Watch on
    succession-inside-the-endgame (same family as r270's WORNSTACK).
(c) GATEAVOID durable log (a8ff84fd8, villager-agency.js +43):
    durable gate-avoid log + leaderproj re-judge (NO-GO D1
    METRIC-BROKEN). Instrument; behavior-neutral by design.
(d) M-PR1 commit-menu fix (4cd566b21, convo-wants.js +15): engage
    flips thread to 'want'. Live conversation behavior.
(e) Resume-pick dry fall-through (7a2de2e42, conversation.js +44):
    live conversation behavior.
(f) GONE-BEARER (997654392, convo-wants.js +62): a dead bearer's
    joint run is never urged as finishable. Live conversation
    behavior.
(g) Crisis r274 DOWNEDTWICE dedup + FIGHT-STALL flee (a44b47320,
    comms.js +18): aidAllyDown per-ally+day dedup;
    nearest-affordable-edge flee; stall 9->2 after-panel. Live
    combat behavior (fights inside the endgame panel).
(h) Succession r268 stage-2 retry (331a9b5ee, convoTopics.js +54):
    table-dry fix. Live conversation behavior.
ENV-GATED OFF / instrument only (no effect on the default panel):
(i) KILLBUNDLE (97cf9d7c2 + 4773989b9): staged-arrival hook + arm
    test; evidence-only commits, zero src/js. An instrument/arm,
    not live game code.
(j) killarrive / doorstage / muster / planform: diagnostics, zero
    src/js.
(k) build.js version stamps only (batch-ship bump 6d8478d00).
No delta touches table.js, standing.js, progression.js deed gates,
or the capstone paths — the endgame panel measures the same
deed-gate game as r270, with HOMEBODY-HANDOFF + the conversation /
combat deltas to watch.

## Fresh band (local_seed_band_freshness skill)

Band **107582–107589** (8 seeds). Freshness check, run before this
prereg was written:
- Searched all `evidence/**/*.md` preregs
  (`evidence/*/journey-*-prereg.md`, `evidence/*/sim-*-prereg.md`)
  for 107582–107589: ZERO hits.
- Searched all `evidence/` + goal `hidden_files/` for the band:
  100 hits, ALL adjudicated NOT seed reservations — pantry-kcal
  values (`"pantryKcal":107582`, `"pantryFreshAfter":107584`) and
  float substrings inside old data JSONs (census/sweep/panel-case
  files), same class as r270's prereg adjudication.
- Screens: two `screen.jsonl` hits are float substrings inside
  `freshDays` values (`25.205771001075856`, `5.107588701144408`,
  `7.876710758215671`) — not seed names.
- No forbidden/contaminated band list file exists under evidence/.
- Collisions recorded so the next worker does not repeat them:
  107509–107516 is Loop A's shared band (sim-launchsilence-a /
  sim-departsafe-a; r270's 107501–107508 sits inside it — the
  candidate 107509–107516 was REJECTED on this check, named by
  `sim-killarrive-b-prereg.md` + `sim-launchsilence-a-prereg.md`
  and the lever-claims collision record); 107517–107532 Loop A's
  moved shared band; 107533–107581 killarrive 49-seed band;
  107601–107616 departsafe corpus; 107617–107624 muster-a pilot;
  107633–107648 planform-a; 107431–107446 homebody re-judge corpus;
  107455–107470 homebody-metric-a; 107471–107494 screened by B.
- FRESH.

## Questions (frozen)

- Q1 CHAIN-AS-IT-NOW-PLAYS + HANDOFF-CENSUS (primary,
  measurement — the chain with the homebody handoff live): does
  the endgame chain (launch -> wave-4 kill -> living veteran ->
  deed-gate ok -> seat) move vs r270's band, and does any
  converted handoff party kill on this panel? Probe policy: Pass T
  verbatim from r270 (FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1
  ARMORYDRIVE=1 CAPABLE_VETGUARD=1 RELAYGREY=1 CAPSTONE=1
  BUYOUT=1 BUYOUT_EARLY=1 TRIBUTE_FIRST=1). Binding: launches,
  wave-4+ kills, living veterans at sit, deed-gate-ok days, full
  seats, and the handoff census (firings / conversions /
  converted-party kills) reported per seed; the full-seat count is
  judged DESCRIPTIVELY against r270 (1/8 full, 6/8 won, 1 tribute
  delivery, w5>=2 on 1/6 table villages) — small n, no
  significance bar. A converted-party kill, if one fires, is
  reported as the homebody open thread closing; 0 kills repeats
  the homebody note's finding on a new band.
- Q2 W5-FACING (primary, diagnostic — third run of the census,
  from r264's finding): distinct wave-5 types faced per seed at
  the sitting (analyzer-side, from the existing w5FaceEvents /
  facedIds fields — no probe change). Binding: the distribution
  is reported (0/1/2 types faced per seed that reaches the
  table). If w5>=2 holds on fewer than half the pilot seeds that
  reach the table, the gate's w5 bar is named as the binding
  constraint — a DESIGN OBSERVATION, not a defect (the bar is
  Steve's design; the measurement is the finding). Pooled with
  r267 (0/4) + r270 (1/6): the running total is the finding
  (1/10 so far).
- Q3 STALL FATES (carried, measurement — fourth run, in DAYS):
  does the fate split (UNBLOCK/REGRESSION/PERSIST) reproduce on a
  fresh band under the tribute-first policy? Binding: stall-days
  per seed + fate split reported in days (samples / samples-per-
  day, per the r264 units correction); the split itself is
  descriptive. UNBLOCK->full conversion reported against the
  pooled rate (r263 4/6, r264 0/2, r267 0/2, r270 0/0 — pooled
  4/10) descriptively.
- Q4 M25d (carried, binding, bar stays <=1): bought-seed losses
  on this run's bought seeds. r263 read 1/13, at the limit; r267
  read 0/4; r270 read 1/7 (pooled 2/24).
- Q5 DIALOGUE HOLDS (people check): the head deltas are mostly
  dialogue/narration/combat — the panel transcripts are read IN
  FULL and checked for: deflect-promise never-again lines = 0
  (r262 fix holds), resume-quote-kind mismatches = 0, witness-line
  'Names, named.' = 0, settled re-ask names the favor, namebeast
  opens the just-told beast. PLUS the new live narration read for
  sense: the HOMEBODY transfer line (holder stays home, new leader
  + companions + target named, once per launch), the GONE-BEARER
  lines (a dead bearer's joint run never urged), the M-PR1
  commit-menu flip, the resume-pick fall-through, and the
  DOWNEDTWICE / FIGHT-STALL combat lines. Any miss is an F-item,
  not a panel verdict by itself.

## Panel plan (pilot-first)

- Probe: scripts/probe-endgame-r275-20261123.js (r270 probe verbatim
  EXCEPT renames r270->r275, dates 20261122->20261123, evidence dir
  2026-11-23/perseed-endgame-r275, header, substrate comment
  b24528ae7, + PLAN-map entries 107582–107589 (107582–107583
  'wavesnw', 107584–107589 'waves', per the C-wide band pattern) —
  verified by diff: only renames, dates, comment reflows, the
  substrate comment, and the PLAN-map addition; zero other logic
  change).
- Analyzer: scripts/analyze-endgame-r275-20261123.js (r270 analyzer
  verbatim EXCEPT input dir, r270->r275, dates — verified by diff
  the same way; the W5-FACING section, STALL-FATES, TRIBUTE-FIRST,
  and CHARTER-CENSUS are carried verbatim).
- Clone: scripts/clone-endgame-r275.py (r270 clone script verbatim
  EXCEPT r270->r275 renames, dates, WT path, header lineage; the
  byte/char `robust_write` fix from the r246 adoption is carried).
- PILOT: Pass T on seeds 107582, 107583, 107584, 107585 (2 wavesnw +
  2 waves). If no homebody handoff fires AND no deedGate-ok day
  occurs AND no tribute delivery fires on any of the four (the new
  delta never engages AND the gate never opens AND the tribute
  never fires), STOP per PILOT FIRST — document and move on, do not
  burn the full band. If any engages, EXPAND to the remaining four
  seeds (107586–107589).
- Dark probe: SKIPPED — no delta since r211 touched the dark table
  (r211 skipped on the same reasoning; r219/r225/r230/r233/r237/r239/
  r243/r246/r249/r255/r259/r263/r264/r267/r270 skipped too).
- COMPETENT_PIN=r127 support already in the tree.
- NO A-frozen arm — (l) EXONERATED in r194 and no policy file changed since.
- M2b GREEN from r182 — no re-sweep (carried as proven).
- FIGHTALLY2 stays OFF — this run does not touch it (twelfth
  sighting stands; the turn-on decision is owed, not taken here).

## Telemetry

Baseline: hidden_files/telemetry-baselines/endgame.json (uw 22 / won 4 /
peakVet 3, per the r263 revert). Telemetry check runs on the Pass T
per-seed glob with the same metrics; baseline NOT rolled without
adjudication (a LOUD line is investigated first, per the body).

## Metric review (to fill at closeout)

- M20 samples-vs-days (r264 correction: report days).
- peakVet baseline (3, per r263 revert).
- FIGHTALLY2 (stays OFF; twelfth sighting stands).
- M25d (bar <=1; pooled 2/24 before this run).
- NOTICK/CARRY (vacuous, ninth straight zero if it holds).
- M1/M6 on pilots (structural on a 4-seed pilot: M1 needs >=3 seeds
  reaching the window — reachable; M6 needs >=1 deferred sit).
- M23 vs TRIBUTE-FIRST (same fact; r270 resolved the tension by
  engagement).
- W5-FACING (third run of the census; no bar, descriptive; pooled
  with r267's 0/4 + r270's 1/6 = 1/10).
- HANDOFF-CENSUS (new this run; descriptive — firings, conversions,
  converted-party kills; no bar).
