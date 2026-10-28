# sim-w4convert-postparty — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T1415Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4convert-postparty. Parent task:
re-census wave-4 encounter -> kill conversion on CURRENT master,
where the partyfinish cornered-party hold landed (1315Z, commit
37aa0a4fb), against the 0416Z census on the SAME band 75101-75108.
Worktree: `~/workspace/worktrees/sim-w4convert-postparty` (branch
sim-w4convert-postparty).
CENSUS / MEASUREMENT ONLY — zero src/js changes, zero default flips,
no game lever, no meeting-rate change, no lethality re-judgement.
This arm does NOT re-judge the lethality verdict, the w4damage
verdict, or the partyfinish verdict. The deliverable is knowledge:
the before/after on identical seeds — did partyfinish change
wave-4 conversion? Documentation IS the deliverable; no game
change lands from it.

## Question

The 0416Z run (evidence/2026-10-28/sim-w4convert-a.md +
sim-w4convert-a-prereg.md, corpus
evidence/2026-10-28/perseed-w4convert-a/) ran this identical census
BEFORE partyfinish landed and found wave-4 kills ~0 (universe 51,
faced 31, engaged 29, killed 0; channels field 16/16/0, raid
22/4/0, TB 18/18/0). Partyfinish then changed the field-flee path
for cornered parties. Did wave-4 conversion move?

## Base — stated explicitly (verified before this prereg was written)

- Base commit at worktree creation (this branch's tip):
  e17a518f1 ("sim-food-economy-round-1330-b: coordinator record").
- Partyfinish commit 37aa0a4fb IS an ancestor of e17a518f1
  (verified with `git merge-base --is-ancestor`).
- ZERO drift between partyfinish and this tip, verified with
  `git log 37aa0a4fb..HEAD`: no src/js changes, no src/data
  changes, no changes to scripts/sim-harness.js,
  scripts/policies/tableseat-nowait.js, or any recorder in the
  stack below (raftdraft/spawnsrc/oldcore/w5births/defwound/
  nonworldkill/tbdmg-rebase/w4damage/vetkill-diag). The only
  commits in the range are evidence, docs, telemetry-check.js,
  and new unrelated scripts. Game code on this tip IS partyfinish
  code, byte-for-byte in src/js and src/data.
- The 0416Z base bcf137c40 IS an ancestor of 37aa0a4fb. The
  0416Z -> postparty delta therefore contains intervening src
  changes (tackle-map, calmbeast, eggomen P2 finale-omen gate,
  barwhy, caughtlift, divedeep, and others in bcf137c40..37aa0a4fb)
  AND the partyfinish mechanism. The attribution split below
  keeps those apart; a kills delta is NOT automatically a
  partyfinish effect.

## Attribution split — stated BEFORE seeing numbers (binding)

Partyfinish's mechanism fires ONLY on a sortie field fight:
src/js/havenGrowth.js lingererSortie() sets opts.cornered = true,
and no other caller sets it (src/js/fieldFights.js corneredHold
gate). Under this census's substrate, sorties cannot fire:

- scripts/policies/tableseat-nowait.js contains no
  linger/sortie/answerLingerer call (grep-verified).
- In node, the only other answerLingerer caller is app.js (DOM,
  excluded from node harnesses); the engine default for
  unanswered lingerers is 'endure' (havenGrowth.js design-call
  comment).
- The 0416Z corpus itself carries zero 'sortie' caller rows
  (callers: resolve 1132, other 198, aid 20; wave-4 callers:
  resolve 33, aid 6, other 2). The w4damage fieldFight row
  schema carries no corneredHold field, so dormancy is proven
  structurally (no sortie caller rows in the new corpus either)
  plus partyfinish's own mechanism-dormant check (0 cornered
  fights on its baseline), not by a row field that does not
  exist.

