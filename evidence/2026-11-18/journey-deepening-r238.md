# Journey leg DEEPENING — r238 run note (2026-11-18, Lane A)

## Run
Run id `playtest-loop-a-20261118T220705Z` (scheduled Wed 2026-11-18
15:45 CST). Rotation read `2` (deepening); write `2→3` at closeout
with read-back. **Base:** local master `c0151cb53` (worktree branch
journey-deepening; contains ecdee2fff + sim-partyform-diag-a evidence;
no src/js delta vs r237's base except alienPlayers.js,
conversation.js, table.js [tableSitting], build.js). Heartbeat loop
running (9-min cadence, `journey-deepening-hbloop-r238.sh`; restarted
once after the first loop died — see F6). Pre-flight: main tree
CLEAN, disk 53%. Lock created by coordinator 2026-11-18T21:44:05Z.
No push (ship loop owns pushes).
Registration took two attempts (cap hit 16/16, then a ~5-min
lock-queue wait — see F7).

## Pre-registered bars (r238 prereg)
Q1 F1 MARCH GAP, RE-JUDGED: 0 STRANDED days panel-wide (a stranded
day = blades + absent on two consecutive musterPlay mornings);
UNMEASURED if no titan departure with a standing muster occurs. Q2
COALITION-REACH, bar >= 6/8, with link/trust depth reported
alongside. Q1-growth-line as a REGRESSION WATCH (r237 bars unchanged).
Q3 people check (2 full transcripts + muster/march voice in the
wild). Q4 census + reachable/fun/winnable. Carried: trick pipeline,
w4fights/w4kills, banked veterans, w5 unlocked/faced/killed,
slain-field watch, refusal-heard regression watch, scholar-death
standing metric (vs r237: 23 total, 10 wild).

## Pilot (seeds 104802–104804, 100d) — gate passes, no repair owed
Ran clean in ~159s: 3/3 survived to day 100–101, wave 4 on all
three, ladder stage 3 on all three.
**Q1-GROWTH-LINE (pilot): UNMEASURED** — poolDays=0, lineDays=0,
badLines=0, repeatLines=0. No harvestable growth on the pilot seeds;
no NEW bad-line class (a bad line would have been a repair failure).
**Q1-MARCH-GAP (pilot): UNMEASURED** — stoodDown=0, no titan
departure with a standing muster on the pilot seeds.
**Pilot march:** MARCH-SLAIN — 1 march slay, full-strength (700 HP).
**F2 (pilot):** resets=1, rearmed=0, stale=0 → F2-REARM-GO (NO-NEED).
**Q2 (pilot):** reached10=1/3. The pilot seeds are scored in the
panel (r233/r240 precedent — no driver change followed the pilot;
the panel re-runs all 8 seeds in one process, which is the
instrument of record).

## Analyzer verdicts (r238 panel, seeds 104802–104809, 100d)
- **Q1 MARCH GAP: UNMEASURED — stoodDown=0, released=0,
  strandedDays=0, on all 8 seeds.** No herald left the world unslain
  on this band: 4 slain (2 march, 2 field), 3 still present at d100,
  1 seed with no omen at all (104808, lost d54). The stand-down rule
  is proven by the unit tests (M24–M28: fires once, releases,
  skips the slain, skips the empty, defers mid-fight) but
  UNEXERCISED in the wild. Departure rate across r237+r238: 1/16
  seeds. See F1.
- **Q2 COALITION-REACH: 2/8 (bar >= 6/8) — FAIL.** Reached 10:
  104803 (11), 104805 (11). Stuck: 104802 max 9 (18 days one-short),
  104804 max 7, 104806 max 9 (37 one-short days, longest run 25),
  104807 max 9 (34 one-short days, longest run 34), 104809 max 9
  (31 one-short days, longest run 31), 104808 no omen. Depth
  alongside: linksMax 3–5, meanTrustAtEnd 78–87 (104808: 56). The
  wall is deeper than r237's 4/8. See F4.
