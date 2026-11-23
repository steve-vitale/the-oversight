# journey-landing r156 — PREREG (Lane A, leg 0 LANDING)

**Run id:** `playtest-20261123T0545Z` (scheduled Mon 2026-11-23 05:45 CST).
**Base:** local master `fdd7042b8` at worktree registration (batch ship
`db2e9a3df-20261123-112449`).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg:
establishment. (Rotation file read 0 because scale r273 wrote 3→0 at
10:08Z; the r155 0→1 and r271 1→2 and r272 2→3 writes all landed.)
**Lock:** `playtest-loop.lock`, run_id `playtest-20261123T0545Z`, created
2026-11-23T11:48:09Z. Delete at closeout in the same call as its read,
only if run_id matches.

## Pre-flight

`git status --short` at run start: EMPTY (tracked diff empty,
untracked empty — the full `git status --short` hung 4+ min under
sibling load; verified via `git status --porcelain
--untracked-files=no` + `git ls-files --others` + `git diff --stat`,
all empty). Disk 47% (fine). `git pull --ff-only`: already up to
date. `worktree-reap.sh`: skipped, registry lock held by a sibling
reaper run — no cleanup this run. Stashes present (10) — never drop.

**Write flap 11:49–11:56Z:** the first registration failed mid-checkout
("unable to write file", "Could not reset index file to revision
'HEAD'"); probe `git update-ref refs/heads/probe HEAD` FAILED at
11:53Z and 11:54Z, OK at 11:56:05Z. Retried registration after the
probe cleared — succeeded, worktree at `fdd7042b8`, verified with
`pwd`. Heartbeat `heartbeat_at` 12:01:49Z; hbloop running detached via
setsid nohup (10-min cadence, pid 19182). Branch `journey-landing`
already existed from the failed attempt; the register script attached
to it (r155 precedent).

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1372–1381** (next after r155's 1362–1371).
`grep -rn --include='*.md' -E '1372[–-]1381|1372|1381' evidence/`:
zero band namings. All hits incidental: line numbers
(`betrayal.js:1372`), kcal values (`1381 kcal`), sim IDs, hash
fragments. No prereg names 1372–1381. **Band 1372–1381 is fresh.**
Prior landing bands: 1362–1371 (r155), 1352–1361 (r154), 1342–1351
(r153), 1332–1341 (r152), 1272–1281 (r149), 1262–1271 (r148),
1252–1261 (r147), 1242–1251 (r146), 1232–1241 (r145), 1212–1221
(r143), 1192–1201 (r142), 1182–1191 (r141), 1172–1181 (r140),
1162–1171 (r139), 1142–1151 (r121–r138, deliberate reuse),
1122–1131 (r119), 1083–1092, 1073–1082, 1063–1072, 1053–1062,
1043–1052, 897–906 (contaminated), 887–896, 867–876, 857–866,
847–856, 837–846, 817–826, 797–806, 777–786.

## Base delta vs r155's base `895f7a6ee` (src/js, 7 files)

- journey-social-life r268 Arm B (`7a2de2e42`): **resume-pick dry
  fall-through via convoLiveBeat** + proof test 36/36 [needs-eyes] —
  landing-relevant: resume-pick dry behavior in daily talks.
- journey-deepening r272 (`997654392`): **GONE-BEARER** — a dead
  bearer's joint run is never urged as finishable + proof 35/35 —
  landing-relevant: joint-run urging in daily play.
- sim-homebody-metric-a (`f99f9c0c6`): **homebody-holder handoff** —
  range-0 holder's wave-4+ plan moves to a walkable companion at
  depart time (findings #2498/#2568) [needs-eyes] —
  landing-relevant: plan departures.
- sim-wornstack-equip-a (`46370f4d2`): scholar equip/unequip carry
  worn stack units (finding #2707); proof 21/21. "No player-visible
  behavior change."
- sim-gateavoid-b (`a8ff84fd8`): durable gate-avoid log + leaderproj
  re-judge (NO-GO D1 METRIC-BROKEN; instrument PROVEN).
- Version bump only (`fdd7042b8`).
- Evidence-only since r155: r271 establishment (PLANWAKE holds,
  day-desync answered), r272 deepening, r273 scale, sim-detgate-order,
  sim-homebody-metric, sim-launchfield-horizon.

## The blank this run fills — M-PR1 commit-menu defect (r155 filed)

**In plain words:** twice on one village (seed 1370, Lucas d10 and
Lena d11), someone asks the player plainly to go foraging with them
tomorrow — and at no point is there any way to say yes. The menu
never offers "I'll come back to help." The favor hangs ("Think about
it? I'll be around.") and the outing never happens.

**Mechanism PINNED this run (transcript + code trace, pre-panel):**
the opener in both sittings is a GRIEF beat ("We gave them a good
burial…", "Every laugh out there feels wrong today…") —
`convoOpening` returns `thread: 'grief'` (conversation.js:3791,
:3950). The player picks [dlg:help] (offered by the r230 stage-0
surfacing); `engageBeat` states the ask and `convoWantEngage`
moves the want to stage 2 with the favor record attached in state
'asked' — but NOTHING moves `c.thread` to 'want'
(`convoWantEngage` is a pure stage transition, convo-wants.js:2992).
Next menu: `convoWantMenu` returns [] on its thread-coherence gate
(`c.thread !== 'want' && !== 'small'`, convo-wants.js:3084), so the
commit menu never builds; `beatMenuResponses` drops [dlg:more] too,
because grief is a no-followup thread (`threadNoFollowups`,
convo-beats.js:455), so there is no thread-advance path either.
Contrast 1371 d13 (promised): opener thread 'request' HAS follow-up
machinery, [dlg:more] is offered, picking it advances the thread to
'want', and the commit menu appears on the next menu. The defect is
the thread, not the favor record: the favor IS created in state
'asked' and `convoFavorActionMenu` WOULD offer `dlg:commit` if the
want menu ever ran.

**Fix shape (to be proven by probe before landing):** when the want
engages to stage 2, the want owns the conversation — move the thread
to 'want' at engage time (in `convoWantEngage` 'engage', or in the
dlg:help handler after a successful engageBeat). The staged probe
must show: on old code, grief-opener + ask_favor + dlg:help →
thread stays 'grief', `convoWantMenu` [], no commit in any menu;
on fixed code, thread becomes 'want' and `dlg:commit` is offered.
Proof test drives the same shape through the harness.

**NOT this run's blank:** the r155 contest-death ledger item
(death-ended contests never emit `contest_end`, ledger endDay stays
null) is CONFIRMED and filed for a builder arm with its exact
one-line fix shape (`_contestDie` emitting `contest_end`) — one-blank
scope holds; it is not fixed here.

## Q1 (PRIMARY) — regression watch on the post-r155 master, fresh band

r155 bars carried verbatim (full list in the r155 prereg; the binding
ones are restated here so the adjudication needs no other document):

- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG: **refused-turns 0 BINDS** (v4, zero-DMG fights); stood-
  through-by-choice reported only; raw zero-DMG + B-shape reported as
  watch. Refused-turns all-fights (v4): reported as watch; any count
  > 0 is a Q1 investigation item (the Spool shape).
- Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10.
- Pocket: 0 pocket fights BINDS; stuckTurns reported as watch.
- D1 watch: 0 garbled-label renders.
- HEED: legacy count reported; **HEED-V = 0 BINDS**.
- M-PR1: never-offered among established ask_favor sittings ≤15%,
  where "established" excludes `resolution=unestablished` sittings.
  **DECIDED (see Metric-review decisions below): settled established
  sittings do NOT count as never-offered** — the run adjudicates with
  the R122 analyzer exclusion. Raw analyzer rate + max per-seed
  never-offered reported as watch.
- Personal bridge: 0 repeats in a sitting. Small bridge: 0 repeats.
  Goal bridge: 0 repeats in a sitting. **Grief bridge: 0 repeats in
  a sitting** (pool now 6 lines). Village/plans 2-line pools: report
  servings + repeats as watch.
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
- **silentTurns / dry-line bars RESTATED as proxies (see decisions):**
  0 empty THEM lines in the panel's transcripts; nodloop LOOP=0;
  mimeShown=0. These are the adopted bars this run.
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
  sitting is a Q1 failure on live data. **r269 DRY-COUNT WASHOUT
  watch:** the blocked-beat restore of the dead-react streak must not
  re-open a react loop — any sitting with a ≥3 identical react streak
  is a Q1 investigation item.
- **Settled-help watch (r247 fix):** every settled-favor help topic
  names the favor's short; a bare kind id spoken is a Q1 failure.
- **Deduped-vs-silent watch (r150 instrument):** the r150 move-refusals
  split is reported; a truly-silent refused move (not deduped) is a Q1
  investigation item.
- **Warn-heed watch (r150 fix):** every warn_you sitting where the
  player heeds must name the danger (r155: 2/2). A heed sitting that
  ends without the danger named is a Q1 failure on live data.
- **Profilegate watch:** win-plans at d14/d28 reported per seed;
  any wave-4+ holder plan inside 28d reported with its trigger.
  **PLANWAKE hold watch:** r155 ignition was 10/10 at d14 — if this
  fresh band drops below 8/10, that is a Q1 investigation item.
- **Reseed-beat watch:** any reseed launch beat firing inside 28d
  reported with its line; a beat that fires but stays silent is a Q1
  investigation item.
- **Downed-ally watch:** any landing fight where an ally goes down
  reported; a second 'goes down' for the same ally in one fight is a Q1
  failure on live data.
- **Owed-walk watch:** any accepted invitation vetoed by illness
  reported; the veto must name the owed walk and the re-offer must come.
- **Namebeast told-watch (r152 FIX 1):** every same-day
  tellbeast→namebeast pair on the panel names the told beast; a told
  beast named a day late is a Q1 failure on live data.
- **Settled-reask watch (r152 FIX 2):** every settled-favor re-ask
  on the panel names the favor's short when speakable; a generic "that
  one" re-ask is a Q1 failure on live data. (r155: UNTESTED — no sitting
  pressed the pick.)
- **Broken-favor watch (scale r250 lines):** every broken-favor
  resolution line on the panel names the favor or its short; a bare
  kind id spoken, or a resolution line naming no favor, is a Q1 failure
  on live data. (r155: UNTESTED — no broken-favor repay sitting.)
- **Volley-throw watch (leadgate fix):** any 'v is not defined'
  throw, or any volley error, in a panel fight is a Q1 failure on live
  data. Volley narration must name the weapon actually fired.

**Q1b — WARN_YOU DEFLECT SHAPE (r149 item, carried r150–r155 —
eleventh carry):** the r150 warn-heed fix closed the heed path (r155:
2/2 heed sittings name the danger). The deflect path is still open:
no deflect sitting fired in r155 either. Remains a design question
(how forcefully a pending warning re-asserts itself); **no fix this
run unless a deflect sitting shows a new defect shape** — else
document and carry with the design decision named.

**Interesting if:** any r155 bar moves on the fresh band; a pocket recurs
(any shape, including sub-threshold); a door-flee fight fires; a fledBad
sample fires with an unpinnable fight; an accepted link-raise parrots or
repeats its opener verbatim; a scholar ends stranded homeward for 2+ days;
a favor with a live need is answered settled; a trail-talk / Wren line
repeats verbatim in one sitting; a second scholar death pattern (deaths >
2); revised M-PR1 > 15%; statedAfterPick ≥ 6; hungry-at-horizon moves from
1/10 either way; any village starts a win-plan inside 28d; a parting-hit
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
a told beast named a day late (r152 FIX 1 regression); a settled re-ask
naming no favor (r152 FIX 2 regression); a broken-favor resolution line
naming no favor or a bare kind id; a volley throw or wrong-weapon
volley line; a contest ending by participant death with no endDay
stamp (r155 investigation item — confirm or deny on this panel);
**win-plan ignition below 8/10 at d14** (PLANWAKE hold — r155 was
10/10); **a grief-bridge repeat** (r155 fix regression); **an
ask_favor sitting where the ask is stated and no commit menu is ever
offered** (the r155 blank — the fix must drive this to 0 on the
panel, or the blank is not filled).

**Bars (bind, r155 bars carried verbatim + the decisions below):** see
Q1 list above. Pilot first: seeds 1372–1375; expand to all 10 unless
the pilot is red. Death-aware horizons (dead village stops, +10d tail
max).

## Metric-review decisions (made BEFORE this run, recorded here — §14)

1. **M-PR1 settled-counting — DECIDED.** r155's metric review item 2
   required the loop to decide ONCE whether settled established
   sittings count as never-offered, and record it before r156. DECISION:
   settled established sittings do NOT count — adopt the R122 analyzer
   exclusion ("settled sittings do NOT count as never-offered"). The
   analyzer already computes this reading (r155: 2/20 = 10% under it,
   vs 20% under the r154 hand count). Rationale: a settled favor is an
   honest "already handled" close, not a missed offer; counting it as a
   missed offer punishes the game for answering. This decision applies
   from r156 forward and is recorded here, not re-scored mid-run.
2. **d14 snapshot fragility — FIX ADOPTED.** The driver keys the d14
   win-plan/practice snapshot on `series.length === 14`, not on game
   day; a skipped day kills the snapshot (r155 void run: 9/10 null).
   r156 driver: key on the snapshot's game day — first snapshot at or
   after day 14 (`!ctx._winPlanD14 && gd >= 14`). Instrument fix, no
   game behavior change.
3. **silentTurns / dry-line bars — RESTATED as proxies.** Neither bar
   has an instrument (absent from the 15 analyzers and from all census
   JSONs). Adopted bars this run: 0 empty THEM lines in the panel's
   transcripts; nodloop LOOP=0; mimeShown=0. The uninstrumented bars
   are retired, not carried as UNMEASURED.
4. **r267/r268 watches — DROPPED as uninstrumented.** topic2Ask and
   LAUNCHVOICE appear in neither the analyzers nor any census JSON.
   Both mechanisms are carried by their own proof tests (r267, r268);
   the landing panel no longer lists them as watches. If a future run
   wires the instruments, they return.
5. **Contest endDay past horizon — NOTED.** 1363 lies fired d27,
   endDay d29 (a day-boundary roll on the final tick). The ledger
   tolerates it; endDay ≤ d29 is possible on a d28 horizon.
6. **Carried r154/r155 items 1–8** (zero-DMG bar over-strict; ARMOR-
   SILENT attribution; scholar-deaths bar counts deaths not fairness;
   R66 wording; R104 popEnd off-by-one; link-opener wording;
   namebeast pair-count basis; grief-bridge pools) — unchanged, see
   the r155 prereg.

## Q4 — PEOPLE CHECK

Read 2–3 full transcripts from convo days 7/14/21/28 in full, PLUS the
nonverbal sittings AND all raise talks. Judge sense, not counts. Quote
one specific transcript moment in the run note. Watch: closing-line
duplication, tell-me-more echo, searcaster-volley narration, departbeat,
warn_you heed, broken-favor resolution lines, and the fixed commit-menu
path (a grief-opener ask_favor sitting must now offer commit).

## Q5 — CENSUS + W5-INSTANCE (carried, landing-scoped)

w4 fights/kills (landing horizon: wave ≤3 expected; any wave-4 fight
inside 28d is reported), banked veterans (2+), w5 unlocked/faced/killed
(0 expected inside 28d; any occurrence is a finding), tribute states,
survival.

## Q6 — DIALOGUE WATCH (carried)

The r155-recorded flat spots — the NV 3-nod cycle, the "come see what I
found" payoff shrug (orphaned), orphaned invitations in raise talks,
the r239 "tell me more" echo, closing-line duplication, 3/17 transcripts
with NO closing line at all (scale leg). A dialogue-content fix belongs
to this run only if it is a blank this run finds (the one blank is
M-PR1).

## Policy (frozen)

The r154 control policy verbatim (competent player, days 1–28; the
driver is cloned from r155 with only OUTDIR/header/seeds changed, plus
the d14 snapshot instrument fix). DAYCAP=28, death-aware stop (+10d
tail max). Seeds FRESH 1372–1381. Pilot: seeds 1372–1375 first. Pilot
gates: driver clean, no census errors > 0, census rows present,
reconciliation residual 0 — else STOP and diagnose (INCOMPLETE, not a
verdict).

## Fix scope (pre-registered — the build is not scope creep)

- Driver (`scripts/journey-landing-r156-20261123.js`, cloned from r155):
  seeds 1372–1381, corpus tags r156, EVIDIR 2026-11-23, single arm.
  Plus the d14 snapshot instrument fix (key on game day). No behavior
  change from the r155 control.
- Analyzer script (`evidence/2026-11-23/journey-landing-r156-analyzers.sh`):
  cloned from r155's (15 analyzers, same order).
- The M-PR1 fix: thread-to-'want' on engage (convo-wants.js and/or
  convo-dialogue.js), with a staged probe proving the defect on old
  code and the fix on new code, plus a proof test
  (`scripts/test-*.js`) driving the grief-opener ask_favor shape.
  No other `src/js` change. No lever, no gate change, no tuning.
- **One blank:** the M-PR1 commit-menu defect above, with a proof
  test and a panel re-run as proof — or document precisely why it
  cannot be fixed.

## Gating freeze (2026-10-27 16:53) stands

No threshold, bar, price, nor gate change in this run. **Perception law
(2026-10-28) stands. Combat-play gate (Steve 2026-11-10 17:52 CST):
no toughness/gear/ability tuning in this run. TEST WITH ENCOUNTER GEAR
(Steve 2026-11-13): the policy fights with the party and gear the
competent player has by the leg.**

## Time-box

Hard stop ~08:45Z (3h from run start). Single arm: 10 fresh seeds ×
28d; each sim ~15s, panel ~5 min. The `--quick` gate runs after the
build commit (~18 min, re-run once if load-flaky per r154 precedent).