Consequence, pre-registered: under this substrate the
partyfinish mechanism is DORMANT by construction. If the new
census shows kills UNCHANGED (0), the verdict is UNCHANGED and
the mechanism's dormancy is the consistent explanation — not a
failure of partyfinish (its counted finishes were sortie fights
under its own driver policy, a different substrate). If the new
census shows kills CHANGED, the change is NOT credited to
partyfinish without a sortie-caller row proving the mechanism
fired; the default attribution is base drift between bcf137c40
and 37aa0a4fb. Either way the CHANGED/UNCHANGED verdict below
is judged on the counts, and the attribution is judged on the
caller evidence — never conflated.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 = the Mirror
  Draft, gate village standing >= 100; bands anchored: damage
  35-95, HP 850-1500, pierce 0.2-0.5; "a 4-6 round fight for a
  godhood build (~220 dmg/round)"; combat-readiness gates the
  standing unlock: wave 4 needs 3 armored (P >= 10), 5 armed,
  3 tricks, 1 veteran with a wave-3+ kill; villager kills score
  the ledger exactly like the player's; engagements feed the
  endgame deed bars only, never wave unlocks).
- docs/MEASUREMENT.md sections 9-12 and 14-15 (pilot gate,
  death-aware horizons, pre-registration, convergence, metric
  binding, balanced panels).
- No canon invented. Where code and canon wording differ, the
  code reading governs the census and the difference is reported.

## Prior evidence read first (this arm's definitions come from these)

- evidence/2026-10-28/sim-w4convert-a.md +
  sim-w4convert-a-prereg.md (the 0416Z census; definitions,
  substrate, and comparison target — see "Census definitions").
- evidence/2026-10-28/sim-partyfinish-a.md +
  sim-partyfinish-a-prereg.md (the mechanism, its sortie-only
  driver, its control/armed bands; the cross-check target is
  the CONTROL band only — see "Cross-check gate").
- evidence/2026-10-28/sim-w4damage-a.md (substrate origin).

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, CENSUS: scripts/policies/tableseat-nowait.js
  VERBATIM (never edited), env LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1 (TABLEDEFIANT unset), PLUS recorder
  on-switches RAFTDRAFT=1, SPAWNSRC=1, OLDCORE=1, W5BIRTHS=1,
  DEFWOUND=1, NONWORLDKILL=1, TBDMG=1, W4DMG=1.
- NEVER edited: tableseat-nowait.js, any existing recorder file,
  or any src/js file. New files only (one sweep copy, one
  analyzer copy, one sense copy, see below).
- Recorders reused verbatim, policy-side only: raftdraft-diag,
  spawnsrc-diag, oldcore-diag, w5births-diag, defwound-diag,
  nonworldkill-diag, tbdmg-rebase-diag, w4damage-diag. No
  recorder draws RNG, throws into the engine, or returns
  anything but the original value.
- The sweep copy carries the same sweep-side read-only scholar
  history addition as the 0416Z sweep (a property read, once
  per day, cannot move RNG; the detgate below proves neutrality
  on this base). The original w4convert sweep is untouched.

## New files (this arm only, policy-side, zero src/js)

- scripts/test-w4convert-postparty-sweep.js (copy of
  test-w4convert-sweep.js, differing ONLY in corpus dir
  (evidence/2026-10-28/perseed-w4convert-postparty/), labels,
  and loadGame mode label).
- scripts/test-w4convert-postparty.js (copy of
  test-w4convert.js, same census definitions EXACTLY — the
  censusSeed function is copied verbatim — differing ONLY in:
  corpus dir (perseed-w4convert-postparty), the comparison
  target (the 0416Z corpus perseed-w4convert-a, re-censused
  with the same definitions as a self-check that must
  reproduce universe 51 / faced 31 / engaged 29 / killed 0),
  and the comparison legs below; the old w4damage-parity leg
  is reported as DIAGNOSTIC ONLY, never gating, because the
  base moved and a game-code change (partyfinish) sits between
  the w4damage corpus and this band — requiring w4damage parity
  here would be requiring the game not to have changed).
