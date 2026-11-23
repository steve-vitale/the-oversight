# journey-landing r155 — PREREG (Lane A, leg 0 LANDING)

**Run id:** `playtest-20261122T2045Z` (scheduled Sun 2026-11-22 20:45 CST).
**Base:** local master `895f7a6ee` at worktree registration (master moved
twice during pre-flight: `ff17699c7` sim-wornstack-a landed while the
reaper scanned; `30c490779` + `895f7a6ee` sim-dawnchoke-rejudge-a
evidence landed before registration; `git pull` at run start had said
up to date at `a4603add1`).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg:
establishment.
**Lock:** `playtest-loop.lock`, run_id `playtest-20261122T2045Z`, created
2026-11-23T02:43:31Z. Delete at closeout in the same call as its read,
only if run_id matches.

## Pre-flight

`git status --short` at run start: EMPTY (the r154 orphan
`evidence/2026-11-22/sim-scale-onramp-round-1115.md` is gone — committed
since). Disk 50% (fine). `git pull --ff-only`: already up to date.
`worktree-reap.sh`: slow scan under load (single `git status --short`
in a sibling worktree ran 5+ min; load avg ~5–9 with sibling gates
running) — waited out, no failure.

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1362–1371** (next after r154's 1352–1361).
`grep -rn --include='*.md' -E '1362[–-]1371|1362|1371' evidence/`:
zero band namings. All hits are incidental: hierarchy.js line numbers
(`renegotiateLink:1362`), kcal/table values (`1362 | 1362`), sim IDs
(`75102 … 1362`), hash fragments (`…1362a608…`), seed lists from other
namespaces (`1203/1367/1342/1362/1329` — five fresh fighters, not a
band). No prereg names 1362–1371. **Band 1362–1371 is fresh.**
Prior landing bands: 1352–1361 (r154), 1342–1351 (r153), 1332–1341
(r152), 1272–1281 (r149), 1262–1271 (r148), 1252–1261 (r147),
1242–1251 (r146), 1232–1241 (r145), 1212–1221 (r143), 1192–1201 (r142),
1182–1191 (r141), 1172–1181 (r140), 1162–1171 (r139), 1142–1151
(r121–r138, deliberate reuse), 1122–1131 (r119), 1083–1092, 1073–1082,
1063–1072, 1053–1062, 1043–1052, 897–906 (contaminated), 887–896,
867–876, 857–866, 847–856, 837–846, 817–826, 797–806, 777–786.

## Base delta vs r154's base `be0cfca40` (src/js, 8 files, +254/−22,
plus one commit landed during this run's pre-flight)

- sim-wornstack-a (`ff17699c7`, landed during pre-flight):
  **mantleBecome carries worn stack units** (finding #2698) — a 2-cell
  stack worn as gear no longer collapses to 1 on succession; proof
  test 13/13 (11/13 on old code), gunloss 42/42 green. "No
  player-visible behavior change." Landing-relevant: succession happens
  in this leg (r154: Charlotte d27) — watch succession gear counts in
  the census.
Live behavior changes (`git log be0cfca40..a4603add1 -- src/js`):
- journey-landing r154 (`29a8dde3a`): **grief-bridge pool 2→6**
  (convo-beats.js) — this run's regression watch: 0 repeats in the
  grief pool; remaining 2-line pools (cheer, past, village, plans,
  gossip, secret) served 0–6 with 0 repeats in r154; village (6) and
  plans (4) are the next to watch.
- journey-establishment r268 (`1c11dbb14`): PLANWAKE fresh band GO,
  **LAUNCHVOICE speaks**, day-desync answered, **STRANDED-CLOSE menu
  fix** [needs-eyes] — landing-relevant: launch voice lines and the
  stranded-close menu are in the landing leg's daily play.
- journey-succession r267 (`970fc5524`): **fill-aware retry in
  topic2Ask** + panel (REL-WIT PASS, first wild witness serving;
  DRY-CENSUS 1 pool-exhaustion dry on table event) [needs-eyes] —
  landing-relevant: topic retry and dry-topic behavior in daily talks.
- journey-deepening r269 (`ddcecb96d`, `9accff480`): **DRY-COUNT
  WASHOUT** — blocked beat restores the dead-react streak so the r246
  exhaustion gate fires + proof 9/9; analyzer parting-prefix fix;
  **MOOT-CLOSE** — evicted favor's live joint run closes its books
  (returned, 0 deposited, mooted:true) + proof 36/36 — landing-
  relevant: react-loop gating and evicted-favor bookkeeping.
- sim-needwave-a/b (`1703f42b7`, `f54c24e42`, `054f525bc`): guarded
  needWave copy in the companion plan sync (copy only when the leader's
  wave number is set; never erase a companion's) [needs-eyes] —
  landing-relevant: plan departures carry needWave now.
- sim-leaderproj-b (`fb0794a44`), sim-leaderhpgate-b (`d9d98bf8f`):
  NO-GO levers (METRIC-BROKEN / CONCEPT-DEAD) — watch only; no live
  behavior change claimed.
- Version bumps only (`c0bf92fca`, `f5b6c71d1`).

## Q1 (PRIMARY) — regression watch on the post-r154 master, fresh band

r154 bars carried verbatim (full list in the r154 prereg; the binding
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
- **Grief bridge (NEW — r154 fix regression watch): 0 repeats in a
  sitting** (pool now 6 lines). Village/plans 2-line pools: report
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
  player heeds must name the danger (r154: 2/2). A heed sitting that
  ends without the danger named is a Q1 failure on live data.
- **Profilegate watch:** win-plans at d14/d28 reported per seed;
  any wave-4+ holder plan inside 28d reported with its trigger.
  **PLANWAKE hold watch:** r154 ignition was 10/10 at d14 — if this
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
  beast named a day late is a Q1 failure on live data. (r154: VERIFIED,
  42 pairs, 0 late.)
- **Settled-reask watch (r152 FIX 2):** every settled-favor re-ask
  on the panel names the favor's short when speakable; a generic "that
  one" re-ask is a Q1 failure on live data. (r154: UNTESTED — no sitting
  pressed the pick.)
- **Broken-favor watch (scale r250 lines):** every broken-favor
  resolution line on the panel names the favor or its short; a bare
  kind id spoken, or a resolution line naming no favor, is a Q1 failure
  on live data. (r154: UNTESTED — no broken-favor repay sitting.)
- **Volley-throw watch (leadgate fix):** any 'v is not defined'
  throw, or any volley error, in a panel fight is a Q1 failure on live
  data. Volley narration must name the weapon actually fired
  (crossvoice: searcaster reads as a gun, not a bow).
- **r267 topic2Ask watch (NEW):** any dry topic (empty-content topic
  line) or topic retry that re-serves the same line verbatim in one
  sitting is a Q1 investigation item. (r267 DRY-CENSUS found 1
  pool-exhaustion dry on a table event — landing has no table event,
  but the retry path is shared.)
- **r268 LAUNCHVOICE watch (NEW):** any launch-voice line that fires
  with no launch, or a launch with no voice line, is reported; a
  launch-voice line naming the wrong wave is a Q1 investigation item.

**Q1b — WARN_YOU DEFLECT SHAPE (r149 item, carried r150–r154 —
tenth carry):** the r150 warn-heed fix closed the heed path (r154:
2/2 heed sittings name the danger). The deflect path is still open: no
deflect sitting fired in r154 either. Remains a design question (how
forcefully a pending warning re-asserts itself); **no fix this run
unless a deflect sitting shows a new defect shape** — else document and
carry with the design decision named.

**Interesting if:** any r154 bar moves on the fresh band; a pocket recurs
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
a told beast named a day late (r152 FIX 1 regression); a settled re-ask
naming no favor (r152 FIX 2 regression); a broken-favor resolution line
naming no favor or a bare kind id; a volley throw or wrong-weapon
volley line; a contest ending by participant death with no endDay
stamp (r154 investigation item — confirm or deny on this panel);
**win-plan ignition below 8/10 at d14** (PLANWAKE hold — r154 was
10/10); **a grief-bridge repeat** (r154 fix regression); **a dry topic
or verbatim topic retry** (r267 watch); **a launch-voice line with no
launch or naming the wrong wave** (r268 watch).

**Bars (bind, r154 bars carried verbatim):** see Q1 list above.
Pilot first: seeds 1362–1365; expand to all 10 unless the pilot is
red. Death-aware horizons (dead village stops, +10d tail max).

## Watch items carried from r154 (no binding bar)

- Hungry-at-horizon 4/10 (r153: 5/10, r152: 6/10) — band variation, no
  src change.
- Win-plans d14 10/10, d28 10/10 (r153: 0/10, 2/10) — PLANWAKE
  ignition; the hold watch above now binds the d14 count loosely
  (investigation item below 8/10).
- Presshop pressFailTotal 5 (r153: 0, r152: 6) — back at the 5+
  threshold; the shape is the narrated pack-full failure, not silent.
- M-PR1 4.5% (r153: 10.7%, r152: 10%, r151: 4.5%) — trend reversed.
- statedAfterPick 6 (threshold ≥6) — all road refusals, intended Q1
  shape; no action.
- Contest ledger endDay on death-resolved contests: still open (0
  death-resolved contests in r154).
- R69 teleLineDisagree=1 (failed craft, no narration line) — instrument
  attribution question, no game defect established.
- R104 popEnd off-by-one on one seed (1360: 12 vs roster 11) —
  instrument quirk, M1 unaffected.
- Link-opener "no repeat verbatim" wording over-strict (1 repeat pair
  across 18 days, same NPC/village) — reported, not a failure.

## Q4 — PEOPLE CHECK

Read 2–3 full transcripts from convo days 7/14/21/28 in full, PLUS the
nonverbal sittings AND all raise talks. Judge sense, not counts. Quote
one specific transcript moment in the run note. Watch: closing-line
duplication (6 sightings in the scale series — count up on this leg),
tell-me-more echo, searcaster-volley narration, departbeat, warn_you
heed, broken-favor resolution lines, r267 topic retries, r268 launch
voice.

## Q5 — CENSUS + W5-INSTANCE (carried, landing-scoped)

w4 fights/kills (landing horizon: wave ≤3 expected; any wave-4 fight
inside 28d is reported), banked veterans (2+), w5 unlocked/faced/killed
(0 expected inside 28d; any occurrence is a finding), tribute states,
survival.

## Q6 — DIALOGUE WATCH (carried)

The r154-recorded flat spots — the NV 3-nod cycle, the "come see what I
found" payoff shrug (orphaned), orphaned invitations in raise talks,
the r239 "tell me more" echo, closing-line duplication, 3/17 transcripts
with NO closing line at all (scale leg). A dialogue-content fix belongs
to this run only if it is a blank this run finds.

## Policy (frozen)

The r154 control policy verbatim (competent player, days 1–28; the
driver is cloned from r154 with only OUTDIR/header/seeds changed).
DAYCAP=28, death-aware stop (+10d tail max). Seeds FRESH 1362–1371.
Pilot: seeds 1362–1365 first. Pilot gates: driver clean, no census
errors > 0, census rows present, reconciliation residual 0 — else STOP
and diagnose (INCOMPLETE, not a verdict).

## Fix scope (pre-registered — the build is not scope creep)

- Driver (`scripts/journey-landing-r155-20261122.js`, cloned from r154):
  seeds 1362–1371, corpus tags r155, EVIDIR 2026-11-22, single arm.
  No behavior change from the r154 control.
- Analyzer script (`evidence/2026-11-22/journey-landing-r155-analyzers.sh`):
  cloned from r154's (15 analyzers, same order).
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

- r154 item 1: zero-DMG refused-turns bar is over-strict (occupied-cell
  retry with narrated first refusal + successful move). Propose: count
  only refusals where the scholar never moves in the fight, or exclude
  deduped repeats of a narrated refusal. The bar BINDS as written this
  run; the revision is for r156.
- r154 item 2: ARMOR-SILENT analyzer attribution over-claims (lists all
  ok crafts in a seed when any line is missing). Propose: attribute the
  missing line to a specific craft/day. Instrument fix, not a game fix.
- r154 item 3: scholar-deaths bar counts deaths, not fairness (r154: 1
  death, a fair shape with working succession). Whether the bar should
  weight fairness is a Steve/design call, not a mid-run re-score.
- r154 item 4: M-PR1 direction — 4.5%, trend reversed (4.5% → 10% →
  10.7% → 4.5%). The "stated counted too loosely" question is answered
  for now: the only established never-offered sitting is a settled favor.
- r154 item 5: R66 "starvingWarnings 0" wording — the instrument reports
  no starvingWarnings count; the corpus carries 3 d6 "⚠ STARVING"
  narration lines (the designed alert, all recovered). The bar text
  needs a definition — narration warnings vs instrument warnings — or
  the wording should follow the revised gate (deaths/slide/band), as
  r151–r154 have adjudicated it.
- r154 item 6: R104 popEnd vs roster — seed 1360's analyzer popEnd=12
  vs census roster 11 alive (1 death d27). Off-by-one on one seed;
  instrument quirk, M1 unaffected.
- r154 item 7: Link-opener "no repeat verbatim" wording — 1 repeat pair
  across 18 days (same NPC/village). Per r151 the wording is over-strict;
  consider retiring it to "no repeat within a sitting / no streak".
- r154 item 8: Namebeast pair-count basis — r154 counted 42 same-file
  pairs + 25 namebeast-only sittings (15 naming a beast told 1–4 days
  earlier, 10 with no earlier tell in the corpus). The told-watch should
  judge same-day pairs only (42/42 verified in r154); namebeast-only
  sittings are the debate continuing, reported descriptively.
- r154 item 9: Grief bridge (fixed) — the remaining 2-line pools (cheer,
  past, village, plans, gossip, secret) served 0–6 with 0 repeats;
  village (6) and plans (4) are the next to watch if subject-picks
  cluster.

## Time-box

Hard stop ~05:45Z (3h from run start). Single arm: 10 fresh seeds ×
28d; each sim ~15s, panel ~3 min. The `--quick` gate runs after the
build commit (~18 min, re-run once if load-flaky per r154 precedent).
