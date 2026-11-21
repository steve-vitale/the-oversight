# journey-landing r152 — PREREG (Lane A, leg 0 LANDING)

**Run id:** playtest-loop-a-20261121T1950Z (scheduled Sat 2026-11-21 13:45 CST;
started 13:50 CST — scheduler fired late; the run's own clock is 19:50Z).
**Base:** local master `320165c5a` (verified up to date at start; main tree
clean, disk 42%).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg:
establishment.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch
`journey-landing`). Registered 20:01:18Z after the flap cleared (see Flap
below); heartbeat at registration 2026-11-21T20:01:18Z, manual beat
20:05:57Z rc=0. Standing hbloop (pid 33254, setsid-detached, every 5 min)
started 20:06:11Z.
**Lock:** `playtest-loop.lock`, run_id `playtest-loop-a-20261121T1950Z`,
created 2026-11-21T19:50:16Z. None present at start. Delete at closeout in
the same call as its read, only if run_id matches.
**Flap:** window 2 (boot 95e35298, 18:44:21Z–19:53:36Z, ~69 min) blocked the
two prior occurrences (1826Z, 1925Z: 8 failed registrations). This run:
registration attempt 1 (19:52:49Z) failed in the window-2 tail; a brief
window-3 burst at 19:57:42Z killed registration attempt 2 mid-checkout
(158s); window 3 cleared by 19:58:43Z (single bad watchdog cycle);
registration attempt 3 (19:59:40Z) SUCCEEDED 20:03:45Z. Writes verified
OK before registering (fresh /tmp + update-ref + goal-dir probes
19:54:47Z). Flap-watchdog pid 10778 alive throughout.

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1332–1341**. Grep over
`evidence/*/journey-landing-*.md` + `evidence/*/sim-*-prereg.md` for
`133[2-9]|134[01]` plus the range string `1332-1341|1332–1341`; every hit's
context read:
- `133[2-9]|134[01]` hits (30, head-truncated list): 5-digit screens
  `13300–13359` / `13400–13407` / `13400–13799` (sim-lackingline2-b),
  run IDs (`1340Z`), metric values (`max 1340`), screening sets (`31337`),
  commit-hash fragments. None names seeds 1332–1341 as a band.
- Range string `1332-1341|1332–1341`: zero hits anywhere in `evidence/`.
- Word-boundary `git grep` (`\b133[2-9]\b|\b134[01]\b`) over all of
  `evidence/`: thousands of incidental numbers in old JSON corpora/logs
  (kcal amounts 1332–1341, `villagerDays`, `pantryKcal`, line numbers
  `hierarchy.js:1326, :1341`, old seed 1337 screens) — none a band
  reservation; the range grep above confirms no `1332–1341` band naming.
- Contaminated-band lists live in the r149/r150/r151 preregs; none names
  1332–1341. **Band 1332–1341 is fresh.**
  1272–1281 (r149), 1262–1271 (r148), 1252–1261 (r147), 1242–1251 (r146),
  1232–1241 (r145), 1212–1221 (r143), 1192–1201 (r142), 1182–1191 (r141),
  1172–1181 (r140), 1162–1171 (r139), 1142–1151 (r121–r138, deliberate reuse),
  1122–1131 (r119), 1083–1092, 1073–1082, 1063–1072, 1053–1062, 1043–1052,
  897–906 (contaminated), 887–896, 867–876, 857–866, 847–856, 837–846,
  817–826, 797–806, 777–786.

## Q1 (PRIMARY) — regression watch on the post-r151 master, fresh band

Since r151's base (`36d694f13`), `src/js/` changed in 8 files
(`git diff 36d694f13..320165c5a -- src/js/`, +618/−21) — landing-domain
changes in the watch:

- `win-plan.js` +449 — **sim-profilegate-b** (84e57fcc3, GO [needs-eyes]):
  scoped profile-gate relaxation for wave-4+ plan holders. Landing horizon
  is d28, but win-plans form inside it (r151: d14 2/10, d28 5/10) — watch
  whether plan formation at d14/d28 moves, and whether any wave-4+ holder
  plan appears inside 28d.
- `win-plan.js` (also) — **sim-reseedbeat-b** (9145db1ef): expired-plan
  re-seed launch beat — stamps `plan.reseedLaunchBeat`, speaks 'is hunting
  X now — the fire found a new trail' at the launch. Watch: any reseed
  launch beat firing inside 28d, and whether its line reads in context.