- scripts/test-w4convert-postparty-sense.js (copy of
  test-w4convert-sense.js, labels + sense-seed/window from
  THIS band's corpus per the sense rule below; non-measured
  replay only, replay text never enters any count).

## Census definitions (BINDING — identical to 0416Z)

The 0416Z prereg's definitions are incorporated by reference
and implemented by the verbatim censusSeed copy: universe =
every spawnsrc fresh spawn with wave == 4 keyed by seq
(scripted-titan herald flagged, never dropped; re-entries
re-attach, never new members); faced = seq in >= 1 of
defwound resolve / w4damage fieldFight / w4damage raidTick
change / nonworldkill world-origin start / oldcore tbEnd;
engaged = faced AND >= 1 fight row with rounds >= 1;
killed = field/raid vKill row, oldcore removal kind
containing 'kill', or TB kill (nonworldkill-joined tbEnd
result 'won' AND monster fighter hp <= 0 / alive false /
fled false; 'routed' is NOT a kill); killer identity per
0416Z (field/raid vid classified scholar vs villager by
scholar history, vid always printed; TB kill = 'scholar-led
TB party' with fighter keys, never a named individual;
unattributed kills count toward unclassified); never-met
broken by end-state (still-present / removed-kind / vanished,
vanished must be 0 or each seq named); met-but-no-kill
broken by channel set, last outcome, raid-drafted-only flag,
end-state; per-channel faced/engaged/killed with multi-touch
stated (channel rows sum ABOVE the band total); non-world
wave-4 TB/field fights reconciled separately, never inflating
the world census; deed-faced wave-4 type set per seed;
spawn-source distribution per seed.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: census completeness + before/after comparison on
identical seeds.

GO RULE (DIAG-GO, judged ONLY against this prereg):
  DIAG-GO = 8/8 seeds complete (row per seed, days > 0, every
  recorder clean: errs 0, no overflow) AND every wave-4 spawn
  classified faced/unfaced by channel (unclassified == 0,
  vanished == 0 or each seq named) AND the comparison table vs
  the 0416Z corpus published with a verdict CHANGED vs
  UNCHANGED on wave-4 kills (field kills and TB wins reported
  separately — see comparison legs).
  This is measurement, not a lever: NO kill-count threshold
  gates GO. A complete census showing 0 kills is a GO census
  with a 0-conversion finding. Incompleteness or unclassified
  instances fail it (DIAG-NO-GO, gap named).
  No confirm band unless a census gap needs a re-proved
  instrument — then the confirm band is pre-registered BEFORE
  running it, never run first and justified after.

COMPARISON LEGS (band + per-seed, new vs 0416Z, identical
seeds/substrate except the base move stated above):
  wave-4 kills (band + field / raid / TB split), field kills,
  TB wins (tbResults 'won' count AND TB kills, kept apart),
  deaths (deathTotal), starvation deaths, wins, national ever,
  national final, table, entered, wave-4 reach, median days,
  universe / faced / engaged / never-met / met-no-kill.
  Verdict CHANGED iff new band wave-4 kills != 0416Z band
  wave-4 kills (0); else UNCHANGED. Field kills and TB wins
  are reported separately and never folded into the kills
  verdict.

CROSS-CHECK GATE (binding investigation gate, BEFORE judging):
  Per-seed wall numbers (days, won, waveReach, nationalEver/
  Final, table, entered, deathTotal, starvationDeaths,
  courtship combined) are compared against the partyfinish
  CONTROL band (evidence/2026-10-28/perseed-partyfinish-a/
  control/), NOT the armed band (different policy driver).
  EXPECTED: identical per seed, because src/js, src/data,
  harness, policy, and recorders are all unchanged between
  37aa0a4fb and this tip (see "Base" above), and the only
  instrument deltas are PARTYDIAG present-there/absent-here
  and scholarHistory present-here/absent-there, both claimed
  neutral. If ANY per-seed wall number diverges from control,
  the run STOPS for investigation before judging: the
  divergence is reported loudly, a cause is found (recorder
  non-neutrality, unnoticed drift, or a real engine difference)
  or the census is judged INVALID, never judged past a
  divergence. Agreement with control does NOT by itself prove
  the 0416Z comparison — the 0416Z delta is base drift plus a
  dormant mechanism, per the attribution split.

