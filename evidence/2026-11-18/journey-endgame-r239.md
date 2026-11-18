# Journey endgame r239 — run note (Lane B leg 4, 2026-11-18)

Leg 4 (endgame). Rotation-b read 4 at run start. Substrate master
03c53bf6e exactly. Probe scripts/probe-endgame-r239-20261118.js (r237
probe verbatim except renames, evidence dir 2026-11-18, PLAN-map
entries 89780–89787 — verified by diff: only renames, dates, comment
reflows, and the new band; zero logic change). Analyzer
scripts/analyze-endgame-r239-20261118.js (same treatment).

## Run-start incidents (infrastructure, not measurement)

- Lock: none present at run start. This run's lock written
  2026-11-18T06:56:13Z. NOTE: the lock run_id string says r238
  ("journey2-endgame-r238-20261118T065613Z") — a copy slip in the id
  string only; the run itself is r239 throughout (max journey number
  on disk was r238, crisis). The lock is deleted at closeout either
  way; no run-number collision (no r238 endgame exists).
- Main tree: `git status --short` 0 lines, disk 50% (fail line 85%).
- `git pull` "Already up to date" at 06:56Z (master 03c53bf6e).
- Reaper ran at run start: SKIPPED (registry lock held by another
  reaper run, consecutive skips: 1) — no cleanup this run; 16 trees
  listed, several LOUD-dirty from other owners (never auto-removed,
  not mine to touch).
- Registration: `worktree-register.sh journey2-endgame` completed in
  ~5.3 min. Branch journey2-endgame did not exist (deleted at r237
  release), so `-b` created it fresh at master. Heartbeat landed at
  registration (06:58:14Z); hbloop journey2-endgame-hbloop-r239.sh
  started, every 5 min. One follow-up heartbeat queued ~3 min on the
  registry lock behind a Loop A registration (sim-taxonomy2516-a) —
  lock contention, not a failure; it completed.
- EVIDDIR set explicitly on EVERY pass invocation (r237 incident
  lesson). No overwrite: all four pass corpora verified intact and
  distinct (A 12 files, C 12, C-wide 16, D 12).

## Headline

The buyout road did NOT convert on the matched band this round
(Pass C: 0/6, gate never ok) — but it converted TWICE with the second
ally slot on (Pass D: 2/6 full seats), and ONCE on the fresh band
(C-wide: 89781 FULL d92 — the first full seat ever on a fresh C-wide
band). The matched band's star seed 89701 collapsed (uw 5→4, standing
430→199, 0 kills) on a trajectory re-roll: no live fight/plan lever
changed under the default flags, so the re-roll is attributed to the
dialogue/RNG-draw delta (d) — kills still happen panel-wide (Pass A
6 kills, Pass C 5, Pass D 13). F1 filed: seed 89783 (C-wide) — an
exiled scholar's village never sat the table in 91 days (guard blocked
on a monster standing on the scholar's tile + exile blocking the Haven
return); documented below, fix owed as a follow-up arm, NOT fixed this
run (r147 rule — not pre-registered).

## Pass A-live (CAPSTONE unset, BUYOUT unset) — PRIMARY GO | ALL GO

Matched re-run vs r237 pass A (seeds 89701–89706).
PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO. CORPUS-PURITY GO 6/6.

- lesser 6/6, full 0/6, won 6/6. M23b 1/6 (89702@d85 — identical
  to r237).
- 89701: uw 4 (r237: 5), FACED 0 (r237: ×2), standing peak 199
  (r237: 430 derived / 431 raw — the raw trace STILL peaks at 431,
  so the standing collapse is the 199-cap never releasing, i.e. the
  uw collapse, not a separate standing change), sat d108 (defer 18d,
  endGuard losses), peakVet 0 (r237: 2), kills 0, w4plusKills 0,
  killLog empty. The village's 9 wave-4 fights all ended talkDown /
  otherEnd — nobody killed a wave-4 monster, nobody banked a veteran.
  **The one headline difference vs r237**, attributed first to (d)
  dialogue/RNG-draw shifting: no live fight/plan lever changed, and
  the panel's other seeds still kill (89702: 4 kills, 89703: 2).