- **Q1-GROWTH-LINE (regression watch): GO — poolDays=4, lineDays=4,
  badLines=0, repeatLines=0, growthCalls=4, harvestMismatch=0,
  havenMismatch=0.** Per-seed: 104806 3 calls (announced Haven 4 /
  harvested 4), 104807 1 (1/1); allied 0/0 — Haven-only growth on
  this band. The r237 harness repair holds; no regression.
- **F2 MUSTER-RESETS: resets=4, rearmed=0, stale=0 → F2-REARM-GO.**
  All four are post-slay dissolutions (104805 d67, 104803 d90,
  104806 d93, 104809 d89) classified NO-NEED — no new muster was
  needed after the slay. The STALE detector would have caught the
  r236 shape; it did not fire.
- **MARCH: MARCH-SLAIN** — 5 march days, 4 arrived, 2 fought on
  march, 2 slain, 0 fought off march. Both slays full-strength
  (700/700 HP). Ready → fight latency 2 days (104803) and 3 days
  (104805) — far better than r237's 19-day worst (F4). Held:
  blocked-at:5,4 ×1.
- **SLAIN-FIELD: GO** — 2 opportunities, reconciled 2/2, defect 0.
  104806 d92 (Jovan Milic), 104809 d88 (app_mgpsphj7313) — both
  villager combat, both musters cleared.
- **REFUSAL-HEARD: GO** — refused 26, spoken 10, badDays 0,
  dedupeDays 6. The once-a-day dedupe holds.
- **LADDER: OPENS** — peak stage 3, holds 7/8, all five tracks minted
  (fight 7, forage 8, craft 8, talk 8, explore 8).
- **TRICK PIPELINE: flows 8/8** — learnedRate 0.64, counters known
  12–25/seed, tricksHeld 0–4.
- **WAVE 4: 24 fights, 5 kills (0.625/seed), banked2=0, w5 unlocked
  0/8.** Player (scholar-bearer) deaths 20, wild 10.
- **WAVE 5: 0/8 unlocked, 0 faced, 0 killed.** The door never
  opened on this band.

## Q3 — PEOPLE CHECK: PASS, with one voice wrinkle (two full transcripts)
- **Ellie, 104806 day 60** (glazier, cautious, trust 89): MIXED.
  Opens with a real, grounded observation — "People are smiling. I
  forgot what that looked like. Just my read." — in a village that
  has lost 12 people, that line lands. But the close mismatches the
  sitting: "This stays between us, right? Right." fires on a
  sitting where NOTHING was confided (want curious, never
  established; the player only listened twice). The double-listen
  gives "Anyway." + a nod — thin, but honest for a cautious
  villager. The "stays between us" close is the only occurrence in
  106 transcripts: a rare mismatch, not a systemic one. See F-new
  (voice).
- **Amanda, 104802 day 60** (fishing guide, intense, trust 47,
  hungry): PASS, with a picker caveat. The ask is real — "I hate
  to ask, but tell me you've got food to spare. I'm past hungry
  here. I can't keep going like this." The driver deflected into
  teaching (Common Plantain, Groundnut, Spicebush, White Oak
  Acorns), each lesson landing with its own reaction ("And I've
  been walking past it for weeks."). The want ends 'stated', never
  promised — but the answer path EXISTS: the same Amanda on day 24
  shows dlg:more → favor_requirements → commit → "Thank you. I
  won't forget who fed me when it mattered." The day-60 'stated'
  is the driver's pick (teach over dlg:more), not a missing menu.
  The teaching is itself a genuine answer to hunger in the long
  run, and Amanda ends the sitting herself ("Alright — I should
  get back to it."). The ending plants an owe (she is still
  hungry; the ask is still open) and closes warmly.
- **Muster/march voice in the wild:** the growth line on 104806
  (d53/54/67) names the verb, the number, and the gap: "📯 The
  fires have warmed since the call — Haven has 1 volunteer free
  to march — the commit sends them. The muster would stand at 9
  of the 10 THE HERALD demands. Still short — but the gap is
  closing." Note: d53/d54 carry IDENTICAL text (same numbers, a
  different volunteer each day — the line never names WHO, so
  consecutive days read identically; the analyzer counts 0 repeats
  because each day had its own growth call + exact harvest). No
  MUSTER BREAKS line anywhere in the wild — the rule never fired.