DETGATE (pre-sweep STOP gate): seed 75101, baseline (plain
tableseat-nowait, no recorders) vs wrapped (ALL recorders
composed, every on-switch UNSET): days, gameDays, and
tsNationalDay must be equal, with no diag ctx surface and no
wraps installed — same-base neutrality, as in 0416Z. The old
numbers were 132/132 days, tsNationalDay 77. If base drift
moved those numbers on the CURRENT base, DO NOT force the old
numbers: same-base equality on this base's own numbers is a
PASS, disclosed with old vs new numbers. Detgate FAIL
(baseline != recorders-OFF on this base) is a STOP: no judged
sweep is run on a diverged instrument.

SUBSTRATE-ACTIVATION GATE (binding, same as 0416Z): band
courtship combined > 0 AND >= 6/8 seeds with non-zero combined
courtship. If the gate FAILS, the sweep is INVALID (not
NO-GO): no verdict is judged, the failure is reported loudly,
and the run stops for an env fix. Expected from the 0416Z
band: combined 121, 8/8 active. (Partyfinish control combined
was 110, 8/8 active — either order of magnitude passes the
gate; the gate is > 0 and >= 6/8, not an exact match.)

SENSE RULE (binding): sense seed = the seed with the most
faced wave-4 instances on THIS band's corpus (tie -> lowest
seed) — a deterministic rule, not a narrative pick. Window =
that seed's first wave-4 faced day minus 10 to last wave-4
faced day plus 10, from THIS band's corpus, capped at the
seed's actual end day. The sense note reads ONE
faced-but-not-killed wave-4 encounter from that window
(field or TB, whichever the window's first faced-not-killed
instance is) in plain words: what the village actually did,
round by round as the beats tell it. PLUS a villager-behavior
sample: do villagers act like people in the fights censused
(goals, reactions, retreat/press choices that read as
decisions), or robotic? Flag anything robotic. Non-measured
narration replay (say/sysSay taps); replay text never enters
any count, and the replay trajectory shift is stated, not
hidden.

PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed band IS the
pilot for a census. If its completeness gates pass, it is
the judged band. Horizon: 180d death-aware (same as the 0416Z
band; reachability lever, §10: 150-200d; dead villages stop
simulating, +10d tail max). Seeds: 75101-75108, identical.
Policies: tableseat-nowait + recorder stack above, no other
policy.

## Balanced panel (§15) and telemetry

BALANCED PANEL: attempt scripts/balance-panel.js compare and
record the outcome. The known scorecard TypeError failure mode
is documented in prior arms — if it fails the same way, say
so and use the paired sweep-compare tables (this band vs the
0416Z corpus, identical seeds/policy/substrate) as the
section-15 substitute. No panel artifact will be faked. Note:
this arm changes nothing in the game, so the panel is expected
to show zero movement against a same-base panel; a non-zero
panel delta against the 0416Z-era panel would be base drift,
reported as such, never as a lever effect.

TELEMETRY DEVIATION CHECK (loop body step 10): run AFTER
writing evidence (telemetry-check.js vs scale-wall baseline,
metrics national,table,wins,exiled, current glob
evidence/2026-10-28/perseed-w4convert-postparty/*.json),
report LOUD lines with verdict, do NOT roll the baseline on
an unexplained LOUD line (the baseline's WINSEAT regime
forbids comparing it to a tableseat-nowait census substrate,
and per-seed rows carry nationalEver/entered/won, not
top-level national/table/wins paths — say which artifact
class applies, or investigate if a line fits neither).

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
