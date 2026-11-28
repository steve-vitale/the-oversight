# Journey endgame r296 — PRE-REGISTRATION (lane B, 2026-11-28 01:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This is a LEGITIMATE
leg-4 run: the succession r295 adoption closed out ~06:55Z and advanced
rotation-b 7→4; this run plays leg 4 and writes 5, social life, at
closeout ONLY after a verified landing — a failed or partial run does
not advance the leg, per r135/r138/r140/r194 precedent.

Run number basis: the highest journey run number on disk is r295
(succession r295, 2026-11-28); no r296 run note, prereg, probe, or
analyzer exists on master, so r296 is free.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-28T06:55:41Z (run_id playtest2-20261128T0655Z).
- Main tree: `git status --short` at 06:55Z CLEAN (0 files).
  Disk 52% (fail line 85%).
- `git pull --ff-only`: "Already up to date." HEAD bcf06e019.
- `bash scripts/worktree-reap.sh`: SKIP — registry lock held by
  another reaper run (consecutive skips: 1). No cleanup this run,
  nothing reaped, lock NOT touched.
- Machine restart: YES, ~07:13Z (uptime 5 min at 07:18Z; the exec
  service restarted mid-run once). The lock file survived on disk,
  intact (run_id + timestamp verified after the restart). No
  heartbeat was owed yet (no worktree registered before the
  restart). The 07:14 worktree-reaper cron run held the registry
  lock from 07:14; registration queued behind it.
- Registration: `worktree-register.sh journey2-endgame` — slug
  journey2-endgame per the r263–r275 endgame precedent (the
  journey2-4 path is blocked by an unregistered orphan worktree
  at branch journey2-4, fully merged to master, dirty with staged
  deletions of files already deleted from disk — see run note;
  left alone, flagged for the reaper/owner, NOT force-removed).
  Worktree HEAD == master bcf06e019, clean. Heartbeat landed at
  registration.
- Heartbeat loop: hbloop (setsid nohup, every 5 min, r296 script),
  log at `evidence/2026-11-28/journey-endgame-r296-heartbeat.log`
  in the worktree.
- Write flap: no hits so far this run (lock write + registry reads
  went through). Writes are verified per commit, not assumed.

SUBSTRATE: master 6dc7304ae EXACTLY (worktree HEAD). Master moved
under the run between the 06:55Z pull (bcf06e019) and the 07:24Z
`git worktree add` (sim-winflee-b Loop A adoption landed
6dc7304ae); the worktree was created from the then-current HEAD,
per worktree-register.sh. The bcf06e019..6dc7304ae delta is 4
sim-winflee-b commits, scripts-only (analyzers, drivers, panel
builder, proof test — 2934 insertions, zero src/js changes), so
the endgame panel measures the same game as bcf06e019. No fix arm
pre-filed this run. A defect the panel surfaces is filed as an
F-item and fixed only under the r147 rule (planned before scored
seeds, own proof test, judged on the post-fix panel); a mid-run fix
otherwise gets its own proof + a re-run of affected passes, recorded
in the run note.

## What this run does NOT do (anti re-proof)

r263 ran the full 24-seed four-pass panel with ALL GO verdicts, and
r264/r267/r270/r275 ran tribute-first pilots (r264/r267 VOID, r270
ENGAGED with the first wild tribute delivery converting 1/1, r275
STOPPED) plus the charter census, stall-fates runs, and the W5-FACING
census. Re-running passes A/C/C-wide/D would re-prove proven
constraints (Steve 2026-11-01). This run does NOT re-run them. It runs
ONE new-policy pilot on a FRESH band plus diagnostics that ride the
same sims: the chain as it now plays with the homebody handoff live
(Q1, now with a handoff-case counter — r275 metric review), the
fourth W5-FACING census (Q2), the fifth STALL-FATES run (Q3), M25d
(Q4), and the dialogue holds (Q5, now with the M18b ghost-say scan
— r275 metric review).

