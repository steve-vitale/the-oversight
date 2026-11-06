# journey-scale r105 — run note (lane A, leg 3 SCALE)

**Run id:** laneA-scale-2026-11-06T1900Z (scheduled 12:45 CST 2026-11-06).
No prior lock existed, so no stale-lock recovery. Main tree clean,
disk 29%. Base master@5ba7f167f at first scored seed (worktree
created on master@8a975ad45, rebased onto 5ba7f167f BEFORE any seed
ran — the bond-initiation branch landed mid-setup, 15 commits; no
overlap with the r104 driver/analyzer/policies this run clones;
prereg base line amended before the prereg commit). Rotation read 3
-> scale; 3->0 written at closeout on success only (see closeout).
Prereg: evidence/2026-11-06/journey-scale-r105-prereg.md (committed
f4625fb1e BEFORE any scored seed ran; proof test 40/40 — 31 carried
r104 checks + 7 FILL_ARM checks + 2 fill-counter emission checks
after the driver fix, see below). Heartbeats: registration ~18:49Z,
600s loop throughout (verified alive at each commit).
**Service note:** the first worktree-register attempt stalled ~9 min
on the registry flock (Lane B's heartbeat held it; the `git worktree
add` checkout itself is slow, 4.9G) — same class as r104's stall, no
work lost.

## Mid-run standing context (received during this run)
- **V-INIT-BOND LANDED 2026-11-06 (merged 5ba7f167f, rides the next
  ship):** villagers propose bonds (warmth 15–49, at visits / daily
  pair tick / talk requests to the scholar) and raise village-link
  ideas; targets decide by character (5–95%). This panel runs ON
  that base, so any NPC-initiated bond proposal in the sittings is
  the live system, not the old blank. No proposal was observed in
  the 2 sittings read (Q3) — reported, not judged: proposals happen
  at visits/pair tick/talk requests, not only in sittings.
- **DRIVE BRIEF, CAVEATED FORM (Steve 2026-11-06 13:11 CST):** the
  self-improvement drive is a LEANING bent by conditions, never an
  on/off rule — wounds/wear first, gear + food prep before hunting,
  pair-banking may express as mentoring/accompanying/building a
  SECOND killer, village need can defer but not erase, personality
  bends the shape, rumor is not knowledge, scouting and hunting are
  different trips. A builder brief, not a scale-leg metric; no
  verdict here rests on it.
- **Alignment synthesis refresh (2026-11-06):** plain-words
  explanations on first use for any standing shorthand (the
  pellet-bearer exchange). Applied in this note: every term below
  gets its plain meaning before it is used.

## Q1 — FILL ARM vs MATCHED CONTROL (primary, binding)

**Verdict: PASS (pre-registered threshold).** Control dry 2, arm
dry 0, and no arm seed survives shorter than its matched control.

| seed | control dry | arm dry | control end | arm end | arm fills |
|------|-----------|---------|------------|---------|-----------|
| 95901 | 2 | 0 | d72 regional | d126 **global** | 8 top-ups, 16L, 5 unloads |
| 95902 | 0 | 0 | d83 regional | d83 regional | 0 top-ups (skipFull 3) |
| 95903 | 0 | 0 | d42 village | d42 village | 1 top-up, 1L |
| 95904 | 0 | 0 | d68 regional | d68 regional | 0 top-ups (skipStudy 19) |

- **The arm fires and the dry walk-outs are gone.** Control dry =
  2, both on 95901 (d68, d69, RETRY trips to village_spl_32_39763,
  packW 0→0, cistern 0/0, refusals "cistern-dry" ×4/×3). Arm dry =
  0 on all four seeds, walk-outs 13 (wet 13). The arm's fills land
  exactly on the dry days' shape: 95901-arm RETRY walk-outs d63
  (packW 0→3, cistern 11) and d66 (packW 0→3, cistern 5).
- **The footprint is real and large — positive this time.** 95901
  arm lived 54 days longer than its control (d126 vs d72) and
  reached GLOBAL; the other three seeds are day-identical. The
  prereg's bound was one-sided (no shortening > 10 days) and is met
  literally — no seed shortened — but a +54-day divergence is the
  same stream-perturbation class as r102's −23 days, opposite sign.
  The arm does not merely remove dry departures; it re-rolls the
  village's fate on the one seed where it matters. A default-fill
  decision cannot rest on this quad alone (see metric review).
- **The mechanism on 95901, as far as the trace reaches.** The two
  runs share deaths identically through day 18; the divergence
  starts with the fills. Night pack water 1.3–1.4L (arm) vs 0.6L
  (control); overnight drinks 1.0–1.1 vs 0.5. The control died on
  day 72 **five days short of its covenant national beat**: it held
  3 seasoned covenants at trust 84–88 (formed d26–28, seasoned
  ~d56–58) and the rung was 5 days short (networkLiveDay + 30) when
  the village died. The arm lived past those five days and staged
  the covenant national beat on day 77 ("Four fires. NO head.
  Interesting. GOVERNANCE LAYER: online") and the Watchers global
  beat on day 78. First national AND first global in the r102–r105
  scale line. The arm's covenant trust at the end (58/58/44) is
  LOWER than the control's (88/88/84) — the arm did not win by
  tending; it won by surviving. tendPeer is 0 on the arm 95901:
  three covenants seasoned with zero tends, because the village
  lived long enough for weekly ticks and crisis answers to
  accumulate.
- **What the arm does NOT fix.** Dry NIGHTS persist: arm 95901
  still slept out with packW 0 on 6 nights (d47 56→0, d52 95→31,
  d59 86→22, d66 86→28, d69 86→22, d71 58→0). The fill fixes the
  departure, not the overnight — the scholar drinks the pack dry
  during the day and sleeps out empty. The control's one
  dehydration death is gone in the arm (0 vs 1), but the dry-night
  shape is unchanged.
- **The tend question narrows further (descriptive).** 95901-arm
  seasoned 3 covenants with tendPeer=0. On seeds where links are
  healthy, time seasons them; tending was not the binding
  constraint on this seed — survival was. The tend cadence/gate
  question (r104 item b) stays open, but its premise weakens.

## Q1b — DRAIN SEPARATOR (report-only)

**The separator holds.** The exact-14 residual REPRODUCES a fourth
time: 18 nights control + 24 arm = 42 nights at drain exactly 14
(1 drink, hyd 100→86, same signature as r102/r103/r104). Nights
with pack water drink and drain mildly; nights without drain hard
(arm 95901 dry nights above: 56–64). No multi-day dry stranding of
the r103 92701 class reproduced.

## Q2 — CENSUS CONTINUITY (report-only)

| seed | control end | arm end | rank C / A | seat | arc | seasoned peers (final) | scatter gap |
|---|---|---|---|---|---|---|---|
| 95901 | d72 pop 0/0 pantry 0 | d126 pop 0/0 pantry 0 | regional / **global** | none | 3 | C: lead 1 + cov 3 (88/88/84); A: lead 1 + cov 3 (58/58/44) + trade 1 unseasoned | link d25, Dawn d47 |
| 95902 | d83 pop 0/0 | d83 pop 0/0 | regional / regional | none | 3 | 1 lead seasoned; cov 0/3 (41/40/36) — identical both quads | link d25, Dawn d47 |
| 95903 | d42 pop 8/8 | d42 pop 8/8 | village / village | none | 3 | 0 (lead 34 C / 24 A, unseasoned) | link d25 |
| 95904 | d68 pop 1/1 | d68 pop 1/1 | regional / regional | none | 3 | 0 (lead 25, unseasoned) | link d25, Dawn d47 |

National staged 1/4 arm (95901 covenant, d77), 0/4 control.
Global 1/4 arm (d78), 0/4 control. courtNational answers 1 (arm
95901). BELONG still untested (belong=- on all rows in both quads).
No full seat, no wave-5 content faced, no kill claimed on any seed.
Deaths fight-heavy on every seed (95901 control: 58 deaths, 29
villager-combat + 9 combat; arm: 68 deaths over the longer life).
95904 is the retry-churn seed again (21 pilgrimages, 19 studies,
identical both quads — the fill gate declined 19 study days there,
so the arm never fired and the trajectories match exactly).
tendPeer: 95902 fired 6× in BOTH quads (identical); 0 elsewhere.
95902's tendPeer=6 with 0 seasoned covenants — tending fired and
trust rose, but the covenants formed too late (d59–72) to season
before the village died d83.

## Q3 — PEOPLE CHECK (sense law)

Corpus: **2 sittings read in full** (arm 95901, the only seed alive
at day 90/120 — the control has NO day-90/120 sitting: all control
seeds died before day 90. Per the prereg, the arm quad's transcripts
are read when the control has no surviving sitting). REAL on both.

- **Day 90 Elif (95901-arm, hotel housekeeper, prickly, trust 43,
  ask_favor stage 2, fromSeed):** opens "Something's different
  today. Can't quite place it yet." — thin; the ask itself is never
  voiced in the sitting. The picker commits ("I'll come back to
  help") and the stock promise-accept line fires ("Thank you. I
  won't forget who fed me when it mattered.") — **sixth panel
  running**. Thin but coherent; the want advances stage 2 → 3.
- **Day 120 Deepa (95901-arm, carpenter, mischievous, trust 91,
  ask_favor stage 1):** a real ask — "I'm sorry — whatever this is,
  it's getting worse — I'm feverish, a cut gone hot and angry. Can
  you do anything?" The picker commits, she thanks. Short (two
  turns) but REAL: a person with an infected cut asking for help,
  grounded in the village's state, no fabricated history.
- **V-INIT-BOND carried:** 0 proposals in 2 sittings. Not a
  verdict on the landed system (proposals happen at visits, the
  daily pair tick, and talk requests — a sitting is not the only
  venue). The bond system is live in this base; this panel's
  sittings simply show none.

## Q4 — WATER CONTROL (report-only)

Walk-outs: control 13 (dry 2, partial 0, wet 11), arm 13 (dry 0,
partial 0, wet 13). The phenomenon reproduced on the control (2
dry) and the arm eliminated it — these counts ARE Q1's instrument.
FIRST-vs-RETRY split: control dry are both RETRY (d68/d69); the
arm's two RETRY walk-outs on 95901 (d63/d66) went out wet (0→3).
95904's retry churn is identical in both quads (the fill gate
declined 19 study days; the scholar's 21 pilgrimages to the same
village never got a fill because the walk-imminent gate never
opened on a day it needed water).

## Village assessment, in plain words

Four villages, and the story split in two this time. Three of them
are the same village twice over — the same deaths, the same days,
the same endings, with or without the water bottle. The fourth is
the whole run. In one version it dies on day 72, five days short
of becoming a nation: three league friendships already seasoned,
trust in the eighties, the rung just out of reach, the scholar
walking out thirsty to the same far village for the third week.
In the other version the scholar tops up the bottles before walking
out — eight times, sixteen litres — and the village lives fifty-four
days longer, sits its first council, hears the Watchers name it,
and dies at day 126 a global fire with no seat and no one left to
sit in it. The other three villages never get the chance either
way: one scatters at day 42 with all eight people still alive, one
ends at day 83 with its league friends too young to count, one
walks the same road to the same village twenty-one times and dies
at day 68. The water helps — it really does — but it helps by
buying five days on one seed, and five days happened to be everything.

## Reachable / Fun / Winnable (leg verdict)

- **REACHABLE — PARTLY, moved one notch.** National staged 1/4
  (arm) and global 1/4 (arm) — the first national/global in the
  scale line since r93–r104's 0/4. Control still 0/4. The ladder
  opens when the village survives past day 77; survival is the
  binding constraint, not trust (control 95901 held 3 seasoned
  covenants at trust 84–88 and still died 5 days short).
- **FUN — YES, with the same honest caveat.** Deepa's fever ask is
  genuinely good, and the first council sitting is a real moment.
  The dull spot is the death band: three of four seeds die before
  day 90 in both quads, so most of the leg's window is never
  played.
- **WINNABLE — NOT YET.** No full seat, no wave-5 content faced,
  no kill claimed on any seed. One global staging is a rung, not a
  win.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
hidden_files/telemetry-baselines/scale.json, metrics
nationalLive,scaleRank: **quiet on both quads (4 files, 2 metrics
each, no large deviations).** Same caveat as r93–r104: that baseline
is an old aggregate shape, so "quiet" means "no large deviation on
these two metrics", not a clean bill — the arm's nationalLive=true
(1/4) did not trip it. Baseline NOT rolled forward.

## Metric review

- **No pre-registered metric was re-scored mid-run.** Q1 is judged
  exactly as pre-registered (PASS: control dry ≥ 1, arm dry 0,
  footprint bound met — no seed shortened).
- **Footprint bound review (proposed for r106):** the prereg's
  bound was one-sided (arm end day ≥ control end day − 10). The
  arm's +54 days passes it literally, but a 54-day positive
  divergence is the same stream-perturbation class as r102's −23
  days. PROPOSED: judge footprint as |delta| with a two-sided
  bound, or report the divergence magnitude alongside the verdict
  rather than inside it. Not re-scored here.
- **Analyzer PREFIX defect (caught, no verdict rested on it):** the
  driver hardcodes the r105 filename prefix; EVIDIR only changes
  the directory. My first arm-analyzer invocation used PREFIX
  journey-scale-r105-arm and read nothing (all zeros, all
  undefined); re-ran with PREFIX journey-scale-r105. The r104
  analyzer's usage comment invites the same mistake ("pass the
  control EVIDIR and PREFIX journey-scale-r99"). Next run: pass
  the DRIVER's prefix, not the directory suffix.
- **Driver clone defect (fixed mid-run, before the arm quad):** the
  r104 driver dropped the r102 fill-counter census lines, so the
  analyzer printed '?' for fillTopUps on the first control run.
  Fixed (commit 858c4252b, +2 proof-test checks), control re-run
  byte-identical except the 5 new zero fields. The prereg commit's
  tooling is the pre-fix version; the fix commit is recorded here.
- **Tend premise weakens (descriptive):** 95901-arm seasoned 3
  covenants with tendPeer=0. The tend cadence/gate question (r104
  item b) stays open, but on seeds where links are healthy, time
  seasons them — tending is one path, not the only path.
- **Stock promise-accept line, sixth panel running** (see Q3):
  "Thank you. I won't forget who fed me when it mattered." fires
  after every food promise. Same class as r106–r109 — a fix follows
  only if it is a clear ledger defect with a proof test.
- **Safe-commit index clobber struck on EVERY commit this run**
  (6 commits, 6 clobbers; one index.lock contention with a
  sibling's register at 19:15Z). Every commit's content was correct;
  every repair verified by hash-object == HEAD blob. The clobber is
  now the norm for safe-commit, not the exception — worth a look by
  the main session, not this run.
- **Heartbeat loop held** (600s, nohup, verified alive at each
  commit; registry heartbeat fresh throughout).

## Harness

Policy: scalecourt-nogate-morntrace3 (control) vs
scalecourt-nogate-morntrace3-fillnarrow (arm) — diff-verified: the
only behavior delta is topUpBeforeWalk. Both quads TEND_PEER=1.
Driver: scripts/journey-scale-r105-20261106.js (r104 driver,
labels/seeds/EVIDIR only + FILL_ARM env switch + fill-counter
census emission). Analyzer:
scripts/analyze-journey-scale-r105-20261106.js (r104 analyzer,
labels only + default EVIDIR date fixed to 2026-11-06). Proof:
scripts/test-journey-scale-r105-natgate-20261106.js (40/40; not on
the green list, same precedent as the r102/r103/r104 proof tests —
do not add it). Per-seed evidence: evidence/2026-11-06/
journey-scale-r105/ (control) + journey-scale-r105-arm/ (arm) +
analysis txt. Prereg + this note in repo evidence/2026-11-06/.
Smoke seed 95900 × DAYCAP=45 proved the driver (pilgrimages=2, 45
natGate rows; smoke outputs deleted per the r103 precedent). Pilot
seed 95901 control passed (no crash, pilgrimages=3). Determinism
check: control re-run after the driver fix was byte-identical
except the 5 new zero fill-counter fields. Duplicate-day note: the
daily hook fires twice on day 2 across ALL watches (pre-existing
r99 lineage behavior), so nat-gate counts carry +1 row on day 2.
Disclosed; immaterial (1 row per seed).

## Closeout (filled after the check gate)
- check.js --quick: 282 passed, 8 failed in 1024s (log
  evidence/2026-11-06/journey-scale-r105-checkquick.log). All 8
  adjudicated, none new — the same family as r104's 9 minus
  test-measurement-cache-flags, which PASSED this run: 6 standing
  pre-existing (proof-update "Proof source inputs are not current",
  workflow freshness "retained neutrality proof covers the current
  inputs", mobile-combat-cadence "Continue does not wrap the
  announced round a second time", occupation-panels "real CLI
  workflow completed", phone-frame-proof stale receipt,
  establishment-r20-fixes "next day voices once more: expected 2
  got 1") + trust-observer-neutrality (120.1s TIMEOUT — load, not
  code; the box ran 4+ concurrent checks and Lane B's own check took
  1586s the same hour) + 1 flaky capable-bot (120.1s TIMEOUT, same
  "real capable player combat earns the food deed at first use"
  assertion r109 documented as base-flaky: passed r107, failed the
  278/12 run, timeout-failed r108; seed 42 grants day 36, seed 1234
  unobserved). No failure touches conversation / convo-wants /
  betrayal / hierarchy / scale code or the r105 tooling (the r105
  proof test is not on the green list and was not run by check.js).
  This run changed NO src/js (only new scripts/ + evidence/), so
  none of the 8 can be caused by it.
- Proof test green after the rebase (40/40).
- **Runtime interruption mid-run:** the heartbeat loop and the
  first check-gate wait session died ~20:11–20:15Z (registry
  heartbeat 20:11:11 was the loop's last tick; the /tmp check log
  vanished; a stale register completion was delivered). No work
  lost — worktree intact, all 7 commits present, main tree
  untouched. Heartbeat loop restarted 20:16 (fresh 20:16:42Z) and
  the check gate was re-run from scratch afterwards (282/8 above).
  The lock held throughout (no duplicate run started).
- Master did not move after the rebase (still 5ba7f167f at
  closeout); no second rebase needed. Merged ff-only (see below).
- Merged locally, pending ship (no bump/push/live-verify — ship loop
  owns those).
- Rotation 3 -> 0 written at closeout, verified by read-back.
- Heartbeat loop killed after release; final heartbeat before
  release verified fresh.
