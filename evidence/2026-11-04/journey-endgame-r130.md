# Journey endgame r130 — run note (lane B, 2026-11-04 13:00 CST)

Leg 4 (endgame). Rotation-b read 4 at run start. This run is r130:
r128 was a timeout closeout (partial, rotation NOT advanced) and r129
failed pre-flight (git status stall, no play). r130 executes r129's
deferred prereg in substance — same seeds, same substrate, same
diagnostics — with the substrate-delta section updated for the
ability-use landing (see below). Prereg:
goal hidden_files/journey-endgame-r130-prereg.md (written before any
play). Slug: journey2-endgame-r130. Lock created 2026-11-04T18:55:53Z
by this run; deleted at closeout (see end).

## Run-start pre-flight (all PASS)

- Overlap guard: no playtest-loop-2.lock at run start. Lock created
  by this run.
- Main tree: `git status --short` 0 lines (returned promptly — unlike
  r129's stall). `git pull --ff-only`: already up to date, master
  a32735f13 at run start.
- Disk: 28% (fail line 85%).
- Reaper: nothing removed, active 10/16 — 6 slots free. No journey2-*
  trees remained (r128's released done-merged; r120's salvaged +
  removed by main-session closeout 05:11 CST).
- Worktree journey2-endgame-r130 registered (slow checkout under
  sibling I/O, ~12 min, same pattern as r128); heartbeat verified via
  REGISTRY.json read-back (beat 19:23:04Z from the loop, not the loop
  log). Standing heartbeat loop pid 19602, log to goal hidden_files.
- NOTE: master moved mid-run (7bf600b9 seen when the control tree
  registered) — the landing rebase below handles it.

## Substrate + HEAD delta (read before judging any flip)

Probe: scripts/probe-endgame-r130-20261104.js (r128 probe verbatim +
OUTDIR fix only). Analyzer: scripts/analyze-endgame-r130-20261104.js
(r128 analyzer verbatim + M10 revision). Substrate r128-exact:
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1, TELEMETRY_FULL=1, RELAYGREY=1, 180d, death-aware
(+10d tail max). Seeds 89701 (waves), 89702 (waves), 89704
(forcedrift control), 89705 (wavesnw). Pilot first.

HEAD DELTA SINCE r128 PILOT BASE (71041af7d -> a32735f13, src only):
- ability-use gamecode, 2 commits, both [needs-eyes] (8d9186096 +
  3417f9eb0): game.js +340, app.js +37 — NPC skill twins (villagers
  use skill actions in turn-based fights via tbVillagerAbility /
  tbVillagerTurn: war_cry, tripwire, intimidating_presence,
  peacemaker, come_get_some, hogtie, ambush, haymaker, dead_aim,
  patient_aim, trade_of_blows, brawler_instinct), bar surfacing,
  passive proof, choices. app.js is DOM-only and excluded from node
  sims, so the node pilot sees game.js +340 only. GAMEPLAY-AFFECTING:
  r129's "determinism check" framing is VOID for this run — this is a
  matched pilot under a new gameplay landing.
- Version bump 3a32d492f (build.js version string only) — not gameplay.
- Everything else in range: evidence/tooling only. No src/data change.
- Gating freeze (Steve 2026-10-27 16:53) stands: no seat/gate/price
  change in this run.

## Pilot results (r130 vs r128 pilot vs control)

Analyzer exit 1 on the pilot corpus — the three NO-GOs are the
preregistered road tallies (M3-conversion, M4-wave5-or-full,
W5-question), NOT pilot failures. All gated bindings GO, including
M1-guard 3/4, M2-census, M2c, M2d, MFLEE-routed 6/6,
KILL-ANATOMY 26/26, M5-voicing (vacuous per r124 review),
M10-fullseat-gap 1/1 (89701 gap w5:0/2), M11-standing-peak 3/3,
FIRENARR/HURTRETURN captured 4/4, FALLEN-ambush 4/4
(89701: 1 ambush death in fallen; 89704: 1 — the r125 fix holds).

| seed | r128 pilot (log summaries) | r130 pilot | control (old code) |
|---|---|---|---|
| 89701 waves | ann d140, sat d141, WON lesser feared/light mercy, 16 fights, uw4, standing 199, peakVet 1, alive 3 | ann d90, sat d92, WON lesser feared/light mercy, 5 fights, uw4, standing 199, peakVet 1, alive 9 | = r128 pilot exactly |
| 89702 waves | village-lost, uw4, standing 125, 17 fights, 0 kills, alive 2 | NO window, end survived, uw4, standing 199, 21 fights, 3 kills, peakVet 2@d88 (end 0), alive 2 | = r128 pilot exactly |
| 89704 forcedrift | village-lost, uw3, standing 0, 0 fights | village-lost (no-successor d45), uw3, standing 0, 0 fights | = r128 pilot exactly |
| 89705 wavesnw | ann d90, sat d90, WON lesser feared/light mercy, 11 fights, uw5, standing 582, w5 timeslot d86 + editor d87, alive 5 | village-lost (scattering d110), uw3, standing 99, 0 fights, alive 1 | = r128 pilot exactly |

Road tally, pilot: lesser wins 1/4 (r128: 2/4), uw5 0/4 (r128: 1/4),
full-seat 0/4 (same), village-lost 2/4 (89704, 89705), survived 1/4
(89702). n=4 — tallies move, no significance claim.

## Determinism proof (the run's load-bearing control)

A second registered worktree (journey2-endgame-r130ctl, detached at
71041af7d, the r128 pilot base) ran the SAME r130 probe on the SAME
4 seeds. Result: byte-level headline reproduction of the r128 pilot
on all four seeds — announce/sat/seat/path/branch/won/final/end/
alive/uw/fight count AND full fight-outcome sequences identical
(89701 16 fights, 89702 17, 89704 0, 89705 11, sequences match).
Conclusion: probe + sim are deterministic on fixed code, and the
r130 pilot's flips are CAUSED by the code change (the ability-use
landing), not by nondeterminism or instrument drift. The control
corpus lives at perseed-endgame-r130ctl (NOT the pilot dir).