- `conversation.js` +27 / `convo-dialogue.js` +29 / `convo-wants.js` +19 —
  **journey-crisis r262 pre-panel fixes** (fa5654ee5): unreachable-flee
  policy (FIX 1 — did NOT hold in r262, reported as regression), deflect-
  promise wording (FIX 2), resume-quote-kind drop (FIX 3), witness-line
  return (FIX 4); plus **succession r262** (a3fe07b25): M12 escalator cap
  fix, staged witness sitting, M4 strip. Watch on the landing band:
  deflect-promise wording in a deflect sitting; resume-quote-kind
  (no bare kind id spoken on resume); a witness line that names someone;
  M12 escalator capping at "circles".
- `fieldFights.js` +24 — **sim-downedtwice-b** (f11b30882, finding #2634):
  downed ally never re-targeted, 'goes down' fires once. Watch: any
  landing fight where an ally goes down twice / is re-targeted after
  going down.
- `villager-brain.js` +44 / `betrayal.js` +44 — **journey-scale r249**
  (59339acbb): owed-walk fix (a vetoed accepted invitation now records an
  owed walk and re-offers it) + march route-around. Watch: an accepted
  invitation vetoed by fever/illness — does the owed walk get named and
  re-offered?
- M1RANGE lever landed then reverted (293d1e794, net zero src change);
  M2STEP2 lever landed then reverted (fdad36c23, net zero). No live
  behavior change expected from either.

**Q1b — WARN_YOU DEFLECT SHAPE (r149 item, carried r150/r151 — fifth
carry):** the r150 warn-heed fix closed the heed path (r151: 4/4 heed
sittings name the danger). The deflect path is still open: r151's Mai
sitting (1326 d7) deflected at turn 0, wandered 15 turns, warning surfaced
at turn 15 via `[alive:want:warn_you]` — reads human, but the re-assert is
still only via the want thread, never unprompted. Remains a design question
(how forcefully a pending warning re-asserts itself); **no fix this run
unless a deflect sitting shows a new defect shape** — else document and
carry with the design decision named.

**Interesting if:** any r151 bar moves on the fresh band; a pocket recurs
(any shape, including sub-threshold); a door-flee fight fires; a fledBad
sample fires with an unpinnable fight; an accepted link-raise parrots or
repeats its opener verbatim; a scholar ends stranded homeward for 2+ days;
a favor with a live need is answered settled; a trail-talk / Wren line
repeats verbatim in one sitting; a second scholar death pattern (deaths >
2); revised M-PR1 > 15%; statedAfterPick ≥ 6; hungry-at-horizon moves from
4/10 either way; any village starts a win-plan inside 28d; a parting-hit
death; a trio party forms inside 28d; a dry `...` line on any turn; a
COUNTER LEARNED line naming a prose-clause descriptor; a confide exit with
no secret shared; a volley line naming the wrong ammo; a mourning beat that
names no one or reads as template filler; a dead-react loop (reactDryCount
gate not holding in live play); a link-accept pool[0] repeat streak; a
doubled 'The' in an outing line; a "the the" article doubling anywhere in
the panel transcripts (r261 regression watch); a 4-person launch or
bow-staged volley (report as lever behavior, not a defect); a settled-favor
help topic that names no favor or speaks a bare kind id; a warn_you sitting
where the danger is never named or never surfaces; an all-fights
refused-turns count > 0 with the binding zero-DMG count at 0 (the Spool
shape recurring); a truly-silent (non-deduped) refused move; a warn_you
deflect sitting that re-surfaces the warning (new behavior — report it);
**NEW this run:** a win-plan count at d14/d28 that moves vs r151 (2/10,
5/10) in either direction (profilegate watch); a reseed launch beat firing
inside 28d; a downed ally re-targeted after going down; a deflect-promise
line that reads as a broken promise; a resume that speaks a bare kind id;
a witness line naming no one; an owed walk never re-offered after a veto.

**Bars (bind, r151 bars carried):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG: **refused-turns 0 BINDS** (v4, zero-DMG fights); stood-through-by-choice
  reported only; raw zero-DMG + B-shape reported as watch.
- Refused-turns all-fights (v4): reported as watch; any count > 0
  is a Q1 investigation item (the Spool shape).
- Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10.
- Pocket: 0 pocket fights BINDS; stuckTurns reported as watch.
- D1 watch: 0 garbled-label renders.
- HEED: legacy count reported; **HEED-V = 0 BINDS**.
- M-PR1 (revised per r143 metric review item 1): never-offered among
  established ask_favor sittings ≤15%, where "established" excludes
  `resolution=unestablished` sittings regardless of final stage; raw
  analyzer rate + max per-seed never-offered reported as watch.
- Personal bridge: 0 repeats in a sitting. Small bridge: 0 repeats.
  Goal bridge: 0 repeats in a sitting (r149 fix regression watch).
- Presshop farUnreached REPORTED only.
- R66 HUNGRY: starvation deaths 0, starvingWarnings 0.
- 1130-d6 amnesia shape: 0 recurrences. Miriam line: 0 "That's settled".
  Deflect-fallback: 0 `fellBack`.
- Nodloop: LOOP=0.
- Q1 panel watch: resume-takes of deflected question-wants re-pose the
  question — report the count; a take that still ends in the generic
  acknowledgment is a Q1 failure on live data. verbatimRepeats 0,
  verbatimRepeatsExempted = re-poses observed; spot-check each exempted
  line against its transcript (a non-re-pose exemption is a Q1 failure).
- **Scholar deaths: ≤2 per 10-seed panel** (fairness adjudication
  recorded alongside). Report count, day, cause, succession latency
  per death.
- **silentTurns (phantom-line detector): 0 on the panel.**
- **Dry-line watch: 0 dry (empty-content) lines in the panel's transcripts.**
  Any dry line is a Q1 failure on live data.
- **FIGHTALLY2 watch:** count landing fights where a second ally joins;
  report the fight-log trigger class for each; any fight with 2 allies
  that ends zero-DMG or stuck is a Q1 failure on live data.
- **Homeward watch (r240 fix):** report end-stranded days per seed; any
  scholar stranded homeward 2+ days is a Q1 investigation item.
- **Door-flee watch (Q1a r146):** 0 fights ending 'fled' where the scholar's
  last step was onto a door tile; the zero-DMG/B-shape analyzer plus the
  fight-log `player-move` entries adjudicate.
- **Link-accept watch (r243 fix):** every accepted link-raise talk ends
  with a voiced accept line (never the player's choice label verbatim).
  Variety reported (pool[0] vs pool[1] split); a 22/1-style repeat streak
  is a Q1 failure on live data (r148 fix regression).
- **Link-opener watch (r248 fix):** no link-raise opener repeats verbatim
  in the panel; report as no-streak + variety (shapes + split) per r151
  metric review — the "no repeat verbatim" wording is over-strict.
- **Counter-label watch (r246 fix):** every COUNTER LEARNED line on the
  panel uses the guarded label (no prose-clause descriptor as a name).
- **Confide watch (r244 F8):** no "This stays between us, right? Right."
  closing a sitting where no secret was shared.
- **Ammo-name watch (#2593):** every volley "has no X" line names the
  weapon's actual ammo.
- **React wind-down watch (r246 fix):** no sitting where `dlg:react` is
  offered at reactDryCount ≥ 2; no verbatim-repeat react loop. Any such
  sitting is a Q1 failure on live data.
- **Settled-help watch (r247 fix):** every settled-favor help topic
  names the favor's short; a bare kind id spoken is a Q1 failure.
- **Deduped-vs-silent watch (r150 instrument):** the r150 move-refusals
  split is reported; a truly-silent refused move (not deduped) is a Q1
  investigation item.
- **Warn-heed watch (r150 fix):** every warn_you sitting where the
  player heeds must name the danger (r151 AFTER: 4/4). A heed sitting
  that ends without the danger named is a Q1 failure on live data.
- **Profilegate watch (NEW):** win-plans at d14/d28 reported per seed;
  any wave-4+ holder plan inside 28d reported with its trigger.
- **Reseed-beat watch (NEW):** any reseed launch beat firing inside 28d
  reported with its line; a beat that fires but stays silent is a Q1
  investigation item.
- **Downed-ally watch (NEW):** any landing fight where an ally goes down
  reported; a second 'goes down' for the same ally in one fight is a Q1
  failure on live data.
- **Owed-walk watch (NEW):** any accepted invitation vetoed by illness
  reported; the veto must name the owed walk and the re-offer must come.
- Pilot first: seeds 1332–1335; expand to all 10 unless the pilot is
  red. Death-aware horizons (dead village stops, +10d tail max).

## Amendment A (19:00Z, before any judged seed) — execution path, not metrics

**Registration blocked by the write flap.** Attempt 1 (18:29–18:39Z,
`timeout 600` wrapper): the orphaned `git worktree add` ground 10 min in
`git reset --hard`, left 41,621/44,867 files 0-byte (flap window 1,
18:36–18:41:14Z), then cleaned itself up on failure (no dir, no admin entry,
no registry entry; branch `journey-landing` exists at `320165c5a`). Attempt 2
(18:42–18:45Z, no timeout, no pipe): failed in 156s on the same branch-exists
+ hidden fallback error — flap window 2 started 18:44:21Z. Flap-watchdog
(pid 10778) confirms window 2 still failing at 18:59:35Z (probes A/B/E/G/H/I
FAIL, C/D/F OK); git update-ref persistently rc=128, so no worktree can
register until it clears.

**Fallback (this amendment): the panel runs from the main tree, READ-ONLY.**
Verified before running: `src/js/` has no `fs` usage (no require('fs'),
no __dirname); sim-harness, policies/competent, and the analyzers make no
file writes; every driver write goes to the absolute OUTDIR under the goal
hidden_files (census/system/transcript paths), and the driver carries the R81
EPERM-retry patch (census/system 90×10s, transcripts 3×5s, other 12×10s).
The executed code is byte-identical to the r152 driver under env overrides
(SEEDS/DAYS/OUTDIR) — only header/defaults differ, and those are frozen in
the committed r152 driver file. Base verified `320165c5a` before the pilot
and re-checked after the panel; if master moves mid-panel the panel is void
and re-runs. All commits (driver, analyzers, prereg, run note, any fix) still
go through the worktree + safe-commit.sh once registration succeeds, or are
left staged in hidden_files for adoption if it never does. Main tree verified
clean (0 dirty files) before and after the panel.

**Transcript loss under the flap (observed):** a diagnostic 1-seed run
(1332, killed after serving its purpose) showed transcript writes failing
3/3 retries with `runConversation ERROR: EPERM` — transcripts are dropped
and the run continues (R81 design). Census/system writes retry 90×10s and
are expected to land. Any transcript lost to EPERM is re-harvested by a
deterministic re-run of the same seeds after the flap clears (same seeds +
same code + same base = same conversations). The run note names every
missing transcript file.

## Closeout (19:17Z) — BLOCKED, no judged seed, prereg NOT frozen on a worktree

**Status:** BLOCKED by the write flap. No panel ran; no game verdict; rotation
stays 0; no commit, no merge, no gate. This prereg was never committed (no
worktree ever registered) — it is staged here in the goal hidden_files for
the next occurrence / adoption to freeze verbatim (bars, seeds, questions
unchanged; only the run header's registration/heartbeat lines need filling
in once a worktree exists).

**What happened (times UTC 2026-11-21):**
- 18:26Z machine restarted (boot 95e35298, third restart today). Run started
  18:26Z, lock created 18:28:05Z (run_id playtest-loop-a-20261121T1826Z).
- Flap window 1 ~18:36–18:41:14Z killed registration attempt 1 (41,621/44,867
  files 0-byte; self-cleaned). Flap window 2 started 18:44:21Z, still failing
  at 19:15:54Z (~31 consecutive watchdog cycles, ~31 min) — probes A/B/E/G/H/I
  FAIL, C/D/F OK; git update-ref persistently rc=128.
- Registration attempt 2 (18:42–18:45Z) failed in the window-2 onset.
- Fallback (Amendment A): pilot from the main tree, read-only, verified
  no-fs in src/js. Two attempts exited 1 in <1s with empty logs (stdout to
  the EPERMed log file kills node silently — async stdout write failure);
  a diagnostic 1-seed run via pipe proved the driver runs and the sim is
  healthy (seed 1332, Willie, d1–d3 fine), but transcript writes fail 3/3
  retries (`runConversation ERROR: EPERM`) and land as 0-byte husks.
- Timing probe (seed 1332, 19:10–19:17Z, killed): 6+ min for one seed, 6
  files all 0 bytes (system + transcripts d1/d2/d3/d4/d6), census never
  written. A 10-seed panel during the flap is infeasible (60+ min, no
  transcripts) — the Q2 people check cannot be done on a husk corpus.
- Lock deleted at closeout (same call as its read, run_id matched). Main
  tree verified clean, HEAD 320165c5a throughout. Branch `journey-landing`
  exists at 320165c5a (created by attempt 1); no registry entry; no worktree
  dir. Next run: re-run worktree-register.sh (it attaches to the existing
  branch via its fallback), then run /tmp-staged clone script, freeze this
  prereg, and play the panel. The pilot OUTDIR husks were removed at
  closeout; the pilot/full OUTDIRs exist empty.