## Q4 — CENSUS (plain words)
Eight villages, 100–101 days (one lost d54). **Seven survived.**
Last-living pops: 11, 11, 10, 11, 4, 8, 3, 9. Standing at d100:
100, 175, 195, 155, 200, 150, 45, 250 — all regional, none
national. Pantries at end: 9,716 / 9,975 / 9,551 / 11,544 / 4,213 /
8,600 / 0 / 8,586 kcal.
- **104802 — the one-short village.** 11 alive, standing 100. The
  Herald stood at d100 with 525/700 HP, the muster at 9 (6+3) for
  18 straight days. 1 fell (contest). Codex grew by 56.
- **104803 — the march slay.** 11 alive, standing 175. Ready d87,
  marched, slew the full-health Herald d89 with 8 blades. 1 fell
  (the wild). Codex grew by 58.
- **104804 — the shallowest coalition.** 10 alive, standing 195.
  Max 7 blades; the Herald stood at d100 at full HP, never fought.
  2 fell (ambush, the wild). Codex grew by 87 — the deepest
  knowledge on the panel.
- **104805 — the fast march slay.** 11 alive, standing 155. Ready
  d63, slew the full-health Herald d66. 1 fell (contest). Codex
  grew by 79.
- **104806 — the hard village.** 4 alive, standing 200. 12 fell
  (the wild ×5, monster ×3). The Herald was ground 700 → 1 HP by
  villager field fights over 40 days, then Jovan Milic slew it in
  the field d92; the wrapper refused the scholar 14 times at "have
  6" in that span. Pantry thinnest at end (4,213). Codex grew by
  92.
- **104807 — the longest one-short run.** 8 alive, standing 150.
  34 straight days at 9 blades; the Herald stood at d100 at 1 HP
  — ground down by field fights, never slain. 4 fell (ambush, the
  night). Codex grew by 74.
- **104808 — the lost village.** 3 alive at loss, standing 45.
  Lost d54 to scatter-hunger: starvation ×5, a wound that wouldn't
  close ×2. No herald omen was ever located. Codex grew by 62.
- **104809 — the field slay.** 9 alive, standing 250 (highest on
  the panel). The Herald ground 700 → 175 HP, slain in the field
  d88. 6 fell (monster ×2, the wild ×2). Codex grew by 74.
- **The dying:** 38 villagers fell across the eight villages.
  Named causes in the debriefs: the wild 8+, monster 5+, starvation
  5, contest 2, ambush 2, a wound that wouldn't close 2, the night
  1 (debriefs name top causes only). Scholar bearers died 20 times
  (10 in the wild) — same wild count as r237 (10), fewer total
  (23 → 20).
- **What they knew:** the scholar's plant codex holds 33–59 entries
  per village at end (max plantsKnown). Wave-3 tricks: 12–25
  counters known per seed, 0–4 tricks held.
- **What they carried:** bonds — 174 telemetry events, 88
  proposals, 30 decisions, 15 accepts (0.50; r237: 0.57). Pantries
  end 0–11,544 kcal. Wave 4 reached on 7/8 seeds; wave-5 door
  never opened.
- **Social life:** wants are raised and answered about half the
  time (ask_favor across the panel: 18 promised, 19 stated, 3
  unestablished/unresolved of 40) — the promise path exists and
  works when the player takes it (Amanda d24); the teaching
  deflection is the honest fallback for a hungry villager.

## New findings (for the tracker / next runs)

- **F1 — Q1 UNMEASURED: no departure on this band.** The
  stand-down rule is proven at the unit level (M24–M28) and
  carried in the driver at zero cost when unexercised, but the
  wild re-judge needs a band with a departure. Departure rate
  across r237+r238: 1/16 seeds. The next run that wants the wild
  verdict should either run a wider band or stage a departure
  probe (driver-side removal of the herald from the world census
  with a standing muster) — the prereg must name that probe
  explicitly; this run's prereg bound the verdict to wild
  observation, so UNMEASURED stands.