- 89702: uw 5, FACED wave 5 ×4 (editor d80, spoiler d85,
  cancellation d86, rerun d87), standing peak 387, deedGate ok d85,
  peakVet 3, sat d90 — headline-IDENTICAL to r237.
- 89703: uw 4, peak 199, sat d95, peakVet 1, kills 2. Matches r237.
- 89704: uw 4 (r237: 5 NEVER-ARRIVED), peak 170 (r237: 292), sat
  d90, peakVet 0. Second re-roll in the same direction as 89701.
- 89705: uw 4, sat d104 (r237: d99), peak 199, survives (Q9 holds —
  r230's d59 loss stays in the past).
- 89706: uw 4, sat d90 (r237: d100), peakVet 1.
- M4-wave5-or-full 1/5 (89702 OPEN). M11 peaks 199/387/199/199/199.
  M20 mech199 true on 5/6 (89704 false — never reached 199).
- Starvation: Daniel Zhu d12 (89702) — same as r237.
- deathCleanups 14 total (1/5/0/1/3/4), removalCleanups 1 (89702),
  no stranded launch observed. companionGuardSkips 10 total.
- 159-turn Algorithm fight (r194): NO recurrence (longest multi-turn
  fight 30 turns, 89702 reunion d60). fastW4 diedInFight gap (r171):
  fastW4 0 on all seeds — no recurrence.

## Pass C-live (CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1) — PRIMARY NO-GO (M23 VACUOUS)

Matched to r237 pass C (seeds 89701–89706).
PRIMARY-BINDINGS VACUOUS-UNANSWERED | PRIMARY NO-GO | ALL NO-GO.
CORPUS-PURITY GO 6/6. The NO-GO is M23-capstone VACUOUS: no seed
reached deedGateReady().ok, so the capstone binding has no eligible
seed to judge — the road didn't fail a delivery, it never got a gate
to deliver through.

- lesser 5/6, full 0/6, **lost 1/6 — 89702 village-lost d89**.
  M23b 0/6 (r237: 1/6). M25c 6/6 bought early.
- 89702 VILLAGE-LOST (pre-registered interesting finding — a village
  dying before d90): scattering d89, "Haven couldn't hold. On the
  third hungry day, people started walking — in different
  directions. The scattering, again." Pantry 0 at end, 7 alive, 17
  deaths (1 starvation: Daniel Zhu d12 — the same early death as
  Pass A). The buyout bought d18 (pantry 51,288→43,263 — the same
  numbers as r237 Pass C, bit-identical early game, diverging later)
  and did NOT starve them; the pantry ran to 0 later. A food-collapse
  death, not a wiring failure. The seed still unlocked wave 5 and
  FACED 1 (editor d79) before dying; release snap d70 (1 living
  veteran — Nora Wilson, who died d70 in the reunion fight).
- 89703: did NOT convert (r237: FULL d90). uw 4, peakVet 1, sat d91
  lesser. In r237 Pass C it faced wave 5 twice; this round it faced
  0 — the w5 bar (2 distinct) failed, so the gate never went ok.
- 89705: uw 5 (NEW — r237 Pass C: uw 5 NEVER-ARRIVED), standing
  peak **562** (new panel high; r237: 199), release snap d79 ready
  (2 living veterans), peakVet 2 — but NEVER FACED wave 5 (blocked
  d84), sat lesser d90. The unlock without the facing: the gate's w5
  bar stayed 0/2.
- 89701: uw 4, sat d90 lesser. 89704: uw 4, sat d95, 1 fight in
  census. 89706: uw 4, sat d102, 15 deaths.
- M4-wave5-or-full 2/5 (89702 + 89705 OPEN). M11 peaks
  199/371/199/562/199.
- deathCleanups 14 total (0/5/0/1/3/5), removalCleanups 0, no
  stranded launch. companionGuardSkips 12 total (r237: 14).
- Buyout road conversion across rounds: r233 1/6, r237 1/6, r239
  0/6 on the matched band. The road converts roughly 1-in-6 seeds
  per round and this round drew zero — the gate, not the buyout, is
  the fragile link (every seed bought; no seed's gate opened).

## Pass C-wide (STRETCH, fresh 89780–89787) — WIDE-VERDICT GO

M25c 7/8 bought, CORPUS-PURITY 8/8.
WIDE-VERDICT GO (M25c + starvation tally).

- lesser 7/8, **full 1/8 — 89781 TOOK THE FULL SEAT d92**, lost 0/8,
  never-sat 1/8 (89783, see F1).
- **89781 FULL d92 (feast_embassy delivered d84, deedGate ok d84,
  pricedFull d85, sat full d92, beloved/light, won).** w5 faced:
  spoiler d79, editor d85. uw 5, peakVet 2, standing 297. Buyout
  bought d51 after 8 refused attempts (away from Haven). **The
  FIRST full seat on a fresh C-wide band** (r233: 0/8, r237: 0/8).
  The buyout road converts on fresh seeds, not just the matched band.
- 89782: uw 5 (peakVet 2, standing 431) but gate never ok, sat
  lesser d92 — a second fresh-band wave-5 unlock with no facing.
- 89780: lesser d102, 1 starvation death (Teresa Tkachenko d69)
  after buying d48. 89784/89785: standing 145 (never reached 199).
  89786: lesser d93, 4 deaths (fewest on the band).
- 89783: NEVER SAT (see F1 below). Bought=none — 140+ early
  attempts refused ("You need to be at the haven" / "Exile means
  exile. The fire isn't yours to open.") with a pantry up to 129,334.
- Starvation tally: 1 death on the band (89780 Teresa d69).
- deathCleanups 13 total, removalCleanups 0. companionGuardSkips 2.

## F1 — 89783: exiled scholar, table never sat in 91 days (FILED, not fixed)

Seed 89783 (C-wide): announced d90, never sat through the d181 probe
horizon. Guard trace: 91 consecutive days blocked — "Finish the
current encounter before taking your seat" (71d) / "Return to Haven
to take your seat" (20d). The village survived (7 alive, pantry
16,600 at d180); the scholar starved outside the pantry ("The pantry
is closed to you", STARVING + DEHYDRATED warnings). Overtime reached
tier 4 while the seat sat untakeable.

Mechanism (from code, not invented): table.js:1184 blocks sitting
while `inCombat() || state.scholar.monster`, and `playerMonster()`
(game.js:20577) is any world monster on the scholar's tile — the
guard's "current encounter" is a monster standing on the scholar's
tile, not an active fight. The scholar was exiled early ("Haven's
council doesn't take orders from the road. Exile means exile." —
voiced 8+ times; "Still exiled, still here. Yara turns away.") and
camped where treeline raiders stand nightly (66 "Nobody met ..."
lines across 11 monster kinds, Herald ×13) — so a monster was on the
scholar's tile most dawns, and the exile itself blocked the Haven
return on the other days. Doubly blocked, no legible player action
clears either half: the guard reason never names the tile-monster,
and exile offers no return path in the transcript.

Verdict: every piece is voiced (exile, treeline raiders, guard reason,
overtime) — it reads as an honest tragedy, not a silent bug — but the
win path is fully blocked with no player action available to clear it.
Fix shape owed (follow-up arm, NOT this run — r147 rule, not
pre-registered): the guard should not block on a non-combat
treeline presence (or should name the tile-monster and the step-away),
and/or exile needs a return path. A real player who walks one tile
away from the treeline could clear the monster half — the game never
says so.

## Pass D (STRETCH, NEW LEVER: FIGHTALLY2=1 + CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1) — PRIMARY GO | ALL GO

First endgame-panel sighting of the second ally slot, matched seeds
89701–89706. PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO.
CORPUS-PURITY GO 6/6.

- lesser 4/6, **full 2/6 — 89702 AND 89705 took the full seat**,
  won 6/6. M23b 2/6 (89702@d85/DELIVERED, 89705@d73/DELIVERED).
  M23-capstone: 2 eligible, delivered 2/2, pricedFull 2/2, 0
  non-exempt refusals.
- 89702: FULL (feast_embassy@d85, firstFullSeatDay d86, sat full
  d90), uw 5, FACED 2 (spoiler d72, cancellation d85), peakVet 2,
  standing 491.
- 89705: FULL (feast_embassy@d73, firstFullSeatDay d74, sat full
  d90), uw 5, FACED 2 (timeslot d61, network_note d71), peakVet 3,
  standing **612** (highest standing peak on any r239 pass).
- 89706: uw 5 (was uw 4 on A and C), FACED 1 (editor d87),
  peakVet 2, standing 467, kills 6 (most on the panel), sat d92
  lesser (gate never ok — the w5 bar was 1/2).
- 89701: uw 4 but peakVet 1 (was 0 on A/C) and 1 kill (was 0).
- M4-wave5-or-full 3/5 (89702, 89705, 89706 OPEN) vs A 1/5, C 2/5.
- Kills: vKill n=13 (vs C 5, A 6 — analyzer tallies); vDie n=1
  (vs C 4), vFlee n=4 (vs C 6), mFlee n=5 (vs C 11). Damage share
  on kills ~0.89 (C 0.96) — the lever doesn't make hits bigger, it
  tips fights that fled/died into kills. Wave-5 faced on 3/6 seeds
  (vs 1/6 on A and C).
- Q14 (the #2515 sense question): PARTIALLY answered. The fight
  engine fields bigger parties and kills double — but this
  instrument cannot see the villager-side sense cap: every fight in
  the corpus is scholar-led (partyKeys always include 'p'), so no
  villager meeting party of 4 is observable here. The sense question
  stays open for the tracer/sim arms; the endgame effect of the
  lever is established.
- Caveat (stated plainly): D-vs-C on the same seeds is NOT a clean
  A/B — FIGHTALLY2 changes fight RNG draws, so trajectories re-roll
  after the first FIGHTALLY2 fight. The direction (more kills →
  more veterans → gate opens → full seats) matches the mechanism
  the fightallycap-b arm proved (GO, 22/22), and the effect size
  (0/6 → 2/6 full seats, kills 5→13) is large for n=6.
- deathCleanups 13 total, removalCleanups 0. companionGuardSkips 15
  (89705: 13 — the full-seat seed launched the most).

## People check — PASS

Transcripts read in full: 89702-A (66 lines), 89705-C (49 lines),
89705-D (50 lines); 89701-A tail (finale) + repeat scans;
89702-C contexts; 89783-Cwide tail + exile lines. (Pass A 89701's
2096-line announce window was scanned for repeats/anomalies and its
finale read in full; the 89702-C 13,745-line full-run transcript was
scanned the same way.)

- Named villagers acting like people: Sanne teaching White Oak Acorns
  then catching themself ("Hold on — I already showed you this one.
  You remember."); Zoe showing the scholar her thinking place
  ("Don't tell the others. Everyone needs one place."); Rosa/Mara
  boiling water and curing the sick ("Mara cured them — and the camp
  saw it."); Paula Rosas + Mateo Alvarez ascending together ("gods,
  it turns out, have politics"); Aurora Schmitz walking out of the
  light alone.
- The System asking about grief: "Grief isn't a load... It's a
  ledger. It's how we prove the person was WORTH the noise." /
  "I HAVE NEVER BEEN WORTH ANYONE'S NOISE" — the machine learning
  grief, voiced.
- The audits name real deeds and real shortfalls: 89702-A ("On day
  80, Onni put down Don't-Look. On day 73, Nadia put down The Big
  Beast"), 89701-A ("only 0 of 2 different wave-5 monsters faced"),
  89705-D ("A full seat. global standing, every wave faced, the
  deeds complete. The table rises when you enter.").
- The pod thread returns in every epilogue as the moral sting ("The
  mourners asked you, and you changed the subject." / "The System
  put a pod on the screen, and you let the segment play.").
- No dry line, no SYSTEM:"" line (0 on every pass), no senseless
  passage found.
- Branch check (investigated, NOT a defect): 89701-A's audit says
  "More promises broken than kept" yet walks beloved/light. The
  branch is a weighted score (table.js tableBranch: broken>kept adds
  +2 dark; protected>=killed +2 light, foodShared +1 light, beloved
  showmanship check 0 → light 3, dark 2), and the audit voices the
  broken-promises note honestly. The TABLE.md sketch ("promises
  kept" for light) is a design summary, not a veto rule.

## Watches

- F5 settled-favor (Q5): 0 exact-variant servings
  ("It's already handled. Thank you for asking.") on ALL passes —
  vacuous for a third straight round on the endgame leg. The branch
  IS reachable in panel play (succession r230 fired 2×); the endgame
  panel's sittings never reach it. Stays a watch, not a binding.
- C3d recap-live-want (Q6): 0 "recap" mentions on any transcript —
  vacuous again (no recap sittings on the endgame panel).
- "It's handled" repeat (r237 NEW watch): recurs — 6× verbatim on
  89702-C (Ines, Chris, Meera ×2, Saiful, Ruth — different patients,
  different days, one template) plus 1× each on 89701-A and 89705-A.
  NEW DETAIL this round: the tender VARIES (named Meera ×1, the
  scholar ×3, a stranger "A woman, maybe 40s" ×2). The stranger
  descriptor is the honest convention for unnamed strangers
  (membership.js / villager-objectives.js: a stranger descriptor is
  used whole, never its first word) — two same-descriptor strangers
  print identically, a known limitation, not a defect. Dialogue-pass
  item, not a binding.
- Wait-line monotony (NEW watch, not a defect): "You wait. The light
  changes. Nothing asks anything of you." serves 51× (89701-A),
  249× (89702-C), 225× "Rubble chokes the path." + 136× "You hurl
  yourself at the barrier" on 89702-C — the bot's repeated waits and
  flee attempts, honestly narrated each time. A real player would
  stop after a few; the lines are correct, just unvaried. Content
  ask (wait/flee line variety), not a bug.
- Stock banter repeats (NEW watch): "💬 Aria: 'Huh. Never been this
  way before.'" 2× on 89702-A; "💬 Ethan: 'Finally. I was getting
  bored.' 💬 Zoe: '...Yeah.'" identical on 89705-C AND 89705-D.
  Fixed banter pairs, served verbatim across seeds/passes. Minor.
- Eurika tax (checked, NOT a defect): "Static floods your senses —
  too much world, all at once. (-1 HP)" 113× on 89702-C is the
  Eurika virus tick (statusEffects.json: permanent alien disease,
  1 HP per dayPart, "It doesn't leave. It's part of you now."). The
  fiction prices it explicitly; the bleed is the cost of the
  mosquito bite. Not a bug.
- M22-feast-hold: 89705 UNEXPLAINED=1 in r237 — not re-checked this
  run (analyzer carries the tally; no new unexplained hold surfaced
  in the run note's pass summaries).
- Q7 companionGuard: skips A 10 / C 12 / C-wide 2 / D 15; no plan
  record listing a companion who never left (mirror gap stays
  closed). medicDutyBlocked: A unmeasured (analyzer prints it in
  the C section — C total not extracted; r237 C: 195).
- Q8 deathCleanups: A 14 / C 14 / C-wide 13 / D 13, removalCleanups
  A 1 / C 0 / C-wide 0 / D 0, no stranded launch observed on any
  pass.
- Q9 89705: survives on all four passes (A sat d104; C sat d90;
  D sat d90 full). The r230 d59 loss stays in the past.
- Q10 starvation watch: bought seeds — A: Daniel Zhu d12 (89702);
  C: same + 89702's village scattered d89 on an empty pantry; D:
  89702 1 starvation death (which one? — the per-seed table says
  starv=1; the Joja price is 1 life on that seed, same as r237's
  Ruth pattern); C-wide: Teresa Tkachenko d69 (89780).
- Q11 funeral-mend: not observed firing on this round's passes
  (no funeral-mend event in the analyzer sections; r237 saw it on
  C-wide). Watch stays open.
- M9b-contention-share INFO watch flags on Pass C (waves share
  47.9% vs r74 79.4%, swing 31.5pt; wavesnw 84.6% vs r74 93.1%) —
  INFO only, not bindings; the same section flagged in r237's
  analysis. No action this run.
- DRY census: 0 dry hits on every pass (analyzer).

## Metric review

- M23b tally: Pass A 1/6 (89702@d85), Pass C 0/6, C-wide 0/8
  (89781's gate went ok d84 but M23b is a per-pass tally on the
  matched band — the C-wide gate-ok is recorded separately: 89781
  gate ok d84, delivered d84, full d92), Pass D 2/6
  (89702@d85, 89705@d73 — both DELIVERED).
- F5 + C3d stay vacuous on the endgame leg for a third straight
  round — the watches need a panel whose sittings reach them, not a
  metric change.
- The 89783 F1 softlock is a NEW finding class for this leg (a
  never-sitting village), not a metric change. The M6
  guard-named-deferred binding held (every deferred sat named its
  reason — the guard named "Finish the current encounter" 71 times);
  the gap is that the named reason never resolves, which no binding
  measures. Propose for the NEXT run: a guard-stall watch (same
  not-ready reason ≥30 consecutive days = LOUD line in the run note).
- Pass D (FIGHTALLY2): NEW observation tally this run — kills 13
  (C 5, A 6), full seats 2/6 (C 0/6), wave-5 faced 3/6 seeds (C 1/6),
  M4 3/5 (C 2/5). Judged against the Pass C numbers on the same
  seeds, not a frozen bar (first sighting). The lever moves the
  endgame on the matched band.
- Telemetry baseline: r188 stands (see below).

## Gate + telemetry

- Telemetry: QUIET. Pass-A 5-seed sums (uw 21 vs 22, won 5 vs 4,
  peakVet 4 vs 8) against the r188 baseline — 5 seed rows, 3 metrics,
  no large deviations (peakVet rel change 0.5 < 0.6 LOUD threshold).
  The peakVet 4-vs-8 is the explained headline (89701 + 89704
  re-rolls banked no veterans; kills still happen panel-wide).
  Baseline NOT rolled.
- Gate (`check.js --quick`): PENDING at note-writing time — see gate
  log. [TO BE FILLED when the gate completes.]

## Closeout

- Evidence-only run + one stretch lever sighting (Pass D, env-gated
  FIGHTALLY2 — no src/js change this run). No fix arm this run.
- Rotation-b write (4→5, social life) is owed at landing, after the
  merge is verified.
- Files: prereg, probe/analyzer clones, smoke + pass-A + pass-C +
  pass-C-wide + pass-D logs, analyze-A + analyze-C + analyze-C-wide
  + analyze-D logs, perseed corpora (A in perseed-endgame-r239/,
  C in perseed-endgame-r239-c/, C-wide in
  perseed-endgame-r239-cwide/, D in perseed-endgame-r239-d/, smoke
  in perseed-endgame-r239-smoke/), gate log, this note.