## Attribution: twins actually fire (mechanism, not just delta)

Speaker-prefixed villager twin lines in transcripts ("Meera:
TAKE AIM: the shot lands exactly where pictured", "Ethan: TAKE AIM:
... (279)"): r130 pilot 89701: 1, 89702: 2, 89704: 0, 89705: 0;
control: 0 on all four seeds. (Bare "HAYMAKER/DEAD AIM" lines in both
corpora are the PLAYER's own actions, not twins — checked in context.)
So the landing's mechanism is observed in the pilot: villagers who
could not use skill actions before now do (rarely — villagers rarely
hold combat abilities, as established — but a x2.5 aimed shot flips
fights). Each seed's specific downstream road is still chaotic
divergence after the first changed fight — the landing changes fight
outcomes, which re-rolls everything downstream. Do NOT cite a single
seed's flip as "twins did X"; cite the panel fact: twins fire, roads
move, control reproduces.

## Diagnostics (separate dirs only; pilot corpus verified pure)

OUTDIR fix PROVEN: probe reads EVID from process.env.EVIDDIR;
diagnostics wrote only to perseed-endgame-r130-diag-nohurt89705/ and
perseed-endgame-r130-diag-nohurt89702/. Post-diagnostic purity check
(test-pilot-corpus-purity-r130.js verify): 8 pilot files identical
to the post-pilot snapshot — exit 0. The r128 contamination class is
closed for this run's corpus.

D1 nohurt-89705 (hurthome rule off, same code/seed): still
village-lost (scattering d41 vs pilot d110, alive 7 vs 1, uw3,
standing 25 vs 99, 0 fights). NO ROAD FLIP: the hurthome rule does
not cause 89705's collapse at outcome level. (Alive/standing differ
— the toggle still moves fates downstream — but the road stays lost
in both branches, so the collapse is robust to the toggle.)

D2 nohurt-89702 (hurthome rule off, same code/seed): announced d172,
sat d172, WON FULL seat, indispensable/light, final:teach, uw5,
standing 482, peakVet 3, 30 fights, 5 vKills, alive 3. Versus pilot
89702 (no window, survived, uw4, standing 199). Versus r128
nohurt-89702 (won lesser beloved/light d107). THIS IS THE FIRST
FULL-SEAT WIN IN THIS SERIES — but it is a DIAGNOSTIC (rule off),
not a pilot win, and must never be cited as "the full seat is won".
Its transcript finale reads coherent (audit: "A full seat. global
standing, every wave faced"; war path names Nora's d172 Ugly-Bane
and d138 Big Beast kills; indispensable beats play; architect:
Wanjiru Kamau ascended via relay).

Hurthome mechanism (r128 open item 2 — now named, honestly bounded):
- The toggle is clean: pilot and nohurt 89702 trajectories agree
  EXACTLY through d56 (same 8 fallen, same days/causes) — the first
  divergence is the d67 hurt return itself (shouldHurtReturn reads no
  RNG, writes no state, per its own comment).
- Fork: pilot Daniyar returns hurt d67 (hp7) and dies d72 monster;
  nohurt Daniyar stays away and dies d69 monster. The rule moved
  Daniyar's death 3 days and did NOT save him — the win does not
  come from Daniyar surviving.
- Downstream is chaotic divergence, not a chain: pilot killers Ines
  (d64/d65) + Wanjiru (d88), pair broken when Ines dies d100;
  nohurt killers app_mgpspi3i712 (d71), Wanjiru (d127), Nora (d138 +
  d172), peak 3@d138, full seat. No single link connects "Daniyar
  came home early" to "Nora banks two wave-4 kills" — the fork
  re-rolls the run. Honest claim: hurthome is implicated at the
  fork on 89702 (identical-to-d56 proves the toggle caused the
  divergence), and its local effect (hurt traveler home early)
  versus the win is mediated by chaotic re-rolls. A sensitivity
  finding on n=1, NOT a lever verdict — do not tune hurthome on this.

89705 collapse (pilot): scattering d110, "third hungry day",
pantry 0 at end, 22 fallen, 0 fights, 0 kills, 0 feasts (23 feast
plans refused "Nobody is here to feast with" — population collapse
removes feasting itself). Deaths span monster, experiment (4 by
d58), starvation, wounds, contest, sickness — a village that never
got going (first deaths d13/d14), not a table failure. Nohurt
scatters d41 with 11 fallen: same outcome class, different path.

## People check (sense-testing, transcripts read)

- 89701 (598 SAY lines, announce->end, read in full): coherent
  finale. Audit reads the real run (15/12/8 + 4 wave-4, 8 contests,
  5 crises); full-seat gap named (0/2 wave-5); feared/light voiced
  with "protected outnumber the killed; food truth shared; promises
  kept" — consistent with light (no repeat of r128's broken-promises
  tension; the weighted-sum reading from r129 stands). Ascensions
  name real villagers (Jorge Silva via relay; Marcus Webb + Jorge
  Silva pantheon politics). Mercy final + pod coda close without
  contradicting the win. Fights read as fights (Turncoat turning
  two Reunions on each other, feast-surged strikes, a veteran kill
  called on camera).