## Head deltas since r275 substrate (b24528ae7 -> bcf06e019, plus the
07:24Z move bcf06e019 -> 6dc7304ae: 4 sim-winflee-b commits,
scripts-only, zero src/js — see SUBSTRATE above)

`git log b24528ae7..bcf06e019 -- src/js`: 17 files changed, 1192
insertions, 106 deletions. Classified by reading the log and the
commit messages:

LIVE (behavior changes under the default panel):
(a) JOURNEY-SUCCESSION r291 (7310ab491, [needs-eyes]): mourning
    above the naming debate — t2LatelyEvent grief+mantle blocks move
    above the naming debate (r291 panel: 3/3 staged witness sittings
    served 'naming', 0 named the dead). Live conversation behavior
    (grief beats inside the endgame window).
(b) SIM-REUNIONWILD2-B (b319b350d): Eulogy doom bypasses armor
    (bypassArmor flag; scholar still dies, cheat path intact). Live
    combat behavior (Reunion fights inside the endgame panel).
(c) JOURNEY-DEEPENING r287 (6f5e08bde): bearer-end requirements fix
    + driver cancel-press rule. Live conversation behavior.
(d) SIM-DEPARTFIT-B (827386240): departure-fitness check (arm +
    load before launch, ammo-first, no HP gate). Live launch
    behavior — can change which parties depart.
(e) JOURNEY-ESTABLISHMENT r286 (3fd6e9e70): bearer-end cancel
    offered from any sitting. Live conversation behavior.
(f) SIM-FLEEGUARD-B (90624c800, [needs-eyes]): live-numbers guard
    on the hopeless flee read (FLEEGUARD=1, default OFF). OFF on
    the default panel — no effect unless the flag is set.
(g) JOURNEY-SOCIAL-LIFE r283 (838f3a380, [needs-eyes]): variety
    pools 4->8 + heed dry fix (F6 0, M4 25->9). Live dialogue
    variety inside the endgame window.