- **F2 — Refusal line understates the muster (voice).** The titan
  fight wrapper's refusal counts ALLIED blades only ("you have
  6") while the hard gate counts allied + Haven (the village saw
  9 standing: 6 allies + 3 Haven). On 104806/104807 the line said
  6 on 14 refusals each while the muster stood at 9. The gate is
  right — the muster genuinely is short of 10 — but the spoken
  number is wrong, and a player counting 9 blades hears 6. Owed
  to the march/titan build: count Haven in the spoken `have`
  (titans.js, the `have` read next to the refusal line).
- **F3 — The field grinds the Herald down while the wrapper
  refuses the scholar.** 104806's Herald went 700 → 1 HP from
  villager field fights before the field slay; 104807's went
  700 → 1 and still stands at d100. The two march slays were the
  only full-strength fights; the field kills are attrition kills.
  Watch, not a defect (r237 F3 carries): the field damage is
  honest, but the full-strength bar should be read with it.
- **F4 — The coalition wall deepened: 2/8 (r237: 4/8, r235: 4/8,
  r236: 1/8).** Four villages sat one blade short for 18–34 days.
  The growth line fired on only 2 seeds (4 pool days) — the pool
  is thin because trust/link growth between calls is slow on this
  band. The next lever remains trust/link depth (r237 F5 carries).
  104808 never even located the omen before the village was lost.
- **F5 — 104808 lost d54 to scatter-hunger** (starvation ×5):
  the only village-lost seed. The deepening leg's food pressure
  still bites on the thin band.
- **F6 — Heartbeat loop died mid-run (infra, not a write flap).**
  The first hbloop (pid 37642) died sometime before 22:22; the
  registry heartbeat went 15 minutes stale; re-heartbeated by hand
  at 22:23 and restarted the loop (pid 10987). No evidence lost.
  Same class as r237's service restart.
- **F7 — Registration cap hit (infra).** The first register failed
  16/16 active; `worktree-reap.sh` freed 2 stale trees
  (sim-wildavoid-seedplan-a, sim-fightcap-dmg-a, both 4.4h stale,
  branches kept with 5 commits ahead of master — no work lost);
  the retry registered cleanly after a ~5-minute lock-queue wait.
- **F8 (voice, rare) — "This stays between us" closes a sitting
  with no secret.** Ellie 104806 d60: the secrecy close fires
  once in 106 transcripts, on the one sitting where nothing was
  confided. The close pool should be gated on a secret having been
  shared (or the line moved to the secret-close pool only).

## Verdicts (leg: deepening, days 40–80)
- **Reachable:** YES. Waves 3–4 fought on 7/8 seeds, regional
  links on 7/8, titans located on 7/8, musters called on 7/7 with
  titans, march slays on 2/8, field slays on 2/8, growth lines
  firing on 2/8. The deepening content is reachable.
- **Fun:** PARTLY. The march slays are the payoff the leg
  promises, and they now land in 2–3 days when the muster
  completes. But four villages sat one blade short for weeks (one
  for 34 days), the growth line stayed silent on 6/8 seeds, and
  the Herald stood un-fought for 40 days on two seeds while the
  wrapper refused the scholar 14 times each. The wall is still
  the 10-blade bar — now deeper, not shallower.
- **Winnable:** NOT on this band. Wave-4 kills 5 (0.625/seed),
  banked pairs 0, wave-5 door opened 0/8. The chain still binds at
  wave-4 kills and the 10-blade bar — the same wall r235/r236/r237
  measured, now with the stand-down rule proven at unit level but
  unexercised in the wild.

## Metric review (§14)
- **Q1 bar — sound, phenomenon thin.** The STRANDED-day bar is
  the right judge for the stand-down rule, but the departure it
  judges occurs ~1/16 seeds. Keep the bar as written; a future
  run should either widen the band or prereg a staged-departure
  probe. The unit proof (M24–M28) stands as the mechanism proof
  in the meantime. No analyzer change was needed for Q1.
- **Q2 bar — keep >= 6/8, read with depth.** 2/8 with linksMax
  3–5 and meanTrust 78–87 reported alongside. The bar is a
  property of the band's trust/link depth, not of the stand-down
  rule — the depth fields ride on the per-seed row.
