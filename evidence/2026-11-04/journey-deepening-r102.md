# journey-deepening r102 — run note (lane A, leg 2 DEEPENING)

**Run id:** laneA-deepening-2026-11-04T1759CST (lock 2026-11-05T00:03:27Z).
No prior lock existed, so no stale-lock recovery; main tree clean,
disk 31%. Base master@7086b11f2 at worktree creation. Rotation read 2
-> deepening; 2->3 written at closeout via the file-tool path and
verified by read-back (the exec channel could not write). Lock
deleted at closeout per the body's even-on-failure rule. Merge NOT
done — see flap note. Prereg:
evidence/2026-11-04/journey-deepening-r102-prereg.md (written BEFORE
any seed ran) + amendment #1 (pre-scoring: stale-carry split of
G-STEER, written after the smoke seed proved the driver, before any
scored seed). Seeds fresh 94101–94104, competent policy (r100 driver
lineage + r102 goalSnap instruments), DAYCAP=100, death-aware stop.
Smoke seed 94100 x DAYCAP=45 proved the harness (survived day 46,
wave 2, goalSnaps firing, 0 mislabels) and was deleted per the prereg.
Main panel ran ~60s for 4 seeds. Heartbeat: registered + heartbeated
at start; the host write flap (see below) blocked heartbeats from
00:18:32Z onward — the registry write EPERMs and exec-channel writes
truncate to 0 bytes, while file-tool writes land verified. The
worktree holds uncommitted changes throughout, so the reaper preserves
it; a sibling lane-A run would fail slug registration loudly, not
collide.

## Panel verdicts (pre-registered, no re-scoring)

- **G-ASSIGN (primary): MET.** Living villagers with a stored top goal:
  day 45: 25/27 (93%) — 8/8, 6/6, 5/6, 6/7; day 60: 26/27 (96%) —
  8/8, 8/8, 6/7, 4/4; day 80: 15/19 (79%) — 6/8, 4/5, 1/2, 4/4.
  Every sampled villager with a top goal also had a nonzero top
  weight (nonzeroW equals assigned on every sample day). Bar (>= 50%
  on >= 2 sample days) met on all three.
