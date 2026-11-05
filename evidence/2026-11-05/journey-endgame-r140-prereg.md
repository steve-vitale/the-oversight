# Journey endgame r140 — PRE-REGISTRATION (lane B, 2026-11-05 10:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing
— a failed or partial run does not advance the leg, per r135/r138
precedent.

Run number basis: latest completed Lane B endgame run is r135
(2026-11-04, reproduction exact on the r131 substrate). r136 (social
life) and r137 (succession) completed since. r138 (2026-11-05 06:00
CST) completed its dark-table probe (7 variants, all steps ok except
the by-design v1a curdle) and landed the sitter-coda fix 858d47dc2,
but NEVER ran its 4-seed pilot and wrote no run note. r139 (09:00)
aborted twice on cap 16/16; the 09:05–09:45 closeout freed slots
(active 9/16 at 09:48). This run r140 executes r138's unrun pilot
as its own, on current master.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at start (r139's lock was removed by the
  closeout). New lock written (run_id
  oversight-playtest-loop-2-2026-11-05T15:55:54Z).
- Main tree: `git status --short` 0 lines, `git pull --ff-only`
  already up to date, master 006e637b9 at pull time. Disk 29%
  (fail line 85%).
- Reaper: the pre-flight reaper queued behind a sibling reaper
  holding the registry lock (its python was running per-tree
  `git status` checks while holding the lock); my own reaper
  instance was killed while lock-waiting (it had done no work).
  Registration queued behind THREE builder registrations
  (build-tbobs-verb, build-smallfixes, build-stayrecover — all
  dispatched by the 09:54 gap order) plus the same lock holder:
  each `git worktree add` took ~10 min at load ~25. tbobs-verb
  registered ~16:07, smallfixes ~16:10, stayrecover ~16:24; this
  run's registration completed 16:26 UTC after 23 min in the
  queue. A SECOND sibling reaper grabbed the lock mid-queue and
  ran its own slow per-tree sweep. No registry state was touched
  by hand; no sibling process was killed.
- Master ADVANCED during the registration wait: the awayration2
  fix merged (6b78b2dbc + follow-up e5e6aa59b) after the 09:48
  flush had it blocked on check.js. Worktree HEAD is e5e6aa59b,
  not the 006e637b9 pulled at pre-flight. Substrate below is
  stated against e5e6aa59b.
- Standing heartbeat loop started after registration (beats every
  300s, detached setsid, loop pid 64453; first beat queued behind
  the same lock contention — verified by read-back before the
  pilot starts).