- nohurt-89702 finale (367 lines, read table section in full):
  coherent full-seat win (see Diagnostics). Same pod coda.
- Sense notes (polish, not leg blockers):
  1. FIXED THIS RUN: "tooths" grammar — war-path remainder now
     "teeth" (see Blanks). Second instance confirmed before the fix
     ("and 2 more tooths after" on the nohurt-89702 finale).
  2. Turncoat's line repeats verbatim 5 times in one 89701 fight
     ("You explain to them, very reasonably, why the OTHER one is
     the real problem.") — ability text with no variation; robotic
     on repeat, same class as the keepsake repetition below.
  3. Keepsake lines repeat verbatim on every hold ("Your gifts are
     not mastered — but they are lived-in... The feast was the
     weapon.") — carried from r129, still present.
  4. "N more of the later drafts faced besides" (89701: "1 more";
     nohurt-89702: "4 more") — vague filler beside an otherwise
     specific audit; the drafts are counted, never named.
     Documented, not redesigned (naming them is a beat change, not
     a text fix — a next-build call).
  5. Scout ping-pong in the nohurt-89702 window: "Nora nods...
     'Scout is yours now'" (to Wanjiru) followed immediately by
     "Wanjiru nods... 'Scout is yours now'" (back to Nora), with no
     stated reason — role churn that reads robotic. Mechanism
     unknown from the transcript alone; documented, not fixed.

## Village assessment (plain words)

- 89701's village won the lesser seat the hard way and came home
  with 9 alive: a feast-surged party put down a Reunion, banked one
  veteran (Jesse, d91), and sat at day 92 — fifty days earlier than
  the same seed's r128 road, because the twins-era fights broke
  differently. Only 5 villagers died along the way (monster, ambush,
  contest, sickness among them); the pantry ended full (9,746 kcal).
  The table priced it global but still 0 of 2 wave-5 kinds — the
  full seat stayed out on the wave-5 bar alone.
- 89702's village survived but never reached the table: 21 fights,
  3 kills, standing 199, two veterans banked at day 88 — then Ines
  died in the wild at day 100 and the pair broke. Two people were
  alive at the end, the pantry empty, the table never announced.
  In the nohurt variant the same seed won the full seat — the
  hurthome fork, not the village's courage, is the difference.
- 89704's village died quietly: no fights, no table, 12 dead by
  day 46 (ambush, strangers, wounds, sickness, starvation), and no
  one left to pick up the Codex. A control that proves the drift
  road dies without a table.
- 89705's village scattered: it never feasted, never fought a
  wave-4 battle, and walked away in different directions on the
  third hungry day. The same seed won the lesser seat in r128 — the
  twins-era re-roll took its road away entirely. That swing, on one
  seed, is the landing's footprint, not a verdict on the village.

## Metric review

- M10 revision ADOPTED (r129 proposal, this run is the next run) and
  VERIFIED: the r130 analyzer's seat-kind pass was exercised on the
  control corpus — control 89705 passes with gap="seat-kind: lesser
  despite full bars met" (old rule would NO-GO it). Pilot M10 itself
  is 1/1 on the standard gap (89701 w5:0/2). The revision is now the
  standing rule; no further M10 change proposed.
- M3-conversion NO-GO (armB kills 0 vs armA 4) and M4/W5 NO-GO are
  the expected road readings on a closed wave-5 road (same reading
  as r121/r124/r128), not pilot failures. M3b-peak NO-GO on the
  control corpus (0/3 peak>=2) is likewise the road reading.
- CORPUS-PURITY (gating, from r129): PASSED — pilot JSON summaries
  match pilot log summaries seed-for-seed; zero diagnostic files in
  the pilot dir; purity verify exit 0 after diagnostics.
- HEADLINE-REPRODUCTION: NOT reproduced per-seed vs r128 pilot —
  EXPECTED, because the landing changed the code. The control
  reproduces r128 exactly, which converts "not reproduced" from a
  mystery into an attributed landing effect. No unattributed flip
  remains: every pilot difference traces to the landing delta (the
  only src change in range).
- Telemetry deviation check vs endgame.json (metrics
  veterans.unlockedWave, won, peakLivingVeterans; pilot sums uw 14,
  won 1, peakVet 3 vs baseline uw 15, won 3, peakVet 3): QUIET — no
  large deviations per the tool's thresholds. Baseline NOT rolled:
  the regime changed with the landing, and quiet is not a reason to
  re-seed; the r121 sums stay as the pre-landing reference.
- Proposed for the NEXT run (not applied): nothing new. The open
  telemetry question is whether the baseline should be re-seeded
  from a post-landing panel once the landing's panel (not n=4)
  exists — a panel decision, not this run's.

## Blanks filled / documented

- FILLED (code, proof-tested): war-path "tooths" -> "teeth"
  (src/js/table.js, 2 lines: the plural remainder branches; the
  singular "1 more tooth" branch was already correct and is guarded
  by the test). Proof test
  scripts/test-tabledeedlines-teeth-r130.js: RED before the fix
  (case A fails, reproducing "2 more tooths after" verbatim),
  GREEN after (6/6). Adjacent suites green:
  test-tabledeed-20261021 (ALL GATES GREEN),
  test-tabledeed-dupename-20261022 (12 passed).
- FILLED (tooling, proof-tested): probe OUTDIR / corpus purity
  (EVIDDIR env override + filename prefix follows run tag).
  Proof test scripts/test-pilot-corpus-purity-r130.js: snapshot +
  verify + static override check, all green; pilot corpus verified
  pure AFTER both diagnostics ran. The r128 contamination class is
  closed for corpora produced with this probe.
- FILLED (method): determinism control — old-code pilot reproduces
  the r128 pilot exactly, so landing attribution is now provable
  in-run rather than asserted. Control worktree released after use
  (branch never committed; outputs live in this run's evidence).
- DOCUMENTED, NOT FIXED (carried): Turncoat verbatim repetition;
  keepsake verbatim repetition; "later drafts" vague remainder;
  Scout ping-pong role churn; 89705's experiment deaths (4 by d58
  — cause "experiment" needs a codex/cause read before any claim);
  hurthome lever verdict (sensitivity finding only, n=1).
- JUDGEMENTS (leg 4, from r130 pilot + control + diagnostics):
  REACHABLE — the lesser seat is reached on 1/4 pilot seeds (2/4 on
  the control); the road moved under the landing but the lesser
  door is still open. FUN — the sitting transcripts read as a real
  finale, not a menu (89701 + the diagnostic full-seat finale both
  cohere). WINNABLE — lesser wins happen; the full seat stays unwon
  in the PILOT (wave-5 bar 0/2 on the sitting seed; second-veteran
  bar peak 1 on 89701, broken pair on 89702). The diagnostic full
  win proves the full-seat path PLAYS end to end — it does not prove
  it is reachable under the live rules.

## Infra notes (loud, for the next run)

- Heartbeat loop latency: the r130 loop's beats land (registry
  read-back is the proof; loop log alone is not).
- Control worktree: registered, detached to 71041af7d for the pilot,
  reattached to its branch, released + removed after the pilot;
  branch deleted (0 commits — it was a vehicle, not a landing).
- Safe-commit index-clobber check: performed after every commit in
  this run (see landing section); repair from HEAD blobs if hit.
- check.js --quick: launched in background during note-writing;
  result recorded in the landing section (merge waits for it).
- R120 held work: already resolved by main-session closeout 05:11
  CST (salvaged, not merged) — no longer an r130 concern.

## Landing / rotation / lock / next run

- [filled at closeout: commit hash, rebase base, merge result,
  check-quick result, rotation write, lock deletion]
- Next Lane B run: leg 5 (social life) IF this run lands; otherwise
  leg 4 replays. Carried open items: hurthome lever verdict needs a
  panel, not a seed; the "later drafts" remainder naming; Turncoat /
  keepsake repetition; 89705 "experiment" death-cause read.