- **Q1-growth regression watch — GO, keep as a watch.** 4/4
  harvests exact on both legs. The r237 harness repair holds.
- **F2 watch — REARM-GO, keep as a watch.** 4 resets, 0 stale,
  all NO-NEED (post-slay). The STALE detector worked (it would
  have caught the r236 shape).
- **Scholar deaths 20 total, 10 wild — WATCH, at bar.** Same wild
  count as r237 (10), fewer total (23 → 20). No directional call
  owed.
- **Gate — 338 passed, 6 failed in 432s, 0 attributable: GO.** The
  6, each verified pre-existing (no src/js change this run; no
  failing test loads an r238 file):
  - `test-measurement-proof-update.js` +
    `test-measurement-workflow.js` — the balance-proof manifest is
    STALE ("Proof source inputs are not current"). Same pair as
    r233/r236/r237; the refresh is measurement-maintenance work,
    not this run's.
  - `test-phone-frame-proof.js` — phone-frame receipt staleness
    (same messages as r233/r236/r237).
  - `test-living-garden-deed-attainment.js` +
    `test-one-person-army-deed-attainment.js` — 120s timeouts on the
    loaded box (the standing deed-attainment timeout class; r237
    had 7 such timeouts). Load, not code.
  - `test-ladder-bundle-20261108.js` — same control fail as r237
    (200 monster turns WITHOUT delivery fire the ambient raid —
    fires 0).
  - Fewer failures than r237 (6 vs 12): no cache-flags failure,
    no occupation-panels/solo-campaign-endings/
    trust-observer-neutrality/synergy-stall/capable-bot timeouts.
    The gate ran 4× faster than r237's (432s vs 1743s) with no
    sibling gate concurrent.
  - Separately verified, NOT a gate failure: the r238 proof tests
    (muster 37/37, march 11/11, analyzer 80/80) all green in the
    worktree, and the r237 analyzer test still passes on the r237
    files (the fork regressed nothing — verified by the analyzer
    test run against the r237 analyzer file).

## Telemetry check (§14)
`telemetry-check.js` vs `telemetry-baselines/deepening.json`
(metrics w3fights, engaged.w3, fightsTotal, fightsByWave.3):
**QUIET** (8 files, 4 metrics, no large deviations). Baseline not
rolled.

## Gate check
`node scripts/check.js --quick` in the worktree, log
`evidence/2026-11-18/journey-deepening-r238-gate.log` —
**338 passed, 6 failed in 432s, 0 attributable.** The 6, each
verified pre-existing (no src/js change this run; no failing test
loads an r238 file):
- `test-measurement-proof-update.js` +
  `test-measurement-workflow.js` — the balance-proof manifest is
  STALE ("Proof source inputs are not current"). Same pair as
  r233/r236/r237; the refresh is measurement-maintenance work, not
  this run's.
- `test-phone-frame-proof.js` — phone-frame receipt staleness
  (same messages as r233/r236/r237).
- `test-living-garden-deed-attainment.js` +
  `test-one-person-army-deed-attainment.js` — 120s timeouts on the
  loaded box (the standing deed-attainment timeout class). Load,
  not code.
- `test-ladder-bundle-20261108.js` — same control fail as r237
  (200 monster turns WITHOUT delivery fire the ambient raid — fires
  0).
- Fewer failures than r237 (6 vs 12): no cache-flags failure, no
  occupation-panels/solo-campaign-endings/
  trust-observer-neutrality/synergy-stall/capable-bot timeouts.
  The gate ran 4× faster than r237's (432s vs 1743s) with no
  sibling gate concurrent.
- Separately verified, NOT a gate failure: the r238 proof tests
  (muster 37/37, march 11/11, analyzer 80/80) all green in the
  worktree.

## Closeout
- (to be filled)
- The r238 panel corpus (per-seed JSONs + convo transcripts +
  analyzer log + gate log) lives under the goal hidden_files
  evidence dir for 2026-11-18; the repo evidence dir holds the
  prereg, this run note, and the pilot/panel/analyzer/gate logs.