SUBSTRATE: r135 EXACTLY — capable + deedhunt + vetcommit + greedy
deferral (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive
+ fullseat-diag + vetguard on waves seeds. FULLSEAT=1, VETCOMMIT=1,
CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1, TELEMETRY_FULL=1,
RELAYGREY=1. 180d, death-aware (+10d tail max on a dead village,
never ticked to fill the leg). Probe:
scripts/probe-endgame-r140-20261105.js (r138 probe verbatim EXCEPT
renames r138->r140, evidence dir 2026-11-05/perseed-endgame-r140,
header). Analyzer: scripts/analyze-endgame-r140-20261105.js (r138
analyzer verbatim EXCEPT input dir, r138->r140). No policy change,
no new instrument at pilot time. Diagnostics, if any, write ONLY to
perseed-endgame-r140-diag-<name>/, never the pilot dir.

HEAD DELTA SINCE r135 BASE (12c72ddc2 -> e5e6aa59b, src only,
verified by git diff --stat in the worktree): 7 files, 205
insertions, 25 deletions — build.js (stamp only),
convo-wants.js (+59, favor-record repay), fieldFights.js (+45:
THE PARTING TURN + ambush instrument + the r104 patient_aim
round-start-HP fix), game.js (+75: r138's +43 + the awayration2
pack fix +25/−7), food.js (+8: spoil-line unit counts, pack and
pantry), table.js (+14: sitter-coda fix 858d47dc2), telemetry-
hooks.js (+27: skill-use instrument). NO gate, price, deed,
seat, or table change besides the sitter-coda voice fix; gating
freeze (Steve 2026-10-27 16:53) stands.
This pilot is a NEAR-REPRODUCTION check under that delta: expected
headlines identical to r135 EXCEPT the named deltas (a)–(g) below.
(a) hurt-return clause, (b) FRAG-FRAME pride, (c) goalLine-loss,
(d) THE PARTING TURN, (e) spoil unit counts (pack sweep line AND
pantry line now state the count, e.g. "12 unknown berries went
bad", "5 Foraged food"), (f) patient_aim round-start HP — field-
fight villagers with patient_aim now judge full health at round
start, so the aim can fire where r135 had 0 fires in 101 skill-
use rows; field-fight skill-use lines may appear, (g) away-
ration packs sized to the meal's want (6b78b2dbc) — villagers on
away trips carry right-sized packs instead of the old formula;
hunger outcomes on travel-heavy seeds may shift vs r135.
Any OTHER headline difference is a same-run investigation item,
never a road claim, and is attributed first to this delta before
any wider claim.

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the
probe default; this run passes ONLY the 4 pre-registered seeds):
89701 (waves), 89702 (waves), 89704 (forcedrift control), 89705
(wavesnw). Plan is keyed by seed value in the probe, so the subset
keeps correct plans. Seed reuse is DELIBERATE (matched before/after
per the r118/r135 precedent: same seeds, same probe policy, only the
game code changed) — no fresh band is needed or claimed for the pilot.

R135 PILOT BASELINE (per-seed, from the r135 run note; judged on
these 4 only):
- 89701 waves: announced d90, sat d92, WON LESSER (feared/light,
  final:mercy), 5 fights, uw4, standing 199, peakVet 1@d91, alive 9.
- 89702 waves: NO window, end survived, uw4, standing 199, 21
  fights, 3 kills, peakVet 2@d88 (end 0), alive 2.
- 89704 forcedrift: village-lost (no-successor d45), uw3, standing
  0, 0 fights, alive 0.
- 89705 wavesnw: village-lost (scattering d110, third hungry day),
  uw3, standing 99, 0 fights, alive 1.

R140 QUESTION: (1) does the pilot reproduce r135 modulo the named
deltas? (2) NEW — re-verify the r138 sitter-coda fix on current
master: re-run the FULL dark probe as r140 (all 7 variants, same
policy, fresh evidence dir perseed-endgame-r140-dark/ — a full
re-run is strictly more evidence than v3-only for the same cost)
and confirm the v3 walk-out line names Amelia Moon, not Bill
Palmer, and that D1–D4/D6 still hold on the new substrate.
(3) people check: does the sitting seed's finale read as people,
and do the r135-carried polish items recur? (4) DARK-PROBE READ
(r138 corpus, read in full this run — no new probe needed for the
read): the seven r138 dark transcripts were read end-to-end and
judged under D5; findings are carried below as this run's
dark-table work, with fixes attempted in the worktree where safe.

DARK-PROBE READ FINDINGS (r138 corpus, judged this run):
- D1–D4, D6: all hold (branch dark 7/0, twist fires with meters,
  trial is a real fight that resolves, finals record, withdrawal
  keeps the door shut, sitter guard withholds aloud). v1a's single
  failed step (D2-twist-fired, "curdled instead") is the
  by-design kill-then-name curdle, not a miss.
- D5-SENSE: the walks cohere — no fabricated shared history, no
  filler loop, no self-contradiction in the beats. Six sense
  warts found, three fixable in this run, three documented:
  (a) FIXABLE — Finale card "total" double-counts (sigW5.js
  fiFinale adds cumulative f.sigW5PDmg to m.fiDealt every round:
  v1a "struck for 5 (15 total)" = 1+2+3+4+5; v1c "439 (1103
  total)" = 114+222+328+439. The parenthetical should be total
  damage the finale has taken, all sources. Fix: HP-diff
  accumulation in fiFinale + proof test on a scripted trial.
  (b) FIXABLE — sky-fall line names the player "You takes 52"
  (finale-campaign.js:480, same pattern :507). Fix: "You take N"
  for the player + proof test.
  (c) FIXABLE — "(MOVE works.)" QA aside inside player-facing
  fiction (finale-campaign.js:472). Fix: drop the parenthetical.
  (d) DOCUMENTED, NOT FIXED — kill order: "The Finale falls."
  precedes "You STRIKE the finale for 121" on the killing blow
  (v1c R16). Mechanism: tbPlayerStrike composes its STRIKE line
  AFTER tbDamage returns so the number is the honest landed
  number (game.js:36870; comment at :37970), while tbDamage's
  death branch says "falls" (+ corpses.js maybeAttune Codex line
  via registerDeath) inside the call. Deferring the death
  narration is a combat-core change, not a playtest-loop fix;
  filed for a focused combat-narration change.
  (e) DOCUMENTED, NOT FIXED — Ruth's silent turns: "SYS:Ruth's
  turn" with no action in 5/5 (v1a/v1b) and 16/16 (v1c) rounds.
  Mechanism: villagerDecide returns 'wait' (helpful/cautious at
  range, or blocked from closing) and tbVillagerTurn has no
  narration branch for 'wait' (game.js:39546+; 'wait' returns in
  engine/combat.js villagerDecide for brave/cautious/helpful).
  This run diagnoses Ruth's per-round decide (ai, distance,
  action) in a diagnostic probe; a narration branch for 'wait'
  is attempted only if the diagnosis shows the fix is local and
  provable — otherwise documented with the diagnosis.
  (f) DOCUMENTED, NOT FIXED — V5 day-floor ordering: the final
  + coda + walk-out epilogue play BEFORE "THE TABLE WAITS"
  withholds the win, so a day-1 walk reads as a win first and a
  withholding second. Ordering fix needs the floor checked
  before the final resolves; filed, not attempted here.
  (g) JUDGED ACCEPTABLE — trial-start lines "The village is
  rattled. Everyone's jumpy — eyes on the treeline."
  (villageEvent monster_attack, game.js:18418) and "You don't
  know what that was. ... Someone at the haven should hear about
  this." (identifyMonster, game.js:22920): the Finale IS a
  genuinely unidentified champion arriving, so the encounter's
  standard opening beats firing is coherent; the treeline line
  is mild sanctity friction (the System just said the teeth can
  wait), noted, not fixed.
  (h) JUDGED ACCEPTABLE — the field-track coda ("You learned to
  read the ground...") after the feared-dark final is the
  composed ending by design (path final + track coda); tonal
  whiplash is inherent, not a bug.

INTERESTING FINDING (what would count): any pilot-vs-r135-pilot
headline difference other than the named deltas; any full-seat
win; any wave-5 unlock or face; any mFlee carrying monFled=true on a
non-flee kind (monster-commitment violation); any hurt-return misfire;
any ambush death missing from fallen; any dark re-verify (v3) step
failing; any transcript passage senseless, robotic, or
self-contradictory; a named Scout mechanism; a named "experiment"
cause (both carried from r135, still open).

BINDINGS (pilot-scaled from r135; metric binding §14 — a miss is
NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the headline,
per r135's metric review):
- M1-guard: >=3/4 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal).
- M2-census: every census fight carries a named outcome; engine
  opens == census fights.
- M2c/M2d: uncommitted classification complete (as r135).
- MFLEE-routed-coverage: 100% of mFlee fights carry gotAwayLines
  array + closeSnapResult field.
- KILL-ANATOMY-coverage: >=90% of multi-turn census fights carry
  anatomy.
- M5-voicing-canonical: sitting seeds carry canonical voicing or a
  named fallback; control-dead-before-window + zero relay finals
  in block = INFO/vacuous, not NO-GO (r124 rule, kept).
- M10-fullseat-gap: every sitting seed's full-seat gap is named
  (r130 revised rule: seat-kind pass — lesser despite full bars
  met is a named gap, not NO-GO).
- M11-standing-peak: standing peak reported for 4/4 seeds.
- FIRENARR/HURTRETURN-captured: every pilot JSON carries firenarr
  + hurtreturn arrays (instrument health; counts descriptive).
- FALLEN-ambush: every pilot JSON carries the fallen-ambush check.
- CORPUS-PURITY (gating, from r129/r130): pilot JSON summaries
  match pilot log summaries seed-for-seed (summary PROJECTIONS, not
  file-vs-log equality — r135 correction); zero diagnostic files
  in the pilot dir.
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count,
  full-seat count. M3-conversion, M4-wave5-or-full, W5-question
  NO-GO on a closed road are the expected road reading, not pilot
  failures (same reading as r121/r124/r128/r130/r131/r135).

BINDINGS (dark re-verify — a miss is NO-GO, never re-scored mid-run):
- S1-sitter-coda: the re-run v3 walk-out line names Amelia Moon
  (the sitter) with her pronouns, not Bill Palmer.
- S2-dark-holds: the full r140 dark re-run keeps D1–D4/D6 green on
  the new substrate (same steps, same expectations as r138; v1a's
  by-design curdle step stays the one expected non-ok).

BINDINGS (dark-read fixes — each fix carries its own proof test;
a fix whose proof test fails is NOT landed, and is recorded as
held-with-reason, not forced):
- F1-fiDealt: scripted trial shows the PREVIOUSLY ON total equal
  to total damage the finale has taken (player + allies), not the
  triangular sum; proof test red-on-baseline / green-on-fix.
- F2-you-takes: scripted sky-fall on the player says "You take N."
  (and names allies with "takes"); proof test red/green.
- F3-move-works: no "(MOVE works.)" string remains in player-facing
  say lines (grep proof in the test).

METRIC REVIEW: (filled after the pilot — if a metric proves wrong,
the revision is proposed here for the NEXT run, never applied
mid-run.) Carried: telemetry baseline re-seed is a panel decision,
not this run's; baseline NOT rolled on a quiet check. SIT-DAY-DEATHS
dedupe (r124 proposal) stays open until a sitting seed with a
sit-day death recurs. The "teeth fix" (r130) still stands on its
proof test, not pilot text — the war-path remainder branches did
not fire in r135 either.