- **G-STEER (primary): MET on reach, INTERESTING on mismatch.**
  Annotated share of active objectives (kind not idle, state not
  done/returning): day 45: 17/18 (94%); day 60: 21/22 (95%); day 80:
  13/16 (81%). Bar (>= 25% on any sample day) met everywhere — goals
  reach dawn objectives nearly always. Mismatch share (annotated
  objective whose kind is NOT in its goal's kind set): 19 villager-
  days across all 4 seeds (94101: 8, 94102: 1, 94103: 5, 94104: 5).
  By kind: EXPLORE 8, GUARD 6, EAT 4, HUNT 1. Every one sits on a
  kind that can never carry a FRESH goal annotation (EXPLORE is in
  no goal's kind set; EAT/REST/LEAVE/SEEK early returns bypass the
  lottery; GUARD is a companion overwrite; a HUNT pick annotates
  only bank_veterans) — so all 19 are stale-carry evidence, not
  incoherent steering. Fresh-pick steering is coherent by
  construction (vgoalBiasCands annotates only covering kinds).
  The mismatch bar (> 0 on any scored seed) fired and produced the
  run's fix (below).
- **G-STICK (primary): MET.** Villagers alive at all three sample
  days with an identical stored top goal: 94101 5/6 (Meera churned
  food_security -> safety -> safety), 94102 2/2, 94104 3/3. 94103's
  single all-days villager (Leonid) held top null throughout — no
  goal at all, counted separately, not as a pursuit. Real-goal
  stick: 10/11 (91%). Bar (>= 50%) met — goals are pursuits, not
  daily dice, in this window.
- **G-SENSE (primary, strict): 0 SENSELESS sittings.** All 23
  transcripts read in full — see people check.
- **Carried, not re-judged:** S-TRACE EXPLAINED 4/4 (regional from
  day 47 on every seed; diplomacy 0 everywhere — r93's single-link
  shape, unchanged); K-CONTEXT lessons ok/total 20/20, 38/38, 21/24,
  28/34, proposals linked 1/1 on every seed; STAY-GREEN 0 mislabels;
  rotation bound holds (max consecutive dlg:more/dlg:details is 2
  in every transcript); blocked-agreement clean (badBlocked=0,
  badRevisit=0 on all seeds — the r100 fix holds); B-SIT 8 betrayal
  sittings (4 accept / 4 decline / 0 unanswered); B-FOLLOW 4
  follow-up sittings, 3 with a new betrayal; P-KEEP carried context
  10 threads (4 SILENT / 2 DEAD / 4 NO-LATER-SITTING / 0 NAMED).
  Cross-run note (context only, not a re-score): r100 + r102
  revisited-alive promise threads now total 5, all SILENT, 0 NAMED —
  the r100 metric-review floor (>= 3 revisited-alive threads) is
  now met in aggregate; a future run may judge P-KEEP as a verdict.
- **M5 winnable (descriptive, by endReason): 2/4 survived**
  (94102, 94104 to day 101, wave 4, regional); 94101 lost day 84,
  94103 lost day 87. All four seeds reached wave 4; none reached
  wave 5. Descriptive only — fresh seeds, not a winnability verdict.

## Village assessment, in plain words

Two villages made it through the deepening window and two did not —
and all four reached the fourth wave, which is the deepening story
this run: wave 4 is no longer a distant rumor by day 80, it is the
weather. What the villagers want, overwhelmingly, is food and
company: their lasting goals are party_up, food_security, and
safety, and those are the goals that steer their mornings. The
goals that would carry a village toward winning — better gear,
banked veteran kills, standing beyond the fire — almost never top
anyone's list in this window, and almost never speak in a departure
line (1102 goal lines spoken across the panel: 802 food_security,
227 party_up, 64 safety, 5 gear_up, 4 bank_veterans, 0
build_standing, 0 bonds, 0 knowledge). That is the gates working as
designed — gear_up closes once a villager is armed and armored,
bank_veterans needs a fight already fought, build_standing needs a
village already known — but the consequence is plain: in the
deepening window, the goals system mostly steers dinner and
company, not the climb.

- **94101 (lost, day 84, wave 4, regional, standing max 140):** the
  village outlived its flag — 10 people still living at the end
  (Eva, Tariq, Ivy, Ava, Mateo, Meera, Elijah all knowing ~39-40
  plants each), pantry 8k kcal at day 70, a seasoned-age link that
  never seasoned (age 45, trust 35). A going concern that lost its
  scholar's line, not a wipe.
- **94102 (survived, day 101, wave 4, regional, standing max 215):**
  the furthest reach — 4 alive (Avery, Elena, Lucas, Tashi),
  pantry 12k kcal, a 75-day link at trust 23, codex 38 monsters.
  Avery's arc is the panel's human story (see people check).
- **94103 (lost, day 87, wave 4, regional, standing max 245):** the
  highest standing and the hardest fall — ground down to Leonid
  alone, pantry 0 at day 85, its link broken (trust 19, arrears
  3000). Standing without food is a number, not a village.
- **94104 (survived, day 101, wave 4, regional, standing max 100):**
  the steady one — Kelsey, Aria, Fatima, Somying alive, 40 shared
  knowledges (the panel's deepest bench), but pantry 0 at day 100
  and a 75-day link at trust 8. Alive, knowledgeable, hungry, and
  barely linked — survival with nothing banked.

## People check (all 23 transcripts read)

G-SENSE 0 senseless. The sittings read as people with wants, not
menus:

- **Avery (94102, pottery instructor, days 45/60/80):** the panel's
  arc. Day 45: a buried bundle (+1843 kcal to the pantry) and a
  promise — "I'll ask it. I promise." — to ask the System about
  Daniel and the taken. Day 60: dreams of rows of humming pods, the
  same promise re-committed ("I'll ask the System about the
  pods"), a walk, a declined invitation's pocketed thing. Day 80:
  the day-45 beat repeats verbatim — another buried bundle (+1613
  kcal), the same Daniel question. A repeat beat, not a
  contradiction (a villager can bury more than one cache), but the
  promise itself is never NAMED as a past promise in any later
  sitting: the want re-presents, the promise does not. That is the
  r100 Dante shape again, now with a full three-sitting arc.
- **Sandra (94101, radio DJ):** day-45 wound-help promise, day-60
  hungry re-ask ("I won't forget who fed me when it mattered"),
  promise never named again — SILENT, the r100 shape in miniature.
- **Eva (94101, truck driver):** day 45 shows the honest refusal
  shape (commit answered "I'm out on the road... Find me when I'm
  back" — stated, not promised); day 60 a betrayal accept with a
  gifted tool, then a thin more/more tail ("I wouldn't have
  guessed that about you" / "I wish there was more to tell") —
  picker-driven, coherent, thin; day 80 a promised creek run, a
  trap-line walk, a declined invitation's pocketed thing. SENSE.
- **Leonid (94103, rail conductor, trust 8 -> 46 -> 44):** day 45 a
  grieving sitting whose gossip names real panel people (Tashi
  back, Mara on the snares, Ines and the stray dog) — and Ella's
  day-60 sitting continues the stray-dog thread ("lets Ines touch
  it"), cross-sitting continuity that reads as a village talking
  to itself. Day 60: "Never mind the food I needed — we got it
  handled" (the r100 Natalia resolved-off-screen shape) plus the
  honest refusal. Day 80: a leave-taking monologue ("I'm not built
  for staying... The horizon's a magnet") ending in a declined
  invitation. A restless man, consistently drawn. SENSE.
- **Jorge (94103, rancher):** the stay-repeat shape now HAS
  evidence (r100 metric review: no sitting had pressed dlg:stay 4x
  since r94). Jorge presses stay 4 times and resolves comforted
  ("Some nights I'm fine. Tonight I'm not. That's the whole
  story") — a stay loop that lands, not a loop that stalls. SENSE.
- **Aria (94104, musician):** day 60 a betrayal accept (a thinking
  place shown, "Don't tell the others"), day 80 a food-philosophy
  monologue list ("Feed people first... Fed people can think...
  My grandmother fed the whole street during the bad year") —
  more-driven, but every line is the same person thinking aloud.
  SENSE.
- **Kelsey (94104, roofer):** day-60 food promise, day-80 pantry-run
  promise — a new promise, not a naming of the old one (SILENT per
  the analyzer, correctly). Fatima's fever plea and Aki's wound
  plea (94104 day 45) are plain asks with plain thanks. Emily's
  "eight hours where nothing needs me" is the panel's quietest
  true line. All SENSE.

Notes, not defects: (1) the promised-favor line ("I won't forget
who fed me when it mattered") is identical across promisers —
engine voicing for one event, not a within-sitting repeat; (2)
Avery's day-80 bundle beat repeats day 45 verbatim — a repeat beat
to watch, not a senseless sitting; (3) Leonid's day-45 gossip
("People are saying things. About you.") is ominous without a
payoff in-window — a plant, not a defect.

## The blanks this run fills

1. **Villager goals in the wild (new panel):** goals are a live
   layer in the deepening window — 93%/96%/79% coverage, 81-95%
   of active objectives annotated, 91% top-goal stick across the
   window. The goals system steers mornings. But it steers them
   toward food and company, not the win chain: gear_up,
   bank_veterans, build_standing, bonds, knowledge essentially
   never top a villager or speak a departure line here. The gates
   explain it; the consequence is the finding.
2. **Stale goal annotations — FOUND and FIXED.** 19/19 mismatch
   cases are annotations that did not come from the current
   objective's own pick. Root cause: `objPick` resets stale
   hunt/chore tags but never `o.goal`/`o.goalLine`, and the
   departure line appends `goalLine` unconditionally; the GUARD
   companion overwrite and the agency EXPLORE overwrite have the
   same gap. Fix (game code, 3 one-line sites in
   src/js/villager-objectives.js, same rationale as the existing
   hunt/chore resets): clear goal/goalLine on a fresh pick (top of
   objPick, covering dead/LEAVE/REST/EAT/SEEK/HAUL early returns
   and the lottery), on the GUARD overwrite, and on the agency
   EXPLORE overwrite. Indoor deferrals (HAVEN_CHORE reassignments)
   left alone: they speak no departure line, and the next objPick
   clears them. Proof: scripts/test-journey-deepening-r102-
   goalreset-20261104.js — 18/18 post-fix (EAT/REST cases FAIL
   pre-fix with the stale goal surviving, PASS post-fix; 20-pick
   lottery invariant sweep; all three fix-site markers; G-scan
   fixtures incl. the returning-vs-stale split). The only consumer
   of o.goal/o.goalLine found in src is the departure-line append
   (guarded), so the fix is voice-only by construction. Player-
   facing harm of the stale lines was unproven (the lines are
   generic enough to read plausibly — a HUNT errand speaking "The
   pantry won't fill itself" is even accidentally apt), so this is
   filed as voice hygiene, not a behavior fix. Post-fix panel
   re-run for behavior-neutrality confirmation: see flap note.
3. **Stay-repeat shape (r100 open item) — CLOSED with positive
   evidence:** Jorge's 4x stay resolves comforted. Not a loop.
4. **Analyzer correction (post-panel, disclosed):** a RETURNING
   objective legitimately carries its pick's goal home — it is not
   stale. The stale bucket is now done/idle only; returning gets
   its own bucket. This moves exactly one main-panel item (94104
   day 45 Kelsey, VISIT returning) out of the stale count. The
   scored JSONs are unchanged data; only the bucket label moved.
   No bar depended on the stale count.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
hidden_files/telemetry-baselines/deepening.json, metrics w3fights,
engaged.w3, fightsTotal, fightsByWave.3, current = r102 4-seed panel:
**quiet (4 files, 4 metrics, no large deviations).** No baseline
roll, nothing to investigate. (An earlier invocation failed only on
a quoted `~` in the glob path — operator error, not a signal.)

## Metric review

- **G-STEER split (amendment #1, vindicated):** without the split,
  the 19 mismatches would have read as "incoherent steering." With
  it, they read exactly as what they are: a missing reset. Future
  goal panels should keep the fresh-vs-inherited split, and should
  sample the departure lines themselves (capture goal-line counts
  are a whole-run total, not per-errand voice).
- **Goal-voice distribution:** food_security dominates departure
  lines 802/1102. If a future run wants win-chain goals to speak,
  it must first ask why their gates stay shut in this window
  (armed+armored villagers, unfought fights, unknown villages) —
  that is a design question, not an instrument fix.
- **P-KEEP aggregate (carried context):** r100 + r102 revisited-
  alive threads = 5, all SILENT. A future run may pre-register
  P-KEEP as a verdict with the floor now met.
- **Declined-thing plants (r95 open, still open):** declines this
  panel (Eva, Avery, Leonid, Kelsey) again leave a pocketed thing
  never revisited in-window. Still open.
- No pre-registered metric was re-scored mid-run. G-ASSIGN,
  G-STEER (as amended pre-scoring), G-STICK, G-SENSE and the
  carried instruments are reported exactly as pre-registered.

## Harness

scripts/journey-deepening-r102-20261104.js (r100 lineage +
goalSnap snapshots on convo days: observer-pure reads only —
vgoalState + vgoalWeights + objOf; vgoalTop/vgoalBiasCands never
called from the snapshot — plus capture goal-line counts in the
per-seed JSON; seed band 94101–94104). Analyzer:
scripts/analyze-journey-deepening-r102-20261104.js (S-TRACE +
P-DIST-LL + B-SIT + B-FOLLOW + P-KEEP scans carried from r100 +
G-scan: G-ASSIGN / G-STEER / G-STICK from goalSnaps, returning
split from stale). Proof:
scripts/test-journey-deepening-r102-goalreset-20261104.js — 18/18
(live-game EAT/REST clears + lottery sweep + fix-site markers +
G-scan fixtures). Fix: src/js/villager-objectives.js (3 sites,
[needs-eyes]: spoken departure lines change — villagers no longer
speak a previous errand's reason). Per-seed JSONs + 23 transcripts:
goal hidden_files evidence 2026-11-04
(journey-deepening-r102-seed9410*.json,
journey-deepening-r102-transcript-*.txt). Prereg + this note in
repo evidence/2026-11-04/.

## Regression gate

`node scripts/check.js --quick` with
--cacheDirectory=/tmp/jest-cache-playtest, single run (NOT RUN —
see flap note; jest cache writes go through the exec channel and
cannot be trusted during the flap; the run's own proof test is
18/18 and the fix touches only departure-line voice, but the gate
is still owed before landing).

## Flap note (host write flap, LOUD, in progress at note time)

From ~00:24Z, exec-channel writes fail: `cp` of evidence files
EPERM, heartbeat registry writes EPERM (last good heartbeat
00:18:32Z), and fresh exec-channel creates silently land as 0-byte
files (verified: python 3000-byte probe reads back 0 bytes, exit
code 0 — exit codes lie during the flap). File-tool writes land
verified (108-byte and 75-byte probes read back full). Original
scored evidence is intact (seed JSONs 240-274KB, verified sizes);
two failed backup attempts left 0-byte copies, both removed (the
pre-fix-r102 dir was deleted after each failure; no 0-byte file
remains from those attempts). Recovery order when the flap clears (CLOSEOUT STATUS at 00:52Z:
the flap outlasted this run, so this run closes out LOUDLY with
the work unmerged — rotation already advanced 2->3 via the
file-tool path and verified, lock already deleted per the body's
even-on-failure rule; the next lane-A run plays scale under a
fresh slug and does not collide with this tree):
(1) heartbeat immediately, (2) backup scored JSONs + transcripts
and verify sizes, (3) re-run the 4-seed panel post-fix and diff
headlines (expect identical endReason/maxGameDay/pop; JSONs differ
only in goalSnaps/goalLines) + analyzer G-mismatch expectation 0,
(4) check.js --quick, (5) safe-commit (driver + analyzer + proof +
prereg + run note + villager-objectives fix) with [needs-eyes],
(6) merge --ff-only (rebase first if master moved — the scale run
may land first; re-run proof tests after any rebase), then tree
release + worktree remove + branch delete + final reap sweep.
Worktree state verified at closeout (git status, read-only):
M src/js/villager-objectives.js + 5 untracked (prereg, run note,
driver, analyzer, proof test) — nothing else, branch
journey-deepening at 7086b11f2. Telemetry already quiet; the
telemetry check does not need repeating. Do NOT re-run the panel,
commit, or merge while exec writes truncate — a 0-byte overwrite
of scored evidence or a half-written git object is worse than a
delayed landing.

## Post-fix verification (main-session closeout, 2026-11-04 evening)

- Pre-fix scored JSONs backed up to goal hidden_files evidence/2026-11-04/r102-prefix-backup/ (byte-identical copies, verified).
- Proof test re-run by closer: 18/18 PASS (scripts/test-journey-deepening-r102-goalreset-20261104.js).
- Panel re-run post-fix (POLICY=competent, seeds 94101-94104): 94101 day 84 village-lost, 94102 day 101 survived, 94103 day 87 village-lost, 94104 day 101 survived.
- Analyzer post-fix: mismatched=0 on every seed and day. Remaining stale entries are idle+done villagers only (94102 day45: 4; 94104 day80: 1) — the benign done/idle class the proof test names, not active errands carrying a stale annotation. The fix holds on the panel.
- check.js --quick run follows as the regression gate; its log is goal hidden_files r102-check-quick.log.