(h) SIM-HOLDREPEAT-FIX-A (233d6aceb, [needs-eyes]): day-count-varied
    hold wording fixes stuck-record repeat (#2744). Live dialogue.
(i) SUCCESSION r280 (11dd85e87): drift-note stage directions
    bypass the repeat ledger; mourning second sittings steer from
    the first shape. Live conversation behavior.
(j) SIM-CALLEDNAME-A (c584775e7, [needs-eyes]): drift lines +
    journal speak the use-name (npcName). Live dialogue.
(k) SIM-WORNGUN-RESEAT-B (c329b477d): contest grantWeapon returns
    the displaced worn gun to the pack (GO: destroyed 2->0). Live
    contest behavior.
(l) SIM-DEPARTTEACH-A (6a02c5d9f, [needs-eyes]): departure beat
    teaches companion names via overheard channel. Live dialogue.
(m) SIM-HOLDSPEAK-A (6efa3d560, [needs-eyes]): held departures
    speak — hold verdicts voiced with the real reason, once per
    holder-day. Live dialogue.
(n) LANDING r158 (223af1090): contest-end telemetry —
    _contestDie/_contestRefuse/arena-loss now emit contest_end
    (ledger closes). Instrument + ledger behavior.
(o) SIM-DEPARTNAME-A (bf73c94d9, [needs-eyes]): departure beats
    use true names, not stranger descriptors (descriptors 21->0).
    Live dialogue.
(p) SIM-REARM-WITNESS-B (2b9cadcfb) + SIM-REARM-B (70cffd16f):
    wild-corpse expedition witness channel + prereg + instrument
    (REARM_CELLS=1). Env-gated; OFF on the default panel.
(q) JOURNEY-CRISIS r278 (b75f43fe3): sealed-pocket strike,
    sealed-arena no-flee + alt-close, partial-progress flee,
    debt-closer gate + proofs. Live combat/crisis behavior.
(r) JOURNEY-ESTABLISHMENT r277 (34e1b1d95): warn-heed latch reset
    per sitting (WARN-HEED GO). Live conversation behavior.
(s) LANDING r157 (5d3004abd): close M-PR1 commit-menu residual
    (convo-wants thread flip). Live conversation behavior.
(t) SIM-CELLGATE-FLOOR-B (e23e02fc6): CELLGATE_FLOOR=3 judge +
    floor param + driver floor recording. Env-gated; default
    floor 4 on the default panel.
(u) JOURNEY-ENDGAME r275 itself (9456a8e2c): dead-whisper fix
    (registerDeath dead-mark) + Voice-collapse fix-the-fix
    (godBefore capture). THE fix under test this run: combat-dead
    villagers now read dead to vpOf().dead, so dead contacts stop
    whispering. This run's M18b scan is the post-fix check on the
    same defect class.
ENV-GATED OFF / instrument only (no effect on the default panel):
(v) Version bumps only (2b25d4be0, bf21c1c02, 04918a1e2,
    430fab777, e5dd61e96, f5d2c3caa).
No delta touches table.js, standing.js, progression.js deed gates,
or the capstone paths — the endgame panel measures the same
deed-gate game as r275, with the conversation/combat/launch deltas
to watch.

## Fresh band (local_seed_band_freshness skill)

Band **107758–107765** (8 seeds). Freshness check, run before this
prereg was written:
- Searched all `evidence/**/*.md` preregs/notes
  (`grep -rln --include='*.md' -E "10775[8-9]|10776[0-5]"`):
  ZERO hits.
- Searched goal `hidden_files/**/*.md`: ZERO hits.
- Searched `scripts/` for the band: ONE hit, adjudicated NOT a
  reservation — `scripts/phone-frame-proof.json:90`, a SHA-hash
  substring (`c5f097faccc9039991077590d3e4e10e...`), same class as
  r275's float-substring adjudications.
- Searched `evidence/` filenames for 107758–107765: ZERO hits.
- Collisions recorded so the next worker does not repeat them:
  107649–107669 is Loop A's held band (sim-cellgate-floor-b /
  sim-gatehorizon-b / sim-muster-a coordinator scope 107617–107669;
  candidate 107649–107656 REJECTED on this check);
  107670–107733 sim-cellgate-holdout-b (64 seeds);
  107734–107749 sim-rearm-witness-b staged band (candidate
  107734–107741 REJECTED); 107750–107757 sim-gunholder-census-b
  pilot / sim-guntransfer-b replay (candidate REJECTED);
  107601–107616 departsafe corpus; 107617–107624 muster-a pilot;
  107633–107648 planform-a; 107533–107581 killarrive-b; 107517–
  107532 Loop A's moved shared band; 107509–107516 Loop A's
  shared band; 108001–108008 named as known-used.
- FRESH.

## Questions (frozen)

- Q1 CHAIN-AS-IT-NOW-PLAYS + HANDOFF-CENSUS (primary,
  measurement — the chain with the homebody handoff live): does
  the endgame chain (launch -> wave-4 kill -> living veteran ->
  deed-gate ok -> seat) move vs r275's pilot, and does any
  converted handoff party kill on this panel? Probe policy: Pass T
  verbatim from r270/r275 (FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1
  ARMORYDRIVE=1 CAPABLE_VETGUARD=1 RELAYGREY=1 CAPSTONE=1
  BUYOUT=1 BUYOUT_EARLY=1 TRIBUTE_FIRST=1). NEW this run: the
  probe carries a handoff-case counter (r275 metric review) —
  winPlanHomebodyHandoff wrapped pass-through; cases presented =
  calls returning 'launch'/'hold', converted = 'launch'; the
  analyzer reports presented/converted/holds per seed and links
  each converted launch to a wave-4+ kill by the new leader's
  party in the fight census (best-effort: target species + 30-day
  window after launch; labelled as such). Binding: launches,
  wave-4+ kills, living veterans at sit, deed-gate-ok days, full
  seats, and the handoff census reported per seed; the full-seat
  count is judged DESCRIPTIVELY against r275 (0/4 full, 3/4 won
  lesser, 0 tribute deliveries, 0 handoff firings) — small n, no
  significance bar. A converted-party kill, if one fires, is
  reported as the homebody open thread closing; 0 kills repeats
  the homebody note's finding on a new band.
