# journey-landing r154 — PREREG (Lane A, leg 0 LANDING)

**Run id:** `playtest-20261122T1245Z` (scheduled Sun 2026-11-22 06:45 CST).
**Base:** local master `be0cfca40` (sim-leadgate-a merge; `git pull` already up
to date at run start; local ahead 0, behind 0 vs origin/master at pull time).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg:
establishment.
**Lock:** `playtest-loop.lock`, run_id `playtest-20261122T1245Z`, created
2026-11-22T12:45:00Z. Delete at closeout in the same call as its read,
only if run_id matches.

## Pre-flight deviation (LOUD — rule as written vs. what was found)

`git status --short` at run start showed exactly ONE untracked file:
`evidence/2026-11-22/sim-scale-onramp-round-1115.md` — the 1115Z lever
round's round record, written 12:40Z, minutes before this run started,
never committed by its own run. The body says status MUST be empty or
abort. This run PROCEEDS and records the deviation loudly instead, for
two reasons: (1) the file is a completed sibling run's orphaned evidence
record, not a modification to any tracked file — it cannot contaminate
the worktree checkout, the ff-only merge, or any proof test; (2) aborting
would stall every subsequent Lane A run on the same file, since no one
will commit it (it is not this run's file to commit — "never commit
another agent's files"). The file is left byte-identical and untouched;
the main agent should route it to the lever loop / ship loop for
committal. Disk 42% (fine).

## Flap window 6 (ongoing, never solved)

Worktree registration attempt 1 (12:47–12:51Z) failed on EPERM during
checkout (`fatal: Could not reset index file to revision 'HEAD'`, write
errors on tendshift-a-interaction-driver.log, tools/audio-lab-data.js,
tools/audio-lab.html, tools/mobile-sim.html, version.json). Attempt 2
failed on `.git/worktrees/journey-landing/locked` EPERM (attach path —
the branch already exists from r153, whose closeout branch delete failed
twice on flap EPERM; the register script's existing-branch fallback is
the attach, and it is the flap, not the branch, that blocks it).
Content-verified probes flicker: FAIL 12:51, OK 12:52 (3/3), FAIL 12:53
(4/4). Machine uptime 1:19 at 12:51Z (restart ~11:32Z). A retry loop is
running detached (10 attempts, probe-then-register, 60s cadence; script
`hidden_files/journey-landing-r154-register-retry.sh`, log
`hidden_files/journey-landing-r154-register.log`). If registration
never lands, the r153 Amendment B fallback applies: the panel runs from
the main tree READ-ONLY using the committed r153 driver byte-identical
under env overrides, and commits are staged in goal hidden_files for
adoption. The panel corpus writes are flap-exposed too (driver carries
the R81 EPERM-retry patch); the panel is void and re-runs if master
moves mid-panel.

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1352–1361** (next after r153's 1342–1351).
`grep -rn --include='*.md' -E '1352[–-]1361|1352|1361' evidence/`:
zero band namings. The only `1352` hits are the 6-digit scale seeds
135201–135204 (journey-scale r196/r197 preregs, Nov 14 — a different
seed namespace; 1352 ≠ 135201), one version string (`79060b74b-…113520`),
and incidental line numbers / kcal values / code refs. The only `1361`
hits are incidental (line numbers, `seed 13611` in journey-crisis-r154).
Second grep over `evidence/2026-11-1*` + `2026-11-2*` preregs for
`135x–13xx` ranges: no band naming 1352–1361. Contaminated-band lists
in the r149–r153 preregs name bands up to 1342–1351; none names
1352–1361. **Band 1352–1361 is fresh.**
Prior landing bands: 1342–1351 (r153), 1332–1341 (r152), 1272–1281
(r149), 1262–1271 (r148), 1252–1261 (r147), 1242–1251 (r146),
1232–1241 (r145), 1212–1221 (r143), 1192–1201 (r142), 1182–1191 (r141),
1172–1181 (r140), 1162–1171 (r139), 1142–1151 (r121–r138, deliberate
reuse), 1122–1131 (r119), 1083–1092, 1073–1082, 1063–1072, 1053–1062,
1043–1052, 897–906 (contaminated), 887–896, 867–876, 857–866, 847–856,
837–846, 817–826, 797–806, 777–786.

## Base delta vs r153's base `de0cb73c8` (src/js, 11 files, +895/−71)

Live behavior changes (`git log de0cb73c8..be0cfca40 -- src/js`):
- journey-scale r250 (`20783a0be`): scale leg panel + **broken-favor
  resolution lines** [needs-eyes] — landing-relevant: settled/broken
  favor resolution language is in the landing leg's daily play.
- journey-deepening r249 gate record (`3d7a25427`): PLANWAKE already
  in r153's base? No — r153's base `de0cb73c8` predates it; r249's
  PLANWAKE (win-plan.js +607) lands here. Landing watch: win-plans
  inside 28d (r153: d14 0/10, d28 2/10).
- sim-leadgate-a (`fb0ca5b49`): **volley scoping fix** (fieldFights.js)
  — every wave-4+ fight threw 'v is not defined'. Landing fights are
  wave ≤3, but any volley throw on the panel is a Q1 failure.
- sim-crossvoice-a (`b5fb12e10`): searcaster volley reads as a gun, not
  a bow — volley-narration watch.
- sim-gunlife-a (`b50562d2e`): tracer + prevHolderState clobber fix
  (gun holder state; landing has no guns — watch only).
- sim-vanishtile-a (`c7f4b9a46`): terminal vanished-state range / tracer
  (gun-life tiling — watch only).
- sim-hpgate-b (`87b2122f3`): HP-gate door parties, NO-GO on P2/B1
  (metric-broken; #2619 stays open) — landed as measured, no live
  behavior change claimed; watch only.
- Also in range: sim-killlootbundle-a + sim-tier4access-a (landed
  mid-r153; r153 rebased onto them), favor-forage.js / favor-water.js
  changes (forage/water favor lines — landing-relevant: favor topics
  are daily landing play).

## Q1 (PRIMARY) — regression watch on the post-r153 master, fresh band

r153 bars carried verbatim (full list in the r153 prereg; the binding
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
  player heeds must name the danger (r153 AFTER: 1/1). A heed sitting
  that ends without the danger named is a Q1 failure on live data.
- **Profilegate watch:** win-plans at d14/d28 reported per seed;
  any wave-4+ holder plan inside 28d reported with its trigger.
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
  beast named a day late is a Q1 failure on live data. (r153: VERIFIED,
  65 pairs, 0 late.)
- **Settled-reask watch (r152 FIX 2):** every settled-favor re-ask
  on the panel names the favor's short when speakable; a generic "that
  one" re-ask is a Q1 failure on live data. (r153: UNTESTED — no sitting
  pressed the pick.)
- **Broken-favor watch (NEW — scale r250 lines):** every broken-favor
  resolution line on the panel names the favor or its short; a bare
  kind id spoken, or a resolution line naming no favor, is a Q1 failure
  on live data.
- **Volley-throw watch (NEW — leadgate fix):** any 'v is not defined'
  throw, or any volley error, in a panel fight is a Q1 failure on live
  data. Volley narration must name the weapon actually fired
  (crossvoice: searcaster reads as a gun, not a bow).

**Q1b — WARN_YOU DEFLECT SHAPE (r149 item, carried r150/r151/r152/r153
— eighth carry):** the r150 warn-heed fix closed the heed path (r153:
1/1 heed sittings name the danger). The deflect path is still open: no
deflect sitting fired in r153 either. Remains a design question (how
forcefully a pending warning re-asserts itself); **no fix this run
unless a deflect sitting shows a new defect shape** — else document and
carry with the design decision named.

**Interesting if:** any r153 bar moves on the fresh band; a pocket recurs
(any shape, including sub-threshold); a door-flee fight fires; a fledBad
sample fires with an unpinnable fight; an accepted link-raise parrots or
repeats its opener verbatim; a scholar ends stranded homeward for 2+ days;
a favor with a live need is answered settled; a trail-talk / Wren line
repeats verbatim in one sitting; a second scholar death pattern (deaths >
2); revised M-PR1 > 15%; statedAfterPick ≥ 6; hungry-at-horizon moves from
5/10 either way; any village starts a win-plan inside 28d; a parting-hit
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
naming no favor or a bare kind id (NEW); a volley throw or wrong-weapon
volley line (NEW); a contest ending by participant death with no endDay
stamp (r153 investigation item — confirm or deny on this panel).

**Bars (bind, r153 bars carried verbatim):** see Q1 list above.
Pilot first: seeds 1352–1355; expand to all 10 unless the pilot is
red. Death-aware horizons (dead village stops, +10d tail max).

## Watch items carried from r153 (no binding bar)

- Hungry-at-horizon 5/10 (r152: 6/10, r151: 4/10) — band variation, no
  src change.
- Win-plans d14 0/10, d28 2/10 (r152: 1/10, 4/10; r151: 2/10, 5/10) —
  third consecutive drop. PLANWAKE now on this base; watch whether the
  drop reverses.
- Presshop pressFailTotal 0 (r152: 6) — watch clears.
- M-PR1 10.7% (r152: 10%, r151: 4.5%) — under the 15% bar but climbing;
  if it passes the bar, the question is whether "stated" resolutions are
  counted too loosely.
- statedAfterPick 7 (threshold ≥6) — all road refusals, intended Q1
  shape; no action.
- Contest ledger endDay on death-resolved contests: 2 pre-horizon open
  contests in r153 ended by participant death with no endDay stamp.
  Investigation item this run: does the ledger stamp endDay when a
  contest resolves by death?

## Q4 — PEOPLE CHECK

Read 2–3 full transcripts from convo days 7/14/21/28 in full, PLUS the
nonverbal sittings AND all raise talks. Judge sense, not counts. Quote
one specific transcript moment in the run note. Watch: closing-line
duplication (6 sightings in the scale series — count up on this leg),
tell-me-more echo, searcaster-volley narration, departbeat, warn_you
heed, broken-favor resolution lines.

## Q5 — CENSUS + W5-INSTANCE (carried, landing-scoped)

w4 fights/kills (landing horizon: wave ≤3 expected; any wave-4 fight
inside 28d is reported), banked veterans (2+), w5 unlocked/faced/killed
(0 expected inside 28d; any occurrence is a finding), tribute states,
survival.

## Q6 — DIALOGUE WATCH (carried)

The r153-recorded flat spots — the NV 3-nod cycle, the "come see what I
found" payoff shrug (orphaned), orphaned invitations in raise talks,
the r239 "tell me more" echo, closing-line duplication, 3/17 transcripts
with NO closing line at all (scale leg). A dialogue-content fix belongs
to this run only if it is a blank this run finds.

## Policy (frozen)

The r153 control policy verbatim (competent player, days 1–28; the
driver is cloned from r153 with only OUTDIR/header/seeds changed).
DAYCAP=28, death-aware stop (+10d tail max). Seeds FRESH 1352–1361.
Pilot: seeds 1352–1355 first. Pilot gates: driver clean, no census
errors > 0, census rows present, reconciliation residual 0 — else STOP
and diagnose (INCOMPLETE, not a verdict).

## Fix scope (pre-registered — the build is not scope creep)

- Driver (`scripts/journey-landing-r154-20261122.js`, cloned from r153):
  seeds 1352–1361, corpus tags r154, EVIDIR 2026-11-22, single arm.
  No behavior change from the r153 control.
- Analyzer script (`evidence/2026-11-22/journey-landing-r154-analyzers.sh`):
  cloned from r153's (15 analyzers, same order).
- Proof test: only if this run fills a blank (one blank, with a proof
  test, per the task). No other `src/js` change. No lever, no gate
  change, no tuning.
- **One blank:** this run fills exactly one blank it finds (missing
  content / dead end / unfireable beat / senseless dialogue), with a
  proof test, or documents precisely why it cannot be fixed.

## Gating freeze (2026-10-27 16:53) stands

No threshold, bar, price, nor gate change in this run. **Perception law
(2026-10-28) stands. Combat-play gate (Steve 2026-11-10 17:52 CST):
no toughness/gear/ability tuning in this run. TEST WITH ENCOUNTER GEAR
(Steve 2026-11-13): the policy fights with the party and gear the
competent player has by the leg.**

## Metric review (carried — proposals, NOT adopted this run)

- r153 item 1: zero-DMG refused-turns bar is over-strict (occupied-cell
  retry with narrated first refusal + successful move). Propose: count
  only refusals where the scholar never moves in the fight, or exclude
  deduped repeats of a narrated refusal. The bar BINDS as written this
  run; the revision is for r155.
- r153 item 2: ARMOR-SILENT analyzer attribution over-claims (lists all
  ok crafts in a seed when any line is missing). Propose: attribute the
  missing line to a specific craft/day. Instrument fix, not a game fix.
- r153 item 3: scholar-deaths bar counts deaths, not fairness (r153: 6
  deaths, all fair shapes with working succession). Whether the bar
  should weight fairness is a Steve/design call, not a mid-run re-score.
- r153 item 4: M-PR1 direction — 10.7%, climbing (4.5% → 10% → 10.7%).
  If it passes the bar, ask whether "stated" resolutions are counted
  too loosely.
- r153 item 5: contest ledger endDay on death-resolved contests — this
  run's investigation item (see Q1 "Interesting if").

## Time-box

Hard stop ~15:45Z (3h from run start). Single arm: 10 fresh seeds ×
28d; each sim ~15s, panel ~3 min. The `--quick` gate runs after the
build commit (~18 min, re-run once if load-flaky per r153 precedent).