- Q2 W5-FACING (primary, diagnostic — fourth run of the census,
  from r264's finding): distinct wave-5 types faced per seed at
  the sitting (analyzer-side, from the existing w5FaceEvents /
  facedIds fields — no probe change). Binding: the distribution
  is reported (0/1/2 types faced per seed that reaches the
  table). If w5>=2 holds on fewer than half the pilot seeds that
  reach the table, the gate's w5 bar is named as the binding
  constraint — a DESIGN OBSERVATION, not a defect (the bar is
  Steve's design; the measurement is the finding). Pooled with
  r267 (0/4) + r270 (1/6) + r275 (0/4): the running total is the
  finding (1/14 so far).
- Q3 STALL FATES (carried, measurement — fifth run, in DAYS):
  does the fate split (UNBLOCK/REGRESSION/PERSIST) reproduce on a
  fresh band under the tribute-first policy? Binding: stall-days
  per seed + fate split reported in days (samples / samples-per-
  day, per the r264 units correction); the split itself is
  descriptive. UNBLOCK->full conversion reported against the
  pooled rate (r263 4/6, r264 0/2, r267 0/2, r270 0/0, r275 0/0 —
  pooled 4/10) descriptively.
- Q4 M25d (carried, binding, bar stays <=1): bought-seed losses
  on this run's bought seeds. Pooled 2/24 before this run.
- Q5 DIALOGUE HOLDS + GHOST-SAY SCAN (people check): the head
  deltas are mostly dialogue/narration/combat — the panel
  transcripts are read IN FULL and checked for: deflect-promise
  never-again lines = 0 (r262 fix holds), resume-quote-kind
  mismatches = 0, witness-line 'Names, named.' = 0, settled re-ask
  names the favor, namebeast opens the just-told beast. PLUS the
  new live narration read for sense: the HOMEBODY transfer line
  (holder stays home, new leader + companions + target named,
  once per launch), the GONE-BEARER lines, the M-PR1 commit-menu
  flip, the resume-pick fall-through, the DOWNEDTWICE / FIGHT-STALL
  combat lines, the r291 mourning-above-naming order, the
  departname true-name beats, the holdspeak hold verdicts. PLUS
  the M18b ghost-say scan (r275 metric review, NEW instrument):
  ambient `💬 <Name> says:` lines captured probe-side and
  classified with the same identity-aware rule as M18 (confirmed
  only when a same-first-name death predates the line AND no
  same-first-name death falls on/after the line day AND no
  final-alive roster person shares the first name). The Rosa line
  (r275 F-item) is the positive control: the regex + classifier
  were validated against the r275 107583 transcript before the
  pilot (line 126 matches; Leonor's living `says:` line
  classifies clean). Any confirmed M18b hit is an F-item, not a
  panel verdict by itself.

## Panel plan (pilot-first)

- Probe: scripts/probe-endgame-r296-20261128.js (r275 probe verbatim
  EXCEPT renames r275->r296, dates 20261123->20261128,
  2026-11-23->2026-11-28, evidence dir
  2026-11-28/perseed-endgame-r296, header, substrate comment
  6dc7304ae, + PLAN-map entries 107758–107765 (107758–107759
  'wavesnw', 107760–107765 'waves', per the C-wide band pattern) +
  the r296 instruments below — verified by diff: only renames,
  dates, comment reflows, the substrate comment, the PLAN-map
  addition, and the two instrument blocks).
- Analyzer: scripts/analyze-endgame-r296-20261128.js (r275 analyzer
  verbatim EXCEPT input dir, r275->r296, dates + the M18b-ghost-say
  and HANDOFF-CENSUS sections — verified by diff the same way).
- Clone: scripts/clone-endgame-r296.py (r275 clone script verbatim
  EXCEPT r275->r296 renames, dates, WT path, header lineage; the
  byte/char `robust_write` fix from the r246 adoption is carried).
- r296 INSTRUMENTS (probe-side only, zero src/js — both are the
  r275 metric-review proposals, planned before scored seeds):
  1. M18b GHOST-SAY: in the Game.say wrapper, a second capture for
     ambient lines matching /💬\s*([A-Z][a-z]+)\s+says:/ into
     ghostSayLines {day, companion, line}; classified at summary
     with the same identity-aware rule as ghostHits (shared
     classifier); persisted as ghostSayLines/ghostSayHits on the
     per-seed record; analyzer M18b-ghost-say verdict (same shape
     as M18). Positive control: the r275 107583 Rosa line matches
     the regex and classifies CONFIRMED on the r275 death record;
     Leonor's living says-line classifies clean.
  2. HANDOFF-CASE COUNTER: Game.winPlanHomebodyHandoff wrapped
     pass-through (same pattern as the r72 grantFeastBuff wrapper);
     each call records {day, result, holder, wave, target};
     persisted as handoffCases on the per-seed record; analyzer
     HANDOFF-CENSUS reports presented ('launch'/'hold') /
     converted ('launch') / holds per seed + converted-party-kill
     link (fight census, target species + 30-day window,
     best-effort, labelled).
- PILOT: Pass T on seeds 107758, 107759, 107760, 107761 (2 wavesnw +
  2 waves). If no homebody handoff fires AND no deedGate-ok day
  occurs AND no tribute delivery fires on any of the four (the new
  delta never engages AND the gate never opens AND the tribute
  never fires), STOP per PILOT FIRST — document and move on, do not
  burn the full band. If any engages, EXPAND to the remaining four
  seeds (107762–107765).
- Dark probe: SKIPPED — no delta since r211 touched the dark table
  (r211 skipped on the same reasoning; r219/r225/r230/r233/r237/r239/
  r243/r246/r249/r255/r259/r263/r264/r267/r270/r275 skipped too).
- COMPETENT_PIN=r127 support already in the tree.
- NO A-frozen arm — (l) EXONERATED in r194 and no policy file changed since.
- M2b GREEN from r182 — no re-sweep (carried as proven).
- FIGHTALLY2 stays OFF — this run does not touch it (thirteenth
  sighting stands; the turn-on decision is owed, not taken here).

## Telemetry

Baseline: hidden_files/telemetry-baselines/endgame.json (uw 22 / won 4 /
peakVet 3, per the r263 revert). Telemetry check runs on the Pass T
per-seed glob with the same metrics; baseline NOT rolled without
adjudication (a LOUD line is investigated first, per the body).

## Metric review (to fill at closeout)

- M20 samples-vs-days (r264 correction: report days).
- peakVet baseline (3, per r263 revert).
- FIGHTALLY2 (stays OFF; thirteenth sighting stands).
- M25d (bar <=1; pooled 2/24 before this run).
- NOTICK/CARRY (vacuous, tenth straight zero if it holds).
- M1/M6 on pilots (structural on a 4-seed pilot: M1 needs >=3 seeds
  reaching the window — reachable; M6 needs >=1 deferred sit).
- M23 vs TRIBUTE-FIRST (same fact; r270 resolved the tension by
  engagement).
- W5-FACING (fourth run of the census; no bar, descriptive; pooled
  with r267's 0/4 + r270's 1/6 + r275's 0/4 = 1/14).
- HANDOFF-CENSUS (new this run; descriptive — presented, converted,
  converted-party kills; no bar).
- M18b-GHOST-SAY (new this run; confirmed hits are F-items, not a
  panel verdict by itself).
